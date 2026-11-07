import { useCallback, useEffect } from 'react'
import { useEmbedStore } from '../../store/embedStore'
import { getGuilds, errorMessage } from '../../api/index.js'
import Dropdown from '../ui/Dropdown'
import InviteButton from '../InviteButton'

const REMEMBER_KEY = 'waffle.server'

// Remembering the last server is a nicety only, so storage errors are ignored.
const remembered = () => { try { return localStorage.getItem(REMEMBER_KEY) } catch { return null } }
const remember = (id) => { try { localStorage.setItem(REMEMBER_KEY, id) } catch { /* ignore */ } }

// Thin bar at the top of every page: which server am I working in?
export default function ServerBar() {
  const {
    guilds, guildsStatus, selectedGuild,
    setGuilds, setGuildsError, setSelectedGuild,
  } = useEmbedStore()

  const load = useCallback(() => {
    getGuilds()
      .then((r) => {
        const list = r.data
        setGuilds(list)
        const usable = list.filter((g) => g.botPresent)
        const current = useEmbedStore.getState().selectedGuild
        if (current && usable.some((g) => g.id === current.id)) return
        const next = usable.find((g) => g.id === remembered()) || usable[0] || null
        setSelectedGuild(next)
      })
      .catch((err) => setGuildsError(errorMessage(err, 'Could not load your servers.')))
  }, [setGuilds, setGuildsError, setSelectedGuild])

  useEffect(() => { load() }, [load])

  // Coming back from adding Waffle to a server: refresh the list automatically
  useEffect(() => {
    window.addEventListener('focus', load)
    return () => window.removeEventListener('focus', load)
  }, [load])

  const options = guilds
    .filter((g) => g.botPresent)
    .map((g) => ({ value: g.id, label: g.name, icon: g.icon }))

  const pending = guilds.filter((g) => !g.botPresent).length

  return (
    <div
      className="flex items-center gap-3 px-4 py-2 flex-shrink-0"
      style={{ background: 'var(--w-batter)', borderBottom: '2px solid var(--w-line-strong)' }}
    >
      <span className="font-pixel text-sm flex-shrink-0" style={{ color: 'var(--w-ink-soft)' }}>Server</span>

      <div className="flex-1 max-w-xs">
        <Dropdown
          direction="down"
          value={selectedGuild?.id || ''}
          onChange={(id) => {
            const next = guilds.find((g) => g.id === id) || null
            setSelectedGuild(next)
            if (next) remember(next.id)
          }}
          options={options}
          placeholder={guildsStatus === 'loading' ? 'Loading servers...' : 'Pick a server...'}
          emptyText="Waffle is not in a server you manage yet"
          icon="⊞"
        />
      </div>

      {guildsStatus === 'error' && (
        <span className="text-xs" role="alert" style={{ color: 'var(--w-berry)' }}>
          Could not load your servers. Reload the page to try again.
        </span>
      )}

      <div className="flex-1" />

      {pending > 0 && (
        <span className="text-xs hidden md:inline" style={{ color: 'var(--w-ink-soft)' }}>
          {pending} more server{pending === 1 ? '' : 's'} you manage without Waffle
        </span>
      )}
      <InviteButton quiet className="px-3 py-1.5 text-sm flex-shrink-0" />
    </div>
  )
}
