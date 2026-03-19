# Validate AI-Readiness of Design System

> Task ID: brad-ds-validate-ai-readiness
> Agent: Brad Frost (Design System Architect)
> Version: 1.0.0

## Description

Validate that the design system has all required artifacts for AI agent consumption: metadata, tokens, guidelines, MCP server, and registry.

## Prerequisites

- MCP server exists at `workspace/domains/design-system/mcp/`
- Metadata exists at `workspace/domains/design-system/metadata/`

## Workflow

1. **Check Metadata Coverage**
   - Read `metadata/components.json` — verify all registry items have metadata
   - Read individual component JSONs in `metadata/components/`
   - Verify each has: id, name, status, a11y contract, variants, tokens

2. **Check Token Registry**
   - Read `metadata/tokens/index.json`
   - Verify integrity counts match actual token count
   - Verify all 3 tiers present (primitive, semantic, component)

3. **Check Guidelines**
   - Read `metadata/guidelines/usage.json`
   - Verify each component in metadata has a guideline entry
   - Verify each guideline has: when_to_use, best_practices, common_mistakes

4. **Check MCP Server**
   - Verify all handler files exist (components, registry, tokens, guidelines)
   - Verify config.json lists all tools
   - Run `node squads/design/scripts/design-system/validate_mcp_skeleton.cjs`

5. **Check Registry**
   - Run `node squads/design/scripts/design-system/validate_registry.cjs`
   - Verify registryDependencies resolve
   - Verify cssVars reference valid tokens

6. **Generate Report**
   - Score: percentage of checks passing
   - List gaps with severity (CRITICAL / MEDIUM / LOW)
   - Recommend next actions

## Deliverables

- AI-Readiness report with score and gap analysis
- Actionable list of fixes ordered by priority

## Success Criteria

- [ ] 100% of components have metadata, tokens, and guidelines
- [ ] MCP server passes healthcheck with all 8 tools
- [ ] Registry validates against Shadcn schema
- [ ] Overall readiness score >= 90%


## Related Checklists

- `squads/design/checklists/ds-component-quality-checklist.md`
- `squads/design/checklists/ds-pattern-audit-checklist.md`

## Process Guards
- **Execution Type:** `Hybrid`
- **Dependencies:** depends_on: `[]` · enables: `[]` · workflow: `design-system`
- **On Fail:** Stop execution, capture evidence, and return remediation steps before proceeding.
