import { Router } from 'express'

import authorize from '@aces/services/auth/authorize'


const router = Router()
router.post('/auth', authorize)

export default router
