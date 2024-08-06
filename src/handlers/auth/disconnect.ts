import { PrismaClient, Round, User } from '@prisma/client'
import { Request, Response } from 'express'

import HttpStatusCodes from '@aces/common/HttpStatusCodes'
import canAccessRound from '@aces/util/can-access-round'


interface DisconnectRequest extends Request {
    body: {
        roundId: string
    }
}

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

async function disconnect(request: DisconnectRequest, response: Response): Promise<void> {
  const token = request.headers.authorization
  const user = await prisma.user.findUnique({ where: { token } })
  if (!user) {
    response.status(HttpStatusCodes.UNAUTHORIZED).send('Unauthorized')
    return
  }
  const round = await prisma.round.findUnique({ where: { id: request.body.roundId } })
  if (!round) {
    response.status(HttpStatusCodes.NOT_FOUND).send('Round not found')
    return
  }
  const hasAccess = await canAccessRound(round.id, user)
  if (!hasAccess) {
    response.status(HttpStatusCodes.FORBIDDEN).send('Forbidden')
    return
  }

  if (round.creatorId === user.id) {
    await endRound(round)
    response.status(HttpStatusCodes.NO_CONTENT).send()
    return
  }

  await removeGuestFromRound(round, user)
  response.status(HttpStatusCodes.NO_CONTENT).send()
}

export default disconnect
