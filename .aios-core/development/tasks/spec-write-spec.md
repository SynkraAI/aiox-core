# Spec Pipeline: Write Specification

> **Phase:** 4 - Write
> **Owner Agent:** @pm
> **Pipeline:** spec-pipeline

---

## Purpose

Produzir especificação completa e executável a partir dos artefatos das fases anteriores. O spec.md é o documento definitivo que guia a implementação - nenhuma invenção, apenas derivação dos inputs.

---

## autoClaude

```yaml
autoClaude:
  version: '3.0'
  pipelinePhase: spec-write

  elicit: false
  deterministic: true # Same inputs = same spec
  composable: true

  inputs:
    - name: storyId
      type: string
      required: true

    - name: requirements
      type: file
      path: docs/stories/{storyId}/spec/requirements.json
      required: true

    - name: complexity
      type: file
      path: docs/stories/{storyId}/spec/complexity.json
      required: false # Optional for SIMPLE

    - name: research
      type: file
      path: docs/stories/{storyId}/spec/research.json
      required: false # Optional for SIMPLE

  outputs:
    - name: spec.md
      type: file
      path: docs/stories/{storyId}/spec/spec.md
      template: spec-tmpl.md

  verification:
    type: manual
    next_phase: critique

  contextRequirements:
    projectContext: true
    filesContext: true
    implementationPlan: false
    spec: false
```

---

## Constitutional Gate: No Invention

> **Reference:** Constitution Article IV - No Invention (MUST)
> **Severity:** BLOCK
> **Enforcement:** Automatic validation before spec completion

```yaml
constitutional_gate:
  article: IV
  name: No Invention
  severity: BLOCK

  validation:
    - Every statement MUST trace to FR-*, NFR-*, CON-*, or research finding
    - No features not present in requirements.json
    - No technologies not validated in research.json
    - No acceptance criteria not derived from inputs

  on_violation:
    action: BLOCK
    message: |
      CONSTITUTIONAL VIOLATION: Article IV - No Invention
      Spec contains content not traceable to inputs.

      Violations found:
      {list_violations}

      Resolution: Remove invented content or add to Open Questions section.

  audit:
    log: true
    report_to: qa_critique_phase
```

### No Invention Rule Details

```yaml
no_invention_rule:
  description: |
    The spec writer MUST NOT invent or assume anything not present in inputs.
    Every statement in spec.md must trace back to:
    - A functional requirement (FR-*)
    - A non-functional requirement (NFR-*)
    - A constraint (CON-*)
    - A research finding (verified dependency)

  violations:
    - Adding features not in requirements
    - Assuming implementation details not researched
    - Specifying technologies not validated
    - Creating acceptance criteria not derived from requirements

  when_unclear:
    action: 'Add to Open Questions section instead of assuming'
```

---

## Spec Template Structure

````markdown
# Spec: {story-title}

> **Story ID:** {storyId}
> **Complexity:** {complexity.result}
> **Generated:** {timestamp}
> **Status:** Draft

---

## 1. Overview

{Brief description derived from functional requirements}

### 1.1 Goals

- {Goal derived from FR-\*}

### 1.2 Non-Goals

- {Explicitly out of scope items}

---

## 2. Requirements Summary

### 2.1 Functional Requirements

| ID   | Description   | Priority | Source            |
| ---- | ------------- | -------- | ----------------- |
| FR-1 | {description} | P0       | requirements.json |

### 2.2 Non-Functional Requirements

| ID    | Category   | Requirement   | Metric       |
| ----- | ---------- | ------------- | ------------ |
| NFR-1 | {category} | {description} | {measurable} |

### 2.3 Constraints

| ID    | Type   | Constraint    | Impact   |
| ----- | ------ | ------------- | -------- |
| CON-1 | {type} | {description} | {impact} |

---

## 3. Technical Approach

### 3.1 Architecture Overview

{High-level architecture derived from requirements and research}

### 3.2 Component Design

{Components needed, derived from scope analysis}

### 3.3 Data Flow

{How data moves through the system}

---

## 4. Dependencies

### 4.1 External Dependencies

| Dependency | Version   | Purpose   | Verified |
| ---------- | --------- | --------- | -------- |
| {name}     | {version} | {purpose} | ✅/⚠️    |

### 4.2 Internal Dependencies

| Module   | Purpose      |
| -------- | ------------ |
| {module} | {why needed} |

---

## 5. Files to Modify/Create

### 5.1 New Files

| File Path | Purpose   | Template |
| --------- | --------- | -------- |
| {path}    | {purpose} | {if any} |

### 5.2 Modified Files

| File Path | Changes        | Risk         |
| --------- | -------------- | ------------ |
| {path}    | {what changes} | Low/Med/High |

---

## 6. Testing Strategy

### 6.1 Unit Tests

| Test        | Covers       | Priority |
| ----------- | ------------ | -------- |
| {test name} | {FR-_/NFR-_} | P0/P1/P2 |

### 6.2 Integration Tests

| Test        | Components   | Scenario   |
| ----------- | ------------ | ---------- |
| {test name} | {components} | {scenario} |

### 6.3 Acceptance Tests (Given-When-Then)

```gherkin
Feature: {feature name}

  Scenario: {scenario from FR-* acceptance}
    Given {precondition}
    When {action}
    Then {expected result}
```
````

---

## 7. Risks & Mitigations

| Risk                                                      | Probability  | Impact       | Mitigation   |
| --------------------------------------------------------- | ------------ | ------------ | ------------ |
| {risk from complexity.flags or research.unverifiedClaims} | Low/Med/High | Low/Med/High | {mitigation} |

---

## 8. Open Questions

| ID   | Question   | Blocking | Assigned To |
| ---- | ---------- | -------- | ----------- |
| OQ-1 | {question} | Yes/No   | @{agent}    |

---

## 9. Implementation Checklist

- [ ] {Task derived from spec}
- [ ] {Task derived from spec}
- [ ] Write tests for FR-1
- [ ] Update documentation

---

## Metadata

- **Generated by:** @pm via spec-write-spec
- **Inputs:** requirements.json, complexity.json, research.json
- **Iteration:** 1

````

---

## Execution Flow

### Step 1: Load All Inputs

```yaml
load_inputs:
  action: gather_all_artifacts

  files:
    - requirements.json (required)
    - complexity.json (optional)
    - research.json (optional)

  validation:
    - Ensure requirements.json exists
    - Parse all JSON files
    - Build dependency graph
````

### Step 2: Generate Each Section

```yaml
generate_sections:
  overview:
    source: requirements.functional[*].description
    rules:
      - Synthesize main goal from FR-* descriptions
      - List non-goals from constraints or explicitly stated

  requirements_summary:
    source: requirements.json (all sections)
    rules:
      - Direct copy with formatting
      - Preserve IDs for traceability

  technical_approach:
    source: research.patterns + complexity.dimensions
    rules:
      - Use patterns from research.json
      - Architecture based on complexity scope
      - NO invention - only derived content

  dependencies:
    source: research.dependencies
    rules:
      - List only verified dependencies
      - Mark unverified with ⚠️
      - Include version from research

  files_to_modify:
    source: complexity.dimensions.scope + codebase analysis
    rules:
      - Estimate based on scope score
      - Reference existing patterns
      - Include risk assessment

  testing_strategy:
    source: requirements.functional[*].acceptance
    rules:
      - Convert acceptance criteria to Gherkin
      - One test per FR minimum
      - Include NFR tests where measurable

  risks:
    source: complexity.flags + research.unverifiedClaims
    rules:
      - Convert flags to risks
      - Unverified claims = risks
      - Include mitigation strategies

  open_questions:
    source: requirements.openQuestions + research.unverifiedClaims
    rules:
      - Preserve from requirements
      - Add any new questions from analysis
      - Mark blocking status
```

### Step 3: Validate Spec

```yaml
validation:
  action: verify_spec_completeness

  checks:
    - All FR-* referenced in spec
    - All NFR-* addressed in testing
    - All CON-* reflected in approach
    - All dependencies from research included
    - No invented content (traceability check)

  output:
    - valid: boolean
    - missing: string[] (if any)
    - warnings: string[]
```

### Step 4: Write Spec File

```yaml
write_output:
  action: create_spec_md
  path: docs/stories/{storyId}/spec/spec.md

  format: markdown
  template: spec-tmpl.md (if exists)
```

---

## Integration

### Command Integration (@pm)

```yaml
command:
  name: '*write-spec'
  syntax: '*write-spec {story-id}'
  agent: pm

  examples:
    - '*write-spec STORY-42'
```

### Pipeline Integration

```yaml
pipeline:
  phase: spec
  previous_phase: research
  next_phase: critique

  requires:
    - requirements.json

  optional:
    - complexity.json
    - research.json

  pass_to_next:
    - spec.md
    - requirements.json
    - complexity.json
    - research.json
```

---

## Error Handling

```yaml
errors:
  - id: missing-requirements
    condition: 'requirements.json not found'
    action: 'Halt - cannot write spec without requirements'
    blocking: true

  - id: empty-functional
    condition: 'No functional requirements'
    action: 'Halt - spec needs at least one FR'
    blocking: true

  - id: unverified-dependency
    condition: 'Dependency used but not in research.json'
    action: 'Add warning, mark in spec with ⚠️'
    blocking: false

  - id: no-acceptance-criteria
    condition: 'FR has no acceptance criteria'
    action: 'Add to Open Questions, generate suggested criteria'
    blocking: false
```

---

## Quality Checks

```yaml
quality_gates:
  - id: traceability
    description: 'Every spec statement traces to input'
    check: 'No orphan statements'

  - id: completeness
    description: 'All requirements addressed'
    check: 'FR count in spec == FR count in requirements'

  - id: testability
    description: 'Every FR has test strategy'
    check: 'Test section covers all FR-*'

  - id: no_invention
    description: 'No assumed content'
    check: 'All technical choices from research.json'
```

---

## Examples

### Example: Login Feature Spec

**Inputs:**

- requirements.json: FR-1 (Google OAuth login)
- complexity.json: STANDARD, score 13
- research.json: google-auth-library verified

**Generated Spec Excerpt:**

```markdown
## 3. Technical Approach

### 3.1 Architecture Overview

Authentication flow using Google OAuth 2.0:

1. User clicks "Login with Google"
2. Redirect to Google consent screen
3. Receive authorization code
4. Exchange for tokens (server-side)
5. Create/update user session

_Derived from FR-1 and research.json google-auth-library patterns_

## 4. Dependencies

| Dependency          | Version | Purpose              | Verified |
| ------------------- | ------- | -------------------- | -------- |
| google-auth-library | ^9.0.0  | OAuth token handling | ✅       |
| @auth/core          | ^0.18.0 | Session management   | ✅       |
```

---

## Metadata

```yaml
metadata:
  story: '3.4'
  epic: 'Epic 3 - Spec Pipeline'
  created: '2026-01-28'
  author: '@architect (Aria)'
  version: '1.0.0'
  tags:
    - spec-pipeline
    - specification
    - documentation
    - prompt-engineering
```

## Handoff
next_agent: @qa
next_command: *critique-spec {story-id}
condition: Spec written (spec.md created)
