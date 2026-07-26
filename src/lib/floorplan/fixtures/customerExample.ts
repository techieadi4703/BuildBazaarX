/**
 * Customer example fixture — encodes a real brief as a valid FloorPlanSpec.
 * Used as test data and for the ?example=1 query param on SpacePlanning.
 */

import { parseFeetInches } from "../units";
import type { FloorPlanSpec } from "../schema";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const p = parseFeetInches; // shorthand

// ─── Fixture ─────────────────────────────────────────────────────────────────

export const customerExample: FloorPlanSpec = {
  schemaVersion: 1,
  projectName: "Customer Example — Kitchen + WCs",
  source: "wizard",
  createdAt: "2026-07-22T00:00:00.000Z",
  units: "inches",
  orientationNote: "North wall of kitchen opens to living area via arch",

  rooms: [
    // ── Kitchen ────────────────────────────────────────────────────────────
    {
      id: "kitchen-01",
      type: "kitchen",
      label: "Kitchen",
      widthIn: p("13'0\""),   // 156 in
      depthIn: p("10'10\""),  // 130 in
      wallThicknessIn: 5,

      openings: [
        {
          id: "kitchen-arch-north",
          type: "arch",
          wall: "north",
          widthIn: p("3'0\""), // 36 in
          offsetIn: 60,        // centred on 156 in wall: (156-36)/2 = 60
          swing: "none",
        },
        {
          id: "kitchen-passage-south",
          type: "passage",
          wall: "south",
          widthIn: p("3'0\""), // 36 in — "3' rear exit passage on south side"
          offsetIn: 60,
          swing: "none",
        },
      ],

      fixtures: [
        // L-counter east wall — full depth (130 in), 24" deep
        {
          id: "counter-east",
          kind: "counter",
          wall: "east",
          xIn: p("13'0\"") - 24, // right edge of room minus counter depth
          yIn: 0,
          widthIn: 24,
          depthIn: p("10'10\""),  // full depth
          rotationDeg: 0,
          label: "East Counter",
        },
        // L-counter south wall — full width (156 in), 24" deep
        {
          id: "counter-south",
          kind: "counter",
          wall: "south",
          xIn: 0,
          yIn: p("10'10\"") - 24,
          widthIn: p("13'0\""),
          depthIn: 24,
          rotationDeg: 0,
          label: "South Counter",
        },
        // Hob on east counter — centred, 24" wide × 20" deep
        {
          id: "hob-east",
          kind: "hob",
          wall: "east",
          xIn: p("13'0\"") - 24,
          yIn: 40,
          widthIn: 24,
          depthIn: 20,
          rotationDeg: 0,
          label: "Hob",
        },
        // Sink centred on south counter
        {
          id: "sink-south",
          kind: "sink",
          wall: "south",
          xIn: (p("13'0\"") - 24) / 2,  // centred on 156 in width
          yIn: p("10'10\"") - 24,
          widthIn: 24,
          depthIn: 18,
          rotationDeg: 0,
          label: "Sink",
        },
        // Dining table 30"×60" against west wall — breakfast seating
        {
          id: "dining-west",
          kind: "dining_table",
          wall: "west",
          xIn: 0,
          yIn: 35,
          widthIn: 30,
          depthIn: 60,
          rotationDeg: 0,
          label: "Breakfast Table",
        },
      ],

      notes: [
        "3' rear exit passage on south side",
        "L-counter on east and south walls",
        "Breakfast seating along west wall",
      ],
      confidenceFlags: [],
    },

    // ── Toilet ─────────────────────────────────────────────────────────────
    {
      id: "toilet-01",
      type: "toilet",
      label: "Toilet",
      widthIn: p("3'6\""),  // 42 in
      depthIn: p("5'0\""),  // 60 in
      wallThicknessIn: 5,

      openings: [
        {
          id: "toilet-door-north",
          type: "door",
          wall: "north",
          widthIn: p("2'6\""), // 30 in
          offsetIn: 6,         // small offset from corner
          swing: "in",
        },
      ],

      fixtures: [
        {
          id: "wc-south",
          kind: "wc",
          wall: "south",
          xIn: 9,
          yIn: p("5'0\"") - 28,
          widthIn: 24,
          depthIn: 28,
          rotationDeg: 0,
          label: "WC",
        },
      ],

      notes: ["Partition between toilet and bathroom is 5\" (wallThicknessIn)"],
      confidenceFlags: [],
    },

    // ── Bathroom ───────────────────────────────────────────────────────────
    {
      id: "bathroom-01",
      type: "bathroom",
      label: "Bathroom",
      widthIn: p("4'11\""), // 59 in
      depthIn: p("5'0\""),  // 60 in
      wallThicknessIn: 5,

      openings: [
        {
          id: "bathroom-door-north",
          type: "door",
          wall: "north",
          widthIn: p("2'6\""), // 30 in
          offsetIn: 6,
          swing: "in",
        },
      ],

      fixtures: [
        // Basin near north wall (dry zone)
        {
          id: "basin-north",
          kind: "basin",
          wall: "north",
          xIn: 6,
          yIn: 0,
          widthIn: 20,
          depthIn: 16,
          rotationDeg: 0,
          label: "Basin (dry zone)",
        },
        // Shower zone along south wall (wet zone)
        {
          id: "shower-south",
          kind: "shower",
          wall: "south",
          xIn: 6,
          yIn: p("5'0\"") - 36,
          widthIn: 36,
          depthIn: 36,
          rotationDeg: 0,
          label: "Shower (wet zone)",
        },
      ],

      notes: ["wet/dry separation: basin north, shower south"],
      confidenceFlags: [],
    },
  ],
};
