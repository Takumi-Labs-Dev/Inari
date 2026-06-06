import { NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getMe, logout } from '../../api/index.js'

const links = [
  {
    to: '/', label: 'Home', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.5 1.5 0 012.092 0L22.25 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" />
      </svg>
    )
  },
  {
    to: '/builder', label: 'Builder', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
      </svg>
    )
  },
  {
    to: '/templates', label: 'Templates', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    )
  },
  {
    to: '/color', label: 'Color', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88" />
      </svg>
    )
  },
  {
    to: '/vault', label: 'Vault', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    )
  },
  {
    to: '/history', label: 'History', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    to: '/settings', label: 'Settings', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [showLogout, setShowLogout] = useState(false)

  useEffect(() => {
    getMe().then(res => setUser(res.data)).catch(() => {})
  }, [])

  async function handleLogout() {
    await logout()
    window.location.reload()
  }

  const avatarUrl = user
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=64`
    : null

  return (
    <aside
      className="w-[68px] flex flex-col items-center py-3 gap-1 flex-shrink-0"
      style={{ background: '#0d1412', borderRight: '1px solid rgba(16,185,129,0.08)' }}
    >
      {/* Logo */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 flex-shrink-0 text-base font-bold"
        style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.25)' }}
      >
        稲
      </div>

      {/* Nav links */}
      {links.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          title={label}
          end={to === '/'}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 group relative"
          style={({ isActive }) => isActive
            ? { background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' }
            : { color: 'rgba(255,255,255,0.25)', border: '1px solid transparent' }
          }
        >
          {({ isActive }) => (
            <span
              style={{ color: isActive ? '#34d399' : 'rgba(255,255,255,0.3)' }}
              className="group-hover:!text-white transition-colors"
            >
              {icon}
            </span>
          )}
        </NavLink>
      ))}

      {/* Spacer */}
      <div className="flex-1" />

      {/* User avatar + logout */}
      {user && (
        <div className="relative">
          <button
            onClick={() => setShowLogout(v => !v)}
            className="w-10 h-10 rounded-xl overflow-hidden transition-all hover:ring-2 focus:outline-none"
            style={{ border: '1px solid rgba(16,185,129,0.2)', ringColor: '#34d399' }}
            title={user.username}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={user.username}
                className="w-full h-full object-cover"
                onError={e => { e.target.style.display = 'none' }}
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-xs font-bold"
                style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399' }}
              >
                {user.username?.[0]?.toUpperCase()}
              </div>
            )}
          </button>

          {/* Logout popup */}
          {showLogout && (
            <div
              className="absolute bottom-12 left-0 rounded-xl overflow-hidden z-50"
              style={{
                background: '#111114',
                border: '1px solid rgba(16,185,129,0.15)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                minWidth: 160,
              }}
            >
              {/* User info */}
              <div
                className="px-3 py-2.5 border-b"
                style={{ borderColor: 'rgba(255,255,255,0.06)' }}
              >
                <p className="text-xs font-semibold text-white truncate">{user.username}</p>
                <p className="text-[11px] mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Discord
                </p>
              </div>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="w-full px-3 py-2.5 text-left text-xs flex items-center gap-2 transition-colors hover:bg-red-500/10"
                style={{ color: '#f87171' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
                Sign out
              </button>
            </div>
          )}
        </div>
      )}
    </aside>
  )
}