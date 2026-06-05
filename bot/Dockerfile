FROM node:20-alpine
WORKDIR /app

# Install build tools needed for better-sqlite3
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm install
COPY . .
RUN mkdir -p /app/data
CMD ["node", "src/index.js"]