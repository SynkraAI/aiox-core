# Task: QA After Creation

**Task ID:** qa-after-creation
**Version:** 1.0.0
**Purpose:** Automatic quality assurance check after squad/component creation
**Orchestrator:** @squad-architect
**Mode:** Automatic (triggered by creation tasks)

**Core Philosophy:**
```
Every created component must pass QA before being considered complete.
QA is not optional - it's the final gate before delivery.
Find problems NOW, not when the user tries to use it.
```

---

## When This Task Runs

This task is triggered automatically after:

| Trigger Task | What Was Created | QA Scope |
|--------------|------------------|----------|
| `*create-squad` | New squad | Full squad validation |
| `*create-agent` | New agent | Agent-only validation |
| `*create-task` | New task | Task-only validation |
| `*create-workflow` | New workflow | Workflow-only validation |
| `*create-template` | New template | Template-only validation |

---

## Inputs

```yaml
inputs:
  created_component:
    type: string
    required: true
    description: "Path to created component"
    example: "squads/{your-squad}/"

  component_type:
    type: enum
    required: true
    values: ["squad", "agent", "task", "workflow", "template"]
    description: "Type of component created"

  creation_task:
    type: string
    required: false
    description: "Task that triggered this QA"
    example: "create-squad"

  auto_fix:
    type: boolean
    default: false
    description: "Attempt to auto-fix minor issues"
```

---

## QA Flow

```
TRIGGER (component created)
    ↓
[PHASE 1: QUICK CHECKS]
    → File exists
    → Valid YAML/MD syntax
    → Required fields present
    → 5 seconds max
    ↓
[PHASE 2: SECURITY SCAN]
    → Run SEC-001 to SEC-018
    → Any BLOCKING = STOP
    → Report vulnerabilities
    → 10 seconds max
    ↓
[PHASE 3: STRUCTURE VALIDATION]
    → Cross-references valid
    → Dependencies exist
    → Template conformance
    → 15 seconds max
    ↓
[PHASE 4: QUALITY SCORING]
    → Run validate-squad (if squad)
    → Calculate score
    → Generate report
    → 30 seconds max
    ↓
[PHASE 5: REPORT & ACTION]
    → Pass: Confirm completion
    → Warn: List issues, allow proceed
    → Fail: Block, require fixes
    ↓
OUTPUT: QA Report + Pass/Fail
```

---

## PHASE 1: Quick Checks

**Duration:** < 5 seconds
**Blocking:** Yes

```yaml
quick_checks:
  - id: "QC-001"
    check: "Component file/directory exists"
    action: "ls {created_component}"
    on_fail: "ABORT - Component not found at path"

  - id: "QC-002"
    check: "Valid YAML syntax (if .yaml/.yml)"
    action: "python -c 'import yaml; yaml.safe_load(open(\"{file}\"))'"
    on_fail: "ABORT - Invalid YAML syntax"

  - id: "QC-003"
    check: "Valid Markdown syntax (if .md)"
    action: "Check for unclosed code blocks, broken headers"
    on_fail: "WARN - Markdown formatting issues"

  - id: "QC-004"
    check: "Required metadata present"
    fields:
      squad: ["name", "version", "description", "entry_agent"]
      agent: ["agent.name", "agent.id", "persona", "commands"]
      task: ["Task ID", "Version", "Purpose", "Inputs", "Outputs"]
      workflow: ["Workflow ID", "Version", "Phases"]
    on_fail: "ABORT - Missing required field: {field}"
```

---

## PHASE 2: Security Scan

**Duration:** < 10 seconds
**Blocking:** Yes (for HIGH severity)

```yaml
security_scan:
  description: "Run comprehensive security checks"
  reference: "squad-checklist.md Section 1.6"

  checks:
    # HIGH severity - BLOCKING
    high_severity:
      - "SEC-001 to SEC-004: API keys & tokens"
      - "SEC-005 to SEC-008: Cloud credentials"
      - "SEC-009 to SEC-010: Private keys"
      - "SEC-011 to SEC-012: Database URLs"
      - "SEC-013 to SEC-015: Sensitive files"

    # MEDIUM severity - WARNING
    medium_severity:
      - "SEC-016 to SEC-018: Code vulnerabilities"

  actions:
    on_high_found: "ABORT - Security vulnerability found"
    on_medium_found: "WARN - Review recommended"

  scan_command: |
    # Run all security patterns
    grep -rE "(api[_-]?key|secret|password|bearer|jwt)\\s*[:=]\\s*['\"][^'\"${}]{8,}" {path} || true
    grep -rE "AKIA[A-Z0-9]{16}" {path} || true
    grep -rE "(postgres|mysql|mongodb)://[^:]+:[^@]+@" {path} || true
    grep -rE "-----BEGIN.*PRIVATE KEY-----" {path} || true
    find {path} -name ".env*" -o -name "*.pem" -o -name "credentials*.json" 2>/dev/null || true
```

---

## PHASE 3: Structure Validation

**Duration:** < 15 seconds
**Blocking:** Yes (for missing dependencies)

```yaml
structure_validation:
  for_squad:
    - check: "config.yaml exists"
    - check: "Entry agent exists"
    - check: "All handoff_to targets exist"
    - check: "All task references valid"
    - check: "All template references valid"
    - check: "All checklist references valid"
    - check: "No orphan files (optional)"

  for_agent:
    - check: "activation-instructions present"
    - check: "commands section present"
    - check: "All dependencies exist"
    - check: "handoff_to targets exist (if any)"

  for_task:
    - check: "All 8 Task Anatomy fields present"
    - check: "Referenced templates exist"
    - check: "Referenced checklists exist"
    - check: "Inputs have types defined"
    - check: "Outputs have paths defined"

  for_workflow:
    - check: "All phases have tasks"
    - check: "Task references valid"
    - check: "No sequence collisions"
    - check: "Output→Input chain valid"
```

---

## PHASE 4: Quality Scoring

**Duration:** < 30 seconds
**Blocking:** No (score reported)

```yaml
quality_scoring:
  for_squad:
    action: "Run validate-squad {squad_name}"
    extract:
      - tier_1_result
      - tier_2_result
      - tier_3_score
      - tier_4_score
      - final_score
      - veto_triggered

  for_agent:
    criteria:
      - name: "Persona completeness"
        weight: 0.20
        checks: ["role", "style", "identity", "focus"]

      - name: "Commands functionality"
        weight: 0.20
        checks: ["*help exists", "commands map to capabilities"]

      - name: "Voice consistency"
        weight: 0.15
        checks: ["voice_dna present (if Expert)", "vocabulary used"]

      - name: "Examples quality"
        weight: 0.15
        checks: ["output_examples present", "realistic"]

      - name: "Dependencies valid"
        weight: 0.15
        checks: ["all references exist"]

      - name: "Documentation"
        weight: 0.15
        checks: ["whenToUse clear", "description helpful"]

  for_task:
    criteria:
      - name: "Task Anatomy complete"
        weight: 0.25
        checks: ["8 required fields"]

      - name: "Prompt quality"
        weight: 0.25
        checks: ["specific", "examples", "anti-patterns"]

      - name: "Validation defined"
        weight: 0.20
        checks: ["success criteria", "failure handling"]

      - name: "Integration"
        weight: 0.15
        checks: ["references valid", "outputs defined"]

      - name: "Documentation"
        weight: 0.15
        checks: ["purpose clear", "usage examples"]

  thresholds:
    pass: 7.0
    conditional: 5.0
    fail: 5.0
```

---

## PHASE 5: Report & Action

**Duration:** < 5 seconds

### Report Format

```yaml
qa_report:
  header:
    component: "{path}"
    type: "{type}"
    created_by: "{creation_task}"
    qa_date: "{timestamp}"
    qa_version: "1.0.0"

  summary:
    result: "PASS | CONDITIONAL | FAIL"
    score: "X.X/10"
    issues_found: N
    security_issues: N

  quick_checks:
    passed: N
    failed: N
    details: [...]

  security_scan:
    high_severity: N
    medium_severity: N
    findings: [...]

  structure_validation:
    valid: true/false
    missing_references: [...]
    orphan_files: [...]

  quality_score:
    final: X.X
    breakdown:
      criteria_1: X.X
      criteria_2: X.X
      ...

  issues:
    blocking:
      - issue: "..."
        location: "..."
        fix: "..."
    warnings:
      - issue: "..."
        fix: "..."

  recommendation:
    action: "PROCEED | FIX_REQUIRED | REVIEW"
    message: "..."
```

### Actions Based on Result

```yaml
actions:
  on_pass:
    score: ">= 7.0"
    security: "0 HIGH"
    action:
      - "Log success"
      - "Mark component as validated"
      - "Report: '✅ QA PASSED: {component} (Score: {score})'"

  on_conditional:
    score: ">= 5.0 and < 7.0"
    security: "0 HIGH"
    action:
      - "Log warnings"
      - "Report: '⚠️ QA CONDITIONAL: {component} (Score: {score})'"
      - "List issues to fix"
      - "Ask: 'Proceed anyway? Issues found: {count}'"

  on_fail:
    score: "< 5.0"
    or_security: ">= 1 HIGH"
    action:
      - "Log failure"
      - "Report: '❌ QA FAILED: {component}'"
      - "List blocking issues"
      - "Block: 'Cannot proceed. Fix {count} blocking issues.'"
      - "Offer: '*fix-issues {component}'"
```

---

## Integration with Creation Tasks

### How to Trigger QA

Add to end of creation tasks:

```yaml
# In create-squad.md, create-agent.md, etc.
post_creation:
  - action: "Run QA"
    task: "qa-after-creation"
    params:
      created_component: "{output_path}"
      component_type: "squad"  # or agent, task, etc.
      creation_task: "{current_task}"
```

### Example Flow

```
User: *create-squad my-new-squad
    ↓
[create-squad executes]
    → Creates squads/my-new-squad/
    → Creates config.yaml, README.md
    → Creates agents/orchestrator.md
    ↓
[qa-after-creation auto-triggers]
    → Quick checks: PASS
    → Security scan: PASS
    → Structure: PASS
    → Quality: 7.8/10
    ↓
Output: "✅ Squad 'my-new-squad' created and validated (Score: 7.8/10)"
```

---

## CLI Usage

```bash
# Auto-triggered (normal flow)
# QA runs automatically after creation

# Manual trigger
@squad-architect
*qa-after-creation squads/{your-squad}/ --type=squad

# Check specific component
*qa-after-creation squads/{your-squad}/agents/my-agent.md --type=agent

# With auto-fix attempt
*qa-after-creation squads/{your-squad}/ --type=squad --auto-fix
```

---

## Outputs

| Output | Location | Description |
|--------|----------|-------------|
| QA Report | Console | Immediate feedback |
| Report File | `{component}/docs/qa-report-{date}.md` | Detailed report |
| Validation Badge | `{component}/docs/VALIDATED.md` | If passed |

---

## Related Tasks

| Task | Purpose |
|------|---------|
| `validate-squad` | Full squad validation (called by this task) |
| `create-squad` | Triggers this task on completion |
| `create-agent` | Triggers this task on completion |
| `fix-issues` | Attempt to fix QA issues |

---

## Changelog

```yaml
v1.0.0 (2026-02-01):
  - Initial task
  - 5-phase QA flow
  - Security scan integration (SEC-001 to SEC-018)
  - Auto-trigger from creation tasks
  - Score thresholds (7.0 pass, 5.0 conditional)
```

---

_Task Version: 1.0.0_
_Philosophy: No component ships without QA_
_Triggered by: create-squad, create-agent, create-task, create-workflow_
