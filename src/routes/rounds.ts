import { Router } from 'express'

import createRoundHandler from '@aces/handlers/rounds/create'
import setIssueHandler from '@aces/handlers/rounds/set-issue'
import setVoteHandler from '@aces/handlers/rounds/set-vote'


const roundsRouter = Router()
roundsRouter.post('/:roundId/issue', setIssueHandler)
roundsRouter.post('/:roundId/vote', setVoteHandler)
roundsRouter.post('/', createRoundHandler)

export default roundsRouter
