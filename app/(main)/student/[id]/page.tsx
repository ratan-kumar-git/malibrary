'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, MapPin, Phone, User, Armchair, Clock, AlertCircle } from 'lucide-react';

interface StudentData {
  id: string;
  name: string;
  gender: string;
  phoneNumber: string;
  address: string | null;
  lockerNumber: number | null;
  memberId: string | null;
  createdAt: string;
}

interface SubscriptionData {
  id: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  amountPaid: number;
  status: 'ACTIVE' | 'EXPIRED' | 'UPCOMING';
  seat: {
    id: string;
    seatNo: number;
    floor: {
      id: string;
      name: string;
      library: {
        id: string;
        name: string;
      };
    };
  };
  subscriptionShifts: Array<{
    shift: {
      id: string;
      name: string;
    };
  }>;
}

interface StudentProfileData {
  student: StudentData;
  subscriptions: SubscriptionData[];
  currentSubscription: SubscriptionData | null;
}

export default function StudentProfilePage() {
  const params = useParams();
  const studentId = params?.id;
  const [data, setData] = useState<StudentProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          const subscriptions = student.subscriptions || [];
          const currentSubscription = subscriptions.find(
            (sub: SubscriptionData) => sub.status === 'ACTIVE'
          ) || null;

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
            },
            subscriptions,
            currentSubscription,
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

  const { student, subscriptions, currentSubscription } = data;

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 pt-24">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{student.name}</h1>
            <p className="text-muted-foreground mt-1">Member ID: {student.memberId || 'N/A'}</p>
          </div>
          <Badge variant="outline" className="text-base">
            {subscriptions.length > 0 ? 'Active Member' : 'No Active Subscription'}
          </Badge>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Student Details */}
          <div className="md:col-span-1 space-y-6">
            {/* Personal Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="size-4" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Gender</p>
                  <p className="text-sm font-medium text-foreground capitalize">{student.gender}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Phone className="size-3" />
                    Phone Number
                  </p>
                  <p className="text-sm font-medium text-foreground">{student.phoneNumber}</p>
                </div>
                {student.address && (
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="size-3" />
                      Address
                    </p>
                    <p className="text-sm font-medium text-foreground">{student.address}</p>
                  </div>
                )}
                {student.lockerNumber && (
                  <div>
                    <p className="text-sm text-muted-foreground">Locker Number</p>
                    <p className="text-sm font-medium text-foreground">#{student.lockerNumber}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="size-3" />
                    Joined
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {new Date(student.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Subscriptions</span>
                  <span className="text-2xl font-bold text-primary">{subscriptions.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active</span>
                  <span className="text-lg font-semibold text-green-600">
                    {subscriptions.filter((s) => s.status === 'ACTIVE').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Expired</span>
                  <span className="text-lg font-semibold text-red-600">
                    {subscriptions.filter((s) => s.status === 'EXPIRED').length}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Subscription Details */}
          <div className="md:col-span-2 space-y-6">
            {/* Current Subscription */}
            {currentSubscription ? (
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Armchair className="size-4" />
                    Current Subscription
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Seat Number</p>
                      <p className="text-xl font-bold text-foreground">
                        #{currentSubscription.seat.seatNo}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Floor</p>
                      <p className="text-lg font-semibold text-foreground">
                        {currentSubscription.seat.floor.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Library</p>
                      <p className="text-lg font-semibold text-foreground">
                        {currentSubscription.seat.floor.library.name}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                    <div>
                      <p className="text-sm text-muted-foreground">Start Date</p>
                      <p className="text-sm font-medium text-foreground">
                        {new Date(currentSubscription.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">End Date</p>
                      <p className="text-sm font-medium text-foreground">
                        {new Date(currentSubscription.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Amount</p>
                      <p className="text-lg font-bold text-foreground">
                        ₹{currentSubscription.totalAmount}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Amount Paid</p>
                      <p className="text-lg font-semibold text-green-600">
                        ₹{currentSubscription.amountPaid}
                      </p>
                    </div>
                  </div>

                  {currentSubscription.subscriptionShifts.length > 0 && (
                    <div className="pt-4 border-t border-border">
                      <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                        <Clock className="size-3" />
                        Assigned Shifts
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {currentSubscription.subscriptionShifts.map((ss, idx) => (
                          <Badge key={idx} variant="secondary">
                            {ss.shift.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button className="flex-1" size="sm">
                      Renew Subscription
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Change Seat
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="pt-6">
                  <p className="text-sm text-amber-900">
                    No active subscription. Student can purchase a new subscription.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Subscription History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Subscription History</CardTitle>
              </CardHeader>
              <CardContent>
                {subscriptions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No subscription history
                  </p>
                ) : (
                  <div className="space-y-3">
                    {subscriptions.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-start justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-foreground">
                              Seat #{sub.seat.seatNo} - {sub.seat.floor.name}
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
                          <p className="text-xs text-muted-foreground">
                            {new Date(sub.startDate).toLocaleDateString()} -{' '}
                            {new Date(sub.endDate).toLocaleDateString()}
                          </p>
                          {sub.subscriptionShifts.length > 0 && (
                            <div className="flex gap-1 flex-wrap mt-1">
                              {sub.subscriptionShifts.map((ss, idx) => (
                                <span key={idx} className="text-xs text-muted-foreground">
                                  {ss.shift.name}
                                  {idx < sub.subscriptionShifts.length - 1 && ', '}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-semibold text-foreground">₹{sub.totalAmount}</p>
                          <p className="text-xs text-muted-foreground">
                            Paid: ₹{sub.amountPaid}
                          </p>
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
