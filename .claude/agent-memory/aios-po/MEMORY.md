# Pax (PO) Agent Memory

## IDS Epic Backlog Analysis (2026-02-09)
- IDS-1/2/3: Done. Foundation solid (474 entities, RegistryLoader, DecisionEngine, RegistryUpdater all implemented).
- IDS-4: 10 tasks, scope-expanded with Roundtable #6B/#6C (Performance + Quality Integrity). Oversized.
- IDS-5: 10 tasks covering G1-G6 gates + 6 agent definitions + override + audit. Oversized.
- IDS-6: 8 tasks, documentation/constitution amendment. Appropriately sized but depends on ALL others.
- aios-master has NO IDS commands currently (grep confirms zero matches for "ids" or "registry" in agent def).
- Existing CLI: `bin/aios-ids.js` has `ids:query` and `ids:create-review` only. No `ids:health`.
- Key file: `registry-updater.js` already has backup/locking infrastructure that IDS-4 healer can reuse.

## Story Sizing Heuristics
- Single story sweet spot: 5-7 tasks, 6-10 hours dev time
- Stories >8 tasks or >12 hours should be evaluated for splitting
- Stories touching >3 agent definitions in one go are high-risk

## Key Dependencies Pattern (Updated post-course-correction)
- IDS foundation (1-3) complete.
- Post-split structure: IDS-4a/4b (self-healing), IDS-5a/5b (gates), IDS-7 (governor), IDS-6 (constitution)
- Wave 1 parallel: IDS-4a + IDS-5a + IDS-7 (all independent, only need IDS-1/2/3)
- IDS-5a depends ONLY on IDS-2 (DecisionEngine.analyze()), NOT IDS-4. Critical fix from course correction.
- index.js listed as "Done" in EPIC-INDEX but NOT on disk -- pre-existing discrepancy, not a blocker

## IDS-5a Validation (2026-02-09)
- Validated GO: 10/10 checklist, 9/10 readiness, 0 critical issues
- 3 should-fix: (1) clarify integration subtask wording vs IDS-5b scope, (2) gates compose with DecisionEngine not RegistryLoader, (3) add explicit scope section
- 6 tasks, 28 subtasks -- right in the sweet spot
- DecisionEngine public API confirmed: analyze(intent, context) at line 57, exports at line 642
- RegistryLoader privates: _getAllEntities() line 76, _ensureLoaded() line 67 -- gates should NOT use these directly

## IDS-7 Validation (2026-02-09)
- Validated GO: 10/10 checklist, 9/10 readiness, 0 critical issues. Status: Ready.
- 2 should-fix: (1) postRegister() should clarify use of processChanges() vs onAgentTaskComplete(), (2) index.js barrel file missing on disk
- 7 tasks, 37 subtasks, 5-6h estimate -- within sweet spot
- All 12 API method references verified against actual codebase
- RegistryUpdater API: processChanges([{action, filePath}]) AND onAgentTaskComplete(task, artifacts) -- story should prefer onAgentTaskComplete for audit
- bin/aios-ids.js currently: ids:query, ids:create-review. IDS-7 adds: ids:stats, ids:impact

## Validation Anti-Patterns
- Epic INDEX claiming file exists when it doesn't (index.js) -- always verify with Glob
- Story pseudo-code may not match exact API signatures -- always grep for actual method names in source
