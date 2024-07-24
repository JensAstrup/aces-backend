import { Issue, PrismaClient, User, Vote } from '@prisma/client'


const prismaClient = new PrismaClient()

async function createVote(issue: Issue, user: User, estimate: number): Promise<Vote> {
  const vote = await prismaClient.vote.create({
    data: {
      issueId: issue.id,
      userId: user.id,
      vote: estimate
    }
  })
  return vote
}

export default createVote
