# Agent Selection Guide

> **EN** | [PT](../pt/guides/agent-selection-guide.md) | [ES](../es/guides/agent-selection-guide.md)

---

## Quick Reference for Choosing the Right Agent

**Last Updated:** 2026-01-29 (ADE v2.2.0)

---

## Quick Decision Tree

```
Need research/analysis? → @analyst
   ↓
Need PRD/epic? → @pm
   ↓
Need architecture? → @architect
   ↓
Need database? → @data-engineer
   ↓
Need stories? → @sm
   ↓
Need implementation? → @dev
   ↓
Need testing/QA? → @qa
   ↓
Need deployment? → @devops
```

---

## Agent Quick Reference

| Agent                        | Icon | Use For                                                                                     | NOT For                                  |
| ---------------------------- | ---- | ------------------------------------------------------------------------------------------- | ---------------------------------------- |
| **@analyst** (Atlas)         | 🔍   | Market research, competitive analysis, brainstorming, pattern extraction                    | PRD creation, architecture, stories      |
| **@pm** (Morgan)             | 📋   | PRD, epics, product strategy, requirements gathering, spec writing                          | Research, architecture, detailed stories |
| **@architect** (Aria)        | 🏛️   | System architecture, API design, tech stack, complexity assessment, implementation planning | Research, PRD, database schema           |
| **@data-engineer** (Dara)    | 📊   | Database schema, RLS, migrations, query optimization                                        | App architecture, DB tech selection      |
| **@sm** (River)              | 🌊   | User stories, sprint planning, backlog grooming                                             | PRD, epics, research, implementation     |
| **@dev** (Dex)               | 💻   | Story implementation, coding, testing, subtask execution, recovery                          | Story creation, deployment               |
| **@qa** (Quinn)              | 🧪   | Code review, testing, quality assurance, spec critique, structured review                   | Implementation                           |
| **@po** (Pax)                | 🎯   | Backlog management, acceptance criteria, prioritization                                     | Epic creation, architecture              |
| **@ux-design-expert** (Nova) | 🎨   | UI/UX design, wireframes, design systems                                                    | Implementation                           |
| **@devops** (Gage)           | ⚙️   | Git ops, PR creation, deployment, CI/CD, worktree management, migrations                    | Local Git, implementation                |
| **@aiox-master** (Orion)     | 👑   | Framework development, multi-agent orchestration                                            | Routine tasks (use specialized agents)   |

---

## 🤖 ADE Commands by Agent (v2.2.0)

### @devops (Gage) - Infrastructure & Operations

**Worktree Management:**
| Command | Description |
|---------|-------------|
| `*create-worktree {story}` | Create isolated Git worktree for story development |
| `*list-worktrees` | List all active worktrees with status |
| `*merge-worktree {story}` | Merge completed worktree back to main |
| `*cleanup-worktrees` | Remove stale/merged worktrees |

**Migration Management:**
| Command | Description |
|---------|-------------|
| `*inventory-assets` | Generate migration inventory from V2 assets |
| `*analyze-paths` | Analyze path dependencies and migration impact |
| `*migrate-agent` | Migrate single agent from V2 to V3 format |
| `*migrate-batch` | Batch migrate all agents with validation |

---

### @pm (Morgan) - Product Management

**Spec Pipeline:**
| Command | Description |
|---------|-------------|
| `*gather-requirements` | Elicit and document requirements from stakeholders |
| `*write-spec` | Generate formal specification document from requirements |

---

### @architect (Aria) - System Architecture

**Spec Pipeline:**
| Command | Description |
|---------|-------------|
| `*assess-complexity` | Assess story complexity and estimate effort |

**Execution Engine:**
| Command | Description |
|---------|-------------|
| `*create-plan` | Create implementation plan with phases and subtasks |
| `*create-context` | Generate project and files context for story |

**Memory Layer:**
| Command | Description |
|---------|-------------|
| `*map-codebase` | Generate codebase map (structure, services, patterns) |

---

### @analyst (Atlas) - Research & Analysis

**Spec Pipeline:**
| Command | Description |
|---------|-------------|
| `*research-deps` | Research dependencies and technical constraints |

**Memory Layer:**
| Command | Description |
|---------|-------------|
| `*extract-patterns` | Extract and document code patterns from codebase |

---

### @qa (Quinn) - Quality Assurance

**Spec Pipeline:**
| Command | Description |
|---------|-------------|
| `*critique-spec {story}` | Review and critique specification for completeness |

**QA Evolution (10-Phase Review):**
| Command | Description |
|---------|-------------|
| `*review-build {story}` | 10-phase structured QA review - outputs qa_report.md |
| `*request-fix {issue}` | Request specific fix from @dev with context |
| `*verify-fix {issue}` | Verify fix was properly implemented |

---

### @dev (Dex) - Development

**Execution Engine:**
| Command | Description |
|---------|-------------|
| `*execute-subtask` | Execute subtask following 13-step workflow with self-critique |

**Recovery System:**
| Command | Description |
|---------|-------------|
| `*track-attempt` | Track implementation attempt (registers in recovery/attempts.json) |
| `*rollback` | Rollback to last good state (--hard to skip confirmation) |

**QA Loop:**
| Command | Description |
|---------|-------------|
| `*apply-qa-fix` | Apply fix requested by QA (reads qa_report.md for context) |

**Memory Layer:**
| Command | Description |
|---------|-------------|
| `*capture-insights` | Capture session insights (discoveries, patterns, gotchas) |
| `*list-gotchas` | List known gotchas from .aiox/gotchas.md |

---

## Common Scenarios

### "I want to build a new feature" (Traditional)

```
1. @analyst *brainstorm - Ideation
2. @pm *create-prd - Product requirements
3. @architect *create-architecture - Technical design
4. @data-engineer *create-schema - Database design
5. @sm *create-next-story - User stories
6. @dev *develop - Implementation
7. @qa *review - Quality check
8. @devops *create-pr - Deployment
```

### "I want to build using ADE Spec Pipeline" (Autonomous)

```
1. @pm *gather-requirements - Collect and structure requirements
2. @architect *assess-complexity - Evaluate complexity
3. @analyst *research-deps - Research libraries/APIs
4. @pm *write-spec - Generate specification
5. @qa *critique-spec - Validate spec quality
   ↓
[Spec Approved]
   ↓
6. @architect *create-plan - Create implementation plan
7. @architect *create-context - Generate context files
8. @dev *execute-subtask 1.1 - Execute with 13 steps + self-critique
9. @qa *review-build - 10-phase QA review
   ↓
[If issues found]
   ↓
10. @qa *request-fix - Request fix
11. @dev *apply-qa-fix - Apply fix
12. @qa *verify-fix - Verify
```

### "I'm stuck on implementation"

```
1. @dev *track-attempt - Log the failed attempt
2. @dev *rollback - Revert to last good state
3. @dev *list-gotchas - Check known pitfalls
4. @dev *execute-subtask --approach alternative - Try different approach
```

### "I need to understand existing codebase"

```
1. @architect *map-codebase - Generate structure/services/patterns map
2. @analyst *extract-patterns - Document code patterns
3. @dev *capture-insights - Record discoveries
```

### "I need parallel story development"

```
1. @devops *create-worktree STORY-42 - Isolate branch
2. @dev *execute-subtask - Work in isolation
3. @devops *merge-worktree STORY-42 - Merge when done
4. @devops *cleanup-worktrees - Clean stale branches
```

---

## Delegation Patterns

### Spec Pipeline Flow

```
@pm *gather-requirements
    ↓
@architect *assess-complexity
    ↓
@analyst *research-deps
    ↓
@pm *write-spec
    ↓
@qa *critique-spec
```

### Execution Flow

```
@architect *create-plan
    ↓
@architect *create-context
    ↓
@dev *execute-subtask (loops)
    ↓
@qa *review-build
```

### QA Loop

```
@qa *review-build
    ↓ (issues found)
@qa *request-fix
    ↓
@dev *apply-qa-fix
    ↓
@qa *verify-fix
    ↓ (loop until clean)
```

### Recovery Flow

```
@dev fails subtask
    ↓
@dev *track-attempt
    ↓
Retries < 3? → @dev retry with variation
    ↓
@dev *rollback → try different approach
```

---

## Full Documentation

- **[ADE Complete Guide](./ade-guide.md)** - Full tutorial for Autonomous Development Engine
- **[Agent Responsibility Matrix](../architecture/agent-responsibility-matrix.md)** - Complete boundary definitions

---

**Version:** 2.0 | **ADE:** v2.2.0 | **Date:** 2026-01-29
