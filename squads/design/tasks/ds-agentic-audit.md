# Audit DS Machine-Readability for AI Consumption

> Task ID: brad-agentic-audit
> Agent: Brad (Design System Architect)
> Version: 1.0.0
> **Execution Type:** `Agent`
> **Dependencies:** depends_on: `[]` · enables: `[ds-agentic-setup]` · workflow: `agentic`

## Description

Calculate an AI-readiness score (0-100) for your design system by checking structured token formats, component API documentation, machine-parseable metadata, and MCP integration readiness. Outputs an AI-readiness score (0-100) with specific gaps and recommendations.

## Output Schema
- **produces:** `outputs/design-system/{project}/agentic/agentic-readiness-report.json`
- **format:** JSON data
- **consumed_by:** ds-agentic-setup

## Prerequisites

- Existing design system with components and/or tokens
- Bash shell access for scanning
- Read access to component source files

## Workflow

### Interactive Elicitation

1. **Gather Parameters**
   - Ask for DS root path (e.g., ./src/design-system, ./packages/ui)
   - Detect component framework (React, Vue, Web Components)
   - Confirm output directory (default: outputs/design-system/{project}/agentic/)

2. **Validate Path**
   - Check path exists and contains component files
   - Count total component files

### Steps

1. **Check Token Format Against DTCG Spec**
   - Check if tokens exist in W3C DTCG format ($value, $type, $description)
   - Check for proprietary formats (Style Dictionary v3, custom JSON/YAML)
   - Validate $description coverage (% of tokens with descriptions)
   - Score: DTCG = 25pts, proprietary with descriptions = 15pts, no tokens = 0pts

2. **Grep Component TypeScript Interfaces and JSDoc Coverage**
   - Check for TypeScript interfaces/types on components
   - Check for JSDoc/TSDoc on component props
   - Check for enumerated variants (not open string props)
   - Check for composition rules (documented children/slot types)
   - Score: Full typed + documented = 25pts, partial = 10pts, none = 0pts

3. **Count Storybook Stories and Documentation Files**
   - Check for Storybook stories (.stories.tsx/.mdx files)
   - Check for structured args/argTypes in stories
   - Check for component README or MDX documentation
   - Check for accessibility annotations (ARIA role docs)
   - Score: Full coverage = 25pts, partial = 10pts, none = 0pts

4. **Detect Build Pipeline and MCP Integration**
   - Check for Storybook MCP addon
   - Check for API doc generation (TypeDoc, Storybook autodocs)
   - Check for token build pipeline (Style Dictionary, Terrazzo)
   - Check for versioned token artifact publication
   - Score: Full infra = 25pts, partial = 10pts, none = 0pts

5. **Generate AI-Readiness Report**
   - Calculate total score (0-100)
   - List gaps by category with severity (critical/high/medium)
   - Provide specific recommendations with effort estimates
   - Save report to output directory
   - Update .state.yaml

## Output

- `agentic-readiness-report.md` — Full assessment with score breakdown
- Gap list with actionable recommendations
- Priority roadmap to reach AI-ready status
- `.state.yaml` updated with agentic audit results

## Failure Handling

- **DS root path contains no component files:** Exit with error "No component files found in {path}. Verify design system root."
- **Cannot detect component framework:** Ask user to specify framework manually. Default to React patterns if no response
- **Token format detection returns zero results:** Check for alternate token locations (config files, theme files, package.json). Report "No tokens found — score 0/25 for token format"
- **Storybook not installed:** Score infrastructure and metadata as 0, recommend Storybook setup as critical gap

## Success Criteria

- Score calculated accurately based on actual codebase scan
- Every gap has a specific, actionable recommendation
- Report includes quick wins (< 1 day effort) vs. strategic investments


## Related Checklists

- `squads/design/checklists/ds-component-quality-checklist.md`
- `squads/design/checklists/ds-pattern-audit-checklist.md`

## Process Guards
- **On Fail:** Stop execution, capture evidence, and return remediation steps before proceeding.
