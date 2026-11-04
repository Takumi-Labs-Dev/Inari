import { create } from 'zustand'

const defaultEmbed = {
  title: '',
  description: '',
  color: 5793266, // #5865F2 Discord blurple
  author: { name: '', icon_url: '' },
  footer: { text: '', icon_url: '' },
  thumbnail: { url: '' },
  image: { url: '' },
  fields: [],
  timestamp: null,
}

const asText = (v) => (typeof v === 'string' ? v : '')
const asObject = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v : {})

// Turns ANY object (a saved template, pasted JSON) into a complete, safe embed.
// Missing parts fall back to empty values, so nothing from the previous embed survives.
function normalizeEmbed(raw) {
  const src = asObject(raw)
  const author = asObject(src.author)
  const footer = asObject(src.footer)
  return {
    title: asText(src.title),
    description: asText(src.description),
    color:
      Number.isInteger(src.color) && src.color >= 0 && src.color <= 0xffffff
        ? src.color
        : defaultEmbed.color,
    author: { name: asText(author.name), icon_url: asText(author.icon_url) },
    footer: { text: asText(footer.text), icon_url: asText(footer.icon_url) },
    thumbnail: { url: asText(asObject(src.thumbnail).url) },
    image: { url: asText(asObject(src.image).url) },
    fields: Array.isArray(src.fields)
      ? src.fields
          .filter((f) => f && typeof f === 'object')
          .slice(0, 25)
          .map((f) => ({ name: asText(f.name), value: asText(f.value), inline: f.inline === true }))
      : [],
    timestamp:
      typeof src.timestamp === 'string' && !Number.isNaN(Date.parse(src.timestamp))
        ? src.timestamp
        : null,
  }
}

export const useEmbedStore = create((set) => ({
  // Embed data
  embed: { ...defaultEmbed },

  // Send target
  selectedGuild: null,
  selectedChannel: null,

  // UI state
  guilds: [],
  channels: [],
  emojis: [],
  isSending: false,
  sendStatus: null, // 'success' | 'error' | null

  templates: [],
  setTemplates: (templates) => set({ templates }),

  // Replace the whole embed (used by Templates and JSON import)
  loadEmbed: (raw) => set({ embed: normalizeEmbed(raw) }),

  // Embed updaters
  setEmbed: (key, value) =>
    set((state) => ({ embed: { ...state.embed, [key]: value } })),

  setNestedEmbed: (key, nestedKey, value) =>
    set((state) => ({
      embed: {
        ...state.embed,
        [key]: { ...state.embed[key], [nestedKey]: value },
      },
    })),

  // Fields
  addField: () =>
    set((state) => ({
      embed: {
        ...state.embed,
        fields: [
          ...state.embed.fields,
          { name: '', value: '', inline: false },
        ],
      },
    })),

  updateField: (index, key, value) =>
    set((state) => {
      const fields = [...state.embed.fields]
      fields[index] = { ...fields[index], [key]: value }
      return { embed: { ...state.embed, fields } }
    }),

  removeField: (index) =>
    set((state) => ({
      embed: {
        ...state.embed,
        fields: state.embed.fields.filter((_, i) => i !== index),
      },
    })),

  // Target
  setSelectedGuild: (guild) => set({ selectedGuild: guild, selectedChannel: null, channels: [] }),
  setSelectedChannel: (channel) => set({ selectedChannel: channel }),

  // Data from API
  setGuilds: (guilds) => set({ guilds }),
  setChannels: (channels) => set({ channels }),
  setEmojis: (emojis) => set({ emojis }),

  // Send state
  setIsSending: (val) => set({ isSending: val }),
  setSendStatus: (val) => set({ sendStatus: val }),

  // Reset
  resetEmbed: () => set({ embed: { ...defaultEmbed } }),
}))