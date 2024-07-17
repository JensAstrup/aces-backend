import { CustomView, LinearClient } from '@linear/sdk'
import { User } from '@prisma/client'

import decrypt from '@aces/util/encryption/decrypt'


async function getFavoriteViews(user: User): Promise<CustomView[]> {
  const accessToken = decrypt(user.token)
  console.log(accessToken)
  const linear = new LinearClient({ accessToken })
  // Using linear SDK, retrieve a user's favorite views
  const favorites = await linear.customViews()
  return favorites.nodes.filter(favorite => favorite.modelName === 'Issue')
}

export default getFavoriteViews
