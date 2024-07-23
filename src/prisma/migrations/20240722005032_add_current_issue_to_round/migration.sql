-- AlterTable
ALTER TABLE "Round" ADD COLUMN     "currentIssueId" TEXT;

-- AddForeignKey
ALTER TABLE "Round" ADD CONSTRAINT "Round_currentIssueId_fkey" FOREIGN KEY ("currentIssueId") REFERENCES "Issue"("id") ON DELETE SET NULL ON UPDATE CASCADE;
