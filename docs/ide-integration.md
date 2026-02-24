# IDE Integration Guide

> **EN**

---

Guide for integrating AIOS with supported IDEs and AI development platforms.

**Version:** 4.2.11
**Last Updated:** 2026-02-16

---

## Compatibility Contract (AIOS 4.2.11)

The IDE matrix is enforced by a versioned contract:

- Contract file: `.aios-core/infrastructure/contracts/compatibility/aios-4.2.11.yaml`
- Validator: `npm run validate:parity`

If matrix claims in this document diverge from validator results, parity validation fails.

---

## Supported IDEs

AIOS supports multiple AI-powered development platforms. Choose the one that best fits your workflow.

### Quick Status Matrix (AIOS 4.2.11)

| IDE/CLI | Overall Status | How to Activate an Agent | Auto-Checks Before/After Actions | Workaround if Limited |
| --- | --- | --- | --- | --- |
| Claude Code | Works | `/agent-name` commands | Works (full) | -- |
| Gemini CLI | Works | `/aios-menu` then `/aios-<agent>` | Works (minor differences in event handling) | -- |
| Codex CLI | Limited | `/skills` then `aios-<agent-id>` | Limited (some checks need manual sync) | Run `npm run sync:ide:codex` and follow `/skills` flow |
| Cursor | Limited | `@agent` + synced rules | Not available | Follow synced rules and run validators manually (`npm run validate:parity`) |
| GitHub Copilot | Limited | chat modes + repo instructions | Not available | Use repo instructions and VS Code MCP config for context |
| AntiGravity | Limited | workflow-driven activation | Not available | Use generated workflows and run validators manually |

Legend:
- `Works`: fully recommended for new users in AIOS 4.2.11.
- `Limited`: usable with the documented workaround.
- `Not available`: this IDE does not offer this capability; use the workaround instead.

### What You Lose Without Full Auto-Checks

Some IDEs run automatic checks before and after each action (e.g., validating context, enforcing rules). Where this is not available, you compensate manually:

| IDE | Auto-Check Level | What Is Reduced | How to Compensate |
| --- | --- | --- | --- |
| Claude Code | Full | Nothing | Built-in checks handle everything |
| Gemini CLI | High | Minor timing differences in checks | Gemini native checks cover most scenarios |
| Codex CLI | Partial | Less automatic session tracking; some pre/post-action checks need manual trigger | Use `AGENTS.md` + `/skills` + sync/validation scripts |
| Cursor | None | No automatic pre/post-action checks; no automatic audit trail | Follow synced rules, use MCP for context, run validators |
| GitHub Copilot | None | Same as Cursor, plus more reliance on manual workflow | Use repo instructions, chat modes, VS Code MCP |
| AntiGravity | None | No automatic check equivalents | Use generated workflows and run validators |

### Beginner Decision Guide

If your goal is to get started as fast as possible:

1. **Best option:** Use `Claude Code` or `Gemini CLI` -- they have the most automation and fewest manual steps.
2. **Good option:** Use `Codex CLI` if you prefer a terminal-first workflow and can follow the `/skills` activation flow.
3. **Usable with extra steps:** Use `Cursor`, `Copilot`, or `AntiGravity` -- they work but require more manual validation steps (see workarounds in the table above).

### Practical Consequences by Capability

- **Session tracking** (automatic start/end detection):
  - Automatic on Claude Code and Gemini CLI.
  - Manual or partial on Codex, Cursor, Copilot, and AntiGravity.
- **Pre/post-action guardrails** (checks that run before and after each tool use):
  - Full on Claude Code and Gemini CLI.
  - Partial on Codex CLI (run sync scripts to compensate).
  - Not available on Cursor, Copilot, and AntiGravity (run validators manually).
- **Automatic audit trail** (record of what happened in each session):
  - Richest on Claude Code and Gemini CLI.
  - Reduced on other IDEs (compensate with manual logging or validator output).

---

## Setup Instructions

### Claude Code

**Recommendation Level:** Best AIOS integration

```yaml
config_file: .claude/CLAUDE.md
agent_folder: .claude/commands/AIOS/agents
activation: /agent-name (slash commands)
format: full-markdown-yaml
mcp_support: native
special_features:
  - Task tool for subagents
  - Native MCP integration
  - Hooks system (pre/post)
  - Custom skills
  - Memory persistence
```

**Setup:**

1. AIOS automatically creates `.claude/` directory on init
2. Agents are available as slash commands: `/dev`, `/qa`, `/architect`
3. Configure MCP servers in `~/.claude.json`

**Configuration:**

```bash
# Sync all enabled IDE targets (including Claude)
npm run sync:ide

# Verify setup
ls -la .claude/commands/AIOS/agents/
```

---

### Codex CLI

**Recommendation Level:** Best (terminal-first workflow)

```yaml
config_file: AGENTS.md
agent_folder: .codex/agents
activation: terminal instructions
skills_folder: .codex/skills (source), ~/.codex/skills (Codex menu)
format: markdown
mcp_support: native via Codex tooling
special_features:
  - AGENTS.md project instructions
  - /skills activators (aios-<agent-id>)
  - Strong CLI workflow support
  - Easy integration with repository scripts
  - Notify command plus emerging tool hooks in recent Codex releases
```

**Setup:**

1. Keep `AGENTS.md` at repository root
2. Run `npm run sync:ide:codex` to sync auxiliary agent files
3. Run `npm run sync:skills:codex` to generate project-local skills in `.codex/skills`
4. Use `/skills` and choose `aios-architect`, `aios-dev`, etc.
5. Use `npm run sync:skills:codex:global` only when you explicitly want global installation

**Configuration:**

```bash
# Sync Codex support files
npm run sync:ide:codex
npm run sync:skills:codex
npm run validate:codex-sync
npm run validate:codex-integration
npm run validate:codex-skills

# Verify setup
ls -la AGENTS.md .codex/agents/ .codex/skills/
```

---

### Cursor

**Recommendation Level:** Best (popular AI IDE)

```yaml
config_file: .cursor/rules.md
agent_folder: .cursor/rules
activation: @agent-name
format: condensed-rules
mcp_support: via configuration
special_features:
  - Composer integration
  - Chat modes
  - @codebase context
  - Multi-file editing
  - Subagents and cloud handoff support (latest Cursor releases)
  - Long-running agent workflows (research preview)
```

**Setup:**

1. AIOS creates `.cursor/` directory on init
2. Agents activated with @mention: `@dev`, `@qa`
3. Rules synchronized to `.cursor/rules/`

**Configuration:**

```bash
# Sync Cursor only
npm run sync:ide:cursor

# Verify setup
ls -la .cursor/rules/
```

**MCP Configuration (`.cursor/mcp.json`):**

```json
{
  "mcpServers": {
    "context7": {
      "url": "https://mcp.context7.com/sse"
    }
  }
}
```

---

### GitHub Copilot

**Recommendation Level:** Good (GitHub integration)

```yaml
config_file: .github/copilot-instructions.md
agent_folder: .github/agents
activation: chat modes
format: text
mcp_support: via VS Code MCP config
special_features:
  - GitHub integration
  - PR assistance
  - Code review
  - Works with repo instructions and VS Code MCP config
```

**Setup:**

1. Enable GitHub Copilot in your repository
2. AIOS creates `.github/copilot-instructions.md`
3. Agent instructions synchronized

**Configuration:**

```bash
# Sync all enabled IDE targets
npm run sync:ide

# Verify setup
cat .github/copilot-instructions.md
```

---

### AntiGravity

**Recommendation Level:** Good (Google integration)

```yaml
config_file: .antigravity/rules.md
config_json: .antigravity/antigravity.json
agent_folder: .agent/workflows
activation: workflow-based
format: cursor-style
mcp_support: native (Google)
special_features:
  - Google Cloud integration
  - Workflow system
  - Native Firebase tools
```

**Setup:**

1. AIOS creates `.antigravity/` directory
2. Configure Google Cloud credentials
3. Agents synchronized as workflows

---

### Gemini CLI

**Recommendation Level:** Good

```yaml
config_file: .gemini/rules.md
agent_folder: .gemini/rules/AIOS/agents
activation: slash launcher commands
format: text
mcp_support: native
special_features:
  - Google AI models
  - CLI-based workflow
  - Multimodal support
  - Native hooks events and hook commands
  - Native MCP server support
  - Rapidly evolving command/tooling UX
```

**Setup:**

1. Run installer flow selecting `gemini` in IDE selection (wizard path)
2. AIOS creates:
   - `.gemini/rules.md`
   - `.gemini/rules/AIOS/agents/*.md`
   - `.gemini/commands/*.toml` (`/aios-menu`, `/aios-<agent>`)
   - `.gemini/hooks/*.js`
   - `.gemini/settings.json` (hooks enabled)
3. Validate integration:

```bash
npm run sync:ide:gemini
npm run validate:gemini-sync
npm run validate:gemini-integration
```

4. Quick agent activation (recommended):
   - `/aios-menu` to list shortcuts
   - `/aios-dev`, `/aios-architect`, `/aios-qa`, etc.
   - `/aios-agent <agent-id>` for generic launcher

---

## Sync System

### How Sync Works

AIOS maintains a single source of truth for agent definitions and synchronizes them to all configured IDEs:

```
┌─────────────────────────────────────────────────────┐
│                    AIOS Core                         │
│  .aios-core/development/agents/  (Source of Truth)  │
│                        │                             │
│            ┌───────────┼───────────┐                │
│            ▼           ▼           ▼                │
│  .claude/     .codex/      .cursor/                  │
│  .antigravity/ .gemini/                              │
└─────────────────────────────────────────────────────┘
```

### Sync Commands

```bash
# Sync all IDE targets
npm run sync:ide

# Sync only Gemini
npm run sync:ide:gemini
npm run sync:ide:github-copilot
npm run sync:ide:antigravity

# Validate sync
npm run sync:ide:check
```

### Automatic Sync

AIOS can be configured to automatically sync on agent changes:

```yaml
# .aios-core/core/config/sync.yaml
auto_sync:
  enabled: true
  watch_paths:
    - .aios-core/development/agents/
  platforms:
    - claude
    - codex
    - github-copilot
    - cursor
    - gemini
    - antigravity
```

---

## Troubleshooting

### Agent Not Appearing in IDE

```bash
# Verify agent exists in source
ls .aios-core/development/agents/

# Sync and validate
npm run sync:ide
npm run sync:ide:check

# Check platform-specific directory
ls .cursor/rules/agents/               # Cursor
ls .claude/commands/AIOS/agents/       # Claude Code
ls .gemini/rules/AIOS/agents/          # Gemini CLI
```

### Sync Conflicts

```bash
# Preview what would change
npm run sync:ide -- --dry-run

# Backup before force sync
cp -r .cursor/rules/ .cursor/rules.backup/
npm run sync:ide
```

### MCP Not Working

```bash
# Check MCP status
aios mcp status

# Verify MCP configuration for IDE
cat ~/.claude.json  # For Claude Code
cat .cursor/mcp.json  # For Cursor
```

### IDE-Specific Issues

**Claude Code:**

- Ensure `.claude/` is in project root
- Check hooks permissions: `chmod +x .claude/hooks/*.py`

**Cursor:**

- Restart Cursor after sync
- Check `.cursor/rules/` permissions

## Platform Decision Guide

Use this guide to choose the right platform:

```
Do you use Claude/Anthropic API?
├── Yes --> Claude Code (Best AIOS integration)
└── No
    └── Do you prefer VS Code?
        ├── Yes --> Want an extension?
        │   ├── Yes --> GitHub Copilot (Native GitHub features)
        │   └── No --> GitHub Copilot (Native GitHub features)
        └── No --> Want a dedicated AI IDE?
            ├── Yes --> Which model do you prefer?
            │   ├── Claude/GPT --> Cursor (Most popular AI IDE)
            └── No --> Use Google Cloud?
                ├── Yes --> AntiGravity (Google integration)
                └── No --> Gemini CLI (Specialized)
```

---

## Migration Between IDEs

### From Cursor to Claude Code

```bash
# Export current rules
cp -r .cursor/rules/ ./rules-backup/

# Initialize Claude Code
npm run sync:ide

# Verify migration
diff -r ./rules-backup/ .claude/commands/AIOS/agents/
```

### From Claude Code to Cursor

```bash
# Sync to Cursor
npm run sync:ide:cursor

# Configure MCP (if needed)
# Copy MCP config to .cursor/mcp.json
```

---

## Related Documentation

- [Claude Code Guide](./pt/platforms/claude-code.md)
- [Cursor Guide](./pt/platforms/cursor.md)
- [Agent Selection Guide](./guides/agent-selection-guide.md)
- [MCP Global Setup](./guides/mcp-global-setup.md)

---

_Synkra AIOS IDE Integration Guide v4.2.11_
