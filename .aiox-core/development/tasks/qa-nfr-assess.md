<!-- Powered by AIOX™ Core -->

---
tools:
  - browser           # Performance testing and UI validation
  - supabase          # Database reliability and data validation
  - github-cli        # Security review and code analysis
  - context7          # Research NFR best practices
checklists:
  - architect-master-checklist.md
---

# nfr-assess

Quick NFR validation focused on the core four: security, performance, reliability, maintainability.

## Inputs

```yaml
required:
  - story_id: '{epic}.{story}' # e.g., "1.3"
  - story_path: `aiox-core/core-config.yaml` for the `devStoryLocation`

optional:
  - architecture_refs: `aiox-core/core-config.yaml` for the `architecture.architectureFile`
  - technical_preferences: `aiox-core/core-config.yaml` for the `technicalPreferences`
  - acceptance_criteria: From story file
```

## Purpose

Assess non-functional requirements for a story and generate:

1. YAML block for the gate file's `nfr_validation` section
2. Brief markdown assessment saved to `qa.qaLocation/assessments/{epic}.{story}-nfr-{YYYYMMDD}.md`

## Process

### 0. Fail-safe for Missing Inputs

If story_path or story file can't be found:

- Still create assessment file with note: "Source story not found"
- Set all selected NFRs to CONCERNS with notes: "Target unknown / evidence missing"
- Continue with assessment to provide value

### 1. Elicit Scope

**Interactive mode:** Ask which NFRs to assess
**Non-interactive mode:** Default to core four (security, performance, reliability, maintainability)

```text
Which NFRs should I assess? (Enter numbers or press Enter for default)
[1] Security (default)
[2] Performance (default)
[3] Reliability (default)
[4] Maintainability (default)
[5] Usability
[6] Compatibility
[7] Portability
[8] Functional Suitability

> [Enter for 1-4]
```

### 2. Check for Thresholds

Look for NFR requirements in:

- Story acceptance criteria
- `docs/architecture/*.md` files
- `docs/technical-preferences.md`

**Interactive mode:** Ask for missing thresholds
**Non-interactive mode:** Mark as CONCERNS with "Target unknown"

```text
No performance requirements found. What's your target response time?
> 200ms for API calls

No security requirements found. Required auth method?
> JWT with refresh tokens
```

**Unknown targets policy:** If a target is missing and not provided, mark status as CONCERNS with notes: "Target unknown"

### 3. Quick Assessment

For each selected NFR, check:

- Is there evidence it's implemented?
- Can we validate it?
- Are there obvious gaps?

### 4. Generate Outputs

## Output 1: Gate YAML Block

Generate ONLY for NFRs actually assessed (no placeholders):

```yaml
# Gate YAML (copy/paste):
nfr_validation:
  _assessed: [security, performance, reliability, maintainability]
  security:
    status: CONCERNS
    notes: 'No rate limiting on auth endpoints'
  performance:
    status: PASS
    notes: 'Response times < 200ms verified'
  reliability:
    status: PASS
    notes: 'Error handling and retries implemented'
  maintainability:
    status: CONCERNS
    notes: 'Test coverage at 65%, target is 80%'
```

## Deterministic Status Rules

- **FAIL**: Any selected NFR has critical gap or target clearly not met
- **CONCERNS**: No FAILs, but any NFR is unknown/partial/missing evidence
- **PASS**: All selected NFRs meet targets with evidence

## Quality Score Calculation

```
quality_score = 100
- 20 for each FAIL attribute
- 10 for each CONCERNS attribute
Floor at 0, ceiling at 100
```

If `technical-preferences.md` defines custom weights, use those instead.

## Output 2: Brief Assessment Report

**ALWAYS save to:** `qa.qaLocation/assessments/{epic}.{story}-nfr-{YYYYMMDD}.md`

```markdown
# NFR Assessment: {epic}.{story}

Date: {date}
Reviewer: Quinn

<!-- Note: Source story not found (if applicable) -->

## Summary

- Security: CONCERNS - Missing rate limiting
- Performance: PASS - Meets <200ms requirement
- Reliability: PASS - Proper error handling
- Maintainability: CONCERNS - Test coverage below target

## Critical Issues

1. **No rate limiting** (Security)
   - Risk: Brute force attacks possible
   - Fix: Add rate limiting middleware to auth endpoints

2. **Test coverage 65%** (Maintainability)
   - Risk: Untested code paths
   - Fix: Add tests for uncovered branches

## Quick Wins

- Add rate limiting: ~2 hours
- Increase test coverage: ~4 hours
- Add performance monitoring: ~1 hour
```

## Output 3: Story Update Line

**End with this line for the review task to quote:**

```
NFR assessment: qa.qaLocation/assessments/{epic}.{story}-nfr-{YYYYMMDD}.md
```

## Output 4: Gate Integration Line

**Always print at the end:**

```
Gate NFR block ready → paste into qa.qaLocation/gates/{epic}.{story}-{slug}.yml under nfr_validation
```

## Assessment Criteria

### Security

**PASS if:**

- Authentication implemented
- Authorization enforced
- Input validation present
- No hardcoded secrets

**CONCERNS if:**

- Missing rate limiting
- Weak encryption
- Incomplete authorization

**FAIL if:**

- No authentication
- Hardcoded credentials
- SQL injection vulnerabilities

### Performance

**PASS if:**

- Meets response time targets
- No obvious bottlenecks
- Reasonable resource usage

**CONCERNS if:**

- Close to limits
- Missing indexes
- No caching strategy

**FAIL if:**

- Exceeds response time limits
- Memory leaks
- Unoptimized queries

### Reliability

**PASS if:**

- Error handling present
- Graceful degradation
- Retry logic where needed

**CONCERNS if:**

- Some error cases unhandled
- No circuit breakers
- Missing health checks

**FAIL if:**

- No error handling
- Crashes on errors
- No recovery mechanisms

### Maintainability

**PASS if:**

- Test coverage meets target
- Code well-structured
- Documentation present

**CONCERNS if:**

- Test coverage below target
- Some code duplication
- Missing documentation

**FAIL if:**

- No tests
- Highly coupled code
- No documentation

## Quick Reference

### What to Check

```yaml
security:
  - Authentication mechanism
  - Authorization checks
  - Input validation
  - Secret management
  - Rate limiting

performance:
  - Response times
  - Database queries
  - Caching usage
  - Resource consumption

reliability:
  - Error handling
  - Retry logic
  - Circuit breakers
  - Health checks
  - Logging

maintainability:
  - Test coverage
  - Code structure
  - Documentation
  - Dependencies
```

## Key Principles

- Focus on the core four NFRs by default
- Quick assessment, not deep analysis
- Gate-ready output format
- Brief, actionable findings
- Skip what doesn't apply
- Deterministic status rules for consistency
- Unknown targets → CONCERNS, not guesses

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
task: qaNfrAssess()
responsável: Quinn (Guardian)
responsavel_type: Agente
atomic_layer: Strategy

**Entrada:**
- campo: target
  tipo: string
  origem: User Input
  obrigatório: true
  validação: Must exist

- campo: criteria
  tipo: array
  origem: config
  obrigatório: true
  validação: Non-empty validation criteria

- campo: strict
  tipo: boolean
  origem: User Input
  obrigatório: false
  validação: Default: true

**Saída:**
- campo: validation_result
  tipo: boolean
  destino: Return value
  persistido: false

- campo: errors
  tipo: array
  destino: Memory
  persistido: false

- campo: report
  tipo: object
  destino: File (.ai/*.json)
  persistido: true
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Validation rules loaded; target available for validation
    tipo: pre-condition
    blocker: true
    validação: |
      Check validation rules loaded; target available for validation
    error_message: "Pre-condition failed: Validation rules loaded; target available for validation"
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] Validation executed; results accurate; report generated
    tipo: post-condition
    blocker: true
    validação: |
      Verify validation executed; results accurate; report generated
    error_message: "Post-condition failed: Validation executed; results accurate; report generated"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] Validation rules applied; pass/fail accurate; actionable feedback
    tipo: acceptance-criterion
    blocker: true
    validação: |
      Assert validation rules applied; pass/fail accurate; actionable feedback
    error_message: "Acceptance criterion not met: Validation rules applied; pass/fail accurate; actionable feedback"
```

---

## Tools

**External/shared resources used by this task:**

- **Tool:** validation-engine
  - **Purpose:** Rule-based validation and reporting
  - **Source:** .aiox-core/utils/validation-engine.js

- **Tool:** schema-validator
  - **Purpose:** JSON/YAML schema validation
  - **Source:** ajv or similar

---

## Scripts

**Agent-specific code for this task:**

- **Script:** run-validation.js
  - **Purpose:** Execute validation rules and generate report
  - **Language:** JavaScript
  - **Location:** .aiox-core/scripts/run-validation.js

---

## Error Handling

**Strategy:** fallback

**Common Errors:**

1. **Error:** Validation Criteria Missing
   - **Cause:** Required validation rules not defined
   - **Resolution:** Ensure validation criteria loaded from config
   - **Recovery:** Use default validation rules, log warning

2. **Error:** Invalid Schema
   - **Cause:** Target does not match expected schema
   - **Resolution:** Update schema or fix target structure
   - **Recovery:** Detailed validation error report

3. **Error:** Dependency Missing
   - **Cause:** Required dependency for validation not found
   - **Resolution:** Install missing dependencies
   - **Recovery:** Abort with clear dependency list

---

## Performance

**Expected Metrics:**

```yaml
duration_expected: 5-20 min (estimated)
cost_estimated: $0.003-0.015
token_usage: ~2,000-8,000 tokens
```

**Optimization Notes:**
- Iterative analysis with depth limits; cache intermediate results; batch similar operations

---

## Metadata

```yaml
story: N/A
version: 1.0.0
dependencies:
  - N/A
tags:
  - quality-assurance
  - testing
updated_at: 2025-11-17
```

---


## Appendix: ISO 25010 Reference

<details>
<summary>Full ISO 25010 Quality Model (click to expand)</summary>

### All 8 Quality Characteristics

1. **Functional Suitability**: Completeness, correctness, appropriateness
2. **Performance Efficiency**: Time behavior, resource use, capacity
3. **Compatibility**: Co-existence, interoperability
4. **Usability**: Learnability, operability, accessibility
5. **Reliability**: Maturity, availability, fault tolerance
6. **Security**: Confidentiality, integrity, authenticity
7. **Maintainability**: Modularity, reusability, testability
8. **Portability**: Adaptability, installability

Use these when assessing beyond the core four.

</details>

<details>
<summary>Example: Deep Performance Analysis (click to expand)</summary>

```yaml
performance_deep_dive:
  response_times:
    p50: 45ms
    p95: 180ms
    p99: 350ms
  database:
    slow_queries: 2
    missing_indexes: ['users.email', 'orders.user_id']
  caching:
    hit_rate: 0%
    recommendation: 'Add Redis for session data'
  load_test:
    max_rps: 150
    breaking_point: 200 rps
```

</details>
 