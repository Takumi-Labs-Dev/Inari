import { useEmbedStore } from '../../store/embedStore'
import Input from './Input'
import Textarea from './Textarea'

export default function FieldsBuilder() {
  const { embed, addField, updateField, removeField } = useEmbedStore()
  const { fields } = embed

  return (
    <div className="flex flex-col gap-3">
      {fields.map((field, i) => (
        <div key={i} className="bg-cream-50 border border-cream-300 rounded-xl p-3 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-cocoa-600">
              Field {i + 1}
            </span>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs text-cocoa-600">Inline</span>
                <div
                  onClick={() => updateField(i, 'inline', !field.inline)}
                  className={`w-8 h-4 rounded-full transition-colors cursor-pointer relative ${
                    field.inline ? 'bg-honey-500' : 'bg-cream-300'
                  }`}
                >
                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${
                    field.inline ? 'left-4' : 'left-0.5'
                  }`} />
                </div>
              </label>
              <button
                onClick={() => removeField(i)}
                className="text-cocoa-500 hover:text-berry-500 transition-colors"
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
            border-cream-300 rounded-xl text-sm text-cocoa-500 hover:text-toast-700
            hover:border-caramel-600 transition-colors"
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
