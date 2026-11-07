<div align="center">

<img src="dashboard/public/assets/waffle/brand/waffle-banner.png" width="70%" alt="Waffle" />

# Waffle

### A cozy Discord embed builder

*Build. Preview. Send.*

---

![Node.js](https://img.shields.io/badge/Node.js-24%20LTS-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Discord.js](https://img.shields.io/badge/Discord.js-v14-5865F2?style=for-the-badge&logo=discord&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![SQLite](https://img.shields.io/badge/Storage-SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)

</div>

---

## ✦ Overview

Waffle is a Discord embed builder with a live web dashboard and a cozy pixel-art look. Design rich embeds visually, preview them in a Discord-style replica, and send them straight to a channel, all without writing code.

Waffle is currently **single-server**: it signs in with Discord OAuth2 and only lets members of the one server set in `DISCORD_GUILD_ID` use the dashboard. A multi-server version is planned.

> Waffle was previously called Inari. Your old `inari.db` is copied to `waffle.db` automatically on first start (the old file is never deleted).

---

## ✦ Features

- **Discord OAuth2 sign-in**, limited to members of your configured server
- **Live preview** with Dark, Light and AMOLED Discord themes
- **Full embed control**: title, description, author, footer, fields, thumbnail, image, color, timestamp
- **Code block inserter** with a language picker
- **Emoji picker** that loads your real server emojis (animated ones too)
- **JSON import / export** for any Discord embed
- **Templates**: save named embed presets and reload them in one click
- **Vault**: keep image URLs with live previews (Profiles, Thumbnails, Images)
- **Color palettes**: Waffle, Berries & Leaves, Cozy Cafe, plus a custom picker
- **Desktop / mobile preview** toggle
- **Direct send**: choose the server and channel, then send
- **Persistent storage** in SQLite (templates and vault survive restarts)
- **Coming soon**: History and Settings pages

---

## ✦ Tech Stack

| Layer     | Tool                       |
| --------- | -------------------------- |
| Runtime   | Node.js 24 LTS             |
| Bot / API | Discord.js v14 + Express 5 |
| Dashboard | React 19 + Vite 8          |
| Styling   | Tailwind CSS v4            |
| Storage   | SQLite (better-sqlite3)    |
| Auth      | Passport + Discord OAuth2  |
| Hosting   | Docker + nginx             |
| Desktop   | Electron                   |

Fonts: [Pixelify Sans](https://fonts.google.com/specimen/Pixelify+Sans) (headings and buttons) and [Nunito](https://fonts.google.com/specimen/Nunito) (body), both loaded from Google Fonts.

---

## ✦ Setup

### Prerequisites

- Node.js 24 (LTS) and Git
- Docker Desktop (optional, only for the Docker route)
- A Discord application with a bot token and OAuth2 enabled

### 1. Clone and create your `.env`

```bash
git clone https://github.com/Takumi-Labs-Dev/Inari.git
cd Inari
cp .env.example .env      # on Windows PowerShell: Copy-Item .env.example .env
```

Open `.env` and fill in every `your_..._here` value. `.env.example` explains each one.

### 2. Add the OAuth2 redirect in the Discord Developer Portal

Your application → OAuth2 → Redirects → add exactly the value of `REDIRECT_URI`, for example:

```
http://localhost:3003/auth/callback
```

### 3. Run with Node (no Docker)

```bash
cd dashboard
npm install
npm run build
cd ../bot
npm install
npm start
```

Open http://localhost:3003 and click **Sign in with Discord**.

### 3b. Or run with Docker

```bash
cd dashboard
npm install
npm run build
cd ..
docker compose up --build
```

The bot serves the dashboard at http://localhost:3003.

### Desktop app (Electron)

```bash
cd dashboard
npm run electron:dev      # development: starts Vite and opens the window
npm run electron:build    # builds the Windows installer into dashboard/release
```

The packaged app opens `http://localhost:3003`, so the bot must be running first.

---

## ✦ Project Structure

```text
├── bot/                  # Discord bot + REST API
│   ├── src/
│   │   ├── index.js      # Entry point
│   │   ├── env.js        # .env loading and checks
│   │   ├── client.js     # Discord client
│   │   ├── db.js         # SQLite setup (waffle.db)
│   │   └── routes/
│   │       ├── api.js    # Express API + dashboard static files
│   │       └── auth.js   # Discord OAuth2 + session
│   └── Dockerfile
│
├── dashboard/            # React dashboard
│   ├── public/assets/    # Pixel-art assets (waffle/...) and icon.ico
│   ├── src/              # components, pages, store, api client
│   ├── electron.cjs      # Electron main process
│   └── Dockerfile
│
├── docker-compose.yml
└── .env
```

---

## ✦ Version

**Current Version:** `0.1.0-beta`

---

## ✦ License

Private. All rights reserved © Takumi Labs
