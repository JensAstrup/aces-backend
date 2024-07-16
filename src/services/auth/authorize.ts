import { Request, Response } from 'express'

import HttpStatusCodes from '@aces/common/HttpStatusCodes'
import exchangeCode from '@aces/services/auth/exchange-code'
import encrypt from '@aces/util/encryption/encrypt'


interface IncomingAccessTokenRequest extends Request {
  body: {
    code: string
  }
}



async function authorize(request: IncomingAccessTokenRequest, response: Response): Promise<void> {
  try {
    console.log('request.body.code', request.body.code)
    const accessToken = await exchangeCode(request.body.code)
    const encryptedAccessToken = encrypt(accessToken)
    response.status(HttpStatusCodes.OK).json({ accessToken: encryptedAccessToken })
  }
  catch (e) {
    console.error(e.response.data)
    response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'An error occurred' })
  }
}

export default authorize
export type { IncomingAccessTokenRequest }
