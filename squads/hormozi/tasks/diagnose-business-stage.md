# diagnose-business-stage

## Metadata
```yaml
task_id: HZ_STRATEGY_001
agent: hormozi-offers
type: diagnostic
complexity: low
estimated_time: 10-15min
source: "$100M Offers - Chapter 10: The Sales-Fulfillment Continuum"
```

## Purpose

Diagnose which stage a business is in to determine the correct strategic focus. Different stages require OPPOSITE strategies - what works in Stage 1 kills you in Stage 3.

> "Create flow. Monetize the flow. Then add friction." — Alex Hormozi

---

## The Sales-Fulfillment Continuum

There's a continuum between ease of sales and ease of fulfillment:

```
EASY TO SELL                                      EASY TO FULFILL
(Hard to deliver)                                 (Hard to sell)
     |--------------------------------------------------|

     DFY                    DWY                    DIY
(Done For You)        (Done With You)        (Do It Yourself)
```

**The trade-off:**
- More DFY = Easier to SELL, harder to DELIVER
- More DIY = Easier to DELIVER, harder to SELL

---

## The 3 Business Stages

### STAGE 1: OVERDELIVERY (Months 1-6)

**Characteristics:**
- New business or new offer
- Few testimonials/case studies
- Cash flow is priority
- Reputation building phase

**Correct Strategy:**
```yaml
stage_1_strategy:
  fulfillment_focus: "MAXIMUM (overdeliver like crazy)"
  price_positioning: "Competitive to generate volume"
  margin_tolerance: "Low or negative OK"
  primary_goal: "Create success stories + cash flow"
  sales_ease: "Make it EASY to buy (remove all friction)"
```

**Hormozi Quote:**
> "In the beginning, you should be so focused on fulfillment that you're almost going backwards on the business. You're trying to make your clients so successful that they become your marketing."

**Metrics to Track:**
- Number of client success stories
- Quality of testimonials
- Cash collected (not profit)
- Client satisfaction scores

---

### STAGE 2: SYSTEMATIZATION (Months 6-12)

**Characteristics:**
- Proven offer with case studies
- Consistent client flow
- Fulfillment team stretched
- Ready to optimize

**Correct Strategy:**
```yaml
stage_2_strategy:
  fulfillment_focus: "MAINTAIN value while reducing cost"
  price_positioning: "Begin increasing"
  margin_tolerance: "Target 50-70%"
  primary_goal: "Build systems that scale"
  sales_ease: "Add qualification criteria"
```

**Focus Areas:**
- Document processes (SOPs)
- Hire and train team
- Create automation
- Improve unit economics

**Metrics to Track:**
- Cost of delivery per client
- Time to deliver results
- Team capacity utilization
- Profit per client

---

### STAGE 3: OPTIMIZATION (Months 12+)

**Characteristics:**
- Proven, systematized offer
- Strong case studies and social proof
- Efficient fulfillment
- Ready for premium positioning

**Correct Strategy:**
```yaml
stage_3_strategy:
  fulfillment_focus: "OPTIMIZE for margin"
  price_positioning: "PREMIUM (2-10x increase)"
  margin_tolerance: "Target 80%+"
  primary_goal: "Maximum profitability"
  sales_ease: "Add positive friction (qualification)"
```

**Hormozi Quote:**
> "Once you have the flow, monetize it. Then add friction to filter for the best clients."

**Focus Areas:**
- Price increases
- Client qualification
- Premium tiers
- Reduce low-value activities

**Metrics to Track:**
- Profit margin
- LTV:CAC ratio
- Client quality score
- Time to result

---

## Diagnostic Questions

Answer these to determine your stage:

### Question Set A: Proof & Reputation

| Question | Stage 1 Signal | Stage 2/3 Signal |
|----------|----------------|------------------|
| How many documented case studies do you have? | < 10 | > 10 |
| What's your best testimonial? | Generic or none | Specific with numbers |
| Can you prove ROI with data? | No | Yes |
| Do referrals come naturally? | Rarely | Regularly |

**Score:** ___/4 (count Stage 2/3 signals)

### Question Set B: Operations & Systems

| Question | Stage 1 Signal | Stage 2/3 Signal |
|----------|----------------|------------------|
| Are processes documented (SOPs)? | No or minimal | Yes, comprehensive |
| Can someone else deliver without you? | No | Yes |
| Do you have delivery team? | No or 1-2 people | 3+ people |
| Is fulfillment predictable? | Highly variable | Consistent |

**Score:** ___/4 (count Stage 2/3 signals)

### Question Set C: Economics & Margins

| Question | Stage 1/2 Signal | Stage 3 Signal |
|----------|------------------|----------------|
| What's your gross margin? | < 60% | > 60% |
| What's your LTV:CAC? | < 3:1 | > 3:1 |
| Can you raise prices 50% without losing clients? | No | Yes |
| Do you turn away clients? | Never | Sometimes |

**Score:** ___/4 (count Stage 3 signals)

---

## Stage Determination Matrix

```yaml
diagnosis_matrix:
  if:
    question_set_a_score: "0-1"
  then:
    stage: "STAGE 1: OVERDELIVERY"

  if:
    question_set_a_score: "2-4"
    question_set_b_score: "0-2"
  then:
    stage: "STAGE 2: SYSTEMATIZATION"

  if:
    question_set_a_score: "3-4"
    question_set_b_score: "3-4"
    question_set_c_score: "2-4"
  then:
    stage: "STAGE 3: OPTIMIZATION"
```

---

## Output: Stage Diagnosis

```yaml
business_stage_diagnosis:
  date: ""
  business_name: ""

  diagnostic_scores:
    proof_reputation: "/4"
    operations_systems: "/4"
    economics_margins: "/4"

  determined_stage: "STAGE 1 | STAGE 2 | STAGE 3"

  current_state:
    primary_challenge: ""
    bottleneck: ""

  recommended_focus:
    primary_goal: ""
    key_metric_to_track: ""
    actions_to_take:
      - priority: 1
        action: ""
      - priority: 2
        action: ""
      - priority: 3
        action: ""

  what_NOT_to_do:
    - ""
    - ""

  transition_triggers:
    move_to_next_stage_when: ""
```

---

## Stage-Specific Anti-Patterns

### Stage 1 Anti-Patterns (AVOID THESE)
- [ ] Trying to maximize profit before proving the offer
- [ ] Adding friction/qualification before having case studies
- [ ] Raising prices before having social proof
- [ ] Scaling ads before proving the model works
- [ ] Hiring before you know what to teach them

### Stage 2 Anti-Patterns (AVOID THESE)
- [ ] Continuing to overdeliver without systematizing
- [ ] Keeping prices low when you have proof
- [ ] Founder doing everything instead of training team
- [ ] Not documenting what works

### Stage 3 Anti-Patterns (AVOID THESE)
- [ ] Keeping prices low when you have premium positioning
- [ ] Accepting any client instead of qualifying
- [ ] Not optimizing for margin
- [ ] Staying stagnant (not testing new offers)

---

## Handoff

After diagnosis:

**Stage 1:**
- → `create-grand-slam-offer.md` (build irresistible offer)
- → `execute-rule-of-100.md` (generate volume)
- Focus: PROVE the model

**Stage 2:**
- → `diagnose-churn-rate.md` (optimize retention)
- → `design-onboarding-sequence.md` (systematize)
- Focus: BUILD the machine

**Stage 3:**
- → `golden-ratios-veto.md` (validate economics)
- → `diagnose-value-equation.md` (optimize offer)
- → Route to `hormozi-pricing` for price optimization
- Focus: MAXIMIZE profitability

---

## Quality Gate

```yaml
diagnosis_quality:
  - [ ] All 3 question sets answered with evidence
  - [ ] Stage determined using matrix (not gut feeling)
  - [ ] Recommended actions specific to stage
  - [ ] Anti-patterns for current stage identified
  - [ ] Transition triggers defined
```

---
*Task: HZ_STRATEGY_001 | Agent: hormozi-offers | Version: 1.0*
*Source: $100M Offers - Chapter 10: Sales-Fulfillment Continuum*



<\!-- Criado com Squad Creator do AIOSPRO por @oalanicolas e @pedrovalerio | 2026-02-10 -->
