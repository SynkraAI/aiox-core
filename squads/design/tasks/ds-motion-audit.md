# Audit Animations, Transitions & Motion Tokens

> Task ID: brad-motion-audit
> Agent: Brad (Design System Architect)
> Version: 1.1.0
> v4.0-compatible: true
> **Execution Type:** `Agent`
> **Dependencies:** depends_on: `[]` · enables: `[]` · workflow: `motion`

## Description

Extract all CSS transition/animation values and JS animation calls from the codebase. Extract motion values into token candidates, check prefers-reduced-motion compliance, and validate against motion token best practices. **v4.1: Enriched with Val Head's 5-purpose framework — every animation evaluated for purpose (orient, direct, causality, feedback, brand). Custom easing curve audit included.**

## Prerequisites

- Codebase with UI components
- Read data/motion-tokens-guide.md for token standards
- Val Head DNA: Apply 5-purpose test to every animation found

## Workflow

### Interactive Elicitation

1. **Gather Parameters**
   - Scan path
   - Animation libraries in use (framer-motion, GSAP, CSS only, etc.)
   - Output directory

### Steps

1. **Grep CSS transition, animation, and @keyframes Declarations**
   - Find all `transition` properties with values
   - Find all `animation` / `@keyframes` declarations
   - Find all `transform` usage in transitions
   - Extract duration and easing values with file:line references
   - Check: extracted CSS animation count >= 0 AND each has file:line reference — log "Found {N} CSS animation values across {F} files"

2. **Grep framer-motion, GSAP, and Web Animations API Calls**
   - Find framer-motion usage (animate, variants, transition props)
   - Find GSAP usage (gsap.to, gsap.from, timeline)
   - Find Web Animations API usage
   - Find requestAnimationFrame patterns
   - Extract duration/easing values
   - Check: extracted JS animation count >= 0 AND each has file:line reference — log "Found {N} JS animation values across {F} files"

3. **Check prefers-reduced-motion**
   - Search for @media (prefers-reduced-motion) queries
   - Check coverage: every animated element should have reduced-motion handling
   - Flag animations without reduced-motion fallback
   - Categorize: which animations are reduced vs. removed
   - Check: coverage = (elements with reduced-motion / total animated elements) * 100 — log "prefers-reduced-motion coverage: {pct}% ({covered}/{total})"

4. **Extract Motion Token Candidates**
   - Cluster similar duration values (e.g., 180ms, 200ms, 220ms → normalize to 200ms)
   - Cluster similar easing curves
   - Map to standard motion token scale (instant/fast/normal/moderate/slow/deliberate)
   - Identify semantic motion patterns (enter, exit, expand, collapse)
   - Check: token candidate count > 0 AND each has usage count and semantic name — log "{N} motion token candidates extracted from {total} raw values"

5. **Generate Motion Audit Report**
   - Total animations found
   - Duration/easing value inventory with redundancy metrics
   - prefers-reduced-motion coverage (% and gaps)
   - Token recommendations
   - Seizure risk check (>3 flashes/second)
   - Update .state.yaml

## Output

- `motion-audit-report.md` — Full audit with findings
- `motion-token-candidates.json` — Proposed token values
- `reduced-motion-gaps.md` — Components missing prefers-reduced-motion
- `.state.yaml` updated

## Val Head 5-Purpose Evaluation (v4.1)

For every animation found, evaluate against:
1. **Orient** — Does it help users understand spatial relationships?
2. **Direct Attention** — Does it guide focus to important changes?
3. **Show Causality** — Does it show cause-and-effect?
4. **Provide Feedback** — Does it confirm user actions?
5. **Express Brand** — Does it communicate brand personality?

Animations failing ALL 5 purposes should be flagged for removal.

### Easing Audit
- Flag use of CSS defaults (ease, ease-in-out, linear) — recommend custom curves
- Check if custom easing curves reflect brand personality
- Evaluate if easing matches interaction type (ease-out for enters, ease-in for exits)

### UI Choreography Check
- Do animations feel like "siblings" (coherent family)?
- Or like "strangers" (disconnected, random)?
- Flag inconsistent motion character across components

## Failure Handling

- **No CSS animations found in codebase:** Verify scan path includes style files (.css, .scss, .tsx). If truly zero, report "No CSS animations detected — motion token extraction skipped"
- **Animation library not detected (framer-motion, GSAP):** Skip JS animation scan, note "JS animations: N/A — no animation library detected"
- **prefers-reduced-motion scan returns zero queries:** Flag as critical gap "Zero prefers-reduced-motion coverage — all animated elements at risk"
- **Motion token clustering produces zero candidates:** Lower clustering threshold and retry. If still zero, report raw values without token recommendations

## Success Criteria

- All animation values catalogued with source references
- prefers-reduced-motion coverage assessed (Val Head: "reduced motion, not no motion")
- Token candidates reduce value redundancy by >60%
- Zero seizure risk issues
- Every animation has at least one of 5 purposes identified
- CSS default easings flagged for replacement with custom curves


## Related Checklists

- `squads/design/checklists/ds-component-quality-checklist.md`

## Process Guards
- **On Fail:** Stop execution, capture evidence, and return remediation steps before proceeding.
