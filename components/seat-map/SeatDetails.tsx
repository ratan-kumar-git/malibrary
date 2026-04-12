import React, { useState } from "react";
import { X, Search, Info, User, AlertCircle, Timer, Zap, Loader2, Trash2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  SeatInfo,
  getDaysRemaining,
  getSubscriptionStatus,
  formatShiftName,
} from "@/types/seatMapTypes";
import { useRouter } from "next/navigation";
import { formatMemberId } from "@/lib/helper";

interface Props {
  selectedSeat: { floorName: string; seatNo: string; data: SeatInfo } | null;
  onClose: () => void;
  selectedShift: string;
  activeShifts: string[];
  allShifts?: { name: string; isActive: boolean }[];
}

export function SeatDetails({ selectedSeat, onClose, selectedShift, activeShifts, allShifts = [] }: Props) {
  const router = useRouter();
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [renewLoading, setRenewLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  const handleDeleteSubscription = async (subscriptionId: string) => {
    if (!confirm('Are you sure you want to dissociate this seat? This will end the subscription.')) {
      return;
    }

    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/subscriptions/${subscriptionId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete subscription');
      }

      setActionMessage('Subscription dissociated successfully');
      setTimeout(() => {
        router.refresh();
        onClose();
      }, 1000);
    } catch (error) {
      setActionMessage(`Error: ${error instanceof Error ? error.message : 'Failed to delete'}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleRenewSubscription = async (subscriptionId: string) => {
    const months = prompt('Enter number of months to renew:', '1');
    if (!months) return;

    setRenewLoading(true);
    try {
      const res = await fetch(`/api/subscriptions/${subscriptionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ months: parseInt(months) }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to renew subscription');
      }

      const result = await res.json();
      setActionMessage(`Renewed for ${months} month(s)!`);
      setTimeout(() => {
        router.refresh();
      }, 1500);
    } catch (error) {
      setActionMessage(`Error: ${error instanceof Error ? error.message : 'Failed to renew'}`);
    } finally {
      setRenewLoading(false);
    }
  };


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

  const { data, floorName, seatNo } = selectedSeat;

  // Check if seat is disabled
  if (!data.active) {
    return (
      <div className="bg-background rounded-2xl p-6 border border-border shadow-sm animate-in fade-in slide-in-from-bottom-2">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-600">
              <AlertCircle size={20} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Seat {seatNo}
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

        <div className="py-8 text-center space-y-4 border border-red-500/20 bg-red-500/5 rounded-xl">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-500/10 text-red-600">
            <Zap size={24} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              Seat Unavailable
            </h3>
            <p className="text-sm text-muted-foreground">
              This seat is currently disabled and cannot be booked.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background rounded-2xl p-6 border border-border shadow-sm animate-in fade-in slide-in-from-bottom-2">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Info size={20} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Seat {seatNo}
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
          <p className="text-sm font-medium text-foreground mb-3">
            Shift Details
          </p>
          <div className="space-y-3">
            {(allShifts.length > 0 ? allShifts.map(s => s.name) : activeShifts).map((shiftName) => {
              const shiftData = data.shifts[shiftName];
              const shiftInfo = allShifts.find(s => s.name === shiftName);
              const isInactive = shiftInfo && !shiftInfo.isActive;

              if (shiftData) {
                const status = getSubscriptionStatus(shiftData.expiry);
                const daysInfo = getDaysRemaining(shiftData.expiry);

                return (
                  <div
                    key={shiftName}
                    className={cn(
                      "p-4 rounded-xl border shadow-sm space-y-3 transition-colors",
                      isInactive
                        ? "bg-slate-500/5 border-slate-500/30 opacity-60"
                        : status === "active"
                          ? "bg-emerald-500/10 border-emerald-500/30"
                          : "bg-amber-500/10 border-amber-500/30"
                    )}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-foreground">
                        {formatShiftName(shiftName)}
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={cn(
                            "text-[10px] font-bold",
                            isInactive
                              ? "bg-slate-500 text-white"
                              : status === "active"
                                ? "bg-emerald-500 text-white"
                                : "bg-amber-500 text-white"
                          )}
                        >
                          {isInactive ? "Inactive" : status === "active" ? "Active" : "Expired"}
                        </Badge>
                      </div>
                    </div>

                    {isInactive && (
                      <div className="text-xs text-muted-foreground bg-background/50 p-2 rounded border border-border/50">
                        ⚠️ This shift is inactive. Showing historical booking data.
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 bg-background p-2 rounded-lg border border-border/50 text-xs">
                        <User size={14} className="text-muted-foreground" />
                        <div className="flex-1">
                          <p className="text-muted-foreground">Student</p>
                          <p className="font-medium text-foreground">{shiftData.studentName}</p>
                        </div>
                      </div>

                      {shiftData.memberId && (
                        <div className="bg-background p-2 rounded-lg border border-border/50 text-xs">
                          <p className="text-muted-foreground mb-0.5">Member ID</p>
                          <button
                            onClick={() => router.push(`/student/${shiftData.studentId}`)}
                            className="font-mono font-bold text-primary hover:underline transition-colors"
                          >
                            {formatMemberId(shiftData.memberId)}
                          </button>
                        </div>
                      )}

                      {shiftData.expiry && (
                        <div
                          className={cn(
                            "flex items-center gap-2 p-2 rounded-lg text-xs font-medium border",
                            isInactive
                              ? "bg-slate-500/10 text-slate-700 border-slate-500/20"
                              : status === "active"
                                ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-700 border-amber-500/20"
                          )}
                        >
                          <Timer size={14} />
                          {daysInfo?.text || "No expiry"}
                        </div>
                      )}

                      {shiftData.isDue && (
                        <div className="flex items-center gap-2 p-2 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-700 border border-amber-500/20">
                          <AlertCircle size={14} />
                          Payment due
                        </div>
                      )}

                      {shiftData.subscriptionId && !isInactive && (
                        <div className="flex gap-1.5 pt-2 border-t border-border/30">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="flex-1 h-7 text-[11px]  text-destructive hover:bg-destructive/10"
                            disabled={deleteLoading || renewLoading}
                            onClick={() => handleDeleteSubscription(shiftData.subscriptionId!)}
                          >
                            {deleteLoading ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="flex-1 h-7 text-[11px] text-emerald-600 hover:bg-emerald-600/10"
                            disabled={deleteLoading || renewLoading}
                            onClick={() => handleRenewSubscription(shiftData.subscriptionId!)}
                          >
                            {renewLoading ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={shiftName}
                  className={cn(
                    "p-4 rounded-xl border shadow-sm space-y-3",
                    isInactive
                      ? "bg-gray-400/5 border-gray-400/20 opacity-60"
                      : "bg-gray-400/5 border-gray-400/20"
                  )}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-foreground">
                      {formatShiftName(shiftName)}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px]",
                        isInactive ? "text-gray-600" : "text-gray-600"
                      )}
                    >
                      {isInactive ? "Vacant (Inactive)" : "Vacant"}
                    </Badge>
                  </div>
                  {isInactive && (
                    <div className="text-xs text-amber-700 bg-amber-500/10 p-2 rounded border border-amber-500/20">
                      ⚠️ This shift is inactive. New bookings are not allowed.
                    </div>
                  )}
                  <Button
                    size="sm"
                    className={cn(
                      "w-full h-9 text-xs text-white shadow-sm",
                      isInactive
                        ? "bg-gray-400 cursor-not-allowed opacity-50"
                        : "bg-emerald-600 hover:bg-emerald-700"
                    )}
                    disabled={isInactive}
                    onClick={() =>
                      router.push(
                        `/booking?seatId=${data.id}&shift=${shiftName}&date=${new Date().toISOString().split("T")[0]}`
                      )
                    }
                  >
                    {isInactive ? "Cannot Book" : `Book ${formatShiftName(shiftName)}`}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-6 mt-4">
          {(() => {
            const shiftData = data.shifts[selectedShift];
            const shiftInfo = allShifts.find(s => s.name === selectedShift);
            const isInactive = shiftInfo && !shiftInfo.isActive;

            if (shiftData) {
              const status = getSubscriptionStatus(shiftData.expiry);
              const daysInfo = getDaysRemaining(shiftData.expiry);

              return (
                <div className="space-y-4">
                  <Badge
                    className={cn(
                      "text-sm font-bold",
                      isInactive
                        ? "bg-slate-500 text-white"
                        : status === "active"
                          ? "bg-emerald-500 text-white"
                          : "bg-amber-500 text-white"
                    )}
                  >
                    {isInactive ? "Inactive" : status === "active" ? "Active" : "Expired"} • {formatShiftName(selectedShift)}
                  </Badge>

                  {isInactive && (
                    <div className="text-xs text-amber-700 bg-amber-500/10 p-3 rounded border border-amber-500/20 flex items-start gap-2">
                      <AlertCircle size={14} className="mt-0.5 shrink-0" />
                      <span>This shift is inactive. Showing historical booking data.</span>
                    </div>
                  )}

                  <div className="space-y-3">
                    {/* Student Info Card */}
                    <div className={cn("p-4 rounded-xl border space-y-3", isInactive ? "bg-muted/10 border-border/30" : "bg-muted/30 border-border/50")}>
                      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide flex items-center gap-1.5 mb-2">
                        <User size={14} /> Student Info
                      </p>
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="font-semibold text-foreground text-base">
                          {shiftData.studentName}
                        </p>
                      </div>
                      {shiftData.memberId && (
                        <div>
                          <p className="text-sm text-muted-foreground">Member ID</p>
                          <button
                            onClick={() => router.push(`/student/${shiftData.studentId}`)}
                            className="font-mono font-bold text-lg text-primary hover:underline transition-colors"
                          >
                            {formatMemberId(shiftData.memberId)}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Expiry Info */}
                    {shiftData.expiry && (
                      <div
                        className={cn(
                          "flex items-start gap-3 p-4 rounded-xl border",
                          isInactive
                            ? "bg-slate-500/10 border-slate-500/30"
                            : status === "active"
                              ? "bg-emerald-500/10 border-emerald-500/30"
                              : "bg-amber-500/10 border-amber-500/30"
                        )}
                      >
                        <Timer
                          size={18}
                          className={cn(
                            "mt-0.5 shrink-0",
                            isInactive
                              ? "text-slate-600"
                              : status === "active"
                                ? "text-emerald-600"
                                : "text-amber-600"
                          )}
                        />
                        <div>
                          <p className={cn(
                            "text-sm font-semibold",
                            isInactive
                              ? "text-slate-700"
                              : status === "active"
                                ? "text-emerald-700"
                                : "text-amber-700"
                          )}>
                            {daysInfo?.text}
                          </p>
                          {daysInfo?.days !== undefined && (
                            <p className={cn(
                              "text-xs mt-1",
                              isInactive
                                ? "text-slate-600"
                                : status === "active"
                                  ? "text-emerald-600"
                                  : "text-amber-600"
                            )}>
                              {daysInfo.days} days to expiry
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Payment Due Alert */}
                    {shiftData.isDue && (
                      <div className="flex items-center gap-2 p-3 rounded-xl text-sm font-semibold bg-amber-500/10 text-amber-700 border border-amber-500/20">
                        <AlertCircle size={16} />
                        Payment due from this member
                      </div>
                    )}

                    {/* Action Message */}
                    {actionMessage && (
                      <div className={cn(
                        "p-3 rounded-xl text-sm font-medium border",
                        actionMessage.includes('Error')
                          ? "bg-red-500/10 text-red-700 border-red-500/20"
                          : "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
                      )}>
                        {actionMessage}
                      </div>
                    )}

                    {/* Subscription Management Card */}
                    {shiftData.subscriptionId && (
                      <div className="space-y-3 p-4 border-2 border-primary/30 bg-primary/5 rounded-xl">
                        <p className="text-xs font-bold text-primary uppercase tracking-wider">Subscription Actions</p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                            disabled={deleteLoading || renewLoading}
                            onClick={() => handleDeleteSubscription(shiftData.subscriptionId!)}
                          >
                            {deleteLoading ? (
                              <>
                                <Loader2 size={14} className="animate-spin" />
                                Removing...
                              </>
                            ) : (
                              <>
                                <Trash2 size={14} />
                                Dissociate
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700"
                            disabled={deleteLoading || renewLoading}
                            onClick={() => handleRenewSubscription(shiftData.subscriptionId!)}
                          >
                            {renewLoading ? (
                              <>
                                <Loader2 size={14} className="animate-spin" />
                                Renewing...
                              </>
                            ) : (
                              <>
                                <RotateCcw size={14} />
                                Renew
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            return (
              <div className={cn(
                "py-8 text-center space-y-4 rounded-xl border",
                isInactive
                  ? "bg-gray-400/5 border-gray-400/20"
                  : "border-emerald-500/20 bg-emerald-500/5"
              )}>
                <div className={cn(
                  "inline-flex items-center justify-center w-14 h-14 rounded-full",
                  isInactive
                    ? "bg-gray-400/10 text-gray-600"
                    : "bg-emerald-500/10 text-emerald-600"
                )}>
                  {isInactive ? <AlertCircle size={24} /> : <Search size={24} />}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    {isInactive ? "Shift Inactive" : "Seat Available"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isInactive
                      ? "This shift is no longer active. New bookings cannot be made."
                      : `Ready to book for the ${formatShiftName(selectedShift)} shift.`
                    }
                  </p>
                </div>
                {!isInactive && (
                  <Button
                    className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm mt-2"
                    onClick={() =>
                      router.push(
                        `/booking?seatId=${data.id}&shift=${selectedShift}&date=${new Date().toISOString().split("T")[0]}`
                      )
                    }
                  >
                    Book Seat {seatNo}
                  </Button>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}