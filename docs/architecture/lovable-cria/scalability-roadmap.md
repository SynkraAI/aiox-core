# Lovable Cria Quiz - Scalability Roadmap

**Story:** LOV-1 Lovable Quiz Integration
**Author:** @architect (Aria)
**Date:** 2026-02-22

---

## Phase 1: MVP Launch (Now - 1k users/day)

**Infrastructure:**
- Single Supabase project (Free or Pro tier)
- Static hosting (Vercel/Netlify free tier)
- No caching layer
- No custom API server

**Limits:**
- Supabase Free: 500MB DB, 2GB bandwidth, 50k auth requests
- Supabase Pro: 8GB DB, 250GB bandwidth, unlimited auth
- Vercel Free: 100GB bandwidth/month

**Bottleneck:** None expected. A quiz submission is ~1KB. 1k users/day = ~1MB/day in DB writes.

**Cost:** $0-25/month

---

## Phase 2: Growth (1k-10k users/day)

**Triggers to move here:**
- Consistent 1k+ daily submissions
- Supabase free tier limits approaching

**Changes:**
- Upgrade to Supabase Pro ($25/month)
- Enable Supabase connection pooling (PgBouncer -- already default)
- Add client-side caching for archetypes fetch (already in architecture: fetch once on load)
- Monitor query latency via Supabase dashboard

**Optional:**
- Deploy rate-limiting Edge Function if spam detected
- Add CDN for quiz assets if not already on Vercel/Netlify (they include CDN)

**Cost:** $25-50/month

---

## Phase 3: Scale (10k-100k users/day)

**Triggers:**
- Supabase dashboard shows sustained > 50 concurrent connections
- Insert latency p95 exceeds 500ms
- Database size approaching tier limits

**Changes:**
- Supabase Pro with compute add-ons (larger instance)
- Separate analytics: move `quiz_events` to a dedicated table or external service (e.g., Supabase Logs, PostHog, or Mixpanel) to reduce write load on primary DB
- Read replica for analytics queries (Supabase supports this on Team/Enterprise)
- Batch analytics inserts: collect events client-side, send in batches every 5s
- Optimize dedup check with function-level caching

**Architecture change:**
```
Quiz SPA --> Supabase (primary: quiz_responses only)
         --> Analytics service (quiz_events)
```

**Cost:** $100-500/month

---

## Phase 4: Enterprise Scale (100k+ users/day)

**Triggers:**
- Viral campaign, TV/media exposure
- Sustained 100k+ daily users

**Changes:**
- Supabase Enterprise or migrate to self-hosted PostgreSQL
- Redis cache layer for dedup checks (sub-1ms lookups)
- CDN edge caching for static quiz pages (Cloudflare Workers)
- Horizontal scaling of Edge Functions
- Database partitioning: partition `quiz_responses` by month
- Archive old data to cold storage (S3/GCS)

**Cost:** $500+/month

---

## Load Testing Plan

Before each phase transition, validate with load testing:

| Phase | Tool | Target | Duration |
|-------|------|--------|----------|
| 1 -> 2 | k6 or Artillery | 100 concurrent inserts | 5 min |
| 2 -> 3 | k6 | 1000 concurrent inserts | 10 min |
| 3 -> 4 | k6 distributed | 10k concurrent inserts | 15 min |

### k6 Script Skeleton

```javascript
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 100,
  duration: '5m',
};

export default function () {
  const payload = JSON.stringify({
    user_name: `Test User ${__VU}`,
    user_email: `test${__VU}-${__ITER}@example.com`,
    answers: [0, 1, 2, 3, 0, 1, 2],
    archetype: 'comunicador',
    metadata: { source: 'load-test', device: 'desktop' },
  });

  const res = http.post(
    `${SUPABASE_URL}/rest/v1/quiz_responses`,
    payload,
    {
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    }
  );

  check(res, { 'status is 201': (r) => r.status === 201 });
}
```

---

## Capacity Estimation

| Metric | Phase 1 | Phase 2 | Phase 3 | Phase 4 |
|--------|---------|---------|---------|---------|
| Daily users | < 1k | 1k-10k | 10k-100k | 100k+ |
| DB rows/month | ~30k | ~300k | ~3M | ~30M+ |
| DB size/month | ~30MB | ~300MB | ~3GB | ~30GB+ |
| Bandwidth/month | ~1GB | ~10GB | ~100GB | ~1TB+ |
| Concurrent connections | < 10 | < 50 | < 500 | < 5000 |

---

## Key Principle

Do not over-engineer for Phase 4 today. The architecture supports scaling WITHOUT redesign because:

1. Supabase handles connection pooling automatically
2. RLS policies work at any scale
3. Analytics can be decoupled without changing the quiz UI
4. The client-side archetype calculation eliminates API bottleneck
5. Static SPA hosting scales infinitely via CDN

Scale when metrics demand it, not before.

---

*Scalability Roadmap by @architect (Aria) | LOV-1 | Phase 4*
