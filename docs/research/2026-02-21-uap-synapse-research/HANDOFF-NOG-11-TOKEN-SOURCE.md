# HANDOFF: NOG-11 Token Usage Source Discovery

**From:** @architect (Aria)
**To:** Codex QA Review
**Date:** 2026-02-21
**Story:** NOG-11 — Token Usage Source Discovery & Integration Design
**Decision:** GO — Viable source found

---

## Context

NOG-9 research identified that SYNAPSE bracket calculation uses a static estimate (`promptCount * 1500 * 1.2`) instead of real token data. The original QW-2 proposal ("populate `last_tokens_used` from API response") was correctly flagged as **infeasible** by Codex QA — the SYNAPSE hook runs at `UserPromptSubmit` (before the API call), so response usage data is unavailable at that point.

NOG-11 investigated 4 alternative sources to find where real token data can be reliably obtained.

---

## Investigation Summary

### 4 Sources Investigated

| Source | Description | Result |
|--------|-------------|--------|
| **A: Claude Code Hooks API** | Check for post-response hooks | 15 event types found. `Stop` hook fires post-response. No hook exposes tokens directly, but all hooks receive `transcript_path`. |
| **B: JSONL Transcripts** | Check if transcripts contain usage data | **CONFIRMED.** Every `type: "assistant"` entry has `message.usage` with full token breakdown. |
| **C: Session Metadata** | Check `~/.claude/projects/{hash}/sessions/` | **NOT VIABLE.** Directory does not exist. |
| **D: Hook Input Payload** | Check for undocumented fields | `transcript_path` field discovered — provides path to JSONL file from any hook. |

### JSONL Transcript Token Data (Source B — Evidence)

Verified in 2 real sessions from this project:

```json
{
  "type": "assistant",
  "message": {
    "model": "claude-opus-4-6",
    "usage": {
      "input_tokens": 1,
      "output_tokens": 318,
      "cache_creation_input_tokens": 533,
      "cache_read_input_tokens": 144500,
      "cache_creation": {
        "ephemeral_5m_input_tokens": 0,
        "ephemeral_1h_input_tokens": 533
      },
      "service_tier": "standard"
    }
  },
  "timestamp": "2026-02-21T17:22:09.706Z"
}
```

**Real aggregation data:**

| Session | File Size | Assistant Messages | cache_read Total |
|---------|-----------|-------------------|-----------------|
| 4.5 MB session | 4.48 MB | 277 | 30,075,415 |
| 13 MB session | 13.07 MB | ~800+ | 133,514,559 |

### Performance Benchmark

| Method | Latency | Description |
|--------|---------|-------------|
| Full file parse (4.5 MB) | 47ms | Read entire JSONL, parse all lines |
| Full file parse (13 MB) | 75ms | Read entire JSONL, parse all lines |
| **Tail read (50KB)** | **0.2ms** | Read last 50KB, find last assistant usage |

The tail read method is O(1) regardless of file size — always reads a fixed 50KB buffer from the end.

---

## Proposed Architecture

### Stop Hook + JSONL Tail Read

```
T0: User submits prompt
T1: UserPromptSubmit fires → synapse-engine.cjs → bracket from PREVIOUS data
T2: Claude processes (API call, tool use, etc.)
T3: Claude finishes responding
T4: Stop hook fires → tail-read transcript_path → extract usage → updateSession()
T5: Next prompt → UserPromptSubmit → bracket from REAL data (from T4)
```

**"One turn behind" pattern:** Token data from turn N is used for bracket calculation at turn N+1. Turn 1 always uses estimation (FRESH bracket), turn 2+ uses real data.

### New Components

| Component | Path | Description |
|-----------|------|-------------|
| Stop hook | `.claude/hooks/synapse-token-collector.cjs` | NEW: Tail-read JSONL, persist token data |
| Settings | `.claude/settings.json` | MODIFY: Register Stop hook |
| Context tracker | `.aios-core/core/synapse/context/context-tracker.js` | MODIFY: Prefer real data, fallback to estimate |

### Data Flow

```
Stop hook reads transcript_path (tail 50KB)
  → Parses last assistant message.usage
  → Calls updateSession(sessionId, dir, {
      context: {
        last_tokens_used: input_tokens + cache_read_input_tokens,
        last_output_tokens: output_tokens,
        last_cache_read: cache_read_input_tokens
      }
    })
  → Next UserPromptSubmit reads session → estimateContextPercent() uses real data
```

### Key Architectural Insight

**`cache_read_input_tokens` is the dominant metric, not `input_tokens`.**

With prompt caching, `input_tokens` is typically 1-3 per turn (only new/uncached tokens). The actual context window usage is represented by `cache_read_input_tokens` (100K-150K+ per turn). For bracket calculation, the relevant value is:

```
effective_context = input_tokens + cache_read_input_tokens
```

This is critical — using only `input_tokens` would severely underestimate context usage and render brackets useless.

---

## Decisions Requiring Review

### Decision 1: Stop Hook as Integration Point

**Choice:** Use `Stop` hook (fires after Claude responds) to collect token data.

**Alternatives considered:**
- OTEL pipeline (exports to console — hard to intercept programmatically)
- Custom API wrapper (requires forking Claude Code — violates CLI First)
- Continue with estimation (15-25% inaccuracy persists)

**Question for Codex:** Is the `Stop` hook the right integration point? Are there concerns about:
- Stop hook adding ~0.2ms per turn?
- Fire-and-forget pattern (same as QW-1) — acceptable for non-critical data?
- The "one turn behind" latency (turn 1 uses estimation)?

### Decision 2: Tail Read vs Full Parse

**Choice:** Read last 50KB of JSONL (0.2ms) instead of full file (47-75ms).

**Rationale:** We only need the most recent usage data, not historical aggregation. The last assistant message is always near the end of the append-only JSONL file.

**Question for Codex:** Is 50KB a safe buffer size? In extreme cases (very large tool outputs), could the last assistant message be more than 50KB from the end? Should we increase to 100KB as safety margin?

### Decision 3: Effective Context = input_tokens + cache_read_input_tokens

**Choice:** Sum `input_tokens` and `cache_read_input_tokens` for bracket calculation.

**Rationale:** With prompt caching, `input_tokens` alone is 1-3 per turn. The `cache_read_input_tokens` represents tokens that were in the context window but served from cache. Together they represent what Claude "saw" in the context.

**Question for Codex:** Is this the correct interpretation? Should `cache_creation_input_tokens` also be included? The distinction:
- `input_tokens`: New tokens not in cache
- `cache_read_input_tokens`: Tokens read from cache (already in context)
- `cache_creation_input_tokens`: Tokens written to cache (new context being cached)

Our current interpretation: `effective = input + cache_read` (what was in the context window this turn).

### Decision 4: Implementation as Separate Story

**Choice:** Research only in NOG-11, implementation in a future story (estimated 4-6h / 1 SP).

**Question for Codex:** Should implementation be a new story in the NOG epic (e.g., NOG-15) or a story in a different epic? The work touches:
- `.claude/hooks/` (hook infrastructure)
- `.aios-core/core/synapse/` (SYNAPSE engine)
- `.claude/settings.json` (configuration)

---

## Artifacts for Review

| Artifact | Path | Content |
|----------|------|---------|
| Research document | `docs/research/2026-02-21-uap-synapse-research/token-source-investigation.md` | Full investigation report with evidence and benchmarks |
| ADR | `docs/architecture/adrs/ADR-NOG-11-token-source.md` | Architecture Decision Record |
| Story file | `docs/stories/epics/epic-nogic-code-intelligence/story-NOG-11-token-usage-source-discovery.md` | Updated with all findings |
| Journey snapshot | `.synapse/metrics/journey/NOG-11.json` | Performance baseline (no regressions) |
| Journey log | `docs/qa/wave6-journey-log.md` | NOG-11 entry appended |

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| `transcript_path` not in Stop hook payload | Low | Medium | Fallback to estimation (zero impact) |
| JSONL format changes in future Claude Code versions | Low | Medium | Defensive parsing with try/catch |
| 50KB tail buffer insufficient | Very Low | Low | Increase buffer or fallback to estimation |
| Stop hook timeout (>5s) | Very Low | None | Safety timeout kills hook, estimation used |
| `cache_read_input_tokens` interpretation wrong | Medium | High | Validate with Anthropic docs or empirical testing |

---

## Summary

**NOG-11 found a viable, low-latency (0.2ms) source of real token data with high expected reliability (confirmed in 2 sessions; broader validation planned per C4).** The JSONL transcript files that Claude Code already writes contain complete usage breakdowns per assistant message. A `Stop` hook can tail-read these files and persist the data via `updateSessionMetrics()` (dedicated function, not `updateSession()` — avoids double prompt_count increment) for the next `UserPromptSubmit` bracket calculation.

The proposed architecture is:
- **Non-invasive** — reads existing files, no Claude Code modifications
- **Backward compatible** — estimation remains as fallback
- **Low effort** — 6-8h implementation (revised from 4-6h after Codex conditions), follows established hook patterns
- **Low risk** — fire-and-forget, same pattern as QW-1

**Codex QA review completed: GO condicionado.** 5 conditions resolved in `IMPL-DESIGN-NOG-15-CONDITIONS.md`.

— Aria, arquitetando o futuro
