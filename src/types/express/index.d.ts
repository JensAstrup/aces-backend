import { User } from '@prisma/client'
import { SessionData } from 'express-session'


declare module 'express' {
  interface Request extends Express.Request {
    user?: User | null
    session: SessionData
  }
}
