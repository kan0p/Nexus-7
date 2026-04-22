# syntax=docker/dockerfile:1.6

# ---------- Build stage ----------
FROM node:24-alpine AS builder
WORKDIR /app

COPY package.json ./
COPY package-lock.json* ./
# Use npm install (not ci) to tolerate lockfile drift caused by local
# npm vs container npm version differences.
RUN npm install --no-audit --no-fund

COPY public ./public
COPY src ./src

ENV CI=true
ENV GENERATE_SOURCEMAP=false
ENV DISABLE_ESLINT_PLUGIN=true
# Override the homepage in package.json (gh-pages sets it to /Nexus-7/ which
# breaks when served from nginx at /). Docker build goes to /.
ENV PUBLIC_URL=/
RUN npm run build

# ---------- Runtime stage ----------
FROM nginx:1.27-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
