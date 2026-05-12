# Guia de Workflows do AIOX

**Versao:** 1.0.0
**Ultima Atualizacao:** 2026-02-02
**Status:** Ativo

---

## Visao Geral

Os Workflows do AIOX sao sequencias orquestradas de atividades de agents que automatizam processos de desenvolvimento complexos. Eles fornecem padroes estruturados e repetitivos para cenarios de desenvolvimento comuns.

### Conceitos Chave

| Conceito | Descricao |
|----------|-----------|
| **Workflow** | Uma definicao YAML que orquestra multiplos agents atraves de uma sequencia de steps |
| **Phase** | Um agrupamento logico de steps relacionados dentro de um workflow |
| **Step** | Uma unica acao executada por um agent dentro de um workflow |
| **Transition** | Movimento de um step para o proximo, opcionalmente com condicoes |
| **State** | Rastreamento persistente do progresso do workflow entre sessoes |

---

## Tipos de Workflow

### Por Tipo de Projeto

| Tipo | Descricao | Caso de Uso |
|------|-----------|-------------|
| **Greenfield** | Novos projetos do zero | Iniciar uma nova aplicacao |
| **Brownfield** | Projetos existentes | Melhorar ou auditar codigo existente |
| **Generic** | Qualquer tipo de projeto | Processos transversais como desenvolvimento de story |

### Por Escopo

| Escopo | Descricao | Exemplos |
|--------|-----------|----------|
| **Fullstack** | Aplicacao completa | `greenfield-fullstack`, `brownfield-fullstack` |
| **UI** | Apenas frontend | `greenfield-ui`, `brownfield-ui` |
| **Service** | Apenas backend | `greenfield-service`, `brownfield-service` |
| **Discovery** | Analise e auditoria | `brownfield-discovery` |

---

## Workflows Disponiveis

### Workflows de Desenvolvimento Core

#### 1. Ciclo de Desenvolvimento de Story
**ID:** `story-development-cycle`
**Tipo:** Generic
**Agents:** SM → PO → Dev → QA

O workflow mais comum para desenvolvimento iterativo:

```
┌─────────────────────────────────────────────────────────────┐
│                   Story Development Cycle                    │
│                                                              │
│  @sm: Create Story → @po: Validate → @dev: Implement → @qa  │
│         │                  │               │            │    │
│         ▼                  ▼               ▼            ▼    │
│     Draft Story       10 Checks       Code + Tests    Gate   │
└─────────────────────────────────────────────────────────────┘
```

**Phases:**
1. **Story Creation** - SM cria a proxima story do backlog
2. **Story Validation** - PO valida com checklist de 10 pontos
3. **Implementation** - Dev implementa com testes
4. **QA Review** - QA executa quality gate

**Quando usar:**
- Qualquer desenvolvimento de story (greenfield ou brownfield)
- Ciclo completo com validacao e quality gate
- Quando voce precisa de rastreabilidade de processo

---

#### 2. Greenfield Fullstack
**ID:** `greenfield-fullstack`
**Tipo:** Greenfield
**Agents:** DevOps → Analyst → PM → UX → Architect → PO → SM → Dev → QA

Workflow completo para novas aplicacoes full-stack:

**Phases:**
1. **Environment Bootstrap** - DevOps configura a infraestrutura do projeto
2. **Discovery & Planning** - Criar project brief, PRD, specs, arquitetura
3. **Document Sharding** - Desmembrar documentos para desenvolvimento
4. **Development Cycle** - Implementacao iterativa de stories

**Quando usar:**
- Construir aplicacoes prontas para producao
- Multiplos membros da equipe envolvidos
- Requisitos de features complexos
- Manutencao de longo prazo esperada

---

#### 3. Brownfield Discovery
**ID:** `brownfield-discovery`
**Tipo:** Brownfield
**Agents:** Architect → Data Engineer → UX → QA → Analyst → PM

Avaliacao completa de divida tecnica para projetos existentes:

**Phases:**
1. **Data Collection** - Documentacao de sistema, banco de dados, frontend
2. **Initial Consolidation** - Rascunho da avaliacao
3. **Specialist Validation** - Revisoes de DB, UX, QA
4. **Final Reports** - Avaliacao + Relatorio executivo
5. **Planning** - Criacao de epic e stories

**Quando usar:**
- Migrando do Lovable/v0.dev
- Auditoria completa de codebase
- Avaliacao de divida tecnica antes de investimento

---

### Outros Workflows

| Workflow | ID | Descricao |
|----------|-------|-------------|
| Greenfield UI | `greenfield-ui` | Novos projetos apenas frontend |
| Greenfield Service | `greenfield-service` | Novos projetos apenas backend |
| Brownfield Fullstack | `brownfield-fullstack` | Melhorar aplicacoes fullstack existentes |
| Brownfield UI | `brownfield-ui` | Melhorar frontends existentes |
| Brownfield Service | `brownfield-service` | Melhorar backends existentes |
| QA Loop | `qa-loop` | Ciclo de garantia de qualidade |
| Spec Pipeline | `spec-pipeline` | Refinamento de especificacao |
| Design System Build | `design-system-build-quality` | Criacao de design system |

---

## Como Criar um Workflow

### Passo 1: Planeje Seu Workflow

Defina:
- **Proposito**: Qual problema este workflow resolve?
- **Agents**: Quais agents participam?
- **Sequencia**: Qual e a ordem dos steps?
- **Condicoes**: Ha pontos de decisao ou atividades paralelas?

### Passo 2: Use a Task de Criar Workflow

```bash
# Ative um agent que pode criar workflows
@architect

# Execute a task de criar workflow
*create-workflow
```

### Passo 3: Responda as Perguntas de Elicitacao

A task perguntara:

1. **Target Context**: `core`, `squad`, ou `hybrid`
2. **Workflow Name**: ex., `feature-development`
3. **Primary Goal**: Qual e o resultado esperado?
4. **Stages/Phases**: Principais phases do workflow
5. **Agent Orchestration**: Quais agents em cada stage
6. **Resource Requirements**: Templates, arquivos de dados necessarios

### Passo 4: Estrutura do Workflow

O workflow gerado segue esta estrutura:

```yaml
workflow:
  id: my-workflow
  name: My Custom Workflow
  version: "1.0"
  description: "Description of what this workflow does"
  type: greenfield | brownfield | generic
  project_types:
    - web-app
    - saas

  metadata:
    elicit: true
    confirmation_required: true

  phases:
    - phase_1: Phase Name
    - phase_2: Another Phase

  sequence:
    - step: step_name
      id: unique-id
      phase: 1
      agent: agent-name
      action: Action description
      creates: output-file.md
      requires: previous-step-id
      optional: false
      notes: |
        Detailed instructions for this step...
      next: next-step-id

  flow_diagram: |
    ```mermaid
    graph TD
      A[Start] --> B[Step 1]
      B --> C[Step 2]
    ```

  decision_guidance:
    when_to_use:
      - Scenario 1
      - Scenario 2
    when_not_to_use:
      - Anti-pattern 1

  handoff_prompts:
    step1_complete: "Step 1 done. Next: @agent for step 2"
```

### Passo 5: Local de Saida

Workflows sao salvos baseados no contexto:
- **Core**: `.aiox-core/development/workflows/{name}.yaml`
- **Squad**: `squads/{squad}/workflows/{name}.yaml`
- **Hybrid**: `squads/{squad}/workflows/{name}.yaml`

---

## Como Executar um Workflow

### Metodo 1: Modo Guiado (Padrao)

```bash
# Iniciar um workflow
*run-workflow story-development-cycle start

# Verificar status
*run-workflow story-development-cycle status

# Continuar para o proximo step
*run-workflow story-development-cycle continue

# Pular step opcional
*run-workflow story-development-cycle skip

# Abortar workflow
*run-workflow story-development-cycle abort
```

### Metodo 2: Modo Engine

```bash
# Executar com automacao completa do engine
*run-workflow greenfield-fullstack start --mode engine
```

### State do Workflow

O state e persistido em `.aiox/{instance-id}-state.yaml`:

```yaml
instance_id: "wf-abc123"
workflow_name: "story-development-cycle"
status: "active"
current_step: 2
total_steps: 4
steps:
  - id: create
    status: completed
    completed_at: "2026-02-02T10:00:00Z"
  - id: validate
    status: in_progress
  - id: implement
    status: pending
  - id: review
    status: pending
```

### Continuidade Multi-Sessao

Workflows persistem entre sessoes do Claude Code:

1. Usuario inicia nova sessao
2. Ativa @aiox-master
3. Executa `*run-workflow {name} continue`
4. Sistema carrega state, mostra step atual
5. Usuario executa step
6. Retorna e executa `continue` novamente

---

## Padroes de Workflow

O AIOX detecta padroes comuns de workflow baseados no historico de comandos:

### Padroes Detectados

| Padrao | Comandos Gatilho | Sequencia de Agents |
|--------|-----------------|----------------|
| Story Development | `validate-story-draft`, `develop`, `review-qa` | PO → Dev → QA → DevOps |
| Epic Creation | `create-epic`, `create-story`, `validate-story-draft` | PO → SM → Architect |
| Architecture Review | `analyze-impact`, `create-doc`, `review-proposal` | Architect → QA → Dev |
| Git Workflow | `pre-push-quality-gate`, `github-pr-automation` | Dev → DevOps |
| Database Workflow | `db-domain-modeling`, `db-schema-audit` | Data Engineer → Dev → QA |

### Deteccao de Padroes

O sistema usa `workflow-patterns.yaml` para:
- Detectar em qual workflow voce esta baseado nos comandos usados
- Sugerir proximos steps com scores de confianca
- Fornecer mensagens de handoff contextuais

---

## Melhores Praticas

### Design de Workflow

1. **Mantenha phases focadas** - Cada phase deve ter um proposito claro
2. **Defina handoffs claros** - Documente o que cada agent passa para o proximo
3. **Inclua steps opcionais** - Permita flexibilidade para casos simples
4. **Adicione orientacao de decisao** - Ajude usuarios a saber quando usar/nao usar

### Execucao de Workflow

1. **Comece com status** - Verifique `*run-workflow {name} status` antes de continuar
2. **Siga os prompts de handoff** - Eles contem contexto importante
3. **Nao pule steps obrigatorios** - Apenas steps opcionais podem ser pulados
4. **Documente decisoes** - Mantenha notas para referencia futura

### Criacao de Workflow

1. **Teste com casos simples primeiro** - Valide que o fluxo funciona
2. **Inclua diagramas de fluxo** - Representacao visual ajuda no entendimento
3. **Adicione notas detalhadas** - Usuarios futuros agradecerao
4. **Defina tratamento de erros** - O que acontece quando as coisas dao errado?

---

## Workflow vs Task

| Aspecto | Workflow | Task |
|---------|----------|------|
| **Escopo** | Multiplos steps, multiplos agents | Um unico step, um unico agent |
| **State** | Persistido entre sessoes | Sem estado |
| **Caso de Uso** | Processos complexos | Operacoes atomicas |
| **Localizacao** | `.aiox-core/development/workflows/` | `.aiox-core/development/tasks/` |

---

## Solucao de Problemas

### Problemas Comuns

**Workflow nao encontrado:**
```
Error: Workflow '{name}' not found
```
- Verifique se o nome do workflow corresponde ao ID do arquivo
- Verifique o contexto alvo (core/squad)

**Nenhuma instancia ativa:**
```
Error: No active workflow instance found
```
- Inicie o workflow primeiro com `*run-workflow {name} start`

**Step nao e opcional:**
```
Error: Cannot skip non-optional step
```
- Complete o step ou aborte o workflow

### Obtendo Ajuda

```bash
# Listar workflows disponiveis
ls .aiox-core/development/workflows/

# Validar um workflow
*validate-workflow {name}

# Ver detalhes do workflow
cat .aiox-core/development/workflows/{name}.yaml
```

---

## Documentacao Relacionada

- [Diagrama de Workflow HybridOps](./hybridOps/workflow-diagram.md) - Padroes de colaboracao humano-agent
- [Guia de Referencia de Agents](../agent-reference-guide.md) - Agents disponiveis e suas capacidades
- [Desenvolvimento Orientado a Story](./user-guide.md#story-driven-development) - O workflow de story

---

*Guia de Workflows do AIOX v1.0 - Orquestrando Colaboracao IA-Humano*
