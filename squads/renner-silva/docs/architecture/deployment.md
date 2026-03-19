# Deployment Pipeline Architecture - Metodo Aplauda de Pe

**Version:** 1.0
**Date:** 2026-02-13
**Parent:** `docs/architecture/architecture.md` Section 10

---

## 1. CI/CD Pipeline (GitHub Actions)

### Workflow File

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '22'

jobs:
  # -------------------------------------------------------
  # Job 1: Lint
  # -------------------------------------------------------
  lint:
    name: Lint
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./app
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: app/package-lock.json
      - run: npm ci
      - run: npx eslint . --ext .ts,.tsx --max-warnings 0

  # -------------------------------------------------------
  # Job 2: Type Check
  # -------------------------------------------------------
  typecheck:
    name: Type Check
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./app
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: app/package-lock.json
      - run: npm ci
      - run: npx tsc --noEmit

  # -------------------------------------------------------
  # Job 3: Unit + Integration Tests
  # -------------------------------------------------------
  test:
    name: Tests
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./app
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: app/package-lock.json
      - run: npm ci
      - run: npx jest --ci --coverage --maxWorkers=2
      - name: Upload coverage
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: coverage-report
          path: app/coverage/

  # -------------------------------------------------------
  # Job 4: Build
  # -------------------------------------------------------
  build:
    name: Build
    runs-on: ubuntu-latest
    needs: [lint, typecheck, test]
    defaults:
      run:
        working-directory: ./app
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: app/package-lock.json
      - run: npm ci
      - run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
          NEXT_PUBLIC_SENTRY_DSN: ${{ secrets.NEXT_PUBLIC_SENTRY_DSN }}
          NEXT_PUBLIC_POSTHOG_KEY: ${{ secrets.NEXT_PUBLIC_POSTHOG_KEY }}
          NEXT_PUBLIC_POSTHOG_HOST: ${{ secrets.NEXT_PUBLIC_POSTHOG_HOST }}
          SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}

  # -------------------------------------------------------
  # Job 5: Sentry Source Maps (main only)
  # -------------------------------------------------------
  sentry-sourcemaps:
    name: Upload Source Maps
    runs-on: ubuntu-latest
    needs: [build]
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    defaults:
      run:
        working-directory: ./app
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: app/package-lock.json
      - run: npm ci
      - run: npx @sentry/cli releases new ${{ github.sha }}
      - run: npx @sentry/cli releases files ${{ github.sha }} upload-sourcemaps .next/
        env:
          SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
          SENTRY_ORG: ${{ secrets.SENTRY_ORG }}
          SENTRY_PROJECT: ${{ secrets.SENTRY_PROJECT }}

  # -------------------------------------------------------
  # Job 6: E2E Tests (main only, post-deploy)
  # -------------------------------------------------------
  e2e:
    name: E2E Tests
    runs-on: ubuntu-latest
    needs: [build]
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    defaults:
      run:
        working-directory: ./app
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: app/package-lock.json
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - name: Wait for Netlify deploy
        run: sleep 60
      - run: npx playwright test
        env:
          BASE_URL: ${{ secrets.PRODUCTION_URL }}
      - name: Upload E2E report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: app/playwright-report/
```

### Pipeline Diagram

```
PR / Push to main
       |
       v
+------+------+------+
| Lint | Type | Test |  <-- Run in PARALLEL
|      | Check|      |
+------+------+------+
       |      |      |
       +------+------+
              |
              v
          +-------+
          | Build |         <-- Only if all 3 pass
          +-------+
              |
              +-------+-------+
              |               |
              v               v  (main branch only)
    +---------------+  +-----------+
    | Sentry Maps   |  | E2E Tests |
    | (source maps) |  | (Playwright)|
    +---------------+  +-----------+
```

### Estimated Pipeline Duration

| Job | Duration | Notes |
|-----|----------|-------|
| Lint | ~30s | ESLint with cache |
| TypeCheck | ~20s | tsc --noEmit |
| Test | ~60s | Jest with 2 workers |
| Build | ~90s | next build with Turbopack |
| Source Maps | ~30s | Sentry CLI upload |
| E2E | ~120s | Playwright 2 flows |
| **Total (PR)** | **~2.5 min** | Lint + Type + Test + Build |
| **Total (main)** | **~4.5 min** | + Source Maps + E2E |

---

## 2. Netlify Configuration

### netlify.toml

```toml
# netlify.toml (at project root)

[build]
  base = "app/"
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "22"
  NEXT_TELEMETRY_DISABLED = "1"

# Next.js plugin for Netlify
[[plugins]]
  package = "@netlify/plugin-nextjs"

# Headers for caching and security
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"

# Immutable cache for static assets
[[headers]]
  for = "/_next/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

# Cache for images
[[headers]]
  for = "/images/*"
  [headers.values]
    Cache-Control = "public, max-age=86400, stale-while-revalidate=604800"

# Redirects
[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

# SPA fallback for client-side routing
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
  conditions = {Role = ["admin"]}
```

### Netlify Environment Variables

Configure these in Netlify dashboard (Site settings > Environment variables):

| Variable | Value Source | Notes |
|----------|------------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase dashboard | Public, starts with https:// |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase dashboard | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase dashboard | Server-only, never expose |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry dashboard | Public DSN |
| `SENTRY_AUTH_TOKEN` | Sentry dashboard | For source map upload |
| `SENTRY_ORG` | Sentry settings | Organization slug |
| `SENTRY_PROJECT` | Sentry settings | Project slug |
| `NEXT_PUBLIC_POSTHOG_KEY` | Posthog dashboard | Public API key |
| `NEXT_PUBLIC_POSTHOG_HOST` | Posthog settings | e.g., https://us.i.posthog.com |

### Netlify Free Tier Budget

| Resource | Limit | Expected Usage | Headroom |
|----------|-------|---------------|----------|
| Build minutes | 300/month | ~100 builds x 2.5min = 250min | 50min |
| Bandwidth | 100GB/month | ~500 users x 5 pages/visit x 300KB = ~750MB | 99.2GB |
| Serverless functions | 125K invocations | ~500 users x 10 req/day x 30 = 150K | Near limit |
| Sites | Unlimited | 1 | - |

**Note on serverless functions:** If function invocations approach the limit, consider caching Supabase responses in ISR pages instead of serverless functions.

---

## 3. Supabase Deployment

### Migration Workflow

```
Developer creates migration locally:
  supabase migration new add_badges_table
        |
        v
Edit migration file:
  supabase/migrations/YYYYMMDDHHMMSS_add_badges_table.sql
        |
        v
Test locally:
  supabase db reset  (applies all migrations + seed)
  supabase test db   (run pgTAP tests)
        |
        v
Commit migration to Git:
  git add supabase/migrations/
  git commit -m "feat: add badges table [Story 4.1]"
        |
        v
Push to main --> Supabase CLI applies migration:
  supabase db push --linked
```

### Schema Version Control

All schema changes are tracked as migration files in `supabase/migrations/`. Naming convention:

```
supabase/migrations/
  00001_initial_schema.sql          # Tables, RLS, triggers, functions
  00002_badges_seed.sql             # Badge definitions seed data
  00003_add_quiz_results.sql        # Quiz results table (Epic 3)
  00004_add_streaks.sql             # Streaks table (Epic 4)
  ...
```

**Migration rules:**
- Never modify existing migrations (create new ones for changes)
- Migrations must be idempotent where possible (use IF NOT EXISTS)
- Test migrations locally with `supabase db reset` before pushing
- Document breaking changes in migration file header

### Seed Data Strategy

| Data | Seeding Method | When |
|------|---------------|------|
| Badge definitions | Migration SQL (INSERT) | On deploy |
| Test users | `supabase/seed.sql` | Local dev only |
| Test progress | `supabase/seed.sql` | Local dev only |

```sql
-- supabase/seed.sql (local dev only, never runs in production)
-- Create test student
INSERT INTO auth.users (id, email, raw_user_meta_data)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'aluno@teste.com',
  '{"name": "Aluno Teste"}'
);

-- Test progress for module 1
INSERT INTO progress (user_id, checkpoint_id, module_id, completed)
VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'cp-1.1', 'mod-1', TRUE),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'cp-1.2', 'mod-1', TRUE),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'cp-1.3', 'mod-1', TRUE);
```

### Backup Strategy

| What | How | Frequency |
|------|-----|-----------|
| Database | Supabase automatic daily backups (Pro plan) or manual pg_dump | Daily (auto) |
| Schema | Git-versioned migrations | Every change |
| Storage (avatars) | Supabase Storage built-in redundancy | Continuous |
| Environment vars | Documented in deployment.md (this file) | On change |

**Free tier note:** Supabase free tier includes 7 days of automatic backups. For additional safety, schedule weekly manual exports via `supabase db dump`.

---

## 4. Environment Setup

### Local Development

```bash
# 1. Clone repository
git clone <repo-url>
cd knowledge-base-renner-silva

# 2. Install dependencies
cd app && npm install

# 3. Setup environment
cp .env.example .env.local
# Edit .env.local with Supabase keys

# 4. Start Supabase locally (optional, for v2.0+)
supabase start
supabase db reset  # Apply migrations + seed

# 5. Start dev server
npm run dev
# Open http://localhost:3000
```

### .env.example

```bash
# .env.example - Copy to .env.local and fill in values

# Supabase
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Sentry
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=
SENTRY_ORG=
SENTRY_PROJECT=

# Posthog
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# App
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### .gitignore additions

```gitignore
# Environment
.env
.env.local
.env.production.local

# Next.js
.next/
out/

# Dependencies
node_modules/

# Testing
coverage/
playwright-report/
test-results/

# Supabase
supabase/.temp/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Sentry
.sentryclirc
```

---

## 5. Deploy Checklist (Story 1.1)

### First Deploy Steps

- [ ] Initialize Git repository in project root
- [ ] Create `.gitignore` with all patterns above
- [ ] Create GitHub repository (private) via `gh repo create`
- [ ] Configure branch protection on `main` (require PR reviews)
- [ ] Create Netlify site and connect to GitHub repository
- [ ] Configure `netlify.toml` with build settings
- [ ] Install `@netlify/plugin-nextjs` as dependency
- [ ] Set all environment variables in Netlify dashboard
- [ ] Create GitHub Actions workflow file (`.github/workflows/ci.yml`)
- [ ] Add GitHub secrets for Supabase, Sentry, Posthog keys
- [ ] Push initial commit to `main` and verify:
  - [ ] GitHub Actions pipeline passes
  - [ ] Netlify auto-deploys successfully
  - [ ] Site is accessible at Netlify URL
  - [ ] No console errors in browser

### Post-Deploy Verification

- [ ] Lighthouse score >= 90 (Performance)
- [ ] All pages render correctly (dashboard, modules, trails)
- [ ] localStorage progress works (v1.1)
- [ ] Sentry receives test error (trigger via dev tools)
- [ ] Posthog receives page_viewed event
- [ ] Source maps uploaded to Sentry (errors show original code)

---

*Deployment architecture designed by Aria (Architect Agent)*
*Version 1.0 - 2026-02-13*
