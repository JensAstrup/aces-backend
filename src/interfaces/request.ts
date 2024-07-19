import { User } from '@prisma/client'
import { Request as BaseRequest } from 'express'


export interface Request extends BaseRequest {
  user?: User | null
}

export default Request
