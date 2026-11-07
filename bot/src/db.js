import Database from 'better-sqlite3'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { copyFileSync, existsSync, mkdirSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDir = join(__dirname, '../data')
const dbPath = join(dataDir, 'waffle.db')
const oldDbPath = join(dataDir, 'inari.db')

mkdirSync(dataDir, { recursive: true })

// One-time, safe migration from the old name.
// Only runs when waffle.db does not exist yet and inari.db does.
// It COPIES the files (the old ones are never deleted or changed), so you can
// always go back. SQLite side files (-wal / -shm) are copied too if present.
if (!existsSync(dbPath) && existsSync(oldDbPath)) {
  for (const suffix of ['', '-wal', '-shm']) {
    const from = oldDbPath + suffix
    if (existsSync(from)) copyFileSync(from, dbPath + suffix)
  }
  console.log('[waffle] Copied your old inari.db to waffle.db. The old file was left untouched.')
}

const db = new Database(dbPath)

db.exec(`
  CREATE TABLE IF NOT EXISTS templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    embed TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
  );

  CREATE TABLE IF NOT EXISTS vault (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT NOT NULL,
    label TEXT,
    category TEXT NOT NULL DEFAULT 'Images',
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
  );
`)

export default db
