import { Pool } from 'pg'

// Reads standard PG* env vars (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME)
// or a single DATABASE_URL connection string — whichever is set.
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
      }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 5432,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'myapp',
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
      }
)

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err)
})

export const testConnection = async () => {
  try {
    const client = await pool.connect()
    const result = await client.query('SELECT NOW()')
    client.release()
    console.log(`[DB] Connected ✅ — server time: ${result.rows[0].now}`)
    return true
  } catch (err) {
    console.error('[DB] Connection failed ❌:', (err as Error).message)
    return false
  }
}

export default pool
