# Accessibility WCAG AA Checklist

**Purpose:** Ensure WCAG AA compliance for design system components
**Agent:** Atlas (Design System Builder)
**Standard:** WCAG 2.2 Level AA (minimum) + APCA guidance

---

## PERCEIVABLE

### Color & Contrast
- [ ] Text contrast ≥4.5:1 (normal text)
- [ ] Text contrast ≥3:1 (large text 18px+)
- [ ] UI controls contrast ≥3:1
- [ ] No color-only indicators (use icons + text)
- [ ] APCA contrast meets target for typography weight/size
- [ ] Dark mode parity validated (same success criteria)

### Alternative Text
- [ ] Images have alt text
- [ ] Decorative images use alt=""
- [ ] Icon buttons have aria-label

---

## OPERABLE

### Keyboard
- [ ] All interactive elements keyboard accessible
- [ ] Tab order logical
- [ ] Focus indicators visible (outline, ring, etc)
- [ ] No keyboard traps

### Navigation
- [ ] Skip links provided (if needed)
- [ ] Landmarks used (nav, main, aside)
- [ ] Headings hierarchical (h1 → h2 → h3)

---

## UNDERSTANDABLE

### Labels
- [ ] Form inputs have labels
- [ ] Labels associated with inputs (htmlFor/id)
- [ ] Required fields indicated
- [ ] Error messages clear and helpful

### States
- [ ] Disabled state indicated visually + aria-disabled
- [ ] Loading states announced
- [ ] Success/error states clear
- [ ] Live regions used when status updates asynchronously

---

## ROBUST

### ARIA
- [ ] Valid ARIA attributes only
- [ ] ARIA roles used correctly
- [ ] aria-label / aria-labelledby present
- [ ] aria-expanded for collapsible content
- [ ] aria-live for dynamic content

### HTML
- [ ] Valid semantic HTML
- [ ] No deprecated elements
- [ ] Proper nesting

---

**Testing Tools:**
- axe DevTools (browser extension) / jest-axe
- WAVE (web accessibility evaluation tool)
- Keyboard-only navigation (Tab/Shift+Tab/Space/Enter/Escape)
- Screen reader (NVDA, JAWS, VoiceOver)
- APCA contrast calculator / Inclusive Colors

**Result:** [ ] WCAG AA ✓ [ ] Issues Found
