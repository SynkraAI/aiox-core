# JD_MO_001 — Measurement & Outcomes Evaluation

**Type:** Decision Heuristic
**Phase:** 2 (Tracking e Revisão)
**Agent:** @kaizen:john-doerr
**Pattern:** JD-TRACK-001 (Avaliação de Sistemas de Medição e Outcomes)

## Purpose

Avalia a qualidade do sistema de tracking de OKRs e se os resultados medidos são genuínos outcomes (impacto no negócio) ou apenas outputs (atividades completadas). Sem tracking contínuo, OKRs morrem como resoluções de ano novo.

## Configuration

```yaml
JD_MO_001:
  name: "Measurement & Outcomes Evaluation"
  phase: 2

  weights:
    tracking_cadence: 0.95
    outcome_vs_output: 0.9
    transparency: 0.9
    check_in_quality: 0.85
    grading_discipline: 0.85
    cfr_integration: 0.8

  thresholds:
    check_in_frequency: "weekly"
    mid_cycle_review: "monthly"
    full_grading: "end of cycle"
    transparency_level: "all_okrs_visible_org_wide"
    leading_indicator_update: "weekly"

  veto_conditions:
    - condition: "OKRs definidos mas sem check-ins regulares"
      action: "VETO — Sem tracking, OKRs são apenas resoluções de ano novo."
    - condition: "Key Results medindo apenas atividades (outputs)"
      action: "VETO — 'Lançar X', 'Fazer Y' é output. Meça o IMPACTO."
    - condition: "OKRs confidenciais ou visíveis apenas para gestores"
      action: "VETO — Transparência é o oxigênio dos OKRs. Sem ela, o sistema morre."
    - condition: "Grading ao final do ciclo sem análise de aprendizados"
      action: "REVIEW — Grading sem reflexão é burocracia, não aprendizado."
    - condition: "OKRs usados como avaliação de desempenho individual"
      action: "VETO — OKRs são ferramenta de alinhamento, não de punição."

  decision_tree: |
    IF check-ins semanais acontecem → AVALIAR qualidade das conversas
    IF check-ins não acontecem → VETO — cadência quebrada
    IF Key Results são outcomes (impacto) → APPROVE
    IF Key Results são outputs (tarefas) → VETO — reescrever
    IF OKRs visíveis para toda a organização → APPROVE transparência
    IF OKRs confidenciais → VETO — mata alinhamento
    IF grading inclui análise de aprendizados → APPROVE
    IF grading é apenas número sem contexto → REVIEW
    TERMINATION: OKRs existem no papel mas ninguém age com base neles
```

## Application

**Input:** Sistema de tracking de OKRs, frequência de check-ins, formato de revisões, dados de progresso, grading de ciclos anteriores
**Process:** Verificar cadência de check-ins. Avaliar se métricas são outcomes ou outputs. Checar transparência. Analisar qualidade de grading.
**Output:** Diagnóstico da saúde do sistema de medição com recomendações para melhorar tracking e discipline

## Decision Tree

```text
STEP 1: VERIFICAR cadência de tracking

IF (Check-ins semanais acontecem com regularidade)
  THEN APPROVE — "Cadência está mantendo OKRs vivos."
ELSE IF (Check-ins mensais ou menos)
  THEN REVIEW — "Frequência insuficiente. Problemas aparecem tarde demais."
ELSE IF (Nenhum check-in regular)
  THEN VETO — "Sem cadência, OKRs são apenas intenção sem gestão."

STEP 2: AVALIAR qualidade de medição

IF (Key Results medem outcomes — impacto real no negócio)
  THEN APPROVE — "Você está medindo o que importa."
ELSE IF (Key Results medem outputs — tarefas, features, atividades)
  THEN VETO — "'Lançar feature' não é resultado. '20% mais retenção COM a feature' é."
ELSE IF (Key Results são binários — sim/não)
  THEN REVIEW — "Binário perde nuance. Prefira escala contínua (0.0 a 1.0)."

STEP 3: VERIFICAR transparência

IF (Todos os OKRs visíveis para toda a organização)
  THEN APPROVE — "Transparência é o que permite alinhamento."
ELSE IF (OKRs visíveis apenas para gestores ou time)
  THEN REVIEW — "Alinhamento horizontal requer visibilidade total."
ELSE IF (OKRs confidenciais)
  THEN VETO — "Um OKR confidencial é um OKR morto."

STEP 4: AVALIAR grading e aprendizados

IF (Grading ao final do ciclo + análise do que funcionou/não funcionou)
  THEN APPROVE — "Grading com reflexão é aprendizado organizacional."
ELSE IF (Grading apenas numérico sem contexto)
  THEN REVIEW — "Um score 0.3 sem análise não ensina nada. O que aprendemos?"
ELSE IF (Nenhum grading ao final do ciclo)
  THEN VETO — "Sem grading, não há accountability nem aprendizado."

STEP 5: VERIFICAR integração com CFRs

IF (Conversations, Feedback e Recognition acontecem paralelamente)
  THEN APPROVE — "OKRs + CFRs formam sistema completo de gestão."
ELSE IF (OKRs existem isolados sem CFRs)
  THEN REVIEW — "OKRs sem CFRs são músculos sem sistema nervoso."

TERMINATION: OKRs gradados mas ninguém ajusta estratégia com base nos dados
FALLBACK: Se tracking é caótico, simplificar — menos OKRs, mais disciplina
```

## Checklist de Avaliação

### Tracking Cadence
| Critério | Status | Peso |
|----------|--------|------|
| Check-ins semanais com time | | 0.95 |
| Mid-cycle review (mensal ou bi-mensal) | | 0.85 |
| Grading completo ao final do ciclo | | 0.9 |
| Leading indicators atualizados semanalmente | | 0.85 |

### Qualidade de Medição
| Critério | Status | Peso |
|----------|--------|------|
| Key Results são outcomes, não outputs | | 0.9 |
| Métricas são inequívocas (sem ambiguidade) | | 0.85 |
| Dados de progresso acessíveis em tempo real | | 0.8 |
| Baseline e meta claros para cada KR | | 0.85 |

### Transparência
| Critério | Status | Peso |
|----------|--------|------|
| OKRs visíveis para toda a organização | | 0.95 |
| Progresso atualizado e acessível | | 0.85 |
| Grading compartilhado publicamente | | 0.8 |

### Aprendizado
| Critério | Status | Peso |
|----------|--------|------|
| Grading inclui análise de aprendizados | | 0.85 |
| Retrospectivas ao final de cada ciclo | | 0.8 |
| Ajustes de estratégia com base em dados | | 0.9 |

## Examples

### APPROVE: Sistema de Tracking Saudável

- **Check-ins:** Semanais, 30 min, time completo
- **Mid-cycle:** Review mensal com ajustes de táticas
- **Grading:** Score + retrospectiva escrita de 2-3 páginas
- **Transparência:** OKRs em dashboard acessível a todos
- **Doerr diz:** "É a cadência que mantém OKRs vivos. Esse sistema respira."

### VETO: Outputs Disfarçados de Outcomes

**Key Results medidos:**
- KR1: Lançar feature de relatórios até março (✓)
- KR2: Redesenhar dashboard até fevereiro (✓)
- KR3: Fazer 3 campanhas de marketing (✓)
- **Problema:** Todas são atividades. Impacto no negócio é zero.
- **Doerr diz:** "Você completou tarefas. Mas qual foi o resultado? Usuários aumentaram? Retenção melhorou? Meça o outcome, não o output."

### REVIEW: Falta de Cadência

- **OKRs:** Bem formulados, ambiciosos, classificados
- **Check-ins:** Definidos apenas no início e no final do trimestre
- **Problema:** Time desviou, problemas surgiram, ninguém ajustou
- **Doerr diz:** "OKRs sem check-ins semanais morrem na segunda semana. Cadência é o que separa gestão de intenção."

## Core Quotes

- "Sem tracking, OKRs são apenas resoluções de ano novo."
- "A transparência é o oxigênio dos OKRs."
- "Meça o outcome, não o output. Lançar uma feature não é resultado — é atividade."
- "É a cadência — definir, acompanhar, revisar, repetir — que mantém OKRs vivos."

---

**Pattern Compliance:** JD-TRACK-001 (Avaliação de Sistemas de Medição e Outcomes)
**Source:** JD Mind DNA — OKR Framework + CFRs
