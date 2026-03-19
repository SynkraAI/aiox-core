# KN_BSC_001 — Balanced Scorecard Assessment

**Type:** Decision Heuristic
**Phase:** 1 (Diagnóstico Estratégico)
**Agent:** @kaizen:kaplan-norton
**Pattern:** KN-DIAG-001 (Avaliação de Saúde Organizacional)

## Purpose

Avalia a saúde organizacional através das 4 perspectivas do Balanced Scorecard. Identifica desequilíbrios, lacunas de medição e rupturas na cadeia causa-efeito. O diagnóstico revela onde a organização está "voando cega" — sem instrumentos para navegar.

## Configuration

```yaml
KN_BSC_001:
  name: "Balanced Scorecard Assessment"
  phase: 1

  weights:
    financial_coverage: 0.7
    customer_coverage: 0.9
    process_coverage: 0.85
    learning_coverage: 0.95
    cause_effect_links: 0.95
    leading_lagging_balance: 0.9

  thresholds:
    minimum_perspectives: 4
    indicators_per_perspective: "3-7"
    maximum_total_indicators: 25
    cause_effect_chains: "minimum 2 per theme"

  veto_conditions:
    - condition: "Apenas métricas financeiras são monitoradas"
      action: "VETO — Você está dirigindo olhando apenas pelo retrovisor."
    - condition: "Perspectiva de aprendizado e crescimento ausente"
      action: "VETO — Sem a base da pirâmide, todo o resto é insustentável."
    - condition: "Indicadores sem relação causa-efeito documentada"
      action: "REVIEW — KPIs isolados são dados, não gestão estratégica."
    - condition: "Mais de 25 indicadores no scorecard"
      action: "REVIEW — Isso é um dashboard, não um BSC. Priorize."
    - condition: "Scorecard copiado de outra organização sem adaptação"
      action: "VETO — Cada estratégia é única. O scorecard deve refletir SUA estratégia."

  decision_tree: |
    IF organização tem indicadores em todas as 4 perspectivas → AVALIAR balanceamento
    IF alguma perspectiva tem 0 indicadores → VETO — perspectiva cega
    IF apenas financeiro é monitorado → VETO — gestão pelo retrovisor
    IF causa-efeito não está documentada → REVIEW — mapa estratégico necessário
    IF indicadores são todos lagging → REVIEW — sem capacidade preditiva
    IF total > 25 indicadores → REVIEW — priorizar e simplificar
    TERMINATION: Organização se recusa a medir além do financeiro
```

## Application

**Input:** Lista de indicadores atuais da organização, relatórios de performance, mapa estratégico (se existir)
**Process:** Classificar cada indicador por perspectiva. Avaliar cobertura. Verificar relações causa-efeito. Identificar gaps.
**Output:** Diagnóstico de saúde do scorecard com recomendações por perspectiva

## Decision Tree

```text
STEP 1: CLASSIFICAR indicadores existentes por perspectiva

IF (Todas as 4 perspectivas têm indicadores)
  THEN AVALIAR balanceamento e qualidade
ELSE IF (1-3 perspectivas cobertas)
  THEN ALERTAR — "Perspectivas ausentes: [lista]. Sua estratégia tem pontos cegos."
ELSE IF (Apenas financeiro)
  THEN VETO — "Métricas financeiras sozinhas contam apenas metade da história."

STEP 2: AVALIAR qualidade por perspectiva

IF (3-7 indicadores por perspectiva com mix leading/lagging)
  THEN APPROVE — "Cobertura adequada."
ELSE IF (Perspectiva com apenas indicadores lagging)
  THEN REVIEW — "Sem indicadores leading, você só saberá que falhou depois."
ELSE IF (Perspectiva com > 7 indicadores)
  THEN REVIEW — "Excesso de indicadores dilui o foco. Quais são realmente estratégicos?"

STEP 3: VERIFICAR relações causa-efeito

IF (Cada indicador tem pelo menos 1 conexão explícita com outra perspectiva)
  THEN APPROVE — "Cadeia causa-efeito íntegra."
ELSE IF (Indicadores isolados sem conexão)
  THEN REVIEW — "Um indicador sem causa-efeito é um dado solto, não gestão."

STEP 4: VERIFICAR cascateamento

IF (Scorecard desdobrado para unidades/departamentos)
  THEN APPROVE — "Alinhamento organizacional presente."
ELSE IF (Apenas scorecard corporativo existe)
  THEN REVIEW — "Sem cascateamento, a estratégia morre no nível executivo."

TERMINATION: Organização trata o BSC como relatório mensal sem ação
FALLBACK: Se organização não tem scorecard, iniciar com mapa estratégico
```

## Checklist de Avaliação por Perspectiva

### Financeira
| Critério | Status | Peso |
|----------|--------|------|
| Indicadores de crescimento de receita | | 0.7 |
| Indicadores de produtividade/custo | | 0.7 |
| Mix de leading e lagging | | 0.8 |
| Metas definidas com horizonte temporal | | 0.9 |

### Clientes
| Critério | Status | Peso |
|----------|--------|------|
| Proposição de valor clara e diferenciada | | 0.95 |
| Indicadores de satisfação/lealdade | | 0.85 |
| Indicadores de aquisição/retenção | | 0.85 |
| Segmentação de clientes definida | | 0.8 |

### Processos Internos
| Critério | Status | Peso |
|----------|--------|------|
| Processos críticos identificados e medidos | | 0.9 |
| Processos de inovação incluídos | | 0.85 |
| Conexão explícita com proposição de valor ao cliente | | 0.95 |
| Indicadores de qualidade e tempo de ciclo | | 0.8 |

### Aprendizado e Crescimento
| Critério | Status | Peso |
|----------|--------|------|
| Capital humano — competências mapeadas | | 0.9 |
| Capital informacional — sistemas avaliados | | 0.85 |
| Capital organizacional — cultura e liderança | | 0.9 |
| Investimento em desenvolvimento mensurado | | 0.8 |

## Examples

### APPROVE: Scorecard Bem Balanceado

- **Financeiro:** Crescimento receita 12% a.a., margem EBITDA, ROI por linha de produto
- **Cliente:** NPS > 70, retenção > 85%, tempo de resolução < 24h
- **Processos:** Cycle time < 48h, taxa de defeitos < 2%, 3 projetos no pipeline
- **Aprendizado:** 40h treinamento/ano, 95% sistemas integrados, score de engajamento > 80
- **Kaplan & Norton dizem:** "Este é um scorecard que conta uma história coerente."

### VETO: Apenas Financeiro

- **Indicadores:** Receita, lucro, EBITDA, margem, ROI
- **Problema:** Zero indicadores de cliente, processo ou aprendizado
- **Kaplan & Norton dizem:** "Você está pilotando com um único instrumento. Em condições adversas, esse avião cai."

### REVIEW: Excesso de Indicadores

- **Indicadores:** 47 KPIs distribuídos em 4 perspectivas
- **Problema:** Impossível gerenciar — tudo é prioridade, nada é prioridade
- **Kaplan & Norton dizem:** "Um scorecard com 47 indicadores é um relatório, não um sistema de gestão. Reduza para os 20-25 mais estratégicos."

## Core Quotes

- "O que você mede é o que você obtém."
- "Métricas financeiras são o retrovisor — mostram onde você esteve, não para onde vai."
- "Nenhum piloto confia em um único instrumento. Por que um CEO confiaria?"
- "A perspectiva de aprendizado e crescimento é a fundação. Ignore-a e todo o resto desmorona."

---

**Pattern Compliance:** KN-DIAG-001 (Avaliação de Saúde Organizacional)
**Source:** KN Mind DNA — Balanced Scorecard Framework
