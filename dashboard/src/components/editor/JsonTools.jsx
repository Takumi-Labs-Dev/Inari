import { useState } from 'react'
import { useEmbedStore } from '../../store/embedStore'

export default function JsonTools() {
  const { embed, loadEmbed } = useEmbedStore()
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
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error('Not an embed object')
      }
      // Also accept a full Discord message: { "embeds": [ { ... } ] }
      const source = Array.isArray(parsed.embeds) && parsed.embeds[0] ? parsed.embeds[0] : parsed
      loadEmbed(source)
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
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cream-300
            bg-cream-50 text-xs font-medium text-cocoa-600 hover:text-cocoa-900
            hover:border-caramel-600 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Export JSON
        </button>
        <button
          type="button"
          onClick={handleImportOpen}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cream-300
            bg-cream-50 text-xs font-medium text-cocoa-600 hover:text-cocoa-900
            hover:border-caramel-600 transition-colors"
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
          className="fixed inset-0 bg-cocoa-900/50 flex items-center justify-center z-50"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="bg-cream-50 border border-cream-300 rounded-2xl w-full max-w-lg mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-cream-300">
              <h2 className="font-pixel text-base font-semibold text-cocoa-900">
                {mode === 'export' ? 'Export embed JSON' : 'Import embed JSON'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-cocoa-500 hover:text-cocoa-900 transition-colors"
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
                className="w-full bg-cream-200 border border-cream-300 rounded-xl p-4
                  text-xs font-mono text-cocoa-700 resize-none focus:outline-none
                  focus:border-toast-700 transition-colors leading-relaxed"
              />
              {error && (
                <p className="text-xs text-berry-500 mt-2">{error}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-cream-300">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg text-sm text-cocoa-600 hover:text-cocoa-900
                  hover:bg-cream-50 transition-colors"
              >
                Cancel
              </button>
              {mode === 'export' ? (
                <button
                  onClick={handleCopy}
                  className="w-btn px-4 py-2 text-sm"
                >
                  Copy to clipboard
                </button>
              ) : (
                <button
                  onClick={handleImport}
                  className="w-btn px-4 py-2 text-sm"
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
