# Contributing to Synkra AIOS

> **[Versao em Portugues](docs/pt/contributing.md)**

Welcome to AIOS! Thank you for your interest in contributing. This guide will help you understand our development workflow, contribution process, and how to submit your changes.

## Table of Contents

- [Quick Start](#quick-start)
- [Types of Contributions](#types-of-contributions)
- [Development Workflow](#development-workflow)
- [Contributing Agents](#contributing-agents)
- [Contributing Tasks](#contributing-tasks)
- [Contributing Squads](#contributing-squads)
- [Code Review Process](#code-review-process)
- [Validation System](#validation-system)
- [Branch Protection & PR Requirements](#branch-protection--pr-requirements)
- [Code Standards](#code-standards)
- [Testing Requirements](#testing-requirements)
- [Frequently Asked Questions](#frequently-asked-questions)
- [Getting Help](#getting-help)
- [Working with Pro](#working-with-pro)

---

## Quick Start

### 1. Fork and Clone

```bash
# Fork via GitHub UI, then clone your fork
git clone https://github.com/YOUR_USERNAME/aios-core.git
cd aios-core

# Add upstream remote
git remote add upstream https://github.com/SynkraAI/aios-core.git
```

### 2. Set Up Development Environment

**Prerequisites:**

- Node.js >= 20.0.0
- npm
- Git
- GitHub CLI (`gh`) - optional but recommended

```bash
# Install dependencies
npm install

# Verify setup
npm test
npm run lint
npm run typecheck
```

### 3. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

**Branch Naming Conventions:**
| Prefix | Use For |
|--------|---------|
| `feature/` | New features, agents, tasks |
| `fix/` | Bug fixes |
| `docs/` | Documentation updates |
| `refactor/` | Code refactoring |
| `test/` | Test additions/improvements |

### 4. Make Your Changes

Follow the relevant guide below for your contribution type.

### 5. Run Local Validation

```bash
npm run lint      # Code style
npm run typecheck # Type checking
npm test          # Run tests
npm run build     # Verify build
```

### 6. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub targeting `main` branch.

---

## Types of Contributions

| Contribution      | Description                          | Difficulty  |
| ----------------- | ------------------------------------ | ----------- |
| **Documentation** | Fix typos, improve guides            | Easy        |
| **Bug Fixes**     | Fix reported issues                  | Easy-Medium |
| **Tasks**         | Add new task workflows               | Medium      |
| **Agents**        | Create new AI agent personas         | Medium      |
| **Squads**        | Bundle of agents + tasks + workflows | Advanced    |
| **Core Features** | Framework improvements               | Advanced    |

---

## Development Workflow

### Commit Conventions

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <description>

<optional body>
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Examples:**

```bash
git commit -m "feat(agent): add security-auditor agent"
git commit -m "fix: resolve memory leak in config loader"
git commit -m "docs: update contribution guide"
```

### Pull Request Process

1. **Create PR** targeting `main` branch
2. **Automated checks** run (lint, typecheck, test, build)
3. **CodeRabbit review** provides AI-powered feedback
4. **Maintainer review** - at least 1 approval required
5. **Merge** after all checks pass

---

## Contributing Agents

Agents are AI personas with specific expertise and commands.

### Agent File Location

```
.aios-core/development/agents/your-agent.md
```

### Required Agent Structure

```yaml
agent:
  name: AgentName
  id: agent-id # kebab-case, unique
  title: Descriptive Title
  icon: emoji
  whenToUse: 'When to activate this agent'

persona_profile:
  archetype: Builder | Analyst | Guardian | Operator | Strategist

  communication:
    tone: pragmatic | friendly | formal | analytical
    emoji_frequency: none | low | medium | high

    vocabulary:
      - domain-term-1
      - domain-term-2

    greeting_levels:
      minimal: 'Short greeting'
      named: 'Named greeting with personality'
      archetypal: 'Full archetypal greeting'

    signature_closing: 'Signature phrase'

persona:
  role: "Agent's primary role"
  style: 'Communication style'
  identity: "Agent's identity description"
  focus: 'What the agent focuses on'

  core_principles:
    - Principle 1
    - Principle 2

commands:
  - help: Show available commands
  - custom-command: Command description

dependencies:
  tasks:
    - related-task.md
  tools:
    - tool-name
```

### Agent Contribution Checklist

- [ ] Agent ID is unique and uses kebab-case
- [ ] `persona_profile` is complete with archetype and communication
- [ ] All commands have descriptions
- [ ] Dependencies list all required tasks
- [ ] No hardcoded credentials or sensitive data
- [ ] Follows existing patterns in the codebase

### PR Template for Agents

Use the **Agent Contribution** template when creating your PR.

---

## Contributing Tasks

Tasks are executable workflows that agents can run.

### Task File Location

```
.aios-core/development/tasks/your-task.md
```

### Required Task Structure

```markdown
# Task Name

**Description:** What this task does
**Agent(s):** @dev, @qa, etc.
**Elicit:** true | false

---

## Prerequisites

- Prerequisite 1
- Prerequisite 2

## Steps

### Step 1: First Step

Description of what to do.

**Elicitation Point (if elicit: true):**

- Question to ask user
- Options to present

### Step 2: Second Step

Continue with more steps...

## Deliverables

- [ ] Deliverable 1
- [ ] Deliverable 2

## Error Handling

If X happens, do Y.

---

## Dependencies

- `dependency-1.md`
- `dependency-2.md`
```

### Task Contribution Checklist

- [ ] Task has clear description and purpose
- [ ] Steps are sequential and logical
- [ ] Elicitation points are clear (if applicable)
- [ ] Deliverables are well-defined
- [ ] Error handling guidance included
- [ ] Dependencies exist in the codebase

### PR Template for Tasks

Use the **Task Contribution** template when creating your PR.

---

## Contributing Squads

Squads are bundles of related agents, tasks, and workflows.

### Squad Structure

```
your-squad/
├── manifest.yaml       # Squad metadata
├── agents/
│   └── your-agent.md
├── tasks/
│   └── your-task.md
└── workflows/
    └── your-workflow.yaml
```

### Squad Manifest

```yaml
name: your-squad
version: 1.0.0
description: What this squad does
author: Your Name
dependencies:
  - base-squad (optional)
agents:
  - your-agent
tasks:
  - your-task
```

### Squad Resources

- [Squads Guide](docs/guides/squads-guide.md) - Complete documentation
- [Squad Template](templates/squad/) - Start from a working template
- [Squad Discussions](https://github.com/SynkraAI/aios-core/discussions/categories/ideas) - Share ideas

---

## Code Review Process

### Automated Checks

When you submit a PR, the following checks run automatically:

| Check          | Description            | Required |
| -------------- | ---------------------- | -------- |
| **ESLint**     | Code style and quality | Yes      |
| **TypeScript** | Type checking          | Yes      |
| **Jest Tests** | Test suite (Node 18 & 20) | Yes   |
| **Validation Summary** | Aggregate gate  | Yes      |
| **Build**      | Build verification     | No (advisory) |
| **Coverage**   | Coverage reporting     | No (advisory) |

### CodeRabbit AI Review

[CodeRabbit](https://coderabbit.ai) automatically reviews your PR and provides feedback on:

- Code quality and best practices
- Security concerns
- AIOS-specific patterns (agents, tasks, workflows)
- Performance issues

**Severity Levels:**

| Level        | Action Required                          |
| ------------ | ---------------------------------------- |
| **CRITICAL** | Must fix before merge                    |
| **HIGH**     | Strongly recommended to fix              |
| **MEDIUM**   | Consider fixing or document as tech debt |
| **LOW**      | Optional improvement                     |

**Responding to CodeRabbit:**

- Address CRITICAL and HIGH issues before requesting review
- MEDIUM issues can be documented for follow-up
- LOW issues are informational

### Maintainer Review

After automated checks pass, a maintainer will:

1. Verify changes meet project standards
2. Check for security implications
3. Ensure documentation is updated
4. Approve or request changes

### Merge Requirements

- [ ] All CI checks pass
- [ ] At least 1 maintainer approval
- [ ] All conversations resolved
- [ ] No merge conflicts
- [ ] Branch is up to date with main

---

## Validation System

AIOS implements a **Defense in Depth** strategy with 3 validation layers:

### Layer 1: Pre-commit (Local)

**Performance:** < 5 seconds

- ESLint with cache
- TypeScript incremental compilation
- IDE sync (auto-stages IDE command files)

### Layer 2: Pre-push (Local)

**Performance:** < 2 seconds

- Story checkbox validation
- Status consistency checks

### Layer 3: CI/CD (Cloud)

**Performance:** 2-5 minutes

- Full lint and type checking
- Complete test suite
- Coverage reporting
- Story validation
- Branch protection rules

---

## Branch Protection & PR Requirements

All changes to `main` must go through a Pull Request. Direct pushes are blocked.

### Required Status Checks

All of these must pass before a PR can be merged:

| Check | Description |
|-------|-------------|
| **ESLint** | Code style and quality |
| **TypeScript Type Checking** | No type errors |
| **Jest Tests (Node 18)** | Full test suite on Node 18 |
| **Jest Tests (Node 20)** | Full test suite on Node 20 |
| **Validation Summary** | Aggregate gate |

### PR Review Rules

- **1 approval required** from a CODEOWNERS reviewer
- **Stale reviews are dismissed** when new commits are pushed
- **Conversation resolution required** — all review threads must be resolved
- **CODEOWNERS review required** — changes to critical paths need the designated owner's approval

### CODEOWNERS

Critical paths require approval from `@Pedrovaleriolopez` or `@oalanicolas` (maintainers):

| Path | Why |
|------|-----|
| `.aios-core/core/orchestration/` | Orchestration layer (MasterOrchestrator, GateEvaluator) |
| `.aios-core/core/execution/` | Execution engine (WaveExecutor, ParallelExecutor) |
| `packages/` | Installer, CLI, shared libraries |
| `.github/` | CI/CD workflows, branch protection |
| `.aios-core/core-config.yaml` | Framework configuration |

All other paths require review from any maintainer (`@Pedrovaleriolopez` or `@oalanicolas`).

See [`.github/CODEOWNERS`](.github/CODEOWNERS) for the full ownership map.

### Force Push & Deletions

- **Force push to main:** Blocked
- **Branch deletions:** Blocked
- **Admin bypass:** Disabled (`enforce_admins: true`)

---

## Code Standards

### JavaScript/TypeScript

- ES2022 features
- Prefer `const` over `let`
- Use async/await over promises
- Add JSDoc comments for public APIs
- Follow existing code style

### File Organization

```
.aios-core/
├── development/
│   ├── agents/      # Agent definitions
│   ├── tasks/       # Task workflows
│   └── workflows/   # Multi-step workflows
├── core/            # Core utilities
└── product/
    └── templates/   # Document templates

docs/
├── guides/          # User guides
└── architecture/    # System architecture
```

### ESLint & TypeScript

- Extends: `eslint:recommended`, `@typescript-eslint/recommended`
- Target: ES2022
- Strict mode enabled
- No console.log in production (warnings)

---

## Testing Requirements

### Coverage Requirements

- **Minimum:** 80% coverage (branches, functions, lines, statements)
- **Unit Tests:** Required for all new functions
- **Integration Tests:** Required for workflows

### Running Tests

```bash
npm test                    # Run all tests
npm run test:coverage       # With coverage report
npm run test:watch          # Watch mode
npm test -- path/to/test.js # Specific file
```

### Writing Tests

```javascript
describe('MyModule', () => {
  it('should do something', () => {
    const result = myFunction();
    expect(result).toBe(expected);
  });
});
```

---

## Frequently Asked Questions

### Q: How long does review take?

**A:** We aim for first review within 24-48 hours. Complex changes may take longer.

### Q: Can I contribute without tests?

**A:** Tests are strongly encouraged. For documentation-only changes, tests may not be required.

### Q: What if my PR has conflicts?

**A:** Rebase your branch on latest main:

```bash
git fetch upstream
git rebase upstream/main
git push --force-with-lease
```

### Q: Can I contribute in Portuguese?

**A:** Yes! We accept PRs in Portuguese. See [CONTRIBUTING-PT](docs/pt/contributing.md).

### Q: How do I become a maintainer?

**A:** Consistent, high-quality contributions over time. Start with small fixes and work up to larger features.

### Q: My CI checks are failing. What do I do?

**A:** Check the GitHub Actions logs:

```bash
gh pr checks  # View PR check status
```

Common fixes:

- Run `npm run lint -- --fix` for style issues
- Run `npm run typecheck` to see type errors
- Ensure tests pass locally before pushing

---

## Getting Help

- **GitHub Issues:** [Open an issue](https://github.com/SynkraAI/aios-core/issues)
- **Discussions:** [Start a discussion](https://github.com/SynkraAI/aios-core/discussions)
- **Community:** [COMMUNITY.md](COMMUNITY.md)

---

## Working with Pro

AIOS uses an Open Core model with a private `pro/` git submodule (see [ADR-PRO-001](docs/architecture/adr/adr-pro-001-repository-strategy.md)).

### For Open-Source Contributors

**You do NOT need the pro/ submodule.** The standard clone works perfectly:

```bash
git clone https://github.com/SynkraAI/aios-core.git
cd aios-core
npm install && npm test  # All tests pass without pro/
```

The `pro/` directory will simply not exist in your clone — this is expected and all features, tests, and CI pass without it.

#### Fork Workflow

When forking and syncing with upstream, **do NOT use `--recurse-submodules`**:

```bash
# Fork via GitHub UI, then clone (without submodules)
git clone https://github.com/<your-fork>/aios-core.git
cd aios-core

# Add upstream and sync
git remote add upstream https://github.com/SynkraAI/aios-core.git
git fetch upstream
git rebase upstream/main

# Push (use --force-with-lease after rebase)
git push --force-with-lease origin main
```

> **Submodule push error?** If you see `remote: fatal: did not receive expected object` when pushing after syncing, it means the `pro/` submodule pointer changed upstream and your fork cannot resolve the private reference.
>
> **If your fork already had a successful push before** (existing submodule pointer):
> ```bash
> git checkout origin/main -- pro
> git commit -m "chore: reset pro submodule pointer for fork"
> git push origin main
> ```
>
> **If this is a new fork** (no previous pro pointer on remote):
> ```bash
> git rm --cached pro
> git commit -m "chore: remove pro submodule reference for fork"
> git push origin main
> ```

You can also suppress submodule noise in `git status` locally (these settings are local-only and do not affect remote pushes):

```bash
git config submodule.pro.ignore all
git config submodule.pro.active false
```

### For Team Members (with Pro Access)

```bash
# Clone with submodule
git clone --recurse-submodules https://github.com/SynkraAI/aios-core.git

# Or add to existing clone
git submodule update --init pro
```

**Push order:** Always push `pro/` changes first, then `aios-core`.

### Future: CLI Setup

```bash
# Coming in a future release
aios setup --pro
```

For the complete developer workflow guide, see [Pro Developer Workflow](docs/guides/workflows/pro-developer-workflow.md).

---

## Additional Resources

- [Community Guide](COMMUNITY.md) - How to participate
- [Squads Guide](docs/guides/squads-guide.md) - Create agent teams
- [Architecture](docs/architecture/) - System design
- [Roadmap](ROADMAP.md) - Project direction

---

**Thank you for contributing to Synkra AIOS!**
