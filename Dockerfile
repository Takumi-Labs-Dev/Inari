# Waffle: one image that holds the bot, the API and the built dashboard.
# Build from the repo root:  docker compose up --build
# The same image runs on your computer, a VPS or a hosting platform.

# ---- 1) Build the dashboard ------------------------------------------------
FROM node:24-alpine AS dashboard
WORKDIR /dashboard
COPY dashboard/package*.json ./
RUN npm install
COPY dashboard/ ./
# Nothing is set here on purpose: the built dashboard talks to the same address it is served from.
RUN npm run build

# ---- 2) Run the bot --------------------------------------------------------
FROM node:24-alpine
WORKDIR /app

# Build tools, only needed if better-sqlite3 has no prebuilt binary for this platform
RUN apk add --no-cache python3 make g++

COPY bot/package*.json ./
RUN npm install --omit=dev

COPY bot/ ./
COPY --from=dashboard /dashboard/dist /app/dashboard-dist

ENV NODE_ENV=production \
    API_HOST=0.0.0.0 \
    DASHBOARD_DIST=/app/dashboard-dist

RUN mkdir -p /app/data
EXPOSE 3003

# "healthy" once the API answers (the bot has logged in to Discord by then)
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.API_PORT||3003)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "src/index.js"]
