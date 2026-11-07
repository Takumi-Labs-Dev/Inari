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
  name: 'waffle.sid',
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

// Small shared look for the two sign-in result pages (cream + brown, cozy).
// Inline styles only, so the pages work even when the dashboard is not built.
const pageStyles = `
  body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
    background:#fff6e0;color:#4a2814;font-family:Nunito,system-ui,-apple-system,'Segoe UI',sans-serif}
  .card{max-width:340px;margin:16px;padding:28px 32px;text-align:center;background:#fffbef;
    border:2px solid #8a4b22;border-radius:16px;box-shadow:0 4px 0 rgba(138,75,34,.25)}
  img{width:96px;height:96px;image-rendering:pixelated}
  h2{margin:8px 0 6px;font-size:22px}
  p{margin:0;font-size:15px;line-height:1.45;color:#6b3f20}
`

const faceImg = (name) =>
  `<img src="/assets/waffle/mascot/${name}.png" alt="" onerror="this.style.display='none'">`

// GET /auth/callback
router.get('/callback',
  passport.authenticate('discord', { failureRedirect: '/auth/failed' }),
  (req, res) => {
    // Only tell the windows we trust (ALLOWED_ORIGINS) that login worked.
    const origins = JSON.stringify(config.allowedOrigins).replace(/</g, '\\u003c')
    res.send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Signed in | Waffle</title>
    <style>${pageStyles}</style>
  </head>
  <body>
    <div class="card">
      ${faceImg('waffle-face-happy')}
      <h2>You're signed in!</h2>
      <p>Taking you back to Waffle. You can close this window if it stays open.</p>
    </div>
    <script>
      const origins = ${origins}
      if (window.opener) {
        for (const origin of origins) {
          window.opener.postMessage('waffle-auth-success', origin)
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
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Can't sign in | Waffle</title>
    <style>${pageStyles}</style>
  </head>
  <body>
    <div class="card">
      ${faceImg('waffle-face-oops')}
      <h2>Oops, the door is locked</h2>
      <p>Waffle could not find you in the Discord server it is set up for. Join that server, then try signing in again.</p>
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
