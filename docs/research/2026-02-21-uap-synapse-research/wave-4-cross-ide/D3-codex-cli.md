# D3 — Codex CLI (OpenAI) Architecture Research

**Story:** NOG-9 — UAP & SYNAPSE Deep Research
**Wave:** 4 — Cross-IDE Ecosystem
**Priority:** HIGH
**Date:** 2026-02-21
**Researcher:** Claude Code (Sonnet 4.6) via `/tech-search`

---

## Executive Summary

OpenAI's Codex CLI is the closest architectural peer to Claude Code in the terminal-based AI coding assistant space. As of early 2026, Codex has undergone a significant architectural shift — migrating from Node.js/TypeScript to native **Rust**, introducing a unified **App Server** (JSON-RPC over JSONL) that decouples the core agent from its client surfaces, and publishing an open **Skills** standard that is now cross-platform (Claude Code, Cursor, GitHub Copilot, and 30+ other agents can execute Codex skills unchanged).

Key architectural differentiators versus Claude Code:
- **Rust-native core** (vs Claude Code's Node.js) for memory safety and sandboxing
- **App Server protocol** (Item/Turn/Thread primitives) enabling multi-surface deployment from a single codebase
- **AGENTS.md** cascading instruction hierarchy (vs Claude Code's CLAUDE.md flat model)
- **Skills system** with progressive disclosure and cross-platform portability
- **3x3 Sandbox/Approval matrix** providing fine-grained security control
- **Compaction strategy** for long-session context management (linear scaling via prompt caching)

---

## Research Question 1: Complete Architecture

### Core Runtime

Codex CLI's architecture as of 2026 consists of two major layers:

**1. Codex Core (Library + Runtime)**
- Written in **Rust** (migrated from Node.js/TypeScript mid-2025)
- Functions as both a library (where all agent logic lives) and a runtime (manages the agent loop and thread persistence)
- Open source: `github.com/openai/codex`
- Rust choice rationale: memory safety, native sandboxing support, removal of Node.js dependency, enhanced security posture

**2. App Server (Client Decoupling Layer)**
- A bidirectional **JSON-RPC API**, streamed as JSONL over standard input/output
- Powers ALL Codex surfaces: CLI, VS Code extension, web app, macOS desktop app, JetBrains plugin, Xcode integration
- Backward compatibility: older clients work safely with newer server versions
- Protocol is server-initiated when approval is needed (unlike traditional request/response)

### Three Core Primitives

```
Item  →  Turn  →  Thread
```

| Primitive | Role | Lifecycle |
|-----------|------|-----------|
| **Item** | Atomic unit of input/output | started → delta (streaming) → completed |
| **Turn** | Groups items from one unit of agent work | Initiated by user input |
| **Thread** | Persistent session container | Created, resumed, forked, archived |

Item types: user message, agent message, tool execution, approval request, diff.

### Agent Loop (Inner Loop)

Each cycle:
1. Assemble prompt: `system instructions` + `available tools` + `user input` (text, images, files, env info)
2. Package as JSON, send to Responses API
3. LLM output stream → tool invocations OR reasoning steps
4. Append results to prompt for next iteration
5. Continue until LLM emits a `"done"` event with user-facing response

This is called the **"inner" loop** — it runs inside each Turn.

### Context Assembly

Context is assembled from three sources at loop start:
1. System instructions (loaded from AGENTS.md hierarchy + config)
2. Available tools (MCP servers configured in `~/.codex/config.toml`)
3. User input (prompt + optional image attachments via `-i` flag)

Environment information (OS, shell, cwd, git status) is automatically appended to user input context.

---

## Research Question 2: AGENTS.md — Format, Hierarchy, Limits

### Format

AGENTS.md is **standard Markdown** with no required structure or headings. The agent parses the entire text as instructions. There is no YAML frontmatter requirement (unlike SKILL.md). Content can include:
- Coding standards
- Project conventions
- Tool restrictions
- Team-specific guidance
- Workflow rules
- Any instruction you would give a human developer

### Three-Tier Discovery Hierarchy

```
~/.codex/AGENTS.md              ← Global (User)
    ↓
$GIT_ROOT/AGENTS.md             ← Project root
    ↓
$GIT_ROOT/.../AGENTS.md         ← Intermediate directories
    ↓
$CWD/AGENTS.md                  ← Current working directory (nearest wins)
```

**Detailed discovery algorithm:**

1. **Global scope**: Read `~/.codex/AGENTS.override.md` if it exists, otherwise `~/.codex/AGENTS.md`. Only ONE file from this level is used.
2. **Project scope**: Walk from git root down to `$CWD`. At each directory level, check in order:
   - `AGENTS.override.md` (replaces AGENTS.md for that level)
   - `AGENTS.md`
   - Fallback filenames (configurable via `project_doc_fallback_filenames`)
3. **Merge**: All discovered files concatenate **root-to-leaf** with blank line separators. Leaf-level guidance takes precedence in case of conflict.
4. **Override precedence**: Your explicit prompt ALWAYS overrides any AGENTS.md.

### AGENTS.override.md — Override Mechanism

`AGENTS.override.md` at any directory level:
- Replaces the `AGENTS.md` in the same directory (does NOT merge)
- Useful for: personal overrides without changing shared team file, temporary rule changes, team-specific constraints
- Can be temporary: delete it to restore shared guidance

### Size Limits

| Parameter | Value | Configurable? |
|-----------|-------|--------------|
| Default byte limit | **32 KiB** (`project_doc_max_bytes`) | Yes |
| Behavior at limit | Stop adding files (silent truncation) | — |
| Custom limit example | `project_doc_max_bytes = 65536` in `~/.codex/config.toml` | Yes |
| Empty files | Skipped | — |
| Reload frequency | Every Codex run (no persistent cache) | — |

**Known Issue:** Silent truncation at 32 KiB without warning in TUI (GitHub issue #7138). Mitigation: split instructions across nested AGENTS.md files or increase the limit.

### Fallback Filenames

Configurable in `~/.codex/config.toml`:
```toml
project_doc_fallback_filenames = ["TEAM_GUIDE.md", ".agents.md"]
```

Search order per directory: `AGENTS.override.md` → `AGENTS.md` → fallback entries.

### Feature Flag: child_agents_md

When enabled in `config.toml`:
```toml
[features]
child_agents_md = true
```
Codex appends additional guidance about AGENTS.md scope and precedence to the user instructions message, and emits that message even when no AGENTS.md is present — useful for sub-agents that need hierarchy awareness.

---

## Research Question 3: Session Management

### Session Storage Layout

```
~/.codex/sessions/
└── YYYY/
    └── MM/
        └── DD/
            └── rollout-{TIMESTAMP}-{UUID}.jsonl
```

Example filename: `rollout-2025-08-31T17-06-00-aaaa-bbbb-cccc-dddd.jsonl`

### JSONL Format

Each line in a session file is a JSON object representing one event. The `--json` flag enables structured output where stdout becomes a JSONL stream. Each session JSONL contains:
- Full conversation history
- Tool calls and results
- Token usage (input, output, cached)
- Approval events
- Running token totals

The App Server protocol (JSON-RPC over JSONL) follows the Item/Turn/Thread model:
- Each line corresponds to one Item event (started, delta, completed)
- Turns group related Items
- Thread = entire session file

### UUIDv7 and Session IDs

Session identifiers appear in file names as timestamp-based UUIDs. The ccusage tool references "last 8 characters of the log filename" as the short session ID used for `codex resume`. While the exact UUID version spec is not explicitly confirmed in documentation, the timestamp-embedded format is consistent with UUIDv7 ordering.

### Session Resume

```bash
codex resume                    # Opens picker of past sessions
codex resume --last             # Jump to most recent session
codex resume --all              # Show sessions from all directories (not just cwd)
codex exec resume               # Non-interactive automation resume
```

Thread persistence enables clients to reconnect without losing state — the JSONL event log is the source of truth for session reconstruction.

### Auto-Compaction (Context Scaling)

The core performance challenge: context grows quadratically with conversation length.

OpenAI's two-pronged mitigation:
1. **Prompt caching**: Reuse previous inference outputs → achieves **linear scaling** instead of quadratic
2. **Compaction**: Once token threshold is exceeded, conversation history is replaced with a condensed summary

Compaction is automatic (not user-triggered). The compacted representation preserves semantic content while dramatically reducing token count for subsequent turns.

---

## Research Question 4: Sandbox Architecture — The 3×3 Matrix

### Two Independent Control Dimensions

**Dimension 1 — Sandbox Mode** (what the agent CAN technically do):

| Mode | File Access | Command Execution | Network |
|------|-------------|-------------------|---------|
| `read-only` | Read only | None | None |
| `workspace-write` | Read + write in workspace | Commands in workspace | Disabled |
| `danger-full-access` | Unrestricted | Unrestricted | Unrestricted |

**Dimension 2 — Approval Policy** (when the agent MUST ask):

| Policy | Behavior |
|--------|----------|
| `on-request` | Ask for approval when going outside workspace, network access, or edits outside boundaries |
| `untrusted` | Run only known-safe read operations automatically; approve all state-mutating commands |
| `never` | No approval prompts; operates within sandbox constraints only |

### The 5 Documented Scenario Combinations (from the 3×3 matrix)

| Scenario Label | Sandbox Mode | Approval Policy | Use Case |
|----------------|-------------|-----------------|----------|
| **Auto (default)** | `workspace-write` | `on-request` | Standard development; auto-edit within workspace |
| **Safe browsing** | `read-only` | `on-request` | Review code without changes |
| **CI/automation** | `read-only` | `never` | Non-interactive file analysis pipelines |
| **Trusted editing** | `workspace-write` | `untrusted` | Auto-edit but approve risky shell commands |
| **Full danger** | `danger-full-access` | `never` | No constraints (explicitly not recommended) |

Note: Not all 9 combinations (3×3) are documented with explicit use cases — 5 are the primary configurations.

### Protected Paths (Always Read-Only Even in Writable Mode)

- `.git/` (and resolved git directories)
- `.agents/` directory
- `.codex/` directory

### Workspace Scope

Default writable workspace: current directory + `/tmp`.

### Enterprise/Admin Enforcement

Organizations can enforce constraints via `requirements.toml`:
```toml
# Example: disallow full-access in CI
disallow_approval_policy_never = true
disallow_sandbox_danger_full_access = true
```

### Web Search Security Note

Web search defaults to **cached results** from OpenAI's index (not live internet) to mitigate prompt injection attacks. Configurable to `"live"` or `"disabled"`.

---

## Research Question 5: Skills System

### What Are Skills?

Skills are **directories of instructions, scripts, and resources** that Codex can discover and use to perform specialized tasks in a repeatable way. They are the Codex equivalent of reusable capability modules.

### SKILL.md Format

```markdown
---
name: skill-name
description: When skill should and should not trigger
---

Natural language instructions for Codex to follow when this skill is activated.
Any markdown content supported.
```

### Directory Structure of a Skill

```
skill-name/
├── SKILL.md                  # Required: metadata + instructions
├── scripts/                  # Optional: executable scripts
├── references/               # Optional: supporting documentation
├── assets/                   # Optional: templates and resources
└── agents/
    └── openai.yaml           # Optional: UI config and dependencies
```

### Storage Locations (Precedence)

| Scope | Path | Use Case |
|-------|------|----------|
| REPO (local) | `.agents/skills/` in current directory | Working-folder-specific skills |
| REPO (global) | `$REPO_ROOT/.agents/skills/` | Organization-wide repository skills |
| USER | `$HOME/.agents/skills/` | Personal cross-repository skills |
| ADMIN | `/etc/codex/skills/` | System-level defaults |
| SYSTEM | Bundled with Codex binary | Built-in skills (`skill-creator`, `plan`) |

Codex scans **upward** from CWD to repo root, supporting symlinked skill folders.

### Skill Activation Mechanisms

1. **Explicit invocation**: User types `/skills` or `$SkillName` in the composer
2. **Implicit/semantic matching**: Codex autonomously selects a skill when the task description matches the skill's `description` field

### Progressive Disclosure

Critical performance optimization: Codex initially loads only SKILL.md **metadata** (name + description). Full skill content is loaded only when the agent decides to use that skill. This keeps system prompt context lean.

### Built-in System Skills

Located at `~/.codex/skills/.system/`:
- **`skill-creator`**: Guides creation of new skills
- **`plan`**: Manages lifecycle operations for planning documents

### Cross-Platform Portability (KEY FINDING)

Skills created for Codex run unchanged in:
- Claude Code
- Google Antigravity
- Cursor
- GitHub Copilot
- 30+ other agent platforms

Skills are an **open, cross-platform standard** (not OpenAI-proprietary). The format specification lives at `agents.md`.

### Analogy to AIOS Systems

| Codex Skills | AIOS Equivalent | Notes |
|--------------|-----------------|-------|
| `SKILL.md` | Agent task files (`.aios-core/development/tasks/*.md`) | Both are markdown-based capability definitions |
| Skill directories | Task definitions in `.aios-core/development/` | Both modular, discoverable |
| `$SkillName` invocation | `*task-name` commands | Direct naming pattern similar |
| `description` field (auto-trigger) | Agent context matching | Semantic activation vs explicit activation |
| REPO scope skills | Story-specific templates | Project-level capability scoping |
| USER scope skills | Global agent configurations | Cross-project capability access |
| Cross-platform portability | AIOS agent-agnostic tasks | AIOS tasks are also executor-agnostic |

**Key difference from SYNAPSE domains**: Codex skills are file-system-based capability packages. SYNAPSE domains (if analogous) would be agent-persona-based specializations. Skills are more granular and composable — closer to AIOS task definitions than to full agent personas.

---

## Research Question 6: Performance Characteristics and Known Limitations

### Performance Benchmarks

| Metric | Codex CLI | Claude Code |
|--------|-----------|-------------|
| SWE-bench Verified accuracy | 69.1% | 72.7% |
| Token delivery speed (Spark model) | >1,000 tokens/sec | Not published |
| Reasoning effort levels | low / medium / high / xhigh / minimal | Not exposed |
| Default model | GPT-5.3-Codex | Claude Sonnet/Opus |

### Model Selection

- Default: `gpt-5.3-codex` (configurable)
- Switch mid-session: `/model` command
- **GPT-5.3-Codex-Spark**: Smaller, near-instant model (>1,000 TPS) for real-time coding — separate usage limits
- **xhigh reasoning**: Available for non-latency-sensitive tasks (extra compute)

### Known Limitations

**1. Token/Usage Quotas**
- Limits are **message-based** (not token-based rate limits like API)
- Quotas reset every **5 hours**
- Heavy users on large projects report hitting limits after 1-2 big requests on Plus tier
- Single prompt can consume ~7% of weekly limit (reported on community forums)
- Pro tier much more generous; rare for Pro users to hit ceilings

**2. Context Growth**
- Context grows quadratically without caching/compaction
- Prompt caching mitigates to linear scaling
- Auto-compaction triggers at token thresholds (threshold not published)

**3. Silent AGENTS.md Truncation**
- Files silently truncated at 32 KiB limit without TUI warning (GitHub issue #7138)
- Mitigation: use nested AGENTS.md files or increase `project_doc_max_bytes`

**4. Tool Enumeration Cache Misses**
- Real bug discovered in production: tool enumeration inconsistencies cause prompt cache misses, effectively degrading context scaling from linear back toward quadratic
- OpenAI documented this as a lessons-learned from Codex internals blog

**5. Web Search Limitations**
- Default search uses cached results (not live), which may miss recent events
- Live search opt-in required: `web_search = "live"` in config

**6. Network Disabled by Default**
- CLI disables network access in sandbox by default
- Cloud agent enables network only during setup phase

**7. Startup Environment Cost**
- Codex spends tokens probing environment on startup if not pre-configured
- Best practice: pre-configure environment before launching to save tokens

**8. Rust Migration Transition Period**
- Mid-2025 migration from Node.js to Rust is ongoing
- Some documentation still references Node.js (v22+) requirements
- Community tooling (e.g., ccusage, codex-history-list) may lag behind core changes

---

## Comparison: Codex CLI vs Claude Code vs AIOS

### Architecture Comparison Table

| Dimension | Codex CLI | Claude Code | AIOS Framework |
|-----------|-----------|-------------|----------------|
| **Runtime** | Rust (native) | Node.js | Node.js |
| **Execution model** | Local + Cloud hybrid | Local-first | Local-first |
| **Context assembly** | Manual + AGENTS.md | Agentic search + CLAUDE.md | Story-driven + agent commands |
| **Instruction files** | AGENTS.md (cascading) | CLAUDE.md (flat/hierarchical) | CLAUDE.md + agent task files |
| **Capability modules** | Skills (file-system, cross-platform) | Claude Code extensions | Task definitions + agent personas |
| **Session format** | JSONL (Thread/Turn/Item) | Markdown chat histories | Story files + YAML state |
| **Sandbox** | 3-mode × 3-policy matrix | Project-level firewalls | N/A (no sandbox layer) |
| **Tool protocol** | MCP + native tools | MCP (server + client) | Agent task execution |
| **Context limit** | Configurable; auto-compaction | 200K token window | Story-bounded |
| **Performance (SWE-bench)** | 69.1% | 72.7% | Not benchmarked |
| **Multi-surface** | YES (App Server unifies CLI/IDE/web) | Partial (CLI + IDE) | CLI-first (terminal) |
| **Push authority** | Any user | Any user | @devops ONLY |

### AGENTS.md vs CLAUDE.md vs AIOS Agent System

| Feature | AGENTS.md (Codex) | CLAUDE.md (Claude Code) | AIOS Agent Tasks |
|---------|-------------------|------------------------|------------------|
| Format | Pure Markdown | Pure Markdown | Markdown + YAML |
| Hierarchy | Cascading (global→repo→subdir) | Project + user level | Agent + task level |
| Override mechanism | `.override.md` suffix | Not formalized | Agent authority rules |
| Size limit | 32 KiB default (configurable) | Not documented | No explicit limit |
| Scope | Instructions for agent | Instructions for Claude | Task definitions with I/O contracts |
| Auto-discovery | YES (walks directory tree) | YES (project root) | YES (task registry) |
| Cross-platform | Open standard (agents.md) | Claude-specific | AIOS-specific |

### Session Management Comparison

| Aspect | Codex CLI | Claude Code | AIOS |
|--------|-----------|-------------|------|
| Persistence | JSONL files per session | Not persisted across sessions natively | Story files + state YAML |
| Resume | `codex resume` / `--last` | No native resume | Story status tracking |
| Compaction | Auto at threshold | Not documented | Story segmentation |
| Format | JSONL (Item events) | N/A | Markdown + YAML |

---

## Prioritized Recommendations (P0–P3)

### P0 — Critical / Immediate Action

**P0.1: Adopt AGENTS.md Cascading Pattern for CLAUDE.md**
- Codex's cascading instruction hierarchy (global → repo → subdirectory) is superior to a flat CLAUDE.md
- AIOS already has multi-level CLAUDE.md (workspace + project), but lacks subdirectory-level overrides
- **Action**: Extend AIOS to support `.claude/CLAUDE.override.md` at subdirectory level for squad-specific or story-specific context injection
- **Impact**: Context precision; reduces token waste from loading full project CLAUDE.md for narrow tasks

**P0.2: Implement Session Resume in AIOS/SYNAPSE**
- Codex's JSONL-based session resume (`codex resume --last`) addresses a critical pain point: losing agent context between terminal sessions
- AIOS currently uses story files for state but has no session-level continuity
- **Action**: Design SYNAPSE session persistence layer — JSONL event log per conversation, with resume command (`@synapse *resume`)
- **Impact**: Dramatically improves long-running story implementation continuity

### P1 — High Priority / Next Sprint

**P1.1: Adopt Skills as Cross-Platform Capability Standard**
- The open Skills standard (SKILL.md + `.agents/skills/`) is becoming the cross-platform capability exchange format
- AIOS agent task files are semantically equivalent but not cross-platform compatible
- **Action**: Evaluate exposing AIOS task definitions as Skills-compatible SKILL.md files in `.agents/skills/`, enabling external tools to consume AIOS capabilities
- **Impact**: Ecosystem interoperability; AIOS becomes a skill provider for Codex/Cursor/Copilot users

**P1.2: Implement Progressive Context Loading (Skills-style)**
- Codex's progressive disclosure (load metadata first, full content on demand) is a critical context efficiency pattern
- AIOS currently loads agent task definitions fully upfront in some workflows
- **Action**: Implement lazy loading for task definitions — load name/description into SYNAPSE index, load full task content only when task is activated
- **Impact**: Token efficiency; faster SYNAPSE startup

**P1.3: Sandbox/Approval Framework for AIOS Agents**
- Codex's 3×3 sandbox × approval matrix provides precise control over agent authority
- AIOS has agent authority rules (CLAUDE.md + agent-authority.md) but no technical enforcement layer
- **Action**: Design an approval gate system — before @dev executes destructive file operations or @devops pushes, require explicit human approval if `approval_policy != "never"`
- **Impact**: Security hardening; prevents accidental destructive operations

### P2 — Medium Priority / Backlog

**P2.1: JSONL Event Log for SYNAPSE Engine**
- Codex's JSONL format (Item/Turn/Thread) provides structured auditability
- SYNAPSE engine currently has no structured event log
- **Action**: Add JSONL event emission to `synapse-engine.cjs` — one JSON line per agent action, stored in `.synapse/sessions/YYYY/MM/DD/`
- **Impact**: Observability; enables `@sm *session-report` type commands

**P2.2: App Server Pattern for AIOS CLI Multi-Surface**
- Codex's App Server (unified API powering CLI + IDE + web) solves the multi-surface consistency problem
- AIOS has separate implementations for CLI, VS Code, etc.
- **Action**: Architect an AIOS App Server layer — single agent runtime exposed via JSON-RPC, consumed by different surfaces
- **Impact**: Enables consistent behavior across Claude Code, VS Code extension, and web dashboard

**P2.3: Configurable Byte Limits for CLAUDE.md**
- Codex's `project_doc_max_bytes` configuration addresses the reality that large CLAUDE.md files affect context efficiency
- AIOS CLAUDE.md files are growing large (especially combined with rules/)
- **Action**: Add CLAUDE.md size monitoring + warning in `aios doctor` — alert when combined CLAUDE.md + rules exceed 32 KiB
- **Impact**: Proactive context hygiene

### P3 — Low Priority / Research Track

**P3.1: Rust Core Evaluation for AIOS**
- Codex's Rust migration (from Node.js) provides: memory safety, native sandboxing, better performance
- AIOS is deeply Node.js/JavaScript ecosystem
- **Action**: Research feasibility of Rust for hot-path AIOS components (Synapse engine, activation pipeline) — not a migration, but hybrid approach
- **Impact**: Long-term performance and security posture

**P3.2: Monitor Codex App Server Protocol for MCP Lessons**
- Codex tried MCP first but abandoned it for the App Server because MCP's tool-oriented model didn't accommodate streaming diffs and approval flows
- AIOS is investing in MCP
- **Action**: Track this divergence — document what App Server solves that MCP doesn't, inform AIOS MCP integration strategy
- **Impact**: Avoid re-discovering Codex's architectural lessons in AIOS MCP implementation

**P3.3: Auto-Compaction Strategy for Long Story Sessions**
- Codex's auto-compaction (compress conversation history at threshold) addresses quadratic context growth
- Long AIOS story implementations degrade as context grows
- **Action**: Design AIOS-native compaction — when story session exceeds N tokens, auto-summarize previous decisions and compress dev notes
- **Impact**: Sustains agent quality across multi-hour story implementations

---

## Key Takeaways for AIOS/SYNAPSE

1. **The cascading instruction hierarchy is superior**: AGENTS.md's global → repo → subdirectory override model allows context to be precisely scoped. AIOS should adopt `.claude/CLAUDE.override.md` at subdirectory level.

2. **Skills are now the cross-platform standard**: The open Skills specification is gaining adoption across all major AI coding tools. AIOS task definitions are functionally equivalent — exposing them as Skills-compatible files would make AIOS an ecosystem contributor.

3. **Session continuity is a gap**: Claude Code (and AIOS by extension) lacks the session resume capability that Codex users consider essential. JSONL-based session persistence is a well-understood solution ready to implement.

4. **Sandbox authority enforcement**: Codex technically enforces agent authority through sandbox + approval policies. AIOS enforces authority through social/constitutional norms (CLAUDE.md rules). Adding a technical enforcement layer would close this gap.

5. **Progressive context loading is a pattern to adopt everywhere**: Codex's "load metadata first, full content on demand" philosophy should apply to AIOS task definitions, agent personas, and skill libraries.

6. **Compaction solves quadratic context growth**: Any long-running AIOS story session will eventually degrade. Auto-compaction (or story segmentation with summaries) is the proven mitigation pattern.

7. **App Server unification**: Codex's decision to power all surfaces from a single Rust core via JSON-RPC is architecturally sound. AIOS's CLI-first principle aligns with this — the App Server pattern is the natural evolution when multi-surface support is needed.

---

## Sources

- [OpenAI Codex CLI — Official Documentation](https://developers.openai.com/codex/cli/)
- [Codex CLI Features](https://developers.openai.com/codex/cli/features/)
- [Custom instructions with AGENTS.md — OpenAI](https://developers.openai.com/codex/guides/agents-md/)
- [Agent Skills — OpenAI Developer Docs](https://developers.openai.com/codex/skills/)
- [Codex Security / Sandbox Architecture](https://developers.openai.com/codex/security)
- [Codex Command Line Reference](https://developers.openai.com/codex/cli/reference/)
- [Unlocking the Codex Harness (App Server) — OpenAI Blog](https://openai.com/index/unlocking-the-codex-harness/)
- [OpenAI Begins Article Series on Codex CLI Internals — InfoQ](https://www.infoq.com/news/2026/02/codex-agent-loop/)
- [OpenAI Publishes Codex App Server Architecture — InfoQ](https://www.infoq.com/news/2026/02/opanai-codex-app-server/)
- [OpenAI Engineers Reveal Inner Workings of Codex CLI — Technology.org](https://www.technology.org/2026/01/27/openai-engineers-reveal-the-inner-workings-of-their-ai-coding-agent-codex-cli/)
- [Codex vs Claude Code — Builder.io Blog](https://www.builder.io/blog/codex-vs-claude-code)
- [Claude Code vs OpenAI Codex — Northflank](https://northflank.com/blog/claude-code-vs-openai-codex)
- [Claude Code vs Codex CLI — APIdog](https://apidog.com/blog/claude-code-vs-codex-cli/)
- [Codex CLI AGENTS.md Guide — JP Caparas / Medium](https://jpcaparas.medium.com/codex-guide-agents-md-cascading-rules-and-the-optional-agents-override-md-1f4c81767e92)
- [AGENTS.md at main — openai/codex GitHub](https://github.com/openai/codex/blob/main/AGENTS.md)
- [Skills for OpenAI Codex — blog.fsck.com](https://blog.fsck.com/2025/12/19/codex-skills/)
- [GitHub — openai/skills Skills Catalog](https://github.com/openai/skills)
- [Codex Session Report (Beta) — ccusage](https://ccusage.com/guide/codex/session)
- [How to Resume Sessions in Codex CLI — Inventive HQ](https://inventivehq.com/knowledge-base/openai/how-to-resume-sessions)
- [Token Usage Spikes in Codex CLI — GitHub Issue #6113](https://github.com/openai/codex/issues/6113)
- [AGENTS.md Silent Truncation Bug — GitHub Issue #7138](https://github.com/openai/codex/issues/7138)
- [Codex Usage Limits — APIdog](https://apidog.com/blog/solutions-to-codex-usage-limits/)
- [Introducing GPT-5.3-Codex — OpenAI](https://openai.com/index/introducing-gpt-5-3-codex/)
- [AGENTS.md Cross-Platform Standard — agents.md](https://agents.md/)
- [Codex CLI Deep Memory Dive — Mervin Praison](https://mer.vin/2025/12/openai-codex-cli-memory-deep-dive/)
- [Codex vs Claude Code — Composio](https://composio.dev/blog/claude-code-vs-openai-codex)
- [Codex CLI approval_policy Guide — SmartScope](https://smartscope.blog/en/generative-ai/chatgpt/codex-cli-approval-policy-implementation/)
- [Codex Changelog — OpenAI](https://developers.openai.com/codex/changelog/)

---

*Research completed: 2026-02-21*
*Story: NOG-9 — UAP & SYNAPSE Deep Research, Wave 4: Cross-IDE Ecosystem*
*Researcher: Claude Code (Sonnet 4.6) via `/tech-search`*
