# Task: Bundle Size Audit

> Command: `*bundle-audit [path]`
> Purpose: Analyze CSS/JS bundle size contribution per component
> **Execution Type:** `Worker`
> **Dependencies:** depends_on: `[]` · enables: `[]` · workflow: `metrics`

## Overview

This task performs detailed bundle analysis:
- CSS class usage and estimated size
- Component JS size estimation
- Tree-shaking opportunities
- Duplicate code detection

## Prerequisites

- Target path (default: `app/components/`)
- Build output available (optional, for accurate sizes)

## Execution Steps

### Step 1: CSS Class Analysis

```bash
# Extract all Tailwind classes used
grep -rohn --include="*.tsx" 'className="[^"]*"' {path}/ \
  | tr '"' '\n' | tr ' ' '\n' \
  | grep -v "^$\|className=" \
  | sort | uniq -c | sort -rn > /tmp/class-usage.txt

# Count unique classes
unique=$(cat /tmp/class-usage.txt | wc -l)

# Most used classes (optimization candidates)
head -20 /tmp/class-usage.txt

# Rarely used classes (bundle bloat candidates)
tail -50 /tmp/class-usage.txt | head -20
```

**Output:**
```
CSS Class Analysis
==================
Total unique classes: 234
Estimated CSS footprint: ~12KB (234 * 50 bytes avg)

Most Used (top 10):
  142  flex
  128  items-center
   98  p-4
   87  text-sm
   ...

Rarely Used (potential bloat):
    1  animate-accordion-down
    1  scroll-smooth
    ...
```

### Step 2: Component Size Estimation

```bash
# Lines per component (proxy for JS size)
find {path}/ -name "*.tsx" -exec wc -l {} \; \
  | sort -rn > /tmp/component-sizes.txt

# Top 10 largest
head -10 /tmp/component-sizes.txt

# Estimate JS size (rough: 1 line ≈ 50 bytes minified)
while read lines file; do
  kb=$(echo "scale=1; $lines * 50 / 1024" | bc)
  echo "$kb KB - $file"
done < /tmp/component-sizes.txt | head -10
```

**Output:**
```
Component Size Estimation
=========================
Largest Components:
  18.2 KB - FeedbackSection.tsx (373 lines)
  14.1 KB - ListGroupsView.tsx (289 lines)
  ...

Total estimated: ~150KB (before minification)
After minification: ~45KB (estimated 70% reduction)
After gzip: ~12KB (estimated 75% compression)
```

### Step 3: Import Analysis (Tree-shaking)

```bash
# Find unused imports (tree-shake candidates)
# Check imports vs actual usage in file
for file in $(find {path}/ -name "*.tsx"); do
  imports=$(grep "^import" "$file" | grep -oP "{ [^}]+ }" | tr -d '{},' | tr ' ' '\n' | grep -v "^$")
  for imp in $imports; do
    count=$(grep -c "\b$imp\b" "$file")
    if [ "$count" -eq 1 ]; then
      echo "UNUSED: $imp in $file"
    fi
  done
done
```

### Step 4: Duplicate Code Detection

```bash
# Find similar code blocks (potential extraction candidates)
# Look for repeated JSX patterns
grep -rhn --include="*.tsx" "<div className=" {path}/ \
  | cut -d: -f3- \
  | sort | uniq -c | sort -rn \
  | awk '$1 > 3 {print}' | head -20
```

**Output:**
```
Duplicate Patterns Detected
===========================
   12  <div className="flex items-center gap-2">
    8  <div className="p-4 rounded-lg border">
    6  <div className="text-sm text-muted-foreground">
    ...

Recommendation: Extract to shared molecules
```

### Step 5: Bundle Report Generation

```markdown
# Bundle Audit Report
Generated: {timestamp}
Path: {path}

## Summary
| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Unique CSS Classes | 234 | <500 | ✅ |
| Est. CSS Size | 12KB | <50KB | ✅ |
| Est. JS Size (min) | 45KB | <100KB | ✅ |
| Est. Total (gzip) | 15KB | <30KB | ✅ |

## CSS Analysis

### Class Usage Distribution
| Range | Count | % of Total |
|-------|-------|------------|
| Used >50x | 12 | 5% |
| Used 10-50x | 45 | 19% |
| Used 2-10x | 89 | 38% |
| Used 1x | 88 | 38% |

### Top 10 Classes
| Class | Usage | Estimated Size |
|-------|-------|----------------|
| flex | 142 | included |
| items-center | 128 | included |
| p-4 | 98 | included |
| ... | ... | ... |

### Rarely Used Classes (bloat candidates)
| Class | Usage | Recommendation |
|-------|-------|----------------|
| animate-accordion-down | 1 | Consider removal |
| scroll-smooth | 1 | Consider removal |
| ... | ... | ... |

## JS Analysis

### Largest Components
| Component | Lines | Est. Size | Status |
|-----------|-------|-----------|--------|
| FeedbackSection.tsx | 373 | 18KB | ⚠️ Refactor |
| ListGroupsView.tsx | 289 | 14KB | ⚠️ Refactor |
| ... | ... | ... | ... |

### Tree-shaking Opportunities
| File | Unused Imports | Savings |
|------|----------------|---------|
| Header.tsx | lodash, date-fns | ~5KB |
| ... | ... | ... |

## Duplicate Code

### Repeated Patterns (extract to molecules)
| Pattern | Occurrences | Files |
|---------|-------------|-------|
| `<div className="flex items-center gap-2">` | 12 | Card, List, ... |
| ... | ... | ... |

## Recommendations

1. **HIGH:** Refactor FeedbackSection (18KB → target 5KB)
2. **MEDIUM:** Extract 12 duplicate flex patterns to molecule
3. **LOW:** Remove 15 rarely-used CSS classes
4. **INFO:** Enable dynamic imports for Dialog, Modal

## Projected Savings
| Action | Current | After | Savings |
|--------|---------|-------|---------|
| Refactor large components | 150KB | 80KB | 47% |
| Extract duplicates | - | - | ~5KB |
| Remove unused classes | 12KB | 10KB | 17% |
| **Total** | **162KB** | **90KB** | **44%** |
```

## Failure Handling

- **No .tsx files found in path:** Exit with error "No component files in {path}. Verify target path."
- **Tailwind config not found:** Skip custom class analysis, note "Custom CSS analysis skipped — no tailwind.config found"
- **Build output not available:** Use line-count estimation instead of actual bundle sizes. Note "Estimates based on source lines, not build output"
- **Import analysis produces false positives:** Filter out type-only imports and re-exported barrel imports before reporting unused

## Output

- `outputs/design-system/{project}/metrics/bundle-audit-report.md`
- `outputs/design-system/{project}/metrics/class-usage.txt`
- `outputs/design-system/{project}/metrics/component-sizes.txt`

## Related Checklists

- `squads/design/checklists/ds-pattern-audit-checklist.md`
- `squads/design/checklists/ds-component-quality-checklist.md`

## Success Criteria

- [ ] All CSS classes catalogued
- [ ] Component sizes estimated
- [ ] Tree-shaking opportunities identified
- [ ] Duplicate patterns found
- [ ] Report with actionable recommendations

## Related Commands

- `*ds-health` - Overall health dashboard
- `*dead-code` - Unused code detection
- `*refactor-plan` - Plan component refactoring


## Process Guards
- **On Fail:** Stop execution, capture evidence, and return remediation steps before proceeding.
