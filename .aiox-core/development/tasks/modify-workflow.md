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
task: modifyWorkflow()
responsável: Orion (Commander)
responsavel_type: Agente
atomic_layer: Config

**Entrada:**
- campo: target
  tipo: string
  origem: User Input
  obrigatório: true
  validação: Must exist in system

- campo: target_context
  tipo: string
  origem: User Input
  obrigatório: false
  validação: Must be "core", "squad", or "hybrid". Default: "core"

- campo: squad_name
  tipo: string
  origem: User Input
  obrigatório: false (required when target_context="squad" or "hybrid")
  validação: Must be kebab-case, squad must exist in squads/

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
  - [ ] When target_context="squad" or "hybrid", squad directory must exist at squads/{squad_name}/
    tipo: pre-condition
    blocker: true
    validação: |
      If target_context is "squad" or "hybrid", verify squads/{squad_name}/ exists and has a valid squad.yaml
    error_message: "Pre-condition failed: Squad '{squad_name}' not found in squads/"
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

# Modify Workflow Task

## Purpose

To safely modify existing workflow definitions while maintaining their orchestration logic, preserving phase transitions, and ensuring all agent interactions remain valid. This task enables workflow evolution through intelligent modifications with comprehensive validation.

## Prerequisites

- Target workflow must exist (path resolved from target_context):
  - `core` → `.aiox-core/development/workflows/`
  - `squad` → `squads/{squad_name}/workflows/`
  - `hybrid` → `squads/{squad_name}/workflows/`
- User must provide modification intent or specific changes
- Understanding of workflow phases and agent orchestration
- Backup system must be available for rollback

## Task Execution

### 1. Workflow Analysis and Backup

- Resolve workflow path based on target_context:
  - `core` → `.aiox-core/development/workflows/{workflow-name}.yaml`
  - `squad` → `squads/{squad_name}/workflows/{workflow-name}.yaml`
  - `hybrid` → `squads/{squad_name}/workflows/{workflow-name}.yaml`
- Load target workflow from resolved path
- Create timestamped backup in same context:
  - `core` → `.aiox-core/development/workflows/.backups/{workflow-name}.yaml.{timestamp}`
  - `squad` → `squads/{squad_name}/workflows/.backups/{workflow-name}.yaml.{timestamp}`
  - `hybrid` → `squads/{squad_name}/workflows/.backups/{workflow-name}.yaml.{timestamp}`
- Parse and analyze workflow structure:
  - Metadata (name, description, project type)
  - Phase definitions and sequences
  - Agent assignments per phase
  - Artifact definitions
  - Entry/exit criteria
  - Mermaid diagrams (if present)

### 2. Dependency and Impact Analysis

Analyze workflow connections:
- Which agents are orchestrated by this workflow
- What artifacts are produced/consumed
- Phase transition dependencies
- Integration with other workflows
- Project type compatibility

### 3. Modification Intent Processing

If user provides high-level intent (e.g., "add code review phase"):
- Analyze current phase flow
- Determine optimal insertion point
- Identify required agents for new phase
- Define artifacts for new phase
- Ensure phase transitions remain logical

If user provides specific changes:
- Validate YAML structure changes
- Ensure phase sequencing remains valid
- Check agent availability
- Verify artifact consistency
- Maintain entry/exit criteria logic

### 4. Phase Sequencing Validation

Ensure modifications maintain valid flow:
```yaml
phases:
  planning:
    sequence: 1
    agents: [analyst, pm]
    artifacts: [project-brief, prd]
    
  # New phase insertion
  architecture_review:  # NEW
    sequence: 1.5      # Inserted between planning and architecture
    agents: [architect, qa]
    artifacts: [architecture-review-doc]
    entry_criteria: ["PRD approved"]
    exit_criteria: ["Architecture review complete"]
    
  architecture:
    sequence: 2  # Adjusted from 2
    agents: [architect]
    artifacts: [architecture-doc]
```

### 5. Mermaid Diagram Update

If workflow contains visualization:
```mermaid
graph TD
    A[Planning] --> AR[Architecture Review]  %% NEW
    AR --> B[Architecture]
    B --> C[Development]
```

Update diagram to reflect new phases and transitions.

### 6. Generate Modification Diff

Create comprehensive diff:
```diff
@@ Workflow: {workflow-name} @@
--- Current Version
+++ Modified Version

@@ Metadata @@
  name: {workflow-name}
  description: {description}
+ last_modified: {timestamp}
+ modified_by: aiox-developer

@@ Phases @@
  planning:
    sequence: 1
    agents: [analyst, pm]
    
+ code_review:
+   sequence: 3.5
+   agents: [qa, senior-dev]
+   artifacts: [code-review-report]
+   entry_criteria:
+     - "Development phase complete"
+     - "All tests passing"
+   exit_criteria:
+     - "Code review approved"
+     - "No critical issues"

@@ Simple Sequence @@
- "planning → architecture → development → testing"
+ "planning → architecture → development → code_review → testing"
```

### 7. Validation Pipeline

Comprehensive validation checks:
- YAML syntax validation
- Phase sequence continuity (no gaps)
- Agent existence verification
- Artifact definition completeness
- Entry/exit criteria logic
- Circular dependency detection
- Mermaid diagram syntax (if present)

### 8. Workflow Simulation

Simulate the modified workflow:
```
Phase Flow Simulation:
1. Planning (analyst, pm) → project-brief, prd ✓
2. Architecture Review (architect, qa) → review-doc ✓
3. Architecture (architect) → architecture-doc ✓
4. Development (dev) → code, tests ✓
5. Code Review (qa) → review-report ✓
6. Testing (qa) → test-results ✓

All phase transitions valid ✓
All agents available ✓
No circular dependencies ✓
```

### 9. User Approval Flow

Present comprehensive report:
1. Summary of changes
2. Visual diff of YAML
3. Updated phase flow diagram
4. Impact analysis:
   - New phases added
   - Agent workload changes
   - Artifact additions
   - Timeline implications
5. Simulation results

Request explicit approval before applying changes.

### 10. Apply Modifications

Upon approval:
1. Write modified YAML to workflow file
2. Update Mermaid diagrams if present
3. Create git commit with descriptive message
4. Update workflow documentation
5. Notify orchestrator of changes
6. Log modification in history

### 11. Post-Modification Validation

Verify workflow functionality:
- Load modified workflow in orchestrator
- Validate all phases resolve correctly
- Check agent assignments are valid
- Ensure artifacts are properly defined
- Test phase transition logic

### 12. Rollback Capability

If issues detected:
1. Restore from timestamped backup
2. Revert git commit
3. Refresh orchestrator cache
4. Log rollback with reason

## Safety Measures

1. **Phase Continuity**: Never break phase sequences
2. **Agent Availability**: Verify all agents exist
3. **Artifact Consistency**: Maintain input/output flow
4. **Transition Logic**: Preserve entry/exit criteria
5. **Backward Compatibility**: Ensure existing projects can use modified workflow

## Output Format

```
=== Workflow Modification Report ===
Workflow: {workflow-name}
Timestamp: {ISO-8601 timestamp}
Backup: {backup-file-path}

Structure Analysis:
- Current phases: {phase-count}
- Current agents: {agent-list}
- Current artifacts: {artifact-count}

Changes Applied:
✓ Added phase: {phase-name} at position {sequence}
✓ Modified {n} phase sequences
✓ Added {n} new artifacts
✓ Updated {n} agent assignments
✓ Enhanced phase transitions

Validation Results:
✓ YAML syntax valid
✓ Phase sequence continuous
✓ All agents exist
✓ Artifacts properly defined
✓ No circular dependencies
✓ Mermaid diagram updated
✓ Git commit created: {commit-hash}

Simulation Results:
✓ All phases executable
✓ Agent assignments valid
✓ Artifact flow consistent
✓ Transitions logical

Impact Summary:
- Estimated timeline change: +{n} days
- New agent workload: {agent}: +{n} phases
- New artifacts produced: {artifact-list}

Workflow ready for use with enhanced orchestration.
```

## Error Handling

- Workflow not found → Verify name and path
- Invalid YAML → Show syntax error with line
- Phase sequence gaps → Highlight missing sequences
- Missing agents → List unavailable agents
- Circular dependencies → Show dependency cycle
- Mermaid errors → Provide diagram syntax fix

## Integration Points

- Uses `yaml-validator.js` for syntax checking
- Integrates with `git-wrapper.js` for version control
- Coordinates with orchestrator for validation
- Leverages `dependency-analyzer.js` for impact analysis 