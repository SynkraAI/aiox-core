# QA Loop Workflow - Documentacao Completa

**Versao:** 1.0
**Ultima Atualizacao:** 2026-02-04
**Epic:** 6 - QA Evolution: Autonomous Development Engine (ADE)
**Story:** 6.5
**Autor:** @architect (Aria)

---

## Indice

1. [Visao Geral](#visao-geral)
2. [Diagrama do Workflow](#diagrama-do-workflow)
3. [Steps Detalhados](#steps-detalhados)
4. [Agentes Participantes](#agentes-participantes)
5. [Tasks Executadas](#tasks-executadas)
6. [Pre-requisitos](#pre-requisitos)
7. [Entradas e Saidas](#entradas-e-saidas)
8. [Pontos de Decisao](#pontos-de-decisao)
9. [Configuracao](#configuracao)
10. [Controle de Execucao](#controle-de-execucao)
11. [Escalacao](#escalacao)
12. [Integracao com Dashboard](#integracao-com-dashboard)
13. [Tratamento de Erros](#tratamento-de-erros)
14. [Troubleshooting](#troubleshooting)
15. [Referencias](#referencias)

---

## Visao Geral

O **QA Loop Orchestrator** e um workflow automatizado que orquestra o ciclo completo de:

```
Review -> Fix -> Re-review
```

Este workflow executa ate um maximo de iteracoes configuravel (padrao: 5), rastreando os resultados de cada iteracao. Quando o limite maximo e atingido ou uma parada manual e solicitada, o workflow escala para intervencao humana.

### Proposito

- Automatizar o ciclo de revisao de qualidade
- Reduzir tempo entre feedback e correcao
- Garantir rastreabilidade completa do processo de QA
- Escalar automaticamente quando necessario

### Tipos de Projeto Suportados

- `aios-development`
- `autonomous-development`
- `qa-automation`

---

## Diagrama do Workflow

### Fluxo Principal

```mermaid
flowchart TD
    subgraph TRIGGER["Triggers de Inicio"]
        T1["*qa-loop {storyId}"]
        T2["*qa-loop-review"]
        T3["*qa-loop-fix"]
    end

    subgraph INIT["Inicializacao"]
        I1["Carregar/Criar loop-status.json"]
        I2["Definir iteration = 0"]
        I3["maxIterations = 5 (config)"]
    end

    subgraph REVIEW["Fase 1: QA Review"]
        R1["@qa executa qa-review-story.md"]
        R2["Gera gate-file.yaml"]
        R3["Retorna verdict + issuesFound"]
    end

    subgraph CHECK["Fase 2: Verificar Verdict"]
        C1{"verdict?"}
        C2["APPROVE"]
        C3["BLOCKED"]
        C4["REJECT"]
    end

    subgraph FIX_REQ["Fase 3: Criar Fix Request"]
        F1["@qa executa qa-create-fix-request.md"]
        F2["Gera fix-request.md"]
        F3["Prioriza issues"]
    end

    subgraph FIX["Fase 4: Aplicar Fixes"]
        X1["@dev executa dev-apply-qa-fixes.md"]
        X2["Aplica correcoes"]
        X3["Valida com testes"]
        X4["Gera fixes-applied.json"]
    end

    subgraph ITER["Fase 5: Verificar Iteracao"]
        IT1{"iteration >= max?"}
        IT2["iteration++"]
    end

    subgraph END["Finalizacao"]
        E1["COMPLETE - Story Aprovada"]
        E2["ESCALATE - Requer Humano"]
        E3["Gerar Sumario Final"]
    end

    T1 --> I1
    T2 --> R1
    T3 --> X1

    I1 --> I2
    I2 --> I3
    I3 --> R1

    R1 --> R2
    R2 --> R3
    R3 --> C1

    C1 --> |"APPROVE"| C2
    C1 --> |"BLOCKED"| C3
    C1 --> |"REJECT"| C4

    C2 --> E1
    C3 --> E2

    C4 --> F1
    F1 --> F2
    F2 --> F3
    F3 --> X1

    X1 --> X2
    X2 --> X3
    X3 --> X4
    X4 --> IT1

    IT1 --> |"Sim"| E2
    IT1 --> |"Nao"| IT2
    IT2 --> R1

    E1 --> E3
    E2 --> E3

    style TRIGGER fill:#e1f5fe
    style REVIEW fill:#fff3e0
    style CHECK fill:#fce4ec
    style FIX_REQ fill:#f3e5f5
    style FIX fill:#e8f5e9
    style ITER fill:#fff8e1
    style END fill:#e0f2f1
```

### Diagrama de Estados

```mermaid
stateDiagram-v2
    [*] --> pending: *qa-loop {storyId}

    pending --> in_progress: Iniciar Loop

    in_progress --> in_progress: REJECT (iteration < max)
    in_progress --> completed: APPROVE
    in_progress --> escalated: BLOCKED
    in_progress --> escalated: Max Iterations
    in_progress --> stopped: *stop-qa-loop

    stopped --> in_progress: *resume-qa-loop
    escalated --> in_progress: *resume-qa-loop

    completed --> [*]
    escalated --> [*]: Intervencao Humana
```

### Sequencia de Comunicacao entre Agentes

```mermaid
sequenceDiagram
    participant U as Usuario
    participant S as System
    participant QA as @qa (Quinn)
    participant DEV as @dev (Dex)

    U->>S: *qa-loop STORY-42
    S->>S: Inicializar loop-status.json

    loop Ate max iteracoes ou APPROVE
        S->>QA: Executar qa-review-story.md
        QA->>QA: CodeRabbit Self-Healing
        QA->>QA: Analise Completa
        QA-->>S: verdict, issuesFound, gate-file

        alt verdict == APPROVE
            S-->>U: Story APROVADA
        else verdict == BLOCKED
            S-->>U: ESCALATE - Requer Humano
        else verdict == REJECT
            S->>QA: Executar qa-create-fix-request.md
            QA-->>S: fix-request.md, prioritizedIssues

            S->>DEV: Executar dev-apply-qa-fixes.md
            DEV->>DEV: Aplicar Fixes
            DEV->>DEV: Rodar Testes
            DEV-->>S: fixes-applied.json, issuesFixed

            S->>S: Incrementar iteration
        end
    end

    S-->>U: Sumario Final
```

---

## Steps Detalhados

### Step 1: Review (Fase 1)

| Atributo | Valor |
|----------|-------|
| **Nome** | `review` |
| **Fase** | 1 - QA Review |
| **Agente** | `@qa` (Quinn) |
| **Task** | `qa-review-story.md` |
| **Timeout** | 30 minutos (1.800.000 ms) |

**Descricao:**
Executa revisao completa de QA da implementacao da story, produzindo um verdict: APPROVE, REJECT ou BLOCKED.

**Inputs:**

```yaml
storyId: "{storyId}"
iteration: "{currentIteration}"
previousIssues: "{history[-1].issuesFound|0}"
```

**Outputs:**

- `gate-file.yaml` - Arquivo de gate com decisao
- `verdict` - APPROVE | REJECT | BLOCKED
- `issuesFound` - Numero de issues encontrados

**On Success:**
```
log: "Review complete: {verdict} ({issuesFound} issues)"
next: check_verdict
```

**On Failure:**
```
action: retry (max 2 tentativas)
on_exhausted: escalate
```

---

### Step 2: Check Verdict (Fase 2)

| Atributo | Valor |
|----------|-------|
| **Nome** | `check_verdict` |
| **Fase** | 2 - Verdict Check |
| **Agente** | `system` |

**Descricao:**
Avalia o verdict da revisao e determina a proxima acao.

**Logica de Decisao:**

```mermaid
flowchart TD
    V{"verdict?"}

    V -->|"APPROVE"| A["Action: COMPLETE<br/>Story aprovada apos N iteracoes"]
    V -->|"BLOCKED"| B["Action: ESCALATE<br/>Requer intervencao humana"]
    V -->|"REJECT"| C["Action: CONTINUE<br/>Prosseguir para criar fix request"]

    style A fill:#c8e6c9
    style B fill:#ffcdd2
    style C fill:#fff9c4
```

---

### Step 3: Create Fix Request (Fase 3)

| Atributo | Valor |
|----------|-------|
| **Nome** | `create_fix_request` |
| **Fase** | 3 - Create Fix Request |
| **Agente** | `@qa` (Quinn) |
| **Task** | `qa-create-fix-request.md` |

**Descricao:**
Gera um documento estruturado de fix request a partir dos findings da revisao. Prioriza issues e fornece instrucoes acionaveis de correcao.

**Inputs:**

```yaml
storyId: "{storyId}"
gateFile: "{outputs.review.gate-file}"
iteration: "{currentIteration}"
```

**Outputs:**

- `fix-request.md` - Documento com issues priorizados
- `prioritizedIssues` - Lista de issues ordenados por prioridade

**On Success:**
```
log: "Fix request created with {prioritizedIssues.length} prioritized issues"
next: fix_issues
```

**On Failure:**
```
action: continue
fallback: "Use raw gate file for fixes"
```

---

### Step 4: Fix Issues (Fase 4)

| Atributo | Valor |
|----------|-------|
| **Nome** | `fix_issues` |
| **Fase** | 4 - Apply Fixes |
| **Agente** | `@dev` (Dex) |
| **Task** | `dev-apply-qa-fixes.md` |
| **Timeout** | 60 minutos (3.600.000 ms) |

**Descricao:**
O agente desenvolvedor aplica as correcoes baseadas no fix request. Executa testes e valida as mudancas.

**Inputs:**

```yaml
storyId: "{storyId}"
fixRequest: "{outputs.create_fix_request.fix-request}"
iteration: "{currentIteration}"
```

**Outputs:**

- `fixes-applied.json` - Registro das correcoes aplicadas
- `issuesFixed` - Numero de issues corrigidos

**On Success:**
```
log: "Fixed {issuesFixed} of {issuesFound} issues"
next: increment_iteration
```

**On Failure:**
```
action: retry (max 2 tentativas)
on_exhausted: escalate com razao "Dev agent unable to apply fixes after retries"
```

---

### Step 5: Increment Iteration (Fase 5)

| Atributo | Valor |
|----------|-------|
| **Nome** | `increment_iteration` |
| **Fase** | 5 - Check Iteration |
| **Agente** | `system` |

**Descricao:**
Incrementa o contador de iteracao e verifica contra o maximo. Se max atingido, escala para humano.

**Logica:**

```mermaid
flowchart TD
    I{"iteration >= maxIterations?"}

    I -->|"Sim"| E["ESCALATE<br/>Max iterations reached without APPROVE"]
    I -->|"Nao"| C["CONTINUE<br/>Voltar para Step 1 (review)<br/>iteration++"]

    style E fill:#ffcdd2
    style C fill:#c8e6c9
```

---

## Agentes Participantes

### @qa - Quinn (Test Architect)

```yaml
Nome: Quinn
ID: qa
Titulo: Test Architect & Quality Advisor
Icone: ✅
Arquetipo: Guardian
Signo: Virgo

Responsabilidades no QA Loop:
  - Executar revisao completa de QA (qa-review-story.md)
  - Criar fix requests estruturados (qa-create-fix-request.md)
  - Determinar verdict: APPROVE, REJECT, BLOCKED
  - Gerar gate files com decisoes documentadas
```

**Ferramentas Utilizadas:**

| Ferramenta | Proposito |
|------------|-----------|
| `github-cli` | Code review e PR management |
| `browser` | End-to-end testing e UI validation |
| `context7` | Research testing frameworks |
| `supabase` | Database testing e data validation |
| `coderabbit` | Automated code review |

**Integracao CodeRabbit:**

```yaml
self_healing:
  enabled: true
  type: full
  max_iterations: 3
  timeout_minutes: 30
  severity_filter: [CRITICAL, HIGH]
  behavior:
    CRITICAL: auto_fix
    HIGH: auto_fix
    MEDIUM: document_as_debt
    LOW: ignore
```

---

### @dev - Dex (Full Stack Developer)

```yaml
Nome: Dex
ID: dev
Titulo: Full Stack Developer
Icone: 💻
Arquetipo: Builder
Signo: Aquarius

Responsabilidades no QA Loop:
  - Aplicar correcoes baseadas em fix request (dev-apply-qa-fixes.md)
  - Executar testes para validar correcoes
  - Atualizar Dev Agent Record na story
  - Garantir que fixes nao quebrem funcionalidades existentes
```

**Ferramentas Utilizadas:**

| Ferramenta | Proposito |
|------------|-----------|
| `git` | Local operations: add, commit, status, diff |
| `context7` | Look up library documentation |
| `supabase` | Database operations |
| `browser` | Test web applications |
| `coderabbit` | Pre-commit code quality review |

---

### System Agent

```yaml
Tipo: Automatico
Responsabilidades:
  - Verificar verdicts
  - Incrementar iteracoes
  - Controlar fluxo do workflow
  - Gerenciar status do loop
```

---

## Tasks Executadas

### 1. qa-review-story.md

**Localizacao:** `.aios-core/development/tasks/qa-review-story.md`

**Proposito:** Realizar revisao arquitetural de testes com decisao de quality gate.

**Processo de Revisao:**

```mermaid
flowchart TD
    subgraph PRE["Pre-Review"]
        P1["CodeRabbit Self-Healing Loop"]
        P2["Max 3 iteracoes CRITICAL/HIGH"]
    end

    subgraph RISK["Avaliacao de Risco"]
        R1["Auth/Payment/Security?"]
        R2["Sem testes adicionados?"]
        R3["Diff > 500 linhas?"]
        R4["Gate anterior FAIL?"]
        R5["> 5 ACs?"]
    end

    subgraph ANALYSIS["Analise Completa"]
        A1["Requirements Traceability"]
        A2["Code Quality Review"]
        A3["Test Architecture Assessment"]
        A4["NFR Validation"]
        A5["Testability Evaluation"]
        A6["Technical Debt Identification"]
    end

    subgraph OUTPUT["Saidas"]
        O1["QA Results Section"]
        O2["gate-file.yaml"]
    end

    PRE --> RISK
    RISK --> ANALYSIS
    ANALYSIS --> OUTPUT
```

**Criterios de Gate:**

| Gate | Condicao |
|------|----------|
| **PASS** | Todos requisitos criticos atendidos, sem issues bloqueantes |
| **CONCERNS** | Issues nao-criticos encontrados, time deve revisar |
| **FAIL** | Issues criticos que devem ser enderecados |
| **WAIVED** | Issues reconhecidos mas explicitamente waived pelo time |

---

### 2. qa-create-fix-request.md

**Localizacao:** `.aios-core/development/tasks/qa-create-fix-request.md`

**Proposito:** Gerar documento estruturado `QA_FIX_REQUEST.md` para @dev baseado nos findings de QA.

**Workflow:**

```mermaid
flowchart LR
    subgraph LOAD["Fase 1: Carregar"]
        L1["Localizar QA Report"]
        L2["Parse metadata"]
    end

    subgraph EXTRACT["Fase 2: Extrair"]
        E1["Filtrar por severidade"]
        E2["CRITICAL: sempre"]
        E3["MAJOR: sempre"]
        E4["MINOR: opcional"]
    end

    subgraph GENERATE["Fase 3: Gerar"]
        G1["Criar QA_FIX_REQUEST.md"]
        G2["Template estruturado"]
    end

    subgraph NOTIFY["Fase 4: Notificar"]
        N1["Output sucesso"]
        N2["Proximos passos @dev"]
    end

    LOAD --> EXTRACT --> GENERATE --> NOTIFY
```

**Estrutura do Fix Request:**

```markdown
# QA Fix Request: {storyId}

## Instructions for @dev
- Fix ONLY the issues listed below
- Do not add features or refactor unrelated code

## Summary
| Severity | Count | Status |
|----------|-------|--------|
| CRITICAL | N | Must fix before merge |
| MAJOR | N | Should fix before merge |
| MINOR | N | Optional improvements |

## Issues to Fix
### 1. [CRITICAL] {title}
- Location: `{file:line}`
- Problem: {description}
- Expected: {expected}
- Verification: [ ] {steps}

## Constraints
- [ ] Fix ONLY listed issues
- [ ] Run all tests: `npm test`
- [ ] Run linting: `npm run lint`
```

---

### 3. dev-apply-qa-fixes.md

**Localizacao:** `.aios-core/development/tasks/dev-apply-qa-fixes.md`

**Proposito:** Aplicar fixes baseados no feedback de QA e gate review.

**Workflow do Developer:**

```mermaid
flowchart TD
    subgraph LOAD["1. Carregar Gate Report"]
        L1["Carregar gate file"]
        L2["Ou buscar referencia na story"]
    end

    subgraph REVIEW["2. Revisar Findings"]
        R1["Categorizar issues"]
        R2["BLOCKING: Must fix"]
        R3["WARNING: Should fix"]
        R4["RECOMMENDATION: Nice to have"]
    end

    subgraph PLAN["3. Criar Plano"]
        P1["Identificar arquivos afetados"]
        P2["Determinar root cause"]
        P3["Planejar approach"]
    end

    subgraph FIX["4. Aplicar Fixes"]
        F1["Fazer mudancas"]
        F2["Seguir coding standards"]
        F3["Atualizar testes"]
    end

    subgraph VALIDATE["5. Validacao"]
        V1["npm run lint"]
        V2["npm test"]
        V3["npm run typecheck"]
    end

    subgraph UPDATE["6. Atualizar Story"]
        U1["Dev Agent Record"]
        U2["File List"]
    end

    LOAD --> REVIEW --> PLAN --> FIX --> VALIDATE --> UPDATE
```

**Exit Criteria:**

- Todos issues BLOCKING resolvidos
- Todos testes passando (lint, unit, integration)
- Story file atualizado
- Codigo pronto para re-review

---

## Pre-requisitos

### Para Iniciar o QA Loop

| Requisito | Descricao |
|-----------|-----------|
| **Story Status** | Deve estar em "Review" |
| **Implementacao Completa** | Developer completou todas as tasks |
| **File List Atualizada** | Lista de arquivos no story file esta atual |
| **Testes Automatizados** | Todos testes automatizados passando |
| **CodeRabbit Configurado** | CLI instalado no WSL (opcional mas recomendado) |

### Configuracao do Ambiente

```yaml
# Verificar CodeRabbit
wsl bash -c '~/.local/bin/coderabbit auth status'

# Verificar Node.js
node --version  # >= 18

# Verificar dependencias
npm test        # Deve passar
npm run lint    # Deve passar
```

---

## Entradas e Saidas

### Entradas do Workflow

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| `storyId` | string | Sim | Identificador da story (ex: "STORY-42") |
| `maxIterations` | number | Nao | Override do max (default: 5) |
| `mode` | string | Nao | `yolo`, `interactive`, `preflight` |

### Saidas do Workflow

| Arquivo | Localizacao | Descricao |
|---------|-------------|-----------|
| `loop-status.json` | `qa/loop-status.json` | Status atual do loop |
| `gate-file.yaml` | `qa/gates/{storyId}.yaml` | Decisao de quality gate |
| `fix-request.md` | `qa/QA_FIX_REQUEST.md` | Documento de correcoes |
| `fixes-applied.json` | `qa/fixes-applied.json` | Registro de correcoes |
| `summary.md` | `qa/summary.md` | Sumario final do loop |

### Schema do Status File

```yaml
storyId: string              # ID da story
currentIteration: number     # Iteracao atual
maxIterations: number        # Maximo configurado
status: enum                 # pending | in_progress | completed | stopped | escalated
startedAt: ISO-8601          # Timestamp de inicio
updatedAt: ISO-8601          # Ultima atualizacao

history:
  - iteration: number
    reviewedAt: ISO-8601
    verdict: APPROVE | REJECT | BLOCKED
    issuesFound: number
    fixedAt: ISO-8601 | null
    issuesFixed: number | null
    duration: number         # milliseconds
```

---

## Pontos de Decisao

### Diagrama de Decisoes

```mermaid
flowchart TD
    subgraph D1["Decisao 1: Verdict"]
        V1{"Qual o verdict?"}
        V1 -->|"APPROVE"| V1A["Completar Loop"]
        V1 -->|"BLOCKED"| V1B["Escalar Imediatamente"]
        V1 -->|"REJECT"| V1C["Continuar para Fixes"]
    end

    subgraph D2["Decisao 2: Max Iterations"]
        I1{"iteration >= max?"}
        I1 -->|"Sim"| I1A["Escalar: Max Atingido"]
        I1 -->|"Nao"| I1B["Incrementar e Continuar"]
    end

    subgraph D3["Decisao 3: Fix Failure"]
        F1{"Fixes aplicados?"}
        F1 -->|"Sucesso"| F1A["Prosseguir para Review"]
        F1 -->|"Falha"| F1B{"Retries restantes?"}
        F1B -->|"Sim"| F1C["Retry"]
        F1B -->|"Nao"| F1D["Escalar: Fix Failure"]
    end

    subgraph D4["Decisao 4: Review Failure"]
        R1{"Review completou?"}
        R1 -->|"Sucesso"| R1A["Processar Verdict"]
        R1 -->|"Falha"| R1B{"Retries restantes?"}
        R1B -->|"Sim"| R1C["Retry Review"]
        R1B -->|"Nao"| R1D["Escalar: Review Failure"]
    end
```

### Criterios de Escalacao

| Trigger | Razao | Acao |
|---------|-------|------|
| `max_iterations_reached` | Loop atingiu max sem APPROVE | Escalar com contexto completo |
| `verdict_blocked` | QA retornou BLOCKED | Escalar imediatamente |
| `fix_failure` | @dev nao conseguiu aplicar fixes apos retries | Escalar com log de erros |
| `manual_escalate` | Usuario executou `*escalate-qa-loop` | Escalar sob demanda |

---

## Configuracao

### Parametros Configuraveis

```yaml
config:
  # Maximo de iteracoes (AC2)
  maxIterations: 5
  configPath: autoClaude.qaLoop.maxIterations

  # Progress tracking
  showProgress: true
  verbose: true

  # Localizacao do status file (AC4)
  statusFile: qa/loop-status.json

  # Integracao com Dashboard (AC7)
  dashboardStatusPath: .aios/dashboard/status.json
  legacyStatusPath: .aios/status.json

  # Timeout por fase (milliseconds)
  reviewTimeout: 1800000    # 30 minutos
  fixTimeout: 3600000       # 60 minutos

  # Configuracao de retry
  maxRetries: 2
  retryDelay: 5000          # 5 segundos
```

### Customizacao por Projeto

No arquivo `.aios-core/core-config.yaml`:

```yaml
autoClaude:
  qaLoop:
    maxIterations: 3        # Reduzir para projetos menores
    reviewTimeout: 900000   # 15 min para reviews rapidos
    fixTimeout: 1800000     # 30 min para fixes simples
```

---

## Controle de Execucao

### Comandos Disponiveis

| Comando | Acao | Descricao |
|---------|------|-----------|
| `*qa-loop {storyId}` | `start_loop` | Inicia loop completo |
| `*qa-loop-review` | `run_step: review` | Inicia apenas do step review |
| `*qa-loop-fix` | `run_step: fix` | Inicia apenas do step fix |
| `*stop-qa-loop` | `stop_loop` | Para loop e salva estado |
| `*resume-qa-loop` | `resume_loop` | Retoma loop parado/escalado |
| `*escalate-qa-loop` | `escalate` | Forca escalacao manual |
| `*qa-loop --reset` | `reset` | Deleta status e reinicia |

### Fluxo de Stop/Resume

```mermaid
sequenceDiagram
    participant U as Usuario
    participant S as System
    participant F as loop-status.json

    Note over U,F: STOP
    U->>S: *stop-qa-loop
    S->>F: status = "stopped"
    S->>F: Salvar estado atual
    S-->>U: Loop parado em iteration N

    Note over U,F: RESUME
    U->>S: *resume-qa-loop
    S->>F: Carregar estado
    S->>S: Verificar status era stopped/escalated
    S->>F: status = "in_progress"
    S-->>U: Loop retomado em iteration N
```

---

## Escalacao

### Triggers de Escalacao

```yaml
escalation:
  enabled: true
  triggers:
    - max_iterations_reached
    - verdict_blocked
    - fix_failure
    - manual_escalate
```

### Pacote de Contexto

Quando ocorre escalacao, o sistema prepara:

| Item | Descricao |
|------|-----------|
| `loop-status.json` | Status completo do loop |
| Gate files | Todos gate files do historico |
| Fix requests | Todos fix requests gerados |
| Summary | Resumo de todas iteracoes |

### Mensagem de Notificacao

```
QA Loop Escalation for {storyId}

Reason: {escalation.reason}
Iterations completed: {currentIteration}
Last verdict: {history[-1].verdict}
Outstanding issues: {history[-1].issuesFound - history[-1].issuesFixed}

Review the context package and decide:
1. Resume loop: *resume-qa-loop {storyId}
2. Manually fix and approve
3. Reject story and create follow-up
```

### Canais de Notificacao

- `log` - Log do sistema
- `console` - Output no terminal

---

## Integracao com Dashboard

### Status JSON Schema

```yaml
integration:
  status_json:
    track_loop: true
    field: qaLoop
    update_on_each_iteration: true

    schema:
      storyId: string
      status: string
      currentIteration: number
      maxIterations: number
      lastVerdict: string
      lastIssuesFound: number
      updatedAt: ISO-8601
```

### Atualizacao de Status do Projeto

```yaml
project_status:
  update_story_status: true
  status_field: qaLoopStatus
```

### Notificacoes

| Evento | Mensagem | Canais |
|--------|----------|--------|
| `on_approve` | "QA Loop APPROVED: {storyId}" | log |
| `on_escalate` | "QA Loop ESCALATED: {storyId} - needs attention" | log |
| `on_stop` | "QA Loop STOPPED: {storyId}" | log |

---

## Tratamento de Erros

### Erros Comuns e Resolucoes

| Erro | Causa | Resolucao | Acao |
|------|-------|-----------|------|
| `missing_story_id` | Story ID nao fornecido | "Usage: *qa-loop STORY-42" | prompt |
| `review_timeout` | Fase de review excedeu timeout | Verificar status do QA agent | escalate |
| `fix_timeout` | Fase de fix excedeu timeout | Verificar status do Dev agent | escalate |
| `invalid_status` | Arquivo de status corrompido | "Reset loop: *qa-loop {storyId} --reset" | halt |

### Estrategias de Retry

```yaml
on_failure:
  action: retry
  max_retries: 2              # Maximo de tentativas
  retryDelay: 5000            # Delay entre tentativas
  on_exhausted: escalate      # Acao quando retries esgotados
```

---

## Troubleshooting

### Problema: Loop Travado em Review

**Sintomas:**
- Review nao completa apos 30 minutos
- Status permanece "in_progress"

**Diagnostico:**
```bash
# Verificar status do loop
cat qa/loop-status.json | jq '.status, .currentIteration'

# Verificar ultimo gate file
ls -la qa/gates/
```

**Solucao:**
1. Executar `*stop-qa-loop`
2. Verificar se CodeRabbit esta respondendo
3. Executar `*resume-qa-loop` para retomar

---

### Problema: Fix Nao Aplicado

**Sintomas:**
- @dev reporta sucesso mas issues persistem
- Re-review encontra mesmos problemas

**Diagnostico:**
```bash
# Verificar fix request
cat qa/QA_FIX_REQUEST.md

# Verificar fixes aplicados
cat qa/fixes-applied.json
```

**Solucao:**
1. Revisar manualmente o fix-request.md
2. Verificar se @dev atualizou os arquivos corretos
3. Rodar testes localmente antes de re-review

---

### Problema: Max Iterations Atingido

**Sintomas:**
- Loop escala apos 5 iteracoes sem APPROVE

**Diagnostico:**
```bash
# Ver historico completo
cat qa/loop-status.json | jq '.history'
```

**Solucao:**
1. Analisar pattern de issues recorrentes
2. Verificar se requisitos estao claros
3. Considerar aumentar maxIterations ou resolver manualmente

---

### Problema: CodeRabbit Nao Funciona

**Sintomas:**
- Erro "coderabbit: command not found"
- Timeout na fase de self-healing

**Diagnostico:**
```bash
# Verificar instalacao
wsl bash -c 'which coderabbit'

# Verificar autenticacao
wsl bash -c '~/.local/bin/coderabbit auth status'
```

**Solucao:**
1. Reinstalar CodeRabbit no WSL
2. Executar `coderabbit auth login`
3. Verificar path no agent config

---

### Problema: Status File Corrompido

**Sintomas:**
- Erro "invalid_status"
- Loop nao inicia ou retoma

**Solucao:**
```bash
# Backup do arquivo corrompido
mv qa/loop-status.json qa/loop-status.json.bak

# Reiniciar loop
*qa-loop {storyId} --reset
```

---

## Referencias

### Arquivos do Workflow

| Arquivo | Localizacao |
|---------|-------------|
| Workflow Definition | `.aios-core/development/workflows/qa-loop.yaml` |
| QA Review Task | `.aios-core/development/tasks/qa-review-story.md` |
| Create Fix Request Task | `.aios-core/development/tasks/qa-create-fix-request.md` |
| Apply QA Fixes Task | `.aios-core/development/tasks/dev-apply-qa-fixes.md` |
| QA Agent | `.aios-core/development/agents/qa.md` |
| Dev Agent | `.aios-core/development/agents/dev.md` |

### Documentacao Relacionada

| Documento | Descricao |
|-----------|-----------|
| Epic 6 - QA Evolution | Contexto do Autonomous Development Engine |
| Story 6.5 | Story de implementacao do QA Loop |
| Story 6.3.3 | CodeRabbit Self-Healing Integration |
| ADR-XXX | Architecture Decision Record (se existir) |

### Templates

| Template | Localizacao | Uso |
|----------|-------------|-----|
| `qa-gate-tmpl.yaml` | `.aios-core/development/templates/` | Gate file structure |
| `story-tmpl.yaml` | `.aios-core/development/templates/` | Story file structure |

---

## Historico de Alteracoes

| Data | Versao | Autor | Mudancas |
|------|--------|-------|----------|
| 2026-02-04 | 1.0 | Technical Documentation Specialist | Versao inicial |

---

*Documentacao gerada automaticamente a partir do workflow `qa-loop.yaml`*
