# Cross-Reference Analysis -- Phase 5: Core Module Dependency Graph

**Generated:** 2026-02-05
**Scope:** `.aios-core/core/` -- 130 JavaScript files across 14 subsystems
**Method:** Full file reads, import/require analysis, external consumer grep

---

## 1. Summary Statistics

| Metric | Count |
|--------|-------|
| Total JS files in core/ | 130 |
| Subsystems (top-level directories) | 14 |
| Index/barrel files | 8 |
| Files with external consumers (CLI, tests, scripts) | 48 |
| Orphaned files (no external consumer, not re-exported) | ~12 |
| Cross-subsystem internal dependencies | 18 |
| External npm dependencies used | 10 (fs-extra, chalk, inquirer, js-yaml, glob, ajv, ajv-formats, crypto, child_process, events) |
| Deprecated files (scheduled for removal) | 1 (config-loader.js) |
| Missing/phantom references (try/catch guarded) | 3 (memory-query.js, session-memory.js, security-checker) |

---

## 2. Core Module Inventory by Subsystem

### 2.1 config/ (5 files)

Configuration loading, caching, merging, and environment interpolation.

| File | Purpose | Internal Deps | External Consumers | Orphan? |
|------|---------|---------------|-------------------|---------|
| `config-cache.js` | TTL-based config cache (singleton) | None | config-resolver.js, core/index.js, agent-config-loader.js, tests/config/ | No |
| `config-loader.js` | **DEPRECATED** -- Legacy monolithic config loader | js-yaml | core/index.js (re-exported) | No (but deprecated) |
| `config-resolver.js` | Layered config resolution (ADR-PRO-002) | merge-utils.js, env-interpolator.js, config-cache.js | CLI config commands, agent-config-loader.js, tests/config/ | No |
| `env-interpolator.js` | `${ENV_VAR}` pattern resolution in config values | merge-utils.js (isPlainObject) | config-resolver.js, CLI config commands, tests/config/ | No |
| `merge-utils.js` | Deep merge with ADR-PRO-002 strategies (+append, null=delete) | None | env-interpolator.js, config-resolver.js, CLI config commands, tests/config/ | No |

**Dependency chain:** `merge-utils` <-- `env-interpolator` <-- `config-resolver` <-- (CLI, agent-config-loader)
                       `merge-utils` <-- `config-resolver`
                       `config-cache` <-- `config-resolver`

### 2.2 elicitation/ (5 files)

Interactive elicitation system for component creation (agents, tasks, workflows).

| File | Purpose | Internal Deps | External Consumers | Orphan? |
|------|---------|---------------|-------------------|---------|
| `elicitation-engine.js` | Core interactive elicitation engine (inquirer-based) | session-manager.js; optional: infrastructure/scripts/security-checker | core/index.js, .aios-core/index.js, tests/core/, tests/security/ | No |
| `session-manager.js` | Elicitation session persistence (save/resume) | None (fs-extra, crypto) | elicitation-engine.js, core/index.js, tests/security/ | No |
| `agent-elicitation.js` | Step definitions for agent creation flow | None (pure data) | core/index.js | No |
| `task-elicitation.js` | Step definitions for task creation flow | None (pure data) | core/index.js | No |
| `workflow-elicitation.js` | Step definitions for workflow creation flow | None (pure data) | core/index.js, development/scripts/verify-workflow-gaps.js | No |

### 2.3 events/ (3 files)

Dashboard event system for CLI observability.

| File | Purpose | Internal Deps | External Consumers | Orphan? |
|------|---------|---------------|-------------------|---------|
| `index.js` | Barrel re-export | types.js, dashboard-emitter.js | orchestration/dashboard-integration.js | No |
| `types.js` | DashboardEventType enum constants | None | dashboard-emitter.js, events/index.js | No |
| `dashboard-emitter.js` | Singleton HTTP emitter (POST events to monitor-server) | types.js | events/index.js | No |

### 2.4 execution/ (10 files)

Build execution, parallel agents, merge engines, and rate limiting.

| File | Purpose | Internal Deps | External Consumers | Orphan? |
|------|---------|---------------|-------------------|---------|
| `autonomous-build-loop.js` | Story 8.1: Autonomous build loop (spec->plan->execute->verify) | build-state-manager.js | build-orchestrator.js, tests/core/ | No |
| `build-orchestrator.js` | Story 8.5: Complete build pipeline (worktree->plan->execute->merge) | autonomous-build-loop.js, build-state-manager.js | tests/core/ | No |
| `build-state-manager.js` | Story 8.4: Build state persistence with checkpoints | None (fs, crypto) | autonomous-build-loop.js, build-orchestrator.js, memory/timeline-manager.js, tests/core/ | No |
| `context-injector.js` | Story 10.3: Injects context into subagent prompts | memory/memory-query.js (optional), memory/gotchas-memory.js (optional), memory/session-memory.js (optional) | tests/core/ | No |
| `parallel-monitor.js` | Story 10.6: Real-time parallel execution monitoring | None (EventEmitter) | tests/core/ | No |
| `rate-limit-manager.js` | Story 11.3: API rate limiting with exponential backoff | None (EventEmitter) | wave-executor.js, tests/core/ | No |
| `result-aggregator.js` | Story 10.5: Aggregates parallel task results, detects conflicts | None (fs, EventEmitter) | tests/core/ | No |
| `semantic-merge-engine.js` | Story 8.3: AI-powered semantic merge for parallel work | None (child_process, js-yaml, EventEmitter) | tests/core/ | No |
| `subagent-dispatcher.js` | Story 10.2: Dispatches tasks to specialized subagents | memory/memory-query.js (optional), memory/gotchas-memory.js (optional) | tests/core/ | No |
| `wave-executor.js` | Story 10.1: Dependency-aware wave-based parallel execution | workflow-intelligence/engine/wave-analyzer.js (optional), rate-limit-manager.js (optional) | tests/core/ | No |

**Cross-subsystem deps:** execution --> memory (optional, try/catch guarded)
                          execution --> workflow-intelligence (optional, outside core/)

### 2.5 health-check/ (4 framework files + 26 check files + 5 support files = 35 files)

Comprehensive health check system with 5 domains.

#### Framework Layer (4 files)

| File | Purpose | Internal Deps | External Consumers | Orphan? |
|------|---------|---------------|-------------------|---------|
| `index.js` | Main HealthCheck class + barrel exports | engine.js, base-check.js, check-registry.js, healers/, reporters/ | core/index.js, tests/health-check/ | No |
| `engine.js` | Execution engine: parallel checks, caching, timeouts | base-check.js | index.js, tests/health-check/ | No |
| `base-check.js` | Abstract base class + enums (CheckSeverity, CheckStatus, CheckDomain) | None | engine.js, check-registry.js, healers/, all individual checks, tests/ | No |
| `check-registry.js` | Central registry for check lookup by domain/severity | base-check.js | index.js | No |

#### Checks by Domain (26 files)

| Domain | Files | Parent Index | All Extend |
|--------|-------|-------------|-----------|
| `checks/index.js` | Aggregates 5 domain indices | project/, local/, repository/, deployment/, services/ | -- |
| `checks/project/` | 8 checks: package-json, node-version, dependencies, aios-directory, agent-config, framework-config, task-definitions, workflow-dependencies | project/index.js | base-check.js |
| `checks/local/` | 8 checks: git-install, npm-install, shell-environment, memory, disk-space, network, ide-detection, environment-vars | local/index.js | base-check.js |
| `checks/repository/` | 8 checks: git-repo, git-status, gitignore, conflicts, branch-protection, commit-history, large-files, lockfile-integrity | repository/index.js | base-check.js |
| `checks/deployment/` | 5 checks: env-file, docker-config, ci-config, build-config, deployment-readiness | deployment/index.js | base-check.js |
| `checks/services/` | 5 checks: claude-code, github-cli, api-endpoints, mcp-integration | services/index.js | base-check.js |

#### Support Modules (5 files)

| File | Purpose | Internal Deps | External Consumers | Orphan? |
|------|---------|---------------|-------------------|---------|
| `healers/index.js` | HealerManager: 3-tier auto-fix orchestration | healers/backup-manager.js, base-check.js | health-check/index.js, tests/ | No |
| `healers/backup-manager.js` | Backup creation before healing operations | None | healers/index.js | No |
| `reporters/index.js` | ReporterManager: multi-format report generation | reporters/console.js, reporters/markdown.js, reporters/json.js | health-check/index.js, tests/ | No |
| `reporters/console.js` | Console output reporter | None | reporters/index.js | No |
| `reporters/markdown.js` | Markdown file reporter | None | reporters/index.js | No |
| `reporters/json.js` | JSON output reporter | None | reporters/index.js | No |

### 2.6 ideation/ (1 file)

| File | Purpose | Internal Deps | External Consumers | Orphan? |
|------|---------|---------------|-------------------|---------|
| `ideation-engine.js` | Story 11.1: AI-powered codebase improvement suggestions | memory/gotchas-memory.js (optional) | **None found** | **YES -- Orphan** |

### 2.7 manifest/ (2 files)

| File | Purpose | Internal Deps | External Consumers | Orphan? |
|------|---------|---------------|-------------------|---------|
| `manifest-generator.js` | Generates CSV manifests from directory scan | None (js-yaml) | CLI manifest/regenerate, tests/unit/manifest/ | No |
| `manifest-validator.js` | Validates manifest CSV against schema | None | CLI manifest/validate, tests/unit/manifest/ | No |

### 2.8 mcp/ (5 files)

MCP (Model Context Protocol) global configuration management.

| File | Purpose | Internal Deps | External Consumers | Orphan? |
|------|---------|---------------|-------------------|---------|
| `index.js` | Barrel spread-export of all MCP modules | os-detector, global-config-manager, symlink-manager, config-migrator | tests/integration/mcp-setup.test.js | No |
| `os-detector.js` | Cross-platform OS detection + path helpers | None (os, path) | global-config-manager.js, symlink-manager.js, CLI mcp/* | No |
| `global-config-manager.js` | Manages ~/.aios/mcp/ global config | os-detector.js | config-migrator.js, CLI mcp/add, mcp/status, mcp/setup, mcp/link, tests/ | No |
| `symlink-manager.js` | Cross-platform symlink/junction management | os-detector.js | config-migrator.js, CLI mcp/status, mcp/link, tests/ | No |
| `config-migrator.js` | Migrates project MCP configs to global | global-config-manager.js, symlink-manager.js | CLI mcp/status, mcp/link, tests/ | No |

**Dependency chain:** `os-detector` <-- `global-config-manager` <-- `config-migrator`
                       `os-detector` <-- `symlink-manager` <-- `config-migrator`

### 2.9 memory/ (5 files including 1 test)

Persistent memory layer for context, gotchas, and file evolution.

| File | Purpose | Internal Deps | External Consumers | Orphan? |
|------|---------|---------------|-------------------|---------|
| `context-snapshot.js` | Story 12.6: Capture/restore development context snapshots | None (fs, crypto, child_process) | file-evolution-tracker.js, timeline-manager.js | No |
| `file-evolution-tracker.js` | Tracks file changes across tasks, detects drift | context-snapshot.js | timeline-manager.js | No |
| `gotchas-memory.js` | Story 9.4: Auto-capture repeated errors, manual gotcha addition | None (fs, EventEmitter) | execution/context-injector.js, execution/subagent-dispatcher.js, ideation/ideation-engine.js | No |
| `timeline-manager.js` | Unified timeline facade (evolution + snapshots + build state) | file-evolution-tracker.js, context-snapshot.js, execution/build-state-manager.js (optional) | **None found externally** | **YES -- Orphan** |
| `__tests__/gaps-implementation.verify.js` | Verification test for gap implementations | context-snapshot.js, file-evolution-tracker.js, timeline-manager.js | (test-only) | N/A |

### 2.10 orchestration/ (19 files including 7 executors)

Multi-agent workflow orchestration and ADE (Autonomous Development Engine).

#### Core Orchestration (12 files)

| File | Purpose | Internal Deps | External Consumers | Orphan? |
|------|---------|---------------|-------------------|---------|
| `index.js` | Barrel export: all orchestration modules | All files below | tests/core/, core/index.js (not re-exported) | No |
| `workflow-orchestrator.js` | Multi-agent workflow execution with persona transformation | subagent-prompt-builder, context-manager, parallel-executor, checklist-runner, tech-stack-detector, condition-evaluator, skill-dispatcher | orchestration/index.js | No |
| `master-orchestrator.js` | Epic 0: ADE central pipeline (Epics 3-7) | tech-stack-detector, executors/, recovery-handler, gate-evaluator, agent-invoker | orchestration/index.js, cli-commands.js, tests/core/ | No |
| `subagent-prompt-builder.js` | Assembles prompts from real task/agent definitions | None (fs-extra, js-yaml) | workflow-orchestrator.js, orchestration/index.js | No |
| `context-manager.js` | Persists workflow state between phases (deterministic) | None (fs-extra) | workflow-orchestrator.js, orchestration/index.js | No |
| `checklist-runner.js` | Executes validation checklists programmatically | None (fs-extra, js-yaml) | workflow-orchestrator.js, orchestration/index.js | No |
| `parallel-executor.js` | Concurrent phase execution with max concurrency | None (chalk) | workflow-orchestrator.js, orchestration/index.js | No |
| `tech-stack-detector.js` | Pre-flight project tech stack detection | None (fs-extra) | workflow-orchestrator.js, master-orchestrator.js, orchestration/index.js | No |
| `condition-evaluator.js` | Evaluates workflow conditions against tech stack profile | None | workflow-orchestrator.js, orchestration/index.js | No |
| `skill-dispatcher.js` | Maps agent IDs to AIOS Skill invocations | None | workflow-orchestrator.js, orchestration/index.js | No |
| `recovery-handler.js` | Story 0.5: Auto error recovery (retry, rollback, skip, escalate) | None (fs-extra, EventEmitter) | master-orchestrator.js, orchestration/index.js, tests/core/ | No |
| `gate-evaluator.js` | Story 0.6: Quality gates between epics | None (fs-extra, js-yaml) | master-orchestrator.js, orchestration/index.js, tests/core/ | No |
| `agent-invoker.js` | Story 0.7: Agent invocation interface for orchestration | None (fs-extra, EventEmitter) | master-orchestrator.js, orchestration/index.js, tests/core/ | No |
| `dashboard-integration.js` | Story 0.8: Real-time dashboard monitoring integration | events/ (getDashboardEmitter) | orchestration/index.js, tests/core/ | No |
| `cli-commands.js` | Story 0.9: CLI commands for orchestrator control | master-orchestrator.js | orchestration/index.js, tests/core/ | No |

#### Epic Executors (7 files)

| File | Purpose | Internal Deps | External Consumers | Orphan? |
|------|---------|---------------|-------------------|---------|
| `executors/index.js` | Barrel: maps epic numbers to executor classes | epic-executor.js, epic-3 through epic-7 | master-orchestrator.js, tests/core/ | No |
| `executors/epic-executor.js` | Base class for all epic executors (ExecutionStatus enum) | None | All epic-N-executor files | No |
| `executors/epic-3-executor.js` | Epic 3: Requirements Analysis executor | epic-executor.js | executors/index.js | No |
| `executors/epic-4-executor.js` | Epic 4: Architecture Design executor | epic-executor.js | executors/index.js | No |
| `executors/epic-5-executor.js` | Epic 5: Recovery System executor | epic-executor.js | executors/index.js | No |
| `executors/epic-6-executor.js` | Epic 6: QA/Verification executor | epic-executor.js | executors/index.js | No |
| `executors/epic-7-executor.js` | Epic 7: Deployment executor | epic-executor.js | executors/index.js | No |

### 2.11 permissions/ (3 files + 1 test)

Agent permission mode system (explore/ask/auto).

| File | Purpose | Internal Deps | External Consumers | Orphan? |
|------|---------|---------------|-------------------|---------|
| `index.js` | Barrel + utility functions (createGuard, checkOperation, setMode) | permission-mode.js, operation-guard.js | **No external consumers found** | **Partial orphan** (documented but not yet wired) |
| `permission-mode.js` | 3-mode permission system (explore/ask/auto) | None (js-yaml) | operation-guard.js, permissions/index.js | No |
| `operation-guard.js` | Intercepts tool operations and enforces permission rules | permission-mode.js | permissions/index.js | No |
| `__tests__/permission-mode.test.js` | Unit tests | permission-mode.js | (test-only) | N/A |

### 2.12 quality-gates/ (9 files)

3-layer quality gate pipeline (pre-commit, PR automation, human review).

| File | Purpose | Internal Deps | External Consumers | Orphan? |
|------|---------|---------------|-------------------|---------|
| `quality-gate-manager.js` | Main orchestrator for 3-layer pipeline | layer1-precommit, layer2-pr-automation, layer3-human-review, human-review-orchestrator, notification-manager | CLI qa/run, qa/status, tests/ | No |
| `base-layer.js` | Abstract base class for layers | None | layer1, layer2, layer3 | No |
| `layer1-precommit.js` | Layer 1: lint, test, typecheck | base-layer.js | quality-gate-manager.js, tests/ | No |
| `layer2-pr-automation.js` | Layer 2: CodeRabbit + Quinn automation | base-layer.js | quality-gate-manager.js, tests/ | No |
| `layer3-human-review.js` | Layer 3: Strategic human review + checklists | base-layer.js, checklist-generator.js | quality-gate-manager.js, tests/ | No |
| `checklist-generator.js` | Generates strategic review checklists | None | layer3-human-review.js, tests/ | No |
| `human-review-orchestrator.js` | Story 3.5: Full orchestration of 3-layer flow | focus-area-recommender.js, notification-manager.js | quality-gate-manager.js, tests/ | No |
| `focus-area-recommender.js` | Story 3.5: Generates focus area recommendations | None | human-review-orchestrator.js, tests/ | No |
| `notification-manager.js` | Story 3.5: Review notifications (console, file) | None | human-review-orchestrator.js, quality-gate-manager.js, tests/ | No |

### 2.13 registry/ (3 files)

Service registry for worker/task discovery.

| File | Purpose | Internal Deps | External Consumers | Orphan? |
|------|---------|---------------|-------------------|---------|
| `registry-loader.js` | Loads and queries service registry JSON with caching | None | core/index.js, CLI workers/* (list, info, search-keyword, search-semantic), tests/ | No |
| `build-registry.js` | Scans AIOS modules and builds registry JSON | None (glob) | **None found** (standalone script) | **Partial** -- used as CLI script |
| `validate-registry.js` | Validates registry JSON against schema (smoke tests REG-01..06) | None (ajv, ajv-formats) | **None found** (standalone script) | **Partial** -- used as CLI script |

### 2.14 session/ (2 files)

Session detection and context continuity.

| File | Purpose | Internal Deps | External Consumers | Orphan? |
|------|---------|---------------|-------------------|---------|
| `context-detector.js` | Hybrid session type detection (new/existing/workflow) | None | context-loader.js, core/index.js, tests/unit/, tests/integration/ | No |
| `context-loader.js` | Multi-agent session context loader | context-detector.js | core/index.js, .aios-core/scripts/session-context-loader.js | No |

### 2.15 utils/ (3 files)

Shared utility modules.

| File | Purpose | Internal Deps | External Consumers | Orphan? |
|------|---------|---------------|-------------------|---------|
| `output-formatter.js` | Personalized agent output with personality injection | None (js-yaml) | core/index.js | No |
| `yaml-validator.js` | YAML structure validation for agents/manifests/tasks | None (js-yaml, fs-extra) | core/index.js | No |
| `security-utils.js` | Path validation, input sanitization, template injection prevention | None | tests/unit/security-utils.test.js | **Partial orphan** -- tested but not consumed by other core modules |

### 2.16 Root-level (2 files)

| File | Purpose | Internal Deps | External Consumers | Orphan? |
|------|---------|---------------|-------------------|---------|
| `index.js` | CJS barrel -- exports config, session, elicitation, utils, registry, health-check | config/, session/, elicitation/, utils/, registry/, health-check/ | None found importing core/index.js directly (subsystems are imported individually) | No |
| `index.esm.js` | ESM barrel -- mirrors CJS exports | Same as above | None found (ESM not yet consumed) | **Partial orphan** -- prepared for future ESM migration |

---

## 3. Inter-Subsystem Dependency Diagram

```
                              +-----------+
                              |  config/  |
                              |  (5 files)|
                              +-----+-----+
                                    |
                    +---------------+---------------+
                    |                               |
              +-----v------+                 +------v-----+
              | CLI config |                 | dev/scripts|
              | commands   |                 | agent-cfg  |
              +------------+                 +------------+

   +----------+     +-----------+     +-------------+
   | session/ |     | events/   |     | permissions/|
   | (2 files)|     | (3 files) |     | (3 files)   |
   +----+-----+     +-----+-----+     +------+------+
        |                  |                  |
        |                  |              (not yet wired)
   +----v-----+    +-------v--------+
   |core/index|    | orchestration/ |
   | (barrel) |    | dashboard-     |
   +----------+    | integration    |
                   +-------+--------+

   +------------+     +-----+------+     +---------+
   | elicitation|     | orchestration  |     | quality-|
   | (5 files)  |     | (19 files)     |     | gates/  |
   +-----+------+     +-------+--------+     | (9 files)
         |                     |              +----+----+
    .aios-core/index.js        |                   |
                               |              CLI qa/*
                          CLI orchestrate
                          + tests/core/

   +----------+     +----------+     +-----------+     +---------+
   | execution|     | memory/  |     | mcp/      |     | registry|
   | (10 files|---->| (4+1)   |     | (5 files) |     | (3 files)
   +----+-----+     +----+----+     +-----+-----+     +----+----+
        |                |                |                 |
        |           (optional)       CLI mcp/*         CLI workers/*
   tests/core/                      tests/mcp/        tests/registry/

   +----------+     +-----------+     +----------+     +----------+
   | ideation/|     | manifest/ |     | health-  |     | utils/   |
   | (1 file) |     | (2 files) |     | check/   |     | (3 files)|
   +----+-----+     +-----+----+     | (35 files)|    +----+-----+
        |                 |           +-----+-----+         |
   (ORPHAN)          CLI manifest/    core/index.js     core/index.js
                     tests/manifest   tests/health/     tests/security
```

### Textual Inter-Subsystem Dependencies

| Source Subsystem | Depends On | Dependency Type |
|-----------------|------------|-----------------|
| `config/config-resolver` | `config/merge-utils`, `config/env-interpolator`, `config/config-cache` | Hard (require) |
| `config/env-interpolator` | `config/merge-utils` (isPlainObject) | Hard (require) |
| `orchestration/dashboard-integration` | `events/` (getDashboardEmitter) | Hard (require) |
| `orchestration/master-orchestrator` | `orchestration/executors/`, `orchestration/recovery-handler`, `orchestration/gate-evaluator`, `orchestration/agent-invoker`, `orchestration/tech-stack-detector` | Hard (require) |
| `orchestration/workflow-orchestrator` | `orchestration/subagent-prompt-builder`, `orchestration/context-manager`, `orchestration/parallel-executor`, `orchestration/checklist-runner`, `orchestration/tech-stack-detector`, `orchestration/condition-evaluator`, `orchestration/skill-dispatcher` | Hard (require) |
| `execution/autonomous-build-loop` | `execution/build-state-manager` | Hard (require) |
| `execution/build-orchestrator` | `execution/autonomous-build-loop`, `execution/build-state-manager` | Hard (require) |
| `execution/context-injector` | `memory/memory-query` (missing), `memory/gotchas-memory`, `memory/session-memory` (missing) | Soft (try/catch) |
| `execution/subagent-dispatcher` | `memory/memory-query` (missing), `memory/gotchas-memory` | Soft (try/catch) |
| `execution/wave-executor` | `execution/rate-limit-manager`, external `workflow-intelligence/engine/wave-analyzer` | Soft (try/catch) |
| `memory/file-evolution-tracker` | `memory/context-snapshot` | Hard (require) |
| `memory/timeline-manager` | `memory/file-evolution-tracker`, `memory/context-snapshot`, `execution/build-state-manager` | Hard + Soft |
| `ideation/ideation-engine` | `memory/gotchas-memory` | Soft (try/catch) |
| `mcp/global-config-manager` | `mcp/os-detector` | Hard (require) |
| `mcp/symlink-manager` | `mcp/os-detector` | Hard (require) |
| `mcp/config-migrator` | `mcp/global-config-manager`, `mcp/symlink-manager` | Hard (require) |
| `permissions/operation-guard` | `permissions/permission-mode` | Hard (require) |
| `quality-gates/quality-gate-manager` | `quality-gates/layer1-precommit`, `quality-gates/layer2-pr-automation`, `quality-gates/layer3-human-review`, `quality-gates/human-review-orchestrator`, `quality-gates/notification-manager` | Hard (require) |
| `quality-gates/layer1,2,3-*` | `quality-gates/base-layer` | Hard (require) |
| `quality-gates/layer3-human-review` | `quality-gates/checklist-generator` | Hard (require) |
| `quality-gates/human-review-orchestrator` | `quality-gates/focus-area-recommender`, `quality-gates/notification-manager` | Hard (require) |
| `session/context-loader` | `session/context-detector` | Hard (require) |
| `elicitation/elicitation-engine` | `elicitation/session-manager` | Hard (require) |
| All health-check checks | `health-check/base-check` | Hard (require/extends) |
| `health-check/check-registry` | `health-check/base-check` | Hard (require) |
| `health-check/engine` | `health-check/base-check` | Hard (require) |
| `health-check/healers/index` | `health-check/healers/backup-manager`, `health-check/base-check` | Hard (require) |

---

## 4. External Integration Points

### 4.1 CLI Commands (`.aios-core/cli/commands/`)

| CLI Command | Core Module(s) Used |
|-------------|-------------------|
| `aios workers list/info/search-keyword/search-semantic` | `registry/registry-loader` |
| `aios manifest validate` | `manifest/manifest-validator` |
| `aios manifest regenerate` | `manifest/manifest-generator` |
| `aios qa run/status` | `quality-gates/quality-gate-manager` |
| `aios mcp add` | `mcp/global-config-manager`, `mcp/os-detector` |
| `aios mcp status` | `mcp/global-config-manager`, `mcp/symlink-manager`, `mcp/os-detector`, `mcp/config-migrator` |
| `aios mcp setup` | `mcp/global-config-manager`, `mcp/os-detector` |
| `aios mcp link` | `mcp/symlink-manager`, `mcp/global-config-manager`, `mcp/os-detector`, `mcp/config-migrator` |
| `aios config show/diff/migrate/validate/init-local` | `config/config-resolver`, `config/merge-utils`, `config/env-interpolator` |

### 4.2 Development Scripts (`.aios-core/development/scripts/`)

| Script | Core Module(s) Used |
|--------|-------------------|
| `agent-config-loader.js` | `config/config-cache`, `config/config-resolver` |
| `generate-greeting.js` | `development/scripts/agent-config-loader.js` (which uses config/) |
| `verify-workflow-gaps.js` | `elicitation/workflow-elicitation` |
| `session-context-loader.js` (deprecated shim) | `session/context-loader` |

### 4.3 Package Entry Point (`.aios-core/index.js`)

| Entry Point | Core Module(s) Used |
|-------------|-------------------|
| `.aios-core/index.js` (npm package) | `elicitation/elicitation-engine` |

### 4.4 Test Files

| Test Directory | Core Module(s) Tested |
|---------------|----------------------|
| `tests/core/` | execution/* (7 test files), orchestration/* (6 test files) |
| `tests/config/` | config/merge-utils, config/env-interpolator, config/config-resolver, config/config-cache |
| `tests/health-check/` | health-check/engine, health-check/reporters, health-check/healers, health-check/index |
| `tests/security/` | elicitation/elicitation-engine, elicitation/session-manager |
| `tests/unit/` | session/context-detector, utils/security-utils, mcp/*, manifest/*, quality-gates/* |
| `tests/integration/` | quality-gates/*, mcp/*, session/context-detector, registry/registry-loader |

---

## 5. Orphaned Core Modules

These files have no external consumers (no CLI command, no test, no other module imports them outside their subsystem):

| File | Subsystem | Status | Recommendation |
|------|-----------|--------|---------------|
| `ideation/ideation-engine.js` | ideation | **Full orphan** -- no external consumer, not re-exported by any index | Wire to CLI command or agent, or remove |
| `memory/timeline-manager.js` | memory | **Full orphan** -- consumed only by internal test verify file | Wire to execution pipeline or CLI command |
| `permissions/index.js` (+ children) | permissions | **Partial orphan** -- documented usage but no actual require() from CLI or agents found | Wire to CLI guard middleware or agent activation |
| `utils/security-utils.js` | utils | **Partial orphan** -- has tests but not consumed by any other core module | Wire to elicitation-engine (which uses BasicInputValidator instead) or CLI |
| `core/index.esm.js` | root | **Partial orphan** -- ESM barrel not consumed (project uses CJS) | Keep for future ESM migration |
| `registry/build-registry.js` | registry | **Partial orphan** -- standalone script, not imported by any module | Expected usage: `node build-registry.js` as CLI script |
| `registry/validate-registry.js` | registry | **Partial orphan** -- standalone script, not imported by any module | Expected usage: `node validate-registry.js` as CLI script |

---

## 6. Missing/Phantom Dependencies

These modules are referenced via `require()` but do not exist on disk. All are guarded with try/catch:

| Referenced Path | Referenced From | Status |
|----------------|-----------------|--------|
| `../memory/memory-query` | execution/context-injector.js, execution/subagent-dispatcher.js | **Does not exist** -- feature not yet implemented |
| `../memory/session-memory` | execution/context-injector.js | **Does not exist** -- feature not yet implemented |
| `../../infrastructure/scripts/security-checker` | elicitation/elicitation-engine.js | Exists outside core/ at `.aios-core/infrastructure/scripts/` |

---

## 7. Subsystem Coupling Matrix

High-level view of which subsystems depend on other subsystems:

| Subsystem | Depends On | Depended Upon By |
|-----------|-----------|-----------------|
| config | (none) | CLI config, development/scripts, core/index |
| elicitation | (none internally) | core/index, .aios-core/index, development/scripts |
| events | (none) | orchestration |
| execution | memory (soft), workflow-intelligence (soft, external) | tests only |
| health-check | (self-contained) | core/index |
| ideation | memory (soft) | **nothing** |
| manifest | (none) | CLI manifest |
| mcp | (self-contained chain) | CLI mcp |
| memory | execution (soft, reverse) | execution (soft), ideation (soft) |
| orchestration | events, executors (internal) | CLI (future), tests |
| permissions | (self-contained) | **nothing yet** |
| quality-gates | (self-contained chain) | CLI qa, tests |
| registry | (none) | core/index, CLI workers |
| session | (self-contained pair) | core/index, development/scripts, tests |
| utils | (none) | core/index, tests |

### Key Observations

1. **config/** is the most foundational subsystem -- no dependencies on any other core module.
2. **orchestration/** is the largest and most complex subsystem (19 files) but is mostly self-contained with only one cross-subsystem dependency (events/).
3. **execution/** has soft dependencies on **memory/** and external **workflow-intelligence/** -- all guarded with try/catch for graceful degradation.
4. **health-check/** is fully self-contained (35 files) with its own checks/healers/reporters architecture.
5. **permissions/** is complete but not yet wired into the CLI or agent activation pipeline.
6. Three planned memory modules (memory-query, session-memory) do not exist yet, indicating incomplete Epic 9 implementation.
7. The `core/index.js` barrel does NOT re-export orchestration, execution, memory, permissions, quality-gates, mcp, or ideation -- these are consumed directly by their respective CLI commands and tests.

---

## 8. Architectural Notes

### Module Isolation Patterns

- **Hard isolation**: config, manifest, mcp, registry, session, utils -- no cross-subsystem deps
- **Soft coupling**: execution <-> memory (try/catch), ideation -> memory (try/catch)
- **Internal coupling**: orchestration is tightly coupled internally but loosely coupled externally
- **Vertical slice**: quality-gates has a clean layered architecture (base -> layers -> manager -> CLI)

### Deprecation Tracking

| File | Deprecated Since | Replacement | Removal Target |
|------|-----------------|-------------|---------------|
| `config/config-loader.js` | Story 6.1.4 / PRO-4 | `config/config-resolver.js` + `development/scripts/agent-config-loader.js` | v4.0.0 |

### Missing Test Coverage

| Core Module | Has Tests? |
|-------------|-----------|
| ideation/ideation-engine.js | No |
| memory/timeline-manager.js | Only verify script |
| memory/context-snapshot.js | Only verify script |
| memory/file-evolution-tracker.js | Only verify script |
| permissions/index.js | Only permission-mode test |
| orchestration/condition-evaluator.js | No dedicated test |
| orchestration/skill-dispatcher.js | No dedicated test |
| orchestration/tech-stack-detector.js | No dedicated test |
| utils/output-formatter.js | No |
| utils/yaml-validator.js | No |

---

*End of Phase 5 Cross-Reference Analysis*
