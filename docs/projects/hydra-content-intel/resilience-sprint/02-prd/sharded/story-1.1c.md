# Story 1.1c: Characterization test fixture

**Status:** Draft
**Story ID:** 1.1c
**Sprint:** HYDRA Resilience
**Owner:** @dev
**Estimated LOC:** ~500 LOC (50 fixture items + mock LLM responses + snapshot test harness + README)
**Dependencies:** none (unblocks Stories 1.4 + 1.5)
**Date:** 2026-05-12
**Sourced from PRD §5 Story 1.1c (lines 533-552)**

---

## User Story

**As a** HYDRA developer,
**I want** a deterministic snapshot of the current pipeline's behavior captured BEFORE any refactor,
**so that** Stories 1.4 + 1.5 (pipeline split + streaming) cannot merge if they alter observable output.

## Acceptance Criteria

1. **CHARACTERIZATION TEST FIXTURE (per conclave ADR-001):** Capture current pipeline behavior on 50 synthetic fixture items (mix of S/A/B tiers + dedup hits + filter rejects). Stored at `tests/fixtures/pipeline-characterization-2026-05-11/`.
   - 50 fixture input items (JSONL) — deliberately curated, deterministic content (not scraped from live sources)
   - Snapshot of pipeline output: which items were filtered, scored, distributed, to which clones
   - Snapshot of side effects: SQLite row deltas, feed file additions, audit log entries
2. **Deterministic mocked LLM responses (no real API calls during characterization test):** Fixture includes canned JSON responses per item, served via `MockLLMClient` (per architecture §8.4). The characterization test MUST NOT invoke DeepSeek/Anthropic/OpenAI live APIs — failure to mock is a defect. This is mandatory per user-approved decision 2026-05-11 (synthetic curated fixture, mocked LLM).
3. Snapshot test `tests/pipeline.characterization.test.js` re-runs the pipeline on the fixture and asserts byte-identical output (filter decisions, tier assignments, clone routing, feed write paths) post-refactor
4. **Fixture is the regression net for Stories 1.4 + 1.5.** Refactor stories CANNOT merge if characterization test fails (enforced as a required check, not advisory)
5. Documentation: `tests/fixtures/pipeline-characterization-2026-05-11/README.md` explains fixture composition, how to regenerate snapshots when intentional behavior changes ship, and the "no live LLM" rule

## Integration Verification

- **IV1:** Characterization fixture captures CURRENT behavior — re-running the snapshot test on unchanged code produces zero diff
- **IV2:** Running the characterization test with network disabled still passes (proves no live API leakage)
- **IV3:** Deliberately mutating one stage (e.g., flipping a filter threshold) produces a non-empty diff and fails the snapshot test (proves the test actually catches regressions)

## Architecture References

- ADR-001: Streaming pattern — characterization is Fowler's blind-spot catch (`adrs/ADR-001-streaming-pattern.md`)
- Architecture §3.1 Phase 0 (Preflight Infrastructure) — `03-architecture/sharded/01-migration-strategy.md`
- Architecture §8.1 — characterization test file locations
- Architecture §8.4 Mock Strategy — `MockLLMClient` pattern
- Architecture §11 Q3 — fixture-content question (resolution: synthetic curated, not real recent runs)

## Dev Notes

- **User-approved decision 2026-05-11:** Synthetic curated fixture, not 50 real items from last successful run. Rationale (Architecture §11 Q3 resolution): mock LLM means realism gain from real items is marginal, while synthetic items are debuggable when a test fails.
- **Fixture composition target** (Architecture §11 Option B): 15 S-tier, 15 A-tier, 10 B-tier, 5 dedup hits, 5 filter rejects.
- **Pin date in directory name:** `pipeline-characterization-2026-05-11/` — date is the pre-refactor anchor.
- **MockLLMClient** must be implemented BEFORE the fixture can be deterministic (or as part of this story). Per architecture §8.4, pricing constants for the `mock` provider = 0.
- This story is the **gate** for Stories 1.4 + 1.5. Without a green characterization test, those refactors cannot merge. Treat it as required infra, not a "test polish" deliverable.
- Snapshot must compare **structural outputs** (which clones, which feed paths, which tier assignments), NOT LLM-generated text (which is mocked anyway).
