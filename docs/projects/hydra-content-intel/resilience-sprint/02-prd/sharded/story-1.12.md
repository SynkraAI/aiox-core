# Story 1.12: Connect Feeds to Consultation Engine

**Status:** ✅ SHIPPED 2026-05-12
**Story ID:** 1.12
**Sprint:** HYDRA Resilience
**Owner:** @dev (shipped as critical hotfix concurrently with refactor work)
**Estimated LOC:** ~150 LOC + tests (small scope, big impact)
**Dependencies:** none (no upstream deps; soft coupling to Story 1.8 cost-tracker for AC #11)
**Date:** 2026-05-12
**Sourced from PRD §5 Story 1.12 (lines 832-887)**

---

## User Story

**As a** user consulting any mind clone,
**I want** the consultation engine to load that clone's HYDRA knowledge feeds before generating a response,
**so that** the clone answers with up-to-date research instead of hallucinating about content it cannot see.

(🚨 **Added 2026-05-12 after empirical validation revealed that HYDRA feeds are NEVER loaded by `self-consultation.js`.** Without this story, the entire Resilience Sprint produces feeds that go nowhere — write-only knowledge silo.)

## Evidence of Bug (from PRD)

- `grep -r "knowledge-feed\|hydra-feed" D:/AIOS/.aios-core/` → No matches found
- Empirical consult test on alison-darcy: `mindCloneEnrichment.relevantMemory: []` (empty)
- Feed file exists: `D:/jarvis/mega brain/knowledge-feed/alison-darcy/2026-05-08-hydra-feed.md` (164KB, never read)

## Acceptance Criteria

1. New module `src/distribution/feed-reader.js` exposing:
   - `loadCloneFeeds(cloneId, { days=30, maxTokens=30000, minTier='A' })` — returns array of feed entries
   - Reads from `${MEGA_BRAIN_ROOT}/knowledge-feed/${cloneId}/YYYY-MM-DD-hydra-feed.md` files
   - Filters by date range (last N days), tier (S/A only by default — B excluded if older than 7 days), token budget
   - Returns structured entries: `{ date, title, url, tier, content, source_name }`
2. `D:/AIOS/.aios-core/core/jarvis/self-consultation.js` `consult()` function updated:
   - After `resolveExpert(expertId)`, calls `loadCloneFeeds(expertId)` (NEW)
   - **Populates NEW field `mindCloneEnrichment.feedEntries: FeedEntry[]`** (rename from `relevantMemory` per ADR-004 + C-10 audit recommendation)
   - **Keeps existing `mindCloneEnrichment.relevantMemory: string[]` as legacy alias** (kept empty `[]` for 1 release cycle — Sprint #2 deletes after re-audit confirms zero consumers post-2026-06-12)
   - Injects feed section into `consultationPrompt` between Principles and Question (using `feedEntries`):
     ```
     ## Recent Knowledge (from HYDRA feed, last 30 days)
     [Date] [Tier] [Title]
     URL: [url]
     [content excerpt]
     ---
     ```
3. Token budget enforcement: max **30k tokens per expert per consultation**. In conclave mode (N experts), total budget is N × 30k. This is the deliberate trade-off: richer context per expert vs higher API cost (~R$1.50 per 5-expert conclave at DeepSeek pricing). Truncate oldest first within each expert's budget.
4. Source attribution mandatory: every feed entry includes URL → consultation prompt instructs LLM to cite URL when using feed content.
5. Staleness signal: if no feed entries in last 30 days, prompt explicitly says: "⚠️ No recent feed entries found. Answer from frozen knowledge only — do NOT fabricate recent sources."
6. CLI flag `node self-consultation.js consult --no-feed` for testing without feed injection (regression test).
7. New `hydra` CLI commands:
   - `hydra feed read <clone-id> [--days 7] [--tier S,A]` — preview what would be injected
   - `hydra feed coverage` — shows which clones have stale/empty feeds (>30 days old or empty)
8. Unit tests: `tests/distribution/feed-reader.test.js` covering token budget, tier filter, date filter, empty feed handling.
9. Integration test: `tests/consultation/feed-injection.test.js` — runs consult on test clone, asserts prompt contains feed content.
10. **Regression test:** Re-run the empirical bug validation — consult alison-darcy with same question. Resulting prompt MUST contain feed entries.
11. **Conclave mode cost tracking** — when invoked via batch/conclave, each expert's feed injection logged separately to `pipeline_runs.cost_brl` per the cost-tracker module (Story 1.8). Total cost per conclave printed to operator post-execution.
12. **Legacy field retention** — `mindCloneEnrichment.relevantMemory: string[]` remains in API response, hardcoded to `[]`, with JSDoc deprecation note: `@deprecated since v1.0, use feedEntries. Will be removed in Sprint #2 (post 2026-06-12 re-audit).`

## Integration Verification

- **IV1:** Consultation without feeds (clone with empty `knowledge-feed/` dir) returns gracefully with staleness warning, doesn't crash
- **IV2:** Consultation with 30+ days of feeds respects token budget (no prompt explosion)
- **IV3:** Existing `consultation-engine.js` (used by other AIOS workflows) backwards-compatible — feed injection is opt-in or default-on with disable flag
- **IV4:** No regression in conclave (`batch` and `conclave` subcommands) — they call same `consult()` path so feed injection inherits naturally

## Architecture References

- ADR-004: Consumption-side architecture (`adrs/ADR-004-consumption-side.md`)
- Architecture §10A (Consumption-Side Architecture) — `03-architecture/sharded/09-consumption-side.md`
- Architecture §10A.1 `feed-reader.js` module spec
- Architecture §10A.2 `mindCloneEnrichment` shape update (resolves C-10)
- Architecture §10A.3 Consultation prompt template — new "Recent Knowledge" section
- Architecture §10A.4 Conclave mode token accounting
- Architecture §10A.5 Component diagram addendum
- `audits/C-10-relevantMemory-audit.md` — full audit of relevantMemory consumers

## Dev Notes — Why This Was In Scope

From PRD §5 Story 1.12 closing rationale:
- Without this, the entire Sprint #1 ships HYDRA fixed but **useless** (write-only silo)
- The fix is small (~150 LOC + tests)
- It's the actual user value — the OOM fix is means to an end, this is the end
- User explicitly approved 2026-05-12 after empirical bug discovery

## Implementation Report

**Shipped:** 2026-05-12 by @dev as critical hotfix.

**Commit:** see git log for `feat(hydra): connect feeds to consultation engine [Story 1.12]`

**File List (actual files created/modified):**
- `D:/AIOS/tools/hydra/src/distribution/feed-reader.js` (NEW)
- `D:/AIOS/tools/hydra/src/distribution/feed-types.js` (NEW — shared `FeedEntry` typedef)
- `D:/AIOS/.aios-core/core/jarvis/self-consultation.js` (MODIFIED — `consult()` + `buildConsultationPrompt`)
- `D:/AIOS/tools/hydra/bin/hydra.js` (MODIFIED — added `feed read`, `feed coverage` sub-commands)
- `D:/AIOS/tools/hydra/tests/distribution/feed-reader.test.js` (NEW)
- `D:/AIOS/tools/hydra/tests/consultation/feed-injection.test.js` (NEW)

**Key design decisions actualized:**
- Field renamed `relevantMemory` → `feedEntries` (per ADR-004 + C-10 audit)
- Legacy `relevantMemory: []` retained as alias for 1 release cycle (Sprint #2 deletes after 2026-06-12 re-audit)
- Filesystem-only reader (no SQLite, no cache) — bounded reads ≤30 files × ≤200KB completes in ≤50ms
- Pre-2026-05-12 feed entries quarantined per ADR-004 Decision 6 (anti-hallucination warning in prompt)
- Token budget per expert = 30k; conclave = N × 30k (per ADR-004 Decision 2 + PRD AC #3 user approval)

**Note for @sm:** Story is closed — already shipped. No further work needed. Re-audit scheduled for 2026-06-12 to confirm zero consumers of legacy `relevantMemory` field before Sprint #2 deletes it.
