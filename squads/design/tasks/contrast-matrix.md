# Task: contrast-matrix

> **Command:** `*contrast-matrix {path}`
> **Agent:** Brad Frost (Design System Architect)
> **Purpose:** Generate complete color contrast matrix with WCAG 2.2 + APCA validation
> **Execution Type:** `Worker`
> **Dependencies:** depends_on: `[]` · enables: `[]` · workflow: `accessibility`

---

## Overview

Generates a comprehensive contrast matrix showing all foreground/background color combinations in the codebase with:
- WCAG 2.2 contrast ratios (AA and AAA)
- APCA (Advanced Perceptual Contrast Algorithm) Lc values
- Usage locations
- Pass/fail indicators
- Remediation suggestions

---

## Input

| Parameter | Required | Description |
|-----------|----------|-------------|
| `path` | Yes | Directory to scan (e.g., `./app/components`) |
| `--format` | No | Output: `table`, `html`, `json` (default: `table`) |
| `--include-tokens` | No | Include design token colors |
| `--theme` | No | Filter by theme: `light`, `dark`, `sepia`, `all` (default: `all`) |

---

## Execution Steps

### Phase 1: Color Extraction

Extract all colors from:

```typescript
// Sources to scan
const colorSources = [
  // CSS/SCSS
  'color:', 'background-color:', 'border-color:', 'fill:', 'stroke:',
  // Tailwind classes
  'text-', 'bg-', 'border-', 'fill-', 'stroke-',
  // CSS variables
  'var(--color-', '--color-',
  // Inline styles
  'style={{ color:', 'style={{ backgroundColor:',
  // Hex values
  '#[0-9A-Fa-f]{3,8}',
  // RGB/RGBA
  'rgb(', 'rgba(',
  // HSL/HSLA
  'hsl(', 'hsla(',
  // OKLCH
  'oklch('
];

interface ExtractedColor {
  value: string;           // Normalized hex
  original: string;        // Original format found
  source: 'css' | 'tailwind' | 'token' | 'inline';
  usage: 'foreground' | 'background' | 'border' | 'unknown';
  files: Array<{ path: string; line: number }>;
  theme?: 'light' | 'dark' | 'sepia';
}
```

### Phase 2: Contrast Calculation

For each foreground/background pair:

```typescript
interface ContrastResult {
  foreground: string;
  background: string;

  // WCAG 2.x Contrast Ratio
  wcagRatio: number;        // e.g., 4.52:1

  // WCAG 2.2 Compliance
  wcag: {
    AA_normal: boolean;     // ≥4.5:1 for <18px
    AA_large: boolean;      // ≥3:1 for ≥18px/bold
    AAA_normal: boolean;    // ≥7:1
    AAA_large: boolean;     // ≥4.5:1
    ui_components: boolean; // ≥3:1 (borders, icons)
  };

  // APCA (Lc values)
  apca: {
    Lc: number;             // Lightness contrast (-108 to +106)
    recommended_size: string; // e.g., "14px+" or "18px bold+"
    pass: boolean;
  };

  // Usage context
  usage: Array<{
    file: string;
    line: number;
    element: string;        // e.g., "Button", "p", "span"
    fontSize: string;       // If detectable
    fontWeight: string;     // If detectable
  }>;
}
```

### Phase 3: WCAG 2.2 + APCA Calculations

**WCAG 2.x Contrast Ratio Formula:**
```typescript
function getWCAGContrastRatio(fg: string, bg: string): number {
  const L1 = getRelativeLuminance(fg);
  const L2 = getRelativeLuminance(bg);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

function getRelativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  const [r, g, b] = rgb.map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
```

**APCA Lc Calculation:**
```typescript
// APCA W3 reference algorithm
function getAPCAContrast(textColor: string, bgColor: string): number {
  // Uses SAPC (Spatial Perception of Color) model
  // Returns Lc (Lightness contrast) value
  // Positive = light text on dark bg
  // Negative = dark text on light bg
  // |Lc| ≥ 60 is generally readable
  // |Lc| ≥ 75 is comfortable for body text
  // |Lc| ≥ 90 is excellent
}
```

**APCA Minimum Lc Values by Font Size/Weight:**

| Font Size | Weight | Min |Lc| for Body | Min |Lc| for UI |
|-----------|--------|---------------------|-------------------|
| 12px | 400 | 90 | 75 |
| 14px | 400 | 75 | 60 |
| 16px | 400 | 60 | 50 |
| 18px | 400 | 55 | 45 |
| 24px | 400 | 45 | 40 |
| 14px | 700 | 60 | 50 |
| 18px | 700 | 50 | 40 |

### Phase 4: Matrix Generation

Group by theme and generate matrix:

```typescript
interface ContrastMatrix {
  theme: 'light' | 'dark' | 'sepia';
  colors: {
    foregrounds: ExtractedColor[];
    backgrounds: ExtractedColor[];
  };
  pairs: ContrastResult[];
  summary: {
    total_pairs: number;
    wcag_aa_pass: number;
    wcag_aaa_pass: number;
    apca_pass: number;
    failures: number;
  };
}
```

---

## Output

### 1. Matrix Table (Default)

```markdown
# Color Contrast Matrix

**Theme:** Light
**Scanned:** ./app/components (487 files)
**Date:** 2026-01-05

## Summary

| Metric | Count | Percentage |
|--------|-------|------------|
| Total pairs | 156 | 100% |
| WCAG AA Pass | 142 | 91.0% |
| WCAG AAA Pass | 98 | 62.8% |
| APCA Pass | 138 | 88.5% |
| **Failures** | **14** | **9.0%** |

## Complete Matrix

| Foreground | Background | Ratio | AA | AAA | APCA Lc | Status |
|------------|------------|-------|----|----|---------|--------|
| #212121 | #FAFAFA | 16.1:1 | ✓ | ✓ | -92.4 | ✅ Pass |
| #424242 | #FFFFFF | 10.5:1 | ✓ | ✓ | -85.2 | ✅ Pass |
| #757575 | #FFFFFF | 4.6:1 | ✓ | ✗ | -63.1 | ⚠️ AA only |
| #999999 | #FFFFFF | 2.8:1 | ✗ | ✗ | -48.7 | ❌ Fail |
| #D4AF37 | #1A1A1A | 8.2:1 | ✓ | ✓ | +78.3 | ✅ Pass |

## Failures Detail

### ❌ #999999 on #FFFFFF (2.8:1)

**Problem:** Fails WCAG AA (need 4.5:1)
**APCA Lc:** -48.7 (need ≥60 for body text)
**Used in:**
- `app/components/ui/Input.tsx:45` - placeholder text
- `app/components/ui/Label.tsx:12` - disabled state

**Recommendations:**
1. Darken to #767676 for 4.5:1 (minimum AA)
2. Darken to #595959 for 7:1 (AAA compliant)
3. Or change background to #F0F0F0 with #999999 = 3.3:1 (large text only)

### ⚠️ #757575 on #FFFFFF (4.6:1)

**Problem:** Passes AA but fails AAA
**Used in:**
- `app/components/shared/Caption.tsx:8` - 12px caption text

**Note:** For 12px text, APCA recommends Lc ≥ 75. Current Lc is -63.1.
**Recommendation:** Darken to #616161 for Lc -72 or increase font size to 14px+.
```

### 2. HTML Report (with --format html)

Interactive HTML with:
- Color swatches
- Visual comparison
- Filter by pass/fail
- Sort by ratio
- Export to CSV

### 3. JSON Output (with --format json)

```json
{
  "meta": {
    "path": "./app/components",
    "date": "2026-01-05T14:30:00Z",
    "theme": "all"
  },
  "themes": [
    {
      "name": "light",
      "pairs": [
        {
          "fg": "#212121",
          "bg": "#FAFAFA",
          "wcag_ratio": 16.1,
          "wcag_aa": true,
          "wcag_aaa": true,
          "apca_lc": -92.4,
          "apca_pass": true,
          "usage": [...]
        }
      ],
      "summary": {
        "total": 156,
        "aa_pass": 142,
        "aaa_pass": 98,
        "failures": 14
      }
    }
  ]
}
```

---

## WCAG 2.2 + Reading Guide Alignment

This task validates against the reading guide principles:

| Rule | Contrast Requirement | This Task |
|------|---------------------|-----------|
| Rule 8 | Minimum 4.5:1 (WCAG AA) | ✓ Validates |
| Rule 10 | Dark mode: avoid pure black/white | ✓ Detects 21:1 |
| Rule 13 | Links distinguishable ≥3:1 from text | ✓ Validates link colors |
| Accessibility | APCA for modern accuracy | ✓ Includes APCA Lc |

**Special Checks:**
- Dark mode halation detection (contrast > 18:1 flagged)
- Link vs text color contrast (≥3:1 required)
- Focus indicator contrast (≥3:1 vs background)
- Placeholder text contrast (often fails)

---

## Integration

```bash
# Full matrix
*contrast-matrix ./app/components

# Light theme only, HTML output
*contrast-matrix ./app/components --theme light --format html

# Include design tokens
*contrast-matrix ./app/components --include-tokens

# As part of full audit
*a11y-audit ./app/components --scope color
# → Calls *contrast-matrix internally
```

---

## State Update

```yaml
contrast_matrix:
  last_run: "2026-01-05T14:30:00Z"
  path: "./app/components"
  themes_scanned: ["light", "dark"]
  results:
    total_pairs: 156
    wcag_aa_pass: 142
    wcag_aaa_pass: 98
    apca_pass: 138
    failures: 14
    failure_rate: "9.0%"
  critical_failures:
    - fg: "#999999"
      bg: "#FFFFFF"
      ratio: 2.8
      files: ["Input.tsx:45", "Label.tsx:12"]
  next_action: "Fix 14 contrast failures"
```

---

## Failure Handling

- **Color extraction returns >1000 unique pairs:** Filter to high-frequency combinations (used >=5 times), group similar colors within ΔE <3, generate subset matrix with coverage threshold, provide full matrix as JSON export
- **APCA calculation library unavailable or outdated:** Fallback to WCAG 2.2 ratios only, document APCA as recommended future enhancement, suggest apca-w3 npm package installation for next run
- **Dynamic theme switching prevents color extraction:** Run matrix per theme separately, capture CSS variables per theme context, manually test theme switcher to extract computed values from DevTools, aggregate results by theme
- **Contrast failures exceed remediation capacity (>100 failures):** Triage by component usage frequency and user-facing visibility, auto-generate fix suggestions for top 20 failures, provide batch color adjustment script for systematic fixes, schedule phased remediation

## Success Criteria

- [ ] All foreground/background color combinations extracted from codebase
- [ ] WCAG 2.2 contrast ratios calculated for every combination
- [ ] APCA Lc values calculated for every combination
- [ ] Pass/fail indicators for AA, AAA, and APCA thresholds
- [ ] Matrix output generated in requested format (table/html/json)
- [ ] Failing combinations include remediation suggestions with closest passing color
- [ ] Design token colors included when --include-tokens flag used

---

**Brad says:** "Contrast isn't subjective. Numbers don't lie. 4.5:1 or it fails."


## Related Checklists

- `squads/design/checklists/ds-accessibility-wcag-checklist.md`
- `squads/design/checklists/ds-a11y-release-gate-checklist.md`

## Process Guards
- **On Fail:** Stop execution, capture evidence, and return remediation steps before proceeding.
