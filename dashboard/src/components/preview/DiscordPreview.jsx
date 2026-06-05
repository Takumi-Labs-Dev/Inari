import { useState } from 'react'
import { useEmbedStore } from '../../store/embedStore'

function intToHex(int) {
  if (!int) return '#1d9bf0'
  return '#' + int.toString(16).padStart(6, '0')
}

function renderMarkdown(text) {
  if (!text) return ''
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code style="background:rgba(0,0,0,0.3);padding:1px 4px;border-radius:3px;font-size:12px;font-family:monospace">$1</code>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" style="color:#00aff4">$1</a>')
    .replace(/\n/g, '<br/>')
}

function formatTimestamp(ts) {
  if (!ts) return ''
  return new Date(ts).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  })
}

const THEMES = {
  dark:  { bg: '#313338', embedBg: '#2b2d31', text: '#dbdee1', muted: '#949ba4', name: 'Dark' },
  light: { bg: '#ffffff', embedBg: '#f2f3f5', text: '#2e3338', muted: '#5c5e66', name: 'Light' },
  amoled: { bg: '#000000', embedBg: '#111214', text: '#dbdee1', muted: '#72767d', name: 'AMOLED' },
}

export default function DiscordPreview() {
  const { embed } = useEmbedStore()
  const [theme, setTheme] = useState('dark')
  const [viewport, setViewport] = useState('desktop')
  const [themeOpen, setThemeOpen] = useState(false)
  const accentColor = intToHex(embed.color)
  const t = THEMES[theme]

  const hasContent =
    embed.title || embed.description || embed.author?.name ||
    embed.footer?.text || embed.fields?.length > 0 ||
    embed.image?.url || embed.thumbnail?.url

  return (
    <div className="flex flex-col h-full min-h-0">

      {/* Preview toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(16,185,129,0.1)', background: 'rgba(13,20,18,0.8)' }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em' }}>
            Live preview
          </span>
        </div>

        <div className="flex items-center gap-2">

          {/* Theme selector */}
          <div className="relative">
            <button
              onClick={() => setThemeOpen(!themeOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}
            >
              Preview: {t.name}
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {themeOpen && (
              <div className="absolute right-0 top-full mt-1 rounded-lg overflow-hidden z-50 w-32"
                style={{ background: '#0d1412', border: '1px solid rgba(16,185,129,0.15)' }}>
                {Object.entries(THEMES).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => { setTheme(key); setThemeOpen(false) }}
                    className="w-full text-left px-3 py-2 text-xs transition-colors hover:bg-white/5"
                    style={{ color: theme === key ? '#34d399' : 'rgba(255,255,255,0.5)' }}
                  >
                    {val.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Desktop / Mobile toggle */}
          <div className="flex rounded-lg overflow-hidden"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
            {['desktop', 'mobile'].map((v) => (
              <button
                key={v}
                onClick={() => setViewport(v)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs capitalize transition-colors"
                style={{
                  background: viewport === v ? 'rgba(16,185,129,0.15)' : 'transparent',
                  color: viewport === v ? '#34d399' : 'rgba(255,255,255,0.4)',
                }}
              >
                {v === 'desktop' ? (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                  </svg>
                )}
                {v}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Discord preview area with glow */}
      <div className="flex-1 overflow-y-auto relative min-h-0"
        style={{ background: t.bg }}>

        {/* Ambient glow — only in dark themes */}
        {theme !== 'light' && (
          <div className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 60% 40% at 70% 80%, rgba(16,185,129,0.06) 0%, transparent 70%)',
            }}
          />
        )}

        <div className={`relative p-6 ${viewport === 'mobile' ? 'max-w-sm mx-auto' : ''}`}>
          {!hasContent ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 opacity-40">
              <svg className="w-10 h-10" style={{ color: t.muted }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.25}
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <p className="text-sm font-medium" style={{ color: t.muted }}>
                Start typing to preview your embed
              </p>
              <p className="text-xs" style={{ color: t.muted, opacity: 0.6 }}>
                Your changes will appear here instantly
              </p>
            </div>
          ) : (
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm"
                style={{ background: 'rgba(16,185,129,0.2)', color: '#34d399' }}>
                稲
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-semibold text-sm" style={{ color: t.text }}>Inari</span>
                  <span className="text-[10px] font-bold px-1 py-0.5 rounded-sm"
                    style={{ background: '#5865f2', color: '#fff' }}>APP</span>
                  <span className="text-xs" style={{ color: t.muted }}>
                    Today at {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </span>
                </div>

                {/* Embed */}
                <div className="rounded-r-md overflow-hidden"
                  style={{
                    borderLeft: `4px solid ${accentColor}`,
                    background: t.embedBg,
                    maxWidth: viewport === 'mobile' ? '100%' : '520px',
                  }}>
                  <div className="p-4 flex gap-4">
                    <div className="flex-1 min-w-0 flex flex-col gap-2">

                      {embed.author?.name && (
                        <div className="flex items-center gap-2">
                          {embed.author.icon_url && (
                            <img src={embed.author.icon_url} className="w-5 h-5 rounded-full" alt="" />
                          )}
                          <span className="text-xs font-semibold" style={{ color: t.text }}>
                            {embed.author.name}
                          </span>
                        </div>
                      )}

                      {embed.title && (
                        <div className="font-semibold text-sm leading-snug" style={{ color: '#00aff4' }}>
                          {embed.title}
                        </div>
                      )}

                      {embed.description && (
                        <div className="text-sm leading-relaxed"
                          style={{ color: t.text }}
                          dangerouslySetInnerHTML={{ __html: renderMarkdown(embed.description) }}
                        />
                      )}

                      {embed.fields?.length > 0 && (
                        <div className="grid gap-2 mt-1"
                          style={{ gridTemplateColumns: embed.fields.some(f => f.inline) ? 'repeat(auto-fill,minmax(120px,1fr))' : '1fr' }}>
                          {embed.fields.map((field, i) => (
                            (field.name || field.value) ? (
                              <div key={i} className={field.inline ? '' : 'col-span-full'}>
                                {field.name && <div className="text-xs font-semibold mb-0.5" style={{ color: t.text }}>{field.name}</div>}
                                {field.value && (
                                  <div className="text-xs leading-relaxed" style={{ color: t.muted }}
                                    dangerouslySetInnerHTML={{ __html: renderMarkdown(field.value) }} />
                                )}
                              </div>
                            ) : null
                          ))}
                        </div>
                      )}

                      {embed.image?.url && (
                        <img src={embed.image.url} alt="" className="rounded-md mt-1 max-w-full"
                          onError={(e) => e.target.style.display = 'none'} />
                      )}

                      {(embed.footer?.text || embed.timestamp) && (
                        <div className="flex items-center gap-2 mt-1">
                          {embed.footer?.icon_url && (
                            <img src={embed.footer.icon_url} className="w-4 h-4 rounded-full" alt="" />
                          )}
                          <span className="text-xs" style={{ color: t.muted }}>
                            {embed.footer?.text}
                            {embed.footer?.text && embed.timestamp && ' • '}
                            {embed.timestamp && formatTimestamp(embed.timestamp)}
                          </span>
                        </div>
                      )}
                    </div>

                    {embed.thumbnail?.url && (
                      <div className="flex-shrink-0">
                        <img src={embed.thumbnail.url} alt=""
                          className="w-16 h-16 rounded-md object-cover"
                          onError={(e) => e.target.style.display = 'none'} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}