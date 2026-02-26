# Comparative Matrix — AIOS vs AI Coding Assistants

**Story:** NOG-9 — UAP & SYNAPSE Deep Research
**Author:** Atlas (Analyst Agent)
**Date:** 2026-02-21
**Sources:** 21 research reports across 4 waves (A1-A7, B1-B3, C1-C6, D1-D5)

---

## 1. Configuration & Loading

| Concern | AIOS | Claude Code | Cursor | Codex CLI | Gemini CLI |
|---------|------|-------------|--------|-----------|------------|
| **Config format** | YAML (9.4KB monolith) | JSON + Markdown | SQLite (internal) + MDC | YAML/JSON (~200B) + AGENTS.md | JSON + GEMINI.md |
| **Config size** | Medium (33 keys) | Small | Variable | Tiny (4 keys) | Small |
| **Parse time (cold)** | ~3.3ms YAML | <1ms JSON | N/A (DB) | <1ms | <1ms JSON |
| **Caching** | None | N/A (small) | DB-backed | N/A (tiny) | N/A (small) |
| **Config/context separation** | Mixed | Full | Full | Full | Full |
| **Verdict** | BEHIND — monolith YAML, no cache | Baseline | Ahead (SQLite) | Ahead (tiny) | Baseline |

### Gap: AIOS is the only tool with a monolithic config mixing settings and context. All competitors separate these concerns.

### Quick Win: JSON cache with mtime invalidation (A1 recommendation) — estimated -3ms cold start.

---

## 2. Agent/Persona Definitions

| Concern | AIOS | Claude Code | Cursor | Codex CLI | Gemini CLI |
|---------|------|-------------|--------|-----------|------------|
| **Format** | YAML-in-Markdown | CLAUDE.md (plain MD) | .mdc (YAML frontmatter + MD) | AGENTS.md (plain MD) | GEMINI.md (plain MD) |
| **Multi-agent support** | 12 agents with personas | Single agent | Single agent | Single agent | Single agent |
| **Agent switching** | `@agent-name` activation | N/A | N/A | N/A | N/A |
| **Parse time** | 0.46ms (largest file) | <1ms | <1ms | <1ms | <1ms |
| **Precompilation** | None (runtime parse) | N/A | N/A | N/A | N/A |
| **Verdict** | **AHEAD** — only multi-agent system | Baseline | Baseline | Baseline | Baseline |

### Advantage: AIOS is the ONLY tool with multi-agent personas. No competitor has agent switching or persona management.

---

## 3. Permission System

| Concern | AIOS | Claude Code | Cursor | Codex CLI | Gemini CLI |
|---------|------|-------------|--------|-----------|------------|
| **Modes** | 3 (explore/ask/auto) | 5 modes + tool rules | Sandbox-based (Seatbelt/Landlock) | 3x3 matrix (approval × sandbox) | Standard OAuth |
| **Per-agent defaults** | No | No | No | No | No |
| **Session caching** | Yes | Yes (per-tool "Don't ask again") | OS-level persistence | Session-scoped | Session-scoped |
| **Enterprise override** | No | Yes (managed settings) | Yes (team rules) | No | No |
| **Verdict** | Baseline | Ahead (enterprise) | Ahead (OS sandbox) | Ahead (orthogonal axes) | Behind |

### Gap: No per-agent permission defaults. OpenCode (researched in A3) implements this — recommended P1 adoption.

---

## 4. Git Integration Performance

| Concern | AIOS | Claude Code | Cursor | Codex CLI | Gemini CLI |
|---------|------|-------------|--------|-----------|------------|
| **Branch detection** | `execSync` (52ms) | `cp.spawn` (async) | IDE-native (async) | `git` CLI | `git` CLI |
| **Status detection** | `git status --porcelain` (50-200ms) | Full git integration | IDE-native | Sandboxed git | Full git |
| **Caching** | Fingerprint (mtime-based) | Session-level | Real-time (IDE) | Per-command | Per-session |
| **Performance** | **52ms** (3x execSync) | Async (non-blocking) | Real-time | Sandboxed | Standard |
| **Verdict** | **BEHIND** — blocking sync spawns | Ahead (async) | Ahead (native) | Baseline | Baseline |

### Critical Gap: 3x sequential `execSync` = 52ms on Windows. Direct `.git/HEAD` read = 0.06ms (830x speedup). Highest-ROI quick win.

---

## 5. Memory & Persistence

| Concern | AIOS | Claude Code | Cursor | Codex CLI | Gemini CLI |
|---------|------|-------------|--------|-----------|------------|
| **Instruction memory** | Agent YAML + SYNAPSE domains | CLAUDE.md + rules/ | .mdc rules + .cursorrules | AGENTS.md + Skills | GEMINI.md |
| **Auto memory** | Pro-only (MIS) | MEMORY.md (200 lines) | Beta "Memories" | Session JSONL | No native |
| **Cross-session** | File-based (session-state.json) | JSONL transcripts | Notepads + Memories | JSONL + rollouts | Auto-save sessions |
| **Resume** | No native resume | `--continue` / `--resume` | No native | `codex resume` | `--resume` / `/resume` |
| **Memory self-editing** | No | Yes (AI writes MEMORY.md) | Yes (sidecar model) | No | No |
| **Token budget** | 500ms loader, no budget awareness | 200-line cap | No documented limit | 32KiB cap | No documented limit |
| **Verdict** | BEHIND (no resume, no self-edit) | **AHEAD** | Moderate | Moderate | Moderate |

### Gap: No session resume, no memory self-editing. Claude Code's MEMORY.md pattern is the gold standard.

---

## 6. Session Management

| Concern | AIOS | Claude Code | Cursor | Codex CLI | Gemini CLI |
|---------|------|-------------|--------|-----------|------------|
| **Storage format** | JSON (session-state.json) | JSONL (append-only) | Internal DB | JSONL (UUIDv7) | JSON (project hash) |
| **Session detection** | File-based (1h TTL) | Path-encoded directories | Project-scoped | Session picker | Project-hash scoped |
| **Continuity inference** | String return (new/existing/workflow) | Explicit (`--continue`) | None automatic | Explicit (`resume`) | Explicit (`--resume`) |
| **Atomic writes** | No | Yes | N/A (DB) | Yes | Unknown |
| **Cleanup** | No automatic | ~1 week TTL | Managed | Configurable retention | Configurable |
| **Verdict** | BEHIND (no atomic, no cleanup) | **AHEAD** | Moderate | Ahead | Moderate |

### Gap: No atomic writes (corruption risk), no automatic cleanup. Both are <20 lines of code each.

---

## 7. Context Injection (Rules Engine)

| Concern | AIOS SYNAPSE | Claude Code | Cursor | Codex CLI | Gemini CLI |
|---------|-------------|-------------|--------|-----------|------------|
| **Architecture** | 8-layer pipeline (L0-L7) | Flat merge (3-tier) | 4-mode MDC | Cascading file-walk | 5-level hierarchy |
| **Injection type** | **Deterministic** (hook) | Additive merge | **Probabilistic** (LLM decides) | Concatenation | Concatenation |
| **Context-aware throttling** | Yes (bracket-based) | No | No | No | No |
| **Deduplication** | Yes (cross-layer) | No | No | No | No |
| **Keyword activation** | Yes (L6) | No | Agent Requested mode | No | No |
| **Workflow activation** | Yes (L3-L4) | No | No | No | No |
| **Token budget per bracket** | Yes (800-2500 tokens) | No (full load) | No (token tax documented) | No (32KiB cap) | No |
| **Per-prompt latency** | ~45ms (100ms timeout) | 0ms (pre-loaded) | 0ms (pre-loaded) | 0ms (pre-loaded) | 0ms (pre-loaded) |
| **Verdict** | **AHEAD** (most sophisticated) | Baseline | Moderate | Basic | Moderate |

### Advantage: SYNAPSE is the ONLY deterministic, context-aware, bracket-throttled rule injection system. No competitor has anything comparable.

### Trade-off: Per-prompt latency (~45ms) that others don't pay. Justified by the richness of context.

---

## 8. Context Window Tracking

| Concern | AIOS SYNAPSE | Claude Code | Cursor | Codex CLI | Gemini CLI |
|---------|-------------|-------------|--------|-----------|------------|
| **Method** | Static estimate (promptCount × 1500) | **Real API token counts** | Internal (undocumented) | API response usage | Token caching stats |
| **Accuracy** | ~70-80% (chars/4) | ~100% | Unknown | ~100% | Unknown |
| **Compaction trigger** | N/A (external to SYNAPSE) | 98% fill | Unknown | Auto-threshold | `/compress` manual |
| **Adaptive behavior** | Bracket-based layer activation | Auto-compaction | Dynamic context discovery | Prompt cache management | 1M token window |
| **Verdict** | **BEHIND** (static estimate) | **AHEAD** (real data) | Unknown | Ahead | Different (1M) |

### Critical Gap: `promptCount × 1500` is the ONLY static estimation in the industry. All others use real API data. Field `last_tokens_used` exists but is never populated.

---

## 9. Greeting & Verbosity

| Concern | AIOS | Claude Code | Cursor | Codex CLI | Gemini CLI |
|---------|------|-------------|--------|-----------|------------|
| **Adaptive greeting** | Yes (auto/minimal/named/archetypal) | No | No | No | First-run only |
| **User profiling** | Explicit (beginner/intermediate/advanced) | No | No | No | No |
| **Verbosity levels** | 4 levels | `--verbose` flag only | None | `--profile` (manual) | None |
| **Session-count inference** | No (planned) | No | No | No | No |
| **Verdict** | **AHEAD** — pioneering | Behind | Behind | Behind | Behind |

### Advantage: AIOS is the ONLY tool with adaptive greeting based on user expertise. No competitor has this.

---

## 10. Workflow Suggestion

| Concern | AIOS | Claude Code | Cursor | Codex CLI | Gemini CLI |
|---------|------|-------------|--------|-----------|------------|
| **Next-action suggestion** | Yes (WorkflowNavigator) | Stop hook pattern | Cursor Tab (ML-based) | Skills (semantic match) | Conductor tracks |
| **Signal source** | Command history pattern matching | Artifact file existence | Edit trajectory + linter | Description matching | Spec file status |
| **State machine** | Hardcoded sequences | No formal FSM | Implicit (ML model) | No formal FSM | Linear (spec→plan→impl) |
| **Verdict** | Moderate (wrong signal source) | Moderate | **AHEAD** (ML) | Moderate | Moderate |

### Gap: Using command history instead of story file Status as primary signal. B3 research recommends parsing story Status field directly.

---

## 11. Cross-IDE Compatibility

| Concern | AIOS | Claude Code | Cursor | Codex CLI | Gemini CLI |
|---------|------|-------------|--------|-----------|------------|
| **IDE sync** | Yes (6 IDEs) | Single platform | Single platform | Multi-surface (App Server) | Single platform |
| **Output formats** | full-markdown-yaml, condensed-rules, cursor-style, github-copilot | CLAUDE.md only | .mdc only | AGENTS.md + Skills | GEMINI.md only |
| **Cross-platform skills** | No | No | No | **Yes** (open standard) | No |
| **Verdict** | **AHEAD** (multi-IDE sync) | Single | Single | Ahead (portability) | Single |

### Advantage: AIOS is the ONLY tool that syncs agent definitions across 6+ IDEs. Codex Skills portability is a pattern to adopt for cross-platform task export.

---

## Summary Scorecard

| Dimension | AIOS vs Industry |
|-----------|-----------------|
| Config loading | BEHIND (monolith YAML, no cache) |
| Agent/persona system | **AHEAD** (only multi-agent) |
| Permission system | Baseline (solid, needs per-agent defaults) |
| Git performance | **BEHIND** (52ms sync spawns) |
| Memory & persistence | BEHIND (no resume, no self-edit) |
| Session management | BEHIND (no atomic, no cleanup) |
| Context injection | **AHEAD** (most sophisticated pipeline) |
| Context tracking | **BEHIND** (static estimate) |
| Greeting/verbosity | **AHEAD** (pioneering) |
| Workflow suggestion | Moderate (wrong signal source) |
| Cross-IDE sync | **AHEAD** (6+ IDEs) |

### Score: 4 AHEAD / 3 Baseline-Moderate / 4 BEHIND

---

## Top 10 Cross-Cutting Insights

1. **"Infrastructure Exists, Wiring Falta"** — Three independent findings (C2, C4, C6) reveal the same pattern: `updateSession()` never called, `last_tokens_used` never populated, `chars/4` underestimates XML. Fixing wiring alone resolves major issues.

2. **Deterministic vs Probabilistic** — SYNAPSE's deterministic injection is a core differentiator. Cursor's rules are probabilistic (LLM can ignore). This should be marketed as a feature.

3. **Direct File Read > Process Spawn** — Universal pattern. `.git/HEAD` (0.03ms) vs `git branch` (16ms). Every tool that's fast reads files directly.

4. **Separation of Concerns** — All competitors separate config from context. AIOS's monolithic `core-config.yaml` is the outlier.

5. **Progressive/Lazy Loading** — Codex Skills load metadata-first, full content on-demand. Cursor MDC uses activation modes. SYNAPSE should adopt progressive loading for domains.

6. **Session Resume is Table Stakes** — Claude Code, Codex CLI, and Gemini CLI all have it. AIOS does not. This is a user-facing gap.

7. **Memory Self-Editing** — Claude Code and Cursor allow AI to write its own memories. AIOS MIS is read-only from SYNAPSE perspective.

8. **Token Budget Awareness** — 2-5% of context for memory injection is industry consensus. SYNAPSE has budgets but lacks real token counting.

9. **Cross-Platform Skills** — Codex's open Skills standard is gaining adoption. AIOS tasks could be exported in this format for portability.

10. **Story File as Signal** — AIOS has a unique advantage: story files with Status fields. No competitor has structured development workflow state. Using this as primary signal for WorkflowNavigator would leapfrog competitors.

---

## References

All data sourced from 21 research reports in `docs/research/2026-02-21-uap-synapse-research/`:
- Wave 1 (A1-A7): UAP Loaders
- Wave 2 (B1-B3): UAP Steps
- Wave 3 (C1-C6): SYNAPSE Core
- Wave 4 (D1-D5): Cross-IDE Architecture

---

*Atlas, investigando a verdade* 🔎
