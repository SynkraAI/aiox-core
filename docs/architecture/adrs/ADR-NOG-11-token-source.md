# ADR-NOG-11: Token Usage Source for SYNAPSE Bracket Calculation

**Status:** Accepted
**Date:** 2026-02-21
**Author:** @architect (Aria)
**Story:** NOG-11

---

## Context

SYNAPSE bracket calculation currently uses a static estimate: `promptCount * 1500 * 1.2` to approximate context window usage. NOG-9 research identified this as the only static estimation in the stack. We need a real token data source to replace estimation with actual API response data.

The SYNAPSE hook runs as `UserPromptSubmit` (before API call), so `usage.input_tokens` from the current API response is not available at processing time.

## Decision

**Use the `Stop` hook to tail-read JSONL transcript files and persist real token usage via a dedicated `updateSessionMetrics()` function (not `updateSession()`, to avoid double-incrementing `prompt_count`).**

The token data persisted by the Stop hook after turn N is consumed by the UserPromptSubmit hook at turn N+1 — a "one turn behind" pattern that provides real data from turn 2 onwards.

## Options Evaluated

### Option 1: Stop Hook + JSONL Tail Read (CHOSEN)

- Read `transcript_path` (provided in Stop hook input)
- Tail-read last 50KB, parse last assistant message
- Extract `input_tokens + cache_read_input_tokens` as effective context
- Write to session via `updateSessionMetrics()` (no prompt_count increment)

| Pros | Cons |
|------|------|
| 0.2ms latency | One-turn-behind data |
| Data already exists (zero new infra) | JSONL format may change |
| Non-blocking (fire-and-forget) | Adds a new hook |
| Falls back gracefully | |

### Option 2: OTEL Pipeline

- Intercept `api_request` event from OTEL exporter
- Extract token counts from OTEL metrics

| Pros | Cons |
|------|------|
| Official monitoring channel | Exports to console (hard to intercept) |
| Rich metrics available | Requires process-level I/O redirection |
| | Over-engineered for this use case |

### Option 3: Custom API Wrapper

- Wrap Claude API calls to capture usage

| Pros | Cons |
|------|------|
| Direct access to API response | Cannot modify Claude Code internals |
| | Would require forking Claude Code |
| | Violates CLI First principle |

### Option 4: Continue with Estimation (Fallback)

- Keep QW-3's `chars/4 * 1.2` multiplier

| Pros | Cons |
|------|------|
| Zero implementation effort | 15-25% inaccuracy persists |
| Already working | Brackets may be wrong by 1 level |

## Consequences

### Positive
- Bracket calculation accuracy improves from ~85% to ~99%
- Real token data enables future cost tracking
- `cache_read_input_tokens` provides true context window picture
- Backward compatible — estimation remains as fallback

### Negative
- New Stop hook adds ~0.2ms per turn (negligible)
- JSONL format is not officially documented (parse defensively)
- One-turn-behind means first prompt always uses estimation

### Neutral
- Session file grows slightly (3 new fields: `last_tokens_used`, `last_output_tokens`, `last_cache_read`)

## Implementation Path

1. Create `synapse-token-collector.cjs` Stop hook
2. Register in `.claude/settings.local.json` under `Stop` event
3. Modify `context-tracker.js` to prefer real data over estimation
4. Add tests for tail read, session update, and fallback
5. Journey snapshot to verify bracket accuracy improvement

**Estimated effort:** 6-8h (2 story points) — revised after Codex conditions C1-C4

## Key Metrics

| Metric | Before (estimation) | After (real data) |
|--------|--------------------|--------------------|
| Bracket accuracy | ~85% | Significantly improved (target ~99%, pending empirical validation per C4) |
| Data latency | N/A | 0.2ms |
| First-prompt accuracy | ~85% | ~85% (same — no prior data) |
| Subsequent prompts | ~85% | Significantly improved (pending C4 validation) |

## Codex QA Addendum (2026-02-21)

Codex QA review issued **GO condicionado** with 5 pre-implementation conditions:
- C1: Use `updateSessionMetrics()` instead of `updateSession()` to avoid double prompt_count increment
- C2: Register hook in `.claude/settings.local.json` (not `.claude/settings.json` which doesn't exist)
- C3: Implement adaptive tail buffer (50KB → 100KB → 200KB → fallback)
- C4: Empirically validate `effective_context` formula in 5+ sessions
- C5: Fix AC traceability in NOG-11 story (DONE)

Full conditions design: `docs/research/2026-02-21-uap-synapse-research/IMPL-DESIGN-NOG-15-CONDITIONS.md`
