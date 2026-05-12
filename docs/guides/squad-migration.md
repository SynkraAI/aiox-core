# Squad Migration Guide

> **EN** | [PT](../pt/guides/squad-migration.md) | [ES](../es/guides/squad-migration.md)

---

How to migrate legacy squads to AIOX 2.1 format.

## Overview

AIOX 2.1 introduced a new squad format with:
- Task-first architecture
- JSON Schema validation
- Three-level distribution
- Standardized manifest (`squad.yaml`)

Legacy squads using `config.yaml` or older formats need migration.

## Detecting Legacy Squads

### Signs of Legacy Format

| Indicator | Legacy | Current (2.1+) |
|-----------|--------|----------------|
| Manifest file | `config.yaml` | `squad.yaml` |
| AIOX type field | Missing | `aiox.type: squad` |
| Min version | Missing | `aiox.minVersion: "2.1.0"` |
| Structure | Agent-first | Task-first |

### Check Command

```bash
@squad-creator
*validate-squad ./squads/legacy-squad
```

Output will indicate if migration is needed:

```
⚠️ Legacy format detected (config.yaml)
   Run: *migrate-squad ./squads/legacy-squad
```

## Migration Command

### Preview Changes (Recommended First)

```bash
@squad-creator
*migrate-squad ./squads/legacy-squad --dry-run
```

Shows what will change without modifying files.

### Execute Migration

```bash
*migrate-squad ./squads/legacy-squad
```

### Verbose Output

```bash
*migrate-squad ./squads/legacy-squad --verbose
```

Shows detailed step-by-step progress.

## What Gets Migrated

### 1. Manifest Rename

```
config.yaml → squad.yaml
```

### 2. Added Fields

```yaml
# These fields are added if missing
aiox:
  minVersion: "2.1.0"
  type: squad
```

### 3. Structure Normalization

Components are reorganized into the standard structure:

```
Before:
├── config.yaml
├── my-agent.yaml
└── my-task.yaml

After:
├── squad.yaml
├── agents/
│   └── my-agent.md
└── tasks/
    └── my-task.md
```

### 4. File Format Conversion

Agent YAML files are converted to Markdown format:

```yaml
# Before: my-agent.yaml
name: my-agent
role: Helper
```

```markdown
# After: agents/my-agent.md
# my-agent

ACTIVATION-NOTICE: ...

\`\`\`yaml
agent:
  name: my-agent
  ...
\`\`\`
```

## Migration Scenarios

### Scenario 1: Simple Squad (config.yaml only)

**Before:**
```
my-squad/
├── config.yaml
└── README.md
```

**Command:**
```bash
*migrate-squad ./squads/my-squad
```

**After:**
```
my-squad/
├── squad.yaml         # Renamed + updated
├── README.md
└── .backup/           # Backup created
    └── pre-migration-2025-12-26/
```

### Scenario 2: Squad with YAML Agents

**Before:**
```
my-squad/
├── config.yaml
├── agent.yaml
└── task.yaml
```

**Command:**
```bash
*migrate-squad ./squads/my-squad
```

**After:**
```
my-squad/
├── squad.yaml
├── agents/
│   └── agent.md       # Converted to MD
├── tasks/
│   └── task.md        # Converted to MD
└── .backup/
```

### Scenario 3: Partial Migration (Already Has Some 2.1 Features)

**Before:**
```
my-squad/
├── squad.yaml         # Already renamed
├── agent.yaml         # Still YAML format
└── tasks/
    └── task.md        # Already MD format
```

**Command:**
```bash
*migrate-squad ./squads/my-squad
```

**Result:**
- Adds missing `aiox` fields to manifest
- Converts remaining YAML files
- Skips already-migrated files

## Backup & Rollback

### Automatic Backup

Every migration creates a backup:

```
.backup/
└── pre-migration-{timestamp}/
    ├── config.yaml    # Original manifest
    ├── agent.yaml     # Original files
    └── ...
```

### Manual Rollback

```bash
# List backups
ls ./squads/my-squad/.backup/

# Restore specific backup
cp -r ./squads/my-squad/.backup/pre-migration-2025-12-26/. ./squads/my-squad/
```

### Programmatic Rollback

```javascript
const { SquadMigrator } = require('./.aiox-core/development/scripts/squad');

const migrator = new SquadMigrator();
await migrator.rollback('./squads/my-squad');
```

## Troubleshooting

### "Manifest not found"

```
Error: No manifest found (config.yaml or squad.yaml)
```

**Solution:** Create a basic manifest:

```yaml
# squad.yaml
name: my-squad
version: 1.0.0
description: My squad

aiox:
  minVersion: "2.1.0"
  type: squad

components:
  agents: []
  tasks: []
```

### "Invalid YAML syntax"

```
Error: YAML parse error at line 15
```

**Solution:**
1. Check YAML syntax with a linter
2. Common issues: tabs (use spaces), missing quotes
3. Fix errors, then retry migration

### "Backup failed"

```
Error: Could not create backup directory
```

**Solution:**
1. Check write permissions: `chmod 755 ./squads/my-squad`
2. Check disk space
3. Try with sudo (if appropriate)

### "Migration incomplete"

```
Warning: Some files could not be migrated
```

**Solution:**
1. Run with `--verbose` to see which files failed
2. Manually fix problematic files
3. Re-run migration

## Post-Migration Checklist

After migration, verify:

- [ ] `squad.yaml` exists and is valid
- [ ] `aiox.type` is `"squad"`
- [ ] `aiox.minVersion` is `"2.1.0"` or higher
- [ ] All agents are in `agents/` folder
- [ ] All tasks are in `tasks/` folder
- [ ] Agent files are in Markdown format
- [ ] Task files follow TASK-FORMAT-SPEC-V1
- [ ] Validation passes: `*validate-squad --strict`

## Programmatic Migration

```javascript
const { SquadMigrator } = require('./.aiox-core/development/scripts/squad');

const migrator = new SquadMigrator({
  verbose: true,
  dryRun: false,
  backupDir: '.backup'
});

// Check if migration needed
const needsMigration = await migrator.needsMigration('./squads/my-squad');

// Run migration
const result = await migrator.migrate('./squads/my-squad');

console.log(result);
// {
//   success: true,
//   changes: ['config.yaml → squad.yaml', ...],
//   backupPath: '.backup/pre-migration-...'
// }
```

## Related Resources

- [Squad Development Guide](./squads-guide.md)
- [Contributing Squads Guide](./contributing-squads.md)
- [@squad-creator Agent](../../.aiox-core/development/agents/squad-creator.md)

---

**Version:** 1.0.0 | **Updated:** 2025-12-26 | **Story:** SQS-8
