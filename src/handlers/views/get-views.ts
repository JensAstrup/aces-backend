import { Request, Response } from 'express'

import getFavoriteViews from '@aces/services/views/get-favorite-views'


interface View {
    id: string
    name: string
}

async function getViews(request: Request, response: Response) {
  const user = request.user
  if (!user) {
    response.status(401).send('Unauthorized')
    return
  }
  const favoriteViews = await getFavoriteViews(user)
  const returnViews = favoriteViews.map(view => ({ id: view.id, name: view.name })) as View[]
  response.json(returnViews)
}

export default getViews
export type { View }
