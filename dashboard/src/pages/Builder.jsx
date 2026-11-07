import { useRef } from 'react'
import { useEmbedStore } from '../store/embedStore'
import EditorPanel from '../components/editor/EditorPanel'
import DiscordPreview from '../components/preview/DiscordPreview'
import SendBar from '../components/preview/SendBar'
import Toolbar from '../components/editor/Toolbar'

export default function Builder() {
  const { embed, setEmbed } = useEmbedStore()

  const handleInsertText = (text) => {
    const current = embed.description || ''
    setEmbed('description', current + text)
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex flex-1 min-h-0">

        {/* Editor — scrollable column */}
        <div className="w-[420px] flex-shrink-0 border-r border-cream-300 flex flex-col min-h-0">
          <div className="px-4 py-3 border-b border-cream-300 flex-shrink-0">
            <h1 className="font-pixel text-base font-semibold text-cocoa-900">Embed editor</h1>
            <p className="text-xs text-cocoa-500 mt-0.5">Changes reflect instantly in the preview</p>
          </div>
          <div className="flex-shrink-0">
            <Toolbar onInsertText={handleInsertText} />
          </div>
          {/* This div scrolls — sections expand freely inside it */}
          <div className="flex-1 overflow-y-auto min-h-0 p-4">
            <EditorPanel />
          </div>
        </div>

        {/* Preview — scrollable independently */}
        <div className="flex-1 flex flex-col min-h-0">
          <DiscordPreview />
        </div>

      </div>
      <SendBar />
    </div>
  )
}
