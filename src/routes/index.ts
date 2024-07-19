import { Router } from 'express'

import authorize from '@aces/handlers/auth/authorize'


const router = Router()
router.post('/auth', authorize)
export default router
