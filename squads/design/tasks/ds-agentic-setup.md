# Configure DS for Agentic AI Workflows

> Task ID: brad-agentic-setup
> Agent: Brad (Design System Architect)
> Version: 1.0.0
> **Execution Type:** `Agent`
> **Dependencies:** depends_on: `[ds-agentic-audit]` · enables: `[]` · workflow: `agentic`

## Description

Configure your design system infrastructure for AI agent consumption. Ensures tokens are in W3C DTCG format, components have structured metadata, Storybook MCP addon is configured, and AI constraint rules are defined.

## Input Schema
- **requires:** Output from `ds-agentic-audit`
- **format:** JSON data
- **location:** `outputs/design-system/{project}/agentic/agentic-readiness-report.json`

## Prerequisites

- Design system with existing components
- Node.js environment for Storybook
- Completed *agentic-audit recommended (to know gaps)

## Workflow

### Interactive Elicitation

1. **Gather Parameters**
   - DS root path
   - Storybook config location (if exists)
   - Target: which AI tools will consume the DS (Claude Code, Cursor, Copilot)

2. **Confirm Scope**
   - Show current state from *agentic-audit (if available)
   - Confirm which gaps to address
   - Prioritize: tokens first, then component metadata, then MCP

### Steps

1. **Ensure W3C DTCG Token Format**
   - If tokens exist in proprietary format, generate migration script
   - Add $description to all tokens missing descriptions
   - Validate token file against DTCG spec
   - Check: tokens.json has $value + $type + $description on every token AND validates against DTCG schema — abort with "DTCG validation failed: {N} tokens non-compliant"

2. **Add Component Metadata**
   - Generate TypeScript interfaces for components missing types
   - Add JSDoc descriptions to undocumented props
   - Enumerate variants (convert open strings to union types)
   - Document composition rules (allowed children, slot types)
   - Check: undocumented component count == 0 AND all props have TypeScript types + JSDoc — abort with "{N} components missing typed/documented APIs: {list}"

3. **Configure Storybook MCP Addon**
   - Install @storybook/addon-mcp (or equivalent)
   - Configure addon to expose component stories as MCP tools
   - Test MCP endpoint responds with component catalog
   - Check: MCP endpoint responds with JSON containing component list with count > 0 — abort with "MCP addon not responding or returned empty data"

4. **Generate AI Constraint Rules**
   - Create .agentic-ds-config.yaml with:
     - Allowed components list
     - Forbidden patterns (no inline styles, no hardcoded values)
     - Token usage rules (which tokens for which contexts)
     - Composition rules (what can nest inside what)
   - Check: .agentic-ds-config.yaml parses without errors AND component count in config == total component count — abort with "Config invalid or incomplete: {error}"

5. **Generate Component API Docs**
   - Configure auto-doc generation (TypeDoc or Storybook autodocs)
   - Export component catalog as JSON artifact
   - Version-pin the artifact
   - Check: `test -f component-catalog.json` AND JSON contains all components with props listed — abort with "Catalog generation failed: {N} components missing"

## Output

- Updated tokens in W3C DTCG format
- Component metadata (types, docs, composition rules)
- Storybook MCP addon configured
- `.agentic-ds-config.yaml` — AI constraint rules
- `component-catalog.json` — Machine-readable component index
- `.state.yaml` updated

## Failure Handling

- **DTCG validation failed:** If token format conversion produces invalid DTCG schema (missing $type, $value structure), abort with "DTCG validation failed: {N} tokens non-compliant. Review {list} and ensure $value/$type/$description present."
- **MCP addon not responding:** If Storybook MCP endpoint returns empty or error after configuration, abort with "MCP addon not responding or returned empty data. Verify @storybook/addon-mcp installation and .storybook/main.js configuration."
- **Component API undocumented:** If component count with missing TypeScript types or JSDoc exceeds 0, abort with "{N} components missing typed/documented APIs: {list}. Add TypeScript interfaces and JSDoc comments before proceeding."
- **AI constraint rules incomplete:** If .agentic-ds-config.yaml component count does not match total component library count, abort with "Config invalid or incomplete: {N} components missing from constraint rules. Ensure all components listed with composition rules."

## Success Criteria

- All tokens have $value, $type, $description
- All components have typed, documented APIs
- MCP endpoint returns valid component data
- AI constraint rules cover entire component library


## Related Checklists

- `squads/design/checklists/ds-component-quality-checklist.md`
- `squads/design/checklists/ds-pattern-audit-checklist.md`

## Process Guards
- **On Fail:** Stop execution, capture evidence, and return remediation steps before proceeding.
