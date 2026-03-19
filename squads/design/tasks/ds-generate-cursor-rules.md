# Generate IDE Rules from Design System

> Task ID: brad-ds-generate-cursor-rules
> Agent: Brad Frost (Design System Architect)
> Version: 1.0.0

## Description

Generate `.cursorrules` and `.claude-rules.md` files from the design system metadata, tokens, and guidelines. Rules enforce correct token usage, component selection, and accessibility.

## Prerequisites

- Token registry at `metadata/tokens/index.json`
- Component metadata at `metadata/components.json`
- Guidelines at `metadata/guidelines/usage.json`

## Workflow

1. **Extract Token Rules**
   - List all CSS variables from token registry
   - Generate rules: "Use var(--X) instead of hardcoded value Y"
   - Group by category (color, spacing, typography, radius, shadow, motion)

2. **Extract Component Rules**
   - List all components with their intended use cases (from guidelines)
   - Generate rules: "For X use case, use Y component"
   - Include anti-patterns from when_not_to_use

3. **Extract Accessibility Rules**
   - From component a11y contracts, generate:
   - Required ARIA attributes per component
   - Keyboard interaction requirements
   - WCAG criteria that must be met

4. **Generate .cursorrules**
   - Markdown format optimized for Cursor IDE
   - Sections: Token Usage, Component Selection, Accessibility, Anti-Patterns

5. **Generate .claude-rules.md**
   - Markdown format optimized for Claude Code
   - Include MCP tool references for runtime queries

6. **Validate**
   - Rules don't conflict with existing project rules
   - Token references resolve to actual tokens
   - Component references resolve to actual components

## Output Path

- `workspace/domains/design-system/rules/.cursorrules`
- `workspace/domains/design-system/rules/.claude-rules.md`

## Deliverables

- IDE rules files generated from live metadata
- Zero hardcoded rules — all derived from data sources

## Success Criteria

- [ ] Rules reference only existing tokens and components
- [ ] Anti-patterns derived from guidelines when_not_to_use
- [ ] Accessibility rules cover all component a11y contracts
- [ ] No conflicts with existing .claude/ rules


## Related Checklists

- `squads/design/checklists/ds-component-quality-checklist.md`
- `squads/design/checklists/ds-pattern-audit-checklist.md`

## Process Guards
- **Execution Type:** `Hybrid`
- **Dependencies:** depends_on: `[]` · enables: `[]` · workflow: `design-system`
- **On Fail:** Stop execution, capture evidence, and return remediation steps before proceeding.
