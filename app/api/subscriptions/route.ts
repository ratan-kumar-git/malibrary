import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const {
      seatId,
      studentId,
      newStudent,
      shiftIds,
      startDate,
      endDate,
      totalAmount,
    } = body;

    // Validate required fields
    if (!seatId || !shiftIds?.length || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get library info
    const library = await prisma.library.findUnique({
      where: { userId: session.user.id },
    });

    if (!library) {
      return NextResponse.json(
        { error: 'User not associated with a library' },
        { status: 403 }
      );
    }

    // Get seat with floor information
    const seat = await prisma.seat.findUnique({
      where: { id: seatId },
      include: { floor: true },
    });

    if (!seat) {
      return NextResponse.json(
        { error: 'Seat not found' },
        { status: 404 }
      );
    }

    const floor = seat.floor;
    if (!floor || floor.libraryId !== library.id) {
      return NextResponse.json(
        { error: 'Floor validation failed' },
        { status: 403 }
      );
    }

    // Get shift info
    const shifts = await prisma.shift.findMany({
      where: {
        id: { in: shiftIds },
        libraryId: library.id,
      },
    });

    if (shifts.length !== shiftIds.length) {
      return NextResponse.json(
        { error: 'One or more shifts not found' },
        { status: 404 }
      );
    }

    // Handle student
    let finalStudentId = studentId;

    if (newStudent) {
      // Create new student
      const createdStudent = await prisma.student.create({
        data: {
          name: newStudent.name,
          phoneNumber: newStudent.phoneNumber,
          gender: newStudent.gender || 'MALE',
          address: newStudent.address,
          libraryId: library.id,
        },
      });

      finalStudentId = createdStudent.id;
    } else if (!studentId) {
      return NextResponse.json(
        { error: 'Student information is required' },
        { status: 400 }
      );
    }

    // Get student details for subscription
    const student = await prisma.student.findUnique({
      where: { id: finalStudentId },
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Check for conflicting seat assignments
    const conflictingAssignments = await prisma.seatAssignment.findMany({
      where: {
        seatId: seat.id,
        shiftId: { in: shifts.map((s) => s.id) },
      },
    });

    if (conflictingAssignments.length > 0) {
      return NextResponse.json(
        { error: 'Seat is not available for selected shifts' },
        { status: 409 }
      );
    }

    // Create subscription
    const subscription = await prisma.subscription.create({
      data: {
        libraryId: library.id,
        studentId: finalStudentId,
        floorName: floor.name,
        seatNo: seat.seatNo,
        shiftName: shifts.map((s) => s.name),
        studentName: student.name,
        studentGender: student.gender,
        studentPhone: student.phoneNumber,
        studentAddress: student.address || '',
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        totalAmount: Math.round(totalAmount) || 0,
        amountPaid: 0,
        status: 'ACTIVE',
      },
    });

    // Create seat assignments for each shift
    await Promise.all(
      shifts.map((shift) =>
        prisma.seatAssignment.create({
          data: {
            seatId: seat.id,
            shiftId: shift.id,
            studentId: finalStudentId,
          },
        })
      )
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          id: subscription.id,
          studentId: finalStudentId,
          studentName: student.name,
          memberId: student.memberId,
          seatNo: seat.seatNo,
          floorName: floor.name,
          startDate: subscription.startDate,
          endDate: subscription.endDate,
          totalAmount: subscription.totalAmount,
          shifts: shifts.map((s) => ({
            id: s.id,
            name: s.name,
            price: s.price,
          })),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Subscription creation error:', error);

    if (
      error instanceof Error &&
      error.message.includes('Unique constraint failed')
    ) {
      return NextResponse.json(
        { error: 'This seat is already booked for these shifts' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create subscription' },
      { status: 500 }
    );
  }
}
