# Spec Pipeline Workflow - Documentação Completa

> **Versão:** 1.0
> **Criado:** 2026-01-28
> **Autor:** @architect (Aria)
> **Epic:** Epic 3 - Spec Pipeline
> **Status:** Ativo

---

## 1. Visão Geral

O **Spec Pipeline** e um workflow orquestrado que transforma requisitos informais em especificações executaveis. Ele e parte da infraestrutura **Auto-Claude ADE** (Autonomous Development Engine) e implementa um fluxo de 5 fases principais que se adaptam dinamicamente baseado na complexidade do requisito.

### 1.1 Propósito

- Transformar descricoes informais de usuarios em especificações formais e estruturadas
- Garantir qualidade e consistencia atraves de gates de validação
- Adaptar o nivel de profundidade baseado na complexidade detectada
- Produzir artefatos rastreavies desde requisitos ate implementação

### 1.2 Principios Fundamentais

| Principio | Descrição |
|-----------|-----------|
| **No Invention** | Nenhuma informação inventada - apenas derivação dos inputs |
| **Traceability** | Todo statement deve rastrear para um requisito ou pesquisa |
| **Adaptive Phases** | Fases ajustadas automaticamente pela complexidade |
| **Quality Gates** | Validacao obrigatoria antes de avancar |

---

## 2. Diagrama do Workflow

### 2.1 Fluxo Principal

```mermaid
flowchart TB
    subgraph TRIGGER["Gatilhos"]
        T1["*create-spec STORY-ID"]
        T2["story_created<br/>(autoSpec.enabled)"]
    end

    subgraph PREFLIGHT["Pre-Flight Checks"]
        PF1["story_exists<br/>Verificar/criar diretorio"]
        PF2["no_existing_spec<br/>Evitar sobrescrita"]
        PF3["agents_available<br/>Verificar configuracao"]
    end

    subgraph PHASE1["Fase 1: Gather Requirements"]
        direction TB
        G1["@pm (Morgan)"]
        G2["Elicitação Interativa<br/>9 categorias de perguntas"]
        G3["requirements.json"]
        G1 --> G2 --> G3
    end

    subgraph PHASE2["Fase 2: Assess Complexity"]
        direction TB
        A1["@architect (Aria)"]
        A2["Avaliar 5 dimensoes:<br/>Scope, Integration, Infra,<br/>Knowledge, Risk"]
        A3["complexity.json<br/>SIMPLE | STANDARD | COMPLEX"]
        A1 --> A2 --> A3
    end

    subgraph PHASE3["Fase 3: Research Dependencies"]
        direction TB
        R1["@analyst (Atlas)"]
        R2["Context7 + EXA<br/>Validar dependencias"]
        R3["research.json"]
        R1 --> R2 --> R3
    end

    subgraph PHASE4["Fase 4: Write Specification"]
        direction TB
        W1["@pm (Morgan)"]
        W2["Gerar spec.md<br/>Sem invencao"]
        W3["spec.md"]
        W1 --> W2 --> W3
    end

    subgraph PHASE5["Fase 5: Critique Specification"]
        direction TB
        C1["@qa (Quinn)"]
        C2["Avaliar 5 dimensoes:<br/>Accuracy, Completeness,<br/>Consistency, Feasibility,<br/>Alignment"]
        C3{"Verdict"}
        C4["APPROVED"]
        C5["NEEDS_REVISION"]
        C6["BLOCKED"]
        C1 --> C2 --> C3
        C3 --> C4
        C3 --> C5
        C3 --> C6
    end

    subgraph PHASE5B["Fase 5b: Revise (COMPLEX)"]
        REV1["@pm (Morgan)"]
        REV2["Aplicar feedback<br/>e auto-fixes"]
    end

    subgraph PHASE6["Fase 6: Create Plan"]
        direction TB
        P1["@architect (Aria)"]
        P2["Gerar implementation.yaml<br/>Subtasks atomicas"]
        P3["plan.json"]
        P1 --> P2 --> P3
    end

    subgraph COMPLETION["Conclusão"]
        DONE["Pipeline Complete"]
        ARTIFACTS["Artefatos Gerados"]
    end

    T1 --> PREFLIGHT
    T2 --> PREFLIGHT
    PREFLIGHT --> PHASE1
    PHASE1 --> PHASE2
    PHASE2 --> PHASE3
    PHASE3 --> PHASE4
    PHASE4 --> PHASE5
    C4 --> PHASE6
    C5 --> PHASE5B
    PHASE5B --> PHASE5
    C6 -.-> |"Escalar para @architect"| HALT["HALT"]
    PHASE6 --> COMPLETION

    style TRIGGER fill:#e1f5fe
    style PREFLIGHT fill:#fff3e0
    style PHASE1 fill:#e8f5e9
    style PHASE2 fill:#fce4ec
    style PHASE3 fill:#f3e5f5
    style PHASE4 fill:#e8f5e9
    style PHASE5 fill:#fff8e1
    style PHASE5B fill:#ffebee
    style PHASE6 fill:#e0f2f1
    style COMPLETION fill:#c8e6c9
```

### 2.2 Fluxo por Complexidade

```mermaid
flowchart LR
    subgraph SIMPLE["SIMPLE (score <= 8)"]
        S1["Gather"] --> S2["Spec"] --> S3["Critique"]
    end

    subgraph STANDARD["STANDARD (score 9-15)"]
        ST1["Gather"] --> ST2["Assess"] --> ST3["Research"] --> ST4["Spec"] --> ST5["Critique"] --> ST6["Plan"]
    end

    subgraph COMPLEX["COMPLEX (score >= 16)"]
        C1["Gather"] --> C2["Assess"] --> C3["Research"] --> C4["Spec"] --> C5["Critique 1"] --> C6["Revise"] --> C7["Critique 2"] --> C8["Plan"]
    end

    style SIMPLE fill:#c8e6c9
    style STANDARD fill:#fff9c4
    style COMPLEX fill:#ffcdd2
```

### 2.3 Diagrama de Sequência

```mermaid
sequenceDiagram
    autonumber
    participant U as Usuario
    participant PM as @pm (Morgan)
    participant AR as @architect (Aria)
    participant AN as @analyst (Atlas)
    participant QA as @qa (Quinn)
    participant FS as File System

    U->>PM: *create-spec STORY-42

    Note over PM: Fase 1: Gather
    PM->>U: Perguntas de elicitacao (9 categorias)
    U->>PM: Respostas dos requisitos
    PM->>FS: Salvar requirements.json

    Note over AR: Fase 2: Assess
    AR->>FS: Ler requirements.json
    AR->>AR: Avaliar 5 dimensoes de complexidade
    AR->>FS: Salvar complexity.json

    alt Complexidade != SIMPLE
        Note over AN: Fase 3: Research
        AN->>FS: Ler requirements + complexity
        AN->>AN: Pesquisar via Context7 + EXA
        AN->>FS: Salvar research.json
    end

    Note over PM: Fase 4: Write Spec
    PM->>FS: Ler todos os artefatos
    PM->>PM: Gerar spec.md (sem invencao)
    PM->>FS: Salvar spec.md

    Note over QA: Fase 5: Critique
    QA->>FS: Ler spec + requirements
    QA->>QA: Avaliar 5 dimensoes de qualidade
    QA->>FS: Salvar critique.json

    alt Verdict = APPROVED
        Note over AR: Fase 6: Plan
        AR->>FS: Ler spec aprovado
        AR->>AR: Gerar plano de implementação
        AR->>FS: Salvar plan.json
        AR->>U: Pipeline Complete!
    else Verdict = NEEDS_REVISION
        QA->>PM: Retornar com feedback
        PM->>PM: Aplicar correcoes
        PM->>QA: Submeter revisao
    else Verdict = BLOCKED
        QA->>AR: Escalar para revisao arquitetural
    end
```

---

## 3. Steps Detalhados

### 3.1 Fase 1: Gather Requirements

| Atributo | Valor |
|----------|-------|
| **Step ID** | `gather` |
| **Phase Number** | 1 |
| **Agente** | @pm (Morgan) |
| **Task** | `spec-gather-requirements.md` |
| **Elicit** | Sim - requer interação do usuario |

#### Inputs

| Input | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `storyId` | string | Sim | ID da story sendo especificada |
| `source` | enum | Não | Fonte: `prd`, `user`, `existing` |
| `prdPath` | string | Não | Caminho para PRD se source=prd |

#### Outputs

| Output | Localização |
|--------|-------------|
| `requirements.json` | `docs/stories/{storyId}/spec/requirements.json` |

#### Processo de Elicitação (9 Categorias)

```mermaid
mindmap
  root((Elicitação))
    Funcionais
      Q1: O que o sistema deve FAZER?
      Follow-ups sobre usuarios e triggers
    Restrições
      Q2: Restrições tecnicas/negocio?
      Tempo, integrações, stack
    NFR
      Q3: Requisitos nao-funcionais?
      Performance, seguranca, escala
    Aceite
      Q4: Criterios de aceite?
      Formato Given-When-Then
    Suposições
      Q5: Suposições assumidas?
      Riscos se estiverem erradas
    Dominio
      Q6: Entidades e relacionamentos?
      Modelo de dominio
    Interação
      Q7: Como usuario interage?
      Fluxos UX, estados
    Edge Cases
      Q8: O que pode dar errado?
      Tratamento de erros
    Terminologia
      Q9: Glossario do dominio?
      Termos especificos
```

#### Estrutura do Output (requirements.json)

```json
{
  "storyId": "STORY-42",
  "gatheredAt": "2026-01-28T10:00:00Z",
  "source": "user",
  "gatheredBy": "@pm",
  "elicitationVersion": "2.0",
  "functional": [
    {
      "id": "FR-1",
      "description": "Permitir login com Google OAuth",
      "priority": "P0",
      "rationale": "Principal metodo de autenticação",
      "acceptance": ["AC-1"]
    }
  ],
  "nonFunctional": [...],
  "constraints": [...],
  "assumptions": [...],
  "domainModel": [...],
  "interactions": [...],
  "edgeCases": [...],
  "terminology": [...],
  "openQuestions": [...]
}
```

---

### 3.2 Fase 2: Assess Complexity

| Atributo | Valor |
|----------|-------|
| **Step ID** | `assess` |
| **Phase Number** | 2 |
| **Agente** | @architect (Aria) |
| **Task** | `spec-assess-complexity.md` |
| **Skip Condition** | `source === 'simple'` OR `overrideComplexity === 'SIMPLE'` |

#### Inputs

| Input | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `storyId` | string | Sim | ID da story |
| `requirements` | file | Sim | requirements.json |
| `overrideComplexity` | enum | Não | Override manual: SIMPLE, STANDARD, COMPLEX |

#### Outputs

| Output | Localização |
|--------|-------------|
| `complexity.json` | `docs/stories/{storyId}/spec/complexity.json` |

#### 5 Dimensões de Complexidade

```mermaid
radar
    title Dimensões de Complexidade (1-5)
    "Scope" : 3
    "Integration" : 4
    "Infrastructure" : 2
    "Knowledge" : 3
    "Risk" : 3
```

| Dimensão | Score 1 | Score 3 | Score 5 |
|----------|---------|---------|---------|
| **Scope** | 1-2 arquivos | 6-10 arquivos | 20+ arquivos |
| **Integration** | Nenhuma externa | 1-2 APIs externas | Orquestração multipla |
| **Infrastructure** | Nenhuma mudança | Nova dependencia | Nova infraestrutura |
| **Knowledge** | Padroes existentes | Nova biblioteca | Dominio desconhecido |
| **Risk** | Baixo, isolado | Medio, importante | Critico, core do sistema |

#### Thresholds de Classificação

| Classificação | Score Total | Fases Ativadas | Tempo Estimado |
|---------------|-------------|----------------|----------------|
| **SIMPLE** | <= 8 | gather, spec, critique | 30-60 min |
| **STANDARD** | 9-15 | gather, assess, research, spec, critique, plan | 2-4 horas |
| **COMPLEX** | >= 16 | + revise, critique_2 | 4-8 horas |

---

### 3.3 Fase 3: Research Dependencies

| Atributo | Valor |
|----------|-------|
| **Step ID** | `research` |
| **Phase Number** | 3 |
| **Agente** | @analyst (Atlas) |
| **Task** | `spec-research-dependencies.md` |
| **Skip Condition** | `complexity.result === 'SIMPLE'` |
| **Tools** | Context7, EXA |

#### Inputs

| Input | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `storyId` | string | Sim | ID da story |
| `requirements` | file | Sim | requirements.json |
| `complexity` | file | Sim | complexity.json |

#### Outputs

| Output | Localização |
|--------|-------------|
| `research.json` | `docs/stories/{storyId}/spec/research.json` |

#### Fluxo de Pesquisa

```mermaid
flowchart LR
    subgraph Extract["1. Extrair Alvos"]
        E1["Libraries<br/>APIs<br/>Concepts<br/>Infrastructure"]
    end

    subgraph Check["2. Verificar Codebase"]
        C1["package.json"]
        C2["imports existentes"]
        C3["padroes similares"]
    end

    subgraph Research["3. Pesquisar"]
        R1["Context7<br/>(Primario)"]
        R2["EXA<br/>(Fallback)"]
    end

    subgraph Validate["4. Validar"]
        V1["technical-preferences.md"]
        V2["Conflitos?<br/>Alternativas?"]
    end

    subgraph Output["5. Output"]
        O1["research.json"]
    end

    Extract --> Check --> Research --> Validate --> Output

    style Research fill:#e3f2fd
```

#### Prioridade de Ferramentas

| Ferramenta | Prioridade | Timeout | Uso |
|------------|------------|---------|-----|
| **Context7** | 1 (primaria) | 30s | Documentação de bibliotecas |
| **EXA** | 2 (fallback) | - | Pesquisa web geral |
| **Codebase** | - | - | Verificar implementações existentes |

---

### 3.4 Fase 4: Write Specification

| Atributo | Valor |
|----------|-------|
| **Step ID** | `spec` |
| **Phase Number** | 4 |
| **Agente** | @pm (Morgan) |
| **Task** | `spec-write-spec.md` |
| **Constitutional Gate** | Article IV - No Invention |

#### Inputs

| Input | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `storyId` | string | Sim | ID da story |
| `requirements` | file | Sim | requirements.json |
| `complexity` | file | Não | complexity.json |
| `research` | file | Não | research.json |

#### Outputs

| Output | Localização |
|--------|-------------|
| `spec.md` | `docs/stories/{storyId}/spec/spec.md` |

#### Constitutional Gate: No Invention

```mermaid
flowchart TB
    subgraph RULE["Regra Article IV - No Invention"]
        direction TB
        R1["Todo statement DEVE rastrear para:"]
        R2["FR-* (Requisito Funcional)"]
        R3["NFR-* (Requisito Não-Funcional)"]
        R4["CON-* (Restrição)"]
        R5["Research finding verificado"]
    end

    subgraph VIOLATION["Violações"]
        V1["Adicionar features nao listadas"]
        V2["Assumir detalhes nao pesquisados"]
        V3["Especificar tech nao validada"]
        V4["Criar criterios de aceite inventados"]
    end

    subgraph ACTION["Ação em Violacao"]
        A1["BLOCK"]
        A2["Remover conteudo inventado"]
        A3["OU adicionar a Open Questions"]
    end

    RULE --> |"Se violado"| VIOLATION
    VIOLATION --> ACTION

    style RULE fill:#c8e6c9
    style VIOLATION fill:#ffcdd2
    style ACTION fill:#fff9c4
```

#### Estrutura do spec.md

```
1. Overview
   1.1 Goals
   1.2 Non-Goals
2. Requirements Summary
   2.1 Functional Requirements
   2.2 Non-Functional Requirements
   2.3 Constraints
3. Technical Approach
   3.1 Architecture Overview
   3.2 Component Design
   3.3 Data Flow
4. Dependencies
   4.1 External Dependencies
   4.2 Internal Dependencies
5. Files to Modify/Create
   5.1 New Files
   5.2 Modified Files
6. Testing Strategy
   6.1 Unit Tests
   6.2 Integration Tests
   6.3 Acceptance Tests (Given-When-Then)
7. Risks & Mitigations
8. Open Questions
9. Implementation Checklist
```

---

### 3.5 Fase 5: Critique Specification

| Atributo | Valor |
|----------|-------|
| **Step ID** | `critique` |
| **Phase Number** | 5 |
| **Agente** | @qa (Quinn) |
| **Task** | `spec-critique.md` |
| **Gate** | Blocking (APPROVED/NEEDS_REVISION/BLOCKED) |

#### Inputs

| Input | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `storyId` | string | Sim | ID da story |
| `spec` | file | Sim | spec.md |
| `requirements` | file | Sim | requirements.json |
| `complexity` | file | Não | complexity.json |
| `research` | file | Não | research.json |

#### Outputs

| Output | Localização |
|--------|-------------|
| `critique.json` | `docs/stories/{storyId}/spec/critique.json` |

#### 5 Dimensões de Qualidade

```mermaid
pie showData
    title Peso das Dimensões
    "Accuracy" : 25
    "Completeness" : 25
    "Consistency" : 20
    "Feasibility" : 15
    "Alignment" : 15
```

| Dimensão | Peso | Verifica |
|----------|------|----------|
| **Accuracy** | 25% | Spec reflete requisitos corretamente? |
| **Completeness** | 25% | Todas secoes preenchidas? Tests cobrem FRs? |
| **Consistency** | 20% | IDs validos? Sem contradicoes? |
| **Feasibility** | 15% | Tecnicamente possivel? Dependencias existem? |
| **Alignment** | 15% | Alinhado com stack e padroes do projeto? |

#### Lógica de Verdict

```mermaid
flowchart TB
    START["Iniciar Avaliacao"] --> EVAL["Avaliar 5 Dimensões"]

    EVAL --> CHECK1{"HIGH severity<br/>issues?"}
    CHECK1 -->|Sim| BLOCKED["BLOCKED"]
    CHECK1 -->|Não| CHECK2{"Average<br/>score >= 4.0?"}

    CHECK2 -->|Sim| CHECK3{"Todas dimensoes<br/>>= 3?"}
    CHECK3 -->|Sim| APPROVED["APPROVED"]
    CHECK3 -->|Não| NEEDS["NEEDS_REVISION"]

    CHECK2 -->|Não| CHECK4{"Average<br/>score >= 3.0?"}
    CHECK4 -->|Sim| NEEDS
    CHECK4 -->|Não| BLOCKED

    APPROVED --> PLAN["Ir para Fase 6: Plan"]
    NEEDS --> REVISE["Retornar para Fase 4"]
    BLOCKED --> HALT["HALT + Escalar @architect"]

    style APPROVED fill:#c8e6c9
    style NEEDS fill:#fff9c4
    style BLOCKED fill:#ffcdd2
```

| Verdict | Condição | Próxima Ação |
|---------|----------|--------------|
| **APPROVED** | No HIGH issues, avg >= 4.0, all >= 3 | Ir para Plan |
| **NEEDS_REVISION** | MEDIUM issues OR avg 3.0-3.9 | Retornar para Spec Write |
| **BLOCKED** | HIGH issues OR avg < 3.0 OR any <= 1 | Escalar para @architect |

---

### 3.6 Fase 5b: Revise Specification

| Atributo | Valor |
|----------|-------|
| **Step ID** | `revise` |
| **Phase Number** | 5b |
| **Agente** | @pm (Morgan) |
| **Condition** | `complexity.result === 'COMPLEX'` OR `critique.verdict === 'NEEDS_REVISION'` |

#### Inputs

| Input | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `storyId` | string | Sim | ID da story |
| `spec` | file | Sim | spec.md atual |
| `critique` | file | Sim | critique.json com feedback |

#### Outputs

| Output | Localização |
|--------|-------------|
| `spec.md` (updated) | `docs/stories/{storyId}/spec/spec.md` |

---

### 3.7 Fase 5c: Second Critique

| Atributo | Valor |
|----------|-------|
| **Step ID** | `critique_2` |
| **Phase Number** | 5c |
| **Agente** | @qa (Quinn) |
| **Task** | `spec-critique.md` |
| **Condition** | `complexity.result === 'COMPLEX'` |

> **Nota:** Segunda critica e mais leniente em issues MEDIUM se houver melhoria demonstrada.

---

### 3.8 Fase 6: Create Implementation Plan

| Atributo | Valor |
|----------|-------|
| **Step ID** | `plan` |
| **Phase Number** | 6 |
| **Agente** | @architect (Aria) |
| **Task** | `plan-create-implementation.md` |
| **Condition** | `critique.verdict === 'APPROVED'` |

#### Inputs

| Input | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `storyId` | string | Sim | ID da story |
| `spec` | file | Sim | spec.md aprovado |
| `complexity` | file | Não | complexity.json |

#### Outputs

| Output | Localização |
|--------|-------------|
| `plan.json` | `docs/stories/{storyId}/plan/implementation.yaml` |

#### Regras de Subtasks

| Regra | Descrição |
|-------|-----------|
| **Single Service** | 1 servico por subtask (frontend, backend, database, infra) |
| **File Limit** | Maximo 3 arquivos por subtask |
| **Verification Required** | Cada subtask DEVE ter verificacao definida |
| **Dependency Order** | Database > Backend > Frontend > Integration |

---

## 4. Agentes Participantes

```mermaid
graph LR
    subgraph AGENTS["Agentes do Spec Pipeline"]
        PM["@pm<br/>Morgan<br/>Product Manager"]
        AR["@architect<br/>Aria<br/>Architect"]
        AN["@analyst<br/>Atlas<br/>Business Analyst"]
        QA["@qa<br/>Quinn<br/>Test Architect"]
    end

    PM --> |"Fase 1, 4, 5b"| G1["Gather<br/>Write Spec<br/>Revise"]
    AR --> |"Fase 2, 6"| G2["Assess<br/>Plan"]
    AN --> |"Fase 3"| G3["Research"]
    QA --> |"Fase 5, 5c"| G4["Critique"]

    style PM fill:#e8f5e9
    style AR fill:#fce4ec
    style AN fill:#f3e5f5
    style QA fill:#fff8e1
```

| Agente | ID | Nome | Papel no Pipeline | Fases |
|--------|-----|------|-------------------|-------|
| @pm | pm | Morgan | Product Manager | 1 (Gather), 4 (Spec), 5b (Revise) |
| @architect | architect | Aria | System Architect | 2 (Assess), 6 (Plan) |
| @analyst | analyst | Atlas | Business Analyst | 3 (Research) |
| @qa | qa | Quinn | Test Architect | 5 (Critique), 5c (Critique 2) |

### 4.1 Perfil: @pm (Morgan)

- **Arquetipo:** Strategist
- **Foco:** Coleta de requisitos, criação de especificações, documentação
- **Principios:** User-focused, data-informed, clarity & precision
- **Ferramentas:** Templates de PRD, elicitacao estruturada

### 4.2 Perfil: @architect (Aria)

- **Arquetipo:** Visionary
- **Foco:** Arquitetura de sistemas, avaliação tecnica, planejamento
- **Principios:** Holistic thinking, pragmatic selection, security at every layer
- **Ferramentas:** Context7, EXA, análise de codebase

### 4.3 Perfil: @analyst (Atlas)

- **Arquetipo:** Decoder
- **Foco:** Pesquisa, análise de mercado, validação de dependencias
- **Principios:** Curiosity-driven, evidence-based, action-oriented
- **Ferramentas:** EXA, Context7, Google Workspace

### 4.4 Perfil: @qa (Quinn)

- **Arquetipo:** Guardian
- **Foco:** Validacao de qualidade, gates de aprovacao, rastreabilidade
- **Principios:** Requirements traceability, risk-based testing, advisory excellence
- **Ferramentas:** CodeRabbit, Browser testing, análise de spec

---

## 5. Tasks Executadas

| Task | Fase | Agente | Arquivo |
|------|------|--------|---------|
| Gather Requirements | 1 | @pm | `.aios-core/development/tasks/spec-gather-requirements.md` |
| Assess Complexity | 2 | @architect | `.aios-core/development/tasks/spec-assess-complexity.md` |
| Research Dependencies | 3 | @analyst | `.aios-core/development/tasks/spec-research-dependencies.md` |
| Write Specification | 4 | @pm | `.aios-core/development/tasks/spec-write-spec.md` |
| Critique Specification | 5, 5c | @qa | `.aios-core/development/tasks/spec-critique.md` |
| Create Implementation Plan | 6 | @architect | `.aios-core/development/tasks/plan-create-implementation.md` |

---

## 6. Pré-requisitos

### 6.1 Pre-Flight Checks

| Check | Descrição | Blocking |
|-------|-----------|----------|
| `story_exists` | Diretorio da story existe ou pode ser criado | Sim |
| `no_existing_spec` | Verificar spec existente (evitar sobrescrita) | Não (warning) |
| `agents_available` | Agentes do pipeline estao configurados | Sim |

### 6.2 Configuração Necessaria

```yaml
config:
  autoSpec:
    enabled: false        # Ativar auto-spec quando story criada
  showProgress: true      # Mostrar progresso
  verbose: true           # Logs detalhados
  maxRetries: 2           # Tentativas em caso de falha
  retryDelay: 1000        # Delay entre retries (ms)
  strictGate: true        # BLOCKED halts pipeline
  outputDir: docs/stories/{storyId}/spec/
```

---

## 7. Entradas e Saidas

### 7.1 Entradas do Pipeline

| Entrada | Tipo | Descrição | Fornecido Por |
|---------|------|-----------|---------------|
| `storyId` | string | ID único da story | Usuario |
| `source` | enum | `prd`, `user`, `existing` | Usuario (opcional) |
| `prdPath` | string | Caminho para PRD existente | Usuario (opcional) |
| `overrideComplexity` | enum | Override manual de complexidade | Usuario (opcional) |

### 7.2 Saidas do Pipeline

```mermaid
flowchart LR
    subgraph OUTPUT["Artefatos Gerados"]
        direction TB
        O1["requirements.json"]
        O2["complexity.json"]
        O3["research.json"]
        O4["spec.md"]
        O5["critique.json"]
        O6["plan.json"]
    end

    subgraph LOCATION["Localização"]
        L["docs/stories/{storyId}/spec/"]
        LP["docs/stories/{storyId}/plan/"]
    end

    O1 --> L
    O2 --> L
    O3 --> L
    O4 --> L
    O5 --> L
    O6 --> LP
```

| Artefato | Fase | Descrição |
|----------|------|-----------|
| `requirements.json` | 1 | Requisitos estruturados (9 categorias) |
| `complexity.json` | 2 | Avaliacao de complexidade (5 dimensoes) |
| `research.json` | 3 | Dependencias pesquisadas e validadas |
| `spec.md` | 4 | Especificacao completa executavel |
| `critique.json` | 5 | Resultado da avaliação de qualidade |
| `plan.json` | 6 | Plano de implementação com subtasks |

---

## 8. Pontos de Decisão

### 8.1 Decisão: Pular Assess?

```mermaid
flowchart TB
    D1{"source === 'simple'<br/>OR<br/>overrideComplexity === 'SIMPLE'?"}
    D1 -->|Sim| SKIP["Pular para Spec<br/>(assume SIMPLE)"]
    D1 -->|Não| RUN["Executar Assess"]
```

### 8.2 Decisão: Pular Research?

```mermaid
flowchart TB
    D2{"complexity.result === 'SIMPLE'<br/>OR<br/>no external dependencies?"}
    D2 -->|Sim| SKIP["Pular Research<br/>Gerar minimal research.json"]
    D2 -->|Não| RUN["Executar Research"]
```

### 8.3 Decisão: Verdict da Critique

```mermaid
flowchart TB
    START["Critique Complete"] --> C1{"HIGH issues?"}
    C1 -->|Sim| BLOCKED["BLOCKED"]
    C1 -->|Não| C2{"avg >= 4.0?"}
    C2 -->|Sim| C3{"all dims >= 3?"}
    C3 -->|Sim| APPROVED["APPROVED"]
    C3 -->|Não| NEEDS["NEEDS_REVISION"]
    C2 -->|Não| C4{"avg >= 3.0?"}
    C4 -->|Sim| NEEDS
    C4 -->|Não| BLOCKED
```

### 8.4 Decisão: Executar Revise?

```mermaid
flowchart TB
    D4{"complexity === 'COMPLEX'<br/>OR<br/>verdict === 'NEEDS_REVISION'?"}
    D4 -->|Sim| RUN["Executar Revise<br/>(Fase 5b)"]
    D4 -->|Não| SKIP["Pular Revise"]
```

### 8.5 Decisão: Segunda Critique?

```mermaid
flowchart TB
    D5{"complexity === 'COMPLEX'?"}
    D5 -->|Sim| RUN["Executar Critique 2<br/>(Fase 5c)"]
    D5 -->|Não| SKIP["Pular Segunda Critique"]
```

---

## 9. Troubleshooting

### 9.1 Erros Comuns

| Erro | Causa | Solução |
|------|-------|---------|
| `missing_story_id` | Story ID nao fornecido | `*create-spec STORY-42` |
| `phase_failed` | Fase falhou durante execucao | Verificar logs, usar `--resume` |
| `max_iterations_reached` | Limite de revisoes atingido | Escalr para @architect |
| `critique_blocked` | Spec bloqueado pelo QA gate | Revisar critique.json, corrigir HIGH issues |
| `missing-requirements` | requirements.json nao encontrado | Executar fase Gather primeiro |
| `empty-functional` | Nenhum requisito funcional | Re-executar elicitacao |
| `context7-unavailable` | Context7 MCP nao responde | Usar EXA como fallback |

### 9.2 Como Retomar Execucao

O pipeline suporta retomada atraves de checkpoints:

```yaml
resume:
  enabled: true
  state_file: docs/stories/{storyId}/spec/.pipeline-state.json

  checkpoints:
    - after: gather   -> requirements_gathered
    - after: assess   -> complexity_assessed
    - after: research -> research_complete
    - after: spec     -> spec_written
    - after: critique -> critique_complete
```

**Comando para retomar:**
```bash
*create-spec STORY-42 --resume
```

### 9.3 Árvore de Decisão de Erros

```mermaid
flowchart TB
    E["Erro no Pipeline"] --> E1{"Qual fase?"}

    E1 -->|Gather| G["Verificar elicitacao"]
    G --> G1["Usuario respondeu todas perguntas?"]
    G --> G2["requirements.json valido?"]

    E1 -->|Assess| A["Verificar inputs"]
    A --> A1["requirements.json existe?"]
    A --> A2["Formato JSON valido?"]

    E1 -->|Research| R["Verificar ferramentas"]
    R --> R1["Context7 ativo?"]
    R --> R2["EXA configurado?"]

    E1 -->|Spec| S["Verificar Constitutional Gate"]
    S --> S1["Conteudo inventado detectado?"]
    S --> S2["Traceability ok?"]

    E1 -->|Critique| C["Verificar verdict"]
    C --> C1["Issues HIGH encontrados?"]
    C --> C2["Score medio < 3.0?"]
```

---

## 10. Referências

### 10.1 Arquivos do Workflow

| Arquivo | Localização |
|---------|-------------|
| Definicao do Workflow | `.aios-core/development/workflows/spec-pipeline.yaml` |
| Task: Gather | `.aios-core/development/tasks/spec-gather-requirements.md` |
| Task: Assess | `.aios-core/development/tasks/spec-assess-complexity.md` |
| Task: Research | `.aios-core/development/tasks/spec-research-dependencies.md` |
| Task: Write Spec | `.aios-core/development/tasks/spec-write-spec.md` |
| Task: Critique | `.aios-core/development/tasks/spec-critique.md` |
| Task: Create Plan | `.aios-core/development/tasks/plan-create-implementation.md` |

### 10.2 Agentes Relacionados

| Agente | Localização |
|--------|-------------|
| @pm (Morgan) | `.aios-core/development/agents/pm.md` |
| @architect (Aria) | `.aios-core/development/agents/architect.md` |
| @analyst (Atlas) | `.aios-core/development/agents/analyst.md` |
| @qa (Quinn) | `.aios-core/development/agents/qa.md` |

### 10.3 Documentação Relacionada

- [Workflows YAML Guide](../workflows-yaml-guide.md)
- [AIOS Documentation Index](../AIOS-DOCUMENTATION-INDEX.md)
- [Backlog Management System](../BACKLOG-MANAGEMENT-SYSTEM.md)

### 10.4 Commands Rapidos

| Comando | Descrição | Agente |
|---------|-----------|--------|
| `*create-spec STORY-ID` | Executar pipeline completo | - |
| `*gather-requirements STORY-ID` | Apenas fase Gather | @pm |
| `*assess-complexity STORY-ID` | Apenas fase Assess | @architect |
| `*research-deps STORY-ID` | Apenas fase Research | @analyst |
| `*write-spec STORY-ID` | Apenas fase Write | @pm |
| `*critique-spec STORY-ID` | Apenas fase Critique | @qa |

---

## 11. Mensagem de Conclusão

Ao finalizar com sucesso, o pipeline exibe:

```
+==============================================================+
|  Spec Pipeline Complete                                      |
+==============================================================+

Story:       {storyId}
Complexity:  {SIMPLE|STANDARD|COMPLEX}
Verdict:     APPROVED
Score:       {score}/5

Artifacts:
   - docs/stories/{storyId}/spec/requirements.json
   - docs/stories/{storyId}/spec/complexity.json
   - docs/stories/{storyId}/spec/research.json
   - docs/stories/{storyId}/spec/spec.md
   - docs/stories/{storyId}/spec/critique.json

Next Steps:
   - Review spec.md
   - Run @dev *develop {storyId}
```

---

## Metadata

```yaml
metadata:
  documento: SPEC-PIPELINE-WORKFLOW.md
  versao: 1.0
  criado: 2026-02-04
  autor: Technical Documentation Specialist
  baseado_em:
    - .aios-core/development/workflows/spec-pipeline.yaml
    - .aios-core/development/tasks/spec-*.md
    - .aios-core/development/agents/*.md
  tags:
    - spec-pipeline
    - workflow
    - documentação
    - aios
    - auto-claude
```
