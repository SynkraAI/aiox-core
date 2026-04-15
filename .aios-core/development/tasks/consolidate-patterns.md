# Consolidate Patterns Using Intelligent Clustering

> Task ID: brad-consolidate-patterns
> Agent: Brad (Design System Architect)
> Version: 2.0.0

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

## Task Definition (AIOS Task Format V1.0)

```yaml
task: consolidatePatterns()
responsavel: Brad (Design System Architect)
responsavel_type: Agente
atomic_layer: Strategy

**Entrada:**
- campo: audit_report
  tipo: string
  origem: File (pattern-inventory.json)
  obrigatorio: true
  validacao: Valid JSON audit report from *audit command

- campo: similarity_threshold
  tipo: number
  origem: User Input
  obrigatorio: false
  validacao: Default 0.80 (80% visual match). Range 0.50-0.99

- campo: output_dir
  tipo: string
  origem: config
  obrigatorio: false
  validacao: Default outputs/design-system/{project}/consolidation/

**Saida:**
- campo: consolidation_report
  tipo: object
  destino: File (consolidation-report.md)
  persistido: true

- campo: pattern_mapping
  tipo: object
  destino: File (pattern-mapping.json)
  persistido: true

- campo: cluster_files
  tipo: array
  destino: File (color-clusters.txt, button-consolidation.txt, etc.)
  persistido: true
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Audit report (pattern-inventory.json) exists with valid pattern data
    tipo: pre-condition
    blocker: true
    validacao: |
      Check pattern-inventory.json exists in output directory and contains patterns object with at least one category (buttons, colors, spacing, typography, or forms)
    error_message: "Pre-condition failed: Run *audit first to generate pattern-inventory.json"

  - [ ] State file (.state.yaml) shows audit_complete phase
    tipo: pre-condition
    blocker: true
    validacao: |
      Read .state.yaml and verify phase is 'audit_complete' or later
    error_message: "Pre-condition failed: Audit phase not completed. Run *audit first"

  - [ ] At least one pattern type has redundancy factor > 1.5
    tipo: pre-condition
    blocker: false
    validacao: |
      Check redundancy factors in audit data; warn if all are below 1.5 (codebase may already be clean)
    error_message: "Warning: Low redundancy detected. Consolidation may yield minimal improvement"
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] Consolidation report generated with before/after counts per category
    tipo: post-condition
    blocker: true
    validacao: |
      Verify consolidation-report.md exists and contains reduction metrics for each pattern category analyzed
    error_message: "Post-condition failed: Consolidation report missing or incomplete"

  - [ ] Pattern mapping file created with old-to-new mappings
    tipo: post-condition
    blocker: true
    validacao: |
      Verify pattern-mapping.json exists with entries for each consolidated pattern
    error_message: "Post-condition failed: Pattern mapping file not generated"

  - [ ] State file updated to consolidation_complete phase
    tipo: post-condition
    blocker: true
    validacao: |
      Verify .state.yaml phase is 'consolidation_complete' with consolidation metrics recorded
    error_message: "Post-condition failed: State file not updated after consolidation"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] All duplicate groups identified with similarity >= configured threshold
    tipo: acceptance-criterion
    blocker: true
    validacao: |
      Assert each group has similarity score >= threshold and one canonical pattern selected
    error_message: "Acceptance criterion not met: Duplicate groups not properly identified"

  - [ ] Canonical pattern selected for every duplicate group with rationale
    tipo: acceptance-criterion
    blocker: true
    validacao: |
      Assert every group has exactly one canonical pattern and a documented reason for selection
    error_message: "Acceptance criterion not met: Missing canonical pattern or rationale"

  - [ ] Overall reduction percentage calculated and documented
    tipo: acceptance-criterion
    blocker: true
    validacao: |
      Assert overall_reduction is a valid percentage. Target >80% reduction
    error_message: "Acceptance criterion not met: Reduction percentage not calculated"
```

---

## Tools

**External/shared resources used by this task:**

- **Tool:** code-analyzer
  - **Purpose:** Compare pattern similarity using HSL distance and semantic analysis
  - **Source:** .aios-core/utils/code-analyzer.js

- **Tool:** file-system
  - **Purpose:** Read audit data, write consolidation outputs and cluster files
  - **Source:** Node.js fs module

---

## Scripts

**Agent-specific code for this task:**

- **Script:** consolidate-patterns.js
  - **Purpose:** HSL clustering, semantic grouping, and canonical selection
  - **Language:** JavaScript
  - **Location:** .aios-core/scripts/consolidate-patterns.js

---

## Error Handling

**Strategy:** fallback

**Common Errors:**

1. **Error:** Audit Report Not Found
   - **Cause:** *audit command was not run or output was deleted
   - **Resolution:** Run *audit first to generate pattern-inventory.json
   - **Recovery:** Exit with clear instruction to run audit

2. **Error:** No Duplicates Detected
   - **Cause:** Codebase already has minimal redundancy or threshold too high
   - **Resolution:** Lower similarity threshold or expand scan scope
   - **Recovery:** Report clean state, skip consolidation

3. **Error:** Ambiguous Canonical Selection
   - **Cause:** Multiple patterns in a group have equal usage frequency
   - **Resolution:** In interactive mode, ask user; in YOLO mode, pick most-used
   - **Recovery:** Log decision rationale in consolidation report

---

## Performance

**Expected Metrics:**

```yaml
duration_expected: 5-20 min (estimated)
cost_estimated: $0.003-0.015
token_usage: ~2,000-8,000 tokens
```

**Optimization Notes:**
- Group by pattern type first then compare within groups; skip identical matches early; cache HSL conversions

---

## Metadata

```yaml
story: N/A
version: 2.0.0
dependencies:
  - audit-codebase
tags:
  - design-system
  - consolidation
  - pattern-analysis
updated_at: 2026-04-10
```

---


## Description

Reduce UI pattern redundancy by clustering similar patterns using intelligent algorithms (HSL color clustering at 5% threshold, semantic button grouping). Target: >80% reduction.

## Prerequisites

- Audit completed (*audit command run successfully)
- .state.yaml exists with inventory results
- pattern-inventory.json available

## Workflow

### Interactive Elicitation

This task uses interactive elicitation to review consolidation decisions.

1. **Load Audit Results**
   - Read .state.yaml to get inventory data
   - Display current redundancy metrics
   - Confirm user wants to proceed with consolidation

2. **Review Clustering Parameters**
   - HSL threshold for colors (default: 5%)
   - Ask if user has manual overrides (patterns that shouldn't merge)
   - Confirm output directory

3. **Present Consolidation Recommendations**
   - Show before/after for each pattern type
   - Ask for approval or adjustments
   - Allow manual overrides before finalizing

### Steps

1. **Load Audit Data**
   - Read .state.yaml for inventory results
   - Validate audit phase completed
   - Extract pattern counts and scan path
   - Validation: State file exists and contains inventory data

2. **Cluster Colors by HSL Similarity**
   - Extract all unique colors from codebase
   - Convert hex to HSL color space
   - Group colors within 5% HSL threshold
   - Select most-used color in each cluster as primary
   - Identify semantic relationships (primary-dark as hover state)
   - Validation: Color clusters created with usage counts

3. **Cluster Button Patterns by Semantic Purpose**
   - Extract button class names and patterns
   - Analyze naming for semantic meaning (primary, secondary, danger, etc)
   - Group functionally equivalent buttons
   - Recommend minimal variant set (primary, secondary, destructive)
   - Validation: Button consolidation map created

4. **Consolidate Spacing Values**
   - Extract all padding and margin values
   - Identify base unit (4px or 8px)
   - Propose spacing scale (xs, sm, md, lg, xl, 2xl, 3xl)
   - Map existing values to scale
   - Validation: Spacing scale generated

5. **Consolidate Typography**
   - Extract font sizes, weights, families
   - Propose type scale (modular scale or fixed intervals)
   - Consolidate similar weights (merge 500 and 600 if both exist)
   - Recommend minimal font family set
   - Validation: Typography scale created

6. **Generate Consolidation Report**
   - Create consolidation-report.md with before/after metrics
   - Include reduction percentages for each pattern type
   - Generate detailed cluster files (color-clusters.txt, button-consolidation.txt)
   - Calculate overall reduction percentage
   - Validation: Report shows >80% reduction or explain why not

7. **Create Pattern Mapping**
   - Generate old-to-new mapping for each pattern type
   - Document which old patterns map to which new tokens
   - Create migration guide snippets
   - Validation: Complete mapping for all patterns

8. **Update State File**
   - Add consolidation section to .state.yaml
   - Record before/after counts for all pattern types
   - Update phase to "consolidation_complete"
   - Log Brad's consolidation decisions
   - Validation: State updated with consolidation data

## Output

- **consolidation-report.md**: Executive summary with reduction metrics
- **color-clusters.txt**: Detailed color groupings with usage counts
- **button-consolidation.txt**: Button semantic analysis and recommendations
- **spacing-consolidation.txt**: Spacing scale proposal
- **typography-consolidation.txt**: Typography scale proposal
- **pattern-mapping.json**: Old pattern to new token mappings
- **.state.yaml**: Updated with consolidation decisions

### Output Format

```yaml
# .state.yaml consolidation section
consolidation:
  completed_at: "2025-10-27T12:30:00Z"
  patterns_consolidated:
    colors:
      before: 89
      after: 12
      reduction: "86.5%"
      clusters: 8
    buttons:
      before: 47
      after: 3
      reduction: "93.6%"
      variants: ["primary", "secondary", "destructive"]
    spacing:
      before: 19
      after: 7
      reduction: "63.2%"
      scale: ["xs", "sm", "md", "lg", "xl", "2xl", "3xl"]
    typography:
      before: 21
      after: 10
      reduction: "52.4%"
  overall_reduction: "81.8%"
  target_met: true
```

## Success Criteria

- [ ] >80% overall pattern reduction achieved
- [ ] Color clustering uses HSL similarity (not just hex distance)
- [ ] Button variants identified by semantic purpose
- [ ] Spacing scale based on consistent base unit
- [ ] Most-used patterns preserved as primary tokens
- [ ] All consolidation decisions documented with rationale
- [ ] User can review and override before finalizing

## Error Handling

- **No audit data found**: Exit with message to run *audit first
- **Insufficient patterns to consolidate**: Report that codebase is already clean
- **Cannot achieve 80% reduction**: Explain why and show actual reduction achieved
- **Invalid state file**: Attempt to recover from backup or prompt re-audit

## Security Considerations

- Read-only analysis of patterns (no code modification)
- Validate user overrides to prevent injection
- Handle malformed color values safely
- Backup state file before overwriting

## Examples

### Example 1: Successful Consolidation

```bash
*consolidate
```

Output:
```
CONSOLIDATING COLORS...
Found 89 unique colors
Clustering with 5% HSL threshold...

CLUSTER 1 - Primary Blues (4 -> 1):
  #0066CC (234 uses) <- KEEP
  #0065CB, #0067CD, #0064CA (merge)

CLUSTER 2 - Error Reds (3 -> 1):
  #DC2626 (89 uses) <- KEEP
  #DB2525, #DD2727 (merge)

CONSOLIDATION SUMMARY:
| Pattern    | Before | After | Reduction |
|------------|--------|-------|-----------|
| Colors     | 89     | 12    | 86.5%     |
| Buttons    | 47     | 3     | 93.6%     |
| Spacing    | 19     | 7     | 63.2%     |
| Typography | 21     | 10    | 52.4%     |
| TOTAL      | 176    | 32    | 81.8%     |

TARGET MET: >80% reduction achieved
Report saved: outputs/design-system/my-app/consolidation/consolidation-report.md
```

### Example 2: User Override

```bash
*consolidate

Brad: "Merge #0066CC and #0052A3?"
User: "No, #0052A3 is intentional hover state"
Brad: "Override recorded. Keeping both."
```

## Notes

- HSL color space provides perceptual similarity (better than RGB/hex distance)
- Most-used pattern in each cluster becomes the canonical token
- Semantic button analysis looks for keywords: primary, main, secondary, default, danger, delete, destructive
- Spacing scale should use consistent base unit (4px or 8px)
- Manual overrides are respected and documented
- Run this after every audit to prevent pattern regression
- Brad says: "Numbers don't lie. 82% reduction = real savings."
