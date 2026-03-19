# Generate Component Following Fluent 2 Patterns

> Task ID: brad-fluent-build
> Agent: Brad (Design System Architect)
> Version: 1.0.0
> **Execution Type:** `Agent`
> **Dependencies:** depends_on: `[ds-fluent-audit]` · enables: `[]` · workflow: `fluent`

## Description

Generate a production-ready component following Microsoft Fluent 2 design patterns: compound component architecture, slot-based customization, built-in accessibility, and token-based styling.

## Input Schema
- **requires:** Output from `ds-fluent-audit`
- **format:** JSON data
- **location:** `outputs/design-system/{project}/fluent/fluent-alignment-report.json`

## Prerequisites

- Design tokens available (preferably W3C DTCG format)
- React + TypeScript environment
- Read data/fluent2-design-principles.md for principles

## Workflow

### Interactive Elicitation

1. **Gather Parameters**
   - Component name and purpose
   - Variants needed (size, appearance, shape)
   - Slots/sub-components required
   - Target output directory

### Steps

1. **Design Component API**
   - Define root component and sub-components (compound pattern)
   - Define slot props for customizable sub-parts
   - Define variants as union types (not open strings)
   - Define controlled/uncontrolled props
   - Check: all props have TypeScript types AND variant props use union types (not open strings) — abort with "API design incomplete: {N} untyped or open-string props"

2. **Implement Component Structure**
   - Root component: orchestrates state, provides context
   - Sub-components: render individual parts, accept slot overrides
   - Use forwardRef on all components
   - Implement controlled + uncontrolled patterns via hooks
   - Check: root component provides context AND sub-components consume it AND forwardRef used — abort with "Compound pattern incomplete: {missing aspect}"

3. **Apply Token-Based Styling**
   - All colors from semantic tokens (no hardcoded values)
   - All spacing from spacing tokens
   - All typography from typography tokens
   - Support mode switching (light/dark/high-contrast)
   - Check: hardcoded color/spacing/typography value count == 0 in component files — abort with "{N} hardcoded design values found"

4. **Implement Accessibility**
   - Add appropriate ARIA roles and attributes
   - Implement keyboard navigation (Tab, Arrow keys, Enter, Escape)
   - Handle focus management (focus trap for modals, focus restore)
   - Add aria-label, aria-describedby where needed
   - Check: component has ARIA roles + keyboard navigation + focus management — abort with "A11y incomplete: missing {list}"

5. **Generate Tests**
   - Unit tests for component rendering and state
   - Interaction tests for keyboard navigation
   - Accessibility tests (role, label assertions)
   - Check: test coverage >= 80% AND all tests pass with exit code 0 — abort with "Tests: {pass}/{total} passing, coverage {pct}%"

6. **Generate Storybook Story**
   - Default story with all variants
   - Interactive controls for all props
   - Compound usage examples
   - Accessibility annotations
   - Check: story file exports default + variant stories AND argTypes defined for all props — abort with "Story incomplete: {missing aspect}"

## Output

- `{Component}/` directory with:
  - `types.ts` — TypeScript interfaces
  - `{Component}.tsx` — Root component
  - `{SubComponent}.tsx` — Sub-components
  - `use{Component}.ts` — State hook
  - `{Component}.test.tsx` — Tests
  - `{Component}.stories.tsx` — Storybook story
  - `index.ts` — Barrel export

## Failure Handling

- **Compound pattern incomplete:** If root component does not provide context OR sub-components do not consume context OR forwardRef missing on components, abort with "Compound pattern incomplete: {missing aspect}. Ensure root provides context, sub-components consume it, and all use forwardRef."
- **Hardcoded design values detected:** If component files contain hardcoded colors (#hex), spacing (px values), or typography values instead of tokens, abort with "{N} hardcoded design values found: {list}. All styling must use semantic design tokens."
- **Accessibility implementation incomplete:** If component missing ARIA roles, keyboard navigation handlers, or focus management, abort with "A11y incomplete: missing {list}. Add ARIA attributes, keyboard event handlers, and focus trap/restore logic."
- **Variant props use open strings:** If component prop types use `string` instead of union types for variants (e.g., `appearance: string` not `appearance: 'primary' | 'secondary'`), abort with "API design incomplete: {N} props use open strings instead of union types. Define explicit variant enums."

## Success Criteria

- Compound component pattern correctly implemented
- All styling via tokens, zero hardcoded values
- Keyboard navigation works completely
- Tests pass with >80% coverage
- Storybook story renders all variants


## Related Checklists

- `squads/design/checklists/ds-component-quality-checklist.md`
- `squads/design/checklists/ds-pattern-audit-checklist.md`

## Process Guards
- **On Fail:** Stop execution, capture evidence, and return remediation steps before proceeding.
