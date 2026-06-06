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
        style={{ background: '#0a0a0b' }}
      >
        <div className="flex flex-col items-center gap-3">
          <span className="text-3xl text-emerald-400">稲</span>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Checking session...
          </p>
        </div>
      </div>
    )
  }

  if (state === 'unauth') return <Login />

  return children
}