# Component Quality Checklist

**Purpose:** Validate component before marking complete
**Agent:** Atlas (Design System Builder)
**Standard:** Production-ready React/TypeScript components

---

## CODE QUALITY

- [ ] TypeScript (strict) compiles with zero errors
- [ ] No `any` types used (prefer discriminated unions / utility types)
- [ ] Props fully typed (VariantProps + component-specific interface)
- [ ] ForwardRef + displayName implemented when required
- [ ] TSDoc comments describe props, defaults, accessibility
- [ ] Component exported as named export (tree-shakeable)

---

## STYLING

- [ ] Tailwind utilities reference semantic tokens (no hardcoded values)
- [ ] `cva` variant catalogue defined with defaults + compound variants
- [ ] `cn` (tailwind-merge) handles conditional classes (no conflicts)
- [ ] Responsive/density variants implemented where required
- [ ] Dark mode parity confirmed (`data-theme="dark"`)

---

## ACCESSIBILITY (WCAG AA MINIMUM)

- [ ] Semantic HTML elements used (button vs div, etc.)
- [ ] ARIA attributes present (aria-expanded, aria-busy, aria-live, etc.)
- [ ] WCAG 2.2 AA & APCA contrast thresholds satisfied (light + dark)
- [ ] Keyboard navigation works (Tab/Shift+Tab, Enter, Space)
- [ ] focus-visible styling present with 3:1 contrast
- [ ] Loading/disabled states handled correctly (aria-busy/aria-disabled)
- [ ] Screen reader testing (VoiceOver/NVDA) recorded or delegated

---

## TESTING

- [ ] Unit tests written (React Testing Library)
- [ ] Variants/sizes/compound states tested
- [ ] Loading + disabled behaviour covered
- [ ] Event handlers tested (click, keyboard, pointer)
- [ ] jest-axe (or equivalent) accessibility audit passes
- [ ] Test coverage ≥85% (statements/functions/branches)
- [ ] All tests pass locally & in CI

---

## DOCUMENTATION

- [ ] Component.md (or MDX) created
- [ ] Props + Variant tables documented
- [ ] Usage examples include light/dark + loading states
- [ ] Accessibility considerations recorded (ARIA, keyboard)
- [ ] Migration notes / design rationale captured if applicable

---

## STORYBOOK (if enabled)

- [ ] Stories file created (Storybook 8 CSF)
- [ ] Story per variant/size + loading/disabled states
- [ ] Controls/args configured (Docs tab updated)
- [ ] Visual regression baselines captured (if enabled)

---

**Reviewer:** ________ **Date:** ________
**Quality Gate:** [ ] PASS [ ] FAIL
