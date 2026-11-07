import { useState } from 'react'

const DEFAULT_COLOR = 0xe08a2b // syrup

const PRESETS = [
  { label: 'Syrup',      hex: '#e08a2b' },
  { label: 'Honey',      hex: '#e8a93c' },
  { label: 'Caramel',    hex: '#b8692f' },
  { label: 'Toast',      hex: '#8a4b22' },
  { label: 'Strawberry', hex: '#d9534a' },
  { label: 'Leaf',       hex: '#7fa650' },
  { label: 'Cream',      hex: '#f7e4b8' },
  { label: 'Blurple',    hex: '#5865f2' },
]

function hexToInt(hex) {
  return parseInt(hex.replace('#', ''), 16)
}

function intToHex(int) {
  return '#' + int.toString(16).padStart(6, '0')
}

export default function ColorPicker({ value, onChange }) {
  const [custom, setCustom] = useState(intToHex(value ?? DEFAULT_COLOR))

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

  const currentHex = intToHex(value ?? DEFAULT_COLOR)

  return (
    <div className="flex flex-col gap-3">
      <label className="text-[11px] font-semibold uppercase tracking-widest text-cocoa-600">
        Accent color
      </label>
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-lg border-2 border-cream-300 flex-shrink-0 cursor-pointer"
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
          className="flex-1 bg-cream-50 border border-cream-300 rounded-lg px-3 py-2
            text-sm font-mono text-cocoa-900 focus:outline-none focus:border-toast-700
            focus:ring-1 focus:ring-honey-500/40 transition-colors"
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
              borderColor: currentHex === p.hex ? 'var(--w-ink)' : 'transparent',
            }}
          />
        ))}
      </div>
    </div>
  )
}
