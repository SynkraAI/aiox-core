# @po (Pax) - Execution Trace

> Traced from source code, not documentation.
> Agent definition: `.aios-core/development/agents/po.md`

## 1. Activation Trace

### 1.1 Files Loaded (in order)

| Order | File | Loader | Purpose |
|-------|------|--------|---------|
| 1 | `.aios-core/development/agents/po.md` | AgentConfigLoader.loadAgentDefinition() | Agent definition (YAML block) |
| 2 | `.aios-core/core-config.yaml` | GreetingBuilder._loadConfig() | Core configuration |
| 3 | `.aios-core/data/agent-config-requirements.yaml` | AgentConfigLoader.loadRequirements() | Config sections: devStoryLocation, prd, storyBacklog, templatesLocation |
| 4 | `.aios-core/data/workflow-patterns.yaml` | WorkflowNavigator._loadPatterns() | Workflow state detection |
| 5 | `.aios-core/product/data/elicitation-methods.md` | AgentConfigLoader.loadFile() | Elicitation methods (always loaded, 5KB) |
| 6 | `.aios/session-state.json` | ContextDetector._detectFromFile() | Session type detection (if no conversation history) |
| 7 | `.aios/project-status.yaml` | ProjectStatusLoader.loadCache() | Cached project status (60s TTL) |

### 1.2 Greeting Construction

**Activation path:** Direct invocation (STEP 3 calls `GreetingBuilder.buildGreeting()`)

```mermaid
sequenceDiagram
    participant CC as Claude Code
    participant PMd as po.md
    participant ACL as AgentConfigLoader
    participant GB as GreetingBuilder
    participant GPM as GreetingPreferenceManager
    participant CD as ContextDetector
    participant GCD as GitConfigDetector
    participant PSL as ProjectStatusLoader
    participant PM as PermissionMode

    CC->>PMd: Load agent file (STEP 1)
    CC->>PMd: Adopt persona (STEP 2)
    CC->>ACL: loadAgentDefinition('po')
    ACL-->>CC: { agent: { name: 'Pax', icon: '🎯' }, commands: [...18], ... }

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

    Note over GB: Assemble sections:<br/>1. Presentation (archetypal + badge)<br/>2. Role Description (new session)<br/>3. Project Status<br/>4. Commands (full visibility)<br/>5. Footer + signature

    GB-->>CC: Formatted greeting
    CC->>CC: Display greeting (STEP 4)
    CC->>CC: HALT and await input (STEP 5)
```

### 1.3 Agent-Specific Config

From `agent-config-requirements.yaml`:

```yaml
po:
  config_sections:
    - devStoryLocation
    - prd
    - storyBacklog
    - templatesLocation
  files_loaded:
    - path: .aios-core/product/data/elicitation-methods.md
      lazy: false
      size: 5KB
  lazy_loading:
    story_templates: true      # Load when creating stories
    prd_templates: true        # Load when creating PRDs
  performance_target: <75ms
```

### 1.4 Context Brought to Session

| Data | Source | Value |
|------|--------|-------|
| Greeting level | `persona_profile.greeting_levels.archetypal` | `🎯 Pax the Balancer ready to balance!` |
| Signature | `persona_profile.communication.signature_closing` | `— Pax, equilibrando prioridades 🎯` |
| Role | `persona.role` | Technical Product Owner & Process Steward |
| Commands shown | `filterCommandsByVisibility('full')` | 18 commands with `full` visibility |

---

## 2. Command Registry

| Command | Task File | Visibility | Elicit |
|---------|-----------|------------|--------|
| `*help` | (built-in) | full, quick, key | No |
| `*backlog-add` | po-backlog-add.md | full, quick | Yes |
| `*backlog-review` | po-manage-story-backlog.md | full, quick | Optional |
| `*backlog-summary` | po-manage-story-backlog.md | quick, key | No |
| `*backlog-prioritize` | po-manage-story-backlog.md | full | Yes |
| `*backlog-schedule` | po-manage-story-backlog.md | full | Yes |
| `*stories-index` | po-stories-index.md | full, quick | No |
| `*validate-story-draft` | validate-next-story.md | full, quick, key | Yes |
| `*sync-story` | po-sync-story.md | full | Yes |
| `*pull-story` | po-pull-story.md | full | Yes |
| `*execute-checklist-po` | execute-checklist.md + po-master-checklist.md | quick | Optional |
| `*shard-doc` | shard-doc.md | full | Yes |
| `*doc-out` | (built-in) | full | No |
| `*session-info` | (built-in) | full | No |
| `*guide` | (built-in, rendered from agent .md) | full, quick | No |
| `*yolo` | (built-in) | full | No |
| `*exit` | (built-in) | full | No |

**NOTE:** `create-epic` and `create-story` have been REMOVED from @po. Epic creation is delegated to @pm, story creation is delegated to @sm.

---

## 3. Per-Command Execution Traces

### `*backlog-add`

**Task file:** `.aios-core/development/tasks/po-backlog-add.md`

**Dependencies loaded:**
| File | Type | Status |
|------|------|--------|
| `po-backlog-add.md` | Task | EXISTS |
| `.aios-core/product/data/elicitation-methods.md` | Data | EXISTS (pre-loaded) |
| `docs/stories/backlog.yaml` | Data | Dynamically loaded |

**Execution flow:**

```mermaid
flowchart TD
    A["*backlog-add"] --> B[Load po-backlog-add.md task]
    B --> C[Elicit: item type selection<br/>follow-up / tech-debt / enhancement]
    C --> D[Elicit: item details<br/>title, description, priority]
    D --> E[Validate item against backlog schema]
    E --> F[Append item to backlog.yaml]
    F --> G[Output: confirmation with item summary]
```

**Expected output:** New backlog item added with unique ID, priority, and type classification.

---

### `*backlog-review`

**Task file:** `.aios-core/development/tasks/po-manage-story-backlog.md`

**Dependencies loaded:**
| File | Type | Status |
|------|------|--------|
| `po-manage-story-backlog.md` | Task | EXISTS |
| `docs/stories/backlog.yaml` | Data | Dynamically loaded |
| `docs/stories/active/` | Directory | Scanned for active stories |

**Execution flow:**

```mermaid
flowchart TD
    A["*backlog-review"] --> B[Load po-manage-story-backlog.md task]
    B --> C[Read backlog.yaml]
    C --> D[Scan active stories directory]
    D --> E[Cross-reference active work vs backlog]
    E --> F[Group items by priority and type]
    F --> G[Generate sprint planning review report]
    G --> H[Output: formatted backlog review<br/>with recommendations]
```

**Expected output:** Sprint planning review with prioritized items and scheduling recommendations.

---

### `*backlog-summary`

**Task file:** `.aios-core/development/tasks/po-manage-story-backlog.md`

**Dependencies loaded:**
| File | Type | Status |
|------|------|--------|
| `po-manage-story-backlog.md` | Task | EXISTS |
| `docs/stories/backlog.yaml` | Data | Dynamically loaded |

**Execution flow:**

```mermaid
flowchart TD
    A["*backlog-summary"] --> B[Load po-manage-story-backlog.md task]
    B --> C[Read backlog.yaml]
    C --> D[Count items by status and priority]
    D --> E[Output: quick summary<br/>total / open / in-progress / blocked]
```

**Expected output:** Quick status counts and health indicators for the backlog.

---

### `*backlog-prioritize`

**Task file:** `.aios-core/development/tasks/po-manage-story-backlog.md`

**Dependencies loaded:**
| File | Type | Status |
|------|------|--------|
| `po-manage-story-backlog.md` | Task | EXISTS |
| `docs/stories/backlog.yaml` | Data | Dynamically loaded |

**Execution flow:**

```mermaid
flowchart TD
    A["*backlog-prioritize {item} {priority}"] --> B[Load po-manage-story-backlog.md task]
    B --> C[Resolve item in backlog.yaml]
    C --> D{Item exists?}
    D -->|yes| E[Elicit: confirm priority change]
    D -->|no| F[Error: item not found]
    E --> G[Update priority in backlog.yaml]
    G --> H[Re-sort backlog by priority]
    H --> I[Output: updated priority confirmation]
```

---

### `*backlog-schedule`

**Task file:** `.aios-core/development/tasks/po-manage-story-backlog.md`

**Dependencies loaded:**
| File | Type | Status |
|------|------|--------|
| `po-manage-story-backlog.md` | Task | EXISTS |
| `docs/stories/backlog.yaml` | Data | Dynamically loaded |

**Execution flow:**

```mermaid
flowchart TD
    A["*backlog-schedule {item} {sprint}"] --> B[Load po-manage-story-backlog.md task]
    B --> C[Resolve item in backlog.yaml]
    C --> D{Item exists?}
    D -->|yes| E[Elicit: confirm sprint assignment]
    D -->|no| F[Error: item not found]
    E --> G[Update sprint field in backlog.yaml]
    G --> H[Output: item scheduled confirmation]
```

---

### `*stories-index`

**Task file:** `.aios-core/development/tasks/po-stories-index.md`

**Dependencies loaded:**
| File | Type | Status |
|------|------|--------|
| `po-stories-index.md` | Task | EXISTS |
| `docs/stories/` | Directory | Scanned recursively |

**Execution flow:**

```mermaid
flowchart TD
    A["*stories-index"] --> B[Load po-stories-index.md task]
    B --> C[Scan docs/stories/ recursively]
    C --> D[Parse story metadata from each file]
    D --> E[Sort by ID and status]
    E --> F[Generate index document]
    F --> G["Output: docs/stories/INDEX.md"]
```

**Expected output:** Regenerated story index with all stories categorized by status.

---

### `*validate-story-draft`

**Task file:** `.aios-core/development/tasks/validate-next-story.md`

**Dependencies loaded:**
| File | Type | Status |
|------|------|--------|
| `validate-next-story.md` | Task | EXISTS |
| `.aios-core/product/templates/story-tmpl.yaml` | Template | EXISTS |
| `.aios-core/product/checklists/po-master-checklist.md` | Checklist | EXISTS |

**Execution flow:**

```mermaid
flowchart TD
    A["*validate-story-draft {story}"] --> B[Load validate-next-story.md task]
    B --> C[Load story file from docs/stories/]
    C --> D[Load story-tmpl.yaml for structure validation]
    D --> E[Validate required sections present]
    E --> F[Validate acceptance criteria are testable]
    F --> G[Validate dependencies documented]
    G --> H[Validate technical tasks defined]
    H --> I{All valid?}
    I -->|yes| J[Output: story approved]
    I -->|no| K[Output: validation errors with fix suggestions]
```

**Expected output:** Validation report with pass/fail per criterion and actionable fix suggestions.

---

### `*sync-story`

**Task file:** `.aios-core/development/tasks/po-sync-story.md`

**Dependencies loaded:**
| File | Type | Status |
|------|------|--------|
| `po-sync-story.md` | Task | EXISTS |
| Story file from `docs/stories/` | Input | Required |

**Execution flow:**

```mermaid
flowchart TD
    A["*sync-story {story-id}"] --> B[Load po-sync-story.md task]
    B --> C[Load story file]
    C --> D[Detect configured PM tool]
    D --> E{PM tool type?}
    E -->|ClickUp| F[Sync to ClickUp task via API]
    E -->|GitHub Projects| G[Sync to GitHub issue via gh CLI]
    E -->|Jira| H[Sync to Jira issue via API]
    E -->|Local-only| I[Validate YAML only<br/>no external sync]
    E -->|None configured| J[Prompt: run aios init]
    F --> K[Output: sync confirmation with link]
    G --> K
    H --> K
    I --> L[Output: local validation result]
```

**Tools used:** github-cli (GitHub Projects mode)

**PM tool-agnostic:** Works with ClickUp, GitHub Projects, Jira, or local-only mode.

---

### `*pull-story`

**Task file:** `.aios-core/development/tasks/po-pull-story.md`

**Dependencies loaded:**
| File | Type | Status |
|------|------|--------|
| `po-pull-story.md` | Task | EXISTS |
| Story file from `docs/stories/` | Input | Required |

**Execution flow:**

```mermaid
flowchart TD
    A["*pull-story {story-id}"] --> B[Load po-pull-story.md task]
    B --> C[Detect configured PM tool]
    C --> D{PM tool type?}
    D -->|ClickUp| E[Pull updates from ClickUp]
    D -->|GitHub Projects| F[Pull updates from GitHub issue]
    D -->|Jira| G[Pull updates from Jira]
    D -->|Local-only| H["Output: Story file is source of truth"]
    E --> I[Merge updates into local story file]
    F --> I
    G --> I
    I --> J[Output: updated fields summary]
```

**Tools used:** github-cli (GitHub Projects mode)

**PM tool-agnostic:** Works with ClickUp, GitHub Projects, Jira, or local-only mode.

---

### `*execute-checklist-po`

**Task file:** `.aios-core/development/tasks/execute-checklist.md`

**Dependencies loaded:**
| File | Type | Status |
|------|------|--------|
| `execute-checklist.md` | Task | EXISTS |
| `.aios-core/product/checklists/po-master-checklist.md` | Checklist | EXISTS |
| `.aios-core/scripts/execute-task.js` | Script | Referenced |

**Execution flow:**

```mermaid
flowchart TD
    A["*execute-checklist-po"] --> B[Load execute-checklist.md task]
    B --> C[Resolve checklist: po-master-checklist.md]
    C --> D[Parse checklist items]
    D --> E{YOLO mode?}
    E -->|yes| F[Auto-validate all items]
    E -->|no| G[Interactive item-by-item validation]
    F --> H[Generate validation report]
    G --> H
    H --> I[Output results with pass/fail per item]
```

---

### `*shard-doc`

**Task file:** `.aios-core/development/tasks/shard-doc.md`

**Dependencies loaded:**
| File | Type | Status |
|------|------|--------|
| `shard-doc.md` | Task | EXISTS |
| Target document | Input | Required (user specifies) |

**Execution flow:**

```mermaid
flowchart TD
    A["*shard-doc {document} {destination}"] --> B[Load shard-doc.md task]
    B --> C[Read source document]
    C --> D[Analyze document structure<br/>headings, sections, length]
    D --> E[Elicit: sharding strategy<br/>by section / by size / custom]
    E --> F[Split document into parts]
    F --> G[Write sharded files to destination]
    G --> H[Output: file list with sizes]
```

**Expected output:** Document broken into smaller, navigable parts at the specified destination.

---

### `*help`, `*guide`, `*session-info`, `*doc-out`, `*yolo`, `*exit`

These are built-in commands handled by the agent framework, not external task files.

| Command | Behavior |
|---------|----------|
| `*help` | Renders full command list from `commands[]` in agent definition |
| `*guide` | Renders the `## 🎯 Product Owner Guide` section from agent .md |
| `*session-info` | Shows session context (agent history, commands, project status) |
| `*doc-out` | Outputs complete document content to file |
| `*yolo` | Toggles confirmation skipping mode |
| `*exit` | Exits PO mode, returns to base Claude Code |

---

## 4. Complete Dependency Graph

```mermaid
graph TD
    subgraph "Agent Definition"
        AD[po.md]
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
        EM[elicitation-methods.md]
    end

    subgraph "Task Files"
        T1[correct-course.md]
        T2[create-brownfield-story.md]
        T3[execute-checklist.md]
        T4[po-manage-story-backlog.md]
        T5[po-pull-story.md]
        T6[shard-doc.md]
        T7[po-sync-story.md]
        T8[validate-next-story.md]
        T9[po-backlog-add.md]
        T10[po-stories-index.md]
        T11["po-sync-story-to-clickup.md (deprecated)"]
        T12["po-pull-story-from-clickup.md (deprecated)"]
    end

    subgraph "Templates"
        TM1[story-tmpl.yaml]
    end

    subgraph "Checklists"
        CL1[po-master-checklist.md]
        CL2[change-checklist.md]
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
    ACL --> EM
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

    T3 -.->|checklist| CL1
    T3 -.->|checklist| CL2
    T8 -.->|template| TM1
```

---

## 5. Cross-Agent Interactions

| Interaction | Direction | Trigger |
|-------------|-----------|---------|
| @sm -> @po | Coordinates | Backlog prioritization and sprint planning |
| @pm -> @po | Provides | Strategic direction, PRDs, requirements |
| @po -> @sm | Delegate | Story creation via `*draft` |
| @po -> @pm | Delegate | Epic creation via `*create-epic` |
| @po -> @aios-master | Escalate | Course corrections via `*correct-course` |
| @po -> @analyst | Delegate | Research via `*research` |
| @po -> @devops | Delegate | Git push operations, PR creation |
| @pm -> @po | Receives | Story validation requests via `*validate-story-draft` |
| @sm -> @po | Receives | Backlog prioritization via `*backlog-prioritize` |
| @qa -> @po | Receives | Quality gate review via `*backlog-review` |

### Delegation Rules (from agent definition)

**Delegates to @sm when:**
- Story creation is needed (uses `*draft` command)
- Sprint coordination requires SM facilitation

**Delegates to @pm when:**
- Epic creation is needed (uses `*create-epic` command)
- Strategic direction or PRD creation is required

**Delegates to @aios-master when:**
- Course corrections are needed (uses `*correct-course` command)
- Systemic issues require orchestrator-level intervention

**Delegates to @analyst when:**
- Research is needed to inform backlog decisions

**Retains:**
- Backlog management (add, review, prioritize, schedule)
- Story validation and quality gate execution
- Story sync/pull with PM tools (ClickUp, GitHub Projects, Jira, local)
- Document sharding and output
- Stories index generation

**Delegates to @devops when:**
- Git push operations to remote repository
- Pull request creation and management

**Git restrictions:**
- ALLOWED: `git status`, `git log`, `git diff`, `git branch -a`
- BLOCKED: `git push`, `git push --force`, `gh pr create`

---

## 6. Missing Dependencies

| File | Type | Referenced By | Impact |
|------|------|---------------|--------|
| (none) | -- | -- | All 11 task files exist |
| (none) | -- | -- | Template story-tmpl.yaml exists |
| (none) | -- | -- | Both checklists exist |

**Deprecated but retained for backward compatibility:**

| File | Type | Status | Replacement |
|------|------|--------|-------------|
| `po-sync-story-to-clickup.md` | Task | Deprecated | `po-sync-story.md` (PM tool-agnostic) |
| `po-pull-story-from-clickup.md` | Task | Deprecated | `po-pull-story.md` (PM tool-agnostic) |

---

*Traced from source on 2026-02-05 | Story AIOS-TRACE-001*
