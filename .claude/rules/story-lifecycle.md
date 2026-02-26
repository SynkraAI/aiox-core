---
paths:
  - "docs/stories/**"
  - ".aios-core/development/**"
---

# Story Lifecycle — Detailed Rules

## Status Progression

```
Draft → Ready → InProgress → InReview → Done
```

| Status | Trigger | Agent | Action |
|--------|---------|-------|--------|
| Draft | @sm creates story | @sm | Story file created |
| Ready | @po validates (GO) | @po | **MUST update status field in story file from Draft → Ready** |
| InProgress | @dev starts implementation | @dev | Update status field |
| InReview | @dev completes, @qa reviews | @qa | Update status field |
| Done | @qa PASS, @devops pushes | @devops | Update status field |

**CRITICAL:** The `Draft → Ready` transition is the responsibility of @po during `*validate-story-draft`. When verdict is GO (including conditional GO after fixes are applied), @po MUST update the story's Status field to `Ready` and log the transition in the Change Log. A story left in `Draft` after a GO verdict is a process violation.

## Phase 1: Create (@sm)

**Task:** `create-next-story.md`
**Inputs:** PRD sharded, epic context
**Output:** `{epicNum}.{storyNum}.story.md`

## Phase 2: Validate (@po)

**Task:** `validate-next-story.md`

### 10-Point Validation Checklist

1. Clear and objective title
2. Complete description (problem/need explained)
3. Testable acceptance criteria (Given/When/Then preferred)
4. Well-defined scope (IN and OUT clearly listed)
5. Dependencies mapped (prerequisite stories/resources)
6. Complexity estimate (points or T-shirt sizing)
7. Business value (benefit to user/business clear)
8. Risks documented (potential problems identified)
9. Criteria of Done (clear definition of complete)
10. Alignment with PRD/Epic (consistency with source docs)

**Decision:** GO (≥7/10) or NO-GO (<7/10 with required fixes)

## Phase 3: Implement (@dev)

**Task:** `dev-develop-story.md`

### Execution Modes

**YOLO (autonomous):**
- 0-1 prompts
- Decisions logged in `decision-log-{story-id}.md`
- Best for: simple, deterministic tasks

**Interactive (default):**
- 5-10 prompts with educational checkpoints
- Confirmations at key decision points
- Best for: learning, complex decisions

**Pre-Flight (plan-first):**
- All questions upfront (10-15 prompts)
- Generates execution plan
- Then zero-ambiguity execution
- Best for: ambiguous requirements, critical work

### CodeRabbit Self-Healing in Dev Phase

```
iteration = 0
while CRITICAL issues found AND iteration < 2:
  auto-fix CRITICAL/HIGH
  iteration++
if CRITICAL persist after 2 iterations:
  HALT — manual intervention required
```

## Phase 4: QA Gate (@qa)

**Task:** `qa-gate.md`

### 7 Quality Checks

1. **Code review** — patterns, readability, maintainability
2. **Unit tests** — adequate coverage, all passing
3. **Acceptance criteria** — all met per story AC
4. **No regressions** — existing functionality preserved
5. **Performance** — within acceptable limits
6. **Security** — OWASP basics verified
7. **Documentation** — updated if necessary

### Gate Decisions

| Decision | Score | Action |
|----------|-------|--------|
| PASS | All checks OK | Approve, proceed to @devops push |
| CONCERNS | Minor issues | Approve with observations documented |
| FAIL | HIGH/CRITICAL issues | Return to @dev with feedback |
| WAIVED | Issues accepted | Approve with waiver documented (rare) |

### Gate File Structure

```yaml
storyId: STORY-42
verdict: PASS | CONCERNS | FAIL | WAIVED
issues:
  - severity: low | medium | high
    category: code | tests | requirements | performance | security | docs
    description: "..."
    recommendation: "..."
```

## QA Loop (Iterative Review-Fix)

```
@qa review → verdict → @dev fixes → re-review (max 5 iterations)
```

**Commands:**
- `*qa-loop {storyId}` — Start full loop
- `*stop-qa-loop` — Pause and save state
- `*resume-qa-loop` — Resume from saved state
- `*escalate-qa-loop` — Force manual escalation

**Escalation triggers:**
- max_iterations_reached (default: 5)
- verdict_blocked
- fix_failure (after retries)
- manual_escalate (user command)

**Status:** Tracked in `qa/loop-status.json`

## Story File Update Rules

| Section | Who Can Edit |
|---------|-------------|
| Title, Description, AC, Scope | @po only |
| File List, Dev Notes, checkboxes | @dev |
| QA Results | @qa only |
| Change Log | Any agent (append only) |
