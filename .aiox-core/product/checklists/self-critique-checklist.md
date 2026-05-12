# Self-Critique Checklist

> **Used By:** `plan-execute-subtask.md` (Coder Agent Steps 5.5 & 6.5)
> **Purpose:** Mandatory self-review checkpoints to catch issues before they propagate

---

## Overview

This checklist is executed TWICE during subtask execution:

1. **Step 5.5 (Post-Code):** After writing code, before running tests
2. **Step 6.5 (Post-Test):** After tests pass, before committing

Both phases are MANDATORY. Skipping them violates the Coder Agent workflow.

---

## Step 5.5: Post-Code Self-Critique

> **Trigger:** After Step 5 (Write Code) completes
> **Goal:** Catch bugs, edge cases, and security issues BEFORE running tests

### Checklist Items

```yaml
post_code_critique:
  - id: SC-5.5.1
    category: bugs
    question: 'Are there any predicted bugs in this code?'
    how_to_check:
      - Review logic flow for off-by-one errors
      - Check loop termination conditions
      - Verify correct operator usage (= vs ==, && vs ||)
      - Look for null/undefined dereferences
    action_if_found: 'Fix immediately before proceeding'
    severity: HIGH

  - id: SC-5.5.2
    category: edge_cases
    question: 'Have all edge cases been handled?'
    how_to_check:
      - Null/undefined inputs
      - Empty arrays/objects
      - Boundary values (0, -1, MAX_INT)
      - Empty strings vs null
      - Unicode and special characters
    action_if_found: 'Add guards or validation'
    severity: HIGH

  - id: SC-5.5.3
    category: error_handling
    question: 'Is error handling comprehensive?'
    how_to_check:
      - All async operations have try/catch
      - Error messages are user-friendly
      - Errors include context (what operation failed)
      - Errors don't expose sensitive info
      - Recovery paths are defined where possible
    action_if_found: 'Add appropriate error handling'
    severity: HIGH

  - id: SC-5.5.4
    category: security
    question: 'Are there any security vulnerabilities?'
    how_to_check:
      - Input validation present
      - SQL/NoSQL injection prevention
      - XSS prevention (output encoding)
      - Sensitive data not logged
      - Auth/authz checks in place
      - No hardcoded secrets
    action_if_found: 'Fix security issue immediately'
    severity: CRITICAL

  - id: SC-5.5.5
    category: resilience
    question: 'Does the code handle failure gracefully?'
    how_to_check:
      - Network failures handled
      - Timeouts configured
      - Retries where appropriate
      - User gets feedback on failure
      - Partial failures don't corrupt state
    action_if_found: 'Add failure handling'
    severity: MEDIUM
```

### Execution Process

```
1. PAUSE after writing code (Step 5 complete)
2. Re-read ALL code written in this subtask
3. For EACH checklist item:
   a. Ask yourself the question
   b. Use "how_to_check" to verify
   c. If issue found:
      - Document it
      - Fix immediately
      - Mark as fixed
4. If ANY issues were fixed:
   - Re-run this checklist from start
5. Only proceed when ALL items pass
```

### Pass Criteria

- [ ] SC-5.5.1: No predicted bugs (or all fixed)
- [ ] SC-5.5.2: Edge cases handled
- [ ] SC-5.5.3: Error handling comprehensive
- [ ] SC-5.5.4: No security vulnerabilities
- [ ] SC-5.5.5: Failure handling in place

---

## Step 6.5: Post-Test Self-Critique

> **Trigger:** After Step 6 (Run Tests) passes
> **Goal:** Ensure code quality, maintainability, and adherence to standards

### Checklist Items

```yaml
post_test_critique:
  - id: SC-6.5.1
    category: patterns
    question: 'Does the code follow existing patterns in the codebase?'
    how_to_check:
      - Compare with similar files in the project
      - Check naming conventions match
      - Directory structure follows conventions
      - Import style consistent
      - Error handling style matches existing
    action_if_found: 'Refactor to match patterns'
    severity: MEDIUM

  - id: SC-6.5.2
    category: configuration
    question: 'Are there any hardcoded values that should be configurable?'
    how_to_check:
      - Magic numbers (should be named constants)
      - URLs, endpoints (should be config/env)
      - Timeouts, limits (should be configurable)
      - Feature flags (should be toggleable)
      - API keys (MUST be env vars)
    action_if_found: 'Extract to constants/config/env'
    severity: HIGH

  - id: SC-6.5.3
    category: testing
    question: 'Are tests comprehensive enough?'
    how_to_check:
      - Happy path covered
      - Error/exception paths covered
      - Edge cases from 5.5.2 have tests
      - Boundary values tested
      - Integration points tested
    action_if_found: 'Add missing tests'
    severity: HIGH

  - id: SC-6.5.4
    category: documentation
    question: 'Is documentation updated where needed?'
    how_to_check:
      - JSDoc/TSDoc for public functions
      - Inline comments for complex logic
      - README updated if behavior changed
      - API docs if endpoints added/changed
      - Type definitions accurate
    action_if_found: 'Add documentation'
    severity: MEDIUM

  - id: SC-6.5.5
    category: code_smells
    question: 'Are there any code smells?'
    how_to_check:
      - Functions > 50 lines (should split)
      - Duplicated code (should extract)
      - Deep nesting > 3 levels (should flatten)
      - Complex conditionals (should simplify)
      - God objects (should decompose)
      - Dead code (should remove)
    action_if_found: 'Refactor to remove smell'
    severity: MEDIUM

  - id: SC-6.5.6
    category: maintainability
    question: 'Will this code be maintainable by others?'
    how_to_check:
      - Variable/function names self-documenting
      - Logic easy to follow
      - Single responsibility principle
      - Dependencies explicit
      - Side effects documented
    action_if_found: 'Improve clarity'
    severity: MEDIUM
```

### Execution Process

```
1. PAUSE after tests pass (Step 6 complete)
2. Review ALL code against this checklist
3. For EACH checklist item:
   a. Ask yourself the question
   b. Use "how_to_check" to verify
   c. If issue found:
      - Document it
      - Fix the code
      - Mark as fixed
4. If ANY code changes were made:
   - Return to Step 6 (re-run tests)
   - If tests pass, continue checklist
5. Only proceed when ALL items pass AND tests pass
```

### Pass Criteria

- [ ] SC-6.5.1: Follows codebase patterns
- [ ] SC-6.5.2: No inappropriate hardcoded values
- [ ] SC-6.5.3: Tests are comprehensive
- [ ] SC-6.5.4: Documentation is current
- [ ] SC-6.5.5: No code smells
- [ ] SC-6.5.6: Code is maintainable

---

## Summary Report Format

After both self-critique phases complete, generate a summary:

```markdown
### Self-Critique Summary

#### Step 5.5 (Post-Code)

- **Status:** PASSED
- **Issues Found:** 2
- **Issues Fixed:** 2
  - SC-5.5.2: Added null check for input array
  - SC-5.5.3: Added try/catch for async operation

#### Step 6.5 (Post-Test)

- **Status:** PASSED
- **Issues Found:** 1
- **Issues Fixed:** 1
  - SC-6.5.2: Extracted timeout to config constant
- **Tests Re-run:** Yes (after fix)

**Total Issues Found:** 3
**Total Issues Fixed:** 3
**Ready to Commit:** YES
```

---

## Anti-Patterns to Avoid

```yaml
anti_patterns:
  - name: 'Rubber Stamp'
    description: "Marking all items as 'pass' without actually checking"
    why_bad: 'Defeats the purpose of self-critique'
    how_to_avoid: 'Actually re-read the code for each item'

  - name: 'Defer to Tests'
    description: "Skipping 5.5 because 'tests will catch it'"
    why_bad: "Tests don't catch all issues (security, maintainability)"
    how_to_avoid: 'Run 5.5 before tests, always'

  - name: 'Skip on Simple Code'
    description: "Skipping self-critique for 'simple' changes"
    why_bad: 'Simple changes often have subtle bugs'
    how_to_avoid: 'Run full checklist regardless of perceived simplicity'

  - name: 'Infinite Loop'
    description: 'Finding issues > 5 times in same checklist'
    why_bad: 'Indicates fundamental approach problem'
    how_to_avoid: 'If 5+ issues, stop and reconsider approach'
```

---

## Integration with Coder Agent

This checklist is referenced by:

- `.aiox-core/development/tasks/plan-execute-subtask.md`
- `autoClaude.selfCritique.checklistRef: self-critique-checklist.md`

Steps 5.5 and 6.5 in the Coder Agent workflow are MANDATORY gates. The subtask cannot proceed without passing these checkpoints.

---

## Skip Critique Flag (AC7 Story 4.4)

### Usage

```bash
*execute-subtask ST-1.1 --skip-critique
```

### Configuration

```yaml
skip_critique:
  flag: '--skip-critique'
  aliases:
    - '--no-critique'
    - '--skip-review'

  behavior:
    - Skips both Step 5.5 and Step 6.5
    - Logs warning to console and story file
    - Records skip in self-critique JSON with reason "SKIPPED_BY_FLAG"
    - Does NOT skip tests or linting (only self-review)

  warning_message: |
    ⚠️  WARNING: Self-critique skipped via --skip-critique flag

    This bypasses mandatory quality gates:
    - Step 5.5: Post-code bug/security review
    - Step 6.5: Post-test pattern/quality review

    Risks:
    - Bugs may reach QA that would have been caught
    - Security vulnerabilities may be introduced
    - Code quality may degrade
    - Technical debt may accumulate

    Only use this flag when:
    - Hotfix deployment with time constraint
    - Trivial documentation-only changes
    - Reverting a previous commit

    This skip will be logged and visible in QA review.
```

### When to Use

| Scenario                   | Recommended   |
| -------------------------- | ------------- |
| Hotfix in production       | ✅ Acceptable |
| Documentation-only change  | ✅ Acceptable |
| Reverting a commit         | ✅ Acceptable |
| "I'm confident in my code" | ❌ Never      |
| "Tests already pass"       | ❌ Never      |
| "It's a simple change"     | ❌ Never      |
| Time pressure              | ❌ Never      |

### Audit Trail

When `--skip-critique` is used, the following is recorded:

```json
{
  "subtaskId": "ST-1.1",
  "phase": "5.5",
  "timestamp": "2026-01-28T10:00:00Z",
  "passed": null,
  "skipped": true,
  "skipReason": "SKIPPED_BY_FLAG",
  "skipWarningShown": true
}
```

This audit trail is visible to QA during review and may result in additional scrutiny.

---

## Metadata

```yaml
metadata:
  story: '4.3'
  epic: 'Epic 4 - Execution Pipeline'
  created: '2026-01-28'
  author: '@dev (Dex)'
  version: '1.0.0'
  tags:
    - self-critique
    - quality
    - coder-agent
    - checklist
```
