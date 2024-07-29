import { User as LinearUser } from '@linear/sdk'
import { PrismaClient, User } from '@prisma/client'

import getLinearUser from '@aces/services/auth/linear-user'
import decrypt from '@aces/util/encryption/decrypt'
import encrypt from '@aces/util/encryption/encrypt'


const prisma = new PrismaClient()


async function getAndUpdateLinearUser(accessToken: string): Promise<User> {
  const linearToken = decrypt(accessToken)
  const linearUser: LinearUser = await getLinearUser(linearToken)
  const user = await prisma.user.upsert({
    where: { linearId: linearUser.id },
    update: {
      email: linearUser.email,
      displayName: linearUser.displayName,
      token: accessToken,
    },
    create: {
      email: linearUser.email,
      displayName: linearUser.displayName,
      linearId: linearUser.id,
      token: accessToken,
    },
  })
  return user
}

async function getUser(accessToken: string): Promise<User> {
  const decryptedAccessToken = decrypt(accessToken)
  if (decryptedAccessToken.startsWith('anonymous-')) {
    return prisma.user.findUniqueOrThrow({
      where: {
        token: accessToken,
      }
    })
  }
  else {
    return getAndUpdateLinearUser(accessToken)
  }
}


async function createUser(accessToken: string): Promise<User> {
  const encryptedAccessToken = encrypt(accessToken)
  return getAndUpdateLinearUser(encryptedAccessToken)
}

export default getUser
export { createUser }
