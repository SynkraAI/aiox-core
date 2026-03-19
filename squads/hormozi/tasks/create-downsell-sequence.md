# create-downsell-sequence

## Metadata
```yaml
task_id: HZ_MOD_003
agent: hormozi-models
type: creation
complexity: medium
estimated_time: 1-2 hours
source: "$100M Money Models - Seção 7 (Downsells)"
```

## Purpose

Criar uma sequência de downsells usando os 3 tipos do Hormozi (Payment Plan, Trial with Penalty, Feature Downsell), transformando "nãos" em "sins" sem destruir o valor da oferta principal.

> "No means no to THIS offer, not all offers. If it's this or nothing, this beats nothing. But NEVER lower the price of the same thing." — Alex Hormozi

---

## Input Required

```yaml
downsell_sequence_input:
  business_type: "" # saas | service | coaching | product

  core_offer:
    name: ""
    price: 0
    includes: []
    conversion_rate: 0 # %

  common_objections:
    - objection: ""
      frequency: "" # high | medium | low
    # ...

  payment_options:
    accepts_payment_plans: true | false
    minimum_payment: 0
```

---

## Rules of Downselling

### 6 Regras Fundamentais
```yaml
downsell_rules:
  1: "Não significa não para ESTA oferta, não todas"
  2: "Downsells são TROCAS - dê algo, receba algo"
  3: "Personalize, não pressione"
  4: "Mesma coisa de maneiras NOVAS"
  5: "NUNCA baixe preço da mesma coisa - mude oferta com preço"
  6: "Clientes falam sobre preço - consistência importa"
```

### Regra Crítica
```
❌ ERRADO: Oferta principal $1,000 → Downsell $800 (mesma coisa)
✅ CERTO: Oferta principal $1,000 → Downsell $600 (sem garantia)

Por que: Clientes conversam. Se descobrem preços diferentes
para mesma coisa, confiança destruída.
```

---

## Type 1: Payment Plan Downsell

### Processo de 7 Passos (Pare quando comprarem)

#### Step 1: Recompense Pagar Integralmente
```
Estrutura: Preço COM juros embutidos → Pré-pagar = desconto

SCRIPT:
"O investimento total é $X. MAS se pagar hoje,
ao invés de $X, é apenas $Y. Economiza $Z."

Exemplo:
$1,200 parcelado → $997 à vista = 17% economia
```

#### Step 2: Financiamento Terceiros
```
OPÇÕES:
- Cartão de crédito próprio
- Financeiras parceiras (Affirm, etc.)
- Layaway (reservar)

SCRIPT:
"Você prefere que EU decida seus termos ou VOCÊ decide?"
→ "Eu decido" = Usa cartão próprio
```

#### Step 3: Metade Agora, Metade Depois
```
SCRIPT:
"Que tal metade hoje e metade em 30 dias?
Alinha com seu próximo dia de pagamento?"
```

#### Step 4: CHECK - Escala 1-10
```
PERGUNTA: "De 1 a 10, quão perto você está de começar?"

8+ → Continue com pagamento
7- → Mude para downsell de recursos (Type 3)
```

#### Step 5: Divida em Três
```
SCRIPT:
"E se dividirmos em 3 pagamentos iguais?
$X hoje, $X em 30 dias, $X em 60 dias."
```

#### Step 6: Espalhe Uniformemente
```
Para compromissos longos:
16 semanas = 16 pagamentos semanais
6 meses = 6 pagamentos mensais
```

#### Step 7: Trial Gratuito
```
Se nenhum pagamento funcionou:
→ Ir para Type 2: Trial com Penalidade
```

### Técnica Gangorra
```
SCRIPT:
"Pagamentos mensais gigantes ou pequenos?"
→ "Pequenos"
"Pré-pague hoje: desconto massivo + zero mensais. Funciona?"
→ Se não: "Quanto mais der agora = menores mensais."
```

### Dados de Churn por Billing (14,000 empresas)
| Billing | Churn/Mês |
|---------|-----------|
| Mensal | 10.7% |
| Trimestral | 5% |
| Anual | 2% |

**Regra: Dobrar período = metade do churn. Sempre comece pedindo mais tempo.**

---

## Type 2: Trial com Penalidade

### Fórmula
```
"Se você fizer X, Y, Z, deixo você começar de graça."
```

### 5 Passos

#### Step 1: Ofereça Trial POR ÚLTIMO
```
Só após oferta principal rejeitada.
Não comece com trial.
```

#### Step 2: SEMPRE Pegue Cartão
```
SCRIPT:
"Qual cartão?" (não "tem cartão?")
"É como sempre fizemos."

Por que: Sem cartão = 90% somem
```

#### Step 3: Venda Ficar e Pagar
```
SCRIPT:
"Se funcionar, você ficará a longo prazo?"

Isso cria compromisso verbal.
```

#### Step 4: Explique Taxas APÓS Cartão
```
ORDEM CORRETA:
1. Pegue cartão
2. Explique critérios
3. Explique penalidade se não cumprir

ERRADO: Explicar penalidade antes de pegar cartão
→ Aumenta resistência
```

#### Step 5: Check-ins OBRIGATÓRIOS
```
Check-ins são suas oportunidades de:
- Garantir engajamento
- Identificar problemas
- Fazer upsell quando apropriado
```

### Pós-Trial: 3 Cenários
| Cenário | Ação |
|---------|------|
| GOSTOU | Fácil upsell para serviço maior/mais longo |
| ODIOU | "Você está certo, estou irritado. Suas necessidades combinam com nosso premium." (50% compram) |
| NÃO USOU | Contate múltiplas vezes, dispense taxa se encontrarem |

### Output Template
```yaml
trial_with_penalty:
  duration: "" # 7 dias, 14 dias, 30 dias
  criteria_to_pass:
    - criterion: ""
      measurable: true | false
    # ...

  penalty_if_fail:
    amount: 0
    description: ""

  conversion_to_paid: 0 # % esperado
```

---

## Type 3: Feature Downsell

### Fórmula
```
Remova recurso → Baixe preço → "E agora?"
```

### O Hack da Garantia
```
CENÁRIO ORIGINAL:
$1,000 com garantia → 25 compram

ADICIONE DOWNSELL:
$1,000 com garantia → "Não?"
$600 SEM garantia → alguns compram

MAS ACONTECE ALGO INTERESSANTE:
Muitos RECONSIDERAM → compram COMPLETA $1,000
Porque AGORA veem o valor da garantia

RESULTADO:
35 completa + 40 sem = 75 total (era 25)
= 3x taxa de fechamento
```

### O Que Remover (Maior Valor Primeiro)
```
Por que maior valor primeiro:
Remover algo valioso faz cliente reconsiderar oferta principal.

ORDEM DE REMOÇÃO:
1. Garantia/seguro (maior impacto psicológico)
2. Personalização (custom → generic)
3. Acesso/disponibilidade (24h → horário comercial)
4. Ratio de serviço (1-on-1 → grupo)
5. Provider (expert → junior)
6. Velocidade (imediato → fila)
7. Comunicação (video → chat)
8. Live vs gravado
9. DFY → DWY → DIY
10. Quantidade/duração
```

### Script
```
"Ok, entendo que $[X] é demais agora.
E se eu remover [feature mais valiosa]?
Ao invés de $[X], seria apenas $[Y].
Você teria [tudo menos feature].
Funciona melhor?"

[MUITOS reconsideram e pegam oferta COMPLETA]
```

### Output Template
```yaml
feature_downsell:
  full_offer:
    name: ""
    price: 0
    includes: []

  downsell_offer:
    name: ""
    price: 0
    removed: "" # O que removeu
    includes: []

  expected_behavior:
    take_downsell: 0 # %
    reconsider_full: 0 # %
    leave: 0 # %
```

---

## Downsell Sequence Design

### Ordem Recomendada
```
1. Oferta Principal rejeitada
   ↓
2. Payment Plan (Steps 1-6)
   ↓
3. Trial com Penalidade
   ↓
4. Feature Downsell
   ↓
5. Se ainda não: próximo contato em 30 dias
```

### Quando NÃO Fazer Downsell
```yaml
never_downsell_to:
  - "Comprador qualificado que pode pagar"
  - "Cliente satisfeito pedindo upgrade"
  - "Alguém que já disse sim"

only_downsell_to:
  - "Quem genuinamente não pode pagar AGORA"
  - "Quem não qualifica para oferta principal"
  - "Quem precisa de stepping stone"
```

---

## Output: Downsell Sequence

```yaml
downsell_sequence:
  timestamp: ""
  business: ""

  core_offer:
    name: ""
    price: 0
    conversion_rate: 0

  downsell_1_payment_plan:
    full_price: 0
    prepay_discount: 0
    payment_options:
      - installments: 0
        amount: 0
    gangorra_script: ""

  downsell_2_trial:
    duration: ""
    criteria: []
    penalty: 0
    post_trial_conversion: 0

  downsell_3_feature:
    full_offer: {}
    downsell_offer: {}
    feature_removed: ""
    reconsideration_rate: 0

  sequence_flow:
    step_1: "Payment plan options"
    step_2: "Trial with penalty"
    step_3: "Feature downsell"
    step_4: "Follow-up in 30 days"

  projected_impact:
    current_conversion: 0
    projected_conversion: 0
    lift: 0
```

---

## Quality Gate

```yaml
downsell_sequence_quality:
  - [ ] Nunca baixa preço da MESMA oferta
  - [ ] Payment plan com pelo menos 3 opções
  - [ ] Trial sempre pega cartão ANTES de explicar termos
  - [ ] Feature downsell remove item de ALTO valor primeiro
  - [ ] Scripts para cada tipo documentados
  - [ ] Critérios claros de quando usar cada tipo
  - [ ] Projeção de conversão realista
  - [ ] Regra de "nunca downsell comprador qualificado" clara
```

## Handoff

After completion:
- → `design-money-model.md` para integrar no model geral
- → `create-upsell-sequence.md` para completar sequência
- → `design-continuity-offer.md` para adicionar recorrência

---
*Task: HZ_MOD_003 | Agent: hormozi-models | Version: 1.0*
*Source: $100M Money Models - Seção 7 (Downsells)*



<\!-- Criado com Squad Creator do AIOSPRO por @oalanicolas e @pedrovalerio | 2026-02-10 -->
