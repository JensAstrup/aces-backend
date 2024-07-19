import { Response } from 'express'

import HttpStatusCodes from '@aces/common/HttpStatusCodes'


const handleError = (error: unknown, response: Response): void => {
  response.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send('Internal Server Error')
}

export default handleError
