# create-exit-interview-system

## Metadata
```yaml
task_id: HZ_RET_005
agent: hormozi-retention
type: setup
complexity: medium
estimated_time: 1-2 hours
source: "$100M Retention Playbook - Steps 5+7 Churn Checklist"
```

## Purpose

Criar um sistema de exit interviews que salva aproximadamente 50% dos cancelamentos, transformando pedidos de cancelamento em oportunidades de retenção ou feedback valioso.

> "Save about HALF the phone and email cancellations. Half say 'F you' (great feedback). The other half you can save with redo OR upsell. Assuming half show up, cuts churn by 25% = 33% increase in LTV." — Alex Hormozi

---

## Input Required

```yaml
exit_interview_input:
  business_type: "" # saas | membership | coaching | service

  volume:
    monthly_cancellation_requests: 0
    current_save_rate: 0 # Se já tem processo

  capacity:
    can_do_calls: true | false
    staff_for_calls: 0
    average_call_duration: ""

  current_process:
    has_exit_interview: true | false
    has_cancellation_video: true | false
    has_save_offers: true | false
```

---

## Why Exit Interviews Work

### Estatísticas
```
50% dos que entram em call de cancelamento podem ser salvos.
Se 50% aparecem na call = 25% reduction in churn total.
25% menos churn = 33% aumento em LTV.
```

### Dois Outcomes Possíveis

| Outcome | % | Valor |
|---------|---|-------|
| "F you, estou saindo" | ~50% | Feedback valioso para melhorar |
| Salvável | ~50% | Receita retida |

---

## Protocol: Pré-Exit Interview

### Step 1: Estabelecer Expectativa no Onboarding
```
DURANTE ONBOARDING:
"Uma coisa importante: se em algum momento você pensar em sair,
por favor me dá uma ligação antes. Nem que seja para me dar feedback.
Pode fazer isso por mim?"

POR QUE: Remove surpresa, cria compromisso social, normaliza a conversa.
```

### Step 2: Trigger de Cancelamento
```yaml
cancellation_trigger:
  when_detected:
    - "Pedido de cancelamento via email"
    - "Click em 'cancelar' no sistema"
    - "Mensagem indicando intenção de sair"

  immediate_action:
    - "Não processar cancelamento imediatamente"
    - "Agendar call dentro de 48h"
    - "Enviar mensagem: 'Antes de finalizar, posso te ligar 5 minutos?'"
```

---

## The Exit Interview Call

### Script de Abertura
```
"Hey, sem pressão. Eu adoraria ouvir todas as razões
pelas quais você me odeia. Isso realmente me ajudaria
para que no futuro eu possa evitar isso."

[Pausa. Deixe falar.]
```

### Fase 1: Deixar Desabafar
```
REGRAS:
- NÃO interrompa
- NÃO defenda
- NÃO justifique
- APENAS escute

OBJETIVO: Validar emoções, criar espaço seguro, coletar informação real.
```

### Fase 2: Ficar Indignado (Com Eles, Não Contra Eles)
```
APÓS ouvir:
"Isso é completamente ridículo. Você está 100% correto.
Eu estou chateado que isso aconteceu."

POR QUE: Cria aliança, mostra que você se importa, baixa defesas.
```

### Fase 3: Pedir Oportunidade
```
"Me dá a oportunidade de consertar isso?"

[Espere resposta]

SE SIM: Ofereça uma das 3 opções de save
SE NÃO: Agradeça o feedback, processe cancelamento com dignidade
```

---

## 3 Opções de Save

### Option 1: REDO (Refazer)
```
QUANDO USAR: Falha de entrega, experiência ruim, expectativa não atendida

SCRIPT:
"Deixa eu tentar de novo e vou consertar isso.
Vou pessoalmente garantir que [problema específico] seja resolvido.
Pode me dar mais [X dias/semanas] para provar?"

AÇÃO:
- Resetar expectativas
- Atribuir responsável dedicado
- Check-in frequente
```

### Option 2: UPSELL (Upgrade)
```
QUANDO USAR: Cliente precisa de mais ajuda do que oferta atual oferece

SCRIPT:
"Sabe o que eu percebi? Você deveria ter sido vendido para o
[programa maior] desde o início. Isso é culpa minha.

Posso creditar tudo que você já pagou para o [programa superior]
onde você vai ter [benefícios adicionais]. Isso resolve?"

AÇÃO:
- Creditar pagamentos anteriores
- Upgrade imediato
- Suporte intensificado no início
```

### Option 3: PAUSE (Pausar)
```
QUANDO USAR: Questões temporárias (financeiras, timing, vida)

SCRIPT:
"E se ao invés de cancelar, a gente pausasse?
Você mantém seu lugar, seu progresso, seu pricing especial.
E quando fizer sentido, a gente retoma?"

AÇÃO:
- Pausar billing
- Manter acesso (opcional)
- Agendar check-in em 30-60 dias
```

---

## Resell Protocol

### Após Oferecer Save, Revender Valor
```
1. RELEMBRAR por que ficar ajuda a atingir objetivos
   "Lembra quando você entrou querendo [objetivo]?
   Você está a [X]% do caminho. Seria uma pena parar agora."

2. MOSTRAR o que perdem
   - URLs personalizadas
   - Posts/conteúdo criado
   - Progresso/badges/níveis
   - Acesso a comunidade
   - Pricing de founder (se aplicável)
   - Relacionamentos construídos
```

---

## High-Volume Alternative: Cancellation Video

### Para Negócios com Alto Volume
```
Quando não é viável fazer call com todos,
criar vídeo de cancelamento que:

1. RELEMBRA por que começaram
   "Quando você entrou, você queria [objetivo]..."

2. REVENDE o valor
   "Nos últimos [X meses], você conseguiu..."

3. LEMBRA o que arriscam perder
   "Se você sair agora, você perde acesso a..."

4. OFERECE alternativa
   "Antes de confirmar, considere [pause/downgrade]..."

5. CTA final
   "Se ainda quiser sair, clique aqui.
   Se quiser conversar, agende uma call."
```

### Implementação
```yaml
cancellation_video:
  trigger: "Click em cancelar"
  before: "Página de confirmação de cancelamento"

  structure:
    intro: "30 segundos - empatia"
    remind: "30 segundos - por que começou"
    value: "60 segundos - o que conquistou"
    lose: "30 segundos - o que perde"
    alternative: "30 segundos - pause/downgrade"
    cta: "15 segundos - próximo passo"

  total_length: "3-4 minutos max"
```

---

## Tracking & Documentation

### Métricas a Trackear
```yaml
exit_interview_metrics:
  volume:
    cancellation_requests: 0
    interviews_scheduled: 0
    interviews_completed: 0
    show_rate: 0

  outcomes:
    saved_redo: 0
    saved_upsell: 0
    saved_pause: 0
    total_saved: 0
    save_rate: 0

  feedback:
    top_3_reasons: []
    actionable_insights: []
```

### Feedback Documentation
```yaml
exit_feedback_log:
  date: ""
  customer: ""
  tenure: ""
  reason_given: ""
  real_reason: "" # Often different
  saved: true | false
  save_method: ""
  insights: ""
  action_items: []
```

---

## Output: Exit Interview System

```yaml
exit_interview_system:
  timestamp: ""
  business: ""

  pre_interview:
    onboarding_expectation_set: true | false
    script_for_onboarding: ""
    cancellation_trigger_defined: true | false

  interview_process:
    scheduling_method: ""
    target_timing: "within_48h"
    call_script: "documented | not_documented"
    team_trained: true | false

  save_options:
    redo:
      available: true | false
      criteria: ""
      script: ""
    upsell:
      available: true | false
      criteria: ""
      program_to_offer: ""
    pause:
      available: true | false
      max_duration: ""
      terms: ""

  high_volume_alternative:
    cancellation_video: true | false
    video_url: ""

  tracking:
    metrics_dashboard: true | false
    feedback_log: true | false
    review_cadence: ""

  expected_impact:
    current_churn: 0
    target_save_rate: "50%"
    expected_churn_reduction: "25%"
    ltv_increase: "33%"
```

---

## Quality Gate

```yaml
exit_interview_quality:
  - [ ] Expectativa de exit interview setada no onboarding
  - [ ] Trigger de cancelamento definido (não processa imediato)
  - [ ] Script de call documentado
  - [ ] 3 opções de save definidas (redo, upsell, pause)
  - [ ] Resell protocol inclui "o que perdem"
  - [ ] Para alto volume: cancellation video criado
  - [ ] Métricas de tracking definidas
  - [ ] Equipe treinada no processo
```

## Handoff

After completion:
- → `design-customer-journey.md` para mapear jornada completa
- → `create-engagement-scoring.md` para detectar risco ANTES do cancelamento
- → `implement-5-horsemen.md` se ainda não implementou prevenção

---
*Task: HZ_RET_005 | Agent: hormozi-retention | Version: 1.0*
*Source: $100M Retention Playbook - Steps 5+7 Churn Checklist*



<\!-- Criado com Squad Creator do AIOSPRO por @oalanicolas e @pedrovalerio | 2026-02-10 -->
