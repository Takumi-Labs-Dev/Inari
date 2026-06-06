import express from 'express'
import passport from 'passport'
import { Strategy as DiscordStrategy } from 'passport-discord'
import session from 'express-session'

const router = express.Router()

const GUILD_ID = process.env.DISCORD_GUILD_ID
const CLIENT_ID = process.env.DISCORD_CLIENT_ID
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET
const REDIRECT_URI = process.env.REDIRECT_URI
const SESSION_SECRET = process.env.SESSION_SECRET

// Passport setup
passport.use(new DiscordStrategy({
  clientID: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  callbackURL: REDIRECT_URI,
  scope: ['identify', 'guilds'],
}, (accessToken, refreshToken, profile, done) => {
  const inGuild = profile.guilds?.some(g => g.id === GUILD_ID)
  if (!inGuild) return done(null, false, { message: 'Not in guild' })
  return done(null, profile)
}))

passport.serializeUser((user, done) => done(null, user))
passport.deserializeUser((user, done) => done(null, user))

export const sessionMiddleware = session({
  secret: SESSION_SECRET || 'inari-dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    sameSite: 'lax',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000
  }
})

// GET /auth/login
router.get('/login', passport.authenticate('discord'))

// GET /auth/callback
router.get('/callback',
  passport.authenticate('discord', { failureRedirect: '/auth/failed' }),
  (req, res) => {
    res.send(`
      <html>
        <body style="background:#0a0a0b;color:#10b981;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0">
          <div style="text-align:center">
            <h2>✓ Login successful</h2>
            <p style="color:#808088">Redirecting...</p>
          </div>
        </body>
        <script>
          if (window.opener) {
            window.opener.postMessage('inari-auth-success', '*')
            setTimeout(() => window.close(), 500)
          } else {
            window.location.href = 'http://localhost'
          }
        </script>
      </html>
    `)
  }
)

// GET /auth/failed
router.get('/failed', (req, res) => {
  res.send(`
    <html>
      <body style="background:#0a0a0b;color:#ef4444;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0">
        <div style="text-align:center">
          <h2>✗ Access Denied</h2>
          <p style="color:#808088">You are not a member of the required server.</p>
        </div>
      </body>
    </html>
  `)
})

// GET /auth/logout
router.get('/logout', (req, res) => {
  req.logout(() => {
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