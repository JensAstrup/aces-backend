import { NextFunction, Request, Response } from 'express'

import getUser from '@aces/services/auth/get-or-create-user'


async function setUser(request: Request, response: Response, next: NextFunction): Promise<void> {
  const token = request.headers.authorization
  if (token) {
    request.user = await getUser(token)
  }
  else {
    request.user = null
  }
  next()
}

export default setUser
