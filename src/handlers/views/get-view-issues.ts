import { Request, Response } from 'express'

import HttpStatusCodes from '@aces/common/HttpStatusCodes'
import getViewIssues from '@aces/services/views/get-view-issues'


async function getIssues(request: Request, response: Response): Promise<void> {
  if (request.query.nextPage && typeof request.query.nextPage !== 'string') {
    response.status(HttpStatusCodes.BAD_REQUEST).json({ errors: 'Invalid nextPage query parameter. nextPage must be undefined or a string' })
    return
  }

  const user = request.session.user
  if (!user) {
    response.status(HttpStatusCodes.UNAUTHORIZED).send()
    return
  }
  const nextPage = request.query.nextPage

  if (!user.token) {
    response.status(HttpStatusCodes.UNAUTHORIZED).send()
    return
  }

  const viewIssues = await getViewIssues(request.params.viewId, user.token, nextPage)
  response.json(viewIssues)
}

export default getIssues
