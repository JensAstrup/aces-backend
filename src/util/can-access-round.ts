import { PrismaClient, User } from '@prisma/client'


const prismaClient = new PrismaClient()

async function canAccessRound(roundId: string, user: User): Promise<boolean> {
  const round = await prismaClient.round.findUnique({
    where: {
      id: roundId,
    },
    include: {
      guests: true,
    },
  })
  if (!round) {
    throw new Error('Round not found')
  }
  if (round.creatorId === user.id) {
    return true
  }
  const participant = round.guests.find(guest => guest.userId === user.id)
  return !!participant
}

export default canAccessRound
