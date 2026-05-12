# Architecture §11 — Open Questions for Orion (RESOLVED)

**Source:** `../architecture.md` lines 1192-1229
**Sharded by:** @po, 2026-05-12

---

Before @po validated this architecture, three questions where Aria's recommendation diverged from a strict reading of the inputs or where reasonable people could disagree.

**All three resolved as of 2026-05-12 PO validation.**

## Q1 — Should `pipeline.js` (the shim) be deleted at sprint-end or kept for one release?

**The PRD says** (§3.3): "`src/pipeline.js` retained as **thin re-export shim** during transition for backwards-compat. Removed in sprint #2 after one release cycle."

**Aria's concern:** That's the right call IF anyone imports from `pipeline.js` directly. Aria grep'd the codebase in `01-analysis` and the only consumer is `bin/hydra.js`'s `runPipeline` import. Inside the codebase, after the sprint, there will be exactly one such import. Keeping the shim costs nothing, but if you'd rather just rewrite that one line in `bin/hydra.js` and delete `pipeline.js` at sprint-end, that's also clean.

**Aria's recommendation:** Keep the shim, ship the sprint, delete it in sprint #2 as planned. Cheap insurance.

**Resolution (2026-05-12 @po):** ✅ **ACCEPTED — keep shim per architecture recommendation.** Story 1.4 AC #2 codifies this. Constitution Article VI absolute-imports SHOULD does not apply (HYDRA has no bundler, no `tsconfig paths`, no `@/` alias). Shim uses relative import deliberately.

## Q2 — Should `mind-clone-router.js` accept paths via options (eliminating R9), or keep `__dirname` resolution?

**Context:** `01-analysis` §6.3 documents that `bin/ingest-dossier.mjs` works around mistrusted `__dirname` resolution by passing absolute paths explicitly. The PRD says (CR4 caveat): "25+ files use `__dirname` relative resolution".

**The post-sprint world has only ONE caller** of `routeToMindClones()` — the new `DistributionService`. Aria proposed two options:
- **Option A (status quo):** Keep `__dirname` resolution in `mind-clone-router.js`. Trust the math.
- **Option B (refactor):** Make `mind-clone-router.js` accept paths via options (mandatory), with `DistributionService` resolving them once at startup.

Option B eliminates an entire class of bugs (R9) and makes the module purely functional. But it's scope-creep relative to PRD.

**Aria's recommendation:** Defer to sprint #2. The sprint is already big. Document it as a follow-up. But flag it for @po to confirm.

**Resolution (2026-05-12 @po):** ✅ **ACCEPTED — Option A (defer to sprint #2).** R9 mitigation via architecture §7.1: "`mind-clone-router.js` does NOT move." Each refactored stage stays inside `src/pipeline/stages/` at same directory depth as today's `src/dedup/`, `src/curator/` — `__dirname` math unchanged. Story 1.6 AC explicitly preserves the routing algorithm in JS; only the data source moves to YAML.

## Q3 — Should the characterization fixture use REAL recent runs, or synthetic curated content?

**Story 1.1 AC #7** says "50 fixture input items (JSONL)" but doesn't specify their origin.

**Aria's options:**
- **Option A:** Use 50 items from the last successful pre-OOM run (heartbeat date 2026-04-16). Real-world distribution. Real-world clone routing.
- **Option B:** Synthetic curated 50-item fixture: 15 S-tier, 15 A-tier, 10 B-tier, 5 dedup hits, 5 filter rejects. Each constructed to exercise specific behaviors.

Option A is more "real". Option B is more controllable and the test won't be brittle to LLM nondeterminism.

**Aria's recommendation:** Option B. The test mocks the LLM anyway (§8.4); using real items doesn't gain realism beyond the structural side effects we already capture, and synthetic items are easier to debug when a test fails. But this requires building the 50 fixture items, which is a small but non-trivial Story 1.1 task.

**Resolution (2026-05-11 user-approved):** ✅ **ACCEPTED — Option B (synthetic curated).** PRD Story 1.1c AC #2 codifies this: "Synthetic curated fixture, mocked LLM." Mandatory per user-approved decision 2026-05-11. RA-5 mitigation in `06-risk-mitigation.md` documents the fixture stays deterministic because LLM responses are mocked.

## Status Summary

| Q | Topic | Resolution | Story binding |
|---|-------|------------|---------------|
| Q1 | Keep `pipeline.js` shim | Yes (keep, delete in sprint #2) | Story 1.4 AC #2 |
| Q2 | `mind-clone-router.js` path injection | Defer to sprint #2 | Story 1.6 (no change) |
| Q3 | Characterization fixture content | Synthetic curated | Story 1.1c AC #2 |

All three resolutions are now BAKED INTO the PRD v1.0 RC. @sm can proceed with story pulls without revisiting these.
