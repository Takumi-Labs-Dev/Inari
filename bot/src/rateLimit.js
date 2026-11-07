// A small in-memory rate limiter (no extra package needed).
// Counts requests per key in a fixed time window and answers 429 when a key
// goes over. Counts reset when the bot restarts, which is fine for abuse
// protection on a single server.

const limiters = new Set()

setInterval(() => {
  const now = Date.now()
  for (const hits of limiters) {
    for (const [key, entry] of hits) {
      if (entry.resetAt <= now) hits.delete(key)
    }
  }
}, 60_000).unref()

export function rateLimit({ windowMs, max, message, key = (req) => req.ip }) {
  const hits = new Map()
  limiters.add(hits)

  return (req, res, next) => {
    const id = key(req) ?? req.ip
    const now = Date.now()
    let entry = hits.get(id)
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs }
      hits.set(id, entry)
    }
    entry.count += 1

    if (entry.count > max) {
      res.set('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)))
      return res.status(429).json({ error: message || 'Too many requests. Please slow down.' })
    }
    next()
  }
}

// Handy key: the signed-in person, or their address if not signed in.
export const byUser = (req) => (req.user?.id ? `u:${req.user.id}` : `ip:${req.ip}`)
