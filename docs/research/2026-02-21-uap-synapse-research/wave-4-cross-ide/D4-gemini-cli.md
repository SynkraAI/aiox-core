# D4 — Gemini CLI Architecture Research
**Story:** NOG-9 — UAP & SYNAPSE Deep Research
**Wave:** 4 — Cross-IDE Comparison
**Date:** 2026-02-21
**Researcher:** /tech-search agent
**Priority:** MEDIUM

---

## Executive Summary

Google's Gemini CLI is an open-source AI agent for the terminal built on a ReAct (Reason-and-Act) loop with Gemini 2.5 Pro (1M token context) at its core. Its instructions system centers on hierarchical `GEMINI.md` files — a pattern directly analogous to Claude Code's `CLAUDE.md` / AIOS SYNAPSE model. Key differentiators include native session persistence with a project-scoped session browser, `/compress` for in-session context management, and the Conductor extension that introduces structured spec-driven development with versioned Markdown tracks. The 1M token context window available for free (1,000 requests/day via OAuth) is its most significant economic advantage over Claude Code. Known weaknesses include reliability degradation over long sessions ("context rot"), 8-12 second startup latency, quota exhaustion on heavy use, and slower task completion speed vs Claude Code.

---

## Research Question 1: Complete Architecture

### Core Components

Gemini CLI is built as a Node.js CLI application with a TypeScript monorepo structure published under Apache 2.0 license at [google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli).

#### Architectural Layers

```
┌─────────────────────────────────────────────────┐
│                  User Interface                  │
│    Terminal (ink-based TUI, slash commands)      │
└─────────────────────┬───────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────┐
│               ReAct Agent Loop                   │
│  Thought → Tool Call → Observation → Repeat      │
└─────────────────────┬───────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────┐
│                 Core Package                     │
│  - ToolRegistry (built-in + MCP + discovered)   │
│  - CoreToolScheduler (event-driven, v0.26+)      │
│  - SessionManager (auto-save, project-scoped)    │
│  - MemorySystem (GEMINI.md hierarchy)            │
│  - SandboxManager (seatbelt / Docker / none)     │
└─────────────────────┬───────────────────────────┘
                      │
        ┌─────────────┴────────────┐
        │                          │
┌───────▼──────┐         ┌─────────▼────────┐
│  Gemini API  │         │   MCP Servers     │
│ (1M ctx win) │         │ (local + remote)  │
└──────────────┘         └──────────────────┘
```

#### ReAct Loop Execution

The loop executes as follows:

1. **Thought phase**: The Gemini model receives system instructions (concatenated GEMINI.md hierarchy) + conversation history + user prompt, then decides what tool to invoke and returns a `FunctionCall` part.
2. **Act phase**: `CoreToolScheduler` looks up the tool in `ToolRegistry`, validates params via `validateToolParams()`, executes the tool, and converts the result into a structured `functionResponse` part.
3. **Observation phase**: Tool output is appended to conversation history and sent back to the model.
4. **Loop completion**: The model either invokes another tool, asks a clarifying question, or provides a final answer.

Starting in v0.26.0, the scheduler uses an **event-driven architecture** for tool execution rather than a polling loop, yielding a more responsive experience.

#### Built-in Tools

Located in `packages/core/src/tools/`:

| Tool | Description |
|------|-------------|
| `ShellTool` | Executes arbitrary shell commands (with sandbox + user approval) |
| `WebFetchTool` | Fetches URL content |
| `WebSearchTool` | Google Search grounding (native, not MCP) |
| `MemoryTool` | Reads/writes GEMINI.md memory |
| `FileReadTool` | Reads files |
| `FileWriteTool` | Writes/edits files |
| `FileSearchTool` | Searches within files |
| `CodeExecutionTool` | Executes code in sandbox (with Matplotlib graph output) |

#### Tool Discovery

Beyond built-in tools, the ToolRegistry supports three dynamic discovery methods:

1. **Command-based discovery**: `tools.discoveryCommand` runs a command that outputs JSON describing custom tools, registered as `DiscoveredTool` instances.
2. **MCP discovery**: Connects to MCP servers configured in `settings.json` via Stdio, SSE, or Streamable HTTP transport.
3. **Extension-based**: Extensions (like Conductor) register custom slash commands and tool sets.

---

## Research Question 2: Rules/Instructions System

### GEMINI.md — The Instructions Format

`GEMINI.md` files are Markdown files providing persistent instructional context to the Gemini model. They are concatenated and injected into the system prompt on every interaction. This is functionally equivalent to Claude Code's `CLAUDE.md` system.

#### Hierarchical Loading Order

The CLI loads and concatenates files in this precise sequence:

```
1. ~/.gemini/GEMINI.md              ← Global (all projects)
2. <git-root>/GEMINI.md             ← Project root (up to .git boundary)
3. <parent-dirs>/GEMINI.md          ← Ancestor directories above CWD
4. <cwd>/GEMINI.md                  ← Current working directory
5. <subdirs>/**/GEMINI.md           ← Subdirectories (alphabetical by folder name)
```

Subdirectory scanning respects `.gitignore` and `.geminiignore` rules.

#### File Import Syntax

Large GEMINI.md files can be modularized using `@file.md` imports:

```markdown
# Main GEMINI.md
@./agents/dev-rules.md
@./agents/qa-rules.md
@../shared/code-style.md
```

Both relative and absolute paths are supported.

#### Custom Filename Configuration

The default filename `GEMINI.md` can be customized or expanded in `settings.json`:

```json
{
  "context": {
    "fileName": ["AGENTS.md", "CONTEXT.md", "GEMINI.md"]
  }
}
```

When multiple names are specified, the CLI loads any matching file found at each directory level.

#### Memory Management Commands

| Command | Action |
|---------|--------|
| `/memory show` | Displays the full concatenated instructional context currently in use |
| `/memory refresh` | Forces re-scan and reload of all GEMINI.md files |
| `/memory add <text>` | Appends text persistently to `~/.gemini/GEMINI.md` (global) |

#### GEMINI_SYSTEM_MD Environment Variable

The core behavioral system prompt can be sourced from an external file instead of Gemini CLI's internal defaults:

```bash
export GEMINI_SYSTEM_MD=/path/to/system-instructions.md
```

This enables complete override of the base system prompt — a more powerful escape hatch than Claude Code currently exposes.

#### Comparison: GEMINI.md vs CLAUDE.md vs AIOS SYNAPSE

| Feature | GEMINI.md | CLAUDE.md (AIOS SYNAPSE) |
|---------|-----------|--------------------------|
| Hierarchical loading | Yes (global → project → subdir) | Yes (global → project) |
| File import syntax | `@file.md` | Not native (referenced manually) |
| Custom filenames | Yes (configurable array) | Fixed (`CLAUDE.md`) |
| System prompt override | Yes (`GEMINI_SYSTEM_MD`) | No native equivalent |
| Runtime inspection | `/memory show` | No native equivalent |
| Runtime refresh | `/memory refresh` | Restart required |
| Subdirectory scanning | Yes (with .gitignore respect) | Yes |
| Modular rules per agent | Via subdirectory GEMINI.md | Via `.claude/rules/*.md` |

**Key gap identified**: AIOS SYNAPSE's `.claude/rules/*.md` modular approach has no direct GEMINI.md equivalent — SYNAPSE is more structured (named rule files per concern), while GEMINI.md relies on directory structure and `@imports` for modularity.

---

## Research Question 3: Session Management

### Architecture

Sessions are automatically saved in the background starting from Gemini CLI v0.20.0. Storage path:

```
~/.gemini/tmp/<project_hash>/chats/
```

The `<project_hash>` is derived from the project's root directory (identified by `.git`), making sessions **project-scoped by default**. Switching directories automatically switches session context.

### Saved State per Session

Each saved session includes:
- All user prompts and model responses
- Tool executions (inputs and outputs verbatim)
- Token usage statistics
- Model reasoning/thought summaries (when available)

### Resume Mechanisms

```bash
# Command-line resume options
gemini --resume                    # Load most recent session immediately
gemini --resume 1                  # Resume by index
gemini --resume <full-uuid>        # Resume by UUID

# In-session
/resume                            # Opens interactive Session Browser
                                   # (Browse, preview, search, select)
gemini --list-sessions             # List all available sessions
gemini --delete-session 2          # Delete by index
```

The Session Browser (opened via `/resume`) supports keyboard navigation: Enter to resume, Esc to exit, 'x' to delete.

### Retention Configuration (`settings.json`)

```json
{
  "sessionRetention": {
    "enabled": true,
    "maxAge": "30d",
    "maxCount": 50,
    "minRetention": "1d"
  },
  "maxSessionTurns": 100
}
```

`maxSessionTurns: 100` caps exchanges per session. In interactive mode a message is shown when reached; in non-interactive mode, the process exits with an error.

### Comparison vs Claude Code

Claude Code has no built-in session persistence or resume capability. Sessions exist only within the active terminal process. AIOS SYNAPSE compensates with story files (`.md`) and decision logs as manual persistence, but there is no equivalent auto-save/resume feature.

**Verdict**: Gemini CLI's native session management is a significant UX advantage for long-running development tasks that span multiple working sessions.

---

## Research Question 4: Context Window Management (1M+ Tokens)

### The 1M Token Advantage

Gemini 2.5 Pro (the model powering Gemini CLI's free tier) supports a **1,000,000 token** context window. At 4 characters per token approximately, this enables ingestion of:

- ~50,000 lines of code in a single session
- ~1,500 pages of text
- Entire medium-to-large codebases without chunking

This context is available across the full free tier (1,000 requests/day via Google OAuth), making it economically superior for large-codebase analysis compared to Claude Code's 200K default (with 1M at premium pricing).

### Context Management Strategies

Gemini CLI does not implement aggressive automatic truncation — instead it provides user-controlled management tools:

#### `/compress` — Intelligent Summarization

For long and complex sessions, `/compress` instructs the model to replace the entire chat history with a concise summary. This:
- Frees significant token capacity
- Preserves the "core essence" of the conversation
- Is irreversible (hence best combined with `/memory add` for critical facts first)

**Recommended pattern before compressing:**
```
/memory add Key decision: using PostgreSQL for primary storage, Redis for cache
/compress
```

#### `/clear` — Hard Reset

The `/clear` command wipes the conversational context completely and resets the terminal. Unlike `/compress`, no summary is retained. Used when starting an entirely new task unrelated to prior context.

#### Token Caching

The CLI implements token caching at the API level to optimize repeated context injection costs. GEMINI.md content that is sent on every prompt benefits from caching to reduce billable token usage.

### Context Rot Problem

A documented limitation (GitHub Issue #10975): over the course of long sessions with many tool calls, model performance degrades — users report the model becomes "less sharp and much slower" as context accumulates. This is the "context rot" or "context bloating" phenomenon where irrelevant accumulated history degrades response quality.

**Current mitigations**: `/compress`, `/clear`, judicious session checkpointing.

**Unresolved**: Even with 1M tokens, the model's effective "attention" degrades non-linearly in practice, a known limitation of transformer architectures with very long contexts.

### Comparison vs Claude Code

| Dimension | Gemini CLI | Claude Code |
|-----------|-----------|-------------|
| Default context size | 1M tokens (free) | 200K tokens |
| Max context size | 1M tokens | 1M tokens (premium) |
| Context management | `/compress`, `/clear`, token cache | No native compress; `/clear` equivalent |
| Context inspection | `/memory show` (for instructions) | No equivalent |
| Context rot handling | Known issue, manual mitigation | Less reported (smaller default window) |
| Cost for large codebase | Low (free tier) | Higher (pays per token above 200K) |

---

## Research Question 5: Unique Features

### 5.1 Native Google Search Grounding

Built-in `WebSearchTool` provides direct Google Search integration (not via MCP). This enables the model to ground responses in real-time web information, including current CVEs, library docs, and forum discussions — without requiring external MCP server configuration.

**Claude Code limitation**: Web search requires external MCP server setup.

### 5.2 Conductor Extension — Context-Driven Development

Released in preview (late 2025 / early 2026), Conductor is a first-party Gemini CLI extension that introduces formal spec-driven development. It stores all context as versioned Markdown alongside the code:

**Directory structure created by Conductor:**
```
conductor/
├── product.md         # Product definition, goals, target users
├── tech-stack.md      # Technology choices and rationale
├── workflow.md        # Developer workflow preferences
├── code-style.md      # Coding standards
└── tracks/
    └── <track-name>/
        ├── spec.md    # Detailed requirements (what & why)
        ├── plan.md    # Actionable to-do list (phases, tasks, subtasks)
        └── metadata.json
```

**Key commands:**
```
/conductor:setup           # Initialize conductor/ directory
/conductor:newTrack        # Create a new feature track
/conductor:implement       # Drive agent from plan.md (checks off tasks)
/conductor:status          # Show progress across tracks
/conductor:review          # Automated review of implementation
/conductor:revert          # Git-backed rollback
```

**Significance for AIOS comparison**: Conductor is essentially Google's answer to AIOS SYNAPSE's Story-Driven Development. Where AIOS uses `docs/stories/` with story files and acceptance criteria, Conductor uses `conductor/tracks/` with `spec.md` + `plan.md`. Both solve the same fundamental problem: persistent, structured context for AI-driven development workflows.

### 5.3 Hooks System (v0.26.0+)

Hooks are scripts that Gemini CLI executes at predefined lifecycle points, configured in `settings.json`. They run synchronously within the agent loop.

**Use cases:**
- Add custom context at session start
- Enforce security/compliance policies before tool execution
- Log and audit tool usage
- Send notifications when agent is idle or awaiting confirmation

**Security model**: Hooks execute with full user privileges. Project-level hooks are fingerprinted — if a hook's name or command changes, it is treated as untrusted and the user is warned before execution.

**Comparison**: This is equivalent to Claude Code's hooks system (`.claude/hooks/`), which AIOS uses for `synapse-engine.cjs`. Both allow injection of custom logic into the agent loop without modifying source code.

### 5.4 Multimodal Input

Gemini CLI inherits the model's multimodal capabilities:
- Image analysis (screenshots, UI mockups, diagrams)
- OCR from images
- Multimodal generation: invoke Imagen (images) and Veo (videos) from the CLI
- Code execution with graph/chart output via Matplotlib

**Claude Code limitation**: Primarily text/code focused; no native image generation or video capabilities.

### 5.5 Sandbox Security (Multi-mode)

Three sandbox modes:

| Mode | Mechanism | Availability |
|------|-----------|-------------|
| `macOS Seatbelt` | Apple's `sandbox-exec` with kernel-level restrictions | macOS only |
| `Docker/Podman` | Full container isolation | Cross-platform |
| `None` | No sandboxing (default) | All platforms |

Default profile (`permissive-open`): Prevents writes outside the project directory; allows reading system libraries and outbound connections.

**Notable security incident**: Google has patched flaws in Gemini CLI that risked silent data exfiltration (per SC Media report). This underscores that no-sandbox-by-default is a risk.

### 5.6 Skills System (Experimental, v0.26.0+)

Gemini CLI v0.26.0 introduced experimental Skills support. Skills are analogous to Claude Code's custom slash commands — reusable, named workflows that can be invoked with a `/` prefix. This brings Gemini CLI closer to AIOS SYNAPSE's command system (`*develop`, `*qa-gate`, etc.), though currently in experimental status.

### 5.7 MCP Ecosystem via FastMCP

Gemini CLI has first-class FastMCP integration (Python's leading MCP library). As of FastMCP v2.12.3:

```bash
fastmcp install gemini-cli  # Auto-configures MCP server in settings.json
```

This dramatically lowers the barrier for extending Gemini CLI with custom tools.

---

## Research Question 6: Limitations, Performance, and Community Feedback

### Known Limitations

| Limitation | Severity | Notes |
|-----------|----------|-------|
| Requires constant internet | HIGH | No offline mode; all processing is cloud-side |
| Context rot over long sessions | HIGH | GitHub Issue #10975; confirmed by multiple users |
| 8-12 second startup latency | MEDIUM | Every launch, even without MCP servers |
| Free tier quota exhaustion | HIGH | Heavy users hit limits mid-task; Pro/Ultra needed |
| Model switching (Pro → Flash) | MEDIUM | Happens automatically on quota pressure; degrades quality |
| No non-interactive SDK (full) | MEDIUM | Limits CI/CD pipeline integration |
| Code quality inconsistency | MEDIUM | Generated code often requires extensive debugging |
| Privacy concerns | HIGH | All code/prompts sent to Google's servers |
| No workflow review step | MEDIUM | Agent often starts without creating a plan first |

### Performance Characteristics

**Speed comparison (from community benchmarks):**
- Claude Code completed a full project in **1 hour 17 minutes**
- Gemini CLI completed the same project in **2 hours 2 minutes**
- Delta: ~37% slower on equivalent tasks

**Quality assessment (community):**
- Output quality generally comparable
- Claude Code rated higher on UX, code generation flow (described as "polished, smooth and premium")
- Claude Code achieved ~80% autonomous execution vs lower autonomy in Gemini CLI
- Gemini CLI rated higher for: Google Search grounding, large codebase ingestion (cost-efficiency), multimodal tasks

**Reliability issues:**
- Capacity constraints have been flagged by engineering managers as a blocker for team adoption
- Recent reviews (GitHub Issue #7305) indicate performance degradation over time
- Authentication setup rated as "painful" by significant portion of community

### Community Sentiment Summary

**Strengths praised:**
- Free tier generosity (1M tokens, 1,000 req/day)
- Large context window for codebase analysis
- Open source and extensible
- Native Google Search grounding
- Session management (resume from where you left off)

**Weaknesses cited:**
- Reliability / uptime concerns
- Speed vs Claude Code
- Context rot in long sessions
- Startup latency
- Quota exhaustion on non-trivial work

**Recommended use cases (community consensus):**
- Personal projects and exploration where cost matters
- Large codebase analysis where 1M tokens at free tier is a decisive advantage
- Teams already on Google Cloud ecosystem
- Research tasks requiring web grounding

**Not recommended for (community consensus):**
- Production teams requiring consistent reliability
- Fast-paced delivery where speed matters
- Highly autonomous agentic workflows (Claude Code is stronger)

---

## Comparison: Gemini CLI vs Claude Code + AIOS SYNAPSE

### Architecture Comparison

| Dimension | Gemini CLI | Claude Code + AIOS SYNAPSE |
|-----------|-----------|---------------------------|
| Agent loop | ReAct (explicit Think/Act/Observe) | ReAct (implicit) |
| Instructions format | `GEMINI.md` hierarchy | `CLAUDE.md` + `.claude/rules/*.md` |
| Rule modularity | `@imports` + subdirectory GEMINI.md | Named files in `.claude/rules/` |
| Runtime rule refresh | `/memory refresh` | Restart required |
| Rule inspection | `/memory show` | No native equivalent |
| System prompt override | `GEMINI_SYSTEM_MD` env var | No native equivalent |
| Session persistence | Native auto-save + /resume browser | Manual (story files, decision logs) |
| Context management | `/compress`, `/clear`, token cache | `/clear` equivalent only |
| Hook system | Yes (settings.json hooks) | Yes (.claude/hooks/) |
| Skills/custom commands | Experimental (v0.26.0+) | Yes (mature, `.claude/commands/`) |
| MCP support | Yes (settings.json mcpServers) | Yes (.mcp.json) |
| Web search | Built-in (Google Search) | Requires external MCP |
| Multimodal | Yes (images, video gen) | Text/code focused |
| Sandboxing | Multi-mode (seatbelt/Docker/none) | Limited (shell execution with approval) |
| Open source | Yes (Apache 2.0) | No |
| Free tier | Generous (1K req/day, 1M ctx) | Paid (Claude Pro $20/mo) |

### AIOS SYNAPSE Unique Advantages (Not Matched by Gemini CLI)

1. **Agent Authority System**: Named agents (@dev, @qa, @devops) with formal authority boundaries — no equivalent in Gemini CLI
2. **Story-Driven Development**: Full lifecycle from @sm → @po → @dev → @qa → @devops with structured story files — Conductor is the closest analog but is less mature and structured
3. **Constitution / Quality Gates**: Formal principles with automated enforcement — no equivalent
4. **Epic/Story orchestration**: `execute-epic-plan.md`, `EPIC-{ID}-EXECUTION.yaml` — no equivalent
5. **Mature skills system**: `.claude/commands/` with synapse slash commands — Gemini CLI Skills are still experimental
6. **Rules-per-concern modularity**: `.claude/rules/agent-authority.md`, `.claude/rules/story-lifecycle.md` — more semantically organized than directory-based GEMINI.md

### Gemini CLI Unique Advantages vs AIOS SYNAPSE

1. **Native session persistence with resume browser** — AIOS has no equivalent
2. `/memory refresh` and `/memory show` — runtime inspection without restart
3. **1M token context at free tier** — significant cost advantage at scale
4. `/compress` for session context management
5. **Native Google Search grounding** — no MCP setup required
6. **GEMINI_SYSTEM_MD** — full system prompt override capability
7. **Conductor extension** — structured spec-driven development (though less mature than AIOS SYNAPSE)
8. **Multimodal capabilities** — image analysis, Imagen/Veo generation
9. **Open source** — community contributions, self-hosting potential

---

## Prioritized Recommendations for AIOS SYNAPSE

### P0 — Critical (Should Implement Immediately)

**P0.1: `/memory show` equivalent for SYNAPSE**
AIOS SYNAPSE has no way to inspect the currently active instructional context at runtime. A command to display all loaded `CLAUDE.md` files and their concatenated content would significantly improve debuggability. The Synapse Engine (`.claude/hooks/synapse-engine.cjs`) is the natural place to implement this.

**P0.2: Native session resume for agent context**
AIOS SYNAPSE relies on story files as manual session continuity. A lightweight mechanism to save/restore agent session state (current story, progress checkpoint, decision log reference) would close the gap with Gemini CLI's auto-save. Even a simple "session manifest" file persisted per working directory would be valuable.

### P1 — High Priority (Next Sprint)

**P1.1: `/memory refresh` equivalent**
Rules and CLAUDE.md files currently require a restart to reload. Adding a hot-reload capability (triggered by a slash command or file-watch) would improve the inner development loop significantly, especially during active SYNAPSE development.

**P1.2: `@import` syntax for CLAUDE.md modularity**
GEMINI.md's `@file.md` import syntax enables clean modularization without directory proliferation. AIOS SYNAPSE's current `.claude/rules/*.md` approach is semantically superior but could benefit from allowing `CLAUDE.md` to explicitly `@import` rule files, making the dependency graph explicit and inspectable.

**P1.3: Session-scoped context compression**
Implement a `/compress` analog in SYNAPSE: a command that summarizes the current session's conversation and agent decisions, and saves a checkpoint to the story's decision log. This addresses the context rot problem for long agent sessions.

### P2 — Medium Priority (Backlog)

**P2.1: Hooks fingerprinting for security**
Gemini CLI's approach of fingerprinting project-level hooks and warning on changes is a good security model worth adopting for `.claude/hooks/`. Currently SYNAPSE hooks execute without change detection.

**P2.2: Conductor-inspired track system for AIOS**
Conductor's `spec.md` + `plan.md` per track structure is simpler and more accessible than AIOS's full story lifecycle. Consider offering a lightweight "quick track" mode for smaller features that bypasses the full @sm → @po → @dev → @qa → @devops cycle while still persisting context as versioned Markdown.

**P2.3: GEMINI_SYSTEM_MD equivalent**
Enable a `SYNAPSE_SYSTEM_MD` environment variable to override the base system prompt injected by the SYNAPSE engine, enabling easier customization for different deployment contexts without modifying `synapse-engine.cjs`.

### P3 — Low Priority (Research / Future)

**P3.1: Web search MCP as first-class SYNAPSE capability**
Gemini CLI's built-in Google Search grounding is a meaningful research advantage. AIOS SYNAPSE should document and standardize which MCP server (e.g., Brave Search, Tavily) serves as the default web search tool, and make it a required component of the standard SYNAPSE install.

**P3.2: Token usage tracking per agent/story**
Gemini CLI saves token statistics per session. AIOS SYNAPSE has no visibility into token consumption by agent or story. A lightweight token tracking log would enable cost attribution and help identify expensive operations.

**P3.3: Investigate open-source Gemini CLI for AIOS integration**
Given Gemini CLI is Apache 2.0 licensed, there may be architectural patterns (ToolRegistry, CoreToolScheduler, session storage format) worth incorporating into AIOS's own orchestration layer for future multi-model support.

---

## Sources

- [Gemini CLI Official Docs — Gemini Code Assist](https://developers.google.com/gemini-code-assist/docs/gemini-cli)
- [GitHub — google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli)
- [Google Blog — Introducing Gemini CLI](https://blog.google/technology/developers/introducing-gemini-cli-open-source-ai-agent/)
- [Provide Context with GEMINI.md Files — Official Docs](https://google-gemini.github.io/gemini-cli/docs/cli/gemini-md.html)
- [Session Management — Gemini CLI Docs](https://geminicli.com/docs/cli/session-management/)
- [Pick Up Where You Left Off — Google Developers Blog](https://developers.googleblog.com/pick-up-exactly-where-you-left-off-with-session-management-in-gemini-cli/)
- [Conversation Compression — DeepWiki](https://deepwiki.com/addyosmani/gemini-cli-tips/7.4-conversation-compression)
- [How to Leverage Gemini CLI's 1M Token Context Window](https://inventivehq.com/knowledge-base/gemini/how-to-leverage-1m-token-context)
- [Conductor: Introducing Context-Driven Development — Google Developers Blog](https://developers.googleblog.com/conductor-introducing-context-driven-development-for-gemini-cli/)
- [GitHub — gemini-cli-extensions/conductor](https://github.com/gemini-cli-extensions/conductor)
- [Google Introduces Conductor — InfoQ](https://www.infoq.com/news/2026/01/google-conductor/)
- [Sandboxing in the Gemini CLI](https://geminicli.com/docs/cli/sandbox/)
- [Tailor Gemini CLI with Hooks — Google Developers Blog](https://developers.googleblog.com/tailor-gemini-cli-to-your-workflow-with-hooks/)
- [Claude Code vs Gemini CLI — Shipyard (Jan 2026)](https://shipyard.build/blog/claude-code-vs-gemini-cli/)
- [Gemini CLI vs Claude Code — Composio](https://composio.dev/blog/gemini-cli-vs-claude-code-the-better-coding-agent)
- [Comparing Claude Code, Codex, Gemini CLI — DeployHQ](https://www.deployhq.com/blog/comparing-claude-code-openai-codex-and-google-gemini-cli-which-ai-coding-assistant-is-right-for-your-deployment-workflow)
- [Context Rot Issue — GitHub #10975](https://github.com/google-gemini/gemini-cli/issues/10975)
- [Performance Decline Issue — GitHub #7305](https://github.com/google-gemini/gemini-cli/issues/7305)
- [MCP Servers with Gemini CLI](https://geminicli.com/docs/tools/mcp-server/)
- [Gemini CLI Hooks Docs](https://geminicli.com/docs/hooks/)
- [Google's Conductor Extension — WinBuzzer](https://winbuzzer.com/2026/02/04/google-releases-conductor-gemini-cli-extension-xcxwbn/)
- [Practical GEMINI.md Hierarchy — Part 1 (Medium)](https://medium.com/google-cloud/practical-gemini-cli-instruction-following-gemini-md-hierarchy-part-1-3ba241ac5496)
- [Practical GEMINI.md Hierarchy — Part 2 (Medium)](https://medium.com/google-cloud/practical-gemini-cli-instruction-following-gemini-md-hierarchy-part-2-84386bba51a6)
- [Gemini CLI Weekly Update v0.26.0 — Skills, Hooks, /rewind](https://github.com/google-gemini/gemini-cli/discussions/17812)
- [MCP Servers with Gemini CLI — FastMCP Integration](https://developers.googleblog.com/gemini-cli-fastmcp-simplifying-mcp-server-development/)
- [Google Fixes Gemini CLI Data Exfiltration Flaws — SC Media](https://www.scworld.com/news/google-fixes-gemini-cli-flaws-that-risked-silent-data-exfiltration)

---

*Research completed: 2026-02-21*
*Story: NOG-9 — UAP & SYNAPSE Deep Research, Wave 4 D4*
