import React from "react";
import { Building2, Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Props {
  floors: string[];
  selectedFloor: string;
  setSelectedFloor: (f: string) => void;
  selectedDate: Date | undefined;
  setSelectedDate: (d: Date) => void;
  selectedShift: string;
  setSelectedShift: (s: string) => void;
  onClearSeat: () => void;
  activeShifts: string[]; 
}

const formatShiftLabel = (shift: string) => {
  return shift
    .replace("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

export function SeatMapHeader({ 
  floors, 
  selectedFloor, 
  setSelectedFloor, 
  selectedDate, 
  setSelectedDate, 
  selectedShift, 
  setSelectedShift, 
  onClearSeat,
  activeShifts
}: Props) {
  const shiftOptions = [
    { id: "ALL", label: "All Shifts" },
    ...activeShifts.map((shift) => ({
      id: shift,
      label: formatShiftLabel(shift),
    })),
  ];

  return (
    <header className="flex flex-col justify-between gap-6 pb-6 border-b border-border/50">
      <div className="flex justify-between items-center gap-4">
        <Select value={selectedFloor} onValueChange={setSelectedFloor}>
          <SelectTrigger className="bg-background border-border shadow-sm">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              <SelectValue placeholder="Floor" />
            </div>
          </SelectTrigger>
          <SelectContent>
            {floors.map((f) => (
              <SelectItem key={f} value={f}>{f}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="bg-background border-border justify-between shadow-sm">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-primary" />
                {selectedDate ? format(selectedDate, "MMM dd, yyyy") : "Select date"}
              </div>
              <ChevronDown className="w-4 h-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(day) => {
                if (day) {
                  setSelectedDate(day);
                  onClearSeat();
                }
              }}
              className="p-3"
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex gap-2 overflow-x-auto lg:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
        {shiftOptions.map((s) => (
          <button
            key={s.id}
            onClick={() => {
              setSelectedShift(s.id);
              onClearSeat();
            }}
            className={cn(
              "px-5 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap border",
              selectedShift === s.id
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-background text-muted-foreground border-border hover:bg-muted/50 hover:text-foreground"
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
    </header>
  );
}