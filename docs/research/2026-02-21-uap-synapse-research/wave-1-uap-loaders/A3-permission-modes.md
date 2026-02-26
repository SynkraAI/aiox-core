# A3: Permission Modes -- Research Report

**Research Date:** 2026-02-21
**Researcher:** Atlas (Analyst Agent)
**Confidence Level:** HIGH (primary sources from official docs, cross-referenced)
**Status:** Complete

---

## Executive Summary

Permission mode systems in AI CLIs have converged on a **3-tier architecture** (read-only / supervised / autonomous) with OS-level sandbox enforcement as a complementary security layer. The AIOS PermissionMode loader already follows this pattern with its `explore/ask/auto` triad.

Key findings:

1. **Claude Code** uses 5 modes (`default`, `acceptEdits`, `plan`, `dontAsk`, `bypassPermissions`) with a deny-first rule evaluation order, managed settings for organizational override, and OS-level sandboxing as a separate complementary layer.
2. **Cursor** moved from per-command approval to **sandbox-based auto-approval** (February 2026), using OS-native primitives (Seatbelt on macOS, Landlock+seccomp on Linux, WSL2 on Windows), reducing interruptions by 40%.
3. **Codex CLI** separates **approval policy** (`untrusted/on-request/never`) from **sandbox mode** (`read-only/workspace-write/danger-full-access`), providing orthogonal control axes.
4. **OpenCode** implements per-agent permission rulesets with session-scoped approval caching and wildcard pattern matching -- the closest analogue to AIOS's per-agent mode system.
5. **Best practice**: Permissions should be **cached per-session** with fast detection on first load (file read + validation), not re-detected on every operation.

**Bottom line for AIOS:** The current 120ms budget is generous. Most CLIs detect permissions from a single config file read (<10ms). The AIOS PermissionMode loader should cache on first load (already does via `_loaded` flag) and could add IDE-aware detection for Claude Code's `settings.json` and Cursor's sandbox state as enrichment data.

---

## Projects & Solutions Found

### 1. Claude Code Permission System

**Source:** [Claude Code Permissions Documentation](https://code.claude.com/docs/en/permissions)

#### Permission Modes (defaultMode)

Claude Code implements 5 distinct permission modes configured via `settings.json`:

| Mode | Behavior | AIOS Equivalent |
|------|----------|-----------------|
| `default` | Prompts on first use of each tool | `ask` |
| `acceptEdits` | Auto-accepts file edits for session | (no equivalent) |
| `plan` | Analyze only, no modifications or execution | `explore` |
| `dontAsk` | Auto-denies unless pre-approved via rules | (no equivalent) |
| `bypassPermissions` | Skips all permission prompts | `auto` |

#### Rule Evaluation Order

Rules are evaluated as: **deny -> ask -> allow**. The first matching rule wins. This is a critical design decision -- deny always takes precedence regardless of where the rule is defined.

```json
{
  "permissions": {
    "defaultMode": "acceptEdits",
    "allow": ["Bash(npm run *)", "Bash(git commit *)"],
    "deny": ["Bash(git push *)"],
    "ask": ["Bash(docker *)"]
  }
}
```

#### Tiered Tool Permission Model

| Tool Type | Approval Required | "Don't Ask Again" Scope |
|-----------|-------------------|-------------------------|
| Read-only (file reads, Grep) | No | N/A |
| Bash commands | Yes | Permanent per project+command |
| File modification | Yes | Until session end |

#### Settings Precedence

```
Managed settings (highest)
  -> CLI arguments
    -> Local project (.claude/settings.local.json)
      -> Shared project (.claude/settings.json)
        -> User settings (~/.claude/settings.json)
```

#### Managed Settings (Enterprise)

Administrators deploy `managed-settings.json` to system directories:
- macOS: `/Library/Application Support/ClaudeCode/managed-settings.json`
- Linux/WSL: `/etc/claude-code/managed-settings.json`
- Windows: `C:\Program Files\ClaudeCode\managed-settings.json`

Key enterprise-only controls:
- `disableBypassPermissionsMode`: Prevent autonomous mode entirely
- `allowManagedPermissionRulesOnly`: Lock down all permission rules to admin-only
- `allowManagedHooksOnly`: Restrict hooks to managed ones only

#### Sandboxing (Complementary Layer)

Claude Code separates **permissions** (tool-level authorization) from **sandboxing** (OS-level Bash enforcement). The sandbox restricts filesystem and network access for Bash commands specifically, using the same deny rules from Read/Edit but enforced at the OS kernel level.

**Key insight:** Permissions and sandboxing are independent axes. Permissions control whether Claude *attempts* an action; sandboxing prevents Bash *processes* from escaping boundaries even if permissions allow them.

---

### 2. Cursor Permission and Sandbox System

**Sources:** [Cursor Agent Sandboxing](https://www.adwaitx.com/cursor-ai-agent-sandboxing-explained/), [Deep Dive on Agent Sandboxes](https://pierce.dev/notes/a-deep-dive-on-agent-sandboxes)

#### Architecture Evolution

Cursor moved from a **per-command approval model** (YOLO/auto-run toggle) to a **sandbox-first model** (February 2026), where agents run freely within controlled boundaries and only surface permission requests when they need to step outside.

#### Sandbox Implementation (OS-Native)

| Platform | Technology | Notes |
|----------|-----------|-------|
| macOS | Apple Seatbelt (`sandbox-exec`) | Deprecated since 2016 but still active; chosen over App Sandbox, containers, and VMs |
| Linux | Landlock + seccomp | Filesystem restrictions via Landlock, syscall filtering via seccomp |
| Windows | WSL2 sandbox | Runs Linux sandbox inside WSL2 until native primitives mature |

#### Permission Tier Architecture

Cursor's sandbox defines two zones:

1. **Auto-approved (inside sandbox):** File reads/writes within workspace, terminal commands within workspace, git operations (read)
2. **Requires approval (outside sandbox):** Network/internet access, modifications outside workspace, git push/remote operations

This reduces agent interruptions by **40%** compared to unsandboxed workflows (Cursor February 2026 production data).

#### Configuration

```
autoApprove: false (default)
maxFileChanges: configurable
allowedCommands: [list]
blockedPaths: [list]
```

**Key insight:** Cursor discovered that **sandbox boundaries** are more effective than per-tool approval. Users trust "anything inside my workspace" far more readily than approving individual commands.

---

### 3. Codex CLI Permission Model

**Sources:** [Codex Security](https://developers.openai.com/codex/security), [Codex Config](https://developers.openai.com/codex/config-basic/), [Codex CLI Reference](https://developers.openai.com/codex/cli/reference/)

#### Two Orthogonal Axes

Codex uniquely separates permission control into two independent dimensions:

**Axis 1: Approval Policy** (when to pause for human input)

| Policy | Behavior |
|--------|----------|
| `untrusted` | Maximum caution; only known-safe reads run automatically |
| `on-request` (default) | Pauses for sensitive actions (network, sandbox escape, mutations) |
| `never` | No approval dialogs at all |

**Axis 2: Sandbox Mode** (what filesystem/network access is allowed)

| Mode | Behavior |
|------|----------|
| `read-only` | File inspection only; approval for edits, commands, network |
| `workspace-write` (default) | Read+write within workspace; network disabled by default |
| `danger-full-access` | Unrestricted system access (requires `--yolo` flag) |

#### CLI Flags

```bash
# Approval policy
codex --ask-for-approval on-request    # -a flag

# Sandbox mode
codex --sandbox workspace-write        # -s flag

# Combined shortcuts
codex --full-auto                      # on-request + workspace-write
codex --yolo                           # never + danger-full-access
```

#### OS-Level Enforcement

| Platform | Technology |
|----------|-----------|
| macOS | Seatbelt via `sandbox-exec` |
| Linux | Landlock + seccomp (default), bwrap (alternative) |
| Windows | WSL sandbox (experimental) |

#### Protected Paths (Always Read-Only)

- `.git` directories
- `.agents` and `.codex` directories
- Recursively protected

#### Enterprise Controls

- `requirements.toml`: Blocks disallowed sandbox/approval combinations; cannot be overridden
- `managed_config.toml`: Sets defaults users can modify during session
- macOS MDM: Preference domain `com.openai.codex` with TOML payloads

#### Configuration Precedence

```
CLI flags (highest)
  -> Profile values (--profile)
    -> Project config (.codex/config.toml)
      -> User config (~/.codex/config.toml)
        -> System config (/etc/codex/config.toml)
          -> Built-in defaults
```

**Key insight:** The two-axis model (approval policy x sandbox mode) provides more flexibility than a single mode toggle. A developer can be in `workspace-write` sandbox with `on-request` approval -- allowing file changes freely but pausing for network access.

---

### 4. OpenCode Permission System

**Source:** [OpenCode Permission System (DeepWiki)](https://deepwiki.com/sst/opencode/5.2-permission-system)

#### Three-Action Model

Every tool request evaluates to one of: `allow`, `deny`, or `ask`.

#### Agent-Specific Rulesets

OpenCode assigns different default permission levels per agent type:

| Agent Type | Default Permissions |
|------------|-------------------|
| `build` | Auto-allows most operations |
| `plan` | Denies writes by default, asks for bash |
| `general` | Inherits from delegating parent agent |

This is the most similar model to AIOS's per-agent permission concept.

#### Ten Permission Categories

`bash`, `edit`, `write`, `read`, `grep`, `glob`, `list`, `webfetch`, `lsp`, `external_directory`, `task`

#### Session-Scoped Approval Cache

When a user approves with "always":
1. Pattern is stored in `approved[sessionID]`
2. Other pending permissions checked against new patterns
3. Covered operations auto-approve without prompts
4. Cache resets per session (not persistent)

#### Pattern Matching

Wildcard patterns where `*` matches characters within path segments. The bash tool generates command family patterns (e.g., `npm *`) enabling approval of command classes rather than individual invocations.

**Key insight:** Per-agent permission rulesets and session-scoped caching are directly applicable to AIOS. OpenCode's approach of different defaults per agent type mirrors AIOS's agent-specific permission concept.

---

### 5. Aider Permission Model

**Source:** [Agentic Coding Tools Guide](https://www.ikangai.com/agentic-coding-tools-explained-complete-setup-guide-for-claude-code-aider-and-cli-based-ai-development/)

Aider operates as a **Level 4 autonomous agent** with minimal supervision. Its permission model is simpler:

- File watcher with `ignore_permission_denied` for graceful degradation
- Approval logic for `/run` commands
- Human reviews outcomes rather than every action

Aider relies on **trust boundaries** rather than fine-grained permissions -- the user trusts the tool to operate within the repository, and reviews the cumulative diff rather than individual operations.

---

## Code Examples & Patterns

### Pattern 1: Config-File-Based Mode Detection (Claude Code)

```json
// ~/.claude/settings.json
{
  "permissions": {
    "defaultMode": "acceptEdits",
    "allow": ["Read", "Bash(npm *)"],
    "deny": ["Bash(rm -rf *)"],
    "ask": ["Bash(git push *)"]
  }
}
```

Detection: Single file read -> JSON parse -> extract `defaultMode` field.
Estimated cost: **<5ms** (file system read + JSON.parse).

### Pattern 2: Two-Axis Configuration (Codex CLI)

```toml
# ~/.codex/config.toml
approval_policy = "on-request"
sandbox_mode = "workspace-write"

[sandbox_workspace_write]
network_access = false
```

Detection: Single TOML read -> extract two fields.
Estimated cost: **<5ms** (similar to JSON pattern).

### Pattern 3: Session-Scoped Approval Cache (OpenCode)

```javascript
// Simplified from OpenCode's pattern
class PermissionCache {
  constructor() {
    this.approved = new Map(); // sessionId -> Set<pattern>
  }

  approve(sessionId, pattern) {
    if (!this.approved.has(sessionId)) {
      this.approved.set(sessionId, new Set());
    }
    this.approved.get(sessionId).add(pattern);
  }

  isApproved(sessionId, request) {
    const patterns = this.approved.get(sessionId);
    if (!patterns) return false;
    return [...patterns].some(p => this.matchPattern(p, request));
  }

  matchPattern(pattern, request) {
    // Wildcard matching: "npm *" matches "npm run build"
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return regex.test(request);
  }
}
```

### Pattern 4: Agent-Specific Defaults (OpenCode / AIOS Potential)

```javascript
// Per-agent permission defaults
const AGENT_PERMISSION_DEFAULTS = {
  dev: 'ask',         // Supervised by default (writes code)
  qa: 'explore',      // Read-only by default (reviews)
  devops: 'auto',     // Autonomous for CI/CD operations
  analyst: 'explore', // Read-only for research
  architect: 'ask',   // Supervised for design decisions
};
```

### Pattern 5: IDE-Aware Permission Detection

```javascript
// Detect permission mode from IDE-specific settings
async function detectIDEPermissionMode(projectRoot) {
  const detectors = [
    // Claude Code
    async () => {
      const settingsPath = path.join(projectRoot, '.claude', 'settings.json');
      const settings = JSON.parse(await fs.readFile(settingsPath, 'utf-8'));
      return mapClaudeMode(settings?.permissions?.defaultMode);
    },
    // Codex
    async () => {
      const configPath = path.join(projectRoot, '.codex', 'config.toml');
      const config = toml.parse(await fs.readFile(configPath, 'utf-8'));
      return mapCodexMode(config.approval_policy, config.sandbox_mode);
    },
    // AIOS native
    async () => {
      const configPath = path.join(projectRoot, '.aios', 'config.yaml');
      const config = yaml.load(await fs.readFile(configPath, 'utf-8'));
      return config?.permissions?.mode || 'ask';
    },
  ];

  for (const detector of detectors) {
    try {
      const mode = await detector();
      if (mode) return mode;
    } catch { continue; }
  }
  return 'ask'; // safe default
}
```

---

## Relevance to AIOS

### Current AIOS Implementation Analysis

The existing `PermissionMode` class at `.aios-core/core/permissions/permission-mode.js`:

**Strengths:**
- Clean 3-mode architecture (`explore/ask/auto`) maps well to industry patterns
- Load-once caching via `_loaded` flag
- Mode cycling (`*yolo` command) for quick toggling
- Visual badge system for greeting display
- Operation-level permission checking (`canPerform`)
- YAML config persistence in `.aios/config.yaml`
- Alias support (`yolo`->`auto`, `safe`->`explore`)

**Gaps relative to industry:**
1. **No IDE-aware detection**: Does not read Claude Code's `settings.json` or Codex's `config.toml` to inherit the host IDE's permission state
2. **No per-agent defaults**: All agents start at `ask` regardless of role (unlike OpenCode's agent-specific rulesets)
3. **No fine-grained rules**: Only mode-level control, no tool-specific allow/deny/ask patterns
4. **No session-scoped approval cache**: No way to approve a class of operations ("always allow npm commands")
5. **No enterprise/managed override**: No mechanism for organizational policy enforcement
6. **No sandbox integration**: Permission mode and OS-level sandboxing are not linked

### UAP Loader Performance

The current UAP allocates PermissionMode to **Tier 2 (High priority)** with a budget derived from elapsed time after Tier 1. The actual load operation is:

```javascript
const mode = new PermissionMode(this.projectRoot);
await mode.load();  // Single YAML file read
return { mode: mode.currentMode, badge: mode.getBadge() };
```

This involves:
1. Single file read (`.aios/config.yaml`)
2. YAML parse
3. Mode validation
4. Badge generation

**Estimated actual cost: 5-15ms** -- well within the 120ms budget.

---

## Recommendations

### R1: Keep 3-Mode Architecture (HIGH CONFIDENCE)

The `explore/ask/auto` triad is the industry standard. Claude Code, Codex, and OpenCode all implement variations of read-only / supervised / autonomous. No change needed to the core model.

### R2: Add IDE-Aware Permission Detection (MEDIUM CONFIDENCE)

Enrich the PermissionMode loader with optional IDE detection to display the host IDE's actual permission state alongside the AIOS mode. This is informational enrichment, not a replacement.

```
Badge: [ASK] (Claude: acceptEdits)
```

**Trade-off:** Adds 5-10ms latency for additional file reads. Mitigated by running in parallel with other Tier 2 loaders (already the case in the UAP).

### R3: Implement Per-Agent Defaults (HIGH CONFIDENCE)

Following OpenCode's pattern, assign sensible default modes per agent role:

| Agent | Default Mode | Rationale |
|-------|-------------|-----------|
| `dev` | `ask` | Writes code; needs supervision |
| `qa` | `explore` | Primarily reads and analyzes |
| `devops` | `auto` | CI/CD needs autonomous execution |
| `analyst` | `explore` | Research is read-heavy |
| `architect` | `ask` | Design decisions need confirmation |
| `po`, `pm`, `sm` | `ask` | Document operations need supervision |

Implementation: Add `defaultPermissionMode` field to agent YAML definitions. The PermissionMode loader checks for agent-specific override before falling back to global config.

### R4: Cache Strategy -- Session-Scoped, Not Per-Activation (HIGH CONFIDENCE)

The current `_loaded` flag is correct for per-instance caching. Industry consensus:

- **DO cache** permission mode for the session lifetime
- **DO NOT** re-read config on every operation
- **DO** allow runtime cycling via `*yolo` / `*mode` commands (already implemented)
- **DO NOT** persist session approvals across sessions (security risk)

The 120ms budget is generous. The actual load cost is <15ms. The remaining budget provides headroom for IDE detection enrichment.

### R5: Add Tool-Level Permission Rules (FUTURE, LOW PRIORITY)

Claude Code's `allow/deny/ask` pattern with tool specifiers is powerful but complex. For AIOS, this could be a v2 enhancement:

```yaml
# .aios/config.yaml (future)
permissions:
  mode: ask
  rules:
    allow:
      - "bash(npm *)"
      - "bash(git status)"
    deny:
      - "bash(git push *)"
    ask:
      - "bash(docker *)"
```

This should wait until there is demonstrated user demand. The 3-mode system is sufficient for most workflows.

### R6: Organizational Override (FUTURE, LOW PRIORITY)

Following Claude Code's managed settings pattern, support a system-level config that cannot be overridden by project or user settings. Relevant for team deployments. Lower priority for current stage.

---

## Comparative Matrix

| Feature | Claude Code | Cursor | Codex CLI | OpenCode | AIOS (Current) | AIOS (Recommended) |
|---------|------------|--------|-----------|----------|----------------|---------------------|
| **Permission Modes** | 5 modes | 2 zones (sandbox/outside) | 3 approval x 3 sandbox | 3 actions | 3 modes | 3 modes (keep) |
| **Default Mode** | `default` (prompt) | sandbox auto-approve | `on-request` + `workspace-write` | agent-specific | `ask` | agent-specific defaults |
| **Config Format** | JSON (`settings.json`) | `.cursorrules` | TOML (`config.toml`) | Code-defined | YAML (`.aios/config.yaml`) | YAML (keep) |
| **Rule Granularity** | Tool-specific with wildcards | Zone-based | Policy x Sandbox matrix | 10 categories + wildcards | Mode-level only | Mode-level + future rules |
| **Eval Order** | deny -> ask -> allow | sandbox boundary check | policy + sandbox check | agent ruleset match | mode lookup | mode lookup (keep) |
| **Session Caching** | Per-command permanent | Per-sandbox-zone | Per-session | Per-session | Per-instance (`_loaded`) | Per-instance (keep) |
| **OS Sandboxing** | Separate layer (Seatbelt/Landlock) | Integrated (Seatbelt/Landlock/WSL2) | Integrated (Seatbelt/Landlock) | No | No | No (IDE handles this) |
| **Enterprise Override** | Managed settings (system dirs) | Limited | `requirements.toml` | Plugin hooks | None | Future consideration |
| **IDE-Aware** | N/A (is the IDE) | N/A (is the IDE) | N/A (is the IDE) | N/A | No | Add as enrichment (R2) |
| **Per-Agent Defaults** | No | No | No | Yes | No | Yes (R3) |
| **Runtime Toggle** | `/permissions` | Settings UI | `/permissions` | Code-only | `*yolo` / `*mode` | Keep current |
| **Detection Latency** | <5ms (JSON) | N/A | <5ms (TOML) | <1ms (in-memory) | <15ms (YAML) | <20ms with IDE detection |

---

## Sources

- [Claude Code Permissions Documentation](https://code.claude.com/docs/en/permissions) -- Primary source for Claude Code's permission model
- [Claude Code Settings Reference](https://code.claude.com/docs/en/settings) -- defaultMode and settings.json configuration
- [How to Set Claude Code Permission Mode](https://claudelog.com/faqs/how-to-set-claude-code-permission-mode/) -- Practical mode configuration guide
- [Claude Code Bypass Permissions VS Code](https://rajeevpentyala.com/2026/02/05/claude-code-vs-code-extension-enable-bypass-permissions-mode/) -- VS Code extension permissions
- [Codex CLI Security](https://developers.openai.com/codex/security) -- Sandbox architecture and OS-level enforcement
- [Codex CLI Config Basics](https://developers.openai.com/codex/config-basic/) -- Approval modes and sandbox configuration
- [Codex CLI Reference](https://developers.openai.com/codex/cli/reference/) -- CLI flags for permissions and approvals
- [Cursor Agent Sandboxing Explained](https://www.adwaitx.com/cursor-ai-agent-sandboxing-explained/) -- Cursor's sandbox model and 40% interruption reduction
- [Deep Dive on Agent Sandboxes](https://pierce.dev/notes/a-deep-dive-on-agent-sandboxes) -- Cross-platform sandbox comparison
- [Cursor AI Architecture](https://medium.com/@lakkannawalikar/cursor-ai-architecture-system-prompts-and-tools-deep-dive-77f44cb1c6b0) -- Cursor system prompts and tools
- [OpenCode Permission System](https://deepwiki.com/sst/opencode/5.2-permission-system) -- Agent-specific rulesets and session caching
- [AI Agent Permissions (Oso)](https://www.osohq.com/learn/ai-agent-permissions-delegated-access) -- Delegated access patterns
- [Best Practices for AI Agent Authorization (Oso)](https://www.osohq.com/learn/best-practices-of-authorizing-ai-agents) -- Industry authorization patterns
- [AI Agent Access Control (WorkOS)](https://workos.com/blog/ai-agent-access-control) -- Enterprise access control patterns
- [Permission Management for AI Agents (Cerbos)](https://www.cerbos.dev/blog/permission-management-for-ai-agents) -- Fine-grained authorization
- [Claude Code Sandboxing Guide](https://claudefa.st/blog/guide/sandboxing-guide) -- OS-level sandboxing details
- [Settings.json Guide for Claude Code](https://www.eesel.ai/blog/settings-json-claude-code) -- Practical settings configuration
- [Claude Code Permissions and Security](https://www.petefreitag.com/blog/claude-code-permissions/) -- Security considerations

---

*Research completed by Atlas (Analyst Agent) -- 2026-02-21*
*Synkra AIOS -- CLI First | Task-First | Constitution*
