import { create } from 'zustand';
import { FloorPlan, Room } from './types';
import { samplePlan } from './samplePlan';

interface PlannerState {
  mode: '2d' | '3d';
  plan: FloorPlan;
  selectedRoomId: string | null;
  setMode: (mode: '2d' | '3d') => void;
  setPlan: (plan: FloorPlan) => void;
  setSelectedRoomId: (id: string | null) => void;
  updateRoom: (roomId: string, updates: Partial<Room>) => void;
  addRoom: (room: Room) => void;
  deleteRoom: (roomId: string) => void;
}

export const usePlannerStore = create<PlannerState>((set) => ({
  mode: '3d', // Start in 3D by default to match M1 behavior
  plan: samplePlan,
  selectedRoomId: null,
  setMode: (mode) => set({ mode }),
  setPlan: (plan) => set({ plan }),
  setSelectedRoomId: (id) => set({ selectedRoomId: id }),
  updateRoom: (roomId, updates) =>
    set((state) => ({
      plan: {
        ...state.plan,
        rooms: state.plan.rooms.map((r) =>
          r.id === roomId ? { ...r, ...updates } : r
        ),
      },
    })),
  addRoom: (room) =>
    set((state) => ({
      plan: { ...state.plan, rooms: [...state.plan.rooms, room] },
    })),
  deleteRoom: (roomId) =>
    set((state) => ({
      plan: {
        ...state.plan,
        rooms: state.plan.rooms.filter((r) => r.id !== roomId),
      },
      selectedRoomId: state.selectedRoomId === roomId ? null : state.selectedRoomId,
    })),
}));
