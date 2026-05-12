# Self-Critique Checklist

## Purpose

This checklist enables the Developer Agent to perform mandatory self-critique at two critical points during subtask execution:

- **Step 5.5**: After writing code, before running tests
- **Step 6.5**: After tests pass, before marking subtask complete

All items must pass to continue. Results are saved to `plan/self-critique-{subtask-id}.json`.

[[LLM: INITIALIZATION INSTRUCTIONS - SELF-CRITIQUE VALIDATION

This checklist is MANDATORY for the subtask executor. Self-critique is not optional.

EXECUTION APPROACH:

1. At Step 5.5 (after writing code):
   - STOP and complete the Step 5.5 checklist
   - You MUST identify at least 3 potential bugs
   - You MUST consider at least 3 edge cases
   - All items must pass before proceeding to tests

2. At Step 6.5 (after tests pass):
   - STOP and complete the Step 6.5 checklist
   - Verify code quality and project standards
   - All items must pass before marking complete

OUTPUT FORMAT:
Generate a JSON report with the schema shown at the end of this checklist.
Save to: plan/self-critique-{subtask-id}.json

SKIP FLAG:
Can be bypassed with --skip-critique flag, but a WARNING must be logged:
"WARNING: Self-critique skipped via --skip-critique. Quality risks may exist."

The goal is catching issues BEFORE they reach review, not checking boxes.]]

---

## Step 5.5: Post-Code Self-Critique

Execute this checklist AFTER writing code, BEFORE running tests.

[[LLM: STEP 5.5 INSTRUCTIONS

For each item, you must provide SPECIFIC examples, not generic statements.

PREDICTED BUGS:

- Think like a hacker: "How could this break?"
- Consider null/undefined, race conditions, off-by-one errors
- What assumptions am I making that could be wrong?

EDGE CASES:

- What happens at boundaries? (empty arrays, max values, special characters)
- What inputs didn't I consider?
- What happens if dependencies fail?

Be honest. Finding bugs NOW saves debugging time LATER.]]

### 5.5.1 Predicted Bugs (minimum 3)

- [ ] Identified potential bug #1: ********\_\_\_\_********
- [ ] Identified potential bug #2: ********\_\_\_\_********
- [ ] Identified potential bug #3: ********\_\_\_\_********
- [ ] (Optional) Additional bugs identified

[[LLM: List specific bugs, not vague concerns. Example:

- "Race condition if two users update the same record simultaneously"
- "Null pointer if user.profile is undefined"
- "Array index out of bounds when items is empty"]]

### 5.5.2 Edge Cases (minimum 3)

- [ ] Considered edge case #1: ********\_\_\_\_********
- [ ] Considered edge case #2: ********\_\_\_\_********
- [ ] Considered edge case #3: ********\_\_\_\_********
- [ ] (Optional) Additional edge cases considered

[[LLM: List specific edge cases with expected behavior. Example:

- "Empty input array should return empty result, not error"
- "Unicode characters in username should be handled"
- "Maximum file size (10MB) should show user-friendly error"]]

### 5.5.3 Error Handling

- [ ] All async operations have try/catch or error boundaries
- [ ] Errors are logged with sufficient context for debugging
- [ ] User-facing errors are friendly and actionable
- [ ] Failed operations don't leave system in inconsistent state
- [ ] Network/API failures are handled gracefully with retry or fallback

### 5.5.4 Security Review

- [ ] No hardcoded secrets, API keys, or credentials
- [ ] User input is validated and sanitized
- [ ] No SQL injection or XSS vulnerabilities introduced
- [ ] Sensitive data is not logged or exposed in errors
- [ ] Authentication/authorization checks are in place where needed

---

## Step 6.5: Post-Test Self-Critique

Execute this checklist AFTER tests pass, BEFORE marking subtask complete.

[[LLM: STEP 6.5 INSTRUCTIONS

This is your final quality gate. Be thorough.

PATTERN ADHERENCE:

- Does the code look like it belongs in this codebase?
- Would another developer understand it without asking questions?

NO HARDCODED VALUES:

- Search for magic numbers, hardcoded strings, inline URLs
- Everything configurable should be in config

TESTS:

- Did you add tests for the new code?
- Are edge cases from 5.5.2 covered by tests?

DOCUMENTATION:

- If the API changed, is it documented?
- If behavior changed, is it noted somewhere?]]

### 6.5.1 Pattern Adherence

- [ ] Code follows existing project patterns and conventions
- [ ] File structure matches project organization
- [ ] Naming conventions are consistent with codebase
- [ ] Import/export patterns match existing code
- [ ] Error handling style matches project standards

### 6.5.2 No Hardcoded Values

- [ ] No magic numbers (use constants or config)
- [ ] No hardcoded URLs or endpoints (use environment/config)
- [ ] No hardcoded timeouts or limits (use config)
- [ ] No inline feature flags (use proper feature flag system)
- [ ] Configurable values are documented

### 6.5.3 Tests Added

- [ ] Unit tests added for new functions/methods
- [ ] Edge cases from Step 5.5.2 are covered by tests
- [ ] Error scenarios have test coverage
- [ ] Tests are deterministic (no random failures)
- [ ] Test names clearly describe what is being tested

### 6.5.4 Documentation Updated

- [ ] JSDoc/TSDoc added for public functions (if applicable)
- [ ] README updated if setup/usage changed
- [ ] API documentation updated if endpoints changed
- [ ] Inline comments explain complex logic
- [ ] CHANGELOG entry added if user-facing change

### 6.5.5 Cleanup Verification

- [ ] No console.log statements left in code
- [ ] No commented-out code blocks
- [ ] No TODO comments without tracking ticket
- [ ] No debugging artifacts (debugger statements, test data)
- [ ] No unused imports or variables

---

## Verdict Determination

[[LLM: VERDICT LOGIC

PASSED: All checklist items are marked [x] or [N/A] with justification
FAILED: Any required item is [ ] without valid justification

If FAILED:

1. List all failing items
2. Do NOT proceed to next step
3. Fix issues and re-run self-critique

Only use [N/A] when genuinely not applicable (e.g., "API docs updated" when no API changes were made). Justify every [N/A].]]

---

## JSON Output Schema

```json
{
  "subtaskId": "1.1",
  "critiquedAt": "2026-01-28T10:00:00Z",
  "step5_5": {
    "predictedBugs": ["bug1", "bug2", "bug3"],
    "edgeCases": ["edge1", "edge2", "edge3"],
    "errorHandling": true,
    "securityCheck": true,
    "passed": true
  },
  "step6_5": {
    "followsPatterns": true,
    "noHardcoded": true,
    "testsAdded": true,
    "docsUpdated": true,
    "noConsoleLogs": true,
    "passed": true
  },
  "overallVerdict": "PASSED",
  "skipped": false,
  "skipWarning": null
}
```

### Field Descriptions

| Field                     | Type                 | Description                           |
| ------------------------- | -------------------- | ------------------------------------- |
| `subtaskId`               | string               | The subtask ID (e.g., "1.1", "2.3")   |
| `critiquedAt`             | ISO 8601             | Timestamp when critique was performed |
| `step5_5.predictedBugs`   | string[]             | List of at least 3 predicted bugs     |
| `step5_5.edgeCases`       | string[]             | List of at least 3 edge cases         |
| `step5_5.errorHandling`   | boolean              | All error handling items passed       |
| `step5_5.securityCheck`   | boolean              | All security items passed             |
| `step5_5.passed`          | boolean              | Overall Step 5.5 passed               |
| `step6_5.followsPatterns` | boolean              | Code follows project patterns         |
| `step6_5.noHardcoded`     | boolean              | No hardcoded values found             |
| `step6_5.testsAdded`      | boolean              | Tests added for new code              |
| `step6_5.docsUpdated`     | boolean              | Documentation updated if needed       |
| `step6_5.noConsoleLogs`   | boolean              | No console.logs or debug artifacts    |
| `step6_5.passed`          | boolean              | Overall Step 6.5 passed               |
| `overallVerdict`          | "PASSED" \| "FAILED" | Final verdict                         |
| `skipped`                 | boolean              | Whether critique was skipped          |
| `skipWarning`             | string \| null       | Warning message if skipped            |

---

## Integration with Subtask Executor

The subtask executor MUST:

1. **Call Step 5.5** after code is written, before `npm test`
2. **Block on failure** - do not proceed if Step 5.5 fails
3. **Call Step 6.5** after tests pass, before marking complete
4. **Block on failure** - do not mark complete if Step 6.5 fails
5. **Save JSON output** to `plan/self-critique-{subtask-id}.json`
6. **Respect --skip-critique flag** but log warning

### Skip Flag Behavior

When `--skip-critique` is passed:

```json
{
  "subtaskId": "1.1",
  "critiquedAt": "2026-01-28T10:00:00Z",
  "step5_5": { "passed": null },
  "step6_5": { "passed": null },
  "overallVerdict": "SKIPPED",
  "skipped": true,
  "skipWarning": "WARNING: Self-critique skipped via --skip-critique. Quality risks may exist."
}
```

---

_Self-Critique Checklist v1.0 - Synkra AIOX Development Framework_
