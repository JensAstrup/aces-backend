import { Router } from 'express'

import authorize from '@aces/services/auth/authorize'


const router = Router()
router.get('/', (req, res) => {
  res.send('Hello World!')
})
router.post('/auth', authorize)

export default router
