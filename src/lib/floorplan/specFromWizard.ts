/**
 * Convert a completed WizardState into a FloorPlanSpec with
 * default dimensions and seeded fixtures.
 *
 * All defaulted dimensions carry a "default_dimension_assumed" confidence flag
 * that is cleared when the user edits them in the editor.
 */

import type { WizardState, RoomType } from "./wizardTypes";
import type { FloorPlanSpec, RoomSpec, Fixture, Opening } from "./schema";

// ─── Default dimensions (inches) by room type ─────────────────────────────────

/** [widthIn, depthIn] for each room type */
const DEFAULT_DIMS: Record<string, [number, number]> = {
  living: [168, 144],
  dining: [120, 108],
  kitchen: [120, 96],
  master_bedroom: [144, 132],
  bedroom: [120, 120],
  bathroom: [60, 84],
  toilet: [42, 60],
  study: [108, 96],
  office: [108, 96],
  balcony: [96, 48],
  puja: [48, 48],
};

// ─── Wizard room → schema type mapping ───────────────────────────────────────

const ROOM_TYPE_MAP: Record<RoomType, RoomSpec["type"]> = {
  "Living Room": "living",
  "Dining Room": "dining",
  Kitchen: "kitchen",
  "Master Bedroom": "master_bedroom",
  "Bedroom 2": "bedroom",
  "Bedroom 3": "bedroom",
  Bathroom: "bathroom",
  Balcony: "balcony",
  "Study Room": "study",
  Office: "office",
};

// ─── Default fixtures per room type ──────────────────────────────────────────

function livingFixtures(widthIn: number, depthIn: number): Fixture[] {
  return [
    {
      id: "sofa-default",
      kind: "sofa",
      wall: "south",
      xIn: 12,
      yIn: depthIn - 36,
      widthIn: 84,
      depthIn: 34,
      rotationDeg: 0,
      label: "Sofa",
    },
    {
      id: "tv-unit-default",
      kind: "tv_unit",
      wall: "north",
      xIn: (widthIn - 60) / 2,
      yIn: 0,
      widthIn: 60,
      depthIn: 18,
      rotationDeg: 0,
      label: "TV Unit",
    },
  ];
}

function diningFixtures(widthIn: number, depthIn: number): Fixture[] {
  return [
    {
      id: "dining-table-default",
      kind: "dining_table",
      xIn: (widthIn - 48) / 2,
      yIn: (depthIn - 36) / 2,
      widthIn: 48,
      depthIn: 36,
      rotationDeg: 0,
      label: "Dining Table",
    },
  ];
}

function kitchenFixtures(widthIn: number, depthIn: number): Fixture[] {
  return [
    {
      id: "counter-south-default",
      kind: "counter",
      wall: "south",
      xIn: 0,
      yIn: depthIn - 24,
      widthIn: widthIn,
      depthIn: 24,
      rotationDeg: 0,
      label: "Counter",
    },
    {
      id: "sink-default",
      kind: "sink",
      wall: "south",
      xIn: (widthIn - 24) / 2,
      yIn: depthIn - 24,
      widthIn: 24,
      depthIn: 18,
      rotationDeg: 0,
      label: "Sink",
    },
    {
      id: "hob-default",
      kind: "hob",
      wall: "south",
      xIn: widthIn - 48,
      yIn: depthIn - 24,
      widthIn: 24,
      depthIn: 20,
      rotationDeg: 0,
      label: "Hob",
    },
  ];
}

function masterBedroomFixtures(widthIn: number, depthIn: number): Fixture[] {
  return [
    {
      id: "bed-default",
      kind: "bed",
      wall: "north",
      xIn: (widthIn - 60) / 2,
      yIn: 6,
      widthIn: 60,
      depthIn: 80,
      rotationDeg: 0,
      label: "King Bed",
    },
    {
      id: "wardrobe-default",
      kind: "wardrobe",
      wall: "west",
      xIn: 0,
      yIn: 6,
      widthIn: 24,
      depthIn: 72,
      rotationDeg: 0,
      label: "Wardrobe",
    },
  ];
}

function bedroomFixtures(widthIn: number, depthIn: number): Fixture[] {
  return [
    {
      id: "bed-default",
      kind: "bed",
      wall: "north",
      xIn: (widthIn - 54) / 2,
      yIn: 6,
      widthIn: 54,
      depthIn: 75,
      rotationDeg: 0,
      label: "Double Bed",
    },
    {
      id: "wardrobe-default",
      kind: "wardrobe",
      wall: "west",
      xIn: 0,
      yIn: 6,
      widthIn: 24,
      depthIn: 60,
      rotationDeg: 0,
      label: "Wardrobe",
    },
  ];
}

function bathroomFixtures(widthIn: number, depthIn: number): Fixture[] {
  return [
    {
      id: "basin-default",
      kind: "basin",
      wall: "north",
      xIn: 6,
      yIn: 0,
      widthIn: 18,
      depthIn: 16,
      rotationDeg: 0,
      label: "Basin",
    },
    {
      id: "shower-default",
      kind: "shower",
      wall: "south",
      xIn: widthIn - 36,
      yIn: depthIn - 36,
      widthIn: 36,
      depthIn: 36,
      rotationDeg: 0,
      label: "Shower",
    },
  ];
}

function toiletFixtures(widthIn: number, depthIn: number): Fixture[] {
  return [
    {
      id: "wc-default",
      kind: "wc",
      wall: "south",
      xIn: (widthIn - 18) / 2,
      yIn: depthIn - 28,
      widthIn: 18,
      depthIn: 28,
      rotationDeg: 0,
      label: "WC",
    },
  ];
}

function studyFixtures(widthIn: number, depthIn: number): Fixture[] {
  return [
    {
      id: "study-desk-default",
      kind: "study_desk",
      wall: "north",
      xIn: 6,
      yIn: 0,
      widthIn: 48,
      depthIn: 24,
      rotationDeg: 0,
      label: "Desk",
    },
  ];
}

function defaultFixtures(
  type: RoomSpec["type"],
  widthIn: number,
  depthIn: number,
): Fixture[] {
  switch (type) {
    case "living":
      return livingFixtures(widthIn, depthIn);
    case "dining":
      return diningFixtures(widthIn, depthIn);
    case "kitchen":
      return kitchenFixtures(widthIn, depthIn);
    case "master_bedroom":
      return masterBedroomFixtures(widthIn, depthIn);
    case "bedroom":
      return bedroomFixtures(widthIn, depthIn);
    case "bathroom":
      return bathroomFixtures(widthIn, depthIn);
    case "toilet":
      return toiletFixtures(widthIn, depthIn);
    case "study":
    case "office":
      return studyFixtures(widthIn, depthIn);
    default:
      return [];
  }
}

function defaultOpenings(
  type: RoomSpec["type"],
  _widthIn: number,
  _depthIn: number,
): Opening[] {
  // Give toilet/bathroom a default inward-swinging door on north wall
  if (type === "toilet" || type === "bathroom") {
    return [
      {
        id: "door-default",
        type: "door",
        wall: "north",
        widthIn: 30,
        offsetIn: 6,
        swing: "in",
      },
    ];
  }
  // Living room gets an arch to the outside on south
  if (type === "living") {
    return [
      {
        id: "door-main-default",
        type: "door",
        wall: "south",
        widthIn: 36,
        offsetIn: 12,
        swing: "out",
      },
    ];
  }
  // Bedrooms get a door on south wall
  if (type === "master_bedroom" || type === "bedroom") {
    return [
      {
        id: "door-default",
        type: "door",
        wall: "south",
        widthIn: 30,
        offsetIn: 12,
        swing: "in",
      },
    ];
  }
  return [];
}

// ─── ID generation ────────────────────────────────────────────────────────────

function makeId(type: string, index: number): string {
  return `${type}-${String(index + 1).padStart(2, "0")}`;
}

// ─── Build spec ───────────────────────────────────────────────────────────────

export function buildSpecFromWizard(state: WizardState): FloorPlanSpec {
  const rooms: RoomSpec[] = [];

  // Track per-type occurrence to disambiguate e.g. "Bedroom 2" vs "Bedroom 3"
  const typeCount: Partial<Record<RoomSpec["type"], number>> = {};

  for (const wizardRoom of state.rooms) {
    const schemaType = ROOM_TYPE_MAP[wizardRoom];
    const count = (typeCount[schemaType] ?? 0);
    typeCount[schemaType] = count + 1;

    const [widthIn, depthIn] = DEFAULT_DIMS[schemaType] ?? [120, 96];

    const roomIndex = rooms.length;

    rooms.push({
      id: makeId(schemaType, roomIndex),
      type: schemaType,
      label: wizardRoom,
      widthIn,
      depthIn,
      wallThicknessIn: 5,
      openings: defaultOpenings(schemaType, widthIn, depthIn),
      fixtures: defaultFixtures(schemaType, widthIn, depthIn),
      notes: [],
      confidenceFlags: ["default_dimension_assumed"],
    });
  }

  // Add puja room if requested
  if (state.pujaRoom) {
    const [widthIn, depthIn] = DEFAULT_DIMS["puja"]!;
    rooms.push({
      id: makeId("puja", rooms.length),
      type: "puja",
      label: "Puja Room",
      widthIn,
      depthIn,
      wallThicknessIn: 5,
      openings: [
        {
          id: "puja-door-default",
          type: "door",
          wall: "south",
          widthIn: 24,
          offsetIn: 12,
          swing: "in",
        },
      ],
      fixtures: [],
      notes: ["Puja room added per lifestyle preference"],
      confidenceFlags: ["default_dimension_assumed"],
    });
  }

  // Determine entrance wall from orientation
  // For south-facing home → main door on south wall of living room
  const orientationWallMap: Record<string, Opening["wall"]> = {
    south: "south",
    north: "north",
    east: "east",
    west: "west",
  };
  const entranceWall: Opening["wall"] =
    orientationWallMap[state.orientation ?? "south"] ?? "south";

  // Apply entrance wall to living room's main door opening
  const livingRoom = rooms.find((r) => r.type === "living");
  if (livingRoom) {
    const mainDoor = livingRoom.openings.find((o) => o.id === "door-main-default");
    if (mainDoor) {
      mainDoor.wall = entranceWall;
    }
  }

  const spec: FloorPlanSpec = {
    schemaVersion: 1,
    projectName: `${state.propertyType} — ${state.carpetArea} sq.ft.`,
    source: "wizard",
    createdAt: new Date().toISOString(),
    units: "inches",
    orientationNote: `${state.orientation ?? "south"}-facing · ${state.plotShape ?? "rectangular"} plot · bedrooms ${state.bedroomPosition ?? "clustered"}`,
    rooms,
    wizardSnapshot: state as Record<string, unknown>,
  };

  return spec;
}
