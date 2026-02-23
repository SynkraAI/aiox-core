# Lovable Cria Quiz - Architecture Overview

**Story:** LOV-1 Lovable Quiz Integration
**Author:** @architect (Aria)
**Date:** 2026-02-22
**Status:** Active

---

## 1. System Overview

The Lovable Cria Quiz is a single-page React application that guides users through 7 personality questions, computes one of 4 archetypes, captures lead information (email + WhatsApp), and stores everything in Supabase. The application is generated in Lovable, exported to GitHub, and integrated into the `packages/quiz-module/` scaffold inside the aios-core monorepo.

### High-Level Flow

```
User (mobile browser)
  |
  v
[Quiz SPA - React + Vite + Tailwind]
  |  (1) User completes 7 questions
  |  (2) Client computes archetype locally
  |  (3) User submits lead form (name, email, whatsapp)
  |
  v
[Supabase - PostgreSQL + RLS]
  |  (a) INSERT quiz_responses
  |  (b) INSERT quiz_events (analytics)
  |
  v
[WhatsApp Deep Link]
  |  User taps to message
```

### Key Architectural Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| State management | useState + useReducer | Quiz is linear, no global state needed; avoids Zustand dep for a single-page flow |
| Routing | No router -- single-page conditional render | Strategy doc mandates single-page; simpler Lovable export; zero navigation abandonment |
| Form handling | Native controlled inputs | Only 3 fields (name, email, whatsapp); React Hook Form is overkill |
| Archetype calculation | Client-side | Eliminates network round-trip; instant result reveal; scoring logic is not secret |
| Backend | Supabase direct (client SDK) | No custom API server needed; RLS handles auth; edge functions only if needed later |
| Analytics | Supabase insert + optional GTM | Keep it simple; avoid third-party SDK bloat on initial load |

[AUTO-DECISION] Zustand vs Context vs useState? --> useState + useReducer (reason: quiz is a linear 9-screen flow with no shared state across distant components; a reducer handles step transitions cleanly; adding Zustand for this is over-engineering given gotcha about Zustand persist type inference complexity)

[AUTO-DECISION] React Hook Form? --> No, native controlled inputs (reason: only 3 form fields on one screen; RHF adds ~12kb gzipped for minimal benefit; validation is trivial with regex)

[AUTO-DECISION] Client-side vs server-side archetype calculation? --> Client-side (reason: scoring algorithm is simple weighted sum; no IP to protect; eliminates latency; result appears instantly after last question)

---

## 2. Component Architecture

See `/docs/architecture/lovable-cria/frontend-architecture.md` for full component hierarchy.

## 3. Database Schema

See `/docs/architecture/lovable-cria/database-schema.sql` for complete DDL.

## 4. API Contract

See `/docs/architecture/lovable-cria/api-contract.md` for endpoint specifications.

## 5. Performance

See `/docs/architecture/lovable-cria/performance-optimization.md` for targets and strategies.

## 6. Security & Privacy

See `/docs/architecture/lovable-cria/security-privacy.md` for LGPD compliance and data handling.

## 7. Scalability

See `/docs/architecture/lovable-cria/scalability-roadmap.md` for growth plan.

## 8. Analytics

See `/docs/architecture/lovable-cria/analytics-plan.md` for event tracking.

---

## Integration Points

### With packages/quiz-module/ Scaffold

The existing scaffold at `packages/quiz-module/` provides:
- Vite build pipeline (`vite.config.ts`)
- Supabase client (`src/lib/supabase.ts`)
- Tailwind CSS configured
- TypeScript configured
- React 18.3 + Supabase JS 2.45

Lovable-generated code replaces `src/App.tsx` and adds component files under `src/components/`, `src/types/`, and `src/lib/`.

### With aios-core Monorepo

- `packages/quiz-module/` is a standalone Vite app within the monorepo
- No imports from other aios-core packages (fully self-contained)
- Build output goes to `packages/quiz-module/dist/` for deployment
- Environment variables via `.env` (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)

### Deployment Path

```
Lovable editor --> GitHub export (branch: lovable/quiz-v1)
  --> PR to main --> merge into packages/quiz-module/src/
  --> Build: npm run build (in packages/quiz-module/)
  --> Deploy dist/ to hosting (Vercel, Netlify, or Supabase hosting)
```

---

## Trade-Off Analysis

| Trade-off | Chosen | Alternative | Why |
|-----------|--------|-------------|-----|
| No API server | Supabase direct | Express/Fastify API | Fewer moving parts; RLS provides security; no server to maintain |
| Client-side scoring | Instant UX | Server-side (tamper-proof) | Archetype is non-sensitive; UX speed > tamper protection |
| No Zustand | Less dependency | Zustand for persistence | Linear flow does not need global store; avoids persist hydration gotcha |
| No SSR | SPA only | Next.js SSR | Lovable exports SPA; SSR adds complexity with no SEO need (quiz is not indexed) |
| Tailwind purge | Smaller bundle | Full Tailwind | Production build removes unused CSS automatically |

---

*Architecture Overview by @architect (Aria) | LOV-1 | Phase 4*
