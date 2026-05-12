# Pattern Audit Checklist

**Purpose:** Validate audit results before consolidation
**Agent:** Brad (Design System Architect)
**References:** audit-codebase.md task

---

## SCAN COMPLETENESS

- [ ] All UI file types detected (React, Vue, HTML, CSS)
- [ ] Scan completed without critical errors
- [ ] Total file count matches expectations
- [ ] No permission errors blocking scan

---

## PATTERN DETECTION

### Buttons
- [ ] Button instances counted accurately
- [ ] Unique button patterns identified
- [ ] Redundancy factor calculated (instances / unique)
- [ ] Most-used buttons captured

### Colors
- [ ] Hex colors extracted (#RGB, #RRGGBB)
- [ ] RGB/RGBA colors extracted
- [ ] Total unique colors counted
- [ ] Top 10 most-used colors identified
- [ ] Redundancy factor calculated

### Spacing
- [ ] Padding values extracted
- [ ] Margin values extracted
- [ ] Unique spacing values counted

### Typography
- [ ] Font families identified
- [ ] Font sizes extracted
- [ ] Font weights counted

### Forms
- [ ] Input elements counted
- [ ] Form elements counted
- [ ] Unique patterns identified

---

## OUTPUT VALIDATION

- [ ] pattern-inventory.json generated
- [ ] JSON is valid and parseable
- [ ] All pattern types included
- [ ] Metadata complete (timestamp, scan path, file counts)
- [ ] .state.yaml created
- [ ] State file has valid YAML syntax
- [ ] Phase set to "audit_complete"
- [ ] Tailwind version/config path captured (if applicable)

---

## METRICS VALIDATION

- [ ] Redundancy factors >1 (indicates duplication)
- [ ] Pattern counts seem reasonable (not artificially inflated)
- [ ] No zero counts for major pattern types (unless truly zero)

---

## NEXT STEPS DECISION

**If redundancy factors >3x:**
- ✅ Proceed to *consolidate
- Significant pattern reduction opportunity

**If redundancy factors <2x:**
- ⚠️ Codebase is relatively clean
- Consider if design system is worth investment

**If colors >50 or buttons >20:**
- 🚨 Major technical debt
- Strong candidate for consolidation

---

**Reviewer:** ________ **Date:** ________
**Audit Quality:** [ ] Excellent [ ] Good [ ] Needs Review
