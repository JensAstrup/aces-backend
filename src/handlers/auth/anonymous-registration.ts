import { PrismaClient } from '@prisma/client'
import { Request, Response } from 'express'
import { v7 as uuidv7 } from 'uuid'

import HttpStatusCodes from '@aces/common/HttpStatusCodes'
import encrypt from '@aces/util/encryption/encrypt'


const prisma = new PrismaClient()


interface AnonymousRegistrationRequest extends Request {
  body: {
    roundId: string
  }
}

async function anonymousRegistration(request: AnonymousRegistrationRequest, response: Response): Promise<void> {
  const user = await prisma.user.create({ data: {} })
  await prisma.round.update({
    where: {
      id: request.body.roundId
    },
    data: {
      guests: {
        create: {
          userId: user.id
        }
      }
    }
  })
  request.session.user = user
  response.status(HttpStatusCodes.CREATED).json({ user })
}

export default anonymousRegistration
