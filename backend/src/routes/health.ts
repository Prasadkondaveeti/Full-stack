import { Router } from 'express'

const router = Router()

router.get('/', (_req, res) => {
  res.json({
    success: true,
    message: `Backend is healthy ✅`,
    env: process.env.NODE_ENV,
    app: process.env.APP_NAME,
    timestamp: new Date().toISOString(),
  })
})

export default router
