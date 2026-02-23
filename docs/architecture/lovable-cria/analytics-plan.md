# Lovable Cria Quiz - Analytics Plan

**Story:** LOV-1 Lovable Quiz Integration
**Author:** @architect (Aria)
**Date:** 2026-02-22

---

## 1. Event Tracking

### Core Events

| Event | Trigger | Payload | Metric It Feeds |
|-------|---------|---------|----------------|
| `page_view` | App mount | `{ url, referrer, utm_source, utm_medium, utm_campaign }` | Traffic sources |
| `quiz_start` | "Comecar" tapped | `{ timestamp }` | Visitor-to-start rate |
| `question_1` - `question_7` | Option selected | `{ option_index, time_ms_since_previous }` | Per-question drop-off, time analysis |
| `quiz_complete` | Q7 answered | `{ duration_seconds, answers_summary }` | Completion rate |
| `lead_form_view` | LeadCaptureScreen renders | `{}` | Form impression |
| `lead_submit` | Form submitted | `{ has_whatsapp, archetype }` | Conversion rate, WA opt-in |
| `lead_submit_error` | Form submit fails | `{ error_type }` | Error rate |
| `result_view` | ResultScreen renders | `{ archetype }` | Archetype distribution |
| `whatsapp_click` | WA CTA tapped | `{ archetype }` | WA message rate |
| `share_click` | Share tapped | `{ method }` | Virality |
| `quiz_reset` | "Refazer" tapped | `{ previous_archetype }` | Re-take rate |
| `quiz_abandon` | `beforeunload` event | `{ last_step, duration_seconds }` | Abandonment analysis |

### Session Tracking

Each quiz session gets a client-generated UUID (stored in sessionStorage, not localStorage):

```typescript
function getSessionId(): string {
  let id = sessionStorage.getItem('quiz_session_id');
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem('quiz_session_id', id);
  }
  return id;
}
```

No cookies. No cross-site tracking. LGPD-friendly.

---

## 2. Conversion Funnel

### Primary Funnel (from strategy doc targets)

```
Page View (100%)
  |
  v  Target: 70%
Quiz Start
  |
  v  Target: 85% of starters
Quiz Complete (Q7 answered)
  |
  v  Target: ~95% (form is next screen)
Lead Form View
  |
  v  Target: 60% email capture
Lead Submit
  |
  v  Target: 80% WA of submitters
WhatsApp Click
  |
  v  Target: 70% actually message
[External: WhatsApp conversation]
```

### SQL Funnel Query (Supabase Dashboard / Admin)

```sql
WITH funnel AS (
  SELECT
    event_type,
    COUNT(DISTINCT session_id) AS sessions
  FROM quiz_events
  WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
  GROUP BY event_type
)
SELECT
  event_type,
  sessions,
  ROUND(sessions * 100.0 / NULLIF((SELECT sessions FROM funnel WHERE event_type = 'page_view'), 0), 1) AS pct_of_views
FROM funnel
ORDER BY
  CASE event_type
    WHEN 'page_view' THEN 1
    WHEN 'quiz_start' THEN 2
    WHEN 'question_1' THEN 3
    WHEN 'question_7' THEN 4
    WHEN 'quiz_complete' THEN 5
    WHEN 'lead_form_view' THEN 6
    WHEN 'lead_submit' THEN 7
    WHEN 'whatsapp_click' THEN 8
  END;
```

---

## 3. Key Dashboards

### Dashboard 1: Daily Overview

| Metric | Source |
|--------|--------|
| Total page views | COUNT where event_type = 'page_view' |
| Quiz starts | COUNT where event_type = 'quiz_start' |
| Completions | COUNT where event_type = 'quiz_complete' |
| Leads captured | COUNT where event_type = 'lead_submit' |
| WA clicks | COUNT where event_type = 'whatsapp_click' |
| Start rate | starts / views |
| Completion rate | completions / starts |
| Conversion rate | leads / views |

### Dashboard 2: Archetype Distribution

```sql
SELECT archetype, COUNT(*) AS total,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) AS pct
FROM quiz_responses
WHERE deleted_at IS NULL
  AND created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY archetype
ORDER BY total DESC;
```

Target: roughly 25% each. Skew > 40% on one archetype indicates question redesign needed.

### Dashboard 3: Drop-off Analysis

```sql
SELECT
  event_type,
  COUNT(DISTINCT session_id) AS sessions
FROM quiz_events
WHERE event_type LIKE 'question_%'
  AND created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY event_type
ORDER BY event_type;
```

Identifies which question causes most abandonment.

### Dashboard 4: Time Analysis

```sql
SELECT
  event_type,
  ROUND(AVG((event_data->>'time_ms')::numeric / 1000), 1) AS avg_seconds
FROM quiz_events
WHERE event_type LIKE 'question_%'
  AND event_data->>'time_ms' IS NOT NULL
GROUP BY event_type
ORDER BY event_type;
```

Questions taking > 30s may need simpler wording.

---

## 4. A/B Testing Hooks

### Implementation Pattern

```typescript
// lib/ab-test.ts
type Variant = 'A' | 'B';

function getVariant(testName: string): Variant {
  const key = `ab_${testName}`;
  let variant = sessionStorage.getItem(key) as Variant | null;
  if (!variant) {
    variant = Math.random() < 0.5 ? 'A' : 'B';
    sessionStorage.setItem(key, variant);
  }
  return variant;
}
```

### Planned Tests (Post-Launch)

| Test | Variants | Metric |
|------|----------|--------|
| Headline copy | Original vs. alternative | Start rate |
| CTA button text | "Comecar" vs. "Descobrir meu perfil" | Start rate |
| Question count | 7 vs. 5 questions | Completion rate |
| WhatsApp CTA placement | Above result vs. below result | WA click rate |

Variant stored in `event_data` for each event, enabling per-variant funnel analysis.

---

## 5. External Analytics (Optional)

### Google Tag Manager (GTM)

If GTM is needed for ad conversion tracking:

```typescript
// Push events to dataLayer
function pushToGTM(event: string, data?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({ event, ...data });
  }
}
```

Add GTM script to `index.html` only if explicitly required. Avoid for MVP to keep bundle clean.

### Meta Pixel / Google Ads

Use GTM to manage these. Key conversion events:
- `quiz_start` --> "InitiateCheckout" equivalent
- `lead_submit` --> "Lead" conversion
- `whatsapp_click` --> "Contact" conversion

---

## 6. Privacy-Respecting Analytics

- No cookies (sessionStorage only, cleared on tab close)
- No cross-site tracking
- No third-party analytics SDK in MVP (Supabase is first-party data)
- Session ID is random UUID, not tied to user identity until lead submission
- analytics events in `quiz_events` table contain no PII
- LGPD compliant by design

---

*Analytics Plan by @architect (Aria) | LOV-1 | Phase 4*
