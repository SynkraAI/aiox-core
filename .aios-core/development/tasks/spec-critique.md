# Spec Pipeline: Critique Specification

> **Phase:** 5 - Critique
> **Owner Agent:** @qa
> **Pipeline:** spec-pipeline

---

## Purpose

Validar e criticar a especificação antes da implementação. Avalia accuracy, completeness, consistency, feasibility e alignment. Produz verdict (APPROVED/NEEDS_REVISION/BLOCKED) e pode sugerir correções.

---

## autoClaude

```yaml
autoClaude:
  version: '3.0'
  pipelinePhase: spec-critique

  elicit: false
  deterministic: true
  composable: true

  selfCritique:
    required: true
    checklistRef: spec-quality-checklist.md

  inputs:
    - name: storyId
      type: string
      required: true

    - name: spec
      type: file
      path: docs/stories/{storyId}/spec/spec.md
      required: true

    - name: requirements
      type: file
      path: docs/stories/{storyId}/spec/requirements.json
      required: true

    - name: complexity
      type: file
      path: docs/stories/{storyId}/spec/complexity.json
      required: false

    - name: research
      type: file
      path: docs/stories/{storyId}/spec/research.json
      required: false

  outputs:
    - name: critique.json
      type: file
      path: docs/stories/{storyId}/spec/critique.json
      schema: critique-schema

  verification:
    type: gate
    blocking: true
    verdict_field: verdict

  contextRequirements:
    projectContext: true
    filesContext: true
    implementationPlan: false
    spec: true
```

---

## Critique Dimensions

### Dimension 1: Accuracy

```yaml
accuracy:
  description: 'Spec accurately reflects requirements'
  weight: 25%

  checks:
    - id: acc-1
      name: 'Requirement Coverage'
      question: 'Every FR-* from requirements.json is addressed in spec?'
      severity: HIGH

    - id: acc-2
      name: 'No Phantom Requirements'
      question: "Spec doesn't include features not in requirements?"
      severity: HIGH

    - id: acc-3
      name: 'Correct Priority Mapping'
      question: 'P0 requirements are prominent, P2 are optional?'
      severity: MEDIUM

    - id: acc-4
      name: 'NFR Addressed'
      question: 'All NFR-* have corresponding spec sections?'
      severity: MEDIUM

  scoring:
    5: 'All requirements accurately represented'
    4: 'Minor omissions, no misrepresentations'
    3: 'Some requirements unclear or incomplete'
    2: 'Significant gaps or misrepresentations'
    1: 'Major accuracy issues'
```

### Dimension 2: Completeness

```yaml
completeness:
  description: 'Spec has all necessary sections filled'
  weight: 25%

  checks:
    - id: comp-1
      name: 'All Sections Present'
      question: 'Overview, Requirements, Approach, Dependencies, Files, Testing, Risks all present?'
      severity: HIGH

    - id: comp-2
      name: 'Testing Coverage'
      question: 'Every FR has at least one test scenario?'
      severity: HIGH

    - id: comp-3
      name: 'Dependencies Listed'
      question: 'All external dependencies identified with versions?'
      severity: MEDIUM

    - id: comp-4
      name: 'Files Identified'
      question: 'New and modified files listed with purposes?'
      severity: MEDIUM

    - id: comp-5
      name: 'Risks Documented'
      question: 'At least potential risks considered?'
      severity: LOW

  scoring:
    5: 'Comprehensive, nothing missing'
    4: 'Minor gaps in non-critical sections'
    3: 'Some sections incomplete'
    2: 'Multiple sections missing or empty'
    1: 'Severely incomplete'
```

### Dimension 3: Consistency

```yaml
consistency:
  description: 'Spec is internally consistent'
  weight: 20%

  checks:
    - id: con-1
      name: 'ID References Valid'
      question: 'All FR-*/NFR-* references exist in requirements?'
      severity: HIGH

    - id: con-2
      name: 'Dependency Consistency'
      question: 'Dependencies in approach match dependencies section?'
      severity: MEDIUM

    - id: con-3
      name: 'Complexity Alignment'
      question: 'Spec depth matches complexity level?'
      severity: LOW

    - id: con-4
      name: 'No Contradictions'
      question: 'No conflicting statements between sections?'
      severity: HIGH

  scoring:
    5: 'Fully consistent throughout'
    4: 'Minor inconsistencies'
    3: 'Some contradictions or mismatches'
    2: 'Multiple inconsistencies'
    1: 'Fundamentally inconsistent'
```

### Dimension 4: Feasibility

```yaml
feasibility:
  description: 'Spec is technically feasible'
  weight: 15%

  checks:
    - id: feas-1
      name: 'Dependencies Available'
      question: 'All listed dependencies exist and are compatible?'
      severity: HIGH

    - id: feas-2
      name: 'Technical Approach Sound'
      question: 'Proposed architecture is achievable?'
      severity: HIGH

    - id: feas-3
      name: 'Reasonable Scope'
      question: 'Work fits within typical story scope?'
      severity: MEDIUM

    - id: feas-4
      name: 'No Impossible Requirements'
      question: 'All requirements are technically possible?'
      severity: HIGH

  scoring:
    5: 'Clearly feasible'
    4: 'Feasible with minor concerns'
    3: 'Questionable feasibility'
    2: 'Significant feasibility issues'
    1: 'Not feasible as specified'
```

### Dimension 5: Alignment

```yaml
alignment:
  description: 'Spec aligns with project standards'
  weight: 15%

  checks:
    - id: align-1
      name: 'Tech Stack Alignment'
      question: 'Technologies match project preferences?'
      severity: MEDIUM

    - id: align-2
      name: 'Pattern Alignment'
      question: 'Proposed patterns match existing codebase?'
      severity: MEDIUM

    - id: align-3
      name: 'Naming Conventions'
      question: 'File/component names follow conventions?'
      severity: LOW

    - id: align-4
      name: 'Architecture Fit'
      question: 'Fits within existing architecture?'
      severity: HIGH

  scoring:
    5: 'Perfect alignment'
    4: 'Minor deviations with justification'
    3: 'Some misalignments'
    2: 'Significant deviations'
    1: 'Fundamentally misaligned'
```

---

## Verdict Logic

```yaml
verdict_rules:
  APPROVED:
    condition: |
      - No HIGH severity issues
      - Average score >= 4.0
      - All dimensions >= 3
    meaning: 'Spec ready for implementation'
    next_action: 'Proceed to plan phase'

  NEEDS_REVISION:
    condition: |
      - Has MEDIUM severity issues OR
      - Average score between 3.0-3.9 OR
      - Any dimension < 3 but no HIGH issues
    meaning: 'Spec needs improvements before implementation'
    next_action: 'Return to spec-write with feedback'

  BLOCKED:
    condition: |
      - Has HIGH severity issues OR
      - Average score < 3.0 OR
      - Any dimension <= 1
    meaning: 'Spec has critical issues'
    next_action: 'Escalate to @architect or return to gather'
```

---

## Execution Flow

### Step 1: Load Artifacts

```yaml
load:
  action: gather_all_spec_artifacts

  files:
    - spec.md (required)
    - requirements.json (required)
    - complexity.json (optional)
    - research.json (optional)
```

### Step 2: Run Dimension Checks

```yaml
run_checks:
  for_each: dimension in [accuracy, completeness, consistency, feasibility, alignment]

  process: 1. Execute each check in dimension
    2. Record findings (pass/fail)
    3. Assign severity to failures
    4. Calculate dimension score
```

### Step 3: Generate Issues

```yaml
generate_issues:
  for_each: failed_check

  template: |
    {
      "id": "CRIT-{n}",
      "severity": "{HIGH|MEDIUM|LOW}",
      "category": "{dimension}",
      "check": "{check_id}",
      "description": "{what's wrong}",
      "location": "spec.md#{section}",
      "suggestion": "{how to fix}",
      "autoFixable": true|false
    }
```

### Step 4: Calculate Verdict

```yaml
calculate_verdict:
  action: determine_verdict

  process: 1. Count issues by severity
    2. Calculate average score
    3. Check minimum dimension scores
    4. Apply verdict rules
```

### Step 5: Generate Output

```yaml
generate_output:
  action: create_critique_json

  template: |
    {
      "storyId": "{storyId}",
      "critiquedAt": "{timestamp}",
      "critiquedBy": "@qa",
      "specVersion": 1,

      "verdict": "APPROVED|NEEDS_REVISION|BLOCKED",
      "verdictReason": "{summary}",

      "scores": {
        "accuracy": {score},
        "completeness": {score},
        "consistency": {score},
        "feasibility": {score},
        "alignment": {score},
        "average": {weighted_average}
      },

      "issues": [
        {
          "id": "CRIT-1",
          "severity": "HIGH|MEDIUM|LOW",
          "category": "{dimension}",
          "description": "{issue}",
          "location": "{spec.md#section}",
          "suggestion": "{fix}",
          "autoFixable": true|false
        }
      ],

      "summary": {
        "highIssues": {count},
        "mediumIssues": {count},
        "lowIssues": {count},
        "autoFixable": {count}
      },

      "nextAction": "{what to do}",

      "autoFixes": [
        {
          "issueId": "CRIT-{n}",
          "location": "{file:line}",
          "original": "{text}",
          "suggested": "{text}"
        }
      ]
    }
```

---

## Output Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["storyId", "critiquedAt", "verdict", "scores", "issues"],
  "properties": {
    "storyId": { "type": "string" },
    "critiquedAt": { "type": "string", "format": "date-time" },
    "critiquedBy": { "type": "string", "default": "@qa" },
    "specVersion": { "type": "integer", "minimum": 1 },
    "verdict": { "enum": ["APPROVED", "NEEDS_REVISION", "BLOCKED"] },
    "verdictReason": { "type": "string" },
    "scores": {
      "type": "object",
      "required": [
        "accuracy",
        "completeness",
        "consistency",
        "feasibility",
        "alignment",
        "average"
      ],
      "properties": {
        "accuracy": { "type": "number", "minimum": 1, "maximum": 5 },
        "completeness": { "type": "number", "minimum": 1, "maximum": 5 },
        "consistency": { "type": "number", "minimum": 1, "maximum": 5 },
        "feasibility": { "type": "number", "minimum": 1, "maximum": 5 },
        "alignment": { "type": "number", "minimum": 1, "maximum": 5 },
        "average": { "type": "number", "minimum": 1, "maximum": 5 }
      }
    },
    "issues": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "severity", "category", "description"],
        "properties": {
          "id": { "type": "string", "pattern": "^CRIT-\\d+$" },
          "severity": { "enum": ["HIGH", "MEDIUM", "LOW"] },
          "category": {
            "enum": ["accuracy", "completeness", "consistency", "feasibility", "alignment"]
          },
          "description": { "type": "string" },
          "location": { "type": "string" },
          "suggestion": { "type": "string" },
          "autoFixable": { "type": "boolean" }
        }
      }
    },
    "summary": { "type": "object" },
    "nextAction": { "type": "string" },
    "autoFixes": { "type": "array" }
  }
}
```

---

## Integration

### Command Integration (@qa)

```yaml
command:
  name: '*critique-spec'
  syntax: '*critique-spec {story-id} [--auto-fix]'
  agent: qa

  flags:
    --auto-fix: 'Apply auto-fixable suggestions'

  examples:
    - '*critique-spec STORY-42'
    - '*critique-spec STORY-42 --auto-fix'
```

### Pipeline Integration

```yaml
pipeline:
  phase: critique
  previous_phase: spec
  next_phase: plan (if APPROVED)

  requires:
    - spec.md
    - requirements.json

  optional:
    - complexity.json
    - research.json

  gate: true  # Blocking gate

  on_verdict:
    APPROVED:
      action: continue_to_plan
    NEEDS_REVISION:
      action: return_to_spec_write
      pass: [critique.json, autoFixes]
    BLOCKED:
      action: halt
      escalate_to: @architect
```

---

## Error Handling

```yaml
errors:
  - id: missing-spec
    condition: 'spec.md not found'
    action: 'Halt - cannot critique without spec'
    blocking: true

  - id: missing-requirements
    condition: 'requirements.json not found'
    action: 'Halt - cannot validate accuracy'
    blocking: true

  - id: parse-error
    condition: 'spec.md malformed'
    action: 'Log parse issues, attempt partial critique'
    blocking: false
```

---

## Examples

### Example: Critique with Issues

**Input:** spec.md missing test section

**Output:**

```json
{
  "storyId": "STORY-42",
  "verdict": "NEEDS_REVISION",
  "verdictReason": "Missing test coverage for 2 functional requirements",
  "scores": {
    "accuracy": 5,
    "completeness": 3,
    "consistency": 4,
    "feasibility": 4,
    "alignment": 4,
    "average": 4.0
  },
  "issues": [
    {
      "id": "CRIT-1",
      "severity": "HIGH",
      "category": "completeness",
      "description": "FR-1 (Google OAuth) has no test scenarios",
      "location": "spec.md#section-6",
      "suggestion": "Add Given-When-Then test for OAuth flow",
      "autoFixable": true
    }
  ],
  "nextAction": "Return to spec-write with critique.json"
}
```

---

## Metadata

```yaml
metadata:
  story: '3.5'
  epic: 'Epic 3 - Spec Pipeline'
  created: '2026-01-28'
  author: '@architect (Aria)'
  version: '1.0.0'
  tags:
    - spec-pipeline
    - critique
    - quality-gate
    - qa
```

## Handoff
next_agent: @architect
next_command: *plan
condition: Critique verdict is APPROVED
alternatives:
  - agent: @pm, command: *write-spec, condition: Critique verdict is NEEDS_REVISION
  - agent: @architect, command: *analyze-impact, condition: Critique verdict is BLOCKED
