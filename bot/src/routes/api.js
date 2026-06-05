import express from 'express';
import cors from 'cors';
import { client } from '../index.js';

const app = express();
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}))
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    status: 'online',
    bot: client.user?.tag || 'connecting...',
    uptime: Math.floor(process.uptime()) + 's',
    endpoints: [
      'GET /guilds',
      'GET /guilds/:guildId/channels',
      'GET /guilds/:guildId/emojis',
      'POST /send-embed',
    ]
  })
})

// GET all guilds the bot is in
app.get('/guilds', (req, res) => {
  const guilds = client.guilds.cache.map(g => ({
    id: g.id,
    name: g.name,
    icon: g.iconURL(),
  }));
  res.json(guilds);
});

// GET channels for a guild
app.get('/guilds/:guildId/channels', async (req, res) => {
  const guild = client.guilds.cache.get(req.params.guildId);
  if (!guild) return res.status(404).json({ error: 'Guild not found' });
  const channels = guild.channels.cache
    .filter(c => c.type === 0) // text channels only
    .map(c => ({ id: c.id, name: c.name }));
  res.json(channels);
});

// GET emojis for a guild
app.get('/guilds/:guildId/emojis', async (req, res) => {
  const guild = client.guilds.cache.get(req.params.guildId);
  if (!guild) return res.status(404).json({ error: 'Guild not found' });
  const emojis = guild.emojis.cache.map(e => ({
    id: e.id,
    name: e.name,
    url: e.imageURL(),
    animated: e.animated,
    code: e.animated ? `<a:${e.name}:${e.id}>` : `<:${e.name}:${e.id}>`,
  }));
  res.json(emojis);
});

// POST send an embed to a channel
app.post('/send-embed', async (req, res) => {
  const { channelId, embed, components } = req.body;
  try {
    const channel = await client.channels.fetch(channelId);
    await channel.send({ embeds: [embed], components: components || [] });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

import db from '../db.js'

// GET all templates
app.get('/templates', (req, res) => {
  const templates = db.prepare(`
    SELECT id, name, description, created_at, updated_at
    FROM templates ORDER BY updated_at DESC
  `).all()
  res.json(templates)
})

// GET single template with full embed
app.get('/templates/:id', (req, res) => {
  const template = db.prepare('SELECT * FROM templates WHERE id = ?').get(req.params.id)
  if (!template) return res.status(404).json({ error: 'Not found' })
  res.json({ ...template, embed: JSON.parse(template.embed) })
})

// POST create template
app.post('/templates', (req, res) => {
  const { name, description, embed } = req.body
  if (!name || !embed) return res.status(400).json({ error: 'name and embed required' })
  const result = db.prepare(`
    INSERT INTO templates (name, description, embed) VALUES (?, ?, ?)
  `).run(name, description || '', JSON.stringify(embed))
  res.json({ id: result.lastInsertRowid, name, description })
})

// PUT update template
app.put('/templates/:id', (req, res) => {
  const { name, description, embed } = req.body
  const existing = db.prepare('SELECT id FROM templates WHERE id = ?').get(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Not found' })
  db.prepare(`
    UPDATE templates SET name = ?, description = ?, embed = ?, updated_at = unixepoch()
    WHERE id = ?
  `).run(name, description || '', JSON.stringify(embed), req.params.id)
  res.json({ success: true })
})

// DELETE template
app.delete('/templates/:id', (req, res) => {
  db.prepare('DELETE FROM templates WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

// GET all vault items
app.get('/vault', (req, res) => {
  const items = db.prepare(`
    SELECT * FROM vault ORDER BY category, created_at DESC
  `).all()
  res.json(items)
})

// POST add vault item
app.post('/vault', (req, res) => {
  const { url, label, category } = req.body
  if (!url) return res.status(400).json({ error: 'url required' })
  const result = db.prepare(`
    INSERT INTO vault (url, label, category) VALUES (?, ?, ?)
  `).run(url, label || '', category || 'Images')
  res.json({ id: result.lastInsertRowid, url, label, category })
})

// DELETE vault item
app.delete('/vault/:id', (req, res) => {
  db.prepare('DELETE FROM vault WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

// PATCH update label/category
app.patch('/vault/:id', (req, res) => {
  const { label, category } = req.body
  db.prepare(`
    UPDATE vault SET label = ?, category = ? WHERE id = ?
  `).run(label, category, req.params.id)
  res.json({ success: true })
})


export function startAPI() {
  const port = process.env.API_PORT || 3001;
  app.listen(port, () => console.log(`🌐 API running on port ${port}`));
}