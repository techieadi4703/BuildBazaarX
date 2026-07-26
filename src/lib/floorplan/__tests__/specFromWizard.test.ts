import { describe, it, expect } from "vitest";
import { buildSpecFromWizard } from "../specFromWizard";
import { FloorPlanSpecSchema } from "../schema";
import type { WizardState } from "../wizardTypes";

const fullWizardState: WizardState = {
  propertyType: "Apartment",
  carpetArea: 1450,
  builtUpArea: 1650,
  floors: 1,
  rooms: [
    "Living Room",
    "Dining Room",
    "Kitchen",
    "Master Bedroom",
    "Bedroom 2",
    "Bedroom 3",
    "Bathroom",
    "Balcony",
    "Study Room",
    "Office",
  ],
  adults: 2,
  children: 1,
  seniors: 0,
  pets: 1,
  workFromHome: true,
  cookDaily: true,
  extraStorage: true,
  kidsRoom: true,
  homeOffice: true,
  pujaRoom: true,
  shoeStorage: true,
  designStyle: "Modern",
  colorTheme: "White",
  budget: 12,
  materials: ["Laminate", "Veneer", "Tiles"],
};

describe("buildSpecFromWizard", () => {
  it("produces a spec that validates against FloorPlanSpecSchema", () => {
    const spec = buildSpecFromWizard(fullWizardState);
    expect(() => FloorPlanSpecSchema.parse(spec)).not.toThrow();
  });

  it("has source = wizard", () => {
    const spec = buildSpecFromWizard(fullWizardState);
    expect(spec.source).toBe("wizard");
  });

  it("has one room per selection + puja", () => {
    const spec = buildSpecFromWizard(fullWizardState);
    // 10 rooms selected + 1 puja
    expect(spec.rooms).toHaveLength(11);
  });

  it("includes puja room when pujaRoom flag is set", () => {
    const spec = buildSpecFromWizard(fullWizardState);
    expect(spec.rooms.some((r) => r.type === "puja")).toBe(true);
  });

  it("does not include puja room when pujaRoom = false", () => {
    const spec = buildSpecFromWizard({ ...fullWizardState, pujaRoom: false });
    expect(spec.rooms.some((r) => r.type === "puja")).toBe(false);
  });

  it("every room has default_dimension_assumed flag", () => {
    const spec = buildSpecFromWizard(fullWizardState);
    for (const room of spec.rooms) {
      expect(room.confidenceFlags).toContain("default_dimension_assumed");
    }
  });

  it("includes living room with correct default dimensions", () => {
    const spec = buildSpecFromWizard(fullWizardState);
    const living = spec.rooms.find((r) => r.type === "living");
    expect(living).toBeDefined();
    expect(living!.widthIn).toBe(168);
    expect(living!.depthIn).toBe(144);
  });

  it("includes kitchen with counter, sink, and hob fixtures", () => {
    const spec = buildSpecFromWizard(fullWizardState);
    const kitchen = spec.rooms.find((r) => r.type === "kitchen");
    expect(kitchen).toBeDefined();
    const kinds = kitchen!.fixtures.map((f) => f.kind);
    expect(kinds).toContain("counter");
    expect(kinds).toContain("sink");
    expect(kinds).toContain("hob");
  });

  it("includes toilet with wc fixture", () => {
    const spec = buildSpecFromWizard({ ...fullWizardState, rooms: ["Bathroom"] });
    const bathroom = spec.rooms.find((r) => r.type === "bathroom");
    expect(bathroom).toBeDefined();
    expect(bathroom!.fixtures.some((f) => f.kind === "basin")).toBe(true);
  });

  it("stores wizardSnapshot", () => {
    const spec = buildSpecFromWizard(fullWizardState);
    expect(spec.wizardSnapshot).toBeDefined();
    expect((spec.wizardSnapshot as WizardState).propertyType).toBe("Apartment");
  });

  it("validates with minimal room list (no puja)", () => {
    const spec = buildSpecFromWizard({
      ...fullWizardState,
      rooms: ["Living Room"],
      pujaRoom: false,
    });
    expect(() => FloorPlanSpecSchema.parse(spec)).not.toThrow();
    expect(spec.rooms).toHaveLength(1);
  });
});
