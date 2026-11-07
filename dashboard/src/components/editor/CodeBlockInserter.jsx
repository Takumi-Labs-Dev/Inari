import { useState } from 'react'

const LANGUAGES = [
  'js', 'ts', 'jsx', 'tsx', 'py', 'bash', 'sh',
  'json', 'sql', 'html', 'css', 'rust', 'go', 'java', 'cs', 'cpp', 'diff'
]

export default function CodeBlockInserter({ onInsert }) {
  const [lang, setLang] = useState('js')

  const handleInsert = () => {
    onInsert(`\`\`\`${lang}\n\n\`\`\``)
  }

  return (
    <div className="flex items-center gap-1.5">
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value)}
        className="bg-cream-50 border border-cream-300 rounded-lg px-2 py-1.5
          text-xs text-cocoa-700 font-mono focus:outline-none focus:border-toast-700
          transition-colors"
      >
        {LANGUAGES.map((l) => (
          <option key={l} value={l}>{l}</option>
        ))}
      </select>
      <button
        type="button"
        onClick={handleInsert}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cream-300
          bg-cream-50 text-xs font-medium text-cocoa-600 hover:text-cocoa-900
          hover:border-caramel-600 transition-colors font-mono"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
        </svg>
        Code block
      </button>
    </div>
  )
}
