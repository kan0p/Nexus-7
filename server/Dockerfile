# syntax=docker/dockerfile:1.6
FROM node:24-alpine AS base
WORKDIR /app

# better-sqlite3 builds a native addon; we need python/make/g++ and sqlite headers.
RUN apk add --no-cache python3 make g++ sqlite

COPY package.json ./
RUN npm install --omit=dev

COPY index.js ./

ENV NODE_ENV=production
ENV PORT=3001
ENV DB_PATH=/data/nexus7.db

EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=3s --start-period=8s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3001/api/health >/dev/null || exit 1

CMD ["node", "index.js"]
