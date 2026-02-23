# Deployment Guide: AIOS Lovable MCP Server

## 📋 Overview

This guide covers deploying the AIOS Lovable MCP Server to Railway for production use with Lovable AI.

**Architecture:**
- MCP Server (stdio transport) - Primary agent interface
- REST API (Express) - Job management & webhooks
- Redis Queue - Async job processing
- SSE Streaming - Real-time updates to Lovable

---

## 🚀 Quick Start: Railway Deployment

### Prerequisites
- Railway account (https://railway.app)
- GitHub repository with code
- Git CLI

### Step 1: Create Railway Project

```bash
# Login to Railway
railway login

# Create new project
railway init

# Name your project: "aios-lovable-mcp"
```

### Step 2: Add Redis Plugin

```bash
# Add Redis to your project
railway add redis
```

This automatically creates `REDIS_HOST` and `REDIS_PORT` environment variables.

### Step 3: Deploy from GitHub

**Option A: Via Railway CLI**
```bash
# Deploy current directory
railway up --service aios-lovable-mcp
```

**Option B: Via Railway Dashboard**
1. Go to https://railway.app/dashboard
2. Click "New Project" → "Deploy from GitHub"
3. Select this repository
4. Select `packages/aios-lovable-mcp` as root directory
5. Click "Deploy"

### Step 4: Configure Environment Variables

In Railway Dashboard, go to **Variables** and add:

```env
# Required
AIOS_API_KEYS={"lovable":"your_api_key_here"}
ADMIN_API_KEY=your_admin_secret_key

# Optional (defaults shown)
NODE_ENV=production
QUEUE_CONCURRENCY=10
PORT=3000
REDIS_URL=redis://redis:6379  # Auto-set by Railway Redis plugin
```

### Step 5: Configure Networking

1. Go to **Settings** → **Networking**
2. Enable **Public URL** - you'll get a URL like `https://aios-lovable-mcp-prod.railway.app`
3. This is your **MCP Server URL** for Lovable integration

---

## 🔧 Environment Variables

### Core Settings
| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `production` | Node environment |
| `PORT` | `3000` | HTTP server port |
| `QUEUE_CONCURRENCY` | `5` | Max parallel jobs |

### Redis Configuration
| Variable | Description |
|----------|-------------|
| `REDIS_HOST` | Redis hostname (set by Railway) |
| `REDIS_PORT` | Redis port (set by Railway) |
| `REDIS_URL` | Full Redis connection string (optional) |

### API & Security
| Variable | Description | Example |
|----------|-------------|---------|
| `AIOS_API_KEYS` | API keys for authentication | `{"lovable":"aios_..."}`  |
| `ADMIN_API_KEY` | Secret for admin endpoints | `admin_secret_12345` |

### Webhook & Logging
| Variable | Default | Description |
|----------|---------|-------------|
| `WEBHOOK_TIMEOUT_MS` | `10000` | Webhook request timeout |
| `LOG_LEVEL` | `info` | Logging level |
| `SENTRY_DSN` | (optional) | Error tracking (Sentry) |

---

## 🔑 Generating API Keys

### Development
```bash
# Generate a local dev key
npm run dev

# In another terminal:
curl -X POST http://localhost:3000/api/admin/keys \
  -H "Content-Type: application/json" \
  -d '{"name":"my-app","requests_per_minute":100}' \
  -G -d "admin_key=admin_secret_key_12345"
```

### Production
```bash
# Via Railway logs or SSH:
railway shell

# Then run Node:
node -e "
const {apiKeyManager} = require('./dist/services/api-keys.js');
const key = apiKeyManager.generateKey('lovable', 100);
console.log('Generated key:', key);
"
```

Or use the REST endpoint:
```bash
curl -X POST https://your-railway-url/api/admin/keys \
  -H "Content-Type: application/json" \
  -d '{"name":"lovable","requests_per_minute":100}' \
  -G -d "admin_key=$ADMIN_API_KEY"
```

---

## 📡 Integrating with Lovable

### 1. Get Your MCP Server URL

In Railway Dashboard → **Deployments** → Copy the **Public URL**

```
https://aios-lovable-mcp-prod.railway.app
```

### 2. Configure Lovable Settings

In Lovable app settings:
1. Go to **Settings** → **MCP Servers**
2. Click **Add MCP Server**
3. **Name**: `AIOS Orchestration`
4. **Type**: `REST API`
5. **Base URL**: `https://your-railway-url`
6. **API Key**: Use the key generated above
7. Click **Save**

### 3. Test Connection

```bash
# From Lovable or terminal:
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://your-railway-url/health
```

Expected response:
```json
{
  "status": "healthy",
  "uptime": 3600.5,
  "timestamp": "2026-02-22T15:30:00Z"
}
```

---

## 🛠️ Local Development

### Option 1: Docker Compose (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f aios-mcp

# Stop all services
docker-compose down
```

Access:
- MCP Server: `stdio` (via `npm run dev`)
- HTTP API: `http://localhost:3000`
- Redis: `localhost:6379`

### Option 2: Manual Setup

```bash
# Install dependencies
npm install

# Start Redis (in separate terminal)
redis-server

# Build TypeScript
npm run build

# Start development server
npm run dev

# Test in another terminal
curl http://localhost:3000/health
```

---

## 📊 Monitoring & Logs

### Railway Logs
```bash
railway logs -f
```

Look for:
- `[HTTP Server]` - REST API messages
- `[Queue]` - Job queue events
- `[Webhook]` - Webhook delivery status
- `[MCP Server]` - MCP protocol events

### Key Metrics to Monitor
| Metric | Good | Warning | Critical |
|--------|------|---------|----------|
| Response Time | <500ms | 500-2000ms | >2000ms |
| Job Queue Depth | <100 | 100-1000 | >1000 |
| Error Rate | <1% | 1-5% | >5% |
| Memory Usage | <200MB | 200-400MB | >400MB |

### Health Check
```bash
# Continuous monitoring
while true; do
  curl -s https://your-railway-url/health | jq .
  sleep 30
done
```

---

## 🔄 Scaling & Performance

### Auto-Scaling
Railway automatically scales based on:
- CPU usage (scales up at >80%)
- Memory usage (scales up at >80%)
- Incoming traffic

### Tuning
Adjust in environment variables:
```env
# Increase job concurrency for more parallel processing
QUEUE_CONCURRENCY=20

# Increase rate limits
# (edit api-keys.ts or via API)
```

### Caching
Job results are cached in Redis with TTL:
- Completed jobs: 1 hour
- Failed jobs: 24 hours
- Queue state: Real-time

---

## 🚨 Troubleshooting

### Connection Issues
```bash
# Check Redis connection
curl -H "Authorization: Bearer YOUR_KEY" \
  https://your-url/api/jobs -X POST \
  -H "Content-Type: application/json" \
  -d '{"tool":"aios_strategize","input":{"product_name":"Test"}}'

# Should return: 202 Accepted with job_id
```

### Rate Limiting
If you see `429 Too Many Requests`:
1. Wait for rate limit window to reset
2. Contact admin to increase limits
3. Generate new API key with higher limits

### Job Timeouts
Default timeouts:
- Strategize: 10 minutes
- Design UX: 8 minutes
- Architecture: 5 minutes
- Code Gen: 15 minutes

Adjust in adapters or via environment variables.

### High Memory Usage
```bash
# Check memory stats
railway stats

# Reduce QUEUE_CONCURRENCY if needed
railway set QUEUE_CONCURRENCY=3
```

---

## 🔐 Security Best Practices

### 1. API Key Rotation
```bash
# Revoke old key
railway shell
node -e "
const {apiKeyManager} = require('./dist/services/api-keys.js');
apiKeyManager.revokeKey('old_key_here');
"

# Generate new key
apiKeyManager.generateKey('lovable', 100)
```

### 2. Environment Secrets
- Never commit `.env` files
- Use Railway Secrets for sensitive vars
- Rotate `ADMIN_API_KEY` regularly

### 3. Network Security
- Enable Railway Firewall (if available)
- Use HTTPS only (automatic with Railway)
- Validate webhook URLs before storing

### 4. Rate Limiting
Each API key has:
- Per-minute limit: 60 requests
- Per-day limit: 10,000 requests
- Configurable per key

---

## 📞 Support

### Issues?
1. Check logs: `railway logs -f`
2. Test health endpoint: `curl https://your-url/health`
3. Try webhook test: `POST /api/webhooks/test`
4. Check Railway status: https://status.railway.app

### Common Errors
| Error | Cause | Solution |
|-------|-------|----------|
| `REDIS_CONNECTION_FAILED` | Redis unavailable | Restart Redis plugin in Railway |
| `RATE_LIMITED` | Too many requests | Wait or generate new API key |
| `JOB_NOT_FOUND` | Job expired | Jobs expire after 1 hour |
| `INVALID_WEBHOOK_URL` | Bad URL | Validate webhook URL format |

---

## 🎯 Next Steps

After deployment:
1. ✅ Test all endpoints
2. ✅ Configure Lovable integration
3. ✅ Set up monitoring alerts
4. ✅ Document your API keys securely
5. ✅ Plan backup/recovery strategy

Happy deploying! 🚀
