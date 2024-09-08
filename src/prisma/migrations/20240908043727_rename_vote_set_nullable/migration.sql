/*
  Warnings:

  - You are about to drop the column `vote` on the `Vote` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- Rename the vote column
ALTER TABLE "Vote" RENAME COLUMN "vote" TO "value";

-- Make the column nullable
ALTER TABLE "Vote" ALTER COLUMN "value" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
