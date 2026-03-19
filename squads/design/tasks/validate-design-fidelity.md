# Task: Validate Design Fidelity

> Command: `*validate-tokens [path]`
> Purpose: Validate that code uses design tokens correctly, no hardcoded values
> **Execution Type:** `Agent`
> **Dependencies:** depends_on: `[]` · enables: `[]` · workflow: `quality-gate`

## Overview

This task scans code for design token violations:
- Hardcoded colors instead of tokens/variables
- Hardcoded spacing instead of scale values
- Incorrect token usage
- Contrast ratio violations

## Prerequisites

- Read `squads/super-agentes/data/design-tokens-spec.yaml` (single source of truth)
- Target path to validate (default: `app/components/`)

## Execution Steps

### Step 1: Scan for Hardcoded Colors

```bash
# Find hardcoded hex colors (excluding allowed patterns)
grep -rn --include="*.tsx" --include="*.ts" --include="*.css" \
  -E "#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}" {path}/ \
  | grep -v "node_modules" \
  | grep -v "// allowed:" \
  | grep -v "design-tokens-spec"
```

**Violations to flag:**
- `bg-[#D4AF37]` → Should use `bg-studio-primary` or `bg-[var(--primary-color)]`
- `text-[#0A0A0F]` → Should use `text-background` or `bg-studio-bg`
- `border-[#111116]` → Should use `border-studio-card-bg`

**Allowed patterns:**
- `hsl(var(--...))` - CSS variable reference
- `var(--...)` - CSS variable reference
- Comments with `// token:` or `// color:`
- Files in `data/` folders (data definitions)

### Step 2: Scan for Hardcoded Spacing

```bash
# Find hardcoded pixel values in className
grep -rn --include="*.tsx" \
  -E "p-\[|m-\[|gap-\[|space-\[|w-\[|h-\[" {path}/ \
  | grep -v "node_modules" \
  | grep -E "\[[0-9]+px\]|\[[0-9]+rem\]"
```

**Violations to flag:**
- `p-[12px]` → Should use `p-3` (spacing.3 = 12px)
- `gap-[24px]` → Should use `gap-6` (spacing.6 = 24px)
- `w-[400px]` → Should use `w-[25rem]` or semantic width

**Allowed:**
- Responsive breakpoint values
- One-off layout constraints with comment

### Step 3: Validate Component Token Usage

For each component file, check:

```typescript
// Button.tsx
// Expected tokens (from design-tokens-spec.yaml):
// - padding: components.button.padding.md
// - border_radius: components.button.border_radius
// - font_size: components.button.font_size
// - min_height: components.button.min_height.md
```

**Check pattern:**
```bash
# Find Button components and check their classes
grep -A 20 "const Button" {path}/**/*.tsx | grep -E "className|class="
```

### Step 4: Contrast Ratio Check

For each color pair found:

1. Extract foreground and background colors
2. Calculate contrast ratio
3. Flag violations below WCAG AA thresholds:
   - Normal text: < 4.5:1
   - Large text (18px+): < 3.0:1
   - UI components: < 3.0:1

**Common violations:**
- `text-muted` on `bg-surface` → Check contrast
- `text-secondary` on `bg-elevated` → Check contrast

### Step 5: Generate Report

Output format:

```markdown
# Design Fidelity Report

## Summary
- Files scanned: {count}
- Violations found: {count}
- Severity: {HIGH|MEDIUM|LOW}

## Hardcoded Colors ({count})

| File | Line | Value | Should Be |
|------|------|-------|-----------|
| Button.tsx | 23 | #D4AF37 | studio-primary |
| Card.tsx | 45 | #111116 | studio-card-bg |

## Hardcoded Spacing ({count})

| File | Line | Value | Should Be |
|------|------|-------|-----------|
| Modal.tsx | 12 | p-[24px] | p-6 |

## Contrast Violations ({count})

| File | Foreground | Background | Ratio | Required |
|------|------------|------------|-------|----------|
| Badge.tsx | #71717A | #1a1a1f | 3.2:1 | 4.5:1 |

## Recommendations

1. Replace hardcoded colors with CSS variables
2. Use spacing scale instead of pixel values
3. Increase contrast for text elements
```

## Auto-Fix Mode

If `--fix` flag provided:

```typescript
// Before
className="bg-[#D4AF37] text-[#0A0A0F]"

// After
className="bg-studio-primary text-studio-bg"
```

**Auto-fix mapping:**
```yaml
"#D4AF37": "studio-primary"
"#B8962E": "studio-primary-dark"
"#0A0A0F": "studio-bg"
"#111116": "studio-card-bg"
"#1a1a1f": "bg-surface"
```

## Integration with Subagents

When delegating to subagents, include:

```
## OBRIGATORIO - Design Fidelity

1. Read: squads/super-agentes/data/design-tokens-spec.yaml
2. NUNCA usar cores hardcoded (#D4AF37, #0A0A0F, etc.)
3. SEMPRE usar:
   - `studio-primary` para cor primaria
   - `studio-bg` para background
   - `studio-card-bg` para cards
   - Spacing scale (p-4, gap-6, etc.)

4. Validacao final:
   grep -n "#[0-9A-Fa-f]\{6\}" {pasta}/**/*.tsx
   Se retornar resultados → CORRIGIR antes de reportar
```

## Failure Handling

- **Grep returns false positives (legitimate hex values in comments or data):** Parse context lines to exclude commented code and data files, refine regex to match only className/style attributes, whitelist known safe patterns
- **Contrast ratio calculation fails due to complex color overlays or opacity:** Extract computed styles from browser rendering, use visual screenshot analysis for actual perceived contrast, document manual verification required
- **Auto-fix mode produces incorrect token mappings:** Generate suggested fixes as commented alternatives rather than direct replacements, require manual review of all auto-fixes before commit, provide rollback script
- **Token usage validation detects component using non-standard token path:** Cross-reference with design-tokens-spec.yaml for aliases/deprecated paths, suggest migration to current token namespace, allow grandfather clause for legacy components with documentation

## Success Criteria

- [ ] 0 hardcoded colors in new code
- [ ] 0 hardcoded spacing values
- [ ] All contrast ratios >= WCAG AA
- [ ] Report generated with findings

## Output

- `outputs/design-system/{project}/quality/design-fidelity-report.md`
- Violations list (hardcoded colors, spacing, contrast) with file/line
- Remediation recommendations mapped to tokens

## Quality Gate

> **GATE: Fidelity Acceptance** — Final quality gate before component is marked complete

| Metric | Threshold | Action if FAIL |
|--------|-----------|----------------|
| Visual match | >= 95% pixel similarity | Identify divergent areas, fix token references or CSS specificity |
| Token usage | 100% (zero hardcoded values) | Replace every hardcoded value with token reference |
| Accessibility | WCAG AA pass (4.5:1 text, 3:1 UI) | Fix contrast issues using closest compliant token color |
| Responsive | All breakpoints match design | Add missing media queries or container queries |

**Rework rule:** If visual match < 85%, the component likely has structural issues — return to *build or *refactor-plan rather than patching CSS.

## Related Files

- `design-tokens-spec.yaml` - Token definitions
- `squads/design/checklists/design-fidelity-checklist.md` - Manual verification
- `component-visual-spec-tmpl.md` - Component specs


## Related Checklists

- `squads/design/checklists/design-fidelity-checklist.md`

## Process Guards
- **On Fail:** Stop execution, capture evidence, and return remediation steps before proceeding.
