# AIOS API Reference

> **EN** | [PT](../pt/guides/api-reference.md) | [ES](../es/guides/api-reference.md)

---

Complete API reference for Synkra AIOS - the AI-Orchestrated System for Full Stack Development.

**Version:** 2.1.0
**Last Updated:** 2026-01-29

---

## Table of Contents

1. [Overview](#overview)
2. [Agent Activation](#agent-activation)
3. [Command Reference](#command-reference)
4. [Agent-Specific Commands](#agent-specific-commands)
5. [Workflow API](#workflow-api)
6. [Parameters and Options](#parameters-and-options)
7. [Return Codes and Errors](#return-codes-and-errors)
8. [IDE Integration](#ide-integration)
9. [Examples](#examples)

---

## Overview

### API Architecture

AIOS provides a unified API for interacting with specialized AI agents through two primary mechanisms:

1. **Agent Activation** - Using `@` prefix to activate specialized agents
2. **Command Execution** - Using `*` prefix to execute agent commands

```
┌─────────────────────────────────────────────────────────────┐
│                      AIOS API Layer                          │
├─────────────────────────────────────────────────────────────┤
│  @agent         →  Activates agent persona                   │
│  *command       →  Executes agent command                    │
│  *command args  →  Executes command with arguments           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Agent Resolution                          │
├─────────────────────────────────────────────────────────────┤
│  .aios-core/development/agents/{agent-id}.md                 │
│  Dependencies: tasks, templates, checklists, scripts         │
└─────────────────────────────────────────────────────────────┘
```

### Core Principles

| Principle                   | Description                                                    |
| --------------------------- | -------------------------------------------------------------- |
| **Task-First**              | Everything is a task. User requests resolve to task execution. |
| **Agent Specialization**    | Each agent has a defined scope and responsibility              |
| **Declarative Commands**    | Commands describe intent, agents handle execution              |
| **Progressive Enhancement** | Simple commands expand to complex workflows                    |

---

## Agent Activation

### Syntax

```
@{agent-id}
@{agent-id} *{command}
@{agent-id} *{command} {arguments}
```

### Available Agents

| Agent ID         | Name   | Archetype    | Primary Responsibility                   |
| ---------------- | ------ | ------------ | ---------------------------------------- |
| `@dev`           | Dex    | Builder      | Code implementation, debugging, testing  |
| `@qa`            | Quinn  | Guardian     | Quality assurance, code review, testing  |
| `@architect`     | Aria   | Visionary    | System architecture, API design          |
| `@pm`            | Morgan | Strategist   | Product requirements, epics, strategy    |
| `@po`            | Pax    | Champion     | Backlog management, acceptance criteria  |
| `@sm`            | River  | Facilitator  | Sprint planning, story creation          |
| `@analyst`       | Atlas  | Explorer     | Market research, competitive analysis    |
| `@data-engineer` | Dara   | Architect    | Database schema, migrations, queries     |
| `@devops`        | Gage   | Optimizer    | CI/CD, deployment, git operations        |
| `@ux-expert`     | Uma    | Creator      | UI/UX design, wireframes                 |
| `@aios-master`   | Orion  | Orchestrator | Framework orchestration, meta-operations |

### Activation Behavior

When an agent is activated:

1. Agent definition file is loaded from `.aios-core/development/agents/{id}.md`
2. Persona is adopted (tone, vocabulary, greeting)
3. Context greeting is displayed based on session type
4. Agent halts and awaits user input

```bash
# Activate developer agent
@dev

# Output:
# 💻 Dex (Builder) ready. Let's build something great!
#
# **Quick Commands:**
# - *develop {story-id} - Implement story tasks
# - *run-tests - Execute linting and tests
# - *help - Show all commands
```

### Activation with Command

You can activate an agent and execute a command in one step:

```bash
@dev *develop story-1.2.3
@qa *review story-1.2.3
@architect *create-full-stack-architecture
```

---

## Command Reference

### Universal Commands

These commands are available across all agents:

| Command         | Description                    | Example         |
| --------------- | ------------------------------ | --------------- |
| `*help`         | Show all available commands    | `*help`         |
| `*guide`        | Show comprehensive usage guide | `*guide`        |
| `*session-info` | Show current session details   | `*session-info` |
| `*exit`         | Exit current agent mode        | `*exit`         |
| `*yolo`         | Toggle confirmation skipping   | `*yolo`         |

### Command Syntax

```
*{command}
*{command} {positional-argument}
*{command} {arg1} {arg2}
*{command} --{flag}
*{command} --{option}={value}
```

### Command Resolution

Commands resolve to task files in the agent's dependencies:

```
*develop story-1.2.3
    │
    ▼
.aios-core/development/tasks/dev-develop-story.md
    │
    ▼
Task execution with arguments: { story: "story-1.2.3" }
```

---

## Agent-Specific Commands

### @dev (Developer)

**Story Development:**

| Command                | Arguments    | Description                                                 |
| ---------------------- | ------------ | ----------------------------------------------------------- |
| `*develop`             | `{story-id}` | Implement story tasks (modes: yolo, interactive, preflight) |
| `*develop-yolo`        | `{story-id}` | Autonomous development mode                                 |
| `*develop-interactive` | `{story-id}` | Interactive development mode (default)                      |
| `*develop-preflight`   | `{story-id}` | Planning mode before implementation                         |

**Subtask Execution (ADE):**

| Command            | Arguments      | Description                                           |
| ------------------ | -------------- | ----------------------------------------------------- |
| `*execute-subtask` | `{subtask-id}` | Execute single subtask (13-step Coder Agent workflow) |
| `*verify-subtask`  | `{subtask-id}` | Verify subtask completion                             |

**Recovery System:**

| Command          | Arguments      | Description                  |
| ---------------- | -------------- | ---------------------------- |
| `*track-attempt` | `{subtask-id}` | Track implementation attempt |
| `*rollback`      | `[--hard]`     | Rollback to last good state  |

**Build Operations:**

| Command             | Arguments    | Description                        |
| ------------------- | ------------ | ---------------------------------- |
| `*build`            | `{story-id}` | Complete autonomous build pipeline |
| `*build-autonomous` | `{story-id}` | Start autonomous build loop        |
| `*build-resume`     | `{story-id}` | Resume build from checkpoint       |
| `*build-status`     | `[--all]`    | Show build status                  |
| `*build-log`        | `{story-id}` | View build attempt log             |

**Quality & Debt:**

| Command           | Arguments | Description                   |
| ----------------- | --------- | ----------------------------- |
| `*run-tests`      | -         | Execute linting and all tests |
| `*apply-qa-fixes` | -         | Apply QA feedback and fixes   |
| `*backlog-debt`   | `{title}` | Register technical debt item  |

**Worktree Isolation:**

| Command             | Arguments    | Description                 |
| ------------------- | ------------ | --------------------------- |
| `*worktree-create`  | `{story-id}` | Create isolated worktree    |
| `*worktree-list`    | -            | List active worktrees       |
| `*worktree-merge`   | `{story-id}` | Merge worktree back to base |
| `*worktree-cleanup` | -            | Remove completed worktrees  |

**Memory Layer:**

| Command             | Arguments                       | Description              |
| ------------------- | ------------------------------- | ------------------------ |
| `*capture-insights` | -                               | Capture session insights |
| `*list-gotchas`     | -                               | List known gotchas       |
| `*gotcha`           | `{title} - {description}`       | Add gotcha manually      |
| `*gotchas`          | `[--category X] [--severity Y]` | List and search gotchas  |

---

### @qa (Quality Assurance)

**Code Review:**

| Command         | Arguments    | Description                                  |
| --------------- | ------------ | -------------------------------------------- |
| `*code-review`  | `{scope}`    | Run automated review (uncommitted/committed) |
| `*review`       | `{story-id}` | Comprehensive story review                   |
| `*review-build` | `{story-id}` | 10-phase structured QA review                |

**Quality Gates:**

| Command         | Arguments    | Description                          |
| --------------- | ------------ | ------------------------------------ |
| `*gate`         | `{story-id}` | Create quality gate decision         |
| `*nfr-assess`   | `{story-id}` | Validate non-functional requirements |
| `*risk-profile` | `{story-id}` | Generate risk assessment matrix      |

**Enhanced Validation:**

| Command                | Arguments    | Description                             |
| ---------------------- | ------------ | --------------------------------------- |
| `*validate-libraries`  | `{story-id}` | Validate third-party library usage      |
| `*security-check`      | `{story-id}` | Run 8-point security vulnerability scan |
| `*validate-migrations` | `{story-id}` | Validate database migrations            |
| `*evidence-check`      | `{story-id}` | Verify evidence-based QA requirements   |
| `*console-check`       | `{story-id}` | Browser console error detection         |

**Fix Requests:**

| Command               | Arguments    | Description                         |
| --------------------- | ------------ | ----------------------------------- |
| `*create-fix-request` | `{story-id}` | Generate QA_FIX_REQUEST.md for @dev |

**Test Strategy:**

| Command          | Arguments    | Description                                 |
| ---------------- | ------------ | ------------------------------------------- |
| `*test-design`   | `{story-id}` | Create comprehensive test scenarios         |
| `*trace`         | `{story-id}` | Map requirements to tests (Given-When-Then) |
| `*critique-spec` | `{story-id}` | Review specification for completeness       |

---

### @architect (Architect)

**Architecture Design:**

| Command                           | Arguments | Description                        |
| --------------------------------- | --------- | ---------------------------------- |
| `*create-full-stack-architecture` | -         | Complete system architecture       |
| `*create-backend-architecture`    | -         | Backend architecture design        |
| `*create-front-end-architecture`  | -         | Frontend architecture design       |
| `*create-brownfield-architecture` | -         | Architecture for existing projects |

**Documentation & Analysis:**

| Command                      | Arguments     | Description                      |
| ---------------------------- | ------------- | -------------------------------- |
| `*document-project`          | -             | Generate project documentation   |
| `*execute-checklist`         | `{checklist}` | Run architecture checklist       |
| `*research`                  | `{topic}`     | Generate deep research prompt    |
| `*analyze-project-structure` | -             | Analyze project for new features |

**ADE Pipeline:**

| Command              | Arguments    | Description                        |
| -------------------- | ------------ | ---------------------------------- |
| `*assess-complexity` | `{story-id}` | Assess story complexity and effort |
| `*create-plan`       | `{story-id}` | Create implementation plan         |
| `*create-context`    | `{story-id}` | Generate project context           |
| `*map-codebase`      | -            | Generate codebase map              |

---

### @pm (Product Manager)

**Document Creation:**

| Command                  | Arguments | Description                          |
| ------------------------ | --------- | ------------------------------------ |
| `*create-prd`            | -         | Create product requirements document |
| `*create-brownfield-prd` | -         | Create PRD for existing projects     |
| `*create-epic`           | -         | Create epic for brownfield           |
| `*create-story`          | -         | Create user story                    |

**Documentation Operations:**

| Command      | Arguments | Description                  |
| ------------ | --------- | ---------------------------- |
| `*doc-out`   | -         | Output complete document     |
| `*shard-prd` | -         | Break PRD into smaller parts |

**ADE Pipeline:**

| Command                | Arguments | Description                           |
| ---------------------- | --------- | ------------------------------------- |
| `*gather-requirements` | -         | Elicit requirements from stakeholders |
| `*write-spec`          | -         | Generate formal specification         |

---

### @sm (Scrum Master)

**Story Management:**

| Command              | Arguments    | Description                 |
| -------------------- | ------------ | --------------------------- |
| `*create-next-story` | -            | Create next user story      |
| `*validate-story`    | `{story-id}` | Validate story completeness |
| `*manage-backlog`    | -            | Manage story backlog        |

---

### @analyst (Analyst)

**Research:**

| Command                 | Arguments   | Description                           |
| ----------------------- | ----------- | ------------------------------------- |
| `*brainstorm`           | `{topic}`   | Facilitate brainstorming session      |
| `*research-deps`        | `{topic}`   | Research dependencies and constraints |
| `*competitive-analysis` | `{company}` | Perform competitive analysis          |
| `*market-research`      | `{topic}`   | Conduct market research               |

**ADE Pipeline:**

| Command             | Arguments | Description                         |
| ------------------- | --------- | ----------------------------------- |
| `*extract-patterns` | -         | Extract code patterns from codebase |

---

### @devops (DevOps)

**Git Operations:**

| Command      | Arguments     | Description            |
| ------------ | ------------- | ---------------------- |
| `*push`      | `[--force]`   | Push changes to remote |
| `*create-pr` | `{title}`     | Create pull request    |
| `*merge-pr`  | `{pr-number}` | Merge pull request     |

**Worktree Management:**

| Command              | Arguments    | Description                  |
| -------------------- | ------------ | ---------------------------- |
| `*create-worktree`   | `{story-id}` | Create isolated Git worktree |
| `*list-worktrees`    | -            | List active worktrees        |
| `*merge-worktree`    | `{story-id}` | Merge worktree to main       |
| `*cleanup-worktrees` | -            | Remove stale worktrees       |

**Migration Management:**

| Command             | Arguments    | Description                  |
| ------------------- | ------------ | ---------------------------- |
| `*inventory-assets` | -            | Generate migration inventory |
| `*analyze-paths`    | -            | Analyze path dependencies    |
| `*migrate-agent`    | `{agent-id}` | Migrate single agent         |
| `*migrate-batch`    | -            | Batch migrate all agents     |

---

### @aios-master (Orchestrator)

**Framework Development:**

| Command                | Arguments       | Description                                 |
| ---------------------- | --------------- | ------------------------------------------- |
| `*create`              | `{type} {name}` | Create AIOS component (agent/task/workflow) |
| `*modify`              | `{type} {name}` | Modify existing component                   |
| `*validate-component`  | `{name}`        | Validate component security                 |
| `*deprecate-component` | `{name}`        | Deprecate with migration path               |

**Task Execution:**

| Command              | Arguments         | Description           |
| -------------------- | ----------------- | --------------------- |
| `*task`              | `{task-name}`     | Execute specific task |
| `*workflow`          | `{workflow-name}` | Start workflow        |
| `*execute-checklist` | `{checklist}`     | Run checklist         |

**Planning:**

| Command | Arguments                  | Description                            |
| ------- | -------------------------- | -------------------------------------- |
| `*plan` | `[create\|status\|update]` | Workflow planning                      |
| `*kb`   | -                          | Toggle KB mode (AIOS Method knowledge) |

**Document Operations:**

| Command              | Arguments      | Description                   |
| -------------------- | -------------- | ----------------------------- |
| `*create-doc`        | `{template}`   | Create document from template |
| `*create-next-story` | -              | Create next user story        |
| `*doc-out`           | -              | Output complete document      |
| `*shard-doc`         | `{doc} {dest}` | Break document into parts     |

---

## Workflow API

### Available Workflows

| Workflow               | Description              | Agents Involved    |
| ---------------------- | ------------------------ | ------------------ |
| `greenfield-fullstack` | New full-stack project   | All agents         |
| `greenfield-service`   | New microservice         | architect, dev, qa |
| `greenfield-ui`        | New frontend project     | architect, ux, dev |
| `brownfield-fullstack` | Add feature to existing  | architect, dev, qa |
| `brownfield-service`   | Extend existing service  | dev, qa            |
| `brownfield-ui`        | Extend existing frontend | ux, dev, qa        |

### Workflow Execution

```bash
# Start workflow
@aios-master *workflow greenfield-fullstack

# With parameters
*workflow brownfield-service --target=./services/auth
```

### Workflow Structure

```yaml
# Example workflow definition
name: greenfield-fullstack
phases:
  - name: research
    agent: analyst
    tasks:
      - brainstorm
      - competitive-analysis
  - name: planning
    agent: pm
    tasks:
      - create-prd
  - name: architecture
    agent: architect
    tasks:
      - create-full-stack-architecture
  - name: implementation
    agent: dev
    tasks:
      - develop
```

---

## Parameters and Options

### Global Options

| Option      | Type    | Description               |
| ----------- | ------- | ------------------------- |
| `--verbose` | boolean | Enable verbose output     |
| `--dry-run` | boolean | Preview without execution |
| `--force`   | boolean | Force operation           |
| `--help`    | boolean | Show command help         |

### Story Parameters

| Parameter    | Type   | Description         | Example                      |
| ------------ | ------ | ------------------- | ---------------------------- |
| `{story-id}` | string | Story identifier    | `story-1.2.3`, `STORY-42`    |
| `--status`   | enum   | Story status filter | `draft`, `ready`, `complete` |
| `--epic`     | string | Filter by epic      | `--epic=AUTH`                |

### Build Parameters

| Parameter      | Type   | Description            | Example                            |
| -------------- | ------ | ---------------------- | ---------------------------------- |
| `--mode`       | enum   | Build mode             | `yolo`, `interactive`, `preflight` |
| `--retry`      | number | Max retry attempts     | `--retry=3`                        |
| `--checkpoint` | string | Resume from checkpoint | `--checkpoint=build-001`           |

### Review Parameters

| Parameter    | Type   | Description          | Example                      |
| ------------ | ------ | -------------------- | ---------------------------- |
| `--scope`    | enum   | Review scope         | `uncommitted`, `committed`   |
| `--base`     | string | Base branch for diff | `--base=main`                |
| `--severity` | enum   | Minimum severity     | `critical`, `high`, `medium` |

---

## Return Codes and Errors

### Standard Return Codes

| Code | Status  | Description                                   |
| ---- | ------- | --------------------------------------------- |
| `0`  | SUCCESS | Operation completed successfully              |
| `1`  | ERROR   | General error                                 |
| `2`  | BLOCKED | Operation blocked (requires approval)         |
| `3`  | HALTED  | Operation halted (user intervention required) |
| `4`  | SKIP    | Operation skipped                             |
| `5`  | TIMEOUT | Operation timed out                           |

### Error Categories

| Category             | Description                     | Resolution                             |
| -------------------- | ------------------------------- | -------------------------------------- |
| `AGENT_NOT_FOUND`    | Agent definition missing        | Check `.aios-core/development/agents/` |
| `TASK_NOT_FOUND`     | Task definition missing         | Check agent dependencies               |
| `STORY_NOT_FOUND`    | Story file not found            | Verify `docs/stories/` path            |
| `VALIDATION_FAILED`  | Pre-condition not met           | Check prerequisites                    |
| `PERMISSION_DENIED`  | Operation not allowed           | Check agent restrictions               |
| `DEPENDENCY_MISSING` | Required dependency unavailable | Install or configure dependency        |

### Error Response Format

```json
{
  "status": "error",
  "code": "VALIDATION_FAILED",
  "message": "Story status must be 'Ready for Dev' to begin implementation",
  "context": {
    "story": "story-1.2.3",
    "currentStatus": "Draft",
    "requiredStatus": "Ready for Dev"
  },
  "suggestions": ["Update story status to 'Ready for Dev'", "Contact @pm to approve story"]
}
```

### Quality Gate Decisions

| Decision   | Description                     | Action                            |
| ---------- | ------------------------------- | --------------------------------- |
| `PASS`     | All criteria met                | Proceed to next phase             |
| `CONCERNS` | Minor issues found              | Document and proceed with caution |
| `FAIL`     | Critical issues found           | Must fix before proceeding        |
| `WAIVED`   | Issues acknowledged, proceeding | Document waiver reason            |

---

## IDE Integration

### Supported IDEs

| IDE         | Directory    | Format            | Support Level |
| ----------- | ------------ | ----------------- | ------------- |
| Claude Code | `.claude/`   | Markdown          | Full          |
| Cursor      | `.cursor/`   | MDC (frontmatter) | Full          |
| Windsurf    | `.windsurf/` | Markdown          | Full          |
| Cline       | `.cline/`    | Markdown          | Full          |
| VS Code     | `.vscode/`   | JSON              | Partial       |
| Gemini      | `.gemini/`   | Markdown          | Basic         |

### IDE Configuration

```yaml
# .aios-sync.yaml
version: 1.0.0
active_ides:
  - claude
  - cursor
  - windsurf

pack_aliases:
  legal: Legal
  copy: Copy
  hr: HR

sync_components:
  agents: true
  tasks: true
  workflows: true
  checklists: true
```

### Sync Commands

```bash
# Sync specific agent
*command agent {agent-name}

# Sync specific task
*command task {task-name}

# Sync entire squad
*command squad {squad-name}

# Sync all components
*command sync-all
```

### Claude Code Integration

Claude Code is the primary supported IDE with full integration:

**Agent Commands (Slash Commands):**

```
/dev          → Activates @dev agent
/qa           → Activates @qa agent
/architect    → Activates @architect agent
/aios-master  → Activates @aios-master agent
```

**Directory Structure:**

```
.claude/
├── commands/
│   └── AIOS/
│       └── agents/
│           ├── dev.md
│           ├── qa.md
│           ├── architect.md
│           └── ...
├── rules/
│   └── mcp-usage.md
└── hooks/
    ├── read-protection.py
    └── sql-governance.py
```

### Cursor Integration

```
.cursor/
└── rules/
    ├── dev.mdc
    ├── qa.mdc
    └── architect.mdc
```

MDC format includes frontmatter:

```yaml
---
description: Full Stack Developer - Code implementation
globs: []
alwaysApply: false
---
# Agent content...
```

### Windsurf Integration

```
.windsurf/
└── agents/
    ├── dev.md
    ├── qa.md
    └── architect.md
```

---

## Examples

### Example 1: Complete Story Implementation

```bash
# 1. Activate developer agent
@dev

# 2. Start story implementation
*develop story-1.2.3

# 3. Run tests
*run-tests

# 4. Check for gotchas
*list-gotchas

# 5. Exit developer mode
*exit

# 6. Switch to QA
@qa

# 7. Review the story
*review story-1.2.3

# 8. Create quality gate
*gate story-1.2.3
```

### Example 2: ADE Spec Pipeline

```bash
# 1. Gather requirements
@pm *gather-requirements

# 2. Assess complexity
@architect *assess-complexity story-1.2.3

# 3. Research dependencies
@analyst *research-deps "authentication libraries"

# 4. Write specification
@pm *write-spec

# 5. Critique specification
@qa *critique-spec story-1.2.3

# 6. Create implementation plan
@architect *create-plan story-1.2.3

# 7. Generate context
@architect *create-context story-1.2.3

# 8. Execute subtasks
@dev *execute-subtask 1.1

# 9. Review build
@qa *review-build story-1.2.3
```

### Example 3: Recovery Flow

```bash
# When implementation fails
@dev

# 1. Track the failed attempt
*track-attempt subtask-1.1

# 2. Check known gotchas
*list-gotchas

# 3. Try rollback
*rollback

# 4. Retry with different approach
*execute-subtask 1.1 --approach alternative

# 5. Capture insights for future
*capture-insights
```

### Example 4: Parallel Development with Worktrees

```bash
# 1. Create isolated worktree
@devops *create-worktree STORY-42

# 2. Develop in isolation
@dev *develop STORY-42

# 3. QA review
@qa *review STORY-42

# 4. Merge back
@devops *merge-worktree STORY-42

# 5. Cleanup
@devops *cleanup-worktrees
```

### Example 5: Framework Development

```bash
# 1. Activate master orchestrator
@aios-master

# 2. Enable knowledge base
*kb

# 3. Create new agent
*create agent my-custom-agent

# 4. Validate the component
*validate-component my-custom-agent

# 5. Create associated task
*create task my-custom-task

# 6. Test the workflow
*task my-custom-task
```

---

## Agent Decision Tree

Use this decision tree to select the correct agent:

```
What do you need?
│
├─ Research/Analysis?
│  └─ @analyst
│
├─ Product Requirements?
│  ├─ PRD/Epic → @pm
│  └─ User Stories → @sm
│
├─ Architecture?
│  ├─ System Design → @architect
│  └─ Database Schema → @data-engineer
│
├─ Implementation?
│  └─ @dev
│
├─ Quality Assurance?
│  └─ @qa
│
├─ Deployment/Git?
│  └─ @devops
│
├─ UX/UI Design?
│  └─ @ux-expert
│
└─ Framework/Orchestration?
   └─ @aios-master
```

---

## Best Practices

### 1. Use the Right Agent

Each agent has a specific responsibility boundary. Using the correct agent ensures:

- Appropriate expertise is applied
- Correct tools are available
- Proper delegation occurs

### 2. Follow the Spec Pipeline

For complex features, follow the ADE spec pipeline:

1. `@pm *gather-requirements` - Collect requirements
2. `@architect *assess-complexity` - Estimate effort
3. `@analyst *research-deps` - Research constraints
4. `@pm *write-spec` - Write specification
5. `@qa *critique-spec` - Validate quality

### 3. Track Everything

Use memory commands to preserve knowledge:

- `*capture-insights` after discoveries
- `*gotcha` for known pitfalls
- `*track-attempt` for implementation attempts

### 4. Use Recovery System

When stuck:

1. `*track-attempt` - Log the failure
2. `*rollback` - Revert to good state
3. `*list-gotchas` - Check known issues
4. Try alternative approach

### 5. Leverage Worktrees

For parallel development:

- `*worktree-create` for isolation
- `*worktree-merge` for integration
- `*worktree-cleanup` for maintenance

---

## Related Documentation

- [User Guide](./user-guide.md) - Getting started with AIOS
- [Agent Selection Guide](./agent-selection-guide.md) - Choosing the right agent
- [ADE Guide](./ade-guide.md) - Autonomous Development Engine
- [Quality Gates](./quality-gates.md) - Quality assurance workflows
- [IDE Sync Guide](./ide-sync-guide.md) - Multi-IDE synchronization
- [Squads Guide](./squads-guide.md) - Extending AIOS with squads

---

_Synkra AIOS API Reference v2.1.0_
