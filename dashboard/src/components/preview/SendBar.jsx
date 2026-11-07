import { useEffect } from 'react'
import { useEmbedStore } from '../../store/embedStore'
import { getChannels, sendEmbed } from '../../api/index.js'
import Dropdown from '../ui/Dropdown'

export default function SendBar() {
  const {
    channels,
    selectedGuild, selectedChannel,
    setChannels,
    setSelectedChannel,
    embed, isSending, sendStatus,
    setIsSending, setSendStatus, resetEmbed,
  } = useEmbedStore()

  // The server itself is chosen in the bar at the top of the page.
  useEffect(() => {
    if (!selectedGuild) { setChannels([]); return }
    let current = true
    getChannels(selectedGuild.id)
      .then((r) => { if (current) setChannels(r.data) })
      .catch(() => { if (current) setChannels([]) })
    return () => { current = false }
  }, [selectedGuild])

  const handleSend = async () => {
    if (!selectedGuild || !selectedChannel || isSending) return
    setIsSending(true)
    setSendStatus(null)
    try {
      await sendEmbed(selectedGuild.id, { channelId: selectedChannel.id, embed })
      setSendStatus('success')
      setTimeout(() => setSendStatus(null), 3000)
    } catch {
      setSendStatus('error')
      setTimeout(() => setSendStatus(null), 3000)
    } finally {
      setIsSending(false)
    }
  }

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
        value={selectedChannel?.id || ''}
        onChange={(id) => setSelectedChannel(channels.find(c => c.id === id) || null)}
        options={channelOptions}
        placeholder={selectedGuild ? 'Select channel...' : 'Pick a server at the top first'}
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
