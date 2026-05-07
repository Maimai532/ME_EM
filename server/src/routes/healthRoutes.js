import { Router } from 'express'

const router = Router()

router.get('/', async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'API is healthy',
  })
})

export default router
