# NOG-17: E2E Pipeline Audit Report

**Generated:** 2026-02-22 02:34:37
**Commit:** 9c4a4603
**Branch:** feat/epic-nogic-code-intelligence
**Environment:** Node v22.16.0, win32

---

## Executive Summary

This audit measures every stage of the AIOS activation pipeline (UAP + SYNAPSE + Session + Git Detection)
with sub-millisecond precision, classifying each feature as ESSENTIAL, USEFUL, COSMETIC, or OVERHEAD.

## 1. Agent Activation (All Agents)

| Agent | p50 (ms) | p95 (ms) | Quality | Slowest Loader | Slowest (ms) |
|-------|----------|----------|---------|----------------|-------------|
| dev | 194.6 | 355.6 | partial | permissionMode | 115.7 |
| qa | 92.3 | 101.7 | full | permissionMode | 83.3 |
| architect | 83.5 | 136.8 | full | gitConfig | 91.0 |
| pm | 94.1 | 105.6 | full | permissionMode | 83.3 |
| po | 98.7 | 130.6 | full | permissionMode | 95.0 |
| sm | 89.6 | 160.7 | full | permissionMode | 98.3 |
| devops | 81.3 | 111.6 | full | permissionMode | 80.3 |
| analyst | 88.2 | 92.6 | full | gitConfig | 77.7 |
| data-engineer | 95.7 | 103.2 | full | permissionMode | 83.7 |
| ux-design-expert | 83.5 | 94.6 | full | permissionMode | 77.7 |

**Targets:** warm p50 <150ms, cold p95 <250ms

## 2. Multi-Prompt Session Simulation

> **Note:** With default maxContext=200000 tokens, each prompt uses only ~0.9% of context.
> 15 prompts = ~13.5% used → stays FRESH. This is correct behavior.
> A "small context" (20k) scenario shows bracket transitions working correctly.

### Agent: dev

| Prompt | Bracket (200k) | Context% | Small Bracket (20k) | Small% | Layers | Rules | Tokens | SYNAPSE (ms) |
|--------|---------------|----------|--------------------|---------| ------|-------|--------|-------------|
| 0 | FRESH | 100.0% | FRESH | 100.0% | 0,1,2,7 | 70 | 1169 | 0.95 |
| 1 | FRESH | 99.1% | FRESH | 91.0% | 0,1,2,7 | 70 | 1169 | 0.94 |
| 2 | FRESH | 98.2% | FRESH | 82.0% | 0,1,2,7 | 70 | 1169 | 0.78 |
| 3 | FRESH | 97.3% | FRESH | 73.0% | 0,1,2,7 | 70 | 1169 | 0.72 |
| 4 | FRESH | 96.4% | FRESH | 64.0% | 0,1,2,7 | 70 | 1169 | 0.98 |
| 5 | FRESH | 95.5% | MODERATE | 55.0% | 0,1,2,7 | 70 | 1169 | 0.70 |
| 6 | FRESH | 94.6% | MODERATE | 46.0% | 0,1,2,7 | 70 | 1169 | 0.78 |
| 7 | FRESH | 93.7% | DEPLETED | 37.0% | 0,1,2,7 | 70 | 1169 | 0.60 |
| 8 | FRESH | 92.8% | DEPLETED | 28.0% | 0,1,2,7 | 70 | 1169 | 0.66 |
| 9 | FRESH | 91.9% | CRITICAL | 19.0% | 0,1,2,7 | 70 | 1169 | 0.61 |
| 10 | FRESH | 91.0% | CRITICAL | 10.0% | 0,1,2,7 | 70 | 1169 | 0.61 |
| 11 | FRESH | 90.1% | CRITICAL | 1.0% | 0,1,2,7 | 70 | 1169 | 0.60 |
| 12 | FRESH | 89.2% | CRITICAL | 0.0% | 0,1,2,7 | 70 | 1169 | 0.57 |
| 13 | FRESH | 88.3% | CRITICAL | 0.0% | 0,1,2,7 | 70 | 1169 | 1.07 |
| 14 | FRESH | 87.4% | CRITICAL | 0.0% | 0,1,2,7 | 70 | 1169 | 0.65 |
| 15 | FRESH | 86.5% | CRITICAL | 0.0% | 0,1,2,7 | 70 | 1169 | 0.61 |

**Default (200k) transitions:** prompt 0: START → FRESH
**Small (20k) transitions:** prompt 0: START → FRESH | prompt 5: FRESH → MODERATE | prompt 7: MODERATE → DEPLETED | prompt 9: DEPLETED → CRITICAL

### Agent: qa

| Prompt | Bracket (200k) | Context% | Small Bracket (20k) | Small% | Layers | Rules | Tokens | SYNAPSE (ms) |
|--------|---------------|----------|--------------------|---------| ------|-------|--------|-------------|
| 0 | FRESH | 100.0% | FRESH | 100.0% | 0,1,2,7 | 68 | 1110 | 0.76 |
| 1 | FRESH | 99.1% | FRESH | 91.0% | 0,1,2,7 | 68 | 1110 | 0.54 |
| 2 | FRESH | 98.2% | FRESH | 82.0% | 0,1,2,7 | 68 | 1110 | 0.50 |
| 3 | FRESH | 97.3% | FRESH | 73.0% | 0,1,2,7 | 68 | 1110 | 0.49 |
| 4 | FRESH | 96.4% | FRESH | 64.0% | 0,1,2,7 | 68 | 1110 | 0.55 |
| 5 | FRESH | 95.5% | MODERATE | 55.0% | 0,1,2,7 | 68 | 1110 | 0.54 |
| 6 | FRESH | 94.6% | MODERATE | 46.0% | 0,1,2,7 | 68 | 1110 | 0.52 |
| 7 | FRESH | 93.7% | DEPLETED | 37.0% | 0,1,2,7 | 68 | 1110 | 0.48 |
| 8 | FRESH | 92.8% | DEPLETED | 28.0% | 0,1,2,7 | 68 | 1110 | 0.50 |
| 9 | FRESH | 91.9% | CRITICAL | 19.0% | 0,1,2,7 | 68 | 1110 | 0.50 |
| 10 | FRESH | 91.0% | CRITICAL | 10.0% | 0,1,2,7 | 68 | 1110 | 0.58 |
| 11 | FRESH | 90.1% | CRITICAL | 1.0% | 0,1,2,7 | 68 | 1110 | 0.55 |
| 12 | FRESH | 89.2% | CRITICAL | 0.0% | 0,1,2,7 | 68 | 1110 | 0.98 |
| 13 | FRESH | 88.3% | CRITICAL | 0.0% | 0,1,2,7 | 68 | 1110 | 0.83 |
| 14 | FRESH | 87.4% | CRITICAL | 0.0% | 0,1,2,7 | 68 | 1110 | 0.78 |
| 15 | FRESH | 86.5% | CRITICAL | 0.0% | 0,1,2,7 | 68 | 1110 | 0.64 |

**Default (200k) transitions:** prompt 0: START → FRESH
**Small (20k) transitions:** prompt 0: START → FRESH | prompt 5: FRESH → MODERATE | prompt 7: MODERATE → DEPLETED | prompt 9: DEPLETED → CRITICAL

### Agent: architect

| Prompt | Bracket (200k) | Context% | Small Bracket (20k) | Small% | Layers | Rules | Tokens | SYNAPSE (ms) |
|--------|---------------|----------|--------------------|---------| ------|-------|--------|-------------|
| 0 | FRESH | 100.0% | FRESH | 100.0% | 0,1,2,7 | 68 | 1082 | 8.45 |
| 1 | FRESH | 99.1% | FRESH | 91.0% | 0,1,2,7 | 68 | 1082 | 9.40 |
| 2 | FRESH | 98.2% | FRESH | 82.0% | 0,1,2,7 | 68 | 1082 | 1.11 |
| 3 | FRESH | 97.3% | FRESH | 73.0% | 0,1,2,7 | 68 | 1082 | 1.99 |
| 4 | FRESH | 96.4% | FRESH | 64.0% | 0,1,2,7 | 68 | 1082 | 0.70 |
| 5 | FRESH | 95.5% | MODERATE | 55.0% | 0,1,2,7 | 68 | 1082 | 0.57 |
| 6 | FRESH | 94.6% | MODERATE | 46.0% | 0,1,2,7 | 68 | 1082 | 0.52 |
| 7 | FRESH | 93.7% | DEPLETED | 37.0% | 0,1,2,7 | 68 | 1082 | 0.54 |
| 8 | FRESH | 92.8% | DEPLETED | 28.0% | 0,1,2,7 | 68 | 1082 | 0.84 |
| 9 | FRESH | 91.9% | CRITICAL | 19.0% | 0,1,2,7 | 68 | 1082 | 4.02 |
| 10 | FRESH | 91.0% | CRITICAL | 10.0% | 0,1,2,7 | 68 | 1082 | 2.73 |
| 11 | FRESH | 90.1% | CRITICAL | 1.0% | 0,1,2,7 | 68 | 1082 | 0.98 |
| 12 | FRESH | 89.2% | CRITICAL | 0.0% | 0,1,2,7 | 68 | 1082 | 1.77 |
| 13 | FRESH | 88.3% | CRITICAL | 0.0% | 0,1,2,7 | 68 | 1082 | 0.72 |
| 14 | FRESH | 87.4% | CRITICAL | 0.0% | 0,1,2,7 | 68 | 1082 | 0.62 |
| 15 | FRESH | 86.5% | CRITICAL | 0.0% | 0,1,2,7 | 68 | 1082 | 0.59 |

**Default (200k) transitions:** prompt 0: START → FRESH
**Small (20k) transitions:** prompt 0: START → FRESH | prompt 5: FRESH → MODERATE | prompt 7: MODERATE → DEPLETED | prompt 9: DEPLETED → CRITICAL

## 3. Git Detection Diagnostic

| Method | p50 (ms) | p95 (ms) | p99 (ms) |
|--------|----------|----------|----------|
| .git/HEAD direct read | 0.053 | 0.132 | 0.286 |
| execSync (rev-parse HEAD) | 17.8 | 39.3 | 39.3 |
| _isGitRepository (execSync) | 16.9 | 19.2 | 19.2 |
| Full detect() | 34.2 | 36.9 | 36.9 |
| Cached get() | 0.000 | 0.000 | 0.062 |

**Diagnosis:** BOTTLENECK: _isGitRepository() uses execSync (p50=16.9ms). Direct .git/HEAD read is 0.053ms. Full detect() = 34.2ms. The fast path for branch detection is negated by the slow repo validation.

**Key Finding:** The journey data showing 35-131ms gitConfig times is caused by `_isGitRepository()` calling `execSync('git rev-parse --is-inside-work-tree')` before the fast `.git/HEAD` read. The direct read itself is <1ms.

## 4. SYNAPSE Rule Impact Analysis

| Bracket | Rules | Tokens (est) | Adjusted (*1.2) | Layers Active | Layers Producing | Duration (ms) |
|---------|-------|-------------|----------------|---------------|-----------------|---------------|
| FRESH | 70 | 1169 | 1403 | 4/8 | 3/8 | 1.48 |
| MODERATE | 70 | 1212 | 1455 | 8/8 | 3/8 | 2.17 |
| DEPLETED | 70 | 1212 | 1455 | 8/8 | 3/8 | 1.10 |
| CRITICAL | 70 | 1237 | 1485 | 8/8 | 3/8 | 0.60 |

> **Note:** "Layers Active" = layers the bracket filter allows to execute. "Layers Producing" = layers that returned rules.
> Layers 3-6 (workflow, task, squad, keyword) require active session context (workflow, task, squad, matching keywords) to produce rules.
> In this audit with no active workflow/task/squad, only L0 (constitution), L1 (global), L2 (agent) produce rules regardless of bracket.
> The bracket filter is working correctly: FRESH allows 4 layers (0,1,2,7), MODERATE+ allows all 8.

### Per-Layer Breakdown (MODERATE — all 8 layers attempted)

| Layer | Bracket Active | Status | Rules | Skip Reason | Duration (ms) |
|-------|---------------|--------|-------|-------------|---------------|
| constitution | YES | ok | 34 | - | 0.149 |
| global | YES | ok | 25 | - | 0.152 |
| agent | YES | ok | 11 | - | 0.086 |
| workflow | YES | skipped | 0 | no-content | 0.000 |
| task | YES | skipped | 0 | no-content | 0.000 |
| squad | YES | skipped | 0 | no-content | 0.000 |
| keyword | YES | skipped | 0 | no-content | 0.000 |
| star-command | YES | skipped | 0 | no-content | 0.000 |

### Per-Layer Breakdown (FRESH — 4 layers attempted)

| Layer | Bracket Active | Status | Rules | Skip Reason | Duration (ms) |
|-------|---------------|--------|-------|-------------|---------------|
| constitution | YES | ok | 34 | - | 0.530 |
| global | YES | ok | 25 | - | 0.346 |
| agent | YES | ok | 11 | - | 0.230 |
| workflow | no | skipped | 0 | bracket-filter | 0.000 |
| task | no | skipped | 0 | bracket-filter | 0.000 |
| squad | no | skipped | 0 | bracket-filter | 0.000 |
| keyword | no | skipped | 0 | bracket-filter | 0.000 |
| star-command | YES | skipped | 0 | no-content | 0.000 |

## 5. projectStatus Root Cause Analysis

| Git Command | p50 (ms) | p95 (ms) |
|-------------|----------|----------|
| `git rev-parse --abbrev-ref HEAD` | 17.9 | 19.2 |
| `git status --porcelain` | 56.4 | 71.5 |
| `git log -1 --oneline` | 20.4 | 35.9 |
| `git diff --stat --cached` | 20.9 | 23.1 |
| `git stash list` | 31.9 | 40.4 |
| `git rev-parse --is-inside-work-tree` | 16.8 | 18.4 |

**Slowest:** `git status --porcelain` (p50=56ms)
**Total estimated p50:** 164ms
**fsmonitor:** disabled

### Timeout Coverage Analysis

| Timeout (ms) | Commands Within | Coverage |
|-------------|-----------------|----------|
| 20 | 2/6 | 33% |
| 50 | 5/6 | 83% |
| 100 | 6/6 | 100% |
| 150 | 6/6 | 100% |
| 200 | 6/6 | 100% |
| 300 | 6/6 | 100% |

**Recommendation:** RESTRUCTURE: Total git commands take ~164ms (p50). Slowest: git status --porcelain (56ms). Consider running fewer commands or making them async.

## 6. Token Estimation Accuracy

| Content Type | Chars | Est. Tokens | Adjusted (*1.2) | Chars/Token |
|-------------|-------|-------------|----------------|------------|
| Plain English text | 158 | 40 | 48 | 3.95 |
| JavaScript code | 194 | 49 | 59 | 3.96 |
| XML-heavy (SYNAPSE rules) | 321 | 81 | 98 | 3.96 |
| JSON config | 161 | 41 | 50 | 3.93 |
| Markdown docs | 238 | 60 | 72 | 3.97 |

**Formula:** `Math.ceil(text.length / 4)` with `1.2x` XML safety multiplier

## 7. Feature Classification Report

| Feature | Category | Tokens | Time (ms) | Verdict | Rationale |
|---------|----------|--------|-----------|---------|-----------|
| Layer: constitution | ESSENTIAL | 2040 | 0.1 | KEEP | Constitutional rules prevent dangerous code. Without them, agent may violate CLI... |
| Layer: global | ESSENTIAL | 1500 | 0.2 | KEEP | Global coding standards, import rules, error handling patterns. Directly impacts... |
| Layer: star-command | COSMETIC | 0 | 0.0 | N/A | Star command definitions for agent interaction. Zero impact on code output. |
| Git config detection | ESSENTIAL | 0 | 34.2 | KEEP | Branch awareness is essential for context. But _isGitRepository() execSync is ov... |
| projectStatus loader | OVERHEAD | 0 | 164.3 | OPTIMIZE | Provides commit/branch/dirty status for greeting. Takes ~164ms. Often times out ... |
| Session bracket system | USEFUL | 200 | 0.1 | KEEP | Bracket transitions verified: 4 transitions in 20k-context sim (FRESH→MODERATE→D... |
| Token estimation (chars/4 * 1.2) | USEFUL | 0 | 0.0 | KEEP | Pure arithmetic, near-zero cost. Accuracy depends on content type (XML underesti... |
| Memory hints (DEPLETED+) | USEFUL | 300 | 0.1 | KEEP | Injected only when context is running low. Helps LLM preserve important memories... |
| Handoff warning (CRITICAL) | ESSENTIAL | 100 | 0.1 | KEEP | Warns user when context is nearly exhausted. Prevents lost work. |
| Greeting builder | COSMETIC | 150 | 0.5 | KEEP | Formats activation greeting with persona, project status, commands. Zero impact ... |
| SYNAPSE diagnostics | USEFUL | 0 | 0.1 | KEEP | Metrics collection for pipeline optimization. No runtime cost beyond timing. |
| Code-intel bridge check | USEFUL | 0 | 0.5 | KEEP | Checks code intelligence provider availability. Graceful degradation if unavaila... |

### Summary

| Category | Count | Tokens | % of Total |
|----------|-------|--------|------------|
| ESSENTIAL | 4 | 3640 | 85% |
| USEFUL | 5 | 500 | 12% |
| COSMETIC | 2 | 150 | 3% |
| OVERHEAD | 1 | 0 | n/a |

## 8. Recommendations

### Top Optimization Targets

1. **Git Detection:** Replace `_isGitRepository()` execSync with `.git/HEAD` existence check (saves ~50ms)
2. **projectStatus Timeout:** Increase from 20ms or restructure to run fewer/async git commands
3. **SYNAPSE Token Budget:** Review cosmetic layers in FRESH bracket — only L0,L1,L2,L7 are loaded but still may carry persona/greeting overhead

### "Lean Activation" Scenario

If we stripped everything non-essential (COSMETIC + OVERHEAD):
- **Tokens saved:** ~150
- **Time saved:** ~165ms
- **Note:** Cosmetic features (greeting, persona) serve UX purpose — removal not recommended unless context is critical

---

*Report generated by NOG-17 pipeline audit script*
