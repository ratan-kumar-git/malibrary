import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const seatId = searchParams.get("seatId");
  const dateStr = searchParams.get("date");

  if (!seatId || !dateStr)
    return NextResponse.json({ error: "Missing params" }, { status: 400 });

  try {
    const checkDate = new Date(dateStr);

    // 1. Get the Seat and its Library context - only fetch active shifts
    const seat = await prisma.seat.findUnique({
      where: { id: seatId },
      include: {
        floor: {
          include: {
            library: {
              include: {
                shifts: {
                  where: { isActive: true },
                  select: {
                    id: true,
                    name: true,
                    startTime: true,
                    endTime: true,
                    price: true,
                    isActive: true,
                  },
                  orderBy: { startTime: "asc" },
                },
              },
            },
          },
        },
      },
    });

    if (!seat)
      return NextResponse.json({ error: "Seat not found" }, { status: 404 });

    // 2. Find existing active subscriptions for this seat on this date
    const activeSubscriptions = await prisma.subscription.findMany({
      where: {
        seatId: seatId,
        status: "ACTIVE",
        startDate: { lte: checkDate },
        endDate: { gte: checkDate },
      },
      select: { subscriptionShifts: { select: { shiftId: true } } },
    });

    // Extract shift IDs that are already booked
    const occupiedShiftIds = activeSubscriptions.flatMap((sub) =>
      sub.subscriptionShifts.map((ss) => ss.shiftId),
    );

    return NextResponse.json({
      seatNo: seat.seatNo,
      shifts: seat.floor.library.shifts,
      occupiedShiftIds: occupiedShiftIds,
    });
  } catch (error) {
    console.error("Seat availability check error:", error);
    return NextResponse.json(
      { error: "Failed to check seat availability" },
      { status: 500 }
    );
  }
}
