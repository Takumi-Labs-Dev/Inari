import EmojiPicker from './EmojiPicker'
import CodeBlockInserter from './CodeBlockInserter'
import JsonTools from './JsonTools'

export default function Toolbar({ onInsertText }) {
  return (
    <div className="flex items-center gap-2 flex-wrap px-4 py-2.5 border-b border-obsidian-700 bg-obsidian-950">
      <CodeBlockInserter onInsert={onInsertText} />
      <div className="w-px h-4 bg-obsidian-700" />
      <EmojiPicker onInsert={onInsertText} />
      <div className="w-px h-4 bg-obsidian-700" />
      <JsonTools />
    </div>
  )
}