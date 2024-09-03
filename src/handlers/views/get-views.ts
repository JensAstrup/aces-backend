import { Request, Response } from 'express'

import HttpStatusCodes from '@aces/common/HttpStatusCodes'
import getFavoriteViews from '@aces/services/views/get-favorite-views'


interface View {
    id: string
    name: string
}

async function getViews(request: Request, response: Response): Promise<void> {
  const user = request.session.user
  if (!user) {
    response.status(HttpStatusCodes.UNAUTHORIZED).send('Unauthorized')
    return
  }
  const favoriteItems = await getFavoriteViews(user)
  const customViews = await Promise.all(favoriteItems.map(async favorite => await favorite.customView))
  const returnViews = customViews.map((view) => {
    if (!view) {
      return null
    }
    return { id: view.id, name: view.name }
  })
  response.json(returnViews)
}

export default getViews
export type { View }
