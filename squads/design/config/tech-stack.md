# Design System Squad - Tech Stack

## Core Stack

| Tool | Purpose | Used By |
|---|---|---|
| Tailwind CSS v4 | token-first styling via `@theme` | @brad-frost |
| shadcn/ui Registry | component distribution and bootstrap | @brad-frost |
| TypeScript | component and metadata contracts | @brad-frost |
| Storybook | component docs and review | @brad-frost |
| Chromatic | visual regression checks | @brad-frost |
| Style Dictionary / DTCG | token export pipelines | @brad-frost |

## Governance & Ops

| Tool | Purpose | Used By |
|---|---|---|
| Vale | copy governance lint | @dave-malouf |
| GitHub Actions | deterministic CI checks | @design-chief |
| WCAG reference data | accessibility gates and audits | @brad-frost |

## AI Readiness

| Tool | Purpose | Used By |
|---|---|---|
| `metadata/components.json` | AI-readable component catalog | @brad-frost |
| MCP server skeleton | tool-ready DS artifacts exposure | @brad-frost |
| `workspace/ui/registry.json` | registry sync source | @design-chief |

## Output Paths

```yaml
output_paths:
  domains_design_system: workspace/domains/design-system/
  system_foundations: workspace/system/foundations/
  ui_registry: workspace/ui/registry.json
  squad_artifacts: squads/design/
```

## Scope Boundary

Out of scope for this squad:

- logo creation
- brand strategy/pricing
- thumbnails, photography, video editing

These domains are handled in `squads/brand` and `squads/content-visual`.
