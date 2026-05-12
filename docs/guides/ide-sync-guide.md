# IDE Sync Guide

Synchronize AIOX agents, tasks, workflows, and checklists across multiple IDE configurations.

## Overview

The `*command` task automates the synchronization of AIOX components to all configured IDE directories (`.claude/`, `.cursor/`, `.gemini/`, etc.), eliminating manual copy operations.

## Quick Start

### 1. Setup Configuration

Copy the template to your project root:

```bash
cp .aiox-core/infrastructure/templates/aiox-sync.yaml.template .aiox-sync.yaml
```

### 2. Configure IDEs

Edit `.aiox-sync.yaml` to enable your IDEs:

```yaml
active_ides:
  - claude # Claude Code (.claude/commands/)
  - cursor # Cursor IDE (.cursor/rules/)
  # - gemini    # Google Gemini (.gemini/)
```

### 3. Add Squad Aliases

Map your squad directories to command prefixes:

```yaml
squad_aliases:
  legal: Legal # squads/legal/ → .claude/commands/Legal/
  copy: Copy # squads/copy/ → .claude/commands/Copy/
  hr: HR # squads/hr/ → .claude/commands/HR/
```

## Usage

### Sync Individual Components

```bash
# Sync a specific agent
*command agent legal-chief

# Sync a specific task
*command task revisar-contrato

# Sync a specific workflow
*command workflow contract-review
```

### Sync Entire Squad

```bash
# Sync all components from a squad
*command squad legal
```

### Sync All Squads

```bash
# Sync everything
*command sync-all
```

## How It Works

```
squads/legal/agents/legal-chief.md
         │
         ▼
┌─────────────────────────────────────────────────────┐
│                 *command sync                        │
│                                                      │
│  1. Read .aiox-sync.yaml configuration               │
│  2. Check if component exists in squads/             │
│  3. Apply wrapper transformations (if needed)        │
│  4. Copy to each active IDE destination              │
│  5. Validate synced files                            │
│  6. Log operations                                   │
└─────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────┐
│  .claude/commands/Legal/agents/legal-chief.md        │
│  .cursor/rules/legal-chief.mdc                       │
│  .gemini/agents/legal-chief.md                       │
└──────────────────────────────────────────────────────┘
```

## Sync Mappings

Default mappings for component types:

| -------------- | ------ | ------ | ------ | -------- |
| Agents         | ✅     | ✅     | ✅     | ✅       |
| Tasks          | ✅     | -      | -      | -        |
| Workflows      | ✅     | ✅     | -      | -        |
| Checklists     | ✅     | -      | -      | -        |
| Data           | ✅     | -      | -      | -        |

## Wrappers

Different IDEs require different formats:

### Claude (Markdown)

No transformation needed - files are copied as-is.

### Cursor (MDC)

Files are wrapped with frontmatter:

```yaml
---
description: { extracted from agent }
globs: []
alwaysApply: false
---
{ original content }
```

## Directory Structure

```
your-project/
├── .aiox-sync.yaml           # Sync configuration
├── squads/                   # Source of truth
│   └── legal/
│       ├── config.yaml
│       ├── agents/
│       ├── tasks/
│       └── checklists/
├── .claude/
│   └── commands/
│       └── Legal/           # Auto-synced
│           ├── agents/
│           ├── tasks/
│           └── checklists/
├── .cursor/
│   └── rules/               # Auto-synced (MDC format)
└── .gemini/
    └── agents/              # Auto-synced
```

## Best Practices

1. **Never edit `.claude/commands/` directly** - Always edit in `squads/` and sync
2. **Use descriptive names** - Agent names become slash commands
3. **Keep config.yaml updated** - Required for proper sync
4. **Run sync after changes** - Ensure all IDEs stay in sync

## Troubleshooting

### Component Not Found

```
Error: Component 'my-agent' not found in squads/
```

**Solution**: Verify the agent exists in `squads/*/agents/my-agent.md`

### Missing Squad Alias

```
Warning: No squad alias for 'new-squad'
```

**Solution**: Add the alias to `.aiox-sync.yaml`:

```yaml
squad_aliases:
  new-squad: NewSquad
```

### IDE Not Syncing

Check that the IDE is enabled in `active_ides` section.

## Related

- [Squads Overview](./squads-overview.md)
- [Agent Reference](../agent-reference-guide.md)
- [AIOX Architecture](../core-architecture.md)
