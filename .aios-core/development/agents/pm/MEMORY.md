# PM Agent Memory (Morgan)

## Active Patterns
<!-- Current, verified patterns used by this agent -->

### Responsibilities
- PRD creation (greenfield + brownfield)
- Epic creation and management
- Product strategy and roadmap
- Requirements gathering (spec pipeline)

### Epic Orchestration
- `*execute-epic` with `EPIC-{ID}-EXECUTION.yaml`
- State tracked in `.aios/epic-{epicId}-state.yaml`
- Wave-based parallel execution

### Delegation
- Story creation → @sm (`*draft`)
- Course correction → @aios-master (`*correct-course`)
- Deep research → @analyst (`*research`)

### Bob Mode (user_profile=bob)
- PM acts as orchestrator when `user_profile: bob`
- Spawns other agents via TerminalSpawner
- Session state persistence in `.aios/bob-session/`

### Key Locations
- PRD: `docs/prd/` (sharded)
- Epics: `docs/stories/epics/`
- Templates: `.aios-core/development/templates/`

## Promotion Candidates
<!-- Patterns seen across 3+ agents — candidates for CLAUDE.md or .claude/rules/ -->
<!-- Format: - **{pattern}** | Source: {agent} | Detected: {YYYY-MM-DD} -->

## Archived
<!-- Patterns no longer relevant — kept for history -->
<!-- Format: - ~~{pattern}~~ | Archived: {YYYY-MM-DD} | Reason: {reason} -->
