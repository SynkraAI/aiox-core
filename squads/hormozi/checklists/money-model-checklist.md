# Money Model Architecture Checklist

> Checklist de validação para `design-money-model.md` (HZ_MOD_001)
> Source: $100M Money Models - Framework GMMM
> Agent: hormozi-models

---

## Pre-Design Validation

```yaml
pre_validation:
  business_ready:
    - [ ] Produto validado (mín 10 clientes satisfeitos pagantes)
    - [ ] CAC documentado e consistente
    - [ ] Capacidade de entrega (consegue 2x volume atual)
    - [ ] Sistema de cobrança aceita planos e recorrência
    - [ ] Tracking de conversão por estágio instalado

  red_flags_absent:
    - [ ] Taxa de reembolso ≤ 5%
    - [ ] Consegue explicar valor em 30 segundos
    - [ ] Tem depoimentos/casos de sucesso
    - [ ] Margem bruta ≥ 30%
    - [ ] Churn ≤ 10% mensal
```

---

## Pilar 1: Lucro em 30 Dias

```yaml
pilar_1:
  formula_applied:
    - [ ] L30 = (P1 × C1) + Σ(Un × Cn) - CAC - COGS
    - [ ] Todos componentes calculados
    - [ ] Resultado documentado

  health_check:
    - [ ] L30 < 0: Crítico, parar marketing
    - [ ] L30 = 0-1x CAC: Médio, adicionar ofertas
    - [ ] L30 = 1-2x CAC: Bom, otimizar
    - [ ] L30 > 2x CAC: Excelente, escalar
```

---

## Pilar 2: Sequência Problema-Solução

```yaml
pilar_2:
  problems_mapped:
    - [ ] Core offer identificada
    - [ ] Problemas criados pela solução listados
    - [ ] Pelo menos 3 problemas mapeados
    - [ ] Urgência de cada problema avaliada

  solutions_designed:
    - [ ] Solução/upsell para cada problema
    - [ ] Preço e timing definidos
    - [ ] Naturalidade da transição avaliada
```

---

## Pilar 3: Ancoragem de Valor

```yaml
pilar_3:
  anchor_strategy:
    - [ ] Âncora definida (5-10x preço principal)
    - [ ] Âncora é oferta REAL (preparado para entregar)
    - [ ] Script de apresentação documentado
    - [ ] Pergunta de resgate preparada

  expected_split:
    - [ ] % esperado que compra âncora
    - [ ] % esperado que compra principal
```

---

## Pilar 4: Fricção Zero

```yaml
pilar_4:
  friction_removed:
    - [ ] "Qual cartão?" ao invés de "Quer comprar?"
    - [ ] Cartão em arquivo quando possível
    - [ ] Processo de pagamento simplificado
    - [ ] Barreiras identificadas e removidas
```

---

## GMMM Framework

```yaml
stage_1_get_money:
  attraction_offer:
    - [ ] Oferta de atração definida
    - [ ] Preço estabelecido
    - [ ] Conversão target definida
    - [ ] COGS calculado
    - [ ] Meta: Cobrir CAC + COGs

stage_2_more_money:
  upsells:
    - [ ] Pelo menos 2 upsells definidos
    - [ ] Preço de cada upsell
    - [ ] Timing de cada upsell
    - [ ] Conversão esperada

  downsells:
    - [ ] Pelo menos 1 downsell definido
    - [ ] Trigger de quando oferecer
    - [ ] Preço e diferencial do principal

  target:
    - [ ] Meta: 3-5x valor inicial

stage_3_max_money:
  continuity:
    - [ ] Oferta de continuidade definida
    - [ ] Tipo escolhido (bonus, discount, waived fee)
    - [ ] Preço mensal
    - [ ] Churn target < 5%
    - [ ] Meta: 80%+ em continuidade
```

---

## Matriz de Ofertas 4x3

```yaml
offer_matrix:
  attraction:
    - [ ] Quantidade: Opção "mais"
    - [ ] Qualidade: Opção "premium"
    - [ ] Diferente: Opção "novo"

  upsell:
    - [ ] Quantidade: Opção "dobro"
    - [ ] Qualidade: Opção "melhor"
    - [ ] Diferente: Opção "complementar"

  downsell:
    - [ ] Quantidade: Opção "menos"
    - [ ] Qualidade: Opção "inferior"
    - [ ] Diferente: Opção "alternativa"

  continuity:
    - [ ] Quantidade: Opção "ilimitado"
    - [ ] Qualidade: Opção "mantida"
    - [ ] Diferente: Opção "recorrente"
```

---

## Cash First Hierarchy

```yaml
cash_first:
  priority_check:
    - [ ] Se CAC > 30-day revenue → Consertando atração PRIMEIRO
    - [ ] Se cobriu mas margens baixas → Adicionando upsells
    - [ ] Se conversão < 20% → Adicionando downsells
    - [ ] Se 1-3 funcionam → Adicionando continuidade
```

---

## Projections

```yaml
projections:
  calculated:
    - [ ] Novo L30 projetado
    - [ ] Novo LTV projetado
    - [ ] Novo LTV:CAC projetado
    - [ ] Health status esperado

  implementation:
    - [ ] Prioridades de implementação definidas
    - [ ] Timeline realista
```

---

## LTGP:CAC Health

```yaml
health_interpretation:
  status_correct:
    - [ ] > 3:1 → Saudável, escalar agressivamente
    - [ ] 2-3:1 → Alerta, otimizar
    - [ ] < 2:1 → Crítico, PARAR e consertar
```

---

*Checklist: money-model | Version: 1.0*
*Supports: design-money-model.md (HZ_MOD_001)*

---

## Scoring

| Category | Items | Points Each | Max |
|----------|-------|-------------|-----|
| Critical — Pre-Validation Red Flags, GMMM Stages, LTGP:CAC Health | 23 | 3 | 69 |
| Standard — 4 Pillars (L30, Problem-Solution, Anchor, Friction), Offer Matrix | 24 | 2 | 48 |
| Bonus — Cash First Hierarchy, Projections | 6 | 1 | 6 |
| **TOTAL** | **53** | | **123** |

### Thresholds
- **PASS**: >= 99 points (80%)
- **CONDITIONAL**: >= 74 points (60%)
- **FAIL**: < 74 points

### If FAIL
The money model architecture is incomplete and risks negative 30-day cash flow. Validate all pre-design red flags first, then ensure GMMM Stage 1 (Get Money) covers CAC + COGS before designing upsell and continuity stages.



<\!-- Criado com Squad Creator do AIOSPRO por @oalanicolas e @pedrovalerio | 2026-02-10 -->
