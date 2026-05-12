---
task: Validate Squad
responsável: @squad-creator
responsável_type: agent
atomic_layer: task
Entrada: |
  - squad_path: Path to the squad directory (default: ./squads/{name})
  - name: Squad name (alternative to full path)
  - strict: If true, warnings become errors (default: false)
  - verbose: If true, show detailed output (default: false)
Saída: |
  - validation_result: Object with { valid, errors, warnings, suggestions }
  - report: Formatted report for display
  - exit_code: 0 if valid, 1 if invalid
Checklist:
  - [ ] Resolve squad path via squad-loader
  - [ ] Execute squad-validator.validate()
  - [ ] Format result for output
  - [ ] Return appropriate exit code
---

# *validate-squad

Validates a squad against the JSON Schema and TASK-FORMAT-SPECIFICATION-V1.

## Usage

```
@squad-creator
*validate-squad ./squads/my-squad
*validate-squad my-squad
*validate-squad my-squad --strict
*validate-squad my-squad --verbose
```

## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `squad_path` | string | - | Full path to squad directory |
| `name` | string | - | Squad name (resolves to ./squads/{name}) |
| `--strict` | flag | false | Treat warnings as errors |
| `--verbose` | flag | false | Show detailed validation output |

## Validation Checks

### 1. Manifest Validation
- Checks for `squad.yaml` or `config.yaml` (deprecated)
- Validates against JSON Schema
- Required fields: `name`, `version`

### 2. Structure Validation
- Checks for expected directories: `tasks/`, `agents/`
- Verifies referenced files exist

### 3. Task Validation (TASK-FORMAT-SPECIFICATION-V1)
- Checks for required fields in task files
- Validates naming conventions (kebab-case)

### 4. Agent Validation
- Checks for valid agent definition format
- Validates naming conventions

### 5. Config Reference Validation (SQS-10)
- Validates config paths in squad.yaml resolve correctly
- Supports both local (`config/coding-standards.md`) and project-level (`../../docs/framework/CODING-STANDARDS.md`) paths
- Warns if project-level reference doesn't exist
- Errors if local reference doesn't exist

## Flow

```
1. Resolve squad path
   ├── If full path provided → use directly
   └── If name provided → resolve via ./squads/{name}/

2. Execute validations
   ├── validateManifest() → Schema check
   ├── validateStructure() → Directory check
   ├── validateTasks() → Task format check
   ├── validateAgents() → Agent format check
   └── validateConfigReferences() → Config path check (SQS-10)

3. Format and display result
   ├── Show errors (if any)
   ├── Show warnings (if any)
   └── Show final result (VALID/INVALID)

4. Return exit code
   ├── 0 → Valid (or valid with warnings)
   └── 1 → Invalid (errors found)
```

## Output Example

```
Validating squad: ./squads/my-squad/

Errors: 0
Warnings: 2
  - [MISSING_DIRECTORY]: Expected directory not found: workflows/
    Suggestion: mkdir workflows (task-first architecture recommends tasks/ and agents/)
  - [TASK_MISSING_FIELD] (my-task.md): Task missing recommended field: Checklist
    Suggestion: Add "Checklist:" to my-task.md (TASK-FORMAT-SPECIFICATION-V1)

Result: VALID (with warnings)
```

## Error Codes

| Code | Severity | Description |
|------|----------|-------------|
| `MANIFEST_NOT_FOUND` | Error | No squad.yaml or config.yaml found |
| `YAML_PARSE_ERROR` | Error | Invalid YAML syntax |
| `SCHEMA_ERROR` | Error | Manifest doesn't match JSON Schema |
| `FILE_NOT_FOUND` | Error | Referenced file doesn't exist |
| `DEPRECATED_MANIFEST` | Warning | Using config.yaml instead of squad.yaml |
| `MISSING_DIRECTORY` | Warning | Expected directory not found |
| `NO_TASKS` | Warning | No task files in tasks/ |
| `TASK_MISSING_FIELD` | Warning | Task missing recommended field |
| `AGENT_INVALID_FORMAT` | Warning | Agent file may not follow format |
| `INVALID_NAMING` | Warning | Filename not in kebab-case |

## Implementation

```javascript
const { SquadLoader } = require('./.aiox-core/development/scripts/squad');
const { SquadValidator } = require('./.aiox-core/development/scripts/squad');

async function validateSquad(options) {
  const { squadPath, name, strict, verbose } = options;

  // Resolve path
  const loader = new SquadLoader();
  let resolvedPath = squadPath;
  if (!squadPath && name) {
    const resolved = await loader.resolve(name);
    resolvedPath = resolved.path;
  }

  // Validate
  const validator = new SquadValidator({ strict, verbose });
  const result = await validator.validate(resolvedPath);

  // Format output
  console.log(validator.formatResult(result, resolvedPath));

  // Return exit code
  return result.valid ? 0 : 1;
}
```

## Related

- **Story:** SQS-3 (Squad Validator + JSON Schema)
- **Story:** SQS-10 (Project Config Reference) - Config path resolution
- **Dependencies:** squad-loader.js, squad-validator.js
- **Schema:** .aiox-core/schemas/squad-schema.json
- **Agent:** @squad-creator (Craft)
