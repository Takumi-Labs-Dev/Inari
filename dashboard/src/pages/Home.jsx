import { Link } from 'react-router-dom'
import InviteButton from '../components/InviteButton'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3003'

const features = [
  { label: 'Live preview', desc: 'See your embed the way Discord shows it', emoji: 'waffle-emoji-strawberry.png' },
  { label: 'All the fields', desc: 'Title, fields, footer, images and more', emoji: 'waffle-emoji-syrup.png' },
  { label: 'One-click send', desc: 'Pick a channel and send it right away', emoji: 'waffle-emoji-wave.png' },
]

export default function Home() {
  return (
    <div
      className="relative flex-1 min-h-0 overflow-y-auto"
      style={{
        backgroundColor: 'var(--w-bg)',
        backgroundImage: 'url(/assets/waffle/backgrounds/home-wallpaper.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Soft butter wash so text stays easy to read on top of the wallpaper */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, rgba(255,246,224,0.55), rgba(255,246,224,0.82))' }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-full gap-8 px-4 py-10">
        {/* Header */}
        <div className="text-center">
          <img
            src="/assets/waffle/brand/waffle-mascot.png"
            alt=""
            width={128}
            height={128}
            className="pixelated mx-auto mb-3"
          />
          <h1 className="font-pixel text-4xl" style={{ color: 'var(--w-ink)' }}>Waffle</h1>
          <p className="mt-2 text-base font-semibold" style={{ color: 'var(--w-ink-soft)' }}>
            A cozy Discord embed builder
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/builder" className="w-btn px-6 py-2.5 text-base">
            Open builder
          </Link>
          <InviteButton quiet className="px-6 py-2.5 text-base">Add to a server</InviteButton>
          <a
            href={`${API}/api/health`}
            target="_blank"
            rel="noreferrer"
            className="w-btn w-btn-quiet px-6 py-2.5 text-base"
          >
            API status
          </a>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-xl">
          {features.map((f) => (
            <div key={f.label} className="w-card p-4 text-center">
              <img
                src={`/assets/waffle/emoji/${f.emoji}`}
                alt=""
                width={32}
                height={32}
                className="pixelated mx-auto mb-2"
              />
              <p className="font-pixel text-base" style={{ color: 'var(--w-accent-ink)' }}>{f.label}</p>
              <p className="text-xs mt-1 leading-snug" style={{ color: 'var(--w-ink-soft)' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
