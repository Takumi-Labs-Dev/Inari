// Shared "not ready yet" screen for pages that are still in the oven.
export default function ComingSoon({ title, message = 'Check back soon!' }) {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="w-card flex flex-col items-center gap-3 px-10 py-8 text-center" style={{ maxWidth: 360 }}>
        <img
          src="/assets/waffle/mascot/waffle-face-busy.png"
          alt=""
          width={96}
          height={96}
          className="pixelated"
        />
        <h2 className="font-pixel text-2xl" style={{ color: 'var(--w-ink)' }}>{title}</h2>
        <p className="font-pixel text-sm" style={{ color: 'var(--w-accent-ink)' }}>Still in the oven</p>
        <p className="text-sm" style={{ color: 'var(--w-ink-soft)' }}>{message}</p>
      </div>
    </div>
  )
}
