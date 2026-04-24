# syntax=docker/dockerfile:1.7
# Tocks Tracking — single-stage Alpine image
# Deploy target: Railway / Fly.io / any container runtime

FROM node:20-alpine

WORKDIR /app

# Install system deps for native modules (bcrypt etc. not used here, but
# @supabase/supabase-js pulls optional deps that benefit from libc presence)
RUN apk add --no-cache dumb-init

# Copy manifests first for better layer caching
COPY package.json ./
COPY package-lock.json* ./

# Install prod deps (dev deps only needed for tsc build below)
RUN npm install --include=dev --no-audit --no-fund

# Copy source
COPY tsconfig.json ./
COPY src ./src

# Build
RUN npm run build

# Prune dev deps after build to slim image
RUN npm prune --omit=dev

# Non-root user
RUN addgroup -S tocks && adduser -S tocks -G tocks
USER tocks

EXPOSE 3100

# dumb-init handles PID 1 responsibilities (signal forwarding, zombie reaping)
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
