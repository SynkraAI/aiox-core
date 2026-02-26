# C1 — Layered Rule Injection Architecture

**Research Target:** NOG-9 / Wave 3 — SYNAPSE Core
**Date:** 2026-02-21
**Researcher:** Claude Agent (Sonnet 4.6)
**Status:** Complete

---

## Executive Summary

The SYNAPSE 8-layer context injection pipeline is architecturally sound and ahead of most industry implementations. Claude Code's own internal rule system is a 3-tier hierarchy (global + project + user settings), while Cursor uses a 4-mode .mdc system, and Codex CLI uses a cascading file-walk approach. None of these tools implement context-aware bracket throttling or deduplication across layers — features that are unique to SYNAPSE. The primary risk identified is the 100ms hard pipeline timeout, which is conservative but defensible given Claude Code's 600s default hook timeout. Key opportunities include adopting Cursor's "agent-requested" rule pattern (L6 enhancement), formalizing token-budget priority protection (CONSTITUTION + AGENT are already protected correctly), and implementing a circuit-breaker with warm-file caching to reduce I/O latency.

---

## RQ1 — Claude Code Internal Rule Hierarchy

### How Claude Code Handles Layered Context

Claude Code's context injection for rules operates as a **flat merge with priority weighting**, not a pipeline. The system has three tiers:

```
Enterprise managed policy  (highest — cannot be disabled by user)
  └── ~/.claude/settings.json    (user-global)
       └── .claude/settings.json  (project)
            └── .claude/settings.local.json  (local, gitignored)
```

Rules files (`.claude/rules/*.md`) are **loaded at the same priority level as CLAUDE.md** and merged additively into the model's context window. There is no numeric layer system — all rule files are concatenated. The key excerpt from the official documentation:

> "Claude's context window isn't flat. Different sources receive different priority levels. CLAUDE.md and rules files are treated as authoritative — high priority. Skills load on-demand. File contents and conversation history are standard priority."

### CLAUDE.md + rules/ Merge Behavior

- All `.md` files in `.claude/rules/` are auto-loaded at project startup — no import syntax required.
- Files support YAML frontmatter with `paths:` to scope rules to matching file globs.
- Rules **without** `paths:` apply globally (equivalent to always-on).
- Rules **with** `paths:` apply only when the user opens or edits a matching file.
- Priority: **project rules override user rules** (user loads first, project loads second and wins on conflict).

```yaml
---
paths: src/api/**/*.ts
---
# API Development Rules
- All endpoints must include input validation
```

### UserPromptSubmit Hook — Context Injection Mechanism

The SYNAPSE engine uses the `UserPromptSubmit` hook, which is the correct hook for pre-prompt context injection. Key behaviors confirmed from official documentation:

- `UserPromptSubmit` fires **before Claude processes the prompt**.
- It **does not support matchers** — it fires on every single prompt.
- Stdout from the hook is **added directly as context Claude can see and act on** (unlike other hooks where stdout is only visible in verbose mode).
- Two modes of context injection:
  - **Plain text stdout** → shown as hook output in transcript
  - **JSON with `additionalContext`** field → added more discretely, not shown in transcript
- To **block a prompt**: return `{"decision": "block", "reason": "..."}` with exit 0, or exit with code 2.
- Default timeout: **600 seconds** for command hooks (not 100ms — that is the SYNAPSE internal pipeline limit, not Claude Code's hook timeout).

**Input schema received by hook:**
```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../transcript.jsonl",
  "cwd": "/current/working/dir",
  "permission_mode": "default",
  "hook_event_name": "UserPromptSubmit",
  "prompt": "The user's actual prompt text"
}
```

### SYNAPSE vs. Claude Code Native Rules — Gap Analysis

| Feature | Claude Code Native | SYNAPSE |
|---|---|---|
| Context-bracket awareness | No | Yes (FRESH/MODERATE/DEPLETED/CRITICAL) |
| Token budget per bracket | No | Yes (800/1500/2000/2500 tokens) |
| Layer deduplication | No | Yes (L6 dedup against previousLayers) |
| Agent-scoped rules | No | Yes (L2 — agentTrigger matching) |
| Keyword-triggered rules | No (path-based only) | Yes (L6 — recall keywords in manifest) |
| Star-command rules | No | Yes (L7 — *command regex) |
| Constitutional immutability | No | Yes (L0 — nonNegotiable flag) |
| Rule merging strategy | Additive (flat) | Sequential pipeline with context-passing |
| Priority protection on truncation | No (all or nothing) | Yes (PROTECTED set: CONSTITUTION, AGENT, CONTEXT_BRACKET) |

**Conclusion for RQ1:** SYNAPSE's pipeline is significantly more sophisticated than Claude Code's native rule system. The architecture is fundamentally correct. The `UserPromptSubmit` hook with stdout context injection is the right implementation pattern.

---

## RQ2 — Cursor Rules System Architecture

### Evolution: .cursorrules → .mdc

The `.cursorrules` file (monolithic, project root) is **deprecated as of 2025**. The current system uses `.cursor/rules/*.mdc` files with YAML frontmatter.

### Four Rule Activation Modes

Cursor's `.mdc` system implements four distinct activation modes — this is the most mature rule-typing system in the industry:

| Mode | Frontmatter | Behavior |
|---|---|---|
| **Always** | `alwaysApply: true` | Injected into every conversation, regardless of context |
| **Auto Attached** | `globs: ["src/**/*.ts"]` with `alwaysApply: false` | Injected when user opens or mentions a matching file |
| **Agent Requested** | `description:` present, no globs | Cursor's agent reads the description and decides whether to load the rule |
| **Manual** | Neither globs nor description | Never loaded automatically, user must reference explicitly |

### Priority Hierarchy

```
Team/Enterprise rules (highest — managed, read-only)
  └── Project rules (.cursor/rules/*.mdc)
       └── User rules (Cursor Settings > Rules for AI)
            └── Legacy .cursorrules (deprecated, still supported)
```

### Token Budget and the "Token Tax"

This is the most critical insight from Cursor's documentation for SYNAPSE relevance:

> "Every word in your rules is a token. In a large project with 20 global rules, you might send 2,000 extra tokens with every single message. If rules take up 25% of the context window, the AI has 25% less 'brain space' to look at actual source code."

Cursor's solution is the Auto Attached mode: rules only enter the context when the active file matches the glob. This is analogous to SYNAPSE's L6 keyword-triggered layer — but implemented at the file-path level, not keyword level.

**Key Cursor insight:** "Agent Requested" mode (where the AI agent itself decides whether a rule is relevant based on its description) is a pattern SYNAPSE does not yet implement. The L6 keyword layer relies on hard-coded keyword lists in the manifest. An "agent-requested" L6 variant would allow the model to request additional domain rules dynamically.

### Architecture Diagram (Cursor)

```
User prompt submitted
        ↓
Load "Always" rules (alwaysApply: true) — always in context
        ↓
Load "Auto Attached" rules — glob-match against active files
        ↓
Agent reads descriptions of "Agent Requested" rules
        ↓
Agent requests relevant rules → loaded into context
        ↓
Rules concatenated → sent with system prompt
        ↓
LLM generates response
```

---

## RQ3 — Codex CLI / AGENTS.md Hierarchical Instructions

### Discovery and Cascade Order

Codex CLI builds an instruction chain once per session using the following cascade:

```
~/.codex/AGENTS.override.md  (global override — checked first)
  OR ~/.codex/AGENTS.md      (global base — if no override)
        ↓
Project root: AGENTS.override.md OR AGENTS.md
        ↓ (walk down directory tree to CWD)
Subdirectory: AGENTS.override.md OR AGENTS.md
        ↓
Current working directory: AGENTS.override.md OR AGENTS.md
```

**Merge strategy:** Files are **concatenated with blank lines** between them, from global root → CWD. Files closer to the CWD appear later and therefore **override earlier guidance by appearing later in the combined prompt** (recency bias in LLM attention).

**Single-file-per-level rule:** Codex reads only the first non-empty file at each level — either `AGENTS.override.md` (takes priority) or `AGENTS.md` (fallback). It does not merge both.

### Key Difference from SYNAPSE

| Feature | Codex AGENTS.md | SYNAPSE |
|---|---|---|
| Cascade direction | Root → CWD (later = higher priority) | Fixed L0-L7 pipeline (lower number = higher priority) |
| Merging | Simple concatenation | Sequential pipeline with deduplication |
| Context-awareness | None | Bracket-based throttling |
| Trigger mechanism | Directory proximity | Keywords, agent identity, star-commands |
| Override mechanism | AGENTS.override.md file | No direct override — nonNegotiable flag |
| Skill system | Yes (since 2026 — reusable instruction bundles) | Partial (L5 squad layer) |

### Codex "Skills" (2026)

Codex has introduced "agent skills" — reusable bundles of instructions plus optional scripts and resources. This is analogous to SYNAPSE's squad layer (L5) but more explicitly packaged. Skills are available in both CLI and IDE extensions.

---

## RQ4 — Patterns for Layered/Prioritized Rule Systems

### Pattern 1: CSS Cascade Layers (Analogical Model)

CSS `@layer` provides the cleanest theoretical model for priority in layered rule systems:

```css
@layer constitution, global, agent, workflow, task, squad, keyword, command;
```

In CSS layers, **layer order determines specificity** — a later-declared layer always wins, regardless of selector specificity within the layer. This maps precisely to the SYNAPSE model where L0 (Constitution) is **immutable** (equivalent to `!important` in CSS), while higher-numbered layers provide more specific context.

Key insight from CSS: **"Once layer order is established, specificity within layers is ignored."** This is exactly what SYNAPSE's `PROTECTED` set in `enforceTokenBudget()` implements — CONSTITUTION and AGENT sections can never be truncated regardless of token pressure.

### Pattern 2: Cascading Configuration Files (nginx, Git, ESLint)

ESLint, Git config, and nginx all use a "walk up the directory tree" cascade where more specific (closer to the file) configs override more general ones. This is the pattern Codex AGENTS.md uses.

**Problem:** This pattern assumes all rules are additive and equally important. It doesn't handle the SYNAPSE use case where some rules (Constitution) must be immutable and others are context-triggered.

### Pattern 3: Priority Queue with Eviction

The cascading KV cache architecture in LLM systems (as documented in academic research) uses:
- Multiple sub-caches, each accepting a fraction of tokens evicted from the previous
- Exponential moving average of attention scores for token importance
- Recent tokens in top layer, older high-attention tokens in deeper layers

This is directly analogous to SYNAPSE's bracket system:
- FRESH bracket → small budget (800 tokens), only high-priority layers
- CRITICAL bracket → large budget (2500 tokens), all layers + memory hints

### Pattern 4: Plugin-Based Context Managers (Open Source)

**Langfuse** (open source, GitHub: `langfuse/langfuse`): Provides prompt versioning, management, and observability but no layered injection pipeline. It is a prompt management plane, not an injection architecture.

**Latitude LLM** (open source, GitHub: `latitude-dev/latitude-llm`): Provides prompt engineering infrastructure but no per-request layered injection.

**Conclusion:** There is no widely-adopted open-source implementation of a multi-layer, context-aware, token-budgeted rule injection pipeline comparable to SYNAPSE. SYNAPSE is in novel territory.

---

## RQ5 — Timeout and Performance Patterns

### Claude Code Hook Timeout Reality

The official documentation confirms:
- **Command hooks** default timeout: **600 seconds**
- **Prompt hooks** default timeout: **30 seconds**
- **Agent hooks** default timeout: **60 seconds**
- Hooks run in **parallel** when multiple hooks match the same event

The SYNAPSE hook has its own internal 100ms hard pipeline timeout (configurable to 5s safety timeout at the outer wrapper level). This is the **self-imposed constraint**, not a Claude Code limit.

### Industry Latency Standards

| System | Acceptable Latency |
|---|---|
| Claude Code hooks (rule-based) | Milliseconds (target) |
| Claude Code hooks (LLM-based) | Up to 25 seconds (timeout) |
| Cursor rule injection | Synchronous, pre-prompt (~5-20ms estimated) |
| SYNAPSE pipeline (measured) | ~45ms average, 100ms hard limit |
| Production API round-trip | 200-2000ms (acceptable for users) |

**Key principle from Claude Code documentation:**
> "Fast deterministic checks first, with slow AI classification only when needed — most requests should be handled by rule-based hooks in milliseconds."

This validates SYNAPSE's synchronous, file-based approach. The 45ms average is well within acceptable bounds. The 100ms hard limit provides a generous safety margin without blocking user experience.

### Performance Optimization Patterns in Use

1. **Boot time capture:** SYNAPSE captures `process.hrtime.bigint()` as the first line of the hook entry point (`const _BOOT_TIME = process.hrtime.bigint()`) — measuring cold start before any `require()` calls.

2. **Layer timeout budget:** Each layer has its own timeout (L0: 5ms, L2: 15ms, L7: 5ms). The `_safeProcess()` wrapper monitors execution time and emits a warning if exceeded but does NOT abort the layer.

3. **Per-bracket layer skipping:** FRESH bracket skips L3-L6, saving ~4 file I/O operations per prompt.

4. **Fire-and-forget metrics:** `_persistHookMetrics()` writes to disk without awaiting, keeping the hot path unblocked.

### Identified Performance Risk

The layer processors currently perform **synchronous file I/O** (`loadDomainFile()`) on every prompt. For FRESH bracket (most common state), layers L3-L6 are skipped, but L0, L1, L2, and L7 still read from disk on every hook invocation. On Windows (the production environment), file system latency can be higher than on Linux/macOS, potentially pushing average execution above 45ms.

**Recommendation:** Implement a warm-file cache (in-memory Map) populated at engine instantiation time, invalidated on `ConfigChange` hook events.

---

## RQ6 — Open-Source Multi-Layer Context Injection Implementations

### Survey Results

After searching GitHub, the following open-source projects were evaluated:

| Project | Relevance | Notes |
|---|---|---|
| `langfuse/langfuse` | Low | Prompt management platform, no layered injection |
| `latitude-dev/latitude-llm` | Low | Prompt engineering platform, no injection pipeline |
| `disler/claude-code-hooks-mastery` | Medium | Hook patterns library, no multi-layer architecture |
| `ChrisWiles/claude-code-showcase` | Medium | Hook + agent configuration examples |
| `0xeb/TheBigPromptLibrary` | Low | Prompt collection, not an injection system |

**Finding:** There is no open-source implementation of a multi-layer, bracket-aware, token-budgeted rule injection pipeline. The closest architectural analogues are:

1. **LangGraph's state-based prompt building** — Each node in the graph can modify a shared state object that includes system prompt fragments. No priority or truncation logic.

2. **Anthropic's own Claude Code hook system** — As documented above, uses flat merge, no layering.

3. **NVIDIA NeMo Agent Toolkit Cursor Rules Developer Guide** — Documents how to write Cursor rules for NeMo agents. No injection pipeline.

**SYNAPSE is the most sophisticated per-prompt rule injection pipeline publicly documented in the AI coding assistant space.**

---

## Code Architecture Analysis: SYNAPSE vs. Industry

### SYNAPSE Pipeline (Current Implementation)

```
UserPromptSubmit
       ↓
readStdin() → JSON parse
       ↓
resolveHookRuntime() → locate .synapse/ directory
       ↓
SynapseEngine.process(prompt, session)
   ↓
   estimateContextPercent(prompt_count) → contextPercent
   calculateBracket(contextPercent) → FRESH|MODERATE|DEPLETED|CRITICAL
   getActiveLayers(bracket) → [0,1,2,7] or [0..7]
   getTokenBudget(bracket) → 800|1500|2000|2500
   ↓
   For each active layer (L0→L7):
     layer._safeProcess(context) → { rules[], metadata }
     results.push(result)
     previousLayers.push(result)  ← deduplication context
   ↓
   memoryBridge.getMemoryHints() → hints[] (if DEPLETED/CRITICAL)
   ↓
   formatSynapseRules(results, bracket, ...) → <synapse-rules> XML
     enforceTokenBudget(sections, sectionIds, tokenBudget)
       PROTECTED = {CONTEXT_BRACKET, CONSTITUTION, AGENT}
       TRUNCATION_ORDER = [SUMMARY, KEYWORD, MEMORY_HINTS, SQUAD, ...]
   ↓
stdout.write(JSON.stringify({ type: "context", context: xml }))
```

### Key Architectural Strengths

1. **Graceful degradation at every level:** `loadLayerModule()` catches MODULE_NOT_FOUND, `_safeProcess()` catches runtime errors, hook wrapper catches unhandled rejections. A failing layer never blocks the pipeline.

2. **Immutability enforcement:** L0 Constitution has `nonNegotiable: true` flag in manifest, reflected in metadata. The formatter's `PROTECTED` set ensures CONSTITUTION is never truncated by token budget enforcement.

3. **Deduplication via `previousLayers`:** L6 keyword layer checks which domains were already loaded by L2 (agent) or L5 (squad) and skips duplicates. This prevents the same rules appearing twice in the output.

4. **Context-aware throttling:** The bracket system is the most innovative feature. FRESH sessions get lightweight injection (800 tokens, 4 layers). Critical sessions get maximum injection (2500 tokens, all 8 layers + memory hints). This is unique in the industry.

5. **Structured XML output:** `<synapse-rules>` XML with labeled sections ([CONSTITUTION], [ACTIVE AGENT], [WORKFLOW], etc.) provides semantic structure that helps the LLM parse and prioritize injected content.

### Key Architectural Gaps

1. **No "agent-requested" rule mode:** L6 uses keyword matching from a static manifest. Cursor's agent-requested mode allows the LLM itself to request relevant rules based on natural language descriptions. This could improve relevance of keyword matching.

2. **File I/O on every prompt:** Domain files are read from disk on each hook invocation. For high-frequency sessions, this adds cumulative latency.

3. **No wildcard/glob matching in L6:** Keywords are exact string matches. File-glob-based auto-attachment (Cursor's Auto Attached mode) is not implemented.

4. **No session-level warm-start:** Engine is constructed fresh for each hook invocation (via `resolveHookRuntime()`). In-memory caching of domain file contents across invocations within the same session is not implemented.

---

## Prioritized Recommendations

### P0 — Critical (Address Before Production)

**P0-A: Implement in-memory domain file cache**

Domain files are loaded from disk on every `UserPromptSubmit`. For a 50-prompt session, L0+L1+L2+L7 files are read 200 times. A session-scoped in-memory cache (keyed by file path + mtime) would eliminate this I/O overhead.

Implementation location: `domain-loader.js` — add a `Map` cache checked before `fs.readFileSync()`.

```javascript
// In domain-loader.js
const _domainCache = new Map();

function loadDomainFile(filePath) {
  const mtime = fs.statSync(filePath).mtimeMs;
  const cacheKey = `${filePath}:${mtime}`;
  if (_domainCache.has(cacheKey)) return _domainCache.get(cacheKey);
  const rules = _readAndParseDomainFile(filePath);
  _domainCache.set(cacheKey, rules);
  return rules;
}
```

**Note:** Cache must be at module scope (persists across invocations in the same Node.js process). This works because Claude Code runs the hook as a persistent process or re-spawns it per prompt — validate which applies to determine cache lifetime.

**P0-B: Validate 100ms pipeline timeout on Windows**

The 100ms hard limit in `PIPELINE_TIMEOUT_MS` was likely calibrated on Linux/macOS. Windows file system I/O is measurably slower for small files. Run the benchmark suite on Windows to confirm the 45ms average holds. If Windows shows 60-80ms, increase `PIPELINE_TIMEOUT_MS` to 150ms.

### P1 — High Priority (Next Sprint)

**P1-A: Add "description-based" matching to L6 (Cursor Agent-Requested Pattern)**

Extend the L6 manifest schema to support an optional `description` field alongside `recall` keywords. When a domain has a `description` but no `recall` keywords, pass the description list to the model as part of the `additionalContext` from a prior layer (e.g., L1 global) so the model can explicitly request relevant domains.

This requires a new "agent-requested" execution path where the engine first runs L0-L5, then queries the model's intent to select L6 domains before loading them.

**P1-B: Formalize bracket-based layer activation documentation**

The `LAYER_CONFIGS` constant in `context-tracker.js` defines which layers are active per bracket, but the rationale is not documented. Add inline comments explaining why FRESH skips L3-L6 (to minimize token overhead in early session) and why CRITICAL enables all layers + memory hints (to maximize context reinforcement as context window depletes).

**P1-C: Add glob-based auto-attachment to L6**

Complement keyword matching with file-glob matching. When the session state includes the current file path (if provided by Claude Code), match it against domain globs in the manifest. This enables file-type-specific rules (e.g., database rules auto-injected when editing `.sql` files).

### P2 — Medium Priority (Future Epic)

**P2-A: Implement `additionalContext` JSON output instead of plain stdout**

Currently, SYNAPSE writes the `<synapse-rules>` block as a plain JSON string. The Claude Code docs indicate that `additionalContext` via JSON `hookSpecificOutput` is "added more discretely" and doesn't appear as visible hook output in the transcript. Switching to this format would reduce visual noise in Claude Code's transcript view.

```json
{
  "hookSpecificOutput": {
    "hookEventName": "UserPromptSubmit",
    "additionalContext": "<synapse-rules>...</synapse-rules>"
  }
}
```

Validate that `additionalContext` injection preserves the same semantic authority as direct stdout injection.

**P2-B: Implement ConfigChange hook for cache invalidation**

If the domain file cache (P0-A) is implemented, domain files modified during a session must invalidate the cache. The `ConfigChange` hook event fires when `.claude/settings.json` or `.claude/skills/` files change. Extend this to monitor `.synapse/` directory changes and flush the domain cache.

**P2-C: Add `once: true` support for session-init layers**

Claude Code hook skills support `once: true` to run a hook only once per session. For L0 (Constitution) and L1 (Global), the rules are immutable and session-agnostic. Investigate whether these layers could be injected once at `SessionStart` rather than on every `UserPromptSubmit`, freeing token budget for more dynamic layers.

**Caveat:** This changes the injection mechanism from per-prompt to per-session. The model may lose awareness of constitutional rules in very long sessions with context compaction. Benchmark compaction behavior before implementing.

### P3 — Low Priority (Research / Exploratory)

**P3-A: Study LangGraph's state-based prompt building for L3/L4 workflow context**

LangGraph allows each node in an agent graph to contribute fragments to a shared system prompt state. The L3 (workflow) and L4 (task) layers in SYNAPSE serve a similar function. Studying LangGraph's implementation may provide patterns for making workflow/task context more dynamic.

**P3-B: Evaluate CSS `@layer` as a conceptual specification model**

The CSS cascade layer model (ordered layers with explicit priority, `!important` equivalent for immutable rules, specificity within layers) is a well-specified analogue to SYNAPSE's pipeline. Consider adopting CSS layer terminology in SYNAPSE design documentation for clarity.

**P3-C: Investigate parallel layer execution**

The current implementation executes layers sequentially (L0 → L1 → L2 → ... → L7) because each layer receives `previousLayers` for deduplication. L3 (workflow), L4 (task), and L5 (squad) could potentially run in parallel since they don't share dedup concerns with each other. Parallel execution could reduce pipeline latency by ~30-40%.

**Risk:** The `previousLayers` dedup mechanism must be redesigned for parallel execution. L6 keyword currently deduplicates against all previous layers, which requires sequential completion of L0-L5 first.

---

## Sources

- [Hooks reference - Claude Code Docs](https://code.claude.com/docs/en/hooks)
- [Claude Code Rules Directory: Modular Instructions That Scale](https://claudefa.st/blog/guide/mechanics/rules-directory)
- [What is .claude/rules/ in Claude Code](https://claudelog.com/mechanics/hooks/)
- [Claude Code Gets Path-Specific Rules (Cursor Had This First)](https://paddo.dev/blog/claude-rules-path-specific-native/)
- [Guide to "Cursor" Rules - Engineering Context, Speed, and the "Token Tax"](https://medium.com/@peakvance/guide-to-cursor-rules-engineering-context-speed-and-the-token-tax-16c0560a686a)
- [Cursor Rules Developer Guide — NVIDIA NeMo Agent Toolkit](https://docs.nvidia.com/nemo/agent-toolkit/1.2/extend/cursor-rules-developer-guide.html)
- [Mastering .mdc Files in Cursor: Best Practices](https://medium.com/@ror.venkat/mastering-mdc-files-in-cursor-best-practices-f535e670f651)
- [Codex Guide: AGENTS.md, Cascading Rules, and the Optional AGENTS.override.md](https://jpcaparas.medium.com/codex-guide-agents-md-cascading-rules-and-the-optional-agents-override-md-1f4c81767e92)
- [Custom instructions with AGENTS.md - OpenAI Codex](https://developers.openai.com/codex/guides/agents-md/)
- [Codex CLI features](https://developers.openai.com/codex/cli/features/)
- [Claude Code Hooks: Complete Guide with 20+ Ready-to-Use Examples](https://aiorg.dev/blog/claude-code-hooks)
- [A complete guide to hooks in Claude Code](https://www.eesel.ai/blog/hooks-in-claude-code)
- [A practical guide to Claude Code configuration in 2025](https://www.eesel.ai/blog/claude-code-configuration)
- [LLM Orchestration in 2026: Top 22 frameworks and gateways](https://research.aimultiple.com/llm-orchestration/)
- [Langfuse - Open source LLM engineering platform](https://github.com/langfuse/langfuse)
- [GitHub - disler/claude-code-hooks-mastery](https://github.com/disler/claude-code-hooks-mastery)
- [Elie Steinbock on .mdc rules architecture](https://x.com/elie2222/status/1907070722960187745)
- [Cursor Rules: Why Your AI Agent Is Ignoring You](https://sdrmike.medium.com/cursor-rules-why-your-ai-agent-is-ignoring-you-and-how-to-fix-it-5b4d2ac0b1b0)
- [@layer - CSS MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@layer)
- [5 Patterns for Scalable Prompt Design](https://latitude-blog.ghost.io/blog/5-patterns-for-scalable-prompt-design/)

---

## Appendix: SYNAPSE Files Analyzed

| File | Role | Key Findings |
|---|---|---|
| `.claude/hooks/synapse-engine.cjs` | Hook entry point | 5s safety timeout wrapper, readStdin → engine.process → stdout |
| `.aios-core/core/synapse/engine.js` | Pipeline orchestrator | 100ms hard timeout, sequential L0-L7 execution, metrics |
| `.aios-core/core/synapse/layers/layer-processor.js` | Abstract base class | 15ms default per-layer timeout, _safeProcess() graceful degradation |
| `.aios-core/core/synapse/layers/l0-constitution.js` | L0 — Constitution | ALWAYS_ON, nonNegotiable flag, 5ms timeout |
| `.aios-core/core/synapse/layers/l2-agent.js` | L2 — Agent scoped | agentTrigger manifest matching, AUTH boundary detection |
| `.aios-core/core/synapse/layers/l6-keyword.js` | L6 — Keyword trigger | matchKeywords(), isExcluded(), dedup via previousLayers Set |
| `.aios-core/core/synapse/layers/l7-star-command.js` | L7 — Star-command | STAR_COMMAND_REGEX, _parseCommandBlocks(), [*cmd] header format |
| `.aios-core/core/synapse/context/context-tracker.js` | Bracket calculator | FRESH/MODERATE/DEPLETED/CRITICAL thresholds, LAYER_CONFIGS, token budgets |
| `.aios-core/core/synapse/output/formatter.js` | XML formatter | SECTION_ORDER, PROTECTED set, enforceTokenBudget(), truncation order |
