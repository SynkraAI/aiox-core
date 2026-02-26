# AIOS User Guide

> **EN**

---

Complete guide for using Synkra AIOS - the AI-Orchestrated System for Full Stack Development.

**Version:** 2.1.0
**Last Updated:** 2026-01-28

---

## Quick Start

### Prerequisites

Before using AIOS, ensure you have:

- **Node.js** version 18.0.0 or higher
- **npm** version 8.0.0 or higher
- **Git** for version control
- An AI provider API key (Anthropic, OpenAI, or compatible)

### Installation

```bash
# New project (Greenfield)
npx aios-core init my-project

# Existing project (Brownfield)
cd existing-project
npx aios-core install
```

### First Steps

```bash
# Navigate to your project
cd my-project

# List available agents
aios agents list

# Activate an agent
@dev

# Get help
*help
```

---

## Core Concepts

### Philosophy

> **"Structure is Sacred. Tone is Flexible."**

AIOS provides orchestrated structure while allowing flexibility in communication. This means:

- **Fixed:** Template positions, section order, metric formats, file structure, workflows
- **Flexible:** Status messages, vocabulary choices, emoji usage, personality, tone

### The AIOS Difference

| Traditional AI Dev            | AIOS                                    |
| ----------------------------- | --------------------------------------- |
| Uncoordinated agents          | 11 specialized agents with clear roles  |
| Inconsistent results          | Structured workflows with quality gates |
| Context lost between sessions | Persistent memory and learning          |
| Reinventing the wheel         | Reusable tasks, workflows, and squads   |

---

## Agents

AIOS includes 11 specialized agents, each with a distinct role and personality:

| Agent     | ID               | Archetype    | Responsibility          |
| --------- | ---------------- | ------------ | ----------------------- |
| **Dex**   | `@dev`           | Builder      | Code implementation     |
| **Quinn** | `@qa`            | Guardian     | Quality assurance       |
| **Aria**  | `@architect`     | Architect    | Technical architecture  |
| **Nova**  | `@po`            | Visionary    | Product backlog         |
| **Kai**   | `@pm`            | Balancer     | Product strategy        |
| **River** | `@sm`            | Facilitator  | Process facilitation    |
| **Zara**  | `@analyst`       | Explorer     | Business analysis       |
| **Dara**  | `@data-engineer` | Architect    | Data engineering        |
| **Felix** | `@devops`        | Optimizer    | CI/CD and operations    |
| **Uma**   | `@ux-expert`     | Creator      | User experience         |
| **Pax**   | `@aios-master`   | Orchestrator | Framework orchestration |

### Agent Activation

```bash
# Activate an agent using @ syntax
@dev                # Activate Dex (Developer)
@qa                 # Activate Quinn (QA)
@architect          # Activate Aria (Architect)
@aios-master        # Activate Pax (Orchestrator)

# Agent commands use * prefix
*help               # Show available commands
*task <name>        # Execute specific task
*exit               # Deactivate agent
```

### Agent Context

When an agent is active:

- Follow that agent's specific persona and expertise
- Use the agent's designated workflow patterns
- Maintain the agent's perspective throughout the interaction

### Command Visibility Levels

Agent commands use visibility levels to control when they appear:

| Level | Name    | Description                                      |
|-------|---------|--------------------------------------------------|
| `key` | Key     | Critical commands shown in minimal greeting      |
| `quick` | Quick | Essential commands shown in quick reference    |
| `full` | Full    | All commands shown in `*help` output            |

**How visibility works:**

```yaml
commands:
  - name: help
    visibility: [full, quick, key]  # Always shown
    description: "Show available commands"

  - name: create-prd
    visibility: [full, quick]       # Shown in quick reference
    description: "Create product requirements"

  - name: session-info
    visibility: [full]              # Only in full help
    description: "Show session details"
```

**Command Authority:**

Each command has exactly one authoritative agent owner. When multiple agents might handle similar tasks:

| Command        | Owner      | Others Should...                |
|----------------|------------|---------------------------------|
| `*create-prd`  | @pm        | Delegate to @pm                 |
| `*create-epic` | @pm        | Delegate to @pm                 |
| `*draft`       | @sm        | Use @sm for story creation      |
| `*develop`     | @dev       | Use @dev for implementation     |
| `*review`      | @qa        | Use @qa for code review         |

See the [Command Authority Matrix](../architecture/command-authority-matrix.md) for the complete mapping.

---

## Tasks

Tasks are the primary entry point in AIOS. Everything is a task.

### Task-First Architecture

```
User Request --> Task --> Agent Execution --> Output
                  |
             Workflow (if multi-step)
```

### Executing Tasks

```bash
# Execute a specific task
*task develop-story --story=1.1

# List available tasks
aios tasks list

# Get task help
*task --help
```

### Task Categories

| Category          | Examples                                |
| ----------------- | --------------------------------------- |
| **Development**   | develop-story, code-review, refactor    |
| **Quality**       | run-tests, validate-code, security-scan |
| **Documentation** | generate-docs, update-readme            |
| **Workflow**      | create-story, manage-sprint             |

---

## Workflows

Workflows orchestrate multiple tasks and agents for complex operations.

### Available Workflows

| Workflow                 | Use Case                | Agents Involved   |
| ------------------------ | ----------------------- | ----------------- |
| `greenfield-fullstack`   | New full-stack project  | All agents        |
| `brownfield-integration` | Add AIOS to existing    | dev, architect    |
| `fork-join`              | Parallel task execution | Multiple          |
| `organizer-worker`       | Delegated execution     | po, dev           |
| `data-pipeline`          | ETL workflows           | data-engineer, qa |

### Executing Workflows

```bash
# Start a workflow
aios workflow greenfield-fullstack

# With parameters
aios workflow brownfield-integration --target=./existing-project
```

---

## Squads

Squads are modular teams of AI agents that extend AIOS functionality.

### What is a Squad?

A squad is a self-contained package containing:

| Component     | Purpose                       |
| ------------- | ----------------------------- |
| **Agents**    | Domain-specific AI personas   |
| **Tasks**     | Executable workflows          |
| **Workflows** | Multi-step orchestrations     |
| **Config**    | Coding standards, tech stack  |
| **Templates** | Document generation templates |
| **Tools**     | Custom tool integrations      |

### Distribution Levels

```
Level 1: LOCAL        --> ./squads/           (Private)
Level 2: AIOS-SQUADS  --> github.com/SynkraAI (Public/Free)
Level 3: SYNKRA API   --> api.synkra.dev      (Marketplace)
```

### Using Squads

```bash
# List available squads
aios squads list

# Download a squad
aios squads download etl-squad

# Create your own squad
@squad-creator
*create-squad my-custom-squad
```

### Official Squads

| Squad           | Description                        |
| --------------- | ---------------------------------- |
| `etl-squad`     | Data collection and transformation |
| `creator-squad` | Content generation utilities       |

---

## Basic Usage

### Project Structure

```
my-project/
├── .aios-core/                # Framework configuration
│   ├── development/agents/    # Agent definitions
│   ├── development/tasks/     # Task workflows
│   ├── product/templates/     # Document templates
│   └── product/checklists/    # Validation checklists
├── docs/
│   ├── stories/               # Development stories
│   ├── architecture/          # System architecture
│   └── guides/                # User guides
├── squads/                    # Local squads
└── src/                       # Application source code
```

### Common Commands

```bash
# AIOS Master Commands
*help                # Show available commands
*create-story        # Create new story
*task {name}         # Execute specific task
*workflow {name}     # Run workflow

# Development Commands
npm run dev          # Start development
npm test             # Run tests
npm run lint         # Check code style
npm run build        # Build project
```

### Story-Driven Development

1. **Create a story** - Use `*create-story` to define requirements
2. **Work from stories** - All development starts with a story in `docs/stories/`
3. **Update progress** - Mark checkboxes as tasks complete: `[ ]` --> `[x]`
4. **Track changes** - Maintain the File List section in the story
5. **Follow criteria** - Implement exactly what the acceptance criteria specify

---

## Configuration

### Main Configuration File

The primary configuration is in `.aios-core/core/config/`:

```yaml
# aios.config.yaml
version: 2.1.0
projectName: my-project

features:
  - agents
  - tasks
  - workflows
  - squads
  - quality-gates

ai:
  provider: anthropic
  model: claude-3-opus

environment: development
```

### Environment Variables

```bash
# AI Provider Configuration
ANTHROPIC_API_KEY=your-anthropic-api-key
# or
OPENAI_API_KEY=your-openai-api-key

# Framework Settings
NODE_ENV=development
AIOS_DEBUG=false
```

### IDE Integration

AIOS supports multiple IDEs. Configuration is synchronized across:

- Claude Code (`.claude/`)
- Cursor (`.cursor/`)
- VS Code (`.vscode/`)

```bash
# Sync agents to your IDE
npm run sync:ide
```

---

## Troubleshooting

### Common Issues

**Agent won't activate**

```bash
# Check agent exists
ls .aios-core/development/agents/

# Verify configuration
aios doctor
```

**Task execution fails**

```bash
# Check task definition
cat .aios-core/development/tasks/{task-name}.md

# Run with verbose output
*task {name} --verbose
```

**Memory/context issues**

```bash
# Clear cache
rm -rf .aios-core/core/cache/*

# Rebuild index
aios rebuild
```

### Getting Help

- **GitHub Discussions**: [github.com/SynkraAI/aios-core/discussions](https://github.com/SynkraAI/aios-core/discussions)
- **Issue Tracker**: [github.com/SynkraAI/aios-core/issues](https://github.com/SynkraAI/aios-core/issues)
- **Discord**: [Join our server](https://discord.gg/gk8jAdXWmj)

---

## Next Steps

### Learning Path

1. **Quick Start** - Follow this guide to get up and running
2. **Agent Reference** - Learn about each agent's capabilities: [Agent Reference Guide](../agent-reference-guide.md)
3. **Architecture** - Understand the system: [Architecture Overview](../architecture/ARCHITECTURE-INDEX.md)
4. **Squads** - Extend functionality: [Squads Guide](./squads-guide.md)

### Advanced Topics

- [Quality Gates Guide](./quality-gates.md)
- [Multi-Repo Strategy](../architecture/multi-repo-strategy.md)
- [MCP Integration](./mcp-global-setup.md)
- [IDE Integration](../ide-integration.md)

---

## Best Practices

### 1. Start with Stories

Always create a story before implementing features:

```bash
@aios-master
*create-story
```

### 2. Use the Right Agent

Choose the appropriate agent for each task:

| Task                | Agent      |
| ------------------- | ---------- |
| Write code          | @dev       |
| Review code         | @qa        |
| Design system       | @architect |
| Define requirements | @po        |

### 3. Follow Quality Gates

AIOS implements 3-layer quality gates:

1. **Layer 1 (Local)**: Pre-commit hooks, linting, type checking
2. **Layer 2 (CI/CD)**: Automated tests, CodeRabbit review
3. **Layer 3 (Human)**: Architecture review, final approval

### 4. Keep Context

Maintain context through sessions by:

- Using story-driven development
- Updating progress checkboxes
- Documenting decisions in stories

### 5. Leverage Squads

Don't reinvent the wheel - check for existing squads:

```bash
aios squads search {keyword}
```

---

## Related Documentation

- [Getting Started](../getting-started.md)
- [Installation Guide](../installation/README.md)
- [Agent Reference Guide](../agent-reference-guide.md)
- [Architecture Overview](../architecture/ARCHITECTURE-INDEX.md)
- [Squads Guide](./squads-guide.md)
- [Troubleshooting](../troubleshooting.md)

---

_Synkra AIOS User Guide v4.2.11_
