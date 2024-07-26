import { Issue, PrismaClient, User, Vote } from '@prisma/client'


const prismaClient = new PrismaClient()

async function createVote(issue: Issue, user: User, estimate: number): Promise<Vote> {
  const vote = await prismaClient.vote.upsert({
    where: {
      issueId_userId: {
        issueId: issue.id,
        userId: user.id
      }
    },
    create: {
      issueId: issue.id,
      userId: user.id,
      vote: estimate
    },
    update: {
      vote: estimate
    }
  })
  return vote
}

export default createVote
