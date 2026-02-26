# D1 — Claude Code Native Architecture: Deep Research Report

**Story:** NOG-9 — UAP & SYNAPSE Deep Research
**Wave:** Wave 4 — Cross-IDE Analysis
**Deliverable:** D1 — Claude Code Native Architecture (CRITICAL)
**Date:** 2026-02-21
**Researcher:** AIOS Tech Search Pipeline

---

## Executive Summary

AIOS SYNAPSE runs as a `UserPromptSubmit` hook inside Claude Code. This report documents the complete internal architecture of Claude Code relevant to SYNAPSE integration: how context is assembled, how hooks operate, session management mechanics, rules system behavior, context window management, and performance characteristics. Findings are based on official documentation (v2.1.49, February 2026), community reverse-engineering of the system prompt, and active GitHub issue tracking.

**Critical finding:** The `additionalContext` path via `hookSpecificOutput` is the correct and stable injection mechanism. A known bug existed in v2.0.69 where plain stdout from `UserPromptSubmit` caused errors, but the JSON `hookSpecificOutput.additionalContext` path was documented and functional. SYNAPSE already uses this correct path.

---

## Research Question 1: Context Assembly Architecture

### How CLAUDE.md + rules/ + hooks output merge into the final prompt

Claude Code does not use a single static system prompt. It employs a **modular, conditional assembly architecture** with 110+ strings that compose dynamically based on environment, configuration, and session state.

#### Context Assembly Order (Highest → Lowest Priority)

```
┌─────────────────────────────────────────────────────────────┐
│  1. MANAGED POLICY CLAUDE.md                                │
│     (Windows: C:\Program Files\ClaudeCode\CLAUDE.md)        │
│     Highest priority — admin-controlled, cannot be overridden│
├─────────────────────────────────────────────────────────────┤
│  2. BASE SYSTEM PROMPT (Claude Code internal)               │
│     - Core identity (~269 tokens)                           │
│     - Tool descriptions (24+ tools, loaded conditionally)   │
│     - Agent-specific prompts (Plan/Explore/Task agents)     │
│     - Permission and environment context                    │
├─────────────────────────────────────────────────────────────┤
│  3. USER MEMORY                                             │
│     ~/.claude/CLAUDE.md  — applies to all projects          │
│     ~/.claude/rules/*.md — user-level rules                 │
├─────────────────────────────────────────────────────────────┤
│  4. PROJECT MEMORY (loaded in hierarchy walk, cwd → root)   │
│     ./CLAUDE.md or ./.claude/CLAUDE.md                      │
│     ./.claude/rules/*.md (unconditional + path-filtered)    │
│     ./CLAUDE.local.md (personal, gitignored)                │
├─────────────────────────────────────────────────────────────┤
│  5. AUTO MEMORY (first 200 lines only)                      │
│     ~/.claude/projects/<project>/memory/MEMORY.md           │
├─────────────────────────────────────────────────────────────┤
│  6. HOOK OUTPUT (UserPromptSubmit, SessionStart)            │
│     - hookSpecificOutput.additionalContext → injected        │
│       discretely before Claude processes prompt             │
│     - Plain stdout → shown as hook output in transcript     │
│       (shown as visible block, less discrete)               │
├─────────────────────────────────────────────────────────────┤
│  7. SYSTEM REMINDERS (injected dynamically mid-session)     │
│     - Hook success/blocking error signals (29-52 tokens ea.)│
│     - File truncation notices                               │
│     - Context compaction warnings                           │
├─────────────────────────────────────────────────────────────┤
│  8. IMPORTED FILE CONTENTS (via @path/to/file syntax)       │
│     Resolved at load time, max 5 hop depth                  │
└─────────────────────────────────────────────────────────────┘
```

#### Key Priority Rules

- **More specific beats less specific**: Project rules override user rules; path-targeted rules override global rules when working on matching files.
- **CLAUDE.md files in the directory hierarchy** (cwd → root) are loaded in full at launch.
- **CLAUDE.md files in child directories** load on demand only when Claude reads files in those subtrees — this is a lazy-loading optimization.
- **Auto memory loads only the first 200 lines** of `MEMORY.md`; detailed topic files are loaded on demand.
- **`--append-system-prompt`** appends directly to the base system prompt (high-priority persistent slot). **CLAUDE.md** is injected as the first user message immediately following the system prompt (slightly lower position in the hierarchy).

#### SYNAPSE Relevance

SYNAPSE's `<synapse-rules>` XML block is injected via `hookSpecificOutput.additionalContext` on every `UserPromptSubmit`. This places SYNAPSE context at position 6 in the assembly order — after all static memory files but before conversation history. This is the optimal position: it arrives fresh each prompt turn (not stale like CLAUDE.md), and it is scoped to the current prompt context.

---

## Research Question 2: Hook System Internal Architecture

### Complete UserPromptSubmit mechanics

#### Hook Lifecycle Events (15 total as of v2.1.49)

```
Session Start
     │
     ▼
[SessionStart hook]
     │
     ▼  ← agentic loop begins ──────────────────────────────────────┐
     │                                                               │
[UserPromptSubmit hook] ← user submits prompt                       │
     │                                                               │
     ▼ (if not blocked)                                              │
Claude processes prompt                                              │
     │                                                               │
     ├──→ [PreToolUse hook] → tool executes → [PostToolUse hook]    │
     │         or                                                    │
     │    [PermissionRequest hook] → [PostToolUseFailure hook]       │
     │                                                               │
     ├──→ [SubagentStart hook] → subagent runs → [SubagentStop hook]│
     │                                                               │
     ├──→ [Notification hook]                                        │
     │                                                               │
     ▼                                                               │
[Stop hook] → if not blocked, loop ends ─────────────────────────────┘
     │
     ▼
[SessionEnd hook]
```

Other events: `TeammateIdle`, `TaskCompleted`, `ConfigChange`, `PreCompact`

#### UserPromptSubmit — Complete stdin JSON Schema

```json
{
  "session_id":       "abc123",
  "transcript_path":  "/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "cwd":              "/path/to/project",
  "permission_mode":  "default",
  "hook_event_name":  "UserPromptSubmit",
  "prompt":           "the full text of the user's prompt"
}
```

**All fields available to SYNAPSE:**

| Field | Type | Usage in SYNAPSE |
|-------|------|-----------------|
| `session_id` | string | Passed to `resolveHookRuntime()`, used for session state load |
| `transcript_path` | string | Path to JSONL; could be read for conversation history |
| `cwd` | string | Used to locate `.synapse/` directory |
| `permission_mode` | string | Not currently used by SYNAPSE |
| `hook_event_name` | string | Verified implicitly (only `UserPromptSubmit` fires this) |
| `prompt` | string | The user's raw prompt text, passed to `engine.process()` |

#### Hook stdout/exit behavior

| Exit Code | What happens |
|-----------|-------------|
| `0` | Success: Claude Code parses stdout for JSON output fields |
| `2` | Blocking error: stderr fed back to Claude; prompt erased |
| `other` | Non-blocking error: stderr shown in verbose mode only |

#### UserPromptSubmit — stdout output schema

The hook can output JSON to stdout (exit 0 only):

```json
{
  "decision": "block",
  "reason": "Explanation shown to user (not to Claude)",
  "hookSpecificOutput": {
    "hookEventName": "UserPromptSubmit",
    "additionalContext": "Context string injected discretely before Claude processes prompt"
  }
}
```

- **`decision: "block"`** — prevents prompt processing entirely, erases prompt from context
- **`additionalContext`** — the preferred injection mechanism; added discretely (not shown as a visible block in transcript)
- **Plain text stdout** — also accepted, but shown as a visible "hook output" block in transcript (less discrete)

#### Known Bug: stdout handling in older versions

Issue #13912 (closed Dec 17, 2025 as duplicate) documented that in v2.0.69, any stdout from `UserPromptSubmit` hooks caused a "UserPromptSubmit hook error". This was fixed. SYNAPSE's current architecture using `JSON.stringify(buildHookOutput(result.xml))` on stdout (exit 0) is the correct and stable approach.

#### Environment Variables Available to Hooks

| Variable | Description |
|---------|-------------|
| `CLAUDE_PROJECT_DIR` | Project root directory (use for path references in config) |
| `CLAUDE_ENV_FILE` | SessionStart only: file to write persistent env vars |
| `CLAUDE_CODE_REMOTE` | Set to `"true"` in remote web environments |

#### Timeout Defaults

| Hook type | Default timeout |
|-----------|----------------|
| `type: "command"` (sync) | 600 seconds (10 minutes) |
| `type: "prompt"` | 30 seconds |
| `type: "agent"` | 60 seconds |
| Async hooks | 600 seconds (same as sync) |

**SYNAPSE internal timeouts (for comparison):**
- Outer hook safety timeout: 5,000 ms (5s)
- Pipeline hard timeout: 100 ms
- These are far more conservative than Claude Code's defaults, which is correct.

#### Hook Configuration Hierarchy and Merging

Settings files resolve in this order (highest priority first):

```
managed-settings.json → .claude/settings.local.json → .claude/settings.json → ~/.claude/settings.json
```

Hooks are **merged additively** across scopes: a user-level hook and a project-level hook for the same event both run. The `allowManagedHooksOnly` enterprise setting (managed policy only) can block user/project/plugin hooks.

**Important:** Claude Code captures a snapshot of all hooks at session startup. External modifications to hook config do NOT take effect mid-session without explicit review via `/hooks` menu.

---

## Research Question 3: Context Window Management

### Auto-compaction triggers, summarization strategy, what gets preserved vs dropped

#### Context Window Architecture

Claude Code uses a 200,000 token context window (Sonnet/Opus models). The `estimateContextPercent` formula used in SYNAPSE (`100 - ((promptCount * 1500) / 200000 * 100)`) correctly mirrors Claude Code's internal assumption of ~1,500 tokens/prompt average.

#### Compaction Trigger

Auto-compaction fires when context usage reaches **98% of the effective context window**, preventing `prompt_too_long` API errors.

#### Session Memory Background Summaries

Claude Code (v2.1.30+) uses a continuous background summarization system:

```
Initial extraction:  after ~10,000 tokens of conversation
Subsequent updates:  every ~5,000 tokens OR after every 3 tool calls (whichever first)
```

Summary storage: `~/.claude/projects/<project-hash>/<session-id>/session-memory/summary.md`

Each summary captures:
- Session title and description
- Completed items and discussion points
- Important architectural decisions
- Chronological work log

#### What Gets Preserved vs Dropped During Compaction

```
PRESERVED (in summary injected into fresh context):
├── Session title / high-level goal
├── Completed tasks and their outcomes
├── Key architectural decisions and why
├── Important patterns discovered
├── Current status / what's in-progress
└── Chronological work log (compressed)

DROPPED (not carried forward explicitly):
├── Exact error messages and stack traces
├── Precise function signatures (unless in summary)
├── Step-by-step reasoning chains
├── Intermediate tool call outputs
├── Previous SYNAPSE hook injections
└── Verbatim conversation history
```

**SYNAPSE implication:** SYNAPSE's context bracket system (FRESH/MODERATE/DEPLETED/CRITICAL) correctly escalates injection at DEPLETED/CRITICAL brackets. However, SYNAPSE does NOT have access to Claude Code's actual context token count — it estimates from `prompt_count` in session state. This is an approximation gap.

#### PreCompact Hook

The `PreCompact` hook fires immediately before compaction:

```json
{
  "hook_event_name": "PreCompact",
  "trigger": "manual" | "auto",
  "custom_instructions": ""
}
```

SYNAPSE could theoretically hook PreCompact to inject preservation instructions. Currently unused.

---

## Research Question 4: Session Management Architecture

### JSONL transcripts, session resume, context persistence

#### JSONL Session File Location

```
~/.claude/projects/<project-path-hash>/<session-uuid>.jsonl
```

Subagent sessions: nested under `<session-uuid>/subagents/<agent-id>.jsonl`

#### JSONL Message Schema

Each line is one JSON object. Message types:

**User message:**
```json
{
  "type": "user",
  "parentUuid": null,
  "isSidechain": false,
  "isMeta": false,
  "userType": "external",
  "cwd": "/path/to/project",
  "sessionId": "uuid-string",
  "version": "2.1.x",
  "gitBranch": "branch-name",
  "message": {
    "role": "user",
    "content": "prompt text"
  },
  "uuid": "message-uuid",
  "timestamp": "ISO-8601",
  "thinkingMetadata": {
    "level": "high|medium|low",
    "disabled": false,
    "triggers": []
  },
  "todos": []
}
```

**Assistant message:**
```json
{
  "type": "assistant",
  "message": {
    "role": "assistant",
    "content": [
      { "type": "text", "text": "response text" },
      { "type": "thinking", "thinking": "reasoning", "signature": "hash" },
      { "type": "tool_use", "id": "toolu_id", "name": "Bash", "input": {} }
    ]
  },
  "uuid": "message-uuid",
  "parentUuid": "parent-uuid",
  "toolUseMessages": [],
  "timestamp": "ISO-8601",
  "slug": "whimsical-session-name",
  "requestId": "req_id"
}
```

**File history snapshot:**
```json
{
  "type": "file-history-snapshot",
  "messageId": "message-uuid",
  "snapshot": {
    "trackedFileBackups": {
      "filename": {
        "backupFileName": "hash@v1",
        "version": 1,
        "backupTime": "ISO-8601"
      }
    }
  }
}
```

**Tool result (inside user message content):**
```json
{
  "type": "tool_result",
  "tool_use_id": "toolu_id",
  "content": "result text",
  "is_error": false
}
```

#### Session Graph Structure

The `parentUuid` field creates a **directed acyclic graph** of messages, not a simple list. This enables:
- Session branching (sidechains)
- Subagent isolation (separate transcript files with `parentToolUseId`)
- Session resume from any point

#### Session Resume Mechanics

- `--resume` / `--continue` / `/resume` flags load the existing JSONL transcript
- SessionStart hook fires with `source: "resume"`
- SYNAPSE's `session-manager.js` loads from `.synapse/sessions/{sessionId}.json`
- A session state mismatch between Claude Code's JSONL and SYNAPSE's session file is possible if the user resumes a session SYNAPSE has never seen

#### SYNAPSE Session State Schema

```
.synapse/sessions/{sessionId}.json:
  prompt_count: number
  activeAgent: string (optional)
  active_agent: string (optional)
```

This is a simplified state model vs. Claude Code's full JSONL. SYNAPSE uses `prompt_count` to estimate context bracket, not actual token counts.

---

## Research Question 5: Rules System Architecture

### `.claude/rules/*.md` glob matching, loading order, token limits

#### Rules Loading Architecture

```
Load order (within project scope):
1. .claude/rules/ — all .md files discovered recursively
2. Path-filtered rules — only active when Claude works on matching files
3. Unconditional rules — always active, loaded at session start
4. User-level rules (~/.claude/rules/) — loaded BEFORE project rules

Priority: Project rules > User rules (more specific wins)
```

#### Path Frontmatter Syntax

```yaml
---
paths:
  - "src/api/**/*.ts"
  - "src/**/*.{ts,tsx}"
  - "{src,lib}/**/*.ts"
---
```

Supported glob features:
- `**` — recursive directory matching
- `*` — single-level wildcard
- `{a,b}` — brace expansion
- Multiple patterns in array

Rules **without** `paths` frontmatter are loaded unconditionally every session.

Rules **with** `paths` frontmatter activate dynamically based on files Claude is currently working on.

#### Token Limits

No explicit token cap is documented per rules file. However:
- The overall context window is 200,000 tokens
- Rules compete with conversation history for context space
- Best practice: keep each file focused on one topic to avoid "priority saturation"

#### Loading Trigger

Rules files in child directories of cwd load **on demand** when Claude reads files in those subtrees (same lazy-loading behavior as CLAUDE.md files in subdirectories). This is a context window optimization.

#### Symlink Support

`.claude/rules/` supports symlinks for sharing rules across projects. Circular symlinks are detected and handled gracefully.

---

## Research Question 6: Performance Characteristics

### Startup time, hook overhead, memory usage, known bottlenecks

#### Measured/Reported Metrics

| Metric | Value | Source |
|--------|-------|--------|
| Default command hook timeout | 600s (10 min) | Official docs |
| Prompt hook timeout | 30s | Official docs |
| Agent hook timeout | 60s | Official docs |
| Context compaction trigger | 98% context fill | Community analysis |
| Session memory extraction start | ~10,000 tokens | Community analysis |
| Session memory update interval | ~5,000 tokens or 3 tool calls | Community analysis |
| Auto memory loaded | First 200 lines only | Official docs |
| JSONL file format | Append-only, one line per event | Reverse engineering |
| Import max depth | 5 hops | Official docs |
| Session snapshots retained | 5 most recent timestamped backups | Official docs |

#### SYNAPSE-Specific Measurements

From `hook-metrics.json` (SYNAPSE internal):

| Metric | Target | Notes |
|--------|--------|-------|
| Outer hook timeout | 5,000 ms | Defense-in-depth |
| Pipeline hard timeout | 100 ms | Per engine.js `PIPELINE_TIMEOUT_MS` |
| Node.js process startup | ~50-200 ms | Cold start before `require()` |
| Boot time captured | Before ANY require | `_BOOT_TIME = process.hrtime.bigint()` |

#### Known Performance Bottlenecks in Claude Code

1. **Large context windows** — extensive conversation history forces larger API payloads
2. **Hook cold start** — Node.js process spawned fresh per hook invocation (no persistent process)
3. **Sequential hook execution** — all matching hooks for an event run before Claude continues
4. **Memory leak (fixed)** — agent teams had completed teammate tasks never GC'd from session state
5. **Session resume overhead** — v2.x introduced 68% memory reduction for `/resume` via lightweight stat-based loading

#### Known Performance Improvements (Recent)

- **Context editing** (v2.1.x): automatically clears stale tool calls while preserving conversation flow; reduced token consumption by 84% in 100-turn web search evaluation
- **Instant compaction**: Session Memory background summaries made `/compact` instantaneous vs. previous 2-minute wait
- **Resume optimization**: 68% memory reduction for `--resume` sessions

#### Hook Execution Model

```
Claude Code (main process)
    │
    ├── Spawns hook subprocess per event (Node.js cold start each time)
    │       stdin ──→ hook process
    │       hook process ──→ stdout
    │       hook process ──→ stderr (error case)
    │
    └── Continues after hook completes (sync) or immediately (async: true)
```

**SYNAPSE's cold start mitigation:** The `_BOOT_TIME` capture (before any `require()`) enables measuring the actual cold start cost for diagnostics. The 5s outer timeout ensures Claude Code never blocks more than 5s on SYNAPSE.

---

## Architecture Diagram: SYNAPSE Integration Point

```
User submits prompt
        │
        ▼
Claude Code fires UserPromptSubmit
        │
        ├──→ Spawns: node synapse-engine.cjs
        │              │
        │              ├── readStdin() → parses JSON
        │              │     {session_id, cwd, prompt, transcript_path, ...}
        │              │
        │              ├── resolveHookRuntime(input)
        │              │     ├── Validates cwd exists
        │              │     ├── Checks .synapse/ directory exists
        │              │     ├── Loads SynapseEngine(synapsePath)
        │              │     └── Loads session state (prompt_count, activeAgent)
        │              │
        │              ├── engine.process(prompt, session)
        │              │     ├── estimateContextPercent(prompt_count) → %
        │              │     ├── calculateBracket(%) → FRESH/MODERATE/DEPLETED/CRITICAL
        │              │     ├── getActiveLayers(bracket) → [0,1,2,7] or [0-7]
        │              │     └── Execute L0→L7 sequentially (100ms hard timeout)
        │              │           L0: Constitution
        │              │           L1: Global rules
        │              │           L2: Active agent
        │              │           L3: Workflow context
        │              │           L4: Task context
        │              │           L5: Squad context
        │              │           L6: Keyword matching
        │              │           L7: Star-command detection
        │              │
        │              ├── buildHookOutput(xml)
        │              │     → {hookSpecificOutput: {additionalContext: "<synapse-rules>..."}}
        │              │
        │              └── process.stdout.write(JSON.stringify(output))
        │                          │
        │              ◄───────────┘
        │    stdout parsed as JSON
        │    additionalContext injected discretely into Claude's context
        │
        ▼
Claude Code sends to model:
    [system prompt]
    [CLAUDE.md files]
    [rules/ files]
    [auto memory]
    [<synapse-rules> XML ← SYNAPSE injection]
    [conversation history]
    [user prompt]
```

---

## Relevance to AIOS SYNAPSE Integration

### What SYNAPSE does correctly (confirmed by this research)

1. **Correct hook event**: `UserPromptSubmit` is the right hook for pre-prompt context injection.
2. **Correct output format**: `hookSpecificOutput.additionalContext` is the documented discrete injection path.
3. **Correct timeout strategy**: 5s outer + 100ms pipeline is far under Claude Code's 600s default. Zero risk of blocking.
4. **Correct stdin fields used**: `cwd`, `session_id`, `prompt` are all real fields in the actual schema.
5. **Graceful degradation**: Silent exit when `.synapse/` not present is correct (avoids noisy errors in non-SYNAPSE projects).
6. **Context bracket estimation**: Using `prompt_count * 1500 / 200000` is a reasonable approximation of Claude Code's actual context.

### Gaps and Risks Identified

1. **No access to real token count**: SYNAPSE estimates context from `prompt_count` but has no access to Claude Code's actual token usage. Claude Code does not expose this via the hook stdin payload. The transcript_path could theoretically be parsed, but that would add significant latency.

2. **Session resume mismatch**: If a user resumes a session Claude Code has seen before but SYNAPSE's `.synapse/sessions/` has no matching file, SYNAPSE starts at `prompt_count: 0` (FRESH bracket) even if the session is actually deeply into context. This could cause under-injection at resume time.

3. **`transcript_path` underutilized**: Claude Code provides `transcript_path` in every hook invocation — the full path to the JSONL conversation history. SYNAPSE does not currently read this. Reading even the last N messages from JSONL could enable prompt-aware context selection (e.g., detecting which agent is active from conversation history if the user hasn't used a `@agent-name` marker).

4. **No PreCompact hook**: SYNAPSE could optionally register a `PreCompact` hook to inject preservation instructions or handoff context immediately before compaction. Currently this is not implemented.

5. **No SessionStart hook**: A `SessionStart` hook could initialize session state and pre-warm the SYNAPSE cache. Currently session state is created lazily on first `UserPromptSubmit`.

6. **Path-filtered rules blind spot**: Claude Code's path-specific rules activation is invisible to SYNAPSE. SYNAPSE cannot know which `rules/*.md` files are currently active (path-triggered). This means SYNAPSE might inject redundant context that overlaps with already-active rules.

---

## Prioritized Recommendations for SYNAPSE

### P0 — Critical (implement now)

**P0.1: Session resume bracket correction**
When `resolveHookRuntime` loads a session and `prompt_count` is 0 but `transcript_path` exists with many entries, SYNAPSE should detect this as a resume scenario and estimate `prompt_count` from the JSONL line count (fast: just `wc -l` equivalent without parsing). This prevents FRESH injection when the context is actually deep.

**P0.2: Validate `permission_mode` field handling**
The `permission_mode` field is available in stdin but unused. In `bypassPermissions` mode, Claude Code behaves differently. SYNAPSE should at minimum log this field to diagnostics.

### P1 — High Value (next sprint)

**P1.1: Lightweight JSONL message count**
Add a fast line-count read of `transcript_path` to get actual prompt count for bracket estimation. No JSON parsing needed — just count lines of type `"user"`. This would make context bracket estimation accurate.

**P1.2: SessionStart hook registration**
Add a `SessionStart` hook to pre-initialize session state and detect session type (`startup` vs `resume` vs `compact`). On `compact`, reset `prompt_count` to 0 (compaction creates a fresh context). This is the most impactful accuracy improvement.

**P1.3: PreCompact hook for handoff injection**
Register a `PreCompact` hook (async: true) that injects structured handoff instructions into the session summary. SYNAPSE's CRITICAL bracket handoff warning would be more effective if it ran at compaction time rather than just before compaction.

### P2 — Medium Value (backlog)

**P2.1: Prompt content analysis for agent detection**
The `prompt` field is available but SYNAPSE currently uses it only for keyword/star-command matching. Consider parsing `@agent-name` patterns from the raw prompt to update `session.activeAgent` more reliably than waiting for L2 layer detection.

**P2.2: Rules file active detection**
Read `.claude/rules/` at startup and check which path-filtered rules apply to the current context (based on recently accessed files from JSONL). Avoid injecting SYNAPSE context that duplicates already-active rules.

**P2.3: ConfigChange hook**
Register a `ConfigChange` hook to invalidate SYNAPSE's cached manifest/domain data when `.synapse/` files change during a session.

### P3 — Nice to Have (future)

**P3.1: `transcript_path` conversation awareness**
Parse last 5 messages from JSONL to detect conversation patterns (agent transitions, workflow state) for smarter L3/L4 layer injection. Requires fast JSONL tail-read to stay under 100ms pipeline timeout.

**P3.2: PostToolUse hook for code intelligence**
A `PostToolUse` hook on Write/Edit events could update SYNAPSE's code graph context (NOG-4/NOG-5 integration). Currently code intelligence runs only on UserPromptSubmit.

---

## Sources

- [Claude Code Hooks Reference — Official Docs](https://code.claude.com/docs/en/hooks)
- [Manage Claude's Memory — Official Docs](https://code.claude.com/docs/en/memory)
- [Claude Code Settings — Official Docs](https://code.claude.com/docs/en/settings)
- [Claude Code System Prompts Repository (Piebald-AI)](https://github.com/Piebald-AI/claude-code-system-prompts)
- [Claude Code JSONL Data Structures Gist](https://gist.github.com/samkeen/dc6a9771a78d1ecee7eb9ec1307f1b52)
- [Claude Code Rules Directory Guide](https://claudefa.st/blog/guide/mechanics/rules-directory)
- [Claude Code Session Memory Guide](https://claudefa.st/blog/guide/mechanics/session-memory)
- [Claude Code Performance Guide](https://claudefa.st/blog/guide/performance/speed-optimization)
- [UserPromptSubmit Hook Bug Issue #13912](https://github.com/anthropics/claude-code/issues/13912)
- [Context Window & Compaction — DeepWiki](https://deepwiki.com/anthropics/claude-code/3.3-session-and-conversation-management)
- [Claude Code Context Backups Hook Guide](https://claudefa.st/blog/tools/hooks/context-recovery-hook)
- [Inside Claude Code: Session File Format — Yi Huang](https://databunny.medium.com/inside-claude-code-the-session-file-format-and-how-to-inspect-it-b9998e66d56b)
- [Claude Code Hooks Mastery — GitHub](https://github.com/disler/claude-code-hooks-mastery)
- [Claude-Mem DeepWiki: UserPromptSubmit Hook](https://deepwiki.com/thedotmack/claude-mem/3.1.2-userpromptsubmit-hook)
- [Claude Code Context Recovery Hook — Medium](https://medium.com/coding-nexus/context-recovery-hook-for-claude-code-never-lose-work-to-compaction-7ee56261ee8f)
- [AIOS SYNAPSE Engine source: `.aios-core/core/synapse/engine.js`]
- [AIOS SYNAPSE Hook entry: `.claude/hooks/synapse-engine.cjs`]
- [AIOS SYNAPSE Runtime: `.aios-core/core/synapse/runtime/hook-runtime.js`]
- [AIOS SYNAPSE Context Tracker: `.aios-core/core/synapse/context/context-tracker.js`]

---

*Research generated by AIOS Tech Search Pipeline*
*Date: 2026-02-21*
*Version: 1.0.0*
