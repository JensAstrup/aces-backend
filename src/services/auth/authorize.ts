import { Request, Response } from 'express'

import HttpStatusCodes from '@aces/common/HttpStatusCodes'
import exchangeCode from '@aces/services/auth/exchange-code'
import getOrCreateUser from '@aces/services/auth/get-or-create-user'


interface IncomingAccessTokenRequest extends Request {
  body: {
    code: string
  }
}


async function authorize(request: IncomingAccessTokenRequest, response: Response): Promise<void> {
  try {
    console.log('request.body.code', request.body.code)
    const accessToken = await exchangeCode(request.body.code)
    const user = await getOrCreateUser(accessToken)
    response.status(HttpStatusCodes.OK).json({ token: user.token })
  }
  catch (e) {
    console.error(e.response.data)
    response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'An error occurred' })
  }
}

export default authorize
export type { IncomingAccessTokenRequest }
