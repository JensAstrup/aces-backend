import { Issue, PrismaClient } from '@prisma/client'


const prismaClient = new PrismaClient()

async function getIssue(roundId: string, issueId?: string, linearId?: string): Promise<Issue> {
  let issue: Issue | null = null

  if (issueId) {
    issue = await prismaClient.issue.findUnique({
      where: {
        id: issueId,
        roundId: roundId
      }
    })
  }
  else if (linearId) {
    issue = await prismaClient.issue.findFirst({
      where: {
        linearId: linearId,
        roundId: roundId
      }
    })
  }

  if (!issue) {
    throw new Error('Issue not found')
  }

  return issue
}

export default getIssue
