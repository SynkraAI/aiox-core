# Task: QA Checkpoint

**Task ID:** qa-checkpoint
**Version:** 1.0
**Execution Type:** Hybrid (Agent reviews, Human approves)
**Purpose:** Quality check any agent output before delivering to operator/client
**Executor:** @insight-chief
**Estimated Time:** 5-10 min

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `output_type` | enum | Yes | `"dossier"`, `"map"`, `"report"` |
| `output_data` | object | Yes | The agent output to review |
| `source_agent` | string | Yes | Which agent produced it |
| `autonomy_level` | number | Yes | Current autonomy level (1, 2, 3) |

---

## Steps

### Step 1: Select Checklist
```yaml
action: select_checklist
mapping:
  dossier: "IN-QA-001"
  map: "IN-QA-002"
  report: "IN-QA-003"
```

### Step 2: Run Checklist (IN-QA-001 — Dossier)
```yaml
id: "IN-QA-001"
applies_to: "dossier"
checks:
  - id: D1
    check: "Score 0-100 é coerente com dados?"
    blocking: true
  - id: D2
    check: "Todos os canais obrigatórios analisados?"
    blocking: true
  - id: D3
    check: "Comparativo top 3 concorrentes inclui?"
    blocking: true
  - id: D4
    check: "Gaps priorizados por impacto?"
    blocking: false
  - id: D5
    check: "Dados verificáveis (links, screenshots)?"
    blocking: true
  - id: D6
    check: "NAP consistency verificada?"
    blocking: false
  - id: D7
    check: "Portais de nicho analisados (se aplicável)?"
    blocking: false
```

### Step 3: Run Checklist (IN-QA-002 — Map)
```yaml
id: "IN-QA-002"
applies_to: "map"
checks:
  - id: M1
    check: "Keywords relevantes para o nicho?"
    blocking: true
  - id: M2
    check: "Business Potential Score aplicado?"
    blocking: true
  - id: M3
    check: "Sazonalidade considerada?"
    blocking: false
  - id: M4
    check: "Priorização por ROI (ICE), não por volume?"
    blocking: true
  - id: M5
    check: "Contexto brasileiro aplicado?"
    blocking: true
  - id: M6
    check: "80/20 destacado (keywords de ouro)?"
    blocking: false
  - id: M7
    check: "Output em formato tabela?"
    blocking: false
```

### Step 4: Run Checklist (IN-QA-003 — Report)
```yaml
id: "IN-QA-003"
applies_to: "report"
checks:
  - id: R1
    check: "Estrutura ABT presente?"
    blocking: true
  - id: R2
    check: "Narrativa clara para não-técnico?"
    blocking: true
  - id: R3
    check: "Dados visuais (não tabelas cruas)?"
    blocking: false
  - id: R4
    check: "CTA definido?"
    blocking: true
  - id: R5
    check: "Sem jargão técnico sem explicação?"
    blocking: true
  - id: R6
    check: "Tríade equilibrada (dados + narrativa + visuais)?"
    blocking: false
  - id: R7
    check: "Headline de impacto presente?"
    blocking: true
```

### Step 5: Calculate Confidence Score
```yaml
action: calculate_confidence
formula:
  all_blocking_pass: "+50 base"
  non_blocking_pass: "+7 each"
  data_freshness: "+0 to +10 (how recent is the data)"
  source_quality: "+0 to +10 (verified sources)"
max_score: 100
```

### Step 6: Decision Based on Autonomy Level
```yaml
action: decide
rules:
  level_1:
    any_result: "Present full output + checklist to operator for approval"

  level_2:
    confidence_gte_85:
      action: "Auto-approve"
      operator_sees: "Summary + confidence score"
    confidence_lt_85:
      action: "Escalate to operator"
      operator_sees: "Full output + checklist + flags"
    anomaly_detected:
      action: "Always escalate"

  level_3:
    any_result: "Auto-approve"
    operator_sees: "10% random sample + 100% new niches"
    error_detected: "Escalate immediately"
```

### Step 7: Handle Rejection
```yaml
action: on_rejection
process:
  - "Identify which checks failed"
  - "Return to source agent with specific feedback"
  - "Agent fixes and resubmits"
  - "Re-run QA checkpoint"
  - "Max 2 retries before escalating to operator"
```

---

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| QA Result | APPROVED / REJECTED | Pass or fail |
| Confidence score | Number 0-100 | Confidence level |
| Checklist | Table | Item-by-item results |
| Feedback | Text | If rejected: what to fix |

---

## Veto Conditions

- ANY blocking check fails → REJECT (regardless of autonomy level)
- Confidence < 50 → REJECT and escalate to operator
- Source agent already retried 2x → Escalate to operator

---

## Acceptance Criteria

- [ ] Correct checklist applied (IN-QA-001/002/003)
- [ ] All blocking items evaluated
- [ ] Confidence score calculated
- [ ] Decision matches autonomy level
- [ ] Rejection includes specific feedback for source agent
