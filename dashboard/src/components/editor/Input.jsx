export default function Input({ label, placeholder, value, onChange, maxLength, mono }) {
  const remaining = maxLength ? maxLength - (value?.length || 0) : null
  const isNearLimit = remaining !== null && remaining < 50

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <label className="text-[11px] font-semibold uppercase tracking-widest text-cocoa-600">
          {label}
        </label>
        {maxLength && (
          <span className={`text-[11px] tabular-nums ${isNearLimit ? 'text-caramel-600' : 'text-cocoa-500'}`}>
            {remaining}
          </span>
        )}
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`
          w-full bg-cream-50 border border-cream-300 rounded-lg px-3 py-2.5
          text-sm text-cocoa-900 placeholder-cocoa-400
          focus:outline-none focus:border-toast-700 focus:ring-1 focus:ring-honey-500/40
          transition-colors duration-150
          ${mono ? 'font-mono text-xs' : ''}
        `}
      />
    </div>
  )
}
