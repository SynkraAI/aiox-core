---
# No checklists needed - rollback operation with built-in transaction validation
---

# Task: Undo Last Component Operation

**Task ID:** undo-last  
**Agent:** aiox-developer  
**Version:** 1.0

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
task: undoLast()
responsável: Dex (Builder)
responsavel_type: Agente
atomic_layer: Atom

**Entrada:**
- campo: target
  tipo: string
  origem: User Input
  obrigatório: true
  validação: Must exist

- campo: version
  tipo: string
  origem: User Input
  obrigatório: false
  validação: Target version or timestamp

**Saída:**
- campo: restored_state
  tipo: object
  destino: File system
  persistido: true

- campo: rollback_log
  tipo: array
  destino: File (.ai/rollback/*)
  persistido: true
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Backup exists; rollback target valid
    tipo: pre-condition
    blocker: true
    validação: |
      Check backup exists; rollback target valid
    error_message: "Pre-condition failed: Backup exists; rollback target valid"
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] State restored; integrity verified; no data loss
    tipo: post-condition
    blocker: true
    validação: |
      Verify state restored; integrity verified; no data loss
    error_message: "Post-condition failed: State restored; integrity verified; no data loss"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] Original state restored; no residual changes
    tipo: acceptance-criterion
    blocker: true
    validação: |
      Assert original state restored; no residual changes
    error_message: "Acceptance criterion not met: Original state restored; no residual changes"
```

---

## Tools

**External/shared resources used by this task:**

- **Tool:** backup-manager
  - **Purpose:** Backup and restore operations
  - **Source:** .aiox-core/utils/backup-manager.js

- **Tool:** version-control
  - **Purpose:** Git operations for rollback
  - **Source:** npm: simple-git

---

## Scripts

**Agent-specific code for this task:**

- **Script:** rollback-changes.js
  - **Purpose:** Rollback to previous state
  - **Language:** JavaScript
  - **Location:** .aiox-core/scripts/rollback-changes.js

---

## Error Handling

**Strategy:** retry

**Common Errors:**

1. **Error:** Backup Not Found
   - **Cause:** No backup exists for target version
   - **Resolution:** Verify backup location and version
   - **Recovery:** List available backups, abort if none

2. **Error:** Rollback Failed
   - **Cause:** Error restoring previous state
   - **Resolution:** Check backup integrity and permissions
   - **Recovery:** Preserve current state, log failure

---

## Performance

**Expected Metrics:**

```yaml
duration_expected: 0.5-2 min (estimated)
cost_estimated: $0.0001-0.0005
token_usage: ~500-1,000 tokens
```

**Optimization Notes:**
- Minimize external dependencies; cache results if reusable; validate inputs early

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


## Description

Rollback the last component creation or modification operation. This task allows undoing recent changes made by the aiox-developer agent, including single component creation, batch creation, or component updates.

## Context Required
- Access to transaction history
- File system permissions for affected files
- Manifest write permissions

## Prerequisites
- Transaction logging enabled
- Backup files available
- No conflicting operations since last transaction

## Input Requirements
- Optional: Transaction ID to rollback (defaults to last transaction)
- Optional: Selective rollback options

## Process Flow

### Step 1: Identify Transaction
Locate the most recent transaction or use provided transaction ID.

**Actions:**
- Query transaction history
- Display transaction details
- Confirm rollback intent

**Validation:**
- Transaction exists and is rollbackable
- User confirms the operation

### Step 2: Analyze Changes
Review all changes made in the transaction.

**Actions:**
- List all file operations
- Show manifest changes
- Display component metadata updates

**Output Format:**
```
Transaction: txn-1234567890-abcd
Type: component_creation
Date: 2025-01-31T10:30:00Z
Operations:
  - Created: /aiox-core/agents/data-analyst.md
  - Updated: /aiox-core/team-manifest.yaml
  - Created: /aiox-core/tasks/analyze-data.md
```

### Step 3: Execute Rollback
Perform the rollback operation with proper error handling.

**Actions:**
- Restore file backups
- Revert manifest changes
- Update component metadata
- Clean up orphaned files

**Error Handling:**
- Handle missing backup files
- Manage partial rollback scenarios
- Report rollback failures

### Step 4: Verify Rollback
Ensure all changes have been properly reverted.

**Actions:**
- Verify file states
- Check manifest integrity
- Validate component consistency

**Success Criteria:**
- All files restored to previous state
- Manifest accurately reflects changes
- No orphaned references remain

## Output

### Success Response
```
✅ Rollback completed successfully!

Transaction: txn-1234567890-abcd
Rolled back:
  - ✓ Removed: data-analyst.md
  - ✓ Restored: team-manifest.yaml
  - ✓ Removed: analyze-data.md
  
Total operations: 3
Successful: 3
Failed: 0
```

### Failure Response
```
❌ Rollback partially failed

Transaction: txn-1234567890-abcd
Results:
  - ✓ Removed: data-analyst.md
  - ✗ Failed to restore: team-manifest.yaml (backup not found)
  - ✓ Removed: analyze-data.md

Please manually review and fix failed operations.
```

## Error Handling

### Common Errors
1. **Transaction Not Found**
   - Display available transactions
   - Suggest checking transaction ID

2. **Backup Files Missing**
   - Warn about incomplete rollback
   - Provide manual recovery steps

3. **Concurrent Modifications**
   - Detect file changes since transaction
   - Prompt for force rollback option

## Security Considerations
- Verify user has permission to rollback
- Prevent rollback of system transactions
- Maintain audit trail of rollback operations
- Validate file paths to prevent traversal

## Performance Notes
- Load only necessary transaction data
- Stream large backup files
- Batch file operations for efficiency

## Dependencies
- TransactionManager utility
- File system access
- Backup storage system

## Notes
- Rollback is only available for recent transactions (within retention period)
- Some operations may not be fully reversible
- Always creates a new transaction for the rollback itself
- Supports selective rollback for batch operations

## Related Tasks
- create-agent
- create-task
- create-workflow
- create-suite
- update-manifest 