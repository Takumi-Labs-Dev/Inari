import { useEmbedStore } from '../store/embedStore'
import InviteButton from './InviteButton'

// Shown on pages that save things per server until a server is picked.
export default function NeedServer({ title }) {
  const { guilds, guildsStatus, guildsError } = useEmbedStore()
  const hasServers = guilds.some((g) => g.botPresent)

  let message = 'Pick a server in the bar at the top to see its saved items.'
  if (guildsStatus === 'loading') message = 'Looking for your servers...'
  else if (guildsStatus === 'error') message = guildsError
  else if (!hasServers) message = 'Waffle is not in any server you manage yet. Add it to one and it will show up here.'

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="w-card flex flex-col items-center gap-3 px-10 py-8 text-center" style={{ maxWidth: 400 }}>
        <img
          src="/assets/waffle/mascot/waffle-face-sleepy.png"
          alt=""
          width={96}
          height={96}
          className="pixelated"
        />
        <h2 className="font-pixel text-2xl" style={{ color: 'var(--w-ink)' }}>{title}</h2>
        <p className="text-sm" style={{ color: 'var(--w-ink-soft)' }}>{message}</p>
        {guildsStatus === 'ready' && !hasServers && <InviteButton className="px-5 py-2 text-sm mt-1" />}
      </div>
    </div>
  )
}
