import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { Shift } from "@/lib/validations";

interface SyncShiftsRequest {
  libraryId: string;
  shifts: Shift[];
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { libraryId, shifts } = (await req.json()) as SyncShiftsRequest;

    if (!libraryId) {
      return NextResponse.json(
        { error: "Library ID required" },
        { status: 400 },
      );
    }

    // 1. Security Check: Ensure the library belongs to the user
    const libraryOwner = await prisma.library.findFirst({
      where: {
        id: libraryId,
        userId: session.user.id,
      },
      select: { id: true },
    });

    if (!libraryOwner) {
      return NextResponse.json(
        { error: "Forbidden: Library access denied" },
        { status: 403 },
      );
    }

    // 2. Perform updates in a transaction
    await prisma.$transaction(async (tx) => {
      for (const shift of shifts) {
        await tx.shift.update({
          // Scoped where clause for extra safety
          where: {
            id: shift.id,
            libraryId: libraryId,
          },
          data: {
            startTime: shift.startTime,
            endTime: shift.endTime,
            price: shift.price,
            isActive: shift.isActive,
          },
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to sync shifts:", error);
    return NextResponse.json(
      { error: "Failed to synchronize shifts" },
      { status: 500 },
    );
  }
}
