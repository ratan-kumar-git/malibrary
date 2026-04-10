import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    
    const inquiries = await prisma.inquiry.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      { success: true, data: inquiries },
      { status: 200 },
    );
  } catch (error) {
    console.error("Fetch Inquiry Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch inquiries" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      gender,
      phoneNumber,
      address,
      shiftNames,
      joiningDate,
      message,
    } = body;

    const inquiry = await prisma.inquiry.create({
      data: {
        name,
        gender,
        phoneNumber,
        address,
        shiftNames,
        joiningDate: joiningDate ? new Date(joiningDate) : null,
        message,
      },
    });

    return NextResponse.json({ success: true, data: inquiry }, { status: 201 });
  } catch (error) {
    console.error("Inquiry Error:", error);
    return NextResponse.json(
      { error: "Failed to submit inquiry" },
      { status: 500 },
    );
  }
}
