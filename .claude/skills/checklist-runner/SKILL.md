---
name: checklist-runner
description: |
  Generic checklist execution engine for any .md checklist.
  Use this skill when an agent needs to validate work against a checklist.
  Supports YOLO (autonomous) and interactive modes with pass/fail/partial verdicts.
user-invocable: true
argument-hint: "[checklist-name] [--mode yolo|interactive]"
---

# Checklist Runner

Generic checklist execution engine. Validates work against any `.md` checklist with consistent behavior across all agents.

## Usage

```
/checklist-runner story-dod-checklist
/checklist-runner pre-push-checklist --mode yolo
/checklist-runner po-master-checklist --mode interactive
```

## Execution

### 1. Resolve Checklist

Parse `$ARGUMENTS` for checklist name. Search in order:

1. `.aios-core/development/checklists/{name}.md`
2. `.aios-core/development/checklists/{name}`
3. Fuzzy match if exact not found (e.g., "dod" → "story-dod-checklist.md")

If no checklist specified or multiple matches, present numbered options list.

### 2. Determine Mode

| Mode | Behavior |
|------|----------|
| `yolo` (default) | Process all sections autonomously, present final report |
| `interactive` | Section-by-section with user confirmation between each |

### 3. Load Context

Gather documents and artifacts specified at the top of the checklist:
- Story files from `docs/stories/`
- Source code files from story's File List
- Test results from last `npm test` run
- Git diff for current changes

### 4. Process Checklist Items

For each item in the checklist:

1. Read and understand the requirement
2. Look for evidence in documentation/code that satisfies it
3. Consider both explicit mentions and implicit coverage
4. Follow any embedded LLM instructions in the checklist

Mark each item:

| Verdict | Symbol | Meaning |
|---------|--------|---------|
| PASS | ✅ | Requirement clearly met |
| FAIL | ❌ | Requirement not met or insufficient |
| PARTIAL | ⚠️ | Some aspects covered, needs improvement |
| N/A | ➖ | Not applicable (with justification) |

### 5. Section Summary

For each section calculate:
- Pass rate: `(PASS count) / (total - N/A count) * 100`
- Common themes in failed items
- Specific recommendations for improvement

### 6. Final Report

```markdown
## Checklist Report: {checklist-name}

**Date:** {YYYY-MM-DD}
**Agent:** {current agent}
**Mode:** {yolo|interactive}

### Summary

| Section | Items | Pass | Fail | Partial | N/A | Rate |
|---------|-------|------|------|---------|-----|------|
| ... | ... | ... | ... | ... | ... | ...% |

**Overall:** {PASS_RATE}% ({total_pass}/{total_applicable})

### Failed Items

1. **{item}** — {reason} → {recommendation}

### Decision

**{APPROVED | NEEDS_WORK | FAIL}**
- APPROVED: >= 90% pass rate, 0 FAIL on critical items
- NEEDS_WORK: 70-89% pass rate OR any FAIL on non-critical
- FAIL: < 70% pass rate OR any FAIL on critical items
```

## Available Checklists

| Checklist | Used By | Purpose |
|-----------|---------|---------|
| `story-dod-checklist.md` | @dev | Definition of Done for stories |
| `self-critique-checklist.md` | @dev | Self-review at implementation checkpoints |
| `pre-push-checklist.md` | @devops | Quality gate before git push |
| `release-checklist.md` | @devops | Release readiness verification |
| `po-master-checklist.md` | @po | PO validation checklist |
| `change-checklist.md` | @po | Change impact assessment |
