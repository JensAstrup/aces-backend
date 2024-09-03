import { Router } from 'express'

import anonymousRegistration from '@aces/handlers/auth/anonymous-registration'
import authorize from '@aces/handlers/auth/authorize'
import getCsrfToken from '@aces/handlers/auth/csrf-token'
import disconnect from '@aces/handlers/auth/disconnect'


const authRouter = Router()
authRouter.post('/anonymous', anonymousRegistration)
authRouter.post('/disconnect', disconnect)
authRouter.get('/csrf-token', getCsrfToken)
authRouter.post('/', authorize)
export default authRouter
