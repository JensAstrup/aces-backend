import { Issue } from '@linear/sdk'
import { PrismaClient } from '@prisma/client'

import getLinearIssue from '@aces/linear/get-linear-issue'


const prisma = new PrismaClient()

async function setIssue(roundId: string, issueId: string, accessToken: string): Promise<Issue> {
  const linearIssue = await getLinearIssue(issueId, accessToken)
  if (!linearIssue) {
    throw new Error('Failed to get issue')
  }
  try {
    const issue = await prisma.issue.create({
      data: {
        roundId: roundId,
        linearId: linearIssue.id,
      },
    })
    await prisma.round.update({
      where: {
        id: roundId,
      },
      data: {
        currentIssueId: issue.id,
      },
    })
  }
  catch (e) {
    // If the issue already exists, we can ignore the error
    if (e.code !== 'P2002') {
      throw e
    }
  }
  return linearIssue
}

export default setIssue
