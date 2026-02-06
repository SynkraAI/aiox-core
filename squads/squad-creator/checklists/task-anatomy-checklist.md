# Task Anatomy Validation Checklist

**Purpose:** Validate task definitions against the HO-TP-001 Task Anatomy Standard before deployment.
**Pattern:** HO-TP-001 (Task Anatomy Standard)
**Quality Gate:** BLOCKING - tasks that fail critical checks cannot be deployed.

---

## Quick Validation (Automated)

### Minimum Thresholds

| Metric | Minimum | Target | Measurement |
|--------|---------|--------|-------------|
| Required fields present | 8/8 | 8/8 | Count of 8 mandatory fields |
| task_name format valid | true | true | Verb + Object pattern |
| execution_type valid | true | true | Enum: Human/Agent/Hybrid/Worker |
| estimated_time format | valid | valid | Xh or X-Yh pattern |
| inputs array | 1+ items | 2+ items | Count of input items |
| outputs array | 1+ items | 2+ items | Count of output items |
| action_items | 1+ items | 3+ items | Count of action steps |
| acceptance_criteria | 1+ items | 2+ items | Count of criteria |

```yaml
automated_checks:
  - check: "all_required_fields_present"
    weight: 30%
    severity: blocking
    fail_action: "BLOCK - missing required fields"

  - check: "task_name_format_valid"
    weight: 15%
    severity: blocking
    fail_action: "BLOCK - task_name must be Verb + Object"

  - check: "execution_type_valid"
    weight: 15%
    severity: blocking
    fail_action: "BLOCK - invalid execution_type"

  - check: "estimated_time_format_valid"
    weight: 10%
    severity: warning
    fail_action: "WARN - estimated_time format should be Xh or X-Yh"

  - check: "inputs_outputs_are_arrays"
    weight: 15%
    severity: blocking
    fail_action: "BLOCK - input/output must be arrays"

  - check: "action_items_present"
    weight: 10%
    severity: warning
    fail_action: "WARN - action_items should have concrete steps"

  - check: "acceptance_criteria_present"
    weight: 5%
    severity: warning
    fail_action: "WARN - acceptance_criteria recommended"
```

---

## 1. REQUIRED FIELDS (8 Mandatory)

### 1.1 Field Presence Check

Every task MUST have ALL 8 fields. No exceptions.

- [ ] **task_name** - Name of the task (Verb + Object format)
- [ ] **status** - Current status (Enum: pending|in_progress|completed)
- [ ] **responsible_executor** - Who/what executes the task
- [ ] **execution_type** - Type of executor (Enum: Human|Agent|Hybrid|Worker)
- [ ] **input** - Array of inputs required
- [ ] **output** - Array of outputs produced
- [ ] **action_items** - Array of execution steps
- [ ] **acceptance_criteria** - Array of completion criteria

### 1.2 Field Presence Scoring

| Fields Present | Score | Status |
|----------------|-------|--------|
| 8/8 | 100% | PASS |
| 7/8 | 87.5% | CONDITIONAL |
| 6/8 | 75% | FAIL |
| <6/8 | <75% | HARD FAIL |

### 1.3 Optional Fields

These fields enhance task definition but are not required:

- [ ] **estimated_time** - Time estimate (format: Xh or X-Yh)
- [ ] **dependencies** - Array of prerequisite task IDs
- [ ] **templates** - Array of template references
- [ ] **quality_gate** - Quality gate reference
- [ ] **handoff** - Handoff configuration (to, trigger)
- [ ] **patterns** - Pattern compliance references

---

## 2. TASK_NAME VALIDATION (Verb + Object Format)

### 2.1 Format Rules

The task_name MUST follow "Verb + Object" format:

```yaml
# Valid formats:
task_name: "Analyze Briefing"         # Verb + Noun
task_name: "Create Project Setup"     # Verb + Compound Noun
task_name: "Validate Quality Gate"    # Verb + Compound Noun
task_name: "Send Client Update"       # Verb + Object Phrase

# Invalid formats:
task_name: "Briefing Analysis"        # Noun + Noun (passive)
task_name: "Project Setup"            # Missing verb
task_name: "analyze_briefing"         # Wrong case (snake_case)
task_name: "ANALYZE BRIEFING"         # Wrong case (UPPER)
```

### 2.2 Valid Starting Verbs

- [ ] Action verbs: `Analyze`, `Create`, `Build`, `Design`, `Implement`
- [ ] Process verbs: `Execute`, `Process`, `Run`, `Perform`, `Conduct`
- [ ] Communication verbs: `Send`, `Notify`, `Report`, `Communicate`, `Present`
- [ ] Validation verbs: `Validate`, `Verify`, `Check`, `Review`, `Approve`
- [ ] Data verbs: `Extract`, `Transform`, `Load`, `Import`, `Export`
- [ ] Management verbs: `Schedule`, `Assign`, `Delegate`, `Track`, `Monitor`

### 2.3 Task Name Quality Check

- [ ] Starts with action verb (infinitive form)
- [ ] Object clearly identifies what is being acted upon
- [ ] Uses Title Case (each word capitalized)
- [ ] Concise but descriptive (2-5 words ideal)
- [ ] No abbreviations unless universally understood
- [ ] No special characters or underscores

### 2.4 Examples by Domain

```yaml
# Project Management
task_name: "Schedule Kick-off Meeting"
task_name: "Create Project Timeline"
task_name: "Assign Team Roles"

# Content Creation
task_name: "Write Script Draft"
task_name: "Review Video Concept"
task_name: "Approve Final Cut"

# Data Processing
task_name: "Extract Client Data"
task_name: "Transform Report Format"
task_name: "Load Analytics Dashboard"

# Quality Assurance
task_name: "Validate Briefing Completeness"
task_name: "Run Quality Gate Check"
task_name: "Verify Deliverable Specs"
```

---

## 3. EXECUTION_TYPE VALIDATION

### 3.1 Valid Execution Types

| Type | Pattern ID | Characteristics | When to Use |
|------|------------|-----------------|-------------|
| **Human** | HO-EP-001 | Judgment, creativity, relationships | Decisions, negotiations, approvals |
| **Agent** | HO-EP-002 | Analysis, generation, pattern recognition | Data analysis, content generation |
| **Hybrid** | HO-EP-003 | AI assists, human validates | Reviews, assisted approvals |
| **Worker** | HO-EP-004 | Deterministic, APIs, file ops | Automation, integrations |

### 3.2 Execution Type Selection Criteria

**Use Human (HO-EP-001) when:**
- [ ] Task requires creative judgment
- [ ] Task involves stakeholder relationships
- [ ] Task requires emotional intelligence
- [ ] Task has legal/ethical implications
- [ ] Task outcome significantly impacts business

**Use Agent (HO-EP-002) when:**
- [ ] Task involves pattern recognition in large datasets
- [ ] Task requires content generation at scale
- [ ] Task needs natural language processing
- [ ] Task benefits from AI reasoning capabilities
- [ ] Task is analysis-heavy

**Use Hybrid (HO-EP-003) when:**
- [ ] AI can draft, human must approve
- [ ] Speed matters but accuracy is critical
- [ ] Task requires AI analysis + human judgment
- [ ] Learning phase for future automation
- [ ] High-stakes decisions with AI support

**Use Worker (HO-EP-004) when:**
- [ ] Task is fully deterministic
- [ ] Task involves API calls or file operations
- [ ] Task requires 100% consistency
- [ ] Task is repetitive with no variation
- [ ] Task can run without supervision

### 3.3 Execution Type Validation

```yaml
execution_type_check:
  valid_values: ["Human", "Agent", "Hybrid", "Worker"]
  case_sensitive: true

  common_errors:
    - "human"      # Wrong: lowercase
    - "HUMAN"      # Wrong: uppercase
    - "H"          # Wrong: abbreviated
    - "Manual"     # Wrong: not a valid type
    - "Automated"  # Wrong: not a valid type
    - "Bot"        # Wrong: not a valid type
```

### 3.4 Executor Matrix Cross-Reference

- [ ] execution_type matches complexity of task
- [ ] execution_type matches skill requirements
- [ ] execution_type has appropriate cost/speed tradeoff
- [ ] Fallback executor defined for critical tasks

---

## 4. ESTIMATED_TIME VALIDATION

### 4.1 Valid Formats

```yaml
# Valid formats:
estimated_time: "1h"        # Single hour
estimated_time: "2h"        # Multiple hours
estimated_time: "0.5h"      # Fraction of hour
estimated_time: "1-2h"      # Range
estimated_time: "2-4h"      # Range
estimated_time: "30m"       # Minutes (alternative)
estimated_time: "1d"        # Days (for long tasks)

# Invalid formats:
estimated_time: "1 hour"    # Wrong: spelled out
estimated_time: "1hr"       # Wrong: wrong abbreviation
estimated_time: "about 2h"  # Wrong: qualifiers
estimated_time: 2           # Wrong: number without unit
estimated_time: "2"         # Wrong: string without unit
```

### 4.2 Time Format Regex

```regex
^(\d+\.?\d*)(h|m|d)$|^(\d+)-(\d+)(h|m|d)$
```

### 4.3 Time Validation Rules

- [ ] Contains numeric value
- [ ] Contains time unit (h, m, or d)
- [ ] Range format uses hyphen (X-Y)
- [ ] Range minimum less than maximum
- [ ] Reasonable estimate (not "1000h" for simple task)

### 4.4 Time Estimates by Execution Type

| Execution Type | Typical Range | Red Flag |
|----------------|---------------|----------|
| Worker | 0-0.5h | >1h (should be faster) |
| Agent | 0.5-2h | >4h (efficiency concern) |
| Hybrid | 1-4h | >8h (consider splitting) |
| Human | 1-8h | >16h (split into subtasks) |

---

## 5. INPUT/OUTPUT ARRAY VALIDATION

### 5.1 Array Format Check

Inputs and outputs MUST be arrays, not single values:

```yaml
# Valid format:
input:
  - "Client Briefing Document"
  - "Brand Guidelines"
  - "Previous Campaign Data"

output:
  - "Briefing Analysis Report"
  - "Recommended Strategy"

# Invalid format:
input: "Client Briefing Document"      # Wrong: string, not array
output: "Briefing Analysis Report"     # Wrong: string, not array
```

### 5.2 Input Quality Criteria

Each input item should:

- [ ] Be a specific, identifiable artifact
- [ ] Have clear source (where it comes from)
- [ ] Be available at task start
- [ ] Be sufficient for task completion

### 5.3 Output Quality Criteria

Each output item should:

- [ ] Be a specific, identifiable deliverable
- [ ] Have clear format (document, data, decision)
- [ ] Be verifiable/measurable
- [ ] Map to acceptance criteria

### 5.4 Input/Output Balance

```yaml
io_balance_check:
  minimum_inputs: 1
  minimum_outputs: 1

  warning_thresholds:
    many_inputs_few_outputs: "inputs > 5 AND outputs < 2"
    few_inputs_many_outputs: "inputs < 2 AND outputs > 5"

  red_flags:
    - "Zero inputs (task needs something to work with)"
    - "Zero outputs (task must produce something)"
    - "Vague inputs (e.g., 'various documents')"
    - "Vague outputs (e.g., 'improvements')"
```

### 5.5 Common Input/Output Patterns

```yaml
# Analysis Task Pattern
input:
  - "Raw Data Source"
  - "Analysis Parameters"
output:
  - "Analysis Report"
  - "Recommendations"

# Creation Task Pattern
input:
  - "Requirements Document"
  - "Style Guidelines"
output:
  - "Draft Deliverable"
  - "Version Notes"

# Validation Task Pattern
input:
  - "Deliverable to Validate"
  - "Validation Criteria"
output:
  - "Validation Report"
  - "Pass/Fail Decision"
```

---

## 6. ACTION_ITEMS AND ACCEPTANCE_CRITERIA

### 6.1 Action Items Quality

Action items should be executable steps:

- [ ] Each item starts with action verb
- [ ] Each item is specific and measurable
- [ ] Items are in logical sequence
- [ ] Items cover complete task workflow
- [ ] No vague items (e.g., "do the work")

```yaml
# Good action_items:
action_items:
  - "Download briefing document from shared drive"
  - "Extract key requirements into checklist"
  - "Validate requirements against brand guidelines"
  - "Generate analysis report using template"
  - "Submit report for review"

# Bad action_items:
action_items:
  - "Analyze stuff"
  - "Do the task"
  - "Make it good"
  - "Finish up"
```

### 6.2 Acceptance Criteria Quality

Acceptance criteria should be verifiable:

- [ ] Each criterion is testable (yes/no)
- [ ] Criteria cover all critical outputs
- [ ] Criteria are specific, not generic
- [ ] Criteria map to business requirements

```yaml
# Good acceptance_criteria:
acceptance_criteria:
  - "All 5 briefing sections analyzed"
  - "Completeness score >= 60%"
  - "Recommendations align with brand guidelines"
  - "Report generated in standard format"
  - "No critical gaps identified without mitigation"

# Bad acceptance_criteria:
acceptance_criteria:
  - "Task completed"
  - "Output is good"
  - "Stakeholder satisfied"
```

### 6.3 Criteria Count Guidelines

| Task Complexity | Action Items | Acceptance Criteria |
|-----------------|--------------|---------------------|
| Simple | 2-3 | 1-2 |
| Medium | 3-5 | 2-3 |
| Complex | 5-8 | 3-5 |
| Critical | 5-10 | 4-7 |

---

## 7. GENERAL QUALITY CHECKLIST

### 7.1 Completeness

- [ ] Task is self-contained (can execute independently)
- [ ] All dependencies explicitly stated
- [ ] No hidden assumptions about context
- [ ] Task boundary clearly defined (scope)

### 7.2 Clarity

- [ ] Task purpose immediately clear from name
- [ ] No ambiguous language in any field
- [ ] Technical terms defined or standard
- [ ] Target audience can understand without clarification

### 7.3 Consistency

- [ ] Follows project/squad naming conventions
- [ ] Uses same terminology as related tasks
- [ ] Pattern references are valid
- [ ] Format matches other tasks in workflow

### 7.4 Auditability

- [ ] Task can be tracked in system
- [ ] Status transitions are clear
- [ ] Outputs can be verified against criteria
- [ ] Handoff is documented (if applicable)

### 7.5 Reusability

- [ ] Task is parameterized where appropriate
- [ ] Task can be used in different contexts
- [ ] No hardcoded project-specific values
- [ ] Templates referenced, not embedded

---

## 8. VALIDATION WORKFLOW

### 8.1 Automated Validation (Fast Path)

```python
def validate_task_anatomy(task):
    required_fields = [
        'task_name', 'status', 'responsible_executor',
        'execution_type', 'input', 'output',
        'action_items', 'acceptance_criteria'
    ]

    checks = {
        'required_fields': all(f in task for f in required_fields),
        'task_name_format': validate_task_name(task.get('task_name', '')),
        'execution_type': task.get('execution_type') in ['Human', 'Agent', 'Hybrid', 'Worker'],
        'input_is_array': isinstance(task.get('input'), list) and len(task.get('input', [])) > 0,
        'output_is_array': isinstance(task.get('output'), list) and len(task.get('output', [])) > 0,
        'has_action_items': isinstance(task.get('action_items'), list) and len(task.get('action_items', [])) > 0,
        'has_acceptance_criteria': isinstance(task.get('acceptance_criteria'), list) and len(task.get('acceptance_criteria', [])) > 0,
    }

    blocking_checks = ['required_fields', 'task_name_format', 'execution_type', 'input_is_array', 'output_is_array']

    if all(checks[c] for c in blocking_checks):
        return "PASS", calculate_score(checks)
    else:
        return "FAIL", calculate_score(checks)
```

### 8.2 Decision Matrix

| Score | Status | Action |
|-------|--------|--------|
| 95-100% | PASS | Task ready for deployment |
| 80-94% | PASS | Deploy with minor notes |
| 60-79% | CONDITIONAL | Review and fix warnings |
| 40-59% | FAIL | Fix required fields first |
| <40% | HARD FAIL | Rewrite task definition |

### 8.3 Common Failures and Fixes

| Failure | Cause | Fix |
|---------|-------|-----|
| Missing fields | Incomplete template | Add all 8 required fields |
| Bad task_name | Not Verb + Object | Rename to "Verb + Object" format |
| Invalid execution_type | Typo or wrong case | Use exact: Human/Agent/Hybrid/Worker |
| Input not array | Single string | Convert to array with at least 1 item |
| Output not array | Single string | Convert to array with at least 1 item |
| Empty action_items | Placeholder | Add specific executable steps |
| Generic criteria | "Task done" | Add testable, specific criteria |

---

## 9. TASK DEFINITION TEMPLATE

Use this template for new tasks:

```yaml
task:
  id: "{task_id}"                           # kebab-case, unique
  task_name: "{Verb + Object}"              # Title Case, action-oriented
  status: "pending"                         # pending|in_progress|completed
  responsible_executor: "{executor_name}"   # Who/what executes
  execution_type: "{Human|Agent|Hybrid|Worker}"
  estimated_time: "{X}h"                    # Xh or X-Yh format

  input:
    - "{specific_input_1}"
    - "{specific_input_2}"

  output:
    - "{specific_output_1}"
    - "{specific_output_2}"

  action_items:
    - "{Verb} {specific action 1}"
    - "{Verb} {specific action 2}"
    - "{Verb} {specific action 3}"

  acceptance_criteria:
    - "{Testable criterion 1}"
    - "{Testable criterion 2}"

  # Optional fields
  dependencies: []
  templates: []
  quality_gate: null
  handoff:
    to: "{next_task_id}"
    trigger: "{trigger_event}"
  patterns:
    - "{PREFIX}-TP-001"
```

---

## VALIDATION REPORT TEMPLATE

```markdown
# Task Anatomy Validation Report

**Task ID:** {task_id}
**Task Name:** {task_name}
**Validated:** {timestamp}
**Validator:** {automated|manual}

## Required Fields Check

| Field | Present | Valid | Notes |
|-------|---------|-------|-------|
| task_name | {yes/no} | {yes/no} | {notes} |
| status | {yes/no} | {yes/no} | {notes} |
| responsible_executor | {yes/no} | {yes/no} | {notes} |
| execution_type | {yes/no} | {yes/no} | {notes} |
| input | {yes/no} | {yes/no} | {notes} |
| output | {yes/no} | {yes/no} | {notes} |
| action_items | {yes/no} | {yes/no} | {notes} |
| acceptance_criteria | {yes/no} | {yes/no} | {notes} |

## Format Validation

- task_name format: {PASS/FAIL} - {notes}
- execution_type value: {PASS/FAIL} - {notes}
- estimated_time format: {PASS/WARN/N/A} - {notes}
- input/output arrays: {PASS/FAIL} - {notes}

## Quality Assessment

- [ ] Completeness: {score}%
- [ ] Clarity: {score}%
- [ ] Consistency: {score}%
- [ ] Auditability: {score}%

## Overall Score: {score}%
## Status: {PASS|CONDITIONAL|FAIL|HARD_FAIL}

## Issues Found

{list of issues or "None"}

## Recommendation

{DEPLOY | FIX_WARNINGS | FIX_REQUIRED | REWRITE}

## Notes

{additional observations}
```

---

**Checklist Version:** 1.0.0
**Pattern Reference:** HO-TP-001 (Task Anatomy Standard)
**Created:** 2026-01-24
**Part of:** squads/squad-creator
**Based on:** AIOS Best Practices
