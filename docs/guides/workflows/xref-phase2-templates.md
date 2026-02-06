# Cross-Reference Phase 2: Templates, Checklists & Data Files

**Generated:** 2026-02-05
**Scope:** All templates, checklists, and data files in `.aios-core/` mapped to consuming tasks, agents, and workflows.

---

## Table of Contents

1. [Product Templates (YAML Document Templates)](#1-product-templates---yaml-document-templates)
2. [Product Templates (Handlebars / HBS)](#2-product-templates---handlebars-hbs)
3. [Product Templates (SQL)](#3-product-templates---sql)
4. [Product Templates (IDE Rules)](#4-product-templates---ide-rules)
5. [Product Templates (Personalization)](#5-product-templates---personalization)
6. [Product Templates (Meta / Structural)](#6-product-templates---meta--structural)
7. [Product Templates (Code / Config)](#7-product-templates---code--config)
8. [Product Templates (Engine)](#8-product-templates---template-engine)
9. [Development Templates (Squad)](#9-development-templates---squad)
10. [Development Templates (Service)](#10-development-templates---service-template)
11. [Development Templates (Squad-Template Scaffold)](#11-development-templates---squad-template-scaffold)
12. [Development Templates (Other)](#12-development-templates---other)
13. [Product Checklists](#13-product-checklists)
14. [Product Data Files](#14-product-data-files)
15. [Framework Data Files (.aios-core/data/)](#15-framework-data-files)
16. [Summary Statistics](#16-summary-statistics)
17. [Orphaned Files](#17-orphaned-files)

---

## 1. Product Templates - YAML Document Templates

Location: `.aios-core/product/templates/`

These are YAML-based document generation templates used by the `create-doc` task and the template engine.

| # | File | Consuming Task(s) | Consuming Agent(s) | Workflow(s) | Orphan? |
|---|------|--------------------|---------------------|-------------|---------|
| 1 | `architecture-tmpl.yaml` | create-doc | architect, aios-master | greenfield-service (architecture step) | No |
| 2 | `brainstorming-output-tmpl.yaml` | analyst-facilitate-brainstorming | analyst, aios-master | -- | No |
| 3 | `brownfield-architecture-tmpl.yaml` | create-doc | architect, aios-master | brownfield-ui, brownfield-service, brownfield-fullstack | No |
| 4 | `brownfield-prd-tmpl.yaml` | create-doc | pm, aios-master | brownfield-ui, brownfield-service, brownfield-fullstack | No |
| 5 | `competitor-analysis-tmpl.yaml` | create-doc | analyst, aios-master | -- | No |
| 6 | `design-story-tmpl.yaml` | create-doc (implicit) | -- | -- | **WEAK** |
| 7 | `front-end-architecture-tmpl.yaml` | create-doc | architect, aios-master, ux-design-expert | greenfield-ui, greenfield-fullstack | No |
| 8 | `front-end-spec-tmpl.yaml` | create-doc | ux-design-expert, aios-master | greenfield-ui, greenfield-fullstack, brownfield-ui | No |
| 9 | `fullstack-architecture-tmpl.yaml` | create-doc | architect, aios-master | greenfield-fullstack | No |
| 10 | `index-strategy-tmpl.yaml` | create-doc | data-engineer | -- | No |
| 11 | `market-research-tmpl.yaml` | create-doc | analyst, aios-master | -- | No |
| 12 | `migration-plan-tmpl.yaml` | create-doc | data-engineer | -- | No |
| 13 | `prd-tmpl.yaml` | create-doc | pm, aios-master | greenfield-ui, greenfield-service, greenfield-fullstack (implicit) | No |
| 14 | `project-brief-tmpl.yaml` | create-doc | analyst, aios-master | -- | No |
| 15 | `qa-gate-tmpl.yaml` | qa-run-tests, qa-review-story | qa | qa-loop | No |
| 16 | `rls-policies-tmpl.yaml` | create-doc | data-engineer | -- | No |
| 17 | `schema-design-tmpl.yaml` | db-domain-modeling, create-doc | data-engineer | -- | No |
| 18 | `state-persistence-tmpl.yaml` | create-doc | ux-design-expert | -- | No |
| 19 | `story-tmpl.yaml` | create-doc, create-next-story, sm-create-next-story, dev-validate-next-story, validate-next-story | po, sm, qa, aios-master | story-development-cycle (implicit) | No |
| 20 | `tokens-schema-tmpl.yaml` | create-doc | ux-design-expert | -- | No |

---

## 2. Product Templates - Handlebars (HBS)

Location: `.aios-core/product/templates/`

These are Handlebars templates rendered by the template engine for structured document generation.

| # | File | Consuming Task(s) | Consuming Agent(s) | Workflow(s) | Orphan? |
|---|------|--------------------|---------------------|-------------|---------|
| 1 | `adr.hbs` | create-doc (via template engine) | architect (implicit) | -- | **WEAK** |
| 2 | `dbdr.hbs` | create-doc (via template engine) | data-engineer (implicit) | -- | **WEAK** |
| 3 | `epic.hbs` | create-doc (via template engine) | po (implicit) | -- | **WEAK** |
| 4 | `pmdr.hbs` | create-doc (via template engine) | pm (implicit) | -- | **WEAK** |
| 5 | `prd.hbs` | create-doc (via template engine) | pm (implicit) | -- | **WEAK** |
| 6 | `prd-v2.0.hbs` | create-doc (via template engine/loader) | pm (implicit) | -- | **WEAK** |
| 7 | `story.hbs` | create-doc (via template engine) | po, sm (implicit) | -- | **WEAK** |
| 8 | `task.hbs` | create-doc (via template engine) | aios-master (implicit) | -- | **WEAK** |

**Note:** HBS templates are loaded dynamically by the template engine (`loader.js`). They are paired with schemas in `engine/schemas/`. References are implicit through the `create-doc` task which selects templates at runtime based on user input. The engine handles versioned templates (e.g., `prd-v2` resolves to `prd-v2.0.hbs`).

---

## 3. Product Templates - SQL

Location: `.aios-core/product/templates/`

SQL templates for database operations, used by the data-engineer agent.

| # | File | Consuming Task(s) | Consuming Agent(s) | Workflow(s) | Orphan? |
|---|------|--------------------|---------------------|-------------|---------|
| 1 | `tmpl-migration-script.sql` | db-apply-migration (implicit) | data-engineer | -- | No |
| 2 | `tmpl-rollback-script.sql` | db-rollback (implicit) | data-engineer | -- | No |
| 3 | `tmpl-smoke-test.sql` | db-smoke-test | data-engineer | -- | No |
| 4 | `tmpl-seed-data.sql` | db-seed (implicit) | data-engineer | -- | No |
| 5 | `tmpl-staging-copy-merge.sql` | -- | data-engineer | -- | No |
| 6 | `tmpl-comment-on-examples.sql` | -- | data-engineer | -- | No |
| 7 | `tmpl-rls-kiss-policy.sql` | db-rls-audit (implicit) | data-engineer | -- | No |
| 8 | `tmpl-rls-granular-policies.sql` | db-rls-audit (implicit) | data-engineer | -- | No |
| 9 | `tmpl-rls-roles.sql` | -- | -- | -- | **YES** |
| 10 | `tmpl-rls-simple.sql` | -- | -- | -- | **YES** |
| 11 | `tmpl-rls-tenant.sql` | -- | -- | -- | **YES** |
| 12 | `tmpl-stored-proc.sql` | -- | -- | -- | **YES** |
| 13 | `tmpl-trigger.sql` | -- | -- | -- | **YES** |
| 14 | `tmpl-view-materialized.sql` | -- | -- | -- | **YES** |
| 15 | `tmpl-view.sql` | -- | -- | -- | **YES** |

**Note:** SQL templates `tmpl-rls-roles`, `tmpl-rls-simple`, `tmpl-rls-tenant`, `tmpl-stored-proc`, `tmpl-trigger`, `tmpl-view-materialized`, and `tmpl-view` are only referenced in the install-manifest. No tasks or agents reference them directly.

---

## 4. Product Templates - IDE Rules

Location: `.aios-core/product/templates/ide-rules/`

IDE-specific rule files generated during project setup. Referenced in service-registry and workers.csv but not directly consumed by any task or agent.

| # | File | Consuming Task(s) | Consuming Agent(s) | Workflow(s) | Orphan? |
|---|------|--------------------|---------------------|-------------|---------|
| 1 | `antigravity-rules.md` | -- (service-registry, workers.csv) | -- | -- | **WEAK** |
| 2 | `claude-rules.md` | -- (service-registry, workers.csv) | -- | -- | **WEAK** |
| 3 | `cline-rules.md` | -- (service-registry, workers.csv) | -- | -- | **WEAK** |
| 4 | `copilot-rules.md` | -- (service-registry, workers.csv) | -- | -- | **WEAK** |
| 5 | `cursor-rules.md` | -- (service-registry, workers.csv) | -- | -- | **WEAK** |
| 6 | `roo-rules.md` | -- (service-registry, workers.csv) | -- | -- | **WEAK** |
| 7 | `windsurf-rules.md` | -- (service-registry, workers.csv) | -- | -- | **WEAK** |

**Note:** IDE rules are output artifacts deployed to target projects. They are registered in the service-registry and workers.csv, which means they are available for lookup and discovery, but no task or agent currently automates their deployment. They likely serve as reference content or are deployed manually/externally.

---

## 5. Product Templates - Personalization

Location: `.aios-core/product/templates/`

Meta-templates used for creating personalized framework components.

| # | File | Consuming Task(s) | Consuming Agent(s) | Workflow(s) | Orphan? |
|---|------|--------------------|---------------------|-------------|---------|
| 1 | `personalized-agent-template.md` | create-doc (implicit), modify-agent | aios-master (implicit) | -- | No |
| 2 | `personalized-checklist-template.md` | create-doc (implicit) | -- | -- | **WEAK** |
| 3 | `personalized-task-template.md` | create-doc (implicit), create-task | -- | -- | **WEAK** |
| 4 | `personalized-task-template-v2.md` | create-doc (implicit) | -- | -- | **WEAK** |
| 5 | `personalized-template-file.yaml` | create-doc (implicit) | -- | -- | **WEAK** |
| 6 | `personalized-workflow-template.yaml` | create-doc (implicit) | -- | -- | **WEAK** |

**Note:** Personalized templates are registered in service-registry and workers.csv. They serve as structural blueprints for the `create-doc`/`create-task` family of tasks. The `personalized-task-template-v2.md` references `task-execution-report.md` and `story-tmpl.yaml`.

---

## 6. Product Templates - Meta / Structural

Location: `.aios-core/product/templates/`

Templates that define the structure of framework components (agents, tasks, workflows).

| # | File | Consuming Task(s) | Consuming Agent(s) | Workflow(s) | Orphan? |
|---|------|--------------------|---------------------|-------------|---------|
| 1 | `agent-template.yaml` | modify-agent, create-doc | aios-master | -- | No |
| 2 | `task-template.md` | create-task (implicit), squad-creator-extend | aios-master | -- | No |
| 3 | `workflow-template.yaml` | squad-creator-extend, verify-workflow-gaps (script) | aios-master | -- | No |
| 4 | `activation-instructions-template.md` | -- (service-registry) | -- | -- | **WEAK** |
| 5 | `activation-instructions-inline-greeting.yaml` | -- | -- | -- | **WEAK** |
| 6 | `task-execution-report.md` | validate-task-v2 (script), personalized-workflow-template | -- | -- | **WEAK** |
| 7 | `command-rationalization-matrix.md` | -- (service-registry, workers.csv) | -- | -- | **WEAK** |

---

## 7. Product Templates - Code / Config

Location: `.aios-core/product/templates/`

Code and configuration templates for specific technical purposes.

| # | File | Consuming Task(s) | Consuming Agent(s) | Workflow(s) | Orphan? |
|---|------|--------------------|---------------------|-------------|---------|
| 1 | `component-react-tmpl.tsx` | build-component (implicit) | ux-design-expert | design-system-build-quality (implicit) | No |
| 2 | `shock-report-tmpl.html` | generate-shock-report | ux-design-expert | -- | No |
| 3 | `token-exports-css-tmpl.css` | export-design-tokens-dtcg | ux-design-expert | -- | No |
| 4 | `token-exports-tailwind-tmpl.js` | export-design-tokens-dtcg | ux-design-expert | -- | No |
| 5 | `eslintrc-security.json` | security-scan | -- | -- | No |
| 6 | `github-actions-ci.yml` | ci-cd-configuration (implicit) | devops | -- | No |
| 7 | `github-actions-cd.yml` | ci-cd-configuration (implicit) | devops | -- | No |
| 8 | `github-pr-template.md` | setup-github (implicit) | devops | -- | No |
| 9 | `changelog-template.md` | github-devops-version-management (implicit) | devops | -- | No |
| 10 | `mcp-workflow.js` | mcp-workflow | -- | -- | No |
| 11 | `gordon-mcp.yaml` | setup-mcp-docker, add-mcp | devops (implicit) | -- | No |
| 12 | `migration-strategy-tmpl.md` | -- | ux-design-expert | -- | No |
| 13 | `ds-artifact-analysis.md` | ux-ds-scan-artifact (implicit) | ux-design-expert | -- | No |
| 14 | `spec-tmpl.md` | spec-write-spec | -- | spec-pipeline | No |
| 15 | `qa-report-tmpl.md` | qa-report-generator (script) | -- | -- | No |
| 16 | `current-approach-tmpl.md` | approach-manager (script) | -- | -- | No |

---

## 8. Product Templates - Template Engine

Location: `.aios-core/product/templates/engine/`

Engine files that power template loading, rendering, validation and elicitation.

| # | File | Category | Consuming Task(s) | Consumed By |
|---|------|----------|--------------------|-------------|
| 1 | `engine/index.js` | Engine core | create-doc (runtime) | All template consumers |
| 2 | `engine/loader.js` | Template loading | create-doc (runtime) | Template engine |
| 3 | `engine/renderer.js` | Template rendering | create-doc (runtime) | Template engine |
| 4 | `engine/validator.js` | Schema validation | create-doc (runtime) | Template engine |
| 5 | `engine/elicitation.js` | User interaction | create-doc (runtime) | Template engine |
| 6 | `engine/schemas/adr.schema.json` | Schema | validator.js | adr.hbs |
| 7 | `engine/schemas/dbdr.schema.json` | Schema | validator.js | dbdr.hbs |
| 8 | `engine/schemas/epic.schema.json` | Schema | validator.js | epic.hbs |
| 9 | `engine/schemas/pmdr.schema.json` | Schema | validator.js | pmdr.hbs |
| 10 | `engine/schemas/prd.schema.json` | Schema | validator.js | prd.hbs |
| 11 | `engine/schemas/prd-v2.schema.json` | Schema | validator.js | prd-v2.0.hbs |
| 12 | `engine/schemas/story.schema.json` | Schema | validator.js | story.hbs |
| 13 | `engine/schemas/task.schema.json` | Schema | validator.js | task.hbs |

---

## 9. Development Templates - Squad

Location: `.aios-core/development/templates/squad/`

Templates used by the squad-creator agent for extending squads with new components.

| # | File | Consuming Task(s) | Consuming Agent(s) | Workflow(s) | Orphan? |
|---|------|--------------------|---------------------|-------------|---------|
| 1 | `agent-template.md` | squad-creator-extend | squad-creator | -- | No |
| 2 | `checklist-template.md` | squad-creator-extend | squad-creator | -- | No |
| 3 | `data-template.yaml` | squad-creator-extend | squad-creator | -- | No |
| 4 | `script-template.js` | squad-creator-extend | squad-creator | -- | No |
| 5 | `task-template.md` | squad-creator-extend, squad-extender.js | squad-creator | -- | No |
| 6 | `template-template.md` | squad-creator-extend | squad-creator | -- | No |
| 7 | `tool-template.js` | squad-creator-extend | squad-creator | -- | No |
| 8 | `workflow-template.yaml` | squad-creator-extend, squad-extender.js | squad-creator | -- | No |

---

## 10. Development Templates - Service Template

Location: `.aios-core/development/templates/service-template/`

Scaffold templates for creating new microservice packages.

| # | File | Consuming Task(s) | Consuming Agent(s) | Workflow(s) | Orphan? |
|---|------|--------------------|---------------------|-------------|---------|
| 1 | `client.ts.hbs` | create-service | dev (implicit) | -- | No |
| 2 | `errors.ts.hbs` | create-service | dev (implicit) | -- | No |
| 3 | `index.ts.hbs` | create-service | dev (implicit) | -- | No |
| 4 | `jest.config.js` | create-service | dev (implicit) | -- | No |
| 5 | `package.json.hbs` | create-service | dev (implicit) | -- | No |
| 6 | `README.md.hbs` | create-service | dev (implicit) | -- | No |
| 7 | `tsconfig.json` | create-service | dev (implicit) | -- | No |
| 8 | `types.ts.hbs` | create-service | dev (implicit) | -- | No |
| 9 | `__tests__/index.test.ts.hbs` | create-service | dev (implicit) | -- | No |

---

## 11. Development Templates - Squad-Template Scaffold

Location: `.aios-core/development/templates/squad-template/`

Full project scaffold used when creating new expansion packs (squads).

| # | File | Consuming Task(s) | Consuming Agent(s) | Workflow(s) | Orphan? |
|---|------|--------------------|---------------------|-------------|---------|
| 1 | `.gitignore` | squad-creator-extend (implicit) | squad-creator | -- | No |
| 2 | `LICENSE` | squad-creator-extend (implicit) | squad-creator | -- | No |
| 3 | `README.md` | squad-creator-extend (implicit) | squad-creator | -- | No |
| 4 | `package.json` | squad-creator-extend (implicit) | squad-creator | -- | No |
| 5 | `squad.yaml` | squad-creator-extend (implicit) | squad-creator | -- | No |
| 6 | `agents/example-agent.yaml` | squad-creator-extend (implicit) | squad-creator | -- | No |
| 7 | `tasks/example-task.yaml` | squad-creator-extend (implicit) | squad-creator | -- | No |
| 8 | `templates/example-template.md` | squad-creator-extend (implicit) | squad-creator | -- | No |
| 9 | `tests/example-agent.test.js` | squad-creator-extend (implicit) | squad-creator | -- | No |
| 10 | `workflows/example-workflow.yaml` | squad-creator-extend (implicit) | squad-creator | -- | No |

---

## 12. Development Templates - Other

Location: `.aios-core/development/templates/`

| # | File | Consuming Task(s) | Consuming Agent(s) | Workflow(s) | Orphan? |
|---|------|--------------------|---------------------|-------------|---------|
| 1 | `aios-doc-template.md` | create-doc (implicit) | -- | -- | **WEAK** |
| 2 | `subagent-step-prompt.md` | run-workflow-engine | aios-master | -- | No |

---

## 13. Product Checklists

Location: `.aios-core/product/checklists/`

| # | File | Consuming Task(s) | Consuming Agent(s) | Workflow(s) | Orphan? |
|---|------|--------------------|---------------------|-------------|---------|
| 1 | `architect-checklist.md` | execute-checklist, analyze-cross-artifact | architect, aios-master | -- | No |
| 2 | `change-checklist.md` | correct-course, modify-agent, modify-task, modify-workflow, update-manifest, qa-review-proposal, propose-modification, brownfield-create-epic | pm, po, aios-master | -- | No |
| 3 | `pm-checklist.md` | execute-checklist (via prd-tmpl.yaml), analyze-cross-artifact | pm, aios-master | -- | No |
| 4 | `po-master-checklist.md` | execute-checklist, validate-next-story, create-next-story, sm-create-next-story, create-brownfield-story, brownfield-create-story, brownfield-create-epic, qa-trace-requirements, dev-validate-next-story, po-sync-story-to-clickup, po-pull-story-from-clickup | po, aios-master | greenfield-ui, greenfield-service, greenfield-fullstack, brownfield-ui, brownfield-service, brownfield-fullstack | No |
| 5 | `story-dod-checklist.md` | execute-checklist, dev-develop-story, analyze-cross-artifact, build-autonomous | dev, aios-master | story-development-cycle (implicit) | No |
| 6 | `story-draft-checklist.md` | create-next-story, sm-create-next-story, analyze-cross-artifact | sm, aios-master | -- | No |
| 7 | `self-critique-checklist.md` | plan-execute-subtask, build-autonomous, document-gotchas | dev | -- | No |
| 8 | `release-checklist.md` | execute-checklist (implicit) | devops | -- | No |
| 9 | `pre-push-checklist.md` | execute-checklist (implicit) | devops | -- | No |
| 10 | `database-design-checklist.md` | execute-checklist (implicit) | data-engineer | -- | No |
| 11 | `dba-predeploy-checklist.md` | execute-checklist (implicit) | data-engineer | -- | No |
| 12 | `dba-rollback-checklist.md` | execute-checklist (implicit) | data-engineer | -- | No |
| 13 | `pattern-audit-checklist.md` | execute-checklist (implicit) | ux-design-expert | -- | No |
| 14 | `component-quality-checklist.md` | execute-checklist (implicit) | ux-design-expert | -- | No |
| 15 | `accessibility-wcag-checklist.md` | execute-checklist (via *a11y-check command) | ux-design-expert | -- | No |
| 16 | `migration-readiness-checklist.md` | execute-checklist (implicit) | ux-design-expert | -- | No |

---

## 14. Product Data Files

Location: `.aios-core/product/data/`

| # | File | Consuming Task(s) | Consuming Agent(s) | Workflow(s) | Orphan? |
|---|------|--------------------|---------------------|-------------|---------|
| 1 | `brainstorming-techniques.md` | analyst-facilitate-brainstorming | analyst, aios-master | -- | No |
| 2 | `elicitation-methods.md` | advanced-elicitation, create-doc | aios-master | -- | No |
| 3 | `mode-selection-best-practices.md` | -- (agent-config-requirements) | -- | -- | **WEAK** |
| 4 | `atomic-design-principles.md` | -- | ux-design-expert | -- | No |
| 5 | `consolidation-algorithms.md` | -- | ux-design-expert | -- | No |
| 6 | `design-token-best-practices.md` | -- | ux-design-expert | -- | No |
| 7 | `roi-calculation-guide.md` | -- | ux-design-expert | -- | No |
| 8 | `integration-patterns.md` | -- | ux-design-expert | -- | No |
| 9 | `wcag-compliance-guide.md` | -- | ux-design-expert | -- | No |
| 10 | `database-best-practices.md` | -- | data-engineer | -- | No |
| 11 | `supabase-patterns.md` | -- | data-engineer | -- | No |
| 12 | `postgres-tuning-guide.md` | -- | data-engineer | -- | No |
| 13 | `rls-security-patterns.md` | -- | data-engineer | -- | No |
| 14 | `migration-safety-guide.md` | -- | data-engineer | -- | No |
| 15 | `test-levels-framework.md` | qa-test-design | qa (via agent-config-requirements) | -- | No |
| 16 | `test-priorities-matrix.md` | qa-test-design | qa (via agent-config-requirements) | -- | No |

---

## 15. Framework Data Files

Location: `.aios-core/data/`

| # | File | Consuming Task(s) | Consuming Agent(s) | Workflow(s) | Orphan? |
|---|------|--------------------|---------------------|-------------|---------|
| 1 | `aios-kb.md` | -- (knowledge base) | analyst, aios-master | greenfield-ui, greenfield-service, greenfield-fullstack, brownfield-ui, brownfield-service, brownfield-fullstack | No |
| 2 | `agent-config-requirements.yaml` | -- (config-loader, agent-config-loader scripts) | All agents (configuration) | -- | No |
| 3 | `learned-patterns.yaml` | patterns (learn-patterns) | -- | -- | No |
| 4 | `workflow-patterns.yaml` | -- (workflow-registry, workflow-navigator scripts) | sm (via agent-config-requirements) | All workflows (runtime) | No |
| 5 | `workflow-state-schema.yaml` | -- (referenced by workflow-patterns.yaml, verify-workflow-gaps script) | -- | All workflows (schema) | No |
| 6 | `technical-preferences.md` | qa-nfr-assess, qa-review-story, spec-research-dependencies | architect, pm, qa, ux-design-expert, aios-master | -- | No |
| 7 | `tech-presets/_template.md` | validate-tech-preset | -- | -- | No |
| 8 | `tech-presets/nextjs-react.md` | validate-tech-preset | -- | -- | No |

---

## 16. Summary Statistics

### Total File Counts

| Category | Total Files | Connected | Orphaned | Weak |
|----------|-------------|-----------|----------|------|
| Product Templates (YAML) | 20 | 19 | 0 | 1 |
| Product Templates (HBS) | 8 | 0 | 0 | 8 |
| Product Templates (SQL) | 15 | 8 | 7 | 0 |
| Product Templates (IDE Rules) | 7 | 0 | 0 | 7 |
| Product Templates (Personalization) | 6 | 1 | 0 | 5 |
| Product Templates (Meta/Structural) | 7 | 3 | 0 | 4 |
| Product Templates (Code/Config) | 16 | 16 | 0 | 0 |
| Product Templates (Engine) | 13 | 13 | 0 | 0 |
| Dev Templates (Squad) | 8 | 8 | 0 | 0 |
| Dev Templates (Service) | 9 | 9 | 0 | 0 |
| Dev Templates (Squad Scaffold) | 10 | 10 | 0 | 0 |
| Dev Templates (Other) | 2 | 1 | 0 | 1 |
| **Product Checklists** | **16** | **16** | **0** | **0** |
| **Product Data** | **16** | **15** | **0** | **1** |
| **Framework Data** | **8** | **8** | **0** | **0** |
| **TOTALS** | **161** | **127** | **7** | **27** |

### Orphan Classification

- **YES (7 files):** No references found outside install-manifest. These files exist in the codebase but are never consumed by any task, agent, or workflow.
- **WEAK (27 files):** Referenced only in passive registries (install-manifest, service-registry, workers.csv, documentation) but not actively consumed by any task execution path. These include:
  - HBS templates (loaded dynamically by the template engine, so they ARE used at runtime through `create-doc`)
  - IDE rules (deployed to target projects, not consumed by AIOS agents)
  - Personalization templates (meta-templates used as structural references)

### Most-Connected Files

| File | # Task Refs | # Agent Refs | # Workflow Refs |
|------|-------------|--------------|-----------------|
| `po-master-checklist.md` | 12+ | 2 | 6 |
| `story-tmpl.yaml` | 5+ | 4 | 1+ |
| `change-checklist.md` | 8+ | 3 | 0 |
| `story-dod-checklist.md` | 5+ | 3 | 1+ |
| `technical-preferences.md` | 3+ | 5 | 0 |
| `architecture-tmpl.yaml` | 1+ | 2 | 1 |
| `fullstack-architecture-tmpl.yaml` | 1+ | 2 | 1 |
| `brownfield-architecture-tmpl.yaml` | 1+ | 2 | 3 |
| `brownfield-prd-tmpl.yaml` | 1+ | 2 | 3 |
| `self-critique-checklist.md` | 3+ | 1 | 0 |

### Agent Coverage

| Agent | Templates Used | Checklists Used | Data Files Used |
|-------|----------------|-----------------|-----------------|
| aios-master | 14 | 5 | 4 |
| ux-design-expert | 8 | 4 | 6 |
| data-engineer | 7 | 3 | 5 |
| architect | 4 | 1 | 1 |
| analyst | 4 | 0 | 1 |
| pm | 3 | 2 | 1 |
| po | 1 | 2 | 0 |
| qa | 2 | 1 | 1 |
| sm | 2 | 1 | 0 |
| devops | 4 | 2 | 0 |
| dev | 0 | 2 | 0 |
| squad-creator | 0 (uses squad/ templates) | 0 | 0 |

---

## 17. Orphaned Files

### Confirmed Orphans (7 files)

These files exist in `.aios-core/product/templates/` and are listed in the install-manifest, but are not referenced by any task, agent, workflow, or script:

| # | File | Category | Notes |
|---|------|----------|-------|
| 1 | `tmpl-rls-roles.sql` | SQL | RLS roles template - no task/agent references |
| 2 | `tmpl-rls-simple.sql` | SQL | Simple RLS template - no task/agent references |
| 3 | `tmpl-rls-tenant.sql` | SQL | Tenant RLS template - no task/agent references |
| 4 | `tmpl-stored-proc.sql` | SQL | Stored procedure template - no task/agent references |
| 5 | `tmpl-trigger.sql` | SQL | Database trigger template - no task/agent references |
| 6 | `tmpl-view-materialized.sql` | SQL | Materialized view template - no task/agent references |
| 7 | `tmpl-view.sql` | SQL | View template - no task/agent references |

**Recommendation:** These 7 SQL templates should either be:
1. Referenced by the `data-engineer` agent's templates list (like the other SQL templates are), or
2. Connected to specific database tasks (e.g., a new `db-create-view` task), or
3. Documented as "available but manual use only" reference templates.

### Weak References (27 files)

These files exist in registries but lack direct task/agent consumption paths. Most are:
- **HBS templates (8):** Actually consumed dynamically by the template engine at runtime. Not truly orphaned.
- **IDE rules (7):** Output artifacts for target projects. Consumed externally, not by AIOS tasks.
- **Personalization templates (5):** Meta-templates used as structural blueprints.
- **Other (7):** Various structural/documentation templates with registry-only references.

---

## Appendix: Template-to-Task Mapping via `create-doc`

The `create-doc.md` task is the primary template consumer. It dynamically loads templates from `.aios-core/product/templates/` based on user selection at runtime. The following templates are consumable through `create-doc`:

All YAML templates (`*-tmpl.yaml`) and all HBS templates (`*.hbs`) can be selected through the `create-doc` task's interactive template picker. The template engine (`engine/`) handles loading, validation, elicitation, and rendering.

### Template Engine Flow

```
User calls create-doc
  -> engine/index.js orchestrates
    -> engine/loader.js loads .hbs template + YAML frontmatter
    -> engine/validator.js validates against engine/schemas/*.schema.json
    -> engine/elicitation.js collects user inputs
    -> engine/renderer.js renders Handlebars template with collected data
  -> Output: Generated document
```

---

*Generated by Phase 2 Cross-Reference Analysis*
