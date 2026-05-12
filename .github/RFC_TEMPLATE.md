# RFC: [Title]

**RFC ID:** RFC-XXXX
**Author:** @username
**Status:** Draft | Under Review | Accepted | Rejected | Withdrawn
**Created:** YYYY-MM-DD
**Last Updated:** YYYY-MM-DD
**Related Story:** [Story ID if applicable]

---

## Summary

> One paragraph explanation of the proposed change. What is it and what does it do?

[Write a clear, concise summary here]

---

## Motivation

> Why are we doing this? What use cases does it support? What is the expected outcome?

### Problem Statement

[Describe the problem or limitation being addressed]

### Use Cases

1. **Use Case 1:** [Description]
2. **Use Case 2:** [Description]
3. **Use Case 3:** [Description]

### Expected Outcome

[What will be possible after this change is implemented?]

---

## Detailed Design

> Explain the design in enough detail that:
>
> - Someone familiar with AIOX can understand
> - Someone familiar with the implementation can implement it

### Overview

[High-level description of the solution]

### Technical Approach

[Detailed technical explanation]

### Architecture Changes

```
[ASCII diagram or description of architecture changes]
```

### API Changes (if any)

```typescript
// Before
interface OldAPI {
  // ...
}

// After
interface NewAPI {
  // ...
}
```

### File Structure Changes

| Action | Path                       | Description   |
| ------ | -------------------------- | ------------- |
| ADD    | `path/to/new/file.ts`      | [Description] |
| MODIFY | `path/to/existing/file.ts` | [Description] |
| DELETE | `path/to/obsolete/file.ts` | [Description] |

### Breaking Changes

> List any breaking changes and their impact

| Change     | Impact            | Migration Path   |
| ---------- | ----------------- | ---------------- |
| [Change 1] | [Who is affected] | [How to migrate] |

---

## Drawbacks

> Why should we NOT do this? What are the risks?

1. **Drawback 1:** [Description]
2. **Drawback 2:** [Description]
3. **Complexity:** [Additional complexity introduced]
4. **Maintenance:** [Long-term maintenance considerations]

---

## Alternatives

> What other designs have been considered? What is the impact of not doing this?

### Alternative 1: [Name]

**Description:** [Explain the alternative]

**Pros:**

- [Pro 1]
- [Pro 2]

**Cons:**

- [Con 1]
- [Con 2]

**Why not chosen:** [Reason]

### Alternative 2: [Name]

[Same structure as above]

### Do Nothing

**Impact of not implementing this RFC:**

- [Impact 1]
- [Impact 2]

---

## Adoption Strategy

> How will existing users adopt this feature?

### Migration Steps

1. **Step 1:** [Description]
2. **Step 2:** [Description]
3. **Step 3:** [Description]

### Backward Compatibility

[Explain backward compatibility considerations]

### Deprecation Timeline (if applicable)

| Phase        | Date       | Action                    |
| ------------ | ---------- | ------------------------- |
| Announcement | YYYY-MM-DD | Announce deprecation      |
| Warning      | YYYY-MM-DD | Add deprecation warnings  |
| Removal      | YYYY-MM-DD | Remove deprecated feature |

### Documentation Updates Required

- [ ] README.md
- [ ] API Documentation
- [ ] Migration Guide
- [ ] Changelog

---

## Unresolved Questions

> What parts of the design are still TBD?

1. **Question 1:** [Open question requiring discussion]
2. **Question 2:** [Technical decision pending]
3. **Question 3:** [Needs community input]

---

## Implementation Plan

### Phases

| Phase   | Description   | Estimated Effort | Dependencies |
| ------- | ------------- | ---------------- | ------------ |
| Phase 1 | [Description] | [X days/weeks]   | None         |
| Phase 2 | [Description] | [X days/weeks]   | Phase 1      |
| Phase 3 | [Description] | [X days/weeks]   | Phase 2      |

### Success Metrics

- [ ] [Metric 1: e.g., "All tests passing"]
- [ ] [Metric 2: e.g., "Documentation complete"]
- [ ] [Metric 3: e.g., "Performance benchmarks met"]

---

## Related Work

- **Related RFCs:** [RFC-XXXX, RFC-YYYY]
- **Related Issues:** [#123, #456]
- **External References:** [Links to relevant external resources]

---

## Feedback Period

This RFC is open for comments until: **YYYY-MM-DD**

### How to Provide Feedback

1. Comment on this Discussion
2. React with :+1: or :-1: on specific proposals
3. Suggest alternatives with detailed reasoning
4. Tag relevant stakeholders: @SynkraAI/core-team

### Stakeholders to Review

- [ ] @architecture-team
- [ ] @core-maintainers
- [ ] [Other relevant teams]

---

## Decision

**Decision:** Pending | Accepted | Rejected | Deferred
**Date:** YYYY-MM-DD
**Decision Makers:** [@username1, @username2]

### Rationale

[Explanation of the final decision and reasoning]

### Conditions (if any)

[Any conditions that must be met for acceptance]

---

**Note:** This template follows the AIOX RFC process. For questions about the process, see [CONTRIBUTING.md](/CONTRIBUTING.md).
