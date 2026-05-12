# Document Gotchas Task

## Purpose

Extract and consolidate gotchas from session insights into a searchable knowledge base. Triggered automatically after session-insights capture or manually via `*list-gotchas`.

---

## Task Definition (AIOX Task Format V1.0)

```yaml
task: documentGotchas()
responsável: Dex (Builder)
responsavel_type: Agente
atomic_layer: Service

**Entrada:**
- campo: command
  tipo: string
  origem: User Input
  obrigatório: false
  validação: update|list|search|category
  default: update

- campo: query
  tipo: string
  origem: User Input
  obrigatório: false
  validação: Free text for search/category

- campo: severity
  tipo: string
  origem: User Input
  obrigatório: false
  validação: high|medium|low

- campo: format
  tipo: string
  origem: User Input
  obrigatório: false
  validação: md|json
  default: md

**Saída:**
- campo: gotchas_file
  tipo: string
  destino: .aiox/gotchas.md
  persistido: true

- campo: gotchas_json
  tipo: string
  destino: .aiox/gotchas.json
  persistido: true

- campo: statistics
  tipo: object
  destino: Console
  persistido: false
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Project has .aiox directory initialized
    tipo: pre-condition
    blocker: false
    validação: |
      Check if .aiox/ directory exists, create if not
    error_message: "Creating .aiox/ directory"

  - [ ] Node.js available for script execution
    tipo: pre-condition
    blocker: true
    validação: |
      Check node --version returns valid version
    error_message: "Node.js required for gotchas-documenter.js"
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] gotchas.md file generated/updated
    tipo: post-condition
    blocker: true
    validação: |
      Check .aiox/gotchas.md exists and has content
    error_message: "Failed to generate gotchas.md"

  - [ ] gotchas.json schema valid
    tipo: post-condition
    blocker: false
    validação: |
      Validate .aiox/gotchas.json against schema
    error_message: "gotchas.json schema validation failed"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] Gotchas extracted from session insights (AC1)
    tipo: acceptance-criterion
    blocker: true
    validação: |
      At least one insights file scanned

  - [ ] gotchas.md generated with proper format (AC2, AC3)
    tipo: acceptance-criterion
    blocker: true
    validação: |
      File contains Wrong/Right/Reason format

  - [ ] Gotchas categorized by area (AC4)
    tipo: acceptance-criterion
    blocker: true
    validação: |
      Categories present in output
```

---

## Workflow

### Command: `*list-gotchas` (AC7)

**Alias for**: `*document-gotchas list`

**Quick reference for all gotchas with optional filtering.**

### Command: `*document-gotchas [command] [options]`

**Available Commands:**

1. **update** (default)
   - Scans all session insights files
   - Extracts gotchas from `gotchasFound`, `discoveries`, `patternsLearned`
   - Deduplicates based on content similarity
   - Categorizes by area
   - Merges with existing gotchas
   - Generates `.aiox/gotchas.md` and `.aiox/gotchas.json`

2. **list**
   - Lists all gotchas
   - Options: `--severity high|medium|low`, `--format md|json`

3. **search \<query\>**
   - Searches gotchas by keyword
   - Searches in title, wrong, right, reason fields

4. **category \<name\>**
   - Lists gotchas by category
   - Categories: State Management, API, Database, Frontend/React, Testing, Build/Deploy, TypeScript, Authentication, Performance, Security, Other

---

## Execution Steps

### 1. Initialize

```javascript
const { GotchasDocumenter } = require('.aiox-core/infrastructure/scripts/gotchas-documenter');

const documenter = new GotchasDocumenter(rootPath, {
  outputPath: '.aiox/gotchas.md',
  quiet: false
});
```

### 2. Load Existing (if update)

```javascript
// Merge with existing gotchas to preserve manually added ones
documenter.mergeWithExisting('.aiox/gotchas.json');
```

### 3. Scan Insights Files

```javascript
// Scans:
// - docs/stories/**/insights/*.json
// - docs/stories/**/session-*.json
// - .aiox/insights/*.json
await documenter.scanInsightsFiles();
```

### 4. Process and Deduplicate

```javascript
// Remove duplicates based on content similarity
documenter.deduplicateGotchas();

// Categorize by area
documenter.categorizeGotchas();
```

### 5. Generate Output

```javascript
// Save markdown and JSON
const outputPath = documenter.saveGotchas();

// Display statistics
const stats = documenter.stats;
console.log(`Total: ${documenter.gotchas.size} gotchas`);
console.log(`Categories: ${stats.categoriesFound}`);
console.log(`Duplicates merged: ${stats.gotchasDeduplicated}`);
```

---

## Integration Points

### 1. Session Insights Capture (Story 7.1)

**Trigger:** After `*capture-insights` completes

```javascript
// In capture-session-insights workflow
afterCapture: async (insightsPath) => {
  const { updateGotchas } = require('.aiox-core/infrastructure/scripts/gotchas-documenter');
  await updateGotchas(rootPath);
}
```

### 2. Self-Critique Integration (Epic 4 - AC5)

**Usage:** Self-Critique checklist references gotchas

```javascript
// In self-critique-checklist.md execution
const { getGotchasForSelfCritique } = require('.aiox-core/infrastructure/scripts/gotchas-documenter');

// Get relevant gotchas for current context
const relevantGotchas = getGotchasForSelfCritique(rootPath, 'TypeScript');

// Include in self-critique prompt
const prompt = `
Before completing, verify against known gotchas:
${relevantGotchas.map(g => `- ${g.title}: ${g.reason}`).join('\n')}
`;
```

### 3. Spec Writer Integration (Epic 3)

**Usage:** Include relevant gotchas in implementation specs

```javascript
// When writing implementation spec
const gotchas = getGotchasForSelfCritique(rootPath, 'API');
// Add "Known Gotchas" section to spec
```

---

## Session Insights Schema

**Expected format for extraction:**

```json
{
  "storyId": "STORY-42",
  "capturedAt": "2026-01-28T14:00:00Z",

  "gotchasFound": [
    {
      "wrong": "Using persist() directly in create()",
      "right": "Wrap entire store in persist()",
      "reason": "TypeScript inference breaks otherwise",
      "severity": "medium",
      "relatedFiles": ["src/stores/authStore.ts"]
    }
  ],

  "discoveries": [
    {
      "category": "api",
      "description": "fetch() doesn't throw on HTTP errors",
      "relevance": "high"
    }
  ],

  "patternsLearned": [
    {
      "name": "Error Boundary Pattern",
      "antiPattern": "No error boundary in React tree",
      "pattern": "Wrap components in ErrorBoundary",
      "description": "Prevents white screen of death"
    }
  ]
}
```

---

## Output Format

### gotchas.md Structure (AC2, AC3)

```markdown
# Known Gotchas

> Auto-generated from session insights
> Last updated: 2026-01-28T14:00:00Z
> Total gotchas: 15

## Table of Contents
- [State Management](#state-management) (3)
- [API](#api) (2)
...

---

## State Management

### Zustand Persist Type Inference

**[HIGH]**

**Wrong:**
```typescript
const useStore = create(
  persist((set) => ({ ... }), { name: 'store' })
);
```

**Right:**
```typescript
const useStore = create<StoreType>()(
  persist((set) => ({ ... }), { name: 'store' })
);
```

**Reason:** Without explicit type parameter and extra parentheses, TypeScript cannot infer the store type correctly.

**Severity:** High

**Discovered:** STORY-42 (2026-01-28)

---
```

### gotchas.json Schema (AC6)

```json
{
  "schema": "aiox-gotchas-v1",
  "version": "1.0.0",
  "generatedAt": "2026-01-28T14:00:00Z",
  "statistics": {
    "total": 15,
    "bySeverity": { "high": 5, "medium": 8, "low": 2 },
    "byCategory": { "State Management": 3, "API": 2 },
    "insightsScanned": 10
  },
  "gotchas": [...],
  "categories": {...}
}
```

---

## CLI Examples

```bash
# Update gotchas from all insights
node .aiox-core/infrastructure/scripts/gotchas-documenter.js update

# List all gotchas
node .aiox-core/infrastructure/scripts/gotchas-documenter.js list

# List high severity only
node .aiox-core/infrastructure/scripts/gotchas-documenter.js list --severity high

# Search for specific gotchas
node .aiox-core/infrastructure/scripts/gotchas-documenter.js search "zustand"

# List by category
node .aiox-core/infrastructure/scripts/gotchas-documenter.js category TypeScript

# Output as JSON
node .aiox-core/infrastructure/scripts/gotchas-documenter.js list --format json
```

---

## Error Handling

**Strategy:** graceful-degradation

**Common Errors:**

1. **Error:** No insights files found
   - **Cause:** No session insights captured yet
   - **Resolution:** Run `*capture-insights` first
   - **Recovery:** Create empty gotchas.md with instructions

2. **Error:** Invalid insights JSON
   - **Cause:** Malformed JSON in insights file
   - **Resolution:** Skip file, log warning
   - **Recovery:** Continue processing other files

3. **Error:** Write permission denied
   - **Cause:** Cannot write to .aiox directory
   - **Resolution:** Check file permissions
   - **Recovery:** Output to stdout instead

---

## Performance

**Expected Metrics:**

```yaml
duration_expected: 1-5 seconds
cost_estimated: N/A (local processing)
token_usage: ~500 tokens (for help text only)
```

**Optimization Notes:**
- Uses in-memory deduplication for speed
- Incremental updates (merges with existing)
- Lightweight file scanning

---

## Scripts

**Script:** gotchas-documenter.js
  - **Purpose:** Extract and consolidate gotchas from session insights
  - **Language:** JavaScript
  - **Location:** .aiox-core/infrastructure/scripts/gotchas-documenter.js

---

## Dependencies

- `.aiox-core/development/tasks/capture-session-insights.md` - Provides input insights
- `.aiox-core/product/checklists/self-critique-checklist.md` - Consumes gotchas (AC5)
- `.aiox-core/development/tasks/spec-write-spec.md` - May reference gotchas

---

## Metadata

```yaml
story: 7.4
epic: Epic 7 - Memory Layer
version: 1.0.0
dependencies:
  - capture-session-insights
tags:
  - memory
  - learning
  - gotchas
  - documentation
updated_at: 2026-01-29
```
