# Task: Diagnose Clone

**Command:** `*diagnose-clone`
**Execution Type:** Hybrid
**Load:** `data/an-clone-anti-patterns.yaml`
**Version:** 2.0.0 (Haiku-compatible)

## Purpose

Diagnosticar por que um clone esta fraco, mapeando sintomas para causas raiz e prescrevendo tratamento.

---

## CHECKPOINT CLARIFICATIONS (Haiku Compatibility)

### Trinity Assessment Rules (BINARY - No Interpretation)

```yaml
trinity_rules:
  playbook:
    PRESENTE: "SE arquivo tem section 'Step' ou 'Workflow' com 3+ steps documentados"
    PARCIAL: "SE tem 1-2 steps OU steps sem detalhes"
    AUSENTE: "SE não tem section de workflow"
    check_method: "grep -c 'Step\\|Workflow\\|###' no arquivo"

  framework:
    PRESENTE: "SE arquivo tem 3+ heurísticas com formato 'SE X → ENTÃO Y' ou 'IF X THEN Y'"
    PARCIAL: "SE tem 1-2 heurísticas OU heurísticas sem formato SE/ENTÃO"
    AUSENTE: "SE não tem heurísticas documentadas"
    check_method: "grep -c 'SE.*ENTÃO\\|IF.*THEN\\|rule:' no arquivo"

  swipe_file:
    PRESENTE: "SE arquivo tem section 'output_examples' com 5+ exemplos"
    PARCIAL: "SE tem 1-4 exemplos"
    AUSENTE: "SE tem 0 exemplos"
    check_method: "Contar entries em output_examples section"
```

### Source Quality Rules (BINARY - Count Based)

```yaml
source_quality_rules:
  OURO: "SE >70% das fontes referenciadas são ouro (canonical artifacts, entrevistas, livros)"
  MIXED: "SE 30-70% são ouro"
  BRONZE: "SE <30% são ouro"

  ouro_indicators:
    - "References to squads/mind-cloning/minds/*/artifacts/"
    - "References to canonical .yaml files"
    - "References to entrevistas, podcasts, livros específicos"

  bronze_indicators:
    - "Genérico sem fonte específica"
    - "Inferências sem [SOURCE:]"
    - "Conteúdo de terceiros"
```

### Fidelity Score Formula (MECHANICAL - No Judgment)

```yaml
fidelity_formula:
  base_trinity:
    playbook: "PRESENTE=30, PARCIAL=15, AUSENTE=0"
    framework: "PRESENTE=30, PARCIAL=15, AUSENTE=0"
    swipe_file: "PRESENTE=20, PARCIAL=10, AUSENTE=0"

  bonuses:
    source_quality: "OURO=+10, MIXED=+5, BRONZE=0"
    immune_system: "SE tem 3+ veto conditions → +5, SENÃO 0"
    paradoxes: "SE tem section contradictions/paradoxes → +5, SENÃO 0"

  calculation: "SUM(base_trinity) + SUM(bonuses)"
  max_score: 100

  thresholds:
    critico: "<50%"
    review: "50-70%"
    bom: "70-85%"
    excelente: ">85%"
```

### Checkpoint Conversion (Interpretive → Binary)

```yaml
checkpoint_conversions:
  root_cause_real:
    OLD: "Mapeei a CAUSA RAIZ real ou só o sintoma?"
    NEW: "SE sintoma está na tabela Sintoma→Causa → causa raiz = valor da tabela"
    rule: "Usar SEMPRE a tabela de lookup. Não inferir causas fora da tabela."

  transformacao_profunda:
    OLD: "Tratamento gera transformação PROFUNDA?"
    NEW: "SE causa está na tabela Causa→Tratamento → tratamento = valor da tabela"
    rule: "Usar SEMPRE a tabela de lookup. Não inventar tratamentos."

  diagnostico_claro:
    OLD: "Diagnóstico tem causa raiz CLARA e tratamento ACIONÁVEL?"
    NEW: "SE report YAML tem todos campos preenchidos (non-empty) → CLARO"
    rule: "Verificar presença de campos, não julgar qualidade do conteúdo."
```

---

## Workflow

### Step 1: Identify Symptoms

Perguntar ao usuario: "O que esta errado com o clone?"

Sintomas comuns:
- "Responde generico" → provavelmente falta Framework
- "Nao parece a pessoa" → fontes bronze ou sem Voice DNA
- "Se perde em conversas longas" → prompt monolitico, precisa estagios
- "Quebra facil" → sem veto conditions, immune system fraco
- "Inventa coisas" → sem Swipe File, sem limites
- "Muito robótico" → sem contradicoes produtivas, sem storytelling

### Step 2: Map to Root Cause

#### >>> CHECKPOINT: Causa raiz (BINARY) <<<

```yaml
checkpoint_root_cause:
  rule: "SE sintoma está na tabela abaixo → usar causa da tabela"
  NO_INFERENCE: "Não inventar causas fora da tabela"
  validation: "Causa DEVE estar na coluna 'Causa Raiz Provavel'"
```

Usar `an-clone-anti-patterns.yaml` para diagnosticar:

| Sintoma | Causa Raiz Provavel | Anti-pattern |
|---------|---------------------|-------------|
| Generico | Falta Framework | So Playbook, sem SE/ENTAO |
| Nao parece pessoa | Fontes bronze | Volume sem curadoria |
| Se perde | Prompt monolitico | Sem estagios |
| Quebra facil | Sem immune system | Sem veto conditions |
| Inventa | Sem Swipe File | Sem exemplos reais |
| Robótico | Sem paradoxos | Contradictions resolvidas |

### Step 3: Verify Trinity (USE BINARY RULES)

**IMPORTANTE:** Usar CHECKPOINT CLARIFICATIONS acima. Não interpretar.

#### Playbook Check
```bash
# Contar sections Step/Workflow
grep -c 'Step\|Workflow\|###' {clone_file}
# SE >= 3 → PRESENTE | SE 1-2 → PARCIAL | SE 0 → AUSENTE
```

#### Framework Check
```bash
# Contar heurísticas SE/ENTÃO
grep -c 'SE.*ENTÃO\|IF.*THEN\|rule:\|heuristic' {clone_file}
# SE >= 3 → PRESENTE | SE 1-2 → PARCIAL | SE 0 → AUSENTE
```

#### Swipe File Check
```bash
# Contar output examples
grep -c 'output_example\|example_output\|```yaml' {clone_file} em section examples
# SE >= 5 → PRESENTE | SE 1-4 → PARCIAL | SE 0 → AUSENTE
```

#### Source Quality Check
```bash
# Contar referências ouro vs total
# Ouro: squads/mind-cloning/minds/, canonical .yaml, entrevistas, livros
# Bronze: genérico, inferido, terceiros
# SE >70% ouro → OURO | SE 30-70% → MIXED | SE <30% → BRONZE
```

#### Fidelity Score (CALCULATE - Don't estimate)
```yaml
# Aplicar fidelity_formula das CHECKPOINT CLARIFICATIONS
score:
  playbook: {30|15|0}
  framework: {30|15|0}
  swipe_file: {20|10|0}
  source_bonus: {10|5|0}
  immune_bonus: {5|0}
  paradox_bonus: {5|0}
  TOTAL: {sum}
```

### Step 4: Prescribe Treatment

#### >>> CHECKPOINT: Tratamento (BINARY - Use Table) <<<

```yaml
checkpoint_tratamento:
  rule: "SE causa está na tabela abaixo → usar tratamento da tabela"
  NO_INFERENCE: "Não inventar tratamentos fora da tabela"
  priority_rule: "Usar prioridade EXATA da tabela (URGENTE > ALTA > MEDIA)"
```

Para cada causa raiz, prescrever acao especifica:

| Causa | Tratamento | Prioridade |
|-------|------------|------------|
| Falta Framework | Extrair regras SE/ENTAO de entrevistas | URGENTE |
| Fontes bronze | Reclassificar, buscar ouro | URGENTE |
| Sem estagios | Mapear contextos, criar stages | ALTA |
| Sem Swipe | Coletar exemplos reais | ALTA |
| Sem immune | Definir veto conditions | MEDIA |
| Sem paradoxos | Mapear contradictions produtivas | MEDIA |

### Step 5: Generate Report

#### >>> CHECKPOINT: Report Completo (BINARY) <<<

```yaml
checkpoint_report_complete:
  rule: "SE todos campos do template estão preenchidos (non-empty) → COMPLETO"
  required_fields:
    - "clone: non-empty"
    - "symptoms: 1+ items"
    - "root_causes: 1+ items com cause + evidence + severity"
    - "trinity_status: playbook + framework + swipe_file preenchidos"
    - "source_quality: ouro|mixed|bronze"
    - "treatment: 1+ items com action + priority + effort"
    - "prognosis: non-empty"
  validation: "Contar campos preenchidos. SE todos → COMPLETO"
```

```yaml
diagnosis_report:
  clone: "{nome}"
  symptoms: [{lista}]
  root_causes:
    - cause: "{causa}"
      evidence: "{evidencia}"
      severity: "critico|alto|medio"
  trinity_status:
    playbook: "presente|ausente|parcial"
    framework: "presente|ausente|parcial"
    swipe_file: "presente|ausente|parcial"
  source_quality: "ouro|mixed|bronze"
  treatment:
    - action: "{o que fazer}"
      priority: "urgente|alta|media"
      effort: "{estimativa}"
  prognosis: "Com essas acoes, fidelidade deve subir de {X}% para {Y}%"
```

## Completion Criteria

- [ ] Sintomas identificados
- [ ] Causas raiz mapeadas
- [ ] Trindade verificada
- [ ] Tratamento prescrito com prioridades
- [ ] Report de diagnostico gerado
