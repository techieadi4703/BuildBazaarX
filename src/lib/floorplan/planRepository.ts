/**
 * Plan repository interface + localStorage implementation.
 *
 * The interface is async so a future Supabase implementation is a drop-in.
 * Data is stored under key "bbx.floorplan.v1".
 * Invalid or unparseable data returns null (graceful degradation).
 */

import { FloorPlanSpecSchema, type FloorPlanSpec } from "./schema";

const STORAGE_KEY = "bbx.floorplan.v1";

// ─── Interface ────────────────────────────────────────────────────────────────

export interface PlanRepository {
  save(spec: FloorPlanSpec): Promise<{ id: string }>;
  load(id: string): Promise<FloorPlanSpec | null>;
  loadLatest(): Promise<FloorPlanSpec | null>;
}

// ─── localStorage implementation ─────────────────────────────────────────────

type StoredEntry = {
  id: string;
  savedAt: string;
  spec: unknown;
};

type StorageMap = Record<string, StoredEntry>;

function readStorage(): StorageMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as StorageMap;
  } catch {
    return {};
  }
}

function writeStorage(map: StorageMap): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Silently swallow (e.g. private browsing quota exceeded)
  }
}

function safeParseSpec(raw: unknown): FloorPlanSpec | null {
  const result = FloorPlanSpecSchema.safeParse(raw);
  return result.success ? result.data : null;
}

export class LocalPlanRepository implements PlanRepository {
  async save(spec: FloorPlanSpec): Promise<{ id: string }> {
    const map = readStorage();
    // Use projectName + createdAt as a stable id
    const id = spec.createdAt;
    map[id] = { id, savedAt: new Date().toISOString(), spec };
    writeStorage(map);
    return { id };
  }

  async load(id: string): Promise<FloorPlanSpec | null> {
    const map = readStorage();
    const entry = map[id];
    if (!entry) return null;
    return safeParseSpec(entry.spec);
  }

  async loadLatest(): Promise<FloorPlanSpec | null> {
    const map = readStorage();
    const entries = Object.values(map);
    if (entries.length === 0) return null;
    // Most recently saved first
    entries.sort((a, b) => b.savedAt.localeCompare(a.savedAt));
    return safeParseSpec(entries[0].spec);
  }
}

// ─── Default singleton ────────────────────────────────────────────────────────

export const localRepository = new LocalPlanRepository();
