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
task: runWorkflow()
responsavel: Orion (Commander)
responsavel_type: Agente
atomic_layer: Config

**Entrada:**
- campo: workflow_name
  tipo: string
  origem: User Input
  obrigatório: true
  validação: Must match an existing workflow YAML file

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

- campo: action
  tipo: string
  origem: User Input
  obrigatório: false
  validação: Must be "start", "continue", "status", "skip", or "abort". Default: "continue"

- campo: mode
  tipo: string
  origem: User Input
  obrigatório: false
  validação: Must be "guided" or "engine". Default: "guided"

**Saída:**
- campo: workflow_state
  tipo: object
  destino: File system (.aiox/{instance-id}-state.yaml)
  persistido: true

- campo: next_steps
  tipo: array
  destino: Output
  persistido: false

- campo: handoff_prompt
  tipo: string
  destino: Output
  persistido: false
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] workflow_name must resolve to an existing YAML file
    tipo: pre-condition
    blocker: true
    validação: |
      Check workflow file exists at resolved path
    error_message: "Pre-condition failed: Workflow '{workflow_name}' not found"
  - [ ] For action=continue/status/skip/abort, an active state file must exist
    tipo: pre-condition
    blocker: true
    validação: |
      Check .aiox/{instance-id}-state.yaml exists with status=active
    error_message: "Pre-condition failed: No active workflow instance found"
  - [ ] When target_context="squad" or "hybrid", squad directory must exist
    tipo: pre-condition
    blocker: true
    validação: |
      If target_context is "squad" or "hybrid", verify squads/{squad_name}/ exists
    error_message: "Pre-condition failed: Squad '{squad_name}' not found"
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] State file created/updated and next steps displayed
    tipo: post-condition
    blocker: true
    validação: |
      Verify state file exists and output was generated
    error_message: "Post-condition failed: State file not written or output missing"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] Action executed correctly; state persisted; next steps shown
    tipo: acceptance-criterion
    blocker: true
    validação: |
      Assert action was completed and state reflects the change
    error_message: "Acceptance criterion not met: Action execution failed"
```

---

## Tools

**External/shared resources used by this task:**

> **Note:** The tools below are conceptual patterns executed by the AI agent at runtime (file reads, YAML parsing, state management). They are NOT standalone JS scripts — the agent implements this logic inline using its native tools (Read, Write, Glob, etc.).

- **Tool:** workflow-state-manager
  - **Purpose:** Create, load, save, and query workflow state
  - **Implementation:** AI agent reads/writes `.aiox/{instance-id}-state.yaml` files directly

- **Tool:** workflow-validator
  - **Purpose:** Validate workflow YAML before starting
  - **Implementation:** AI agent validates structure, sequence, and references inline

- **Tool:** file-system
  - **Purpose:** YAML file reading and state persistence
  - **Implementation:** Native Read/Write/Glob tools

---

## Error Handling

**Strategy:** abort

**Common Errors:**

1. **Error:** Workflow Not Found
   - **Cause:** Specified workflow_name doesn't resolve to a YAML file
   - **Resolution:** Check name and target context
   - **Recovery:** List available workflows

2. **Error:** No Active Instance
   - **Cause:** Trying to continue/status/skip/abort without an active state
   - **Resolution:** Start the workflow first with action=start
   - **Recovery:** Show available state files

3. **Error:** Step Not Optional
   - **Cause:** Trying to skip a non-optional step
   - **Resolution:** Complete the step or abort the workflow
   - **Recovery:** Show which steps are optional

---

## Performance

**Expected Metrics:**

```yaml
duration_expected: 1-3 min (estimated)
cost_estimated: $0.001-0.005
token_usage: ~500-1,500 tokens
```

---

## Metadata

```yaml
story: N/A
version: 1.0.0
dependencies:
  - run-workflow-engine.md
tags:
  - workflow
  - execution
  - automation
  - state-management
updated_at: 2026-01-31
```

---

# Run Workflow Task

## Purpose

To provide guided workflow automation with file-based state persistence. Tracks workflow progress across sessions, suggests next concrete actions, and maintains continuity. NOT a full execution engine — a "guided automation" approach where the human remains the orchestrator.

## Prerequisites

- Target workflow YAML must exist at the resolved path
- For engine mode: `run-workflow-engine.md` task must exist at `.aiox-core/development/tasks/run-workflow-engine.md`
- State directory `.aiox/` must be writable

## Elicitation Points

The following inputs are collected before execution:

1. **workflow_name** — Which workflow to run (required)
2. **target_context** — Where to look for the workflow: `core`, `squad`, or `hybrid` (default: `core`)
3. **squad_name** — Required when target_context is `squad` or `hybrid`
4. **action** — What to do: `start`, `continue`, `status`, `skip`, `abort` (default: `continue`)
5. **mode** — Execution mode: `guided` (persona-switch) or `engine` (real subagent spawning) (default: `guided`)

## Task Execution

### Mode Dispatch

**BEFORE processing any action**, check the `mode` parameter:

```
IF mode == "engine":
  Delegate ENTIRELY to run-workflow-engine.md task.
  Pass all parameters: workflow_name, target_context, squad_name, action.
  The engine task handles everything from here — do NOT continue below.
  STOP.

ELSE (mode == "guided" or not specified):
  Continue with existing guided automation logic below.
```

---


### Action: `start`

Initialize a new workflow execution.

1. **Resolve workflow file path** based on target_context:
   - `core` → `.aiox-core/development/workflows/{workflow_name}.yaml`
   - `squad` → `squads/{squad_name}/workflows/{workflow_name}.yaml`
   - `hybrid` → `squads/{squad_name}/workflows/{workflow_name}.yaml`

2. **Validate workflow** using WorkflowValidator:
   - Must pass validation before starting
   - Display any warnings

3. **Create state file** using WorkflowStateManager.createState():
   - Generates unique instance ID
   - Builds step list from workflow sequence
   - Writes state to `.aiox/{instance-id}-state.yaml`

4. **Show step 1 instructions:**
   ```text
   === Workflow Started: {workflow_name} ===
   Instance: {instance_id}

   Step 1/{total}: {phase}
   Agent: @{agent}
   Action: {action description}
   Notes: {step notes}

   To execute this step:
   1. Activate agent: @{agent}
   2. {specific instructions based on action}

   When done, run: *run-workflow {workflow_name} continue
   ```

### Action: `continue` (default)

Resume from current step.

1. **Find active state file** for this workflow
2. **Load state** using WorkflowStateManager.loadState()
3. **Get current step** — if current step is still pending, show its instructions
4. **If current step was completed externally**, mark completed and advance:
   - Confirm with user: "Did you complete step {N}? (y/n)"
   - On yes: markStepCompleted() → advanceStep() → show next step
   - On no: re-display current step instructions

5. **Show next step instructions** with pre-populated agent/command:
   ```text
   Step {N}/{total}: {phase}
   Agent: @{agent}
   Action: {action}

   Suggested command: @{agent}
   Handoff: {handoff_prompt if available}

   When done, run: *run-workflow {workflow_name} continue
   ```

6. **Save updated state**

### Action: `status`

Show progress summary.

1. **Load state**
2. **Generate status report** using WorkflowStateManager.generateStatusReport():
   - Visual progress bar
   - Step checklist with icons
   - Artifact status
   - Decision log

### Action: `skip`

Skip current step (only if optional).

1. **Load state**
2. **Verify current step is optional** — error if not
3. **Mark step skipped** using WorkflowStateManager.markStepSkipped()
4. **Advance to next step** using WorkflowStateManager.advanceStep()
5. **Show next step instructions**
6. **Save updated state**

### Action: `abort`

Abort workflow execution.

1. **Load state**
2. **Set status to 'aborted'**
3. **Generate cleanup notes:**
   ```text
   === Workflow Aborted: {workflow_name} ===
   Instance: {instance_id}
   Progress: {completed}/{total} steps completed

   Artifacts created:
   - {list of created artifacts}

   State file preserved at: .aiox/{instance-id}-state.yaml
   (Delete manually if no longer needed)
   ```
4. **Save final state**

## Multi-Session Continuity

The state file persists between sessions. To continue a workflow:

1. User starts new Claude Code session
2. Activates @aiox-master
3. Runs `*run-workflow {name} continue`
4. System loads state, shows current step
5. User executes step (possibly in new agent session)
6. Returns and runs `continue` again

The `generateHandoffContext()` method produces markdown suitable for inclusion in session handoff documents.

## Output Format

All actions produce structured output with:
- Status header
- Progress indicator
- Current step details
- Suggested next commands
- Handoff prompt (when transitioning between agents)
