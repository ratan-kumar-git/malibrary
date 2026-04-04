import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

interface FloorPayload {
  id: string;
  name: string;
  totalSeats: number;
}

interface SyncFloorsRequest {
  libraryId: string;
  floors: FloorPayload[];
}

// create, update, delete floors in one transaction
export async function PUT(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as SyncFloorsRequest;
    const { libraryId, floors } = body;

    if (!libraryId) {
      return NextResponse.json({ error: "Library ID required" }, { status: 400 });
    }

    const incomingIds: string[] = floors
      .filter((f) => !f.id.startsWith("temp-"))
      .map((f) => f.id);

    const floorsToCreate: FloorPayload[] = floors.filter((f) => f.id.startsWith("temp-"));
    const floorsToUpdate: FloorPayload[] = floors.filter((f) => !f.id.startsWith("temp-"));

    // Run all operations in one atomic transaction
    await prisma.$transaction([
      prisma.floor.deleteMany({
        where: {
          libraryId,
          id: { notIn: incomingIds },
        },
      }),

      // Create new floors
      ...floorsToCreate.map((f) =>
        prisma.floor.create({
          data: {
            name: f.name,
            totalSeats: f.totalSeats,
            libraryId,
          },
        })
      ),

      // Update existing floors
      ...floorsToUpdate.map((f) =>
        prisma.floor.update({
          where: { id: f.id },
          data: {
            name: f.name,
            totalSeats: f.totalSeats,
          },
        })
      ),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to sync floors:", error);
    return NextResponse.json(
      { error: "Failed to synchronize floors" },
      { status: 500 }
    );
  }
}

