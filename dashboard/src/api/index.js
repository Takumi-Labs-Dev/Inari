import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3003',
  withCredentials: true, // required for session cookies
})

// Servers the signed-in person manages (each says whether Waffle is in it)
export const getGuilds = () => api.get('/guilds')
// Link that adds Waffle to a server
export const getInvite = () => api.get('/invite')

// Everything below belongs to one server, so it needs that server's id
export const getChannels = (guildId) => api.get(`/guilds/${guildId}/channels`)
export const getEmojis = (guildId) => api.get(`/guilds/${guildId}/emojis`)
export const sendEmbed = (guildId, data) => api.post(`/guilds/${guildId}/send-embed`, data)

export const getTemplates = (guildId) => api.get(`/guilds/${guildId}/templates`)
export const getTemplate = (guildId, id) => api.get(`/guilds/${guildId}/templates/${id}`)
export const createTemplate = (guildId, data) => api.post(`/guilds/${guildId}/templates`, data)
export const updateTemplate = (guildId, id, data) => api.put(`/guilds/${guildId}/templates/${id}`, data)
export const deleteTemplate = (guildId, id) => api.delete(`/guilds/${guildId}/templates/${id}`)

export const getVault = (guildId) => api.get(`/guilds/${guildId}/vault`)
export const addVaultItem = (guildId, data) => api.post(`/guilds/${guildId}/vault`, data)
export const deleteVaultItem = (guildId, id) => api.delete(`/guilds/${guildId}/vault/${id}`)
export const updateVaultItem = (guildId, id, data) => api.patch(`/guilds/${guildId}/vault/${id}`, data)

// Auth
export const getMe = () => api.get('/auth/me')
export const logout = () => api.get('/auth/logout')

// Turns an API error into a sentence for the screen
export const errorMessage = (err, fallback = 'Something went wrong. Please try again.') =>
  err?.response?.data?.error || fallback
