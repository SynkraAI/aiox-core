---
tools:
  - github-cli        # Git operations for archiving files
---

# Cleanup Utilities Task

## Purpose

Safely archive deprecated utilities identified in Story 3.17 audit, reducing technical debt and developer confusion while maintaining the ability to restore utilities if needed.

## Safety Principles

**CRITICAL**: This task archives (not deletes) deprecated utilities using a fail-safe workflow:
1. **Backup first** - Create timestamped backup before any changes
2. **Verify dependencies** - Block removal if active code depends on utility
3. **Archive, don't delete** - Preserve files for historical reference
4. **Validate after** - Ensure framework still works after cleanup
5. **Document rollback** - Clear instructions to undo if needed

## Prerequisites

- Story 3.17 complete (UTILITIES-AUDIT-REPORT.md exists)
- List of DEPRECATED utilities from audit report
- Git repository in clean state

## Classification Review

Before cleanup, verify utilities are truly deprecated:

### ✅ SAFE TO ARCHIVE
- No active code references (grep shows 0 results)
- Classified as DEPRECATED in audit report
- Obsolete concept or non-functional
- Duplicate/refactored version exists

### ⚠️ NEEDS REVIEW
- Has active references in code (grep shows >0 results)
- Classified as FIXABLE but needs deprecation
- Unclear status from audit

### ❌ DO NOT ARCHIVE
- Classified as WORKING in audit report
- Critical framework utility
- Has active agent/task dependencies

## Configuration Dependencies

This task requires the following configuration keys from `core-config.yaml`:

- **`devStoryLocation`**: Location of story files (typically docs/stories) - Required to access Story 3.17 audit results
- **`core-config`**: Direct reference to core configuration file - This task updates the utility count in core-config.yaml
- **`qaLocation`**: QA output directory (typically docs/qa) - Required to write quality reports

**Loading Config:**
```javascript
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../../.aiox-core/core-config.yaml');
const config = yaml.load(fs.readFileSync(configPath, 'utf8'));

const devStoryLocation = config.devStoryLocation; // For accessing audit report
const coreConfigPath = configPath; // For updating utility count
const qaLocation = config.qa?.qaLocation || 'docs/qa'; // qaLocation
```

## Execution Steps

### Step 1: Pre-Cleanup Preparation

**1.1 Create Backup**
```bash
# Create timestamped backup of entire utils directory
mkdir -p .backups
cp -r .aiox-core/utils ".backups/utils.backup-3.18-$(date +%Y%m%d-%H%M%S)"
```

**1.2 Verify Audit Report**
```bash
# Ensure audit report exists and is readable
test -f UTILITIES-AUDIT-REPORT.md && echo "✅ Audit report found" || echo "❌ Audit report missing"
```

**1.3 Extract Deprecated List**

From UTILITIES-AUDIT-REPORT.md, identify all utilities in:
- Category A: Duplicate/Redundant Versions
- Category B: Incomplete Experiments
- Category C: Obsolete Concepts
- Category D: Misplaced (move, don't archive)

### Step 2: Dependency Verification (CRITICAL)

For each deprecated utility, check for active references:

**2.1 Automated Dependency Check**
```bash
# Check for require() statements
grep -r "require.*utility-name" .aiox-core/agents .aiox-core/tasks .aiox-core/workflows Squads/

# Check for string references (utility mentioned in docs/configs)
grep -r "utility-name" .aiox-core/agents/ .aiox-core/tasks/ .aiox-core/core-config.yaml

# Count total references
count=$(grep -r "utility-name" .aiox-core/ Squads/ 2>/dev/null | wc -l)
echo "References found: $count"
```

**2.2 Manual Review**

If references found (count > 0):
- Review each reference context
- Determine if reference is:
  - Active usage (BLOCK removal)
  - Comment/documentation (SAFE to remove)
  - Obsolete reference (UPDATE then remove)

**2.3 Create Exception List**

Document utilities that cannot be archived due to dependencies:
```markdown
## Utilities with Active Dependencies

1. utility-name.js
   - References: 5 locations
   - Reason: Still used by @agent-name
   - Action: Defer until Story X.XX removes dependency
```

### Step 3: Create Archive Structure

**3.1 Create Archive Directory**
```bash
mkdir -p .aiox-core/utils-archive
```

**3.2 Create Archive README**

Create `.aiox-core/utils-archive/ARCHIVE-README.md`:

```markdown
# Archived Utilities - Story 3.18

**Archive Date**: 2025-10-31
**Story**: Epic 3c - Story 3.18 (Utilities Cleanup & Deprecation)
**Audit Report**: UTILITIES-AUDIT-REPORT.md (Story 3.17)

## Purpose

This directory contains utilities that were deprecated and removed from active use during Epic 3 Phase 2. Files are preserved for historical reference and potential restoration.

## Why Archive Instead of Delete?

1. **Historical Reference** - Document what was tried and why it didn't work
2. **Restoration Capability** - Enable future restoration if utility is needed
3. **Audit Trail** - Maintain complete codebase history
4. **Learning Resource** - Study patterns that didn't work out

## Archive Categories

### Category A: Duplicate/Redundant Versions (9 files)
Utilities with `-refactored` or `-fixed` suffixes where original version works.

### Category B: Incomplete Experiments (9 files)
Partially implemented utilities that were abandoned before completion.

### Category C: Obsolete Concepts (12 files)
Utilities whose functionality is better handled by external tools or manual processes.

### Category D: Misplaced Files (1 file)
Test files that belong in `/tests` directory instead of `/utils`.

## How to Restore a Utility

If you need to restore an archived utility:

1. **Copy file back**:
   ```bash
   cp .aiox-core/utils-archive/utility-name.js .aiox-core/scripts/
   ```

2. **Reinstall dependencies** (if needed):
   ```bash
   npm install missing-dependency
   ```

3. **Update references**:
   - Add utility to agent dependencies if needed
   - Update task workflows that use it
   - Add to core-config.yaml registry

4. **Test thoroughly**:
   ```bash
   node .aiox-core/scripts/test-utilities.js
   ```

5. **Update Story 3.18**:
   - Document which utility was restored and why
   - Reclassify in audit report (DEPRECATED → WORKING/FIXABLE)

## Archived Utilities

Total: 28 files archived from 81 total utilities

[Detailed list generated during cleanup]

## Rollback Procedure

If cleanup breaks something:

**Immediate Rollback**:
```bash
rm -rf .aiox-core/utils
cp -r .backups/utils.backup-3.18-YYYYMMDD-HHMMSS .aiox-core/utils
```

**Selective Restoration**:
```bash
cp .aiox-core/utils-archive/specific-utility.js .aiox-core/scripts/
```

---

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
task: cleanupUtilities()
responsável: Dex (Builder)
responsavel_type: Agente
atomic_layer: Molecule

**Entrada:**
- campo: task
  tipo: string
  origem: User Input
  obrigatório: true
  validação: Must be registered task

- campo: parameters
  tipo: object
  origem: User Input
  obrigatório: false
  validação: Valid task parameters

- campo: mode
  tipo: string
  origem: User Input
  obrigatório: false
  validação: yolo|interactive|pre-flight

**Saída:**
- campo: execution_result
  tipo: object
  destino: Memory
  persistido: false

- campo: logs
  tipo: array
  destino: File (.ai/logs/*)
  persistido: true

- campo: state
  tipo: object
  destino: State management
  persistido: true
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Task is registered; required parameters provided; dependencies met
    tipo: pre-condition
    blocker: true
    validação: |
      Check task is registered; required parameters provided; dependencies met
    error_message: "Pre-condition failed: Task is registered; required parameters provided; dependencies met"
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] Task completed; exit code 0; expected outputs created
    tipo: post-condition
    blocker: true
    validação: |
      Verify task completed; exit code 0; expected outputs created
    error_message: "Post-condition failed: Task completed; exit code 0; expected outputs created"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] Task completed as expected; side effects documented
    tipo: acceptance-criterion
    blocker: true
    validação: |
      Assert task completed as expected; side effects documented
    error_message: "Acceptance criterion not met: Task completed as expected; side effects documented"
```

---

## Tools

**External/shared resources used by this task:**

- **Tool:** task-runner
  - **Purpose:** Task execution and orchestration
  - **Source:** .aiox-core/core/task-runner.js

- **Tool:** logger
  - **Purpose:** Execution logging and error tracking
  - **Source:** .aiox-core/utils/logger.js

---

## Scripts

**Agent-specific code for this task:**

- **Script:** execute-task.js
  - **Purpose:** Generic task execution wrapper
  - **Language:** JavaScript
  - **Location:** .aiox-core/scripts/execute-task.js

---

## Error Handling

**Strategy:** retry

**Common Errors:**

1. **Error:** Task Not Found
   - **Cause:** Specified task not registered in system
   - **Resolution:** Verify task name and registration
   - **Recovery:** List available tasks, suggest similar

2. **Error:** Invalid Parameters
   - **Cause:** Task parameters do not match expected schema
   - **Resolution:** Validate parameters against task definition
   - **Recovery:** Provide parameter template, reject execution

3. **Error:** Execution Timeout
   - **Cause:** Task exceeds maximum execution time
   - **Resolution:** Optimize task or increase timeout
   - **Recovery:** Kill task, cleanup resources, log state

---

## Performance

**Expected Metrics:**

```yaml
duration_expected: 2-5 min (estimated)
cost_estimated: $0.001-0.003
token_usage: ~1,000-3,000 tokens
```

**Optimization Notes:**
- Parallelize independent operations; reuse atom results; implement early exits

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

*Generated during Story 3.18 - Epic 3c Phase 2*
```

### Step 4: Execute Cleanup

**4.1 Archive Deprecated Utilities**

For each utility in the deprecated list with 0 dependencies:

```bash
# Use git mv to preserve history
git mv .aiox-core/scripts/utility-name.js .aiox-core/utils-archive/

# Or for multiple files:
git mv .aiox-core/scripts/{aiox-validator-fixed.js,aiox-validator-refactored.js} .aiox-core/utils-archive/
```

**4.2 Move Misplaced Files** (Category D)

```bash
# Create tests directory if it doesn't exist
mkdir -p tests/utils

# Move test files to proper location
git mv .aiox-core/scripts/aiox-validator.test.js tests/utils/
```

**4.3 Update Archive README**

Add complete list of archived files to ARCHIVE-README.md:

```markdown
## Archived Utilities

### Category A: Duplicate/Redundant (9 files)
1. aiox-validator-fixed.js - Duplicate of aiox-validator.js
2. aiox-validator-refactored.js - Duplicate of aiox-validator.js
...

### Category B: Incomplete Experiments (9 files)
1. change-propagation-predictor.js - 20% complete, no clear use case
...

### Category C: Obsolete Concepts (12 files)
1. batch-creator.js - Batch processing not used
...

**Total Archived**: 30 files
**Remaining Active**: 51 files
```

### Step 5: Update Documentation

**5.1 Update core-config.yaml**

Update utility count in `.aiox-core/core-config.yaml`:

```yaml
framework:
  entities:
    utils:
      count: 51  # Updated from 81
      location: .aiox-core/scripts/
```

**5.2 Add Changelog Entry**

Add entry to Epic 3 changelog (or Story 3.18 change_log):

```yaml
- date: '2025-10-31'
  version: 2.0.0
  description: Utilities cleanup complete - 30 deprecated files archived
  author: James (@dev)
  changes:
    - 'Archived 30 deprecated utilities (37% of total 81)'
    - 'Created utils-archive/ with restoration documentation'
    - 'Moved 1 test file to proper location'
    - 'Updated core-config.yaml utility count: 81 → 51'
    - 'Framework validation passed post-cleanup'
    - 'All agents (@dev, @po, @qa) activate successfully'
```

**5.3 Update Developer Guides**

If any developer guides reference archived utilities, update them:
- Remove references to deprecated utilities
- Update utility lists to reflect active utilities only
- Add note about archived utilities location

### Step 6: Validation (CRITICAL)

**6.1 Framework Validation**

Run framework validator to ensure no broken references:

```bash
node .aiox-core/scripts/aiox-validator.js
```

Expected: 0 errors related to missing utilities

**6.2 Agent Activation Tests**

Test that all core agents still activate:

```bash
# Test each agent manually or via script
# @dev agent
# @po agent
# @qa agent
```

Expected: All agents load without errors

**6.3 Grep Validation**

Verify no broken references to archived utilities:

```bash
# Check for require() statements pointing to archived utilities
for util in $(ls .aiox-core/utils-archive/*.js); do
  name=$(basename $util .js)
  refs=$(grep -r "require.*$name" .aiox-core/agents .aiox-core/tasks 2>/dev/null | wc -l)
  if [ $refs -gt 0 ]; then
    echo "⚠️ Found $refs references to archived utility: $name"
  fi
done
```

Expected: 0 references to archived utilities

**6.4 Test Utilities Scan**

Re-run test-utilities.js to verify remaining utilities:

```bash
node .aiox-core/scripts/test-utilities.js
```

Expected: Only active utilities tested, no errors loading utilities

### Step 7: Create Rollback Documentation

Document the exact rollback procedure in story completion notes:

```markdown
## Rollback Procedure

**Backup Location**: `.backups/utils.backup-3.18-YYYYMMDD-HHMMSS`

**Full Rollback**:
```bash
rm -rf .aiox-core/utils
cp -r .backups/utils.backup-3.18-YYYYMMDD-HHMMSS .aiox-core/utils
git checkout .aiox-core/core-config.yaml
```

**Selective Restoration**:
```bash
cp .aiox-core/utils-archive/utility-name.js .aiox-core/scripts/
```

**Verification**:
```bash
node .aiox-core/scripts/aiox-validator.js
```
```

## Output

**Primary Deliverables**:
1. `.aiox-core/utils-archive/` - Archive directory with 30 deprecated utilities
2. `.aiox-core/utils-archive/ARCHIVE-README.md` - Archive documentation
3. `.backups/utils.backup-3.18-YYYYMMDD-HHMMSS/` - Timestamped backup
4. Updated `.aiox-core/core-config.yaml` - Corrected utility count
5. Updated story change_log - Cleanup completion entry

**Expected Results**:
- 30 utilities archived (37% of 81 total)
- 51 utilities remain active (63% of total)
- 1 test file moved to proper location
- 0 broken references introduced
- All agents activate successfully
- Framework validation passes

## Success Criteria

- ✅ All 30 deprecated utilities archived without deletion
- ✅ Zero broken references (grep validation passes)
- ✅ Framework validation (aiox-validator.js) passes
- ✅ All agents (@dev, @po, @qa) activate successfully
- ✅ Backup created before changes
- ✅ Archive README created with restoration instructions
- ✅ core-config.yaml updated accurately
- ✅ Rollback procedure documented and tested
- ✅ No utility references in agents point to archived utilities

## Notes

### Windows Compatibility
- Use Git Bash for commands (git mv, grep, etc.)
- Backup paths: `.backups/utils.backup-3.18-YYYYMMDD-HHMMSS`
- Test on Windows 10/11 with Git for Windows

### Safety Reminders
- **NEVER** delete files, only archive
- **ALWAYS** backup before making changes
- **VERIFY** dependencies before archiving
- **TEST** framework after cleanup
- **DOCUMENT** rollback procedure

### Integration with safe-removal-handler.js

While this task can be executed manually following the steps above, the `safe-removal-handler.js` utility provides automated safety checks. For future cleanups, consider integrating with the handler for:
- Automated dependency checking
- Safety verification
- Quarantine for uncertain utilities
- Automated rollback capability

For this cleanup, manual execution is preferred to maintain full control and visibility.

## Estimated Time

- Step 1-2: 1 hour (preparation + dependency checking)
- Step 3: 30 minutes (archive structure)
- Step 4: 1 hour (execution)
- Step 5: 30 minutes (documentation)
- Step 6: 1 hour (validation)
- **Total**: 4 hours

## Common Issues

**Issue**: Git mv fails with "file not found"
**Solution**: Verify file exists and path is correct, use forward slashes

**Issue**: Grep shows false positives (references in comments)
**Solution**: Manually review each reference, ignore comments/docs

**Issue**: Agent activation fails after cleanup
**Solution**: Check which utility is missing, restore from archive, investigate

**Issue**: Validation script errors
**Solution**: Rollback, identify which archived utility was needed, update audit classification
