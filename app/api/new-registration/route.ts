import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phoneNumber, gender, address, libraryId } = body;

    // Validate required fields
    if (!name || !phoneNumber || !gender || !libraryId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Check if library exists
    const library = await prisma.library.findUnique({
      where: { id: libraryId },
    });

    if (!library) {
      return NextResponse.json({ error: "Library not found" }, { status: 404 });
    }

    // Check if student already exists in this library
    const existingStudent = await prisma.student.findUnique({
      where: {
        libraryId_phoneNumber: {
          libraryId,
          phoneNumber,
        },
      },
      select: { id: true },
    });

    if (existingStudent) {
      return NextResponse.json(
        {
          error:
            "A student with this phone number already exists in this library",
        },
        { status: 409 },
      );
    }

    // Create the student
    const student = await prisma.student.create({
      data: {
        name,
        phoneNumber,
        gender,
        address: address || null,
        libraryId,
      },
    });

    return NextResponse.json({ success: true, data: student }, { status: 201 });
  } catch (error: any) {
    console.error("Public Student Registration Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
