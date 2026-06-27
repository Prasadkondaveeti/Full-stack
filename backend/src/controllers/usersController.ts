import { Request, Response } from 'express'

// Mock data — replace with DB calls
const users = [
  { id: 1, name: 'Prasad', role: 'admin' },
  { id: 2, name: 'Alice', role: 'user' },
]

export const getUsers = (_req: Request, res: Response) => {
  res.json({ success: true, data: users })
}

export const getUserById = (req: Request, res: Response) => {
  const user = users.find((u) => u.id === parseInt(req.params.id))
  if (!user) return res.status(404).json({ success: false, message: 'User not found' })
  res.json({ success: true, data: user })
}
