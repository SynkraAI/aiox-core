# @analyst (Atlas) - Execution Trace

> Traced from source code, not documentation.
> Agent definition: `.aios-core/development/agents/analyst.md`

## 1. Activation Trace

### 1.1 Files Loaded (in order)

| Order | File | Loader | Purpose |
|-------|------|--------|---------|
| 1 | `.aios-core/development/agents/analyst.md` | AgentConfigLoader.loadAgentDefinition() | Agent definition (YAML block) |
| 2 | `.aios-core/core-config.yaml` | GreetingBuilder._loadConfig() | Core configuration |
| 3 | `.aios-core/data/agent-config-requirements.yaml` | AgentConfigLoader.loadRequirements() | Config sections: dataLocation, analyticsLocation |
| 4 | `.aios-core/data/workflow-patterns.yaml` | WorkflowNavigator._loadPatterns() | Workflow state detection |
| 5 | `.aios-core/product/data/brainstorming-techniques.md` | AgentConfigLoader.loadFile() | Brainstorming techniques (always loaded, 2KB) |
| 6 | `.aios/session-state.json` | ContextDetector._detectFromFile() | Session type detection (if no conversation history) |
| 7 | `.aios/project-status.yaml` | ProjectStatusLoader.loadCache() | Cached project status (60s TTL) |

### 1.2 Greeting Construction

**Activation path:** Direct invocation (STEP 3 calls `GreetingBuilder.buildGreeting()`)

```mermaid
sequenceDiagram
    participant CC as Claude Code
    participant AMd as analyst.md
    participant ACL as AgentConfigLoader
    participant GB as GreetingBuilder
    participant GPM as GreetingPreferenceManager
    participant CD as ContextDetector
    participant GCD as GitConfigDetector
    participant PSL as ProjectStatusLoader
    participant PM as PermissionMode

    CC->>AMd: Load agent file (STEP 1)
    CC->>AMd: Adopt persona (STEP 2)
    CC->>ACL: loadAgentDefinition('analyst')
    ACL-->>CC: { agent: { name: 'Atlas', icon: '🔍' }, commands: [...15], ... }

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
analyst:
  config_sections:
    - dataLocation
    - analyticsLocation
  files_loaded:
    - path: .aios-core/product/data/brainstorming-techniques.md
      lazy: false
      size: 2KB
  lazy_loading: {}
  performance_target: <100ms
```

### 1.4 Context Brought to Session

| Data | Source | Value |
|------|--------|-------|
| Greeting level | `persona_profile.greeting_levels.archetypal` | `🔍 Atlas the Decoder ready to investigate!` |
| Signature | `persona_profile.communication.signature_closing` | `— Atlas, investigando a verdade 🔎` |
| Role | `persona.role` | Insightful Analyst & Strategic Ideation Partner |
| Commands shown | `filterCommandsByVisibility('full')` | 15 commands with `full` visibility |

---

## 2. Command Registry

| Command | Task File | Visibility | Elicit |
|---------|-----------|------------|--------|
| `*help` | (built-in) | full, quick, key | No |
| `*create-project-brief` | create-doc.md + project-brief-tmpl.yaml | full, quick | Yes |
| `*perform-market-research` | create-doc.md + market-research-tmpl.yaml | full, quick | Yes |
| `*create-competitor-analysis` | create-doc.md + competitor-analysis-tmpl.yaml | full, quick | Yes |
| `*research-prompt` | create-deep-research-prompt.md | full | Yes |
| `*brainstorm` | facilitate-brainstorming-session.md + brainstorming-techniques.md | full, quick, key | Yes |
| `*elicit` | advanced-elicitation.md | full | Yes |
| `*research-deps` | spec-research-dependencies.md | full | Yes |
| `*extract-patterns` | pattern-extractor.js | full | No |
| `*doc-out` | (built-in) | full | No |
| `*session-info` | (built-in) | full | No |
| `*guide` | (built-in, rendered from agent .md) | full, quick | No |
| `*yolo` | (built-in) | full | No |
| `*exit` | (built-in) | full | No |

---

## 3. Per-Command Execution Traces

### `*create-project-brief`

**Task file:** `.aios-core/development/tasks/create-doc.md`
**Template:** `.aios-core/product/templates/project-brief-tmpl.yaml` (EXISTS)

**Dependencies loaded:**
| File | Type | Status |
|------|------|--------|
| `create-doc.md` | Task | EXISTS |
| `project-brief-tmpl.yaml` | Template | EXISTS |
| `.aios-core/product/data/elicitation-methods.md` | Data | Referenced by create-doc |
| `.aios-core/product/templates/` | Templates dir | Scanned dynamically |

**Execution flow:**

```mermaid
flowchart TD
    A["*create-project-brief"] --> B[Load create-doc.md task]
    B --> C[Load template: project-brief-tmpl.yaml]
    C --> D{Template exists?}
    D -->|yes| E[Parse YAML template structure]
    D -->|no| F[Error: template not found]
    E --> G[Step-by-step elicitation<br/>format: numbered 1-9 options]
    G --> H[Fill template sections with user input]
    H --> I[Validate document against template schema]
    I --> J[Generate project brief document]
    J --> K[Output document to specified path]
```

**Expected output:** Complete project brief document

---

### `*perform-market-research`

**Task file:** `.aios-core/development/tasks/create-doc.md`
**Template:** `.aios-core/product/templates/market-research-tmpl.yaml` (EXISTS)

**Dependencies loaded:**
| File | Type | Status |
|------|------|--------|
| `create-doc.md` | Task | EXISTS |
| `market-research-tmpl.yaml` | Template | EXISTS |
| `.aios-core/product/data/elicitation-methods.md` | Data | Referenced by create-doc |

**Execution flow:**

```mermaid
flowchart TD
    A["*perform-market-research"] --> B[Load create-doc.md task]
    B --> C[Load template: market-research-tmpl.yaml]
    C --> D{Template exists?}
    D -->|yes| E[Parse YAML template structure]
    D -->|no| F[Error: template not found]
    E --> G[Elicit: market, segment, competitors, scope]
    G --> H[Use exa tool for market data research]
    H --> I[Fill template sections with findings + user input]
    I --> J[Validate document against template schema]
    J --> K[Generate market research document]
    K --> L[Output document to specified path]
```

**Tools used:** exa (market research), context7 (industry documentation)

**Expected output:** Structured market research analysis document

---

### `*create-competitor-analysis`

**Task file:** `.aios-core/development/tasks/create-doc.md`
**Template:** `.aios-core/product/templates/competitor-analysis-tmpl.yaml` (EXISTS)

**Dependencies loaded:**
| File | Type | Status |
|------|------|--------|
| `create-doc.md` | Task | EXISTS |
| `competitor-analysis-tmpl.yaml` | Template | EXISTS |
| `.aios-core/product/data/elicitation-methods.md` | Data | Referenced by create-doc |

**Execution flow:**

```mermaid
flowchart TD
    A["*create-competitor-analysis"] --> B[Load create-doc.md task]
    B --> C[Load template: competitor-analysis-tmpl.yaml]
    C --> D{Template exists?}
    D -->|yes| E[Parse YAML template structure]
    D -->|no| F[Error: template not found]
    E --> G[Elicit: competitors, market, criteria, scope]
    G --> H[Use exa tool for competitor data]
    H --> I[Fill template sections with analysis + user input]
    I --> J[Validate document against template schema]
    J --> K[Generate competitor analysis document]
    K --> L[Output document to specified path]
```

**Tools used:** exa (competitor research), context7 (technology documentation)

**Expected output:** Structured competitive analysis document

---

### `*research-prompt`

**Task file:** `.aios-core/development/tasks/create-deep-research-prompt.md`

**Dependencies loaded:**
| File | Type | Status |
|------|------|--------|
| `create-deep-research-prompt.md` | Task | EXISTS |

**Execution flow:**

```mermaid
flowchart TD
    A["*research-prompt {topic}"] --> B[Load create-deep-research-prompt.md]
    B --> C[Elicit: research type selection]
    C --> D[Elicit: research parameters]
    D --> E[Generate structured research prompt]
    E --> F[Use exa tool for deep research]
    F --> G[Use context7 for documentation lookup]
    G --> H[Compile research findings]
    H --> I[Output research report]
```

**Tools used:** exa (deep research), context7 (documentation)

---

### `*brainstorm`

**Task file:** `.aios-core/development/tasks/facilitate-brainstorming-session.md`
**Template:** `.aios-core/product/templates/brainstorming-output-tmpl.yaml` (EXISTS)
**Data file:** `.aios-core/product/data/brainstorming-techniques.md` (EXISTS)

**Dependencies loaded:**
| File | Type | Status |
|------|------|--------|
| `facilitate-brainstorming-session.md` | Task | EXISTS |
| `brainstorming-output-tmpl.yaml` | Template | EXISTS |
| `brainstorming-techniques.md` | Data | EXISTS (pre-loaded at activation) |

**Execution flow:**

```mermaid
flowchart TD
    A["*brainstorm {topic}"] --> B[Load facilitate-brainstorming-session.md]
    B --> C[Step 1: Session Setup<br/>4 context questions]
    C --> D[Step 2: Present Approach Options<br/>numbered 1-4]
    D --> E{User selects approach}
    E -->|1: User selects| F[Present technique list from brainstorming-techniques.md]
    E -->|2: Analyst recommends| G[Recommend techniques based on context]
    E -->|3: Random| H[Random technique selection]
    E -->|4: Progressive| I[Start broad, narrow down]
    F --> J[Step 3: Execute Techniques Interactively]
    G --> J
    H --> J
    I --> J
    J --> K[Facilitator guides user through technique]
    K --> L{User wants to?}
    L -->|Switch technique| J
    L -->|Move to convergent| M[Step 4: Session Flow<br/>Convergent + Synthesis phases]
    L -->|End session| M
    M --> N{Document output requested?}
    N -->|yes| O[Step 5: Generate structured document<br/>using brainstorming-output-tmpl.yaml]
    N -->|no| P[Session complete]
    O --> P
```

**Expected output:** Brainstorming session results document (docs/brainstorming-session-results.md)

---

### `*elicit`

**Task file:** `.aios-core/development/tasks/advanced-elicitation.md`

**Dependencies loaded:**
| File | Type | Status |
|------|------|--------|
| `advanced-elicitation.md` | Task | EXISTS |
| `.aios-core/product/data/elicitation-methods.md` | Data | EXISTS |

**Execution flow:**

```mermaid
flowchart TD
    A["*elicit"] --> B[Load advanced-elicitation.md]
    B --> C[Load elicitation-methods.md]
    C --> D[Elicit: session purpose and goals]
    D --> E[Select elicitation technique]
    E --> F[Execute structured elicitation]
    F --> G[Capture insights and requirements]
    G --> H[Synthesize findings]
    H --> I[Output elicitation results]
```

---

### `*research-deps`

**Task file:** `.aios-core/development/tasks/spec-research-dependencies.md`

**Dependencies loaded:**
| File | Type | Status |
|------|------|--------|
| `spec-research-dependencies.md` | Task | EXISTS |
| `docs/stories/{storyId}/spec/requirements.json` | Input | Required |

**Execution flow:**

```mermaid
flowchart TD
    A["*research-deps"] --> B[Load spec-research-dependencies.md]
    B --> C[Read requirements.json for story]
    C --> D[Identify technical dependencies]
    D --> E[Research dependency versions and compatibility]
    E --> F[Analyze constraints and risks]
    F --> G[Use exa/context7 for library documentation]
    G --> H["Output: docs/stories/{storyId}/spec/research.json"]
```

**Tools used:** exa (dependency research), context7 (library documentation)

---

### `*extract-patterns`

**Script:** `.aios-core/infrastructure/scripts/pattern-extractor.js` (EXISTS)

**Dependencies loaded:**
| File | Type | Status |
|------|------|--------|
| `pattern-extractor.js` | Script | EXISTS |

**Execution flow:**

```mermaid
flowchart TD
    A["*extract-patterns"] --> B[Load pattern-extractor.js]
    B --> C[Scan codebase for patterns]
    C --> D[Identify recurring code patterns]
    D --> E[Classify patterns by type]
    E --> F[Document patterns with examples]
    F --> G[Output pattern catalog]
```

---

### `*help`, `*guide`, `*session-info`, `*doc-out`, `*yolo`, `*exit`

These are built-in commands handled by the agent framework, not external task files.

| Command | Behavior |
|---------|----------|
| `*help` | Renders full command list from `commands[]` in agent definition |
| `*guide` | Renders the `## 🔍 Analyst Guide` section from agent .md |
| `*session-info` | Shows session context (agent history, commands, project status) |
| `*doc-out` | Outputs complete document content |
| `*yolo` | Toggles confirmation skipping mode |
| `*exit` | Exits analyst mode, returns to base Claude Code |

---

## 4. Complete Dependency Graph

```mermaid
graph TD
    subgraph "Agent Definition"
        AD[analyst.md]
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
        BT[brainstorming-techniques.md]
    end

    subgraph "Task Files"
        T1[facilitate-brainstorming-session.md]
        T2[create-deep-research-prompt.md]
        T3[create-doc.md]
        T4[advanced-elicitation.md]
        T5[document-project.md]
        T6[spec-research-dependencies.md]
    end

    subgraph "Templates (ALL EXIST)"
        TM1[project-brief-tmpl.yaml]
        TM2[market-research-tmpl.yaml]
        TM3[competitor-analysis-tmpl.yaml]
        TM4[brainstorming-output-tmpl.yaml]
    end

    subgraph "Data Files"
        D1[brainstorming-techniques.md]
        D2[elicitation-methods.md]
        D3[aios-kb.md]
    end

    subgraph "Scripts"
        S1[pattern-extractor.js]
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
    ACL --> BT
    WN --> WP
    GPM --> CC

    AD -.->|commands| T1
    AD -.->|commands| T2
    AD -.->|commands| T3
    AD -.->|commands| T4
    AD -.->|commands| T5
    AD -.->|commands| T6

    T1 -.->|data| D1
    T1 -.->|template| TM4
    T3 -.->|template| TM1
    T3 -.->|template| TM2
    T3 -.->|template| TM3
    T3 -.->|data| D2
    T4 -.->|data| D2
    AD -.->|script| S1
    AD -.->|data| D3
```

---

## 5. Cross-Agent Interactions

| Interaction | Direction | Trigger |
|-------------|-----------|---------|
| @pm -> @analyst | Delegates | Market research, competitive analysis, feasibility studies |
| @architect -> @analyst | Delegates | Technical research, dependency analysis |
| @po -> @analyst | Delegates | Market insights, user research, competitive intelligence |
| @analyst -> @pm | Handoff | Research findings for PRD creation |
| @analyst -> @po | Handoff | Market insights for story prioritization |
| @analyst -> @devops | Delegate | Git push operations, PR creation |

### Delegation Rules (from agent definition)

**Receives from @pm when:**
- Market research required for PRD creation
- Competitive landscape analysis needed
- Feasibility studies for new features
- Industry trend analysis for strategic planning

**Receives from @architect when:**
- Technical dependency research needed
- Library/framework evaluation required
- Technology comparison analysis

**Receives from @po when:**
- Market insights needed for epic/story prioritization
- User research for feature validation
- Competitive analysis for backlog grooming

**Hands off to @pm:**
- Completed research reports for PRD integration
- Market analysis findings for product strategy

**Delegates to @devops when:**
- Git push operations to remote repository
- Pull request creation and management

**Git restrictions:**
- ALLOWED: `git status`, `git log`, `git diff`, `git branch -a`
- BLOCKED: `git push`, `git push --force`, `gh pr create`

---

## 6. MCP Tools

| Tool | Purpose | Usage |
|------|---------|-------|
| exa | Advanced web research, market data, competitor intelligence | `*research-prompt`, `*perform-market-research`, `*create-competitor-analysis` |
| context7 | Library documentation lookup, technology evaluation | `*research-prompt`, `*research-deps` |
| browser | Web testing, page interaction, visual verification | Ad-hoc web research and validation |

---

## 7. Missing Dependencies

| File | Type | Referenced By | Impact |
|------|------|---------------|--------|
| (none) | - | - | All task files, templates, data files, and scripts exist |

**Note:** All 6 task files, all 4 templates, both data files, and the pattern-extractor script are present on disk. The analyst agent has no missing dependencies.

---

*Traced from source on 2026-02-05 | Story AIOS-TRACE-001*
