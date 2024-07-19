import { PrismaClient, Round, User } from '@prisma/client'


async function createRound(creator: User): Promise<void> {
  // Create a new round with the creator being the user
  const prisma = new PrismaClient()
  const newRound = await prisma.round.create({
    data: {
      creatorId: creator.id,
    },
  })
}
