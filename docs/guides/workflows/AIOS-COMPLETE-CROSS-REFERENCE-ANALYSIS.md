# AIOS Complete Cross-Reference Analysis

**Story:** AIOS-XREF-001
**Generated:** 2026-02-05
**Owners:** @analyst (Atlas) + @architect (Aria)
**Scope:** All ~881 framework artifacts across 25 entity types
**Status:** COMPLETE

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Aggregate Statistics](#2-aggregate-statistics)
3. [Per-Agent Ecosystem Diagrams](#3-per-agent-ecosystem-diagrams)
4. [Phase Summaries](#4-phase-summaries)
5. [Complete Orphan Analysis](#5-complete-orphan-analysis)
6. [Complete Broken Reference Report](#6-complete-broken-reference-report)
7. [Architectural Observations](#7-architectural-observations)
8. [Recommendations](#8-recommendations)
9. [Phase Detail Files](#9-phase-detail-files)

---

## 1. Executive Summary

This document is the result of a comprehensive cross-reference analysis of every artifact in the Synkra AIOS framework. The analysis was conducted in 7 phases, examining 25 entity types totaling approximately 745 tracked files.

### Key Findings

| Finding | Severity | Details |
|---------|----------|---------|
| **@qa agent has 9 broken task references** | CRITICAL | Task dependency names in `agents/qa.md` don't match actual filenames (missing `qa-` prefix) |
| **3 duplicate task file pairs** | MEDIUM | `create-next-story`/`sm-create-next-story`, `apply-qa-fixes`/`dev-apply-qa-fixes`, `validate-next-story`/`dev-validate-next-story` |
| **3 elicitation file duplicates** | MEDIUM | Identical files in `core/elicitation/` and `elicitation/` |
| **3 phantom/missing core modules** | MEDIUM | `memory-query.js`, `session-memory.js`, `security-checker` referenced but don't exist (try/catch guarded) |
| **19 confirmed orphaned files** | LOW | Files with no active consumers (7 SQL templates, 5 infra scripts, 5 deprecated standards, 2 core modules) |
| **3 missing/empty directories** | LOW | `agent-teams/`, `tools/` (empty), `processes/` do not exist |
| **5 deprecated standards docs** | LOW | Old Livro de Ouro versions superseded by V2.1-COMPLETE |
| **31 weak-reference files** | INFO | Referenced only in passive registries, not actively consumed |
| **Config system in transition** | INFO | Migrating from monolithic `core-config.yaml` to 4-level L1-L4 hierarchy |

### Health Score

| Domain | Score | Notes |
|--------|-------|-------|
| Workflows (12) | **95%** | All workflows well-structured with clear agent assignments |
| Tasks (191) | **90%** | 36 in workflows + 155 on-demand. @qa refs broken. |
| Templates (92) | **92%** | 7 SQL orphans, 27 weak refs (most are runtime-loaded) |
| Checklists (16) | **100%** | All connected to consuming agents/tasks |
| Scripts (37) | **86%** | 5 dead migration scripts, all others active |
| Infrastructure (115) | **92%** | 5 confirmed + 4 likely orphans, clean layering |
| Core Modules (130) | **94%** | 7 orphaned/partial, 3 phantom deps, health-check well-contained |
| Supporting Systems (111) | **90%** | 3 empty dirs, 3 duplicates, 5 deprecated docs |

---

## 2. Aggregate Statistics

### Total Artifact Counts

| Entity Type | Count | Location |
|-------------|-------|----------|
| Agents | 12 | `.aios-core/development/agents/` |
| Tasks | 191 | `.aios-core/development/tasks/` |
| Workflows | 12 | `.aios-core/development/workflows/` |
| Product Templates | 92 | `.aios-core/product/templates/` |
| Development Templates | 29 | `.aios-core/development/templates/` |
| Product Checklists | 16 | `.aios-core/product/checklists/` |
| Product Data | 16 | `.aios-core/product/data/` |
| Framework Data | 8 | `.aios-core/data/` |
| Dev Scripts | 37 | `.aios-core/development/scripts/` |
| Infra Scripts | 90 | `.aios-core/infrastructure/scripts/` |
| Infra Integrations | 5 | `.aios-core/infrastructure/integrations/` |
| Infra Tools | 15 | `.aios-core/infrastructure/tools/` |
| Infra Templates | 15 | `.aios-core/infrastructure/templates/` |
| Core Modules | 130 | `.aios-core/core/` |
| CLI Commands | 37 | `.aios-core/cli/commands/` |
| Schemas | 6 | `.aios-core/schemas/` |
| Manifests | 4 | `.aios-core/manifests/` |
| Monitor Hooks | 10 | `.aios-core/monitor/hooks/` |
| Quality Gates | 10 | `.aios-core/core/quality-gates/` |
| Quality Metrics | 4 | `.aios-core/quality/` |
| Workflow Intelligence | 19 | `.aios-core/workflow-intelligence/` |
| Docs/Standards | 16 | `.aios-core/docs/standards/` |
| Root Config | 8 | `.aios-core/` root |
| Elicitation | 8 | `.aios-core/core/elicitation/` + `.aios-core/elicitation/` |
| **TOTAL** | **~745** | |

### Cross-Reference Metrics

| Metric | Count |
|--------|-------|
| Total unique tasks in workflows | 36 |
| Total on-demand-only tasks | 155 |
| Total agent commands | ~180 |
| Agent-to-task connections | 280+ |
| Template-to-task connections | 127 |
| Most-connected file | `po-master-checklist.md` (12+ task refs, 6 workflow refs) |
| Most-connected agent | @dev (10 scripts, 25+ tasks) |
| Largest subsystem | health-check (35 files) |

---

## 3. Per-Agent Ecosystem Diagrams

### 3.1 @dev (Dex) - Full Stack Developer

```
TASKS (25+ total):
  Workflow: dev-develop-story, apply-qa-fixes, validate-next-story
  On-demand: dev-improve-code-quality, dev-optimize-performance,
             dev-suggest-refactoring, dev-backlog-debt, sync-documentation

SCRIPTS (10):
  greeting-builder, agent-config-loader, dev-context-loader,
  decision-context, decision-recorder, decision-log-generator,
  decision-log-indexer, validate-task-v2, backlog-manager, workflow-navigator

CHECKLISTS (2):
  story-dod-checklist, self-critique-checklist

TEMPLATES (0 product, 9 service-template):
  Service scaffold templates (client.ts.hbs, errors.ts.hbs, etc.)

WORKFLOWS (8):
  Story Dev Cycle, QA Loop, Greenfield (Fullstack/UI/Service),
  Brownfield (Fullstack/UI/Service)
```

### 3.2 @qa (Quinn) - Test Architect

```
TASKS (16 total):
  Workflow: qa-gate, qa-review-story, qa-create-fix-request
  On-demand: qa-test-design, qa-risk-profile, qa-nfr-assess,
             qa-trace-requirements, qa-generate-tests, qa-run-tests,
             qa-backlog-add-followup, qa-browser-console-check,
             qa-evidence-requirements, qa-false-positive-detection,
             qa-fix-issues, qa-library-validation, qa-migration-validation,
             qa-review-build, qa-security-checklist, qa-review-proposal

SCRIPTS (5):
  greeting-builder, agent-config-loader, validate-task-v2,
  workflow-validator, backlog-manager

CHECKLISTS (1):
  (via qa-gate-tmpl.yaml)

TEMPLATES (1):
  qa-gate-tmpl.yaml

DATA FILES (2):
  test-levels-framework.md, test-priorities-matrix.md

WORKFLOWS (5):
  Story Dev Cycle (Phase 4), QA Loop, Spec Pipeline (Phase 5),
  Brownfield Discovery (Phase 7)

⚠️ CRITICAL: 9 broken task references in agent definition
```

### 3.3 @po (Pax) - Product Owner

```
TASKS (8):
  Workflow: validate-next-story, execute-checklist, shard-doc
  On-demand: po-manage-story-backlog, po-sync-story, po-pull-story,
             correct-course, create-brownfield-story

SCRIPTS (6):
  greeting-builder, agent-config-loader, story-manager,
  story-update-hook, story-index-generator, backlog-manager

CHECKLISTS (2):
  po-master-checklist, change-checklist

TEMPLATES (1):
  story-tmpl.yaml

WORKFLOWS (8):
  Story Dev Cycle (Phase 2), All Greenfield, All Brownfield
```

### 3.4 @pm (Morgan) - Product Manager

```
TASKS (6):
  Workflow: create-doc (+ prd/brownfield-prd), shard-doc,
           brownfield-create-epic, brownfield-create-story,
           spec-gather-requirements, spec-write-spec
  On-demand: correct-course

SCRIPTS (4):
  greeting-builder, agent-config-loader, story-manager,
  workflow-state-manager

CHECKLISTS (2):
  pm-checklist, change-checklist

TEMPLATES (3):
  prd-tmpl.yaml, brownfield-prd-tmpl.yaml, spec-tmpl.md

WORKFLOWS (8):
  All Greenfield (Phase 1), All Brownfield (Planning),
  Brownfield Discovery (Phase 10), Spec Pipeline (Phases 1, 4)
```

### 3.5 @sm (River) - Scrum Master

```
TASKS (3):
  Workflow: create-next-story, execute-checklist, correct-course

SCRIPTS (3):
  greeting-builder, agent-config-loader, workflow-state-manager

CHECKLISTS (1):
  story-draft-checklist

TEMPLATES (1):
  story-tmpl.yaml

WORKFLOWS (8):
  Story Dev Cycle (Phase 1), All Greenfield (Phase 3),
  All Brownfield (Dev Cycle)
```

### 3.6 @architect (Aria) - Holistic System Architect

```
TASKS (7):
  Workflow: document-project, create-doc (+ architecture templates),
           spec-assess-complexity, plan-create-implementation
  On-demand: architect-analyze-impact, collaborative-edit

SCRIPTS (3):
  greeting-builder, agent-config-loader, workflow-validator

CHECKLISTS (1):
  architect-checklist

TEMPLATES (4):
  architecture-tmpl.yaml, fullstack-architecture-tmpl.yaml,
  front-end-architecture-tmpl.yaml, brownfield-architecture-tmpl.yaml

WORKFLOWS (9):
  All Greenfield (Phase 1), All Brownfield (Planning),
  Brownfield Discovery (Phase 1, 4), Spec Pipeline (Phases 2, 6)
```

### 3.7 @analyst (Atlas) - Business Analyst

```
TASKS (4):
  Workflow: facilitate-brainstorming-session, create-deep-research-prompt,
           create-doc (+ market-research/project-brief), document-project

SCRIPTS (2):
  greeting-builder, agent-config-loader

CHECKLISTS (0)

TEMPLATES (4):
  brainstorming-output-tmpl.yaml, market-research-tmpl.yaml,
  competitor-analysis-tmpl.yaml, project-brief-tmpl.yaml

DATA FILES (1):
  brainstorming-techniques.md

WORKFLOWS (5):
  All Greenfield (Phase 1), Brownfield Fullstack (Step 1),
  Brownfield Discovery (Phase 9), Spec Pipeline (Phase 3)
```

### 3.8 @devops (Gage) - DevOps Specialist

```
TASKS (11):
  Workflow: environment-bootstrap, create-worktree, list-worktrees,
           remove-worktree, merge-worktree
  On-demand: github-devops-pre-push-quality-gate,
             github-devops-version-management,
             github-devops-repository-cleanup, ci-cd-configuration,
             release-management, security-audit, search-mcp, add-mcp,
             setup-mcp-docker, setup-github

SCRIPTS (3):
  greeting-builder, generate-greeting, agent-config-loader

CHECKLISTS (2):
  release-checklist, pre-push-checklist

TEMPLATES (4):
  github-actions-ci.yml, github-actions-cd.yml,
  github-pr-template.md, changelog-template.md

WORKFLOWS (3):
  All Greenfield (Phase 0), Auto-Worktree
```

### 3.9 @data-engineer (Dara) - Database Architect

```
TASKS (16):
  Workflow: db-schema-audit, security-audit
  On-demand: setup-database, db-bootstrap, db-domain-modeling,
             db-apply-migration, db-dry-run, db-seed, db-snapshot,
             db-rollback, db-smoke-test, db-env-check, db-run-sql,
             db-load-csv, db-policy-apply, db-verify-order,
             analyze-performance, test-as-user

SCRIPTS (3):
  greeting-builder, generate-greeting, agent-config-loader

CHECKLISTS (3):
  database-design-checklist, dba-predeploy-checklist,
  dba-rollback-checklist

TEMPLATES (7):
  schema-design-tmpl.yaml, migration-plan-tmpl.yaml,
  index-strategy-tmpl.yaml, rls-policies-tmpl.yaml,
  + 3 SQL templates (migration, rollback, smoke-test)

DATA FILES (5):
  database-best-practices.md, supabase-patterns.md,
  postgres-tuning-guide.md, rls-security-patterns.md,
  migration-safety-guide.md

WORKFLOWS (1):
  Brownfield Discovery (Phases 2, 5)
```

### 3.10 @ux-design-expert (Uma) - UX/UI Designer

```
TASKS (8+):
  Workflow: create-doc (+ front-end-spec), generate-ai-frontend-prompt,
           build-component, generate-documentation,
           accessibility-wcag-checklist, calculate-roi
  On-demand: audit-codebase, consolidate-patterns, extract-tokens,
             setup-design-system, wireframe, tokenize, migrate

SCRIPTS (3):
  greeting-builder, generate-greeting, agent-config-loader

CHECKLISTS (4):
  pattern-audit-checklist, component-quality-checklist,
  accessibility-wcag-checklist, migration-readiness-checklist

TEMPLATES (8):
  front-end-spec-tmpl.yaml, front-end-architecture-tmpl.yaml,
  component-react-tmpl.tsx, shock-report-tmpl.html,
  token-exports-css-tmpl.css, token-exports-tailwind-tmpl.js,
  tokens-schema-tmpl.yaml, state-persistence-tmpl.yaml

DATA FILES (6):
  atomic-design-principles.md, consolidation-algorithms.md,
  design-token-best-practices.md, roi-calculation-guide.md,
  integration-patterns.md, wcag-compliance-guide.md

WORKFLOWS (4):
  Design System Build Quality (all 4 phases),
  Greenfield UI/Fullstack (Phase 1),
  Brownfield UI (Step 3), Brownfield Discovery (Phases 3, 6)
```

### 3.11 @aios-master (Orion) - Meta Orchestrator

```
TASKS (8):
  create-doc, shard-doc, execute-checklist, document-project,
  correct-course, create-deep-research-prompt, modify-agent,
  create-task, create-workflow, run-workflow-engine

SCRIPTS (2):
  greeting-builder, agent-config-loader

CHECKLISTS (5):
  architect-checklist, change-checklist, po-master-checklist,
  story-dod-checklist, story-draft-checklist

TEMPLATES (14):
  Most YAML document templates, agent-template.yaml,
  task-template.md, workflow-template.yaml, personalized-agent-template.md

DATA FILES (4):
  aios-kb.md, agent-config-requirements.yaml,
  elicitation-methods.md, technical-preferences.md

WORKFLOWS: Meta-agent (creates/orchestrates workflows, not a participant)
```

### 3.12 @squad-creator (Craft) - Squad Builder

```
TASKS (8):
  squad-creator-create, squad-creator-design, squad-creator-validate,
  squad-creator-list, squad-creator-analyze, squad-creator-extend,
  squad-generate-skills, squad-generate-workflow

SCRIPTS (12):
  greeting-builder, agent-config-loader,
  squad/index, squad-loader, squad-validator, squad-generator,
  squad-designer, squad-migrator, squad-downloader, squad-publisher,
  squad-analyzer, squad-extender

CHECKLISTS (0)

TEMPLATES (19):
  8 squad component templates (squad/ directory),
  10 squad-template scaffold files,
  1 workflow-template.yaml

WORKFLOWS (0): Standalone expansion system, no workflow integration
```

---

## 4. Phase Summaries

### Phase 1: Workflows, Tasks & Agent Commands

- **12 workflows** mapped with agent participation matrix
- **61 tasks** cross-referenced to agents and workflows (36 workflow-integrated, 25 on-demand)
- **~180 agent commands** registered
- **9 CRITICAL broken references** in @qa agent definition
- **3 duplicate task pairs** identified
- **5 naming inconsistencies** documented

**Detail file:** [`WORKFLOW-TASK-AGENT-ANALYSIS.md`](WORKFLOW-TASK-AGENT-ANALYSIS.md)

### Phase 2: Templates, Checklists & Data Files

- **161 files** analyzed across 17 categories
- **127 connected**, **7 confirmed orphans** (all SQL), **27 weak references**
- **Most-connected:** `po-master-checklist.md` (12+ task refs, 6 workflow refs)
- Template engine architecture documented (loader -> validator -> elicitation -> renderer)

**Detail file:** [`xref-phase2-templates.md`](xref-phase2-templates.md)

### Phase 3: Development Scripts & Greeting System

- **37 scripts** (.js files) analyzed across 9 functional categories
- **0 truly orphaned** scripts (all have at least install-manifest reference)
- **5 effectively dead** migration scripts
- **Greeting system** fully documented: 8 files, 3 greeting levels, 2 invocation patterns
- **Squad sub-module:** 10 scripts serving @squad-creator exclusively

**Detail file:** [`xref-phase3-scripts.md`](xref-phase3-scripts.md)

### Phase 4: Infrastructure Scripts & Services

- **115 files** across 6 subdirectories (scripts, integrations, tools, templates, tests, root)
- **90 JS scripts** (47 exported via index.js, 28 standalone, 15+ sub-module)
- **5 PM adapter** integrations (ClickUp, GitHub, Jira, Local + factory)
- **15 tool definitions** (4 CLI, 1 local, 9 MCP)
- **5 confirmed orphans**, **4 likely orphans**, **90% actively used**
- Clean `infrastructure <- core <- development <- product` layering confirmed

**Detail file:** [`xref-phase4-infra.md`](xref-phase4-infra.md)

### Phase 5: Core Modules

- **130 files** across **14 subsystems**
- **Largest:** health-check (35 files), orchestration (19 files), execution (10 files)
- **7 orphaned/partial-orphan** modules identified
- **3 phantom dependencies** (memory-query, session-memory, security-checker path)
- **1 deprecated file:** config-loader.js (target removal v4.0.0)
- All cross-subsystem dependencies documented with coupling matrix

**Detail file:** [`xref-phase5-core.md`](xref-phase5-core.md)

### Phase 6: Supporting Systems

- **12 systems** analyzed, **111 files** cataloged
- **3 missing/empty directories:** agent-teams/, tools/ (empty), processes/
- **3 elicitation file duplicates** between `core/elicitation/` and `elicitation/`
- **5 deprecated standards** docs (old Livro de Ouro versions)
- Config system in transition: monolithic `core-config.yaml` to 4-level hierarchy
- Full interconnection map with data flow diagram

**Detail file:** [`xref-phase6-supporting.md`](xref-phase6-supporting.md)

---

## 5. Complete Orphan Analysis

### 5.1 Confirmed Orphans (19 files)

Files with **no active consumers** anywhere in the runtime codebase.

#### SQL Templates (7 files) -- Phase 2

| File | Location |
|------|----------|
| `tmpl-rls-roles.sql` | `product/templates/` |
| `tmpl-rls-simple.sql` | `product/templates/` |
| `tmpl-rls-tenant.sql` | `product/templates/` |
| `tmpl-stored-proc.sql` | `product/templates/` |
| `tmpl-trigger.sql` | `product/templates/` |
| `tmpl-view-materialized.sql` | `product/templates/` |
| `tmpl-view.sql` | `product/templates/` |

**Recommendation:** Wire to data-engineer tasks or document as manual-use reference templates.

#### Infrastructure Scripts (5 files) -- Phase 4

| File | Location |
|------|----------|
| `changelog-generator.js` | `infrastructure/scripts/` |
| `dashboard-status-writer.js` | `infrastructure/scripts/` |
| `cicd-discovery.js` | `infrastructure/scripts/` |
| `pr-review-ai.js` | `infrastructure/scripts/` |
| `test-discovery.js` | `infrastructure/scripts/` |

**Recommendation:** Archive or integrate into @devops/@qa agent workflows.

#### Core Modules (2 files) -- Phase 5

| File | Location |
|------|----------|
| `ideation-engine.js` | `core/ideation/` |
| `timeline-manager.js` | `core/memory/` |

**Recommendation:** Wire to CLI commands or agent workflows, or remove.

#### Deprecated Standards (5 files) -- Phase 6

| File | Location |
|------|----------|
| `AIOS-LIVRO-DE-OURO.md` | `docs/standards/` |
| `AIOS-LIVRO-DE-OURO-V2.1.md` | `docs/standards/` |
| `AIOS-LIVRO-DE-OURO-V2.1-SUMMARY.md` | `docs/standards/` |
| `AIOS-FRAMEWORK-MASTER.md` | `docs/standards/` |
| `V3-ARCHITECTURAL-DECISIONS.md` | `docs/standards/` |

**Recommendation:** Move to `docs/standards/archive/`.

### 5.2 Likely Orphans (4 files) -- Phase 4

Infrastructure scripts exported via `index.js` but with minimal external consumers.

| File | Reason |
|------|--------|
| `spot-check-validator.js` | Only index.js + install-manifest references |
| `test-utilities-fast.js` | Only index.js + install-manifest + path-analysis |
| `performance-and-error-resolver.js` | Only index.js + install-manifest references |
| `atomic-layer-classifier.js` | Only index.js + install-manifest references |

### 5.3 Partial Orphans (5 files) -- Phase 5

Core modules that are tested or documented but not consumed by other modules.

| File | Status |
|------|--------|
| `permissions/index.js` (+ children) | Documented but not wired to CLI/agents |
| `utils/security-utils.js` | Has tests but unused by other core modules |
| `core/index.esm.js` | ESM barrel prepared for future migration |
| `registry/build-registry.js` | Standalone CLI script |
| `registry/validate-registry.js` | Standalone CLI script |

### 5.4 Dead Migration Scripts (5 files) -- Phase 3

One-time scripts that have completed their purpose.

| File | Original Purpose |
|------|-----------------|
| `apply-inline-greeting-all-agents.js` | Apply inline greeting (Story 6.1.2.5-T1) |
| `batch-update-agents-session-context.js` | Add session context (Story 6.1.2.6.2) |
| `agent-assignment-resolver.js` | Resolve `{TODO: Agent Name}` placeholders |
| `task-identifier-resolver.js` | Resolve `{TODO: task identifier}` placeholders |
| `verify-workflow-gaps.js` | Verify workflow gap fixes |

### 5.5 Weak References (27 files) -- Phase 2

Files referenced only in passive registries (install-manifest, service-registry, workers.csv). Most are dynamically loaded at runtime (HBS templates, IDE rules, personalization templates).

### 5.6 Duplication Issues (6 files)

| Files | Issue |
|-------|-------|
| `core/elicitation/agent-elicitation.js` vs `elicitation/agent-elicitation.js` | Identical content in two locations |
| `core/elicitation/task-elicitation.js` vs `elicitation/task-elicitation.js` | Identical content in two locations |
| `core/elicitation/workflow-elicitation.js` vs `elicitation/workflow-elicitation.js` | Identical content in two locations |

**Recommendation:** Consolidate to `core/elicitation/` and update config references.

### 5.7 Ghost Directories (3)

| Directory | Status | Referenced By |
|-----------|--------|---------------|
| `.aios-core/agent-teams/` | Does not exist | install-manifest, source-tree docs, core-architecture |
| `.aios-core/tools/` | Exists but empty | core-config.yaml, framework-config.yaml |
| `.aios-core/processes/` | Does not exist | Not referenced |

---

## 6. Complete Broken Reference Report

### 6.1 CRITICAL: @qa Agent -- 9 Broken Task References

The `@qa` agent definition (`agents/qa.md`) references 9 task files using non-prefixed names that do NOT exist on the filesystem.

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

**Impact:** If dependency resolution does NOT apply automatic prefix fallback, @qa commands will fail to find task files.

**Fix:** Update `agents/qa.md` to use the full prefixed names matching actual files.

### 6.2 Duplicate Task Files (3 pairs)

| Generic | Agent-Prefixed | Used in Agent Def | Used in YAML Workflow | Issue |
|---------|----------------|--------------------|-----------------------|-------|
| `create-next-story.md` | `sm-create-next-story.md` | @sm uses generic | YAML uses generic | Keep generic, deprecate `sm-` |
| `apply-qa-fixes.md` | `dev-apply-qa-fixes.md` | @dev uses generic | YAML uses `dev-` prefix | **Mismatch!** Standardize. |
| `validate-next-story.md` | `dev-validate-next-story.md` | @po/@dev uses generic | indirect | Different tasks, both valid |

### 6.3 Naming Inconsistencies (5)

| Issue | Severity |
|-------|----------|
| `sm-create-next-story.md` vs `create-next-story.md` in docs vs YAML | MEDIUM |
| `dev-develop-story.md` sometimes referenced without `dev-` prefix | LOW |
| `qa-review-story.md` vs `review-story.md` in brownfield docs | MEDIUM |
| `dev-apply-qa-fixes.md` vs `apply-qa-fixes.md` in YAML vs agent def | MEDIUM |
| `story-dod-checklist.md` path -- checklists dir reference | MEDIUM |

### 6.4 Phantom Dependencies (3 missing modules)

| Referenced Path | Referenced From | Status |
|----------------|-----------------|--------|
| `../memory/memory-query` | execution/context-injector.js, execution/subagent-dispatcher.js | Does not exist (try/catch guarded) |
| `../memory/session-memory` | execution/context-injector.js | Does not exist (try/catch guarded) |
| `../../infrastructure/scripts/security-checker` | elicitation/elicitation-engine.js | Exists outside core/ at infrastructure/scripts/ |

### 6.5 Planned/Future Tasks (3)

| Task | Status |
|------|--------|
| `story-review` | "Em desenvolvimento" |
| `epic-retrospective` | "Em desenvolvimento" |
| `brownfield-migration` | Not yet created |

---

## 7. Architectural Observations

### 7.1 Module Layering

The framework follows a clean dependency hierarchy:

```
infrastructure/   <--   core/   <--   development/   <--   product/
(base layer)          (imports)       (imports)            (imports)
```

- **infrastructure/** has ZERO dependencies on other AIOS modules
- **core/** imports from infrastructure (recovery-handler, build-state-manager, executors)
- **development/** imports from infrastructure (story-manager, greeting-builder)
- **product/** imports from infrastructure (templates, activation-instructions)

### 7.2 Configuration System Transition

The config system is migrating from monolithic to layered:

| Level | File | Mutability | Status |
|-------|------|------------|--------|
| L1 | `framework-config.yaml` | Read-only (framework) | NEW |
| L2 | `project-config.yaml` | Editable (maintainers) | NEW |
| L3 | *(app-specific)* | -- | Not implemented |
| L4 | `local-config.yaml` | Editable (personal) | NEW (template only) |
| Legacy | `core-config.yaml` | All-in-one | Still primary |

### 7.3 Greeting System Architecture

All 12 agents share a unified greeting system:
- **GreetingBuilder** class with contextual, session-aware greetings
- 3 greeting levels (minimal/named/archetypal)
- 2 invocation patterns (direct class / CLI wrapper)
- User preference stored in `core-config.yaml`

### 7.4 Task-First Architecture

Tasks are the atomic unit of work. The framework uses a strict pattern:
- **191 task files** define all executable operations
- Tasks are consumed by **agents** (via dependencies) and **workflows** (via step definitions)
- Only **36 tasks** are embedded in workflow YAMLs; the remaining **155** are on-demand utilities
- The `execute-checklist.md` meta-task can execute any checklist for any agent

### 7.5 Health Check Subsystem

The most self-contained subsystem with **35 files**:
- 5 check domains (project, local, repository, deployment, services)
- 3-tier healing with backup management
- 3 reporter formats (console, markdown, JSON)
- Extends a shared base class pattern

### 7.6 Squad System

The expansion pack system is well-isolated:
- **10 dedicated scripts** in `development/scripts/squad/`
- **19 templates** (8 component + 10 scaffold + 1 workflow)
- @squad-creator agent with 8 commands
- No workflow integration (standalone by design)

---

## 8. Recommendations

### Priority 1: Fix Broken References (CRITICAL)

1. **Fix @qa agent task references** -- Update `agents/qa.md` to use full prefixed names (`qa-generate-tests.md` instead of `generate-tests.md`).
2. **Standardize duplicate tasks** -- Resolve the `apply-qa-fixes.md` vs `dev-apply-qa-fixes.md` mismatch between agent definition and workflow YAML.

### Priority 2: Clean Up Orphans (MEDIUM)

3. **Archive 5 deprecated standards** -- Move old Livro de Ouro docs to `docs/standards/archive/`.
4. **Consolidate 3 elicitation duplicates** -- Keep files in `core/elicitation/` only, update config references.
5. **Wire or remove 7 SQL orphan templates** -- Connect to @data-engineer tasks or document as manual reference.
6. **Archive 5 dead migration scripts** -- Move to `development/scripts/archive/` or delete.

### Priority 3: Address Missing Features (LOW)

7. **Implement memory-query.js and session-memory.js** -- Or remove try/catch references in execution modules.
8. **Wire permissions/ system** -- Connect to CLI guard middleware or agent activation.
9. **Resolve ghost directories** -- Either create `agent-teams/` with content or remove all references.
10. **Populate or remove `.aios-core/tools/`** -- Currently empty despite config references.

### Priority 4: Maintenance (INFO)

11. **Add missing test coverage** -- 10+ core modules lack dedicated tests (see Phase 5 detail).
12. **Complete config migration** -- Finish transition from `core-config.yaml` to L1-L4 hierarchy.
13. **Wire 5 orphaned infra scripts** -- Integrate `changelog-generator`, `cicd-discovery`, `test-discovery`, `pr-review-ai`, `dashboard-status-writer` into agent workflows or archive.

---

## 9. Phase Detail Files

For complete per-file analysis, see the individual phase documents:

| Phase | File | Scope |
|-------|------|-------|
| 1 | [`WORKFLOW-TASK-AGENT-ANALYSIS.md`](WORKFLOW-TASK-AGENT-ANALYSIS.md) | 12 workflows, 191 tasks, 11 agents |
| 2 | [`xref-phase2-templates.md`](xref-phase2-templates.md) | 161 templates, checklists, data files |
| 3 | [`xref-phase3-scripts.md`](xref-phase3-scripts.md) | 37 dev scripts + greeting system |
| 4 | [`xref-phase4-infra.md`](xref-phase4-infra.md) | 115 infrastructure files |
| 5 | [`xref-phase5-core.md`](xref-phase5-core.md) | 130 core module files |
| 6 | [`xref-phase6-supporting.md`](xref-phase6-supporting.md) | 12 supporting systems, 111 files |

---

*AIOS Complete Cross-Reference Analysis*
*Story: AIOS-XREF-001*
*Generated: 2026-02-05*
*Total artifacts analyzed: ~745 files across 25 entity types*
