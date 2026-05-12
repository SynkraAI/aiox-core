# AIOX Core Module

> Central runtime module providing essential framework functionality for Synkra AIOX.

**Version:** 2.0.0
**Created:** Story 2.2 - Core Module Creation
**Architecture:** ADR-002 Modular Architecture

## Overview

The Core module contains the foundational runtime components that all other AIOX modules depend on. It provides configuration management, session handling, elicitation workflows, and essential utilities.

## Installation

The core module is automatically available within the Synkra AIOX framework:

```javascript
// CommonJS
const core = require('./.aiox-core/core');

// ES Modules
import { ConfigCache, ElicitationEngine } from './.aiox-core/core/index.esm.js';
```

## Module Structure

```
core/
├── config/                 # Configuration management
│   ├── config-cache.js     # Global configuration cache with TTL support
│   └── config-loader.js    # Lazy-loading configuration system
├── data/                   # Framework knowledge and patterns
│   ├── aiox-kb.md          # AIOX knowledge base
│   ├── workflow-patterns.yaml
│   └── agent-config-requirements.yaml
├── docs/                   # Internal documentation
│   ├── agent-creation.md
│   ├── component-overview.md
│   ├── elicitation-guide.md
│   ├── system-overview.md
│   └── task-authoring.md
├── elicitation/            # Interactive prompting system
│   ├── elicitation-engine.js
│   ├── session-manager.js
│   ├── agent-elicitation.js
│   ├── task-elicitation.js
│   └── workflow-elicitation.js
├── session/                # Session context management
│   ├── context-detector.js
│   └── context-loader.js
├── utils/                  # Utility functions
│   ├── output-formatter.js
│   └── yaml-validator.js
├── index.js                # CommonJS exports
└── index.esm.js            # ES Module exports
```

## API Reference

### Configuration

#### `ConfigCache` / `globalConfigCache`
Global configuration cache with TTL support.

```javascript
const { globalConfigCache } = require('./.aiox-core/core');

// Store configuration
globalConfigCache.set('my-key', { value: 42 }, 300000); // 5 min TTL

// Retrieve configuration
const config = globalConfigCache.get('my-key');
```

#### `loadAgentConfig(agentId)`
Load configuration for a specific agent with lazy loading.

```javascript
const { loadAgentConfig } = require('./.aiox-core/core');
const agentConfig = await loadAgentConfig('dev');
```

#### `loadConfigSections(sections)`
Load specific configuration sections.

```javascript
const { loadConfigSections } = require('./.aiox-core/core');
const config = await loadConfigSections(['persona', 'commands']);
```

### Session Management

#### `ContextDetector`
Detects current execution context (IDE, terminal, environment).

```javascript
const { ContextDetector } = require('./.aiox-core/core');
const detector = new ContextDetector();
const context = detector.detectContext();
```

#### `SessionContextLoader`
Manages session context loading and updates.

```javascript
const { SessionContextLoader } = require('./.aiox-core/core');
const loader = new SessionContextLoader();
const context = await loader.loadContext(sessionId);
```

### Elicitation System

#### `ElicitationEngine`
Core engine for interactive prompting workflows.

```javascript
const { ElicitationEngine } = require('./.aiox-core/core');
const engine = new ElicitationEngine();

const session = await engine.startSession('create-agent');
const response = await engine.processStep(session.id, userInput);
```

#### `ElicitationSessionManager`
Manages elicitation session state.

```javascript
const { ElicitationSessionManager } = require('./.aiox-core/core');
const manager = new ElicitationSessionManager();
```

#### Elicitation Steps
Pre-defined elicitation workflows:
- `agentElicitationSteps` - Steps for creating agents
- `taskElicitationSteps` - Steps for creating tasks
- `workflowElicitationSteps` - Steps for creating workflows

### Utilities

#### `YAMLValidator`
Validates YAML content with type-specific rules.

```javascript
const { YAMLValidator, validateYAML } = require('./.aiox-core/core');

// Quick validation
const result = await validateYAML(yamlContent, 'agent');

// Full validator
const validator = new YAMLValidator();
const validation = await validator.validateFile('agent.yaml', 'agent');
```

#### `PersonalizedOutputFormatter`
Formats agent output with personalization.

```javascript
const { PersonalizedOutputFormatter } = require('./.aiox-core/core');
const formatter = new PersonalizedOutputFormatter(agent, task, result);
const output = formatter.format();
```

## Exports Summary

| Export | Type | Description |
|--------|------|-------------|
| `ConfigCache` | Class | Configuration cache class |
| `globalConfigCache` | Instance | Global cache singleton |
| `loadAgentConfig` | Function | Load agent configuration |
| `loadConfigSections` | Function | Load config sections |
| `loadMinimalConfig` | Function | Load minimal configuration |
| `loadFullConfig` | Function | Load complete configuration |
| `preloadConfig` | Function | Preload configuration |
| `clearConfigCache` | Function | Clear configuration cache |
| `getConfigPerformanceMetrics` | Function | Get cache performance stats |
| `ContextDetector` | Class | Context detection |
| `SessionContextLoader` | Class | Session context management |
| `ElicitationEngine` | Class | Elicitation workflow engine |
| `ElicitationSessionManager` | Class | Session state management |
| `agentElicitationSteps` | Object | Agent creation steps |
| `taskElicitationSteps` | Object | Task creation steps |
| `workflowElicitationSteps` | Object | Workflow creation steps |
| `PersonalizedOutputFormatter` | Class | Output formatting |
| `YAMLValidator` | Class | YAML validation |
| `validateYAML` | Function | Quick YAML validation |
| `version` | String | Module version (2.0.0) |
| `moduleName` | String | Module name ('core') |

## Regression Tests

The core module includes regression tests (CORE-01 to CORE-07):

| Test ID | Name | Priority | Description |
|---------|------|----------|-------------|
| CORE-01 | Config Loading | P0 | Verifies config system loads |
| CORE-02 | Config Caching | P1 | Verifies cache operations |
| CORE-03 | Session Management | P0 | Verifies session loader |
| CORE-04 | Elicitation Engine | P0 | Verifies elicitation system |
| CORE-05 | YAML Validation | P1 | Verifies YAML validator |
| CORE-06 | Output Formatting | P1 | Verifies output formatter |
| CORE-07 | Package Exports | P0 | Verifies all exports |

Run tests:
```bash
npm run test:core
```

## Dependencies

- `js-yaml` - YAML parsing
- `fs-extra` - Enhanced file operations

## Migration Notes

Files were migrated from various locations to create this unified module:

| Original Location | New Location |
|-------------------|--------------|
| `config/config-loader.js` | `core/config/config-loader.js` |
| `config/config-cache.js` | `core/config/config-cache.js` |
| `session/context-*.js` | `core/session/context-*.js` |
| `elicitation/*.js` | `core/elicitation/*.js` |
| Various utils | `core/utils/` |

Scripts that import these modules have been updated to reference the new paths.

---

*Synkra AIOX Core Module v2.0.0*
