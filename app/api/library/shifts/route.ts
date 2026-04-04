import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { Shift } from "@/lib/validations";


interface SyncShiftsRequest {
  libraryId: string;
  shifts: Shift[];
}

// update shifts
export async function PUT(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as SyncShiftsRequest;
    const { libraryId, shifts } = body;

    if (!libraryId) {
      return NextResponse.json({ error: "Library ID required" }, { status: 400 });
    }

    await prisma.$transaction(
      shifts.map((shift) =>
        prisma.shift.update({
          where: { id: shift.id },
          data: {
            startTime: shift.startTime,
            endTime: shift.endTime,
            price: shift.price,
            isActive: shift.isActive,
          },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to sync shifts:", error);
    return NextResponse.json(
      { error: "Failed to synchronize shifts" },
      { status: 500 }
    );
  }
}
