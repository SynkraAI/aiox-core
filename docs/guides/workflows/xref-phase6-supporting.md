# AIOS Cross-Reference Phase 6: Supporting Systems Analysis

> **Generated:** 2026-02-05
> **Scope:** All supporting systems in `.aios-core/`
> **Total Files Analyzed:** ~130 files across 12 subsystems

---

## Table of Contents

1. [Workflow Intelligence System](#1-workflow-intelligence-system)
2. [Monitor Hooks System](#2-monitor-hooks-system)
3. [Quality Gates System](#3-quality-gates-system)
4. [Schemas System](#4-schemas-system)
5. [CLI Commands System](#5-cli-commands-system)
6. [Agent Teams System](#6-agent-teams-system)
7. [Tools Config System](#7-tools-config-system)
8. [Manifests System](#8-manifests-system)
9. [Elicitation System](#9-elicitation-system)
10. [Docs/Standards System](#10-docsstandards-system)
11. [Processes System](#11-processes-system)
12. [Root Config System](#12-root-config-system)
13. [Overall Supporting Systems Summary](#13-overall-supporting-systems-summary)
14. [Orphaned Files Across All Systems](#14-orphaned-files-across-all-systems)
15. [Supporting Systems Interconnection Map](#15-supporting-systems-interconnection-map)

---

## 1. Workflow Intelligence System

**Location:** `.aios-core/workflow-intelligence/`
**Total Files:** 19
**Purpose:** Provides intelligent workflow analysis, suggestions, pattern learning, and confidence scoring for the AIOS agent orchestration system.

### Architecture

The Workflow Intelligence System (WIS) is organized into three submodules:

- **engine/** -- Core analysis engines (confidence scoring, wave analysis, suggestion generation, output formatting)
- **learning/** -- Pattern capture, storage, validation, semantic search, QA feedback, and gotcha registry
- **registry/** -- Workflow registry for cataloging available workflows

### File Inventory

| File | Purpose | Consumers | Cross-refs | Orphan? |
|------|---------|-----------|------------|---------|
| `workflow-intelligence/index.js` | Main entry point; exports all WIS modules | CLI commands, orchestration core, tests | `engine/*`, `learning/*`, `registry/*` | No |
| `engine/confidence-scorer.js` | Calculates confidence scores for workflow suggestions | `suggestion-engine.js`, tests | Consumes workflow data | No |
| `engine/suggestion-engine.js` | Generates workflow suggestions based on context | `index.js`, tests | Uses `confidence-scorer`, `workflow-registry` | No |
| `engine/wave-analyzer.js` | Analyzes wave-based execution patterns | `index.js`, wave-executor, tests | Used by `wave-executor.js` in core | No |
| `engine/output-formatter.js` | Formats WIS output for CLI display | `index.js`, CLI layer | Standalone formatting utility | No |
| `learning/index.js` | Entry point for pattern learning subsystem | `index.js`, tests | Exports `PatternCapture`, `PatternValidator`, `PatternStore` | No |
| `learning/pattern-capture.js` | Captures session patterns (commands, agent sequences) | `learning/index.js`, `capture-hook.js` | Unit tests in `tests/unit/workflow-intelligence/` | No |
| `learning/pattern-store.js` | Persists and retrieves captured patterns | `learning/index.js`, tests | Filesystem-based storage | No |
| `learning/pattern-validator.js` | Validates captured patterns before storage | `learning/index.js`, tests | Validates against schema rules | No |
| `learning/capture-hook.js` | Hook to automatically capture patterns during sessions | `index.js` | References `workflow-intelligence/learning` | No |
| `learning/gotcha-registry.js` | Stores common pitfalls and gotchas per workflow | `learning/index.js` | Referenced by QA feedback | No |
| `learning/qa-feedback.js` | Integrates QA feedback into learning system | `learning/index.js` | References `gotcha-registry` | No |
| `learning/semantic-search.js` | Semantic search over captured patterns | `learning/index.js` | Used by suggestion engine | No |
| `registry/workflow-registry.js` | Central registry of all available workflows | `index.js`, `suggestion-engine.js` | Loads from `.aios-core/development/workflows/` | No |
| `__tests__/confidence-scorer.test.js` | Unit tests for confidence scorer | Test runner | Tests `engine/confidence-scorer.js` | No |
| `__tests__/wave-analyzer.test.js` | Unit tests for wave analyzer | Test runner | Tests `engine/wave-analyzer.js` | No |
| `__tests__/workflow-registry.test.js` | Unit tests for workflow registry | Test runner | Tests `registry/workflow-registry.js` | No |
| `__tests__/suggestion-engine.test.js` | Unit tests for suggestion engine | Test runner | Tests `engine/suggestion-engine.js` | No |
| `__tests__/integration.test.js` | Integration tests for full WIS | Test runner | Tests cross-module interactions | No |

### External References (26 files reference this system)

- **Core orchestration:** `core/orchestration/executors/epic-7-executor.js`, `core/execution/wave-executor.js`
- **Tests:** `tests/core/build-orchestrator.test.js`, `tests/core/wave-executor.test.js`, multiple unit/integration tests
- **Architecture docs:** `docs/architecture/ade-architecture.md`, `docs/architecture/ADE-EPIC8-HANDOFF.md`
- **Tasks:** `development/tasks/patterns.md`, `development/tasks/next.md`, `development/tasks/waves.md`
- **Install manifest:** `install-manifest.yaml`

---

## 2. Monitor Hooks System

**Location:** `.aios-core/monitor/hooks/`
**Total Files:** 10
**Purpose:** Python-based event hooks for Claude Code monitoring. Sends telemetry events to an external monitor server during Claude Code sessions.

### Architecture

The hooks follow a standard event pattern: each hook enriches event data via `lib/enrich.py` and sends it to a monitor server via `lib/send_event.py`. Hooks correspond to Claude Code lifecycle events.

### File Inventory

| File | Purpose | Consumers | Cross-refs | Orphan? |
|------|---------|-----------|------------|---------|
| `hooks/pre_tool_use.py` | Hook fired before tool invocation; sends telemetry | Claude Code hooks system | `lib/enrich.py`, `lib/send_event.py` | No |
| `hooks/post_tool_use.py` | Hook fired after tool invocation; records tool usage | Claude Code hooks system | `lib/enrich.py`, `lib/send_event.py` | No |
| `hooks/notification.py` | Handles notification events | Claude Code hooks system | `lib/enrich.py`, `lib/send_event.py` | No |
| `hooks/stop.py` | Hook fired on session stop | Claude Code hooks system | `lib/enrich.py`, `lib/send_event.py` | No |
| `hooks/pre_compact.py` | Hook fired before context compaction | Claude Code hooks system | `lib/enrich.py`, `lib/send_event.py` | No |
| `hooks/subagent_stop.py` | Hook fired when a subagent stops | Claude Code hooks system | `lib/enrich.py`, `lib/send_event.py` | No |
| `hooks/user_prompt_submit.py` | Hook fired on user prompt submission | Claude Code hooks system | `lib/enrich.py`, `lib/send_event.py` | No |
| `hooks/lib/__init__.py` | Python package init; exports `enrich` and `send_event` | All hooks | Package marker | No |
| `hooks/lib/enrich.py` | Enriches event data with context (session, project, agent info) | All hooks | Standalone utility | No |
| `hooks/lib/send_event.py` | Sends event data to monitor server via HTTP | All hooks | Posts to `MONITOR_URL` | No |

### External References (3 files reference this system)

- `install-manifest.yaml` -- lists all hook files
- `scripts/install-monitor-hooks.sh` -- installation script for hooks
- `apps/monitor-server/README.md` -- documents the monitor server that receives events

### Notes

This system is **self-contained** and interfaces with an external monitor server (typically `apps/monitor-server/`). It does not directly reference agents, tasks, or workflows, but provides observability for Claude Code sessions. The hooks are Python files (not JavaScript like the rest of the framework).

---

## 3. Quality Gates System

**Location:** `.aios-core/core/quality-gates/` (10 files) and `.aios-core/quality/` (4 files)
**Total Files:** 14
**Purpose:** Implements the 3-layer quality gate system (pre-commit, PR automation, human review) with metrics collection.

### Architecture

The quality gates are organized in layers:
- **Layer 1 (Pre-commit):** `layer1-precommit.js` -- Runs lint, typecheck, and basic validation before commits
- **Layer 2 (PR Automation):** `layer2-pr-automation.js` -- Automated checks during PR creation
- **Layer 3 (Human Review):** `layer3-human-review.js` -- Orchestrates human review processes

All layers extend `base-layer.js` and are managed by `quality-gate-manager.js`. The `quality/` directory contains the metrics collection subsystem.

### File Inventory -- core/quality-gates/

| File | Purpose | Consumers | Cross-refs | Orphan? |
|------|---------|-----------|------------|---------|
| `quality-gate-manager.js` | Central manager for all quality gate layers | Tasks (`qa-gate`, `dev-develop-story`), CLI | Manages all layers | No |
| `quality-gate-config.yaml` | Configuration for quality gate thresholds and rules | `quality-gate-manager.js` | Referenced by all layers | No |
| `base-layer.js` | Abstract base class for quality gate layers | `layer1`, `layer2`, `layer3` | Extended by all layers | No |
| `layer1-precommit.js` | Pre-commit quality checks (lint, typecheck, tests) | `quality-gate-manager.js`, devops tasks | References `base-layer.js` | No |
| `layer2-pr-automation.js` | PR automation quality checks | `quality-gate-manager.js`, PR automation workflow | References `base-layer.js`, `quality-gate-config.yaml` | No |
| `layer3-human-review.js` | Human review orchestration | `quality-gate-manager.js` | References `base-layer.js` | No |
| `checklist-generator.js` | Generates review checklists from quality gate results | `layer3-human-review.js` | Creates checklists for reviewers | No |
| `focus-area-recommender.js` | Recommends focus areas for human reviewers | `layer3-human-review.js` | Analyzes code changes for risk | No |
| `human-review-orchestrator.js` | Orchestrates the human review workflow | `layer3-human-review.js` | Manages review sessions | No |
| `notification-manager.js` | Sends notifications about quality gate results | `quality-gate-manager.js` | Integrates with notification systems | No |

### File Inventory -- quality/ (Metrics)

| File | Purpose | Consumers | Cross-refs | Orphan? |
|------|---------|-----------|------------|---------|
| `metrics-collector.js` | Collects and aggregates quality metrics across layers | `metrics-hook.js`, CLI metrics commands | Stores to `.aios/data/quality-metrics.json` | No |
| `metrics-hook.js` | Hook functions for recording metrics from workflows | Pre-commit hooks, PR automation, `.github/workflows/pr-automation.yml` | Imports `MetricsCollector` | No |
| `seed-metrics.js` | Seeds initial demo metrics data | CLI `aios metrics seed` command | Uses `MetricsCollector` | No |
| `schemas/quality-metrics.schema.json` | JSON Schema for quality metrics data validation | `metrics-collector.js` | Ajv-based validation | No |

### External References (30+ files reference this system)

- **Agent definitions:** `development/agents/devops.md`, `development/agents/dev.md` (via quality gate tasks)
- **Tasks:** `github-devops-pre-push-quality-gate.md`, `qa-gate.md`, `dev-develop-story.md`
- **Workflows:** `story-development-cycle.yaml`, `brownfield-*.yaml`
- **CLI commands:** `cli/commands/metrics/*` (show, record, cleanup, seed)
- **CI/CD:** `.github/workflows/pr-automation.yml`
- **Standards:** `QUALITY-GATES-SPECIFICATION.md`
- **Documentation:** Multiple guide and architecture docs

---

## 4. Schemas System

**Location:** `.aios-core/schemas/`
**Total Files:** 6
**Purpose:** JSON schemas for validating agent, task, and squad definitions. Includes a V3 schema validator script.

### File Inventory

| File | Purpose | Consumers | Cross-refs | Orphan? |
|------|---------|-----------|------------|---------|
| `agent-v3-schema.json` | JSON Schema for V3 agent definitions | `validate-v3-schema.js`, migration scripts | Validates agents in `development/agents/` | No |
| `task-v3-schema.json` | JSON Schema for V3 task definitions | `validate-v3-schema.js` | Validates tasks in `development/tasks/` | No |
| `squad-schema.json` | JSON Schema for squad manifests | Squad validator scripts | Validates `squads/*/squad.yaml` | No |
| `squad-design-schema.json` | JSON Schema for squad design documents | Squad creation tasks | Validates squad design files | No |
| `validate-v3-schema.js` | CLI validator for V3 agents/tasks; supports `--all`, `--diff`, `--strict` | CLI usage, migration scripts (`migrate-agent.js`) | Reads schemas, validates `development/agents/` and `development/tasks/` | No |
| `README.md` | Documentation for schemas directory | Developers | References all schema files | No |

### External References (21 files reference schemas/)

- **Infrastructure:** `infrastructure/scripts/migrate-agent.js` -- uses `validate-v3-schema.js`
- **Squad system:** `development/scripts/squad/squad-validator.js`, `squad-generator.js`
- **Health check:** `core/health-check/reporters/json.js`
- **Install manifest:** `install-manifest.yaml`
- **Standards:** `TASK-FORMAT-SPECIFICATION-V1.md`

---

## 5. CLI Commands System

**Location:** `.aios-core/cli/commands/`
**Total Files:** 37 (across 8 command groups)
**Purpose:** Commander.js-based CLI commands for the `aios` executable. Provides the CLI-first interface for all framework operations.

### Architecture

Commands are organized by domain into subdirectories, each with an `index.js` entry point. Registered in the main CLI (`cli/index.js`) and invoked via `bin/aios.js`.

### Command Group Inventory

#### config/ (1 file) -- NEW/UNTRACKED

| File | Purpose | Consumers | Cross-refs | Orphan? |
|------|---------|-----------|------------|---------|
| `config/index.js` | Config hierarchy management: show, diff, migrate, validate, init-local | `cli/index.js`, `bin/aios.js` | Uses `core/config/config-resolver.js`, `merge-utils.js`, `env-interpolator.js` | No |

#### generate/ (1 file)

| File | Purpose | Consumers | Cross-refs | Orphan? |
|------|---------|-----------|------------|---------|
| `generate/index.js` | Code generation commands | `cli/index.js` | Uses templates and generators | No |

#### manifest/ (3 files)

| File | Purpose | Consumers | Cross-refs | Orphan? |
|------|---------|-----------|------------|---------|
| `manifest/index.js` | Manifest command group entry point | `cli/index.js` | Routes to subcommands | No |
| `manifest/regenerate.js` | Regenerate manifest CSV files | `manifest/index.js` | Uses `core/manifest/manifest-generator.js` | No |
| `manifest/validate.js` | Validate manifest integrity | `manifest/index.js` | Uses `core/manifest/manifest-validator.js` | No |

#### mcp/ (5 files)

| File | Purpose | Consumers | Cross-refs | Orphan? |
|------|---------|-----------|------------|---------|
| `mcp/index.js` | MCP management command group | `cli/index.js` | Routes to subcommands | No |
| `mcp/add.js` | Add MCP server | `mcp/index.js` | Writes to MCP config files | No |
| `mcp/link.js` | Link MCP server | `mcp/index.js` | Links existing MCP | No |
| `mcp/setup.js` | Setup MCP infrastructure | `mcp/index.js` | Docker MCP setup | No |
| `mcp/status.js` | Show MCP status | `mcp/index.js` | Reads MCP config | No |

#### metrics/ (5 files)

| File | Purpose | Consumers | Cross-refs | Orphan? |
|------|---------|-----------|------------|---------|
| `metrics/index.js` | Quality metrics command group | `cli/index.js` | Routes to subcommands | No |
| `metrics/show.js` | Display quality metrics | `metrics/index.js` | Uses `quality/metrics-collector.js` | No |
| `metrics/record.js` | Record a quality gate run | `metrics/index.js` | Uses `quality/metrics-collector.js` | No |
| `metrics/cleanup.js` | Clean up old metrics data | `metrics/index.js` | Uses `quality/metrics-collector.js` | No |
| `metrics/seed.js` | Seed demo metrics data | `metrics/index.js` | Uses `quality/seed-metrics.js` | No |

#### migrate/ (7 files)

| File | Purpose | Consumers | Cross-refs | Orphan? |
|------|---------|-----------|------------|---------|
| `migrate/index.js` | Migration command group | `cli/index.js` | Routes to subcommands | No |
| `migrate/analyze.js` | Analyze migration requirements | `migrate/index.js` | Scans codebase for migration needs | No |
| `migrate/backup.js` | Backup before migration | `migrate/index.js` | Creates backups | No |
| `migrate/execute.js` | Execute migration | `migrate/index.js` | Performs file transformations | No |
| `migrate/rollback.js` | Rollback migration | `migrate/index.js` | Restores from backup | No |
| `migrate/update-imports.js` | Update import paths after migration | `migrate/index.js` | Fixes import references | No |
| `migrate/validate.js` | Validate migration results | `migrate/index.js` | Checks post-migration integrity | No |

#### qa/ (3 files)

| File | Purpose | Consumers | Cross-refs | Orphan? |
|------|---------|-----------|------------|---------|
| `qa/index.js` | QA command group | `cli/index.js` | Routes to subcommands | No |
| `qa/run.js` | Run QA checks | `qa/index.js` | Uses quality gates system | No |
| `qa/status.js` | Show QA status | `qa/index.js` | Reads quality data | No |

#### workers/ (10 files)

| File | Purpose | Consumers | Cross-refs | Orphan? |
|------|---------|-----------|------------|---------|
| `workers/index.js` | Workers command group (list, search, info) | `cli/index.js` | Routes to subcommands | No |
| `workers/list.js` | List workers from manifests | `workers/index.js` | Reads `manifests/workers.csv` | No |
| `workers/info.js` | Show detailed worker info | `workers/index.js` | Reads worker files | No |
| `workers/search.js` | Search workers | `workers/index.js` | Routes to search strategies | No |
| `workers/search-keyword.js` | Keyword-based worker search | `workers/search.js` | Searches `workers.csv` | No |
| `workers/search-filters.js` | Filter-based worker search | `workers/search.js` | Filter by category, tags | No |
| `workers/search-semantic.js` | Semantic worker search | `workers/search.js` | Advanced search | No |
| `workers/formatters/info-formatter.js` | Format worker info for display | `workers/info.js` | Output formatting | No |
| `workers/formatters/list-table.js` | Table formatter for worker list | `workers/list.js` | Table output | No |
| `workers/formatters/list-tree.js` | Tree formatter for worker list | `workers/list.js` | Tree output | No |
| `workers/utils/pagination.js` | Pagination utility | `workers/list.js`, `workers/search.js` | Shared utility | No |

#### validate/ (1 file)

| File | Purpose | Consumers | Cross-refs | Orphan? |
|------|---------|-----------|------------|---------|
| `validate/index.js` | Validate AIOS installation integrity | `cli/index.js` | Uses `install-manifest.yaml` | No |

### External References (20+ files reference CLI commands)

- **Main CLI:** `cli/index.js` registers all command groups
- **Entry point:** `bin/aios.js` creates the Commander program
- **Tests:** `tests/unit/` and `tests/config/` directories
- **Architecture docs:** `docs/architecture/mcp-system-diagrams.md`
- **Source tree:** `docs/framework/source-tree.md`

---

## 6. Agent Teams System

**Location:** `.aios-core/agent-teams/`
**Total Files:** 0 (directory does not exist or is empty)
**Purpose:** Was intended to hold agent team configurations.

### Status: DOES NOT EXIST

The `agent-teams/` directory was not found in the `.aios-core/` directory. However, references to "agent-teams" exist in:

- `install-manifest.yaml`
- `scripts/generate-install-manifest.js`
- `docs/framework/source-tree.md` and translations
- `docs/core-architecture.md`
- `development/README.md`
- `data/aios-kb.md`
- QA system docs

### Assessment

This appears to be a **planned feature** or possibly a directory that exists in older installations but is not present in the current working tree. All references are in documentation or install manifests, suggesting the directory is expected to exist but has no content currently. The functionality may have been superseded by the **squads system** (see `squads/` and squad templates).

---

## 7. Tools Config System

**Location:** `.aios-core/tools/`
**Total Files:** 0 (directory is empty or does not contain files)
**Purpose:** Intended to hold tool configuration files.

### Status: DIRECTORY EMPTY

The `tools/` directory exists (referenced in `core-config.yaml` as `toolsLocation: .aios-core/tools`) but contains no files. Tool configurations may have been:

1. Moved to `core/tools/` or integrated into other modules
2. Never populated (planned feature)
3. Managed through `core-config.yaml` `utils` section instead

### References

- `core-config.yaml`: `toolsLocation: .aios-core/tools`
- `framework-config.yaml`: `tools_dir: ".aios-core/tools"`
- `infrastructure/scripts/tool-resolver.js` -- resolves tool locations

---

## 8. Manifests System

**Location:** `.aios-core/manifests/`
**Total Files:** 4
**Purpose:** CSV-based registry of all agents, tasks, and workers with JSON schema validation. Acts as the central inventory of all AIOS components.

### File Inventory

| File | Purpose | Consumers | Cross-refs | Orphan? |
|------|---------|-----------|------------|---------|
| `agents.csv` | Registry of all agent definitions (id, name, archetype, icon, version, status, file_path) | CLI `workers` commands, `manifest` commands, install validator | References all files in `development/agents/` | No |
| `tasks.csv` | Registry of all task definitions (121 tasks; id, name, category, format, has_elicitation, file_path, status) | CLI `workers` commands, `manifest` commands | References all files in `development/tasks/` | No |
| `workers.csv` | Unified registry of ALL workers (204 entries: checklists, data, scripts, tasks, templates, workflows) | CLI `workers` commands, search system | References files across `development/`, `infrastructure/`, `core/`, `product/` | No |
| `schema/manifest-schema.json` | JSON Schema defining the structure of all manifest CSV files | `core/manifest/manifest-validator.js`, `manifest` CLI | Validates `agents.csv`, `tasks.csv`, `workers.csv` | No |

### External References (8+ files reference manifests/)

- **CLI commands:** `cli/commands/manifest/regenerate.js`, `cli/commands/manifest/validate.js`, `cli/commands/workers/*`
- **Core:** `core/manifest/manifest-generator.js`, `core/manifest/manifest-validator.js`
- **Install:** `install-manifest.yaml`, `scripts/generate-install-manifest.js`
- **Source tree docs:** `docs/framework/source-tree.md`

### Key Observations

- `agents.csv` has only headers (no data rows in the checked version), meaning agent entries may be populated by the `manifest regenerate` command
- `tasks.csv` has 121 active task entries covering all task categories
- `workers.csv` has 204 entries spanning checklists, data, scripts (54), tasks (116), templates (19), and workflows (6)
- The `workers.csv` is the most comprehensive manifest and is the primary data source for the CLI search system

---

## 9. Elicitation System

**Location:** `.aios-core/core/elicitation/` (5 files) and `.aios-core/elicitation/` (3 files)
**Total Files:** 8
**Purpose:** Interactive progressive disclosure system for creating agents, tasks, and workflows through guided wizards.

### Architecture

Two directories serve this system:
- **core/elicitation/** -- The engine and session manager (core modules)
- **elicitation/** -- Domain-specific elicitation step definitions (agent, task, workflow)

The engine uses `inquirer` for interactive prompts, supports smart defaults, conditional steps, and session persistence.

### File Inventory -- core/elicitation/

| File | Purpose | Consumers | Cross-refs | Orphan? |
|------|---------|-----------|------------|---------|
| `elicitation-engine.js` | Main elicitation engine with progressive disclosure, validation, security checks | `create-agent` task, `create-task` task, `create-workflow` task | Uses `session-manager.js`, optional `security-checker` | No |
| `session-manager.js` | Manages elicitation session persistence (save/load/resume) | `elicitation-engine.js` | Stores sessions in `.aios-sessions/` | No |
| `agent-elicitation.js` | Agent-specific elicitation steps (duplicate of sibling?) | `elicitation-engine.js` | Defines agent creation wizard steps | Possible duplicate |
| `task-elicitation.js` | Task-specific elicitation steps (duplicate of sibling?) | `elicitation-engine.js` | Defines task creation wizard steps | Possible duplicate |
| `workflow-elicitation.js` | Workflow-specific elicitation steps (duplicate of sibling?) | `elicitation-engine.js` | Defines workflow creation wizard steps | Possible duplicate |

### File Inventory -- elicitation/

| File | Purpose | Consumers | Cross-refs | Orphan? |
|------|---------|-----------|------------|---------|
| `agent-elicitation.js` | Agent creation wizard steps | Referenced by config as `elicitationLocation` | Same content as core version | Possible duplicate |
| `task-elicitation.js` | Task creation wizard steps | Referenced by config | Same content as core version | Possible duplicate |
| `workflow-elicitation.js` | Workflow creation wizard steps | Referenced by config | Same content as core version | Possible duplicate |

### External References (30+ files reference elicitation)

- **All agent definitions:** Every agent in `development/agents/` references elicitation in their workflows
- **Core config:** `core-config.yaml` has `elicitationLocation: .aios-core/elicitation`
- **Framework config:** `framework-config.yaml` has `elicitation_dir: ".aios-core/elicitation"`
- **Package.json:** `exports` includes `"./elicitation": "./elicitation/"`
- **Tasks:** `spec-gather-requirements.md`, `create-agent.md`, `create-task.md`, `create-workflow.md`, `advanced-elicitation.md`
- **Config CLI:** `cli/commands/config/index.js`

### Duplication Issue

There appears to be **duplication** between `core/elicitation/` (3 domain files) and `elicitation/` (3 domain files). The `core/elicitation/` files were migrated in Story 2.2, while the `elicitation/` files are referenced by the config. This should be consolidated.

---

## 10. Docs/Standards System

**Location:** `.aios-core/docs/standards/`
**Total Files:** 16
**Purpose:** Official framework standards documentation, including the "Livro de Ouro" (Golden Book), quality gates specification, story templates, color palettes, and more.

### File Inventory

| File | Purpose | Consumers | Cross-refs | Orphan? |
|------|---------|-----------|------------|---------|
| `STANDARDS-INDEX.md` | Navigation index for all standards documents | All team members, agent definitions | References all standard docs | No |
| `AIOS-LIVRO-DE-OURO-V2.1-COMPLETE.md` | **PRIMARY** -- Complete v2.1 framework guide (consolidated) | All agents, onboarding | Supersedes all legacy Livro docs | No |
| `QUALITY-GATES-SPECIFICATION.md` | 3-layer quality gates system specification | QA agent, devops, quality gate code | Referenced by `core/quality-gates/` | No |
| `STORY-TEMPLATE-V2-SPECIFICATION.md` | Story template v2.0 specification | PO, SM, story creation tasks | Referenced by story creation workflows | No |
| `TASK-FORMAT-SPECIFICATION-V1.md` | Task-First architecture format specification | All agents creating tasks | Referenced by task templates | No |
| `EXECUTOR-DECISION-TREE.md` | Decision tree for Human/Worker/Agent/Clone routing | Orchestration engine | Referenced by workflow patterns | No |
| `AGENT-PERSONALIZATION-STANDARD-V1.md` | Agent personality and personalization system | Agent creation tasks | Referenced by agent templates | No |
| `AIOS-COLOR-PALETTE-V2.1.md` | Complete color system for AIOS branding | Dashboard, UI components | Referenced by UX agent | No |
| `AIOS-COLOR-PALETTE-QUICK-REFERENCE.md` | Quick reference for color palette | Developers, designers | Subset of full palette doc | No |
| `OPEN-SOURCE-VS-SERVICE-DIFFERENCES.md` | Business model documentation (OSS vs service) | Product decisions | Needs update per index | No |
| `V3-ARCHITECTURAL-DECISIONS.md` | Old architectural decisions (archive candidate) | Historical reference | Superseded by ADR system | Yes (Archive) |
| `AIOS-LIVRO-DE-OURO.md` | v2.0 base document (DEPRECATED) | Historical reference | Superseded by V2.1-COMPLETE | Yes (Legacy) |
| `AIOS-LIVRO-DE-OURO-V2.1.md` | v2.1 delta document (DEPRECATED) | Historical reference | Superseded by V2.1-COMPLETE | Yes (Legacy) |
| `AIOS-LIVRO-DE-OURO-V2.1-SUMMARY.md` | v2.1 summary (DEPRECATED) | Historical reference | Superseded by V2.1-COMPLETE | Yes (Legacy) |
| `AIOS-LIVRO-DE-OURO-V2.2-SUMMARY.md` | Future v2.2 planning (DRAFT) | Planning only | Not yet active | No (Draft) |
| `AIOS-FRAMEWORK-MASTER.md` | v2.0 framework doc (DEPRECATED) | Historical reference | Superseded by V2.1-COMPLETE | Yes (Legacy) |

### External References (20+ files reference docs/standards)

- **Install manifest:** `install-manifest.yaml`
- **Guides:** `docs/guides/squads-guide.md`, `docs/guides/coderabbit/README.md`
- **Architecture:** `docs/architecture/high-level-architecture.md`
- **Migration docs:** `docs/migration/v2.0-to-v2.1.md`
- **Templates:** Various personalized templates

### Deprecation Summary

4 files are explicitly deprecated (superseded by `AIOS-LIVRO-DE-OURO-V2.1-COMPLETE.md`), 1 is an archive candidate. These should be cleaned up or moved to an `archive/` directory.

---

## 11. Processes System

**Location:** `.aios-core/processes/`
**Total Files:** 0 (directory does not exist)
**Purpose:** Was intended to hold process definitions.

### Status: DOES NOT EXIST

No `processes/` directory was found under `.aios-core/`. This may be:
- A planned feature that was never implemented
- Functionality that was absorbed into the `workflows/` system
- A naming difference from the expected directory

No references to `.aios-core/processes/` were found in the codebase.

---

## 12. Root Config System

**Location:** `.aios-core/` (root-level files)
**Total Files:** 8
**Purpose:** Framework-level configuration, constitution, user guide, and package definition.

### File Inventory

| File | Purpose | Consumers | Cross-refs | Orphan? |
|------|---------|-----------|------------|---------|
| `constitution.md` | **FOUNDATIONAL** -- Defines non-negotiable principles (CLI First, Agent Authority, Story-Driven Development, No Invention, Quality First, Absolute Imports) | All agents, all tasks, CLAUDE.md | Referenced by `dev-develop-story.md`, `github-devops-pre-push-quality-gate.md`, `analyze-cross-artifact.md`, `spec-write-spec.md` | No |
| `core-config.yaml` | **PRIMARY** Legacy/monolithic config (v2.3.0) with ALL configuration sections (13 sections) | `core/config/config-loader.js`, all agents, all tasks | Central configuration file; being split into L1-L4 hierarchy | No |
| `framework-config.yaml` | **NEW** L1 Framework config (read-only, shipped with npm) | `core/config/config-resolver.js`, config CLI | Part of ADR-PRO-002 config hierarchy; duplicates framework portions of `core-config.yaml` | No |
| `project-config.yaml` | **NEW** L2 Project config (team-shared, committed) | `core/config/config-resolver.js`, config CLI | Part of ADR-PRO-002; duplicates project portions of `core-config.yaml` | No |
| `local-config.yaml.template` | **NEW** L4 Local config template (machine-specific, gitignored) | Developers copy to `local-config.yaml` | Part of ADR-PRO-002; secrets and IDE preferences | No |
| `install-manifest.yaml` | Complete inventory of all files in the framework | Installer, validator, upgrader | Lists every file in `.aios-core/` | No |
| `user-guide.md` | User guide for Synkra AIOS | Users, onboarding | Referenced by workflows, brownfield guide | No |
| `working-in-the-brownfield.md` | Guide for brownfield (existing project) development | Brownfield workflows | Referenced by agent definitions, brownfield tasks | No |
| `package.json` | npm package definition for `@aios-fullstack/core` (v4.31.0) | npm, build system | Defines dependencies, exports, scripts | No |

### Configuration Hierarchy (ADR-PRO-002)

The config system is transitioning from a monolithic `core-config.yaml` to a 4-level hierarchy:

| Level | File | Mutability | Git Status |
|-------|------|------------|------------|
| L1 | `framework-config.yaml` | Read-only (framework) | Committed |
| L2 | `project-config.yaml` | Editable (maintainers) | Committed |
| L3 | *(app-specific, not yet implemented)* | -- | -- |
| L4 | `local-config.yaml` (from template) | Editable (personal) | Gitignored |

The `core-config.yaml` continues to function as the primary config (legacy mode) until migration is complete. The `config-resolver.js` module handles merging levels.

### External References

- `constitution.md` -- Referenced by 6 files (tasks, analysis docs)
- `core-config.yaml` -- Referenced by `config-loader.js` and indirectly by all agents
- `framework-config.yaml` / `project-config.yaml` -- Referenced by config resolver, config CLI, test files
- `install-manifest.yaml` -- Referenced by 20+ files (installer, validator, upgrader, tests, scripts)

---

## 13. Overall Supporting Systems Summary

### Systems Inventory

| # | System | Location | Files | Status | Health |
|---|--------|----------|-------|--------|--------|
| 1 | Workflow Intelligence | `workflow-intelligence/` | 19 | Active | Healthy -- well-tested, well-referenced |
| 2 | Monitor Hooks | `monitor/hooks/` | 10 | Active | Healthy -- self-contained Python hooks |
| 3 | Quality Gates (Core) | `core/quality-gates/` | 10 | Active | Healthy -- 3-layer system with config |
| 4 | Quality (Metrics) | `quality/` | 4 | Active | Healthy -- metrics collection and hooks |
| 5 | Schemas | `schemas/` | 6 | Active | Healthy -- V3 schema validation |
| 6 | CLI Commands | `cli/commands/` | 37 | Active | Healthy -- 8 command groups |
| 7 | Agent Teams | `agent-teams/` | 0 | **Missing** | Empty/nonexistent -- superseded by squads? |
| 8 | Tools Config | `tools/` | 0 | **Empty** | Referenced but contains no files |
| 9 | Manifests | `manifests/` | 4 | Active | Healthy -- central component registry |
| 10 | Elicitation | `core/elicitation/` + `elicitation/` | 8 | Active | Has duplication between two directories |
| 11 | Docs/Standards | `docs/standards/` | 16 | Active | Has 4 deprecated + 1 archive candidate |
| 12 | Processes | `processes/` | 0 | **Missing** | Does not exist |
| 13 | Root Config | `.aios-core/` root | 8 | Active | In migration (monolithic to layered) |

### File Count Summary

| Category | Count |
|----------|-------|
| Active, well-referenced files | 100 |
| Deprecated/Legacy files | 5 |
| Duplicate files | 3 |
| Missing/Empty directories | 3 |
| **Total tracked** | **111** |

---

## 14. Orphaned Files Across All Systems

### Confirmed Orphans / Candidates for Removal

| File | System | Reason | Recommendation |
|------|--------|--------|----------------|
| `docs/standards/AIOS-LIVRO-DE-OURO.md` | Docs/Standards | Superseded by V2.1-COMPLETE | Move to archive/ |
| `docs/standards/AIOS-LIVRO-DE-OURO-V2.1.md` | Docs/Standards | Superseded by V2.1-COMPLETE | Move to archive/ |
| `docs/standards/AIOS-LIVRO-DE-OURO-V2.1-SUMMARY.md` | Docs/Standards | Superseded by V2.1-COMPLETE | Move to archive/ |
| `docs/standards/AIOS-FRAMEWORK-MASTER.md` | Docs/Standards | Superseded by V2.1-COMPLETE | Move to archive/ |
| `docs/standards/V3-ARCHITECTURAL-DECISIONS.md` | Docs/Standards | Archive candidate per STANDARDS-INDEX | Move to archive/ |

### Duplication Issues

| Files | System | Issue | Recommendation |
|-------|--------|-------|----------------|
| `core/elicitation/agent-elicitation.js` vs `elicitation/agent-elicitation.js` | Elicitation | Same functionality in two locations | Consolidate to `core/elicitation/` and update config references |
| `core/elicitation/task-elicitation.js` vs `elicitation/task-elicitation.js` | Elicitation | Same functionality in two locations | Consolidate to `core/elicitation/` |
| `core/elicitation/workflow-elicitation.js` vs `elicitation/workflow-elicitation.js` | Elicitation | Same functionality in two locations | Consolidate to `core/elicitation/` |

### Ghost References (directories referenced but not present)

| Directory | Referenced By | Status |
|-----------|---------------|--------|
| `.aios-core/agent-teams/` | install-manifest, source-tree docs, core-architecture, data/aios-kb.md | Directory does not exist |
| `.aios-core/tools/` (content) | core-config.yaml, framework-config.yaml | Directory exists but is empty |
| `.aios-core/processes/` | Not referenced | Does not exist |

---

## 15. Supporting Systems Interconnection Map

```
                                  CONSTITUTION
                                      |
                                      v
                        +-------------------------+
                        |    ROOT CONFIG SYSTEM    |
                        |  (core-config.yaml +     |
                        |   framework/project/     |
                        |   local configs)         |
                        +-------------------------+
                           |        |        |
              +------------+   +----+----+   +-------------+
              |                |         |                  |
              v                v         v                  v
    +------------------+  +--------+  +----------+  +-----------+
    |   CLI COMMANDS   |  |SCHEMAS |  |MANIFESTS |  | QUALITY   |
    | (37 files, 8     |  |(6 files)|  |(4 files) |  | GATES     |
    |  command groups)  |  +--------+  +----------+  | (14 files)|
    +------------------+      |            |         +-----------+
      |  |  |  |  |           |            |              |
      |  |  |  |  |           v            v              v
      |  |  |  |  |   +-------------+ +----------+ +-----------+
      |  |  |  |  |   | validate-v3 | | workers  | | metrics   |
      |  |  |  |  |   | -schema.js  | | search   | | collector |
      |  |  |  |  |   +-------------+ +----------+ +-----------+
      |  |  |  |  |                                      |
      |  |  |  |  +---> METRICS CLI <--------------------+
      |  |  |  |
      |  |  |  +------> MANIFEST CLI ----> manifests/workers.csv
      |  |  |
      |  |  +---------> MCP CLI ---------> MCP config (core-config.yaml)
      |  |
      |  +------------> CONFIG CLI -------> config-resolver.js
      |                                          |
      +---------------> VALIDATE CLI ----> install-manifest.yaml
                                                 |
                                                 v
                                        +----------------+
                                        | INSTALL        |
                                        | MANIFEST       |
                                        | (lists ALL     |
                                        |  framework     |
                                        |  files)        |
                                        +----------------+

    +-------------------+     +------------------+
    | WORKFLOW           |     | MONITOR HOOKS    |
    | INTELLIGENCE       |     | (Python, 10      |
    | (19 files)         |     |  files)           |
    |                    |     |                   |
    | engine/ ---------> |     | pre_tool_use ---> |
    | learning/ -------> |     | post_tool_use --> | ---> monitor-server
    | registry/ -------> |     | stop ----------> |
    +-------------------+     +------------------+
           |
           v
    +-------------------+     +------------------+
    | CORE ORCHESTRATION|     | DOCS/STANDARDS   |
    | (wave-executor,   |     | (16 files)       |
    |  epic-7-executor) |     |                  |
    +-------------------+     | LIVRO DE OURO    |
                              | QUALITY SPEC     |
    +-------------------+     | STORY TEMPLATE   |
    | ELICITATION       |     | TASK FORMAT      |
    | (8 files, 2 dirs) |     +------------------+
    |                   |
    | engine ---------> | <--- agents, tasks, workflows
    | sessions -------> |      (create-* commands)
    +-------------------+
```

### Key Interconnection Patterns

1. **Root Config is the Hub:** `core-config.yaml` (and its layered replacements) is consumed by virtually every system. It defines resource locations, feature flags, and integration settings.

2. **Manifests are the Registry:** `manifests/workers.csv` contains 204 entries covering all AIOS components. The CLI `workers` commands are the primary consumer.

3. **Quality Gates span two directories:** `core/quality-gates/` provides the gate logic while `quality/` provides metrics. They connect via the `metrics-hook.js` and are exposed through the `metrics` CLI.

4. **Workflow Intelligence feeds Orchestration:** The WIS suggestion engine and wave analyzer are consumed by `core/orchestration/` and `core/execution/` modules.

5. **Elicitation powers Creation:** The elicitation engine is triggered by `create-agent`, `create-task`, and `create-workflow` tasks. All 11 agents reference elicitation in their workflows.

6. **Monitor Hooks are Independent:** The Python-based hooks system is the most isolated subsystem, communicating only with an external monitor server.

7. **Install Manifest is the Inventory:** `install-manifest.yaml` is the single source of truth for what files should exist in the framework, used by installer, validator, and upgrader systems.

8. **Constitution governs all:** `constitution.md` defines the non-negotiable principles that all agents and tasks must follow. It is referenced by CLAUDE.md and key development tasks.

### Data Flow Summary

```
User Request
    |
    v
CLI Commands (bin/aios.js)
    |
    +---> config show/diff/migrate ---> Config Resolver ---> L1/L2/L4 configs
    +---> manifest validate/regen ----> Manifest System ---> agents.csv, tasks.csv, workers.csv
    +---> metrics show/record --------> Quality Metrics ---> quality-metrics.json
    +---> validate ---------------------> Install Manifest ---> integrity check
    +---> qa run -----------------------> Quality Gates ---> 3-layer checks
    +---> workers list/search ---------> Manifests + Formatters
    +---> migrate analyze/execute -----> Migration Engine
    +---> mcp add/setup/status --------> MCP Config
    +---> generate --------------------> Templates + Generators

Agent Activation (@agent-name)
    |
    +---> Elicitation Engine (for *create-* commands)
    +---> Workflow Intelligence (for workflow suggestions)
    +---> Quality Gates (for *qa-gate, *develop-story)
    +---> Constitution (governance constraints)
    +---> Monitor Hooks (telemetry to monitor-server)
```

---

*Cross-Reference Phase 6 Complete -- 12 supporting systems analyzed, 111 files cataloged*
