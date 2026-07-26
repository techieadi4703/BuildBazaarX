/**
 * RoomEditorPanel — side panel for editing the selected room.
 *
 * Accepts the full FloorPlanSpec + onChange handler (immutable update).
 * Width/depth inputs accept feet-inches strings; fixture list shows
 * wall-side select + remove button; "add fixture" dropdown limited to
 * kinds valid for the room type.
 */

import React, { useState, useEffect } from "react";
import type { FloorPlanSpec, RoomSpec, Fixture } from "@/lib/floorplan/schema";
import { parseFeetInches, UnitParseError, formatInches } from "@/lib/floorplan/units";
import {
  updateRoomDimensions,
  updateRoomLabel,
  removeFixture,
  addFixture,
  updateFixture,
} from "@/lib/floorplan/updateSpec";

// ─── Constants ────────────────────────────────────────────────────────────────

type FixtureKind = Fixture["kind"];
type WallSide = Fixture["wall"];

const VALID_FIXTURES_BY_TYPE: Record<RoomSpec["type"], FixtureKind[]> = {
  living: ["sofa", "tv_unit", "study_desk", "partition"],
  dining: ["dining_table"],
  kitchen: ["counter", "sink", "hob", "fridge", "dining_table"],
  master_bedroom: ["bed", "wardrobe", "study_desk"],
  bedroom: ["bed", "wardrobe", "study_desk"],
  bathroom: ["basin", "shower", "geyser"],
  toilet: ["wc", "basin"],
  puja: ["partition"],
  study: ["study_desk", "wardrobe"],
  office: ["study_desk", "partition"],
  balcony: [],
};

const WALL_SIDES: WallSide[] = ["north", "south", "east", "west"];

// ─── Dimension input ──────────────────────────────────────────────────────────

function DimensionInput({
  label,
  valueIn,
  onCommit,
  id,
}: {
  label: string;
  valueIn: number;
  onCommit: (inches: number) => void;
  id: string;
}) {
  const [raw, setRaw] = useState(formatInches(valueIn));
  const [error, setError] = useState<string | null>(null);

  // Sync if external value changes
  useEffect(() => {
    setRaw(formatInches(valueIn));
    setError(null);
  }, [valueIn]);

  function handleBlur() {
    try {
      const inches = parseFeetInches(raw);
      if (inches <= 0) {
        setError("Must be positive");
        return;
      }
      setError(null);
      onCommit(inches);
    } catch (e) {
      if (e instanceof UnitParseError) {
        setError(`Invalid format: try 13'0" or 13ft`);
      } else {
        setError("Invalid input");
      }
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide">
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={(e) => e.key === "Enter" && handleBlur()}
        className={[
          "w-full px-3 py-2 rounded-xl border text-sm font-mono",
          "bg-[var(--bg-card)] text-[var(--text-primary)]",
          "focus:outline-none focus:ring-2",
          error
            ? "border-[var(--error)] focus:ring-[var(--error)]"
            : "border-[var(--border-default)] focus:ring-[var(--accent-warm)]",
        ].join(" ")}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <p id={`${id}-error`} className="text-xs text-[var(--error)]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Fixture row ──────────────────────────────────────────────────────────────

function FixtureRow({
  fixture,
  onRemove,
  onWallChange,
}: {
  fixture: Fixture;
  onRemove: () => void;
  onWallChange: (wall: WallSide | undefined) => void;
}) {
  return (
    <div className="flex items-center gap-2 py-2 border-b border-[var(--border-subtle)] last:border-0">
      <span className="text-xs font-medium text-[var(--text-primary)] flex-1 capitalize">
        {fixture.label ?? fixture.kind.replace("_", " ")}
      </span>

      {/* Wall select */}
      <select
        value={fixture.wall ?? ""}
        onChange={(e) => {
          const val = e.target.value as WallSide | "";
          onWallChange(val === "" ? undefined : val);
        }}
        className="text-xs rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] text-[var(--text-secondary)] px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[var(--accent-warm)]"
        aria-label={`Wall side for ${fixture.kind}`}
      >
        <option value="">—</option>
        {WALL_SIDES.map((w) => (
          <option key={w} value={w}>{w}</option>
        ))}
      </select>

      {/* Remove */}
      <button
        type="button"
        onClick={onRemove}
        className="w-6 h-6 rounded-full flex items-center justify-center text-[var(--error)] hover:bg-[var(--error-bg)] transition-colors text-sm font-bold"
        aria-label={`Remove ${fixture.kind}`}
      >
        ×
      </button>
    </div>
  );
}

// ─── Main panel ───────────────────────────────────────────────────────────────

interface RoomEditorPanelProps {
  spec: FloorPlanSpec;
  selectedRoomId: string | null;
  onChange: (newSpec: FloorPlanSpec) => void;
}

const RoomEditorPanel: React.FC<RoomEditorPanelProps> = ({
  spec,
  selectedRoomId,
  onChange,
}) => {
  const room = spec.rooms.find((r) => r.id === selectedRoomId) ?? null;

  if (!room) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-4 py-12">
        <div className="w-12 h-12 rounded-full bg-[var(--bg-surface)] flex items-center justify-center mb-3">
          <span className="text-2xl">🏠</span>
        </div>
        <p className="text-sm text-[var(--text-tertiary)]">
          Select a room card to edit its dimensions and fixtures.
        </p>
      </div>
    );
  }

  const validKinds = VALID_FIXTURES_BY_TYPE[room.type] ?? [];
  const existingKinds = new Set(room.fixtures.map((f) => f.kind));

  function handleWidthCommit(newWidthIn: number) {
    onChange(updateRoomDimensions(spec, room!.id, newWidthIn, room!.depthIn));
  }

  function handleDepthCommit(newDepthIn: number) {
    onChange(updateRoomDimensions(spec, room!.id, room!.widthIn, newDepthIn));
  }

  function handleLabelChange(label: string) {
    onChange(updateRoomLabel(spec, room!.id, label));
  }

  function handleRemoveFixture(fixtureId: string) {
    onChange(removeFixture(spec, room!.id, fixtureId));
  }

  function handleWallChange(fixtureId: string, wall: WallSide | undefined) {
    onChange(updateFixture(spec, room!.id, fixtureId, { wall }));
  }

  function handleAddFixture(kind: FixtureKind) {
    if (!kind) return;
    const newFixture: Fixture = {
      id: `${kind}-${Date.now()}`,
      kind,
      xIn: 0,
      yIn: 0,
      widthIn: 24,
      depthIn: 18,
      rotationDeg: 0,
      label: kind.replace("_", " "),
    };
    onChange(addFixture(spec, room!.id, newFixture));
  }

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto">
      {/* Header */}
      <div className="bg-[var(--accent-warm-faint)] border border-[var(--accent-warm)] rounded-2xl px-4 py-3">
        <p className="text-xs text-[var(--accent-warm)] font-semibold uppercase tracking-wide mb-1">
          Editing Room
        </p>
        <input
          type="text"
          value={room.label}
          onChange={(e) => handleLabelChange(e.target.value)}
          className="text-base font-bold text-[var(--text-primary)] bg-transparent border-none outline-none w-full"
          aria-label="Room label"
        />
        <p className="text-xs text-[var(--text-tertiary)] mt-0.5 capitalize">
          {room.type.replace("_", " ")} · {room.openings.length} opening{room.openings.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Dimensions */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-4 flex flex-col gap-3">
        <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide">Dimensions</p>
        <DimensionInput
          id={`width-${room.id}`}
          label="Width (W)"
          valueIn={room.widthIn}
          onCommit={handleWidthCommit}
        />
        <DimensionInput
          id={`depth-${room.id}`}
          label="Depth (D)"
          valueIn={room.depthIn}
          onCommit={handleDepthCommit}
        />
        {room.confidenceFlags.includes("default_dimension_assumed") && (
          <p className="text-xs text-[var(--warning)] flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[var(--warning)] inline-block" />
            Dimensions are estimated defaults — edit to confirm.
          </p>
        )}
      </div>

      {/* Fixtures */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-4 flex flex-col gap-2">
        <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide mb-1">Fixtures</p>

        {room.fixtures.length === 0 && (
          <p className="text-xs text-[var(--text-tertiary)] italic">No fixtures added yet.</p>
        )}

        {room.fixtures.map((f) => (
          <FixtureRow
            key={f.id}
            fixture={f}
            onRemove={() => handleRemoveFixture(f.id)}
            onWallChange={(wall) => handleWallChange(f.id, wall)}
          />
        ))}

        {/* Add fixture */}
        {validKinds.length > 0 && (
          <div className="flex gap-2 mt-2">
            <select
              id={`add-fixture-${room.id}`}
              defaultValue=""
              onChange={(e) => {
                const val = e.target.value as FixtureKind;
                if (val) handleAddFixture(val);
                e.target.value = "";
              }}
              className="flex-1 text-xs rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] text-[var(--text-secondary)] px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[var(--accent-warm)]"
              aria-label="Add a fixture"
            >
              <option value="" disabled>+ Add fixture…</option>
              {validKinds
                .filter((k) => !existingKinds.has(k))
                .map((k) => (
                  <option key={k} value={k}>
                    {k.replace("_", " ")}
                  </option>
                ))}
            </select>
          </div>
        )}
      </div>

      {/* Notes */}
      {room.notes.length > 0 && (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-4">
          <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide mb-2">Notes</p>
          <ul className="space-y-1">
            {room.notes.map((note, i) => (
              <li key={i} className="text-xs text-[var(--text-secondary)] flex gap-2">
                <span className="text-[var(--accent-warm)]">•</span>
                {note}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RoomEditorPanel;
