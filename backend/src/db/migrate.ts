import fs from 'fs'
import path from 'path'
import pool from '../config/db'

export const runMigrations = async () => {
  const sql = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf-8')
  await pool.query(sql)
  console.log('[DB] Migrations applied ✅ (users, posts tables ready)')
}
