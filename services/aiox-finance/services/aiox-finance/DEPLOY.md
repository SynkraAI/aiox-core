# Deployment Guide — AIOX Finance API

## Environment Variables

Required variables for production:

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# API
PORT=3000
FRONTEND_URL=https://your-frontend.com

# Optional
NODE_ENV=production
```

## Deployment Platforms

### Vercel

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel --prod
   ```

3. **Configure environment variables in Vercel dashboard** or via CLI:
   ```bash
   vercel env add SUPABASE_URL
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   vercel env add FRONTEND_URL
   ```

**Config file (vercel.json):**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": [
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "FRONTEND_URL"
  ]
}
```

### Railway

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login & Deploy:**
   ```bash
   railway login
   railway init
   railway up
   ```

3. **Set environment variables in Railway dashboard:**
   - SUPABASE_URL
   - SUPABASE_SERVICE_ROLE_KEY
   - FRONTEND_URL
   - PORT (optional, defaults to 3000)

**Config file (railway.json):**
```json
{
  "build": "npm run build",
  "start": "node dist/main.js",
  "env": [
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "FRONTEND_URL"
  ]
}
```

### Render

1. **Push to GitHub** (Render integrates with GitHub)

2. **Create new Web Service on Render dashboard:**
   - Repo: select your repo
   - Build command: `npm run build`
   - Start command: `node dist/main.js`

3. **Set environment variables in Render dashboard:**
   - SUPABASE_URL
   - SUPABASE_SERVICE_ROLE_KEY
   - FRONTEND_URL

## Health Checks

### Endpoints

**Health Status:**
```bash
curl http://localhost:3000/health
# Returns: { status: 'ok' }
```

**Full Status (with DB):**
```bash
curl http://localhost:3000/api/status
# Returns: { status: 'ok', database: 'connected' }
```

## Local Development

### Setup

```bash
npm install
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
```

### Run

```bash
npm run dev
# API available at http://localhost:3000
```

### Test

```bash
npm test
npm run typecheck
npm run build
```

## Production Checklist

- [ ] All environment variables set
- [ ] Database migrations applied (`supabase db push`)
- [ ] Tests passing (`npm test`)
- [ ] Build succeeds (`npm run build`)
- [ ] Health endpoint responds
- [ ] CORS configured for frontend URL
- [ ] Rate limiting enabled (if required)
- [ ] Error logging configured
- [ ] Graceful shutdown handlers active

## Monitoring

The API logs all requests with:
- Method
- Endpoint
- Status code
- Response time
- Client IP

Errors (5xx) are logged with full error details and requestId for tracking.

## Graceful Shutdown

The server handles `SIGTERM` and `SIGINT` signals with a 10-second timeout:
1. Stop accepting new requests
2. Wait for in-flight requests to complete
3. Close database connections
4. Force shutdown after 10 seconds

Most container orchestrators (Docker, Kubernetes, Render, Railway) send SIGTERM before terminating.

---

**Last updated:** 2026-05-12
