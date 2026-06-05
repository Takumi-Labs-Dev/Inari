import { useState } from 'react'
import { useEmbedStore } from '../store/embedStore'
import { useNavigate } from 'react-router-dom'

const PALETTES = [
  {
    bot: '雷 ¦ Raijin',
    role: 'Moderation',
    key: 'raijin',
    colors: [
      { name: 'Ember',      hex: '#ff6b6b' },
      { name: 'Crimson',    hex: '#e63946' },
      { name: 'Scarlet',    hex: '#c1121f' },
      { name: 'Blood',      hex: '#9d0208' },
      { name: 'Inferno',    hex: '#e85d04' },
      { name: 'Ash Rose',   hex: '#ffb3b3' },
      { name: 'Deep Red',   hex: '#6a0572' },
      { name: 'Obsidian Red', hex: '#4a0010' },
    ],
  },
  {
    bot: '恵 ¦ Ebisu',
    role: 'Shop / Tickets',
    key: 'ebisu',
    colors: [
      { name: 'Lavender',   hex: '#c77dff' },
      { name: 'Violet',     hex: '#9d4edd' },
      { name: 'Amethyst',   hex: '#7b2d8b' },
      { name: 'Royal',      hex: '#5a189a' },
      { name: 'Deep Plum',  hex: '#3c096c' },
      { name: 'Soft Lilac', hex: '#e0aaff' },
      { name: 'Indigo',     hex: '#480ca8' },
      { name: 'Dusk',       hex: '#240046' },
    ],
  },
  {
    bot: '影 ¦ Kage',
    role: 'Tracker',
    key: 'kage',
    colors: [
      { name: 'Sky',        hex: '#90e0ef' },
      { name: 'Cerulean',   hex: '#48cae4' },
      { name: 'Ocean',      hex: '#0096c7' },
      { name: 'Cobalt',     hex: '#0077b6' },
      { name: 'Deep Sea',   hex: '#023e8a' },
      { name: 'Ice',        hex: '#caf0f8' },
      { name: 'Steel',      hex: '#4895ef' },
      { name: 'Abyss',      hex: '#03045e' },
    ],
  },
  {
    bot: '稲 ¦ Inari',
    role: 'Embed Builder',
    key: 'inari',
    colors: [
      { name: 'Mint',       hex: '#6ee7b7' },
      { name: 'Jade',       hex: '#34d399' },
      { name: 'Emerald',    hex: '#10b981' },
      { name: 'Forest',     hex: '#059669' },
      { name: 'Deep Jade',  hex: '#047857' },
      { name: 'Sage',       hex: '#a7f3d0' },
      { name: 'Moss',       hex: '#065f46' },
      { name: 'Obsidian Jade', hex: '#022c22' },
    ],
  },
]

function hexToInt(hex) {
  return parseInt(hex.replace('#', ''), 16)
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r}, ${g}, ${b}`
}

function ColorCard({ color, onCopy, onInsert, copied }) {
  const isCopied = copied === color.hex

  return (
    <div
      className="group relative rounded-xl overflow-hidden cursor-pointer transition-transform hover:scale-105"
      style={{ border: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Color swatch */}
      <div
        className="w-full"
        style={{ height: 72, background: color.hex }}
      />

      {/* Hover overlay */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5"
        style={{ background: 'rgba(0,0,0,0.55)' }}
      >
        <button
          onClick={() => onCopy(color)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors"
          style={{
            background: isCopied ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.12)',
            color: isCopied ? '#34d399' : '#fff',
            border: '1px solid rgba(255,255,255,0.15)',
          }}
        >
          {isCopied ? (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          ) : (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.337c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
            </svg>
          )}
          {isCopied ? 'Copied' : 'Copy'}
        </button>
        <button
          onClick={() => onInsert(color)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors"
          style={{ background: 'rgba(16,185,129,0.2)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }}
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          Use
        </button>
      </div>

      {/* Color info */}
      <div
        className="px-2.5 py-2"
        style={{ background: 'rgba(255,255,255,0.03)' }}
      >
        <p className="text-xs font-medium truncate" style={{ color: 'rgba(255,255,255,0.8)' }}>
          {color.name}
        </p>
        <p className="text-[10px] font-mono mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
          {color.hex}
        </p>
      </div>
    </div>
  )
}

function PaletteSection({ palette, onCopy, onInsert, copied }) {
  const [expanded, setExpanded] = useState(true)

  const accentColor = palette.colors[2].hex

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 transition-colors hover:bg-white/[0.02]"
      >
        <div className="flex items-center gap-3">
          {/* Color dot row */}
          <div className="flex gap-1">
            {palette.colors.slice(0, 5).map((c) => (
              <div
                key={c.hex}
                className="w-4 h-4 rounded-full"
                style={{ background: c.hex }}
              />
            ))}
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.9)' }}>
              {palette.bot}
            </p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {palette.role}
            </p>
          </div>
        </div>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          style={{ color: 'rgba(255,255,255,0.25)' }}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Color grid */}
      {expanded && (
        <div
          className="px-5 pb-5"
          style={{ borderTop: `1px solid ${accentColor}22` }}
        >
          <div
            className="grid gap-3 mt-4"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))' }}
          >
            {palette.colors.map((color) => (
              <ColorCard
                key={color.hex}
                color={color}
                onCopy={onCopy}
                onInsert={onInsert}
                copied={copied}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function CustomPaletteBuilder({ onCopy, onInsert, copied }) {
  const [name, setName] = useState('')
  const [colors, setColors] = useState([{ name: '', hex: '#10b981' }])
  const [saved, setSaved] = useState([])

  const addColor = () => setColors([...colors, { name: '', hex: '#ffffff' }])

  const updateColor = (i, key, val) => {
    const updated = [...colors]
    updated[i] = { ...updated[i], [key]: val }
    setColors(updated)
  }

  const removeColor = (i) => setColors(colors.filter((_, idx) => idx !== i))

  const handleSave = () => {
    if (!name.trim() || colors.length === 0) return
    setSaved([...saved, { bot: name, role: 'Custom', key: Date.now(), colors }])
    setName('')
    setColors([{ name: '', hex: '#10b981' }])
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Saved custom palettes */}
      {saved.map((p) => (
        <PaletteSection key={p.key} palette={p} onCopy={onCopy} onInsert={onInsert} copied={copied} />
      ))}

      {/* Builder */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: '1px solid rgba(16,185,129,0.15)', background: 'rgba(16,185,129,0.02)' }}
      >
        <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(16,185,129,0.1)' }}>
          <p className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.8)' }}>
            New palette
          </p>
        </div>
        <div className="p-5 flex flex-col gap-4">

          {/* Name */}
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Palette name e.g. Event Theme"
            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.9)',
            }}
          />

          {/* Colors */}
          <div className="flex flex-col gap-2">
            {colors.map((c, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className="w-9 h-9 rounded-lg flex-shrink-0 cursor-pointer border"
                  style={{ background: c.hex, borderColor: 'rgba(255,255,255,0.1)' }}
                  onClick={() => document.getElementById(`cp-${i}`).click()}
                />
                <input
                  id={`cp-${i}`}
                  type="color"
                  value={c.hex}
                  onChange={(e) => updateColor(i, 'hex', e.target.value)}
                  className="sr-only"
                />
                <input
                  type="text"
                  value={c.hex}
                  onChange={(e) => updateColor(i, 'hex', e.target.value)}
                  className="w-28 px-2.5 py-2 rounded-lg text-xs font-mono outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }}
                />
                <input
                  type="text"
                  value={c.name}
                  onChange={(e) => updateColor(i, 'name', e.target.value)}
                  placeholder="Color name"
                  className="flex-1 px-2.5 py-2 rounded-lg text-xs outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }}
                />
                {colors.length > 1 && (
                  <button
                    onClick={() => removeColor(i)}
                    style={{ color: 'rgba(239,68,68,0.5)' }}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={addColor}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs transition-colors"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add color
            </button>
            <button
              onClick={handleSave}
              disabled={!name.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all"
              style={{
                background: name.trim() ? 'rgba(16,185,129,0.9)' : 'rgba(16,185,129,0.3)',
                color: '#fff',
                cursor: name.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              Save palette
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ColorPalettes() {
  const [activeTab, setActiveTab] = useState('bots')
  const [copied, setCopied] = useState(null)
  const { setEmbed } = useEmbedStore()
  const navigate = useNavigate()

  const handleCopy = (color) => {
    navigator.clipboard.writeText(color.hex)
    setCopied(color.hex)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleInsert = (color) => {
    setEmbed('color', hexToInt(color.hex))
    navigate('/builder')
  }

  const tabs = [
    { key: 'bots', label: 'Bot palettes' },
    { key: 'custom', label: 'Custom' },
  ]

  return (
    <div className="flex flex-col h-full min-h-0">

      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-4 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(16,185,129,0.1)' }}
      >
        <div>
          <h1 className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.9)' }}>
            Color Palettes
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Pick, copy, or insert colors directly into your embed
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="flex items-center gap-1 px-6 py-2 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(16,185,129,0.08)' }}
      >
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: activeTab === t.key ? 'rgba(16,185,129,0.15)' : 'transparent',
              color: activeTab === t.key ? '#34d399' : 'rgba(255,255,255,0.4)',
              border: activeTab === t.key ? '1px solid rgba(16,185,129,0.25)' : '1px solid transparent',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
        {activeTab === 'bots' ? (
          PALETTES.map(p => (
            <PaletteSection
              key={p.key}
              palette={p}
              onCopy={handleCopy}
              onInsert={handleInsert}
              copied={copied}
            />
          ))
        ) : (
          <CustomPaletteBuilder
            onCopy={handleCopy}
            onInsert={handleInsert}
            copied={copied}
          />
        )}
      </div>
    </div>
  )
}