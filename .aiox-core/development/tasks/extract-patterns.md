# Extract Patterns

## Purpose

Extract and document code patterns from the codebase. Analyzes code via AST and regex to detect common patterns used in the project, generating a `patterns.md` file that serves as a reference for agents (especially the Spec Writer) when creating new features.

## Task Definition (AIOX Task Format V1.0)

```yaml
task: extract-patterns()
agent: "@dev"
responsável: Dex (Developer)
responsavel_type: Agente
atomic_layer: Workflow

elicit: false

inputs:
  - name: subcommand
    type: enum
    required: false
    default: extract
    options: [extract, json, save, merge]
    description: Action to perform

  - name: root
    type: string
    required: false
    default: "."
    description: Project root path

  - name: output
    type: string
    required: false
    description: Custom output file path

  - name: category
    type: string
    required: false
    description: Extract only specific category (e.g., "State Management")

  - name: quiet
    type: flag
    required: false
    default: false
    description: Suppress console output

  - name: help
    type: flag
    required: false
    default: false
    description: Show usage documentation

outputs:
  - name: patterns_markdown
    type: string
    destino: File (.aiox/patterns.md)
    persistido: true

  - name: patterns_json
    type: object
    destino: Console or File
    persistido: false

  - name: summary
    type: object
    destino: Console
    persistido: false
```

---

## Pre-Conditions

```yaml
pre-conditions:
  - [ ] Project root is a valid codebase
    tipo: pre-condition
    blocker: true
    validação: Check package.json or .aiox-core exists
    error_message: "Could not find project root. Run from within a project directory."

  - [ ] Code files exist
    tipo: pre-condition
    blocker: true
    validação: At least one .ts/.tsx/.js/.jsx file exists
    error_message: "No code files found to analyze."
```

---

## Implementation Steps

### Step 1: Check Help Flag
```javascript
if (args.help) {
  displayHelp();
  return;
}
```

### Step 2: Initialize Pattern Extractor
```javascript
const PatternExtractor = require('.aiox-core/infrastructure/scripts/pattern-extractor');
const extractor = new PatternExtractor(args.root);
```

### Step 3: Detect Patterns
```javascript
const patterns = await extractor.detectPatterns();
```

### Step 4: Execute Subcommand

#### Extract (Default)
```javascript
if (args.subcommand === 'extract' || !args.subcommand) {
  const markdown = extractor.generateMarkdown();

  if (args.output) {
    await fs.writeFile(args.output, markdown);
    console.log(`Patterns saved to: ${args.output}`);
  } else {
    console.log(markdown);
  }
}
```

#### JSON Output
```javascript
if (args.subcommand === 'json') {
  const json = extractor.toJSON();

  if (args.output) {
    await fs.writeFile(args.output, JSON.stringify(json, null, 2));
    console.log(`JSON saved to: ${args.output}`);
  } else {
    console.log(JSON.stringify(json, null, 2));
  }
}
```

#### Save to Default Location
```javascript
if (args.subcommand === 'save') {
  const savedPath = await extractor.savePatterns(args.output);
  console.log(`Patterns saved to: ${savedPath}`);
}
```

#### Merge with Existing
```javascript
if (args.subcommand === 'merge') {
  const mergedPath = await extractor.mergeWithExisting(args.output);
  console.log(`Patterns merged and saved to: ${mergedPath}`);
}
```

---

## Help Text

```text
Usage: *extract-patterns [subcommand] [options]

Extract and document code patterns from the codebase.

Subcommands:
  extract     Extract patterns and output as markdown (default)
  json        Output patterns as JSON
  save        Save to .aiox/patterns.md
  merge       Merge with existing patterns file

Options:
  --root <path>       Project root (default: current directory)
  --output <path>     Custom output file path
  --category <name>   Extract specific category only
  --quiet             Suppress console output
  --help              Show this help message

Pattern Categories:
  - State Management  (Zustand, Redux, Context)
  - API Calls         (SWR, fetch, React Query)
  - Error Handling    (try-catch, ErrorBoundary, toast)
  - Components        (memo, compound, conditional classes)
  - Hooks             (custom hooks, useEffect cleanup)
  - Data Access       (Prisma, fs.promises)
  - Testing           (Jest structure, mocks)
  - Utilities         (class-based, functional)

Examples:
  *extract-patterns                           # Output to console
  *extract-patterns save                      # Save to .aiox/patterns.md
  *extract-patterns json --output p.json      # Save as JSON
  *extract-patterns --category "State"        # Only state patterns
  *extract-patterns merge                     # Update existing file

Output File:
  Default location: .aiox/patterns.md
  This file is referenced by the Spec Writer for consistent patterns.
```

---

## Output Formats

### Markdown Output (Default)
```markdown
# Project Patterns

> Auto-generated from codebase analysis
> Last updated: 2026-01-28T14:00:00Z

## Table of Contents

- [State Management](#state-management)
- [API Calls](#api-calls)
- [Error Handling](#error-handling)
...

## State Management

### Zustand Store with Persist

\`\`\`typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ExampleState {
  data: Data | null;
  loading: boolean;
  ...
}

export const useExampleStore = create<ExampleState>()(
  persist(
    (set, get) => ({
      ...
    }),
    { name: 'example-storage' }
  )
);
\`\`\`

**When to use:** Any domain state that needs persistence across sessions.

**Files using this pattern:** authStore.ts, userStore.ts, settingsStore.ts

---
```

### JSON Output
```json
{
  "generated": "2026-01-28T14:00:00Z",
  "rootPath": "/path/to/project",
  "totalPatterns": 12,
  "categories": {
    "State Management": [
      {
        "name": "Zustand Store with Persist",
        "description": "...",
        "whenToUse": "...",
        "example": "...",
        "filesUsing": ["store.ts"],
        "confidence": 0.95
      }
    ]
  }
}
```

### Summary Output
```text
Scanning patterns in: /path/to/project
Patterns saved to: .aiox/patterns.md

Total patterns detected: 12
  State Management: 3
  API Calls: 2
  Error Handling: 2
  Components: 2
  Hooks: 1
  Data Access: 1
  Testing: 1
```

---

## Post-Conditions

```yaml
post-conditions:
  - [ ] Patterns file created/updated
    tipo: post-condition
    blocker: false
    validação: Check .aiox/patterns.md exists and is valid markdown

  - [ ] Summary displayed
    tipo: post-condition
    blocker: false
    validação: Console shows pattern count summary
```

---

## Integration with Spec Writer

The generated `patterns.md` file is automatically referenced by the Spec Writer (Epic 3) when:

1. **Creating new stories** - Patterns inform implementation approach
2. **Reviewing code** - Ensures consistency with existing patterns
3. **Suggesting architecture** - Uses detected patterns as baseline

### Reference in Spec Writer

```yaml
# In spec-write.md task
references:
  - path: .aiox/patterns.md
    purpose: Ensure new code follows existing patterns
    usage: Include relevant patterns in implementation notes
```

---

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| Project root not found | Invalid path | Use --root to specify correct path |
| No code files found | Empty project | Ensure project has .ts/.tsx/.js files |
| Permission denied | File access | Check directory permissions |
| Invalid category | Typo in category name | Use exact category name from help |

**Error Recovery Strategy:**
```javascript
try {
  const patterns = await extractor.detectPatterns();
  displaySummary(patterns);
} catch (error) {
  console.error(`⚠️ Error extracting patterns: ${error.message}`);
  console.log('Ensure you are in a valid project directory.');
}
```

---

## Performance

```yaml
duration_expected: 5-30s (depends on codebase size)
cost_estimated: $0.00 (local file operations only)
token_usage: 0

optimizations:
  - File caching during scan
  - Early termination for pattern detection
  - Incremental updates with merge command
  - Excluded directories: node_modules, .git, dist, build
```

---

## CLI Script

```bash
# Direct script execution
node .aiox-core/infrastructure/scripts/pattern-extractor.js [command] [options]

# Via AIOX command
*extract-patterns [command] [options]
```

---

## Metadata

```yaml
story: "7.3"
epic: "Epic 7 - Memory Layer"
version: 1.0.0
created: 2026-01-29
author: "@dev (Dex)"
dependencies:
  modules:
    - .aiox-core/infrastructure/scripts/pattern-extractor.js
  tasks: []
  referenced_by:
    - spec-write.md
tags:
  - memory-layer
  - patterns
  - code-analysis
  - spec-writer
  - documentation
```
