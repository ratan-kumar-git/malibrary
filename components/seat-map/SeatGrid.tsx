import React, { useMemo } from "react";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { differenceInDays, startOfDay } from "date-fns";
import { SeatInfo, getSubscriptionStatus } from "@/types/seatMapTypes"; // Cleaned up unused imports

interface Props {
  currentFloorSeats: [string, SeatInfo][];
  selectedSeat: { floorName: string; seatNo: string; data: SeatInfo } | null;
  setSelectedSeat: (seat: { floorName: string; seatNo: string; data: SeatInfo }) => void;
  selectedFloor: string;
  selectedShift: string;
  activeShifts: string[];
}

export function SeatGrid({
  currentFloorSeats,
  selectedSeat,
  setSelectedSeat,
  selectedFloor,
  selectedShift,
  activeShifts,
}: Props) {
  const isAllMode = selectedShift === "ALL";

  // --- Calculate Statistics with explicit Types ---
  const stats = useMemo<{ totalSlots: number; occupiedSlots: number; activeSeats: number }>(() => {
    let totalSlots = 0;
    let occupiedSlots = 0;
    let activeSeats = 0;

    currentFloorSeats.forEach(([, seatInfo]) => {
      // Only count active seats in total
      if (seatInfo.active) {
        activeSeats++;
        const shifts = seatInfo.shifts;

        if (isAllMode) {
          totalSlots += activeShifts.length;
          activeShifts.forEach((key) => {
            const shift = shifts[key];
            if (shift) {
              occupiedSlots++;
            }
          });
        } else {
          totalSlots += 1;
          const shift = shifts[selectedShift];
          if (shift) {
            occupiedSlots++;
          }
        }
      }
    });

    return { totalSlots, occupiedSlots, activeSeats };
  }, [currentFloorSeats, isAllMode, selectedShift, activeShifts]);

  return (
    <div className="flex-1 w-full bg-background rounded-2xl p-6 md:p-8 border border-border shadow-sm">
      {/* --- Map Legend --- */}
      <div className="flex flex-wrap gap-4 mb-6 text-xs font-medium text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-gray-400" /> Vacant
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500" /> Active
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-500" /> Expired
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500/50" /> Disabled
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 p-3 bg-muted/30 rounded-lg flex gap-6 text-xs font-medium text-muted-foreground">
        <div>Total Seats: <span className="text-foreground font-bold">{stats.activeSeats}</span></div>
        <div>Available: <span className="text-emerald-600 font-bold">{stats.totalSlots - stats.occupiedSlots}</span></div>
        <div>Booked: <span className="text-primary font-bold">{stats.occupiedSlots}</span></div>
      </div>

      {/* --- Interactive Grid --- */}
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-x-4 gap-y-8 mb-12">
        {currentFloorSeats.map(([seatNoStr, seatInfo]) => {
          const isSelected = selectedSeat?.data.id === seatInfo.id;
          const shifts = seatInfo.shifts;
          const seatNo = parseInt(seatNoStr);

          // Calculate subscription status for the seat
          let subscriptionStatus: "active" | "expired" | "vacant" = "vacant";
          let minExpireDays: number | null = null;

          if (isAllMode) {
            activeShifts.forEach((shiftKey) => {
              const shift = shifts[shiftKey];
              if (shift?.expiry) {
                const status = getSubscriptionStatus(shift.expiry);
                const end = startOfDay(new Date(shift.expiry));
                const today = startOfDay(new Date());
                const diff = differenceInDays(end, today);
                
                if (minExpireDays === null || diff < minExpireDays) {
                  minExpireDays = diff;
                  subscriptionStatus = status;
                }
              }
            });
          } else {
            const currentShiftData = shifts[selectedShift];
            if (currentShiftData?.expiry) {
              subscriptionStatus = getSubscriptionStatus(currentShiftData.expiry);
              minExpireDays = differenceInDays(
                startOfDay(new Date(currentShiftData.expiry)),
                startOfDay(new Date())
              );
            }
          }

          const isDisabled = !seatInfo.active;
          const isBooked = isAllMode 
            ? Object.values(shifts).some(s => s !== null)
            : !!shifts[selectedShift];

          return (
            <div key={seatNoStr} className="flex justify-center">
              <button
                disabled={isDisabled}
                onClick={() =>
                  !isDisabled && setSelectedSeat({ floorName: selectedFloor, seatNo: seatNoStr, data: seatInfo })
                }
                className={cn(
                  "relative flex flex-col items-center justify-end w-14 h-16 transition-all focus:outline-none group",
                  isDisabled && "cursor-not-allowed opacity-50",
                  isSelected && !isDisabled ? "scale-110 z-10" : !isDisabled && "hover:-translate-y-1"
                )}
              >
                {/* Expiry Days Badge */}
                {minExpireDays !== null && !isDisabled && (
                  <div
                    className={cn(
                      "absolute -top-2 -right-2 z-20 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-md border-2 border-background transition-transform",
                      isSelected ? "scale-110" : "",
                      minExpireDays < 0
                        ? "bg-red-500 text-white"
                        : minExpireDays <= 3
                          ? "bg-amber-500 text-white"
                          : "bg-emerald-500 text-white"
                    )}
                  >
                    {minExpireDays < 0 ? "0" : minExpireDays}
                  </div>
                )}

                {/* Seat Top */}
                <div
                  className={cn(
                    "w-8 h-2.5 rounded-t-full mb-1 transition-colors shadow-sm",
                    isDisabled
                      ? "bg-red-500/50"
                      : isSelected
                        ? "bg-primary"
                        : "bg-muted-foreground/30 group-hover:bg-muted-foreground/50"
                  )}
                />

                {/* Seat Body */}
                <div
                  className={cn(
                    "relative w-full h-12 rounded-xl flex items-center justify-center shadow-sm border-2 overflow-hidden transition-colors",
                    isDisabled && "bg-red-500/10 border-red-500/30 cursor-not-allowed",
                    !isDisabled && (
                      isSelected
                        ? "border-primary ring-4 ring-primary/20"
                        : "border-border/60"
                    ),
                    !isDisabled && isBooked && subscriptionStatus === "active"
                      ? "bg-emerald-500/20 border-emerald-500/40 hover:bg-emerald-500/30"
                      : !isDisabled && isBooked && subscriptionStatus === "expired"
                        ? "bg-amber-500/20 border-amber-500/40 hover:bg-amber-500/30"
                        : !isDisabled && !isBooked
                          ? "bg-gray-400/20 border-gray-400/40 hover:bg-gray-400/30"
                          : ""
                  )}
                >
                  {isAllMode ? (
                    <div className="absolute inset-0 flex flex-wrap gap-0.5 bg-background p-0.5">
                      {activeShifts.map((key) => {
                        const shift = shifts[key];
                        const status = shift ? getSubscriptionStatus(shift.expiry) : "vacant";
                        return (
                          <div
                            key={key}
                            className={cn(
                              "flex-1 min-w-[40%] rounded-[3px] transition-colors",
                              !shift
                                ? "bg-gray-400/30"
                                : status === "active"
                                  ? "bg-emerald-500"
                                  : "bg-amber-500"
                            )}
                          />
                        );
                      })}
                      <div className="absolute inset-0 m-auto w-7 h-7 bg-background rounded-full flex items-center justify-center shadow-sm border border-border/50">
                        <span className="text-xs font-bold text-foreground">
                          {seatNo}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span
                      className={cn(
                        "text-sm font-bold",
                        isDisabled
                          ? "text-red-600"
                          : isBooked
                            ? subscriptionStatus === "active"
                              ? "text-emerald-700"
                              : "text-amber-700"
                            : "text-gray-600"
                      )}
                    >
                      {seatNo}
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