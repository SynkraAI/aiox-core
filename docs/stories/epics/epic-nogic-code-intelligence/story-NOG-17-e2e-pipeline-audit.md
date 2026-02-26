# Story NOG-17: E2E Pipeline Audit — What Matters vs What Doesn't

## Metadata

| Field | Value |
|-------|-------|
| **Story ID** | NOG-17 |
| **Epic** | NOGIC — Code Intelligence Integration |
| **Type** | Technical Audit + E2E Test Suite |
| **Status** | Done |
| **Priority** | P1 |
| **Points** | 5 |
| **Agent** | @dev (Dex) — primary + @qa (Quinn) — validation |
| **Quality Gate** | @qa (Quinn) |
| **Blocked By** | None (all Wave 6 stories complete) |
| **Branch** | `feat/epic-nogic-code-intelligence` |

---

## Story

As a **framework developer**, I want a comprehensive E2E audit of the full activation pipeline (UAP + SYNAPSE + Session + Git Detection) with real multi-prompt simulations, so that I have objective data on what actually impacts development context quality vs what is cosmetic overhead, and can make evidence-based decisions about where to invest optimization effort.

---

## Problem Statement

Wave 6 (NOG-10 to NOG-14) implemented improvements based on NOG-9 research findings. The `wave6-journey.js` benchmark captured snapshots after each story, but the analysis revealed critical gaps:

### What We Don't Know

1. **gitConfig `.git/HEAD` read IS implemented** but journey data shows 35-131ms — is the fast path actually being used, or falling back to execSync?
2. **Bracket transitions**: `updateSession()` was wired (NOG-10 QW-1) but all journey snapshots show `promptCount=0, lastBracket="unknown"` — no proof transitions work during real sessions
3. **Token estimation**: 1.2x multiplier applied (NOG-10 QW-3) but accuracy never measured against real Claude API usage data
4. **projectStatus timeouts**: Still ~60% partial quality — is this fixable or inherent to `git status` latency?
5. **SYNAPSE pipeline p50 doubled**: 0.34ms → 0.77ms between baseline and NOG-13 — regression or I/O noise?
6. **What actually reaches the LLM context?** How many tokens do SYNAPSE rules contribute? Is the overhead worth it?

### What We Need

A single test suite that:
- Simulates real agent sessions (10+ prompts, bracket transitions)
- Measures every stage with sub-millisecond precision
- Isolates each component's contribution to context quality
- Classifies each feature as ESSENTIAL / USEFUL / COSMETIC / OVERHEAD
- Produces a definitive "keep / optimize / remove" recommendation

---

## Acceptance Criteria

### AC1: E2E Agent Activation Audit (All 10 Agents)

- [ ] Test activates all 10 agents: dev, qa, architect, pm, po, sm, devops, analyst, data-engineer, ux-design-expert
- [ ] Each activation is measured: total duration, per-loader timing, quality rating
- [ ] Results compared against performance targets (warm p50 <150ms, cold p95 <250ms)
- [ ] Identifies which agents consistently get `partial` quality and why
- [ ] **Rollback:** Test-only — no production code changes
- [ ] **Observability:** Results in `docs/qa/NOG-17-pipeline-audit-report.md`

### AC2: Multi-Prompt Session Simulation

- [ ] Simulates 15-prompt sessions for at least 3 agents (dev, qa, architect)
- [ ] After each simulated prompt: calls `updateSession()` with incremented prompt_count
- [ ] Verifies bracket transitions: FRESH (prompts 0-3) → MODERATE (4-8) → DEPLETED (9-12) → CRITICAL (13+)
- [ ] Captures `estimateContextPercent()` output at each stage
- [ ] Verifies layer activation changes per bracket (FRESH loads [0,1,2,7], MODERATE loads all)
- [ ] Measures token budget allocation per bracket (FRESH=800, MODERATE=1500, DEPLETED=2000, CRITICAL=2500)
- [ ] **Key question answered:** Do bracket transitions actually change what rules are injected?

### AC3: Git Detection Deep Diagnostic

- [ ] Runs git detection 100 times in rapid succession
- [ ] Measures: direct `.git/HEAD` file read latency (expected <1ms)
- [ ] Measures: execSync fallback latency (expected ~50ms)
- [ ] Determines which code path is actually executing (add diagnostic logging)
- [ ] Tests cache hit ratio (5-minute TTL)
- [ ] Tests worktree scenario (if applicable)
- [ ] **Key question answered:** Why does journey show 35-131ms if `.git/HEAD` read is implemented?

### AC4: SYNAPSE Rule Impact Analysis

- [ ] For each of the 8 layers (L0-L7), measure:
  - Number of rules injected
  - Total tokens contributed (chars/4 estimate + 1.2x multiplier)
  - Time to process
- [ ] For each rule category, classify as:
  - **ESSENTIAL**: Directly impacts code quality, prevents errors, enforces architecture
  - **USEFUL**: Improves developer experience but optional
  - **COSMETIC**: Formatting, greetings, persona — no impact on code output
  - **OVERHEAD**: Processing cost without proportional benefit
- [ ] Produce a token budget breakdown: "Of 70 rules (X tokens), Y% is ESSENTIAL, Z% is COSMETIC"
- [ ] **Key question answered:** What percentage of SYNAPSE context budget goes to things that actually improve code vs persona/greeting fluff?

### AC5: projectStatus Timeout Root Cause

- [ ] Run `projectStatus` loader 50 times, measure each duration
- [ ] Identify: what commands does projectStatus run internally? (`git status`? `git log`? file reads?)
- [ ] Measure each sub-command separately
- [ ] Determine: is the 20ms timeout reasonable? What timeout eliminates 95% of failures?
- [ ] Test with `core.fsmonitor` enabled vs disabled (if available)
- [ ] **Key question answered:** Can we fix projectStatus reliability, or should we restructure it?

### AC6: Token Estimation vs Reality

- [ ] Read `.synapse/sessions/` for any existing sessions with real prompt_count > 0
- [ ] Compare `estimateContextPercent()` prediction vs actual session progression
- [ ] If JSONL transcripts available (from Claude Code usage): extract real `message.usage` tokens
- [ ] Calculate accuracy: estimated tokens vs real tokens (if data available)
- [ ] **Key question answered:** How accurate is `chars/4 * 1.2` for token estimation?

### AC7: Classification Report — Essential vs Cosmetic

- [ ] Produce a definitive classification of every UAP + SYNAPSE feature:

| Feature | Category | Tokens | Time (ms) | Verdict |
|---------|----------|--------|-----------|---------|
| Constitution rules (L0) | ? | ? | ? | KEEP/OPTIMIZE/REMOVE |
| Global rules (L1) | ? | ? | ? | KEEP/OPTIMIZE/REMOVE |
| Agent persona rules (L2) | ? | ? | ? | KEEP/OPTIMIZE/REMOVE |
| Greeting builder | ? | ? | ? | KEEP/OPTIMIZE/REMOVE |
| ProjectStatus loader | ? | ? | ? | KEEP/OPTIMIZE/REMOVE |
| Git config detection | ? | ? | ? | KEEP/OPTIMIZE/REMOVE |
| Session bracket system | ? | ? | ? | KEEP/OPTIMIZE/REMOVE |
| Token estimation | ? | ? | ? | KEEP/OPTIMIZE/REMOVE |
| Memory hints (DEPLETED+) | ? | ? | ? | KEEP/OPTIMIZE/REMOVE |
| Handoff warning (CRITICAL) | ? | ? | ? | KEEP/OPTIMIZE/REMOVE |
| SYNAPSE diagnostics | ? | ? | ? | KEEP/OPTIMIZE/REMOVE |
| Code-intel bridge check | ? | ? | ? | KEEP/OPTIMIZE/REMOVE |

- [ ] For each "REMOVE" recommendation: estimate tokens saved and latency saved
- [ ] For each "OPTIMIZE" recommendation: describe specific optimization and expected gain
- [ ] **Key question answered:** If we stripped everything non-essential, how much faster/leaner would activation be?

---

## Scope

### IN Scope
- E2E test script for all 10 agents
- Multi-prompt session simulator
- Git detection diagnostic
- SYNAPSE rule impact analysis (token counting per layer)
- projectStatus root cause analysis
- Token estimation accuracy check
- Classification report (essential vs cosmetic)
- All results in a markdown report

### OUT of Scope
- Implementing any fixes (this story produces data, not code changes)
- Changes to production code (except temporary diagnostic logging, removed after)
- Performance optimization (separate stories based on findings)
- Pro/Memory module testing (feature-gated, not available)

---

## Tasks/Subtasks

- [x] 1. Create E2E audit test script
  - [x] 1.1 Create `tests/synapse/e2e/pipeline-audit.e2e.js` (or `.js` script)
  - [x] 1.2 Implement agent activation loop (all 10 agents, 3 runs each)
  - [x] 1.3 Implement multi-prompt session simulator (15 prompts, 3 agents)
  - [x] 1.4 Implement git detection diagnostic (100 iterations with path logging)
  - [x] 1.5 Implement SYNAPSE rule token counter (per-layer token measurement)
  - [x] 1.6 Implement projectStatus isolated benchmark (50 runs)
- [x] 2. Run full audit
  - [x] 2.1 Execute all tests, capture raw data
  - [x] 2.2 Validate bracket transitions work (FRESH → MODERATE → DEPLETED → CRITICAL)
  - [x] 2.3 Validate git detection path (direct read vs execSync fallback)
  - [x] 2.4 Collect per-layer token counts
  - [x] 2.5 Collect projectStatus sub-command timings
- [x] 3. Analyze and classify
  - [x] 3.1 Classify each feature: ESSENTIAL / USEFUL / COSMETIC / OVERHEAD
  - [x] 3.2 Calculate "lean activation" scenario (only ESSENTIAL features)
  - [x] 3.3 Calculate token savings from removing COSMETIC rules
  - [x] 3.4 Identify top-3 optimization targets by impact
- [x] 4. Write audit report
  - [x] 4.1 Create `docs/qa/NOG-17-pipeline-audit-report.md`
  - [x] 4.2 Include all tables, measurements, classifications
  - [x] 4.3 Include recommendations (stories needed for fixes)
  - [x] 4.4 Include "before/after" projections for each recommendation
- [x] 5. @qa validation
  - [x] 5.1 Verify test methodology is sound
  - [x] 5.2 Verify classifications are justified by data
  - [x] 5.3 Validate recommendations are actionable

---

## Testing

### Test Execution
```bash
# Full audit (recommended: run when system is idle for consistent results)
node tests/synapse/e2e/pipeline-audit.e2e.js --full

# Quick audit (agents only, no multi-prompt simulation)
node tests/synapse/e2e/pipeline-audit.e2e.js --quick

# Single component
node tests/synapse/e2e/pipeline-audit.e2e.js --git-only
node tests/synapse/e2e/pipeline-audit.e2e.js --synapse-only
node tests/synapse/e2e/pipeline-audit.e2e.js --session-only
```

### Expected Outputs
- Raw data: `.synapse/metrics/audit/NOG-17-raw.json`
- Report: `docs/qa/NOG-17-pipeline-audit-report.md`
- Git diagnostic: `.synapse/metrics/audit/git-diagnostic.json`

### Regression
- No production code changes = no regression risk
- Existing tests must continue passing: `npm test`

---

## CodeRabbit Integration

> **Minimal code changes — audit script only.** CodeRabbit review on the test script itself (quality, coverage, methodology).

---

## Dev Notes

### File List

| File | Action | Notes |
|------|--------|-------|
| `tests/synapse/e2e/pipeline-audit.e2e.js` | CREATE | Main audit script (~600 lines, 6 audit modules + classifier + report generator) |
| `docs/qa/NOG-17-pipeline-audit-report.md` | CREATE | Audit report with 8 sections, all tables, classifications, recommendations |
| `.synapse/metrics/audit/NOG-17-raw.json` | CREATE | Raw audit data (JSON, gitignored) |

### Key References

- **Journey snapshots:** `.synapse/metrics/journey/` (baseline, NOG-10 through NOG-13)
- **NOG-9 Research:** `docs/stories/epics/epic-nogic-code-intelligence/story-NOG-9-uap-synapse-research.md`
- **UAP Pipeline:** `.aios-core/development/scripts/unified-activation-pipeline.js` (814 lines)
- **Git Config Detector:** `.aios-core/infrastructure/scripts/git-config-detector.js` (352 lines, has .git/HEAD read at line 151-185)
- **Session Manager:** `.aios-core/core/synapse/session/session-manager.js` (405 lines)
- **Context Tracker:** `.aios-core/core/synapse/context/context-tracker.js` (199 lines)
- **Pipeline Benchmark:** `tests/synapse/benchmarks/pipeline-benchmark.js` (317 lines)
- **Wave6 Journey:** `tests/synapse/benchmarks/wave6-journey.js` (515 lines)
- **Existing E2E tests:** `tests/synapse/e2e/` (6 files, 47.2 KB)

### Critical Investigation Points

1. **git-config-detector.js:151-185** — The `.git/HEAD` direct read IS implemented. The audit must determine if UAP actually calls this fast path or if something forces the execSync fallback.

2. **unified-activation-pipeline.js** — Check how `gitConfig` loader invokes the detector. Is it using the cached/direct path or spawning a new detector each time?

3. **context-tracker.js:estimateContextPercent()** — The formula `promptCount * 1500 * 1.2 / maxContext` uses a FIXED 1500 tokens/prompt. NOG-11 designed a way to get real data but it was never implemented. How far off is 1500 from reality?

4. **session-manager.js:updateSession()** — NOG-10 QW-1 wired this in the hook. But does the hook actually run during journey benchmarks? The journey script may bypass the hook entirely.

### Audit Philosophy

**Classification criteria:**

| Category | Definition | Example |
|----------|-----------|---------|
| **ESSENTIAL** | Without this, the agent produces incorrect or dangerous code. Constitutional rules, git detection for branch awareness. | L0 constitution, agent authority |
| **USEFUL** | Improves output quality measurably. Bracket system, coding standards injection. | L1 global rules, token estimation |
| **COSMETIC** | Only affects greeting/persona presentation. Zero impact on code quality. | Greeting builder, persona vocabulary, emoji frequency |
| **OVERHEAD** | Consumes resources without proportional value. Always times out, rarely used. | projectStatus (if always timeout), unused layers |

**Key metric for classification:** "If I remove this, does the AI write worse code?"

### Dev Agent Record

### Agent Model Used
Claude Opus 4.6 (claude-opus-4-6)

### Completion Notes
- Script created: `tests/synapse/e2e/pipeline-audit.e2e.js` with 6 audit modules covering all 7 ACs
- Full audit executed successfully on all 10 agents (3 runs each)
- Key findings:
  - **Git detection bottleneck confirmed:** `.git/HEAD` direct read = 0.029ms, but `detect()` = 35-71ms due to `_isGitRepository()` execSync
  - **projectStatus impossible at 20ms:** `git status --porcelain` alone takes 56ms (p50). Total ~164ms
  - **Bracket transitions work correctly:** FRESH→MODERATE(prompt 5)→DEPLETED(7)→CRITICAL(9) with 20k context
  - **Default 200k context stays FRESH for 100+ prompts** — this is by design (0.9% per prompt)
  - **SYNAPSE very efficient:** 70 rules, ~1169 tokens, <2ms processing
  - **85% of SYNAPSE tokens are ESSENTIAL** (constitution + global rules)
  - **Only 1 feature classified as OVERHEAD:** projectStatus (164ms, always times out at 20ms budget)
  - **Top 3 optimization targets:** (1) Git _isGitRepository → use .git existence check, (2) projectStatus restructure, (3) Review FRESH bracket layers
- 9 pre-existing test failures (wizard-validation-flow timeout, etc.) — not caused by NOG-17

### Debug Log References
- Raw audit data: `.synapse/metrics/audit/NOG-17-raw.json`
- Audit report: `docs/qa/NOG-17-pipeline-audit-report.md`

---

## QA Results

### QA Review — @qa (Quinn) | 2026-02-22

**Verdict: PASS**

> Initial review identified 3 concerns. All 3 were fixed in-session before gate decision.

#### Methodology Assessment

| Aspect | Rating | Notes |
|--------|--------|-------|
| Sample sizes | Good | 3 runs/agent (AC1), 100 git iterations (AC3), 20 execSync samples, 50 projectStatus runs (AC5) |
| Timing precision | Excellent | `process.hrtime.bigint()` provides sub-ms accuracy |
| Test isolation | Good | TTL=0 for git cache bypass, separate engines per module |
| Reproducibility | Good | CLI flags (`--full`, `--quick`, `--git-only`, etc.) allow targeted re-runs |
| Error handling | Good | BigInt-safe JSON serializer, graceful UAP import fallback |

#### AC Traceability

| AC | Status | Coverage | Notes |
|----|--------|----------|-------|
| AC1: Agent Activation | PASS | All 10 agents, 3 runs each, p50/p95/quality/slowest loader | Dev p50=195ms (first-run penalty). 9/10 agents meet targets. |
| AC2: Session Simulation | PASS | 3 agents, 15 prompts, dual-context (200k + 20k) | Bracket transitions verified: FRESH→MODERATE(p5)→DEPLETED(p7)→CRITICAL(p9) |
| AC3: Git Detection | PASS | 5 methods, 100+ iterations, bottleneck isolated | Root cause: `_isGitRepository()` execSync = 16.9ms vs .git/HEAD = 0.053ms |
| AC4: SYNAPSE Rules | PASS | 4 brackets with calibrated prompt_counts | Bracket filter verified: FRESH=4/8 layers active, MODERATE+=8/8. Layers 3-6 have no content (no active workflow/task/squad) — correctly documented. |
| AC5: projectStatus | PASS | 6 git commands individually timed, timeout coverage | 164ms total p50. 20ms impossible. `git status --porcelain` = 56ms slowest. |
| AC6: Token Estimation | PASS | 5 content types, ratio ~3.95 consistent | No real API data (acknowledged limitation). |
| AC7: Classification | PASS | 12 features classified with evidence | Bracket system correctly classified as KEEP (uses smallTransitions + per-bracket layer diff). |

#### Issues Found and Resolved In-Session

**Issue #1 (FIXED): AC4 bracket prompt_counts not calibrated for 200k context**

Original audit used `prompt_count: 6, 10, 14` for MODERATE/DEPLETED/CRITICAL. With 200k default context, these all remained FRESH (94.6%, 91.0%, 87.4%).

**Fix applied:** Calibrated to `prompt_count: 0/50/75/90` which correctly produce FRESH(100%)/MODERATE(55%)/DEPLETED(32.5%)/CRITICAL(19%). Verification step added to confirm each calibration.

**Result:** Report now shows `Layers Active: 4/8` for FRESH vs `8/8` for MODERATE+. Bracket filter confirmed working.

**Issue #2 (FIXED): Report didn't distinguish "bracket-filter skip" vs "no-content skip"**

Original report showed all layers as "skipped" without explaining why. FRESH skipping L3-L6 (bracket filter) looked identical to MODERATE skipping L3-L6 (no session context).

**Fix applied:** Added `bracketActive`, `skipReason` fields to per-layer analysis. Report now shows `bracket-filter` vs `no-content` for each skipped layer, with explanatory note.

**Result:** FRESH clearly shows L3-L6 as `bracket-filter`, MODERATE shows them as `no-content` (bracket allows, but no workflow/task/squad active). L7 star-command shows `no-content` in both (no *command in prompt).

**Issue #3 (FIXED): AC7 bracket system verdict "OPTIMIZE" was misleading**

Classification used `devTransitions > 1` (default 200k, always 1 transition) resulting in "OPTIMIZE" + "need investigation".

**Fix applied:** Now uses `smallTransitions >= 4` (20k-context proves bracket math works) AND checks if SYNAPSE layers actually differ per bracket (`FRESH.layersLoaded !== MODERATE.layersLoaded`).

**Result:** Bracket system correctly classified as KEEP with accurate rationale.

#### Data Quality Assessment

| Metric | Quality | Notes |
|--------|---------|-------|
| Agent activation timings | HIGH | 3 runs per agent, consistent patterns |
| Git detection | HIGH | 100 direct read iterations, 20 execSync — clear bottleneck |
| projectStatus | HIGH | Individual command timing isolates root cause |
| Token estimation | MEDIUM | Synthetic samples only — no real Claude API usage data (documented limitation) |
| SYNAPSE per-bracket | HIGH | Calibrated prompt_counts verified, bracket-filter vs no-content distinguished |
| Classification rationales | HIGH | Evidence-based, all 13 validated |

#### Classification Validation

| Feature | Audit Category | QA Assessment | Agree? |
|---------|---------------|---------------|--------|
| Constitution (L0) | ESSENTIAL | ESSENTIAL | Yes — NON-NEGOTIABLE rules |
| Global (L1) | ESSENTIAL | ESSENTIAL | Yes — coding standards |
| Agent persona (L2) | USEFUL | USEFUL | Yes — agent-specific context |
| Star-command (L7) | COSMETIC | COSMETIC | Yes — zero code impact |
| Git detection | ESSENTIAL | ESSENTIAL | Yes — branch awareness critical |
| projectStatus | OVERHEAD | OVERHEAD | Yes — 164ms, always timeout at 20ms |
| Session brackets | USEFUL | USEFUL | Yes — correct math, saves tokens in FRESH |
| Token estimation | USEFUL | USEFUL | Yes — zero-cost arithmetic |
| Memory hints | USEFUL | USEFUL | Yes — only when needed |
| Handoff warning | ESSENTIAL | ESSENTIAL | Yes — prevents lost work |
| Greeting builder | COSMETIC | COSMETIC | Yes — UX only |
| SYNAPSE diagnostics | USEFUL | USEFUL | Yes — observability |
| Code-intel bridge | USEFUL | USEFUL | Yes — graceful degradation |

**All 13 classifications validated. Data supports verdicts.**

#### Recommendations Validation

| Recommendation | Actionable? | Expected Impact |
|----------------|------------|-----------------|
| 1. Git `_isGitRepository()` → `.git/HEAD` existence check | Yes | ~34ms saved per activation |
| 2. projectStatus restructure (fewer/async git commands) | Yes | Eliminates timeout, recovers quality=full |
| 3. Review FRESH bracket layers | Partially | Low impact — only 150 tokens cosmetic |

#### Remaining Known Limitations

1. **AC6 Token Estimation:** No real Claude API usage data for accuracy comparison (no JSONL transcripts available). Synthetic samples show consistent 3.95 chars/token ratio.
2. **AC2 SYNAPSE output in session sim:** The SYNAPSE engine output in the session simulation table always reflects 200k-context behavior (FRESH). This is correct real-world behavior — with 200k context, sessions stay FRESH for 40+ prompts.
3. **Layers 3-6 no-content:** These layers require active workflow/task/squad/keyword matches to produce rules. The audit measures infrastructure overhead correctly, but cannot measure rule-production behavior without a live development session.

#### Gate Decision: PASS

The audit delivers comprehensive, evidence-based findings across all 7 ACs. All 3 initial concerns were identified and fixed in-session. Key conclusions validated:

- SYNAPSE is efficient: 70 rules, ~1169-1237 tokens, <2ms
- 85% of tokens are ESSENTIAL (constitution + global)
- Git detection bottleneck confirmed and root cause isolated
- projectStatus is fundamentally too slow for 20ms budget
- Bracket system works correctly (bracket filter + layer configs validated)
- Top 3 optimization targets are actionable with clear expected impact

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-02-21 | @po (Pax) | Story created — Draft. Post-Wave 6 audit based on journey analysis gaps. |
| 2026-02-21 | @po (Pax) | Validated GO (96/100). Status: Draft → Ready. Notes: consider adding explicit Risks section. |
| 2026-02-22 | @dev (Dex) | Tasks 1-4 complete. Audit script created, full audit executed, report generated. Status: Ready → InProgress. Pending: @qa validation (Task 5). |
| 2026-02-22 | @qa (Quinn) | Initial review: 3 concerns identified (AC4 per-bracket, layer skip reasons, bracket verdict logic). |
| 2026-02-22 | @qa (Quinn) + @dev (Dex) | All 3 concerns fixed in-session: calibrated prompt_counts for real brackets, added bracket-filter vs no-content distinction, fixed classification logic. Re-ran full audit. |
| 2026-02-22 | @qa (Quinn) | Task 5 complete. Verdict: PASS. All 7 ACs validated. All 13 classifications confirmed. 3 known limitations documented. |
| 2026-02-23 | @po (Pax) | PO validation GO (97/100). 2 should-fix non-blocking (status label, risks section). Story closed. Status: Ready for Review → Done. |
