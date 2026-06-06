<div align="center">

<img src="dashboard/public/assets/Icon.png" width="30%" />

# 稲 ¦ Inari

### Discord Embed Builder & Dashboard

*Build. Preview. Perfect.*

---

![Node.js](https://img.shields.io/badge/Node.js-LTS-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Discord.js](https://img.shields.io/badge/Discord.js-v14-5865F2?style=for-the-badge&logo=discord&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![SQLite](https://img.shields.io/badge/Storage-SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)

</div>

---

## ✦ Overview

Inari is a self-hosted Discord embed builder with a live web dashboard. Design rich embeds visually, preview them in an accurate Discord replica, and send them directly to any channel — all without touching a single line of code. Access is gated behind Discord OAuth2 — only members of your server can log in.

---

## ✦ Screenshots

<div align="center">

**Home**
<img src="https://res.cloudinary.com/didnxcljf/image/upload/v1780713253/Home_Preview_smhef3.png" width="100%" />

**Embed Builder**
<img src="https://res.cloudinary.com/didnxcljf/image/upload/v1780713275/EmbedBuilder_Preview_flz8ym.png" width="100%" />

**Color Palettes**
<img src="https://res.cloudinary.com/didnxcljf/image/upload/v1780713289/ColorPalettes_Preview_tdotvn.png" width="100%" />

**Vault**
<img src="https://res.cloudinary.com/didnxcljf/image/upload/v1780713388/Vault_Preview_qun62c.png" width="100%" />

</div>

---

## ✦ Features

- **✦ Discord OAuth2 Login** — Secure login with Discord, restricted to members of your server
- **✦ Live Preview** — Accurate Discord embed rendering updates as you type, with Dark, Light, and AMOLED theme support
- **✦ Full Embed Control** — Title, description, author, footer, fields, thumbnail, image, color, and timestamp
- **✦ Code Block Inserter** — One-click code block with language selector (js, py, ts, bash, json, and more)
- **✦ Emoji Picker** — Loads your real server emojis with animated GIF support and one-click insert
- **✦ JSON Import / Export** — Paste any Discord embed JSON to load it, or export your current embed
- **✦ Templates** — Save named embed presets and reload them in one click
- **✦ Vault** — Store image URLs with live previews organized by Profiles, Thumbnails, and Images
- **✦ Desktop / Mobile Preview** — Toggle viewport to catch layout issues before sending
- **✦ Direct Send** — Select server and channel from the dashboard and send instantly
- **✦ Persistent Storage** — Templates and Vault survive restarts via SQLite

---

## ✦ Dashboard

- **✦ Obsidian × Jade Theme** — Premium dark UI with jade/emerald accents
- **✦ Builder** — Full embed editor with live Discord preview
- **✦ Templates** — Save, load, and manage reusable embed designs
- **✦ Vault** — Image URL library with visual preview cards
- **✦ History** — Coming soon
- **✦ Settings** — Coming soon

---

## ✦ Tech Stack

| Layer      | Tool                    |
| ---------- | ----------------------- |
| Runtime    | Node.js LTS             |
| Bot        | Discord.js v14          |
| Dashboard  | React 19 + Vite 8       |
| Styling    | Tailwind CSS v4         |
| Storage    | SQLite (better-sqlite3) |
| API        | Express.js v5           |
| Auth       | Passport + Discord OAuth2 |
| Hosting    | Docker + nginx          |
| Desktop    | Electron                |
| Editor     | Visual Studio Code      |

---

## ✦ Setup

### Prerequisites

- Node.js 18+
- Docker Desktop
- A Discord bot token + application with OAuth2 enabled

### 1. Clone the repo

```bash
git clone https://github.com/Takumi-Labs-Dev/Inari.git
cd Inari
```

### 2. Create your `.env` file

```env
# Bot
DISCORD_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=your_application_id_here
DISCORD_GUILD_ID=your_server_id_here

# API
API_PORT=3003

# Dashboard
VITE_API_URL=http://localhost:3003

# Auth
DISCORD_CLIENT_SECRET=your_client_secret_here
SESSION_SECRET=your_random_secret_here
REDIRECT_URI=http://localhost:3003/auth/callback
```

### 3. Add OAuth2 redirect URI in Discord Developer Portal

Go to your application → OAuth2 → Redirects → add:
http://localhost:3003/auth/callback

### 4. Build the dashboard

```bash
cd dashboard
npm install
npm run build
cd ..
```

### 5. Start with Docker

```bash
docker compose up --build
```

### 6. Open the dashboard

http://localhost:3003

### 7. Log in with Discord

Click **Login with Discord** — only members of your configured guild will be granted access.

---

## ✦ Desktop App

A Windows desktop app is available from the [Releases](https://github.com/Takumi-Labs-Dev/Inari/releases) page.

> Docker must be running and `docker compose up` must be started before launching the desktop app.
> The exe connects to `localhost:3003` where the bot serves the dashboard.

---

## ✦ How It Works
User logs in with Discord OAuth2
↓
Guild membership verified
↓
Dashboard loads → Design embed visually
↓
Live preview updates in real time
↓
Select server + channel → Click Send
↓
Inari bot delivers embed to Discord

---

## ✦ Project Structure

```text
inari/
├── bot/                  # Discord bot + REST API
│   ├── src/
│   │   ├── index.js      # Bot entry point
│   │   ├── db.js         # SQLite setup
│   │   └── routes/
│   │       ├── api.js    # Express API + static file serving
│   │       └── auth.js   # Discord OAuth2 + session
│   └── Dockerfile
│
├── dashboard/            # React web dashboard
│   ├── src/
│   │   ├── components/   # Editor, preview, layout, AuthGuard
│   │   ├── pages/        # Builder, Templates, Vault, Login
│   │   ├── store/        # Zustand state
│   │   └── api/          # API client
│   ├── electron.cjs      # Electron main process
│   └── Dockerfile
│
├── docker-compose.yml
└── .env
```

---

## ✦ System Highlights

| Feature           | Description                                        |
| ----------------- | -------------------------------------------------- |
| Discord OAuth2    | Login gate with guild membership verification      |
| Live Preview      | Accurate Discord embed replica with theme toggle   |
| Vault             | Image URL library with proxy-free previews         |
| Templates         | SQLite-backed named embed presets                  |
| Emoji Picker      | Real server emojis including animated GIFs         |
| Direct Send       | Send to any channel without leaving the UI         |
| Desktop App       | Electron wrapper loading from localhost:3003       |
| Zero Config Send  | No bot commands needed — pure dashboard control    |

---

## ✦ Version

**Current Version:** `0.1.0-beta`

---

## ✦ License

Private — All rights reserved © Takumi Labs
