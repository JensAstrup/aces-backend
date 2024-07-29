import { Request, Response } from 'express'

import HttpStatusCodes from '@aces/common/HttpStatusCodes'
import exchangeCode from '@aces/services/auth/exchange-code'
import { createUser } from '@aces/services/auth/get-or-create-user'


interface IncomingAccessTokenRequest extends Request {
  body: {
    code: string
  }
}


async function authorize(request: IncomingAccessTokenRequest, response: Response): Promise<void> {
  const accessToken = await exchangeCode(request.body.code)
  const user = await createUser(accessToken)
  response.status(HttpStatusCodes.OK).json({ accessToken: user.token })
}

export default authorize
export type { IncomingAccessTokenRequest }
