<!--
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
task: qaRiskProfile()
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

**Strategy:** retry

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

 Powered by AIOX™ Core -->

---
tools:
  - github-cli        # Code analysis and historical risk patterns
  - context7          # Research security vulnerabilities and patterns
  - exa               # Research similar implementation risks
checklists:
  - architect-master-checklist.md
---

# risk-profile

Generate a comprehensive risk assessment matrix for a story implementation using probability × impact analysis.

## Inputs

```yaml
required:
  - story_id: '{epic}.{story}' # e.g., "1.3"
  - story_path: 'docs/stories/{epic}.{story}.*.md'
  - story_title: '{title}' # If missing, derive from story file H1
  - story_slug: '{slug}' # If missing, derive from title (lowercase, hyphenated)
```

## Purpose

Identify, assess, and prioritize risks in the story implementation. Provide risk mitigation strategies and testing focus areas based on risk levels.

## Risk Assessment Framework

### Risk Categories

**Category Prefixes:**

- `TECH`: Technical Risks
- `SEC`: Security Risks
- `PERF`: Performance Risks
- `DATA`: Data Risks
- `BUS`: Business Risks
- `OPS`: Operational Risks

1. **Technical Risks (TECH)**
   - Architecture complexity
   - Integration challenges
   - Technical debt
   - Scalability concerns
   - System dependencies

2. **Security Risks (SEC)**
   - Authentication/authorization flaws
   - Data exposure vulnerabilities
   - Injection attacks
   - Session management issues
   - Cryptographic weaknesses

3. **Performance Risks (PERF)**
   - Response time degradation
   - Throughput bottlenecks
   - Resource exhaustion
   - Database query optimization
   - Caching failures

4. **Data Risks (DATA)**
   - Data loss potential
   - Data corruption
   - Privacy violations
   - Compliance issues
   - Backup/recovery gaps

5. **Business Risks (BUS)**
   - Feature doesn't meet user needs
   - Revenue impact
   - Reputation damage
   - Regulatory non-compliance
   - Market timing

6. **Operational Risks (OPS)**
   - Deployment failures
   - Monitoring gaps
   - Incident response readiness
   - Documentation inadequacy
   - Knowledge transfer issues

## Risk Analysis Process

### 1. Risk Identification

For each category, identify specific risks:

```yaml
risk:
  id: 'SEC-001' # Use prefixes: SEC, PERF, DATA, BUS, OPS, TECH
  category: security
  title: 'Insufficient input validation on user forms'
  description: 'Form inputs not properly sanitized could lead to XSS attacks'
  affected_components:
    - 'UserRegistrationForm'
    - 'ProfileUpdateForm'
  detection_method: 'Code review revealed missing validation'
```

### 2. Risk Assessment

Evaluate each risk using probability × impact:

**Probability Levels:**

- `High (3)`: Likely to occur (>70% chance)
- `Medium (2)`: Possible occurrence (30-70% chance)
- `Low (1)`: Unlikely to occur (<30% chance)

**Impact Levels:**

- `High (3)`: Severe consequences (data breach, system down, major financial loss)
- `Medium (2)`: Moderate consequences (degraded performance, minor data issues)
- `Low (1)`: Minor consequences (cosmetic issues, slight inconvenience)

### Risk Score = Probability × Impact

- 9: Critical Risk (Red)
- 6: High Risk (Orange)
- 4: Medium Risk (Yellow)
- 2-3: Low Risk (Green)
- 1: Minimal Risk (Blue)

### 3. Risk Prioritization

Create risk matrix:

```markdown
## Risk Matrix

| Risk ID  | Description             | Probability | Impact     | Score | Priority |
| -------- | ----------------------- | ----------- | ---------- | ----- | -------- |
| SEC-001  | XSS vulnerability       | High (3)    | High (3)   | 9     | Critical |
| PERF-001 | Slow query on dashboard | Medium (2)  | Medium (2) | 4     | Medium   |
| DATA-001 | Backup failure          | Low (1)     | High (3)   | 3     | Low      |
```

### 4. Risk Mitigation Strategies

For each identified risk, provide mitigation:

```yaml
mitigation:
  risk_id: 'SEC-001'
  strategy: 'preventive' # preventive|detective|corrective
  actions:
    - 'Implement input validation library (e.g., validator.js)'
    - 'Add CSP headers to prevent XSS execution'
    - 'Sanitize all user inputs before storage'
    - 'Escape all outputs in templates'
  testing_requirements:
    - 'Security testing with OWASP ZAP'
    - 'Manual penetration testing of forms'
    - 'Unit tests for validation functions'
  residual_risk: 'Low - Some zero-day vulnerabilities may remain'
  owner: 'dev'
  timeline: 'Before deployment'
```

## Outputs

### Output 1: Gate YAML Block

Generate for pasting into gate file under `risk_summary`:

**Output rules:**

- Only include assessed risks; do not emit placeholders
- Sort risks by score (desc) when emitting highest and any tabular lists
- If no risks: totals all zeros, omit highest, keep recommendations arrays empty

```yaml
# risk_summary (paste into gate file):
risk_summary:
  totals:
    critical: X # score 9
    high: Y # score 6
    medium: Z # score 4
    low: W # score 2-3
  highest:
    id: SEC-001
    score: 9
    title: 'XSS on profile form'
  recommendations:
    must_fix:
      - 'Add input sanitization & CSP'
    monitor:
      - 'Add security alerts for auth endpoints'
```

### Output 2: Markdown Report

**Save to:** `qa.qaLocation/assessments/{epic}.{story}-risk-{YYYYMMDD}.md`

```markdown
# Risk Profile: Story {epic}.{story}

Date: {date}
Reviewer: Quinn (Test Architect)

## Executive Summary

- Total Risks Identified: X
- Critical Risks: Y
- High Risks: Z
- Risk Score: XX/100 (calculated)

## Critical Risks Requiring Immediate Attention

### 1. [ID]: Risk Title

**Score: 9 (Critical)**
**Probability**: High - Detailed reasoning
**Impact**: High - Potential consequences
**Mitigation**:

- Immediate action required
- Specific steps to take
  **Testing Focus**: Specific test scenarios needed

## Risk Distribution

### By Category

- Security: X risks (Y critical)
- Performance: X risks (Y critical)
- Data: X risks (Y critical)
- Business: X risks (Y critical)
- Operational: X risks (Y critical)

### By Component

- Frontend: X risks
- Backend: X risks
- Database: X risks
- Infrastructure: X risks

## Detailed Risk Register

[Full table of all risks with scores and mitigations]

## Risk-Based Testing Strategy

### Priority 1: Critical Risk Tests

- Test scenarios for critical risks
- Required test types (security, load, chaos)
- Test data requirements

### Priority 2: High Risk Tests

- Integration test scenarios
- Edge case coverage

### Priority 3: Medium/Low Risk Tests

- Standard functional tests
- Regression test suite

## Risk Acceptance Criteria

### Must Fix Before Production

- All critical risks (score 9)
- High risks affecting security/data

### Can Deploy with Mitigation

- Medium risks with compensating controls
- Low risks with monitoring in place

### Accepted Risks

- Document any risks team accepts
- Include sign-off from appropriate authority

## Monitoring Requirements

Post-deployment monitoring for:

- Performance metrics for PERF risks
- Security alerts for SEC risks
- Error rates for operational risks
- Business KPIs for business risks

## Risk Review Triggers

Review and update risk profile when:

- Architecture changes significantly
- New integrations added
- Security vulnerabilities discovered
- Performance issues reported
- Regulatory requirements change
```

## Risk Scoring Algorithm

Calculate overall story risk score:

```text
Base Score = 100
For each risk:
  - Critical (9): Deduct 20 points
  - High (6): Deduct 10 points
  - Medium (4): Deduct 5 points
  - Low (2-3): Deduct 2 points

Minimum score = 0 (extremely risky)
Maximum score = 100 (minimal risk)
```

## Risk-Based Recommendations

Based on risk profile, recommend:

1. **Testing Priority**
   - Which tests to run first
   - Additional test types needed
   - Test environment requirements

2. **Development Focus**
   - Code review emphasis areas
   - Additional validation needed
   - Security controls to implement

3. **Deployment Strategy**
   - Phased rollout for high-risk changes
   - Feature flags for risky features
   - Rollback procedures

4. **Monitoring Setup**
   - Metrics to track
   - Alerts to configure
   - Dashboard requirements

## Integration with Quality Gates

**Deterministic gate mapping:**

- Any risk with score ≥ 9 → Gate = FAIL (unless waived)
- Else if any score ≥ 6 → Gate = CONCERNS
- Else → Gate = PASS
- Unmitigated risks → Document in gate

### Output 3: Story Hook Line

**Print this line for review task to quote:**

```text
Risk profile: qa.qaLocation/assessments/{epic}.{story}-risk-{YYYYMMDD}.md
```

## Key Principles

- Identify risks early and systematically
- Use consistent probability × impact scoring
- Provide actionable mitigation strategies
- Link risks to specific test requirements
- Track residual risk after mitigation
- Update risk profile as story evolves
 