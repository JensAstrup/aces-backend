import { PrismaClient, Round, User } from '@prisma/client'


const prisma = new PrismaClient()


async function removeGuestFromRound(round: Round, user: User): Promise<void> {
  await prisma.round.update({
    where: {
      id: round.id
    },
    data: {
      guests: {
        disconnect: {
          userId: user.id,
        }
      }
    }
  })
}

export default removeGuestFromRound
