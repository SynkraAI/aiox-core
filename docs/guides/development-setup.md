# Development Setup Guide

> **EN** | [PT](../pt/guides/development-setup.md) | [ES](../es/guides/development-setup.md)

---

Complete guide for developers who want to contribute to the Synkra AIOS project.

**Version:** 1.0.0
**Last Updated:** 2026-01-29

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Fork and Clone](#fork-and-clone)
3. [Environment Setup](#environment-setup)
4. [Project Structure](#project-structure)
5. [Running Tests](#running-tests)
6. [Adding New Agents](#adding-new-agents)
7. [Creating New Tasks](#creating-new-tasks)
8. [Creating New Workflows](#creating-new-workflows)
9. [Code Standards](#code-standards)
10. [PR and Code Review Process](#pr-and-code-review-process)
11. [Debug and Troubleshooting](#debug-and-troubleshooting)

---

## Prerequisites

Before starting, ensure you have the following installed:

| Tool           | Minimum Version | Check Command    | Purpose            |
| -------------- | --------------- | ---------------- | ------------------ |
| **Node.js**    | 18.0.0          | `node --version` | JavaScript runtime |
| **npm**        | 9.0.0           | `npm --version`  | Package manager    |
| **Git**        | 2.30+           | `git --version`  | Version control    |
| **GitHub CLI** | 2.0+            | `gh --version`   | GitHub operations  |

### Recommended Tools

| Tool                 | Purpose                                 |
| -------------------- | --------------------------------------- |
| **Claude Code**      | AI-powered development with AIOS agents |
| **VS Code / Cursor** | IDE with AIOS integration               |
| **Docker Desktop**   | MCP servers and containerized tools     |

### Installing Prerequisites

**macOS (Homebrew):**

```bash
# Install Node.js
brew install node@18

# Install GitHub CLI
brew install gh

# Authenticate GitHub CLI
gh auth login
```

**Windows (Chocolatey):**

```bash
# Install Node.js
choco install nodejs-lts

# Install GitHub CLI
choco install gh

# Authenticate GitHub CLI
gh auth login
```

**Linux (Ubuntu/Debian):**

```bash
# Install Node.js via NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install GitHub CLI
sudo apt install gh

# Authenticate GitHub CLI
gh auth login
```

---

## Fork and Clone

### Step 1: Fork the Repository

1. Navigate to [github.com/SynkraAI/aios-core](https://github.com/SynkraAI/aios-core)
2. Click the **Fork** button in the top-right corner
3. Select your GitHub account as the destination

### Step 2: Clone Your Fork

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/aios-core.git
cd aios-core

# Add upstream remote
git remote add upstream https://github.com/SynkraAI/aios-core.git

# Verify remotes
git remote -v
# origin    https://github.com/YOUR_USERNAME/aios-core.git (fetch)
# origin    https://github.com/YOUR_USERNAME/aios-core.git (push)
# upstream  https://github.com/SynkraAI/aios-core.git (fetch)
# upstream  https://github.com/SynkraAI/aios-core.git (push)
```

### Step 3: Stay Updated

```bash
# Fetch latest changes from upstream
git fetch upstream

# Merge upstream main into your local main
git checkout main
git merge upstream/main

# Push to your fork
git push origin main
```

---

## Environment Setup

### Step 1: Install Dependencies

```bash
# Install all dependencies
npm install

# This will also:
# - Set up Husky git hooks (via prepare script)
# - Install workspace dependencies
```

### Step 2: Environment Variables

Create a `.env` file in the project root (this file is gitignored):

```bash
# AI Provider Configuration
ANTHROPIC_API_KEY=your-anthropic-api-key

# Optional: OpenAI fallback
OPENAI_API_KEY=your-openai-api-key

# Framework Settings
NODE_ENV=development
AIOS_DEBUG=false

# Optional: MCP Configuration
SYNKRA_API_TOKEN=your-synkra-token
```

### Step 3: Verify Installation

```bash
# Run the test suite
npm test

# Check linting
npm run lint

# Check TypeScript
npm run typecheck

# Validate project structure
npm run validate:structure
```

### Step 4: IDE Integration (Optional)

Sync AIOS agents to your IDE:

```bash
# Sync to all supported IDEs
npm run sync:ide

# Sync to specific IDE
npm run sync:ide:cursor
npm run sync:ide:windsurf

# Validate sync
npm run sync:ide:validate
```

---

## Project Structure

Understanding the `aios-core` directory structure:

```
aios-core/
├── .aios-core/                    # Framework source (committed)
│   ├── core/                      # Core utilities and config
│   │   ├── config/                # Framework configuration files
│   │   ├── docs/                  # Internal documentation
│   │   └── registry/              # Component registry
│   │
│   ├── development/               # Development assets
│   │   ├── agents/                # Agent definitions (*.md)
│   │   ├── checklists/            # Validation checklists
│   │   ├── scripts/               # Utility scripts (JS)
│   │   ├── tasks/                 # Task workflows (*.md)
│   │   └── workflows/             # Multi-step workflows (*.yaml)
│   │
│   ├── infrastructure/            # Build and deployment
│   │   ├── scripts/               # IDE sync, validation
│   │   └── config/                # Infrastructure config
│   │
│   └── product/                   # Product assets
│       ├── templates/             # Document templates
│       └── checklists/            # Product checklists
│
├── .claude/                       # Claude Code configuration
│   ├── commands/AIOS/agents/      # Agent skill commands
│   ├── hooks/                     # Governance hooks
│   └── rules/                     # AI behavior rules
│
├── bin/                           # CLI entry points
│   ├── aios.js                    # Main CLI
│   └── aios-minimal.js            # Minimal CLI
│
├── docs/                          # All documentation
│   ├── architecture/              # System architecture
│   ├── guides/                    # User and dev guides
│   ├── migration/                 # Migration guides
│   ├── prd/                       # Product requirements
│   └── stories/                   # Development stories
│
├── packages/                      # Monorepo packages
│   └── */                         # Individual packages
│
├── scripts/                       # Build and utility scripts
│
├── squads/                        # Local squad definitions
│
├── src/                           # Source code
│
├── tests/                         # Test suites
│   ├── health-check/              # Health check tests
│   └── unit/                      # Unit tests
│
├── tools/                         # CLI and utility tools
│
├── package.json                   # Project manifest
├── tsconfig.json                  # TypeScript config
├── eslint.config.mjs              # ESLint config
└── jest.config.js                 # Jest config
```

### Key Directories

| Directory                           | Purpose                      | When to Modify          |
| ----------------------------------- | ---------------------------- | ----------------------- |
| `.aios-core/development/agents/`    | Agent personas and behaviors | Adding/modifying agents |
| `.aios-core/development/tasks/`     | Executable task workflows    | Adding/modifying tasks  |
| `.aios-core/development/workflows/` | Multi-step orchestrations    | Creating workflows      |
| `.claude/rules/`                    | AI behavior rules            | Adding constraints      |
| `docs/stories/`                     | Development stories          | Working on features     |
| `src/`                              | Framework source code        | Core functionality      |
| `tests/`                            | Test suites                  | All changes             |

---

## Running Tests

### Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run health check tests
npm run test:health-check
```

### Test Structure

```
tests/
├── health-check/           # Integration tests
│   └── *.test.js           # Health check test files
├── unit/                   # Unit tests
│   └── *.test.js           # Unit test files
└── fixtures/               # Test fixtures and mocks
```

### Writing Tests

**Unit Test Example:**

```javascript
// tests/unit/example.test.js
const { describe, it, expect } = require('@jest/globals');

describe('ComponentName', () => {
  describe('methodName', () => {
    it('should handle expected input', () => {
      const result = myFunction('input');
      expect(result).toBe('expected');
    });

    it('should throw on invalid input', () => {
      expect(() => myFunction(null)).toThrow('Invalid input');
    });
  });
});
```

### Running Specific Tests

```bash
# Run tests matching pattern
npm test -- --testPathPattern="agent"

# Run single test file
npm test -- tests/unit/agent.test.js

# Run with verbose output
npm test -- --verbose
```

---

## Adding New Agents

Agents are AI personas that provide specialized capabilities. Each agent is defined in a Markdown file with YAML frontmatter.

### Step 1: Plan Your Agent

| Aspect            | Questions to Answer                          |
| ----------------- | -------------------------------------------- |
| **Purpose**       | What specific problem does this agent solve? |
| **Expertise**     | What domain knowledge should the agent have? |
| **Commands**      | What actions can the agent perform?          |
| **Collaboration** | Which other agents does it work with?        |

### Step 2: Create Agent File

Create a new file in `.aios-core/development/agents/`:

```bash
# File: .aios-core/development/agents/my-agent.md
```

### Step 3: Agent Template

````markdown
# my-agent

ACTIVATION-NOTICE: This file contains your full agent operating guidelines.

## COMPLETE AGENT DEFINITION FOLLOWS

```yaml
agent:
  name: AgentName
  id: my-agent
  title: Agent Role Title
  icon: emoji
  whenToUse: 'Short description of when to use this agent'

persona_profile:
  archetype: ArchetypeType # Builder, Guardian, Orchestrator, etc.

  communication:
    tone: professional # pragmatic, analytical, friendly, etc.
    emoji_frequency: medium # low, medium, high

    vocabulary:
      - domain-specific
      - terms
      - here

    greeting_levels:
      minimal: 'icon Agent ready'
      named: 'icon AgentName ready!'
      archetypal: 'icon AgentName the Archetype ready!'

    signature_closing: '-- AgentName, closing phrase'

persona:
  role: Expert description
  style: Communication style description
  identity: Core identity statement
  focus: Primary focus area

core_principles:
  - Principle 1
  - Principle 2
  - Principle 3

commands:
  - name: help
    visibility: [full, quick, key]
    description: 'Show all available commands'
  - name: my-command
    visibility: [full, quick]
    description: 'Description of what this command does'

dependencies:
  tasks:
    - relevant-task.md
  checklists:
    - relevant-checklist.md
  tools:
    - tool-name
```
````

---

## Quick Commands

**Core Commands:**

- `*help` - Show all commands
- `*my-command` - Execute custom command
- `*exit` - Exit agent mode

**Collaboration:**

- Works with: @other-agent
- Delegates to: @specialist-agent

---

````

### Step 4: Add Dependencies

If your agent uses tasks or checklists, ensure they exist:

```yaml
dependencies:
  tasks:
    - my-agent-task.md       # Create in .aios-core/development/tasks/
  checklists:
    - my-agent-checklist.md  # Create in .aios-core/development/checklists/
  tools:
    - git
    - context7
````

### Step 5: Sync to IDEs

```bash
# Sync new agent to all IDEs
npm run sync:ide

# Verify sync
npm run sync:ide:validate
```

---

## Creating New Tasks

Tasks are executable workflows that agents use to perform actions.

### Step 1: Plan Your Task

| Aspect         | Description                     |
| -------------- | ------------------------------- |
| **Purpose**    | What does this task accomplish? |
| **Inputs**     | What data does it need?         |
| **Outputs**    | What does it produce?           |
| **Steps**      | What is the execution flow?     |
| **Validation** | How do we know it succeeded?    |

### Step 2: Create Task File

Create a new file in `.aios-core/development/tasks/`:

```bash
# Naming conventions:
# Agent-specific: {agent-id}-{task-name}.md
# Shared: {task-name}.md

# Examples:
# .aios-core/development/tasks/dev-build-component.md  (dev agent)
# .aios-core/development/tasks/create-doc.md          (shared)
```

### Step 3: Task Template

````markdown
---
## Execution Modes

**Choose your execution mode:**

### 1. YOLO Mode - Fast, Autonomous (0-1 prompts)
- Autonomous decision making with logging
- Minimal user interaction
- **Best for:** Simple, deterministic tasks

### 2. Interactive Mode - Balanced, Educational (5-10 prompts) **[DEFAULT]**
- Explicit decision checkpoints
- Educational explanations
- **Best for:** Learning, complex decisions

### 3. Pre-Flight Planning - Comprehensive Upfront Planning
- Task analysis phase (identify all ambiguities)
- Zero ambiguity execution
- **Best for:** Ambiguous requirements, critical work

---

## Task Definition (AIOS Task Format V1.0)

```yaml
task: myTaskFunction()
responsável: AgentName
responsavel_type: Agente
atomic_layer: Config

**Entrada:**
- campo: inputName
  tipo: string
  origem: User Input
  obrigatório: true
  validação: Must be non-empty

**Saída:**
- campo: outputName
  tipo: string
  destino: File system
  persistido: true
```
````

---

## Pre-Conditions

```yaml
pre-conditions:
  - [ ] Required inputs provided
    blocker: true
```

---

## Post-Conditions

```yaml
post-conditions:
  - [ ] Task completed successfully
    blocker: true
```

---

# Task Title

## Purpose

Clear description of what this task accomplishes.

## Prerequisites

- Prerequisite 1
- Prerequisite 2

## Interactive Elicitation Process

### Step 1: Gather Information

```
ELICIT: Information Collection
1. What is the input?
2. What is the expected output?
```

### Step 2: Validate

```
ELICIT: Validation
1. Is the input valid?
2. Are all dependencies available?
```

## Implementation Steps

1. **Step One Title**
   - Action description
   - Code example if needed

2. **Step Two Title**
   - Action description

3. **Step Three Title**
   - Action description

## Validation Checklist

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Error Handling

- If X fails: Do Y
- If Z is missing: Prompt for input

## Success Output

```
Task completed successfully!
Output: {output}
```

````

### Step 4: Reference in Agent

Add the task to your agent's dependencies:

```yaml
dependencies:
  tasks:
    - my-new-task.md
````

---

## Creating New Workflows

Workflows orchestrate multiple agents and tasks for complex operations.

### Step 1: Plan Your Workflow

| Aspect          | Description               |
| --------------- | ------------------------- |
| **Goal**        | What is the end result?   |
| **Stages**      | What phases does it have? |
| **Agents**      | Which agents participate? |
| **Transitions** | How do stages connect?    |

### Step 2: Create Workflow File

Create a new file in `.aios-core/development/workflows/`:

```bash
# File: .aios-core/development/workflows/my-workflow.yaml
```

### Step 3: Workflow Template

```yaml
workflow:
  id: my-workflow
  name: My Workflow Name
  description: |
    Detailed description of what this workflow accomplishes
    and when it should be used.
  type: development # development, deployment, analysis
  scope: fullstack # ui, service, fullstack

stages:
  - id: stage-1-planning
    name: Planning Phase
    description: Initial planning and requirements gathering
    agent: pm
    tasks:
      - create-story
    outputs:
      - Story file created
      - Requirements documented
    next: stage-2-design

  - id: stage-2-design
    name: Design Phase
    description: Architecture and technical design
    agent: architect
    tasks:
      - analyze-impact
    outputs:
      - Architecture document
      - Technical specifications
    next: stage-3-implement

  - id: stage-3-implement
    name: Implementation Phase
    description: Code implementation
    agent: dev
    tasks:
      - develop-story
    outputs:
      - Source code
      - Unit tests
    next: stage-4-review

  - id: stage-4-review
    name: Review Phase
    description: Quality assurance
    agent: qa
    tasks:
      - code-review
    outputs:
      - Review feedback
      - Test results
    next: null # End of workflow

transitions:
  - from: stage-1-planning
    to: stage-2-design
    condition: "Story status is 'Ready for Design'"

  - from: stage-2-design
    to: stage-3-implement
    condition: 'Architecture approved'

  - from: stage-3-implement
    to: stage-4-review
    condition: 'All tests passing'

resources:
  templates:
    - story-template.md
    - architecture-template.md
  data:
    - project-config.yaml

validation:
  checkpoints:
    - stage: stage-1-planning
      criteria: 'Story file exists and is valid'
    - stage: stage-3-implement
      criteria: 'All acceptance criteria implemented'
    - stage: stage-4-review
      criteria: 'Code review approved'

metadata:
  version: 1.0.0
  author: Your Name
  created: 2026-01-29
  tags:
    - development
    - feature
```

---

## Code Standards

### ESLint Configuration

The project uses ESLint 9 with flat config:

```bash
# Run linting
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix
```

**Key Rules:**

- No unused variables (error)
- Consistent spacing and formatting
- No console.log in production code (warn)
- Prefer const over let

### TypeScript Configuration

```bash
# Run type checking
npm run typecheck
```

**tsconfig.json Key Settings:**

- `strict: true` - Full type safety
- `noEmit: true` - Type checking only (no compilation)
- `esModuleInterop: true` - CommonJS/ES module compatibility

### Prettier Formatting

```bash
# Format all Markdown files
npm run format
```

### Naming Conventions

| Type          | Convention  | Example                     |
| ------------- | ----------- | --------------------------- |
| **Files**     | kebab-case  | `my-component.js`           |
| **Classes**   | PascalCase  | `MyComponent`               |
| **Functions** | camelCase   | `myFunction`                |
| **Constants** | UPPER_SNAKE | `MAX_RETRIES`               |
| **Agents**    | kebab-case  | `dev`, `qa`, `architect`    |
| **Tasks**     | kebab-case  | `create-story`, `dev-build` |

### Commit Conventions

Use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Feature
git commit -m "feat: add new agent validation"

# Bug fix
git commit -m "fix: resolve task execution error"

# Documentation
git commit -m "docs: update development guide"

# Chore (maintenance)
git commit -m "chore: update dependencies"

# With scope
git commit -m "feat(agents): add data-engineer agent"
git commit -m "fix(tasks): handle missing input gracefully"
```

### Pre-commit Hooks

Husky runs these checks before each commit:

1. **lint-staged**: Runs ESLint and Prettier on staged files
2. **IDE sync**: Updates IDE configurations if agents changed

---

## PR and Code Review Process

### Step 1: Create Feature Branch

```bash
# Create branch from main
git checkout main
git pull upstream main
git checkout -b feat/my-feature

# Or for fixes
git checkout -b fix/bug-description
```

### Step 2: Make Changes

Follow the story-driven development approach:

1. Check for existing story or create one
2. Implement changes following story tasks
3. Update story checkboxes as you progress
4. Add tests for new functionality
5. Update documentation if needed

### Step 3: Run Quality Checks

```bash
# Run all checks
npm test
npm run lint
npm run typecheck

# Validate structure
npm run validate:structure
```

### Step 4: Commit and Push

```bash
# Stage changes
git add -A

# Commit with conventional message
git commit -m "feat: implement my feature"

# Push to your fork
git push origin feat/my-feature
```

### Step 5: Create Pull Request

```bash
# Using GitHub CLI
gh pr create --title "feat: implement my feature" --body "$(cat <<'EOF'
## Summary
- Added feature X
- Updated component Y

## Test plan
- [ ] Unit tests pass
- [ ] Manual testing completed
- [ ] Documentation updated

Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

### Code Review Guidelines

**As Author:**

- Keep PRs focused and small (< 500 lines when possible)
- Provide clear description and context
- Respond to feedback promptly
- Request re-review after changes

**As Reviewer:**

- Review within 24 hours
- Be constructive and specific
- Approve when satisfied or request changes
- Use GitHub suggestions for small fixes

### Merge Requirements

| Requirement            | Description                     |
| ---------------------- | ------------------------------- |
| **Tests pass**         | All CI tests must pass          |
| **Lint clean**         | No ESLint errors                |
| **Types valid**        | TypeScript compilation succeeds |
| **Review approved**    | At least one approval           |
| **Conflicts resolved** | No merge conflicts              |

---

## Debug and Troubleshooting

### Enable Debug Mode

```bash
# Set environment variable
export AIOS_DEBUG=true

# Run with debug output
npm test -- --verbose
```

### View Agent Logs

```bash
# Check agent execution logs
ls -la .aios/logs/

# Tail agent log
tail -f .aios/logs/agent.log
```

### Common Issues

#### Issue: Tests failing locally but passing in CI

**Cause:** Environment differences or stale cache

**Solution:**

```bash
# Clear Jest cache
npx jest --clearCache

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules
npm install
```

#### Issue: ESLint errors after pulling changes

**Cause:** ESLint cache is stale

**Solution:**

```bash
# Clear ESLint cache
rm .eslintcache

# Run lint again
npm run lint
```

#### Issue: TypeScript errors in IDE but not in CLI

**Cause:** IDE TypeScript version mismatch

**Solution:**

```bash
# Force IDE to use project TypeScript
# In VS Code: Ctrl+Shift+P -> "TypeScript: Select TypeScript Version" -> "Use Workspace Version"
```

#### Issue: Agent not activating

**Cause:** Agent file syntax error or missing dependencies

**Solution:**

```bash
# Validate agent file YAML
npx js-yaml .aios-core/development/agents/my-agent.md

# Check dependencies exist
ls .aios-core/development/tasks/my-task.md
```

#### Issue: IDE not showing agent commands

**Cause:** IDE sync not run or failed

**Solution:**

```bash
# Run sync
npm run sync:ide

# Validate sync
npm run sync:ide:validate

# Check IDE-specific directory
ls .cursor/  # For Cursor
ls .windsurf/  # For Windsurf
```

#### Issue: Pre-commit hooks not running

**Cause:** Husky not installed properly

**Solution:**

```bash
# Reinstall Husky
npm run prepare

# Verify hooks exist
ls -la .husky/
```

### Debugging Workflow Execution

```bash
# Trace workflow execution
AIOS_DEBUG=true npm run trace -- workflow-name

# Check workflow state
cat .aios/state/workflow-state.json
```

### Performance Profiling

```bash
# Profile test execution
npm test -- --detectOpenHandles

# Check for memory leaks
node --inspect node_modules/.bin/jest
```

---

## Getting Help

### Resources

- **GitHub Discussions:** [github.com/SynkraAI/aios-core/discussions](https://github.com/SynkraAI/aios-core/discussions)
- **Issue Tracker:** [github.com/SynkraAI/aios-core/issues](https://github.com/SynkraAI/aios-core/issues)
- **Discord:** [discord.gg/gk8jAdXWmj](https://discord.gg/gk8jAdXWmj)

### Issue Labels

| Label              | Use Case                   |
| ------------------ | -------------------------- |
| `bug`              | Something is broken        |
| `feature`          | New functionality request  |
| `documentation`    | Documentation improvements |
| `good-first-issue` | Good for newcomers         |
| `help-wanted`      | Community help appreciated |

### Contact Maintainers

- See `CODEOWNERS` file for module ownership
- Tag `@SynkraAI/core-team` for urgent issues

---

## Related Documentation

- [User Guide](./user-guide.md) - End-user documentation
- [Architecture Overview](../architecture/ARCHITECTURE-INDEX.md) - System design
- [Contributing Squads](./contributing-squads.md) - Squad development
- [Quality Gates Guide](./quality-gates.md) - Quality assurance
- [MCP Global Setup](./mcp-global-setup.md) - MCP configuration

---

_Synkra AIOS Development Setup Guide v1.0.0_
_Last Updated: 2026-01-29_
