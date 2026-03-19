# Exit Interview System Checklist

> Checklist de implementação para `create-exit-interview-system.md` (HZ_RET_005)
> Source: $100M Retention Playbook - Steps 5+7 Churn Checklist
> Agent: hormozi-retention

---

## Pre-System Setup

```yaml
pre_setup:
  onboarding_integration:
    - [ ] Expectativa de exit interview setada no onboarding
    - [ ] Script para setar expectativa documentado
    - [ ] Compromisso social criado ("pode fazer isso por mim?")

  cancellation_trigger:
    - [ ] Trigger de cancelamento definido
    - [ ] Cancelamento NÃO processa imediatamente
    - [ ] Call agendada dentro de 48h automaticamente
```

---

## Interview Process

```yaml
interview_process:
  scheduling:
    - [ ] Método de agendamento definido
    - [ ] Tempo máximo até call (48h)
    - [ ] Reminder 24h antes

  script_documented:
    - [ ] Script de abertura pronto
    - [ ] "Hey, sem pressão. Adoraria ouvir todas as razões..."
    - [ ] Técnicas de escuta documentadas
```

---

## 3 Phases of Interview

```yaml
interview_phases:
  phase_1_listen:
    - [ ] Regras claras: NÃO interromper, NÃO defender
    - [ ] Objetivo: Validar emoções, coletar informação
    - [ ] Duração: Quanto precisar

  phase_2_align:
    - [ ] Script de indignação preparado
    - [ ] "Isso é completamente ridículo. Você está 100% correto."
    - [ ] Criar aliança com cliente

  phase_3_offer:
    - [ ] Pergunta: "Me dá oportunidade de consertar?"
    - [ ] Se SIM: Oferecer save options
    - [ ] Se NÃO: Agradecer feedback, processar com dignidade
```

---

## Save Options

```yaml
save_options:
  option_1_redo:
    - [ ] Critérios de quando usar definidos
    - [ ] Script documentado
    - [ ] "Deixa eu tentar de novo e vou consertar isso"
    - [ ] Ações pós-redo definidas (responsável dedicado, check-ins)

  option_2_upsell:
    - [ ] Critérios de quando usar definidos
    - [ ] Programa superior identificado
    - [ ] Script documentado
    - [ ] "Você deveria estar no programa maior. Culpa minha."
    - [ ] Crédito de pagamentos anteriores

  option_3_pause:
    - [ ] Critérios de quando usar definidos
    - [ ] Termos de pausa definidos
    - [ ] Script documentado
    - [ ] Check-in em 30-60 dias agendado
```

---

## Resell Protocol

```yaml
resell_protocol:
  value_reminder:
    - [ ] Script para relembrar por que ficar ajuda
    - [ ] Progresso do cliente documentado

  loss_aversion:
    - [ ] Lista do que perdem preparada:
      - [ ] URLs personalizadas
      - [ ] Posts/conteúdo criado
      - [ ] Progresso/badges/níveis
      - [ ] Acesso a comunidade
      - [ ] Pricing de founder (se aplicável)
      - [ ] Relacionamentos construídos
```

---

## High-Volume Alternative

```yaml
cancellation_video:
  if_needed:
    - [ ] Critério de "alto volume" definido
    - [ ] Vídeo criado com:
      - [ ] Relembra por que começaram
      - [ ] Revende o valor
      - [ ] Lembra o que arriscam perder
      - [ ] Oferece alternativa (pause/downgrade)
      - [ ] CTA final

    - [ ] Duração: 3-4 minutos max
    - [ ] Posicionado ANTES da confirmação de cancelamento
```

---

## Tracking & Metrics

```yaml
tracking:
  volume_metrics:
    - [ ] Cancellation requests tracked
    - [ ] Interviews scheduled vs completed
    - [ ] Show rate

  outcome_metrics:
    - [ ] Saved with redo
    - [ ] Saved with upsell
    - [ ] Saved with pause
    - [ ] Total save rate

  feedback_metrics:
    - [ ] Top 3 razões de cancelamento
    - [ ] Actionable insights documentados
```

---

## Team Training

```yaml
team_training:
  skills:
    - [ ] Equipe treinada em escuta ativa
    - [ ] Equipe treinada nas 3 fases
    - [ ] Equipe treinada nas save options
    - [ ] Role-play realizado

  documentation:
    - [ ] Feedback log template criado
    - [ ] Processo de escalation definido
```

---

## Expected Impact

```yaml
expected_impact:
  targets_set:
    - [ ] Save rate target: ~50% dos que aparecem
    - [ ] Show rate target: ~50%
    - [ ] Churn reduction: ~25%
    - [ ] LTV increase: ~33%
```

---

*Checklist: exit-interview | Version: 1.0*
*Supports: create-exit-interview-system.md (HZ_RET_005)*

---

## Scoring

| Category | Items | Points Each | Max |
|----------|-------|-------------|-----|
| Critical — 3 Interview Phases & Save Options | 22 | 3 | 66 |
| Standard — Pre-System Setup, Resell Protocol, Team Training | 17 | 2 | 34 |
| Bonus — High-Volume Alternative, Tracking & Metrics, Expected Impact | 16 | 1 | 16 |
| **TOTAL** | **55** | | **116** |

### Thresholds
- **PASS**: >= 93 points (80%)
- **CONDITIONAL**: >= 70 points (60%)
- **FAIL**: < 70 points

### If FAIL
The exit interview system cannot effectively save cancelling customers. Prioritize documenting the 3-phase interview script (Listen, Align, Offer) and the 3 save options (Redo, Upsell, Pause) -- these are the core mechanics that drive the ~25% churn reduction target.



<\!-- Criado com Squad Creator do AIOSPRO por @oalanicolas e @pedrovalerio | 2026-02-10 -->
