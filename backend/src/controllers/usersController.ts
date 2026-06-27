import { Request, Response } from 'express'
import pool from '../config/db'

export const getUsers = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT id, name, email, role, created_at FROM users ORDER BY id')
    res.json({ success: true, data: result.rows })
  } catch (err) {
    console.error('getUsers error:', err)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

export const getUserById = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
      [req.params.id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }
    res.json({ success: true, data: result.rows[0] })
  } catch (err) {
    console.error('getUserById error:', err)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}
