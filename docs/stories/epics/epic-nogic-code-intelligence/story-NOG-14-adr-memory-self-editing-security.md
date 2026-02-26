# Story NOG-14: ADR — Memory Self-Editing Security Model

## Metadata

| Field | Value |
|-------|-------|
| **Story ID** | NOG-14 |
| **Epic** | NOGIC — Code Intelligence Integration |
| **Type** | Architecture Decision Record |
| **Status** | Done |
| **Priority** | P2 |
| **Points** | 2 |
| **Agent** | @architect (Aria) — primary + @qa (Quinn) — security review |
| **Quality Gate** | @pm (Morgan) |
| **Blocked By** | NOG-9 (research complete) |
| **Branch** | `feat/epic-nogic-code-intelligence` |

---

## Story

As a **framework architect**, I want a formal Architecture Decision Record defining the security model for memory self-editing (STR-5), so that when we implement AI-writable memories, there are guardrails against persistence poisoning, prompt injection, and uncontrolled context degradation.

---

## Problem Statement

NOG-9 research found that Claude Code and Cursor allow AI to write its own memories. AIOS MIS (Memory Intelligence System) is currently read-only from SYNAPSE's perspective. Enabling self-editing is a competitive gap to close, but Codex QA (finding #5) correctly identified that doing so without security guardrails creates serious risks:

### Threat Model

| Threat | Vector | Impact |
|--------|--------|--------|
| **Persistence poisoning** | Malicious prompt → agent writes injection to memory | All future sessions compromised |
| **Context degradation** | Uncontrolled memory growth → token waste | Degraded SYNAPSE performance |
| **Agent impersonation** | Agent A writes memory pretending to be Agent B | Trust violation in multi-agent system |
| **Rollback failure** | No versioning → corrupted memory unrecoverable | Permanent context damage |

### Decision Required

Before any implementation of STR-5, this ADR must define: What can be written, by whom, with what validation, and how to undo it.

---

## Acceptance Criteria

### AC1: ADR Document
- [ ] ADR created in `docs/architecture/adr/ADR-memory-self-editing.md`
- [ ] Follows standard ADR format (Context, Decision, Options, Consequences)
- [ ] Documents all 4 threats from threat model above
- [ ] Defines minimum guardrails (see AC2)
- [ ] Evaluated by @qa (Quinn) for security completeness
- [ ] **Rollback:** ADR is documentation only — no code changes to revert
- [ ] **Observability:** ADR referenced in STR-5 story as blocking dependency

### AC2: Minimum Guardrails Defined

The ADR must define policy for each guardrail:

| Guardrail | Required | Policy to Define |
|-----------|----------|-----------------|
| **Field allowlist** | MANDATORY | Which memory fields can agents write to |
| **Content validation** | MANDATORY | Rejection patterns for injection (`<system>`, `IMPORTANT:`, etc.) |
| **Versionamento** | MANDATORY | How memory versions are stored, max versions retained |
| **Audit log** | MANDATORY | Format: `{timestamp, agent, action, content_hash}`, retention period |
| **Approval gate** | EVALUATE | Is human approval required for new memories? |
| **TTL** | RECOMMENDED | Default expiration for memories (suggested: 30 days) |

### AC3: Implementation Guidance
- [ ] Define recommended implementation sequence (which guardrail first)
- [ ] Estimate effort for each guardrail
- [ ] Define test strategy for security validation
- [ ] Specify how this integrates with SYNAPSE pipeline (which layer, what budget)

### AC4: Decision Matrix
- [ ] Compare options: (A) human-gated, (B) auto with validation, (C) hybrid
- [ ] Recommend option with rationale
- [ ] Define escalation path when validation fails

---

## Scope

### IN Scope
- Architecture Decision Record document
- Threat model documentation
- Guardrail specification
- Implementation guidance and effort estimates

### OUT of Scope
- Implementation of memory self-editing (STR-5 — blocked by this ADR)
- Changes to SYNAPSE engine
- Changes to MIS (Memory Intelligence System)
- Prototype or PoC code

---

## Tasks/Subtasks

- [x] 1. Research existing memory security patterns
  - [x] 1.1 Analyze Claude Code MEMORY.md constraints (200 line cap, user can edit)
  - [x] 1.2 Analyze Cursor Memories feature (sidecar model, beta)
  - [x] 1.3 Document industry patterns for AI memory security
- [x] 2. Define threat model
  - [x] 2.1 Enumerate attack vectors specific to AIOS multi-agent context
  - [x] 2.2 Rate each by probability x impact
  - [x] 2.3 Define mitigations per vector
- [x] 3. Design guardrails
  - [x] 3.1 Field allowlist specification
  - [x] 3.2 Content validation rules (regex + heuristic)
  - [x] 3.3 Versioning schema and rollback mechanism
  - [x] 3.4 Audit log format and retention
  - [x] 3.5 Evaluate approval gate vs auto-validation trade-off
  - [x] 3.6 Define TTL policy
- [x] 4. Write ADR document
- [x] 5. @qa security review
- [x] 6. @pm approval

---

## Testing

N/A — ADR document only. Security tests will be defined in STR-5 based on this ADR.

---

## CodeRabbit Integration

> **N/A — Architecture documentation only.** No code changes.

---

## Dev Notes

### File List

| File | Action | Notes |
|------|--------|-------|
| `docs/architecture/adr/ADR-memory-self-editing.md` | CREATE | ADR document (primary deliverable) |

### Key References

- **NOG-9 Research:** `docs/stories/epics/epic-nogic-code-intelligence/story-NOG-9-uap-synapse-research.md` — findings A1-A21, specifically STR-5 and Codex QA finding #5
- **SYNAPSE MIS:** `.aios-core/core/synapse/layers/` — current memory layers (read-only)
- **Claude Code MEMORY.md:** User's `~/.claude/projects/*/memory/MEMORY.md` — reference for existing memory constraints
- **ADR Template:** Follow standard format: Title, Status, Context, Decision, Options Considered, Consequences

### Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Completion Notes
- **Task 1 (Research):** Analyzed Claude Code (200-line MEMORY.md, no validation, no audit), Cursor (community Memory Bank, no native memory), and industry systems (Mem0 vector + graph, Letta/MemGPT tiered architecture, Copilot citation validation). Identified AIOS as unique multi-agent context requiring stronger guardrails than single-agent tools.
- **Task 2 (Threat Model):** Documented 4 threats (T1-T4) with probability x impact scoring. T1 (persistence poisoning) rated 9/10 risk — highest priority. All threats rated with AIOS-specific multi-agent attack scenarios.
- **Task 3 (Guardrails):** Designed 6 guardrails (G1-G6) with full specifications: field allowlist per agent, 7 regex + 4 heuristic validation rules, 10-version rollback with SHA-256 hashing, JSONL append-only audit log (90-day retention), hybrid approval gate (auto + escalation), 30-day TTL with pin mechanism.
- **Task 4 (ADR):** Written as ADR-SYNAPSE-001. Follows project ADR format (Context, Decision, Options, Consequences). Decision: Option C (Hybrid) — auto-validation for 95%+ of writes, human notification on escalation only. 12 story points estimated across 6 implementation phases.
- **No code changes** — ADR document only, as specified in scope.

### Debug Log References
- N/A (no blocking issues)

---

## QA Results

### Review Date: 2026-02-21

### Reviewed By: Quinn (Test Architect — Security Focus)

### Security Assessment

ADR-SYNAPSE-001 e um documento de arquitetura abrangente e bem fundamentado. Cobre todos os 4 threats identificados no threat model da story com cenarios de ataque concretos e mitigacoes especificas. A decisao por Option C (Hybrid) e a escolha correta para um sistema CLI-first com YOLO mode.

### AC Compliance

| AC | Status | Notes |
|----|--------|-------|
| AC1: ADR Document | PASS | Formato ADR padrao, 4 threats, 6 guardrails, STR-5 blocking reference |
| AC2: Guardrails Defined | PASS | Todos 6 guardrails com schemas, thresholds, per-agent permissions |
| AC3: Implementation Guidance | PASS | 6-phase sequence, 12 SP estimate, test strategy, SYNAPSE integration |
| AC4: Decision Matrix | PASS | 3 opcoes comparadas, Option C recomendada com rationale e escalation path |

### Security Depth Analysis

- **Constitution Protection:** STRONG — blocked fields include `constitution` and `authority`. L0 rules NON-NEGOTIABLE.
- **Defense in Depth:** STRONG — G1 (allowlist) + G2 (validation) + G4 (audit) provide layered defense.
- **Recoverability:** STRONG — G3 (versioning) enables instant rollback. G6 (TTL) auto-expires stale entries.
- **Multi-Agent Isolation:** STRONG — per-agent field permissions in G1. Agent identity enforced in G4 audit.

### Future Notes (Non-Blocking)

1. **Rate limit para writes validos:** Adicionar max writes/session (ex: 10/session) no STR-5.
2. **Base64 heuristic check:** Considerar heuristic para content com alta proporcao alfanumerica sem espacos.
3. **Red team playbook:** Criar playbook formal com 20+ injection attempts quando STR-5 for implementado.

### Gate Status

Gate: PASS → `docs/qa/gates/NOG-14-adr-memory-self-editing-security.yml`
Quality Score: 95/100

### Recommended Status

Ready for Done — Story pronta para @pm approval (Task 6) e depois commit/push via @devops.

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-02-21 | @sm (River) | Story created — Draft. Pre-requisite for STR-5 per Codex QA finding #5. |
| 2026-02-21 | @po (Pax) | Validated GO (10/10). Status: Draft → Ready. |
| 2026-02-21 | @architect (Aria) | Tasks 1-4 complete. ADR-SYNAPSE-001 created. Status: Ready → Ready for Review. |
| 2026-02-21 | @qa (Quinn) | QA Security Review: PASS (95/100). All ACs verified, 3 future notes (LOW). Gate file created. |
| 2026-02-21 | @pm (Morgan) | PM Approval: APPROVED. ADR status Proposed → Accepted. Story ready for commit/push. |
| 2026-02-21 | @devops (Gage) | Commit b8d64d82 pushed to feat/epic-nogic-code-intelligence. |
| 2026-02-21 | @po (Pax) | Story closed. Status: Ready for Review → Done. All tasks complete. Wave 6 complete. |
