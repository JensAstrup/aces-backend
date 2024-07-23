import { Issue } from '@linear/sdk'
import { PrismaClient } from '@prisma/client'

import getIssue from '@aces/linear/get-issue'


const prisma = new PrismaClient()

async function setIssue(roundId: string, issueId: string, accessToken: string): Promise<Issue> {
  const linearIssue = await getIssue(issueId, accessToken)
  if (!linearIssue) {
    throw new Error('Failed to get issue')
  }
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
  return linearIssue
}

export default setIssue
