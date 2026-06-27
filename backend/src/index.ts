import dotenv from 'dotenv'

// Load env file based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development'
dotenv.config({ path: envFile })

import app from './app'

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`[${process.env.NODE_ENV?.toUpperCase()}] Server running on port ${PORT}`)
})
