import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      seatId,
      name,
      gender,
      phoneNumber,
      address,
      lockerNumber,
      selectedShifts,
      startDate,
      endDate,
      totalAmount = 0,
      amountPaid = 0,
    } = body;

    console.log('Registration payload received:', { seatId, selectedShifts, startDate, endDate });

    // Validate required fields
    if (!name || !gender || !phoneNumber || !seatId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get the seat to find library ID and verify it exists
    const seat = await prisma.seat.findFirst({
      where: {
        id: seatId,
      },
      include: {
        floor: {
          select: {
            libraryId: true,
          },
        },
      },
    });

    if (!seat) {
      return NextResponse.json(
        { error: "Seat not found" },
        { status: 400 }
      );
    }

    // Get libraryId from the seat's floor
    const libraryId = seat.floor.libraryId;

    // Generate a member ID
    const memberIdNumber = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, "0");
    const memberId = `MA${memberIdNumber}`;

    // Create student and subscription in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create student
      const student = await tx.student.create({
        data: {
          memberId,
          name,
          gender,
          phoneNumber,
          address: address || null,
          lockerNumber: lockerNumber ? parseInt(lockerNumber) : null,
          libraryId,
        },
      });

      // Create subscription if shifts are selected
      if (selectedShifts && selectedShifts.length > 0) {
        // Verify all shifts exist and belong to this library
        const shiftsExist = await tx.shift.findMany({
          where: {
            id: { in: selectedShifts },
            libraryId: libraryId,
          },
        });

        console.log(`Found ${shiftsExist.length} valid shifts out of ${selectedShifts.length} requested`);
        
        if (shiftsExist.length !== selectedShifts.length) {
          throw new Error("One or more selected shifts are not available for this library");
        }

        const subscription = await tx.subscription.create({
          data: {
            studentId: student.id,
            libraryId,
            seatId: seat.id,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            totalAmount: parseFloat(totalAmount) || 0,
            amountPaid: parseFloat(amountPaid) || 0,
            status: "ACTIVE",
          },
        });

        // Create subscription shifts - use shift IDs directly
        for (const shiftId of selectedShifts) {
          console.log(`Creating SubscriptionShift with shiftId: ${shiftId}`);
          await tx.subscriptionShift.create({
            data: {
              subscriptionId: subscription.id,
              shiftId,
            },
          });
        }

        return { student, subscription };
      }

      return { student };
    });

    return NextResponse.json(
      {
        success: true,
        message: "Student registered successfully",
        data: {
          memberId: result.student.memberId,
          studentId: result.student.id,
          subscription: result.subscription || null,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to register student" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get library ID from query params
    const libraryId = request.nextUrl.searchParams.get("libraryId");

    if (!libraryId) {
      return NextResponse.json(
        { error: "Library ID is required" },
        { status: 400 }
      );
    }

    // Fetch students
    const students = await prisma.student.findMany({
      where: { libraryId },
      include: {
        subscriptions: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: students,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fetch students error:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}
