import { useRef, forwardRef, useImperativeHandle } from 'react'

const FORMATS = [
  { label: 'B', title: 'Bold', wrap: ['**', '**'], style: { fontWeight: 700 } },
  { label: 'I', title: 'Italic', wrap: ['*', '*'], style: { fontStyle: 'italic' } },
  { label: 'U', title: 'Underline', wrap: ['__', '__'], style: { textDecoration: 'underline' } },
  { label: 'S', title: 'Strikethrough', wrap: ['~~', '~~'], style: { textDecoration: 'line-through' } },
  { label: '`', title: 'Inline code', wrap: ['`', '`'], style: { fontFamily: 'monospace' } },
  { label: '||', title: 'Spoiler', wrap: ['||', '||'], style: {} },
  { label: '> ', title: 'Blockquote', wrap: ['> ', ''], style: {} },
]

const Textarea = forwardRef(function Textarea(
  { label, placeholder, value, onChange, maxLength, rows = 4, mono, showToolbar = false },
  ref
) {
  const textareaRef = useRef(null)
  const remaining = maxLength ? maxLength - (value?.length || 0) : null
  const isNearLimit = remaining !== null && remaining < 100

  useImperativeHandle(ref, () => ({
    insert: (text) => {
      const el = textareaRef.current
      if (!el) return
      const start = el.selectionStart
      const end = el.selectionEnd
      const newValue = value.slice(0, start) + text + value.slice(end)
      onChange(newValue)
      setTimeout(() => {
        el.focus()
        el.setSelectionRange(start + text.length, start + text.length)
      }, 0)
    }
  }))

  const handleFormat = (wrap) => {
    const el = textareaRef.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const selected = value.slice(start, end)
    const [before, after] = wrap

    // If nothing selected, insert placeholder
    const insertion = selected
      ? `${before}${selected}${after}`
      : `${before}text${after}`

    const newValue = value.slice(0, start) + insertion + value.slice(end)
    onChange(newValue)

    // Reposition cursor inside the wrapping
    setTimeout(() => {
      el.focus()
      if (selected) {
        el.setSelectionRange(
          start + before.length,
          start + before.length + selected.length
        )
      } else {
        el.setSelectionRange(
          start + before.length,
          start + before.length + 4
        )
      }
    }, 0)
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <label className="text-[11px] font-semibold uppercase tracking-widest text-obsidian-300">
          {label}
        </label>
        {maxLength && (
          <span className={`text-[11px] tabular-nums ${isNearLimit ? 'text-amber-400' : 'text-obsidian-400'}`}>
            {remaining}
          </span>
        )}
      </div>

      {showToolbar && (
        <div
          className="flex items-center gap-0.5 px-2 py-1.5 rounded-t-lg"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(16,185,129,0.15)', borderBottom: 'none' }}
        >
          {FORMATS.map((f) => (
            <button
              key={f.label}
              type="button"
              title={f.title}
              onMouseDown={(e) => {
                e.preventDefault() // prevent textarea losing focus/selection
                handleFormat(f.wrap)
              }}
              className="w-7 h-7 rounded-md flex items-center justify-center text-xs transition-colors"
              style={{
                ...f.style,
                color: 'rgba(255,255,255,0.5)',
                fontSize: f.label === '||' ? 10 : 13,
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(16,185,129,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              {f.label}
            </button>
          ))}

          <div className="w-px h-4 mx-1" style={{ background: 'rgba(255,255,255,0.08)' }} />

          {/* Divider insert */}
          <button
            type="button"
            title="Insert divider"
            onMouseDown={(e) => {
              e.preventDefault()
              const el = textareaRef.current
              if (!el) return
              const start = el.selectionStart
              const newValue = value.slice(0, start) + '\n⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯\n' + value.slice(start)
              onChange(newValue)
              setTimeout(() => el.focus(), 0)
            }}
            className="px-2 h-7 rounded-md text-[10px] transition-colors"
            style={{ color: 'rgba(255,255,255,0.4)' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(16,185,129,0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            ─ line
          </button>
        </div>
      )}

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={rows}
        className={`
          w-full bg-obsidian-800 border border-obsidian-600 px-3 py-2.5
          text-sm text-obsidian-100 placeholder-obsidian-400 resize-none
          focus:outline-none focus:border-jade-600 focus:ring-1 focus:ring-jade-600/30
          transition-colors duration-150 leading-relaxed
          ${showToolbar ? 'rounded-b-lg rounded-t-none' : 'rounded-lg'}
          ${mono ? 'font-mono text-xs' : ''}
        `}
      />
    </div>
  )
})

export default Textarea