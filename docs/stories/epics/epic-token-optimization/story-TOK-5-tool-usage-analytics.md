# Story TOK-5: Tool Usage Analytics Pipeline

## Metadata

| Field | Value |
|-------|-------|
| **Story ID** | TOK-5 |
| **Epic** | Token Optimization — Intelligent Tool Loading |
| **Type** | Enhancement |
| **Status** | Ready for Review |
| **Priority** | P2 (Intelligence) |
| **Points** | 5 |
| **Agent** | @dev (Dex) + @analyst (Atlas) |
| **Quality Gate** | @architect (Aria) |
| **Quality Gate Tools** | [analytics_accuracy, baseline_comparison] |
| **Blocked By** | TOK-1.5 (Done) |
| **Branch** | feat/epic-token-optimization |
| **Origin** | Blueprint v2.0 — closing the optimization loop |

---

## Executor Assignment

```yaml
executor: "@dev + @analyst"
quality_gate: "@architect"
quality_gate_tools: ["analytics_accuracy", "baseline_comparison"]
```

### Agent Routing Rationale

| Agent | Role | Justification |
|-------|------|---------------|
| `@dev` | Implementor | Creates analytics collection, storage, and reporting. |
| `@analyst` | Co-executor | Analyzes data, produces promote/demote recommendations. |
| `@architect` | Quality Gate | Validates analytics accuracy vs baseline, architectural soundness. |

## Story

**As a** AIOS framework maintainer,
**I want** a tool usage analytics pipeline that tracks which tools are used, how often, and their token cost,
**so that** I can validate optimization targets against baseline and automatically recommend tool promotion/demotion.

## Context

After baseline measurement (TOK-1.5) and optimizations (TOK-2, TOK-3, TOK-4A/B, TOK-6), we need to close the loop with actual measurement. This story compares post-optimization metrics against baseline to validate the 25-45% reduction target. It also generates automatic recommendations: frequently-used deferred tools should be promoted to always-loaded, rarely-used always-loaded tools should be demoted.

### Research References
- [Token Optimization Architecture — Analytics](../../../research/2026-02-22-aios-token-optimization-architecture/)
- [Blueprint v2.0 — Success Metrics](ARCHITECT-BLUEPRINT.md#8-success-metrics-v20--conservador)
- [TOK-1.5 Baseline](story-TOK-1.5-baseline-metrics.md)

## Acceptance Criteria

### Data Collection

1. Tool usage tracked per session: tool name, invocation count, token cost (input + output), timestamp
2. Data stored in `.aios/analytics/tool-usage.json` (runtime, gitignored)
3. Collection is non-intrusive: no performance impact on tool execution

### Baseline Comparison

4. Post-optimization metrics compared against TOK-1.5 baseline for each workflow
5. Comparison report includes: total token reduction %, per-workflow breakdown, per-tool breakdown
6. Report clearly states whether 25-45% target is achieved, partially achieved, or not achieved

### Promote/Demote Recommendations

7. Tools used >10 times per session average → recommend promote from deferred to frequently_used
8. Tools used <1 time per 5 sessions → recommend demote from always_loaded to deferred
9. Recommendations output as structured YAML with tool name, current tier, recommended tier, evidence

### Data Governance (Handoff ajuste obrigatorio)

10. Define minimum event schema: tool_name, invocation_count, token_cost_input, token_cost_output, session_id, timestamp
11. Data retention: 30 days rolling window, older data archived or deleted
12. Privacy/sanitization: no user content or sensitive payloads stored in analytics (tool names and counts only)

### Promote/Demote Thresholds

13. Promote threshold: tool used >10 times per session average across 5+ sessions → recommend tier upgrade
14. Demote threshold: tool used <1 time per 5 sessions average → recommend tier downgrade
15. Thresholds are configurable in tool-registry.yaml (not hardcoded)

### Reporting

16. Summary report generated at `.aios/analytics/optimization-report.json`
17. Report includes: measurement period, sessions analyzed, total tokens saved, percentage reduction
18. `npm test` passes — zero regressions

## Tasks / Subtasks

> **Execution order:** Task 1 → Task 2 → Task 3 → Task 4 → Task 5

- [x] **Task 1: Data collection + governance** (AC: 1, 2, 3, 10, 11, 12)
  - [x] 1.1 Define minimum event schema: tool_name, invocation_count, token_cost_input, token_cost_output, session_id, timestamp (AC 10)
  - [x] 1.2 Create `collect-tool-usage.js` script — session-end collection via post-session hook or manual trigger
  - [x] 1.3 Store data in `.aios/analytics/tool-usage.json` (AC 2)
  - [x] 1.4 Implement 30-day rolling window retention (AC 11)
  - [x] 1.5 Ensure sanitization — tool names and counts only, no user content or payloads (AC 12)
  - [x] 1.6 Validate no performance impact on tool execution (AC 3)

- [x] **Task 2: Baseline comparison** (AC: 4, 5, 6)
  - [x] 2.1 Load TOK-1.5 baseline from `.aios/analytics/token-baseline.json`
  - [x] 2.2 Compare post-optimization metrics per workflow (SDC, QA Loop, Spec Pipeline, Interactive)
  - [x] 2.3 Calculate total token reduction percentage
  - [x] 2.4 Generate comparison report with per-workflow and per-tool breakdown
  - [x] 2.5 State whether 25-45% target is achieved, partially achieved, or not achieved (AC 6)

- [x] **Task 3: Promote/demote engine + thresholds** (AC: 7, 8, 9, 13, 14, 15)
  - [x] 3.1 Implement promotion logic: tool used >10 times per session average across 5+ sessions (AC 7, 13)
  - [x] 3.2 Implement demotion logic: tool used <1 time per 5 sessions average (AC 8, 14)
  - [x] 3.3 Make thresholds configurable in `tool-registry.yaml` under `analytics.thresholds` (AC 15)
  - [x] 3.4 Generate recommendations YAML at `.aios/analytics/recommendations.yaml` with tool name, current tier, recommended tier, evidence (AC 9)

- [x] **Task 4: Reporting** (AC: 16, 17)
  - [x] 4.1 Generate `optimization-report.json` at `.aios/analytics/` (AC 16)
  - [x] 4.2 Include: measurement period, sessions analyzed, total tokens saved, percentage reduction (AC 17)

- [x] **Task 5: Validation** (AC: 18)
  - [x] 5.1 Run `npm test` — zero regressions
  - [x] 5.2 Validate all output JSON/YAML files parse correctly
  - [x] 5.3 Verify report accuracy against manually calculated baseline comparison

## Scope

### IN Scope
- Tool usage data collection
- Baseline comparison reporting
- Promote/demote recommendations
- Summary optimization report

### OUT of Scope
- Real-time dashboard or UI
- Automated tool tier changes (manual review of recommendations)
- Cross-project analytics
- Historical trend analysis

## Dependencies

```
TOK-1.5 (Baseline, Done) → TOK-5 (baseline is reference for comparison)
```

**Note:** TOK-6 (Dynamic Filtering) is NOT a dependency. TOK-5 can proceed independently using TOK-1.5 baseline. If TOK-6 completes first, its metrics can be included in comparison but are not required.

## Complexity & Estimation

**Complexity:** Medium-High
**Estimation:** 5 points (collection engine + data governance + baseline comparison + promote/demote engine + reporting)

## Boundary Impact (L1-L4)

| Path | Layer | Action | Deny/Allow |
|------|-------|--------|-----------|
| `.aios-core/infrastructure/scripts/collect-tool-usage.js` | L2 | Created | **REQUER** `frameworkProtection: false` ou allow exception |
| `.aios-core/infrastructure/scripts/generate-optimization-report.js` | L2 | Created | **REQUER** `frameworkProtection: false` ou allow exception |
| `.aios-core/data/tool-registry.yaml` | L3 | Modified | ALLOW (`data/**`) |
| `.aios/analytics/tool-usage.json` | L4 | Created | N/A (gitignored runtime) |
| `.aios/analytics/optimization-report.json` | L4 | Created | N/A (gitignored runtime) |
| `.aios/analytics/recommendations.yaml` | L4 | Created | N/A (gitignored runtime) |

**Scope Source of Truth:** Mixed — scripts L2 (framework, require contributor mode), config L3 (project, allowed), runtime L4 (gitignored).
**Note:** `frameworkProtection: false` is currently active (temporary from TOK-3), allowing L2 writes.

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Token count accuracy limited by Claude Code observability | MEDIUM | Use available metadata; estimate where needed |
| Promote/demote thresholds too aggressive | LOW | Thresholds are configurable (AC 15); recommendations are advisory |
| Analytics data grows unbounded | LOW | Rotation: 30 days (AC 11) |
| Sensitive data in analytics payloads | LOW | AC 12 requires sanitization — tool names and counts only |

## Dev Notes

### Technical References
- Baseline: `.aios/analytics/token-baseline.json` (TOK-1.5)
- Tool registry: `.aios-core/data/tool-registry.yaml` (TOK-1)
- Runtime data: `.aios/analytics/` (gitignored)

### Implementation Notes
- **Collection approach:** Script-based (`collect-tool-usage.js`) triggered manually at session end via `node .aios-core/infrastructure/scripts/collect-tool-usage.js`. Reads session metadata (if available) or accepts manual input for tool counts. Future: hook into Claude Code session events.
- **Promote/demote recommendations are advisory** — human reviews before applying changes to tool-registry.yaml
- **Data retention:** 30-day rolling window. Script auto-prunes entries older than 30 days on each run.
- **JSON/YAML format** for easy parsing by scripts and future dashboard
- **Thresholds in tool-registry.yaml:** Add `analytics: { thresholds: { promote: { minUsesPerSession: 10, minSessions: 5 }, demote: { maxUsesPerNSessions: 1, sessionWindow: 5 } } }` — configurable, not hardcoded
- **Boundary:** All runtime outputs in `.aios/analytics/` (L4, gitignored). Scripts in `.aios-core/infrastructure/scripts/` (L2). tool-registry.yaml modification in `.aios-core/data/` (L3, ALLOW).

## Testing

```bash
# Validate analytics JSON
node -e "JSON.parse(require('fs').readFileSync('.aios/analytics/tool-usage.json', 'utf8')); console.log('VALID')"

# Verify no regressions
npm test
```

## File List

| File | Action | Description |
|------|--------|-------------|
| `.aios-core/infrastructure/scripts/collect-tool-usage.js` | Created | Tool usage collection script (session-end trigger) |
| `.aios-core/infrastructure/scripts/generate-optimization-report.js` | Created | Baseline comparison + report generation script |
| `.aios-core/data/tool-registry.yaml` | Modified | Add `analytics.thresholds` section for configurable promote/demote |
| `.aios/analytics/tool-usage.json` | Created (runtime) | Tool usage tracking data (gitignored) |
| `.aios/analytics/optimization-report.json` | Created (runtime) | Comparison report vs baseline (gitignored) |
| `.aios/analytics/recommendations.yaml` | Created (runtime) | Promote/demote recommendations (gitignored) |
| `tests/unit/tok5-analytics.test.js` | Created | 27 unit tests for collect-tool-usage.js + generate-optimization-report.js |
| `docs/stories/epics/epic-token-optimization/story-TOK-5-tool-usage-analytics.md` | Modified | Story file (checkboxes, Dev Agent Record) |

## CodeRabbit Integration

| Field | Value |
|-------|-------|
| **Story Type** | Feature / Analytics |
| **Complexity** | Medium |
| **Primary Agent** | @dev + @analyst |
| **Self-Healing Mode** | light (2 iterations, 15 min, CRITICAL only) |

**Severity Behavior:**
- CRITICAL: auto_fix (max 2 iterations)
- HIGH: document_as_debt
- MEDIUM: ignore
- LOW: ignore

**Focus Areas:**
- Data accuracy and completeness
- Baseline comparison correctness
- Recommendation threshold logic

## QA Results

### QA Gate: PASS

**Reviewer:** @qa (Quinn) | **Date:** 2026-02-23 | **Model:** Claude Opus 4.6

**AC Traceability:** 18/18 PASS

| AC | Verdict | Evidence |
|----|---------|----------|
| 1 | PASS | `createEvent()` tracks tool_name, invocation_count, token_cost (input+output), timestamp per session. Schema verified programmatically. |
| 2 | PASS | Data stored in `.aios/analytics/tool-usage.json`. `saveUsageData()` creates dir with `{ recursive: true }`. Path confirmed in code (line 31-32). |
| 3 | PASS | Script-based, post-session trigger. No hooks into tool execution. Zero performance impact by design. |
| 4 | PASS | `compareBaseline()` loads TOK-1.5 baseline, compares against post-optimization usage data per workflow. |
| 5 | PASS | Report includes: `percentage_reduction`, `workflow_comparison` (per-workflow), `per_tool_breakdown` (per-tool). All fields verified. |
| 6 | PASS | `target_25_45_pct` field with 3 states: ACHIEVED (>=25%), PARTIALLY_ACHIEVED (15-25%), NOT_ACHIEVED (<15%). Verified in test: 82.8% = ACHIEVED. |
| 7 | PASS | Promotion logic: `avg_invocations_per_session > thresholds.promote.minUsesPerSession && sessions_used >= minSessions`. Verified: exa tier_3 -> tier_2 in test. |
| 8 | PASS | Demotion logic: `usesPerWindowSessions < maxUsesPerNSessions && sessionCount >= sessionWindow`. Also detects never-used tools in registry. |
| 9 | PASS | Recommendations output as structured YAML at `.aios/analytics/recommendations.yaml` with tool_name, current_tier, recommended_tier, evidence, rationale. |
| 10 | PASS | Schema: tool_name, invocation_count, token_cost_input, token_cost_output, session_id, timestamp. `validateEvent()` enforces all 6 fields. |
| 11 | PASS | `pruneOldEntries()` removes sessions older than 30 days. `RETENTION_DAYS = 30`. Retention test: 1 old session removed, 1 recent kept. |
| 12 | PASS | `sanitizeEvent()` strips non-alphanumeric chars from tool_name/session_id. Only stores tool names and numeric counts. No payloads/content. |
| 13 | PASS | Promote threshold: >10 uses/session across 5+ sessions. Values from `loadThresholds()`, which reads tool-registry.yaml. |
| 14 | PASS | Demote threshold: <1 use per 5 sessions. Also flags never-used Tier 1/2 tools for demotion to Tier 3. |
| 15 | PASS | Thresholds in `tool-registry.yaml` under `analytics.thresholds`. `loadThresholds()` reads with `DEFAULT_THRESHOLDS` fallback. Not hardcoded. |
| 16 | PASS | Report generated at `.aios/analytics/optimization-report.json`. `saveReport()` confirmed. |
| 17 | PASS | Report includes: `measurement_period` (start, end), `sessions_analyzed`, `total_tokens_saved`, `percentage_reduction`. All fields in `generateReport()`. |
| 18 | PASS | npm test: 285 suites pass, 7057 tests pass. 11 pre-existing failures in pro-design-migration (unrelated). Zero regressions. |

**Concerns (ALL RESOLVED):**
- C1: RESOLVED — `compareBaseline()` now separates static overhead (registry tokenCost for tools used) from dynamic invocation costs. Accepts `registry` parameter for apples-to-apples comparison. Includes `comparison_methodology` field and `dynamic_usage` section.
- C2: RESOLVED — Demote logic replaced with precise `sessions_used / sessionCount < maxUsesPerNSessions / sessionWindow` rate comparison. Evidence now includes `demote_threshold_rate`. Unit test confirms: 1/10 sessions = demote, 2/5 sessions = no demote.
- C3: RESOLVED — `tests/unit/tok5-analytics.test.js` created with 27 tests covering both scripts (createEvent, sanitizeEvent, validateEvent, pruneOldEntries, aggregateUsage, compareBaseline, generateRecommendations, generateReport). All 27 pass.

**Tests:** 285 suites pass, 11 pre-existing failures in pro-design-migration (unrelated). All programmatic AC checks PASS.

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Implementation Summary

**Task 1 — Data Collection + Governance:**
Created `collect-tool-usage.js` at `.aios-core/infrastructure/scripts/`. Script accepts tool usage data via stdin JSON or `--sample` mode. Minimum event schema enforced (AC 10): tool_name, invocation_count, token_cost_input, token_cost_output, session_id, timestamp. Data stored in `.aios/analytics/tool-usage.json` (AC 2). 30-day rolling window retention auto-prunes on each run (AC 11). Sanitization strips non-alphanumeric chars, stores only tool names and counts (AC 12). Script-based, post-session trigger — zero performance impact on tool execution (AC 3).

**Task 2 — Baseline Comparison:**
Created `generate-optimization-report.js` with `compareBaseline()` function. Loads TOK-1.5 baseline from `.aios/analytics/token-baseline.json`. Compares per-workflow (SDC, QA Loop, Spec Pipeline, Interactive) and per-tool. Calculates total token reduction percentage. States target status: ACHIEVED (>=25%), PARTIALLY_ACHIEVED (15-25%), or NOT_ACHIEVED (<15%) (AC 6).

**Task 3 — Promote/Demote Engine + Thresholds:**
`generateRecommendations()` function implements both promotion (AC 7, 13) and demotion (AC 8, 14) logic. Thresholds configurable in `tool-registry.yaml` under `analytics.thresholds` (AC 15) — not hardcoded. Reads registry thresholds with DEFAULT_THRESHOLDS fallback. Recommendations output as structured YAML at `.aios/analytics/recommendations.yaml` with tool_name, current_tier, recommended_tier, evidence (AC 9).

**Task 4 — Reporting:**
`generateReport()` produces `optimization-report.json` at `.aios/analytics/` (AC 16). Includes: measurement_period (start, end), sessions_analyzed, total_tokens_saved, percentage_reduction (AC 17).

**Task 5 — Validation:**
npm test: 284 suites pass, 11 pre-existing failures in pro-design-migration (unrelated). All output JSON/YAML validated via programmatic parsing. Module exports verified for both scripts.

### Debug Log References
None — clean implementation, no blocking issues.

### Completion Notes
- All 5 tasks complete, all 18 ACs addressed.
- 3 source files created/modified (2 scripts + 1 registry config).
- 3 runtime files generated at `.aios/analytics/` (gitignored).
- Both scripts use `require.main === module` guard for safe importing.
- Thresholds in tool-registry.yaml are configurable defaults.

## Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-22 | @sm (River) | Story drafted from Blueprint v2.0 |
| 1.1 | 2026-02-23 | @po (Pax) | PO validation fixes: CF-1 Tasks restructured 4→5 with correct AC mapping (18 ACs fully covered); CF-2 Blocked By updated TOK-1.5→TOK-1.5 (Done); CF-3 False dependency TOK-6 removed (TOK-5 is independent); SF-1 File List expanded 2→7 files (scripts, registry mod, recommendations output); SF-2 Sizing adjusted 3→5 points; SF-3 Implementation Notes specified — script-based collection, configurable thresholds in tool-registry.yaml. 18 ACs, 5 tasks. |
| 2.0 | 2026-02-23 | @dev (Dex) | Implementation complete: collect-tool-usage.js created (10 fields, sanitization, 30-day retention), generate-optimization-report.js created (baseline comparison, promote/demote, reporting), tool-registry.yaml updated (analytics.thresholds). All 5 tasks done, 18 ACs addressed. Status → Ready for Review. |
| 2.1 | 2026-02-23 | @dev (Dex) | QA concerns resolved: C1 — compareBaseline() now separates static overhead (registry tokenCost) from dynamic usage with registry parameter; C2 — demote logic uses precise sessions_used/sessionCount rate vs threshold rate; C3 — 27 unit tests added in tests/unit/tok5-analytics.test.js. All 27 pass. |
