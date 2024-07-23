import { NextFunction, Request, Response } from 'express'

import getOrCreateUser from '@aces/services/auth/get-or-create-user'


async function setUser(request: Request, response: Response, next: NextFunction): Promise<void> {
  console.log('setUser')
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
