export default function Textarea({ label, placeholder, value, onChange, maxLength, rows = 4, mono }) {
  const remaining = maxLength ? maxLength - (value?.length || 0) : null
  const isNearLimit = remaining !== null && remaining < 100

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
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={rows}
        className={`
          w-full bg-obsidian-800 border border-obsidian-600 rounded-lg px-3 py-2.5
          text-sm text-obsidian-100 placeholder-obsidian-400 resize-none
          focus:outline-none focus:border-jade-600 focus:ring-1 focus:ring-jade-600/30
          transition-colors duration-150 leading-relaxed
          ${mono ? 'font-mono text-xs' : ''}
        `}
      />
    </div>
  )
}