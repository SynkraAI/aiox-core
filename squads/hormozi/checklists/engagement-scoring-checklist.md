# Engagement Scoring System Checklist

> Checklist de implementação para `create-engagement-scoring.md` (HZ_RET_007)
> Source: $100M Retention Playbook - Seção 10
> Agent: hormozi-retention

---

## Data Foundation

```yaml
data_foundation:
  available_metrics:
    - [ ] Login/visit data disponível
    - [ ] Usage/feature adoption data
    - [ ] Content consumption data
    - [ ] Community activity data
    - [ ] Support ticket data

  activation_point:
    - [ ] Activation point definido
    - [ ] Métrica de activation trackável
```

---

## 5 Levels Defined

```yaml
level_definitions:
  level_0_ghost:
    - [ ] Critério: Sem atividade 30+ dias
    - [ ] Threshold específico definido
    - [ ] Risco: Extremamente alto

  level_1_passive:
    - [ ] Critério: Atividade mínima, tendência queda
    - [ ] Threshold específico definido
    - [ ] Risco: Alto

  level_2_active:
    - [ ] Critério: Regular mas não no activation
    - [ ] Threshold específico definido
    - [ ] Risco: Moderado

  level_3_engaged:
    - [ ] Critério: No/acima activation point
    - [ ] Threshold específico definido
    - [ ] Risco: Baixo

  level_4_champion:
    - [ ] Critério: Ativo + refere outros
    - [ ] Threshold específico definido
    - [ ] Risco: Muito baixo
```

---

## Action Protocols

```yaml
protocols:
  ghost_protocol:
    - [ ] Prioridade CRÍTICA definida
    - [ ] Sequência de 14-21 dias documentada
    - [ ] Day 0: Email/SMS pessoal
    - [ ] Day 3: Ligação
    - [ ] Day 7: Oferta especial
    - [ ] Day 14: Last chance
    - [ ] Escalation definido

  passive_protocol:
    - [ ] Framework ACA aplicado
    - [ ] Outreach pessoal (não automático)
    - [ ] Friction discovery process
    - [ ] Incentivo para re-engajar

  active_protocol:
    - [ ] Foco: Guiar ao activation point
    - [ ] Clarificar o que precisa atingir
    - [ ] Remover obstáculos
    - [ ] Progress tracking

  engaged_protocol:
    - [ ] Manter, não quebrar o que funciona
    - [ ] Testimonial request
    - [ ] Referral request
    - [ ] Upsell presentation

  champion_protocol:
    - [ ] VIP access oferecido
    - [ ] Early access a novidades
    - [ ] Co-creation oportunidades
    - [ ] Ambassador program
```

---

## Metrics Framework

```yaml
metrics_tiers:
  tier_1_survival:
    - [ ] Churn rate mensal (por cohort)
    - [ ] Revenue churn rate
    - [ ] LTV (rolling 90 dias)
    - [ ] LTV:CAC ratio

  tier_2_engagement:
    - [ ] Frequência de login/visita
    - [ ] Profundidade de uso de features
    - [ ] Taxa de consumo de conteúdo
    - [ ] Participação em comunidade
    - [ ] Support ticket volume + sentiment
    - [ ] NPS score (trimestral)

  tier_3_predictive:
    - [ ] Tempo desde último login/compra
    - [ ] Tendência do engagement score
    - [ ] Taxa de falha de pagamento
    - [ ] Taxa de resposta a outreach
    - [ ] % conclusão do activation point
```

---

## Scoring Algorithm

```yaml
algorithm:
  factors_defined:
    - [ ] Login frequency (weight assigned)
    - [ ] Activation status (weight assigned)
    - [ ] Feature depth (weight assigned)
    - [ ] Community activity (weight assigned)
    - [ ] Referral behavior (weight assigned)

  thresholds:
    - [ ] Ghost threshold defined (ex: score <10)
    - [ ] Passive threshold defined (ex: 10-30)
    - [ ] Active threshold defined (ex: 31-50)
    - [ ] Engaged threshold defined (ex: 51-75)
    - [ ] Champion threshold defined (ex: >75)

  calculation:
    - [ ] Fórmula documentada
    - [ ] Testada com dados reais
    - [ ] Update frequency definida
```

---

## Alerts & Automation

```yaml
alerts:
  configured:
    - [ ] Alert para Level 0 (Ghost) - imediato
    - [ ] Alert para Level 1 (Passive) - diário
    - [ ] Alert para downgrade de level

  recipients:
    - [ ] Quem recebe cada tipo de alert
    - [ ] Escalation path claro
```

---

## Dashboard & Visualization

```yaml
dashboard:
  created:
    - [ ] Distribuição por level visível
    - [ ] Tendências ao longo do tempo
    - [ ] Alerts ativos
    - [ ] Actions pending

  location:
    - [ ] Dashboard location definido
    - [ ] Acesso configurado para equipe
```

---

## Quality Gate

```yaml
quality_gate:
  system_complete:
    - [ ] 5 níveis claramente definidos
    - [ ] Critérios objetivos para cada nível
    - [ ] Métricas em 3 tiers implementadas
    - [ ] Protocolo de ação para cada nível
    - [ ] Activation point integrado no scoring
    - [ ] Alertas definidos para risco
    - [ ] Dashboard/visualização criada
    - [ ] Owner de cada protocolo atribuído
```

---

*Checklist: engagement-scoring | Version: 1.0*
*Supports: create-engagement-scoring.md (HZ_RET_007)*

---

## Scoring

| Category | Items | Points Each | Max |
|----------|-------|-------------|-----|
| Critical — 5 Level Definitions & Action Protocols | 35 | 3 | 105 |
| Standard — Data Foundation, Scoring Algorithm, Alerts | 20 | 2 | 40 |
| Bonus — Dashboard, Quality Gate, Metrics Framework | 19 | 1 | 19 |
| **TOTAL** | **74** | | **164** |

### Thresholds
- **PASS**: >= 132 points (80%)
- **CONDITIONAL**: >= 99 points (60%)
- **FAIL**: < 99 points

### If FAIL
The engagement scoring system cannot reliably identify at-risk customers. Ensure all 5 levels have objective thresholds and that the Ghost (Level 0) protocol is fully defined as an immediate priority -- undetected ghosts are the largest source of preventable churn.



<\!-- Criado com Squad Creator do AIOSPRO por @oalanicolas e @pedrovalerio | 2026-02-10 -->
