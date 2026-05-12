# IDS: Entity Registry Foundation

The Entity Registry is the central data store for the Incremental Development System (IDS). It tracks all AIOX framework artifacts — tasks, templates, scripts, modules, agents, checklists, and data files — with metadata, relationships, adaptability scores, and checksums.

## Schema

The registry is stored at `.aiox-core/data/entity-registry.yaml` as a single YAML file.

### Structure

```yaml
metadata:
  version: "1.0.0"           # Semver
  lastUpdated: "ISO-8601"    # Last population timestamp
  entityCount: 474           # Total entities
  checksumAlgorithm: "sha256"

entities:
  <category>:                # tasks, templates, scripts, modules, agents, checklists, data
    <entity-id>:
      path: "relative/path"  # From repo root
      type: "task"           # task|template|script|module|agent|checklist|data
      purpose: "Brief desc"  # What this entity does (max 200 chars)
      keywords: ["k1", "k2"] # For keyword search
      usedBy: ["entity-ids"] # Reverse dependencies
      dependencies: ["ids"]  # Forward dependencies
      adaptability:
        score: 0.0-1.0       # How safely it can be adapted
        constraints: []       # What cannot be changed
        extensionPoints: []   # Where it can be extended
      checksum: "sha256:hex" # File integrity hash
      lastVerified: "ISO-8601"

categories:
  - id: "tasks"
    description: "Executable task workflows"
    basePath: ".aiox-core/development/tasks"
```

### Adaptability Scores

| Score | Meaning | Example |
|-------|---------|---------|
| 0.0-0.3 | Low — changes likely break consumers | Agent definitions, core templates |
| 0.4-0.6 | Medium — needs careful impact analysis | Shared utilities, modules |
| 0.7-1.0 | High — safe to adapt with docs | Specific tasks, scripts |

## RegistryLoader API

```js
const { RegistryLoader } = require('./.aiox-core/core/ids/registry-loader');
const loader = new RegistryLoader(); // uses default path
```

### Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `load()` | `Object` | Parse registry YAML (returns empty registry if file missing) |
| `queryByKeywords(keywords)` | `Array` | Find entities matching any keyword (case-insensitive) |
| `queryByType(type)` | `Array` | Find entities by type (task, script, agent, etc.) |
| `queryByPath(pattern)` | `Array` | Find entities by path substring |
| `queryByPurpose(text)` | `Array` | Find entities by purpose text substring |
| `getRelationships(id)` | `{usedBy, dependencies}` | Get both relationship arrays |
| `getUsedBy(id)` | `Array` | Get entities that depend on this one |
| `getDependencies(id)` | `Array` | Get entities this one depends on |
| `getMetadata()` | `Object` | Registry metadata (version, count, etc.) |
| `getCategories()` | `Array` | List of category definitions |
| `getEntityCount()` | `Number` | Total entities in registry |
| `verifyChecksum(id, repoRoot)` | `Boolean\|null` | Verify file integrity |

### Examples

```js
// Load and query
const loader = new RegistryLoader();
loader.load();

// Find all task entities
const tasks = loader.queryByType('task');
console.log(`Found ${tasks.length} tasks`);

// Search by keywords
const results = loader.queryByKeywords(['validate', 'story']);
results.forEach(e => console.log(`${e.id}: ${e.purpose}`));

// Check relationships
const rels = loader.getRelationships('create-doc');
console.log('Used by:', rels.usedBy);
console.log('Depends on:', rels.dependencies);

// Find entities in a path
const coreModules = loader.queryByPath('core/');
```

## Population Script

Regenerate the registry from the filesystem:

```bash
node .aiox-core/development/scripts/populate-entity-registry.js
```

The script:
1. Scans 7 category directories for artifacts
2. Extracts metadata (purpose, keywords) from file content
3. Detects dependencies via import/require analysis
4. Calculates sha256 checksums for integrity
5. Resolves reverse `usedBy` relationships
6. Assigns default adaptability scores by entity type
7. Skips duplicate entity IDs with a warning

### Current Stats

- **474** total entities across 7 categories
- **198** tasks, **134** modules, **67** scripts, **52** templates, **12** agents
- Average query time: **<1ms**

## Scalability

v1 uses a single YAML file (supports up to ~1000 entities). When entityCount exceeds 1000, a v2 sharded-by-category format is planned (see ADR-IDS-001).
