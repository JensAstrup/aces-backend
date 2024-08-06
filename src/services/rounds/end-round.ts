import { PrismaClient, Round } from '@prisma/client'


const prisma = new PrismaClient()


async function endRound(round: Round): Promise<void> {
  await prisma.round.update({
    where: {
      id: round.id
    },
    data: {
      status: 'FINISHED'
    }
  })
}

export default endRound
