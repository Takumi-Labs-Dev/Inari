import { Client, GatewayIntentBits, Collection } from 'discord.js';
import dotenv from 'dotenv';
import { startAPI } from './routes/api.js';

dotenv.config({ path: '../.env' });

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildEmojisAndStickers,
  ]
});

client.commands = new Collection();

client.once('clientReady', () => {
  console.log(`✅ Inari is online as ${client.user.tag}`);
  startAPI();
});

client.login(process.env.DISCORD_TOKEN);