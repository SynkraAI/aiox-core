# 13 — Resend Setup (Vorza)

**Author:** @dev (Dex)
**Time estimate (user-facing):** 30-45 min hands-on + 1-4h DNS propagation wait

---

## 1. Account Creation

1. Go to https://resend.com/signup.
2. Sign up with **breno@vorza.com.br** (or personal email if domain not yet active).
3. Use the same Vercel/GitHub login if you want SSO across the AIOS toolchain.
4. Choose plan: **Free tier** (3,000 emails/month, 100/day, 1 verified domain) — sufficient for Vorza's first 30-60 days.
5. Free tier limits to be aware of:
   - 100 emails per day → if welcome sequence has 4 emails and you onboard 25+ customers in a day, you hit the cap.
   - No dedicated IP → shared sender reputation; warm up gradually.
   - No team seats → only your account.

**Upgrade trigger:** when you hit either >2,500/mo OR >50 emails/day for 3 consecutive days, upgrade to **Pro $20/mo** (50,000 emails/mo, 10 domains, dedicated IP option for +$30).

---

## 2. Domain Verification

### Decision: which domain?

| Option | Pros | Cons | Recommendation |
|--------|------|------|----------------|
| `vorza.com.br` (root) | Clean, brand-aligned | Burns root domain reputation if list goes south | ✅ if Vorza is the long-term brand |
| `mail.vorza.com.br` (subdomain) | Isolates email rep from root | Slightly less trusted by some inbox providers | ✅ industry best practice |
| `mail.bretda.com.br` (fallback) | Bretda DNS already verified on Vercel | Mixes brands; recipients see "bretda" sender | ❌ only if vorza.com.br not registered |

**Recommendation:** `mail.vorza.com.br` (subdomain isolation = Werner's "blast radius" principle).

If `vorza.com.br` is **not yet registered**, register it on Registro.br (R$40/year) BEFORE this step. This blocks everything else.

### DNS Records to Add

Resend dashboard → **Domains** → **Add domain** → enter `mail.vorza.com.br` (or chosen) → Resend shows you these 3 records:

```
Type    Name                          Value                                                Priority
MX      send.mail.vorza.com.br        feedback-smtp.us-east-1.amazonses.com               10
TXT     send.mail.vorza.com.br        "v=spf1 include:amazonses.com ~all"
TXT     resend._domainkey.mail        p=MIGfMA0GCSq...  (long DKIM key shown by Resend)
```

Plus DMARC (recommended):
```
Type    Name                          Value
TXT     _dmarc.mail.vorza.com.br      "v=DMARC1; p=none; rua=mailto:dmarc-reports@vorza.com.br; pct=100; adkim=s; aspf=s"
```

**Where to add:** wherever DNS for `vorza.com.br` is hosted.
- If Vercel manages the domain → Vercel dashboard → Domains → vorza.com.br → DNS Records.
- If Registro.br DNS → Registro.br panel → Editor de zona.
- If Cloudflare → Cloudflare DNS → vorza.com.br → Records.

**Wait:** 5-30 min usually, up to 4h. Resend dashboard auto-checks. Refresh until green checkmarks on all 3 records.

---

## 3. API Key Generation

1. Resend dashboard → **API Keys** → **Create API Key**.
2. Name: `vorza-vercel-prod`.
3. Permission: **Sending access** only (NOT Full access — least privilege).
4. Domain restriction: **mail.vorza.com.br** only.
5. Copy the key (`re_xxxxxxxxxx`) immediately — it's shown ONCE.
6. Store in Vercel: `vercel env add RESEND_API_KEY production`, paste value.
7. Add a second key for staging if needed: `vorza-vercel-preview`.

**Security:** rotate every 90 days. Never commit to git. Never put in client JS.

---

## 4. React Email Setup (template authoring)

### Install

In a Vercel project (e.g., `apps/vorza-api/` if separate, or alongside other Vercel functions):

```bash
pnpm add resend react-email @react-email/components
pnpm add -D @react-email/render
```

### File structure

```
apps/vorza-api/
├── emails/
│   ├── welcome-day-0-receipt.tsx
│   ├── welcome-day-1-getting-started.tsx
│   ├── welcome-day-3-case-study.tsx
│   ├── welcome-day-7-upsell-scv3.tsx
│   ├── lead-magnet-niche-advogados.tsx
│   ├── lead-magnet-niche-mei.tsx
│   ├── lead-magnet-niche-professores.tsx
│   └── components/
│       ├── footer.tsx
│       └── layout.tsx
├── api/
│   ├── subscribe.ts
│   ├── kiwify-webhook.ts
│   ├── resend-webhook.ts
│   ├── unsubscribe.ts
│   └── cron/
│       ├── welcome-drip.ts
│       └── sync-resend-audience.ts
└── package.json
```

### Sample template — `emails/welcome-day-0-receipt.tsx`

```tsx
import {
  Body, Button, Container, Head, Heading, Html, Img, Link,
  Preview, Section, Text,
} from '@react-email/components';
import * as React from 'react';
import { Footer } from './components/footer';

interface ReceiptEmailProps {
  customerName?: string;
  productName: string;
  amount: string;
  unsubscribeUrl: string;
  niche: string;
}

export default function ReceiptEmail({
  customerName = 'amigo',
  productName,
  amount,
  unsubscribeUrl,
  niche,
}: ReceiptEmailProps) {
  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>Seu acesso à Vorza tá liberado. Tudo dentro deste email.</Preview>
      <Body style={{ backgroundColor: '#f6f8fa', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <Container style={{ maxWidth: '560px', margin: '40px auto', backgroundColor: '#ffffff', padding: '32px', borderRadius: '12px' }}>
          <Heading as="h1" style={{ fontSize: '24px', color: '#0f172a' }}>
            Compra confirmada, {customerName} 🎯
          </Heading>
          <Text style={{ fontSize: '16px', color: '#334155', lineHeight: '1.6' }}>
            Você acabou de garantir <strong>{productName}</strong> por <strong>{amount}</strong>.
          </Text>
          <Text style={{ fontSize: '16px', color: '#334155', lineHeight: '1.6' }}>
            Acesso completo: <Link href="https://vorza.com.br/acesso">vorza.com.br/acesso</Link>
          </Text>
          <Section style={{ textAlign: 'center', margin: '32px 0' }}>
            <Button href="https://vorza.com.br/acesso" style={{ backgroundColor: '#2563eb', color: '#fff', padding: '14px 28px', borderRadius: '8px', fontWeight: 'bold' }}>
              Abrir agora
            </Button>
          </Section>
          <Text style={{ fontSize: '14px', color: '#64748b' }}>
            Nos próximos dias vou te mandar 3 emails curtos com como tirar o máximo dos prompts. Pode confiar — sem enrolação.
          </Text>
          <Footer unsubscribeUrl={unsubscribeUrl} niche={niche} />
        </Container>
      </Body>
    </Html>
  );
}
```

### Reusable footer — `emails/components/footer.tsx`

```tsx
import { Hr, Link, Section, Text } from '@react-email/components';
import * as React from 'react';

export function Footer({ unsubscribeUrl, niche }: { unsubscribeUrl: string; niche: string }) {
  return (
    <Section>
      <Hr style={{ borderColor: '#e2e8f0', margin: '32px 0 16px' }} />
      <Text style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center' }}>
        Vorza — Prompts AI que viram receita.
      </Text>
      <Text style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center' }}>
        Você está recebendo este email porque se inscreveu na lista <strong>{niche}</strong>.
        <br />
        <Link href={unsubscribeUrl} style={{ color: '#94a3b8' }}>Cancelar inscrição</Link>
        {' · '}
        <Link href="https://vorza.com.br/politica-privacidade" style={{ color: '#94a3b8' }}>Política de privacidade</Link>
      </Text>
    </Section>
  );
}
```

---

## 5. Audience Setup (Resend dashboard)

1. Resend dashboard → **Audiences** → **Create audience**.
2. Create 4 audiences:
   - `vorza-advogados` (lead magnet subscribers, niche=advogados)
   - `vorza-mei` (niche=mei)
   - `vorza-professores` (niche=professores)
   - `vorza-customers` (post-purchase, all niches mixed)
3. Note the audience IDs (UUIDs) — store in Vercel env:
   ```
   RESEND_AUDIENCE_ADVOGADOS=aud_xxx
   RESEND_AUDIENCE_MEI=aud_xxx
   RESEND_AUDIENCE_PROFESSORES=aud_xxx
   RESEND_AUDIENCE_CUSTOMERS=aud_xxx
   ```

---

## 6. Send via API — code example

`apps/vorza-api/api/send-welcome.ts` (called by cron):

```typescript
import { Resend } from 'resend';
import { render } from '@react-email/render';
import ReceiptEmail from '../emails/welcome-day-0-receipt';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendWelcomeReceipt(params: {
  to: string;
  customerName?: string;
  productName: string;
  amount: string;
  unsubscribeUrl: string;
  niche: string;
  idempotencyKey: string;
}) {
  const html = render(
    ReceiptEmail({
      customerName: params.customerName,
      productName: params.productName,
      amount: params.amount,
      unsubscribeUrl: params.unsubscribeUrl,
      niche: params.niche,
    })
  );

  const { data, error } = await resend.emails.send({
    from: 'Breno (Vorza) <breno@mail.vorza.com.br>',
    to: params.to,
    subject: `Compra confirmada — ${params.productName}`,
    html,
    headers: {
      'List-Unsubscribe': `<${params.unsubscribeUrl}>, <mailto:unsubscribe@mail.vorza.com.br?subject=unsubscribe>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      'X-Idempotency-Key': params.idempotencyKey,
    },
    tags: [
      { name: 'sequence', value: 'welcome' },
      { name: 'step', value: 'day-0-receipt' },
      { name: 'niche', value: params.niche },
    ],
  });

  if (error) throw new Error(`Resend send failed: ${error.message}`);
  return data;
}
```

**Important:** `List-Unsubscribe` headers (RFC 8058 one-click) are required by Gmail/Yahoo for senders >5k/day. Add them now to avoid future migration.

---

## 7. Resend Webhook Setup

1. Resend dashboard → **Webhooks** → **Add Endpoint**.
2. URL: `https://vorza-api.vercel.app/api/resend-webhook`.
3. Events to subscribe:
   - `email.sent` — log
   - `email.delivered` — log + update subscriber.last_delivered_at
   - `email.bounced` — log + INSERT suppression
   - `email.complained` — log + INSERT suppression + flag for review
   - `email.opened` — log (for engagement scoring)
   - `email.clicked` — log (for engagement scoring)
4. Save. Resend gives you a **signing secret** (`whsec_xxx`) — store as `RESEND_WEBHOOK_SECRET` in Vercel.

### Verifying webhook signature (Svix)

```typescript
import { Webhook } from 'svix';

export default async function handler(req, res) {
  const wh = new Webhook(process.env.RESEND_WEBHOOK_SECRET!);
  const headers = {
    'svix-id': req.headers['svix-id'],
    'svix-timestamp': req.headers['svix-timestamp'],
    'svix-signature': req.headers['svix-signature'],
  };
  const rawBody = await getRawBody(req); // see Vercel docs for raw body
  let evt;
  try {
    evt = wh.verify(rawBody, headers);
  } catch (err) {
    return res.status(401).json({ error: 'invalid signature' });
  }
  // ... persist event to webhook_log + email_events
  return res.status(200).json({ ok: true });
}
```

---

## 8. Pricing Decision Matrix

| Stage | Volume | Plan | Cost |
|-------|--------|------|------|
| Launch (week 1-4) | <1,000 emails/mo | Free | $0 |
| Growth (month 2-4) | 1k-10k emails/mo | Pro | $20/mo |
| Scale (month 6+) | 10k-50k emails/mo | Pro | $20/mo |
| Mass-send | 50k-100k emails/mo | Business | $90/mo |

**Vorza fit:** stay on Free until welcome sequence + 1 broadcast/week × 500 subscribers = ~2,500/mo. Should be 4-8 weeks of runway.

---

## 9. Deliverability Best Practices (warm-up)

1. **Week 1:** transactional only (welcome receipt to actual customers, ~10/day).
2. **Week 2:** add 1 educational email/week to engaged subscribers (<200 recipients).
3. **Week 3:** broaden to all subscribers <30 days old.
4. **Week 4+:** weekly newsletter to full list.
5. **Never:** import a 10k cold list and blast on day 1 — instant Spamhaus listing.
6. **Monitor:** bounce rate <2%, complaint rate <0.1%, open rate >20%. Below these = pause and investigate.

---

## 10. Self-Critique

- ✅ Domain isolated on subdomain (blast radius).
- ✅ DNS records spec'd (SPF + DKIM + DMARC).
- ✅ API key restricted scope.
- ✅ One-click unsubscribe headers (RFC 8058).
- ✅ Webhook HMAC verification (Svix).
- ⚠ DNS propagation can take 4h — block scheduling first send for next-day after domain verification.
- ⚠ Free tier 100/day cap is a real cliff — if Kiwify backfill has 200 historical customers, send in 2 batches across 2 days.
- ⚠ Need to register `vorza.com.br` if not yet owned. Pre-flight check.
