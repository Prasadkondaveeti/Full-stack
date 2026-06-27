import { Request, Response } from 'express'
import pool from '../config/db'

export const getPosts = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT p.id, p.title, p.body AS excerpt, p.created_at AS date,
             u.name AS author
      FROM posts p
      LEFT JOIN users u ON u.id = p.author_id
      ORDER BY p.created_at DESC
    `)
    res.json({ success: true, data: result.rows })
  } catch (err) {
    console.error('getPosts error:', err)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

export const getPostById = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT p.id, p.title, p.body AS excerpt, p.created_at AS date, u.name AS author
       FROM posts p
       LEFT JOIN users u ON u.id = p.author_id
       WHERE p.id = $1`,
      [req.params.id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Post not found' })
    }
    res.json({ success: true, data: result.rows[0] })
  } catch (err) {
    console.error('getPostById error:', err)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}
