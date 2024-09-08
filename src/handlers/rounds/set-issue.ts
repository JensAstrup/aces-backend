import { Request, Response } from 'express'

import HttpStatusCodes from '@aces/common/HttpStatusCodes'
import getIssue from '@aces/services/issues/get-issue'
import getIssueVotes from '@aces/services/issues/get-issue-votes'
import getGuests from '@aces/services/rounds/get-guests'
import setIssue from '@aces/services/rounds/set-issue'
import sendMessageToRound from '@aces/socket/send-message-to-round'
import decrypt from '@aces/util/encryption/decrypt'


interface SetIssueRequest extends Request {
  body: {
    issue: string
  }
}


async function setIssueHandler(request: SetIssueRequest, response: Response): Promise<void> {
  const user = request.session.user
  if (!user || !user.linearId) {
    response.status(HttpStatusCodes.UNAUTHORIZED).send('Unauthorized')
    return
  }
  const roundId = request.params.roundId
  const issueId = request.body.issue
  if (!user.token) {
    response.status(HttpStatusCodes.UNAUTHORIZED).send()
    return
  }
  const issue = await setIssue(roundId, issueId, decrypt(user.token))
  const dbIssue = await getIssue({ roundId, linearId: issueId })
  if (!dbIssue) {
    response.status(HttpStatusCodes.NOT_FOUND).send('Issue not found in database')
    return
  }
  const issueVotes = await getIssueVotes(dbIssue)
  const votes = issueVotes.map(vote => vote.value)
  const roundGuests = await getGuests({ round: roundId })
  const expectedVotes = roundGuests.length + 1 // Add 1 for the creator
  response.status(HttpStatusCodes.NO_CONTENT)
  sendMessageToRound(roundId, { type: 'issue', payload: { issue, votes, expectedVotes }, event: 'roundIssueUpdated' })
  response.send()
}

export default setIssueHandler
