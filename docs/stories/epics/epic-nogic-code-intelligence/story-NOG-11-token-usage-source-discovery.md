# Story NOG-11: Token Usage Source Discovery & Integration Design

## Metadata

| Field | Value |
|-------|-------|
| **Story ID** | NOG-11 |
| **Epic** | NOGIC — Code Intelligence Integration |
| **Type** | Technical Discovery / Spike |
| **Status** | Ready for Review |
| **Priority** | P0 |
| **Points** | 3 |
| **Agent** | @architect (Aria) — research + @dev (Dex) — PoC |
| **Quality Gate** | @pm (Morgan) |
| **Blocked By** | NOG-10 (Done) |
| **Branch** | `feat/epic-nogic-code-intelligence` |

---

## Story

As a **framework architect**, I want to discover where real token usage data (`usage.input_tokens`) can be reliably sourced from in the Claude Code runtime, so that SYNAPSE bracket calculation can use real data instead of the static `promptCount x 1500` estimate — the only static estimation in the industry (per NOG-9 research C2).

---

## Problem Statement

NOG-9 originally proposed QW-2 (populate `last_tokens_used` from API response) as a Quick Win. Codex QA correctly identified this as **infeasible**: the SYNAPSE hook runs as `UserPromptSubmit` (before API call), so `usage.input_tokens` from the API response is not available in that flow.

This story investigates alternative sources and designs the integration path.

### Decision Criteria (Guardrail #3)

**Timebox:** 4 hours of investigation. If no reliable source found within timebox:
- **Fallback decision:** Continue with calibrated estimation (QW-3's 1.2x multiplier) + add instrumentation to log actual token usage when it becomes available
- **Criteria for "reliable source":** Source must provide `input_tokens` or equivalent within 100ms of prompt completion, with >95% availability

---

## Acceptance Criteria

### AC1: Source Investigation
- [x] Investigate Claude Code hooks API — does a `PostResponse` or `AssistantResponse` hook exist?
  - **Evidence:** 15 hook event types found. No `PostResponse` but `Stop` hook fires post-response. See `token-source-investigation.md` §Source A.
- [x] Investigate JSONL transcripts in `~/.claude/projects/*/` — does `usage` field appear in transcript entries?
  - **Evidence:** Confirmed. Every `type: "assistant"` entry has `message.usage` with `input_tokens`, `output_tokens`, `cache_read_input_tokens`, `cache_creation_input_tokens`. Verified in 2 real sessions (4.5MB / 277 msgs, 13MB / ~800+ msgs). See `token-source-investigation.md` §Source B.
- [x] Investigate Claude Code's `conversation` or `session` persistence — any accessible token count?
  - **Evidence:** NOT VIABLE. `~/.claude/projects/{hash}/sessions/` directory does not exist on this installation. See `token-source-investigation.md` §Source C.
- [x] Document findings with evidence (code snippets, file locations, or "not found" with reasons)
  - **Evidence:** `docs/research/2026-02-21-uap-synapse-research/token-source-investigation.md` — full report with JSON samples, aggregation data, and file locations.
- [x] **Benchmark:** Measure latency of each viable source
  - **Evidence:** Tail read (50KB) = 0.2ms, full parse (4.5MB) = 47ms, full parse (13MB) = 75ms. Benchmark script was `.tmp-coverage/bench-jsonl.js` (cleaned after execution; results documented in research report and ADR). See `token-source-investigation.md` §Performance Benchmark.
- [x] **Observability:** Document how to verify token source is working in production
  - **Evidence:** Check `.synapse/sessions/{uuid}.json` for `context.last_tokens_used > 0` after turn 2+. If 0 or absent, Stop hook failed and estimation fallback is active. Documented in ADR §Implementation Path.

### AC2: Integration Design (if source found)
- [x] Design integration path from token source → `updateSession()` → `context.last_tokens_used`
  - **Evidence:** Stop hook → tail-read `transcript_path` (50KB) → parse last assistant `message.usage` → persist via session update → consumed by `estimateContextPercent()` at next turn. See ADR §Decision and handoff §Data Flow.
- [x] Identify timing constraints (when data available vs when SYNAPSE needs it)
  - **Evidence:** "One turn behind" pattern — Stop hook fires after turn N, data consumed at turn N+1's UserPromptSubmit. Turn 1 always uses estimation (FRESH bracket). See handoff §Proposed Architecture.
- [x] Estimate implementation effort
  - **Evidence:** 6-8h (2 story points, revised after Codex conditions C1-C4). 3 components: Stop hook script, settings registration, context-tracker modification. See ADR §Implementation Path.
- [x] Document in ADR format (decision, options evaluated, rationale)
  - **Evidence:** `docs/architecture/adrs/ADR-NOG-11-token-source.md` — 4 options evaluated, chosen: Stop hook + JSONL tail read.

### AC3: Fallback Plan (if no source found)
- ~~N/A — Source found. AC3 not triggered.~~
- [x] **Rollback:** Fallback to current QW-3 calibrated estimation (already working) — retained as runtime fallback when Stop hook fails or on turn 1.

---

## Scope

### IN Scope
- Research Claude Code hook types and available events
- Inspect JSONL transcript format and content
- Design integration path (architecture document)
- PoC if viable source found (read-only, no production changes)

### OUT of Scope
- Production implementation of token counting (future story — to be created if viable source found)
- Changes to SYNAPSE engine architecture
- Changes to hook-runtime.js beyond PoC validation

---

## Research Plan

### Source A: Claude Code Hooks API
```
Investigate: Does Claude Code expose PostResponse / AssistantResponse hooks?
Location: Claude Code documentation, .claude/settings.json schema
Method: Check hook types available beyond UserPromptSubmit
```

### Source B: JSONL Transcripts
```
Investigate: Do transcript entries include usage.input_tokens?
Location: ~/.claude/projects/{project-hash}/*.jsonl
Method: Read recent transcript entries, search for "usage" or "tokens" fields
```

### Source C: Session Metadata
```
Investigate: Does Claude Code persist token counts in session state?
Location: ~/.claude/projects/{project-hash}/sessions/
Method: Inspect session files for token-related fields
Note: This path may not exist in all Claude Code versions — verify before investigating
```

### Source D: Hook Input Payload
```
Investigate: What fields does UserPromptSubmit input contain beyond {cwd, session_id, prompt}?
Method: Log full input payload from synapse-engine.cjs stdin
```

---

## Tasks/Subtasks

- [x] 1. Research Phase (timeboxed: 4h) — completed in ~1h
  - [x] 1.1 Investigate Claude Code hooks API for post-response events — 15 hook types found, `Stop` hook is viable
  - [x] 1.2 Inspect JSONL transcripts for usage data — confirmed: `message.usage` with full token breakdown
  - [x] 1.3 Inspect session metadata for token counts — NOT VIABLE: `sessions/` directory does not exist
  - [x] 1.4 Log full hook input payload to check for undocumented fields — `transcript_path` field discovered
- [x] 2. Document findings in `docs/research/2026-02-21-uap-synapse-research/token-source-investigation.md`
- [x] 3. Source found (JSONL transcripts via Stop hook):
  - [x] 3.1 Create PoC reading token data from source — tail-read benchmark script (.tmp-coverage/bench-jsonl.js)
  - [x] 3.2 Measure latency and reliability — 0.2ms tail read, 47-75ms full parse. High availability expected (JSONL append-only, always present); confirmed in 2 sessions, broader validation deferred to implementation story.
  - [x] 3.3 Design integration path (ADR) — `docs/architecture/adrs/ADR-NOG-11-token-source.md`
- ~~4. If no source found~~ (N/A — source found)
  - ~~4.1 Document calibration improvements for static estimator~~
  - ~~4.2 Propose instrumentation plan~~
  - ~~4.3 Define monitoring hooks for future transition~~
- [x] 5. Decision: **GO** — proceed with Stop hook + JSONL tail read implementation (future story)
- [x] 6. Journey Snapshot: Run `node tests/synapse/benchmarks/wave6-journey.js --tag="NOG-11"`
  - [x] 6.1 Compare with NOG-10 snapshot — no real regressions (dev.projectStatus +10ms intermittent, SYNAPSE p95 +0.31ms noise)
  - [x] 6.2 Document improvements/changes in journey-log.md (auto-generated)
  - [x] 6.3 Regressions reviewed: all measurement noise, no code changes in NOG-11

---

## Testing

N/A — Research/spike story. PoC only, no production code.

### Performance Journey
- `node tests/synapse/benchmarks/wave6-journey.js --tag="NOG-11" --compare="NOG-10"`
- Expected: last_tokens_used populated (if viable source found), no regressions

---

## Dev Notes

### Source Tree (Investigation Targets)

```
~/.claude/
  settings.json                              # Source A: hooks API schema — check hook types
  projects/{project-hash}/
    *.jsonl                                  # Source B: JSONL transcripts — search for usage field
    sessions/                                # Source C: session metadata — token counts (may not exist)

.claude/hooks/
  synapse-engine.cjs:47-52                   # Source D: hook input payload — log stdin fields

.aios-core/core/synapse/
  engine.js:234                              # Current bracket calc — uses estimateContextPercent()
  context/
    context-tracker.js:101-115               # estimateContextPercent() — current chars/4 * 1.2
  session/
    session-manager.js:197                   # updateSession() — target for last_tokens_used write
  runtime/
    hook-runtime.js:30-45                    # resolveHookRuntime() — session loading flow

.synapse/sessions/{uuid}.json                # Current session state — context.last_tokens_used target
```

### Key Integration Points

- **Input:** Token data from one of Sources A-D
- **Pipeline:** Source → `updateSessionMetrics(sessionId, dir, { last_tokens_used, last_output_tokens, last_cache_read })` → persisted in `.synapse/sessions/` (dedicated function — no prompt_count increment, per Codex C1)
- **Consumer:** `estimateContextPercent()` in context-tracker.js — would replace `promptCount * avgTokensPerPrompt` with real data
- **Timing constraint:** Data must be available before next `UserPromptSubmit` hook fires

### File List

| File | Action | Notes |
|------|--------|-------|
| `docs/research/2026-02-21-uap-synapse-research/token-source-investigation.md` | CREATE | Research findings (4 sources investigated) |
| `docs/architecture/adrs/ADR-NOG-11-token-source.md` | CREATE | ADR: Stop hook + JSONL tail read |
| `docs/qa/wave6-journey-log.md` | MODIFY | NOG-11 snapshot appended |
| `docs/research/2026-02-21-uap-synapse-research/HANDOFF-NOG-11-TOKEN-SOURCE.md` | CREATE | Handoff para Codex QA review |
| `docs/research/2026-02-21-uap-synapse-research/HANDOFF-CODEX-QA-REVIEW-NOG-11.md` | CREATE | Codex QA review — GO condicionado (7 findings) |
| `docs/research/2026-02-21-uap-synapse-research/IMPL-DESIGN-NOG-15-CONDITIONS.md` | CREATE | Mini-design: 5 condições pré-implementação |

---

## CodeRabbit Integration

> **N/A — Research/spike story.** No production code changes expected.

---

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Completion Notes
- **Source A (Hooks API):** 15 hook event types discovered. `Stop` hook fires post-response with `transcript_path`. No hook exposes token data directly.
- **Source B (JSONL Transcripts):** Confirmed — every assistant message includes `message.usage` with `input_tokens`, `output_tokens`, `cache_read_input_tokens`, `cache_creation_input_tokens`. Real sessions show 277+ assistant messages with complete usage data.
- **Source C (Session Metadata):** NOT VIABLE — `~/.claude/projects/{hash}/sessions/` directory does not exist.
- **Source D (Hook Input Payload):** All hooks receive `transcript_path` field — this is the bridge between hooks and token data.
- **Benchmark:** Tail read (50KB) = 0.2ms, full parse (4.5MB) = 47ms, full parse (13MB) = 75ms. Tail read easily meets 100ms requirement.
- **Decision:** GO (condicionado per Codex QA) — Stop hook + JSONL tail read. ADR created. Implementation estimated at 6-8h (2 story points, revised after Codex conditions C1-C4).
- **Key insight:** `cache_read_input_tokens` is the dominant metric for actual context usage (150K+ per turn vs 1-3 for input_tokens).
- **Journey snapshot NOG-11:** No real regressions, all deltas are measurement noise.

### Debug Log References
- N/A (no blocking issues)

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-02-21 | @sm (River) | Story created — Draft. Reclassified from QW-2 per Codex QA review. |
| 2026-02-21 | @po (Pax) | Validated GO (8/10). Added Dev Notes + Source Tree, File List, Dev Agent Record. Fixed STR-2 ref, updated Blocked By (NOG-10 Done), added Source C note. Status: Draft → Ready |
| 2026-02-21 | @architect (Aria) | Research complete. 4 sources investigated. JSONL transcripts via Stop hook confirmed viable (0.2ms latency). ADR created. Decision: GO. Journey snapshot captured. Status: Ready → Ready for Review |
| 2026-02-21 | Codex QA | Review: GO condicionado. 7 findings (2 ALTO, 5 MÉDIO). 5 condições pré-implementação definidas. Handoff review: `HANDOFF-CODEX-QA-REVIEW-NOG-11.md` |
| 2026-02-21 | @architect (Aria) | Applied C5: ACs marked with evidence traceability. Rebaixada afirmação >99.9% (Finding 3). Mini-design doc criado para condições pré-implementação (NOG-15). File List atualizado. |
| 2026-02-21 | @qa (Quinn) | QA Review: CONCERNS (80/100). 2 MEDIUM issues (residual inconsistencies in research doc not propagated from Codex fixes), 2 LOW (effort estimate misalignment). All ACs verified with evidence. Gate file created. |

---

## QA Results

### Review Date: 2026-02-21

### Reviewed By: Quinn (Test Architect)

### Code Quality Assessment

This is a **research/spike story** — no production code was written. The assessment covers documentation quality, evidence traceability, and architectural design rigor.

**Overall: Strong.** The investigation was thorough (4 sources, 2 real sessions benchmarked), the ADR is well-structured with 4 options evaluated, and the Codex QA review added critical safeguards (C1-C5 conditions). The story underwent an unusually rigorous multi-pass review cycle (@po validation → @architect execution → Codex QA → @architect corrections → @qa review).

**Key strengths:**
- All 10 AC items marked with specific artifact evidence references
- Decision criteria (Guardrail #3) respected — timebox honored, fallback defined
- Codex QA findings addressed proactively in IMPL-DESIGN-NOG-15-CONDITIONS.md
- Journey snapshot captured with no regressions

**Residual issues (2 MEDIUM, 2 LOW):**

### Compliance Check

- Coding Standards: N/A (no production code)
- Project Structure: PASS — all artifacts in correct locations (research/, architecture/adrs/, qa/)
- Testing Strategy: N/A (spike story — no tests expected)
- All ACs Met: PASS — AC1 (6/6), AC2 (4/4), AC3 (N/A with rollback retained)

### Improvements Checklist

- [x] `token-source-investigation.md:191` — ~~still references `.claude/settings.json`~~ → Fixed to `.claude/settings.local.json`
- [x] `token-source-investigation.md:165,176,194,216` — ~~still references `updateSession()`~~ → Fixed to `updateSessionMetrics()`
- [x] `token-source-investigation.md:252` — ~~still claims ">99.9% reliability"~~ → Fixed to qualified language
- [x] `ADR-NOG-11-token-source.md:92` — ~~effort estimate "4-6h (1 story point)"~~ → Fixed to "6-8h (2 story points)"
- [x] Story AC2 item 3 evidence — ~~"4-6h (1 story point)"~~ → Fixed to "6-8h (2 story points)"

### Security Review

N/A — No production code. Proposed architecture reads existing files (JSONL) in read-only mode. No new attack surface introduced.

### Performance Considerations

Tail read benchmark (0.2ms) well within 100ms threshold. Journey snapshot NOG-11 shows no performance regressions vs NOG-10. All deltas are measurement noise (dev.projectStatus +10ms intermittent, SYNAPSE p95 +0.31ms).

### Files Modified During Review

| File | Action |
|------|--------|
| `docs/qa/gates/nog-11-token-usage-source-discovery.yml` | CREATE — gate file |

### Gate Status

Gate: **PASS** → `docs/qa/gates/nog-11-token-usage-source-discovery.yml`
Quality Score: **95/100**

### Recommended Status

**Done** — All 5 residual inconsistencies fixed. Story ready to be marked Done.
