import { config } from './env.js'
import { client } from './client.js'
import db from './db.js'
import { startAPI } from './routes/api.js'

let server = null
let shuttingDown = false

client.once('clientReady', () => {
  console.log(`[waffle] Logged in as ${client.user.tag}`)
  if (!client.guilds.cache.has(config.guildId)) {
    console.warn('[waffle] The bot is not in the server set in DISCORD_GUILD_ID. Invite it first.')
  }
  server = startAPI()
})

client.on('error', (err) => console.error('[waffle] Discord client error:', err))

process.on('unhandledRejection', (reason) => {
  console.error('[waffle] Unhandled promise rejection:', reason)
})

process.on('uncaughtException', (err) => {
  console.error('[waffle] Uncaught exception:', err)
  shutdown(1)
})

function shutdown(code = 0) {
  if (shuttingDown) return
  shuttingDown = true
  console.log('[waffle] Shutting down...')

  const force = setTimeout(() => process.exit(code), 5000)
  force.unref()

  const finish = () => {
    try { db.close() } catch { /* already closed */ }
    Promise.resolve(client.destroy()).finally(() => process.exit(code))
  }

  if (server) server.close(finish)
  else finish()
}

process.on('SIGINT', () => shutdown(0))
process.on('SIGTERM', () => shutdown(0))

client.login(config.token).catch((err) => {
  console.error('[waffle] Discord login failed. Check DISCORD_TOKEN in your .env file.')
  console.error(err.message)
  process.exit(1)
})
