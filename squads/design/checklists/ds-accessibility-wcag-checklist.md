# Accessibility WCAG AA Checklist

**Purpose:** Ensure WCAG AA compliance for design system components
**Agent:** Merovingian (Design System Builder)
**Standard:** WCAG 2.1 Level AA (minimum)

---

## PERCEIVABLE

### Color & Contrast
- [ ] Text contrast ≥4.5:1 (normal text)
  → Fix: Use OKLCH color space to find nearest compliant shade. Tool: `*contrast-matrix --fix`
- [ ] Text contrast ≥3:1 (large text 18px+)
  → Fix: Large text has a lower threshold. If failing, darken/lighten by 10-15% in OKLCH lightness channel
- [ ] UI controls contrast ≥3:1
  → Fix: Borders, icons, and form controls need ≥3:1 against background. Check with `*contrast-matrix --ui-controls`
- [ ] No color-only indicators (use icons + text)
  → Fix: Add icon, text label, or pattern alongside color. Example: error state needs red + icon + "Error" text

### Alternative Text
- [ ] Images have alt text
  → Fix: Add descriptive alt for informational images, `alt=""` for decorative. Never use `alt="image"` or `alt="photo"`
- [ ] Decorative images use alt=""
  → Fix: If image adds no information (dividers, backgrounds), use `alt=""` or CSS `background-image` instead of `<img>`
- [ ] Icon buttons have aria-label
  → Fix: Add `aria-label="Close"` (not `aria-label="X"`) to icon-only buttons. Label describes the action, not the icon

---

## OPERABLE

### Keyboard
- [ ] All interactive elements keyboard accessible
  → Fix: Use native `<button>`, `<a>`, `<input>` elements. For custom elements, add `tabindex="0"` + `onKeyDown` handler
- [ ] Tab order logical
  → Fix: Follow DOM order, never use `tabindex > 0`. Rearrange HTML to match visual layout if needed
- [ ] Focus indicators visible (outline, ring, etc)
  → Fix: Add `:focus-visible { outline: 2px solid var(--color-focus); outline-offset: 2px; }`. Never `outline: none` without replacement
- [ ] No keyboard traps
  → Fix: Ensure `Escape` closes modals/dropdowns, `Tab` moves to next element, never `tabindex > 0`. Test by tabbing through entire page

### Navigation
- [ ] Skip links provided (if needed)
  → Fix: Add `<a href="#main-content" class="skip-link">Skip to main content</a>` as first child of `<body>`
- [ ] Landmarks used (nav, main, aside)
  → Fix: Wrap in `<main>`, `<nav>`, `<header>`, `<footer>`. One `<main>` per page. Add `aria-label` to distinguish multiple `<nav>`
- [ ] Headings hierarchical (h1 → h2 → h3)
  → Fix: Never skip heading levels (h1 to h3). One `<h1>` per page. Use CSS to style heading appearance independently of level

---

## UNDERSTANDABLE

### Labels
- [ ] Form inputs have labels
  → Fix: Add `<label htmlFor="inputId">` for every input. For hidden labels, use `aria-label` or `<VisuallyHidden>` wrapper
- [ ] Labels associated with inputs (htmlFor/id)
  → Fix: Match `<label htmlFor="email">` with `<input id="email">`. Both must be unique on the page
- [ ] Required fields indicated
  → Fix: Add `aria-required="true"` + visual asterisk. Don't rely on asterisk alone — add "(required)" in label or helper text
- [ ] Error messages clear and helpful
  → Fix: Use `aria-describedby` to link error to input. Message should say what's wrong AND how to fix: "Email must include @"

### States
- [ ] Disabled state indicated visually + aria-disabled
  → Fix: Use `aria-disabled="true"` (not `disabled` attribute) + `opacity: 0.5` + `pointer-events: none`. This keeps element in tab order
- [ ] Loading states announced
  → Fix: Add `aria-busy="true"` to loading container + `aria-live="polite"` region that announces "Loading..." then "Content loaded"
- [ ] Success/error states clear
  → Fix: Use `role="alert"` for errors (immediate announcement), `role="status"` for success. Include icon + text, not color alone

---

## ROBUST

### ARIA
- [ ] Valid ARIA attributes only
  → Fix: Run `axe-core` or `*aria-audit` to detect invalid attributes. Reference: WAI-ARIA 1.2 spec for valid attribute/role combos
- [ ] ARIA roles used correctly
  → Fix: Check that role matches behavior (e.g., `role="button"` needs `tabindex="0"` + Enter/Space handlers). Prefer native elements
- [ ] aria-label / aria-labelledby present
  → Fix: Use `aria-label` for simple labels, `aria-labelledby` to reference visible text. Never use both on same element
- [ ] aria-expanded for collapsible content
  → Fix: Add `aria-expanded="false"` on trigger button. Toggle to `"true"` on open. Add `aria-controls="panel-id"` pointing to content
- [ ] aria-live for dynamic content
  → Fix: Add `aria-live="polite"` to container that receives dynamic updates. Use `"assertive"` only for critical alerts

### HTML
- [ ] Valid semantic HTML
  → Fix: Run HTML validator. Replace `<div>` with semantic elements: `<article>`, `<section>`, `<aside>`, `<figure>`
- [ ] No deprecated elements
  → Fix: Replace `<center>` with CSS, `<font>` with CSS, `<marquee>` with CSS animation (with `prefers-reduced-motion`)
- [ ] Proper nesting
  → Fix: No `<div>` inside `<p>`, no `<button>` inside `<a>`. Check with `axe-core` or HTML validator

---

## Edge Cases

- [ ] **Touch targets:** Interactive elements >= 44x44px on mobile (WCAG 2.5.8)
  → Fix: Add `min-width: 44px; min-height: 44px` to all interactive elements
- [ ] **Motion sensitivity:** Animations respect `prefers-reduced-motion` media query
- [ ] **High contrast mode:** Component visible in Windows High Contrast Mode (`forced-colors: active`)
  → Fix: Test with `forced-colors: active` media query, ensure borders visible
- [ ] **Zoom 200%:** Layout doesn't break at 200% browser zoom (WCAG 1.4.4)
  → Fix: Use relative units (rem/em), test at 200% zoom — no horizontal scroll
- [ ] **Voice control:** Interactive elements have visible labels matching accessible names (WCAG 2.5.3)
- [ ] **Live regions:** Screen reader announces dynamic content updates
  → Fix: Add `aria-live="polite"` to containers that update dynamically

---

**Testing Tools:**
- axe DevTools (browser extension)
- WAVE (web accessibility evaluation tool)
- Keyboard-only navigation
- Screen reader (NVDA, JAWS, VoiceOver)

**Result:** [ ] WCAG AA ✓ [ ] Issues Found

---

## Scoring

### Point System
Each checkbox item = 1 point.

| Category | Items | Weight |
|----------|-------|--------|
| Perceivable (Color & Contrast + Alternative Text) | 7 | 7pts |
| Operable (Keyboard + Navigation) | 7 | 7pts |
| Understandable (Labels + States) | 7 | 7pts |
| Robust (ARIA + HTML) | 8 | 8pts |
| Edge Cases | 6 | 6pts |
| **Total** | **35** | **35pts** |

### Pass/Fail Thresholds
| Grade | Score | Action |
|-------|-------|--------|
| PASS | >= 80% (28+) | Proceed to next phase |
| CONDITIONAL | 60-79% (21-27) | Fix critical items, re-check |
| FAIL | < 60% (21-) | Major rework required |

### Auto-Correction
If items fail:
- Run `*a11y-audit` for automated checks. Run `*aria-audit` for ARIA validation. Run `*focus-order-audit` for keyboard navigation.
