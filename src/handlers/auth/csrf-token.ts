import { Request, Response } from 'express'

import HttpStatusCodes from '@aces/common/HttpStatusCodes'
import { generateCsrfToken } from '@aces/util/generate-csrf-token'


function getCsrfToken(request: Request, response: Response): void {
  response.status(HttpStatusCodes.OK).json({ csrfToken: generateCsrfToken(request) })
}

export default getCsrfToken
