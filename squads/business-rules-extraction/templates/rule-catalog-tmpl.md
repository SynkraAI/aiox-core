# Rule Catalog — {System Name}

## Metadata

| Field | Value |
|-------|-------|
| System | {system_name} |
| Domain | {business_domain} |
| Stack | {technology_stack} |
| Extraction Date | {YYYY-MM-DD} |
| Total Rules | {count} |
| Validated | {count} ({percentage}%) |
| Confidence | {high/medium/low} |

## Executive Summary

{2-3 paragraphs describing:
- What system was analyzed
- How many rules were extracted
- Key findings and patterns
- Recommendations for next steps}

## Business Glossary

| Term | Definition | Source |
|------|-----------|--------|
| {term_1} | {definition} | {source_reference} |
| {term_2} | {definition} | {source_reference} |

## Rule Families

### RF-001: {Rule Family Name}

**Conclusion:** {What this family determines}
**Rules:** {count}
**Priority:** {critical/high/medium/low}

| Rule ID | Statement (RuleSpeak) | Confidence | Validated |
|---------|----------------------|------------|-----------|
| BR-{MOD}-001 | {rule statement} | High | Yes |
| BR-{MOD}-002 | {rule statement} | Medium | No |

**Decision Table:** DT-{MOD}-001

| {Condition 1} | {Condition 2} | → {Conclusion} |
|---------------|---------------|----------------|
| {val} | {val} | {result} |
| {val} | {val} | {result} |

---

### RF-002: {Rule Family Name}

{Same structure as above}

---

## Cross-References

### Rules by Module

| Module | Rules | Critical | Validated |
|--------|-------|----------|-----------|
| {module_1} | {count} | {count} | {percentage}% |
| {module_2} | {count} | {count} | {percentage}% |

### Rules by Type

| Type | Count | Percentage |
|------|-------|------------|
| Definitional | {count} | {%} |
| Behavioral | {count} | {%} |
| Constraint | {count} | {%} |
| Derivation | {count} | {%} |
| Inference | {count} | {%} |

## Verification Summary

| Metric | Value |
|--------|-------|
| Decision Tables Created | {count} |
| Tables Complete | {count} ({%}) |
| Tables Consistent | {count} ({%}) |
| Contradictions Found | {count} |
| Missing Combinations | {count} |

## Source Traceability

| Rule ID | Source File | Lines | Language | Method |
|---------|-----------|-------|----------|--------|
| BR-{MOD}-001 | {file} | {lines} | {lang} | {method} |

## DMN Export

DMN file available at: `{path_to_dmn_file}`

## Appendices

### A. Dead Code Report
{List of identified dead code that was excluded from extraction}

### B. Unresolved Rules
{Rules that could not be fully extracted or validated}

### C. Recommendations
{Next steps: modernization, further analysis, SME validation needed}
