# Interactive Design System Query

> Task ID: brad-ds-query
> Agent: Brad Frost (Design System Architect)
> Version: 1.0.0

## Description

Interactive query interface for the design system via MCP tools. Answers questions about components, tokens, guidelines, and suggests components for use cases.

## Prerequisites

- MCP server functional (8 tools)
- All data sources loaded

## Workflow

1. **Parse User Query**
   - Identify intent: component lookup, token search, guideline check, or suggestion
   - Extract key entities: component name, category, use case description

2. **Route to MCP Tool**

   | Intent | MCP Tool |
   |--------|----------|
   | "What components exist?" | `design_system.list_components` |
   | "Show me the button" | `design_system.get_component` |
   | "Find components for forms" | `design_system.search_components` |
   | "What are the a11y requirements for X?" | `design_system.get_a11y_requirements` |
   | "Show color tokens" | `design_system.get_tokens` |
   | "How should I use the input?" | `design_system.get_guidelines` |
   | "I need a status indicator" | `design_system.suggest_component` |
   | "Show registry entry for X" | `design_system.get_registry_entry` |

3. **Format Response**
   - Present results in structured format (tables, code blocks)
   - Include related information (e.g., related components from guidelines)
   - Suggest follow-up queries

4. **Chain Queries (Advanced)**
   - "Show me everything about button" →
     1. get_component (metadata)
     2. get_guidelines (usage)
     3. get_tokens (component tier, button-*)
     4. get_registry_entry (files, deps)

## Examples

```
User: *ds-query what component for a submit button?
Brad: Running suggest_component("submit")...

  Suggestions:
  1. button (score: 6) — when_to_use: "Primary actions (submit, save, create)", "Form submissions"
  2. form-field (score: 3) — when_to_use: "Any form input that needs a label"

  Recommendation: Use `button` with variant="primary" inside a `form-field`.

User: *ds-query color tokens
Brad: Running get_tokens(category: "color")...

  27 color tokens found:
  | Tier | Count | Examples |
  |------|-------|---------|
  | primitive | 18 | --primitive-color-gold, --primitive-color-bg-base |
  | semantic | 6 | --color-bg-default, --color-interactive-default |
  | component | 3 | --button-bg-primary, --card-bg |
```

## Deliverables

- Real-time answers from design system data
- Structured output with actionable recommendations

## Success Criteria

- [ ] All 8 MCP tools accessible via natural language queries
- [ ] Responses include concrete values, not just descriptions
- [ ] Follow-up suggestions provided for deeper exploration


## Related Checklists

- `squads/design/checklists/ds-component-quality-checklist.md`
- `squads/design/checklists/ds-pattern-audit-checklist.md`

## Process Guards
- **Execution Type:** `Hybrid`
- **Dependencies:** depends_on: `[]` · enables: `[]` · workflow: `design-system`
- **On Fail:** Stop execution, capture evidence, and return remediation steps before proceeding.
