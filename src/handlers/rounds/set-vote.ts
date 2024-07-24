import { Request, Response } from 'express'

import HttpStatusCodes from '@aces/common/HttpStatusCodes'
import canAccessRound from '@aces/handlers/auth/can-access-round'
import setVote from '@aces/services/rounds/set-vote'


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
  await setVote(issueId, roundId, vote, user)
  response.status(HttpStatusCodes.OK).json({ message: 'Estimate set' })
}

export default setVoteHandler
