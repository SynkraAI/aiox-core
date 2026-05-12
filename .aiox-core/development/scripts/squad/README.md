# Squad Scripts Module

Utilities for the squad-creator agent to manage squads in AIOX projects.

## Overview

This module provides utilities for:
- **Loading** squad manifests from local directories
- **Validating** squad structure and configuration (SQS-3)
- **Generating** new squads from templates (SQS-4)

## Components

| File | Story | Description |
|------|-------|-------------|
| `squad-loader.js` | SQS-2 | Load and resolve squad manifests |
| `squad-validator.js` | SQS-3 | Validate squad structure |
| `squad-generator.js` | SQS-4 | Generate new squads |

## Usage

### Squad Loader

```javascript
const { SquadLoader } = require('./.aiox-core/development/scripts/squad');

// Create loader instance
const loader = new SquadLoader({
  squadsPath: './squads',  // Default: './squads'
  verbose: false           // Enable debug logging
});

// Resolve squad by name
const { path, manifestPath } = await loader.resolve('my-squad');

// Load and parse manifest
const manifest = await loader.loadManifest('./squads/my-squad');

// List all local squads
const squads = await loader.listLocal();
// Returns: [{ name, path, manifestPath }, ...]
```

### Error Handling

```javascript
const { SquadLoader, SquadLoaderError } = require('./.aiox-core/development/scripts/squad');

try {
  const loader = new SquadLoader();
  await loader.resolve('non-existent-squad');
} catch (error) {
  if (error instanceof SquadLoaderError) {
    console.error(`Error [${error.code}]: ${error.message}`);
    console.log(`Suggestion: ${error.suggestion}`);
  }
}
```

### Error Codes

| Code | Description | Suggestion |
|------|-------------|------------|
| `SQUAD_NOT_FOUND` | Squad directory not found | Create squad with: @squad-creator *create-squad {name} |
| `MANIFEST_NOT_FOUND` | No manifest file in squad | Create squad.yaml in squad directory |
| `YAML_PARSE_ERROR` | Invalid YAML syntax | Check YAML syntax - use a YAML linter |
| `PERMISSION_DENIED` | File permission error | Check file permissions: chmod 644 {path} |

## Manifest Files

The loader supports two manifest formats:

1. **`squad.yaml`** (preferred) - New standard format
2. **`config.yaml`** (deprecated) - Legacy format with console warning

## Integration with squad-creator Agent

This module is used by squad-creator agent tasks:

- `*create-squad` - Uses loader to check for conflicts
- `*validate-squad` - Uses loader to load and validate manifest
- `*list-squads` - Uses loader to enumerate local squads

## Related Stories

- **SQS-2**: Squad Loader Utility (this module)
- **SQS-3**: Squad Validator + Schema
- **SQS-4**: Squad Creator Agent + Tasks

## Dependencies

- `js-yaml` - YAML parsing (project dependency)
- `fs/promises` - File system operations (Node.js built-in)
- `path` - Path manipulation (Node.js built-in)

## Testing

```bash
# Run squad-loader tests
npm test -- tests/unit/squad/squad-loader.test.js

# Run with coverage
npm test -- tests/unit/squad/squad-loader.test.js --coverage --collectCoverageFrom=".aiox-core/development/scripts/squad/*.js"
```

**Coverage:** 94.5% statements (target: 80%+)

## Version History

| Version | Date | Description |
|---------|------|-------------|
| 1.0.0 | 2025-12-18 | Initial implementation (Story SQS-2) |
