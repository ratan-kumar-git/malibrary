import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const library = await prisma.library.findUnique({
    where: { userId: "yR9Le0yKXYaB6D9rNxDPjuySiH5oLuLv" },
    include: {
      floors: {
        select: { id: true, name: true },
      },
      shifts: {
        where: { isActive: true },
        select: { id: true, name: true },
      },
    },
  });

  return NextResponse.json(library);
}
