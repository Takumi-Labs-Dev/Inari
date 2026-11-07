import { NavLink } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { getMe, logout } from '../../api/index.js'

const ICONS = '/assets/waffle/ui'

const links = [
  { to: '/', label: 'Home', icon: 'icon-home.png' },
  { to: '/builder', label: 'Builder', icon: 'icon-builder.png' },
  { to: '/templates', label: 'Templates', icon: 'icon-templates.png' },
  { to: '/color', label: 'Color', icon: 'icon-color.png' },
  { to: '/vault', label: 'Vault', icon: 'icon-vault.png' },
  { to: '/history', label: 'History', icon: 'icon-history.png' },
  { to: '/settings', label: 'Settings', icon: 'icon-settings.png' },
]

export default function Sidebar() {
  const [user, setUser] = useState(null)
  const [showLogout, setShowLogout] = useState(false)
  const userMenuRef = useRef(null)

  useEffect(() => {
    getMe().then(res => setUser(res.data)).catch(() => {})
  }, [])

  // Close the sign-out popup when clicking elsewhere or pressing Escape
  useEffect(() => {
    if (!showLogout) return
    const onClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowLogout(false)
    }
    const onKey = (e) => { if (e.key === 'Escape') setShowLogout(false) }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [showLogout])

  async function handleLogout() {
    await logout()
    window.location.reload()
  }

  const avatarUrl = user?.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=64`
    : null

  return (
    <aside
      className="w-[76px] flex flex-col items-center py-3 gap-1 flex-shrink-0"
      style={{ background: 'var(--w-batter)', borderRight: '2px solid var(--w-line-strong)' }}
    >
      {/* Logo */}
      <img
        src="/assets/waffle/brand/waffle-logo-96.png"
        alt="Waffle"
        width={40}
        height={40}
        className="pixelated mb-3 flex-shrink-0"
      />

      {/* Nav links */}
      <nav className="flex flex-col items-center gap-1" aria-label="Main">
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className="w-[60px] py-1.5 rounded-xl flex flex-col items-center gap-0.5 transition-colors duration-150"
            style={({ isActive }) => ({
              background: isActive ? 'var(--w-accent-soft)' : 'transparent',
              border: `2px solid ${isActive ? 'var(--w-accent-line)' : 'transparent'}`,
              boxShadow: isActive ? '0 2px 0 var(--w-accent-line)' : 'none',
              color: isActive ? 'var(--w-ink)' : 'var(--w-ink-soft)',
            })}
          >
            <img
              src={`${ICONS}/${icon}`}
              alt=""
              width={32}
              height={32}
              className="pixelated"
            />
            <span className="font-pixel text-[11px] leading-none">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* User avatar + sign out */}
      {user && (
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowLogout(v => !v)}
            className="w-10 h-10 rounded-xl overflow-hidden focus:outline-none"
            style={{ border: '2px solid var(--w-accent-line)', background: 'var(--w-accent-soft)' }}
            title={user.username}
            aria-haspopup="menu"
            aria-expanded={showLogout}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={user.username}
                className="w-full h-full object-cover"
                onError={e => { e.target.style.display = 'none' }}
              />
            ) : (
              <span
                className="w-full h-full flex items-center justify-center font-pixel text-sm"
                style={{ color: 'var(--w-accent-ink)' }}
              >
                {user.username?.[0]?.toUpperCase()}
              </span>
            )}
          </button>

          {/* Sign-out popup */}
          {showLogout && (
            <div
              role="menu"
              className="absolute bottom-12 left-0 rounded-xl overflow-hidden z-50"
              style={{
                background: 'var(--w-card)',
                border: '2px solid var(--w-line-strong)',
                boxShadow: 'var(--w-shadow)',
                minWidth: 168,
              }}
            >
              <div className="px-3 py-2.5 border-b" style={{ borderColor: 'var(--w-line)' }}>
                <p className="text-xs font-bold truncate" style={{ color: 'var(--w-ink)' }}>{user.username}</p>
                <p className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--w-ink-faint)' }}>
                  Signed in with Discord
                </p>
              </div>

              <button
                role="menuitem"
                onClick={handleLogout}
                className="w-full px-3 py-2.5 text-left text-sm flex items-center gap-2 transition-colors hover:bg-cream-200/60"
                style={{ color: 'var(--w-berry)' }}
              >
                <img
                  src={`${ICONS}/icon-signout.png`}
                  alt=""
                  width={20}
                  height={20}
                  className="pixelated"
                />
                <span className="font-pixel">Sign out</span>
              </button>
            </div>
          )}
        </div>
      )}
    </aside>
  )
}
