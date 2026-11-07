// Where the Waffle API lives.
//  - Built dashboard (served by the bot, or inside Docker): same address as the page.
//  - Running "npm run dev" (Vite on port 5173): the bot on localhost:3003.
//  - VITE_API_URL overrides both (set it at build time, an empty value means same address).
export const API_URL =
  import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? 'http://localhost:3003' : '')
