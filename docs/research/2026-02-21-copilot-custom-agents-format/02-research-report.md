# Research Report: GitHub Copilot Custom Agents Format

## 1. The Official GitHub Copilot Custom Agent Format

### 1.1 File Structure

GitHub Copilot custom agents use **Markdown files with YAML frontmatter**:

```markdown
---
name: agent-name
description: 'Brief description of agent capabilities'
tools: ['read', 'edit', 'search']
---

# Agent Instructions

Markdown content defining the agent's behavior, expertise, and instructions.
Maximum 30,000 characters.
```

### 1.2 File Naming & Location

| Property | Specification |
|----------|--------------|
| Extension | `.agent.md` (recommended) or `.md` |
| Characters | Only `. - _ a-z A-Z 0-9` |
| Convention | Lowercase with hyphens (e.g., `code-reviewer.agent.md`) |
| Location | `.github/agents/` (repository-level) |
| Deduplication | Filename (minus extension) used as unique ID across config levels |

### 1.3 YAML Frontmatter Properties

| Property | Required | Type | Description |
|----------|----------|------|-------------|
| `description` | **YES** | string | Explains agent purpose and capabilities |
| `name` | No | string | Display name; defaults to filename |
| `tools` | No | list/string | Tool access control; omit = all tools |
| `target` | No | string | `vscode` or `github-copilot`; omit = both |
| `model` | No | string | AI model (IDE only, ignored on github.com) |
| `disable-model-invocation` | No | boolean | Prevent automatic selection (default: false) |
| `mcp-servers` | No | object | MCP config (org/enterprise only, NOT repo-level) |
| `metadata` | No | object | Key-value annotation pairs |

### 1.4 Tools Configuration

```yaml
# All tools (default when omitted)
tools: ['*']

# Specific tools
tools: ['read', 'edit', 'search', 'execute', 'web', 'todo', 'agent']

# MCP server tools
tools: ['read', 'edit', 'custom-mcp/tool-name', 'custom-mcp/*']

# No tools
tools: []
```

Built-in tool aliases (case-insensitive): `execute`, `read`, `edit`, `search`, `agent`, `web`, `todo`

Unrecognized tool names are **silently ignored**.

### 1.5 Prompt Body

- Standard Markdown below the frontmatter
- Maximum **30,000 characters**
- Defines agent behavior, expertise, and instructions
- No special wrappers needed (no `chatagent` fences)

## 2. Copilot-Instructions vs Custom Agents

| Aspect | copilot-instructions.md | Custom Agents (.agent.md) |
|--------|------------------------|--------------------------|
| **Activation** | Always-on (every request) | On-demand (user selects) |
| **Purpose** | Project-wide rules, conventions | Task-specific personas/workflows |
| **Location** | `.github/copilot-instructions.md` | `.github/agents/*.agent.md` |
| **Frontmatter** | Limited (name, description, glob) | Extended (tools, model, target, mcp) |
| **System prompt layer** | Layer 4 (lower priority) | Layer 5 (overrides instructions) |
| **Tool control** | No | Yes (enable/disable tools) |

**Key insight:** Custom agents override copilot-instructions since they append to the system prompt afterward.

## 3. Real-World Examples

### 3.1 From GitHub's awesome-copilot Repository

```yaml
---
name: readme-specialist
description: 'Specialized agent for creating and improving README files'
tools: ['read', 'search', 'edit']
---

# README Specialist
You help users create clear, well-structured README files...
```

```yaml
---
name: azure-terraform-iac-specialist
description: 'Infrastructure-as-code expert focusing on Terraform and Azure'
tools: ['read', 'search', 'edit']
model: 'claude-opus-4.6'
---
```

```yaml
---
name: api-architect
description: 'API design specialist for REST, GraphQL, and distributed systems'
tools: ['read', 'search', 'edit']
---
```

### 3.2 Community Patterns

- File naming: lowercase, hyphen-separated
- Description: single-quoted strings
- Tools: most agents use `['read', 'edit', 'search']`
- Prompt: focused on role, expertise, and behavioral guidelines

## 4. Limitations & Gotchas

1. **30,000 character limit** for prompt body
2. **Platform inconsistency**: `model`, `argument-hint`, `handoffs` work differently or are ignored between GitHub.com and IDEs
3. **MCP servers**: NOT available for repository-level agents (only org/enterprise)
4. **Context window**: Agents autonomously load files, potentially exceeding context
5. **Preview status**: JetBrains, Eclipse, Xcode support is in public preview
6. **No `.chatagent` wrapper**: Copilot does NOT use code fence wrappers

## 5. Current AIOS Implementation (Root Cause of #138)

### 5.1 Current Architecture

```
.aios-core/development/agents/*.md    (source of truth)
         |
         v
    IDE Sync Script (ide-sync/index.js)
         |
    +----+----+----+----+----+
    |    |    |    |    |    |
    v    v    v    v    v    v
  Claude Cursor Codex Gemini Copilot AntiGravity
  Code                       (BROKEN)
```

### 5.2 The Problem

GitHub Copilot in `core-config.yaml` uses format `full-markdown-yaml` which maps to the **Claude Code transformer** (identity transform). This means:

1. Files are copied as-is from `.aios-core/development/agents/`
2. No YAML frontmatter (`---`) is added
3. No `.agent.md` extension is used
4. The full activation-instructions + embedded YAML blocks are preserved
5. Files are ~22KB each (may approach 30K limit for larger agents)

### 5.3 What Copilot Gets vs What It Expects

**Current (broken):**
```markdown
# dev

ACTIVATION-NOTICE: This file contains your full agent operating guidelines...

## COMPLETE AGENT DEFINITION FOLLOWS

```yaml
agent:
  name: Dex
  id: dev
  title: Full Stack Developer
  ...
```

**Expected:**
```markdown
---
name: dev
description: 'Full Stack Developer for code implementation, debugging, and development best practices'
tools: ['read', 'edit', 'search', 'execute']
---

# Dev Agent (Dex)

You are an expert Senior Software Engineer and Implementation Specialist...
```

## Sources

- [GitHub Docs - Custom Agents Configuration](https://docs.github.com/en/copilot/reference/custom-agents-configuration) (HIGH)
- [GitHub Docs - Creating Custom Agents](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/create-custom-agents) (HIGH)
- [VS Code - Custom Agents](https://code.visualstudio.com/docs/copilot/customization/custom-agents) (HIGH)
- [GitHub awesome-copilot](https://github.com/github/awesome-copilot) (HIGH)
- [About Custom Agents](https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-custom-agents) (HIGH)
- [Prompt Files vs Instructions vs Agents](https://gist.github.com/burkeholland/435ab18c549ddbefde1846165e8b2e08) (HIGH)
