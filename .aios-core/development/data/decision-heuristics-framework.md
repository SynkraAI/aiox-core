# Decision Heuristics Framework

> **Version:** 1.0.0
> **Source:** AIOS Quality Standards

Framework for creating decision heuristics that validate choices at workflow checkpoints.

---

## 1. Heuristic Anatomy

Every decision heuristic must have this structure:

```yaml
heuristic:
  id: '{PREFIX}_{AREA}_{NUMBER}' # e.g., "QA_STR_001"
  name: 'Human-readable name'
  type: 'Decision Heuristic'
  phase: 1-N # Which workflow phase
  agent: '@squad:agent-name' # Which agent applies it

  # Weighted criteria
  weights:
    criterion_1: 0.9 # 0.0 to 1.0
    criterion_2: 0.8
    criterion_3: 0.7

  # Minimum thresholds for pass
  thresholds:
    criterion_1: 0.8 # Must score >= this
    criterion_2: 0.7
    criterion_3: null # Context-dependent

  # Conditions that BLOCK progress
  veto_conditions:
    - condition: 'criterion_1 < 0.7'
      action: 'VETO - Return to previous phase'
    - condition: 'critical_check = false'
      action: 'VETO - Cannot proceed'

  # What to do when veto triggers
  feedback_on_failure:
    - 'Specific remediation step 1'
    - 'Specific remediation step 2'

  # Output decision
  output:
    type: 'decision'
    values: ['APPROVE', 'REVIEW', 'VETO']
```

---

## 2. Decision Tree Structure

Every heuristic needs a decision tree:

```text
PRIMARY BRANCH (highest priority):
  IF (critical_condition_violated)
    THEN VETO → immediate action

SECONDARY BRANCH:
  ELSE IF (important_condition < threshold)
    THEN REVIEW → requires justification

TERTIARY BRANCH:
  ELSE IF (optional_condition < threshold)
    THEN APPROVE with conditions

TERMINATION: Define when to stop evaluating
FALLBACK: What to do in edge cases
```

---

## 3. Standard Heuristic Templates

### 3.1 Strategic Alignment Heuristic

**Purpose:** Validate that actions align with vision/goals.

```yaml
strategic_alignment:
  id: '{PREFIX}_STR_001'
  name: 'Strategic Alignment Check'
  phase: 'early (architecture/planning)'

  weights:
    vision_clarity: 0.9
    goal_alignment: 0.8
    resource_efficiency: 0.7

  thresholds:
    vision_clarity: 0.8
    goal_alignment: 0.7
    resource_efficiency: 0.5

  veto_conditions:
    - condition: 'vision_clarity < 0.7'
      action: 'VETO - Vision unclear, return to Discovery'

  decision_tree: |
    IF (action directly enables vision)
      THEN priority = HIGH → APPROVE
    ELSE IF (action creates optionality towards vision)
      THEN priority = MEDIUM → APPROVE with conditions
    ELSE IF (action does not serve vision)
      THEN REVIEW - requires justification
    TERMINATION: Action contradicts vision
```

### 3.2 Coherence Scan Heuristic

**Purpose:** Validate executor/resource fit.

```yaml
coherence_scan:
  id: '{PREFIX}_COH_001'
  name: 'Coherence Validation'
  phase: 'mid (executor assignment)'

  weights:
    consistency: 1.0 # VETO power
    system_fit: 0.8
    capability: 0.3

  thresholds:
    consistency: 0.7 # Must be coherent
    system_fit: 0.7
    capability: null # Context-dependent

  veto_conditions:
    - condition: 'consistency < 0.7'
      action: 'VETO - Reassign executor'
    - condition: 'detected_incoherence = true'
      action: 'VETO - Trust violation'

  decision_tree: |
    PRIMARY:
      IF (consistency == 'Incoherent')
        THEN REJECT immediately → VETO
    SECONDARY:
      ELSE IF (system_fit < 0.7)
        THEN FLAG for observation → REVIEW
    TERTIARY:
      ELSE IF (capability < required)
        THEN Consider training → REVIEW with conditions
```

### 3.3 Automation Decision Heuristic

**Purpose:** Decide when to automate vs keep manual.

```yaml
automation_decision:
  id: '{PREFIX}_AUT_001'
  name: 'Automation Tipping Point'
  phase: 'mid (workflow design)'

  weights:
    frequency: 0.7
    impact: 0.9
    automatability: 0.8
    guardrails_present: 1.0 # VETO power

  thresholds:
    frequency: '2x per month'
    impact: 0.6
    automatability: 0.5
    standardization: 0.7

  veto_conditions:
    - condition: 'guardrails_missing = true'
      action: 'VETO - Define safety guardrails first'

  decision_tree: |
    IF (automatability > 0.5 AND guardrails_present)
      THEN AUTOMATE
    ELSE IF (impact > 0.6)
      THEN KEEP_MANUAL (needs human judgment)
    ELSE IF (frequency < 1x/month AND impact < 0.5)
      THEN ELIMINATE
    CONSTRAINT: NEVER automate without guardrails

  automation_rules:
    - trigger: 'Task repeated 2+ times'
      action: 'Document and automate'
    - trigger: 'Task repeated 3+ times without automation'
      assessment: 'Design failure - immediate remediation'
    - trigger: 'Any automation'
      requirement: 'Must have guardrails, logs, manual escape'
```

---

## 4. Evaluation Criteria Table

Standard format for documenting criteria:

| Criterion   | Weight | Threshold | VETO Power | Description      |
| ----------- | ------ | --------- | ---------- | ---------------- |
| criterion_1 | 0.9    | ≥0.8      | YES        | What it measures |
| criterion_2 | 0.8    | ≥0.7      | NO         | What it measures |
| criterion_3 | 0.7    | Context   | NO         | What it measures |

---

## 5. Failure Modes Documentation

Every heuristic should document failure modes:

```yaml
failure_modes:
  - name: 'False Positive'
    trigger: 'What causes false approval'
    manifestation: 'What happens when it fails'
    detection: 'How to detect the failure'
    recovery: 'How to fix it'
    prevention: 'How to prevent it'

  - name: 'False Negative'
    trigger: 'What causes false rejection'
    manifestation: 'What happens'
    detection: 'How to detect'
    recovery: 'How to fix'
    prevention: 'How to prevent'
```

---

## 6. Checkpoint Integration

Heuristics integrate with workflow checkpoints:

```yaml
checkpoint:
  id: 'checkpoint-name'
  heuristic: '{PREFIX}_{AREA}_{NUMBER}'
  phase: N

  criteria:
    - metric: 'metric_name'
      threshold: 0.8
      operator: '>='
    - metric: 'another_metric'
      threshold: 0.7
      operator: '>='

  veto_conditions:
    - condition: 'condition_expression'
      action: 'HALT - Reason'

  validation_questions:
    - 'Question to verify criterion 1?'
    - 'Question to verify criterion 2?'

  pass_action: 'Proceed to Phase N+1'
  fail_action: 'Return to Phase N-1 with feedback'
```

---

## 7. Performance Metrics

Track heuristic performance:

```yaml
performance:
  decision_speed: 'Time to make decision'
  accuracy_rate: 'Percentage of correct decisions'
  confidence_level: 'Confidence in decisions'
  resource_efficiency: '0-10 scale'
  context_sensitivity: '0-10 scale'
```

---

## 8. Creating Custom Heuristics

### Step 1: Identify the Decision Point

- What decision needs to be made?
- At which workflow phase?
- Who/what makes the decision?

### Step 2: Define Criteria

- What factors matter?
- How important is each (weights)?
- What's the minimum acceptable (thresholds)?

### Step 3: Define Veto Conditions

- What absolutely cannot happen?
- What triggers immediate rejection?

### Step 4: Build Decision Tree

- Primary branch (highest priority)
- Secondary branches
- Termination conditions
- Fallback behavior

### Step 5: Document Failure Modes

- What could go wrong?
- How to detect and recover?

### Step 6: Integrate with Checkpoint

- Which checkpoint uses this?
- What validation questions?

---

## 9. Quality Gate Pattern

Heuristics work within quality gates:

```text
┌─────────────────────────────────────────┐
│  QUALITY GATE                           │
├─────────────────────────────────────────┤
│  1. Evaluate criteria against thresholds│
│  2. Check veto conditions               │
│  3. Apply decision tree                 │
│  4. Output: APPROVE | REVIEW | VETO     │
└─────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────┐
│  IF APPROVE: Proceed to next phase      │
│  IF REVIEW: Human intervention needed   │
│  IF VETO: Return to previous phase      │
└─────────────────────────────────────────┘
```

---

## 10. Scope Complexity Heuristic (PRD Gate)

**Purpose:** Decide if scope is too large for direct squad creation → requires PRD with Epics/Stories.

### 10.1 The Problem

Large-scope squads created "on the fly" result in:

- Incomplete coverage (workflows missed)
- Poor prioritization (no roadmap)
- Technical debt (rushing to create many agents)
- Lost context (too much to track in conversation)

### 10.2 Scope Complexity Decision

```yaml
scope_complexity_heuristic:
  id: 'SC_SCP_001'
  name: 'Scope Complexity Gate'
  phase: 'phase_0 (Discovery)'
  blocking: true

  thresholds:
    workflows_mapped: 10 # >= 10 workflows = PRD required
    agents_needed: 8 # >= 8 agents = PRD required
    domain_precedent: false # No similar squad exists = higher risk

  decision_tree: |
    PRIMARY CHECK - Workflow Count:
      IF (workflows_mapped >= 10)
        THEN → STOP: "Escopo grande demais para criação direta"
               → ACTION: Create PRD with Epics/Stories
               → VETO: Cannot proceed with direct squad creation

    SECONDARY CHECK - Agent Count:
      ELSE IF (agents_needed >= 8)
        THEN → STOP: "Muitos agents para criar sem roadmap"
               → ACTION: Create PRD with phased implementation
               → VETO: Cannot proceed without planning

    TERTIARY CHECK - Domain Precedent:
      ELSE IF (no_similar_squad AND workflows >= 5)
        THEN → WARNING: "Domínio novo sem precedente"
               → RECOMMEND: Consider PRD for risk mitigation
               → ALLOW: User can override

    DEFAULT:
      ELSE → PROCEED with direct squad creation

  veto_conditions:
    - condition: 'workflows_mapped >= 10'
      action: 'VETO - PRD obrigatório'
      message: |
        ❌ ESCOPO GRANDE DEMAIS

        Mapeei {n} workflows. Isso é complexo demais para criar diretamente.

        AÇÃO NECESSÁRIA:
        1. Criar PRD em docs/projects/{domain}/prd.md
        2. Dividir em Epics (ex: "Tier 0 - Onboarding", "Tier 1 - Execução")
        3. Criar Stories por Epic
        4. Implementar por fases

        Quer que eu crie o PRD agora?

    - condition: 'agents_needed >= 8'
      action: 'VETO - Roadmap obrigatório'
      message: 'Precisa de roadmap de implementação para {n} agents'

  rationale: |
    PRD para squads grandes garante:
    - Todos os workflows são documentados antes de começar
    - Dependências entre agents são mapeadas
    - Priorização clara (o que criar primeiro)
    - Checkpoints de validação por Epic
    - Possibilidade de implementação incremental
```

### 10.3 PRD Structure for Large Squads

```yaml
prd_structure:
  location: 'docs/projects/{domain}/prd.md'

  required_sections:
    - overview: 'O que o squad faz, para quem'
    - workflows_mapped: 'Lista completa de workflows (tabela)'
    - agents_architecture: 'Tier distribution, handoffs'
    - epics: 'Agrupamento lógico de trabalho'
    - success_criteria: 'Como medir se está pronto'

  epic_structure:
    - epic_1: 'Infraestrutura e Orquestrador'
    - epic_2: 'Tier 0 - Diagnóstico/Onboarding'
    - epic_3: 'Tier 1 - Execução Core'
    - epic_4: 'Tier 2 - Comunicação/Consultoria'
    - epic_5: 'Tier 3 - Especialistas'
    - epic_6: 'Integração e Automação'

  story_format: |
    ## Story: {título}

    **Como** {persona}
    **Quero** {funcionalidade}
    **Para** {benefício}

    ### Acceptance Criteria
    - [ ] {criterio_1}
    - [ ] {criterio_2}

    ### Tasks
    - [ ] Criar agent {name}
    - [ ] Implementar workflow {name}
    - [ ] Validar contra checklist
```

### 10.4 Examples

```yaml
examples:
  triggers_prd:
    - scenario: 'Squad Contabilidade MEI/Simples'
      workflows: 54
      agents: 14
      decision: 'VETO - PRD obrigatório'
      reason: '54 workflows >> 10 threshold'

    - scenario: 'Squad Legal Completo'
      workflows: 25
      agents: 12
      decision: 'VETO - PRD obrigatório'
      reason: '25 workflows + 12 agents'

  direct_creation:
    - scenario: 'Squad de Email Marketing'
      workflows: 6
      agents: 4
      decision: 'PROCEED - Criação direta'
      reason: '6 workflows < 10 threshold'

    - scenario: 'Squad de Headlines'
      workflows: 3
      agents: 2
      decision: 'PROCEED - Criação direta'
      reason: 'Escopo pequeno e focado'
```

---

## 11. Specialist Selection Heuristic

**Purpose:** Decide which specialist agent to invoke for mind cloning and squad creation.

### 10.1 Available Specialists

| Specialist         | Domain                                        | Activation                      |
| ------------------ | --------------------------------------------- | ------------------------------- |
| `@oalanicolas`     | Mind cloning, DNA extraction, source curation | `/squad-creator @oalanicolas`   |
| `@pedro-valerio`   | Processes, tasks, checklists, automation      | `/squad-creator @pedro-valerio` |
| `@squad-architect` | General squad creation, orchestration         | `/squad-creator` (default)      |

### 10.2 Decision Matrix

```yaml
specialist_selection:
  id: "SC_SPE_001"
  name: "Specialist Selection Heuristic"
  phase: "early (before starting work)"

  decision_tree: |
    PRIMARY - Mind Cloning Tasks:
      IF (task involves extracting DNA, voice, thinking patterns)
        THEN invoke @oalanicolas
      IF (task involves source curation or quality assessment)
        THEN invoke @oalanicolas
      IF (task involves validating clone fidelity)
        THEN invoke @oalanicolas

    SECONDARY - Process Tasks:
      IF (task involves creating/auditing workflows)
        THEN invoke @pedro-valerio
      IF (task involves defining veto conditions or guardrails)
        THEN invoke @pedro-valerio
      IF (task involves checklist creation or validation)
        THEN invoke @pedro-valerio
      IF (task involves automation decisions)
        THEN invoke @pedro-valerio

    TERTIARY - General Tasks:
      IF (task is general squad creation)
        THEN use @squad-architect
      IF (unclear which specialist)
        THEN use @squad-architect (will delegate)

    FALLBACK:
      When in doubt → @squad-architect orchestrates

  keywords:
    oalanicolas:
      - "DNA", "voice", "thinking", "clone", "mind"
      - "source", "curadoria", "material"
      - "personality", "communication style"
      - "8 layers", "DNA Mental"
      - "fidelity", "authenticity"

    pedro_valerio:
      - "process", "workflow", "task"
      - "checklist", "validation", "audit"
      - "automation", "guardrail", "veto"
      - "SOP", "procedure", "efficiency"
      - "impossible to fail", "block wrong paths"
```

### 10.3 Handoff Protocol

```yaml
handoff_rules:
  squad_architect_to_oalanicolas:
    trigger: 'Mind cloning phase reached'
    context_passed:
      - mind_name
      - domain
      - sources_path (if exists)
    expected_output:
      - voice_dna (YAML block)
      - thinking_dna (YAML block)
      - source_quality_report

  squad_architect_to_pedro_valerio:
    trigger: 'Process/workflow design phase reached'
    context_passed:
      - workflow_files
      - task_files
      - checklist_files
    expected_output:
      - audit_report
      - veto_conditions
      - automation_recommendations

  oalanicolas_to_pedro_valerio:
    trigger: 'DNA extracted, need process validation'
    context_passed:
      - extracted_dna
      - agent_file
    expected_output:
      - process_validation
      - quality_gates

  pedro_valerio_to_oalanicolas:
    trigger: 'Process ready, need mind integration'
    context_passed:
      - validated_process
      - integration_points
    expected_output:
      - mind_integration_plan
```

### 10.4 Anti-Patterns

```yaml
anti_patterns:
  - name: 'Wrong Specialist'
    trigger: 'Using @pedro-valerio for voice extraction'
    why_bad: 'Process expert, not mind cloning expert'
    correction: 'Use @oalanicolas for DNA extraction'

  - name: 'Skipping Specialists'
    trigger: 'Trying to do everything with @squad-architect'
    why_bad: 'Loses depth of specialized expertise'
    correction: 'Delegate to specialists for their domains'

  - name: 'No Handoff Context'
    trigger: 'Switching specialists without context'
    why_bad: 'Loses continuity, duplicates work'
    correction: 'Always pass context per handoff_rules'
```

---

_AIOS Decision Heuristics Framework v1.1_
_Updated: Specialist Selection Heuristic added_
