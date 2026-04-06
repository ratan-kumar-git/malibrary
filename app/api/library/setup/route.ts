import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { librarySetupSchema } from "@/lib/validations";
import { ZodError } from "zod";

// create all library details, floors and shifts in one transaction
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = librarySetupSchema.parse(body);

    const library = await prisma.library.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        contactNumber: validatedData.contactNumber,
        address: validatedData.address,
        district: validatedData.district,
        state: validatedData.state,
        pincode: validatedData.pincode,
        facilities: validatedData.facilities,
        userId: session.user.id,
      },
    });

    // Create floors with their seats
    for (const floorData of validatedData.floors) {
      const floor = await prisma.floor.create({
        data: {
          name: floorData.name,
          libraryId: library.id,
        },
      });

      // Create seats for this floor
      const seatCreatePromises = [];
      for (let i = 1; i <= floorData.totalSeats; i++) {
        seatCreatePromises.push(
          prisma.seat.create({
            data: {
              number: i,
              floorId: floor.id,
              isActive: true,
            },
          })
        );
      }
      await Promise.all(seatCreatePromises);
    }

    // Create shifts
    const shiftCreatePromises = validatedData.shifts.map((shift) =>
      prisma.shift.create({
        data: {
          name: shift.name,
          startTime: shift.startTime,
          endTime: shift.endTime,
          price: shift.price,
          isActive: shift.isActive,
          libraryId: library.id,
        },
      })
    );
    await Promise.all(shiftCreatePromises);

    // Fetch complete library data with relations
    const completeLibrary = await prisma.library.findUnique({
      where: { id: library.id },
      include: {
        floors: {
          include: {
            seats: true,
          },
        },
        shifts: true,
      },
    });

    return NextResponse.json(completeLibrary, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Setup failed:", error);
    return NextResponse.json(
      { error: "Failed to complete setup" },
      { status: 500 }
    );
  }
}