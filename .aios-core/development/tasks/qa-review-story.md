---
tools:
  - github-cli        # Code review and PR management
  - browser           # End-to-end testing and UI validation
  - context7          # Research testing frameworks and best practices
  - supabase          # Database testing and data validation
checklists:
  - qa-master-checklist.md
---

# review-story

Perform a comprehensive test architecture review with quality gate decision. This adaptive, risk-aware review creates both a story update and a detailed gate file.

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

## Task Definition (AIOS Task Format V1.0)

```yaml
task: qaReviewStory()
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
  - **Source:** .aios-core/utils/validation-engine.js

- **Tool:** schema-validator
  - **Purpose:** JSON/YAML schema validation
  - **Source:** ajv or similar

---

## Scripts

**Agent-specific code for this task:**

- **Script:** run-validation.js
  - **Purpose:** Execute validation rules and generate report
  - **Language:** JavaScript
  - **Location:** .aios-core/scripts/run-validation.js

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


## Inputs

```yaml
required:
  - story_id: '{epic}.{story}' # e.g., "1.3"
  - story_path: '{devStoryLocation}/{epic}.{story}.*.md' # Path from core-config.yaml
  - story_title: '{title}' # If missing, derive from story file H1
  - story_slug: '{slug}' # If missing, derive from title (lowercase, hyphenated)
```

## Prerequisites

- Story status must be "Review"
- Developer has completed all tasks and updated the File List
- All automated tests are passing

## Review Process - Adaptive Test Architecture

### 0. CodeRabbit Full Self-Healing Loop (Story 6.3.3)

**Purpose**: Automated code quality scanning with self-healing before human review

**Configuration**: Full self-healing (max 3 iterations, CRITICAL + HIGH issues)

Execute CodeRabbit self-healing **FIRST** before manual review:

```
┌───────────────────────────────────────────────────────────────────┐
│                   CODERABBIT SELF-HEALING                         │
│                    (Full Mode - @qa)                              │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  iteration = 0                                                    │
│  max_iterations = 3                                               │
│                                                                   │
│  WHILE iteration < max_iterations:                                │
│    ┌─────────────────────────────────────────────────────────┐   │
│    │ 1. Run CodeRabbit CLI                                   │   │
│    │    wsl bash -c 'cd /mnt/c/.../aios-core &&         │   │
│    │    ~/.local/bin/coderabbit --prompt-only                │   │
│    │    -t committed --base main'                            │   │
│    │                                                          │   │
│    │ 2. Parse output for all severity levels                 │   │
│    └─────────────────────────────────────────────────────────┘   │
│                          │                                        │
│                          ▼                                        │
│    ┌─────────────────────────────────────────────────────────┐   │
│    │ critical = filter(severity == "CRITICAL")               │   │
│    │ high = filter(severity == "HIGH")                       │   │
│    │ medium = filter(severity == "MEDIUM")                   │   │
│    └─────────────────────────────────────────────────────────┘   │
│                          │                                        │
│                          ▼                                        │
│    ┌─────────────────────────────────────────────────────────┐   │
│    │ IF critical.length == 0 AND high.length == 0:           │   │
│    │   - IF medium.length > 0:                               │   │
│    │       - Create tech debt issues for each MEDIUM         │   │
│    │   - Log: "✅ CodeRabbit passed"                         │   │
│    │   - BREAK → Proceed to manual review                    │   │
│    └─────────────────────────────────────────────────────────┘   │
│                          │                                        │
│                          ▼                                        │
│    ┌─────────────────────────────────────────────────────────┐   │
│    │ IF CRITICAL or HIGH issues found:                       │   │
│    │   - Attempt auto-fix for each CRITICAL issue            │   │
│    │   - Attempt auto-fix for each HIGH issue                │   │
│    │   - iteration++                                         │   │
│    │   - CONTINUE loop                                       │   │
│    └─────────────────────────────────────────────────────────┘   │
│                          │                                        │
│                          ▼                                        │
│  IF iteration == 3 AND (CRITICAL or HIGH issues remain):         │
│    - Log: "❌ Issues remain after 3 iterations"                  │
│    - Generate detailed QA gate report                            │
│    - Set gate: FAIL                                              │
│    - HALT and require human intervention                         │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

#### Severity Handling

| Severity | Behavior | Notes |
|----------|----------|-------|
| **CRITICAL** | Auto-fix (max 3 attempts) | Security vulnerabilities, breaking bugs |
| **HIGH** | Auto-fix (max 3 attempts) | Significant quality problems |
| **MEDIUM** | Create tech debt issue | Document for future sprint |
| **LOW** | Note in review | Nits, no action required |

#### Implementation Code

```javascript
async function runQACodeRabbitSelfHealing(storyPath) {
  const maxIterations = 3;
  let iteration = 0;

  console.log('🐰 Starting CodeRabbit Full Self-Healing Loop...');
  console.log(`   Mode: Full (CRITICAL + HIGH)`);
  console.log(`   Max Iterations: ${maxIterations}\n`);

  while (iteration < maxIterations) {
    console.log(`📋 Iteration ${iteration + 1}/${maxIterations}`);

    // Run CodeRabbit CLI against main branch
    const output = await runCodeRabbitCLI('committed --base main');
    const issues = parseCodeRabbitOutput(output);

    const criticalIssues = issues.filter(i => i.severity === 'CRITICAL');
    const highIssues = issues.filter(i => i.severity === 'HIGH');
    const mediumIssues = issues.filter(i => i.severity === 'MEDIUM');

    console.log(`   Found: ${criticalIssues.length} CRITICAL, ${highIssues.length} HIGH, ${mediumIssues.length} MEDIUM`);

    // No CRITICAL or HIGH issues = success
    if (criticalIssues.length === 0 && highIssues.length === 0) {
      if (mediumIssues.length > 0) {
        console.log(`\n📝 Creating tech debt issues for ${mediumIssues.length} MEDIUM issues...`);
        await createTechDebtIssues(storyPath, mediumIssues);
      }
      console.log('\n✅ CodeRabbit Self-Healing: PASSED');
      return { success: true, iterations: iteration + 1, proceedToManual: true };
    }

    // Attempt auto-fix for CRITICAL and HIGH issues
    const allIssues = [...criticalIssues, ...highIssues];
    console.log(`\n🔧 Attempting auto-fix for ${allIssues.length} issues...`);
    for (const issue of allIssues) {
      await attemptAutoFix(issue);
    }

    iteration++;
  }

  // Max iterations reached with issues
  console.log('\n❌ CodeRabbit Self-Healing: FAILED');
  console.log(`   CRITICAL/HIGH issues remain after ${maxIterations} iterations.`);
  console.log('   Setting gate: FAIL - Manual intervention required.');

  return { success: false, iterations: maxIterations, gateStatus: 'FAIL' };
}
```

#### Timeout

- **Default**: 30 minutes per CodeRabbit run
- **Total max**: ~90 minutes (3 iterations)

#### Integration with Gate Decision

If self-healing fails:
- Gate automatically set to FAIL
- `top_issues` populated from remaining CodeRabbit issues
- `status_reason` includes "CodeRabbit self-healing exhausted"

---

### 0b. Code Intelligence: Reference Impact (Optional)

> This step is **conditional** — only executes when a code intelligence provider is available.
> If `isCodeIntelAvailable()` returns false, skip silently and proceed to Risk Assessment.

After CodeRabbit self-healing (Step 0), if code intelligence is available:

1. Collect modified files from the story's File List
2. Call `getReferenceImpact(files)` from `.aios-core/core/code-intel/helpers/qa-helper.js`
3. If result is not null, include reference impact in the review:
   ```
   ### Reference Impact (Code Intelligence)
   | Modified File | Consumers Affected |
   |--------------|-------------------|
   | {file} | {consumers.length} consumers ({list of consumer files}) |
   ```
4. Files with many consumers (>10) should trigger deeper review of those changes
5. This data supplements Risk Assessment (Step 1) — high consumer count may auto-escalate to deep review

> **Fallback guarantee:** If code intelligence is unavailable or `getReferenceImpact` returns null, the review continues exactly as before — no reference impact section is added.

---

### 1. Risk Assessment (Determines Review Depth)

**Auto-escalate to deep review when:**

- Auth/payment/security files touched
- No tests added to story
- Diff > 500 lines
- Previous gate was FAIL/CONCERNS
- Story has > 5 acceptance criteria

### 2. Comprehensive Analysis

**A. Requirements Traceability**

- Map each acceptance criteria to its validating tests (document mapping with Given-When-Then, not test code)
- Identify coverage gaps
- Verify all requirements have corresponding test cases

**B. Code Quality Review**

- Architecture and design patterns
- Refactoring opportunities (and perform them)
- Code duplication or inefficiencies
- Performance optimizations
- Security vulnerabilities
- Best practices adherence

**C. Test Architecture Assessment**

- Test coverage adequacy at appropriate levels
- Test level appropriateness (what should be unit vs integration vs e2e)
- Test design quality and maintainability
- Test data management strategy
- Mock/stub usage appropriateness
- Edge case and error scenario coverage
- Test execution time and reliability

**D. Non-Functional Requirements (NFRs)**

- Security: Authentication, authorization, data protection
- Performance: Response times, resource usage
- Reliability: Error handling, recovery mechanisms
- Maintainability: Code clarity, documentation

**E. Testability Evaluation**

- Controllability: Can we control the inputs?
- Observability: Can we observe the outputs?
- Debuggability: Can we debug failures easily?

**F. Technical Debt Identification**

- Accumulated shortcuts
- Missing tests
- Outdated dependencies
- Architecture violations

### 3. Active Refactoring

- Refactor code where safe and appropriate
- Run tests to ensure changes don't break functionality
- Document all changes in QA Results section with clear WHY and HOW
- Do NOT alter story content beyond QA Results section
- Do NOT change story Status or File List; recommend next status only

### 4. Standards Compliance Check

- Verify adherence to `docs/coding-standards.md`
- Check compliance with `docs/unified-project-structure.md`
- Validate testing approach against `docs/testing-strategy.md`
- Ensure all guidelines mentioned in the story are followed

### 5. Acceptance Criteria Validation

- Verify each AC is fully implemented
- Check for any missing functionality
- Validate edge cases are handled

### 6. Documentation and Comments

- Verify code is self-documenting where possible
- Add comments for complex logic if missing
- Ensure any API changes are documented

## Output 1: Update Story File - QA Results Section ONLY

**CRITICAL**: You are ONLY authorized to update the "QA Results" section of the story file. DO NOT modify any other sections.

**QA Results Anchor Rule:**

- If `## QA Results` doesn't exist, append it at end of file
- If it exists, append a new dated entry below existing entries
- Never edit other sections

After review and any refactoring, append your results to the story file in the QA Results section:

```markdown
## QA Results

### Review Date: [Date]

### Reviewed By: Quinn (Test Architect)

### Code Quality Assessment

[Overall assessment of implementation quality]

### Refactoring Performed

[List any refactoring you performed with explanations]

- **File**: [filename]
  - **Change**: [what was changed]
  - **Why**: [reason for change]
  - **How**: [how it improves the code]

### Compliance Check

- Coding Standards: [✓/✗] [notes if any]
- Project Structure: [✓/✗] [notes if any]
- Testing Strategy: [✓/✗] [notes if any]
- All ACs Met: [✓/✗] [notes if any]

### Improvements Checklist

[Check off items you handled yourself, leave unchecked for dev to address]

- [x] Refactored user service for better error handling (services/user.service.ts)
- [x] Added missing edge case tests (services/user.service.test.ts)
- [ ] Consider extracting validation logic to separate validator class
- [ ] Add integration test for error scenarios
- [ ] Update API documentation for new error codes

### Security Review

[Any security concerns found and whether addressed]

### Performance Considerations

[Any performance issues found and whether addressed]

### Files Modified During Review

[If you modified files, list them here - ask Dev to update File List]

### Gate Status

Gate: {STATUS} → qa.qaLocation/gates/{epic}.{story}-{slug}.yml
Risk profile: qa.qaLocation/assessments/{epic}.{story}-risk-{YYYYMMDD}.md
NFR assessment: qa.qaLocation/assessments/{epic}.{story}-nfr-{YYYYMMDD}.md

# Note: Paths should reference core-config.yaml for custom configurations

### Recommended Status

[✓ Ready for Done] / [✗ Changes Required - See unchecked items above]
(Story owner decides final status)
```

## Output 2: Create Quality Gate File

**Template and Directory:**

- Render from `../templates/qa-gate-tmpl.yaml`
- Create directory defined in `qa.qaLocation/gates` (see `.aios-core/core-config.yaml`) if missing
- Save to: `qa.qaLocation/gates/{epic}.{story}-{slug}.yml`

Gate file structure:

```yaml
schema: 1
story: '{epic}.{story}'
story_title: '{story title}'
gate: PASS|CONCERNS|FAIL|WAIVED
status_reason: '1-2 sentence explanation of gate decision'
reviewer: 'Quinn (Test Architect)'
updated: '{ISO-8601 timestamp}'

top_issues: [] # Empty if no issues
waiver: { active: false } # Set active: true only if WAIVED

# Extended fields (optional but recommended):
quality_score: 0-100 # 100 - (20*FAILs) - (10*CONCERNS) or use technical-preferences.md weights
expires: '{ISO-8601 timestamp}' # Typically 2 weeks from review

evidence:
  tests_reviewed: { count }
  risks_identified: { count }
  trace:
    ac_covered: [1, 2, 3] # AC numbers with test coverage
    ac_gaps: [4] # AC numbers lacking coverage

nfr_validation:
  security:
    status: PASS|CONCERNS|FAIL
    notes: 'Specific findings'
  performance:
    status: PASS|CONCERNS|FAIL
    notes: 'Specific findings'
  reliability:
    status: PASS|CONCERNS|FAIL
    notes: 'Specific findings'
  maintainability:
    status: PASS|CONCERNS|FAIL
    notes: 'Specific findings'

recommendations:
  immediate: # Must fix before production
    - action: 'Add rate limiting'
      refs: ['api/auth/login.ts']
  future: # Can be addressed later
    - action: 'Consider caching'
      refs: ['services/data.ts']
```

### Gate Decision Criteria

**Deterministic rule (apply in order):**

If risk_summary exists, apply its thresholds first (≥9 → FAIL, ≥6 → CONCERNS), then NFR statuses, then top_issues severity.

1. **Risk thresholds (if risk_summary present):**
   - If any risk score ≥ 9 → Gate = FAIL (unless waived)
   - Else if any score ≥ 6 → Gate = CONCERNS

2. **Test coverage gaps (if trace available):**
   - If any P0 test from test-design is missing → Gate = CONCERNS
   - If security/data-loss P0 test missing → Gate = FAIL

3. **Issue severity:**
   - If any `top_issues.severity == high` → Gate = FAIL (unless waived)
   - Else if any `severity == medium` → Gate = CONCERNS

4. **NFR statuses:**
   - If any NFR status is FAIL → Gate = FAIL
   - Else if any NFR status is CONCERNS → Gate = CONCERNS
   - Else → Gate = PASS

- WAIVED only when waiver.active: true with reason/approver

Detailed criteria:

- **PASS**: All critical requirements met, no blocking issues
- **CONCERNS**: Non-critical issues found, team should review
- **FAIL**: Critical issues that should be addressed
- **WAIVED**: Issues acknowledged but explicitly waived by team

### Quality Score Calculation

```text
quality_score = 100 - (20 × number of FAILs) - (10 × number of CONCERNS)
Bounded between 0 and 100
```

If `technical-preferences.md` defines custom weights, use those instead.

### Suggested Owner Convention

For each issue in `top_issues`, include a `suggested_owner`:

- `dev`: Code changes needed
- `sm`: Requirements clarification needed
- `po`: Business decision needed

## Key Principles

- You are a Test Architect providing comprehensive quality assessment
- You have the authority to improve code directly when appropriate
- Always explain your changes for learning purposes
- Balance between perfection and pragmatism
- Focus on risk-based prioritization
- Provide actionable recommendations with clear ownership

## Blocking Conditions

Stop the review and request clarification if:

- Story file is incomplete or missing critical sections
- File List is empty or clearly incomplete
- No tests exist when they were required
- Code changes don't align with story requirements
- Critical architectural issues that require discussion

## Completion

After review:

1. Update the QA Results section in the story file
2. Create the gate file in directory from `qa.qaLocation/gates`
3. Recommend status: "Ready for Done" or "Changes Required" (owner decides)
4. If files were modified, list them in QA Results and ask Dev to update File List
5. Always provide constructive feedback and actionable recommendations

## ClickUp Synchronization

**Automatic Sync**: When you save the story file with QA Results updates, the story-manager.js module automatically syncs changes to ClickUp:

- **What Gets Synced**:
  - Full story markdown updated in ClickUp task description
  - Story status changes reflected in custom field
  - Changelog comment posted with detected changes

- **Change Detection**:
  - Status changes (e.g., Review → Done)
  - Task completions (checkboxes marked)
  - File list modifications
  - Dev Notes or Acceptance Criteria updates

- **No Action Required**: The sync happens transparently when using story-manager utilities. If sync fails, story file is still saved locally with a warning message.

## Handoff
next_agent: @dev
next_command: *apply-qa-fixes
condition: QA verdict is REJECT
alternatives:
  - agent: @devops, command: *push, condition: QA verdict is APPROVE
  - agent: @dev, command: *fix-qa-issues, condition: Structured fix from QA_FIX_REQUEST.md

- **Manual Sync**: If needed, use: `npm run sync-story -- --story {epic}.{story}` 