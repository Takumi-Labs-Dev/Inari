FROM node:24-alpine
WORKDIR /app

# Build tools, only needed if better-sqlite3 has no prebuilt binary for this platform
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm install --omit=dev
COPY . .
RUN mkdir -p /app/data
CMD ["node", "src/index.js"]
