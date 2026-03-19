# design-customer-journey

## Metadata
```yaml
task_id: HZ_RET_006
agent: hormozi-retention
type: strategy
complexity: medium
estimated_time: 1-2 hours
source: "$100M Retention Playbook - Step 9 Churn Checklist"
```

## Purpose

Mapear a jornada do cliente em 4 milestones estratégicos: Activate → Testimonial → Refer → Ascend, criando um caminho claro de valor crescente que maximiza retenção e lifetime value.

> "Customers have an itch to buy more things over time. They will buy from you or the guy down the street. If someone just bought another thing from you, they are the LEAST likely to churn." — Alex Hormozi

---

## Input Required

```yaml
customer_journey_input:
  business_type: "" # saas | membership | coaching | service | product

  activation_point:
    description: "" # From discover-activation-points.md
    avg_time_to_achieve: ""

  current_offerings:
    core_offer: ""
    upsells_available: []
    referral_program: true | false

  customer_data:
    avg_tenure: ""
    avg_purchases: ""
    referral_rate: ""
```

---

## The 4 Milestones

### Overview
```
┌─────────┐    ┌─────────────┐    ┌───────┐    ┌────────┐
│ACTIVATE │ →  │ TESTIMONIAL │ →  │ REFER │ →  │ ASCEND │
└─────────┘    └─────────────┘    └───────┘    └────────┘
     ↓               ↓               ↓            ↓
  Valor            Prova         Crescimento   Receita
  Percebido       Social          Orgânico     Máxima
```

### Regra de Ouro
> "Incentivar cada milestone com unlockables."

---

## Milestone 1: ACTIVATE

### Objetivo
```
Direcionar ao activation point o mais rápido possível.
```

### O Que É Activation
```
O momento em que o cliente:
- Percebe o valor real do produto
- Tem uma primeira vitória tangível
- Se compromete emocionalmente

APÓS este ponto, probabilidade de churn CAI dramaticamente.
```

### Actions
```yaml
activate_milestone:
  definition:
    metric: "" # Ex: primeiro login, primeira venda, primeiro resultado
    target: "" # Valor específico
    timeline: "" # Ex: primeiros 30 dias

  tactics:
    - onboarding_focused: "100% direcionado ao activation"
    - quick_wins: "Vitórias pequenas no caminho"
    - friction_removal: "Eliminar obstáculos"
    - celebration: "Reconhecer quando atinge"

  incentive:
    type: "" # Unlock, bonus, badge, access
    description: ""
    unlocks_at: "activation_achieved"
```

---

## Milestone 2: TESTIMONIAL

### Objetivo
```
Capturar história de sucesso no momento de máxima satisfação.
```

### Por Que Este Momento
```
Cliente ACABOU de atingir activation point:
- Satisfação no pico
- Gratidão presente
- Emoções frescas
- Mais provável de dizer sim

ESPERAR = perder o momento.
```

### Actions
```yaml
testimonial_milestone:
  timing: "Imediatamente após activation point"

  capture_methods:
    - video: "1-2 minutos, perguntas guiadas"
    - written: "Template com prompts"
    - screenshot: "Resultados + comentário"
    - audio: "Para os que não querem video"

  questions:
    - "Onde você estava antes?"
    - "O que mudou?"
    - "Qual foi o momento decisivo?"
    - "O que você diria para alguém considerando?"

  incentive:
    type: ""
    description: ""
    unlocks_at: "testimonial_submitted"
```

### Template de Pedido
```
"[Nome], você acabou de [conquista]. Isso é incrível!

Posso te pedir um favor rápido?
Seu sucesso pode inspirar outras pessoas na mesma situação.

Você gravaria um vídeo de 60 segundos contando:
1. Onde você estava
2. O que mudou
3. Uma dica para quem está começando

Em troca, você desbloqueia [incentivo]."
```

---

## Milestone 3: REFER

### Objetivo
```
Pedir referrals no momento de satisfação máxima.
```

### Timing Ideal
```
LOGO APÓS testimonial:
- Acabaram de verbalizar sucesso
- Estão em estado emocional positivo
- Prova social fresca na mente
- Querem compartilhar naturalmente
```

### Actions
```yaml
refer_milestone:
  timing: "Logo após testimonial ou grande resultado"

  request_script: |
    "Você conhece alguém que está passando pelo mesmo que você passou?
    Que poderia se beneficiar da mesma forma?

    Adoraria ajudá-los também."

  facilitation:
    - provide_template: "Mensagem pronta para enviar"
    - remove_friction: "Link/código fácil de compartilhar"
    - track_referrals: "Sistema de atribuição"

  incentive:
    for_referrer: ""
    for_referred: ""
    unlocks_at: "first_successful_referral"
```

### Double-Sided Incentive
```
PARA QUEM INDICA:
- Desconto/crédito
- Acesso exclusivo
- Status/badge
- Dinheiro/comissão

PARA QUEM É INDICADO:
- Desconto first-purchase
- Bônus de boas-vindas
- Acesso trial estendido
```

---

## Milestone 4: ASCEND

### Objetivo
```
Vender a próxima coisa no momento certo.
```

### Insight Crítico
```
"Se alguém acabou de comprar outra coisa de você,
são os MENOS prováveis de fazer churn."

A compra adicional RENOVA o compromisso.
```

### Timing
```
QUANDO ascender:
1. Após cada milestone atingido
2. Quando engagement está alto
3. Quando expressam novas necessidades
4. Em "natural buying moments"

NUNCA ascender:
1. Quando estão frustrados
2. Antes de atingir valor na compra atual
3. Durante problemas não resolvidos
```

### Actions
```yaml
ascend_milestone:
  trigger_events:
    - "Activation point atingido"
    - "3 meses de tenure"
    - "Resultados significativos"
    - "Expressou nova necessidade"

  ascension_offers:
    - name: ""
      price: ""
      value_add: ""
      target_segment: ""

  positioning: "Próximo passo natural, não venda forçada"

  incentive:
    type: ""
    description: ""
    unlocks_at: "ascension_purchase"
```

---

## Journey Map Template

### Timeline View
```
Semana 0-4: ACTIVATE
├─ Onboarding focado
├─ Direcionamento ao activation point
├─ Quick wins
└─ Celebração ao atingir

Semana 4-8: TESTIMONIAL
├─ Pedido de testimonial
├─ Captura de história
├─ Incentivo por participação
└─ Uso do conteúdo

Semana 8-12: REFER
├─ Pedido de referrals
├─ Facilitação do processo
├─ Incentivos double-sided
└─ Follow-up de referrals

Mês 3+: ASCEND
├─ Identificação de necessidades
├─ Apresentação de próximo passo
├─ Incentivo por ascensão
└─ Novo ciclo inicia
```

---

## Unlockables System

### Por Milestone
| Milestone | Unlock Sugerido | Valor Percebido |
|-----------|-----------------|-----------------|
| Activate | Módulo avançado | Acesso a mais valor |
| Testimonial | Badge/certificado | Status público |
| Refer | Desconto/crédito | Benefício financeiro |
| Ascend | Acesso VIP | Exclusividade |

### Implementation
```yaml
unlockables_system:
  milestone_activate:
    unlock: ""
    delivery: "automatic | manual"
    notification: ""

  milestone_testimonial:
    unlock: ""
    delivery: ""
    notification: ""

  milestone_refer:
    unlock: ""
    delivery: ""
    notification: ""

  milestone_ascend:
    unlock: ""
    delivery: ""
    notification: ""
```

---

## Output: Customer Journey Map

```yaml
customer_journey_map:
  timestamp: ""
  business: ""

  milestone_1_activate:
    definition: ""
    metric: ""
    target_timeline: ""
    tactics: []
    unlock: ""
    success_criteria: ""

  milestone_2_testimonial:
    timing: ""
    capture_method: ""
    questions: []
    unlock: ""
    template_script: ""

  milestone_3_refer:
    timing: ""
    request_script: ""
    incentive_referrer: ""
    incentive_referred: ""
    unlock: ""
    tracking_method: ""

  milestone_4_ascend:
    trigger_events: []
    offers_available: []
    positioning: ""
    unlock: ""
    success_criteria: ""

  journey_timeline:
    activate_by: ""
    testimonial_by: ""
    refer_by: ""
    ascend_from: ""
```

---

## Quality Gate

```yaml
journey_quality:
  - [ ] Activation point claramente definido
  - [ ] Testimonial timing vinculado ao activation
  - [ ] Referral request posicionado após satisfação
  - [ ] Ascension offers definidas
  - [ ] Unlockables para cada milestone
  - [ ] Timeline realista e atingível
  - [ ] Scripts/templates documentados
  - [ ] Métricas de sucesso por milestone
```

## Handoff

After completion:
- → `create-engagement-scoring.md` para trackear progresso na jornada
- → `design-onboarding-sequence.md` se onboarding precisa ajuste
- → `create-upsell-sequence.md` para definir ofertas de ascensão

---
*Task: HZ_RET_006 | Agent: hormozi-retention | Version: 1.0*
*Source: $100M Retention Playbook - Step 9 Churn Checklist*



<\!-- Criado com Squad Creator do AIOSPRO por @oalanicolas e @pedrovalerio | 2026-02-10 -->
