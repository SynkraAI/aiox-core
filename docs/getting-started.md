# Getting Started with Synkra AIOX

> **EN** | [PT](./pt/getting-started.md) | [ES](./es/getting-started.md)

---

Welcome to Synkra AIOX. This guide is optimized for first-value in 10 minutes.

## Table of Contents

1. [10-Minute Quick Path](#10-minute-quick-path)
2. [Installation](#installation)
3. [Your First Project](#your-first-project)
4. [Basic Commands](#basic-commands)
5. [IDE Compatibility](#ide-compatibility)
6. [Brownfield: Existing Projects](#brownfield-existing-projects)
7. [Advanced Path](#advanced-path)
8. [Troubleshooting](#troubleshooting)
9. [Next Steps](#next-steps)

## 10-Minute Quick Path

Use this exact flow if you are new:

### Step 1: Install AIOX

```bash
# New project
npx aiox-core init my-first-project
cd my-first-project

# Existing project
# cd existing-project
# npx aiox-core install
```

### Step 2: Pick your IDE activation path

- Claude Code: `/agent-name`
- Gemini CLI: `/aiox-menu` then `/aiox-<agent>`
- Codex CLI: `/skills` then `aiox-<agent-id>`
- Cursor/Copilot/AntiGravity: follow constraints in `docs/ide-integration.md`

### Step 3: Validate first value

First value is achieved when all 3 conditions are true:
1. You activate one AIOX agent.
2. You receive a valid greeting/activation response.
3. You run one starter command (`*help` or equivalent) and get useful output.

PASS rule: complete all 3 conditions in <= 10 minutes.

## Installation

### Prerequisites

- **Node.js** version 18.0.0 or higher (v20+ recommended)
- **npm** version 9.0.0 or higher
- **Git** (optional, but recommended)

### Quick Installation

```bash
# Create a new project
npx aiox-core init my-first-project

# Navigate to your project
cd my-first-project

# Start using AIOX agents in your IDE
# (see Step 2 above for IDE-specific activation)
```

### Installation Options

```bash
# 1. Create new project with custom template
npx aiox-core init my-project --template enterprise

# 2. Install in existing project
cd existing-project
npx aiox-core install

# 3. Force installation in non-empty directory
npx aiox-core init my-project --force

# 4. Skip dependency installation (manual install later)
npx aiox-core init my-project --skip-install
```

## Your First Project

### Project Structure

After installation, your project will include:

```
my-first-project/
├── .aiox-core/                 # AIOX framework core
│   ├── core/                   # Orchestration, memory, config
│   ├── data/                   # Knowledge base, entity registry
│   ├── development/            # Agents, tasks, templates, scripts
│   └── infrastructure/         # CI/CD templates, validation scripts
├── .claude/                    # Claude Code integration (if enabled)
├── .codex/                     # Codex CLI integration (if enabled)
├── .gemini/                    # Gemini CLI integration (if enabled)
├── docs/                       # Documentation
│   └── stories/                # Development stories
├── packages/                   # Shared packages
├── tests/                      # Test suites
└── package.json                # Project dependencies
```

### Configuration

AIOX configuration lives in `.aiox-core/core/config/`. The installer handles initial setup. To verify your installation:

```bash
npx aiox-core doctor
```

## Basic Commands

### Agent Activation

AIOX agents are activated through your IDE. Once activated, agents respond to commands prefixed with `*`:

```bash
# Universal commands (work in any agent)
*help                    # Show available commands for this agent
*guide                   # Show detailed usage guide
*session-info            # Display current session details
*exit                    # Exit agent mode

# Agent-specific examples
@dev *help               # Developer agent commands
@qa *review STORY-42     # QA agent reviews a story
@pm *create-epic         # PM agent creates an epic
@sm *draft               # Scrum Master drafts a story
```

### Available Agents

| Agent | Name | Focus |
| --- | --- | --- |
| `@dev` | Dex | Code implementation, bug fixes, refactoring |
| `@qa` | Quinn | Testing, quality gates, code review |
| `@architect` | Aria | System design, technical decisions |
| `@pm` | Bob | PRDs, strategy, roadmap |
| `@po` | Pax | Backlog, story validation, prioritization |
| `@sm` | River | Story creation, sprint planning |
| `@analyst` | Alex | Research, competitive analysis |
| `@data-engineer` | Dara | Database design, migrations |
| `@ux-design-expert` | Uma | UI/UX design, accessibility |
| `@devops` | Gage | Git operations, CI/CD, deployments |

### Typical Workflow

```
1. @pm creates a PRD          → *create-epic
2. @sm drafts stories          → *draft
3. @po validates stories       → *validate-story-draft
4. @dev implements             → (works from story file)
5. @qa reviews                 → *review STORY-ID
6. @devops pushes              → *push (only agent with push authority)
7. @po closes story            → *close-story STORY-ID
```

## IDE Compatibility

Not all IDEs support AIOX features equally. See the full comparison at [`docs/ide-integration.md`](./ide-integration.md).

Summary:

| IDE/CLI | Overall Status | How to Activate |
| --- | --- | --- |
| Claude Code | Works | `/agent-name` commands |
| Gemini CLI | Works | `/aiox-menu` then `/aiox-<agent>` |
| Codex CLI | Limited | `/skills` then `aiox-<agent-id>` |
| Cursor | Limited | `@agent` + synced rules |
| GitHub Copilot | Limited | chat modes + repo instructions |
| AntiGravity | Limited | workflow-driven activation |

- **Works**: fully recommended for new users.
- **Limited**: usable with documented workarounds.

## Brownfield: Existing Projects

Already have a codebase? AIOX handles brownfield projects with a dedicated workflow.

### Quick Brownfield Setup

```bash
# Navigate to your existing project
cd my-existing-project

# Install AIOX (non-destructive, preserves your config)
npx aiox-core install

# Run doctor to verify compatibility
npx aiox-core doctor
```

### What Happens on First Run

When you first activate an AIOX agent in an existing project:

1. **Detection**: AIOX detects code but no AIOX docs
2. **Offer**: "I can analyze your codebase. This takes 4-8 hours."
3. **Discovery**: Multi-agent technical debt assessment (optional)
4. **Output**: System architecture docs + technical debt report

### Brownfield Workflow Options

| Your Situation | Recommended Workflow |
|----------------|---------------------|
| Add major feature to existing project | `@pm → *create-doc brownfield-prd` |
| Audit legacy codebase | `brownfield-discovery.yaml` (full workflow) |
| Quick enhancement | `@pm → *brownfield-create-epic` |
| Single bug fix | `@pm → *brownfield-create-story` |

### Safety Guarantees

- **Non-destructive**: AIOX creates files, never overwrites existing
- **Rollback**: `git checkout HEAD~1 -- .` restores pre-AIOX state
- **Config preservation**: Your `.eslintrc`, `tsconfig.json`, etc. stay intact

### Resources

- **[Working in the Brownfield Guide](.aiox-core/working-in-the-brownfield.md)** - Complete brownfield documentation
- **[Compatibility Checklist](.aiox-core/development/checklists/brownfield-compatibility-checklist.md)** - Pre/post migration checks
- **[Risk Report Template](.aiox-core/product/templates/brownfield-risk-report-tmpl.yaml)** - Phase-by-phase risk assessment

---

## Advanced Path

For experienced users who want to go deeper:

### Sync and Validation

```bash
# Sync agents to all configured IDEs
npm run sync:ide

# Validate cross-IDE parity
npm run validate:parity

# Run all quality checks
npm run lint && npm run typecheck && npm test
```

### Story-Driven Development

All AIOX development follows stories in `docs/stories/`. Each story contains:
- Acceptance criteria with checkboxes
- Tasks mapped to specific ACs
- CodeRabbit integration for automated review
- Quality gate assignments

See the [User Guide](./guides/user-guide.md) for the complete workflow.

### Squad Expansions

Squads extend AIOX beyond software development into any domain. See [Squads Guide](./guides/squads-guide.md).

## Troubleshooting

### Installation Issues

```bash
# Check Node.js version
node --version  # Should be >= 18.0.0

# Run diagnostics
npx aiox-core doctor

# Auto-fix common issues
npx aiox-core doctor --fix
```

### Agent Not Responding

1. Verify your IDE is supported (see [IDE Compatibility](#ide-compatibility)).
2. Run `npm run sync:ide` to refresh agent files.
3. Restart your IDE/CLI session.

### Sync Issues

```bash
# Preview what would change
npm run sync:ide -- --dry-run

# Force re-sync
npm run sync:ide

# Validate after sync
npm run validate:parity
```

## Next Steps

- **[User Guide](./guides/user-guide.md)** - Complete workflow from planning to delivery
- **[IDE Integration](./ide-integration.md)** - Detailed setup per IDE
- **[Architecture](./architecture/ARCHITECTURE-INDEX.md)** - Technical deep dive
- **[Squads Guide](./guides/squads-guide.md)** - Extend AIOX to any domain
- **[Troubleshooting](./troubleshooting.md)** - Common issues and solutions

---

_Synkra AIOX Getting Started Guide v4.2.11_
