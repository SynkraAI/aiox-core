# 11 — Tech Architecture (Vorza Email Marketing)

**Author:** @dev (Dex) — autonomous build 2026-05-05
**Mind clones consulted:** werner-vogels, kelsey-hightower, paul-copplestone, martin-kleppmann
**Status:** Spec — no code committed

---

## 1. Executive Recommendation

**Stack:** Resend (sender) + Supabase Postgres (source of truth) + Vercel Edge/Node Functions (webhook ingress) + React Email (templates).

**Why this combo wins for Vorza right now:**
- Solo operator. No marketing ops team. CLI-first / code-as-config matches AIOS philosophy.
- Bretda already runs on Vercel + Supabase + Upstash. Zero new platforms to learn or pay for.
- Resend free tier = 3,000 emails/month, 100/day — covers Vorza's current ~zero list comfortably during list-building phase.
- React Email templates live in git, version-controlled, reviewable in PRs.
- Postgres schema in Supabase is the *source of truth*; Resend Audiences are a *cache/sync target*. Kleppmann: "data outlives code" — own your subscriber data.

**Real blocker to flag (NOT a blocker to abandon Resend):**
- Resend has **no visual automation builder**. Welcome sequences and drip campaigns must be built as code (cron-triggered Vercel functions reading Supabase + sending via Resend API). For a 5-email welcome sequence this is ~150 lines of code, not an issue. If Vorza later wants 30+ branching sequences with marketer-editable logic, revisit (ConvertKit / ActiveCampaign).
- Resend Audiences segmentation is **flat tags only** (no boolean queries on subscriber attributes). Mitigation: keep segmentation logic in Supabase, sync to Resend as a precomputed `segment` column synced to Resend audience tags.

**Alternatives considered & rejected:**

| Tool | Why rejected |
|------|--------------|
| ActiveCampaign | $29/mo entry, visual automation overkill for solo, adds 2nd vendor |
| RD Station | BR-focused but $50+/mo, vendor-locked, weak API/dev experience |
| Mailchimp | Stagnant product, expensive at scale, generic templates |
| ConvertKit / Kit | Good for creators but $25/mo, less Vercel-native than Resend |
| SES + custom | Werner would say "frugal" but you'd rebuild Resend's React Email + tracking + audiences yourself = months of yak-shaving |

**Kelsey's KISS check:** "Travel up the stack and you'll find where the people are." Resend is where engineers ship transactional + marketing without a ticket queue. Approved.

---

## 2. System Diagram (ASCII)

```
                         ┌──────────────────────────┐
                         │   LP Netlify (4 niches)  │
                         │ advogados / mei / prof / │
                         │ obrigado                 │
                         └──────────┬───────────────┘
                                    │ POST {email, niche, consent, hp}
                                    ▼
                         ┌──────────────────────────┐
                         │  Vercel Function         │
                         │  /api/subscribe          │
                         │  - validate email        │
                         │  - check honeypot        │
                         │  - check LGPD consent    │
                         │  - rate-limit (Upstash)  │
                         └──────────┬───────────────┘
                                    │ INSERT subscribers
                                    ▼
                         ┌──────────────────────────┐                ┌────────────────────┐
                         │  Supabase Postgres       │◄──────────────►│ Upstash Redis      │
                         │  - subscribers           │  rate-limit /  │ - rate-limit       │
                         │  - purchases             │  idempotency   │ - dedup keys       │
                         │  - email_events          │                └────────────────────┘
                         │  - suppressions          │
                         └──────┬─────────────┬─────┘
                                │             │
                       triggers │             │ sync (cron 5min)
                       (pg_cron)│             ▼
                                │       ┌──────────────────────────┐
                                │       │ Vercel Cron              │
                                │       │ /api/sync-resend-audience│
                                │       │ - upsert Resend contacts │
                                │       │ - apply tags by segment  │
                                │       └──────────┬───────────────┘
                                │                  │ Resend SDK
                                ▼                  ▼
                       ┌──────────────────────────────────────────┐
                       │  Resend                                  │
                       │  - Audiences (subscribers cache)         │
                       │  - Domain auth (SPF/DKIM/DMARC)          │
                       │  - Send API (transactional + broadcast)  │
                       │  - React Email templates rendered server │
                       └──────────┬───────────────────────────────┘
                                  │ deliver
                                  ▼
                              📧 Inbox

                   ┌──────────────────────────┐
                   │  Kiwify Webhook          │
                   │  POST purchase / refund  │
                   └──────────┬───────────────┘
                              │ HMAC-signed
                              ▼
                   ┌──────────────────────────┐
                   │  Vercel Function         │
                   │  /api/kiwify-webhook     │
                   │  - verify HMAC           │
                   │  - INSERT purchases      │
                   │  - update subscriber tag │
                   │  - enqueue welcome seq   │
                   └──────────┬───────────────┘
                              ▼
                   ┌──────────────────────────┐
                   │ pg_cron / Vercel Cron    │
                   │ welcome-sequence.ts      │
                   │ - day 0: receipt         │
                   │ - day 1: getting started │
                   │ - day 3: case study      │
                   │ - day 7: upsell SCV-3    │
                   └──────────────────────────┘

                   ┌──────────────────────────┐
                   │  Resend Webhook          │
                   │  delivered/bounce/etc    │
                   └──────────┬───────────────┘
                              │ HMAC svix
                              ▼
                   ┌──────────────────────────┐
                   │  /api/resend-webhook     │
                   │  - INSERT email_events   │
                   │  - on bounce/complain:   │
                   │    INSERT suppression    │
                   └──────────────────────────┘
```

Werner's call-out: **everything fails all the time.** Three failure boundaries are explicit:
1. LP form → API: client retries with idempotency key in localStorage.
2. API → Supabase: API returns 5xx, LP shows "tente novamente" + email sent to ops alert.
3. Webhook ingress (Kiwify, Resend): always return 2xx after persisting raw payload to `webhook_log` table; process async via cron. Dead letters never get retried into the void.

---

## 3. Components Detailed

### 3.1 Landing Page Form (4 LPs)

- Inline form replaces current "Quero o Kit" CTA `<a href>` on hero / mid / final positions, OR keeps CTA and routes to a `/quero-acesso/` modal/page with form.
- **Recommendation:** keep CTA buttons, but route to `/obrigado/?niche=X` which now hosts the form (since `obrigado/` already exists and is the conversion endpoint). This minimizes LP HTML changes.
- Fields: `email` (required), `niche` (hidden, from URL param), honeypot `website` (must be empty), LGPD checkbox (required).
- Submission: `fetch('/api/subscribe', { ... })` with idempotency key.

See **12-lp-form-implementation.md** for snippet.

### 3.2 `/api/subscribe` (Vercel Function — Edge Runtime)

- Runtime: Vercel Edge Function (low latency, geographic close to BR users via São Paulo region).
- Validation: zod schema, regex email (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`), niche enum, consent boolean.
- Honeypot: reject if `website` field non-empty (silent 200 to fool bots).
- Rate-limit: Upstash Redis sliding window — 5 submissions per IP per hour.
- Idempotency: client sends `Idempotency-Key` header (UUID stored in localStorage); server checks Upstash key `idem:{key}` before insert.
- DB op: `INSERT INTO subscribers ... ON CONFLICT (email) DO UPDATE SET niche = EXCLUDED.niche, updated_at = now()` (re-subscribe = update niche, do not duplicate).
- Sync to Resend: NOT inline. Add row to `pending_sync` queue table; cron picks it up (Werner: decouple write path from third-party dependency).
- Response: `{ ok: true }` → LP redirects to `/sucesso/` or shows inline thank-you.

### 3.3 Supabase Postgres (source of truth)

See **15-database-schema.md** for full DDL.

Paul Copplestone: "Start with the database, not the API." The schema is the contract. RLS on `subscribers`, `purchases`, `email_events` — only `service_role` can read PII. Anon role can `INSERT` into `unsubscribe_requests` (one-way).

### 3.4 Resend (sender)

- One Resend account, one verified domain (`vorza.com.br` if owned, else fallback `mail.bretda.com.br` subdomain — bretda owns vercel infra).
- React Email templates in `apps/vorza-email/emails/*.tsx`, rendered server-side at send time.
- Audiences: one per niche (`vorza-advogados`, `vorza-mei`, `vorza-professores`, `vorza-customers`).
- Send via API (`POST https://api.resend.com/emails`) with idempotency-key header.
- Webhook target: `/api/resend-webhook` (Vercel) — Svix-signed.

### 3.5 Kiwify Webhook → DB → Resend

- Endpoint: `/api/kiwify-webhook` (Vercel Node runtime — needs raw body for HMAC).
- Verify HMAC: Kiwify sends `x-kiwify-signature` HMAC-SHA1 of body with shared secret. Reject 401 on mismatch.
- Persist raw payload to `webhook_log(id, source, payload jsonb, received_at, processed_at)` BEFORE any business logic. Always 2xx after this.
- Async processor (pg_cron every 1 min OR Vercel Cron every 1 min, whichever simpler):
  - Read unprocessed `webhook_log` rows where `source='kiwify'`.
  - For `purchase_approved`: upsert `subscribers` (email, niche='customer'), insert `purchases`, tag in Resend `vorza-customers`, enqueue welcome sequence.
  - For `refund`: insert `purchases.refunded_at`, remove from Resend tag, optionally suppress further marketing.
  - Mark `webhook_log.processed_at = now()`.

### 3.6 Welcome Sequence (Day 0, 1, 3, 7)

- Cron: Vercel Cron `*/15 * * * *` (every 15 min).
- Function: `/api/cron/welcome-drip`:
  - Query `subscribers WHERE source='kiwify' AND welcome_step < 4 AND next_send_at <= now()`.
  - For each: render React Email template for current step, send via Resend, update `welcome_step`, set `next_send_at` to next interval.
  - Idempotency: insert row into `email_sends(subscriber_id, step)` with unique constraint — if row exists, skip.

### 3.7 Lead Scoring / Segmentation

Kept in Supabase as a **materialized view** refreshed every 1h:
```sql
CREATE MATERIALIZED VIEW subscriber_segments AS
SELECT
  s.id,
  s.email,
  s.niche,
  CASE
    WHEN p.id IS NOT NULL THEN 'customer'
    WHEN s.created_at > now() - interval '7 days' THEN 'fresh-lead'
    WHEN ee.opens_30d > 3 THEN 'engaged'
    WHEN ee.opens_30d = 0 AND s.created_at < now() - interval '14 days' THEN 'cold'
    ELSE 'warm'
  END AS segment
FROM subscribers s
LEFT JOIN purchases p ON p.subscriber_id = s.id AND p.refunded_at IS NULL
LEFT JOIN (
  SELECT subscriber_id, COUNT(*) FILTER (WHERE event_type='opened' AND created_at > now() - interval '30 days') AS opens_30d
  FROM email_events GROUP BY subscriber_id
) ee ON ee.subscriber_id = s.id;
```

Sync job pushes `segment` as a Resend tag on each contact.

### 3.8 LGPD Opt-out Flow

- Every email footer contains: `https://vorza.com.br/unsubscribe?token={signed-jwt}`.
- Token is JWT signed with `UNSUBSCRIBE_SECRET`, payload `{email, exp: 1y}`.
- Endpoint `/api/unsubscribe` verifies token, INSERTs into `suppressions(email, reason='user_request', created_at)`, removes from Resend audience.
- Page shows "Inscrição cancelada. Você não receberá mais emails da Vorza."
- LGPD Art. 18: also offer **"Solicitar exclusão dos meus dados"** button → INSERTs `data_deletion_requests(email)` for manual processing within 15 days (Art. 19).
- LGPD Art. 9: privacy policy linked in every email + LP form. (Need: write `/politica-privacidade/` page if not exists.)

---

## 4. Non-functional Requirements

| Requirement | Approach |
|-------------|----------|
| Deliverability | SPF + DKIM + DMARC verified on Resend domain; warm-up via low-volume transactional first |
| LGPD compliance | Consent timestamp stored, opt-out one-click, data deletion endpoint |
| Idempotency | Idempotency-Key header on form, unique constraints on `email_sends(subscriber_id, step)` and `purchases(kiwify_order_id)` |
| Observability | All API responses logged to Vercel logs; Supabase has `webhook_log` raw archive; Resend dashboard for delivery |
| Security | HMAC verification on Kiwify + Resend webhooks; service_role key NEVER in client; RLS on PII tables |
| Cost | Free tier covers 3k emails/mo; upgrade to Pro $20/mo at ~1k subscribers sending 2 emails/week |
| Failure mode | Webhook always 2xx after raw persist; cron retries on `processed_at IS NULL`; LP form retries with idempotency key |

---

## 5. Trade-offs (Kleppmann lens)

| Trade-off | Decision | Why |
|-----------|----------|-----|
| Resend Audience as source of truth vs. Postgres SoT + sync | **Postgres SoT** | Data outlives code; Resend can be swapped; segmentation logic in SQL is more powerful than tags |
| Inline sync to Resend on signup vs. async queue | **Async queue** | Decouples write path from third-party availability; signup never fails because Resend is down |
| pg_cron vs. Vercel Cron | **Vercel Cron** | Simpler ops, single platform, easy logs; pg_cron is a hidden dependency |
| Edge vs. Node runtime for `/api/subscribe` | **Edge** | Lower latency for BR users; edge has no cold start; supabase-js works in edge |
| Edge vs. Node for Kiwify webhook | **Node** | Need raw body for HMAC (Edge body parsing is limited); webhooks are not latency-sensitive |
| One Resend audience per niche vs. one audience + tags | **Per niche** | Cleaner unsubscribe scope ("unsubscribe from advogados list") + Resend native segmentation works on audience level |

---

## 6. Open Questions for User (do not block — defaults chosen)

1. **Domain for sending emails** → default: `vorza.com.br` if owned. Fallback: `mail.bretda.com.br` (subdomain on already-verified bretda DNS).
2. **From-name** → default: "Breno (Vorza)" — personal sender = +20-30% open rate vs. brand-only.
3. **Reply-to** → default: `breno@vorza.com.br` (or personal). Forward/alias setup needed.
4. **Welcome sequence content** → out of scope (copy-chief delivers); tech reserves 4 slots day 0/1/3/7.

---

## 7. Mind Clone Synthesis

- **Werner Vogels:** Approves async webhook pattern + decoupled sync. Flags: monitor Resend bounce rate weekly; bounce >5% = sender reputation damage = revisit warm-up.
- **Kelsey Hightower:** "Don't bring in a marketing automation platform when you have 3 emails." Approves Resend + cron. Warns against premature optimization (e.g., don't build per-subscriber send-time optimization yet).
- **Paul Copplestone:** Approves Postgres-SoT model. Flags: enable RLS from day 0, not later. `service_role` only for backend; client uses anon with `INSERT`-only on `unsubscribe_requests`.
- **Martin Kleppmann:** Approves explicit trade-offs. Flags: idempotency keys are non-negotiable for both inbound forms AND outbound sends. Without them, retry storms double-send to subscribers and burn reputation.

---

## 8. What This Does NOT Do (intentional)

- No A/B testing of subject lines (use Resend's basic broadcast for now; revisit if list >5k).
- No deliverability analytics dashboard (Resend dashboard is enough; build only when justified).
- No CRM (subscribers + purchases tables ARE the CRM at this scale).
- No transactional template marketplace (React Email components in repo).
- No drag-drop email builder (React Email is dev-authored).
