import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { floorSchema } from "@/lib/validations";
import { ZodError } from "zod";
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

    const floors = await prisma.floor.findMany({
      where: { libraryId },
    });

    return NextResponse.json(floors);
  } catch (error) {
    console.error("Failed to fetch floors:", error);
    return NextResponse.json({ error: "Failed to fetch floors" }, { status: 500 });
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
    const { libraryId, name, totalSeats } = body;

    if (!libraryId) {
      return NextResponse.json({ error: "Library ID required" }, { status: 400 });
    }

    // Validate floor data
    const validatedData = floorSchema.parse({ name, totalSeats });

    const floor = await prisma.floor.create({
      data: {
        libraryId,
        ...validatedData,
      },
    });

    return NextResponse.json(floor, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Failed to create floor:", error);
    return NextResponse.json({ error: "Failed to create floor" }, { status: 500 });
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
    const { floorId, name, totalSeats } = body;

    if (!floorId) {
      return NextResponse.json({ error: "Floor ID required" }, { status: 400 });
    }

    // Validate floor data
    const validatedData = floorSchema.parse({ name, totalSeats });

    const floor = await prisma.floor.update({
      where: { id: floorId },
      data: validatedData,
    });

    return NextResponse.json(floor);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Failed to update floor:", error);
    return NextResponse.json({ error: "Failed to update floor" }, { status: 500 });
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

    const floorId = req.nextUrl.searchParams.get("floorId");
    if (!floorId) {
      return NextResponse.json({ error: "Floor ID required" }, { status: 400 });
    }

    await prisma.floor.delete({
      where: { id: floorId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete floor:", error);
    return NextResponse.json({ error: "Failed to delete floor" }, { status: 500 });
  }
}

