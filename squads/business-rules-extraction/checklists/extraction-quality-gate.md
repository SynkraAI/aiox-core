# Extraction Quality Gate — BRE-QG-001

## Purpose
Validate extracted business rules before catalog generation.

## Gate Type: BLOCKING
All critical items must PASS. Any FAIL triggers return to extraction phase.

---

## 1. Completeness (Critical)

- [ ] All priority modules have been analyzed
- [ ] Expected rule count matches actual (within 20% tolerance)
- [ ] No modules skipped without documented reason
- [ ] Dead code identified and excluded

## 2. Source Traceability (Critical)

- [ ] Every rule has source file reference
- [ ] Every rule has source line range
- [ ] Every rule has extraction method documented
- [ ] Code snippets attached for critical rules
- [ ] Confidence level assigned to every rule

## 3. Formalization (Critical)

- [ ] All rules assigned to rule families
- [ ] All decision tables pass 1NF (atomic conditions)
- [ ] All decision tables pass 2NF (no redundancy)
- [ ] All decision tables pass 3NF (no transitive deps)
- [ ] Rule families have non-overlapping conclusions

## 4. Vocabulary (Critical)

- [ ] Business glossary has no undefined terms
- [ ] All rules written in RuleSpeak format
- [ ] Rules readable by non-technical stakeholders
- [ ] Terms consistent across all rule families
- [ ] Fact model complete (terms → facts → rules)

## 5. Verification (Critical)

- [ ] Decision tables checked for completeness
- [ ] Decision tables checked for consistency
- [ ] No contradictions in any table
- [ ] Missing combinations documented with justification
- [ ] Tables contracted to minimum rows

## 6. Validation (Important but non-blocking)

- [ ] Sample of rules validated by SME (minimum 10%)
- [ ] Characterization tests still pass after extraction
- [ ] Cross-reference with existing documentation (if available)
- [ ] Business motivation traced for critical rules

## 7. Documentation (Important)

- [ ] Rule catalog generated from template
- [ ] Executive summary written
- [ ] Cross-reference tables complete
- [ ] DMN export generated
- [ ] Recommendations section filled

---

## Scoring

| Category | Weight | Score (0-10) |
|----------|--------|-------------|
| Completeness | 25% | __ |
| Source Traceability | 20% | __ |
| Formalization | 20% | __ |
| Vocabulary | 15% | __ |
| Verification | 10% | __ |
| Validation | 5% | __ |
| Documentation | 5% | __ |
| **TOTAL** | 100% | __ |

**Pass threshold:** 7.0/10 overall AND all critical categories >= 6.0/10
**Minimum per critical category:** 6.0/10
**Scoring rubric:** Score = (checkboxes_passed / total_checkboxes_in_category) * 10
**Clarification:** A score of 6.5 overall with all critical >= 6.0 FAILS (overall < 7.0)

## Veto Conditions (Instant FAIL)

- No source traceability for any rule
- Decision tables have unresolved contradictions
- Business glossary has undefined terms used in rules
- Less than 50% of expected rules extracted
- No SME validation attempted
