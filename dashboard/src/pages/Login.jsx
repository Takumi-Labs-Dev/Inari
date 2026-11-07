import { useEffect, useRef, useState } from 'react'
import { API_URL as API } from '../api/base.js'

export default function Login() {
  const [status, setStatus] = useState('idle') // idle | waiting | blocked
  const timerRef = useRef(null)

  // Never leave the polling timer running if this screen goes away
  useEffect(() => () => clearInterval(timerRef.current), [])

  function handleLogin() {
    clearInterval(timerRef.current)

    const popup = window.open(
      `${API}/auth/login`,
      'discord-auth',
      'width=500,height=700,centerscreen=yes'
    )

    // The browser refused to open the sign-in window (pop-up blocker)
    if (!popup) {
      setStatus('blocked')
      return
    }

    setStatus('waiting')

    // Poll /auth/me every second until signed in or the popup closes
    timerRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${API}/auth/me`, { credentials: 'include' })
        if (res.ok) {
          clearInterval(timerRef.current)
          window.location.reload()
          return
        }
      } catch { /* server not reachable yet, keep trying */ }

      if (popup.closed) {
        clearInterval(timerRef.current)
        setStatus('idle')
      }
    }, 1000)
  }

  return (
    <div
      className="w-tile flex flex-col items-center justify-center min-h-screen px-4"
      style={{
        backgroundColor: 'var(--w-bg)',
        backgroundImage: 'url(/assets/waffle/ui/tile.png)',
      }}
    >
      <div
        className="w-card flex flex-col items-center gap-5 px-10 py-9 w-full"
        style={{ maxWidth: 380, border: '2px solid var(--w-line-strong)' }}
      >
        <img
          src="/assets/waffle/mascot/waffle-face-happy.png"
          alt=""
          width={128}
          height={128}
          className="pixelated"
        />

        <div className="text-center">
          <h1 className="font-pixel text-3xl" style={{ color: 'var(--w-ink)' }}>Waffle</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--w-ink-soft)' }}>
            Sign in to start building embeds
          </p>
        </div>

        <button
          onClick={handleLogin}
          disabled={status === 'waiting'}
          className="w-btn w-full py-2.5 text-base"
        >
          {status === 'waiting' ? 'Waiting for Discord...' : 'Sign in with Discord'}
        </button>

        {status === 'blocked' && (
          <p className="text-sm text-center" role="alert" style={{ color: 'var(--w-berry)' }}>
            Your browser blocked the sign-in window. Allow pop-ups for this page and try again.
          </p>
        )}

        <p className="text-xs text-center" style={{ color: 'var(--w-ink-faint)' }}>
          Waffle works in servers where you have the Manage Server permission.
        </p>
      </div>
    </div>
  )
}
