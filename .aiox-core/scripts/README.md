# AIOX Scripts - Legacy Directory

> **Note**: This directory now contains only legacy/migration scripts and a few active utilities.
> Most scripts have been migrated to the modular structure (Story 6.16).

## Current Structure

Scripts are now organized by domain across three locations:

| Location | Purpose |
|----------|---------|
| `.aiox-core/core/` | Core framework modules (elicitation, session) |
| `.aiox-core/development/scripts/` | Development scripts (greeting, workflow, hooks) |
| `.aiox-core/infrastructure/scripts/` | Infrastructure scripts (git config, validators) |
| `.aiox-core/scripts/` (this directory) | Legacy utilities and migration scripts |

## Scripts in This Directory

### Active Scripts

| Script | Description |
|--------|-------------|
| `session-context-loader.js` | Loads session context for agents |
| `command-execution-hook.js` | Hook for command execution |
| `test-template-system.js` | Internal test utility for templates |

### Migration Scripts

| Script | Description |
|--------|-------------|
| `batch-migrate-*.ps1` | Batch migration utilities |
| `migrate-framework-docs.sh` | Documentation migration script |
| `validate-phase1.ps1` | Phase 1 validation script |

## Script Path Mapping

If you're looking for a script that was previously here, use this mapping:

```text
OLD PATH                                      NEW PATH
-----------------------------------------     ------------------------------------------
.aiox-core/scripts/context-detector.js      → .aiox-core/core/session/context-detector.js
.aiox-core/scripts/elicitation-engine.js    → .aiox-core/core/elicitation/elicitation-engine.js
.aiox-core/scripts/elicitation-session-manager.js → .aiox-core/core/elicitation/session-manager.js
.aiox-core/scripts/greeting-builder.js      → .aiox-core/development/scripts/greeting-builder.js
.aiox-core/scripts/workflow-navigator.js    → .aiox-core/development/scripts/workflow-navigator.js
.aiox-core/scripts/agent-exit-hooks.js      → .aiox-core/development/scripts/agent-exit-hooks.js
.aiox-core/scripts/git-config-detector.js   → .aiox-core/infrastructure/scripts/git-config-detector.js
.aiox-core/scripts/project-status-loader.js → .aiox-core/infrastructure/scripts/project-status-loader.js
.aiox-core/scripts/aiox-validator.js        → .aiox-core/infrastructure/scripts/aiox-validator.js
.aiox-core/scripts/tool-resolver.js         → .aiox-core/infrastructure/scripts/tool-resolver.js
.aiox-core/scripts/output-formatter.js      → .aiox-core/infrastructure/scripts/output-formatter.js
```

## Configuration

The `scriptsLocation` in `core-config.yaml` now uses a modular structure:

```yaml
scriptsLocation:
  core: .aiox-core/core
  development: .aiox-core/development/scripts
  infrastructure: .aiox-core/infrastructure/scripts
  legacy: .aiox-core/scripts  # This directory
```

## Usage Examples

### Loading Core Scripts

```javascript
// Elicitation Engine (from core)
const ElicitationEngine = require('./.aiox-core/core/elicitation/elicitation-engine');

// Context Detector (from core)
const ContextDetector = require('./.aiox-core/core/session/context-detector');
```

### Loading Development Scripts

```javascript
// Greeting Builder
const GreetingBuilder = require('./.aiox-core/development/scripts/greeting-builder');

// Workflow Navigator
const WorkflowNavigator = require('./.aiox-core/development/scripts/workflow-navigator');
```

### Loading Infrastructure Scripts

```javascript
// Project Status Loader
const { loadProjectStatus } = require('./.aiox-core/infrastructure/scripts/project-status-loader');

// Git Config Detector
const GitConfigDetector = require('./.aiox-core/infrastructure/scripts/git-config-detector');
```

### Loading Legacy Scripts (this directory)

```javascript
// Session Context Loader
const sessionLoader = require('./.aiox-core/scripts/session-context-loader');
```

## Related Documentation

- [Core Config](../core-config.yaml) - scriptsLocation configuration
- [Core Module](../core/README.md) - Core framework modules
- [Development Scripts](../development/scripts/README.md) - Development utilities
- [Infrastructure Scripts](../infrastructure/scripts/README.md) - Infrastructure utilities

## Migration History

| Date | Story | Change |
|------|-------|--------|
| 2025-12-18 | 6.16 | Deleted deprecated scripts, updated documentation |
| 2025-01-15 | 2.2 | Initial script reorganization to modular structure |

---

**Last updated:** 2025-12-18 - Story 6.16 Scripts Path Consolidation
