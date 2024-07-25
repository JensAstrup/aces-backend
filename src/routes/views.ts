import { Router } from 'express'

import getIssues from '@aces/handlers/views/get-view-issues'
import getViews from '@aces/handlers/views/get-views'


const viewsRouter = Router()
viewsRouter.get('/:viewId/issues', getIssues)
viewsRouter.get('/', getViews)

export default viewsRouter
