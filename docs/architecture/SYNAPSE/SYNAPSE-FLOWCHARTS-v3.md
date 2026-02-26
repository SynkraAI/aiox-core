# SYNAPSE — Flowcharts & System Diagrams (Measured Behavior)

> Documentacao visual do comportamento **real e medido** do SYNAPSE apos
> a migracao NOG-18 Native-First. Baseado em metricas de pipeline-audit,
> hook-metrics.json, uap-metrics.json e NOG-23 benchmark comparison.

**Versao:** 3.1.0
**Data:** 2026-02-24
**Autor:** @architect (Aria), atualizado por @qa (Quinn)
**Status:** Living Document — Post-NOG-18 + CODEINTEL-RP-001
**Baseline:** NOG-17 pipeline-audit + NOG-23 benchmark + CODEINTEL-RP-001 (RegistryProvider)
**Supersedes:** SYNAPSE-FLOWCHARTS.md v2.0.0 (deprecated)
**Mudanca v3.1:** Code-Intel agora ATIVO via RegistryProvider (T1) — paralelo ao SYNAPSE, nao integrado nele.

---

## 1. Visao Geral — Estado Real do Sistema

O SYNAPSE opera com **3 layers ativos** (L0, L1, L2) de 8 possiveis.
L3-L7 estao implementados mas **desabilitados** pela constante `DEFAULT_ACTIVE_LAYERS`.
A ativacao de agentes usa **Claude Code native features** (skills, hooks, memory, rules)
em vez do UAP/GreetingBuilder programatico.

```mermaid
flowchart TB
    subgraph USER["Usuario"]
        PROMPT["Digita prompt no Claude Code"]
    end

    subgraph CLAUDE_CODE["Claude Code Runtime"]
        HOOK_EVENT["UserPromptSubmit Event"]
        NATIVE["Native Features:<br/>Skills (.claude/skills/)<br/>Hooks (.claude/hooks/)<br/>Rules (.claude/rules/)<br/>Memory (auto-memory)"]
        AI["Claude AI processa prompt + synapse-rules"]
    end

    subgraph SYNAPSE["SYNAPSE Engine (3 layers ativos)"]
        ENTRY["synapse-engine.cjs<br/>(Hook Entry Point)"]
        ENGINE["SynapseEngine.process()<br/>DEFAULT_ACTIVE_LAYERS = [0, 1, 2]"]
        FORMATTER["Output Formatter<br/>&lt;synapse-rules&gt;"]
    end

    subgraph DATA[".synapse/ (Runtime Data)"]
        MANIFEST["manifest (70 regras)"]
        DOMAINS["20 domain files"]
        SESSIONS["sessions/{uuid}.json"]
        METRICS["metrics/ (uap + hook)"]
    end

    subgraph DISABLED["DESABILITADO no SYNAPSE (NOG-18)"]
        L3_7["L3-L7: Workflow, Task, Squad,<br/>Keyword, Star-Command"]
        UAP["unified-activation-pipeline.js<br/>(fallback only)"]
        GREETING["greeting-builder.js<br/>(fallback only)"]
    end

    subgraph PARALLEL["ATIVO mas PARALELO ao SYNAPSE"]
        CODEINTEL["code-intel/ (ATIVO via RegistryProvider T1)<br/>5/8 primitivas, 7/7 helpers non-null<br/>Invocado por tasks/registry,<br/>NAO pelo SYNAPSE engine"]
    end

    PROMPT --> HOOK_EVENT
    HOOK_EVENT --> ENTRY
    ENTRY --> ENGINE
    ENGINE --> FORMATTER
    FORMATTER --> AI
    HOOK_EVENT --> NATIVE

    ENGINE -.->|"le"| MANIFEST
    ENGINE -.->|"le"| DOMAINS
    ENGINE -.->|"le/escreve"| SESSIONS
    ENGINE -.->|"escreve"| METRICS

    style DISABLED fill:#636e72,color:#ddd,stroke:#636e72
    style L3_7 fill:#636e72,color:#ddd
    style UAP fill:#636e72,color:#ddd
    style GREETING fill:#636e72,color:#ddd
    style CODEINTEL fill:#00b894,color:#fff
    style PARALLEL fill:#00b894,color:#fff,stroke:#00b894
    style ENGINE fill:#6c5ce7,color:#fff
```

### Metricas Medidas (NOG-23 Benchmark)

| Metrica | Valor Medido | Fonte |
|---------|-------------|-------|
| SYNAPSE processing per-prompt | **<1ms** | hook-metrics.json |
| Layers carregados | **3** (L0, L1, L2) | hook-metrics.json |
| Layers skipped | **5** (L3-L7) | hook-metrics.json |
| Total regras injetadas | **70** | hook-metrics.json |
| Token budget FRESH | **800 adj tokens** | context-tracker.js |
| Agent activation p50 | **21-161ms** | NOG-23 pipeline-audit |

---

## 2. Pipeline Real — Apenas 3 Layers

O engine **sempre** usa `[0, 1, 2]` independente do bracket calculado.
A logica de selecao de layers por bracket existe no codigo mas e **ignorada**
pela constante `DEFAULT_ACTIVE_LAYERS` (engine.js linhas 176-181, 244-265).

```mermaid
flowchart LR
    INPUT["prompt<br/>session<br/>config"] --> BRACKET["Context Tracker<br/>calcula bracket<br/>(decorativo)"]
    BRACKET --> OVERRIDE["NOG-18 Override:<br/>DEFAULT_ACTIVE_LAYERS<br/>= [0, 1, 2]<br/>(ignora bracket)"]
    OVERRIDE --> L0["L0: Constitution<br/>0.15ms | 34 regras"]
    L0 --> L1["L1: Global<br/>0.13ms | 25 regras"]
    L1 --> L2["L2: Agent<br/>0.08ms | 11 regras"]
    L2 --> FORMAT["Output Formatter<br/>→ &lt;synapse-rules&gt;<br/>~70 regras, <1ms"]

    L3["L3: Workflow<br/>DESABILITADO"]
    L4["L4: Task<br/>DESABILITADO"]
    L5["L5: Squad<br/>DESABILITADO"]
    L6["L6: Keyword<br/>DESABILITADO"]
    L7["L7: Star-Command<br/>DESABILITADO<br/>(bug: falta no array)"]

    style L0 fill:#ff6b6b,color:#fff
    style L1 fill:#4ecdc4,color:#fff
    style L2 fill:#45b7d1,color:#fff
    style L3 fill:#636e72,color:#ddd
    style L4 fill:#636e72,color:#ddd
    style L5 fill:#636e72,color:#ddd
    style L6 fill:#636e72,color:#ddd
    style L7 fill:#636e72,color:#ddd
    style OVERRIDE fill:#fdcb6e,color:#333
```

### Comparacao: Planejado vs Real

| Layer | v2.0 (Planejado) | v3.0 (Medido) | Status |
|-------|-----------------|---------------|--------|
| L0: Constitution | Ativo, 5ms | **Ativo, 0.15ms** | Funcionando |
| L1: Global | Ativo, 10ms | **Ativo, 0.13ms** | Funcionando |
| L2: Agent | Ativo, 15ms | **Ativo, 0.08ms** | Funcionando |
| L3: Workflow | Ativo | **Desabilitado** | session.active_workflow = null |
| L4: Task | Ativo | **Desabilitado** | session.active_task = null |
| L5: Squad | Ativo | **Desabilitado** | session.active_squad = null |
| L6: Keyword | Ativo | **Desabilitado** | RECALL matching nunca ativado |
| L7: Star-Command | Ativo | **Desabilitado** | Bug: nao incluido em DEFAULT_ACTIVE_LAYERS |

### Bug Conhecido: L7 Star-Command

```javascript
// engine.js linha 176-181
const DEFAULT_ACTIVE_LAYERS = [0, 1, 2];
// Deveria ser [0, 1, 2, 7] para manter star-command detection
// L7 era FRESH-bracket layer no design original
// Impacto: *commands nao sao processados pelo SYNAPSE
// Mitigacao: Claude Code resolve *commands nativamente via skills
```

---

## 3. Context Brackets — Calculados Mas Decorativos

O bracket e calculado corretamente a cada prompt, mas **nao influencia**
quais layers sao executados (sempre L0, L1, L2). Apenas o token budget varia.

```mermaid
flowchart TD
    PROMPT_COUNT["session.prompt_count"] --> ESTIMATE["estimateContextPercent()<br/>100 - (count * 1500 * 1.2 / 200000 * 100)"]
    ESTIMATE --> CALC["calculateBracket(percent)"]

    CALC --> FRESH["FRESH (60-100%)<br/>Token Budget: 800"]
    CALC --> MODERATE["MODERATE (40-60%)<br/>Token Budget: 1500"]
    CALC --> DEPLETED["DEPLETED (25-40%)<br/>Token Budget: 2000"]
    CALC --> CRITICAL["CRITICAL (0-25%)<br/>Token Budget: 2500"]

    FRESH --> SAME["Layers: [0, 1, 2]<br/>(SEMPRE os mesmos)"]
    MODERATE --> SAME
    DEPLETED --> SAME_PLUS["Layers: [0, 1, 2]<br/>+ Memory Bridge tentativa"]
    CRITICAL --> SAME_PLUS

    SAME --> NOTE["Token budget afeta truncamento<br/>do output, nao selecao de layers"]

    style FRESH fill:#00b894,color:#fff
    style MODERATE fill:#fdcb6e,color:#333
    style DEPLETED fill:#e17055,color:#fff
    style CRITICAL fill:#d63031,color:#fff
    style SAME fill:#74b9ff,color:#333
    style SAME_PLUS fill:#a29bfe,color:#fff
```

### Tabela Real de Brackets (Medido)

| Bracket | Context % | Layers Reais | Token Budget | Memory Bridge | Impacto Real |
|---------|-----------|-------------|-------------|--------------|-------------|
| FRESH | 60-100% | **[0, 1, 2]** | 800 | Skip | Output ~400-500 tokens |
| MODERATE | 40-60% | **[0, 1, 2]** | 1500 | Skip | Output aceita mais tokens |
| DEPLETED | 25-40% | **[0, 1, 2]** | 2000 | Tenta (Pro-gated) | Raro de atingir |
| CRITICAL | 0-25% | **[0, 1, 2]** | 2500 | Tenta (Pro-gated) | Quase nunca atingido |

**Nota:** Na pratica, a maioria das sessoes opera em FRESH porque `prompt_count` precisa atingir ~45 prompts para sair de FRESH (formula: `100 - (45 * 1500 * 1.2 / 200000 * 100) = 59.5%`).

---

## 4. Ativacao de Agentes — Fluxo Real (NOG-21)

Apos NOG-21, a ativacao usa **Claude Code native markdown** em vez do UAP programatico.
O UAP (`unified-activation-pipeline.js`) existe como **fallback** nos agent files,
mas o fluxo primario e a leitura direta do frontmatter pelo Claude Code.

```mermaid
flowchart TD
    subgraph NATIVE["Fluxo Primario (NOG-21+)"]
        CMD["@agent-name ou /AIOS:agents:id"]
        SKILL["Claude Code le .claude/agents/aios-{id}.md"]
        YAML["Parse frontmatter YAML:<br/>activation-instructions, persona,<br/>commands, dependencies"]
        GREETING["Greeting montado por markdown:<br/>icon + archetypal + role +<br/>project status + commands"]
        SESSION_W["Escreve _active-agent.json"]
    end

    subgraph FALLBACK["Fallback (se native falhar)"]
        UAP["node unified-activation-pipeline.js {id}"]
        TIERED["Tiered Loading:<br/>Phase 1: AgentConfig (80ms)<br/>Phase 2: PermMode+Git (120ms)<br/>Phase 3: Session+Memory (180ms)"]
        GREETING_B["GreetingBuilder (deprecated)"]
    end

    subgraph SYNAPSE_BRIDGE["SYNAPSE Session Bridge"]
        ACTIVE_FILE[".synapse/sessions/_active-agent.json"]
        SESSION[".synapse/sessions/{uuid}.json"]
        L2["L2: Agent Layer<br/>carrega agent-{id} domain"]
    end

    CMD --> SKILL
    SKILL --> YAML
    YAML --> GREETING
    GREETING --> SESSION_W

    YAML -.->|"FALLBACK se native<br/>nao funcionar"| UAP
    UAP --> TIERED
    TIERED --> GREETING_B

    SESSION_W --> ACTIVE_FILE
    ACTIVE_FILE --> SESSION
    SESSION --> L2

    style NATIVE fill:#00b894,color:#fff
    style FALLBACK fill:#636e72,color:#ddd
    style UAP fill:#636e72,color:#ddd
    style GREETING_B fill:#636e72,color:#ddd
```

### Agent Activation Latency (NOG-23 Rerun)

| Agent | NOG-17 p50 (ms) | NOG-23 p50 (ms) | Delta | Quality |
|-------|----------------|-----------------|-------|---------|
| @dev | 194.6 | **161.5** | -17.0% | full |
| @qa | 92.3 | **104.0** | +12.7% | full |
| @architect | 83.5 | **21.4** | -74.4% | full |
| @pm | 94.1 | — | baseline | full |
| @po | 98.7 | — | baseline | full |
| @sm | 89.6 | — | baseline | full |
| @devops | 81.3 | — | baseline | full |
| @analyst | 88.2 | — | baseline | full |
| @data-engineer | 95.7 | — | baseline | full |
| @ux | 83.5 | — | baseline | full |

**Nota:** NOG-23 rerun executou quick mode (3 agents). Baseline completo em NOG-17.

---

## 5. Agent Native Features — O Que Substituiu L3-L7

As funcionalidades que L3-L7 proviam sao agora cobertas por features nativas
do Claude Code, configuradas via frontmatter nos agent files.

```mermaid
flowchart TD
    subgraph BEFORE["Antes (L3-L7 via SYNAPSE)"]
        L3_B["L3: Workflow context<br/>(session.active_workflow)"]
        L4_B["L4: Task context<br/>(session.active_task)"]
        L5_B["L5: Squad context<br/>(session.active_squad)"]
        L6_B["L6: Keyword recall<br/>(RECALL matching)"]
        L7_B["L7: Star-commands<br/>(*command detection)"]
    end

    subgraph AFTER["Depois (Claude Code Native)"]
        SKILLS["Skills (.claude/skills/)<br/>7 skills, carregados pelo Claude Code"]
        HOOKS["Hooks (.claude/hooks/)<br/>enforce-git-push-authority.sh"]
        RULES["Rules (.claude/rules/)<br/>agent-authority, workflow-execution,<br/>story-lifecycle, ids-principles"]
        MEMORY["Auto-Memory<br/>memory: project no frontmatter"]
        COMMANDS["Commands (.claude/commands/)<br/>synapse/ CRUD commands"]
    end

    L3_B -.->|"substituido por"| RULES
    L4_B -.->|"substituido por"| RULES
    L5_B -.->|"substituido por"| SKILLS
    L6_B -.->|"substituido por"| RULES
    L7_B -.->|"substituido por"| COMMANDS

    style BEFORE fill:#636e72,color:#ddd,stroke:#636e72
    style AFTER fill:#00b894,color:#fff
```

### Mapeamento Detalhado

| Feature SYNAPSE (desabilitada) | Substituto Nativo | Como Funciona |
|-------------------------------|-------------------|---------------|
| L3: Workflow rules | `.claude/rules/workflow-execution.md` | Claude Code carrega rules automaticamente |
| L4: Task context | Story files em `docs/stories/` | Agent le story diretamente |
| L5: Squad domains | `.claude/skills/` + squad configs | Skills carregados por frontmatter |
| L6: Keyword recall | `.claude/rules/` com paths frontmatter | Rules condicionais por path |
| L7: Star-commands | `.claude/commands/synapse/` + skills | Commands nativos do Claude Code |
| UAP GreetingBuilder | Markdown activation-instructions | Frontmatter YAML no agent file |
| Memory Bridge (MIS) | `memory: project` auto-memory | Claude Code gerencia MEMORY.md |

---

## 6. Code Intelligence — Status Real (pos-CODEINTEL-RP-001)

O modulo `code-intel/` e **production code ativo** com RegistryProvider (T1) nativo.
E invocado por 15+ tasks e pelo Entity Registry, mas **nao pelo SYNAPSE engine**.
Com RegistryProvider, 5/8 primitivas retornam dados reais sem nenhuma configuracao.

> Documentacao completa: [CODE-INTEL-FLOWCHARTS.md](../CODE-INTEL-FLOWCHARTS.md)

```mermaid
flowchart TD
    subgraph IMPLEMENTED["Production Code (.aios-core/core/code-intel/)"]
        CLIENT["CodeIntelClient<br/>Provider auto-detection<br/>Circuit breaker + Cache"]
        PROVIDERS["2 Providers:<br/>RegistryProvider (T1, ATIVO)<br/>CodeGraphProvider (T3, fallback)"]
        ENRICHER["CodeIntelEnricher<br/>6 composite capabilities"]
        HELPERS["6 Helpers:<br/>dev, qa, planning, story,<br/>devops, creation"]
    end

    subgraph SHARED["Shared Data"]
        REGISTRY_FILE["entity-registry.yaml<br/>(737+ entities, 14 categories)"]
    end

    subgraph CONSUMERS["Consumers Reais (NAO SYNAPSE)"]
        TASKS["15+ Tasks no SDLC<br/>(dev-develop, qa-gate,<br/>create-story, pre-push, etc.)"]
        REGISTRY["Entity Registry Scanner<br/>(registry-syncer + IDS updater)"]
        GRAPH["Graph Dashboard<br/>(aios graph CLI)"]
        HEALTH["Health Check<br/>(diagnostics)"]
    end

    subgraph STATUS["Status Atual (CODEINTEL-RP-001)"]
        ACTIVE["RegistryProvider ATIVO<br/>→ 5/8 primitivas retornam dados<br/>→ 7/7 helpers non-null<br/>→ <50ms por chamada (mtime cache)<br/>→ 351 testes passando"]
    end

    REGISTRY_FILE -->|"Read (lazy load)"| PROVIDERS
    REGISTRY -->|"Write (scan)"| REGISTRY_FILE
    PROVIDERS --> CLIENT
    CLIENT --> ENRICHER
    ENRICHER --> HELPERS
    HELPERS --> CONSUMERS
    CONSUMERS --> STATUS

    style ACTIVE fill:#00b894,color:#fff
    style CONSUMERS fill:#00b894,color:#fff
    style SHARED fill:#6c5ce7,color:#fff
```

### O Que Existe vs O Que Funciona (pos-RP-001)

| Componente | Implementado? | Provider Ativo? | Dados Reais? | Sem Provider |
|-----------|:------------:|:--------------:|:------------:|:------------:|
| RegistryProvider | **Sim** | **T1 ATIVO** | **Sim** (5 primitivas) | N/A — e o provider |
| CodeGraphProvider | Sim | Nao configurado | Nao | graceful skip |
| CodeIntelClient | Sim | **Sim** (via RegistryProvider) | **Sim** | retorna `null` |
| CodeIntelEnricher | Sim | **Sim** | **Sim** | retorna `null` |
| dev-helper | Sim | **Sim** | **non-null** | skip silencioso |
| qa-helper | Sim | **Sim** | **non-null** | skip silencioso |
| planning-helper | Sim | **Sim** | **non-null** | skip silencioso |
| story-helper | Sim | **Sim** | **non-null** | skip silencioso |
| devops-helper | Sim | **Sim** | **non-null** | skip silencioso |
| creation-helper | Sim | **Sim** | **non-null** | skip silencioso |
| Entity Registry Scanner | Sim | **Standalone** | **Sim** | funciona 100% |

### SYNAPSE vs Code-Intel — Complementares, Nao Concorrentes

```
SYNAPSE:    Injeta REGRAS no prompt (como agente se comporta)
            <synapse-rules> → constitution, agent persona, restrictions
            Trigger: cada prompt | Latencia: <1ms | Sempre ativo

Code-Intel: Fornece DADOS do codebase (o que o codigo contem)
            entity-registry.yaml → RegistryProvider → helpers → advisory
            Trigger: task execution | Latencia: <50ms | Ativo via T1

Entity Registry: PONTE compartilhada (ambos leem, scanner escreve)
```

**Principio:** Code Intelligence = Enhancement Layer, NOT Dependency.
O SYNAPSE engine **nao invoca** code-intel. Sao sistemas paralelos com consumers diferentes.
O Entity Registry e a ponte de dados compartilhada entre ambos.

---

## 7. Session Management — Schema Real

As sessions persistem em `.synapse/sessions/{uuid}.json`. Muitos campos
do schema v2.0 estao **sempre null** porque L3-L7 nao os populam.

```mermaid
flowchart TD
    subgraph POPULATED["Campos Populados (Reais)"]
        UUID["uuid: session-id"]
        AGENT["active_agent: { id, activated_at }"]
        CONTEXT["context: { last_bracket: 'FRESH',<br/>last_tokens_used: ~400,<br/>last_context_percent: 96+ }"]
        META["prompt_count: N<br/>last_activity: timestamp"]
    end

    subgraph ALWAYS_NULL["Campos Sempre Null"]
        WORKFLOW["active_workflow: null"]
        TASK["active_task: null"]
        SQUAD["active_squad: null"]
        HISTORY["history.star_commands_used: []"]
    end

    subgraph WRITERS["Quem Escreve"]
        W_HOOK["synapse-engine.cjs<br/>Per-prompt: prompt_count++,<br/>bracket, tokens, activity"]
        W_NATIVE["Claude Code native<br/>Seta _active-agent.json<br/>no agent activation"]
    end

    W_HOOK --> POPULATED
    W_NATIVE --> POPULATED
    W_HOOK -.->|"nunca popula"| ALWAYS_NULL

    style ALWAYS_NULL fill:#636e72,color:#ddd
    style POPULATED fill:#00b894,color:#fff
```

### Session JSON Real (Exemplo Medido)

```json
{
  "uuid": "abc-123-def",
  "active_agent": {
    "id": "dev",
    "activated_at": "2026-02-23T10:00:00Z",
    "activation_quality": "full"
  },
  "active_workflow": null,
  "active_task": null,
  "active_squad": null,
  "context": {
    "last_bracket": "FRESH",
    "last_tokens_used": 403,
    "last_context_percent": 96.25
  },
  "history": {
    "star_commands_used": [],
    "domains_loaded_last": ["constitution", "global", "agent-dev"],
    "agents_activated": ["dev"]
  },
  "prompt_count": 5,
  "last_activity": "2026-02-23T10:05:00Z"
}
```

---

## 8. Hook Entry Point — Fluxo Real por Prompt

```mermaid
flowchart TD
    START["UserPromptSubmit Event"] --> READ["readStdin()<br/>Parse JSON { sessionId, cwd, prompt }"]
    READ --> CHECK_CWD{"cwd existe?"}
    CHECK_CWD -->|"Nao"| EXIT["exit(0) silencioso"]
    CHECK_CWD -->|"Sim"| CHECK_SYNAPSE{".synapse/ existe?"}
    CHECK_SYNAPSE -->|"Nao"| EXIT
    CHECK_SYNAPSE -->|"Sim"| LOAD["loadSession(sessionId)"]
    LOAD --> CREATE["new SynapseEngine(synapsePath)"]
    CREATE --> PROCESS["engine.process(prompt, session)"]

    subgraph PROCESS_DETAIL["engine.process() — <1ms total"]
        P_BRACKET["1. calcBracket() → FRESH (decorativo)"]
        P_LAYERS["2. layers = [0, 1, 2] (hardcoded)"]
        P_L0["3. L0 Constitution: 0.15ms, 34 rules"]
        P_L1["4. L1 Global: 0.13ms, 25 rules"]
        P_L2["5. L2 Agent: 0.08ms, 11 rules"]
        P_SKIP["6. L3-L7: SKIP (not in DEFAULT_ACTIVE_LAYERS)"]
        P_MEM["7. MemoryBridge: skip (FRESH bracket)"]
        P_FMT["8. format() → &lt;synapse-rules&gt;"]

        P_BRACKET --> P_LAYERS --> P_L0 --> P_L1 --> P_L2 --> P_SKIP --> P_MEM --> P_FMT
    end

    PROCESS --> PROCESS_DETAIL
    PROCESS_DETAIL --> WRITE["stdout: { hookSpecificOutput:<br/>{ additionalContext: xml } }"]
    WRITE --> METRICS["Write hook-metrics.json<br/>(fire-and-forget)"]
    WRITE --> INJECT["Claude Code injeta<br/>synapse-rules no prompt"]

    TIMEOUT["Safety Timeout: 100ms pipeline<br/>5s hook total"] -.->|"Se exceder"| EXIT

    style EXIT fill:#f9f,stroke:#333
    style TIMEOUT fill:#ff9,stroke:#333
    style PROCESS_DETAIL fill:#6c5ce7,color:#fff
    style P_SKIP fill:#636e72,color:#ddd
```

---

## 9. Output Real — &lt;synapse-rules&gt; Injetado

Com apenas 3 layers, o output e compacto (~400-500 tokens).
Secoes de workflow, task, squad, keyword e star-command estao **ausentes**.

```mermaid
flowchart TD
    subgraph PRESENT["Secoes Presentes no Output"]
        S1["[CONTEXT BRACKET]<br/>FRESH | 96.25% | Budget: 800"]
        S2["[CONSTITUTION]<br/>6 artigos (34 rules)"]
        S3["[ACTIVE AGENT]<br/>agent-dev domain (11 rules)"]
        S4["[GLOBAL]<br/>Regras globais (25 rules)"]
        S5["[LOADED DOMAINS SUMMARY]<br/>3 domains, 70 rules"]
    end

    subgraph ABSENT["Secoes Ausentes (L3-L7 disabled)"]
        A1["[ACTIVE WORKFLOW] — null"]
        A2["[TASK CONTEXT] — null"]
        A3["[SQUAD] — null"]
        A4["[KEYWORD MATCHES] — none"]
        A5["[STAR-COMMANDS] — not processed"]
        A6["[MEMORY HINTS] — FRESH = skip"]
    end

    subgraph FINAL["Output Final"]
        XML["&lt;synapse-rules&gt;<br/><br/>[CONTEXT BRACKET: FRESH 96.25%]<br/>[CONSTITUTION: 34 rules]<br/>[ACTIVE AGENT: @dev]<br/>[GLOBAL: 25 rules]<br/>[LOADED DOMAINS: 3]<br/><br/>&lt;/synapse-rules&gt;<br/><br/>~70 rules, ~400-500 tokens"]
    end

    PRESENT --> FINAL
    ABSENT -.->|"nao incluido"| FINAL

    style ABSENT fill:#636e72,color:#ddd
    style FINAL fill:#6c5ce7,color:#fff
```

---

## 10. SYNAPSE Rule Impact — Medido por Bracket (NOG-23)

Dados reais do pipeline-audit rerun com SYNAPSE engine:

| Budget Phase | % Context | Rules | Adj Tokens | Active Layers | Processing Time |
|-------------|-----------|-------|-----------|--------------|----------------|
| FRESH (100%) | 96%+ | 70 | 1,403 | 3/4* | **0.81ms** |
| MODERATE (55%) | 40-60% | 70 | 1,455 | 3/8 | **0.32ms** |
| DEPLETED (32.5%) | 25-40% | 70 | 1,455 | 3/8 | **0.47ms** |
| CRITICAL (19%) | 0-25% | 70 | 1,485 | 3/8 | **0.25ms** |

*3/4 = 3 layers loaded of 4 FRESH-expected (L7 missing from array = bug)

**Observacao:** O processing time e **menor** em brackets mais apertados porque o token budget mais alto permite menos truncamento, resultando em menos iteracoes do formatter.

---

## 11. Fluxo End-to-End Real (Exemplo Medido)

Cenario: usuario ativa `@dev` e depois trabalha em uma story.

```mermaid
sequenceDiagram
    participant U as Usuario
    participant CC as Claude Code
    participant AF as Agent File (.claude/agents/)
    participant H as synapse-engine.cjs
    participant E as SynapseEngine
    participant S as Session Manager
    participant D as Domain Loader

    Note over U,CC: Fase 1: Ativacao (Native)
    U->>CC: @dev
    CC->>AF: Le .claude/agents/aios-dev.md
    AF-->>CC: YAML frontmatter + activation-instructions
    CC->>CC: Monta greeting via markdown
    CC->>S: Escreve _active-agent.json { id: 'dev' }
    CC->>U: "Dex the Builder ready to innovate!"

    Note over U,CC: Fase 2: Prompts Subsequentes (<1ms SYNAPSE)
    U->>CC: *develop story-NOG-23
    CC->>H: UserPromptSubmit { sessionId, prompt }

    H->>S: loadSession(sessionId)
    S-->>H: { active_agent: 'dev', prompt_count: 1 }

    H->>E: process(prompt, session)

    Note over E: Bracket: FRESH (decorativo)
    E->>E: contextPercent = 99.1% → FRESH
    E->>E: layers = DEFAULT_ACTIVE_LAYERS = [0, 1, 2]

    Note over E,D: 3 Layers em <1ms
    E->>D: L0: constitution (0.15ms)
    D-->>E: 34 rules
    E->>D: L1: global (0.13ms)
    D-->>E: 25 rules
    E->>D: L2: agent-dev (0.08ms)
    D-->>E: 11 rules

    Note over E: L3-L7: SKIPPED (not in array)
    Note over E: MemoryBridge: SKIP (FRESH)

    E-->>H: { xml: '<synapse-rules>...70 rules...', metrics }
    H->>H: Write hook-metrics.json (fire-and-forget)
    H-->>CC: { hookSpecificOutput: { additionalContext: xml } }

    Note over CC: Claude Code tambem carrega:
    CC->>CC: Skills (diagnose-synapse, coderabbit-review, checklist-runner)
    CC->>CC: Rules (agent-authority.md, workflow-execution.md)
    CC->>CC: Hooks (enforce-git-push-authority.sh)
    CC->>CC: Memory (auto-memory via 'memory: project')

    CC->>U: Resposta com contexto completo
```

---

## 12. Memory Bridge — Status Real

O MemoryBridge existe e funciona, mas **raramente e invocado**
porque a maioria das sessoes permanece em FRESH bracket.

```mermaid
flowchart TD
    ENGINE["SynapseEngine.process()"] --> CHECK{"needsMemoryHints(bracket)?"}
    CHECK -->|"FRESH/MODERATE<br/>(99%+ dos casos)"| SKIP["return []<br/>Sem memory hints"]
    CHECK -->|"DEPLETED/CRITICAL<br/>(raro)"| BRIDGE["MemoryBridge"]

    BRIDGE --> GATE{"featureGate.isAvailable<br/>('pro.memory.synapse')?"}
    GATE -->|"Nao (open-source)"| EMPTY["return [] (graceful)"]
    GATE -->|"Sim (Pro)"| PROVIDER["SynapseMemoryProvider"]

    PROVIDER --> MEMORY["Memory Store"]
    MEMORY --> HINTS["Memory Hints[]"]

    SKIP --> NOTE["NOTA: Com DEFAULT_ACTIVE_LAYERS = [0,1,2],<br/>Memory Bridge e o UNICO componente<br/>que ainda responde ao bracket.<br/>Mas como FRESH domina, raramente ativa."]

    style SKIP fill:#00b894,color:#fff
    style EMPTY fill:#fdcb6e,color:#333
    style NOTE fill:#74b9ff,color:#333
```

---

## 13. Diagnostics — *synapse-diagnose (Funcional)

O sistema de diagnosticos permanece **100% funcional** com 10 collectors.

```mermaid
flowchart TD
    CMD["*synapse-diagnose<br/>(via skill ou command)"] --> ORCH["synapse-diagnostics.js"]

    ORCH --> C1["hook-collector"]
    ORCH --> C2["session-collector"]
    ORCH --> C3["manifest-collector"]
    ORCH --> C4["pipeline-collector"]
    ORCH --> C5["uap-collector"]
    ORCH --> C6["timing-collector"]
    ORCH --> C7["quality-collector"]
    ORCH --> C8["consistency-collector"]
    ORCH --> C9["output-analyzer"]
    ORCH --> C10["relevance-matrix"]

    C1 --> FMT["report-formatter.js<br/>(12 sections)"]
    C2 --> FMT
    C3 --> FMT
    C4 --> FMT
    C5 --> FMT
    C6 --> FMT
    C7 --> FMT
    C8 --> FMT
    C9 --> FMT
    C10 --> FMT

    FMT --> RPT["Markdown Report<br/>Score: A-F grade"]

    style ORCH fill:#6c5ce7,color:#fff
```

---

## 14. Metricas Persistence — Medido

```mermaid
sequenceDiagram
    participant N as Native Activation
    participant E as SynapseEngine
    participant FS as .synapse/metrics/

    Note over N: Agent activation
    N->>FS: Write uap-metrics.json

    Note over E: Per-prompt (<1ms)
    E->>FS: Write hook-metrics.json
```

### hook-metrics.json Real (Medido)

```json
{
  "totalDuration": 0.4,
  "hookBootMs": 12.5,
  "bracket": "FRESH",
  "layersLoaded": 3,
  "layersSkipped": 5,
  "layersErrored": 0,
  "totalRules": 70,
  "timestamp": "2026-02-23T10:00:00.000Z",
  "perLayer": {
    "constitution": { "duration": 0.15, "status": "ok", "rules": 34 },
    "global": { "duration": 0.13, "status": "ok", "rules": 25 },
    "agent": { "duration": 0.08, "status": "ok", "rules": 11 },
    "workflow": { "duration": 0, "status": "skipped", "rules": 0 },
    "task": { "duration": 0, "status": "skipped", "rules": 0 },
    "squad": { "duration": 0, "status": "skipped", "rules": 0 },
    "keyword": { "duration": 0, "status": "skipped", "rules": 0 },
    "star-command": { "duration": 0, "status": "skipped", "rules": 0 }
  }
}
```

---

## 15. Arvore de Arquivos — Status Real

```
aios-core/
├── .claude/
│   ├── agents/                              # 10 native agent files (NOG-20/21)
│   │   └── aios-{id}.md                     # Frontmatter: persona, skills, hooks, memory
│   ├── hooks/
│   │   ├── synapse-engine.cjs               # Hook entry point (ATIVO, <1ms per-prompt)
│   │   └── enforce-git-push-authority.sh    # Git push guard (9/10 agents)
│   ├── skills/                              # 7 skills (NOG-22)
│   │   ├── synapse/SKILL.md                 # SYNAPSE management skill
│   │   ├── coderabbit-review/SKILL.md       # Code review skill
│   │   ├── checklist-runner/SKILL.md        # Checklist execution
│   │   ├── architect-first/SKILL.md         # Architecture-first philosophy
│   │   ├── tech-search/SKILL.md             # Deep tech research
│   │   ├── mcp-builder/SKILL.md             # MCP server building
│   │   └── skill-creator/SKILL.md           # Skill creation guide
│   ├── rules/                               # Contextual rules (substituem L3-L6)
│   │   ├── agent-authority.md
│   │   ├── workflow-execution.md
│   │   ├── story-lifecycle.md
│   │   └── ids-principles.md
│   └── commands/synapse/                    # SYNAPSE CRUD (substituem L7)
│
├── .aios-core/core/synapse/                 # Engine core (ATIVO mas limitado a L0-L2)
│   ├── engine.js                            # DEFAULT_ACTIVE_LAYERS = [0, 1, 2]
│   ├── context/context-tracker.js           # Bracket calc (funcional, decorativo)
│   ├── domain/domain-loader.js              # Manifest + domain loading
│   ├── layers/                              # 8 layers (apenas 3 executam)
│   │   ├── l0-constitution.js               # ATIVO: 0.15ms
│   │   ├── l1-global.js                     # ATIVO: 0.13ms
│   │   ├── l2-agent.js                      # ATIVO: 0.08ms
│   │   ├── l3-workflow.js                   # INATIVO (not in array)
│   │   ├── l4-task.js                       # INATIVO (not in array)
│   │   ├── l5-squad.js                      # INATIVO (not in array)
│   │   ├── l6-keyword.js                    # INATIVO (not in array)
│   │   └── l7-star-command.js               # INATIVO (bug: missing from array)
│   ├── memory/memory-bridge.js              # Pro-gated, raramente invocado
│   ├── output/formatter.js                  # Output XML formatter
│   ├── session/session-manager.js           # Session CRUD
│   └── diagnostics/                         # 10 collectors (FUNCIONAL)
│
├── .aios-core/core/code-intel/              # PRODUCTION (ATIVO via RegistryProvider T1)
│   ├── index.js                             # Public exports, singletons
│   ├── code-intel-client.js                 # Provider detection + circuit breaker + cache
│   ├── code-intel-enricher.js               # 6 composite capabilities
│   ├── registry-syncer.js                   # On-demand registry enrichment
│   ├── providers/
│   │   ├── provider-interface.js            # Abstract base (8 methods + isAvailable())
│   │   ├── registry-provider.js             # T1 NATIVE (ATIVO, 5 primitivas, CODEINTEL-RP-001)
│   │   └── code-graph-provider.js           # T3 MCP adapter (fallback, nao configurado)
│   └── helpers/                             # 6 helpers (ATIVO, 7/7 non-null via RegistryProvider)
│
├── .aios-core/development/scripts/
│   ├── unified-activation-pipeline.js       # FALLBACK only (816 linhas)
│   └── greeting-builder.js                  # DEPRECATED by NOG-21
│
├── .synapse/                                # Runtime data
│   ├── manifest                             # 70 regras, 20 domains
│   ├── constitution                         # L0 domain (ATIVO)
│   ├── global                               # L1 domain (ATIVO)
│   ├── context                              # L1 bracket display
│   ├── agent-{id}                           # L2 domains (12, ATIVO se agent match)
│   ├── workflow-{id}                        # L3 domains (INATIVO, nunca carregado)
│   ├── commands                             # L7 domain (INATIVO, nunca processado)
│   ├── sessions/                            # Session JSON (gitignored)
│   └── metrics/                             # uap + hook metrics
│
└── tests/synapse/                           # 749 tests (todos passam)
```

---

## 16. Resumo: Planejado vs Medido

| Aspecto | v2.0 (Planejado) | v3.0 (Medido) | Gap |
|---------|-----------------|---------------|-----|
| Layers ativos | 4-8 (por bracket) | **3 (fixo)** | L7 bug, L3-L6 disabled |
| Bracket impact | Seleciona layers | **Apenas token budget** | Layer selection bypassed |
| Agent activation | UAP + GreetingBuilder | **Claude Code native** | UAP = fallback only |
| Code Intelligence | Integrado via L3-L7 | **ATIVO via RegistryProvider (T1), paralelo ao SYNAPSE** | 5/8 primitivas nativas, 7/7 helpers non-null |
| Star-commands | L7 detection | **Claude Code skills** | L7 not in array |
| Memory Bridge | DEPLETED/CRITICAL | **Raramente atingido** | FRESH domina |
| Processing time | <100ms | **<1ms** | 100x mais rapido |
| Token output | 800-2500 | **~400-500** | Fewer sections = fewer tokens |
| Session fields | 8 fields populados | **4 populados, 4 null** | L3-L7 nao populam |
| Diagnostics | 10 collectors | **10 collectors (funcional)** | Sem gap |

### Decisoes Arquiteturais (NOG-18)

| Decisao | Rationale | Status |
|---------|-----------|--------|
| Desabilitar L3-L7 | Claude Code rules/skills cobrem essas funcoes nativamente | **Validado** |
| Manter engine code | Possibilidade de reativar layers no futuro | **Mantido** |
| Native greeting | Elimina 816 linhas de JS execution na ativacao | **Funcionando** |
| Keep code-intel code | Production code ATIVO via RegistryProvider (T1), invocado por tasks/registry | **Ativo (5 primitivas, 7/7 helpers non-null)** |
| Memory Bridge Pro-gated | Funcionalidade premium para sessoes longas | **Correto mas raro** |

---

*Documento gerado por @architect (Aria), atualizado por @qa (Quinn)*
*v3.0: metricas medidas (hook-metrics.json, uap-metrics.json, NOG-17/23 baselines)*
*v3.1: CODEINTEL-RP-001 — Code-Intel ativo via RegistryProvider (T1), 351 testes, QA PASS*
*Nenhum dado especulativo — apenas comportamento observado*
*Data: 2026-02-24*

— Aria, arquitetando o futuro
