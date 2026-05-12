---

# audit-utilities

## Execution Modes

**Choose your execution mode:**

### 1. YOLO Mode - Fast, Autonomous (0-1 prompts)
- Autonomous decision making with logging
- Minimal user interaction
- **Best for:** Simple, deterministic tasks

### 2. Interactive Mode - Balanced, Educational (5-10 prompts) **[DEFAULT]**
- Explicit decision checkpoints
- Educational explanations
- **Best for:** Learning, complex decisions

### 3. Pre-Flight Planning - Comprehensive Upfront Planning
- Task analysis phase (identify all ambiguities)
- Zero ambiguity execution
- **Best for:** Ambiguous requirements, critical work

**Parameter:** `mode` (optional, default: `interactive`)

---

## Task Definition (AIOX Task Format V1.0)

```yaml
task: auditUtilities()
responsável: Quinn (Guardian)
responsavel_type: Agente
atomic_layer: Strategy

**Entrada:**
- campo: target
  tipo: string
  origem: User Input
  obrigatório: true
  validação: Valid path or identifier

- campo: options
  tipo: object
  origem: config
  obrigatório: false
  validação: Analysis configuration

- campo: depth
  tipo: number
  origem: User Input
  obrigatório: false
  validação: Default: 1 (0-3)

**Saída:**
- campo: analysis_report
  tipo: object
  destino: File (.ai/*.json)
  persistido: true

- campo: findings
  tipo: array
  destino: Memory
  persistido: false

- campo: metrics
  tipo: object
  destino: Memory
  persistido: false
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Target exists and is accessible; analysis tools available
    tipo: pre-condition
    blocker: true
    validação: |
      Check target exists and is accessible; analysis tools available
    error_message: "Pre-condition failed: Target exists and is accessible; analysis tools available"
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] Analysis complete; report generated; no critical issues
    tipo: post-condition
    blocker: true
    validação: |
      Verify analysis complete; report generated; no critical issues
    error_message: "Post-condition failed: Analysis complete; report generated; no critical issues"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] Analysis accurate; all targets covered; report complete
    tipo: acceptance-criterion
    blocker: true
    validação: |
      Assert analysis accurate; all targets covered; report complete
    error_message: "Acceptance criterion not met: Analysis accurate; all targets covered; report complete"
```

---

## Tools

**External/shared resources used by this task:**

- **Tool:** code-analyzer
  - **Purpose:** Static code analysis and metrics
  - **Source:** .aiox-core/utils/code-analyzer.js

- **Tool:** file-system
  - **Purpose:** Recursive directory traversal
  - **Source:** Node.js fs module

---

## Scripts

**Agent-specific code for this task:**

- **Script:** analyze-codebase.js
  - **Purpose:** Codebase analysis and reporting
  - **Language:** JavaScript
  - **Location:** .aiox-core/scripts/analyze-codebase.js

---

## Error Handling

**Strategy:** fallback

**Common Errors:**

1. **Error:** Target Not Accessible
   - **Cause:** Path does not exist or permissions denied
   - **Resolution:** Verify path and check permissions
   - **Recovery:** Skip inaccessible paths, continue with accessible ones

2. **Error:** Analysis Timeout
   - **Cause:** Analysis exceeds time limit for large codebases
   - **Resolution:** Reduce analysis depth or scope
   - **Recovery:** Return partial results with timeout warning

3. **Error:** Memory Limit Exceeded
   - **Cause:** Large codebase exceeds memory allocation
   - **Resolution:** Process in batches or increase memory limit
   - **Recovery:** Graceful degradation to summary analysis

---

## Performance

**Expected Metrics:**

```yaml
duration_expected: 5-20 min (estimated)
cost_estimated: $0.003-0.015
token_usage: ~2,000-8,000 tokens
```

**Optimization Notes:**
- Iterative analysis with depth limits; cache intermediate results; batch similar operations

---

## Metadata

```yaml
story: N/A
version: 1.0.0
dependencies:
  - N/A
tags:
  - automation
  - workflow
updated_at: 2025-11-17
```

---

## Configuration Dependencies

This task requires the following configuration keys from `core-config.yaml`:

- **`devStoryLocation`**: Location of story files (typically docs/stories)

- **`qaLocation`**: QA output directory (typically docs/qa) - Required to write quality reports and gate files

**Loading Config:**
```javascript
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../../.aiox-core/core-config.yaml');
const config = yaml.load(fs.readFileSync(configPath, 'utf8'));

const dev_story_location = config.devStoryLocation;
const qaLocation = config.qaLocation || 'docs/qa'; // qaLocation
```

## Purpose

Systematically audit all utilities in `.aiox-core/scripts/` to determine their functional status, classify them as WORKING/FIXABLE/DEPRECATED, and generate actionable recommendations for maintenance and cleanup.

## Classification Criteria

### ✅ WORKING
- Executes without errors
- Dependencies installed
- Integrated with at least one agent/task
- Documentation exists (inline or external)

### 🔧 FIXABLE
- Executes with minor errors (missing deps, syntax fixes)
- Core logic sound, needs integration
- Fix effort estimated <4 hours
- Concept valuable enough to justify fix

### 🗑️ DEPRECATED
- Non-functional, major rewrites needed
- Obsolete concept (replaced by better approach)
- Fix effort >8 hours
- Low value relative to effort

## Execution Steps

### Step 1: Run Automated Testing

Execute the test-utilities.js script to test all utilities:

```bash
node .aiox-core/scripts/test-utilities.js
```

This will:
- Attempt to require() each utility
- Check for missing dependencies
- Test exported functions
- Classify as WORKING/FIXABLE/DEPRECATED based on errors

### Step 2: Verify Integration Status

Run integration scan to find utility usage:

```bash
# For each utility, count references in agents and tasks
for util in .aiox-core/scripts/*.js; do
  name=$(basename $util .js)
  count=$(grep -r "$name" .aiox-core/agents .aiox-core/tasks Squads 2>/dev/null | wc -l)
  echo "$name: $count references"
done
```

### Step 3: Manual Classification Review

For utilities with ambiguous status:
- Review source code quality
- Estimate completion percentage
- Assess concept value
- Calculate fix effort estimate

### Step 4: Generate Priority Scoring

For FIXABLE utilities, calculate priority score:

```
Priority Score = (Integration Count × 10) + (Completion % × 5) - (Fix Hours)
```

Higher scores = higher priority for fixing

### Step 5: Make Story 3.19 Decision

Determine if memory-layer capabilities exist:
- Search for memory-related utilities
- IF found AND classified FIXABLE:
  - Estimate fix effort vs 20h threshold
  - Assess core functionality completion (>60%?)
  - Recommend GO/NO-GO/DEFER

### Step 6: Generate Audit Report

Create comprehensive report with:
- Summary statistics (X WORKING, Y FIXABLE, Z DEPRECATED)
- Per-utility details (status, errors, integration count, recommendation)
- Fix priority list (ranked FIXABLE utilities)
- Cleanup list (DEPRECATED utilities to remove)
- Story 3.19 activation recommendation

## Output

**Primary**: `UTILITIES-AUDIT-REPORT.md` in project root or docs/

**Format**:
```markdown
# Framework Utilities Audit Report

## Executive Summary
- Total Utilities: X
- ✅ WORKING: Y (Z%)
- 🔧 FIXABLE: A (B%)
- 🗑️ DEPRECATED: C (D%)

## Detailed Findings

### WORKING Utilities
...

### FIXABLE Utilities (Priority Ranked)
...

### DEPRECATED Utilities (Cleanup Candidates)
...

## Story 3.19 Decision
...
```

## Success Criteria

- All 81 utilities audited without crashes
- Classification is consistent and reproducible
- Integration counts accurate
- Report is actionable for Story 3.18 (cleanup)
- Story 3.19 decision has clear rationale

## Notes

- Run from project root directory
- Requires Node.js environment
- May take 5-10 minutes for full audit
- Some utilities may have circular dependencies - handle gracefully
