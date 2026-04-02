"use client";
import React, { useEffect, useState } from "react";
import { Save, ChevronRight, Home } from "lucide-react";
import { LibraryBasicDetails } from "@/components/settings/LibraryBasicDetails";
import { ShiftDetails } from "@/components/settings/ShiftDetails";
import InfrastructureSection from "@/components/settings/InfrastructureSection";
import { useLibraryStore, useFloorsStore, useShiftsStore, useFacilitiesStore } from "@/lib/store";

const LibrarySettingsMain = () => {
  const [isMounted, setIsMounted] = useState(false);

  // Zustand stores
  const { library, isLoading: libraryLoading, fetchLibrary, error: libraryError } = useLibraryStore();
  const { floors, isLoading: floorsLoading, fetchFloors, createFloor, updateFloorServer, deleteFloorServer } = useFloorsStore();
  const { shifts, isLoading: shiftsLoading, fetchShifts, updateShiftServer, toggleShift } = useShiftsStore();
  const { facilities, addFacility, removeFacility } = useFacilitiesStore();

  const isLoading = libraryLoading || floorsLoading || shiftsLoading;

  // Initial load
  useEffect(() => {
    const initializeData = async () => {
      try {
        await fetchLibrary();
      } catch (error) {
        console.error("Failed to initialize library:", error);
      }
    };

    initializeData();
    setIsMounted(true);
  }, [fetchLibrary]);

  // Fetch related data when library is loaded
  useEffect(() => {
    if (library?.id) {
      fetchFloors(library.id);
      fetchShifts(library.id);
      if (library.facilities) {
        useFacilitiesStore.setState({ facilities: library.facilities });
      }
    }
  }, [library?.id, fetchFloors, fetchShifts]);

  if (!isMounted) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (libraryError && !library) {
    return (
      <div className="w-full max-w-6xl mt-20 mx-auto p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Error loading library: {libraryError}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mt-20 mx-auto p-4 md:p-6 lg:p-8 space-y-8">
      <div className="flex items-center gap-2 text-slate-400">
        <Home size={14} />
        <ChevronRight size={14} />
        <span>Dashboard</span>
        <ChevronRight size={14} />
        <span className="text-indigo-600 font-medium">Settings</span>
      </div>

      {/* Section 1: Basic Information */}
      {library && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <LibraryBasicDetails
            data={library}
            isLoading={libraryLoading}
          />
        </div>
      )}

      {/* Section 2: Infrastructure (Facilities & Floors) */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        <InfrastructureSection
          floors={floors}
          facilities={facilities}
          onAddFloor={(name, totalSeats) => library ? createFloor(library.id, { name, totalSeats } as any) : Promise.reject('No library')}
          onUpdateFloor={(floorId, name, totalSeats) => updateFloorServer(floorId, { name, totalSeats })}
          onDeleteFloor={deleteFloorServer}
          onAddFacility={addFacility}
          onRemoveFacility={removeFacility}
          isLoading={isLoading}
        />
      </div>

      {/* Section 3: Shift & Pricing Details */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <ShiftDetails
          shifts={shifts}
          onUpdateShift={(shiftId, startTime, endTime, price) =>
            updateShiftServer(shiftId, { startTime, endTime, price })
          }
          onToggleShift={toggleShift}
          isLoading={isLoading}
        />
      </div>

      {/* Footer Save Button */}
      <div className="md:hidden pt-8">
        <button
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white p-4 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50"
        >
          <Save size={20} />
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default LibrarySettingsMain;
