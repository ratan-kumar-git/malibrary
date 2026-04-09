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
    });

    const libraryId = library?.id;

    const { searchParams } = new URL(req.url);
    const targetDateStr = searchParams.get("date");

    if (!libraryId || !targetDateStr) {
      return NextResponse.json(
        { message: "Missing required params" },
        { status: 400 },
      );
    }

    const startOfDay = new Date(`${targetDateStr}T00:00:00.000Z`);
    const endOfDay = new Date(`${targetDateStr}T23:59:59.999Z`);

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

    const subscriptions = await prisma.subscription.findMany({
      where: {
        libraryId,
        status: "ACTIVE",
        startDate: { lte: endOfDay },
        endDate: { gte: startOfDay },
      },
      include: {
        student: {
          select: {
            name: true,
            memberId: true,
            phoneNumber: true,
          },
        },
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

    const seatShiftMap = new Map<string, any>();

    for (const sub of subscriptions) {
      for (const ss of sub.subscriptionShifts) {
        const shiftName = ss.shift.name; 
        const key = `${sub.seatId}_${shiftName}`;
        seatShiftMap.set(key, sub);
      }
    }

    const seatMap: Record<string, any> = {};

    for (const floor of floors) {
      const floorKey = floor.name;
      seatMap[floorKey] = {};

      for (const seat of floor.seats) {
        const seatKey = String(seat.seatNo);

        // 👇 Updated to match your exact 4 enum values
        const shifts: Record<string, any> = {
          MORNING: null,
          AFTERNOON: null,
          EVENING: null,
          NIGHT: null,
        };

        if (seat.isActive) {
          for (const shiftName of Object.keys(shifts)) {
            const key = `${seat.id}_${shiftName}`;
            const sub = seatShiftMap.get(key);

            if (sub) {
              shifts[shiftName] = {
                id: sub.id,
                studentId: sub.studentId,
                studentName: sub.student.name,
                memberId: sub.student.memberId,
                phoneNumber: sub.student.phoneNumber,
                libraryId: sub.libraryId,
                startDate: sub.startDate,
                endDate: sub.endDate,
                seatNo: `${floor.name}-${seat.seatNo}`,
                shift: sub.subscriptionShifts.map((s: any) => s.shift.name),
                totalFee: sub.totalAmount,
                feeDue: sub.totalAmount - sub.amountPaid,
                isActive: sub.status === "ACTIVE",
                createdAt: sub.createdAt,
                updatedAt: sub.updatedAt,
              };
            }
          }
        }

        seatMap[floorKey][seatKey] = {
          seatId: seat.id,
          floorId: floor.id,
          seatNo: seat.seatNo,
          shifts: shifts,
        };
      }
    }

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