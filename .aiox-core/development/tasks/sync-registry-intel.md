# Task: Sync Registry Intel

## Metadata
- **Task ID:** sync-registry-intel
- **Agent:** @aiox-master
- **Story:** NOG-2
- **Type:** Command Task
- **Elicit:** false

---

## Description

Enrich the entity registry with code intelligence data (usedBy, dependencies, codeIntelMetadata) using the configured code intelligence provider.

---

## Prerequisites

- Code intelligence provider available (NOG-1 complete)
- Entity registry exists at `.aiox-core/data/entity-registry.yaml`

---

## Execution Steps

### Step 1: Parse Arguments

```text
Arguments:
  --full    Force full resync (reprocess all entities regardless of lastSynced)

Default: Incremental sync (only entities whose source file mtime > lastSynced)
```

### Step 2: Execute Sync

```javascript
const { RegistrySyncer } = require('.aiox-core/core/code-intel/registry-syncer');

const syncer = new RegistrySyncer();
const stats = await syncer.sync({ full: hasFullFlag });
```

### Step 3: Report Results

Display sync statistics:
- Total entities in registry
- Entities processed (enriched)
- Entities skipped (unchanged)
- Errors encountered

### Step 4: Handle Fallback

If no code intelligence provider is available:
- Display: "No code intelligence provider available, skipping enrichment"
- Exit gracefully with zero modifications

---

## Output

```yaml
success: true
stats:
  total: 506
  processed: 42
  skipped: 464
  errors: 0
```

---

## Error Handling

- **No provider:** Graceful exit, zero modifications
- **Registry not found:** Error message, exit
- **Partial failure:** Continue batch, log errors, report count
- **Write failure:** Atomic write prevents corruption (temp + rename)
