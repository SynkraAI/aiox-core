# Task: Diagnose Clone

Diagnose why a mind clone is weak and generate a corrective action plan. Use when smoke-test fails or user reports dissatisfaction.

---

## Metadata
- **task-id:** diagnose-clone
- **agent:** mind-cloner
- **elicit:** true
- **execution_type:** interactive

## Prerequisites

- Complete mind DNA exists at `squads/mind-cloning/minds/{mind_slug}/mind_dna_complete.yaml`
- Smoke test results (optional but recommended): `squads/mind-cloning/minds/{mind_slug}/smoke_test_result.yaml`
- User feedback on what feels wrong (optional)

## Instructions

### Step 1: Load Context

Read the complete mind DNA and smoke test results (if available).
Ask the user: "What specifically feels wrong about the clone?"

### Step 2: Run 6 Diagnostic Questions

Reference: `squads/mind-cloning/data/diagnostic-framework.md`

For each question, analyze the mind DNA and answer honestly:

| # | Question | Finding |
|---|----------|---------|
| 1 | Would the clone say something the expert NEVER would? | {analyze immune_system + anti_patterns} |
| 2 | Does it have all 3: Playbook, Framework, Swipe File? | {check AN003 Trindade} |
| 3 | Are sources gold or bronze? | {check source tier distribution} |
| 4 | What % of time was spent on curation vs prompt? | {check AN001 ratio} |
| 5 | Was it tested with 5-10 people blind? | {check smoke_test_result} |
| 6 | Can it be hacked? Does it hold character under pressure? | {analyze immune_system strength} |

### Step 3: Identify Red Flags

Cross-reference findings with the red flags table in `data/diagnostic-framework.md`.
List all detected red flags with severity.

### Step 4: Check Heuristics Compliance

Cross-reference with `data/heuristics-catalog.md`:
- Check AN001-AN010 compliance
- Identify which heuristics were violated
- Check if any veto conditions apply

### Step 5: Generate Diagnostic Report

```
DIAGNOSTIC REPORT
─────────────────
Expert: {expert_name}
Clone version: {version}
Trigger: {smoke test failure | user feedback | routine check}

Failed test(s): {list}
Root cause: {identified cause from diagnostic questions}
Heuristic(s) violated: {AN00X list}
Red flags detected: {list with severity}

Corrective action: {specific action per red flag}
Effort estimate: Low (1-2h) | Medium (2-4h) | High (4-8h)
Phase(s) to re-run: {specific phases of the pipeline}
```

### Step 6: Present and Confirm

Present the diagnostic report to the user.
Ask: "Do you want to proceed with these corrections?"

If yes, execute the corrective phases.
If no, save the report for future reference.

## Important Notes

- Be BRUTALLY HONEST in the diagnostic — sugarcoating helps nobody
- Root cause is usually in sources (AN001/AN002), not in the extraction
- If multiple red flags, prioritize by severity (CRITICAL > ALTA > MEDIA)
- Save diagnostic report to `squads/mind-cloning/minds/{mind_slug}/diagnostic_report.yaml`
- After corrections, re-run smoke test to validate improvement
