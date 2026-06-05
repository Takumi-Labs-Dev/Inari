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