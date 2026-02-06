# Workflow Greenfield UI - Guia Completo

> **Workflow ID:** `greenfield-ui`
> **Tipo:** Greenfield
> **Versao:** 1.0
> **Ultima Atualizacao:** 2026-02-04

## Visao Geral

O workflow **Greenfield UI** e o fluxo orquestrado para desenvolvimento de aplicacoes frontend do zero (greenfield). Ele cobre todo o ciclo de vida desde a conceituacao ate a implementacao, suportando tanto planejamento abrangente para UIs complexas quanto prototipagem rapida para interfaces simples.

### Tipos de Projeto Suportados

| Tipo | Descricao |
|------|-----------|
| `spa` | Single Page Applications |
| `mobile-app` | Aplicativos moveis |
| `micro-frontend` | Micro-frontends |
| `static-site` | Sites estaticos |
| `ui-prototype` | Prototipos de UI |
| `simple-interface` | Interfaces simples |

### Quando Usar Este Workflow

- Construindo aplicacoes frontend de producao
- Multiplas views/paginas com interacoes complexas
- Necessidade de design UI/UX abrangente e testes
- Multiplos membros da equipe envolvidos
- Manutencao de longo prazo esperada
- Aplicacoes voltadas ao cliente

---

## Diagrama do Workflow

### Fluxo Principal

```mermaid
graph TD
    subgraph "Fase 1: Planejamento e Especificacao"
        A[Inicio: Desenvolvimento UI] --> B["@analyst: project-brief.md"]
        B --> C["@pm: prd.md"]
        C --> D["@ux-expert: front-end-spec.md"]
        D --> D2{Gerar prompt v0?}
        D2 -->|Sim| D3["@ux-expert: criar prompt v0"]
        D2 -->|Nao| E["@architect: front-end-architecture.md"]
        D3 --> D4[Usuario: gerar UI em v0/Lovable]
        D4 --> E
    end

    subgraph "Fase 2: Validacao e Ajustes"
        E --> F{Arquitetura sugere mudancas no PRD?}
        F -->|Sim| G["@pm: atualizar prd.md"]
        F -->|Nao| H["@po: validar todos os artefatos"]
        G --> H
        H --> I{PO encontrou problemas?}
        I -->|Sim| J[Retornar ao agente relevante]
        I -->|Nao| K["@po: fragmentar documentos"]
        J --> H
    end

    subgraph "Fase 3: Desenvolvimento"
        K --> L["@sm: criar story"]
        L --> M{Revisar story draft?}
        M -->|Sim| N["@analyst/@pm: revisar e aprovar"]
        M -->|Nao| O["@dev: implementar story"]
        N --> O
        O --> P{Revisao QA?}
        P -->|Sim| Q["@qa: revisar implementacao"]
        P -->|Nao| R{Mais stories?}
        Q --> S{QA encontrou problemas?}
        S -->|Sim| T["@dev: corrigir feedback QA"]
        S -->|Nao| R
        T --> Q
        R -->|Sim| L
        R -->|Nao| U{Retrospectiva do Epic?}
    end

    subgraph "Fase 4: Finalizacao"
        U -->|Sim| V["@po: retrospectiva do epic"]
        U -->|Nao| W[Projeto Completo]
        V --> W
    end

    %% Steps Opcionais
    B -.-> B1[Opcional: brainstorming]
    B -.-> B2[Opcional: pesquisa de mercado]
    D -.-> D1[Opcional: pesquisa de usuarios]
    E -.-> E1[Opcional: pesquisa tecnica]

    %% Estilos
    style W fill:#90EE90
    style K fill:#ADD8E6
    style L fill:#ADD8E6
    style O fill:#ADD8E6
    style D3 fill:#E6E6FA
    style D4 fill:#E6E6FA
    style B fill:#FFE4B5
    style C fill:#FFE4B5
    style D fill:#FFE4B5
    style E fill:#FFE4B5
    style N fill:#F0E68C
    style Q fill:#F0E68C
    style V fill:#F0E68C
```

### Legenda de Cores

| Cor | Significado |
|-----|-------------|
| Laranja (`#FFE4B5`) | Criacao de Documentos |
| Azul Claro (`#ADD8E6`) | Ciclo de Desenvolvimento |
| Lavanda (`#E6E6FA`) | Geracao AI (Opcional) |
| Amarelo (`#F0E68C`) | Revisao/Validacao (Opcional) |
| Verde (`#90EE90`) | Conclusao |

---

## Diagrama de Sequencia

```mermaid
sequenceDiagram
    autonumber
    participant U as Usuario
    participant AN as @analyst (Atlas)
    participant PM as @pm (Morgan)
    participant UX as @ux-expert (Uma)
    participant AR as @architect (Aria)
    participant PO as @po (Pax)
    participant SM as @sm (River)
    participant DEV as @dev (Dex)
    participant QA as @qa (Quinn)

    rect rgb(255, 228, 181)
        Note over U,AR: Fase 1: Planejamento
        U->>AN: Iniciar projeto UI
        AN->>AN: Brainstorming (opcional)
        AN->>AN: Pesquisa de mercado (opcional)
        AN-->>U: project-brief.md
        U->>PM: Criar PRD
        PM-->>U: prd.md
        U->>UX: Criar especificacao frontend
        UX->>UX: Pesquisa de usuarios (opcional)
        UX-->>U: front-end-spec.md

        alt Geracao AI desejada
            U->>UX: Gerar prompt v0
            UX-->>U: prompt para v0/Lovable
            U->>U: Gerar UI externamente
        end

        U->>AR: Criar arquitetura frontend
        AR->>AR: Pesquisa tecnica (opcional)
        AR-->>U: front-end-architecture.md
    end

    rect rgb(173, 216, 230)
        Note over PM,PO: Fase 2: Validacao
        alt Mudancas sugeridas no PRD
            AR->>PM: Sugerir atualizacoes
            PM-->>U: prd.md atualizado
        end

        U->>PO: Validar artefatos
        PO->>PO: Executar po-master-checklist

        alt Problemas encontrados
            PO-->>U: Listar problemas
            U->>U: Retornar ao agente relevante
            U->>PO: Revalidar
        end

        PO-->>U: Artefatos validados
        U->>PO: Fragmentar documentos
        PO-->>U: docs/prd/ e docs/architecture/
    end

    rect rgb(144, 238, 144)
        Note over SM,QA: Fase 3: Desenvolvimento
        loop Para cada Epic/Story
            U->>SM: Criar proxima story
            SM-->>U: story.md (Draft)

            opt Revisao de Draft
                U->>AN: Revisar story
                AN-->>U: Story aprovada
            end

            U->>DEV: Implementar story
            DEV->>DEV: Codigo + Testes
            DEV-->>U: Implementacao completa

            opt Revisao QA
                U->>QA: Revisar implementacao
                alt Problemas encontrados
                    QA-->>DEV: Feedback
                    DEV->>DEV: Corrigir
                    DEV-->>QA: Resubmeter
                end
                QA-->>U: Aprovado
            end
        end
    end

    rect rgb(240, 230, 140)
        Note over PO,PO: Fase 4: Finalizacao
        opt Retrospectiva
            U->>PO: Retrospectiva do Epic
            PO-->>U: epic-retrospective.md
        end
    end

    U->>U: Projeto Completo!
```

---

## Steps Detalhados

### Fase 1: Planejamento e Especificacao

#### Step 1: Criacao do Project Brief

| Atributo | Valor |
|----------|-------|
| **Agente** | `@analyst` (Atlas) |
| **Comando** | `*create-project-brief` |
| **Task** | `create-doc.md` + `project-brief-tmpl.yaml` |
| **Cria** | `project-brief.md` |
| **Steps Opcionais** | `brainstorming_session`, `market_research_prompt` |

**Descricao:** O Analyst facilita a ideacao inicial, conduz pesquisa de mercado opcional e cria o brief do projeto que serve como base para todo o desenvolvimento.

**Input:**
- Visao do usuario sobre o projeto
- Contexto de mercado
- Restricoes conhecidas

**Output:**
- `docs/project-brief.md` - Brief completo do projeto

**Prompt de Handoff:**
> "Project brief is complete. Save it as docs/project-brief.md in your project, then create the PRD."

---

#### Step 2: Criacao do PRD

| Atributo | Valor |
|----------|-------|
| **Agente** | `@pm` (Morgan) |
| **Comando** | `*create-prd` |
| **Task** | `create-doc.md` + `prd-tmpl.yaml` |
| **Requer** | `project-brief.md` |
| **Cria** | `prd.md` |

**Descricao:** O Product Manager transforma o brief em um Product Requirements Document (PRD) detalhado, focado em requisitos de UI/frontend.

**Input:**
- `project-brief.md`
- Feedback de stakeholders

**Output:**
- `docs/prd.md` - PRD completo com epics e stories

**Prompt de Handoff:**
> "PRD is ready. Save it as docs/prd.md in your project, then create the UI/UX specification."

---

#### Step 3: Especificacao de Frontend

| Atributo | Valor |
|----------|-------|
| **Agente** | `@ux-expert` (Uma) |
| **Comando** | `*create-front-end-spec` |
| **Task** | `create-doc.md` + `front-end-spec-tmpl.yaml` |
| **Requer** | `prd.md` |
| **Cria** | `front-end-spec.md` |
| **Steps Opcionais** | `user_research_prompt` |

**Descricao:** O UX Expert cria a especificacao detalhada de UI/UX, incluindo wireframes, fluxos de interacao e design system.

**Input:**
- `prd.md`
- Pesquisa de usuarios (opcional)

**Output:**
- `docs/front-end-spec.md` - Especificacao completa de frontend

---

#### Step 4: Geracao de Prompt AI (Opcional)

| Atributo | Valor |
|----------|-------|
| **Agente** | `@ux-expert` (Uma) |
| **Comando** | `*generate-ui-prompt` |
| **Task** | `generate-ai-frontend-prompt.md` |
| **Requer** | `front-end-spec.md` |
| **Cria** | `v0_prompt` |
| **Condicao** | `user_wants_ai_generation` |

**Descricao:** Gera prompts otimizados para ferramentas de geracao de UI como v0, Lovable, ou similares.

**Input:**
- `front-end-spec.md`
- Preferencias de estilo

**Output:**
- Prompt formatado para ferramenta AI
- Usuario gera UI externamente e baixa estrutura do projeto

---

#### Step 5: Arquitetura de Frontend

| Atributo | Valor |
|----------|-------|
| **Agente** | `@architect` (Aria) |
| **Comando** | `*create-front-end-architecture` |
| **Task** | `create-doc.md` + `front-end-architecture-tmpl.yaml` |
| **Requer** | `front-end-spec.md` |
| **Cria** | `front-end-architecture.md` |
| **Steps Opcionais** | `technical_research_prompt`, `review_generated_ui_structure` |

**Descricao:** O Architect cria a arquitetura tecnica do frontend, incluindo decisoes de stack, patterns e estrutura de componentes.

**Input:**
- `front-end-spec.md`
- Estrutura gerada por v0/Lovable (se aplicavel)

**Output:**
- `docs/front-end-architecture.md` - Arquitetura tecnica completa

**Prompt de Handoff:**
> "Frontend architecture complete. Save it as docs/front-end-architecture.md. Do you suggest any changes to the PRD stories or need new stories added?"

---

### Fase 2: Validacao e Ajustes

#### Step 6: Atualizacao do PRD (Condicional)

| Atributo | Valor |
|----------|-------|
| **Agente** | `@pm` (Morgan) |
| **Comando** | `*create-prd` (update) |
| **Requer** | `front-end-architecture.md` |
| **Atualiza** | `prd.md` |
| **Condicao** | `architecture_suggests_prd_changes` |

**Descricao:** Se o Architect sugerir mudancas nas stories ou novos requisitos, o PM atualiza o PRD.

**Input:**
- Sugestoes do Architect
- PRD atual

**Output:**
- `docs/prd.md` atualizado

---

#### Step 7: Validacao pelo PO

| Atributo | Valor |
|----------|-------|
| **Agente** | `@po` (Pax) |
| **Comando** | `*execute-checklist-po` |
| **Task** | `execute-checklist.md` + `po-master-checklist.md` |
| **Valida** | Todos os artefatos |

**Descricao:** O Product Owner valida a consistencia e completude de todos os documentos criados.

**Input:**
- `project-brief.md`
- `prd.md`
- `front-end-spec.md`
- `front-end-architecture.md`

**Output:**
- Validacao PASS ou lista de problemas

**Prompt em caso de problemas:**
> "PO found issues with [document]. Please return to [agent] to fix and re-save the updated document."

---

#### Step 8: Fragmentacao de Documentos

| Atributo | Valor |
|----------|-------|
| **Agente** | `@po` (Pax) |
| **Comando** | `*shard-doc` |
| **Task** | `shard-doc.md` |
| **Requer** | Todos os artefatos validados |
| **Cria** | `sharded_docs` |

**Descricao:** Fragmenta documentos grandes em partes menores para facilitar o desenvolvimento no IDE.

**Opcoes de Execucao:**
- **Opcao A:** Usar agente PO: `@po` depois pedir para fragmentar `docs/prd.md`
- **Opcao B:** Manual: Arrastar task `shard-doc` + `docs/prd.md` para o chat

**Output:**
- `docs/prd/` - PRD fragmentado
- `docs/architecture/` - Arquitetura fragmentada

---

### Fase 3: Desenvolvimento

#### Step 9: Criacao de Story

| Atributo | Valor |
|----------|-------|
| **Agente** | `@sm` (River) |
| **Comando** | `*draft` |
| **Task** | `create-next-story.md` |
| **Requer** | `sharded_docs` |
| **Cria** | `story.md` |
| **Repete** | Para cada epic |

**Descricao:** O Scrum Master cria stories detalhadas a partir dos documentos fragmentados.

**Ciclo de Criacao:**
1. SM Agent (Nova Sessao): `@sm` → `*draft`
2. Cria proxima story dos docs fragmentados
3. Story inicia com status "Draft"

**Input:**
- Documentos fragmentados
- Contexto do sprint

**Output:**
- `docs/stories/epic-X/story-X.Y.md` - Story em Draft

---

#### Step 10: Revisao de Draft (Opcional)

| Atributo | Valor |
|----------|-------|
| **Agente** | `@analyst` ou `@pm` |
| **Comando** | `*review` (coming soon) |
| **Atualiza** | `story.md` |
| **Condicao** | `user_wants_story_review` |
| **Opcional** | Sim |

**Descricao:** Revisao opcional do draft para garantir completude e alinhamento.

**Acoes:**
- Revisar completude da story
- Verificar alinhamento com PRD
- Atualizar status: Draft → Approved

---

#### Step 11: Implementacao

| Atributo | Valor |
|----------|-------|
| **Agente** | `@dev` (Dex) |
| **Comando** | `*develop` |
| **Task** | `dev-develop-story.md` |
| **Requer** | `story.md` (aprovada) |
| **Cria** | Arquivos de implementacao |

**Descricao:** O Developer implementa a story seguindo os requisitos e tasks definidos.

**Ciclo de Implementacao:**
1. Dev Agent (Nova Sessao): `@dev`
2. Implementa story aprovada
3. Atualiza File List com todas as mudancas
4. Marca story como "Review" quando completa

**Input:**
- Story aprovada
- Arquitetura de referencia

**Output:**
- Codigo implementado
- Testes
- Story atualizada com File List

---

#### Step 12: Revisao QA (Opcional)

| Atributo | Valor |
|----------|-------|
| **Agente** | `@qa` (Quinn) |
| **Comando** | `*review` |
| **Task** | `qa-review-story.md` |
| **Requer** | Arquivos implementados |
| **Atualiza** | Implementacao |
| **Opcional** | Sim |

**Descricao:** Revisao de senior dev com capacidade de refatoracao.

**Ciclo de QA:**
1. QA Agent (Nova Sessao): `@qa` → `*review {story}`
2. Corrige problemas pequenos diretamente
3. Deixa checklist para itens restantes
4. Atualiza status (Review → Done ou permanece Review)

**Output:**
- Codigo revisado/refatorado
- Checklist de itens pendentes (se houver)
- QA Gate decision (PASS/CONCERNS/FAIL)

---

#### Step 13: Correcao de Feedback QA (Condicional)

| Atributo | Valor |
|----------|-------|
| **Agente** | `@dev` (Dex) |
| **Comando** | `*apply-qa-fixes` |
| **Task** | `dev-apply-qa-fixes.md` |
| **Condicao** | `qa_left_unchecked_items` |
| **Atualiza** | Arquivos de implementacao |

**Descricao:** Se QA deixou itens nao marcados, Dev corrige e resubmete.

**Ciclo:**
1. Dev Agent (Nova Sessao): Endereca itens restantes
2. Retorna para QA para aprovacao final

---

#### Step 14: Ciclo de Desenvolvimento

| Atributo | Valor |
|----------|-------|
| **Acao** | Repetir ciclo SM → Dev → QA |
| **Condicao** | Ate todas as stories do PRD estarem completas |

**Descricao:** Repete o ciclo de criacao de story, implementacao e revisao para todas as stories.

---

### Fase 4: Finalizacao

#### Step 15: Retrospectiva do Epic (Opcional)

| Atributo | Valor |
|----------|-------|
| **Agente** | `@po` (Pax) |
| **Comando** | `*epic-retrospective` (coming soon) |
| **Condicao** | `epic_complete` |
| **Cria** | `epic-retrospective.md` |
| **Opcional** | Sim |

**Descricao:** Apos conclusao do epic, valida se foi completado corretamente e documenta aprendizados.

**Output:**
- `docs/retrospectives/epic-X-retrospective.md`
- Melhorias documentadas

---

#### Step 16: Conclusao do Projeto

| Atributo | Valor |
|----------|-------|
| **Acao** | Projeto completo |

**Descricao:** Todas as stories implementadas e revisadas. Fase de desenvolvimento do projeto concluida.

**Referencia:** `.aios-core/data/aios-kb.md#IDE Development Workflow`

---

## Agentes Participantes

### Tabela de Agentes

| Agente | Nome | Papel | Principais Comandos |
|--------|------|-------|---------------------|
| `@analyst` | Atlas | Business Analyst | `*create-project-brief`, `*brainstorm`, `*research` |
| `@pm` | Morgan | Product Manager | `*create-prd`, `*shard-prd`, `*create-epic` |
| `@ux-expert` | Uma | UX/UI Designer | `*create-front-end-spec`, `*generate-ui-prompt`, `*wireframe` |
| `@architect` | Aria | System Architect | `*create-front-end-architecture`, `*document-project` |
| `@po` | Pax | Product Owner | `*execute-checklist-po`, `*shard-doc`, `*validate-story-draft` |
| `@sm` | River | Scrum Master | `*draft`, `*story-checklist` |
| `@dev` | Dex | Full Stack Developer | `*develop`, `*run-tests`, `*apply-qa-fixes` |
| `@qa` | Quinn | Test Architect | `*review`, `*gate`, `*test-design` |

### Diagrama de Colaboracao entre Agentes

```mermaid
graph LR
    subgraph "Planejamento"
        AN[Atlas<br/>@analyst] --> PM[Morgan<br/>@pm]
        PM --> UX[Uma<br/>@ux-expert]
        UX --> AR[Aria<br/>@architect]
    end

    subgraph "Validacao"
        AR --> PM
        AR --> PO[Pax<br/>@po]
        PM --> PO
    end

    subgraph "Desenvolvimento"
        PO --> SM[River<br/>@sm]
        SM --> DEV[Dex<br/>@dev]
        DEV --> QA[Quinn<br/>@qa]
        QA --> DEV
    end

    PO -.-> SM
    SM -.-> PO

    style AN fill:#FFE4B5
    style PM fill:#FFE4B5
    style UX fill:#FFE4B5
    style AR fill:#FFE4B5
    style PO fill:#F0E68C
    style SM fill:#ADD8E6
    style DEV fill:#ADD8E6
    style QA fill:#F0E68C
```

---

## Tasks Executadas

### Por Fase

#### Fase 1: Planejamento

| Task | Agente | Template | Descricao |
|------|--------|----------|-----------|
| `create-doc.md` | @analyst | `project-brief-tmpl.yaml` | Criar brief do projeto |
| `create-deep-research-prompt.md` | @analyst | - | Pesquisa de mercado |
| `facilitate-brainstorming-session.md` | @analyst | `brainstorming-output-tmpl.yaml` | Sessao de brainstorming |
| `create-doc.md` | @pm | `prd-tmpl.yaml` | Criar PRD |
| `create-doc.md` | @ux-expert | `front-end-spec-tmpl.yaml` | Especificacao frontend |
| `generate-ai-frontend-prompt.md` | @ux-expert | - | Prompt para v0/Lovable |
| `create-doc.md` | @architect | `front-end-architecture-tmpl.yaml` | Arquitetura frontend |

#### Fase 2: Validacao

| Task | Agente | Checklist | Descricao |
|------|--------|-----------|-----------|
| `execute-checklist.md` | @po | `po-master-checklist.md` | Validar artefatos |
| `shard-doc.md` | @po | - | Fragmentar documentos |

#### Fase 3: Desenvolvimento

| Task | Agente | Descricao |
|------|--------|-----------|
| `create-next-story.md` | @sm | Criar proxima story |
| `execute-checklist.md` | @sm | Checklist de story draft |
| `dev-develop-story.md` | @dev | Implementar story |
| `dev-apply-qa-fixes.md` | @dev | Aplicar correcoes QA |
| `qa-review-story.md` | @qa | Revisar implementacao |
| `qa-gate.md` | @qa | Decisao de quality gate |

---

## Pre-requisitos

### Antes de Iniciar o Workflow

1. **Ambiente Configurado**
   - Node.js 18+ instalado
   - Git configurado
   - Gerenciador de pacotes (npm/yarn/pnpm)

2. **AIOS-Core Disponivel**
   - Templates em `.aios-core/development/templates/`
   - Tasks em `.aios-core/development/tasks/`
   - Checklists em `.aios-core/development/checklists/`

3. **Estrutura de Projeto**
   - Diretorio `docs/` criado
   - Diretorio `docs/stories/` criado

4. **Ferramentas de Pesquisa (Opcionais)**
   - EXA MCP configurado para pesquisa web
   - Context7 para documentacao de bibliotecas

---

## Entradas e Saidas

### Diagrama de Fluxo de Dados

```mermaid
flowchart LR
    subgraph "Entradas"
        I1[Visao do Projeto]
        I2[Requisitos de Negocio]
        I3[Restricoes Tecnicas]
        I4[Feedback Stakeholders]
    end

    subgraph "Artefatos Intermediarios"
        A1[project-brief.md]
        A2[prd.md]
        A3[front-end-spec.md]
        A4[front-end-architecture.md]
        A5[sharded_docs/]
        A6[stories/]
    end

    subgraph "Saidas Finais"
        O1[Codigo Implementado]
        O2[Testes]
        O3[Documentacao]
        O4[epic-retrospective.md]
    end

    I1 --> A1
    I2 --> A1
    I3 --> A1
    A1 --> A2
    A2 --> A3
    A3 --> A4
    A4 --> A2
    A2 --> A5
    A4 --> A5
    A5 --> A6
    A6 --> O1
    A6 --> O2
    I4 --> A2
    A6 --> O3
    O1 --> O4
```

### Matriz de Entradas e Saidas por Step

| Step | Entrada | Saida | Localizacao |
|------|---------|-------|-------------|
| 1 | Visao do usuario | `project-brief.md` | `docs/project-brief.md` |
| 2 | `project-brief.md` | `prd.md` | `docs/prd.md` |
| 3 | `prd.md` | `front-end-spec.md` | `docs/front-end-spec.md` |
| 4 | `front-end-spec.md` | Prompt v0 | (externo) |
| 5 | `front-end-spec.md` | `front-end-architecture.md` | `docs/front-end-architecture.md` |
| 6 | Sugestoes arquitetura | `prd.md` atualizado | `docs/prd.md` |
| 7 | Todos artefatos | Validacao | - |
| 8 | Artefatos validados | Docs fragmentados | `docs/prd/`, `docs/architecture/` |
| 9 | Docs fragmentados | `story.md` | `docs/stories/epic-X/` |
| 11 | `story.md` | Codigo + Testes | `src/`, `tests/` |
| 12 | Implementacao | QA Gate | `docs/qa/gates/` |

---

## Pontos de Decisao

### Diagrama de Decisoes

```mermaid
flowchart TD
    D1{Gerar prompt v0?}
    D1 -->|Sim| A1[Usar ferramenta AI externa]
    D1 -->|Nao| A2[Prosseguir para arquitetura]

    D2{Arquitetura sugere mudancas?}
    D2 -->|Sim| B1[PM atualiza PRD]
    D2 -->|Nao| B2[Prosseguir para validacao]

    D3{PO encontrou problemas?}
    D3 -->|Sim| C1[Retornar ao agente relevante]
    D3 -->|Nao| C2[Fragmentar documentos]

    D4{Revisar draft da story?}
    D4 -->|Sim| D1A[Analyst/PM revisa]
    D4 -->|Nao| D1B[Dev implementa diretamente]

    D5{Executar revisao QA?}
    D5 -->|Sim| E1[QA revisa implementacao]
    D5 -->|Nao| E2[Verificar mais stories]

    D6{QA encontrou problemas?}
    D6 -->|Sim| F1[Dev corrige feedback]
    D6 -->|Nao| F2[Prosseguir]

    D7{Mais stories?}
    D7 -->|Sim| G1[Criar proxima story]
    D7 -->|Nao| G2[Verificar retrospectiva]

    D8{Fazer retrospectiva?}
    D8 -->|Sim| H1[PO executa retrospectiva]
    D8 -->|Nao| H2[Projeto completo]
```

### Descricao dos Pontos de Decisao

| Ponto | Condicao | Caminho Sim | Caminho Nao |
|-------|----------|-------------|-------------|
| D1 | Usuario deseja geracao AI | UX gera prompt, usuario usa v0/Lovable | Prossegue para arquitetura |
| D2 | Arquitetura requer mudancas | PM atualiza PRD | Prossegue para validacao PO |
| D3 | PO encontra inconsistencias | Retorna ao agente para correcao | Fragmenta documentos |
| D4 | Usuario quer revisar draft | Analyst/PM valida story | Dev implementa diretamente |
| D5 | Revisao QA desejada | QA executa revisao completa | Verifica proximas stories |
| D6 | QA identificou problemas | Dev corrige e resubmete | Prossegue para proxima story |
| D7 | Existem mais stories | Cria proxima story no ciclo | Verifica retrospectiva |
| D8 | Retrospectiva desejada | PO documenta aprendizados | Projeto finalizado |

---

## Troubleshooting

### Problemas Comuns e Solucoes

#### Fase de Planejamento

| Problema | Causa Provavel | Solucao |
|----------|----------------|---------|
| Brief incompleto | Falta de informacoes do usuario | Executar `*brainstorm` ou `*elicit` antes |
| PRD muito generico | Brief insuficiente | Retornar ao Analyst para enriquecer brief |
| Spec sem detalhes de UX | Requisitos vagos no PRD | PM deve detalhar user journeys no PRD |

#### Fase de Validacao

| Problema | Causa Provavel | Solucao |
|----------|----------------|---------|
| PO rejeita artefatos | Inconsistencia entre docs | Usar po-master-checklist para identificar gaps |
| Muitas iteracoes de correcao | Falta de alinhamento inicial | Garantir revisao cruzada antes do PO |
| Fragmentacao falha | Documentos mal estruturados | Verificar formatacao markdown dos docs |

#### Fase de Desenvolvimento

| Problema | Causa Provavel | Solucao |
|----------|----------------|---------|
| Story muito grande | Epics mal definidos | PM deve quebrar epic em stories menores |
| Dev bloqueado | Story ambigua | SM deve refinar story com mais detalhes |
| QA rejeita repetidamente | Falta de testes | Dev deve incluir testes antes de marcar complete |
| Ciclo infinito Dev-QA | Requisitos em mudanca | Congelar scope da story antes de implementar |

#### Problemas Tecnicos

| Problema | Causa Provavel | Solucao |
|----------|----------------|---------|
| Templates nao encontrados | Path incorreto | Verificar `.aios-core/development/templates/` |
| Agente nao ativa | YAML malformado | Validar sintaxe do arquivo de agente |
| Checklists falham | Dependencias faltando | Verificar `dependencies` no agente |

### Fluxo de Escalacao

```mermaid
flowchart TD
    P[Problema Identificado] --> T1{Problema Tecnico?}
    T1 -->|Sim| D1[Verificar logs e configs]
    T1 -->|Nao| T2{Problema de Processo?}

    D1 --> R1[Resolver ou escalar para DevOps]

    T2 -->|Sim| D2[Revisar workflow step]
    T2 -->|Nao| T3{Problema de Requisitos?}

    D2 --> R2[Ajustar processo ou retornar step]

    T3 -->|Sim| D3[Retornar ao agente responsavel]
    T3 -->|Nao| D4[Consultar usuario para clarificacao]

    D3 --> R3[Re-executar step com ajustes]
    D4 --> R4[Documentar decisao e prosseguir]
```

---

## Referencias

### Arquivos do Workflow

| Arquivo | Caminho |
|---------|---------|
| Definicao do Workflow | `.aios-core/development/workflows/greenfield-ui.yaml` |
| Knowledge Base | `.aios-core/data/aios-kb.md` |

### Agentes

| Agente | Caminho |
|--------|---------|
| @analyst | `.aios-core/development/agents/analyst.md` |
| @pm | `.aios-core/development/agents/pm.md` |
| @ux-expert | `.aios-core/development/agents/ux-design-expert.md` |
| @architect | `.aios-core/development/agents/architect.md` |
| @po | `.aios-core/development/agents/po.md` |
| @sm | `.aios-core/development/agents/sm.md` |
| @dev | `.aios-core/development/agents/dev.md` |
| @qa | `.aios-core/development/agents/qa.md` |

### Templates Principais

| Template | Caminho |
|----------|---------|
| Project Brief | `.aios-core/development/templates/project-brief-tmpl.yaml` |
| PRD | `.aios-core/development/templates/prd-tmpl.yaml` |
| Frontend Spec | `.aios-core/development/templates/front-end-spec-tmpl.yaml` |
| Frontend Architecture | `.aios-core/development/templates/front-end-architecture-tmpl.yaml` |
| Story | `.aios-core/development/templates/story-tmpl.yaml` |

### Checklists

| Checklist | Caminho |
|-----------|---------|
| PO Master | `.aios-core/development/checklists/po-master-checklist.md` |
| Story Draft | `.aios-core/development/checklists/story-draft-checklist.md` |
| Story DoD | `.aios-core/development/checklists/story-dod-checklist.md` |

### Documentacao Relacionada

- [AIOS Knowledge Base](.aios-core/data/aios-kb.md) - Base de conhecimento central
- [Brownfield Workflow](./BROWNFIELD-WORKFLOW.md) - Workflow para projetos existentes (se disponivel)

---

## Historico de Versoes

| Versao | Data | Autor | Mudancas |
|--------|------|-------|----------|
| 1.0 | 2026-02-04 | Documentation Specialist | Versao inicial do guia |

---

*Documento gerado automaticamente a partir de `.aios-core/development/workflows/greenfield-ui.yaml`*
