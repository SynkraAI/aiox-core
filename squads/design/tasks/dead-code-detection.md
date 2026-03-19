# Task: Dead Code Detection

> Command: `*dead-code [path]`
> Purpose: Find unused tokens, components, exports, and styles
> **Execution Type:** `Worker`
> **Dependencies:** depends_on: `[]` · enables: `[]` · workflow: `metrics`

## Overview

This task identifies dead code in the design system:
- Unused design tokens
- Unexported/unused components
- Dead CSS classes
- Orphaned files
- Unused exports

## Prerequisites

- Target path (default: `app/components/`)
- Design tokens spec (for token analysis)

## Execution Steps

### Step 1: Unused Components

Find components that are never imported elsewhere.

```bash
# Get all component exports
exports=$(grep -rh --include="*.tsx" "^export \(const\|function\|default\)" {path}/ \
  | grep -oP "(?<=export (const|function) )\w+|(?<=export default )\w+" \
  | sort -u)

# Check each export for usage
for component in $exports; do
  # Count imports of this component (excluding its own file)
  imports=$(grep -rn --include="*.tsx" "import.*$component\|from.*$component" {path}/ \
    | grep -v "export.*$component" | wc -l)

  if [ "$imports" -eq 0 ]; then
    echo "UNUSED COMPONENT: $component"
  fi
done
```

**Output:**
```
Unused Components Detected
==========================
UNUSED: LegacyButton (app/components/ui/legacy-button.tsx)
UNUSED: OldModal (app/components/shared/old-modal.tsx)
UNUSED: TestComponent (app/components/test-component.tsx)

Total: 3 unused components (~450 lines, ~22KB)
```

### Step 2: Unused Exports

Find named exports that are never imported.

```bash
# Find all named exports from index.ts files
for index in $(find {path}/ -name "index.ts"); do
  dir=$(dirname "$index")
  exports=$(grep "^export" "$index" | grep -oP "(?<=export { )[\w, ]+(?= })" | tr ',' '\n' | tr -d ' ')

  for exp in $exports; do
    # Check if exported item is imported anywhere
    imports=$(grep -rn "import.*{[^}]*\b$exp\b" {path}/ --include="*.tsx" --include="*.ts" \
      | grep -v "$index" | wc -l)

    if [ "$imports" -eq 0 ]; then
      echo "UNUSED EXPORT: $exp from $index"
    fi
  done
done
```

### Step 3: Unused CSS Classes

Find Tailwind classes defined but never used (from tailwind.config.ts extend).

```bash
# Extract custom classes from tailwind.config.ts
custom_classes=$(grep -oP "(?<=')\w+(?=':)" app/tailwind.config.ts)

for class in $custom_classes; do
  usage=$(grep -rn "\b$class\b" {path}/ --include="*.tsx" | wc -l)
  if [ "$usage" -eq 0 ]; then
    echo "UNUSED CSS: $class"
  fi
done
```

### Step 4: Orphaned Files

Find files not imported anywhere.

```bash
# Get all .tsx files
for file in $(find {path}/ -name "*.tsx" -type f); do
  filename=$(basename "$file" .tsx)

  # Skip index files and test files
  [[ "$filename" == "index" || "$filename" == *".test"* ]] && continue

  # Check if file is imported anywhere
  imports=$(grep -rn "from.*$filename\|import.*$filename" {path}/ \
    --include="*.tsx" --include="*.ts" | grep -v "^$file" | wc -l)

  if [ "$imports" -eq 0 ]; then
    lines=$(wc -l < "$file")
    echo "ORPHAN: $file ($lines lines)"
  fi
done
```

### Step 5: Unused Design Tokens

Cross-reference tokens spec with actual usage.

```bash
# Load tokens from spec
tokens=$(grep -oP "^\s{4}\w+:" design-tokens-spec.yaml | tr -d ' :')

for token in $tokens; do
  # Map token name to CSS class pattern
  case $token in
    gold) pattern="studio-primary\|primary-color" ;;
    gold_dark) pattern="studio-primary-dark\|primary-dark" ;;
    base) pattern="bg-background\|studio-bg" ;;
    *) pattern="$token" ;;
  esac

  usage=$(grep -rn "$pattern" {path}/ --include="*.tsx" | wc -l)
  if [ "$usage" -eq 0 ]; then
    echo "UNUSED TOKEN: $token"
  fi
done
```

### Step 6: Unused Types/Interfaces

Find type definitions never referenced.

```bash
# Find all type/interface definitions
types=$(grep -rh "^export \(type\|interface\)" {path}/ --include="*.ts" \
  | grep -oP "(?<=export (type|interface) )\w+")

for type in $types; do
  # Check usage (excluding definition)
  usage=$(grep -rn "\b$type\b" {path}/ --include="*.tsx" --include="*.ts" \
    | grep -v "export type $type\|export interface $type" | wc -l)

  if [ "$usage" -eq 0 ]; then
    echo "UNUSED TYPE: $type"
  fi
done
```

### Step 7: Generate Dead Code Report

```markdown
# Dead Code Detection Report
Generated: {timestamp}
Path: {path}

## Summary

| Category | Count | Lines | Est. Size |
|----------|-------|-------|-----------|
| Unused Components | 3 | 450 | 22KB |
| Unused Exports | 12 | - | - |
| Orphaned Files | 2 | 180 | 9KB |
| Unused Tokens | 9 | - | - |
| Unused Types | 8 | 45 | 2KB |
| **Total** | **34** | **675** | **33KB** |

## Unused Components

| Component | File | Lines | Last Modified |
|-----------|------|-------|---------------|
| LegacyButton | ui/legacy-button.tsx | 120 | 2024-08-15 |
| OldModal | shared/old-modal.tsx | 230 | 2024-06-22 |
| TestComponent | test-component.tsx | 100 | 2024-09-01 |

**Action:** Delete or archive these files

## Unused Exports

| Export | Source | Recommendation |
|--------|--------|----------------|
| formatLegacyDate | utils/date.ts | Remove from barrel |
| OldTheme | themes/index.ts | Remove |
| ... | ... | ... |

## Orphaned Files

| File | Lines | Reason |
|------|-------|--------|
| components/wip/draft.tsx | 80 | Never imported |
| components/deprecated/v1-card.tsx | 100 | Replaced by Card |

**Action:** Delete or move to archive folder

## Unused Design Tokens

| Token | Category | Recommendation |
|-------|----------|----------------|
| studio-accent | Color | Remove from spec |
| p-20 | Spacing | Remove from scale |
| font-serif | Typography | Remove or document |
| ... | ... | ... |

## Unused Types

| Type | File | Recommendation |
|------|------|----------------|
| LegacyUser | types/user.ts | Remove |
| OldConfig | types/config.ts | Remove |
| ... | ... | ... |

## Impact Analysis

### If All Dead Code Removed:

| Metric | Before | After | Savings |
|--------|--------|-------|---------|
| Total Files | 234 | 229 | 2% |
| Total Lines | 45,000 | 44,325 | 1.5% |
| Bundle Size | 150KB | 117KB | 22% |
| Build Time | 30s | 28s | 7% |

## Recommendations

### Immediate Actions (Safe to Delete)
1. `ui/legacy-button.tsx` - No references anywhere
2. `shared/old-modal.tsx` - Replaced by Dialog
3. `test-component.tsx` - Test file in production

### Review Before Deleting
1. `themes/old-theme.ts` - May be used dynamically
2. `utils/legacy.ts` - Check for string imports

### Keep But Document
1. `font-serif` token - May be needed for content pages
2. `p-20` spacing - Used in marketing pages

## Cleanup Script

```bash
# Generated cleanup script (review before running!)

# Delete unused components
rm app/components/ui/legacy-button.tsx
rm app/components/shared/old-modal.tsx
rm app/components/test-component.tsx

# Remove unused exports from barrels
# (manual edit required - see files below)
# - app/components/ui/index.ts
# - app/utils/index.ts

# Archive deprecated files
mkdir -p .archive/deprecated
mv app/components/deprecated/* .archive/deprecated/
```

## Verification Commands

After cleanup, run:
```bash
# Verify no broken imports
npx tsc --noEmit

# Verify app still builds
npm run build

# Verify tests pass
npm test
```
```

## Output Location

```
outputs/design-system/{project}/
├── dead-code-report-{date}.md
├── dead-code.json
└── cleanup-script.sh (generated, review before running)
```

## Failure Handling

- **No component exports found:** Verify file extensions (.tsx, .ts, .jsx). Check for default exports vs named exports pattern
- **Dynamic imports produce false positives:** Cross-reference with Next.js dynamic(), React.lazy(), and import() patterns before marking as unused
- **Orphan file detection flags entry points:** Exclude known entry points (pages/, app/, index files) from orphan detection
- **Token spec not available for cross-reference:** Skip unused token detection, note "Token dead code analysis skipped — no spec file"

## Success Criteria

- [ ] All unused components identified
- [ ] Orphaned files found
- [ ] Unused tokens catalogued
- [ ] Impact analysis complete
- [ ] Cleanup script generated

## Safety Notes

1. **Never auto-delete** - Generate script, human reviews
2. **Check dynamic imports** - `import()` may not be detected
3. **Check string references** - Component names as strings
4. **Test after cleanup** - Build + test must pass
5. **Git commit first** - Easy rollback if needed

## Related Commands

- `*ds-health` - Overall health dashboard
- `*token-usage` - Token usage analytics
- `*bundle-audit` - Bundle size analysis


## Related Checklists

- `squads/design/checklists/ds-component-quality-checklist.md`

## Process Guards
- **On Fail:** Stop execution, capture evidence, and return remediation steps before proceeding.
