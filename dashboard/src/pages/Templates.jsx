import { useEffect, useState } from 'react'
import { useEmbedStore } from '../store/embedStore'
import { getTemplates, getTemplate, createTemplate, updateTemplate, deleteTemplate } from '../api/index.js'
import { useNavigate } from 'react-router-dom'

function timeAgo(unix) {
  const diff = Math.floor(Date.now() / 1000) - unix
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function Templates() {
  const { embed, setEmbed, setTemplates, templates } = useEmbedStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showSave, setShowSave] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [saveDesc, setSaveDesc] = useState('')
  const [deleteId, setDeleteId] = useState(null)
  const navigate = useNavigate()

  const load = () => {
    getTemplates()
      .then((r) => setTemplates(r.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleSave = async () => {
    if (!saveName.trim()) return
    setSaving(true)
    try {
      await createTemplate({ name: saveName, description: saveDesc, embed })
      setSaveName('')
      setSaveDesc('')
      setShowSave(false)
      load()
    } finally {
      setSaving(false)
    }
  }

  const handleLoad = async (id) => {
    const res = await getTemplate(id)
    const e = res.data.embed
    const fields = ['title', 'description', 'color', 'timestamp', 'fields']
    const nested = ['author', 'footer', 'thumbnail', 'image']
    fields.forEach((k) => { if (e[k] !== undefined) setEmbed(k, e[k]) })
    nested.forEach((k) => {
      if (e[k]) {
        Object.entries(e[k]).forEach(([nk, nv]) => {
          useEmbedStore.getState().setNestedEmbed(k, nk, nv)
        })
      }
    })
    navigate('/builder')
  }

  const handleDelete = async (id) => {
    await deleteTemplate(id)
    setDeleteId(null)
    load()
  }

  return (
    <div className="flex flex-col h-full min-h-0">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(16,185,129,0.1)' }}>
        <div>
          <h1 className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.9)' }}>
            Templates
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Save and reuse your embed designs
          </p>
        </div>
        <button
          onClick={() => setShowSave(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
          style={{ background: 'rgba(16,185,129,0.9)', color: '#fff' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Save current embed
        </button>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center py-20"
            style={{ color: 'rgba(255,255,255,0.2)' }}>
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
              <svg className="w-6 h-6" style={{ color: '#34d399' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
            </div>
            <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>No templates yet</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
              Build an embed and save it as a template
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {templates.map((t) => (
              <div key={t.id}
                className="rounded-xl p-4 flex flex-col gap-3 group transition-all"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(16,185,129,0.1)' }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate"
                      style={{ color: 'rgba(255,255,255,0.85)' }}>{t.name}</p>
                    {t.description && (
                      <p className="text-xs mt-0.5 truncate"
                        style={{ color: 'rgba(255,255,255,0.3)' }}>{t.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setDeleteId(t.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    style={{ color: 'rgba(239,68,68,0.6)' }}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>

                <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  Updated {timeAgo(t.updated_at)}
                </p>

                <button
                  onClick={() => handleLoad(t.id)}
                  className="w-full py-2 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: 'rgba(16,185,129,0.1)',
                    color: '#34d399',
                    border: '1px solid rgba(16,185,129,0.2)',
                  }}
                >
                  Load into editor
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save modal */}
      {showSave && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={(e) => e.target === e.currentTarget && setShowSave(false)}
        >
          <div className="w-full max-w-md mx-4 rounded-2xl overflow-hidden"
            style={{ background: '#0d1412', border: '1px solid rgba(16,185,129,0.2)' }}>
            <div className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid rgba(16,185,129,0.1)' }}>
              <h2 className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.9)' }}>
                Save as template
              </h2>
              <button onClick={() => setShowSave(false)}
                style={{ color: 'rgba(255,255,255,0.3)' }}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-widest"
                  style={{ color: 'rgba(255,255,255,0.4)' }}>Template name</label>
                <input
                  type="text"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="e.g. Welcome message"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-colors"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.9)',
                  }}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-widest"
                  style={{ color: 'rgba(255,255,255,0.4)' }}>Description
                  <span className="ml-2 normal-case" style={{ color: 'rgba(255,255,255,0.2)' }}>optional</span>
                </label>
                <input
                  type="text"
                  value={saveDesc}
                  onChange={(e) => setSaveDesc(e.target.value)}
                  placeholder="What is this template for?"
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-colors"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.9)',
                  }}
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-5 py-4"
              style={{ borderTop: '1px solid rgba(16,185,129,0.1)' }}>
              <button onClick={() => setShowSave(false)}
                className="px-4 py-2 rounded-lg text-sm transition-colors"
                style={{ color: 'rgba(255,255,255,0.4)' }}>
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!saveName.trim() || saving}
                className="px-5 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: saveName.trim() ? 'rgba(16,185,129,0.9)' : 'rgba(16,185,129,0.3)',
                  color: '#fff',
                  cursor: saveName.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                {saving ? 'Saving...' : 'Save template'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={(e) => e.target === e.currentTarget && setDeleteId(null)}
        >
          <div className="w-full max-w-sm mx-4 rounded-2xl overflow-hidden"
            style={{ background: '#0d1412', border: '1px solid rgba(239,68,68,0.2)' }}>
            <div className="p-6 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <svg className="w-5 h-5" style={{ color: '#f87171' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.9)' }}>Delete template?</p>
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>This cannot be undone.</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setDeleteId(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm transition-colors"
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)' }}>
                  Cancel
                </button>
                <button onClick={() => handleDelete(deleteId)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors"
                  style={{ background: 'rgba(239,68,68,0.8)', color: '#fff' }}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}