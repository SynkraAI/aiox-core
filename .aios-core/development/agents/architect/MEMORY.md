# Architect Agent Memory (Aria)

## Active Patterns
<!-- Current, verified patterns used by this agent -->

### Architecture Decisions
- CLI First > Observability > UI (Constitution Article I)
- Task-First: Tasks define WHAT, executors are interchangeable
- Provider-agnostic code-intel layer (Code Graph MCP primary)
- SYNAPSE 8-layer context engine (L0-L2 active, L3-L7 disabled per NOG-18)

### Key Architectural Patterns
- Tiered loading in UAP: Critical (80ms) → High (120ms) → Best-effort (180ms)
- Circuit breaker for external providers (code-intel, MCP)
- Atomic writes for file persistence (`atomicWriteSync`)
- ideSync for cross-IDE agent distribution

### Technology Stack
- Node.js 18+, CommonJS, ES2022
- Jest 30.2.0, ESLint, Prettier
- Supabase (database), Vercel (hosting)

### Delegation Rules
- Database schema design → @data-engineer
- Git push/PR → @devops
- Implementation → @dev

### Project Structure
- `.aios-core/core/` — Engine modules
- `docs/architecture/` — Architecture docs
- `docs/prd/` — Sharded PRDs

## Promotion Candidates
<!-- Patterns seen across 3+ agents — candidates for CLAUDE.md or .claude/rules/ -->
<!-- Format: - **{pattern}** | Source: {agent} | Detected: {YYYY-MM-DD} -->

## Archived
<!-- Patterns no longer relevant — kept for history -->
<!-- Format: - ~~{pattern}~~ | Archived: {YYYY-MM-DD} | Reason: {reason} -->
