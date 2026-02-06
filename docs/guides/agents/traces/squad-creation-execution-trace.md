# @squad-creator (Craft) - Execution Trace

> Traced from source code, not documentation.
> Agent definition: `.aios-core/development/agents/squad-creator.md`

## 1. Activation Trace

### 1.1 Files Loaded (in order)

| Order | File | Loader | Purpose |
|-------|------|--------|---------|
| 1 | `.aios-core/development/agents/squad-creator.md` | AgentConfigLoader.loadAgentDefinition() | Agent definition (YAML block) |
| 2 | `.aios-core/core-config.yaml` | GreetingBuilder._loadConfig() | Core configuration |
| 3 | `.aios-core/data/agent-config-requirements.yaml` | AgentConfigLoader.loadRequirements() | Config sections: dataLocation (no squad-creator entry found) |
| 4 | `.aios-core/data/workflow-patterns.yaml` | WorkflowNavigator._loadPatterns() | Workflow state detection |
| 5 | `.aios/session-state.json` | ContextDetector._detectFromFile() | Session type detection (if no conversation history) |
| 6 | `.aios/project-status.yaml` | ProjectStatusLoader.loadCache() | Cached project status (60s TTL) |

### 1.2 Greeting Construction

**Activation path:** Direct invocation (STEP 3 calls `GreetingBuilder.buildGreeting()`)

```mermaid
sequenceDiagram
    participant CC as Claude Code
    participant AMd as squad-creator.md
    participant ACL as AgentConfigLoader
    participant GB as GreetingBuilder
    participant GPM as GreetingPreferenceManager
    participant CD as ContextDetector
    participant GCD as GitConfigDetector
    participant PSL as ProjectStatusLoader
    participant PM as PermissionMode

    CC->>AMd: Load agent file (STEP 1)
    CC->>AMd: Adopt persona (STEP 2)
    CC->>ACL: loadAgentDefinition('squad-creator')
    ACL-->>CC: { agent: { name: 'Craft', icon: '🏗️' }, commands: [...13], ... }

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

From `agent-config-requirements.yaml`: **No explicit entry found for squad-creator.** Falls back to default config sections.

```yaml
squad-creator:
  config_sections:
    - dataLocation        # default section
  files_loaded: []        # no agent-specific files eagerly loaded
  lazy_loading:
    squad_schemas: true   # Load when validating/creating squads
    squad_templates: true # Load when creating components
  performance_target: <150ms
```

### 1.4 Context Brought to Session

| Data | Source | Value |
|------|--------|-------|
| Greeting level | `persona_profile.greeting_levels.archetypal` | `🏗️ Craft the Architect ready to create!` |
| Signature | `persona_profile.communication.signature_closing` | `— Craft, sempre estruturando 🏗️` |
| Role | `persona.role` | Squad Architect & Builder |
| Commands shown | `filterCommandsByVisibility('full')` | 13 commands with `full` visibility |

---

## 2. Command Registry

| Command | Task File | Visibility | Elicit |
|---------|-----------|------------|--------|
| `*help` | (built-in) | full, quick, key | No |
| `*design-squad` | squad-creator-design.md | full, quick, key | Yes |
| `*create-squad` | squad-creator-create.md | full, quick, key | Yes |
| `*validate-squad` | squad-creator-validate.md | full, quick, key | No |
| `*list-squads` | squad-creator-list.md | full, quick | No |
| `*migrate-squad` | squad-creator-migrate.md | full, quick | No |
| `*analyze-squad` | squad-creator-analyze.md | full, quick, key | Yes |
| `*extend-squad` | squad-creator-extend.md | full, quick, key | Yes |
| `*download-squad` | squad-creator-download.md | full | No |
| `*publish-squad` | squad-creator-publish.md | full | No |
| `*sync-squad-synkra` | squad-creator-sync-synkra.md | full | No |
| `*guide` | (built-in, rendered from agent .md) | full | No |
| `*exit` | (built-in) | full, quick, key | No |

---

## 3. Per-Command Execution Traces

### `*design-squad`

**Task file:** `.aios-core/development/tasks/squad-creator-design.md`

**Dependencies loaded:**
| File | Type | Status |
|------|------|--------|
| `squad-creator-design.md` | Task | EXISTS |
| `squad-designer.js` | Script | EXISTS |
| `squad-design-schema.json` | Schema | EXISTS |

**Execution flow:**

```mermaid
flowchart TD
    A["*design-squad"] --> B[Load squad-creator-design.md task]
    B --> C{Documentation source?}
    C -->|--docs flag| D[Load specified files]
    C -->|interactive| E["Elicit: paste/files/describe"]
    D --> F[Phase 1: Input Normalization<br/>Parse markdown/yaml/json]
    E --> F
    F --> G[Phase 2: Entity Extraction<br/>Identify domain concepts]
    G --> H[Phase 3: Workflow Detection<br/>Map input/process/output]
    H --> I[Phase 4: Integration Mapping<br/>Detect external systems]
    I --> J[Phase 5: Stakeholder Identification<br/>Detect user types/roles]
    J --> K[Recommendation Engine:<br/>Generate agents + tasks]
    K --> L{--quick flag?}
    L -->|yes| M[Accept all recommendations]
    L -->|no| N["Interactive refinement<br/>[A]ccept/[R]eject/[M]odify per agent"]
    M --> O["Generate blueprint<br/>Output: ./squads/.designs/{name}-design.yaml"]
    N --> O
    O --> P[Display summary + next steps]
```

**Expected output:** Blueprint YAML file in `./squads/.designs/` for use with `*create-squad --from-design`

---

### `*create-squad`

**Task file:** `.aios-core/development/tasks/squad-creator-create.md`

**Dependencies loaded:**
| File | Type | Status |
|------|------|--------|
| `squad-creator-create.md` | Task | EXISTS |
| `squad-generator.js` | Script | EXISTS |
| `squad-validator.js` | Script | EXISTS |
| `squad-schema.json` | Schema | EXISTS |
| `.aios-core/development/templates/squad-template/` | Template scaffold | EXISTS |

**Execution flow:**

```mermaid
flowchart TD
    A["*create-squad {name}"] --> B[Load squad-creator-create.md task]
    B --> C{Name provided?}
    C -->|yes| D[Validate kebab-case]
    C -->|no| E[Prompt for name]
    D --> F{Squad exists?}
    E --> D
    F -->|yes| G[Error with suggestion]
    F -->|no| H{--yes flag?}
    H -->|yes| I[Use all defaults]
    H -->|no| J["Elicit: description, author, license,<br/>template, config-mode, etc."]
    I --> K[Generate squad structure]
    J --> K
    K --> L[Create directories]
    L --> M[Generate squad.yaml from template]
    M --> N[Generate config files]
    N --> O[Generate example agent + task]
    O --> P{--skip-validation?}
    P -->|yes| Q[Display success + next steps]
    P -->|no| R[Run squad-validator]
    R --> Q
```

**Templates available:** basic (1 agent, 1 task), etl (2 agents, 3 tasks, scripts), agent-only (2 agents, no tasks)

**Expected output:** Complete squad directory structure in `./squads/{name}/`

---

### `*validate-squad`

**Task file:** `.aios-core/development/tasks/squad-creator-validate.md`

**Dependencies loaded:**
| File | Type | Status |
|------|------|--------|
| `squad-creator-validate.md` | Task | EXISTS |
| `squad-loader.js` | Script | EXISTS |
| `squad-validator.js` | Script | EXISTS |
| `squad-schema.json` | Schema | EXISTS |

**Execution flow:**

```mermaid
flowchart TD
    A["*validate-squad {name}"] --> B[Load squad-creator-validate.md task]
    B --> C[Resolve squad path via squad-loader]
    C --> D[validateManifest: Schema check]
    D --> E[validateStructure: Directory check]
    E --> F[validateTasks: TASK-FORMAT-SPECIFICATION-V1]
    F --> G[validateAgents: Agent format check]
    G --> H[validateConfigReferences: Config path check]
    H --> I{--strict flag?}
    I -->|yes| J[Warnings become errors]
    I -->|no| K[Warnings remain warnings]
    J --> L[Format and display report]
    K --> L
    L --> M{Errors found?}
    M -->|yes| N[Exit code 1 - INVALID]
    M -->|no| O[Exit code 0 - VALID]
```

**Validation checks:** Manifest schema, directory structure, task format, agent format, config references (SQS-10)

---

### `*list-squads`

**Task file:** `.aios-core/development/tasks/squad-creator-list.md`

**Dependencies loaded:**
| File | Type | Status |
|------|------|--------|
| `squad-creator-list.md` | Task | EXISTS |
| `squad-generator.js` | Script | EXISTS |

**Execution flow:**

```mermaid
flowchart TD
    A["*list-squads"] --> B[Load squad-creator-list.md task]
    B --> C[Parse --path and --format flags]
    C --> D["Call SquadGenerator.listLocal()"]
    D --> E{--include-invalid?}
    E -->|yes| F[Show all squads]
    E -->|no| G[Filter out invalid]
    F --> H{Output format?}
    G --> H
    H -->|table| I[ASCII table with status icons]
    H -->|json| J[JSON output]
    H -->|yaml| K[YAML output]
    I --> L[Display with total count]
    J --> L
    K --> L
```

**Expected output:** Table/JSON/YAML listing of all local squads with name, version, description, and status

---

### `*migrate-squad`

**Task file:** `.aios-core/development/tasks/squad-creator-migrate.md`

**Dependencies loaded:**
| File | Type | Status |
|------|------|--------|
| `squad-creator-migrate.md` | Task | EXISTS |
| `squad-migrator.js` | Script | EXISTS |
| `squad-validator.js` | Script | EXISTS |

**Execution flow:**

```mermaid
flowchart TD
    A["*migrate-squad {path}"] --> B[Load squad-creator-migrate.md task]
    B --> C[Analyze squad for legacy patterns]
    C --> D["Detect: config.yaml, flat structure,<br/>missing aios.type, missing aios.minVersion"]
    D --> E{Needs migration?}
    E -->|no| F[Report: already up to date]
    E -->|yes| G{--dry-run?}
    G -->|yes| H[Display planned actions only]
    G -->|no| I[Create backup in .backup/]
    I --> J[Execute migration actions:<br/>rename, create dirs, add fields]
    J --> K[Run squad-validator on result]
    K --> L[Generate migration report]
```

**Migration detections:** config.yaml (rename to squad.yaml), flat structure (create dirs), missing fields (aios.type, aios.minVersion, name, version)

---

### `*analyze-squad`

**Task file:** `.aios-core/development/tasks/squad-creator-analyze.md`

**Dependencies loaded:**
| File | Type | Status |
|------|------|--------|
| `squad-creator-analyze.md` | Task | EXISTS |
| `squad-loader.js` | Script | EXISTS |
| `squad-analyzer.js` | Script | EXISTS |

**Execution flow:**

```mermaid
flowchart TD
    A["*analyze-squad {name}"] --> B[Load squad-creator-analyze.md task]
    B --> C["Elicit: squad name, output format, suggestions?"]
    C --> D[Validate squad exists]
    D --> E[Load squad.yaml manifest]
    E --> F["Inventory components by type:<br/>agents, tasks, workflows, checklists,<br/>templates, tools, scripts, data"]
    F --> G["Calculate coverage metrics:<br/>agents with tasks %, config %, directories %"]
    G --> H{Include suggestions?}
    H -->|yes| I[Generate improvement suggestions]
    H -->|no| J[Skip suggestions]
    I --> K{Output format?}
    J --> K
    K -->|console| L[Display formatted report]
    K -->|markdown| M["Save to {squad}/ANALYSIS.md"]
    K -->|json| N[Output JSON]
```

**Expected output:** Analysis report with overview, component inventory, coverage metrics, and improvement suggestions

---

### `*extend-squad`

**Task file:** `.aios-core/development/tasks/squad-creator-extend.md`

**Dependencies loaded:**
| File | Type | Status |
|------|------|--------|
| `squad-creator-extend.md` | Task | EXISTS |
| `squad-loader.js` | Script | EXISTS |
| `squad-extender.js` | Script | EXISTS |
| `squad-validator.js` | Script | EXISTS |
| `.aios-core/development/templates/squad/agent-template.md` | Template | EXISTS |
| `.aios-core/development/templates/squad/task-template.md` | Template | EXISTS |
| `.aios-core/development/templates/squad/workflow-template.yaml` | Template | EXISTS |
| `.aios-core/development/templates/squad/checklist-template.md` | Template | EXISTS |
| `.aios-core/development/templates/squad/template-template.md` | Template | EXISTS |
| `.aios-core/development/templates/squad/tool-template.js` | Template | EXISTS |
| `.aios-core/development/templates/squad/script-template.js` | Template | EXISTS |
| `.aios-core/development/templates/squad/data-template.yaml` | Template | EXISTS |

**Execution flow:**

```mermaid
flowchart TD
    A["*extend-squad {name}"] --> B[Load squad-creator-extend.md task]
    B --> C[Validate squad exists]
    C --> D{Flags provided?}
    D -->|--add flag| E[Use direct mode]
    D -->|no flags| F["Elicit: component type<br/>(1-8: agent/task/workflow/etc.)"]
    E --> G[Validate component name kebab-case]
    F --> G
    G --> H{Component is task?}
    H -->|yes| I["Require agent linkage<br/>(list squad agents)"]
    H -->|no| J[Continue]
    I --> K[Load template from templates/squad/]
    J --> K
    K --> L[Create component file from template]
    L --> M[Update squad.yaml manifest]
    M --> N[Run squad-validator]
    N --> O[Display result + next steps]
```

**Component types:** agent, task, workflow, checklist, template, tool, script, data

---

### `*download-squad`

**Task file:** `.aios-core/development/tasks/squad-creator-download.md`
**Status:** Active (Sprint 8)

**Dependencies loaded:**
| File | Type | Status |
|------|------|--------|
| `squad-creator-download.md` | Task | EXISTS |
| `squad-downloader.js` | Script | EXISTS |
| `squad-validator.js` | Script | EXISTS |

**Execution flow:**

```mermaid
flowchart TD
    A["*download-squad {name}"] --> B[Load squad-creator-download.md task]
    B --> C{--list flag?}
    C -->|yes| D[Fetch registry.json from aios-squads]
    C -->|no| E{Squad exists locally?}
    D --> F[Display available squads]
    E -->|yes and no --overwrite| G[Error: already exists]
    E -->|no or --overwrite| H[Search registry for squad]
    H --> I{Found?}
    I -->|no| J[Error: not in registry]
    I -->|yes| K[Download via GitHub API]
    K --> L["Extract to ./squads/{name}/"]
    L --> M[Run squad-validator]
    M --> N[Display success + next steps]
```

**Source:** `github.com/SynkraAI/aios-squads`

---

### `*publish-squad`

**Task file:** `.aios-core/development/tasks/squad-creator-publish.md`
**Status:** Active (Sprint 8)

**Dependencies loaded:**
| File | Type | Status |
|------|------|--------|
| `squad-creator-publish.md` | Task | EXISTS |
| `squad-publisher.js` | Script | EXISTS |
| `squad-validator.js` | Script | EXISTS |

**Execution flow:**

```mermaid
flowchart TD
    A["*publish-squad {path}"] --> B[Load squad-creator-publish.md task]
    B --> C[Run squad-validator - must pass 0 errors]
    C --> D{Validation passed?}
    D -->|no| E[Error: fix with *validate-squad]
    D -->|yes| F[Check gh auth status]
    F --> G{--dry-run?}
    G -->|yes| H[Preview PR details and exit]
    G -->|no| I[Fork/clone aios-squads]
    I --> J["Create branch: squad/{name}"]
    J --> K["Copy files to packages/{name}/"]
    K --> L[Update registry.json]
    L --> M[Commit + push to fork]
    M --> N[Create PR via gh CLI]
    N --> O[Display PR URL]
```

**Target:** `github.com/SynkraAI/aios-squads` via Pull Request

**Tools used:** github-cli (gh auth, gh pr create)

---

### `*sync-squad-synkra`

**Task file:** `.aios-core/development/tasks/squad-creator-sync-synkra.md`
**Status:** Active (Sprint 8)

**Dependencies loaded:**
| File | Type | Status |
|------|------|--------|
| `squad-creator-sync-synkra.md` | Task | EXISTS |
| `squad-validator.js` | Script | EXISTS |

**Execution flow:**

```mermaid
flowchart TD
    A["*sync-squad-synkra {path}"] --> B[Load squad-creator-sync-synkra.md task]
    B --> C[Find and validate squad.yaml]
    C --> D{Validation passed?}
    D -->|no| E[Abort: validation failed]
    D -->|yes| F[Calculate SHA-256 checksum]
    F --> G{SYNKRA_API_TOKEN set?}
    G -->|no| H[Abort: token not configured]
    G -->|yes| I{--dry-run?}
    I -->|yes| J[Preview sync details and exit]
    I -->|no| K["POST /api/squads/sync<br/>with squad data + visibility"]
    K --> L{API success?}
    L -->|yes| M[Display squad ID + marketplace URL]
    L -->|no| N[Display error details]
```

**API endpoint:** `https://api.synkra.dev/api/squads/sync`

---

### `*help`, `*guide`, `*exit`

These are built-in commands handled by the agent framework, not external task files.

| Command | Behavior |
|---------|----------|
| `*help` | Renders full command list from `commands[]` in agent definition |
| `*guide` | Renders the `## Squad Creator Guide` section from agent .md |
| `*exit` | Exits squad-creator mode, returns to base Claude Code |

---

## 4. Complete Dependency Graph

```mermaid
graph TD
    subgraph "Agent Definition"
        AD[squad-creator.md]
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
        T1[squad-creator-design.md]
        T2[squad-creator-create.md]
        T3[squad-creator-validate.md]
        T4[squad-creator-list.md]
        T5[squad-creator-migrate.md]
        T6[squad-creator-analyze.md]
        T7[squad-creator-extend.md]
        T8[squad-creator-download.md]
        T9[squad-creator-publish.md]
        T10[squad-creator-sync-synkra.md]
        T11[squad-creator-sync-ide-command.md]
    end

    subgraph "Scripts (squad/ dir)"
        S1[squad-loader.js]
        S2[squad-validator.js]
        S3[squad-generator.js]
        S4[squad-designer.js]
        S5[squad-migrator.js]
        S6[squad-analyzer.js]
        S7[squad-extender.js]
        S8[squad-downloader.js]
        S9[squad-publisher.js]
        S10[index.js]
    end

    subgraph "Schemas"
        SC1[squad-schema.json]
        SC2[squad-design-schema.json]
    end

    subgraph "Component Templates (templates/squad/)"
        TM1[agent-template.md]
        TM2[task-template.md]
        TM3[workflow-template.yaml]
        TM4[checklist-template.md]
        TM5[template-template.md]
        TM6[tool-template.js]
        TM7[script-template.js]
        TM8[data-template.yaml]
    end

    subgraph "Squad Template Scaffold (templates/squad-template/)"
        ST1[squad.yaml]
        ST2[README.md]
        ST3[package.json]
        ST4[example-agent.yaml]
        ST5[example-task.yaml]
        ST6[example-workflow.yaml]
        ST7[example-template.md]
        ST8[example-agent.test.js]
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
    AD -.->|commands| T10
    AD -.->|commands| T11

    T1 -.->|script| S4
    T1 -.->|schema| SC2
    T2 -.->|script| S3
    T2 -.->|script| S2
    T2 -.->|schema| SC1
    T2 -.->|scaffold| ST1
    T3 -.->|script| S1
    T3 -.->|script| S2
    T3 -.->|schema| SC1
    T4 -.->|script| S3
    T5 -.->|script| S5
    T5 -.->|script| S2
    T6 -.->|script| S1
    T6 -.->|script| S6
    T7 -.->|script| S1
    T7 -.->|script| S7
    T7 -.->|script| S2
    T7 -.->|templates| TM1
    T7 -.->|templates| TM2
    T7 -.->|templates| TM3
    T7 -.->|templates| TM4
    T7 -.->|templates| TM5
    T7 -.->|templates| TM6
    T7 -.->|templates| TM7
    T7 -.->|templates| TM8
    T8 -.->|script| S8
    T8 -.->|script| S2
    T9 -.->|script| S9
    T9 -.->|script| S2
    T10 -.->|script| S2
```

---

## 5. Cross-Agent Interactions

| Interaction | Direction | Trigger |
|-------------|-----------|---------|
| @squad-creator -> @dev | Handoff | Squad created, needs code implementation |
| @squad-creator -> @qa | Handoff | Squad created, needs quality review |
| @squad-creator -> @devops | Delegate | Publishing, deployment, git push operations |
| @aios-master -> @squad-creator | Invokes | Component creation (agents, tasks, workflows) |
| @pm -> @squad-creator | Receives | Requirements for new squads |
| @architect -> @squad-creator | Receives | Architecture decisions affecting squad structure |

### Collaboration Rules (from agent definition)

**Delegates to @dev when:**
- Squad code needs implementation
- Custom scripts/tools within squad need development

**Delegates to @qa when:**
- Squad implementation needs review
- Quality validation beyond structural checks

**Delegates to @devops when:**
- Git push operations to remote repository
- Pull request creation and management (via `*publish-squad`)
- CI/CD pipeline configuration for squad testing

**Cross-agent component creation:**
- Creates agent definitions that @dev implements
- Creates task workflows that @dev follows
- Creates templates that other agents consume
- Creates checklists that @qa executes

---

## 6. Missing Dependencies

| File | Type | Referenced By | Impact |
|------|------|---------------|--------|
| (none in agent-config-requirements.yaml) | Config entry | AgentConfigLoader | Falls back to defaults; no agent-specific files eagerly loaded |

**Note:** All task files (10), scripts (10 including index.js and README.md), schemas (2), and component templates (8) referenced by @squad-creator exist on disk. The squad template scaffold (8 files) also exists. This is a fully functional agent with zero missing dependencies.

### Complete File Inventory

**Tasks (11 files, all EXISTS):**
- `.aios-core/development/tasks/squad-creator-design.md`
- `.aios-core/development/tasks/squad-creator-create.md`
- `.aios-core/development/tasks/squad-creator-validate.md`
- `.aios-core/development/tasks/squad-creator-list.md`
- `.aios-core/development/tasks/squad-creator-migrate.md`
- `.aios-core/development/tasks/squad-creator-analyze.md`
- `.aios-core/development/tasks/squad-creator-extend.md`
- `.aios-core/development/tasks/squad-creator-download.md`
- `.aios-core/development/tasks/squad-creator-publish.md`
- `.aios-core/development/tasks/squad-creator-sync-synkra.md`
- `.aios-core/development/tasks/squad-creator-sync-ide-command.md`

**Scripts (11 files in squad/ dir, all EXISTS):**
- `.aios-core/development/scripts/squad/index.js`
- `.aios-core/development/scripts/squad/squad-loader.js`
- `.aios-core/development/scripts/squad/squad-validator.js`
- `.aios-core/development/scripts/squad/squad-generator.js`
- `.aios-core/development/scripts/squad/squad-designer.js`
- `.aios-core/development/scripts/squad/squad-migrator.js`
- `.aios-core/development/scripts/squad/squad-analyzer.js`
- `.aios-core/development/scripts/squad/squad-extender.js`
- `.aios-core/development/scripts/squad/squad-downloader.js`
- `.aios-core/development/scripts/squad/squad-publisher.js`
- `.aios-core/development/scripts/squad/README.md`

**Schemas (2 files, all EXISTS):**
- `.aios-core/schemas/squad-schema.json`
- `.aios-core/schemas/squad-design-schema.json`

**Component Templates (8 files, all EXISTS):**
- `.aios-core/development/templates/squad/agent-template.md`
- `.aios-core/development/templates/squad/task-template.md`
- `.aios-core/development/templates/squad/workflow-template.yaml`
- `.aios-core/development/templates/squad/checklist-template.md`
- `.aios-core/development/templates/squad/template-template.md`
- `.aios-core/development/templates/squad/tool-template.js`
- `.aios-core/development/templates/squad/script-template.js`
- `.aios-core/development/templates/squad/data-template.yaml`

**Squad Template Scaffold (10 files, all EXISTS):**
- `.aios-core/development/templates/squad-template/squad.yaml`
- `.aios-core/development/templates/squad-template/README.md`
- `.aios-core/development/templates/squad-template/package.json`
- `.aios-core/development/templates/squad-template/.gitignore`
- `.aios-core/development/templates/squad-template/LICENSE`
- `.aios-core/development/templates/squad-template/agents/example-agent.yaml`
- `.aios-core/development/templates/squad-template/tasks/example-task.yaml`
- `.aios-core/development/templates/squad-template/workflows/example-workflow.yaml`
- `.aios-core/development/templates/squad-template/templates/example-template.md`
- `.aios-core/development/templates/squad-template/tests/example-agent.test.js`

**Tools (2, referenced in agent definition):**
- `git` - For checking author info during squad creation
- `context7` - Library documentation lookup

---

*Traced from source on 2026-02-05 | Story AIOS-TRACE-001*
