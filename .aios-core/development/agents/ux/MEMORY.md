# UX Design Expert Agent Memory (Uma)

## Active Patterns
<!-- Current, verified patterns used by this agent -->

### Key Patterns
- CommonJS (`require`/`module.exports`), NOT ES Modules
- ES2022, Node.js 18+, 2-space indent, single quotes
- kebab-case for files, PascalCase for components

### Project Structure
- `.aios-core/core/` — Core modules
- `docs/` — Documentation and design specs
- `packages/` — Shared packages

### Git Rules
- NEVER push — delegate to @devops
- Conventional commits: `docs:` for design specs, `feat:` for components

### Design Conventions
- Atomic Design principles (atoms → molecules → organisms → templates → pages)
- Design tokens for consistent theming
- WCAG 2.1 AA compliance target

## Promotion Candidates
<!-- Patterns seen across 3+ agents — candidates for CLAUDE.md or .claude/rules/ -->
<!-- Format: - **{pattern}** | Source: {agent} | Detected: {YYYY-MM-DD} -->

## Archived
<!-- Patterns no longer relevant — kept for history -->
<!-- Format: - ~~{pattern}~~ | Archived: {YYYY-MM-DD} | Reason: {reason} -->
