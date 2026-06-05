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
        className="bg-obsidian-800 border border-obsidian-600 rounded-lg px-2 py-1.5
          text-xs text-obsidian-200 font-mono focus:outline-none focus:border-jade-600
          transition-colors"
      >
        {LANGUAGES.map((l) => (
          <option key={l} value={l}>{l}</option>
        ))}
      </select>
      <button
        type="button"
        onClick={handleInsert}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-obsidian-600
          bg-obsidian-800 text-xs font-medium text-obsidian-300 hover:text-obsidian-100
          hover:border-obsidian-500 transition-colors font-mono"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
        </svg>
        Code block
      </button>
    </div>
  )
}