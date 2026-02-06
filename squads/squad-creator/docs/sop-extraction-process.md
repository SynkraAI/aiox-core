# SOP Extraction Process Documentation

> **Pattern:** SC-DOC-001 (Process Documentation)
> **Version:** 1.0.0
> **Squad:** squad-creator
> **Last Updated:** 2025-01-24

---

## Overview

The SOP Extraction Process transforms meeting transcripts into structured, automation-ready Standard Operating Procedures (SOPs) that can be immediately converted into working AIOS Squads.

### Purpose

1. **Capture tacit knowledge** - Extract implicit process knowledge from recorded meetings
2. **Structure for automation** - Classify each step by cognitive type and automation potential
3. **Enable hybrid execution** - Define where humans and AI collaborate
4. **Generate working squads** - Produce blueprints ready for immediate squad creation

### Key Patterns Used

| Pattern | Name | Purpose |
|---------|------|---------|
| SC-PE-001 | SOP Extraction Standard | 11-part SOP structure |
| SC-CK-001 | SOP Validation Checklist | Quality gates before handoff |
| HO-TP-001 | Task Anatomy | 8-field task structure |
| HO-EP-001-004 | Executor Types | Human/Agent/Hybrid/Worker |
| PV_PM_001 | Automation Tipping Point | When to automate decision |

---

## Pipeline Overview

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Transcript  │ ──► │ @sop-       │ ──► │ Validation  │ ──► │ @squad- │
│ (any source)│     │  extractor  │     │ (SC-CK-001) │     │  creator    │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                           │                   │                   │
                           ▼                   ▼                   ▼
                    ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
                    │ SOP Doc     │     │ Human       │     │ Working     │
                    │ (11 parts)  │     │ Review      │     │ Squad       │
                    └─────────────┘     └─────────────┘     └─────────────┘
```

---

## Detailed Process Flow

### Phase 1: Data Source Resolution

```
┌──────────────────────────────────────────────────────────────────┐
│  STEP 0: DATA SOURCE RESOLUTION                                   │
│  ─────────────────────────────────────────────────────────────── │
│  • Lê config/squad-config.yaml                                    │
│  • active_source = supabase | local_file | api | direct           │
│  • Busca transcrição e normaliza para schema padrão               │
└──────────────────────────────────────────────────────────────────┘
```

**Configuration:** `config/squad-config.yaml`

```yaml
data_sources:
  transcripts:
    active_source: supabase  # ← change this to switch sources

    sources:
      supabase:
        type: database
        query:
          table: transcripts
          filters:
            - field: status
              operator: eq
              value: ready

      local_file:
        type: file
        config:
          base_path: "inputs/transcripts/"

      api:
        type: http
        connection:
          base_url_env: TRANSCRIPT_API_URL

      direct:
        type: inline
        # Transcript passed as parameter
```

**Output Schema:**

```yaml
transcript:
  transcript_id: string       # Required
  transcript_content: string  # Required
  transcript_source: string   # Optional: "meeting", "interview", "audio"
  transcript_url: string      # Optional: original source
  transcript_duration: number # Optional: seconds
  transcript_participants: [] # Optional: speaker names
  transcript_date: date       # Optional: when recorded
  transcript_language: string # Optional: ISO code
  transcript_metadata: {}     # Optional: custom data
```

---

### Phase 2: Structure Extraction (First Pass)

```
┌──────────────────────────────────────────────────────────────────┐
│  STEP 1-2: FIRST PASS - STRUCTURE EXTRACTION                      │
│  ─────────────────────────────────────────────────────────────── │
│  • Identifica: nome do processo, objetivo                         │
│  • Lista todos os passos mencionados                              │
│  • Captura: pessoas, ferramentas, sistemas                        │
│  • Marca pontos de decisão ("se", "quando", "depende")            │
│                                                                   │
│  OUTPUT: Raw extraction notes                                     │
└──────────────────────────────────────────────────────────────────┘
```

**Transcript Signals to Detect:**

| Signal Type | Keywords | Example |
|-------------|----------|---------|
| **Sequence** | "first", "then", "after", "next", "finally" | "First I open the system, then I check..." |
| **Decision** | "if", "when", "depends", "unless", "otherwise" | "If the client is premium, we prioritize..." |
| **Precondition** | "before", "must have", "requires", "need to" | "Before starting, I need access to..." |
| **Heuristic** | "usually", "generally", "most of the time" | "Usually we wait 24 hours..." |
| **Exception** | "except", "unless", "but if", "special case" | "Except when it's urgent..." |
| **Implicit** | "always do", "we just", "obviously" | "We obviously check the CRM first..." |

**Red Flags to Mark:**

| Red Flag | Meaning | Action |
|----------|---------|--------|
| "depends on who does it" | Non-standardized variation | Document variation, flag for standardization |
| "we figure it out" | Undocumented exception | Add to gaps, request clarification |
| "[name] knows how" | Single point of failure | Flag as risk, document knowledge |
| "this is rare" | Exception becoming rule | Verify frequency, may need process |
| "always been this way" | Potentially obsolete | Question necessity, validate |

---

### Phase 3: Task Anatomy Mapping

```
┌──────────────────────────────────────────────────────────────────┐
│  STEP 3: TASK ANATOMY MAPPING (HO-TP-001)                         │
│  ─────────────────────────────────────────────────────────────── │
│  Para CADA passo extraído, preencher 8 campos obrigatórios:       │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ task_name: "Verificar status do cliente"                    │ │
│  │ responsible_executor: @customer-service                     │ │
│  │ execution_type: Hybrid                                      │ │
│  │ estimated_time: 5m                                          │ │
│  │ input: [customer_id, crm_access]                            │ │
│  │ output: [customer_status, risk_flag]                        │ │
│  │ action_items: [1. Abrir CRM, 2. Buscar cliente, 3. Avaliar] │ │
│  │ acceptance_criteria: [Status documentado, Flag definido]    │ │
│  └─────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

**Task Anatomy Fields (HO-TP-001):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `task_name` | string | ✓ | Verb + Object format (e.g., "Verify customer status") |
| `status` | enum | ✓ | pending, in_progress, review, completed, blocked |
| `responsible_executor` | string | ✓ | @agent reference or role name |
| `execution_type` | enum | ✓ | Human, Agent, Hybrid, Worker |
| `estimated_time` | duration | ✓ | With unit: 5m, 2h, 1d |
| `input` | array | ✓ | ≥1 item required |
| `output` | array | ✓ | ≥1 item required |
| `action_items` | array | ✓ | Atomic steps to complete task |
| `acceptance_criteria` | array | ✓ | How to verify success |

---

### Phase 4: Cognitive Classification

```
┌──────────────────────────────────────────────────────────────────┐
│  STEP 3b: COGNITIVE CLASSIFICATION                                │
│  ─────────────────────────────────────────────────────────────── │
│                                                                   │
│   "Eu olho no sistema..."        → Perception    → ✅ Agent       │
│   "Eu decido se vale a pena..."  → Judgment      → ⚠️ Hybrid      │
│   "Eu ligo pro cliente..."       → Negotiation   → ❌ Human       │
│   "Eu copio os dados..."         → Memory        → ✅ Worker      │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

**Cognitive Taxonomy:**

| Type | Description | Automatable? | Executor |
|------|-------------|--------------|----------|
| **Perception** | Identify patterns in data | ✅ Yes | Agent (vision, NLP) |
| **Memory/Retrieval** | Fetch known information | ✅ Yes | Worker (query) |
| **Analysis** | Decompose, compare, evaluate | ✅ Yes | Agent |
| **Synthesis** | Combine information into new whole | ✅ Yes | Agent |
| **Judgment** | Decide with incomplete information | ⚠️ Partial | Hybrid |
| **Creativity** | Generate genuinely novel output | ⚠️ Partial | Hybrid |
| **Empathy** | Understand others' emotional state | ❌ No | Human |
| **Negotiation** | Influence others' decisions | ❌ No | Human |
| **Accountability** | Assume consequences | ❌ No | Human |
| **Ethics** | Decide between conflicting values | ❌ No | Human |

**Executor Assignment Rules:**

| Executor | When to Use | Examples |
|----------|-------------|----------|
| **Human** | Irreversible decisions, negotiation, empathy, accountability | Fire someone, negotiate contract, handle complaint |
| **Agent** | Large volume analysis, content generation, classification, patterns | Summarize 100 docs, categorize leads, draft responses |
| **Hybrid** | Medium risk, needs human "sanity check" | Draft important email (AI writes, human reviews) |
| **Worker** | 100% deterministic, no ambiguity, repetitive | Move file, call API, format date, send notification |

---

### Phase 5: Decision Rules Extraction

```
┌──────────────────────────────────────────────────────────────────┐
│  STEP 4: DECISION RULES EXTRACTION                                │
│  ─────────────────────────────────────────────────────────────── │
│                                                                   │
│  Transcrição: "Se o cliente for premium, a gente prioriza..."     │
│                           │                                       │
│                           ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │ IF customer.tier == "premium"                             │    │
│  │ THEN priority = HIGH                                      │    │
│  │ ELSE priority = NORMAL                                    │    │
│  │                                                           │    │
│  │ Automatable? ✅ Yes (deterministic rule)                  │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                   │
│  Transcrição: "Depende do feeling, às vezes a gente..."           │
│                           │                                       │
│                           ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │ HEURISTIC CAPTURED:                                       │    │
│  │ "às vezes" = variação não documentada                     │    │
│  │                                                           │    │
│  │ Automatable? ⚠️ Needs clarification                       │    │
│  │ → Added to GAP REPORT                                     │    │
│  └──────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
```

**Decision Rule Format:**

```
IF [condition extracted from transcript]
THEN [action A]
ELSE IF [another condition]
THEN [action B]
ELSE [default action]

Automatable: Yes | Partial | No
Reason: [why]
```

**Heuristic Translation:**

| Original Quote | Translation |
|----------------|-------------|
| "usually we wait 24h" | IF time_since_contact < 24h THEN wait ELSE proceed |
| "depends on the client size" | IF client.revenue > X THEN priority = HIGH |
| "when it feels right" | [NEEDS CLARIFICATION] → Add to gaps |

---

### Phase 6: Automation Analysis (PV_PM_001)

```
┌──────────────────────────────────────────────────────────────────┐
│  STEP 5: AUTOMATION ANALYSIS (PV_PM_001)                          │
│  ─────────────────────────────────────────────────────────────── │
│                                                                   │
│  Para cada step:                                                  │
│  ┌────────────┬───────────┬──────────────┬───────────┬─────────┐ │
│  │ Step       │ Frequency │ Impact       │ Auto?     │ Decision│ │
│  ├────────────┼───────────┼──────────────┼───────────┼─────────┤ │
│  │ Abrir CRM  │ >4x/mês   │ Low          │ High      │AUTOMATE │ │
│  │ Avaliar    │ >4x/mês   │ High         │ Medium    │HYBRID   │ │
│  │ Ligar      │ 2x/mês    │ High         │ Low       │HUMAN    │ │
│  │ Registrar  │ >4x/mês   │ Low          │ High      │AUTOMATE │ │
│  └────────────┴───────────┴──────────────┴───────────┴─────────┘ │
│                                                                   │
│  ⚠️ VETO CHECK: Tem guardrails?                                   │
│     □ Loop Prevention    □ Idempotency    □ Audit Trail          │
│     □ Escape Route       □ Retry Logic    □ Rollback             │
│                                                                   │
│  Se não tem guardrails → VETO (não automatizar)                   │
└──────────────────────────────────────────────────────────────────┘
```

**PV_PM_001 Decision Matrix:**

| Frequency | Impact | Automatability | Decision |
|-----------|--------|----------------|----------|
| High (>4x/mo) | High | High | **AUTOMATE** |
| High (>4x/mo) | High | Low | **DELEGATE** (specialized human) |
| High (>4x/mo) | Low | High | **AUTOMATE** (efficiency) |
| Low (<2x/mo) | High | Any | **KEEP_MANUAL** (risk doesn't justify) |
| Low (<2x/mo) | Low | Any | **ELIMINATE** (question necessity) |
| Any | Any | No guardrails | **VETO** (never automate without safeguards) |

**Mandatory Guardrails:**

| Guardrail | Apply To | Implementation |
|-----------|----------|----------------|
| **Loop Prevention** | Repetitive tasks | Deduplication + max_iterations |
| **Idempotency** | Tasks with side-effects | Input hash → skip if identical |
| **Audit Trail** | All tasks | Structured log per execution |
| **Escape Route** | Critical tasks | manual_override flag available |
| **Retry Logic** | External integrations | Exponential backoff (3 attempts) |
| **Rollback** | Destructive tasks | Snapshot before execution |

---

### Phase 7: Quality Scoring (META-AXIOMAS)

```
┌──────────────────────────────────────────────────────────────────┐
│  STEP 6: META-AXIOMAS SCORING (10 Dimensions)                     │
│  ─────────────────────────────────────────────────────────────── │
│                                                                   │
│  1. Truthfulness ........... 8/10  ✓                              │
│  2. Coherence .............. 7/10  ✓                              │
│  3. Strategic Alignment .... 8/10  ✓                              │
│  4. Operational Excellence . 6/10  ✓                              │
│  5. Innovation Capacity .... 5/10  ⚠ (below 6, flag)              │
│  6. Risk Management ........ 7/10  ✓                              │
│  7. Resource Optimization .. 7/10  ✓                              │
│  8. Stakeholder Value ...... 8/10  ✓                              │
│  9. Sustainability ......... 7/10  ✓                              │
│  10. Adaptability .......... 6/10  ✓                              │
│                                                                   │
│  OVERALL: 6.9/10  ⚠️ Below 7.0 threshold → REVIEW needed          │
└──────────────────────────────────────────────────────────────────┘
```

**META-AXIOMAS Dimensions:**

| # | Dimension | Weight | Threshold | Description |
|---|-----------|--------|-----------|-------------|
| 1 | **Truthfulness** | 1.0 | 7.0 | Process described accurately? (VETO if <7) |
| 2 | **Coherence** | 0.9 | 6.0 | Steps align logically? |
| 3 | **Strategic Alignment** | 0.9 | 6.0 | Serves business goals? |
| 4 | **Operational Excellence** | 0.8 | 6.0 | Is it efficient? |
| 5 | **Innovation Capacity** | 0.7 | 5.0 | Can it evolve? |
| 6 | **Risk Management** | 0.8 | 6.0 | Risks addressed? |
| 7 | **Resource Optimization** | 0.8 | 6.0 | Is it lean? |
| 8 | **Stakeholder Value** | 0.7 | 6.0 | Serves users? |
| 9 | **Sustainability** | 0.7 | 6.0 | Maintainable? |
| 10 | **Adaptability** | 0.6 | 5.0 | Handles change? |

**Thresholds:**
- Overall Score: ≥7.0 to proceed
- Per Dimension: ≥6.0 (except Innovation/Adaptability: ≥5.0)
- Truthfulness: VETO if <7.0

---

### Phase 8: Squad Blueprint Generation

```
┌──────────────────────────────────────────────────────────────────┐
│  STEP 7: SQUAD BLUEPRINT GENERATION                               │
│  ─────────────────────────────────────────────────────────────── │
│                                                                   │
│  AGENTS:                                                          │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ @customer-process-orchestrator  │ Orchestrates full flow    │ │
│  │ @crm-worker                     │ CRM queries (Worker)      │ │
│  │ @customer-analyst               │ Analysis (Agent)          │ │
│  │ @customer-service               │ Human decisions (Human)   │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  TASKS:                                                           │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ fetch-customer-data    │ @crm-worker      │ Worker          │ │
│  │ analyze-customer       │ @customer-analyst │ Agent           │ │
│  │ decide-priority        │ @customer-service │ Hybrid (elicit) │ │
│  │ contact-customer       │ @customer-service │ Human           │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  CHECKPOINTS:                                                     │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ CP1: After analyze-customer  │ Human validates analysis     │ │
│  │ CP2: After decide-priority   │ Human confirms decision      │ │
│  └─────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

**Blueprint Structure:**

```yaml
squad_blueprint:
  name: "[process-name]"
  version: "1.0.0"

  agents:
    - name: "@[process]-orchestrator"
      type: Orchestrator
      responsibility: "Orchestrate complete flow"
      steps: all

    - name: "@[function]-worker"
      type: Worker
      responsibility: "[specific function]"
      steps: [1, 4, 7]

    - name: "@[function]-analyst"
      type: Agent
      responsibility: "[analysis function]"
      steps: [2, 5]

    - name: "@[function]-service"
      type: Human
      responsibility: "[human decisions]"
      steps: [3, 6]

  tasks:
    - name: "[task-name]"
      agent: "@[agent]"
      execution_type: Worker | Agent | Hybrid | Human
      elicit: true | false
      checkpoint: true | false

  checkpoints:
    - id: CP1
      after_task: "[task-name]"
      type: validation | approval | veto
      validator: human | @agent
      criteria: "[approval criteria]"
      action_on_reject: "[what happens]"

  workflow:
    name: "[process-name]-workflow"
    trigger: "[what starts it]"
    phases:
      - name: "[phase-name]"
        agent: "@[agent]"
        tasks: ["task1", "task2"]
        checkpoint: CP1 | null
    handoff:
      pattern: HO-TP-002
      data_transferred: [artifacts]
```

---

### Phase 9: Gap Analysis

```
┌──────────────────────────────────────────────────────────────────┐
│  STEP 8: GAP ANALYSIS                                             │
│  ─────────────────────────────────────────────────────────────── │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ GAPS IDENTIFIED:                                            │ │
│  │                                                             │ │
│  │ 1. [INFERRED] Critério de "cliente premium" não definido    │ │
│  │    → Pergunta: Qual o threshold de faturamento?             │ │
│  │                                                             │ │
│  │ 2. [MISSING] Tempo máximo de resposta não mencionado        │ │
│  │    → Pergunta: Qual SLA para cada tier?                     │ │
│  │                                                             │ │
│  │ 3. [RED FLAG] "João sabe fazer isso" mencionado             │ │
│  │    → Single point of failure identificado                   │ │
│  │    → Pergunta: Quem mais pode executar?                     │ │
│  └─────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

**Gap Categories:**

| Category | Marker | Impact | Action |
|----------|--------|--------|--------|
| **Inferred** | `[INFERRED]` | Medium | Validate with process owner |
| **Missing** | `[MISSING]` | High | Request clarification |
| **Ambiguous** | `[AMBIGUOUS]` | Medium | List interpretations, ask |
| **Red Flag** | `[RED FLAG]` | High | Document risk, recommend mitigation |

**Gap Report Format:**

```markdown
## Gap Report

### Critical Gaps (Block Automation)
| Gap | Impact | Question | Priority |
|-----|--------|----------|----------|
| [description] | Blocks automation | [question] | High |

### Medium Gaps (Reduce Quality)
| Gap | Impact | Question | Priority |
|-----|--------|----------|----------|
| [description] | Reduces quality | [question] | Medium |

### Red Flags (Risks)
| Flag | Risk | Mitigation | Owner |
|------|------|------------|-------|
| [description] | [risk] | [recommendation] | [who] |
```

---

### Phase 10: Document Assembly & Validation

```
┌──────────────────────────────────────────────────────────────────┐
│  STEP 9: DOCUMENT ASSEMBLY (SC-PE-001)                            │
│  ─────────────────────────────────────────────────────────────── │
│                                                                   │
│  OUTPUT FILES:                                                    │
│                                                                   │
│  📄 sop_document.md (11 parts)                                    │
│     ├── Part 1: Process Identification                            │
│     ├── Part 2: Stakeholders & Executors                          │
│     ├── Part 3: Data & Systems                                    │
│     ├── Part 4: Process Flow (with Mermaid diagram)               │
│     ├── Part 5: Quality & Validation                              │
│     ├── Part 6: Exceptions & Troubleshooting                      │
│     ├── Part 7: Automation Analysis                               │
│     ├── Part 8: AIOS Squad Blueprint                              │
│     ├── Part 9: Gaps & Next Steps                                 │
│     ├── Part 10: Glossary                                         │
│     └── Part 11: Extraction Metadata                              │
│                                                                   │
│  📄 squad_blueprint.yaml                                          │
│  📄 gap_report.md                                                 │
│  📄 automation_analysis.md                                        │
└──────────────────────────────────────────────────────────────────┘
```

**Validation Checklist (SC-CK-001):**

| Category | Criteria | Threshold |
|----------|----------|-----------|
| Structure | All 11 parts present | 11/11 |
| Task Anatomy | 8 fields per step | 100% |
| Executor Classification | All steps assigned | 100% |
| Cognitive Analysis | All steps classified | 100% |
| Decision Rules | All "if/depends" captured | 100% |
| Guardrails | Defined for automated steps | 100% |
| META-AXIOMAS | Overall score | ≥7.0 |
| Squad Blueprint | Complete and valid | 100% |
| Gaps | All documented with questions | 100% |

**Validation Decision:**

| Decision | Criteria | Next Step |
|----------|----------|-----------|
| **APPROVE** | All thresholds met | Handoff to create-squad |
| **REVIEW** | Some thresholds below | Human review required |
| **REJECT** | Critical gaps | Re-extraction needed |

---

### Phase 11: Handoff & Squad Creation

```
┌──────────────────────────────────────────────────────────────────┐
│  HANDOFF → /squad-creator create-squad                            │
│  ─────────────────────────────────────────────────────────────── │
│                                                                   │
│  handoff:                                                         │
│    to: "create-squad"                                             │
│    data_transferred:                                              │
│      - sop_document.md                                            │
│      - squad_blueprint.yaml                                       │
│      - gap_report.md                                              │
│    validation: "Process owner confirms accuracy"                  │
└──────────────────────────────────────────────────────────────────┘
```

**Final Output Structure:**

```
squads/[process-name]/
├── agents/
│   ├── [process]-orchestrator.md
│   ├── [function]-worker.md
│   ├── [function]-analyst.md
│   └── [function]-service.md
├── tasks/
│   ├── [task-1].md
│   ├── [task-2].md
│   └── [task-n].md
├── workflows/
│   └── [process]-workflow.yaml
├── checklists/
│   └── [process]-validation.md
├── config/
│   └── squad-config.yaml
├── config.yaml
└── README.md
```

---

## Summary Table

| Phase | Step | Input | Output | Actor |
|-------|------|-------|--------|-------|
| 1 | Data Source | Config | Normalized transcript | System |
| 2 | Structure | Transcript | Steps, roles, tools | @sop-extractor |
| 3 | Task Anatomy | Steps | 8-field tasks | @sop-extractor |
| 4 | Cognitive | Steps | Executor types | @sop-extractor |
| 5 | Decision Rules | Transcript | IF/THEN rules | @sop-extractor |
| 6 | Automation | Steps | PV_PM_001 decisions | @sop-extractor |
| 7 | Quality | Process | META-AXIOMAS score | @sop-extractor |
| 8 | Blueprint | All above | Squad YAML | @sop-extractor |
| 9 | Gaps | All above | Gap report | @sop-extractor |
| 10 | Assembly | All above | SOP document | @sop-extractor |
| 11 | Validation | SOP | APPROVE/REVIEW/REJECT | Human + SC-CK-001 |
| 12 | Handoff | Approved SOP | Working squad | @squad-architect |

---

## Quick Start

```bash
# 1. Configure data source
# Edit: squads/squad-creator/config/squad-config.yaml
# Set: data_sources.transcripts.active_source

# 2. Run extraction
/extract-sop

# 3. Follow guided workflow
*extract-sop

# 4. Review outputs
# - SOP document (11 parts)
# - Squad blueprint
# - Gap report

# 5. Validate (human review)
*validate-sop

# 6. Create squad
/squad-creator create-squad
```

---

## Related Documents

| Document | Location | Purpose |
|----------|----------|---------|
| SOP Template | `templates/pop-extractor-prompt.md` | SC-PE-001 structure |
| Extraction Task | `tasks/extract-sop.md` | Workflow definition |
| Validation Checklist | `checklists/sop-validation.md` | Quality gates |
| Agent Definition | `agents/sop-extractor.md` | @sop-extractor persona |
| Squad Config | `config/squad-config.yaml` | Data sources & settings |

---

**Pattern Compliance:** SC-DOC-001 ✓ | SC-PE-001 ✓ | HO-TP-001 ✓ | PV_PM_001 ✓

*Generated by Squad Creator Documentation System*
