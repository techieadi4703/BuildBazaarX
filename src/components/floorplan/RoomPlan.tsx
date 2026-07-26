/**
 * RoomPlan — renders ONE RoomSpec as a to-scale SVG.
 * Pure function of props; no internal state.
 */

import React from "react";
import type { RoomSpec, Fixture, Opening } from "@/lib/floorplan/schema";
import { inchesToPx, formatInches } from "@/lib/floorplan/units";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RoomPlanProps {
  room: RoomSpec;
  pxPerInch?: number;
  svgRef?: React.RefObject<SVGSVGElement | null>;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_SCALE = 2.2;
const PADDING = 32; // px around the room for labels

// ─── Fixture symbols ─────────────────────────────────────────────────────────

function FixtureSymbol({ f, scale }: { f: Fixture; scale: number }) {
  const x = inchesToPx(f.xIn, scale);
  const y = inchesToPx(f.yIn, scale);
  const w = inchesToPx(f.widthIn, scale);
  const d = inchesToPx(f.depthIn, scale);

  const fill = "var(--accent-warm-faint)";
  const stroke = "var(--accent-warm)";
  const labelColor = "var(--text-secondary)";
  const rx = 4;

  return (
    <g transform={`translate(${x},${y})`} role="img" aria-label={f.label ?? f.kind}>
      {/* Base rect */}
      <rect width={w} height={d} rx={rx} fill={fill} stroke={stroke} strokeWidth={1} />

      {/* Kind-specific details */}
      {f.kind === "sink" && (
        <ellipse
          cx={w / 2}
          cy={d / 2}
          rx={w * 0.3}
          ry={d * 0.35}
          fill="none"
          stroke={stroke}
          strokeWidth={1}
        />
      )}

      {f.kind === "hob" && (
        <>
          {[[0.28, 0.3], [0.72, 0.3], [0.28, 0.7], [0.72, 0.7]].map(([cx, cy], i) => (
            <circle
              key={i}
              cx={cx * w}
              cy={cy * d}
              r={Math.min(w, d) * 0.13}
              fill="none"
              stroke={stroke}
              strokeWidth={1}
            />
          ))}
        </>
      )}

      {f.kind === "wc" && (
        <>
          {/* Tank */}
          <rect x={w * 0.1} y={0} width={w * 0.8} height={d * 0.35} rx={2} fill={stroke} opacity={0.3} />
          {/* Bowl */}
          <ellipse cx={w / 2} cy={d * 0.68} rx={w * 0.38} ry={d * 0.28} fill="none" stroke={stroke} strokeWidth={1} />
        </>
      )}

      {f.kind === "shower" && (
        <>
          <rect
            x={2} y={2} width={w - 4} height={d - 4}
            rx={rx}
            fill="none"
            stroke={stroke}
            strokeWidth={1}
            strokeDasharray="4 3"
          />
          {/* Drain circle */}
          <circle cx={w / 2} cy={d / 2} r={Math.min(w, d) * 0.1} fill="none" stroke={stroke} strokeWidth={1} />
        </>
      )}

      {f.kind === "bed" && (
        /* Pillow band at top */
        <rect x={4} y={4} width={w - 8} height={d * 0.22} rx={3} fill={stroke} opacity={0.3} />
      )}

      {f.kind === "dining_table" && (
        <>
          {/* Chair circles around */}
          {[
            [w / 2, -8],
            [w / 2, d + 8],
            [-8, d / 2],
            [w + 8, d / 2],
          ].map(([cx, cy], i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={6}
              fill={fill}
              stroke={stroke}
              strokeWidth={1}
            />
          ))}
        </>
      )}

      {f.kind === "basin" && (
        <ellipse
          cx={w / 2}
          cy={d * 0.55}
          rx={w * 0.36}
          ry={d * 0.32}
          fill="none"
          stroke={stroke}
          strokeWidth={1}
        />
      )}

      {/* Label */}
      {f.label && (
        <text
          x={w / 2}
          y={d / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={11}
          fill={labelColor}
          fontFamily="Inter, system-ui, sans-serif"
        >
          {f.label.length > 10 ? f.label.slice(0, 9) + "…" : f.label}
        </text>
      )}
    </g>
  );
}

// ─── Opening symbols ─────────────────────────────────────────────────────────

function OpeningSymbol({
  opening,
  roomWidthIn,
  roomDepthIn,
  wallThicknessIn,
  scale,
}: {
  opening: Opening;
  roomWidthIn: number;
  roomDepthIn: number;
  wallThicknessIn: number;
  scale: number;
}) {
  const w = inchesToPx(opening.widthIn, scale);
  const offset = inchesToPx(opening.offsetIn, scale);
  const wt = inchesToPx(wallThicknessIn, scale);
  const roomW = inchesToPx(roomWidthIn, scale);
  const roomD = inchesToPx(roomDepthIn, scale);

  let x1 = 0, y1 = 0, x2 = 0, y2 = 0;
  let swingCx = 0, swingCy = 0;
  let startAngle = 0;

  switch (opening.wall) {
    case "north":
      x1 = offset; y1 = 0; x2 = offset + w; y2 = 0;
      swingCx = opening.swing === "in" ? offset : offset + w;
      swingCy = opening.swing === "in" ? w : w;
      startAngle = opening.swing === "in" ? 0 : 180;
      break;
    case "south":
      x1 = offset; y1 = roomD; x2 = offset + w; y2 = roomD;
      swingCx = opening.swing === "in" ? offset : offset + w;
      swingCy = roomD;
      startAngle = opening.swing === "in" ? 270 : 90;
      break;
    case "west":
      x1 = 0; y1 = offset; x2 = 0; y2 = offset + w;
      swingCx = 0;
      swingCy = opening.swing === "in" ? offset : offset + w;
      startAngle = opening.swing === "in" ? 90 : 270;
      break;
    case "east":
      x1 = roomW; y1 = offset; x2 = roomW; y2 = offset + w;
      swingCx = roomW;
      swingCy = opening.swing === "in" ? offset : offset + w;
      startAngle = opening.swing === "in" ? 90 : 270;
      break;
  }

  const isArch = opening.type === "arch" || opening.type === "passage";
  const isDoor = opening.type === "door";

  // Arch: dashed line across gap
  if (isArch) {
    return (
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke="var(--accent-warm)"
        strokeWidth={2}
        strokeDasharray="5 3"
        opacity={0.8}
      />
    );
  }

  // Door: gap + quarter-circle swing arc
  if (isDoor && opening.swing !== "none") {
    const r = w;
    const endX = swingCx + r * Math.cos(((startAngle + 90) * Math.PI) / 180);
    const endY = swingCy + r * Math.sin(((startAngle + 90) * Math.PI) / 180);
    return (
      <g>
        {/* Door leaf */}
        <line
          x1={swingCx} y1={swingCy}
          x2={opening.wall === "north" || opening.wall === "south" ? swingCx + w : swingCx}
          y2={opening.wall === "north" || opening.wall === "south" ? swingCy : swingCy + w}
          stroke="var(--text-primary)"
          strokeWidth={1.5}
          opacity={0.5}
        />
        {/* Swing arc */}
        <path
          d={`M ${swingCx} ${swingCy} A ${r} ${r} 0 0 1 ${endX} ${endY}`}
          fill="none"
          stroke="var(--text-secondary)"
          strokeWidth={1}
          strokeDasharray="4 3"
          opacity={0.6}
        />
      </g>
    );
  }

  // Plain window or door without swing
  return (
    <line
      x1={x1} y1={y1} x2={x2} y2={y2}
      stroke="var(--accent-mid, #4B84D8)"
      strokeWidth={3}
      opacity={0.7}
    />
  );
}

// ─── Confidence dot ───────────────────────────────────────────────────────────

function ConfidenceDot({ flags, x, y }: { flags: string[]; x: number; y: number }) {
  if (flags.length === 0) return null;
  return (
    <g>
      <circle cx={x} cy={y} r={5} fill="var(--warning, #C47D1A)">
        <title>{flags.join("\n")}</title>
      </circle>
    </g>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const RoomPlan: React.FC<RoomPlanProps> = ({
  room,
  pxPerInch = DEFAULT_SCALE,
  svgRef,
}) => {
  const scale = pxPerInch;
  const roomW = inchesToPx(room.widthIn, scale);
  const roomD = inchesToPx(room.depthIn, scale);
  const wallPx = inchesToPx(room.wallThicknessIn, scale);

  const svgW = roomW + PADDING * 2;
  const svgH = roomD + PADDING * 2;

  // Dimension label strings
  const widthLabel = formatInches(room.widthIn);
  const depthLabel = formatInches(room.depthIn);

  return (
    <svg
      ref={svgRef}
      width={svgW}
      height={svgH}
      viewBox={`0 0 ${svgW} ${svgH}`}
      role="img"
      aria-label={`Floor plan of ${room.label}`}
      style={{ display: "block", maxWidth: "100%" }}
    >
      {/* Offset group so room origin is at (PADDING, PADDING) */}
      <g transform={`translate(${PADDING},${PADDING})`}>
        {/* ── Floor fill ── */}
        <rect
          width={roomW}
          height={roomD}
          fill="var(--bg-surface)"
          stroke="none"
        />

        {/* ── Wall strokes (four sides) ── */}
        {/* North */}
        <line x1={0} y1={0} x2={roomW} y2={0} stroke="var(--text-primary)" strokeWidth={wallPx} strokeOpacity={0.85} />
        {/* South */}
        <line x1={0} y1={roomD} x2={roomW} y2={roomD} stroke="var(--text-primary)" strokeWidth={wallPx} strokeOpacity={0.85} />
        {/* West */}
        <line x1={0} y1={0} x2={0} y2={roomD} stroke="var(--text-primary)" strokeWidth={wallPx} strokeOpacity={0.85} />
        {/* East */}
        <line x1={roomW} y1={0} x2={roomW} y2={roomD} stroke="var(--text-primary)" strokeWidth={wallPx} strokeOpacity={0.85} />

        {/* ── Openings (rendered over walls to create gaps visually) ── */}
        {room.openings.map((opening) => (
          <OpeningSymbol
            key={opening.id}
            opening={opening}
            roomWidthIn={room.widthIn}
            roomDepthIn={room.depthIn}
            wallThicknessIn={room.wallThicknessIn}
            scale={scale}
          />
        ))}

        {/* ── Fixtures ── */}
        {room.fixtures.map((f) => (
          <FixtureSymbol key={f.id} f={f} scale={scale} />
        ))}

        {/* ── Dimension: width label below ── */}
        <g>
          {/* horizontal dimension line */}
          <line x1={0} y1={roomD + 16} x2={roomW} y2={roomD + 16} stroke="var(--text-tertiary)" strokeWidth={1} />
          <line x1={0} y1={roomD + 12} x2={0} y2={roomD + 20} stroke="var(--text-tertiary)" strokeWidth={1} />
          <line x1={roomW} y1={roomD + 12} x2={roomW} y2={roomD + 20} stroke="var(--text-tertiary)" strokeWidth={1} />
          <text
            x={roomW / 2}
            y={roomD + 28}
            textAnchor="middle"
            fontSize={11}
            fill="var(--text-secondary)"
            fontFamily="Inter, system-ui, sans-serif"
          >
            {widthLabel}
          </text>
        </g>

        {/* ── Dimension: depth label right ── */}
        <g>
          <line x1={roomW + 16} y1={0} x2={roomW + 16} y2={roomD} stroke="var(--text-tertiary)" strokeWidth={1} />
          <line x1={roomW + 12} y1={0} x2={roomW + 20} y2={0} stroke="var(--text-tertiary)" strokeWidth={1} />
          <line x1={roomW + 12} y1={roomD} x2={roomW + 20} y2={roomD} stroke="var(--text-tertiary)" strokeWidth={1} />
          <text
            x={roomW + 28}
            y={roomD / 2}
            textAnchor="start"
            dominantBaseline="middle"
            fontSize={11}
            fill="var(--text-secondary)"
            fontFamily="Inter, system-ui, sans-serif"
          >
            {depthLabel}
          </text>
        </g>

        {/* ── Confidence dot (top-right corner) ── */}
        <ConfidenceDot
          flags={room.confidenceFlags}
          x={roomW - 8}
          y={8}
        />
      </g>
    </svg>
  );
};

export default RoomPlan;
