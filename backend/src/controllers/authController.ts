import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from '../config/db'
import { JWT_SECRET, AuthRequest } from '../middleware/auth'

const SAFE_FIELDS = 'id, name, email, role'

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'name, email and password are required' })
    }

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email])
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Email already registered' })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, 'user') RETURNING ${SAFE_FIELDS}`,
      [name, email, passwordHash]
    )
    const user = result.rows[0]
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' })
    res.status(201).json({ success: true, data: { token, user } })
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' })
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])
    const user = result.rows[0]
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' })
    }

    const match = await bcrypt.compare(password, user.password_hash)
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' })
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' })
    res.json({
      success: true,
      data: {
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      },
    })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

export const me = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(`SELECT ${SAFE_FIELDS} FROM users WHERE id = $1`, [req.userId])
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }
    res.json({ success: true, data: result.rows[0] })
  } catch (err) {
    console.error('Me error:', err)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}
