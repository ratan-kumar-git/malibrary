import { differenceInDays, startOfDay } from "date-fns";

export interface ShiftAssignment {
  studentName: string;
  memberId: number | null;
  expiry: string | null;
  isDue: boolean;
}

export interface SeatShifts {
  [shiftName: string]: ShiftAssignment | null;
}

export interface SeatInfo {
  id: string;
  active: boolean;
  shifts: SeatShifts;
  seatNo?: number; // Optional for backwards compatibility
}

export interface SeatMapData {
  [floorName: string]: {
    [seatNo: string]: SeatInfo;
  };
}

export const SHIFT_KEYS = ["MORNING", "AFTERNOON", "EVENING", "NIGHT"];

export const getDaysRemaining = (endDateStr: string | null) => {
  if (!endDateStr) return null;
  const end = startOfDay(new Date(endDateStr));
  const today = startOfDay(new Date());
  const diffDays = differenceInDays(end, today);

  if (diffDays < 0) return { text: "Expired", days: diffDays, status: "expired" };
  if (diffDays === 0) return { text: "Expires today", days: 0, status: "expiring" };
  if (diffDays === 1) return { text: "Expires tomorrow", days: 1, status: "expiring" };
  return { text: `Expires in ${diffDays} days`, days: diffDays, status: "active" };
};

export const getSubscriptionStatus = (endDateStr: string | null): "active" | "expired" | "vacant" => {
  if (!endDateStr) return "vacant";
  const end = startOfDay(new Date(endDateStr));
  const today = startOfDay(new Date());
  const diffDays = differenceInDays(end, today);
  return diffDays < 0 ? "expired" : "active";
};

export const formatShiftName = (shift: string) => {
  return shift.replace("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
};