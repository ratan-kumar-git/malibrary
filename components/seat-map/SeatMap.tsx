"use client";
import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { SeatMapData, SeatInfo } from "@/types/seatMapTypes";
import { SeatMapHeader } from "./SeatMapHeader";
import { SeatGrid } from "./SeatGrid";
import { SeatDetails } from "./SeatDetails";

const fetchSeatMap = async (dateStr?: string): Promise<SeatMapData> => {
  if (!dateStr) return {};
  const response = await fetch(`/api/library/seat-map?date=${dateStr}`);
  if (!response.ok) throw new Error("Failed to fetch seat map");
  const data = await response.json();
  return data.seatMap || {};
};

export default function SeatMap() {
  const [selectedFloor, setSelectedFloor] = useState<string>("");
  const [selectedShift, setSelectedShift] = useState<string>("ALL");
  const [selectedSeat, setSelectedSeat] = useState<{
    floorName: string;
    data: SeatInfo;
  } | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );

  const dateStr = selectedDate?.toISOString().split("T")[0];

  const { data: seatMapData = {}, isLoading } = useQuery({
    queryKey: ["seatMap", dateStr],
    queryFn: () => fetchSeatMap(dateStr),
    staleTime: 30 * 1000,
  });

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
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground animate-pulse">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm tracking-widest uppercase">
          Loading Floor Plan...
        </p>
      </div>
    );
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
      />

      <div className="flex flex-col xl:flex-row gap-8 items-start">
        <SeatGrid
          currentFloorSeats={currentFloorSeats}
          selectedSeat={selectedSeat}
          setSelectedSeat={setSelectedSeat}
          selectedFloor={selectedFloor}
          selectedShift={selectedShift}
        />

        <div className="w-full xl:w-95 shrink-0">
          <div className="sticky top-8">
            <SeatDetails
              selectedSeat={selectedSeat}
              onClose={() => setSelectedSeat(null)}
              selectedShift={selectedShift}
            />
          </div>
        </div>
      </div>
    </>
  );
}
