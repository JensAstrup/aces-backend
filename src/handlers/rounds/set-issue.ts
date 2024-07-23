import { Request, Response } from 'express'

import HttpStatusCodes from '@aces/common/HttpStatusCodes'
import setIssue from '@aces/services/rounds/set-issue'
import sendMessageToRound from '@aces/socket/send-message-to-round'
import decrypt from '@aces/util/encryption/decrypt'


interface SetIssueRequest extends Request {
  body: {
    issue: string
  }
}


async function setIssueHandler(request: SetIssueRequest, response: Response): Promise<void> {
  const user = request.user
  if (!user || !user.linearId) {
    response.status(HttpStatusCodes.UNAUTHORIZED).send('Unauthorized')
    return
  }
  const roundId = request.params.roundId
  const issueId = request.body.issue
  const issue = await setIssue(roundId, issueId, decrypt(user.token))
  sendMessageToRound(roundId, issue)

  response.status(HttpStatusCodes.NO_CONTENT)
}

export default setIssueHandler
