import { useEmbedStore } from '../../store/embedStore'
import Input from './Input'
import Textarea from './Textarea'

export default function FieldsBuilder() {
  const { embed, addField, updateField, removeField } = useEmbedStore()
  const { fields } = embed

  return (
    <div className="flex flex-col gap-3">
      {fields.map((field, i) => (
        <div key={i} className="bg-obsidian-800 border border-obsidian-600 rounded-xl p-3 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-obsidian-300">
              Field {i + 1}
            </span>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs text-obsidian-300">Inline</span>
                <div
                  onClick={() => updateField(i, 'inline', !field.inline)}
                  className={`w-8 h-4 rounded-full transition-colors cursor-pointer relative ${
                    field.inline ? 'bg-jade-600' : 'bg-obsidian-600'
                  }`}
                >
                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${
                    field.inline ? 'left-4' : 'left-0.5'
                  }`} />
                </div>
              </label>
              <button
                onClick={() => removeField(i)}
                className="text-obsidian-400 hover:text-red-400 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <Input
            label="Name"
            placeholder="Field name"
            value={field.name}
            onChange={(v) => updateField(i, 'name', v)}
            maxLength={256}
          />
          <Textarea
            label="Value"
            placeholder="Field value"
            value={field.value}
            onChange={(v) => updateField(i, 'value', v)}
            maxLength={1024}
            rows={2}
            showToolbar
          />
        </div>
      ))}

      {fields.length < 25 && (
        <button
          onClick={addField}
          className="flex items-center justify-center gap-2 py-2.5 border border-dashed
            border-obsidian-600 rounded-xl text-sm text-obsidian-400 hover:text-jade-400
            hover:border-jade-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add field
        </button>
      )}
    </div>
  )
}