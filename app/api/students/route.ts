import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const students = await prisma.student.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        subscriptions: {
          orderBy: {
            endDate: "desc",
          },
          select: {
            id: true,
            status: true,
            endDate: true,
          },
        },
      },
    });

    return NextResponse.json(
      { success: true, data: students },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fetch Students Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch students" },
      { status: 500 }
    );
  }
}