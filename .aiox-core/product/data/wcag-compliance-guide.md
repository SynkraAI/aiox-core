# WCAG Compliance Guide

**Standard:** WCAG 2.1 Level AA (minimum), AAA target
**Purpose:** Ensure design system components meet accessibility standards
**Reference:** https://www.w3.org/WAI/WCAG21/quickref/

---

## Quick Reference: WCAG AA Requirements

### Color Contrast

**Text:**
- Normal text (< 18px): ≥ 4.5:1 contrast ratio
- Large text (≥ 18px or bold ≥ 14px): ≥ 3:1 contrast ratio

**Non-Text (UI components):**
- Icons, buttons, form borders: ≥ 3:1 contrast ratio

**Testing:**
```bash
# Use browser dev tools or:
npm install -g pa11y
pa11y --standard WCAG2AA http://localhost:3000
```

### Keyboard Navigation

**Required:**
- All interactive elements accessible via Tab key
- Logical tab order (top → bottom, left → right)
- Enter/Space activates buttons
- Arrow keys for radio groups, menus
- Escape closes modals, dropdowns

**Focus Indicators:**
- Visible focus outline (≥ 3:1 contrast)
- Never `outline: none` without replacement

```css
/* Good */
button:focus {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
}

/* Bad */
button:focus {
    outline: none;  /* ❌ Removes keyboard navigation indicator */
}
```

### ARIA Attributes

**When to use:**
- Custom widgets (not semantic HTML)
- Dynamic content updates
- Complex interactions

**Common ARIA:**
```html
<!-- Button with icon only -->
<button aria-label="Close dialog">
    <CloseIcon />
</button>

<!-- Loading state -->
<div aria-live="polite" aria-busy="true">
    Loading...
</div>

<!-- Expanded state -->
<button
    aria-expanded="false"
    aria-controls="menu"
>
    Menu
</button>

<!-- Disabled -->
<button disabled aria-disabled="true">
    Submit
</button>
```

---

## WCAG AAA (Target, not required)

**Enhanced Requirements:**
- Text contrast: ≥ 7:1 (normal), ≥ 4.5:1 (large)
- No images of text
- Enhanced visual presentation (line height ≥ 1.5)

---

## Component-Specific Guidelines

### Buttons

```tsx
// ✅ Good
<button
    onClick={handleClick}
    disabled={isDisabled}
    aria-disabled={isDisabled}
    aria-label="Save changes"
>
    Save
</button>

// ❌ Bad
<div onClick={handleClick}>  // Not keyboard accessible
    Save
</div>
```

### Forms

```tsx
// ✅ Good
<label htmlFor="email">Email</label>
<input
    id="email"
    type="email"
    required
    aria-required="true"
    aria-invalid={hasError}
    aria-describedby="email-error"
/>
{hasError && (
    <span id="email-error" role="alert">
        Invalid email format
    </span>
)}

// ❌ Bad
<input placeholder="Email" />  // No label
```

### Modals

```tsx
// ✅ Good
<div
    role="dialog"
    aria-modal="true"
    aria-labelledby="dialog-title"
>
    <h2 id="dialog-title">Confirm Action</h2>
    <p>Are you sure?</p>
    <button onClick={onConfirm}>Yes</button>
    <button onClick={onCancel}>No</button>
</div>

// Focus trap: Tab cycles within modal
// Escape closes modal
```

---

## Testing Checklist

### Automated Testing

```bash
# Install tools
npm install --save-dev @testing-library/jest-dom
npm install --save-dev jest-axe

# Test example
import { axe } from 'jest-axe';

test('Button is accessible', async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
});
```

### Manual Testing

- [ ] Navigate entire app with keyboard only (no mouse)
- [ ] Test with screen reader (NVDA, JAWS, VoiceOver)
- [ ] Zoom to 200% - all content still accessible
- [ ] Check color contrast with dev tools
- [ ] Test with high contrast mode

---

## Common Violations & Fixes

### Violation 1: Missing Alt Text

```tsx
// ❌ Bad
<img src="logo.png" />

// ✅ Good
<img src="logo.png" alt="Company logo" />

// ✅ Good (decorative)
<img src="decoration.png" alt="" />
```

### Violation 2: Low Contrast

```css
/* ❌ Bad */
.text {
    color: #999;           /* 2.8:1 contrast */
    background: #fff;
}

/* ✅ Good */
.text {
    color: #666;           /* 5.7:1 contrast ✓ */
    background: #fff;
}
```

### Violation 3: Click-Only Elements

```tsx
// ❌ Bad
<div onClick={handleClick}>Click me</div>

// ✅ Good
<button onClick={handleClick}>Click me</button>

// ✅ Good (if div required)
<div
    role="button"
    tabIndex={0}
    onClick={handleClick}
    onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            handleClick();
        }
    }}
>
    Click me
</div>
```

---

## Resources

- **WCAG Quick Reference:** https://www.w3.org/WAI/WCAG21/quickref/
- **ARIA Authoring Practices:** https://www.w3.org/WAI/ARIA/apg/
- **axe DevTools:** Browser extension for automated testing
- **WAVE:** Web accessibility evaluation tool

---

## Design System Enforcement

**All components MUST:**
- Pass axe automated tests
- Have ≥ 4.5:1 text contrast
- Be keyboard navigable
- Have visible focus indicators
- Include proper ARIA attributes
- Be tested with screen readers

**Non-negotiable. Brad says: "Accessibility is quality."**
