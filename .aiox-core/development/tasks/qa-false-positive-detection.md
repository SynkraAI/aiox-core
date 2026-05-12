# False Positive Detection Task

Critical thinking checklist to prevent confirmation bias and false positive approvals.

**Absorbed from:** Auto-Claude PR Review Phase 5 - Critical Thinking & False Positive Detection

---

## Task Definition

```yaml
task: qaFalsePositiveDetection()
responsavel: Quinn (Guardian)
atomic_layer: Molecule

inputs:
  - story_id: string (required)
  - issue_type: "bug_fix" | "feature" (default: auto-detect)
  - claimed_fix: string (description of what was fixed)

outputs:
  - verification_report: file (docs/stories/{story-id}/qa/false_positive_check.md)
  - confidence_score: number (0.0 - 1.0)
  - verified: boolean
```

---

## The Problem: Confirmation Bias in QA

```yaml
common_false_positives:
  - name: 'Placebo Fix'
    description: "Change looks like it fixes the bug but doesn't actually address root cause"
    example: 'Adding try-catch around code that errors, but error still occurs'

  - name: 'Timing Coincidence'
    description: 'Bug disappeared due to unrelated change or timing'
    example: 'Race condition that stopped occurring due to added logging'

  - name: 'Environment Dependency'
    description: 'Works in dev but fails in prod due to environment differences'
    example: 'Hardcoded localhost URL that works locally'

  - name: 'Incomplete Fix'
    description: 'Fix addresses one case but not all edge cases'
    example: 'Null check added but undefined still causes crash'

  - name: 'Self-Healing Bug'
    description: 'Bug that intermittently resolves itself'
    example: 'Cache-related bug that clears after restart'
```

---

## Verification Checklist

### 1. Assumptions Verification

```yaml
assumptions_check:
  questions:
    - id: assumption-explicit
      question: 'Are all assumptions explicitly stated?'
      verify: 'List each assumption made about the fix'
      red_flag: 'Implicit assumptions without evidence'

    - id: assumption-verified
      question: 'Is each assumption verified with evidence?'
      verify: 'Link to test, log, or documentation for each'
      red_flag: 'Assumptions taken for granted'

    - id: alternatives-considered
      question: 'Were alternative explanations considered?'
      verify: 'List other possible causes that were ruled out'
      red_flag: 'Only one explanation considered'
```

### 2. Causation Tests

```yaml
causation_tests:
  questions:
    - id: remove-test
      question: 'Can we remove this change and see the problem return?'
      verify: |
        1. Revert the fix (git stash or branch)
        2. Reproduce the original bug
        3. Re-apply the fix
        4. Confirm bug is gone
      pass: 'Bug returns when fix removed, disappears when applied'
      fail: 'Bug behavior unchanged by fix'

    - id: old-code-fails
      question: 'Did we verify the OLD code actually fails?'
      verify: 'Test case showing failure before fix'
      pass: 'Have concrete evidence of failure'
      fail: 'Assumed failure without verification'

    - id: new-code-succeeds
      question: 'Did we verify the NEW code actually succeeds?'
      verify: 'Test case showing success after fix'
      pass: 'Have concrete evidence of success'
      fail: 'Assumed success without verification'

    - id: not-self-healing
      question: 'Is this not a self-healing issue?'
      verify: |
        1. Wait reasonable time
        2. Restart services
        3. Clear caches
        4. Confirm bug still fixed
      pass: 'Bug stays fixed through various conditions'
      fail: 'Bug fix is timing-dependent'
```

### 3. Confirmation Bias Checks

```yaml
bias_checks:
  questions:
    - id: negative-cases
      question: 'Were negative cases tested?'
      verify: 'List scenarios where the code SHOULD fail/reject'
      pass: 'Negative cases defined and tested'
      fail: 'Only happy path tested'

    - id: independent-verification
      question: 'Can someone else independently verify?'
      verify: 'Reproduction steps clear enough for another person'
      pass: 'Steps are complete and reproducible'
      fail: "Requires original developer's environment/knowledge"

    - id: mechanism-explained
      question: 'Can we explain the mechanism, not just the result?'
      verify: |
        Explain WHY the fix works:
        - What was the root cause?
        - How does the change address it?
        - Why won't it regress?
      pass: 'Clear causal explanation'
      fail: 'Only know THAT it works, not WHY'
```

### 4. Edge Case Verification

```yaml
edge_cases:
  for_bug_fix:
    - 'Null/undefined inputs'
    - 'Empty strings/arrays'
    - 'Maximum/minimum values'
    - 'Concurrent access'
    - 'Network failures'
    - 'Timeout conditions'

  for_feature:
    - 'First time use'
    - 'Repeated use'
    - 'Invalid input'
    - 'Permission denied'
    - 'Rate limiting'
    - 'Offline mode'
```

---

## Confidence Scoring

```yaml
confidence_calculation:
  weights:
    assumptions_verified: 0.20
    remove_test_passed: 0.25 # Most important
    old_code_fails: 0.15
    new_code_succeeds: 0.15
    not_self_healing: 0.10
    negative_cases_tested: 0.10
    mechanism_explained: 0.05

  thresholds:
    high_confidence: '>= 0.85'
    medium_confidence: '>= 0.65'
    low_confidence: '< 0.65'

  actions:
    high: 'Approve with confidence'
    medium: 'Approve with notes'
    low: 'Require additional verification or reject'
```

---

## Command

```
*false-positive-check {story-id} [--claimed-fix "description"]
```

**Examples:**

```bash
*false-positive-check 6.3
*false-positive-check 6.3 --claimed-fix "Fixed null pointer by adding null check"
```

---

## Workflow

### Phase 1: Collect Context

```yaml
collect:
  - story_file: Load story and acceptance criteria
  - commits: Get commits for this story
  - diff: Get code changes
  - tests: Get new/modified tests
  - claimed_fix: From parameter or extract from commits
```

### Phase 2: Run Verification Checklist

```yaml
verify:
  - Run each question in verification checklist
  - For automated checks (like remove-test), execute if possible
  - For manual checks, prompt for evidence
  - Calculate confidence score
```

### Phase 3: Generate Report

```yaml
report:
  - Generate false_positive_check.md
  - Include confidence score
  - List any red flags
  - Provide recommendation
```

---

## Report Template

```markdown
# False Positive Detection Report: Story {storyId}

**Generated:** {timestamp}
**Reviewer:** Quinn (Test Architect)
**Confidence Score:** {score}/1.0 ({high|medium|low})

---

## Claimed Fix

> {claimed_fix_description}

---

## Verification Results

### Assumptions Verification

| Check                   | Status | Evidence |
| ----------------------- | ------ | -------- |
| Assumptions explicit    | ✅/❌  | {link}   |
| Assumptions verified    | ✅/❌  | {link}   |
| Alternatives considered | ✅/❌  | {link}   |

### Causation Tests

| Test                      | Status | Evidence |
| ------------------------- | ------ | -------- |
| Remove test (bug returns) | ✅/❌  | {link}   |
| Old code fails            | ✅/❌  | {link}   |
| New code succeeds         | ✅/❌  | {link}   |
| Not self-healing          | ✅/❌  | {link}   |

### Confirmation Bias Checks

| Check                    | Status | Evidence |
| ------------------------ | ------ | -------- |
| Negative cases tested    | ✅/❌  | {link}   |
| Independent verification | ✅/❌  | {link}   |
| Mechanism explained      | ✅/❌  | {link}   |

---

## Red Flags

{list of red flags if any}

---

## Confidence Calculation

| Factor               | Weight | Score | Weighted    |
| -------------------- | ------ | ----- | ----------- |
| Assumptions verified | 0.20   | {0-1} | {result}    |
| Remove test passed   | 0.25   | {0-1} | {result}    |
| Old code fails       | 0.15   | {0-1} | {result}    |
| New code succeeds    | 0.15   | {0-1} | {result}    |
| Not self-healing     | 0.10   | {0-1} | {result}    |
| Negative cases       | 0.10   | {0-1} | {result}    |
| Mechanism explained  | 0.05   | {0-1} | {result}    |
| **Total**            | 1.00   | -     | **{total}** |

---

## Recommendation

**{VERIFIED | NEEDS_MORE_EVIDENCE | LIKELY_FALSE_POSITIVE}**

{recommendation_explanation}

**Next Steps:**
{next_steps_list}

---

_Generated by Quinn (@qa) - False Positive Detection Task_
```

---

## Integration with QA Review

```yaml
integration:
  trigger: During *review-build for bug fixes

  workflow: 1. Detect if story is bug fix
    2. If yes, run false positive detection
    3. Include confidence score in qa_report.md
    4. Factor into final APPROVE/REJECT decision

  decision_rules:
    - confidence >= 0.85: No impact on decision
    - confidence >= 0.65: Add note to review
    - confidence < 0.65: Strong consideration for REJECT
```

---

## Quick Reference: Red Flags

```yaml
red_flags:
  - 'Fix only tested on happy path'
  - 'Cannot reproduce original bug'
  - 'Fix works but mechanism unclear'
  - 'Depends on specific timing/environment'
  - 'No test added to prevent regression'
  - 'Similar code elsewhere not checked'
  - 'Assumptions not documented'
  - 'Only one explanation considered'
```

---

## Metadata

```yaml
metadata:
  version: 1.0.0
  source: Auto-Claude PR Review Phase 5
  tags:
    - qa-enhancement
    - false-positive
    - critical-thinking
    - bias-detection
  updated_at: 2026-01-29
```
