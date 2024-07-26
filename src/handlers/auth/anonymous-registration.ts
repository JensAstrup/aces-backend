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
  const randomId = uuidv7()
  const token = `anonymous-${randomId}`
  const encryptedToken = encrypt(token)
  const user = await prisma.user.create({
    data: {
      token: encryptedToken,
    }
  })
  // Add user as guest to round
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
  response.status(HttpStatusCodes.CREATED).json({ user })
}

export default anonymousRegistration
