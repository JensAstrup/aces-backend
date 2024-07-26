import { Request, Response } from 'express'

import HttpStatusCodes from '@aces/common/HttpStatusCodes'
import setVote from '@aces/services/rounds/set-vote'
import canAccessRound from '@aces/util/can-access-round'


async function setVoteHandler(request: Request, response: Response): Promise<void> {
  if (!request.user) {
    response.status(HttpStatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized' })
    return
  }
  const { roundId } = request.params
  const { issueId, vote } = request.body
  const user = request.user
  const isAuthorized = await canAccessRound(roundId, request.user)
  if (!isAuthorized) {
    response.status(HttpStatusCodes.FORBIDDEN).json({ error: 'Forbidden' })
    return
  }
  await setVote(roundId, issueId, vote, user)
  response.status(HttpStatusCodes.OK).json({ message: 'Estimate set' })
}

export default setVoteHandler
