# Task: Create Human-Readable SOP

## Task Anatomy

| Field | Value |
|-------|-------|
| **Task ID** | `create-sop-human` |
| **Version** | `1.0.0` |
| **Status** | `active` |
| **Responsible Executor** | `sop-creator` |
| **Execution Type** | `Agent` |

## Metadata
```yaml
id: create-sop-human
name: "Create Human-Readable SOP"
category: creation
agent: sop-creator
elicit: true
autonomous: false
description: "Create a complete, FDA/GMP-grade Standard Operating Procedure optimized for human consumption. Applies readability standards, visual elements, RACI definitions, and compliance formatting."
```

## Purpose

Create a world-class human-readable SOP from process information gathered through elicitation. The output follows FDA/GMP document structure (the gold standard for regulated SOPs) while maintaining an 8th-grade readability level to ensure universal comprehension. Integrates visual elements (Mermaid flowcharts, decision trees) and enforces action-verb step construction per Gawande's checklist principles.

This task produces the **human-facing** SOP. For AI/ML-consumable output, use `create-sop-ml`.

## Prerequisites

- [ ] Process name and description available
- [ ] Audience identified (operator, manager, or executive)
- [ ] Compliance requirements known (if applicable)
- [ ] Subject matter expert or process owner accessible for elicitation

## Inputs

```yaml
inputs:
  process_name:
    type: string
    required: true
    description: "Name of the process to document (e.g., 'Customer Onboarding', 'Server Deployment')"

  process_description:
    type: string
    required: true
    description: "Detailed description of the process including purpose, frequency, and context"

  audience:
    type: enum
    required: false
    default: operator
    options: [operator, manager, executive]
    description: "Primary audience for the SOP. Operator = step-by-step detail. Manager = oversight focus. Executive = summary with KPIs."

  industry:
    type: string
    required: false
    description: "Industry context for terminology and compliance alignment (e.g., 'healthcare', 'manufacturing', 'fintech')"

  compliance_standard:
    type: enum
    required: false
    options: [iso-9001, fda-gmp, osha, none]
    description: "Compliance standard to align the SOP format and content against"
```

## Workflow / Steps

### 1. Gather Requirements

```
ELICIT from user:
  1. What is the process name and its business purpose?
  2. Who performs this process? (roles involved)
  3. How often is this process executed? (frequency)
  4. What triggers this process? (event, schedule, request)
  5. What are the expected inputs and outputs?
  6. What tools, systems, or equipment are required?
  7. What can go wrong? (known failure modes)
  8. Are there regulatory or compliance requirements?
  9. Who is the process owner / approver?
  10. What is the audience level? (operator/manager/executive)

STORE: requirements = {
  process_name, purpose, roles, frequency, trigger,
  inputs, outputs, tools, failure_modes,
  compliance, owner, audience
}
```

### 2. Structure Analysis

```
ACTION: Decompose the process into atomic components
IDENTIFY:
  - Sequential steps (ordered actions)
  - Decision points (if/then branches)
  - Parallel paths (simultaneous activities)
  - Loops (repeated actions until condition)
  - Handoffs (role transitions)
  - Wait states (approvals, external dependencies)
  - Error paths (what happens on failure)

OUTPUT: Process structure map with:
  - step_count: <number>
  - decision_points: <number>
  - roles_involved: [<role names>]
  - tools_required: [<tool names>]
  - estimated_duration: <time range>
  - complexity_grade: simple|moderate|complex
```

### 3. Draft SOP

```
ACTION: Apply FDA/GMP template structure with all 11 sections

SECTION STRUCTURE:
  1. Header Block
     - SOP Title, SOP Number, Version, Effective Date
     - Department, Process Owner, Prepared By, Approved By
     - Review Cycle, Classification (Confidential/Internal/Public)

  2. Purpose
     - Single paragraph: why this SOP exists
     - Business impact of non-compliance

  3. Scope
     - What this SOP covers and does NOT cover
     - Applicable roles, departments, systems

  4. Definitions & Abbreviations
     - Every technical term defined
     - Industry jargon translated to plain language

  5. Responsibilities (RACI Matrix)
     - Responsible: who does the work
     - Accountable: who signs off
     - Consulted: who provides input
     - Informed: who needs to know

  6. Materials & Equipment
     - Tools, systems, software required
     - Access permissions needed
     - Safety equipment (if applicable)

  7. Procedure (Core Steps)
     - Every step starts with an ACTION VERB
     - One action per step (atomic)
     - Include expected result for each step
     - Decision points as IF/THEN
     - Warnings/cautions BEFORE the step they apply to
     - Time estimates per step or phase

  8. Error Handling & Troubleshooting
     - Common failure modes and remediation
     - Escalation path with contact information
     - Recovery procedures

  9. Quality Control & Verification
     - How to verify the process completed correctly
     - Acceptance criteria
     - Sampling procedures (if applicable)

  10. References & Related Documents
      - Related SOPs, policies, regulations
      - Training materials
      - External standards

  11. Revision History
      - Version, date, author, change description
      - Approval signatures

RULES:
  - Every step MUST begin with an action verb (Open, Click, Verify, Record, etc.)
  - Maximum 1 action per numbered step
  - Warnings/Notes appear BEFORE the step (not after)
  - Use present tense, active voice
  - No compound sentences in procedure steps
  - Include expected outcome for critical steps: "Expected result: [X]"
```

### 4. Add Visual Elements

```
ACTION: Create visual aids using Mermaid syntax

REQUIRED VISUALS:
  a) Process Flowchart
     - Main flow with decision diamonds
     - Error paths in red/dashed lines
     - Swim lanes for multiple roles

  b) Decision Tree (if >2 decision points)
     - Clear YES/NO branches
     - Terminal nodes with action or escalation

  c) RACI Matrix Table
     - Rows = process steps
     - Columns = roles
     - Cells = R/A/C/I

OPTIONAL VISUALS (if complexity warrants):
  d) Timeline / Gantt for time-sensitive processes
  e) Equipment diagram for physical processes

FORMAT: All visuals as ```mermaid code blocks for portability
```

### 5. Internal Review

```
ACTION: Self-review against SOP Quality Checklist

CHECKLIST:
  [ ] All 11 FDA/GMP sections present and complete
  [ ] Every procedure step starts with an action verb
  [ ] Readability grade <= 8th grade (Flesch-Kincaid)
  [ ] No passive voice in procedure steps
  [ ] RACI matrix complete for all roles
  [ ] Error handling covers all identified failure modes
  [ ] Visual elements (flowchart, decision tree) present
  [ ] Version control header populated
  [ ] Definitions section covers all jargon
  [ ] Time estimates included
  [ ] Escalation path defined with contacts
  [ ] No ambiguous language ("as needed", "if appropriate")
  [ ] Cross-references to related SOPs verified

IF any check fails: revise and re-check before output
```

### 6. Output

```
ACTION: Save completed SOP to output directory

FILE: outputs/sop-factory/human/{process-name}-sop-v{version}.md
FORMAT: Markdown with Mermaid blocks

METADATA HEADER (YAML front matter):
  ---
  sop_id: "{process-name}-sop"
  version: "1.0.0"
  status: "draft"
  created: "<ISO-8601>"
  author: "sop-creator"
  process_owner: "<from elicitation>"
  audience: "<operator|manager|executive>"
  compliance: "<standard or 'none'>"
  readability_grade: <number>
  step_count: <number>
  estimated_duration: "<range>"
  ---

ALSO GENERATE:
  - Summary card (1-page overview for executive audience)
  - Change log entry
```

## Output

```yaml
outputs:
  primary:
    path: "outputs/sop-factory/human/{process-name}-sop-v{version}.md"
    format: markdown
    description: "Complete human-readable SOP with all 11 FDA/GMP sections"

  secondary:
    - path: "outputs/sop-factory/human/{process-name}-summary.md"
      format: markdown
      description: "One-page executive summary card"

  metadata:
    readability_grade: "<Flesch-Kincaid grade level>"
    section_count: 11
    step_count: "<total procedure steps>"
    visual_count: "<number of diagrams>"
    compliance_aligned: "<standard or 'none'>"
```

## Acceptance Criteria

- [ ] All 11 FDA/GMP sections are present and populated
- [ ] Readability grade is at or below 8th grade level (Flesch-Kincaid)
- [ ] Every procedure step begins with an action verb
- [ ] RACI matrix is defined for all identified roles
- [ ] Error handling section covers all known failure modes
- [ ] At least one Mermaid flowchart is included
- [ ] Decision trees are present for all branching logic
- [ ] Version control header is complete (version, date, author, approver)
- [ ] No ambiguous language in procedure steps
- [ ] Time estimates are included for each phase or step
- [ ] Escalation path is defined with specific contacts/roles

## Veto Conditions

- STOP if process description is too vague to extract concrete steps (fewer than 3 identifiable actions)
- STOP if no process owner or accountable role can be identified
- STOP if compliance standard is specified but requirements cannot be met with available information
- STOP if elicitation yields contradictory information that cannot be resolved
- STOP if the process involves safety-critical steps and no error handling can be defined
