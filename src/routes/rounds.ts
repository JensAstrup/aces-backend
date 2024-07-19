import { Router } from 'express'

import createRoundHandler from '@aces/handlers/rounds/create'


const roundsRouter = Router()
roundsRouter.post('/', createRoundHandler)

export default roundsRouter
