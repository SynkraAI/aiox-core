# Design Token Best Practices

**Source:** Brad's consolidation experience
**Purpose:** Token naming and organization standards

---

## Naming Conventions

### Semantic > Descriptive
✅ `color-primary` (semantic - describes purpose)
❌ `color-blue-500` (descriptive - describes appearance)

**Why:** Semantic names survive redesigns. If primary color changes from blue to purple, `color-primary` still works. `color-blue-500` becomes misleading.

### Use Kebab-Case
✅ `color-primary-dark`
❌ `colorPrimaryDark` or `color_primary_dark`

### Variant Suffixes
- `-light`: Lighter variant, backgrounds, disabled states
- `-dark`: Darker variant, hover states, active states
- `-hover`: Explicit hover state
- `-focus`: Explicit focus state

---

## Token Categories

**Required:**
- `color` - All color values
- `spacing` - Padding, margin, gaps
- `typography` - Fonts, sizes, weights, line-heights

**Recommended:**
- `radius` - Border radius values
- `shadow` - Box shadow presets
- `transition` - Animation timings
- `z-index` - Stacking order

---

## Token Organization

```yaml
color:
  # Primary
  primary: "#0066CC"
  primary-dark: "#0052A3"
  primary-light: "#E6F2FF"

  # Semantic
  error: "#DC2626"
  success: "#059669"
  warning: "#F59E0B"

  # Neutrals
  neutral-50: "#F9FAFB"
  neutral-900: "#111827"
```

---

## Token Values

**Colors:** Hex preferred (`#0066CC`), RGB/HSL acceptable
**Spacing:** Px units (`16px`), avoid rem in token definition
**Typography:** Px for sizes, unitless for line-height
**Timing:** Ms units (`200ms`)

---

## Multi-Format Exports

**Single source of truth:** `tokens.yaml`

**Export to:**
- `tokens.json` → JavaScript imports
- `tokens.css` → CSS custom properties
- `tokens.tailwind.js` → Tailwind theme
- `tokens.scss` → SCSS variables

**Keep formats in sync:** Regenerate all from tokens.yaml

---

## Token Usage

**Components:**
```css
.button {
  background: var(--color-primary);  /* Use token */
  padding: var(--space-md);          /* Use token */
  /* NOT: background: #0066CC; */    /* Hardcoded = bad */
}
```

**TypeScript:**
```typescript
import { tokens } from '@/tokens';
const primaryColor = tokens.color.primary;
```

---

## Brad says:
"Zero hardcoded values. Tokens or nothing."
