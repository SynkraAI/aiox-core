# Agent Authority — Detailed Rules

## Delegation Matrix

### @devops (Gage) — EXCLUSIVE Authority

| Operation | Exclusive? | Other Agents |
|-----------|-----------|--------------|
| `git push` / `git push --force` | YES | BLOCKED |
| `gh pr create` / `gh pr merge` | YES | BLOCKED |
| MCP add/remove/configure | YES | BLOCKED |
| CI/CD pipeline management | YES | BLOCKED |
| Release management | YES | BLOCKED |

### @pm (Morgan) — Epic Orchestration

| Operation | Exclusive? | Delegated From |
|-----------|-----------|---------------|
| `*execute-epic` | YES | — |
| `*create-epic` | YES | — |
| EPIC-{ID}-EXECUTION.yaml management | YES | — |
| Requirements gathering | YES | — |
| Spec writing (spec pipeline) | YES | — |

### @po (Pax) — Story Validation

| Operation | Exclusive? | Details |
|-----------|-----------|---------|
| `*validate-story-draft` | YES | 10-point checklist |
| Story context tracking in epics | YES | — |
| Epic context management | YES | — |
| Backlog prioritization | YES | — |

### @sm (River) — Story Creation

| Operation | Exclusive? | Details |
|-----------|-----------|---------|
| `*draft` / `*create-story` | YES | From epic/PRD |
| Story template selection | YES | — |

### @dev (Dex) — Implementation

| Allowed | Blocked |
|---------|---------|
| `git add`, `git commit`, `git status` | `git push` (delegate to @devops) |
| `git branch`, `git checkout`, `git merge` (local) | `gh pr create/merge` (delegate to @devops) |
| `git stash`, `git diff`, `git log` | MCP management |
| Story file updates (File List, checkboxes) | Story file updates (AC, scope, title) |

### @architect (Aria) — Design Authority

| Owns | Delegates To |
|------|-------------|
| System architecture decisions | — |
| Technology selection | — |
| High-level data architecture | @data-engineer (detailed DDL) |
| Integration patterns | @data-engineer (query optimization) |
| Complexity assessment | — |

### @data-engineer (Dara) — Database

| Owns (delegated from @architect) | Does NOT Own |
|----------------------------------|-------------|
| Schema design (detailed DDL) | System architecture |
| Query optimization | Application code |
| RLS policies implementation | Git operations |
| Index strategy execution | Frontend/UI |
| Migration planning & execution | — |

### @aios-master — Framework Governance

| Capability | Rule |
|-----------|------|
| Framework ops (agents, tasks, workflows) | Executes directly — within scope |
| Orchestration (`*run-workflow`, `*plan`, `*workflow`) | Executes directly — within scope |
| Meta-operations (`*validate-agents`, `*ids-*`, `*correct-course`) | Executes directly — within scope |
| Tasks with a mapped exclusive agent (see table below) | **DELEGATE by default** — direct execution only with explicit `--force-execute` |
| `git push` / `gh pr create` / `gh pr merge` | **BLOCKED** — always @devops, no exceptions |

**Tasks @aios-master delegates by default (override with `--force-execute`):**

| Task | Delegate to |
|------|------------|
| `create-next-story.md` | @sm |
| `validate-next-story.md` | @po |
| `dev-develop-story.md` | @dev |
| `qa-gate.md` | @qa |
| `brownfield-create-epic.md` | @pm |
| `brownfield-create-story.md` | @pm |
| `facilitate-brainstorming-session.md` | @analyst |
| `generate-ai-frontend-prompt.md` | @architect |
| `create-suite.md` | @qa |

## Cross-Agent Delegation Patterns

### Git Push Flow
```
ANY agent → @devops *push
```

### Schema Design Flow
```
@architect (decides technology) → @data-engineer (implements DDL)
```

### Story Flow
```
@sm *draft → @po *validate → @dev *develop → @qa *qa-gate → @devops *push
```

### Epic Flow
```
@pm *create-epic → @pm *execute-epic → @sm *draft (per story)
```

## Escalation Rules

1. Agent cannot complete task → Escalate to @aios-master
2. Quality gate fails → Return to @dev with specific feedback
3. Constitutional violation detected → BLOCK, require fix before proceed
4. Agent boundary conflict → @aios-master mediates
