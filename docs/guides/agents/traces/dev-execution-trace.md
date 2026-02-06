# @dev (Dex) - Execution Trace

> Traced from source code, not documentation.
> Agent definition: `.aios-core/development/agents/dev.md`

## 1. Activation Trace

### 1.1 Files Loaded (in order)

| Order | File | Loader | Purpose |
|-------|------|--------|---------|
| 1 | `.aios-core/development/agents/dev.md` | AgentConfigLoader.loadAgentDefinition() | Agent definition (YAML block) |
| 2 | `.aios-core/core-config.yaml` | GreetingBuilder._loadConfig() | Core configuration + devLoadAlwaysFiles list |
| 3 | `.aios-core/data/agent-config-requirements.yaml` | AgentConfigLoader.loadRequirements() | Config sections: devLoadAlwaysFiles, devStoryLocation, dataLocation |
| 4 | `.aios-core/data/workflow-patterns.yaml` | WorkflowNavigator._loadPatterns() | Workflow state detection |
| 5 | `docs/framework/coding-standards.md` | AgentConfigLoader.loadFile() | Coding standards (always loaded, 25KB) |
| 6 | `docs/framework/tech-stack.md` | AgentConfigLoader.loadFile() | Tech stack reference (always loaded, 30KB) |
| 7 | `docs/framework/source-tree.md` | AgentConfigLoader.loadFile() | Source tree map (always loaded, 20KB) |
| 8 | `.aios-core/data/technical-preferences.md` | AgentConfigLoader.loadFile() | Technical preferences (always loaded, 15KB) |
| 9 | `.aios/session-state.json` | ContextDetector._detectFromFile() | Session type detection (if no conversation history) |
| 10 | `.aios/project-status.yaml` | ProjectStatusLoader.loadCache() | Cached project status (60s TTL) |

### 1.2 Greeting Construction

**Activation path:** Direct invocation (STEP 3 calls `GreetingBuilder.buildGreeting()`)

```mermaid
sequenceDiagram
    participant CC as Claude Code
    participant DMd as dev.md
    participant ACL as AgentConfigLoader
    participant GB as GreetingBuilder
    participant GPM as GreetingPreferenceManager
    participant CD as ContextDetector
    participant GCD as GitConfigDetector
    participant PSL as ProjectStatusLoader
    participant PM as PermissionMode

    CC->>DMd: Load agent file (STEP 1)
    CC->>DMd: Adopt persona (STEP 2)
    CC->>ACL: loadAgentDefinition('dev')
    ACL-->>CC: { agent: { name: 'Dex', icon: '💻' }, commands: [...36], ... }

    CC->>GB: new GreetingBuilder()
    Note over GB: Loads ContextDetector, GitConfigDetector,<br/>WorkflowNavigator, GreetingPreferenceManager,<br/>core-config.yaml

    CC->>GB: buildGreeting(agentDef, context)
    GB->>GPM: getPreference()
    GPM-->>GB: 'auto' (default)

    GB->>GB: _buildContextualGreeting()
    GB->>CD: detectSessionType([])
    CD-->>GB: 'new' (first activation)
    GB->>PSL: loadProjectStatus()
    PSL-->>GB: { branch, modifiedFiles, currentStory, ... }
    GB->>GCD: get()
    GCD-->>GB: { configured: true, type: 'github', branch: '...' }
    GB->>PM: load() → getBadge()
    PM-->>GB: '[Ask]'

    Note over GB: Load devLoadAlwaysFiles:<br/>coding-standards.md, tech-stack.md,<br/>source-tree.md, technical-preferences.md

    Note over GB: Assemble sections:<br/>1. Presentation (archetypal + badge)<br/>2. Role Description (new session)<br/>3. Project Status<br/>4. Commands (full visibility)<br/>5. Footer + signature

    GB-->>CC: Formatted greeting
    CC->>CC: Display greeting (STEP 4)
    CC->>CC: HALT and await input (STEP 5)
```

### 1.3 Agent-Specific Config

From `agent-config-requirements.yaml`:

```yaml
dev:
  config_sections:
    - devLoadAlwaysFiles
    - devStoryLocation
    - dataLocation
  files_loaded:
    - path: docs/framework/coding-standards.md
      lazy: false
      size: 25KB
    - path: docs/framework/tech-stack.md
      lazy: false
      size: 30KB
    - path: docs/framework/source-tree.md
      lazy: false
      size: 20KB
    - path: .aios-core/data/technical-preferences.md
      lazy: false
      size: 15KB
  lazy_loading:
    framework_docs: false        # Always load
    project_decisions: true      # Load when yolo mode or story development
  performance_target: <50ms
```

### 1.4 Context Brought to Session

| Data | Source | Value |
|------|--------|-------|
| Greeting level | `persona_profile.greeting_levels.archetypal` | `💻 Dex the Builder ready to innovate!` |
| Signature | `persona_profile.communication.signature_closing` | `— Dex, sempre construindo 🔨` |
| Role | `persona.role` | Expert Senior Software Engineer & Implementation Specialist |
| Commands shown | `filterCommandsByVisibility('full')` | 36 commands with `full` visibility |

---

## 2. Command Registry

| Command | Task File | Visibility | Elicit | Category |
|---------|-----------|------------|--------|----------|
| `*help` | (built-in) | full, quick, key | No | Story Development |
| `*develop` | dev-develop-story.md | full, quick | Yes | Story Development |
| `*develop-yolo` | dev-develop-story.md (yolo mode) | full, quick | No | Story Development |
| `*develop-interactive` | dev-develop-story.md (interactive mode) | full | Yes | Story Development |
| `*develop-preflight` | dev-develop-story.md (preflight mode) | full | Yes | Story Development |
| `*execute-subtask` | plan-execute-subtask.md | full, quick | No | Subtask Execution (ADE) |
| `*verify-subtask` | verify-subtask.md | full, quick | No | Subtask Execution (ADE) |
| `*track-attempt` | (script: recovery-tracker.js) | full, quick | No | Recovery System |
| `*rollback` | (script: rollback-manager.js) | full, quick | Optional | Recovery System |
| `*build-resume` | build-resume.md | full, quick | No | Build Recovery |
| `*build-status` | build-status.md | full, quick | No | Build Recovery |
| `*build-log` | (script: build-state-manager.js) | full | No | Build Recovery |
| `*build-cleanup` | (script: build-state-manager.js) | full | No | Build Recovery |
| `*build-autonomous` | build-autonomous.md | full, quick | No | Autonomous Build |
| `*build` | (script: build-orchestrator.js) | full, quick | No | Build Orchestrator |
| `*gotcha` | gotcha.md | full, quick | Yes | Gotchas Memory |
| `*gotchas` | gotchas.md | full, quick | No | Gotchas Memory |
| `*gotcha-context` | (script: gotchas-memory.js) | full | No | Gotchas Memory |
| `*worktree-create` | create-worktree.md | full, quick | No | Worktree Isolation |
| `*worktree-list` | list-worktrees.md | full, quick | No | Worktree Isolation |
| `*worktree-cleanup` | remove-worktree.md | full | No | Worktree Isolation |
| `*worktree-merge` | (script: worktree-manager.js) | full | No | Worktree Isolation |
| `*create-service` | create-service.md | full, quick | Yes | Service Generation |
| `*waves` | waves.md | full, quick | No | Workflow Intelligence |
| `*apply-qa-fixes` | apply-qa-fixes.md | quick, key | No | Quality & Debt |
| `*fix-qa-issues` | qa-fix-issues.md | full, quick | No | Quality & Debt |
| `*run-tests` | (built-in) | quick, key | No | Quality & Debt |
| `*backlog-debt` | po-manage-story-backlog.md | full | Yes | Quality & Debt |
| `*load-full` | (built-in) | full | No | Context & Performance |
| `*clear-cache` | (built-in) | full | No | Context & Performance |
| `*session-info` | (built-in) | full | No | Context & Performance |
| `*explain` | (built-in) | full | No | Learning & Utilities |
| `*guide` | (built-in, rendered from agent .md) | full | No | Learning & Utilities |
| `*exit` | (built-in) | full, quick, key | No | Learning & Utilities |

---

## 3. Per-Command Execution Traces

### `*develop` (Story Development - Primary Workflow)

**Task file:** `.aios-core/development/tasks/dev-develop-story.md`

**Dependencies loaded:**
| File | Type | Status |
|------|------|--------|
| `dev-develop-story.md` | Task | EXISTS |
| `story-dod-checklist.md` | Checklist | MISSING |
| `self-critique-checklist.md` | Checklist | EXISTS |
| `docs/stories/{story-id}.md` | Story | Dynamic |

**Execution flow:**

```mermaid
flowchart TD
    A["*develop {story-id}"] --> B[Load dev-develop-story.md task]
    B --> C{Story status?}
    C -->|Draft| D[HALT: Story not approved]
    C -->|Ready for Dev| E[Read first task from story]
    E --> F[Implement task + subtasks]
    F --> G[Write tests for implementation]
    G --> H[Execute validations]
    H --> I{All pass?}
    I -->|no| J{Attempt count < 3?}
    J -->|yes| F
    J -->|no| K[HALT: 3 failures - report to user]
    I -->|yes| L["Mark task [x] in story"]
    L --> M[Update File List in story]
    M --> N{More tasks?}
    N -->|yes| E
    N -->|no| O[Run CodeRabbit self-healing loop]
    O --> P[Execute story-dod-checklist]
    P --> Q["Set status: 'Ready for Review'"]
    Q --> R[HALT - notify user to activate @github-devops]
```

**Expected output:** Completed story with all tasks implemented, tested, and validated.

---

### `*execute-subtask` (ADE Coder Agent - 13-Step Workflow)

**Task file:** `.aios-core/development/tasks/plan-execute-subtask.md`

**Dependencies loaded:**
| File | Type | Status |
|------|------|--------|
| `plan-execute-subtask.md` | Task | EXISTS |
| `self-critique-checklist.md` | Checklist | EXISTS |
| `recovery-tracker.js` | Script | MISSING |
| `stuck-detector.js` | Script | MISSING |

**Execution flow:**

```mermaid
flowchart TD
    A["*execute-subtask {subtask-id}"] --> B[Load plan-execute-subtask.md]
    B --> C[Read subtask from implementation.yaml]
    C --> D[13-Step Coder Agent Workflow]
    D --> E["Steps 1-4: Analyze, plan, prepare"]
    E --> F["Step 5: Implement code changes"]
    F --> G["Step 5.5: Self-critique checkpoint"]
    G --> H{Self-critique passes?}
    H -->|no| I[Revise implementation]
    I --> F
    H -->|yes| J["Step 6: Write tests"]
    J --> K["Step 6.5: Self-critique checkpoint"]
    K --> L["Steps 7-13: Validate, verify, document"]
    L --> M{All validations pass?}
    M -->|yes| N[Mark subtask complete]
    M -->|no| O[Track attempt via recovery-tracker]
    O --> P{Max attempts?}
    P -->|no| F
    P -->|yes| Q[HALT: stuck detection triggered]
```

---

### `*build-autonomous` (Epic 8 - Autonomous Build Loop)

**Task file:** `.aios-core/development/tasks/build-autonomous.md`

**Dependencies loaded:**
| File | Type | Status |
|------|------|--------|
| `build-autonomous.md` | Task | EXISTS |
| `autonomous-build-loop.js` | Script | MISSING |
| `build-state-manager.js` | Script | MISSING |

**Execution flow:**

```mermaid
flowchart TD
    A["*build-autonomous {story-id}"] --> B[Load build-autonomous.md]
    B --> C[Initialize build state via build-state-manager.js]
    C --> D[Create checkpoint]
    D --> E[Execute next subtask via Coder Agent Loop]
    E --> F{Subtask passed?}
    F -->|yes| G[Save checkpoint]
    G --> H{More subtasks?}
    H -->|yes| E
    H -->|no| I[Build complete - all subtasks done]
    F -->|no| J[Retry with approach variation]
    J --> K{Retry count < max?}
    K -->|yes| E
    K -->|no| L[Save state for resume]
    L --> M[HALT: needs human intervention]
```

---

### `*build` (Epic 8 - Build Orchestrator)

**Task file:** (script: `build-orchestrator.js`)

**Dependencies loaded:**
| File | Type | Status |
|------|------|--------|
| `build-orchestrator.js` | Script | MISSING |
| `worktree-manager.js` | Script | MISSING |
| `autonomous-build-loop.js` | Script | MISSING |
| `build-state-manager.js` | Script | MISSING |

**Execution flow:**

```mermaid
flowchart TD
    A["*build {story-id}"] --> B[Load build-orchestrator.js]
    B --> C["Phase 1: Create worktree for story"]
    C --> D["Phase 2: Generate implementation plan"]
    D --> E["Phase 3: Execute subtasks autonomously"]
    E --> F["Phase 4: Verify all implementations"]
    F --> G{All verified?}
    G -->|yes| H["Phase 5: Merge worktree to base branch"]
    G -->|no| I[Report failures and HALT]
    H --> J[Cleanup worktree]
    J --> K[Build complete]
```

---

### `*gotcha` / `*gotchas` (Gotchas Memory System)

**Task files:** `.aios-core/development/tasks/gotcha.md`, `.aios-core/development/tasks/gotchas.md`

**Dependencies loaded:**
| File | Type | Status |
|------|------|--------|
| `gotcha.md` | Task | EXISTS |
| `gotchas.md` | Task | EXISTS |
| `gotchas-memory.js` | Script | MISSING |

**Execution flow:**

```mermaid
flowchart TD
    A["*gotcha {title} - {description}"] --> B[Load gotcha.md task]
    B --> C[Parse title and description]
    C --> D[Auto-detect category and severity]
    D --> E[Store in gotchas memory]
    E --> F[Confirm gotcha captured]

    G["*gotchas [--category X]"] --> H[Load gotchas.md task]
    H --> I[Query gotchas memory with filters]
    I --> J[Display matching gotchas]

    K["*gotcha-context"] --> L[Load gotchas-memory.js]
    L --> M[Analyze current task context]
    M --> N[Return relevant gotchas for current work]
```

---

### `*worktree-create` / `*worktree-list` / `*worktree-cleanup` / `*worktree-merge`

**Task files:** `.aios-core/development/tasks/create-worktree.md`, `list-worktrees.md`, `remove-worktree.md`

**Dependencies loaded:**
| File | Type | Status |
|------|------|--------|
| `create-worktree.md` | Task | EXISTS |
| `list-worktrees.md` | Task | EXISTS |
| `remove-worktree.md` | Task | EXISTS |
| `worktree-manager.js` | Script | MISSING |

**Execution flow:**

```mermaid
flowchart TD
    A["*worktree-create {story-id}"] --> B[Create git worktree]
    B --> C[Initialize isolated branch]
    C --> D[Set up worktree for story development]

    E["*worktree-list"] --> F[List active worktrees]
    F --> G[Show status per worktree]

    H["*worktree-cleanup"] --> I[Identify completed/stale worktrees]
    I --> J[Remove worktrees safely]

    K["*worktree-merge {story-id}"] --> L[Load worktree-manager.js]
    L --> M[Merge worktree branch to base]
    M --> N[Cleanup worktree after merge]
```

---

### `*fix-qa-issues` (Epic 6 - QA Fix Loop)

**Task file:** `.aios-core/development/tasks/qa-fix-issues.md`

**Dependencies loaded:**
| File | Type | Status |
|------|------|--------|
| `qa-fix-issues.md` | Task | EXISTS |
| `QA_FIX_REQUEST.md` | Input | Dynamic (from @qa) |

**Execution flow:**

```mermaid
flowchart TD
    A["*fix-qa-issues"] --> B[Load qa-fix-issues.md task]
    B --> C["Phase 1: Read QA_FIX_REQUEST.md"]
    C --> D["Phase 2: Parse QA issues"]
    D --> E["Phase 3: Categorize by severity"]
    E --> F["Phase 4: Implement fixes"]
    F --> G["Phase 5: Write/update tests"]
    G --> H["Phase 6: Run validations"]
    H --> I["Phase 7: Update story"]
    I --> J["Phase 8: Report completion"]
```

---

### `*waves` (WIS-4 - Workflow Intelligence)

**Task file:** `.aios-core/development/tasks/waves.md`

**Dependencies loaded:**
| File | Type | Status |
|------|------|--------|
| `waves.md` | Task | EXISTS |

**Execution flow:**

```mermaid
flowchart TD
    A["*waves [--visual]"] --> B[Load waves.md task]
    B --> C[Analyze workflow dependency graph]
    C --> D[Identify independent subtasks]
    D --> E[Group into parallel execution waves]
    E --> F{--visual flag?}
    F -->|yes| G[Generate ASCII art visualization]
    F -->|no| H[Output wave analysis as structured data]
    G --> I[Display wave diagram]
    H --> I
```

---

### `*create-service` (WIS-11 - Service Generation)

**Task file:** `.aios-core/development/tasks/create-service.md`

**Dependencies loaded:**
| File | Type | Status |
|------|------|--------|
| `create-service.md` | Task | EXISTS |
| Handlebars templates | Templates | Dynamic |

**Execution flow:**

```mermaid
flowchart TD
    A["*create-service"] --> B[Load create-service.md task]
    B --> C[Elicit: service type selection]
    C --> D{Service type?}
    D -->|api-integration| E[Load API integration template]
    D -->|utility| F[Load utility template]
    D -->|agent-tool| G[Load agent-tool template]
    E --> H[Elicit: service parameters]
    F --> H
    G --> H
    H --> I[Render Handlebars template with inputs]
    I --> J[Generate service files]
    J --> K[Output scaffolded service]
```

---

### `*apply-qa-fixes`, `*run-tests`, `*backlog-debt`

| Command | Task File | Behavior |
|---------|-----------|----------|
| `*apply-qa-fixes` | apply-qa-fixes.md | Apply QA feedback from @qa review |
| `*run-tests` | (built-in) | Execute `npm run lint` + `npm test` |
| `*backlog-debt` | po-manage-story-backlog.md | Elicit debt details, register in backlog |

---

### `*help`, `*guide`, `*session-info`, `*load-full`, `*clear-cache`, `*explain`, `*exit`

These are built-in commands handled by the agent framework, not external task files.

| Command | Behavior |
|---------|----------|
| `*help` | Renders full command list from `commands[]` in agent definition |
| `*guide` | Renders the `## Developer Guide` section from agent .md |
| `*session-info` | Shows session context (agent history, commands, project status) |
| `*load-full` | Loads a complete file from devLoadAlwaysFiles (bypasses cache/summary) |
| `*clear-cache` | Clears dev context cache to force fresh file load |
| `*explain` | Explains last action in teaching detail |
| `*exit` | Exits developer mode, returns to base Claude Code |

---

## 4. Complete Dependency Graph

```mermaid
graph TD
    subgraph "Agent Definition"
        AD[dev.md]
    end

    subgraph "Activation Pipeline"
        GB[greeting-builder.js]
        ACL[agent-config-loader.js]
        CD[context-detector.js]
        GCD[git-config-detector.js]
        PSL[project-status-loader.js]
        GPM[greeting-preference-manager.js]
        WN[workflow-navigator.js]
        PM[permissions/index.js]
    end

    subgraph "Config Files"
        CC[core-config.yaml]
        ACR[agent-config-requirements.yaml]
        WP[workflow-patterns.yaml]
        TP[technical-preferences.md]
    end

    subgraph "devLoadAlwaysFiles"
        CS[coding-standards.md]
        TS[tech-stack.md]
        ST[source-tree.md]
    end

    subgraph "Task Files (22 - ALL EXIST)"
        T1[dev-develop-story.md]
        T2[plan-execute-subtask.md]
        T3[verify-subtask.md]
        T4[apply-qa-fixes.md]
        T5[qa-fix-issues.md]
        T6[create-service.md]
        T7[execute-checklist.md]
        T8[waves.md]
        T9[build-resume.md]
        T10[build-status.md]
        T11[build-autonomous.md]
        T12[gotcha.md]
        T13[gotchas.md]
        T14[create-worktree.md]
        T15[list-worktrees.md]
        T16[remove-worktree.md]
        T17[dev-improve-code-quality.md]
        T18[po-manage-story-backlog.md]
        T19[dev-optimize-performance.md]
        T20[dev-suggest-refactoring.md]
        T21[sync-documentation.md]
        T22[validate-next-story.md]
    end

    subgraph "Checklists"
        CL1["self-critique-checklist.md (EXISTS)"]
        CL2["story-dod-checklist.md (MISSING)"]
    end

    subgraph "Scripts (9 MISSING, 1 EXISTS)"
        S0["greeting-builder.js (EXISTS)"]
        S1["recovery-tracker.js (MISSING)"]
        S2["stuck-detector.js (MISSING)"]
        S3["approach-manager.js (MISSING)"]
        S4["rollback-manager.js (MISSING)"]
        S5["build-state-manager.js (MISSING)"]
        S6["autonomous-build-loop.js (MISSING)"]
        S7["build-orchestrator.js (MISSING)"]
        S8["gotchas-memory.js (MISSING)"]
        S9["worktree-manager.js (MISSING)"]
    end

    subgraph "Tools"
        TOOL1[coderabbit - pre-commit review]
        TOOL2["git - local ops only (NO PUSH)"]
        TOOL3[context7 - library docs]
        TOOL4[supabase - database ops]
        TOOL5[n8n - workflow automation]
        TOOL6[browser - web testing]
        TOOL7[ffmpeg - media processing]
    end

    AD --> GB
    AD --> ACL
    GB --> CD
    GB --> GCD
    GB --> PSL
    GB --> GPM
    GB --> WN
    GB --> PM
    ACL --> ACR
    ACL --> CC
    ACL --> TP
    ACL --> CS
    ACL --> TS
    ACL --> ST
    WN --> WP
    GPM --> CC

    AD -.->|commands| T1
    AD -.->|commands| T2
    AD -.->|commands| T3
    AD -.->|commands| T4
    AD -.->|commands| T5
    AD -.->|commands| T6
    AD -.->|commands| T7
    AD -.->|commands| T8
    AD -.->|commands| T9
    AD -.->|commands| T10
    AD -.->|commands| T11
    AD -.->|commands| T12
    AD -.->|commands| T13
    AD -.->|commands| T14
    AD -.->|commands| T15
    AD -.->|commands| T16
    AD -.->|commands| T17
    AD -.->|commands| T18
    AD -.->|commands| T19
    AD -.->|commands| T20
    AD -.->|commands| T21
    AD -.->|commands| T22

    T1 -.->|checklist| CL1
    T1 -.->|checklist| CL2
    T2 -.->|checklist| CL1
    T2 -.->|script| S1
    T2 -.->|script| S2
    AD -.->|script| S3
    AD -.->|script| S4
    T9 -.->|script| S5
    T11 -.->|script| S6
    AD -.->|script| S7
    T12 -.->|script| S8
    T13 -.->|script| S8
    T14 -.->|script| S9

    T1 -.->|tool| TOOL1
    AD -.->|tool| TOOL2
    AD -.->|tool| TOOL3
    AD -.->|tool| TOOL4
    AD -.->|tool| TOOL5
    AD -.->|tool| TOOL6
    AD -.->|tool| TOOL7
```

---

## 5. Cross-Agent Interactions

| Interaction | Direction | Trigger |
|-------------|-----------|---------|
| @sm -> @dev | Receives | Story assignment for implementation |
| @dev -> @qa | Handoff | Story "Ready for Review" triggers QA review |
| @qa -> @dev | Receives | QA feedback via `*apply-qa-fixes` or `QA_FIX_REQUEST.md` |
| @dev -> @github-devops | Delegate | Git push, PR creation, remote operations |
| @pm -> @dev | Receives | Requirements and strategic direction via stories |

### Delegation Rules (from agent definition)

**Collaborates with @qa when:**
- Code review feedback received via `*apply-qa-fixes`
- QA fix requests arrive via `QA_FIX_REQUEST.md`
- Quality validation during story completion

**Collaborates with @sm when:**
- Receiving story assignments
- Reporting story completion

**Delegates to @github-devops when:**
- Git push operations to remote repository
- Pull request creation and management
- Any remote git operations

**Retains:**
- All local development operations
- Local git operations (add, commit, status, diff, log, branch, checkout, merge)
- Code implementation, testing, and validation
- Story file updates (authorized sections only)

**Git restrictions:**
- ALLOWED: `git add`, `git commit`, `git status`, `git diff`, `git log`, `git branch`, `git checkout`, `git merge`
- BLOCKED: `git push`, `git push --force`, `gh pr create`, `gh pr merge`

### CodeRabbit Self-Healing Integration

| Phase | Behavior |
|-------|----------|
| Trigger | `story_completion` (before "Ready for Review") |
| Mode | Light - CRITICAL issues only |
| Max Iterations | 2 |
| Timeout | 15 minutes per iteration |
| CRITICAL severity | `auto_fix` (immediately) |
| HIGH severity | `document_only` (in story Dev Notes) |
| MEDIUM/LOW severity | `ignore` |

```mermaid
flowchart TD
    A[Story tasks complete] --> B[Start CodeRabbit self-healing loop]
    B --> C["Run: wsl bash -c 'coderabbit --prompt-only -t uncommitted'"]
    C --> D{CRITICAL issues?}
    D -->|no| E[Document HIGH issues in Dev Notes]
    E --> F["Log: CodeRabbit passed"]
    F --> G[Proceed to story-dod-checklist]
    D -->|yes| H{iteration < 2?}
    H -->|yes| I[Auto-fix CRITICAL issues]
    I --> J[iteration++]
    J --> C
    H -->|no| K["HALT: CRITICAL issues remain after 2 iterations"]
    K --> L[Report to user - DO NOT mark complete]
```

---

## 6. Missing Dependencies

| File | Type | Referenced By | Impact |
|------|------|---------------|--------|
| `story-dod-checklist.md` | Checklist | `*develop` completion process | Story completion validation incomplete |
| `recovery-tracker.js` | Script | `*track-attempt`, `*execute-subtask` | Recovery tracking non-functional |
| `stuck-detector.js` | Script | `*execute-subtask` (ADE) | Stuck detection non-functional |
| `approach-manager.js` | Script | Recovery System (Epic 5) | Approach management non-functional |
| `rollback-manager.js` | Script | `*rollback` | Rollback operations non-functional |
| `build-state-manager.js` | Script | `*build-resume`, `*build-log`, `*build-cleanup` | Build state persistence non-functional |
| `autonomous-build-loop.js` | Script | `*build-autonomous` | Autonomous build loop non-functional |
| `build-orchestrator.js` | Script | `*build` | Full build pipeline non-functional |
| `gotchas-memory.js` | Script | `*gotcha`, `*gotchas`, `*gotcha-context` | Gotchas memory system non-functional |
| `worktree-manager.js` | Script | `*worktree-merge`, `*worktree-create` | Worktree management non-functional |

### Dependency Verification Summary

| Category | Total | Existing | Missing | Health |
|----------|-------|----------|---------|--------|
| Checklists | 2 | 1 (50%) | 1 (50%) | Partial |
| Tasks | 22 | 22 (100%) | 0 (0%) | Complete |
| Scripts | 10 | 1 (10%) | 9 (90%) | Critical |
| Tools | 7 | 7 (100%) | 0 (0%) | Complete |

---

*Traced from source on 2026-02-05 | Story AIOS-TRACE-001*
