# Architect Review: PRD Unified Handoff System v1.0

**Reviewer:** Aria (Architect Agent)
**Date:** 2026-03-25
**PRD:** `docs/prd-unified-handoff-system.md`
**Epic Under Review:** Epic 2 (Agent Activity & Observability v2.0)
**Verdict:** GO (with recommendations)

---

## Executive Summary

The PRD is well-structured, retroactively documents the v1.0 implementation accurately, and defines a coherent v2.0 roadmap. Epic 2 is technically feasible within the stated constraints. I identified **zero critical blocking issues**, **four medium-severity concerns** that should be addressed before story creation, and **three advisory recommendations** for robustness.

---

## 1. Technical Feasibility Assessment (Epic 2 FRs)

### 1.1 Agent Activity Summaries (FR-8.1 through FR-8.3) -- FEASIBLE

**Assessment:** Fully implementable with existing infrastructure.

The `session-state.js` module already stores events with `agent`, `type`, `timestamp`, and `details` fields. Building a summary is a pure aggregation: group events by `agent` field, count stories per agent (filter by `story_start`/`story_complete`), count files modified (sum `files_modified` fields), and infer active time from timestamp deltas between consecutive `agent_switch` events.

**Trade-off: Time inference accuracy.** The PRD says "time spent (inferred from event timestamps)". This is inherently imprecise because:
- Timestamp gaps between events do not map 1:1 to agent active time (user may be idle)
- If the session only has `agent_switch` and `periodic` events (no fine-grained activity), the resolution is at best 5-prompt intervals

**Recommendation:** Label the time field as "approximate active span" rather than "time spent", and document the limitation. This is NOT blocking.

### 1.2 Agent Memory Integration (FR-9.1 through FR-9.4) -- FEASIBLE WITH CAVEATS

**Assessment:** Implementable, but the keyword matching approach (FR-9.2) needs specification.

The agent memory files at `.claude/agent-memory/{agent-id}/MEMORY.md` are markdown files with `##` section headers. Reading them is trivial (`fs.readFileSync`). The challenge is FR-9.2: "selected based on relevance to active story or current task (keyword matching)."

**Approach analysis (no external NLP dependencies allowed):**

| Approach | Complexity | Accuracy | Recommendation |
|----------|-----------|----------|----------------|
| A. Exact string matching (story ID in MEMORY.md) | Low | High for story-specific content, zero for general knowledge | Baseline |
| B. Token overlap (split story ID + task keywords, match against MEMORY.md lines) | Medium | Medium | Good default |
| C. TF-IDF from scratch (stdlib only) | High | Medium-High | Over-engineering for max 3 hints |

**Recommendation:** Use approach B (token overlap). Split the active story ID and current_task string into tokens, lowercase them, and score each line/section of MEMORY.md by token overlap count. Return top 3. This is ~30 lines of code, zero deps, and good enough for the stated >70% relevance target. The PRD should specify this approach (or leave it to the story's implementation design) rather than the vague "keyword matching."

**Read-only enforcement (FR-9.4, CON-7):** Trivially enforced -- the module will use `fs.readFileSync` only. No risk.

### 1.3 Session Observability (FR-10.1 through FR-10.4) -- FEASIBLE

**Assessment:** Straightforward. All data already exists in Tier 2 `state.yaml` and Tier 3 archives.

For `*session-report`: parse `state.yaml`, aggregate counts. The flat YAML parser handles this fine since all event fields are scalar.

For `*session-history {project}`: scan `.aiox/session-history/{project}/` for `state-*.yaml` files, parse each header (session ID, started date, project), and count events. The <2s target for 50 sessions is achievable since each file is small (<50KB).

**One concern: Archive format.** Story 2.3 AC point 2 says "event count, agents per session." To extract "agents per session" from archived `state.yaml` files, the parser must read all events and deduplicate agent fields. For 50 files of ~100 events each, this is ~5000 parse operations -- well within the 2s budget.

### 1.4 Productivity Metrics (FR-11.1 through FR-11.4) -- FEASIBLE

**Assessment:** On-demand computation from existing data is the right pattern.

Metrics JSON at `.aiox/current-session/metrics.json` is a cache, not a primary store. Good design -- avoids write overhead during normal operations.

**Concern: `*metrics-trend` scanning archived states.** If the user accumulates >100 archived sessions over months, scanning all of them becomes slow. The `--last N` flag mitigates this, but the default (no `--last` flag) should have a sane cap.

**Recommendation:** Default `--last N` to 20 if not specified. Document this default.

### 1.5 Enhanced YAML Serializer (Story 2.5) -- FEASIBLE BUT PREMATURE

**Assessment:** This is the most debatable story. The question is: do v2.0 features (Stories 2.1-2.4) actually need nested YAML?

**Analysis of v2.0 data needs:**

| Story | New Event Fields | Nested? |
|-------|-----------------|---------|
| 2.1 Agent Summaries | None (read-only aggregation) | No |
| 2.2 Memory Hints | `memory_hints` in micro-handoff (JSON, not YAML) | N/A (Tier 1 is JSON) |
| 2.3 Session Observability | None (read-only) | No |
| 2.4 Productivity Metrics | Output to `metrics.json` (JSON, not YAML) | N/A |

**Conclusion: No v2.0 story requires nested YAML.** The flat parser handles all v2.0 use cases. Story 2.5 is future-proofing for a v3.0+ schema evolution that may never happen.

**Recommendation:** Defer Story 2.5 to v3.0 or mark it as LOW priority within Epic 2. Spending effort on a YAML parser upgrade when no current requirement demands it violates the "No Invention" principle (Constitution Article IV). If the team decides to keep it, adding `js-yaml` as a devDependency (not a runtime dependency) for test verification while keeping the custom parser for runtime would be a pragmatic middle ground.

---

## 2. Architecture Integration Assessment

### 2.1 Module Location Discrepancy -- MEDIUM

**Finding:** The PRD states modules live at `.claude/lib/handoff/` (and the unified-handoff.md rule agrees), but files ALSO exist at `.aiox/lib/handoff/`. Both locations have copies.

- `.claude/lib/handoff/` -- Used by hooks (`handoff-auto.cjs`, `handoff-saver.cjs`) and tests
- `.aiox/lib/handoff/` -- A separate copy exists here

**Risk:** If someone edits one copy and not the other, behavior diverges silently. The hooks and tests use the `.claude/lib/handoff/` path, so that is the operational canonical path.

**Recommendation:** The PRD should explicitly declare `.claude/lib/handoff/` as the canonical location and note that `.aiox/lib/handoff/` is either (a) a stale copy to be removed, or (b) a runtime deployment target. This ambiguity should be resolved before Epic 2 development begins.

### 2.2 Hook Integration -- CLEAN

The `handoff-auto.cjs` hook is a second entry in UserPromptSubmit, separate from `synapse-wrapper.cjs`. The `handoff-saver.cjs` is called by `precompact-wrapper.cjs` with proper error isolation and timeout. This is correct -- Epic 2 features do NOT need to modify either hook:

- Stories 2.1, 2.3, 2.4 are on-demand CLI commands (not hook-triggered)
- Story 2.2 extends `micro-handoff.js` to include `memory_hints` field (schema extension, not hook change)

This is well-designed. v2.0 extends the data layer, not the trigger layer.

### 2.3 `*session-report` and `*session-history` Commands -- ARCHITECTURAL QUESTION

The PRD defines these as `*` agent commands but does not specify WHICH agent owns them. Per Agent Authority rules:

- `*session-report` -- Cross-cutting (any agent could run it). Suggest: available on ALL agents (utility command like `*help`)
- `*session-history` -- Cross-cutting. Same recommendation
- `*metrics-trend` -- Cross-cutting. Same recommendation

**Recommendation:** The PRD should specify that these are universal commands available to all agents (similar to `*help`, `*yolo`, `*exit`), not agent-specific. This affects how they are registered in agent definitions.

### 2.4 Tier 2 Event Schema Extension for v2.0 -- SAFE

Story 2.1 needs to aggregate existing event fields. No schema change needed for Tier 2.

Story 2.2 extends Tier 1 (JSON micro-handoff) with a `memory_hints` field. Since Tier 1 is JSON, the flat YAML limitation does not apply. The `validateSchema()` function in `micro-handoff.js` needs to be extended to handle the new field (truncate to max 3 hints). This is backward-compatible: older handoffs without `memory_hints` simply have it missing, and the code defaults to `[]`.

---

## 3. Story Dependency Analysis

### 3.1 Proposed Order

```
Story 2.1 (Activity Summaries)  -- no dependencies, reads existing Tier 2 data
Story 2.2 (Memory Integration)  -- depends on micro-handoff.js (Tier 1), independent of 2.1
Story 2.3 (Session Observability) -- depends on 2.1 (summary format feeds into *session-report)
Story 2.4 (Productivity Metrics) -- depends on 2.3 (extends *session-report with metrics)
Story 2.5 (YAML Serializer)     -- independent of all others, recommend DEFER
```

### 3.2 Assessment

**Circular dependencies:** None detected. The dependency chain is linear.

**Parallelization opportunity:** Stories 2.1 and 2.2 are fully independent and could be worked in parallel.

**Concern: Story 2.3 depends on 2.1.** The `*session-report` command defined in Story 2.3 includes "per-agent summary" which is the output of Story 2.1. If 2.3 is started before 2.1 is complete, the report command would need to be re-opened.

**Recommendation:** The PRD's implicit ordering (2.1 -> 2.2 -> 2.3 -> 2.4 -> 2.5) is correct but should be made explicit. Mark:
- 2.1: No prerequisites
- 2.2: No prerequisites (parallel-eligible with 2.1)
- 2.3: Requires 2.1
- 2.4: Requires 2.3
- 2.5: Deferred (no v2.0 requirement demands it)

---

## 4. Gap Analysis

### 4.1 Missing: Command Registration Mechanism -- MEDIUM

The PRD defines three new commands (`*session-report`, `*session-history`, `*metrics-trend`) but does not specify how they are registered. In the AIOX system, commands are defined in each agent's YAML `commands:` section (e.g., in `.aiox-core/development/agents/architect.md`). If these commands should be universal, they need to be added to EVERY agent definition (12 agents) or added to a shared utility command set.

**Recommendation:** Story 2.3 should include an acceptance criterion: "Commands registered in agent common commands section or documented as universal." The implementation story should specify the mechanism (e.g., add to each agent YAML, or create a shared commands include).

Since agent definitions live in `.aiox-core/development/agents/` which is L2 (protected), this requires framework contributor mode (`boundary.frameworkProtection: false`). The PRD's CON-1 says "ZERO modifications to L1/L2", but adding commands to agent definitions IS an L2 modification.

**Resolution options:**
1. Agent command definitions are technically L2, but adding new command entries (not modifying existing behavior) may be considered an "extension" rather than a "modification." This should be explicitly decided.
2. Alternatively, implement the commands as standalone CLI scripts in `.claude/lib/handoff/` that agents can invoke via `*task` rather than as native agent commands. This stays entirely in L4.

**This is the most significant gap in the PRD.**

### 4.2 Missing: Tier 3 "Agent Activity" Section Integration -- LOW

FR-8.2 says summaries go into the Tier 3 handoff file under "## Agent Activity". But the `trimHandoff()` function in `cross-session-handoff.js` does not recognize "Agent Activity" as a known section. It only matches:
- Stories patterns: `Estado Atual`, `Active Stories`, `Stories`
- Work patterns: `que foi feito`, `Recent Work`
- Plan patterns: `Plano de Execu`, `Execution Plan`
- Docs patterns: `Documentacao Chave`, `Key Docs`
- Continue patterns: `Como Continuar`, `How to Continue`

When trimming, "## Agent Activity" would be treated as an unrecognized section and potentially dropped.

**Recommendation:** Story 2.1 must update the trim algorithm to recognize "Agent Activity" as a preserved section with its own line limit (suggest max 30 lines).

### 4.3 Missing: Error Handling for Corrupt State Files -- LOW

If `.aiox/current-session/state.yaml` is corrupted (partial write due to crash), the current `parseState()` function returns a partial state silently. This is acceptable for v1.0 but v2.0 metrics depend on accurate event counts.

**Recommendation:** Story 2.4 should include a validation step before metrics computation: verify that the parsed event count matches a rough heuristic (number of `- timestamp:` lines in the file). If mismatch detected, log a warning.

---

## 5. Risk Assessment

### 5.1 Risks Already Covered (PRD does well here)

- Hook isolation: Properly addressed with try/catch + timeout + `unref()`
- L1/L2 boundary: Pre-commit hook validates
- Data loss during trim: Full archive before any trim
- YAML parser limitation: Documented as MNT-002

### 5.2 Additional Risks Not Covered

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| **L2 boundary conflict for command registration (Gap 4.1)** | High (80%) | Medium | Must decide: L2 extension vs L4-only scripts before story creation |
| **Duplicate module copies drift (Finding 2.1)** | Medium (40%) | Medium | Designate single canonical path, remove or symlink the other |
| **Trim function drops Agent Activity section (Gap 4.2)** | High (100%) if not addressed | Low | Add "Agent Activity" to recognized section patterns in Story 2.1 |
| **State.yaml grows unbounded in long sessions** | Medium (30%) | Low | A session with 500+ prompts (100+ periodic events) creates a ~50KB YAML file. Not dangerous but worth monitoring. Add a soft cap warning at 500 events. |
| **Memory hints extraction from large MEMORY.md files** | Low (15%) | Low | Agent MEMORY.md files are capped at ~200 lines by convention. Even 1000 lines is trivial to scan. No risk. |

---

## 6. Specific Questions from PM

### Q1: Is the flat YAML serializer limitation (MNT-002) worth resolving now?

**Answer: No.** Analysis in Section 1.5 demonstrates that zero v2.0 stories require nested YAML. Story 2.5 should be deferred to v3.0. The flat parser is sufficient for all planned work.

### Q2: Best approach for keyword-based memory hint extraction (FR-9.2)?

**Answer: Token overlap scoring.** See Section 1.2. Split the active story ID and current_task into lowercase tokens. Score each section of MEMORY.md by counting overlapping tokens. Return top 3 sections (first line of each as the hint). Approximately 30 lines of code, zero dependencies, good accuracy for the >70% relevance target.

### Q3: Streaming vs batch for metrics aggregation from archived sessions?

**Answer: Batch with lazy loading.** For 50 sessions at ~50KB each, batch processing is well under the 2s target (total: ~2.5MB of YAML to parse). Use `fs.readdirSync` to list archives, sort by filename (timestamp in name), take last N, parse each sequentially. No streaming needed -- the dataset is too small to warrant the complexity. If the number exceeds 100+, add a file-level index (`.aiox/session-history/{project}/index.json`) to cache metadata, but this is a v3.0 concern.

---

## 7. Summary of Recommendations

### Before Story Creation (address in PRD or pre-story planning)

1. **RESOLVE: Module location ambiguity.** Declare `.claude/lib/handoff/` as canonical. Remove or explain `.aiox/lib/handoff/` copies.
2. **RESOLVE: Command registration vs L2 boundary.** Decide if `*session-report`, `*session-history`, `*metrics-trend` are L2 agent command extensions or L4-only scripts.
3. **MAKE EXPLICIT: Story dependency order.** 2.1 and 2.2 can run in parallel, 2.3 requires 2.1, 2.4 requires 2.3.
4. **DEFER: Story 2.5** (Enhanced YAML Serializer) to v3.0 or mark LOW priority.

### During Implementation (include in story ACs)

5. Story 2.1 MUST update `trimHandoff()` section patterns to include "Agent Activity".
6. Story 2.1 SHOULD label time metrics as "approximate active span" rather than "time spent."
7. Story 2.2 SHOULD specify token overlap as the hint extraction algorithm (or leave explicit in implementation plan).
8. Story 2.4 SHOULD default `--last N` to 20 when not specified.

### Advisory (non-blocking, good practice)

9. Consider soft cap warning at 500 events in `state.yaml` to catch runaway sessions.
10. Consider adding a `metadata` summary line to archived state files for faster scanning in `*session-history`.
11. Validate event count consistency before metrics computation (parsed events vs line count heuristic).

---

## Verdict: GO

The PRD is solid. Epic 2 is technically feasible within all constraints (Node.js stdlib only, no L1/L2 changes for module code, CommonJS). The four medium-severity concerns (module location, command registration, dependency order, Story 2.5 deferral) should be resolved before story creation but none are architectural blockers.

The existing v1.0 codebase (3 modules + 2 hooks + 71 tests) provides a clean foundation for the v2.0 extensions. The design correctly keeps v2.0 features as read-only aggregations and on-demand computations, avoiding any hook-layer changes.

**One action item requires PM decision:** The command registration question (Gap 4.1) is a boundary policy decision, not a technical one. If the team decides to add commands to L2 agent definitions, `frameworkProtection` must be set to `false` during implementation (it currently is, per `core-config.yaml`). If the team prefers L4-only scripts, no boundary issue exists but the UX is slightly different (`*task session-report` instead of `*session-report`).

---

*-- Aria, arquitetando o futuro*
