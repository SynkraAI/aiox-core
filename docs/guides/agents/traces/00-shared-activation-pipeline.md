# Shared Activation Pipeline - Common Agent Activation Chain

> Traced from source code, not documentation.
> Source: `.aios-core/development/scripts/greeting-builder.js` (949 lines)

## Overview

Every AIOS agent goes through a common activation pipeline before presenting its greeting. There are **two activation paths** that converge on the same `GreetingBuilder` class:

| Path | Used By | Entry Point |
|------|---------|-------------|
| **Direct invocation** | @architect, @dev, @qa, @aios-master, @po, @pm, @sm, @analyst, @squad-creator | Agent .md STEP 3 calls `GreetingBuilder.buildGreeting()` directly |
| **CLI wrapper** | @devops, @data-engineer, @ux-design-expert | `generate-greeting.js` orchestrates context loading, then calls `GreetingBuilder.buildGreeting()` |

---

## 1. Agent File Loading (STEP 1-2)

Before the activation pipeline begins, Claude Code loads and parses the agent definition file.

### 1.1 File Location

```
.aios-core/development/agents/{agent-id}.md
```

### 1.2 Parsing Flow (via `AgentConfigLoader.loadAgentDefinition()`)

**Source:** `agent-config-loader.js:308-366`

```mermaid
sequenceDiagram
    participant CC as Claude Code
    participant ACL as AgentConfigLoader
    participant FS as File System
    participant YAML as js-yaml

    CC->>ACL: new AgentConfigLoader(agentId)
    CC->>ACL: loadAgentDefinition()
    ACL->>ACL: Check agentDefCache (5min TTL)
    alt Cache hit
        ACL-->>CC: Return cached definition
    else Cache miss
        ACL->>FS: readFile(.aios-core/development/agents/{id}.md)
        FS-->>ACL: Raw markdown content
        ACL->>ACL: Extract YAML block (regex: /```ya?ml\n([\s\S]*?)\n```/)
        ACL->>YAML: yaml.load(yamlContent)
        alt Parse fails
            ACL->>ACL: _normalizeCompactCommands(yamlContent)
            ACL->>YAML: yaml.load(normalizedYaml)
        end
        ACL->>ACL: _normalizeAgentDefinition(agentDef)
        Note over ACL: Ensures agent.id, agent.name, agent.icon defaults
        Note over ACL: Ensures persona_profile.greeting_levels exists
        Note over ACL: Ensures commands array exists
        ACL->>ACL: Cache result (5min TTL)
        ACL-->>CC: Return normalized definition
    end
```

### 1.3 Key Fields Extracted

| Field | Path in YAML | Used For |
|-------|-------------|----------|
| `agent.id` | `agent.id` | Agent identification, config lookup |
| `agent.name` | `agent.name` | Greeting presentation |
| `agent.icon` | `agent.icon` | Greeting prefix |
| `persona_profile.greeting_levels` | `persona_profile.communication.greeting_levels` or `persona_profile.greeting_levels` | Fixed-level greetings |
| `persona_profile.communication.signature_closing` | `persona_profile.communication.signature_closing` | Footer signature |
| `persona.role` | `persona.role` | Role description (new sessions) |
| `commands` | `commands[]` | Command list with visibility metadata |
| `dependencies` | `dependencies.tasks[]`, `.templates[]`, etc. | Task execution references |

---

## 2. Activation Pipeline (STEP 3)

### 2.1 Path A: Direct Invocation (9 agents)

The agent .md instructs Claude Code to call `GreetingBuilder.buildGreeting()` directly.

**Source:** `greeting-builder.js:59-82`

```mermaid
sequenceDiagram
    participant CC as Claude Code
    participant GB as GreetingBuilder
    participant GPM as GreetingPreferenceManager
    participant CD as ContextDetector
    participant GCD as GitConfigDetector
    participant PSL as ProjectStatusLoader
    participant PM as PermissionMode
    participant WN as WorkflowNavigator

    CC->>GB: new GreetingBuilder()
    Note over GB: Constructor loads:<br/>1. ContextDetector<br/>2. GitConfigDetector<br/>3. WorkflowNavigator<br/>4. GreetingPreferenceManager<br/>5. core-config.yaml
    CC->>GB: buildGreeting(agent, context)

    GB->>GPM: getPreference()
    Note over GPM: Reads .aios-core/core-config.yaml<br/>Path: agentIdentity.greeting.preference
    GPM-->>GB: preference (auto|minimal|named|archetypal)

    alt preference !== 'auto'
        GB->>GB: buildFixedLevelGreeting(agent, preference)
        GB-->>CC: Fixed greeting string
    else preference === 'auto'
        GB->>GB: _buildContextualGreeting(agent, context)
        Note over GB: 150ms timeout protection

        par Parallel Context Loading
            GB->>CD: detectSessionType(conversationHistory)
            CD-->>GB: 'new' | 'existing' | 'workflow'
        and
            GB->>PSL: loadProjectStatus()
            PSL-->>GB: ProjectStatus object
        end

        GB->>GCD: get() [always, cached 5min]
        GCD-->>GB: { configured, type, branch }

        GB->>PM: new PermissionMode() → load() → getBadge()
        PM-->>GB: badge string (e.g., "[Ask]")

        GB->>GB: Build greeting sections (see Section 3)
        GB-->>CC: Formatted greeting string
    end
```

### 2.2 Path B: CLI Wrapper (3 agents: @devops, @data-engineer, @ux-design-expert)

**Source:** `generate-greeting.js:53-113`

```mermaid
sequenceDiagram
    participant CC as Claude Code
    participant GG as generate-greeting.js
    participant ACL as AgentConfigLoader
    participant SCL as SessionContextLoader
    participant PSL as ProjectStatusLoader
    participant GB as GreetingBuilder

    CC->>GG: generateGreeting(agentId)

    par Parallel Loading (3 concurrent)
        GG->>ACL: loadComplete(coreConfig)
        Note over ACL: Loads config sections +<br/>agent definition from .md file
        ACL-->>GG: { config, definition, agent, persona_profile, commands }
    and
        GG->>SCL: loadContext(agentId)
        Note over SCL: Reads .aios/session-state.json
        SCL-->>GG: { sessionType, lastCommands, previousAgent, ... }
    and
        GG->>PSL: loadProjectStatus()
        Note over PSL: Git branch, modified files, recent commits, story
        PSL-->>GG: ProjectStatus object
    end

    GG->>GG: Build unified context object
    GG->>GG: Merge agent with persona_profile from definition
    GG->>GB: new GreetingBuilder()
    GG->>GB: buildGreeting(agentWithPersona, context)
    Note over GB: Same flow as Path A from here
    GB-->>GG: Formatted greeting
    GG-->>CC: greeting string
```

---

## 3. Greeting Section Assembly

**Source:** `greeting-builder.js:91-141`

When `preference === 'auto'`, the greeting is assembled from ordered sections:

```mermaid
flowchart TD
    A[Start _buildContextualGreeting] --> B{Session Type?}

    B -->|any| C[1. Presentation + Permission Badge]
    C --> D{sessionType === 'new'?}

    D -->|yes| E[2. Role Description]
    D -->|no| F[Skip role description]

    E --> G{gitConfig.configured AND projectStatus?}
    F --> G

    G -->|yes| H[3. Project Status]
    G -->|no| I[Skip project status]

    H --> J{sessionType !== 'new'?}
    I --> J

    J -->|yes| K[4. Context Section<br/>intelligent narrative + recommendations]
    J -->|no| L[Skip context section]

    K --> M{sessionType === 'workflow'<br/>AND lastCommands AND no contextSection?}
    L --> M

    M -->|yes| N[5. Workflow Suggestions<br/>via WorkflowNavigator]
    M -->|no| O[Skip workflow suggestions]

    N --> P[6. Commands<br/>filtered by visibility]
    O --> P

    P --> Q[7. Footer + Signature]
    Q --> R[Join sections with \\n\\n]
    R --> S[Return greeting string]
```

### 3.1 Section Details

| # | Section | Method | Condition | Data Source |
|---|---------|--------|-----------|-------------|
| 1 | Presentation | `buildPresentation()` | Always | `persona_profile.greeting_levels.archetypal` + PermissionMode badge |
| 2 | Role Description | `buildRoleDescription()` | `sessionType === 'new'` | `persona.role` |
| 3 | Project Status | `buildProjectStatus()` | `gitConfig.configured && projectStatus` | ProjectStatusLoader (branch, files, commits, story) |
| 4 | Context | `buildContextSection()` | `sessionType !== 'new'` | Intelligent narrative from previous agent, modified files, story |
| 5 | Workflow Suggestions | `buildWorkflowSuggestions()` | `sessionType === 'workflow' && lastCommands && !contextSection` | WorkflowNavigator + workflow-patterns.yaml |
| 6 | Commands | `buildCommands()` | Always | `filterCommandsByVisibility()` - max 12 commands |
| 7 | Footer | `buildFooter()` | Always | `persona_profile.communication.signature_closing` |

### 3.2 Command Visibility Filtering

**Source:** `greeting-builder.js:815-857`

| Session Type | Visibility Filter | Shows Commands With |
|-------------|-------------------|---------------------|
| `new` | `full` | `visibility: [full, ...]` |
| `existing` | `quick` | `visibility: [..., quick, ...]` |
| `workflow` | `key` | `visibility: [..., key, ...]` |

If no commands have visibility metadata, falls back to first 12 commands.

---

## 4. Context Detection (Session Type)

**Source:** `context-detector.js:22-101`

```mermaid
flowchart TD
    A[detectSessionType] --> B{conversationHistory<br/>not null AND length > 0?}

    B -->|yes| C[_detectFromConversation]
    B -->|no| D[_detectFromFile]

    C --> E{commands.length === 0?}
    E -->|yes| F[return 'new']
    E -->|no| G{_detectWorkflowPattern?}
    G -->|yes| H[return 'workflow']
    G -->|no| I[return 'existing']

    D --> J{session-state.json exists?}
    J -->|no| K[return 'new']
    J -->|yes| L{Session expired? > 1hr}
    L -->|yes| M[return 'new']
    L -->|no| N{workflowActive AND lastCommands?}
    N -->|yes| O[return 'workflow']
    N -->|no| P{lastCommands.length > 0?}
    P -->|yes| Q[return 'existing']
    P -->|no| R[return 'new']
```

**Workflow patterns detected:**
- `story_development`: validate-story-draft, develop, review-qa
- `epic_creation`: create-epic, create-story, validate-story-draft
- `backlog_management`: backlog-review, backlog-prioritize, backlog-schedule

---

## 5. Git Config Detection

**Source:** `git-config-detector.js:19-294`

| Property | Command | Timeout | Cache TTL |
|----------|---------|---------|-----------|
| `configured` | `git rev-parse --is-inside-work-tree` | 1s | 5 min |
| `branch` | `git branch --show-current` | 1s | 5 min |
| `type` | `git config --get remote.origin.url` | 1s | 5 min |

**Returns:** `{ configured: boolean, type: 'github'|'gitlab'|'bitbucket'|'other'|null, branch: string|null }`

---

## 6. Project Status Loading

**Source:** `project-status-loader.js:20-524`

| Data Point | Git Command | Cache TTL |
|------------|-------------|-----------|
| `branch` | `git branch --show-current` | 60s |
| `modifiedFiles` | `git status --porcelain` (max 5) | 60s |
| `modifiedFilesTotalCount` | Count from porcelain output | 60s |
| `recentCommits` | `git log -2 --oneline --no-decorate` | 60s |
| `currentStory` | Scan `docs/stories/` for `Status: InProgress` | 60s |
| `currentEpic` | Extracted from story file metadata | 60s |
| `worktrees` | Via WorktreeManager | 60s |

**Cache file:** `.aios/project-status.yaml`

---

## 7. Greeting Preference

**Source:** `greeting-preference-manager.js:18-146`

Reads from `.aios-core/core-config.yaml` path `agentIdentity.greeting.preference`.

| Value | Behavior |
|-------|----------|
| `auto` (default) | Session-aware contextual greeting |
| `minimal` | Always use `greeting_levels.minimal` |
| `named` | Always use `greeting_levels.named` |
| `archetypal` | Always use `greeting_levels.archetypal` |

---

## 8. Permission Mode Badge

**Source:** `permissions/index.js` + `permissions/permission-mode.js`

Loads permission mode and returns a badge string displayed next to the agent presentation. Examples: `[Ask]`, `[Auto]`, `[Explore]`.

---

## 9. Config Loading Per Agent

**Source:** `agent-config-loader.js:49-160` + `agent-config-requirements.yaml`

Each agent has specific config requirements defined in `.aios-core/data/agent-config-requirements.yaml`:

| Agent | Config Sections | Files Loaded | Performance Target |
|-------|----------------|--------------|-------------------|
| `aios-master` | dataLocation, registry | aios-kb.md (lazy) | <30ms |
| `dev` | devLoadAlwaysFiles, devStoryLocation, dataLocation | coding-standards.md, tech-stack.md, source-tree.md, technical-preferences.md | <50ms |
| `qa` | qaLocation, dataLocation, storyBacklog | technical-preferences.md, test-levels-framework.md, test-priorities-matrix.md | <50ms |
| `devops` | dataLocation, cicdLocation | technical-preferences.md | <50ms |
| `architect` | architecture, dataLocation, templatesLocation | technical-preferences.md | <75ms |
| `po` | devStoryLocation, prd, storyBacklog, templatesLocation | elicitation-methods.md | <75ms |
| `sm` | devStoryLocation, storyBacklog, dataLocation | mode-selection-best-practices.md, workflow-patterns.yaml | <75ms |
| `data-engineer` | dataLocation, etlLocation | technical-preferences.md | <75ms |
| `pm` | devStoryLocation, storyBacklog | (none) | <100ms |
| `analyst` | dataLocation, analyticsLocation | brainstorming-techniques.md | <100ms |
| `ux-design-expert` | dataLocation, uxLocation | (none) | <100ms |
| `squad-creator` | (default) dataLocation | (none) | <150ms |

---

## 10. Files Loaded During Activation (Complete List)

### Always loaded (every agent activation)

| File | Loader | Purpose |
|------|--------|---------|
| `.aios-core/development/agents/{agent-id}.md` | AgentConfigLoader | Agent definition |
| `.aios-core/core-config.yaml` | GreetingBuilder._loadConfig() | Core configuration |
| `.aios-core/data/agent-config-requirements.yaml` | AgentConfigLoader.loadRequirements() | Per-agent config needs |
| `.aios-core/data/workflow-patterns.yaml` | WorkflowNavigator._loadPatterns() | Workflow state detection |

### Loaded conditionally

| File | Condition | Loader |
|------|-----------|--------|
| `.aios/session-state.json` | Path B (CLI wrapper) or file-based session detection | ContextDetector / SessionContextLoader |
| `.aios/project-status.yaml` | Cache check (60s TTL) | ProjectStatusLoader |
| `docs/stories/**/*.md` | When scanning for InProgress story | ProjectStatusLoader.getCurrentStoryInfo() |
| Agent-specific data files | Per agent-config-requirements.yaml | AgentConfigLoader.loadFile() |

---

## 11. Error Handling & Fallbacks

The entire pipeline is protected with multiple fallback layers:

| Component | Fallback | Source |
|-----------|----------|--------|
| GreetingBuilder.buildGreeting() | `buildSimpleGreeting()` | greeting-builder.js:60 |
| _buildContextualGreeting() | 150ms timeout | greeting-builder.js:73-77 |
| ContextDetector.detectSessionType() | Returns `'new'` | greeting-builder.js:869 |
| GitConfigDetector.get() | `{ configured: false }` | greeting-builder.js:883 |
| ProjectStatusLoader | `null` | greeting-builder.js:897 |
| PermissionMode.getBadge() | `''` (empty string) | greeting-builder.js:913 |
| generate-greeting.js | `generateFallbackGreeting()` | generate-greeting.js:143 |

---

## 12. Constructor Dependency Graph

```mermaid
graph TD
    GB[GreetingBuilder] --> CD[ContextDetector]
    GB --> GCD[GitConfigDetector]
    GB --> WN[WorkflowNavigator]
    GB --> GPM[GreetingPreferenceManager]
    GB --> CC[core-config.yaml]

    CD --> SSF[.aios/session-state.json]
    GCD --> GIT[git CLI commands]
    WN --> WP[.aios-core/data/workflow-patterns.yaml]
    GPM --> CC

    GG[generate-greeting.js] --> GB
    GG --> ACL[AgentConfigLoader]
    GG --> SCL[SessionContextLoader]
    GG --> PSL[ProjectStatusLoader]

    ACL --> AR[agent-config-requirements.yaml]
    ACL --> AD[Agent .md definition]
    ACL --> GCC[globalConfigCache]

    PSL --> GIT
    PSL --> STORIES[docs/stories/**/*.md]
    PSL --> WTM[WorktreeManager]
    PSL --> PSC[.aios/project-status.yaml]
```

---

*Traced from source on 2026-02-05 | Story AIOS-TRACE-001*
