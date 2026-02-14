# SYNAPSE — Flowcharts & System Diagrams

> Guia visual completo de como o SYNAPSE funciona: pipeline, layers, domains,
> conexoes com Memory Intelligence System (MIS) e Activation Pipeline (UAP).

**Versao:** 1.0.0
**Data:** 2026-02-11
**Autor:** @architect (Aria)
**Status:** Living Document

---

## 1. Visao Geral do Sistema

O SYNAPSE (Synkra Adaptive Processing & State Engine) e o motor de contexto JIT do AIOS.
A cada prompt do usuario, ele injeta `<synapse-rules>` com regras contextuais adaptativas.

```mermaid
flowchart TB
    subgraph USER["Usuario"]
        PROMPT["Digita prompt no Claude Code"]
    end

    subgraph CLAUDE_CODE["Claude Code Runtime"]
        HOOK_EVENT["UserPromptSubmit Event"]
        STDIN["stdin: { sessionId, cwd, prompt }"]
        STDOUT["stdout: { hookSpecificOutput }"]
        AI["Claude AI processa prompt + synapse-rules"]
    end

    subgraph SYNAPSE["SYNAPSE Engine"]
        ENTRY["synapse-engine.js<br/>(Hook Entry Point)"]
        ENGINE["SynapseEngine.process()"]
        FORMATTER["Output Formatter"]
    end

    subgraph DATA[".synapse/ (Runtime Data)"]
        MANIFEST["manifest"]
        DOMAINS["Domain Files"]
        SESSIONS["sessions/{uuid}.json"]
    end

    subgraph EXTERNAL["Sistemas Externos"]
        UAP["Activation Pipeline<br/>(unified-activation-pipeline.js)"]
        MIS["Memory Intelligence System<br/>(Pro Feature)"]
    end

    PROMPT --> HOOK_EVENT
    HOOK_EVENT --> STDIN
    STDIN --> ENTRY
    ENTRY --> ENGINE
    ENGINE --> FORMATTER
    FORMATTER --> STDOUT
    STDOUT --> AI

    ENGINE -.->|"le"| MANIFEST
    ENGINE -.->|"le"| DOMAINS
    ENGINE -.->|"le/escreve"| SESSIONS
    ENGINE -.->|"consumer (Pro)"| MIS
    UAP -->|"escreve _active-agent.json<br/>(SYN-13 bridge)"| SESSIONS
```

---

## 2. Hook Entry Point — Ciclo de Vida por Prompt

Cada prompt do usuario dispara o hook. O entry point e fino (~78 linhas)
e delega todo o trabalho para o SynapseEngine.

```mermaid
flowchart TD
    START["UserPromptSubmit Event"] --> READ_STDIN["readStdin()<br/>Parse JSON"]
    READ_STDIN --> CHECK_CWD{"cwd existe?"}
    CHECK_CWD -->|"Nao"| SILENT_EXIT["exit(0) silencioso"]
    CHECK_CWD -->|"Sim"| CHECK_SYNAPSE{".synapse/<br/>existe?"}
    CHECK_SYNAPSE -->|"Nao"| SILENT_EXIT
    CHECK_SYNAPSE -->|"Sim"| LOAD_SESSION["loadSession(sessionId)"]
    LOAD_SESSION --> CREATE_ENGINE["new SynapseEngine(synapsePath)"]
    CREATE_ENGINE --> PROCESS["engine.process(prompt, session)"]
    PROCESS --> WRITE_STDOUT["stdout: { hookSpecificOutput:<br/>{ additionalContext: xml } }"]
    WRITE_STDOUT --> END["Claude Code injeta<br/>synapse-rules no prompt"]

    TIMEOUT["Safety Timeout: 5s"] -.->|"Se exceder"| SILENT_EXIT

    style SILENT_EXIT fill:#f9f,stroke:#333
    style TIMEOUT fill:#ff9,stroke:#333
```

---

## 3. Pipeline de 8 Layers — Fluxo Principal

O engine executa os layers sequencialmente (L0→L7), respeitando
o Context Bracket que determina quais layers estao ativos.

```mermaid
flowchart LR
    INPUT["prompt<br/>session<br/>config"] --> BRACKET["Context Tracker<br/>calcula bracket"]
    BRACKET --> L0["L0: Constitution<br/>5ms | NON-NEGOTIABLE"]
    L0 --> L1["L1: Global<br/>10ms | ALWAYS_ON"]
    L1 --> L2["L2: Agent<br/>15ms | session.active_agent"]
    L2 --> L3["L3: Workflow<br/>15ms | session.active_workflow"]
    L3 --> L4["L4: Task<br/>15ms | session.active_task"]
    L4 --> L5["L5: Squad<br/>15ms | session.active_squad"]
    L5 --> L6["L6: Keyword<br/>15ms | RECALL matching"]
    L6 --> L7["L7: Star-Command<br/>5ms | *command detection"]
    L7 --> MEM{"Memory<br/>Bridge"}
    MEM --> FORMAT["Output Formatter<br/>→ <synapse-rules>"]

    style L0 fill:#ff6b6b,color:#fff
    style L1 fill:#4ecdc4,color:#fff
    style L2 fill:#45b7d1,color:#fff
    style L3 fill:#96ceb4,color:#fff
    style L4 fill:#ffeaa7,color:#333
    style L5 fill:#dfe6e9,color:#333
    style L6 fill:#a29bfe,color:#fff
    style L7 fill:#fd79a8,color:#fff
    style MEM fill:#6c5ce7,color:#fff
```

---

## 4. Context Brackets — Layers Ativos por Bracket

O Context Tracker estima o % de contexto restante baseado no prompt_count
e seleciona quais layers executar.

```mermaid
flowchart TD
    PROMPT_COUNT["session.prompt_count"] --> ESTIMATE["estimateContextPercent()<br/>formula: 100 - (count * 1500 / 200000 * 100)"]
    ESTIMATE --> CALC["calculateBracket(percent)"]

    CALC --> FRESH["FRESH (60-100%)<br/>Token Budget: 800"]
    CALC --> MODERATE["MODERATE (40-60%)<br/>Token Budget: 1500"]
    CALC --> DEPLETED["DEPLETED (25-40%)<br/>Token Budget: 2000"]
    CALC --> CRITICAL["CRITICAL (0-25%)<br/>Token Budget: 2500"]

    FRESH --> FRESH_LAYERS["L0, L1, L2, L7<br/>Lean injection"]
    MODERATE --> MOD_LAYERS["L0-L7 (todos)<br/>Standard injection"]
    DEPLETED --> DEP_LAYERS["L0-L7 + Memory Hints<br/>Reinforcement injection"]
    CRITICAL --> CRIT_LAYERS["L0-L7 + Memory Hints<br/>+ Handoff Warning"]

    style FRESH fill:#00b894,color:#fff
    style MODERATE fill:#fdcb6e,color:#333
    style DEPLETED fill:#e17055,color:#fff
    style CRITICAL fill:#d63031,color:#fff
```

### Tabela de Brackets

| Bracket | Context % | Layers Ativos | Token Budget | Memory Hints | Handoff Warning |
|---------|-----------|---------------|-------------|-------------|-----------------|
| FRESH | 60-100% | L0, L1, L2, L7 | 800 | Nao | Nao |
| MODERATE | 40-60% | L0-L7 (todos) | 1500 | Nao | Nao |
| DEPLETED | 25-40% | L0-L7 (todos) | 2000 | Sim | Nao |
| CRITICAL | 0-25% | L0-L7 (todos) | 2500 | Sim | Sim |

---

## 5. Domain System — Manifest + Domain Files

O `.synapse/manifest` e o registro central de todos os domains.
Cada domain tem um arquivo com regras em formato KEY=VALUE ou plain text.

```mermaid
flowchart TD
    subgraph MANIFEST[".synapse/manifest (KEY=VALUE)"]
        M_CONST["CONSTITUTION_STATE=active<br/>CONSTITUTION_ALWAYS_ON=true<br/>CONSTITUTION_NON_NEGOTIABLE=true"]
        M_GLOBAL["GLOBAL_STATE=active<br/>GLOBAL_ALWAYS_ON=true"]
        M_AGENT["AGENT_DEV_STATE=active<br/>AGENT_DEV_AGENT_TRIGGER=dev"]
        M_WORKFLOW["WORKFLOW_STORY_DEV_STATE=active<br/>WORKFLOW_STORY_DEV_WORKFLOW_TRIGGER=story_development"]
        M_DEVMODE["DEVMODE=false"]
    end

    subgraph DOMAINS[".synapse/ Domain Files"]
        D_CONST["constitution<br/>(6 artigos, NON-NEGOTIABLE)"]
        D_GLOBAL["global<br/>(regras globais, ALWAYS_ON)"]
        D_CONTEXT["context<br/>(brackets, ALWAYS_ON)"]
        D_COMMANDS["commands<br/>([*command] blocks)"]
        D_AGENT["agent-dev<br/>agent-qa<br/>agent-architect<br/>agent-pm<br/>agent-po<br/>agent-sm<br/>agent-devops<br/>agent-analyst<br/>agent-data-engineer<br/>agent-ux<br/>agent-aios-master<br/>agent-squad-creator"]
        D_WORKFLOW["workflow-story-dev<br/>workflow-epic-create<br/>workflow-arch-review"]
    end

    MANIFEST -->|"parseManifest()"| LOADER["DomainLoader"]
    LOADER -->|"loadDomainFile()"| DOMAINS

    subgraph TRIGGER["Mecanismos de Ativacao"]
        T_ALWAYS["ALWAYS_ON=true<br/>→ Carrega sempre"]
        T_AGENT["AGENT_TRIGGER=id<br/>→ Quando agent ativo"]
        T_WORKFLOW["WORKFLOW_TRIGGER=id<br/>→ Quando workflow ativo"]
        T_KEYWORD["RECALL=keywords<br/>→ Keyword no prompt"]
        T_COMMAND["*command no prompt<br/>→ Star-command match"]
    end
```

### Domain Attributes

| Attribute | Formato | Funcao |
|-----------|---------|--------|
| `{DOMAIN}_STATE` | `active\|inactive` | Liga/desliga o domain |
| `{DOMAIN}_ALWAYS_ON` | `true` | Carrega em TODO prompt |
| `{DOMAIN}_NON_NEGOTIABLE` | `true` | Nao pode ser desligado |
| `{DOMAIN}_AGENT_TRIGGER` | `agent_id` | Ativa quando agent ativo |
| `{DOMAIN}_WORKFLOW_TRIGGER` | `workflow_id` | Ativa quando workflow ativo |
| `{DOMAIN}_RECALL` | `kw1,kw2,...` | Ativa por keyword match |
| `{DOMAIN}_EXCLUDE` | `skip1,skip2,...` | Exclui quando keyword presente |

---

## 6. Session Management — Estado Persistente

Cada sessao Claude Code tem um arquivo JSON em `.synapse/sessions/`.
A session rastreia agent ativo, workflow, task, squad e historico.

```mermaid
flowchart TD
    subgraph SESSION_SCHEMA["Session Schema v2.0"]
        UUID["uuid: session-id"]
        AGENT["active_agent:<br/>{ id, activated_at, activation_quality }"]
        WORKFLOW["active_workflow:<br/>{ id, current_phase }"]
        TASK["active_task: story-id"]
        SQUAD["active_squad: squad-name"]
        CONTEXT["context:<br/>{ last_bracket, last_tokens_used,<br/>last_context_percent }"]
        HISTORY["history:<br/>{ star_commands_used,<br/>domains_loaded_last,<br/>agents_activated }"]
        META["prompt_count | last_activity | title"]
    end

    subgraph LIFECYCLE["Ciclo de Vida"]
        CREATE["createSession(id, cwd)"]
        LOAD["loadSession(id, dir)"]
        UPDATE["updateSession(id, dir, updates)<br/>→ prompt_count++<br/>→ last_activity = now"]
        CLEAN["cleanStaleSessions(dir, 24h)"]
        DELETE["deleteSession(id, dir)"]
    end

    CREATE -->|"Primeiro prompt"| LOAD
    LOAD -->|"Cada prompt"| UPDATE
    UPDATE -->|"Proximos prompts"| LOAD
    CLEAN -->|">24h inativo"| DELETE

    subgraph CONSUMERS["Quem Escreve na Session"]
        C_HOOK["synapse-engine.js<br/>(per-prompt update)"]
        C_UAP["UnifiedActivationPipeline<br/>(seta active_agent)"]
        C_SM["Scrum Master workflow<br/>(seta active_workflow)"]
    end

    C_HOOK --> UPDATE
    C_UAP -->|"escreve _active-agent.json<br/>(SYN-13 bridge)"| UPDATE
    C_SM -.->|"futuro"| UPDATE
```

---

## 7. Conexao com Activation Pipeline (UAP)

O SYNAPSE **NAO substitui** o UnifiedActivationPipeline — ele o **complementa**.
O UAP executa na ativacao do agente (uma vez). O SYNAPSE executa a cada prompt.

```mermaid
flowchart TD
    subgraph UAP["UnifiedActivationPipeline (ACT Epic)"]
        UAP_TRIGGER["@agent command"]
        UAP_LOAD["Tiered Loading<br/>Tier 1: 80ms Critical<br/>Tier 2: 120ms High<br/>Tier 3: 180ms Best-effort"]
        UAP_GREETING["GreetingBuilder<br/>(8 sections, context-aware)"]
        UAP_SESSION["Seta session.active_agent"]
    end

    subgraph SYNAPSE["SYNAPSE Engine (SYN Epic)"]
        SYN_HOOK["UserPromptSubmit Hook"]
        SYN_L2["L2: Agent-Scoped Layer"]
        SYN_L3["L3: Workflow Layer"]
        SYN_RULES["<synapse-rules> injection"]
    end

    subgraph SESSION[".synapse/sessions/"]
        S_FILE["session.json<br/>active_agent.id = 'dev'"]
    end

    UAP_TRIGGER --> UAP_LOAD
    UAP_LOAD --> UAP_GREETING
    UAP_GREETING --> UAP_SESSION
    UAP_SESSION -->|"escreve"| S_FILE

    SYN_HOOK -->|"le"| S_FILE
    S_FILE --> SYN_L2
    S_FILE --> SYN_L3
    SYN_L2 --> SYN_RULES
    SYN_L3 --> SYN_RULES

    style UAP fill:#74b9ff,color:#333
    style SYNAPSE fill:#a29bfe,color:#fff
```

### Separacao de Responsabilidades

| Aspecto | UAP (Activation Pipeline) | SYNAPSE Engine |
|---------|--------------------------|----------------|
| **Trigger** | `@agent` command (uma vez) | Cada prompt (automatico) |
| **Funcao** | Greeting + agent config | Context injection |
| **Performance** | 168ms p50 (one-shot) | <100ms per-prompt |
| **Output** | Greeting visual no terminal | `<synapse-rules>` invisivel |
| **Session** | Escreve `active_agent` | Le `active_agent` para L2 |

---

## 8. Conexao com Memory Intelligence System (MIS)

O SYNAPSE consome o MIS via **MemoryBridge** — um consumer feature-gated
que so ativa com licenca Pro. Nunca modifica a memoria, apenas le.

```mermaid
flowchart TD
    subgraph SYNAPSE["SYNAPSE Engine"]
        ENGINE["SynapseEngine.process()"]
        BRIDGE["MemoryBridge"]
        CHECK_BRACKET{"needsMemoryHints(bracket)?"}
    end

    subgraph GATE["Feature Gate (Pro)"]
        FG_CHECK{"featureGate.isAvailable<br/>('pro.memory.synapse')?"}
    end

    subgraph MIS["Memory Intelligence System (Pro)"]
        PROVIDER["SynapseMemoryProvider"]
        MEMORY_STORE["Memory Store<br/>(4 camadas MIS)"]
    end

    subgraph BRACKET_MAP["Bracket → Memory Layer"]
        B_FRESH["FRESH → skip (0 tokens)"]
        B_MOD["MODERATE → Layer 1 metadata (50 tokens)"]
        B_DEP["DEPLETED → Layer 2 chunks (200 tokens)"]
        B_CRIT["CRITICAL → Layer 3 full content (1000 tokens)"]
    end

    ENGINE --> CHECK_BRACKET
    CHECK_BRACKET -->|"FRESH"| SKIP["Skip — sem memory hints"]
    CHECK_BRACKET -->|"DEPLETED/CRITICAL"| BRIDGE

    BRIDGE --> FG_CHECK
    FG_CHECK -->|"Nao (open-source)"| EMPTY["return []<br/>(graceful no-op)"]
    FG_CHECK -->|"Sim (Pro)"| PROVIDER

    PROVIDER -->|"getMemories(agent, bracket, budget)"| MEMORY_STORE
    MEMORY_STORE --> HINTS["Memory Hints[]"]
    HINTS --> BUDGET["enforceTokenBudget()"]
    BUDGET --> FORMAT["Formatter → [MEMORY HINTS]<br/>section no output"]

    BRIDGE -.->|"Timeout: 15ms"| TIMEOUT["return []"]

    style SKIP fill:#00b894,color:#fff
    style EMPTY fill:#fdcb6e,color:#333
    style TIMEOUT fill:#ff7675,color:#fff
```

### Caracteristicas do MemoryBridge

| Aspecto | Detalhe |
|---------|---------|
| **Tipo** | Consumer only (read-only) |
| **Feature Gate** | `pro.memory.synapse` |
| **Timeout** | 15ms (hard limit) |
| **Fallback** | return [] (graceful no-op) |
| **Cache** | Session-level via provider |
| **Lazy Load** | Provider carregado sob demanda |

---

## 9. Output Formatter — Montagem do XML Final

O formatter recebe os resultados de todos os layers e monta o
`<synapse-rules>` XML respeitando ordem de secoes e token budget.

```mermaid
flowchart TD
    subgraph INPUTS["Layer Results"]
        R_L0["L0 Constitution rules"]
        R_L1["L1 Global rules"]
        R_L2["L2 Agent rules"]
        R_L3["L3 Workflow rules"]
        R_L4["L4 Task rules"]
        R_L5["L5 Squad rules"]
        R_L6["L6 Keyword rules"]
        R_L7["L7 Star-Command rules"]
        R_MEM["Memory Hints"]
    end

    subgraph FORMATTER["formatSynapseRules()"]
        CATEGORIZE["Categorizar por secao<br/>(LAYER_TO_SECTION map)"]
        ORDER["Ordenar secoes<br/>(SECTION_ORDER array)"]
        RENDER["Render cada secao<br/>(formatters especificos)"]
        BUDGET["enforceTokenBudget()<br/>(trunca do fim)"]
        WRAP["Wrap em <synapse-rules>"]
    end

    subgraph OUTPUT["Output Final"]
        XML["<synapse-rules><br/><br/>[CONTEXT BRACKET]<br/>[CONSTITUTION]<br/>[ACTIVE AGENT]<br/>[ACTIVE WORKFLOW]<br/>[TASK CONTEXT]<br/>[SQUAD]<br/>[KEYWORD MATCHES]<br/>[MEMORY HINTS]<br/>[STAR-COMMANDS]<br/>[DEVMODE STATUS]<br/>[LOADED DOMAINS SUMMARY]<br/><br/></synapse-rules>"]
    end

    INPUTS --> CATEGORIZE
    CATEGORIZE --> ORDER
    ORDER --> RENDER
    RENDER --> BUDGET
    BUDGET --> WRAP
    WRAP --> XML
```

### Ordem de Secoes (prioridade de truncamento)

Quando o token budget e excedido, secoes sao removidas do FIM primeiro:

| # | Secao | Protegida? | Truncamento |
|---|-------|-----------|-------------|
| 1 | CONTEXT_BRACKET | Sim | Nunca removida |
| 2 | CONSTITUTION | Sim | Nunca removida |
| 3 | AGENT | Sim | Nunca removida |
| 4 | WORKFLOW | Nao | Removida por ultimo |
| 5 | TASK | Nao | Removida 5o |
| 6 | SQUAD | Nao | Removida 4o |
| 7 | KEYWORD | Nao | Removida 2o |
| 8 | MEMORY_HINTS | Nao | Removida 3o |
| 9 | STAR_COMMANDS | Nao | Removida 4o |
| 10 | DEVMODE | Nao | Removida 5o |
| 11 | SUMMARY | Nao | Removida 1o (primeiro a sair) |

---

## 10. Fallback & Error Recovery

Cada camada do SYNAPSE implementa graceful degradation.
Nenhum erro bloqueia o prompt do usuario.

```mermaid
flowchart TD
    subgraph LAYER_FALLBACK["Per-Layer Fallback"]
        TRY["LayerProcessor._safeProcess()"] --> CHECK{"Sucesso?"}
        CHECK -->|"Sim"| RETURN["Retorna rules[]"]
        CHECK -->|"Timeout > budget"| WARN["console.warn + retorna result"]
        CHECK -->|"Error"| NULL["Retorna null (skip layer)"]
    end

    subgraph PIPELINE_FALLBACK["Pipeline Fallback"]
        PIPE_START["Pipeline start"] --> PIPE_CHECK{"Elapsed > 100ms?"}
        PIPE_CHECK -->|"Sim"| PIPE_SKIP["Skip remaining layers<br/>(reason: Pipeline timeout)"]
        PIPE_CHECK -->|"Nao"| PIPE_NEXT["Executa proximo layer"]
    end

    subgraph HOOK_FALLBACK["Hook Entry Fallback"]
        HOOK_ERROR["Qualquer erro no main()"] --> HOOK_EXIT["console.error + exit(0)<br/>(nunca bloqueia prompt)"]
        HOOK_TIMEOUT["Safety timeout: 5s"] --> HOOK_EXIT
    end

    subgraph MEMORY_FALLBACK["Memory Bridge Fallback"]
        MEM_NO_PRO["Pro nao instalado"] --> MEM_EMPTY["return []"]
        MEM_TIMEOUT["Timeout > 15ms"] --> MEM_EMPTY
        MEM_ERROR["Provider erro"] --> MEM_EMPTY
    end

    style NULL fill:#ffeaa7,color:#333
    style PIPE_SKIP fill:#fab1a0,color:#333
    style HOOK_EXIT fill:#ff7675,color:#fff
    style MEM_EMPTY fill:#81ecec,color:#333
```

---

## 11. Layer Processing Detail — Cada Layer Explicado

```mermaid
flowchart TD
    subgraph L0["L0: Constitution (5ms)"]
        L0_IN["Trigger: ALWAYS_ON + NON_NEGOTIABLE"]
        L0_LOAD["Carrega .synapse/constitution"]
        L0_OUT["6 Artigos constitucionais<br/>CLI First, Agent Authority, etc."]
        L0_IN --> L0_LOAD --> L0_OUT
    end

    subgraph L1["L1: Global (10ms)"]
        L1_IN["Trigger: ALWAYS_ON"]
        L1_LOAD["Carrega .synapse/global"]
        L1_OUT["Regras globais aplicaveis<br/>a todo contexto"]
        L1_IN --> L1_LOAD --> L1_OUT
    end

    subgraph L2["L2: Agent-Scoped (15ms)"]
        L2_IN["Trigger: session.active_agent.id"]
        L2_MATCH["Busca AGENT_{X}_AGENT_TRIGGER={id}<br/>no manifest"]
        L2_LOAD["Carrega .synapse/agent-{id}"]
        L2_OUT["Regras do agente ativo<br/>+ authority boundaries"]
        L2_IN --> L2_MATCH --> L2_LOAD --> L2_OUT
    end

    subgraph L3["L3: Workflow (15ms)"]
        L3_IN["Trigger: session.active_workflow.id"]
        L3_MATCH["Busca WORKFLOW_{X}_WORKFLOW_TRIGGER={id}<br/>no manifest"]
        L3_LOAD["Carrega .synapse/workflow-{id}"]
        L3_OUT["Regras do workflow ativo<br/>+ fase atual"]
        L3_IN --> L3_MATCH --> L3_LOAD --> L3_OUT
    end

    subgraph L4["L4: Task (15ms)"]
        L4_IN["Trigger: session.active_task"]
        L4_OUT["Contexto da task ativa<br/>(story ID, pre-conditions, AC)"]
        L4_IN --> L4_OUT
    end

    subgraph L5["L5: Squad (15ms)"]
        L5_IN["Trigger: session.active_squad"]
        L5_OUT["Regras do squad ativo<br/>(dynamic domain discovery)"]
        L5_IN --> L5_OUT
    end

    subgraph L6["L6: Keyword (15ms)"]
        L6_IN["Trigger: RECALL keywords no prompt"]
        L6_SCAN["Varre manifest: {DOMAIN}_RECALL=kw1,kw2"]
        L6_MATCH["matchKeywords(prompt, recall)"]
        L6_EXCL["isExcluded(prompt, excludes)?"]
        L6_LOAD["Carrega domain files matchados"]
        L6_OUT["Regras de domains ativados<br/>por keyword"]
        L6_IN --> L6_SCAN --> L6_MATCH --> L6_EXCL
        L6_EXCL -->|"Nao excluido"| L6_LOAD --> L6_OUT
        L6_EXCL -->|"Excluido"| L6_SKIP["Skip domain"]
    end

    subgraph L7["L7: Star-Command (5ms)"]
        L7_IN["Trigger: *command no prompt"]
        L7_REGEX["Regex: /\\*([a-z][\\w-]*)/gi"]
        L7_LOAD["Carrega .synapse/commands"]
        L7_PARSE["Extrai bloco [*command]"]
        L7_OUT["Regras do comando detectado"]
        L7_IN --> L7_REGEX --> L7_LOAD --> L7_PARSE --> L7_OUT
    end
```

---

## 12. Fluxo Completo End-to-End (Exemplo Real)

Cenario: usuario ativa `@dev` e depois digita `*draft uma feature de login`

```mermaid
sequenceDiagram
    participant U as Usuario
    participant CC as Claude Code
    participant UAP as Activation Pipeline
    participant H as synapse-engine.js
    participant E as SynapseEngine
    participant S as Session Manager
    participant D as Domain Loader
    participant M as Memory Bridge
    participant F as Formatter

    Note over U,CC: Fase 1: Ativacao do Agente
    U->>CC: @dev
    CC->>UAP: activate('dev')
    UAP->>S: createSession() ou updateSession()<br/>active_agent = { id: 'dev' }
    UAP->>CC: Greeting: "Dex ready!"

    Note over U,CC: Fase 2: Prompt Normal
    U->>CC: *draft uma feature de login
    CC->>H: UserPromptSubmit<br/>{ sessionId, cwd, prompt }

    H->>S: loadSession(sessionId)
    S-->>H: session { active_agent: 'dev', prompt_count: 5 }

    H->>E: process(prompt, session)

    Note over E: Context Bracket
    E->>E: estimateContextPercent(5) = 96.25%
    E->>E: calculateBracket(96.25) = FRESH
    E->>E: getActiveLayers(FRESH) = [L0, L1, L2, L7]

    Note over E,D: Layer Execution
    E->>D: L0: loadDomainFile('constitution')
    D-->>E: 6 constitutional rules

    E->>D: L1: loadDomainFile('global')
    D-->>E: global rules

    E->>D: L2: agent_trigger='dev' → loadDomainFile('agent-dev')
    D-->>E: dev agent rules + authority

    Note over E: L3-L6 SKIPPED (FRESH bracket)

    E->>D: L7: detect *draft → loadDomainFile('commands')
    D-->>E: [*draft] command rules

    E->>M: needsMemoryHints(FRESH)?
    M-->>E: false → skip

    E->>F: formatSynapseRules(results, FRESH, 96.25, session)
    F-->>E: <synapse-rules>...[CONSTITUTION]...[AGENT: @dev]...[*draft]...</synapse-rules>

    E-->>H: { xml, metrics }
    H-->>CC: { hookSpecificOutput: { additionalContext: xml } }
    CC->>CC: Injeta synapse-rules no prompt
    CC->>U: Resposta com contexto de @dev + *draft
```

---

## 13. Arvore de Arquivos — Mapa Completo

```
aios-core/
├── .claude/
│   └── hooks/
│       └── synapse-engine.js              # Hook entry point (78 linhas)
│
├── .aios-core/core/synapse/               # Engine core (modular)
│   ├── engine.js                          # SynapseEngine orchestrator
│   ├── context/
│   │   └── context-tracker.js             # Bracket calculation (SYN-3)
│   ├── domain/
│   │   └── domain-loader.js               # Manifest parser + domain loader (SYN-1)
│   ├── layers/
│   │   ├── layer-processor.js             # Abstract base class
│   │   ├── l0-constitution.js             # NON-NEGOTIABLE rules (SYN-4)
│   │   ├── l1-global.js                   # Global ALWAYS_ON rules (SYN-4)
│   │   ├── l2-agent.js                    # Agent-scoped rules (SYN-4)
│   │   ├── l3-workflow.js                 # Workflow-scoped rules (SYN-4)
│   │   ├── l4-task.js                     # Task context (SYN-5)
│   │   ├── l5-squad.js                    # Squad domains (SYN-5)
│   │   ├── l6-keyword.js                  # RECALL keyword matching (SYN-5)
│   │   └── l7-star-command.js             # *command detection (SYN-5)
│   ├── memory/
│   │   └── memory-bridge.js               # MIS consumer, Pro-gated (SYN-10)
│   ├── output/
│   │   └── formatter.js                   # XML output formatter (SYN-6)
│   ├── session/
│   │   └── session-manager.js             # Session CRUD + cleanup (SYN-2)
│   ├── scripts/
│   │   └── generate-constitution.js       # Auto-gen constitution domain
│   └── utils/
│       ├── paths.js                       # Path resolution helpers
│       └── tokens.js                      # Token estimation
│
├── .synapse/                              # Runtime data (gitignored sessions/)
│   ├── manifest                           # Domain registry (KEY=VALUE)
│   ├── constitution                       # L0 domain (auto-generated)
│   ├── global                             # L1 domain
│   ├── context                            # L1 context brackets
│   ├── commands                           # L7 star-command blocks
│   ├── agent-dev                          # L2 @dev domain
│   ├── agent-qa                           # L2 @qa domain
│   ├── agent-architect                    # L2 @architect domain
│   ├── agent-pm                           # L2 @pm domain
│   ├── agent-po                           # L2 @po domain
│   ├── agent-sm                           # L2 @sm domain
│   ├── agent-devops                       # L2 @devops domain
│   ├── agent-analyst                      # L2 @analyst domain
│   ├── agent-data-engineer                # L2 @data-engineer domain
│   ├── agent-ux                           # L2 @ux domain
│   ├── agent-aios-master                  # L2 @aios-master domain
│   ├── agent-squad-creator                # L2 @squad-creator domain
│   ├── workflow-story-dev                 # L3 story development domain
│   ├── workflow-epic-create               # L3 epic creation domain
│   ├── workflow-arch-review               # L3 architecture review domain
│   ├── sessions/                          # Session JSON files (gitignored)
│   └── cache/                             # Cache dir (gitignored)
│
├── .aios-core/development/scripts/
│   ├── unified-activation-pipeline.js     # UAP — agent activation
│   └── greeting-builder.js               # Greeting assembly
│
└── pro/                                   # Pro submodule (proprietary)
    ├── license/
    │   └── feature-gate.js                # Feature gate for Pro
    └── memory/
        └── synapse-memory-provider.js     # MIS provider for SYNAPSE
```

---

## 14. Relacao entre Epics

```mermaid
flowchart LR
    subgraph EPICS["Epics Relacionados"]
        ACT["Epic ACT<br/>Activation Pipeline<br/>(DONE)"]
        SYN["Epic SYN<br/>SYNAPSE Engine<br/>(IN PROGRESS)"]
        MIS["Epic MIS<br/>Memory Intelligence<br/>(PLANNED)"]
        PRO["Epic PRO<br/>AIOS Pro Architecture<br/>(IN PROGRESS)"]
    end

    ACT -->|"Session: active_agent<br/>UAP escreve, SYNAPSE le"| SYN
    MIS -->|"MemoryBridge consumer<br/>(Pro feature-gated)"| SYN
    PRO -->|"Feature gate<br/>pro.memory.synapse"| SYN

    SYN -->|"Preserva tiered loading<br/>do ACT"| ACT
    SYN -->|"Consumer-only<br/>nunca modifica MIS"| MIS

    style ACT fill:#00b894,color:#fff
    style SYN fill:#6c5ce7,color:#fff
    style MIS fill:#fdcb6e,color:#333
    style PRO fill:#e17055,color:#fff
```

---

*Documento gerado por @architect (Aria)*
*Baseado na implementacao real do codebase — nao especulativo*

— Aria, arquitetando o futuro 🏗️
