# Lovable Cria Quiz - API Contract

**Story:** LOV-1 Lovable Quiz Integration
**Author:** @architect (Aria)
**Date:** 2026-02-22

---

## Architecture Note

This quiz uses the **Supabase client SDK directly** from the browser. There is no custom API server. The "API" documented here describes the Supabase operations the frontend performs, plus one optional Edge Function for rate limiting.

---

## 1. Submit Quiz Response

**Operation:** Supabase client INSERT
**Table:** `quiz_responses`

### Client Code Pattern

```typescript
const { data, error } = await supabase
  .from('quiz_responses')
  .insert({
    user_name: leadData.name.trim(),
    user_email: leadData.email.trim().toLowerCase(),
    user_whatsapp: leadData.whatsapp ? formatWhatsApp(leadData.whatsapp) : null,
    answers: answers,
    archetype: calculatedArchetype,
    metadata: {
      source: getUtmParams(),
      device: isMobile() ? 'mobile' : 'desktop',
      duration_seconds: getDurationSince(quizStartTime),
      completed_at: new Date().toISOString(),
    },
  })
  .select('id, archetype')
  .single();
```

### Validation (Client-Side, Pre-Insert)

| Field | Rule | Error Message |
|-------|------|---------------|
| user_name | `length >= 2` | "Nome deve ter pelo menos 2 caracteres" |
| user_email | Regex: `^[^\s@]+@[^\s@]+\.[^\s@]+$` | "Email invalido" |
| user_whatsapp | Optional; if provided: `^\+?55?\d{10,11}$` | "Numero de WhatsApp invalido" |
| answers | Array of 7 non-null numbers (0-3) | Should not be possible via UI |
| lgpdConsent | Must be `true` | "Voce precisa aceitar a politica de privacidade" |

### Responses

| Scenario | Supabase Error Code | Handling |
|----------|-------------------|----------|
| Success | null | Show LoadingScreen -> ResultScreen |
| Duplicate (same email today) | `23505` (unique_violation) | Show friendly "Voce ja respondeu hoje! Quer ver seu resultado?" |
| Validation failure (DB check) | `23514` (check_violation) | Show generic error, log details |
| Network error | PGRST timeout | "Erro de conexao. Tente novamente." with retry button |

### Deduplication Strategy

[AUTO-DECISION] Dedup window: 24h or forever? --> Per calendar day (reason: allows re-takes on different days for A/B testing; prevents accidental double-submits on same day; unique index on email+date is simple and efficient)

If duplicate detected, the client queries existing response:

```typescript
const { data: existing } = await supabase
  .from('quiz_responses')
  .select('archetype')
  .eq('user_email', email)
  .gte('created_at', todayStart())
  .is('deleted_at', null)
  .single();
```

---

## 2. Fetch Archetypes (Reference Data)

**Operation:** Supabase client SELECT
**Table:** `quiz_archetypes`

```typescript
const { data: archetypes } = await supabase
  .from('quiz_archetypes')
  .select('*');
```

### When to Fetch

- On app load (before quiz starts)
- Cache in component state (4 rows, never changes during session)
- Used by ResultScreen to display archetype details

### Response Shape

```json
[
  {
    "id": "comunicador",
    "name": "O Comunicador",
    "color": "#F97316",
    "identity": "Voce transforma ideias em conversas que movem pessoas.",
    "strengths": ["Comunicacao natural", "Engajamento de audiencia", "Criacao de conteudo"],
    "business_model": "Criacao de conteudo e influencia digital",
    "first_step": "Grave um video de 60 segundos sobre algo que voce domina e publique hoje.",
    "famous_example": "Nathalia Arcuri"
  }
]
```

---

## 3. Track Analytics Event

**Operation:** Supabase client INSERT
**Table:** `quiz_events`

```typescript
const trackEvent = async (eventType: string, eventData?: Record<string, unknown>) => {
  await supabase.from('quiz_events').insert({
    session_id: getSessionId(),
    event_type: eventType,
    event_data: eventData ?? {},
    device: isMobile() ? 'mobile' : 'desktop',
    source: getUtmSource(),
  });
};
```

### Event Types

| Event | Trigger | Data Payload |
|-------|---------|-------------|
| `page_view` | App mounts | `{ url, referrer }` |
| `quiz_start` | User taps "Comecar" | `{}` |
| `question_1` ... `question_7` | User answers question N | `{ option_index, time_ms }` |
| `quiz_complete` | All 7 answered | `{ duration_seconds }` |
| `lead_form_view` | LeadCaptureScreen renders | `{}` |
| `lead_submit` | Form submitted | `{ has_whatsapp: boolean }` |
| `result_view` | ResultScreen renders | `{ archetype }` |
| `whatsapp_click` | WhatsApp CTA tapped | `{ archetype }` |
| `share_click` | Share button tapped | `{ method }` |
| `quiz_abandon` | Page unload before complete | `{ last_step }` |

### Fire-and-Forget

Analytics inserts are non-blocking. Errors are silently caught and logged to console (never shown to user).

---

## 4. LGPD Data Deletion (Admin Only)

**Operation:** Supabase RPC
**Function:** `delete_user_data`
**Access:** service_role only (admin dashboard or manual)

```typescript
// Admin context only (service_role key, never in client)
const { data: rowsAffected } = await supabaseAdmin
  .rpc('delete_user_data', { target_email: 'user@example.com' });
```

---

## 5. Optional: Rate Limiting via Edge Function

If spam becomes an issue, deploy a Supabase Edge Function as a proxy for quiz submission.

**Endpoint:** `POST /functions/v1/submit-quiz`

```typescript
// supabase/functions/submit-quiz/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  // 1. Check IP rate limit (1 per hour via KV or in-memory map)
  // 2. Validate body
  // 3. Insert into quiz_responses using service_role
  // 4. Return { archetype } or error
});
```

This is NOT needed for MVP. Deploy only if abuse is detected.

---

## 6. CORS Configuration

Supabase handles CORS automatically for its client SDK. No additional configuration needed.

If Edge Functions are added later, configure allowed origins:

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://quiz.metodocria.com',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
```

---

## 7. Environment Variables

| Variable | Description | Where Used |
|----------|-------------|-----------|
| `VITE_SUPABASE_URL` | Supabase project URL | Client SDK init |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key | Client SDK init |

These are safe to expose in the browser (RLS protects data). The `service_role` key is NEVER exposed to the client.

---

*API Contract by @architect (Aria) | LOV-1 | Phase 4*
