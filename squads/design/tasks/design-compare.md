# Design Compare Task

> Task ID: design-compare
> Agent: design-system
> Version: 1.1.0
> v4.0-compatible: true
> Command: `*design-compare {reference} {implementation}`
> **Execution Type:** `Agent`
> **Dependencies:** depends_on: `[]` · enables: `[]` · workflow: `standalone`

## Description

Compares a design reference (screenshot, Figma export, or image) against implemented code to measure design fidelity. Extracts design tokens from both sources and generates a detailed comparison report with actionable fixes.

**Use case:** When user sends a design mockup/screenshot and wants to validate if the implemented component matches.

## Why Not Pixel-Perfect Comparison?

| Challenge | Reality |
|-----------|---------|
| Size differences | Figma 1440px vs browser 1512px |
| Font rendering | Browser anti-aliasing differs from design tools |
| Dynamic content | Real text vs placeholder |
| Responsive behavior | Design is static, code adapts |

**Solution:** Semantic token extraction + comparison with tolerance thresholds.

---

## Input Parameters

### Reference (required)
Design source - one of:
- Image path: `./designs/dashboard.png`
- Pasted image: User pastes screenshot
- URL: `https://figma.com/file/xxx` (if accessible)

### Implementation (required)
Code source - one of:
- Component path: `./app/components/Dashboard.tsx`
- Folder path: `./app/components/dashboard/`
- URL: `http://localhost:3000/dashboard` (takes screenshot)

---

## Workflow

### Phase 1: Extract from Design Reference

When user provides an image, analyze visually to extract:

```yaml
design_tokens:
  colors:
    background:
      - value: "#1a1a2e"
        location: "main background"
      - value: "#252540"
        location: "card background"
    accent:
      - value: "#D4AF37"
        location: "buttons, highlights"
    text:
      - value: "#FFFFFF"
        location: "headings"
      - value: "#A0A0A0"
        location: "secondary text"

  spacing:
    padding:
      - value: "24px"
        location: "card internal padding"
      - value: "16px"
        location: "section gaps"
    margin:
      - value: "32px"
        location: "between major sections"
    gap:
      - value: "12px"
        location: "between list items"

  typography:
    headings:
      - size: "24px"
        weight: "bold"
        location: "main title"
    body:
      - size: "16px"
        weight: "normal"
        line_height: "1.5"
        location: "paragraph text"
    small:
      - size: "14px"
        weight: "normal"
        location: "captions, labels"

  layout:
    structure: "grid" | "flex" | "stack"
    columns: 3
    pattern: "card-based with sidebar"

  effects:
    shadows:
      - value: "0 4px 12px rgba(0,0,0,0.3)"
        location: "cards"
    borders:
      - value: "1px solid #333"
        location: "dividers"
    radius:
      - value: "12px"
        location: "cards"
      - value: "8px"
        location: "buttons"
```

### Phase 2: Extract from Code

Parse the component(s) to extract actual values:

#### 2.1 Tailwind Classes
```typescript
// Input
<div className="bg-[#1a1a2e] p-6 rounded-xl shadow-lg">

// Extracted
{
  background: "#1a1a2e",
  padding: "24px",      // p-6
  borderRadius: "12px", // rounded-xl
  shadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" // shadow-lg
}
```

#### 2.2 CSS Custom Properties
```css
/* Input */
--color-bg-primary: #1a1a2e;
--spacing-card: 24px;

/* Extracted */
{
  "color-bg-primary": "#1a1a2e",
  "spacing-card": "24px"
}
```

#### 2.3 Inline Styles
```typescript
// Input
<div style={{ backgroundColor: '#252540', padding: '20px' }}>

// Extracted
{
  backgroundColor: "#252540",
  padding: "20px"
}
```

#### 2.4 Design Token Usage
```typescript
// Input
<div className="bg-primary p-card rounded-card">

// Resolve from tokens.yaml
{
  background: "var(--color-bg-primary)" → "#1a1a2e",
  padding: "var(--spacing-card)" → "24px",
  borderRadius: "var(--radius-card)" → "12px"
}
```

### Phase 3: Compare with Tolerances

```yaml
comparison_thresholds:
  colors:
    method: "HSL distance"
    tolerance: 5%  # 5% HSL difference = match

  spacing:
    method: "absolute"
    tolerance: 4px  # ±4px = match

  typography:
    size_tolerance: 2px
    weight_exact: true  # must match exactly

  radius:
    tolerance: 2px
```

#### Comparison Logic

```typescript
function compareColor(design: string, code: string): ComparisonResult {
  const designHSL = hexToHSL(design);
  const codeHSL = hexToHSL(code);

  const distance = calculateHSLDistance(designHSL, codeHSL);

  return {
    match: distance <= 0.05, // 5% threshold
    distance,
    design,
    code,
    fix: distance > 0.05 ? `Change to ${design}` : null
  };
}

function compareSpacing(design: number, code: number): ComparisonResult {
  const diff = Math.abs(design - code);

  return {
    match: diff <= 4, // 4px threshold
    diff,
    design: `${design}px`,
    code: `${code}px`,
    fix: diff > 4 ? `Use ${getTailwindClass(design)} instead of ${getTailwindClass(code)}` : null
  };
}
```

### Phase 4: Generate Fidelity Report

Output template:

```markdown
# Design Fidelity Report

**Reference:** dashboard-mockup.png
**Implementation:** app/components/Dashboard.tsx
**Generated:** 2026-01-05 14:30:00
**Fidelity Score:** 82%

---

## Summary

| Category | Matches | Total | Score |
|----------|---------|-------|-------|
| Colors | 8 | 10 | 80% |
| Spacing | 5 | 6 | 83% |
| Typography | 3 | 4 | 75% |
| Effects | 4 | 4 | 100% |
| **Overall** | **20** | **24** | **82%** |

---

## Color Comparison

| Token | Design | Code | Match | Fix |
|-------|--------|------|-------|-----|
| bg-main | #1a1a2e | #1a1a2e | PASS | - |
| bg-card | #252540 | #252540 | PASS | - |
| accent | #D4AF37 | #d4af37 | PASS | - |
| text-primary | #FFFFFF | #F5F5F5 | FAIL | Use text-white |
| text-secondary | #A0A0A0 | #888888 | FAIL | Use #A0A0A0 or text-muted |

---

## Spacing Comparison

| Location | Design | Code | Match | Fix |
|----------|--------|------|-------|-----|
| Card padding | 24px | 20px | FAIL | Use p-6 instead of p-5 |
| Section gap | 16px | 16px | PASS | - |
| Item gap | 12px | 12px | PASS | - |
| Page margin | 32px | 24px | FAIL | Use m-8 instead of m-6 |

---

## Typography Comparison

| Element | Design | Code | Match | Fix |
|---------|--------|------|-------|-----|
| Heading size | 24px | 24px | PASS | - |
| Heading weight | bold | semibold | FAIL | Use font-bold |
| Body size | 16px | 14px | FAIL | Use text-base instead of text-sm |
| Body line-height | 1.5 | 1.5 | PASS | - |

---

## Effects Comparison

| Effect | Design | Code | Match |
|--------|--------|------|-------|
| Card shadow | 0 4px 12px | shadow-lg | PASS |
| Card radius | 12px | rounded-xl | PASS |
| Border | 1px #333 | border-zinc-700 | PASS |

---

## Actionable Fixes

### Priority 1: High Impact (affects multiple elements)

1. **Card padding:** `p-5` → `p-6`
   - Files: Dashboard.tsx:24, Card.tsx:12
   - Impact: 8 instances

2. **Body text size:** `text-sm` → `text-base`
   - Files: Dashboard.tsx:45, 67, 89
   - Impact: 12 instances

### Priority 2: Medium Impact

3. **Heading weight:** `font-semibold` → `font-bold`
   - Files: Dashboard.tsx:18
   - Impact: 3 instances

### Priority 3: Low Impact (single instance)

4. **Text color:** `#888` → `#A0A0A0`
   - Files: Dashboard.tsx:78
   - Impact: 1 instance

---

## Token Recommendations

Based on this analysis, consider adding these tokens:

```yaml
# Add to tokens.yaml
colors:
  text:
    secondary: "#A0A0A0"  # Currently hardcoded as #888

spacing:
  page:
    margin: "32px"  # Currently using 24px
```

---

## Next Steps

1. [ ] Apply Priority 1 fixes (2 changes, 20 instances)
2. [ ] Apply Priority 2 fixes (1 change, 3 instances)
3. [ ] Apply Priority 3 fixes (1 change, 1 instance)
4. [ ] Re-run `*design-compare` to validate
5. [ ] Update tokens.yaml with recommendations
```

---

## Failure Handling

- **Design reference unreadable:** If image analysis fails to extract tokens (corrupted file, unsupported format), abort with "Cannot analyze design reference: {error}. Ensure file is PNG/JPG/SVG and visually clear."
- **Code extraction yields zero tokens:** If parsing implementation returns no design values (empty component, commented code), abort with "No design tokens found in implementation at {path}. Verify component exists and has styling."
- **Token mismatch rate >70%:** If fidelity score <30%, warn user "Design and code are significantly different ({score}%). Consider re-implementing from design reference rather than incremental fixes."
- **No actionable fixes generated:** If comparison completes but produces no fix recommendations despite low fidelity, abort with "Comparison inconclusive: design and code use incompatible styling approaches (e.g., inline styles vs tokens)."

---

## Success Criteria

- [ ] Design reference analyzed (colors, spacing, typography, effects)
- [ ] Code implementation parsed (Tailwind, CSS, inline styles)
- [ ] Comparison performed with tolerance thresholds
- [ ] Fidelity score calculated (weighted average)
- [ ] Actionable fixes generated with file:line references
- [ ] Token recommendations provided
- [ ] Report saved to `outputs/design-system/{project}/fidelity/`

---

## Example Usage

```bash
# Compare PNG reference with component
*design-compare ./designs/dashboard.png ./app/components/Dashboard.tsx

# Compare with folder (multiple components)
*design-compare ./designs/card.png ./app/components/ui/card/

# Compare with live URL (takes screenshot first)
*design-compare ./designs/home.png http://localhost:3000/

# User pastes image directly
*design-compare
# [Brad prompts for reference image]
# [Brad prompts for implementation path]
```

---

## Integration with Other Commands

| After `*design-compare` | Use Case |
|-------------------------|----------|
| `*validate-tokens` | Ensure fixes use design tokens |
| `*contrast-check` | Validate accessibility of color changes |
| `*scan` | Deep analysis of the design reference |

---

## Output Locations

```
outputs/design-system/{project}/fidelity/
├── {timestamp}-{name}-report.md     # Full report
├── {timestamp}-{name}-design.yaml   # Extracted design tokens
├── {timestamp}-{name}-code.yaml     # Extracted code tokens
└── {timestamp}-{name}-diff.yaml     # Comparison data
```


## Related Checklists

- `squads/design/checklists/ds-component-quality-checklist.md`

## Process Guards
- **On Fail:** Stop execution, capture evidence, and return remediation steps before proceeding.
