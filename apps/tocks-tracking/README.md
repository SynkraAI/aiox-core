# Tocks Tracking

## Status: PARKED (2026-05-04)

This app is NOT deployed. Its `/api/capture-gclid` endpoint has been superseded by
`apps/tocks-sales-ai` (verified at `apps/tocks-sales-ai/src/integrations/tray-webhook.ts`
line 116 — `router.post('/api/capture-gclid', handleCaptureGclid(deps))`). Restoration:
~20 min (follow `docs/runbooks/tocks-tracking-deploy.md`, remove DEPRECATED header first).
Do not delete this app — it is retained as a fallback. Last known-good standalone state:
fork commit `6c2bc08c`.

See: `STORY-TOCKS-PARK-TRACKING` and `STORY-TOCKS-CAPI-D++` for the D++ migration rationale.

---

Standalone Google Ads offline conversion uploader + Tray webhook receiver for `tockscustom.com.br`.

Extracted from `@tocks/sales-ai` for isolated deploy — no BullMQ, Redis, Claude, or WhatsApp deps. Just Express + Supabase + Google Ads REST.

---

## What it does

1. Receives `POST /api/capture-gclid` from the LP script (stores gclid + hashed email/phone in Supabase).
2. Receives `POST /api/tray-webhook-purchase` and `POST /api/tray-webhook-lead` from the Tray store.
3. Matches hashed identifiers against the gclid_captures table.
4. Uploads offline conversions to Google Ads via REST API v20.

All three endpoints are auth-gated in production (HMAC or secret-in-URL).

---

## Deploy to Railway (5 min)

1. **Create service:**
   ```bash
   railway login
   cd apps/tocks-tracking
   railway up
   ```
   (Or link via GitHub: set root to `apps/tocks-tracking`.)

2. **Set env vars** in Railway dashboard (copy from `.env.example`):
   - **SECRETS** (fetch from `D:/jarvis/mcp-ads-bridge/.env`):
     - `GOOGLE_ADS_CLIENT_ID`
     - `GOOGLE_ADS_CLIENT_SECRET`
     - `GOOGLE_ADS_DEVELOPER_TOKEN`
     - `GOOGLE_ADS_REFRESH_TOKEN`
   - **SECRETS** (fetch from Supabase dashboard → Project Settings → API):
     - `SUPABASE_URL`
     - `SUPABASE_SERVICE_ROLE_KEY`
   - **SECRETS** (generate fresh):
     - `TRAY_WEBHOOK_SECRET` = `openssl rand -hex 32`
   - **PUBLIC** (defaults OK):
     - `NODE_ENV=production`
     - `PORT=3100` (Railway overrides via `$PORT`)
     - `CORS_ORIGINS=https://tockscustom.com.br,https://www.tockscustom.com.br`
     - `GOOGLE_ADS_LOGIN_CUSTOMER_ID=7943699417`
     - `GOOGLE_ADS_TOCKS_CUSTOMER_ID=8146675397`
     - `GOOGLE_ADS_CONVERSION_ACTION_LEAD_ID=7550396040`
     - `GOOGLE_ADS_CONVERSION_ACTION_PURCHASE_ID=7161904202`

3. **Apply Supabase migration** (one-time):
   ```bash
   # From Supabase SQL editor or psql:
   \i apps/tocks-tracking/supabase/migrations/005_gclid_captures.sql
   ```
   **Prerequisite:** Supabase project must already have the `tocks-sales-ai` migrations 001-004 applied (for `tenants` table + `get_user_tenant_id()` helper).

4. **Verify deploy:**
   ```bash
   curl https://<railway-url>/health
   # {"status":"ok","service":"tocks-tracking",...}
   ```

5. **Boot must fail-close** if prod secrets missing — verify:
   ```bash
   # Temporarily unset TRAY_WEBHOOK_SECRET in Railway → redeploy
   # Should see: "TRAY_WEBHOOK_SECRET is required in production..."
   # Restore the secret immediately.
   ```

6. **Share the public URL** with the Tray dev (per `docs/projects/tocks-tray-tracking-briefing.md`):
   - Replace `https://tracking.tockscustom.com.br` in section 4.1/4.2/4.3 with the Railway URL (or set up custom domain later).

---

## Local dev

```bash
cd apps/tocks-tracking
npm install
cp .env.example .env
# Fill in dev values (Supabase url/key + optionally the 4 Google Ads secrets)
npm run dev
```

Dev mode is permissive: `TRAY_WEBHOOK_SECRET` and `CORS_ORIGINS` can be empty.

Tests:
```bash
npm run test
```

Typecheck:
```bash
npm run typecheck
```

---

## Token expiry (Google Ads OAuth)

The refresh token was last reauthed 22/Abr with `contato@tockscustom.com.br` (MCC 7943699417). OAuth app is in **Testing mode**, so token expires ~7 days after each reauth.

**Monitoring:** logs will show `google_ads.oauth.refresh_failed` when the token expires. At that point, the uploader is no-op (returns `{ uploaded: false, reason: 'oauth_failed' }`) — webhooks still succeed at 202, but no conversion uploads happen.

**Fix:** user (Breno) reauths manually via `D:/jarvis/mcp-ads-bridge/scripts/reauth-with-sheets.cjs`, then copies the new `GOOGLE_ADS_REFRESH_TOKEN` to Railway.

---

## Tray webhook auth modes

Backend accepts either:

1. **HMAC header** (`X-Tray-Signature: sha256=<hex>`) — preferred.
2. **Secret-in-URL** (`?k=<secret>` query param) — fallback when Tray lacks HMAC support.

Both validated against `TRAY_WEBHOOK_SECRET`. If neither present, request is rejected (401) in production.

---

## Related docs

- Story: `docs/stories/tocks/S-TOCKS-TRACK-FIX-001.md`
- Briefing (for Tray dev): `docs/projects/tocks-tray-tracking-briefing.md`
- Original code (kept intact): `apps/tocks-sales-ai/src/integrations/{tray-webhook,google-ads-*}.ts`

---

## What to do when user returns (post-travel)

1. Verify Railway deploy healthy (`/health` returns 200).
2. Reauth Google Ads OAuth if token expired.
3. Share public URL with Tray dev (Breno → dev externo Tray).
4. Monitor `capture_gclid.ok` and `google_ads.conversions.uploaded` log entries for 48h.
5. Validate conversions arriving in Google Ads (Ferramentas → Conversões → count > 0).
