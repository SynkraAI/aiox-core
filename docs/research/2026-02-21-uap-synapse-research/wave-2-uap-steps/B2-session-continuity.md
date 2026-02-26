# B2 — Session Continuity Detection (ContextDetector)

**Research Date:** 2026-02-21
**Story:** NOG-9 — UAP & SYNAPSE Deep Research
**Wave:** 2 — UAP Steps
**Researcher:** Tech Search Agent (Claude Sonnet 4.6)

---

## Executive Summary

Session continuity detection in AI coding assistants has converged on two primary mechanisms: **explicit flag-based resumption** (user must opt-in with `--continue`/`--resume`) and **implicit directory-scoped detection** (sessions automatically tied to working directory). No major tool performs true automatic session-type inference; they all rely on user intent signals or persistent file presence. The AIOS ContextDetector's hybrid approach (conversation history + file-based TTL) is architecturally sound but can be significantly enhanced by adopting patterns from industry leaders, particularly: composite context keys (git repo + branch + cwd), more granular `workflow_in_progress` state markers, and crash-detection heuristics.

---

## Research Question 1: How AI Coding Assistants Detect Conversation Continuity

### Claude Code

Claude Code uses a **directory-encoded session file** system as its primary session scoping mechanism.

**Storage Architecture:**
- Sessions stored at `~/.claude/projects/{url-encoded-project-path}/{session-uuid}.jsonl`
- Path encoding: `/home/alice/code/project` → `-home-alice-code-project`
- Global index at `~/.claude/history.jsonl` (prompt text, timestamp, project path, session ID per line)
- SQLite database at `~/.claude/` for metadata (Sessions table: session_id, timestamp, model, working_directory)

**Session Type Detection:**
Claude Code does NOT automatically detect "new vs existing" — it requires explicit user intent:
- No flag (default): Always creates a new session with a fresh UUID
- `--continue` / `-c`: Reads `~/.claude/projects/[encoded-cwd]/` and loads the most recent JSONL as "existing"
- `--resume <id>` / `-r <id>`: Loads a specific session UUID, enabling "forked" sessions
- `--resume` (no arg): Opens interactive session picker showing recent sessions from same git repo including worktrees

**Key Implementation Detail:** A symlink called `latest` in the project directory points to the most recent session, enabling `--continue` to work without scanning files.

**Continuity Signals Used:**
- Working directory (primary key)
- Git branch metadata (stored in session `.claude.json`)
- Session UUID (explicit continuation target)
- Timestamp ordering (for "latest" selection)

**Known Limitations:**
- No automatic resumption — user must always pass a flag
- Moving a directory breaks session association
- No "workflow in progress" detection — that context is lost between invocations
- Feature request open (Issue #19364) for session lock files to detect active sessions via PID

Sources:
- [Claude Code Session Management — DeepWiki](https://deepwiki.com/anthropics/claude-code/2.4-session-management)
- [Claude Code Session Control Flags — DeepWiki](https://deepwiki.com/FlorianBruniaux/claude-code-ultimate-guide/14.1-session-control-flags)
- [Claude Code --continue after Directory mv — GitHub Gist](https://gist.github.com/gwpl/e0b78a711b4a6b2fc4b594c9b9fa2c4c)
- [Claude Code Internals — Milvus Blog](https://milvus.io/es/blog/why-claude-code-feels-so-stable-a-developers-deep-dive-into-its-local-storage-design.md)

### Gemini CLI

Gemini CLI uses a **project hash based on root directory** for automatic session scoping.

**Storage Architecture:**
- Sessions stored at `~/.gemini/tmp/<project_hash>/chats/`
- Project hash derived from project root directory (exact algorithm not documented publicly)
- When directory changes, Gemini automatically switches to that project's session history
- Full state captured: prompts, responses, tool executions, token usage, reasoning summaries

**Session Type Detection:**
Like Claude Code, Gemini CLI requires user opt-in for resumption:
- Default: New session created automatically
- `gemini --resume`: Interactive browser (chronologically sorted with search)
- `gemini --resume <N>`: Resume by index
- `gemini --resume <UUID>`: Resume by specific session UUID
- `/resume` slash command: In-session picker

**Key Differentiator:** Gemini automatically saves all sessions in the background without user action and switches context when directories change — making it the closest to "ambient session persistence."

Sources:
- [Gemini CLI Session Management — Google Developers Blog](https://developers.googleblog.com/pick-up-exactly-where-you-left-off-with-session-management-in-gemini-cli/)
- [Session Management — Gemini CLI Docs](https://geminicli.com/docs/cli/session-management/)

### GitHub Copilot CLI

Copilot CLI stores sessions at `~/.copilot/session-state/` (v0.0.342+), with legacy support for `~/.copilot/history-session-state/`.

**Session Type Detection:**
- New session: `/new` or `/clear` commands, or launch without `--resume`
- Existing session: `--resume` (picker) or `--resume <uuid>` (direct)
- Checkpoint system for rollback via `Esc Esc` (rewind to checkpoint)
- Compaction triggered at 95% token utilization (preserves tool sequences + reasoning summaries)

**Tracked Metadata:**
- Conversation history, tool call records, permission cache, parallel execution queue, MCP server connections, shell process tracking

Sources:
- [Session State Management — GitHub Copilot CLI DeepWiki](https://deepwiki.com/github/copilot-cli/6.4-session-state-management)

### Codex CLI (OpenAI)

Codex CLI uses **UUIDv7-based ThreadId** as session identity.

**Storage Architecture:**
- JSONL rollout files in `$CODEX_HOME/sessions/<thread_id>.jsonl`
- Metadata: model, working directory, timestamp
- Event messages: turn started/completed, agent responses
- Response items: user messages, function calls, tool outputs
- Default history at `~/.codex/history.jsonl` with configurable `history.max_bytes`

**Session Type Detection:**
- New session: `Codex::spawn()` creates fresh ThreadId
- Existing session: Loaded via `RolloutRecorder::resume()`
- TUI shows session resume picker on `Ctrl+R`
- CLI: `codex resume <thread_id>` or `codex resume --last`
- **Rollout file existence = existing conversation** (binary check)
- Conversation history reconstructed by **replaying JSONL events** in sequence

Sources:
- [Conversation History and Persistence — OpenAI Codex DeepWiki](https://deepwiki.com/openai/codex/3.3-session-management-and-persistence)
- [Codex CLI Features — OpenAI Developers](https://developers.openai.com/codex/cli/features/)

### Aider

Aider takes a fundamentally different approach — **no explicit session management**.

**Session Handling:**
- Maintains `.aider.chat.history.md` (Markdown chat transcript, read-only for humans)
- Maintains `.aider.input.history` (command input history)
- These files are in the project directory (git-root scoped by default)
- No `--resume` mechanism — each invocation starts fresh
- `/clear` command clears in-session history only
- Automatic git commits per change (creates an implicit audit trail)
- Repository map feature analyzes codebase at startup for context

**Session Type Detection:** None. Aider treats every invocation as new. Context is re-established through the git repository map, not stored conversation history.

Sources:
- [Aider Git Integration](https://aider.chat/docs/git.html)
- [Aider FAQ](https://aider.chat/docs/faq.html)
- [More control over chat history — Aider GitHub Issue #3607](https://github.com/Aider-AI/aider/issues/3607)

### Cursor IDE

Cursor uses a **workspace-based persistence model**.

**Session Handling:**
- Session data stored in `.cursor/` (project-scoped)
- Memory persists across chats via underlying MCP server when a "memory project" is set
- `@Past Chats` and `@Recent Changes` references for continuity within tasks
- Project Rules (`.cursor/rules/*.md`) persist as "constitution" across sessions
- Automatic context window pruning when limit reached

**Session Type Detection:** Not automatic. Users must explicitly reference past chats. No built-in "new vs returning" detection.

**Known Issue:** Cursor can create duplicate workspaces for same folder, generating a new workspace ID and orphaning old conversations.

**Feature Request (Issue #3846):** Automatic session resumption proposed — store chat ID in project root, prompt "Resume previous session? (Y/n)" on next run.

Sources:
- [Mastering Context Management in Cursor](https://stevekinney.com/courses/ai-development/cursor-context)
- [Feature Request: Automatic Session Resumption — Cursor GitHub #3846](https://github.com/cursor/cursor/issues/3846)

---

## Research Question 2: Mechanisms for Session Type Inference in CLI Tools

### Hash-Based Mechanisms

**Directory-Path Hashing (Claude Code, Gemini CLI):**
```
session_key = encode(absolute_working_directory)
# Claude Code: replace "/" with "-"
# Gemini CLI: hash(project_root_directory)
```
Used for: scoping sessions to project without collision.

**Session UUID Generation:**
```javascript
// Claude Code pattern
sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

// Codex CLI: UUIDv7 (time-ordered UUID)
threadId = uuidv7()  // Contains embedded timestamp for chronological ordering
```

**Composite Session Key (VentureCrane pattern — most sophisticated found):**
```javascript
sessionKey = `${agentName}:${projectCode}:${gitRepoPath}`
// → sess_<ULID>
// Liveness: checked via heartbeat (10min ±2min jitter)
// Timeout: 45 minutes idle → session considered expired
```

### Time-Based Mechanisms

**TTL / Idle Timeout Approaches:**

| Tool/System | Timeout | Behavior |
|---|---|---|
| AIOS ContextDetector (current) | 1 hour | File-based TTL check |
| VentureCrane Multi-Agent | 45 minutes | Heartbeat + server-side jitter |
| OWASP recommendation | 15-30 min (low risk) | Security standard |
| `git time-stats` tool | 30 minutes | Configurable `session-gap` param |
| Claude Code (crash detection) | 30 minutes | `CRASH_THRESHOLD_MINUTES` |

**Sliding Expiry Pattern (best practice):**
```javascript
// Reset TTL on every activity signal
lastActivity = Date.now()
// Expire only if no activity for N minutes
isExpired = (Date.now() - lastActivity) > SESSION_TTL
```

### Process ID-Based Mechanisms

**Lock File Pattern (proposed for Claude Code, Issue #19364):**
```json
{
  "pid": 12345,
  "startedAt": "2025-01-19T10:30:00Z",
  "sessionId": "session-abc123",
  "cwd": "/Users/user/myproject"
}
```

**PID Liveness Check:**
```typescript
function isProcessAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);  // Signal 0 = existence check, no actual signal
    return true;
  } catch {
    return false;  // ESRCH: process not found
  }
}
```

**Used by:** npm, yarn, database systems (standard Unix pattern). Not yet implemented in major AI coding assistants.

### File Lock Mechanisms

Claude Code uses `~/.claude/tasks/.lock` file to prevent write conflicts when multiple instances modify tasks simultaneously. Not used for session type detection, but the pattern is established in the codebase.

Sources:
- [Add session lock file — Claude Code GitHub Issue #19364](https://github.com/anthropics/claude-code/issues/19364)
- [File locking in Linux](https://gavv.net/articles/file-locks/)
- [Entire CLI: Git Observability Tool for AI Code Sessions](https://www.techedubyte.com/entire-cli-git-observability-tool-ai-code-sessions/)

---

## Research Question 3: How Claude Code Handles Session Resumption Internally

### Internal Data Flow

Based on the available reverse-engineering and documentation:

1. **Session Startup:**
   ```
   Launch → Determine mode (new/continue/resume)
   → Generate/load sessionId (UUID)
   → Store cwd as originalCwd + cwd (tracked separately)
   → Initialize r0 global state object (nervous system of agent loop)
   ```

2. **Session Storage (per turn):**
   ```
   ~/.claude/projects/{encoded-cwd}/{session-id}.jsonl
   Each line = one event:
     { role, content, timestamp, session_id, parent_uuid, cwd }
   ```

3. **`--continue` Flow:**
   ```
   Read cwd → encode path → find ~/.claude/projects/{encoded-cwd}/
   → Follow 'latest' symlink → load JSONL → reconstruct conversation
   → Restore: full history, tool results, permission decisions, git branch, cwd
   ```

4. **`--resume` Flow:**
   ```
   Open picker showing sessions from same git repo (including worktrees)
   OR direct UUID lookup → load specific JSONL → reconstruct
   → Option: fork=false (continue original) OR fork=true (new branch)
   ```

### Data Persisted Between Sessions

| Data Category | Persisted? | Location |
|---|---|---|
| Full conversation history | Yes | session JSONL |
| Tool execution results | Yes | session JSONL |
| Permission decisions (auto-allow) | Yes | session JSONL |
| Git branch association | Yes | `.claude.json` metadata |
| Working directory | Yes | session JSONL per message |
| MCP server connections | Yes (reconnected) | session metadata |
| Background task state | Yes | `tasks.json` |
| Context window contents | Yes | `context.json` |
| Custom system prompts | Yes (unless overridden) | session metadata |
| Agent flag specifications | Yes | session metadata |

### Context Compaction

Auto-compaction triggers at **80% of token limit** (Claude Code) or **95%** (Copilot CLI), summarizing older conversation portions to maintain continuity within context window limits.

### Known Bugs in Resumption (as of 2026-02)

- `--resume` fails to maintain context after hitting usage/context limits (Issue #3138)
- Resume feature doesn't preserve conversation context in some cases (Issue #15837)
- Concurrent sessions can block each other (Issue #13352)
- Unbounded session file growth from verbose command output causes OOM (Issue #21179)

Sources:
- [Claude Code Session Management — DeepWiki](https://deepwiki.com/anthropics/claude-code/2.4-session-management)
- [Session Management — DeepWiki FlorianBruniaux Guide](https://deepwiki.com/FlorianBruniaux/claude-code-ultimate-guide/12.1-session-management)
- [Claude Code Session Management — Steve Kinney](https://stevekinney.com/courses/ai-development/claude-code-session-management)
- [Local Session History Issue — GitHub #12646](https://github.com/anthropics/claude-code/issues/12646)

---

## Research Question 4: Best Practices for "Returning User in Same Context" Detection

### Context Equivalence Signals (ranked by reliability)

| Signal | Reliability | Cost | Notes |
|---|---|---|---|
| Git repo path (remote URL or `.git` dir hash) | Very High | Low | Survives directory renames |
| Git branch name | High | Low | Indicates task context |
| Working directory absolute path | High | Low | Fast, simple |
| Idle time gap | Medium | Low | Context degradation proxy |
| Git commit SHA (HEAD) | Medium | Low | Detect code advancement |
| Active workflow state file | Medium | Low | `.aios/session-state.json` present |
| PID liveness check | Medium | Low | Detects crashed vs graceful exit |
| Conversation history length | Low | Low | Not reliable for type inference alone |

### Industry-Observed Thresholds

**Time gap heuristics for "same context":**
- **< 30 minutes:** Almost certainly same context, greeting unnecessary
- **30 min — 2 hours:** Likely same context, brief recap helpful
- **2 — 8 hours:** Work session boundary (e.g., lunch break), context refresh recommended
- **> 8 hours / different calendar day:** Treat as new context, full activation appropriate

### VentureCrane Multi-Agent System (Best Pattern Found)

The most sophisticated "returning user" detection found in research:

```javascript
// Start-of-Day (SOD) Logic
async function detectSessionType(agentName, projectCode, repoPath) {
  // Composite key lookup
  const sessionKey = `${agentName}:${projectCode}:${repoPath}`;
  const existingSession = await db.query('SELECT * FROM sessions WHERE key = ?', sessionKey);

  if (!existingSession) {
    return { type: 'new', session: await createSession(sessionKey) };
  }

  // Liveness check via heartbeat timestamp
  const idleMinutes = (Date.now() - existingSession.lastHeartbeat) / 60000;

  if (idleMinutes > 45) {
    return { type: 'new', session: await createSession(sessionKey) };
  }

  // Load structured handoff
  const handoff = await loadLastHandoff(existingSession.id);
  // handoff contains: accomplished, in_progress, blocked, next_steps

  return { type: 'existing', session: existingSession, handoff };
}
```

**Dual-write handoff pattern:**
- API-backed: SHA-256 hashed JSON in D1 database (queryable)
- Git-backed: Human-readable Markdown committed to `docs/handoffs/AGENT.md`

### Git-Based Context Detection

**Branch prefix convention** (VentureCrane):
```
dev/{hostname}/{task-description}
# Example: dev/workstation-1/fix-auth
```
Allows detecting:
1. Which agent was working on what
2. Resume if branch still exists and matches
3. New session if branch changed

**Entire CLI (ex-GitHub CEO tool) — Git Observability:**
Captures: which branches agents work on, what changes they make, how actions relate to project objectives. Provides contextual awareness for session detection from git activity.

Sources:
- [How We Built an Agent Context Management System — VentureCrane](https://venturecrane.com/articles/agent-context-management-system/)
- [Entire CLI: Git Observability Tool](https://www.techedubyte.com/entire-cli-git-observability-tool-ai-code-sessions/)
- [Session Management — Claude Agent SDK](https://platform.claude.com/docs/en/agent-sdk/sessions)

---

## Research Question 5: Multi-Agent Frameworks and Last Active Agent Tracking

### OpenAI Agents SDK

Sessions are **agent-agnostic** in the OpenAI SDK — multiple agents share the same session and see the same conversation history. No built-in tracking of which agent was last active.

```python
from openai.agents import query, SQLiteSession

session = SQLiteSession("user_12345")  # Or Redis, SQLAlchemy, etc.

# Any agent can run against this session
async for msg in query(prompt="Continue...", session=session):
    print(msg)
# History is shared; last_agent not tracked
```

Persistence backends: SQLiteSession, AsyncSQLiteSession, RedisSession, SQLAlchemySession, EncryptedSession, OpenAIConversationsSession.

Sources:
- [Sessions — OpenAI Agents SDK](https://openai.github.io/openai-agents-python/sessions/)

### Google ADK (Agent Development Kit)

ADK sessions use `lastUpdateTime` as activity signal. State is a scratchpad updated per event. No built-in "last active agent" tracking — agent identity must be injected into state manually.

```python
# ADK pattern for tracking last agent
session.state['last_executor'] = 'dev'  # manual injection
session.state['current_workflow_phase'] = 'implementation'
event = Event(actions=EventActions(state_delta={
    'last_executor': '@dev',
    'workflow_phase': 'qa-gate'
}))
await session_service.append_event(session, event)
```

Sessions identified by: `id` (unique thread), `app_name`, `userId`.
Context handoff uses `include_contents` parameter to control what sub-agents inherit.

Sources:
- [Session: Tracking Individual Conversations — Google ADK Docs](https://google.github.io/adk-docs/sessions/session/)

### LangGraph

LangGraph is the most explicit about state + agent tracking:

```python
# thread_id = session identity
config = {"configurable": {"thread_id": "user-123"}}

# MemorySaver = in-thread persistence
# InMemoryStore = cross-thread
# State carries explicit agent/phase info
state = {
    "current_agent": "dev",
    "workflow_phase": "implementation",
    "last_checkpoint": "..."
}
graph.invoke(input, config)

# Resume from checkpoint
events = graph.get_state_history(config)
# → returns all checkpoints, allowing rewind to any state
```

Key feature: **checkpoint-based state history** — every state transition is recorded, enabling deterministic session replay and explicit "where was I" detection.

Sources:
- [Designing Multi-Agent Workflows with LangGraph and CrewAI](https://digitalthoughtdisruption.com/2025/08/05/multi-agent-langgraph-crewai-workflows/)

### CrewAI

CrewAI tracks state through task handoffs. Context is implicitly preserved via:
- ChromaDB vectors for short-term memory
- SQLite for task results
- Entity memory via embeddings

No explicit "last active agent" mechanism — context flows through task output passing between agents.

### AIOS SessionState (Current Implementation)

AIOS already tracks `last_executor` in `context_snapshot`:

```yaml
# docs/stories/.session-state.yaml
session_state:
  context_snapshot:
    last_executor: "@dev"      # Last agent to act
    executor_distribution:
      "@dev": 5
      "@qa": 2
    branch: "feat/epic-nogic"
  workflow:
    current_phase: "implementation"
  last_action:
    type: "PHASE_CHANGE"
    timestamp: "2026-02-21T10:30:00Z"
    story: "NOG-7"
    phase: "qa-gate"
```

This is **more sophisticated than most frameworks** — but the ContextDetector does not read `session-state.yaml`. It reads `.aios/session-state.json` (a different, simpler file). This gap represents the primary improvement opportunity.

---

## Current AIOS ContextDetector Analysis

### What Exists (`.aios-core/core/session/context-detector.js`)

```javascript
// Current Detection Logic Summary:
detectSessionType(conversationHistory, sessionFilePath):
  if (conversationHistory.length > 0):
    → _detectFromConversation(history)
       - Extract *command patterns from last 10 messages
       - Pattern match against known workflows:
           story_development: ['validate-story-draft', 'develop', 'review-qa']
           epic_creation: ['create-epic', 'create-story', 'validate-story-draft']
           backlog_management: ['backlog-review', ...]
       - ≥2 matches → 'workflow', else → 'existing'
  else:
    → _detectFromFile(sessionFilePath = '.aios/session-state.json')
       - File missing → 'new'
       - TTL check: (now - lastActivity) > 1 hour → 'new'
       - workflowActive && lastCommands.length > 0 → 'workflow'
       - lastCommands.length > 0 → 'existing'
       - else → 'new'
```

### Gaps Identified

| Gap | Impact | Complexity to Fix |
|---|---|---|
| Does not read `session-state.yaml` (the richer source) | High | Low |
| No git branch change detection | Medium | Low |
| No PID-based liveness check | Medium | Medium |
| No crash detection integration | Medium | Low (already exists in SessionState) |
| No last-executor tracking in session type result | Medium | Low |
| TTL is binary (1hr hard cutoff, no gradation) | Low | Low |
| Workflow pattern matching is shallow (only 2 matches required) | Low | Low |
| No context fingerprint (git repo identity) | Medium | Low |

---

## Prioritized Recommendations for AIOS ContextDetector

### P0 — Critical (Implement Immediately)

**P0.1: Bridge ContextDetector to SessionState**

The `SessionState` class (`session-state.js`) already tracks `last_executor`, `workflow.current_phase`, `last_action`, `context_snapshot.branch` — but ContextDetector reads a different, simpler file. Bridge these:

```javascript
// Enhanced _detectFromFile()
_detectFromFile(sessionFilePath) {
  // 1. Check rich session-state.yaml first
  const richState = this._loadSessionStateYaml();
  if (richState) {
    const crashInfo = await sessionState.detectCrash();
    if (crashInfo.isCrash) return 'workflow';  // crash = in-progress workflow
    if (richState.workflow.current_phase) return 'workflow';
    if (richState.progress.stories_done.length > 0) return 'existing';
  }

  // 2. Fall back to simple JSON check
  return this._detectFromSimpleJson(sessionFilePath);
}
```

**P0.2: Return Richer Session Context Object**

Instead of returning a string `'workflow'`, return an object with last-executor and phase:

```javascript
// Current: returns 'workflow'
// Proposed: returns { type: 'workflow', lastExecutor: '@dev', phase: 'qa-gate', story: 'NOG-7' }
detectSessionType(history, filePath) {
  return {
    type: 'new' | 'existing' | 'workflow',
    lastExecutor: string | null,
    lastPhase: string | null,
    currentStory: string | null,
    idleMinutes: number,
    contextBranch: string | null,
  };
}
```

### P1 — High Priority

**P1.1: Add Git Branch Change Detection**

If the current git branch differs from `context_snapshot.branch` in session state, the context has changed — treat as new or flag as "context mismatch":

```javascript
async _detectGitContext() {
  try {
    const { execSync } = require('child_process');
    const branch = execSync('git branch --show-current', {
      cwd: process.cwd(), stdio: ['pipe', 'pipe', 'ignore']
    }).toString().trim();
    const repoPath = execSync('git rev-parse --show-toplevel', {
      cwd: process.cwd(), stdio: ['pipe', 'pipe', 'ignore']
    }).toString().trim();
    return { branch, repoPath };
  } catch {
    return { branch: null, repoPath: null };
  }
}

// Use in detection:
// if (savedBranch && currentBranch && savedBranch !== currentBranch) → context mismatch
```

**P1.2: Add Crash Detection to ContextDetector**

The `SessionState.detectCrash()` method already exists with a 30-minute threshold. ContextDetector should call it:

```javascript
async detectSessionTypeAsync(history, sessionFilePath) {
  const sessionState = createSessionState(process.cwd());
  const state = await sessionState.loadSessionState();

  if (state) {
    const crashInfo = await sessionState.detectCrash();
    if (crashInfo.isCrash) {
      return { type: 'workflow', crashed: true, ...crashInfo };
    }
    if (state.session_state.workflow.current_phase) {
      return { type: 'workflow', crashed: false, ...summary };
    }
  }
  // fallback to existing logic...
}
```

**P1.3: Tiered Idle Timeout**

Replace binary 1-hour TTL with graduated response:

```javascript
const IDLE_TIERS = [
  { maxMinutes: 30, type: null },           // < 30min: keep existing type
  { maxMinutes: 120, type: 'existing' },    // 30-120min: treat as existing (not workflow)
  { maxMinutes: 480, type: 'existing' },    // 2-8hrs: existing but recommend recap
  { maxMinutes: Infinity, type: 'new' },    // > 8hrs: new session
];

function getTypeByIdle(idleMs) {
  const idleMin = idleMs / 60000;
  return IDLE_TIERS.find(t => idleMin < t.maxMinutes);
}
```

### P2 — Medium Priority

**P2.1: PID-Based Lock File for Active Session Detection**

Following the proposed Claude Code pattern (Issue #19364), write a lock file on activation and clean on graceful exit:

```javascript
// On AIOS activation:
const lockFile = path.join(process.cwd(), '.aios', 'session.lock');
fs.writeFileSync(lockFile, JSON.stringify({
  pid: process.pid,
  startedAt: new Date().toISOString(),
  sessionId: currentSessionId,
  branch: currentBranch
}));

// On exit:
process.on('exit', () => fs.unlinkSync(lockFile));
process.on('SIGINT', () => { fs.unlinkSync(lockFile); process.exit(); });

// In ContextDetector:
_checkActiveLockFile() {
  const lockFile = path.join(process.cwd(), '.aios', 'session.lock');
  if (!fs.existsSync(lockFile)) return null;
  const lock = JSON.parse(fs.readFileSync(lockFile));
  try {
    process.kill(lock.pid, 0);  // liveness check
    return { active: true, pid: lock.pid, since: lock.startedAt };
  } catch {
    fs.unlinkSync(lockFile);  // stale lock cleanup
    return { active: false, stale: true };
  }
}
```

**P2.2: Composite Context Key (Context Fingerprint)**

Generate a fingerprint combining git remote + branch + cwd for robust session identity:

```javascript
_generateContextFingerprint() {
  try {
    const { execSync } = require('child_process');
    const remote = execSync('git remote get-url origin', { stdio: ['pipe', 'pipe', 'ignore'] })
      .toString().trim();
    const branch = execSync('git branch --show-current', { stdio: ['pipe', 'pipe', 'ignore'] })
      .toString().trim();
    const cwd = process.cwd();
    const raw = `${remote}:${branch}:${cwd}`;
    return require('crypto').createHash('sha256').update(raw).digest('hex').slice(0, 16);
  } catch {
    return null;
  }
}
// Store fingerprint in session file → if fingerprint changes, context has changed
```

### P3 — Low Priority / Future Consideration

**P3.1: Handoff Document Pattern (VentureCrane-style)**

Write a structured handoff to `docs/handoffs/` on graceful session end:

```markdown
# AIOS Handoff — 2026-02-21T15:30:00Z

## Last Active: @dev (Dex)
## Story: NOG-7 | Phase: qa-gate | Branch: feat/epic-nogic

### Accomplished
- Implemented DevOps impact analysis
- Added blast radius calculation

### In Progress
- PR enrichment feature (50% done)

### Blocked
- None

### Next Steps
- Complete PR enrichment
- Run @qa qa-gate
```

**P3.2: Conversation History Semantic Analysis**

Extend `_detectWorkflowPattern` to use more sophisticated matching — require sequential ordering (not just containment) and add more workflow patterns (code-review, push-flow, etc.):

```javascript
_matchesPattern(commands, pattern) {
  // Current: containment check (≥2 matches)
  // Enhanced: subsequence check (ordered match)
  let patternIdx = 0;
  for (const cmd of commands) {
    if (cmd === pattern[patternIdx]) patternIdx++;
    if (patternIdx === 2) return true;  // found 2 in sequence
  }
  return false;
}
```

---

## Cross-Tool Comparison Matrix

| Feature | Claude Code | Gemini CLI | Copilot CLI | Codex CLI | Aider | AIOS ContextDetector |
|---|---|---|---|---|---|---|
| Auto session detection | No (flag required) | No (flag required) | No (flag required) | No (flag required) | No | Yes (file+history) |
| Directory-scoped sessions | Yes | Yes (hash) | No | Yes | No | Yes (.aios/session-state) |
| Git branch tracking | Yes (metadata) | No | No | No | No | Yes (context_snapshot) |
| Crash detection | No | No | No | No | No | Yes (SessionState.detectCrash) |
| Last active agent tracking | No | No | No | No | No | Yes (last_executor) |
| Workflow phase tracking | No | No | No | No | No | Yes (workflow.current_phase) |
| PID-based liveness | No (requested) | No | No | No | No | No (gap) |
| Tiered idle timeout | No | Configurable | No | No | No | No (1hr binary) |
| Session forking | Yes | No | No | Yes | No | No |
| Auto-compaction | Yes (80%) | No | Yes (95%) | No | No | No |

**Key insight:** AIOS has the richest session state model of any tool surveyed, but the ContextDetector does not fully leverage it. The gap between `session-state.yaml` richness and ContextDetector simplicity is the primary improvement opportunity.

---

## Actionable Summary

1. **Immediate win (P0):** Connect ContextDetector to read `session-state.yaml` instead of/alongside `session-state.json`. The data is already there — `last_executor`, `workflow.current_phase`, crash detection — just not being read by ContextDetector.

2. **Quick win (P0):** Change return type from `string` to `object` with `{ type, lastExecutor, lastPhase, currentStory, idleMinutes, branch }`. This enables callers (Synapse activation, greeting logic) to produce context-appropriate messages without re-reading state files.

3. **High value (P1):** Add git branch detection. If `currentBranch !== session.branch` → treat as new context regardless of TTL.

4. **Use existing crash detection (P1):** `SessionState.detectCrash()` already implements a 30-minute threshold for "workflow interrupted without clean exit." ContextDetector should call this.

5. **Follow Claude Code's pattern (P2):** Implement PID lock file at `.aios/session.lock` for multi-instance detection. Follows established Unix conventions (npm, yarn, databases).

6. **Use VentureCrane's composite key (P2):** `git_remote + branch + cwd` as context fingerprint. Survives directory renames. More reliable than path-only.

---

## Sources

- [Context Window & Compaction — Claude Code DeepWiki](https://deepwiki.com/anthropics/claude-code/3.3-session-and-conversation-management)
- [Session Management — Claude Code DeepWiki](https://deepwiki.com/anthropics/claude-code/2.4-session-management)
- [Session Control Flags — Claude Code Ultimate Guide DeepWiki](https://deepwiki.com/FlorianBruniaux/claude-code-ultimate-guide/14.1-session-control-flags)
- [Session Management and Resume — Claude Code Ultimate Guide DeepWiki](https://deepwiki.com/FlorianBruniaux/claude-code-ultimate-guide/12.1-session-management)
- [Session Management — Claude API Docs](https://platform.claude.com/docs/en/agent-sdk/sessions)
- [Session Management — Steve Kinney](https://stevekinney.com/courses/ai-development/claude-code-session-management)
- [Claude Code Session Management Internals Part 6 — Medium](https://kotrotsos.medium.com/claude-code-internals-part-6-session-state-management-e729f49c8bb9)
- [Local Session History Issue #12646 — GitHub](https://github.com/anthropics/claude-code/issues/12646)
- [Add Session Lock File Issue #19364 — GitHub](https://github.com/anthropics/claude-code/issues/19364)
- [Resume Feature Fails Issue #3138 — GitHub](https://github.com/anthropics/claude-code/issues/3138)
- [Concurrent Sessions Block Issue #13352 — GitHub](https://github.com/anthropics/claude-code/issues/13352)
- [Claude Code --continue after Directory mv — GitHub Gist](https://gist.github.com/gwpl/e0b78a711b4a6b2fc4b594c9b9fa2c4c)
- [Session State Management — GitHub Copilot CLI DeepWiki](https://deepwiki.com/github/copilot-cli/6.4-session-state-management)
- [Pick Up Where You Left Off — Gemini CLI Google Developers Blog](https://developers.googleblog.com/pick-up-exactly-where-you-left-off-with-session-management-in-gemini-cli/)
- [Session Management — Gemini CLI Docs](https://geminicli.com/docs/cli/session-management/)
- [Conversation History and Persistence — Codex CLI DeepWiki](https://deepwiki.com/openai/codex/3.3-session-management-and-persistence)
- [Codex CLI Features — OpenAI Developers](https://developers.openai.com/codex/cli/features/)
- [Add Chat Session Management Issue #2080 — OpenAI Codex GitHub](https://github.com/openai/codex/issues/2080)
- [Aider Git Integration](https://aider.chat/docs/git.html)
- [More Control Over Chat History Issue #3607 — Aider GitHub](https://github.com/Aider-AI/aider/issues/3607)
- [Feature Request: Automatic Session Resumption Issue #3846 — Cursor GitHub](https://github.com/cursor/cursor/issues/3846)
- [Sessions — OpenAI Agents SDK](https://openai.github.io/openai-agents-python/sessions/)
- [Session: Tracking Individual Conversations — Google ADK](https://google.github.io/adk-docs/sessions/session/)
- [Architecting Efficient Context-Aware Multi-Agent Framework — Google Developers Blog](https://developers.googleblog.com/architecting-efficient-context-aware-multi-agent-framework-for-production/)
- [How We Built an Agent Context Management System — VentureCrane](https://venturecrane.com/articles/agent-context-management-system/)
- [Designing Multi-Agent Workflows with LangGraph and CrewAI](https://digitalthoughtdisruption.com/2025/08/05/multi-agent-langgraph-crewai-workflows/)
- [Amazon Bedrock AgentCore Memory — AWS Blog](https://aws.amazon.com/blogs/machine-learning/amazon-bedrock-agentcore-memory-building-context-aware-agents/)
- [How to Ensure Consistency in Multi-Turn AI Conversations — Maxim](https://www.getmaxim.ai/articles/how-to-ensure-consistency-in-multi-turn-ai-conversations/)
- [Session Management — Claude Agent SDK](https://platform.claude.com/docs/en/agent-sdk/sessions)
- [Teaching Claude to Remember: Sessions and Resumable Workflow — Medium](https://medium.com/@porter.nicholas/teaching-claude-to-remember-part-3-sessions-and-resumable-workflow-1c356d9e442f)
- [Entire CLI: Git Observability Tool for AI Code Sessions](https://www.techedubyte.com/entire-cli-git-observability-tool-ai-code-sessions/)
- [What the --continue Flag Does — ClaudeLog](https://claudelog.com/faqs/what-is-continue-flag-in-claude-code/)
- [Agentic Frameworks in 2026 — Zircon Tech](https://zircon.tech/blog/agentic-frameworks-in-2026-what-actually-works-in-production/)
