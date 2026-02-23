# Phase 10: Lovable Cria Quiz - Post-Launch Improvements

**Parent Story:** LOV-1
**Status:** Planned
**Priority:** Medium
**Created:** 2026-02-22 by @po (Pax)

---

## Overview

Post-launch improvement roadmap for the Cria Quiz module. All items were identified during QA gate (Phase 7) and PO acceptance (Phase 9) as non-blocking improvements.

---

## Stories

### LOV-2: Security Hardening
**Priority:** High | **Complexity:** Small (2 pts)
- Run `npm audit fix` to resolve minimatch ReDoS vulnerability (SEC-001)
- Move WHATSAPP_NUMBER from hardcoded value to environment variable (MNT-002)
- Replace `console.error` in NotFound.tsx with structured logging (MNT-001)

### LOV-3: Unit Test Suite
**Priority:** High | **Complexity:** Medium (5 pts)
- Add tests for `archetype-calculator.ts` (scoring logic, edge cases)
- Add tests for `validation.ts` (email, name, WhatsApp format validation)
- Add tests for `useQuizReducer.ts` (state transitions, reset, error states)
- Target: 80%+ coverage on pure logic modules

### LOV-4: Bundle Optimization
**Priority:** Medium | **Complexity:** Medium (5 pts)
- Tree-shake unused shadcn/ui components (only 6 of 50+ are used)
- Configure Vite `manualChunks` in rollup options
- Target: under 100KB gzip JS bundle

### LOV-5: Architecture Documentation
**Priority:** Medium | **Complexity:** Small (2 pts)
- @architect creates `docs/architecture/lovable-integration.md`
- Document integration pattern (standalone Vite app)
- Document data flow (quiz -> Supabase -> WhatsApp automation)
- Document scaling considerations

### LOV-6: Growth and Analytics
**Priority:** Low | **Complexity:** Medium (5 pts)
- A/B test headline variations on entry screen
- Set up analytics dashboard (quiz completion rate, archetype distribution)
- Track drop-off points in quiz flow
- Implement UTM parameter capture for lead attribution

---

## Total Estimated Effort: 19 points

## Recommended Sprint Order:
1. LOV-2 (security) + LOV-3 (tests) -- immediate post-launch
2. LOV-4 (bundle) + LOV-5 (docs) -- next sprint
3. LOV-6 (growth) -- backlog, prioritize based on launch data
