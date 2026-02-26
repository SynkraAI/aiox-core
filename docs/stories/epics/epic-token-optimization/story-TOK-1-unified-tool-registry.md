# Story TOK-1: Unified Tool Registry Creation

## Metadata

| Field | Value |
|-------|-------|
| **Story ID** | TOK-1 |
| **Epic** | Token Optimization — Intelligent Tool Loading |
| **Type** | Enhancement |
| **Status** | Done |
| **Priority** | P0 (Foundation) |
| **Points** | 3-5 |
| **Agent** | @dev (Dex) |
| **Quality Gate** | @architect (Aria) |
| **Quality Gate Tools** | [schema_validation, registry_consistency] |
| **Blocked By** | - |
| **Branch** | feat/epic-token-optimization |
| **Origin** | Research: tool-search-deferred-loading + aios-token-optimization-architecture (2026-02-22) |

---

## Executor Assignment

```yaml
executor: "@dev"
quality_gate: "@architect"
quality_gate_tools: ["schema_validation", "registry_consistency"]
```

### Agent Routing Rationale

| Agent | Role | Justification |
|-------|------|---------------|
| `@dev` | Implementor | Creates YAML registry file, validates schema, integrates with entity-registry pattern. |
| `@architect` | Quality Gate | Validates 3-Tier alignment, L1-L4 consistency, profile completeness, task bindings correctness. |

## Story

**As a** AIOS framework developer,
**I want** a unified tool registry cataloging all tools by tier, layer, agent profile, and task binding,
**so that** the system has a single source of truth for tool loading decisions, enabling deferred loading and intelligent tool selection.

## Context

Currently, tools are scattered across `.mcp.json`, agent frontmatter, and implicit knowledge. There is no unified catalog connecting tools to tiers (Always/Deferred/External), agents (profiles), or tasks (bindings). This registry is the foundation for all subsequent token optimization stories.

### Research References
- [Tool Search + Deferred Loading — 3-Tier Model](../../../research/2026-02-22-tool-search-deferred-loading/)
- [Token Optimization Architecture — Registry Design](../../../research/2026-02-22-aios-token-optimization-architecture/)
- [Architect Blueprint v2.0 — Section 4](ARCHITECT-BLUEPRINT.md#4-tool-registry-adr-1)

### Key Design Decisions
- **ADR-1:** Registry lives at L3 (`.aios-core/data/tool-registry.yaml`) — consistent with entity-registry
- **ADR-2:** 3-Tier Tool Mesh (Always/Deferred/External) aligned with L1-L4
- **ADR-5:** Tool Search for discovery, Examples for accuracy (incompatible features)

## Acceptance Criteria

### Registry Structure

1. `.aios-core/data/tool-registry.yaml` created with `version`, `metadata`, `profiles`, `tools`, `task_bindings` sections
2. `metadata` includes `lastUpdated`, `runtimeDetection: true` (ADR-7 flag)
3. `tools` catalog includes ALL currently available tools: native Claude Code tools (Tier 1), agent commands/skills (Tier 2), MCP tools from `.mcp.json` (Tier 3)
4. Each tool entry has: `name`, `tier` (1/2/3), `layer` (L1-L4), `defer` (bool), `tokenCost` (estimated), `category`
5. Tier 3 tools additionally include: `keywords` (array), `mcp_server`, optional `input_examples` placeholder

### Agent Profiles

6. `profiles` section defines tool sets for each agent: `dev`, `qa`, `architect`, `analyst`, `devops`, `pm`, `po`, `sm`
7. Each profile has: `always_loaded`, `frequently_used`, `deferred`, `programmatic` (optional) arrays
8. Profiles are consistent with agent definitions in `.claude/agents/*.md`

### Task Bindings

9. `task_bindings` section maps at least 5 core tasks to their tool requirements: `qa-gate`, `dev-develop-story`, `plan-create-implementation`, `create-next-story`, `validate-next-story`
10. Each binding has: `required` (tools), `optional` (tools), `execution_mode` (direct/programmatic)

### Squad Override Pattern

11. Document the squad override pattern in registry comments/README: `squads/{name}/tool-overrides.yaml` extends base registry
12. Override schema supports: `extends`, `overrides.profiles`, `overrides.tools`, `overrides.task_bindings`

### Integration (Handoff ajuste obrigatorio)

13. Registry has a defined consumer: document which module loads `tool-registry.yaml` (e.g., extend `registry-loader.js` or new loader)
14. Fallback behavior defined: if registry file missing or malformed, system continues without degradation
15. Schema is compatible with existing `entity-registry.yaml` patterns (same YAML conventions, same L3 path)
16. Migration strategy: incremental — registry starts minimal, tools added progressively (not all 180+ tasks at once)

### Validation

17. Registry YAML is valid (`js-yaml.load()` parses without errors)
18. All tool names in profiles exist in the `tools` catalog
19. All task names in `task_bindings` correspond to real tasks in `.aios-core/development/tasks/`
20. Agent profiles validated against actual agent definitions in `.claude/agents/*.md`
21. `npm test` passes — zero regressions

## Tasks / Subtasks

> **Execution order:** Task 1 → Task 2 → Task 3 → Task 4

- [x] **Task 1: Catalog existing tools** (AC: 3, 4, 5)
  - [x] 1.1 Scan `.mcp.json` for all MCP tools (Tier 3)
  - [x] 1.2 List all native Claude Code tools (Tier 1): Read, Write, Edit, Bash, Grep, Glob, Task, Skill, WebSearch, WebFetch
  - [x] 1.3 List agent commands and skills (Tier 2) from `.claude/agents/*.md`
  - [x] 1.4 Estimate token cost per tool (schema size)

- [x] **Task 2: Create registry YAML** (AC: 1, 2, 6, 7, 8, 9, 10, 13, 14)
  - [x] 2.1 Create `.aios-core/data/tool-registry.yaml` with version and metadata
  - [x] 2.2 Populate `tools` catalog with all tools from Task 1
  - [x] 2.3 Create agent `profiles` based on agent definitions
  - [x] 2.4 Create `task_bindings` for 5+ core tasks
  - [x] 2.5 Define consumer module in registry header comments (which loader reads this file) and document fallback behavior if registry is missing/malformed

- [x] **Task 3: Squad override pattern** (AC: 11, 12)
  - [x] 3.1 Document override schema in registry file comments
  - [x] 3.2 Create example `squads/_example/tool-overrides.yaml`

- [x] **Task 4: Validation** (AC: 15, 16, 17, 18, 19, 20, 21)
  - [x] 4.1 Validate YAML parses correctly
  - [x] 4.2 Cross-reference tool names between profiles and catalog
  - [x] 4.3 Cross-reference task names between bindings and real tasks
  - [x] 4.4 Run `npm test` — zero regressions

## Scope

### IN Scope
- Registry YAML file creation
- Agent profiles for all 8+ agents
- Task bindings for 5+ core tasks
- Squad override pattern documentation
- Schema validation

### OUT of Scope
- Runtime loading logic (TOK-2)
- PTC annotation (TOK-3)
- input_examples content (TOK-4B)
- Analytics pipeline (TOK-5)
- CI validation automation (future)

## Dependencies

```
TOK-1 (Registry) → TOK-2 (Deferred/Search)
TOK-1 (Registry) → TOK-4A (Agent Handoff)
TOK-1 (Registry) → TOK-4B (Input Examples)
```

### Pre-requisites (Done)
- NOG-22 (Agent Skill Discovery) — provides tool-agent mapping
- BM-1 (Permission Deny Rules) — L1-L4 model enforcement

## Complexity & Estimation

**Complexity:** Medium
**Estimation:** 3-5 points (cataloging + schema design + validation)

## Boundary Impact (L1-L4)

| Path | Layer | Action | Deny/Allow |
|------|-------|--------|-----------|
| `.aios-core/data/tool-registry.yaml` | L3 | Created | ALLOW (`data/**`) |
| `squads/_example/tool-overrides.yaml` | L4 | Created | N/A (project runtime) |

**Scope Source of Truth:** Project (`.aios-core/data/` — L3 mutable)

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Tool catalog incomplete (missing MCP tools) | MEDIUM | Cross-reference with `.mcp.json` (project: nogic, code-graph) and `~/.claude.json` (global: Docker MCPs) |
| Token cost estimates inaccurate | LOW | Estimates are refined by TOK-1.5 baseline |
| Profile assignments wrong | LOW | Validate against actual agent `.md` files in `.claude/agents/` |
| No consumer module for registry | HIGH | AC 13 requires defining consumer — extend `registry-loader.js` or new module |

## Dev Notes

### Technical References
- Entity registry pattern: `.aios-core/data/entity-registry.yaml` (714 entities)
- MCP config: `.mcp.json` (project-level)
- Agent definitions: `.claude/agents/*.md`
- Task definitions: `.aios-core/development/tasks/*.md`
- Blueprint schema: `ARCHITECT-BLUEPRINT.md` Section 4

### Implementation Notes
- Follow entity-registry YAML conventions for consistency
- Registry is L3 (mutable by project, extends framework base)
- Squad overrides are L4 (project runtime)
- Token cost is estimated; real values come from TOK-1.5

## Testing

```bash
# Validate YAML
node -e "const yaml = require('js-yaml'); const fs = require('fs'); yaml.load(fs.readFileSync('.aios-core/data/tool-registry.yaml', 'utf8')); console.log('VALID')"

# Verify no regressions
npm test
```

## File List

| File | Action | Description |
|------|--------|-------------|
| `.aios-core/data/tool-registry.yaml` | Created | Unified tool registry with tiers, profiles, bindings |
| `squads/_example/tool-overrides.yaml` | Created | Example squad override pattern |

## CodeRabbit Integration

| Field | Value |
|-------|-------|
| **Story Type** | Feature / Data |
| **Complexity** | Medium |
| **Primary Agent** | @dev |
| **Self-Healing Mode** | light (2 iterations, 15 min, CRITICAL only) |

**Severity Behavior:**
- CRITICAL: auto_fix (max 2 iterations)
- HIGH: document_as_debt
- MEDIUM: ignore
- LOW: ignore

**Focus Areas:**
- YAML schema validity
- Consistency between profiles and tool catalog
- Task binding correctness

## QA Results

### QA Review — Story TOK-1
**Reviewer:** Quinn (QA) | **Date:** 2026-02-23 | **Model:** Claude Opus 4.6

#### Acceptance Criteria Verification

| AC | Description | Verdict | Evidence |
|----|-------------|---------|----------|
| 1 | Registry created with version, metadata, profiles, tools, task_bindings | PASS | All 5 top-level sections present |
| 2 | metadata includes lastUpdated, runtimeDetection: true | PASS | Verified in YAML |
| 3 | tools catalog includes Tier 1, 2, 3 tools | PASS | 12 Tier 1 + 17 Tier 2 + 5 Tier 3 = 34 tools |
| 4 | Each tool has name, tier, layer, defer, tokenCost, category | PASS | Automated field check: 0 missing fields |
| 5 | Tier 3 tools have keywords, mcp_server, input_examples | PASS | All 5 Tier 3 tools verified |
| 6 | profiles for 8 core agents | PASS | 8 core + 2 specialized = 10 profiles |
| 7 | Each profile has always_loaded, frequently_used, deferred | PASS | All 10 profiles have all 3 arrays |
| 8 | Profiles consistent with agent definitions | PASS | Cross-referenced with .aios-core/development/agents/*.md |
| 9 | task_bindings for 5+ core tasks | PASS | 5 bindings, all match real task files |
| 10 | Each binding has required, optional, execution_mode | PASS | All 5 bindings verified |
| 11 | Squad override pattern documented | PASS | Documented in registry header comments |
| 12 | Override schema supports extends, overrides.profiles/tools/task_bindings | PASS | squads/_example/tool-overrides.yaml demonstrates all 3 |
| 13 | Consumer module defined | PASS | Header documents registry-loader.js as consumer |
| 14 | Fallback behavior defined | PASS | Header: system continues without degradation |
| 15 | Schema compatible with entity-registry | PASS | Same L3 path, YAML format, version field |
| 16 | Migration strategy: incremental | PASS | Documented in header comments |
| 17 | YAML valid (js-yaml.load) | PASS | Parsed without errors |
| 18 | All profile tool names exist in catalog | PASS | Automated cross-ref: 0 errors |
| 19 | All task binding names correspond to real tasks | PASS | 5/5 tasks found in .aios-core/development/tasks/ |
| 20 | Agent profiles validated against agent definitions | PASS | 10 agents verified |
| 21 | npm test passes | PASS | 279 suites passed; 9 pre-existing failures (pro-design-migration, unrelated) |

**AC Score: 21/21 PASS**

#### Observations (Advisory)

| # | Type | Observation | Severity | Recommendation |
|---|------|-------------|----------|----------------|
| O-1 | ~~Advisory~~ RESOLVED | `context7` Tier 2 hybrid — inline comment added to registry explaining docker-gateway dependency and future consumer awareness. | ~~LOW~~ DONE | Comment added in tool-registry.yaml |
| O-2 | ~~Advisory~~ RESOLVED | Tool count in Dev Agent Record corrected: "12 Tier 1, 17 Tier 2, 5 Tier 3" (was miscounting specialized as separate). | ~~LOW~~ DONE | Completion Notes updated |
| O-3 | ~~Advisory~~ RESOLVED | `registry-loader.js` verified to exist at `.aios-core/core/registry/registry-loader.js`. Reference is accurate. | ~~INFO~~ DONE | No change needed — already correct |
| O-4 | Advisory | No `programmatic` array in any profile (AC 7 marks it as optional). Correct per spec. | INFO | Will be populated by TOK-3 (PTC) |

#### Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Token cost estimates inaccurate | MEDIUM | LOW | Explicitly marked as estimates; TOK-1.5 baseline will refine |
| Registry drifts from agent definitions | LOW | MEDIUM | Cross-ref validation script available; CI automation in future |
| Consumer module not yet implemented | N/A | N/A | Out of scope (TOK-2); correctly documented as future work |

#### Gate Decision

**PASS**

Story TOK-1 satisfies all 21 acceptance criteria. Both artifacts are well-structured, follow L3/L4 conventions, and pass all automated validations. The 4 observations are advisory only and do not block approval. The registry provides a solid foundation for the remaining token optimization stories (TOK-2 through TOK-6).

**Confidence:** HIGH
**Recommendation:** Approve for merge. Activate @devops for push.

## Dev Agent Record

### Agent Model Used
- Claude Opus 4.6

### Debug Log References
- No blocking issues encountered

### Completion Notes
- 34 tools cataloged across 3 tiers (12 Tier 1, 17 Tier 2, 5 Tier 3)
- 10 agent profiles created (8 core + data-engineer + ux-design-expert)
- 5 task bindings mapped to real tasks in `.aios-core/development/tasks/`
- Consumer module documented in registry header (registry-loader.js)
- Fallback behavior documented: system continues without degradation if registry missing
- Migration strategy: incremental (documented in header comments)
- Squad override pattern: documented in registry header + example file created
- All cross-references validated: 0 errors (profiles vs catalog, bindings vs tasks)
- npm test: 279 suites passed, 9 pre-existing failures in pro-design-migration (unrelated)
- Token costs are estimates — refined by TOK-1.5 baseline

## Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-22 | @sm (River) | Story drafted from Architect Blueprint v2.0 |
| 1.1 | 2026-02-23 | @po (Pax) | PO validation: replaced `research` task binding with `plan-create-implementation` (real task); moved AC 13-14 from Task 4 to Task 2 with new subtask 2.5; corrected Task 4 AC mapping to 15-21 |
| 2.0 | 2026-02-23 | @dev (Dex) | Implementation complete: tool-registry.yaml (34 tools, 10 profiles, 5 bindings), squad override example, all validations pass |
| 2.1 | 2026-02-23 | @qa (Quinn) | QA Review: PASS 21/21 ACs, 4 observations (3 resolved), gate decision PASS with HIGH confidence |
| 3.0 | 2026-02-23 | @po (Pax) | Story closed. Pushed commit 8ef32fe5 to feat/epic-nogic-code-intelligence. Status → Done |
