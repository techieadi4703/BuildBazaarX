/**
 * layoutEngine.ts — Zone-based floor plan layout engine.
 *
 * Takes a FloorPlanSpec (rooms with inch dimensions) and produces a
 * HouseLayout (every room placed at absolute pixel coords on one canvas).
 *
 * Algorithm:
 *  1. Classify rooms into zones: public, private, wet, service
 *  2. Compute a target footprint size from total carpet area
 *  3. Arrange public zone across the "front" row
 *  4. Arrange private zone (bedrooms) across a "back" row
 *  5. Wet zone (bathrooms/toilets) tucked adjacent to bedrooms
 *  6. Service zones (balcony, puja, study) fill remaining gaps
 *  7. Mark outer vs shared walls for each room
 *
 * No AI/LLM involved — pure deterministic geometry.
 */

import type { FloorPlanSpec, RoomSpec } from "./schema";
import type { HouseLayout, RoomLayout, Zone } from "./layoutTypes";

// ─── Zone classification ──────────────────────────────────────────────────────

function classifyZone(type: RoomSpec["type"]): Zone {
  switch (type) {
    case "living":
    case "dining":
    case "kitchen":
      return "public";
    case "master_bedroom":
    case "bedroom":
      return "private";
    case "bathroom":
    case "toilet":
      return "wet";
    case "balcony":
    case "puja":
    case "study":
    case "office":
      return "service";
    default:
      return "service";
  }
}

// ─── Preferred room order within a zone ──────────────────────────────────────

const ZONE_ORDER: Record<Zone, number> = {
  public: 0,
  private: 1,
  wet: 2,
  service: 3,
};

const TYPE_ORDER: Record<string, number> = {
  living: 0,
  dining: 1,
  kitchen: 2,
  master_bedroom: 0,
  bedroom: 1,
  bathroom: 0,
  toilet: 1,
  study: 0,
  office: 1,
  puja: 2,
  balcony: 3,
};

// ─── Layout helpers ───────────────────────────────────────────────────────────

/** Scale used throughout the layout (pixels per inch) */
const LAYOUT_SCALE = 2.2;

/** Minimum wall thickness rendered between rooms (px) */
const WALL_PX = Math.round(5 * LAYOUT_SCALE); // ~11px

interface RoomWithZone {
  spec: RoomSpec;
  zone: Zone;
  w: number; // px
  h: number; // px
}

function toPixels(rooms: RoomSpec[]): RoomWithZone[] {
  return rooms.map((r) => ({
    spec: r,
    zone: classifyZone(r.type),
    w: Math.round(r.widthIn * LAYOUT_SCALE),
    h: Math.round(r.depthIn * LAYOUT_SCALE),
  }));
}

// ─── Row packer ──────────────────────────────────────────────────────────────

interface Row {
  items: RoomWithZone[];
  /** tallest room height in this row */
  rowH: number;
  /** total width of items + walls */
  rowW: number;
}

/**
 * Pack rooms into rows so total width stays within maxW.
 * Rooms that are too wide get their own row.
 */
function packIntoRows(items: RoomWithZone[], maxW: number): Row[] {
  const rows: Row[] = [];
  let currentRow: RoomWithZone[] = [];
  let currentW = 0;
  let currentH = 0;

  for (const item of items) {
    const needed = currentW === 0 ? item.w : item.w + WALL_PX;
    if (currentW + needed <= maxW || currentRow.length === 0) {
      currentRow.push(item);
      currentW += needed;
      currentH = Math.max(currentH, item.h);
    } else {
      rows.push({ items: currentRow, rowH: currentH, rowW: currentW });
      currentRow = [item];
      currentW = item.w;
      currentH = item.h;
    }
  }
  if (currentRow.length > 0) {
    rows.push({ items: currentRow, rowH: currentH, rowW: currentW });
  }
  return rows;
}

// ─── Outer-wall detection ─────────────────────────────────────────────────────

/**
 * Given all placed rooms, determine which sides of each room are exterior.
 * A side is exterior if no other room occupies the adjacent area.
 */
function markOuterWalls(
  layouts: RoomLayout[],
  totalW: number,
  totalH: number,
): RoomLayout[] {
  return layouts.map((room) => {
    const outerWalls = {
      north: room.y <= WALL_PX,
      south: room.y + room.h >= totalH - WALL_PX,
      west: room.x <= WALL_PX,
      east: room.x + room.w >= totalW - WALL_PX,
    };

    // Refine: check for actual neighbours
    for (const other of layouts) {
      if (other.roomId === room.roomId) continue;

      const overlapH =
        Math.min(room.x + room.w, other.x + other.w) - Math.max(room.x, other.x);
      const overlapV =
        Math.min(room.y + room.h, other.y + other.h) - Math.max(room.y, other.y);
      const threshold = WALL_PX * 4;

      // Neighbour to the north
      if (
        Math.abs(other.y + other.h - room.y) <= WALL_PX * 2 &&
        overlapH > threshold
      ) {
        outerWalls.north = false;
      }
      // Neighbour to the south
      if (
        Math.abs(room.y + room.h - other.y) <= WALL_PX * 2 &&
        overlapH > threshold
      ) {
        outerWalls.south = false;
      }
      // Neighbour to the west
      if (
        Math.abs(other.x + other.w - room.x) <= WALL_PX * 2 &&
        overlapV > threshold
      ) {
        outerWalls.west = false;
      }
      // Neighbour to the east
      if (
        Math.abs(room.x + room.w - other.x) <= WALL_PX * 2 &&
        overlapV > threshold
      ) {
        outerWalls.east = false;
      }
    }

    return { ...room, outerWalls };
  });
}

// ─── Main layout function ─────────────────────────────────────────────────────

/**
 * Build a HouseLayout from a FloorPlanSpec.
 *
 * @param spec           The floor plan spec
 * @param orientation    Which direction the entrance faces (default "south")
 * @param bedroomPos     "clustered" | "spread" — affects row split strategy
 */
export function buildHouseLayout(
  spec: FloorPlanSpec,
  orientation: "north" | "south" | "east" | "west" = "south",
  bedroomPos: "clustered" | "spread" = "clustered",
): HouseLayout {
  const allRooms = toPixels(spec.rooms);

  // Sort rooms by zone then by type-specific order
  const sorted = [...allRooms].sort((a, b) => {
    const zd = ZONE_ORDER[a.zone] - ZONE_ORDER[b.zone];
    if (zd !== 0) return zd;
    return (TYPE_ORDER[a.spec.type] ?? 9) - (TYPE_ORDER[b.spec.type] ?? 9);
  });

  // ── Estimate target canvas width from total area ──
  // Use the widest room as a floor for per-row width, but cap to 3 rooms wide
  const maxRoomW = Math.max(...allRooms.map((r) => r.w));
  const totalAreaPx = allRooms.reduce((s, r) => s + r.w * r.h, 0);
  // Aim for roughly a 1.3:1 width:height ratio for the canvas
  const targetW = Math.max(maxRoomW * 3, Math.round(Math.sqrt(totalAreaPx * 1.3)));

  // ── Split into zone groups ──
  const publicRooms = sorted.filter((r) => r.zone === "public");
  const privateRooms = sorted.filter((r) => r.zone === "private");
  const wetRooms = sorted.filter((r) => r.zone === "wet");
  const serviceRooms = sorted.filter((r) => r.zone === "service");

  // ── Decide row arrangement based on entrance orientation ──
  // For south-facing (most common Indian homes): public zone at bottom (south),
  // private zone at top (north), wet tucked to the right of private.
  //
  // We'll build rows from top → bottom then flip if needed.

  // Attach wet rooms to private zone so they stay adjacent
  const privateWithWet = [...privateRooms, ...wetRooms];

  const rows: Row[] = [
    ...packIntoRows(privateWithWet, targetW),
    ...packIntoRows(publicRooms, targetW),
    ...packIntoRows(serviceRooms, targetW),
  ];

  // ── Compute canvas total size ──
  const canvasW = Math.max(...rows.map((r) => r.rowW)) + WALL_PX * 2;
  const canvasH =
    rows.reduce((s, r) => s + r.rowH, 0) +
    WALL_PX * (rows.length + 1);

  // ── Place rooms on canvas ──
  const layouts: RoomLayout[] = [];
  let cursorY = WALL_PX;

  for (const row of rows) {
    let cursorX = WALL_PX;
    const rowH = row.rowH;

    for (const item of row.items) {
      // Center the room vertically within the row
      const offsetY = Math.round((rowH - item.h) / 2);

      layouts.push({
        roomId: item.spec.id,
        label: item.spec.label,
        type: item.spec.type,
        zone: item.zone,
        x: cursorX,
        y: cursorY + offsetY,
        w: item.w,
        h: item.h,
        // Outer walls determined after all rooms placed
        outerWalls: { north: true, south: true, east: true, west: true },
      });

      cursorX += item.w + WALL_PX;
    }

    cursorY += rowH + WALL_PX;
  }

  // ── For south-facing: flip so public zone ends up at the bottom ──
  // We built top → private, middle → public, bottom → service.
  // For south-facing we want public at the south (bottom of canvas).
  // The current arrangement already matches: private at top, public in middle.
  // Just ensure the flip reflects the chosen entrance.

  // If north-facing, reverse the row order vertically
  let finalLayouts = layouts;
  if (orientation === "north") {
    finalLayouts = layouts.map((r) => ({
      ...r,
      y: canvasH - r.y - r.h,
    }));
  }

  // ── Mark outer walls ──
  const withOuterWalls = markOuterWalls(finalLayouts, canvasW, canvasH);

  // ── Stretch rooms to fill any horizontal gap in their row ──
  // Group by approximate y-band and stretch the last room in each row
  const withStretched = stretchToFill(withOuterWalls, canvasW);

  return {
    totalW: canvasW,
    totalH: canvasH,
    scale: LAYOUT_SCALE,
    rooms: withStretched,
    entranceFacing: orientation,
  };
}

// ─── Stretch rooms to fill horizontal gaps ────────────────────────────────────

/**
 * For each row (grouped by y-band), expand the rightmost room so the
 * row fills the full canvas width. This avoids ugly empty strips.
 */
function stretchToFill(layouts: RoomLayout[], canvasW: number): RoomLayout[] {
  // Group rooms by their row (rooms whose y-ranges overlap)
  const rows = groupByRow(layouts);
  const result = [...layouts];

  for (const row of rows) {
    if (row.length === 0) continue;
    // Find rightmost room
    const rightmost = row.reduce((a, b) => (a.x + a.w > b.x + b.w ? a : b));
    const gap = canvasW - WALL_PX - (rightmost.x + rightmost.w);
    if (gap > 0 && gap < rightmost.w * 0.5) {
      const idx = result.findIndex((r) => r.roomId === rightmost.roomId);
      if (idx !== -1) {
        result[idx] = { ...result[idx], w: result[idx].w + gap };
      }
    }
  }

  return result;
}

function groupByRow(layouts: RoomLayout[]): RoomLayout[][] {
  if (layouts.length === 0) return [];
  const sorted = [...layouts].sort((a, b) => a.y - b.y);
  const rows: RoomLayout[][] = [];
  let currentRow: RoomLayout[] = [sorted[0]];
  let rowBottom = sorted[0].y + sorted[0].h;

  for (let i = 1; i < sorted.length; i++) {
    const room = sorted[i];
    if (room.y < rowBottom - WALL_PX * 2) {
      currentRow.push(room);
      rowBottom = Math.max(rowBottom, room.y + room.h);
    } else {
      rows.push(currentRow);
      currentRow = [room];
      rowBottom = room.y + room.h;
    }
  }
  rows.push(currentRow);
  return rows;
}
