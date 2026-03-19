# Extract Tokens in W3C DTCG v1.0 Format

> Task ID: brad-token-w3c-extract
> Agent: Brad (Design System Architect)
> Version: 1.0.0
> **Execution Type:** `Worker`
> **Dependencies:** depends_on: `[]` · enables: `[ds-token-modes]` · workflow: `tokens`

## Description

Scan codebase for design values (colors, spacing, typography, shadows, etc.), normalize them to W3C DTCG v1.0 stable format, organize in semantic groups, validate against spec, and export as tokens.json.

## Output Schema
- **produces:** `outputs/design-system/{project}/tokens/tokens-w3c-dtcg.json`
- **format:** JSON data (W3C DTCG v1.0)
- **consumed_by:** ds-token-modes

## Prerequisites

- Codebase with UI styles (CSS, Tailwind, styled-components, CSS-in-JS)
- Read data/w3c-dtcg-spec-reference.md for format reference

## Workflow

### Interactive Elicitation

1. **Gather Parameters**
   - Scan path for styles
   - Existing token files (if any) to migrate
   - Color format preference (hex, OKLCH, both)
   - Output directory

### Steps

1. **Scan Design Values**
   - Extract colors from CSS/JS (hex, rgb, hsl, oklch, named colors)
   - Extract spacing values (px, rem, em)
   - Extract typography (font families, sizes, weights, line heights)
   - Extract shadows (box-shadow, drop-shadow)
   - Extract border radii
   - Extract transitions/durations
   - Check: extracted value count > 0 AND each has file:line source reference — log "Extracted {N} design values from {F} files"

2. **Normalize to DTCG Types**
   - Map colors → $type: "color"
   - Map spacing/sizing → $type: "dimension"
   - Map font families → $type: "fontFamily"
   - Map font weights → $type: "fontWeight"
   - Map durations → $type: "duration"
   - Map easing curves → $type: "cubicBezier"
   - Map shadows → $type: "shadow" (composite)
   - Map typography sets → $type: "typography" (composite)
   - Check: untyped value count == 0 AND all $type values are among the 13 DTCG types — abort with "{N} values missing or have invalid $type"

3. **Organize in Semantic Groups**
   - Group by category (color, spacing, typography, etc.)
   - Create semantic aliases (color.primary, color.surface, etc.)
   - Add $description to every token explaining purpose
   - Apply group-level $type where applicable
   - Check: all tokens belong to a named group AND orphan token count == 0 — abort with "{N} orphan tokens found outside groups"

4. **Validate Against Spec**
   - Check all $value formats match their $type requirements
   - Verify alias references resolve correctly ({group.token})
   - Ensure no circular references
   - Check $type is one of the 13 supported types
   - Check: DTCG spec violation count == 0 (valid $value formats, resolved aliases, no circular refs) — abort with "{N} spec violations: {list}"

5. **Export tokens.json**
   - Write W3C DTCG compliant tokens.json
   - Generate multi-format exports (CSS custom properties, Tailwind config, SCSS variables)
   - Create migration mapping (old values → new token references)
   - Update .state.yaml
   - Check: `test -f tokens.json` AND JSON parses without errors AND file size > 0 — abort with "tokens.json generation failed: {error}"

## Output

- `tokens.json` — W3C DTCG v1.0 compliant token file
- `tokens.css` — CSS custom properties export
- `tokens-tailwind.js` — Tailwind config export
- `migration-map.md` — Old values → token references
- `.state.yaml` updated with token extraction results

## Failure Handling

- **No styles found in scan path:** If extraction finds zero CSS files or style declarations, exit with error "No styles detected in {path}. Verify scan path includes UI source files (CSS/JS/styled-components)."
- **Conflicting color formats:** If same semantic color exists in multiple formats (hex, OKLCH, rgb) with different values, prompt user to choose canonical format or average values, then log conflict resolution in migration-map.md
- **Unresolvable alias reference:** If token alias points to non-existent token (e.g., {color.primary} but color.primary undefined), exit with error "Broken alias: '{alias}' references undefined token. Fix source tokens before export."
- **DTCG validation failure:** If tokens.json fails schema validation (invalid $type, malformed $value, or unsupported property), list all violations with line numbers and exit with "DTCG spec violations detected: {count} errors. Review data/w3c-dtcg-spec-reference.md for format requirements."

## Success Criteria

- All design values captured (95%+ coverage)
- Every token has $value, $type, $description
- tokens.json passes DTCG schema validation
- Multi-format exports generated and valid


## Related Checklists

- `squads/design/checklists/ds-component-quality-checklist.md`
- `squads/design/checklists/ds-pattern-audit-checklist.md`

## Process Guards
- **On Fail:** Stop execution, capture evidence, and return remediation steps before proceeding.
