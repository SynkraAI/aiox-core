# Configure Multi-Brand Token Layers

> Task ID: brad-theme-multi-brand
> Agent: Brad (Design System Architect)
> Version: 1.0.0
> **Execution Type:** `Agent`
> **Dependencies:** depends_on: `[]` · enables: `[]` · workflow: `theming`

## Description

Configure multi-brand token architecture enabling multiple brands to share the same component library with different visual identities. Implements token layering (base → semantic → brand overrides) and brand switching mechanism.

## Prerequisites

- Existing design tokens (preferably W3C DTCG format)
- At least 2 brand identities to support
- Read data/ds-reference-architectures.md for theming patterns

## Workflow

### Interactive Elicitation

1. **Gather Parameters**
   - Number of brands to support
   - Brand identity assets (colors, typography, logos per brand)
   - Token file location
   - Shared vs. brand-specific components (if any)

### Steps

1. **Define Token Layer Architecture**
   - Base layer: shared values (spacing, sizing, border-radius, motion)
   - Semantic layer: purpose-based aliases (surface, primary, on-primary)
   - Brand layer: brand-specific overrides (brand-a.primary = #0066CC, brand-b.primary = #CC0066)
   - Check: base, semantic, and brand layers defined as separate token groups with no cross-contamination — log "3 layers defined: base ({N1} tokens), semantic ({N2}), brand ({N3})"

2. **Create Brand Token Sets**
   - For each brand: define color palette, typography, and any unique values
   - Ensure all brands cover the same semantic token surface
   - Validate no brand has missing tokens (gaps cause runtime errors)
   - Check: for each brand, missing semantic token count == 0 — abort with "Brand '{name}' missing {N} semantic tokens: {list}"

3. **Implement Brand Switching**
   - CSS approach: CSS custom properties + [data-brand] attribute
   - JS approach: theme context provider with brand parameter
   - Generate brand-specific CSS files or dynamic switching utility
   - Check: toggling [data-brand] attribute applies all brand tokens without page reload — abort with "Brand switching failed: {error}"

4. **Validate Per-Brand Accessibility**
   - Run contrast validation for each brand's color palette
   - Ensure all brands pass WCAG AA minimum
   - Flag brands with contrast issues
   - Check: every brand's foreground/background pairs meet WCAG AA (4.5:1 normal, 3:1 large) — abort with "Brand '{name}' fails contrast: {N} pairs below AA"

5. **Generate Brand Preview**
   - Create side-by-side comparison of key components per brand
   - Show token differences between brands
   - Highlight shared vs. divergent values
   - Update .state.yaml

## Output

- `tokens/base.json` — Shared base tokens
- `tokens/brand-{name}.json` — Per-brand override tokens
- `brand-switching.css` or `BrandProvider.tsx` — Switching mechanism
- `brand-comparison.md` — Side-by-side brand preview
- `.state.yaml` updated

## Failure Handling

- **Token coverage gap detected:** Halt processing, generate gap report listing missing semantic tokens per brand, require user to provide missing values before continuing
- **Brand switching causes layout shift:** Rollback to single-brand mode, analyze token value deltas causing reflow (spacing/sizing changes >2px), propose normalized base values
- **Contrast validation fails for multiple brands:** Generate per-brand remediation plan with specific color adjustments needed to meet WCAG AA, prioritize brands by user impact/traffic
- **CSS custom property cascade conflicts:** Inspect computed styles, identify specificity issues or duplicate token declarations, recommend layer restructuring or scoped brand containers

## Success Criteria

- All brands share same component library with different visual identity
- Brand switching is seamless (no page reload, no layout shift)
- Every brand passes WCAG AA contrast validation
- Token coverage is 100% for all brands


## Related Checklists

- `squads/design/checklists/ds-component-quality-checklist.md`
- `squads/design/checklists/ds-pattern-audit-checklist.md`

## Process Guards
- **On Fail:** Stop execution, capture evidence, and return remediation steps before proceeding.
