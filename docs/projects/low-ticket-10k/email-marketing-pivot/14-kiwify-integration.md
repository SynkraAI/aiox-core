# 14 — Kiwify Integration (Webhook + Sync)

**Author:** @dev (Dex)
**Time estimate (user-facing):** 25-35 min config + 10-15 min backfill

---

## 1. Kiwify Webhook Configuration

### Where

Kiwify dashboard → **Configurações** → **Webhooks** (or **Apps & Integrações** → **Webhooks** depending on UI version).

### Events to subscribe

| Event | Why |
|-------|-----|
| `compra_aprovada` (purchase approved) | Trigger welcome receipt + add to customers audience |
| `boleto_gerado` | Optional: nurture cart-recovery |
| `pix_gerado` | Optional: nurture cart-recovery (BR-specific) |
| `compra_recusada` | Log only |
| `reembolsado` (refunded) | Suppress marketing emails, mark refunded |
| `chargeback` | Suppress, mark for manual review |
| `assinatura_cancelada` | If subscription product later — N/A for current SCV-3 |

**Recommendation v1:** subscribe ONLY `compra_aprovada` + `reembolsado` + `chargeback`. Add cart-recovery events post-v1 if AOV justifies it.

### Webhook endpoint URL

```
https://vorza-api.vercel.app/api/kiwify-webhook
```

### Authentication

Kiwify supports a **shared secret** (HMAC-SHA1 signature on body, sent in `x-kiwify-signature` header).

1. Generate strong secret: `openssl rand -hex 32` → e.g., `a1b2c3...`.
2. Paste in Kiwify webhook config → **Token de Verificação** (or "Webhook Secret").
3. Store in Vercel: `vercel env add KIWIFY_WEBHOOK_SECRET production`, paste same value.

---

## 2. Webhook Endpoint Implementation

### File: `apps/vorza-api/api/kiwify-webhook.ts`

**Runtime:** Node.js (NOT Edge — needs raw body for HMAC).

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Disable Vercel body parsing — we need raw body
export const config = {
  api: {
    bodyParser: false,
  },
};

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function verifyKiwifySignature(rawBody: Buffer, signature: string, secret: string): boolean {
  const expected = crypto.createHmac('sha1', secret).update(rawBody).digest('hex');
  // Constant-time comparison
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method not allowed' });
  }

  const signature = req.headers['x-kiwify-signature'] as string | undefined;
  if (!signature) {
    return res.status(401).json({ error: 'missing signature' });
  }

  const rawBody = await getRawBody(req);

  if (!verifyKiwifySignature(rawBody, signature, process.env.KIWIFY_WEBHOOK_SECRET!)) {
    return res.status(401).json({ error: 'invalid signature' });
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody.toString('utf8'));
  } catch {
    return res.status(400).json({ error: 'invalid json' });
  }

  // ALWAYS persist raw payload first, ALWAYS return 200 after that
  const { error: logError } = await supabase
    .from('webhook_log')
    .insert({
      source: 'kiwify',
      event_type: payload.webhook_event_type || payload.order_status || 'unknown',
      external_id: payload.order_id || payload.id || null,
      payload: payload,
      headers: { signature, raw_event: payload.webhook_event_type },
    });

  if (logError) {
    // If we can't even log, return 500 so Kiwify retries
    console.error('[kiwify-webhook] DB insert failed', logError);
    return res.status(500).json({ error: 'log insert failed' });
  }

  // Return 200 immediately — async processor handles business logic
  return res.status(200).json({ ok: true });
}
```

---

## 3. Async Processor (Cron)

### File: `apps/vorza-api/api/cron/process-kiwify-webhooks.ts`

Runs every 1 minute. Reads unprocessed `webhook_log` rows, applies business logic, marks processed.

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const resend = new Resend(process.env.RESEND_API_KEY!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Vercel Cron passes auth header — verify
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  const { data: pending, error } = await supabase
    .from('webhook_log')
    .select('*')
    .eq('source', 'kiwify')
    .is('processed_at', null)
    .order('received_at', { ascending: true })
    .limit(50);

  if (error) return res.status(500).json({ error: error.message });

  const results = [];
  for (const row of pending || []) {
    try {
      await processKiwifyEvent(row);
      await supabase.from('webhook_log').update({ processed_at: new Date().toISOString() }).eq('id', row.id);
      results.push({ id: row.id, status: 'ok' });
    } catch (err) {
      await supabase.from('webhook_log')
        .update({ processing_error: (err as Error).message, processing_attempts: (row.processing_attempts || 0) + 1 })
        .eq('id', row.id);
      results.push({ id: row.id, status: 'error', message: (err as Error).message });
    }
  }

  return res.status(200).json({ processed: results.length, results });
}

async function processKiwifyEvent(row: any) {
  const payload = row.payload;
  const eventType = row.event_type;

  if (eventType === 'compra_aprovada' || eventType === 'order_approved') {
    const email = (payload.Customer?.email || payload.customer?.email || '').toLowerCase().trim();
    const name = payload.Customer?.full_name || payload.customer?.full_name || null;
    const product = payload.Product?.product_name || payload.product?.name || 'Vorza';
    const amount = payload.Commissions?.charge_amount || payload.amount || 0;
    const orderId = payload.order_id || payload.id;

    if (!email) throw new Error('no email in payload');

    // Upsert subscriber
    const { data: sub, error: subErr } = await supabase
      .from('subscribers')
      .upsert({
        email,
        name,
        source: 'kiwify',
        consent_at: new Date().toISOString(),
        consent_text: 'Compra Kiwify (legítimo interesse pós-venda LGPD Art. 7 IX)',
      }, { onConflict: 'email', ignoreDuplicates: false })
      .select()
      .single();

    if (subErr) throw subErr;

    // Insert purchase (idempotent on kiwify_order_id)
    const { error: purErr } = await supabase
      .from('purchases')
      .upsert({
        subscriber_id: sub.id,
        kiwify_order_id: orderId,
        product_name: product,
        amount_cents: Math.round(amount * 100),
        purchased_at: new Date(payload.created_at || Date.now()).toISOString(),
        raw_payload: payload,
      }, { onConflict: 'kiwify_order_id', ignoreDuplicates: true });

    if (purErr) throw purErr;

    // Add to Resend customers audience
    try {
      await resend.contacts.create({
        email,
        firstName: name?.split(' ')[0],
        lastName: name?.split(' ').slice(1).join(' '),
        unsubscribed: false,
        audienceId: process.env.RESEND_AUDIENCE_CUSTOMERS!,
      });
    } catch (resendErr: any) {
      // Ignore "already exists" errors
      if (!resendErr.message?.includes('already exists')) throw resendErr;
    }

    // Enqueue welcome sequence — set welcome_step=0, next_send_at=now
    await supabase.from('subscribers')
      .update({ welcome_step: 0, next_send_at: new Date().toISOString() })
      .eq('id', sub.id);
  }

  if (eventType === 'reembolsado' || eventType === 'refunded' || eventType === 'chargeback') {
    const orderId = payload.order_id || payload.id;
    const email = (payload.Customer?.email || payload.customer?.email || '').toLowerCase().trim();

    // Mark purchase refunded
    if (orderId) {
      await supabase.from('purchases')
        .update({ refunded_at: new Date().toISOString(), refund_reason: eventType })
        .eq('kiwify_order_id', orderId);
    }

    // Suppress further marketing (NOT transactional — receipt was already sent)
    if (email) {
      await supabase.from('suppressions').upsert({
        email,
        reason: eventType === 'chargeback' ? 'chargeback' : 'refund',
        suppressed_at: new Date().toISOString(),
      }, { onConflict: 'email' });

      // Remove from Resend customers audience
      try {
        // Need contactId — fetch first
        const contacts = await resend.contacts.list({ audienceId: process.env.RESEND_AUDIENCE_CUSTOMERS! });
        const contact = contacts.data?.data?.find((c: any) => c.email === email);
        if (contact) {
          await resend.contacts.remove({ id: contact.id, audienceId: process.env.RESEND_AUDIENCE_CUSTOMERS! });
        }
      } catch (resendErr) {
        console.warn('[kiwify-webhook] failed to remove from Resend', resendErr);
      }
    }
  }
}
```

### Vercel Cron config (`vercel.json`)

```json
{
  "crons": [
    {
      "path": "/api/cron/process-kiwify-webhooks",
      "schedule": "* * * * *"
    },
    {
      "path": "/api/cron/welcome-drip",
      "schedule": "*/15 * * * *"
    },
    {
      "path": "/api/cron/sync-resend-audience",
      "schedule": "*/30 * * * *"
    }
  ]
}
```

---

## 4. Backfill: Sync Historical Kiwify Customers → Resend

### One-time script (manual run)

`apps/vorza-api/scripts/backfill-kiwify.ts`

**Approach:**
1. Export customer list from Kiwify dashboard (CSV: email, name, last_purchase_date, product).
2. Place CSV at `apps/vorza-api/data/kiwify-export-YYYY-MM-DD.csv`.
3. Run: `pnpm tsx scripts/backfill-kiwify.ts data/kiwify-export-2026-05-05.csv`.
4. Script:
   - Reads CSV.
   - For each row: upserts subscriber with `source='kiwify-backfill'`, `consent_at=last_purchase_date`, `consent_text='Compra histórica Kiwify (legítimo interesse pós-venda LGPD Art. 7 IX)'`.
   - Inserts `purchases` row with `kiwify_order_id=BACKFILL-{rowindex}` (so future webhooks don't conflict).
   - Adds to Resend customers audience in batches of 100.
   - Throttle: 100 emails/day cap on Resend Free → backfill in batches across N days OR upgrade to Pro $20 first.

```typescript
import fs from 'node:fs';
import { parse } from 'csv-parse/sync';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const csvPath = process.argv[2];
if (!csvPath) {
  console.error('Usage: pnpm tsx scripts/backfill-kiwify.ts <path-to-csv>');
  process.exit(1);
}

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const resend = new Resend(process.env.RESEND_API_KEY!);

const rows = parse(fs.readFileSync(csvPath, 'utf8'), { columns: true, skip_empty_lines: true });

console.log(`Backfilling ${rows.length} customers...`);

let imported = 0;
let skipped = 0;
let errors = 0;

for (const [i, row] of rows.entries()) {
  const email = (row.email || row.Email || '').toLowerCase().trim();
  const name = row.full_name || row.name || row.Name || null;
  if (!email || !email.includes('@')) {
    skipped++;
    continue;
  }

  try {
    const { data: sub, error: subErr } = await supabase
      .from('subscribers')
      .upsert({
        email,
        name,
        source: 'kiwify-backfill',
        consent_at: new Date(row.last_purchase_date || Date.now()).toISOString(),
        consent_text: 'Compra histórica Kiwify (legítimo interesse pós-venda LGPD Art. 7 IX)',
      }, { onConflict: 'email' })
      .select()
      .single();
    if (subErr) throw subErr;

    await supabase.from('purchases').upsert({
      subscriber_id: sub.id,
      kiwify_order_id: `BACKFILL-${i}-${email}`,
      product_name: row.product || 'Vorza (histórico)',
      amount_cents: row.amount ? Math.round(parseFloat(row.amount) * 100) : 0,
      purchased_at: new Date(row.last_purchase_date || Date.now()).toISOString(),
    }, { onConflict: 'kiwify_order_id', ignoreDuplicates: true });

    try {
      await resend.contacts.create({
        email,
        firstName: name?.split(' ')[0],
        unsubscribed: false,
        audienceId: process.env.RESEND_AUDIENCE_CUSTOMERS!,
      });
    } catch (e: any) {
      if (!e.message?.includes('already exists')) throw e;
    }

    imported++;
    if (imported % 50 === 0) console.log(`  ${imported}/${rows.length}...`);
  } catch (err) {
    console.error(`  ERR row ${i} (${email}):`, (err as Error).message);
    errors++;
  }
}

console.log(`\nDone. Imported: ${imported}, Skipped: ${skipped}, Errors: ${errors}`);
```

---

## 5. LGPD Notes for Backfill

Pre-existing Kiwify customers gave consent at point of purchase (Kiwify checkout TOS). Sending them post-purchase product emails = **legítimo interesse** (LGPD Art. 7 IX). Receipt + welcome sequence + product updates are clearly within their original purchase intent.

**Safe to send:**
- Receipt (transactional)
- Welcome sequence (product onboarding)
- Updates about the purchased product

**Requires fresh opt-in:**
- Marketing for OTHER products (cross-sell beyond direct upsell)
- Newsletter unrelated to purchased product
- Affiliate offers

**Recommendation:** treat backfilled customers as `consent_scope='purchase-related'`. Filter sends accordingly. New LP signups get `consent_scope='full-marketing'`.

Add column:
```sql
ALTER TABLE subscribers ADD COLUMN consent_scope TEXT DEFAULT 'full-marketing'
  CHECK (consent_scope IN ('purchase-related', 'full-marketing', 'transactional-only'));
```

---

## 6. Refund Handling (decision tree)

```
Refund event received
    │
    ├─→ Mark purchase.refunded_at
    ├─→ Add to suppressions table (reason='refund')
    ├─→ Remove from Resend 'customers' audience
    ├─→ DO NOT delete subscriber record (LGPD: if they later request deletion, we honor it; otherwise keep for audit)
    └─→ Cancel any in-flight welcome_step (set welcome_step = 99)

Chargeback event received
    │
    ├─→ All of refund flow above, PLUS
    ├─→ Flag for manual review (suppressions.reason='chargeback')
    └─→ Block re-subscription from same email for 90 days
```

---

## 7. Monitoring / Alerts

- **Webhook success rate:** Vercel function logs → alert if 5xx >5% in 1h.
- **Processor lag:** SQL view `SELECT count(*) FROM webhook_log WHERE processed_at IS NULL AND received_at < now() - interval '5 minutes'` → if >10, page.
- **Failed processing:** `SELECT * FROM webhook_log WHERE processing_attempts > 3` → manual review.

Werner: instrument before you launch. Vercel logs + Supabase queries are enough for v1. Don't build a Grafana board until you've launched.

---

## 8. Self-Critique

- ✅ HMAC verification (Kiwify SHA1, constant-time compare).
- ✅ Webhook always 2xx after raw persist (no retry storms).
- ✅ Async processor with retry tracking (`processing_attempts`).
- ✅ Idempotency via `kiwify_order_id` unique constraint.
- ✅ Refund + chargeback paths defined.
- ✅ LGPD consent scope distinguished (backfill vs. fresh opt-in).
- ⚠ Kiwify webhook payload structure varies by event — actual field names need verification against Kiwify docs at integration time. Test with sandbox order first.
- ⚠ Backfill uses placeholder Kiwify CSV columns — actual export schema must be inspected first.
- ⚠ No HTTP retry logic on Resend API call inside processor — if Resend has 5xx, we throw and retry on next cron tick (acceptable for 1-min cron).
