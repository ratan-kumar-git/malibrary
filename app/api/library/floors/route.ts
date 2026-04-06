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

// Helper function to handle seat management when updating totalSeats
async function manageSeatCount(
  floorId: string,
  newTotalSeats: number,
  existingSeats: { id: string; number: number }[]
) {
  const currentSeats = existingSeats.length;

  if (newTotalSeats > currentSeats) {
    // Create new seats
    const seatsToCreate = newTotalSeats - currentSeats;
    const createPromises = [];
    for (let i = 0; i < seatsToCreate; i++) {
      createPromises.push(
        prisma.seat.create({
          data: {
            number: currentSeats + i + 1,
            floorId,
            isActive: true,
          },
        })
      );
    }
    await Promise.all(createPromises);
  } else if (newTotalSeats < currentSeats) {
    // Need to deactivate/delete excess seats
    const excessSeats = existingSeats.slice(newTotalSeats);

    // Check which excess seats can be deleted (have no subscriptions)
    for (const seat of excessSeats) {
      const hasSubscriptions = await prisma.subscription.count({
        where: { seatId: seat.id },
      });

      if (hasSubscriptions === 0) {
        // No subscriptions, safe to delete
        await prisma.seat.delete({
          where: { id: seat.id },
        });
      } else {
        // Has subscriptions, mark as inactive instead
        await prisma.seat.update({
          where: { id: seat.id },
          data: { isActive: false },
        });
      }
    }
  }
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

    const floorsToCreate: FloorPayload[] = floors.filter((f) =>
      f.id.startsWith("temp-")
    );
    const floorsToUpdate: FloorPayload[] = floors.filter(
      (f) => !f.id.startsWith("temp-")
    );

    // Delete floors that are no longer in the list
    await prisma.floor.deleteMany({
      where: {
        libraryId,
        id: { notIn: incomingIds },
      },
    });

    // Create new floors with their seats
    for (const floor of floorsToCreate) {
      const createdFloor = await prisma.floor.create({
        data: {
          name: floor.name,
          libraryId,
        },
      });

      // Create seats for this floor
      const seatCreatePromises = [];
      for (let i = 1; i <= floor.totalSeats; i++) {
        seatCreatePromises.push(
          prisma.seat.create({
            data: {
              number: i,
              floorId: createdFloor.id,
              isActive: true,
            },
          })
        );
      }
      await Promise.all(seatCreatePromises);
    }

    // Update existing floors
    for (const floor of floorsToUpdate) {
      // Update floor name
      await prisma.floor.update({
        where: { id: floor.id },
        data: {
          name: floor.name,
        },
      });

      // Get current seats for this floor
      const existingSeats = await prisma.seat.findMany({
        where: { floorId: floor.id },
        orderBy: { number: "asc" },
      });

      // Manage seat count
      await manageSeatCount(floor.id, floor.totalSeats, existingSeats);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to sync floors:", error);
    return NextResponse.json(
      { error: "Failed to synchronize floors" },
      { status: 500 }
    );
  }
}

