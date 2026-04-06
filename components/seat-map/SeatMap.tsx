"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
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
import {
  Building2,
  Users,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Calendar,
  User,
  LogOut,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Seat {
  id: string;
  seatNo: number;
  floor: string;
  floorId: string;
  status: "available" | "booked" | "occupied";
  studentName?: string;
  shift?: string;
  endTime?: string;
  isActive: boolean;
}

interface Floor {
  id: string;
  name: string;
  seats: Seat[];
}

export function SeatMap() {
  const [allFloorsData, setAllFloorsData] = useState<Floor[]>([]);
  const [selectedFloorId, setSelectedFloorId] = useState<string | null>(null);
  const [selectedShift, setSelectedShift] = useState("all");
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [bookingFloorId, setBookingFloorId] = useState<string | null>(null);

  // Fetch all data at once
  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/library/seat-map");
      if (!response.ok) throw new Error("Failed to fetch data");
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setAllFloorsData(data.data);
        if (data.data.length > 0) {
          setSelectedFloorId(data.data[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Get current floor data
  const currentFloor = useMemo(
    () => allFloorsData.find((f) => f.id === selectedFloorId),
    [allFloorsData, selectedFloorId]
  );

  // Filter seats based on selected shift (client-side)
  const filteredSeats = useMemo(() => {
    if (!currentFloor) return [];
    
    if (selectedShift === "all") {
      return currentFloor.seats;
    }
    
    return currentFloor.seats.filter((seat) => seat.shift === selectedShift);
  }, [currentFloor, selectedShift]);

  // Calculate statistics
  const seatStats = useMemo(() => {
    const seats = currentFloor?.seats || [];
    return {
      available: seats.filter((s) => s.status === "available").length,
      booked: seats.filter((s) => s.status === "booked").length,
      occupied: seats.filter((s) => s.status === "occupied").length,
      total: seats.length,
    };
  }, [currentFloor]);

  const getSeatColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-emerald-100 hover:bg-emerald-200 text-emerald-700 border-emerald-300";
      case "booked":
        return "bg-blue-100 hover:bg-blue-200 text-blue-700 border-blue-300";
      case "occupied":
        return "bg-red-100 hover:bg-red-200 text-red-700 border-red-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available":
        return <CheckCircle2 size={14} className="text-emerald-600" />;
      case "booked":
        return <Clock size={14} className="text-blue-600" />;
      case "occupied":
        return <XCircle size={14} className="text-red-600" />;
      default:
        return <AlertCircle size={14} className="text-gray-600" />;
    }
  };

  const handleSeatClick = (seat: Seat) => {
    if (seat.status === "available") {
      setSelectedSeat(seat);
      setBookingFloorId(seat.floorId);
    }
  };

  const handleBookSeat = () => {
    if (selectedSeat && bookingFloorId) {
      router.push(
        `/register?seat=${selectedSeat.seatNo}&floor=${bookingFloorId}`
      );
    }
  };

  const handleRefresh = async () => {
    await loadAllData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Loading seat map...</p>
        </div>
      </div>
    );
  }

  if (allFloorsData.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center">
          <Building2 size={48} className="mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg text-muted-foreground">No library setup found</p>
          <p className="text-sm text-muted-foreground mt-2">
            Please complete your library setup first
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Library Seat Map</h1>
        <p className="text-gray-600">View and book available seats in your library</p>
      </div>

      {/* Controls Card */}
      <Card className="p-6 border-0 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-end lg:justify-between">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Floor Selector */}
            <div className="space-y-2 min-w-48">
              <label className="block text-sm font-semibold text-gray-700">
                <Building2 size={16} className="inline mr-2" />
                Select Floor
              </label>
              <Select value={selectedFloorId || ""} onValueChange={setSelectedFloorId}>
                <SelectTrigger className="w-full border-gray-300">
                  <SelectValue placeholder="Choose a floor" />
                </SelectTrigger>
                <SelectContent>
                  {allFloorsData.map((floor) => (
                    <SelectItem key={floor.id} value={floor.id}>
                      {floor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Shift Filter */}
            <div className="space-y-2 min-w-48">
              <label className="block text-sm font-semibold text-gray-700">
                <Clock size={16} className="inline mr-2" />
                Filter by Shift
              </label>
              <Select value={selectedShift} onValueChange={setSelectedShift}>
                <SelectTrigger className="w-full border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Shifts</SelectItem>
                  <SelectItem value="MORNING">Morning</SelectItem>
                  <SelectItem value="AFTERNOON">Afternoon</SelectItem>
                  <SelectItem value="EVENING">Evening</SelectItem>
                  <SelectItem value="NIGHT">Night</SelectItem>
                  <SelectItem value="FULL_DAY">Full Day</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleRefresh}
            disabled={loading}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border-0 shadow-sm bg-emerald-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-600 font-medium">Available</p>
              <p className="text-2xl font-bold text-emerald-700">
                {seatStats.available}
              </p>
            </div>
            <CheckCircle2 size={32} className="text-emerald-200" />
          </div>
        </Card>
        <Card className="p-4 border-0 shadow-sm bg-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Booked</p>
              <p className="text-2xl font-bold text-blue-700">
                {seatStats.booked}
              </p>
            </div>
            <Clock size={32} className="text-blue-200" />
          </div>
        </Card>
        <Card className="p-4 border-0 shadow-sm bg-red-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Occupied</p>
              <p className="text-2xl font-bold text-red-700">
                {seatStats.occupied}
              </p>
            </div>
            <XCircle size={32} className="text-red-200" />
          </div>
        </Card>
        <Card className="p-4 border-0 shadow-sm bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total</p>
              <p className="text-2xl font-bold text-gray-700">
                {seatStats.total}
              </p>
            </div>
            <Users size={32} className="text-gray-200" />
          </div>
        </Card>
      </div>

      {/* Seat Map */}
      <Card className="p-8 border-0 shadow-sm">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {currentFloor?.name}
          </h2>
          <p className="text-gray-600">
            {filteredSeats.length > 0
              ? `${filteredSeats.length} seat${filteredSeats.length !== 1 ? "s" : ""} available`
              : "No seats available"}
          </p>
        </div>

        {/* Entrance Badge */}
        <div className="flex justify-center mb-6">
          <Badge className="bg-blue-100 text-blue-700 border-blue-200 border">
            <MapPin size={14} className="mr-2" />
            Entrance / Exit
          </Badge>
        </div>

        {/* Seat Grid */}
        {filteredSeats.length > 0 ? (
          <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2 p-6 bg-gray-50 rounded-xl border border-gray-200">
            {filteredSeats.map((seat) => (
              <button
                key={seat.id}
                onClick={() => handleSeatClick(seat)}
                disabled={seat.status !== "available"}
                title={`Seat ${seat.seatNo} - ${seat.status}`}
                className={`
                  relative aspect-square rounded-lg border-2 font-bold text-xs transition-all duration-200 flex items-center justify-center group
                  ${getSeatColor(seat.status)}
                  ${
                    selectedSeat?.id === seat.id
                      ? "ring-2 ring-primary ring-offset-2 scale-110 shadow-lg"
                      : ""
                  }
                  ${seat.status === "available" ? "hover:scale-110 cursor-pointer shadow-md" : "cursor-not-allowed opacity-75"}
                `}
              >
                <span className="font-bold">{seat.seatNo}</span>
                <div className="absolute -top-1.5 -right-1.5 bg-white rounded-full p-0.5 shadow-sm">
                  {getStatusIcon(seat.status)}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500 text-center">
              No seats match the selected filter
            </p>
          </div>
        )}

        {/* Legend */}
        <div className="mt-8 flex flex-wrap gap-6 justify-center pt-6 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center">
              <CheckCircle2 size={12} className="text-emerald-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-100 border-2 border-blue-300 flex items-center justify-center">
              <Clock size={12} className="text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-red-100 border-2 border-red-300 flex items-center justify-center">
              <XCircle size={12} className="text-red-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">Occupied</span>
          </div>
        </div>
      </Card>

      {/* Seat Details Modal */}
      {selectedSeat && (
        <Card className="p-6 border-0 shadow-md bg-linear-to-r from-emerald-50 to-blue-50">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MapPin size={24} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Seat {selectedSeat.seatNo}
                  </h3>
                  <p className="text-sm text-gray-600">{selectedSeat.floor}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-xs text-gray-600 font-medium mb-1">Status</p>
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 border capitalize">
                    {selectedSeat.status}
                  </Badge>
                </div>
                {selectedSeat.shift && (
                  <div>
                    <p className="text-xs text-gray-600 font-medium mb-1">
                      Shift
                    </p>
                    <Badge variant="outline">{selectedSeat.shift}</Badge>
                  </div>
                )}
              </div>

              {selectedSeat.studentName && (
                <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-600 font-medium mb-1">
                    <User size={14} className="inline mr-1" />
                    Currently Assigned
                  </p>
                  <p className="font-medium text-gray-900">
                    {selectedSeat.studentName}
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 w-full sm:w-auto">
              <Button
                onClick={handleBookSeat}
                size="lg"
                className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Users size={18} />
                <span className="hidden sm:inline">Book Seat</span>
              </Button>
              <Button
                onClick={() => setSelectedSeat(null)}
                variant="outline"
                size="lg"
                className="gap-2"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Close</span>
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
