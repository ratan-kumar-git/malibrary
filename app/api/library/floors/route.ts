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

export async function PUT(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { libraryId, floors } = (await req.json()) as SyncFloorsRequest;
    
    if (!libraryId)
      return NextResponse.json(
        { error: "Library ID required" },
        { status: 400 },
      );

    const incomingIds = floors
      .filter((f) => !f.id.startsWith("temp-"))
      .map((f) => f.id);
    const floorsToCreate = floors.filter((f) => f.id.startsWith("temp-"));
    const floorsToUpdate = floors.filter((f) => !f.id.startsWith("temp-"));

    await prisma.$transaction(
      async (tx) => {
        // 1. Delete floors not in incoming list
        await tx.floor.deleteMany({
          where: { libraryId, id: { notIn: incomingIds } },
        });

        // 2. Create new floors and their seats
        for (const f of floorsToCreate) {
          const createdFloor = await tx.floor.create({
            data: { name: f.name, totalSeats: f.totalSeats, libraryId },
          });

          const seats = Array.from({ length: f.totalSeats }, (_, i) => ({
            seatNo: i + 1,
            floorId: createdFloor.id,
            isActive: true,
          }));

          await tx.seat.createMany({ data: seats });
        }

        // 3. Update existing floors and manage seats
        for (const f of floorsToUpdate) {
          await tx.floor.update({
            where: { id: f.id },
            data: { name: f.name, totalSeats: f.totalSeats },
          });

          const existingSeats = await tx.seat.findMany({
            where: { floorId: f.id },
            orderBy: { seatNo: "asc" },
            select: {
              id: true,
              seatNo: true,
              _count: { select: { subscriptions: true } },
            },
          });

          const currentCount = existingSeats.length;

          if (f.totalSeats > currentCount) {
            // Bulk Create missing seats
            const newSeats = Array.from(
              { length: f.totalSeats - currentCount },
              (_, i) => ({
                seatNo: currentCount + i + 1,
                floorId: f.id,
                isActive: true,
              }),
            );
            await tx.seat.createMany({ data: newSeats });
          } else if (f.totalSeats < currentCount) {
            // Bulk Manage excess seats
            const excessSeats = existingSeats.slice(f.totalSeats);

            const seatIdsToDelete = excessSeats
              .filter((s) => s._count.subscriptions === 0)
              .map((s) => s.id);

            const seatIdsToDeactivate = excessSeats
              .filter((s) => s._count.subscriptions > 0)
              .map((s) => s.id);

            if (seatIdsToDelete.length > 0) {
              await tx.seat.deleteMany({
                where: { id: { in: seatIdsToDelete } },
              });
            }
            if (seatIdsToDeactivate.length > 0) {
              await tx.seat.updateMany({
                where: { id: { in: seatIdsToDeactivate } },
                data: { isActive: false },
              });
            }
          }
        }
      },
      { timeout: 20000 },
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to sync floors:", error);
    return NextResponse.json(
      { error: "Failed to synchronize floors" },
      { status: 500 },
    );
  }
}
