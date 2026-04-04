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
        // Create floors
        floors: {
          create: validatedData.floors.map((floor) => ({
            name: floor.name,
            totalSeats: floor.totalSeats,
          }))
        },
        // Create shifts
        shifts: {
          create: validatedData.shifts
            .map((shift) => ({
              name: shift.name,
              startTime: shift.startTime,
              endTime: shift.endTime,
              price: shift.price,
              isActive: shift.isActive, 
            }))
        }
      },
      include: {
        floors: true,
        shifts: true,
      },
    });

    return NextResponse.json(library, { status: 201 });
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