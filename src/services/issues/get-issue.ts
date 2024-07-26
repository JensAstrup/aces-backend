import { Issue, PrismaClient } from '@prisma/client'


const prismaClient = new PrismaClient()

// One of the following parameters must be provided: issueId or linearId
type GetIssueParams = { roundId: string, issueId: string, linearId?: never } | { roundId: string, issueId?: never, linearId: string }


async function getIssue({ roundId, issueId, linearId }: GetIssueParams): Promise<Issue | null> {
  let issue: Issue | null

  if (issueId) {
    issue = await prismaClient.issue.findUnique({
      where: {
        id: issueId,
        roundId: roundId
      }
    })
  }
  else {
    issue = await prismaClient.issue.findFirst({
      where: {
        linearId: linearId,
        roundId: roundId
      }
    })
  }

  return issue
}

export default getIssue
