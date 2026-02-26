# Changelog

> 🌐 **EN** | [PT](./pt/CHANGELOG.md) | [ES](./es/CHANGELOG.md)

---

All notable changes to Synkra AIOS will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.2.0] - 2026-01-29

### Added

- **🤖 AIOS Autonomous Development Engine (ADE)**: Complete autonomous development system with 7 Epics:
  - **Epic 1 - Worktree Manager**: Git worktree isolation for parallel story development
  - **Epic 2 - Migration V2→V3**: autoClaude V3 format with capability flags
  - **Epic 3 - Spec Pipeline**: Transform requirements into executable specifications
  - **Epic 4 - Execution Engine**: 13-step subtask execution with mandatory self-critique
  - **Epic 5 - Recovery System**: Automatic failure recovery with attempt tracking and rollback
  - **Epic 6 - QA Evolution**: 10-phase structured review process
  - **Epic 7 - Memory Layer**: Persistent memory for patterns, insights, and gotchas

- **New Agent Commands**:
  - `@devops`: `*create-worktree`, `*list-worktrees`, `*merge-worktree`, `*cleanup-worktrees`, `*inventory-assets`, `*analyze-paths`, `*migrate-agent`, `*migrate-batch`
  - `@pm`: `*gather-requirements`, `*write-spec`
  - `@architect`: `*assess-complexity`, `*create-plan`, `*create-context`, `*map-codebase`
  - `@analyst`: `*research-deps`, `*extract-patterns`
  - `@qa`: `*critique-spec`, `*review-build`, `*request-fix`, `*verify-fix`
  - `@dev`: `*execute-subtask`, `*track-attempt`, `*rollback`, `*capture-insights`, `*list-gotchas`, `*apply-qa-fix`

- **New Scripts**:
  - `worktree-manager.js`, `story-worktree-hooks.js`, `project-status-loader.js`
  - `asset-inventory.js`, `path-analyzer.js`, `migrate-agent.js`
  - `subtask-verifier.js`, `plan-tracker.js`
  - `recovery-tracker.js`, `approach-manager.js`, `rollback-manager.js`, `stuck-detector.js`
  - `qa-loop-orchestrator.js`, `qa-report-generator.js`
  - `codebase-mapper.js`, `pattern-extractor.js`, `gotchas-documenter.js`

- **New Workflows**:
  - `auto-worktree.yaml` - Automatic worktree creation for stories
  - `spec-pipeline.yaml` - 5-phase specification pipeline
  - `qa-loop.yaml` - QA review and fix loop

- **New Tasks** (15+ new tasks for ADE):
  - Spec Pipeline: `spec-gather-requirements.md`, `spec-assess-complexity.md`, `spec-research-dependencies.md`, `spec-write-spec.md`, `spec-critique.md`
  - Execution: `plan-create-implementation.md`, `plan-create-context.md`, `plan-execute-subtask.md`
  - QA: `qa-review-build.md`, `qa-fix-issues.md`, `qa-structured-review.md`
  - Memory: `capture-session-insights.md`
  - Worktree: `worktree-create.md`, `worktree-list.md`, `worktree-merge.md`

- **JSON Schemas**:
  - `agent-v3-schema.json` - V3 agent definition validation
  - `task-v3-schema.json` - V3 task definition validation

- **Templates**:
  - `spec-tmpl.md` - Specification document template
  - `qa-report-tmpl.yaml` - QA report template

- **Checklists**:
  - `self-critique-checklist.md` - Mandatory self-critique for developers

- **Documentation**:
  - [ADE Complete Guide](guides/ade-guide.md) - Full tutorial
  - [Epic 1-7 Handoffs](architecture/) - Technical handoffs (ADE-EPIC-1 through ADE-EPIC-7)
  - [Agent Changes](architecture/ADE-AGENT-CHANGES.md) - All agent modifications with capability matrix

### Changed

- **Agent Format**: All 12 agents migrated to autoClaude V3 format with capability flags
- **Agent Sync**: All agents now synced between `.aios-core/development/agents/` and `.claude/commands/AIOS/agents/`

### Fixed

- Agent command registration for all ADE Epics
- Schema validation for V3 format

---

## [2.1.0] - 2025-01-24

### Added

- **Interactive Installation Wizard**: Step-by-step guided setup with component selection
- **Multi-IDE Support**: Added support for 4 IDEs (Claude Code, Cursor, Gemini CLI, GitHub Copilot)
- **Squads System**: Modular add-ons including HybridOps for ClickUp integration
- **Cross-Platform Testing**: Full test coverage for Windows, macOS, and Linux
- **Error Handling & Rollback**: Automatic rollback on installation failure with recovery suggestions
- **Agent Improvements**:
  - Decision logging in yolo mode for `dev` agent
  - Backlog management commands for `qa` agent
  - CodeRabbit integration for automated code review
  - Contextual greetings with project status
- **Documentation Suite**:
  - Troubleshooting Guide with 23 documented issues
  - FAQ with 22 Q&As
  - Migration Guide v2.0 to v4.0.4

### Changed

- **Directory Structure**: Renamed `.legacy-core/` to `.aios-core/`
- **Configuration Format**: Enhanced `core-config.yaml` with new sections for git, projectStatus, and sharding options
- **Agent Format**: Updated agent YAML schema with persona_profile, commands visibility, and whenToUse fields
- **IDE Configuration**: Claude Code agents moved to `.claude/commands/AIOS/agents/`
- **File Locations**:
  - `docs/architecture/coding-standards.md` → `docs/framework/coding-standards.md`
  - `docs/architecture/tech-stack.md` → `docs/framework/tech-stack.md`
  - `.aios-core/utils/` → `.aios-core/scripts/`

### Fixed

- Installation failures on Windows with long paths
- PowerShell execution policy blocking scripts
- npm permission issues on Linux/macOS
- IDE configuration not applying after installation

### Deprecated

- Manual installation process (use `npx aios-core install` instead)
- `.legacy-core/` directory name (automatically migrated)

### Security

- Added validation for installation directory to prevent system directory modifications
- Improved handling of environment variables and API keys

---

## [2.0.0] - 2024-12-01

### Added

- Initial public release of Synkra AIOS
- 11 specialized AI agents (dev, qa, architect, pm, po, sm, analyst, ux-expert, data-engineer, devops, db-sage)
- Task workflow system with 60+ pre-built tasks
- Template system with 20+ document templates
- Story-driven development methodology
- Basic Claude Code integration

### Known Issues

- Manual installation required (2-4 hours)
- Limited cross-platform support
- No interactive wizard

---

## [1.0.0] - 2024-10-15

### Added

- Initial internal release
- Core agent framework
- Basic task execution

---

## Migration Notes

### Upgrading from 2.0.x to 2.1.x

**Quick upgrade:**

```bash
npx aios-core install --force-upgrade
```

**Key changes:**

1. Directory renamed: `.legacy-core/` → `.aios-core/`
2. Update `core-config.yaml` with new fields
3. Re-run IDE configuration

---

## Links

- [Troubleshooting](./installation/troubleshooting.md)
- [FAQ](./installation/faq.md)
- [GitHub Repository](https://github.com/SynkraAI/aios-core)
- [Issue Tracker](https://github.com/SynkraAI/aios-core/issues)
