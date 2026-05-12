# Library Validation Task

Validate third-party library usage against official documentation using Context7.

**Absorbed from:** Auto-Claude PR Review Phase 6.0

---

## Execution Modes

**Choose your execution mode:**

### 1. YOLO Mode - Fast, Autonomous (0-1 prompts)

- Autonomous validation with logging
- Minimal user interaction
- **Best for:** CI/CD integration, automated pipelines

### 2. Interactive Mode - Balanced, Educational (5-10 prompts) **[DEFAULT]**

- Explicit decision checkpoints
- Educational explanations of findings
- **Best for:** Learning, understanding library issues

### 3. Pre-Flight Planning - Comprehensive Upfront Planning

- Full library inventory before validation
- Zero ambiguity execution
- **Best for:** Large PRs with many dependencies

**Parameter:** `mode` (optional, default: `interactive`)

---

## Task Definition (AIOX Task Format V1.0)

```yaml
task: qaLibraryValidation()
responsavel: Quinn (Guardian)
responsavel_type: Agente
atomic_layer: Molecule

**Entrada:**
- campo: story_id
  tipo: string
  origem: User Input
  obrigatorio: true
  validacao: Must be valid story ID format (e.g., "6.3")

- campo: file_paths
  tipo: array
  origem: git diff or explicit list
  obrigatorio: false
  validacao: If empty, extracts from uncommitted changes

- campo: skip_stdlib
  tipo: boolean
  origem: config
  obrigatorio: false
  validacao: Default true (skip Node.js/Python stdlib)

**Saida:**
- campo: validation_report
  tipo: object
  destino: Return value
  persistido: false

- campo: issues_found
  tipo: number
  destino: Memory
  persistido: false

- campo: report_file
  tipo: file
  destino: docs/stories/{story-id}/qa/library_validation.json
  persistido: true
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Context7 MCP is available
    tipo: pre-condition
    blocker: true
    validacao: |
      Test: mcp__context7__resolve-library-id with test query
    error_message: "Pre-condition failed: Context7 MCP not available."

  - [ ] Modified files exist (git diff or explicit)
    tipo: pre-condition
    blocker: true
    validacao: |
      At least one file to analyze
    error_message: "Pre-condition failed: No files to validate."
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] Validation report generated
    tipo: post-condition
    blocker: true
    validacao: |
      library_validation.json exists with results
    error_message: "Post-condition failed: Validation report not generated."

  - [ ] All imports processed
    tipo: post-condition
    blocker: false
    validacao: |
      processed_count >= imports_found
    error_message: "Warning: Some imports were not processed."
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] Each library validated against Context7 docs
    tipo: acceptance-criterion
    blocker: true
    validacao: |
      For each import: resolve-library-id + query-docs executed
    error_message: "Acceptance criterion not met: Libraries not validated."

  - [ ] API usage verified for correctness
    tipo: acceptance-criterion
    blocker: true
    validacao: |
      Function signatures, parameters, return types checked
    error_message: "Acceptance criterion not met: API usage not verified."

  - [ ] Deprecated methods flagged
    tipo: acceptance-criterion
    blocker: true
    validacao: |
      Deprecated APIs identified and reported
    error_message: "Acceptance criterion not met: Deprecated methods not checked."
```

---

## Tools

**External/shared resources used by this task:**

- **Tool:** Context7 MCP
  - **Purpose:** Resolve library IDs and query documentation
  - **Source:** mcp**context7**resolve-library-id, mcp**context7**query-docs

- **Tool:** Grep
  - **Purpose:** Extract imports from source files
  - **Source:** Native Claude Code tool

- **Tool:** Read
  - **Purpose:** Read source files for analysis
  - **Source:** Native Claude Code tool

---

## Error Handling

**Strategy:** continue-on-error (log and continue)

**Common Errors:**

1. **Error:** Library Not Found in Context7
   - **Cause:** Uncommon or private library
   - **Resolution:** Log as "unvalidated", continue
   - **Recovery:** Manual review recommended

2. **Error:** Context7 Rate Limit
   - **Cause:** Too many requests
   - **Resolution:** Batch requests, add delay
   - **Recovery:** Retry with exponential backoff

3. **Error:** Import Parse Failure
   - **Cause:** Complex import syntax
   - **Resolution:** Log and skip
   - **Recovery:** Manual inspection

---

## Performance

**Expected Metrics:**

```yaml
duration_expected: 2-5 min (depends on import count)
cost_estimated: $0.01-0.05 (Context7 queries)
token_usage: ~2,000-5,000 tokens
```

**Optimization Notes:**

- Batch similar libraries
- Cache Context7 responses
- Skip stdlib and internal imports

---

## Metadata

```yaml
story: AUTO-CLAUDE-ABSORPTION
version: 1.0.0
source: Auto-Claude PR Review Phase 6.0
dependencies:
  - context7
tags:
  - quality-assurance
  - library-validation
  - context7
  - pr-review
updated_at: 2026-01-29
```

---

## Command

```
*validate-libraries {story-id} [--files file1,file2] [--include-stdlib]
```

**Parameters:**

- `story-id` (required): Story identifier (e.g., "6.3")
- `--files` (optional): Comma-separated file paths (default: git diff)
- `--include-stdlib` (optional): Include standard library validation

**Examples:**

```bash
*validate-libraries 6.3
*validate-libraries 6.3 --files src/api/auth.ts,src/utils/date.ts
```

---

## Workflow

### Phase 1: Extract Imports

1. Get list of modified files:

   ```bash
   git diff --name-only HEAD~1
   # Or use provided --files list
   ```

2. For each file, extract imports using regex patterns:

   ```javascript
   // JavaScript/TypeScript
   /import\s+(?:{[^}]+}|\*\s+as\s+\w+|\w+)\s+from\s+['"]([^'"]+)['"]/g
   /require\(['"]([^'"]+)['"]\)/g

   // Python
   /^import\s+(\S+)/gm
   /^from\s+(\S+)\s+import/gm
   ```

3. Filter out:
   - Relative imports (`./`, `../`)
   - Standard library (if `--include-stdlib` not set)
   - Already validated in this session

### Phase 2: Resolve Library IDs

For each unique library:

1. Call Context7 to resolve library ID:

   ```
   mcp__context7__resolve-library-id
   - libraryName: "react-query"
   - query: "How to use useQuery hook"
   ```

2. Store mapping:

   ```json
   {
     "react-query": "/tanstack/react-query",
     "prisma": "/prisma/prisma",
     "zod": "/colinhacks/zod"
   }
   ```

3. Log unresolved libraries for manual review

### Phase 3: Validate API Usage

For each import usage in code:

1. Query Context7 for documentation:

   ```
   mcp__context7__query-docs
   - libraryId: "/tanstack/react-query"
   - query: "useQuery function signature and parameters"
   ```

2. Validate against actual usage:
   - **Signatures:** Function parameters match docs
   - **Types:** Return types handled correctly
   - **Deprecated:** Check for deprecated API warnings
   - **Breaking Changes:** Check version-specific changes

3. Flag issues:
   ```json
   {
     "library": "react-query",
     "file": "src/hooks/useUser.ts",
     "line": 15,
     "issue": "DEPRECATED_API",
     "details": "useQuery options 'cacheTime' is deprecated, use 'gcTime'",
     "severity": "MAJOR",
     "fix": "Replace 'cacheTime' with 'gcTime'"
   }
   ```

### Phase 4: Generate Report

1. Create validation report:

   ```json
   {
     "timestamp": "2026-01-29T10:00:00Z",
     "story_id": "6.3",
     "summary": {
       "libraries_checked": 12,
       "issues_found": 3,
       "unresolved": 1,
       "passed": 8
     },
     "issues": [...],
     "unresolved_libraries": ["internal-utils"],
     "recommendations": [...]
   }
   ```

2. Save to `docs/stories/{story-id}/qa/library_validation.json`

3. Return summary for integration with QA review

---

## Validation Checklist

For each library, validate:

```yaml
validation_checklist:
  signatures:
    - [ ] Function parameters match documentation
    - [ ] Optional vs required parameters correct
    - [ ] Default values understood

  types:
    - [ ] Return types handled correctly
    - [ ] Generic type parameters correct
    - [ ] Null/undefined handling

  lifecycle:
    - [ ] Initialization/setup correct
    - [ ] Cleanup/disposal handled
    - [ ] Async patterns correct

  deprecation:
    - [ ] No deprecated APIs used
    - [ ] Migration path available if deprecated

  version:
    - [ ] API matches installed version
    - [ ] Breaking changes addressed
```

---

## Issue Severity Mapping

| Issue Type                             | Severity | Action     |
| -------------------------------------- | -------- | ---------- |
| Incorrect API signature                | CRITICAL | Must fix   |
| Deprecated API (removed in next major) | CRITICAL | Must fix   |
| Deprecated API (still works)           | MAJOR    | Should fix |
| Suboptimal pattern                     | MINOR    | Optional   |
| Missing error handling                 | MAJOR    | Should fix |
| Type mismatch                          | CRITICAL | Must fix   |
| Version incompatibility                | CRITICAL | Must fix   |

---

## Integration with QA Review

This task integrates into the QA review pipeline:

```
*review-build {story}
├── Phase 1-5: Standard checks
├── Phase 6.0: Library Validation ← THIS TASK
├── Phase 6.1: Security Checklist
├── Phase 6.2: Migration Validation
└── Phase 7-10: Continue review
```

**Trigger:** Automatically called during `*review-build`
**Manual:** Can be run standalone via `*validate-libraries`

---

## Example Output

```json
{
  "timestamp": "2026-01-29T10:30:00Z",
  "story_id": "6.3",
  "summary": {
    "libraries_checked": 5,
    "issues_found": 2,
    "unresolved": 0,
    "passed": 3
  },
  "issues": [
    {
      "id": "LIB-001",
      "library": "@tanstack/react-query",
      "file": "src/hooks/useUser.ts",
      "line": 15,
      "issue": "DEPRECATED_API",
      "severity": "MAJOR",
      "details": "Option 'cacheTime' is deprecated since v5, use 'gcTime'",
      "current_code": "useQuery({ cacheTime: 5000 })",
      "suggested_fix": "useQuery({ gcTime: 5000 })",
      "docs_link": "https://tanstack.com/query/latest/docs/react/guides/migrating-to-v5"
    },
    {
      "id": "LIB-002",
      "library": "zod",
      "file": "src/schemas/user.ts",
      "line": 8,
      "issue": "INCORRECT_SIGNATURE",
      "severity": "CRITICAL",
      "details": "z.string().email() does not accept options object",
      "current_code": "z.string().email({ message: 'Invalid' })",
      "suggested_fix": "z.string().email('Invalid')",
      "docs_link": "https://zod.dev/?id=strings"
    }
  ],
  "passed": [
    { "library": "react", "status": "PASS" },
    { "library": "next", "status": "PASS" },
    { "library": "prisma", "status": "PASS" }
  ]
}
```

---

## Exit Criteria

This task is complete when:

- All imports extracted from modified files
- Each library resolved via Context7 (or marked unresolved)
- API usage validated against documentation
- Deprecated methods flagged
- Report generated and saved
- Issues integrated into QA review

---

_Absorbed from Auto-Claude PR Review System - Phase 6.0_
_AIOX QA Enhancement v1.0_
