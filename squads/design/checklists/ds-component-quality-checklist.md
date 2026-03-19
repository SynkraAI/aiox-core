# Component Quality Checklist

**Purpose:** Validate component before marking complete
**Agent:** Merovingian (Design System Builder)
**Standard:** Production-ready React/TypeScript components

---

## CODE QUALITY

- [ ] TypeScript compiles with zero errors
  → Fix: Run `tsc --noEmit` and resolve each error by type. Most common: missing prop types, incorrect event handler signatures
- [ ] No `any` types used
  → Fix: Replace `any` with specific types. Use `unknown` + type guard for truly dynamic data. Search: `grep -rn ': any' src/`
- [ ] Props fully typed with interface
  → Fix: Create `interface {Component}Props` with each prop explicitly typed. Avoid `Record<string, unknown>` for known shapes
- [ ] All props documented with TSDoc comments
  → Fix: Add `/** description */` TSDoc comment above each prop in the interface. Include `@default` for optional props
- [ ] Component exported correctly
  → Fix: Ensure `export const {Component}` or named export in index.ts. Verify barrel file re-exports: `export { Component } from './Component'`

---

## STYLING

- [ ] All styling uses tokens (zero hardcoded values)
  → Fix: `grep -rn '#[0-9a-f]' *.module.css` to find hardcoded values, replace with `var(--token-name)`
- [ ] CSS Modules or chosen approach used consistently
  → Fix: Rename .css to .module.css, update imports to `import styles from './X.module.css'`
- [ ] No inline styles
  → Fix: `grep -rn 'style={{' *.tsx` — move all inline styles to CSS Module classes
- [ ] Responsive design implemented (if needed)
  → Fix: Add `@media` queries for sm/md/lg breakpoints using token breakpoint values
- [ ] All variants styled correctly
  → Fix: Create CSS class per variant (`.primary`, `.secondary`), verify each renders differently in Storybook

---

## ACCESSIBILITY (WCAG AA MINIMUM)

- [ ] Semantic HTML elements used
  → Fix: Replace `<div onClick>` with `<button>`, `<div>` navigation with `<nav>`, generic containers with `<section>`/`<article>`
- [ ] ARIA attributes present where needed
  → Fix: Add `aria-label` for icon-only buttons, `aria-expanded` for toggles, `role` only when no native semantic equivalent
- [ ] Color contrast ≥4.5:1 for text
  → Fix: Use `*contrast-matrix` to find failing pairs, adjust to nearest compliant token color
- [ ] Keyboard navigation works (Tab, Enter, Space)
  → Fix: Ensure `onKeyDown` handles Enter/Space for custom interactive elements. Native `<button>` gets this for free
- [ ] Focus indicators visible
  → Fix: Add `:focus-visible` style with `outline: 2px solid var(--color-focus)` and `outline-offset: 2px`
- [ ] Disabled state handled correctly
  → Fix: Add `aria-disabled="true"` + visual dimming + prevent onClick via `pointer-events: none` or early return
- [ ] Screen reader tested (or documented)
  → Fix: Test with VoiceOver (Mac: Cmd+F5) or NVDA (Windows). Document results in component README

---

## TESTING

- [ ] Unit tests written
  → Fix: Create `{Component}.test.tsx` using React Testing Library. Start with render test, then add interaction tests
- [ ] All variants tested
  → Fix: Use `test.each` to iterate over variant values. Verify each variant applies the correct CSS class
- [ ] All sizes tested
  → Fix: Render each size, assert expected class or computed style. Use snapshot tests for visual regression
- [ ] Disabled state tested
  → Fix: Render with `disabled` prop, assert `aria-disabled`, verify click handler is NOT called
- [ ] Event handlers tested
  → Fix: Use `fireEvent.click()` or `userEvent.click()`, assert callback was called with expected args
- [ ] Test coverage >80%
  → Fix: Run `--coverage` flag, check uncovered lines. Add tests for branches (if/else, ternary, early returns)
- [ ] All tests pass
  → Fix: Run `npm test -- --watchAll=false`. Fix failures starting with type errors, then logic errors

---

## DOCUMENTATION

- [ ] Component.md created
  → Fix: Copy template from `docs/templates/component.md`. Fill in purpose, API, and examples sections
- [ ] Props documented with examples
  → Fix: Add a props table with Name, Type, Default, Description columns. Include code snippet for each prop
- [ ] Variants explained
  → Fix: Show visual example or code snippet for each variant. Explain when to use which variant
- [ ] Usage examples provided
  → Fix: Add at least 3 examples: basic usage, with all props, and composition with other components
- [ ] Accessibility notes included
  → Fix: Document keyboard shortcuts, ARIA attributes used, and screen reader behavior

---

## STORYBOOK (if enabled)

- [ ] Stories file created
  → Fix: Create `{Component}.stories.tsx` with `Meta` and `StoryObj` types from `@storybook/react`
- [ ] Story for each variant
  → Fix: Export a named story per variant (e.g., `export const Primary: Story = { args: { variant: 'primary' } }`)
- [ ] Interactive controls work
  → Fix: Ensure `argTypes` are defined in Meta. Use `control: 'select'` for enums, `control: 'boolean'` for flags
- [ ] Stories display correctly
  → Fix: Check Storybook console for warnings. Verify all stories render without errors in multiple viewports

---

## Edge Cases

- [ ] **Empty/null state:** Component handles `undefined` props gracefully (default values or explicit empty state UI)
  → Fix: Add default values for all optional props, test with `<Component />` (no props)
- [ ] **Loading state:** If async, component shows loading indicator with `aria-busy="true"`
- [ ] **Error state:** Component displays error feedback (not just console.error) with `role="alert"`
- [ ] **Long content:** Text overflow handled (truncation with `title` attribute or expand/collapse)
  → Fix: Add `overflow: hidden; text-overflow: ellipsis` or `word-break: break-word` as appropriate
- [ ] **RTL support:** Layout mirrors correctly for right-to-left languages (if i18n required)
  → Fix: Use logical properties (`margin-inline-start` instead of `margin-left`)
- [ ] **Recursive nesting:** Component renders correctly when nested inside itself
  → Fix: Test recursive rendering, ensure no infinite loops in useEffect

---

**Reviewer:** ________ **Date:** ________
**Quality Gate:** [ ] PASS [ ] FAIL

---

## Scoring

### Point System
Each checkbox item = 1 point.

| Category | Items | Weight |
|----------|-------|--------|
| Code Quality (API Design) | 5 | 5pts |
| Styling (Token Integration) | 5 | 5pts |
| Accessibility | 7 | 7pts |
| Testing | 7 | 7pts |
| Documentation | 5 | 5pts |
| Storybook | 4 | 4pts |
| Edge Cases | 6 | 6pts |
| **Total** | **39** | **39pts** |

### Pass/Fail Thresholds
| Grade | Score | Action |
|-------|-------|--------|
| PASS | >= 80% (32+) | Proceed to next phase |
| CONDITIONAL | 60-79% (24-31) | Fix critical items, re-check |
| FAIL | < 60% (23-) | Major rework required |

### Auto-Correction
If items fail:
- Run `*ds-build-component --validate` to check token coverage. Use `*execute-checklist` for automated validation.
