# Changelog

All notable changes to Synkra AIOS will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [4.2.11] - 2026-02-16

### Added

- Squad agent commands are now automatically installed to active IDEs during pro scaffolding (`installSquadCommands`).
- Supports Claude Code (`.claude/commands/{squad}/`), Codex CLI (`.codex/agents/`), Gemini CLI (`.gemini/rules/{squad}/`), and Cursor (`.cursor/rules/`).
- Installed files are tracked in `pro-installed-manifest.yaml` and `pro-version.json`.

## [4.2.10] - 2026-02-16

### Fixed

- Handle `ALREADY_ACTIVATED` license status gracefully instead of throwing error.
- Fix error envelope parsing in pro license client — correctly extracts error messages from API responses.

## [4.2.9] - 2026-02-16

### Fixed

- Pass `targetDir` correctly to `runProWizard` — fixes pro install failing in non-CWD projects.
- Surface pro install errors to user instead of silently swallowing them.

## [4.2.8] - 2026-02-16

### Fixed

- Exclude `mmos-squad` (private) from pro scaffolding via `SCAFFOLD_EXCLUDES`.
- Merge `pro-config.yaml` sections into `core-config.yaml` during pro install (`mergeProConfig`).

## [4.2.7] - 2026-02-16

### Fixed

- Pro wizard (`npx aios-core install`) now auto-installs `@aios-fullstack/pro` package during Step 2, fixing "Pro package not found" error in greenfield and brownfield projects.
- Greenfield projects without `package.json` now get `npm init -y` automatically before pro install.
- Removed unused `headings` import in `pro-setup.js`.

## [Unreleased]

### Added

- `docs/glossary.md` with official AIOS taxonomy terms:
  - `squad`
  - `flow-state`
  - `confidence gate`
  - `execution profile`
- `scripts/semantic-lint.js` for semantic terminology regression checks.
- `tests/unit/semantic-lint.test.js` for semantic lint rule validation.

### Changed

- CI now includes a `Semantic Lint` job (`npm run validate:semantic-lint`).
- Pre-commit markdown pipeline now runs semantic lint through `lint-staged`.

### Migration Notes

- Deprecated terminology replacements:
  - `expansion pack` -> `squad`
  - `permission mode` -> `execution profile`
  - `workflow state` -> `flow-state` (warning-level migration)

---

## [3.9.0] - 2025-12-26

### Highlights

This release introduces **Squad Continuous Improvement** capabilities with analyze and extend commands, plus a massive codebase cleanup removing 116K+ lines of deprecated content.

### Added

#### Story SQS-11: Squad Analyze & Extend
- **`*analyze-squad` command** - Analyze squad structure, coverage, and get improvement suggestions
- **`*extend-squad` command** - Add new components (agents, tasks, workflows, etc.) incrementally
- **New Scripts:**
  - `squad-analyzer.js` - Inventory and coverage analysis
  - `squad-extender.js` - Component creation with templates
- **8 Component Templates:**
  - `agent-template.md`, `task-template.md`, `workflow-template.yaml`
  - `checklist-template.md`, `template-template.md`
  - `tool-template.js`, `script-template.js`, `data-template.yaml`
- **New Tasks:**
  - `squad-creator-analyze.md`
  - `squad-creator-extend.md`

### Changed

#### Story TD-1: Tech Debt Cleanup
- Fixed ESLint warnings in 5 core files
- Removed 284 deprecated files (~116,978 lines deleted)
- Cleaned `.github/deprecated-docs/` directory
- Removed obsolete backup files

### Fixed
- ESLint `_error` variable warnings in test utilities
- Context loader error handling improvements

---

## [3.8.0] - 2025-12-26

*Previous release with WIS and SQS features.*

---

## [2.2.3] - 2025-12-22

### Highlights

This release marks the **Open-Source Community Readiness** milestone, preparing AIOS for public contribution while introducing the **Squad System** for extensibility.

### Added

#### Epic OSR: Open-Source Community Readiness (10 Stories)

- **Legal Foundation** (OSR-3)
  - `PRIVACY.md` / `PRIVACY-PT.md` - Privacy policies (EN/PT)
  - `TERMS.md` / `TERMS-PT.md` - Terms of use (EN/PT)
  - `CODE_OF_CONDUCT.md` - Community guidelines with contact info

- **Community Process** (OSR-6)
  - Feature request templates and triage process
  - Issue labeling standards

- **Public Roadmap** (OSR-7)
  - Public roadmap documentation
  - Community visibility into planned features

- **Squads Guide** (OSR-8)
  - Comprehensive guide for creating community squads
  - Examples and best practices

- **Rebranding to Synkra** (OSR-9)
  - Brand investigation complete
  - Namespace updated to SynkraAI

- **Release Checklist** (OSR-10)
  - GitHub configuration validated
  - CodeQL security scanning active (30+ alerts addressed)
  - Branch protection rules configured
  - Smoke test passed on clean clone

#### Epic SQS: Squad System Enhancement (Sprint 7)

- **Squad Designer Agent** (SQS-9)
  - New `@squad-creator` agent for guided squad creation
  - Interactive wizard with `*create-squad` command
  - AI-powered naming and structure suggestions

- **Squad Loader Utility** (SQS-2)
  - Local squad resolution from `./squads/` directory
  - Simplified loading without complex caching

- **Squad Validator + Schema** (SQS-3)
  - JSON Schema for squad manifest validation
  - `*validate-squad` command for compliance checking

- **Squad Creator Tasks** (SQS-4)
  - `*create-squad` - Interactive squad creation
  - `*validate-squad` - Manifest validation
  - `*list-squads` - Local squad discovery

#### Infrastructure & Documentation

- **Documentation Integrity System** (6.9)
  - Automated cross-reference validation
  - Link checking in CI pipeline

- **MCP Governance Consolidation** (6.14)
  - Unified MCP configuration rules
  - `.claude/rules/mcp-usage.md` guidance

- **Agent Config Path Fix** (6.15)
  - Resolved path resolution issues across platforms

- **Scripts Path Consolidation** (6.16)
  - Standardized script locations under `.aios-core/scripts/`

- **Semantic Release Automation** (6.17)
  - Automated versioning on merge to main
  - Conventional commit parsing
  - Automatic CHANGELOG generation

- **Agent Command Rationalization** (Story 6.1.2.3)
  - Command consolidation: `aios-master` 44→30 commands (32% reduction)
  - Command consolidation: `data-engineer` 31→28 commands (9.7% reduction)
  - New consolidated tasks: `security-audit`, `analyze-performance`, `test-as-user`, `setup-database`
  - Migration guide: `docs/guides/command-migration-guide.md`
  - Agent selection guide: `docs/guides/agent-selection-guide.md`

- **Dynamic Project Status Context** (Story 6.1.2.4)
  - Git branch, modified files, and recent commits shown in agent greetings
  - Current story and epic detection from `docs/stories/`
  - 60-second cache mechanism (<100ms first load, <10ms cached)
  - Cross-platform support (Windows/Linux/macOS)

### Changed

- **Agent Delegation Guidance** - All agents now include "NOT for" sections in `whenToUse`
- **PR Title Format** - DevOps `*create-pr` now generates Conventional Commits format titles
- **Scripts Location** - Consolidated under `.aios-core/scripts/` for consistency
- **MCP Configuration** - Unified rules in `.claude/rules/mcp-usage.md`

### Fixed

- **Agent Config Paths** (6.15) - Resolved path resolution issues on Windows
- **Script References** (6.16) - Fixed broken script imports across agents

### Security

- **CodeQL Scanning** - Active with 30+ alerts reviewed
- **Branch Protection** - Enabled on main (1 approver, dismiss stale reviews)

### Documentation

- **Squads Guide** - Complete guide for community squad creation
- **Feature Process** - Templates and triage workflow documented
- **Public Roadmap** - Community visibility into planned features
- **Legal Documents** - Privacy policy, Terms of Use (EN/PT)

---

## [4.32.0] - 2025-11-12

### Removed
- **Private squads** - Moved to separate private repository (`aios-squads`)
  - Removed `squads/creator/` (CreatorOS)
  - Removed `squads/innerlens/`
  - Removed `squads/mmos-mapper/`
  - Removed `squads/aios-infrastructure-devops/`
  - Removed `squads/meeting-notes/`
  - Repository: https://github.com/SynkraAI/aios-squads (PRIVATE)
- **Internal development tools** - Moved to separate private repository (`aios-dev-tools`)
  - Removed analysis scripts: `analyze-batches.js`, `analyze-decision-patterns.js`, `analyze-epic3.js`, etc.
  - Removed consolidation scripts: `consolidate-entities.js`, `consolidate-results.js`, etc.
  - Removed extraction scripts: `extract-all-claude-backups.js`, `extract-claude-history.js`
  - Removed generation scripts: `generate-entity-summary.js`, `generate-entity-table.js`
  - Repository: https://github.com/SynkraAI/aios-dev-tools (PRIVATE)
- **hybrid-ops squad** - Moved to separate repository for independent maintenance
  - Removed `squads/hybrid-ops/` directory
  - Removed `.hybrid-ops/` directory
  - Updated `core-config.yaml` to reference external repository
  - Updated `install-manifest.yaml` (removed 47 file entries)
  - Repository: https://github.com/SynkraAI/aios-hybrid-ops-pedro-valerio

### Changed
- README.md - hybrid-ops now listed under "Squads Externos"
- Squad can now be installed independently via GitHub
- **Squad naming convention** - Applied consistent `{agent-id}-` prefix to agent-specific tasks across all 6 squads
  - ETL pack: 4 tasks renamed (youtube-specialist, social-specialist, web-specialist)
  - Creator pack: 4 tasks already renamed (pre-existing migration)
  - Innerlens pack: 4 tasks renamed (fragment-extractor, psychologist, quality-assurance)
  - Mmos-mapper pack: 7 tasks renamed (cognitive-analyst, research-specialist, system-prompt-architect, emulator, mind-pm)
  - Aios-infrastructure-devops pack: 2 tasks already renamed (pre-existing)
  - Meeting-notes pack: 1 task already renamed (pre-existing)
  - All agent dependencies updated to reference new task names
  - Shared tasks correctly have NO prefix (conservative approach)

### Technical
- Story: 4.6 - Move Hybrid-Ops to Separate Repository
- Breaking Change: hybrid-ops no longer bundled with aios-core
- Migration: Users can install from external repo to `squads/hybrid-ops/`
- Story: 4.7 - Removed `squads/hybrid-ops.legacy/` directory (legacy backup no longer needed)
- Story: 4.5.3 - Squads Naming Convention Migration
  - Applied naming convention from Story 4.5.2 to all 6 squads
  - Total: 15 tasks renamed (11 new + 4 pre-existing)
  - 18 agent files updated with new dependencies
  - Validation: 100% compliance, 0 broken references

## [4.31.1] - 2025-10-22

### Added
- NPX temporary directory detection with defense-in-depth architecture
- PRIMARY detection layer in `tools/aios-npx-wrapper.js` using `__dirname`
- SECONDARY fallback detection in `tools/installer/bin/aios.js` using `process.cwd()`
- User-friendly help message with chalk styling when NPX temp directory detected
- Regex patterns to identify macOS NPX temporary paths (`/private/var/folders/.*/npx-/`, `/.npm/_npx/`)
- JSDoc documentation for NPX detection functions

### Fixed
- NPX installation from temporary directory no longer attempts IDE detection
- Clear error message guides users to correct installation directory
- Prevents confusion when running `npx aios-core install` from home directory

### Changed
- Early exit with `process.exit(1)` when NPX temporary context detected
- Help message provides actionable solution: `cd /path/to/your/project && npx aios-core install`

### Technical
- Story: 2.3 - NPX Installation Context Detection & Help Text (macOS)
- Defense in depth: Two independent detection layers provide redundancy
- macOS-specific implementation (other platforms unaffected)
- Non-breaking change (patch version)

## [4.31.0] - Previous Release

*(Previous changelog entries to be added)*
