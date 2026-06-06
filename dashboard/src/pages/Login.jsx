import { useEffect, useState } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3003'

export default function Login() {
  const [status, setStatus] = useState('idle') // idle | waiting | error

  function handleLogin() {
    setStatus('waiting')

    const popup = window.open(
      `${API}/auth/login`,
      'discord-auth',
      'width=500,height=700,centerscreen=yes'
    )

    // Poll /auth/me every second until authenticated or popup closes
    const timer = setInterval(async () => {
      try {
        const res = await fetch(`${API}/auth/me`, { credentials: 'include' })
        if (res.ok) {
          clearInterval(timer)
          window.location.reload()
          return
        }
      } catch (_) {}

      if (popup?.closed) {
        clearInterval(timer)
        setStatus('idle')
      }
    }, 1000)
  }

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen"
      style={{ background: '#0a0a0b' }}
    >
      <div
        className="flex flex-col items-center gap-6 p-10 rounded-2xl"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(16,185,129,0.15)',
          boxShadow: '0 0 40px rgba(16,185,129,0.05)',
          minWidth: 340,
        }}
      >
        {/* Icon */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{
            background: 'rgba(16,185,129,0.12)',
            border: '1px solid rgba(16,185,129,0.25)',
            boxShadow: '0 0 20px rgba(16,185,129,0.15)',
          }}
        >
          <span className="text-3xl text-emerald-400">稲</span>
        </div>

        {/* Title */}
        <div className="text-center">
          <h1 className="text-xl font-semibold text-white">稲 ¦ Inari</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Sign in to continue
          </p>
        </div>

        {/* Button */}
        <button
          onClick={handleLogin}
          disabled={status === 'waiting'}
          className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          style={{
            background: status === 'waiting'
              ? 'rgba(16,185,129,0.3)'
              : 'linear-gradient(135deg, #10b981, #059669)',
            color: '#fff',
            boxShadow: '0 0 20px rgba(16,185,129,0.2)',
          }}
        >
          {status === 'waiting' ? 'Waiting for Discord...' : 'Login with Discord'}
        </button>

        {/* Note */}
        <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.2)' }}>
          Access restricted to authorized members only
        </p>
      </div>
    </div>
  )
}