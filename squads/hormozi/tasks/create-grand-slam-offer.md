# create-grand-slam-offer

## Metadata
```yaml
task_id: HZ_OFFER_001
agent: hormozi-offers
type: creation
complexity: high
estimated_time: 45-60min
source: "$100M Offers - Chapter 9: Problems & Solutions"
```

## Purpose
Create a complete Grand Slam Offer — an offer so good people feel stupid saying no.

> "Making an offer so good people would feel stupid saying no." — Alex Hormozi

## The Story: From Unsellable $99/mo to Grand Slam Offer

> "When I started my gym, I struggled. I couldn't even sell people on a $99/mo bootcamp. People said: 'LA Fitness is $29/mo. That's expensive.' I even tried getting people to start for FREE. They said they wouldn't bother."

The insight that changed everything:
> "I thought — what do they really want? No one wants a membership; they want to lose weight."

---

## The 3 Steps of a Grand Slam Offer

### STEP 1: Identify the Dream Outcome

> "I wasn't selling my membership anymore. I wasn't selling the plane flight. I was selling the VACATION."

**Example:** Lose 20 pounds in 6 weeks
- Big dream outcome = lose 20 pounds
- Decreased time delay = 6 weeks

**Your dream outcome:**
- What do they REALLY want to achieve?
- What would "arriving at the destination" look like?
- What would they like to experience?

```yaml
dream_outcome:
  destination: ""  # What they want to feel/be/have
  specific_result: ""
  timeframe: ""
```

---

### STEP 2: List ALL Problems

> "When listing problems, think about what happens IMMEDIATELY BEFORE and IMMEDIATELY AFTER someone uses your product/service. What is the 'next' thing they will need help with?"

**GOLDEN RULE:** The more problems you think of, the more problems you can solve = more valuable offer.

**Use the 4 Value Drivers as a guide:**

| Value Driver | Problem Type |
|--------------|--------------|
| Dream Outcome | "This won't be worth it financially" |
| Perceived Likelihood | "It won't work for ME specifically" / "I won't be able to stick with it" / "External factors will get in the way" |
| Effort & Sacrifice | "This will be too hard/confusing" / "I won't like it" / "I'll be bad at it" |
| Time | "It will take too long to do" / "I'm too busy" / "It will take too long to work" |

**PROCESS: List each main thing someone HAS TO DO:**

#### Example: Weight Loss

**First thing: Buy healthy food**
1. It's hard, confusing, I won't like it
2. It will take too much time
3. It's expensive
4. I won't be able to keep this up forever
5. My family's needs will get in the way
6. If I travel, I won't know what to buy

**Next thing: Cook healthy food**
1. It's hard, confusing, I'll be bad at it
2. It will take too much time
3. It's expensive, not worth it
4. I won't be able to keep this up
5. My family's needs will get in the way
6. If I travel, I won't know how to cook healthy

**Next thing: Eat healthy food**
1. etc...

**Next thing: Exercise regularly**
1. etc...

> "What I showed here is not just four problems. We have 16 main problems with two to four sub-problems underneath. So, 32 to 64 problems total."

---

### STEP 3: Transform Problems into Solutions

> "Simply transform them into solutions by thinking: 'What would I need to SHOW someone to solve this problem?'"

**Technique: Add "HOW TO" and flip the problem**

#### PROBLEM → SOLUTION

**PROBLEM: Buying healthy food is hard, confusing, I won't like it**
→ **SOLUTION:** How to make buying healthy food easy and enjoyable, so anyone can do it (especially busy moms!)

**PROBLEM: Buying healthy food takes too much time**
→ **SOLUTION:** How to buy healthy food quickly

**PROBLEM: Buying healthy food is expensive**
→ **SOLUTION:** How to buy healthy food for LESS than your current grocery bill

**PROBLEM: Buying healthy food is unsustainable**
→ **SOLUTION:** How to make buying healthy food require LESS effort than buying unhealthy food

**PROBLEM: My family's needs will get in the way**
→ **SOLUTION:** How to buy healthy food for you AND your family at the same time

**PROBLEM: If I travel, I won't know what to buy**
→ **SOLUTION:** How to get healthy food when traveling

---

## Input Required

```yaml
offer_context:
  business: ""
  target_avatar: ""
  current_offer: ""  # What you sell today
  current_price: ""
  main_complaints: []  # What clients complain about
```

---

## Execution Template

### PHASE 1: Dream Outcome (5 min)

```yaml
dream_outcome:
  what_they_really_want: ""
  what_arriving_looks_like: ""
  how_they_would_feel: ""
  specific_result: ""
  timeframe: ""
```

### PHASE 2: Problem List (15-20 min)

List EACH STEP the client needs to take, then list ALL problems in each step:

```yaml
problems_list:
  step_1:
    name: ""  # Ex: "Buy healthy food"
    problems:
      dream_outcome: []  # "Not worth it"
      likelihood: []  # "Won't work for me"
      effort_sacrifice: []  # "Too hard"
      time: []  # "Takes too long"

  step_2:
    name: ""
    problems:
      dream_outcome: []
      likelihood: []
      effort_sacrifice: []
      time: []

  # Continue for all steps...
```

### PHASE 3: Solution List (15-20 min)

For EACH problem, create a solution using "How to...":

```yaml
solutions_list:
  step_1:
    - problem: ""
      solution: "How to..."
    - problem: ""
      solution: "How to..."

  step_2:
    - problem: ""
      solution: "How to..."
```

### PHASE 4: Operationalization (10-15 min)

For each solution, define HOW you'll deliver it:

```yaml
delivery_vehicles:
  - solution: ""
    vehicle: ""  # Ex: Template, checklist, video, done-for-you, access
    format: ""
    cost_to_you: ""
```

---

### PHASE 3.5: Sales-Fulfillment Continuum (Strategic Planning)

> "Crie fluxo. Monetize o fluxo. Depois adicione atrito." — Alex Hormozi

**PRINCÍPIO EVOLUTIVO:** A oferta deve evoluir estrategicamente ao longo do tempo. NÃO tente otimizar tudo desde o início.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CONTINUUM VENDAS-CUMPRIMENTO                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  INÍCIO ──────────────────────────────────────────────────────── FIM       │
│                                                                             │
│  Fácil de VENDER ◄───────────────────────────────────► Fácil de CUMPRIR    │
│  (DFY = Done For You)                              (DIY = Do It Yourself)   │
│                                                                             │
│  • Margens baixas                                  • Margens altas          │
│  • Alto custo de entrega                           • Baixo custo de entrega │
│  • Alta conversão                                  • Baixa conversão        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**OS 3 ESTÁGIOS DE EVOLUÇÃO:**

#### ESTÁGIO 1: OVERDELIVERY MASSIVO (Meses 1-6)

```yaml
objetivo: Criar casos de sucesso e fluxo de caixa
estrategia:
  - Entregue 10x mais que o prometido
  - Aceite margens baixas ou até negativas
  - Foque em RESULTADOS, não em eficiência
  - Documente cada caso de sucesso (prova social)
metricas:
  - Net Promoter Score (NPS) > 9
  - Casos de sucesso documentados > 10
  - Depoimentos em vídeo > 5
```

#### ESTÁGIO 2: SISTEMATIZAÇÃO (Meses 6-12)

```yaml
objetivo: Aumentar margens mantendo satisfação
estrategia:
  - Use lucros para criar sistemas e automações
  - Transforme processos manuais em templates/checklists
  - Crie conteúdo gravado para substituir calls ao vivo
  - Treine equipe para delegar execução
metricas:
  - Custo de entrega reduzido em 50%
  - NPS mantido > 8
  - Churn < 5% mensal
```

#### ESTÁGIO 3: OTIMIZAÇÃO (Meses 12+)

```yaml
objetivo: Máxima lucratividade com mínimo esforço
estrategia:
  - Adicione "atrito positivo" (qualificação de clientes)
  - Aumente preços baseado em resultados comprovados
  - Crie tiers de oferta (DIY, DWY, DFY)
  - Escale com time ou tecnologia
metricas:
  - Margem bruta > 80%
  - LTV:CAC > 3:1
  - FECC:CAC > 2:1
```

**DIAGNÓSTICO OBRIGATÓRIO:**

Antes de executar qualquer estratégia de oferta, pergunte:

```yaml
business_stage_check:
  question: "Em que estágio está este negócio?"

  indicators_stage_1:
    - Menos de 10 casos de sucesso documentados
    - Processo de entrega ainda sendo definido
    - Foco em validação de mercado

  indicators_stage_2:
    - 10+ casos de sucesso
    - Processo definido mas manual
    - Foco em eficiência operacional

  indicators_stage_3:
    - Processo sistematizado e escalável
    - Resultados previsíveis e documentados
    - Foco em maximização de lucro
```

---

### PHASE 5: Naming (Fórmula MAGICO)

> "O nome é o primeiro passo da venda. Um nome magnético faz o trabalho de marketing por você."

**A FÓRMULA MAGICO:**

| Letra | Elemento | Descrição | Exemplo |
|-------|----------|-----------|---------|
| **M** | Mecanismo Único | O que torna diferente | "Sistema Neurológico" |
| **A** | Alvo Atraente | Avatar ultra-específico | "Coaches High-Ticket" |
| **G** | Grafia Diferente | Elemento memorável/diferenciador | Uso de "Neurológico" |
| **I** | Ideia que Ajuda | Benefício/solução clara | "Vendas B2B" |
| **C** | Convergência Temporal | Prazo específico | "90 Dias" |
| **O** | Objetivo Final | Resultado transformador | "20 Clientes Premium" |

**TEMPLATE DE NAMING:**

```
"O [MECANISMO] de [IDEIA] para [ALVO]: [OBJETIVO] em [CONVERGÊNCIA]"
```

**EXEMPLOS APLICADOS:**

| Oferta Original | Aplicando MAGICO |
|-----------------|------------------|
| "Curso de Marketing" | "O Arsenal de Aquisição Infinita para Agências Boutique: Primeiro Cliente em 14 Dias" |
| "Mentoria de Vendas" | "O Sistema de Fechamento Inevitável para Consultores B2B: 10 Contratos High-Ticket em 60 Dias" |
| "Programa de Emagrecimento" | "O Protocolo Metabólico Noturno para Executivas 40+: 8kg em 6 Semanas Sem Academia" |

**CHECKLIST DE NAMING:**

```yaml
name_quality:
  - [ ] Tem mecanismo único (diferenciador)?
  - [ ] Especifica o avatar (não é genérico)?
  - [ ] Tem elemento memorável/graficamente diferente?
  - [ ] Comunica o benefício claramente?
  - [ ] Inclui prazo específico?
  - [ ] Promete resultado transformador?
  - [ ] É impossível comparar com concorrentes?
```

---

## Output: Complete Grand Slam Offer

```yaml
grand_slam_offer:
  # FASE 0: Diagnóstico de Estágio
  business_stage:
    current_stage: ""  # 1 = Overdelivery, 2 = Sistematização, 3 = Otimização
    cases_documented: 0
    delivery_status: ""  # "manual", "semi-automated", "automated"
    recommended_focus: ""  # O que focar dado o estágio

  # FASE 1: Dream Outcome
  name: ""  # Fórmula MAGICO
  name_breakdown:
    mecanismo: ""
    alvo: ""
    grafia: ""
    ideia: ""
    convergencia: ""
    objetivo: ""
  dream_outcome: ""
  timeframe: ""

  # FASE 2-3: Estrutura
  structure:
    core_offer:
      description: ""
      deliverables: []

    solutions_by_problem:
      - problem: ""
        solution: ""
        vehicle: ""  # DFY, DWY, DIY, Template, Software, etc.
        perceived_value: ""
        cost_to_deliver: ""  # Alto/Médio/Baixo

  # FASE 4: Value Stack
  value_stack:
    item_1:
      name: ""
      value: ""
      type: ""  # Core, Bonus, Guarantee
    item_2:
      name: ""
      value: ""
      type: ""
    # etc...

  # FASE 5: Precificação
  pricing:
    total_value: ""
    price: ""
    value_to_price_ratio: ""  # Deve ser >= 10:1
    anchor_presentation: ""  # Como apresentar o valor total

  # FASE 6: Escassez/Urgência
  scarcity_urgency:
    type: ""  # genuine_scarcity, genuine_urgency, both
    mechanism: ""  # Vagas limitadas, prazo, bônus expira
    justification: ""  # Por que é genuína

  # Output Final
  headline: ""  # Dream Outcome + Timeframe
  one_liner: ""  # Pitch de 1 linha
```

---

## Complete Example: Fitness Gym

**Dream Outcome:** Lose 20 pounds in 6 weeks

**Problems → Solutions → Vehicles:**

| Problem | Solution | Vehicle |
|---------|----------|---------|
| Don't know what to buy | How to do healthy shopping in 20min | Ready-made shopping list |
| Cooking takes too long | Meals in under 5min | 21 quick recipes |
| No time for gym | 20min workouts that work | App with timer |
| I'll quit | Accountability system | Group + daily check-ins |
| I travel a lot | Hotel workouts with no equipment | Travel workout videos |
| My family doesn't support | How to include family | Family-friendly plan |

**Result:** From $99/mo that nobody bought → $2,997 that people compete for spots.

---

## Quality Gate

```yaml
offer_quality:
  foundation:
    - [ ] Business stage diagnosed (1, 2, or 3)
    - [ ] Strategy aligned with current stage
    - [ ] Market validated (4 indicators PASS)

  structure:
    - [ ] Dream Outcome clearly articulated
    - [ ] Minimum 20 problems listed
    - [ ] Each problem has corresponding solution
    - [ ] Each solution has defined delivery vehicle
    - [ ] Solutions cover all 4 value drivers

  pricing:
    - [ ] Perceived value >= 10x price
    - [ ] Anchor presentation defined
    - [ ] Escassez/urgência é GENUÍNA

  naming:
    - [ ] Nome segue fórmula MAGICO
    - [ ] Impossível comparar com concorrentes
    - [ ] Inclui prazo específico
    - [ ] Avatar está no nome

  final_test:
    - [ ] "No brainer test": Would I buy this?
    - [ ] "Incomparability test": Can this be compared to anything else?
    - [ ] "Stage alignment": Strategy matches business maturity?
```

## Handoff

After completion:
- → `hormozi-pricing` to set price and anchoring
- → `hormozi-copy` to write sales page
- → `hormozi-audit` to validate offer

---
*Task: HZ_OFFER_001 | Agent: hormozi-offers | Version: 2.0*
*Source: $100M Offers - Chapter 9: Problems & Solutions*



<\!-- Criado com Squad Creator do AIOSPRO por @oalanicolas e @pedrovalerio | 2026-02-10 -->
