import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3003',
  withCredentials: true, // required for session cookies
})

export const getGuilds = () => api.get('/guilds')
export const getChannels = (guildId) => api.get(`/guilds/${guildId}/channels`)
export const getEmojis = (guildId) => api.get(`/guilds/${guildId}/emojis`)
export const sendEmbed = (data) => api.post('/send-embed', data)
export const getTemplates = () => api.get('/templates')
export const getTemplate = (id) => api.get(`/templates/${id}`)
export const createTemplate = (data) => api.post('/templates', data)
export const updateTemplate = (id, data) => api.put(`/templates/${id}`, data)
export const deleteTemplate = (id) => api.delete(`/templates/${id}`)
export const getVault = () => api.get('/vault')
export const addVaultItem = (data) => api.post('/vault', data)
export const deleteVaultItem = (id) => api.delete(`/vault/${id}`)
export const updateVaultItem = (id, data) => api.patch(`/vault/${id}`, data)

// Auth
export const getMe = () => api.get('/auth/me')
export const logout = () => api.get('/auth/logout')