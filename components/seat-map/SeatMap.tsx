"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { SeatMapHeader } from "@/components/seat-map/SeatMapHeader";
import { SeatGrid } from "@/components/seat-map/SeatGrid";
import { SeatDetails } from "@/components/seat-map/SeatDetails";
import { SeatInfo, SeatMapData } from "@/types/seatMapTypes";
import { SeatMapSkeleton } from "../skelton/SeatMapSkeleton";

interface SeatMapResponse {
  seatMap: SeatMapData;
  activeShifts: string[];
}

const fetchSeatMap = async (dateStr?: string): Promise<SeatMapResponse> => {
  if (!dateStr) return { seatMap: {}, activeShifts: [] };
  const response = await fetch(`/api/library/seat-map?date=${dateStr}`);
  if (!response.ok) throw new Error("Failed to fetch seat map");

  const data = await response.json();
  return {
    seatMap: data.seatMap || {},
    activeShifts: data.activeShifts || [],
  };
};

export default function SeatMapPage() {
  const [selectedFloor, setSelectedFloor] = useState<string>("");
  const [selectedShift, setSelectedShift] = useState<string>("ALL");
  const [selectedSeat, setSelectedSeat] = useState<{
    floorName: string;
    seatNo: string;
    data: SeatInfo;
  } | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );

  const dateStr = selectedDate?.toISOString().split("T")[0];

  const { data, isLoading } = useQuery({
    queryKey: ["seatMap", dateStr],
    queryFn: () => fetchSeatMap(dateStr),
    staleTime: 30 * 1000,
  });

  const seatMapData = useMemo(() => data?.seatMap || {}, [data?.seatMap]);
  const activeShifts = useMemo(
    () => data?.activeShifts || [],
    [data?.activeShifts],
  );
  const floors = useMemo(() => Object.keys(seatMapData), [seatMapData]);

  React.useEffect(() => {
    if (floors.length > 0 && !selectedFloor) {
      setSelectedFloor(floors[0]);
    }
  }, [floors, selectedFloor]);

  const currentFloorSeats = useMemo(() => {
    if (!selectedFloor || !seatMapData[selectedFloor]) return [];
    return Object.entries(seatMapData[selectedFloor]).sort(
      (a, b) => parseInt(a[0]) - parseInt(b[0]),
    );
  }, [seatMapData, selectedFloor]);

  if (isLoading) {
    return <SeatMapSkeleton />;
  }

  return (
    <>
      <SeatMapHeader
        floors={floors}
        selectedFloor={selectedFloor}
        setSelectedFloor={setSelectedFloor}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        selectedShift={selectedShift}
        setSelectedShift={setSelectedShift}
        onClearSeat={() => setSelectedSeat(null)}
        activeShifts={activeShifts}
      />

      <div className="flex flex-col xl:flex-row gap-8 items-start">
        <SeatGrid
          currentFloorSeats={currentFloorSeats}
          selectedSeat={selectedSeat}
          setSelectedSeat={setSelectedSeat}
          selectedFloor={selectedFloor}
          selectedShift={selectedShift}
          activeShifts={activeShifts}
        />

        <div className="w-full xl:w-105 shrink-0">
          <div className="sticky top-8">
            <SeatDetails
              selectedSeat={selectedSeat}
              onClose={() => setSelectedSeat(null)}
              selectedShift={selectedShift}
              activeShifts={activeShifts}
            />
          </div>
        </div>
      </div>
    </>
  );
}
