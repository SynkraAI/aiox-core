# ============================================================
# AIOS Lovable MCP - Simplified Build (No Workspace Issues)
# Build timestamp: 2026-02-23T08:15:00Z - Force clean rebuild (cache bust)
# ============================================================

# Stage 1: Build dependencies in isolation
FROM node:22-alpine as builder

WORKDIR /workspace

# Copy root package files
COPY package.json package-lock.json ./
RUN npm install --prefer-offline --no-audit

# Copy source files
COPY packages/aios-lovable-mcp ./packages/aios-lovable-mcp

# Install workspace package and build
WORKDIR /workspace/packages/aios-lovable-mcp
RUN npm install --prefer-offline --no-audit && npm run build

# Stage 2: Runtime
FROM node:22-alpine

WORKDIR /app

# Copy package files from aios-lovable-mcp
COPY packages/aios-lovable-mcp/package*.json ./

# Install production dependencies only (not dev dependencies)
RUN npm install --production --prefer-offline --no-audit

# Copy built files
COPY --from=builder /workspace/packages/aios-lovable-mcp/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S app -u 1001
USER app

# Environment
ENV PORT=3000
ENV NODE_ENV=production

# Start server
CMD ["node", "dist/start-with-http.js"]
