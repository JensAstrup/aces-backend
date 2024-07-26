import { Issue, User, Vote } from '@prisma/client'

import createIssue from '@aces/services/issues/create-issue'
import getIssue from '@aces/services/issues/get-issue'
import createVote from '@aces/services/rounds/create-vote'


async function setVote(roundId: string, linearId: string, vote: number, user: User): Promise<Vote> {
  let issue: Issue | null = await getIssue({ roundId, linearId })
  if (!issue) {
    issue = await createIssue(roundId, linearId)
  }
  return await createVote(issue, user, vote)
}

export default setVote
