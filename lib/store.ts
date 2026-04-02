'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Library, Floor, Shift, LibraryFormState } from '@/lib/validations';

// Library Store
interface LibraryStore {
  // The current library details. Null if not loaded or if creating a new library.
  library: Library | null;
  isLoading: boolean;
  error: string | null;

  // State setters
  setLibrary: (library: Library) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;

  // API actions
  fetchLibrary: () => Promise<void>;
  updateLibrary: (updates: Partial<LibraryFormState>) => Promise<void>;
  createLibrary: (data: LibraryFormState) => Promise<void>;
}

export const useLibraryStore = create<LibraryStore>()(
  devtools((set) => ({
    library: null,
    isLoading: false,
    error: null,

    setLibrary: (library) => set({ library }),
    setError: (error) => set({ error }),
    setLoading: (loading) => set({ isLoading: loading }),

    fetchLibrary: async () => {
      set({ isLoading: true, error: null });
      try {
        const response = await fetch('/api/library');
        if (!response.ok) throw new Error('Failed to fetch library');
        const data = await response.json();
        set({ library: data });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        set({ error: message });
      } finally {
        set({ isLoading: false });
      }
    },

    updateLibrary: async (updates) => {
      set({ isLoading: true, error: null });
      try {
        const response = await fetch('/api/library', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
        if (!response.ok) throw new Error('Failed to update library');
        const data = await response.json();
        set({ library: data });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        set({ error: message });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    createLibrary: async (data) => {
      set({ isLoading: true, error: null });
      try {
        const response = await fetch('/api/library', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create library');
        const library = await response.json();
        set({ library });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        set({ error: message });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },
  }))
);

// Floors Store
interface FloorsStore {
  floors: Floor[];
  isLoading: boolean;
  error: string | null;
  setFloors: (floors: Floor[]) => void;
  addFloor: (floor: Floor) => void;
  updateFloor: (floorId: string, floor: Floor) => void;
  removeFloor: (floorId: string) => void;
  fetchFloors: (libraryId: string) => Promise<void>;
  createFloor: (libraryId: string, floor: Omit<Floor, 'id'>) => Promise<Floor>;
  updateFloorServer: (floorId: string, updates: Partial<Floor>) => Promise<void>;
  deleteFloorServer: (floorId: string) => Promise<void>;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useFloorsStore = create<FloorsStore>()(
  devtools((set) => ({
    floors: [],
    isLoading: false,
    error: null,

    setFloors: (floors) => set({ floors }),
    setError: (error) => set({ error }),
    setLoading: (loading) => set({ isLoading: loading }),

    addFloor: (floor) =>
      set((state) => ({ floors: [...state.floors, floor] })),

    updateFloor: (floorId, floor) =>
      set((state) => ({
        floors: state.floors.map((f) => (f.id === floorId ? floor : f)),
      })),

    removeFloor: (floorId) =>
      set((state) => ({
        floors: state.floors.filter((f) => f.id !== floorId),
      })),

    fetchFloors: async (libraryId) => {
      set({ isLoading: true, error: null });
      try {
        const response = await fetch(`/api/library/floors?libraryId=${libraryId}`);
        if (!response.ok) throw new Error('Failed to fetch floors');
        const data = await response.json();
        set({ floors: data });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        set({ error: message });
      } finally {
        set({ isLoading: false });
      }
    },

    createFloor: async (libraryId, floor) => {
      set({ isLoading: true, error: null });
      try {
        const response = await fetch('/api/library/floors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ libraryId, ...floor }),
        });
        if (!response.ok) throw new Error('Failed to create floor');
        const newFloor = await response.json();
        set((state) => ({ floors: [...state.floors, newFloor] }));
        return newFloor;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        set({ error: message });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    updateFloorServer: async (floorId, updates) => {
      set({ isLoading: true, error: null });
      try {
        const response = await fetch('/api/library/floors', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ floorId, ...updates }),
        });
        if (!response.ok) throw new Error('Failed to update floor');
        const updated = await response.json();
        set((state) => ({
          floors: state.floors.map((f) => (f.id === floorId ? updated : f)),
        }));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        set({ error: message });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    deleteFloorServer: async (floorId) => {
      set({ isLoading: true, error: null });
      try {
        const response = await fetch(`/api/library/floors?floorId=${floorId}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete floor');
        set((state) => ({
          floors: state.floors.filter((f) => f.id !== floorId),
        }));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        set({ error: message });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },
  }))
);

// Shifts Store
interface ShiftsStore {
  shifts: Shift[];
  isLoading: boolean;
  error: string | null;
  setShifts: (shifts: Shift[]) => void;
  fetchShifts: (libraryId: string) => Promise<void>;
  updateShiftServer: (shiftId: string, updates: Partial<Shift>) => Promise<void>;
  toggleShift: (shiftId: string) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useShiftsStore = create<ShiftsStore>()(
  devtools((set) => ({
    shifts: [],
    isLoading: false,
    error: null,

    setShifts: (shifts) => set({ shifts }),
    setError: (error) => set({ error }),
    setLoading: (loading) => set({ isLoading: loading }),

    fetchShifts: async (libraryId) => {
      set({ isLoading: true, error: null });
      try {
        const response = await fetch(`/api/library/shifts?libraryId=${libraryId}`);
        if (!response.ok) throw new Error('Failed to fetch shifts');
        const data = await response.json();
        set({ shifts: data });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        set({ error: message });
      } finally {
        set({ isLoading: false });
      }
    },

    updateShiftServer: async (shiftId, updates) => {
      set({ isLoading: true, error: null });
      try {
        const response = await fetch('/api/library/shifts', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ shiftId, ...updates }),
        });
        if (!response.ok) throw new Error('Failed to update shift');
        const updated = await response.json();
        set((state) => ({
          shifts: state.shifts.map((s) => (s.id === shiftId ? updated : s)),
        }));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        set({ error: message });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    toggleShift: (shiftId) =>
      set((state) => ({
        shifts: state.shifts.map((s) =>
          s.id === shiftId ? { ...s, active: !s.active } : s
        ),
      })),
  }))
);

// Facilities Store
interface FacilitiesStore {
  facilities: string[];
  isLoading: boolean;
  error: string | null;
  setFacilities: (facilities: string[]) => void;
  addFacility: (facility: string) => void;
  removeFacility: (facility: string) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useFacilitiesStore = create<FacilitiesStore>()(
  devtools((set) => ({
    facilities: [],
    isLoading: false,
    error: null,

    setFacilities: (facilities) => set({ facilities }),
    setError: (error) => set({ error }),
    setLoading: (loading) => set({ isLoading: loading }),

    addFacility: (facility) =>
      set((state) => {
        if (state.facilities.includes(facility)) return state;
        return { facilities: [...state.facilities, facility] };
      }),

    removeFacility: (facility) =>
      set((state) => ({
        facilities: state.facilities.filter((f) => f !== facility),
      })),
  }))
);
