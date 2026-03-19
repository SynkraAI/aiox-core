# Task: aria-audit

> **Command:** `*aria-audit {path}`
> **Agent:** Brad Frost (Design System Architect)
> **Purpose:** Validate ARIA usage, roles, states, and properties
> **Execution Type:** `Agent`
> **Dependencies:** depends_on: `[]` · enables: `[]` · workflow: `accessibility`

---

## Overview

Comprehensive ARIA (Accessible Rich Internet Applications) audit covering:
1. **Valid ARIA attributes** - No invalid/deprecated attributes
2. **Required properties** - Roles have required aria-* props
3. **Correct usage patterns** - ARIA used appropriately
4. **Redundant ARIA** - Native HTML preferred
5. **Live regions** - Dynamic content announced

---

## Input

| Parameter | Required | Description |
|-----------|----------|-------------|
| `path` | Yes | Directory to audit (e.g., `./app/components`) |
| `--strict` | No | Fail on warnings too (not just errors) |
| `--fix` | No | Auto-fix simple issues |

---

## Execution Steps

### Phase 1: ARIA Attribute Discovery

```typescript
interface AriaUsage {
  attribute: string;        // aria-label, role, etc.
  value: string;
  element: string;          // HTML element
  file: string;
  line: number;
  valid: boolean;
  issues: AriaIssue[];
}

// All ARIA attributes to scan
const ariaAttributes = [
  // Roles
  'role',
  // States & Properties
  'aria-activedescendant', 'aria-atomic', 'aria-autocomplete',
  'aria-braillelabel', 'aria-brailleroledescription', 'aria-busy',
  'aria-checked', 'aria-colcount', 'aria-colindex', 'aria-colspan',
  'aria-controls', 'aria-current', 'aria-describedby', 'aria-description',
  'aria-details', 'aria-disabled', 'aria-dropeffect', 'aria-errormessage',
  'aria-expanded', 'aria-flowto', 'aria-grabbed', 'aria-haspopup',
  'aria-hidden', 'aria-invalid', 'aria-keyshortcuts', 'aria-label',
  'aria-labelledby', 'aria-level', 'aria-live', 'aria-modal',
  'aria-multiline', 'aria-multiselectable', 'aria-orientation',
  'aria-owns', 'aria-placeholder', 'aria-posinset', 'aria-pressed',
  'aria-readonly', 'aria-relevant', 'aria-required', 'aria-roledescription',
  'aria-rowcount', 'aria-rowindex', 'aria-rowspan', 'aria-selected',
  'aria-setsize', 'aria-sort', 'aria-valuemax', 'aria-valuemin',
  'aria-valuenow', 'aria-valuetext'
];
```

### Phase 2: Role Validation

```typescript
interface RoleAudit {
  role: string;
  element: string;
  file: string;
  line: number;
  checks: {
    validRole: boolean;           // Role exists in ARIA spec
    appropriateElement: boolean;  // Role appropriate for element
    hasRequiredProps: boolean;    // Required aria-* present
    hasAllowedProps: boolean;     // No disallowed aria-*
    redundant: boolean;           // Native HTML would suffice
  };
  requiredProps: string[];        // What's required
  missingProps: string[];         // What's missing
}

// Required properties by role
const roleRequirements: Record<string, string[]> = {
  'checkbox': ['aria-checked'],
  'combobox': ['aria-expanded', 'aria-controls'],
  'heading': ['aria-level'],
  'meter': ['aria-valuenow'],
  'option': [], // aria-selected recommended
  'radio': ['aria-checked'],
  'scrollbar': ['aria-controls', 'aria-valuenow'],
  'separator': [], // if focusable: aria-valuenow
  'slider': ['aria-valuenow'],
  'spinbutton': ['aria-valuenow'],
  'switch': ['aria-checked'],
  'tab': [], // aria-selected recommended
  'tabpanel': [], // aria-labelledby recommended
  'treeitem': [], // aria-expanded if has children
};
```

### Phase 3: Common ARIA Errors Detection

```typescript
type AriaIssue =
  // Invalid usage
  | 'invalid-role'              // Role doesn't exist
  | 'invalid-attribute'         // Attribute doesn't exist
  | 'invalid-value'             // Wrong value type/format

  // Missing requirements
  | 'missing-required-prop'     // Required prop not present
  | 'missing-accessible-name'   // No label, labelledby, or content

  // Incorrect usage
  | 'redundant-role'            // <button role="button">
  | 'conflicting-semantics'     // <nav role="navigation">
  | 'aria-hidden-focusable'     // aria-hidden with focusable child
  | 'aria-label-on-generic'     // aria-label on div/span without role
  | 'broken-reference'          // aria-labelledby points to missing id

  // Bad patterns
  | 'aria-live-wrong-value'     // aria-live="true" instead of "polite"
  | 'role-presentation-focusable' // role="presentation" on focusable
  | 'nested-interactive'        // Interactive inside interactive
  | 'abstract-role';            // Using abstract role (widget, landmark)
```

### Phase 4: Pattern-Specific Audits

#### Modals/Dialogs
```typescript
interface ModalAriaAudit {
  component: string;
  checks: {
    hasRoleDialog: boolean;       // role="dialog" or "alertdialog"
    hasAriaModal: boolean;        // aria-modal="true"
    hasLabel: boolean;            // aria-label or aria-labelledby
    inertBackground: boolean;     // Background has aria-hidden or inert
  };
}
```

#### Tabs
```typescript
interface TabsAriaAudit {
  component: string;
  checks: {
    tablistHasRole: boolean;      // role="tablist"
    tabsHaveRole: boolean;        // role="tab"
    panelsHaveRole: boolean;      // role="tabpanel"
    tabsHaveControls: boolean;    // aria-controls on tabs
    panelsHaveLabelledby: boolean; // aria-labelledby on panels
    selectedManaged: boolean;     // aria-selected on active tab
  };
}
```

#### Forms
```typescript
interface FormAriaAudit {
  component: string;
  checks: {
    inputsLabeled: boolean;       // aria-label or associated label
    requiredMarked: boolean;      // aria-required="true"
    errorsDescribed: boolean;     // aria-describedby for errors
    invalidMarked: boolean;       // aria-invalid when error
    liveRegionForErrors: boolean; // aria-live for error messages
  };
}
```

#### Live Regions
```typescript
interface LiveRegionAudit {
  component: string;
  checks: {
    hasAriaLive: boolean;
    liveValue: 'polite' | 'assertive' | 'off';
    ariaAtomic: boolean;          // Updates read as whole
    ariaRelevant: string;         // additions, removals, text, all
  };
  dynamicContent: Array<{
    file: string;
    line: number;
    hasLiveRegion: boolean;       // Dynamic content needs aria-live
  }>;
}
```

### Phase 5: Semantic HTML vs ARIA

Detect cases where native HTML is better:

```typescript
interface RedundantAriaAudit {
  pattern: string;
  occurrences: number;
  recommendation: string;
}

const redundantPatterns = [
  { pattern: '<button role="button">', fix: '<button>' },
  { pattern: '<a href role="link">', fix: '<a href>' },
  { pattern: '<nav role="navigation">', fix: '<nav>' },
  { pattern: '<main role="main">', fix: '<main>' },
  { pattern: '<header role="banner">', fix: '<header>' },
  { pattern: '<footer role="contentinfo">', fix: '<footer>' },
  { pattern: '<aside role="complementary">', fix: '<aside>' },
  { pattern: '<article role="article">', fix: '<article>' },
  { pattern: '<input type="checkbox" role="checkbox">', fix: '<input type="checkbox">' },
  { pattern: '<input type="radio" role="radio">', fix: '<input type="radio">' },
];
```

---

## Output

### 1. ARIA Audit Report

```markdown
# ARIA Audit Report

**Path:** ./app/components
**Date:** 2026-01-05
**Components Scanned:** 156

## Summary

| Category | Issues | Critical | Serious | Moderate |
|----------|--------|----------|---------|----------|
| Invalid ARIA | 3 | 2 | 1 | 0 |
| Missing Props | 8 | 4 | 3 | 1 |
| Incorrect Usage | 12 | 3 | 6 | 3 |
| Redundant ARIA | 15 | 0 | 0 | 15 |
| Live Regions | 5 | 2 | 3 | 0 |
| **Total** | **43** | **11** | **13** | **19** |

## Critical Issues

### 1. ❌ Missing accessible name

**File:** `app/components/ui/IconButton.tsx:23`
**Element:** `<button aria-label={undefined}>`
**Problem:** Button has no accessible name

**Current:**
```tsx
<button onClick={onClick}>
  <SearchIcon />
</button>
```

**Fix:**
```tsx
<button onClick={onClick} aria-label="Search">
  <SearchIcon />
</button>
```

---

### 2. ❌ aria-hidden with focusable children

**File:** `app/components/modals/Sidebar.tsx:45`
**Element:** `<div aria-hidden="true">`
**Problem:** Hidden container has focusable button inside

**Current:**
```tsx
<div aria-hidden="true">
  <button>Click me</button>  {/* ❌ Focusable but hidden */}
</div>
```

**Fix:**
```tsx
<div aria-hidden="true" inert>  {/* Add inert attribute */}
  <button tabIndex={-1}>Click me</button>
</div>
// OR remove aria-hidden if content should be accessible
```

---

### 3. ❌ Missing required aria-checked

**File:** `app/components/ui/Toggle.tsx:12`
**Element:** `<div role="switch">`
**Problem:** Switch role requires aria-checked

**Current:**
```tsx
<div role="switch" onClick={toggle}>
  {isOn ? 'On' : 'Off'}
</div>
```

**Fix:**
```tsx
<button
  role="switch"
  aria-checked={isOn}
  onClick={toggle}
>
  {isOn ? 'On' : 'Off'}
</button>
```

---

### 4. ❌ Broken aria-labelledby reference

**File:** `app/components/modals/ConfirmDialog.tsx:8`
**Element:** `<div role="dialog" aria-labelledby="dialog-title">`
**Problem:** No element with id="dialog-title" exists

**Fix:** Add id to heading:
```tsx
<div role="dialog" aria-labelledby="dialog-title" aria-modal="true">
  <h2 id="dialog-title">Confirm Action</h2>  {/* Add id */}
  ...
</div>
```

---

### 5. ❌ Dynamic content without live region

**File:** `app/components/ui/Toast.tsx:34`
**Problem:** Toast messages not announced to screen readers

**Current:**
```tsx
{toast && <div className="toast">{toast.message}</div>}
```

**Fix:**
```tsx
<div aria-live="polite" aria-atomic="true">
  {toast && <div className="toast">{toast.message}</div>}
</div>
```

---

## Redundant ARIA (Moderate)

| Pattern | Count | Recommendation |
|---------|-------|----------------|
| `<button role="button">` | 5 | Remove role |
| `<nav role="navigation">` | 3 | Remove role |
| `<main role="main">` | 2 | Remove role |
| `<a href role="link">` | 4 | Remove role |
| `<header role="banner">` | 1 | Remove role |

**Note:** These work but are verbose. Native HTML provides the same semantics.

---

## Component-Specific Audits

### Modals/Dialogs

| Component | role=dialog | aria-modal | Labeled | Traps Focus |
|-----------|-------------|------------|---------|-------------|
| ConfirmDialog | ✓ | ✗ | ✗ | ✗ |
| AlertModal | ✓ | ✓ | ✓ | ✓ |
| Drawer | ✗ | ✗ | ✗ | ✗ |

### Tabs

| Component | tablist | tabs | panels | Controls | Labeled |
|-----------|---------|------|--------|----------|---------|
| TabGroup | ✓ | ✓ | ✓ | ✗ | ✗ |
| Navigation | ✗ | ✗ | N/A | N/A | N/A |

### Forms

| Component | Labeled | Required | Errors | Invalid |
|-----------|---------|----------|--------|---------|
| LoginForm | ✓ | ✓ | ✗ | ✗ |
| SearchInput | ✗ | N/A | N/A | N/A |
| ContactForm | ✓ | ✓ | ✓ | ✓ |

---

## ARIA Best Practices Reference

### First Rule of ARIA
> Don't use ARIA if you can use native HTML.

```tsx
// ❌ Bad
<div role="button" tabIndex={0} onClick={fn}>Click</div>

// ✅ Good
<button onClick={fn}>Click</button>
```

### Required Accessible Names

These elements MUST have accessible names:
- `role="dialog"` - via aria-label or aria-labelledby
- `role="alertdialog"` - via aria-label or aria-labelledby
- `<img>` - via alt
- `<button>` with icon only - via aria-label
- `<a>` with icon only - via aria-label
- Form inputs - via `<label>`, aria-label, or aria-labelledby

### Live Region Guidelines

| Urgency | Use | Example |
|---------|-----|---------|
| Polite | `aria-live="polite"` | Toast notifications, search results |
| Assertive | `aria-live="assertive"` | Errors, critical alerts |
| Off | `aria-live="off"` | Frequently updating content (stock tickers) |
```

---

## Auto-Fix (with --fix flag)

```typescript
// Auto-fixable patterns

// 1. Remove redundant roles
- <button role="button">
+ <button>

// 2. Add missing aria-checked to switches
- <div role="switch">
+ <div role="switch" aria-checked={value}>

// 3. Fix aria-live="true" (invalid)
- <div aria-live="true">
+ <div aria-live="polite">

// 4. Add aria-label to icon buttons
- <button><Icon /></button>
+ <button aria-label="Icon description"><Icon /></button>
```

---

## Integration

```bash
# Full ARIA audit
*aria-audit ./app/components

# Strict mode (fail on warnings)
*aria-audit ./app/components --strict

# Auto-fix simple issues
*aria-audit ./app/components --fix

# As part of full audit
*a11y-audit ./app/components --scope aria
```

---

## Failure Handling

- **ARIA attribute validation against outdated spec:** Use WAI-ARIA 1.2 as baseline. Flag attributes only in 1.3 draft as "warning" not "error"
- **Broken aria-labelledby references due to dynamic IDs:** Skip dynamic ID patterns (e.g., `id={uniqueId}`), log as "dynamic reference — requires runtime validation"
- **Live region detection misses framework-specific patterns:** Check for React portals, Vue teleport, and framework toast libraries in addition to raw aria-live attributes
- **Strict mode (--strict) produces excessive warnings:** Cap warnings at 50 per category, summarize remainder as "and {N} more similar warnings"

## State Update

```yaml
aria_audit:
  last_run: "2026-01-05T14:30:00Z"
  path: "./app/components"
  results:
    total_issues: 43
    critical: 11
    serious: 13
    moderate: 19
  categories:
    invalid_aria: 3
    missing_props: 8
    incorrect_usage: 12
    redundant: 15
    live_regions: 5
  patterns_found:
    modals_without_aria_modal: 2
    icon_buttons_without_label: 4
    broken_references: 2
  auto_fixed: 0
  next_action: "Fix 11 critical ARIA issues"
```

---

## Success Criteria

- [ ] All ARIA attributes validated against WAI-ARIA 1.2 spec
- [ ] Zero invalid or deprecated ARIA attributes remain
- [ ] All interactive roles have required aria-* properties
- [ ] No redundant ARIA on native HTML elements (e.g., `role="button"` on `<button>`)
- [ ] Live regions (`aria-live`) properly configured for dynamic content
- [ ] Report generated with file:line references for every finding
- [ ] Severity classification (error/warning/info) applied to each issue

---

**Brad says:** "First rule of ARIA: Don't use ARIA. Use semantic HTML. Second rule: If you use ARIA, use it correctly."


## Related Checklists

- `squads/design/checklists/ds-accessibility-wcag-checklist.md`
- `squads/design/checklists/ds-a11y-release-gate-checklist.md`

## Process Guards
- **On Fail:** Stop execution, capture evidence, and return remediation steps before proceeding.
