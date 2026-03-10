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

## Step 0: IDS Registry Check (Advisory)

Before proceeding, check the Entity Registry for existing artifacts:

1. Extract intent keywords from user's request
2. Run `FrameworkGovernor.preCheck(intent, 'workflow')`
3. If REUSE match found (>=90% relevance):
   - Display match and ask user: "Existing workflow found. REUSE instead of creating new?"
4. If ADAPT match found (60-89%):
   - Display adaptation candidate: "Similar workflow exists. ADAPT instead of creating new?"
5. If CREATE (no match or user chooses):
   - Log decision with justification and proceed to Step 1
6. If IDS unavailable (timeout/error): Warn and proceed normally

**NOTE:** This step is advisory and does NOT block creation. User always has final decision.

---

## Task Definition (AIOX Task Format V1.0)

```yaml
task: createWorkflow()
responsável: Orion (Commander)
responsavel_type: Agente
atomic_layer: Config

**Entrada:**
- campo: name
  tipo: string
  origem: User Input
  obrigatório: true
  validação: Must be non-empty, lowercase, kebab-case

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

- campo: options
  tipo: object
  origem: User Input
  obrigatório: false
  validação: Valid JSON object with allowed keys

- campo: force
  tipo: boolean
  origem: User Input
  obrigatório: false
  validação: Default: false

**Saída:**
- campo: created_file
  tipo: string
  destino: File system
  persistido: true

- campo: validation_report
  tipo: object
  destino: Memory
  persistido: false

- campo: success
  tipo: boolean
  destino: Return value
  persistido: false
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Target does not already exist; required inputs provided; permissions granted
    tipo: pre-condition
    blocker: true
    validação: |
      Check target does not already exist; required inputs provided; permissions granted
    error_message: "Pre-condition failed: Target does not already exist; required inputs provided; permissions granted"
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
  - [ ] Resource created successfully; validation passed; no errors logged
    tipo: post-condition
    blocker: true
    validação: |
      Verify resource created successfully; validation passed; no errors logged
    error_message: "Post-condition failed: Resource created successfully; validation passed; no errors logged"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] Resource exists and is valid; no duplicate resources created
    tipo: acceptance-criterion
    blocker: true
    validação: |
      Assert resource exists and is valid; no duplicate resources created
    error_message: "Acceptance criterion not met: Resource exists and is valid; no duplicate resources created"
```

---

## Tools

**External/shared resources used by this task:**

- **Tool:** component-generator
  - **Purpose:** Generate new components from templates
  - **Source:** .aiox-core/scripts/component-generator.js

- **Tool:** file-system
  - **Purpose:** File creation and validation
  - **Source:** Node.js fs module

---

## Scripts

**Agent-specific code for this task:**

- **Script:** create-component.js
  - **Purpose:** Component creation workflow
  - **Language:** JavaScript
  - **Location:** .aiox-core/scripts/create-component.js

---

## Error Handling

**Strategy:** abort

**Common Errors:**

1. **Error:** Resource Already Exists
   - **Cause:** Target file/resource already exists in system
   - **Resolution:** Use force flag or choose different name
   - **Recovery:** Prompt user for alternative name or force overwrite

2. **Error:** Invalid Input
   - **Cause:** Input name contains invalid characters or format
   - **Resolution:** Validate input against naming rules (kebab-case, lowercase, no special chars)
   - **Recovery:** Sanitize input or reject with clear error message

3. **Error:** Permission Denied
   - **Cause:** Insufficient permissions to create resource
   - **Resolution:** Check file system permissions, run with elevated privileges if needed
   - **Recovery:** Log error, notify user, suggest permission fix

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
  - creation
  - setup
updated_at: 2025-11-17
```

---

tools:
  - github-cli
# TODO: Create workflow-validation-checklist.md for validation (follow-up story needed)
# checklists:
#   - workflow-validation-checklist.md
---

# Create Workflow

## Purpose
To create a new workflow definition that orchestrates multiple agents and tasks for complex multi-step processes in Synkra AIOX.

## Prerequisites
- User authorization verified
- Clear understanding of workflow goals
- Knowledge of participating agents and tasks
- Memory layer client initialized

## Interactive Elicitation Process

### Step 0: Target Context
```
ELICIT: Target Context
1. Where should this workflow be created? (core / squad / hybrid)
2. If squad or hybrid: Which squad? (kebab-case name, e.g., "pedro-valerio")
```

### Step 1: Workflow Overview
```
ELICIT: Workflow Basic Information
1. What is the workflow name? (e.g., "feature-development", "bug-fix")
2. What is the primary goal of this workflow?
3. What type of project is this for? (greenfield/brownfield, UI/service/fullstack)
4. What is the expected outcome?
```

### Step 2: Workflow Sequence Design
```text
ELICIT: Workflow Sequence and Flow
1. What are the main execution steps/phases? (e.g., "planning", "implementation", "testing")
2. What is the exact step order (`workflow.sequence`)?
3. Are there any parallel activities?
4. Are there decision points or conditional flows?
5. What are the exit criteria for each step?
```

### Step 3: Agent Orchestration
```text
ELICIT: Agent Participation
For each workflow step:
1. Which agent(s) are involved?
2. What are their specific responsibilities?
3. How do agents hand off work between steps?
4. Are there any approval requirements?
```

### Step 4: Resource Requirements
```
ELICIT: Resources and Dependencies
1. What templates are needed?
2. What data files are required?
3. Are there external dependencies?
4. What are the input requirements?
5. What outputs are produced?
```

## Implementation Steps

1. **Validate Workflow Design**
   - Check for circular dependencies
   - Validate agent availability
   - Ensure logical flow progression
   - Verify all resources exist

2. **Generate Workflow Structure**
   ```yaml
   workflow:
     id: {workflow-name}
     name: {Workflow Display Name}
     version: {semver}
     description: {Purpose and overview}
     type: {greenfield|brownfield}
     scope: {ui|service|fullstack}
 
     # Optional compatibility metadata (non-executable)
     phases:
       - phase_1: {phase label}
       - phase_2: {phase label}
 
     # Canonical executable contract
     sequence:
       - step: {step-slug}
         id: {step-id}
         phase: {1..N}
         phase_name: {Phase Display Name}
         agent: {agent-id}
         task: {task-name}
         action: {what happens}
         requires: {previous-step-id}
         outputs:
           - {artifact-name}
         next: {next-step-id}
         on_failure: {fallback-step-id}

       - workflow_end:
           id: complete
           action: workflow_complete

     handoff_prompts:
       {from}_to_{to}: {handoff guidance}
   ```

3. **Add Security Controls**
   - Step authorization requirements
   - Data access restrictions
   - Audit logging points
   - Approval workflows

4. **Create Workflow File**
   - Resolve output path based on target_context:
     - `core` → `.aiox-core/development/workflows/{workflow-name}.yaml`
     - `squad` → `squads/{squad_name}/workflows/{workflow-name}.yaml`
     - `hybrid` → `squads/{squad_name}/workflows/{workflow-name}.yaml`
   - Write structured YAML definition
   - Include comprehensive documentation

4.5. **Update Squad Manifest** (when target_context="squad" or "hybrid")
   - Load `squads/{squad_name}/squad.yaml`
   - Initialize `components.workflows` array if it does not exist
   - Add workflow filename to `components.workflows[]` (skip if already present)
   - Create backup of `squad.yaml` before saving
   - Save updated manifest

5. **Update Memory Layer**
   ```javascript
   await memoryClient.addMemory({
     type: 'workflow_created',
     name: workflowName,
     path: workflowPath,
     creator: currentUser,
     timestamp: new Date().toISOString(),
     metadata: {
       type: workflowType,
       sequence_steps: stepList,
       agents: involvedAgents
     }
   });
   ```

6. **Generate Documentation**
   - Create workflow diagram (text-based)
   - Document each step's purpose
   - List all handoff points
   - Include troubleshooting guide

## Validation Checklist
- [ ] Workflow name is unique and valid
- [ ] All sequence steps have clear purposes
- [ ] Agent assignments are valid
- [ ] No circular dependencies
- [ ] All resources exist
- [ ] Transitions are logical
- [ ] Security controls defined
- [ ] Memory layer updated

## Error Handling
- If workflow exists: Offer versioning or update
- If agents missing: List required agents
- If circular dependency: Show cycle and suggest fix
- If resources missing: List and offer to create

## Success Output
```
✅ Workflow '{workflow-name}' created successfully!
📁 Location: {resolved-path}
   (core → .aiox-core/development/workflows/{workflow-name}.yaml)
   (squad → squads/{squad_name}/workflows/{workflow-name}.yaml)
   (hybrid → squads/{squad_name}/workflows/{workflow-name}.yaml)
📊 Workflow Summary:
   - Context: {target_context} {squad_name if applicable}
   - Steps: {step-count}
   - Agents: {agent-list}
   - Type: {workflow-type}
🚀 To use: Select workflow when starting new project
```

## Workflow Execution Notes
- Workflows are selected during project initialization
- Each step execution is logged in memory
- Progress tracking available through memory queries
- Agents automatically receive step-specific context
