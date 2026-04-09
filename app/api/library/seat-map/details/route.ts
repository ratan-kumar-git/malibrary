import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    // 1. Authenticate User
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const library = await prisma.library.findFirst({
      where: { userId: session.user.id },
      select: { id: true },
    });

    const libraryId = library?.id;

    // 2. Parse Query Parameters
    const { searchParams } = new URL(req.url);
    const seatId = searchParams.get("seatId");
    const dateParam = searchParams.get("date"); // Useful if booking for a future date

    if (!libraryId || !seatId) {
      return NextResponse.json(
        { message: "Missing required parameters (seatId)" },
        { status: 400 },
      );
    }

    // Default to today if no date is provided
    const targetDate = dateParam ? new Date(dateParam) : new Date();
    const startOfTargetDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfTargetDay = new Date(targetDate.setHours(23, 59, 59, 999));

    // 3. Fetch Seat and Floor Details
    const seat = await prisma.seat.findFirst({
      where: {
        id: seatId,
        floor: { libraryId },
        isActive: true, // Ensure the seat itself isn't disabled
      },
      include: {
        floor: { select: { name: true } },
      },
    });

    if (!seat) {
      return NextResponse.json(
        { message: "Seat not found or currently inactive." },
        { status: 404 }
      );
    }

    // 4. Fetch all ACTIVE shifts for this library
    const allActiveShifts = await prisma.shift.findMany({
      where: {
        libraryId,
        isActive: true, // Only fetch shifts the admin has marked as active
      },
    });

    // 5. Find existing active subscriptions for THIS seat on the target date
    const activeSubscriptions = await prisma.subscription.findMany({
      where: {
        libraryId,
        seatId,
        status: "ACTIVE",
        // Subscription must overlap with our target date
        startDate: { lte: endOfTargetDay },
        endDate: { gte: startOfTargetDay },
      },
      include: {
        subscriptionShifts: {
          select: { shiftId: true },
        },
      },
    });

    // 6. Extract the IDs of shifts that are already booked
    const bookedShiftIds = new Set<string>();
    activeSubscriptions.forEach((sub) => {
      sub.subscriptionShifts.forEach((ss) => {
        bookedShiftIds.add(ss.shiftId);
      });
    });

    // 7. Filter out booked shifts to get only available ones
    const availableShifts = allActiveShifts.filter(
      (shift) => !bookedShiftIds.has(shift.id)
    );

    // 8. Return structured data for the frontend
    return NextResponse.json({
      seat: {
        id: seat.id,
        seatNo: seat.seatNo,
        floorName: seat.floor.name,
      },
      availableShifts: availableShifts.map(shift => ({
        id: shift.id,
        name: shift.name, // MORNING, AFTERNOON, etc.
        price: shift.price,
        startTime: shift.startTime,
        endTime: shift.endTime,
      })),
      // Optional: Send back what's booked just in case the UI needs to show it as disabled
      bookedShiftIds: Array.from(bookedShiftIds), 
    });

  } catch (error) {
    console.error("Seat Details API Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}