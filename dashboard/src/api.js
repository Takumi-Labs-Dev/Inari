import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
});

export const getGuilds = () => api.get('/guilds');
export const getChannels = (guildId) => api.get(`/guilds/${guildId}/channels`);
export const getEmojis = (guildId) => api.get(`/guilds/${guildId}/emojis`);
export const sendEmbed = (data) => api.post('/send-embed', data);