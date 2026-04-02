import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { shiftSchema } from "@/lib/validations";
import { ZodError } from "zod";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const libraryId = req.nextUrl.searchParams.get("libraryId");
    if (!libraryId) {
      return NextResponse.json({ error: "Library ID required" }, { status: 400 });
    }

    const shifts = await prisma.shift.findMany({
      where: { libraryId },
    });

    return NextResponse.json(shifts);
  } catch (error) {
    console.error("Failed to fetch shifts:", error);
    return NextResponse.json({ error: "Failed to fetch shifts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { libraryId, name, startTime, endTime, price, active } = body;

    if (!libraryId) {
      return NextResponse.json({ error: "Library ID required" }, { status: 400 });
    }

    // Validate shift data
    const validatedData = shiftSchema.parse({ name, startTime, endTime, price, active });

    const shift = await prisma.shift.create({
      data: {
        libraryId,
        ...validatedData,
      },
    });

    return NextResponse.json(shift, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Failed to create shift:", error);
    return NextResponse.json({ error: "Failed to create shift" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { shiftId, startTime, endTime, price, active } = body;

    if (!shiftId) {
      return NextResponse.json({ error: "Shift ID required" }, { status: 400 });
    }

    // Validate shift data - only validate fields being updated
    const updateData: any = {};
    if (startTime !== undefined) updateData.startTime = startTime;
    if (endTime !== undefined) updateData.endTime = endTime;
    if (price !== undefined) updateData.price = price;
    if (active !== undefined) updateData.active = active;

    // Validate partial shift data
    const validationSchema = shiftSchema.partial();
    const validatedData = validationSchema.parse(updateData);

    const shift = await prisma.shift.update({
      where: { id: shiftId },
      data: validatedData,
    });

    return NextResponse.json(shift);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Failed to update shift:", error);
    return NextResponse.json({ error: "Failed to update shift" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const shiftId = req.nextUrl.searchParams.get("shiftId");

    if (!shiftId) {
      return NextResponse.json({ error: "Shift ID required" }, { status: 400 });
    }

    await prisma.shift.delete({
      where: { id: shiftId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete shift:", error);
    return NextResponse.json({ error: "Failed to delete shift" }, { status: 500 });
  }
}
