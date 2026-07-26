/**
 * Zod schema for the FloorPlanSpec — the single source of truth shared across
 * wizard, vision extraction, 3D pipeline, and BOQ generation.
 *
 * FIELD NAMES ARE FROZEN — do not rename without a schema version bump.
 */

import { z } from "zod";

// ─── Wall side ───────────────────────────────────────────────────────────────

export const WallSideSchema = z.enum(["north", "south", "east", "west"]);

// ─── Opening ─────────────────────────────────────────────────────────────────

export const OpeningSchema = z.object({
  id: z.string(),
  type: z.enum(["door", "arch", "window", "passage"]),
  wall: WallSideSchema,
  widthIn: z.number().positive(),       // inches
  offsetIn: z.number().min(0),          // from wall's start corner (clockwise convention)
  swing: z.enum(["in", "out", "none"]).default("none"),
});

// ─── Fixture ─────────────────────────────────────────────────────────────────

export const FixtureSchema = z.object({
  id: z.string(),
  kind: z.enum([
    "counter",
    "sink",
    "hob",
    "fridge",
    "dining_table",
    "wc",
    "basin",
    "shower",
    "geyser",
    "bed",
    "wardrobe",
    "sofa",
    "tv_unit",
    "study_desk",
    "partition",
  ]),
  wall: WallSideSchema.optional(),      // wall-mounted / aligned fixtures
  xIn: z.number().min(0),               // top-left in room-local coords, inches
  yIn: z.number().min(0),
  widthIn: z.number().positive(),
  depthIn: z.number().positive(),
  rotationDeg: z
    .union([
      z.literal(0),
      z.literal(90),
      z.literal(180),
      z.literal(270),
    ])
    .default(0),
  label: z.string().optional(),
});

// ─── Room ─────────────────────────────────────────────────────────────────────

export const RoomSpecSchema = z
  .object({
    id: z.string(),
    type: z.enum([
      "living",
      "dining",
      "kitchen",
      "master_bedroom",
      "bedroom",
      "bathroom",
      "toilet",
      "puja",
      "study",
      "office",
      "balcony",
    ]),
    label: z.string(),
    widthIn: z.number().positive(),     // clear internal width
    depthIn: z.number().positive(),     // clear internal depth
    wallThicknessIn: z.number().positive().default(5),
    openings: z.array(OpeningSchema).default([]),
    fixtures: z.array(FixtureSchema).default([]),
    notes: z.array(z.string()).default([]),
    confidenceFlags: z.array(z.string()).default([]),
  })
  .superRefine((room, ctx) => {
    const wallLength: Record<string, number> = {
      north: room.widthIn,
      south: room.widthIn,
      east: room.depthIn,
      west: room.depthIn,
    };
    for (const opening of room.openings) {
      const limit = wallLength[opening.wall];
      if (opening.offsetIn + opening.widthIn > limit) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Opening "${opening.id}" on ${opening.wall} wall extends beyond wall length (${opening.offsetIn} + ${opening.widthIn} > ${limit})`,
          path: ["openings"],
        });
      }
    }
  });

// ─── FloorPlanSpec ────────────────────────────────────────────────────────────

export const FloorPlanSpecSchema = z.object({
  schemaVersion: z.literal(1),
  projectName: z.string(),
  source: z.enum(["wizard", "scan", "merged"]),
  createdAt: z.string(),               // ISO date string
  units: z.literal("inches"),
  orientationNote: z.string().optional(),
  rooms: z.array(RoomSpecSchema).min(1),
  wizardSnapshot: z.record(z.unknown()).optional(), // raw WizardState for audit
});

// ─── Inferred types ───────────────────────────────────────────────────────────

export type WallSide = z.infer<typeof WallSideSchema>;
export type Opening = z.infer<typeof OpeningSchema>;
export type Fixture = z.infer<typeof FixtureSchema>;
export type RoomSpec = z.infer<typeof RoomSpecSchema>;
export type FloorPlanSpec = z.infer<typeof FloorPlanSpecSchema>;
