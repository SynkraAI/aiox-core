# Memory System - Complete Architecture Guide

**Versao:** 1.0
**Ultima Atualizacao:** 2026-02-09
**Autor:** @architect (Aria)
**Tags:** memory, session, persistence, context, gotchas, timeline, hooks

---

## Indice

1. [Visao Geral](#visao-geral)
2. [Diagrama de Arquitetura Completo](#diagrama-de-arquitetura-completo)
3. [Camada 1: Claude Code Nativo](#camada-1-claude-code-nativo)
4. [Camada 2: AIOX Framework](#camada-2-aiox-framework)
5. [Fluxo de Ativacao de Agente (Memory Load)](#fluxo-de-ativacao-de-agente-memory-load)
6. [Fluxo de Persistencia (Memory Save)](#fluxo-de-persistencia-memory-save)
7. [Fluxo de Session Lifecycle](#fluxo-de-session-lifecycle)
8. [Gotchas Memory - Auto-Capture Flow](#gotchas-memory---auto-capture-flow)
9. [Context Snapshot & Recovery](#context-snapshot--recovery)
10. [Timeline Manager - Unified Facade](#timeline-manager---unified-facade)
11. [Hooks System - Cross-CLI Abstraction](#hooks-system---cross-cli-abstraction)
12. [Mapa Completo de Arquivos](#mapa-completo-de-arquivos)
13. [Mapa de Storage Persistente](#mapa-de-storage-persistente)
14. [Gaps e Limitacoes Conhecidas](#gaps-e-limitacoes-conhecidas)
15. [Referencias](#referencias)

---

## Visao Geral

O sistema de memoria do AIOX opera em **duas camadas independentes** que coexistem mas **nao se comunicam entre si**:

| Camada | Gerenciado Por | Escopo |
|--------|---------------|--------|
| **Camada 1: Claude Code Nativo** | Claude Code CLI | Auto Memory, CLAUDE.md, Session Transcripts |
| **Camada 2: AIOX Framework** | Scripts JS em `.aiox-core/` | Gotchas, Session State, Context Snapshots, Timeline |

### Principios Chave

- **Nao existe session-digest automatico** — Quando uma sessao do Claude Code fecha, nenhuma sumarizacao acontece
- **Nao existe memory-flush automatico** — O MEMORY.md so e atualizado durante a sessao, pelo Claude
- **Hooks de sessao existem para Gemini** mas nao estao wired no Claude Code
- **Cada camada persiste de forma independente** — `.claude/` vs `.aiox/`

---

## Diagrama de Arquitetura Completo

### Visao em Duas Camadas

```mermaid
flowchart TB
    subgraph CLAUDE_NATIVE["Camada 1: Claude Code Nativo"]
        direction TB
        CLAUDE_MD_G["CLAUDE.md Global<br/>~/.claude/CLAUDE.md"]
        CLAUDE_MD_W["CLAUDE.md Workspace<br/>Workspaces/.claude/CLAUDE.md"]
        CLAUDE_MD_P["CLAUDE.md Projeto<br/>aiox-core/.claude/CLAUDE.md"]
        RULES["Rules/*.md<br/>5 arquivos de regras"]
        AUTO_MEM["Auto Memory<br/>~/.claude/projects/.../memory/MEMORY.md<br/>Primeiras 200 linhas no system prompt"]
        COMPOUND["Compound Analysis<br/>memory/compound-analysis/<br/>11 arquivos (9 conteudo + manifest + summary)"]
        AGENT_MEM["Agent Memory<br/>.claude/agent-memory/{agent}/MEMORY.md<br/>6 agentes com memoria"]
        TRANSCRIPTS["Session Transcripts<br/>~/.claude/projects/.../{session}.jsonl"]
        SESSIONS_IDX["Sessions Index<br/>sessions-index.json"]
    end

    subgraph AIOX_FRAMEWORK["Camada 2: AIOX Framework"]
        direction TB
        GOTCHAS["Gotchas Memory<br/>.aiox-core/core/memory/gotchas-memory.js"]
        CTX_SNAP["Context Snapshot<br/>.aiox-core/core/memory/context-snapshot.js"]
        FILE_EVO["File Evolution Tracker<br/>.aiox-core/core/memory/file-evolution-tracker.js"]
        TIMELINE["Timeline Manager<br/>.aiox-core/core/memory/timeline-manager.js"]
        CTX_LOADER["Session Context Loader<br/>.aiox-core/core/session/context-loader.js"]
        CTX_DETECT["Context Detector<br/>.aiox-core/core/session/context-detector.js"]
        SESS_STATE["Session State<br/>.aiox-core/core/orchestration/session-state.js"]
        HOOKS_GEM["Gemini Hooks<br/>.aiox-core/hooks/gemini/"]
        HOOKS_UNI["Unified Hooks<br/>.aiox-core/hooks/unified/"]
    end

    subgraph STORAGE_CLAUDE["Storage Claude Code"]
        S_MEMORY["~/.claude/projects/.../memory/"]
        S_SESSIONS["~/.claude/projects/.../*.jsonl"]
        S_AGENT_MEM[".claude/agent-memory/"]
    end

    subgraph STORAGE_AIOX["Storage AIOX (.aiox/)"]
        S_GOTCHAS[".aiox/gotchas.json + .md"]
        S_ERRORS[".aiox/error-tracking.json"]
        S_SNAPSHOTS[".aiox/snapshots/"]
        S_TIMELINE[".aiox/timeline/"]
        S_FILE_EVO[".aiox/file-evolution/"]
        S_SESSION[".aiox/session-state.json"]
        S_EPIC_STATE["docs/stories/.session-state.yaml"]
    end

    AUTO_MEM --> S_MEMORY
    AGENT_MEM --> S_AGENT_MEM
    TRANSCRIPTS --> S_SESSIONS

    GOTCHAS --> S_GOTCHAS
    GOTCHAS --> S_ERRORS
    CTX_SNAP --> S_SNAPSHOTS
    FILE_EVO --> S_FILE_EVO
    TIMELINE --> S_TIMELINE
    CTX_LOADER --> S_SESSION
    SESS_STATE --> S_EPIC_STATE

    style CLAUDE_NATIVE fill:#E3F2FD,stroke:#1565C0
    style AIOX_FRAMEWORK fill:#FFF3E0,stroke:#E65100
    style STORAGE_CLAUDE fill:#E8F5E9,stroke:#2E7D32
    style STORAGE_AIOX fill:#FCE4EC,stroke:#C62828
```

### Relacionamento entre Scripts

```mermaid
flowchart LR
    subgraph MEMORY_LAYER["Memory Layer (.aiox-core/core/memory/)"]
        TM["timeline-manager.js"]
        FET["file-evolution-tracker.js"]
        CS["context-snapshot.js"]
        GM["gotchas-memory.js"]
    end

    subgraph SESSION_LAYER["Session Layer (.aiox-core/core/session/)"]
        CL["context-loader.js"]
        CD["context-detector.js"]
    end

    subgraph ORCHESTRATION["Orchestration (.aiox-core/core/orchestration/)"]
        SS["session-state.js"]
    end

    subgraph ACTIVATION["Activation Pipeline (.aiox-core/development/scripts/)"]
        UAP["unified-activation-pipeline.js"]
        GB["greeting-builder.js"]
    end

    subgraph HOOKS["Hooks System (.aiox-core/hooks/)"]
        HS["gemini/session-start.js"]
        HE["gemini/session-end.js"]
        HI["unified/hook-interface.js"]
        HR["unified/hook-registry.js"]
    end

    TM -->|"integra"| FET
    TM -->|"integra"| CS
    CL -->|"usa"| CD
    UAP -->|"Tier 3"| CL
    UAP -->|"chama"| GB
    GB -->|"lê"| SS
    HI -->|"abstrai"| HS
    HI -->|"abstrai"| HE
    HR -->|"registra"| HI

    style MEMORY_LAYER fill:#FFF9C4,stroke:#F9A825
    style SESSION_LAYER fill:#E1F5FE,stroke:#0277BD
    style ORCHESTRATION fill:#F3E5F5,stroke:#7B1FA2
    style ACTIVATION fill:#E8F5E9,stroke:#388E3C
    style HOOKS fill:#FFCCBC,stroke:#BF360C
```

---

## Camada 1: Claude Code Nativo

### Hierarquia de Carregamento (toda sessao nova)

```mermaid
flowchart TD
    START([Sessao Claude Code Inicia]) --> LOAD_GLOBAL

    subgraph LOAD["Carregamento Automatico — Ordem Fixa"]
        LOAD_GLOBAL["1. ~/.claude/CLAUDE.md<br/>Instrucoes globais do usuario"]
        LOAD_WORKSPACE["2. Workspaces/.claude/CLAUDE.md<br/>Instrucoes nivel workspace"]
        LOAD_PROJECT["3. aiox-core/.claude/CLAUDE.md<br/>Instrucoes nivel projeto"]
        LOAD_RULES["4. aiox-core/.claude/rules/*.md<br/>5 arquivos de regras detalhadas"]
        LOAD_MEMORY["5. ~/.claude/projects/.../memory/MEMORY.md<br/>Auto Memory (primeiras 200 linhas)"]
    end

    LOAD_GLOBAL --> LOAD_WORKSPACE
    LOAD_WORKSPACE --> LOAD_PROJECT
    LOAD_PROJECT --> LOAD_RULES
    LOAD_RULES --> LOAD_MEMORY

    LOAD_MEMORY --> READY([System Prompt Montado])

    style LOAD fill:#E3F2FD,stroke:#1565C0
    style READY fill:#C8E6C9,stroke:#2E7D32
```

### Auto Memory — Fluxo de Leitura e Escrita

```mermaid
flowchart TD
    subgraph READ_FLOW["Leitura (Automatica — Toda Sessao)"]
        R1([Sessao Inicia]) --> R2["Claude Code le MEMORY.md"]
        R2 --> R3{"Mais de 200 linhas?"}
        R3 -->|"Sim"| R4["Trunca no limite<br/>Linhas 201+ ignoradas"]
        R3 -->|"Nao"| R5["Carrega completo"]
        R4 --> R6["Injeta no system prompt"]
        R5 --> R6
    end

    subgraph WRITE_FLOW["Escrita (Durante Sessao — Decisao do Claude)"]
        W1["Claude encontra padrão,<br/>erro ou insight"] --> W2{"Claude decide<br/>salvar na memoria?"}
        W2 -->|"Sim"| W3["Usa Write/Edit tool<br/>para atualizar MEMORY.md"]
        W2 -->|"Nao"| W4["Conhecimento perdido<br/>ao fim da sessao"]
        W3 --> W5["Opcionalmente cria<br/>arquivo topico em<br/>memory/compound-analysis/"]
    end

    subgraph NO_FLUSH["FIM DA SESSAO"]
        E1([Sessao Fecha]) --> E2["Transcricao salva<br/>como .jsonl"]
        E2 --> E3["NADA mais acontece"]
        E3 --> E4["Sem session-digest"]
        E4 --> E5["Sem memory-flush"]
        E5 --> E6["Sem sumarizacao"]
    end

    style READ_FLOW fill:#E8F5E9,stroke:#2E7D32
    style WRITE_FLOW fill:#FFF9C4,stroke:#F9A825
    style NO_FLUSH fill:#FFCDD2,stroke:#C62828
```

### Agent Memory — Por Agente

```mermaid
flowchart LR
    subgraph AGENT_MEM[".claude/agent-memory/"]
        AM1["aiox-architect/MEMORY.md"]
        AM2["aiox-dev/MEMORY.md"]
        AM3["oalanicolas/MEMORY.md"]
        AM4["pedro-valerio/MEMORY.md"]
        AM5["sop-extractor/MEMORY.md"]
        AM6["squad/MEMORY.md"]
    end

    SQUAD_AGENTS["Agentes de Squad<br/>(Claude Code Agents)"] -->|"frontmatter<br/>memory: project"| AGENT_MEM

    NOTE["NOTA: Apenas agentes<br/>definidos em .claude/agents/<br/>usam esta memoria.<br/>Agentes AIOX (.aiox-core/<br/>development/agents/)<br/>NAO usam."]

    style AGENT_MEM fill:#F3E5F5,stroke:#7B1FA2
    style NOTE fill:#FFF9C4,stroke:#F9A825
```

---

## Camada 2: AIOX Framework

### Visao dos 4 Modulos de Memoria

```mermaid
flowchart TD
    subgraph GOTCHAS["gotchas-memory.js — Epic 9, Story 9.4"]
        G1["Auto-capture: erro 3x = gotcha"]
        G2["Manual: *gotcha {desc}"]
        G3["Consulta: *gotchas"]
        G4["Injecao: getContextForTask()"]
        G5[("Persiste em:<br/>.aiox/gotchas.json<br/>.aiox/gotchas.md<br/>.aiox/error-tracking.json")]
    end

    subgraph SNAPSHOTS["context-snapshot.js — Story 12.6"]
        S1["capture(): salva contexto atual"]
        S2["restore(): recupera snapshot"]
        S3["list(): lista snapshots"]
        S4["cleanup(): max 50, 7 dias"]
        S5[("Persiste em:<br/>.aiox/snapshots/{id}.json")]
    end

    subgraph FILE_EVO["file-evolution-tracker.js"]
        F1["trackChange(): registra mudanca"]
        F2["detectDrift(): conflitos potenciais"]
        F3["getEvolution(): historico de arquivo"]
        F4[("Persiste em:<br/>.aiox/file-evolution/<br/>evolution-index.json")]
    end

    subgraph TIMELINE_MGR["timeline-manager.js — Facade Unificada"]
        T1["getUnifiedTimeline(): todas as fontes"]
        T2["addEvent(): evento manual"]
        T3["autoSync(): sync periodico (60s)"]
        T4[("Persiste em:<br/>.aiox/timeline/<br/>unified-timeline.json")]
    end

    TIMELINE_MGR -->|"integra"| SNAPSHOTS
    TIMELINE_MGR -->|"integra"| FILE_EVO

    style GOTCHAS fill:#FFECB3,stroke:#FF8F00
    style SNAPSHOTS fill:#E1F5FE,stroke:#0277BD
    style FILE_EVO fill:#F1F8E9,stroke:#558B2F
    style TIMELINE_MGR fill:#F3E5F5,stroke:#7B1FA2
```

### Visao dos 3 Modulos de Sessao

```mermaid
flowchart TD
    subgraph CTX_DETECT["context-detector.js"]
        CD1["detectSessionType()"]
        CD2{"Conversation<br/>history?"}
        CD3["Analisa comandos recentes"]
        CD4["Le .aiox/session-state.json"]
        CD5["Retorna: new | existing | workflow"]
        CD6{"TTL expirado?<br/>(1 hora)"}

        CD1 --> CD2
        CD2 -->|"Sim"| CD3
        CD2 -->|"Nao"| CD4
        CD3 --> CD5
        CD4 --> CD6
        CD6 -->|"Sim"| CD7["Retorna: new"]
        CD6 -->|"Nao"| CD5
    end

    subgraph CTX_LOADER["context-loader.js"]
        CL1["loadContext(agentId)"]
        CL2["Detecta sessao via ContextDetector"]
        CL3["Le session-state.json"]
        CL4["getPreviousAgent()"]
        CL5["generateContextMessage()"]
        CL6["Retorna: tipo, msg, agente anterior,<br/>comandos, workflow ativo"]
        CL7["updateSessionState()"]
        CL8["onTaskComplete()"]
        CL9[("Persiste em:<br/>.aiox/session-state.json<br/>TTL: 1 hora")]

        CL1 --> CL2
        CL2 --> CL3
        CL3 --> CL4
        CL4 --> CL5
        CL5 --> CL6
        CL7 --> CL9
        CL8 --> CL9
    end

    subgraph SESS_STATE["session-state.js — Story 11.5"]
        SS1["createSessionState()"]
        SS2["loadSessionState()"]
        SS3["recordPhaseChange()"]
        SS4["recordStoryCompleted()"]
        SS5["detectCrash() — 30 min threshold"]
        SS6["getResumeSummary()"]
        SS7[("Persiste em:<br/>docs/stories/<br/>.session-state.yaml<br/>Sem TTL — persistente")]

        SS1 --> SS7
        SS2 --> SS7
        SS3 --> SS7
        SS4 --> SS7
    end

    CTX_DETECT -->|"usado por"| CTX_LOADER

    style CTX_DETECT fill:#E3F2FD,stroke:#1565C0
    style CTX_LOADER fill:#E8F5E9,stroke:#2E7D32
    style SESS_STATE fill:#FFF3E0,stroke:#E65100
```

---

## Fluxo de Ativacao de Agente (Memory Load)

### Pipeline Completo com Tiered Loading

```mermaid
sequenceDiagram
    participant CC as Claude Code
    participant UAP as UnifiedActivationPipeline
    participant ACL as AgentConfigLoader
    participant PM as PermissionMode
    participant GCD as GitConfigDetector
    participant SCL as SessionContextLoader
    participant PSL as ProjectStatusLoader
    participant CD as ContextDetector
    participant SS as SessionState
    participant GB as GreetingBuilder

    CC->>UAP: activate(agentId)
    UAP->>UAP: _loadCoreConfig()

    Note over UAP: ANTES do pipeline, Claude Code<br/>ja carregou: CLAUDE.md (3 niveis),<br/>rules/*.md, MEMORY.md (200 linhas)

    rect rgb(255, 200, 200)
        Note over UAP,ACL: Tier 1 — Critico (80ms)
        UAP->>ACL: loadComplete(coreConfig)
        ACL-->>UAP: agent definition, commands, persona
    end

    Note over UAP: Se Tier 1 falha → fallback greeting

    rect rgb(255, 230, 180)
        Note over UAP,GCD: Tier 2 — Alto (120ms, paralelo)
        par
            UAP->>PM: load() + getBadge()
            PM-->>UAP: {mode, badge}
        and
            UAP->>GCD: get()
            GCD-->>UAP: {branch, type}
        end
    end

    rect rgb(200, 230, 255)
        Note over UAP,PSL: Tier 3 — Best-effort (180ms, paralelo)
        par
            UAP->>SCL: loadContext(agentId)
            SCL->>CD: detectSessionType()
            CD-->>SCL: new | existing | workflow
            SCL-->>UAP: {sessionType, previousAgent, lastCommands, workflow}
        and
            UAP->>PSL: loadProjectStatus()
            PSL-->>UAP: {branch, modifiedFiles, activeStory}
        end
    end

    Note over UAP: Fase Sequencial (depende dos dados)

    UAP->>UAP: _detectSessionType()
    UAP->>UAP: _detectWorkflowState()

    UAP->>GB: buildGreeting(agent, enrichedContext)
    GB->>SS: Consulta .session-state.yaml (se epic ativo)
    SS-->>GB: Estado do epic/story
    GB-->>UAP: greeting formatado

    UAP-->>CC: {greeting, quality: full|partial|fallback}

    Note over CC: NENHUMA memoria AIOX<br/>e carregada automaticamente<br/>no system prompt.<br/>Apenas contexto de sessao<br/>aparece no greeting.
```

---

## Fluxo de Persistencia (Memory Save)

### Quando e Onde Cada Tipo de Memoria e Salva

```mermaid
flowchart TD
    subgraph TRIGGERS["Eventos que Disparam Save"]
        T1["Agente ativado"]
        T2["Comando executado"]
        T3["Task completada"]
        T4["Erro ocorre"]
        T5["Erro repete 3x"]
        T6["*gotcha {desc}"]
        T7["Phase muda"]
        T8["Story completada"]
        T9["Snapshot manual"]
        T10["Arquivo modificado"]
    end

    subgraph SAVES["O Que e Salvo"]
        S1[".aiox/session-state.json<br/>Agente atual, comandos, workflow"]
        S2[".aiox/error-tracking.json<br/>Ocorrencia do erro"]
        S3[".aiox/gotchas.json<br/>Nova gotcha auto-capturada"]
        S4[".aiox/gotchas.json<br/>Gotcha manual adicionada"]
        S5["docs/stories/.session-state.yaml<br/>Phase atualizada"]
        S6["docs/stories/.session-state.yaml<br/>Story marcada done"]
        S7[".aiox/snapshots/{id}.json<br/>Contexto capturado"]
        S8[".aiox/file-evolution/<br/>Evolucao registrada"]
    end

    T1 --> S1
    T2 --> S1
    T3 --> S1
    T4 --> S2
    T5 --> S3
    T6 --> S4
    T7 --> S5
    T8 --> S6
    T9 --> S7
    T10 --> S8

    style TRIGGERS fill:#E3F2FD,stroke:#1565C0
    style SAVES fill:#FFF3E0,stroke:#E65100
```

### Fluxo Detalhado: context-loader Save

```mermaid
sequenceDiagram
    participant Agent as Agente Ativo
    participant CL as context-loader.js
    participant FS as FileSystem

    Agent->>CL: updateSessionState(agentId, command)
    CL->>FS: Le .aiox/session-state.json
    FS-->>CL: estado atual (ou vazio)

    CL->>CL: Atualiza lastActivity
    CL->>CL: Adiciona agente a agentSequence (max 20)
    CL->>CL: Adiciona comando a lastCommands (max 10)
    CL->>CL: Infere workflowState do comando

    CL->>FS: Escreve .aiox/session-state.json
    FS-->>CL: OK

    Note over Agent,FS: Inferencia de workflow:<br/>36 mapeamentos task→state<br/>Ex: validate-next-story →<br/>{workflow: story_development,<br/>state: validated}

    Agent->>CL: onTaskComplete(taskName, result)
    CL->>CL: Adiciona a taskHistory (max 20)
    CL->>CL: Atualiza workflowState
    CL->>FS: Escreve .aiox/session-state.json
```

---

## Fluxo de Session Lifecycle

### Ciclo Completo de uma Sessao

```mermaid
stateDiagram-v2
    [*] --> SessionStart: Claude Code abre

    state SessionStart {
        [*] --> LoadCLAUDE: Carrega CLAUDE.md (3 niveis)
        LoadCLAUDE --> LoadRules: Carrega rules/*.md
        LoadRules --> LoadMemory: Carrega MEMORY.md (200 linhas)
        LoadMemory --> Ready: System prompt montado
    }

    SessionStart --> AgentActivation: Usuario ativa @agente

    state AgentActivation {
        [*] --> Tier1: AgentConfig (80ms)
        Tier1 --> Tier2: PermissionMode + Git (120ms)
        Tier2 --> Tier3: SessionContext + ProjectStatus (180ms)
        Tier3 --> Greeting: GreetingBuilder monta saudacao
    }

    AgentActivation --> Working: Agente pronto

    state Working {
        [*] --> ExecuteTask
        ExecuteTask --> SaveSessionState: Atualiza session-state.json
        ExecuteTask --> TrackError: Se erro ocorre
        TrackError --> CheckRepeat: error-tracking.json
        CheckRepeat --> AutoGotcha: 3x mesmo erro
        ExecuteTask --> SavePhase: Se phase muda
        SavePhase --> UpdateYAML: .session-state.yaml
        ExecuteTask --> ClaudeMemory: Claude decide salvar
        ClaudeMemory --> WriteMEMORY: MEMORY.md atualizado
    }

    Working --> SessionEnd: Usuario fecha terminal

    state SessionEnd {
        [*] --> SaveTranscript: .jsonl salvo automaticamente
        SaveTranscript --> Nothing: NADA mais acontece
        Nothing --> NoDigest: Sem session-digest
        NoDigest --> NoFlush: Sem memory-flush
    }

    SessionEnd --> [*]

    note right of SessionEnd
        GAP CRITICO:
        Nao ha sumarizacao
        automatica ao fim
        da sessao.
    end note
```

### Crash Detection & Recovery

```mermaid
flowchart TD
    START([Agente Ativado]) --> LOAD["SessionState.loadSessionState()"]
    LOAD --> CHECK{"Estado existente<br/>em .session-state.yaml?"}

    CHECK -->|"Nao"| FRESH["Sessao nova<br/>Sem recovery necessario"]
    CHECK -->|"Sim"| DETECT["SessionState.detectCrash()"]

    DETECT --> THRESHOLD{"Ultima atividade<br/>> 30 minutos atras?"}
    THRESHOLD -->|"Nao"| NORMAL["Sessao normal<br/>Continua de onde parou"]
    THRESHOLD -->|"Sim"| LAST_ACTION{"Ultima acao foi<br/>PAUSE, COMPLETED,<br/>ou ABORT?"}

    LAST_ACTION -->|"Sim"| NORMAL_END["Encerramento normal<br/>Nao e crash"]
    LAST_ACTION -->|"Nao"| CRASH["CRASH DETECTADO"]

    CRASH --> RESUME_MENU["Mostra opcoes de resume"]

    subgraph RESUME_OPTIONS["Opcoes de Recovery"]
        OPT1["CONTINUE<br/>Retoma do ultimo estado"]
        OPT2["REVIEW<br/>Mostra sumario de progresso"]
        OPT3["RESTART<br/>Reinicia story atual"]
        OPT4["DISCARD<br/>Descarta sessao"]
    end

    RESUME_MENU --> RESUME_OPTIONS

    style CRASH fill:#FFCDD2,stroke:#C62828
    style RESUME_OPTIONS fill:#E8F5E9,stroke:#2E7D32
```

---

## Gotchas Memory - Auto-Capture Flow

```mermaid
flowchart TD
    subgraph ERROR_FLOW["Fluxo de Auto-Capture"]
        ERR([Erro Ocorre]) --> TRACK["gotchasMemory.trackError()"]
        TRACK --> READ_ET["Le .aiox/error-tracking.json"]
        READ_ET --> NORMALIZE["Normaliza mensagem do erro"]
        NORMALIZE --> HASH["Gera hash da mensagem"]
        HASH --> INCREMENT["Incrementa contador"]
        INCREMENT --> CHECK{"Contador >= 3?<br/>(repeatThreshold)"}

        CHECK -->|"Nao"| SAVE_ET["Salva error-tracking.json<br/>Aguarda proxima ocorrencia"]
        CHECK -->|"Sim"| WINDOW{"Dentro da janela<br/>de 24 horas?"}

        WINDOW -->|"Nao"| RESET["Reset contador<br/>Recomeça contagem"]
        WINDOW -->|"Sim"| AUTO_CAPTURE["_autoCaptureGotcha()"]

        AUTO_CAPTURE --> CREATE["Cria gotcha com:<br/>- id: gotcha-{hash}<br/>- source: auto_detected<br/>- category: inferida<br/>- severity: inferida"]

        CREATE --> SAVE_JSON["Salva .aiox/gotchas.json"]
        SAVE_JSON --> SAVE_MD["Gera .aiox/gotchas.md"]
        SAVE_MD --> EMIT["Emite evento 'gotchaAdded'"]
    end

    subgraph MANUAL_FLOW["Fluxo Manual"]
        CMD(["*gotcha {desc}"]) --> ADD["gotchasMemory.addGotcha()"]
        ADD --> CREATE
    end

    subgraph INJECTION_FLOW["Fluxo de Injecao em Tasks"]
        TASK([Task Inicia]) --> QUERY["getContextForTask(taskDesc, files)"]
        QUERY --> MATCH["Filtra gotchas por:<br/>- keywords do taskDesc<br/>- arquivos relacionados<br/>- categoria relevante"]
        MATCH --> FORMAT["formatForPrompt(gotchas)"]
        FORMAT --> INJECT["Injeta no contexto<br/>da task como aviso"]
    end

    style ERROR_FLOW fill:#FFF9C4,stroke:#F9A825
    style MANUAL_FLOW fill:#E8F5E9,stroke:#2E7D32
    style INJECTION_FLOW fill:#E3F2FD,stroke:#1565C0
```

### Formato de Storage — gotchas.json

```mermaid
classDiagram
    class GotchasStore {
        +string schema = "aiox-gotchas-memory-v1"
        +string version = "1.0.0"
        +string projectId
        +string lastUpdated
        +Statistics statistics
        +Gotcha[] gotchas
    }

    class Gotcha {
        +string id
        +string title
        +string description
        +GotchaCategory category
        +Severity severity
        +string workaround
        +string[] relatedFiles
        +Trigger trigger
        +Source source
        +boolean resolved
    }

    class Trigger {
        +string errorPattern
    }

    class Source {
        +string type : manual | auto_detected
        +number occurrences
        +string firstSeen
        +string lastSeen
    }

    GotchasStore --> Gotcha
    Gotcha --> Trigger
    Gotcha --> Source
```

---

## Context Snapshot & Recovery

```mermaid
flowchart TD
    subgraph CAPTURE["Capture — context-snapshot.js"]
        C1(["snapshot.capture(context)"]) --> C2["Gera ID unico (crypto)"]
        C2 --> C3["Captura estado git:<br/>branch, commit, dirty files"]
        C3 --> C4["Registra:<br/>storyId, agent, subtask,<br/>working directory"]
        C4 --> C5["Salva .aiox/snapshots/{id}.json"]
        C5 --> C6{"autoCleanup?"}
        C6 -->|"Sim"| C7["Remove snapshots:<br/>- > 50 existentes<br/>- > 7 dias de idade"]
    end

    subgraph RESTORE["Restore — Recuperacao"]
        R1(["snapshot.restore(id)"]) --> R2["Le .aiox/snapshots/{id}.json"]
        R2 --> R3["Retorna contexto completo"]
        R3 --> R4["Agente pode retomar<br/>de onde parou"]
    end

    subgraph LIST["List — Consulta"]
        L1(["snapshot.list()"]) --> L2["Lista todos em .aiox/snapshots/"]
        L2 --> L3["Ordena por timestamp"]
        L3 --> L4["Retorna array de metadata"]
    end

    style CAPTURE fill:#E3F2FD,stroke:#1565C0
    style RESTORE fill:#E8F5E9,stroke:#2E7D32
    style LIST fill:#FFF9C4,stroke:#F9A825
```

---

## Timeline Manager - Unified Facade

```mermaid
flowchart TD
    subgraph SOURCES["Fontes de Dados"]
        SRC1["FileEvolutionTracker<br/>.aiox/file-evolution/"]
        SRC2["ContextSnapshot<br/>.aiox/snapshots/"]
        SRC3["BuildStateManager<br/>(opcional)"]
        SRC4["Eventos manuais"]
    end

    subgraph TIMELINE["timeline-manager.js"]
        TM1["getUnifiedTimeline()"]
        TM2["Coleta eventos de todas as fontes"]
        TM3["Normaliza formato"]
        TM4["Ordena cronologicamente"]
        TM5["Aplica limites:<br/>max 5000 entradas<br/>max 90 dias"]
        TM6["autoSync (60s interval)"]
    end

    subgraph STORAGE["Storage"]
        ST1[(".aiox/timeline/<br/>unified-timeline.json")]
    end

    SRC1 --> TM2
    SRC2 --> TM2
    SRC3 --> TM2
    SRC4 --> TM2
    TM1 --> TM2
    TM2 --> TM3
    TM3 --> TM4
    TM4 --> TM5
    TM5 --> ST1
    TM6 -->|"periodico"| TM2

    style SOURCES fill:#E3F2FD,stroke:#1565C0
    style TIMELINE fill:#F3E5F5,stroke:#7B1FA2
    style STORAGE fill:#FCE4EC,stroke:#C62828
```

---

## Hooks System - Cross-CLI Abstraction

### EVENT_MAPPING — Mapeamento de Eventos entre CLIs

```mermaid
flowchart LR
    subgraph AIOX_EVENTS["Eventos AIOX"]
        E1["sessionStart"]
        E2["beforeAgent"]
        E3["beforeTool"]
        E4["afterTool"]
        E5["sessionEnd"]
    end

    subgraph CLAUDE_EVENTS["Claude Code Events"]
        CE1["null — SEM EQUIVALENTE"]
        CE2["PreToolUse"]
        CE3["PreToolUse"]
        CE4["PostToolUse"]
        CE5["Stop"]
    end

    subgraph GEMINI_EVENTS["Gemini CLI Events"]
        GE1["SessionStart"]
        GE2["BeforeAgent"]
        GE3["BeforeTool"]
        GE4["AfterTool"]
        GE5["SessionEnd"]
    end

    E1 -->|"claude: null"| CE1
    E1 -->|"gemini"| GE1
    E2 --> CE2
    E2 --> GE2
    E3 --> CE3
    E3 --> GE3
    E4 --> CE4
    E4 --> GE4
    E5 -->|"claude: Stop"| CE5
    E5 --> GE5

    style CE1 fill:#FFCDD2,stroke:#C62828
    style CE5 fill:#FFF9C4,stroke:#F9A825
```

### Status dos Hooks por CLI

| Hook | Arquivo | Gemini | Claude Code | Status |
|------|---------|--------|-------------|--------|
| `session-start` | `hooks/gemini/session-start.js` | `SessionStart` | `null` (sem evento) | **Gemini only** |
| `session-end` | `hooks/gemini/session-end.js` | `SessionEnd` | `Stop` (mapeado mas nao wired) | **Gemini only** |
| `before-agent` | `hooks/gemini/before-agent.js` | `BeforeAgent` | `PreToolUse` | Ambos |
| `before-tool` | `hooks/gemini/before-tool.js` | `BeforeTool` | `PreToolUse` | Ambos |
| `after-tool` | `hooks/gemini/after-tool.js` | `AfterTool` | `PostToolUse` | Ambos |

### Gap Critico: session-start no Claude Code

```mermaid
flowchart TD
    Q{"sessionStart no<br/>Claude Code?"} -->|"NAO — claude: null"| GAP["NAO EXISTE evento<br/>nativo no Claude Code<br/>para session start"]
    GAP --> WORKAROUND["Workaround atual:<br/>Pipeline de ativacao substitui<br/>parcialmente via Tier 3<br/>(SessionContextLoader)"]

    Q2{"sessionEnd no<br/>Claude Code?"} -->|"Mapeado para Stop"| STOP["Stop event existe<br/>mas hook NAO esta<br/>configurado no<br/>.claude/settings.json"]
    STOP --> NOT_WIRED["session-end.js nunca<br/>executa no Claude Code"]

    style GAP fill:#FFCDD2,stroke:#C62828
    style NOT_WIRED fill:#FFCDD2,stroke:#C62828
```

---

## Mapa Completo de Arquivos

### Scripts do Sistema de Memoria

| Arquivo | Modulo | Story/Epic | Funcao |
|---------|--------|------------|--------|
| `.aiox-core/core/memory/gotchas-memory.js` | Memory | Epic 9, Story 9.4 | Auto-capture de erros repetidos, gotchas manuais, injecao em tasks |
| `.aiox-core/core/memory/context-snapshot.js` | Memory | Story 12.6 | Captura e restaura contexto de desenvolvimento |
| `.aiox-core/core/memory/file-evolution-tracker.js` | Memory | Gap impl | Rastreia evolucao de arquivos, detecta drift |
| `.aiox-core/core/memory/timeline-manager.js` | Memory | Gap impl | Facade unificada para timeline cross-session |
| `.aiox-core/core/session/context-loader.js` | Session | Story 2.2, 6.1.2.5 | Continuidade inter-agente, handoff de contexto |
| `.aiox-core/core/session/context-detector.js` | Session | Story 2.2 | Deteccao hibrida de tipo de sessao (new/existing/workflow) |
| `.aiox-core/core/orchestration/session-state.js` | Orchestration | Story 11.5 | Estado persistente de epic/story, crash recovery |
| `.aiox-core/core/orchestration/context-manager.js` | Orchestration | Legacy | Estado de workflow entre fases (migrado para session-state) |
| `.aiox-core/core/elicitation/session-manager.js` | Elicitation | — | Sessions de elicitacao save/load |

### Scripts de Ativacao (consomem memoria)

| Arquivo | Funcao |
|---------|--------|
| `.aiox-core/development/scripts/unified-activation-pipeline.js` | Orchestrador principal — carrega sessao no Tier 3 |
| `.aiox-core/development/scripts/greeting-builder.js` | Monta greeting com contexto de sessao/memoria |

### Hooks (persistencia de sessao)

| Arquivo | CLI | Funcao |
|---------|-----|--------|
| `.aiox-core/hooks/gemini/session-start.js` | Gemini | Carrega contexto AIOX no inicio da sessao |
| `.aiox-core/hooks/gemini/session-end.js` | Gemini | Persiste sumario da sessao em `.aiox/sessions/` |
| `.aiox-core/hooks/gemini/before-agent.js` | Gemini | Pre-processamento antes de agente |
| `.aiox-core/hooks/gemini/before-tool.js` | Ambos | Pre-processamento antes de tool |
| `.aiox-core/hooks/gemini/after-tool.js` | Ambos | Pos-processamento apos tool |
| `.aiox-core/hooks/unified/hook-interface.js` | Ambos | Classe base UnifiedHook + EVENT_MAPPING |
| `.aiox-core/hooks/unified/hook-registry.js` | Ambos | Registro central de hooks |
| `.aiox-core/hooks/unified/index.js` | Ambos | Entry point do sistema unificado |

### Arquivos Claude Code (memoria nativa)

| Arquivo | Funcao |
|---------|--------|
| `~/.claude/CLAUDE.md` | Instrucoes globais (carregado sempre) |
| `Workspaces/.claude/CLAUDE.md` | Instrucoes workspace (carregado sempre) |
| `aiox-core/.claude/CLAUDE.md` | Instrucoes projeto (carregado sempre) |
| `aiox-core/.claude/rules/*.md` | 5 arquivos de regras (carregados sempre) |
| `~/.claude/projects/.../memory/MEMORY.md` | Auto memory (primeiras 200 linhas, carregado sempre) |
| `~/.claude/projects/.../memory/compound-analysis/*.md` | 9 arquivos de analise sintetizada (referenciados do MEMORY.md) |
| `.claude/agent-memory/{agent}/MEMORY.md` | Memoria por agente de squad (6 agentes) |
| `~/.claude/settings.json` | Config: language, thinking, plugins |

---

## Mapa de Storage Persistente

```
.aiox/                                        # Runtime state (gitignored)
├── session-state.json                        # [context-loader] Sessao inter-agente (TTL: 1h)
├── gotchas.json                              # [gotchas-memory] Gotchas estruturadas
├── gotchas.md                                # [gotchas-memory] Gotchas legivel
├── error-tracking.json                       # [gotchas-memory] Tracking para auto-capture
├── snapshots/                                # [context-snapshot] Max 50, 7 dias
│   └── {id}.json                             #   Snapshot individual
├── timeline/                                 # [timeline-manager]
│   └── unified-timeline.json                 #   Timeline unificada (max 5000, 90 dias)
├── file-evolution/                           # [file-evolution-tracker]
│   └── evolution-index.json                  #   Indice de evolucao (max 1000, 30 dias)
├── sessions/                                 # [hooks/gemini/session-end] Gemini only
│   └── {sessionId}.json                      #   Sumario de sessao
├── workflow-state/                           # [context-manager] LEGACY → migrado para session-state
├── cache/                                    # Cache de sumarios
├── project-status.yaml                       # Status do projeto
└── codebase-map.json                         # Mapa do codebase

docs/stories/
└── .session-state.yaml                       # [session-state] Epic-level persistente (sem TTL)

~/.claude/projects/.../
├── memory/
│   ├── MEMORY.md                             # [Claude Code] Auto memory (200 linhas no prompt)
│   └── compound-analysis/                    # [Externo] 9 arquivos sintetizados
│       ├── 00-manifest.json
│       ├── 01-learnings.md
│       ├── 02-frameworks.md
│       ├── 03-workflows.md
│       ├── 04-dos-and-donts.md
│       ├── 05-agent-patterns.md
│       ├── 06-heuristics.md
│       ├── 07-warnings.md
│       ├── 08-user-behavior.md
│       ├── 09-discrepancies.md
│       └── COMPOUND-SUMMARY.md
├── sessions-index.json                       # [Claude Code] Indice de sessoes
└── {session-id}.jsonl                        # [Claude Code] Transcricao completa

.claude/agent-memory/                         # [Claude Code Agents] Memoria por agente
├── aiox-architect/MEMORY.md
├── aiox-dev/MEMORY.md
├── oalanicolas/MEMORY.md
├── pedro-valerio/MEMORY.md
├── sop-extractor/MEMORY.md
└── squad/MEMORY.md
```

---

## Gaps e Limitacoes Conhecidas

### Gap 1: Sem Session-Digest no Claude Code

```
IMPACTO: HIGH
```

Quando uma sessao fecha, o conhecimento contextual e **perdido** exceto:
- O que o Claude escreveu no MEMORY.md **durante** a sessao
- A transcricao bruta em `.jsonl` (nao sumarizada)

**Mitigacao possivel:** Wiring do `session-end.js` via evento `Stop` do Claude Code + configuracao em `.claude/settings.json`.

### Gap 2: Sem Memory-Flush Automatico

```
IMPACTO: HIGH
```

Os modulos AIOX (gotchas, snapshots, timeline) **nao fazem flush** automatico ao final da sessao. Dados em memoria podem se perder se o processo terminar abruptamente.

### Gap 3: Hooks Gemini Nao Portados

```
IMPACTO: MEDIUM
```

`session-start.js` mapeia para `null` no Claude Code (sem evento nativo). `session-end.js` mapeia para `Stop` mas **nao esta configurado**.

### Gap 4: Duas Camadas Desconectadas

```
IMPACTO: MEDIUM
```

Claude auto-memory (`MEMORY.md`) e AIOX memory (`.aiox/`) nunca se sincronizam. Gotchas capturadas pelo AIOX nao aparecem no MEMORY.md e vice-versa.

### Gap 5: compound-analysis Estatico

```
IMPACTO: LOW
```

Os 9 arquivos em `memory/compound-analysis/` foram gerados por ferramenta externa e nao sao atualizados automaticamente.

---

## Referencias

| Recurso | Caminho |
|---------|---------|
| Activation Pipeline Guide | `docs/guides/agents/traces/00-shared-activation-pipeline.md` |
| Gotchas Memory Script | `.aiox-core/core/memory/gotchas-memory.js` |
| Context Snapshot Script | `.aiox-core/core/memory/context-snapshot.js` |
| File Evolution Tracker | `.aiox-core/core/memory/file-evolution-tracker.js` |
| Timeline Manager | `.aiox-core/core/memory/timeline-manager.js` |
| Session Context Loader | `.aiox-core/core/session/context-loader.js` |
| Context Detector | `.aiox-core/core/session/context-detector.js` |
| Session State | `.aiox-core/core/orchestration/session-state.js` |
| Unified Hook Interface | `.aiox-core/hooks/unified/hook-interface.js` |
| Hook Registry | `.aiox-core/hooks/unified/hook-registry.js` |
| Gemini Session Start | `.aiox-core/hooks/gemini/session-start.js` |
| Gemini Session End | `.aiox-core/hooks/gemini/session-end.js` |
| Core Config | `.aiox-core/core-config.yaml` |
| Claude Settings | `~/.claude/settings.json` |
| Story Development Cycle | `docs/guides/workflows/STORY-DEVELOPMENT-CYCLE-WORKFLOW.md` |

---

*AIOX Memory System Architecture Guide v1.0*
*Traced from source code, not documentation.*
*@architect (Aria) — arquitetando o futuro*
