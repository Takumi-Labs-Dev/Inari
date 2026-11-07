import { Client, GatewayIntentBits } from 'discord.js'

// Only the intents Waffle actually uses. MessageContent (a privileged intent)
// and GuildMessages were removed because the bot never reads messages.
export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildEmojisAndStickers,
  ],
})
