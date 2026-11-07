import { useEffect, useRef, useState } from 'react'
import { useEmbedStore } from '../../store/embedStore'
import { getGuilds, getChannels, sendEmbed } from '../../api/index.js'

function Dropdown({ value, onChange, options, placeholder, disabled, icon }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const selected = options.find(o => o.value === value)

  return (
    <div className="relative flex-1" ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-left transition-colors"
        style={{
          background: 'var(--w-card)',
          border: open ? '1px solid var(--w-accent-line)' : '1px solid var(--w-line)',
          color: selected ? 'var(--w-ink)' : 'var(--w-ink-soft)',
          opacity: disabled ? 0.4 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        {icon && <span style={{ color: 'var(--w-ink-soft)', fontSize: 13 }}>{icon}</span>}
        <span className="flex-1 truncate">
          {selected ? selected.label : placeholder}
        </span>
        <svg className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          style={{ color: 'var(--w-ink-soft)' }}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute bottom-full left-0 right-0 mb-1 rounded-xl overflow-hidden z-50 max-h-56 overflow-y-auto"
          style={{ background: 'var(--w-card)', border: '1px solid var(--w-accent-line)', boxShadow: 'var(--w-shadow)' }}
        >
          {options.length === 0 ? (
            <div className="px-3 py-3 text-sm" style={{ color: 'var(--w-ink-faint)' }}>
              No options
            </div>
          ) : (
            options.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => { onChange(o.value); setOpen(false) }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-left transition-colors hover:bg-cream-200"
                style={{
                  color: o.value === value ? 'var(--w-accent-ink)' : 'var(--w-ink)',
                  background: o.value === value ? 'var(--w-accent-soft)' : 'transparent',
                }}
              >
                {o.icon && (
                  <img src={o.icon} alt="" className="w-5 h-5 rounded-full flex-shrink-0" />
                )}
                <span className="truncate">{o.label}</span>
                {o.value === value && (
                  <svg className="w-3.5 h-3.5 ml-auto flex-shrink-0" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor" strokeWidth={2.5} style={{ color: 'var(--w-accent-ink)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default function SendBar() {
  const {
    guilds, channels,
    selectedGuild, selectedChannel,
    setGuilds, setChannels,
    setSelectedGuild, setSelectedChannel,
    embed, isSending, sendStatus,
    setIsSending, setSendStatus, resetEmbed,
  } = useEmbedStore()

  useEffect(() => {
    getGuilds()
      .then((r) => setGuilds(r.data))
      .catch((err) => console.error('guilds error:', err))
  }, [])

  useEffect(() => {
    if (selectedGuild) getChannels(selectedGuild.id).then((r) => setChannels(r.data))
  }, [selectedGuild])

  const handleSend = async () => {
    if (!selectedChannel || isSending) return
    setIsSending(true)
    setSendStatus(null)
    try {
      await sendEmbed({ channelId: selectedChannel.id, embed })
      setSendStatus('success')
      setTimeout(() => setSendStatus(null), 3000)
    } catch {
      setSendStatus('error')
      setTimeout(() => setSendStatus(null), 3000)
    } finally {
      setIsSending(false)
    }
  }

  const guildOptions = guilds.map(g => ({
    value: g.id,
    label: g.name,
    icon: g.icon,
  }))

  const channelOptions = channels.map(c => ({
    value: c.id,
    label: `# ${c.name}`,
  }))

  return (
    <div
      className="flex-shrink-0 px-4 py-3 flex items-center gap-3"
      style={{ borderTop: '1px solid var(--w-line)', background: 'var(--w-batter)' }}
    >
      <Dropdown
        value={selectedGuild?.id || ''}
        onChange={(id) => setSelectedGuild(guilds.find(g => g.id === id) || null)}
        options={guildOptions}
        placeholder="Select server..."
        icon="⊞"
      />

      <Dropdown
        value={selectedChannel?.id || ''}
        onChange={(id) => setSelectedChannel(channels.find(c => c.id === id) || null)}
        options={channelOptions}
        placeholder="Select channel..."
        disabled={!selectedGuild}
        icon="#"
      />

      {/* Reset */}
      <button
        onClick={resetEmbed}
        title="Reset embed"
        className="w-10 h-10 flex items-center justify-center rounded-xl transition-colors flex-shrink-0"
        style={{ background: 'var(--w-card)', border: '1px solid var(--w-line)', color: 'var(--w-ink-soft)' }}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
      </button>

      {/* Send */}
      <button
        onClick={handleSend}
        disabled={!selectedChannel || isSending}
        className={`w-btn px-5 h-10 text-sm flex-shrink-0 ${sendStatus === 'error' ? 'w-btn-danger' : ''}`}
      >
        {isSending ? (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : sendStatus === 'success' ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.269 20.876L5.999 12zm0 0h7.5" />
          </svg>
        )}
        {isSending ? 'Sending...' : sendStatus === 'success' ? 'Sent! 🧇' : sendStatus === 'error' ? 'Oops, try again' : 'Send'}
      </button>
    </div>
  )
}
