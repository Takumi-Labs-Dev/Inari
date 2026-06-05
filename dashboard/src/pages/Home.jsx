import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen gap-10 relative px-4"
      style={{
        backgroundImage: 'url(/assets/HomeWallpaper.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(to bottom, rgba(5,10,8,0.5), rgba(5,10,8,0.7))',
        }}
      />

      {/* Header */}
      <div className="relative z-10 text-center">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md"
          style={{
            background: 'rgba(16,185,129,0.12)',
            border: '1px solid rgba(16,185,129,0.25)',
            boxShadow: '0 0 20px rgba(16,185,129,0.15)',
          }}
        >
          <span className="text-3xl text-emerald-400">稲</span>
        </div>

        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Inari
        </h1>

        <p className="mt-2 text-sm text-white/40">
          Discord embed builder
        </p>
      </div>

      {/* Actions */}
      <div className="relative z-10 flex gap-4">
        <Link
          to="/builder"
          className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: '#fff',
            boxShadow: '0 0 20px rgba(16,185,129,0.25)',
          }}
        >
          Open builder
        </Link>

        <a
          href="http://localhost:3003/guilds"
          target="_blank"
          rel="noreferrer"
          className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(10px)',
          }}
        >
          API status
        </a>
      </div>

      {/* Features */}
      <div className="relative z-10 grid grid-cols-3 gap-4 w-full max-w-md">
        {[
          { label: 'Live preview', desc: 'Accurate Discord rendering' },
          { label: 'All fields', desc: 'Title, fields, footer, images' },
          { label: 'One-click send', desc: 'Direct to any channel' },
        ].map((f) => (
          <div
            key={f.label}
            className="rounded-xl p-4 transition-all hover:scale-[1.03]"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(16,185,129,0.12)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <p className="text-xs font-semibold text-emerald-400">
              {f.label}
            </p>

            <p className="text-[11px] mt-1 leading-snug text-white/40">
              {f.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}