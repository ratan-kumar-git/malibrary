"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Armchair,
  User,
  CreditCard,
  ChevronRight,
  Calendar,
  Info,
  AlertCircle,
} from "lucide-react";
import { minutesToAmPm } from "@/lib/helper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface Shift {
  id: string;
  name: string;
  startTime: number;
  endTime: number;
  price: number;
  isActive: boolean;
}

interface AvailabilityData {
  seatNo: number;
  shifts: Shift[];
  occupiedShiftIds: string[];
}

export default function StudentRegistrationForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // 1. Extract URL Params
  const seatIdParam = searchParams.get("seatId") || "";
  const shiftParam = searchParams.get("shift") || "";
  const dateParam =
    searchParams.get("date") || new Date().toISOString().split("T")[0];

  // 2. State Management
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [availabilityData, setAvailabilityData] =
    useState<AvailabilityData | null>(null);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    seatId: seatIdParam,
    date: dateParam,
    selectedShifts: [] as string[], // Will be populated after availability data loads
    duration: 1, // 1, 2, or 3 months
    // Student Info
    name: "",
    phoneNumber: "",
    gender: "MALE",
    address: "",
  });

  // Track if we've already set the initial shift from URL param
  const hasSetInitialShift = React.useRef(false);

  // 3. Fetch Availability on Load or Date Change
  useEffect(() => {
    async function checkAvailability() {
      if (!formData.seatId) return;

      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          `/api/seats/check?seatId=${formData.seatId}&date=${formData.date}`,
        );
        if (!res.ok) throw new Error("Failed to fetch availability");
        const data = await res.json();
        setAvailabilityData(data);

        // If shift param is set and we haven't already selected shifts, find and select it
        if (
          shiftParam &&
          !hasSetInitialShift.current &&
          data.shifts.length > 0
        ) {
          let selectedShiftIds: string[] = [];

          if (shiftParam === "ALL") {
            // Select all available (non-occupied) shifts
            selectedShiftIds = data.shifts
              .filter((s: Shift) => !data.occupiedShiftIds.includes(s.id))
              .map((s: Shift) => s.id);
          } else {
            // Find specific shift by name
            const matchingShift = data.shifts.find(
              (s: Shift) => s.name === shiftParam,
            );
            if (
              matchingShift &&
              !data.occupiedShiftIds.includes(matchingShift.id)
            ) {
              selectedShiftIds = [matchingShift.id];
            }
          }

          if (selectedShiftIds.length > 0) {
            setFormData((prev) => ({
              ...prev,
              selectedShifts: selectedShiftIds,
            }));
            hasSetInitialShift.current = true;
          }
        }
      } catch (err) {
        setError("Could not load seat availability. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    checkAvailability();
  }, [formData.seatId, formData.date, shiftParam]);

  // 4. Shift Selection Handler
  const handleShiftToggle = (shiftId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedShifts: prev.selectedShifts.includes(shiftId)
        ? prev.selectedShifts.filter((id) => id !== shiftId)
        : [...prev.selectedShifts, shiftId],
    }));
  };

  // 5. Calculate End Date
  const getEndDate = () => {
    const startDate = new Date(formData.date);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + formData.duration);
    endDate.setDate(endDate.getDate() - 1); // End date is last day of subscription
    return endDate;
  };

  // 6. Calculate Total Price
  const calculateTotal = () => {
    if (!availabilityData) return 0;
    const pricePerMonth = availabilityData.shifts
      .filter((s: Shift) => formData.selectedShifts.includes(s.id))
      .reduce((acc: number, curr: Shift) => acc + curr.price, 0);
    return pricePerMonth * formData.duration;
  };

  // 7. Get Selected Shift Details for Display
  const getSelectedShiftDetails = () => {
    if (!availabilityData) return [];
    return availabilityData.shifts.filter((s) =>
      formData.selectedShifts.includes(s.id),
    );
  };

  // 8. Handle Form Submission
  const handleSubmit = async () => {
    if (!formData.name || !formData.phoneNumber) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        seatId: formData.seatId,
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        gender: formData.gender,
        address: formData.address,
        startDate: formData.date,
        endDate: getEndDate().toISOString().split("T")[0],
        selectedShifts: formData.selectedShifts,
        totalAmount: calculateTotal(),
        amountPaid: 0,
      };

      const res = await fetch("/api/library/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create subscription");
      }

      const data = await res.json();
      toast.success(
        `Registration successful! Member ID: ${data.data.memberId}`,
      );
      router.push("/seat-map");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to complete registration",
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="border-primary/10">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            {[
              { num: 1, label: "Shifts & Date" },
              { num: 2, label: "Complete Registration" },
            ].map((s, idx) => (
              <React.Fragment key={s.num}>
                <div
                  className={`flex flex-col items-center gap-1.5 flex-1 ${idx === 1 ? "md:flex-1" : "md:flex-1"}`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                      step >= s.num
                        ? "bg-primary text-white shadow-lg"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {s.num}
                  </div>
                  <p
                    className={`text-xs font-medium text-center ${
                      step >= s.num ? "text-primary" : "text-gray-500"
                    }`}
                  >
                    {s.label}
                  </p>
                </div>
                {idx < 1 && (
                  <div
                    className={`flex-1 h-1 rounded-full transition-all mb-6 ${
                      step > s.num ? "bg-primary" : "bg-gray-200"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle
                className="text-destructive mt-0.5 shrink-0"
                size={20}
              />
              <p className="text-destructive text-sm font-medium">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 1: Seat & Shifts Selection */}
      {step === 1 && (
        <div className="space-y-6">
          {/* Seat Info Card */}
          <Card className="bg-linear-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/20">
                    <Armchair className="text-primary" size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-primary uppercase tracking-widest">
                      Selected Seat
                    </p>
                    <CardTitle className="text-3xl font-bold text-primary">
                      Seat #{availabilityData?.seatNo}
                    </CardTitle>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-primary/70 uppercase tracking-widest">
                    Booking Date
                  </p>
                  <p className="text-lg font-semibold text-primary">
                    {new Date(formData.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Date & Duration Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date Picker */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-primary" />
                  <CardTitle className="text-base">Start Date</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-primary/20 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none text-sm font-medium placeholder-gray-400"
                />
              </CardContent>
            </Card>

            {/* Duration Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Subscription Duration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  {[1, 2, 3].map((m) => (
                    <button
                      key={m}
                      onClick={() => setFormData({ ...formData, duration: m })}
                      className={`flex-1 py-2.5 px-3 rounded-lg border-2 font-semibold text-sm transition-all ${
                        formData.duration === m
                          ? "bg-primary text-white border-primary shadow-md"
                          : "bg-white text-gray-700 border-gray-200 hover:border-primary/50 hover:bg-primary/5"
                      }`}
                    >
                      {m}M
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Available Shifts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Available Shifts</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Select one or more shifts for your booking
              </p>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="animate-spin rounded-full h-10 w-10 border-3 border-primary/20 border-t-primary"></div>
                  <p className="text-gray-600 text-sm">
                    Loading available shifts...
                  </p>
                </div>
              ) : availabilityData?.shifts.length === 0 ? (
                <div className="flex items-center justify-center py-12 gap-2 text-amber-600 bg-amber-50 rounded-lg p-4 border border-amber-200">
                  <Info size={18} />
                  <p>No shifts available for this date</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {availabilityData?.shifts.map((shift: Shift) => {
                    const isOccupied =
                      availabilityData.occupiedShiftIds.includes(shift.id);
                    const isSelected = formData.selectedShifts.includes(
                      shift.id,
                    );

                    return (
                      <div
                        key={shift.id}
                        onClick={() =>
                          !isOccupied && handleShiftToggle(shift.id)
                        }
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          isOccupied
                            ? "opacity-50 bg-gray-50 border-gray-200 cursor-not-allowed"
                            : isSelected
                              ? "bg-primary/10 border-primary shadow-md ring-1 ring-primary/30"
                              : "bg-white border-gray-200 hover:border-primary/50 hover:shadow-sm"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 text-sm md:text-base">
                              {shift.name}
                            </p>
                            <p className="text-xs text-gray-600 mt-1.5">
                              {minutesToAmPm(shift.startTime)} -{" "}
                              {minutesToAmPm(shift.endTime)}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-bold text-lg text-primary">
                              ₹{shift.price}
                            </p>
                            <p className="text-xs text-gray-500">/month</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                              isSelected
                                ? "bg-primary border-primary"
                                : "border-gray-300"
                            }`}
                          >
                            {isSelected && (
                              <svg
                                className="w-3 h-3 text-white"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>
                          {isOccupied && (
                            <span className="text-xs font-semibold text-red-600">
                              Not Available
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary Card */}
          <Card className="bg-linear-to-br from-slate-50 to-slate-100/50 border-slate-200">
            <CardHeader>
              <CardTitle className="text-base">Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">
                  Selected Shifts:
                </span>
                <span className="font-bold text-primary text-lg">
                  {formData.selectedShifts.length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Duration:</span>
                <span className="font-bold text-primary">
                  {formData.duration} month{formData.duration > 1 ? "s" : ""}
                </span>
              </div>
              <div className="border-t border-gray-300 pt-3 flex justify-between items-center">
                <span className="text-gray-900 font-semibold">
                  Estimated Total:
                </span>
                <span className="text-2xl font-bold text-primary">
                  ₹{calculateTotal()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Action Button */}
          <button
            disabled={formData.selectedShifts.length === 0 || loading}
            onClick={() => setStep(2)}
            className={`w-full py-3.5 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 ${
              formData.selectedShifts.length === 0 || loading
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-primary text-white hover:bg-primary/90 shadow-lg hover:shadow-xl"
            }`}
          >
            Next: Student Details
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* Step 2: Student Info & Billing */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Student Information Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10">
                  <User size={18} className="text-primary" />
                </div>
                <CardTitle>Student Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900">
                    Full Name *
                  </label>
                  <input
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none text-sm placeholder-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900">
                    Phone Number *
                  </label>
                  <input
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        phoneNumber: e.target.value.replace(/[^0-9]/g, ""),
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none text-sm placeholder-gray-400"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none text-sm bg-white"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900">
                  Address (Optional)
                </label>
                <textarea
                  placeholder="Enter your complete address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none text-sm placeholder-gray-400 resize-none"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Booking Summary Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10">
                  <CreditCard size={18} className="text-primary" />
                </div>
                <CardTitle>Booking Summary</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-1">
                    Seat
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    #{availabilityData?.seatNo}
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-1">
                    Start Date
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(formData.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-1">
                    End Date
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {getEndDate().toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-3">
                <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">
                  Selected Shifts
                </p>
                {getSelectedShiftDetails().map((shift) => (
                  <div
                    key={shift.id}
                    className="flex justify-between items-center text-sm bg-white p-3 rounded-lg"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">
                        {shift.name}
                      </p>
                      <p className="text-xs text-gray-600">
                        {minutesToAmPm(shift.startTime)} -{" "}
                        {minutesToAmPm(shift.endTime)}
                      </p>
                    </div>
                    <p className="font-bold text-primary">₹{shift.price}/mo</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between items-center text-gray-700">
                  <span className="font-medium">
                    Subtotal ({formData.duration} month
                    {formData.duration > 1 ? "s" : ""})
                  </span>
                  <span className="font-semibold">₹{calculateTotal()}</span>
                </div>
                <div className="bg-linear-to-r from-primary/10 to-primary/5 rounded-lg p-3 mt-4 flex justify-between items-center">
                  <span className="font-bold text-gray-900">Total Amount</span>
                  <span className="text-3xl font-bold text-primary">
                    ₹{calculateTotal()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-3 px-4 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !formData.name || !formData.phoneNumber}
              className={`flex-1 py-3 px-4 font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                loading || !formData.name || !formData.phoneNumber
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl"
              }`}
            >
              {loading ? "Processing..." : "Confirm & Pay"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
