# Output Structure Templates

Templates for files generated in each deep research.

---

## Folder Structure

```
docs/research/{YYYY-MM-DD}-{slug}/
+-- README.md                    # Index and TL;DR
+-- 00-query-original.md         # Original question + context
+-- 01-deep-research-prompt.md   # Generated research prompt
+-- 02-research-report.md        # Complete findings
+-- 03-recommendations.md        # Recommendations and next steps
+-- 04-*.md, 05-*.md, ...        # Follow-up research (numbered)
```

---

## README.md

```markdown
# Research: {TITLE}

> **Date:** {DATE}
> **Topic:** {TOPIC}
> **Type:** {RESEARCH_TYPE}
> **Status:** {STATUS}
> **Coverage:** {COVERAGE_SCORE}%

---

## TL;DR

{SUMMARY_3_SENTENCES}

---

## Index

| # | File | Description |
|---|------|-------------|
| 00 | [query-original.md](./00-query-original.md) | Original question and context |
| 01 | [deep-research-prompt.md](./01-deep-research-prompt.md) | Structured prompt |
| 02 | [research-report.md](./02-research-report.md) | Complete report |
| 03 | [recommendations.md](./03-recommendations.md) | Final recommendations |

---

## Key References

{TOP_5_REFERENCES}
```

---

## 00-query-original.md

```markdown
# Original Query

> **Date:** {DATE}

## Original Question

> "{ORIGINAL_QUERY}"

## Inferred Context

- **Research Type:** {RESEARCH_TYPE}
- **Geographic Scope:** {GEOGRAPHIC_SCOPE}
- **Temporal Scope:** {TEMPORAL_SCOPE}
- **Language:** {LANGUAGE}

## Clarifications (if any)

{CLARIFICATIONS}
```

---

## 01-deep-research-prompt.md

```markdown
# Deep Research Prompt

> **Generated on:** {DATE}

## Prompt Used

{GENERATED_PROMPT}

## Decomposed Sub-Queries

{SUB_QUERIES_LIST}

## Coverage Evaluation Summary

| Wave | Coverage | New Info | Decision |
|------|----------|----------|----------|
{WAVE_SUMMARY_TABLE}
```

---

## 02-research-report.md

```markdown
# {TITLE}

> **Research Report** | {DATE}
> **Type:** {RESEARCH_TYPE} | **Coverage:** {COVERAGE_SCORE}%

---

## Executive Summary

{EXECUTIVE_SUMMARY}

---

## 1. Fundamentals

{SECTION_FUNDAMENTALS}

---

## 2. Evidence & Data

{SECTION_EVIDENCE}

---

## 3. Expert Perspectives

{SECTION_PERSPECTIVES}

---

## 4. Applications & Examples

{SECTION_APPLICATIONS}

---

## 5. Trends & Current State

{SECTION_TRENDS}

---

## 6. Risks, Gaps & Limitations

{SECTION_RISKS}

---

## Citation Integrity

> Integrity Score: {INTEGRITY_SCORE}%

{CITATION_SUMMARY}

---

## References

{REFERENCES_WITH_URLS}
```

---

## 03-recommendations.md

```markdown
# Recommendations

> **Date:** {DATE}

---

## Key Takeaways

{TOP_3_TAKEAWAYS}

---

## Ranked Recommendations

| # | Recommendation | Impact | Effort | Priority |
|---|----------------|--------|--------|----------|
{RANKED_RECOMMENDATIONS_TABLE}

---

## Decision Framework

{DECISION_FRAMEWORK}

---

## Next Steps

### Immediate Actions
1. {ACTION_1}
2. {ACTION_2}
3. {ACTION_3}

### For Further Research
{FURTHER_RESEARCH_SUGGESTIONS}

---

## Related Resources

{RELATED_RESOURCES}
```

---

## Follow-up Files (04-*.md, 05-*.md, ...)

For follow-up research on the same topic:

```markdown
# Follow-up: {FOLLOWUP_TITLE}

> **Date:** {DATE}
> **Related to:** [02-research-report.md](./02-research-report.md)

## Follow-up Question

> "{FOLLOWUP_QUERY}"

## Additional Findings

{ADDITIONAL_FINDINGS}

## Updated Recommendations

{UPDATED_RECOMMENDATIONS}
```

---

## Follow-up Rules

1. **NEVER** create new folder for follow-up on same topic
2. Number sequentially: 04-*, 05-*, 06-*
3. Update README.md with new files
4. Keep reference to original related file
