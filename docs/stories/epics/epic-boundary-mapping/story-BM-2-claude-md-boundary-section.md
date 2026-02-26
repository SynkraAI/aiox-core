# Story BM-2: CLAUDE.md Boundary Section & Progressive Disclosure

## Metadata

| Field | Value |
|-------|-------|
| **Story ID** | BM-2 |
| **Epic** | Boundary Mapping & Framework-Project Separation |
| **Type** | Enhancement |
| **Status** | Done |
| **Priority** | P0 (Quick Win) |
| **Points** | 2 |
| **Agent** | @dev (Dex) |
| **Quality Gate** | @qa (Quinn) |
| **Blocked By** | - |
| **Branch** | TBD |
| **Origin** | Research: project-config-evolution (2026-02-22) |

---

## Executor Assignment

```yaml
executor: "@dev"
quality_gate: "@qa"
quality_gate_tools: ["content_review", "completeness_check"]
```

## Story

**As a** Claude Code agent working in an AIOS project,
**I want** explicit framework vs project boundary instructions in CLAUDE.md,
**so that** I understand which directories are read-only (framework) vs read-write (project) without relying on implicit convention.

## Context

Research identified that CLAUDE.md exceeds the effective instruction ceiling (~150-200 instructions). The boundary between framework and project artifacts is currently implicit. Adding an explicit section reinforces the deny rules (BM-1) with behavioral guidance.

### Research References
- [Project Config Evolution — Rec 1](../../../research/2026-02-22-project-config-evolution/03-recommendations.md#recommendation-1)
- [Framework-Project Separation — Layer 1](../../../research/2026-02-22-framework-project-separation/03-recommendations.md#layer-1-physical-boundary)

## Acceptance Criteria

1. CLAUDE.md gains a "Framework vs Project Boundary" section
2. Section lists NEVER-modify directories: `.aios-core/core/`, `.aios-core/development/tasks/`, `.aios-core/development/templates/`, `.aios-core/development/checklists/`, `.aios-core/infrastructure/`, `bin/aios.js`, `bin/aios-init.js`
3. Section lists ALWAYS-modify directories: `docs/stories/`, `squads/`, `packages/`, `tests/`
4. Section lists MUTABLE exceptions: `.aios-core/data/`, `.aios-core/development/agents/*/MEMORY.md`
5. Section references `core-config.yaml` as customization surface
6. CLAUDE.md total length does not increase by more than 30 lines (keep concise)
7. No duplicate information with existing sections (deduplicate if needed)

## Tasks / Subtasks

- [x] **Task 1: Add boundary section to CLAUDE.md** (AC: 1-5)
  - [x] 1.1 Add "Framework vs Project Boundary" section after "Estrutura do Projeto"
  - [x] 1.2 List NEVER-modify paths with brief explanations
  - [x] 1.3 List ALWAYS-modify paths
  - [x] 1.4 List mutable exceptions
  - [x] 1.5 Reference core-config.yaml

- [x] **Task 2: Optimize CLAUDE.md length** (AC: 6, 7)
  - [x] 2.1 Review for duplicate content that can be consolidated — "Mapeamento Agente → Codebase" kept (complementary, not duplicate)
  - [x] 2.2 Ensure net addition is ≤30 lines — 17 lines added (322 → 339)
  - [x] 2.3 Move verbose details to `.claude/rules/` if needed — not needed, section is 15 lines of content

## Scope

### IN Scope
- CLAUDE.md boundary section
- Content optimization (deduplication)

### OUT of Scope
- AGENTS.md creation (BM-9 backlog)
- Full CLAUDE.md restructuring to <150 lines (future story)
- Path-scoped rules migration

## Dependencies

```
BM-1 (Deny Rules) ──logical──> BM-2 (Behavioral Guidance)
```

BM-2 is NOT blocked by BM-1 (can be developed in parallel), but logically the behavioral guidance in CLAUDE.md reinforces the deterministic deny rules from BM-1. BM-1 is already Done.

## Complexity & Estimation

**Complexity:** Low
**Estimation:** 1 hour

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Net addition exceeds 30 lines | MEDIUM | Task 2 specifically addresses deduplication; move verbose content to `.claude/rules/` |
| Boundary info becomes stale if deny rules change | LOW | Reference deny rules source (settings.json) rather than duplicating full list |
| `tests/` in ALWAYS-modify list but gitignored at root | LOW | Clarify in section that project tests live in `packages/*/tests/` |

## Dev Notes

### Technical References
- Current `.claude/CLAUDE.md` is **322 lines** — AC 6 limits net addition to ≤30 lines (target: ≤352 lines after changes)
- Insert new section **after "Estrutura do Projeto"** (currently around line 60) and **before "Sistema de Agentes"**
- Existing "Estrutura do Projeto" section already lists directory tree — boundary section should NOT repeat the tree, only classify mutability
- `.claude/rules/` already contains: `agent-authority.md`, `coderabbit-integration.md`, `ids-principles.md`, `story-lifecycle.md`, `workflow-execution.md`, `mcp-usage.md` — if boundary section is verbose, extract to `.claude/rules/boundary-mapping.md`

### Content Strategy
- Use a compact table format (Layer | Path | Mutability) for maximum density
- Reference `core-config.yaml boundary.frameworkProtection` for toggle behavior
- Reference `.claude/settings.json` deny rules as enforcement mechanism
- Deduplicate: the "Mapeamento Agente → Codebase" table in "Sistema de Agentes" partially overlaps — consolidate if possible

### Paths to Classify

**NEVER modify (L1/L2 — Framework):**
| Path | Layer | Reason |
|------|-------|--------|
| `.aios-core/core/` | L1 | Framework core modules |
| `.aios-core/development/tasks/` | L2 | Framework task definitions |
| `.aios-core/development/templates/` | L2 | Framework templates |
| `.aios-core/development/checklists/` | L2 | Framework checklists |
| `.aios-core/infrastructure/` | L2 | CI/CD infrastructure |
| `bin/aios.js` | L1 | CLI entry point |
| `bin/aios-init.js` | L1 | Installer entry point |

**ALWAYS modify (L4 — Project Runtime):**
| Path | Layer | Reason |
|------|-------|--------|
| `docs/stories/` | L4 | Development stories |
| `squads/` | L4 | Squad expansions |
| `packages/` | L4 | Project packages |

**Mutable exceptions (L3 — Project Config):**
| Path | Layer | Reason |
|------|-------|--------|
| `.aios-core/data/` | L3 | Entity registry, knowledge base |
| `.aios-core/development/agents/*/MEMORY.md` | L3 | Agent persistent memory |
| `core-config.yaml` | L3 | Project customization |

## File List

| File | Action | Description |
|------|--------|-------------|
| `.claude/CLAUDE.md` | Modified | Add boundary section, optimize length |

## Testing

Manual validation (no automated tests — documentation-only changes):

```bash
# Verify line count stays within budget
wc -l .claude/CLAUDE.md  # Must be ≤352 (322 + 30)

# Verify no broken markdown
# Visual inspection of boundary section formatting

# Regression: existing tests unaffected
npm test
```

## CodeRabbit Integration

| Field | Value |
|-------|-------|
| **Story Type** | Documentation / Config |
| **Complexity** | Low |
| **Primary Agent** | @dev |
| **Self-Healing Mode** | light (2 iterations, 15 min, CRITICAL only) |

**Severity Behavior:**
- CRITICAL: auto_fix (max 2 iterations)
- HIGH: document_as_debt
- MEDIUM: ignore
- LOW: ignore

**Focus Areas:**
- Markdown quality and formatting correctness
- No duplicate content across sections
- Reference validity (paths exist, links work)
- Line count budget compliance

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6 (claude-opus-4-6)

### Debug Log References
No debug log needed — docs-only changes

### Completion Notes
- Added "Framework vs Project Boundary" section to `.claude/CLAUDE.md` after "Estrutura do Projeto" (line 87)
- Compact 4-row table covering L1-L4 layers with paths, mutability, and notes
- References `core-config.yaml` toggle and `.claude/settings.json` deny rules
- Net addition: 17 lines (322 → 339), well within AC 6 budget of 30 lines
- No duplicate content found — "Mapeamento Agente → Codebase" is complementary (agent→path vs path→mutability)
- No content moved to `.claude/rules/` — section is already concise
- npm test: 269 suites passed, 6681 tests passed, 13 pre-existing failures unrelated to BM-2
- **QA Fix Round 1:** Expanded L2 abbreviated paths to full form, added `workflows/` to L2, added `constitution.md` to L1, added `tests/` to L4. Line count unchanged (339). npm test: 274 suites, 6805 tests passed, 8 pre-existing failures

## QA Results

### Gate Decision: CONCERNS

**Reviewer:** @qa (Quinn) | **Date:** 2026-02-22 | **Model:** Claude Opus 4.6

### AC Traceability

| AC | Verdict | Notes |
|----|---------|-------|
| AC 1 — Boundary section exists | PASS | Section at line 87, well-positioned after "Estrutura do Projeto" |
| AC 2 — NEVER-modify dirs listed | CONCERNS | 5/7 paths present. Missing: `workflows/**`, `constitution.md`. L2 uses abbreviated `templates/`, `checklists/` (ambiguous without `.aios-core/development/` prefix) |
| AC 3 — ALWAYS-modify dirs listed | CONCERNS | `tests/` specified in AC but omitted from L4 row. Only `docs/stories/`, `packages/`, `squads/` present |
| AC 4 — Mutable exceptions listed | PASS | `.aios-core/data/`, `agents/*/MEMORY.md`, `core-config.yaml` all present |
| AC 5 — References core-config.yaml | PASS | Toggle documented with `boundary.frameworkProtection: true/false` |
| AC 6 — ≤30 lines net addition | PASS | 17 lines added (322→339), well within budget |
| AC 7 — No duplicate content | PASS | "Mapeamento Agente → Codebase" is complementary (agent→path vs path→mutability) |

### Cross-Reference: settings.json Deny Rules vs Boundary Section

| Issue | Severity | Details |
|-------|----------|---------|
| `workflows/**` omitted from L2 | MEDIUM | `.aios-core/development/workflows/**` has deny rules but is not listed in boundary section |
| `constitution.md` omitted from L1 | LOW | `.aios-core/constitution.md` has deny rules but is not in L1 row (already referenced in Constitution section above) |
| L2 abbreviated paths | MEDIUM | `templates/`, `checklists/` without `.aios-core/development/` prefix could confuse agents about exact scope |
| `tests/` missing from L4 | LOW | AC 3 specifies `tests/` as ALWAYS-modify but omitted. Mitigated: project tests live in `packages/*/tests/` which is covered by `packages/` |

### Quality Checks

| Check | Result |
|-------|--------|
| Markdown formatting | PASS — table renders correctly, consistent styling |
| Reference validity | PASS — `settings.json` and `agent-authority.md` exist |
| Line count budget | PASS — 17/30 lines used |
| No regressions | PASS — npm test: 269 suites, 6681 tests passed |
| Content accuracy | CONCERNS — missing paths vs deny rules |
| Deduplication | PASS — no duplicate content |

### Recommendation

The boundary section delivers clear value and is well-structured. The CONCERNS are about **completeness** rather than **correctness** — what is present is accurate. The missing paths (`workflows/**`, `constitution.md`) and abbreviated paths (`templates/`, `checklists/`) are low-risk because deny rules in `settings.json` enforce the actual protection regardless.

**Options for @dev:**
1. **Fix now** (recommended): Add `workflows/` to L2, expand abbreviated paths to full form, add `tests/` note. Stays within 30-line budget.
2. **Accept as-is**: Document gaps as known limitations. Deny rules still protect.

### Verdict: CONCERNS — Approve with recommended fixes before push

---

### Re-Review (Round 2)

**Reviewer:** @qa (Quinn) | **Date:** 2026-02-22 | **Trigger:** @dev applied all 4 recommended fixes

### Fix Verification

| Previous Issue | Fix Applied | Verified |
|---------------|-------------|----------|
| `workflows/**` omitted from L2 | Added `.aios-core/development/workflows/` | PASS |
| `constitution.md` omitted from L1 | Added `.aios-core/constitution.md` | PASS |
| L2 abbreviated paths | Expanded to `.aios-core/development/templates/`, `.aios-core/development/checklists/` | PASS |
| `tests/` missing from L4 | Added `tests/` to L4 row | PASS |

### AC Re-Traceability

| AC | Verdict |
|----|---------|
| AC 1 — Boundary section exists | PASS |
| AC 2 — NEVER-modify dirs listed | PASS — All 9 deny rule paths now mapped (4/4 L1, 5/5 L2) |
| AC 3 — ALWAYS-modify dirs listed | PASS — `docs/stories/`, `packages/`, `squads/`, `tests/` |
| AC 4 — Mutable exceptions listed | PASS |
| AC 5 — References core-config.yaml | PASS |
| AC 6 — ≤30 lines net addition | PASS — 17 lines (339 total) |
| AC 7 — No duplicate content | PASS |

### Quality Checks

| Check | Result |
|-------|--------|
| Deny rules cross-reference | PASS — 100% coverage (9/9 paths) |
| Allow rules cross-reference | PASS — L3 matches all 3 allow patterns |
| Markdown formatting | PASS |
| Line count budget | PASS — 17/30 |
| No regressions | PASS — 274 suites, 6805 tests |

### Gate Decision: PASS

All 7 acceptance criteria met. All previous CONCERNS resolved. Ready for commit and push via @devops.

## Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-22 | @pm (Morgan) | Story drafted from tech-search research |
| 1.1 | 2026-02-22 | @po (Pax) | Validated: CF-1 fixed (CodeRabbit Integration added), SF-1 to SF-6 fixed (Dependencies, Risks, Dev Notes, Testing, QA Results, Dev Agent Record sections added). NH-1 noted (tests/ path clarification). Status Draft → Ready |
| 1.2 | 2026-02-22 | @dev (Dex) | Implementation complete: Task 1 (boundary section added to CLAUDE.md with L1-L4 table), Task 2 (17 lines net addition, no deduplication needed). npm test zero regressions. Status Ready → Ready for Review |
| 1.3 | 2026-02-22 | @qa (Quinn) | QA Review: CONCERNS — 5 of 7 AC pass, AC 2 and AC 3 have completeness gaps (missing workflows/**, constitution.md, tests/ paths; abbreviated L2 paths). Recommend fixes before push. |
| 1.4 | 2026-02-22 | @dev (Dex) | QA fixes applied: L1 +constitution.md, L2 expanded to full paths +workflows/, L4 +tests/. Line count unchanged (339). Zero regressions. |
| 1.5 | 2026-02-22 | @qa (Quinn) | Re-review (Round 2): All 4 fixes verified. 7/7 AC PASS. 9/9 deny rules mapped. Gate decision: PASS. |
| 1.6 | 2026-02-22 | @po (Pax) | Story closed via `*close-story`. Status → Done. Commit/push pending via @devops. |
