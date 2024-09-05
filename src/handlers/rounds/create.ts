import { Request, Response } from 'express'

import HttpStatusCodes from '@aces/common/HttpStatusCodes'
import createRound from '@aces/services/rounds/create-round'
import handleError from '@aces/util/handle-error'



async function createRoundHandler(request: Request, response: Response): Promise<void> {
  const user = request.session.user
  if (!user || !user.linearId) {
    response.status(HttpStatusCodes.UNAUTHORIZED).send('Unauthorized')
    return
  }

  const round = await createRound(user).catch((error) => {
    handleError(error, response)
  })
  response.status(HttpStatusCodes.CREATED).json(round)
}

export default createRoundHandler
