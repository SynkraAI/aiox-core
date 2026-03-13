# Task: Optimize Squad/Task Execution

**Task ID:** optimize
**Version:** 4.1.0
**Purpose:** Otimizar squads/tasks convertendo Agent → Worker/Hybrid/Script-Only + binary checkpoint conversion + GAP ZERO + validação empírica com bias detection
**Orchestrator:** @squad-chief
**Mode:** Analysis + Implementation
**Pattern:** EXEC-DT-002
**Execution Type:** `Agent` (requires semantic analysis of task content)
**Model:** `Opus` (REQUIRED — semantic analysis of task determinism, multiplicative impact of errors)
**Haiku Eligible:** NO — this task creates/modifies other tasks; classification errors cascade

---

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_name** | Optimize Squad/Task Execution |
| **status** | `active` |
| **responsible_executor** | @squad-chief |
| **execution_type** | Agent |
| **input** | `target` (task, squad, ou "all") |
| **output** | Relatório de otimização + economia de tokens |
| **action_items** | Analisar, converter, medir economia |
| **acceptance_criteria** | Tasks otimizadas + relatório de ROI |

---

## Overview

Comando único para otimizar execução de tasks:

1. **Identifica** tasks que deveriam ser Worker (código) ao invés de Agent (LLM)
2. **Converte** tasks para o executor correto
3. **Mede economia** de tokens após refatoração
4. **Gera relatório** de ROI

```
*optimize {target}

Onde {target} pode ser:
- task: "squads/{squad-name}/tasks/{task-name}.md"
- squad: "{squad-name}"
- "all" (todos os squads)

Flags:
--scan        Só analisa, não implementa (default)
--implement   Implementa as conversões (code stubs)
--hybrid      FULL PIPELINE: analisa + cria hybrid executor + aplica GAP ZERO + testa com Haiku
--post        Análise de economia pós-refatoração
--exec N      Projeção com N execuções/mês (default: 20)
```

---

## PHASE 0: TARGET IDENTIFICATION

**Duration:** 1-2 minutes

### Step 0.0: MANDATORY - Load Decision Tree Framework

```yaml
mandatory_first_step:
  action: READ_COMPLETE
  file: "squads/squad-creator/data/executor-decision-tree.md"

  why: |
    The decision tree contains the EXACT 6 questions (Q1-Q6) and criteria
    that MUST be applied to each action. Without loading this framework,
    the analysis WILL BE WRONG.

  validation:
    - "File was read completely? If NO → Read it now"
    - "6 questions understood? Q1, Q2, Q2a, Q2b, Q3, Q4, Q5, Q6"
    - "Output format understood? Table with columns per question"

  if_not_loaded:
    STOP_EXECUTION: true
    message: "Cannot proceed without loading the decision tree framework"
```

---

### Step 0.1: Parse Target

```yaml
parse_target:
  if_file:
    action: "Analisar única task"
    path: "{target}"

  if_squad:
    action: "Listar todas tasks do squad"
    glob: "squads/{target}/tasks/*.md"

  if_all:
    action: "Listar todas tasks de todos squads"
    glob: "squads/*/tasks/*.md"
    exclude:
      - "squads/squad-creator/*"  # Meta-squad, não analisar
```

### Step 0.2: Load Tasks

```yaml
load_tasks:
  for_each_file:
    - read: "{file_path}"
    - extract:
        - task_name
        - execution_type (se existir)
        - purpose/description
        - inputs
        - outputs
        - action_items/steps
```

---

## PHASE 1: DETERMINISM ANALYSIS

**Duration:** 2-5 minutes per task

### ⚠️ MANDATORY: Load Decision Tree Framework

**BEFORE ANALYZING ANY TASK, YOU MUST:**

```yaml
mandatory_dependency:
  file: "squads/squad-creator/data/executor-decision-tree.md"
  action: READ COMPLETELY
  reason: "Framework contains the 6 questions and exact criteria for classification"

  validation:
    - "Framework loaded? If NO → STOP and load it"
    - "6 questions understood? If NO → Re-read framework"
    - "Output format clear? If NO → Check Step 1.3"
```

**NEVER "interpret" or "summarize" the framework. FOLLOW IT LITERALLY.**

---

### Step 1.1: Decompose Task into Individual Actions

**CRITICAL:** Don't analyze the task as a whole. Break it into ATOMIC ACTIONS.

```yaml
decompose_task:
  for_each_task:
    1. Read the task file COMPLETELY
    2. Identify EVERY action/step in the task
    3. List each action as a separate row for analysis

  example:
    task: "db-health-check.md"
    actions_found:
      - "1.1: Connect to database"
      - "1.2: Check connection pool status"
      - "1.3: Run EXPLAIN on slow queries"
      - "1.4: Check table sizes"
      - "1.5: Generate health report"
```

---

### Step 1.2: Apply Decision Tree Per Action (STRICT)

**FOR EACH ACTION, answer the 6 questions LITERALLY:**

```yaml
analyze_action:
  # DO NOT SKIP ANY QUESTION
  # DO NOT ASSUME ANSWERS
  # FOLLOW THE EXACT FLOW FROM executor-decision-tree.md

  questions_flow:
    Q1: "Output é 100% previsível dado o input?"
      - ✅ SIM → Go to Q2
      - ❌ NÃO → Go to Q3
      - ⚠️ PARCIAL → Explain why, then choose path

    Q2: "Pode ser escrito como função pura f(x) → y?"
      - ✅ SIM → Go to Q2a
      - ❌ NÃO → Go to Q3

    Q2a: "Existe biblioteca/API que faz isso?"
      - ✅ SIM → WORKER
      - ❌ NÃO → Go to Q2b

    Q2b: "Vale a pena codificar? (usado 3+ vezes?)"
      - ✅ SIM → WORKER
      - ❌ NÃO → AGENT

    Q3: "Requer interpretação de linguagem natural?"
      - ✅ SIM → Go to Q4
      - ❌ NÃO → Go to Q5

    Q4: "Impacto de erro é significativo?"
      - Alto/Médio → HYBRID
      - Baixo → AGENT

    Q5: "Requer julgamento estratégico/relacionamento?"
      - ✅ SIM → Go to Q6
      - ❌ NÃO → Go to Q4

    Q6: "AI pode assistir/preparar?"
      - ✅ SIM → HYBRID
      - ❌ NÃO → HUMAN
```

---

### Step 1.3: MANDATORY Output Format

**EVERY analysis MUST produce this exact table format:**

```markdown
## Task: {task_name}

| Step | Ação | Q1 Det? | Q2 Pura? | Q2a Lib? | Q3 NL? | Q4 Impacto? | Executor | Justificativa |
|------|------|---------|----------|----------|--------|-------------|----------|---------------|
| 1.1 | {action} | ✅/❌/⚠️ | ✅/❌/⚠️ | ✅/❌/⚠️ | ✅/❌ | Alto/Médio/Baixo | Worker/Agent/Hybrid/Human | {why} |
| 1.2 | {action} | ✅/❌/⚠️ | ✅/❌/⚠️ | ✅/❌/⚠️ | ✅/❌ | Alto/Médio/Baixo | Worker/Agent/Hybrid/Human | {why} |
...
```

**Example of CORRECT analysis:**

```markdown
## Task: db-health-check.md

| Step | Ação | Q1 Det? | Q2 Pura? | Q2a Lib? | Q3 NL? | Q4 Impacto? | Executor | Justificativa |
|------|------|---------|----------|----------|--------|-------------|----------|---------------|
| 1.1 | Conectar ao banco | ✅ SIM | ✅ SIM | ✅ SIM (pg) | - | - | Worker | Connection string + lib = determinístico |
| 1.2 | Verificar pool | ✅ SIM | ✅ SIM | ✅ SIM (pg) | - | - | Worker | Query fixa retorna métricas fixas |
| 1.3 | EXPLAIN queries | ✅ SIM | ✅ SIM | ✅ SIM (pg) | - | - | Worker | EXPLAIN é comando SQL determinístico |
| 1.4 | Checar tamanhos | ✅ SIM | ✅ SIM | ✅ SIM | - | - | Worker | pg_relation_size() é determinístico |
| 1.5 | Gerar relatório | ⚠️ PARCIAL | ❌ NÃO | - | ✅ SIM | Baixo | Agent | Interpretar dados e sugerir melhorias |

**Conclusão:** 4/5 ações são Worker, 1/5 é Agent → Task é HYBRID ou pode ter script + agent no final
```

**Example of WRONG analysis (DO NOT DO THIS):**

```markdown
❌ ERRADO: "db-health-check parece ser Agent porque faz análise de banco"
❌ ERRADO: Analisar pelo nome do arquivo sem ler o conteúdo
❌ ERRADO: Não mostrar a tabela com cada ação
❌ ERRADO: Pular perguntas Q1-Q6
```

---

### Step 1.4: Quality Gate Before Proceeding

```yaml
quality_gate_phase_1:
  checklist:
    - [ ] Decision tree framework was READ completely (not summarized)
    - [ ] Each task was READ completely (not assumed from name)
    - [ ] Each task was DECOMPOSED into individual actions
    - [ ] Each action went through Q1-Q6 questions
    - [ ] Table format was used for every task
    - [ ] Justification column explains the reasoning

  if_any_unchecked:
    action: STOP
    message: "Analysis incomplete. Return to Step 1.1"
```

### Step 1.5: Aggregate Task Classification

After analyzing all actions, classify the TASK OVERALL:

```yaml
classify_task:
  logic: |
    Count executor types across all actions:
    - If 100% Worker → Task is WORKER
    - If 100% Agent → Task is AGENT
    - If mixed Worker + Agent → Task is HYBRID (Worker script + Agent interpretation)
    - If any Human → Task requires HUMAN involvement

  categories:

    SHOULD_BE_WORKER:
      criteria:
        - "ALL actions are deterministic (Q1=SIM)"
        - "ALL can be pure functions (Q2=SIM)"
        - "Libraries exist OR worth coding (Q2a/Q2b=SIM)"
      recommendation: "Create Worker script"
      priority: "HIGH"

    COULD_BE_WORKER:
      criteria:
        - "MAJORITY of actions are deterministic"
        - "1-2 actions need interpretation"
        - "Can split: Worker for deterministic + Agent fallback"
      recommendation: "Create Worker with Agent fallback"
      priority: "MEDIUM"

    CORRECTLY_AGENT:
      criteria:
        - "MAJORITY of actions require NL interpretation (Q3=SIM)"
        - "Impact is LOW (Q4=Baixo)"
        - "Current execution_type = Agent matches analysis"
      recommendation: "Keep as Agent"
      priority: "NONE"

    SHOULD_BE_HYBRID:
      criteria:
        - "Contains Agent actions with MEDIUM/HIGH impact"
        - "Output affects external users/clients"
        - "Would benefit from human review"
      recommendation: "Add human validation step"
      priority: "MEDIUM"

    MISCLASSIFIED:
      criteria:
        - "Current execution_type doesn't match analysis"
        - "Example: execution_type=Agent but all actions are deterministic"
      recommendation: "Reclassify executor"
      priority: "HIGH"
```

---

## PHASE 1b: SCOPE CLARIFICATION [v4.0]

**Trigger:** After Phase 1 decomposition
**Duration:** 2-3 minutes
**Condition:** Task references external files or has dynamic paths
**Evidence:** an-clone-review — Haiku scored 78.6% because it analyzed wrapper only, not delegated persona

### Step 1b.1: Detect Scope Ambiguity

```yaml
detect_scope_ambiguity:
  check_for:
    - "Task references other files? (delegated persona, configs, data files)"
    - "Task uses dynamic paths? ({mind_path}, {squad_path})"
    - "Task has wrapper→persona delegation pattern?"
    - "Task scope says 'analyze X' but X includes sub-files?"

  red_flags:
    - "Wrapper agent that delegates to persona file"
    - "Path like 'squads/mind-cloning/minds/{slug}/' without listing files inside"
    - "References to config.yaml sections without specifying which"
```

### Step 1b.2: Add Explicit Scope Definition

```yaml
add_scope_definition:
  action: |
    IF scope ambiguity detected, add to task file:

    ## SCOPE DEFINITION

    **Primary file:** {main_file}
    **Include in scope:**
    - [ ] Delegated persona files (if wrapper → READ BOTH)
    - [ ] Referenced configs ({list specific sections})
    - [ ] Source directories ({list specific files})

    **Explicit scope:**
    ```
    WHEN analyzing this target:
    - INCLUDE: {exhaustive list of files/paths}
    - EXCLUDE: {list of files NOT to analyze}
    - IF wrapper delegates to persona → READ BOTH files
    - IF config references agents → ENUMERATE and check each agent file
    ```

  veto: "Tasks with ambiguous scope MUST NOT proceed to Haiku testing without clarification."
```

---

## PHASE 1c: GATEKEEPER DETECTION [v4.0]

**Trigger:** During Phase 1 analysis
**Duration:** 1-2 minutes
**Evidence:** qa-after-creation — Opus 8.32 APPROVED, Haiku 9.9 APPROVED. Decision matched despite 19% score difference.

### Step 1c.1: Detect Gatekeeper Pattern

```yaml
detect_gatekeeper:
  definition: |
    A GATEKEEPER task has ONE primary output: a DECISION (PASS/FAIL, APPROVED/REJECTED).
    Score details are secondary. Users care about the decision, not exact numbers.

  detection_criteria:
    is_gatekeeper_if:
      - "Task output is PASS/FAIL or APPROVED/REJECTED or QUALIFIED/NOT_QUALIFIED"
      - "Score is used to DERIVE decision (score >= 7.0 → PASS), not as final output"
      - "Users act on the decision, not the score"

    is_NOT_gatekeeper_if:
      - "Score IS the output (ranking, rating, comparison)"
      - "Users need exact numbers for planning"
      - "Small score differences change user actions"
```

### Step 1c.2: Apply Gatekeeper Qualification Rules

```yaml
gatekeeper_qualification:
  if_gatekeeper: true
  haiku_qualifies_if:
    decision_match: "REQUIRED — Opus and Haiku MUST agree on PASS/FAIL"
    score_variance: "<= 2.0 absolute points (not percentage)"
    # Example OK: Opus 8.32 APPROVED, Haiku 9.9 APPROVED → delta 1.58 → QUALIFIED
    # Example VETO: Opus 7.1 PASS, Haiku 4.5 FAIL → opposite decision → VETO (MTQ_VC_004)

  action: |
    Add to task metadata:
      gatekeeper: true
      qualification_rule: "decision_match required, score_variance <= 2.0"

  benefit: "More tasks qualify for Haiku because score variance is tolerated when decisions match."
```

---

## PHASE 2: ROI CALCULATION

**Duration:** 1-2 minutes

### Step 2.1: Estimate Costs

```yaml
calculate_roi:
  per_task:
    current_cost:
      if_agent:
        tokens_per_execution: "{estimate based on task complexity}"
        cost_per_1000_tokens: "$0.003 (input) + $0.015 (output)"
        executions_per_month: "{estimate}"
        monthly_cost: "{calculation}"

    potential_cost:
      if_worker:
        compute_per_execution: "$0.0001"
        monthly_cost: "{calculation}"

    savings:
      monthly: "{current - potential}"
      annual: "{monthly × 12}"

    conversion_effort:
      simple: "2-4 hours (lib exists)"
      medium: "1-2 days (need to implement)"
      complex: "3-5 days (edge cases)"

    payback_period:
      formula: "conversion_effort_cost / monthly_savings"
      threshold: "< 3 months = worth it"
```

---

## PHASE 3: REPORT GENERATION

**Duration:** 2-3 minutes

### Step 3.1: Generate Report

```yaml
report_template: |
  # Determinism Analysis Report

  **Target:** {target}
  **Date:** {date}
  **Tasks Analyzed:** {count}

  ---

  ## Executive Summary

  | Category | Count | Potential Monthly Savings |
  |----------|-------|---------------------------|
  | Should be Worker | {n} | ${savings} |
  | Could be Worker | {n} | ${savings} |
  | Correctly Agent | {n} | - |
  | Should be Hybrid | {n} | - |
  | Misclassified | {n} | - |

  **Total Potential Savings:** ${total}/month (${annual}/year)

  ---

  ## 🔴 HIGH PRIORITY: Should Be Worker

  Tasks que estão usando LLM mas poderiam ser código determinístico:

  ### {task_name}

  **Current:** Agent
  **Recommended:** Worker
  **Reason:** {analysis}

  **Evidence:**
  - Input: {input_type} → Estruturado ✅
  - Output: {output_type} → Previsível ✅
  - Lib exists: {lib_name} ✅

  **Implementation:**
  ```python
  # Sugestão de implementação
  {code_suggestion}
  ```

  **ROI:**
  - Current cost: ${current}/month
  - After conversion: ${after}/month
  - Savings: ${savings}/month
  - Conversion effort: {hours}h
  - Payback: {days} days

  ---

  ## 🟡 MEDIUM PRIORITY: Could Be Worker

  Tasks que poderiam ser Worker com algumas modificações:

  ### {task_name}

  **Current:** Agent
  **Recommended:** Worker with fallback to Agent
  **Reason:** {analysis}

  **Blockers:**
  - {blocker_1}
  - {blocker_2}

  **Path to Worker:**
  1. {step_1}
  2. {step_2}
  3. {step_3}

  ---

  ## ✅ CORRECTLY CLASSIFIED: Agent

  Tasks que corretamente usam LLM:

  | Task | Reason |
  |------|--------|
  | {task_name} | {reason} |

  ---

  ## ⚠️ SHOULD ADD VALIDATION: Hybrid

  Tasks Agent que deveriam ter validação humana:

  | Task | Impact Level | Recommendation |
  |------|--------------|----------------|
  | {task_name} | {level} | Add human review |

  ---

  ## Action Items

  ### Immediate (this week)
  - [ ] Convert {task_1} to Worker
  - [ ] Convert {task_2} to Worker

  ### Short-term (this month)
  - [ ] Evaluate {task_3} for conversion
  - [ ] Add Hybrid validation to {task_4}

  ### Backlog
  - [ ] Monitor {task_5} for patterns
```

---

## PHASE 4: IMPLEMENTATION SUGGESTIONS

### Step 4.1: Generate Code Stubs

Para tasks classificadas como SHOULD_BE_WORKER, gerar sugestão de implementação:

```yaml
code_generation:
  for_each_should_be_worker:
    analyze:
      - "Qual é a transformação core?"
      - "Quais libs usar?"
      - "Quais edge cases?"

    generate:
      script_template: |
        #!/usr/bin/env python3
        """
        Worker: {task_name}

        Converted from Agent to deterministic code.
        Original task: {task_file}
        """

        import {libs}

        def {function_name}(input_data: dict) -> dict:
            """
            {description}

            Args:
                input_data: {input_schema}

            Returns:
                {output_schema}
            """
            # Validation
            {validation_code}

            # Core transformation
            {transformation_code}

            # Output
            return {output}


        if __name__ == "__main__":
            # Example usage
            result = {function_name}({example_input})
            print(result)
```

---

## Examples

### Example 1: Analyzing Single Task (CORRECT FORMAT)

<!-- Example - replace with your squad and task -->
```
User: *optimize squads/{squad-name}/tasks/{task-name}.md

Agent:

## Step 0.0: Loading Decision Tree Framework ✅
Read: squads/squad-creator/data/executor-decision-tree.md (775 lines)

## Step 0.1: Loading Task
Read: squads/{squad-name}/tasks/{task-name}.md

## Step 1.1: Decomposing into Actions
Actions found in {task-name}.md:
- 1.1: Receive testimonial data object
- 1.2: Extract quote, name, title fields
- 1.3: Format into string pattern
- 1.4: Return formatted string

## Step 1.2-1.3: Decision Tree Analysis (Per Action)

| Step | Ação | Q1 Det? | Q2 Pura? | Q2a Lib? | Q3 NL? | Q4 Impacto? | Executor | Justificativa |
|------|------|---------|----------|----------|--------|-------------|----------|---------------|
| 1.1 | Receive data object | ✅ SIM | ✅ SIM | ✅ SIM | - | - | Worker | JSON parsing é determinístico |
| 1.2 | Extract fields | ✅ SIM | ✅ SIM | ✅ SIM | - | - | Worker | Object property access é determinístico |
| 1.3 | Format string | ✅ SIM | ✅ SIM | ✅ SIM | - | - | Worker | Template string é determinístico |
| 1.4 | Return result | ✅ SIM | ✅ SIM | ✅ SIM | - | - | Worker | Return value é determinístico |

## Step 1.5: Task Classification

**Result:** 4/4 ações são Worker → Task é **SHOULD_BE_WORKER** ✅

**Current:** Agent ❌
**Recommended:** Worker ✅
**Priority:** HIGH

## ROI Calculation

| Métrica | Antes (Agent) | Depois (Worker) |
|---------|---------------|-----------------|
| Tokens/exec | ~500 | ~0 |
| Custo/exec | $0.015 | $0.0001 |
| Mensal (200 exec) | $3.00 | $0.02 |
| Anual | $36.00 | $0.24 |
| **Economia** | | **$35.76/ano (99%)** |
```

### Example 2: Analyzing Mixed Task (Worker + Agent)

<!-- Example - replace with your squad and task -->
```
User: *optimize squads/{squad-name}/tasks/{task-name}.md

Agent:

## Step 0.0: Loading Decision Tree Framework ✅
Read: squads/squad-creator/data/executor-decision-tree.md (775 lines)

## Step 0.1: Loading Task
Read: squads/{squad-name}/tasks/{task-name}.md

## Step 1.1: Decomposing into Actions
Actions found:
- 1.1: Connect to database
- 1.2: Query pg_stat_activity
- 1.3: Check connection pool metrics
- 1.4: Run EXPLAIN on slow queries
- 1.5: Check table/index sizes
- 1.6: Analyze findings and generate recommendations

## Step 1.2-1.3: Decision Tree Analysis (Per Action)

| Step | Ação | Q1 Det? | Q2 Pura? | Q2a Lib? | Q3 NL? | Q4 Impacto? | Executor | Justificativa |
|------|------|---------|----------|----------|--------|-------------|----------|---------------|
| 1.1 | Connect to DB | ✅ SIM | ✅ SIM | ✅ SIM (pg) | - | - | Worker | pg lib + connection string = determinístico |
| 1.2 | Query pg_stat | ✅ SIM | ✅ SIM | ✅ SIM | - | - | Worker | SQL query retorna dados estruturados |
| 1.3 | Check pool | ✅ SIM | ✅ SIM | ✅ SIM | - | - | Worker | Métricas são valores numéricos |
| 1.4 | Run EXPLAIN | ✅ SIM | ✅ SIM | ✅ SIM | - | - | Worker | EXPLAIN é comando SQL determinístico |
| 1.5 | Check sizes | ✅ SIM | ✅ SIM | ✅ SIM | - | - | Worker | pg_relation_size() retorna bytes |
| 1.6 | Analyze + recommend | ❌ NÃO | - | - | ✅ SIM | Baixo | Agent | Interpretar padrões e sugerir melhorias |

## Step 1.5: Task Classification

**Result:** 5/6 Worker + 1/6 Agent → Task é **COULD_BE_WORKER** (with Agent fallback)

**Recommendation:** Create bash script for steps 1.1-1.5, Agent only for 1.6

**Implementation Strategy:**
```
scripts/db-health-checker.sh → Executa queries, coleta dados
Agent → Recebe dados, interpreta, gera recomendações
```

## ROI Calculation

| Métrica | Antes (100% Agent) | Depois (Hybrid) |
|---------|-------------------|-----------------|
| Tokens input/exec | ~2000 | ~500 |
| Tokens output/exec | ~1000 | ~800 |
| Custo/exec | $0.10 | $0.05 |
| Economia | | **50%** |
```

### Example 3: Squad Summary Report

```
User: *optimize db-sage

Agent:

## 📊 Determinism Analysis: Squad db-sage

**Date:** 2026-02-03
**Tasks Analyzed:** 28

---

## Summary Table

| Category | Count | % | Monthly Savings |
|----------|-------|---|-----------------|
| 🔴 SHOULD_BE_WORKER | 8 | 29% | $40 |
| 🟡 COULD_BE_WORKER | 5 | 18% | $25 |
| ✅ CORRECTLY_AGENT | 12 | 43% | - |
| ⚠️ SHOULD_BE_HYBRID | 3 | 10% | - |

**Total Potential Savings:** $65/month ($780/year)

---

## 🔴 HIGH PRIORITY: Should Be Worker

[For each task, show the analysis table as in Example 1]

---

## 🟡 MEDIUM PRIORITY: Could Be Worker

[For each task, show the analysis table as in Example 2]

---

## ✅ Correctly Agent

| Task | Reason (from Q1-Q6 analysis) |
|------|------------------------------|
| query-optimization.md | Q3=SIM: requires analyzing query patterns |
| domain-modeling.md | Q3=SIM: requires understanding business context |
...
```

---

## Command Variants

```bash
# SCAN (default) - análise + scope + gatekeeper detection
*optimize db-sage                      # Phases 0→1→1b→1c→2→3
*optimize copy
*optimize all

# IMPLEMENT - scan + code stubs + binary checkpoint conversion
*optimize db-sage --implement          # + Phases 4→4b

# HYBRID - FULL PIPELINE [v3.0+v4.0]
# Analisa → Binary checkpoints → Script/Hybrid executor → GAP ZERO → Testa → Bias test
*optimize copy --hybrid                # + Phases 5→6→7→7b
*optimize db-sage --hybrid

# POST - economia pós-refatoração
*optimize db-sage --post               # Phase 8
*optimize db-sage --post --exec 50     # projeção com 50 exec/mês

# COMBINADOS
*optimize db-sage --implement --post   # implementa + economia
*optimize copy --hybrid --post         # full pipeline + economia
```

---

## Quality Gate

```yaml
quality_gate:
  id: "DET_ANALYSIS_001"
  name: "Determinism Analysis Quality"

  blocking:
    - "Cada task tem classificação"
    - "Classificação tem justificativa"
    - "ROI calculado para conversões"

  warning:
    - "Sugestão de código para Workers"
    - "Action items priorizados"
```

---

## Integration Points

### Post-Analysis Actions

```yaml
post_analysis:
  if_should_be_worker:
    suggest:
      - "Quer que eu crie o script Worker para {task}?"
      - "Quer que eu atualize a task para execution_type: Worker?"

  if_should_be_hybrid:
    suggest:
      - "Quer que eu adicione human_review ao {task}?"

  if_misclassified:
    suggest:
      - "Quer que eu corrija o execution_type de {task}?"
```

---

## PHASE 4b: BINARY CHECKPOINT CONVERSION [v4.0]

**Trigger:** After Phase 4, if task has subjective scoring
**Duration:** 10-15 minutes per task
**Evidence:** an-fidelity-score v1.0→v2.0 — 82.22% Opus vs 81.67% Haiku = 99.3% match after conversion

### Step 4b.1: Detect Subjective Scoring

```yaml
detect_subjective_scoring:
  grep_patterns:
    - "Score 1-5"
    - "Rate from"
    - "Avaliar qualidade"
    - "Evaluate.*[0-9]"
    - "Quality score"
    - "Score.*subjective"

  action: |
    For each match:
      Record: { location, current_scoring, scale }

  if_found: "Proceed to conversion"
  if_not_found: "Skip Phase 4b — task already uses binary/deterministic scoring"
```

### Step 4b.2: Convert to Binary Checkpoints

```yaml
convert_to_binary:
  for_each_subjective_score:
    original: "Score layer X from 1-5"
    converted: |
      ## Layer X (5 checkpoints)

      | # | Checkpoint | O que procurar | Passa se... |
      |---|------------|----------------|-------------|
      | 1 | {specific_check_1} | {where_to_look} | {binary_condition: exists/not_exists} |
      | 2 | {specific_check_2} | {where_to_look} | {binary_condition: count >= N} |
      | 3 | {specific_check_3} | {where_to_look} | {binary_condition: grep matches} |
      | 4 | {specific_check_4} | {where_to_look} | {binary_condition: file has section} |
      | 5 | {specific_check_5} | {where_to_look} | {binary_condition: pattern present} |

      **Score = count(passed) → 0-5**

  rules:
    - "Each checkpoint MUST be answerable YES/NO"
    - "Each checkpoint MUST specify WHERE to look (file, section, field)"
    - "Each checkpoint MUST have a grep-able or count-able condition"
    - "NEVER: 'evaluate quality' or 'assess completeness'"
    - "ALWAYS: 'file exists', 'count >= 3', 'section contains X'"
```

### Step 4b.3: Add Scoring Calibration

```yaml
add_scoring_calibration:
  action: |
    Append to task file:

    ## SCORING CALIBRATION (CRITICAL)

    ```yaml
    scoring_philosophy:
      principle: "SCORE O QUE EXISTE, não o que falta"
      evidence_rule: "Se existe evidência → conta ponto. Gaps vão para recommendations."

      checkpoint_rules:
        - "PASS = evidence EXISTS (not perfect, not ideal — EXISTS)"
        - "FAIL = evidence MISSING (not weak, not partial — MISSING)"
        - "Partial evidence = PASS (generous interpretation)"
        - "Empty/null = FAIL"
    ```

  rationale: |
    Haiku can be conservative OR generous depending on task.
    Binary checkpoints + generous calibration eliminates both biases.
    Evidence: 99.3% match after conversion (an-fidelity-score).
```

### Step 4b.4: Quality Gate

```yaml
quality_gate_4b:
  checklist:
    - [ ] All subjective scores identified (grep)
    - [ ] Each converted to exactly 5 binary checkpoints
    - [ ] Each checkpoint has WHERE to look
    - [ ] Each checkpoint is grep-able or count-able
    - [ ] Scoring calibration section added
    - [ ] Zero "evaluate" or "assess" in checkpoint conditions
```

---

## PHASE 5: HYBRID EXECUTOR IMPLEMENTATION [v3.0]

**Trigger:** `--hybrid` flag (includes all previous phases automatically)
**Duration:** 5-15 minutes per task
**Condition:** Phase 1 classified task as COULD_BE_WORKER or mixed Worker+Agent

### Pré-condição + Script-First Priority Rule [v4.0]

```yaml
precondition:
  phase_1_complete: true

script_first_priority:
  # UPDATED v4.0: Three tiers based on deterministic percentage
  if_deterministic_pct >= 90:
    action: "SCRIPT-ONLY executor"
    llm_role: "Optional: gap recommendations only (not required for score)"
    cost: "~$0 per execution"
    example: "an-fidelity-score (95% det → fidelity-score.sh)"

  elif_deterministic_pct >= 60:
    action: "HYBRID executor (script + minimal LLM)"
    llm_role: "Interpretation of script results (8-12 questions)"
    cost: "~20% of full Agent"
    example: "validate-squad (88% det → validate-squad.sh + Haiku)"

  elif_deterministic_pct < 60:
    action: "Keep as AGENT"
    cost: "100%"
    note: "Task needs significant LLM reasoning"

  veto:
    id: "OPT_VC_SCRIPT_FIRST"
    condition: "deterministic_pct >= 90 AND decision = Hybrid"
    action: "VETO — Use SCRIPT-ONLY. Gastar tokens com 10% de interpretação quando script cobre 90% é desperdício."
```

### Step 5.1: Inventory Existing Scripts

```yaml
inventory_scripts:
  action: |
    BEFORE creating anything, check what already exists:

    1. ls {squad_path}/scripts/ → List all scripts
    2. Read scripts/README.md if exists
    3. For each script, map: script → which checks it covers
    4. Compare with Phase 1 decomposition: which Worker actions are ALREADY scripted?

  output:
    already_scripted: ["list of actions covered by existing scripts"]
    needs_scripting: ["list of Worker actions not yet in scripts"]
    existing_scripts: ["paths to existing scripts"]

  veto: "Do NOT create script from zero if existing script covers >50% of needed checks. EXTEND it."
  principle: "IDS: REUSE > ADAPT > CREATE"
```

### Step 5.2: Create/Extend Worker Script

```yaml
create_worker_script:
  action: |
    For actions classified as Worker in Phase 1:

    IF existing script covers >50%:
      EXTEND the existing script with missing checks
    ELSE:
      CREATE new script following the pattern

  script_pattern: |
    #!/usr/bin/env bash
    # Worker Script: {task_name} - Deterministic checks
    # Generated by: *optimize --hybrid
    # Covers: {N} of {total} actions (deterministic portion)
    #
    # Usage: bash {script_name}.sh {input_args} [--json]
    #
    # Output: /tmp/preflight-{task_name}.yaml
    #   Contains pre-computed data for ALL deterministic checks.
    #   The Agent phase reads this file instead of collecting data manually.

    set -euo pipefail

    # === CONFIGURATION ===
    TARGET="${1:?Usage: $0 <target> [--json]}"
    OUTPUT_FILE="/tmp/preflight-{task_name}.yaml"

    # === DETERMINISTIC CHECKS ===
    # {For each Worker action from Phase 1, generate the bash equivalent}

    # === OUTPUT ===
    # Write structured YAML with all collected data
    cat > "$OUTPUT_FILE" << YAML
    preflight:
      target: "$TARGET"
      timestamp: "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
      script_version: "1.0.0"
      # {all collected metrics}
    YAML

    echo "Preflight saved to: $OUTPUT_FILE"

  output:
    script_path: "{squad_path}/scripts/{task_name}-worker.sh"
    actions_covered: N
    actions_total: M
    coverage_pct: "N/M * 100"
```

### Step 5.3: Create Minimal Agent Prompt

```yaml
create_agent_prompt:
  action: |
    For actions classified as Agent in Phase 1, create a MINIMAL prompt section
    that RECEIVES pre-computed data and ONLY does interpretation.

  prompt_pattern: |
    ## Agent Interpretation Phase (receives pre-computed data)

    ### INPUT REQUIRED: preflight-{task_name}.yaml

    ```
    BEFORE starting interpretation:

      READ /tmp/preflight-{task_name}.yaml

    IF file does not exist → STOP. Run the worker script first:
      bash {squad_path}/scripts/{task_name}-worker.sh {target}

    DO NOT re-collect these numbers manually.
    DO NOT run ls/grep/wc/find yourself.
    Your job is INTERPRETATION ONLY — not data collection.
    ```

    ### Questions to Answer (using pre-computed data)

    {For each Agent action from Phase 1:}
    - Q{N}: "{question derived from the action}"
      Data available: "{which preflight fields to use}"
      Answer: YES/NO + brief evidence

  output:
    prompt_section: "Markdown to append/replace in task file"
    questions_count: N
    estimated_haiku_tokens: "~{N * 100} tokens (minimal)"
```

### Step 5.4: Quality Gate

```yaml
quality_gate_phase_5:
  checklist:
    - [ ] Existing scripts were checked BEFORE creating new ones (IDS)
    - [ ] Worker script covers ALL deterministic actions from Phase 1
    - [ ] Worker script outputs structured YAML (not plain text)
    - [ ] Agent prompt RECEIVES preflight data (not collects it)
    - [ ] Agent prompt has N questions matching N Agent actions from Phase 1
    - [ ] Script has --json flag for structured output
    - [ ] Script has usage/help documentation

  if_any_unchecked:
    action: STOP
    message: "Hybrid executor incomplete. Fix before proceeding."
```

---

## PHASE 6: GAP ZERO ENFORCEMENT [v3.0]

**Trigger:** `--hybrid` flag, after Phase 5
**Duration:** 2-5 minutes
**Purpose:** Modify the task file to IMPOSSIBILITATE the wrong path

### Step 6.1: Add EXECUTE FIRST Block

```yaml
add_execute_first:
  action: |
    Insert at the BEGINNING of the task's first execution phase:

    ### MANDATORY PREFLIGHT: Run Worker Script FIRST

    ```
    EXECUTE FIRST — before ANY manual analysis:

      bash {script_path} {input_placeholder} --json > /tmp/preflight-{task_name}.yaml

    IF the command fails → FIX the script error. Do NOT proceed manually.
    IF the command succeeds → READ /tmp/preflight-{task_name}.yaml. Use ONLY these numbers.

    VETO: If /tmp/preflight-{task_name}.yaml does not exist → BLOCK.
          Do NOT collect data manually. Do NOT run ls/grep/wc yourself.
          The script does this faster, cheaper, and 100% consistently.
    ```

  location: "Before the first phase that collects data"
```

### Step 6.2: Add INPUT REQUIRED Blocks

```yaml
add_input_required:
  action: |
    For EACH phase that previously collected data manually,
    replace collection instructions with:

    ### INPUT REQUIRED: preflight-{task_name}.yaml

    ```
    READ /tmp/preflight-{task_name}.yaml

    IF file does not exist → STOP. Go back and run the worker script.
    DO NOT re-collect these numbers. INTERPRETATION ONLY.
    USE the numbers from preflight as INPUTS for scoring below.
    ```

  locations: "All phases after the first that use data from deterministic checks"
```

### Step 6.3: Add Veto Condition

```yaml
add_veto_condition:
  action: |
    Add to the task's veto conditions section (create section if doesn't exist):

    - id: "GAP_ZERO_001"
      condition: "Preflight results not generated by Worker script"
      check: "/tmp/preflight-{task_name}.yaml does not exist"
      result: "VETO - BLOCK. Run worker script FIRST."
      rationale: "{coverage_pct}% of checks are deterministic. Script runs them in <30s with 100% consistency."

  principle: |
    PV004: "SE executor CONSEGUE fazer errado → processo está errado"
    The LLM CAN skip the script and do everything manually.
    This veto makes that path IMPOSSIBLE.
```

### Step 6.4: Update Task Version

```yaml
update_version:
  action: |
    Bump task version to indicate hybrid executor upgrade:
    - Minor bump if task was already hybrid-aware
    - Major bump if task was 100% Agent before

  update_fields:
    - "Execution Type: Hybrid (Worker script + Agent interpretation)"
    - "Worker Scripts: {script_path}"
    - Version bump
```

---

## PHASE 7: EMPIRICAL VALIDATION [v3.0]

**Trigger:** `--hybrid` flag, after Phase 6
**Duration:** 2-5 minutes
**Purpose:** PROVE the hybrid executor works by running it

### Step 7.1: Run Worker Script

```yaml
run_worker:
  action: |
    bash {script_path} {test_input} --json > /tmp/preflight-{task_name}.yaml

  validation:
    - "Exit code 0?"
    - "Output file exists?"
    - "Output is valid YAML?"
    - "All expected fields present?"

  on_fail: "Script has bugs. Fix before proceeding."
```

### Step 7.2: Run with Haiku (--fast)

```yaml
run_haiku:
  action: |
    IF script has built-in Claude analysis (like validate-squad.sh):
      bash {script_path} {test_input} --fast --json
    ELSE:
      Run Haiku agent with the updated task file + preflight data as input

  output:
    haiku_score: "Score from Haiku execution"
    haiku_quality: "Quality assessment"
```

### Step 7.3: Compare with Baseline

```yaml
compare_baseline:
  action: |
    IF Opus baseline exists (from previous test or wf-model-tier-qualification):
      Compare Haiku hybrid score vs Opus baseline score
      Calculate quality percentage
    ELSE:
      Run Opus baseline first, then compare

  thresholds:
    qualified: "Haiku >= 90% of Opus baseline quality"
    conditional: "Haiku >= 75% of Opus baseline quality"
    fail: "Haiku < 75%"
```

### Step 7.4: Save Test Case

```yaml
save_test_case:
  action: |
    Save results to test-cases/{task_name}/ as NEW file (never overwrite):

    Filename pattern: {model}-round-{N}-v{task_version}.yaml

  content:
    test_metadata:
      round: N
      task_version: "{new_version}"
      model: "haiku"
      execution: "hybrid (script + haiku)"
      command: "{exact command used}"

    results:
      worker_script: "{script output summary}"
      agent_interpretation: "{haiku output summary}"
      final_score: N
      quality_vs_baseline: "N%"

    gap_zero_validation:
      script_ran_first: true
      llm_collected_data_manually: false
      preflight_used_as_input: true
      caminho_errado_impossibilitado: true

    cost_comparison:
      before: "${cost of 100% LLM execution}"
      after: "${cost of hybrid execution}"
      savings: "N%"

  veto: "NEVER overwrite existing test case files. Always create new."
```

### Step 7.5: Generate Optimization Report

```yaml
generate_report:
  template: |
    # Hybrid Executor Optimization Report

    **Task:** {task_name}
    **Date:** {date}
    **Optimizer:** *optimize --hybrid v3.0

    ## Before vs After

    | Aspect | Before (100% LLM) | After (Hybrid) | Delta |
    |--------|-------------------|-----------------|-------|
    | Executor | Agent (all phases) | Script {pct}% + Haiku {pct}% | Hybrid |
    | Deterministic checks | LLM approximation | Script (100% consistent) | +Reliability |
    | Cost/run | ${before} | ${after} | -{savings}% |
    | Speed | {before}s | {after}s | -{delta}s |
    | Consistency | Varies by model/run | Script=100%, LLM=interpretation only | +Consistency |

    ## GAP ZERO Applied

    - [x] EXECUTE FIRST block added to task
    - [x] INPUT REQUIRED blocks added to interpretation phases
    - [x] Veto condition GAP_ZERO_001 added
    - [x] Task version bumped

    ## Empirical Proof

    | Model | Score | Quality vs Baseline | Cost |
    |-------|-------|-------------------- |------|
    | Opus baseline | {score} | 100% | ${cost} |
    | Haiku hybrid | {score} | {pct}% | ${cost} |

    ## Verdict: {QUALIFIED | CONDITIONAL | NEEDS_WORK}
```

---

## PHASE 7b: BIDIRECTIONAL BIAS TEST [v4.0]

**Trigger:** After Phase 7, if Haiku passed with >90% match
**Duration:** 5-10 minutes
**Condition:** `--hybrid` flag (runs automatically after Phase 7)
**Evidence:** an-clone-review (Haiku -20% conservative) vs an-validate-clone (Haiku +14% generous)

### Step 7b.1: Run with Different Targets

```yaml
run_multiple_targets:
  action: |
    Run the hybrid executor (script + Haiku) with 3 DIFFERENT targets:

    1. SMALL target → Expected: higher score (less to validate)
    2. LARGE target → Expected: lower score (more potential issues)
    3. EDGE CASE target → Expected: tests boundary behavior

  example:
    validate-squad:
      small: "squads/db-sage"          # 2 agents, simple
      large: "squads/copy"             # 24 agents, complex
      edge:  "squads/squad-creator"    # Hybrid type, meta-squad

  output:
    results:
      - { target: "small", score: X, decision: "PASS/FAIL" }
      - { target: "large", score: Y, decision: "PASS/FAIL" }
      - { target: "edge",  score: Z, decision: "PASS/FAIL" }
```

### Step 7b.2: Detect Bias Direction

```yaml
detect_bias:
  compare: "Haiku scores vs Opus scores for same targets"

  patterns:
    consistent_conservative:
      condition: "Haiku < Opus in ALL 3 tests"
      action: "ADD Scoring Calibration (bias up)"
      compensation: "COMP_001 (generous interpretation)"

    consistent_generous:
      condition: "Haiku > Opus in ALL 3 tests"
      action: "ADD Scoring Calibration (bias down) or accept if gatekeeper"
      compensation: "Lower thresholds in scoring calibration"

    inconsistent:
      condition: "Haiku direction varies across tests"
      action: "VETO — Task needs more structure before Haiku qualification"
      note: "Go back to Phase 4b (binary checkpoints) to reduce variance"

    neutral:
      condition: "Delta < 0.5 in all tests"
      action: "QUALIFIED — No bias detected"
```

### Step 7b.3: Save Bias Report

```yaml
save_bias_report:
  file: "test-cases/{task_name}/bias-report.yaml"
  content:
    bias_report:
      task: "{task_name}"
      date: "{today}"
      tests_run: 3
      results:
        - { target: "small", opus: X, haiku: Y, delta: Z, direction: "conservative/generous/neutral" }
        - { target: "large", opus: X, haiku: Y, delta: Z, direction: "conservative/generous/neutral" }
        - { target: "edge",  opus: X, haiku: Y, delta: Z, direction: "conservative/generous/neutral" }
      overall_bias: "conservative | generous | inconsistent | neutral"
      verdict: "QUALIFIED | NEEDS_CALIBRATION | VETO"
      action_taken: "{compensation applied or none}"

  veto: "NEVER overwrite existing bias reports. Create new file with timestamp."
```

---

## PHASE 8: POST-REFACTORING ECONOMY ANALYSIS

**Trigger:** Após implementar conversões Worker/Hybrid
**Command:** `*optimize {target} --post`

### Step 8.1: Inventory Changes

```yaml
inventory_changes:
  scan:
    - "Encontrar tasks com execution_type: Worker"
    - "Encontrar scripts criados em scripts/"
    - "Mapear task → script correspondente"

  collect:
    for_each_task:
      - task_name
      - execution_type
      - script_path (se Worker)
      - task_lines (wc -l)
      - script_lines (wc -l)
```

### Step 8.2: Calculate Token Economics

```yaml
token_economics:
  model: "claude-opus"
  pricing:
    input_per_1m: 15.00   # $15/1M tokens
    output_per_1m: 75.00  # $75/1M tokens
    avg_ratio: "80% input / 20% output"
    blended_per_1m: 27.00 # ~$0.027/1K tokens

  estimate_tokens:
    # 1 linha markdown ≈ 15 tokens
    # 1 linha código ≈ 10 tokens
    # Raciocínio do Agent ≈ 500-1500 tokens output

    before_agent:
      input: "task_lines × 15 + context_overhead(500)"
      output: "reasoning(800) + commands(300)"
      total_per_exec: "(input × 0.015) + (output × 0.075)"

    after_worker:
      input: "invocation_tokens(100) + result_parse(200)"
      output: "summary(150)"
      total_per_exec: "(300 × 0.015) + (150 × 0.075)"

    after_hybrid:
      # Worker executa + Agent valida resultado
      input: "invocation(100) + result(500) + validation_context(300)"
      output: "validation_reasoning(400)"
      total_per_exec: "(900 × 0.015) + (400 × 0.075)"
```

### Step 8.3: Generate Economy Report

```yaml
report_template: |
  ╔══════════════════════════════════════════════════════════════════════════════╗
  ║                    ANÁLISE DE ECONOMIA DE TOKENS                              ║
  ║                    Squad: {squad_name}                                        ║
  ║                    Data: {date}                                               ║
  ╚══════════════════════════════════════════════════════════════════════════════╝

  ═══ INVENTÁRIO DE MUDANÇAS ═══

  | Tipo     | Qty | Scripts Criados |
  |----------|-----|-----------------|
  | Worker   | {n} | {script_list}   |
  | Hybrid   | {n} | {script_list}   |
  | Agent    | {n} | (não alterados) |

  ═══ ECONOMIA POR EXECUÇÃO ═══

  | Task | Tipo | ANTES (tokens) | DEPOIS (tokens) | Economia |
  |------|------|----------------|-----------------|----------|
  {for_each_task}
  | {task_name} | {type} | {before} | {after} | {savings} ({pct}%) |
  {end_for}

  ═══ PROJEÇÃO MENSAL ═══

  Cenário: {executions_per_month} execuções/mês

  | Tipo    | Tasks | Exec/mês | Tokens ANTES | Tokens DEPOIS | Economia    |
  |---------|-------|----------|--------------|---------------|-------------|
  | Worker  | {n}   | {exec}   | {before}     | {after}       | {savings}   |
  | Hybrid  | {n}   | {exec}   | {before}     | {after}       | {savings}   |
  | Agent   | {n}   | {exec}   | {before}     | {before}      | 0           |
  |---------|-------|----------|--------------|---------------|-------------|
  | TOTAL   | {n}   | {exec}   | {total_before}| {total_after}| {total_sav} |

  ═══ ECONOMIA FINANCEIRA ═══

  Modelo: Claude Opus ($15/1M input + $75/1M output)

  | Período  | ANTES      | DEPOIS     | Economia   | % Redução |
  |----------|------------|------------|------------|-----------|
  | Por exec | ${before}  | ${after}   | ${savings} | {pct}%    |
  | Mensal   | ${monthly} | ${monthly} | ${savings} | {pct}%    |
  | Anual    | ${annual}  | ${annual}  | ${savings} | {pct}%    |

  ═══ ROI DA REFATORAÇÃO ═══

  | Métrica              | Valor            |
  |----------------------|------------------|
  | Tempo investido      | ~{hours}h        |
  | Custo do tempo       | ~${time_cost}    |
  | Economia mensal      | ${monthly_save}  |
  | Payback              | {payback_days} dias |
  | ROI 12 meses         | {roi_pct}%       |

  ═══ RESUMO EXECUTIVO ═══

  ┌─────────────────────────────────────────┐
  │  ECONOMIA TOTAL: {total_pct}%           │
  │  TOKENS/MÊS: -{tokens_saved}            │
  │  $/MÊS: -${monthly_savings}             │
  │  $/ANO: -${annual_savings}              │
  │  PAYBACK: {payback} dias                │
  └─────────────────────────────────────────┘
```

### Step 8.4: Per-Script Breakdown

```yaml
script_breakdown:
  for_each_script:
    script_name: "{name}"
    tasks_covered:
      - "{task_1}"
      - "{task_2}"

    metrics:
      script_lines: "{wc -l}"
      tasks_lines_total: "{sum of task lines}"
      tokens_saved_per_exec: "{calculation}"

    output: |
      ### {script_name}

      | Métrica | Valor |
      |---------|-------|
      | Tasks cobertas | {count} |
      | Linhas do script | {lines} |
      | Economia/execução | ~{tokens} tokens |
      | Economia/mês | ~${monthly} |

      **Tasks:**
      {for task in tasks}
      - `{task}` ({lines} linhas → {tokens} tokens economizados)
      {end}
```

### Step 8.5: Comparison Table

```yaml
comparison_table:
  generate: |
    ## Comparativo ANTES vs DEPOIS

    | Aspecto | ANTES (Agent) | DEPOIS (Worker) | Diferença |
    |---------|---------------|-----------------|-----------|
    | Tokens input/exec | ~{before_in} | ~{after_in} | -{diff} ({pct}%) |
    | Tokens output/exec | ~{before_out} | ~{after_out} | -{diff} ({pct}%) |
    | Custo/execução | ${before_cost} | ${after_cost} | -${diff} |
    | Tempo de resposta | ~{before_sec}s | ~{after_sec}s | -{diff}s |
    | Determinismo | Variável | 100% | +Confiabilidade |
    | Auditabilidade | Baixa | Alta | +Rastreabilidade |
```

---

## Quick Reference

```bash
# SCAN - Identifica oportunidades
*optimize {squad}

# IMPLEMENT - Converte + cria scripts
*optimize {squad} --implement

# POST - Economia após refatoração
*optimize {squad} --post

# FULL - Implementa e mostra economia
*optimize {squad} --implement --post
```

---

## Auto-Trigger Rules

```yaml
auto_trigger:
  after_script_creation:
    message: "Script criado. Executando *optimize --post..."
    auto_run: true

  after_batch_refactor:
    condition: "3+ tasks modificadas"
    message: "Refatoração detectada. Gerando análise de economia..."
    auto_run: true
```

---

## ⛔ ANTI-PATTERNS (What NOT to do)

These mistakes WILL result in wrong analysis:

### ❌ Anti-Pattern 1: Analyzing by filename only

```yaml
WRONG:
  input: "*optimize design"
  output: "thumbnail-design.md → Agent because 'design' suggests creativity"
  why_wrong: "Didn't read the task file, assumed from name"

CORRECT:
  input: "*optimize design"
  action:
    1. Read squads/design/tasks/thumbnail-design.md completely
    2. Decompose into individual actions
    3. Apply Q1-Q6 to EACH action
    4. Show table with all columns
```

### ❌ Anti-Pattern 2: Skipping the framework load

```yaml
WRONG:
  process: "I'll analyze the tasks based on my understanding..."
  why_wrong: "Framework not loaded, criteria not standardized"

CORRECT:
  process:
    1. READ squads/squad-creator/data/executor-decision-tree.md
    2. THEN analyze tasks using the exact Q1-Q6 flow
```

### ❌ Anti-Pattern 3: Summarizing instead of tabular output

```yaml
WRONG:
  output: |
    - Task A: Probably Worker
    - Task B: Seems like Agent
    - Task C: Could be Hybrid

CORRECT:
  output: |
    | Step | Ação | Q1 Det? | Q2 Pura? | Q2a Lib? | Q3 NL? | Q4 Impacto? | Executor | Justificativa |
    |------|------|---------|----------|----------|--------|-------------|----------|---------------|
    | ... detailed analysis per action ... |
```

### ❌ Anti-Pattern 4: Analyzing whole task instead of actions

```yaml
WRONG:
  analysis: "db-health-check is a complex task that involves database analysis → Agent"
  why_wrong: "Treated task as monolithic instead of decomposing"

CORRECT:
  analysis:
    1. Decompose: "Connect, Query, Check, Analyze"
    2. Analyze each: "Connect=Worker, Query=Worker, Check=Worker, Analyze=Agent"
    3. Conclude: "3/4 Worker + 1/4 Agent = Hybrid approach"
```

### ❌ Anti-Pattern 5: Using intuition instead of Q1-Q6 flow

```yaml
WRONG:
  reasoning: "This feels like it needs AI judgment"

CORRECT:
  reasoning: |
    Q1: Output previsível? ❌ NÃO - interpretar padrões varia
    Q3: Requer NL? ✅ SIM - gerar recomendações textuais
    Q4: Impacto de erro? Baixo - relatório interno
    → Agent (followed Q1→Q3→Q4 path)
```

---

## ✅ VALIDATION CHECKLIST (Before Delivering Report)

Run this checklist BEFORE presenting results to user:

```yaml
pre_delivery_validation:
  framework_compliance:
    - [ ] executor-decision-tree.md was READ completely (not summarized)
    - [ ] All 6 questions (Q1, Q2, Q2a, Q2b, Q3, Q4, Q5, Q6) are understood

  analysis_quality:
    - [ ] Each task file was READ completely (not assumed from name)
    - [ ] Each task was DECOMPOSED into individual actions
    - [ ] EVERY action has a row in the analysis table
    - [ ] Table has ALL columns: Step | Ação | Q1 | Q2 | Q2a | Q3 | Q4 | Executor | Justificativa
    - [ ] Executor column matches the Q1-Q6 flow result
    - [ ] Justificativa column explains WHY (not just "seems like")

  output_format:
    - [ ] Used markdown table format (not bullet lists)
    - [ ] Showed framework load step explicitly
    - [ ] Showed task decomposition step explicitly
    - [ ] Summary counts match individual analyses

  if_any_unchecked:
    action: GO_BACK_AND_FIX
    message: "Analysis incomplete. Redo from the unchecked step."
```

---

## Related Documents

- `executor-decision-tree.md` - Decision tree usado na análise (MUST READ)
- `executor-matrix-framework.md` - Perfis de executores
- `create-task.md` - Workflow de criação (usa mesma lógica)
- `validate-squad.md` - Referência de hybrid executor implementado (v4.0, GAP ZERO applied) **[v3.0]**
- `an-fidelity-score.md` - Referência de binary checkpoint conversion (v2.0, 99.3% match) **[v4.0]**
- `../workflows/wf-model-tier-qualification.yaml` - Workflow de qualificação Opus vs Haiku **[v3.0]**
- `../test-cases/validate-squad/` - Evidência empírica do padrão hybrid (Haiku 114% vs Opus baseline) **[v3.0]**
- `../test-cases/an-fidelity-score/` - Evidência empírica de binary checkpoint conversion **[v4.0]**
- `../scripts/fidelity-score.sh` - Referência de script-only executor (95% det, 0 tokens) **[v4.0]**
- `../docs/optimize-v4-proposal.md` - Proposal original com descobertas empíricas **[v4.0]**

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 4.1.0 | 2026-02-11 | FIX: Added explicit Model requirement (Opus REQUIRED) — PV Audit identified missing model spec |
| | | ADD: Haiku Eligible: NO — task has multiplicative impact, classification errors cascade |
| 4.0.0 | 2026-02-11 | NEW: Phase 1b (Scope Clarification) — explicit scope for Haiku literal interpretation |
| | | NEW: Phase 1c (Gatekeeper Detection) — PASS/FAIL tasks tolerate score variance |
| | | NEW: Phase 4b (Binary Checkpoint Conversion) — subjective → binary = 99.3% match |
| | | NEW: Phase 7b (Bidirectional Bias Test) — detect conservative/generous Haiku bias |
| | | UPDATE: Phase 5 Script-First Priority — ≥90% det → SCRIPT-ONLY, ≥60% → HYBRID |
| | | NEW: Veto OPT_VC_SCRIPT_FIRST — blocks Hybrid when Script-Only suffices |
| | | Evidence: 8 tasks tested, 5 patterns discovered empirically |
| 3.0.0 | 2026-02-11 | NEW: `--hybrid` flag — full pipeline: analyze + create hybrid executor + GAP ZERO + empirical test |
| | | NEW: Phase 5 (Hybrid Executor Implementation) — create/extend worker script + minimal agent prompt |
| | | NEW: Phase 6 (GAP ZERO Enforcement) — EXECUTE FIRST + INPUT REQUIRED + veto condition |
| | | NEW: Phase 7 (Empirical Validation) — run script + Haiku, compare with baseline, save test case |
| | | Renumbered old Phase 5 → Phase 8 (Post-Refactoring Economy) |
| | | Evidence: validate-squad v4.0 hybrid achieved Haiku 9.0 vs Opus baseline 7.89 (114.1%), cost -99.6% |
| 2.1.0 | 2026-02-07 | Added anti-patterns, validation checklist, post-refactoring economy analysis |
| 2.0.0 | 2026-02-03 | Added executor decision tree integration, Q1-Q6 analysis framework |
| 1.0.0 | 2026-01-28 | Initial version — Agent→Worker scan + ROI calculation |

---

**END OF TASK**
