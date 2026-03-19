# Task: Create AI/ML-Readable SOP

## Task Anatomy

| Field | Value |
|-------|-------|
| **Task ID** | `create-sop-ml` |
| **Version** | `1.0.0` |
| **Status** | `active` |
| **Responsible Executor** | `sop-ml-architect` |
| **Execution Type** | `Agent` |

## Metadata
```yaml
id: create-sop-ml
name: "Create AI/ML-Readable SOP"
category: creation
agent: sop-ml-architect
elicit: true
autonomous: false
description: "Create a structured, machine-readable SOP in YAML or JSON format designed for AI agent consumption. Defines state machines, tool mappings, decision logic, and error handling in a format parseable by autonomous agents."
```

## Purpose

Create a machine-readable SOP that an AI agent can parse, interpret, and execute autonomously. Unlike human SOPs that rely on natural language comprehension, ML SOPs use structured state machines with explicit transitions, tool mappings, conditional logic, and typed inputs/outputs. This enables agent-driven process execution, automated validation, and programmatic compliance checking.

This task produces the **AI/ML-facing** SOP. For human-readable output, use `create-sop-human`.

## Prerequisites

- [ ] Process name and description available
- [ ] Target agent capabilities understood (optional but recommended)
- [ ] Available tools/actions inventory known
- [ ] SOP ML Schema (`sop-ml-schema`) accessible for validation

## Inputs

```yaml
inputs:
  process_name:
    type: string
    required: true
    description: "Name of the process to document (e.g., 'deploy-service', 'onboard-customer')"

  process_description:
    type: string
    required: true
    description: "Detailed description of the process including purpose, triggers, and expected behavior"

  target_agent:
    type: string
    required: false
    description: "The AI agent or system that will consume and execute this SOP (e.g., 'deploy-bot', 'onboarding-agent'). Helps tailor tool mappings."

  output_format:
    type: enum
    required: false
    default: yaml
    options: [yaml, json]
    description: "Output format for the structured SOP"
```

## Workflow / Steps

### 1. Gather Requirements

```
ELICIT from user:
  1. What is the process name and its purpose?
  2. What triggers this process? (event, API call, schedule, manual)
  3. What are the inputs (with types and constraints)?
  4. What are the expected outputs?
  5. What tools/APIs/actions are available to the executing agent?
  6. What decisions must be made during execution?
  7. What are the error conditions and recovery strategies?
  8. What are the success criteria?
  9. Are there time constraints or SLAs?
  10. What agent will consume this SOP? (capabilities, tool access)

STORE: requirements = {
  process_name, purpose, trigger, inputs, outputs,
  available_tools, decisions, errors, success_criteria,
  sla, target_agent
}
```

### 2. Define State Machine

```
ACTION: Model the process as a finite state machine

IDENTIFY:
  - STATES: Distinct process phases (e.g., INIT, VALIDATING, EXECUTING, COMPLETE)
  - TRANSITIONS: What moves the process from one state to another
  - GUARDS: Conditions that must be true for a transition to fire
  - ACTIONS: What happens on entry/exit of each state
  - TERMINAL STATES: SUCCESS, FAILURE, TIMEOUT, ESCALATE

STRUCTURE:
  states:
    - id: "<state-id>"
      name: "<human-readable name>"
      type: "initial|intermediate|decision|terminal"
      description: "<what happens in this state>"
      on_enter: [<actions>]
      on_exit: [<actions>]
      transitions:
        - target: "<next-state-id>"
          guard: "<condition expression>"
          action: "<transition action>"

RULES:
  - Every state must have at least one outgoing transition (except terminal states)
  - Every decision state must have transitions for ALL possible outcomes
  - No orphan states (unreachable from initial state)
  - No dead-end states (non-terminal states with no outgoing transitions)
  - Maximum state depth: 20 (prevent infinite loops)
```

### 3. Schema Construction

```
ACTION: Build complete YAML/JSON structure following sop-ml-schema

TOP-LEVEL STRUCTURE:
  sop:
    metadata:
      id: "<process-name>-sop-ml"
      version: "1.0.0"
      created: "<ISO-8601>"
      author: "sop-ml-architect"
      target_agent: "<agent-id or 'generic'>"
      format_version: "1.0.0"
      description: "<purpose>"

    trigger:
      type: "event|schedule|manual|api"
      source: "<trigger source>"
      condition: "<optional guard>"

    inputs:
      - name: "<input-name>"
        type: "<string|number|boolean|object|array>"
        required: <true|false>
        description: "<what this input is>"
        validation: "<regex or constraint>"
        default: "<optional default>"

    outputs:
      - name: "<output-name>"
        type: "<type>"
        description: "<what this output is>"

    constants:
      - name: "<constant-name>"
        value: "<value>"
        description: "<purpose>"

    states: [<state machine from Step 2>]

    error_handling:
      global:
        timeout: "<duration>"
        max_retries: <number>
        on_timeout: "<state-id>"
        on_max_retries: "<state-id>"
      per_state:
        - state: "<state-id>"
          errors:
            - type: "<error-type>"
              action: "<retry|skip|escalate|abort>"
              max_retries: <number>
              fallback_state: "<state-id>"

    sla:
      max_duration: "<duration>"
      expected_duration: "<duration>"
      critical_path: [<state-ids>]

VALIDATION: Structure must conform to sop-ml-schema
```

### 4. Tool Mapping

```
ACTION: Map each actionable step to a concrete tool or API call

FORMAT per mapping:
  tool_mappings:
    - state: "<state-id>"
      action: "<action-name>"
      tool:
        name: "<tool-identifier>"
        type: "api|cli|function|mcp|manual"
        endpoint: "<URL or command>"
        method: "<GET|POST|PUT|DELETE|EXECUTE>"
        parameters:
          - name: "<param>"
            source: "<input.field|state.output|constant>"
        expected_response:
          success: "<condition>"
          failure: "<condition>"
        timeout: "<duration>"

RULES:
  - Every non-decision state must have at least one tool mapping
  - If no tool exists for an action, mark as type: "manual" with instructions
  - Include expected response conditions for automated validation
  - Map parameter sources to inputs, previous state outputs, or constants
```

### 5. Validation

```
ACTION: Validate the complete SOP against quality criteria

CHECKS:
  a) Schema Validation
     - Valid YAML/JSON syntax
     - Conforms to sop-ml-schema structure
     - All required fields present

  b) State Machine Validation
     - No orphan states
     - No dead-end non-terminal states
     - All decision branches covered
     - Terminal states reachable from all paths
     - No infinite loops without exit conditions

  c) Tool Mapping Validation
     - Every actionable state has tool mapping
     - All parameter sources resolve to defined inputs/outputs
     - No undefined references

  d) Error Handling Validation
     - Global error handling defined
     - Critical states have per-state error handling
     - All error paths lead to defined states

  e) Parseability Test
     - YAML/JSON parses without error
     - Roundtrip serialization/deserialization succeeds

IF any validation fails: fix and re-validate
```

### 6. Output

```
ACTION: Save validated SOP to output directory

FILE: outputs/sop-factory/ml/{process-name}-sop-v{version}.yaml  (or .json)
FORMAT: YAML or JSON (per output_format input)

ALSO GENERATE:
  - State diagram in Mermaid (for human visualization of the ML SOP)
  - Validation report (schema conformance, state machine analysis)
```

## Output

```yaml
outputs:
  primary:
    path: "outputs/sop-factory/ml/{process-name}-sop-v{version}.yaml"
    format: "yaml|json"
    description: "Complete machine-readable SOP with state machine, tool mappings, and error handling"

  secondary:
    - path: "outputs/sop-factory/ml/{process-name}-state-diagram.md"
      format: markdown
      description: "Mermaid state diagram for visual representation"

    - path: "outputs/sop-factory/ml/{process-name}-validation-report.md"
      format: markdown
      description: "Schema validation and state machine analysis report"

  metadata:
    state_count: "<number of states>"
    transition_count: "<number of transitions>"
    decision_points: "<number of decision states>"
    tool_mappings: "<number of mapped tools>"
    schema_valid: "<true|false>"
    format: "<yaml|json>"
```

## Acceptance Criteria

- [ ] Output is valid YAML or JSON (parses without error)
- [ ] Passes schema validation against `sop-ml-schema`
- [ ] All states have tool mappings (or explicit `manual` type)
- [ ] All decision points have transitions for every possible outcome
- [ ] Error handling is defined for every state (global or per-state)
- [ ] State machine is complete: no orphan states, no dead ends
- [ ] All parameter sources resolve to defined inputs, outputs, or constants
- [ ] Terminal states (SUCCESS, FAILURE, ESCALATE) are reachable from all paths
- [ ] SLA constraints are defined (max duration, expected duration)
- [ ] Mermaid state diagram is generated for human review

## Veto Conditions

- STOP if process cannot be decomposed into discrete states (purely continuous/analog process)
- STOP if no tools can be identified for more than 50% of steps (SOP would be mostly manual)
- STOP if the process has unbounded loops with no exit condition
- STOP if input types cannot be defined (completely unstructured process)
- STOP if schema validation fails after 3 revision attempts
