# Template: CLAUDE.md for MEDIUM Profile

Copy and customize. Replace all {placeholders}. Target: ~120 lines.

---

```markdown
# {Project Name}

## Identity
{Who you are, what you build, for whom — 2-3 lines max}

## Strategic Lens
{The ONE principle that guides all decisions. Examples:}
{- "Ship fast, iterate based on data."}
{- "Revenue-generating actions first. Everything else is overhead."}
{- "User experience over technical elegance."}

## Decision Levels

| Level | Scope | Action |
|-------|-------|--------|
| 1 — Decide alone | Implementation, naming, structure | Decide, document reason |
| 2 — Decide and flag | Architecture, tradeoffs, dependencies | Decide, flag the choice |
| 3 — Escalate | Ambiguous goals, business changes | Present options with tradeoffs, ask |

## Routing

| Request contains | Action |
|-----------------|--------|
| {category 1} | {how to handle} |
| {category 2} | {how to handle} |
| {category 3} | {how to handle} |

## Context Loading

**Always loaded:** This file + MEMORY.md
**Session start:** projects/{active}/STATE.yaml
**Before creating:** .brain/ (facts) + inputs/intelligence/ (evidence)
**On-demand:** .claude/rules/ (auto-matched), .claude/reference/

## Execution Rules

1. Read 2x more context than you produce output
2. Before creating content/copy, load intelligence (P0 files)
3. Before creating anything, check .brain/ for existing facts
4. Update STATE.yaml at session end
5. Create handoff at session end: docs/sessions/{YYYY-MM}/
6. 2 failed attempts = change strategy, not parameters
7. Declare confidence (HIGH/MEDIUM/LOW) before factual claims
8. "I don't know" > fabricated certainty

## Anti-Patterns (never do)

- Generate content without loading intelligence first
- Put business facts in this file (they go in .brain/)
- Exceed 200 lines in this file
- Treat working hypothesis as confirmed fact
- Skip handoff at session end

## Paths

| Layer | Path | Purpose |
|-------|------|---------|
| L1 Knowledge | .brain/ | Product, persona, brand facts |
| L2 Intelligence | inputs/intelligence/ | Customer research, evidence |
| L3 State | projects/{active}/ | Phase, decisions, artifacts |
| L4 Rules | .claude/rules/ | Domain heuristics |
| L5 Memory | MEMORY.md (auto) | Cross-session patterns |
| L6 Sessions | docs/sessions/ | Handoffs |
| Outputs | outputs/ | Generated artifacts |
```

---

**Customization notes:**
- Routing table: add rows as you discover recurring request types
- Rules: remove any that don't change behavior in your context
- Paths: adjust to match your actual directory structure
- Add model routing section if using multiple models
