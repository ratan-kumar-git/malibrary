import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;

    // Try to find by student ID first, then by memberId
    let student = await prisma.student.findUnique({
      where: { id },
      include: {
        subscriptions: {
          orderBy: { startDate: "desc" },
          include: {
            seat: {
              include: {
                floor: {
                  include: {
                    library: true,
                  },
                },
              },
            },
            subscriptionShifts: {
              include: { shift: true },
            },
          },
        },
      },
    });

    // If not found by ID, try by memberId
    if (!student && id) {
      student = await prisma.student.findUnique({
        where: { memberId: id },
        include: {
          subscriptions: {
            orderBy: { startDate: "desc" },
            include: {
              seat: {
                include: {
                  floor: {
                    include: {
                      library: true,
                    },
                  },
                },
              },
              subscriptionShifts: {
                include: { shift: true },
              },
            },
          },
        },
      });
    }

    if (!student) {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: student }, { status: 200 });
  } catch (error) {
    console.error("Fetch Student Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { name, gender, phoneNumber, address, lockerNumber } = body;

    if (lockerNumber) {
      const existingLocker = await prisma.student.findUnique({
        where: { lockerNumber: Number(lockerNumber) },
      });

      if (existingLocker && existingLocker.id !== id) {
        return NextResponse.json(
          {
            success: false,
            message: `Locker ${lockerNumber} is already in use by another student.`,
          },
          { status: 400 },
        );
      }
    }

    const updatedStudent = await prisma.student.update({
      where: { id },
      data: {
        name,
        gender,
        phoneNumber,
        address,
        lockerNumber: lockerNumber ? Number(lockerNumber) : null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Student updated successfully",
        data: updatedStudent,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Update Student Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update student" },
      { status: 500 },
    );
  }
}

// DELETE STUDENT
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;

    await prisma.student.delete({
      where: { id },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Student and related records deleted successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Delete Student Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete student" },
      { status: 500 },
    );
  }
}
