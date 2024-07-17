import { User } from '@prisma/client'
import { NextFunction, Request, Response } from 'express'

import getOrCreateUser from '@aces/services/auth/get-or-create-user'


declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: User
    }
  }
}


async function setUser(request: Request, response: Response, next: NextFunction): Promise<void> {
  const token = request.headers.authorization
  if (token) {
    request.user = await getOrCreateUser(token, true)
  }
  next()
}

export default setUser
