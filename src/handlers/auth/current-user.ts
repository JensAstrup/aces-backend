import { Request, Response } from 'express'

import HttpStatusCodes from '@aces/common/HttpStatusCodes'


function getCurrentUser(request: Request, response: Response): void {
  if (!request.session.user) {
    response.status(HttpStatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized' })
    return
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { token: _, ...userWithoutToken } = request.session.user
  response.status(HttpStatusCodes.OK).json(userWithoutToken)
}

export default getCurrentUser
