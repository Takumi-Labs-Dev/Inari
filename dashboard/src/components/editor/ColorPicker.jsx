import { useState } from 'react'

const PRESETS = [
  { label: 'Jade',    hex: '#10b981' },
  { label: 'Blurple', hex: '#5865f2' },
  { label: 'Rose',    hex: '#f43f5e' },
  { label: 'Amber',   hex: '#f59e0b' },
  { label: 'Sky',     hex: '#0ea5e9' },
  { label: 'Violet',  hex: '#8b5cf6' },
  { label: 'White',   hex: '#ffffff' },
  { label: 'Dark',    hex: '#2b2d31' },
]

function hexToInt(hex) {
  return parseInt(hex.replace('#', ''), 16)
}

function intToHex(int) {
  return '#' + int.toString(16).padStart(6, '0')
}

export default function ColorPicker({ value, onChange }) {
  const [custom, setCustom] = useState(intToHex(value || 1752220))

  const handlePreset = (hex) => {
    setCustom(hex)
    onChange(hexToInt(hex))
  }

  const handleCustom = (hex) => {
    setCustom(hex)
    if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
      onChange(hexToInt(hex))
    }
  }

  const currentHex = intToHex(value || 1752220)

  return (
    <div className="flex flex-col gap-3">
      <label className="text-[11px] font-semibold uppercase tracking-widest text-obsidian-300">
        Accent color
      </label>
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-lg border-2 border-obsidian-600 flex-shrink-0 cursor-pointer"
          style={{ backgroundColor: currentHex }}
          onClick={() => document.getElementById('color-input').click()}
        />
        <input
          id="color-input"
          type="color"
          value={currentHex}
          onChange={(e) => handleCustom(e.target.value)}
          className="sr-only"
        />
        <input
          type="text"
          value={custom}
          onChange={(e) => handleCustom(e.target.value)}
          maxLength={7}
          className="flex-1 bg-obsidian-800 border border-obsidian-600 rounded-lg px-3 py-2
            text-sm font-mono text-obsidian-100 focus:outline-none focus:border-jade-600
            focus:ring-1 focus:ring-jade-600/30 transition-colors"
        />
      </div>
      <div className="flex gap-2 flex-wrap">
        {PRESETS.map((p) => (
          <button
            key={p.hex}
            title={p.label}
            onClick={() => handlePreset(p.hex)}
            className="w-6 h-6 rounded-md border-2 transition-all hover:scale-110"
            style={{
              backgroundColor: p.hex,
              borderColor: currentHex === p.hex ? '#10b981' : 'transparent',
            }}
          />
        ))}
      </div>
    </div>
  )
}