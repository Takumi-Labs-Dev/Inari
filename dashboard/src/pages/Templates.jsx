import { useEffect, useState } from 'react'
import { useEmbedStore } from '../store/embedStore'
import { getTemplates, getTemplate, createTemplate, deleteTemplate, errorMessage } from '../api/index.js'
import NeedServer from '../components/NeedServer'
import { useNavigate } from 'react-router-dom'

function timeAgo(unix) {
  const diff = Math.floor(Date.now() / 1000) - unix
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

// Each server has its own templates: pick one, and this page starts fresh for it.
export default function Templates() {
  const guildId = useEmbedStore((s) => s.selectedGuild?.id)
  if (!guildId) return <NeedServer title="Templates" />
  return <TemplatesPage key={guildId} guildId={guildId} />
}

function TemplatesPage({ guildId }) {
  const { embed, loadEmbed, setTemplates, templates } = useEmbedStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showSave, setShowSave] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [saveDesc, setSaveDesc] = useState('')
  const [deleteId, setDeleteId] = useState(null)
  const [saveError, setSaveError] = useState('')
  const navigate = useNavigate()

  const load = () => {
    getTemplates(guildId)
      .then((r) => setTemplates(r.data))
      .catch(() => setTemplates([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleSave = async () => {
    if (!saveName.trim()) return
    setSaving(true)
    setSaveError('')
    try {
      await createTemplate(guildId, { name: saveName, description: saveDesc, embed })
      setSaveName('')
      setSaveDesc('')
      setShowSave(false)
      load()
    } catch (err) {
      setSaveError(errorMessage(err, 'Could not save the template.'))
    } finally {
      setSaving(false)
    }
  }

  const handleLoad = async (id) => {
    try {
      const res = await getTemplate(guildId, id)
      loadEmbed(res.data.embed)
      navigate('/builder')
    } catch {
      // Leave the editor as it is if the template could not be loaded
    }
  }

  const handleDelete = async (id) => {
    await deleteTemplate(guildId, id)
    setDeleteId(null)
    load()
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--w-line)' }}>
        <div>
          <h1 className="font-pixel text-base font-semibold" style={{ color: 'var(--w-ink)' }}>
            Templates
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--w-ink-soft)' }}>
            Save and reuse your embed designs
          </p>
        </div>
        <button
          onClick={() => { setSaveError(''); setShowSave(true) }}
          className="w-btn px-4 py-2 text-sm"
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
            style={{ color: 'var(--w-ink-faint)' }}>
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'var(--w-accent-soft)', border: '1px solid var(--w-line)' }}>
              <svg className="w-6 h-6" style={{ color: 'var(--w-accent-ink)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--w-ink-soft)' }}>No templates yet, how about a first one?</p>
            <p className="text-xs" style={{ color: 'var(--w-ink-faint)' }}>
              Build an embed in the Builder, then save it here to reuse later
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {templates.map((t) => (
              <div key={t.id}
                className="rounded-xl p-4 flex flex-col gap-3 group transition-all"
                style={{ background: 'var(--w-card)', border: '1px solid var(--w-line)' }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate"
                      style={{ color: 'var(--w-ink)' }}>{t.name}</p>
                    {t.description && (
                      <p className="text-xs mt-0.5 truncate"
                        style={{ color: 'var(--w-ink-soft)' }}>{t.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setDeleteId(t.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    style={{ color: 'var(--w-berry)' }}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>

                <p className="text-[11px]" style={{ color: 'var(--w-ink-faint)' }}>
                  Updated {timeAgo(t.updated_at)}
                </p>

                <button
                  onClick={() => handleLoad(t.id)}
                  className="w-full py-2 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: 'var(--w-accent-soft)',
                    color: 'var(--w-accent-ink)',
                    border: '1px solid var(--w-accent-line)',
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
          style={{ background: 'var(--w-overlay)' }}
          onClick={(e) => e.target === e.currentTarget && setShowSave(false)}
        >
          <div className="w-full max-w-md mx-4 rounded-2xl overflow-hidden"
            style={{ background: 'var(--w-card)', border: '1px solid var(--w-accent-line)' }}>
            <div className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid var(--w-line)' }}>
              <h2 className="font-pixel text-base font-semibold" style={{ color: 'var(--w-ink)' }}>
                Save as template
              </h2>
              <button onClick={() => setShowSave(false)}
                style={{ color: 'var(--w-ink-soft)' }}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-widest"
                  style={{ color: 'var(--w-ink-soft)' }}>Template name</label>
                <input
                  type="text"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="e.g. Welcome message"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-colors"
                  style={{
                    background: 'var(--w-card)',
                    border: '1px solid var(--w-line)',
                    color: 'var(--w-ink)',
                  }}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-widest"
                  style={{ color: 'var(--w-ink-soft)' }}>Description
                  <span className="ml-2 normal-case" style={{ color: 'var(--w-ink-faint)' }}>optional</span>
                </label>
                <input
                  type="text"
                  value={saveDesc}
                  onChange={(e) => setSaveDesc(e.target.value)}
                  placeholder="What is this template for?"
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-colors"
                  style={{
                    background: 'var(--w-card)',
                    border: '1px solid var(--w-line)',
                    color: 'var(--w-ink)',
                  }}
                />
              </div>
            </div>
            {saveError && (
              <p className="px-5 pb-3 text-xs" role="alert" style={{ color: 'var(--w-berry)' }}>{saveError}</p>
            )}
            <div className="flex items-center justify-end gap-2 px-5 py-4"
              style={{ borderTop: '1px solid var(--w-line)' }}>
              <button onClick={() => { setShowSave(false); setSaveError('') }}
                className="px-4 py-2 rounded-lg text-sm transition-colors"
                style={{ color: 'var(--w-ink-soft)' }}>
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!saveName.trim() || saving}
                className="w-btn px-5 py-2 text-sm"
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
          style={{ background: 'var(--w-overlay)' }}
          onClick={(e) => e.target === e.currentTarget && setDeleteId(null)}
        >
          <div className="w-full max-w-sm mx-4 rounded-2xl overflow-hidden"
            style={{ background: 'var(--w-card)', border: '1px solid rgba(196,69,59,0.4)' }}>
            <div className="p-6 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto"
                style={{ background: 'var(--w-berry-soft)', border: '1px solid rgba(196,69,59,0.4)' }}>
                <svg className="w-5 h-5" style={{ color: 'var(--w-berry)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold" style={{ color: 'var(--w-ink)' }}>Delete template?</p>
                <p className="text-xs mt-1" style={{ color: 'var(--w-ink-soft)' }}>This cannot be undone.</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setDeleteId(null)}
                  className="w-btn w-btn-quiet flex-1 py-2.5 text-sm">
                  Cancel
                </button>
                <button onClick={() => handleDelete(deleteId)}
                  className="w-btn w-btn-danger flex-1 py-2.5 text-sm">
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
