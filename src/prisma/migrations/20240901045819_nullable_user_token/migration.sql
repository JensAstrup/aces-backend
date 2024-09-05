/*
  Warnings:

  - Made the column `linearId` on table `Issue` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Issue" ALTER COLUMN "linearId" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "token" DROP NOT NULL;
