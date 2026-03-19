# Critical Eye — Canonical Review Checklist

**Purpose:** Human checkpoint for STABLE → CANONICAL and CANONICAL → DEPRECATED transitions
**Agent:** Design Chief (Design Principal)
**Standard:** Enterprise DS governance — only the best pattern per category becomes canonical
**Authority:** Nathan Curtis/EightShapes, GOV.UK Contribution Criteria, USWDS Lifecycle, Salesforce 4-Point Screening

---

## CONTEXT

- **Proposal ID:** ________
- **Cycle:** ________
- **Variant:** ________
- **Category:** ________
- **Proposed Transition:** [ ] STABLE → CANONICAL  [ ] CANONICAL → DEPRECATED
- **Current Score:** ________/100
- **Replacing (if deprecation):** ________

---

## SCORE VERIFICATION

- [ ] Total score >= 80 (canonical threshold)
  → Fix: If score < 80, REJECT proposal. Variant needs improvement before canonical consideration.
- [ ] Highest score in its category
  → Fix: If not the leader, check comparison matrix. Only the best becomes canonical.
- [ ] All 5 dimensions have non-null scores
  → Fix: Re-run scoring if any dimension is null. Incomplete evaluation cannot be promoted.
- [ ] No accessibility blocker (a11y > 0)
  → Fix: Accessibility score = 0 is absolute REJECT. Cannot be overridden.

---

## BREADTH (Nathan Curtis — Usage Breadth Scale)

- [ ] Pattern appears in 2+ sources/brands
  → Fix: Single-source patterns are snowflakes. Need adoption across brands before canonical status.
- [ ] Source attributions are accurate (verified against brand.json files)
  → Fix: Cross-reference variant.sources with actual brand files. Remove phantom sources.
- [ ] Breadth score reflects actual usage, not just registration
  → Fix: Verify the pattern is ACTUALLY USED in source brands, not just registered.

---

## QUALITY (EightShapes Component QA 8+1)

- [ ] Token compliance: zero hardcoded values
  → Fix: Search component source for `#hex` and `Npx` values. Replace all with CSS custom properties.
- [ ] States coverage: all required states implemented [default, hover, focus, disabled, error, loading]
  → Fix: Check component for missing states. Focus and disabled are non-negotiable.
- [ ] Accessibility: WCAG AA contrast + ARIA + keyboard + focus-visible
  → Fix: Run contrast checker. Add missing ARIA attributes. Test keyboard navigation.
- [ ] Responsiveness: works across mobile, tablet, desktop
  → Fix: Test at 320px, 768px, 1024px widths minimum.
- [ ] Composability: integrates with other canonical components
  → Fix: Test composition with 3+ other components. No CSS hacks or overrides needed.
- [ ] Resilience: handles edge cases (empty, long text, overflow, missing image)
  → Fix: Test with empty props, 500-character strings, missing optional data.

---

## CONSISTENCY (GOV.UK Contribution Criteria — Consistent)

- [ ] Follows DS naming conventions (kebab-case, semantic prefixes)
  → Fix: Rename files, props, and CSS classes to match established conventions.
- [ ] API follows established patterns (CVA + variants + slots)
  → Fix: Align prop signatures with other canonical components. Use same variant/size pattern.
- [ ] Visually harmonious with rest of DS (indistinguishable quality)
  → Fix: Compare side-by-side with existing canonicals. Spacing, typography, and color should match.

---

## MATURITY (USWDS Component Lifecycle)

- [ ] Stable for 3+ cycles (no breaking changes)
  → Fix: Check lifecycleHistory. Recent major changes disqualify from canonical. Wait for stabilization.
- [ ] Documentation complete (guidelines + API + examples + do/dont)
  → Fix: Create missing documentation sections. Canonical components MUST have full docs.
- [ ] Test coverage adequate (unit + a11y minimum)
  → Fix: Add missing tests. Canonical components must demonstrate reliability.

---

## SIMPLICITY (Brad Frost — Death to Complexity)

- [ ] Reasonable LOC count (< 150 LOC preferred)
  → Fix: Refactor complex components. Extract utilities. Simplify branching logic.
- [ ] Minimal dependencies (0-2 external deps preferred)
  → Fix: Evaluate if dependencies can be removed or replaced with lighter alternatives.

---

## DEPRECATION-SPECIFIC (only for CANONICAL → DEPRECATED)

- [ ] Replacement candidate scores > current + 10 points
  → Fix: Margin must be significant (>10%) to justify disruption of deprecating a canonical.
- [ ] Migration path documented for consumers
  → Fix: Document exactly how existing usage should be updated. Provide codemod if possible.
- [ ] Deprecation timeline defined (minimum 2 cycles grace period)
  → Fix: Deprecated components remain available for at least 2 more cycles.

---

## FINAL DECISION

**Reviewer:** ________ **Date:** ________

| Decision | Criteria |
|----------|----------|
| [ ] **APPROVE** | All checks pass. Transition is justified and beneficial. |
| [ ] **APPROVE WITH CONDITIONS** | Minor issues to address, but transition is warranted. |
| [ ] **DEFER** | Not ready yet. Specific improvements needed first. |
| [ ] **REJECT** | Does not meet canonical/deprecation criteria. |

**Conditions (if applicable):**
________________________________________________________________________

**Notes:**
________________________________________________________________________

---

## Scoring

### Point System
Each checkbox item = 1 point.

| Category | Items | Weight |
|----------|-------|--------|
| Score Verification | 4 | 4pts |
| Breadth | 3 | 3pts |
| Quality | 6 | 6pts |
| Consistency | 3 | 3pts |
| Maturity | 3 | 3pts |
| Simplicity | 2 | 2pts |
| Deprecation (if applicable) | 3 | 3pts |
| **Total (promotion)** | **21** | **21pts** |
| **Total (deprecation)** | **24** | **24pts** |

### Pass/Fail Thresholds
| Grade | Score | Action |
|-------|-------|--------|
| APPROVE | >= 90% (19+/21 or 22+/24) | Execute transition |
| APPROVE WITH CONDITIONS | 75-89% (16-18/21 or 18-21/24) | Execute with noted conditions |
| DEFER | 60-74% (13-15/21 or 15-17/24) | Return for improvements |
| REJECT | < 60% (12-/21 or 14-/24) | Do not transition |
