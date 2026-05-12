# AIOX Source Tree Structure

> 🌐 **EN** | [PT](../pt/framework/source-tree.md) | [ES](../es/framework/source-tree.md)

**Version:** 4.0.0
**Last Updated:** 2026-02-11
**Status:** Official Framework Standard
**Repository:** SynkraAI/aiox-core

---

## 📋 Table of Contents

- [Overview](#overview)
- [Modular Architecture](#modular-architecture)
- [Framework Core (.aiox-core/)](#framework-core-aiox-core)
- [Module Details](#module-details)
- [Documentation (docs/)](#documentation-docs)
- [Squads System](#squads-system)
- [Autonomous Development Engine (ADE)](#autonomous-development-engine-ade)
- [File Naming Conventions](#file-naming-conventions)
- [Where to Put New Files](#where-to-put-new-files)

---

## Overview

AIOX uses a **modular architecture** with clear separation of concerns:

1. **Framework Core** (`.aiox-core/`) - Portable framework components organized by domain
2. **Project Workspace** (root) - Project-specific implementation

**Philosophy:**

- **Domain-driven organization** - Components grouped by function
- **Portability** - Framework components work across projects
- **Separation of concerns** - Clear boundaries between modules

---

## Modular Architecture

```
aiox-core/                             # Root project
├── .aiox-core/                        # Framework core (modular)
│   ├── cli/                           # CLI commands and utilities
│   ├── core/                          # Framework essentials
│   ├── data/                          # Shared data files
│   ├── development/                   # Development assets (agents, tasks, workflows)
│   ├── docs/                          # Internal framework docs
│   ├── elicitation/                   # Elicitation engines
│   ├── infrastructure/                # Infrastructure tools and scripts
│   ├── manifests/                     # Installation manifests
│   ├── product/                       # PM/PO assets (templates, checklists)
│   ├── quality/                       # Quality gate schemas
│   ├── scripts/                       # Utility scripts
│   └── core-config.yaml               # Framework configuration
│
├── docs/                              # Public documentation
│   ├── architecture/                  # Architecture docs
│   ├── framework/                     # Official framework standards
│   ├── guides/                        # How-to guides
│   ├── installation/                  # Installation guides
│   └── community/                     # Community docs
│
├── templates/                         # Project templates
│   └── squad/                         # Squad template (see docs/guides/squads-guide.md)
│
├── bin/                               # CLI executables
│   └── aiox.js                        # Main CLI entry point
│
├── tools/                             # Build and utility tools
│   ├── cli.js                         # CLI builder
│   └── installer/                     # Installation scripts
│
├── tests/                             # Test suites
│   ├── unit/                          # Unit tests
│   ├── integration/                   # Integration tests
│   └── e2e/                           # End-to-end tests
│
├── .claude/                           # Claude Code configuration
│   ├── CLAUDE.md                      # Project instructions
│   ├── commands/                      # Agent slash commands
│   └── rules/                         # IDE rules
│
├── index.js                           # Main entry point
├── package.json                       # Package manifest
└── README.md                          # Project README
```

---

## Framework Core (.aiox-core/)

**Purpose:** Portable framework components organized by domain for clear separation of concerns.

### Directory Structure (v2.0 Modular)

```
.aiox-core/
├── cli/                               # CLI System
│   ├── commands/                      # CLI command implementations
│   │   ├── generate/                  # Code generation commands
│   │   ├── manifest/                  # Manifest management
│   │   ├── mcp/                       # MCP tool commands
│   │   ├── metrics/                   # Quality metrics
│   │   ├── migrate/                   # Migration tools
│   │   ├── qa/                        # QA commands
│   │   └── workers/                   # Background workers
│   └── utils/                         # CLI utilities
│
├── core/                              # Framework Essentials
│   ├── config/                        # Configuration system
│   ├── data/                          # Core knowledge base
│   ├── docs/                          # Core documentation
│   ├── elicitation/                   # Interactive prompting engine
│   ├── manifest/                      # Manifest processing
│   ├── mcp/                           # MCP orchestration
│   ├── migration/                     # Migration utilities
│   ├── quality-gates/                 # Quality gate validators
│   ├── registry/                      # Service registry
│   ├── session/                       # Runtime state management
│   └── utils/                         # Core utilities
│
├── data/                              # Shared Data
│   ├── aiox-kb.md                     # AIOX knowledge base (@aiox-master, lazy-loaded)
│   ├── agent-config-requirements.yaml # Per-agent config loading rules (@architect, updated on agent changes)
│   ├── technical-preferences.md       # User/team technical preferences (@architect, updated on preference changes)
│   └── workflow-patterns.yaml         # Workflow detection patterns (@sm, updated on workflow changes)
│
├── development/                       # Development Assets
│   ├── agents/                        # Agent definitions (11 core agents)
│   │   ├── aiox-master.md             # Master orchestrator
│   │   ├── dev.md                     # Developer agent
│   │   ├── qa.md                      # QA engineer agent
│   │   ├── architect.md               # System architect agent
│   │   ├── po.md                      # Product Owner agent
│   │   ├── pm.md                      # Product Manager agent
│   │   ├── sm.md                      # Scrum Master agent
│   │   ├── analyst.md                 # Business Analyst agent
│   │   ├── ux-design-expert.md        # UX Designer agent
│   │   ├── data-engineer.md           # Data Engineer agent
│   │   └── devops.md                  # DevOps agent
│   ├── agent-teams/                   # Agent team configurations
│   ├── tasks/                         # Task workflows (60+ tasks)
│   ├── workflows/                     # Multi-step workflows
│   └── scripts/                       # Development scripts
│
├── docs/                              # Internal Documentation
│   └── standards/                     # Framework standards
│
├── elicitation/                       # Elicitation Engines
│   ├── agent-elicitation.js           # Agent creation elicitation
│   ├── task-elicitation.js            # Task creation elicitation
│   └── workflow-elicitation.js        # Workflow creation elicitation
│
├── infrastructure/                    # Infrastructure
│   ├── integrations/                  # External integrations
│   │   └── pm-adapters/               # PM tool adapters (ClickUp, GitHub, Jira)
│   ├── scripts/                       # Infrastructure scripts
│   │   ├── documentation-integrity/   # Doc integrity system
│   │   └── llm-routing/               # LLM routing utilities
│   ├── templates/                     # Infrastructure templates
│   │   ├── core-config/               # Config templates
│   │   ├── github-workflows/          # CI/CD templates
│   │   ├── gitignore/                 # Gitignore templates
│   │   └── project-docs/              # Project documentation templates
│   ├── tests/                         # Infrastructure tests
│   └── tools/                         # Tool integrations
│       ├── cli/                       # CLI tool wrappers
│       ├── local/                     # Local tools
│       └── mcp/                       # MCP server configs
│
├── manifests/                         # Installation Manifests
│   └── schema/                        # Manifest schemas
│
├── product/                           # PM/PO Assets
│   ├── checklists/                    # Validation checklists
│   │   ├── po-master-checklist.md     # PO validation
│   │   ├── story-draft-checklist.md   # Story draft validation
│   │   ├── architect-checklist.md     # Architecture review
│   │   └── change-checklist.md        # Change management
│   ├── data/                          # PM-specific data files
│   │   ├── brainstorming-techniques.md    # Brainstorming methods (@analyst, reference doc, rarely updated)
│   │   ├── elicitation-methods.md         # Elicitation techniques (@po, reference doc, rarely updated)
│   │   ├── mode-selection-best-practices.md # Mode selection guide (@sm, updated on workflow changes)
│   │   ├── test-levels-framework.md       # Test level definitions (@qa, updated when test strategy changes)
│   │   └── test-priorities-matrix.md      # Test priority rules (@qa, updated when priorities shift)
│   └── templates/                     # Document templates
│       ├── engine/                    # Template engine
│       ├── ide-rules/                 # IDE rule templates
│       ├── story-tmpl.yaml            # Story template
│       ├── prd-tmpl.yaml              # PRD template
│       └── epic-tmpl.md               # Epic template
│
├── quality/                           # Quality System
│   └── schemas/                       # Quality gate schemas
│
├── scripts/                           # Root Scripts
│   └── ...                            # Utility scripts
│
├── core-config.yaml                   # Framework configuration
├── install-manifest.yaml              # Installation manifest
├── user-guide.md                      # User guide
└── working-in-the-brownfield.md       # Brownfield guide
```

### File Patterns

```yaml
Agents:
  Location: .aiox-core/development/agents/
  Format: Markdown with YAML frontmatter
  Naming: {agent-name}.md (kebab-case)
  Example: dev.md, qa.md, architect.md

Tasks:
  Location: .aiox-core/development/tasks/
  Format: Markdown workflow
  Naming: {task-name}.md (kebab-case)
  Example: create-next-story.md, develop-story.md

Templates:
  Location: .aiox-core/product/templates/
  Format: YAML or Markdown
  Naming: {template-name}-tmpl.{yaml|md}
  Example: story-tmpl.yaml, prd-tmpl.md

Workflows:
  Location: .aiox-core/development/workflows/
  Format: YAML
  Naming: {workflow-type}-{scope}.yaml
  Example: greenfield-fullstack.yaml, brownfield-service.yaml

Checklists:
  Location: .aiox-core/product/checklists/
  Format: Markdown
  Naming: {checklist-name}-checklist.md
  Example: story-draft-checklist.md, architect-checklist.md

Core Utilities:
  Location: .aiox-core/core/utils/
  Format: JavaScript (CommonJS)
  Naming: {utility-name}.js (kebab-case)
  Example: component-generator.js, story-manager.js

CLI Commands:
  Location: .aiox-core/cli/commands/{category}/
  Format: JavaScript (CommonJS)
  Naming: {command-name}.js (kebab-case)
  Example: generate/agent.js, manifest/install.js

Infrastructure Scripts:
  Location: .aiox-core/infrastructure/scripts/{category}/
  Format: JavaScript
  Naming: {script-name}.js (kebab-case)
  Example: documentation-integrity/link-verifier.js
```

---

## Data File Governance

All data files used by agents during activation must have documented ownership, fill rules, and update triggers.

### Framework Data Files (docs/framework/)

| File | Owner | Fill Rule | Update Trigger | Used By |
|------|-------|-----------|----------------|---------|
| `coding-standards.md` | @dev | Updated when coding standards change | `*update-standards` task or manual edit | @dev, @pm, @ux-design-expert, @sm |
| `tech-stack.md` | @architect | Updated on tech stack decisions | `*create-doc architecture` or manual edit | @dev, @pm, @ux-design-expert, @analyst |
| `source-tree.md` | @architect | Updated when structure changes | `*update-source-tree` task | @dev, @analyst |

### Shared Data Files (.aiox-core/data/)

| File | Owner | Fill Rule | Update Trigger | Used By |
|------|-------|-----------|----------------|---------|
| `aiox-kb.md` | @aiox-master | Updated on major framework changes | Manual edit | @aiox-master (lazy) |
| `agent-config-requirements.yaml` | @architect | Updated when agent config needs change | Story-driven | AgentConfigLoader |
| `technical-preferences.md` | @architect | Updated on preference changes | Manual edit or `*add-tech-doc` | @dev, @qa, @devops, @architect, @data-engineer |
| `workflow-patterns.yaml` | @sm | Updated on workflow changes | Manual edit | @sm, WorkflowNavigator |

### Product Data Files (.aiox-core/product/data/)

| File | Owner | Fill Rule | Update Trigger | Used By |
|------|-------|-----------|----------------|---------|
| `brainstorming-techniques.md` | @analyst | Reference doc, rarely updated | Manual edit | @analyst |
| `elicitation-methods.md` | @po | Reference doc, rarely updated | Manual edit | @po |
| `mode-selection-best-practices.md` | @sm | Updated on workflow changes | Manual edit | @sm |
| `test-levels-framework.md` | @qa | Updated when test strategy changes | `*update-test-strategy` or manual edit | @qa |
| `test-priorities-matrix.md` | @qa | Updated when priorities shift | `*update-test-strategy` or manual edit | @qa |

---

## Documentation (docs/)

### Current Organization

```
docs/
├── architecture/                      # ⚠️ Mixed: official + project-specific
│   ├── coding-standards.md            # ✅ Official (migrates to REPO 1)
│   ├── tech-stack.md                  # ✅ Official (migrates to REPO 1)
│   ├── source-tree.md                 # ✅ Official (migrates to REPO 1)
│   ├── decision-analysis-*.md         # Project-specific decisions
│   ├── architectural-review-*.md      # Project-specific reviews
│   └── mcp-*.md                       # Framework docs (migrates to REPO 1)
│
├── framework/                         # ⭐ NEW: Official framework docs (Q2 2026)
│   ├── coding-standards.md            # Framework coding standards
│   ├── tech-stack.md                  # Framework tech stack
│   ├── source-tree.md                 # Framework source tree
│   └── README.md                      # Migration notice
│
├── stories/                           # Development stories
│   ├── aiox migration/                # AIOX migration stories
│   │   ├── story-6.1.2.1.md
│   │   ├── story-6.1.2.2.md
│   │   ├── story-6.1.2.3.md
│   │   ├── story-6.1.2.4.md
│   │   └── story-6.1.2.5.md
│   └── ...                            # Other stories
│
├── epics/                             # Epic planning
│   ├── epic-6.1-agent-identity-system.md
│   └── ...                            # Other epics
│
├── decisions/                         # Architecture Decision Records
│   ├── decision-005-repository-restructuring-FINAL.md
│   └── ...                            # Other ADRs
│
├── guides/                            # How-to guides
│   ├── git-workflow-guide.md
│   ├── migration-guide.md
│   └── ...                            # Other guides
│
├── qa/                                # QA artifacts
│   └── backlog-archive/               # Archived QA items
│
├── prd/                               # Product Requirements Documents
│   └── ...                            # PRD files
│
├── planning/                          # Planning documents
│   └── ...                            # Sprint plans, roadmaps
│
├── standards/                         # Framework standards
│   └── AGENT-PERSONALIZATION-STANDARD-V1.md
│
└── STORY-BACKLOG.md                   # ⭐ Story backlog index
```

### Proposed Reorganization (Story 6.1.2.6)

```
docs/
├── framework/                         # ✅ Official framework docs
│   ├── coding-standards.md
│   ├── tech-stack.md
│   ├── source-tree.md
│   ├── agent-spec.md
│   ├── task-spec.md
│   └── workflow-spec.md
│
├── architecture/                      # Project-specific architecture
│   ├── project-decisions/             # ✅ ADRs for this project
│   │   ├── decision-005-repository-restructuring-FINAL.md
│   │   ├── architectural-review-contextual-agent-load.md
│   │   └── ...
│   └── diagrams/                      # Architecture diagrams
│
├── stories/                           # Development stories
│   ├── index.md                       # ⭐ Story index (auto-generated)
│   ├── backlog.md                     # ⭐ Story backlog (official)
│   └── ...                            # Story files
│
├── epics/
├── guides/
├── qa/
├── prd/
└── standards/
```

---

## Squads System

> **Note:** Squads replaced the legacy "Squads" system in OSR-8. See [Squads Guide](../guides/squads-guide.md) for complete documentation.

### Overview

Squads are modular extensions that add specialized capabilities to AIOX. Unlike the deprecated Squads, Squads follow a standardized template structure.

### Squad Template Location

```
templates/squad/                       # Squad template for creating extensions
├── squad.yaml                         # Squad manifest template
├── package.json                       # NPM package template
├── README.md                          # Documentation template
├── LICENSE                            # License template
├── .gitignore                         # Git ignore template
├── agents/                            # Squad-specific agents
│   └── example-agent.yaml
├── tasks/                             # Squad-specific tasks
│   └── example-task.yaml
├── workflows/                         # Squad-specific workflows
│   └── example-workflow.yaml
├── templates/                         # Squad-specific templates
│   └── example-template.md
└── tests/                             # Squad tests
    └── example-agent.test.js
```

### Creating a New Squad

```bash
# Future CLI (planned):
npx create-aiox-squad my-squad-name

# Current method:
cp -r templates/squad/ squads/my-squad-name/
# Then customize squad.yaml and components
```

### Squad Manifest Structure

```yaml
# squad.yaml
name: my-custom-squad
version: 1.0.0
description: Description of what this squad does
author: Your Name
license: MIT

# Components provided by this squad
agents:
  - custom-agent-1
  - custom-agent-2

tasks:
  - custom-task-1

workflows:
  - custom-workflow-1

# Dependencies
dependencies:
  aiox-core: '>=2.1.0'
```

### Migration from Squads

| Legacy (Deprecated)             | Current (Squads)                |
| ------------------------------- | ------------------------------- |
| `Squads/` directory             | `templates/squad/` template     |
| `legacyPacksLocation` config | `squadsTemplateLocation` config |
| `pack.yaml` manifest            | `squad.yaml` manifest           |
| Direct loading                  | Template-based creation         |

---

## Future Structure (Post-Migration Q2 2026)

**Decision 005 defines 5 separate repositories:**

### REPO 1: SynkraAI/aiox-core (MIT)

```
aiox-core/
├── .aiox-core/                        # Framework assets (modular v2.0)
│   ├── cli/                           # CLI commands and utilities
│   ├── core/                          # Framework essentials
│   │   ├── config/                    # Configuration system
│   │   ├── quality-gates/             # Quality validators
│   │   └── utils/                     # Core utilities
│   ├── development/                   # Development assets
│   │   ├── agents/                    # Agent definitions (11 core)
│   │   ├── tasks/                     # Task workflows (60+)
│   │   └── workflows/                 # Multi-step workflows
│   ├── infrastructure/                # Infrastructure tools
│   │   ├── integrations/              # PM adapters, tools
│   │   ├── scripts/                   # Automation scripts
│   │   └── templates/                 # Infrastructure templates
│   ├── product/                       # PM/PO assets
│   │   ├── checklists/                # Validation checklists
│   │   └── templates/                 # Document templates
│   └── ...
│
├── bin/                               # CLI entry points
│   └── aiox.js                        # Main CLI
│
├── tools/                             # Build and utility tools
│   ├── cli.js                         # CLI builder
│   └── installer/                     # Installation scripts
│
├── docs/                              # Framework documentation
│   ├── framework/                     # Official standards
│   ├── guides/                        # How-to guides
│   ├── installation/                  # Setup guides
│   └── architecture/                  # Architecture docs
│
├── templates/                         # Project templates
│   └── squad/                         # Squad template
│
├── tests/                             # Test suites
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
└── examples/                          # Example projects
    ├── basic-agent/
    ├── vibecoder-demo/
    └── multi-agent-workflow/
```

### REPO 2: SynkraAI/squads (MIT)

```
squads/
├── verified/                          # AIOX-curated squads
│   ├── github-devops/
│   ├── db-sage/
│   └── coderabbit-workflow/
│
├── community/                         # Community submissions
│   ├── marketing-agency/
│   ├── sales-automation/
│   └── ...
│
├── templates/                         # Squad templates
│   ├── minimal-squad/
│   └── agent-squad/
│
└── tools/                             # Squad development tools
    └── create-aiox-squad/
```

### REPO 3: SynkraAI/mcp-ecosystem (Apache 2.0)

```
mcp-ecosystem/
├── presets/                           # MCP presets (Docker MCP Toolkit)
│   ├── aiox-dev/
│   ├── aiox-research/
│   └── aiox-docker/
│
├── mcps/                              # Base MCP configs
│   ├── exa/
│   ├── context7/
│   └── desktop-commander/
│
└── ide-configs/                       # IDE integrations
    ├── claude-code/
    ├── gemini-cli/
    └── cursor/
```

### REPO 4: SynkraAI/certified-partners (Private)

```
certified-partners/
├── premium-packs/                     # Premium Squads
│   ├── enterprise-deployment/
│   └── advanced-devops/
│
├── partner-portal/                    # Partner Success Platform
│   ├── dashboard/
│   └── analytics/
│
└── marketplace/                       # Marketplace platform
    ├── api/
    └── web/
```

### REPO 5: SynkraAI/mmos (Private + NDA)

```
mmos/
├── minds/                             # 34 cognitive clones
│   ├── pedro-valerio/
│   ├── paul-graham/
│   └── ...
│
├── emulator/                          # MMOS emulation engine
│   ├── mirror-agent/
│   └── dna-mental/
│
└── research/                          # Research artifacts
    └── transcripts/
```

---

## File Naming Conventions

### General Rules

```yaml
Directories: kebab-case (lowercase, hyphen-separated)
  ✅ .aiox-core/
  ✅ Squads/
  ❌ .AIOX-Core/
  ❌ legacy-packs/

Files (Code): kebab-case with extension
  ✅ agent-executor.js
  ✅ task-runner.js
  ❌ AgentExecutor.js
  ❌ taskRunner.js

Files (Docs): kebab-case with .md extension
  ✅ coding-standards.md
  ✅ story-6.1.2.5.md
  ❌ CodingStandards.md
  ❌ Story_6_1_2_5.md

Files (Config): lowercase or kebab-case
  ✅ package.json
  ✅ tsconfig.json
  ✅ core-config.yaml
  ❌ PackageConfig.json
```

### Special Cases

```yaml
Stories:
  Format: story-{epic}.{story}.{substory}.md
  Example: story-6.1.2.5.md

Epics:
  Format: epic-{number}-{name}.md
  Example: epic-6.1-agent-identity-system.md

Decisions:
  Format: decision-{number}-{name}.md
  Example: decision-005-repository-restructuring-FINAL.md

Templates:
  Format: {name}-tmpl.{yaml|md}
  Example: story-tmpl.yaml, prd-tmpl.md

Checklists:
  Format: {name}-checklist.md
  Example: architect-checklist.md
```

---

## Where to Put New Files

### Decision Matrix

```yaml
# I'm creating a new agent:
Location: .aiox-core/development/agents/{agent-name}.md
Example: .aiox-core/development/agents/security-expert.md

# I'm creating a new task:
Location: .aiox-core/development/tasks/{task-name}.md
Example: .aiox-core/development/tasks/deploy-to-production.md

# I'm creating a new workflow:
Location: .aiox-core/development/workflows/{workflow-name}.yaml
Example: .aiox-core/development/workflows/continuous-deployment.yaml

# I'm creating a new template:
Location: .aiox-core/product/templates/{template-name}-tmpl.{yaml|md}
Example: .aiox-core/product/templates/deployment-plan-tmpl.yaml

# I'm creating a new checklist:
Location: .aiox-core/product/checklists/{checklist-name}-checklist.md
Example: .aiox-core/product/checklists/security-review-checklist.md

# I'm creating a CLI command:
Location: .aiox-core/cli/commands/{category}/{command-name}.js
Example: .aiox-core/cli/commands/generate/workflow.js

# I'm creating a core utility:
Location: .aiox-core/core/utils/{utility-name}.js
Example: .aiox-core/core/utils/performance-monitor.js

# I'm creating an infrastructure script:
Location: .aiox-core/infrastructure/scripts/{category}/{script-name}.js
Example: .aiox-core/infrastructure/scripts/llm-routing/router.js

# I'm adding a PM tool adapter:
Location: .aiox-core/infrastructure/integrations/pm-adapters/{adapter-name}.js
Example: .aiox-core/infrastructure/integrations/pm-adapters/monday-adapter.js

# I'm writing a story (internal dev docs - gitignored):
Location: docs/stories/{sprint-context}/{story-file}.md
Example: docs/stories/v4.0.4/sprint-6/story-6.14-new-feature.md

# I'm creating official framework documentation:
Location: docs/framework/{doc-name}.md
Example: docs/framework/agent-development-guide.md

# I'm creating a test:
Location: tests/{type}/{test-name}.test.js
Example: tests/unit/agent-executor.test.js

# I'm creating a squad:
Location: Copy templates/squad/ to your squads directory
Example: squads/devops-automation/ (customize from template)
```

---

## Special Directories

### .ai/ Directory (NEW - Story 6.1.2.6)

```
.ai/                                   # AI session artifacts
├── decision-log-6.1.2.5.md            # Yolo mode decision log
├── decision-log-6.1.2.6.md            # Another decision log
└── session-{date}-{agent}.md          # Session transcripts (optional)
```

**Purpose:** Track AI-driven decisions during development sessions (especially yolo mode)

**Auto-generated:** Yes (when yolo mode enabled)

### outputs/ Directory

```
outputs/                               # Runtime outputs (gitignored)
├── minds/                             # MMOS cognitive clones
│   └── pedro_valerio/
│       ├── system-prompt.md
│       ├── kb/
│       └── artifacts/
│
└── architecture-map/                  # Architecture analysis
    ├── MASTER-RELATIONSHIP-MAP.json
    └── schemas/
```

**Purpose:** Runtime artifacts not committed to git

---

## Autonomous Development Engine (ADE)

> **NEW in v3.0** - The ADE provides autonomous development capabilities through intelligent workflows, pattern learning, and self-healing loops.

### ADE Architecture Overview

```
.aiox-core/
├── workflow-intelligence/             # WIS - Pattern Learning System
│   ├── __tests__/                     # WIS test suite
│   ├── engine/                        # Core WIS engines
│   │   ├── confidence-scorer.js       # Pattern confidence scoring
│   │   ├── output-formatter.js        # Output formatting
│   │   ├── suggestion-engine.js       # Intelligent suggestions
│   │   └── wave-analyzer.js           # Wave pattern analysis
│   ├── learning/                      # Machine learning components
│   │   ├── capture-hook.js            # Pattern capture hooks
│   │   ├── index.js                   # Learning module entry
│   │   ├── pattern-capture.js         # Pattern capture engine
│   │   ├── pattern-store.js           # Pattern persistence
│   │   └── pattern-validator.js       # Pattern validation
│   ├── registry/                      # Workflow registry
│   │   └── workflow-registry.js       # Workflow registration
│   └── index.js                       # WIS entry point
│
├── infrastructure/scripts/            # ADE Infrastructure Scripts
│   ├── worktree-manager.js            # Git worktree isolation (Epic 1)
│   ├── project-status-loader.js       # Project status management (Epic 2)
│   ├── spec-pipeline-runner.js        # Spec pipeline automation (Epic 3)
│   ├── plan-tracker.js                # Plan progress tracking (Epic 4)
│   ├── subtask-verifier.js            # Subtask verification (Epic 4)
│   ├── approach-manager.js            # Approach management (Epic 5)
│   ├── stuck-detector.js              # Stuck detection logic (Epic 5)
│   ├── recovery-tracker.js            # Recovery tracking (Epic 5)
│   ├── rollback-manager.js            # Rollback management (Epic 5)
│   ├── qa-report-generator.js         # QA report generation (Epic 6)
│   ├── qa-loop-orchestrator.js        # QA loop automation (Epic 6)
│   ├── codebase-mapper.js             # Codebase mapping (Epic 7)
│   ├── pattern-extractor.js           # Pattern extraction (Epic 7)
│   └── gotchas-documenter.js          # Gotchas documentation (Epic 7)
│
├── development/workflows/             # ADE Workflows
│   ├── spec-pipeline.yaml             # Requirements → Spec workflow (Epic 3)
│   └── qa-loop.yaml                   # QA review → fix loop (Epic 6)
│
├── development/tasks/                 # ADE Tasks
│   ├── spec-assess-complexity.md      # Complexity assessment (Epic 3)
│   ├── spec-critique.md               # Specification critique (Epic 3)
│   ├── spec-gather-requirements.md    # Requirements gathering (Epic 3)
│   ├── spec-research-dependencies.md  # Dependency research (Epic 3)
│   ├── spec-write-spec.md             # Specification writing (Epic 3)
│   ├── plan-create-context.md         # Context generation (Epic 4)
│   ├── plan-create-implementation.md  # Implementation planning (Epic 4)
│   ├── plan-execute-subtask.md        # Subtask execution (Epic 4)
│   ├── verify-subtask.md              # Subtask verification (Epic 4)
│   ├── qa-review-build.md             # 10-phase QA review (Epic 6)
│   ├── qa-create-fix-request.md       # Fix request generation (Epic 6)
│   ├── qa-fix-issues.md               # Issue fixing workflow (Epic 6)
│   ├── capture-session-insights.md    # Session insights capture (Epic 7)
│   ├── extract-patterns.md            # Pattern extraction (Epic 7)
│   └── document-gotchas.md            # Gotchas documentation (Epic 7)
│
└── product/                           # ADE Templates & Checklists
    ├── templates/
    │   ├── qa-report-tmpl.md          # QA report template (Epic 6)
    │   └── current-approach-tmpl.md   # Current approach template (Epic 5)
    └── checklists/
        └── self-critique-checklist.md # Self-critique checklist (Epic 4)
```

### ADE Epics Summary

| Epic       | Name                    | Key Components                                                     |
| ---------- | ----------------------- | ------------------------------------------------------------------ |
| **Epic 1** | Story Branch Isolation  | `worktree-manager.js` - Git worktree management                    |
| **Epic 2** | Project Status System   | `project-status-loader.js` - YAML status tracking                  |
| **Epic 3** | Spec Pipeline           | `spec-pipeline.yaml` + 5 spec tasks                                |
| **Epic 4** | Implementation Planning | `plan-tracker.js`, `subtask-verifier.js`, context generators       |
| **Epic 5** | Self-Healing Loops      | `stuck-detector.js`, `recovery-tracker.js`, `rollback-manager.js`  |
| **Epic 6** | QA Evolution            | `qa-loop-orchestrator.js`, 10-phase review, fix request generation |
| **Epic 7** | Memory Layer            | `codebase-mapper.js`, `pattern-extractor.js`, session insights     |

### ADE Configuration

The ADE is configured via `.aiox-core/core-config.yaml`:

```yaml
ade:
  enabled: true
  worktrees:
    enabled: true
    baseDir: .worktrees
  specPipeline:
    enabled: true
    maxIterations: 3
  qaLoop:
    enabled: true
    maxIterations: 5
  memoryLayer:
    enabled: true
    patternStore: .aiox/patterns/
```

### ADE Runtime State

Runtime state is persisted in `.aiox/`:

```
.aiox/
├── project-status.yaml        # Current project status
├── status.json                # Runtime status
├── patterns/                  # Learned patterns (Epic 7)
│   ├── code-patterns.json
│   └── gotchas.json
├── worktrees/                 # Worktree state (Epic 1)
│   └── story-{id}.json
└── qa-loops/                  # QA loop state (Epic 6)
    └── {story-id}/
        ├── iteration-1.json
        └── qa-report.md
```

---

## Related Documents

- [Coding Standards](./coding-standards.md)
- [Tech Stack](./tech-stack.md)
- [ADE Architecture](../architecture/ade-architecture.md) _(planned)_

---

## Version History

| Version | Date       | Changes                                                                                                                                                            | Author           |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------- |
| 1.0     | 2025-01-15 | Initial source tree documentation                                                                                                                                  | Aria (architect) |
| 1.1     | 2025-12-14 | Updated org to SynkraAI, replaced Squads with Squads system [Story 6.10]                                                                                           | Dex (dev)        |
| 2.0     | 2025-12-15 | Major update to reflect modular architecture (cli/, core/, development/, infrastructure/, product/) [Story 6.13]                                                   | Pax (PO)         |
| 3.0     | 2026-01-29 | Added ADE (Autonomous Development Engine) section documenting Epics 1-7: workflow-intelligence, ADE scripts, workflows, tasks, and runtime state [ADE Integration] | Aria (architect) |
| 3.1     | 2026-02-06 | Added Data File Governance section: documented 7 missing data files with owner, fill rule, and update trigger. Expanded .aiox-core/data/ and product/data/ tree listings. [Story ACT-8] | Dex (dev) |

---

_This is an official AIOX framework standard. All file placement must follow this structure._
