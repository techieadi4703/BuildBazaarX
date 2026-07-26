/**
 * HousePlanCanvas — renders all rooms as one stitched 2D architectural plan.
 *
 * Features:
 *  - Single SVG canvas with all rooms placed at absolute coords
 *  - Thick exterior walls, thin shared interior walls
 *  - Door (quarter-circle swing), window (double-line), arch symbols
 *  - Fixture symbols per room (bed, sofa, WC, etc.)
 *  - Room labels centered with dimension annotation
 *  - Overall house dimension lines (width × depth)
 *  - Mouse-wheel zoom + drag to pan (no external lib)
 *  - Click room to select; selected room gets warm highlight
 *  - North arrow indicator
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { FloorPlanSpec, RoomSpec, Fixture, Opening } from "@/lib/floorplan/schema";
import type { HouseLayout, RoomLayout } from "@/lib/floorplan/layoutTypes";
import { buildHouseLayout } from "@/lib/floorplan/layoutEngine";
import { formatInches } from "@/lib/floorplan/units";

// ─── Constants ────────────────────────────────────────────────────────────────

const OUTER_WALL = 6;      // px stroke for exterior walls
const INNER_WALL = 2.5;    // px stroke for shared walls
const PADDING = 64;        // px canvas padding for dimension lines

// ─── Colours (CSS vars resolved at paint time) ───────────────────────────────

const C = {
  wall:      "#1a1a2e",
  floor:     "#f8f5f0",
  floorAlt:  "#f0ede8",
  accent:    "#c47d1a",
  accentFaint: "rgba(196,125,26,0.12)",
  selected:  "rgba(196,125,26,0.18)",
  dim:       "#6b7280",
  label:     "#374151",
  sub:       "#9ca3af",
  window:    "#4B84D8",
  door:      "#374151",
  fixture:   "rgba(196,125,26,0.15)",
  fixtureStroke: "#c47d1a",
};

// ─── Fixture symbol ───────────────────────────────────────────────────────────

function FixtureSym({ f, scale }: { f: Fixture; scale: number }) {
  const x = f.xIn * scale;
  const y = f.yIn * scale;
  const w = f.widthIn * scale;
  const d = f.depthIn * scale;
  const rx = 3;

  return (
    <g transform={`translate(${x},${y})`} aria-label={f.label ?? f.kind}>
      <rect width={w} height={d} rx={rx} fill={C.fixture} stroke={C.fixtureStroke} strokeWidth={0.8} />

      {f.kind === "sink" && (
        <ellipse cx={w/2} cy={d/2} rx={w*0.3} ry={d*0.35} fill="none" stroke={C.fixtureStroke} strokeWidth={0.8} />
      )}
      {f.kind === "hob" && (
        <>
          {[[0.28,0.3],[0.72,0.3],[0.28,0.7],[0.72,0.7]].map(([cx,cy],i) => (
            <circle key={i} cx={cx*w} cy={cy*d} r={Math.min(w,d)*0.13}
              fill="none" stroke={C.fixtureStroke} strokeWidth={0.8} />
          ))}
        </>
      )}
      {f.kind === "wc" && (
        <>
          <rect x={w*0.1} y={0} width={w*0.8} height={d*0.35} rx={2} fill={C.fixtureStroke} opacity={0.25} />
          <ellipse cx={w/2} cy={d*0.68} rx={w*0.38} ry={d*0.28} fill="none" stroke={C.fixtureStroke} strokeWidth={0.8} />
        </>
      )}
      {f.kind === "shower" && (
        <>
          <rect x={2} y={2} width={w-4} height={d-4} rx={rx} fill="none"
            stroke={C.fixtureStroke} strokeWidth={0.8} strokeDasharray="4 3" />
          <circle cx={w/2} cy={d/2} r={Math.min(w,d)*0.1} fill="none" stroke={C.fixtureStroke} strokeWidth={0.8} />
        </>
      )}
      {f.kind === "bed" && (
        <rect x={4} y={4} width={w-8} height={d*0.22} rx={3} fill={C.fixtureStroke} opacity={0.28} />
      )}
      {f.kind === "dining_table" && (
        <>
          {[[w/2,-7],[w/2,d+7],[-7,d/2],[w+7,d/2]].map(([cx,cy],i) => (
            <circle key={i} cx={cx} cy={cy} r={5} fill={C.fixture} stroke={C.fixtureStroke} strokeWidth={0.8} />
          ))}
        </>
      )}
      {f.kind === "sofa" && (
        <>
          {/* seat back */}
          <rect x={2} y={2} width={w-4} height={d*0.28} rx={3} fill={C.fixtureStroke} opacity={0.28} />
          {/* armrests */}
          <rect x={2} y={d*0.28} width={d*0.16} height={d*0.55} rx={2} fill={C.fixtureStroke} opacity={0.2} />
          <rect x={w-d*0.16-2} y={d*0.28} width={d*0.16} height={d*0.55} rx={2} fill={C.fixtureStroke} opacity={0.2} />
        </>
      )}
      {f.kind === "basin" && (
        <ellipse cx={w/2} cy={d*0.55} rx={w*0.36} ry={d*0.32}
          fill="none" stroke={C.fixtureStroke} strokeWidth={0.8} />
      )}
      {f.kind === "wardrobe" && (
        <>
          <line x1={w/2} y1={0} x2={w/2} y2={d} stroke={C.fixtureStroke} strokeWidth={0.8} opacity={0.5} />
          <circle cx={w/4} cy={d/2} r={3} fill="none" stroke={C.fixtureStroke} strokeWidth={0.8} />
          <circle cx={w*3/4} cy={d/2} r={3} fill="none" stroke={C.fixtureStroke} strokeWidth={0.8} />
        </>
      )}
      {f.kind === "tv_unit" && (
        <rect x={w*0.1} y={d*0.1} width={w*0.8} height={d*0.8} rx={2}
          fill="none" stroke={C.fixtureStroke} strokeWidth={0.8} />
      )}
      {f.kind === "study_desk" && (
        <line x1={0} y1={d} x2={w} y2={0} stroke={C.fixtureStroke} strokeWidth={0.8} opacity={0.4} />
      )}

      {f.label && (
        <text x={w/2} y={d/2} textAnchor="middle" dominantBaseline="middle"
          fontSize={Math.min(w,d)*0.22} fill={C.label} fontFamily="Inter,system-ui,sans-serif">
          {f.label.length > 10 ? f.label.slice(0,9)+"…" : f.label}
        </text>
      )}
    </g>
  );
}

// ─── Opening symbol ───────────────────────────────────────────────────────────

function OpeningSym({
  opening, roomW, roomD, scale,
}: { opening: Opening; roomW: number; roomD: number; scale: number }) {
  const w   = opening.widthIn * scale;
  const off = opening.offsetIn * scale;
  const rW  = roomW * scale;
  const rD  = roomD * scale;

  if (opening.type === "arch" || opening.type === "passage") {
    let x1=0,y1=0,x2=0,y2=0;
    switch (opening.wall) {
      case "north": x1=off;y1=0;x2=off+w;y2=0; break;
      case "south": x1=off;y1=rD;x2=off+w;y2=rD; break;
      case "west":  x1=0;y1=off;x2=0;y2=off+w; break;
      case "east":  x1=rW;y1=off;x2=rW;y2=off+w; break;
    }
    return <line x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={C.accent} strokeWidth={2} strokeDasharray="5 3" opacity={0.8} />;
  }

  if (opening.type === "window") {
    let x1=0,y1=0,x2=0,y2=0;
    let x1b=0,y1b=0,x2b=0,y2b=0;
    const gap = 3;
    switch (opening.wall) {
      case "north":
        x1=off;y1=0;x2=off+w;y2=0;
        x1b=off;y1b=gap;x2b=off+w;y2b=gap; break;
      case "south":
        x1=off;y1=rD;x2=off+w;y2=rD;
        x1b=off;y1b=rD-gap;x2b=off+w;y2b=rD-gap; break;
      case "west":
        x1=0;y1=off;x2=0;y2=off+w;
        x1b=gap;y1b=off;x2b=gap;y2b=off+w; break;
      case "east":
        x1=rW;y1=off;x2=rW;y2=off+w;
        x1b=rW-gap;y1b=off;x2b=rW-gap;y2b=off+w; break;
    }
    return (
      <g>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.window} strokeWidth={2.5} opacity={0.8} />
        <line x1={x1b} y1={y1b} x2={x2b} y2={y2b} stroke={C.window} strokeWidth={1.5} opacity={0.5} />
      </g>
    );
  }

  // Door with swing arc
  if (opening.type === "door") {
    const isNS = opening.wall === "north" || opening.wall === "south";
    const swingIn = opening.swing === "in";
    let hx=0,hy=0; // hinge point
    let lx2=0,ly2=0; // leaf end
    let arcEndX=0,arcEndY=0;

    switch (opening.wall) {
      case "north":
        hx=off; hy=0;
        lx2=off+w; ly2=0;
        arcEndX = swingIn ? hx : hx+w;
        arcEndY = swingIn ? w : w;
        break;
      case "south":
        hx=off+w; hy=rD;
        lx2=off; ly2=rD;
        arcEndX = swingIn ? hx-w : hx;
        arcEndY = rD - w;
        break;
      case "west":
        hx=0; hy=off;
        lx2=0; ly2=off+w;
        arcEndX = swingIn ? w : w;
        arcEndY = swingIn ? off : off+w;
        break;
      case "east":
        hx=rW; hy=off+w;
        lx2=rW; ly2=off;
        arcEndX = rW - w;
        arcEndY = swingIn ? off+w : off;
        break;
    }

    return (
      <g>
        {/* clear gap over wall — white rect */}
        <line x1={isNS ? off : (opening.wall==="west"?0:rW)}
              y1={isNS ? (opening.wall==="north"?0:rD) : off}
              x2={isNS ? off+w : (opening.wall==="west"?0:rW)}
              y2={isNS ? (opening.wall==="north"?0:rD) : off+w}
              stroke="white" strokeWidth={OUTER_WALL+2} />
        {/* door leaf */}
        <line x1={hx} y1={hy} x2={lx2} y2={ly2}
          stroke={C.door} strokeWidth={1.5} opacity={0.7} />
        {/* swing arc */}
        <path d={`M ${hx} ${hy} A ${w} ${w} 0 0 ${opening.swing==="in"?1:0} ${arcEndX} ${arcEndY}`}
          fill="none" stroke={C.dim} strokeWidth={0.8} strokeDasharray="4 3" opacity={0.6} />
      </g>
    );
  }

  return null;
}

// ─── Single room on the stitched plan ────────────────────────────────────────

function RoomOnPlan({
  layout, spec, isSelected, onClick, scale,
}: {
  layout: RoomLayout;
  spec: RoomSpec;
  isSelected: boolean;
  onClick: () => void;
  scale: number;
}) {
  const { x, y, w, h, outerWalls } = layout;

  const wallColor = isSelected ? C.accent : C.wall;
  const floorFill = isSelected ? C.selected : (layout.zone === "wet" ? C.floorAlt : C.floor);

  return (
    <g transform={`translate(${x},${y})`} onClick={onClick} style={{ cursor: "pointer" }}>
      {/* Floor */}
      <rect width={w} height={h} fill={floorFill} />

      {/* Fixtures */}
      {spec.fixtures.map((f) => (
        <FixtureSym key={f.id} f={f} scale={scale} />
      ))}

      {/* Openings (doors/windows) — rendered BEFORE wall strokes so gaps show */}
      {spec.openings.map((o) => (
        <OpeningSym key={o.id} opening={o} roomW={spec.widthIn} roomD={spec.depthIn} scale={scale} />
      ))}

      {/* Walls — draw each side with appropriate thickness */}
      {(["north","south","west","east"] as const).map((side) => {
        const isOuter = outerWalls[side];
        const sw = isOuter ? OUTER_WALL : INNER_WALL;
        const col = isSelected ? C.accent : C.wall;
        const opacity = isOuter ? 0.92 : 0.55;
        let x1=0,y1=0,x2=0,y2=0;
        switch(side) {
          case "north": x1=0;y1=0;x2=w;y2=0; break;
          case "south": x1=0;y1=h;x2=w;y2=h; break;
          case "west":  x1=0;y1=0;x2=0;y2=h; break;
          case "east":  x1=w;y1=0;x2=w;y2=h; break;
        }
        return (
          <line key={side} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={col} strokeWidth={sw} strokeOpacity={opacity}
            strokeLinecap="square" />
        );
      })}

      {/* Room label */}
      <text
        x={w/2} y={h/2 - 10}
        textAnchor="middle" dominantBaseline="middle"
        fontSize={Math.min(w,h)*0.1 < 9 ? 9 : Math.min(w,h)*0.1 > 14 ? 14 : Math.min(w,h)*0.1}
        fontWeight="600"
        fill={isSelected ? C.accent : C.label}
        fontFamily="Inter,system-ui,sans-serif"
        pointerEvents="none"
      >
        {layout.label}
      </text>
      {/* Dimension sub-label */}
      <text
        x={w/2} y={h/2 + 8}
        textAnchor="middle" dominantBaseline="middle"
        fontSize={8.5}
        fill={isSelected ? C.accent : C.sub}
        fontFamily="Inter,system-ui,sans-serif"
        pointerEvents="none"
      >
        {formatInches(spec.widthIn)} × {formatInches(spec.depthIn)}
      </text>
    </g>
  );
}

// ─── Dimension line ───────────────────────────────────────────────────────────

function DimLine({
  x1,y1,x2,y2,label,orient,
}: { x1:number;y1:number;x2:number;y2:number;label:string;orient:"h"|"v" }) {
  const midX = (x1+x2)/2, midY = (y1+y2)/2;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.dim} strokeWidth={1} />
      {/* end ticks */}
      {orient==="h" ? (
        <>
          <line x1={x1} y1={y1-5} x2={x1} y2={y1+5} stroke={C.dim} strokeWidth={1}/>
          <line x1={x2} y1={y2-5} x2={x2} y2={y2+5} stroke={C.dim} strokeWidth={1}/>
          <text x={midX} y={midY-8} textAnchor="middle" fontSize={10} fill={C.dim}
            fontFamily="Inter,system-ui,sans-serif">{label}</text>
        </>
      ) : (
        <>
          <line x1={x1-5} y1={y1} x2={x1+5} y2={y1} stroke={C.dim} strokeWidth={1}/>
          <line x1={x2-5} y1={y2} x2={x2+5} y2={y2} stroke={C.dim} strokeWidth={1}/>
          <text x={midX+14} y={midY} textAnchor="middle" dominantBaseline="middle"
            fontSize={10} fill={C.dim} fontFamily="Inter,system-ui,sans-serif"
            transform={`rotate(90,${midX+14},${midY})`}>{label}</text>
        </>
      )}
    </g>
  );
}

// ─── North arrow ──────────────────────────────────────────────────────────────

function NorthArrow({ x, y }: { x:number; y:number }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <circle r={18} fill="white" stroke={C.dim} strokeWidth={1} opacity={0.9} />
      <polygon points="0,-14 5,4 0,0 -5,4" fill={C.accent} />
      <polygon points="0,14 5,-4 0,0 -5,-4" fill={C.dim} opacity={0.4} />
      <text x={0} y={-18} textAnchor="middle" fontSize={9} fontWeight="700"
        fill={C.accent} fontFamily="Inter,system-ui,sans-serif">N</text>
    </g>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface HousePlanCanvasProps {
  spec: FloorPlanSpec;
  selectedRoomId: string | null;
  onSelectRoom: (id: string) => void;
  svgRef?: React.RefObject<SVGSVGElement | null>;
}

const HousePlanCanvas: React.FC<HousePlanCanvasProps> = ({
  spec,
  selectedRoomId,
  onSelectRoom,
  svgRef,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  // Derive wizard fields from snapshots
  const snap = spec.wizardSnapshot as Record<string, unknown> | undefined;
  const orientation = (snap?.orientation as "north"|"south"|"east"|"west") ?? "south";
  const bedroomPos  = (snap?.bedroomPosition as "clustered"|"spread") ?? "clustered";

  const layout: HouseLayout = buildHouseLayout(spec, orientation, bedroomPos);

  const svgW = layout.totalW + PADDING * 2;
  const svgH = layout.totalH + PADDING * 2;

  // ── Zoom controls ──
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.91;
    setZoom((z) => Math.min(4, Math.max(0.3, z * factor)));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: dragStart.current.panX + (e.clientX - dragStart.current.x),
      y: dragStart.current.panY + (e.clientY - dragStart.current.y),
    });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  // Fit-to-container on first render
  useEffect(() => {
    if (!containerRef.current) return;
    const cW = containerRef.current.clientWidth;
    const cH = containerRef.current.clientHeight;
    const fitZ = Math.min((cW - 32) / svgW, (cH - 32) / svgH, 1);
    setZoom(fitZ);
    setPan({ x: (cW - svgW * fitZ) / 2, y: (cH - svgH * fitZ) / 2 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spec.rooms.length]);

  // Build a map for quick spec lookup
  const specById = Object.fromEntries(spec.rooms.map((r) => [r.id, r]));

  // Overall house width/depth dimension strings
  const totalWidthLabel = formatInches(layout.totalW / layout.scale);
  const totalDepthLabel = formatInches(layout.totalH / layout.scale);

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Zoom toolbar */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-[var(--text-tertiary)] italic">
          2D floor plan — all rooms stitched · {spec.rooms.length} room{spec.rooms.length !== 1 ? "s" : ""}
          {spec.orientationNote ? ` · ${spec.orientationNote}` : ""}
        </p>
        <div className="flex items-center gap-1.5">
          <button
            id="zoom-out-btn"
            onClick={() => setZoom((z) => Math.max(0.3, z * 0.8))}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-[var(--bg-surface)] border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-card)] transition-colors text-sm font-bold"
            title="Zoom out"
          >−</button>
          <button
            id="zoom-reset-btn"
            onClick={() => {
              if (!containerRef.current) return;
              const cW = containerRef.current.clientWidth;
              const cH = containerRef.current.clientHeight;
              const fitZ = Math.min((cW - 32) / svgW, (cH - 32) / svgH, 1);
              setZoom(fitZ);
              setPan({ x: (cW - svgW * fitZ) / 2, y: (cH - svgH * fitZ) / 2 });
            }}
            className="px-2.5 h-7 flex items-center justify-center rounded-full bg-[var(--bg-surface)] border border-[var(--border-default)] text-[var(--text-tertiary)] hover:bg-[var(--bg-card)] transition-colors text-[10px] font-mono"
            title="Reset zoom"
          >{Math.round(zoom * 100)}%</button>
          <button
            id="zoom-in-btn"
            onClick={() => setZoom((z) => Math.min(4, z * 1.25))}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-[var(--bg-surface)] border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-card)] transition-colors text-sm font-bold"
            title="Zoom in"
          >+</button>
        </div>
      </div>

      {/* Canvas viewport */}
      <div
        ref={containerRef}
        id="house-plan-viewport"
        className="relative overflow-hidden rounded-2xl border-2 border-[var(--border-subtle)] bg-[var(--bg-base)] shadow-[var(--shadow-md)]"
        style={{ height: "62vh", minHeight: 400, cursor: isDragging ? "grabbing" : "grab" }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          style={{
            transform: `translate(${pan.x}px,${pan.y}px) scale(${zoom})`,
            transformOrigin: "0 0",
            willChange: "transform",
          }}
        >
          <svg
            ref={svgRef}
            width={svgW}
            height={svgH}
            viewBox={`0 0 ${svgW} ${svgH}`}
            role="img"
            aria-label={`2D floor plan for ${spec.projectName}`}
            style={{ display: "block", background: "#faf9f7" }}
          >
            {/* ── Background grid paper ── */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e8e4df" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width={svgW} height={svgH} fill="url(#grid)" />

            {/* ── Rooms group (offset by PADDING) ── */}
            <g transform={`translate(${PADDING},${PADDING})`}>
              {layout.rooms.map((roomLayout) => {
                const roomSpec = specById[roomLayout.roomId];
                if (!roomSpec) return null;
                return (
                  <RoomOnPlan
                    key={roomLayout.roomId}
                    layout={roomLayout}
                    spec={roomSpec}
                    isSelected={roomLayout.roomId === selectedRoomId}
                    onClick={() => onSelectRoom(roomLayout.roomId)}
                    scale={layout.scale}
                  />
                );
              })}

              {/* ── Overall house outline ── */}
              <rect
                x={0} y={0}
                width={layout.totalW} height={layout.totalH}
                fill="none"
                stroke={C.wall}
                strokeWidth={OUTER_WALL + 1}
                strokeOpacity={0.2}
                rx={2}
              />
            </g>

            {/* ── Dimension: width (top) ── */}
            <DimLine
              x1={PADDING} y1={PADDING - 32}
              x2={PADDING + layout.totalW} y2={PADDING - 32}
              label={totalWidthLabel}
              orient="h"
            />

            {/* ── Dimension: depth (right) ── */}
            <DimLine
              x1={PADDING + layout.totalW + 36} y1={PADDING}
              x2={PADDING + layout.totalW + 36} y2={PADDING + layout.totalH}
              label={totalDepthLabel}
              orient="v"
            />

            {/* ── North arrow ── */}
            <NorthArrow x={svgW - 30} y={30} />

            {/* ── Project name ── */}
            <text
              x={PADDING} y={svgH - 12}
              fontSize={9} fill={C.sub}
              fontFamily="Inter,system-ui,sans-serif"
            >
              {spec.projectName}
            </text>
          </svg>
        </div>
      </div>

      <p className="text-[10px] text-[var(--text-tertiary)] text-center">
        Scroll to zoom · Drag to pan · Click a room to select and edit
      </p>
    </div>
  );
};

export default HousePlanCanvas;
