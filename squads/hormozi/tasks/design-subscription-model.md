# design-subscription-model

## Metadata
```yaml
task_id: HZ_MODELS_002
agent: hormozi-models
type: creation
complexity: high
estimated_time: 45-60min
source: "Subscription Model SOP — Continuity Offers"
sop_reference: squads/hormozi/sops/subscription-model-sop.md
```

## Purpose
Design a subscription/continuity offer that creates predictable recurring revenue.

> "The goal of business is to make a customer once and collect money forever." — Alex Hormozi

---

## The 3 Continuity Offer Types

### Type 1: Bonus Continuity
**What:** Give something extra for subscribing
**Example:** "Stay subscribed and get weekly live coaching calls"
**Best for:** Adding value to existing product

### Type 2: Discount Continuity
**What:** Discount for committing to recurring
**Example:** "$97/month vs $147 one-time per month"
**Best for:** Price-sensitive markets

### Type 3: Waived Fee Continuity
**What:** Setup fee waived if they subscribe
**Example:** "$500 setup fee waived with 12-month commitment"
**Best for:** High setup cost services

---

## Subscription Architecture

### Monthly vs Annual

| Factor | Monthly | Annual |
|--------|---------|--------|
| Cash up front | Lower | Higher |
| Churn risk | Higher | Lower |
| Commitment | Lower | Higher |
| LTV potential | Depends | Locked in |

### Pricing Strategy

```
Annual = Monthly × 10 (get 2 months free)
Quarterly = Monthly × 2.75 (slight discount)
Monthly = Full price
```

### Value Ladder

```
Free → Entry Subscription → Core Subscription → Premium Subscription

Free: Lead magnet, builds list
Entry ($9-29/mo): Low barrier, high volume
Core ($47-197/mo): Main offer, best margin
Premium ($297+/mo): High touch, select clients
```

---

## Retention Architecture

### Week 1: Activation
- Quick win onboarding
- First value delivered
- Community introduction

### Month 1: Habit Formation
- Regular touchpoints
- Progress tracking
- Success celebration

### Month 3+: Results & Expansion
- Case study creation
- Referral ask
- Upsell to annual

---

## Execution Steps

### Step 1: Define Core Value
What ongoing value justifies recurring payment?

```yaml
core_value:
  what_they_get_monthly: ""
  why_they_need_it_ongoing: ""
  cost_to_deliver: ""
```

### Step 2: Choose Continuity Type
Bonus, Discount, or Waived Fee?

### Step 3: Set Pricing Tiers
Monthly, quarterly, annual with appropriate discounts.

### Step 4: Design Retention System
What keeps them month after month?

### Step 5: Create Cancellation Flow
- Exit survey
- Win-back offer
- Pause option

---

## Key Metrics

| Metric | Target | Warning |
|--------|--------|---------|
| Monthly Churn | <5% | >10% |
| Annual Retention | >70% | <50% |
| LTV:CAC | >3:1 | <2:1 |
| Time to First Value | <7 days | >30 days |

---

## Churn Prevention Checklist

- [ ] Quick win in first 48 hours
- [ ] Clear next steps always visible
- [ ] Community or accountability built in
- [ ] Regular "you're making progress" messages
- [ ] Annual option with meaningful savings
- [ ] Exit survey to learn why people leave
- [ ] Win-back campaign for churned customers



<\!-- Criado com Squad Creator do AIOSPRO por @oalanicolas e @pedrovalerio | 2026-02-10 -->
