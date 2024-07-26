/*
  Warnings:

  - You are about to drop the column `linearId` on the `Vote` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[roundId,linearId]` on the table `Issue` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Vote" DROP COLUMN "linearId";

-- CreateIndex
CREATE UNIQUE INDEX "Issue_roundId_linearId_key" ON "Issue"("roundId", "linearId");
