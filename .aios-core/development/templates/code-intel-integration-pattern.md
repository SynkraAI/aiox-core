# Code Intelligence Integration Pattern

> Standard pattern for integrating code intelligence into new tasks and helpers.
> Follow this template to ensure consistent, provider-agnostic integration with graceful fallback.

## Pattern Overview

```
import → isCodeIntelAvailable guard → enrich → fallback (return null)
```

All code intelligence integrations MUST follow this 4-step pattern:

1. **Import** from the code-intel public API (`../index` or relative path)
2. **Guard** with `isCodeIntelAvailable()` — return null if no provider
3. **Enrich** by calling enricher/client capabilities inside try/catch
4. **Fallback** — always return null on any error, never throw

## Complete Example

```javascript
'use strict';

const { getEnricher, getClient, isCodeIntelAvailable } = require('../index');

/**
 * ModuleDoc — describe the helper's purpose and target agent/task.
 *
 * All functions return null gracefully when no provider is available.
 * Never throws — safe to call unconditionally in task workflows.
 */

async function myFunction(param) {
  // Step 1: Input validation
  if (!param) return null;

  // Step 2: Provider guard
  if (!isCodeIntelAvailable()) return null;

  try {
    // Step 3: Call enricher (composite) or client (primitive)
    const enricher = getEnricher();
    const result = await enricher.someCapability(param);

    // Validate result
    if (!result) return null;

    // Step 4: Format and return
    return {
      // ... formatted result
    };
  } catch {
    // Never throw — return null on any error
    return null;
  }
}

module.exports = { myFunction };
```

## Partial Results Pattern

When calling multiple capabilities, use per-capability try/catch to accept partial results:

```javascript
async function multiCapabilityFunction(param) {
  if (!param) return null;
  if (!isCodeIntelAvailable()) return null;

  try {
    const enricher = getEnricher();
    const client = getClient();

    let dataA = null;
    let dataB = null;

    try {
      dataA = await enricher.describeProject(param);
    } catch { /* skip — partial result ok */ }

    try {
      dataB = await client.findReferences(param);
    } catch { /* skip — partial result ok */ }

    // Return null only if we got nothing at all
    if (!dataA && !dataB) return null;

    return { dataA, dataB };
  } catch {
    return null;
  }
}
```

## Available Capabilities

### Enricher (composite — via `getEnricher()`)

| Capability | Input | Output | Use Case |
|-----------|-------|--------|----------|
| `describeProject(path)` | Path string | `{ codebase, stats }` | Project overview |
| `getConventions(path)` | Path string | `{ patterns, stats }` | Naming/coding patterns |
| `detectDuplicates(desc, opts)` | Description + options | `{ matches, codebaseOverview }` | Duplicate detection |
| `assessImpact(files)` | File array | `{ blastRadius, references, complexity }` | Change impact |
| `findTests(symbol)` | Symbol name | Test file references | Test discovery |

### Client (primitive — via `getClient()`)

| Capability | Input | Output | Use Case |
|-----------|-------|--------|----------|
| `findReferences(symbol)` | Symbol name | `[{ file, line, context }]` | Symbol usage |
| `findDefinition(symbol)` | Symbol name | `{ file, line, column }` | Symbol definition |
| `analyzeDependencies(path)` | Path string | `{ nodes, edges }` | Dependency graph |
| `findCallers(symbol)` | Symbol name | Caller references | Call graph (inbound) |
| `findCallees(symbol)` | Symbol name | Callee references | Call graph (outbound) |
| `analyzeComplexity(path)` | Path string | Complexity metrics | Code complexity |
| `analyzeCodebase(path)` | Path string | Codebase overview | Full analysis |
| `getProjectStats(path)` | Path string | Project statistics | Stats only |

## Testing Pattern

### Mock Strategy

```javascript
// Mock the code-intel module at the top of your test file
jest.mock('../../.aios-core/core/code-intel/index', () => ({
  isCodeIntelAvailable: jest.fn(),
  getEnricher: jest.fn(),
  getClient: jest.fn(),
}));

const {
  isCodeIntelAvailable,
  getEnricher,
  getClient,
} = require('../../.aios-core/core/code-intel/index');
```

### Required Test Scenarios

Every code intelligence integration MUST test:

1. **Happy path** — provider available, data returned
2. **Fallback** — provider unavailable (`isCodeIntelAvailable` returns false)
3. **Error handling** — provider throws (enricher/client rejects)
4. **Empty input** — null/empty parameters
5. **Partial results** — one capability fails, other succeeds (if multi-capability)

### Test Helper Setup

```javascript
function setupProviderAvailable() {
  isCodeIntelAvailable.mockReturnValue(true);
}

function setupProviderUnavailable() {
  isCodeIntelAvailable.mockReturnValue(false);
}

function createMockEnricher(overrides = {}) {
  const enricher = {
    detectDuplicates: jest.fn().mockResolvedValue(null),
    getConventions: jest.fn().mockResolvedValue(null),
    describeProject: jest.fn().mockResolvedValue(null),
    assessImpact: jest.fn().mockResolvedValue(null),
    findTests: jest.fn().mockResolvedValue(null),
    ...overrides,
  };
  getEnricher.mockReturnValue(enricher);
  return enricher;
}

function createMockClient(overrides = {}) {
  const client = {
    findReferences: jest.fn().mockResolvedValue(null),
    findDefinition: jest.fn().mockResolvedValue(null),
    analyzeDependencies: jest.fn().mockResolvedValue(null),
    // ... add other capabilities as needed
    ...overrides,
  };
  getClient.mockReturnValue(client);
  return client;
}
```

## Existing Helpers (Reference)

| Helper | Agent | Functions | Story |
|--------|-------|-----------|-------|
| `dev-helper.js` | @dev | checkBeforeWriting, suggestReuse, getConventionsForPath, assessRefactoringImpact | NOG-3 |
| `qa-helper.js` | @qa | validateTestCoverage, detectRegressionRisk | NOG-4 |
| `planning-helper.js` | @architect | analyzeComplexity, suggestArchitecture | NOG-5 |
| `story-helper.js` | @sm/@po | detectDuplicateStory, suggestRelevantFiles, validateNoDuplicates | NOG-6 |
| `devops-helper.js` | @devops | assessDeploymentRisk, validatePipelineImpact | NOG-7 |
| `creation-helper.js` | squad-creator | getCodebaseContext, checkDuplicateArtefact, enrichRegistryEntry | NOG-8 |

---

*Template created for Story NOG-8 — Code Intelligence Integration Pattern*
