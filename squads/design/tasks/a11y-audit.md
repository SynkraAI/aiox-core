# Task: a11y-audit

> **Command:** `*a11y-audit {path}`
> **Agent:** Brad Frost (Design System Architect)
> **Purpose:** Comprehensive WCAG 2.2 accessibility audit with automated + manual checks
> **Execution Type:** `Agent`
> **Dependencies:** depends_on: `[]` · enables: `[contrast-matrix, focus-order-audit, aria-audit]` · workflow: `accessibility`

---

## Output Schema
- **produces:** `outputs/design-system/{project}/accessibility/a11y-audit-report.json`
- **format:** JSON data
- **consumed_by:** contrast-matrix, focus-order-audit, aria-audit

## Overview

Full accessibility audit combining:
1. **Automated scanning** (axe-core rules via code analysis)
2. **Manual inspection patterns** (focus order, ARIA usage, semantic HTML)
3. **Contrast validation** (WCAG 2.2 + APCA)
4. **Keyboard navigation** mapping
5. **Screen reader compatibility** assessment

---

## Input

| Parameter | Required | Description |
|-----------|----------|-------------|
| `path` | Yes | Directory or file to audit (e.g., `./app/components`) |
| `--level` | No | WCAG level: `AA` (default) or `AAA` |
| `--scope` | No | Scope: `full`, `color`, `keyboard`, `aria` (default: `full`) |
| `--fix` | No | Auto-fix simple issues (missing alt, missing labels) |

---

## Execution Steps

### Phase 1: Discovery (Automated)

```bash
# 1. Find all component files
glob("**/*.tsx", "**/*.jsx", "**/*.vue", "**/*.html")

# 2. Count interactive elements
grep: "onClick|onKeyDown|href|<button|<a |<input|<select|<textarea"

# 3. Find existing ARIA usage
grep: "aria-|role=|tabIndex"

# 4. Find images without alt
grep: "<img(?![^>]*alt=)"
```

### Phase 2: Contrast Analysis

For each color pair found in the codebase:

```typescript
interface ContrastResult {
  foreground: string;
  background: string;
  ratio: number;
  wcagAA_normal: boolean;   // ≥4.5:1
  wcagAA_large: boolean;    // ≥3:1
  wcagAAA_normal: boolean;  // ≥7:1
  wcagAAA_large: boolean;   // ≥4.5:1
  apca_Lc: number;          // APCA Lightness contrast
  usage: string[];          // Where used
}
```

**WCAG 2.2 Contrast Requirements:**
| Element Type | AA Minimum | AAA Target |
|--------------|------------|------------|
| Normal text (<18px) | 4.5:1 | 7:1 |
| Large text (≥18px or bold ≥14px) | 3:1 | 4.5:1 |
| UI components | 3:1 | 3:1 |
| Graphical objects | 3:1 | 3:1 |
| Focus indicators | 3:1 | 3:1 |

### Phase 3: Keyboard Audit

Check each interactive element:

```typescript
interface KeyboardAuditItem {
  element: string;
  file: string;
  line: number;
  issues: {
    notFocusable: boolean;      // Missing tabIndex or not native interactive
    noKeyHandler: boolean;       // onClick without onKeyDown
    focusNotVisible: boolean;    // outline: none without replacement
    trapDetected: boolean;       // Focus can't escape
  };
  severity: 'critical' | 'serious' | 'moderate' | 'minor';
}
```

**Critical Patterns to Detect:**
1. `<div onClick>` without `role="button"` and `tabIndex={0}`
2. `outline: none` or `outline: 0` without `:focus-visible` replacement
3. Custom dropdowns without arrow key support
4. Modals without focus trap + Escape close
5. Tab order jumping (positive tabIndex values)

### Phase 4: ARIA Validation

```typescript
interface AriaAuditItem {
  element: string;
  file: string;
  line: number;
  issue: AriaIssueType;
  suggestion: string;
}

type AriaIssueType =
  | 'invalid-role'           // Role doesn't exist
  | 'missing-required-prop'  // role="slider" without aria-valuenow
  | 'redundant-role'         // <button role="button">
  | 'orphan-aria-label'      // aria-labelledby points to non-existent id
  | 'missing-live-region'    // Dynamic content without aria-live
  | 'wrong-aria-usage';      // aria-expanded on non-expandable element
```

**Common ARIA Errors:**
| Pattern | Issue | Fix |
|---------|-------|-----|
| `<span role="button">` | Missing keyboard support | Add `tabIndex={0}` + `onKeyDown` |
| `<input aria-label="x" aria-labelledby="y">` | Conflicting labels | Use one or the other |
| `<div aria-hidden="true">` with focusable children | Hidden but focusable | Remove focusable or aria-hidden |
| Dynamic content update | No announcement | Add `aria-live="polite"` |

### Phase 5: Semantic HTML Check

```typescript
interface SemanticIssue {
  pattern: string;
  occurrences: number;
  severity: 'critical' | 'serious' | 'moderate';
  recommendation: string;
}
```

**Anti-Patterns:**
| Anti-Pattern | Better Alternative |
|--------------|-------------------|
| `<div onClick>` | `<button>` |
| `<span>` for links | `<a href>` |
| `<b>` for emphasis | `<strong>` |
| Multiple `<h1>` | Single `<h1>`, then `<h2>`, etc. |
| `<table>` for layout | CSS Grid/Flexbox |
| Missing `<main>` | Wrap main content |
| Missing `<nav>` | Wrap navigation |

---

## Output

### 1. Summary Report

```markdown
# Accessibility Audit Report

**Path:** ./app/components
**Date:** 2026-01-05
**Level:** WCAG 2.2 AA

## Summary

| Category | Issues | Critical | Serious | Moderate | Minor |
|----------|--------|----------|---------|----------|-------|
| Contrast | 12 | 3 | 5 | 4 | 0 |
| Keyboard | 8 | 2 | 4 | 2 | 0 |
| ARIA | 15 | 1 | 6 | 5 | 3 |
| Semantic | 6 | 0 | 3 | 2 | 1 |
| **Total** | **41** | **6** | **18** | **13** | **4** |

## Compliance Score

**Current:** 72% (AA)
**Target:** 100% (AA)

## Critical Issues (Must Fix)

1. **[CONTRAST]** Button text #777 on #f5f5f5 = 2.9:1 (need 4.5:1)
   - Files: Button.tsx:45, Card.tsx:89
   - Fix: Change to #595959 for 5.4:1

2. **[KEYBOARD]** div.clickable-item has onClick without keyboard support
   - Files: ListItem.tsx:23
   - Fix: Add role="button" tabIndex={0} onKeyDown

...
```

### 2. Issues by File

```markdown
## app/components/ui/Button.tsx

| Line | Severity | Issue | Rule |
|------|----------|-------|------|
| 45 | Critical | Low contrast text | WCAG 1.4.3 |
| 67 | Serious | Missing aria-label on icon button | WCAG 1.1.1 |
| 89 | Moderate | Generic link text "click here" | WCAG 2.4.4 |
```

### 3. Contrast Matrix (if scope includes color)

```markdown
## Color Contrast Matrix

| Foreground | Background | Ratio | AA Normal | AA Large | Usage |
|------------|------------|-------|-----------|----------|-------|
| #1a1a1a | #ffffff | 16.1:1 | ✓ | ✓ | Body text |
| #666666 | #ffffff | 5.7:1 | ✓ | ✓ | Secondary text |
| #999999 | #ffffff | 2.8:1 | ✗ | ✗ | Placeholder |
| #D4AF37 | #1a1a1a | 8.2:1 | ✓ | ✓ | Primary accent |
```

### 4. Fix Suggestions (Auto-Fixable)

```typescript
// Auto-fixable issues (with --fix flag)

// Issue: Missing alt attribute
// File: Avatar.tsx:15
- <img src={user.avatar} />
+ <img src={user.avatar} alt={`${user.name}'s avatar`} />

// Issue: Missing form label
// File: SearchInput.tsx:8
- <input type="search" placeholder="Search..." />
+ <label htmlFor="search" className="sr-only">Search</label>
+ <input id="search" type="search" placeholder="Search..." />
```

---

## Success Criteria

| Metric | Target |
|--------|--------|
| Critical issues | 0 |
| Serious issues | 0 |
| AA compliance | 100% |
| Auto-fixable applied | All (if --fix) |

---

## WCAG 2.2 New Success Criteria

WCAG 2.2 added these criteria (check all):

| Criterion | Level | Description |
|-----------|-------|-------------|
| 2.4.11 Focus Not Obscured (Minimum) | AA | Focused element not fully hidden |
| 2.4.12 Focus Not Obscured (Enhanced) | AAA | Focused element not partially hidden |
| 2.4.13 Focus Appearance | AAA | Focus indicator size/contrast |
| 2.5.7 Dragging Movements | AA | Single pointer alternative to drag |
| 2.5.8 Target Size (Minimum) | AA | 24x24px minimum target |
| 3.2.6 Consistent Help | A | Help in consistent location |
| 3.3.7 Redundant Entry | A | Don't re-ask same info |
| 3.3.8 Accessible Authentication (Minimum) | AA | No cognitive function test |
| 3.3.9 Accessible Authentication (Enhanced) | AAA | No object recognition |

---

## Integration with Other Commands

```bash
# Full audit
*a11y-audit ./app/components

# Color focus only
*a11y-audit ./app/components --scope color
# → Use *contrast-matrix for detailed color analysis

# Keyboard focus only
*a11y-audit ./app/components --scope keyboard
# → Use *focus-order for detailed tab order

# ARIA focus only
*a11y-audit ./app/components --scope aria
# → Use *aria-audit for detailed ARIA validation

# Auto-fix simple issues
*a11y-audit ./app/components --fix
```

---

## Failure Handling

- **No interactive elements found in path:** Verify path contains UI components. If correct, report "Zero interactive elements — minimal a11y surface"
- **Contrast calculation fails (color format not recognized):** Convert all color formats to hex before calculation. Skip unparseable dynamic colors, log as "contrast: unable to evaluate {N} dynamic colors"
- **ARIA validation references missing spec data:** Use built-in WAI-ARIA 1.2 role requirements. If role not in spec, flag as "unknown role — verify against latest spec"
- **Auto-fix (--fix) causes syntax errors:** Revert auto-fix changes, output fix suggestions as manual recommendations instead

## State Update

After execution, update `.state.yaml`:

```yaml
a11y_audit:
  last_run: "2026-01-05T14:30:00Z"
  path: "./app/components"
  level: "AA"
  results:
    total_issues: 41
    critical: 6
    serious: 18
    moderate: 13
    minor: 4
    compliance_score: 72
  categories:
    contrast: 12
    keyboard: 8
    aria: 15
    semantic: 6
  auto_fixed: 0
  next_action: "Fix 6 critical issues"
```

---

**Brad says:** "Accessibility isn't a feature. It's a quality bar. Zero critical issues or it doesn't ship."


## Related Checklists

- `squads/design/checklists/ds-accessibility-wcag-checklist.md`
- `squads/design/checklists/ds-a11y-release-gate-checklist.md`

## Process Guards
- **On Fail:** Stop execution, capture evidence, and return remediation steps before proceeding.
