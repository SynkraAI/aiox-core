# Configure Mode Architecture (Light/Dark/High-Contrast)

> Task ID: brad-token-modes
> Agent: Brad (Design System Architect)
> Version: 1.0.0
> **Execution Type:** `Worker`
> **Dependencies:** depends_on: `[ds-token-w3c-extract]` · enables: `[]` · workflow: `tokens`

## Description

Configure mode architecture for your design token system. Defines mode structure (light/dark/high-contrast/brand), creates semantic token aliases per mode, validates contrast ratios per mode, and generates mode switching mechanism.

## Input Schema
- **requires:** Output from `ds-token-w3c-extract`
- **format:** JSON data (W3C DTCG v1.0)
- **location:** `outputs/design-system/{project}/tokens/tokens-w3c-dtcg.json`

## Prerequisites

- Existing tokens (preferably in W3C DTCG format from *token-w3c)
- Color palette defined
- Read data/w3c-dtcg-spec-reference.md for mode format

## Workflow

### Interactive Elicitation

1. **Gather Parameters**
   - Token file location
   - Required modes (light, dark, high-contrast, brand variants)
   - Current theme switching mechanism (if any)

### Steps

1. **Identify Mode-Sensitive Tokens**
   - Find tokens that change between modes (colors, shadows, borders)
   - Separate mode-independent tokens (spacing, typography, sizing)
   - Check: uncategorized color token count == 0 — log "{N} mode-sensitive tokens, {M} invariant tokens identified"

2. **Define Mode Structure**
   - Create base mode (typically light)
   - Define override values for each additional mode
   - Use DTCG $extensions.mode format:
     ```json
     {
       "color.surface": {
         "$value": "#FFFFFF",
         "$type": "color",
         "$extensions": {
           "mode": {
             "dark": "#1A1A1A",
             "high-contrast": "#000000"
           }
         }
       }
     }
     ```
   - Check: for each mode-sensitive token, value count == mode count — abort with "{N} tokens missing values for modes: {list}"

3. **Create Semantic Token Aliases**
   - Define semantic layer (surface, on-surface, primary, secondary, etc.)
   - Map primitives to semantic tokens per mode
   - Ensure consistent naming across modes
   - Check: semantic tokens include surface, on-surface, primary, secondary at minimum — abort with "Semantic layer gaps: missing {list}"

4. **Validate Contrast Ratios Per Mode**
   - Check foreground/background pairs in each mode
   - WCAG AA: 4.5:1 (normal text), 3:1 (large text)
   - WCAG AAA: 7:1 (normal text), 4.5:1 (large text)
   - High-contrast mode: verify enhanced ratios
   - Check: every mode's foreground/background pairs meet WCAG AA (4.5:1 normal, 3:1 large) — abort with "Mode '{mode}' fails contrast: {N} pairs below AA"

5. **Generate Mode Switching Mechanism**
   - CSS: Generate @media (prefers-color-scheme) + [data-theme] classes
   - JS: Generate theme provider/context if React
   - Provide manual toggle implementation
   - Test all modes render correctly
   - Check: CSS contains @media (prefers-color-scheme) rules AND [data-theme] selectors exist AND manual toggle changes applied tokens — abort with "Mode switching incomplete: {missing mechanism}"

## Output

- `tokens-with-modes.json` — DTCG tokens with $extensions.mode
- `mode-switching.css` — CSS for mode switching
- `contrast-validation.md` — Per-mode contrast ratio report
- `.state.yaml` updated

## Failure Handling

- **Contrast ratio failure in critical mode:** If dark mode or high-contrast mode has 5+ AA contrast failures on primary UI pairs (surface/on-surface, primary/on-primary), halt and suggest color adjustments with specific failing pairs listed
- **Incomplete mode coverage:** If a mode-sensitive token is missing values for one or more declared modes (e.g., light and dark defined but high-contrast missing), fill gaps by cloning nearest mode's value and log "Mode gap filled: {token} in {mode} copied from {source_mode}"
- **System preference detection fails:** If @media (prefers-color-scheme) does not apply correctly in test environment, fall back to [data-theme] attribute-only switching and note "System preference detection unavailable — using manual toggle only"
- **Circular semantic alias chain:** If semantic token aliases create infinite loop (surface → primary → secondary → surface), detect cycle, break at weakest link by inlining a primitive value, and document as tech debt

## Success Criteria

- All modes defined with complete token coverage
- Every mode passes WCAG AA contrast validation
- Mode switching works via system preference and manual toggle
- High-contrast mode provides enhanced readability


## Related Checklists

- `squads/design/checklists/ds-component-quality-checklist.md`
- `squads/design/checklists/ds-pattern-audit-checklist.md`

## Process Guards
- **On Fail:** Stop execution, capture evidence, and return remediation steps before proceeding.
