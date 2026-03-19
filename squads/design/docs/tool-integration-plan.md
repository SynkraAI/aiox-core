# Tool Integration Plan - Design Squad

## Objective
Keep Design Squad execution internal-first and integrate external tooling only where internal coverage is partial.

## Wave 1 (Immediate)
1. Enforce internal quality chain as baseline:
   - `generate_components_metadata.cjs`
   - `validate_components_metadata.cjs`
   - `sync_design_manifest.cjs`
   - `validate_design_manifest_drift.cjs`
   - `validate_task_checklist_bindings.cjs`
   - `validate_mcp_skeleton.cjs`
2. Require this chain before `ds-*` delivery completion.
3. Add structural AST baseline for MCP/contracts:
   - `npm run ast:scan:design-system`
   - output: `.aiox/ast/design-system-structural-model.json`

## Wave 2 (Short-term)
1. In `ds-visual-regression`, prioritize local Playwright baseline path.
2. Add explicit cost/benefit gate before adopting managed visual regression SaaS.
3. Keep `ds-figma-pipeline` external integration optional and capability-driven.

## Wave 3 (Optional)
1. Introduce managed visual regression provider (Chromatic/Percy) only for teams needing multi-browser cloud snapshots and PR UX.
2. Introduce enterprise Figma API automation only for orgs with approved app governance.

## Task Wiring (Internal-first)
- `ds-setup-design-system`: internal scripts + metadata registry
- `ds-generate-documentation`: local metadata/guideline sources
- `ds-validate-ai-readiness`: internal MCP health first
- `ds-visual-regression`: local path first, managed provider as optional enhancement
- `ds-figma-pipeline`: explicit opt-in integration

## Success Metrics
1. 100% DS task completions pass internal quality chain.
2. 0 external tool usage for capabilities already covered internally.
3. External tools adopted only with documented gap justification.

## Validation Checklist
- [ ] Internal capability used as primary for each mapped capability
- [ ] External tools tagged as fallback/enhancement
- [ ] Cost and access constraints documented before external adoption
- [ ] `tool-discovery-report.md` and `capability-tools.yaml` synchronized
