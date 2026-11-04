import express from 'express'
import cors from 'cors'
import passport from 'passport'
import path from 'path'
import { existsSync } from 'fs'
import { ChannelType, PermissionFlagsBits } from 'discord.js'
import authRouter, { sessionMiddleware } from './auth.js'
import { client } from '../client.js'
import db from '../db.js'
import { config } from '../env.js'

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

// Stage 1 is single-server: everything is locked to DISCORD_GUILD_ID.
function getAllowedGuild(req, res) {
  const guild = client.guilds.cache.get(config.guildId)
  if (!guild || req.params.guildId !== config.guildId) {
    res.status(404).json({ error: 'Server not found' })
    return null
  }
  return guild
}

function requireAuth(req, res, next) {
  if (req.isAuthenticated()) return next()
  res.status(401).json({ error: 'Unauthorized' })
}

// ─── Health check (public) ───────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    bot: client.user?.tag || 'connecting...',
    uptime: Math.floor(process.uptime()) + 's',
  })
})

// ─── Everything below requires login ─────────────────────────────

app.get('/guilds', requireAuth, (req, res) => {
  const guild = client.guilds.cache.get(config.guildId)
  res.json(guild ? [{ id: guild.id, name: guild.name, icon: guild.iconURL() }] : [])
})

app.get('/guilds/:guildId/channels', requireAuth, (req, res) => {
  const guild = getAllowedGuild(req, res)
  if (!guild) return
  const channels = guild.channels.cache
    .filter((c) => c.type === ChannelType.GuildText || c.type === ChannelType.GuildAnnouncement)
    .map((c) => ({ id: c.id, name: c.name }))
  res.json(channels)
})

app.get('/guilds/:guildId/emojis', requireAuth, (req, res) => {
  const guild = getAllowedGuild(req, res)
  if (!guild) return
  const emojis = guild.emojis.cache.map((e) => ({
    id: e.id,
    name: e.name,
    url: e.imageURL(),
    animated: e.animated,
    code: e.animated ? `<a:${e.name}:${e.id}>` : `<:${e.name}:${e.id}>`,
  }))
  res.json(emojis)
})

app.post('/send-embed', requireAuth, async (req, res) => {
  const { channelId, embed: rawEmbed } = req.body ?? {}

  if (typeof channelId !== 'string' || !/^\d{15,25}$/.test(channelId)) {
    return res.status(400).json({ error: 'Please choose a channel.' })
  }

  const embed = cleanEmbed(rawEmbed)
  if (!embed || !embedHasContent(embed)) {
    return res.status(400).json({ error: 'The embed is empty. Add a title, description, field, image, author or footer.' })
  }
  if (embedLength(embed) > 6000) {
    return res.status(400).json({ error: 'The embed text is over Discord\'s 6000 character limit.' })
  }

  const guild = client.guilds.cache.get(config.guildId)
  if (!guild) return res.status(404).json({ error: 'Server not found' })

  const channel = guild.channels.cache.get(channelId)
  if (!channel || (channel.type !== ChannelType.GuildText && channel.type !== ChannelType.GuildAnnouncement)) {
    return res.status(404).json({ error: 'That channel was not found in your server.' })
  }

  const me = guild.members.me ?? await guild.members.fetchMe()
  const perms = channel.permissionsFor(me)
  const needed = [
    PermissionFlagsBits.ViewChannel,
    PermissionFlagsBits.SendMessages,
    PermissionFlagsBits.EmbedLinks,
  ]
  if (!perms || !perms.has(needed)) {
    return res.status(403).json({
      error: 'Inari cannot send embeds in that channel. Give the bot View Channel, Send Messages and Embed Links there.',
    })
  }

  try {
    await channel.send({ embeds: [embed] })
    res.json({ success: true })
  } catch (err) {
    console.error('[inari] send-embed failed:', err)
    res.status(502).json({ error: 'Discord refused the message. Please try again.' })
  }
})

// ─── Templates ───────────────────────────────────────────────────
app.get('/templates', requireAuth, (req, res) => {
  const templates = db.prepare(`
    SELECT id, name, description, created_at, updated_at
    FROM templates ORDER BY updated_at DESC
  `).all()
  res.json(templates)
})

app.get('/templates/:id', requireAuth, (req, res) => {
  const id = parseId(req.params.id)
  if (!id) return res.status(404).json({ error: 'Not found' })
  const template = db.prepare('SELECT * FROM templates WHERE id = ?').get(id)
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

app.post('/templates', requireAuth, (req, res) => {
  const t = readTemplateBody(req.body)
  if (!t) return res.status(400).json({ error: 'A name and an embed are required.' })
  const result = db.prepare(`
    INSERT INTO templates (name, description, embed) VALUES (?, ?, ?)
  `).run(t.name, t.description, JSON.stringify(t.embed))
  res.json({ id: result.lastInsertRowid, name: t.name, description: t.description })
})

app.put('/templates/:id', requireAuth, (req, res) => {
  const id = parseId(req.params.id)
  const t = readTemplateBody(req.body)
  if (!id) return res.status(404).json({ error: 'Not found' })
  if (!t) return res.status(400).json({ error: 'A name and an embed are required.' })
  const existing = db.prepare('SELECT id FROM templates WHERE id = ?').get(id)
  if (!existing) return res.status(404).json({ error: 'Not found' })
  db.prepare(`
    UPDATE templates SET name = ?, description = ?, embed = ?, updated_at = unixepoch()
    WHERE id = ?
  `).run(t.name, t.description, JSON.stringify(t.embed), id)
  res.json({ success: true })
})

app.delete('/templates/:id', requireAuth, (req, res) => {
  const id = parseId(req.params.id)
  if (id) db.prepare('DELETE FROM templates WHERE id = ?').run(id)
  res.json({ success: true })
})

// ─── Vault ───────────────────────────────────────────────────────
app.get('/vault', requireAuth, (req, res) => {
  const items = db.prepare(`
    SELECT * FROM vault ORDER BY category, created_at DESC
  `).all()
  res.json(items)
})

app.post('/vault', requireAuth, (req, res) => {
  const url = cleanUrl(req.body?.url)
  if (!url) return res.status(400).json({ error: 'A valid image URL (https://...) is required.' })

  const label = typeof req.body?.label === 'string' ? req.body.label.slice(0, 100) : ''
  const category = req.body?.category ?? 'Images'
  if (!VAULT_CATEGORIES.includes(category)) {
    return res.status(400).json({ error: 'Unknown category.' })
  }

  const result = db.prepare(`
    INSERT INTO vault (url, label, category) VALUES (?, ?, ?)
  `).run(url, label, category)
  res.json({ id: result.lastInsertRowid, url, label, category })
})

app.delete('/vault/:id', requireAuth, (req, res) => {
  const id = parseId(req.params.id)
  if (id) db.prepare('DELETE FROM vault WHERE id = ?').run(id)
  res.json({ success: true })
})

app.patch('/vault/:id', requireAuth, (req, res) => {
  const id = parseId(req.params.id)
  const existing = id ? db.prepare('SELECT * FROM vault WHERE id = ?').get(id) : null
  if (!existing) return res.status(404).json({ error: 'Not found' })

  const label = typeof req.body?.label === 'string' ? req.body.label.slice(0, 100) : existing.label
  const category = VAULT_CATEGORIES.includes(req.body?.category) ? req.body.category : existing.category

  db.prepare('UPDATE vault SET label = ?, category = ? WHERE id = ?').run(label, category, id)
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
  console.error('[inari] Request error:', err)
  if (res.headersSent) return next(err)
  const status = err.status && err.status < 500 ? err.status : 500
  res.status(status).json({ error: status < 500 ? 'Invalid request.' : 'Something went wrong.' })
})

export function startAPI() {
  const server = app.listen(config.port, config.host, () => {
    console.log(`[inari] API listening on http://${config.host}:${config.port}`)
  })
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`[inari] Port ${config.port} is already in use. Close the other program or change API_PORT in .env.`)
    } else {
      console.error('[inari] API server error:', err)
    }
    process.exit(1)
  })
  return server
}