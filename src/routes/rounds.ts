import { Router } from 'express'

import createRoundHandler from '@aces/handlers/rounds/create'
import setIssueHandler from '@aces/handlers/rounds/set-issue'


const roundsRouter = Router()
roundsRouter.post('/', createRoundHandler)
roundsRouter.post('/:roundId/issue', setIssueHandler)

export default roundsRouter
