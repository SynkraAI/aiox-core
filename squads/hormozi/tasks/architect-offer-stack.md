# architect-offer-stack

## Metadata
```yaml
task_id: HZ_OFFER_003
agent: hormozi-offers
type: creation
complexity: high
estimated_time: 45-60min
source: "Offer Architecture SOP — Stack Building"
sop_reference: squads/hormozi/sops/offer-architecture-sop.md
```

## Purpose
Create a complete offer architecture with core offer, bonuses, and upsells.

> "Your offer stack is not a list of features. It's a value ascension ladder where each step multiplies perceived value." — Alex Hormozi

---

## The Offer Stack Structure

```
┌─────────────────────────────────────────┐
│           PREMIUM UPSELL                │  $$$$$
│     (Done-for-you, VIP access)          │
├─────────────────────────────────────────┤
│           STANDARD UPSELL               │  $$$$
│     (Additional implementation help)    │
├─────────────────────────────────────────┤
│           CORE OFFER                    │  $$$
│     (Main product/service)              │
├─────────────────────────────────────────┤
│           BONUS STACK                   │
│     (Enhance core offer value)          │
├─────────────────────────────────────────┤
│           ORDER BUMP                    │  $
│     (Small add-on at checkout)          │
├─────────────────────────────────────────┤
│           LEAD MAGNET                   │  Free
│     (Entry point)                       │
└─────────────────────────────────────────┘
```

---

## Component Building

### Core Offer
The main thing they're buying.

```yaml
core_offer:
  name: ""
  promise: ""  # The transformation they get
  components:  # What's included
    - item: ""
      value: ""
      why_matters: ""
  delivery: ""  # How they receive it
  timeline: ""  # How long it takes
```

### Bonus Stack
Extras that increase perceived value.

**Rule:** Each bonus should solve an obstacle to using the core offer.

```yaml
bonus_stack:
  - bonus_name: ""
    solves_obstacle: ""  # Why they need this
    standalone_value: ""

  # Aim for 3-7 bonuses
```

### Order Bump
Small impulse add-on at checkout.

**Rule:** Should be <$50, instantly deliverable, complementary.

```yaml
order_bump:
  name: ""
  price: ""
  what_it_is: ""
  why_add_it: ""
```

### Upsells
Post-purchase value increases.

```yaml
upsells:
  - level: 1
    name: ""
    price: ""
    what_it_adds: ""

  - level: 2
    name: ""
    price: ""
    what_it_adds: ""
```

---

## Value Stack Math

### The 10x Rule

Total perceived value must be 10x+ asking price.

```
Core Offer Value:      $5,000
Bonus 1 Value:         $2,000
Bonus 2 Value:         $1,500
Bonus 3 Value:         $1,500
------------------------
Total Value:           $10,000

Asking Price:          $997

Value Ratio:           10:1 ✓
```

### Valuation Methods

1. **Replacement cost** — What would it cost to get this elsewhere?
2. **Time saved** — Hours × hourly rate
3. **Money made** — Revenue potential
4. **Problem solved** — Cost of the problem persisting

---

## Execution Steps

### Step 1: Define Core Offer
What is the main transformation?

### Step 2: Identify Obstacles
What might stop them from succeeding with core offer?

### Step 3: Create Bonus for Each Obstacle
Each bonus removes a barrier to success.

### Step 4: Build Value Stack
Assign values to each component.

### Step 5: Design Order Bump
What quick add-on helps at checkout?

### Step 6: Design Upsell Path
What's the next level for those who want more?

### Step 7: Validate 10x Rule
Is total value 10x+ the price?

---

## Output Format

```markdown
# [Offer Name] — Offer Stack Architecture

## Core Offer: [Name]
**Promise:** [Transformation statement]
**Price:** $[X]
**Includes:**
- [Component 1] — Value: $[X]
- [Component 2] — Value: $[X]
- [Component 3] — Value: $[X]

## Bonus Stack
1. **[Bonus 1]** — Value: $[X]
   Solves: [Obstacle]

2. **[Bonus 2]** — Value: $[X]
   Solves: [Obstacle]

3. **[Bonus 3]** — Value: $[X]
   Solves: [Obstacle]

## Order Bump: [Name]
**Price:** $[X]
**What:** [Description]

## Upsell 1: [Name]
**Price:** $[X]
**Adds:** [Additional value]

## Value Stack Summary
| Component | Value |
|-----------|-------|
| Core Offer | $[X] |
| Bonus 1 | $[X] |
| Bonus 2 | $[X] |
| Bonus 3 | $[X] |
| **Total** | **$[X]** |

**Asking Price:** $[X]
**Value Ratio:** [X]:1
```



<\!-- Criado com Squad Creator do AIOSPRO por @oalanicolas e @pedrovalerio | 2026-02-10 -->
