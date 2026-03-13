# Task: qualify-task

> **Model Tier Qualification** | Testar empiricamente se task pode rodar em Haiku

**Task ID:** qualify-task
**Version:** 1.0.0
**Command:** `*qualify-task <task-name> [--batch]`
**Execution Type:** Workflow Orchestrator
**Model:** `Haiku` (orchestration only - workflow handles model selection)
**Haiku Eligible:** YES — orchestration is deterministic
**Orchestrator:** @pedro-valerio

## Purpose

Invocar `wf-model-tier-qualification.yaml` para testar empiricamente se uma task pode rodar em modelo mais barato (Haiku) mantendo qualidade.

**Diferença do `*optimize`:**
- `*optimize --hybrid` → Pipeline completo (análise + conversão + qualificação + GAP ZERO)
- `*qualify-task` → APENAS qualificação empírica (Opus vs Haiku)

## Usage

```bash
# Qualificar uma task específica
*qualify-task pv-axioma-assessment

# Qualificar com threshold customizado (default: 90%)
*qualify-task validate-squad --threshold 0.85

# Qualificar batch (todas tasks não-qualificadas)
*qualify-task --batch

# Qualificar batch de uma wave específica
*qualify-task --batch --wave 1
```

## Veto Conditions

| ID | Condition | Check | Result |
|----|-----------|-------|--------|
| VETO-QFT-001 | Task file must exist before qualification can proceed | Verify file exists at squads/squad-creator-pro/tasks/{task_name}.md | VETO - BLOCK. Task not found in squad task catalog. |
| VETO-QFT-002 | Task must have test_input defined in workflow registry | Lookup wf-model-tier-qualification.yaml test_input_registry.{task_name} | VETO - BLOCK. Add test_input to workflow registry before qualifying. |
| VETO-QFT-003 | Task must not already be qualified unless forced | Check config/model-routing.yaml tasks.{task_name}.validated | VETO - BLOCK. Already qualified. Use --force flag to re-test. |

> Legacy format retained as domain-specific complement:
- [ ] VETO se task não existe em `squads/squad-creator-pro/tasks/`
- [ ] VETO se task não tem `test_input` no registry do workflow
- [ ] VETO se já está qualificada em `model-routing.yaml` (use `--force` para re-testar)

---

## Workflow

### Step 1: Pre-flight Validation

```yaml
preflight:
  - check: "Task file exists?"
    path: "squads/squad-creator-pro/tasks/{task_name}.md"
    veto_if: "not exists"

  - check: "Task in test_input_registry?"
    lookup: "wf-model-tier-qualification.yaml → test_input_registry.{task_name}"
    veto_if: "not found"
    message: "Task needs test_input defined first. Add to workflow registry."

  - check: "Already qualified?"
    lookup: "config/model-routing.yaml → tasks.{task_name}.validated"
    action_if_true: "Skip unless --force flag"
```

### Step 2: Load Workflow

```yaml
load_workflow:
  file: "squads/squad-creator-pro/workflows/wf-model-tier-qualification.yaml"
  action: "Read COMPLETE workflow definition"

  extract:
    - phases (4 phases + auto-improve loop)
    - test_input_registry
    - veto_conditions
    - compensations
```

### Step 3: Execute Qualification

```yaml
execute:
  # Invoke workflow with inputs
  inputs:
    task_name: "{from command}"
    target_tier: "haiku"  # default
    threshold: 0.90       # default, can override with --threshold

  phases:
    - phase_0: "PRE-FLIGHT"
    - phase_1: "PARALLEL EXECUTION (Opus + Haiku)"
    - phase_2: "COMPARE & AUTO-DECIDE"
    - phase_3: "AUTO-IMPROVE LOOP (if needed)"
    - phase_4: "GENERATE REPORT"

  # Follow workflow phases exactly as defined
  action: |
    Execute wf-model-tier-qualification.yaml with the provided inputs.
    The workflow handles:
    - Running Opus baseline
    - Running Haiku candidate
    - Comparing results
    - Applying compensations if needed
    - Generating qualification report
```

### Step 4: Update Config

```yaml
update_config:
  condition: "decision is QUALIFIED or QUALIFIED_WITH_COMPENSATION"

  action: |
    Update config/model-routing.yaml:

    tasks:
      {task_name}.md:
        tier: haiku  # or sonnet if escalated
        confidence: high
        validated: true
        test_date: "{today}"
        test_result: "{summary from qualification report}"

  script: |
    node squads/squad-creator-pro/scripts/model-tier-validator.cjs \
      update-routing {task_name} {recommended_tier} "{reason}"
```

### Step 5: Summary

```yaml
summary:
  display: |
    ╔══════════════════════════════════════════════════════════════════╗
    ║  QUALIFICATION RESULT: {task_name}                               ║
    ╠══════════════════════════════════════════════════════════════════╣
    ║                                                                  ║
    ║  Decision: {QUALIFIED | NEEDS_COMPENSATION | ESCALATE | OPUS}    ║
    ║  Tier: {haiku | sonnet | opus}                                   ║
    ║  Quality: {pct}% of Opus baseline                                ║
    ║  Cost Savings: {savings_pct}%                                    ║
    ║                                                                  ║
    ║  Report: test-cases/{task_name}/qualification-report.yaml        ║
    ╚══════════════════════════════════════════════════════════════════╝
```

---

## Batch Mode

```yaml
batch_mode:
  trigger: "--batch flag"

  action: |
    1. Read wf-model-tier-qualification.yaml → batch_mode.execution_order
    2. Filter tasks not yet validated in model-routing.yaml
    3. Execute qualification for each task sequentially
    4. Generate consolidated QUALIFICATION-DASHBOARD.yaml

  waves:
    wave_1: "High-confidence Haiku candidates"
    wave_2: "Admin tasks (script-based)"
    wave_3: "Sonnet candidates tested with Haiku"

  output:
    - "test-cases/{task}/qualification-report.yaml" (per task)
    - "test-cases/QUALIFICATION-DASHBOARD.yaml" (consolidated)
```

---

## Examples

### Example 1: Qualify Single Task

```
User: *qualify-task an-assess-sources

Agent:
## Step 1: Pre-flight ✅
- Task file: squads/squad-creator-pro/tasks/an-assess-sources.md ✅
- Test input: squads/mind-cloning/minds/pedro_valerio/sources/ ✅
- Already qualified: NO

## Step 2: Loading workflow...
Read: wf-model-tier-qualification.yaml

## Step 3: Executing qualification...
[Phase 0: PRE-FLIGHT] ✅
[Phase 1: PARALLEL EXECUTION]
  - Opus baseline running...
  - Haiku candidate running...
[Phase 2: COMPARE]
  - Opus: 8.5/10
  - Haiku: 8.2/10 (96.5% quality)
  - Decision: QUALIFIED ✅

## Step 4: Updating config...
Updated model-routing.yaml: an-assess-sources.md → haiku

## Result
╔══════════════════════════════════════════════════════════════════╗
║  QUALIFICATION RESULT: an-assess-sources                         ║
╠══════════════════════════════════════════════════════════════════╣
║  Decision: QUALIFIED                                             ║
║  Tier: haiku                                                     ║
║  Quality: 96.5%                                                  ║
║  Savings: 97%                                                    ║
╚══════════════════════════════════════════════════════════════════╝
```

### Example 2: Batch Mode

```
User: *qualify-task --batch --wave 1

Agent:
## Batch Qualification: Wave 1 (10 tasks)

| # | Task | Status | Tier | Quality | Savings |
|---|------|--------|------|---------|---------|
| 1 | pv-axioma-assessment | ✅ QUALIFIED | haiku | 95.5% | 97% |
| 2 | validate-squad | ✅ QUALIFIED | haiku | 91% | 98% |
| 3 | an-fidelity-score | ✅ SCRIPT | script | 100% | 100% |
| 4 | an-diagnose-clone | ❌ OPUS REQUIRED | opus | 30% | 0% |
...

## Summary
- Qualified: 8/10 (80%)
- Script-only: 2/10 (20%)
- Opus required: 1/10 (10%)
- Total savings: ~85% token cost reduction

Dashboard: test-cases/QUALIFICATION-DASHBOARD.yaml
```

---

## Completion Criteria

| Critério | Status |
|----------|--------|
| Pre-flight validation passed | [ ] |
| Workflow executed completely | [ ] |
| Qualification report generated | [ ] |
| Config updated (if qualified) | [ ] |
| Summary displayed | [ ] |

---

## Related

- `wf-model-tier-qualification.yaml` - The actual workflow being invoked
- `config/model-routing.yaml` - Where results are stored
- `*optimize --hybrid` - Full pipeline (includes qualification)
- `*lookup-model` - Read-only lookup (no qualification)
- `*smoke-test-model-routing` - Test the routing system itself

---

_Task Version: 1.0.0_
_Last Updated: 2026-02-12_

*"Não assumir. Provar com dados."*
