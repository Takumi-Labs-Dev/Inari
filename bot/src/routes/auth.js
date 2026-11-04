import express from 'express'
import passport from 'passport'
import { Strategy as DiscordStrategy } from 'passport-discord'
import session from 'express-session'
import { config } from '../env.js'

const router = express.Router()

passport.use(new DiscordStrategy({
  clientID: config.clientId,
  clientSecret: config.clientSecret,
  callbackURL: config.redirectUri,
  scope: ['identify', 'guilds'],
  state: true, // protects the login against forged callbacks (needs sessions)
}, (accessToken, refreshToken, profile, done) => {
  const inGuild = profile.guilds?.some((g) => g.id === config.guildId)
  if (!inGuild) return done(null, false, { message: 'Not in guild' })
  // Keep only what the dashboard needs. No tokens, no server list.
  return done(null, {
    id: profile.id,
    username: profile.username,
    avatar: profile.avatar,
    discriminator: profile.discriminator,
  })
}))

passport.serializeUser((user, done) => done(null, user))
passport.deserializeUser((user, done) => done(null, user))

export const sessionMiddleware = session({
  name: 'inari.sid',
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: config.cookieSecure,
    sameSite: 'lax',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
})

// GET /auth/login
router.get('/login', passport.authenticate('discord'))

// GET /auth/callback
router.get('/callback',
  passport.authenticate('discord', { failureRedirect: '/auth/failed' }),
  (req, res) => {
    // Only tell the windows we trust (ALLOWED_ORIGINS) that login worked.
    const origins = JSON.stringify(config.allowedOrigins).replace(/</g, '\\u003c')
    res.send(`<!doctype html>
<html>
  <body style="background:#0a0a0b;color:#10b981;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0">
    <div style="text-align:center">
      <h2>&#10003; Login successful</h2>
      <p style="color:#808088">Redirecting...</p>
    </div>
    <script>
      const origins = ${origins}
      if (window.opener) {
        for (const origin of origins) {
          window.opener.postMessage('inari-auth-success', origin)
        }
        setTimeout(() => window.close(), 500)
      } else {
        window.location.href = '/'
      }
    </script>
  </body>
</html>`)
  }
)

// GET /auth/failed
router.get('/failed', (req, res) => {
  res.status(403).send(`<!doctype html>
<html>
  <body style="background:#0a0a0b;color:#ef4444;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0">
    <div style="text-align:center">
      <h2>&#10007; Access Denied</h2>
      <p style="color:#808088">You are not a member of the required server.</p>
    </div>
  </body>
</html>`)
})

// GET /auth/logout
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: 'Logout failed' })
    res.json({ success: true })
  })
})

// GET /auth/me
router.get('/me', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      id: req.user.id,
      username: req.user.username,
      avatar: req.user.avatar,
      discriminator: req.user.discriminator,
    })
  } else {
    res.status(401).json({ error: 'Not authenticated' })
  }
})

export default router