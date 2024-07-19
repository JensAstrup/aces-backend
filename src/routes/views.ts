import { Router } from 'express'

import getIssues from '@aces/handlers/views/get-view-issues'
import getViews from '@aces/handlers/views/get-views'


const viewRouter = Router()
viewRouter.get('/', getViews)
viewRouter.get('/:viewId/issues', getIssues)

export default viewRouter
