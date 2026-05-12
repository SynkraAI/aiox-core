---

## Execution Modes

**Choose your execution mode:**

### 1. YOLO Mode - Fast, Autonomous (0-1 prompts)
- Quick scan with default recommendations
- Minimal user interaction
- **Best for:** Initial assessment, quick checks

### 2. Interactive Mode - Balanced, Educational (5-10 prompts) **[DEFAULT]**
- Detailed analysis with explanation
- User confirmation on recommendations
- **Best for:** First-time brownfield integration

### 3. Pre-Flight Planning - Comprehensive Upfront Planning
- Full conflict analysis
- Manual review items prioritized
- **Best for:** Large existing projects, enterprise codebases

**Parameter:** `mode` (optional, default: `interactive`)

---

## Task Definition (AIOX Task Format V1.0)

```yaml
task: analyzeBrownfield()
responsible: architect (Architect)
responsible_type: Agent
atomic_layer: Analysis

inputs:
- field: targetDir
  type: string
  source: User Input or cwd
  required: false
  validation: Valid directory path with existing project

- field: outputFormat
  type: string
  source: User Input
  required: false
  validation: report|json|summary

- field: executionMode
  type: string
  source: User Input
  required: false
  validation: yolo|interactive|pre-flight

outputs:
- field: analysis
  type: BrownfieldAnalysis
  destination: Memory/Console
  persisted: false

- field: report
  type: string
  destination: Console or File
  persisted: optional

- field: recommendations
  type: array
  destination: Memory
  persisted: false
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Target directory exists and contains a project
    type: pre-condition
    blocker: true
    validation: |
      Check target directory exists and has project markers (package.json, go.mod, etc.)
    error_message: "Pre-condition failed: No project found in target directory"

  - [ ] Brownfield Analyzer module is available
    type: pre-condition
    blocker: true
    validation: |
      Verify .aiox-core/infrastructure/scripts/documentation-integrity/brownfield-analyzer.js exists
    error_message: "Pre-condition failed: Brownfield Analyzer module not found"
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] Analysis completed with tech stack detection
    type: post-condition
    blocker: true
    validation: |
      Verify analysis.techStack is populated
    error_message: "Post-condition failed: Tech stack detection incomplete"

  - [ ] Merge strategy determined
    type: post-condition
    blocker: true
    validation: |
      Verify analysis.mergeStrategy is set
    error_message: "Post-condition failed: Merge strategy not determined"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] All project markers analyzed
    type: acceptance-criterion
    blocker: true
    validation: |
      Assert tech stack, frameworks, standards, workflows analyzed
    error_message: "Acceptance criterion not met: Incomplete analysis"

  - [ ] Recommendations generated
    type: acceptance-criterion
    blocker: true
    validation: |
      Assert analysis.recommendations has at least one item
    error_message: "Acceptance criterion not met: No recommendations generated"

  - [ ] Conflicts identified if present
    type: acceptance-criterion
    blocker: false
    validation: |
      Assert potential conflicts flagged for review
    error_message: "Warning: Conflict detection may be incomplete"
```

---

## Tools

**External/shared resources used by this task:**

- **Tool:** brownfield-analyzer
  - **Purpose:** Analyze existing project structure and standards
  - **Source:** .aiox-core/infrastructure/scripts/documentation-integrity/brownfield-analyzer.js

- **Tool:** mode-detector
  - **Purpose:** Collect project markers for analysis
  - **Source:** .aiox-core/infrastructure/scripts/documentation-integrity/mode-detector.js

---

## Scripts

**Agent-specific code for this task:**

- **Script:** brownfield-analyzer.js
  - **Purpose:** Core analysis functions
  - **Language:** JavaScript
  - **Location:** .aiox-core/infrastructure/scripts/documentation-integrity/brownfield-analyzer.js

---

## Error Handling

**Strategy:** graceful-degradation

**Common Errors:**

1. **Error:** No Project Markers Found
   - **Cause:** Empty directory or unrecognized project type
   - **Resolution:** Check directory contains project files
   - **Recovery:** Return minimal analysis with recommendations

2. **Error:** Config Parse Error
   - **Cause:** Malformed config file (package.json, tsconfig.json, etc.)
   - **Resolution:** Skip problematic file, continue analysis
   - **Recovery:** Log warning, proceed with partial analysis

3. **Error:** Permission Denied
   - **Cause:** Cannot read certain directories
   - **Resolution:** Request elevated permissions or skip
   - **Recovery:** Note inaccessible areas in manual review items

---

## Performance

**Expected Metrics:**

```yaml
duration_expected: 30s-2 min (estimated)
cost_estimated: $0.001-0.002
token_usage: ~300-1,000 tokens
```

**Optimization Notes:**
- File existence checks are fast
- JSON parsing cached per file
- Directory structure scan is O(n) for root level

---

## Metadata

```yaml
story: 6.9
version: 1.0.0
dependencies:
  - documentation-integrity module
tags:
  - analysis
  - brownfield
  - migration
updated_at: 2025-12-14
```

---

tools:
  - filesystem        # Read project files
  - brownfield-analyzer  # Core module for this task
---

# Analyze Brownfield Project

## Purpose

Analyze an existing project to understand its structure, tech stack, coding standards, and CI/CD workflows before AIOX integration. This task provides recommendations for safe integration and identifies potential conflicts.

## Task Instructions

### 1. Run Project Analysis

Execute the brownfield analyzer on the target project:

```javascript
const { analyzeProject, formatMigrationReport } = require('./.aiox-core/infrastructure/scripts/documentation-integrity/brownfield-analyzer');

const targetDir = process.cwd(); // or specified directory
const analysis = analyzeProject(targetDir);
```

### 2. Review Analysis Results

The analysis returns comprehensive information about the project:

**BrownfieldAnalysis Structure:**

```typescript
interface BrownfieldAnalysis {
  // Basic flags
  hasExistingStructure: boolean;   // Has src/, lib/, tests/, etc.
  hasExistingWorkflows: boolean;   // Has CI/CD configurations
  hasExistingStandards: boolean;   // Has linting/formatting configs

  // Merge strategy
  mergeStrategy: 'parallel' | 'manual';  // Recommended approach

  // Detected stack
  techStack: string[];      // ['Node.js', 'TypeScript', 'Python', 'Go', 'Rust']
  frameworks: string[];     // ['React', 'Vue', 'Angular', 'Next.js', 'Express', etc.]
  version: string | null;   // Project version from package.json

  // Config paths
  configs: {
    eslint: string | null;
    prettier: string | null;
    tsconfig: string | null;
    flake8: string | null;
    packageJson: string | null;
    requirements: string | null;
    goMod: string | null;
    githubWorkflows: string | null;
    gitlabCi: string | null;
  };

  // Detected settings
  linting: string;      // 'ESLint', 'Flake8', 'none'
  formatting: string;   // 'Prettier', 'Black', 'none'
  testing: string;      // 'Jest', 'Vitest', 'pytest', 'none'

  // Integration guidance
  recommendations: string[];
  conflicts: string[];
  manualReviewItems: string[];

  // Summary
  summary: string;
}
```

### 3. Display Migration Report

Show the formatted analysis report:

```javascript
const report = formatMigrationReport(analysis);
console.log(report);
```

**Sample Report Output:**

```text
╔══════════════════════════════════════════════════════════════════════╗
║                    BROWNFIELD ANALYSIS REPORT                         ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  Tech Stack: Node.js, TypeScript                                     ║
║  Frameworks: React, Next.js                                          ║
║                                                                      ║
║  Linting: ESLint                                                     ║
║  Formatting: Prettier                                                ║
║  Testing: Jest                                                       ║
║                                                                      ║
║  Existing Workflows: Yes                                             ║
║  Merge Strategy: manual                                              ║
╠══════════════════════════════════════════════════════════════════════╣
║  RECOMMENDATIONS                                                     ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  • Preserve existing ESLint configuration - AIOX will adapt          ║
║  • Keep existing Prettier settings - AIOX coding-standards.md will d ║
║  • Review existing CI/CD before adding AIOX workflows                ║
║  • AIOX will use existing tsconfig.json settings                     ║
║  • Next.js detected - use pages/ or app/ structure                   ║
╠══════════════════════════════════════════════════════════════════════╣
║  📋 MANUAL REVIEW REQUIRED                                           ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  • Review 3 existing GitHub workflow(s) for potential conflicts      ║
╚══════════════════════════════════════════════════════════════════════╝
```

### 4. Interpret Merge Strategy

Based on the analysis, follow the recommended merge strategy:

| Strategy | Meaning | Actions |
|----------|---------|---------|
| `parallel` | Safe to proceed with standard AIOX setup | Use `*setup-project-docs` directly |
| `manual` | Existing CI/CD requires careful review | Review workflows, then proceed |

### 5. Address Manual Review Items

For each item in `analysis.manualReviewItems`:

1. **Review GitHub Workflows:**
   ```bash
   # List existing workflows
   ls -la .github/workflows/

   # Check for potential conflicts with AIOX workflows
   # Look for: quality-gate.yml, release.yml, staging.yml
   ```

2. **Review GitLab CI:**
   ```bash
   # Check .gitlab-ci.yml for existing stages
   cat .gitlab-ci.yml | grep -E "^[a-z]+:"
   ```

3. **Review CircleCI:**
   ```bash
   # Check CircleCI config
   cat .circleci/config.yml
   ```

### 6. Handle Conflicts

For each item in `analysis.conflicts`:

1. **docs/architecture/ exists:**
   - Decide: Keep existing or merge with AIOX docs
   - Option A: Rename existing to `docs/legacy-architecture/`
   - Option B: Configure AIOX to use alternate path

2. **Other conflicts:**
   - Document decision in story or task
   - Consider creating backup before integration

### 7. Proceed with Integration

After analysis and review, proceed based on findings:

**If mergeStrategy is 'parallel':**
```bash
# Direct integration
*setup-project-docs
```

**If mergeStrategy is 'manual':**
```bash
# First review workflows, then
*setup-project-docs --merge
```

## Success Criteria

- [ ] Tech stack correctly identified
- [ ] Frameworks detected from dependencies
- [ ] Existing code standards found
- [ ] CI/CD workflows catalogued
- [ ] Merge strategy determined
- [ ] Recommendations generated
- [ ] Conflicts identified
- [ ] Manual review items listed

## Output Options

**Console Report (default):**
```bash
*analyze-brownfield
```

**JSON Output:**
```bash
*analyze-brownfield --format json > analysis.json
```

**Summary Only:**
```bash
*analyze-brownfield --format summary
# Output: Tech Stack: Node.js, TypeScript | Frameworks: React | Standards: ESLint/Prettier | CI/CD: Existing workflows detected | Recommended Strategy: manual
```

## Integration with Other Tasks

This task is typically followed by:

1. **`*setup-project-docs`** - Generate project documentation
2. **`*document-project`** - Create comprehensive brownfield architecture doc
3. **`*create-brownfield-story`** - Create enhancement stories for existing projects

## Notes

- Analysis is read-only; no files are modified
- Run this task BEFORE any AIOX integration
- For large projects, analysis may take 1-2 minutes
- Recommendations are suggestions, not requirements
- Use manual review items to plan integration work
