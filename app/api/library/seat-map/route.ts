// app/api/seat-map/route.ts

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const library = await prisma.library.findFirst({
      where: { userId: session.user.id },
      select: { id: true },
    })

    const libraryId = library?.id

    const { searchParams } = new URL(req.url);

    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!libraryId || !startDate || !endDate) {
      return NextResponse.json(
        { message: "Missing required params" },
        { status: 400 },
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // 1️⃣ Get floors with seats
    const floors = await prisma.floor.findMany({
      where: { libraryId },
      include: {
        seats: {
          select: {
            id: true,
            seatNo: true,
            isActive: true,
          },
          orderBy: { seatNo: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });

    // 2️⃣ Get subscriptions within date range
    const subscriptions = await prisma.subscription.findMany({
      where: {
        libraryId,
        startDate: { lte: end },
        endDate: { gte: start },
      },
      include: {
        subscriptionShifts: {
          include: {
            shift: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // 3️⃣ Create fast lookup map: seatId + shift → subscription
    const seatShiftMap = new Map<string, any>();

    for (const sub of subscriptions) {
      for (const ss of sub.subscriptionShifts) {
        const shiftName = ss.shift.name.toLowerCase(); // MORNING → morning
        const key = `${sub.seatId}_${shiftName}`;
        seatShiftMap.set(key, sub);
      }
    }

    // 4️⃣ Build final seatMap
    const seatMap: Record<string, any> = {};

    for (const floor of floors) {
      const floorKey = floor.name; // ✅ original floor name

      seatMap[floorKey] = {};

      for (const seat of floor.seats) {
        const seatKey = String(seat.seatNo);

        const shifts: Record<string, any> = {
          morning: null,
          afternoon: null,
          evening: null,
          fullDay: null,
        };

        // If seat is inactive → keep all null
        if (seat.isActive) {
          for (const shiftName of Object.keys(shifts)) {
            const key = `${seat.id}_${shiftName}`;
            const sub = seatShiftMap.get(key);

            if (sub) {
              shifts[shiftName] = {
                id: sub.id,
                studentId: sub.studentId,
                libraryId: sub.libraryId,
                startDate: sub.startDate,
                endDate: sub.endDate,
                seatNo: `${floor.name}-${seat.seatNo}`,
                shift: sub.subscriptionShifts.map((s: any) =>
                  s.shift.name.toLowerCase(),
                ),
                totalFee: sub.totalAmount,
                feeDue: sub.totalAmount - sub.amountPaid,
                isActive: sub.status === "ACTIVE",
                createdAt: sub.createdAt,
                updatedAt: sub.updatedAt,
              };
            }
          }
        }

        seatMap[floorKey][seatKey] = shifts;
      }
    }

    // 5️⃣ Final response
    return NextResponse.json({
      message: "Seat map fetched",
      seatMap,
    });
  } catch (error) {
    console.error("Seat Map Error:", error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
