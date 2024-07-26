import { Router } from 'express'

import anonymousRegistration from '@aces/handlers/auth/anonymous-registration'
import authorize from '@aces/handlers/auth/authorize'


const authRouter = Router()
authRouter.post('/anonymous', anonymousRegistration)
authRouter.post('/', authorize)
export default authRouter
