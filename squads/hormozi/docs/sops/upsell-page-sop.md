# Upsell Page SOP

> **Source:** BLUEPRINT UPSELL: A ARQUITETURA DA MULTIPLICACAO DE AOV - Alex Hormozi
> **Pattern:** SC-PE-001 (SOP Extraction Standard)
> **Version:** 1.0.0
> **Extracted:** 2026-02-10

---

## Part 1: Purpose

Multiply Average Order Value (AOV) by presenting strategic offers immediately after purchase, while the customer is in their peak psychological state.

**Core Equation:**
```
AOV Multiplier = Main Product + (Upsell #1 Take Rate × Upsell Price) + (Downsell Take Rate × Downsell Price)

Example:
- 100 buyers × R$997 = R$99,700
- 30 accept upsell (R$497) = R$14,910
- 15 accept downsell (R$197) = R$2,955
- TOTAL: R$117,565 (AOV increases 17.8%)
```

**Business Impact:** Well-executed upsells can increase AOV by 1.8-2.5x the main product value.

**Guiding Philosophy:** "O upsell nao e sobre ganhar mais dinheiro do mesmo cliente. E sobre dar a ele as ferramentas para ter sucesso mais rapido. Quando voce pensa em acelerar o resultado dele, o dinheiro extra e consequencia."

---

## Part 2: Scope

### When This SOP Applies
- Immediately after a customer completes a purchase
- Post-checkout confirmation page flow
- The "Golden Window" of 3-7 seconds while dopamine is elevated

### When This SOP Does NOT Apply
- Pre-purchase upsells (cross-sells on cart page)
- Email upsell sequences (days/weeks later)
- In-app or membership area upgrades

### Business Types
- Digital products (courses, programs, software)
- Physical products with accessories/upgrades
- Service businesses with premium tiers
- Any business with complementary offers

---

## Part 3: Preconditions

| Precondition | Requirement | Validation |
|--------------|-------------|------------|
| Purchase Completed | Customer just bought main product | Payment confirmed |
| One-Click Payment | Token from first purchase stored | Technical integration verified |
| Upsell Offer Ready | Complementary product/service exists | Offer positioned as accelerator |
| Timer System | Countdown mechanism available | Technical implementation ready |
| Downsell Variant | Lower-priced alternative exists | Pricing strategy defined |
| Social Proof | Upsell-specific testimonials collected | 2-3 short, specific testimonials |
| VSL (Optional) | 2-4 minute video prepared | Script follows upsell structure |

---

## Part 4: Psychological Foundation & Four Sections Framework

### The Post-Purchase Mental State

```
┌─────────────────────────────────────────────────────────────────────────┐
│           ESTADO MENTAL POS-COMPRA (Peak Buying State)                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   DOPAMINA ELEVADA          CONSISTENCIA COGNITIVA                      │
│   ├── Cerebro recompensando  ├── Tendencia a manter                     │
│   │   a decisao              │   o padrao de "sim"                      │
│   └── Peak emotional state   └── Commitment + consistency               │
│                                                                         │
│   CARTAO NA MAO             MOMENTO DE MAXIMA CONFIANCA                 │
│   ├── Barreira de pagamento  ├── Acabou de confiar em voce              │
│   │   ja superada            └── Trust at highest point                 │
│   └── Zero friction to buy                                              │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│   A JANELA DE OURO: 3-7 segundos antes da dopamina comecar a cair       │
└─────────────────────────────────────────────────────────────────────────┘
```

### Peak-End Rule Psychology

"A pagina de upsell explora o 'Peak-End Rule' psicologico. O cliente esta no pico emocional da compra. Cada elemento mantem esse estado elevado enquanto remove sistematicamente qualquer friccao adicional."

### Four Sections Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    UPSELL PAGE: 4 SECTIONS                              │
├─────────────────┬────────────────────┬──────────────────────────────────┤
│ SECTION A       │ SECTION B          │ SECTION C                        │
│ TOPO CRITICO    │ CORPO PERSUASIVO   │ CONVERSAO RAPIDA                 │
├─────────────────┼────────────────────┼──────────────────────────────────┤
│ Above the Fold  │ Lean, not long     │ Quick decision elements          │
│ 4 Elements      │ 5 Elements         │ 5 Elements                       │
├─────────────────┴────────────────────┴──────────────────────────────────┤
│                        SECTION D                                        │
│                   MULTIPLOS UPSELLS SEQUENCE                            │
│                        3 Elements                                       │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Part 5: Process Steps

### SECTION A: O TOPO CRITICO (Above the Fold)

#### Step A.1: Headline de Continuidade
| Field | Value |
|-------|-------|
| **Description** | Create headline that maintains "yes" momentum, not interrupts it |
| **Cognitive Type** | Synthesis (psychological continuity) |
| **Automation Potential** | MEDIUM - Templates available, customization needed |
| **Executor** | Hybrid (AI generates, human approves) |
| **Precondition** | Main product name and buyer name available |
| **Output** | Continuity headline that validates purchase |
| **Guardrails** | NEVER question previous purchase, create new anxiety, or imply main product is insufficient |
| **Decision Rule** | "Headline must feel like continuation, not new pitch" |

**Templates Testados:**
```
"ESPERE! Sua compra foi confirmada, mas..."
"[Nome], voce desbloqueou uma oferta exclusiva"
"Parabens! Antes de acessar seu [produto], veja isso..."
```

**Exemplo Matador:** "Joao, Sua Inscricao Foi Confirmada! Mas 87% dos Alunos Que Pegaram Este Upgrade Tiveram Resultados 3x Mais Rapidos..."

---

#### Step A.2: Subheadline de Complementaridade
| Field | Value |
|-------|-------|
| **Description** | Position upsell as multiplier of results, not replacement |
| **Cognitive Type** | Synthesis |
| **Automation Potential** | MEDIUM |
| **Executor** | Hybrid |
| **Precondition** | Upsell benefit clearly defined |
| **Output** | Subheadline showing multiplicative value |
| **Guardrails** | Must include time-limit indicator ("Oferta valida apenas agora") |
| **Decision Rule** | "Upsell = resultado adicional, nao produto alternativo" |

**Formula:**
```
"Adicione [RESULTADO ESPECIFICO] ao que voce acabou de comprar
e [BENEFICIO MULTIPLICADOR] - Oferta valida apenas agora"
```

**Exemplo Real:** "Adicione nosso Sistema de Ads Automatizados ao seu programa e comece a receber leads no piloto automatico enquanto implementa o curso principal"

---

#### Step A.3: Barra de Progresso Psicologica
| Field | Value |
|-------|-------|
| **Description** | Create visual progress indicator showing "incomplete mission" |
| **Cognitive Type** | Perception (visual psychology) |
| **Automation Potential** | HIGH - Template implementation |
| **Executor** | Worker |
| **Precondition** | Page template ready |
| **Output** | 3-step progress bar with current step highlighted |
| **Guardrails** | Step 1 must have green checkmark (reinforces positive decision) |
| **Decision Rule** | "Checkmark verde do passo 1 reforca a decisao positiva anterior" |

**Visual:**
```
[✓] Passo 1: Programa Principal Garantido
[?] Passo 2: Acelerar Resultados (Voce esta aqui)
[ ] Passo 3: Acessar Area de Membros
```

---

#### Step A.4: Timer de Decisao
| Field | Value |
|-------|-------|
| **Description** | Implement aggressive countdown timer (more urgent than main page) |
| **Cognitive Type** | Execution |
| **Automation Potential** | HIGH - Technical implementation |
| **Executor** | Worker |
| **Precondition** | Timer mechanism configured |
| **Output** | 10-minute countdown with sound alert |
| **Guardrails** | Timer must be genuine one-time offer; sound at last 60 seconds |
| **Decision Rule** | "Upsell e one-time offer genuino - nunca >10 minutos" |

**Implementacao:**
- Timer de 10 minutos (nao 24h)
- Mensagem: "Oferta expira quando sair desta pagina"
- Som de tique-taque nos ultimos 60 segundos

**Script de Urgencia:** "Esta oferta aparece APENAS uma vez. Quando sair desta pagina, o preco volta para R$ [preco cheio]"

---

### SECTION B: O CORPO PERSUASIVO (Mais Lean que a Principal)

#### Step B.5: Video Upsell Curto
| Field | Value |
|-------|-------|
| **Description** | Create 2-4 minute VSL that maintains attention without causing fatigue |
| **Cognitive Type** | Synthesis + Creativity |
| **Automation Potential** | LOW - Requires video production |
| **Executor** | Human |
| **Precondition** | Script written, recording equipment ready |
| **Output** | 2-4 minute upsell video |
| **Guardrails** | NEVER exceed 4 minutes; must follow exact structure |
| **Decision Rule** | "Mantem atencao sem causar fadiga pos-compra" |

**Estrutura do VSL de Upsell:**
```
0-10s:   Parabenizar e validar compra
10-30s:  Revelar o "gap" que o upsell preenche
30-90s:  Demonstrar o resultado adicional
90-180s: Stack de valor rapido
180-240s: CTA com urgencia
```

**Script de Abertura:** "Parabens! Voce acabou de tomar a melhor decisao para [resultado]. Mas descobri que alunos que tambem pegam [upsell] conseguem [resultado 3x maior]. Deixe-me mostrar rapidamente..."

---

#### Step B.6: Grafico "Com vs Sem"
| Field | Value |
|-------|-------|
| **Description** | Create visual comparison making incremental value obvious |
| **Cognitive Type** | Analysis + Visualization |
| **Automation Potential** | HIGH - Template with variable data |
| **Executor** | Worker |
| **Precondition** | Specific benefits of upsell defined |
| **Output** | Side-by-side comparison graphic |
| **Guardrails** | Must show clear velocity multiplier at bottom |
| **Decision Rule** | "Visualizacao torna o valor incremental obvio" |

**Formato Visual:**
```
SEM O UPGRADE:          COM O UPGRADE:
✓ Resultado em 90 dias  ✓ Resultado em 30 dias
✓ Suporte por email     ✓ Suporte 1-on-1 semanal
✓ 10 Templates          ✓ 147 Templates prontos
✗ Implementacao manual  ✓ Done-for-you setup
✗ Teste e erro          ✓ Roadmap personalizado

Velocidade: 1x          Velocidade: 3-5x
```

---

#### Step B.7: Mini Stack de Valor
| Field | Value |
|-------|-------|
| **Description** | Create simplified value stack with maximum 3 components |
| **Cognitive Type** | Synthesis |
| **Automation Potential** | HIGH - Template application |
| **Executor** | Worker |
| **Precondition** | Upsell components and values defined |
| **Output** | 3-item value stack with 5-10x perceived value |
| **Guardrails** | Perceived value must be 5-10x upsell price |
| **Decision Rule** | "Simplicidade acelera decisao - maximo 3 componentes" |

**Estrutura Lean:**
```
COMPONENTE PRINCIPAL .............. Valor R$ 2.997
BONUS RAPIDO #1 .................. Valor R$ 997
BONUS RAPIDO #2 .................. Valor R$ 500
                    TOTAL: R$ 4.494
                    HOJE APENAS: R$ 497
```

**Regra:** O valor percebido deve ser 5-10x o preco do upsell.

---

#### Step B.8: Prova Social Especifica do Upsell
| Field | Value |
|-------|-------|
| **Description** | Display testimonials specifically about the upsell value |
| **Cognitive Type** | Perception |
| **Automation Potential** | HIGH - Display templates |
| **Executor** | Worker |
| **Precondition** | Upsell-specific testimonials collected |
| **Output** | 2-3 short testimonials with photos |
| **Guardrails** | Testimonials must be about incremental value, not main product |
| **Decision Rule** | "Remove duvida sobre valor incremental" |

**Formato Ideal:**
```
"93% dos alunos que pegaram o [Upsell] dizem que
foi a melhor decisao que tomaram..."

[Foto] "O [upsell] cortou meu tempo de implementacao
em 75%. Resultados na primeira semana!" - Maria Silva
```

**Quantidade:** 2-3 depoimentos curtos e especificos sobre o upsell.

---

#### Step B.9: Garantia Empilhada
| Field | Value |
|-------|-------|
| **Description** | Present risk-removal guarantee that stacks on main guarantee |
| **Cognitive Type** | Synthesis |
| **Automation Potential** | HIGH - Script template |
| **Executor** | Worker |
| **Precondition** | Main product guarantee defined |
| **Output** | Stacked guarantee statement |
| **Guardrails** | Must clearly state original guarantee continues |
| **Decision Rule** | "Remove completamente o risco adicional" |

**Script Matador:**
```
"Sua garantia original CONTINUA VALENDO, e ainda adiciono:
Se o [Upsell] nao acelerar seus resultados em pelo menos 2x,
devolvemos 100% do valor do upgrade - e voce fica com tudo."
```

---

### SECTION C: ELEMENTOS DE CONVERSAO RAPIDA

#### Step C.10: Dois Botoes Apenas
| Field | Value |
|-------|-------|
| **Description** | Create binary choice buttons (yes/no) with clear hierarchy |
| **Cognitive Type** | Execution |
| **Automation Potential** | HIGH |
| **Executor** | Worker |
| **Precondition** | Button copy defined |
| **Output** | Two buttons with psychological positioning |
| **Guardrails** | Yes = green/large, No = gray/smaller; Fixed footer on mobile |
| **Decision Rule** | "Simplifica decisao para sim/nao - escolha binaria clara" |

**Botao SIM (Verde, Grande):** "SIM! Quero Resultados 3x Mais Rapidos →"

**Botao NAO (Cinza, Menor):** "Nao, prefiro ir mais devagar"

**Posicionamento:** Fixos no rodape em mobile.

---

#### Step C.11: Micro-Comparacao de Preco
| Field | Value |
|-------|-------|
| **Description** | Anchor upsell price in context of main purchase |
| **Cognitive Type** | Analysis (price anchoring) |
| **Automation Potential** | HIGH - Template with variables |
| **Executor** | Worker |
| **Precondition** | Main product price and upsell price defined |
| **Output** | Price comparison statement |
| **Guardrails** | Must show percentage and metaphor |
| **Decision Rule** | "Ancora valor no contexto da compra principal" |

**Script:**
```
Voce acabou de investir R$ 997 no programa principal.
Por apenas R$ 297 a mais (menos de 30% extra),
voce multiplica seus resultados por 3.

E como comprar um carro e deixar de pegar o seguro.
```

---

#### Step C.12: FAQ Ultra-Especifica
| Field | Value |
|-------|-------|
| **Description** | Answer the 3 (and only 3) upsell objections |
| **Cognitive Type** | Analysis |
| **Automation Potential** | HIGH - Standard template |
| **Executor** | Worker |
| **Precondition** | Pricing and guarantee details available |
| **Output** | 3-question FAQ section |
| **Guardrails** | NEVER more than 3 questions |
| **Decision Rule** | "As 3 unicas objecoes de upsell - nada mais" |

**As 3 Unicas Objecoes de Upsell:**
1. "Preciso disso agora ou posso pegar depois?"
2. "Isso nao deveria estar incluido no principal?"
3. "E se eu me arrepender?"

**Respostas que Convertem:**
1. "Este preco e exclusivo para agora. Depois volta para R$ 997"
2. "O principal resolve [problema A]. Isso acelera e automatiza"
3. "Mesma garantia do principal + 30 dias extras so pro upgrade"

---

#### Step C.13: Reassurance Bar
| Field | Value |
|-------|-------|
| **Description** | Display security and convenience indicators |
| **Cognitive Type** | Perception |
| **Automation Potential** | HIGH |
| **Executor** | Worker |
| **Precondition** | One-click payment configured |
| **Output** | Security badge bar |
| **Guardrails** | Must mention "same card already registered" |
| **Decision Rule** | "Mantem sensacao de seguranca" |

**Visual:**
```
🔒 Compra Segura | Mesmo cartao ja cadastrado |
Garantia Total | Acesso Imediato
```

---

#### Step C.14: Exit Intent Pop-up Downsell
| Field | Value |
|-------|-------|
| **Description** | Deploy downsell when user attempts to leave |
| **Cognitive Type** | Perception + Execution |
| **Automation Potential** | HIGH - Technical trigger |
| **Executor** | Worker |
| **Precondition** | Downsell offer and payment plan ready |
| **Output** | Exit intent modal with payment plan option |
| **Guardrails** | Trigger on mouse to X or back button |
| **Decision Rule** | "Ultima chance de capturar valor" |

**Gatilho:** Mouse indo para X ou botao voltar.

**Script:**
```
"ULTIMA CHANCE!
Ok, entendo que R$ 497 pode ser demais agora...
Que tal levar o mesmo upgrade por 3x de R$ 197?"
[SIM, QUERO PARCELADO] [Nao, obrigado]
```

---

### SECTION D: SEQUENCIA DE MULTIPLOS UPSELLS

#### Step D.15: Logica de Progressao
| Field | Value |
|-------|-------|
| **Description** | Define upsell sequence based on previous decisions |
| **Cognitive Type** | Judgment + Analysis |
| **Automation Potential** | HIGH - Rule-based routing |
| **Executor** | Worker |
| **Precondition** | Multiple upsell offers prepared |
| **Output** | Decision tree for upsell sequence |
| **Guardrails** | Each upsell priced relative to main product |
| **Decision Rule** | "Progressao baseada em aceitacao ou recusa anterior" |

**Upsell 1 (Complemento Direto):**
- 30-50% do valor principal
- Acelera resultado principal
- Target: 30% conversao

**Upsell 2 (Se recusou #1):**
- Versao "lite" do primeiro
- 15-25% do valor principal
- Target: 20% conversao

**Upsell 3 (Se aceitou #1):**
- Complemento premium
- 50-100% do valor principal
- Target: 15% dos que compraram #1

---

#### Step D.16: Thank You Page Optimization
| Field | Value |
|-------|-------|
| **Description** | Configure confirmation page with next steps and referral |
| **Cognitive Type** | Synthesis |
| **Automation Potential** | HIGH |
| **Executor** | Worker |
| **Precondition** | All purchases processed |
| **Output** | Optimized thank you page |
| **Guardrails** | Must include all 5 elements |
| **Decision Rule** | "Thank you page = inicio do onboarding" |

**Elementos da Pagina de Confirmacao:**
```
✓ Confirmacao visual da compra total
✓ Proximos passos numerados
✓ Link direto para area de membros
✓ Video de onboarding (2 min)
✓ Oferta de "Refer a Friend" com incentivo
```

---

#### Step D.17: One-Click Upsell Tecnico
| Field | Value |
|-------|-------|
| **Description** | Implement tokenized payment for friction-free purchase |
| **Cognitive Type** | Execution (technical) |
| **Automation Potential** | HIGH - Payment gateway configuration |
| **Executor** | Worker |
| **Precondition** | Payment gateway supports token storage |
| **Output** | One-click purchase capability |
| **Guardrails** | Must use token from first purchase; no re-entry |
| **Decision Rule** | "Remove TODA friccao de pagamento - 40-60% aumento conversao" |

**Implementacao:**
- Usa token do cartao da primeira compra
- Um clique = processamento instantaneo
- Sem re-digitacao de dados

**Aumento de Conversao:** 40-60% comparado a re-checkout.

**Proxima Acao Imediata:** "Configure o one-click upsell ANTES de criar a pagina. A friccao tecnica mata mais upsells que copy ruim."

---

## Part 6: Decision Rules

### DR-001: Upsell Pricing Classification
```yaml
rule: UPSELL_PRICING
trigger: Upsell offer design
condition:
  - IF upsell_type == "complemento_direto" THEN price = main_price × 0.30-0.50
  - IF upsell_type == "lite_version" THEN price = main_price × 0.15-0.25
  - IF upsell_type == "premium_addon" THEN price = main_price × 0.50-1.00
action: Set pricing within appropriate range
confidence: HIGH (Source: Secao D - Logica de Progressao)
```

### DR-002: Upsell Routing Based on Response
```yaml
rule: UPSELL_SEQUENCE_ROUTING
trigger: Customer response to upsell
condition:
  - IF accepted_upsell_1 == true THEN show_upsell_3_premium
  - IF rejected_upsell_1 == true THEN show_upsell_2_lite
  - IF rejected_all == true THEN show_thank_you_page
action: Route to appropriate next page
confidence: HIGH (Source: Secao D - Logica de Progressao)
```

### DR-003: Timer Behavior
```yaml
rule: TIMER_URGENCY
trigger: Page load
condition:
  - IF time_remaining > 60_seconds THEN silent_countdown
  - IF time_remaining <= 60_seconds THEN enable_ticking_sound
  - IF time_remaining == 0 THEN redirect_to_thank_you
action: Manage timer state and audio
confidence: HIGH (Source: Element 4 - Timer de Decisao)
```

### DR-004: Exit Intent Activation
```yaml
rule: EXIT_INTENT_DOWNSELL
trigger: Exit intent detected
condition:
  - IF mouse_toward_close == true OR back_button == true THEN show_downsell_popup
  - IF downsell_accepted == true THEN process_payment_plan
  - IF downsell_rejected == true THEN redirect_to_thank_you
action: Display downsell modal
confidence: HIGH (Source: Element 14 - Exit Intent Pop-up)
```

### DR-005: Value Stack Validation
```yaml
rule: VALUE_PERCEPTION_RATIO
trigger: Value stack creation
condition:
  - IF perceived_value >= upsell_price × 5 THEN "MINIMUM_ACCEPTABLE"
  - IF perceived_value >= upsell_price × 10 THEN "OPTIMAL"
  - IF perceived_value < upsell_price × 5 THEN "INSUFFICIENT - add value"
action: Validate value stack before publishing
confidence: HIGH (Source: Element 7 - Mini Stack de Valor)
```

### DR-006: Headline Validation
```yaml
rule: CONTINUITY_HEADLINE_CHECK
trigger: Headline creation
condition:
  - IF headline_questions_purchase == true THEN "FAIL - rewrite"
  - IF headline_creates_anxiety == true THEN "FAIL - rewrite"
  - IF headline_implies_insufficiency == true THEN "FAIL - rewrite"
  - ELSE "PASS - maintains momentum"
action: Validate headline before publishing
confidence: HIGH (Source: Element 1 - Headline de Continuidade)
```

---

## Part 7: Exceptions & Edge Cases

### Exception 1: Technical Payment Failure
**Trigger:** One-click payment fails
**Action:** Display manual payment form as backup
**Script:**
```
"Houve um pequeno problema tecnico. Por favor, confirme seus dados:"
[Pre-filled payment form with card info masked]
```

### Exception 2: Timer Expires Before Decision
**Trigger:** Customer still on page when timer hits zero
**Response:** Redirect to thank you page with soft recovery offer
**Implementation:** Send follow-up email within 1 hour offering limited extension

### Exception 3: Mobile Device Constraints
**Trigger:** Customer on mobile device
**Adjustments:**
- VSL autoplay with sound muted (add tap to unmute)
- Buttons fixed at bottom of viewport
- Simplify visual elements
- Single-column layout only

### Exception 4: Customer Requests More Information
**Trigger:** Customer contacts support before deciding
**Action:** Hot handoff to sales with upsell context
**Script:**
```
"Este cliente acabou de comprar [produto principal] e esta
considerando o upgrade. Ele tem duvidas sobre [topic]."
```

### Exception 5: Very Low Take Rate (<10%)
**Trigger:** Upsell conversion significantly below target
**Diagnosis Checklist:**
1. Is one-click working? (Technical friction)
2. Is timer too aggressive? (Trust issue)
3. Is value stack strong enough? (Value perception)
4. Is headline creating interruption? (Momentum broken)
5. Is VSL too long? (Fatigue)

---

## Part 8: Outputs

| Output | Format | Destination | Frequency |
|--------|--------|-------------|-----------|
| Take Rate Report | Dashboard | Marketing Manager | Daily |
| AOV Multiplier | Metric | Executive | Weekly |
| Time on Page | Analytics | Optimization Team | Daily |
| Exit Intent Conversion | Metric | Marketing | Weekly |
| Downsell Take Rate | Metric | Marketing | Weekly |

### Key Metrics to Track
```
PRIMARY:
├── Upsell #1 Take Rate (target: >25%)
├── Total AOV Multiplier (target: 1.8-2.5x)
└── Average Time on Page (target: <90 seconds)

SECONDARY:
├── Downsell Take Rate
├── Exit Intent Modal Conversion
├── VSL Completion Rate
├── Button Click Distribution (Yes vs No)
└── Technical Failure Rate
```

---

## Part 9: Validation

### Take Rate Quality Gates

| Gate | Threshold | Action if Failed |
|------|-----------|------------------|
| Upsell #1 Take Rate | >25% | Review all elements for friction |
| AOV Multiplier | 1.8-2.5x main product | Adjust pricing/value stack |
| Time on Page | <90 seconds | Simplify page, shorten VSL |
| Exit Intent Conversion | >10% of exits | Review downsell offer |
| Technical Success Rate | >99% | Debug one-click implementation |

### Page Element Standards

| Element | Standard | Validation |
|---------|----------|------------|
| Headline | Continuity, not interruption | Pass DR-006 |
| VSL Length | 2-4 minutes max | Timer check |
| Value Stack | 5-10x perceived value | Pass DR-005 |
| FAQ | Exactly 3 questions | Count check |
| Progress Bar | 3 steps with checkmark on step 1 | Visual check |
| Timer | 10 minutes max, sound at 60s | Timer check |

---

## Part 10: Escalation Paths

| Situation | Escalate To | Timeline |
|-----------|-------------|----------|
| Take rate <15% | Marketing Lead | Within 24h |
| Technical payment failures >1% | Tech Support | Immediately |
| Customer complaints about pressure | Product Manager | Same day |
| AOV multiplier declining | Revenue Team | Weekly review |
| Legal/compliance concerns | Legal Team | Immediately |

---

## Part 11: Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-02-10 | SOP Extractor | Initial extraction from BLUEPRINT UPSELL |

---

## Appendix A: The Mathematics of Upsells

### Example Calculation
```
100 compradores x R$997 = R$99.700
30 aceitam upsell de R$497 = R$14.910
15 aceitam downsell de R$197 = R$2.955
TOTAL: R$117.565 (AOV aumenta 17.8%)
```

### Golden Rules
1. **"Those who pay more, pay more attention"** - E quem presta mais atencao, tem mais resultados. E um circulo virtuoso.
2. **Setup First:** "Configure o one-click upsell ANTES de criar a pagina. A friccao tecnica mata mais upsells que copy ruim."
3. **Speed Matters:** "Voce tem 3-7 segundos antes da dopamina comecar a cair."

---

## Appendix B: Headline Templates

### Continuity Headlines (Use These)
```
"ESPERE! Sua compra foi confirmada, mas..."
"[Nome], voce desbloqueou uma oferta exclusiva"
"Parabens! Antes de acessar seu [produto], veja isso..."
"[Nome], Sua Inscricao Foi Confirmada! Mas 87% dos Alunos Que Pegaram Este Upgrade Tiveram Resultados 3x Mais Rapidos..."
```

### What NEVER To Do (Avoid These Patterns)
- Questionar a compra anterior
- Criar nova ansiedade
- Parecer que a compra inicial e insuficiente

---

## Appendix C: VSL Script Template

```
[0-10 segundos]
"Parabens! Voce acabou de tomar a melhor decisao para [resultado principal]."

[10-30 segundos]
"Mas descobri que alunos que tambem pegam [nome do upsell] conseguem
[resultado especifico] em [tempo mais rapido]. Deixe-me mostrar rapidamente..."

[30-90 segundos]
[Demonstrar o resultado adicional com exemplos/prova]

[90-180 segundos]
"O que voce recebe:
- [Componente 1] - Valor R$ X
- [Bonus 1] - Valor R$ Y
- [Bonus 2] - Valor R$ Z
Total: R$ [soma], mas hoje apenas R$ [preco upsell]"

[180-240 segundos]
"Esta oferta aparece APENAS uma vez. Quando sair desta pagina,
o preco volta para R$ [preco cheio].
Clique no botao verde abaixo para adicionar ao seu pedido agora."
```

---

## Appendix D: Source References

> Mapeamento completo de cada elemento extraido para sua localizacao no material original.

### Psychological Foundation

| Elemento | Secao Original | Citacao Direta |
|----------|----------------|----------------|
| Estado Mental Pos-Compra | "FUNDAMENTO PSICOLOGICO DO UPSELL" | "Dopamina elevada: Cerebro recompensando a decisao" |
| Consistencia Cognitiva | "FUNDAMENTO PSICOLOGICO DO UPSELL" | "Consistencia cognitiva: Tendencia a manter o padrao de 'sim'" |
| Cartao na Mao | "FUNDAMENTO PSICOLOGICO DO UPSELL" | "Cartao na mao: Barreira de pagamento ja superada" |
| Momento de Maxima Confianca | "FUNDAMENTO PSICOLOGICO DO UPSELL" | "Momento de maxima confianca: Acabou de confiar em voce" |
| Janela de Ouro | "FUNDAMENTO PSICOLOGICO DO UPSELL" | "A Janela de Ouro: Voce tem 3-7 segundos antes da dopamina comecar a cair" |
| Peak-End Rule | "[JUSTIFICATIVA E PROXIMOS PASSOS]" | "A pagina de upsell explora o 'Peak-End Rule' psicologico" |

### Section A: O Topo Critico

| Elemento | Secao Original | Citacao Direta |
|----------|----------------|----------------|
| Element 1: Headline de Continuidade | "SECAO A: 1. HEADLINE DE CONTINUIDADE" | "Por que funciona: Mantem o momentum psicologico do 'sim'" |
| Templates de Headline | "Templates Testados" | "ESPERE! Sua compra foi confirmada, mas..." |
| Exemplo Matador | "Exemplo Matador" | "Joao, Sua Inscricao Foi Confirmada! Mas 87% dos Alunos..." |
| O que NUNCA fazer | "O que NUNCA fazer" | "Questionar a compra anterior; Criar nova ansiedade; Parecer que a compra inicial e insuficiente" |
| Element 2: Subheadline | "2. SUBHEADLINE DE COMPLEMENTARIDADE" | "Por que funciona: Posiciona o upsell como multiplicador, nao substituto" |
| Formula Subheadline | "Formula" | "Adicione [RESULTADO ESPECIFICO] ao que voce acabou de comprar..." |
| Element 3: Barra de Progresso | "3. BARRA DE PROGRESSO PSICOLOGICA" | "Por que funciona: Cria sensacao de 'missao incompleta'" |
| Hack Checkmark | "Hack" | "O checkmark verde do passo 1 reforca a decisao positiva anterior" |
| Element 4: Timer | "4. TIMER DE DECISAO" | "Por que funciona: Upsell e one-time offer genuino" |
| Timer Implementation | "Implementacao" | "Timer de 10 minutos (nao 24h); Mensagem: 'Oferta expira quando sair desta pagina'; Som de tique-taque nos ultimos 60 segundos" |

### Section B: O Corpo Persuasivo

| Elemento | Secao Original | Citacao Direta |
|----------|----------------|----------------|
| Element 5: Video Curto | "5. VIDEO UPSELL CURTO" | "Por que funciona: Mantem atencao sem causar fadiga pos-compra" |
| Estrutura VSL | "Estrutura do VSL de Upsell" | "0-10s: Parabenizar e validar compra; 10-30s: Revelar o 'gap'..." |
| Script de Abertura | "Script de Abertura" | "Parabens! Voce acabou de tomar a melhor decisao para [resultado]..." |
| Element 6: Grafico Com vs Sem | "6. O GRAFICO 'COM vs SEM'" | "Por que funciona: Visualizacao torna o valor incremental obvio" |
| Formato Visual | "Formato Visual" | "SEM O UPGRADE: Resultado em 90 dias / COM O UPGRADE: Resultado em 30 dias" |
| Element 7: Mini Stack | "7. MINI STACK DE VALOR" | "Por que funciona: Simplicidade acelera decisao" |
| Regra 5-10x | "Regra" | "O valor percebido deve ser 5-10x o preco do upsell" |
| Element 8: Prova Social | "8. PROVA SOCIAL ESPECIFICA DO UPSELL" | "Por que funciona: Remove duvida sobre valor incremental" |
| Quantidade Depoimentos | "Quantidade" | "2-3 depoimentos curtos e especificos sobre o upsell" |
| Element 9: Garantia | "9. GARANTIA EMPILHADA" | "Por que funciona: Remove completamente o risco adicional" |
| Script Garantia | "Script Matador" | "Sua garantia original CONTINUA VALENDO, e ainda adiciono..." |

### Section C: Elementos de Conversao Rapida

| Elemento | Secao Original | Citacao Direta |
|----------|----------------|----------------|
| Element 10: Dois Botoes | "10. DOIS BOTOES APENAS" | "Por que funciona: Simplifica decisao para sim/nao" |
| Botao SIM | "Botao SIM" | "SIM! Quero Resultados 3x Mais Rapidos →" |
| Botao NAO | "Botao NAO" | "Nao, prefiro ir mais devagar" |
| Posicionamento Mobile | "Posicionamento" | "Fixos no rodape em mobile" |
| Element 11: Micro-Comparacao | "11. MICRO-COMPARACAO DE PRECO" | "Por que funciona: Ancora valor no contexto da compra principal" |
| Analogia Carro/Seguro | "Script" | "E como comprar um carro e deixar de pegar o seguro" |
| Element 12: FAQ | "12. FAQ ULTRA-ESPECIFICA" | "As 3 Unicas Objecoes de Upsell" |
| 3 Objecoes | "As 3 Unicas Objecoes" | "1. Preciso disso agora ou posso pegar depois? 2. Isso nao deveria estar incluido? 3. E se eu me arrepender?" |
| Element 13: Reassurance Bar | "13. REASSURANCE BAR" | "Por que funciona: Mantem sensacao de seguranca" |
| Element 14: Exit Intent | "14. EXIT INTENT POP-UP DOWNSELL" | "Por que funciona: Ultima chance de capturar valor" |
| Gatilho Exit | "Gatilho" | "Mouse indo para X ou botao voltar" |

### Section D: Sequencia de Multiplos Upsells

| Elemento | Secao Original | Citacao Direta |
|----------|----------------|----------------|
| Element 15: Logica Progressao | "15. LOGICA DE PROGRESSAO" | "Upsell 1 (Complemento Direto): 30-50% do valor principal" |
| Upsell 1 Specs | "Upsell 1" | "30-50% do valor principal; Acelera resultado principal; Target: 30% conversao" |
| Upsell 2 Specs | "Upsell 2 (Se recusou #1)" | "Versao 'lite' do primeiro; 15-25% do valor principal; Target: 20% conversao" |
| Upsell 3 Specs | "Upsell 3 (Se aceitou #1)" | "Complemento premium; 50-100% do valor principal; Target: 15% dos que compraram #1" |
| Element 16: Thank You Page | "16. THANK YOU PAGE OPTIMIZATION" | "Elementos da Pagina de Confirmacao" |
| 5 Elementos TYP | "Elementos" | "Confirmacao visual; Proximos passos numerados; Link area de membros; Video onboarding; Refer a Friend" |
| Element 17: One-Click | "17. ONE-CLICK UPSELL TECNICO" | "Por que funciona: Remove TODA friccao de pagamento" |
| Aumento Conversao | "Aumento de Conversao" | "40-60% comparado a re-checkout" |

### Metricas & Dados

| Metrica | Secao Original | Citacao Direta |
|---------|----------------|----------------|
| Take Rate Target | "Metrica de Sucesso" | "Upsell #1: >25% take rate" |
| AOV Target | "Metrica de Sucesso" | "AOV Total: 1.8-2.5x valor do produto principal" |
| Time on Page Target | "Metrica de Sucesso" | "Tempo medio na pagina: <90 segundos (decisao rapida)" |
| Math Example | "A Matematica do Upsell" | "100 compradores x R$997 = R$99.700..." |
| AOV Increase Example | "A Matematica do Upsell" | "TOTAL: R$117.565 (AOV aumenta 17.8%)" |

### Filosofia & Principios

| Principio | Secao Original | Citacao Direta |
|-----------|----------------|----------------|
| Regra de Ouro | "Regra de Ouro" | "O upsell nao e sobre ganhar mais dinheiro do mesmo cliente. E sobre dar a ele as ferramentas para ter sucesso mais rapido" |
| Those Who Pay More | "Regra de Ouro" | "'Those who pay more, pay more attention' - E quem presta mais atencao, tem mais resultados" |
| Setup First | "Proxima Acao Imediata" | "Configure o one-click upsell ANTES de criar a pagina. A friccao tecnica mata mais upsells que copy ruim" |

---

## Gaps Identified

| Gap ID | Description | Severity | Clarification Needed |
|--------|-------------|----------|---------------------|
| GAP-001 | [INFERRED] Specific A/B test benchmarks | Medium | What test variations are recommended? |
| GAP-002 | [INFERRED] Mobile-specific conversion data | Low | Mobile vs desktop take rate differences |
| GAP-003 | [INFERRED] Downsell take rate targets | Medium | What is "good" for exit intent conversion? |
| GAP-004 | [INFERRED] VSL vs no-VSL comparison | Medium | When to skip VSL entirely |
| GAP-005 | [INFERRED] International payment considerations | Medium | One-click support varies by country |

---

**Validation Score: 11/11 parts complete**
**Source References: 17 elements mapped across 4 sections**
**Blueprint ready for squad creation.**



<\!-- Criado com Squad Creator do AIOSPRO por @oalanicolas e @pedrovalerio | 2026-02-10 -->
