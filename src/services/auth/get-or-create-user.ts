import { User as LinearUser } from '@linear/sdk'
import { PrismaClient, User } from '@prisma/client'

import getLinearUser from '@aces/services/auth/linear-user'
import encrypt from '@aces/util/encryption/encrypt'


const prisma = new PrismaClient()

async function getOrCreateUser(accessToken: string): Promise<User> {
  const linearUser: LinearUser = await getLinearUser(accessToken)
  const encryptedAccessToken = encrypt(accessToken)
  const user = await prisma.user.upsert({
    where: { linearId: linearUser.id },
    update: {
      email: linearUser.email,
      displayName: linearUser.displayName,
      token: encryptedAccessToken,
    },
    create: {
      email: linearUser.email,
      displayName: linearUser.displayName,
      linearId: linearUser.id,
      token: encryptedAccessToken,
    },
  })
  return user
}

export default getOrCreateUser
