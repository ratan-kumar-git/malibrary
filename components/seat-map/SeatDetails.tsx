import React from "react";
import { X, Search, Info, User, CreditCard, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  SeatInfo,
  getDaysRemaining,
  formatShiftName,
} from "@/types/seatMapTypes"; // Removed SHIFT_KEYS
import { useRouter } from "next/navigation";

interface Props {
  selectedSeat: { floorName: string; data: SeatInfo } | null;
  onClose: () => void;
  selectedShift: string;
  activeShifts: string[]; // 👇 1. Added activeShifts prop
}

export function SeatDetails({ selectedSeat, onClose, selectedShift, activeShifts }: Props) {
  const router = useRouter();

  if (!selectedSeat) {
    return (
      <div className="h-75 border border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-center p-6 bg-muted/10">
        <div className="w-12 h-12 bg-background border border-border rounded-xl shadow-sm flex items-center justify-center text-muted-foreground mb-4">
          <Search size={20} />
        </div>
        <p className="text-sm text-muted-foreground max-w-50">
          Select a seat from the floor plan to view details.
        </p>
      </div>
    );
  }

  const { data, floorName } = selectedSeat;

  return (
    <div className="bg-background rounded-2xl p-6 border border-border shadow-sm animate-in fade-in slide-in-from-bottom-2">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Info size={20} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Seat {data.seatNo}
            </h2>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              {floorName}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-md text-muted-foreground hover:bg-muted transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <Separator className="my-4 bg-border/50" />

      {selectedShift === "ALL" ? (
        <div className="space-y-4 overflow-y-auto max-h-[60vh] pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border">
          <p className="text-sm font-medium text-foreground mb-2">
            Shift Details
          </p>
          <div className="space-y-4">
            {activeShifts.map((key) => {
              const shiftData = data.shifts[key as keyof typeof data.shifts];
              
              if (shiftData) {
                const daysRemaining = getDaysRemaining(shiftData.endDate);
                const isExpiringSoon =
                  daysRemaining.includes("today") ||
                  daysRemaining.includes("Expired");
                
                return (
                  <div
                    key={key}
                    className="p-4 rounded-xl border border-border bg-muted/10 shadow-sm space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-foreground">
                        {formatShiftName(key)}
                      </span>
                      <Badge className="bg-primary text-primary-foreground text-[10px]">
                        Booked
                      </Badge>
                    </div>
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center bg-background p-2 rounded-lg border border-border/50 text-xs">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <User size={12} /> {shiftData.studentName}
                        </span>
                        <span className="font-mono text-foreground font-medium">
                          {shiftData.studentId}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-background p-2 rounded-lg border border-border/50">
                          <span className="text-muted-foreground block mb-0.5">
                            Fee
                          </span>
                          <span className="font-semibold text-foreground">
                            ₹{shiftData.totalFee}
                          </span>
                        </div>
                        <div className="bg-background p-2 rounded-lg border border-border/50">
                          <span className="text-muted-foreground block mb-0.5">
                            Due
                          </span>
                          <span
                            className={cn(
                              "font-semibold",
                              shiftData.feeDue > 0
                                ? "text-destructive"
                                : "text-foreground",
                            )}
                          >
                            ₹{shiftData.feeDue}
                          </span>
                        </div>
                      </div>
                      <div
                        className={cn(
                          "flex items-center gap-2 p-2 rounded-lg text-xs font-medium border",
                          isExpiringSoon
                            ? "bg-destructive/10 text-destructive border-destructive/20"
                            : "bg-amber-500/10 text-amber-600 border-amber-500/20",
                        )}
                      >
                        <Timer size={14} />
                        {daysRemaining}
                      </div>
                    </div>
                  </div>
                );
              }
              
              return (
                <div
                  key={key}
                  className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 shadow-sm space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-foreground">
                      {formatShiftName(key)}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-emerald-600 border-emerald-200 bg-emerald-50 text-[10px]"
                    >
                      Available
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    className="w-full h-9 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                    onClick={() =>
                      router.push(
                        `/register?seatId=${data.seatId}&shift=${selectedShift}&date=${new Date().toISOString().split("T")[0]}`,
                      )
                    }
                  >
                    Book {formatShiftName(key)}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-6 mt-4">
          {(() => {
            // 👇 3. Look up the specific shift dynamically 
            const shiftData = data.shifts[selectedShift as keyof typeof data.shifts];

            if (shiftData) {
              const daysRemaining = getDaysRemaining(shiftData.endDate);
              const isExpiringSoon =
                daysRemaining.includes("today") ||
                daysRemaining.includes("Expired");
                
              return (
                <div className="space-y-6">
                  <Badge className="bg-primary text-primary-foreground">
                    Booked • {formatShiftName(selectedShift)}
                  </Badge>
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
                      <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1.5">
                        <User size={14} /> Student Info
                      </p>
                      <p className="font-medium text-foreground text-base">
                        {shiftData.studentName}
                      </p>
                      <p className="font-mono text-sm text-muted-foreground mt-1">
                        ID: {shiftData.studentId}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
                        <p className="text-xs text-muted-foreground mb-1">
                          Total Fee
                        </p>
                        <p className="font-semibold text-foreground">
                          ₹{shiftData.totalFee}
                        </p>
                      </div>
                      <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
                        <p className="text-xs text-muted-foreground mb-1">
                          Due
                        </p>
                        <p
                          className={cn(
                            "font-semibold",
                            shiftData.feeDue > 0
                              ? "text-destructive"
                              : "text-foreground",
                          )}
                        >
                          ₹{shiftData.feeDue}
                        </p>
                      </div>
                    </div>
                    <div
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-xl text-sm font-medium border",
                        isExpiringSoon
                          ? "bg-destructive/10 text-destructive border-destructive/20"
                          : "bg-amber-500/10 text-amber-600 border-amber-500/20",
                      )}
                    >
                      <Timer size={16} />
                      {daysRemaining}
                    </div>
                  </div>
                </div>
              );
            }
            
            return (
              <div className="py-6 text-center space-y-6 border border-emerald-500/20 bg-emerald-500/5 rounded-2xl">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-600 mb-2">
                  <CreditCard size={28} />
                </div>
                <div className="px-4">
                  <h3 className="text-lg font-medium text-foreground mb-1.5">
                    Seat Available
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Ready to book for the{" "}
                    <strong className="text-foreground font-medium">
                      {formatShiftName(selectedShift)}
                    </strong>{" "}
                    shift.
                  </p>
                </div>
                <div className="px-6 pb-2">
                  <Button
                    className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                    onClick={() =>
                      router.push(
                        `/register?seatId=${data.seatId}&shift=${selectedShift}&date=${new Date().toISOString().split("T")[0]}`,
                      )
                    }
                  >
                    Book Seat {data.seatNo}
                  </Button>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}