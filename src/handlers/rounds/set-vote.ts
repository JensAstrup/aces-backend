import { PrismaClient } from '@prisma/client'
import { Request, Response } from 'express'

import HttpStatusCodes from '@aces/common/HttpStatusCodes'
import getIssue from '@aces/services/issues/get-issue'
import RoundNotifier from '@aces/services/rounds/round-notifier'
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
  const prisma = new PrismaClient()
  const round = await prisma.round.findUnique({ where: { id: roundId }, })
  if (!round) {
    response.status(HttpStatusCodes.NOT_FOUND).json({ error: 'Round not found' })
    return
  }
  await setVote(roundId, issueId, vote, user)
  const roundNotifier = new RoundNotifier(round)
  const issue = await getIssue({ roundId, linearId: issueId })
  if (!issue) {
    response.status(HttpStatusCodes.NOT_FOUND).json({ error: 'Issue not found' })
    return
  }
  await roundNotifier.voteSet(issue)
  response.status(HttpStatusCodes.OK).json({ message: 'Estimate set' })
}

export default setVoteHandler
