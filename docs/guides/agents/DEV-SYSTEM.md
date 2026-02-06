# Sistema do Agente @dev

> **Versao:** 1.0.0
> **Criado:** 2026-02-04
> **Owner:** @dev (Dex - The Builder)
> **Status:** Documentacao Oficial

---

## Visao Geral

O agente **@dev (Dex)** e o Full Stack Developer do AIOS, responsavel pela implementacao de stories, debugging, refactoring e aplicacao das melhores praticas de desenvolvimento. Este agente atua como um **Builder** que implementa stories de forma precisa, atualiza somente as secoes autorizadas dos arquivos de story e mantem testes abrangentes.

### Caracteristicas Principais

| Caracteristica | Descricao |
|----------------|-----------|
| **Persona** | Dex - The Builder |
| **Arquetipo** | Builder / Aquario |
| **Tom** | Pragmatico, conciso, orientado a solucoes |
| **Foco** | Implementacao de stories, testes, qualidade de codigo |
| **Fechamento** | "-- Dex, sempre construindo" |

### Vocabulario Caracteristico

- Construir
- Implementar
- Refatorar
- Resolver
- Otimizar
- Debugar
- Testar

---

## Lista Completa de Arquivos

### Arquivos Core de Tasks do @dev

| Arquivo | Comando | Proposito |
|---------|---------|-----------|
| `.aios-core/development/tasks/dev-develop-story.md` | `*develop {story-id}` | Task principal - desenvolve story completa com modos YOLO/Interactive/Pre-flight |
| `.aios-core/development/tasks/dev-improve-code-quality.md` | `*improve-code-quality <path>` | Melhora qualidade do codigo (formatting, linting, modern-syntax) |
| `.aios-core/development/tasks/dev-optimize-performance.md` | `*optimize-performance <path>` | Analisa e otimiza performance do codigo |
| `.aios-core/development/tasks/dev-suggest-refactoring.md` | `*suggest-refactoring <path>` | Sugere oportunidades de refactoring automatizado |
| `.aios-core/development/tasks/dev-backlog-debt.md` | `*backlog-debt` | Registra divida tecnica no backlog |
| `.aios-core/development/tasks/apply-qa-fixes.md` | `*apply-qa-fixes` | Aplica correcoes baseadas em feedback de QA |
| `.aios-core/development/tasks/execute-checklist.md` | `*execute-checklist` | Valida documentacao usando checklists |
| `.aios-core/development/tasks/validate-next-story.md` | `*validate-story-draft` | Valida qualidade e completude de stories |
| `.aios-core/development/tasks/sync-documentation.md` | `*sync-documentation` | Sincroniza documentacao com mudancas de codigo |
| `.aios-core/development/tasks/po-manage-story-backlog.md` | (usado internamente) | Gerencia backlog de stories |

### Arquivos de Definicao do Agente

| Arquivo | Proposito |
|---------|-----------|
| `.aios-core/development/agents/dev.md` | Definicao core do agente @dev (persona, comandos, workflows) |
| `.claude/commands/AIOS/agents/dev.md` | Comando Claude Code para ativar @dev |

### Arquivos de Checklists Usados pelo @dev

| Arquivo | Proposito |
|---------|-----------|
| `.aios-core/product/checklists/story-dod-checklist.md` | Definition of Done para stories |
| `.aios-core/product/checklists/pre-push-checklist.md` | Checklist antes de push |
| `.aios-core/product/checklists/change-checklist.md` | Validacao de mudancas |

### Arquivos Relacionados de Outros Agentes

| Arquivo | Agente | Proposito |
|---------|--------|-----------|
| `.aios-core/development/tasks/qa-backlog-add-followup.md` | @qa | QA adiciona follow-ups ao backlog |
| `.aios-core/development/tasks/qa-review-story.md` | @qa | QA revisa implementacao do @dev |
| `.aios-core/development/tasks/github-devops-pre-push-quality-gate.md` | @github-devops | Quality gate antes de push |
| `.aios-core/development/tasks/sm-create-next-story.md` | @sm | Scrum Master cria stories para @dev |

### Arquivos de Workflows que Usam @dev

| Arquivo | Proposito |
|---------|-----------|
| `.aios-core/development/workflows/brownfield-fullstack.yaml` | Workflow full-stack brownfield |
| `.aios-core/development/workflows/brownfield-service.yaml` | Workflow de servico brownfield |
| `.aios-core/development/workflows/brownfield-ui.yaml` | Workflow UI brownfield |
| `.aios-core/development/workflows/greenfield-fullstack.yaml` | Workflow full-stack greenfield |
| `.aios-core/development/workflows/greenfield-service.yaml` | Workflow de servico greenfield |
| `.aios-core/development/workflows/greenfield-ui.yaml` | Workflow UI greenfield |

---

## Flowchart: Sistema Completo do @dev

```mermaid
flowchart TB
    subgraph ACTIVATION["ATIVACAO DO AGENTE"]
        A["@dev"] --> B["Greeting Builder<br/>(greeting-builder.js)"]
        B --> C["Carrega devLoadAlwaysFiles"]
        C --> D["Exibe Quick Commands"]
        D --> E["HALT - Aguarda Usuario"]
    end

    subgraph DEVELOPMENT["CICLO DE DESENVOLVIMENTO"]
        E --> F{"Comando Recebido"}

        F -->|"*develop {id}"| G["dev-develop-story.md"]
        F -->|"*run-tests"| H["Executa Testes"]
        F -->|"*apply-qa-fixes"| I["apply-qa-fixes.md"]
        F -->|"*backlog-debt"| J["dev-backlog-debt.md"]
        F -->|"*improve-code-quality"| K["dev-improve-code-quality.md"]
        F -->|"*optimize-performance"| L["dev-optimize-performance.md"]
        F -->|"*suggest-refactoring"| M["dev-suggest-refactoring.md"]
    end

    subgraph DEVELOP_STORY["TASK: develop-story"]
        G --> N{"Modo de Execucao?"}

        N -->|"YOLO"| O["Modo Autonomo<br/>(0-1 prompts)"]
        N -->|"Interactive"| P["Modo Interativo<br/>(5-10 prompts)"]
        N -->|"Pre-flight"| Q["Planejamento<br/>Upfront"]

        O --> R["Implementar Tasks"]
        P --> R
        Q --> R

        R --> S["Escrever Testes"]
        S --> T["Executar Validacoes"]
        T --> U{"Todos Passam?"}

        U -->|"Sim"| V["Marcar [x] Task"]
        U -->|"Nao"| W["Corrigir Issues"]
        W --> T

        V --> X["Atualizar File List"]
        X --> Y{"Mais Tasks?"}

        Y -->|"Sim"| R
        Y -->|"Nao"| Z["CodeRabbit Self-Healing"]
    end

    subgraph COMPLETION["FINALIZACAO"]
        Z --> AA{"CRITICAL Issues?"}
        AA -->|"Sim"| AB["Auto-fix<br/>(max 2 iteracoes)"]
        AB --> AA
        AA -->|"Nao"| AC["Execute story-dod-checklist"]
        AC --> AD["Set Status:<br/>Ready for Review"]
        AD --> AE["HALT"]
    end

    subgraph COLLABORATION["COLABORACAO"]
        AE --> AF["@github-devops<br/>(git push, PR)"]
        AE --> AG["@qa<br/>(Review)"]
        AG -->|"Issues"| I
    end

    style ACTIVATION fill:#e3f2fd
    style DEVELOPMENT fill:#e8f5e9
    style DEVELOP_STORY fill:#fff8e1
    style COMPLETION fill:#f3e5f5
    style COLLABORATION fill:#fce4ec
```

### Diagrama de Modos de Execucao

```mermaid
stateDiagram-v2
    [*] --> ModeSelection: *develop {story-id} [mode]

    ModeSelection --> YOLO: mode=yolo
    ModeSelection --> Interactive: mode=interactive (default)
    ModeSelection --> PreFlight: mode=preflight

    state YOLO {
        Y1: Initialize Decision Logging
        Y2: Read All Tasks
        Y3: Autonomous Decisions
        Y4: Implement + Test
        Y5: Log Decisions to .ai/

        Y1 --> Y2
        Y2 --> Y3
        Y3 --> Y4
        Y4 --> Y5
    }

    state Interactive {
        I1: Story Analysis
        I2: Present Summary
        I3: Decision Checkpoints
        I4: Educational Explanations
        I5: User Confirmations

        I1 --> I2
        I2 --> I3
        I3 --> I4
        I4 --> I5
    }

    state PreFlight {
        P1: Identify Ambiguities
        P2: Generate Questionnaire
        P3: Collect All Answers
        P4: Create Execution Plan
        P5: Zero-Ambiguity Execute

        P1 --> P2
        P2 --> P3
        P3 --> P4
        P4 --> P5
    }

    YOLO --> Validation
    Interactive --> Validation
    PreFlight --> Validation

    state Validation {
        V1: Run Tests
        V2: Execute Linting
        V3: CodeRabbit Check
        V4: DOD Checklist
    }

    Validation --> [*]: Ready for Review
```

### Fluxo de CodeRabbit Self-Healing

```mermaid
flowchart TB
    subgraph SELF_HEALING["CODERABBIT SELF-HEALING (Story 6.3.3)"]
        A["Tasks Completas"] --> B["Iniciar Self-Healing Loop"]
        B --> C["iteration = 0<br/>max = 2"]

        C --> D["Executar CodeRabbit CLI<br/>(wsl bash -c)"]
        D --> E["Parse Output"]
        E --> F{"CRITICAL Issues?"}

        F -->|"Nao"| G{"HIGH Issues?"}
        G -->|"Sim"| H["Documentar em Dev Notes"]
        G -->|"Nao"| I["PASSED"]
        H --> I

        F -->|"Sim"| J["Auto-fix CRITICAL"]
        J --> K["iteration++"]
        K --> L{"iteration < 2?"}

        L -->|"Sim"| D
        L -->|"Nao"| M["HALT - Manual Fix Required"]

        I --> N["Proceed to DOD Checklist"]
    end

    style I fill:#c8e6c9
    style M fill:#ffcdd2
```

---

## Mapeamento de Comandos para Tasks

### Comandos de Desenvolvimento

| Comando | Task File | Operacao |
|---------|-----------|----------|
| `*develop {story-id}` | `dev-develop-story.md` | Implementa story completa |
| `*develop {story-id} yolo` | `dev-develop-story.md` | Modo autonomo (0-1 prompts) |
| `*develop {story-id} interactive` | `dev-develop-story.md` | Modo interativo (5-10 prompts) |
| `*develop {story-id} preflight` | `dev-develop-story.md` | Planejamento upfront |
| `*run-tests` | (inline) | Executa linting e testes |

### Comandos de Qualidade

| Comando | Task File | Operacao |
|---------|-----------|----------|
| `*apply-qa-fixes` | `apply-qa-fixes.md` | Aplica correcoes de QA |
| `*improve-code-quality <path>` | `dev-improve-code-quality.md` | Melhora qualidade de codigo |
| `*optimize-performance <path>` | `dev-optimize-performance.md` | Otimiza performance |
| `*suggest-refactoring <path>` | `dev-suggest-refactoring.md` | Sugere refactoring |

### Comandos de Backlog e Documentacao

| Comando | Task File | Operacao |
|---------|-----------|----------|
| `*backlog-debt` | `dev-backlog-debt.md` | Registra divida tecnica |
| `*sync-documentation` | `sync-documentation.md` | Sincroniza documentacao |
| `*validate-story-draft` | `validate-next-story.md` | Valida draft de story |

### Comandos de Contexto e Sessao

| Comando | Operacao |
|---------|----------|
| `*help` | Mostra todos os comandos disponiveis |
| `*explain` | Explica o que acabou de fazer |
| `*guide` | Mostra guia de uso completo |
| `*load-full {file}` | Carrega arquivo completo (bypass summary) |
| `*clear-cache` | Limpa cache de contexto |
| `*session-info` | Mostra detalhes da sessao |
| `*exit` | Sai do modo developer |

---

## Integracoes entre Agentes

### Diagrama de Colaboracao

```mermaid
flowchart TB
    subgraph DEV_ECOSYSTEM["ECOSSISTEMA DO @dev"]
        DEV["@dev (Dex)"]
    end

    subgraph UPSTREAM["UPSTREAM - Fornece Stories"]
        SM["@sm (River)<br/>Scrum Master"]
        PO["@po (Pax)<br/>Product Owner"]
    end

    subgraph PEER["PEER - Colaboracao"]
        QA["@qa (Quinn)<br/>Quality Assurance"]
    end

    subgraph DOWNSTREAM["DOWNSTREAM - Recebe Output"]
        GHDEVOPS["@github-devops (Gage)<br/>Git Operations"]
    end

    SM -->|"Cria story<br/>*create-next-story"| DEV
    PO -->|"Valida story<br/>*validate-story-draft"| DEV

    DEV -->|"Implementa<br/>*develop"| QA
    QA -->|"Feedback<br/>*apply-qa-fixes"| DEV

    DEV -->|"Story Complete<br/>Ready for Review"| GHDEVOPS
    GHDEVOPS -->|"git push<br/>gh pr create"| REMOTE["GitHub Remote"]

    style DEV fill:#e8f5e9
    style SM fill:#e3f2fd
    style PO fill:#e3f2fd
    style QA fill:#fce4ec
    style GHDEVOPS fill:#fff3e0
```

### Fluxo de Colaboracao

| De | Para | Trigger | Acao |
|----|------|---------|------|
| @sm | @dev | Story criada | @dev implementa story |
| @po | @dev | Story validada | @dev pode comecar implementacao |
| @dev | @qa | Story "Ready for Review" | @qa revisa implementacao |
| @qa | @dev | Feedback com issues | @dev aplica correcoes (*apply-qa-fixes) |
| @dev | @github-devops | Codigo completo | @github-devops faz push/PR |

### Restricoes de Git

O @dev tem operacoes Git limitadas:

**Operacoes PERMITIDAS:**
- `git add` - Stage files
- `git commit` - Commit local
- `git status` - Check estado
- `git diff` - Review mudancas
- `git log` - Ver historico
- `git branch` - List/create branches
- `git checkout` - Switch branches
- `git merge` - Merge local

**Operacoes BLOQUEADAS (somente @github-devops):**
- `git push`
- `git push --force`
- `gh pr create`
- `gh pr merge`

---

## Configuracao

### Arquivos de Configuracao Relevantes

| Arquivo | Proposito |
|---------|-----------|
| `.aios-core/core-config.yaml` | Configuracao central (devStoryLocation, coderabbit, etc.) |
| `.aios-core/development/scripts/greeting-builder.js` | Constroi greeting adaptativo |
| `.aios-core/scripts/decision-recorder.js` | Logging de decisoes (YOLO mode) |

### devLoadAlwaysFiles

Arquivos carregados automaticamente na ativacao do @dev (definidos em core-config.yaml):
- Padroes de codigo do projeto
- Estrutura de diretorios
- Convencoes de nomenclatura

### CodeRabbit Integration

```yaml
coderabbit_integration:
  enabled: true
  installation_mode: wsl

  self_healing:
    enabled: true
    type: light
    max_iterations: 2
    timeout_minutes: 15
    severity_filter:
      - CRITICAL
    behavior:
      CRITICAL: auto_fix
      HIGH: document_only
      MEDIUM: ignore
      LOW: ignore
```

### Decision Logging (YOLO Mode)

```yaml
decision_logging:
  enabled: true
  log_location: ".ai/decision-log-{story-id}.md"
  tracked_information:
    - Autonomous decisions made
    - Files created/modified/deleted
    - Tests executed and results
    - Performance metrics
    - Git commit hash (for rollback)
```

---

## Best Practices

### Quando Usar o @dev

**USE @dev para:**
- Implementar stories aprovadas
- Aplicar correcoes de QA
- Refatorar codigo existente
- Otimizar performance
- Registrar divida tecnica
- Executar e validar testes

**NAO USE @dev para:**
- Criar stories (use @sm)
- Push para remote (use @github-devops)
- Validar arquitetura (use @architect)
- Gerenciar backlog (use @po)

### Modos de Execucao

| Modo | Quando Usar | Prompts |
|------|-------------|---------|
| **YOLO** | Tasks simples, deterministicas | 0-1 |
| **Interactive** | Aprendizado, decisoes complexas | 5-10 |
| **Pre-flight** | Requisitos ambiguos, trabalho critico | Todos upfront |

### Atualizacao de Story Files

**SOMENTE estas secoes podem ser editadas pelo @dev:**
- Task/Subtask checkboxes
- Dev Agent Record section
- Agent Model Used
- Debug Log References
- Completion Notes List
- File List
- Change Log
- Status

**NUNCA editar:**
- Story description
- Acceptance Criteria
- Dev Notes (somente adicionar, nao modificar)
- Testing sections (estrutura)

### Ciclo de Desenvolvimento

1. **Leia task completa** antes de implementar
2. **Implemente incrementalmente** (task por task)
3. **Escreva testes** para cada task
4. **Execute validacoes** antes de marcar [x]
5. **Atualize File List** apos cada arquivo criado/modificado
6. **Execute CodeRabbit** antes de finalizar
7. **Execute DOD Checklist** no final
8. **Set status** para "Ready for Review"

---

## Troubleshooting

### Story nao encontrada

```
Erro: Story file not found at docs/stories/{story-id}.md
```

**Solucao:**
1. Verificar se story-id esta correto
2. Checar se story existe em `docs/stories/`
3. Usar caminho completo se necessario

### CodeRabbit nao encontrado

```
Erro: coderabbit: command not found
```

**Solucao:**
1. Verificar instalacao WSL: `wsl bash -c '~/.local/bin/coderabbit --version'`
2. Verificar path em `wsl_config.installation_path`
3. Re-instalar CodeRabbit se necessario

### Testes falhando

```
Erro: Tests failed - cannot mark task as complete
```

**Solucao:**
1. Analisar output de erros
2. Corrigir issues identificados
3. Re-executar testes
4. Somente marcar [x] quando todos passarem

### Blocking conditions

O @dev deve **HALT** e perguntar ao usuario quando:
- Dependencias nao aprovadas sao necessarias
- Requisitos ambiguos apos checar story
- 3 falhas consecutivas tentando implementar/corrigir
- Configuracao faltando
- Testes de regressao falhando

---

## Referencias

### Tasks do @dev
- [dev-develop-story.md](.aios-core/development/tasks/dev-develop-story.md)
- [dev-improve-code-quality.md](.aios-core/development/tasks/dev-improve-code-quality.md)
- [dev-optimize-performance.md](.aios-core/development/tasks/dev-optimize-performance.md)
- [dev-suggest-refactoring.md](.aios-core/development/tasks/dev-suggest-refactoring.md)
- [dev-backlog-debt.md](.aios-core/development/tasks/dev-backlog-debt.md)
- [apply-qa-fixes.md](.aios-core/development/tasks/apply-qa-fixes.md)

### Checklists
- [story-dod-checklist.md](.aios-core/product/checklists/story-dod-checklist.md)
- [pre-push-checklist.md](.aios-core/product/checklists/pre-push-checklist.md)

### Agente
- [dev.md](.aios-core/development/agents/dev.md)

### Workflows
- [brownfield-fullstack.yaml](.aios-core/development/workflows/brownfield-fullstack.yaml)
- [greenfield-fullstack.yaml](.aios-core/development/workflows/greenfield-fullstack.yaml)

### Relacionados
- [BACKLOG-MANAGEMENT-SYSTEM.md](../BACKLOG-MANAGEMENT-SYSTEM.md)

---

## Resumo

| Aspecto | Detalhes |
|---------|----------|
| **Total de Arquivos Core** | 10 task files + 1 agent definition |
| **Comandos Principais** | 15 comandos (*develop, *run-tests, *apply-qa-fixes, etc.) |
| **Modos de Execucao** | 3 (YOLO, Interactive, Pre-flight) |
| **Checklists Usados** | 3 (story-dod, pre-push, change) |
| **Workflows Integrados** | 6 (brownfield + greenfield variants) |
| **Agentes Colaboradores** | 4 (@sm, @po, @qa, @github-devops) |
| **Operacoes Git Permitidas** | 8 (add, commit, status, diff, log, branch, checkout, merge) |
| **Operacoes Git Bloqueadas** | 4 (push, push --force, gh pr create, gh pr merge) |
| **CodeRabbit Self-Healing** | Light mode (max 2 iteracoes, CRITICAL only) |

---

## Changelog

| Data | Autor | Descricao |
|------|-------|-----------|
| 2026-02-04 | @dev | Documento inicial criado |

---

*-- Dex, sempre construindo*
