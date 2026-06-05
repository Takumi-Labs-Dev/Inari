import { useEffect, useState } from 'react'
import { getVault, addVaultItem, deleteVaultItem } from '../api/index.js'
import { useEmbedStore } from '../store/embedStore'
import { useNavigate } from 'react-router-dom'

const CATEGORIES = ['Profiles', 'Thumbnails', 'Images']

const CATEGORY_FIELD_MAP = {
  Profiles: { key: 'author', nestedKey: 'icon_url' },
  Thumbnails: { key: 'thumbnail', nestedKey: 'url' },
  Images: { key: 'image', nestedKey: 'url' },
}

function resolveDirectUrl(url) {
  try {
    const u = new URL(url)
    if (u.hostname === 'ibb.co') {
      return {
        url,
        previewUrl: url,
        valid: false,
        hint: 'Use the direct image URL from imgBB (i.ibb.co/...) or upload to Cloudinary for best results.',
      }
    }
    return { url, previewUrl: url, valid: true }
  } catch {
    return { url, previewUrl: '', valid: false, hint: 'Enter a valid URL starting with https://' }
  }
}

function CopyIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.337c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  )
}

function VaultCard({ item, onDelete, onInsert, onCopy, copied, apiUrl }) {
  const [imgError, setImgError] = useState(false)
  const [deleting, setDeleting] = useState(false)

  return (
    <div
      className="rounded-xl overflow-hidden group flex flex-col"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(16,185,129,0.1)' }}
    >
      <div
        className="relative flex items-center justify-center overflow-hidden"
        style={{ height: 140, background: 'rgba(0,0,0,0.3)' }}
      >
        {!imgError ? (
          <img
            src={item.url}
            alt={item.label || 'image'}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex flex-col items-center gap-2 opacity-30">
            <svg className="w-8 h-8" style={{ color: '#34d399' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Invalid URL</span>
          </div>
        )}

        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
          style={{ background: 'rgba(0,0,0,0.6)' }}
        >
          <button
            onClick={() => onCopy(item)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={{
              background: copied === item.id ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.1)',
              color: copied === item.id ? '#34d399' : '#fff',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            {copied === item.id ? <CheckIcon /> : <CopyIcon />}
            {copied === item.id ? 'Copied' : 'Copy URL'}
          </button>
          <button
            onClick={() => onInsert(item)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={{ background: 'rgba(16,185,129,0.2)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            Insert
          </button>
        </div>
      </div>

      <div className="px-3 py-2.5 flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium truncate" style={{ color: 'rgba(255,255,255,0.7)' }}>
            {item.label || 'Untitled'}
          </p>
          <p className="text-[10px] truncate mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
            {item.url}
          </p>
        </div>
        <button
          onClick={async () => { setDeleting(true); await onDelete(item.id) }}
          className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: deleting ? '#f87171' : 'rgba(239,68,68,0.5)' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default function Vault() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  const [showAdd, setShowAdd] = useState(false)
  const [newUrl, setNewUrl] = useState('')
  const [newLabel, setNewLabel] = useState('')
  const [newCategory, setNewCategory] = useState('Images')
  const [adding, setAdding] = useState(false)
  const [copied, setCopied] = useState(null)
  const { setNestedEmbed } = useEmbedStore()
  const navigate = useNavigate()

  const load = () => {
    getVault()
      .then(r => setItems(r.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const resolved = resolveDirectUrl(newUrl)

  const handleAdd = async () => {
    if (!newUrl.trim()) return
    setAdding(true)
    try {
      await addVaultItem({ url: resolved.url, label: newLabel, category: newCategory })
      setNewUrl('')
      setNewLabel('')
      setNewCategory('Images')
      setShowAdd(false)
      load()
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = async (id) => {
    await deleteVaultItem(id)
    load()
  }

  const handleCopy = (item) => {
    navigator.clipboard.writeText(item.url)
    setCopied(item.id)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleInsert = (item) => {
    const mapping = CATEGORY_FIELD_MAP[item.category]
    if (mapping) {
      setNestedEmbed(mapping.key, mapping.nestedKey, item.url)
      navigate('/builder')
    }
  }

  const categories = ['All', ...CATEGORIES]
  const filtered = activeCategory === 'All'
    ? items
    : items.filter(i => i.category === activeCategory)

  return (
    <div className="flex flex-col h-full min-h-0">

      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-4 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(16,185,129,0.1)' }}
      >
        <div>
          <h1 className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.9)' }}>Vault</h1>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Store and reuse image URLs with preview
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
          style={{ background: 'rgba(16,185,129,0.9)', color: '#fff' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add URL
        </button>
      </div>

      {/* Category tabs */}
      <div
        className="flex items-center gap-1 px-6 py-2 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(16,185,129,0.08)' }}
      >
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: activeCategory === cat ? 'rgba(16,185,129,0.15)' : 'transparent',
              color: activeCategory === cat ? '#34d399' : 'rgba(255,255,255,0.4)',
              border: activeCategory === cat ? '1px solid rgba(16,185,129,0.25)' : '1px solid transparent',
            }}
          >
            {cat}
            {cat !== 'All' && (
              <span className="ml-1.5 text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
                {items.filter(i => i.category === cat).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center py-20" style={{ color: 'rgba(255,255,255,0.2)' }}>
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}
            >
              <svg className="w-6 h-6" style={{ color: '#34d399' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {activeCategory === 'All' ? 'Vault is empty' : `No ${activeCategory} yet`}
            </p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
              Add an image URL to get started
            </p>
          </div>
        ) : (
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
            {filtered.map(item => (
              <VaultCard
                key={item.id}
                item={item}
                onDelete={handleDelete}
                onInsert={handleInsert}
                onCopy={handleCopy}
                copied={copied}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add modal */}
      {showAdd && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={(e) => e.target === e.currentTarget && setShowAdd(false)}
        >
          <div
            className="w-full max-w-md mx-4 rounded-2xl overflow-hidden"
            style={{ background: '#0d1412', border: '1px solid rgba(16,185,129,0.2)' }}
          >
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid rgba(16,185,129,0.1)' }}
            >
              <h2 className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.9)' }}>
                Add to Vault
              </h2>
              <button onClick={() => setShowAdd(false)} style={{ color: 'rgba(255,255,255,0.3)' }}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4">

              {/* URL input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-widest"
                  style={{ color: 'rgba(255,255,255,0.4)' }}>Image URL</label>
                <input
                  type="text"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://i.ibb.co/... or https://i.imgur.com/..."
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-colors font-mono"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: newUrl && !resolved.valid
                      ? '1px solid rgba(251,191,36,0.4)'
                      : '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.9)',
                  }}
                />
              </div>

              {/* Warning for page URLs */}
              {newUrl && !resolved.valid && resolved.hint && (
                <div
                  className="flex items-start gap-2 px-3 py-2.5 rounded-lg"
                  style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}
                >
                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#fbbf24' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  <div>
                    <p className="text-xs font-medium" style={{ color: '#fbbf24' }}>
                      This looks like a page URL, not a direct image URL
                    </p>
                    <p className="text-[11px] mt-0.5" style={{ color: 'rgba(251,191,36,0.7)' }}>
                      {resolved.hint}
                    </p>
                  </div>
                </div>
              )}

              {/* Live preview */}
              {newUrl && (
                <div
                  className="rounded-xl overflow-hidden flex items-center justify-center"
                  style={{ height: 140, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <img
                    src={resolved.previewUrl}
                    alt="preview"
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                        e.target.style.display = 'none'
                        if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'
                    }}
                 />
                  <div
                    className="flex-col items-center gap-2 opacity-30"
                    style={{ display: 'none' }}
                  >
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: '#34d399' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Can't load preview</span>
                  </div>
                </div>
              )}

              {/* Label */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-widest"
                  style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Label
                  <span className="ml-2 normal-case" style={{ color: 'rgba(255,255,255,0.2)' }}>optional</span>
                </label>
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="e.g. Inari profile picture"
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-colors"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.9)' }}
                />
              </div>

              {/* Category */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-widest"
                  style={{ color: 'rgba(255,255,255,0.4)' }}>Category</label>
                <div className="flex gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setNewCategory(cat)}
                      className="flex-1 py-2 rounded-lg text-xs font-medium transition-all"
                      style={{
                        background: newCategory === cat ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.04)',
                        color: newCategory === cat ? '#34d399' : 'rgba(255,255,255,0.4)',
                        border: newCategory === cat ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div
              className="flex items-center justify-end gap-2 px-5 py-4"
              style={{ borderTop: '1px solid rgba(16,185,129,0.1)' }}
            >
              <button
                onClick={() => setShowAdd(false)}
                className="px-4 py-2 rounded-lg text-sm transition-colors"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={!newUrl.trim() || adding}
                className="px-5 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: newUrl.trim() ? 'rgba(16,185,129,0.9)' : 'rgba(16,185,129,0.3)',
                  color: '#fff',
                  cursor: newUrl.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                {adding ? 'Adding...' : 'Add to Vault'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}