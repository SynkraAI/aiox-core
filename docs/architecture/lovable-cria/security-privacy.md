# Lovable Cria Quiz - Security & Data Privacy

**Story:** LOV-1 Lovable Quiz Integration
**Author:** @architect (Aria)
**Date:** 2026-02-22

---

## 1. Threat Model

| Threat | Likelihood | Impact | Mitigation |
|--------|-----------|--------|------------|
| XSS via form inputs | Medium | High | Input sanitization, React auto-escaping, CSP headers |
| SQL injection | Low | Critical | Supabase parameterized queries (built-in) |
| Spam submissions | Medium | Medium | Dedup index, optional rate limiting Edge Function |
| PII data breach | Low | Critical | RLS, minimal data collection, encryption at rest |
| Supabase anon key abuse | Medium | Low | RLS restricts operations; anon key only allows INSERT + limited SELECT |
| CSRF | Low | Low | No session/cookie auth; Supabase uses API key in header |

---

## 2. Input Security

### XSS Prevention

- React escapes all rendered values by default (JSX auto-escaping)
- No use of `dangerouslySetInnerHTML` anywhere in quiz components
- Form inputs are controlled components (values stored in state, not raw DOM)
- User-provided text (name, email) is never rendered as HTML

### Input Sanitization (Pre-Insert)

```typescript
function sanitizeLeadData(data: LeadData): LeadData {
  return {
    name: data.name.trim().slice(0, 100),
    email: data.email.trim().toLowerCase().slice(0, 254),
    whatsapp: data.whatsapp ? data.whatsapp.replace(/[^\d+]/g, '').slice(0, 15) : '',
    lgpdConsent: data.lgpdConsent,
  };
}
```

### SQL Injection

Not applicable. Supabase client SDK uses parameterized queries internally. No raw SQL is ever constructed from user input.

---

## 3. Supabase Security Configuration

### RLS (Row Level Security)

All tables have RLS enabled. Policies are defined in `database-schema.sql`.

| Table | anon can | anon cannot |
|-------|----------|-------------|
| quiz_archetypes | SELECT | INSERT, UPDATE, DELETE |
| quiz_responses | INSERT, SELECT (own) | UPDATE, DELETE |
| quiz_events | INSERT | SELECT, UPDATE, DELETE |

### API Key Exposure

- `VITE_SUPABASE_ANON_KEY` is intentionally public (this is how Supabase works)
- The anon key only grants permissions defined by RLS policies
- The `service_role` key is NEVER exposed to the client, NEVER in source code, NEVER in `.env` committed to git

### What anon Key Can Do (Worst Case)

An attacker with the anon key can:
1. Insert quiz responses (spam) -- mitigated by dedup index and optional rate limiting
2. Read quiz_archetypes (public data, no risk)
3. Read quiz_responses where deleted_at IS NULL -- risk assessment below

[AUTO-DECISION] Should quiz_responses SELECT be restricted further? --> Yes, restrict to email-match only via RPC (reason: anon SELECT on all non-deleted responses leaks PII; for MVP, the dedup check should use an RPC function that takes email as parameter and returns boolean only)

### Recommended RPC for Dedup (Replaces Direct SELECT)

```sql
CREATE OR REPLACE FUNCTION check_quiz_completed(target_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM quiz_responses
    WHERE user_email = lower(target_email)
      AND created_at::date = CURRENT_DATE
      AND deleted_at IS NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Restrict direct SELECT to service_role only
DROP POLICY IF EXISTS "responses_read_own" ON quiz_responses;

CREATE POLICY "responses_service_only_read"
  ON quiz_responses FOR SELECT
  TO service_role
  USING (true);
```

This prevents anon users from reading any quiz_responses rows directly.

---

## 4. LGPD Compliance (Lei Geral de Protecao de Dados)

### Data Collected

| Data Point | Classification | Legal Basis | Retention |
|------------|---------------|-------------|-----------|
| Name | Personal Data | Consent | 12 months |
| Email | Personal Data | Consent | 12 months |
| WhatsApp | Personal Data | Consent (explicit) | 12 months |
| Quiz answers | Non-personal | Legitimate interest | Indefinite (anonymized) |
| Archetype result | Non-personal | Legitimate interest | Indefinite |
| Device/source | Non-personal | Legitimate interest | Indefinite |

### Consent Mechanism

The LeadCaptureScreen includes a mandatory checkbox:

> "Ao enviar, voce concorda com nossa [Politica de Privacidade] e autoriza o contato por email. O envio do WhatsApp e opcional."

- Checkbox must be checked before form submission
- Privacy policy link opens in new tab
- WhatsApp field is clearly marked as optional
- Consent timestamp stored in metadata

### Right to Access (Art. 18, I)

- User can request their data via email to the data controller
- Admin queries `quiz_responses` by email using service_role

### Right to Deletion (Art. 18, VI)

- Implemented via `delete_user_data()` SQL function
- Soft deletes: anonymizes PII fields, sets `deleted_at` timestamp
- Quiz answers and archetype preserved in anonymized form (for aggregate analytics)
- Admin executes deletion within 15 days of request (LGPD requirement)

### Data Retention Policy

- Active responses: 12 months from creation
- After 12 months: automatic anonymization (cron job or manual batch)
- Anonymized data: retained indefinitely for analytics
- Deletion requests: processed within 15 business days

### Privacy Policy Requirements

The privacy policy page (separate from quiz, linked from footer) must state:
1. What data is collected and why
2. How data is stored (Supabase, encrypted at rest)
3. Who has access (data controller only)
4. Data retention period (12 months)
5. How to request deletion
6. Contact information for data controller

---

## 5. Secrets Management

| Secret | Storage | Access |
|--------|---------|--------|
| `VITE_SUPABASE_URL` | `.env` (gitignored) | Client (public) |
| `VITE_SUPABASE_ANON_KEY` | `.env` (gitignored) | Client (public) |
| Supabase service_role key | Hosting env vars only | Server/admin only |
| Supabase DB password | Supabase dashboard only | Never in code |

### .env.example (Committed)

```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### .env (Gitignored)

Contains actual values. NEVER committed.

---

## 6. Content Security Policy

Recommended CSP headers (configured at hosting level):

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src https://fonts.gstatic.com;
  connect-src https://*.supabase.co;
  img-src 'self' data:;
  frame-ancestors 'none';
```

---

## 7. Security Checklist

- [ ] RLS enabled on all tables
- [ ] anon key only allows INSERT + limited operations
- [ ] service_role key never in client code or git
- [ ] Input sanitization on all form fields
- [ ] No dangerouslySetInnerHTML usage
- [ ] LGPD consent checkbox mandatory
- [ ] Privacy policy page created and linked
- [ ] delete_user_data function tested
- [ ] Dedup check via RPC (not direct SELECT)
- [ ] CSP headers configured at hosting
- [ ] HTTPS enforced (hosting default)
- [ ] .env.example has no real values
- [ ] .env in .gitignore

---

*Security & Privacy by @architect (Aria) | LOV-1 | Phase 4*
