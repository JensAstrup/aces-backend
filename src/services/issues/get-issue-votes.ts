import { Issue, PrismaClient, Vote } from '@prisma/client'


const prisma = new PrismaClient()

async function getIssueVotes(issue: Issue): Promise<Vote[]> {
  return prisma.vote.findMany({
    where: {
      issueId: issue.id
    }
  })
}

export default getIssueVotes
