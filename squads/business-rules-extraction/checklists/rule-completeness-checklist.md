# Rule Completeness Checklist — BRE-CK-001

## Purpose
Validate individual business rule completeness before adding to catalog.

---

## Rule Identity
- [ ] Rule ID follows pattern BR-{MODULE}-{SEQ}
- [ ] Descriptive name assigned
- [ ] Classification type defined (definitional/behavioral/constraint/derivation/inference)
- [ ] Priority assigned (critical/high/medium/low)

## Rule Statement
- [ ] Natural language statement exists
- [ ] RuleSpeak format statement exists
- [ ] Statement is readable by non-technical stakeholder
- [ ] Statement has exactly one conclusion

## Decision Model
- [ ] Rule assigned to a rule family
- [ ] Conditions identified and typed
- [ ] Decision table row exists
- [ ] Table passes normalization (1NF, 2NF, 3NF)

## Traceability
- [ ] Source system identified
- [ ] Source file/program referenced
- [ ] Source line range documented
- [ ] Source language identified
- [ ] Extraction method recorded
- [ ] Confidence level assigned
- [ ] Code snippet attached (for high-priority rules)

## Business Context
- [ ] Business motivation documented
- [ ] Business owner identified
- [ ] Regulatory reference (if applicable)
- [ ] Known exceptions listed
- [ ] Related rules cross-referenced

## Validation
- [ ] SME review (at minimum for critical rules)
- [ ] No contradiction with other rules in same family

---

## Enforcement

### Pass Threshold
- **Minimum:** 90% of checkboxes must pass (40/45)
- **All critical items MUST pass** (marked with * below)

### Critical Items (blocking — any fail = rule rejected)
- [ ]* Source traceability exists (source file + line range)
- [ ]* Rule assigned to a rule family
- [ ]* No contradiction with existing rules in same family
- [ ]* RuleSpeak format statement exists
- [ ]* Business motivation documented

### Veto Conditions (instant FAIL — rule MUST NOT be added to catalog)
- No source traceability (file + line range missing)
- No rule family assignment
- Contradiction with existing rules detected
- Rule statement not in RuleSpeak format
- No business motivation documented

### Fallback on Failure
- **On veto:** Return rule to extraction phase for re-work with specific gap identified
- **On partial failure (< 90% pass):** Flag rule as INCOMPLETE, add to catalog with status "needs-review"
- **On SME unavailable:** Proceed with confidence=MEDIUM, queue for SME review
