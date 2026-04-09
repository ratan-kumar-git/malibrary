import React, { useMemo } from "react";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { differenceInDays, startOfDay } from "date-fns";
import { SeatInfo, SeatShifts, SHIFT_KEYS } from "@/types/seatMapTypes";

interface Props {
  currentFloorSeats: [string, SeatInfo][];
  selectedSeat: { floorName: string; data: SeatInfo } | null;
  setSelectedSeat: (seat: { floorName: string; data: SeatInfo }) => void;
  selectedFloor: string;
  selectedShift: string;
}

export function SeatGrid({
  currentFloorSeats,
  selectedSeat,
  setSelectedSeat,
  selectedFloor,
  selectedShift,
}: Props) {
  const isAllMode = selectedShift === "ALL";

  // --- Calculate Statistics ---
  const stats = useMemo(() => {
    let totalSlots = 0;
    let occupiedSlots = 0;

    currentFloorSeats.forEach(([, seatInfo]) => {
      const shifts = seatInfo.shifts;

      if (isAllMode) {
        totalSlots += 4;
        SHIFT_KEYS.forEach((key) => {
          const shift = shifts[key];
          if (shift) {
            occupiedSlots++;
          }
        });
      } else {
        totalSlots += 1;
        const shift = shifts[selectedShift as keyof SeatShifts];
        if (shift) {
          occupiedSlots++;
        }
      }
    });

    return { totalSlots, occupiedSlots };
  }, [currentFloorSeats, isAllMode, selectedShift]);

  return (
    <div className="flex-1 w-full bg-background rounded-2xl p-6 md:p-8 border border-border shadow-sm">
      {/* --- Map Legend --- */}
      <div className="flex justify-end gap-4 mb-6 text-xs font-medium text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-700" /> Total {stats.totalSlots}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Available {stats.totalSlots-stats.occupiedSlots}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-primary" /> Booked {stats.occupiedSlots}
        </div>
      </div>

      {/* --- Interactive Grid --- */}
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-x-4 gap-y-8 mb-12">
        {currentFloorSeats.map(([seatNoStr, seatInfo]) => {
          const isSelected = selectedSeat?.data.seatNo === seatInfo.seatNo;
          const shifts = seatInfo.shifts;

          let minExpireDays: number | null = null;

          if (isAllMode) {
            Object.values(shifts).forEach((shift) => {
              if (shift) {
                const end = startOfDay(new Date(shift.endDate));
                const today = startOfDay(new Date());
                const diff = differenceInDays(end, today);
                if (minExpireDays === null || diff < minExpireDays)
                  minExpireDays = diff;
              }
            });
          } else {
            const currentShiftData = shifts[selectedShift as keyof SeatShifts];
            if (currentShiftData) {
              minExpireDays = differenceInDays(
                startOfDay(new Date(currentShiftData.endDate)),
                startOfDay(new Date()),
              );
            }
          }

          const isBookedSingle =
            !isAllMode && !!shifts[selectedShift as keyof SeatShifts];

          return (
            <div key={seatNoStr} className="flex justify-center">
              <button
                onClick={() =>
                  setSelectedSeat({ floorName: selectedFloor, data: seatInfo })
                }
                className={cn(
                  "relative flex flex-col items-center justify-end w-14 h-16 transition-all focus:outline-none group",
                  isSelected ? "scale-110 z-10" : "hover:-translate-y-1",
                )}
              >
                {minExpireDays !== null && (
                  <div
                    className={cn(
                      "absolute -top-2 -right-2 z-20 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-md border-2 border-background transition-transform",
                      isSelected ? "scale-110" : "",
                      minExpireDays <= 3
                        ? "bg-destructive text-destructive-foreground"
                        : "bg-amber-500 text-white",
                    )}
                  >
                    {minExpireDays < 0 ? "0" : minExpireDays}
                  </div>
                )}

                <div
                  className={cn(
                    "w-8 h-2.5 rounded-t-full mb-1 transition-colors shadow-sm",
                    isSelected
                      ? "bg-primary"
                      : "bg-muted-foreground/30 group-hover:bg-muted-foreground/50",
                  )}
                />

                <div
                  className={cn(
                    "relative w-full h-12 rounded-xl flex items-center justify-center shadow-sm border-2 overflow-hidden transition-colors",
                    isSelected
                      ? "border-primary ring-4 ring-primary/20"
                      : "border-border/60",
                    !isAllMode && isBookedSingle
                      ? "bg-primary border-primary"
                      : !isAllMode && !isBookedSingle
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 hover:bg-emerald-500/20"
                        : "",
                  )}
                >
                  {isAllMode ? (
                    <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-0.5 bg-background p-0.5">
                      {SHIFT_KEYS.map((key) => (
                        <div
                          key={key}
                          className={cn(
                            "w-full h-full rounded-[3px]",
                            shifts[key] ? "bg-primary" : "bg-emerald-500/20",
                          )}
                        />
                      ))}
                      <div className="absolute inset-0 m-auto w-7 h-7 bg-background rounded-full flex items-center justify-center shadow-sm border border-border/50">
                        <span className="text-xs font-bold text-foreground">
                          {seatInfo.seatNo}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span
                      className={cn(
                        "text-sm font-bold",
                        isBookedSingle
                          ? "text-primary-foreground"
                          : "text-emerald-700",
                      )}
                    >
                      {seatInfo.seatNo}
                    </span>
                  )}
                </div>
              </button>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-muted/50 text-muted-foreground text-xs font-medium uppercase tracking-wider border border-border/50">
          <MapPin size={14} /> Main Entrance
        </div>
      </div>
    </div>
  );
}