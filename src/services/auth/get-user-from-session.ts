import { PrismaClient, User } from '@prisma/client'

import NotFoundError from '@aces/errors/not-found'


const prisma = new PrismaClient()


async function getUserFromSession(accessToken: string): Promise<User> {
  const session = await prisma.session.findUniqueOrThrow({
    where: { token: accessToken },
    include: { user: true },
  })
  if (session.user) {
    return session.user
  }
  else {
    throw new NotFoundError('User not found')
  }
}

export default getUserFromSession
