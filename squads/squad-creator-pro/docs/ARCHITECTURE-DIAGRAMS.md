# Squad Creator - Architecture Diagrams

> **Documento avançado/técnico.** Não é necessário para usar o Squad Creator.
>
> **Primeira vez?** Comece por [POR-ONDE-COMECAR.md](./POR-ONDE-COMECAR.md).
>
> Diagramas de sequência dos principais fluxos. Renderize com [Mermaid Live](https://mermaid.live).

---

## 1. Fluxo Principal: Criação de Squad

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant SA as Squad Architect
    participant MRL as Mind Research Loop
    participant CM as Clone Mind
    participant CA as Create Agent
    participant QG as Quality Gates

    U->>SA: *create-squad {domain}

    rect rgb(40, 40, 60)
        Note over SA: PRE-FLIGHT
        SA->>U: Mostrar requisitos de materiais
        SA->>U: Perguntar modo (YOLO/QUALITY/HYBRID)
        U-->>SA: Selecionar modo
    end

    rect rgb(40, 60, 40)
        Note over SA,MRL: PHASE 1: RESEARCH
        SA->>MRL: Iniciar pesquisa iterativa
        loop 3-5 iterations
            MRL->>MRL: Pesquisar elite minds
            MRL->>MRL: Devil's advocate
            MRL->>MRL: Validar frameworks
        end
        MRL-->>SA: Lista curada de minds
    end

    SA->>U: Apresentar minds encontrados
    U-->>SA: Aprovar minds

    alt QUALITY/HYBRID Mode
        rect rgb(60, 40, 40)
            Note over SA,U: MATERIALS COLLECTION
            SA->>U: Solicitar materiais por mind
            U-->>SA: Fornecer paths/links
        end
    end

    rect rgb(40, 40, 80)
        Note over SA,CA: PHASE 3: CREATION (per mind)
        loop Para cada mind aprovado
            SA->>CM: *clone-mind {name}
            CM-->>SA: mind_dna_complete.yaml
            SA->>CA: *create-agent usando DNA
            CA->>QG: Validar agent
            QG-->>CA: PASS/FAIL
            CA-->>SA: agent.md criado
        end
    end

    SA->>SA: Criar orchestrator
    SA->>SA: Criar workflows/tasks
    SA->>QG: Validação final do squad
    QG-->>SA: Score final

    SA->>U: Squad pronto + Quality Dashboard
```

---

## 2. Fluxo: Clone Mind (DNA Extraction)

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant CM as Clone Mind
    participant CS as Collect Sources
    participant AA as Auto-Acquire
    participant VE as Voice Extractor
    participant TE as Thinking Extractor
    participant ST as Smoke Tests

    U->>CM: *clone-mind {name} --domain {domain}

    rect rgb(50, 40, 40)
        Note over CM,CS: PHASE 0: SOURCE COLLECTION
        CM->>CS: Iniciar coleta de fontes

        alt User forneceu materiais
            CS->>CS: Indexar como Tier 0
        else Sem materiais
            CS->>AA: Executar auto-acquire
            AA->>AA: YouTube transcripts
            AA->>AA: Book summaries
            AA->>AA: Podcasts
            AA-->>CS: Fontes encontradas
        end

        alt < 10 fontes
            CS->>CS: Manual web search
        end

        alt < 5 fontes
            CS-->>U: ❌ Expert muito obscuro
            Note over U: Workflow PARA
        else >= 5 fontes
            CS-->>CM: sources_inventory.yaml
        end
    end

    rect rgb(40, 50, 40)
        Note over CM,VE: PHASE 1: VOICE DNA
        CM->>VE: Extrair Voice DNA
        VE->>VE: Power words
        VE->>VE: Signature phrases
        VE->>VE: Stories/anecdotes
        VE->>VE: Anti-patterns
        VE->>VE: Immune system
        VE-->>CM: voice_dna.yaml (8/10 min)
    end

    rect rgb(40, 40, 50)
        Note over CM,TE: PHASE 2: THINKING DNA
        CM->>TE: Extrair Thinking DNA
        TE->>TE: Recognition patterns
        TE->>TE: Frameworks
        TE->>TE: Heuristics
        TE->>TE: Objection handling
        TE->>TE: Handoff triggers
        TE-->>CM: thinking_dna.yaml (7/9 min)
    end

    CM->>CM: Synthesis: Combinar DNAs
    CM->>CM: Gerar mind_dna_complete.yaml

    rect rgb(60, 40, 60)
        Note over CM,ST: PHASE 4: SMOKE TESTS
        CM->>ST: Executar 3 testes
        ST->>ST: Test 1: Domain Knowledge
        ST->>ST: Test 2: Decision Making
        ST->>ST: Test 3: Objection Handling

        alt 3/3 PASS
            ST-->>CM: ✅ Agente validado
        else Qualquer FAIL
            ST-->>CM: ❌ Re-trabalhar DNA
            CM->>VE: Revisar seção que falhou
        end
    end

    CM->>CM: Gerar Quality Dashboard
    CM-->>U: mind_dna_complete.yaml + dashboard
```

---

## 3. Fluxo: Coleta de Fontes (Fallback Chain)

```mermaid
sequenceDiagram
    autonumber
    participant CS as Collect Sources
    participant T0 as Tier 0 (User)
    participant AA as Auto-Acquire
    participant WS as Web Search
    participant VAL as Validation

    CS->>CS: Verificar user_materials_path

    alt Usuário forneceu materiais
        CS->>T0: Indexar materiais
        T0-->>CS: Tier 0 sources
        Note over CS: Continua para complementar
    end

    CS->>AA: Executar auto-acquire

    par Busca paralela
        AA->>AA: YouTube: "{name}" interview
        AA->>AA: Books: "{name}" books summary
        AA->>AA: Podcasts: "{name}" podcast guest
        AA->>AA: Articles: "{name}" blog newsletter
    end

    AA-->>CS: acquired_sources.yaml

    CS->>CS: Contar fontes totais

    alt total >= 10
        CS->>VAL: Prosseguir para validação
    else total < 10
        CS->>WS: Executar queries manuais
        WS->>WS: "{name}" books
        WS->>WS: "{name}" interview transcript
        WS->>WS: "{name}" framework methodology
        WS-->>CS: Fontes adicionais
    end

    CS->>CS: Recontar fontes

    alt total >= 5
        CS->>VAL: Validar cobertura
        VAL->>VAL: Check: 10+ fontes?
        VAL->>VAL: Check: 5+ Tier 1?
        VAL->>VAL: Check: 3+ tipos?
        VAL->>VAL: Check: Triangulação?

        alt 4/5 blocking PASS
            VAL-->>CS: GO ou CONDITIONAL
        else < 4/5 blocking
            VAL-->>CS: NO-GO
        end
    else total < 5
        CS-->>CS: ❌ FAIL - Expert muito obscuro
        Note over CS: Sugerir: fornecer materiais<br/>ou escolher outro expert
    end

    CS-->>CS: sources_inventory.yaml
```

---

## 4. Fluxo: Auto-Acquire Sources (wf-auto-acquire-sources.yaml)

```mermaid
sequenceDiagram
    autonumber
    participant U as User/Trigger
    participant WF as wf-auto-acquire-sources
    participant EXA as Exa MCP
    participant YT as YouTube Transcript MCP
    participant FC as Firecrawl MCP
    participant WEB as WebFetch (fallback)
    participant QG as Quality Gate

    U->>WF: *auto-acquire-sources "Gary Halbert" --domain copywriting

    rect rgb(40, 40, 50)
        Note over WF: PHASE 0: SETUP
        WF->>WF: Gerar slug: "gary_halbert"
        WF->>WF: Criar estrutura de diretórios
        WF->>WF: Detectar tools disponíveis
    end

    rect rgb(40, 50, 40)
        Note over WF,YT: PHASE 1: YOUTUBE MINING (paralelo)

        par Busca paralela
            WF->>EXA: "{name}" interview YouTube
            WF->>EXA: "{name}" podcast YouTube
            WF->>EXA: "{name}" keynote speech
        end

        EXA-->>WF: URLs de vídeos
        WF->>WF: Filtrar (>10min, expert principal)

        alt mcp-youtube-transcript instalado
            WF->>YT: Extrair transcripts
            YT-->>WF: Transcripts em markdown
        else fallback
            WF->>EXA: Buscar transcripts existentes
            WF->>WEB: Fetch content
            WEB-->>WF: Transcripts parciais
        end

        WF->>WF: Salvar em transcripts/YT_*.md
    end

    rect rgb(50, 40, 40)
        Note over WF,FC: PHASE 2: BOOK MINING (paralelo)

        WF->>EXA: "{name}" books author
        EXA-->>WF: Lista de livros

        WF->>EXA: "{book}" summary site:shortform.com
        EXA-->>WF: URLs de resumos

        alt firecrawl-mcp instalado
            WF->>FC: Scrape summaries (markdown)
            FC-->>WF: Conteúdo limpo
        else fallback
            WF->>WEB: Fetch summaries
            WEB-->>WF: Conteúdo básico
        end

        WF->>WF: Salvar em books/BK_*.md
    end

    rect rgb(40, 40, 60)
        Note over WF,EXA: PHASE 3: PODCAST MINING (paralelo)

        par Busca paralela
            WF->>EXA: "{name}" podcast guest
            WF->>EXA: site:spotify.com "{name}"
            WF->>EXA: site:podcasts.apple.com "{name}"
        end

        EXA-->>WF: Aparições em podcasts
        WF->>WF: Marcar para processamento (Whisper se necessário)
    end

    rect rgb(60, 40, 40)
        Note over WF,FC: PHASE 4: ARTICLE MINING (paralelo)

        par Tier 1: BY expert
            WF->>EXA: "{name}" blog newsletter
            WF->>EXA: site:medium.com author:"{name}"
        and Tier 2: ABOUT expert
            WF->>EXA: "{name}" methodology framework
        end

        EXA-->>WF: URLs de artigos

        alt firecrawl-mcp instalado
            WF->>FC: Batch scrape articles
            FC-->>WF: Artigos em markdown
        else fallback
            WF->>WEB: Fetch articles
            WEB-->>WF: Conteúdo extraído
        end

        WF->>WF: Salvar em articles/AR_*.md
    end

    rect rgb(50, 50, 40)
        Note over WF,QG: PHASE 5: CONSOLIDATION

        WF->>WF: Merge todas as fontes
        WF->>WF: Classificar por Tier (1, 2, 3)
        WF->>WF: Gerar sources_inventory.yaml
        WF->>WF: Gerar acquisition_report.md

        WF->>QG: Validar SRC_ACQ_001

        QG->>QG: total >= 10?
        QG->>QG: tier_1 >= 5?
        QG->>QG: youtube_with_transcript >= 3?

        alt Excellent (20+, 60% tier 1)
            QG-->>WF: ✅ Score: Excellent
        else Good (15+, 50% tier 1)
            QG-->>WF: ✅ Score: Good
        else Acceptable (10+, 40% tier 1)
            QG-->>WF: ⚠️ Score: Acceptable
        else Needs Improvement
            QG-->>WF: ❌ Score: Needs Work
            Note over WF: Recomendações geradas
        end
    end

    WF-->>U: sources_inventory.yaml + acquisition_report.md
```

---

## 4.1 Fluxo: Tool Fallback Chain

```mermaid
flowchart TD
    subgraph "YouTube Transcripts"
        YT_START([Extrair transcript]) --> YT_CHECK{mcp-youtube-transcript<br/>instalado?}
        YT_CHECK -->|Sim| YT_MCP[Usar MCP]
        YT_MCP --> YT_OK([✅ Transcript extraído])

        YT_CHECK -->|Não| YT_FALLBACK1[Buscar via Exa]
        YT_FALLBACK1 --> YT_FOUND{Transcript<br/>existente?}
        YT_FOUND -->|Sim| YT_FETCH[WebFetch content]
        YT_FETCH --> YT_OK

        YT_FOUND -->|Não| YT_QUEUE[Adicionar à manual_queue]
        YT_QUEUE --> YT_PARTIAL([⚠️ Pendente manual])
    end

    subgraph "Web Scraping"
        WS_START([Scrape artigo]) --> WS_CHECK{firecrawl-mcp<br/>instalado?}
        WS_CHECK -->|Sim| WS_MCP[Usar Firecrawl]
        WS_MCP --> WS_OK([✅ Markdown limpo])

        WS_CHECK -->|Não| WS_NATIVE[Usar WebFetch nativo]
        WS_NATIVE --> WS_BASIC([⚠️ Extração básica])
    end

    subgraph "Deep Research"
        DR_START([Research iterativo]) --> DR_CHECK{mcp-perplexity<br/>instalado?}
        DR_CHECK -->|Sim| DR_MCP[Usar Perplexity]
        DR_MCP --> DR_CITE([✅ Com citações])

        DR_CHECK -->|Não| DR_EXA[Usar Exa]
        DR_EXA --> DR_OK([✅ Resultados Exa])
    end

    style YT_OK fill:#4a9,stroke:#333
    style WS_OK fill:#4a9,stroke:#333
    style DR_CITE fill:#4a9,stroke:#333
    style DR_OK fill:#4a9,stroke:#333
    style YT_PARTIAL fill:#fa4,stroke:#333
    style WS_BASIC fill:#fa4,stroke:#333
```

---

## 4.2 Integração: wf-auto-acquire no Pipeline

```mermaid
flowchart LR
    subgraph "Triggers"
        T1[*auto-acquire-sources]
        T2[wf-clone-mind Phase 1]
        T3[collect-sources task]
    end

    subgraph "wf-auto-acquire-sources"
        WF[Workflow]
    end

    subgraph "Outputs"
        O1[sources_inventory.yaml]
        O2[transcripts/]
        O3[articles/]
        O4[books/]
        O5[acquisition_report.md]
    end

    subgraph "Consumers"
        C1[extract-voice-dna task]
        C2[extract-thinking-dna task]
        C3[wf-clone-mind Phase 2-3]
    end

    T1 --> WF
    T2 --> WF
    T3 -->|paralelo| WF

    WF --> O1
    WF --> O2
    WF --> O3
    WF --> O4
    WF --> O5

    O1 --> C1
    O1 --> C2
    O2 --> C1
    O3 --> C2
    O1 --> C3
```

---

## 5. Fluxo: Smoke Tests

```mermaid
sequenceDiagram
    autonumber
    participant AG as Agent.md
    participant ST as Smoke Test Runner
    participant T1 as Test 1: Domain
    participant T2 as Test 2: Decision
    participant T3 as Test 3: Objection
    participant DNA as mind_dna.yaml

    ST->>DNA: Carregar DNA do mind
    DNA-->>ST: voice_dna + thinking_dna

    rect rgb(40, 50, 40)
        Note over ST,T1: TEST 1: CONHECIMENTO
        ST->>AG: "Explique {framework_principal}..."
        AG-->>ST: Resposta
        ST->>T1: Validar resposta
        T1->>T1: Conta power_words (min 3)
        T1->>T1: Verifica signature_phrases (min 1)
        T1->>T1: Verifica never_use (max 0)
        T1->>T1: Valida tom/estrutura
        T1-->>ST: 4/5 checks → PASS/FAIL
    end

    rect rgb(50, 40, 40)
        Note over ST,T2: TEST 2: DECISÃO
        ST->>AG: "Devo fazer A ou B? Por quê?"
        AG-->>ST: Resposta
        ST->>T2: Validar resposta
        T2->>T2: Aplica heurística do DNA?
        T2->>T2: Segue decision_pipeline?
        T2->>T2: Usa framework?
        T2->>T2: Responde com convicção?
        T2-->>ST: 4/5 checks → PASS/FAIL
    end

    rect rgb(40, 40, 50)
        Note over ST,T3: TEST 3: OBJEÇÃO
        ST->>AG: "Discordo porque {objeção}..."
        AG-->>ST: Resposta
        ST->>T3: Validar resposta
        T3->>T3: Reconhece objeção?
        T3->>T3: Usa objection_response do DNA?
        T3->>T3: Mantém convicção?
        T3->>T3: Parece autêntico?
        T3-->>ST: 4/5 checks → PASS/FAIL
    end

    ST->>ST: Consolidar resultados

    alt 3/3 tests PASS
        ST-->>AG: ✅ SMOKE TEST PASSED
        Note over AG: Agente pronto para uso
    else Qualquer test FAIL
        ST-->>AG: ❌ SMOKE TEST FAILED
        Note over AG: Ações:<br/>1. Revisar DNA<br/>2. Adicionar exemplos<br/>3. Re-testar
    end
```

---

## 5. Fluxo: YOLO vs QUALITY Mode

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant SA as Squad Architect
    participant CP as Checkpoints

    U->>SA: *create-squad {domain}
    SA->>U: PRE-FLIGHT: Escolha modo

    alt YOLO Mode
        U-->>SA: 🚀 YOLO (sem materiais)
        Note over SA: Fidelity esperada: 60-75%

        SA->>SA: Research (auto)
        SA->>SA: Clone minds (auto)
        SA->>SA: Create agents (auto)

        loop Para cada checkpoint
            SA->>CP: Verificar critérios
            alt Critérios OK
                CP-->>SA: Auto-proceed ✅
            else Falha crítica
                CP-->>SA: STOP ❌
                SA->>U: Pedir input
            end
        end

        SA->>CP: CP_FINAL
        CP->>U: Aprovação final obrigatória

    else QUALITY Mode
        U-->>SA: 💎 QUALITY (com materiais)
        Note over SA: Fidelity esperada: 85-95%

        SA->>SA: Research
        SA->>CP: CP1: Validar minds
        CP->>U: Aprovar minds?
        U-->>CP: Aprovado

        SA->>U: Solicitar materiais
        U-->>SA: Fornecer paths

        SA->>SA: Clone minds
        SA->>CP: CP_DNA: Validar DNA
        CP->>U: DNA está correto?
        U-->>CP: Aprovado

        SA->>SA: Create agents
        SA->>CP: CP_AGENT: Smoke tests
        CP->>U: Apresentar resultados

        SA->>CP: CP_FINAL
        CP->>U: Aprovação final

    else HYBRID Mode
        U-->>SA: 🔀 HYBRID (alguns materiais)
        Note over SA: Fidelity: variável por expert

        loop Para cada mind
            SA->>U: Tem materiais de {mind}?
            alt Sim
                U-->>SA: Path dos materiais
                Note over SA: Quality mode para este
            else Não
                Note over SA: YOLO mode para este
            end
        end
    end

    SA->>U: Squad criado + Quality Dashboard
```

---

## 6. Estrutura de Arquivos do Squad-Creator

```mermaid
graph TD
    subgraph "squads/squad-creator-pro/"
        A[config.yaml] --> B[agents/]
        A --> C[tasks/]
        A --> D[workflows/]
        A --> E[templates/]
        A --> F[checklists/]
        A --> G[data/]
        A --> H[docs/]

        B --> B1[squad-chief.md]
        B --> B2[sop-extractor.md]

        C --> C1[create-squad.md]
        C --> C2[create-agent.md]
        C --> C3[collect-sources.md]
        C --> C4[auto-acquire-sources.md]
        C --> C5[extract-voice-dna.md]
        C --> C6[extract-thinking-dna.md]
        C --> C7[update-mind.md]

        D --> D1[wf-create-squad.yaml]
        D --> D2[wf-clone-mind.yaml]
        D --> D3[wf-mind-research-loop.yaml]
        D --> D4[wf-auto-acquire-sources.yaml]
        D --> D5[wf-discover-tools.yaml]
        D --> D6[wf-squad-fusion.yaml]
        D --> D7[wf-research-then-create-agent.yaml]
        D --> D8[validate-squad.yaml]

        E --> E1[agent-tmpl.md]
        E --> E2[quality-dashboard-tmpl.md]

        F --> F1[squad-checklist.md]
        F --> F2[smoke-test-agent.md]
        F --> F3[mind-validation.md]

        H --> H1[HITL-FLOW.md]
        H --> H2[ARCHITECTURE-DIAGRAMS.md]
        H --> H3[TOOL-RECOMMENDATIONS.md]
        H --> H4[COMMANDS.md]
        H --> H5[CONCEPTS.md]
    end

    subgraph "squads/mind-cloning/minds/{slug}/"
        O1[sources_inventory.yaml]
        O2[voice_dna.yaml]
        O3[thinking_dna.yaml]
        O4[mind_dna_complete.yaml]
        O5[smoke_test_result.yaml]
        O6[quality_dashboard.md]
    end

    D2 --> O1
    D2 --> O2
    D2 --> O3
    D2 --> O4
    D2 --> O5
    D2 --> O6
```

---

## 7. Quality Gates Flow

```mermaid
flowchart TD
    START([Início]) --> PF[Pre-Flight]

    PF --> |Mode selecionado| P0[Phase 0: Discovery]
    P0 --> QG0{SOURCE_QUALITY<br/>5/5 blocking?}

    QG0 --> |PASS| P1[Phase 1: Voice DNA]
    QG0 --> |FAIL| STOP1[❌ Buscar mais fontes]
    STOP1 --> P0

    P1 --> QG1{VOICE_QUALITY<br/>8/10 min?}
    QG1 --> |PASS| P2[Phase 2: Thinking DNA]
    QG1 --> |WARN| P2

    P2 --> QG2{THINKING_QUALITY<br/>7/9 min?}
    QG2 --> |PASS| P3[Phase 3: Synthesis]
    QG2 --> |WARN| P3

    P3 --> QG3{SYNTHESIS_QUALITY<br/>Consistente?}
    QG3 --> |PASS| P4[Phase 4: Smoke Tests]
    QG3 --> |FAIL| STOP3[❌ Revisar DNA]
    STOP3 --> P1

    P4 --> QG4{SMOKE_TEST<br/>3/3 pass?}
    QG4 --> |PASS| P5[Phase 5: Dashboard]
    QG4 --> |FAIL| STOP4[❌ Re-trabalhar agent]
    STOP4 --> P3

    P5 --> FINAL{CP_FINAL<br/>User approval}
    FINAL --> |Approve| DONE([✅ Squad Pronto])
    FINAL --> |Reject| ADJUST[Ajustar]
    ADJUST --> P4
```

---

## 8. Fluxo: Mind Research Loop (wf-mind-research-loop.yaml)

```mermaid
sequenceDiagram
    autonumber
    participant U as User/Trigger
    participant MRL as Mind Research Loop
    participant EXA as Exa MCP
    participant DA as Devil's Advocate
    participant VAL as Validation
    participant QG as Quality Gate

    U->>MRL: Pesquisar minds para {domain}

    rect rgb(40, 40, 50)
        Note over MRL: SETUP
        MRL->>MRL: Definir domain
        MRL->>MRL: Carregar critérios de seleção
        MRL->>MRL: Configurar max_iterations (3-5)
    end

    loop Iteration 1..N (max 5)
        rect rgb(40, 50, 40)
            Note over MRL,EXA: RESEARCH PHASE

            par Busca paralela
                MRL->>EXA: "{domain}" top experts
                MRL->>EXA: "{domain}" thought leaders
                MRL->>EXA: "{domain}" best books authors
                MRL->>EXA: "{domain}" famous frameworks
            end

            EXA-->>MRL: Candidatos encontrados
            MRL->>MRL: Consolidar lista
        end

        rect rgb(50, 40, 40)
            Note over MRL,DA: DEVIL'S ADVOCATE
            MRL->>DA: Criticar candidatos
            DA->>DA: Verificar credenciais
            DA->>DA: Buscar controvérsias
            DA->>DA: Validar relevância atual
            DA->>DA: Checar fontes disponíveis
            DA-->>MRL: Candidatos refinados + concerns
        end

        rect rgb(40, 40, 60)
            Note over MRL,VAL: TIER CLASSIFICATION
            MRL->>VAL: Classificar candidatos

            VAL->>VAL: Tier 0: Foundational Experts
            VAL->>VAL: Tier 1: Elite Practitioners
            VAL->>VAL: Tier 2: Complementary Minds
            VAL->>VAL: Tier 3: Supporting Voices

            VAL-->>MRL: minds_by_tier.yaml
        end

        MRL->>MRL: Avaliar cobertura

        alt Cobertura >= 80% && diverse_tiers
            MRL->>MRL: Break loop early
        else Precisa mais
            MRL->>MRL: Ajustar queries
            Note over MRL: Próxima iteração
        end
    end

    rect rgb(50, 50, 40)
        Note over MRL,QG: QUALITY GATE
        MRL->>QG: Validar resultado final

        QG->>QG: min_minds >= 4?
        QG->>QG: tier_0_or_1 >= 2?
        QG->>QG: diverse_perspectives?
        QG->>QG: sources_available?

        alt 4/4 PASS
            QG-->>MRL: ✅ APPROVED
        else < 4/4
            QG-->>MRL: ⚠️ CONDITIONAL
            Note over MRL: Recomendações geradas
        end
    end

    MRL-->>U: minds_curated.yaml + research_report.md
```

---

## 8.1 Mind Research: Tier Classification

```mermaid
flowchart TD
    subgraph "Input"
        CAND[Candidatos brutos]
    end

    subgraph "Tier Classification Logic"
        CAND --> CHECK1{É autor<br/>de framework<br/>foundational?}

        CHECK1 -->|Sim| T0[🏆 Tier 0<br/>Foundational]
        CHECK1 -->|Não| CHECK2{Tem livros<br/>best-seller +<br/>10+ anos exp?}

        CHECK2 -->|Sim| T1[⭐ Tier 1<br/>Elite Practitioner]
        CHECK2 -->|Não| CHECK3{Contribui com<br/>perspectiva única?}

        CHECK3 -->|Sim| T2[📚 Tier 2<br/>Complementary]
        CHECK3 -->|Não| CHECK4{Tem conteúdo<br/>útil disponível?}

        CHECK4 -->|Sim| T3[📝 Tier 3<br/>Supporting]
        CHECK4 -->|Não| REJECT[❌ Rejected]
    end

    subgraph "Output"
        T0 --> OUT[minds_by_tier.yaml]
        T1 --> OUT
        T2 --> OUT
        T3 --> OUT
    end

    style T0 fill:#ffd700,stroke:#333,color:#000
    style T1 fill:#4a9,stroke:#333
    style T2 fill:#49a,stroke:#333
    style T3 fill:#666,stroke:#333
    style REJECT fill:#a44,stroke:#333
```

---

## 9. Fluxo: Tool Discovery (wf-discover-tools.yaml)

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant WF as wf-discover-tools
    participant A1 as Agent: MCP Hunter
    participant A2 as Agent: API Scout
    participant A3 as Agent: CLI Explorer
    participant A4 as Agent: Library Finder
    participant A5 as Agent: GitHub Searcher
    participant CONS as Consolidator

    U->>WF: *discover-tools {domain}

    rect rgb(40, 40, 50)
        Note over WF: PHASE 1: SETUP
        WF->>WF: Parse domain
        WF->>WF: Identificar capability gaps
        WF->>WF: Carregar tool-registry.yaml
    end

    rect rgb(40, 50, 40)
        Note over WF,A5: PHASE 2: PARALLEL DISCOVERY

        par 5 Agentes em paralelo
            WF->>A1: Buscar MCPs
            A1->>A1: glama.ai/mcp
            A1->>A1: GitHub MCP repos
            A1->>A1: npm MCP packages
            A1-->>WF: mcp_candidates[]
        and
            WF->>A2: Buscar APIs
            A2->>A2: RapidAPI
            A2->>A2: ProgrammableWeb
            A2->>A2: Public APIs list
            A2-->>WF: api_candidates[]
        and
            WF->>A3: Buscar CLIs
            A3->>A3: Homebrew
            A3->>A3: npm global
            A3->>A3: pip tools
            A3-->>WF: cli_candidates[]
        and
            WF->>A4: Buscar Libraries
            A4->>A4: npm packages
            A4->>A4: pip packages
            A4->>A4: awesome-* lists
            A4-->>WF: lib_candidates[]
        and
            WF->>A5: Buscar GitHub Projects
            A5->>A5: Trending repos
            A5->>A5: Topic search
            A5->>A5: Stars ranking
            A5-->>WF: github_candidates[]
        end
    end

    rect rgb(50, 40, 40)
        Note over WF,CONS: PHASE 3: CONSOLIDATION
        WF->>CONS: Merge all candidates

        CONS->>CONS: Deduplicate
        CONS->>CONS: Score by relevance
        CONS->>CONS: Score by maturity
        CONS->>CONS: Score by ease of integration

        CONS-->>WF: scored_tools[]
    end

    rect rgb(40, 40, 60)
        Note over WF: PHASE 4: PRIORITIZATION
        WF->>WF: Build Impact vs Effort matrix

        WF->>WF: Priority 1: Quick Wins (High Impact, Low Effort)
        WF->>WF: Priority 2: Strategic (High Impact, High Effort)
        WF->>WF: Priority 3: Nice-to-have (Low Impact, Low Effort)
        WF->>WF: Priority 4: Avoid (Low Impact, High Effort)

        WF->>WF: Gerar integration_plan.yaml
    end

    WF-->>U: Tool Discovery Report + Recommendations
```

---

## 9.1 Tool Discovery: Prioritization Matrix

```mermaid
quadrantChart
    title Impact vs Effort Matrix
    x-axis Low Effort --> High Effort
    y-axis Low Impact --> High Impact
    quadrant-1 Strategic Investment
    quadrant-2 Quick Wins (Do First!)
    quadrant-3 Nice-to-have
    quadrant-4 Avoid
    mcp-youtube-transcript: [0.2, 0.9]
    firecrawl-mcp: [0.3, 0.9]
    mcp-perplexity: [0.25, 0.85]
    knowledge-graph-memory: [0.5, 0.8]
    supadata-mcp: [0.6, 0.6]
    cognee-mcp: [0.8, 0.7]
```

---

## 10. Fluxo: Validate Squad (validate-squad.yaml)

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant VS as validate-squad
    participant P1 as Phase 1: Structure
    participant P2 as Phase 2: Config
    participant P3 as Phase 3: Agents
    participant P4 as Phase 4: Workflows
    participant P5 as Phase 5: Tasks
    participant P6 as Phase 6: Templates
    participant P7 as Phase 7: Checklists
    participant P8 as Phase 8: Security
    participant P9 as Phase 9: Quality
    participant RPT as Report Generator

    U->>VS: *validate-squad {squad-name}

    rect rgb(40, 40, 50)
        Note over VS,P1: PHASE 1: STRUCTURE CHECK
        VS->>P1: Validar estrutura de diretórios
        P1->>P1: agents/ existe?
        P1->>P1: workflows/ existe?
        P1->>P1: tasks/ existe?
        P1->>P1: templates/ existe?
        P1->>P1: config.yaml existe?
        P1-->>VS: structure_score
    end

    rect rgb(40, 50, 40)
        Note over VS,P2: PHASE 2: CONFIG VALIDATION
        VS->>P2: Validar config.yaml
        P2->>P2: YAML válido?
        P2->>P2: Campos obrigatórios?
        P2->>P2: Orchestrator definido?
        P2->>P2: Dependencies resolvidas?
        P2-->>VS: config_score
    end

    rect rgb(50, 40, 40)
        Note over VS,P3: PHASE 3: AGENT VALIDATION
        VS->>P3: Validar cada agent

        loop Para cada agent.md
            P3->>P3: Lines >= 300?
            P3->>P3: voice_dna presente?
            P3->>P3: output_examples >= 3?
            P3->>P3: anti_patterns definidos?
            P3->>P3: completion_criteria?
            P3->>P3: 6-level structure?
        end

        P3-->>VS: agents_score + issues[]
    end

    rect rgb(40, 40, 60)
        Note over VS,P4: PHASE 4: WORKFLOW VALIDATION
        VS->>P4: Validar cada workflow

        loop Para cada workflow
            P4->>P4: YAML/MD válido?
            P4->>P4: Phases definidas?
            P4->>P4: Quality gates?
            P4->>P4: Inputs/outputs?
        end

        P4-->>VS: workflows_score
    end

    rect rgb(50, 50, 40)
        Note over VS,P5: PHASE 5: TASK VALIDATION
        VS->>P5: Validar cada task

        loop Para cada task
            P5->>P5: 8 campos obrigatórios?
            P5->>P5: elicit definido?
            P5->>P5: output clara?
        end

        P5-->>VS: tasks_score
    end

    VS->>P6: Phase 6: Templates
    P6-->>VS: templates_score

    VS->>P7: Phase 7: Checklists
    P7-->>VS: checklists_score

    rect rgb(60, 40, 40)
        Note over VS,P8: PHASE 8: SECURITY SCAN
        VS->>P8: Scan de segurança
        P8->>P8: Secrets expostos?
        P8->>P8: Paths absolutos hardcoded?
        P8->>P8: Comandos perigosos?
        P8->>P8: Injection risks?
        P8-->>VS: security_score + warnings[]
    end

    rect rgb(40, 60, 40)
        Note over VS,P9: PHASE 9: QUALITY SCORE
        VS->>P9: Calcular score final

        P9->>P9: Weighted average
        P9->>P9: Critical issues blocker?
        P9->>P9: Recommendations

        P9-->>VS: final_score
    end

    VS->>RPT: Gerar relatório
    RPT-->>U: validation_report.md + score
```

---

## 10.1 Validate Squad: Scoring Breakdown

```mermaid
pie showData
    title Squad Validation Score Weights
    "Structure" : 10
    "Config" : 10
    "Agents" : 30
    "Workflows" : 15
    "Tasks" : 15
    "Templates" : 5
    "Checklists" : 5
    "Security" : 10
```

---

## 11. Fluxo: Squad Fusion (wf-squad-fusion.yaml)

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant SF as Squad Fusion
    participant VAL as Validator
    participant ANA as Analyzer
    participant PLAN as Planner
    participant MERGE as Merger
    participant ORCH as Orchestrator Builder
    participant QG as Quality Gate

    U->>SF: *fuse-squads squad1 squad2 --name combined

    rect rgb(40, 40, 50)
        Note over SF,VAL: PHASE 1: PRE-FLIGHT VALIDATION
        SF->>VAL: Validar squads de origem

        par Validação paralela
            VAL->>VAL: squad1 existe?
            VAL->>VAL: squad2 existe?
        end

        VAL->>VAL: Compatibilidade de domínios?
        VAL->>VAL: Conflitos de agents?
        VAL-->>SF: validation_result

        alt Conflitos críticos
            SF-->>U: ❌ Fusão impossível: {reason}
            Note over U: Workflow PARA
        end
    end

    rect rgb(40, 50, 40)
        Note over SF,ANA: PHASE 2: DEEP ANALYSIS
        SF->>ANA: Analisar ambos squads

        ANA->>ANA: Map agents por tier
        ANA->>ANA: Identificar overlaps
        ANA->>ANA: Identificar gaps
        ANA->>ANA: Map workflows
        ANA->>ANA: Map dependencies

        ANA-->>SF: analysis_report
    end

    rect rgb(50, 40, 40)
        Note over SF,PLAN: PHASE 3: FUSION PLANNING
        SF->>PLAN: Criar plano de fusão

        PLAN->>PLAN: Agent merge strategy
        PLAN->>PLAN: Workflow integration
        PLAN->>PLAN: Task consolidation
        PLAN->>PLAN: Template merging
        PLAN->>PLAN: New orchestrator design

        PLAN-->>SF: fusion_plan.yaml
    end

    SF->>U: Apresentar fusion_plan
    U-->>SF: Aprovar plano

    rect rgb(40, 40, 60)
        Note over SF,MERGE: PHASE 4-6: EXECUTION

        SF->>MERGE: Phase 4: Merge Agents
        MERGE->>MERGE: Copy agents
        MERGE->>MERGE: Resolve conflicts
        MERGE->>MERGE: Update references
        MERGE-->>SF: agents_merged

        SF->>MERGE: Phase 5: Merge Workflows
        MERGE->>MERGE: Combine workflows
        MERGE->>MERGE: Update agent references
        MERGE-->>SF: workflows_merged

        SF->>MERGE: Phase 6: Merge Tasks/Templates
        MERGE-->>SF: tasks_templates_merged
    end

    rect rgb(50, 50, 40)
        Note over SF,ORCH: PHASE 7: NEW ORCHESTRATOR
        SF->>ORCH: Criar orchestrator combinado

        ORCH->>ORCH: Definir handoff rules
        ORCH->>ORCH: Map all agents
        ORCH->>ORCH: Define routing logic
        ORCH->>ORCH: Set quality gates

        ORCH-->>SF: orchestrator.md
    end

    rect rgb(60, 40, 60)
        Note over SF,QG: PHASE 8: FINAL VALIDATION
        SF->>QG: Validar squad fusionado

        QG->>QG: Structure valid?
        QG->>QG: All agents accessible?
        QG->>QG: Workflows functional?
        QG->>QG: No broken references?
        QG->>QG: Smoke test orchestrator

        alt All PASS
            QG-->>SF: ✅ Fusão completa
        else Issues found
            QG-->>SF: ⚠️ Issues para resolver
            Note over SF: Gerar fix recommendations
        end
    end

    SF-->>U: combined_squad/ + fusion_report.md
```

---

## 11.1 Squad Fusion: Merge Strategy

```mermaid
flowchart TD
    subgraph "Squad A"
        A1[Agent A1<br/>Tier 1]
        A2[Agent A2<br/>Tier 2]
        A3[Agent A3<br/>Tier 3]
    end

    subgraph "Squad B"
        B1[Agent B1<br/>Tier 0]
        B2[Agent B2<br/>Tier 1]
        B3[Agent B3<br/>Tier 2]
    end

    subgraph "Merge Logic"
        CHECK{Overlap?}
        KEEP[Keep higher tier]
        MERGE_DNA[Merge DNAs]
        RENAME[Rename if conflict]
    end

    subgraph "Combined Squad"
        C0[Agent B1<br/>Tier 0]
        C1A[Agent A1<br/>Tier 1]
        C1B[Agent B2<br/>Tier 1]
        C2[Agent merged<br/>Tier 2]
        C3[Agent A3<br/>Tier 3]
        CORCH[New Orchestrator]
    end

    A1 --> CHECK
    B2 --> CHECK
    CHECK -->|No| KEEP
    CHECK -->|Yes, same tier| MERGE_DNA
    CHECK -->|Yes, diff tier| KEEP

    B1 --> C0
    A1 --> C1A
    B2 --> C1B
    A2 --> MERGE_DNA
    B3 --> MERGE_DNA
    MERGE_DNA --> C2
    A3 --> C3

    C0 --> CORCH
    C1A --> CORCH
    C1B --> CORCH
    C2 --> CORCH
    C3 --> CORCH

    style C0 fill:#ffd700,stroke:#333,color:#000
    style CORCH fill:#49a,stroke:#333
```

---

## 12. Fluxo: Research Then Create Agent (wf-research-then-create-agent.yaml)

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant RTC as Research-Then-Create
    participant MRL as Mind Research Loop
    participant CS as Collect Sources
    participant VE as Voice Extractor
    participant TE as Thinking Extractor
    participant CA as Create Agent
    participant ST as Smoke Tests
    participant QG as Quality Gate

    U->>RTC: Criar agent baseado em {expert_name}

    rect rgb(40, 40, 50)
        Note over RTC: STEP 1: CONTEXT GATHERING
        RTC->>RTC: Identificar expert
        RTC->>RTC: Definir domain
        RTC->>RTC: Determinar target_squad
        RTC->>RTC: Configurar mode (YOLO/QUALITY)
    end

    rect rgb(40, 50, 40)
        Note over RTC,MRL: STEP 2: DEEP RESEARCH
        RTC->>MRL: Pesquisar expert

        MRL->>MRL: Background research
        MRL->>MRL: Find frameworks
        MRL->>MRL: Identify key works
        MRL->>MRL: Devil's advocate

        MRL-->>RTC: research_report.md
    end

    rect rgb(50, 40, 40)
        Note over RTC,CS: STEP 3: SOURCE COLLECTION
        RTC->>CS: Coletar fontes

        CS->>CS: YouTube transcripts
        CS->>CS: Book summaries
        CS->>CS: Podcasts
        CS->>CS: Articles

        CS-->>RTC: sources_inventory.yaml
    end

    RTC->>RTC: Verificar cobertura de fontes

    alt < 5 fontes
        RTC-->>U: ⚠️ Fontes insuficientes
        RTC->>U: Pedir materiais adicionais
        U-->>RTC: Fornecer paths
    end

    rect rgb(40, 40, 60)
        Note over RTC,VE: STEP 4: VOICE DNA EXTRACTION
        RTC->>VE: Extrair Voice DNA

        VE->>VE: Power words
        VE->>VE: Signature phrases
        VE->>VE: Writing style
        VE->>VE: Anti-patterns
        VE->>VE: Immune system

        VE-->>RTC: voice_dna.yaml
    end

    rect rgb(50, 50, 40)
        Note over RTC,TE: STEP 5: THINKING DNA EXTRACTION
        RTC->>TE: Extrair Thinking DNA

        TE->>TE: Recognition patterns
        TE->>TE: Frameworks
        TE->>TE: Heuristics
        TE->>TE: Decision pipeline

        TE-->>RTC: thinking_dna.yaml
    end

    rect rgb(60, 40, 40)
        Note over RTC: STEP 6: DNA SYNTHESIS
        RTC->>RTC: Combinar DNAs
        RTC->>RTC: Resolver inconsistências
        RTC->>RTC: Gerar mind_dna_complete.yaml
    end

    rect rgb(40, 60, 40)
        Note over RTC,CA: STEP 7: AGENT CREATION
        RTC->>CA: Criar agent.md

        CA->>CA: Apply 6-level structure
        CA->>CA: Embed voice_dna
        CA->>CA: Embed thinking_dna
        CA->>CA: Add output_examples
        CA->>CA: Define completion_criteria

        CA-->>RTC: agent.md (draft)
    end

    rect rgb(40, 40, 70)
        Note over RTC,ST: STEP 8: SMOKE TESTS
        RTC->>ST: Executar smoke tests

        ST->>ST: Test 1: Domain Knowledge
        ST->>ST: Test 2: Decision Making
        ST->>ST: Test 3: Objection Handling

        alt 3/3 PASS
            ST-->>RTC: ✅ Smoke tests passed
        else Qualquer FAIL
            ST-->>RTC: ❌ Needs refinement
            RTC->>VE: Revisar DNA
            Note over RTC: Loop de refinamento
        end
    end

    rect rgb(50, 40, 50)
        Note over RTC,QG: STEP 9: QUALITY GATE
        RTC->>QG: Validação final

        QG->>QG: Agent structure valid?
        QG->>QG: DNA score >= 7/10?
        QG->>QG: Smoke tests 3/3?
        QG->>QG: Output examples quality?

        QG-->>RTC: final_score + recommendations
    end

    RTC-->>U: agent.md + quality_dashboard.md
```

---

## 12.1 Research-Then-Create: Decision Points

```mermaid
flowchart TD
    START([*create-agent --research]) --> S1[Step 1: Context]
    S1 --> S2[Step 2: Research]
    S2 --> S3[Step 3: Sources]

    S3 --> CHECK1{>= 5 fontes?}
    CHECK1 -->|Não| ASK[Pedir materiais]
    ASK --> S3
    CHECK1 -->|Sim| S4[Step 4: Voice DNA]

    S4 --> S5[Step 5: Thinking DNA]
    S5 --> S6[Step 6: Synthesis]
    S6 --> S7[Step 7: Create Agent]
    S7 --> S8[Step 8: Smoke Tests]

    S8 --> CHECK2{3/3 PASS?}
    CHECK2 -->|Não| REFINE[Refinar DNA]
    REFINE --> S4
    CHECK2 -->|Sim| S9[Step 9: Quality Gate]

    S9 --> CHECK3{Score >= 7/10?}
    CHECK3 -->|Não| IMPROVE[Melhorar agent]
    IMPROVE --> S7
    CHECK3 -->|Sim| DONE([✅ Agent Pronto])

    style DONE fill:#4a9,stroke:#333
    style ASK fill:#fa4,stroke:#333
    style REFINE fill:#fa4,stroke:#333
    style IMPROVE fill:#fa4,stroke:#333
```

---

## Como Visualizar

1. **Mermaid Live Editor:** https://mermaid.live
2. **VS Code:** Instalar extensão "Markdown Preview Mermaid Support"
3. **GitHub:** Renderiza automaticamente em arquivos .md
4. **Obsidian:** Suporte nativo a Mermaid

---

---

## Changelog

| Versão | Data | Mudanças |
|--------|------|----------|
| v2.1 | 2026-02-05 | Atualizado referências: todos workflows agora em .yaml (mind-research-loop.md → wf-mind-research-loop.yaml, research-then-create-agent.md → wf-research-then-create-agent.yaml). Seção 6 atualizada com lista completa de workflows. |
| v2.0 | 2026-02-05 | **100% Coverage!** Adicionados 5 workflows faltantes: mind-research-loop (seções 8, 8.1), wf-discover-tools (seções 9, 9.1), validate-squad (seções 10, 10.1), wf-squad-fusion (seções 11, 11.1), research-then-create-agent (seções 12, 12.1) |
| v1.1 | 2026-02-05 | Adicionado: wf-auto-acquire-sources (seções 4, 4.1, 4.2), Tool Fallback Chain, Integration diagram |
| v1.0 | 2026-02-01 | Versão inicial com fluxos principais |

---

## Coverage Summary

| Workflow | Seções | Status |
|----------|--------|--------|
| wf-create-squad.yaml | 1 | ✅ |
| wf-clone-mind.yaml | 2 | ✅ |
| collect-sources (task) | 3 | ✅ |
| wf-auto-acquire-sources.yaml | 4, 4.1, 4.2 | ✅ |
| smoke-tests (checklist) | 5 | ✅ |
| YOLO vs QUALITY modes | 5 | ✅ |
| File Structure | 6 | ✅ |
| Quality Gates | 7 | ✅ |
| wf-mind-research-loop.yaml | 8, 8.1 | ✅ |
| wf-discover-tools.yaml | 9, 9.1 | ✅ |
| validate-squad.yaml | 10, 10.1 | ✅ |
| wf-squad-fusion.yaml | 11, 11.1 | ✅ |
| wf-research-then-create-agent.yaml | 12, 12.1 | ✅ |

**Total Coverage: 100%** (8/8 workflows documentados - todos em YAML)

---

**Squad Architect | Architecture Diagrams v2.1**
*"A picture is worth a thousand lines of YAML."*
