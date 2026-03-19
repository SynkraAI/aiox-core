# implement-5-horsemen

## Metadata
```yaml
task_id: HZ_RET_002
agent: hormozi-retention
type: implementation
complexity: high
estimated_time: 2-3 hours
source: "$100M Retention Playbook - The 5 Horsemen of Retention"
```

## Purpose

Implementar os 5 Horsemen of Retention - as 5 táticas descobertas em academias com menos de 3% de churn mensal que, combinadas, podem reduzir churn de 10% para 3% em 90 dias.

> "Month 1: churn UP by 50% (shaking the tree). Month 2: DOWN by 50%. Month 3: DOWN by another 50%. Typical trajectory: 10% → 15% → 7% → 3%." — Alex Hormozi

---

## Input Required

```yaml
five_horsemen_input:
  business_type: "" # gym | saas | membership | coaching | other
  current_churn_rate: 0
  total_active_customers: 0
  team_capacity:
    can_do_calls: true | false
    can_write_cards: true | false
    can_host_events: true | false
  current_tracking:
    has_attendance_system: true | false
    has_engagement_metrics: true | false
```

---

## Overview: The 5 Horsemen

| # | Horseman | Tipo | Executor | Impacto |
|---|----------|------|----------|---------|
| 1 | Track Attendance | Análise + Predição | Hybrid | Detecta churn 2-4 semanas antes |
| 2 | Reach Out 2x/Week | Execução + Relacionamento | Human | Mantém conexão ativa |
| 3 | Handwritten Cards | Execução | Human | Cria conexão emocional |
| 4 | Member Events | Execução + Comunidade | Hybrid | Reduz churn + gera referrals |
| 5 | Exit Interviews | Julgamento + Negociação | Human | Salva 50% dos cancelamentos |

---

## Horseman 1: Track Attendance

### Padrão de Churn (DETECTAR)
```
Semana 1: 3 sessões
Semana 2: 2 sessões  ← ALERTA
Semana 3: 2 sessões
Semana 4: 1 sessão
Semana 5: CANCELAMENTO
```

### Padrão de Resgate (INTERVIR)
```
Semana 1: 3 sessões
Semana 2: 2 sessões  ← REACH OUT IMEDIATO
Semana 3: 3 sessões  ✓ Recuperado
Semana 4: 3 sessões
```

### Regra de Ouro
```
SE frequência cai para 2x/semana (ou equivalente)
ENTÃO intervir IMEDIATAMENTE

Não espere mais uma semana "para ver".
```

### Implementation
```yaml
attendance_tracking:
  metric: "" # logins, visits, usage, sessions
  baseline: "" # O que é "normal" para seu negócio
  alert_threshold: "" # Quando dispara alerta (ex: -33% da baseline)

  automation:
    trigger: "engagement < threshold"
    action: "notify_team + add_to_outreach_queue"
    owner: "" # Quem recebe o alerta
```

---

## Horseman 2: Reach Out 2x Per Week

### O Que Fazer
1. **Elogiar** clientes sobre participação e progresso
2. **Resolver** pequenos problemas que eles têm
3. **Ambos** (ideal)

### Framework ACA
```
A = Acknowledge: O que você viu eles fazerem
C = Compliment: Algo genuíno sobre eles
A = Ask: Uma pergunta

Exemplo:
"Hey João, vi que você completou o módulo 3 (A).
Seu progresso está incrível, especialmente a implementação no projeto X (C).
Como está se sentindo sobre os próximos passos? (A)"
```

### Frequência
```
Mínimo: 2x por semana por cliente ativo
Máximo: Não existe (mais = melhor)
Tipo: Personalizado, NÃO automatizado genérico
```

### Implementation
```yaml
weekly_outreach:
  frequency: "2x_per_week"
  method: "personal_message" # text, email, in-app
  framework: "ACA"

  schedule:
    monday: "review_engagement_drop_list"
    tuesday: "outreach_batch_1"
    wednesday: "follow_up_no_response"
    thursday: "outreach_batch_2"
    friday: "celebrate_wins_publicly"
```

---

## Horseman 3: Handwritten Cards

### Quando Enviar
| Momento | Tipo de Cartão | Por que |
|---------|----------------|---------|
| Sign-up | Welcome | Primeira impressão memorável |
| 3 meses | Milestone | Momento de pedir referral |
| 6 meses | Milestone | Celebrar permanência |
| 12 meses | Anniversary | VIP recognition |
| Feriados | Holiday | Manter top of mind |
| Aniversário | Birthday | Conexão pessoal |
| Atingir meta | Achievement | Celebrar vitória |
| Precisar motivação | Encouragement | Salvar de churn |

### Regra
> "Nunca há um momento ruim para enviar um cartão escrito à mão."

### Implementation
```yaml
card_program:
  triggers:
    - event: "signup"
      template: "welcome"
      timing: "within_48h"
    - event: "milestone_3_months"
      template: "celebration"
      timing: "on_date"
    - event: "birthday"
      template: "birthday"
      timing: "on_date"
    - event: "goal_achieved"
      template: "achievement"
      timing: "within_24h"

  supplies_needed:
    - cards: "blank_quality_cards"
    - stamps: "postal_stamps"
    - pens: "quality_pens"
```

---

## Horseman 4: Member Events

### Framework de Cadência
```
A cada 21 dias: Eventos menores (happy hour, Q&A)
A cada 42 dias: Eventos médios (workshop, meetup)
A cada 63 dias: Eventos maiores (conferência, celebration)

REGRA: Manter regular PARA VOCÊ, aleatório PARA ELES
```

### Benefício Duplo
```
1. REDUZ CHURN: Cria conexões entre membros
   "It's easy to quit a membership, it's hard to leave a relationship."

2. GERA REFERRALS: Convites escritos à mão para +1
   Cada evento = oportunidade de trazer amigo
```

### Tipos de Eventos
| Tipo | Frequência | Exemplo |
|------|------------|---------|
| Casual | Semanal | Coffee chat, office hours |
| Learning | Quinzenal | Workshop, masterclass |
| Social | Mensal | Happy hour, celebration |
| Milestone | Trimestral | Awards, recognition |

### Implementation
```yaml
events_calendar:
  cadence_21_days:
    type: "casual_small"
    format: "virtual_or_local"
    invite_method: "handwritten_note"

  cadence_42_days:
    type: "learning_medium"
    format: "workshop"
    guest_policy: "bring_a_friend"

  cadence_63_days:
    type: "milestone_large"
    format: "celebration_event"
    recognition: "public_achievements"
```

---

## Horseman 5: Exit Interviews

### Estatística Chave
> "Save about HALF the phone and email cancellations."

### Protocolo
1. **Estabelecer expectativa** de exit interview durante onboarding
2. **Usar aviso de cancelamento** como trigger para agendar
3. **Na ligação:**
   - Deixar desabafar completamente
   - Ficar mais indignado que eles
   - Perguntar: "Me dá a oportunidade de consertar?"
   - Revender valor de ficar
   - Mostrar o que perdem

### Script de Exit Interview
```
"Hey, sem pressão. Eu adoraria ouvir todas as razões pelas quais você me odeia.
Isso realmente me ajudaria para que no futuro eu possa evitar isso."

[Deixe desabafar]

"Isso é completamente ridículo. Você está 100% correto.
Me dá a oportunidade de consertar isso?"

[Se sim, ofereça uma das 3 opções]
```

### 3 Opções de Save
| Opção | Script | Quando Usar |
|-------|--------|-------------|
| REDO | "Deixa eu tentar de novo e vou consertar isso." | Falha de entrega |
| UPSELL | "Você deveria estar no programa maior. Culpa minha." | Precisam de mais ajuda |
| PAUSE | "Vamos pausar ao invés de cancelar." | Questões temporárias |

### Para Alto Volume
```
Adicionar vídeo de cancelamento que:
1. Relembra por que começaram
2. Revende o valor
3. Lembra o que arriscam perder (URLs, posts, acesso, pricing)
```

### Implementation
```yaml
exit_interview_system:
  trigger: "cancellation_request"

  flow:
    step_1: "schedule_call_within_48h"
    step_2: "send_reminder_24h"
    step_3: "conduct_interview"
    step_4: "offer_save_option"
    step_5: "document_feedback"

  save_options:
    - redo: "retry_delivery"
    - upsell: "upgrade_to_premium"
    - pause: "pause_membership"

  high_volume_alternative:
    type: "cancellation_video"
    elements:
      - "why_they_started"
      - "value_recap"
      - "what_they_lose"
```

---

## Timeline: O Que Esperar

### Mês 1: Churn SOBE 50%
```
Por que: "Shaking the tree"
- Pessoas que iam cancelar de qualquer forma
- Billing automático de clientes já inativos
- Limpeza natural do base

NÃO ENTRE EM PÂNICO. Isso é esperado.
```

### Mês 2: Churn DESCE 50%
```
Por que: Sistema começando a funcionar
- Exit interviews salvando 25%+
- Tracking detectando riscos cedo
- Outreach prevenindo desengajamento
```

### Mês 3: Churn DESCE mais 50%
```
Por que: Estabilização
- Comunidade se fortalecendo
- Cards criando conexão emocional
- Eventos gerando relacionamentos
```

### Trajetória Típica
```
10% → 15% → 7% → 3%
      ↑      ↑     ↑
   Mês 1  Mês 2  Mês 3
```

---

## Output: 5 Horsemen Implementation Plan

```yaml
five_horsemen_plan:
  timestamp: ""
  business: ""

  horseman_1_tracking:
    system: ""
    alert_threshold: ""
    response_protocol: ""
    owner: ""
    status: "not_started | in_progress | active"

  horseman_2_outreach:
    frequency: "2x_week"
    framework: "ACA"
    channels: []
    owner: ""
    status: ""

  horseman_3_cards:
    triggers: []
    supplies: "ordered | available"
    owner: ""
    status: ""

  horseman_4_events:
    calendar_created: true | false
    first_event_date: ""
    cadence: "21/42/63"
    owner: ""
    status: ""

  horseman_5_exits:
    process_documented: true | false
    save_options: ["redo", "upsell", "pause"]
    owner: ""
    status: ""

  expected_timeline:
    month_1: "churn_up_50_percent"
    month_2: "churn_down_50_percent"
    month_3: "churn_down_another_50_percent"
    target_churn: ""
```

---

## Quality Gate

```yaml
five_horsemen_quality:
  - [ ] Tracking system implementado ou planejado
  - [ ] Outreach 2x/week com framework ACA documentado
  - [ ] Card program com triggers definidos
  - [ ] Calendário de eventos criado (21/42/63 dias)
  - [ ] Exit interview script e processo documentados
  - [ ] Owner atribuído para cada horseman
  - [ ] Timeline de 90 dias aceita (expectativa de Mês 1 sobe)
  - [ ] Métricas de baseline capturadas para comparação
```

## Handoff

After completion:
- → `discover-activation-points.md` para identificar o que retém clientes
- → `design-onboarding-sequence.md` para direcionar ao activation point
- → `create-engagement-scoring.md` para tracking avançado

---
*Task: HZ_RET_002 | Agent: hormozi-retention | Version: 1.0*
*Source: $100M Retention Playbook - The 5 Horsemen of Retention*



<\!-- Criado com Squad Creator do AIOSPRO por @oalanicolas e @pedrovalerio | 2026-02-10 -->
