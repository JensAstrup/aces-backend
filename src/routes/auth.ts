import { Router } from 'express'

import anonymousRegistration from '@aces/handlers/auth/anonymous-registration'
import authorize from '@aces/handlers/auth/authorize'
import disconnect from '@aces/handlers/auth/disconnect'


const authRouter = Router()
authRouter.post('/anonymous', anonymousRegistration)
authRouter.post('/disconnect', disconnect)
authRouter.post('/', authorize)
export default authRouter
