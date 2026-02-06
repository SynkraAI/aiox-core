# @pm (Morgan) - Execution Trace

> Traced from source code, not documentation.
> Agent definition: `.aios-core/development/agents/pm.md`

## 1. Activation Trace

### 1.1 Files Loaded (in order)

| Order | File | Loader | Purpose |
|-------|------|--------|---------|
| 1 | `.aios-core/development/agents/pm.md` | AgentConfigLoader.loadAgentDefinition() | Agent definition (YAML block) |
| 2 | `.aios-core/core-config.yaml` | GreetingBuilder._loadConfig() | Core configuration |
| 3 | `.aios-core/data/agent-config-requirements.yaml` | AgentConfigLoader.loadRequirements() | Config sections: devStoryLocation, storyBacklog |
| 4 | `.aios-core/data/workflow-patterns.yaml` | WorkflowNavigator._loadPatterns() | Workflow state detection |
| 5 | `.aios/session-state.json` | ContextDetector._detectFromFile() | Session type detection (if no conversation history) |
| 6 | `.aios/project-status.yaml` | ProjectStatusLoader.loadCache() | Cached project status (60s TTL) |

**Note:** PM loads NO additional files at activation (`files_loaded: []` in agent-config-requirements.yaml). This is the lightest agent activation in the framework.

### 1.2 Greeting Construction

**Activation path:** Direct invocation (STEP 3 calls `GreetingBuilder.buildGreeting()`)

```mermaid
sequenceDiagram
    participant CC as Claude Code
    participant AMd as pm.md
    participant ACL as AgentConfigLoader
    participant GB as GreetingBuilder
    participant GPM as GreetingPreferenceManager
    participant CD as ContextDetector
    participant GCD as GitConfigDetector
    participant PSL as ProjectStatusLoader
    participant PM as PermissionMode

    CC->>AMd: Load agent file (STEP 1)
    CC->>AMd: Adopt persona (STEP 2)
    CC->>ACL: loadAgentDefinition('pm')
    ACL-->>CC: { agent: { name: 'Morgan', icon: '📋' }, commands: [...16], ... }

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
pm:
  config_sections:
    - devStoryLocation
    - storyBacklog
  files_loaded: []
  lazy_loading: {}
  performance_target: <100ms
```

### 1.4 Context Brought to Session

| Data | Source | Value |
|------|--------|-------|
| Greeting level | `persona_profile.greeting_levels.archetypal` | `📋 Morgan the Strategist ready to strategize!` |
| Signature | `persona_profile.communication.signature_closing` | `— Morgan, planejando o futuro 📊` |
| Role | `persona.role` | Investigative Product Strategist & Market-Savvy PM |
| Commands shown | `filterCommandsByVisibility('full')` | 16 commands with `full` visibility |

---

## 2. Command Registry

| Command | Task File | Visibility | Elicit |
|---------|-----------|------------|--------|
| `*help` | (built-in) | full, quick, key | No |
| `*create-prd` | create-doc.md + prd-tmpl.yaml | full, quick, key | Yes |
| `*create-brownfield-prd` | create-doc.md + brownfield-prd-tmpl.yaml | full, quick | Yes |
| `*create-epic` | brownfield-create-epic.md | full, quick, key | Yes |
| `*create-story` | brownfield-create-story.md | full, quick | Yes |
| `*doc-out` | (built-in) | full | No |
| `*shard-prd` | shard-doc.md | full | No |
| `*research` | create-deep-research-prompt.md | full, quick | Yes |
| `*gather-requirements` | spec-gather-requirements.md | full, quick | Yes |
| `*write-spec` | spec-write-spec.md | full, quick | Yes |
| `*session-info` | (built-in) | full | No |
| `*guide` | (built-in, rendered from agent .md) | full, quick | No |
| `*yolo` | (built-in) | full | No |
| `*exit` | (built-in) | full | No |

**Additional task dependencies (not directly mapped to commands):**

| Task File | Used By | Status |
|-----------|---------|--------|
| `correct-course.md` | Delegated to @aios-master | EXISTS |
| `execute-checklist.md` | Checklist execution | EXISTS |

---

## 3. Per-Command Execution Traces

### `*create-prd`

**Task file:** `.aios-core/development/tasks/create-doc.md`
**Template:** `.aios-core/development/templates/prd-tmpl.yaml` (MISSING in development/templates/)

**Dependencies loaded:**
| File | Type | Status |
|------|------|--------|
| `create-doc.md` | Task | EXISTS |
| `prd-tmpl.yaml` | Template | MISSING in development/templates/ |
| `.aios-core/product/templates/prd-tmpl.yaml` | Template | EXISTS (fallback) |
| `.aios-core/data/elicitation-methods` | Data | Referenced by create-doc |

**Execution flow:**

```mermaid
flowchart TD
    A["*create-prd"] --> B[Load create-doc.md task]
    B --> C[Load template: prd-tmpl.yaml]
    C --> D{Template exists?}
    D -->|yes| E[Parse YAML template structure]
    D -->|no| F[Scan product/templates/ fallback]
    F --> E
    E --> G[Step-by-step elicitation<br/>format: numbered 1-9 options]
    G --> H[Fill template sections with user input]
    H --> I[Validate document against template schema]
    I --> J[Generate PRD document]
    J --> K[Output document to specified path]
```

**Expected output:** Complete Product Requirements Document

---

### `*create-brownfield-prd`

**Task file:** `.aios-core/development/tasks/create-doc.md`
**Template:** `.aios-core/development/templates/brownfield-prd-tmpl.yaml` (MISSING in development/templates/)

**Dependencies loaded:**
| File | Type | Status |
|------|------|--------|
| `create-doc.md` | Task | EXISTS |
| `brownfield-prd-tmpl.yaml` | Template | MISSING in development/templates/ |
| `.aios-core/product/templates/brownfield-prd-tmpl.yaml` | Template | EXISTS (fallback) |

Same flow as `*create-prd` with brownfield-specific template that includes existing project context analysis.

---

### `*create-epic`

**Task file:** `.aios-core/development/tasks/brownfield-create-epic.md`

**Dependencies loaded:**
| File | Type | Status |
|------|------|--------|
| `brownfield-create-epic.md` | Task | EXISTS |
| `.aios-core/product/templates/prd-tmpl.yaml` | Template | EXISTS (epic structure) |
| `.aios-core/product/checklists/pm-checklist.md` | Checklist | EXISTS |

**Execution flow:**

```mermaid
flowchart TD
    A["*create-epic"] --> B[Load brownfield-create-epic.md task]
    B --> C[Elicit: epic scope and goals]
    C --> D[Analyze existing codebase context]
    D --> E[Define epic structure with stories]
    E --> F[Embed quality gates and agent assignments]
    F --> G[Validate against pm-checklist]
    G --> H["Output: epic document with story breakdown"]
```

**Expected output:** Epic document with story breakdown, quality gates, and agent assignments

---

### `*create-story`

**Task file:** `.aios-core/development/tasks/brownfield-create-story.md`

**Dependencies loaded:**
| File | Type | Status |
|------|------|--------|
| `brownfield-create-story.md` | Task | EXISTS |
| `.aios-core/product/templates/story-tmpl.yaml` | Template | EXISTS (in product/templates/) |

**Execution flow:**

```mermaid
flowchart TD
    A["*create-story"] --> B[Load brownfield-create-story.md task]
    B --> C[Elicit: story context and requirements]
    C --> D[Analyze brownfield project state]
    D --> E[Generate story with acceptance criteria]
    E --> F["Output: docs/stories/{storyId}.md"]
```

**Expected output:** User story document with acceptance criteria

---

### `*research`

**Task file:** `.aios-core/development/tasks/create-deep-research-prompt.md`

**Dependencies loaded:**
| File | Type | Status |
|------|------|--------|
| `create-deep-research-prompt.md` | Task | EXISTS |

**Execution flow:**

```mermaid
flowchart TD
    A["*research {topic}"] --> B[Load create-deep-research-prompt.md]
    B --> C[Elicit: research type selection]
    C --> D[Elicit: research parameters]
    D --> E[Generate structured research prompt]
    E --> F[Use context7 tool for documentation lookup]
    F --> G[Compile research findings]
    G --> H[Output research report]
```

**Tools used:** github-cli (repo access), context7 (library docs)

---

### `*gather-requirements`

**Task file:** `.aios-core/development/tasks/spec-gather-requirements.md`

**Dependencies loaded:**
| File | Type | Status |
|------|------|--------|
| `spec-gather-requirements.md` | Task | EXISTS |

**Execution flow:**

```mermaid
flowchart TD
    A["*gather-requirements"] --> B[Load spec-gather-requirements.md]
    B --> C[Elicit: stakeholder identification]
    C --> D[Elicit: requirement categories]
    D --> E[Structured requirement collection]
    E --> F[Prioritize requirements]
    F --> G[Validate completeness]
    G --> H["Output: requirements document"]
```

**Expected output:** Structured requirements document ready for spec writing

---

### `*write-spec`

**Task file:** `.aios-core/development/tasks/spec-write-spec.md`

**Dependencies loaded:**
| File | Type | Status |
|------|------|--------|
| `spec-write-spec.md` | Task | EXISTS |

**Execution flow:**

```mermaid
flowchart TD
    A["*write-spec"] --> B[Load spec-write-spec.md]
    B --> C[Read gathered requirements]
    C --> D[Structure specification sections]
    D --> E[Define functional requirements]
    E --> F[Define non-functional requirements]
    F --> G[Generate formal specification]
    G --> H["Output: specification document"]
```

**Expected output:** Formal specification document from gathered requirements

---

### `*shard-prd`

**Task file:** `.aios-core/development/tasks/shard-doc.md`

**Dependencies loaded:**
| File | Type | Status |
|------|------|--------|
| `shard-doc.md` | Task | EXISTS |

**Execution flow:**

```mermaid
flowchart TD
    A["*shard-prd"] --> B[Load shard-doc.md task]
    B --> C[Read target PRD document]
    C --> D[Analyze document structure]
    D --> E[Identify natural break points]
    E --> F[Split into smaller focused documents]
    F --> G["Output: multiple sharded documents"]
```

**Expected output:** PRD broken into smaller, focused document parts

---

### `*help`, `*guide`, `*session-info`, `*doc-out`, `*yolo`, `*exit`

These are built-in commands handled by the agent framework, not external task files.

| Command | Behavior |
|---------|----------|
| `*help` | Renders full command list from `commands[]` in agent definition |
| `*guide` | Renders the `## Product Manager Guide` section from agent .md |
| `*session-info` | Shows session context (agent history, commands, project status) |
| `*doc-out` | Outputs complete document content |
| `*yolo` | Toggles confirmation skipping mode |
| `*exit` | Exits PM mode, returns to base Claude Code |

---

## 4. Complete Dependency Graph

```mermaid
graph TD
    subgraph "Agent Definition"
        AD[pm.md]
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
    end

    subgraph "Task Files"
        T1[create-doc.md]
        T2[correct-course.md]
        T3[create-deep-research-prompt.md]
        T4[brownfield-create-epic.md]
        T5[brownfield-create-story.md]
        T6[execute-checklist.md]
        T7[shard-doc.md]
        T8[spec-gather-requirements.md]
        T9[spec-write-spec.md]
    end

    subgraph "Templates (MISSING in development/templates/)"
        TM1[prd-tmpl.yaml]
        TM2[brownfield-prd-tmpl.yaml]
    end

    subgraph "Templates (EXISTS in product/templates/)"
        TP1[prd-tmpl.yaml]
        TP2[brownfield-prd-tmpl.yaml]
        TP3[story-tmpl.yaml]
    end

    subgraph "Checklists (MISSING in development/checklists/)"
        CL1[pm-checklist.md]
        CL2[change-checklist.md]
    end

    subgraph "Checklists (EXISTS in product/checklists/)"
        CP1[pm-checklist.md]
        CP2[change-checklist.md]
    end

    subgraph "Orchestration (TerminalSpawner)"
        TS[terminal-spawner.js]
        EA[executor-assignment.js]
        PS[pm.sh]
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

    T1 -.->|template| TM1
    T1 -.->|template| TM2
    TM1 -.->|fallback| TP1
    TM2 -.->|fallback| TP2
    T5 -.->|template| TP3
    T6 -.->|checklist| CL1
    T6 -.->|checklist| CL2
    CL1 -.->|fallback| CP1
    CL2 -.->|fallback| CP2

    AD -.->|orchestration| TS
    AD -.->|orchestration| EA
    AD -.->|orchestration| PS
```

---

## 5. Cross-Agent Interactions

| Interaction | Direction | Trigger |
|-------------|-----------|---------|
| @pm -> @po | Provides | PRDs and strategic direction |
| @pm -> @sm | Delegate | Story creation via `*draft` |
| @pm -> @analyst | Delegate | Deep research via `*research` |
| @pm -> @architect | Collaborate | Technical architecture decisions |
| @pm -> @aios-master | Escalate | Course corrections via `*correct-course` |
| @pm -> @devops | Delegate | Git push operations, PR creation |
| @analyst -> @pm | Receives | Project brief for PRD creation |
| @aios-master -> @pm | Receives | Framework modification requests |

### Delegation Rules (from agent definition)

**CRITICAL CONSTRAINT: NEVER_EMULATE_AGENTS**

PM must NEVER emulate other agents within its context window. When a task requires another agent, PM uses TerminalSpawner to spawn them in SEPARATE terminals, preventing context pollution.

**Spawning Workflow:**
1. **Analyze** - Determine required agent and task from user request
2. **Assign** - Use ExecutorAssignment to get the correct agent for the work type
3. **Prepare** - Create context file with story, relevant files, and instructions
4. **Spawn** - Call `TerminalSpawner.spawnAgent(agent, task, context)`
5. **Wait** - Poll for agent completion (respects timeout)
6. **Return** - Present agent output to user

**Integration modules:**
| Module | Path | Status |
|--------|------|--------|
| TerminalSpawner | `.aios-core/core/orchestration/terminal-spawner.js` | EXISTS |
| ExecutorAssignment | `.aios-core/core/orchestration/executor-assignment.js` | EXISTS |
| PM Script | `.aios-core/scripts/pm.sh` | EXISTS |

**Delegates to @sm when:**
- Story creation from epics
- Sprint planning and story breakdown

**Delegates to @analyst when:**
- Deep market research
- Competitive analysis
- Data-driven insights

**Delegates to @architect when:**
- Technical architecture decisions
- Technology selection

**Escalates to @aios-master when:**
- Course corrections detected
- Framework modifications needed

**Retains:**
- PRD creation and management
- Epic structure and breakdown
- Product strategy and vision
- Feature prioritization (MoSCoW, RICE)
- Stakeholder communication
- Requirements gathering and spec writing

**Git restrictions:**
- ALLOWED: `git status`, `git log`, `git diff`, `git branch -a`
- BLOCKED: `git push`, `git push --force`, `gh pr create`

---

## 6. Missing Dependencies

| File | Type | Referenced By | Impact |
|------|------|---------------|--------|
| `prd-tmpl.yaml` | Template | `*create-prd` (in development/templates/) | Falls back to product/templates/ (EXISTS there) |
| `brownfield-prd-tmpl.yaml` | Template | `*create-brownfield-prd` (in development/templates/) | Falls back to product/templates/ (EXISTS there) |
| `pm-checklist.md` | Checklist | `execute-checklist.md` (in development/checklists/) | Falls back to product/checklists/ (EXISTS there) |
| `change-checklist.md` | Checklist | `execute-checklist.md` (in development/checklists/) | Falls back to product/checklists/ (EXISTS there) |

**Note:** All 9 task files referenced in dependencies exist in `.aios-core/development/tasks/`. The 2 templates and 2 checklists are missing from `development/` but exist in `product/` as fallback locations.

---

*Traced from source on 2026-02-05 | Story AIOS-TRACE-001*
