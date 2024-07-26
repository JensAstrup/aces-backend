import { Router } from 'express'

import authRouter from '@aces/routes/auth'
import roundsRouter from '@aces/routes/rounds'
import viewsRouter from '@aces/routes/views'


const appRouter = Router()
appRouter.use('/auth', authRouter)
appRouter.use('/rounds', roundsRouter)
appRouter.use('/views', viewsRouter)

export default appRouter
