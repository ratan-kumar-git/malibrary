"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowRight,
  CheckCircle2,
  Lock,
  Users,
  Calendar,
  Armchair,
} from "lucide-react";

interface ShiftOption {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  price: number;
}

const shiftOptions: ShiftOption[] = [
  {
    id: "MORNING",
    name: "Morning Shift",
    startTime: "6:00 AM",
    endTime: "12:00 PM",
    price: 150,
  },
  {
    id: "AFTERNOON",
    name: "Afternoon Shift",
    startTime: "12:00 PM",
    endTime: "6:00 PM",
    price: 150,
  },
  {
    id: "EVENING",
    name: "Evening Shift",
    startTime: "6:00 PM",
    endTime: "10:00 PM",
    price: 150,
  },
  {
    id: "FULL_DAY",
    name: "Full Day",
    startTime: "6:00 AM",
    endTime: "10:00 PM",
    price: 300,
  },
];

export function StudentRegistrationForm() {
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);

  // Student Information
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");

  // Locker Information
  const [includeLocker, setIncludeLocker] = useState(false);
  const [lockerNumber, setLockerNumber] = useState("");

  // Subscription Information
  const [selectedShifts, setSelectedShifts] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [amountPaid, setAmountPaid] = useState("");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Read seat and floor from URL search params
  useEffect(() => {
    const seatParam = searchParams.get("seat");
    
    if (seatParam) {
      setSelectedSeat(parseInt(seatParam));
      setCurrentStep(2); // Skip to step 2 if seat is pre-selected
    }
  }, [searchParams]);

  // Calculate total amount based on selected shifts
  const calculateTotalAmount = useCallback(() => {
    let basePrice = 0;
    selectedShifts.forEach((shiftId) => {
      const shift = shiftOptions.find((s) => s.id === shiftId);
      if (shift) basePrice += shift.price;
    });

    // Calculate number of months between start and end date
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const months = Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30)
      );
      setTotalAmount(basePrice * months);
    } else {
      setTotalAmount(basePrice);
    }
  }, [selectedShifts, startDate, endDate]);

  const handleShiftToggle = (shiftId: string) => {
    setSelectedShifts((prev) =>
      prev.includes(shiftId)
        ? prev.filter((id) => id !== shiftId)
        : [...prev, shiftId]
    );
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!name || !gender || !phoneNumber) {
        setError("Please fill in all required fields");
        return;
      }
      if (includeLocker && !lockerNumber) {
        setError("Please enter locker number");
        return;
      }
    } else if (currentStep === 2) {
      if (
        selectedShifts.length === 0 ||
        !startDate ||
        !endDate ||
        selectedSeat === null
      ) {
        setError("Please complete all subscription details");
        return;
      }
    }
    setError("");
    setCurrentStep(currentStep + 1);
  };

  const handlePreviousStep = () => {
    setCurrentStep(Math.max(1, currentStep - 1));
    setError("");
  };

  const handleSubmit = async () => {
    if (!amountPaid) {
      setError("Please enter paid amount");
      return;
    }

    setIsLoading(true);
    try {
      // Calculate total fee
      calculateTotalAmount();

      const payload = {
        name,
        gender,
        phoneNumber,
        address,
        lockerNumber: includeLocker ? lockerNumber : null,
        shifts: selectedShifts,
        startDate,
        endDate,
        seatNo: selectedSeat,
        totalAmount,
        amountPaid: parseFloat(amountPaid),
      };

      const response = await fetch("/api/library/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Registration failed");
      }

      const data = await response.json();
      alert("Registration successful! Your Member ID: " + data.data.memberId);
      // Reset form
      setCurrentStep(1);
      setName("");
      setGender("");
      setPhoneNumber("");
      setAddress("");
      setIncludeLocker(false);
      setLockerNumber("");
      setSelectedShifts([]);
      setStartDate("");
      setEndDate("");
      setSelectedSeat(null);
      setAmountPaid("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred during registration"
      );
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    calculateTotalAmount();
  }, [selectedShifts, startDate, endDate, calculateTotalAmount]);

  return (
    <form className="space-y-8">
      {/* Step Indicator */}
      <div className="flex justify-between items-center">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center flex-1">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold shrink-0 ${
                step < currentStep
                  ? "bg-green-500 text-white"
                  : step === currentStep
                  ? "bg-primary text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {step < currentStep ? <CheckCircle2 size={20} /> : step}
            </div>
            {step < 3 && (
              <div
                className={`flex-1 h-1 mx-2 rounded ${
                  step < currentStep ? "bg-green-500" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="text-center mb-6">
        <p className="text-sm text-gray-600">
          Step {currentStep} of 3 -{" "}
          {currentStep === 1
            ? "Personal Information"
            : currentStep === 2
            ? "Subscription Details"
            : "Payment Information"}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Step 1: Student Information */}
      {currentStep === 1 && (
        <Card className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="md:col-span-2">
              <Label htmlFor="name" className="block text-gray-700 font-medium">
                Full Name *
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2"
              />
            </div>

            {/* Gender */}
            <div>
              <Label htmlFor="gender" className="block text-gray-700 font-medium">
                Gender *
              </Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger id="gender" className="mt-2">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Phone Number */}
            <div>
              <Label
                htmlFor="phone"
                className="block text-gray-700 font-medium"
              >
                Phone Number *
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="10-digit phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.slice(0, 10))}
                className="mt-2"
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <Label
                htmlFor="address"
                className="block text-gray-700 font-medium"
              >
                Address
              </Label>
              <Textarea
                id="address"
                placeholder="Enter your full address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>

          {/* Locker Section */}
          <div className="border-t pt-6">
            <div className="flex items-center space-x-3 mb-4">
              <input
                type="checkbox"
                id="includeLocker"
                checked={includeLocker}
                onChange={(e) => {
                  setIncludeLocker(e.target.checked);
                  if (!e.target.checked) setLockerNumber("");
                }}
                className="w-5 h-5 rounded border-gray-300"
              />
              <Label htmlFor="includeLocker" className="flex items-center gap-2 cursor-pointer font-medium">
                <Lock size={18} />
                Include Locker Facility
              </Label>
            </div>

            {includeLocker && (
              <div>
                <Label
                  htmlFor="locker"
                  className="block text-gray-700 font-medium"
                >
                  Locker Number *
                </Label>
                <Input
                  id="locker"
                  type="number"
                  placeholder="e.g., 1, 5, 10"
                  value={lockerNumber}
                  onChange={(e) => setLockerNumber(e.target.value)}
                  className="mt-2"
                />
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Step 2: Subscription Details */}
      {currentStep === 2 && (
        <div className="space-y-6">
          {/* Shifts Selection */}
          <Card className="p-6 space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Users size={20} />
              Select Shifts (You can choose multiple)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {shiftOptions.map((shift) => (
                <button
                  key={shift.id}
                  type="button"
                  onClick={() => handleShiftToggle(shift.id)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedShifts.includes(shift.id)
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedShifts.includes(shift.id)}
                      disabled
                      className="w-5 h-5"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{shift.name}</p>
                      <p className="text-sm text-gray-600">
                        {shift.startTime} - {shift.endTime}
                      </p>
                      <p className="text-sm font-semibold text-primary mt-1">
                        ₹{shift.price}/month
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Dates Selection */}
          <Card className="p-6 space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar size={20} />
              Subscription Period
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate" className="block text-gray-700 font-medium">
                  Start Date *
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="endDate" className="block text-gray-700 font-medium">
                  End Date *
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>
          </Card>

          {/* Seat Selection */}
          <Card className="p-6 space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Armchair size={20} />
              Selected Seat
            </h3>
            {selectedSeat ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-700">
                  <span className="font-medium">Seat Number:</span> <span className="text-lg font-bold">{selectedSeat}</span>
                </p>
                <p className="text-xs text-blue-600 mt-2">
                  Selected from the seat map. <a href="/seat-map" className="underline hover:text-blue-800">Change seat</a>
                </p>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-700">
                  Please select a seat from the <a href="/seat-map" className="font-semibold underline hover:text-yellow-800">seat map</a> first.
                </p>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Step 3: Payment Information */}
      {currentStep === 3 && (
        <Card className="p-6 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-gray-900">Subscription Summary</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <span className="font-medium">Name:</span> {name}
              </p>
              <p>
                <span className="font-medium">Shifts:</span>{" "}
                {selectedShifts
                  .map((id) => shiftOptions.find((s) => s.id === id)?.name)
                  .join(", ")}
              </p>
              <p>
                <span className="font-medium">Period:</span> {startDate} to{" "}
                {endDate}
              </p>
              <p>
                <span className="font-medium">Seat:</span> {selectedSeat}
              </p>
              {includeLocker && (
                <p>
                  <span className="font-medium">Locker:</span> {lockerNumber}
                </p>
              )}
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 font-medium">Total Fee</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  ₹{totalAmount.toFixed(2)}
                </p>
              </div>
              <div>
                <Label
                  htmlFor="amountPaid"
                  className="block text-gray-700 font-medium"
                >
                  Amount Paid *
                </Label>
                <Input
                  id="amountPaid"
                  type="number"
                  placeholder="Enter amount paid"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>

            {amountPaid && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-700">
                  <span className="font-medium">Balance Due:</span> ₹
                  {(totalAmount - parseFloat(amountPaid || '0')).toFixed(2)}
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-4 justify-between pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={handlePreviousStep}
          disabled={currentStep === 1}
          className="px-8"
        >
          Previous
        </Button>

        {currentStep < 3 ? (
          <Button
            type="button"
            onClick={handleNextStep}
            className="px-8 gap-2 group"
          >
            Next
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-8"
          >
            {isLoading ? "Processing..." : "Complete Registration"}
          </Button>
        )}
      </div>
    </form>
  );
}
