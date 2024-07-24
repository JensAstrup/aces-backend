import { User, Vote } from '@prisma/client'

import getIssue from '@aces/services/issues/get-issue'
import createVote from '@aces/services/rounds/create-vote'


async function setVote(roundId: string, linearId: string, vote: number, user: User): Promise<Vote> {
  const issue = await getIssue(roundId, linearId)
  const createdVote = await createVote(issue, user, vote)
  console.log(`User ${user.id} set vote ${vote} for issue ${issue.id}`)
  console.log(`Vote ID: ${createdVote.id}`)
  return createdVote
}

export default setVote
