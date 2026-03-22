# Agent Matrix — Complete Command Reference

## @pm (Morgan) — Product Manager / Strategist

| Command | Description |
|---------|-------------|
| `*create-prd` | Create Product Requirements Document |
| `*create-brownfield-prd` | PRD for existing projects |
| `*create-epic {path}` | Create epic structure from PRD |
| `*execute-epic {plan} [action]` | Wave-based parallel development |
| `*research {topic}` | Deep research prompt |
| `*gather-requirements` | Elicit stakeholder requirements (Spec Pipeline) |
| `*write-spec` | Generate formal specification |

**Exclusive:** Epic creation + orchestration, PRD creation, requirements gathering, spec writing.
**Tools:** context7, browser.

---

## @po (Pax) — Product Owner / Balancer

| Command | Description |
|---------|-------------|
| `*validate-story-draft {story}` | 10-point checklist → GO/NO-GO (START of lifecycle) |
| `*close-story {story}` | Close completed story (END of lifecycle) |
| `*backlog-review` | Generate backlog review for sprint planning |
| `*backlog-prioritize {item} {priority}` | Re-prioritize backlog items |
| `*sync-story {story}` | Tool-agnostic sync (ClickUp/GitHub/Jira/local) |

**Exclusive:** Story validation (Draft→Ready), backlog management.
**Critical:** When GO, MUST update Status: Draft → Ready.

---

## @sm (River) — Scrum Master / Facilitator

| Command | Description |
|---------|-------------|
| `*draft` | Create next user story from epic |
| `*create-story` | Create story (alias for *draft) |
| `*create-next-story` | Create next story in sequence |
| `*story-checklist` | Run story draft quality checklist |

**Exclusive:** Story creation from epic/PRD.
**Git:** Local only (checkout, branch, merge). No push.

---

## @dev (Dex) — Full Stack Developer / Builder

| Command | Description |
|---------|-------------|
| `*develop {story-id}` | Implement story (modes: yolo/interactive/preflight) |
| `*build-autonomous {story}` | Autonomous build with retries (Coder Agent) |
| `*run-tests` | Execute lint + tests + typecheck |
| `*apply-qa-fixes` | Apply QA feedback |
| `*self-critique` | Self-review with checklist |
| `*worktree-create {story}` | Isolated development branch |
| `*gotcha {title} - {desc}` | Record project gotcha |
| `*track-attempt` | Register implementation attempt |
| `*rollback [--hard]` | Rollback to last good state |
| `*execute-subtask` | 13-step Coder Agent workflow |

**Git allowed:** add, commit, status, diff, log, branch, checkout, stash, merge (local).
**Git BLOCKED:** push, pr create/merge.
**Story edits:** Checkboxes, Dev Record, File List, Change Log, Status only.
**CodeRabbit:** Self-healing max 2 iterations (CRITICAL only).

---

## @qa (Quinn) — Test Architect / Guardian

| Command | Description |
|---------|-------------|
| `*review {story}` | Comprehensive quality review |
| `*review-build {story}` | 10-phase structured QA review |
| `*gate {story}` | Quality gate: PASS/CONCERNS/FAIL/WAIVED |
| `*code-review {scope}` | Automated review (uncommitted/committed) |
| `*nfr-assess {story}` | Non-functional requirements validation |
| `*security-check {story}` | 8-point security scan |
| `*test-design {story}` | Create test scenarios |
| `*create-suite` | Create and own test suites |
| `*qa-loop {storyId}` | Start QA loop |
| `*qa-loop-review` | Resume from review |
| `*qa-loop-fix` | Resume from fix |
| `*stop-qa-loop` | Pause loop |
| `*resume-qa-loop` | Resume loop |
| `*escalate-qa-loop` | Force escalation to @aiox-master |

**Exclusive:** Quality gate verdicts (advisory, never blocking).
**Story edits:** QA Results section only.
**CodeRabbit:** Self-healing max 3 iterations (CRITICAL+HIGH).

---

## @devops (Gage) — GitHub Repository Manager / Operator

| Command | Description |
|---------|-------------|
| `*push` | Execute git push (after quality gates) |
| `*pre-push` | Run all quality checks before push |
| `*create-pr` | Create pull request |
| `*version-check` | Semantic versioning detection |
| `*release` | Create versioned release + changelog |
| `*cleanup` | Remove stale branches |
| `*health-check` | Full health diagnostic |
| `*add-mcp {name}` | Add MCP server |
| `*remove-mcp {name}` | Remove MCP server |
| `*list-mcps` | List enabled MCPs |

**EXCLUSIVE:** git push, PRs, releases, tags, MCP management, CI/CD.
**Pre-push gates:** lint=0, typecheck=0, tests pass, build OK, CodeRabbit clean, Story=Done.

---

## @architect (Aria) — Technical Architect / Visionary

| Command | Description |
|---------|-------------|
| `*design-system` | Full-stack architecture design |
| `*tech-selection` | Evaluate + recommend technologies |
| `*api-design` | Design REST/GraphQL/tRPC endpoints |
| `*assess-complexity` | Complexity scoring (5 dimensions) |
| `*plan-implementation` | Implementation plan from spec |
| `*performance-optimize` | Optimization strategies |
| `*security-architecture` | Security design |

**Exclusive:** Architecture decisions (final say), technology selection, complexity assessment.
**Delegates to:** @data-engineer (detailed DDL, query optimization).

---

## @analyst (Atlas) — Business Analyst / Decoder

| Command | Description |
|---------|-------------|
| `*research {topic}` | Deep market/competitive research |
| `*analyze-brainstorm` | Facilitate brainstorming |
| `*calculate-roi` | ROI analysis |
| `*feasibility-study` | Evaluate technical feasibility |
| `*user-research` | Conduct user research |

**NOT for:** PRDs (→@pm), technical decisions (→@architect), stories (→@sm).

---

## @data-engineer (Dara) — Database Specialist

| Command | Description |
|---------|-------------|
| `*design-schema` | Detailed DDL schema design |
| `*create-migration` | Create database migration |
| `*audit-db` | Database audit |
| `*optimize-queries` | Query optimization |
| `*design-rls` | Row-Level Security policies |

**Exclusive authority (delegated from @architect):** DDL, query optimization, RLS, index strategy, migrations.
**Tasks:** 20+ database tasks (db-*.md) in `.aios-core/development/tasks/`.

---

## @ux-design-expert (Uma) — UX/UI Designer

| Command | Description |
|---------|-------------|
| `*design-ui` | Frontend specifications |
| `*create-wireframe` | Wireframes and prototypes |
| `*audit-accessibility` | Accessibility review |
| `*user-journey` | User journey mapping |
| `*design-components` | Design system components |

---

## @aios-master (Orion) — Framework Orchestrator

| Command | Description |
|---------|-------------|
| `*create` | Create new AIOS component |
| `*modify` | Modify existing component |
| `*kb` | Toggle knowledge base mode |
| `*validate-workflow` | Validate YAML workflows |
| `*run-workflow` | Execute workflows |
| `*correct-course` | Fix process deviations |
| `*enforce-constitution` | Constitutional enforcement |
| `*mediate` | Resolve agent boundary conflicts |

**Unique:** Can execute ANY task, override agent boundaries, framework governance.
**Rule:** Do NOT scan filesystem during activation. Greet and wait.

---

## Universal Commands (All Agents)

| Command | Description |
|---------|-------------|
| `*help` | List all commands |
| `*guide` | Comprehensive usage guide |
| `*session-info` | Current context info |
| `*yolo` | Toggle permission mode |
| `*exit` | Exit agent mode |

---

## Agent Locations

| Type | Path Pattern | Example |
|------|-------------|---------|
| Core agent definition | `.aiox-core/development/agents/{id}/` (FOLDER) | `agents/dev/dev.md` |
| Core agent memory | `.aiox-core/development/agents/{id}/MEMORY.md` | `agents/dev/MEMORY.md` |
| Core slash command | `.claude/commands/AIOS/agents/{id}.md` | `AIOS/agents/dev.md` |
| Squad agent definition | `squads/{squad}/agents/{id}.md` (FILE) | `squads/advisor-board/agents/hormozi.md` |
| Squad slash command | `.claude/commands/{squad}/{id}.md` | `advisor-board/hormozi.md` |

**IMPORTANT:** Core agents live in **folders** (e.g., `agents/dev/`), squad agents in **loose files**.

---

## Exclusive Authority Matrix

```
┌─────────────────────────────────────────────────────────┐
│ OPERATION             │ EXCLUSIVE │ OTHERS = BLOCK      │
├───────────────────────┼───────────┼─────────────────────┤
│ git push / PRs        │ @devops   │ Always delegate     │
│ MCP management        │ @devops   │ Always delegate     │
│ Releases / Tags       │ @devops   │ Always delegate     │
│ Story validation      │ @po       │ Always delegate     │
│ Story creation        │ @sm       │ Always delegate     │
│ Epic orchestration    │ @pm       │ Always delegate     │
│ Architecture decides  │ @architect│ Consult first       │
│ Schema design         │ @data-eng │ Delegated from @arch│
│ Framework governance  │ @aiox-mstr│ Escalate if needed  │
└─────────────────────────────────────────────────────────┘
```

## Git Restrictions (Art. II)

| Agent | git add/commit/status/diff/log/branch | git push / gh pr | MCP mgmt |
|-------|---------------------------------------|------------------|----------|
| `@dev` | ALLOWED | BLOCKED → @devops | BLOCKED |
| `@qa` | ALLOWED | BLOCKED → @devops | BLOCKED |
| `@architect` | ALLOWED | BLOCKED → @devops | BLOCKED |
| `@sm` | ALLOWED | BLOCKED → @devops | BLOCKED |
| `@devops` | ALLOWED | **EXCLUSIVE** | **EXCLUSIVE** |
| Others | Read-only | BLOCKED → @devops | BLOCKED |

## Cross-Agent Flows

### Story Flow (most common)
```
@sm *draft → @po *validate → @dev *develop → @qa *gate → @devops *push
```

### Epic Flow
```
@pm *create-epic → @pm *execute-epic → @sm *draft (per story) → SDC
```

### Schema Flow
```
@architect (decides technology) → @data-engineer (implements DDL)
```

### Git Push Flow
```
ANY agent → delegates to @devops *push
```

### Escalation Flow
```
Agent blocked → @aiox-master mediates → resolves → returns to agent
```

### Research → Build Flow
```
@analyst *research → @architect *design → @pm *create-prd → SDC
```

### Multi-Agent Parallel (Hub-and-Spoke)
```
    ┌─ @analyst (research)
@pm ┼─ @architect (design)
    └─ @ux (wireframes)
    → merge → @dev (implement)
```
