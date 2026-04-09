"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  CalendarDays,
  Building2,
  Clock,
  CheckCircle2,
  Wallet,
} from "lucide-react";
import { addMonths, format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const fetchSeatDetails = async (seatId: string | null, dateStr?: string) => {
  if (!seatId) return null;
  
  const queryDate = dateStr || new Date().toISOString().split("T")[0];
  const response = await fetch(`/api/seat-map/details?seatId=${seatId}&date=${queryDate}`);
  
  if (!response.ok) throw new Error("Failed to fetch seat details");
  
  return response.json(); 
};

function BookingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const seatId = searchParams.get("seatId");
  const shift = searchParams.get("shift") || "MORNING";

  // --- Form State ---
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("MALE");
  const [address, setAddress] = useState("");
  
  const [durationMonths, setDurationMonths] = useState(1);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [amountPaid, setAmountPaid] = useState<number | "">("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Seat Info based on URL param
  const { data: seatInfo, isLoading: isFetchingSeat } = useQuery({
    queryKey: ["seatDetails", seatId],
    queryFn: () => fetchSeatDetails(seatId),
    enabled: !!seatId,
  });

  // --- Derived State ---
  const endDate = addMonths(startDate, durationMonths);
  const totalFee = (seatInfo?.pricePerMonth || 0) * durationMonths;
  const paid = Number(amountPaid) || 0;
  const balanceDue = Math.max(0, totalFee - paid);

  const formatShiftName = (s: string) => 
    s.replace("_", " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase());

  // --- Submit Handler ---
  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      seatId,
      shift,
      student: { name, phone, gender, address },
      subscription: {
        startDate,
        endDate,
        totalAmount: totalFee,
        amountPaid: paid,
      }
    };

    try {
      // Replace with your actual POST endpoint
      // await fetch('/api/bookings', { method: 'POST', body: JSON.stringify(payload) });
      
      console.log("Submitting:", payload);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Fake network delay
      
      // Navigate back to the seat map after successful booking
      router.push("/");
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isFetchingSeat) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground animate-pulse">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm tracking-widest uppercase">Loading Booking Details...</p>
      </div>
    );
  }

  if (!seatId || !seatInfo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <MapPin size={48} className="text-muted-foreground/50" />
        <h2 className="text-xl font-semibold">No Seat Selected</h2>
        <p className="text-muted-foreground text-sm">Please select a seat from the floor plan to start a booking.</p>
        <Button onClick={() => router.push("/")} variant="outline" className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Floor Plan
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-[1200px] mx-auto">
      
      {/* LEFT COLUMN: Booking Summary Panel */}
      <div className="lg:col-span-4 space-y-6 sticky top-8">
        <Button 
          onClick={() => router.back()} 
          variant="ghost" 
          className="text-muted-foreground hover:text-foreground pl-0 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" /> Back to map
        </Button>

        <div className="bg-background rounded-3xl p-8 border border-border shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
            <CheckCircle2 size={24} />
          </div>
          
          <h2 className="text-2xl font-light text-foreground mb-1">Booking Summary</h2>
          <p className="text-sm text-muted-foreground mb-8">Review the seat and shift details before registering the student.</p>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 border border-border/50">
              <div className="flex items-center gap-3 text-muted-foreground">
                <MapPin size={18} />
                <span className="text-sm font-medium">Seat Number</span>
              </div>
              <span className="text-lg font-bold text-foreground">{seatInfo.seatNo}</span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 border border-border/50">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Building2 size={18} />
                <span className="text-sm font-medium">Floor</span>
              </div>
              <span className="text-sm font-semibold text-foreground">{seatInfo.floorName}</span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-primary/5 border border-primary/10">
              <div className="flex items-center gap-3 text-primary">
                <Clock size={18} />
                <span className="text-sm font-medium">Selected Shift</span>
              </div>
              <Badge className="bg-primary text-primary-foreground">{formatShiftName(shift)}</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Registration Form */}
      <div className="lg:col-span-8 bg-background rounded-3xl p-8 md:p-10 border border-border shadow-sm">
        <form onSubmit={handleBooking} className="space-y-10">
          
          {/* SECTION 1: Student Information */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <User className="text-primary w-5 h-5" />
              <h3 className="text-lg font-semibold text-foreground">Student Details</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Full Name</label>
                <input 
                  required
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter student's name"
                  className="w-full h-12 px-4 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input 
                    required
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter phone number"
                    className="w-full h-12 pl-10 pr-4 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Gender</label>
                <select 
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Address (Optional)</label>
                <input 
                  type="text" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="City, Area"
                  className="w-full h-12 px-4 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>
            </div>
          </section>

          <Separator className="bg-border/50" />

          {/* SECTION 2: Subscription & Payment */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <CalendarDays className="text-primary w-5 h-5" />
              <h3 className="text-lg font-semibold text-foreground">Subscription & Payment</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Duration (Months)</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 6].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setDurationMonths(m)}
                      className={cn(
                        "flex-1 h-12 rounded-xl font-medium text-sm transition-all border",
                        durationMonths === m 
                          ? "bg-primary text-primary-foreground border-primary shadow-sm" 
                          : "bg-background text-muted-foreground border-border hover:bg-muted/50"
                      )}
                    >
                      {m}M
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Calculated End Date</label>
                <div className="w-full h-12 px-4 rounded-xl border border-border bg-muted/20 flex items-center text-foreground font-medium">
                  {format(endDate, "PPP")}
                </div>
              </div>
            </div>

            {/* Payment Calculator Box */}
            <div className="bg-muted/30 border border-border rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Total Fee ({durationMonths} Months)</span>
                <span className="text-xl font-light text-foreground">₹{totalFee}</span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground font-medium whitespace-nowrap">Amount Paid Now</span>
                <div className="relative w-40">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
                  <input 
                    required
                    type="number" 
                    min="0"
                    max={totalFee}
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value ? Number(e.target.value) : "")}
                    placeholder="0"
                    className="w-full h-12 pl-8 pr-4 rounded-xl border border-border bg-background focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-semibold text-right text-lg"
                  />
                </div>
              </div>

              <Separator className="bg-border/50" />

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium flex items-center gap-2">
                  <Wallet size={16} /> Balance Due
                </span>
                <span className={cn(
                  "text-2xl font-bold",
                  balanceDue > 0 ? "text-destructive" : "text-emerald-600"
                )}>
                  ₹{balanceDue}
                </span>
              </div>
            </div>
          </section>

          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full h-14 rounded-xl text-base font-semibold shadow-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            {isSubmitting ? "Processing Booking..." : "Confirm Booking & Reserve Seat"}
          </Button>

        </form>
      </div>

    </div>
  );
}

// Main page component wrapped in Suspense
export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-muted/10 py-10 px-4 md:px-8">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground animate-pulse">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm tracking-widest uppercase">Loading...</p>
        </div>
      }>
        <BookingForm />
      </Suspense>
    </div>
  );
}