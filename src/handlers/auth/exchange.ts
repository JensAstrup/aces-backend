import { Request, Response } from 'express'

import HttpStatusCodes from '@aces/common/HttpStatusCodes'
import exchangeCode from '@aces/services/auth/exchange-code'
import upsertUserFromLinearToken from '@aces/services/auth/upsert-user-from-linear-token'
import createRound from '@aces/services/rounds/create-round'
import createSession from '@aces/services/sessions/create-session'


interface IncomingAccessTokenRequest extends Request {
  body: {
    code: string
  }
}

/**
 * Exchange a linear code for an application session token
 * @param request
 * @param response
 */
async function exchange(request: IncomingAccessTokenRequest, response: Response): Promise<void> {
  const accessToken = await exchangeCode(request.body.code)
  const user = await upsertUserFromLinearToken(accessToken)
  const round = await createRound(user)
  const session = await createSession(user, round)
  response.status(HttpStatusCodes.CREATED).json({ accessToken: session.token })
}

export default exchange
export type { IncomingAccessTokenRequest }
