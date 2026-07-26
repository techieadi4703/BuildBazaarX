/**
 * SpacePlanning — Step 2 of 5 in the AI Interior journey.
 *
 * Loads a FloorPlanSpec from:
 *  1. location.state?.spec (passed from wizard)
 *  2. localStorage via localRepository.loadLatest()
 *  3. ?example=1 query param → loads customerExample fixture
 *
 * Falls back to /new-project on invalid/missing data.
 *
 * Now renders a STITCHED 2D house plan (HousePlanCanvas) instead
 * of the old individual room-card gallery.
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { customerExample } from "@/lib/floorplan/fixtures/customerExample";
import { FloorPlanSpecSchema, type FloorPlanSpec } from "@/lib/floorplan/schema";
import { localRepository } from "@/lib/floorplan/planRepository";
import { exportHousePlanSvg } from "@/lib/floorplan/exportSvg";
import HousePlanCanvas from "@/components/floorplan/HousePlanCanvas";
import RoomEditorPanel from "@/components/floorplan/RoomEditorPanel";
import { ArrowLeft, Download, Box, Check } from "lucide-react";

// ─── Autosave hook ────────────────────────────────────────────────────────────

function useAutosave(spec: FloorPlanSpec | null, delay = 800) {
  const [savedState, setSavedState] = useState<"idle" | "saving" | "saved">("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!spec) return;

    setSavedState("saving");
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      await localRepository.save(spec);
      setSavedState("saved");
      setTimeout(() => setSavedState("idle"), 2000);
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [spec, delay]);

  return savedState;
}

// ─── Main component ───────────────────────────────────────────────────────────

const SpacePlanning: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [spec, setSpec] = useState<FloorPlanSpec | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Ref to the stitched plan SVG for export
  const housePlanSvgRef = useRef<SVGSVGElement | null>(null);

  const savedState = useAutosave(spec);

  // ── Load spec ──────────────────────────────────────────────────────────────

  useEffect(() => {
    async function load() {
      setIsLoading(true);

      // ?example=1 → load customerExample
      const params = new URLSearchParams(location.search);
      if (params.get("example") === "1") {
        const parsed = FloorPlanSpecSchema.safeParse(customerExample);
        if (parsed.success) {
          setSpec(parsed.data);
          setSelectedRoomId(parsed.data.rooms[0]?.id ?? null);
          setIsLoading(false);
          return;
        }
      }

      // location.state?.spec from wizard
      const stateSpec = (location.state as { spec?: unknown } | null)?.spec;
      if (stateSpec) {
        const parsed = FloorPlanSpecSchema.safeParse(stateSpec);
        if (parsed.success) {
          setSpec(parsed.data);
          setSelectedRoomId(parsed.data.rooms[0]?.id ?? null);
          setIsLoading(false);
          return;
        } else {
          toast({
            title: "Invalid plan data",
            description: "Could not load the plan from the wizard. Starting fresh.",
            variant: "destructive",
          });
        }
      }

      // localStorage fallback
      const stored = await localRepository.loadLatest();
      if (stored) {
        setSpec(stored);
        setSelectedRoomId(stored.rooms[0]?.id ?? null);
        setIsLoading(false);
        return;
      }

      // Nothing found → redirect
      toast({
        title: "No plan found",
        description: "Please complete the requirements wizard first.",
      });
      navigate("/new-project");
    }

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Spec update handler ────────────────────────────────────────────────────

  const handleSpecChange = useCallback((newSpec: FloorPlanSpec) => {
    setSpec(newSpec);
  }, []);

  // ── Export full plan SVG ──────────────────────────────────────────────────

  function handleExportSvg() {
    if (!housePlanSvgRef.current || !spec) return;
    exportHousePlanSvg(housePlanSvgRef.current, spec.projectName);
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-[var(--accent-warm)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-[var(--text-secondary)]">Loading your floor plan…</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!spec) return null;

  return (
    <Layout>
      <div className="min-h-screen bg-[var(--bg-base)]">
        {/* ── Header bar ── */}
        <div className="sticky top-0 z-20 bg-[var(--bg-card)] border-b border-[var(--border-subtle)] shadow-[var(--shadow-sm)]">
          <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            {/* Left: back + title */}
            <div className="flex items-center gap-3 min-w-0">
              <Link
                to="/new-project"
                className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex-shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Requirements</span>
              </Link>
              <div className="h-4 w-px bg-[var(--border-default)]" />
              <div className="min-w-0">
                <h1 className="text-base font-bold text-[var(--text-primary)] truncate">
                  2D Floor Plan
                </h1>
                <p className="text-xs text-[var(--text-tertiary)]">
                  Step 2 of 5 — Review your floor plan
                </p>
              </div>
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Autosave indicator */}
              {savedState !== "idle" && (
                <span
                  className={[
                    "text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1 transition-all",
                    savedState === "saved"
                      ? "bg-[var(--success-bg)] text-[var(--success)]"
                      : "bg-[var(--bg-surface)] text-[var(--text-tertiary)]",
                  ].join(" ")}
                >
                  {savedState === "saved" && <Check className="w-3 h-3" />}
                  {savedState === "saving" ? "Saving…" : "Saved"}
                </span>
              )}

              {/* Export Plan SVG */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportSvg}
                className="rounded-full gap-1.5 text-xs"
                id="export-plan-svg-btn"
                title="Download full floor plan as SVG"
              >
                <Download className="w-3.5 h-3.5" />
                Export Plan
              </Button>

              {/* Generate 3D — coming soon */}
              <Button
                variant="ghost"
                size="sm"
                disabled
                className="rounded-full gap-1.5 text-xs opacity-50 cursor-not-allowed"
                id="generate-3d-btn"
                title="Generate 3D concepts — coming in the next step"
              >
                <Box className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">3D Concepts</span>
                <span className="text-[10px] bg-[var(--bg-surface)] rounded-full px-1 ml-0.5">soon</span>
              </Button>
            </div>
          </div>
        </div>

        {/* ── Main content ── */}
        <div className="max-w-screen-xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Stitched house plan (left / main) */}
            <div className="flex-1 min-w-0">
              <HousePlanCanvas
                spec={spec}
                selectedRoomId={selectedRoomId}
                onSelectRoom={setSelectedRoomId}
                svgRef={housePlanSvgRef}
              />
            </div>

            {/* Editor panel (right) */}
            <div className="w-full lg:w-80 xl:w-96 flex-shrink-0">
              <div className="lg:sticky lg:top-24">
                <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-[var(--shadow-md)] max-h-[calc(100vh-8rem)] overflow-y-auto">
                  <div className="p-4">
                    <RoomEditorPanel
                      spec={spec}
                      selectedRoomId={selectedRoomId}
                      onChange={handleSpecChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Project info footer ── */}
        <div className="max-w-screen-xl mx-auto px-4 pb-8">
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">{spec.projectName}</p>
              <p className="text-xs text-[var(--text-tertiary)]">
                {spec.rooms.length} room{spec.rooms.length !== 1 ? "s" : ""} · {spec.source} spec · v{spec.schemaVersion}
                {spec.orientationNote ? ` · ${spec.orientationNote}` : ""}
              </p>
            </div>
            <div className="flex gap-2">
              <Link to="/new-project">
                <Button variant="ghost" size="sm" className="rounded-full text-xs">
                  ← Back to requirements
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SpacePlanning;
