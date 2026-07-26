/**
 * Immutable update helpers for FloorPlanSpec.
 *
 * Every edit produces a new spec object — never mutates the original.
 * This preserves the append-only versioning discipline for when
 * Supabase persistence lands.
 */

import type { FloorPlanSpec, RoomSpec, Fixture, Opening } from "./schema";

// ─── Room-level updates ───────────────────────────────────────────────────────

export function updateRoom(
  spec: FloorPlanSpec,
  roomId: string,
  patch: Partial<RoomSpec>,
): FloorPlanSpec {
  return {
    ...spec,
    rooms: spec.rooms.map((r) =>
      r.id === roomId ? { ...r, ...patch } : r,
    ),
  };
}

export function updateRoomDimensions(
  spec: FloorPlanSpec,
  roomId: string,
  widthIn: number,
  depthIn: number,
): FloorPlanSpec {
  return {
    ...spec,
    rooms: spec.rooms.map((r) => {
      if (r.id !== roomId) return r;
      // Clear the default_dimension_assumed flag when the user edits
      const confidenceFlags = r.confidenceFlags.filter(
        (f) => f !== "default_dimension_assumed",
      );
      return { ...r, widthIn, depthIn, confidenceFlags };
    }),
  };
}

export function updateRoomLabel(
  spec: FloorPlanSpec,
  roomId: string,
  label: string,
): FloorPlanSpec {
  return updateRoom(spec, roomId, { label });
}

// ─── Fixture-level updates ────────────────────────────────────────────────────

export function updateFixture(
  spec: FloorPlanSpec,
  roomId: string,
  fixtureId: string,
  patch: Partial<Fixture>,
): FloorPlanSpec {
  return {
    ...spec,
    rooms: spec.rooms.map((r) => {
      if (r.id !== roomId) return r;
      return {
        ...r,
        fixtures: r.fixtures.map((f) =>
          f.id === fixtureId ? { ...f, ...patch } : f,
        ),
      };
    }),
  };
}

export function removeFixture(
  spec: FloorPlanSpec,
  roomId: string,
  fixtureId: string,
): FloorPlanSpec {
  return {
    ...spec,
    rooms: spec.rooms.map((r) => {
      if (r.id !== roomId) return r;
      return {
        ...r,
        fixtures: r.fixtures.filter((f) => f.id !== fixtureId),
      };
    }),
  };
}

export function addFixture(
  spec: FloorPlanSpec,
  roomId: string,
  fixture: Fixture,
): FloorPlanSpec {
  return {
    ...spec,
    rooms: spec.rooms.map((r) => {
      if (r.id !== roomId) return r;
      return { ...r, fixtures: [...r.fixtures, fixture] };
    }),
  };
}

// ─── Opening-level updates ────────────────────────────────────────────────────

export function removeOpening(
  spec: FloorPlanSpec,
  roomId: string,
  openingId: string,
): FloorPlanSpec {
  return {
    ...spec,
    rooms: spec.rooms.map((r) => {
      if (r.id !== roomId) return r;
      return {
        ...r,
        openings: r.openings.filter((o) => o.id !== openingId),
      };
    }),
  };
}

export function addOpening(
  spec: FloorPlanSpec,
  roomId: string,
  opening: Opening,
): FloorPlanSpec {
  return {
    ...spec,
    rooms: spec.rooms.map((r) => {
      if (r.id !== roomId) return r;
      return { ...r, openings: [...r.openings, opening] };
    }),
  };
}
