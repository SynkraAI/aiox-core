# Task: Strategic Review

**Task ID:** strategic-review
**Version:** 1.0
**Purpose:** Review periódico dos negócios do usuário, aplicando os frameworks de todos os advisors para identificar riscos, oportunidades e próximos movimentos
**Executor:** Agent (board-chief orquestra, todos os advisors contribuem)
**Execution Type:** Hybrid (Agent prepara, Human valida)
**Estimated Time:** 45-90min

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| business_context | string | Yes | Estado atual do negócio (receita, equipe, produto, mercado) |
| period | enum | Yes | `monthly` / `quarterly` / `annual` |
| focus_areas | list | No | Áreas específicas para focar (default: all) |
| previous_review | path | No | Link para review anterior (para tracking) |

## Preconditions

- [ ] board-chief ativo
- [ ] Contexto do negócio fornecido com números reais
- [ ] Perfil ENTP acessível

---

## Steps

### Step 1: SITUATIONAL ANALYSIS (board-chief)

```yaml
situation:
  gather:
    - Revenue e growth rate
    - Team size e key hires/departures
    - Product status (launched, beta, building)
    - Market dynamics (competitors, regulation)
    - Cash position e runway
    - Key wins e key losses desde último review

  classify_stage:
    pre_pmf: "Buscando Product-Market Fit"
    growth: "Crescendo, buscando escala"
    scale: "Escalando operações"
    maturity: "Otimizando e defendendo posição"
```

### Step 2: MULTI-LENS ANALYSIS (each advisor contributes)

```yaml
analysis_lenses:

  strategy_lens:
    helmer:
      question: "Qual Power o negócio tem? Está construindo algum?"
      output: "Power Map + gaps"
    harnish:
      question: "People, Strategy, Execution, Cash: qual área está mais fraca?"
      output: "Scaling Up Scorecard"
    christensen:
      question: "Há sinais de disruption no mercado? De onde?"
      output: "Disruption Radar"
    musk:
      question: "Quais processos podem ser eliminados ou simplificados?"
      output: "Algorithm Audit"

  execution_lens:
    hormozi:
      question: "O offer é irresistível? O LTV:CAC está saudável?"
      output: "Offer Audit + Value Equation"
    cunningham:
      question: "Quais decisões estão sendo evitadas? Onde está o elefante na sala?"
      output: "Thinking Time Questions"
    voss:
      question: "Há negociações pendentes? Stakeholders desalinhados?"
      output: "Stakeholder Map + estratégia de negociação"

  thinking_lens:
    duke:
      question: "Quais decisões recentes tiveram resulting? Quais foram boas decisões com bad outcomes?"
      output: "Decision Quality Audit"
    taleb:
      question: "O negócio é frágil, robusto ou antifrágil? Onde estão os tail risks?"
      output: "Fragility Map + Barbell Check"
    parrish:
      question: "Quais modelos mentais estão faltando na análise? Onde há second-order effects ignorados?"
      output: "Mental Model Gap Analysis"
    naval:
      question: "Onde está o leverage? O que está gerando renda sem tempo?"
      output: "Leverage Audit"

  vision_lens:
    jobs:
      question: "O produto tem alma? A experiência é simples e elegante?"
      output: "Product Simplicity Score"
    disney:
      question: "Qual é a visão de longo prazo? O que o negócio seria se fosse 10x melhor?"
      output: "Dream Session"
```

### Step 3: CROSS-REFERENCE (board-chief)

```yaml
cross_reference:
  actions:
    - Identificar temas recorrentes entre advisors
    - Mapear contradições entre perspectivas
    - Priorizar por impacto x urgência
    - Calibrar para perfil ENTP

  output_structure:
    critical_findings: "Top 3 coisas que precisam de atenção AGORA"
    opportunities: "Top 3 oportunidades identificadas"
    risks: "Top 3 riscos que estão sendo ignorados"
    entp_calibration: "O que seu ENTP está te cegando para"
```

### Step 4: ACTION PLAN (board-chief)

```yaml
action_plan:
  structure:
    this_week:
      - "1-2 ações imediatas de alto impacto"
    this_month:
      - "3-5 iniciativas para o mês"
    this_quarter:
      - "1-2 movimentos estratégicos"

  tracking:
    - Cada ação tem owner (quem faz)
    - Cada ação tem deadline
    - Cada ação tem metric de sucesso
    - Review de tracking no próximo strategic review

  follow_up:
    - Agendar próximo review
    - Definir métricas para acompanhar
    - Identificar decisões que precisam de Decision Council
```

---

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| review_document | markdown | Documento completo do review |
| critical_findings | list | Top 3 achados críticos |
| action_plan | checklist | Ações com owners e deadlines |
| next_review_date | date | Data do próximo review |

---

## Acceptance Criteria

- [ ] Todas as 4 lentes (Strategy, Execution, Thinking, Vision) contribuíram
- [ ] Mínimo 8 advisors forneceram input
- [ ] Critical findings são específicos (não genéricos)
- [ ] Action plan tem owners, deadlines e métricas
- [ ] Calibração ENTP presente
- [ ] Contradições entre advisors identificadas e explicadas
- [ ] Próximo review agendado

## Veto Conditions

- Review sem números reais do negócio → BLOQUEAR (pedir dados)
- Menos de 8 advisors contribuíram → ESCALAR (convocar faltantes)
- Action plan sem deadlines → BLOQUEAR até adicionar
- Critical findings genéricos ("melhorar marketing") → REJEITAR, ser específico
