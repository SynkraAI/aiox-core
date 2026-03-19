# Task: Fidelity Score

**Command:** `*fidelity-score`
**Load:** `data/an-clone-validation.yaml`

## Purpose

Calcular o score de fidelidade de um clone baseado nas 8 camadas do DNA Mental, com interpretacao e recomendacoes.

## Workflow

### Step 1: Load Validation Framework

Ler `data/an-clone-validation.yaml` para carregar:

- 8 dimensoes com pesos
- Score guides (1-5 por dimensao)
- Thresholds de classificacao

### Step 2: Evaluate Each Layer

Para cada camada, avaliar com evidencias:

**Layers Observable (peso 0.8):**

| #   | Layer                | Score | Evidencia                  |
| --- | -------------------- | ----- | -------------------------- |
| 1   | Behavioral Patterns  | /5    | {como age, reage}          |
| 2   | Communication Style  | /5    | {vocabulario, ritmo}       |
| 3   | Routines & Habits    | /5    | {padroes, rituais}         |
| 4   | Recognition Patterns | /5    | {red flags, oportunidades} |

**Layers Deep (peso 1.0):**

| #   | Layer                | Score | Evidencia                  |
| --- | -------------------- | ----- | -------------------------- |
| 5   | Mental Models        | /5    | {frameworks, heuristicas}  |
| 6   | Values Hierarchy     | /5    | {prioridades, rejeicoes}   |
| 7   | Core Obsessions      | /5    | {temas fixos, batalhas}    |
| 8   | Productive Paradoxes | /5    | {contradicoes preservadas} |

### Step 3: Calculate Weighted Score

Formula:

```
Observable Score = (L1 + L2 + L3 + L4) * 0.8 / 4
Deep Score = (L5 + L6 + L7 + L8) * 1.0 / 4
Overall = (Observable Score + Deep Score) / 2
Percentage = Overall / 5 * 100
```

### Step 4: Interpret Score

| Range  | Classification      | Meaning                                   |
| ------ | ------------------- | ----------------------------------------- |
| 60-75% | Basic (V1.0)        | MVP funcional, precisa refinar            |
| 75-85% | Intermediate (V2.0) | Funcional, passa teste basico             |
| 85-95% | Premium (V3.0+)     | Alta fidelidade, maioria nao percebe      |
| 93-97% | Elite               | Crown jewel, validado pela propria pessoa |

### Step 5: Identify Gaps

Para cada layer com score < 4:

- Identificar o que falta
- Sugerir fonte para melhorar (ouro)
- Estimar esforco de melhoria

### Step 6: Generate Report

```yaml
fidelity_report:
  clone: "{nome}"
  date: "{data}"
  scores:
    observable:
      behavioral_patterns: { score }
      communication_style: { score }
      routines_habits: { score }
      recognition_patterns: { score }
      subtotal: { weighted }
    deep:
      mental_models: { score }
      values_hierarchy: { score }
      core_obsessions: { score }
      productive_paradoxes: { score }
      subtotal: { weighted }
    overall:
      raw: { score }
      percentage: "{%}"
      classification: "basic|intermediate|premium|elite"
  gaps:
    - layer: "{nome}"
      current: { score }
      target: { score }
      action: "{o que fazer}"
      source_needed: "{tipo de fonte}"
  trajectory:
    current_version: "{1.0|2.0|3.0}"
    next_milestone: "{versao + % alvo}"
    estimated_effort: "{descricao}"
```

## Completion Criteria

- [ ] 8 camadas avaliadas com evidencias
- [ ] Score ponderado calculado
- [ ] Classificacao atribuida
- [ ] Gaps identificados com acoes
- [ ] Report YAML gerado
