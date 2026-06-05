import { useEmbedStore } from '../../store/embedStore'
import Input from './Input'
import Textarea from './Textarea'
import Section from './Section'
import ColorPicker from './ColorPicker'
import FieldsBuilder from './FieldsBuilder'

export default function EditorPanel() {
  const { embed, setEmbed, setNestedEmbed } = useEmbedStore()

  return (
    <div className="flex flex-col gap-3 pb-4">

      <Section title="Embed color">
        <ColorPicker
          value={embed.color}
          onChange={(v) => setEmbed('color', v)}
        />
      </Section>

      <Section title="Author" optional defaultOpen={false}>
        <Input
          label="Author name"
          placeholder="Your name or bot name"
          value={embed.author.name}
          onChange={(v) => setNestedEmbed('author', 'name', v)}
          maxLength={256}
        />
        <Input
          label="Author icon URL"
          placeholder="https://..."
          value={embed.author.icon_url}
          onChange={(v) => setNestedEmbed('author', 'icon_url', v)}
        />
      </Section>

      <Section title="Content">
        <Input
          label="Title"
          placeholder="Embed title"
          value={embed.title}
          onChange={(v) => setEmbed('title', v)}
          maxLength={256}
        />
        <Textarea
          label="Description"
          placeholder="Supports **markdown** — bold, *italic*, `code`, [links](url)..."
          value={embed.description}
          onChange={(v) => setEmbed('description', v)}
          maxLength={4096}
          rows={6}
        />
      </Section>

      <Section title="Fields" optional defaultOpen={false}>
        <FieldsBuilder />
      </Section>

      <Section title="Images" optional defaultOpen={false}>
        <Input
          label="Thumbnail URL"
          placeholder="https://... (small image top-right)"
          value={embed.thumbnail.url}
          onChange={(v) => setNestedEmbed('thumbnail', 'url', v)}
        />
        <Input
          label="Image URL"
          placeholder="https://... (large image below description)"
          value={embed.image.url}
          onChange={(v) => setNestedEmbed('image', 'url', v)}
        />
      </Section>

      <Section title="Footer" optional defaultOpen={false}>
        <Input
          label="Footer text"
          placeholder="Footer text"
          value={embed.footer.text}
          onChange={(v) => setNestedEmbed('footer', 'text', v)}
          maxLength={2048}
        />
        <Input
          label="Footer icon URL"
          placeholder="https://..."
          value={embed.footer.icon_url}
          onChange={(v) => setNestedEmbed('footer', 'icon_url', v)}
        />
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => setEmbed('timestamp', embed.timestamp ? null : new Date().toISOString())}
            className={`w-9 h-5 rounded-full transition-colors relative ${
              embed.timestamp ? 'bg-jade-600' : 'bg-obsidian-600'
            }`}
          >
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${
              embed.timestamp ? 'left-4' : 'left-0.5'
            }`} />
          </div>
          <span className="text-sm text-obsidian-200">Show timestamp</span>
        </label>
      </Section>

    </div>
  )
}