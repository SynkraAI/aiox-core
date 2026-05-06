# 16 — Runbook Deploy (Vorza Email Marketing)

**Author:** @dev (Dex)
**Audience:** user (Breno) executing manually OR autopilot agent
**Total time:** 90-120 min hands-on + 1-4h DNS propagation wait

---

## 0. Pre-flight Checklist (5 min)

Before starting, confirm in hand:
- [ ] **vorza.com.br** is registered (Registro.br). If NO → register first (R$40, ~1h to propagate).
- [ ] Vercel account active (used for Bretda already).
- [ ] Supabase account active.
- [ ] Upstash Redis account active.
- [ ] Kiwify dashboard access.
- [ ] Access to DNS provider for vorza.com.br (Vercel / Cloudflare / Registro.br).

If any missing → stop here, complete first.

---

## 1. Step 1 — Create Resend Account [5 min]

**Who:** user (manual UI signup).

1. Open https://resend.com/signup.
2. Sign up with `breno@vorza.com.br` (or personal email).
3. Confirm email.
4. Land on dashboard. Note plan: **Free** by default. Keep Free.

**Done when:** dashboard loads at app.resend.com.

---

## 2. Step 2 — Verify Domain [10 min config + 1-4h DNS propagation]

**Who:** user (DNS UI + Resend dashboard).

1. Resend dashboard → **Domains** → **Add Domain**.
2. Enter `mail.vorza.com.br` (subdomain — best practice).
3. Resend shows 3-4 DNS records (MX, TXT-SPF, TXT-DKIM, optional DMARC).
4. Open DNS provider for vorza.com.br.
5. Add each record exactly as shown.
6. Save in DNS provider.
7. Return to Resend dashboard → click **Verify Domain**.
8. If "Pending" → wait 5-30 min, retry.

**Done when:** all 3 records show green checkmarks in Resend.

**Block if:** more than 4h pending → check DNS records exactly match (especially DKIM long string).

---

## 3. Step 3 — Deploy Supabase Schema [15 min]

**Who:** user OR autopilot via SQL editor.

1. Supabase dashboard → choose project (create new "vorza" if separate).
2. **SQL Editor** → **New query**.
3. Paste **Migration 001** from `15-database-schema.md`. Run.
4. Verify: **Table Editor** → confirm 9 tables exist.
5. New query → paste **Migration 002**. Run. Verify materialized view.
6. New query → paste **Migration 003** (RLS). Run.
7. New query → paste **Migration 004** (retention functions). Run.
8. **Settings** → **API** → copy:
   - `anon` key → `SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`
   - URL → `SUPABASE_URL`

**Done when:** all migrations run with no errors, RLS enabled (small lock icon on tables).

---

## 4. Step 4 — Deploy Webhook + API Endpoints [10 min]

**Who:** user via Vercel CLI OR autopilot.

### 4.1 Repo setup

```bash
mkdir apps/vorza-api
cd apps/vorza-api
pnpm init -y
pnpm add resend react-email @react-email/components @react-email/render @supabase/supabase-js zod svix
pnpm add -D @vercel/node typescript tsx csv-parse
```

### 4.2 Files to create (refs to other docs)

- `api/subscribe.ts` — see `12-lp-form-implementation.md` (server endpoint, mirror of client logic)
- `api/kiwify-webhook.ts` — see `14-kiwify-integration.md` §2
- `api/cron/process-kiwify-webhooks.ts` — see `14-kiwify-integration.md` §3
- `api/resend-webhook.ts` — see `13-resend-setup.md` §7
- `api/unsubscribe.ts` — token verify + suppress
- `api/cron/welcome-drip.ts` — see `11-tech-architecture.md` §3.6
- `api/cron/sync-resend-audience.ts` — process `pending_sync` queue
- `emails/*.tsx` — React Email templates (see `13-resend-setup.md` §4)
- `vercel.json` — see `14-kiwify-integration.md` §3 (cron config)

### 4.3 Deploy

```bash
vercel link        # link to Vercel project
vercel env add RESEND_API_KEY production
vercel env add KIWIFY_WEBHOOK_SECRET production
vercel env add RESEND_WEBHOOK_SECRET production
vercel env add SUPABASE_URL production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add SUPABASE_ANON_KEY production
vercel env add UPSTASH_REDIS_REST_URL production
vercel env add UPSTASH_REDIS_REST_TOKEN production
vercel env add UNSUBSCRIBE_SECRET production    # openssl rand -hex 32
vercel env add CRON_SECRET production            # openssl rand -hex 32
vercel env add RESEND_AUDIENCE_ADVOGADOS production
vercel env add RESEND_AUDIENCE_MEI production
vercel env add RESEND_AUDIENCE_PROFESSORES production
vercel env add RESEND_AUDIENCE_CUSTOMERS production

vercel --prod      # first deploy
```

Note the production URL (e.g., `vorza-api.vercel.app`).

**Done when:** `curl -X POST https://vorza-api.vercel.app/api/subscribe -d '{}'` returns a 4xx (validation error) — proves endpoint is live.

---

## 5. Step 5 — Add Form Snippet to LPs [20 min]

**Who:** user via repo edit OR autopilot.

1. Edit `apps/low-ticket-smoke-test/obrigado/index.html` → replace body content with form (full snippet in `12-lp-form-implementation.md` §1).
2. Update `fetch('https://vorza-api.vercel.app/api/subscribe', ...)` to actual deploy URL from Step 4.
3. Optional: update `apps/low-ticket-smoke-test/{advogados,mei,professores}/index.html` with inline form (skip for v1).
4. Verify pages locally: `cd apps/low-ticket-smoke-test && python -m http.server 8000` → open `localhost:8000/obrigado/?niche=advogados`.
5. Submit a test email → check Vercel logs for `/api/subscribe` 200 response.
6. Verify Supabase: query `SELECT * FROM subscribers WHERE email = 'your-test@email.com';` → row exists.
7. Deploy to Netlify: `cd apps/low-ticket-smoke-test && netlify deploy --prod`.

**Done when:** real submission on production LP creates row in Supabase.

---

## 6. Step 6 — Configure Kiwify Webhook [10 min]

**Who:** user (Kiwify UI).

1. Kiwify dashboard → **Configurações** → **Webhooks** (or **Apps & Integrações**).
2. **Add webhook** → URL: `https://vorza-api.vercel.app/api/kiwify-webhook`.
3. Subscribe events: `compra_aprovada`, `reembolsado`, `chargeback`.
4. Generate token: `openssl rand -hex 32` locally.
5. Paste token in Kiwify "Token de Verificação".
6. Save in Kiwify.
7. Update Vercel env: ensure `KIWIFY_WEBHOOK_SECRET` matches the token.
8. **Trigger test** if Kiwify provides a "send test event" button.
9. Verify Vercel logs: 200 response on `/api/kiwify-webhook`.
10. Verify Supabase: `SELECT * FROM webhook_log WHERE source='kiwify' ORDER BY received_at DESC LIMIT 1;` → test event present.

**Done when:** test webhook arrives in `webhook_log`.

---

## 7. Step 7 — Backfill Historical Kiwify Customers [15 min]

**Who:** user (export) + autopilot or user (script).

1. Kiwify dashboard → **Vendas** → **Exportar** → choose CSV, date range "all time", filter "Aprovadas".
2. Save as `apps/vorza-api/data/kiwify-export-2026-05-05.csv`.
3. Inspect CSV header: confirm columns include `email`, `full_name`, `product`, `amount`, `created_at` (or equivalents — adjust script field names if different).
4. Locally run:
   ```bash
   cd apps/vorza-api
   pnpm tsx scripts/backfill-kiwify.ts data/kiwify-export-2026-05-05.csv
   ```
5. Watch progress in stdout. Note: if >100 customers and Resend Free tier, the contact-add step may rate-limit — script handles via try/catch but check logs.
6. Verify Supabase: `SELECT count(*) FROM subscribers WHERE source='kiwify-backfill';`
7. Verify Resend: dashboard → Audiences → vorza-customers → check count matches.

**Done when:** subscriber count in Supabase matches CSV row count (minus skipped invalid emails).

---

## 8. Step 8 — Send First Manual Test Email [5 min]

**Who:** user manual via Resend dashboard.

1. Resend dashboard → **Broadcasts** → **New Broadcast**.
2. From: `Breno (Vorza) <breno@mail.vorza.com.br>`.
3. To: select audience `vorza-customers` BUT filter **only your own email** (test segment).
4. Subject: "Vorza — primeiro contato".
5. Body: paste a simple HTML test ("Teste de entrega — pode ignorar.").
6. Send.
7. Check inbox in 30-60s.
8. Check spam folder if not in inbox.

**Done when:** email arrives in your inbox (NOT spam).

**Block if:** lands in spam → check DNS records, DMARC status, sender reputation. Do NOT send to broader list until inbox-confirmed.

---

## 9. Step 9 — Activate Welcome Sequence [10 min]

**Who:** user OR autopilot.

1. Confirm React Email templates exist in `apps/vorza-api/emails/welcome-day-{0,1,3,7}-*.tsx` (copy chief delivers content; tech provides template skeleton).
2. Confirm Vercel cron is configured in `vercel.json` (Step 4.2 included it).
3. Manually trigger one cron tick:
   ```bash
   curl -X POST https://vorza-api.vercel.app/api/cron/welcome-drip \
     -H "Authorization: Bearer $CRON_SECRET"
   ```
4. Check response: `{ processed: N }` where N = number of subscribers due for next welcome step.
5. Check Supabase: `SELECT email, welcome_step, next_send_at FROM subscribers WHERE welcome_step > 0 LIMIT 10;` → state advanced.
6. Check Resend dashboard → **Logs** → recent sends visible.
7. Wait 15 min → confirm Vercel cron fires automatically (Vercel logs).

**Done when:** at least 1 welcome email lands and state advances correctly.

---

## 10. Post-Launch (Day 1-7)

### Daily checks

- [ ] Vercel function logs: any 5xx?
- [ ] Resend dashboard: bounce rate <2%, complaint rate <0.1%
- [ ] Supabase query: `SELECT count(*) FROM webhook_log WHERE processed_at IS NULL AND received_at < now() - interval '5 minutes';` should be 0.
- [ ] Spot-check 3 random subscribers: did they get the right emails?

### Week 1 milestones

- [ ] First test broadcast to <100 engaged subscribers (warm-up).
- [ ] First Kiwify purchase post-launch → verify webhook → receipt arrives in customer inbox.
- [ ] Unsubscribe link tested: click → confirms suppression → no future sends.

---

## 11. Who Can Do What — Autopilot Capability

| Step | Manual user | Autopilot agent |
|------|-------------|-----------------|
| 1. Resend signup | YES | NO (manual UI) |
| 2. Domain DNS | YES | YES (if Vercel-managed DNS via API) — partial |
| 3. Supabase migrations | YES | YES (Supabase CLI or via SDK) |
| 4. Vercel deploy | YES | YES (Vercel CLI) |
| 5. LP form edit | YES | YES (file edits + netlify deploy) |
| 6. Kiwify webhook | YES | NO (manual UI in Kiwify) |
| 7. Backfill script | YES | YES (after CSV exported) |
| 8. Test broadcast | YES | NO (Resend Broadcasts UI; Send API works but Broadcasts UI required for first send) |
| 9. Activate cron | YES | YES (cron in vercel.json auto-active) |

**Recommendation:** user does Steps 1, 2, 6, 8 (UI-bound). Autopilot can do Steps 3, 4, 5, 7, 9.

---

## 12. Rollback Plan

If something breaks post-launch:

| Symptom | Rollback |
|---------|----------|
| LP form 500ing | Revert obrigado/index.html to old textarea version (git checkout) |
| Webhooks not processing | Pause cron in Vercel dashboard; webhook_log accumulates safely; resume after fix |
| Wrong emails sending | Set `welcome_step=99` for affected subscribers (cancels in-flight sequence) |
| High bounce rate | Pause sends (revoke Resend API key temporarily); investigate before resending |
| LGPD complaint | Process `data_deletion_requests` immediately; have audit log ready (`subscribers.consent_at`, `consent_text`) |

---

## 13. Cost Summary

| Service | Plan | Monthly |
|---------|------|---------|
| Resend | Free (3k emails) | $0 |
| Supabase | Free (500 MB) | $0 |
| Vercel | Hobby (100 GB-hr functions) | $0 |
| Upstash Redis | Free (10k cmd/day) | $0 |
| **Total launch** | | **$0/mo** |
| Resend Pro upgrade trigger | >2.5k/mo emails | $20/mo |
| Supabase Pro | If >500MB or paid features | $25/mo |
| **Total at scale (~5k subs)** | | **$45/mo** |

Free tier likely covers Vorza's first 60-90 days entirely.

---

## 14. Final Self-Critique

- ✅ All 9 steps have clear "done when" criteria.
- ✅ Time estimates per step + total.
- ✅ Manual vs. autopilot clearly delineated.
- ✅ Rollback plan documented.
- ✅ Cost estimates realistic.
- ⚠ Step 4.2 references files that don't exist yet — assumes spec docs (12-15) get implemented as code in a separate development pass. Runbook is for AFTER code is ready.
- ⚠ Step 6 webhook test depends on Kiwify dashboard supporting "send test event" — if not, real test transaction needed (R$10 buy your own product, refund after).
- ⚠ Step 8 first broadcast: if domain reputation is fresh, gmail might soft-bounce first 50 sends. Don't panic; ramp slowly.
