# MCP Server Status Check

> Task ID: brad-ds-mcp-status
> Agent: Brad Frost (Design System Architect)
> Version: 1.0.0

## Description

Report the current status of the Design System MCP server: tools available, data sources loaded, and health.

## Prerequisites

- MCP server exists at `workspace/domains/design-system/mcp/`

## Workflow

1. **Read Config**
   - Load `mcp/config.json` for declared tools and data sources

2. **Verify Data Sources**
   - Check each data source file exists and is valid JSON
   - Report: file path, exists (Y/N), record count

3. **Verify Handlers**
   - Check each handler file exists: components.ts, registry.ts, tokens.ts, guidelines.ts

4. **List Tools**
   - Report all tool names with descriptions from server.ts TOOL_DEFINITIONS

5. **Run Validation Scripts**
   - `node squads/design/scripts/design-system/validate_mcp_skeleton.cjs`
   - `node squads/design/scripts/design-system/test_mcp_tools.cjs`

6. **Generate Status Report**
   ```
   MCP Server: design-system-mcp v1.0.0
   Status: HEALTHY | DEGRADED | DOWN

   Tools: 8/8 operational
   Data Sources: 4/4 loaded
   Handlers: 4/4 present

   Last validation: PASS/FAIL
   ```

## Deliverables

- Status report with tool list and data source health

## Success Criteria

- [ ] All tools listed with status
- [ ] All data sources verified
- [ ] Validation scripts pass


## Related Checklists

- `squads/design/checklists/ds-component-quality-checklist.md`
- `squads/design/checklists/ds-pattern-audit-checklist.md`

## Process Guards
- **Execution Type:** `Hybrid`
- **Dependencies:** depends_on: `[]` · enables: `[]` · workflow: `design-system`
- **On Fail:** Stop execution, capture evidence, and return remediation steps before proceeding.
