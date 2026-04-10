-- CreateEnum
CREATE TYPE "InquiryStatus" AS ENUM ('PENDING', 'CONTACTED', 'CONVERTED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Inquiry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "address" TEXT,
    "shiftNames" "ShiftType"[],
    "joiningDate" TIMESTAMP(3),
    "message" TEXT,
    "status" "InquiryStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Inquiry_pkey" PRIMARY KEY ("id")
);
