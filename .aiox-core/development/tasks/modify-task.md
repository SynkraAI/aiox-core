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

## Step 0: IDS Impact Analysis (Advisory)

Before proceeding, check the Entity Registry for impact of this modification:

1. Identify the entity being modified
2. Run `FrameworkGovernor.impactAnalysis(entityId)`
3. Display direct consumers, indirect consumers, and risk level
4. Show adaptability score and 30% threshold warning if applicable
5. If HIGH/CRITICAL risk:
   - Warn user: "This modification affects N consumers. Proceed with caution."
6. If IDS unavailable (timeout/error): Warn and proceed normally

**NOTE:** This step is advisory and does NOT block modification. User always has final decision.

---

## Task Definition (AIOX Task Format V1.0)

```yaml
task: modifyTask()
responsável: Orion (Commander)
responsavel_type: Agente
atomic_layer: Config

**Entrada:**
- campo: target
  tipo: string
  origem: User Input
  obrigatório: true
  validação: Must exist in system

- campo: changes
  tipo: object
  origem: User Input
  obrigatório: true
  validação: Valid modification object

- campo: backup
  tipo: boolean
  origem: User Input
  obrigatório: false
  validação: Default: true

**Saída:**
- campo: modified_file
  tipo: string
  destino: File system
  persistido: true

- campo: backup_path
  tipo: string
  destino: File system
  persistido: true

- campo: changes_applied
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
  - [ ] Target exists; backup created; valid modification parameters
    tipo: pre-condition
    blocker: true
    validação: |
      Check target exists; backup created; valid modification parameters
    error_message: "Pre-condition failed: Target exists; backup created; valid modification parameters"
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] Modification applied; backup preserved; integrity verified
    tipo: post-condition
    blocker: true
    validação: |
      Verify modification applied; backup preserved; integrity verified
    error_message: "Post-condition failed: Modification applied; backup preserved; integrity verified"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] Changes applied correctly; original backed up; rollback possible
    tipo: acceptance-criterion
    blocker: true
    validação: |
      Assert changes applied correctly; original backed up; rollback possible
    error_message: "Acceptance criterion not met: Changes applied correctly; original backed up; rollback possible"
```

---

## Tools

**External/shared resources used by this task:**

- **Tool:** file-system
  - **Purpose:** File reading, modification, and backup
  - **Source:** Node.js fs module

- **Tool:** ast-parser
  - **Purpose:** Parse and modify code safely
  - **Source:** .aiox-core/utils/ast-parser.js

---

## Scripts

**Agent-specific code for this task:**

- **Script:** modify-file.js
  - **Purpose:** Safe file modification with backup
  - **Language:** JavaScript
  - **Location:** .aiox-core/scripts/modify-file.js

---

## Error Handling

**Strategy:** abort

**Common Errors:**

1. **Error:** Target Not Found
   - **Cause:** Specified resource does not exist
   - **Resolution:** Verify target exists before modification
   - **Recovery:** Suggest similar resources or create new

2. **Error:** Backup Failed
   - **Cause:** Unable to create backup before modification
   - **Resolution:** Check disk space and permissions
   - **Recovery:** Abort modification, preserve original state

3. **Error:** Concurrent Modification
   - **Cause:** Resource modified by another process
   - **Resolution:** Implement file locking or retry logic
   - **Recovery:** Retry with exponential backoff or merge changes

---

## Performance

**Expected Metrics:**

```yaml
duration_expected: 2-10 min (estimated)
cost_estimated: $0.001-0.008
token_usage: ~800-2,500 tokens
```

**Optimization Notes:**
- Validate configuration early; use atomic writes; implement rollback checkpoints

---

## Metadata

```yaml
story: N/A
version: 1.0.0
dependencies:
  - N/A
tags:
  - modification
  - update
updated_at: 2025-11-17
```

---

checklists:
  - change-checklist.md
---

# Modify Task Task

## Purpose

To safely modify existing task definitions while maintaining their effectiveness, preserving elicitation flows, and ensuring backward compatibility. This task enables evolution of task capabilities through intelligent modifications with comprehensive validation.

## Prerequisites

- Target task must exist in `aiox-core/tasks/`
- User must provide modification intent or specific changes
- Backup system must be available for rollback
- Understanding of task dependencies and usage

## Task Execution

### 1. Task Analysis and Backup

- Load target task from `aiox-core/tasks/{task-name}.md`
- Create timestamped backup: `aiox-core/tasks/.backups/{task-name}.md.{timestamp}`
- Analyze task structure:
  - Purpose and prerequisites
  - Task execution steps
  - Elicitation requirements (if any)
  - Integration points
  - Output format specifications

### 2. Usage Impact Analysis

Before modifying, analyze where task is used:
- Search all agents for task dependencies
- Check workflows that reference the task
- Identify any tasks that chain into this task
- Document all usage points for impact assessment

### 3. Modification Intent Processing

If user provides high-level intent (e.g., "add validation step"):
- Analyze current task flow
- Determine optimal insertion points
- Ensure modifications maintain task coherence
- Preserve existing functionality

If user provides specific changes:
- Validate changes don't break task flow
- Ensure elicitation blocks remain valid
- Check output format compatibility
- Verify integration points remain functional

### 4. Elicitation Flow Preservation

For tasks with `elicit: true`:
- Maintain `[[LLM:` instruction blocks
- Preserve user interaction points
- Ensure prompts remain clear and actionable
- Validate response processing logic

### 5. Generate Modification Diff

Create a visual diff showing:
```diff
@@ Task: {task-name} @@
--- Current Version
+++ Modified Version

@@ Purpose @@
- Old purpose description
+ Enhanced purpose with new capabilities

@@ Task Execution @@
  ### Step 1: Initial Setup
  - Existing step content
+ - New validation substep
  
  ### Step 2: Processing
  [Content remains unchanged]
  
+ ### Step 3: New Validation Step
+ - Validate inputs against schema
+ - Check for security concerns
+ - Ensure data integrity

@@ Output Format @@
  {
    "status": "success",
    "data": {...},
+   "validation": {
+     "passed": true,
+     "checks": [...]
+   }
  }
```

### 6. Validation Pipeline

Run comprehensive validation:
- Markdown syntax validation
- Task flow logical consistency
- Elicitation block format checking
- Output format JSON/YAML validation
- Integration point compatibility
- No breaking changes to task interface

### 7. Backward Compatibility Check

Ensure modifications maintain compatibility:
- Existing inputs still accepted
- Output format additions are optional
- Task can be called with old parameters
- Graceful handling of legacy usage

### 8. User Approval Flow

Present to user:
1. Summary of changes
2. Visual diff
3. Impact analysis:
   - Affected agents and workflows
   - New capabilities added
   - Compatibility notes
4. Migration guide for existing usage

Request explicit approval before applying changes.

### 9. Apply Modifications

Upon approval:
1. Write modified content to task file
2. Update task metadata if needed
3. Create git commit with descriptive message
4. Update dependent component documentation
5. Log modification in history

### 10. Post-Modification Testing

Create test scenarios:
```javascript
// Test basic functionality
const result = await executeTask('modified-task', originalParams);
assert(result.status === 'success');

// Test new functionality
const enhancedResult = await executeTask('modified-task', newParams);
assert(enhancedResult.validation.passed === true);

// Test backward compatibility
const legacyResult = await executeTask('modified-task', legacyParams);
assert(isCompatibleOutput(legacyResult));
```

### 11. Rollback Capability

If issues detected:
1. Restore from timestamped backup
2. Revert git commit
3. Notify affected components
4. Log rollback with reason

## Safety Measures

1. **Usage Analysis First**: Always check task usage before modifying
2. **Preserve Core Flow**: Never break existing task logic
3. **Elicitation Integrity**: Maintain interactive elements
4. **Test Coverage**: Ensure modifications are testable
5. **Documentation Sync**: Update task docs with changes

## Output Format

```
=== Task Modification Report ===
Task: {task-name}
Timestamp: {ISO-8601 timestamp}
Backup: {backup-file-path}

Usage Analysis:
- Used by {n} agents: {agent-list}
- Referenced in {n} workflows: {workflow-list}
- Chain dependencies: {dependency-list}

Changes Applied:
✓ Enhanced {section} with {feature}
✓ Added {n} new steps
✓ Updated output format
✓ Maintained backward compatibility

Validation Results:
✓ Task flow validated
✓ Elicitation blocks intact
✓ Output format valid
✓ No breaking changes
✓ Git commit created: {commit-hash}

Testing Results:
✓ Original functionality preserved
✓ New features operational
✓ Backward compatibility confirmed

Migration Notes:
- Existing usage remains functional
- New parameters available: {param-list}
- Enhanced output includes: {new-fields}

Task ready for use with enhanced capabilities.
```

## Error Handling

- Task not found → Verify task name and path
- Flow disruption → Show specific step conflicts
- Elicitation errors → Highlight format issues
- Compatibility breaks → Provide migration path
- Test failures → Show failing scenarios

## Integration Points

- Coordinates with agent modification tasks
- Uses `git-wrapper.js` for version control
- Leverages `dependency-analyzer.js` for usage
- Integrates with test frameworks for validation 