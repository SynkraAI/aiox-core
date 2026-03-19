# Configure Figma MCP + Design-to-Code Pipeline

> Task ID: brad-figma-pipeline
> Agent: Brad (Design System Architect)
> Version: 1.0.0
> **Execution Type:** `Agent`
> **Dependencies:** depends_on: `[]` · enables: `[]` · workflow: `figma`

## Description

Configure the Figma MCP Server to connect design files with AI coding tools. Establishes component mapping (Figma components → code components), token sync (Figma Variables → W3C DTCG), and design-to-code workflow.

## Prerequisites

- Figma file with component library
- Figma API access (personal access token)
- AI coding tool (Claude Code, Cursor, Windsurf)

## Workflow

### Interactive Elicitation

1. **Gather Parameters**
   - Figma file URL or key
   - Code component library location
   - Target AI tool for integration
   - Token sync direction (Figma → code, code → Figma, bidirectional)

### Steps

1. **Setup Figma MCP Server**
   - Install Figma MCP Server package
   - Configure Figma API token
   - Connect to target Figma file
   - Verify MCP server responds with file data
   - Check: MCP server query returns component list with count > 0 — abort with "MCP server not responding or returned empty component list"

2. **Create Component Mapping**
   - Map Figma component names → code component imports
   - Map Figma variants → code component props
   - Map Figma auto-layout → CSS flex/grid patterns
   - Document unmapped components (gaps between design and code)
   - Check: (mapped components / total Figma components) * 100 >= 80 — log "Mapping coverage: {pct}% ({mapped}/{total}), unmapped: {list}"

3. **Configure Token Sync**
   - Export Figma Variables as W3C DTCG tokens
   - Compare with existing code tokens (identify drift)
   - Define sync direction and conflict resolution rules
   - Setup automated sync (CI/CD or manual trigger)
   - Check: token drift count == 0 (Figma values match code values) — if drift > 0, log "Token drift detected: {N} mismatches" and list them

4. **Define Design-to-Code Workflow**
   - Developer selects Figma frame/component
   - AI tool queries MCP for design context
   - AI generates code using mapped components and tokens
   - Developer reviews and refines
   - Document the workflow for team adoption
   - Check: sample Figma frame generates code using mapped components AND correct tokens — abort with "Pipeline failed: AI output uses {N} unmapped components"

5. **Validate Round-Trip Fidelity**
   - Generate code from sample Figma designs
   - Compare output with expected component usage
   - Measure fidelity (correct components, correct tokens, correct layout)
   - Document common mismatches and fixes
   - Update .state.yaml

## Output

- Figma MCP Server configured and connected
- `figma-component-mapping.json` — Figma → code component map
- `figma-token-sync-config.yaml` — Token sync configuration
- `figma-pipeline-guide.md` — Team workflow documentation
- `.state.yaml` updated

## Failure Handling

- **MCP Server connection timeout:** If Figma MCP Server does not respond within 10s or returns empty data, verify Figma API token validity and network connectivity, then exit with "MCP connection failed — check token at mcp-servers/figma/config and retry"
- **Component mapping below 50%:** If less than half of Figma components have code equivalents, generate unmapped component report and suggest creating placeholder components or adjusting component naming conventions before proceeding
- **Critical token drift detected:** If >20% of color or spacing tokens differ between Figma and code by >10%, halt sync and prompt user to choose canonical source (Figma or code), then document chosen direction in figma-token-sync-config.yaml
- **AI-generated code uses wrong components:** If sample Figma frame generates code with 3+ unmapped components or incorrect token references, flag as fidelity failure, include comparison screenshot in validation report, and suggest improving component mapping or AI prompt context

## Success Criteria

- MCP Server returns accurate Figma component data
- >80% of Figma components mapped to code equivalents
- Token values synchronized (zero drift)
- AI-generated code uses correct DS components


## Related Checklists

- `squads/design/checklists/ds-component-quality-checklist.md`

## Process Guards
- **On Fail:** Stop execution, capture evidence, and return remediation steps before proceeding.
