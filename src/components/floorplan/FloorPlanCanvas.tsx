/**
 * FloorPlanCanvas — responsive CSS grid of RoomPlan cards.
 *
 * Shows all rooms of a FloorPlanSpec individually to scale.
 * Clicking a card selects the room (ring highlight in --accent-warm).
 *
 * Note: this is a room gallery, NOT a stitched house plan.
 * Full-plan stitching arrives with floor-plan scan import.
 */

import React from "react";
import type { FloorPlanSpec, RoomSpec } from "@/lib/floorplan/schema";
import RoomPlan from "./RoomPlan";

interface FloorPlanCanvasProps {
  spec: FloorPlanSpec;
  selectedRoomId: string | null;
  onSelectRoom: (roomId: string) => void;
  pxPerInch?: number;
}

const FloorPlanCanvas: React.FC<FloorPlanCanvasProps> = ({
  spec,
  selectedRoomId,
  onSelectRoom,
  pxPerInch = 2.2,
}) => {
  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Caption */}
      <p className="text-xs text-[var(--text-tertiary)] italic text-center">
        Rooms shown individually to scale; full-plan stitching arrives with floor-plan scan import.
      </p>

      {/* Room grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {spec.rooms.map((room: RoomSpec) => {
          const isSelected = room.id === selectedRoomId;
          return (
            <button
              key={room.id}
              type="button"
              id={`room-card-${room.id}`}
              aria-pressed={isSelected}
              aria-label={`Select room: ${room.label}`}
              onClick={() => onSelectRoom(room.id)}
              className={[
                "relative rounded-2xl overflow-hidden border-2 transition-all duration-200 cursor-pointer text-left",
                "bg-[var(--bg-card)] shadow-[var(--shadow-md)]",
                "hover:shadow-[var(--shadow-lg)] hover:scale-[1.01]",
                isSelected
                  ? "border-[var(--accent-warm)] ring-2 ring-[var(--accent-warm)] ring-offset-2"
                  : "border-[var(--border-subtle)] hover:border-[var(--accent-warm)]",
              ].join(" ")}
            >
              {/* Room label header */}
              <div
                className={[
                  "px-3 py-2 flex items-center justify-between",
                  isSelected
                    ? "bg-[var(--accent-warm-faint)] border-b border-[var(--accent-warm)]"
                    : "bg-[var(--bg-surface)] border-b border-[var(--border-subtle)]",
                ].join(" ")}
              >
                <span
                  className={[
                    "text-sm font-semibold",
                    isSelected
                      ? "text-[var(--accent-warm)]"
                      : "text-[var(--text-primary)]",
                  ].join(" ")}
                >
                  {room.label}
                </span>
                {room.confidenceFlags.length > 0 && (
                  <span
                    title={room.confidenceFlags.join("\n")}
                    className="inline-block w-2 h-2 rounded-full bg-[var(--warning)] ml-2 flex-shrink-0"
                  />
                )}
              </div>

              {/* SVG plan */}
              <div className="flex items-center justify-center p-2 overflow-auto bg-[var(--bg-base)]">
                <RoomPlan room={room} pxPerInch={pxPerInch} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FloorPlanCanvas;
