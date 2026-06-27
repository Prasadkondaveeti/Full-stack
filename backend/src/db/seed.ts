import dotenv from 'dotenv'
dotenv.config({ path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development' })

import bcrypt from 'bcryptjs'
import pool, { testConnection } from '../config/db'
import { runMigrations } from './migrate'

const run = async () => {
  await testConnection()
  await runMigrations()

  const email = 'admin@myapp.com'
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email])

  let adminId: number
  if (existing.rows.length > 0) {
    adminId = existing.rows[0].id
    console.log('[Seed] Admin user already exists, skipping creation.')
  } else {
    const passwordHash = await bcrypt.hash('admin123', 10)
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, 'admin') RETURNING id`,
      ['Prasad', email, passwordHash]
    )
    adminId = result.rows[0].id
    console.log(`[Seed] Created admin user: ${email} / admin123`)
  }

  const postCount = await pool.query('SELECT COUNT(*) FROM posts')
  if (Number(postCount.rows[0].count) === 0) {
    const samplePosts = [
      ['Shipping the new dashboard', 'A look at how the team rebuilt the admin dashboard from scratch in three weeks.', 'Product'],
      ['Why we moved to Strapi v5', 'Notes on the migration, the gotchas we hit, and what got easier afterwards.', 'Engineering'],
      ['Deploying to EC2 with PM2 + Nginx', 'A repeatable setup for zero-downtime deploys on a single EC2 box.', 'DevOps'],
    ]
    for (const [title, body, tag] of samplePosts) {
      await pool.query(
        'INSERT INTO posts (title, body, tag, author_id) VALUES ($1, $2, $3, $4)',
        [title, body, tag, adminId]
      )
    }
    console.log(`[Seed] Inserted ${samplePosts.length} sample posts.`)
  } else {
    console.log('[Seed] Posts already exist, skipping.')
  }

  console.log('[Seed] Done.')
  process.exit(0)
}

run().catch((err) => {
  console.error('[Seed] Failed:', err)
  process.exit(1)
})
