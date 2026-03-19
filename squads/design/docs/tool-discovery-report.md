# Tool Discovery Report - Design Squad

## Metadata
- Date: 2026-02-17
- Squad: `design`
- Domain: design-system
- Policy: internal-first (`internal-infrastructure-library.yaml`)

## Internal Coverage Summary

### Internal assets validated first
1. `workspace/domains/design-system/*` (tokens, components, guidelines, MCP handlers)
2. `squads/design/scripts/design-system/*` (manifest sync, metadata generation/validation, MCP checks)
3. `squads/design/*` (tasks, checklists, workflows, protocols)
4. `.aiox-core/infrastructure/*` (generic validation and dependency tooling)

### Capabilities fully covered internally
- DS token catalog and component metadata
- DS manifest synchronization and drift validation
- MCP skeleton and MCP tool validation
- Task/checklist governance validation
- Accessibility/process governance checklists

### Capabilities partially covered internally
- Visual regression baseline execution across browsers/cloud
- Figma file ingestion and live sync at scale
- Cross-repo design telemetry aggregation

### External-only or enhancement gaps
1. Managed visual regression service integration
2. Official design-file API sync hardening (Figma org-level workflows)
3. Optional cloud artifact storage/CDN for DS assets

## External Discovery Scope (only for real gaps)

### MCP / APIs
- Figma API / MCP bridge (enhancement for `ds-figma-pipeline`)
- GitHub API (PR checks for DS governance automation)

### CLI / Tooling
- Playwright (fallback/enhancement for visual checks)
- Chromatic or Percy (managed visual regression)

### Libraries
- Storybook test runner ecosystem (if squad chooses Storybook-first baseline)

## Internal vs External Decisions

### Internal primary (required)
1. `squads/design/scripts/design-system/sync_design_manifest.cjs`
2. `squads/design/scripts/design-system/validate_design_manifest_drift.cjs`
3. `squads/design/scripts/design-system/generate_components_metadata.cjs`
4. `squads/design/scripts/design-system/validate_components_metadata.cjs`
5. `squads/design/scripts/design-system/validate_task_checklist_bindings.cjs`
6. `squads/design/scripts/design-system/validate_mcp_skeleton.cjs`
7. `squads/design/scripts/design-system/test_mcp_tools.cjs`

### External fallback/enhancement (optional)
1. Playwright (`ds-visual-regression`) when native baselines are insufficient
2. Chromatic/Percy for managed diff pipelines
3. Figma API for enterprise sync scenarios

## Prioritized Recommendations

### Quick Wins
1. Keep internal scripts as mandatory quality gate before any external tool.
2. Wire visual regression tasks to prefer local Playwright path first.
3. Keep Figma integration optional and triggered only by explicit design-file workflows.

### Strategic
1. Add unified wrapper task to orchestrate metadata + manifest + MCP health in one command.
2. Add explicit fallback matrix in `ds-visual-regression.md` by cost tier.

### Avoid for now
1. Replacing internal DS governance pipeline with third-party SaaS.
2. Adding external tools that duplicate existing internal checks.

## Sources
- `workspace/domains/design-system/mcp/config.json`
- `workspace/domains/design-system/metadata/components.json`
- `workspace/domains/design-system/metadata/tokens/index.json`
- `squads/design/scripts/design-system/sync_design_manifest.cjs`
- `squads/design/scripts/design-system/validate_design_manifest_drift.cjs`
- `squads/design/scripts/design-system/validate_task_checklist_bindings.cjs`
- `squads/design/scripts/design-system/validate_mcp_skeleton.cjs`
- `squads/design/config.yaml`
- `squads/design/README.md`
