# AIOS Best Practices - Padroes Avancados para Criacao de Squads

> **Source:** AIOS Quality Standards
> **Version:** 1.0.0
> **Updated:** 2026-01-24

Este documento consolida as boas praticas para criacao de squads de alta qualidade no ecossistema AIOS.

---

## Sumario Executivo

Este documento define **15 padroes avancados** que devem ser considerados como referencia para criacao de novos squads de alta qualidade.

### Metricas de Maturidade

| Dimensao | Padrao AIOS | Minimo | Recomendado |
|----------|-------------|--------|-------------|
| Estrutura de Tasks | 8 campos obrigatorios | 5 campos | 8 campos |
| Quality Gates | Gates formais | 2 gates | 10+ gates |
| Heuristicas | Codificadas com pesos | 0 | 3+ |
| Padroes nomeados | Prefixo-xxx | 0 | 10+ |
| Executors tipados | 4 tipos (H/A/Hy/W) | 2 tipos | 4 tipos |

---

## Parte 1: Padroes Estruturais

### 1.1 Task Anatomy Standard (HO-TP-001)

**Principio:** Toda task deve ter 8 campos obrigatorios, sem excecao.

```yaml
task_anatomy:
  required_fields: 9
  fields:
    - task_name          # Formato: "Verbo + Objeto"
    - status             # Enum: pending|in_progress|completed
    - responsible_executor  # Quem executa
    - execution_type     # Enum: Human|Agent|Hybrid|Worker
    - estimated_time     # Formato: "Xh" ou "X-Yh"
    - input              # Array de inputs necessarios
    - output             # Array de outputs produzidos
    - action_items       # Passos de execucao
    - acceptance_criteria # Criterios de aceite
```

**Por que funciona:**
- Elimina ambiguidade sobre o que a task faz
- Permite automacao de validacao
- Facilita handoff entre executores
- Torna tasks auditaveis

**Aplicacao em novos squads:**
```yaml
# Em config.yaml do squad
task_standards:
  enforce_anatomy: true
  validator: HO-TP-001
  fields:
    required: [task_name, status, responsible_executor, execution_type, input, output, action_items, acceptance_criteria]
    optional: [estimated_time, dependencies, templates, quality_gate]
```

---

### 1.2 Executor Matrix (HO-EP-xxx)

**Principio:** Classificar formalmente QUEM executa cada tarefa.

| Tipo | ID | Caracteristicas | Custo | Velocidade | Quando Usar |
|------|-----|----------------|-------|------------|-------------|
| Human | HO-EP-001 | Julgamento, criatividade, relacionamentos | $$$ | Lenta | Decisoes criticas, negociacoes |
| Agent (AI) | HO-EP-002 | Analise, geracao, reconhecimento de padroes | $$$$ | Rapida | Analise de dados, geracao de conteudo |
| Hybrid | HO-EP-003 | AI assiste, humano valida | $$ | Moderada | Revisoes, aprovacoes assistidas |
| Worker | HO-EP-004 | Deterministico, APIs, file ops | $ | Muito rapida | Automacoes, integrações |

**Matriz de Decisao:**

```yaml
executor_selection:
  requires_creativity: Human
  requires_judgment: Human | Hybrid
  requires_speed: Agent | Worker
  requires_consistency: Worker
  requires_validation: Hybrid
  requires_learning: Agent
```

**Aplicacao em novos squads:**
```yaml
# Em cada task definition
- id: "analyze-content"
  executor:
    type: Agent
    pattern: HO-EP-002
    rationale: "Analise de padroes em grande volume de dados"
    fallback: Hybrid  # Se AI falhar, humano assume
```

---

### 1.3 Pattern Library (HO-xxx)

**Principio:** Todo padrao reutilizavel deve ter um ID unico e referenciavel.

```yaml
pattern_library:
  categories:
    TP: Task Patterns      # HO-TP-001, HO-TP-002...
    EP: Executor Patterns  # HO-EP-001, HO-EP-002...
    PP: Process Patterns   # HO-PP-001, HO-PP-002...
    IP: Integration Patterns # HO-IP-001, HO-IP-002...
    AP: Automation Patterns  # HO-AP-001, HO-AP-002...
    DP: Documentation Patterns # HO-DP-001, HO-DP-002...

  naming_convention:
    format: "{PREFIX}-{CATEGORY}-{NUMBER}"
    example: "HO-TP-001"
    prefix: "HO" # Squad identifier (ex: MM para MMOS, CR para Creator-OS)
```

**Beneficios:**
- Consistencia em todo o squad
- Facilita auditoria e compliance
- Permite validacao automatizada
- Documentacao auto-referenciavel

**Aplicacao em novos squads:**
```yaml
# Em config.yaml do squad
pattern_library:
  prefix: "MM"  # MMOS example
  categories:
    - id: TP
      name: "Task Patterns"
      patterns:
        - id: MM-TP-001
          name: "Mind Creation Task"
          description: "Padrao para tasks de criacao de minds"
```

---

## Parte 2: Quality Gates e Validacao

### 2.1 Quality Gate Pattern (HO-PP-003)

**Principio:** Todo workflow deve ter checkpoints formais entre fases.

```yaml
quality_gate_anatomy:
  required_fields:
    - id            # QG-X.Y formato
    - name          # Nome descritivo
    - phase         # Fase do workflow
    - placement     # entry|transition|exit
    - type          # manual|automated|hybrid|external
    - severity      # blocking|warning|info
    - criteria      # Array de criterios
    - executor      # Quem valida
    - pass_action   # O que fazer se passar
    - fail_action   # O que fazer se falhar
```

**Exemplo Real (QG-1.1B - Briefing Completeness):**

```yaml
quality_gate:
  id: "QG-1.1B"
  name: "Briefing Completeness Gate"
  phase: 1
  placement: "transition"
  type: "hybrid"
  severity: "blocking"

  criteria:
    - check: "Overall completude score"
      type: "threshold"
      field: "completude_percentual"
      value: 60
      operator: ">="
      weight: 0.4

    - check: "Critical sections completude"
      type: "threshold"
      field: "critical_sections_score"
      value: 50
      operator: ">="
      weight: 0.3

  thresholds:
    pass: 0.60
    review: 0.40
    fail: 0.40

  executor:
    type: "hybrid"
    ai_agent: "briefing-analyzer"
    human_review: "Account Manager"

  pass_action:
    - "Status -> Kick-off Agendado"
    - "Notify AM to schedule kick-off"

  fail_action:
    - "Status -> Bloqueado"
    - "Generate client questions email"
    - "Create follow-up task"
```

**Tipos de Gate por Fase:**

| Fase | Gate Type | Severity | Exemplo |
|------|-----------|----------|---------|
| Entry | automated | blocking | Validar dados minimos |
| Transition | hybrid | blocking | AI analisa + humano valida |
| Exit | manual | blocking | Aprovacao final |
| Exception | automated | warning | Alerta de erro |

---

### 2.2 Checkpoint Policy

**Principio:** Checkpoints devem ter politica clara de execucao.

```yaml
workflow_config:
  checkpoint_policy: always_active  # Nunca pular QGs

  checkpoint_modes:
    always_active: "Todo checkpoint DEVE passar"
    skip_on_override: "Pode pular com aprovacao manual"
    advisory: "Apenas alerta, nao bloqueia"

  fail_fast: true  # Para no primeiro erro
  allow_manual_override: false  # Sem bypass
```

---

### 2.3 Axioma Validator (10 Dimensoes)

**Principio:** Validacao multi-dimensional com pesos e thresholds.

```yaml
axioma_validator:
  dimensions:
    - name: "Truthfulness"
      weight: 1.0
      threshold: 7.0
      veto_power: true  # Se falhar, BLOQUEIA

    - name: "Coherence"
      weight: 0.9
      threshold: 6.0
      veto_power: false

    - name: "Strategic Alignment"
      weight: 0.9
      threshold: 6.5
      veto_power: false

    - name: "Operational Excellence"
      weight: 0.8
      threshold: 6.0
      veto_power: false

    - name: "Innovation Capacity"
      weight: 0.6
      threshold: 5.5
      veto_power: false

    - name: "Risk Management"
      weight: 0.7
      threshold: 6.0
      veto_power: false

    - name: "Resource Optimization"
      weight: 0.7
      threshold: 6.0
      veto_power: false

    - name: "Stakeholder Value"
      weight: 0.8
      threshold: 6.5
      veto_power: false

    - name: "Sustainability"
      weight: 0.6
      threshold: 5.5
      veto_power: false

    - name: "Adaptability"
      weight: 0.7
      threshold: 6.0
      veto_power: false

  scoring:
    scale: 0-10
    pass_threshold: 7.0  # Media ponderada
    minimum_per_dimension: 6.0  # Nenhuma abaixo disso
```

**Aplicacao em novos squads:**
Criar versao simplificada com 5 dimensoes core:
- Truthfulness (veto)
- Coherence
- Strategic Alignment
- Operational Excellence
- Stakeholder Value

---

## Parte 3: Heuristicas de Decisao

### 3.1 Estrutura de Heuristica

**Principio:** Regras de decisao devem ser codificadas, nao implicitas.

```yaml
heuristic_anatomy:
  metadata:
    id: "PV_XX_001"  # {Persona}_{Categoria}_{Numero}
    name: "Nome descritivo"
    type: "Decision Heuristic"
    phase: 3
    agent: "@squad:executor-designer"
    pattern: "HO-PP-003"

  configuration:
    weights:
      dimension_1: 0.9
      dimension_2: 0.8
      dimension_3: 0.3

    thresholds:
      dimension_1: 0.7
      dimension_2: 0.6
      dimension_3: null  # Context-dependent

    veto_conditions:
      - condition: "dimension_1 < 0.7"
        action: "VETO - Immediate rejection"

  decision_tree:
    primary_branch: "IF x THEN y"
    secondary_branch: "ELSE IF a THEN b"
    termination: "Condition for stopping"
    fallback: "What to do when uncertain"

  output:
    type: "decision"
    values: ["APPROVE", "REVIEW", "VETO"]

  failure_modes:
    - name: "False Negative"
      trigger: "Condition"
      detection: "How to detect"
      recovery: "How to fix"
      prevention: "How to prevent"
```

---

### 3.2 Heuristicas Core para Squads

#### PV_BS_001 - Business Strategy Focus

```yaml
weights:
  end_state_vision: 0.9  # Visao de longo prazo
  market_signals: 0.1    # Sinais de mercado

thresholds:
  high_priority: 0.8
  veto_threshold: 0.7

veto_conditions:
  - condition: "end_state_vision_clarity < 0.7"
    action: "VETO - Vision unclear"
```

**Aplicacao:** Priorizar tasks que constroem para o estado final desejado.

---

#### PV_PA_001 - Systemic Coherence Scan

```yaml
weights:
  truthfulness_coherence: 1.0  # VETO power
  system_adherence_potential: 0.8
  technical_skill: 0.3

veto_conditions:
  - condition: "truthfulness_coherence < 0.7"
    action: "VETO - REJECT/REMOVE immediately"
```

**Aplicacao:** Avaliar executores (humanos ou agentes) quanto a confiabilidade.

---

#### PV_PM_001 - Automation Tipping Point

```yaml
automation_mandate:
  rule_1:
    trigger: "Task repeated 2+ times"
    action: "Document and automate"

  rule_2:
    trigger: "Task repeated 3+ times without automation"
    assessment: "Grave design failure"

  rule_3:
    trigger: "Any automation"
    requirement: "Must have guardrails"

guardrails_required:
  - loop_prevention
  - idempotency
  - audit_trail
  - manual_escape
  - retry_logic
```

**Aplicacao:** Decidir quando automatizar vs manter manual.

---

## Parte 4: Workflows Avancados

### 4.1 Wave-Based Workflow (HO-PP-001)

**Principio:** Organizar trabalho em "ondas" com sync points.

```yaml
workflow_structure:
  type: wave_based
  total_waves: 9

  wave_anatomy:
    name: "Wave Name"
    day: "D1-D2"  # Timeline
    execution: parallel | sequential | mixed
    sync_point: "all_complete | any_complete | meeting_complete"
    depends_on: previous_wave
    tasks: []
    completion_criteria: []
```

**Exemplo Real:**

```yaml
wave_1:
  name: "Project Setup"
  day: "D1"
  execution: parallel
  sync_point: "all_complete"
  tasks:
    - id: "1.1"
      name: "Cadastro Manual"
      executor: "human:janine"
      priority: critical

    - id: "1.1A"
      name: "Abertura Automatica"
      executor: "worker:project-setup-worker"
      depends_on: ["1.1"]

    - id: "1.1B"
      name: "Quality Gate Briefing"
      executor: "agent:briefing-analyzer"
      depends_on: ["1.1"]
      quality_gate: true
      threshold: 0.60

  completion_criteria:
    - "Task created in ClickUp"
    - "Drive structure ready"
    - "Briefing analyzed"
```

---

### 4.2 Status Machine (HO-PP-002)

**Principio:** Estados devem ter transicoes formais com triggers.

```yaml
status_machine:
  initial_state: "Cadastro"

  state_anatomy:
    name: "Estado"
    phase: 1
    color: "#808080"
    terminal: false
    transitions:
      - to: "Proximo Estado"
        trigger: "evento_disparador"
        condition: "condicao_opcional"
        automation: "webhook | auto | manual"
```

**Exemplo Real:**

```yaml
states:
  - name: "Aguardando QG Briefing"
    phase: 1
    color: "#FFD700"
    transitions:
      - to: "Kick-off Agendado"
        trigger: "briefing_qg_passed"
        condition: "completude >= 0.60"
        automation: "synkra_agent"

      - to: "Bloqueado - Briefing Incompleto"
        trigger: "briefing_qg_failed"
        condition: "completude < 0.60"
        automation: "synkra_agent"
```

---

### 4.3 Product Variants

**Principio:** Um workflow pode ter variantes por tipo de produto.

```yaml
product_variants:
  net-new-basic:
    name: "Net New Basic"
    waves: [1, 2, 3, 4, 5, 7, 8, 9]
    skip_waves: [6]  # No creator contracting
    video_count: 4
    sla_days: 14

  creators-p:
    name: "Creators P"
    waves: [1, 2, 3, 4, 5, 6, 7, 8, 9]  # All waves
    video_count: 6
    creator_count: 3
    sla_days: 14
    additional_tasks:
      - wave: 6
        task:
          id: "5.1"
          name: "Contrato Creator"
          executor: "hybrid:account-manager"
```

---

## Parte 5: Integracoes

### 5.1 Service Layer

**Principio:** Integracoes devem ter camada de servico configuravel.

```yaml
services:
  clickup:
    enabled: true
    implements: ClickUpManager
    path: ./services/clickup-manager.js
    retry:
      max_retries: 3
      backoff_ms: 1000
      backoff_multiplier: 2

  document:
    enabled: true
    implements: DocumentManager
    path: ./services/document-manager.js
```

**Classe de Servico:**

```javascript
class ClickUpManager {
  constructor(config) {
    this.config = {
      retryConfig: { maxRetries: 3, backoffMs: 1000 },
      strictValidation: true,
    };
  }

  // Task Anatomy validation
  validateTaskAnatomy(task) {
    const required = [
      'task_name', 'status', 'responsible_executor',
      'execution_type', 'input', 'output',
      'action_items', 'acceptance_criteria'
    ];
    // ...
  }

  // Retry with backoff
  async _executeWithRetry(fn) {
    // Exponential backoff implementation
  }
}
```

---

### 5.2 Custom Field Catalog

**Principio:** Campos customizados devem ser catalogados e tipados.

```yaml
custom_field_catalog:
  # Identification Fields
  'ttcx-id':
    type: 'short_text'
    list: 'Projetos'
    category: 'identification'

  # Status Fields
  'Status Creator':
    type: 'drop_down'
    options: ['APROVADO', 'REPROVADO', 'RENOVADO']
    category: 'status'

  # Task Anatomy Fields
  'Executor Type':
    type: 'drop_down'
    options: ['Human', 'Agent', 'Hybrid', 'Worker']
    category: 'task_anatomy'
```

---

## Parte 6: Process Subfolders

### 6.1 Estrutura Multi-Processo

**Principio:** Squads complexos devem suportar multiplos processos.

```
squads/{squad-name}/
├── config/
│   ├── squad-config.yaml
│   ├── heuristics.yaml
│   └── services.yaml
├── processes/                    # NOVO: Processos especificos
│   ├── ttcx-unified/
│   │   ├── workflow-definition.yaml
│   │   ├── executor-matrix.yaml
│   │   ├── task-definitions/
│   │   │   ├── phase-1-setup.yaml
│   │   │   ├── phase-2-kickoff.yaml
│   │   │   └── ...
│   │   ├── qa-gates/
│   │   │   └── quality-gates.yaml
│   │   └── clickup-config/
│   │       └── field-mapping.yaml
│   ├── prioritization-system/
│   │   └── ...
│   └── ttcx-creators-p/
│       └── ...
├── minds/                        # NOVO: Mind integration
│   └── pedro_valerio/
│       ├── heuristics/
│       │   ├── PV_BS_001.md
│       │   ├── PV_PA_001.md
│       │   └── PV_PM_001.md
│       └── artifacts/
│           └── META_AXIOMAS.md
├── services/                     # NOVO: JS services
│   ├── clickup-manager.js
│   └── document-manager.js
├── agents/
├── tasks/
├── templates/
└── workflows/
```

---

## Parte 7: Checklist de Implementacao

### 7.1 Quick Wins (Facil)

- [ ] Criar `patterns/` folder com Pattern Library
- [ ] Adicionar 8 campos obrigatorios em tasks (HO-TP-001)
- [ ] Definir `checkpoint_policy: always_active` no config
- [ ] Nomear padroes com prefixo do squad (ex: MM-TP-001)

### 7.2 Medium Effort

- [ ] Criar Executor Matrix (Human/Agent/Hybrid/Worker)
- [ ] Documentar pelo menos 3 heuristicas de decisao
- [ ] Implementar Quality Gates formais entre fases
- [ ] Criar status machine com transicoes definidas

### 7.3 High Value (Requer mais trabalho)

- [ ] Implementar Axioma Validator (5+ dimensoes)
- [ ] Criar Service Layer JS para integracoes
- [ ] Organizar `processes/` para workflows complexos
- [ ] Integrar minds como validadores

---

## Parte 8: Templates para Novos Squads

### 8.1 config.yaml Template

```yaml
pack:
  name: "{squad_name}"
  version: "1.0.0"
  author: "AIOS Team"
  description: "{description}"
  icon: "{emoji}"
  slash_prefix: "{prefix}"

# Pattern Library
pattern_library:
  prefix: "{PREFIX}"  # 2-3 letters
  patterns: []  # Populated as patterns are created

# Task Standards
task_standards:
  enforce_anatomy: true
  validator: "{PREFIX}-TP-001"
  required_fields:
    - task_name
    - status
    - responsible_executor
    - execution_type
    - input
    - output
    - action_items
    - acceptance_criteria

# Executor Types
executor_types:
  human:
    id: "{PREFIX}-EP-001"
    use_for: ["judgment", "creativity", "relationships"]
  agent:
    id: "{PREFIX}-EP-002"
    use_for: ["analysis", "generation", "patterns"]
  hybrid:
    id: "{PREFIX}-EP-003"
    use_for: ["assisted_validation", "review"]
  worker:
    id: "{PREFIX}-EP-004"
    use_for: ["automation", "integration", "file_ops"]

# Workflow Config
workflow_config:
  checkpoint_policy: always_active
  fail_fast: true
  allow_manual_override: false

# Agents
agents: []

# Tasks
tasks: []

# Workflows
workflows: []
```

### 8.2 Task Template

```yaml
task:
  id: "{task_id}"
  task_name: "{Verbo + Objeto}"
  status: "pending"
  responsible_executor: "{executor_name}"
  execution_type: "Human | Agent | Hybrid | Worker"
  estimated_time: "{X}h"

  input:
    - "{input_1}"
    - "{input_2}"

  output:
    - "{output_1}"
    - "{output_2}"

  action_items:
    - "{step_1}"
    - "{step_2}"

  acceptance_criteria:
    - "{criterion_1}"
    - "{criterion_2}"

  # Optional
  dependencies: []
  templates: []
  quality_gate: null
  handoff:
    to: "{next_task}"
    trigger: "{trigger_event}"

  # Pattern compliance
  patterns:
    - "{PREFIX}-TP-001"
```

### 8.3 Quality Gate Template

```yaml
quality_gate:
  id: "QG-{phase}.{sequence}"
  name: "{Gate Name}"
  phase: {number}
  placement: "entry | transition | exit"
  type: "manual | automated | hybrid | external"
  severity: "blocking | warning | info"

  criteria:
    - check: "{description}"
      type: "threshold | presence | enum | count"
      field: "{field_name}"
      value: {threshold}
      operator: ">= | == | contains"
      weight: 0.X

  thresholds:
    pass: 0.X
    review: 0.X
    fail: 0.X

  executor:
    type: "{gate_type}"
    ai_agent: "{agent_name}"  # if hybrid
    human_review: "{role}"    # if hybrid/manual

  pass_action:
    - "{action_1}"

  fail_action:
    - "{action_1}"
```

---

## Parte 9: Acoes Imediatas para Squad-Creator

### 9.1 Atualizar Templates de Criacao

1. **agent-tmpl.md** - Adicionar secao de Executor Type
2. **task-tmpl.md** - Adicionar 8 campos obrigatorios
3. **config-tmpl.yaml** - Adicionar pattern_library e task_standards

### 9.2 Criar Novos Checklists

1. **task-anatomy-checklist.md** - Validar 8 campos
2. **quality-gate-checklist.md** - Validar estrutura de QG
3. **executor-matrix-checklist.md** - Validar tipagem de executores

### 9.3 Atualizar Workflow de Criacao

1. Adicionar passo de "Define Pattern Library" apos Discovery
2. Adicionar passo de "Create Executor Matrix" antes de Tasks
3. Adicionar passo de "Design Quality Gates" apos Workflows

---

## Referencias

- `squads/{squad-name}/config/squad-config.yaml`
- `squads/{squad-name}/processes/ttcx-unified/workflow-definition.yaml`
- `squads/{squad-name}/processes/ttcx-unified/qa-gates/quality-gates.yaml`
- `squads/{squad-name}/minds/pedro_valerio/heuristics/`
- `squads/{squad-name}/services/clickup-manager.js`

---

*AIOS Squad Creator Best Practices v2.0*
*Squad-Creator Reference v1.0.0*
