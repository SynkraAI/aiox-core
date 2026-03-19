# diagnose-value-equation

## Metadata
```yaml
task_id: HZ_OFFER_002
agent: hormozi-offers
type: diagnostic
complexity: medium
estimated_time: 15-20min
source: "$100M Offers - Chapter 6: The Value Equation"
```

## Purpose
Run a complete Value Equation diagnostic on an existing offer to identify where value is leaking and how to fix it.

> "There is a repeatable formula to quantify the variables that create value for any offer. Once you see it, you can never unsee it." — Alex Hormozi

## The Value Equation

```
         (Dream Outcome × Perceived Likelihood of Achievement)
Value = ─────────────────────────────────────────────────────────
         (Perceived Time Delay × Perceived Effort & Sacrifice)
```

### The 4 Value Drivers

| # | Variable | Goal | Customer's Question |
|---|----------|------|---------------------|
| 1 | Dream Outcome | INCREASE | "What will I gain?" |
| 2 | Perceived Likelihood of Achievement | INCREASE | "How do I know it's going to happen?" |
| 3 | Time Delay | DECREASE | "How long will it take?" |
| 4 | Effort & Sacrifice | DECREASE | "What is expected of me?" |

### The Secret: Drive the Bottom to Zero

> "If you can make the bottom part of the equation equal to zero, you're golden. Anything divided by zero equals infinity."

**Infinite Value =** Immediate result + Zero client effort

Hypothetical infinite value examples:
- Click "buy" on weight loss product → stomach turns into six-pack instantly
- Sign marketing contract → phone starts ringing with qualified leads

**Best companies focus on decreasing the bottom:**
- Apple: iPhone with zero effort compared to other phones
- Amazon: One-click purchase, near-instant delivery
- Netflix: Immediate and effortless consumption

---

## CORE PRINCIPLE: Perception IS Reality

> "The Grand Slam Offer only becomes valuable once the prospect PERCEIVES the increase in likelihood, PERCEIVES the decrease in time delay, and PERCEIVES the decrease in effort."

**London Underground Example:**
- Logical solution: Faster trains (billions of dollars)
- Psychological solution: Dotted map showing wait time (millions of dollars)
- Result: Biggest increase in satisfaction came from psychological solution

**Implication:** Seek psychological solutions, not just logical ones.

---

## Input Required

```yaml
offer_details:
  name: ""
  description: ""
  price: ""
  target_avatar: ""
  delivery_method: ""  # Product, service, hybrid
  current_conversion_rate: ""  # Optional
```

---

## Pre-Requisite: Pensamento Divergente

> "A criação de uma oferta irresistível é um exercício de pensamento DIVERGENTE. A vida e os negócios pagam pela capacidade de gerar múltiplas soluções para um único problema."

**ANTES de diagnosticar, execute o Exercício do Tijolo Mental:**

1. **Identificar os Blocos**: Decomponha a oferta nos componentes fundamentais
2. **Questionar Premissas**: Para cada bloco, pergunte: Qual o tamanho? De que é feito? Qual o formato?
3. **Gerar Múltiplas Opções**: Liste 5-10 variações possíveis SEM julgar
4. **Convergir**: Só então use a Equação de Valor para selecionar

---

## O Algoritmo de Diagnóstico em 5 Passos

```
┌─────────────────────────────────────────────────────────────────┐
│  FLUXO DE DIAGNÓSTICO DA EQUAÇÃO DE VALOR                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. ANALISAR → Cada variável separadamente                     │
│       ↓                                                        │
│  2. PONTUAR → 0 ou 1 (binário, como Hormozi)                   │
│       ↓                                                        │
│  3. DIAGNOSTICAR → Variável mais fraca = prioridade            │
│       ↓                                                        │
│  4. PROJETAR → Soluções PSICOLÓGICAS e LÓGICAS                 │
│       ↓                                                        │
│  5. COMPARAR → Com alternativa de mercado (Fitness vs Lipo)    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**REGRA DE OURO:** Sempre busque soluções psicológicas ALÉM das lógicas. A solução do metrô de Londres (mapa de espera) custou milhões vs bilhões dos trens mais rápidos.

---

## Diagnostic Process

### Step 1: Dream Outcome Analysis

> "People have deep, unchanging desires. Our goal is not to create desire. It is simply to channel that desire through our offer."

**What people really want:**
- To be perceived as beautiful
- To be respected
- To be perceived as powerful
- To be loved
- To increase their status

**CRITICAL INSIGHT:** It all comes down to STATUS.

> "Talk in terms of things your prospect believes will increase their status, and you will have drooling prospects."

**Evaluation:**

| Question | Score (0-1) | Evidence |
|----------|-------------|----------|
| Does the outcome satisfy a deep desire? | | |
| Is it clearly articulated? | | |
| Is it specific and measurable? | | |
| Does it increase the avatar's perceived STATUS? | | |

**Pro Tip:** Frame benefits in terms of status gained from the viewpoint of OTHERS.

Example: "If you buy this golf club, your drive will increase by 40 yards. Your golf buddies' jaws will drop when they see your ball sail 40 yards past theirs... they'll ask what changed... only you'll know."

---

### Step 2: Perceived Likelihood of Achievement Analysis

> "People pay for certainty. How much would you pay to be a plastic surgeon's 10,000th patient versus their first?"

**Evaluation:**

| Question | Score (0-1) | Evidence |
|----------|-------------|----------|
| Is there documented social proof? | | |
| Are there guarantees that reduce risk? | | |
| Do you have credibility/authority? | | |
| Is the track record of results communicated? | | |

---

### Step 3: Time Delay Analysis

> "Time delay is the time between a client purchasing and receiving the promised benefit. The shorter the distance, the more valuable."

**Two elements:**
1. **Long-term outcome** — what they buy
2. **Short-term experience** — what keeps them around

**QUICK WINS are mandatory.**

> "Try to incorporate short-term and immediate wins for a client. Be creative. They just need to know they're on the right path."

**Evaluation:**

| Question | Score (0-1) | Evidence |
|----------|-------------|----------|
| Are there quick wins in the first days? | | |
| Is the timeline clearly communicated? | | |
| Are there "fast track" or accelerated options? | | |
| Are intermediate milestones celebrated? | | |

**Pro Tip: Fast Beats Free**

> "The only thing that beats 'free' is 'fast'. People will pay for speed."

Examples:
- MVD vs DMV: Pay $50 to skip the line
- FedEx vs USPS: "When it absolutely has to be there overnight"
- Uber vs Walking

---

### Step 4: Effort & Sacrifice Analysis

> "Decreasing the effort and sacrifice, or at least the perceived effort and sacrifice, can massively increase the appeal of your offer."

**Classic Comparison: Fitness vs Liposuction**

| Aspect | Fitness | Liposuction |
|--------|---------|-------------|
| Effort | High (daily exercise, meal prep) | Low (show up for surgery) |
| Sacrifice | High (time, favorite foods, social life) | Low (few days recovery) |
| Tolerated price | ~$100/mo | ~$25,000 |

> "This is why 'done for you' services are almost always more expensive than 'do it yourself'."

**Evaluation:**

| Question | Score (0-1) | Evidence |
|----------|-------------|----------|
| Are there "done-for-you" elements? | | |
| Is client effort minimized? | | |
| Is sacrifice (time, money, social) low? | | |
| Is the process convenient? | | |

---

## Output: Complete Diagnostic

```yaml
value_equation_diagnostic:
  offer_name: ""
  date: ""

  binary_scores:  # 0 or 1 (Hormozi uses binary scale for comparison)
    dream_outcome: 0
    perceived_likelihood: 0
    time_delay: 0  # 1 = fast, 0 = slow
    effort_sacrifice: 0  # 1 = low, 0 = high

  total_score: "/4"

  perception_analysis:
    current_perception: ""
    perception_gaps: []
    psychological_solutions: []  # Not just logical

  comparison_benchmark:
    # Compare with market alternative (like Fitness vs Lipo)
    your_offer:
      time_to_result: ""
      effort_required: ""
      price_tolerance: ""
    market_alternative:
      time_to_result: ""
      effort_required: ""
      price_tolerance: ""

  diagnosis:
    strongest_variable: ""
    weakest_variable: ""
    status_connection: ""  # How does the offer increase status?
    quick_wins_available: []

  recommendations:
    - priority: 1
      variable: ""
      current_state: ""
      target_state: ""
      action: ""
      type: "logical | psychological"

    - priority: 2
      variable: ""
      current_state: ""
      target_state: ""
      action: ""
      type: "logical | psychological"

  value_score_projection:
    current: "/4"
    projected: "/4"
```

---

## Comparison Example: Meditation vs Xanax

Both offer: Relaxation, decreased anxiety, well-being.

| Variable | Meditation | Xanax |
|----------|------------|-------|
| Dream Outcome | 1 ✓ | 1 ✓ |
| Likelihood of Achievement | 0 (requires practice) | 1 (works for most) |
| Time Delay | 0 (weeks/months) | 1 (30 minutes) |
| Effort & Sacrifice | 0 (daily practice) | 1 (swallow pill) |
| **TOTAL** | **1/4** | **4/4** |

> "This is why Xanax is a multi-billion dollar product while I don't know of almost any multi-billion dollar meditation businesses."

---

## Scorecard Template (Output Obrigatório)

Após completar o diagnóstico, preencha este scorecard:

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                    EQUAÇÃO DE VALOR - SCORECARD DE DIAGNÓSTICO               ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ Oferta: ___________________________ Data: _______________                    ║
║ Avatar: ___________________________                                          ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║              (Dream Outcome × Perceived Likelihood)                          ║
║   VALOR = ─────────────────────────────────────────────                      ║
║              (Time Delay × Effort & Sacrifice)                               ║
║                                                                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ VARIÁVEL                        │ SCORE │ EVIDÊNCIA                          ║
╠─────────────────────────────────┼───────┼────────────────────────────────────╣
║ 1. Dream Outcome (↑ AUMENTAR)   │ 0 / 1 │                                    ║
║    - Satisfaz desejo profundo?  │       │                                    ║
║    - Conecta com STATUS?        │       │                                    ║
║    - Específico e mensurável?   │       │                                    ║
╠─────────────────────────────────┼───────┼────────────────────────────────────╣
║ 2. Likelihood (↑ AUMENTAR)      │ 0 / 1 │                                    ║
║    - Prova social documentada?  │       │                                    ║
║    - Garantias que reduzem risco│       │                                    ║
║    - Credibilidade comunicada?  │       │                                    ║
╠─────────────────────────────────┼───────┼────────────────────────────────────╣
║ 3. Time Delay (↓ DIMINUIR)      │ 0 / 1 │ (1 = rápido, 0 = lento)            ║
║    - Quick wins nos primeiros   │       │                                    ║
║      dias?                      │       │                                    ║
║    - Opções aceleradas?         │       │                                    ║
║    - Timeline clara?            │       │                                    ║
╠─────────────────────────────────┼───────┼────────────────────────────────────╣
║ 4. Effort & Sacrifice (↓ DIM)   │ 0 / 1 │ (1 = baixo, 0 = alto)              ║
║    - Elementos "done-for-you"?  │       │                                    ║
║    - Esforço minimizado?        │       │                                    ║
║    - Processo conveniente?      │       │                                    ║
╠─────────────────────────────────┴───────┴────────────────────────────────────╣
║                                                                              ║
║  TOTAL: ___/4                                                                ║
║                                                                              ║
║  ┌────────────────────────────────────────────────────────────────────────┐  ║
║  │ INTERPRETAÇÃO:                                                         │  ║
║  │ 4/4 = Oferta excepcional, pronta para scaling                         │  ║
║  │ 3/4 = Boa oferta, otimizar variável fraca                             │  ║
║  │ 2/4 = Oferta mediana, rebuild necessário                              │  ║
║  │ 1/4 = Oferta fraca, reavaliar mercado e proposta                      │  ║
║  │ 0/4 = Não é oferta, é commodity                                       │  ║
║  └────────────────────────────────────────────────────────────────────────┘  ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ DIAGNÓSTICO:                                                                 ║
║                                                                              ║
║ Variável mais FORTE: _______________________                                 ║
║ Variável mais FRACA: _______________________ ← PRIORIDADE DE AÇÃO            ║
║                                                                              ║
║ Conexão com STATUS: _________________________________________________        ║
║                                                                              ║
║ Quick Wins disponíveis:                                                      ║
║ 1. _______________________________________________________________           ║
║ 2. _______________________________________________________________           ║
║ 3. _______________________________________________________________           ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ COMPARAÇÃO COM ALTERNATIVA DE MERCADO:                                       ║
║                                                                              ║
║                      │ SUA OFERTA  │ ALTERNATIVA │ QUEM GANHA?               ║
║ ─────────────────────┼─────────────┼─────────────┼───────────────            ║
║ Time to Result       │             │             │                           ║
║ Effort Required      │             │             │                           ║
║ Price Tolerance      │             │             │                           ║
║ Likelihood           │             │             │                           ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ RECOMENDAÇÕES (ordenadas por impacto):                                       ║
║                                                                              ║
║ #1 [VARIÁVEL: _______] TIPO: □ Lógica  □ Psicológica                        ║
║    Estado Atual: ___________________________________________________         ║
║    Estado Alvo:  ___________________________________________________         ║
║    Ação: ___________________________________________________________         ║
║                                                                              ║
║ #2 [VARIÁVEL: _______] TIPO: □ Lógica  □ Psicológica                        ║
║    Estado Atual: ___________________________________________________         ║
║    Estado Alvo:  ___________________________________________________         ║
║    Ação: ___________________________________________________________         ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## Quality Gate

```yaml
diagnostic_quality:
  - [ ] All 4 variables evaluated with evidence
  - [ ] Perception vs Reality analyzed
  - [ ] Psychological solutions considered (not just logical)
  - [ ] STATUS connection identified
  - [ ] Quick wins mapped
  - [ ] Comparison with market alternative done
  - [ ] Scorecard template preenchido
```

## Handoff

After diagnosis:
- → `hormozi-offers` to rebuild offer if score < 2/4
- → `hormozi-pricing` to optimize price if score >= 3/4
- → `hormozi-copy` to improve PERCEPTION of variables

---
*Task: HZ_OFFER_002 | Agent: hormozi-offers | Version: 2.0*
*Source: $100M Offers - Chapter 6: The Value Equation*



<\!-- Criado com Squad Creator do AIOSPRO por @oalanicolas e @pedrovalerio | 2026-02-10 -->
