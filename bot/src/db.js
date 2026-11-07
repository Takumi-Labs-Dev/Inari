import Database from 'better-sqlite3'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { copyFileSync, existsSync, mkdirSync } from 'fs'
import { config } from './env.js'

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

// Every saved template and vault item belongs to one Discord server (guild_id).
db.exec(`
  CREATE TABLE IF NOT EXISTS templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT,
    name TEXT NOT NULL,
    description TEXT,
    embed TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
  );

  CREATE TABLE IF NOT EXISTS vault (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT,
    url TEXT NOT NULL,
    label TEXT,
    category TEXT NOT NULL DEFAULT 'Images',
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
  );
`)

// ─── Migration: add guild_id to databases created before multi-server ───
const hasColumn = (table, column) =>
  db.prepare(`PRAGMA table_info(${table})`).all().some((c) => c.name === column)

const tablesToUpgrade = ['templates', 'vault'].filter((t) => !hasColumn(t, 'guild_id'))

if (tablesToUpgrade.length > 0) {
  const rowCount = tablesToUpgrade
    .map((t) => db.prepare(`SELECT COUNT(*) AS n FROM ${t}`).get().n)
    .reduce((a, b) => a + b, 0)

  // Keep a full copy before changing anything. It is never overwritten or deleted.
  if (rowCount > 0) {
    const backupPath = join(dataDir, 'waffle.db.before-multiserver')
    if (!existsSync(backupPath)) {
      db.prepare('VACUUM INTO ?').run(backupPath)
      console.log('[waffle] Saved a backup of your data: bot/data/waffle.db.before-multiserver')
    }
  }

  for (const table of tablesToUpgrade) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN guild_id TEXT`)
  }

  if (rowCount > 0) {
    if (config.legacyGuildId) {
      for (const table of tablesToUpgrade) {
        const { changes } = db
          .prepare(`UPDATE ${table} SET guild_id = ? WHERE guild_id IS NULL`)
          .run(config.legacyGuildId)
        console.log(`[waffle] Moved ${changes} saved ${table} item(s) to server ${config.legacyGuildId}.`)
      }
    } else {
      console.warn(
        '[waffle] You have saved templates/vault items from before multi-server, but DISCORD_GUILD_ID ' +
        'is not set in .env, so they are not assigned to any server and stay hidden. ' +
        'Add DISCORD_GUILD_ID (your old server) to .env and ask for help to assign them.'
      )
    }
  }
}

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_templates_guild ON templates (guild_id);
  CREATE INDEX IF NOT EXISTS idx_vault_guild ON vault (guild_id);
`)

export default db
