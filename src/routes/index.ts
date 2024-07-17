import { Router } from 'express'

import authorize from '@aces/handlers/auth/authorize'
import getViews from '@aces/handlers/views/get-views'



const router = Router()
router.post('/auth', authorize)
router.get('/views', getViews)
export default router
