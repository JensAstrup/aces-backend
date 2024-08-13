import { NextFunction, Request, Response } from 'express'

import getUserFromSession from '@aces/services/auth/get-user-from-session'


async function setUser(request: Request, response: Response, next: NextFunction): Promise<void> {
  const token = request.headers.authorization
  if (token) {
    request.user = await getUserFromSession(token)
  }
  else {
    request.user = null
  }
  next()
}

export default setUser
