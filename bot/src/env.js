import dotenv from 'dotenv'
import { dirname, join, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
// bot/src -> bot -> repo root (where the .env file lives)
const rootDir = resolve(__dirname, '..', '..')

dotenv.config({ path: join(rootDir, '.env'), quiet: true })

const REQUIRED = [
  'DISCORD_TOKEN',
  'DISCORD_CLIENT_ID',
  'DISCORD_CLIENT_SECRET',
  'REDIRECT_URI',
  'SESSION_SECRET',
]

const isPlaceholder = (value) => /^your_.*_here$/i.test(value)

const problems = []
for (const key of REQUIRED) {
  const value = process.env[key]?.trim()
  if (!value) problems.push(`${key} is missing`)
  else if (isPlaceholder(value)) problems.push(`${key} still has the placeholder value`)
}

if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.trim().length < 32) {
  problems.push('SESSION_SECRET must be at least 32 characters long')
}

if (problems.length > 0) {
  console.error('[waffle] Cannot start. Please fix your .env file:')
  for (const p of problems) console.error(`  - ${p}`)
  console.error(`[waffle] The file should be here: ${join(rootDir, '.env')}`)
  process.exit(1)
}

function legacyGuildId() {
  const value = process.env.DISCORD_GUILD_ID?.trim()
  return value && !isPlaceholder(value) && /^\d{15,25}$/.test(value) ? value : null
}

const redirectUri = process.env.REDIRECT_URI.trim()
const isHttps = redirectUri.startsWith('https://')

// COOKIE_SECURE=true/false wins if set; otherwise it follows REDIRECT_URI.
const cookieSecure = process.env.COOKIE_SECURE
  ? process.env.COOKIE_SECURE.trim() === 'true'
  : isHttps

// Number of web proxies in front of Waffle (hosting platforms and reverse proxies
// that handle HTTPS count as 1). Needed so Waffle sees the real visitor address
// and knows the connection was HTTPS. 0 = none (your own computer).
const trustProxy = Number.isInteger(Number(process.env.TRUST_PROXY)) && process.env.TRUST_PROXY?.trim() !== ''
  ? Number(process.env.TRUST_PROXY)
  : (isHttps ? 1 : 0)

if (!isHttps && !/^http:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(redirectUri)) {
  console.warn('[waffle] REDIRECT_URI is plain http on a public address. Use https for anything other than your own computer.')
}

export const config = {
  token: process.env.DISCORD_TOKEN.trim(),
  clientId: process.env.DISCORD_CLIENT_ID.trim(),
  clientSecret: process.env.DISCORD_CLIENT_SECRET.trim(),
  // Optional. Only used ONCE, to move templates/vault items saved before
  // Waffle became multi-server into that server. Safe to delete from .env afterwards.
  legacyGuildId: legacyGuildId(),
  redirectUri,
  sessionSecret: process.env.SESSION_SECRET.trim(),
  cookieSecure,
  trustProxy,
  allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:3003,http://localhost:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  port: Number(process.env.API_PORT) || 3003,
  host: process.env.API_HOST?.trim() || '127.0.0.1',
  dashboardDist: process.env.DASHBOARD_DIST?.trim()
    ? resolve(rootDir, process.env.DASHBOARD_DIST.trim())
    : join(rootDir, 'dashboard', 'dist'),
}
