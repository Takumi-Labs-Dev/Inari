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
  'DISCORD_GUILD_ID',
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
  console.error('[inari] Cannot start. Please fix your .env file:')
  for (const p of problems) console.error(`  - ${p}`)
  console.error(`[inari] The file should be here: ${join(rootDir, '.env')}`)
  process.exit(1)
}

export const config = {
  token: process.env.DISCORD_TOKEN.trim(),
  clientId: process.env.DISCORD_CLIENT_ID.trim(),
  clientSecret: process.env.DISCORD_CLIENT_SECRET.trim(),
  guildId: process.env.DISCORD_GUILD_ID.trim(),
  redirectUri: process.env.REDIRECT_URI.trim(),
  sessionSecret: process.env.SESSION_SECRET.trim(),
  cookieSecure: process.env.COOKIE_SECURE === 'true',
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