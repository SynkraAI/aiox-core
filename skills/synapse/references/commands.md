# SYNAPSE Commands Reference

## Overview

SYNAPSE provides three categories of commands:
1. **Mode star-commands** — Switch response behavior (`*brief`, `*dev`, etc.)
2. **`*synapse` sub-commands** — Query and manage engine state
3. **CRUD operations** — Create, modify, and manage domains and rules

## Mode Star-Commands (L7)

These commands switch the response mode for the current session. They are detected by L7 (Star-Command processor) and inject mode-specific rules.

| Command | Behavior |
|---------|----------|
| `*brief` | Bullet points only, max 5 items, no code blocks unless requested, skip preamble |
| `*dev` | Code over explanation, minimal changes, follow existing patterns, skip docs unless needed |
| `*review` | Check code quality and patterns, identify bugs/security issues, suggest improvements with rationale |
| `*plan` | Outline approach before implementation, list files to modify, identify risks, estimate complexity |
| `*discuss` | Explore trade-offs and alternatives, ask clarifying questions, present pros/cons, recommend with reasoning |
| `*debug` | Analyze error messages and stack traces, check common failure patterns, suggest targeted fixes |
| `*explain` | Explain in teaching detail, use analogies, show examples with code, build from basics to advanced |

**Usage:** Type the command anywhere in your prompt. The mode persists for that response.

**Source:** `.synapse/commands` (KEY=VALUE format, `COMMANDS_RULE_{MODE}_{INDEX}`)

## `*synapse` Sub-Commands

These commands query or control the SYNAPSE engine state.

| Command | What it does |
|---------|-------------|
| `*synapse help` | Show available synapse commands and their descriptions |
| `*synapse status` | Display current state: active domains, layers, session info |
| `*synapse debug` | Show detailed debug info: manifest parse results, domain load times, rule counts |
| `*synapse domains` | List all registered domains with their state and trigger conditions |
| `*synapse session` | Show current session context: active agent, workflow, bracket level |
| `*synapse reload` | Force reload of manifest and all domain files from disk |

**Note:** These are read-only operations handled by the L7 star-command processor in the hook. They do not modify any files.

## CRUD Operations

These commands modify domain files and the manifest. They are implemented as Claude Code slash commands in `.claude/commands/synapse/`.

### Router

All CRUD operations go through the manager: `.claude/commands/synapse/manager.md`

The manager parses the sub-command and dispatches to the appropriate task file.

### Available Operations

| Command | Task File | Purpose |
|---------|-----------|---------|
| `*synapse create` | `tasks/create-domain.md` | Create new domain file + manifest entry |
| `*synapse add` | `tasks/add-rule.md` | Add a new rule to an existing domain |
| `*synapse edit` | `tasks/edit-rule.md` | Edit or remove a rule by index |
| `*synapse toggle` | `tasks/toggle-domain.md` | Toggle domain STATE between active/inactive |
| `*synapse command` | `tasks/create-command.md` | Create a new star-command definition |
| `*synapse suggest` | `tasks/suggest-domain.md` | Suggest the best domain for a given rule |

### Usage Examples

**Create a new domain:**
```
*synapse create
```
Prompts for: domain name, layer, description, initial rules.

**Add a rule to an existing domain:**
```
*synapse add global "Always prefer functional patterns over imperative"
```

**Toggle a domain off:**
```
*synapse toggle agent-dev
```

**Edit a specific rule:**
```
*synapse edit global 3
```
Opens rule at index 3 in `global` domain for editing.

**Create a new star-command:**
```
*synapse command
```
Prompts for: command name, behavior rules.

**Get domain suggestion for a rule:**
```
*synapse suggest "Use TypeScript strict mode"
```
Analyzes the rule content and suggests the best-fit domain.

## Command Categories Summary

```
Automatic per-event     -> HOOK   (synapse-engine.js, UserPromptSubmit)
User guidance/learning  -> SKILL  (synapse/SKILL.md + references)
User-invoked CRUD       -> COMMAND (synapse/manager.md + 6 tasks)
Read-state star-cmds    -> HOOK L7 (*synapse status, *synapse debug, *brief, *dev)
Write-file star-cmds    -> COMMAND (*synapse create, *synapse add, *synapse toggle)
```

## Source Files

| File | Purpose |
|------|---------|
| `.synapse/commands` | Star-command rule definitions (L7) |
| `.claude/commands/synapse/manager.md` | CRUD command router |
| `.claude/commands/synapse/tasks/*.md` | Individual CRUD task workflows |
| `.claude/commands/synapse/templates/` | Domain and manifest templates |
| `.claude/commands/synapse/utils/manifest-parser-reference.md` | Parser format reference |
