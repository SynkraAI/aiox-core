# Task: Create Squad Workflow

**Task ID:** create-workflow
**Version:** 2.0
**Purpose:** Create multi-phase workflows that orchestrate complex operations across agents
**Orchestrator:** @squad-architect
**Mode:** Elicitation-based (interactive)
**Quality Standard:** AIOS Level (500+ lines, 3+ phases, checkpoints)

**Frameworks Used:**
- `data/tier-system-framework.md` → Phase tier classification (Phase 2)
- `data/executor-matrix-framework.md` → Agent assignment (Phase 3)
- `data/decision-heuristics-framework.md` → Checkpoint logic (Phase 4)

---

## Overview

This task guides the creation of multi-phase workflows that orchestrate complex operations across multiple agents, days, and checkpoints.

**CRITICAL:** Prefer workflows over standalone tasks when the operation has 3+ phases, multiple agents, or needs intermediate validation.

**v2.0 Changes:**
- PHASE-based structure with checkpoints
- Framework integration at every phase
- Quality gate SC_WFL_001 must pass
- Inline structures for domain-specific guidance

```
INPUT (workflow_purpose + pack_name)
    ↓
[PHASE 0: CLASSIFICATION]
    → Validate workflow criteria
    → Define identity and scope
    ↓
[PHASE 1: PHASE DESIGN]
    → Design each phase (min 3)
    → Assign tiers
    → Define tasks per phase
    ↓
[PHASE 2: CHECKPOINT DESIGN]
    → Define checkpoints per phase
    → Set veto conditions
    → Design error handling
    ↓
[PHASE 3: AGENT ASSIGNMENT]
    → Assign agents to phases
    → Define handoff points
    → Map synergies
    ↓
[PHASE 4: VALIDATION]
    → Run SC_WFL_001 quality gate
    → Fix blocking issues
    → Save workflow file
    ↓
OUTPUT: Workflow file (.yaml) + Quality Gate PASS
```

---

## Workflow vs Task Decision

**CRITICAL:** Before creating a workflow, validate it's the right choice.

```yaml
workflow_criteria:
  create_WORKFLOW_when:
    - operation_has_3plus_phases: true
    - multiple_agents_involved: true
    - spans_multiple_days: true
    - needs_intermediate_checkpoints: true
    - output_from_one_phase_feeds_next: true

  create_TASK_when:
    - atomic_single_session: true
    - single_agent_sufficient: true
    - no_intermediate_checkpoints: true

  decision:
    if_any_workflow_criteria: "Create WORKFLOW"
    if_none_match: "Create TASK instead"
```

---

## Inputs

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `workflow_name` | string | Yes | Human-readable name | `"High-Ticket Sales Pipeline"` |
| `workflow_id` | string | Yes | kebab-case identifier | `"high-ticket-sales"` |
| `pack_name` | string | Yes | Target squad | `"copy"` |
| `duration` | string | Yes | Expected duration | `"7-10 days"` |
| `phase_count` | int | Yes | Number of phases (min 3) | `5` |

---

## Preconditions

- [ ] Target pack exists at `squads/{pack_name}/`
- [ ] squad-architect agent is active
- [ ] Agents for the workflow exist (or will be created)
- [ ] Write permissions for `squads/{pack_name}/workflows/`
- [ ] Workflow criteria validated (not a task)

---

## PHASE 0: CLASSIFICATION

**Duration:** 5-10 minutes
**Checkpoint:** SC_WFL_PRE (Workflow Pre-Check)
**Mode:** Interactive

### Step 0.1: Validate Workflow Criteria

**Actions:**
```yaml
validate_criteria:
  check_each:
    - has_3plus_phases: "How many distinct phases?"
    - multiple_agents: "How many agents involved?"
    - spans_multiple_days: "Expected duration?"
    - needs_checkpoints: "Validation points between phases?"
    - output_feeds_next: "Does phase output feed next phase?"

  decision:
    if_any_true: "Workflow is appropriate"
    if_all_false: "Redirect to *create-task"
```

**Elicitation:**
```yaml
elicit_validation:
  questions:
    - "Does this operation have 3+ distinct phases?"
    - "Are multiple agents involved?"
    - "Will it span multiple days or sessions?"
    - "Do you need validation checkpoints between phases?"

  if_all_no:
    action: "This should be a TASK, not a workflow."
    redirect: "*create-task"
```

### Step 0.2: Define Workflow Identity

**Elicitation:**
```yaml
elicit_identity:
  workflow_name:
    question: "What is the workflow name? (human-readable)"
    example: "High-Ticket Sales Pipeline"

  workflow_id:
    question: "What is the workflow ID? (kebab-case)"
    example: "high-ticket-sales"
    validation: "Must be unique within pack"

  duration:
    question: "What is the expected duration?"
    example: "7-10 days"

  description:
    question: "What does this workflow accomplish?"
    example: "Orchestrates the complete sales pipeline from lead capture to close"
```

### Step 0.3: Define Scope

**Elicitation:**
```yaml
elicit_scope:
  primary_goal:
    question: "What is the primary goal of this workflow?"

  target_user:
    question: "Who will execute this workflow?"

  use_cases:
    question: "What are 3-5 specific use cases for this workflow?"

  decision_criteria:
    question: "When should someone choose this workflow over alternatives?"
```

**Output (PHASE 0):**
```yaml
phase_0_output:
  workflow_name: "High-Ticket Sales Pipeline"
  workflow_id: "high-ticket-sales"
  duration: "7-10 days"
  pack_name: "copy"
  phase_count: 5
  criteria_validated: true
```

---

## PHASE 1: PHASE DESIGN

**Duration:** 15-20 minutes
**Checkpoint:** SC_PHS_001 (Phases Defined)
**Mode:** Interactive

### Step 1.1: Design Phase Structure

**Apply: tier-system-framework.md**

**Actions:**
```yaml
design_phases:
  tier_definitions:
    tier_0: "Foundation - Must complete before anything else"
    tier_1: "Core - Main execution phase"
    tier_2: "Advanced - Enhancement and optimization"
    tier_3: "Polish - Final quality assurance"

  for_each_phase:
    - phase_number: "Sequential number (1, 2, 3...)"
    - phase_name: "Human-readable name"
    - phase_days: "Duration (e.g., 'Days 1-2')"
    - phase_tier: "0, 1, 2, or 3"
    - phase_description: "What this phase accomplishes"
    - phase_tasks: "List of tasks in this phase"
```

### Step 1.2: Define Each Phase

**Template for each phase:**
```yaml
phase_template:
  structure: |
    - id: PHASE-{phase_number}
      name: "{phase_name}"
      days: "{phase_days}"
      tier: {phase_tier}
      description: |
        {phase_description}

      tasks:
        - task_file: "{task_file}"
          agent: "{agent_id}"
          required: true
          description: "{task_description}"
          output: "{output_file}"

      checkpoint:
        criteria:
          - "{criterion_1}"
          - "{criterion_2}"
        human_review: true
        message: "{checkpoint_message}"
```

**Elicitation per phase:**
```yaml
elicit_phase:
  phase_identity:
    - "What is the name of Phase {N}?"
    - "What days does it span?"
    - "What tier is it? (0=foundation, 1=core, 2=advanced, 3=polish)"

  phase_content:
    - "What tasks belong to this phase?"
    - "Which agent executes each task?"
    - "What does this phase produce?"

  phase_checkpoint:
    - "What must be true to complete this phase?"
    - "Does it need human review?"
```

### Step 1.3: Add Inline Structures (If Needed)

**When to add inline structures:**
```yaml
inline_structure_criteria:
  add_when:
    - "Phase produces complex multi-part output"
    - "Detailed step-by-step guidance is needed"
    - "Timing/duration specifications are important"
    - "Domain-specific formatting required"

  examples:
    email_sequence:
      pattern: |
        sos_structure:
          email_1:
            name: "Set the Stage"
            purpose: "Introduce story, establish credibility"
            elements:
              - "Origin story opening"
              - "Establish relatability"
            cliffhanger: "What happened next..."

    webinar_structure:
      pattern: |
        webinar_structure:
          introduction:
            duration: "5-10 min"
            elements:
              - "Hook: Big promise"
              - "Quick credibility"
              - "Agenda"

    call_script:
      pattern: |
        call_script_structure:
          phase_1_rapport:
            duration: "5 minutes"
            purpose: "Build connection"
            elements:
              - "Warm greeting"
              - "Set expectations"
```

**Output (PHASE 1):**
```yaml
phase_1_output:
  phases_defined: 5
  all_have_tier: true
  all_have_tasks: true
  inline_structures: 2
```

**Checkpoint SC_PHS_001:**
```yaml
heuristic_id: SC_PHS_001
name: "Phases Defined"
blocking: true
criteria:
  - phases_count >= 3
  - all_phases_have_tier
  - all_phases_have_tasks
  - tier_0_exists  # Foundation phase required
```

---

## PHASE 2: CHECKPOINT DESIGN

**Duration:** 10-15 minutes
**Checkpoint:** SC_CKP_001 (Checkpoints Complete)
**Mode:** Interactive

### Step 2.1: Define Checkpoints Per Phase

**Actions:**
```yaml
checkpoint_design:
  every_phase_must_have:
    - criteria: "List of specific validation items"
    - human_review: "true for important decisions"
    - message: "Context for the reviewer"

  checkpoint_template: |
    checkpoint:
      criteria:
        - "{criterion_1}"
        - "{criterion_2}"
        - "{criterion_3}"
      human_review: {true|false}
      message: "{reviewer_context}"
```

**Elicitation:**
```yaml
elicit_checkpoint:
  for_each_phase:
    - "What must be true to complete Phase {N}?"
    - "List 2-4 specific criteria"
    - "Does this checkpoint need human review?"
    - "What context should the reviewer have?"
```

### Step 2.2: Set Veto Conditions

**Apply: decision-heuristics-framework.md**

**Actions:**
```yaml
veto_conditions:
  purpose: "Define conditions that BLOCK progress"

  template: |
    checkpoint_config:
      - phase: PHASE-{N}
        heuristic: "{heuristic_id}"
        criteria: "{criteria}"
        veto_condition: "{veto_condition}"

  examples:
    - veto: "Vision unclear (<0.7 clarity score)"
    - veto: "Missing required outputs"
    - veto: "Quality score below 7.0"
    - veto: "Security validation failed"
    - veto: "Human review rejected"
```

### Step 2.3: Design Error Handling

**Actions:**
```yaml
error_handling:
  template: |
    error_handling:
      on_phase_failure:
        - log_error: true
        - notify_stakeholders: true
        - create_remediation_task: true
        - halt_workflow: {true|false}

      on_checkpoint_failure:
        - log_failure_reason: true
        - return_to_previous_phase: {true|false}
        - max_retries: {count}

      on_veto_triggered:
        - halt_immediately: true
        - escalate_to: "{escalation_target}"
        - document_reason: true
```

**Output (PHASE 2):**
```yaml
phase_2_output:
  checkpoints_defined: 5
  veto_conditions: 8
  error_handling: "complete"
```

---

## PHASE 3: AGENT ASSIGNMENT

**Duration:** 10-15 minutes
**Checkpoint:** SC_AGN_001 (Agents Assigned)
**Mode:** Interactive

### Step 3.1: Assign Agents to Phases

**Apply: executor-matrix-framework.md**

**Actions:**
```yaml
agent_assignment:
  template: |
    agents_by_phase:
      PHASE-{N}:
        primary:
          - "{primary_agent_1}"
          - "{primary_agent_2}"
        secondary:
          - "{secondary_agent_1}"

  criteria:
    primary_agent: "Main executor for the phase"
    secondary_agent: "Supports or validates primary"
```

**Elicitation:**
```yaml
elicit_agents:
  for_each_phase:
    - "Which agent is PRIMARY for Phase {N}?"
    - "Which agents SUPPORT this phase?"
    - "Are these agents defined in the pack?"
```

### Step 3.2: Define Handoff Points

**Actions:**
```yaml
handoff_points:
  template: |
    handoffs:
      - from_phase: PHASE-{N}
        to_phase: PHASE-{N+1}
        from_agent: "{agent_1}"
        to_agent: "{agent_2}"
        context_passed:
          - "{context_item_1}"
          - "{context_item_2}"
        validation: "{handoff_validation}"

  criteria:
    - "Clear sender and receiver"
    - "Context preserved"
    - "Validation at handoff"
```

### Step 3.3: Map Synergies and Conflicts

**Actions:**
```yaml
synergies_conflicts:
  synergies:
    - agents: ["{agent_1}", "{agent_2}"]
      pattern: "How they work well together"

  conflicts:
    - agents: ["{agent_3}", "{agent_4}"]
      reason: "Why they shouldn't be combined"
      resolution: "How to handle if both needed"
```

**Output (PHASE 3):**
```yaml
phase_3_output:
  agents_assigned: 8
  handoff_points: 4
  synergies_mapped: 3
  conflicts_identified: 1
```

---

## PHASE 4: VALIDATION & OUTPUT

**Duration:** 5-10 minutes
**Checkpoint:** SC_WFL_001 (Workflow Quality Gate)
**Mode:** Autonomous

### Step 4.1: Compile Workflow File

**Actions:**
```yaml
compile_workflow:
  sections:
    - header: "id, name, duration, description"
    - best_for: "Use cases"
    - decision_matrix_fit: "When to use"
    - clone_combinations: "Agent combinations"
    - phases: "All phases with tasks and checkpoints"
    - error_handling: "Error procedures"
    - signals: "completion, checkpoint, blocked"
    - outputs: "All artifacts"
    - agents_by_phase: "Agent assignments"
    - quality_checklist: "Per-phase criteria"
    - metadata: "Version, created, etc."

  output_location: "squads/{pack_name}/workflows/wf-{workflow_id}.yaml"
```

### Step 4.2: Run Quality Gate SC_WFL_001

**Actions:**
```yaml
run_quality_gate:
  heuristic_id: SC_WFL_001
  name: "Workflow Quality Gate"
  blocking: true

  blocking_requirements:
    phases: ">= 3"
    each_phase_has:
      - id: true
      - name: true
      - days: true
      - tier: true
      - tasks: ">= 1"
      - checkpoint: true
    tier_0_exists: true
    agents_assigned: true
    error_handling: "defined"

  scoring:
    | Dimension | Weight | Check |
    |-----------|--------|-------|
    | Completeness | 0.25 | All phases complete |
    | Checkpoints | 0.20 | All checkpoints defined |
    | Agents | 0.20 | Agents assigned correctly |
    | Inline Structures | 0.15 | Domain guidance |
    | Error Handling | 0.10 | Procedures defined |
    | Documentation | 0.10 | Well-documented |

  threshold: 7.0
  veto_conditions:
    - phases < 3 → "Insufficient phases"
    - no_tier_0 → "Missing foundation phase"
    - no_checkpoints → "Missing checkpoints"

  quality_indicators:
    min_lines: 500
    min_phases: 3
    inline_structures: ">= 1 recommended"
```

### Step 4.3: Save Workflow File

**Actions:**
```yaml
save_workflow:
  path: "squads/{pack_name}/workflows/wf-{workflow_id}.yaml"

  post_save:
    - verify_yaml_valid
    - update_pack_readme
    - update_config_yaml
    - log_creation
```

**Output (PHASE 4):**
```yaml
phase_4_output:
  quality_score: 8.5/10
  blocking_requirements: "ALL PASS"
  workflow_file: "squads/{your-squad}/workflows/wf-high-ticket-sales.yaml"
  lines: 650
  status: "PASS"
```

---

## PHASE 5: HANDOFF

**Duration:** < 2 minutes
**Mode:** Interactive

### Step 5.1: Present Workflow Summary

**Actions:**
```yaml
present_summary:
  workflow_created:
    name: "High-Ticket Sales Pipeline"
    id: "wf-high-ticket-sales"
    file: "squads/{your-squad}/workflows/wf-high-ticket-sales.yaml"
    lines: 650

  structure:
    phases: 5
    total_tasks: 12
    checkpoints: 5
    agents_involved: 4

  quality:
    score: 8.5/10
    status: "PASS"
```

---

## Outputs

| Output | Location | Description |
|--------|----------|-------------|
| Workflow File | `squads/{pack_name}/workflows/wf-{workflow_id}.yaml` | Complete workflow |
| Updated README | `squads/{pack_name}/README.md` | Workflow added |
| Updated Config | `squads/{pack_name}/config.yaml` | Workflow registered |

---

## Validation Criteria (All Must Pass)

### Structure
- [ ] Workflow file is valid YAML
- [ ] Has 3+ phases
- [ ] Has tier 0 (foundation) phase

### Content
- [ ] Each phase has id, name, days, tier, description
- [ ] Each phase has at least 1 task
- [ ] Each phase has checkpoint with criteria
- [ ] Agents assigned to all phases

### Quality
- [ ] Lines >= 500
- [ ] SC_WFL_001 score >= 7.0
- [ ] Error handling defined
- [ ] At least 1 inline structure (recommended)

---

## Heuristics Reference

| Heuristic ID | Name | Where Applied | Blocking |
|--------------|------|---------------|----------|
| SC_WFL_PRE | Workflow Pre-Check | Phase 0 | Yes |
| SC_PHS_001 | Phases Defined | Phase 1 | Yes |
| SC_CKP_001 | Checkpoints Complete | Phase 2 | Yes |
| SC_AGN_001 | Agents Assigned | Phase 3 | Yes |
| SC_WFL_001 | Workflow Quality Gate | Phase 4 | Yes |

---

## Error Handling

```yaml
error_handling:
  should_be_task:
    - "User trying to create simple operation as workflow"
    - action: "Redirect to *create-task"

  insufficient_phases:
    - "User defined < 3 phases"
    - action: "Suggest combining with related operations OR use task"

  validation_fails:
    - "Workflow doesn't meet quality gate"
    - action: "Identify failures, fix, re-validate"
```

---

## Integration with AIOS

This task creates workflows that:
- Follow AIOS workflow standards (YAML format)
- Have 3+ phases with tier classification
- Include checkpoints with veto conditions
- Assign agents to phases correctly
- Integrate with squad ecosystem
- Pass quality gate SC_WFL_001

---

_Task Version: 2.0_
_Last Updated: 2026-02-01_
_Lines: 550+_
