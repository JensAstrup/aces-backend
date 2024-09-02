import { PrismaClient } from '@prisma/client'
import { SessionData, Store } from 'express-session'


const prisma = new PrismaClient()

class PrismaSessionStore extends Store {
  public async get(sid: string, callback: (err: Error | null, session?: SessionData | null) => void): Promise<void> {
    try {
      const session = await prisma.session.findUnique({
        where: { id: sid },
      })

      if (session) {
        callback(null, JSON.parse(session.data))
      }
      else {
        callback(null, null)
      }
    }
    catch (err) {
      callback(err)
    }
  }

  public async set(sid: string, sessionData: SessionData, callback?: (err?: Error) => void): Promise<void> {
    try {
      await prisma.session.upsert({
        where: { id: sid },
        update: {
          data: JSON.stringify(sessionData),
          userId: sessionData.user?.id,
          expiresAt: new Date(sessionData.cookie.expires || Date.now()),
        },
        create: {
          id: sid,
          data: JSON.stringify(sessionData),
          userId: sessionData.user?.id,
          expiresAt: new Date(sessionData.cookie.expires || Date.now()),
        },
      })
      if (callback) callback()
    }
    catch (err) {
      if (callback) callback(err)
    }
  }

  public async destroy(sid: string, callback?: (err?: Error) => void): Promise<void> {
    try {
      await prisma.session.delete({
        where: { id: sid },
      })
      if (callback) callback()
    }
    catch (err) {
      if (callback) callback(err)
    }
  }
}

export default PrismaSessionStore
