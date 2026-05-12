# AIOX v4 Quick Start Guide

> 🌐 **EN** | [PT](../pt/installation/v4-quick-start.md) | [ES](../es/installation/v4-quick-start.md)

**Version:** 2.1
**Last Updated:** 2026-01-26
**Time to Complete:** 5 minutes

---

## Prerequisites

Before starting, ensure you have:

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm 9+ installed (`npm --version`)
- [ ] Git installed (`git --version`)
- [ ] GitHub CLI (`gh`) installed and authenticated (`gh auth status`)
- [ ] An AI-powered IDE or Claude Code CLI

---

## Step 1: Install AIOX Core

### Option A: npx Installation Wizard (Recommended)

```bash
# Run the interactive installation wizard
npx aiox-core@latest

# Or create a new project with a specific name
npx aiox-core@latest init my-project
cd my-project
```

### Option B: Clone Repository (Development)

```bash
git clone https://github.com/SynkraAI/aiox-core.git
cd aiox-core
npm install
```

---

## Step 2: Verify Installation

Run the diagnostics command:

```bash
npx aiox-core@latest doctor
```

Or if installed globally:

```bash
aiox doctor
```

### Manual Verification

```bash
# Check core structure exists
ls -la .aiox-core/

# Verify key directories
ls .aiox-core/core/
ls .aiox-core/development/agents/
```

Expected structure:

```
.aiox-core/
├── core/               # Framework core (registry, health-check, orchestration)
├── development/        # Agents, tasks, workflows
├── product/            # Templates, checklists
└── infrastructure/     # Scripts, tools, integrations
```

---

## Step 3: Activate Your First Agent

AIOX uses specialized agents for different tasks. In your AI-powered IDE or Claude Code CLI, type:

```
@aiox-master
```

The agent will greet you and show available commands:

```
🎯 AIOX Master ready!
Type *help to see available commands.
```

### Try These Commands

| Command   | Description                 |
| --------- | --------------------------- |
| `*help`   | Show all available commands |
| `*status` | Show project status         |
| `*agents` | List all available agents   |

---

## Step 4: Explore Available Agents

| Agent               | Activation        | Purpose                         |
| ------------------- | ----------------- | ------------------------------- |
| `@dev` (Dex)        | Development       | Code implementation, debugging  |
| `@qa` (Quinn)       | Quality Assurance | Testing and validation          |
| `@architect` (Aria) | Architecture      | System design and documentation |
| `@pm` (Sage)        | Product Manager   | Requirements and planning       |
| `@devops` (Gage)    | DevOps            | Git push, PR creation, CI/CD    |
| `@po` (Maven)       | Product Owner     | Story creation and backlog      |
| `@sm` (River)       | Scrum Master      | Sprint management               |
| `@analyst` (Nova)   | Business Analyst  | Requirements analysis           |

### Example: Activate Developer Agent

```
@dev
```

The developer agent (Dex) will activate with a greeting showing:

- Project status
- Quick commands
- Agent collaboration options

---

## Step 5: Create Your First Story

Stories drive development in AIOX. Activate the Product Owner and create one:

```
@po *create-story
```

Follow the prompts to define:

1. Story title
2. Description
3. Acceptance criteria
4. Priority

---

## Quick Reference

### Agent Commands

All agent commands use the `*` prefix:

```
*help          # Show help
*status        # Show status
*exit          # Exit current agent
```

### CLI Commands

```bash
# Installation and setup
npx aiox-core@latest           # Run wizard
npx aiox-core@latest doctor    # Run diagnostics
npx aiox-core@latest info      # Show system info

# Development
npm run lint                           # Check code style
npm run typecheck                      # Check TypeScript types
npm test                               # Run unit tests
npm run validate:structure             # Validate AIOX structure
```

### Project Structure

```
your-project/
├── .aiox-core/                    # Framework core
│   ├── core/                      # Core modules
│   │   ├── registry/              # Service registry (200+ workers)
│   │   ├── health-check/          # Health check system
│   │   ├── orchestration/         # Workflow orchestration
│   │   └── quality-gates/         # Quality validation layers
│   ├── development/               # Development assets
│   │   ├── agents/                # Agent definitions (12 agents)
│   │   ├── tasks/                 # Task workflows (~140 tasks)
│   │   └── workflows/             # Multi-step workflows
│   ├── product/                   # Product assets
│   │   ├── templates/             # Document templates
│   │   └── checklists/            # Validation checklists
│   └── infrastructure/            # Infrastructure
│       ├── scripts/               # Utility scripts (~80)
│       ├── integrations/          # PM tool adapters
│       └── templates/             # Config templates
├── .claude/                       # Claude Code configuration
│   ├── commands/AIOX/agents/      # Agent skills
│   └── rules/                     # Agent rules
├── docs/                          # Documentation
│   └── stories/                   # Development stories
└── src/                           # Your source code
```

---

## Next Steps

1. **Read the full guide:** [Getting Started](../getting-started.md)
2. **Understand the architecture:** [Core Architecture](../core-architecture.md)
3. **Learn about agents:** [Agent Definitions](../../.aiox-core/development/agents/)
4. **Join the community:** [Discord](https://discord.gg/gk8jAdXWmj)

---

## Troubleshooting

### "Command not found" errors

```bash
# Ensure Node.js is in PATH
node --version

# Clear npm cache if issues persist
npm cache clean --force
```

### Agent not responding

1. Ensure you're in an AI-powered IDE (Cursor, VS Code with Claude, etc.) or Claude Code CLI
2. Check you're using correct activation syntax: `@agent-name`
3. Verify agent file exists: `ls .aiox-core/development/agents/`

### Permission errors

```bash
# Fix npm permissions (macOS/Linux)
sudo chown -R $(whoami) ~/.npm

# Or use a Node version manager (recommended)
# nvm, fnm, or volta
```

### AIOX structure not found

```bash
# Reinstall AIOX in current project
npx aiox-core@latest install

# Or clone fresh
git clone https://github.com/SynkraAI/aiox-core.git
```

---

## Getting Help

- **Documentation:** [GitHub Repository](https://github.com/SynkraAI/aiox-core)
- **GitHub Issues:** [github.com/SynkraAI/aiox-core/issues](https://github.com/SynkraAI/aiox-core/issues)
- **Discord Community:** [discord.gg/gk8jAdXWmj](https://discord.gg/gk8jAdXWmj)

---

**Welcome to AIOX! Happy coding!**
