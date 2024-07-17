import { User } from '@prisma/client'
import { NextFunction, Request, Response } from 'express'

import getOrCreateUser from '@aces/services/auth/get-or-create-user'


declare global {
  namespace Express {
    interface Request {
      user?: User
    }
  }
}


async function setUser(request: Request, response: Response, next: NextFunction) {
  const token = request.headers.authorization
  if (token) {
    request.user = await getOrCreateUser(token, true)
  }
  next()
}

export default setUser
