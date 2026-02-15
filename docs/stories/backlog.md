# Backlog

**Generated:** 2025-12-05T18:00:00.000Z
**Updated:** 2026-02-14T16:30:00.000Z
**Total Items:** 17 (active)
**Current Sprint:** 19 (CI Optimization & Cost Reduction) 🚀 IN PROGRESS
**Stories Completed:** 51 (Story 3.11c, Story 5.10, Story OSR-2, Story OSR-3, Story OSR-6, Story OSR-7, Story OSR-8, Story OSR-9, **Story OSR-10**, Story 6.9, Story 6.10, Story 6.11, Story 6.12, Story 6.13, **Story 6.16**, **Story 6.18**, **Story 6.19**, Story SQS-0, Story SQS-1, Story SQS-2, Story SQS-3, Story SQS-4, **Story SQS-5**, **Story SQS-6**, **Story SQS-7**, **Story SQS-8**, Story SQS-9, **Story SQS-10**, **Story WIS-2**, **Story WIS-3**, **Story WIS-4**, **Story WIS-5**, **Story WIS-9**, **Story WIS-10**, **Story WIS-11**, **Story WIS-15**, **Story TD-1**, **Story TD-2**, **Story TD-3**, **Story TD-4**, **Story TD-5**, TD-6/YAML via TD-2, **Story HCS-1**, **Story HCS-2**, Story 3.0, Story 4.1, **Story TD-6**, **Story PRO-1**, **Story PRO-5**, **Story PRO-6**, **Story INS-3.1**, **Story INS-3.3**)
**Latest Release:** [v3.10.0](https://github.com/SynkraAI/aios-core/releases/tag/v3.10.0) (2025-12-30)

> **Roadmap Sync Reminder:** When completing sprints, update the [AIOS Public Roadmap](https://github.com/orgs/SynkraAI/projects/1) and [ROADMAP.md](../../ROADMAP.md). See sync checklist in ROADMAP.md.

---

## 📊 Summary by Type

- 📌 **Follow-up**: 0
- 🔧 **Technical Debt**: 16 (3 existing + 11 from XREF analysis + 2 from QA INS-3.1)
- ✨ **Enhancement**: 6 (2 existing + 2 from XREF analysis + 1 PO task + 1 handoff investigation)
- 🔴 **Critical**: 1 (@qa broken task references)
- ✅ **Resolved**: 53 (includes 4 archived Sprint 4 items: 1732891500001, 1732891500002, 1732891500003, 1732978800001)
- ❌ **Obsolete**: 1 (removed from active backlog)
- 📁 **Archived**: 4 items moved to `backlog/archive/` on 2026-01-04

---

## 🔴 Critical (1 item)

### Fix @qa Agent 9 Broken Task References (ID: 1738700000001) - 📍 BACKLOG

> **Source:** [AIOS-XREF-001](active/AIOS-XREF-001.story.md) Cross-Reference Analysis
> **Created:** 2026-02-05 | **Priority:** 🔴 Critical | **Sprint:** TBD

**Problem:** The `@qa` agent definition (`agents/qa.md`) references 9 task files using non-prefixed names that do NOT match actual filenames on disk.

| Agent Reference | Actual File on Disk | Status |
|----------------|---------------------|--------|
| `generate-tests.md` | `qa-generate-tests.md` | BROKEN |
| `manage-story-backlog.md` | `qa-backlog-add-followup.md` | BROKEN |
| `nfr-assess.md` | `qa-nfr-assess.md` | BROKEN |
| `review-proposal.md` | `qa-review-proposal.md` | BROKEN |
| `review-story.md` | `qa-review-story.md` | BROKEN |
| `risk-profile.md` | `qa-risk-profile.md` | BROKEN |
| `run-tests.md` | `qa-run-tests.md` | BROKEN |
| `test-design.md` | `qa-test-design.md` | BROKEN |
| `trace-requirements.md` | `qa-trace-requirements.md` | BROKEN |

**Impact:** If dependency resolution does NOT apply automatic prefix fallback, @qa commands fail to find task files.

**Fix:** Update `agents/qa.md` to use the full prefixed names matching actual files.

**Effort:** 1 hour | **Tags:** `xref-analysis`, `broken-reference`, `qa-agent`

---

### ~~OSR-10: Release Checklist Final~~ - ✅ COMPLETE

**Status:** ✅ Released as v2.2.3 (2025-12-22)
**Release:** [v2.2.3](https://github.com/SynkraAI/aios-core/releases/tag/v2.2.3)

**Completed Tasks:**
1. [x] **@devops:** Execute GitHub manual config (5 items) ✅
2. [x] **@dev:** Run smoke test on clean clone ✅
3. [x] **@po:** Create release notes ✅
4. [x] **Stakeholder:** Final GO approval ✅
5. [x] **@devops:** Execute release (tag, publish) ✅

**Result:** 🎉 Epic OSR Complete - AIOS is Open-Source Ready!

---

## ✨ Enhancement (4 items)

| ID | Type | Title | Priority | Related Story | Effort | Tags | Created By | Sprint |
|----|------|-------|----------|---------------|--------|------|------------|--------|
| 1733400000001 | ✨ Enhancement | Investigation: Squads System Enhancement | 🟡 Medium | **[Epic SQS](../epics/current/epic-sqs-squad-system.md)** | 56-72 hours | `epic`, `squads`, `architecture`, `cli`, `loader`, `synkra` | @po | Sprint 7 |
| 1733400000002 | ✨ Enhancement | Investigation: Refatorar hybrid-ops Squad com Process Mapping Framework | 🟡 Medium | - | 4-8 hours | `investigation`, `squad`, `hybrid-ops`, `process-mapping`, `pedro-valerio` | @po | TBD |
| 1738600000057 | ✨ Enhancement | Investigation: Separate Core, Configuration, and User Extensions | 🟡 Medium | [Issue #57](https://github.com/SynkraAI/aios-core/issues/57) | 8-16 hours | `investigation`, `architecture`, `config`, `extensions`, `immutability` | @architect | TBD |
| 1738700000099 | ✨ Enhancement | PO Task: Story Lifecycle Closure (*close-story) | 🟢 Low | Story PRO-5 retrospective | 2-4 hours | `po-agent`, `story-lifecycle`, `backlog-management`, `automation` | @po | ✅ Done |
| 1738700000014 | ✨ Enhancement | Investigation: Universal Handoff System (`/handoff @agent`) | 🟡 Medium | AIOS-TRACE-001 | 8-16 hours | `investigation`, `handoff`, `cross-agent`, `context-transfer`, `claude-command` | @devops | TBD |

### ~~Investigation Squads System (ID: 1733400000001)~~ → **Epic SQS Created**

> **Status:** Promoted to Epic SQS on 2025-12-18

**Este item foi transformado em Epic completo:** [Epic SQS - Squad System Enhancement](../epics/current/epic-sqs-squad-system.md)

**Epic SQS Summary:**
- **8 Stories** totalizando 56-72 horas de esforço
- **Sprint Target:** Sprint 7 (post OSR-10)
- **Scope:** Squad Loader, CLI Scaffolding, JSON Schema Validator, Synkra Integration, Registry, Migration Tool

**Stories Planejadas:**
| Sprint 7 - Foundation | Sprint 8 - Integration |
|-----------------------|------------------------|
| SQS-1: Architecture Validation | SQS-5: SquadSyncService |
| SQS-2: Squad Loader | SQS-6: Registry Integration |
| SQS-3: JSON Schema Validator | SQS-7: Migration Tool |
| SQS-4: CLI Scaffolding | SQS-8: Documentation |

**BLOCKER:** Requer validação do @architect (Aria) para questões arquiteturais (Q1-Q4 no Epic).

📄 **[Ver Epic Completo](../epics/current/epic-sqs-squad-system.md)**

---

### Investigation hybrid-ops Squad (ID: 1733400000002) - 📍 SPRINT 13 (Investigation Phase)

> **⚠️ Migration Notice:** Este enhancement será executado no projeto **synkra** (repositório separado), não mais em aios-core.
>
> **🎯 Sprint 13 Target:** Iniciar investigação e criar plano de migração (6h estimado)

**Objetivo:** Refatorar `hybrid-ops` como um Squad oficial usando o novo framework de Process Mapping.

**Arquivos de Referência (a serem criados no projeto synkra):**
- `docs/standards/AGNOSTIC-PROCESS-MAPPING-FRAMEWORK.md`
- `docs/standards/DECISION-TREE-GENERATOR-SYSTEM-PROMPT.md`
- `docs/standards/LATTICEWORK-PROCESS-MAPPING.md`

**Checklist de Investigação:**
- [ ] Analisar estrutura atual dos 9 agentes em `hybrid-ops/agents/`
- [ ] Converter para formato Squad (`squad.yaml`)
- [ ] Mapear dependências com AIOS-Fullstack core
- [ ] Identificar gaps com novos standards de process mapping
- [ ] Integrar AGNOSTIC-PROCESS-MAPPING-FRAMEWORK
- [ ] Integrar DECISION-TREE-GENERATOR
- [ ] Integrar LATTICEWORK-PROCESS-MAPPING
- [ ] Documentar plano de migração
- [ ] Publicar como Squad oficial

**Agentes a Migrar (9 total):**
1. `process-mapper-pv.md` - Principal candidato
2. `process-architect-pv.md` - Arquitetura
3. `executor-designer-pv.md` - Decision tree
4. `workflow-designer-pv.md` - Latticework
5. `qa-validator-pv.md` - Validation
6. `clickup-engineer-pv.md` - Integração
7. `agent-creator-pv.md` - Templates
8. `documentation-writer-pv.md` - Output
9. `validation-reviewer-pv.md` - Compliance

**Destino:** `SynkraAi/synkra` (projeto separado)

---

### Investigation: Separate Core, Configuration, and Extensions (ID: 1738600000057) - 📍 BACKLOG

> **Source:** [GitHub Issue #57](https://github.com/SynkraAI/aios-core/issues/57)
> **Created:** 2026-02-03 | **Priority:** 🟡 Medium | **Sprint:** TBD

**Objective:** Investigate and design architecture for clear separation between:
- **Core (immutable)** - `.aios-core/` directory
- **Configuration (project-level)** - `.aios-core-config.json`
- **Extensions (user-defined)** - `.aios-extends/`

**Key Questions to Investigate:**
1. How does current AIOS handle config files (core-config.yaml vs project configs)?
2. How is memory layer data stored? Should it be in `.aios/` or separate?
3. What happens to user customizations during `npx aios-core` upgrades?
4. Should we support JSON only or also YAML for configuration?
5. How strictly should Core immutability be enforced?

**Investigation Checklist:**
- [ ] Map current configuration files and their locations
- [ ] Analyze `.aios/` directory structure vs `.aios-core/`
- [ ] Document memory layer storage patterns
- [ ] Review brownfield upgrader behavior with user modifications
- [ ] Propose directory structure for separation
- [ ] Create ADR for architecture decision
- [ ] Define migration path from current structure

**Related Systems:**
- `src/installer/brownfield-upgrader.js` - Upgrade handling
- `.aios-core/core-config.yaml` - Core configuration
- `.aios/` - Project runtime data
- `scripts/generate-install-manifest.js` - Manifest generation

**Expected Deliverables:**
- ADR document in `docs/architecture/adr/`
- Updated documentation for user extension patterns
- Potential Story for implementation if investigation validates proposal

---

### ~~PO Task: Story Lifecycle Closure (ID: 1738700000099)~~ - ✅ COMPLETE

> **Source:** Story PRO-5 retrospective
> **Created:** 2026-02-05 | **Completed:** 2026-02-05 | **Sprint:** N/A (immediate implementation)

**Objective:** Create a PO task (`*close-story`) that completes the story lifecycle, complementing `*validate-story-draft`.

**Lifecycle Flow:**
```text
*validate-story-draft (START) --> Development --> PR/Merge --> *close-story (END)
        |                                                            |
        v                                                            v
   Story: Draft -> Approved                              Story: Done + Next suggested
```

**Deliverables:**
- [x] Task file: `.aios-core/development/tasks/po-close-story.md`
- [x] Command registered in `po.md` agent definition
- [x] Dependencies updated in agent YAML
- [x] Quick Commands section updated
- [x] Typical Workflow section updated

**Features:**
- Mark story as Done with PR/commit reference
- Add changelog entry with merge info
- Update Epic index with completion status
- Suggest next story from same epic or backlog

**Usage:**
```bash
# Interactive mode (default)
*close-story epics/epic-pro-aios-pro-architecture/story-pro-5-repo-bootstrap.md

# With PR info
*close-story story-pro-5.md --pr 84 --commit ce19c81a

# YOLO mode
*close-story story-pro-5.md --mode yolo
```

---

### Investigation: Universal Handoff System (ID: 1738700000014) - 📍 BACKLOG

> **Source:** AIOS-TRACE-001 investigation insights
> **Created:** 2026-02-05 | **Priority:** 🟡 Medium | **Sprint:** TBD

**Objective:** Investigate and design a universal handoff task/command that enables seamless context transfer between any AIOS agents.

**Core Concept:**
```bash
# Command syntax
/handoff @target-agent

# With context indicators
/handoff @dev "Complete implementation of IDS-2 Decision Engine"
/handoff @qa --context story-ids-2.md
```

**Investigation Questions:**

1. **Best Practices Research:**
   - How do other AI agent frameworks handle agent-to-agent context transfer?
   - What are established patterns for session handoffs in multi-agent systems?
   - How do human teams handle handoffs effectively (Agile, DevOps)?

2. **Existing Frameworks:**
   - LangChain agent delegation patterns
   - AutoGen multi-agent communication
   - CrewAI task handoff mechanisms
   - Microsoft Semantic Kernel agent orchestration
   - OpenAI Assistants API handoff patterns

3. **AIOS Integration:**
   - How to integrate with Claude Code's `/skill` command system?
   - How to preserve conversation context across terminal sessions?
   - How to handle file references and code context?
   - How to create handoff document automatically (like ADR roundtable handoff)?

4. **Target System Features:**
   - Specify target agent (`@agent` syntax)
   - Optional context message (brief description)
   - Optional file/story references
   - Auto-generate handoff document
   - Support for "anyone" handoffs (broadcast)
   - Recipient acknowledgment tracking

**Proposed Deliverables:**
- [ ] Research document: `docs/architecture/adr/adr-handoff-system.md`
- [ ] Task file: `.aios-core/development/tasks/handoff.md`
- [ ] Claude command integration: `/handoff` skill
- [ ] Handoff template: `.aios-core/product/templates/handoff-tmpl.md`

**User Request (verbatim):**
> "uma task geral do aios que serve para qualquer agente. chamado hand-off. Investigar melhores práticas e se já existem frameworks e projetos para isso. e que seja uma task que a gente possa chamar a qualquer momento. também como um comando do claude. /handoff @agent Com um sistema de indicações de para quem é aquele handoff."

**Effort:** 8-16 hours (investigation + design + implementation)

**Tags:** `investigation`, `handoff`, `cross-agent`, `context-transfer`, `claude-command`

---

## 🔍 Cross-Reference Analysis Findings (AIOS-XREF-001) 🆕

> **Source:** [AIOS-XREF-001](active/AIOS-XREF-001.story.md) - Complete Framework Artifact Cross-Reference Analysis
> **Analysis Date:** 2026-02-05 | **Scope:** ~745 files across 25 entity types
> **Full Report:** [AIOS-COMPLETE-CROSS-REFERENCE-ANALYSIS.md](../guides/workflows/AIOS-COMPLETE-CROSS-REFERENCE-ANALYSIS.md)

### 🟠 High Priority

| ID | Type | Title | Priority | Effort | Tags |
|----|------|-------|----------|--------|------|
| 1738700000002 | 🔧 Tech Debt | Standardize 3 duplicate task file pairs | 🟠 High | 2h | `naming-convention`, `duplicate-tasks` |

### 🟡 Medium Priority

| ID | Type | Title | Priority | Effort | Tags |
|----|------|-------|----------|--------|------|
| 1738700000003 | 🔧 Tech Debt | Archive 5 deprecated standards documents | 🟡 Medium | 30min | `cleanup`, `deprecated-docs` |
| 1738700000004 | 🔧 Tech Debt | Consolidate 3 elicitation file duplicates | 🟡 Medium | 1h | `duplication`, `elicitation` |
| 1738700000005 | 🔧 Tech Debt | Wire or document 7 orphaned SQL templates | 🟡 Medium | 2h | `orphan`, `sql-templates` |
| 1738700000007 | 🔧 Tech Debt | Implement or remove phantom memory modules | 🟡 Medium | 4h | `phantom-dependency`, `memory-layer` |
| ~~1738700000008~~ | ~~✨ Enhancement~~ | ~~Wire permissions/ system to CLI and agent activation~~ | ~~🟡 Medium~~ | ~~4h~~ | ~~`permissions`, `integration`~~ → **Subsumed by [ACT-4](epics/epic-activation-pipeline/story-act-4-permission-mode-integration.md)** |

### 🟢 Low Priority

| ID | Type | Title | Priority | Effort | Tags |
|----|------|-------|----------|--------|------|
| 1738700000006 | 🔧 Tech Debt | Archive 5 dead migration scripts | 🟢 Low | 30min | `cleanup`, `dead-code` |
| 1738700000009 | 🔧 Tech Debt | Resolve 3 ghost directories in .aios-core/ | 🟢 Low | 1h | `ghost-directory`, `cleanup` |
| 1738700000010 | 🔧 Tech Debt | Add missing test coverage for 10+ core modules | 🟢 Low | 8h | `testing`, `coverage` |
| 1738700000011 | ✨ Enhancement | Complete config migration to L1-L4 hierarchy | 🟢 Low | 8h | `config-migration`, `adr-pro-002` |
| 1738700000012 | 🔧 Tech Debt | Integrate or archive 5 orphaned infra scripts | 🟢 Low | 4h | `orphan`, `infrastructure` |
| 1738700000013 | 🔧 Tech Debt | Wire 2 orphaned core modules (ideation, timeline) | 🟢 Low | 4h | `orphan`, `core-modules` |
| 1739520000001 | 🔧 Tech Debt | Add directory cleanup to rollbackScaffold() | 🟢 Low | 1h | `qa-feedback`, `pro-installer`, `rollback` |
| 1739520000002 | 🔧 Tech Debt | Add edge case tests for pro-scaffolder (force, hash-differs) | 🟢 Low | 1h | `qa-feedback`, `pro-installer`, `testing` |

### XREF Totals

| Metric | Count |
|--------|-------|
| Critical items | 1 (9 broken @qa refs) |
| High items | 1 (duplicate tasks) |
| Medium items | 5 |
| Low items | 8 |
| **Total new items** | **15** |
| **Total estimated effort** | **~41 hours** |

---

## 🚀 Sprint 19: CI Optimization & Cost Reduction 🆕 IN PROGRESS (Started 2026-01-05)

**Goal:** Otimizar GitHub Actions para reduzir custos e acelerar feedback loop

| Story | Title | Lead | Effort | Status |
|-------|-------|------|--------|--------|
| **6.1** | [GitHub Actions Cost Optimization](v2.1/sprint-6/story-6.1-github-actions-optimization.md) | @devops | 8-12h | 🔄 In Progress |

**Sprint Scope:**
1. 🔴 Workflow Consolidation - Unificar lint/typecheck/test em único workflow
2. 🔴 Path Filters - Skip CI para docs-only changes
3. 🟡 Matrix Optimization - Full matrix apenas em main
4. 🟡 Concurrency - Cancelar runs obsoletas
5. 🟢 Documentation - README de workflows

**Target Metrics:**
| Métrica | Antes | Target |
|---------|-------|--------|
| Jobs por PR | ~38 | ~12-15 |
| Tempo CI | 15-25 min | 5-8 min |
| Custo mensal | $50-100 | $15-30 |

**Release Plan:** v3.11.0 após conclusão (inclui TD-6 + 6.1)

---

## 🏁 Sprint 18: CI Stability & Tech Debt ✅ COMPLETE (2026-01-05)

**Goal:** Estabilizar CI pipeline e resolver tech debt crítico pós-HCS-2

| Story | Title | Lead | Effort | Status |
|-------|-------|------|--------|--------|
| **TD-6** | [CI Stability & Test Coverage](v2.1/sprint-18/story-td-6-ci-stability.md) | @devops | 10-16h | ✅ Done |

**Sprint Results:**
1. ✅ Resolver Jest Worker Process Leak (Issue #34) - PR #35 merged
2. ✅ Aumentar coverage core para 60% (via scope optimization + 176 testes) - PR #36 merged
3. ✅ Investigar isolated-vm macOS crash - ADR documentado

---

## 🔧 Technical Debt (14 items) - 🎯 ACTIVE ITEMS

| ID | Type | Title | Priority | Related Story | Effort | Sprint | Created By |
|----|------|-------|----------|---------------|--------|--------|------------|
| ~~1736001500036~~ | ~~🔧 Technical Debt~~ | ~~**CI Stability & Test Coverage**~~ | ~~🔴 High~~ | [TD-6](v2.1/sprint-18/story-td-6-ci-stability.md) ✅ Done | ~~10-16h~~ | ✅ Done | @po |
| ~~1736001500034~~ | ~~🔧 Technical Debt~~ | ~~Jest Worker Process Leak Investigation~~ | ~~🟡 Medium~~ | [Issue #34](https://github.com/SynkraAI/aios-core/issues/34) → TD-6 Task 1 ✅ | ~~2-4h~~ | ✅ Done | @devops |
| ~~1736001500035~~ | ~~🔧 Technical Debt~~ | ~~Health-Check Module Test Coverage Improvement~~ | ~~🟢 Low~~ | HCS-2 → TD-6 Task 2 ✅ | ~~4-8h~~ | ✅ Done | @devops |
| ~~1734912000004~~ | ~~🔧 Technical Debt~~ | ~~IDE Sync Pre-commit Auto-Stage (Husky Setup)~~ | ~~🟡 Medium~~ | [TD-4](v2.1/sprint-13/story-td-4-ide-sync-precommit.md) ✅ Done | ~~1h~~ | ✅ Done | @qa |
| ~~1734912000005~~ | ~~🔧 Technical Debt~~ | ~~Fix YAML Parse Warnings in Agent Files~~ | ~~🟢 Low~~ | [TD-5](v2.1/sprint-15/story-td-5-yaml-parse-warnings.md) ✅ Done | ~~1h~~ | ✅ Done | @qa |
| ~~1734912000006~~ | ~~🔧 Technical Debt~~ | ~~Cleanup Orphaned Legacy IDE Command Files~~ | ~~🟢 Low~~ | [TD-1](v2.1/sprint-13/story-td-1-code-cleanup.md) ✅ Done | ~~30 min~~ | ✅ Done | @qa |
| ~~1734530400001~~ | ~~🔧 Technical Debt~~ | ~~Scripts Path Consolidation & Documentation Fix~~ | ~~🔴 High~~ | [6.16](v2.1/sprint-6/story-6.16-scripts-path-consolidation.md) ✅ Done | ~~4-6 hours~~ | ✅ Done | @architect |
| ~~1734912000001~~ | ~~🔧 Technical Debt~~ | ~~ESLint `_error` Variable Warning Fix~~ | ~~🟢 Low~~ | [TD-1](v2.1/sprint-13/story-td-1-code-cleanup.md) ✅ Done | ~~15 min~~ | ✅ Done | @qa |
| ~~1734912000002~~ | ~~🔧 Technical Debt~~ | ~~YAML Library Standardization (js-yaml vs yaml)~~ | ~~🟢 Low~~ | [TD-2](v2.1/sprint-13/story-td-2-yaml-consolidation.md) ✅ Done | ~~1-2 hours~~ | ✅ Done | @qa |
| ~~1733679600001~~ | ~~🔧 Technical Debt~~ | ~~GitHub Actions Cost Optimization~~ | ~~🟡 Medium~~ | [TD-3](v2.1/sprint-13/story-td-3-ci-quality.md) ✅ Done | ~~4-6 hours~~ | ✅ Done | @devops |
| ~~1733682000001~~ | ~~🔧 Technical Debt~~ | ~~Increase Test Coverage to 80%~~ | ~~🟡 Medium~~ | [TD-3](v2.1/sprint-13/story-td-3-ci-quality.md) ⏸️ Deferred | ~~8-12 hours~~ | ⏸️ Deferred to TD-4 | @dev |
| 1763298742141 | 🔧 Technical Debt | ~~Add unit tests for decision-log-generator~~ | ✅ Done | [4.1 Task 1](v2.1/sprint-4/story-4.1-technical-debt-cleanup.md) | 2 hours | `testing`, `decision-logging` | @dev |
| 1732891500001 | 🔧 Technical Debt | ~~Core Module Security Hardening~~ | ✅ Done | [4.1 Task 2](v2.1/sprint-4/story-4.1-technical-debt-cleanup.md) | 4 hours | `security`, `core`, `coderabbit` | @qa |
| 1732891500002 | 🔧 Technical Debt | ~~Core Module Code Quality Fixes~~ | ✅ Done | [4.1 Task 3](v2.1/sprint-4/story-4.1-technical-debt-cleanup.md) | 2 hours | `quality`, `core`, `coderabbit` | @qa |
| 1732978800001 | 🔧 Technical Debt | ~~Fix Pre-existing Test Suite Failures~~ | ✅ Done | [4.1 Task 4](v2.1/sprint-4/story-4.1-technical-debt-cleanup.md) | 30 min | `testing`, `technical-debt` | @github-devops |
| 1733427600001 | 🔧 Technical Debt | ~~Fix Flaky CI Tests (migration-backup, environment-configuration)~~ | ✅ Done | [PR #27](https://github.com/Pedrovaleriolopez/aios-fullstack/pull/27) | 2-4 hours | `testing`, `ci`, `flaky-tests`, `infrastructure` | @github-devops |

### IDE Sync Pre-commit Auto-Stage (ID: 1734912000004) - 🆕 NEW

**Created:** 2025-12-22 | **Priority:** 🟡 Medium | **Sprint:** TBD
**Source:** QA Review Story 6.19 (AC6.19.8 Partial)

**Problem:** O lint-staged está configurado para executar `npm run sync:ide` quando agentes são modificados, mas os arquivos gerados não são automaticamente adicionados ao staging area do git.

**Comportamento Atual:**
```json
".aios-core/development/agents/*.md": [
  "npm run sync:ide"
]
```

**Comportamento Desejado:**
```json
".aios-core/development/agents/*.md": [
  "npm run sync:ide",
  "git add .claude/commands/AIOS/agents/*.md .cursor/rules/agents/*.md ..."
]
```

**Problema:** O segundo comando no lint-staged pode falhar se os arquivos não existirem ainda. Requer configuração mais robusta do husky.

**Opções de Correção:**
1. Adicionar script wrapper que faz sync + git add com error handling
2. Usar husky hook separado (`post-commit` ou `prepare-commit-msg`)
3. Modificar o script `sync:ide` para fazer git add automaticamente

**Action Items:**
- [ ] Criar script `scripts/sync-ide-and-stage.js`
- [ ] Atualizar lint-staged para usar o novo script
- [ ] Testar fluxo de commit completo
- [ ] Documentar no README.md

---

### ~~Fix YAML Parse Warnings in Agent Files (ID: 1734912000005)~~ ✅ RESOLVED

**Created:** 2025-12-22 | **Resolved:** 2025-12-29 | **Sprint:** 15
**Source:** QA Review Story 6.19

**Resolution:** Implemented as **[Story TD-5](v2.1/sprint-15/story-td-5-yaml-parse-warnings.md)** - Fix YAML Parse Warnings.

**Problem:** Durante o sync de IDEs, 2 agentes geravam warnings de YAML parse devido a sintaxe complexa.

**What was done:**
- [x] Identificar todos os agentes com YAML warnings (ux-design-expert.md, aios-master.md)
- [x] Reformatar `ux-design-expert.md` (lines 329-340): pipe-separated options → proper YAML arrays
- [x] Reformatar `aios-master.md` (lines 140-185): inline commands → name/args/description structure
- [x] Verificar que sync passa sem warnings
- [x] Tests passing (2486 passed)

**Result:** `npm run sync:ide` runs clean with no YAML parse warnings

---

### ~~Cleanup Orphaned Legacy IDE Command Files (ID: 1734912000006)~~ ✅ RESOLVED

**Created:** 2025-12-22 | **Resolved:** 2025-12-26 | **Sprint:** 13
**Source:** QA Review Story 6.19

**Resolution:** Consolidated into **[Story TD-1](v2.1/sprint-13/story-td-1-code-cleanup.md)** - Code Cleanup Quick Wins.

**Problem:** O validator detectou 11 arquivos órfãos (orphaned) em diretórios de IDE. Este item foi combinado com ESLint fixes no Story TD-1.

**What was done:**
- [x] Removed `.github/deprecated-docs/` directory (272 files)
- [x] Removed `bin/aios-init.backup-v1.1.4.js`
- [x] Expansion-pack backups were already clean

**Result:** 273 legacy/orphaned files removed. Codebase cleaned.

---

### ~~Scripts Path Consolidation & Documentation Fix (ID: 1734530400001)~~ ✅ RESOLVED

**Created:** 2025-12-18 | **Resolved:** 2025-12-18 | **Sprint:** 6

**Problem:** After Sprint 2 modular architecture restructuring, scripts were reorganized but:
1. Deprecated scripts in `.aios-core/scripts/` were not deleted (duplicates exist)
2. Documentation references 60+ incorrect paths pointing to old locations
3. `core-config.yaml` still uses legacy `scriptsLocation: .aios-core/scripts`

**Key Issues:**
- **3 Deprecated Scripts** (duplicates): `context-detector.js`, `elicitation-engine.js`, `elicitation-session-manager.js`
- **3 Missing Scripts** referenced in docs: `validate-filenames.js`, `execute-task.js`, `analyze-codebase.js`
- **8+ Scripts** with wrong paths in documentation

**Affected Documentation:**
- `docs/guides/contextual-greeting-system-guide.md` - 10+ incorrect paths
- `docs/guides/project-status-feature.md` - 8+ incorrect paths
- `.aios-core/product/templates/activation-instructions-template.md` - 6+ incorrect paths

**Story:** [Story 6.16](v2.1/sprint-6/story-6.16-scripts-path-consolidation.md)

**Action Items:**
- [ ] Delete deprecated scripts in `.aios-core/scripts/`
- [ ] Update high-priority documentation with correct paths
- [ ] Fix `scriptsLocation` in `core-config.yaml` to reflect modular structure
- [ ] Remove references to non-existent scripts
- [ ] Verify agent activations work correctly

---

### ~~ESLint `_error` Variable Warning Fix (ID: 1734912000001)~~ ✅ RESOLVED

**Created:** 2025-12-22 | **Resolved:** 2025-12-26 | **Sprint:** 13
**Source:** QA Review Story 6.18

**Resolution:** Consolidated into **[Story TD-1](v2.1/sprint-13/story-td-1-code-cleanup.md)** - Code Cleanup Quick Wins.

**Problem:** 9 files contained unused `_error` catch variables that triggered ESLint warnings.

**What was done:**
- [x] Fixed all 9 files with `_error` variables
- [x] Applied ES2019 optional catch binding (`catch {}`) where error unused
- [x] Applied named catch (`catch (error)`) where `error.message` was referenced
- [x] Bug fix: Several instances had `catch (_error)` but used `error.message` (would be undefined)

**Files Fixed:**
1. `.aios-core/core/session/context-loader.js`
2. `src/installer/brownfield-upgrader.js`
3. `tests/integration/test-utilities-part-3.js`
4. `.aios-core/scripts/test-template-system.js`
5. `.aios-core/infrastructure/scripts/test-quality-assessment.js`
6. `.aios-core/infrastructure/scripts/test-generator.js`
7. `tests/epic-verification.test.js`
8. `tests/e2e/story-creation-clickup.test.js`
9. `.aios-core/infrastructure/scripts/test-utilities.js`

**Result:** ESLint passes with 0 errors. Correct error handling patterns applied.

---

### ~~YAML Library Standardization (ID: 1734912000002)~~ ✅ RESOLVED

**Created:** 2025-12-22 | **Resolved:** 2025-12-27 | **Sprint:** 13
**Source:** QA Review Story 6.18

**Resolution:** Consolidated into **[Story TD-2](v2.1/sprint-13/story-td-2-yaml-consolidation.md)** - YAML Library Consolidation.

**Problem:** O projeto utilizava duas bibliotecas YAML: `js-yaml` (57 files) e `yaml` (28 files).

**What was done:**
- [x] All 28 files using `yaml` package migrated to `js-yaml`
- [x] `yaml` package removed from package.json dependencies
- [x] Zero YAML parse warnings
- [x] All tests pass (2484 tests)
- [x] Lint passes (0 errors)
- [x] PR #25 merged

**Result:** Single YAML library (`js-yaml`) used across entire codebase. Bundle size reduced.

📄 **[Ver Story TD-2](v2.1/sprint-13/story-td-2-yaml-consolidation.md)**

---

### GitHub Actions Cost Optimization (ID: 1733679600001)

**Created:** 2025-12-08 | **Priority:** 🟡 Medium | **Sprint:** TBD

**Problem:** GitHub Actions está consumindo minutos rapidamente devido a múltiplos workflows redundantes e matrix de testes extensa.

**Current Workflows (6 total):**
1. `aios-ci.yml` - Multi-Layer Validation (lint, typecheck, test, story validation)
2. `pr-automation.yml` - PR checks (lint, typecheck, test, coverage, metrics)
3. `cross-platform-tests.yml` - Matrix: 3 OS × 3 Node versions = 9 jobs
4. `test.yml` - Duplicate lint, security-audit, build-test matrix, compatibility-test matrix
5. `pr-labeling.yml` - Auto-labels (minimal cost)
6. `npm-publish.yml` - Release publish (minimal cost)

**Redundancies Identified:**
- Lint/TypeCheck runs in 3 workflows (aios-ci, pr-automation, test)
- Tests run in multiple places with different scopes
- Cross-platform tests run full matrix even for docs-only changes
- Some tests run on push AND pull_request (double execution)

**Optimization Checklist:**
- [ ] Audit which workflows are essential vs redundant
- [ ] Consolidate lint/typecheck into single workflow
- [ ] Add path filters to skip CI for docs-only changes
- [ ] Reduce cross-platform matrix (only full matrix on main, minimal on PRs)
- [ ] Use `concurrency` to cancel outdated runs
- [ ] Consider caching node_modules more aggressively
- [ ] Evaluate if macos runners are necessary (most expensive)
- [ ] Document minimum required workflows for quality gates

**Estimated Savings:**
- Current: ~50-100 minutes per PR
- Target: ~15-25 minutes per PR (50-75% reduction)

**References:**
- `.github/workflows/` directory
- GitHub billing: https://github.com/settings/billing

---

### Increase Test Coverage to 80% (ID: 1733682000001)

**Created:** 2025-12-08 | **Priority:** 🟡 Medium | **Sprint:** TBD

**Problem:** Test coverage threshold was temporarily reduced from 80% to 60% to unblock CI.

**Current Coverage (2025-12-08):**
- Statements: 66.45% (target: 80%)
- Branches: 65.45% (target: 80%)
- Lines: 66.59% (target: 80%)
- Functions: 72.36% (target: 80%)

**Temporary Fix Applied:**
- `jest.config.js` thresholds reduced to 60%/70%
- All 1551 tests passing
- CI unblocked for Story 5.10 PR

**Action Items:**
- [ ] Identify modules with lowest coverage
- [ ] Prioritize critical paths (core modules, security, CLI)
- [ ] Add unit tests incrementally
- [ ] Gradually increase thresholds back to 80%
- [ ] Consider adding coverage gates per module instead of global

**References:**
- `jest.config.js` - Coverage configuration
- `coverage/` - Coverage reports

---

### ~~Flaky CI Tests (ID: 1733427600001)~~ ✅ RESOLVED

**Created:** 2025-12-05 | **Resolved:** 2025-12-08 | **Source:** PR #26 CI Failures

**Problem:** Multiple test files caused intermittent CI failures due to:
- File system race conditions (ENOTEMPTY, EBUSY errors)
- Windows-only tests running on Linux platforms
- Strict performance assertions failing in variable CI environments
- Optional package managers (pnpm) not installed on GitHub Actions

**Fixes Applied (PR #27):**
- [x] Add `cleanupWithRetry()` helper with exponential backoff for migration-backup.test.js
- [x] Add retry logic with unique temp directories for environment-configuration.test.js
- [x] Add platform detection to skip Windows-only tests (`describe.skip` when not win32)
- [x] Relax DevContextLoader performance test assertions for CI variability
- [x] Relax tools-system performance assertions (focus on cache correctness vs timing)
- [x] Make pnpm tests optional on Windows (pnpm not pre-installed on GitHub Actions)

**CI Status After Fixes:**
- ✅ All Ubuntu tests passing (18.x, 20.x, 22.x)
- ✅ Windows 20.x and 22.x passing
- ✅ macOS 18.x and 22.x passing
- ✅ All compatibility tests passing
- ✅ All build tests, lint, typecheck passing

**Remaining Infrastructure Issues (Outside Scope):**
| Issue | Platform | Root Cause | Status |
|-------|----------|------------|--------|
| SIGSEGV crash | macOS Node 18.x/20.x | `isolated-vm` library incompatibility | ⚠️ Workaround applied (CI skip) |
| ~~install-transaction.test.js~~ | ~~Windows Node 18.x~~ | ~~Unrelated to flaky tests~~ | ✅ Resolved |
| ~~performance-test~~ | ~~All~~ | ~~Pre-existing memory layer regression~~ | ✅ Resolved |

**Note:** macOS Node 18.x/20.x excluded from CI matrix. Full investigation tracked in backlog #1733427600002.

---

### 🆕 Infrastructure: isolated-vm macOS Node 18.x/20.x (ID: 1733427600002)

**Created:** 2025-12-08 | **Updated:** 2025-12-08 | **Priority:** 🟡 Medium | **Sprint:** TBD

**Problem:** SIGSEGV crash in `isolated-vm` library on macOS with Node 18.x and 20.x.

**Impact:** macOS Node 18.x/20.x CI jobs crash with segmentation fault.

**Workaround Applied:**
- [x] Exclude macOS Node 18.x/20.x from CI matrix (`cross-platform-tests.yml`)
- [x] macOS Node 22.x still runs and passes

**Investigation Checklist:**
- [ ] Check `isolated-vm` GitHub issues for known macOS/Node compatibility issues
- [ ] Test with latest `isolated-vm` version (`npm update isolated-vm`)
- [ ] Identify which AIOS module depends on `isolated-vm` (likely sandbox/VM execution)
- [ ] Evaluate alternative sandboxing libraries (vm2, quickjs, etc.)
- [ ] Test if Node.js built-in `vm` module is sufficient for our use case
- [ ] Document findings and recommend long-term solution

**References:**
- `isolated-vm` repo: https://github.com/nicolo-ribaudo/isolated-vm
- CI workflow: `.github/workflows/cross-platform-tests.yml`

---

### ~~Infrastructure: Memory Layer Performance Regression (ID: 1733427600003)~~ ✅ RESOLVED

**Created:** 2025-12-08 | **Resolved:** 2025-12-08

**Problem:** Performance test detecting regression in memory layer operations.

**Resolution:** Fixed in PR #27 by relaxing performance assertions for CI variability and adding reference equality checks for cache verification.

**Status:** ✅ performance-test now passes on all platforms.

---

## 📌 Follow-up (1 item) → **Consolidated in [Story 4.1](v2.1/sprint-4/story-4.1-technical-debt-cleanup.md)**

| ID | Type | Title | Priority | Related Story | Effort | Tags | Created By |
|----|------|-------|----------|---------------|--------|------|------------|
| 1732891500003 | 📌 Follow-up | Create TypeScript definitions for Core Module | 🟡 Medium | [4.1 Task 5](v2.1/sprint-4/story-4.1-technical-debt-cleanup.md) | 3 hours | `typescript`, `core`, `dx` | @qa |

### ~~Escopo do Teste de Integração (ID: 1733414400001)~~ ✅ RESOLVED

**Status:** ✅ RESOLVED (2025-12-05)
**Commit:** `398b13cd`

**Validação Completa:**
- [x] Executar `npm run dev:sync` no `tools/quality-dashboard/`
- [x] Verificar que o dashboard carrega métricas de `.aios/data/quality-metrics.json`
- [x] Executar `npm run sync-metrics` para copiar métricas atualizadas
- [x] Verificar que o dashboard exibe as novas métricas sem restart
- [x] Testar auto-refresh (60s) atualiza dados automaticamente
- [x] Documentar qualquer inconsistência encontrada

**Bugs Encontrados e Corrigidos:**
1. `App.jsx`: `useDemoData={true}` estava forçando dados de demonstração
2. `useMetrics.js`: Path relativo `../../.aios/data/` não funcionava no Vite

**Correções Aplicadas:**
- `useDemoData={false}` para usar dados reais
- `dataUrl="/.aios/data/quality-metrics.json"` (path absoluto)

**Resultados:**
| Métrica | Valor | Status |
|---------|-------|--------|
| Layer 1 Pass Rate | 83.3% (36 runs) | ✅ |
| Layer 2 Pass Rate | 100% (18 runs) | ✅ |
| Layer 3 Pass Rate | 100% (6 runs) | ✅ |
| CodeRabbit Findings | 30 (0 critical) | ✅ |
| Quinn Findings | 18 | ✅ |
| Auto-refresh | Working (60s) | ✅ |

---

## 🚀 Epics Ativos

| Epic ID | Epic Name | Stories | Sprint Target | Status |
|---------|-----------|---------|---------------|--------|
| **OSR** | [Open-Source Community Readiness](epic-open-source-readiness/EPIC-OSR-INDEX.md) | 10 stories | Sprint 5-6 | ✅ COMPLETE |
| **SQS** | [Squad System Enhancement](../epics/current/epic-sqs-squad-system.md) | 10 stories | Sprint 7-13 | ✅ COMPLETE |
| **HCS** | [Health Check System](epic-health-check-system/EPIC-HCS-INDEX.md) | 2 stories | Sprint 16-17 | ✅ COMPLETE |
| **WIS** | [Workflow Intelligence System](epic-workflow-intelligence/EPIC-WIS-INDEX.md) | 11 stories | Sprint 8+ | 🚧 IN PROGRESS |
| **ACT** | [Unified Agent Activation Pipeline](epics/epic-activation-pipeline/EPIC-ACT-INDEX.md) | 8 stories | Sprint 20+ | 📋 DRAFT |
| **IDS** | [Incremental Development System](epics/epic-ids-incremental-development/EPIC-IDS-INDEX.md) | 6 stories | Sprint 21+ | 📋 DRAFT |
| **PRO** | [AIOS Pro Architecture](epics/epic-pro-aios-pro-architecture/EPIC-PRO-INDEX.md) | 4 stories | Sprint 9-10 | 🚧 IN PROGRESS (3/4 done) |

### Epic OSR - Summary (Consolidado 2025-12-05)

**Objetivo:** Preparar AIOS-FULLSTACK (ou novo repo) para release open-source público completo.

**Decisões Estratégicas (PM Session):**
- ✅ Escopo completo (toda estrutura de community)
- ✅ Templates padrão para legal (sem dependência externa)
- ✅ MVP expansion packs (apenas free/community)
- ✅ Investigação: repo separado vs. cleanup
- ✅ Investigação: rebranding Synkra nomenclatura

**Stories Consolidadas (10 Total, ~45h):**

| Sprint 5 - Foundation | Sprint 6 - Community & Release |
|-----------------------|--------------------------------|
| ✅ OSR-1: Audit Session (4h) | ✅ OSR-6: Processo Features (4h) |
| ✅ OSR-2: Repo Investigation (8h) | ✅ OSR-7: Public Roadmap (4h) |
| ✅ OSR-3: Legal Foundation (6h) | ✅ OSR-8: Squads Guide (4h) |
| ✅ OSR-4: GitHub Setup (3h) | ✅ OSR-9: Rebranding Synkra (4h) |
| ✅ OSR-5: COMMUNITY.md (4h) | OSR-10: Release Checklist (4h) |

📄 **[Ver Epic Completo](epic-open-source-readiness/EPIC-OSR-INDEX.md)**

**Status Atual:** 🚀 9/10 stories completas (OSR-1 a OSR-9) | Sprint 6 em progresso

**GitHub Project:** [AIOS Public Roadmap](https://github.com/orgs/SynkraAI/projects/1)

---

### Epic SQS - Summary (Criado 2025-12-18) 🆕

**Objetivo:** Completar o sistema de Squads do AIOS, transformando o framework de templates existente em um ecossistema completo de extensibilidade.

**Repositório:** https://github.com/SynkraAI/aios-squads (PUBLIC, EXISTS)

**Squads Existentes:**
- `etl-squad` v2.0.0 - Blog collection utilities (Production Ready)
- `creator-squad` v1.0.0 - Expansion pack creator (Production Ready)

**Scope Completo:**
- Repo Cleanup (branding fix)
- Squad Loader (carregamento dinâmico no runtime)
- CLI Scaffolding (`npx create-aios-squad`)
- JSON Schema Validator
- SquadSyncService (integração Synkra API)
- Registry Integration (npm + aios-squads repo)
- Migration Tool (expansion-packs → squads)

**Stories Planejadas (10 Total, ~62-84h):**

| Sprint 7 - Foundation | Sprint 8 - Integration | Sprint 13 - Completion |
|-----------------------|------------------------|------------------------|
| ✅ SQS-0: Repo Cleanup (2h) **DONE** | ✅ SQS-6: Download & Publish (8-10h) **DONE** | ✅ SQS-5: SquadSyncService (10-12h) **DONE** |
| ✅ SQS-1: Architecture Validation (4h) **DONE** | ✅ SQS-7: Migration Tool (6-8h) **DONE** | ✅ SQS-8: Documentation (4-6h) **DONE** |
| ✅ SQS-2: Squad Loader (12-16h) **DONE** | ✅ SQS-9: Squad Designer (8-12h) **DONE** | ✅ SQS-10: Project Config (4-6h) **DONE** |
| ✅ SQS-3: JSON Schema Validator (6-8h) **DONE** | | |
| ✅ SQS-4: Squad Creator Agent (8-12h) **DONE** | | |

**Architecture Decisions (ADR-SQS-001):** ✅ APPROVED by @architect (Aria) on 2025-12-18
- Q1: Manifest format → Support both, standardize on `squad.yaml`
- Q2: Loading strategy → Hybrid (core eager, extensions lazy)
- Q3: Synkra integration → New squadSyncService.js
- Q4: Resolution chain → 4-level (Local → npm → Workspace → Registry)
- Q5: Package namespace → `@aios-squads/*`

📄 **[Ver Epic Completo](../epics/current/epic-sqs-squad-system.md)**

**Status:** ✅ COMPLETE - 10/10 stories complete (SQS-0 ✅, SQS-1 ✅, SQS-2 ✅, SQS-3 ✅, SQS-4 ✅, SQS-5 ✅, SQS-6 ✅, SQS-7 ✅, SQS-8 ✅, SQS-9 ✅, **SQS-10 ✅**)

**Sprint 13 Completed:**
- ~~**SQS-5:** SquadSyncService (10-12h)~~ ✅ **DONE** (QA Gate: PASS 96/100)
- ~~**SQS-8:** Squad Documentation (4-6h)~~ ✅ **DONE** (20 files created)
- ~~**SQS-10:** Project Config Reference (4-6h)~~ ✅ **DONE** (PR #23, merged 2025-12-26)

**🎉 Epic SQS: COMPLETE (100%)! All 11 stories finished (10 planned + 1 additional).**

---

### Epic WIS - Summary (Criado 2025-12-05)

**Objetivo:** Sistema inteligente que guia desenvolvedores através dos workflows AIOS, detectando contexto e sugerindo próximos passos.

**Visão:**
- Task universal `*next` que sugere próxima ação
- Workflow Registry editável com padrões validados
- Wave Analysis para detectar paralelização
- Pattern Learning (interno + comunidade opt-in)
- Integração com Agent Lightning (Story 1.10)

**Stories Planejadas (8+ Total, ~60h):**

| Sprint 9-10 - Foundation | Sprint 11-12 - Core WIS |
|--------------------------|-------------------------|
| ✅ WIS-2: Workflow Registry (12h) **DONE** | ✅ WIS-3: `*next` Task (11h) **DONE** |
| ✅ WIS-9: Investigation (17-25h) **DONE** | ✅ WIS-4: Wave Analysis (8h) **DONE** |
| ✅ WIS-10: Service Template (8-10h) **DONE** | ✅ WIS-5: Pattern Capture (8h) **DONE** |
| ✅ WIS-11: `*create-service` Task **DONE** | WIS-6: Community Opt-in (8h) - Future |
| ✅ WIS-15: `*analyze-project-structure` (2h) **DONE** | WIS-7/WIS-8: Future |

**Completed Stories:**
- ✅ **WIS-2:** Workflow Registry (Sprint 10, 2025-12-25)
- ✅ **WIS-3:** `*next` Task Universal (Sprint 11, 2025-12-25)
- ✅ **WIS-4:** Wave Analysis Engine (Sprint 11, 2025-12-25)
- ✅ **WIS-5:** Pattern Capture (Sprint 12, PR #22, 2025-12-26)
- ✅ **WIS-9:** Incremental Feature Investigation (Sprint 9)
- ✅ **WIS-10:** Service Template Implementation (Sprint 10)
- ✅ **WIS-11:** `*create-service` Task (Sprint 10, 2025-12-24)
- ✅ **WIS-15:** `*analyze-project-structure` Task (PR #17, 2025-12-23)

**Future:** WIS-7 (Agent Lightning), WIS-8 (Memory Layer)

**Dependências:**
- Depende de: Epic OSR (para community features)
- Conecta com: Story 1.10 (Agent Lightning)

📄 **[Ver Epic Completo](epic-workflow-intelligence/EPIC-WIS-INDEX.md)**

**Status:** 🚧 IN PROGRESS - 8/11 stories complete (WIS-2 ✅, WIS-3 ✅, WIS-4 ✅, WIS-5 ✅, WIS-9 ✅, WIS-10 ✅, WIS-11 ✅, WIS-15 ✅)

---

### Epic ACT - Summary (Criado 2026-02-05) 🆕

**Objetivo:** Unify the agent activation pipeline so that ALL 12 agents activate through a single enriched path with real-time project context, enforced permission modes, intelligent workflow recognition, and adaptive greetings.

**Source:** AIOS-TRACE-001 deep code analysis + AIOS-XREF-001 cross-reference findings

**Problem:** Two divergent activation paths (Path A: 9 agents, Path B: 3 agents) creating inconsistent context richness. 7 confirmed bugs/gaps identified across 14+ source files.

**Stories (8 Total, ~60-80h):**

| Phase | Stories | Description |
|-------|---------|-------------|
| Phase 1: Critical Fixes | ACT-1 (Critical, Low), ACT-4 (High, High) | Fix GreetingPreferenceManager config, Wire PermissionMode |
| Phase 2: Reliability | ACT-2 (High, Medium), ACT-3 (High, High) | user_profile audit, ProjectStatusLoader overhaul |
| Phase 3: Unification | ACT-6 (High, Very High) | Merge Path A + Path B into unified pipeline |
| Phase 4: Intelligence | ACT-5 (Medium, High), ACT-7 (Medium, High) | WorkflowNavigator + Bob, Context-aware greetings |
| Phase 5: Governance | ACT-8 (Medium, Medium) | Config enrichment + document governance |

**Dependencies:**
- Depends on: AIOS-TRACE-001 (completed)
- ACT-5 depends on: Epic 11 (Projeto Bob) Stories 11.4, 11.5
- Subsumes: Backlog item 1738700000008 (Wire permissions system)

📄 **[Ver Epic Completo](epics/epic-activation-pipeline/EPIC-ACT-INDEX.md)**

**Status:** 📋 DRAFT - 0/8 stories complete

---

### Epic IDS - Summary (Criado 2026-02-05) 🆕

**Objetivo:** Implement an Incremental Development System (IDS) that enforces REUSE > ADAPT > CREATE hierarchy, preventing AI agents from generating new code when existing artifacts can be reused or adapted.

**Source:** AIOS-TRACE-001 + AIOS-XREF-001 findings - Observation that "Humans develop incrementally; AI agents develop generationally"

**Problem Solved:**
- AI agents tend to generate new code instead of reusing existing artifacts
- ~881 artifacts mapped but no systematic way to query/reuse them
- Duplication, drift, inconsistency accumulating over time

**Core Components:**
1. **Entity Registry System (ERS)** - Centralized registry of all ~881 entities
2. **Incremental Decision Engine (IDE)** - REUSE/ADAPT/CREATE recommendations
3. **Self-Updating Registry** - File watchers, git hooks, agent hooks
4. **Self-Healing Registry** - Background verification, auto-fix, warnings
5. **Six Verification Gates** - G1(@pm) through G6(@devops)
6. **Constitution Article IV-A** - Formal incremental development rules

**Stories (6 Total, ~46h):**

| Story | Title | Priority | Effort | Dependencies |
|-------|-------|----------|--------|--------------|
| IDS-1 | Entity Registry Foundation | Critical | 8h | None |
| IDS-2 | Incremental Decision Engine | Critical | 12h | IDS-1 |
| IDS-3 | Self-Updating Registry | High | 6h | IDS-1 |
| IDS-4 | Self-Healing Registry | High | 8h | IDS-1, IDS-3 |
| IDS-5 | Verification Gate Integration | High | 10h | IDS-2, IDS-4 |
| IDS-6 | Constitution Article IV-A | Medium | 2h | IDS-1 to IDS-5 |

📄 **[Ver Epic Completo](epics/epic-ids-incremental-development/EPIC-IDS-INDEX.md)**
📄 **[Ver ADR-IDS-001](../architecture/adr/adr-ids-001-incremental-development-system.md)**

**Status:** 📋 DRAFT - 0/6 stories complete

---

### Epic PRO - Summary (Criado 2026-02-05) 🆕

**Objetivo:** Separar o AIOS em dois produtos com modelo Open Core (aios-core open-source + aios-pro commercial).

**Visão:**
- **aios-core** (Open-Source, MIT + Commons Clause) - Framework base, 12 agentes, CLI completo
- **aios-pro** (Commercial, Proprietary) - Premium squads, persistent memory, enterprise integrations

**ADRs Aprovados:**
| ADR | Decision |
|-----|----------|
| ADR-PRO-001 | Repository Strategy: Monorepo + Private Git Submodule |
| ADR-PRO-002 | Config Hierarchy: 4 levels + Pro Extension |
| ADR-PRO-003 | Feature Gating & Licensing: Hybrid license + dual-gate |

**Stories (4 Total):**

| Story | Status | Description | Owner |
|-------|--------|-------------|-------|
| PRO-1 | ✅ Done | Investigation - Research, ADRs, Feature Boundary | @architect |
| PRO-4 | ✅ Done | Core-Config Split Implementation | @dev |
| PRO-5 | ✅ Done | aios-pro Repository Bootstrap | @devops |
| PRO-6 | ✅ Done | License Key & Feature Gating System | @dev + @devops |

**PRO-6 Highlights (Completed 2026-02-06):**
- FeatureGate singleton with wildcard matching
- AES-256-GCM encrypted license cache (PBKDF2 100k iterations)
- HMAC-SHA256 tamper detection + machine binding
- CLI commands: `aios pro activate/status/deactivate/features`
- 279 tests (100% coverage on license modules)

📄 **[Ver Epic Completo](epics/epic-pro-aios-pro-architecture/EPIC-PRO-INDEX.md)**

**Status:** ✅ COMPLETE - 4/4 stories done (PRO-1 ✅, PRO-4 ✅, PRO-5 ✅, PRO-6 ✅)

---

### Epic HCS - Summary (Criado 2025-12-05)

**Objetivo:** Sistema de diagnóstico completo que analisa a saúde do projeto AIOS em todas as camadas, identifica problemas, sugere correções de technical debt e realiza auto-healing.

**Problema Resolvido:**
- Usuários "vibe coding" podem quebrar configurações
- Dificuldade em diagnosticar problemas complexos
- Technical debt acumula sem visibilidade
- Inconsistências entre ambientes passam despercebidas

**Funcionalidades:**
- Task `*health-check` executável pelo @devops
- 5 domínios de verificação: Project, Local, Repo, Deploy, Services
- Self-healing com 3 tiers (silencioso, confirmação, manual)
- Relatório markdown + Dashboard visual (reutiliza Story 3.11)
- Score de saúde 0-100 por domínio e geral

**Stories (2 Total, ~27h):**

| Story | Status | Sprint | Effort |
|-------|--------|--------|--------|
| ✅ HCS-1: Investigation & Best Practices | **DONE** | 16 | 8h |
| ✅ HCS-2: Implementation | **DONE** | 17 | 19h |

**HCS-1 Deliverables (Completed 2025-12-30):**
- [ADR: HCS Architecture](../architecture/adr/adr-hcs-health-check-system.md)
- [HCS Execution Modes](../architecture/hcs-execution-modes.md)
- [HCS Self-Healing Specification](../architecture/hcs-self-healing-spec.md)
- [HCS Check Specifications](../architecture/hcs-check-specifications.md)

**Dependências:**
- Depende de: Epic OSR (para validar estrutura pública)
- Conecta com: Story 3.11 (Quality Gates Dashboard)
- Complementa: `*bootstrap-setup` task

📄 **[Ver Epic Completo](epic-health-check-system/EPIC-HCS-INDEX.md)**

**Status:** ✅ COMPLETE - 2/2 stories complete (HCS-1 ✅, HCS-2 ✅ PR #33 merged 2026-01-04)

---

## ✅ Resolved Items (Completed from Backlog)

| ID | Type | Title | Priority | Related Story | Resolved | PR |
|----|------|-------|----------|---------------|----------|-----|
| 1736001500036 | ✅ Resolved | CI Stability & Test Coverage | 🔴 High | [TD-6](v2.1/sprint-18/story-td-6-ci-stability.md) ✅ Done | 2026-01-05 | [PR #35](https://github.com/SynkraAI/aios-core/pull/35), [PR #36](https://github.com/SynkraAI/aios-core/pull/36) |
| 1735570000001 | ✅ Resolved | HCS Investigation & Best Practices | 🔴 High | [HCS-1](epics/epic-health-check-system/story-hcs-1-investigation.md) ✅ Done | 2025-12-30 | - |
| 1735010000001 | ✅ Resolved | `*analyze-project-structure` Task | 🔴 High | [WIS-15](v2.1/sprint-10/story-wis-15-analyze-project-structure.md) ✅ Done | 2025-12-23 | [PR #17](https://github.com/SynkraAI/aios-core/pull/17) |
| 1735010000002 | ✅ Resolved | Service Template Implementation | 🔴 High | [WIS-10](v2.1/sprint-10/story-wis-10-service-template.md) ✅ Done | 2025-12-24 | [PR #18](https://github.com/SynkraAI/aios-core/pull/18) |
| 1735010000003 | ✅ Resolved | Incremental Feature Investigation | 🟠 High | [WIS-9](v2.1/sprint-9/story-wis-9-incremental-feature-workflow.md) ✅ Done | 2025-12-23 | - |
| 1735220000001 | ✅ Resolved | Pattern Capture (Internal) | 🟠 High | [WIS-5](v2.1/sprint-12/story-wis-5-pattern-capture.md) ✅ Done | 2025-12-26 | [PR #22](https://github.com/SynkraAI/aios-core/pull/22) |
| 1735230000001 | ✅ Resolved | Project Config Reference | 🟠 High | [SQS-10](v2.1/sprint-13/story-sqs-10-project-config-reference.md) ✅ Done | 2025-12-26 | [PR #23](https://github.com/SynkraAI/aios-core/pull/23) |
| 1735220000002 | ✅ Resolved | `*next` Task Universal | 🟡 Medium | [WIS-3](v2.1/sprint-11/story-wis-3-next-task.md) ✅ Done | 2025-12-25 | - |
| 1735220000003 | ✅ Resolved | Wave Analysis Engine | 🟡 Medium | [WIS-4](v2.1/sprint-11/story-wis-4-wave-analysis.md) ✅ Done | 2025-12-25 | - |
| 1735010000004 | ✅ Resolved | Squad Migration Tool | 🟠 High | [SQS-7](v2.1/sprint-8/story-sqs-7-migration-tool.md) ✅ Done | 2025-12-23 | [PR #16](https://github.com/SynkraAI/aios-core/pull/16) |
| 1735010000005 | ✅ Resolved | Squad Download & Publish | 🟠 High | [SQS-6](v2.1/sprint-8/story-sqs-6-download-publish.md) ✅ Done | 2025-12-23 | [PR #17](https://github.com/SynkraAI/aios-core/pull/17) |
| 1734920000001 | ✅ Resolved | IDE Command Auto-Sync System | 🔴 High | [6.19](v2.1/sprint-6/story-6.19-ide-command-auto-sync.md) ✅ Done | 2025-12-22 | [PR #12](https://github.com/SynkraAI/aios-core/pull/12) |
| 1734912000003 | ✅ Resolved | Dynamic Manifest & Brownfield Upgrade System | 🟠 High | [6.18](v2.1/sprint-6/story-6.18-dynamic-manifest-brownfield-upgrade.md) ✅ Done | 2025-12-22 | [PR #11](https://github.com/SynkraAI/aios-core/pull/11) |
| 1734530400001 | ✅ Resolved | Scripts Path Consolidation & Documentation Fix | 🔴 High | [6.16](v2.1/sprint-6/story-6.16-scripts-path-consolidation.md) ✅ Done | 2025-12-18 | - |
| 1734540000001 | ✅ Resolved | Squad Designer - Guided Squad Creation | 🟠 High | [SQS-9](v2.1/sprint-8/story-sqs-9-squad-designer.md) ✅ Done | 2025-12-18 | [PR #10](https://github.com/SynkraAI/aios-core/pull/10) |
| 1734230000001 | ✅ Resolved | Systematic Documentation Audit for OSR | 🔴 Critical | [6.13](v2.1/sprint-6/story-6.13-systematic-documentation-audit.md) ✅ Done | 2025-12-15 | [PR #5](https://github.com/SynkraAI/aios-core/pull/5) |
| 1734225000001 | ✅ Resolved | Repository Cleanup for Open-Source Release | 🔴 Critical | [6.12](v2.1/sprint-6/story-6.12-repository-cleanup-osr.md) ✅ Done | 2025-12-15 | - |
| 1734220200001 | ✅ Resolved | Framework Documentation Consolidation | 🟠 Medium | [6.11](v2.1/sprint-6/story-6.11-framework-docs-consolidation.md) ✅ Done | 2025-12-14 | - |
| 1734217500001 | ✅ Resolved | Documentation Cleanup for OSR | 🟠 Medium | [6.10](v2.1/sprint-6/story-6.10-documentation-cleanup-osr.md) ✅ Done | 2025-12-14 | - |
| 1734214800001 | ✅ Resolved | Documentation Integrity System | 🔴 Critical | [6.9](v2.1/sprint-6/story-6.9-documentation-integrity-system.md) ✅ Done | 2025-12-14 | [PR #4](https://github.com/SynkraAI/aios-core/pull/4) |
| 1734210000001 | ✅ Resolved | Rebranding Investigation (Synkra) | 🟡 Medium | [OSR-9](v2.1/sprint-6/story-osr-9-rebranding-synkra.md) ✅ Done | 2025-12-14 | - |
| 1733880000001 | ✅ Resolved | Squads Guide Documentation | 🟠 High | [OSR-8](v2.1/sprint-6/story-osr-8-expansion-pack-guide.md) ✅ Done | 2025-12-10 | - |
| 1733870000001 | ✅ Resolved | Public Roadmap for Community | 🟡 Medium | [OSR-7](v2.1/sprint-6/story-osr-7-public-roadmap.md) ✅ Done | 2025-12-10 | [PR #2](https://github.com/SynkraAI/aios-core/pull/2) |
| 1733830000001 | ✅ Resolved | Feature Request Process | 🟠 High | [OSR-6](v2.1/sprint-6/story-osr-6-features-process.md) ✅ Done | 2025-12-10 | [PR #1](https://github.com/SynkraAI/aios-core/pull/1) |
| 1733750000001 | ✅ Resolved | Legal Foundation Documentation | 🔴 Critical | [OSR-3](v2.1/sprint-5/story-osr-3-legal-foundation.md) ✅ Done | 2025-12-09 | [PR #31](https://github.com/Pedrovaleriolopez/aios-fullstack/pull/31) |
| 1733749000001 | ✅ Resolved | Repository Strategy Investigation | 🔴 Critical | [OSR-2](v2.1/sprint-5/story-osr-2-repo-investigation.md) ✅ Done | 2025-12-08 | - |
| 1733664000001 | ✅ Resolved | GitHub DevOps Setup for User Projects | 🔴 Critical | [5.10](v2.1/sprint-5/story-5.10-github-devops-user-projects.md) ✅ Done | 2025-12-08 | [PR #29](https://github.com/Pedrovaleriolopez/aios-fullstack/pull/29) |
| 1733673600001 | ✅ Resolved | Quality Metrics Live Integration | 🔴 Critical | [3.11c](v2.1/sprint-3/story-3.11c-metrics-live-integration.md) ✅ Done | 2025-12-08 | [PR #28](https://github.com/Pedrovaleriolopez/aios-fullstack/pull/28) |

### ~~Dynamic Manifest & Brownfield Upgrade System (ID: 1734912000003)~~ ✅ RESOLVED

**Created:** 2025-12-22 | **Resolved:** 2025-12-22 | **Sprint:** 6

**Problem:** Static `install-manifest.yaml` (Nov 2025) couldn't detect new files for brownfield upgrades. New agents like `squad-creator` weren't being installed in existing projects.

**Solution Implemented (Story 6.18 - PR #11):**
- [x] Created `src/installer/file-hasher.js` - Cross-platform SHA256 hashing with CRLF/BOM normalization
- [x] Created `src/installer/brownfield-upgrader.js` - Semver-based upgrade detection with user modification preservation
- [x] Created `scripts/generate-install-manifest.js` - Dynamic manifest generation
- [x] Created `scripts/validate-manifest.js` - Manifest integrity verification
- [x] Integrated upgrade detection in `bin/aios-init.js` wizard
- [x] Added `manifest-validation` job to CI workflow
- [x] Added npm scripts: `generate:manifest`, `validate:manifest`, `prepublishOnly`
- [x] 126 unit tests passing across 5 test suites

**Features:**
- Detects user-modified files and preserves local changes
- Dry-run mode for safe upgrade preview
- Generates upgrade reports (new/modified/deleted files)
- Creates `.installed-manifest.yaml` for version tracking

**Result:** Users can now run `npx aios-core` in existing projects to receive incremental upgrades without losing customizations.

📄 **[Ver Story 6.18](v2.1/sprint-6/story-6.18-dynamic-manifest-brownfield-upgrade.md)**

---

### ~~Systematic Documentation Audit for OSR (ID: 1734230000001)~~ ✅ RESOLVED

**Created:** 2025-12-15 | **Resolved:** 2025-12-15 | **Sprint:** 6

**Problem:** Repository needed systematic audit of ALL 864+ documentation files before open-source release to ensure consistency, update references, and add i18n support.

**Solution Implemented (Story 6.13 - PR #5):**
- [x] Audited all root-level documentation files (9 files)
- [x] Fixed broken URLs from batch terminology replacement (34 files)
- [x] Added Portuguese (PT-BR) translations for community docs (5 files)
- [x] Archived internal documentation (~678 files to `.github/deprecated-docs/`)
- [x] Updated `.gitignore` for private commands and expansion-packs
- [x] Validated all cross-references and links
- [x] All CI checks passed (CodeQL, CodeRabbit, GitHub Actions)

**Result:** Documentation fully audited and aligned with Synkra AIOS branding. Bilingual community docs (EN/PT-BR) ready for international open-source release.

📄 **[Ver Story 6.13](v2.1/sprint-6/story-6.13-systematic-documentation-audit.md)**

---

### ~~Repository Cleanup for Open-Source Release (ID: 1734225000001)~~ ✅ RESOLVED

**Created:** 2025-12-14 | **Resolved:** 2025-12-15 | **Sprint:** 6

**Problem:** Repository contained ~200+ development artifacts, obsolete files, and internal documentation that needed cleanup before open-source release.

**Solution Implemented (Story 6.12):**
- [x] Deleted 23 obsolete files (debug artifacts, duplicates, legacy tasks)
- [x] Archived 225 files to `.github/deprecated-docs/`
- [x] Created archive structure with 10 subdirectories
- [x] Updated `.gitignore` with ~50 new patterns
- [x] Reorganized `docs/epics/` into `current/`, `archived/`, `future/`
- [x] Added 15 missing agent reference files (10 copied + 5 placeholders)
- [x] Updated `docs/epics/README.md` with new structure

**Result:** Repository reduced from 320+ docs to ~150 files. Clean, organized structure ready for open-source release.

📄 **[Ver Story 6.12](v2.1/sprint-6/story-6.12-repository-cleanup-osr.md)**

---

### ~~Framework Documentation Consolidation (ID: 1734220200001)~~ ✅ RESOLVED

**Created:** 2025-12-14 | **Resolved:** 2025-12-14 | **Sprint:** 6

**Problem:** Framework documentation (`source-tree.md`, `coding-standards.md`, `tech-stack.md`) existed in two locations with inconsistent references - `docs/architecture/` and `docs/framework/`.

**Solution Implemented (Story 6.11):**
- [x] Synced `docs/framework/` with current versions (v1.1)
- [x] Updated `core-config.yaml` to reference `docs/framework/` as primary location
- [x] Created `docs/architecture/analysis/` for analysis documents (10 files moved)
- [x] Marked duplicates in `docs/architecture/` as DEPRECATED
- [x] Added fallback paths for backward compatibility

**Result:** `docs/framework/` is now the official location for portable framework documentation. Architecture folder organized with analysis subfolder.

📄 **[Ver Story 6.11](v2.1/sprint-6/story-6.11-framework-docs-consolidation.md)**

---

### ~~Documentation Cleanup for OSR (ID: 1734217500001)~~ ✅ RESOLVED

**Created:** 2025-12-14 | **Resolved:** 2025-12-14 | **Sprint:** 6

**Problem:** Documentation needed cleanup before open-source release - legacy references, outdated information, and quality issues.

**Solution Implemented (Story 6.10):**
- [x] Removed legacy/deprecated documentation
- [x] Updated outdated references and links
- [x] Verified documentation consistency
- [x] Prepared documentation for public release

**Result:** Documentation cleaned and ready for open-source release.

📄 **[Ver Story 6.10](v2.1/sprint-6/story-6.10-documentation-cleanup-osr.md)**

---

### ~~Documentation Integrity System (ID: 1734214800001)~~ ✅ RESOLVED

**Created:** 2025-12-14 | **Resolved:** 2025-12-14 | **Sprint:** 6

**Problem:** Arquivos de documentação de integridade (source-tree.md, coding-standards.md, tech-stack.md) não diferenciavam entre framework-dev, greenfield e brownfield modes.

**Solution Implemented (PR #4 - aios-core):**
- [x] Mode detector com suporte a 3 modos de instalação
- [x] Templates de documentação para projetos de usuário
- [x] Gerador de core-config com seção de deployment
- [x] Gerador de .gitignore por tech stack
- [x] Brownfield analyzer para projetos existentes
- [x] 180 unit tests passando
- [x] QA aprovado por Quinn

**Result:** Sistema de integridade de documentação mode-aware implementado.

📄 **[Ver Story 6.9](v2.1/sprint-6/story-6.9-documentation-integrity-system.md)**

---

### ~~Rebranding Investigation Synkra (ID: 1734210000001)~~ ✅ RESOLVED

**Created:** 2025-12-10 | **Resolved:** 2025-12-14 | **Sprint:** 6

**Problem:** Decisão de naming para o projeto open-source (AIOS vs Synkra).

**Solution Implemented:**
- [x] Investigação de naming completa
- [x] Decisão: Synkra como nome do projeto
- [x] GitHub org criada: SynkraAI
- [x] Repositório migrado para github.com/SynkraAI/aios-core
- [x] Package name mantido como @aios-fullstack/core (backward compatibility)

**Result:** Rebranding para Synkra concluído com sucesso.

📄 **[Ver Story OSR-9](v2.1/sprint-6/story-osr-9-rebranding-synkra.md)**

---

### ~~Squads Guide Documentation (ID: 1733880000001)~~ ✅ RESOLVED

**Created:** 2025-12-05 | **Resolved:** 2025-12-10 | **Sprint:** 6

**Problem:** Comunidade precisava de guia completo para criar Squads (extensões modulares de agentes).

**Solution Implemented:**
- [x] `docs/guides/squads-guide.md` - Guia principal completo (293 linhas)
- [x] `templates/squad/` - Template completo com 10 arquivos
- [x] `docs/guides/squad-examples/` - Exemplos práticos (3 arquivos)
- [x] `CONTRIBUTING.md` - Seção de Squads adicionada
- [x] `README.md` - Referência ao guia adicionada
- [x] Testado com squad de exemplo

**Result:** Desenvolvedores agora podem criar Squads seguindo documentação completa.

📄 **[Ver Story OSR-8](v2.1/sprint-6/story-osr-8-expansion-pack-guide.md)**

---

### ~~Public Roadmap for Community (ID: 1733870000001)~~ ✅ RESOLVED

**Created:** 2025-12-05 | **Resolved:** 2025-12-10 | **Sprint:** 6

**Problem:** Comunidade não tinha visibilidade sobre a direção do projeto e planejamento futuro.

**Solution Implemented (PR #2 - aios-core):**
- [x] GitHub Project "AIOS Public Roadmap" criado e público
- [x] Custom fields: Quarter, Area, Size, Progress
- [x] 15 itens de roadmap (Q1 2026, Q2 2026, Future)
- [x] `ROADMAP.md` com visão, planos e processo de influência
- [x] Links em README.md, COMMUNITY.md, CONTRIBUTING.md
- [x] Processo de sync documentado entre backlog interno e roadmap público

**Result:** Roadmap público completo com GitHub Project e documentação.

**Links:**
- 📄 [Ver Story OSR-7](v2.1/sprint-6/story-osr-7-public-roadmap.md)
- 🗺️ [GitHub Project](https://github.com/orgs/SynkraAI/projects/1)
- 📋 [ROADMAP.md](../../ROADMAP.md)

---

### ~~Feature Request Process (ID: 1733830000001)~~ ✅ RESOLVED

**Created:** 2025-12-05 | **Resolved:** 2025-12-10 | **Sprint:** 6

**Problem:** Comunidade não tinha processo claro para propor features e influenciar o roadmap.

**Solution Implemented (PR #1 - aios-core):**
- [x] `.github/DISCUSSION_TEMPLATE/idea.yml` - Template para ideias da comunidade
- [x] `.github/RFC_TEMPLATE.md` - Template RFC para features significativas
- [x] `docs/FEATURE_PROCESS.md` - Documentação do processo
- [x] `docs/guides/community-to-backlog.md` - Guia de transição para backlog
- [x] Labels: `idea`, `community`, `community-approved`, `community-contribution`
- [x] Discussion category: 🚀 Feature Proposals (via Playwright)
- [x] Story template atualizado com campo `community-origin`

**Result:** Processo público completo para features da comunidade estabelecido.

📄 **[Ver Story OSR-6](v2.1/sprint-6/story-osr-6-features-process.md)**

---

### ~~Legal Foundation Documentation (ID: 1733750000001)~~ ✅ RESOLVED

**Created:** 2025-12-05 | **Resolved:** 2025-12-09 | **Sprint:** 5

**Problem:** Projeto open-source precisa de documentação legal básica para proteger o projeto e dar clareza aos contributors.

**Solution Implemented (PR #31):**
- [x] `PRIVACY.md` - Privacy policy (English)
- [x] `PRIVACY-PT.md` - Política de privacidade (Português)
- [x] `TERMS.md` - Terms of use (English)
- [x] `TERMS-PT.md` - Termos de uso (Português)
- [x] `CHANGELOG.md` - Updated with Keep a Changelog format
- [x] `CODE_OF_CONDUCT.md` - Updated contact email
- [x] `README.md` - Added bilingual legal section table

**Telemetry Clarification:** Updated privacy docs to clarify consent-based telemetry system (ConsentManager initialized but no data collected without explicit consent).

**Result:** All legal foundation documents created following industry standard templates. Bilingual support (EN/PT-BR) for Brazilian project.

📄 **[Ver Story OSR-3](v2.1/sprint-5/story-osr-3-legal-foundation.md)**

---

### ~~Repository Strategy Investigation (ID: 1733749000001)~~ ✅ RESOLVED

**Created:** 2025-12-05 | **Resolved:** 2025-12-08 | **Sprint:** 5

**Problem:** Decidir entre criar novo repositório para open-source ou limpar o aios-fullstack existente.

**Investigation Completed:**
- [x] Deprecated code scan - 8+ directories, ~500+ files
- [x] Proprietary code mapping - 44 MMOS minds, 4 expansion packs
- [x] Git history analysis - MEDIUM risk (patterns found but likely docs)
- [x] Effort estimation - Option A: 36h vs Option B: 60h
- [x] Decision document created

**Key Decisions:**
- **Opção A (Novo Repositório)** recomendada - 40% menos esforço
- **GitHub Organization:** `allfluence/` escolhida
- **Estrutura:** 3 repos públicos + 2 privados

**Approvals:** Stakeholder, @pm, @po, @architect (all 2025-12-08)

📄 **[Ver Story OSR-2](v2.1/sprint-5/story-osr-2-repo-investigation.md)**
📄 **[Ver Decision Document](../decisions/decision-osr-2-repository-strategy-investigation.md)**

---

### ~~GitHub DevOps Setup for User Projects (ID: 1733664000001)~~ ✅ RESOLVED

**Created:** 2025-12-08 | **Resolved:** 2025-12-08 | **Sprint:** 5

**Problem:** O `*environment-bootstrap` criava repositório Git/GitHub mas não configurava infraestrutura DevOps completa (workflows, CodeRabbit, branch protection, secrets).

**Solution Implemented (PR #29):**
- [x] Nova task `*setup-github` para @devops
- [x] Templates de GitHub Actions (ci.yml, pr-automation.yml, release.yml)
- [x] Template de configuração CodeRabbit
- [x] Branch protection via GitHub API
- [x] Wizard interativo de secrets
- [x] 3 modos de execução: YOLO, Interactive, Pre-Flight

**Result:** Usuários agora podem configurar DevOps completo em seus projetos com `*setup-github`.

📄 **[Ver Story 5.10](v2.1/sprint-5/story-5.10-github-devops-user-projects.md)**

---

### ~~Quality Metrics Live Integration (ID: 1733673600001)~~ ✅ RESOLVED

**Created:** 2025-12-08 | **Resolved:** 2025-12-08 | **Sprint:** 3

**Problem:** O MetricsCollector (Story 3.11a) foi implementado mas as integrações reais não foram ativadas:
- Pre-commit hook não chama `recordPreCommitMetrics()`
- PR Automation workflow não chama `recordPRReviewMetrics()`
- Dashboard mostra dados de 3+ dias atrás
- PRs criados hoje não aparecem no Dashboard

**Solution Implemented (PR #28):**
- [x] Atualizar `.husky/pre-commit` para registrar métricas Layer 1
- [x] Adicionar job `record-metrics` ao `pr-automation.yml` para Layer 2
- [x] Configurar commit automático do arquivo de métricas com `[skip ci]`
- [x] Dashboard exibe dados em tempo real

**Result:** Sistema de Quality Gates agora captura métricas automaticamente em cada commit e PR.

📄 **[Ver Story 3.11c](v2.1/sprint-3/story-3.11c-metrics-live-integration.md)**

---

## ❌ Obsolete Items (Removed from Active Backlog)

| ID | Title | Reason | Replacement | Obsoleted Date |
|----|-------|--------|-------------|----------------|
| 4.1-4.7 | DevOps Setup + GitHub Integration | Superseded by different implementations in Sprints 1-3 | [Story 5.10](v2.1/sprint-5/story-5.10-github-devops-user-projects.md) | 2025-12-08 |

### ~~Stories 4.1-4.7: DevOps Setup~~ ❌ OBSOLETE

**Original Location:** [sprint-4-6/story-4.1-4.7-devops-complete.md](v2.1/sprint-4-6/story-4.1-4.7-devops-complete.md)

**What was planned:**
- 4.1: GitHub CLI Integration (5 pts)
- 4.2: Repository Setup Automation (8 pts)
- 4.3: CodeRabbit GitHub App (8 pts)
- 4.4: CI/CD Workflows (5 pts)
- 4.5: Felix DevOps Agent Integration (5 pts)
- 4.6: Deployment Automation (8 pts)
- 4.7: Documentation Sprint 4 (3 pts)

**What was actually implemented instead:**
| Planned | Actual Implementation |
|---------|----------------------|
| GitHub CLI wrapper | `*environment-bootstrap` task |
| `aios setup-github` CLI | Agent @devops + modular tasks |
| Felix DevOps Agent | Gage (@devops) |
| CI/CD Workflows | `.github/workflows/` (5 workflows) |
| CodeRabbit | `.coderabbit.yaml` configured |
| Deployment (Vercel/Railway/Netlify) | ❌ Not implemented (future scope) |

**Gap Identified:** User projects (Cenário 2) don't receive DevOps setup automatically after `*environment-bootstrap`.

**Replacement:** Story 5.10 addresses this gap with `*setup-github` task.

---

## 🔍 Legend

### Types
- 📌 **Follow-up** (F)
- 🔧 **Technical Debt** (T)
- ✨ **Enhancement** (E)
- ❌ **Obsolete** (O)

### Priority
- 🔴 **Critical**
- 🟠 **High**
- 🟡 **Medium**
- 🟢 **Low**

---

*Auto-generated by AIOS Backlog Manager (Story 6.1.2.6)*
*Last Updated: 2026-02-06 by @po (Pax)*
*Backlog Review: Sprint 19 in progress + AIOS-XREF-001 findings added (13 new items)*
*Stories Completed: 49 total | Resolved: 56 total | Archived: 4*
*Active Items: 17 (4 existing + 13 from XREF analysis)*
*Sprint 19: 🚀 IN PROGRESS - Story 6.1 (CI Optimization)*
*Sprint 18: ✅ COMPLETE - TD-6 finished (PR #35 + PR #36 merged)*
*XREF Analysis: 🔴 1 Critical | 🟠 1 High | 🟡 5 Medium | 🟢 6 Low (~39h total)*
*Epic HCS: 2/2 (100%) COMPLETE! | Epic WIS: 8/11 (73%) - WIS-6/7/8 Future*
*Epic OSR: 10/10 (100%) COMPLETE! | Epic SQS: 11/11 (100%) COMPLETE!*
*Epic ACT: 0/8 (0%) DRAFT - Unified Agent Activation Pipeline (8 stories, ~60-80h)*
*Epic IDS: 0/6 (0%) DRAFT - Incremental Development System (6 stories, ~46h)*
*Epic PRO: 3/4 (75%) IN PROGRESS - AIOS Pro Architecture (PRO-6 ✅ Done 2026-02-06)*
