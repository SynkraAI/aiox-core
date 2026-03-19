# design-continuity-offer

## Metadata
```yaml
task_id: HZ_MOD_004
agent: hormozi-models
type: design
complexity: medium
estimated_time: 1-2 hours
source: "$100M Money Models - Seção 8 (Continuidade)"
```

## Purpose

Desenhar uma oferta de continuidade usando os 3 tipos do Hormozi (Bonus, Discount, Waived Fee), criando receita recorrente previsível com 80%+ dos clientes em continuidade.

> "You sell once but receive repeatedly. 100 people at $50/month with 40% conversion = 40 clients. If they stay 20 months: $1,000/client = $40,000 total. PLUS: 40 clients for upsell (vs 10 with one-time)." — Alex Hormozi

---

## Input Required

```yaml
continuity_design_input:
  business_type: "" # saas | membership | coaching | service

  current_model:
    has_continuity: true | false
    current_recurring_revenue: 0
    current_churn_rate: 0

  core_offer:
    name: ""
    price: 0 # One-time price
    delivery_period: "" # How long you deliver

  assets_available:
    past_content: [] # Para bonus
    community_access: true | false
    ongoing_support: true | false
```

---

## Por Que Continuidade

### Matemática
```
ONE-TIME:
$1,000 produto × 100 pessoas × 10% conversão = 10 clientes = $10,000

CONTINUIDADE:
$50/mês × 100 pessoas × 40% conversão = 40 clientes
Se ficam 20 meses: $1,000/cliente = $40,000 total

DIFERENÇA: 4x receita + 4x clientes para upsell
```

### Benefícios
```
1. PREVISIBILIDADE: Sabe quanto entra todo mês
2. VOLUME: Mais clientes entram (preço menor)
3. UPSELL BASE: Mais clientes = mais oportunidades
4. VALUATION: Negócios de recorrência valem mais
```

---

## The 3 Types

### Overview
| Tipo | Mecanismo | Melhor Para |
|------|-----------|-------------|
| Bonus | Algo incrível por assinar HOJE | Digital, serviços |
| Discount | Tempo grátis por compromisso | Todos |
| Waived Fee | Fee dispensada por commitment | Alto CAC, onboarding caro |

---

## Type 1: Continuity Bonus Offer

### Fórmula
```
Dar ao cliente algo INCRÍVEL por se inscrever HOJE.
Regra: Valor do bonus > primeiro pagamento de continuity.
```

### Exemplos por Vertical
| Vertical | Bonus | Valor Percebido | Monthly |
|----------|-------|-----------------|---------|
| Físico | $800 em brinquedos para cachorro | $800 | $59/mês |
| Serviço | Programa acelerador de $1,000 | $1,000 | $100/mês |
| Digital | Todas 40 newsletters passadas | $15,880 | $399/mês |

### 5 Regras do Bonus
```yaml
bonus_rules:
  1_sell_bonus:
    rule: "Vender o BONUS, não a membership"
    script: "Você recebe [bonus incrível] GRÁTIS quando assina..."

  2_keep_related:
    rule: "Manter bonus relacionado à oferta principal"
    why: "Relevância aumenta valor percebido"

  3_use_existing:
    rule: "Usar assets que já tem"
    examples:
      - "Conteúdo passado"
      - "Gravações de eventos"
      - "Templates criados"
    benefit: "Custo marginal zero, alto valor percebido"

  4_status_as_bonus:
    rule: "Dar STATUS como bonus"
    examples:
      - "Silver → Gold → Diamond"
      - "Founding Member badge"
      - "VIP access"

  5_combine_with_prepay:
    rule: "Combinar com descontos de pré-pagamento"
    example: "Bonus + compre 5 meses ganhe 1 grátis"
```

### Pricing: Standalone vs Continuity
```
Para fazer X% escolherem continuidade:

50% continuidade: Standalone = 1.33x mensal
60% continuidade: Standalone = 1.66x mensal
70% continuidade: Standalone = 2.00x mensal
80% continuidade: Standalone = 2.33x mensal
90% continuidade: Standalone = 2.66x mensal

Exemplo:
Mensal: $100
Quer 70% em continuidade
Standalone: $100 × 2.00 = $200
```

### Upsell Após Entrada
```
Oferecer pré-pago em bloco:
"Compre 5 meses, ganhe 1 grátis"

Estatística: 1 em 8 pegam = 50% mais lucro em 30 dias
```

### Output Template
```yaml
bonus_continuity:
  monthly_price: 0
  standalone_price: 0 # Para X% em continuidade
  target_continuity_rate: 0

  bonus_offered:
    name: ""
    perceived_value: 0
    actual_cost: 0
    delivery: ""

  prepay_upsell:
    offer: "Buy X get Y free"
    expected_uptake: 0
```

---

## Type 2: Continuity Discount Offer

### Fórmula
```
Tempo grátis em troca de compromisso mais longo.
```

### Estruturas
| Estrutura | Exemplo | Desconto Efetivo |
|-----------|---------|------------------|
| Meses grátis | "3 meses grátis com 12 meses" | 25% |
| Buy X Get Y | "6 meses, ganhe 6 grátis" | 50% |
| Percentual | "25% off anual" | 25% |

### 4 Formatos de Apresentar
```
Mesmo desconto, frames diferentes:

1. PERCENTUAL: "25% off"
2. VALOR: "$300 off"
3. TEMPO GRÁTIS: "3 meses grátis"
4. COMPARAÇÃO: "12 meses por $900 (era $1,200)"

Teste qual converte melhor para seu público.
```

### Quando Dar Desconto (4 Estruturas)
| Estrutura | Quando Usar |
|-----------|-------------|
| Upfront (grátis primeiro) | Enforcement forte (telecom, storage) |
| Backloaded (grátis após) | Estimular comportamento de pagamento |
| Spread (diluído) | Manter cash flow regular |
| Prepayment (primeiro+último) | Garantir cash para CAC |

### Hacks
```yaml
discount_hacks:
  every_4_weeks:
    tactic: "Cobrar a cada 4 semanas ao invés de mensal"
    result: "13 ciclos/ano = 8.3% mais receita"

  payment_backup:
    tactic: "Waive 3% processing fee com 2 cartões em arquivo"
    result: "Reduz churn involuntário"

  gift_cards:
    tactic: "Gift cards liberados após 3 pagamentos"
    result: "Retenção + ferramenta de referral"

  conditional_lifetime:
    tactic: "5% off no início, 15% após 5 meses"
    result: "Incentivo crescente para ficar"
```

### Output Template
```yaml
discount_continuity:
  monthly_price: 0
  commitment_period: "" # 6 meses, 12 meses
  discount_structure: "" # upfront | backloaded | spread
  effective_discount: 0

  presentation_format: "" # percent | dollar | free_time | comparison
```

---

## Type 3: Waived Fee Offer

### Fórmula
```
Opção A: Pagar setup fee (3-5x mensal) + monthly. Cancelar quando quiser.
Opção B: Compromisso 12 meses. Fee dispensada.
Sair cedo = paga fee dispensada.
```

### Estrutura Completa
```
APRESENTAÇÃO:
"Temos duas formas de trabalhar juntos:

OPÇÃO A (Flexível):
- $5,000 taxa de setup
- $1,000/mês
- Cancele quando quiser

OPÇÃO B (Compromisso):
- $0 taxa de setup
- $1,000/mês por 12 meses
- Se sair antes: paga a taxa dispensada

Qual prefere?"
```

### Por Que Funciona
```
ENTRY: Pessoas assinam para EVITAR a fee
DURANTE: Fee pende como motivação para ficar
RETENÇÃO: Custo de sair (fee) > custo de ficar (monthly)
APÓS: Fee desaparece oficialmente (equitativo)
```

### Estatísticas
```
85% escolhem compromisso
Churn < 5% durante período
LTV 2x+ vs mês-a-mês
```

### Pricing da Fee
```
Fee típica: 3-5x mensal

Exemplo:
Mensal: $1,000
Fee: $3,000 - $5,000
```

### Cancelamento Baseado em Causa (Avançado)
```
SCRIPT:
"Qual causa você absolutamente ODEIA?"
[Cliente responde]
"Se você cancelar cedo, estou doando sua setup fee para eles."

RESULTADO:
- Dupla aversão = 50% redução de churn adicional
- Cliente precisa REALMENTE querer sair
```

### Ideal Para
```
- Negócios com onboarding de alto custo
- Serviços de resultado a longo prazo (SEO, weight loss)
- Consulting e programas de transformação
- Qualquer coisa com CAC alto
```

### Naming Options
```
- Activation fee
- Setup fee
- Processing fee
- Engagement fee
- Onboarding fee
```

### Warning Sign
```
SE > 5% querem sair cedo
→ Investigue PRODUTO, não pricing
→ Algo está errado na entrega
```

### Output Template
```yaml
waived_fee_continuity:
  monthly_price: 0
  setup_fee: 0 # 3-5x mensal
  commitment_period: "" # 12 meses típico
  early_exit_penalty: "" # Paga fee dispensada

  expected_split:
    option_a_flexible: 15 # %
    option_b_commitment: 85 # %

  cause_based_cancellation:
    enabled: true | false
    charity_partner: ""
```

---

## Decision Framework

### Qual Tipo Usar
```yaml
choose_continuity_type:
  bonus:
    when:
      - "Tem assets de alto valor percebido"
      - "Público prefere valor imediato"
      - "Digital ou serviços"
    avoid_when:
      - "Sem assets existentes para oferecer"

  discount:
    when:
      - "Público sensível a preço"
      - "Quer simplicidade"
      - "Já tem base de clientes"
    avoid_when:
      - "Margem muito apertada"

  waived_fee:
    when:
      - "Alto custo de onboarding"
      - "Serviços de longo prazo"
      - "Quer máxima retenção"
    avoid_when:
      - "Produto não entrega valor em 12 meses"
```

---

## Output: Continuity Offer Design

```yaml
continuity_offer_design:
  timestamp: ""
  business: ""

  selected_type: "" # bonus | discount | waived_fee

  type_1_bonus:
    enabled: true | false
    bonus_description: ""
    bonus_value: 0
    monthly_price: 0
    standalone_price: 0
    target_continuity_rate: 0

  type_2_discount:
    enabled: true | false
    discount_structure: ""
    commitment_period: ""
    effective_discount: 0
    presentation_format: ""

  type_3_waived_fee:
    enabled: true | false
    setup_fee: 0
    monthly_price: 0
    commitment_period: ""
    cause_cancellation: true | false

  projected_metrics:
    monthly_recurring_revenue: 0
    expected_churn: 0
    ltv_improvement: 0
    percentage_in_continuity: 0
```

---

## Quality Gate

```yaml
continuity_quality:
  - [ ] Pelo menos 1 dos 3 tipos definido
  - [ ] Bonus tem valor percebido > primeiro pagamento
  - [ ] Discount tem commitment period claro
  - [ ] Waived fee tem early exit terms documentados
  - [ ] Pricing alinhado com target continuity rate
  - [ ] Scripts de apresentação documentados
  - [ ] Projeções de churn e LTV realistas
  - [ ] Produto entrega valor no commitment period
```

## Handoff

After completion:
- → `design-money-model.md` para integrar no model geral
- → `diagnose-churn-rate.md` para baseline de churn
- → `implement-5-horsemen.md` para táticas de retenção

---
*Task: HZ_MOD_004 | Agent: hormozi-models | Version: 1.0*
*Source: $100M Money Models - Seção 8 (Continuidade)*



<\!-- Criado com Squad Creator do AIOSPRO por @oalanicolas e @pedrovalerio | 2026-02-10 -->
