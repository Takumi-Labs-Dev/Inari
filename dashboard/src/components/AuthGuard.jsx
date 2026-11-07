import { useEffect, useState } from 'react'
import { getMe } from '../api/index.js'
import Login from '../pages/Login.jsx'

export default function AuthGuard({ children }) {
  const [state, setState] = useState('loading') // loading | auth | unauth

  useEffect(() => {
    getMe()
      .then(() => setState('auth'))
      .catch(() => setState('unauth'))
  }, [])

  if (state === 'loading') {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ background: 'var(--w-bg)' }}
        role="status"
        aria-live="polite"
      >
        <div className="flex flex-col items-center gap-3">
          <img
            src="/assets/waffle/mascot/waffle-face-sleepy.png"
            alt=""
            width={96}
            height={96}
            className="pixelated animate-pulse"
          />
          <p className="font-pixel text-base" style={{ color: 'var(--w-ink-soft)' }}>
            Waking Waffle up...
          </p>
        </div>
      </div>
    )
  }

  if (state === 'unauth') return <Login />

  return children
}
