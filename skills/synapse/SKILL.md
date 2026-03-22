---
name: synapse
description: "This skill should be used when users want to understand the SYNAPSE context engine, manage domains, configure context rules, or troubleshoot rule injection. Use when asked about SYNAPSE architecture, domain management, star-commands, context brackets, or the 8-layer processing pipeline."
---

# SYNAPSE Context Engine

## Overview

SYNAPSE (Synkra Adaptive Processing & State Engine) is the unified context engine for AIOS. It injects contextual rules into every prompt via an 8-layer processing pipeline, adapting to context window usage through bracket-aware filtering.

**What it does:**
- Injects rules per-prompt via Claude Code's `UserPromptSubmit` hook
- Processes 8 layers (L0 Constitution through L7 Star-Commands) sequentially
- Adapts injection volume based on context brackets (FRESH/MODERATE/DEPLETED/CRITICAL)
- Integrates with agent state (active agent, workflow, task, squad)
- Outputs `<synapse-rules>` XML block appended to each prompt

**What it replaces:** SYNAPSE replaces the legacy CARL system with full feature parity plus 8 new capabilities including agent-scoped domains, workflow activation, and CRUD management commands.

**Architecture model:** Open Core — the 8-layer engine lives in `aios-core` (open source), memory integration is feature-gated in `aios-pro`.

## Quick Start

### Verify SYNAPSE is Active

SYNAPSE runs automatically via the Claude Code hook. To check status:

```
*synapse status
```

This shows: active domains, current bracket, session info, and loaded layers.

### Basic Commands

| Command | What it does |
|---------|-------------|
| `*synapse status` | Show current engine state |
| `*synapse domains` | List all registered domains |
| `*synapse debug` | Show detailed debug info (manifest parse, load times, rule counts) |
| `*synapse help` | Show all available synapse commands |
| `*brief` | Switch to brief response mode |
| `*dev` | Switch to developer mode (code-focused) |
| `*review` | Switch to code review mode |

### Create a Custom Domain

```
*synapse create
```

This walks you through creating a new domain file + manifest entry. See [references/domains.md](references/domains.md) for the full domain guide.

## Architecture

SYNAPSE operates as a 4-layer architecture:

```
.claude/hooks/synapse-engine.js          # Layer 1: Hook Entry (~50 lines)
        |
        v imports
.aios-core/core/synapse/                 # Layer 2: Engine Modules
|-- engine.js                            #   SynapseEngine class
|-- layers/                              #   8 layer processors (L0-L7)
|-- session/session-manager.js           #   Session state (JSON v2.0)
|-- domain/domain-loader.js              #   Manifest + domain parser
|-- context/context-tracker.js           #   Bracket calculation
|-- memory/memory-bridge.js              #   Pro-gated MIS consumer
|-- output/formatter.js                  #   <synapse-rules> XML
        |
        v reads/writes
.synapse/                                # Layer 3: Runtime Data
|-- manifest                             #   Central domain registry (KEY=VALUE)
|-- constitution, global, context        #   Core domains (L0, L1)
|-- agent-*, workflow-*                  #   Scoped domains (L2, L3)
|-- commands                             #   Star-command definitions (L7)
|-- sessions/, cache/                    #   Session state (gitignored)
        |
        v user-invoked
.claude/commands/synapse/                # Layer 4: CRUD Commands + Skill Docs
|-- manager.md                           #   Router/dispatcher
|-- tasks/ (6 tasks)                     #   create, add, edit, toggle, command, suggest
```

**Key principle:** SYNAPSE is a **consumer** of existing systems (UAP for session state, MIS for memories). It never rewrites code from other epics.

## References

### Reference Guides

| Guide | Description |
|-------|-------------|
| [domains.md](references/domains.md) | Domain types (L0-L7), KEY=VALUE format, creation guide |
| [commands.md](references/commands.md) | Star-commands, *synapse sub-commands, CRUD operations |
| [manifest.md](references/manifest.md) | Manifest format specification, all valid keys |
| [brackets.md](references/brackets.md) | Context bracket system, token budgets, layer activation |
| [layers.md](references/layers.md) | 8-layer processor architecture, priority, conflict resolution |

### Assets (Templates)

Templates for creating custom domains and manifest entries are maintained at:

- **Domain template:** `.claude/commands/synapse/templates/domain-template`
- **Manifest entry template:** `.claude/commands/synapse/templates/manifest-entry-template`

See [assets/README.md](assets/README.md) for details.

### CRUD Commands

For domain management operations, use the SYNAPSE manager:

| Command | Purpose |
|---------|---------|
| `*synapse create` | Create new domain + manifest entry |
| `*synapse add` | Add rule to existing domain |
| `*synapse edit` | Edit or remove rule by index |
| `*synapse toggle` | Toggle domain active/inactive |
| `*synapse command` | Create new star-command |
| `*synapse suggest` | Suggest best domain for a rule |

Full details: [references/commands.md](references/commands.md)

## Key Files

| File | Purpose |
|------|---------|
| `.claude/hooks/synapse-engine.js` | Hook entry point (UserPromptSubmit) |
| `.aios-core/core/synapse/engine.js` | SynapseEngine orchestrator |
| `.synapse/manifest` | Domain registry (KEY=VALUE) |
| `.synapse/commands` | Star-command definitions |
| `.claude/commands/synapse/manager.md` | CRUD command router |
