# Evaluate Fluent 2 Design Alignment

> Task ID: brad-fluent-audit
> Agent: Brad (Design System Architect)
> Version: 1.0.0
> **Execution Type:** `Agent`
> **Dependencies:** depends_on: `[]` · enables: `[ds-fluent-build]` · workflow: `fluent`

## Description

Calculate a Fluent 2 alignment score (0-100) by comparing your design system's component patterns, token naming, and accessibility approach against Fluent 2 specifications. Checks compound component patterns, token naming conventions, accessibility approach, and cross-platform readiness. Outputs alignment score with gap analysis.

## Output Schema
- **produces:** `outputs/design-system/{project}/fluent/fluent-alignment-report.json`
- **format:** JSON data
- **consumed_by:** ds-fluent-build

## Prerequisites

- Existing design system with components
- Read data/fluent2-design-principles.md for reference

## Workflow

### Interactive Elicitation

1. **Gather Parameters**
   - DS root path
   - Target Fluent aspects (all, or specific: components, tokens, a11y)
   - Current framework (React, Vue, other)

### Steps

1. **Compare Component Patterns Against Fluent 2 Compound Model**
   - Check for compound component pattern usage
   - Check for slot-based customization
   - Check for controlled/uncontrolled pattern support
   - Check for forwardRef usage
   - Score: compound + slots = 20pts, monolithic props = 5pts
   - Check: every component has architecture score (0-20) based on compound/slot/ref patterns — log "{N} components scored, avg: {avg}/20"

2. **Match Token Names Against Fluent Convention Regex**
   - Compare token names against Fluent convention (color + category + variant + state)
   - Check for 3-layer architecture (global → alias → component)
   - Validate semantic token coverage
   - Score: Fluent naming = 20pts, partial match = 10pts, custom = 5pts
   - Check: token naming comparison generated with Fluent match percentage — log "Token naming: {pct}% Fluent-aligned ({matched}/{total})"

3. **Check Built-in ARIA Attributes and Focus Management**
   - Check for built-in ARIA attributes (not consumer-applied)
   - Check for focus management (FocusZone, Tabster, or equivalent)
   - Check for keyboard navigation implementation
   - Check for high-contrast mode support via tokens
   - Score: Built-in a11y = 20pts, partial = 10pts, consumer-applied = 5pts
   - Check: each component categorized as built-in / partial / consumer-applied a11y — log "A11y: {builtin} built-in, {partial} partial, {consumer} consumer-applied"

4. **Classify Platform Dependencies as Cross-Platform or Web-Only**
   - Check for platform-agnostic token values
   - Check for platform-specific implementations (not web-only wrappers)
   - Check for responsive design patterns
   - Score: Cross-platform ready = 20pts, web-only = 10pts
   - Check: platform assessment completed with cross-platform / web-only classification — log "Platform readiness: {classification} ({score}/20)"

5. **Score Clarity, System, and Productive Principles (0-20 each)**
   - Clarity: Is ambiguity minimized? Information hierarchy clear?
   - System: Do components work coherently together?
   - Productive: Are components optimized for task completion?
   - Score: Strong adherence = 20pts, partial = 10pts
   - Check: clarity + system + productive principles each scored (0-20) — log "Principles: clarity={c}, system={s}, productive={p}, total={t}/20"

6. **Generate Alignment Report**
   - Total Fluent alignment score (0-100)
   - Gap analysis by category
   - Migration recommendations (what to change to align with Fluent 2)
   - Effort estimates per gap
   - Update .state.yaml

## Output

- `fluent-alignment-report.md` — Score + gap analysis
- Category-by-category breakdown
- Prioritized migration recommendations
- `.state.yaml` updated

## Failure Handling

- **Fluent 2 reference file not found:** Fetch fluent2-design-principles.md from data/ directory. If missing, abort with "Reference file data/fluent2-design-principles.md required for audit"
- **No components found at DS root path:** Exit with error "No component files in {path}. Cannot perform Fluent alignment audit."
- **Token naming extraction returns empty:** Check alternate token file formats (.json, .yaml, .ts). Report "Token naming: 0% aligned — no tokens found"
- **Component architecture scoring fails for a component:** Log warning, skip that component, continue with remaining. Note skipped components in report

## Success Criteria

- Accurate scoring based on actual component analysis
- Gaps have specific, actionable recommendations
- Report distinguishes must-have vs. nice-to-have alignments


## Related Checklists

- `squads/design/checklists/ds-component-quality-checklist.md`
- `squads/design/checklists/ds-pattern-audit-checklist.md`

## Process Guards
- **On Fail:** Stop execution, capture evidence, and return remediation steps before proceeding.
