'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, MapPin, Phone, User, Armchair, Clock, AlertCircle, Home, Trash2, Edit2, ArrowLeft, CheckCircle2, XCircle, RefreshCw, TrendingUp, KeyRound } from 'lucide-react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { toast } from 'sonner';
import EditStudentDialog from '@/components/students/EditStudentDialog';
import { cn } from '@/lib/utils';

interface StudentData {
  id: string;
  name: string;
  gender: string;
  phoneNumber: string;
  address: string | null;
  lockerNumber: number | null;
  memberId: number | null;
  createdAt: string;
  subscriptions: SubscriptionData[];
  assignments: AssignmentData[];
}

interface AssignmentData {
  id: string;
  seat: {
    id: string;
    seatNo: number;
    floor: {
      id: string;
      name: string;
    };
  };
  shift: {
    id: string;
    name: string;
  };
}

interface SubscriptionData {
  id: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  amountPaid: number;
  status: 'ACTIVE' | 'EXPIRED' | 'UPCOMING';
  floorName: string;
  seatNo: number;
  shiftName: string[];
}

interface StudentProfileData {
  student: StudentData;
}

export default function StudentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params?.id;
  const [data, setData] = useState<StudentProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!studentId) return;

    const fetchStudentData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/students/${studentId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch student data');
        }
        const result = await response.json();
        
        if (result.success && result.data) {
          const student = result.data;
          setData({
            student: {
              id: student.id,
              name: student.name,
              gender: student.gender,
              phoneNumber: student.phoneNumber,
              address: student.address,
              lockerNumber: student.lockerNumber,
              memberId: student.memberId,
              createdAt: student.createdAt,
              subscriptions: student.subscriptions || [],
              assignments: student.assignments || [],
            },
          });
        } else {
          throw new Error(result.message || 'Failed to fetch student data');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [studentId]);

  const handleDelete = async () => {
    if (!data?.student.id) return;
    if (!confirm('Are you sure you want to delete this student? This action cannot be undone.')) return;

    try {
      setDeleting(true);
      const res = await fetch(`/api/students/${data.student.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Student deleted successfully');
        router.push('/student');
      } else {
        toast.error('Failed to delete student');
      }
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error('An error occurred');
    } finally {
      setDeleting(false);
    }
  };

  const handleEditSuccess = () => {
    if (studentId) {
      // Refetch student data
      const fetchStudentData = async () => {
        try {
          const response = await fetch(`/api/students/${studentId}`);
          if (!response.ok) throw new Error('Failed to fetch student data');
          const result = await response.json();
          
          if (result.success && result.data) {
            const student = result.data;
            setData({
              student: {
                id: student.id,
                name: student.name,
                gender: student.gender,
                phoneNumber: student.phoneNumber,
                address: student.address,
                lockerNumber: student.lockerNumber,
                memberId: student.memberId,
                createdAt: student.createdAt,
                subscriptions: student.subscriptions || [],
                assignments: student.assignments || [],
              },
            });
          }
        } catch (err) {
          console.error('Failed to refetch student data:', err);
        }
      };
      fetchStudentData();
    }
  };

  if (loading) return <StudentProfileSkeleton />;

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto">
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6 flex items-center gap-3">
              <AlertCircle className="text-destructive" />
              <div>
                <p className="font-semibold text-destructive">Error</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <p className="text-muted-foreground">Student not found</p>
      </div>
    );
  }

  const { student } = data;
  const currentSubscription = student.subscriptions.find(
    (sub) => sub.status === 'ACTIVE'
  );

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 pt-24">
        {/* Breadcrumb */}
        <div className="mb-6">
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
                  <Link href="/student">Students</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-primary flex items-center gap-2">
                  {student.name}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Header with Actions */}
        <div className="mb-6 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/10 rounded-xl p-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h1 className="text-2xl font-bold text-foreground">{student.name}</h1>
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  ID: {student.memberId || 'Pending'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {currentSubscription ? (
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="size-4 text-emerald-600" />
                    Active Member • Seat #{currentSubscription.seatNo} • {currentSubscription.floorName}
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <AlertCircle className="size-4 text-amber-600" />
                    No Active Subscription
                  </span>
                )}
              </p>
            </div>
            <div className="flex gap-1.5 flex-col sm:flex-row">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditDialog(true)}
                className="gap-1.5"
              >
                <Edit2 className="size-3.5" />
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={deleting}
                className="gap-1.5"
              >
                <Trash2 className="size-3.5" />
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Left Column - Student Details */}
          <div className="md:col-span-1 space-y-4">
            {/* Personal Info */}
            <Card className="border border-border shadow-sm overflow-hidden">
              <CardHeader className="bg-muted/30 border-b border-border px-4 py-3">
                <CardTitle className="text-base flex items-center gap-1.5">
                  <User className="size-4" />
                  Personal Info
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="pb-2.5 border-b border-border">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Name</p>
                  <p className="text-sm font-bold text-foreground mt-1 capitalize">{student.name}</p>
                </div>
                <div className="pb-2.5 border-b border-border">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Gender</p>
                  <p className="text-sm font-semibold text-foreground mt-1 capitalize">{student.gender}</p>
                </div>
                <div className="pb-2.5 border-b border-border">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                    <Phone className="size-3" />
                    Phone
                  </p>
                  <p className="text-sm font-mono text-foreground mt-1">{student.phoneNumber}</p>
                </div>
                {student.address && (
                  <div className="pb-2.5 border-b border-border">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                      <MapPin className="size-3" />
                      Address
                    </p>
                    <p className="text-xs text-foreground mt-1 line-clamp-2">{student.address}</p>
                  </div>
                )}
                {student.lockerNumber && (
                  <div className="pb-2.5 border-b border-border">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Locker</p>
                    <div className="flex items-center gap-1.5 mt-1 w-max px-2 py-1.5 rounded-lg border border-primary/30 bg-primary/5">
                      <KeyRound className="size-3 text-primary" />
                      <span className="text-sm font-bold text-primary">#{student.lockerNumber}</span>
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                    <Calendar className="size-3" />
                    Joined
                  </p>
                  <p className="text-sm font-semibold text-foreground mt-1">
                    {new Date(student.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border border-border shadow-sm overflow-hidden">
              <CardHeader className="bg-muted/30 border-b border-border px-4 py-3">
                <CardTitle className="text-base flex items-center gap-1.5">
                  <TrendingUp className="size-4" />
                  Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <span className="text-xs font-semibold text-muted-foreground">Total</span>
                  <span className="text-lg font-bold text-primary">{student.subscriptions.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-200/50 hover:bg-emerald-100/30 transition-colors">
                  <span className="text-xs font-semibold text-emerald-700">Active</span>
                  <span className="text-lg font-bold text-emerald-600">
                    {student.subscriptions.filter((s) => s.status === 'ACTIVE').length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-destructive/5 rounded-lg border border-destructive/20 hover:bg-destructive/10 transition-colors">
                  <span className="text-xs font-semibold text-destructive">Expired</span>
                  <span className="text-lg font-bold text-destructive">
                    {student.subscriptions.filter((s) => s.status === 'EXPIRED').length}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Subscription Details */}
          <div className="md:col-span-2 space-y-4">
            {/* Current Subscription */}
            {currentSubscription ? (
              <Card className="border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-50/50 to-emerald-50/20 shadow-sm overflow-hidden">
                <CardHeader className="bg-emerald-50/50 border-b border-emerald-200/50 px-4 py-3">
                  <CardTitle className="text-base flex items-center gap-1.5">
                    <CheckCircle2 className="size-4 text-emerald-600" />
                    Current Subscription
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  {/* Main Details */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pb-4 border-b border-emerald-200/50">
                    <div className="bg-white/50 p-3 rounded-lg border border-emerald-200/30">
                      <p className="text-xs font-bold text-muted-foreground uppercase">Seat</p>
                      <p className="text-lg font-bold text-foreground mt-1">#{currentSubscription.seatNo}</p>
                    </div>
                    <div className="bg-white/50 p-3 rounded-lg border border-emerald-200/30">
                      <p className="text-xs font-bold text-muted-foreground uppercase">Floor</p>
                      <p className="text-lg font-bold text-foreground mt-1">{currentSubscription.floorName}</p>
                    </div>
                    <div className="bg-white/50 p-3 rounded-lg border border-emerald-200/30">
                      <p className="text-xs font-bold text-muted-foreground uppercase">Status</p>
                      <Badge className="mt-1 bg-emerald-600 text-white text-[10px] px-2 py-0.5">Active</Badge>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-3 pb-4 border-b border-emerald-200/50">
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Start</p>
                      <p className="text-sm font-semibold text-foreground">
                        {new Date(currentSubscription.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase mb-1">End</p>
                      <p className="text-sm font-semibold text-emerald-600">
                        {new Date(currentSubscription.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2.5 bg-white/50 rounded-lg border border-emerald-200/30">
                      <span className="text-xs font-medium text-muted-foreground">Total</span>
                      <span className="text-sm font-bold text-foreground">₹{currentSubscription.totalAmount}</span>
                    </div>
                    <div className="flex justify-between items-center p-2.5 bg-emerald-50 rounded-lg border border-emerald-200/50">
                      <span className="text-xs font-medium text-emerald-700">Paid</span>
                      <span className="text-sm font-bold text-emerald-600">₹{currentSubscription.amountPaid}</span>
                    </div>
                    {currentSubscription.totalAmount > currentSubscription.amountPaid && (
                      <div className="flex justify-between items-center p-2.5 bg-amber-50 rounded-lg border border-amber-200/50">
                        <span className="text-xs font-medium text-amber-700">Outstanding</span>
                        <span className="text-sm font-bold text-amber-600">₹{currentSubscription.totalAmount - currentSubscription.amountPaid}</span>
                      </div>
                    )}
                  </div>

                  {/* Shifts */}
                  {currentSubscription.shiftName.length > 0 && (
                    <div className="pb-4 border-t border-emerald-200/50 pt-4">
                      <p className="text-xs font-bold text-muted-foreground uppercase mb-2 flex items-center gap-1">
                        <Clock className="size-3" />
                        Shifts
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {currentSubscription.shiftName.map((shift, idx) => (
                          <Badge key={idx} className="bg-emerald-100 text-emerald-700 border border-emerald-300 capitalize">
                            {shift}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-3 border-t border-emerald-200/50">
                    <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 gap-1.5 h-9 text-sm">
                      <RefreshCw className="size-3.5" />
                      Renew
                    </Button>
                    <Button variant="outline" className="flex-1 gap-1.5 h-9 text-sm">
                      Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-2 border-amber-200 bg-amber-50/50 shadow-sm overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start gap-2">
                    <XCircle className="size-4 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-sm text-amber-900">No Active Subscription</p>
                      <p className="text-xs text-amber-800 mt-0.5">
                        Purchase a new subscription to access library facilities.
                      </p>
                      <Button size="xs" className="mt-2 h-8 text-xs">
                        Create
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Subscription History */}
            <Card className="border border-border shadow-sm overflow-hidden">
              <CardHeader className="bg-muted/30 border-b border-border px-4 py-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Clock className="size-4" />
                    History
                  </span>
                  <Badge variant="outline" className="text-xs">{student.subscriptions.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {student.subscriptions.length === 0 ? (
                  <div className="text-center py-6">
                    <AlertCircle className="size-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground font-medium">No history</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {student.subscriptions.map((sub) => (
                      <div
                        key={sub.id}
                        className={cn(
                          "p-3 border rounded-lg transition-all hover:shadow-md",
                          sub.status === 'ACTIVE' 
                            ? "border-emerald-200/50 bg-emerald-50/30 hover:bg-emerald-50" 
                            : "border-border bg-muted/20 hover:bg-muted/30"
                        )}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="font-semibold text-sm text-foreground">
                              Seat #{sub.seatNo} • {sub.floorName}
                            </p>
                            <Badge
                              variant={
                                sub.status === 'ACTIVE'
                                  ? 'default'
                                  : sub.status === 'EXPIRED'
                                    ? 'secondary'
                                    : 'outline'
                              }
                              className={cn(
                                "text-[10px] px-1.5 py-0.5",
                                sub.status === 'ACTIVE' && "bg-emerald-600"
                              )}
                            >
                              {sub.status}
                            </Badge>
                          </div>
                          <p className="text-sm font-bold text-foreground">₹{sub.totalAmount}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2 font-medium">
                          {new Date(sub.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })} → {new Date(sub.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                        </p>
                        {sub.shiftName.length > 0 && (
                          <div className="flex gap-1 flex-wrap mb-2">
                            {sub.shiftName.map((shift, idx) => (
                              <Badge key={idx} variant="outline" className="text-[10px] px-1.5 py-0.5 capitalize font-semibold">
                                {shift}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <div className="flex justify-between items-center text-[11px] font-semibold pt-2 border-t border-border/50">
                          <span className="text-muted-foreground">Paid: ₹{sub.amountPaid}</span>
                          <span className={sub.amountPaid === sub.totalAmount ? 'text-emerald-600' : 'text-amber-600'}>
                            {sub.amountPaid === sub.totalAmount ? '✓ Paid' : `Due: ₹${sub.totalAmount - sub.amountPaid}`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      {data && (
        <EditStudentDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          student={{
            id: student.id,
            memberId: student.memberId?.toString() || null,
            name: student.name,
            gender: student.gender,
            phoneNumber: student.phoneNumber,
            lockerNumber: student.lockerNumber,
            address: student.address,
            subscriptions: [],
          }}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}

// Loading Skeleton
function StudentProfileSkeleton() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-start justify-between">
          <div>
            <Skeleton className="h-9 w-64 mb-3" />
            <Skeleton className="h-5 w-48" />
          </div>
          <Skeleton className="h-8 w-32" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2 space-y-6">
            {[...Array(2)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-40" />
                </CardHeader>
                <CardContent>
                  {[...Array(4)].map((_, j) => (
                    <Skeleton key={j} className="h-4 w-full mb-3" />
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
