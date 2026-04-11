import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';

interface HistoryRecord {
  id: string;
  type: 'NEW_BOOKING' | 'RENEWAL' | 'EXPIRY' | 'PAYMENT' | 'EDIT';
  studentName: string;
  memberId: number;
  studentId: string;
  seatNo: number;
  floorName: string;
  shifts: string[];
  amount: number;
  previousAmount?: number;
  status: 'ACTIVE' | 'EXPIRED';
  startDate: string;
  endDate: string;
  timestamp: string;
  description: string;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get library info
    const library = await prisma.library.findUnique({
      where: { userId: session.user.id },
    });

    if (!library) {
      return NextResponse.json(
        { error: 'Library not found' },
        { status: 404 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search')?.toLowerCase() || '';
    const type = searchParams.get('type') || 'ALL';
    const status = searchParams.get('status') || 'ALL';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const isExport = searchParams.get('export') === 'true';

    const skip = (page - 1) * pageSize;

    // Build where clause
    const whereClause: any = {
      libraryId: library.id,
    };

    // Add search filter
    if (search) {
      whereClause.OR = [
        { studentName: { contains: search, mode: 'insensitive' } },
        { floorName: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Add status filter
    if (status !== 'ALL') {
      whereClause.status = status;
    }

    // Fetch subscriptions
    const subscriptions = await prisma.subscription.findMany({
      where: whereClause,
      include: {
        student: {
          select: { id: true, memberId: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
      skip: isExport ? 0 : skip,
      take: isExport ? 1000 : pageSize,
    });

    // Count total
    const total = await prisma.subscription.count({
      where: whereClause,
    });

    // Determine activity type based on status and dates
    const records: HistoryRecord[] = subscriptions.map((sub) => {
      // Simple heuristic: determine if it's a renewal based on time difference
      const timeDiff = sub.updatedAt.getTime() - sub.createdAt.getTime();
      const daysDiff = timeDiff / (1000 * 60 * 60 * 24);

      let activityType: HistoryRecord['type'] = 'NEW_BOOKING';
      if (daysDiff > 1) {
        activityType = 'RENEWAL';
      } else if (sub.status === 'EXPIRED') {
        activityType = 'EXPIRY';
      }

      // Filter type if specified
      if (type !== 'ALL' && activityType !== type) {
        return null as any;
      }

      return {
        id: sub.id,
        type: activityType,
        studentName: sub.studentName,
        memberId: sub.student?.memberId || 0,
        studentId: sub.studentId || '',
        seatNo: sub.seatNo,
        floorName: sub.floorName,
        shifts: sub.shiftName,
        amount: sub.totalAmount,
        status: sub.status,
        startDate: sub.startDate.toISOString(),
        endDate: sub.endDate.toISOString(),
        timestamp: sub.createdAt.toISOString(),
        description: `${sub.studentName} - Seat ${sub.seatNo} in ${sub.floorName}`,
      };
    }).filter(Boolean);

    // Handle CSV export
    if (isExport) {
      const csv = convertToCSV(records);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="history.csv"',
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: records,
      total: records.length,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('History API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch history' },
      { status: 500 }
    );
  }
}

function convertToCSV(records: HistoryRecord[]): string {
  const headers = [
    'Type',
    'Student Name',
    'Member ID',
    'Floor',
    'Seat',
    'Shifts',
    'Amount (₹)',
    'Status',
    'Start Date',
    'End Date',
    'Date',
  ];

  const rows = records.map((record) => [
    record.type,
    record.studentName,
    `MID${String(record.memberId).padStart(4, '0')}`,
    record.floorName,
    record.seatNo,
    record.shifts.join(', '),
    record.amount,
    record.status,
    new Date(record.startDate).toLocaleDateString(),
    new Date(record.endDate).toLocaleDateString(),
    new Date(record.timestamp).toLocaleDateString(),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => `"${cell}"`).join(',')
    ),
  ].join('\n');

  return csvContent;
}
