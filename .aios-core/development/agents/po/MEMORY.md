# PO Agent Memory (Pax)

## Active Patterns
<!-- Current, verified patterns used by this agent -->

### Responsibilities
- Story validation (`*validate-story-draft`) — 10-point checklist
- Backlog management and prioritization
- Story lifecycle: Draft → Ready transition (MUST update status)
- Epic context tracking

### Validation Checklist (10 Points)
1. Clear title
2. Complete description
3. Testable AC (Given/When/Then)
4. Defined scope (IN/OUT)
5. Dependencies mapped
6. Complexity estimate
7. Business value
8. Risks documented
9. Criteria of Done
10. PRD/Epic alignment

### Story File Permissions
- CAN edit: QA Results section (when reviewing)
- MUST update: Status field (Draft → Ready on GO)
- CANNOT modify: AC, Scope, Title, Dev Notes, Testing

### Delegation
- Story creation → @sm (`*draft`)
- Epic creation → @pm (`*create-epic`)
- Course correction → @aios-master

### Key Locations
- Stories: `docs/stories/`
- Backlog: `docs/stories/backlog/`
- Templates: `.aios-core/development/templates/story-tmpl.yaml`

## Promotion Candidates
<!-- Patterns seen across 3+ agents — candidates for CLAUDE.md or .claude/rules/ -->
<!-- Format: - **{pattern}** | Source: {agent} | Detected: {YYYY-MM-DD} -->

## Archived
<!-- Patterns no longer relevant — kept for history -->
<!-- Format: - ~~{pattern}~~ | Archived: {YYYY-MM-DD} | Reason: {reason} -->
