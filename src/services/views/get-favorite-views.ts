import { Favorite, LinearClient } from '@linear/sdk'
import { User } from '@prisma/client'

import decrypt from '@aces/util/encryption/decrypt'


async function getFavoriteViews(user: User): Promise<Favorite[]> {
  if (!user.token) {
    return []
  }
  const accessToken = decrypt(user.token)
  const linear = new LinearClient({ accessToken })
  const favorites = await linear.favorites()
  return favorites.nodes.filter(favorite => favorite.type === 'customView')
}

export default getFavoriteViews
