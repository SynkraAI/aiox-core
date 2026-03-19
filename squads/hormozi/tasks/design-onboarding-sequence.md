# design-onboarding-sequence

## Metadata
```yaml
task_id: HZ_RET_004
agent: hormozi-retention
type: design
complexity: high
estimated_time: 2-3 hours
source: "$100M Retention Playbook - Step 2 Churn Checklist"
```

## Purpose

Desenhar uma sequência de onboarding de 30 dias que direciona clientes ao activation point, maximizando retenção através de engajamento progressivo e primeiras vitórias rápidas.

> "Custom outperforms generic. Personal outperforms group. Live outperforms recorded. Carrots outperform sticks. Some outperforms none. A portfolio company went from $2M/month to $2M/week after changing from group to 1-on-1 onboarding." — Alex Hormozi

---

## Input Required

```yaml
onboarding_design_input:
  business_type: "" # saas | membership | coaching | service | product

  activation_point:
    description: "" # From discover-activation-points.md
    target_metric: ""
    target_value: ""
    avg_time_to_achieve: ""

  current_state:
    has_onboarding: true | false
    current_format: "" # none | generic | custom | mixed
    current_delivery: "" # recorded | live | hybrid
    current_style: "" # group | personal | self-serve

  constraints:
    team_capacity: "" # high | medium | low
    can_do_live: true | false
    can_personalize: true | false
```

---

## Hierarchy of Effectiveness

### Do Mais Eficaz ao Menos Eficaz
```
1. Custom + Personal + Live     = Retenção MÁXIMA
2. Custom + Group + Live        = Ótima retenção, mais escalável
3. Custom + Personal + Recorded = Boa retenção
4. Custom + Group + Recorded    = Retenção decente
5. Generic + Group + Recorded   = Retenção básica
6. Generic + Self-Serve         = Retenção mínima
7. Sem onboarding               = Churn MÁXIMO
```

### Regras de Ouro
| Regra | Tradução | Impacto |
|-------|----------|---------|
| Custom > Generic | Personalizado vence padrão | 2-3x engagement |
| Personal > Group | 1-on-1 vence grupo | 25%+ ascensions |
| Live > Recorded | Ao vivo vence gravado | 3x completion |
| Carrots > Sticks | Incentivos vencem punições | Melhor experiência |
| Some > None | Qualquer coisa vence nada | Baseline de retention |

---

## 30-Day Onboarding Checklist

### Dia 0: Welcome & Setup
```yaml
day_0:
  objective: "Criar momentum e setar expectativas"

  actions:
    - welcome_message:
        type: "personal" # video call, personalized video, personal message
        content:
          - "Parabéns pela decisão"
          - "O que esperar nos próximos 30 dias"
          - "Primeiro passo imediato"

    - roadmap_delivery:
        format: "visual_timeline"
        milestones:
          - day_1_3: "Primeira vitória"
          - day_7: "Activation point progress"
          - day_14: "Checkpoint"
          - day_30: "Meta principal"

    - communication_cadence:
        set_expectation: "Como e quando vamos nos comunicar"
        channels: []
        frequency: ""

    - first_task:
        simple: true
        immediate: true
        completable_in: "15_minutes_or_less"
```

### Dias 1-3: Push to Activation
```yaml
days_1_3:
  objective: "Primeira vitória rápida + momentum"

  actions:
    - activation_push:
        focus: "Direcionar ao activation point IMEDIATAMENTE"
        remove_friction: true
        simplify_path: true

    - first_win:
        type: "quick_win"
        achievable_in: "24-48h"
        celebration: "public_or_private"

    - homework:
        deadline: "7_days"
        specific: true
        connected_to: "activation_point"

    - check_in:
        day_1: "Confirmar que começou"
        day_3: "Verificar progresso"
```

### Dias 3-7: First Check-In
```yaml
days_3_7:
  objective: "Resolver fricções e manter momentum"

  actions:
    - personal_check_in:
        format: "call_or_message"
        questions:
          - "Como está o progresso?"
          - "Alguma dificuldade?"
          - "O que posso ajudar?"

    - friction_removal:
        identify: "O que está impedindo progresso?"
        solve: "Resolver imediatamente"
        document: "Para melhorar processo"

    - progress_celebration:
        acknowledge: "O que já conquistou"
        encourage: "Próximos passos"
```

### Dias 7-14: Connection & Proof
```yaml
days_7_14:
  objective: "Conectar com sucesso de outros + segundo checkpoint"

  actions:
    - success_connection:
        type: "Connect com membros bem-sucedidos"
        format: "intro, group call, community thread"
        goal: "Ver que resultado é possível"

    - proof_sharing:
        show: "Cases de pessoas similares"
        timing: "Quando atingiram activation point"
        result: "O que conquistaram depois"

    - second_check_in:
        format: "call_or_message"
        evaluate: "% do caminho ao activation point"
        adjust: "Plano se necessário"
```

### Dias 14-21: Community Integration
```yaml
days_14_21:
  objective: "Criar relacionamentos = dificultar saída"

  actions:
    - community_events:
        introduce_to: "Próximos eventos"
        encourage: "Participação ativa"

    - meaningful_connections:
        goal: "2-3 conexões significativas"
        facilitate: "Introduções manuais se necessário"
        types:
          - "Alguém com objetivo similar"
          - "Alguém que já atingiu resultado"
          - "Potencial parceiro/colaborador"
```

### Dias 21-30: Review & Celebrate
```yaml
days_21_30:
  objective: "Fechar ciclo + capturar valor"

  actions:
    - progress_review:
        format: "structured_call"
        cover:
          - "Onde começou"
          - "Onde está agora"
          - "O que conquistou"

    - public_celebration:
        if: "Atingiu activation point ou progresso significativo"
        format: "community_post, shoutout, badge"

    - testimonial_request:
        timing: "Momento de satisfação máxima"
        format: "video, written, screenshot"

    - future_unlockables:
        present: "O que desbloqueia continuando"
        types:
          - "Próximos módulos/features"
          - "Níveis de acesso"
          - "Benefícios exclusivos"
```

---

## Paid Onboarding Option

### Conceito
```
Vender o onboarding como produto separado.
Resultado: 25%+ boost em ascensions para programa principal.
```

### Estrutura
```yaml
paid_onboarding:
  name: "Accelerator" | "Fast Start" | "VIP Setup"
  price: "" # Geralmente 1-3x mensalidade

  includes:
    - "Onboarding 1-on-1 ao invés de grupo"
    - "Acesso direto ao especialista"
    - "Setup feito para você"
    - "Primeira vitória garantida"

  positioning:
    for_who: "Quem quer resultado mais rápido"
    value: "Economiza X horas/dias"
```

---

## Incentivizing Activation

### Tipos de Incentivos
| Tipo | Exemplo | Quando Desbloqueia |
|------|---------|---------------------|
| Conteúdo | Módulos avançados | Após completar básico |
| Acesso | Calls com experts | Após atingir milestone |
| Status | Badges, certificados | Após completar ações |
| Benefícios | Descontos, bônus | Após tempo/resultado |
| Exclusivo | Lifetime access | Nível máximo atingido |

### Timing Estratégico
```
REGRA: Colocar incentivos logo APÓS os major churn points.

Se maioria sai no Mês 3 → Incentivo especial desbloqueia no Mês 4
Se churn pica na Semana 2 → Bônus por completar Semana 3
```

---

## Output: Onboarding Sequence Design

```yaml
onboarding_sequence:
  timestamp: ""
  business: ""

  activation_point_target:
    description: ""
    metric: ""
    target_achievement_rate: "" # % que deve atingir

  format_choices:
    customization: "custom | generic"
    delivery: "personal | group | self-serve"
    medium: "live | recorded | hybrid"
    effectiveness_tier: "" # 1-7

  day_0:
    welcome_format: ""
    roadmap_delivered: true | false
    first_task: ""

  days_1_3:
    activation_push_action: ""
    quick_win_defined: ""
    homework_assigned: ""

  days_3_7:
    check_in_format: ""
    friction_removal_process: ""

  days_7_14:
    success_connection_method: ""
    proof_sharing_assets: []

  days_14_21:
    events_introduced: []
    connections_facilitated: ""

  days_21_30:
    review_format: ""
    celebration_method: ""
    testimonial_capture: ""
    unlockables_presented: []

  incentive_structure:
    churn_point_identified: ""
    incentive_timing: ""
    incentive_type: ""

  paid_option:
    offered: true | false
    name: ""
    price: ""
```

---

## Quality Gate

```yaml
onboarding_quality:
  - [ ] Activation point claramente definido como objetivo
  - [ ] Formato escolhido baseado em hierarquia de eficácia
  - [ ] Dia 0 inclui welcome + roadmap + first task
  - [ ] Dias 1-3 direcionam ao activation point
  - [ ] Check-ins agendados (não deixados ao acaso)
  - [ ] Conexões com outros membros facilitadas
  - [ ] Celebração e testimonial capture no fim
  - [ ] Incentivos posicionados após churn points
```

## Handoff

After completion:
- → `create-engagement-scoring.md` para trackear progresso no onboarding
- → `design-customer-journey.md` para mapear jornada pós-onboarding
- → `implement-5-horsemen.md` se precisar de táticas de retention paralelas

---
*Task: HZ_RET_004 | Agent: hormozi-retention | Version: 1.0*
*Source: $100M Retention Playbook - Step 2 Churn Checklist*



<\!-- Criado com Squad Creator do AIOSPRO por @oalanicolas e @pedrovalerio | 2026-02-10 -->
