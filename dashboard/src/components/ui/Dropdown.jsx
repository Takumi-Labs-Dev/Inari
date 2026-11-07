import { useEffect, useRef, useState } from 'react'

export default function Dropdown({ value, onChange, options, placeholder, disabled, icon, direction = 'up', emptyText = 'No options' }) {
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
          className={`absolute left-0 right-0 rounded-xl overflow-hidden z-50 max-h-56 overflow-y-auto ${direction === 'down' ? 'top-full mt-1' : 'bottom-full mb-1'}`}
          style={{ background: 'var(--w-card)', border: '1px solid var(--w-accent-line)', boxShadow: 'var(--w-shadow)' }}
        >
          {options.length === 0 ? (
            <div className="px-3 py-3 text-sm" style={{ color: 'var(--w-ink-faint)' }}>
              {emptyText}
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
