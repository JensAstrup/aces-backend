import { PrismaClient, Round, User } from '@prisma/client'


function createRound(creator: User): Promise<Round> {
  const prisma = new PrismaClient()
  return prisma.round.create({
    data: {
      creatorId: creator.id,
    },
  })
}

export default createRound
