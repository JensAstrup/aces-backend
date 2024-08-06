/*
  Warnings:

  - The primary key for the `RoundGuest` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "RoundGuest" DROP CONSTRAINT "RoundGuest_roundId_fkey";

-- AlterTable
ALTER TABLE "RoundGuest" DROP CONSTRAINT "RoundGuest_pkey",
ALTER COLUMN "roundId" DROP NOT NULL,
ADD CONSTRAINT "RoundGuest_pkey" PRIMARY KEY ("userId");

-- AddForeignKey
ALTER TABLE "RoundGuest" ADD CONSTRAINT "RoundGuest_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE SET NULL ON UPDATE CASCADE;
