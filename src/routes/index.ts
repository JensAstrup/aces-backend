import { Router } from 'express'

import authorize from '@aces/handlers/auth/authorize'
import getIssues from '@aces/handlers/views/get-view-issues'
import getViews from '@aces/handlers/views/get-views'


const router = Router()
router.post('/auth', authorize)
router.get('/views', getViews)
router.get('/views/:viewId/issues', getIssues)
export default router
