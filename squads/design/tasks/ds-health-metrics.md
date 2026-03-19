# Task: Design System Health Metrics

> Command: `*ds-health [path]`
> Purpose: Generate comprehensive health dashboard for the design system
> **Execution Type:** `Agent`
> **Dependencies:** depends_on: `[]` · enables: `[bundle-audit, token-usage-analytics, dead-code-detection]` · workflow: `metrics`

## Output Schema
- **produces:** `outputs/design-system/{project}/metrics/health-report.json`
- **format:** JSON data
- **consumed_by:** bundle-audit, token-usage-analytics, dead-code-detection

## Overview

This task runs grep-based scans across the entire design system and generates a health report with:
- Token coverage metrics
- Component adoption rates
- Bundle size analysis
- Code quality indicators
- Consistency scores

## Prerequisites

- Design tokens spec: `squads/super-agentes/data/design-tokens-spec.yaml`
- Target path (default: `app/components/`)

## Execution Steps

### Step 1: Token Coverage Analysis

Run grep to count token-based styles vs hardcoded values in all component files.

```bash
# Count total style declarations
total_styles=$(grep -rn --include="*.tsx" "className=" {path}/ | wc -l)

# Count token-based styles (using CSS vars or Tailwind tokens)
token_styles=$(grep -rn --include="*.tsx" \
  "studio-\|var(--\|text-foreground\|bg-background\|border-border" {path}/ | wc -l)

# Count hardcoded styles
hardcoded=$(grep -rn --include="*.tsx" "#[0-9A-Fa-f]\{6\}" {path}/ | wc -l)
```

**Metrics:**
- Token Coverage: `(token_styles / total_styles) * 100`
- Hardcoded Violations: count of hex colors
- Target: >95% token coverage

### Step 2: Component Adoption Analysis

Track which design system components are being used.

```bash
# Count imports of UI components
grep -rn --include="*.tsx" "from '@/components/ui" {path}/ \
  | sed 's/.*\/ui\/\([^'"'"']*\).*/\1/' \
  | sort | uniq -c | sort -rn
```

**Output:**
```
  47 button
  32 card
  28 input
  15 dialog
  12 badge
   8 tooltip
   3 avatar
   0 slider (unused)
```

**Metrics:**
- Total UI Components: count
- Components in Use: count with >0 imports
- Adoption Rate: `(used / total) * 100`
- Unused Components: list

### Step 3: Bundle Size Analysis

Calculate CSS and JS size per component.

```bash
# Estimate CSS class usage (Tailwind purge analysis)
grep -rohn --include="*.tsx" 'className="[^"]*"' {path}/ \
  | tr ' ' '\n' \
  | sort | uniq -c | sort -rn \
  | head -50

# Count unique Tailwind classes
unique_classes=$(grep -rohn --include="*.tsx" 'className="[^"]*"' {path}/ \
  | tr ' ' '\n' | tr '"' '\n' | grep -v "^$" \
  | sort -u | wc -l)
```

**Metrics:**
- Unique CSS Classes: count
- Estimated CSS Size: `unique_classes * 50 bytes` (rough estimate)
- Bundle Target: <50KB CSS

### Step 4: Code Quality Indicators

```bash
# Lines per component (complexity indicator)
find {path}/ -name "*.tsx" -exec wc -l {} \; | sort -rn | head -20

# Components over 200 lines (candidates for refactoring)
over_200=$(find {path}/ -name "*.tsx" -exec wc -l {} \; \
  | awk '$1 > 200 {print}' | wc -l)

# TypeScript strict compliance
tsc_errors=$(npx tsc --noEmit 2>&1 | grep "error TS" | wc -l)
```

**Metrics:**
- Avg Lines per Component: average
- Components >200 lines: count (should be 0)
- TypeScript Errors: count (should be 0)

### Step 5: Consistency Score

Check for pattern consistency across codebase.

```bash
# Naming convention compliance
# Components should be PascalCase
non_pascal=$(find {path}/ -name "*.tsx" \
  | xargs basename -a | grep -v "^[A-Z]" | wc -l)

# Import style consistency
# Should use @/ aliases
relative_imports=$(grep -rn "from '\.\./\.\./\.\." {path}/ | wc -l)

# Barrel export compliance
missing_barrels=$(find {path}/ -type d -mindepth 1 \
  | while read dir; do
      [ ! -f "$dir/index.ts" ] && echo "$dir"
    done | wc -l)
```

**Metrics:**
- Naming Compliance: `(pascal / total) * 100`
- Import Consistency: `(1 - relative/total) * 100`
- Barrel Coverage: `(with_barrel / total_dirs) * 100`

### Step 6: Generate Health Report

**Output Format:**

```markdown
# Design System Health Report
Generated: {timestamp}
Path: {path}

## Overall Health Score: {score}/100

### Token Coverage
| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Token Usage | 94.2% | >95% | ⚠️ |
| Hardcoded Colors | 12 | 0 | ❌ |
| CSS Variables | 847 | - | ✅ |

### Component Adoption
| Metric | Value | Status |
|--------|-------|--------|
| Total Components | 45 | - |
| Components in Use | 38 | 84% |
| Unused Components | 7 | ⚠️ |

**Unused:** slider, menubar, navigation-menu, ...

### Bundle Analysis
| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Unique CSS Classes | 234 | <500 | ✅ |
| Est. CSS Size | 12KB | <50KB | ✅ |
| Largest Component | Card (8KB) | - | - |

### Code Quality
| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Avg Lines/Component | 87 | <200 | ✅ |
| Components >200 lines | 3 | 0 | ⚠️ |
| TypeScript Errors | 0 | 0 | ✅ |

**Over 200 lines:** FeedbackSection (373), ListGroupsView (289), ...

### Consistency
| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Naming Compliance | 98% | 100% | ⚠️ |
| Import Consistency | 100% | 100% | ✅ |
| Barrel Coverage | 95% | 100% | ⚠️ |

## Recommendations

1. **HIGH:** Fix 12 hardcoded colors in Button.tsx, Card.tsx
2. **MEDIUM:** Refactor 3 components over 200 lines
3. **LOW:** Add barrel exports to 2 directories
4. **INFO:** Consider removing 7 unused UI components

## Trend (if previous report exists)
| Metric | Previous | Current | Change |
|--------|----------|---------|--------|
| Health Score | 78 | 85 | +7 ↑ |
| Token Coverage | 91% | 94% | +3% ↑ |
| Components >200 | 8 | 3 | -5 ↓ |
```

## Health Score Calculation

```yaml
health_score:
  weights:
    token_coverage: 30      # 0-30 points
    component_adoption: 15  # 0-15 points
    bundle_size: 15         # 0-15 points
    code_quality: 25        # 0-25 points
    consistency: 15         # 0-15 points

  scoring:
    token_coverage:
      100%: 30
      95%: 27
      90%: 24
      <90%: (coverage * 0.3)

    code_quality:
      0_errors_0_over200: 25
      0_errors_some_over200: 20
      some_errors: 10
      many_errors: 0
```

## Output Location

```
outputs/design-system/{project}/
├── health-report-{date}.md
├── health-history.json
└── metrics/
    ├── token-coverage.json
    ├── component-adoption.json
    ├── bundle-analysis.json
    └── code-quality.json
```

## Failure Handling

- **Token spec file not found:** Skip token coverage step, calculate remaining metrics, note "token coverage: N/A — spec file missing" in report
- **No component files in path:** Exit with error "No .tsx files found in {path}. Verify design system path."
- **TypeScript compiler not available:** Skip tsc_errors metric, log "TypeScript check skipped — tsc not found" in report
- **Grep returns zero matches for all token patterns:** Verify grep patterns match project's token format (CSS vars, Tailwind, styled-components). Adjust patterns and retry once

## Success Criteria

- [ ] Health score calculated (0-100)
- [ ] All metrics collected
- [ ] Report generated in markdown
- [ ] Recommendations prioritized
- [ ] Historical comparison (if previous exists)

## Related Commands

- `*validate-tokens` - Deep dive on token violations
- `*bundle-audit` - Detailed bundle analysis
- `*token-usage` - Token usage analytics
- `*dead-code` - Unused code detection


## Related Checklists

- `squads/design/checklists/ds-component-quality-checklist.md`
- `squads/design/checklists/ds-pattern-audit-checklist.md`

## Process Guards
- **On Fail:** Stop execution, capture evidence, and return remediation steps before proceeding.
