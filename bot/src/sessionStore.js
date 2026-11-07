import session from 'express-session'
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto'
import db from './db.js'
import { config } from './env.js'

// Keeps sign-in sessions in the same SQLite file as everything else, so people
// stay signed in when the bot restarts. The whole session (which includes the
// person's Discord sign-in token) is encrypted at rest with AES-256-GCM, using a
// key derived from SESSION_SECRET. Change SESSION_SECRET and old sessions simply
// stop working (everyone signs in again).

db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    sid TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    expires INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions (expires);
`)

const key = createHash('sha256').update(`waffle-session-v1:${config.sessionSecret}`).digest()

function encrypt(text) {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key, iv)
  const body = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])
  return Buffer.concat([iv, cipher.getAuthTag(), body]).toString('base64')
}

function decrypt(payload) {
  try {
    const raw = Buffer.from(payload, 'base64')
    const decipher = createDecipheriv('aes-256-gcm', key, raw.subarray(0, 12))
    decipher.setAuthTag(raw.subarray(12, 28))
    return Buffer.concat([decipher.update(raw.subarray(28)), decipher.final()]).toString('utf8')
  } catch {
    return null // wrong key or damaged data: treat as "no session"
  }
}

const selectOne = db.prepare('SELECT data, expires FROM sessions WHERE sid = ?')
const upsert = db.prepare(`
  INSERT INTO sessions (sid, data, expires) VALUES (?, ?, ?)
  ON CONFLICT(sid) DO UPDATE SET data = excluded.data, expires = excluded.expires
`)
const remove = db.prepare('DELETE FROM sessions WHERE sid = ?')
const sweep = db.prepare('DELETE FROM sessions WHERE expires <= ?')

const DEFAULT_TTL_MS = 7 * 24 * 60 * 60 * 1000
const expiryOf = (sess) =>
  sess?.cookie?.expires ? new Date(sess.cookie.expires).getTime() : Date.now() + DEFAULT_TTL_MS

export class SqliteSessionStore extends session.Store {
  constructor() {
    super()
    sweep.run(Date.now())
    setInterval(() => sweep.run(Date.now()), 60 * 60 * 1000).unref()
  }

  get(sid, callback) {
    try {
      const row = selectOne.get(sid)
      if (!row) return callback(null, null)
      if (row.expires <= Date.now()) {
        remove.run(sid)
        return callback(null, null)
      }
      const json = decrypt(row.data)
      if (!json) {
        remove.run(sid)
        return callback(null, null)
      }
      callback(null, JSON.parse(json))
    } catch (err) {
      callback(err)
    }
  }

  set(sid, sess, callback) {
    try {
      upsert.run(sid, encrypt(JSON.stringify(sess)), expiryOf(sess))
      callback?.(null)
    } catch (err) {
      callback?.(err)
    }
  }

  touch(sid, sess, callback) {
    try {
      db.prepare('UPDATE sessions SET expires = ? WHERE sid = ?').run(expiryOf(sess), sid)
      callback?.(null)
    } catch (err) {
      callback?.(err)
    }
  }

  destroy(sid, callback) {
    try {
      remove.run(sid)
      callback?.(null)
    } catch (err) {
      callback?.(err)
    }
  }
}
