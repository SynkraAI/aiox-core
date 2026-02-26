# RESEARCH SUMMARY — UAP & SYNAPSE Deep Research

**Story:** NOG-9 — UAP & SYNAPSE Deep Research
**Date:** 2026-02-21
**Authors:** Atlas (Analyst) + Aria (Architect)
**Scope:** 21 research targets across 4 waves + 4 synthesis deliverables
**Method:** `/tech-search` parallel execution → comparative analysis → architectural synthesis

---

## Executive Summary

This research investigated every component of the **UnifiedActivationPipeline (UAP)** and **SYNAPSE context engine**, benchmarking AIOS against 5 competitors (Claude Code, Cursor, Codex CLI, Gemini CLI, Antigravity). The core finding is a paradox: **AIOS has the most sophisticated context architecture in the industry, but critical wiring is missing** — infrastructure exists that was never connected.

### The Verdict

**AIOS SYNAPSE is architecturally unique.** No competitor has deterministic, bracket-throttled, 8-layer context injection. No competitor has multi-agent personas. No competitor has cross-IDE sync. These are genuine competitive advantages.

But AIOS also has 4 areas significantly behind the industry: config loading, git performance, memory/persistence, and context tracking. The good news: **80% of these gaps are wiring fixes, not architectural changes.** Two hours of Quick Wins would transform the system.

---

## Scorecard: AIOS vs Industry

| Dimension | Position | Key Finding |
|-----------|----------|-------------|
| Agent/persona system | **AHEAD** | Only multi-agent system in the industry |
| Context injection (SYNAPSE) | **AHEAD** | Only deterministic, bracket-throttled pipeline |
| Greeting/verbosity | **AHEAD** | Pioneering adaptive greeting by expertise level |
| Cross-IDE sync | **AHEAD** | Only tool syncing agent definitions across 6+ IDEs |
| Permission system | Baseline | Solid, needs per-agent defaults (from OpenCode) |
| Workflow suggestion | Moderate | Wrong signal source (commands vs story Status) |
| Config loading | **BEHIND** | Monolith YAML, no cache; all others separated |
| Git performance | **BEHIND** | 52ms sync spawns; direct read = 0.06ms (830x faster) |
| Memory & persistence | **BEHIND** | No resume, no self-edit; table stakes elsewhere |
| Session management | **BEHIND** | No atomic writes, no cleanup |
| Context tracking | **BEHIND** | Only static estimation in the industry |

**Score: 4 AHEAD / 3 Moderate / 4 BEHIND**

---

## Discovery #1: "Infrastructure Exists, Wiring Falta"

Three independent research streams (C2, C4, C6) converged on the same meta-pattern:

| Finding | What Exists | What's Missing |
|---------|-------------|---------------|
| C4: updateSession() | Function implemented in session manager | Never called from hook-runtime.js |
| C2: last_tokens_used | Field defined in session schema | Never populated from API response |
| C6: Token estimation | Bracket budgets configured per level | chars/4 formula ignores XML overhead |

**Impact:** The entire bracket system (FRESH/MODERATE/DEPLETED/CRITICAL) — AIOS's most sophisticated feature — is effectively disabled because brackets always return FRESH.

**Fix:** 3 Quick Wins totaling ~75 minutes of work.

---

## Discovery #2: Deterministic vs Probabilistic

SYNAPSE injects rules **deterministically** via a UserPromptSubmit hook — rules are guaranteed to reach the model. Cursor's rules are **probabilistic** — the LLM decides whether to apply them (documented as "token tax" of $4-12/day).

This is a core differentiator that should be marketed explicitly.

---

## Discovery #3: The 830x Git Speedup

AIOS runs 3 sequential `execSync('git ...')` calls totaling 52ms on Windows. Every fast competitor reads `.git/HEAD` directly: 0.06ms.

```javascript
// Current: 52ms
const branch = execSync('git branch --show-current').toString().trim();

// Proposed: 0.06ms
const head = fs.readFileSync('.git/HEAD', 'utf8');
const branch = head.replace('ref: refs/heads/', '').trim();
```

**Highest-ROI single change in the entire research.**

---

## Discovery #4: Output Bloat

UAP returns ~25KB on every activation (including `_coreConfig` at 15-20KB). The actual consumer (greeting display) needs ~600 bytes. A `compact` preset eliminates 97% of serialization.

---

## Key Patterns from Competitors

### From Claude Code (D1)
- 8-priority context assembly (SYNAPSE at position 6 = optimal)
- MEMORY.md with 200-line cap and AI self-editing
- JSONL append-only session transcripts with ~1 week TTL
- `--continue` / `--resume` session resume

### From Cursor (D2)
- Probabilistic rule application (model can ignore rules)
- "Agent Requested" activation mode (load only when LLM asks)
- SQLite-backed config (no serialization overhead)
- "Token tax" documented openly ($4-12/day)

### From Codex CLI (D3)
- Rust core + TypeScript App Server (performance + DX)
- Skills = open standard cross-platform task format
- 3×3 permission matrix (approval × sandbox = orthogonal)
- Metadata-first progressive loading

### From Gemini CLI (D4)
- `@import` syntax for composable rule files
- `/memory show` command for memory inspection
- Conductor = spec-driven development (parallel to AIOS workflows)
- 1M token context window (different game)

### From Antigravity (D5)
- VS Code/Windsurf fork, 3 months old
- Minimal differentiation — low investment recommended
- Worth monitoring, not emulating

---

## Deliverables Index

| # | Deliverable | File | Author |
|---|------------|------|--------|
| 1 | Research reports (21) | `wave-{1-4}/*.md` | Atlas |
| 2 | Comparative matrix | `comparative-matrix.md` | Atlas |
| 3 | Output taxonomy | `output-taxonomy.md` | Aria |
| 4 | Optimization roadmap | `optimization-roadmap.md` | Aria |
| 5 | Code-intel helpers | `code-intel-helpers.md` | Aria |
| 6 | This summary | `RESEARCH-SUMMARY.md` | Atlas |

### Research Reports by Wave

**Wave 1 — UAP Loaders (7 reports):**

| Report | Key Finding |
|--------|-------------|
| A1: CoreConfig | JSON cache with mtime = -3ms cold start |
| A2: AgentConfig | 0.46ms parse, 174x under budget — already excellent |
| A3: PermissionMode | Solid baseline; add per-agent defaults from OpenCode |
| A4: GitConfig | `.git/HEAD` direct read = 830x speedup (52ms → 0.06ms) |
| A5: Memory | 2-5% token budget consensus; index + topic files pattern |
| A6: Session | Atomic writes + 7-day TTL cleanup needed |
| A7: ProjectStatus | Replace git CLI with fs reads; enable fsmonitor |

**Wave 2 — UAP Steps (3 reports):**

| Report | Key Finding |
|--------|-------------|
| B1: Greeting | AIOS pioneering — no competitor has adaptive greeting |
| B2: Session Continuity | ContextDetector ignores rich SessionState data |
| B3: Workflow Suggestion | Story file Status field > command history for signal |

**Wave 3 — SYNAPSE Core (6 reports):**

| Report | Key Finding |
|--------|-------------|
| C1: Pipeline | Architecturally unique; adopt "Agent Requested" for L6 |
| C2: Context Tracking | `promptCount × 1500` is industry outlier; real API data needed |
| C3: Domain Format | KEY=VALUE = token noise; Markdown 34-38% more efficient |
| C4: Session Bridge | **BUG** — updateSession() never called; brackets always FRESH |
| C5: Memory Bridge | Sub-15ms needs in-process retrieval (HNSWlib/FAISS) |
| C6: Token Budget | chars/4 underestimates 15-25% on XML; apply 1.2x safety |

**Wave 4 — Cross-IDE (5 reports):**

| Report | Key Finding |
|--------|-------------|
| D1: Claude Code | SYNAPSE at priority 6/8 (optimal); transcript_path underutilized |
| D2: Cursor | Probabilistic rules (can be ignored); deterministic = AIOS advantage |
| D3: Codex CLI | Skills = open cross-platform standard; adopt for task export |
| D4: Gemini CLI | @import, /memory show, Conductor (spec-driven dev) |
| D5: Antigravity | VS Code fork, 3 months old; monitor, don't invest |

---

## Optimization Roadmap Summary

### Phase 0: Immediate (2h total, 5 Quick Wins)

| ID | Fix | Time | Impact |
|----|-----|------|--------|
| QW-1 | Fix updateSession() never called | 30min | CRITICAL — unlocks brackets |
| QW-2 | Populate last_tokens_used | 30min | HIGH — real token counting |
| QW-3 | Fix chars/4 estimation (1.2x safety) | 15min | HIGH — accurate brackets |
| QW-5 | Direct .git/HEAD read | 30min | HIGH — 830x git speedup |
| QW-4 | Strip _coreConfig from output | 15min | MEDIUM — 97% output reduction |

**Expected after Phase 0:**
- Brackets: 0% working → ~80% accurate
- Git detection: 52ms → <1ms
- Output size: 25KB → 600B

### Phase 1: Next Sprint (8h total)

QW-6 (config cache) → QW-7 (atomic writes) → QW-8 (session TTL) → MED-1 (output presets) → MED-6 (fsmonitor)

### Phase 2: Following Sprint (12h total)

MED-2 (Markdown domains) → MED-5 (story Status signal) → MED-4 (rich SessionState) → MED-3 (per-agent permissions)

### Phase 3: Strategic Stories

STR-2 (real token pipeline) → STR-1 (config separation) → STR-3 (session resume) → STR-4 (progressive domains) → STR-5 (memory self-edit) → STR-6 (Skills export)

---

## New Code-Intel Helpers Identified

| Helper | Consumer | Purpose | Priority |
|--------|----------|---------|----------|
| `synapse-helper.js` | SYNAPSE engine | Domain relevance, token estimation | P1 |
| `activation-helper.js` | UAP pipeline | Loader skip, freshness check | P1 |
| `session-helper.js` | ContextDetector | Workflow inference, continuity | P2 |
| `config-helper.js` | CoreConfig | Usage analysis, separation prep | P2 |
| `devops-helper.js` (enhance) | @devops | SYNAPSE impact in blast radius | P1 |
| `qa-helper.js` (enhance) | @qa | Token budget validation | P2 |

---

## Success Metrics Assessment

| Metric | Current | After Phase 0 | After Phase 1 | Target |
|--------|---------|---------------|---------------|--------|
| UAP p50 (warm) | ~260ms | ~210ms | <150ms | <150ms |
| UAP p95 (cold) | ~400ms | ~350ms | <250ms | <250ms |
| Output size (greeting) | ~800 lines | ~8 lines | ~8 lines | <50 lines |
| ProjectStatus timeout | ~60% | ~60% | <10% | <10% |
| Quality "full" rate | ~40% | ~50% | >85% | >85% |
| Bracket accuracy | ~0% | ~80% | ~95% | >95% |

---

## Recommendations for Next Steps

1. **Create a "NOG-10: Phase 0 Quick Wins" story** — implement QW-1 through QW-5 in a single sprint
2. **Market SYNAPSE's deterministic injection** — this is a genuine moat vs Cursor's probabilistic approach
3. **Prioritize session resume (STR-3)** — it's table stakes and the most visible user-facing gap
4. **Monitor Codex Skills adoption** — if it becomes an ecosystem standard, early STR-6 investment pays off
5. **Skip Antigravity investment** — too early, no meaningful differentiation yet

---

## Article IV Compliance

Every recommendation in this research traces to evidence from the 21 research reports. No features were invented. The decision hierarchy REUSE > ADAPT > CREATE was applied throughout:

- **REUSE:** `.git/HEAD` direct read (A4), atomic writes pattern (A6), mtime cache (A1)
- **ADAPT:** Codex Skills format for task export (D3), Cursor "Agent Requested" for L6 (D2)
- **CREATE:** Output taxonomy presets (no direct competitor equivalent — justified by unique UAP architecture)

---

## File Structure

```
docs/research/2026-02-21-uap-synapse-research/
├── RESEARCH-SUMMARY.md            ← This file (executive summary)
├── comparative-matrix.md          ← AIOS vs 5 competitors (11 dimensions)
├── output-taxonomy.md             ← UAP output presets (compact/standard/full/debug)
├── optimization-roadmap.md        ← 20 improvements prioritized (QW/MED/STR)
├── code-intel-helpers.md          ← 4 new helpers + 2 enhancements identified
├── wave-1-uap-loaders/            ← 7 reports (A1-A7)
├── wave-2-uap-steps/              ← 3 reports (B1-B3)
├── wave-3-synapse-core/           ← 6 reports (C1-C6)
└── wave-4-cross-ide/              ← 5 reports (D1-D5)
```

**Total: 26 files, 21 research reports, 4 synthesis documents, 1 executive summary.**

---

*Atlas, investigando a verdade* 🔎 + *Aria, arquitetando o futuro* 🏗️
