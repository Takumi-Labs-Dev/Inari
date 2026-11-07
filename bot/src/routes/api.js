import express from 'express'
import cors from 'cors'
import passport from 'passport'
import path from 'path'
import { existsSync } from 'fs'
import { ChannelType, OAuth2Scopes, PermissionFlagsBits } from 'discord.js'
import authRouter, { sessionMiddleware } from './auth.js'
import { client } from '../client.js'
import db from '../db.js'
import { config } from '../env.js'
import { getManageableGuilds, guildIconUrl } from '../access.js'

const app = express()
app.disable('x-powered-by')

// ─── CORS: only the origins listed in ALLOWED_ORIGINS ────────────
app.use(cors({
  origin: (origin, callback) => {
    // No Origin header = same-origin request or a non-browser client
    if (!origin || config.allowedOrigins.includes(origin)) return callback(null, true)
    callback(null, false)
  },
  credentials: true,
}))

app.use(express.json({ limit: '100kb' }))
app.use(sessionMiddleware)
app.use(passport.initialize())
app.use(passport.session())

app.use('/auth', authRouter)

// ─── Dashboard static files ──────────────────────────────────────
app.use(express.static(config.dashboardDist))

// ─── Helpers ─────────────────────────────────────────────────────
const VAULT_CATEGORIES = ['Profiles', 'Thumbnails', 'Images']

const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0
const cleanText = (v, max) => (isNonEmptyString(v) ? v.slice(0, max) : undefined)
const parseId = (v) => (/^\d{1,15}$/.test(String(v)) ? Number(v) : null)

function cleanUrl(v) {
  if (!isNonEmptyString(v) || v.length > 2000) return undefined
  try {
    const u = new URL(v.trim())
    return u.protocol === 'https:' || u.protocol === 'http:' ? v.trim() : undefined
  } catch {
    return undefined
  }
}

// Builds a Discord-safe embed: drops empty strings and bad URLs, applies limits.
function cleanEmbed(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const embed = {}

  const title = cleanText(raw.title, 256)
  if (title) embed.title = title

  const description = cleanText(raw.description, 4096)
  if (description) embed.description = description

  if (Number.isInteger(raw.color) && raw.color >= 0 && raw.color <= 0xffffff) {
    embed.color = raw.color
  }

  if (isNonEmptyString(raw.timestamp) && !Number.isNaN(Date.parse(raw.timestamp))) {
    embed.timestamp = new Date(raw.timestamp).toISOString()
  }

  const authorName = cleanText(raw.author?.name, 256)
  if (authorName) {
    embed.author = { name: authorName }
    const icon = cleanUrl(raw.author?.icon_url)
    if (icon) embed.author.icon_url = icon
  }

  const footerText = cleanText(raw.footer?.text, 2048)
  if (footerText) {
    embed.footer = { text: footerText }
    const icon = cleanUrl(raw.footer?.icon_url)
    if (icon) embed.footer.icon_url = icon
  }

  const thumbnail = cleanUrl(raw.thumbnail?.url)
  if (thumbnail) embed.thumbnail = { url: thumbnail }

  const image = cleanUrl(raw.image?.url)
  if (image) embed.image = { url: image }

  if (Array.isArray(raw.fields)) {
    const fields = raw.fields
      .filter((f) => f && isNonEmptyString(f.name) && isNonEmptyString(f.value))
      .slice(0, 25)
      .map((f) => ({
        name: f.name.slice(0, 256),
        value: f.value.slice(0, 1024),
        inline: f.inline === true,
      }))
    if (fields.length > 0) embed.fields = fields
  }

  return embed
}

const embedHasContent = (e) =>
  Boolean(e.title || e.description || e.author || e.footer || e.thumbnail || e.image || e.fields)

const embedLength = (e) =>
  (e.title?.length ?? 0) +
  (e.description?.length ?? 0) +
  (e.author?.name.length ?? 0) +
  (e.footer?.text.length ?? 0) +
  (e.fields ?? []).reduce((n, f) => n + f.name.length + f.value.length, 0)

// The permissions Waffle asks for when it is added to a server.
// These are exactly what sending an embed needs (and what /send-embed checks).
const INVITE_PERMISSIONS = [
  PermissionFlagsBits.ViewChannel,
  PermissionFlagsBits.SendMessages,
  PermissionFlagsBits.EmbedLinks,
]

const MAX_TEMPLATES_PER_SERVER = 100
const MAX_VAULT_ITEMS_PER_SERVER = 200

const isSnowflake = (v) => typeof v === 'string' && /^\d{15,25}$/.test(v)

function requireAuth(req, res, next) {
  if (req.isAuthenticated()) return next()
  res.status(401).json({ error: 'Unauthorized' })
}

// Guards every /guilds/:guildId/... route. In this order:
//  1. the person must manage that server (checked with Discord, not trusted from the browser)
//  2. only then do we say whether Waffle is in it (so outsiders cannot probe which servers have Waffle)
async function requireGuildAccess(req, res, next) {
  const { guildId } = req.params
  if (!isSnowflake(guildId)) return res.status(404).json({ error: 'Server not found' })

  let manageable
  try {
    manageable = await getManageableGuilds(req.user)
  } catch (err) {
    return res.status(err.status || 503).json({ error: err.message })
  }
  if (!manageable.some((g) => g.id === guildId)) {
    return res.status(403).json({ error: 'You need the Manage Server permission in that server.' })
  }

  const guild = client.guilds.cache.get(guildId)
  if (!guild) {
    return res.status(404).json({ error: 'Waffle is not in that server yet. Add it first.' })
  }
  req.guild = guild
  next()
}

// ─── Health check (public) ───────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    bot: client.user?.tag || 'connecting...',
    uptime: Math.floor(process.uptime()) + 's',
  })
})

// ─── Adding Waffle to a server (public: it is only a link) ───────
app.get('/invite', (req, res) => {
  if (!client.application) return res.status(503).json({ error: 'Waffle is still starting. Try again in a moment.' })
  const url = client.generateInvite({
    scopes: [OAuth2Scopes.Bot],
    permissions: INVITE_PERMISSIONS,
  })
  res.json({ url })
})

// ─── Everything below requires login ─────────────────────────────

// Servers the person manages, and whether Waffle is already in each one.
app.get('/guilds', requireAuth, async (req, res) => {
  try {
    const manageable = await getManageableGuilds(req.user)
    res.json(
      manageable.map((g) => ({
        id: g.id,
        name: g.name,
        icon: guildIconUrl(g),
        botPresent: client.guilds.cache.has(g.id),
      }))
    )
  } catch (err) {
    res.status(err.status || 503).json({ error: err.message })
  }
})

app.get('/guilds/:guildId/channels', requireAuth, requireGuildAccess, (req, res) => {
  const channels = req.guild.channels.cache
    .filter((c) => c.type === ChannelType.GuildText || c.type === ChannelType.GuildAnnouncement)
    .map((c) => ({ id: c.id, name: c.name }))
  res.json(channels)
})

app.get('/guilds/:guildId/emojis', requireAuth, requireGuildAccess, (req, res) => {
  const emojis = req.guild.emojis.cache.map((e) => ({
    id: e.id,
    name: e.name,
    url: e.imageURL(),
    animated: e.animated,
    code: e.animated ? `<a:${e.name}:${e.id}>` : `<:${e.name}:${e.id}>`,
  }))
  res.json(emojis)
})

app.post('/guilds/:guildId/send-embed', requireAuth, requireGuildAccess, async (req, res) => {
  const { channelId, embed: rawEmbed } = req.body ?? {}

  if (!isSnowflake(channelId)) {
    return res.status(400).json({ error: 'Please choose a channel.' })
  }

  const embed = cleanEmbed(rawEmbed)
  if (!embed || !embedHasContent(embed)) {
    return res.status(400).json({ error: 'The embed is empty. Add a title, description, field, image, author or footer.' })
  }
  if (embedLength(embed) > 6000) {
    return res.status(400).json({ error: 'The embed text is over Discord\'s 6000 character limit.' })
  }

  const guild = req.guild
  const channel = guild.channels.cache.get(channelId)
  if (!channel || (channel.type !== ChannelType.GuildText && channel.type !== ChannelType.GuildAnnouncement)) {
    return res.status(404).json({ error: 'That channel was not found in your server.' })
  }

  const me = guild.members.me ?? await guild.members.fetchMe()
  const perms = channel.permissionsFor(me)
  if (!perms || !perms.has(INVITE_PERMISSIONS)) {
    return res.status(403).json({
      error: 'Waffle cannot send embeds in that channel. Give the bot View Channel, Send Messages and Embed Links there.',
    })
  }

  try {
    await channel.send({ embeds: [embed] })
    res.json({ success: true })
  } catch (err) {
    console.error('[waffle] send-embed failed:', err)
    res.status(502).json({ error: 'Discord refused the message. Please try again.' })
  }
})

// ─── Templates (saved per server) ────────────────────────────────
const guildRoute = (path) => `/guilds/:guildId${path}`
const guardGuild = [requireAuth, requireGuildAccess]

app.get(guildRoute('/templates'), guardGuild, (req, res) => {
  const templates = db.prepare(`
    SELECT id, name, description, created_at, updated_at
    FROM templates WHERE guild_id = ? ORDER BY updated_at DESC
  `).all(req.guild.id)
  res.json(templates)
})

app.get(guildRoute('/templates/:id'), guardGuild, (req, res) => {
  const id = parseId(req.params.id)
  if (!id) return res.status(404).json({ error: 'Not found' })
  const template = db.prepare('SELECT * FROM templates WHERE id = ? AND guild_id = ?').get(id, req.guild.id)
  if (!template) return res.status(404).json({ error: 'Not found' })
  res.json({ ...template, embed: JSON.parse(template.embed) })
})

function readTemplateBody(body) {
  const name = cleanText(body?.name?.trim?.(), 100)
  const description = typeof body?.description === 'string' ? body.description.slice(0, 300) : ''
  const embed = body?.embed
  const embedOk = embed && typeof embed === 'object' && !Array.isArray(embed)
  if (!name || !embedOk) return null
  return { name, description, embed }
}

app.post(guildRoute('/templates'), guardGuild, (req, res) => {
  const t = readTemplateBody(req.body)
  if (!t) return res.status(400).json({ error: 'A name and an embed are required.' })

  const { n } = db.prepare('SELECT COUNT(*) AS n FROM templates WHERE guild_id = ?').get(req.guild.id)
  if (n >= MAX_TEMPLATES_PER_SERVER) {
    return res.status(400).json({ error: `This server already has ${MAX_TEMPLATES_PER_SERVER} templates. Delete one first.` })
  }

  const result = db.prepare(`
    INSERT INTO templates (guild_id, name, description, embed) VALUES (?, ?, ?, ?)
  `).run(req.guild.id, t.name, t.description, JSON.stringify(t.embed))
  res.json({ id: result.lastInsertRowid, name: t.name, description: t.description })
})

app.put(guildRoute('/templates/:id'), guardGuild, (req, res) => {
  const id = parseId(req.params.id)
  const t = readTemplateBody(req.body)
  if (!id) return res.status(404).json({ error: 'Not found' })
  if (!t) return res.status(400).json({ error: 'A name and an embed are required.' })
  const existing = db.prepare('SELECT id FROM templates WHERE id = ? AND guild_id = ?').get(id, req.guild.id)
  if (!existing) return res.status(404).json({ error: 'Not found' })
  db.prepare(`
    UPDATE templates SET name = ?, description = ?, embed = ?, updated_at = unixepoch()
    WHERE id = ? AND guild_id = ?
  `).run(t.name, t.description, JSON.stringify(t.embed), id, req.guild.id)
  res.json({ success: true })
})

app.delete(guildRoute('/templates/:id'), guardGuild, (req, res) => {
  const id = parseId(req.params.id)
  if (id) db.prepare('DELETE FROM templates WHERE id = ? AND guild_id = ?').run(id, req.guild.id)
  res.json({ success: true })
})

// ─── Vault (saved per server) ────────────────────────────────────
app.get(guildRoute('/vault'), guardGuild, (req, res) => {
  const items = db.prepare(`
    SELECT id, url, label, category, created_at
    FROM vault WHERE guild_id = ? ORDER BY category, created_at DESC
  `).all(req.guild.id)
  res.json(items)
})

app.post(guildRoute('/vault'), guardGuild, (req, res) => {
  const url = cleanUrl(req.body?.url)
  if (!url) return res.status(400).json({ error: 'A valid image URL (https://...) is required.' })

  const label = typeof req.body?.label === 'string' ? req.body.label.slice(0, 100) : ''
  const category = req.body?.category ?? 'Images'
  if (!VAULT_CATEGORIES.includes(category)) {
    return res.status(400).json({ error: 'Unknown category.' })
  }

  const { n } = db.prepare('SELECT COUNT(*) AS n FROM vault WHERE guild_id = ?').get(req.guild.id)
  if (n >= MAX_VAULT_ITEMS_PER_SERVER) {
    return res.status(400).json({ error: `This server's vault already has ${MAX_VAULT_ITEMS_PER_SERVER} items. Delete one first.` })
  }

  const result = db.prepare(`
    INSERT INTO vault (guild_id, url, label, category) VALUES (?, ?, ?, ?)
  `).run(req.guild.id, url, label, category)
  res.json({ id: result.lastInsertRowid, url, label, category })
})

app.delete(guildRoute('/vault/:id'), guardGuild, (req, res) => {
  const id = parseId(req.params.id)
  if (id) db.prepare('DELETE FROM vault WHERE id = ? AND guild_id = ?').run(id, req.guild.id)
  res.json({ success: true })
})

app.patch(guildRoute('/vault/:id'), guardGuild, (req, res) => {
  const id = parseId(req.params.id)
  const existing = id
    ? db.prepare('SELECT * FROM vault WHERE id = ? AND guild_id = ?').get(id, req.guild.id)
    : null
  if (!existing) return res.status(404).json({ error: 'Not found' })

  const label = typeof req.body?.label === 'string' ? req.body.label.slice(0, 100) : existing.label
  const category = VAULT_CATEGORIES.includes(req.body?.category) ? req.body.category : existing.category

  db.prepare('UPDATE vault SET label = ?, category = ? WHERE id = ? AND guild_id = ?')
    .run(label, category, id, req.guild.id)
  res.json({ success: true })
})

// ─── Fallback for the dashboard's routes ─────────────────────────
app.use((req, res) => {
  if (req.method !== 'GET') return res.status(404).json({ error: 'Not found' })
  const indexFile = path.join(config.dashboardDist, 'index.html')
  if (!existsSync(indexFile)) {
    return res
      .status(503)
      .type('text')
      .send('The dashboard has not been built yet. Run "npm run build" inside the dashboard folder, then reload.')
  }
  res.sendFile(indexFile)
})

// ─── Last-resort error handler ───────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[waffle] Request error:', err)
  if (res.headersSent) return next(err)
  const status = err.status && err.status < 500 ? err.status : 500
  res.status(status).json({ error: status < 500 ? 'Invalid request.' : 'Something went wrong.' })
})

export function startAPI() {
  const server = app.listen(config.port, config.host, () => {
    console.log(`[waffle] API listening on http://${config.host}:${config.port}`)
  })
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`[waffle] Port ${config.port} is already in use. Close the other program or change API_PORT in .env.`)
    } else {
      console.error('[waffle] API server error:', err)
    }
    process.exit(1)
  })
  return server
}
