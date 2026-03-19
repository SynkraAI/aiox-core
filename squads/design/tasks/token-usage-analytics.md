# Task: Token Usage Analytics

> Command: `*token-usage [path]`
> Purpose: Analyze which design tokens are used, unused, and misused
> **Execution Type:** `Worker`
> **Dependencies:** depends_on: `[]` · enables: `[]` · workflow: `metrics`

## Overview

This task provides analytics on design token adoption:
- Which tokens are most/least used
- Token coverage by category (colors, spacing, typography)
- Misuse detection (wrong token for context)
- Recommendations for token consolidation

## Prerequisites

- Design tokens spec: `squads/super-agentes/data/design-tokens-spec.yaml`
- Target path (default: `app/components/`)

## Execution Steps

### Step 1: Token Inventory

Load all defined tokens from spec:

```yaml
# From design-tokens-spec.yaml
colors:
  primary: [gold, gold_dark, gold_light]
  background: [base, elevated, surface, overlay]
  text: [primary, secondary, muted, inverse]
  semantic: [success, warning, error, info]
  border: [default, subtle, emphasis]

spacing: [0, px, 0.5, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24]

typography:
  families: [sans, serif, display, mono]
  sizes: [xs, sm, base, lg, xl, 2xl, 3xl, 4xl, 5xl]
  weights: [normal, medium, semibold, bold]
```

### Step 2: Token Usage Scan

```bash
# Color tokens
echo "=== Color Token Usage ==="
for token in studio-primary studio-primary-dark studio-bg studio-card-bg \
             text-foreground text-muted-foreground bg-background bg-card; do
  count=$(grep -rn --include="*.tsx" "$token" {path}/ | wc -l)
  echo "$count - $token"
done | sort -rn

# Spacing tokens
echo "=== Spacing Token Usage ==="
for size in p-1 p-2 p-3 p-4 p-5 p-6 p-8 p-10 p-12 \
            m-1 m-2 m-3 m-4 m-5 m-6 m-8 \
            gap-1 gap-2 gap-3 gap-4 gap-6 gap-8; do
  count=$(grep -rn --include="*.tsx" "\b$size\b" {path}/ | wc -l)
  echo "$count - $size"
done | sort -rn

# Typography tokens
echo "=== Typography Token Usage ==="
for token in text-xs text-sm text-base text-lg text-xl text-2xl \
             font-normal font-medium font-semibold font-bold \
             font-sans font-serif font-display font-mono; do
  count=$(grep -rn --include="*.tsx" "\b$token\b" {path}/ | wc -l)
  echo "$count - $token"
done | sort -rn
```

### Step 3: Unused Token Detection

Compare defined tokens vs actual usage:

```bash
# Find defined but never used tokens
defined_tokens=$(cat design-tokens-spec.yaml | grep "value:" | wc -l)
used_tokens=0

for token in $(cat design-tokens-spec.yaml | grep -oP "^\s+\w+:" | tr -d ' :'); do
  if grep -rq "$token" {path}/; then
    ((used_tokens++))
  else
    echo "UNUSED: $token"
  fi
done

echo "Token adoption: $used_tokens / $defined_tokens"
```

### Step 4: Misuse Detection

Check tokens used in wrong context:

```bash
# Background tokens on text elements
grep -rn --include="*.tsx" "text-.*bg-\|text-studio-bg\|text-background" {path}/

# Text tokens on background elements
grep -rn --include="*.tsx" "bg-.*text-\|bg-foreground\|bg-muted-foreground" {path}/

# Spacing misuse (very large padding on small elements)
grep -rn --include="*.tsx" "Button.*p-8\|Badge.*p-6\|Icon.*p-4" {path}/

# Wrong semantic color usage
# Error color for success states
grep -rn --include="*.tsx" "success.*text-red\|error.*text-green" {path}/
```

### Step 5: Usage Heatmap Generation

```markdown
# Token Usage Heatmap

## Colors
| Token | Usage | Coverage | Status |
|-------|-------|----------|--------|
| studio-primary | 47 | 12% | ✅ High |
| studio-bg | 89 | 23% | ✅ High |
| studio-card-bg | 34 | 9% | ✅ Medium |
| text-foreground | 156 | 40% | ✅ Very High |
| text-muted | 67 | 17% | ✅ High |
| studio-primary-light | 2 | <1% | ⚠️ Low |
| studio-accent | 0 | 0% | ❌ Unused |

## Spacing
| Scale | Usage | Most Common Context |
|-------|-------|---------------------|
| p-4 | 234 | Cards, Sections |
| p-6 | 89 | Modal, Large cards |
| gap-2 | 156 | Inline elements |
| gap-4 | 78 | Form fields |
| p-1 | 12 | Tight badges |
| p-12 | 3 | Hero sections |
| p-20 | 0 | ❌ Unused |

## Typography
| Token | Usage | Context |
|-------|-------|---------|
| text-sm | 289 | Body, buttons |
| text-base | 145 | Paragraphs |
| text-xs | 67 | Captions, badges |
| text-5xl | 8 | Hero headings |
| font-medium | 156 | Buttons, labels |
| font-serif | 0 | ❌ Unused |
```

### Step 6: Generate Analytics Report

```markdown
# Token Usage Analytics Report
Generated: {timestamp}
Path: {path}

## Summary

| Category | Defined | Used | Coverage |
|----------|---------|------|----------|
| Colors | 18 | 15 | 83% |
| Spacing | 15 | 12 | 80% |
| Typography | 17 | 14 | 82% |
| **Total** | **50** | **41** | **82%** |

## Top 10 Most Used Tokens

| Rank | Token | Usage | Category |
|------|-------|-------|----------|
| 1 | text-foreground | 156 | Color |
| 2 | text-sm | 289 | Typography |
| 3 | p-4 | 234 | Spacing |
| 4 | gap-2 | 156 | Spacing |
| 5 | font-medium | 156 | Typography |
| ... | ... | ... | ... |

## Unused Tokens (Candidates for Removal)

| Token | Category | Recommendation |
|-------|----------|----------------|
| studio-accent | Color | Remove or document use case |
| p-20 | Spacing | Remove from scale |
| font-serif | Typography | Remove if not needed |
| ... | ... | ... |

## Misuse Detected

| File | Line | Issue | Fix |
|------|------|-------|-----|
| Card.tsx | 45 | bg-foreground (text token on bg) | Use bg-surface |
| Alert.tsx | 23 | success with text-red | Use text-green |
| ... | ... | ... | ... |

## Token Consolidation Opportunities

### Similar Tokens (merge candidates)
| Tokens | Usage | Recommendation |
|--------|-------|----------------|
| p-3, p-4 | 45, 234 | Keep p-4, migrate p-3 |
| gap-3, gap-4 | 23, 78 | Keep gap-4, migrate gap-3 |

### Underutilized Scale Points
| Token | Usage | Recommendation |
|-------|-------|----------------|
| p-5 | 3 | Consider removing |
| text-lg | 8 | Document specific use |

## Recommendations

1. **Remove** 9 unused tokens from spec
2. **Consolidate** p-3 → p-4 (23 occurrences)
3. **Fix** 5 token misuse instances
4. **Document** use cases for low-usage tokens
5. **Consider** adding text-muted-dark (no dark variant)

## Token Health Score: 82/100

Breakdown:
- Coverage: 82% (41/50 tokens used)
- No misuse: -3 points (5 misuse instances)
- Consolidation: -5 points (redundant tokens)
```

## Output Location

```
outputs/design-system/{project}/
├── token-analytics-{date}.md
├── token-usage.json
└── token-heatmap.html (visual)
```

## Failure Handling

- **Design tokens spec file not found:** Exit with error "Token spec required at squads/super-agentes/data/design-tokens-spec.yaml. Cannot analyze without token inventory."
- **Zero token matches in codebase:** Verify token naming convention matches project (CSS vars vs Tailwind classes vs styled-components). Adjust grep patterns and retry
- **Misuse detection produces false positives:** Filter results by context (className vs inline style vs variable name). Only report confirmed misuse patterns
- **Token heatmap generation fails:** Fall back to text-only report with usage counts per token category

## Success Criteria

- [ ] All tokens catalogued (defined vs used)
- [ ] Usage counts per token
- [ ] Unused tokens identified
- [ ] Misuse patterns found
- [ ] Consolidation recommendations

## Related Commands

- `*ds-health` - Overall health dashboard
- `*validate-tokens` - Validate token usage in code
- `*dead-code` - Full dead code detection


## Related Checklists

- `squads/design/checklists/ds-component-quality-checklist.md`
- `squads/design/checklists/ds-pattern-audit-checklist.md`

## Process Guards
- **On Fail:** Stop execution, capture evidence, and return remediation steps before proceeding.
