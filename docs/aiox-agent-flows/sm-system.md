# Sistema do Agente @sm

> **Versão:** 1.0.0
> **Criado:** 2026-02-04
> **Owner:** @sm (River - Facilitator)
> **Status:** Documentação Oficial

---

## Visão Geral

O agente **@sm (River)** e o Scrum Master tecnico do AIOX, especializado em preparacao de stories e facilitacao de processos ageis. Seu papel principal e criar stories detalhadas e acionaveis que agentes desenvolvedores possam implementar com minima necessidade de pesquisa adicional.

**Responsabilidades Principais:**
- Criacao e refinamento de user stories
- Gerenciamento de epics e breakdown de requisitos
- Facilitacao de sprint planning
- Orientacao sobre processos ageis
- Preparacao de handoffs para desenvolvedores
- Gerenciamento de branches locais durante desenvolvimento

**Arquetipo:** Facilitator (Pisces)
**Tom de Comunicacao:** Empatico, colaborativo, fluido
**Vocabulario-Chave:** adaptar, pivotar, ajustar, simplificar, conectar, fluir, remover

---

## Lista Completa de Arquivos

### Arquivos Core de Tasks do @sm

| Arquivo | Comando | Propósito |
|---------|---------|-----------|
| `.aiox-core/development/tasks/sm-create-next-story.md` | `*draft` | Task principal para criar proxima story do backlog |
| `.aiox-core/development/tasks/create-next-story.md` | `*draft` | Versao completa da task de criação de story |
| `.aiox-core/development/tasks/execute-checklist.md` | `*story-checklist` | Executa checklist de validação de story draft |
| `.aiox-core/development/tasks/correct-course.md` | `*correct-course` | Analisa e corrige desvios de processo |
| `.aiox-core/development/tasks/collaborative-edit.md` | - | Edicao colaborativa de documentos |
| `.aiox-core/development/tasks/init-project-status.md` | - | Inicializacao de status do projeto |

### Arquivos de Definição do Agente

| Arquivo | Propósito |
|---------|-----------|
| `.aiox-core/development/agents/sm.md` | Definição core do agente SM |
| `.claude/commands/AIOX/agents/sm.md` | Comando Claude Code para ativar @sm |
| `.cursor/rules/sm.md` | Regras para Cursor IDE |
| `.cursor/rules/sm.mdc` | Regras compiladas para Cursor |

### Arquivos de Checklists Utilizados

| Arquivo | Propósito |
|---------|-----------|
| `.aiox-core/product/checklists/story-draft-checklist.md` | Valida qualidade e completude de story drafts |
| `.aiox-core/product/checklists/story-dod-checklist.md` | Definition of Done para stories |
| `.aiox-core/product/checklists/change-checklist.md` | Navegacao de mudancas e correcao de curso |
| `.aiox-core/product/checklists/po-master-checklist.md` | Checklist mestre usado em validação |

### Arquivos Relacionados de Outros Agentes

| Arquivo | Agente | Propósito |
|---------|--------|-----------|
| `.aiox-core/development/agents/po.md` | @po | Coordena com @sm em backlog e sprint planning |
| `.aiox-core/development/agents/dev.md` | @dev | Recebe stories do @sm para implementacao |
| `.aiox-core/development/agents/pm.md` | @pm | Cria epics que @sm quebra em stories |
| `.aiox-core/development/agents/devops.md` | @github-devops | Recebe stories completas para push/PR |
| `.aiox-core/development/agents/qa.md` | @qa | Coordena em risk profiling |

### Arquivos de Workflows que Utilizam @sm

| Arquivo | Propósito |
|---------|-----------|
| `.aiox-core/development/workflows/story-development-cycle.yaml` | Ciclo completo de desenvolvimento de stories |
| `.aiox-core/development/workflows/greenfield-fullstack.yaml` | Workflow greenfield full-stack |
| `.aiox-core/development/workflows/greenfield-service.yaml` | Workflow greenfield service |
| `.aiox-core/development/workflows/greenfield-ui.yaml` | Workflow greenfield UI |
| `.aiox-core/development/workflows/brownfield-fullstack.yaml` | Workflow brownfield full-stack |
| `.aiox-core/development/workflows/brownfield-service.yaml` | Workflow brownfield service |
| `.aiox-core/development/workflows/brownfield-ui.yaml` | Workflow brownfield UI |

### Arquivos de Configuracao

| Arquivo | Propósito |
|---------|-----------|
| `.aiox-core/core-config.yaml` | Configuracao central (devStoryLocation, etc.) |
| `.aiox-core/development/scripts/unified-activation-pipeline.js` | Pipeline de saudacao inteligente |
| `.aiox-core/development/scripts/agent-assignment-resolver.js` | Resolucao de assignment de agentes |

---

## Flowchart: Sistema Completo do @sm

```mermaid
flowchart TB
    subgraph INPUTS["📥 INPUTS"]
        PRD["📄 PRD/Epic<br/>(from @pm)"]
        BACKLOG["📋 Backlog Priorizado<br/>(from @po)"]
        ARCH["🏗️ Arquitetura<br/>(docs/architecture/)"]
    end

    subgraph SM_AGENT["🌊 @sm (River) - Scrum Master"]
        direction TB

        subgraph COMMANDS["Comandos Disponiveis"]
            DRAFT["*draft<br/>Criar proxima story"]
            CHECKLIST["*story-checklist<br/>Validar story draft"]
            CORRECT["*correct-course<br/>Corrigir desvios"]
            GUIDE["*guide<br/>Guia de uso"]
            HELP["*help<br/>Listar comandos"]
        end

        subgraph PROCESS["Processo de Criacao"]
            LOAD_CONFIG["1. Carregar core-config.yaml"]
            IDENTIFY_STORY["2. Identificar proxima story"]
            GATHER_REQS["3. Coletar requisitos"]
            GATHER_ARCH["4. Contexto de arquitetura"]
            VERIFY_STRUCTURE["5. Verificar alinhamento"]
            POPULATE["6. Popular template"]
            VALIDATE["7. Executar checklist"]
        end
    end

    PRD --> IDENTIFY_STORY
    BACKLOG --> IDENTIFY_STORY
    ARCH --> GATHER_ARCH

    DRAFT --> LOAD_CONFIG
    LOAD_CONFIG --> IDENTIFY_STORY
    IDENTIFY_STORY --> GATHER_REQS
    GATHER_REQS --> GATHER_ARCH
    GATHER_ARCH --> VERIFY_STRUCTURE
    VERIFY_STRUCTURE --> POPULATE
    POPULATE --> VALIDATE

    VALIDATE --> STORY_FILE["📄 docs/stories/epic-X/<br/>STORY-X.Y.md"]
    VALIDATE --> CLICKUP["🔗 ClickUp Task<br/>(sync automatico)"]

    subgraph OUTPUTS["📤 OUTPUTS"]
        STORY_FILE
        CLICKUP
        HANDOFF["🎯 Handoff para @dev"]
    end

    STORY_FILE --> HANDOFF
    CLICKUP --> HANDOFF

    subgraph COLLABORATION["👥 COLABORACAO"]
        DEV_AGENT["@dev (Dex)<br/>Recebe stories"]
        PO_AGENT["@po (Pax)<br/>Valida stories"]
        DEVOPS_AGENT["@github-devops (Gage)<br/>Push/PR apos conclusao"]
    end

    HANDOFF --> DEV_AGENT
    STORY_FILE --> PO_AGENT
    DEV_AGENT -->|"Story completa"| DEVOPS_AGENT

    style SM_AGENT fill:#e3f2fd
    style INPUTS fill:#fff3e0
    style OUTPUTS fill:#e8f5e9
    style COLLABORATION fill:#fce4ec
    style COMMANDS fill:#bbdefb
    style PROCESS fill:#c5cae9
```

### Diagrama do Ciclo de Desenvolvimento de Stories

```mermaid
flowchart TD
    A[Start: Story Development Cycle] --> B["@sm: Criar proxima story<br/>*draft"]
    B --> C["@po: Validar story - 10 checks<br/>*validate-story-draft"]

    C --> D{Validacao OK?}
    D -->|Nao| E[Feedback para SM]
    E --> B
    D -->|Sim| F["@dev: Implementar story<br/>*develop"]

    F --> G["@qa: Review + Quality Gate<br/>*review-story"]

    G --> H{Quality Gate OK?}
    H -->|Nao| I[Feedback para Dev]
    I --> F
    H -->|Sim| J[Story Done!]

    J --> K{Mais stories?}
    K -->|Sim| B
    K -->|Nao| L[Ciclo Completo]

    style L fill:#90EE90
    style J fill:#90EE90
    style B fill:#87CEEB
    style C fill:#FFE4B5
    style F fill:#98FB98
    style G fill:#DDA0DD
    style E fill:#FFB6C1
    style I fill:#FFB6C1
```

### Diagrama de Gerenciamento de Branches

```mermaid
flowchart LR
    subgraph SM_SCOPE["🌊 @sm - Escopo Local"]
        CREATE_BRANCH["git checkout -b<br/>feature/X.Y-story-name"]
        LIST_BRANCH["git branch<br/>Listar branches"]
        SWITCH_BRANCH["git checkout<br/>Trocar branch"]
        DELETE_LOCAL["git branch -d<br/>Deletar local"]
        MERGE_LOCAL["git merge<br/>Merge local"]
    end

    subgraph DEVOPS_SCOPE["⚙️ @github-devops - Escopo Remoto"]
        PUSH["git push<br/>Enviar para origin"]
        CREATE_PR["gh pr create<br/>Criar Pull Request"]
        DELETE_REMOTE["git push origin --delete<br/>Deletar branch remoto"]
    end

    SM_SCOPE -->|"Story completa<br/>Notificar"| DEVOPS_SCOPE

    style SM_SCOPE fill:#e3f2fd
    style DEVOPS_SCOPE fill:#fff3e0
```

---

## Mapeamento de Comandos para Tasks

| Comando | Task File | Operacao |
|---------|-----------|----------|
| `*draft` | `sm-create-next-story.md` / `create-next-story.md` | Cria proxima story do backlog |
| `*story-checklist` | `execute-checklist.md` | Executa `story-draft-checklist.md` |
| `*correct-course` | `correct-course.md` | Analisa e corrige desvios de processo |
| `*help` | (built-in) | Mostra comandos disponiveis |
| `*guide` | (built-in) | Mostra guia de uso do agente |
| `*session-info` | (built-in) | Mostra detalhes da sessao atual |
| `*exit` | (built-in) | Sai do modo Scrum Master |

---

## Integracoes entre Agentes

### Fluxo de Integracao

```mermaid
flowchart TB
    subgraph UPSTREAM["⬆️ UPSTREAM - Fornece para @sm"]
        PM_UP["@pm (Morgan)<br/>Cria estrutura de epics"]
        PO_UP["@po (Pax)<br/>Prioriza backlog"]
        ANALYST_UP["@analyst (Sage)<br/>Pesquisa e insights"]
    end

    SM_CENTRAL["🌊 @sm (River)<br/>Scrum Master"]

    subgraph DOWNSTREAM["⬇️ DOWNSTREAM - Recebe de @sm"]
        DEV_DOWN["@dev (Dex)<br/>Implementa stories"]
        PO_DOWN["@po (Pax)<br/>Valida stories"]
        QA_DOWN["@qa (Quinn)<br/>Risk profiling"]
    end

    subgraph LATERAL["↔️ LATERAL - Coordena com @sm"]
        DEVOPS_LAT["@github-devops (Gage)<br/>Push/PR workflow"]
    end

    PM_UP -->|"Epic structure"| SM_CENTRAL
    PO_UP -->|"Backlog priorizado"| SM_CENTRAL
    ANALYST_UP -->|"Insights tecnicos"| SM_CENTRAL

    SM_CENTRAL -->|"Stories prontas"| DEV_DOWN
    SM_CENTRAL -->|"Stories para validação"| PO_DOWN
    SM_CENTRAL -->|"Request risk profiling"| QA_DOWN

    SM_CENTRAL <-->|"Sprint workflow"| DEVOPS_LAT

    style SM_CENTRAL fill:#87CEEB
    style UPSTREAM fill:#fff3e0
    style DOWNSTREAM fill:#e8f5e9
    style LATERAL fill:#fce4ec
```

### Matriz de Colaboracao

| Agente | Relacionamento | Acao |
|--------|----------------|------|
| **@pm (Morgan)** | Recebe de | Epic structure, PRD shardado |
| **@po (Pax)** | Coordena com | Backlog prioritization, sprint planning |
| **@dev (Dex)** | Entrega para | Stories prontas para implementacao |
| **@qa (Quinn)** | Solicita | Risk profiling para stories |
| **@github-devops (Gage)** | Delega para | Push branches, criar PRs |
| **@analyst (Sage)** | Consulta | Pesquisa e insights tecnicos |

### Delegacao para @github-devops

O @sm gerencia APENAS operacoes locais de Git. Para operacoes remotas, **sempre** delegar para @github-devops:

**Operacoes Permitidas para @sm:**
- `git checkout -b feature/X.Y-story-name` - Criar branch local
- `git branch` - Listar branches
- `git branch -d branch-name` - Deletar branch local
- `git checkout branch-name` - Trocar de branch
- `git merge branch-name` - Merge local

**Operacoes Bloqueadas (usar @github-devops):**
- `git push` - Enviar para remoto
- `git push origin --delete` - Deletar branch remoto
- `gh pr create` - Criar Pull Request

---

## Configuracao

### core-config.yaml (Chaves Relevantes)

```yaml
# Localizacao de stories
devStoryLocation: docs/stories

# PRD Shardado ou Monolitico
prdSharded: true
prdShardedLocation: docs/prd/epics

# Arquitetura
architectureVersion: v4
architectureSharded: true
architectureShardedLocation: docs/architecture

# QA
qaLocation: docs/qa

# CodeRabbit Integration
coderabbit_integration:
  enabled: true  # Controla se @sm popula secao CodeRabbit nas stories
```

### Dependencies do Agente

```yaml
dependencies:
  tasks:
    - create-next-story.md
    - execute-checklist.md
    - correct-course.md
  templates:
    - story-tmpl.yaml
  checklists:
    - story-draft-checklist.md
  tools:
    - git               # Local branch operations only
    - clickup           # Track sprint progress
    - context7          # Research technical requirements
```

---

## Best Practices

### Criacao de Stories

1. **Sempre comece do PRD/Epic** - Nao invente requisitos
2. **Inclua referencias com citacoes** - `[Source: architecture/tech-stack.md#database]`
3. **Popule Dev Notes completamente** - Contexto tecnico extraido da arquitetura
4. **Execute checklist apos criação** - `*story-checklist` valida qualidade
5. **Nao assuma informacoes** - Se não encontrar, declare "No specific guidance found"

### Gerenciamento de Branches

1. **Use naming convention** - `feature/X.Y-story-name` (X.Y = epic.story)
2. **Crie branch ao iniciar story** - Isola desenvolvimento
3. **Nao tente push** - Sempre delegar para @github-devops
4. **Resolva conflitos localmente** - Antes de pedir push

### Colaboracao com Outros Agentes

1. **Respeite limites** - Nao implemente codigo, não crie PRs
2. **Documente handoffs** - Deixe claro o que @dev precisa fazer
3. **Coordene com @po** - Backlog prioritization antes de criar stories
4. **Notifique @github-devops** - Quando story estiver pronta para push

### Validacao de Stories

1. **Execute checklist** - `*story-checklist` apos criação
2. **Revise todos os 6 criterios** - Goal, Technical, References, Self-Containment, Testing, CodeRabbit
3. **Corrija antes de handoff** - Stories incompletas bloqueiam @dev
4. **Documente desvios** - Se houver conflitos entre epic e arquitetura

---

## Troubleshooting

### Story não encontrada no ClickUp

**Sintoma:** Epic verificacao falha em Step 5.1

**Solucao:**
1. Verificar se Epic existe no ClickUp Backlog list
2. Confirmar tags: `epic`, `epic-{epicNum}`
3. Status deve ser "Planning" ou "In Progress"
4. Criar Epic manualmente se necessario:
   ```
   Name: 'Epic {epicNum}: {Epic Title}'
   List: Backlog
   Tags: ['epic', 'epic-{epicNum}']
   Status: Planning
   ```

### core-config.yaml não encontrado

**Sintoma:** Task halts com mensagem de arquivo não encontrado

**Solucao:**
1. Copiar de `GITHUB aiox-core/core-config.yaml`
2. Ou executar AIOX installer: `npm run aiox:install`
3. Configurar `devStoryLocation`, `prdSharded`, etc.

### Checklist retorna FAIL em multiplas categorias

**Sintoma:** Story draft com varios problemas de validação

**Solucao:**
1. Revisar arquivos de arquitetura referenciados
2. Verificar se PRD/Epic esta completo
3. Usar file fallback strategy para arquivos alternativos
4. Adicionar notas em Dev Notes sobre gaps

### Branch local não sincronizado

**Sintoma:** Merge conflicts ao tentar integrar

**Solucao:**
1. Fazer `git fetch origin` para atualizar referencias
2. Merge branch base localmente: `git merge main`
3. Resolver conflitos antes de pedir push para @github-devops

### CodeRabbit section não aparece na story

**Sintoma:** Story criada sem secao de integracao CodeRabbit

**Causa:** `coderabbit_integration.enabled: false` em core-config.yaml

**Solucao:**
1. Verificar `core-config.yaml`
2. Se intencional, story tera notice de skip
3. Para habilitar, set `coderabbit_integration.enabled: true`

---

## Referencias

### Arquivos do Agente
- [Agent: sm.md](.aiox-core/development/agents/sm.md)
- [Task: create-next-story.md](.aiox-core/development/tasks/create-next-story.md)
- [Task: execute-checklist.md](.aiox-core/development/tasks/execute-checklist.md)
- [Task: correct-course.md](.aiox-core/development/tasks/correct-course.md)

### Checklists
- [Checklist: story-draft-checklist.md](.aiox-core/product/checklists/story-draft-checklist.md)
- [Checklist: story-dod-checklist.md](.aiox-core/product/checklists/story-dod-checklist.md)
- [Checklist: change-checklist.md](.aiox-core/product/checklists/change-checklist.md)

### Workflows
- [Workflow: story-development-cycle.yaml](.aiox-core/development/workflows/story-development-cycle.yaml)
- [Workflow: greenfield-fullstack.yaml](.aiox-core/development/workflows/greenfield-fullstack.yaml)
- [Workflow: brownfield-fullstack.yaml](.aiox-core/development/workflows/brownfield-fullstack.yaml)

### Configuracao
- [Core Config](../.aiox-core/core-config.yaml)

### Documentação Relacionada
- [Backlog Management System](../BACKLOG-MANAGEMENT-SYSTEM.md)

---

## Resumo

| Aspecto | Detalhes |
|---------|----------|
| **Agente** | @sm (River) - Scrum Master |
| **Arquetipo** | Facilitator (Pisces) |
| **Total de Task Files** | 6 tasks core |
| **Comandos Disponiveis** | 7 (`*draft`, `*story-checklist`, `*correct-course`, `*help`, `*guide`, `*session-info`, `*exit`) |
| **Checklists Utilizados** | 4 checklists |
| **Workflows que Usam @sm** | 7 workflows |
| **Ferramentas** | git (local), clickup, context7 |
| **Colabora com** | @pm, @po, @dev, @qa, @github-devops, @analyst |
| **Delega para** | @github-devops (operacoes remotas) |
| **Responsabilidade Principal** | Criacao de stories detalhadas e acionaveis |

---

## Changelog

| Data | Autor | Descrição |
|------|-------|-----------|
| 2026-02-04 | @dev | Documento inicial criado |

---

*-- River, removendo obstaculos*
