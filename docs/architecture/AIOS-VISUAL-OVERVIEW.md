# AIOS — Visual Overview & Flowcharts

> Guia visual de alto nivel explicando o que e o Synkra AIOS,
> a metodologia Task-First, os 4 tipos de executores,
> o workspace dinamico e como tudo se conecta.

**Versao:** 1.0.0
**Data:** 2026-02-12
**Autor:** @architect (Aria)
**Status:** Living Document

---

## Indice

1. [O que e o AIOS?](#1-o-que-e-o-aios)
2. [Task-First Philosophy](#2-task-first-philosophy)
3. [Os 4 Executores](#3-os-4-executores)
4. [Decision Tree — Qual Executor Usar?](#4-decision-tree--qual-executor-usar)
5. [Workspace Dinamico](#5-workspace-dinamico)
6. [Fluxo Completo — Da Ideia ao Deploy](#6-fluxo-completo--da-ideia-ao-deploy)
7. [Resumo Comparativo](#7-resumo-comparativo)

---

## 1. O que e o AIOS?

O **Synkra AIOS** (AI Operating System) e um framework que transforma como equipes
constroem software — combinando **agentes de IA especializados** com **humanos reais**
numa metodologia agil unica.

A inovacao central: **Tasks sao a unidade primaria, nao agentes.**
Agentes sao apenas um dos 4 tipos possiveis de executores de uma task.

```mermaid
flowchart TB
    subgraph AIOS["SYNKRA AIOS"]
        direction TB

        subgraph CORE["Core: Task-First Engine"]
            TASK["Task Validada<br/>(unidade primaria)"]
            DECISION{"Decision Tree:<br/>Quem executa?"}
        end

        subgraph EXECUTORS["4 Tipos de Executores"]
            direction LR
            AGENT["Agent<br/>IA Generativa"]
            WORKER["Worker<br/>Script Deterministico"]
            CLONE["Clone<br/>IA + Metodologia"]
            HUMAN["Humano<br/>Julgamento Critico"]
        end

        subgraph WORKSPACE["Workspace Dinamico"]
            direction LR
            SQUADS["Squads<br/>Equipes Modulares"]
            CONFIG["Config Personalizada<br/>por Empresa"]
            COLLAB["Humanos + IA<br/>Trabalhando Juntos"]
        end
    end

    subgraph PRINCIPLES["Principios Constitucionais"]
        CLI["CLI First"]
        STORY["Story-Driven"]
        QUALITY["Quality Gates"]
    end

    TASK --> DECISION
    DECISION --> AGENT
    DECISION --> WORKER
    DECISION --> CLONE
    DECISION --> HUMAN

    WORKSPACE --> TASK
    PRINCIPLES --> AIOS

    style CORE fill:#1a1a2e,color:#fff
    style EXECUTORS fill:#16213e,color:#fff
    style WORKSPACE fill:#0f3460,color:#fff
    style AGENT fill:#e94560,color:#fff
    style WORKER fill:#00b894,color:#fff
    style CLONE fill:#6c5ce7,color:#fff
    style HUMAN fill:#fdcb6e,color:#000
    style TASK fill:#00cec9,color:#000
```

### O AIOS em uma frase

> **"Um sistema operacional para desenvolvimento onde tasks validadas sao executadas
> pelo executor ideal — seja IA, script, clone cognitivo ou humano — dentro de
> workspaces dinamicos personalizados por empresa."**

### Hierarquia de Prioridades

```
CLI First  >  Observability Second  >  UI Third
(Execucao)    (Monitoramento)          (Gestao pontual)
```

---

## 2. Task-First Philosophy

A metodologia **Task-First** do Pedro Valerio inverte o paradigma tradicional:

| Paradigma Tradicional | Task-First (AIOS) |
|-----------------------|-------------------|
| Agentes sao o centro | **Tasks** sao o centro |
| "Qual agente uso?" | "Qual task preciso executar?" |
| Agentes decidem o que fazer | Tasks definem O QUE, executores definem QUEM |
| Acoplado ao executor | Executor e **intercambiavel** |

### Principio Central

```mermaid
flowchart LR
    subgraph TRADITIONAL["Paradigma Tradicional"]
        direction TB
        A1["Agente A"] --> T1["Task 1"]
        A1 --> T2["Task 2"]
        A2["Agente B"] --> T3["Task 3"]
        NOTE1["Agentes decidem<br/>o que executar"]
    end

    subgraph TASKFIRST["Task-First (AIOS)"]
        direction TB
        TK1["Task Validada"] --> DEC1{"Executor?"}
        DEC1 --> E1["Agent"]
        DEC1 --> E2["Worker"]
        DEC1 --> E3["Clone"]
        DEC1 --> E4["Human"]
        NOTE2["Tasks definem o trabalho.<br/>Executores sao intercambiaveis."]
    end

    TRADITIONAL -.->|"evolui para"| TASKFIRST

    style TRADITIONAL fill:#2d2d2d,color:#fff
    style TASKFIRST fill:#1a472a,color:#fff
    style TK1 fill:#00cec9,color:#000
    style NOTE1 fill:#444,color:#ccc
    style NOTE2 fill:#1a472a,color:#0f0
```

### Anatomia de uma Task

Uma task validada e **lei** — deve ser executada conforme definida,
independente de quem (ou o que) a executa:

```mermaid
flowchart TB
    subgraph TASK_ANATOMY["Anatomia de uma Task"]
        direction TB
        ID["ID + Nome"]
        DESC["Descricao clara"]
        INPUTS["Inputs definidos"]
        OUTPUTS["Outputs esperados"]
        PRE["Pre-conditions"]
        POST["Post-conditions"]
        EXEC["Executor Type:<br/>Agent | Worker | Clone | Human"]
        AC["Acceptance Criteria"]
    end

    TASK_ANATOMY --> VALIDATE{"Task Validada?"}
    VALIDATE -->|"Sim"| EXECUTE["Execucao garantida<br/>por qualquer executor"]
    VALIDATE -->|"Nao"| REJECT["Rejeitar:<br/>Refinar task primeiro"]

    style TASK_ANATOMY fill:#2c3e50,color:#fff
    style EXECUTE fill:#27ae60,color:#fff
    style REJECT fill:#c0392b,color:#fff
```

### Por que Task-First?

```
Uma task bem definida pode ser executada por:
  - Um agente de IA as 3h da manha    (Agent)
  - Um script rodando em CI/CD         (Worker)
  - Um clone do Brad Frost validando   (Clone)
  - Um humano revisando manualmente    (Human)

O resultado e o MESMO. O executor e intercambiavel.
```

---

## 3. Os 4 Executores

Cada executor tem caracteristicas unicas que o tornam ideal para certos tipos de tasks:

```mermaid
flowchart TB
    subgraph EXECUTORS["Os 4 Executores do AIOS"]
        direction TB

        subgraph AGENT_BOX["AGENT — IA Generativa"]
            AGENT_DESC["Usa LLMs para tasks criativas,<br/>analiticas ou generativas"]
            AGENT_EX["Ex: Analisar brief, gerar copy,<br/>selecionar template, code review"]
        end

        subgraph WORKER_BOX["WORKER — Script Deterministico"]
            WORKER_DESC["Codigo/script que transforma<br/>dados com logica predefinida"]
            WORKER_EX["Ex: Carregar config JSON,<br/>validar HTML, exportar PNG,<br/>calcular espacamento"]
        end

        subgraph CLONE_BOX["CLONE — IA + Heuristicas de Dominio"]
            CLONE_DESC["Agente IA aumentado com axiomas<br/>e metodologia de uma pessoa especifica"]
            CLONE_EX["Ex: Validar Atomic Design (Brad Frost),<br/>revisar copy (Alex Hormozi),<br/>avaliar UX (Jakob Nielsen)"]
        end

        subgraph HUMAN_BOX["HUMAN — Operador Humano"]
            HUMAN_DESC["Pessoa real executando task<br/>que requer julgamento subjetivo"]
            HUMAN_EX["Ex: Aprovar campanha $10k,<br/>compliance legal, decisao estrategica,<br/>edge cases criticos"]
        end
    end

    style AGENT_BOX fill:#e94560,color:#fff
    style WORKER_BOX fill:#00b894,color:#fff
    style CLONE_BOX fill:#6c5ce7,color:#fff
    style HUMAN_BOX fill:#fdcb6e,color:#000
```

### Comparativo Rapido

| | Agent | Worker | Clone | Human |
|---|---|---|---|---|
| **Custo** | $$$$ | $ | $$$$ | $$$ |
| **Velocidade** | 3-10s | < 1s | 5-15s | min-horas |
| **Deterministico** | Nao | Sim | Parcial | Nao |
| **Criatividade** | Sim | Nao | Sim (guiada) | Sim |
| **Responsabilidade Legal** | Nao | Nao | Nao | Sim |
| **Melhor para** | Tasks criativas | Transformacoes | Validacao metodologica | Decisoes criticas |

---

## 4. Decision Tree — Qual Executor Usar?

Este e o flowchart principal que determina qual executor deve ser
atribuido a cada task no AIOS:

```mermaid
flowchart TD
    START(["Nova Task para Executar"]) --> Q1{"Requer<br/>Criatividade ou<br/>Subjetividade?"}

    Q1 -->|"Nao"| Q2{"Algoritmo<br/>Deterministico<br/>Existe?"}
    Q1 -->|"Sim"| Q3{"Julgamento<br/>Humano<br/>Obrigatorio?"}

    Q2 -->|"Sim"| Q4{"Chama<br/>API Externa?"}
    Q2 -->|"Nao"| Q3

    Q3 -->|"Sim"| Q5{"Decisao Critica<br/>com Impacto<br/>Legal/Financeiro?"}
    Q3 -->|"Nao"| Q6{"Metodologia<br/>Especifica<br/>Necessaria?"}

    Q4 -->|"Sim (nao-IA)"| WORKER1["WORKER<br/>com API"]
    Q4 -->|"Nao"| WORKER2["WORKER<br/>Script"]

    Q5 -->|"Sim"| HUMAN["HUMAN<br/>Operador Humano"]
    Q5 -->|"Nao"| Q6

    Q6 -->|"Sim"| CLONE["CLONE<br/>IA + Heuristicas"]
    Q6 -->|"Nao"| AGENT["AGENT<br/>IA Generativa"]

    WORKER1 --> EXEC(["Executar Task"])
    WORKER2 --> EXEC
    HUMAN --> EXEC
    CLONE --> EXEC
    AGENT --> EXEC

    style START fill:#2c3e50,color:#fff
    style EXEC fill:#2c3e50,color:#fff
    style WORKER1 fill:#00b894,color:#fff
    style WORKER2 fill:#00b894,color:#fff
    style HUMAN fill:#fdcb6e,color:#000
    style CLONE fill:#6c5ce7,color:#fff
    style AGENT fill:#e94560,color:#fff
    style Q1 fill:#34495e,color:#fff
    style Q2 fill:#34495e,color:#fff
    style Q3 fill:#34495e,color:#fff
    style Q4 fill:#34495e,color:#fff
    style Q5 fill:#34495e,color:#fff
    style Q6 fill:#34495e,color:#fff
```

### Regras de Substituicao

Executores podem ser trocados ao longo do tempo conforme o sistema evolui:

```mermaid
flowchart LR
    subgraph SUBSTITUTION["Regras de Substituicao de Executores"]
        direction TB

        R1["Agent -> Worker<br/><i>Quando task se torna<br/>deterministica com dados</i>"]
        R2["Human -> Agent<br/><i>Quando automacao atinge<br/>precisao aceitavel</i>"]
        R3["Agent -> Clone<br/><i>Quando metodologia especifica<br/>aumenta qualidade</i>"]
        R4["Clone -> Agent<br/><i>Quando metodologia nao e<br/>critica para o resultado</i>"]
    end

    R1 -->|"Economia: 100%"| SAVE1["$$$ -> $"]
    R2 -->|"Economia: 99.8%"| SAVE2["$$$ -> $"]
    R3 -->|"Qualidade: +25%"| QUAL1["+Custo, +Qualidade"]
    R4 -->|"Economia: 67%"| SAVE3["$$$$ -> $$"]

    style R1 fill:#00b894,color:#fff
    style R2 fill:#e94560,color:#fff
    style R3 fill:#6c5ce7,color:#fff
    style R4 fill:#e94560,color:#fff
```

### Estrategias Hibridas

Na pratica, muitas tasks combinam executores para resultados otimos:

```mermaid
flowchart LR
    subgraph H1["Agent + Worker (Fallback)"]
        A1["Agent tenta"] -->|"falha"| W1["Worker assume<br/>(regra simples)"]
    end

    subgraph H2["Agent + Human (Review)"]
        A2["Agent processa<br/>100% do volume"] -->|"score < 80%"| HU1["Human revisa<br/>casos criticos"]
    end

    subgraph H3["Clone + Agent (Validacao)"]
        A3["Agent cria<br/>(criativo)"] --> C1["Clone valida<br/>(metodologia)"]
        C1 -->|"invalido"| A3
    end

    style H1 fill:#1a1a2e,color:#fff
    style H2 fill:#1a1a2e,color:#fff
    style H3 fill:#1a1a2e,color:#fff
```

---

## 5. Workspace Dinamico

Cada empresa/equipe monta seu **workspace personalizado** com os componentes que precisa.
O AIOS e modular — voce combina squads, agentes e configuracoes como blocos de Lego.

### Arquitetura do Workspace

```mermaid
flowchart TB
    subgraph WS["Workspace Dinamico da Empresa"]
        direction TB

        subgraph FRAMEWORK[".aios-core/ — Framework (Imutavel)"]
            AGENTS_CORE["11 Agentes Core<br/>dev, qa, architect, pm,<br/>po, sm, analyst, devops,<br/>data-engineer, ux, aios-master"]
            TASKS_CORE["45+ Tasks<br/>Executaveis"]
            WORKFLOWS["Workflows<br/>Orquestraveis"]
            CONSTITUTION["Constitution<br/>Principios Inegociaveis"]
        end

        subgraph SQUADS["squads/ — Equipes Modulares"]
            SQ1["Squad Marketing<br/>copywriter, designer,<br/>traffic manager"]
            SQ2["Squad Data<br/>data-engineer, analyst,<br/>etl specialist"]
            SQ3["Squad Dominio<br/>agentes especializados<br/>no negocio da empresa"]
        end

        subgraph MINDS["Clones Cognitivos"]
            M1["Pedro Valerio<br/>Processos & Sistemas"]
            M2["Brad Frost<br/>Atomic Design"]
            M3["Alex Hormozi<br/>Copywriting"]
            M4["Clone Customizado<br/>Especialista da empresa"]
        end

        subgraph CONFIG["Configuracao por Empresa"]
            CS["Coding Standards"]
            TS["Tech Stack"]
            ST["Source Tree"]
            IDE["IDE Rules<br/>(Claude Code, Cursor,<br/>Copilot, Gemini)"]
        end
    end

    subgraph HUMANS["Equipe Humana"]
        DEV_H["Desenvolvedores"]
        PM_H["Product Managers"]
        DESIGN_H["Designers"]
        STAKEHOLDERS["Stakeholders"]
    end

    HUMANS <-->|"Colaboracao<br/>Human-in-the-Loop"| WS

    style FRAMEWORK fill:#1a1a2e,color:#fff
    style SQUADS fill:#0f3460,color:#fff
    style MINDS fill:#533483,color:#fff
    style CONFIG fill:#2c3e50,color:#fff
    style HUMANS fill:#d35400,color:#fff
    style SQ1 fill:#e94560,color:#fff
    style SQ2 fill:#00b894,color:#fff
    style SQ3 fill:#6c5ce7,color:#fff
```

### Como uma Empresa Monta seu Workspace

```mermaid
flowchart LR
    INSTALL(["npx aios-core install"]) --> WIZARD["Installation Wizard"]

    WIZARD --> CHOOSE_SQUADS["Escolher Squads<br/>(squads iniciais)"]
    WIZARD --> CHOOSE_IDE["Escolher IDEs<br/>(Claude Code, Cursor...)"]
    WIZARD --> CHOOSE_CONFIG["Configurar<br/>Preferencias"]

    CHOOSE_SQUADS --> SQ_OPS["HybridOps<br/>(Pedro Valerio)"]
    CHOOSE_SQUADS --> SQ_CUSTOM["Squad Customizado<br/>(dominio da empresa)"]
    CHOOSE_SQUADS --> SQ_MARKET["Marketplace<br/>(squads prontos)"]

    CHOOSE_IDE --> IDE1["Claude Code"]
    CHOOSE_IDE --> IDE2["Cursor"]
    CHOOSE_IDE --> IDE3["Copilot Chat"]
    CHOOSE_IDE --> IDE4["Gemini CLI"]

    SQ_OPS --> READY(["Workspace Pronto!<br/>Humanos + IA<br/>trabalhando juntos"])
    SQ_CUSTOM --> READY
    SQ_MARKET --> READY
    IDE1 --> READY
    IDE2 --> READY
    IDE3 --> READY
    IDE4 --> READY

    style INSTALL fill:#2c3e50,color:#fff
    style READY fill:#27ae60,color:#fff
    style WIZARD fill:#34495e,color:#fff
```

### Squads + Humanos: Colaboracao Real

O diferencial do AIOS e que squads **nao substituem** humanos — trabalham **junto**:

```mermaid
flowchart TB
    subgraph COLLAB["Colaboracao Squads + Humanos"]
        direction TB

        subgraph PLANNING["Fase 1: Planejamento"]
            H_PM["PM Humano"] <-->|"refina requisitos"| AI_PM["@pm (Morgan)<br/>Agent"]
            H_PM <-->|"valida arquitetura"| AI_ARCH["@architect (Aria)<br/>Agent"]
            AI_PM --> PRD["PRD Completo"]
            AI_ARCH --> ARCH_DOC["Documento de<br/>Arquitetura"]
        end

        subgraph EXECUTION["Fase 2: Desenvolvimento"]
            AI_SM["@sm (River)<br/>Agent"] -->|"cria stories"| STORIES["Stories<br/>Hiperdetalhadas"]
            STORIES --> AI_DEV["@dev (Dex)<br/>Agent"]
            AI_DEV -->|"implementa"| CODE["Codigo"]
            CODE --> AI_QA["@qa (Quinn)<br/>Agent"]
            H_DEV["Dev Humano"] <-->|"pair programming"| AI_DEV
            H_DEV <-->|"code review"| AI_QA
        end

        subgraph REVIEW["Fase 3: Quality Gates"]
            AI_QA -->|"PASS"| AI_DEVOPS["@devops (Gage)<br/>Agent"]
            AI_QA -->|"FAIL"| AI_DEV
            H_LEAD["Tech Lead Humano"] -->|"aprovacao final"| AI_DEVOPS
            AI_DEVOPS -->|"push + PR"| DEPLOYED(["Deployed"])
        end
    end

    PLANNING --> EXECUTION --> REVIEW

    style PLANNING fill:#1a472a,color:#fff
    style EXECUTION fill:#1a1a2e,color:#fff
    style REVIEW fill:#2c1810,color:#fff
    style DEPLOYED fill:#27ae60,color:#fff
```

---

## 6. Fluxo Completo — Da Ideia ao Deploy

Este diagrama mostra o caminho completo de uma ideia ate o deploy,
passando por todos os agentes, gates e pontos de decisao:

```mermaid
flowchart TD
    IDEA(["Ideia / Requisito"]) --> ANALYST["@analyst<br/>Pesquisa & Analise"]
    ANALYST --> PM["@pm (Morgan)<br/>Cria PRD"]
    PM --> ARCH["@architect (Aria)<br/>Design Arquitetural"]

    ARCH --> SM["@sm (River)<br/>Cria Stories"]
    SM --> PO{"@po (Pax)<br/>Valida Story?<br/>10-point checklist"}

    PO -->|"GO >= 7/10"| DEV["@dev (Dex)<br/>Implementa"]
    PO -->|"NO-GO < 7/10"| SM

    DEV --> CODERABBIT{"CodeRabbit<br/>Self-Healing<br/>max 2 iteracoes"}
    CODERABBIT -->|"CRITICAL"| DEV
    CODERABBIT -->|"OK"| QA{"@qa (Quinn)<br/>Quality Gate<br/>7 checks"}

    QA -->|"PASS"| DEVOPS["@devops (Gage)<br/>Push + PR"]
    QA -->|"CONCERNS"| DEVOPS
    QA -->|"FAIL"| DEV

    DEVOPS --> DEPLOYED(["Deployed"])

    subgraph TASKS_FLOW["Cada passo e uma TASK"]
        direction LR
        NOTE["Cada caixa acima e uma Task.<br/>Cada Task define inputs, outputs,<br/>pre/post-conditions.<br/>O executor (Agent) e apenas<br/>o tipo padrao — poderia ser<br/>Worker, Clone ou Human."]
    end

    style IDEA fill:#2c3e50,color:#fff
    style DEPLOYED fill:#27ae60,color:#fff
    style PO fill:#fdcb6e,color:#000
    style QA fill:#fdcb6e,color:#000
    style CODERABBIT fill:#e94560,color:#fff
    style TASKS_FLOW fill:#1a1a2e,color:#aaa
```

### Mapeamento Executor por Fase

| Fase | Task | Executor Padrao | Alternativa Possivel |
|------|------|-----------------|---------------------|
| Pesquisa | Analisar mercado | Agent (@analyst) | Human (pesquisador) |
| Planejamento | Criar PRD | Agent (@pm) | Human (PM real) |
| Arquitetura | Design do sistema | Agent (@architect) | Human (CTO) |
| Stories | Criar stories | Agent (@sm) | Human (SM real) |
| Validacao | Validar story | Agent (@po) | Human (PO real) |
| Implementacao | Codificar feature | Agent (@dev) | Human (dev real) |
| QA | Quality gate | Agent (@qa) | Human (QA real) |
| Deploy | Push + PR | Agent (@devops) | Human (DevOps real) |
| Linting | Verificar estilo | **Worker** (ESLint) | — |
| Type check | Verificar tipos | **Worker** (TypeScript) | — |
| Build | Compilar projeto | **Worker** (npm build) | — |
| Design review | Validar Atomic Design | **Clone** (Brad Frost) | Human (designer senior) |
| Copy review | Validar copywriting | **Clone** (Hormozi) | Human (copywriter) |
| Aprovacao legal | Compliance check | **Human** (obrigatorio) | — |
| Aprovacao financeira | Budget > $10k | **Human** (obrigatorio) | — |

---

## 7. Resumo Comparativo

### AIOS vs Abordagens Tradicionais

```mermaid
flowchart LR
    subgraph TRAD["Abordagem Tradicional"]
        direction TB
        T1["Humano faz TUDO"] --> T2["IA como chatbot<br/>(pergunta-resposta)"]
        T2 --> T3["Sem estrutura<br/>Sem quality gates"]
        T3 --> T4["Resultado: Inconsistente"]
    end

    subgraph TASKMASTER["Task Runners (Taskmaster etc)"]
        direction TB
        TM1["IA gera lista de tasks"] --> TM2["IA executa tasks<br/>sequencialmente"]
        TM2 --> TM3["Sem validacao<br/>Sem roles distintos"]
        TM3 --> TM4["Resultado: Fragil"]
    end

    subgraph AIOS_WAY["Synkra AIOS (Task-First)"]
        direction TB
        A1["Tasks validadas<br/>com acceptance criteria"] --> A2["Decision tree seleciona<br/>executor ideal"]
        A2 --> A3["Quality gates em<br/>cada transicao"]
        A3 --> A4["Resultado: Confiavel<br/>& Escalavel"]
    end

    style TRAD fill:#c0392b,color:#fff
    style TASKMASTER fill:#d35400,color:#fff
    style AIOS_WAY fill:#27ae60,color:#fff
```

### Principios Constitucionais

O AIOS opera sob uma **Constitution formal** com principios inegociaveis:

| Artigo | Principio | Severidade | Significado |
|--------|-----------|------------|-------------|
| I | CLI First | NON-NEGOTIABLE | Tudo funciona via CLI antes de qualquer UI |
| II | Agent Authority | NON-NEGOTIABLE | Cada agente tem autoridades exclusivas |
| III | Story-Driven | MUST | Todo desenvolvimento comeca com uma story |
| IV | No Invention | MUST | Specs derivam de requisitos, nunca inventam |
| V | Quality First | MUST | Quality gates bloqueiam codigo ruim |
| VI | Absolute Imports | SHOULD | Imports absolutos sempre |

---

## Como Visualizar estes Diagramas

Os flowcharts usam **Mermaid** e podem ser renderizados em:

1. **GitHub** — Renderiza automaticamente em arquivos `.md`
2. **VS Code** — Extensao "Markdown Preview Mermaid Support"
3. **Mermaid Live Editor** — [mermaid.live](https://mermaid.live)
4. **Obsidian** — Suporte nativo a Mermaid

---

## Documentos Relacionados

| Documento | Conteudo |
|-----------|----------|
| [EXECUTOR-DECISION-TREE.md](../../.aios-core/docs/standards/EXECUTOR-DECISION-TREE.md) | Decision tree detalhado com exemplos e cost-benefit |
| [SYNAPSE-FLOWCHARTS.md](SYNAPSE/SYNAPSE-FLOWCHARTS.md) | 12 flowcharts do motor de contexto SYNAPSE |
| [Constitution](../../.aios-core/constitution.md) | Principios inegociaveis do framework |
| [User Guide](../../.aios-core/user-guide.md) | Guia completo de uso do AIOS |
| [Squads Guide](../guides/squads-guide.md) | Como criar e gerenciar squads |

---

*Synkra AIOS Visual Overview v1.0.0*
*Task-First | 4 Executores | Workspace Dinamico*
*— Aria, arquitetando o futuro*
