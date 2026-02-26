# Token Usage Source Investigation — NOG-11

**Date:** 2026-02-21
**Investigator:** @architect (Aria)
**Story:** NOG-11 — Token Usage Source Discovery
**Timebox:** 4h (completed in ~1h)

---

## Executive Summary

**Viable source found: JSONL transcript files.** Claude Code persists complete token usage data (`input_tokens`, `output_tokens`, `cache_read_input_tokens`, `cache_creation_input_tokens`) in JSONL transcript files after every assistant response. The `transcript_path` field is provided in every hook input payload, making it accessible from a `Stop` hook.

**Recommended integration:** `Stop` hook + tail-read of JSONL transcript (0.2ms latency).

---

## Source Investigation Results

### Source A: Claude Code Hooks API

**Finding: 15 hook event types exist (not just UserPromptSubmit)**

| Hook Event | Post-Response? | Token Data? |
|------------|---------------|-------------|
| `UserPromptSubmit` | No (pre-prompt) | No |
| `PreToolUse` | No (pre-tool) | No |
| `PostToolUse` | Yes (post-tool) | No |
| `PostToolUseFailure` | Yes (post-tool) | No |
| **`Stop`** | **Yes (post-response)** | **No (but has `transcript_path`)** |
| `SessionStart` | N/A | No |
| `SessionEnd` | N/A | No |
| `SubagentStart` | N/A | No |
| `SubagentStop` | N/A | No |
| `Notification` | N/A | No |
| `PermissionRequest` | N/A | No |
| `PreCompact` | N/A | No |
| `ConfigChange` | N/A | No |
| `TeammateIdle` | N/A | No |
| `TaskCompleted` | N/A | No |

**Key discovery:** The `Stop` hook fires after Claude finishes responding. Its payload includes:
```json
{
  "session_id": "abc123",
  "transcript_path": "~/.claude/projects/.../transcript.jsonl",
  "hook_event_name": "Stop",
  "stop_hook_active": false,
  "last_assistant_message": "..."
}
```

The `transcript_path` field is the critical link — it provides the exact file path to read token data from.

**Verdict: VIABLE (via Stop hook + transcript_path)**

### Source B: JSONL Transcripts

**Finding: Token usage data IS present in every assistant message**

Location: `~/.claude/projects/{project-slug}/{session-uuid}.jsonl`

Structure per assistant line:
```json
{
  "type": "assistant",
  "message": {
    "model": "claude-opus-4-6",
    "usage": {
      "input_tokens": 1,
      "output_tokens": 318,
      "cache_creation_input_tokens": 533,
      "cache_read_input_tokens": 144500,
      "cache_creation": {
        "ephemeral_5m_input_tokens": 0,
        "ephemeral_1h_input_tokens": 533
      },
      "service_tier": "standard"
    }
  },
  "timestamp": "2026-02-21T17:22:09.706Z"
}
```

**Available fields per assistant message:**

| Field | Description | Typical Values |
|-------|-------------|---------------|
| `input_tokens` | Non-cached input tokens | 1-100 (mostly 1-3 with caching) |
| `output_tokens` | Generated output tokens | 25-5000+ |
| `cache_creation_input_tokens` | Tokens written to cache | 0-15000+ |
| `cache_read_input_tokens` | Tokens read from cache | 0-150000+ |
| `service_tier` | Service tier | "standard" |

**Aggregation from real sessions:**

| Session | File Size | Assistant Messages | Total input_tokens | Total cache_read | Effective Context |
|---------|-----------|-------------------|--------------------|-----------------|-------------------|
| Session A (4.5MB) | 4.48 MB | 277 | 28,733 | 30,075,415 | 30,104,148 |
| Session B (13MB) | 13.07 MB | ~800+ | 32,080 | 133,514,559 | 133,546,639 |

**Critical insight:** `input_tokens` alone is misleading — actual context window usage is `input_tokens + cache_read_input_tokens`. The cache_read value represents tokens that were in the context but served from cache. For bracket calculation, the relevant metric is the **last** `cache_read_input_tokens` value, which represents how much context Claude "saw" in the most recent turn.

**Verdict: CONFIRMED — rich token data available**

### Source C: Session Metadata

**Finding: No sessions directory exists**

```
~/.claude/projects/{project-slug}/sessions/ → Does not exist
```

Claude Code does not persist session metadata in a separate sessions directory. Session state is embedded within the JSONL transcript files themselves.

**Verdict: NOT VIABLE (path does not exist)**

### Source D: Hook Input Payload

**Finding: All hooks receive `transcript_path`**

Common fields available in every hook input:

| Field | Description |
|-------|-------------|
| `session_id` | Current session UUID |
| `transcript_path` | Full path to session JSONL file |
| `cwd` | Current working directory |
| `permission_mode` | Current permission mode |
| `hook_event_name` | Event type name |

The `transcript_path` field was not previously documented in our hook input usage. This is the bridge between hooks and token data.

**Verdict: VIABLE — transcript_path provides file access**

---

## Performance Benchmark

### JSONL Reading Latency

| Method | 4.5 MB file | 13 MB file | Description |
|--------|-------------|------------|-------------|
| Full parse (all messages) | 47ms | 75ms | Read entire file, parse all lines, sum tokens |
| **Tail read (last 50KB)** | **0.27ms** | **0.19ms** | Read last 50KB, find last assistant usage |

**Tail read (Method 2)** easily meets the 100ms requirement. At 0.2ms it adds negligible overhead.

### Why Tail Read Works

- JSONL files are append-only — newest entries are at the end
- The last assistant message contains the most recent usage data
- 50KB tail captures 5-10 complete assistant messages (more than enough)
- Even for 50MB+ transcripts, tail read remains O(1) — constant 50KB buffer

---

## Integration Design

### Recommended Architecture: Stop Hook + Tail Read

```
Claude responds → Stop hook fires → Read transcript_path (tail 50KB)
  → Parse last assistant message → Extract usage
  → updateSessionMetrics(sessionId, dir, { last_tokens_used, last_output_tokens, last_cache_read })
  → Available for next UserPromptSubmit bracket calculation
```

### Timing Flow

```
T0: User submits prompt
T1: UserPromptSubmit fires → synapse-engine.cjs → bracket from PREVIOUS data
T2: Claude processes (API call, tool use, etc.)
T3: Claude finishes responding
T4: Stop hook fires → read transcript → extract usage → updateSessionMetrics()
T5: Next prompt → UserPromptSubmit → bracket from REAL data (T4's write)
```

**Key insight:** Token data is available "one turn behind" — the Stop hook after turn N provides data that the UserPromptSubmit hook uses for turn N+1. This is architecturally sound because:
- Turn 1 uses estimation (FRESH bracket anyway)
- Turn 2+ uses real data from previous turn
- The estimation gap is only 1 turn, not the entire session

### Implementation Components

```
.claude/hooks/
  synapse-token-collector.cjs     # NEW: Stop hook — tail-read transcript, update session

.claude/settings.local.json      # ADD: Stop hook registration (settings.local.json is the real file in this repo)

.aios-core/core/synapse/
  session/session-manager.js      # TARGET: new updateSessionMetrics() function (no prompt_count increment, per Codex C1)
  context/context-tracker.js      # MODIFY: Use last_tokens_used if available, fallback to estimate
```

### Effort Estimate

| Component | Effort | Risk |
|-----------|--------|------|
| Stop hook (synapse-token-collector.cjs) | 1-2h | Low — follows existing hook pattern |
| Settings.json Stop hook registration | 5min | None |
| context-tracker.js conditional logic | 30min | Low — add if/else for real vs estimated |
| Tests | 2-3h | Medium — mock JSONL, test tail read |
| **Total** | **4-6h** | **Low** |

### Data Flow Detail

**synapse-token-collector.cjs (new Stop hook):**
```javascript
// Pseudocode
const input = readStdin(); // { transcript_path, session_id, cwd }
const usage = tailReadLastUsage(input.transcript_path, 50000);
if (usage) {
  updateSessionMetrics(input.session_id, sessionsDir, {
    context: {
      last_tokens_used: usage.input_tokens + usage.cache_read_input_tokens,
      last_output_tokens: usage.output_tokens,
      last_cache_read: usage.cache_read_input_tokens
    }
  });
}
```

**context-tracker.js (modified):**
```javascript
function estimateContextPercent(session, maxContext) {
  // If real token data available (from Stop hook), use it
  if (session.context && session.context.last_tokens_used > 0) {
    return 100 - (session.context.last_tokens_used / maxContext * 100);
  }
  // Fallback to estimation (existing QW-3 logic)
  const estimated = session.prompt_count * AVG_TOKENS_PER_PROMPT * XML_SAFETY_MULTIPLIER;
  return 100 - (estimated / maxContext * 100);
}
```

---

## Decision

**GO — Proceed with implementation.**

A reliable token source has been found (JSONL transcripts via Stop hook). The integration is low-risk, low-effort, and architecturally clean.

### Why This Works

1. **Data is already there** — Claude Code writes token usage to JSONL after every response
2. **Hook exists** — `Stop` fires post-response with `transcript_path`
3. **Fast** — Tail read at 0.2ms, well under 100ms threshold
4. **Reliable** — JSONL is append-only, always available, high reliability expected (confirmed in 2 sessions; broader validation per C4)
5. **Non-blocking** — Fire-and-forget pattern (same as QW-1's updateSession)
6. **Backward compatible** — Falls back to QW-3 estimation if no real data

### Risks

| Risk | Mitigation |
|------|-----------|
| `transcript_path` not available in Stop hook | Fallback to estimation — zero impact |
| JSONL format changes | Parse defensively with try/catch |
| Large JSONL files | Tail read is O(1) — always reads last 50KB |
| Stop hook timeout | 5s safety timeout (same as UserPromptSubmit) |

---

## Appendix: Alternative Considered — OTEL Pipeline

Claude Code has OpenTelemetry configured (`OTEL_METRICS_EXPORTER: console`). An `api_request` event includes token counts. However, OTEL exports to console stdout — intercepting this from a hook would require process-level I/O redirection. The JSONL approach is simpler and more reliable.

**Decision:** JSONL transcript > OTEL for this use case.
