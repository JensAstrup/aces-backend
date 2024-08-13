import { Router } from 'express'

import anonymousRegistration from '@aces/handlers/auth/anonymous-registration'
import disconnect from '@aces/handlers/auth/disconnect'
import exchange from '@aces/handlers/auth/exchange'


const authRouter = Router()
authRouter.post('/anonymous', anonymousRegistration)
authRouter.post('/disconnect', disconnect)
authRouter.post('/exchange', exchange)
export default authRouter
