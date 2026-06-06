import express from 'express'
import cors from 'cors'
import passport from 'passport'
import authRouter, { sessionMiddleware } from './auth.js'
import { client } from '../index.js'
import db from '../db.js'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const path = require('path')

const app = express()

// CORS
app.use(cors({
  origin: (origin, callback) => {
    callback(null, true)
  },
  credentials: true,
}))

app.use(express.json())
app.use(sessionMiddleware)
app.use(passport.initialize())
app.use(passport.session())

// Mount auth routes (no protection on these)
app.use('/auth', authRouter)

// ─── Serve dashboard static files ────────────────────────────
const dashboardDist = '/app/dashboard-dist'
app.use(express.static(dashboardDist))

// ─── Auth middleware ──────────────────────────────────────────
function requireAuth(req, res, next) {
  if (req.isAuthenticated()) return next()
  res.status(401).json({ error: 'Unauthorized' })
}

// ─── Health check (public) ────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    bot: client.user?.tag || 'connecting...',
    uptime: Math.floor(process.uptime()) + 's',
  })
})

// ─── All routes below require auth ───────────────────────────

app.get('/guilds', requireAuth, (req, res) => {
  const guilds = client.guilds.cache.map(g => ({
    id: g.id,
    name: g.name,
    icon: g.iconURL(),
  }))
  res.json(guilds)
})

app.get('/guilds/:guildId/channels', requireAuth, async (req, res) => {
  const guild = client.guilds.cache.get(req.params.guildId)
  if (!guild) return res.status(404).json({ error: 'Guild not found' })
  const channels = guild.channels.cache
    .filter(c => c.type === 0)
    .map(c => ({ id: c.id, name: c.name }))
  res.json(channels)
})

app.get('/guilds/:guildId/emojis', requireAuth, async (req, res) => {
  const guild = client.guilds.cache.get(req.params.guildId)
  if (!guild) return res.status(404).json({ error: 'Guild not found' })
  const emojis = guild.emojis.cache.map(e => ({
    id: e.id,
    name: e.name,
    url: e.imageURL(),
    animated: e.animated,
    code: e.animated ? `<a:${e.name}:${e.id}>` : `<:${e.name}:${e.id}>`,
  }))
  res.json(emojis)
})

app.post('/send-embed', requireAuth, async (req, res) => {
  const { channelId, embed, components } = req.body
  try {
    const channel = await client.channels.fetch(channelId)
    await channel.send({ embeds: [embed], components: components || [] })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/templates', requireAuth, (req, res) => {
  const templates = db.prepare(`
    SELECT id, name, description, created_at, updated_at
    FROM templates ORDER BY updated_at DESC
  `).all()
  res.json(templates)
})

app.get('/templates/:id', requireAuth, (req, res) => {
  const template = db.prepare('SELECT * FROM templates WHERE id = ?').get(req.params.id)
  if (!template) return res.status(404).json({ error: 'Not found' })
  res.json({ ...template, embed: JSON.parse(template.embed) })
})

app.post('/templates', requireAuth, (req, res) => {
  const { name, description, embed } = req.body
  if (!name || !embed) return res.status(400).json({ error: 'name and embed required' })
  const result = db.prepare(`
    INSERT INTO templates (name, description, embed) VALUES (?, ?, ?)
  `).run(name, description || '', JSON.stringify(embed))
  res.json({ id: result.lastInsertRowid, name, description })
})

app.put('/templates/:id', requireAuth, (req, res) => {
  const { name, description, embed } = req.body
  const existing = db.prepare('SELECT id FROM templates WHERE id = ?').get(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Not found' })
  db.prepare(`
    UPDATE templates SET name = ?, description = ?, embed = ?, updated_at = unixepoch()
    WHERE id = ?
  `).run(name, description || '', JSON.stringify(embed), req.params.id)
  res.json({ success: true })
})

app.delete('/templates/:id', requireAuth, (req, res) => {
  db.prepare('DELETE FROM templates WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

app.get('/vault', requireAuth, (req, res) => {
  const items = db.prepare(`
    SELECT * FROM vault ORDER BY category, created_at DESC
  `).all()
  res.json(items)
})

app.post('/vault', requireAuth, (req, res) => {
  const { url, label, category } = req.body
  if (!url) return res.status(400).json({ error: 'url required' })
  const result = db.prepare(`
    INSERT INTO vault (url, label, category) VALUES (?, ?, ?)
  `).run(url, label || '', category || 'Images')
  res.json({ id: result.lastInsertRowid, url, label, category })
})

app.delete('/vault/:id', requireAuth, (req, res) => {
  db.prepare('DELETE FROM vault WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

app.patch('/vault/:id', requireAuth, (req, res) => {
  const { label, category } = req.body
  db.prepare(`
    UPDATE vault SET label = ?, category = ? WHERE id = ?
  `).run(label, category, req.params.id)
  res.json({ success: true })
})

// ─── Fallback for React Router ────────────────────────────────
app.use((req, res) => {
  res.sendFile(path.join(dashboardDist, 'index.html'))
})

export function startAPI() {
  const port = process.env.API_PORT || 3003
  app.listen(port, () => console.log(`🌐 API running on port ${port}`))
}