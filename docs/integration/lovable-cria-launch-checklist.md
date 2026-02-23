# Lovable Cria Quiz - Pre-Production Launch Checklist

**Story:** LOV-1
**Date:** 2026-02-22
**Owner:** @devops (deployment), @dev (configuration)

---

## Environment Setup

- [ ] Create production Supabase project (or confirm shared instance)
- [ ] Run migration: `supabase/migrations/20250101000001_create_quiz_responses.sql`
- [ ] Verify RLS policies are active on `quiz_responses` table
- [ ] Set environment variables in production host:
  - `VITE_SUPABASE_URL` -- production Supabase URL
  - `VITE_SUPABASE_ANON_KEY` -- production anon key

## Configuration

- [ ] Update `WHATSAPP_NUMBER` in `src/components/ResultScreen.tsx` with real number (currently hardcoded placeholder `5511999999999`)
- [ ] Verify email validation regex matches business requirements
- [ ] Confirm archetype descriptions and "next steps" content with marketing team
- [ ] Update README question count from "8" to "7" (minor doc fix)

## Build and Deploy

- [ ] Run `npm run build` in `packages/quiz-module/` -- verify clean build
- [ ] Confirm output in `dist/` directory
- [ ] Deploy to production host (Vercel, Netlify, or custom)
- [ ] Configure custom domain (if applicable)
- [ ] Set up SSL certificate

## Security

- [ ] Run `npm audit fix` to resolve minimatch vulnerability
- [ ] Verify no secrets in source code (confirmed clean)
- [ ] Confirm Supabase anon key has appropriate RLS restrictions
- [ ] Test that quiz_responses table only allows INSERT (no read/update/delete from client)

## Validation

- [ ] Test full quiz flow end-to-end on production URL
- [ ] Verify lead data appears in Supabase `quiz_responses` table
- [ ] Test on mobile (iOS Safari, Android Chrome)
- [ ] Test on desktop (Chrome, Firefox, Safari)
- [ ] Verify accessibility (screen reader, keyboard navigation)
- [ ] Confirm WhatsApp link opens correctly with pre-filled message

## Monitoring

- [ ] Set up error tracking (Sentry or equivalent) -- optional for MVP
- [ ] Monitor Supabase usage/quotas
- [ ] Set up uptime monitoring for quiz URL

---

**GO Decision:** Approved by @po (Pax) on 2026-02-22
**QA Gate:** CONCERNS (accepted, non-blocking issues tracked in Phase 10)
