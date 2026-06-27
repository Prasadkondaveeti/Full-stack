-- Run once against your database to set up the schema:
--   psql -U postgres -d myapp -f src/db/init.sql
-- It also runs automatically every time the server starts (see db/migrate.ts) — CREATE TABLE IF NOT EXISTS is safe to repeat.

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(160) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          VARCHAR(30) NOT NULL DEFAULT 'user',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS posts (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(200) NOT NULL,
  body        TEXT NOT NULL DEFAULT '',
  tag         VARCHAR(60) NOT NULL DEFAULT 'General',
  author_id   INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
