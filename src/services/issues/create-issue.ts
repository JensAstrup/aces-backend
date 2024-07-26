import { Issue, PrismaClient } from '@prisma/client'


const prisma = new PrismaClient()

function createIssue(roundId: string, linearId: string): Promise<Issue> {
  return prisma.issue.create({
    data: {
      roundId: roundId,
      linearId: linearId,
    },
  })
}

export default createIssue
