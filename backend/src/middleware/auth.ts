import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  userId?: number
  userRole?: string
}

export const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' })
  }

  const token = header.split(' ')[1]
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; role: string }
    req.userId = decoded.id
    req.userRole = decoded.role
    next()
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' })
  }
}

export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return res.status(403).json({ success: false, message: 'Forbidden' })
    }
    next()
  }
}
