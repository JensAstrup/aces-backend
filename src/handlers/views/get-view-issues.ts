import { Request, Response } from 'express'

import HttpStatusCodes from '@aces/common/HttpStatusCodes'
import getViewIssues from '@aces/services/views/get-view-issues'



async function getIssues(request: Request, response: Response): Promise<void> {
  const user = request.user
  if (!user) {
    response.status(HttpStatusCodes.UNAUTHORIZED).send('Unauthorized')
    return
  }
  const viewIssues = await getViewIssues(request.params.viewId, user.token)
  response.json(viewIssues)
}

export default getIssues
