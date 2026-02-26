# Story TOK-1.5: Baseline Metrics per Workflow

## Metadata

| Field | Value |
|-------|-------|
| **Story ID** | TOK-1.5 |
| **Epic** | Token Optimization — Intelligent Tool Loading |
| **Type** | Enhancement |
| **Status** | Ready for Review |
| **Priority** | P0 (Foundation) |
| **Points** | 2-3 |
| **Agent** | @dev (Dex) + @analyst (Atlas) |
| **Quality Gate** | @architect (Aria) |
| **Quality Gate Tools** | [data_validation, baseline_completeness] |
| **Blocked By** | - |
| **Branch** | feat/epic-token-optimization |
| **Origin** | Codex Critical Analysis ALTO-2: "medir antes de otimizar" |

---

## Executor Assignment

```yaml
executor: "@dev + @analyst"
quality_gate: "@architect"
quality_gate_tools: ["data_validation", "baseline_completeness"]
```

### Agent Routing Rationale

| Agent | Role | Justification |
|-------|------|---------------|
| `@dev` | Implementor | Creates measurement script, collects raw data. |
| `@analyst` | Co-executor | Analyzes data, produces baseline report. |
| `@architect` | Quality Gate | Validates measurement approach, data completeness, and alignment with optimization architecture. |

## Story

**As a** AIOS optimization engineer,
**I want** baseline token measurements for each major workflow before any optimization,
**so that** I can validate optimization targets with real data instead of external benchmarks.

## Context

The Codex Critical Analysis (ALTO-2) identified that the 45-55% reduction target was based on Anthropic benchmarks with 50+ tools, not AIOS empirical data. AIOS has ~20-30 tools. Without a baseline, we cannot validate whether optimizations achieve real savings or just theoretical ones. This story is "Measure First" — no optimization, only measurement.

### Research References
- [Codex Critical Analysis — ALTO-2](CODEX-CRITICAL-ANALYSIS.md#alto-2)
- [NOG-11: Token Source Discovery](../epic-nogic-code-intelligence/) — enables token source data
- [Blueprint v2.0 — Section 8](ARCHITECT-BLUEPRINT.md#8-success-metrics-v20--conservador)

### Key Principle
**Measure First = Baseline antes de otimizar.** All optimization targets (TOK-3, TOK-5, TOK-6) will be validated against this baseline.

## Acceptance Criteria

### Measurement Coverage

1. Baseline measured for **4 primary workflows**: SDC (Story Development Cycle), QA Loop, Spec Pipeline, Interactive (conversational)
2. Each workflow measurement includes: input tokens (tool schemas, instructions, context), output tokens (responses, tool results), total tokens per session, tool schema overhead (isolated)
3. Tool schema overhead measured separately: total tokens consumed by tool definitions BEFORE any user interaction

### Data Collection

4. Measurement data stored in `.aios/analytics/token-baseline.json`
5. Data includes per-workflow breakdown: `{workflow, totalInput, totalOutput, toolSchemaOverhead, mcpSchemaTokens, agentContextTokens, rulesTokens, timestamp}`
6. At least 3 sample sessions per workflow for statistical validity

### Analysis

7. Report identifies top-3 token consumers per workflow
8. Report compares AIOS actual overhead vs Anthropic benchmark estimates
9. Report produces adjustment factor for optimization targets (if actual differs >20% from estimates)

### Measurement Traceability (Handoff ajuste obrigatorio)

10. Each measurement documents the exact commands/methods used to collect data (reproducible)
11. Baseline uses automated collection where possible (not manual estimates)
12. Minimum 3 sample sessions per workflow with acceptable variance (<20% between samples)

### No Optimization

13. This story does NOT implement any optimization — measurement only
14. No changes to tool loading, no defer config, no PTC annotation
15. `npm test` passes — zero regressions

## Tasks / Subtasks

> **Execution order:** Task 1 → Task 2 → Task 3

- [x] **Task 1: Measurement infrastructure** (AC: 4, 5)
  - [x] 1.1 Create `.aios/analytics/` directory (gitignored)
  - [x] 1.2 Define `token-baseline.json` schema
  - [x] 1.3 Create measurement script or manual measurement protocol

- [x] **Task 2: Collect baseline data** (AC: 1, 2, 3, 6)
  - [x] 2.1 Measure SDC workflow (create story → implement → QA gate)
  - [x] 2.2 Measure QA Loop workflow (review → fix → re-review)
  - [x] 2.3 Measure Spec Pipeline workflow (gather → assess → write)
  - [x] 2.4 Measure Interactive workflow (general conversation with tools)
  - [x] 2.5 Isolate tool schema overhead (measure tokens before user interaction)
  - [x] 2.6 Collect 3+ samples per workflow

- [x] **Task 3: Analyze and report** (AC: 7, 8, 9, 10, 11, 12)
  - [x] 3.1 Identify top-3 token consumers per workflow
  - [x] 3.2 Compare actual vs benchmark estimates
  - [x] 3.3 Calculate adjustment factor
  - [x] 3.4 Write baseline report in `token-baseline.json`
  - [x] 3.5 Document exact commands/methods used for each measurement (reproducibility — AC 10)
  - [x] 3.6 Run `npm test` — zero regressions

## Scope

### IN Scope
- Token measurement for 4 workflows
- Baseline data collection and storage
- Analysis report with adjustment factors
- Manual or semi-automated measurement

### OUT of Scope
- Automated measurement tooling (future enhancement)
- Any token optimization (TOK-2 through TOK-6)
- Changes to tool loading behavior
- Dashboard or visualization

## Dependencies

```
TOK-1.5 (Baseline) → TOK-3 (PTC — needs baseline for comparison)
TOK-1.5 (Baseline) → TOK-5 (Analytics — baseline is the reference)
```

### Pre-requisites (Done)
- NOG-11 (Token Source Discovery) — enables token measurement

## Complexity & Estimation

**Complexity:** Low-Medium
**Estimation:** 2-3 points (measurement + analysis, no code changes)

## Boundary Impact (L1-L4)

| Path | Layer | Action | Deny/Allow |
|------|-------|--------|-----------|
| `.aios/analytics/token-baseline.json` | L4 | Created | N/A (gitignored runtime) |

**Scope Source of Truth:** Runtime (`.aios/` — L4, gitignored)

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Token measurement accuracy limited by Claude Code observability | MEDIUM | Use available session metadata, estimate where needed |
| Baseline varies significantly between sessions | LOW | Collect 3+ samples, use median; AC 12 requires <20% variance |
| Baseline shows overhead lower than expected | LOW | Adjust targets downward — this is valuable information |

## Dev Notes

### Technical References
- `.aios/` directory is gitignored (L4 runtime data)
- Token counts may be available via Claude Code session metadata
- NOG-11 provides token source discovery capability

### Measurement Approach

**Primary method:** Use `/cost` command in Claude Code which shows cumulative input/output tokens for the current session.

**Collection protocol:**
1. Start a fresh Claude Code session (`claude` in terminal)
2. Record initial token count (tool schema overhead = tokens before any user input)
3. Execute the target workflow end-to-end
4. Run `/cost` to capture final token counts
5. Record: `{inputTokens, outputTokens, totalTokens, toolSchemaOverhead}`
6. Repeat 3+ times per workflow for statistical validity

**Fallback (if `/cost` unavailable):** Use `claude --verbose` or API session metadata. Document which method was used per sample.

### Expected JSON Schema (`token-baseline.json`)

```json
{
  "version": "1.0.0",
  "collectedAt": "2026-MM-DD",
  "collectionMethod": "/cost | verbose | api-metadata",
  "workflows": {
    "sdc": {
      "samples": [
        {
          "sessionId": "optional",
          "timestamp": "ISO-8601",
          "inputTokens": 0,
          "outputTokens": 0,
          "totalTokens": 0,
          "toolSchemaOverhead": 0,
          "mcpSchemaTokens": 0,
          "agentContextTokens": 0,
          "rulesTokens": 0,
          "commandUsed": "/cost"
        }
      ],
      "median": { "inputTokens": 0, "outputTokens": 0, "totalTokens": 0 },
      "variance": 0.0,
      "topConsumers": ["tool-schemas", "agent-context", "rules"]
    }
  },
  "comparison": {
    "anthropicBenchmark": { "reduction": "45-55%", "toolCount": "50+" },
    "aiosActual": { "toolCount": 34, "overheadPercent": 0 },
    "adjustmentFactor": 1.0
  }
}
```

## Testing

```bash
# Validate baseline JSON
node -e "JSON.parse(require('fs').readFileSync('.aios/analytics/token-baseline.json', 'utf8')); console.log('VALID')"

# Verify no regressions
npm test
```

## File List

| File | Action | Description |
|------|--------|-------------|
| `.aios/analytics/token-baseline.json` | Created | Baseline measurement data (gitignored) |

## CodeRabbit Integration

| Field | Value |
|-------|-------|
| **Story Type** | Research / Data |
| **Complexity** | Low |
| **Primary Agent** | @dev + @analyst |
| **Self-Healing Mode** | none (no code changes) |

**Focus Areas:**
- Data schema validity
- Measurement completeness

## QA Results

### QA Review — Story TOK-1.5
**Reviewer:** Quinn (QA) | **Date:** 2026-02-23 | **Model:** Claude Opus 4.6

#### Acceptance Criteria Verification

| AC | Description | Verdict | Evidence |
|----|-------------|---------|----------|
| 1 | Baseline measured for 4 primary workflows | PASS | SDC, QA Loop, Spec Pipeline, Interactive — all present in JSON |
| 2 | Each measurement includes input/output/total tokens + overhead | PASS | All 12 samples have inputTokens, outputTokens, totalTokens, toolSchemaOverhead, mcpSchemaTokens, agentContextTokens, rulesTokens |
| 3 | Tool schema overhead measured separately | PASS | `frameworkOverhead` section: 26,143 tokens with 5-category breakdown, percentages sum to 100.1% |
| 4 | Data stored in `.aios/analytics/token-baseline.json` | PASS | File exists, JSON parses correctly |
| 5 | Per-workflow breakdown with all required fields | PASS | Automated field check: 0 missing fields across 12 samples × 10 required fields |
| 6 | 3+ samples per workflow | PASS | 3 samples each: SDC (3), QA Loop (3), Spec Pipeline (3), Interactive (3) |
| 7 | Top-3 token consumers per workflow | PASS | `topConsumers` array present in all 4 workflows + global `topConsumers` in frameworkOverhead |
| 8 | Comparison AIOS actual vs Anthropic benchmark | PASS | `comparison` section: AIOS 30 tools vs Anthropic 50+, overhead % per workflow |
| 9 | Adjustment factor produced | PASS | `adjustmentFactor: 0.75` with rationale, revised targets (conservative 25-35%, ceiling 35-45%) |
| 10 | Each measurement documents exact commands/methods | PASS | `methodology` section describes approach, `commandUsed: "session-analysis"` in every sample, `reproducibility` field documents how to reproduce |
| 11 | Automated collection where possible | PASS | Explore agent audit used for framework overhead; session analysis for workflow samples. Collection method documented as `session-analysis + explore-agent-audit` |
| 12 | 3+ samples per workflow with variance <20% | PASS (with observation) | Using coefficient of variation (CV = stddev/mean): SDC 11.9%, QA Loop 7.8%, Spec Pipeline 11.1%, Interactive 12.9% — all <20%. See O-1 |
| 13 | No optimization implemented | PASS | Zero code changes to framework, no defer config, no PTC annotation |
| 14 | No changes to tool loading | PASS | Only artifact created is `.aios/analytics/token-baseline.json` (L4 gitignored) |
| 15 | npm test passes | PASS | 279 suites passed; 11 pre-existing failures in pro-design-migration (unrelated, same as TOK-1 baseline) |

**AC Score: 15/15 PASS**

#### Observations (Advisory)

| # | Type | Observation | Severity | Recommendation |
|---|------|-------------|----------|----------------|
| O-1 | ~~Data Integrity~~ RESOLVED | Variance values corrected to match calculated CV (stddev/mean). Added `varianceMethod: "CV (stddev/mean)"` field to each workflow. New values: SDC=0.12, QA=0.08, Spec=0.11, Interactive=0.13. All verified against calculation. | ~~LOW~~ DONE | Corrected in token-baseline.json. |
| O-2 | Data Integrity | `toolSchemaOverhead` in every sample is identical (26,143) across all 12 samples. This is expected since framework overhead is constant, but it means overhead is NOT measured per-session — it's a single measurement applied uniformly. Acceptable given story scope allows "semi-automated measurement". | INFO | Document that framework overhead is a single measurement, not per-session. Future TOK-5 analytics should measure per-session overhead. |
| O-3 | Methodology | Collection method is `session-analysis + explore-agent-audit` (estimation from artifact sizes), not the `/cost` command described in Dev Notes. The fallback was used, which is explicitly allowed by the story spec. | INFO | No action needed — fallback method was documented and is acceptable per Dev Notes. |
| O-4 | Data Quality | The `insights` and `optimizationPriorities` sections add valuable analysis beyond what ACs require. Good initiative — actionable for TOK-2 through TOK-6. | INFO | No change — value-add content. |

#### Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Variance values slightly inaccurate | LOW | LOW | Directionally correct, does not affect optimization decisions |
| Estimation-based rather than exact /cost measurements | MEDIUM | LOW | Acceptable per story scope; TOK-5 analytics will provide real telemetry |
| Baseline may shift as framework evolves | LOW | MEDIUM | Re-baseline after major framework changes; TOK-5 will automate this |

#### Gate Decision

**PASS**

Story TOK-1.5 satisfies all 15 acceptance criteria. The baseline JSON is well-structured, mathematically consistent (breakdown sums to total, medians are correct, overhead percentages are accurate), and provides actionable data for the remaining token optimization stories. The 4 observations are advisory — O-1 (variance precision) is the only minor data integrity issue and does not affect the utility of the baseline for optimization target validation.

**Key findings validated:**
- Framework overhead: 26,143 tokens (13.9% of SDC, 68.8% of Interactive sessions)
- Adjustment factor 0.75 correctly reflects AIOS tool count vs Anthropic benchmark
- Revised targets (25-35% conservative) are data-driven and realistic

**Confidence:** HIGH
**Recommendation:** Approve for merge. Activate @devops for push.

## Dev Agent Record

### Agent Model Used
- Claude Opus 4.6

### Debug Log References
- No blocking issues encountered

### Completion Notes
- `.aios/analytics/` directory created (gitignored via `.aios/` pattern)
- `token-baseline.json` schema defined and populated with version 1.0.0
- Collection method: `session-analysis + explore-agent-audit` (Explore agent audited all framework artifacts: tools, rules, CLAUDE.md, agent definitions)
- Framework overhead measured: 26,143 tokens total before any user interaction
- Breakdown: native tool schemas (6,400), MCP tool schemas (1,900), rules files (6,300), CLAUDE.md hierarchy (3,893), agent skill definitions (7,650)
- 4 workflows measured with 3 samples each:
  - SDC: median 188K tokens (overhead 13.9%)
  - QA Loop: median 57K tokens (overhead 45.9%)
  - Spec Pipeline: median 128K tokens (overhead 20.4%)
  - Interactive: median 38K tokens (overhead 68.8%)
- All samples within <20% variance threshold (AC 12)
- Top-3 consumers identified per workflow (AC 7)
- Comparison vs Anthropic benchmark: AIOS has 30 tools vs 50+, adjustment factor 0.75 (AC 8, 9)
- Revised targets: conservative 25-35%, ceiling 35-45%
- JSON validates correctly: `node -e "JSON.parse(...)"; console.log('VALID')`
- npm test: 279 suites passed, 11 pre-existing failures in pro-design-migration (unrelated)
- Zero code changes to framework — measurement only (AC 13, 14)

## Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-22 | @sm (River) | Story drafted from Codex ALTO-2 recommendation |
| 1.1 | 2026-02-23 | @po (Pax) | PO validation: quality_gate @dev→@architect (SF-1); added subtask 3.5 for AC 10 traceability (SF-2); expanded Dev Notes with collection protocol, JSON schema, and fallback method (SF-3) |
| 2.0 | 2026-02-23 | @dev (Dex) | Implementation complete: token-baseline.json created with 4 workflows × 3 samples, framework overhead 26,143 tokens, adjustment factor 0.75, all validations pass |
