import { Request, Response } from 'express'

import HttpStatusCodes from '@aces/common/HttpStatusCodes'
import getFavoriteViews from '@aces/services/views/get-favorite-views'


interface View {
    id: string
    name: string
}

async function getViews(request: Request, response: Response): Promise<void> {
  const user = request.user
  if (!user) {
    response.status(HttpStatusCodes.UNAUTHORIZED).send('Unauthorized')
    return
  }
  const favoriteViews = await getFavoriteViews(user)
  const returnViews = favoriteViews.map(view => ({ id: view.id, name: view.name })) as View[]
  response.json(returnViews)
}

export default getViews
export type { View }
