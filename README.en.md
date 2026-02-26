# Synkra AIOS: Universal AI Agent Framework 🚀

> 🌍 **[English](README.en.md)** | [Português](README.md)

[![NPM Version](https://img.shields.io/npm/v/aios-core.svg)](https://www.npmjs.com/package/aios-core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![CI](https://github.com/SynkraAI/aios-core/actions/workflows/ci.yml/badge.svg)](https://github.com/SynkraAI/aios-core/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/SynkraAI/aios-core/branch/main/graph/badge.svg)](https://codecov.io/gh/SynkraAI/aios-core)
[![Documentation](https://img.shields.io/badge/docs-available-orange.svg)](https://synkra.ai)
[![Open Source](https://img.shields.io/badge/Open%20Source-Yes-success.svg)](LICENSE)
[![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Code of Conduct](https://img.shields.io/badge/code%20of%20conduct-Contributor%20Covenant-blue.svg)](CODE_OF_CONDUCT.md)

AI-Powered Self-Modifying Development Framework. Founded on Agent-Driven Agile Development, offering revolutionary capabilities for AI-driven development and much more. Transform any domain with specialized AI expertise: software development, entertainment, creative writing, business strategy, personal wellness, and more.

## Start Here (10 Min)

If this is your first time with AIOS, follow this linear path:

1. Install in a new or existing project:
```bash
# new project
npx aios-core init my-project

# existing project
cd your-project
npx aios-core install
```
2. Choose your IDE/CLI and the activation path:
- Claude Code: `/agent-name`
- Gemini CLI: `/aios-menu` → `/aios-<agent>`
- Codex CLI: `/skills` → `aios-<agent-id>`
- Cursor/Copilot/AntiGravity: follow the limits and workarounds in `docs/ide-integration.md`
3. Activate 1 agent and confirm the greeting.
4. Run 1 initial command (`*help` or equivalent) to validate first-value.

First-value definition (binary): agent activation + valid greeting + initial command with useful output in <= 10 minutes.


## IDE Hook Compatibility (AIOS 4.2 Reality)

Many advanced AIOS features depend on lifecycle events (hooks). The table below shows the actual parity between IDEs/platforms:

| IDE/CLI | Hook Parity vs Claude | Practical Impact |
| --- | --- | --- |
| Claude Code | Complete (reference) | Maximum context automation, guardrails, and auditing |
| Gemini CLI | High (native events) | Strong coverage of pre/post tool and session automations |
| Codex CLI | Partial/limited | Some automations depend on `AGENTS.md`, `/skills`, MCP, and operational flow |
| Cursor | No equivalent lifecycle hooks | Less pre/post tool automation; focus on rules, MCP, and agent flow |
| GitHub Copilot | No equivalent lifecycle hooks | Less session/tooling automation; focus on repository instructions + MCP in VS Code |
| AntiGravity | Workflow-based (not hook-based) | Integration via workflows, not via hook events equivalent to Claude |

Detailed impacts and mitigation: `docs/ide-integration.md`.

## Acknowledgments & Attribution

Synkra AIOS was originally derived from the [BMad Method](https://github.com/bmad-code-org/BMAD-METHOD), created by [Brian Madison](https://github.com/bmadcode) (BMad Code, LLC). We gratefully acknowledge the BMad Method for providing the foundation from which this project began.

**Important:** This project is **NOT affiliated with, endorsed by, or sanctioned by** the BMad Method or BMad Code, LLC. Contributors appearing in the git history from the original BMad Method repository do not imply active participation in or endorsement of Synkra AIOS.

Since its origin, AIOS has evolved significantly with its own architecture, terminology, and features (v4.x+), and does not depend on BMad for current operation. The BMad Method remains an excellent framework in its own right — please visit the [official BMad Method repository](https://github.com/bmad-code-org/BMAD-METHOD) to learn more.

BMad, BMad Method, and BMad Core are trademarks of BMad Code, LLC. See [TRADEMARK.md](https://github.com/bmad-code-org/BMAD-METHOD/blob/main/TRADEMARK.md) for usage guidelines.

## Overview

### Architectural Premise: CLI First

Synkra AIOS follows a clear priority hierarchy:

```text
CLI First → Observability Second → UI Third
```

| Layer             | Priority  | Focus                                                                          | Examples                                     |
| ----------------- | --------- | ------------------------------------------------------------------------------ | -------------------------------------------- |
| **CLI**           | Highest   | Where the intelligence lives. All execution, decisions, and automation happen here. | Agents (`@dev`, `@qa`), workflows, commands |
| **Observability** | Secondary | Observe and monitor what happens in the CLI in real time.                      | SSE Dashboard, logs, metrics, timeline       |
| **UI**            | Tertiary  | Ad-hoc management and visualizations when needed.                              | Kanban, settings, story management           |

**Derived principles:**

- The CLI is the source of truth - dashboards only observe
- New features must work 100% via CLI before having a UI
- The UI should never be a requirement for system operation
- Observability serves to understand what the CLI is doing, not to control it

---

**The Two Key Innovations of Synkra AIOS:**

**1. Agentic Planning:** Dedicated agents (analyst, pm, architect) collaborate with you to create detailed, consistent PRD and Architecture documents. Through advanced prompt engineering and human-in-the-loop refinement, these planning agents produce comprehensive specifications that go far beyond generic AI task generation.

**2. Engineering-Contextualized Development:** The sm (Scrum Master) agent then transforms these detailed plans into hyper-detailed development stories that contain everything the dev agent needs - complete context, implementation details, and architectural guidance embedded directly in the story files.

This two-phase approach eliminates both **planning inconsistency** and **context loss** - the biggest problems in AI-assisted development. Your dev agent opens a story file with full understanding of what to build, how to build it, and why.

**📖 [See the complete workflow in the User Guide](docs/guides/user-guide.md)** - Planning phase, development cycle, and all agent roles

## Prerequisites

- Node.js >=18.0.0 (v20+ recommended)
- npm >=9.0.0
- GitHub CLI (optional, required for team collaboration)

> **Installation issues?** See the [Troubleshooting Guide](docs/guides/installation-troubleshooting.md)

**Platform-specific guides:**

- 📖 [macOS Installation Guide](docs/installation/macos.md)
- 📖 [Windows Installation Guide](docs/installation/windows.md)
- 📖 [Linux Installation Guide](docs/installation/linux.md)

**Multilingual documentation available:** [Português](docs/pt/installation/) | [Español](docs/es/installation/)

## Quick Navigation

### Understanding the AIOS Workflow

**Before diving in, review these critical workflow diagrams that explain how AIOS works:**

1. **[Planning Workflow (Web Interface)](docs/guides/user-guide.md#the-planning-workflow-web-ui)** - How to create PRD and Architecture documents
2. **[Core Development Cycle (IDE)](docs/guides/user-guide.md#the-core-development-cycle-ide)** - How the sm, dev, and qa agents collaborate through story files

> ⚠️ **These diagrams explain 90% of the confusion about the Synkra AIOS Agentic Agile workflow** - Understanding PRD+Architecture creation and the sm/dev/qa workflow and how agents pass notes through story files is essential - and it also explains why this is NOT taskmaster or just a simple task runner!

### What would you like to do?

- **[Install and Build software with a Full Stack AI Agile Team](#quick-start)** → Quick Start Instructions
- **[Learn how to use AIOS](docs/guides/user-guide.md)** → Complete user guide and walkthrough
- **[See available AI agents](#available-agents)** → Specialized roles for your team
- **[Explore non-technical uses](#-beyond-software-development---squads)** → Creative writing, business, wellness, education
- **[Create my own AI agents](#creating-your-own-squad)** → Build agents for your domain
- **[Browse ready-made Squads](docs/guides/squads-overview.md)** → See how to create and use AI agent teams
- **[Understand the architecture](docs/architecture/ARCHITECTURE-INDEX.md)** → Deep technical dive
- **[Report issues](https://github.com/SynkraAI/aios-core/issues)** → Bug reports and feature requests

## Important: Keep Your AIOS Installation Updated

**Stay up to date effortlessly!** To update your existing AIOS installation:

```bash
npx aios-core@latest install
```

This will:

- ✅ Automatically detect your existing installation
- ✅ Update only the files that have changed
- ✅ Create `.bak` backup files for any custom modifications
- ✅ Preserve your project-specific settings

This makes it easy to benefit from the latest improvements, bug fixes, and new agents without losing your customizations!

## Quick Start

### 🚀 Installation via NPX (Recommended)

**Install Synkra AIOS with a single command:**

```bash
# Create a new project with modern interactive wizard
npx aios-core init my-project

# Or install in an existing project
cd your-project
npx aios-core install

# Or use a specific version
npx aios-core@latest init my-project
```

### ✨ Modern Installation Wizard

Synkra AIOS now includes a cutting-edge interactive installation experience, inspired by modern tools like Vite and Next.js:

**Interactive Installer Features:**

- 🎨 **Modern Interface**: Colorful and visual prompts with @clack/prompts
- ✅ **Real-Time Validation**: Instant feedback on invalid inputs
- 🔄 **Progress Indicators**: Spinners for long operations (file copying, dependency installation)
- 📦 **Multi-Component Selection**: Choose which components to install with an intuitive interface
- ⚙️ **Package Manager Choice**: Select between npm, yarn, or pnpm
- ⌨️ **Cancellation Support**: Ctrl+C or ESC to exit gracefully at any time
- 📊 **Installation Summary**: View all settings before proceeding
- ⏱️ **Duration Tracking**: See how long the installation took

**The installer offers:**

- ✅ Download of the latest version from NPM
- ✅ Modern interactive installation wizard
- ✅ Automatic IDE configuration (Codex CLI, Cursor, or Claude Code)
- ✅ Configuration of all AIOS agents and workflows
- ✅ Creation of necessary configuration files
- ✅ Meta-agent system initialization
- ✅ System health checks
- ✅ **Cross-Platform Support**: Tested on Windows, macOS, and Linux

> **That's it!** No cloning, no manual configuration - just one command and you're ready to go with a modern, professional installation experience.

**Prerequisites**: [Node.js](https://nodejs.org) v18+ required (v20+ recommended) | [Troubleshooting](docs/guides/installation-troubleshooting.md)

### Updating an Existing Installation

If you already have AIOS installed:

```bash
npx aios-core@latest install
# The installer will detect your existing installation and update it
```

### Configure Your IDE for AIOS Development

Synkra AIOS includes pre-configured IDE rules to enhance your development experience:

#### For Cursor:

1. Open Cursor settings
2. Navigate to **User Rules**
3. Copy the contents of `.cursor/global-rules.md`
4. Paste in the rules section and save

#### For Claude Code:

- ✅ Already configured! The `.claude/CLAUDE.md` file is loaded automatically
- Dedicated agent sync: `npm run sync:ide:claude`
- Dedicated validation: `npm run validate:claude-sync && npm run validate:claude-integration`

#### For Codex CLI:

- ✅ First-class integration in AIOS 4.2 (shared activation and greeting pipeline)
- ✅ Already configured! The `AGENTS.md` file at the root is loaded automatically
- Optional: sync auxiliary agents with `npm run sync:ide:codex`
- Recommended in this repository: generate and version local skills with `npm run sync:skills:codex`
- Use `npm run sync:skills:codex:global` only outside this project (to avoid duplication in `/skills`)
- Dedicated validation: `npm run validate:codex-sync && npm run validate:codex-integration`
- Skills/paths guardrails: `npm run validate:codex-skills && npm run validate:paths`

#### For Gemini CLI:

- ✅ Rules and agents syncable with `npm run sync:ide:gemini`
- Generated files in `.gemini/rules.md`, `.gemini/rules/AIOS/agents/`, and `.gemini/commands/*.toml`
- ✅ Local hooks and settings in the installation flow (`.gemini/hooks/` + `.gemini/settings.json`)
- ✅ Quick activation via slash commands (`/aios-menu`, `/aios-dev`, `/aios-architect`, etc.)
- Dedicated validation: `npm run validate:gemini-sync && npm run validate:gemini-integration`
- Multi-IDE parity in one command: `npm run validate:parity`

These rules provide:

- 🤖 Agent command recognition and integration
- 📋 Story-driven development workflow
- ✅ Automatic checkbox tracking
- 🧪 Testing and validation patterns
- 📝 AIOS-specific code patterns

### Fastest Start with Web Interface (2 minutes)

1. **Install AIOS**: Run `npx aios-core init my-project`
2. **Configure your IDE**: Follow the setup instructions for Codex CLI, Cursor, or Claude Code
3. **Start Planning**: Activate an agent like `@analyst` to begin creating your briefing
4. **Use AIOS commands**: Type `*help` to see available commands
5. **Follow the flow**: See the [User Guide](docs/guides/user-guide.md) for more details

### CLI Command Reference

Synkra AIOS offers a modern, cross-platform CLI with intuitive commands:

```bash
# Project Management (with interactive wizard)
npx aios-core init <project-name> [options]
  --force              Force creation in non-empty directory
  --skip-install       Skip npm dependency installation
  --template <name>    Use specific template (default, minimal, enterprise)

# Installation and Configuration (with modern prompts)
npx aios-core install [options]
  --force              Overwrite existing configuration
  --quiet              Minimal output during installation
  --dry-run            Simulate installation without modifying files

# System Commands
npx aios-core --version   Display installed version
npx aios-core --help      Display detailed help
npx aios-core info        Display system information
npx aios-core doctor      Run system diagnostics
npx aios-core doctor --fix Automatically fix detected issues

# Maintenance
npx aios-core update      Update to latest version
npx aios-core uninstall   Remove Synkra AIOS
```

**CLI Features:**

- ✅ **Comprehensive Help System**: `--help` on any command shows detailed documentation
- ✅ **Input Validation**: Immediate feedback on invalid parameters
- ✅ **Colored Messages**: Errors in red, successes in green, warnings in yellow
- ✅ **Cross-Platform**: Works seamlessly on Windows, macOS, and Linux
- ✅ **Dry-Run Support**: Test installations without modifying files

### 💡 Usage Examples

#### Full Interactive Installation

```bash
$ npx aios-core install

🚀 Synkra AIOS Installation

◆ What is your project name?
│  my-awesome-project
│
◇ Which directory should we use?
│  ./my-awesome-project
│
◆ Choose components to install:
│  ● Core Framework (Required)
│  ● Agent System (Required)
│  ● Squads (optional)
│  ○ Example Projects (optional)
│
◇ Select package manager:
│  ● npm
│  ○ yarn
│  ○ pnpm
│
◆ Initialize Git repository?
│  Yes
│
◆ Install dependencies?
│  Yes
│
▸ Creating project directory...
▸ Copying framework files...
▸ Initializing Git repository...
▸ Installing dependencies (this may take a minute)...
▸ Configuring environment...
▸ Running post-installation setup...

✔ Installation completed successfully! (34.2s)

Next steps:
  cd my-awesome-project
  aios-core doctor     # Verify installation
  aios-core --help     # See available commands
```

#### Silent Installation (CI/CD)

```bash
# Automated installation without prompts
$ npx aios-core install --quiet --force
✔ Synkra AIOS installed successfully
```

#### Installation Simulation (Dry-Run)

```bash
# Test installation without modifying files
$ npx aios-core install --dry-run

[DRY RUN] Would create: ./my-project/
[DRY RUN] Would copy: .aios-core/ (45 files)
[DRY RUN] Would initialize: Git repository
[DRY RUN] Would install: npm dependencies
✔ Dry run completed - no files were modified
```

#### System Diagnostics

```bash
$ npx aios-core doctor

🏥 AIOS System Diagnostics

✔ Node.js version: v20.10.0 (meets requirement: >=18.0.0)
✔ npm version: 10.2.3
✔ Git installed: version 2.43.0
✔ GitHub CLI: gh 2.40.1
✔ Synkra AIOS: v4.2.11

Configuration:
✔ .aios-core/ directory exists
✔ Agent files: 11 found
✔ Workflow files: 8 found
✔ Templates: 15 found

Dependencies:
✔ @clack/prompts: ^0.7.0
✔ commander: ^12.0.0
✔ execa: ^9.0.0
✔ fs-extra: ^11.0.0
✔ picocolors: ^1.0.0

✅ All checks passed! Your installation is healthy.
```

#### Get Help

```bash
$ npx aios-core --help

Usage: aios-core [options] [command]

Synkra AIOS: AI-Orchestrated System for Full Stack Development

Options:
  -V, --version                output the version number
  -h, --help                   display help for command

Commands:
  init <project-name>          Create new AIOS project with interactive wizard
  install [options]            Install AIOS in current directory
  info                         Display system information
  doctor [options]             Run system diagnostics and health checks
  help [command]               display help for command

Run 'aios-core <command> --help' for detailed information about each command.
```

### Alternative: Clone and Build

For contributors or advanced users who want to modify the source code:

```bash
# Clone the repository
git clone https://github.com/SynkraAI/aios-core.git
cd aios-core

# Install dependencies
npm install

# Run the installer
npm run install:aios
```

### Quick Team Setup

For team members joining the project:

```bash
# Install AIOS in the project
npx aios-core@latest install

# This will:
# 1. Detect existing installation (if any)
# 2. Install/update AIOS framework
# 3. Configure agents and workflows
```

## 🌟 Beyond Software Development - Squads

The AIOS natural language framework works in ANY domain. Squads provide specialized AI agents for creative writing, business strategy, health and wellness, education, and more. Additionally, Squads can expand the Synkra AIOS core with domain-specific functionality that isn't generic for all use cases. [See the Squads Guide](docs/guides/squads-guide.md) and learn to create your own!

## Available Agents

Synkra AIOS comes with 12 specialized agents:

### Meta Agents

- **aios-master** - Master orchestration agent (includes framework development capabilities)
- **aios-orchestrator** - Workflow orchestrator and team coordination

### Planning Agents (Web Interface)

- **analyst** - Business analysis specialist and PRD creation
- **pm** (Product Manager) - Product manager and prioritization
- **architect** - System architect and technical design
- **ux-expert** - User experience design and usability

### Development Agents (IDE)

- **sm** (Scrum Master) - Sprint management and story creation
- **dev** - Developer and implementation
- **qa** - Quality assurance and testing
- **po** (Product Owner) - Backlog and story management
- **data-engineer** - Database design and data modeling
- **devops** - CI/CD, infrastructure, and git operations (exclusive push authority)

## Documentation and Resources

### Essential Guides

- 📖 **[User Guide](docs/guides/user-guide.md)** - Complete walkthrough from conception to project completion
- 🏗️ **[Core Architecture](docs/architecture/ARCHITECTURE-INDEX.md)** - Deep technical dive and system design
- 🚀 **[Squads Guide](docs/guides/squads-guide.md)** - Extend AIOS to any domain beyond software development

### Additional Documentation

- 🤖 **[Squads Guide](docs/guides/squads-guide.md)** - Create and publish AI agent teams
- 📋 **[Getting Started](docs/getting-started.md)** - Step-by-step tutorial for beginners
- 🔧 **[Troubleshooting](docs/troubleshooting.md)** - Solutions for common issues
- 🎯 **[Guiding Principles](docs/GUIDING-PRINCIPLES.md)** - AIOS philosophy and best practices
- 🏛️ **[Architecture Overview](docs/architecture/ARCHITECTURE-INDEX.md)** - Detailed view of system architecture
- ⚙️ **[Performance Tuning Guide](docs/performance-tuning-guide.md)** - Optimize your AIOS workflow
- 🔒 **[Security Best Practices](docs/security-best-practices.md)** - Security and data protection
- 🔄 **[Migration Guide](docs/migration-guide.md)** - Migration from previous versions
- 📦 **[Versioning and Releases](docs/versioning-and-releases.md)** - Versioning policy

## 🤖 AIOS Autonomous Development Engine (ADE)

Synkra AIOS introduces the **Autonomous Development Engine (ADE)** - a complete system for autonomous development that transforms requirements into working code.

### 🎯 What is ADE?

ADE is a set of **7 Epics** that enable autonomous development execution:

| Epic  | Name             | Description                                |
| ----- | ---------------- | ------------------------------------------ |
| **1** | Worktree Manager | Branch isolation via Git worktrees         |
| **2** | Migration V2→V3  | Migration to autoClaude V3 format          |
| **3** | Spec Pipeline    | Transforms requirements into executable specs |
| **4** | Execution Engine | Executes specs with 13 steps + self-critique |
| **5** | Recovery System  | Automatic failure recovery                 |
| **6** | QA Evolution     | Structured review in 10 phases             |
| **7** | Memory Layer     | Persistent memory of patterns and insights |

### 🔄 Main Flow

```text
User Request → Spec Pipeline → Execution Engine → QA Review → Working Code
                                      ↓
                              Recovery System
                                      ↓
                               Memory Layer
```

### ⚡ Quick Start ADE

```bash
# 1. Create spec from requirement
@pm *gather-requirements
@architect *assess-complexity
@analyst *research-deps
@pm *write-spec
@qa *critique-spec

# 2. Execute approved spec
@architect *create-plan
@architect *create-context
@dev *execute-subtask 1.1

# 3. QA Review
@qa *review-build STORY-42
```

### 📖 ADE Documentation

- **[Complete ADE Guide](docs/guides/ade-guide.md)** - Step-by-step tutorial
- **[Agent Changes](docs/architecture/ADE-AGENT-CHANGES.md)** - Commands and capabilities per agent
- **[Epic 1 - Worktree Manager](docs/architecture/ADE-EPIC1-HANDOFF.md)**
- **[Epic 2 - Migration V2→V3](docs/architecture/ADE-EPIC2-HANDOFF.md)**
- **[Epic 3 - Spec Pipeline](docs/architecture/ADE-EPIC3-HANDOFF.md)**
- **[Epic 4 - Execution Engine](docs/architecture/ADE-EPIC4-HANDOFF.md)**
- **[Epic 5 - Recovery System](docs/architecture/ADE-EPIC5-HANDOFF.md)**
- **[Epic 6 - QA Evolution](docs/architecture/ADE-EPIC6-HANDOFF.md)**
- **[Epic 7 - Memory Layer](docs/architecture/ADE-EPIC7-HANDOFF.md)**

### 🆕 New Commands per Agent

**@devops:**

- `*create-worktree`, `*list-worktrees`, `*merge-worktree`, `*cleanup-worktrees`
- `*inventory-assets`, `*analyze-paths`, `*migrate-agent`, `*migrate-batch`

**@pm:**

- `*gather-requirements`, `*write-spec`

**@architect:**

- `*assess-complexity`, `*create-plan`, `*create-context`, `*map-codebase`

**@analyst:**

- `*research-deps`, `*extract-patterns`

**@qa:**

- `*critique-spec`, `*review-build`, `*request-fix`, `*verify-fix`

**@dev:**

- `*execute-subtask`, `*track-attempt`, `*rollback`, `*capture-insights`, `*list-gotchas`, `*apply-qa-fix`

## Creating Your Own Squad

Squads allow you to extend AIOS to any domain. Basic structure:

```text
squads/your-squad/
├── config.yaml           # Squad configuration
├── agents/              # Specialized agents
├── tasks/               # Task workflows
├── templates/           # Document templates
├── checklists/          # Validation checklists
├── data/                # Knowledge base
├── README.md            # Squad documentation
└── user-guide.md        # User guide
```

See the [Squads Guide](docs/guides/squads-guide.md) for detailed instructions.

## Available Squads

Squads are modular AI agent teams. See the [Squads Overview](docs/guides/squads-overview.md) for more information.

### External Squads

- **[hybrid-ops](https://github.com/SynkraAI/aios-hybrid-ops-pedro-valerio)** - Human-agent hybrid operations (separate repository)

## AIOS Pro

**AIOS Pro** (`@aios-fullstack/pro`) is the premium module of Synkra AIOS, offering advanced features for teams and larger-scale projects.

> **Restricted availability:** AIOS Pro is available exclusively to members of the **AIOS Cohort Advanced**. [Learn more about the program](https://synkra.ai).

### Installation

```bash
npm install @aios-fullstack/pro
```

### Premium Features

- **Advanced Squads** - Specialized squads with expanded capabilities
- **Memory Layer** - Persistent memory of patterns and insights across sessions
- **Metrics & Analytics** - Productivity dashboard and development metrics
- **Enterprise Integrations** - Connectors for Jira, Linear, Notion, and more
- **Layered Configuration** - L1-L4 configuration system with inheritance
- **Licensing** - License management via `aios pro activate --key <KEY>`

For more information, run `npx aios-core pro --help` after installation.

## Support

- 🐛 [Issue Tracker](https://github.com/SynkraAI/aios-core/issues) - Bug reports and feature requests
- 💡 [Feature Process](docs/FEATURE_PROCESS.md) - How to propose new features
- 📋 [How to Contribute](CONTRIBUTING.md)
- 🗺️ [Roadmap](docs/roadmap.md) - See what we're building
- 🤖 [Squads Guide](docs/guides/squads-guide.md) - Create AI agent teams

## Git Workflow and Validation

Synkra AIOS implements a multi-layer validation system to ensure code quality and consistency:

### 🛡️ Defense in Depth - 3 Validation Layers

**Layer 1: Pre-commit (Local - Fast)**

- ✅ ESLint - Code quality
- ✅ TypeScript - Type checking
- ⚡ Performance: <5s
- 💾 Cache enabled

**Layer 2: Pre-push (Local - Story Validation)**

- ✅ Story checkbox validation
- ✅ Status consistency
- ✅ Required sections

**Layer 3: CI/CD (Cloud - Required for merge)**

- ✅ All tests
- ✅ Test coverage (80% minimum)
- ✅ Complete validations
- ✅ GitHub Actions

### 📖 Detailed Documentation

- 📋 **[Complete Git Workflow Guide](docs/git-workflow-guide.md)** - Detailed workflow guide
- 📋 **[CONTRIBUTING.md](CONTRIBUTING.md)** - Contribution guide

### Available Commands

```bash
# Local validations
npm run lint           # ESLint
npm run typecheck      # TypeScript
npm test              # Tests
npm run test:coverage # Tests with coverage

# AIOS Validator
node .aios-core/utils/aios-validator.js pre-commit   # Pre-commit validation
node .aios-core/utils/aios-validator.js pre-push     # Pre-push validation
node .aios-core/utils/aios-validator.js stories      # Validate all stories
```

### Branch Protection

Configure master branch protection with:

```bash
node scripts/setup-branch-protection.js
```

Requires:

- GitHub CLI (gh) installed and authenticated
- Admin access to the repository

## Contributing

**We're excited about contributions and welcome your ideas, improvements, and Squads!** 🎉

To contribute:

1. Fork the repository
2. Create a branch for your feature (`git checkout -b feature/MyNewFeature`)
3. Commit your changes (`git commit -m 'feat: Add new feature'`)
4. Push to the branch (`git push origin feature/MyNewFeature`)
5. Open a Pull Request

See also:

- 📋 [How to Contribute with Pull Requests](docs/how-to-contribute-with-pull-requests.md)
- 📋 [Git Workflow Guide](docs/git-workflow-guide.md)

## 📄 Legal

| Document              | English                                     | Português                             |
| --------------------- | ------------------------------------------- | ------------------------------------- |
| **License**           | [MIT License](LICENSE)                      | -                                     |
| **License Model**     | [Core vs Pro](docs/legal/license-clarification.md) | -                               |
| **Privacy**           | [Privacy Policy](docs/legal/privacy.md)     | -                                     |
| **Terms of Use**      | [Terms of Use](docs/legal/terms.md)         | -                                     |
| **Code of Conduct**   | [Code of Conduct](CODE_OF_CONDUCT.md)       | [PT-BR](docs/pt/code-of-conduct.md)   |
| **Contributing**      | [Contributing](CONTRIBUTING.md)             | [PT-BR](docs/pt/contributing.md)      |
| **Security**          | [Security](docs/security.md)                | [PT-BR](docs/pt/security.md)          |
| **Community**         | [Community](docs/community.md)              | [PT-BR](docs/pt/community.md)         |
| **Roadmap**           | [Roadmap](docs/roadmap.md)                  | [PT-BR](docs/pt/roadmap.md)           |
| **Changelog**         | [Version History](CHANGELOG.md)             | -                                     |

## Acknowledgments

This project was originally derived from the [BMad Method](https://github.com/bmad-code-org/BMAD-METHOD) by [Brian Madison](https://github.com/bmadcode). We thank Brian and all BMad Method contributors for the original work that made this project possible.

**Note:** Some contributors shown in the GitHub contributors graph are inherited from the original BMad Method git history and do not represent active participation in or endorsement of Synkra AIOS.

[![Contributors](https://contrib.rocks/image?repo=SynkraAI/aios-core)](https://github.com/SynkraAI/aios-core/graphs/contributors)

<sub>Built with ❤️ for the AI-assisted development community</sub>

---

**[⬆ Back to top](#synkra-aios-universal-ai-agent-framework-)**
