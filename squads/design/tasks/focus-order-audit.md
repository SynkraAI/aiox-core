# Task: focus-order-audit

> **Command:** `*focus-order {path}`
> **Agent:** Brad Frost (Design System Architect)
> **Purpose:** Validate keyboard navigation, tab order, and focus management
> **Execution Type:** `Agent`
> **Dependencies:** depends_on: `[]` · enables: `[]` · workflow: `accessibility`

---

## Overview

Comprehensive keyboard accessibility audit covering:
1. **Tab order validation** - logical focus sequence
2. **Focus indicators** - visible, sufficient contrast
3. **Keyboard traps** - elements that capture focus
4. **Interactive elements** - all clickable = keyboard accessible
5. **Focus management** - modals, dialogs, dynamic content

---

## Input

| Parameter | Required | Description |
|-----------|----------|-------------|
| `path` | Yes | Directory to audit (e.g., `./app/components`) |
| `--component` | No | Audit single component |
| `--generate-map` | No | Generate visual focus order diagram |
| `--fix` | No | Auto-fix simple issues |

---

## Execution Steps

### Phase 1: Interactive Element Discovery

Find all elements that should be keyboard accessible:

```typescript
interface InteractiveElement {
  type: 'native' | 'custom';
  element: string;            // button, a, div, span, etc.
  file: string;
  line: number;
  hasTabIndex: boolean;
  tabIndexValue: number | null;
  hasClickHandler: boolean;
  hasKeyHandler: boolean;
  role: string | null;
  issues: FocusIssue[];
}

// Elements to scan for
const nativeInteractive = [
  'button', 'a[href]', 'input', 'select', 'textarea',
  '[contenteditable]', 'details', 'summary'
];

const customInteractive = [
  // Elements with click handlers
  'onClick=', '@click=', '(click)=',
  // Elements with interactive roles
  'role="button"', 'role="link"', 'role="tab"',
  'role="menuitem"', 'role="option"', 'role="checkbox"',
  'role="radio"', 'role="switch"', 'role="slider"'
];
```

### Phase 2: Tab Order Analysis

```typescript
interface TabOrderResult {
  element: string;
  file: string;
  line: number;
  tabIndex: number;
  order: number;         // Computed tab order position
  issues: TabOrderIssue[];
}

type TabOrderIssue =
  | 'positive-tabindex'     // tabIndex > 0 (anti-pattern)
  | 'negative-tabindex'     // tabIndex < 0 on interactive
  | 'out-of-order'          // Visual vs DOM order mismatch
  | 'skip-heading'          // Skips heading levels
  | 'focus-trap-detected';  // Can't tab out
```

**Tab Order Rules:**
1. `tabIndex="0"` - Natural order (preferred)
2. `tabIndex="-1"` - Programmatically focusable only
3. `tabIndex="1+"` - ANTI-PATTERN (forces order, breaks predictability)

### Phase 3: Focus Indicator Validation

```typescript
interface FocusIndicator {
  element: string;
  file: string;
  line: number;
  hasVisibleFocus: boolean;
  focusStyle: {
    outline: string | null;
    boxShadow: string | null;
    ring: string | null;      // Tailwind ring-*
    custom: boolean;
  };
  contrastRatio: number;      // Focus vs background
  issues: FocusIndicatorIssue[];
}

type FocusIndicatorIssue =
  | 'outline-none-no-replacement'  // outline:none without alternative
  | 'insufficient-contrast'        // Focus indicator < 3:1
  | 'too-subtle'                   // Very thin/light focus
  | 'focus-visible-missing';       // No :focus-visible support
```

**WCAG 2.2 Focus Requirements:**
- **2.4.7 Focus Visible (AA):** Focus indicator must be visible
- **2.4.11 Focus Not Obscured (AA):** Focus not fully hidden by other content
- **2.4.12 Focus Not Obscured Enhanced (AAA):** Focus not partially hidden
- **2.4.13 Focus Appearance (AAA):** Minimum 2px perimeter, 3:1 contrast

### Phase 4: Keyboard Handler Validation

```typescript
interface KeyboardHandler {
  element: string;
  file: string;
  line: number;
  handlers: {
    onClick: boolean;
    onKeyDown: boolean;
    onKeyUp: boolean;
    onKeyPress: boolean;  // Deprecated
  };
  expectedKeys: string[];  // Enter, Space, Arrow*, Escape
  issues: KeyboardIssue[];
}

type KeyboardIssue =
  | 'click-only'              // onClick without keyboard handler
  | 'missing-enter-space'     // Button without Enter/Space
  | 'missing-escape'          // Modal/dialog without Escape
  | 'missing-arrows'          // Menu/tabs without arrow keys
  | 'using-deprecated';       // onKeyPress instead of onKeyDown
```

**Expected Keyboard Patterns:**

| Element/Role | Required Keys |
|--------------|---------------|
| Button | Enter, Space |
| Link | Enter |
| Menu item | Enter, Arrow Up/Down |
| Tab | Enter, Arrow Left/Right |
| Modal/Dialog | Escape (close) |
| Dropdown | Escape, Arrow Up/Down |
| Slider | Arrow Left/Right |
| Checkbox | Space |
| Radio | Space, Arrow Up/Down |

### Phase 5: Focus Trap Detection

```typescript
interface FocusTrap {
  element: string;
  file: string;
  line: number;
  trapType: 'intentional' | 'unintentional';
  hasEscapeRoute: boolean;
  issues: FocusTrapIssue[];
}

// Intentional traps (OK if implemented correctly)
const intentionalTraps = [
  'role="dialog"',
  'role="alertdialog"',
  'aria-modal="true"'
];

// Patterns that often cause unintentional traps
const trapPatterns = [
  'tabIndex="-1".*tabIndex="-1"',  // Sequential -1s
  'onBlur.*focus',                  // Focus on blur
  'useEffect.*focus'                // Auto-focus loops
];
```

### Phase 6: Modal/Dialog Focus Management

```typescript
interface ModalFocusAudit {
  component: string;
  file: string;
  checks: {
    trapsFocus: boolean;           // Focus stays in modal
    restoresFocus: boolean;        // Returns focus on close
    firstFocusable: string | null; // First element focused
    closesOnEscape: boolean;       // Escape key closes
    hasAriaModal: boolean;         // aria-modal="true"
  };
  issues: ModalFocusIssue[];
}
```

---

## Output

### 1. Focus Order Report

```markdown
# Focus Order Audit Report

**Path:** ./app/components
**Date:** 2026-01-05
**Components Scanned:** 156

## Summary

| Category | Issues | Critical | Serious | Moderate |
|----------|--------|----------|---------|----------|
| Tab Order | 8 | 2 | 4 | 2 |
| Focus Indicators | 12 | 5 | 4 | 3 |
| Keyboard Handlers | 15 | 6 | 7 | 2 |
| Focus Traps | 3 | 1 | 2 | 0 |
| **Total** | **38** | **14** | **17** | **7** |

## Critical Issues

### 1. ❌ Click-only interactive element

**File:** `app/components/ui/Card.tsx:45`
**Element:** `<div onClick={handleClick}>`
**Problem:** Has click handler but no keyboard support

**Current:**
```tsx
<div onClick={handleClick} className="cursor-pointer">
  Click me
</div>
```

**Fix:**
```tsx
<button onClick={handleClick} className="cursor-pointer">
  Click me
</button>
// OR if div is required:
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
  className="cursor-pointer"
>
  Click me
</div>
```

---

### 2. ❌ Focus indicator removed without replacement

**File:** `app/components/ui/Button.tsx:23`
**Element:** `button`
**Problem:** `outline: none` without visible focus alternative

**Current:**
```css
button:focus {
  outline: none;
}
```

**Fix:**
```css
button:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
}
```

---

### 3. ❌ Positive tabIndex (anti-pattern)

**File:** `app/components/forms/SearchInput.tsx:12`
**Element:** `<input tabIndex={1}>`
**Problem:** Positive tabIndex breaks natural tab order

**Fix:** Remove tabIndex or use tabIndex={0}

---

### 4. ❌ Modal without focus trap

**File:** `app/components/modals/ConfirmDialog.tsx:8`
**Element:** `Dialog`
**Problems:**
- Focus can escape modal with Tab
- No Escape key handler
- Focus not restored on close

**Required Implementation:**
- Add focus trap (first/last element loop)
- Add onKeyDown for Escape
- Store activeElement before open, restore on close

---

## Tab Order Map

```
┌──────────────────────────────────────┐
│ 1. [Skip to content]                 │
│ 2. [Logo] → 3. [Nav: Home]           │
│ 4. [Nav: Products] → 5. [Nav: About] │
│ 6. [Search input]                    │
│ 7. [Main content starts]             │
│ ...                                  │
│ ⚠️ 15. [Card div] - NOT FOCUSABLE   │
│ 16. [Footer link 1]                  │
└──────────────────────────────────────┘
```

## Focus Indicator Inventory

| Component | Focus Style | Contrast | Status |
|-----------|-------------|----------|--------|
| Button | ring-2 ring-primary | 4.2:1 | ✅ Pass |
| Input | ring-2 ring-blue-500 | 3.8:1 | ✅ Pass |
| Link | underline + color | 3.1:1 | ✅ Pass |
| Card | outline: none | N/A | ❌ Fail |
| Tab | border-bottom | 2.1:1 | ⚠️ Low |

## Recommendations

1. **Replace all `<div onClick>` with `<button>`** - 6 occurrences
2. **Add focus-visible styles** - 5 components missing
3. **Remove positive tabIndex values** - 2 occurrences
4. **Implement focus trap in modals** - 2 modals affected
5. **Add Escape key handlers** - 3 dialogs missing
```

---

## Auto-Fix (with --fix flag)

```typescript
// Auto-fixable patterns

// 1. Add tabIndex to onClick divs
- <div onClick={fn}>
+ <div onClick={fn} tabIndex={0} role="button" onKeyDown={handleKeyDown}>

// 2. Add focus-visible where outline:none
- button:focus { outline: none; }
+ button:focus-visible { outline: 2px solid var(--color-focus); outline-offset: 2px; }

// 3. Convert positive tabIndex
- <input tabIndex={1}>
+ <input tabIndex={0}>
```

---

## Integration

```bash
# Full focus audit
*focus-order ./app/components

# Single component
*focus-order ./app/components --component Modal

# Generate visual map
*focus-order ./app/components --generate-map

# Auto-fix simple issues
*focus-order ./app/components --fix

# As part of full audit
*a11y-audit ./app/components --scope keyboard
```

---

## Failure Handling

- **No interactive elements discovered:** Verify scan includes all file types (.tsx, .jsx, .vue, .html). If truly zero, report "No interactive elements found"
- **Focus indicator detection misses Tailwind ring-* classes:** Expand scan patterns to include ring-*, outline-*, focus:*, focus-visible:* Tailwind utilities
- **Tab order mapping fails for dynamic content:** Document dynamic sections as "tab order varies at runtime — requires manual testing" in report
- **Auto-fix introduces breaking changes:** Generate fix suggestions as code comments instead of applying directly. Always preserve original code

## State Update

```yaml
focus_order_audit:
  last_run: "2026-01-05T14:30:00Z"
  path: "./app/components"
  results:
    total_issues: 38
    critical: 14
    serious: 17
    moderate: 7
  categories:
    tab_order: 8
    focus_indicators: 12
    keyboard_handlers: 15
    focus_traps: 3
  anti_patterns:
    click_only_divs: 6
    positive_tabindex: 2
    outline_none: 5
  auto_fixed: 0
  next_action: "Fix 14 critical keyboard issues"
```

---

## Success Criteria

- [ ] All interactive elements discovered (native + custom with click/key handlers)
- [ ] Tab order validated as logical and follows visual layout
- [ ] Focus indicators verified visible with sufficient contrast (3:1 minimum)
- [ ] Zero keyboard traps detected (or all documented with workarounds)
- [ ] Custom interactive elements have keyboard equivalents for mouse events
- [ ] Modal/dialog focus management validated (trap + restore)
- [ ] Report generated with file:line references for every finding

---

**Brad says:** "If you can't Tab to it, keyboard users can't use it. Zero click-only elements."


## Related Checklists

- `squads/design/checklists/ds-accessibility-wcag-checklist.md`
- `squads/design/checklists/ds-a11y-release-gate-checklist.md`

## Process Guards
- **On Fail:** Stop execution, capture evidence, and return remediation steps before proceeding.
