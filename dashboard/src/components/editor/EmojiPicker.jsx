import { useState, useEffect, useRef } from 'react'
import { useEmbedStore } from '../../store/embedStore'
import { getEmojis } from '../../api/index.js'

export default function EmojiPicker({ onInsert }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [emojis, setEmojis] = useState([])
  const [hovered, setHovered] = useState(null)
  const [loading, setLoading] = useState(false)
  const { selectedGuild } = useEmbedStore()
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    if (!open || !selectedGuild) return
    setLoading(true)
    getEmojis(selectedGuild.id)
      .then((r) => setEmojis(r.data))
      .catch(() => setEmojis([]))
      .finally(() => setLoading(false))
  }, [open, selectedGuild])

  const filtered = emojis.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase())
  )

  const recent = emojis.slice(0, 8)

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        title={selectedGuild ? 'Server emojis' : 'Select a server first'}
        className={`
          flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors
          ${open
            ? 'bg-honey-500/25 border-caramel-600 text-toast-700'
            : 'bg-cream-50 border-cream-300 text-cocoa-600 hover:text-cocoa-900 hover:border-caramel-600'
          }
          ${!selectedGuild ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        disabled={!selectedGuild}
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Emojis
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-2 w-72 bg-cream-50 border border-cream-300 rounded-xl overflow-hidden z-50 shadow-xl">

          {/* Search */}
          <div className="p-2 border-b border-cream-300">
            <input
              type="text"
              placeholder="Search emojis..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              className="w-full bg-cream-50 border border-cream-300 rounded-lg px-3 py-1.5
                text-sm text-cocoa-900 placeholder-cocoa-400
                focus:outline-none focus:border-toast-700 transition-colors"
            />
          </div>

          {/* Grid */}
          <div className="p-2 max-h-48 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-6 text-cocoa-500 text-sm">
                Loading...
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex items-center justify-center py-6 text-cocoa-500 text-sm">
                No emojis found
              </div>
            ) : (
              <>
                {!search && recent.length > 0 && (
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-cocoa-500 px-1 mb-1">
                    Server emojis
                  </p>
                )}
                <div className="grid grid-cols-8 gap-0.5">
                  {filtered.map((emoji) => (
                    <button
                      key={emoji.id}
                      type="button"
                      title={`:${emoji.name}:`}
                      onMouseEnter={() => setHovered(emoji)}
                      onMouseLeave={() => setHovered(null)}
                      onClick={() => {
                        onInsert(emoji.code)
                        setOpen(false)
                        setSearch('')
                      }}
                      className="relative w-8 h-8 rounded-md flex items-center justify-center hover:bg-cream-200 transition-colors"
                    >
                      <img
                        src={emoji.url}
                        alt={emoji.name}
                        className="w-6 h-6 object-contain"
                      />
                      {emoji.animated && (
                        <span className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 bg-honey-500 rounded-full" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Footer preview */}
          <div className="px-3 py-2 border-t border-cream-300 bg-cream-200 flex items-center gap-2 min-h-[36px]">
            {hovered ? (
              <>
                <img src={hovered.url} alt={hovered.name} className="w-5 h-5 object-contain" />
                <span className="text-xs text-cocoa-700 font-mono">:{hovered.name}:</span>
                {hovered.animated && (
                  <span className="text-[10px] text-toast-700 border border-caramel-600 rounded px-1">GIF</span>
                )}
              </>
            ) : (
              <span className="text-xs text-cocoa-500">Hover to preview</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
