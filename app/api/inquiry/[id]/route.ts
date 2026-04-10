import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const inquiry = await prisma.inquiry.delete({
      where: { id },
    });

    return NextResponse.json(
      { success: true, message: "Inquiry deleted successfully", data: inquiry },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete Inquiry Error:", error);
    return NextResponse.json(
      { error: "Failed to delete inquiry" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    const body = await req.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    const validStatuses = ["PENDING", "CONTACTED", "CONVERTED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    const inquiry = await prisma.inquiry.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Inquiry status updated successfully",
        data: inquiry,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update Inquiry Error:", error);
    return NextResponse.json(
      { error: "Failed to update inquiry" },
      { status: 500 }
    );
  }
}