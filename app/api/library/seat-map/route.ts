import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

interface SeatData {
  id: string;
  seatNo: number;
  floor: string;
  floorId: string;
  status: "available" | "booked" | "occupied";
  studentName?: string;
  shift?: string;
  endTime?: string;
  isActive: boolean;
}

interface FloorData {
  id: string;
  name: string;
  seats: SeatData[];
}

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get library with all floors and their seats
    const library = await prisma.library.findFirst({
      where: { userId: session.user.id },
      include: {
        floors: {
          include: {
            seats: {
              include: {
                subscriptions: {
                  where: { status: { in: ["ACTIVE", "UPCOMING"] } },
                  include: {
                    student: true,
                    subscriptionShifts: {
                      include: {
                        shift: true,
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: { name: "asc" },
        },
      },
    });

    if (!library) {
      return NextResponse.json({ error: "Library not found" }, { status: 404 });
    }

    // Transform data for frontend
    const floorsData: FloorData[] = library.floors.map((floor) => {
      const seats = floor.seats.map((seat) => {
        const subscription = seat.subscriptions[0];
        const now = new Date();
        let status: "available" | "booked" | "occupied" = "available";
        let studentName: string | undefined;
        let shift: string | undefined;
        let endTime: string | undefined;

        if (subscription) {
          if (now >= subscription.startDate && now <= subscription.endDate) {
            status = "occupied";
            studentName = subscription.student.name;
            if (subscription.subscriptionShifts.length > 0) {
              shift = subscription.subscriptionShifts[0].shift.name;
              endTime = subscription.subscriptionShifts[0].shift.endTime.toString();
            }
          } else if (now < subscription.startDate) {
            status = "booked";
            studentName = subscription.student.name;
            if (subscription.subscriptionShifts.length > 0) {
              shift = subscription.subscriptionShifts[0].shift.name;
            }
          }
        }

        return {
          id: seat.id,
          seatNo: seat.number,
          floor: floor.name,
          floorId: floor.id,
          status,
          studentName,
          shift,
          endTime,
          isActive: seat.isActive,
        };
      });

      return {
        id: floor.id,
        name: floor.name,
        seats: seats.filter((s) => s.isActive),
      };
    });

    return NextResponse.json(
      {
        success: true,
        data: floorsData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fetch seat map error:", error);
    return NextResponse.json(
      { error: "Failed to fetch seat map" },
      { status: 500 }
    );
  }
}
