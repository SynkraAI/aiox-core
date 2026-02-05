# Workflow Greenfield Full-Stack

**Versão:** 1.0.0
**Tipo:** Greenfield
**Última Atualização:** 2026-02-04
**Arquivo Fonte:** `.aios-core/development/workflows/greenfield-fullstack.yaml`

---

## Visão Geral

O **Greenfield Full-Stack Workflow** e o fluxo de trabalho principal do AIOS para construcao de aplicacoes full-stack desde o conceito ate o desenvolvimento. Este workflow suporta tanto planejamento abrangente para projetos complexos quanto prototipagem rapida para projetos simples.

### Tipos de Projeto Suportados

| Tipo | Descricao |
|------|-----------|
| `web-app` | Aplicacoes web modernas |
| `saas` | Software as a Service |
| `enterprise-app` | Aplicacoes corporativas |
| `prototype` | Prototipos e POCs |
| `mvp` | Minimum Viable Products |

### Quando Usar Este Workflow

- Construcao de aplicacoes prontas para producao
- Projetos com multiplos membros na equipe
- Requisitos de funcionalidades complexas
- Necessidade de documentacao abrangente
- Expectativa de manutencao de longo prazo
- Aplicacoes corporativas ou voltadas para clientes

---

## Diagrama Geral do Workflow

```mermaid
flowchart TB
    subgraph PHASE0["FASE 0: Bootstrap do Ambiente"]
        A[Inicio: Projeto Greenfield] --> A1{Ambiente pronto?}
        A1 -->|Nao| A2["@devops: *environment-bootstrap"]
        A2 --> A3[CLIs instaladas + Repositorio GitHub criado]
        A1 -->|Sim| A3
    end

    subgraph PHASE1["FASE 1: Descoberta e Planejamento"]
        A3 --> B["@analyst: project-brief.md"]
        B --> C["@pm: prd.md"]
        C --> D["@ux-expert: front-end-spec.md"]
        D --> D2{Gerar prompt v0?}
        D2 -->|Sim| D3["@ux-expert: criar prompt v0"]
        D2 -->|Nao| E["@architect: fullstack-architecture.md"]
        D3 --> D4[Usuario: gerar UI no v0/Lovable]
        D4 --> E
        E --> F{Arquitetura sugere mudancas no PRD?}
        F -->|Sim| G["@pm: atualizar prd.md"]
        F -->|Nao| H["@po: validar todos os artefatos"]
        G --> H
        H --> I{PO encontrou problemas?}
        I -->|Sim| J[Retornar ao agente relevante para correcoes]
        I -->|Nao| K_GATE[Fase 1 Completa]
        J --> H
    end

    subgraph PHASE2["FASE 2: Fragmentacao de Documentos"]
        K_GATE --> K["@po: fragmentar documentos"]
        K --> K1[Cria: source-tree, tech-stack, coding-standards]
    end

    subgraph PHASE3["FASE 3: Ciclo de Desenvolvimento"]
        K1 --> L["@sm: criar story"]
        L --> M{Revisar story draft?}
        M -->|Sim| N["@analyst/@pm: revisar e aprovar story"]
        M -->|Nao| O["@dev: implementar story"]
        N --> O
        O --> P{Revisao QA?}
        P -->|Sim| Q["@qa: revisar implementacao"]
        P -->|Nao| R{Mais stories?}
        Q --> S{QA encontrou problemas?}
        S -->|Sim| T["@dev: resolver feedback do QA"]
        S -->|Nao| R
        T --> Q
        R -->|Sim| L
        R -->|Nao| U{Retrospectiva do Epic?}
        U -->|Sim| V["@po: retrospectiva do epic"]
        U -->|Nao| W[Projeto Completo]
        V --> W
    end

    %% Caminhos opcionais
    B -.-> B1[Opcional: brainstorming]
    B -.-> B2[Opcional: pesquisa de mercado]
    D -.-> D1[Opcional: pesquisa de usuario]
    E -.-> E1[Opcional: pesquisa tecnica]

    %% Estilos
    style A2 fill:#FF6B6B,color:#fff
    style A3 fill:#FF6B6B,color:#fff
    style W fill:#90EE90
    style K fill:#ADD8E6
    style K1 fill:#ADD8E6
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

---

## Fases do Workflow

### Legenda de Cores

| Cor | Significado |
|-----|-------------|
| Vermelho (#FF6B6B) | Bootstrap do ambiente |
| Laranja claro (#FFE4B5) | Planejamento e documentacao |
| Azul claro (#ADD8E6) | Desenvolvimento e fragmentacao |
| Roxo claro (#E6E6FA) | Geracao de UI com IA |
| Amarelo (#F0E68C) | Revisao e validacao |
| Verde (#90EE90) | Conclusao |

---

## FASE 0: Bootstrap do Ambiente

### Objetivo
Configurar o ambiente de desenvolvimento antes de iniciar o planejamento do projeto.

### Diagrama Detalhado

```mermaid
flowchart TD
    subgraph FASE0["FASE 0: Environment Bootstrap"]
        START([Inicio]) --> CHECK{Ambiente pronto?}

        CHECK -->|Verificar| ENV_REPORT[".aios/environment-report.json existe?"]
        ENV_REPORT -->|Sim| SKIP[Pular bootstrap]
        ENV_REPORT -->|Nao| BOOTSTRAP

        subgraph BOOTSTRAP["@devops: *environment-bootstrap"]
            B1[Detectar Sistema Operacional]
            B2[Auditoria de CLIs]
            B3[Instalacao Interativa]
            B4[Autenticacao de Servicos]
            B5[Inicializacao do Repositorio Git]
            B6[Scaffold da Estrutura do Projeto]
            B7[Geracao do Relatorio de Ambiente]

            B1 --> B2 --> B3 --> B4 --> B5 --> B6 --> B7
        end

        SKIP --> DONE
        B7 --> DONE([Fase 0 Completa])
    end
```

### Step Detalhado

| Step | Agente | Task | Entrada | Saida | Obrigatorio |
|------|--------|------|---------|-------|-------------|
| 1 | @devops (Gage) | `environment-bootstrap.md` | `project_name`, `project_path`, `github_org` | `.aios/config.yaml`, `.aios/environment-report.json`, `.gitignore`, `README.md`, `package.json` | Sim |

### Artefatos Criados

| Arquivo | Descricao |
|---------|-----------|
| `.aios/config.yaml` | Configuracao do projeto AIOS |
| `.aios/environment-report.json` | Relatorio completo do ambiente |
| `.gitignore` | Regras de ignore do Git |
| `README.md` | Documentacao inicial do projeto |
| `package.json` | Configuracao NPM |

### CLIs Verificadas/Instaladas

| Categoria | Ferramenta | Obrigatoria |
|-----------|------------|-------------|
| Essencial | git | Sim |
| Essencial | gh (GitHub CLI) | Sim |
| Essencial | node | Sim |
| Essencial | npm | Sim |
| Infraestrutura | supabase | Recomendada |
| Infraestrutura | railway | Opcional |
| Infraestrutura | docker | Recomendada |
| Qualidade | coderabbit | Recomendada |
| Opcional | pnpm | Opcional |
| Opcional | bun | Opcional |

### Condicoes de Pulo

- Pular apenas se o projeto ja tiver `.aios/environment-report.json`
- Re-executar ao trocar de maquina ou quando novos membros entrarem no projeto

---

## FASE 1: Descoberta e Planejamento

### Objetivo
Criar todos os artefatos de planejamento: project brief, PRD, especificacoes e arquitetura.

### Diagrama Detalhado

```mermaid
flowchart TD
    subgraph FASE1["FASE 1: Discovery & Planning"]
        ENV_DONE([Bootstrap Completo]) --> ANALYST

        subgraph ANALYST["@analyst: Atlas"]
            A1[Brainstorming Opcional]
            A2[Pesquisa de Mercado Opcional]
            A3[Criar Project Brief]
            A1 -.-> A3
            A2 -.-> A3
        end

        ANALYST --> |project-brief.md| PM

        subgraph PM["@pm: Morgan"]
            P1[Revisar Project Brief]
            P2[Criar PRD usando prd-tmpl]
            P1 --> P2
        end

        PM --> |prd.md| UX

        subgraph UX["@ux-expert: Uma"]
            U1[Pesquisa de Usuario Opcional]
            U2[Criar Front-End Spec]
            U3{Gerar prompt v0?}
            U4[Criar prompt para v0/Lovable]
            U1 -.-> U2
            U2 --> U3
            U3 -->|Sim| U4
        end

        UX --> |front-end-spec.md| ARCH

        subgraph ARCH["@architect: Aria"]
            AR1[Pesquisa Tecnica Opcional]
            AR2[Criar Fullstack Architecture]
            AR3{Sugere mudancas no PRD?}
            AR1 -.-> AR2
            AR2 --> AR3
        end

        AR3 -->|Sim| PM_UPDATE["@pm: Atualizar PRD"]
        AR3 -->|Nao| PO
        PM_UPDATE --> PO

        subgraph PO["@po: Pax"]
            PO1[Executar po-master-checklist]
            PO2{Encontrou problemas?}
            PO1 --> PO2
        end

        PO2 -->|Sim| FIX[Retornar ao agente relevante]
        FIX --> PO
        PO2 -->|Nao| DONE([Fase 1 Completa])
    end
```

### Steps Detalhados

| Step | Agente | Task/Template | Entrada | Saida | Obrigatorio |
|------|--------|---------------|---------|-------|-------------|
| 1 | @analyst (Atlas) | `project-brief-tmpl.yaml` | Requisitos do usuario, pesquisa | `project-brief.md` | Sim |
| 2 | @pm (Morgan) | `prd-tmpl.yaml` | `project-brief.md` | `prd.md` | Sim |
| 3 | @ux-expert (Uma) | `front-end-spec-tmpl.yaml` | `prd.md` | `front-end-spec.md` | Sim |
| 4 | @ux-expert (Uma) | `generate-ai-frontend-prompt.md` | `front-end-spec.md` | Prompt para v0/Lovable | Opcional |
| 5 | @architect (Aria) | `fullstack-architecture-tmpl.yaml` | `prd.md`, `front-end-spec.md` | `fullstack-architecture.md` | Sim |
| 6 | @pm (Morgan) | Atualizacao | `fullstack-architecture.md` | `prd.md` atualizado | Condicional |
| 7 | @po (Pax) | `po-master-checklist.md` | Todos os artefatos | Validacao | Sim |

### Artefatos Criados

| Documento | Responsavel | Localizacao |
|-----------|-------------|-------------|
| Project Brief | @analyst | `docs/project-brief.md` |
| PRD | @pm | `docs/prd.md` |
| Front-End Spec | @ux-expert | `docs/front-end-spec.md` |
| Fullstack Architecture | @architect | `docs/fullstack-architecture.md` |

### Steps Opcionais

| Step | Agente | Descricao |
|------|--------|-----------|
| Brainstorming | @analyst | Sessao de ideacao estruturada |
| Pesquisa de Mercado | @analyst | Analise de mercado e competidores |
| Pesquisa de Usuario | @ux-expert | Entrevistas e analise de necessidades |
| Pesquisa Tecnica | @architect | Investigacao de tecnologias |

---

## FASE 2: Fragmentacao de Documentos

### Objetivo
Dividir o PRD e a arquitetura em partes prontas para desenvolvimento.

### Diagrama Detalhado

```mermaid
flowchart TD
    subgraph FASE2["FASE 2: Document Sharding"]
        PHASE1_DONE([Fase 1 Completa]) --> SHARD

        subgraph SHARD["@po: Fragmentar Documentos"]
            S1[Carregar docs/prd.md]
            S2[Identificar secoes nivel 2]
            S3[Extrair cada secao]
            S4[Ajustar niveis de heading]
            S5[Criar arquivos individuais]
            S6[Gerar index.md]

            S1 --> S2 --> S3 --> S4 --> S5 --> S6
        end

        SHARD --> OUTPUT

        subgraph OUTPUT["Artefatos Gerados"]
            O1[docs/prd/index.md]
            O2[docs/prd/*.md - secoes]
            O3[docs/architecture/source-tree.md]
            O4[docs/architecture/tech-stack.md]
            O5[docs/architecture/coding-standards.md]
        end

        OUTPUT --> DONE([Fase 2 Completa])
    end
```

### Step Detalhado

| Step | Agente | Task | Entrada | Saida | Obrigatorio |
|------|--------|------|---------|-------|-------------|
| 1 | @po (Pax) | `shard-doc.md` | `docs/prd.md` | Pasta `docs/prd/` com arquivos fragmentados | Sim |

### Metodo de Fragmentacao

1. **Automatico (Recomendado)**: Usar `md-tree explode {input} {output}`
2. **Manual**: Dividir por secoes de nivel 2 (##)

### Artefatos Criados

| Arquivo | Descricao |
|---------|-----------|
| `docs/prd/index.md` | Indice com links para todas as secoes |
| `docs/prd/*.md` | Secoes individuais do PRD |
| `docs/architecture/source-tree.md` | Estrutura de diretorios do projeto |
| `docs/architecture/tech-stack.md` | Stack tecnologica |
| `docs/architecture/coding-standards.md` | Padroes de codigo |

---

## FASE 3: Ciclo de Desenvolvimento

### Objetivo
Implementacao iterativa de stories com revisao de QA.

### Diagrama Detalhado

```mermaid
flowchart TD
    subgraph FASE3["FASE 3: Development Cycle"]
        PHASE2_DONE([Fase 2 Completa]) --> STORY_LOOP

        subgraph STORY_LOOP["Loop de Stories"]
            SM["@sm: *draft"]
            REVIEW_Q{Revisar draft?}
            REVIEW["@analyst/@pm: Revisar story"]
            DEV["@dev: *develop"]
            QA_Q{Revisao QA?}
            QA["@qa: *review"]
            QA_ISSUES{Problemas encontrados?}
            FIX["@dev: *apply-qa-fixes"]
            MORE_Q{Mais stories?}

            SM --> REVIEW_Q
            REVIEW_Q -->|Sim| REVIEW
            REVIEW_Q -->|Nao| DEV
            REVIEW --> DEV
            DEV --> QA_Q
            QA_Q -->|Sim| QA
            QA_Q -->|Nao| MORE_Q
            QA --> QA_ISSUES
            QA_ISSUES -->|Sim| FIX
            QA_ISSUES -->|Nao| MORE_Q
            FIX --> QA
            MORE_Q -->|Sim| SM
        end

        MORE_Q -->|Nao| RETRO_Q{Retrospectiva?}
        RETRO_Q -->|Sim| RETRO["@po: Retrospectiva do Epic"]
        RETRO_Q -->|Nao| DONE
        RETRO --> DONE([Projeto Completo])
    end
```

### Steps Detalhados

| Step | Agente | Task | Entrada | Saida | Obrigatorio |
|------|--------|------|---------|-------|-------------|
| 1 | @sm (River) | `sm-create-next-story.md` | Docs fragmentados | `{epic}.{story}.story.md` | Sim |
| 2 | @analyst/@pm | Revisao | Story draft | Story aprovada | Opcional |
| 3 | @dev (Dex) | `dev-develop-story.md` | Story aprovada | Implementacao | Sim |
| 4 | @qa (Quinn) | `qa-review-story.md` | Implementacao | Feedback de QA | Opcional |
| 5 | @dev (Dex) | `apply-qa-fixes.md` | Feedback de QA | Correcoes aplicadas | Condicional |
| 6 | @po (Pax) | Retrospectiva | Epic completo | Retrospectiva | Opcional |

### Ciclo de Story

```mermaid
stateDiagram-v2
    [*] --> Draft: @sm cria story
    Draft --> Approved: Revisao opcional
    Draft --> InProgress: Dev aceita
    Approved --> InProgress: Dev inicia
    InProgress --> Review: Dev completa
    Review --> InProgress: QA encontra problemas
    Review --> Done: QA aprova
    Done --> [*]
```

### Status de Story

| Status | Descricao | Proximo Passo |
|--------|-----------|---------------|
| Draft | Story criada pelo SM | Revisao ou desenvolvimento |
| Approved | Story revisada e aprovada | Desenvolvimento |
| In Progress | Em desenvolvimento | Revisao de QA |
| Review | Aguardando revisao | QA ou correcoes |
| Done | Completa e aprovada | Proxima story |

---

## Agentes Participantes

### Tabela de Agentes

| Agente | ID | Icone | Arquetipo | Responsabilidades |
|--------|----|----|-----------|-------------------|
| Gage | @devops | ⚡ | Operator | Bootstrap de ambiente, push Git, releases, CI/CD |
| Atlas | @analyst | 🔍 | Decoder | Pesquisa de mercado, brainstorming, project brief |
| Morgan | @pm | 📋 | Strategist | PRD, estrategia de produto, epics |
| Uma | @ux-expert | 🎨 | Empathizer | Specs de frontend, UX, design systems |
| Aria | @architect | 🏛️ | Visionary | Arquitetura full-stack, decisoes tecnicas |
| Pax | @po | 🎯 | Balancer | Validacao de artefatos, backlog, fragmentacao |
| River | @sm | 🌊 | Facilitator | Criacao de stories, sprint planning |
| Dex | @dev | 💻 | Builder | Implementacao de codigo, testes |
| Quinn | @qa | ✅ | Guardian | Revisao de qualidade, testes, gates |

### Diagrama de Interacao entre Agentes

```mermaid
graph LR
    subgraph Planejamento
        ANALYST[🔍 Atlas<br>@analyst]
        PM[📋 Morgan<br>@pm]
        UX[🎨 Uma<br>@ux-expert]
        ARCH[🏛️ Aria<br>@architect]
    end

    subgraph Governanca
        PO[🎯 Pax<br>@po]
        SM[🌊 River<br>@sm]
    end

    subgraph Execucao
        DEV[💻 Dex<br>@dev]
        QA[✅ Quinn<br>@qa]
        DEVOPS[⚡ Gage<br>@devops]
    end

    ANALYST -->|project-brief| PM
    PM -->|prd| UX
    UX -->|front-end-spec| ARCH
    ARCH -->|arquitetura| PO
    PO -->|stories| SM
    SM -->|story| DEV
    DEV -->|implementacao| QA
    QA -->|feedback| DEV
    DEV -->|pronto| DEVOPS

    PM -.->|atualiza PRD| ARCH
    PO -.->|valida| PM
    PO -.->|valida| ARCH
```

---

## Tasks Executadas

### Lista Completa de Tasks

| Fase | Task | Agente | Arquivo |
|------|------|--------|---------|
| 0 | Environment Bootstrap | @devops | `environment-bootstrap.md` |
| 1 | Create Document | @analyst, @pm, @ux-expert, @architect | `create-doc.md` |
| 1 | Facilitate Brainstorming | @analyst | `facilitate-brainstorming-session.md` |
| 1 | Deep Research Prompt | @analyst, @pm, @architect | `create-deep-research-prompt.md` |
| 1 | Generate AI Frontend Prompt | @ux-expert | `generate-ai-frontend-prompt.md` |
| 1 | Execute Checklist | @po | `execute-checklist.md` |
| 2 | Shard Document | @po | `shard-doc.md` |
| 3 | Create Next Story | @sm | `sm-create-next-story.md` |
| 3 | Develop Story | @dev | `dev-develop-story.md` |
| 3 | Review Story | @qa | `qa-review-story.md` |
| 3 | Apply QA Fixes | @dev | `apply-qa-fixes.md` |

### Templates Utilizados

| Template | Agente | Propósito |
|----------|--------|-----------|
| `project-brief-tmpl.yaml` | @analyst | Estrutura do project brief |
| `prd-tmpl.yaml` | @pm | Estrutura do PRD |
| `front-end-spec-tmpl.yaml` | @ux-expert | Especificacao de frontend |
| `fullstack-architecture-tmpl.yaml` | @architect | Arquitetura completa |
| `story-tmpl.yaml` | @sm | Template de user story |

### Checklists Utilizados

| Checklist | Agente | Proposito |
|-----------|--------|-----------|
| `po-master-checklist.md` | @po | Validacao de todos os artefatos |
| `story-draft-checklist.md` | @sm | Qualidade da story draft |
| `story-dod-checklist.md` | @dev | Definition of Done |

---

## Pre-requisitos

### Requisitos de Sistema

| Requisito | Minimo | Recomendado |
|-----------|--------|-------------|
| Windows | 10 1809+ | 11 |
| macOS | 12+ | 14+ |
| Linux | Ubuntu 20.04+ | Ubuntu 22.04+ |
| Node.js | 18.x | 20.x |
| Git | 2.x | 2.43+ |

### Ferramentas Obrigatorias

| Ferramenta | Comando de Verificacao | Instalacao |
|------------|------------------------|------------|
| Git | `git --version` | Nativo do sistema |
| GitHub CLI | `gh --version` | `winget install GitHub.cli` |
| Node.js | `node --version` | `winget install OpenJS.NodeJS.LTS` |
| npm | `npm --version` | Incluido com Node.js |

### Autenticacoes Necessarias

| Servico | Comando de Login | Verificacao |
|---------|------------------|-------------|
| GitHub | `gh auth login` | `gh auth status` |
| Supabase | `supabase login` | `supabase projects list` |
| Railway | `railway login` | `railway whoami` |

---

## Entradas e Saidas

### Fluxo de Dados

```mermaid
flowchart LR
    subgraph Entradas
        I1[Requisitos do Usuario]
        I2[Pesquisa de Mercado]
        I3[Feedback de Usuarios]
    end

    subgraph Fase0["Fase 0"]
        E1[.aios/config.yaml]
        E2[Repositorio GitHub]
    end

    subgraph Fase1["Fase 1"]
        P1[project-brief.md]
        P2[prd.md]
        P3[front-end-spec.md]
        P4[fullstack-architecture.md]
    end

    subgraph Fase2["Fase 2"]
        S1[docs/prd/*.md]
        S2[source-tree.md]
        S3[tech-stack.md]
        S4[coding-standards.md]
    end

    subgraph Fase3["Fase 3"]
        D1[Stories .md]
        D2[Codigo fonte]
        D3[Testes]
    end

    subgraph Saidas
        O1[Aplicacao Completa]
        O2[Documentacao]
        O3[Testes Automatizados]
    end

    I1 --> E1
    I2 --> P1
    I3 --> P1

    E1 --> P1
    E2 --> P1
    P1 --> P2
    P2 --> P3
    P3 --> P4

    P2 --> S1
    P4 --> S2
    P4 --> S3
    P4 --> S4

    S1 --> D1
    S2 --> D2
    S3 --> D2
    S4 --> D2
    D1 --> D2
    D2 --> D3

    D2 --> O1
    D1 --> O2
    D3 --> O3
```

### Matriz de Entradas/Saidas por Fase

| Fase | Entrada | Saida |
|------|---------|-------|
| 0 | Nome do projeto, organizacao GitHub | Config AIOS, repo Git, estrutura de pastas |
| 1 | Requisitos, pesquisa | Brief, PRD, specs, arquitetura |
| 2 | PRD, arquitetura | Documentos fragmentados, indexes |
| 3 | Stories, docs fragmentados | Codigo, testes, aplicacao |

---

## Pontos de Decisao

### Tabela de Decisoes

| Fase | Ponto de Decisao | Opcoes | Criterio |
|------|------------------|--------|----------|
| 0 | Ambiente pronto? | Pular / Executar bootstrap | Existencia de `.aios/environment-report.json` |
| 1 | Gerar prompt v0? | Sim / Nao | Usuario quer geracao de UI com IA |
| 1 | Arquitetura sugere mudancas? | Atualizar PRD / Continuar | Recomendacao do arquiteto |
| 1 | PO encontrou problemas? | Corrigir / Aprovar | Resultado do checklist |
| 3 | Revisar story draft? | Revisar / Pular para dev | Complexidade da story |
| 3 | Revisao QA? | Sim / Nao | Criticidade da story |
| 3 | Mais stories? | Continuar / Finalizar | Backlog do epic |
| 3 | Retrospectiva? | Sim / Nao | Epic completo |

### Fluxograma de Decisoes

```mermaid
flowchart TD
    D1{Ambiente pronto?}
    D1 -->|Verificar .aios/environment-report.json| D1_CHECK
    D1_CHECK -->|Existe| SKIP[Pular Fase 0]
    D1_CHECK -->|Nao existe| RUN[Executar Bootstrap]

    D2{Gerar prompt v0?}
    D2 -->|Usuario quer UI gerada| D2_YES[Gerar prompt]
    D2 -->|Nao necessario| D2_NO[Ir para arquitetura]

    D3{Mudancas no PRD?}
    D3 -->|Arquiteto recomenda| D3_YES[Atualizar PRD]
    D3 -->|Nao necessario| D3_NO[Continuar validacao]

    D4{Problemas encontrados?}
    D4 -->|PO encontrou issues| D4_YES[Corrigir com agente]
    D4 -->|Tudo OK| D4_NO[Aprovar e continuar]
```

---

## Troubleshooting

### Problemas Comuns

#### Fase 0: Bootstrap do Ambiente

| Problema | Causa | Solucao |
|----------|-------|---------|
| `winget` nao reconhecido | Windows desatualizado | Atualizar Windows ou usar `choco`/`scoop` |
| `gh auth login` falha | Conexao ou proxy | Verificar internet, configurar proxy |
| Permissao negada no repositorio | Token sem escopo | Re-autenticar com `--scopes repo,workflow` |
| Docker nao inicia | Servico parado | Iniciar Docker Desktop |

#### Fase 1: Planejamento

| Problema | Causa | Solucao |
|----------|-------|---------|
| Template nao encontrado | Caminho incorreto | Verificar `.aios-core/development/templates/` |
| Conflito entre PRD e arquitetura | Requisitos divergentes | Reunir PM e Architect para alinhar |
| Checklist falha | Artefatos incompletos | Retornar ao agente responsavel |

#### Fase 2: Fragmentacao

| Problema | Causa | Solucao |
|----------|-------|---------|
| `md-tree` nao encontrado | Nao instalado | `npm install -g @kayvan/markdown-tree-parser` |
| Secoes nao detectadas | Formato incorreto | Verificar headings `##` no documento |
| Conteudo perdido | Code blocks com `##` | Usar metodo manual com parsing correto |

#### Fase 3: Desenvolvimento

| Problema | Causa | Solucao |
|----------|-------|---------|
| Story incompleta | SM pulou campos | Executar `story-draft-checklist` |
| Testes falhando | Codigo quebrado | @dev executar `*run-tests` |
| QA bloqueando | Issues CRITICAL | Resolver com @dev antes de prosseguir |
| Epic nao encontrado no ClickUp | Task nao criada | Criar Epic com tags corretas |

### Comandos de Diagnostico

```bash
# Verificar ambiente
cat .aios/environment-report.json

# Verificar CLIs
git --version && gh --version && node --version

# Verificar autenticacao
gh auth status
supabase projects list
railway whoami

# Verificar estrutura do projeto
ls -la .aios/
ls -la docs/
```

---

## Handoff Prompts

### Transicoes entre Fases

| De | Para | Prompt de Handoff |
|----|------|-------------------|
| Fase 0 | Fase 1 | "Bootstrap do ambiente completo! Repo Git criado, CLIs verificadas, estrutura do projeto pronta. Inicie um novo chat com @analyst para criar o project brief." |
| @analyst | @pm | "Project brief completo. Salve como `docs/project-brief.md` no seu projeto, depois crie o PRD." |
| @pm | @ux-expert | "PRD pronto. Salve como `docs/prd.md` no seu projeto, depois crie a especificacao de UI/UX." |
| @ux-expert | @architect | "Spec de UI/UX completa. Salve como `docs/front-end-spec.md` no seu projeto, depois crie a arquitetura fullstack." |
| @architect | @po | "Arquitetura completa. Salve como `docs/fullstack-architecture.md`. Voce sugere mudancas nas stories do PRD ou precisa de novas stories?" |
| Fase 1 | Fase 2 | "Todos os artefatos de planejamento validados. Agora fragmente documentos para desenvolvimento: @po → *shard-doc docs/prd.md" |
| Fase 2 | Fase 3 | "Documentos fragmentados! source-tree.md, tech-stack.md, coding-standards.md criados. Inicie desenvolvimento: @sm → *draft" |
| Conclusao | - | "Todas as stories implementadas e revisadas. Fase de desenvolvimento do projeto completa!" |

---

## Referencias

### Arquivos Relacionados

| Tipo | Arquivo | Descricao |
|------|---------|-----------|
| Workflow | `.aios-core/development/workflows/greenfield-fullstack.yaml` | Definicao do workflow |
| Task | `.aios-core/development/tasks/environment-bootstrap.md` | Bootstrap do ambiente |
| Task | `.aios-core/development/tasks/shard-doc.md` | Fragmentacao de documentos |
| Task | `.aios-core/development/tasks/sm-create-next-story.md` | Criacao de stories |
| Agente | `.aios-core/development/agents/*.md` | Definicoes de agentes |
| Template | `.aios-core/development/templates/*.yaml` | Templates de documentos |
| Checklist | `.aios-core/development/checklists/*.md` | Checklists de validacao |

### Documentacao Externa

| Recurso | URL |
|---------|-----|
| GitHub CLI | https://cli.github.com/manual/ |
| Supabase CLI | https://supabase.com/docs/guides/cli |
| Railway CLI | https://docs.railway.app/reference/cli-api |
| CodeRabbit | https://coderabbit.ai/docs |

---

## Historico de Versoes

| Versao | Data | Alteracoes |
|--------|------|------------|
| 1.0.0 | 2026-02-04 | Documentacao inicial completa |

---

**Mantido por:** AIOS Development Team
**Ultima Revisao:** 2026-02-04
