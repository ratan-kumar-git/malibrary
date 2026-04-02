import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userId = session?.user?.id;

  if (!userId) {
    console.error(
      "❌ No authenticated user found. Please log in to seed the database.",
    );
    return;
  }

  // Create a library
  const library = await prisma.library.create({
    data: {
      name: "Elite Scholars Library",
      email: "contact@elitescholars.com",
      contactNumber: "+91 9876543210",
      address: "Street 4, Sector 12, Near Metro Station",
      district: "Patna",
      state: "Bihar",
      pincode: "800001",
      facilities: [
        "High-speed WiFi",
        "Air Conditioning",
        "CCTV Surveillance",
        "24/7 Security",
        "Reading Hall",
        "Computer Lab",
        "Conference Room",
      ],
      userId: userId,
    },
  });

  console.log("✅ Library created:", library.name);

  // Create floors
  const floor1 = await prisma.floor.createMany({
    data: [
      {
        name: "Ground Floor",
        totalSeats: 50,
        libraryId: library.id,
      },
      {
        name: "First Floor",
        totalSeats: 60,
        libraryId: library.id,
      },
      {
        name: "Second Floor",
        totalSeats: 40,
        libraryId: library.id,
      },
    ],
  });

  console.log("✅ Floors created:", [floor1]);

  // Create shifts
  const morningShift = await prisma.shift.createMany({
    data: [
      {
        name: "MORNING",
        startTime: "06:00",
        endTime: "12:00",
        price: 1500,
        libraryId: library.id,
      },
      {
        name: "AFTERNOON",
        startTime: "12:00",
        endTime: "18:00",
        price: 1500,
        libraryId: library.id,
      },
      {
        name: "EVENING",
        startTime: "18:00",
        endTime: "23:00",
        price: 1200,
        libraryId: library.id,
      },
      {
        name: "FULL_DAY",
        startTime: "06:00",
        endTime: "23:00",
        price: 3500,
        libraryId: library.id,
      },
    ],
  });

  console.log("✅ Shifts created:", [
    morningShift]);

  return new Response("Seed API is running. Use POST to seed the database.");
}
