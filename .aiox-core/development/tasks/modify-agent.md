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
task: modifyAgent()
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

# Modify Agent Task

## Purpose

To safely modify existing agent definitions while preserving their structure, maintaining compatibility, and providing rollback capabilities. This task enables the meta-agent to evolve agent capabilities through targeted modifications with comprehensive validation.

## Prerequisites

- Target agent must exist in `aiox-core/agents/`
- User must provide modification intent or specific changes
- Backup system must be available for rollback
- Git must be initialized for version tracking

## Task Execution

### 1. Agent Analysis and Backup

- Load target agent from `aiox-core/agents/{agent-name}.md`
- Parse YAML header and markdown content separately
- Create timestamped backup: `aiox-core/agents/.backups/{agent-name}.md.{timestamp}`
- Extract current structure:
  - Agent metadata (name, id, title, icon, whenToUse)
  - Dependencies (tasks, templates, checklists, data)
  - Commands and their descriptions
  - Persona configuration
  - Customization rules

### 2. Modification Intent Processing

If user provides high-level intent (e.g., "add memory integration capability"):
- Analyze current agent capabilities
- Determine required changes:
  - New dependencies to add
  - Commands to introduce
  - Persona adjustments needed
  - Documentation updates

If user provides specific changes:
- Validate change format and targets
- Check for conflicts with existing structure
- Ensure changes maintain agent consistency

### 3. Dependency Resolution

For new dependencies being added:
- Verify files exist in respective directories
- Check for circular dependencies
- Validate dependency compatibility
- Add dependencies in correct sections:
  - tasks → `dependencies.tasks`
  - templates → `dependencies.templates`
  - checklists → `dependencies.checklists`
  - data → `dependencies.data`
  - tools → `dependencies.tools`

### 4. Generate Modification Diff

Create a visual diff showing:
```diff
@@ Agent: {agent-name} @@
--- Current Version
+++ Modified Version

@@ Dependencies @@
  tasks:
    - existing-task.md
+   - new-capability-task.md
    
@@ Commands @@
  - help: Show available commands
+ - new-command: Description of new capability

@@ Persona @@
  role: Current role description
- focus: Old focus area
+ focus: Updated focus area with new capabilities
```

### 5. Validation Pipeline

Run comprehensive validation checks:
- YAML syntax validation
- Markdown structure integrity
- Dependency existence verification
- Command format validation
- No breaking changes to existing commands
- Customization rules compatibility

### 6. User Approval Flow

Present to user:
1. Summary of changes
2. Visual diff
3. Impact analysis:
   - New capabilities added
   - Potential conflicts
   - Dependencies introduced
4. Rollback instructions

Request explicit approval before applying changes.

### 7. Apply Modifications

Upon approval:
1. Write modified content to agent file
2. Update component metadata registry
3. Create git commit with descriptive message
4. Log modification in history
5. Update any dependent components

### 8. Post-Modification Validation

- Test agent loading
- Verify all dependencies resolve
- Check command accessibility
- Validate persona consistency
- Run basic agent interaction test

### 9. Rollback Capability

If issues detected or user requests rollback:
1. Restore from timestamped backup
2. Revert git commit
3. Update metadata registry
4. Log rollback action

## Safety Measures

1. **Backup Before Modify**: Always create backup before changes
2. **Validation First**: Never apply unvalidated modifications
3. **User Approval**: Require explicit approval for all changes
4. **Atomic Operations**: All-or-nothing modification approach
5. **Git Integration**: Every change tracked in version control

## Output Format

```
=== Agent Modification Report ===
Agent: {agent-name}
Timestamp: {ISO-8601 timestamp}
Backup: {backup-file-path}

Changes Applied:
✓ Added {n} new dependencies
✓ Modified {n} commands
✓ Updated persona configuration
✓ Enhanced capabilities for {feature}

Validation Results:
✓ YAML syntax valid
✓ All dependencies exist
✓ No breaking changes
✓ Git commit created: {commit-hash}

New Capabilities:
- {capability-1}
- {capability-2}

Agent ready for use with enhanced capabilities.
```

## Error Handling

- File not found → Check agent name and path
- Invalid YAML → Show syntax error location
- Missing dependencies → List unavailable files
- Git errors → Provide manual recovery steps
- Validation failures → Show specific issues

## Integration Points

- Uses `component-metadata.js` for registry updates
- Integrates with `git-wrapper.js` for version control
- Leverages `yaml-validator.js` for syntax checking
- Coordinates with `rollback-handler.js` for recovery 