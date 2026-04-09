import { differenceInDays, startOfDay } from "date-fns";

export interface ShiftData {
  id: string;
  studentId: string;
  studentName: string;
  memberId: string | null;
  phoneNumber: string;
  libraryId: string;
  startDate: string;
  endDate: string;
  seatNo: string;
  shift: string[];
  totalFee: number;
  feeDue: number;
  isActive: boolean;
}

export interface SeatShifts {
  MORNING: ShiftData | null;
  AFTERNOON: ShiftData | null;
  EVENING: ShiftData | null;
  NIGHT: ShiftData | null;
}

export interface SeatInfo {
  seatId: string;
  floorId: string;
  seatNo: number;
  shifts: SeatShifts;
}

export interface SeatMapData {
  [floorName: string]: {
    [seatNo: string]: SeatInfo;
  };
}

export const SHIFT_KEYS: (keyof SeatShifts)[] = ["MORNING", "AFTERNOON", "EVENING", "NIGHT"];

export const getDaysRemaining = (endDateStr: string) => {
  const end = startOfDay(new Date(endDateStr));
  const today = startOfDay(new Date());
  const diffDays = differenceInDays(end, today);

  if (diffDays < 0) return "Expired";
  if (diffDays === 0) return "Expires today";
  if (diffDays === 1) return "Expires tomorrow";
  return `Expires in ${diffDays} days`;
};

export const formatShiftName = (shift: string) => {
  return shift.replace("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
};