# Business Rules Extraction Report — {System Name}

## System Metadata

| Field | Value |
|-------|-------|
| System Name | {system_name} |
| Domain | {business_domain} |
| Stack | {technology_stack} |
| Language(s) | {COBOL/Java/C#/PL-SQL/ABAP/etc} |
| LOC Analyzed | {line_count} |
| Modules Analyzed | {module_count} |
| Extraction Date | {YYYY-MM-DD} |
| Extraction Duration | {hours/days} |
| Lead Agent | {agent_name} |

---

## Executive Summary

{2-3 paragraphs describing:
- What system was analyzed and why
- Key findings from the extraction
- Overall health and quality of extracted rules
- High-level recommendations}

---

## Extraction Summary

### Total Rules Extracted

| Metric | Count | Percentage |
|--------|-------|------------|
| **Total Rules** | {total_count} | 100% |
| Critical | {critical_count} | {%} |
| High Priority | {high_count} | {%} |
| Medium Priority | {medium_count} | {%} |
| Low Priority | {low_count} | {%} |

### Rules by Module

| Module | Rules | Critical | High | Medium | Low | Validated |
|--------|-------|----------|------|--------|-----|-----------|
| {module_1} | {count} | {count} | {count} | {count} | {count} | {percentage}% |
| {module_2} | {count} | {count} | {count} | {count} | {count} | {percentage}% |
| {module_3} | {count} | {count} | {count} | {count} | {count} | {percentage}% |

### Rules by Type (Business Rules Manifesto taxonomy)

| Type | Count | Percentage | Description |
|------|-------|------------|-------------|
| Definitional | {count} | {%} | What things mean |
| Behavioral | {count} | {%} | What must/should happen |
| Constraint | {count} | {%} | What is allowed/forbidden |
| Derivation | {count} | {%} | How to calculate |
| Inference | {count} | {%} | What to conclude |

### Rules by Criticality

| Criticality | Count | % of Total | Business Impact |
|-------------|-------|------------|-----------------|
| Critical | {count} | {%} | {impact description} |
| High | {count} | {%} | {impact description} |
| Medium | {count} | {%} | {impact description} |
| Low | {count} | {%} | {impact description} |

---

## Phase Completion Status

### Phase 1: Code Reconnaissance ✓

- **Completed:** {YYYY-MM-DD HH:MM}
- **Duration:** {hours}
- **Files Analyzed:** {count}
- **Dead Code Identified:** {count} files/functions
- **Entry Points Mapped:** {count}

**Deliverables:**
- [ ] Characterization test suite (if applicable)
- [x] Control flow graph
- [x] Dead code report

**Notes:** {any observations or issues}

---

### Phase 2: Business Glossary Construction ✓

- **Completed:** {YYYY-MM-DD HH:MM}
- **Duration:** {hours}
- **Terms Extracted:** {count}
- **SME Validated:** {count} ({percentage}%)

**Deliverables:**
- [x] Business glossary
- [x] Domain model diagram

**Notes:** {any observations or issues}

---

### Phase 3: Rule Mining ✓

- **Completed:** {YYYY-MM-DD HH:MM}
- **Duration:** {hours}
- **Extraction Methods Used:**
  - Static analysis: {percentage}%
  - Characterization tests: {percentage}%
  - SME interviews: {percentage}%
  - Documentation: {percentage}%

**Deliverables:**
- [x] {count} business rule YAML files
- [x] Source traceability matrix

**Notes:** {any observations or issues}

---

### Phase 4: Normalization (von Halle) ✓

- **Completed:** {YYYY-MM-DD HH:MM}
- **Duration:** {hours}
- **Decision Tables Created:** {count}
- **Rule Families Identified:** {count}

**Deliverables:**
- [x] {count} decision table YAML files
- [x] Normalized rule catalog

**Notes:** {any observations or issues}

---

### Phase 5: Verification (Vanthienen) ✓

- **Completed:** {YYYY-MM-DD HH:MM}
- **Duration:** {hours}
- **Tables Verified:** {count}
- **Issues Found:** {count}

**Deliverables:**
- [x] Verification report
- [x] Corrected decision tables

**Notes:** {any observations or issues}

---

### Phase 6: Validation & Export ✓

- **Completed:** {YYYY-MM-DD HH:MM}
- **Duration:** {hours}
- **SME Sessions:** {count}
- **Rules Validated:** {count} ({percentage}%)

**Deliverables:**
- [x] Rule catalog (Markdown)
- [x] DMN export files
- [x] Validation sign-off

**Notes:** {any observations or issues}

---

## Coverage Metrics

### Code Coverage

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Modules Analyzed | {count}/{total} | 100% | {on-track/at-risk} |
| LOC Covered | {count}/{total} | 95%+ | {on-track/at-risk} |
| Dead Code Excluded | {percentage}% | — | — |
| Entry Points Traced | {count}/{total} | 100% | {on-track/at-risk} |

### Business Coverage

| Metric | Value | Notes |
|--------|-------|-------|
| Business Processes Covered | {count} | {list key processes} |
| Regulatory Rules Identified | {count} | {list regulations} |
| Exception Paths Documented | {count} | {notes} |

---

## Quality Metrics

### Normalization Quality (von Halle)

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Decision Tables Created | {count} | — | — |
| Tables in 1NF | {count} ({%}) | 100% | {✓/✗} |
| Tables in 2NF | {count} ({%}) | 100% | {✓/✗} |
| Tables in 3NF | {count} ({%}) | 95%+ | {✓/✗} |
| Rule Families Identified | {count} | — | — |

### Verification Quality (Vanthienen)

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Complete Tables | {count} ({%}) | 100% | {✓/✗} |
| Consistent Tables | {count} ({%}) | 100% | {✓/✗} |
| Contradictions Resolved | {count}/{total} | 100% | {✓/✗} |
| Missing Combinations | {count} | 0 | {✓/✗} |
| Redundant Rows Removed | {count} | — | — |

### Traceability Quality

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Rules with Source Traceability | {count} ({%}) | 100% | {✓/✗} |
| High Confidence Rules | {count} ({%}) | 80%+ | {✓/✗} |
| Medium Confidence Rules | {count} ({%}) | <15% | {✓/✗} |
| Low Confidence Rules | {count} ({%}) | <5% | {✓/✗} |

### Readability Score (RuleSpeak)

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Rules in RuleSpeak Format | {count} ({%}) | 100% | {✓/✗} |
| Avg Words per Rule | {average} | <50 | {✓/✗} |
| Rules Understandable to Non-Tech | {%} | 95%+ | {✓/✗} |

### Validation Quality

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Critical Rules Validated | {count} ({%}) | 100% | {✓/✗} |
| High Priority Validated | {count} ({%}) | 100% | {✓/✗} |
| Medium Priority Validated | {count} ({%}) | 80%+ | {✓/✗} |
| SME Engagement | {hours/sessions} | — | — |

---

## Gaps and Risks Identified

### Extraction Gaps

| Gap | Severity | Impact | Mitigation |
|-----|----------|--------|------------|
| {description} | Critical/High/Medium/Low | {impact} | {mitigation plan} |

### Business Rule Gaps

| Gap | Module | Impact | Recommendation |
|-----|--------|--------|----------------|
| {missing rule or logic} | {module} | {impact} | {recommendation} |

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| {description} | High/Medium/Low | {impact} | {mitigation plan} |

### Regulatory Risks

| Risk | Regulation | Impact | Urgency |
|------|-----------|--------|---------|
| {description} | {regulation ref} | {impact} | Immediate/High/Medium/Low |

---

## Recommendations for Next Steps

### Immediate Actions (0-30 days)

1. **{Action 1}**
   - Owner: {owner}
   - Effort: {hours/days}
   - Rationale: {why this is important}

2. **{Action 2}**
   - Owner: {owner}
   - Effort: {hours/days}
   - Rationale: {why this is important}

### Short-Term Actions (1-3 months)

1. **{Action}**
   - Dependencies: {what must happen first}
   - Deliverable: {what will be produced}

### Long-Term Strategy (3-12 months)

- **{Strategic recommendation}**: {description}
- **{Strategic recommendation}**: {description}

---

## Deliverables Inventory

| Artifact | Location | Format | Status |
|----------|----------|--------|--------|
| Business Rule YAML files | `{path}` | YAML | Complete |
| Decision Table YAML files | `{path}` | YAML | Complete |
| Rule Catalog | `{path}` | Markdown | Complete |
| DMN Export | `{path}` | XML | Complete |
| Business Glossary | `{path}` | Markdown/YAML | Complete |
| Dead Code Report | `{path}` | Markdown | Complete |
| Control Flow Graphs | `{path}` | PNG/SVG | Complete |
| Verification Report | `{path}` | Markdown | Complete |
| SME Validation Sign-off | `{path}` | PDF/Markdown | {Pending/Complete} |

---

## Appendices

### A. Extraction Methodology

{Brief description of extraction approach, tools used, and any deviations from standard workflow}

### B. SME Engagement Summary

| SME Name | Role | Sessions | Hours | Topics Covered |
|----------|------|----------|-------|----------------|
| {name} | {role} | {count} | {hours} | {topics} |

### C. Known Limitations

{Honest assessment of:
- What could not be extracted
- Where confidence is low
- What needs further investigation
- Any scope exclusions}

### D. References

- Business Rules Manifesto: {URL or reference}
- Decision Model (von Halle): {reference}
- Verification Method (Vanthienen): {reference}
- RuleSpeak: {reference}
- Source system documentation: {references}

---

**Report Generated:** {YYYY-MM-DD HH:MM}
**Generated By:** {agent_name}
**Version:** {version}
