# 15 — Database Schema (Supabase Postgres)

**Author:** @dev (Dex)
**Mind clones:** paul-copplestone (Postgres-first), martin-kleppmann (data design)

---

## 1. Schema Overview

```
subscribers ──┬── purchases (1:N)
              ├── email_events (1:N)
              ├── email_sends (1:N) — outbound dedup
              └── unsubscribe_requests (1:N)

webhook_log ── independent (raw archive)
suppressions ── independent (email-keyed denylist)
data_deletion_requests ── independent (LGPD Art. 18)
```

**Source of truth principles (Kleppmann):**
- `subscribers.email` is the natural identifier (lowercase, unique).
- `subscribers.id` (uuid) is the surrogate FK for everything else.
- Raw payloads ALWAYS persisted before processing (`webhook_log.payload jsonb`).
- Suppressions are a separate denylist, NOT a `subscribers.suppressed` flag — easier to reason about and recover.

**RLS principle (Copplestone):** anon can `INSERT` only into `unsubscribe_requests` and `data_deletion_requests`. All reads + most writes require `service_role`.

---

## 2. Migrations (Supabase SQL)

### Migration 001 — initial schema

```sql
-- ============================================================================
-- 001_initial_schema.sql
-- Vorza Email Marketing — initial schema
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- subscribers
-- ============================================================================
CREATE TABLE subscribers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email           TEXT NOT NULL UNIQUE,
  name            TEXT,
  niche           TEXT CHECK (niche IN ('advogados', 'mei', 'professores', 'customer', 'unknown')),
  source          TEXT NOT NULL CHECK (source IN ('lp-form', 'kiwify', 'kiwify-backfill', 'manual', 'import')),
  consent_at      TIMESTAMPTZ NOT NULL,
  consent_text    TEXT NOT NULL,
  consent_scope   TEXT NOT NULL DEFAULT 'full-marketing'
                    CHECK (consent_scope IN ('purchase-related', 'full-marketing', 'transactional-only')),
  ip_address      INET,
  user_agent      TEXT,
  utm_source      TEXT,
  utm_medium      TEXT,
  utm_campaign    TEXT,
  utm_content     TEXT,
  utm_term        TEXT,
  fbclid          TEXT,
  page_url        TEXT,
  -- Welcome sequence state
  welcome_step    SMALLINT DEFAULT 0,  -- 0=not started, 1-4=in progress, 99=complete/cancelled
  next_send_at    TIMESTAMPTZ,
  -- Engagement
  last_delivered_at TIMESTAMPTZ,
  last_opened_at    TIMESTAMPTZ,
  last_clicked_at   TIMESTAMPTZ,
  -- Lifecycle
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_subscribers_email_lower ON subscribers (lower(email));
CREATE INDEX idx_subscribers_niche ON subscribers (niche);
CREATE INDEX idx_subscribers_welcome_pending ON subscribers (next_send_at) WHERE welcome_step BETWEEN 0 AND 4;
CREATE INDEX idx_subscribers_created ON subscribers (created_at DESC);

-- Trigger: auto-update updated_at
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subscribers_updated_at
  BEFORE UPDATE ON subscribers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- purchases
-- ============================================================================
CREATE TABLE purchases (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscriber_id     UUID NOT NULL REFERENCES subscribers(id) ON DELETE RESTRICT,
  kiwify_order_id   TEXT NOT NULL UNIQUE,
  product_name      TEXT NOT NULL,
  amount_cents      INTEGER NOT NULL DEFAULT 0,
  currency          TEXT NOT NULL DEFAULT 'BRL',
  purchased_at      TIMESTAMPTZ NOT NULL,
  refunded_at       TIMESTAMPTZ,
  refund_reason     TEXT,
  raw_payload       JSONB,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_purchases_subscriber ON purchases (subscriber_id);
CREATE INDEX idx_purchases_kiwify ON purchases (kiwify_order_id);
CREATE INDEX idx_purchases_active ON purchases (subscriber_id) WHERE refunded_at IS NULL;

-- ============================================================================
-- email_sends — dedup outbound (one row per attempted send)
-- ============================================================================
CREATE TABLE email_sends (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscriber_id     UUID NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
  template_id       TEXT NOT NULL,           -- e.g., 'welcome-day-0-receipt'
  campaign_id       TEXT,                    -- nullable for transactional
  resend_message_id TEXT UNIQUE,             -- Resend's email ID
  idempotency_key   TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending', 'sent', 'failed', 'suppressed')),
  error_message     TEXT,
  sent_at           TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Prevent duplicate sends of same template to same subscriber
  UNIQUE (subscriber_id, template_id, idempotency_key)
);

CREATE INDEX idx_email_sends_subscriber ON email_sends (subscriber_id);
CREATE INDEX idx_email_sends_resend_id ON email_sends (resend_message_id);
CREATE INDEX idx_email_sends_status_created ON email_sends (status, created_at DESC);

-- ============================================================================
-- email_events — inbound webhook events from Resend
-- ============================================================================
CREATE TABLE email_events (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscriber_id     UUID REFERENCES subscribers(id) ON DELETE CASCADE,
  email_send_id     UUID REFERENCES email_sends(id) ON DELETE CASCADE,
  resend_message_id TEXT,
  event_type        TEXT NOT NULL CHECK (event_type IN
                      ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained', 'failed')),
  event_data        JSONB,                    -- click URL, bounce reason, etc.
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_email_events_subscriber ON email_events (subscriber_id);
CREATE INDEX idx_email_events_send ON email_events (email_send_id);
CREATE INDEX idx_email_events_type_created ON email_events (event_type, created_at DESC);
CREATE INDEX idx_email_events_resend_id ON email_events (resend_message_id);

-- ============================================================================
-- suppressions — denylist (email-keyed, independent of subscribers)
-- ============================================================================
CREATE TABLE suppressions (
  email           TEXT PRIMARY KEY,
  reason          TEXT NOT NULL CHECK (reason IN
                    ('user_request', 'bounce', 'complaint', 'refund', 'chargeback', 'manual')),
  suppressed_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes           TEXT
);

CREATE INDEX idx_suppressions_reason ON suppressions (reason);

-- ============================================================================
-- webhook_log — raw archive of all incoming webhooks
-- ============================================================================
CREATE TABLE webhook_log (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source              TEXT NOT NULL CHECK (source IN ('kiwify', 'resend', 'meta', 'other')),
  event_type          TEXT,
  external_id         TEXT,                  -- e.g., kiwify order_id
  payload             JSONB NOT NULL,
  headers             JSONB,
  received_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at        TIMESTAMPTZ,
  processing_error    TEXT,
  processing_attempts SMALLINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_webhook_log_unprocessed ON webhook_log (source, received_at)
  WHERE processed_at IS NULL;
CREATE INDEX idx_webhook_log_external ON webhook_log (source, external_id);

-- ============================================================================
-- unsubscribe_requests — public-INSERTable (anon can write here)
-- ============================================================================
CREATE TABLE unsubscribe_requests (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email           TEXT NOT NULL,
  reason          TEXT,
  source          TEXT,                      -- 'email-link', 'manual', 'api'
  ip_address      INET,
  user_agent      TEXT,
  processed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_unsubscribe_unprocessed ON unsubscribe_requests (created_at)
  WHERE processed_at IS NULL;

-- ============================================================================
-- data_deletion_requests — LGPD Art. 18 (right to deletion)
-- ============================================================================
CREATE TABLE data_deletion_requests (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email           TEXT NOT NULL,
  reason          TEXT,
  ip_address      INET,
  user_agent      TEXT,
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'completed', 'rejected')),
  completed_at    TIMESTAMPTZ,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- pending_sync — outbox for Resend audience sync (decoupling)
-- ============================================================================
CREATE TABLE pending_sync (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscriber_id   UUID NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
  operation       TEXT NOT NULL CHECK (operation IN ('add', 'update', 'remove')),
  audience_id     TEXT NOT NULL,
  attempts        SMALLINT NOT NULL DEFAULT 0,
  processed_at    TIMESTAMPTZ,
  error_message   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pending_sync_unprocessed ON pending_sync (created_at)
  WHERE processed_at IS NULL;
```

### Migration 002 — segmentation materialized view

```sql
-- ============================================================================
-- 002_segmentation.sql
-- ============================================================================

CREATE MATERIALIZED VIEW subscriber_segments AS
SELECT
  s.id,
  s.email,
  s.niche,
  s.consent_scope,
  CASE
    WHEN sup.email IS NOT NULL THEN 'suppressed'
    WHEN p.id IS NOT NULL AND p.refunded_at IS NULL THEN 'customer'
    WHEN p.refunded_at IS NOT NULL THEN 'refunded'
    WHEN s.created_at > now() - interval '7 days' THEN 'fresh-lead'
    WHEN ee_stats.opens_30d > 3 THEN 'engaged'
    WHEN ee_stats.opens_30d = 0 AND s.created_at < now() - interval '14 days' THEN 'cold'
    ELSE 'warm'
  END AS segment,
  COALESCE(ee_stats.opens_30d, 0) AS opens_30d,
  COALESCE(ee_stats.clicks_30d, 0) AS clicks_30d,
  s.created_at,
  s.last_opened_at
FROM subscribers s
LEFT JOIN suppressions sup ON sup.email = s.email
LEFT JOIN LATERAL (
  SELECT * FROM purchases p2
  WHERE p2.subscriber_id = s.id
  ORDER BY p2.purchased_at DESC LIMIT 1
) p ON true
LEFT JOIN (
  SELECT
    subscriber_id,
    COUNT(*) FILTER (WHERE event_type='opened' AND created_at > now() - interval '30 days') AS opens_30d,
    COUNT(*) FILTER (WHERE event_type='clicked' AND created_at > now() - interval '30 days') AS clicks_30d
  FROM email_events
  WHERE created_at > now() - interval '30 days'
  GROUP BY subscriber_id
) ee_stats ON ee_stats.subscriber_id = s.id;

CREATE UNIQUE INDEX idx_subscriber_segments_id ON subscriber_segments (id);
CREATE INDEX idx_subscriber_segments_segment ON subscriber_segments (segment, niche);

-- Refresh every 1 hour via pg_cron OR Vercel cron
-- pg_cron version (if extension available):
-- SELECT cron.schedule('refresh-segments', '0 * * * *',
--   $$REFRESH MATERIALIZED VIEW CONCURRENTLY subscriber_segments$$);
```

### Migration 003 — Row Level Security

```sql
-- ============================================================================
-- 003_rls_policies.sql
-- LGPD compliance: only service_role reads PII; anon can only INSERT to unsub
-- ============================================================================

ALTER TABLE subscribers              ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases                ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_sends              ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_events             ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppressions             ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_log              ENABLE ROW LEVEL SECURITY;
ALTER TABLE unsubscribe_requests     ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_deletion_requests   ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_sync             ENABLE ROW LEVEL SECURITY;

-- subscribers: NO anon access, service_role full access
CREATE POLICY "service_role_all_subscribers" ON subscribers
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- purchases: NO anon access
CREATE POLICY "service_role_all_purchases" ON purchases
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- email_sends: NO anon access
CREATE POLICY "service_role_all_email_sends" ON email_sends
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- email_events: NO anon access
CREATE POLICY "service_role_all_email_events" ON email_events
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- suppressions: NO anon access
CREATE POLICY "service_role_all_suppressions" ON suppressions
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- webhook_log: NO anon access
CREATE POLICY "service_role_all_webhook_log" ON webhook_log
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- pending_sync: NO anon access
CREATE POLICY "service_role_all_pending_sync" ON pending_sync
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- unsubscribe_requests: anon can INSERT only (one-way drop-box)
CREATE POLICY "service_role_all_unsub" ON unsubscribe_requests
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "anon_insert_unsub" ON unsubscribe_requests
  FOR INSERT TO anon WITH CHECK (true);

-- data_deletion_requests: anon can INSERT only
CREATE POLICY "service_role_all_deletion" ON data_deletion_requests
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "anon_insert_deletion" ON data_deletion_requests
  FOR INSERT TO anon WITH CHECK (true);
```

### Migration 004 — data retention helpers (LGPD Art. 16)

```sql
-- ============================================================================
-- 004_retention.sql
-- LGPD Art. 16: data retention cleanup
-- ============================================================================

-- Anonymize subscribers who haven't engaged in 24 months and have no purchases
CREATE OR REPLACE FUNCTION anonymize_stale_subscribers() RETURNS INTEGER AS $$
DECLARE
  affected INTEGER;
BEGIN
  WITH stale AS (
    SELECT s.id FROM subscribers s
    LEFT JOIN purchases p ON p.subscriber_id = s.id
    WHERE s.created_at < now() - interval '24 months'
      AND s.last_opened_at IS NULL OR s.last_opened_at < now() - interval '24 months'
      AND p.id IS NULL
  )
  UPDATE subscribers s
  SET
    email = 'anonymized-' || s.id || '@vorza.invalid',
    name = NULL,
    ip_address = NULL,
    user_agent = NULL,
    utm_source = NULL, utm_medium = NULL, utm_campaign = NULL,
    utm_content = NULL, utm_term = NULL, fbclid = NULL
  FROM stale
  WHERE s.id = stale.id;

  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$$ LANGUAGE plpgsql;

-- Process data_deletion_requests (call daily via cron)
CREATE OR REPLACE FUNCTION process_data_deletion_requests() RETURNS INTEGER AS $$
DECLARE
  affected INTEGER := 0;
  req RECORD;
BEGIN
  FOR req IN
    SELECT * FROM data_deletion_requests
    WHERE status = 'pending' AND created_at < now() - interval '7 days'
  LOOP
    UPDATE subscribers SET
      email = 'deleted-' || req.id || '@vorza.invalid',
      name = NULL, ip_address = NULL, user_agent = NULL,
      utm_source = NULL, utm_medium = NULL, utm_campaign = NULL,
      utm_content = NULL, utm_term = NULL, fbclid = NULL
    WHERE email = req.email;

    INSERT INTO suppressions (email, reason, suppressed_at)
    VALUES (req.email, 'user_request', now())
    ON CONFLICT (email) DO NOTHING;

    UPDATE data_deletion_requests
    SET status = 'completed', completed_at = now()
    WHERE id = req.id;

    affected := affected + 1;
  END LOOP;
  RETURN affected;
END;
$$ LANGUAGE plpgsql;
```

---

## 3. Why These Choices (Kleppmann lens)

| Decision | Rationale |
|----------|-----------|
| `email` lowercased + unique constraint | Natural key; deduplication at the database layer, not app layer |
| `subscribers.id` as UUID FK target | Surrogate key resilient to email changes (Art. 18 deletion = re-anon, FK preserved) |
| `webhook_log.payload jsonb` archive | Decouple ingest from processing; replay capability if processor bug |
| `pending_sync` outbox table | Async sync to Resend; if Resend is down, signups still succeed |
| `email_sends` UNIQUE on (subscriber, template, idem_key) | Idempotency — cron can retry without duplicate sends |
| `suppressions` as separate table | Suppression survives subscriber deletion/anonymization |
| Materialized view for segments | Heavy aggregation precomputed; segment lookups cheap |
| RLS from day 0 | LGPD audit posture; service_role-only is least-privilege |

**Trade-offs explicitly NOT made (yet):**
- No partitioning on `email_events` — fine until 10M+ events. Partition by month then.
- No event sourcing for subscriber state changes — current state in `subscribers` is enough; if audit demand arises, add `subscribers_history` table.
- No multi-region replication — Supabase Free is single-region (us-east). For BR users with heavy traffic, upgrade to São Paulo region (Pro plan).

---

## 4. Operational Queries (cheat sheet)

```sql
-- Subscribers count by niche + segment
SELECT niche, segment, COUNT(*) FROM subscriber_segments GROUP BY 1, 2 ORDER BY 1, 2;

-- Recent purchases (last 7 days)
SELECT s.email, p.product_name, p.amount_cents/100.0 AS amount, p.purchased_at
FROM purchases p JOIN subscribers s ON s.id = p.subscriber_id
WHERE p.purchased_at > now() - interval '7 days'
ORDER BY p.purchased_at DESC;

-- Bounce rate last 7 days
SELECT
  COUNT(*) FILTER (WHERE event_type='bounced')::float / NULLIF(COUNT(*) FILTER (WHERE event_type='delivered'), 0) AS bounce_rate
FROM email_events WHERE created_at > now() - interval '7 days';

-- Unprocessed webhook backlog
SELECT source, COUNT(*) AS unprocessed,
  EXTRACT(EPOCH FROM (now() - MIN(received_at))) AS oldest_seconds
FROM webhook_log WHERE processed_at IS NULL GROUP BY source;

-- Pending welcome sends due now
SELECT id, email, welcome_step, next_send_at
FROM subscribers
WHERE welcome_step BETWEEN 0 AND 4 AND next_send_at <= now()
ORDER BY next_send_at ASC LIMIT 50;
```

---

## 5. Self-Critique

- ✅ RLS on every PII table; anon limited to one-way INSERT on opt-out tables.
- ✅ Idempotency via UNIQUE constraints (kiwify_order_id, email_sends triple).
- ✅ Raw webhook archive enables replay.
- ✅ Suppressions decoupled from subscribers (survives anonymization).
- ✅ LGPD Art. 16 (retention) + Art. 18 (deletion) functions defined.
- ⚠ `subscriber_segments` materialized view needs scheduled refresh — choose pg_cron OR Vercel cron, document choice.
- ⚠ `pending_sync` deduplication — same subscriber added/removed rapidly creates queue churn. Add `ON CONFLICT (subscriber_id, audience_id) DO UPDATE SET operation = EXCLUDED.operation` later if it bites.
- ⚠ No archive policy on `webhook_log` — can grow unbounded. Add monthly partition or 90-day TTL post-launch when volume known.
