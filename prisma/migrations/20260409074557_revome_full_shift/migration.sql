/*
  Warnings:

  - The values [FULL_DAY] on the enum `ShiftType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ShiftType_new" AS ENUM ('MORNING', 'AFTERNOON', 'EVENING', 'NIGHT');
ALTER TABLE "Shift" ALTER COLUMN "name" TYPE "ShiftType_new" USING ("name"::text::"ShiftType_new");
ALTER TYPE "ShiftType" RENAME TO "ShiftType_old";
ALTER TYPE "ShiftType_new" RENAME TO "ShiftType";
DROP TYPE "public"."ShiftType_old";
COMMIT;
