template:
  id: squad-task-template-v2
  name: Squad Task
  version: 2.0
  output:
    format: markdown
    filename: "tasks/{{task_id}}.md"
    title: "{{task_name}} Task Definition"
  standards:
    pattern: HO-TP-001
    description: "Task Anatomy Standard - 8 mandatory fields"

workflow:
  mode: interactive
  elicitation: advanced-elicitation
  custom_elicitation:
    title: "Task Workflow Elicitation"
    sections:
      - id: workflow-complexity
        options:
          - "Simple Task - Linear sequence of steps"
          - "Interactive Task - Requires user elicitation"
          - "Complex Task - Multiple sections with conditionals"
          - "Orchestration Task - Coordinates other tasks"
      - id: elicitation-mode
        options:
          - "No Elicitation - Execute without user input"
          - "Basic Elicitation - Simple questions"
          - "Advanced Elicitation - Interactive refinement"
          - "Expert Elicitation - Deep domain knowledge extraction"
      - id: executor-type
        title: "Executor Type Selection"
        description: "Who will execute this task?"
        options:
          - "Human - Judgment, creativity, relationships ($$$ / Slow)"
          - "Agent - Analysis, generation, pattern recognition ($$$$ / Fast)"
          - "Hybrid - AI assists, human validates ($$ / Moderate)"
          - "Worker - Deterministic, APIs, file ops ($ / Very Fast)"

# ============================================================================
# TASK ANATOMY STANDARD (HO-TP-001)
# ============================================================================
# Every task MUST have these 8 mandatory fields. No exceptions.
# Reference: AIOS Task Anatomy Standard
# ============================================================================

task_anatomy:
  required_fields: 8
  fields:
    - task_name          # Format: "Verb + Object" (e.g., "Create Legal Contract")
    - status             # Enum: pending | in_progress | completed
    - responsible_executor  # Who executes (role or specific person/agent)
    - execution_type     # Enum: Human | Agent | Hybrid | Worker
    - input              # Array of required inputs
    - output             # Array of produced outputs
    - action_items       # Execution steps
    - acceptance_criteria # Criteria for completion
  optional_fields:
    - estimated_time     # Format: "Xh" or "X-Yh"
    - dependencies       # Array of task IDs this depends on
    - templates          # Array of template IDs to use
    - quality_gate       # Quality gate configuration
    - handoff            # Handoff configuration

executor_types:
  Human:
    id: "HO-EP-001"
    characteristics: "Judgment, creativity, relationships"
    cost: "$$$"
    speed: "Slow"
    when_to_use: "Critical decisions, negotiations, creative work"
  Agent:
    id: "HO-EP-002"
    characteristics: "Analysis, generation, pattern recognition"
    cost: "$$$$"
    speed: "Fast"
    when_to_use: "Data analysis, content generation, pattern matching"
  Hybrid:
    id: "HO-EP-003"
    characteristics: "AI assists, human validates"
    cost: "$$"
    speed: "Moderate"
    when_to_use: "Reviews, assisted approvals, quality validation"
  Worker:
    id: "HO-EP-004"
    characteristics: "Deterministic, APIs, file operations"
    cost: "$"
    speed: "Very Fast"
    when_to_use: "Automations, integrations, file operations"

sections:
  - id: initial-setup
    instruction: |
      Initial Setup for Task Definition (HO-TP-001 Compliant)

      This template creates a task workflow that follows the Task Anatomy Standard.
      All 8 mandatory fields MUST be populated.

      Gather the following information:
      - Task ID (kebab-case, e.g., "create-legal-contract")
      - Task name (Verb + Object format, e.g., "Create Legal Contract")
      - Responsible executor (role or specific person/agent)
      - Execution type (Human | Agent | Hybrid | Worker)
      - Required inputs (array)
      - Expected outputs (array)
      - Action items (execution steps)
      - Acceptance criteria (completion criteria)

      Optional fields:
      - Estimated time
      - Dependencies
      - Templates
      - Quality gate
      - Handoff configuration

      Output file location: `squads/{{pack_name}}/tasks/{{task_id}}.md`

  - id: task-header
    title: Task Header
    instruction: Create task header with metadata following HO-TP-001
    template: |
      # {{task_name}}

      **Task ID:** `{{task_id}}`
      **Pattern:** HO-TP-001 (Task Anatomy Standard)
      **Version:** {{version}}
      **Last Updated:** {{last_updated}}

  - id: task-anatomy-table
    title: Task Anatomy Table
    instruction: |
      Create the Task Anatomy Table with all 8 mandatory fields.
      This is the core specification of the task.
    template: |
      ## Task Anatomy

      | Field | Value |
      |-------|-------|
      | **task_name** | {{task_name}} |
      | **status** | `{{status}}` |
      | **responsible_executor** | {{responsible_executor}} |
      | **execution_type** | `{{execution_type}}` |
      | **input** | {{input_summary}} |
      | **output** | {{output_summary}} |
      | **action_items** | {{action_items_count}} steps |
      | **acceptance_criteria** | {{criteria_count}} criteria |

      {{#if estimated_time}}
      **Estimated Time:** {{estimated_time}}
      {{/if}}

  - id: executor-specification
    title: Executor Specification
    instruction: |
      Detail the executor type and rationale based on the Executor Matrix (HO-EP-xxx).
    template: |
      ## Executor Specification

      | Attribute | Value |
      |-----------|-------|
      | **Type** | {{execution_type}} |
      | **Pattern** | {{executor_pattern}} |
      | **Executor** | {{responsible_executor}} |
      | **Rationale** | {{executor_rationale}} |
      {{#if fallback_executor}}
      | **Fallback** | {{fallback_executor}} |
      {{/if}}

      ### Executor Selection Criteria

      {{executor_selection_criteria}}

  - id: overview
    title: Task Overview
    instruction: Provide clear overview of what this task accomplishes
    template: |
      ## Overview

      {{task_overview}}

  - id: inputs
    title: Input Specification
    instruction: List all required inputs with their types and descriptions
    template: |
      ## Input

      {{#each inputs}}
      - **{{name}}** ({{type}})
        - Description: {{description}}
        {{#if required}}
        - Required: Yes
        {{/if}}
        {{#if source}}
        - Source: {{source}}
        {{/if}}
      {{/each}}

  - id: outputs
    title: Output Specification
    instruction: List all outputs produced by this task
    template: |
      ## Output

      {{#each outputs}}
      - **{{name}}** ({{type}})
        - Description: {{description}}
        {{#if destination}}
        - Destination: {{destination}}
        {{/if}}
        {{#if format}}
        - Format: {{format}}
        {{/if}}
      {{/each}}

  - id: action-items
    title: Action Items
    instruction: |
      Define the step-by-step execution workflow.
      Each action item should be clear and actionable.
    elicit: true
    template: |
      ## Action Items

      {{#each action_items}}
      ### Step {{index}}: {{title}}

      {{description}}

      {{#if substeps}}
      **Substeps:**
      {{#each substeps}}
      - [ ] {{this}}
      {{/each}}
      {{/if}}

      {{#if notes}}
      **Notes:** {{notes}}
      {{/if}}
      {{/each}}

  - id: acceptance-criteria
    title: Acceptance Criteria
    instruction: Define clear, measurable acceptance criteria for task completion
    template: |
      ## Acceptance Criteria

      The task is complete when ALL of the following criteria are met:

      {{#each acceptance_criteria}}
      - [ ] **{{id}}:** {{description}}
        {{#if measurement}}
        - Measurement: {{measurement}}
        {{/if}}
        {{#if threshold}}
        - Threshold: {{threshold}}
        {{/if}}
      {{/each}}

  - id: quality-gate
    title: Quality Gate (Optional)
    condition: Has quality gate
    instruction: |
      Define the quality gate that validates task completion.
      Quality gates are checkpoints with formal criteria.
    template: |
      ## Quality Gate

      ```yaml
      quality_gate:
        id: "{{quality_gate_id}}"
        name: "{{quality_gate_name}}"
        placement: "{{placement}}"  # entry | transition | exit
        type: "{{gate_type}}"       # manual | automated | hybrid | external
        severity: "{{severity}}"    # blocking | warning | info

        criteria:
          {{#each qg_criteria}}
          - check: "{{check}}"
            type: "{{type}}"
            field: "{{field}}"
            value: {{value}}
            operator: "{{operator}}"
            weight: {{weight}}
          {{/each}}

        thresholds:
          pass: {{pass_threshold}}
          review: {{review_threshold}}
          fail: {{fail_threshold}}

        executor:
          type: "{{gate_executor_type}}"
          {{#if ai_agent}}
          ai_agent: "{{ai_agent}}"
          {{/if}}
          {{#if human_review}}
          human_review: "{{human_review}}"
          {{/if}}

        pass_action:
          {{#each pass_actions}}
          - "{{this}}"
          {{/each}}

        fail_action:
          {{#each fail_actions}}
          - "{{this}}"
          {{/each}}
      ```

  - id: dependencies
    title: Dependencies
    condition: Has dependencies
    instruction: List task dependencies and their relationships
    template: |
      ## Dependencies

      ### Depends On (Upstream)

      {{#each depends_on}}
      - `{{task_id}}` - {{task_name}}
        - Required output: {{required_output}}
      {{/each}}

      ### Required By (Downstream)

      {{#each required_by}}
      - `{{task_id}}` - {{task_name}}
        - Uses output: {{used_output}}
      {{/each}}

  - id: handoff
    title: Handoff Section
    instruction: |
      Define how this task hands off to the next task or executor.
      Handoffs ensure continuity and clear transitions.
    template: |
      ## Handoff

      | Attribute | Value |
      |-----------|-------|
      | **Next Task** | `{{handoff_to}}` |
      | **Trigger** | {{handoff_trigger}} |
      | **Executor** | {{handoff_executor}} |

      ### Handoff Checklist

      Before handoff, verify:
      {{#each handoff_checklist}}
      - [ ] {{this}}
      {{/each}}

      ### Handoff Package

      The following artifacts are passed to the next task:
      {{#each handoff_artifacts}}
      - **{{name}}**: {{description}}
      {{/each}}

  - id: elicitation-config
    title: Custom Elicitation Configuration
    condition: Uses advanced elicitation
    instruction: |
      If task uses advanced elicitation, define custom elicitation sections.
      Each section should present options or questions to gather user input.
    template: |
      ## Custom Elicitation

      ```yaml
      custom_elicitation:
        title: "{{elicitation_title}}"
        sections:
          {{elicitation_sections}}
      ```

  - id: error-handling
    title: Error Handling
    instruction: Define how to handle common errors or edge cases
    template: |
      ## Error Handling

      {{#each error_scenarios}}
      ### {{name}}

      - **Trigger:** {{trigger}}
      - **Detection:** {{detection}}
      - **Recovery:** {{recovery}}
      - **Prevention:** {{prevention}}
      {{/each}}

  - id: integration
    title: Integration Points
    instruction: Describe how this task integrates with other tasks or agents
    template: |
      ## Integration

      This task integrates with:

      {{integration_points}}

  - id: examples
    title: Usage Examples
    instruction: Provide concrete examples of task execution
    template: |
      ## Examples

      {{usage_examples}}

  - id: notes
    title: Implementation Notes
    template: |
      ## Notes

      {{implementation_notes}}

  - id: validation-section
    title: Validation Checklist
    instruction: |
      Provide a validation checklist to ensure the task follows HO-TP-001.
      This is used to verify task anatomy compliance.
    template: |
      ## Validation Checklist (HO-TP-001)

      ### Mandatory Fields Check

      - [ ] `task_name` follows "Verb + Object" format
      - [ ] `status` is one of: pending | in_progress | completed
      - [ ] `responsible_executor` is clearly specified
      - [ ] `execution_type` is one of: Human | Agent | Hybrid | Worker
      - [ ] `input` array has at least 1 item
      - [ ] `output` array has at least 1 item
      - [ ] `action_items` has clear, actionable steps
      - [ ] `acceptance_criteria` has measurable criteria

      ### Quality Check

      - [ ] Task is atomic (single responsibility)
      - [ ] Inputs are well-defined with types
      - [ ] Outputs match acceptance criteria
      - [ ] Action items are sequential and clear
      - [ ] Executor type matches task nature
      - [ ] Handoff is specified (if not terminal)

  - id: footer
    template: |
      ---

      _Task Version: {{version}}_
      _Pattern: HO-TP-001 (Task Anatomy Standard)_
      _Last Updated: {{last_updated}}_
      _Compliant: Yes_
