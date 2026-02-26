# C4 — SYNAPSE Session Bridge: Session State Persistence

**Research Component:** C4
**Wave:** 3 — SYNAPSE Core
**Story:** NOG-9 (UAP & SYNAPSE Deep Research)
**Date:** 2026-02-21
**Researcher:** Claude Sonnet 4.6 (Tech Search Agent)

---

## Executive Summary

The SYNAPSE Session Bridge (`session-manager.js`) persists per-session state to `.synapse/sessions/{uuid}.json` using synchronous `fs.writeFileSync`. This is a valid and standard approach for CLI tools with a single writer per session, but carries specific risks around atomic writes and schema evolution. Research across AI CLI tools, hook systems, and Node.js IPC patterns confirms that the current JSON-file approach is the industry norm, with SQLite as the correct upgrade path only when query complexity or concurrency requires it. The key finding is that the current implementation has one concrete correctness risk (non-atomic writes) and one design gap (no tracking of how much context was actually injected per turn, only an estimate via `prompt_count`). Both are addressable without a storage backend change.

---

## Research Question 1: How Do AI CLI Tools Persist Per-Conversation State That Affects Context Injection?

### Findings

AI CLI tools universally converge on **file-based JSON state** keyed by a session UUID, with in-memory cache during the session and flush-on-update to disk. The specific pattern of tracking "how much context was injected" is less common; most systems track conversation turns and let the LLM's built-in context accumulate naturally.

**Claude Code's own session state** (internal `r0` object) is the canonical reference. It tracks:
- `sessionId`: UUID used for persistence and telemetry
- Token accounting per model (input, output, cache read, cache creation tokens)
- Cost tracking in USD
- Automatic compaction threshold triggers

Critically, Claude Code tracks **actual token counts** from API responses, not estimates. The `r0` session state is updated after every tool use and every LLM response with the real token delta. This is fundamentally different from SYNAPSE's approach of estimating context from `prompt_count * avgTokensPerPrompt`.

**Continuous-Claude** (parcadei/Continuous-Claude-v3) is the most architecturally relevant reference. It uses a ledger + handoff pattern:
- `CONTINUITY_CLAUDE-<session>.md` files act as persistent ledgers
- Ledger content: goal/constraints, done/next, key decisions, working files
- Loaded automatically into Claude's context on `SessionStart` hook
- Separate `thoughts/handoffs/<session>/handoff-<timestamp>.md` for cross-session continuity
- Hook events: `SessionStart`, `PreToolUse`, `PreCompact`, `UserPromptSubmit`, `PostToolUse`, `SubagentStop`

The key insight from Continuous-Claude: **hooks do not directly track "how much context was injected" — instead, they inject relevant state and let `PreCompact` signal that compaction is imminent.** There is no per-turn injection accounting in any surveyed system.

**iannuttall/claude-sessions** takes a simpler approach: custom slash commands (`/project:session-start`, `/project:session-update`, `/project:session-end`) that write structured markdown files tracking what was done, decisions made, and next steps. No hook state — purely explicit user commands.

**LangChain / OpenAI Agents SDK** use a `RunContextWrapper` pattern: structured state objects persisted across runs, with lifecycle hooks (`on_start`, `on_tool_use`, `on_end`) that can mutate or enrich the context. State persists via pluggable backends (MemoryStorage, CosmosDB, Blob Storage). The key pattern is **injecting only relevant slices of state**, not the full state object.

### Relevance to SYNAPSE

SYNAPSE's `prompt_count` is an estimation proxy for context consumption — a reasonable heuristic but imprecise. The SYNAPSE Session Bridge tracks:
- `prompt_count`: used to estimate `contextPercent` via linear formula
- `context.last_bracket`: last calculated bracket (FRESH/MODERATE/DEPLETED/CRITICAL)
- `context.last_tokens_used`: last known token count
- `context.last_context_percent`: last calculated percentage

The gap: `last_tokens_used` and `last_context_percent` are stored in the session but the engine (`engine.js`) only reads `prompt_count` from the session object to call `estimateContextPercent()`. The richer context fields are not fed back into the estimation. This means if Claude Code already has context data, SYNAPSE's bracket calculation ignores it.

---

## Research Question 2: Claude Code's Session Management and Context Injection Adaptation

### Findings

Claude Code's hook system is documented and stable as of early 2026:

**Hook input payload** (UserPromptSubmit):
```json
{
  "session_id": "abc123",
  "transcript_path": "/path/to/.claude/projects/.../session.jsonl",
  "cwd": "/path/to/project",
  "permission_mode": "default",
  "hook_event_name": "UserPromptSubmit",
  "prompt": "user prompt text here"
}
```

**Hook output** for context injection:
```json
{
  "hookSpecificOutput": {
    "additionalContext": "<xml or plain text context>"
  }
}
```

Key behaviors confirmed:
1. Claude Code captures a **snapshot of hooks at startup** — hook modifications during a session do not take effect mid-session. This is a deliberate security design.
2. `CLAUDE_ENV_FILE` is available in `SessionStart` hooks for persisting environment variables across bash commands within the session.
3. `PreCompact` fires before both manual `/compact` and automatic compaction when context fills — this is the hook event that signals context exhaustion.
4. There is **no hook event that fires between individual turns** other than `UserPromptSubmit`. Hooks cannot observe the LLM's actual token response — they only receive the user's prompt text.

**Critical implication for SYNAPSE:** The Session Bridge has no way to receive actual token counts from Claude Code's API responses through the hook system. The `session_id` and `cwd` are available in the hook input, but Claude Code does not expose its internal token accounting to hooks. SYNAPSE's estimation approach via `prompt_count` is therefore not just a simplification — it is the only option available within the hook constraint.

**Inside Claude Code Session File Format** (databunny.medium.com): Claude Code stores sessions as `.jsonl` files in `~/.claude/projects/{path-hash}/`. Each line is a JSON object representing a turn (human/assistant messages, tool uses, tool results). The `transcript_path` provided in hook input points to this file, which theoretically enables a hook to parse the JSONL and count actual tokens — but this would add significant latency to the hook execution.

### Adaptation to Conversation Progression

Claude Code does not dynamically adapt its system prompt per turn. The `CLAUDE.md` contents and hook outputs are treated as static context that is injected at session start and on every `UserPromptSubmit`. The adaptation in SYNAPSE (bracket-based layer filtering, changing token budgets) is a SYNAPSE-specific innovation not reflected in how Claude Code itself manages context.

---

## Research Question 3: How Hook-Based Systems Maintain State Across Invocations

### Findings

Three categories of hook-based systems were surveyed:

**Git Hooks (`.git/hooks/`):**
- Each hook invocation is a fresh process — zero in-memory state persisted
- State is maintained via: git's own object store, `.git/` files, or external files in the repo
- Pre-commit hooks that need state (e.g., counting staged files across runs) use simple files or git notes
- Pattern: write a temp file, read it next invocation, delete on success
- Tools like `husky` do not add state on top of this — they just normalize hook configuration

**Webpack Plugins (persistent watch mode):**
- Webpack runs as a long-lived process; plugin instances survive across compilations
- Plugin state can be stored in instance variables (in-memory) between `watchRun` events
- For cross-process persistence (e.g., cache invalidation), webpack uses its own binary `.cache/` format
- The `Compilation` object is recreated each build but the `Compiler` instance persists
- Key pattern for cross-invocation state: **the plugin stores a reference in the `Compiler` object**

**VS Code Extensions:**
- Two Memento-based storage APIs: `context.globalState` and `context.workspaceState`
- Key-value store backed by SQLite (`state.vscdb`) under the hood
- `setKeysForSync()` on `globalState` enables cross-machine sync via Settings Sync
- For complex data beyond key-value: `globalStorageUri` / `storageUri` provide safe file URIs
- Extensions that need complex state write JSON files to `globalStorageUri`

**The cross-cutting pattern:** All hook-based systems that need state across invocations converge on one of two approaches:
1. **File-based state** (JSON, binary) keyed by a stable identifier (session UUID, user ID, workspace path)
2. **Process-persistent state** when the system runs as a long-lived daemon (webpack, VS Code)

SYNAPSE correctly chose approach #1 since it runs as a subprocess hook (one process per prompt). The choice of `.synapse/sessions/{uuid}.json` maps exactly to the industry pattern.

---

## Research Question 4: Lightweight Inter-Process State Sharing Patterns

### Findings

For a hook that runs as a short-lived subprocess on every prompt, the IPC options are:

| Method | Latency | Complexity | Cross-Platform | Suitable for SYNAPSE? |
|--------|---------|------------|----------------|----------------------|
| JSON file (current) | ~0.5-2ms read | Low | Yes | Yes (single writer) |
| Atomic JSON + lockfile | ~1-3ms | Medium | Yes | Yes (if multi-writer) |
| Unix domain socket | <0.1ms | High | Unix only | No (subprocess model) |
| Named pipe | <0.1ms | High | Windows + Unix | No (subprocess model) |
| SharedArrayBuffer | <0.01ms | Very High | Same process only | No |
| SQLite WAL | ~1-5ms | Medium | Yes | Overkill for <10KB |
| TCP socket | ~1ms | High | Yes | No (subprocess model) |

**File polling** is the appropriate model here: the hook process reads the session file at startup, processes the prompt, writes the updated session, and exits. No persistent daemon = no socket-based IPC is warranted.

**Node.js IPC performance** (60devs.com): In practice, pipe-based communication and Unix socket performance are nearly identical in Node.js. The bottleneck is serialization/deserialization, not the channel. For a <10KB JSON file, `JSON.parse` on a synchronous `fs.readFileSync` takes approximately 0.1-0.5ms — well within SYNAPSE's 5-second hook timeout.

**write-file-atomic** (npm/write-file-atomic): Used by npm itself for package-lock.json writes. The pattern:
```javascript
// 1. Write to temp file: session-{uuid}-{random}.json.tmp
// 2. fsync() the temp file (ensure OS-level flush)
// 3. rename(tmp, target)  — atomic on POSIX, near-atomic on Windows NTFS
```
`rename()` is atomic on POSIX because it is implemented as a single kernel syscall. On Windows NTFS, it is not guaranteed atomic but is effectively atomic for files under ~4KB due to single-sector writes. For session files (<10KB), this is safe in practice.

**proper-lockfile** (moxystudio/node-proper-lockfile): Uses `mkdir` as an atomic lock primitive (works on network file systems too). Adds ~1-2ms overhead. Appropriate when multiple processes might write the same file simultaneously. For SYNAPSE, since only one hook process runs per session at a time (Claude Code serializes prompts), this is unnecessary overhead.

**The recommendation from the research:** The current `fs.writeFileSync` approach is safe for SYNAPSE's single-writer model. The only concrete risk is partial writes on process crash mid-write (very rare for <10KB). `write-file-atomic` eliminates this risk with minimal complexity.

---

## Research Question 5: SQLite vs JSON for Small State with Frequent Writes

### Findings

This is the most empirically settled question in the research. The verdict:

**For SYNAPSE's specific case (<10KB state, one writer, read-modify-write on every prompt), JSON wins.**

| Criterion | JSON File | SQLite (WAL mode) |
|-----------|-----------|-------------------|
| State size | <10KB | <10KB |
| Read latency | ~0.5ms (sync) | ~1-5ms (open + query) |
| Write latency | ~0.5ms (sync) | ~2-10ms (transaction) |
| Cold start (first open) | Negligible | ~5-15ms (db open + pragma) |
| Human readable | Yes | No (binary) |
| Schema migration | Manual versioning | ALTER TABLE migrations |
| Concurrent readers | Safe (read locks on OS) | Excellent (WAL) |
| Concurrent writers | Unsafe without locking | Excellent (WAL) |
| Dependencies | None (built-in fs) | `better-sqlite3` (native addon) |
| Hook cold start impact | Zero | ~10-15ms for db open |

**The critical factor for SYNAPSE hooks is cold start cost.** The hook is a fresh Node.js process on every prompt. SQLite with `better-sqlite3` requires:
1. Loading a native addon (`.node` file): ~5ms
2. Opening the database file: ~2ms
3. Setting `PRAGMA journal_mode = WAL`: ~1ms
4. Executing the query: ~0.5ms

Total: ~8-18ms cold start vs. ~0.5-2ms for plain JSON `readFileSync + JSON.parse`.

SYNAPSE has a hard hook timeout of 5000ms and a pipeline timeout of 100ms. The `_BOOT_TIME` tracking added in SYN-14 shows awareness of cold start sensitivity. SQLite would consume 8-18% of the 100ms pipeline budget just on database initialization.

**When SQLite becomes appropriate:**
- State exceeds ~1MB (compression advantage becomes significant)
- Multiple concurrent writers (parallel hook processes)
- Complex query patterns (aggregations, time-range queries across all sessions)
- Analytics over session history (already partially served by the diagnostics collectors)

The diagnostics layer (`session-collector.js`, `timing-collector.js`) already reads from JSON files. If analytics queries become complex enough to warrant SQLite, the correct move is to add a separate analytics database (not merge it with the session state file).

**SQLite performance note** (sqlite.org/fasterthanfs.html): SQLite can be faster than the filesystem for certain multi-record queries, but this advantage only emerges at scale (hundreds of records, complex WHERE clauses). For a single JSON object read-modify-write, there is no performance advantage.

---

## Specific Projects and Tools Found

| Project | URL | Relevance |
|---------|-----|-----------|
| Continuous-Claude v3 | [parcadei/Continuous-Claude-v3](https://github.com/parcadei/Continuous-Claude-v3) | Closest real-world hook-based context management with ledger state |
| claude-sessions | [iannuttall/claude-sessions](https://github.com/iannuttall/claude-sessions) | Session tracking via slash commands, simpler alternative pattern |
| write-file-atomic | [npm/write-file-atomic](https://github.com/npm/write-file-atomic) | Atomic write implementation used by npm itself |
| proper-lockfile | [moxystudio/node-proper-lockfile](https://github.com/moxystudio/node-proper-lockfile) | Inter-process lockfile for multi-writer scenarios |
| better-sqlite3 | [WiseLibs/better-sqlite3](https://github.com/WiseLibs/better-sqlite3) | Fastest sync SQLite for Node.js; WAL mode docs included |
| Claude Code Hooks Docs | [code.claude.com/docs/en/hooks](https://code.claude.com/docs/en/hooks) | Authoritative hook input/output format reference |
| Claude Code Internals Part 6 | [kotrotsos.medium.com](https://kotrotsos.medium.com/claude-code-internals-part-6-session-state-management-e729f49c8bb9) | Internal `r0` session state structure analysis |
| Inside Claude Code Session Format | [databunny.medium.com](https://databunny.medium.com/inside-claude-code-the-session-file-format-and-how-to-inspect-it-b9998e66d56b) | .jsonl transcript format that could enable actual token counting |
| Strands Agents Hooks | [strandsagents.com/hooks](https://strandsagents.com/latest/documentation/docs/user-guide/concepts/agents/hooks/) | Multi-framework hook lifecycle comparison |

---

## Code Patterns and Examples

### Pattern A: Atomic JSON Write (Recommended Enhancement)

Current SYNAPSE write (`session-manager.js` line 230):
```javascript
fs.writeFileSync(filePath, JSON.stringify(session, null, 2), 'utf8');
```

Hardened version using write-file-atomic pattern:
```javascript
const tmpPath = filePath + '.' + process.pid + '.tmp';
try {
  fs.writeFileSync(tmpPath, JSON.stringify(session, null, 2), 'utf8');
  fs.renameSync(tmpPath, filePath);  // Atomic on POSIX, safe on NTFS <10KB
} catch (error) {
  // Clean up temp file on failure
  try { fs.unlinkSync(tmpPath); } catch { /* ignore */ }
  throw error;
}
```

Or using the `write-file-atomic` npm package (used by npm itself):
```javascript
const writeFileAtomic = require('write-file-atomic');
writeFileAtomic.sync(filePath, JSON.stringify(session, null, 2), 'utf8');
```

### Pattern B: Actual Context Percent from Transcript (Advanced)

Reading the Claude Code transcript to count actual tokens (trade-off: adds ~2-5ms latency):
```javascript
function estimateContextFromTranscript(transcriptPath, maxContext = 200_000) {
  if (!transcriptPath || !fs.existsSync(transcriptPath)) return null;
  try {
    const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n').filter(Boolean);
    let totalTokens = 0;
    for (const line of lines) {
      const entry = JSON.parse(line);
      if (entry.usage) {
        totalTokens += (entry.usage.input_tokens || 0) + (entry.usage.output_tokens || 0);
      }
    }
    return Math.max(0, 100 - (totalTokens / maxContext * 100));
  } catch {
    return null;  // Fall back to prompt_count estimate
  }
}
```

### Pattern C: Continuous-Claude Ledger Pattern (Reference)

How Continuous-Claude maintains state across sessions via SessionStart hook:
```bash
# .claude/settings.json hook configuration
{
  "hooks": {
    "SessionStart": [{
      "matcher": "",
      "hooks": [{
        "type": "command",
        "command": "node .claude/hooks/session-start.js"
      }]
    }]
  }
}
```

```javascript
// session-start.js — loads ledger into additionalContext
const ledgerPath = `.continuity/CONTINUITY_CLAUDE-${sessionId}.md`;
const handoffDir = `.thoughts/handoffs/${sessionId}/`;
const latestHandoff = getLatestHandoff(handoffDir);
const output = {
  hookSpecificOutput: {
    additionalContext: [readIfExists(ledgerPath), readIfExists(latestHandoff)].join('\n')
  }
};
process.stdout.write(JSON.stringify(output));
```

### Pattern D: Context Bracket Feedback Loop (Current Gap)

Current SYNAPSE engine reads `prompt_count` but does not write back the calculated bracket to the session. A feedback loop would allow bracket state to persist across prompts without recalculation:

```javascript
// In engine.js process(), after calculating bracket:
const bracketUpdates = {
  context: {
    last_bracket: bracket,
    last_context_percent: contextPercent,
    last_tokens_used: promptCount * DEFAULTS.avgTokensPerPrompt,
  }
};
// Currently session is passed in but not updated back to disk by the engine.
// The session update happens externally or not at all.
// Closing this loop would make the context state visible in diagnostics.
```

---

## Relevance to AIOS SYNAPSE Session Bridge

### What the Research Confirms About the Current Design

1. **JSON file per session UUID** — correct and industry-standard for subprocess hook model
2. **24-hour TTL cleanup** — matches the convention used by Claude Code's own session management
3. **Schema versioning (`schema_version: '2.0'`)** — good practice; no surveyed tool does this as explicitly
4. **Synchronous reads/writes** — correct for subprocess model; async would add complexity without benefit
5. **Path traversal sanitization** in `resolveSessionFile()` — not commonly done in surveyed tools; SYNAPSE is ahead here
6. **Gitignore auto-creation** — pragmatic and correct; prevents session state from leaking into commits

### What the Research Identifies as Gaps

1. **Non-atomic writes**: Current `fs.writeFileSync` is not atomic. A process crash between the OS-level `open()` and `write()` syscalls can produce a partially-written, corrupted JSON file. The `loadSession()` function handles this gracefully (catches `SyntaxError`), but the session is then lost rather than recovered.

2. **Estimation vs. actuality**: The `context.last_tokens_used` and `context.last_context_percent` fields exist in the session schema but are not populated by the engine's `process()` call. The engine only reads `session.prompt_count`. The richer fields are never written, making diagnostics less useful.

3. **No engine-side session update**: The `SynapseEngine.process()` method receives a session object but does not write back the calculated bracket or context percentage. The session update cycle is managed by whoever calls `process()` (currently `hook-runtime.js` does not call `updateSession`). This means `last_bracket` in the session always remains `'FRESH'` (the default).

4. **Hook-runtime does not persist session updates**: In `hook-runtime.js`, `session = loadSession(sessionId, sessionsDir) || { prompt_count: 0 }` is loaded but never updated. The `updateSession()` function in `session-manager.js` is never called from the hook path. Session state persists as created by whatever created it, and `prompt_count` never increments through the live hook path.

---

## Prioritized Recommendations

### P0 — Critical: Wire Session Updates in the Hook Runtime

**Finding:** `hook-runtime.js` loads the session but never calls `updateSession()`. As a result, `prompt_count` never increments and bracket calculation always returns `FRESH` regardless of conversation depth.

**Fix:**
```javascript
// In hook-runtime.js, after engine.process():
const { updateSession } = require('.../session-manager.js');
const updatedSession = updateSession(sessionId, sessionsDir, {
  context: {
    last_bracket: result.bracket,  // return bracket from engine
    last_context_percent: result.contextPercent,
    last_tokens_used: result.promptCount * 1500,
  }
});
```

This requires `engine.process()` to return `bracket` and `contextPercent` in addition to `xml` and `metrics`. The `metrics` object already contains all needed data.

**Impact:** Without this fix, the context bracket system does not function as designed. All sessions behave as FRESH regardless of conversation length.

### P1 — High: Add Atomic Writes to Session Manager

**Finding:** `fs.writeFileSync` on a <10KB file is safe in practice but not guaranteed atomic. A process kill during write produces a corrupt session file.

**Fix:** Replace the two `fs.writeFileSync` calls in `session-manager.js` (in `createSession` and `updateSession`) with a temp-file-then-rename pattern, or add `write-file-atomic` as a dependency.

```javascript
// Option A: Zero-dependency atomic write
function atomicWrite(filePath, content) {
  const tmpPath = `${filePath}.${process.pid}.tmp`;
  fs.writeFileSync(tmpPath, content, 'utf8');
  fs.renameSync(tmpPath, filePath);  // atomic on POSIX, NTFS <4KB
}

// Option B: Use write-file-atomic (used by npm itself)
const writeFileAtomic = require('write-file-atomic');
writeFileAtomic.sync(filePath, JSON.stringify(session, null, 2), 'utf8');
```

**Impact:** Eliminates the rare but possible session corruption scenario. Also prevents the double-load/double-write pattern in `updateSession()` where load + modify + write is done without any guard.

### P2 — Medium: Populate `context.last_*` Fields from Engine Output

**Finding:** The session schema has `context.last_bracket`, `context.last_tokens_used`, and `context.last_context_percent` fields but the engine never writes them back. Diagnostics collectors that read session files see stale defaults.

**Fix:** In `engine.process()`, return the calculated values and ensure the hook runtime writes them via `updateSession()`. Also return the bracket from `process()` so callers can use it without re-reading:

```javascript
// engine.js process() return shape:
return {
  xml,
  metrics: summary,
  bracket,           // add this
  contextPercent,    // add this
  promptCount,       // add this
};
```

**Impact:** Enables accurate diagnostics reports, makes the SYNAPSE Diagnostics session-collector show meaningful bracket progression, and sets up for future work on adaptive injection.

### P3 — Low: Consider Transcript-Based Token Estimation (Future)

**Finding:** The `transcript_path` field is available in the Claude Code hook input. Parsing this file would give accurate token counts rather than the linear `prompt_count * 1500` estimate.

**Trade-off:**
- Pro: Accurate bracket calculation, especially for sessions with mixed-length turns
- Con: JSONL parse adds ~2-5ms to cold-start latency; the 100ms pipeline timeout is already tight

**Recommendation:** Implement as an optional enhanced mode, enabled only when `AIOS_DEBUG=true` or via a manifest flag. Keep the prompt_count estimate as the default fast path.

```javascript
// In context-tracker.js or engine.js:
function resolveContextPercent(session, transcriptPath) {
  if (process.env.SYNAPSE_ACCURATE_CONTEXT && transcriptPath) {
    const accurate = estimateContextFromTranscript(transcriptPath);
    if (accurate !== null) return accurate;
  }
  return estimateContextPercent(session.prompt_count || 0);
}
```

**Impact:** Better bracket accuracy for long sessions, at the cost of ~2-5ms additional latency on every prompt.

---

## Summary Table

| Research Question | Key Finding | Confidence |
|-------------------|-------------|------------|
| How AI CLI tools persist context injection state | JSON file per UUID is industry standard; no tool tracks "amount injected" per turn | High |
| Claude Code session management and context adaptation | Hook system cannot observe actual token counts; `prompt_count` estimate is the only available signal | High |
| Hook-based system state across invocations | File-based state keyed by stable ID is universal; process-persistent state only for long-lived daemons | High |
| Lightweight IPC patterns for CLI tools | File polling + JSON is correct for subprocess model; sockets only for daemon model | High |
| SQLite vs JSON for <10KB frequent writes | JSON wins for cold-start CLIs; SQLite adds 8-18ms startup overhead per hook invocation | High |
| Critical implementation gap found | `updateSession()` is never called from the hook runtime — `prompt_count` never increments | Confirmed |

---

## Sources

- [Managing State — Microsoft Agents / DeepWiki](https://deepwiki.com/microsoft/Agents/2.3-managing-state)
- [Context Engineering in Agents — LangChain Docs](https://docs.langchain.com/oss/python/langchain/context-engineering)
- [Context Engineering for Personalization — OpenAI Developers](https://developers.openai.com/cookbook/examples/agents_sdk/context_personalization/)
- [Session Management and History — github/copilot-cli DeepWiki](https://deepwiki.com/github/copilot-cli/3.3-session-management-and-history)
- [Conversation History and Persistence — openai/codex DeepWiki](https://deepwiki.com/openai/codex/3.3-session-management-and-persistence)
- [Claude Code Session Hooks: Auto-Load Context Every Time](https://claudefa.st/blog/tools/hooks/session-lifecycle-hooks)
- [Hooks Reference — Claude Code Docs](https://code.claude.com/docs/en/hooks)
- [Session Persistence — ruvnet/claude-flow Wiki](https://github.com/ruvnet/claude-flow/wiki/session-persistence)
- [Claude Code Internals Part 6: Session State Management](https://kotrotsos.medium.com/claude-code-internals-part-6-session-state-management-e729f49c8bb9)
- [Feature Request: Native Session Persistence — anthropics/claude-code #18417](https://github.com/anthropics/claude-code/issues/18417)
- [Continuous-Claude-v3 — parcadei/Continuous-Claude-v3](https://github.com/parcadei/Continuous-Claude-v3)
- [Continuous-Claude-v2 README](https://github.com/parcadei/Continuous-Claude-v2/blob/main/README.md)
- [claude-sessions — iannuttall](https://github.com/iannuttall/claude-sessions)
- [How Claude Code Works — Claude Code Docs](https://code.claude.com/docs/en/how-claude-code-works)
- [Inside Claude Code: The Session File Format](https://databunny.medium.com/inside-claude-code-the-session-file-format-and-how-to-inspect-it-b9998e66d56b)
- [Communicating Between NodeJS Processes — Medium](https://medium.com/@NorbertdeLangen/communicating-between-nodejs-processes-4e68be42b917)
- [node-ipc — npm](https://www.npmjs.com/package/node-ipc)
- [Performance of IPC in Node.js — 60devs](https://60devs.com/performance-of-inter-process-communications-in-nodejs.html)
- [IPC Performance Comparison — Baeldung on Linux](https://www.baeldung.com/linux/ipc-performance-comparison)
- [Understanding Node.js File Locking — LogRocket](https://blog.logrocket.com/understanding-node-js-file-locking/)
- [write-file-atomic — npm/write-file-atomic](https://github.com/npm/write-file-atomic)
- [proper-lockfile — moxystudio/node-proper-lockfile](https://github.com/moxystudio/node-proper-lockfile)
- [Modern Node.js Patterns for 2025](https://kashw1n.com/blog/nodejs-2025/)
- [When JSON Sucks or The Road To SQLite Enlightenment](https://pl-rants.net/posts/when-not-json/)
- [SQLite: 35% Faster Than The Filesystem](https://sqlite.org/fasterthanfs.html)
- [SQLite Optimizations For Ultra High-Performance — PowerSync](https://www.powersync.com/blog/sqlite-optimizations-for-ultra-high-performance)
- [better-sqlite3 — WiseLibs](https://github.com/WiseLibs/better-sqlite3)
- [better-sqlite3 Performance Docs](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/performance.md)
- [SQLite in Node.js Applications — OneUptime](https://oneuptime.com/blog/post/2026-02-02-sqlite-nodejs/view)
- [VS Code Extension Storage Options — Elio Struyf](https://www.eliostruyf.com/devhack-code-extension-storage-options/)
- [VS Code Extension Storage Explained — Medium](https://medium.com/@krithikanithyanandam/vs-code-extension-storage-explained-the-what-where-and-how-3a0846a632ea)
- [Compiler Hooks — webpack docs](https://webpack.js.org/api/compiler-hooks/)
- [Exploring VS Code Global State — mattreduce](https://mattreduce.com/posts/vscode-global-state/)
- [Hooks — Strands Agents](https://strandsagents.com/latest/documentation/docs/user-guide/concepts/agents/hooks/)
- [Context Engineering for Coding Agents — Martin Fowler](https://martinfowler.com/articles/exploring-gen-ai/context-engineering-coding-agents.html)
