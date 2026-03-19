# validate-market-selection

## Metadata
```yaml
task_id: HZ_FOUNDATION_001
agent: hormozi-offers
type: validation
complexity: medium
estimated_time: 20-30min
source: "$100M Offers - Chapter 4: Finding The Right Market"
prerequisite: NONE (first task before any offer creation)
veto_checklist: checklists/market-validation-veto.md
```

## Purpose

Validate a market BEFORE investing time in offer creation. This is a GATE task - if market fails validation, DO NOT proceed to offer creation.

> "A great offer to a bad market will always fail. Your market is the most important decision you'll make." — Alex Hormozi

---

## The "Starving Crowd" Principle

> "If you were going to open a hot dog stand, what is the one thing that would guarantee your success more than anything else? Not location. Not quality. Not price. A STARVING CROWD."

**Your job is NOT to create demand. It's to CHANNEL existing demand.**

---

## Input Required

```yaml
market_candidate:
  name: ""
  avatar_description: ""
  problem_they_have: ""
  current_solution_they_use: ""
  why_considering_this_market: ""
```

---

## The 4 Market Indicators

Execute each indicator evaluation in sequence. **If ANY indicator scores < 7/10, STOP and reconsider market.**

### Indicator 1: MASSIVE PAIN (Dor Massiva)

> "The pain is the pitch. People must desperately need what you're selling."

**Scoring Rubric:**

| Score | Description |
|-------|-------------|
| 10 | Life/business threatening, extreme urgency |
| 9 | Significant financial losses ($10k+/year) |
| 8 | Affects quality of life daily |
| 7 | Very bothersome, have tried to solve before |
| 6 | Recognized problem, but not urgent |
| 5 | Problem exists, but they live with it |
| 1-4 | Nice-to-have, not need-to-have |

**Diagnostic Questions:**
1. Have they LOST SLEEP over this problem?
2. Have they SPENT MONEY trying to solve it?
3. Do they ACTIVELY TALK about this problem?
4. Would they feel SHAME if others knew about it?

**Evidence Collection:**
```yaml
pain_evidence:
  lost_sleep: "yes/no + explanation"
  money_spent: "yes/no + how much"
  active_discussion: "yes/no + where"
  shame_factor: "yes/no + context"
  score: "/10"
  pass_threshold: "true/false"  # >= 7
```

---

### Indicator 2: PURCHASING POWER (Poder de Compra)

> "You can't sell to people who can't pay. No money = no deal, no matter how good your offer."

**Scoring Rubric:**

| Score | Description |
|-------|-------------|
| 10 | Dedicated budget, easy approval, B2B with clear ROI |
| 9 | High income, significant discretionary spending |
| 8 | Upper-middle class, history of premium purchases |
| 7 | Can finance/pay installments, access to credit |
| 6 | Limited income but prioritize this area |
| 5 | Would need to sacrifice other things |
| 1-4 | No financial resources |

**Signals of Purchasing Power:**
- B2B with revenue > $500k/year
- Professionals with income > $75k/year
- Business owners with team > 5 people
- History of high-ticket purchases in the niche

**Diagnostic Questions:**
1. Do they ALREADY PAY for similar solutions?
2. Do they have DISPOSABLE INCOME after essentials?
3. Do they INVEST in other areas (courses, tools)?
4. Do they have ACCESS TO CREDIT if needed?

**Evidence Collection:**
```yaml
purchasing_power_evidence:
  existing_spending: "yes/no + on what"
  income_level: "estimate or range"
  investment_history: "yes/no + examples"
  credit_access: "yes/no"
  score: "/10"
  pass_threshold: "true/false"  # >= 7
```

---

### Indicator 3: EASY TO TARGET (Facil de Atingir)

> "If you can't find them, you can't sell to them. They must congregate somewhere you can reach efficiently."

**Scoring Rubric:**

| Score | Description |
|-------|-------------|
| 10 | Own list, active community, specific association |
| 9 | Facebook/LinkedIn groups with >10k active members |
| 8 | Specific conferences/events for the niche |
| 7 | Publications/podcasts they consume |
| 6 | Hashtags/keywords with reasonable volume |
| 5 | Scattered, but findable with effort |
| 1-4 | No clear congregation |

**Diagnostic Questions:**
1. Are there PROFESSIONAL ASSOCIATIONS for this audience?
2. Are there ONLINE GROUPS with >5k active members?
3. Are there specific EVENTS/CONFERENCES?
4. Are there INFLUENCERS they follow?
5. Are there PUBLICATIONS (magazines, blogs, podcasts)?

**Evidence Collection:**
```yaml
targeting_evidence:
  associations:
    - name: ""
      member_count: ""
  online_groups:
    - platform: ""
      name: ""
      members: ""
  events:
    - name: ""
      frequency: ""
      attendees: ""
  influencers:
    - name: ""
      following: ""
  publications:
    - name: ""
      type: ""
  score: "/10"
  pass_threshold: "true/false"  # >= 7
```

---

### Indicator 4: GROWING MARKET (Crescendo)

> "A rising tide lifts all boats. A growing market gives you tailwind that makes everything easier."

**Scoring Rubric:**

| Score | Description |
|-------|-------------|
| 10 | Growth > 20% per year, clear trend |
| 9 | Growth 15-20% per year |
| 8 | Growth 10-15% per year |
| 7 | Growth 5-10% per year, stable positive |
| 6 | Stable market, no growth/decline |
| 5 | Growth < 5% per year |
| 1-4 | Declining market |

**Diagnostic Questions:**
1. Does Google Trends show POSITIVE trend over 3 years?
2. Is number of COMPETITORS increasing? (demand signal)
3. Is STARTUP INVESTMENT in the sector growing?
4. Is the DEMOGRAPHIC growing?

**Evidence Collection:**
```yaml
growth_evidence:
  google_trends: "positive/stable/negative + screenshot"
  competitor_growth: "yes/no + data"
  startup_investment: "yes/no + examples"
  demographic_growth: "yes/no + data"
  industry_reports: "source + key finding"
  score: "/10"
  pass_threshold: "true/false"  # >= 7
```

---

## The Lloyd Case Study

**Why This Validation Exists:**

> "Lloyd was a fitness trainer. Excellent at what he did. But he chose to sell to 'personal trainers' — a market with high structural churn (many quit the profession). Even with identical skills, he failed in this market. When he pivoted to 'established gym owners' (same skillset), he thrived."

**Lesson:** The same person, with the same skills, FAILS in a bad market and THRIVES in a good market. The market is the dominant variable.

---

## Output: Market Validation Report

```yaml
market_validation:
  date: ""
  evaluated_by: ""

  market:
    name: ""
    avatar: ""

  indicator_scores:
    massive_pain: "/10"
    purchasing_power: "/10"
    easy_to_target: "/10"
    growing: "/10"
    total: "/40"

  veto_gate:
    all_indicators_above_7: "true/false"
    total_above_28: "true/false"
    PASS_OR_VETO: "PASS | VETO"

  if_veto:
    weakest_indicator: ""
    proposed_adjustment: ""
    alternative_market: ""

  if_pass:
    strongest_indicator: ""
    main_acquisition_channels: []
    estimated_market_size: ""

  next_steps:
    if_pass: "Proceed to → create-grand-slam-offer.md"
    if_veto: "Execute adjusted market validation OR explore alternative"
```

---

## Market Comparison Matrix

If evaluating multiple markets, use this comparison:

| Indicator | Market A | Market B | Market C |
|-----------|----------|----------|----------|
| Massive Pain | /10 | /10 | /10 |
| Purchasing Power | /10 | /10 | /10 |
| Easy to Target | /10 | /10 | /10 |
| Growing | /10 | /10 | /10 |
| **TOTAL** | /40 | /40 | /40 |
| **Verdict** | | | |

**Rule:** Choose market with highest total, AS LONG AS all indicators >= 7.

---

## Quality Gate

```yaml
validation_quality:
  - [ ] All 4 indicators evaluated with EVIDENCE (not just opinion)
  - [ ] Scores based on rubric, not gut feeling
  - [ ] At least 2 sources cited per indicator
  - [ ] Comparison with alternative market done (if applicable)
  - [ ] Veto/Pass decision clearly stated
  - [ ] Next steps defined
```

---

## Handoff

After validation:
- **If PASS** → `create-grand-slam-offer.md`
- **If VETO** → Adjust avatar OR evaluate alternative market
- **After adjustment** → Re-run this validation task

---

## Anti-Pattern Warning: Niche Slapping

> "If you keep jumping from niche to niche thinking 'this one doesn't work', you deserve a 'niche slap'. Pick a market that passes the 4 indicators and COMMIT. Success comes from iteration WITHIN a niche, not from searching for a 'perfect' niche."

**Rule:** Do NOT abandon a validated market until you've executed the "Rule of 100" (see `execute-rule-of-100.md`)

---
*Task: HZ_FOUNDATION_001 | Agent: hormozi-offers | Version: 1.0*
*Source: $100M Offers - Chapter 4: Finding The Right Market*



<\!-- Criado com Squad Creator do AIOSPRO por @oalanicolas e @pedrovalerio | 2026-02-10 -->
