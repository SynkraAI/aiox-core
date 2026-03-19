# Extract Design Tokens from Consolidated Patterns

> Task ID: brad-extract-tokens
> Agent: Brad (Design System Architect)
> Version: 1.1.0
> v4.0-compatible: true
> **Execution Type:** `Worker`
> **Dependencies:** depends_on: `[ds-consolidate-patterns]` · enables: `[ds-generate-migration-strategy, export-design-tokens-dtcg]` · workflow: `brownfield-audit`
> **On Fail:** If token schema validation fails → check YAML syntax and W3C DTCG format compliance. If consolidation files missing → re-run `*consolidate`. If token coverage <80% → review consolidation output for missed patterns, add manual overrides. Do NOT proceed to migration with invalid tokens.

## Description

Generate design token system from consolidated patterns. Exports to multiple formats (YAML, JSON, CSS custom properties, Tailwind config, SCSS variables) with semantic naming conventions. **v4.0: Outputs W3C DTCG v1.0 format by default ($value, $type, $description).**

## Input Schema
- **requires:** Output from `ds-consolidate-patterns`
- **format:** Text data (color-clusters.txt, spacing-consolidation.txt, button-consolidation.txt)
- **location:** `outputs/design-system/{project}/consolidation/`

## Output Schema
- **produces:** `outputs/design-system/{project}/tokens/tokens.yaml`
- **format:** YAML data (with JSON, CSS, Tailwind, SCSS exports)
- **consumed_by:** ds-generate-migration-strategy, export-design-tokens-dtcg

## Prerequisites

- Consolidation completed (*consolidate command run successfully)
- .state.yaml contains consolidation data
- Consolidated pattern files exist (color-clusters.txt, spacing-consolidation.txt, etc)
- Reference: Read data/w3c-dtcg-spec-reference.md for DTCG v1.0 token format
- Reference: Read data/motion-tokens-guide.md for motion token extraction (duration, easing)

## Workflow

### Interactive Elicitation

This task uses interactive elicitation to configure token generation.

1. **Review Consolidation Results**
   - Display consolidation summary (colors, buttons, spacing, typography)
   - Confirm token generation from these patterns
   - Ask for naming preferences (kebab-case default)

2. **Select Export Formats**
   - Ask which formats to export (DTCG JSON, CSS, Tailwind, SCSS, all)
   - **Default: W3C DTCG v1.0 JSON** ($value, $type, $description)
   - Confirm output directory
   - Check for existing token files (overwrite warning)
   - Ask about motion tokens (duration, easing) — extract from animations if present

3. **Validate Token Coverage**
   - Show coverage percentage (tokens cover X% of original usage)
   - Target: >95% coverage
   - Ask for approval before generating

### Steps

1. **Load Consolidation Data**
   - Read .state.yaml consolidation section
   - Load consolidated pattern files
   - Confirm .state.yaml contains `phase: "consolidation_complete"` string; abort if missing
   - Check: .state.yaml contains `phase: "consolidation_complete"` AND consolidated pattern files exist — abort with "Consolidation not completed: run *consolidate first"

2. **Extract Color Tokens**
   - Read color-clusters.txt
   - Generate semantic names (primary, primary-dark, error, success, etc)
   - Detect relationships (hover states, light/dark variants)
   - Create color token structure
   - Check: unnamed color count == 0 AND each token has semantic name — log "{N} color tokens created from {clusters} clusters"

3. **Extract Spacing Tokens**
   - Read spacing-consolidation.txt
   - Map spacing values to semantic scale (xs, sm, md, lg, xl, 2xl, 3xl)
   - Generate both padding and margin tokens
   - Check: spacing scale has xs through xl values AND uses consistent base unit — log "Spacing scale: {N} tokens, base unit: {unit}"

4. **Extract Typography Tokens**
   - Read typography-consolidation.txt
   - Create font-family tokens
   - Create font-size tokens with semantic names
   - Create font-weight tokens
   - Create line-height tokens (calculated from sizes)
   - Check: typography tokens include families + sizes + weights + line-heights — abort with "Typography incomplete: missing {category}"

5. **Extract Button Tokens**
   - Read button-consolidation.txt
   - Generate button variant tokens (primary, secondary, destructive)
   - Generate button size tokens (sm, md, lg)
   - Map colors and spacing to button tokens
   - Check: button tokens use color + spacing token references (not hardcoded values) — abort with "Button tokens contain {N} hardcoded values"

6. **Generate tokens.yaml (Source of Truth)**
   - Create structured YAML with all token categories
   - Include metadata (version, generated timestamp, Brad signature)
   - Add comments explaining token usage
   - Check: `test -f tokens.yaml` AND YAML parses without errors — abort with "tokens.yaml generation failed: {parse error}"

7. **Export to JSON**
   - Convert tokens.yaml to tokens.json
   - Flat structure for JavaScript imports
   - Check: `test -f tokens.json` AND JSON parses without errors — abort with "tokens.json generation failed: {parse error}"

8. **Export to CSS Custom Properties**
   - Generate tokens.css with :root {} block
   - Convert token names to --token-name format
   - Add CSS comments for organization
   - Check: `test -f tokens.css` AND contains :root block with var declarations — abort with "tokens.css generation failed"

9. **Export to Tailwind Config**
   - Generate tokens.tailwind.js
   - Map tokens to Tailwind theme.extend structure
   - Preserve Tailwind conventions
   - Check: `test -f tokens.tailwind.js` AND file exports theme.extend object — abort with "Tailwind config generation failed"

10. **Export to SCSS Variables**
    - Generate tokens.scss
    - Convert to $token-name format
    - Add SCSS comments
    - Check: `test -f tokens.scss` AND file contains $variable declarations — abort with "SCSS generation failed"

11. **Validate Token Coverage**
    - Count original patterns from consolidation output and count tokens that map to them; compute coverage = mapped/total * 100
    - Target: >95% coverage
    - List each uncovered pattern by name with its source file
    - Check: token coverage >= 95% of original patterns — if below, list uncovered patterns and log "Coverage: {pct}% ({covered}/{total})"

12. **Update State File**
    - Add tokens section to .state.yaml
    - Record token counts, locations, exports
    - Update phase to "tokenize_complete"
    - Check: .state.yaml contains `phase: "tokenize_complete"` AND token counts + file locations recorded — abort with "State update failed: {missing field}"

## Output

- **tokens.yaml**: Source of truth with all design tokens
- **tokens.json**: JavaScript/TypeScript import format
- **tokens.css**: CSS custom properties (:root)
- **tokens.tailwind.js**: Tailwind config format
- **tokens.scss**: SCSS variables format
- **token-coverage-report.txt**: Coverage analysis
- **.state.yaml**: Updated with token metadata

### Output Format

```yaml
# tokens.yaml
version: "1.0.0"
generated_by: "Brad (Design System Architect)"
generated_at: "2025-10-27T13:00:00Z"

color:
  primary: "#0066CC"
  primary-dark: "#0052A3"
  secondary: "#6B7280"
  error: "#DC2626"
  error-light: "#FEE2E2"
  success: "#059669"
  success-light: "#D1FAE5"
  warning: "#F59E0B"
  neutral-50: "#F9FAFB"
  neutral-100: "#F3F4F6"
  neutral-900: "#111827"

spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
  3xl: "64px"

typography:
  font-base: "Inter, system-ui, sans-serif"
  font-mono: "JetBrains Mono, monospace"
  size-xs: "12px"
  size-sm: "14px"
  size-base: "16px"
  size-lg: "20px"
  size-xl: "24px"
  size-2xl: "32px"
  weight-light: 300
  weight-normal: 400
  weight-semibold: 600
  weight-bold: 700
  line-tight: 1.25
  line-normal: 1.5
  line-relaxed: 1.75

radius:
  sm: "4px"
  base: "8px"
  lg: "12px"
  full: "9999px"

shadow:
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)"
  base: "0 1px 3px 0 rgb(0 0 0 / 0.1)"
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1)"
```

## Failure Handling

- **Token coverage <95%:** Identify uncovered patterns. Add manual token definitions for edge cases. Re-calculate coverage
- **Naming conflicts:** Use prefix strategy (e.g., `--color-primary-legacy` vs `--color-primary`). Document conflicts in migration notes
- **Invalid token values:** Validate against CSS spec. Convert non-standard values (e.g., named colors → hex → OKLCH)
- **Consolidation data missing:** Re-run *consolidate before proceeding. Do not generate partial token sets

## Success Criteria

- [ ] All consolidated patterns converted to tokens
- [ ] Semantic naming follows conventions (kebab-case)
- [ ] Hover states and variants detected automatically
- [ ] All 5 export formats generated successfully
- [ ] Token coverage >95% of original patterns
- [ ] Valid syntax in all export formats
- [ ] State file updated with token locations

## Quality Gate

> **GATE: Token Completeness Review** — Verify token coverage before migration planning

| Metric | Threshold | Action if FAIL |
|--------|-----------|----------------|
| Token coverage | >= 95% of consolidated patterns | Add manual token definitions for uncovered patterns, re-calculate |
| Naming conflicts | 0 | Resolve with prefix strategy (`--legacy-` prefix), re-validate |
| W3C DTCG compliance | 100% of generated tokens | Fix non-compliant token structures, re-export |
| Token file valid | Parseable JSON/YAML | Fix syntax errors, validate with JSON Schema |

**Rework rule:** If coverage stuck below 90% after adding manual tokens, review consolidation output — some patterns may have been incorrectly merged.

## Error Handling

- **No consolidation data**: Exit with message to run *consolidate first
- **Invalid consolidated patterns**: Log which patterns failed, continue with valid ones
- **Export format error**: Validate syntax, report errors, fix or skip format
- **Low coverage (<95%)**: Warn user, suggest additional consolidation

## Security Considerations

- Validate color values (hex, rgb, hsl formats only)
- Sanitize token names (alphanumeric, hyphens, underscores only)
- Prevent code injection in exported files
- Validate YAML/JSON syntax before writing

## Examples

### Example 1: Full Token Generation

```bash
*tokenize
```

Output:
```
🔍 Brad: Extracting tokens from consolidated patterns...

🎨 Color tokens: 12 created
📏 Spacing tokens: 7 created
📝 Typography tokens: 10 created
🔘 Button variant tokens: 3 created

📊 Token Coverage: 96.3% of original patterns

✅ Exported to 5 formats:
  - tokens.yaml (source of truth)
  - tokens.json (JavaScript)
  - tokens.css (CSS custom properties)
  - tokens.tailwind.js (Tailwind config)
  - tokens.scss (SCSS variables)

✅ State updated: outputs/design-system/my-app/.state.yaml

Ready for Merovingian to build components or generate migration strategy.
```

### Example 2: CSS Output Preview

```css
/* tokens.css */
:root {
  /* Colors */
  --color-primary: #0066CC;
  --color-primary-dark: #0052A3;
  --color-error: #DC2626;

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;

  /* Typography */
  --font-base: Inter, system-ui, sans-serif;
  --font-size-base: 16px;
  --font-weight-normal: 400;
}
```

## Notes

- tokens.yaml is the single source of truth - all exports generated from it
- Semantic naming > descriptive naming (use "primary" not "blue-500")
- Hover states auto-detected by "-dark" suffix
- Coverage <95% means some patterns weren't consolidated
- Export formats stay in sync - update tokens.yaml and regenerate all
- Brad recommends: Run *migrate next to create migration strategy
- For component generation, hand off to Merovingian: *agent atlas
## Related Checklists

- `squads/design/checklists/ds-component-quality-checklist.md`
- `squads/design/checklists/ds-pattern-audit-checklist.md`

