import { User as LinearUser } from '@linear/sdk'
import { PrismaClient, User } from '@prisma/client'

import getLinearUser from '@aces/services/auth/linear-user'


const prisma = new PrismaClient()

async function upsertUserFromLinearToken(accessToken: string): Promise<User> {
  const linearUser: LinearUser = await getLinearUser(accessToken)
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

export default upsertUserFromLinearToken
