# create-engagement-scoring

## Metadata
```yaml
task_id: HZ_RET_007
agent: hormozi-retention
type: setup
complexity: medium
estimated_time: 1-2 hours
source: "$100M Retention Playbook - Seção 10"
```

## Purpose

Criar um sistema de engagement scoring de 5 níveis que identifica risco de churn ANTES de acontecer, permitindo intervenção proativa e tratamento diferenciado por segmento.

> "Usage churn precedes billing churn. The customer stops using BEFORE they stop paying. Intercept when they stop using, not when they cancel." — Alex Hormozi

---

## Input Required

```yaml
engagement_scoring_input:
  business_type: "" # saas | membership | coaching | service

  available_metrics:
    has_login_data: true | false
    has_usage_data: true | false
    has_feature_adoption: true | false
    has_content_consumption: true | false
    has_community_activity: true | false
    has_support_tickets: true | false

  activation_point:
    description: ""
    metric: ""
```

---

## The 5 Engagement Levels

### Overview
```
┌─────────────────────────────────────────────────────────┐
│ Level 4: CHAMPION │ Refere, advoga, micro-celebridade   │
├─────────────────────────────────────────────────────────┤
│ Level 3: ENGAGED  │ No activation point, ativo          │
├─────────────────────────────────────────────────────────┤
│ Level 2: ACTIVE   │ Regular mas não no activation       │
├─────────────────────────────────────────────────────────┤
│ Level 1: PASSIVE  │ Atividade mínima, tendência queda   │
├─────────────────────────────────────────────────────────┤
│ Level 0: GHOST    │ Sem atividade 30+ dias              │
└─────────────────────────────────────────────────────────┘
```

### Level Details

| Nível | Nome | Definição | Risco | Ação |
|-------|------|-----------|-------|------|
| 0 | GHOST | Sem atividade 30+ dias | Extremamente alto | Reativação imediata |
| 1 | PASSIVE | Atividade mínima, queda | Alto | Outreach pessoal, incentivo |
| 2 | ACTIVE | Regular, não no activation | Moderado | Guiar ao activation |
| 3 | ENGAGED | No/acima activation | Baixo | Manter, testimonial, referral |
| 4 | CHAMPION | Ativo + refere outros | Muito baixo | Elevar, VIP |

---

## Level 0: GHOST

### Definição
```
Sem atividade detectável nos últimos 30+ dias.
Ainda pagando (ou prestes a parar).
```

### Red Flags
```
- Zero logins/visitas
- Zero uso de features
- Zero consumo de conteúdo
- Zero interação com comunidade
```

### Ação Imediata
```yaml
ghost_protocol:
  priority: "CRÍTICO"

  sequence:
    day_0:
      action: "Email/SMS pessoal"
      content: "Hey [nome], notei que você não apareceu. Tudo bem?"

    day_3:
      action: "Ligação"
      content: "Check-in pessoal, oferecer ajuda"

    day_7:
      action: "Oferta especial"
      content: "Incentivo para voltar: sessão 1-on-1, bonus, etc."

    day_14:
      action: "Last chance"
      content: "O que precisa mudar para funcionar?"

  escalation: "Se não responde em 21 dias → marcar como alto risco de churn"
```

---

## Level 1: PASSIVE

### Definição
```
Atividade mínima presente.
Tendência de queda clara.
Engajamento abaixo do baseline.
```

### Red Flags
```
- Logins esporádicos
- Uso superficial
- Não completa ações
- Não responde a comunicações
```

### Ação
```yaml
passive_protocol:
  priority: "ALTO"

  approach:
    framework: "ACA (Acknowledge, Compliment, Ask)"

    example:
      acknowledge: "Vi que você entrou na plataforma semana passada"
      compliment: "Sua abordagem em [X] foi interessante"
      ask: "O que está te travando de ir mais fundo?"

  tactics:
    - personal_outreach: "Mensagem individual, não automática"
    - friction_discovery: "Identificar o que está impedindo"
    - incentive: "Oferecer razão para re-engajar"
    - simplify: "Reduzir overwhelm se necessário"
```

---

## Level 2: ACTIVE

### Definição
```
Atividade regular presente.
Usa o produto/serviço.
MAS não atingiu activation point ainda.
```

### Status
```
Engajado o suficiente para não sair.
Não engajado o suficiente para ficar long-term.
```

### Ação
```yaml
active_protocol:
  priority: "MODERADO"

  approach:
    focus: "Guiar ao activation point"

    tactics:
      - clarify_activation: "Deixar claro o que precisa atingir"
      - remove_obstacles: "Identificar e remover fricções"
      - progress_tracking: "Mostrar quanto falta"
      - quick_wins: "Celebrar progressos intermediários"

  content:
    show: "Cases de quem atingiu"
    connect: "Com membros que já chegaram lá"
    encourage: "Próximo passo específico"
```

---

## Level 3: ENGAGED

### Definição
```
No activation point ou acima.
Uso consistente e saudável.
Percebeu valor real.
```

### Status
```
Baixo risco de churn.
Alto potencial para referrals e testimonials.
Candidato a upsell.
```

### Ação
```yaml
engaged_protocol:
  priority: "MANTER + EXPANDIR"

  approach:
    maintain: "Não quebrar o que funciona"

    tactics:
      - testimonial_request: "Capturar história de sucesso"
      - referral_request: "Pedir indicações"
      - upsell_present: "Apresentar próximo nível"
      - recognition: "Celebrar publicamente"

  timing:
    testimonial: "Logo após atingir activation"
    referral: "Logo após testimonial"
    upsell: "Quando expressar nova necessidade"
```

---

## Level 4: CHAMPION

### Definição
```
Acima do activation point.
Refere outros ativamente.
Advoga pela marca.
Engajamento exemplar.
```

### Status
```
Risco mínimo de churn.
Máximo valor para o negócio.
Modelo para outros clientes.
```

### Ação
```yaml
champion_protocol:
  priority: "ELEVAR"

  approach:
    elevate: "Tratar como micro-celebridade"

    tactics:
      - vip_access: "Convites para grupos exclusivos"
      - early_access: "Primeiro a ver novidades"
      - co_creation: "Envolver em desenvolvimento"
      - public_recognition: "Destaque em comunidade"
      - ambassador_program: "Formalizar papel"

  benefits:
    - "Acesso ao founder/leadership"
    - "Input em roadmap de produto"
    - "Convites para eventos especiais"
    - "Compensação por referrals"
```

---

## Metrics Framework

### Tier 1: Survival (Track Weekly)
```yaml
survival_metrics:
  - metric: "Churn rate mensal"
    segment_by: "cohort"
    alert_if: "> 10%"

  - metric: "Revenue churn rate"
    description: "Dollar-weighted"
    alert_if: "> revenue + expansion"

  - metric: "LTV (rolling 90 dias)"
    compare_to: "baseline"

  - metric: "LTV:CAC ratio"
    alert_if: "< 3:1"
```

### Tier 2: Engagement (Track Daily/Weekly)
```yaml
engagement_metrics:
  - metric: "Frequência de login/visita"
    baseline: ""
    alert_if: "< 50% baseline"

  - metric: "Profundidade de uso"
    measure: "Features utilizadas"

  - metric: "Taxa de consumo de conteúdo"
    measure: "% do disponível consumido"

  - metric: "Participação em comunidade"
    measure: "Posts, comentários, reações"

  - metric: "Tickets de suporte"
    track: "Volume + sentiment"

  - metric: "NPS score"
    frequency: "trimestral"
```

### Tier 3: Predictive (Build Over Time)
```yaml
predictive_metrics:
  - metric: "Tempo desde último login/compra"
    alert_if: "> 14 dias"

  - metric: "Tendência do engagement score"
    track: "Subindo, estável, caindo"

  - metric: "Taxa de falha de pagamento"
    track: "Involuntary churn signal"

  - metric: "Taxa de resposta a outreach"
    low_response: "Sinal de desengajamento"

  - metric: "% conclusão do activation point"
    track: "Progress to activation"
```

---

## Scoring Algorithm

### Simple Version
```yaml
engagement_score_simple:
  factors:
    login_frequency:
      weight: 25
      scoring:
        daily: 25
        weekly: 15
        monthly: 5
        none_30_days: 0

    activation_status:
      weight: 30
      scoring:
        achieved: 30
        in_progress: 15
        not_started: 0

    feature_depth:
      weight: 20
      scoring:
        power_user: 20
        regular: 12
        minimal: 5
        none: 0

    community_activity:
      weight: 15
      scoring:
        contributor: 15
        participant: 10
        lurker: 5
        inactive: 0

    referral_behavior:
      weight: 10
      scoring:
        active_referrer: 10
        has_referred: 5
        none: 0

  levels:
    0_ghost: "score < 10"
    1_passive: "score 10-30"
    2_active: "score 31-50"
    3_engaged: "score 51-75"
    4_champion: "score > 75"
```

---

## Output: Engagement Scoring System

```yaml
engagement_scoring_system:
  timestamp: ""
  business: ""

  level_definitions:
    ghost:
      criteria: ""
      threshold: ""
    passive:
      criteria: ""
      threshold: ""
    active:
      criteria: ""
      threshold: ""
    engaged:
      criteria: ""
      threshold: ""
    champion:
      criteria: ""
      threshold: ""

  metrics_tracked:
    tier_1_survival: []
    tier_2_engagement: []
    tier_3_predictive: []

  scoring_algorithm:
    factors: []
    weights: {}
    thresholds: {}

  action_protocols:
    ghost: ""
    passive: ""
    active: ""
    engaged: ""
    champion: ""

  implementation:
    data_source: ""
    update_frequency: ""
    dashboard_location: ""
    alert_recipients: []
```

---

## Quality Gate

```yaml
engagement_scoring_quality:
  - [ ] 5 níveis claramente definidos
  - [ ] Critérios objetivos para cada nível
  - [ ] Métricas em 3 tiers (survival, engagement, predictive)
  - [ ] Protocolo de ação para cada nível
  - [ ] Activation point integrado no scoring
  - [ ] Alertas definidos para risco
  - [ ] Dashboard/visualização planejada
  - [ ] Owner de cada protocolo atribuído
```

## Handoff

After completion:
- → `implement-5-horsemen.md` para táticas de intervenção
- → `design-customer-journey.md` para alinhar com milestones
- → `diagnose-churn-rate.md` para métricas baseline

---
*Task: HZ_RET_007 | Agent: hormozi-retention | Version: 1.0*
*Source: $100M Retention Playbook - Seção 10*



<\!-- Criado com Squad Creator do AIOSPRO por @oalanicolas e @pedrovalerio | 2026-02-10 -->
