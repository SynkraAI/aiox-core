# Task: Audit Reading Experience

> Command: `*reading-audit [path]`
> Purpose: Audit reading components against high-retention best practices
> **Execution Type:** `Agent`
> **Dependencies:** depends_on: `[]` · enables: `[]` · workflow: `standalone`

## Overview

This task analyzes reading-focused components (articles, blog posts, documentation, book readers) against evidence-based best practices from publishers and research.

## Prerequisites

- Read: `squads/super-agentes/data/high-retention-reading-guide.md`
- Read: `squads/super-agentes/checklists/reading-accessibility-checklist.md`
- Target path to audit

## Execution Steps

### Step 1: Identify Reading Components

```bash
# Find components with reading-related names
find {path}/ -name "*.tsx" | xargs grep -l \
  "article\|reader\|prose\|content\|blog\|post\|chapter\|book" | head -20

# Find components with reading-related classes
grep -rn --include="*.tsx" \
  "prose\|article\|reading\|content-area\|text-container" {path}/
```

### Step 2: Typography Audit

**Font Size Check:**
```bash
# Find font-size declarations
grep -rn --include="*.tsx" --include="*.css" "font-size:" {path}/ \
  | grep -E "[0-9]+px" > /tmp/font-sizes.txt

# Flag sizes below 16px (excluding xs, caption, footnote)
cat /tmp/font-sizes.txt | grep -E "1[0-5]px|[0-9]px"
```

**Expected:**
- Body text: ≥16px (ideal 18-21px)
- Captions: ≥11px
- Labels: ≥13px

**Line Height Check:**
```bash
# Find line-height declarations
grep -rn --include="*.tsx" --include="*.css" "line-height:" {path}/ \
  > /tmp/line-heights.txt

# Flag low line-heights for body text
cat /tmp/line-heights.txt | grep -E "1\.[0-4]|: 1[^.]"
```

**Expected:**
- Body text: ≥1.5 (ideal 1.6)
- Headings: 1.25-1.375

**Line Length Check:**
```bash
# Find max-width on text containers
grep -rn --include="*.tsx" --include="*.css" \
  "max-width:\|measure\|ch\|prose" {path}/
```

**Expected:**
- Body text: 50-75ch (65ch ideal)
- Maximum: 80ch (WCAG)

### Step 3: Color & Contrast Audit

**Background Colors:**
```bash
# Find background colors
grep -rn --include="*.tsx" --include="*.css" \
  "background\|bg-\[#\|bg-white\|bg-black" {path}/

# Flag pure white/black
grep -rn "#FFFFFF\|#000000\|bg-white\|bg-black" {path}/ --include="*.tsx"
```

**Violations:**
- Light mode: #FFFFFF (should be #FAFAFA-#F5F5F5)
- Dark mode: #000000 (should be #121212-#1E1E1E)
- Dark mode: #FFFFFF text (should be #E0E0E0)

**Link Distinguishability:**
```bash
# Check if links have more than just color
grep -rn --include="*.tsx" \
  "text-blue\|text-primary\|text-link" {path}/ \
  | grep -v "underline\|font-medium\|font-semibold"
```

**Expected:**
- Links should have underline OR weight OR icon, not just color

### Step 4: Accessibility Features Check

**Theme Options:**
```bash
# Check for theme toggle/support
grep -rn --include="*.tsx" \
  "dark\|light\|sepia\|theme\|prefers-color-scheme" {path}/
```

**Expected:**
- ≥2 themes available (light/dark minimum)
- Sépia ideal for long reading

**Reduced Motion:**
```bash
# Check for reduced motion support
grep -rn "prefers-reduced-motion" {path}/ --include="*.tsx" --include="*.css"
```

**Expected:**
- Animations respect prefers-reduced-motion

**Skip Links:**
```bash
# Check for skip links
grep -rn "skip\|main-content\|#content" {path}/ --include="*.tsx"
```

### Step 5: Reading UX Features

**Progress Indicator:**
```bash
# Check for progress bar/indicator
grep -rn --include="*.tsx" \
  "progress\|scroll.*depth\|reading.*time\|position.*indicator" {path}/
```

**Expected:**
- Progress bar/indicator for long content
- Impact: +15-25% completion rate

**Reading Time:**
```bash
# Check for reading time display
grep -rn --include="*.tsx" \
  "reading.*time\|min.*read\|time.*read\|word.*count" {path}/
```

**Expected:**
- Reading time for articles >500 words
- Format: "X min de leitura"

**Save Position:**
```bash
# Check for position saving
grep -rn --include="*.tsx" \
  "bookmark\|save.*position\|continue.*reading\|last.*read" {path}/
```

### Step 6: Editorial Structure Check

For content files, analyze:

**Paragraph Length:**
```bash
# Find long text blocks
grep -rn --include="*.tsx" "<p>" {path}/ | head -20
```

**Guidance:**
- Ideal: 3-4 sentences per paragraph
- Maximum: 5 sentences
- Impact: +30% engagement

**Heading Frequency:**
```bash
# Check heading tags
grep -rn --include="*.tsx" "<h[1-6]" {path}/ | wc -l
```

**Guidance:**
- Heading every 3-5 paragraphs
- Impact: +20% navigation

### Step 7: Generate Audit Report

```markdown
# Reading Experience Audit Report
Generated: {timestamp}
Path: {path}

## Summary

| Category | Score | Issues | Status |
|----------|-------|--------|--------|
| Typography | {score}/30 | {count} | {status} |
| Color/Contrast | {score}/25 | {count} | {status} |
| Accessibility | {score}/25 | {count} | {status} |
| Reading UX | {score}/20 | {count} | {status} |
| **Total** | **{total}/100** | **{total_issues}** | **{overall}** |

## Typography ({score}/30)

### Font Sizes
| Location | Current | Expected | Status |
|----------|---------|----------|--------|
| Body text | 14px | ≥16px | ❌ |
| Captions | 11px | ≥11px | ✅ |

### Line Heights
| Location | Current | Expected | Status |
|----------|---------|----------|--------|
| Body text | 1.4 | ≥1.5 | ❌ |
| Headings | 1.25 | 1.25-1.375 | ✅ |

### Line Length
| Container | Current | Expected | Status |
|-----------|---------|----------|--------|
| Article | 100% | 65ch | ❌ |

## Color & Contrast ({score}/25)

### Theme Support
| Theme | Available | Status |
|-------|-----------|--------|
| Light | ✅ | ✅ |
| Dark | ❌ | ❌ Missing |
| Sépia | ❌ | ⚠️ Recommended |

### Contrast Issues
| Element | Foreground | Background | Ratio | Required | Status |
|---------|------------|------------|-------|----------|--------|
| Body text | #757575 | #FFFFFF | 4.6:1 | 4.5:1 | ✅ |
| Muted text | #9E9E9E | #FFFFFF | 2.8:1 | 4.5:1 | ❌ |

### Pure White/Black Usage
| File | Line | Issue | Fix |
|------|------|-------|-----|
| Reader.tsx | 45 | bg-black in dark mode | Use #121212 |
| Article.tsx | 23 | text-white | Use #E0E0E0 |

## Accessibility ({score}/25)

### Features
| Feature | Implemented | Status |
|---------|-------------|--------|
| Reduced motion | ❌ | ❌ Add |
| Skip links | ❌ | ❌ Add |
| Keyboard nav | ✅ | ✅ |
| Focus visible | ✅ | ✅ |
| Zoom 200% | ❌ | ❌ Test |

### Link Distinguishability
| Location | Method | Status |
|----------|--------|--------|
| Article body | Color only | ❌ Add underline |
| Navigation | Color + weight | ✅ |

## Reading UX ({score}/20)

### Features
| Feature | Implemented | Impact |
|---------|-------------|--------|
| Progress bar | ❌ | +15-25% completion |
| Reading time | ❌ | +10% starts |
| Save position | ❌ | +retention |
| Highlights | ❌ | +20% return |

## Recommendations

### Critical (Fix Immediately)
1. Increase body font size from 14px to 18px
2. Add dark mode with #121212 background
3. Limit line length to 65ch

### High Priority
4. Add progress bar indicator
5. Add reading time estimate
6. Replace pure white/black in dark mode

### Medium Priority
7. Add sépia theme option
8. Implement position saving
9. Add reduced motion support

### Nice to Have
10. Add highlight functionality
11. Add annotation support

## Comparison with Publishers

| Metric | Current | Medium | NYT | Target |
|--------|---------|--------|-----|--------|
| Font size | 14px | 21px | 18px | 18px |
| Line height | 1.4 | 1.58 | 1.5 | 1.6 |
| Max width | 100% | 680px | 600px | 65ch |
| Progress bar | ❌ | ✅ | ❌ | ✅ |
| Dark mode | ❌ | ✅ | ✅ | ✅ |

## Estimated Impact

| Change | Expected Impact |
|--------|-----------------|
| Font 14→18px | +5-10% reading speed |
| Line height 1.4→1.6 | +10% completion |
| Progress bar | +15-25% completion |
| Dark mode proper | Avoid -14% comprehension |
| Shorter paragraphs | +30% engagement |
```

## Output Location

```
outputs/design-system/{project}/
├── reading-audit-{date}.md
├── reading-metrics.json
└── reading-recommendations.md
```

## Failure Handling

- **Reading components not identifiable:** Expand search patterns to include generic container names (ContentArea, TextBlock, Article), manually inspect top-level page components, request user to specify reading-focused routes
- **Typography values computed dynamically:** Extract CSS variables and Tailwind config, trace token references, run browser DevTools inspection to capture computed values, document dynamic calculation logic
- **Contrast ratios fail across all themes:** Generate color palette overhaul proposal with WCAG-compliant alternatives maintaining brand proximity, calculate perceptual difference (ΔE), prioritize high-traffic components for immediate fixes
- **Progress/reading-time features missing across entire codebase:** Provide implementation templates (React hooks, vanilla JS), estimate implementation effort per component type, include analytics integration for measuring completion rate impact

## Success Criteria

- [ ] All reading components identified
- [ ] Typography metrics collected
- [ ] Contrast ratios validated
- [ ] Accessibility features checked
- [ ] Reading UX features inventoried
- [ ] Report with prioritized recommendations

## Related Commands

- `*ds-health` - Overall DS health
- `*validate-tokens` - Token usage validation
- `*contrast-check` - Detailed contrast analysis
- `*reading-tokens` - Generate reading-specific tokens


## Related Checklists

- `squads/design/checklists/reading-accessibility-checklist.md`

## Process Guards
- **On Fail:** Stop execution, capture evidence, and return remediation steps before proceeding.
