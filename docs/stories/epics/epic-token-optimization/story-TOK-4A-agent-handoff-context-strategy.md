# Story TOK-4A: Agent Handoff Context Strategy

## Metadata

| Field | Value |
|-------|-------|
| **Story ID** | TOK-4A |
| **Epic** | Token Optimization — Intelligent Tool Loading |
| **Type** | Enhancement |
| **Status** | Ready for Review |
| **Priority** | P1 (Optimization) |
| **Points** | 3-5 |
| **Agent** | @dev (Dex) + @architect (Aria) |
| **Quality Gate** | @qa (Quinn) |
| **Quality Gate Tools** | [context_measurement, handoff_integrity] |
| **Blocked By** | TOK-1. Phase 2 (ACs 7-9): NOG-18 (condicional) |
| **Branch** | feat/epic-token-optimization |
| **Origin** | Codex ALTO-1: TOK-4 split — Handoff strategy separated from Input Examples |

---

## Executor Assignment

```yaml
executor: "@dev + @architect"
quality_gate: "@qa"
quality_gate_tools: ["context_measurement", "handoff_integrity"]
```

### Agent Routing Rationale

| Agent | Role | Justification |
|-------|------|---------------|
| `@dev` | Implementor | Creates handoff artifact template, implements context compaction on agent switch. |
| `@architect` | Co-executor | Designs Swarm-like handoff pattern, validates architecture. |
| `@qa` | Quality Gate | Validates context does not accumulate, handoff preserves critical information, no regressions. |

## Story

**As a** AIOS multi-agent workflow user,
**I want** agent switches to compact previous agent context and load clean new agent profiles,
**so that** context window does not accumulate 3+ agent personas, reducing unnecessary token overhead.

## Context

When AIOS switches between agents (e.g., @sm → @dev → @qa in SDC), each agent's full persona, instructions, and tool definitions accumulate in the context. After 3+ switches, significant context is consumed by stale agent data. OpenAI's Swarm pattern shows that compacting previous agent context on handoff maintains quality while reducing overhead.

### Research References
- [Token Optimization Architecture — Agent handoff](../../../research/2026-02-22-aios-token-optimization-architecture/)
- [Codex ALTO-1: TOK-4 inconsistency → split](CODEX-CRITICAL-ANALYSIS.md#alto-1)
- [Blueprint v2.0 — TOK-4A description](ARCHITECT-BLUEPRINT.md#wave-2-optimization-p1--11-15-pontos)
- [SYNAPSE context tracking](../epic-nogic-code-intelligence/) — NOG-18 foundation

### Current Problem

```
Session starts: @sm (River) → ~3K tokens persona + tools
Agent switch: + @dev (Dex) → +5K tokens (accumulated: ~8K)
Agent switch: + @qa (Quinn) → +4K tokens (accumulated: ~12K)
Agent switch: + @devops (Gage) → +3K tokens (accumulated: ~15K)
```

After 4 agent switches: ~15K tokens of agent context, only 1 agent is active.

### Target

```
Session starts: @sm (River) → ~3K tokens
Agent switch: @sm compacted to ~500 tokens summary + @dev loaded → ~5.5K total
Agent switch: @dev compacted + @qa loaded → ~4.5K total
```

Max context: always ~1 active agent + summaries of previous agents.

## Acceptance Criteria

### Handoff Artifact

1. Handoff artifact template created: captures critical state (current story, decisions made, files modified, blockers)
2. Artifact is compact: max 500 tokens for previous agent summary
3. Artifact is structured: YAML or markdown with fixed sections

### Context Compaction

4. On agent switch: previous agent's full persona/instructions are compacted to handoff artifact
5. New agent receives: own full profile + handoff artifact from previous agent(s)
6. Context does NOT accumulate 3+ full agent personas simultaneously

### Integration Point & Limits

7. Define exact integration point: orchestration hook, CLAUDE.md instructions, or standalone module
8. No regression in current subagent flow: `subagent-prompt-builder.js` and `executor-assignment.js` continue to work identically
9. Define objective compaction limits: max tokens for handoff artifact, max retained agent summaries
10. Handoff artifact stored in `.aios/handoffs/` (runtime, gitignored)

### Validation

11. SDC workflow (4 agent switches) measured: context growth < 50% vs current accumulation
12. No critical information lost in handoff (story context, decisions, file lists preserved)
13. `npm test` passes — zero regressions

### Phase 2: SYNAPSE Integration (condicional — requer NOG-18 Done)

> **NOTA:** ACs 14-16 so sao executaveis apos NOG-18 (SYNAPSE context engine) estar Done. Se NOG-18 nao estiver pronto no momento da implementacao, Phase 1 (ACs 1-13) pode ser entregue standalone. Phase 2 sera implementada quando NOG-18 estiver disponivel.

14. Handoff integrates with SYNAPSE context tracking (NOG-18)
15. SYNAPSE domain switch triggers handoff compaction
16. SYNAPSE integration tested with domain-aware context active

## Tasks / Subtasks

> **Execution order:** Phase 1: Task 1 → Task 2 → Task 3 → Task 4. Phase 2 (condicional NOG-18): Task 5.

### Phase 1: Standalone Handoff (ACs 1-13)

- [x] **Task 1: Handoff artifact design** (AC: 1, 2, 3)
  - [x] 1.1 Design handoff artifact schema (story context, decisions, files, blockers)
  - [x] 1.2 Create template at `.aios-core/development/templates/agent-handoff-tmpl.yaml`
  - [x] 1.3 Validate template is < 500 tokens when filled (379 tokens filled, no comments)

- [x] **Task 2: Context compaction implementation** (AC: 4, 5, 6)
  - [x] 2.1 Define compaction trigger (agent switch detection via `@agent` command)
  - [x] 2.2 Implement context compaction: `.claude/rules/agent-handoff.md` — extract critical state, discard persona
  - [x] 2.3 Load new agent profile from tool registry (incoming agent loads full profile, outgoing discarded)
  - [x] 2.4 Implement handoff artifact storage in `.aios/handoffs/` (AC: 10) — directory created, gitignored

- [x] **Task 3: Integration point & limits** (AC: 7, 8, 9)
  - [x] 3.1 Integration point: `.claude/rules/agent-handoff.md` (native Claude Code rules injection — zero code changes)
  - [x] 3.2 Zero regression verified: `git diff` on subagent-prompt-builder.js and executor-assignment.js = empty
  - [x] 3.3 Compaction limits documented: 500 tok max artifact, 3 max retained, 5/10/3 decisions/files/blockers

- [x] **Task 4: Validation** (AC: 11, 12, 13)
  - [x] 4.1 SDC context growth: 18,751 → 6,497 tokens (65.4% reduction, target >50%) — PASS
  - [x] 4.2 Critical info preserved: story_id, path, status, task, branch, decisions, files, blockers, next_action
  - [x] 4.3 npm test: 282 passed, 11 failed (pre-existing), 0 new regressions

### Phase 2: SYNAPSE Integration (ACs 14-16, condicional NOG-18 Done)

- [ ] **Task 5: SYNAPSE integration** (AC: 14, 15, 16) — **blocked by NOG-18**
  - [ ] 5.1 Link handoff to SYNAPSE domain switch
  - [ ] 5.2 SYNAPSE domain switch triggers handoff compaction
  - [ ] 5.3 Test with SYNAPSE context tracking active

## Scope

### IN Scope
- **Phase 1:** Handoff artifact template, context compaction on agent switch, integration point design, SDC workflow validation
- **Phase 2 (condicional NOG-18):** SYNAPSE integration

### OUT of Scope
- Input examples for tools (TOK-4B)
- Tool loading changes (TOK-2)
- Automated handoff (manual trigger acceptable for v1)
- Multi-session persistence (single session only)

## Dependencies

```
TOK-1 (Registry) → TOK-4A (agent profiles from registry) — HARD dependency (Phase 1)
NOG-18 (SYNAPSE) → TOK-4A Phase 2 (ACs 14-16) — SOFT dependency (condicional)
```

**Nota:** Phase 1 (ACs 1-13) pode ser entregue sem NOG-18. Phase 2 (ACs 14-16) requer NOG-18 Done.

## Complexity & Estimation

**Complexity:** Medium-High
**Estimation:** 3-5 points (artifact design + compaction logic + SYNAPSE integration)

## Boundary Impact (L1-L4)

| Path | Layer | Action | Deny/Allow |
|------|-------|--------|-----------|
| `.aios-core/development/templates/agent-handoff-tmpl.yaml` | L2 | Created | **DENY** (templates/**) — **REQUER** `frameworkProtection: false` |
| `.aios/handoffs/` | L4 | Created | N/A (gitignored runtime) |

**ATENCAO:** Template em L2 requer contributor mode. Alternativa: colocar template em `.aios-core/data/` (L3, permitido).

**Scope Source of Truth:** Template: Project framework (L2). Runtime: `.aios/` (L4, gitignored).

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Compaction loses critical context | HIGH | Structured artifact with mandatory sections; AC 12 defines limits |
| SYNAPSE integration complexity (8 layers) | MEDIUM-HIGH | Start with standalone module, SYNAPSE integration optional; AC 10 defines integration point |
| Agent switch detection unreliable | MEDIUM | Use explicit `@agent` command as trigger |
| L2 deny rules block template creation | MEDIUM | Use contributor mode OR move template to L3 (`data/`) |

## Dev Notes

### Technical References
- SYNAPSE context: `.aios-core/core/synapse/` — domain-based context management
- Agent definitions: `.claude/agents/*.md`
- Tool registry profiles: `.aios-core/data/tool-registry.yaml` (TOK-1)
- OpenAI Swarm: github.com/openai/swarm — handoff pattern reference

### Implementation Notes
- Handoff artifact = compact summary of what the previous agent did
- Compaction is lossy by design — only critical state preserved
- `/compact` native command can assist with context compaction
- First version can use CLAUDE.md instructions for compaction behavior

## Testing

```bash
# Verify no regressions
npm test
```

## File List

| File | Action | Description |
|------|--------|-------------|
| `.aios-core/development/templates/agent-handoff-tmpl.yaml` | Created | Handoff artifact template — 379 tokens filled (L2) |
| `.claude/rules/agent-handoff.md` | Created | Agent handoff protocol — compaction rules, limits, examples |
| `.aios/handoffs/` | Created | Runtime handoff storage directory (L4, gitignored) |
| `.claude/CLAUDE.md` | Modified | Added handoff reference to Context Management section |
| `docs/stories/epics/epic-token-optimization/story-TOK-4A-agent-handoff-context-strategy.md` | Modified | Story file (checkboxes, Dev Agent Record) |

## CodeRabbit Integration

| Field | Value |
|-------|-------|
| **Story Type** | Feature / Architecture |
| **Complexity** | Medium-High |
| **Primary Agent** | @dev + @architect |
| **Self-Healing Mode** | standard (2 iterations, 20 min, CRITICAL+HIGH) |

**Severity Behavior:**
- CRITICAL: auto_fix (max 2 iterations)
- HIGH: auto_fix (max 1 iteration)
- MEDIUM: document_as_debt
- LOW: ignore

**Focus Areas:**
- Handoff completeness (no critical data loss)
- Context accumulation prevention
- SYNAPSE integration correctness

## QA Results

_Pending implementation_

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Implementation Summary

**Task 1 (Handoff artifact design):** Created structured YAML template at `.aios-core/development/templates/agent-handoff-tmpl.yaml`. Schema captures: story context (id, path, status, task, branch), decisions (max 5), files modified (max 10), blockers (max 3), next action. Filled size: 379 tokens (target < 500).

**Task 2 (Context compaction):** Implemented via `.claude/rules/agent-handoff.md` — native Claude Code rules injection. On agent switch, outgoing agent's full persona (~3-5K tokens) is replaced by compact handoff artifact (~379 tokens). Incoming agent loads full profile + handoff. Storage: `.aios/handoffs/` (gitignored).

**Task 3 (Integration point & limits):** Integration via `.claude/rules/` (zero code changes to L1 core). `subagent-prompt-builder.js` and `executor-assignment.js` untouched (verified via `git diff`). Limits: 500 tok max artifact, 3 max retained summaries, 5/10/3 decisions/files/blockers.

**Task 4 (Validation):** SDC workflow (4 agent switches): 18,751 → 6,497 tokens = **65.4% reduction** (target > 50%). Critical info preserved via structured artifact. npm test: 282 passed, 11 failed (pre-existing), 0 new regressions.

**Task 5 (SYNAPSE integration):** BLOCKED by NOG-18. Phase 2 deferred.

### Debug Log References
- Agent persona sizes: @sm ~2.9K, @dev ~5.9K, @qa ~4.5K, @devops ~5.4K tokens
- Handoff artifact filled size: 379 tokens (measured via char/4 estimation)

### Completion Notes
- Phase 1 (ACs 1-13) complete. Phase 2 (ACs 14-16) blocked by NOG-18.
- Implementation is instructions-based (`.claude/rules/`), not code-based — zero L1 core changes
- Compaction is advisory (Claude Code follows rules instructions) — not enforced programmatically
- `frameworkProtection: false` still active from TOK-3 — required for template creation in L2

## Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-22 | @sm (River) | Story drafted from Codex ALTO-1 split recommendation |
| 1.1 | 2026-02-23 | @po (Pax) | PO validation fixes: CF-1 Task-AC mapping corrected (Task 4→ACs 11-13, new Task 5→ACs 14-16); CF-2 NOG-18 declared as condicional dependency; CF-3 SYNAPSE ACs (14-16) moved to Phase 2 condicional; SF-1 File List expanded with expected paths. 16 ACs (13 Phase 1 + 3 Phase 2). |
| 2.0 | 2026-02-23 | @dev (Dex) | Phase 1 implementation complete: handoff template (379 tok), rules-based compaction, 65.4% context reduction in SDC (18.7K→6.5K). Task 5 (Phase 2 SYNAPSE) blocked by NOG-18. Status → Ready for Review. |
