import { NextFunction, Response } from 'express'

import Request from '@aces/interfaces/request'
import getOrCreateUser from '@aces/services/auth/get-or-create-user'


async function setUser(request: Request, response: Response, next: NextFunction): Promise<void> {
  const token = request.headers.authorization
  if (token) {
    request.user = await getOrCreateUser(token, true)
  }
  else {
    request.user = null
  }
  next()
}

export default setUser
