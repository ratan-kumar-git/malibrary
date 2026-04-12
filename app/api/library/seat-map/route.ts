import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

interface ShiftData {
  studentName: string;
  studentPhone: string;
  studentGender: string;
  memberId: number;
  studentId: string;
  startDate: Date | null;
  expiry: Date | null;
  isDue: boolean;
  subscriptionId: string | null;
}

interface SeatInfo {
  id: string;
  active: boolean;
  shifts: Record<string, ShiftData | null>;
}

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [library, allShifts, activeShifts] = await Promise.all([
      prisma.library.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      }),
      prisma.shift.findMany({
        where: { library: { userId: session.user.id } },
        select: { id: true, name: true, isActive: true },
        orderBy: { startTime: "asc" },
      }),
      prisma.shift.findMany({
        where: { library: { userId: session.user.id }, isActive: true },
        select: { id: true, name: true },
        orderBy: { startTime: "asc" },
      }),
    ]);

    if (!library)
      return NextResponse.json({ error: "Library not found" }, { status: 404 });

    const floors = await prisma.floor.findMany({
      where: { libraryId: library.id },
      select: {
        id: true,
        name: true,
        seats: {
          select: {
            id: true,
            seatNo: true,
            isActive: true,
            assignments: {
              include: {
                student: {
                  select: {
                    id: true,
                    name: true,
                    memberId: true,
                    phoneNumber: true,
                    gender: true,
                    subscriptions: {
                      where: { status: "ACTIVE" },
                      orderBy: { createdAt: "desc" },
                      take: 1,
                      select: {
                        id: true,
                        startDate: true,
                        endDate: true,
                        totalAmount: true,
                        amountPaid: true,
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: { seatNo: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });

    const seatMap: Record<string, Record<number, SeatInfo>> = {};

    for (const floor of floors) {
      const floorData: Record<number, SeatInfo> = {};

      for (const seat of floor.seats) {
        const shiftsObj: Record<string, ShiftData | null> = {};

        for (const s of allShifts) {
          shiftsObj[s.name] = null;
        }

        for (const asg of seat.assignments) {
          const shiftInfo = allShifts.find((s) => s.id === asg.shiftId);
          if (!shiftInfo) continue;

          const sub = asg.student.subscriptions[0];

          shiftsObj[shiftInfo.name] = {
            studentName: asg.student.name,
            studentPhone: asg.student.phoneNumber,
            studentGender: asg.student.gender,
            memberId: asg.student.memberId,
            studentId: asg.student.id,
            startDate: sub?.startDate || null,
            expiry: sub?.endDate || null,
            isDue: sub ? sub.totalAmount > sub.amountPaid : false,
            subscriptionId: sub?.id || null,
          };
        }

        floorData[seat.seatNo] = {
          id: seat.id,
          active: seat.isActive,
          shifts: shiftsObj,
        };
      }
      seatMap[floor.name] = floorData;
    }

    return NextResponse.json({
      activeShifts: activeShifts.map((s) => s.name),
      allShifts: allShifts.map((s) => ({ name: s.name, isActive: s.isActive })),
      seatMap,
    });
  } catch (error) {
    console.error("SeatMap Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
