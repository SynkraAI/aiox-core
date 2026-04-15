# Design Definition of Done (DoD) Checklist

## Usage

Run this checklist before marking any design deliverable as complete.
Applies to: @ux-design-expert, @design-system (Brad Frost)

[[LLM: INITIALIZATION INSTRUCTIONS - DESIGN DOD VALIDATION

This checklist is MANDATORY for design deliverables. It ensures design quality
before handoff to development or QA.

EXECUTION APPROACH:

1. Complete ALL sections sequentially
2. Mark each item [x] when verified or [N/A] with justification
3. Determine gate decision based on results

GATE DECISION LOGIC:
- APPROVED: All required checkboxes marked [x] or [N/A] with justification
- NEEDS_WORK: 1-3 items missing (list them, return for fixes)
- REJECTED: >3 items missing OR any accessibility item fails

Accessibility failures are ALWAYS blocking — no exceptions.]]

---

## Research & Discovery

- [ ] User needs documented (personas, pain points, or brief)
- [ ] Competitive/pattern audit completed (brownfield) OR brand brief reviewed (greenfield)
- [ ] Design constraints identified (responsive breakpoints, accessibility, performance budget)

[[LLM: For brownfield projects, audit existing patterns in the codebase first.
For greenfield, ensure brand brief exists in docs/ or story attachments.
If no user research exists, flag as NEEDS_WORK — do not skip.]]

## Design Specs

- [ ] Wireframes or specs saved to `docs/` directory
- [ ] All interactive states documented (hover, focus, active, disabled, loading, error, empty)
- [ ] Responsive behavior defined (mobile-first: 320px, 768px, 1024px, 1440px)
- [ ] Dark/light mode considerations addressed (if applicable)

[[LLM: Interactive states are non-negotiable. Every clickable/tappable element
must have ALL states documented. Missing states cause dev rework.

Responsive: define behavior at each breakpoint, not just "it stacks".
Specify what changes: layout, font size, spacing, visibility.]]

## Design System

- [ ] All values use design tokens — zero hardcoded colors, spacing, or typography
- [ ] Components follow Atomic Design hierarchy (atoms → molecules → organisms)
- [ ] Component props interface defined (TypeScript)
- [ ] Max 100 lines per component file

[[LLM: HARDCODED VALUES CHECK:
- Search for hex colors (#xxx), rgb(), hsl() outside token files
- Search for px values not from spacing scale
- Search for font-family, font-size not from typography tokens

If tokens don't exist yet, creating them IS part of this deliverable.]]

## Accessibility (WCAG AA Minimum)

- [ ] Color contrast ratios verified (4.5:1 text, 3:1 large text/UI)
- [ ] Focus order logical and visible (focus-visible states)
- [ ] Interactive elements keyboard accessible (Enter, Space, Escape, Arrow keys)
- [ ] ARIA labels on non-text interactive elements
- [ ] Reduced motion alternative exists for animations
- [ ] Screen reader tested (at least logical heading hierarchy)

[[LLM: ACCESSIBILITY IS A HARD GATE.
Any failing accessibility item = REJECTED, regardless of other scores.
Use browser DevTools Lighthouse or axe for automated contrast checks.
Manual keyboard tab-through is required — automated tools miss focus traps.]]

## Quality

- [ ] TypeScript compilation: 0 errors
- [ ] No unused imports or dead CSS
- [ ] Pattern consolidation >80% (brownfield only)
- [ ] Bundle size impact assessed
- [ ] Cross-browser check (Chrome, Firefox, Safari latest)

[[LLM: Pattern consolidation means: of all visual patterns in the deliverable,
>80% should reuse existing components/tokens rather than introducing new ones.
For greenfield this is N/A. For brownfield, run IDS analysis first.]]

## Handoff

- [ ] .state.yaml updated with completed phase
- [ ] File List maintained in story (if story-driven)
- [ ] Handoff artifact created in .aiox/handoffs/ (if part of workflow)
- [ ] Next agent/step identified

[[LLM: Use agent-handoff-tmpl.yaml for structured handoff.
The handoff MUST include: decisions made, files modified, and next action.
If handing to @dev, include component hierarchy and token map.]]

---

## Gate Decision

[[LLM: VERDICT LOGIC

Count failing items (unmarked [ ] without [N/A] justification):

- 0 failing items → APPROVED
- 1-3 failing items → NEEDS_WORK (list specific items)
- >3 failing items → REJECTED
- ANY accessibility item failing → REJECTED (override)

If NEEDS_WORK:
1. List all failing items with specific remediation
2. Return deliverable for fixes
3. Re-run checklist after fixes

If REJECTED:
1. List all failing items
2. Identify root cause (missing research? rushed delivery?)
3. Schedule rework with clear scope]]

- **APPROVED**: All required checkboxes marked [x] or justified [N/A]
- **NEEDS_WORK**: 1-3 items missing (list them)
- **REJECTED**: >3 items missing OR any accessibility item fails

---

_Design DoD Checklist v1.0 - Synkra AIOS Development Framework_
