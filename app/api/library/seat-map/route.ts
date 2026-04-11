import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 1. Parallel Fetch: Get Library Info and Active Shifts simultaneously
    const [library, activeShifts] = await Promise.all([
      prisma.library.findUnique({
        where: { userId: session.user.id },
        select: { id: true }
      }),
      prisma.shift.findMany({
        where: { library: { userId: session.user.id }, isActive: true },
        select: { id: true, name: true, price: true },
        orderBy: { startTime: 'asc' }
      })
    ]);

    if (!library) return NextResponse.json({ error: "Library not found" }, { status: 404 });

    // 2. Optimized Main Query: Fetch Floors -> Seats -> Assignments in one tree
    // We only select the fields absolutely necessary for the UI
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
                    name: true,
                    memberId: true,
                    subscriptions: {
                      where: { status: "ACTIVE" },
                      take: 1,
                      select: { endDate: true, totalAmount: true, amountPaid: true }
                    }
                  }
                }
              }
            }
          },
          orderBy: { seatNo: "asc" }
        }
      },
      orderBy: { name: "asc" }
    });

    // 3. Transform data into the SeatMap structure
    const seatMap: Record<string, any> = {};

    for (const floor of floors) {
      const floorData: Record<number, any> = {};

      for (const seat of floor.seats) {
        const shiftsObj: Record<string, any> = {};

        // Initialize all active shifts as null (Vacant)
        for (const s of activeShifts) {
          shiftsObj[s.name] = null;
        }

        // Fill in the assignments
        for (const asg of seat.assignments) {
          // Find which shift name this assignment belongs to
          const shiftInfo = activeShifts.find(s => s.id === asg.shiftId);
          if (!shiftInfo) continue;

          const sub = asg.student.subscriptions[0];
          
          shiftsObj[shiftInfo.name] = {
            studentName: asg.student.name,
            memberId: asg.student.memberId,
            expiry: sub?.endDate || null,
            isDue: sub ? (sub.totalAmount > sub.amountPaid) : false
          };
        }

        floorData[seat.seatNo] = {
          id: seat.id,
          active: seat.isActive,
          shifts: shiftsObj
        };
      }
      seatMap[floor.name] = floorData;
    }

    return NextResponse.json({
      activeShifts: activeShifts.map(s => s.name),
      seatMap
    });

  } catch (error) {
    console.error("Optimized SeatMap Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}