import { PrismaClient } from '@prisma/client'
import { Request, Response } from 'express'
import { v7 as uuidv7 } from 'uuid'

import HttpStatusCodes from '@aces/common/HttpStatusCodes'
import encrypt from '@aces/util/encryption/encrypt'


const prisma = new PrismaClient()

interface AnonymousRegistrationData {
  roundId: string
}

async function anonymousRegistration(request: Request, response: Response): Promise<void> {
  console.log('Anonymous registration')
  const randomId = uuidv7()
  const token = `anonymous-${randomId}`
  const encryptedToken = encrypt(token)
  const user = await prisma.user.create({
    data: {
      token: encryptedToken,
    }
  })
  response.status(HttpStatusCodes.CREATED).json({ token, user })
}

export default anonymousRegistration
