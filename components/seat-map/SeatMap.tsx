"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  Building2, Clock, MapPin, 
  RefreshCw, Calendar, User, X, ChevronLeft, 
  ChevronRight, Search, Info, TrendingUp, Zap
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// --- Interfaces ---
interface ShiftData {
  id: string;
  studentId: string;
  libraryId: string;
  startDate: string;
  endDate: string;
  seatNo: string;
  shift: string[];
  totalFee: number;
  feeDue: number;
  isActive: boolean;
}

interface SeatShifts {
  morning: ShiftData | null;
  afternoon: ShiftData | null;
  evening: ShiftData | null;
  fullDay: ShiftData | null;
}

interface SeatMapData {
  [floorName: string]: {
    [seatNo: string]: SeatShifts;
  };
}

export default function SeatMap() {
  const router = useRouter();
  
  // State
  const [seatMapData, setSeatMapData] = useState<SeatMapData>({});
  const [selectedFloor, setSelectedFloor] = useState<string>("");
  const [selectedShift, setSelectedShift] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [selectedSeat, setSelectedSeat] = useState<{ floor: string; seatNo: string; shifts: SeatShifts } | null>(null);
  
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate] = useState<Date>(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));


  // Fetch Data
  const loadSeatMapData = useCallback(async () => {
    try {
      setLoading(true);
      const start = startDate.toISOString().split("T")[0];
      const end = endDate.toISOString().split("T")[0];
      
      const response = await fetch(
        `/api/library/seat-map?startDate=${start}&endDate=${end}`
      );
      const data = await response.json();
      
      if (data.seatMap) {
        setSeatMapData(data.seatMap);
        const floors = Object.keys(data.seatMap);
        if (floors.length > 0 && !selectedFloor) {
          setSelectedFloor(floors[0]);
        }
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, selectedFloor]);

  useEffect(() => {
    loadSeatMapData();
  }, [loadSeatMapData]);

  // Logic: Determine if a seat is "Booked" based on the current shift filter
  const getSeatStatus = useCallback((shifts: SeatShifts) => {
    if (selectedShift === "all") {
      return Object.values(shifts).some(s => s !== null) ? "booked" : "available";
    }
    return shifts[selectedShift as keyof SeatShifts] ? "booked" : "available";
  }, [selectedShift]);

  // Memoized Floor & Seat Logic
  const floors = useMemo(() => Object.keys(seatMapData), [seatMapData]);
  
  const currentFloorSeats = useMemo(() => {
    if (!selectedFloor || !seatMapData[selectedFloor]) return [];
    return Object.entries(seatMapData[selectedFloor]).sort((a, b) => parseInt(a[0]) - parseInt(b[0]));
  }, [seatMapData, selectedFloor]);

  const stats = useMemo(() => {
    const total = currentFloorSeats.length;
    const booked = currentFloorSeats.filter(([, shifts]) => getSeatStatus(shifts) === "booked").length;
    return { total, booked, available: total - booked };
  }, [currentFloorSeats, getSeatStatus]);

  if (loading) return (
    <div className="max-w-7xl mx-auto p-4 space-y-8">
      <div className="h-32 bg-gradient-to-r from-slate-200 to-slate-100 rounded-2xl animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 p-6 min-h-[500px]">
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
            {[...Array(32)].map((_, i) => (
              <div key={i} className="aspect-square rounded-xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        </Card>
        <div className="space-y-4">
          <Card className="p-6 h-80 bg-slate-100 animate-pulse" />
        </div>
      </div>
    </div>
  );

  const shifts = [
    { id: "all", label: "View All", icon: Search },
    { id: "morning", label: "Morning", icon: Clock },
    { id: "afternoon", label: "Afternoon", icon: Clock },
    { id: "evening", label: "Evening", icon: Clock },
    { id: "fullDay", label: "Full Day", icon: Clock },
  ];

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <div className="">
          <div className="">
            <Select value={selectedFloor} onValueChange={setSelectedFloor}>
                  <SelectTrigger className="bg-white border-slate-200 focus:ring-2 focus:ring-primary/30 text-sm">
                    <div className="flex items-center gap-2">
                      <Building2 size={16} className="text-primary" />
                      <SelectValue placeholder="Select Floor" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {floors.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                  </SelectContent>
                </Select>
          </div>
          <div className="">
            
          </div>
        </div>

          {/* --- Top Control Bar: Floor (Left) & Date (Right) --- */}
          <Card className="p-4 md:p-6 shadow-md border-slate-200/60 bg-white/95 backdrop-blur-sm sticky top-4 z-20">
            <div className="grid grid-cols-2 gap-4 md:gap-6">
              {/* Floor Selection - Left */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">Floor Level</label>
                
              </div>

              {/* Date Selection - Right */}
              <div className="space-y-2 flex flex-col">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">Date Range</label>
                <Card className="p-2 flex items-center gap-1 bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200/60 flex-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={() => {
                        const newStart = new Date(startDate);
                        newStart.setMonth(startDate.getMonth() - 1);
                        setStartDate(newStart);
                      }} className="hover:bg-slate-200/50 h-8 w-8 p-0">
                        <ChevronLeft size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Previous Month</TooltipContent>
                  </Tooltip>
                  <div className="flex-1 px-2 md:px-4 text-xs md:text-sm font-bold text-slate-700 text-center">
                    {startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={() => {
                        const newStart = new Date(startDate);
                        newStart.setMonth(startDate.getMonth() + 1);
                        setStartDate(newStart);
                      }} className="hover:bg-slate-200/50 h-8 w-8 p-0">
                        <ChevronRight size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Next Month</TooltipContent>
                  </Tooltip>
                </Card>
              </div>
            </div>
          </Card>

          {/* --- Shift Tabs Row --- */}
          <Card className="p-3 md:p-4 shadow-md border-slate-200/60 bg-white/95 backdrop-blur-sm sticky top-24 z-20">
            <div className="flex flex-nowrap gap-2 md:gap-3 overflow-x-auto pb-2 md:pb-0">
              {shifts.map((shift) => {
                const ShiftIcon = shift.icon;
                const isSelected = selectedShift === shift.id;
                return (
                  <button
                    key={shift.id}
                    onClick={() => setSelectedShift(shift.id)}
                    className={`px-3 md:px-4 py-2 rounded-lg font-semibold text-xs md:text-sm transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap ${
                      isSelected
                        ? "bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg shadow-primary/30"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                    }`}
                  >
                    <ShiftIcon size={14} />
                    {shift.label}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* --- Stats Bar --- */}
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="p-3 md:p-4 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-lg border border-emerald-200 cursor-help shadow-sm">
                  <p className="text-[10px] font-bold text-emerald-600 uppercase">Available</p>
                  <p className="text-lg md:text-2xl font-black text-emerald-700">{stats.available}</p>
                </div>
              </TooltipTrigger>
              <TooltipContent>Available for booking</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="p-3 md:p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg border border-blue-200 cursor-help shadow-sm">
                  <p className="text-[10px] font-bold text-blue-600 uppercase">Booked</p>
                  <p className="text-lg md:text-2xl font-black text-blue-700">{stats.booked}</p>
                </div>
              </TooltipTrigger>
              <TooltipContent>Currently booked</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="p-3 md:p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-lg border border-slate-200 cursor-help shadow-sm">
                  <p className="text-[10px] font-bold text-slate-600 uppercase">Total</p>
                  <p className="text-lg md:text-2xl font-black text-slate-700">{stats.total}</p>
                </div>
              </TooltipTrigger>
              <TooltipContent>Total seats</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={loadSeatMapData} className="rounded-lg border-slate-200 hover:bg-slate-50 h-auto col-span-1">
                  <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh data</TooltipContent>
            </Tooltip>
          </div>

          {/* --- Occupancy Bar --- */}
          <Card className="p-3 md:p-4 bg-white/95 border-slate-200/60 shadow-md">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                  <TrendingUp size={14} /> Occupancy Rate
                </span>
                <span className="text-sm font-bold text-slate-900">{Math.round((stats.booked / stats.total) * 100)}%</span>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300" 
                  style={{ width: `${(stats.booked / stats.total) * 100}%` }}
                />
              </div>
            </div>
          </Card>

          {/* --- Main Content: Seat Grid (Left) & Details (Right) --- */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            
            {/* Left: Seat Grid */}
            <Card className="lg:col-span-2 p-4 md:p-8 border-slate-200 shadow-lg bg-gradient-to-br from-white to-slate-50">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 md:mb-8 gap-4">
                <div className="space-y-1">
                  <Badge variant="outline" className="px-4 py-1.5 border-slate-300 text-slate-600 bg-slate-100 font-semibold w-fit">
                    {selectedFloor} Layout
                  </Badge>
                  <p className="text-xs text-slate-500 font-medium">Interactive seating arrangement</p>
                </div>
                <div className="flex gap-2 md:gap-4 text-xs font-medium flex-wrap">
                  <span className="flex items-center gap-2 px-2 md:px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-200">
                    <div className="w-3 h-3 rounded-md bg-gradient-to-br from-emerald-400 to-emerald-500" /> Available
                  </span>
                  <span className="flex items-center gap-2 px-2 md:px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="w-3 h-3 rounded-md bg-gradient-to-br from-blue-500 to-blue-600" /> Booked
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-200 mb-6">
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-8 gap-2 md:gap-3">
                  {currentFloorSeats.map(([seatNo, shifts]) => {
                    const status = getSeatStatus(shifts);
                    const isSelected = selectedSeat?.seatNo === seatNo;
                    const bookingInfo = Object.entries(shifts).find(([, data]) => data !== null);

                    return (
                      <TooltipProvider key={seatNo}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => setSelectedSeat({ floor: selectedFloor, seatNo, shifts })}
                              className={`
                                group relative aspect-square rounded-lg md:rounded-xl border-2 flex flex-col items-center justify-center transition-all duration-300
                                ${status === 'booked' 
                                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40' 
                                  : 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-300 text-emerald-700 hover:border-emerald-400 hover:from-emerald-100 hover:to-emerald-200 shadow-sm'}
                                ${isSelected ? 'ring-4 ring-primary ring-offset-2 scale-110 z-10 shadow-2xl' : ''}
                              `}
                            >
                              <span className="text-xs md:text-sm font-black">{seatNo}</span>
                              {status === 'booked' ? (
                                <Zap size={12} className="opacity-70 mt-0.5" />
                              ) : (
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 group-hover:scale-150 transition-transform" />
                              )}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs text-xs">
                            <div className="space-y-1">
                              <p className="font-bold">Seat {seatNo}</p>
                              {status === 'booked' && bookingInfo ? (
                                <>
                                  <p className="text-blue-300">Booked • {bookingInfo[0]}</p>
                                </>
                              ) : (
                                <p className="text-emerald-300">Available</p>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-center">
                <div className="bg-gradient-to-r from-slate-100 to-slate-50 px-4 md:px-8 py-3 md:py-4 rounded-2xl border-2 border-dashed border-slate-300 text-slate-500 text-[10px] md:text-xs font-bold tracking-widest uppercase flex items-center gap-2">
                  <MapPin size={14} /> Main Entrance
                </div>
              </div>
            </Card>

            {/* Right: Detail Panel */}
            <div className="space-y-4">
              {selectedSeat ? (
                <Card className="p-5 md:p-6 border-primary/20 shadow-xl bg-gradient-to-b from-white to-slate-50/50 sticky top-64 md:top-80 animate-in slide-in-from-right-4 duration-300">
                  <div className="flex justify-between items-start mb-5 md:mb-6">
                    <div className="w-12 md:w-14 h-12 md:h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      <Info size={24} />
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedSeat(null)} className="h-8 w-8">
                      <X size={16} className="text-slate-400" />
                    </Button>
                  </div>

                  <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-1">Seat {selectedSeat.seatNo}</h2>
                  <p className="text-xs md:text-sm text-slate-500 mb-5 md:mb-6 font-medium">{selectedSeat.floor}</p>

                  <Separator className="my-5 md:my-6" />

                  <div className="space-y-5 md:space-y-6">
                    {(() => {
                      const shiftKey = selectedShift === "all" 
                        ? (Object.keys(selectedSeat.shifts).find(k => selectedSeat.shifts[k as keyof SeatShifts] !== null) as keyof SeatShifts)
                        : (selectedShift as keyof SeatShifts);
                      
                      const data = selectedSeat.shifts[shiftKey];

                      if (data) {
                        return (
                          <>
                            <div className="flex items-center justify-between">
                              <Badge className="bg-blue-600 text-white hover:bg-blue-700 px-3 text-xs">Occupied</Badge>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Shift: {shiftKey}</span>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-3 md:gap-4">
                              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                                  <User size={10} /> Occupant ID
                                </p>
                                <p className="font-mono text-xs md:text-sm text-slate-700 truncate">{data.studentId}</p>
                              </div>

                              <div className="flex gap-2">
                                <div className="flex-1 p-3 bg-white rounded-xl border border-slate-200">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Total Fee</p>
                                  <p className="font-bold text-slate-900 text-sm md:text-base">₹{data.totalFee}</p>
                                </div>
                                <div className={`flex-1 p-3 rounded-xl border ${data.feeDue > 0 ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Due</p>
                                  <p className={`font-bold text-sm md:text-base ${data.feeDue > 0 ? 'text-red-600' : 'text-emerald-600'}`}>₹{data.feeDue}</p>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2">
                               <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                                 <Calendar size={10} /> Validity
                               </p>
                               <p className="text-xs font-semibold text-slate-600">
                                 {new Date(data.startDate).toLocaleDateString()} — {new Date(data.endDate).toLocaleDateString()}
                               </p>
                            </div>

                            <Button className="w-full bg-slate-900 hover:bg-black text-white py-5 md:py-6 text-sm" disabled>
                              Manage Booking
                            </Button>
                          </>
                        );
                      } else {
                        return (
                          <div className="text-center py-4">
                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100 mb-4 text-xs">
                              Available
                            </Badge>
                            <p className="text-xs md:text-sm text-slate-500 mb-5 md:mb-6 px-2">
                              This seat is currently open for the <strong>{selectedShift === 'all' ? 'Morning' : selectedShift}</strong> shift.
                            </p>
                            <Button 
                              onClick={() => router.push(`/register?seat=${selectedSeat.seatNo}&floor=${selectedSeat.floor}`)}
                              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-5 md:py-6 shadow-lg shadow-emerald-100 text-sm"
                            >
                              Book Now
                            </Button>
                          </div>
                        );
                      }
                    })()}
                  </div>
                </Card>
              ) : (
                <Card className="p-8 md:p-12 border-dashed border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center text-center sticky top-64 md:top-80 min-h-96">
                  <div className="w-16 md:w-20 h-16 md:h-20 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-400 mb-4 md:mb-6 animate-pulse">
                    <Search size={32} />
                  </div>
                  <p className="text-slate-600 text-xs md:text-sm font-semibold leading-relaxed max-w-xs">
                    👋 Click on any seat to view details, student information, or start a new booking.
                  </p>
                </Card>
              )}
            </div>
          </div>
        </div>
    </TooltipProvider>
  );
}