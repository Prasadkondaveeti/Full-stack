import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import healthRouter from './routes/health'
import usersRouter from './routes/users'
import postsRouter from './routes/posts'
import authRouter from './routes/auth'

const app = express()

// Security & middleware
app.use(helmet())
app.use(compression())
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

// CORS — allow only the frontend origin
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api/health', healthRouter)
app.use('/api/users', usersRouter)
app.use('/api/posts', postsRouter)
app.use('/api/auth', authRouter)

// 404
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

export default app
