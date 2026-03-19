# create-upsell-sequence

## Metadata
```yaml
task_id: HZ_MOD_002
agent: hormozi-models
type: creation
complexity: high
estimated_time: 2-3 hours
source: "$100M Money Models - Seção 6 (Upsells)"
```

## Purpose

Criar uma sequência de upsells usando os 4 tipos de upsell do Hormozi (Classic, Menu, Anchor, Rollover), maximizando o valor por cliente através de ofertas estrategicamente posicionadas.

> "Car rental: $19 → $100 (5.2x). Hamburger: $0.25 → $3.00 profit (11.6x). The upsell is where the real money is made." — Alex Hormozi

---

## Input Required

```yaml
upsell_sequence_input:
  business_type: "" # saas | service | coaching | product

  core_offer:
    name: ""
    price: 0
    what_it_includes: []

  problems_created_by_core:
    - problem: ""
      urgency: "" # high | medium | low
    # ...

  available_for_upsell:
    additional_products: []
    service_tiers: []
    add_ons: []
```

---

## The 4 Types of Upsell

### Overview
| Tipo | Fórmula | Melhor Para | Lift Típico |
|------|---------|-------------|-------------|
| Classic | "Não pode ter X sem Y" | Complementos naturais | 2-4x |
| Menu | Unsell → Prescribe → A/B | Várias opções | 3x conversão |
| Anchor | Premium primeiro → Resgate | Alta consideração | 5x receita |
| Rollover | Creditar compra anterior | Reengajamento | 40%+ uptake |

---

## Type 1: Classic Upsell

### Fórmula
```
"Você não pode ter [resultado X] sem [produto Y]"
```

### Exemplos Reais
| Core Offer | Upsell | Multiplicador |
|------------|--------|---------------|
| Carro alugado | Seguro + gasolina + checkout tardio | 5.2x ($19→$100) |
| Hambúrguer | Batatas + bebida + supersize | 11.6x ($0.25→$3 lucro) |
| Curso online | Comunidade + coaching | 3x |
| Software | Setup + treinamento | 2x |

### 9 Táticas do Classic Upsell
```yaml
classic_upsell_tactics:
  1_most_profitable_first:
    rule: "Apresente os upsells mais lucrativos primeiro"
    why: "Maiores margens, maior impacto"

  2_negative_question:
    script: "Você não quer mais nada, quer?"
    why: "Não = Sim. Inverte a psicologia."

  3_surprise_and_delight:
    rule: "Dê TODOS os bônus mesmo se aceitarem antes"
    why: "Cria goodwill para próximas compras"

  4_hyper_buying_moments:
    examples: ["casamentos", "bebês", "novos hobbies"]
    action: "Abrace upsells nesses momentos"

  5_bonus_creates_problems:
    rule: "Bônus grátis CRIAM problemas que upsells resolvem"
    example: "Livro grátis → precisa do curso"

  6_speed_premium:
    rule: "Quanto mais rápido o acesso, maior o valor"
    example: "Implementação imediata = premium price"

  7_bundle_and_name:
    rule: "Agrupe upsells e DÊ UM NOME"
    example: "Pacote Transformação Completa"

  8_bamfam:
    acronym: "Book A Meeting From A Meeting"
    result: "5x mais oportunidades de upsell"

  9_integrate_in_delivery:
    rule: "Integre upsells na entrega de outras ofertas"
    example: "Durante onboarding, apresente add-ons"
```

### Output Template
```yaml
classic_upsell:
  name: ""
  price: 0
  problem_it_solves: ""
  script: "Você não pode ter [resultado] sem [este upsell]..."
  timing: "" # Quando apresentar
  delivery: "" # Como entregar
```

---

## Type 2: Menu Upsell

### Framework: 4 Steps
```
1. UNSELLING → Risque o que NÃO precisam
2. PRESCRIBE → Diga o que precisam
3. A/B → "Chocolate ou baunilha?"
4. CARD ON FILE → "Usar cartão em arquivo?"
```

### Step 1: Unselling
```
ANTES: Apresentar tudo → Cliente confuso → 25% conversão
DEPOIS: Riscar o que não precisa → Confiança → 75% conversão

SCRIPT:
"Baseado no que você me disse, você NÃO precisa de [X, Y, Z].
Vamos tirar isso. O que você PRECISA é [A, B, C]."
```

### Step 2: Prescribe
```
Não pergunte o que querem.
DIGA o que precisam.

SCRIPT:
"Aqui está o que eu recomendo:
- [Produto A] para [objetivo]
- Usar [frequência]
- Por [período]"
```

### Step 3: A/B Choice
```
Remova "sim/não" da equação.
Ambas escolhas = venda.

❌ "Você quer comprar?"
✅ "Chocolate ou baunilha?"
✅ "Pacote A ou Pacote B?"
✅ "Começar hoje ou segunda?"
```

### Step 4: Card on File
```
❌ "Qual é seu cartão?"
✅ "Usar o cartão em arquivo?"

Aumento de conversão: 40%
```

### The Economist Play
```
Opção A: $59 (digital)
Opção B: $125 (print)
Opção A+B: $125 (digital + print)

Resultado: 80% escolhem A+B (combo)
```

### Output Template
```yaml
menu_upsell:
  options:
    - name: ""
      price: 0
      includes: []
      for_who: ""

  unselling_script: "Você NÃO precisa de..."
  prescription_script: "O que você precisa é..."
  ab_question: "Prefere [A] ou [B]?"
```

---

## Type 3: Anchor Upsell

### Framework: 5 Steps
```
1. Apresente a ÂNCORA (5-10x preço)
2. Espere o ENGASGO
3. Venha ao RESGATE
4. Apresente oferta PRINCIPAL
5. Pergunte COMO querem pagar
```

### Script
```
STEP 1-2: ÂNCORA
"Temos duas opções. Primeiro, nosso [premium] por $[5-10x].
Inclui [tudo absolutamente incrível]."

[Espere engasgo]

STEP 3: RESGATE
"Você se importa muito com [feature premium específica]?"

[Cliente: "Não..."]

STEP 4: PRINCIPAL
"Perfeito. Então nosso [principal] por $[X] é exatamente o que você precisa.
Tem tudo que você precisa para [resultado]."

STEP 5: PAGAMENTO
"Qual cartão você prefere usar?"
```

### Regra Crítica
```
TRATE A ÂNCORA COMO OFERTA REAL.
- Alguns VÃO comprar
- Se falsa, perdem confiança
- Prepare-se para entregar se aceitarem
```

### Insight Chave
```
"A única coisa pior que fazer oferta de $1,000
para pessoa com orçamento de $100 é fazer
oferta de $100 para pessoa com orçamento de $1,000."
```

### Output Template
```yaml
anchor_upsell:
  anchor_offer:
    name: ""
    price: 0 # 5-10x principal
    includes: []
    real_deliverable: true # MUST be true

  rescue_question: "Você se importa muito com [X]?"

  main_offer:
    name: ""
    price: 0
    includes: []

  expected_split:
    anchor: 15 # %
    main: 85 # %
```

---

## Type 4: Rollover Upsell

### Conceito
```
Credite compra anterior para próxima compra maior.
Máximo 25% de desconto efetivo.
```

### 4 Situações de Uso
| Situação | Contexto | Script |
|----------|----------|--------|
| REENGAJAR | Clientes antigos (6+ meses) | "Você já pagou $X. Aplico como crédito para [novo]" |
| RESGATAR | Clientes chateados | "Ao invés de reembolso, credito tudo para [upgrade]" |
| ROUBAR | Clientes de concorrentes | "O que pagou ao [concorrente], considero como crédito" |
| UPSELL | Clientes atuais | "Seu valor atual vira crédito para o próximo nível" |

### Regra de Pricing
```
Upsell deve ser pelo menos 4x o crédito.
Isso garante máximo 25% de desconto efetivo.

Exemplo:
Crédito: $500
Mínimo upsell: $2,000
Desconto efetivo: 25%
```

### Hack: Jogada do Cartão-Presente
```
1. Venda cartões-presente de $200 por $20
2. Limite a 2 por cliente
3. Só podem usar em OUTROS (não eles mesmos)
4. Quando vierem usar, role para oferta de $1,000+

Resultado: Clientes PAGAM VOCÊ para indicar amigos
```

### Output Template
```yaml
rollover_upsell:
  situation: "" # reengajar | resgatar | roubar | upsell

  credit_offered:
    amount: 0
    from: "" # Pagamento anterior, concorrente, etc.

  target_offer:
    name: ""
    price: 0 # Mínimo 4x crédito
    effective_discount: 0 # Max 25%

  script: "Você já investiu $[X] em [anterior]. Posso aplicar isso como crédito para [novo]..."
```

---

## 17 Quality Levers (Para Upsell de Qualidade)

### Use Para Criar Versões Premium
| Lever | Standard | Premium |
|-------|----------|---------|
| Response time | Horas | Minutos |
| Availability | 9-5 | 24hrs |
| Days | Mon/Wed/Fri | Todos |
| Time per session | 15min | 60min |
| Locations | 1 | Todas |
| Cancellation | Taxas | Free |
| Service ratio | 1-to-many | 1-on-1 |
| Communication | Chat | Video call |
| Provider | Junior | Expert/Owner |
| Live vs Recorded | Gravado | Ao vivo |
| Remote vs In-person | Remoto | Presencial |
| DIY/DWY/DFY | DIY | DFY |
| Expirations | Limitado | Forever |
| Personalization | Genérico | Custom |
| Guarantee | Básica | Premium |
| Priority | Normal | VIP |
| Extras | Nenhum | Todos |

---

## Output: Upsell Sequence

```yaml
upsell_sequence:
  timestamp: ""
  business: ""

  core_offer: ""

  upsell_1_classic:
    name: ""
    price: 0
    problem_solved: ""
    script: ""
    timing: ""
    expected_conversion: 0

  upsell_2_menu:
    options: []
    unselling_items: []
    prescription: ""
    ab_question: ""
    expected_conversion: 0

  upsell_3_anchor:
    anchor_offer: {}
    main_offer: {}
    rescue_question: ""
    expected_conversion: 0

  upsell_4_rollover:
    situations_to_use: []
    credit_structure: ""
    target_offer: {}
    expected_conversion: 0

  sequence_order:
    1: ""
    2: ""
    3: ""
    4: ""

  projected_impact:
    current_avg_order: 0
    projected_avg_order: 0
    multiplier: 0
```

---

## Quality Gate

```yaml
upsell_sequence_quality:
  - [ ] Pelo menos 2 dos 4 tipos de upsell definidos
  - [ ] Classic upsell com "problema que resolve" claro
  - [ ] Menu upsell com unselling + prescription
  - [ ] Anchor upsell tratado como oferta REAL
  - [ ] Rollover upsell com máximo 25% desconto efetivo
  - [ ] Scripts documentados para cada upsell
  - [ ] Timing de cada upsell definido
  - [ ] Conversões esperadas realistas
```

## Handoff

After completion:
- → `create-downsell-sequence.md` para ofertas de downsell
- → `design-money-model.md` para integrar no model geral
- → `design-continuity-offer.md` para adicionar recorrência

---
*Task: HZ_MOD_002 | Agent: hormozi-models | Version: 1.0*
*Source: $100M Money Models - Seção 6 (Upsells)*



<\!-- Criado com Squad Creator do AIOSPRO por @oalanicolas e @pedrovalerio | 2026-02-10 -->
