/**
 * Types for the floor-plan layout engine output.
 *
 * The layout engine consumes a FloorPlanSpec and produces a HouseLayout —
 * an arrangement of RoomLayouts on a shared coordinate system so that
 * all rooms can be stitched into one SVG canvas.
 */

// ─── Zone classification ──────────────────────────────────────────────────────

/** Functional zone a room belongs to in the layout pass */
export type Zone = "public" | "private" | "wet" | "service";

// ─── Individual room on the canvas ───────────────────────────────────────────

export interface RoomLayout {
  /** Matches RoomSpec.id */
  roomId: string;
  label: string;
  type: string;
  zone: Zone;

  /** Canvas coordinates in pixels */
  x: number;
  y: number;
  w: number;
  h: number;

  /** Which walls are outer (exterior) vs shared with a neighbour */
  outerWalls: {
    north: boolean;
    south: boolean;
    east: boolean;
    west: boolean;
  };
}

// ─── Full house layout ────────────────────────────────────────────────────────

export interface HouseLayout {
  /** Total canvas width in pixels */
  totalW: number;
  /** Total canvas height in pixels */
  totalH: number;
  /** Pixels per inch used when computing this layout */
  scale: number;
  /** All rooms with their positions */
  rooms: RoomLayout[];
  /**
   * Which compass direction the main entrance faces.
   * "south" means the front door is on the south wall (bottom of canvas).
   */
  entranceFacing: "north" | "south" | "east" | "west";
}
