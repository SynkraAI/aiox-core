# Task: Create Checklist from SOP

## Task Anatomy

| Field | Value |
|-------|-------|
| **Task ID** | `create-checklist` |
| **Version** | `1.0.0` |
| **Status** | `active` |
| **Responsible Executor** | `sop-creator` |
| **Execution Type** | `Agent` |

## Metadata
```yaml
id: create-checklist
name: "Create Checklist from SOP"
category: creation
agent: sop-creator
elicit: false
autonomous: true
description: "Generate a focused operational checklist from an existing SOP. Applies Atul Gawande's Checklist Manifesto principles: brevity, single-action items, DO-CONFIRM or READ-DO format, and critical pause points."
```

## Purpose

Extract a concise, actionable checklist from a full SOP. While SOPs are comprehensive reference documents, checklists are execution tools designed for use in the field. Following Gawande's research from aviation and surgery, an effective checklist catches the errors that even experts make under pressure. This task distills an SOP down to its critical verification points.

The checklist does NOT replace the SOP. It complements it by providing a quick-reference execution or verification aid.

## Prerequisites

- [ ] Source SOP file exists and is accessible
- [ ] Source SOP has a populated Procedure section with identifiable steps
- [ ] Checklist type determined (pre-flight, execution, verification, or audit)

## Inputs

```yaml
inputs:
  sop_file:
    type: filepath
    required: true
    description: "Path to the source SOP file (Markdown or YAML)"

  checklist_type:
    type: enum
    required: true
    options: [pre-flight, execution, verification, audit]
    description: >
      Type of checklist to generate:
      - pre-flight: Items to verify BEFORE starting the process
      - execution: Items to check DURING process execution (step-by-step)
      - verification: Items to verify AFTER process completion
      - audit: Items for periodic compliance audit of the process
```

## Workflow / Steps

### 1. Parse SOP

```
ACTION: Read and analyze the source SOP file

EXTRACT:
  - Process name and ID
  - All procedure steps (numbered actions)
  - Decision points and their branches
  - Prerequisites and materials
  - Error handling steps
  - Quality control / verification points
  - Roles involved (from RACI if available)
  - Critical steps (safety, compliance, irreversible actions)
  - Time-sensitive steps

STORE: sop_analysis = {
  process_name, step_count, decision_count,
  critical_steps, verification_points,
  roles, materials, error_paths
}
```

### 2. Extract Checkable Items

```
ACTION: Filter SOP content based on checklist_type

FOR pre-flight:
  - Extract all prerequisites
  - Extract all materials/equipment requirements
  - Extract access/permission requirements
  - Extract environmental conditions
  - Add: "Team briefed on procedure" if multiple roles
  - Add: "Emergency contacts available" if safety-critical

FOR execution:
  - Extract each procedure step as a checkable action
  - Preserve critical decision points
  - Include expected outcomes for verification steps
  - Flag irreversible steps with WARNING marker

FOR verification:
  - Extract all quality control points
  - Extract all expected outcomes
  - Extract all acceptance criteria
  - Add: "All outputs saved/documented"
  - Add: "Stakeholders notified of completion"

FOR audit:
  - Extract compliance requirements
  - Extract documentation requirements
  - Extract training requirements
  - Extract review/approval requirements
  - Add: "SOP version is current"
  - Add: "All operators trained on current version"

RULES:
  - Each item = ONE verifiable action or condition
  - No compound items ("Check X and Y" -> two items)
  - Items must be binary: done/not done, yes/no, pass/fail
  - Use action verbs for execution items
  - Use verification verbs for check items (Confirm, Verify, Ensure)
```

### 3. Organize by Phase

```
ACTION: Group checklist items into logical phases

STRUCTURE:
  phases:
    - name: "<Phase Name>"
      items:
        - text: "<checkable item>"
          critical: <true|false>
          role: "<responsible role>"
          note: "<optional context>"

GROUPING LOGIC:
  - Group by process phase (Setup, Execute, Verify, Close)
  - Within each phase, order by execution sequence
  - Mark critical items (safety, compliance, irreversible)
  - Add separator lines between phases

TARGET: Maximum 3-5 phases, 5-9 items per phase (working memory limits)
```

### 4. Apply Gawande Principles

```
ACTION: Refine checklist against The Checklist Manifesto principles

GAWANDE'S PRINCIPLES:
  a) Format Selection
     - DO-CONFIRM: Team does tasks from memory, then pauses to
       confirm all items complete. Best for: experienced teams,
       routine processes.
     - READ-DO: Read each item, then do it in sequence.
       Best for: complex/infrequent processes, training situations.
     SELECT format based on: audience experience + process frequency + risk level

  b) Brevity
     - Fits on ONE PAGE (single side) if possible
     - 5-9 items per section (Miller's Law: 7 +/- 2)
     - Each item: 1 line, max 2 lines
     - No explanatory text (that belongs in the SOP)

  c) Clarity
     - Simple, exact language
     - No jargon unless defined in SOP
     - Use sans-serif font recommendation for print
     - Uppercase for critical warnings

  d) Pause Points
     - Insert PAUSE POINT markers before:
       * Irreversible actions
       * Safety-critical steps
       * Compliance verification steps
       * Handoff points between roles
     - Pause point = mandatory stop, verbal confirmation required

  e) Testing
     - Recommend a "dry run" with the checklist before live use
     - Include revision date and feedback mechanism

VALIDATION:
  - Total items <= 30 (hard limit)
  - Each item readable in < 5 seconds
  - No item requires external reference to understand
  - Critical items are visually distinct
```

### 5. Output

```
ACTION: Generate the checklist file

FORMAT:
  # Checklist: {Process Name} - {Type}

  **Source SOP:** {sop_file}
  **Format:** {DO-CONFIRM | READ-DO}
  **Version:** 1.0.0
  **Date:** {ISO-8601}
  **Total Items:** {count}

  ---

  ## Phase 1: {Phase Name}

  - [ ] {Item text}
  - [ ] {Item text}
  - [ ] **CRITICAL:** {Critical item text}
  - [ ] {Item text}

  ---
  **>>> PAUSE POINT: {reason} <<<**
  ---

  ## Phase 2: {Phase Name}
  ...

  ---

  **Completed by:** _______________  **Date:** ___________
  **Verified by:**  _______________  **Date:** ___________

FILE: outputs/sop-factory/checklists/{process-name}-{type}-checklist-v{version}.md
```

## Output

```yaml
outputs:
  primary:
    path: "outputs/sop-factory/checklists/{process-name}-{type}-checklist-v{version}.md"
    format: markdown
    description: "Operational checklist derived from source SOP"

  metadata:
    source_sop: "<filepath>"
    checklist_type: "<pre-flight|execution|verification|audit>"
    format: "<DO-CONFIRM|READ-DO>"
    total_items: "<number>"
    critical_items: "<number>"
    pause_points: "<number>"
    fits_one_page: "<true|false>"
```

## Acceptance Criteria

- [ ] Each item is a single, verifiable action or condition
- [ ] Checklist fits on one page (ideally) or two pages maximum
- [ ] DO-CONFIRM or READ-DO format is explicitly specified
- [ ] Pause points are included before all critical/irreversible steps
- [ ] Total items do not exceed 30
- [ ] Items are grouped into logical phases (3-5 phases)
- [ ] Critical items are visually distinct (bold, uppercase, or marked)
- [ ] Source SOP is referenced in the header
- [ ] Sign-off fields are included (completed by, verified by)
- [ ] No item requires external reference to understand

## Veto Conditions

- STOP if source SOP file does not exist or is unreadable
- STOP if source SOP has no identifiable procedure steps
- STOP if the process has fewer than 3 steps (checklist adds no value)
- STOP if checklist would exceed 50 items (SOP needs to be split first)
