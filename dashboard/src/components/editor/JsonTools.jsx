import { useState } from 'react'
import { useEmbedStore } from '../../store/embedStore'

export default function JsonTools() {
  const { embed, setEmbed, setNestedEmbed } = useEmbedStore()
  const [showModal, setShowModal] = useState(false)
  const [jsonText, setJsonText] = useState('')
  const [error, setError] = useState(null)
  const [mode, setMode] = useState('export') // 'export' | 'import'

  const handleExport = () => {
    setMode('export')
    setJsonText(JSON.stringify(embed, null, 2))
    setError(null)
    setShowModal(true)
  }

  const handleImportOpen = () => {
    setMode('import')
    setJsonText('')
    setError(null)
    setShowModal(true)
  }

  const handleImport = () => {
    try {
      const parsed = JSON.parse(jsonText)
      const fields = ['title', 'description', 'color', 'timestamp']
      const nested = ['author', 'footer', 'thumbnail', 'image']
      fields.forEach((k) => { if (parsed[k] !== undefined) setEmbed(k, parsed[k]) })
      nested.forEach((k) => {
        if (parsed[k]) {
          Object.entries(parsed[k]).forEach(([nk, nv]) => setNestedEmbed(k, nk, nv))
        }
      })
      if (parsed.fields) setEmbed('fields', parsed.fields)
      setShowModal(false)
    } catch {
      setError('Invalid JSON — check your syntax and try again.')
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonText)
  }

  return (
    <>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={handleExport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-obsidian-600
            bg-obsidian-800 text-xs font-medium text-obsidian-300 hover:text-obsidian-100
            hover:border-obsidian-500 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Export JSON
        </button>
        <button
          type="button"
          onClick={handleImportOpen}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-obsidian-600
            bg-obsidian-800 text-xs font-medium text-obsidian-300 hover:text-obsidian-100
            hover:border-obsidian-500 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 7.5m0 0L7.5 12m4.5-4.5V21" />
          </svg>
          Import JSON
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="bg-obsidian-900 border border-obsidian-700 rounded-2xl w-full max-w-lg mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-obsidian-700">
              <h2 className="text-sm font-semibold text-obsidian-100">
                {mode === 'export' ? 'Export embed JSON' : 'Import embed JSON'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-obsidian-400 hover:text-obsidian-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-5">
              <textarea
                value={jsonText}
                onChange={(e) => { setJsonText(e.target.value); setError(null) }}
                readOnly={mode === 'export'}
                rows={14}
                spellCheck={false}
                className="w-full bg-obsidian-950 border border-obsidian-700 rounded-xl p-4
                  text-xs font-mono text-obsidian-200 resize-none focus:outline-none
                  focus:border-jade-600 transition-colors leading-relaxed"
              />
              {error && (
                <p className="text-xs text-red-400 mt-2">{error}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-obsidian-700">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg text-sm text-obsidian-300 hover:text-obsidian-100
                  hover:bg-obsidian-800 transition-colors"
              >
                Cancel
              </button>
              {mode === 'export' ? (
                <button
                  onClick={handleCopy}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-jade-600
                    hover:bg-jade-500 text-white transition-colors"
                >
                  Copy to clipboard
                </button>
              ) : (
                <button
                  onClick={handleImport}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-jade-600
                    hover:bg-jade-500 text-white transition-colors"
                >
                  Import
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}