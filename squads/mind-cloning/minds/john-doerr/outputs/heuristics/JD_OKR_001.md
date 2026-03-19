# JD_OKR_001 — OKR Quality Assessment

**Type:** Decision Heuristic
**Phase:** 1 (Definição de OKRs)
**Agent:** @kaizen:john-doerr
**Pattern:** JD-QUAL-001 (Avaliação de Qualidade de OKRs)

## Purpose

Avalia se OKRs estão bem formulados — objetivos inspiradores, key results mensuráveis, cadência definida e classificação committed/aspirational explícita. OKRs mal escritos são piores que nenhum OKR, porque criam ilusão de gestão.

## Configuration

```yaml
JD_OKR_001:
  name: "OKR Quality Assessment"
  phase: 1

  weights:
    objective_quality: 0.9
    key_result_measurability: 0.95
    ambition_level: 0.85
    committed_vs_aspirational: 0.9
    cadence_defined: 0.85
    focus_discipline: 0.9

  thresholds:
    max_objectives_per_cycle: 5
    key_results_per_objective: "2-5"
    ideal_confidence_level: "60-70%"
    committed_score_target: 1.0
    aspirational_score_target: 0.7

  veto_conditions:
    - condition: "Objetivo contém número ou métrica"
      action: "REVIEW — Objetivos são qualitativos e inspiradores. O número vai no Key Result."
    - condition: "Key Result sem número mensurável"
      action: "VETO — Se não tem número, não é Key Result. É desejo."
    - condition: "Mais de 5 objetivos no ciclo"
      action: "VETO — Foco requer coragem de dizer não. Escolha os 3-5 mais importantes."
    - condition: "OKRs vinculados a bônus/compensação"
      action: "VETO — Vinculação a bônus destrói a coragem de definir stretch goals."
    - condition: "Todos os OKRs anteriores foram atingidos a 1.0"
      action: "REVIEW — Se consistentemente atingindo 1.0, não está sendo ambicioso o suficiente."
    - condition: "Key Results são atividades, não resultados"
      action: "VETO — 'Lançar feature X' é output. 'Aumentar retenção em 15%' é outcome."

  decision_tree: |
    IF objetivo é qualitativo, inspirador e time-bound → AVALIAR key results
    IF objetivo tem número → REVIEW — mover número para key result
    IF key results são todos mensuráveis com prazo → AVALIAR ambição
    IF key result sem número → VETO — reescrever com métrica
    IF confiança de atingir > 90% → REVIEW — não é stretch goal
    IF confiança de atingir < 30% → REVIEW — moonshot demais, ajustar
    IF mais de 5 objetivos → VETO — reduzir escopo
    TERMINATION: OKRs são lista de tarefas disfarçada
```

## Application

**Input:** Conjunto de OKRs propostos para um ciclo (trimestral ou anual)
**Process:** Avaliar cada Objective e Key Result contra critérios de qualidade. Verificar ambição, mensurabilidade, foco e classificação.
**Output:** Score de qualidade com recomendações específicas de melhoria por OKR

## Decision Tree

```text
STEP 1: AVALIAR cada Objective

IF (Qualitativo + Inspirador + Acionável + Time-bound)
  THEN APPROVE — "Este objetivo energiza a equipe."
ELSE IF (Contém número ou métrica)
  THEN REVIEW — "Mova o número para Key Result. O objetivo deve inspirar, não medir."
ELSE IF (Genérico demais — "melhorar", "crescer", "ser melhor")
  THEN REVIEW — "Muito vago. Ser melhor EM QUÊ? Para QUEM? Até QUANDO?"
ELSE IF (Não é acionável pela equipe)
  THEN VETO — "A equipe não pode influenciar este resultado. Redefina o escopo."

STEP 2: AVALIAR cada Key Result

IF (Quantitativo + Mensurável + Outcome-based + Prazo claro)
  THEN APPROVE — "Este Key Result é inequívoco."
ELSE IF (Sem número)
  THEN VETO — "Sem número, não é Key Result. 'Melhorar satisfação' vira
  'Aumentar NPS de 45 para 60 até março'."
ELSE IF (É atividade/output, não resultado/outcome)
  THEN VETO — "'Lançar feature' é tarefa. 'Aumentar retenção em 15% com a feature' é resultado."
ELSE IF (Binário — sim/não)
  THEN REVIEW — "KRs binários perdem nuance. Prefira escala contínua."

STEP 3: AVALIAR ambição

IF (Confiança de atingir entre 60-70%)
  THEN APPROVE — "Sweet spot — desafiador mas não impossível."
ELSE IF (Confiança > 90%)
  THEN REVIEW — "Se você já sabe que vai atingir, não é stretch. Aumente a barra."
ELSE IF (Confiança < 30%)
  THEN REVIEW — "Ambição é ótimo, mas isso é fantasia. Quebre em milestones."

STEP 4: CLASSIFICAR committed vs aspirational

IF (Classificação explícita presente)
  THEN APPROVE — "A equipe sabe o que é compromisso e o que é moonshot."
ELSE IF (Sem classificação)
  THEN REVIEW — "Confundir committed com aspirational destrói confiança no sistema."

TERMINATION: OKRs são lista de tarefas com rótulo de OKR
FALLBACK: Se equipe nunca usou OKRs, começar com 1-2 objetivos simples
```

## Checklist de Qualidade

### Objective
| Critério | Status | Peso |
|----------|--------|------|
| Qualitativo (sem números) | | 0.9 |
| Inspirador e energizante | | 0.85 |
| Acionável pela equipe | | 0.9 |
| Time-bound (prazo claro) | | 0.85 |
| Alinhado com estratégia da organização | | 0.9 |

### Key Result
| Critério | Status | Peso |
|----------|--------|------|
| Quantitativo (tem número) | | 0.95 |
| Outcome, não output | | 0.9 |
| Prazo específico | | 0.85 |
| Difícil mas possível (60-70% confiança) | | 0.85 |
| Sem ambiguidade sobre sucesso/fracasso | | 0.9 |

## Examples

### APPROVE: OKR Bem Formulado

**Objective:** "Tornar nosso produto indispensável para pequenas empresas"
- KR1: Aumentar DAU/MAU ratio de 35% para 55% até março
- KR2: Reduzir churn de 8% para 3% por mês até março
- KR3: Atingir NPS > 70 no segmento PME até março
- **Classificação:** Aspirational
- **Doerr diz:** "Isso é um OKR. Inspirador, mensurável, e assustador na medida certa."

### VETO: OKR como Lista de Tarefas

**Objective:** "Lançar 3 features e redesenhar o dashboard"
- KR1: Entregar feature de relatórios até janeiro
- KR2: Redesenhar UI do dashboard até fevereiro
- KR3: Integrar com Slack até março
- **Doerr diz:** "Isso é um roadmap de produto, não um OKR. Qual é o RESULTADO que essas features produzem? Meça o outcome, não o output."

### REVIEW: Falta de Ambição

**Objective:** "Melhorar a satisfação dos clientes"
- KR1: Aumentar NPS de 72 para 74
- KR2: Reduzir tickets de suporte de 120 para 115 por mês
- **Doerr diz:** "Isso é manutenção, não transformação. Se você tem 99% de certeza que vai atingir, não é stretch. De 72 para 85 — agora sim estamos falando."

## Core Quotes

- "Ideias são fáceis. Execução é tudo."
- "Se não tem número, não é Key Result — é desejo."
- "Se seus OKRs não te assustam um pouco, não são ambiciosos o suficiente."
- "OKRs não são lista de tarefas. Meça outcomes, não outputs."

---

**Pattern Compliance:** JD-QUAL-001 (Avaliação de Qualidade de OKRs)
**Source:** JD Mind DNA — OKR Framework
