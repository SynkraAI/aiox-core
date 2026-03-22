# Workflow Creation Guide — Schema & Checklist

## Naming

| Rule | Pattern | Example |
|------|---------|---------|
| File name | `{workflow-name}.yaml` | `story-development-cycle.yaml` |
| Workflow ID | `{workflow-name}` (kebab-case) | `story-development-cycle` |
| Step/Phase IDs | `{descriptive}` (kebab-case) | `create-story`, `qa-gate` |

## Where to Save

| Type | Path |
|------|------|
| **Core** | `.aiox-core/development/workflows/{name}.yaml` |
| **Squad** | `squads/{squad}/workflows/{name}.yaml` |

## Complete YAML Schema

```yaml
# ============================================
# {Workflow Name}
# {Purpose description}
#
# Orchestrator: @{agent}
# @version {X.Y.Z}
# ============================================

workflow:
  id: "{workflow-id}"                        # kebab-case, unique (REQUIRED)
  name: "{Human Readable Name}"              # REQUIRED
  version: "1.0.0"                           # SemVer (REQUIRED)
  description: >-                            # REQUIRED
    Multi-line description of purpose.
  orchestrator: "@{agent-name}"              # REQUIRED

  # ─── TRIGGERS ───

  triggers:
    - type: command
      description: "*{command-name}"
    - type: manual
      description: "Manual execution"

  # ─── CONFIGURATION ───

  config:
    use_dynamic_executor: false              # ${story.executor} support
    checkpoint:
      enabled: true
      require_human_decision: false
      timeout_minutes: 30
    timeouts:
      validation: "10m"
      development: "2h"
    self_healing:
      enabled: false
      max_iterations: 2
      severity_filter: [CRITICAL]

  # ─── EXECUTION MODES ───

  execution_modes:
    - mode: yolo
      description: "Autonomous, minimal interaction"
      prompts: "0-1"
    - mode: interactive
      description: "Checkpoints and feedback"
      prompts: "5-10"
      default: true
    - mode: preflight
      description: "Full planning before execution"
      prompts: "10-15"

  # ─── INPUTS ───

  inputs:
    param_name:
      type: path|string|object
      required: true
      description: "{what it is}"

  # ─── PHASES ───

  phases:
    - id: "{phase-id}"                       # kebab-case, unique
      name: "{Phase Name}"
      agent: "@{agent-id}"                   # or "${story.executor}" (dynamic)
      task: "{task-slug}"                    # OPTIONAL — task to execute
      description: >-
        What this phase does.

      inputs:
        - input_from_previous
        - explicit_input:
            from: previous_phase.output_field

      outputs:
        - output_name:
            type: object
            properties:
              field1: string
              field2: boolean

      validations:
        - check: "condition"
          error: "Error message"

      timeout: "${config.timeouts.validation}"

      on_success: "{next-phase-id}"          # REQUIRED
      on_failure: "{error-phase-id}"         # REQUIRED

      checkpoint:                            # OPTIONAL — for critical phases
        id: "WF-CP-01"
        name: "Checkpoint Name"
        criteria:
          - "Criteria 1"
        veto:
          - "Blocking condition"

    # ─── GATE PHASE (decision point) ───

    - id: "{gate-id}"
      name: "{Gate Name}"
      agent: system
      description: "Decision point"
      condition_check:
        - condition: "{{steps.previous.output}} == 'GO'"
          action: continue
          log: "Gate passed"
        - condition: "{{steps.previous.output}} == 'NO-GO'"
          action: return_to
          next: "{previous-phase-id}"
          log: "Gate failed, returning"
      on_success: "{next-id}"
      on_failure: "{fallback-id}"

    # ─── END PHASE ───

    - id: complete
      name: "Workflow Complete"
      agent: system
      description: "Terminal phase"
      action: workflow_complete

  # ─── FLOW DIAGRAM ───

  flow_diagram: |
    Phase 1 → Gate → [GO] → Phase 2 → Phase 3 → Complete
                   → [NO-GO] → Phase 1

  # ─── DECISION GUIDANCE ───

  decision_guidance:
    when_to_use:
      - "{situation 1}"
    when_not_to_use:
      - "{anti-situation}"

  # ─── HANDOFF PROMPTS ───

  handoff_prompts:
    phase_1_to_2: |
      Phase 1 complete. Starting Phase 2...

  # ─── ERROR HANDLING ───

  error_handling:
    step_failure:
      message: "Phase {{phase.id}} failed"
      action: prompt
    agent_unavailable:
      message: "Agent {{agent}} unavailable"
      action: escalate
    timeout:
      message: "Phase {{phase.id}} timed out"
      action: prompt

  # ─── LOOP CONFIG ─── (type: loop only)

  loop:
    maxIterations: 5
    statusFile: "{path/to/status.json}"

  # ─── ESCALATION ─── (type: loop only)

  escalation:
    enabled: true
    triggers:
      - max_iterations_reached
      - verdict_blocked
      - manual_escalate
```

## Template Variables

| Variable | Resolves To |
|----------|------------|
| `{{story_id}}` | Current story ID |
| `{{agent_name}}` | Current agent name |
| `${story.executor}` | Dynamic agent assignment |
| `${config.timeouts.key}` | Config timeout value |

## Minimal Template

```yaml
workflow:
  id: "{workflow-id}"
  name: "{Name}"
  version: "1.0.0"
  description: >-
    {Description}
  orchestrator: "@{agent}"

  triggers:
    - type: command
      description: "*{command}"

  phases:
    - id: step-1
      name: "{Step 1}"
      agent: "@{agent-id}"
      description: "{action}"
      on_success: step-2
      on_failure: complete

    - id: step-2
      name: "{Step 2}"
      agent: "@{agent-id}"
      description: "{action}"
      on_success: complete
      on_failure: step-1

    - id: complete
      name: "Complete"
      agent: system
      action: workflow_complete

  decision_guidance:
    when_to_use:
      - "{use case}"

  error_handling:
    step_failure:
      message: "Step failed"
      action: prompt
```

## Phase Types

| Type | Key Fields | Use When |
|------|-----------|----------|
| **Action** | `agent`, `task`, `on_success/failure` | Agent performs work |
| **Gate** | `condition_check` | Decision point (GO/NO-GO) |
| **System** | `agent: system` | Framework-level checks |
| **End** | `action: workflow_complete` | Terminal phase |

## Registration Steps

### Core Workflow
1. Save to `.aiox-core/development/workflows/{name}.yaml`
2. Add to `.aiox-core/data/workflow-chains.yaml`
3. Update entity-registry

### Squad Workflow
1. Save to `squads/{squad}/workflows/{name}.yaml`
2. Update squad `config.yaml` components

## Validation Checklist (14 Points)

| # | Check | Blocking |
|---|-------|----------|
| 1 | Valid YAML syntax | YES |
| 2 | `workflow.id` present (kebab-case) | YES |
| 3 | `workflow.name` present | YES |
| 4 | `workflow.version` present (semver) | YES |
| 5 | `workflow.orchestrator` present | YES |
| 6 | `triggers` array defined (min 1) | YES |
| 7 | `phases` array has min 2 phases + end | YES |
| 8 | All phase `id`s are unique | YES |
| 9 | All `on_success`/`on_failure` resolve to valid IDs | YES |
| 10 | All `agent` values are valid agent IDs | YES |
| 11 | Loop workflows have `loop.maxIterations` | YES (if loop) |
| 12 | Error handling section present | Advisory |
| 13 | Flow diagram included | Advisory |
| 14 | File saved to correct path | YES |
