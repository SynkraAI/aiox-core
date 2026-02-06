# Cross-Reference Phase 4: Infrastructure Analysis

**Generated:** 2026-02-05
**Scope:** `.aios-core/infrastructure/` -- scripts, integrations, tools, templates, tests
**Total files analyzed:** 115

---

## Table of Contents

1. [Infrastructure Scripts](#1-infrastructure-scripts)
2. [Infrastructure Integrations](#2-infrastructure-integrations)
3. [Infrastructure Tools](#3-infrastructure-tools)
4. [Infrastructure Templates](#4-infrastructure-templates)
5. [Infrastructure Tests](#5-infrastructure-tests)
6. [Infrastructure Root Files](#6-infrastructure-root-files)
7. [Category Breakdown](#7-category-breakdown)
8. [Orphan Analysis](#8-orphan-analysis)
9. [Summary Statistics](#9-summary-statistics)

---

## 1. Infrastructure Scripts

Total: 90 files (75 JS + 10 shell templates + 5 doc-integrity sub-module)

### 1.1 Scripts Exported via `index.js` (47 scripts)

These scripts are imported in `.aios-core/infrastructure/index.js` and exposed as the module's public API.

| # | File | Category | Purpose | Key Dependencies | Consumers (beyond index.js) | Orphan? |
|---|------|----------|---------|-----------------|---------------------------|---------|
| 1 | `scripts/git-wrapper.js` | Git | Git CLI wrapper for all git operations | `child_process` | conflict-resolver, branch-manager, agent devops, core modules | No |
| 2 | `scripts/git-config-detector.js` | Git | Detects git configuration status (user, email) | `child_process` | greeting-builder, tests/unit/git-config-detector, agent templates | No |
| 3 | `scripts/branch-manager.js` | Git | Branch management utilities | git-wrapper | agent devops, core modules, tasks | No |
| 4 | `scripts/commit-message-generator.js` | Git | Generates conventional commit messages | diff-generator, modification-validator | utility-integration-guide | No |
| 5 | `scripts/pm-adapter.js` | PM Integration | Base PMAdapter class for all PM adapters | `fs`, `yaml` | clickup/jira/github/local adapters, pm-adapter-factory, index.js | No |
| 6 | `scripts/pm-adapter-factory.js` | PM Integration | Factory for creating PM adapter instances | pm-adapters/*.js | story-manager, index.js, tasks/po-sync, tasks/po-pull | No |
| 7 | `scripts/status-mapper.js` | PM Integration | Maps story status between AIOS and PM tools | -- | clickup-helpers, tests/clickup, tasks | No |
| 8 | `scripts/clickup-helpers.js` | PM Integration | ClickUp API helper functions | `https`, tool-resolver, status-mapper | clickup-adapter, story-update-hook, tests | No |
| 9 | `scripts/template-engine.js` | Template/Generation | Template rendering engine (Handlebars-like) | `fs`, `yaml` | component-generator, template-validator, tasks, aios-core index | No |
| 10 | `scripts/component-generator.js` | Template/Generation | AIOS component generation (agents, tasks, templates) | template-engine, yaml-validator, security-checker, transaction-manager | tasks (15+ tasks), aios-core index | No |
| 11 | `scripts/component-metadata.js` | Template/Generation | Metadata management for AIOS components | `fs`, `yaml` | component-generator, transaction-manager, tasks/modify-agent | No |
| 12 | `scripts/component-search.js` | Template/Generation | Search across AIOS components | `fs` | aios-core index, tasks (analyze-framework, qa-generate-tests) | No |
| 13 | `scripts/batch-creator.js` | Template/Generation | Batch creation of AIOS components | component-generator, dependency-analyzer, transaction-manager | aios-core index, tasks/cleanup-utilities | No |
| 14 | `scripts/aios-validator.js` | Validation | Validates AIOS component structure and schema | `fs`, `yaml` | CI (ci.yml), installer tests, README, git-workflow-guide | No |
| 15 | `scripts/template-validator.js` | Validation | Validates template files for correctness | template-engine | component-generator, tasks/create-doc | No |
| 16 | `scripts/validate-output-pattern.js` | Validation | Validates task output patterns | -- | task-execution-report, output-formatter tests | No |
| 17 | `scripts/spot-check-validator.js` | Validation | Spot check validation for components | -- | Only index.js + install-manifest | Likely |
| 18 | `scripts/dependency-analyzer.js` | Analysis | Analyzes component dependencies | `fs` | batch-creator, modification-validator, aios-core index, tasks | No |
| 19 | `scripts/dependency-impact-analyzer.js` | Analysis | Analyzes impact of dependency changes | -- | tasks (propose-modification, architect-analyze-impact, qa-review) | No |
| 20 | `scripts/framework-analyzer.js` | Analysis | Discovers and catalogs framework components | `fs`, `yaml`, `chalk` | verify-workflow-gaps, tasks/analyze-framework, core-config | No |
| 21 | `scripts/capability-analyzer.js` | Analysis | Analyzes agent/component capabilities | security-checker | improvement-validator, tasks/improve-self, elicitation-engine | No |
| 22 | `scripts/security-checker.js` | Analysis | Security validation for components | -- | component-generator, elicitation-engine, aios-master agent | No |
| 23 | `scripts/modification-risk-assessment.js` | Analysis | Assesses risk of modifications | -- | tasks/architect-analyze-impact | No |
| 24 | `scripts/coverage-analyzer.js` | Testing | Test coverage analysis | -- | tasks/qa-generate-tests | No |
| 25 | `scripts/test-generator.js` | Testing | Test file generation | -- | tasks/qa-generate-tests, getting-started docs | No |
| 26 | `scripts/test-utilities.js` | Testing | Test utility helpers | -- | tests/integration | No |
| 27 | `scripts/test-utilities-fast.js` | Testing | Lightweight fast test utilities | test-utilities | Only index.js + install-manifest + path-analysis | Likely |
| 28 | `scripts/test-quality-assessment.js` | Testing | Assesses test quality and coverage | -- | tasks/qa-generate-tests | No |
| 29 | `scripts/sandbox-tester.js` | Testing | Sandbox testing for code execution | -- | tasks/improve-self | No |
| 30 | `scripts/performance-analyzer.js` | Performance | Performance analysis and profiling | -- | tasks/analyze-framework, module-system docs | No |
| 31 | `scripts/performance-optimizer.js` | Performance | Performance optimization suggestions | -- | tasks/dev-optimize-performance | No |
| 32 | `scripts/performance-tracker.js` | Performance | Performance metrics tracking | -- | agent-config-loader | No |
| 33 | `scripts/performance-and-error-resolver.js` | Performance | Combined perf and error resolution | -- | Only index.js + install-manifest | Likely |
| 34 | `scripts/code-quality-improver.js` | Quality | Code quality improvement suggestions | -- | tasks/dev-improve-code-quality | No |
| 35 | `scripts/refactoring-suggester.js` | Quality | Refactoring suggestions | -- | tasks/dev-suggest-refactoring | No |
| 36 | `scripts/improvement-engine.js` | Quality | General improvement detection | -- | tasks/analyze-framework | No |
| 37 | `scripts/improvement-validator.js` | Quality | Validates proposed improvements | backup-manager, security-checker | tasks/improve-self | No |
| 38 | `scripts/modification-validator.js` | Quality | Validates component modifications | dependency-analyzer, yaml-validator, security-checker | commit-message-generator | No |
| 39 | `scripts/conflict-resolver.js` | Utilities | Resolves merge conflicts | git-wrapper | Only index.js + config refs | No |
| 40 | `scripts/documentation-synchronizer.js` | Utilities | Syncs documentation with code changes | `@babel/parser`, `@babel/traverse`, `yaml`, `marked` | tasks/sync-documentation, utility-integration-guide | No |
| 41 | `scripts/tool-resolver.js` | Utilities | Resolves tool configurations from tools/ | `fs`, `yaml` | clickup-helpers, story-manager, many tests, tools README | No |
| 42 | `scripts/usage-analytics.js` | Utilities | Analytics for AIOS feature usage | -- | tasks/analyze-framework | No |
| 43 | `scripts/project-status-loader.js` | Utilities | Dynamic project status for agent greetings | worktree-manager, `execa`, `yaml` | greeting-builder, generate-greeting, tests, many docs | No |
| 44 | `scripts/visual-impact-generator.js` | Utilities | Generates visual impact reports | -- | tasks/architect-analyze-impact | No |
| 45 | `scripts/atomic-layer-classifier.js` | Utilities | Classifies components by atomic design layer | -- | Only index.js + install-manifest | Likely |
| 46 | `scripts/backup-manager.js` | System | File backup and restore management | `fs` | health-check healers, improvement-validator, tasks | No |
| 47 | `scripts/transaction-manager.js` | System | Transactional operations with rollback | -- | batch-creator, component-generator | No |
| 48 | `scripts/repository-detector.js` | System | Detects repository type and structure | -- | aios-init.js, agent devops, tasks | No |
| 49 | `scripts/approval-workflow.js` | System | Approval workflow management | -- | tasks/architect-analyze-impact | No |
| 50 | `scripts/config-cache.js` | Config | Configuration caching layer | -- | config-resolver, agent-config-loader, core modules | No |
| 51 | `scripts/config-loader.js` | Config | Configuration file loading | -- | index.js internal reference | No |
| 52 | `scripts/output-formatter.js` | Config | Output formatting utilities | -- | core index, workflow-intelligence, CLI search, many tests | No |
| 53 | `scripts/yaml-validator.js` | Config | YAML file validation | -- | component-generator, modification-validator, aios-master agent | No |

### 1.2 Scripts NOT Exported via `index.js` (28 scripts)

These scripts exist in the scripts/ directory but are NOT part of the module's public API.

| # | File | Category | Purpose | Key Dependencies | Consumers | Orphan? |
|---|------|----------|---------|-----------------|-----------|---------|
| 1 | `scripts/approach-manager.js` | Recovery (Epic 5) | Tracks current approach for implementation attempts | `fs`, `path` | epic-5-executor, agent dev, docs | No |
| 2 | `scripts/asset-inventory.js` | Analysis (Epic 2) | Creates comprehensive inventory of AIOS assets | `fs`, `yaml` | agent devops, many docs, install-manifest | No |
| 3 | `scripts/changelog-generator.js` | Documentation | Auto-generates changelogs from stories/commits | `fs`, `child_process` | Only install-manifest | **YES** |
| 4 | `scripts/codebase-mapper.js` | Memory (Epic 7) | Generates codebase maps for context generation | `fs`, `path` | agent architect, many docs | No |
| 5 | `scripts/dashboard-status-writer.js` | Dashboard | Writes agent status to dashboard status.json | `fs` | Only install-manifest + self | **YES** |
| 6 | `scripts/gotchas-documenter.js` | Memory (Epic 7) | Extracts and consolidates gotchas from sessions | `fs`, `path` | tasks/document-gotchas, docs | No |
| 7 | `scripts/migrate-agent.js` | Migration | Migrates agents from V2 to V3 format | `fs`, `yaml` | agent devops, many docs, README | No |
| 8 | `scripts/path-analyzer.js` | Analysis (Epic 2) | Detects broken references between assets | `fs`, `path` | agent devops, many docs | No |
| 9 | `scripts/pattern-extractor.js` | Memory (Epic 7) | Extracts and documents code patterns | `fs`, `path` | agent analyst, tasks/extract-patterns, docs | No |
| 10 | `scripts/plan-tracker.js` | Execution (Epic 4) | Tracks story implementation progress | `fs`, `yaml` | epic-4-executor, tasks, tests, many docs | No |
| 11 | `scripts/recovery-tracker.js` | Recovery (Epic 5) | Tracks implementation attempts per subtask | `fs` | core (recovery-handler, build-state-manager, autonomous-build-loop), agent dev, tasks, tests | No |
| 12 | `scripts/rollback-manager.js` | Recovery (Epic 5) | Targeted rollback per subtask | `fs`, `child_process` | recovery-handler, epic-5-executor, agent dev, docs | No |
| 13 | `scripts/story-worktree-hooks.js` | Worktree | Story lifecycle hooks for worktree management | `fs`, `yaml`, worktree-manager (lazy) | docs, install-manifest | No |
| 14 | `scripts/stuck-detector.js` | Recovery (Epic 5) | Detects stuck/circular execution patterns | `fs` | recovery-handler, epic-5-executor, build-state-manager, agent dev, tests, docs | No |
| 15 | `scripts/subtask-verifier.js` | Execution (Epic 4) | Verifies subtask completion | `fs`, `yaml`, `execa` | epic-4-executor, tasks/verify-subtask, docs | No |
| 16 | `scripts/worktree-manager.js` | Worktree | Git worktree management for stories | `execa`, `chalk` | project-status-loader, build-orchestrator, autonomous-build-loop, story-worktree-hooks, tasks, tests, many docs | No |
| 17 | `scripts/qa-loop-orchestrator.js` | QA (Epic 6) | Automated QA review-fix-re-review loop | `fs` | epic-6-executor, docs | No |
| 18 | `scripts/qa-report-generator.js` | QA (Epic 6) | Generates comprehensive QA reports | `fs` | docs only | No |
| 19 | `scripts/cicd-discovery.js` | CI/CD | Auto-detects CI/CD infrastructure | `fs`, `EventEmitter` | Only install-manifest | **YES** |
| 20 | `scripts/pr-review-ai.js` | CI/CD | AI-powered PR review system | `child_process`, `EventEmitter` | Only install-manifest + self | **YES** |
| 21 | `scripts/test-discovery.js` | Testing | Auto-detects test frameworks and files | `fs`, `child_process`, `EventEmitter` | Only install-manifest | **YES** |
| 22 | `scripts/validate-agents.js` | Validation | Agent consistency validation across all agents | `fs`, `path` | package.json (npm script), install-manifest | No |
| 23 | `scripts/diff-generator.js` | Git | Generates diffs for commit messages | `child_process` | commit-message-generator (internal), tasks/qa-review | No |
| 24 | `scripts/documentation-synchronizer.js` | Documentation | Already listed above (exported) | -- | -- | -- |
| 25 | `scripts/framework-analyzer.js` | Analysis | Already listed above (exported) | -- | -- | -- |

### 1.3 IDE Sync Sub-module (6 files)

| # | File | Category | Purpose | Key Dependencies | Consumers | Orphan? |
|---|------|----------|---------|-----------------|-----------|---------|
| 1 | `scripts/ide-sync/index.js` | IDE Sync | Main orchestrator for syncing agents to IDEs | `fs-extra`, `yaml`, agent-parser, redirect-generator | package.json, CI (ci.yml), tests, docs | No |
| 2 | `scripts/ide-sync/agent-parser.js` | IDE Sync | Parses agent markdown into structured data | `fs-extra`, `yaml` | ide-sync/index.js, tests | No |
| 3 | `scripts/ide-sync/validator.js` | IDE Sync | Validates sync status, detects drift | `fs-extra`, `yaml` | ide-sync/index.js, tests | No |
| 4 | `scripts/ide-sync/redirect-generator.js` | IDE Sync | Creates redirect files for deprecated agents | `fs-extra` | ide-sync/index.js | No |
| 5 | `scripts/ide-sync/transformers/claude-code.js` | IDE Sync | Transforms agent definitions for Claude Code | -- | ide-sync/index.js, tests | No |
| 6 | `scripts/ide-sync/transformers/cursor.js` | IDE Sync | Transforms agent definitions for Cursor IDE | -- | ide-sync/index.js, tests | No |
| 7 | `scripts/ide-sync/transformers/windsurf.js` | IDE Sync | Transforms agent definitions for Windsurf IDE | -- | ide-sync/index.js, tests | No |
| 8 | `scripts/ide-sync/transformers/antigravity.js` | IDE Sync | Transforms agent definitions for Antigravity | -- | ide-sync/index.js, tests | No |

### 1.4 Documentation Integrity Sub-module (7 files)

| # | File | Category | Purpose | Key Dependencies | Consumers | Orphan? |
|---|------|----------|---------|-----------------|-----------|---------|
| 1 | `scripts/documentation-integrity/index.js` | Doc Integrity | Module entry point, exports all sub-modules | brownfield-analyzer, doc-generator, etc. | installer wizard, tasks | No |
| 2 | `scripts/documentation-integrity/brownfield-analyzer.js` | Doc Integrity | Analyzes existing (brownfield) projects | `fs`, `path` | index.js, tasks/analyze-brownfield, tests | No |
| 3 | `scripts/documentation-integrity/doc-generator.js` | Doc Integrity | Generates project documentation files | `fs`, `path` | index.js, tasks/setup-project-docs, tests | No |
| 4 | `scripts/documentation-integrity/gitignore-generator.js` | Doc Integrity | Generates .gitignore from templates | `fs`, `path` | index.js, tests | No |
| 5 | `scripts/documentation-integrity/mode-detector.js` | Doc Integrity | Detects project mode (greenfield/brownfield) | `fs`, `path` | index.js, tests | No |
| 6 | `scripts/documentation-integrity/config-generator.js` | Doc Integrity | Generates configuration files | config-loader, deployment-config-loader | index.js, tests | No |
| 7 | `scripts/documentation-integrity/deployment-config-loader.js` | Doc Integrity | Loads deployment configuration | config-loader | config-generator | No |

### 1.5 LLM Routing Sub-module (12 files)

| # | File | Category | Purpose | Key Dependencies | Consumers | Orphan? |
|---|------|----------|---------|-----------------|-----------|---------|
| 1 | `scripts/llm-routing/install-llm-routing.js` | LLM Routing | Installs claude-max and claude-free CLI commands | `fs`, `os` | installer wizard, tasks/setup-llm-routing, tests, docs | No |
| 2 | `scripts/llm-routing/usage-tracker/index.js` | LLM Routing | HTTP proxy tracking DeepSeek API usage | `http`, `https`, `fs` | deepseek shell templates | No |
| 3 | `scripts/llm-routing/templates/claude-free.cmd` | LLM Routing | Windows: Claude Code with free (DeepSeek) model | -- | install-llm-routing | No |
| 4 | `scripts/llm-routing/templates/claude-free.sh` | LLM Routing | Unix: Claude Code with free (DeepSeek) model | -- | install-llm-routing | No |
| 5 | `scripts/llm-routing/templates/claude-max.cmd` | LLM Routing | Windows: Claude Code with Max subscription | -- | install-llm-routing | No |
| 6 | `scripts/llm-routing/templates/claude-max.sh` | LLM Routing | Unix: Claude Code with Max subscription | -- | install-llm-routing | No |
| 7 | `scripts/llm-routing/templates/claude-free-tracked.cmd` | LLM Routing | Windows: Free model with usage tracking | -- | install-llm-routing | No |
| 8 | `scripts/llm-routing/templates/claude-free-tracked.sh` | LLM Routing | Unix: Free model with usage tracking | -- | install-llm-routing | No |
| 9 | `scripts/llm-routing/templates/deepseek-proxy.cmd` | LLM Routing | Windows: DeepSeek proxy launcher | usage-tracker | install-llm-routing | No |
| 10 | `scripts/llm-routing/templates/deepseek-proxy.sh` | LLM Routing | Unix: DeepSeek proxy launcher | usage-tracker | install-llm-routing | No |
| 11 | `scripts/llm-routing/templates/deepseek-usage.cmd` | LLM Routing | Windows: DeepSeek usage report | -- | install-llm-routing | No |
| 12 | `scripts/llm-routing/templates/deepseek-usage.sh` | LLM Routing | Unix: DeepSeek usage report | -- | install-llm-routing | No |

---

## 2. Infrastructure Integrations

Total: 5 files (4 adapters + 1 README)

| # | File | Category | Purpose | Key Dependencies | Consumers | Orphan? |
|---|------|----------|---------|-----------------|-----------|---------|
| 1 | `integrations/pm-adapters/clickup-adapter.js` | PM Integration | ClickUp project management adapter | PMAdapter (pm-adapter.js), clickup-helpers | pm-adapter-factory | No |
| 2 | `integrations/pm-adapters/github-adapter.js` | PM Integration | GitHub Projects v2 adapter (GraphQL) | PMAdapter, `child_process` (gh CLI) | pm-adapter-factory | No |
| 3 | `integrations/pm-adapters/jira-adapter.js` | PM Integration | Jira REST API v3 adapter | PMAdapter, `https`, `yaml` | pm-adapter-factory | No |
| 4 | `integrations/pm-adapters/local-adapter.js` | PM Integration | Standalone local adapter (no external PM) | PMAdapter, `yaml` | pm-adapter-factory (default) | No |
| 5 | `integrations/pm-adapters/README.md` | Documentation | PM adapters documentation and usage guide | -- | Developer reference | No |

---

## 3. Infrastructure Tools

Total: 15 files (4 CLI + 1 local + 9 MCP + 1 README)

### 3.1 CLI Tools

| # | File | Category | Purpose | Consumers | Orphan? |
|---|------|----------|---------|-----------|---------|
| 1 | `tools/cli/github-cli.yaml` | CLI Tool | GitHub CLI (`gh`) integration definition | tool-resolver, agent devops | No |
| 2 | `tools/cli/llm-routing.yaml` | CLI Tool | LLM routing tool definition | tool-resolver, install-llm-routing | No |
| 3 | `tools/cli/railway-cli.yaml` | CLI Tool | Railway deployment CLI definition | tool-resolver | No |
| 4 | `tools/cli/supabase-cli.yaml` | CLI Tool | Supabase CLI integration definition | tool-resolver | No |

### 3.2 Local Tools

| # | File | Category | Purpose | Consumers | Orphan? |
|---|------|----------|---------|-----------|---------|
| 1 | `tools/local/ffmpeg.yaml` | Local Tool | FFmpeg multimedia framework definition | tool-resolver | No |

### 3.3 MCP Tool Definitions

| # | File | Category | Purpose | Consumers | Orphan? |
|---|------|----------|---------|-----------|---------|
| 1 | `tools/mcp/21st-dev-magic.yaml` | MCP | UI component generation MCP definition | tool-resolver | No |
| 2 | `tools/mcp/browser.yaml` | MCP | Browser automation MCP definition | tool-resolver | No |
| 3 | `tools/mcp/clickup.yaml` | MCP | ClickUp MCP integration definition | tool-resolver | No |
| 4 | `tools/mcp/context7.yaml` | MCP | Documentation search MCP definition | tool-resolver | No |
| 5 | `tools/mcp/desktop-commander.yaml` | MCP | Desktop commander MCP definition | tool-resolver | No |
| 6 | `tools/mcp/exa.yaml` | MCP | Advanced web research MCP definition | tool-resolver | No |
| 7 | `tools/mcp/google-workspace.yaml` | MCP | Google Workspace APIs MCP definition | tool-resolver | No |
| 8 | `tools/mcp/n8n.yaml` | MCP | n8n workflow automation MCP definition | tool-resolver | No |
| 9 | `tools/mcp/supabase.yaml` | MCP | Supabase backend MCP definition | tool-resolver | No |

### 3.4 Documentation

| # | File | Category | Purpose | Orphan? |
|---|------|----------|---------|---------|
| 1 | `tools/README.md` | Documentation | Tools directory documentation and usage guide | No |

---

## 4. Infrastructure Templates

Total: 15 files across 4 subdirectories

### 4.1 GitHub Workflow Templates

| # | File | Category | Purpose | Orphan? |
|---|------|----------|---------|---------|
| 1 | `templates/github-workflows/ci.yml.template` | CI/CD | CI workflow template | No |
| 2 | `templates/github-workflows/pr-automation.yml.template` | CI/CD | PR automation workflow template | No |
| 3 | `templates/github-workflows/release.yml.template` | CI/CD | Release workflow template | No |
| 4 | `templates/github-workflows/README.md` | Documentation | Workflow templates documentation | No |

### 4.2 Gitignore Templates

| # | File | Category | Purpose | Orphan? |
|---|------|----------|---------|---------|
| 1 | `templates/gitignore/gitignore-aios-base.tmpl` | Gitignore | Base AIOS gitignore template | No |
| 2 | `templates/gitignore/gitignore-brownfield-merge.tmpl` | Gitignore | Brownfield merge gitignore template | No |
| 3 | `templates/gitignore/gitignore-node.tmpl` | Gitignore | Node.js gitignore template | No |
| 4 | `templates/gitignore/gitignore-python.tmpl` | Gitignore | Python gitignore template | No |

### 4.3 Project Documentation Templates

| # | File | Category | Purpose | Orphan? |
|---|------|----------|---------|---------|
| 1 | `templates/project-docs/coding-standards-tmpl.md` | Project Docs | Coding standards template | No |
| 2 | `templates/project-docs/source-tree-tmpl.md` | Project Docs | Source tree documentation template | No |
| 3 | `templates/project-docs/tech-stack-tmpl.md` | Project Docs | Tech stack documentation template | No |

### 4.4 Core Config Templates

| # | File | Category | Purpose | Orphan? |
|---|------|----------|---------|---------|
| 1 | `templates/core-config/core-config-brownfield.tmpl.yaml` | Config | Brownfield project core config template | No |
| 2 | `templates/core-config/core-config-greenfield.tmpl.yaml` | Config | Greenfield project core config template | No |

### 4.5 Other Templates

| # | File | Category | Purpose | Orphan? |
|---|------|----------|---------|---------|
| 1 | `templates/coderabbit.yaml.template` | Code Review | CodeRabbit configuration template | No |
| 2 | `templates/aios-sync.yaml.template` | IDE Sync | AIOS sync configuration template | No |

---

## 5. Infrastructure Tests

Total: 5 files

| # | File | Category | Purpose | Orphan? |
|---|------|----------|---------|---------|
| 1 | `tests/project-status-loader.test.js` | Unit Test | Tests for project-status-loader | No |
| 2 | `tests/worktree-manager.test.js` | Unit Test | Tests for worktree-manager | No |
| 3 | `tests/validate-module.js` | Unit Test | Validates infrastructure module exports | No |
| 4 | `tests/utilities-audit-results.json` | Test Data | Audit results for infrastructure utilities | No |
| 5 | `tests/regression-suite-v2.md` | Documentation | Regression test suite documentation | No |

---

## 6. Infrastructure Root Files

| # | File | Category | Purpose | Orphan? |
|---|------|----------|---------|---------|
| 1 | `index.js` | Module Entry | Central exports for all infrastructure scripts | No |
| 2 | `README.md` | Documentation | Infrastructure module documentation | No |

---

## 7. Category Breakdown

### By Functional Category

| Category | File Count | Description |
|----------|-----------|-------------|
| **Git Integration** | 5 | Git wrapper, config detector, branch manager, commit generator, diff generator |
| **PM Integration** | 9 | Base adapter, factory, 4 adapters, helpers, status mapper, ClickUp helpers |
| **Template/Generation** | 5 | Template engine, component generator, metadata, search, batch creator |
| **Validation** | 6 | AIOS validator, template validator, output pattern, spot check, agent validator, yaml validator |
| **Analysis** | 8 | Dependency (2), framework, capability, security, modification risk, asset inventory, path analyzer |
| **Testing** | 7 | Test generator, coverage, utilities (2), quality assessment, sandbox, test discovery |
| **Performance** | 4 | Analyzer, optimizer, tracker, error resolver |
| **Quality** | 5 | Code quality improver, refactoring suggester, improvement engine/validator, modification validator |
| **Recovery (Epic 5)** | 4 | Approach manager, recovery tracker, rollback manager, stuck detector |
| **Execution (Epic 4)** | 2 | Plan tracker, subtask verifier |
| **QA (Epic 6)** | 2 | QA loop orchestrator, QA report generator |
| **Memory (Epic 7)** | 3 | Codebase mapper, gotchas documenter, pattern extractor |
| **Worktree** | 2 | Worktree manager, story-worktree hooks |
| **IDE Sync** | 8 | Main orchestrator, parser, validator, redirect generator, 4 transformers |
| **Documentation** | 3 | Changelog generator, documentation synchronizer, documentation integrity (7 sub-files) |
| **LLM Routing** | 12 | Installer, usage tracker proxy, 10 shell templates |
| **CI/CD** | 2 | CICD discovery, PR review AI |
| **Dashboard** | 1 | Dashboard status writer |
| **System** | 4 | Backup manager, transaction manager, repository detector, approval workflow |
| **Config** | 4 | Config cache, config loader, output formatter, yaml validator |
| **Tool Definitions** | 15 | 4 CLI + 1 local + 9 MCP + 1 README |
| **Templates** | 15 | GitHub workflows (4), gitignore (4), project docs (3), core config (2), others (2) |
| **Tests** | 5 | Unit tests, test data, docs |
| **Migration** | 1 | Agent migration script |
| **Utilities** | 4 | Conflict resolver, tool resolver, usage analytics, visual impact generator |

### By Epic/Story Ownership

| Epic/Story | Scripts | Purpose |
|-----------|---------|---------|
| Epic 2 (Migration) | asset-inventory, path-analyzer, migrate-agent | Framework discovery and migration |
| Epic 4 (Execution) | plan-tracker, subtask-verifier | Story execution management |
| Epic 5 (Recovery) | approach-manager, recovery-tracker, rollback-manager, stuck-detector | Resilience and recovery |
| Epic 6 (QA) | qa-loop-orchestrator, qa-report-generator | Quality assurance |
| Epic 7 (Memory) | codebase-mapper, gotchas-documenter, pattern-extractor | Knowledge management |
| Story 6.19 | ide-sync/* (8 files) | IDE command synchronization |
| Story 3.20 | PM adapters (4 files), pm-adapter, pm-adapter-factory | PM tool integration |
| Gap Analysis | cicd-discovery, test-discovery, pr-review-ai | Project analysis |

---

## 8. Orphan Analysis

### Confirmed Orphans (5 files)

These scripts are referenced ONLY in `install-manifest.yaml` (which is an inventory, not a consumer) and possibly their own file. They have no active callers in the runtime codebase.

| # | File | Reason | Recommendation |
|---|------|--------|----------------|
| 1 | `scripts/changelog-generator.js` | Only referenced in install-manifest | Archive or integrate into devops workflow |
| 2 | `scripts/dashboard-status-writer.js` | Only referenced in install-manifest + self | Archive or connect to dashboard integration |
| 3 | `scripts/cicd-discovery.js` | Only referenced in install-manifest | Archive or integrate into devops agent |
| 4 | `scripts/pr-review-ai.js` | Only referenced in install-manifest + self | Archive or integrate into devops workflow |
| 5 | `scripts/test-discovery.js` | Only referenced in install-manifest | Archive or integrate into QA agent |

### Likely Orphans (4 files)

These scripts are exported via `index.js` but have minimal external consumers (only config references, install-manifest, or migration inventory).

| # | File | Reason | Recommendation |
|---|------|--------|----------------|
| 1 | `scripts/spot-check-validator.js` | Only index.js + install-manifest references | Verify if needed; consider archive |
| 2 | `scripts/test-utilities-fast.js` | Only index.js + install-manifest + path-analysis | Verify if test-utilities supersedes it |
| 3 | `scripts/performance-and-error-resolver.js` | Only index.js + install-manifest references | Verify purpose; consider merging with performance-analyzer |
| 4 | `scripts/atomic-layer-classifier.js` | Only index.js + install-manifest references | Verify if design system feature is active |

### Not Orphaned but Low-Use (documentation-only references)

These scripts have references primarily in documentation and architecture docs, not active code consumers:

| # | File | Referencing Context |
|---|------|-------------------|
| 1 | `scripts/qa-report-generator.js` | Architecture docs only |
| 2 | `scripts/story-worktree-hooks.js` | Architecture docs + install-manifest |
| 3 | `scripts/rollback-manager.js` | Architecture docs + recovery-handler |

---

## 9. Summary Statistics

### File Counts

| Directory | Files | Subdirectories |
|-----------|-------|---------------|
| `scripts/` | 75 JS + 10 shell | 3 (ide-sync, llm-routing, documentation-integrity) |
| `integrations/` | 4 JS + 1 MD | 1 (pm-adapters) |
| `tools/` | 14 YAML + 1 MD | 3 (cli, local, mcp) |
| `templates/` | 15 files | 4 (github-workflows, gitignore, project-docs, core-config) |
| `tests/` | 5 files | 0 |
| Root | 2 files (index.js, README.md) | 0 |
| **Total** | **115 files** | **11 subdirectories** |

### Export Coverage

| Metric | Count |
|--------|-------|
| Scripts exported via index.js | 47 (unique named exports) |
| Scripts NOT exported | 28 (standalone/CLI scripts) |
| Sub-module scripts (ide-sync, doc-integrity, llm-routing) | 27 |
| Total JS scripts | 90 (including sub-modules) |

### Orphan Summary

| Status | Count | Percentage |
|--------|-------|------------|
| Confirmed orphans | 5 | 5.6% of scripts |
| Likely orphans | 4 | 4.4% of scripts |
| Active scripts | 81 | 90% of scripts |
| Integration files orphaned | 0 | 0% |
| Tool definitions orphaned | 0 | 0% |
| Templates orphaned | 0 | 0% |

### Dependency Direction

The infrastructure module is the **base layer** of the AIOS modular architecture:

```
infrastructure/ <-- core/ <-- development/ <-- product/
(base layer)     (imports)    (imports)        (imports)
```

- `infrastructure/` has **NO** dependencies on other AIOS modules
- `core/` imports from infrastructure (recovery-handler, build-state-manager, executors, config)
- `development/` imports from infrastructure (story-manager, greeting-builder, agent-config-loader)
- `product/` imports from infrastructure (templates, activation-instructions)

### Key Architectural Observations

1. **Clean layering**: Infrastructure correctly has zero upward dependencies
2. **Safe loading**: All exports use `safeRequire()` for graceful degradation
3. **Sub-module isolation**: ide-sync, llm-routing, and documentation-integrity are well-contained sub-modules
4. **PM Integration**: Well-designed adapter pattern with 4 implementations + factory
5. **Tool system**: 14 tool definitions consumed via centralized tool-resolver
6. **Gap Analysis scripts**: 3 scripts (cicd-discovery, pr-review-ai, test-discovery) appear to be prototypes that were never fully integrated
7. **Epic-aligned scripts**: Scripts from Epics 4-7 are well-referenced by their corresponding executors
8. **Template coverage**: Templates cover CI/CD, gitignore, project docs, and core config -- all actively consumed

---

*Generated as part of AIOS cross-reference analysis, Phase 4.*
