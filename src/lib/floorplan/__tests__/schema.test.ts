import { describe, it, expect } from "vitest";
import { FloorPlanSpecSchema, RoomSpecSchema } from "../schema";
import { customerExample } from "../fixtures/customerExample";

describe("FloorPlanSpecSchema", () => {
  it("validates the customerExample fixture without errors", () => {
    expect(() => FloorPlanSpecSchema.parse(customerExample)).not.toThrow();
  });

  it("rejects a spec with zero rooms", () => {
    expect(() =>
      FloorPlanSpecSchema.parse({
        ...customerExample,
        rooms: [],
      }),
    ).toThrow();
  });

  it("rejects a spec with negative widthIn", () => {
    expect(() =>
      FloorPlanSpecSchema.parse({
        ...customerExample,
        rooms: [{ ...customerExample.rooms[0], widthIn: -10 }],
      }),
    ).toThrow();
  });
});

describe("RoomSpecSchema — opening bounds superRefine", () => {
  const baseRoom = {
    id: "r1",
    type: "kitchen" as const,
    label: "Kitchen",
    widthIn: 100,
    depthIn: 80,
    wallThicknessIn: 5,
    openings: [],
    fixtures: [],
    notes: [],
    confidenceFlags: [],
  };

  it("accepts an opening that fits within the wall", () => {
    expect(() =>
      RoomSpecSchema.parse({
        ...baseRoom,
        openings: [
          {
            id: "d1",
            type: "door",
            wall: "north",
            widthIn: 30,
            offsetIn: 10,
            swing: "in",
          },
        ],
      }),
    ).not.toThrow();
  });

  it("rejects an opening wider than the wall (north → widthIn)", () => {
    expect(() =>
      RoomSpecSchema.parse({
        ...baseRoom,
        openings: [
          {
            id: "d1",
            type: "door",
            wall: "north",
            widthIn: 80,
            offsetIn: 50, // 50 + 80 = 130 > 100
            swing: "in",
          },
        ],
      }),
    ).toThrow();
  });

  it("rejects an opening on east wall that exceeds depthIn", () => {
    expect(() =>
      RoomSpecSchema.parse({
        ...baseRoom,
        openings: [
          {
            id: "d2",
            type: "window",
            wall: "east",
            widthIn: 40,
            offsetIn: 60, // 60 + 40 = 100 > 80 (depthIn)
            swing: "none",
          },
        ],
      }),
    ).toThrow();
  });

  it("accepts an opening exactly at the wall boundary", () => {
    expect(() =>
      RoomSpecSchema.parse({
        ...baseRoom,
        openings: [
          {
            id: "d3",
            type: "door",
            wall: "north",
            widthIn: 30,
            offsetIn: 70, // 70 + 30 = 100 exactly (widthIn)
            swing: "none",
          },
        ],
      }),
    ).not.toThrow();
  });
});

describe("customerExample — room count and types", () => {
  const spec = FloorPlanSpecSchema.parse(customerExample);

  it("has exactly 3 rooms", () => {
    expect(spec.rooms).toHaveLength(3);
  });

  it("includes a kitchen room", () => {
    expect(spec.rooms.some((r) => r.type === "kitchen")).toBe(true);
  });

  it("includes a toilet room", () => {
    expect(spec.rooms.some((r) => r.type === "toilet")).toBe(true);
  });

  it("includes a bathroom room", () => {
    expect(spec.rooms.some((r) => r.type === "bathroom")).toBe(true);
  });

  it("kitchen widthIn is 156 (13'0\")", () => {
    const kitchen = spec.rooms.find((r) => r.type === "kitchen")!;
    expect(kitchen.widthIn).toBe(156);
  });

  it("kitchen depthIn is 130 (10'10\")", () => {
    const kitchen = spec.rooms.find((r) => r.type === "kitchen")!;
    expect(kitchen.depthIn).toBe(130);
  });

  it("toilet widthIn is 42 (3'6\")", () => {
    const toilet = spec.rooms.find((r) => r.type === "toilet")!;
    expect(toilet.widthIn).toBe(42);
  });

  it("bathroom widthIn is 59 (4'11\")", () => {
    const bathroom = spec.rooms.find((r) => r.type === "bathroom")!;
    expect(bathroom.widthIn).toBe(59);
  });
});
