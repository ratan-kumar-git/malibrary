'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, MapPin, Phone, User, Armchair, Clock, AlertCircle, Home, Trash2, Edit2, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { toast } from 'sonner';
import EditStudentDialog from '@/components/students/EditStudentDialog';

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
        <div className="flex items-start justify-between mb-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-foreground">{student.name}</h1>
              <Badge variant="outline" className="text-base">
                ID: {student.memberId || 'N/A'}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {currentSubscription ? 'Active Member' : 'No Active Subscription'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setShowEditDialog(true)}
              className="gap-2"
            >
              <Edit2 className="size-4" />
              Edit
            </Button>
            <Button
              variant="destructive"
              size="lg"
              onClick={handleDelete}
              disabled={deleting}
              className="gap-2"
            >
              <Trash2 className="size-4" />
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Student Details */}
          <div className="md:col-span-1 space-y-6">
            {/* Personal Info */}
            <Card className="border border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="size-4" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Gender</p>
                  <p className="text-sm font-medium text-foreground capitalize mt-1">{student.gender}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                    <Phone className="size-3" />
                    Phone Number
                  </p>
                  <p className="text-sm font-medium text-foreground mt-1">{student.phoneNumber}</p>
                </div>
                {student.address && (
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                      <MapPin className="size-3" />
                      Address
                    </p>
                    <p className="text-sm font-medium text-foreground mt-1">{student.address}</p>
                  </div>
                )}
                {student.lockerNumber && (
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Locker Number</p>
                    <div className="flex items-center gap-2 mt-1 w-max px-2.5 py-1 rounded-md border border-border bg-muted">
                      <span className="text-sm font-bold text-foreground">#{student.lockerNumber}</span>
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                    <Calendar className="size-3" />
                    Joined
                  </p>
                  <p className="text-sm font-medium text-foreground mt-1">
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
            <Card className="border border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium text-muted-foreground">Total Subscriptions</span>
                  <span className="text-2xl font-bold text-primary">{student.subscriptions.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-emerald-500/10 rounded-lg">
                  <span className="text-sm font-medium text-emerald-700">Active</span>
                  <span className="text-2xl font-bold text-emerald-600">
                    {student.subscriptions.filter((s) => s.status === 'ACTIVE').length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg">
                  <span className="text-sm font-medium text-destructive">Expired</span>
                  <span className="text-2xl font-bold text-destructive">
                    {student.subscriptions.filter((s) => s.status === 'EXPIRED').length}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Subscription Details */}
          <div className="md:col-span-2 space-y-6">
            {/* Current Subscription */}
            {currentSubscription ? (
              <Card className="border-2 border-emerald-500/30 bg-emerald-50/50 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle2 className="size-5 text-emerald-600" />
                    Current Subscription
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-4 border-b border-border">
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Seat Number</p>
                      <p className="text-xl font-bold text-foreground mt-1">#{currentSubscription.seatNo}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Floor</p>
                      <p className="text-lg font-semibold text-foreground mt-1">{currentSubscription.floorName}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Status</p>
                      <Badge className="mt-1 bg-emerald-500 text-white">Active</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pb-4 border-b border-border">
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Start Date</p>
                      <p className="text-sm font-medium text-foreground mt-1">
                        {new Date(currentSubscription.startDate).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">End Date</p>
                      <p className="text-sm font-medium text-foreground mt-1">
                        {new Date(currentSubscription.endDate).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pb-4 border-b border-border">
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Total Amount</p>
                      <p className="text-lg font-bold text-foreground mt-1">₹{currentSubscription.totalAmount}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Amount Paid</p>
                      <p className="text-lg font-semibold text-emerald-600 mt-1">₹{currentSubscription.amountPaid}</p>
                    </div>
                  </div>

                  {currentSubscription.shiftName.length > 0 && (
                    <div className="pb-4 border-b border-border">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
                        <Clock className="size-3" />
                        Assigned Shifts
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {currentSubscription.shiftName.map((shift, idx) => (
                          <Badge key={idx} variant="secondary" className="capitalize">
                            {shift}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button className="flex-1" size="sm">
                      Renew Subscription
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-2 border-amber-200 bg-amber-50/50 shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <XCircle className="size-5 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-amber-900">No Active Subscription</p>
                      <p className="text-sm text-amber-800 mt-1">
                        This student can purchase a new subscription to access library facilities.
                      </p>
                      <Button size="sm" className="mt-3">
                        Create Subscription
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Subscription History */}
            <Card className="border border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Subscription History ({student.subscriptions.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {student.subscriptions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No subscription history
                  </p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {student.subscriptions.map((sub, idx) => (
                      <div
                        key={sub.id}
                        className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-foreground">
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
                              className="text-xs"
                            >
                              {sub.status}
                            </Badge>
                          </div>
                          <p className="text-sm font-bold text-foreground">₹{sub.totalAmount}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {new Date(sub.startDate).toLocaleDateString('en-IN')} → {new Date(sub.endDate).toLocaleDateString('en-IN')}
                        </p>
                        {sub.shiftName.length > 0 && (
                          <div className="flex gap-1 flex-wrap mb-2">
                            {sub.shiftName.map((shift, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs capitalize">
                                {shift}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Paid: ₹{sub.amountPaid}</span>
                          <span className={sub.amountPaid === sub.totalAmount ? 'text-emerald-600 font-semibold' : 'text-amber-600 font-semibold'}>
                            {sub.amountPaid === sub.totalAmount ? 'Fully Paid' : `Due: ₹${sub.totalAmount - sub.amountPaid}`}
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
