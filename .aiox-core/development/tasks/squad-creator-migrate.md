---
task: Migrate Squad
responsável: @squad-creator
responsável_type: agent
atomic_layer: task
Entrada: |
  - squad_path: Path to the squad directory to migrate (required)
  - dry_run: If true, preview changes without modifying files (--dry-run)
  - verbose: If true, show detailed output (--verbose)
Saída: |
  - migration_result: Object with { success, actions, validation, backupPath }
  - report: Formatted migration report
  - exit_code: 0 if successful, 1 if failed
Checklist:
  - "[ ] Analyze squad for migration needs"
  - "[ ] Create backup in .backup/"
  - "[ ] Execute migration actions"
  - "[ ] Validate migrated squad"
  - "[ ] Generate migration report"
---

# *migrate-squad

Migrates legacy squad formats to AIOX 2.1 standard.

## Usage

```
@squad-creator

# Preview changes without modifying files
*migrate-squad ./squads/my-squad --dry-run

# Migrate with automatic backup
*migrate-squad ./squads/my-squad

# Migrate with detailed output
*migrate-squad ./squads/my-squad --verbose

# Migrate squad
*migrate-squad ./squads/my-pack --verbose
```

## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `squad_path` | string | - | Full path to squad directory (required) |
| `--dry-run` | flag | false | Preview changes without modifying files |
| `--verbose` | flag | false | Show detailed migration output |

## Migration Detection

The migrator detects the following legacy patterns:

| Pattern | Detection | Migration Action |
|---------|-----------|------------------|
| `config.yaml` | Legacy manifest name | Rename to `squad.yaml` |
| Flat structure | No `tasks/`, `agents/` dirs | Create directory structure |
| Missing `aiox.type` | Field not present | Add `aiox.type: squad` |
| Missing `aiox.minVersion` | Field not present | Add `aiox.minVersion: 2.1.0` |
| Missing `name` | Field not present | Infer from directory name |
| Missing `version` | Field not present | Add `version: 1.0.0` |

## Flow

```
1. Analyze Squad
   ├── Check for config.yaml vs squad.yaml
   ├── Check directory structure
   ├── Validate manifest schema
   └── Generate action list

2. Confirm Migration (if not --dry-run)
   ├── Display issues found
   ├── Display planned actions
   └── Request user confirmation

3. Create Backup
   └── Copy all files to .backup/pre-migration-{timestamp}/

4. Execute Actions
   ├── RENAME_MANIFEST: config.yaml → squad.yaml
   ├── CREATE_DIRECTORIES: tasks/, agents/, config/
   ├── ADD_FIELD: Add missing required fields
   └── MOVE_FILE: Reorganize files if needed

5. Validate Result
   ├── Run squad-validator on migrated squad
   └── Report any remaining issues

6. Generate Report
   ├── Summary of changes made
   ├── Backup location
   └── Validation result
```

## Output Example

### Analysis Phase

```
═══════════════════════════════════════════════════════════
              SQUAD MIGRATION REPORT
═══════════════════════════════════════════════════════════

Squad Path: ./squads/my-legacy-squad/
Needs Migration: Yes

───────────────────────────────────────────────────────────
ISSUES FOUND:
───────────────────────────────────────────────────────────
  ⚠️ [WARNING] Uses deprecated config.yaml manifest
  ⚠️ [WARNING] Missing task-first directories: tasks, agents
  ❌ [ERROR] Missing required field: aiox.type
  ❌ [ERROR] Missing required field: aiox.minVersion

───────────────────────────────────────────────────────────
PLANNED ACTIONS:
───────────────────────────────────────────────────────────
  1. Rename config.yaml → squad.yaml
  2. Create directories: tasks, agents
  3. Add field: aiox.type = "squad"
  4. Add field: aiox.minVersion = "2.1.0"

═══════════════════════════════════════════════════════════
```

### Migration Result

```
───────────────────────────────────────────────────────────
MIGRATION RESULT:
───────────────────────────────────────────────────────────
  Status: ✅ SUCCESS
  Message: Migration completed successfully
  Backup: ./squads/my-legacy-squad/.backup/pre-migration-1703318400000/

  Executed Actions:
    ✅ Rename config.yaml → squad.yaml [success]
    ✅ Create directories: tasks, agents [success]
    ✅ Add field: aiox.type = "squad" [success]
    ✅ Add field: aiox.minVersion = "2.1.0" [success]

  Post-Migration Validation:
    Valid: Yes

═══════════════════════════════════════════════════════════
```

### Dry-Run Mode

```
───────────────────────────────────────────────────────────
MIGRATION RESULT:
───────────────────────────────────────────────────────────
  Status: ✅ SUCCESS
  Message: Dry-run completed successfully

  Executed Actions:
    🔍 Rename config.yaml → squad.yaml [dry-run]
    🔍 Create directories: tasks, agents [dry-run]
    🔍 Add field: aiox.type = "squad" [dry-run]
    🔍 Add field: aiox.minVersion = "2.1.0" [dry-run]

═══════════════════════════════════════════════════════════
```

## Rollback Procedure

If migration fails or produces unexpected results, restore from backup:

```bash
# List available backups
ls ./squads/my-squad/.backup/

# View backup contents
ls ./squads/my-squad/.backup/pre-migration-1703318400000/

# Restore from backup (removes current, restores backup)
rm -rf ./squads/my-squad/squad.yaml ./squads/my-squad/tasks ./squads/my-squad/agents
cp -r ./squads/my-squad/.backup/pre-migration-1703318400000/. ./squads/my-squad/

# Verify restoration
ls ./squads/my-squad/
```

## Error Codes

| Code | Severity | Description |
|------|----------|-------------|
| `SQUAD_NOT_FOUND` | Error | Squad directory doesn't exist |
| `NO_MANIFEST` | Error | No config.yaml or squad.yaml found |
| `BACKUP_FAILED` | Error | Failed to create backup |
| `MIGRATION_FAILED` | Error | Action execution failed |
| `VALIDATION_FAILED` | Warning | Post-migration validation found issues |
| `INVALID_PATH` | Error | Invalid squad path provided |

## Implementation

```javascript
const { SquadMigrator } = require('./.aiox-core/development/scripts/squad');
const { SquadValidator } = require('./.aiox-core/development/scripts/squad');

async function migrateSquad(options) {
  const { squadPath, dryRun, verbose } = options;

  // Create migrator with optional validator
  const validator = new SquadValidator();
  const migrator = new SquadMigrator({
    dryRun,
    verbose,
    validator
  });

  // Analyze first
  const analysis = await migrator.analyze(squadPath);

  // Display analysis report
  console.log(migrator.generateReport(analysis));

  if (!analysis.needsMigration) {
    console.log('Squad is already up to date. No migration needed.');
    return 0;
  }

  // Execute migration
  const result = await migrator.migrate(squadPath);

  // Display final report
  console.log(migrator.generateReport(analysis, result));

  return result.success ? 0 : 1;
}
```

## Related

- **Story:** SQS-7 (Squad Migration Tool)
- **Dependencies:** squad-migrator.js, squad-validator.js
- **Schema:** .aiox-core/schemas/squad-schema.json
- **Agent:** @squad-creator (Craft)
- **Similar Tasks:** *validate-squad, *create-squad
