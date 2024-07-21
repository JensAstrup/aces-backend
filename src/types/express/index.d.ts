import { User } from '@prisma/client'


declare module 'express' {
  interface Request extends Express.Request {
        user?: User | null
    }
}
