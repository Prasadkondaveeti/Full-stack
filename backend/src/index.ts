import dotenv from 'dotenv'

// Load env file based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development'
dotenv.config({ path: envFile })

import app from './app'
import { testConnection } from './config/db'
import { runMigrations } from './db/migrate'

const PORT = process.env.PORT || 5000

const start = async () => {
  const connected = await testConnection()
  if (!connected) {
    console.error('[Startup] Could not connect to the database. Check your DB_* env vars in', envFile)
    process.exit(1)
  }

  await runMigrations()

  app.listen(PORT, () => {
    console.log(`[${process.env.NODE_ENV?.toUpperCase()}] Server running on port ${PORT}`)
  })
}

start()
