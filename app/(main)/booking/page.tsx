'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Armchair, Clock, Users, AlertCircle, CheckCircle2, Loader2, ArrowRight, Home } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { cn } from '@/lib/utils';

interface Shift {
  id: string;
  name: string;
  startTime: number;
  endTime: number;
  price: number;
}

interface SeatData {
  id: string;
  seatNo: number;
  floorName: string;
  shifts: Shift[];
}

interface Student {
  id: string;
  name: string;
  phoneNumber: string;
  gender: string;
}

const formatTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${mins.toString().padStart(2, '0')} ${ampm}`;
};

function BookingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const seatId = searchParams.get('seatId') || '';
  const shiftParam = searchParams.get('shift') || '';
  const bookingDate = searchParams.get('date') || new Date().toISOString().split('T')[0];

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1: Select, 2: Review
  const [seatData, setSeatData] = useState<SeatData | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [error, setError] = useState('');

  const [bookingData, setBookingData] = useState({
    selectedStudent: null as Student | null,
    newStudent: {
      name: '',
      phoneNumber: '',
      gender: 'MALE',
      address: '',
    },
    isNewStudent: false,
    selectedShifts: [] as string[],
    duration: 1, // months
  });

  // Fetch seat details and shifts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch shifts
        const shiftsRes = await fetch('/api/library/shifts');
        const shiftsData = await shiftsRes.json();
        
        if (!shiftsRes.ok) throw new Error('Failed to fetch shifts');

        // Fetch existing students
        const studentsRes = await fetch('/api/students');
        const studentsData = await studentsRes.json();
        
        if (studentsRes.ok && studentsData.success) {
          setStudents(studentsData.data.map((s: any) => ({
            id: s.id,
            name: s.name,
            phoneNumber: s.phoneNumber,
            gender: s.gender,
          })));
        }

        // Fetch seat details from database
        let seatNo = 0;
        let floorName = 'Floor 1';
        
        if (seatId) {
          const seatRes = await fetch(`/api/seats/${seatId}`);
          if (seatRes.ok) {
            const seatInfo = await seatRes.json();
            seatNo = seatInfo.data?.seatNo || 0;
            floorName = seatInfo.data?.floor?.name || 'Floor 1';
          }
        }

        // Set seat data with shifts
        setSeatData({
          id: seatId,
          seatNo,
          floorName,
          shifts: shiftsData.data?.shifts || [],
        });

        // Set initial shift if provided
        if (shiftParam && shiftsData.data?.shifts) {
          const selectedShift = shiftsData.data.shifts.find(
            (s: Shift) => s.name === shiftParam
          );
          if (selectedShift) {
            setBookingData((prev) => ({
              ...prev,
              selectedShifts: [selectedShift.id],
            }));
          }
        }

        setError('');
      } catch (err) {
        console.error(err);
        setError('Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [seatId, shiftParam]);

  const calculateTotal = () => {
    if (!seatData) return 0;
    const selectedShiftsCost = seatData.shifts
      .filter((s) => bookingData.selectedShifts.includes(s.id))
      .reduce((sum, s) => sum + s.price, 0);
    return selectedShiftsCost * bookingData.duration;
  };

  const getEndDate = () => {
    const start = new Date(bookingDate);
    const end = new Date(start);
    end.setMonth(end.getMonth() + bookingData.duration);
    end.setDate(end.getDate() - 1);
    return end;
  };

  const handleShiftToggle = (shiftId: string) => {
    setBookingData((prev) => ({
      ...prev,
      selectedShifts: prev.selectedShifts.includes(shiftId)
        ? prev.selectedShifts.filter((id) => id !== shiftId)
        : [...prev.selectedShifts, shiftId],
    }));
  };

  const handleStudentSelect = (student: Student) => {
    setBookingData((prev) => ({
      ...prev,
      selectedStudent: prev.selectedStudent?.id === student.id ? null : student,
      isNewStudent: false,
    }));
  };

  const handleSubmit = async () => {
    if (bookingData.selectedShifts.length === 0) {
      setError('Please select at least one shift');
      return;
    }

    const student = bookingData.isNewStudent ? bookingData.newStudent : bookingData.selectedStudent;
    
    if (!student) {
      setError('Please select or create a student');
      return;
    }

    if (bookingData.isNewStudent && (!student.name || !student.phoneNumber)) {
      setError('Please fill in all required student fields');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        seatId,
        studentId: bookingData.isNewStudent ? undefined : bookingData.selectedStudent?.id,
        newStudent: bookingData.isNewStudent ? student : undefined,
        shiftIds: bookingData.selectedShifts,
        startDate: bookingDate,
        endDate: getEndDate().toISOString().split('T')[0],
        totalAmount: calculateTotal(),
      };

      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create booking');
      }

      const result = await res.json();
      toast.success(`Booking successful! Subscription ID: ${result.data?.id}`);
      router.push('/seat-map');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Booking failed';
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 rounded-lg" />
        <Skeleton className="h-96 rounded-lg" />
      </div>
    );
  }

  const selectedShiftsInfo = seatData?.shifts.filter((s) =>
    bookingData.selectedShifts.includes(s.id)
  ) || [];
  const totalPrice = calculateTotal();

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">
                <Home className="w-4 h-4" />
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/seat-map">Seat Map</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-primary">Booking</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Error Alert */}
      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-destructive mt-0.5 shrink-0" size={20} />
              <p className="text-destructive text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Steps */}
      <Card className="border-border shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            {[
              { num: 1, label: 'Select Details' },
              { num: 2, label: 'Review & Confirm' },
            ].map((s, idx) => (
              <div key={s.num} className="flex items-center gap-4 flex-1">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all',
                      step >= s.num
                        ? 'bg-primary text-white'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {s.num}
                  </div>
                  <p className="text-xs font-medium text-center">{s.label}</p>
                </div>
                {idx < 1 && (
                  <div
                    className={cn(
                      'flex-1 h-1 rounded-full transition-all',
                      step > s.num ? 'bg-primary' : 'bg-muted'
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {step === 1 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Seat Info */}
            <Card className="bg-primary/5 border-primary/20 shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/20">
                    <Armchair className="text-primary" size={20} />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Seat #{seatData?.seatNo}</CardTitle>
                    <p className="text-sm text-muted-foreground">{seatData?.floorName}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 justify-between">
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Booking Date</Label>
                    <p className="font-semibold text-lg">{new Date(bookingDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Duration</Label>
                    <div className="flex gap-2 mt-1">
                      {[1, 2, 3].map((m) => (
                        <button
                          key={m}
                          onClick={() =>
                            setBookingData((prev) => ({ ...prev, duration: m }))
                          }
                          className={cn(
                            'px-4 py-2 rounded-lg font-semibold text-sm transition-all border',
                            bookingData.duration === m
                              ? 'bg-primary text-white border-primary'
                              : 'bg-background border-border hover:border-primary'
                          )}
                        >
                          {m}M
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shifts Selection */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock size={20} />
                  Select Shifts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {seatData?.shifts.map((shift) => (
                    <button
                      key={shift.id}
                      onClick={() => handleShiftToggle(shift.id)}
                      className={cn(
                        'w-full p-4 rounded-xl border-2 transition-all text-left',
                        bookingData.selectedShifts.includes(shift.id)
                          ? 'border-primary bg-primary/5'
                          : 'border-border bg-background hover:border-primary/50'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-foreground">{shift.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                          </p>
                        </div>
                        <Badge
                          variant={
                            bookingData.selectedShifts.includes(shift.id)
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          ₹{shift.price}/mo
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Student Selection */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users size={20} />
                  Select or Create Student
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Existing Students */}
                {students.length > 0 && (
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-3 block">
                      Existing Students
                    </Label>
                    <div className="space-y-2">
                      {students.map((student) => (
                        <button
                          key={student.id}
                          onClick={() => handleStudentSelect(student)}
                          className={cn(
                            'w-full p-3 rounded-lg border-2 transition-all text-left',
                            bookingData.selectedStudent?.id === student.id &&
                              !bookingData.isNewStudent
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          )}
                        >
                          <p className="font-semibold text-foreground">{student.name}</p>
                          <p className="text-sm text-muted-foreground">{student.phoneNumber}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Or Divider */}
                {students.length > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-border" />
                    <p className="text-xs text-muted-foreground font-medium">OR</p>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                )}

                {/* New Student Form */}
                <div className="space-y-4">
                  <button
                    onClick={() =>
                      setBookingData((prev) => ({
                        ...prev,
                        isNewStudent: !prev.isNewStudent,
                        selectedStudent: null,
                      }))
                    }
                    className={cn(
                      'w-full p-3 rounded-lg border-2 transition-all text-left font-semibold',
                      bookingData.isNewStudent
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    Create New Student
                  </button>

                  {bookingData.isNewStudent && (
                    <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                      <div>
                        <Label htmlFor="name" className="text-xs font-bold uppercase">
                          Name
                        </Label>
                        <Input
                          id="name"
                          value={bookingData.newStudent.name}
                          onChange={(e) =>
                            setBookingData((prev) => ({
                              ...prev,
                              newStudent: { ...prev.newStudent, name: e.target.value },
                            }))
                          }
                          placeholder="Full name"
                          className="mt-1.5"
                        />
                      </div>

                      <div>
                        <Label htmlFor="phone" className="text-xs font-bold uppercase">
                          Phone
                        </Label>
                        <Input
                          id="phone"
                          value={bookingData.newStudent.phoneNumber}
                          onChange={(e) =>
                            setBookingData((prev) => ({
                              ...prev,
                              newStudent: {
                                ...prev.newStudent,
                                phoneNumber: e.target.value,
                              },
                            }))
                          }
                          placeholder="10 digit number"
                          maxLength={10}
                          className="mt-1.5"
                        />
                      </div>

                      <div>
                        <Label htmlFor="gender" className="text-xs font-bold uppercase">
                          Gender
                        </Label>
                        <Select
                          value={bookingData.newStudent.gender}
                          onValueChange={(value) =>
                            setBookingData((prev) => ({
                              ...prev,
                              newStudent: { ...prev.newStudent, gender: value },
                            }))
                          }
                        >
                          <SelectTrigger className="mt-1.5">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MALE">Male</SelectItem>
                            <SelectItem value="FEMALE">Female</SelectItem>
                            <SelectItem value="OTHER">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="address" className="text-xs font-bold uppercase">
                          Address (Optional)
                        </Label>
                        <Textarea
                          id="address"
                          value={bookingData.newStudent.address}
                          onChange={(e) =>
                            setBookingData((prev) => ({
                              ...prev,
                              newStudent: { ...prev.newStudent, address: e.target.value },
                            }))
                          }
                          placeholder="Address"
                          rows={2}
                          className="mt-1.5 resize-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Summary */}
          <div className="h-fit sticky top-24">
            <Card className="border-primary/20 bg-linear-to-br from-primary/5 to-primary/10 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar size={20} className="text-primary" />
                  Booking Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Dates */}
                <div className="space-y-1">
                  <p className="text-xs font-bold text-muted-foreground uppercase">Duration</p>
                  <p className="text-sm text-foreground">
                    {new Date(bookingDate).toLocaleDateString()} →{' '}
                    {getEndDate().toLocaleDateString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {bookingData.duration} month{bookingData.duration > 1 ? 's' : ''}
                  </p>
                </div>

                <div className="h-px bg-border" />

                {/* Shifts */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-muted-foreground uppercase">Selected Shifts</p>
                  {selectedShiftsInfo.length > 0 ? (
                    <div className="space-y-2">
                      {selectedShiftsInfo.map((shift) => (
                        <div key={shift.id} className="flex justify-between text-sm">
                          <span className="text-foreground">{shift.name}</span>
                          <span className="font-semibold">₹{shift.price}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No shifts selected</p>
                  )}
                </div>

                <div className="h-px bg-border" />

                {/* Pricing */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Monthly Total</span>
                    <span className="font-medium">
                      ₹
                      {selectedShiftsInfo.reduce((sum, s) => sum + s.price, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">{bookingData.duration}x</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t border-primary/20 pt-2">
                    <span>Total</span>
                    <span className="text-primary">₹{totalPrice}</span>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    if (bookingData.selectedShifts.length === 0) {
                      setError('Please select at least one shift');
                      return;
                    }
                    if (!bookingData.isNewStudent && !bookingData.selectedStudent) {
                      setError('Please select a student');
                      return;
                    }
                    setStep(2);
                  }}
                  className="w-full h-11 mt-4 gap-2"
                >
                  Review Booking <ArrowRight size={16} />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        // Step 2: Review
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Details Review */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Booking Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Seat</p>
                    <p className="text-lg font-semibold text-foreground">Seat #{seatData?.seatNo}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Duration</p>
                    <p className="text-lg font-semibold text-foreground">{bookingData.duration} Month{bookingData.duration > 1 ? 's' : ''}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Start Date</p>
                    <p className="text-lg font-semibold text-foreground">{new Date(bookingDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">End Date</p>
                    <p className="text-lg font-semibold text-foreground">{getEndDate().toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shifts Review */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Shifts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedShiftsInfo.map((shift) => (
                    <div
                      key={shift.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border"
                    >
                      <div>
                        <p className="font-semibold text-foreground">{shift.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                        </p>
                      </div>
                      <Badge>₹{shift.price}/mo</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Student Review */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Student Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Name</p>
                    <p className="font-semibold text-foreground">
                      {bookingData.isNewStudent
                        ? bookingData.newStudent.name
                        : bookingData.selectedStudent?.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Phone</p>
                    <p className="font-semibold text-foreground">
                      {bookingData.isNewStudent
                        ? bookingData.newStudent.phoneNumber
                        : bookingData.selectedStudent?.phoneNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Gender</p>
                    <p className="font-semibold text-foreground capitalize">
                      {bookingData.isNewStudent
                        ? bookingData.newStudent.gender.toLowerCase()
                        : bookingData.selectedStudent?.gender.toLowerCase()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <div className="h-fit sticky top-24">
            <Card className="border-primary/20 bg-linear-to-br from-primary/5 to-primary/10 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-primary" />
                  Final Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shifts</span>
                    <span className="font-medium">{selectedShiftsInfo.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Monthly</span>
                    <span className="font-medium">
                      ₹
                      {selectedShiftsInfo.reduce((sum, s) => sum + s.price, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">{bookingData.duration} months</span>
                  </div>
                </div>

                <div className="h-px bg-primary/20" />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount</span>
                  <span className="text-primary">₹{totalPrice}</span>
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                  <p className="text-xs font-semibold text-emerald-700">
                    You will pay ₹{totalPrice} for {bookingData.duration} months of access
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="w-full h-11 gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={16} />
                        Confirm Booking
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => setStep(1)}
                    variant="outline"
                    disabled={submitting}
                    className="w-full h-11"
                  >
                    Back
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BookingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pt-24 pb-12">
        <Suspense fallback={<div className="space-y-6"><Skeleton className="h-32 rounded-lg" /><Skeleton className="h-96 rounded-lg" /></div>}>
          <BookingContent />
        </Suspense>
      </div>
    </div>
  );
}
