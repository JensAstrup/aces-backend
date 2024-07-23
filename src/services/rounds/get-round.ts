import { Prisma, PrismaClient, Round } from '@prisma/client'

import NotFoundError from '@aces/errors/not-found'


const prisma = new PrismaClient()

async function getRound(roundId: string): Promise<Round> {
  try {
    const round = await prisma.round.findUnique({
      where: {
        id: roundId,
      },
    })

    if (!round) {
      throw new NotFoundError('Round not found')
    }

    return round
  }
  catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new Error(`Database error: ${error.message}`)
    }
    else if (error instanceof NotFoundError) {
      throw error
    }
    else {
      throw new Error(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}

export default getRound
