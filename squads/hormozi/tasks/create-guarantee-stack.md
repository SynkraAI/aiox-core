# create-guarantee-stack

## Metadata
```yaml
task_id: HZ_OFFER_003
agent: hormozi-offers
type: creation
complexity: medium
estimated_time: 20-30min
source: "$100M Offers - Chapter 15: Guarantees"
```

## Purpose
Design a guarantee stack that obliterates risk and removes every reason not to buy.

> "The biggest objection to any product or service being sold is... risk. Reversing risk is an immediate way to make any offer more attractive."

## The Power of Guarantees

Jason Fladlien once stated he'd seen conversion on an offer **multiply 2-4x** simply by changing the quality of the guarantee.

## The Math (Don't Be Emotional)

> "If you close 130% more people, and your refund percentage doubles from 5% to 10%, you still made 1.23x the money, or 23% more."

**Example:**
- Without strong guarantee: 100 sales, 5 refunds (5%) = 95 net sales
- With strong guarantee: 130 sales, 13 refunds (10%) = 117 net sales
- **Result: +23% profit**

> "For a guarantee not to be worth it, the increase in sales would have to be 100% offset by people who refunded. That's unlikely."

---

## The Structure of a Guarantee

> "What gives a guarantee power is a conditional statement: If you don't get X result in Y time, we will do Z."

**Without the "or what" portion, it sounds weak and watered down.**

❌ **Bad Example:** "We'll get you 20 clients guaranteed."
✅ **Better Example:** "You'll get 20 clients in your first 30 days, or we refund your money + your ad dollars spent with us."

---

## The 4 Types of Guarantees

### 1. UNCONDITIONAL (Strongest)

> "Basically a test drive where they pay first then see if they like it."

**Examples:**
- Full refund no questions asked
- 50% refund
- Refund of ad spend and any auxiliary costs
- You pay for a competitor's program instead
- Money back + $1,000 additional

**Jason Fladlien's Script:**
> "I'm not asking you to decide yes or no today... I'm asking you to make a fully informed decision, that's all. The only way to make a fully informed decision is from the inside, not the outside. So you get in and see if everything we say on this webinar is true and valuable for you. Then, if it is, that's when you decide to keep it. If it's not for you, no hard feelings... If you're not happy, I'm not happy. For any reason whatsoever, if you want your money back, you can have it."

---

### 2. CONDITIONAL (Better Than Money Back)

> "Includes terms and conditions for the guarantee. These are where you can get VERY creative."

**Insight:** In a perfect world, 100% of clients would qualify for the conditional guarantee, but will have achieved their result and won't want to take it.

**Types:**

#### a) "Specific Result" Guarantee
> "You will increase your sales by 30% in 90 days or we'll give you 2x your money back."

#### b) "I'll Do It Until You Get It" Guarantee
> "If you do every part of this program for 90 days and don't add at least $10,000/mo in recurring revenue to your business, I'll pay your monthly fees until you do."

**EXTREME VARIATION — Double Down:**
> "If they didn't get 10 clients in the first month, you say: ok, let's get 20 clients in 2 months. I tried this and 19 of 20 people accepted."

#### c) "Extended Service Credit" Guarantee
> "If you don't X by date Y, then we'll give you 6 EXTRA months of the product at no cost."

#### d) "Pay with Performance" Guarantee
> "You owe nothing for our services unless you are DELIGHTED. We guarantee to increase your sales by 20% in 20 days or you owe nothing."

#### e) "Personal Compensation" Guarantee
> "If you don't add $10,000/mo... I'll fly to your office and stay there working with you every day until we've got it set up."

#### f) "Others Perceiving Value" Guarantee
> "If your spouse doesn't look at you twice in 60 days, we'll pay for both your meal plan and workout plan for the next year."

---

### 3. ANTI-GUARANTEE

> "When you explicitly state 'all sales are final'. You must create a creative reason why."

**When to use:**
- Consumable products (vitamins, supplements)
- Services already rendered
- Experiences/events
- Revenue share arrangements

**Script for consumables:**
> "I want to make sure you get results. For that reason, we don't offer refunds. If you buy our course and decide you don't want to follow it or do the work, it won't be fair to the students who are here working hard."

**Script for revenue share:**
> "Look, we don't charge anything upfront. I only make money when you make money. I'll invest my time and resources in you. I just need you to be fully committed."

---

### 4. IMPLIED GUARANTEE

> "Any performance-based offer. Revenue share, profit share, triggers, monetary bonuses."

**Concept:** If I don't perform, I don't get paid.

**Script:**
> "I charge exactly $0 for my services. I only make money when you make money. Period. Also, I only get a share of PROFIT, not gross revenue. That means if you don't become more profitable, I make nothing."

---

## STACKING Guarantees

> "A seasoned salesperson understands that, like bonuses, you can actually STACK guarantees."

**Example:**
- Unconditional 30 days no questions asked
- + Conditional: triple your money back in 90 days

**Combining with Bonuses:**

[UNCONDITIONAL] + [BONUS]
> "If you sign up today, I'll include my unconditional 90-day no-questions-asked guarantee..."

[CONDITIONAL] + [BONUS]
> "If you don't add $10k/mo to your business by the end of the program, assuming you go through each module in 90 days, I'll write all your sales copy for a year (value $50,000)."

---

## Pro Tip: Name Your Guarantee

> "If you're going to give a guarantee, spice it up. Instead of 'satisfaction' or some other vanilla word, describe it more strongly."

❌ **Generic:** "30-Day Money Back Satisfaction Guarantee"

✅ **Creative #1:** "In 30 days, if you wouldn't jump into shark-infested waters to retrieve our product, we'll give you every dollar back."

✅ **Creative #2:** "Baby Seal Clubbing Guarantee — After 30 days using our services, if you wouldn't club a baby seal to continue as a client, you don't have to pay a penny."

---

## Input Required

```yaml
guarantee_context:
  offer_name: ""
  price_point: ""
  delivery_model: ""  # Digital, service, physical, consumable
  main_risk_objections: []
  cost_of_fulfillment: ""  # High/Low (affects guarantee type)
  competitor_guarantees: ""
```

---

## Output: Complete Guarantee Stack

```yaml
guarantee_stack:
  offer: ""

  primary_guarantee:
    type: ""  # Unconditional, Conditional, Anti, Implied
    creative_name: ""
    structure: "If you don't [RESULT] in [TIME], we will [ACTION]"
    result: ""
    time: ""
    action: ""
    full_script: ""

  secondary_guarantee:
    type: ""
    name: ""
    structure: ""

  stack_combination:
    formula: ""  # Ex: [UNCONDITIONAL] + [CONDITIONAL] + [BONUS]
    combined_script: ""

  fine_print:
    conditions: []
    proof_required: ""

  presentation_script: |
    "And look at this..."
```

---

## Quality Gate

```yaml
guarantee_quality:
  - [ ] Has "If X in Y, we Z" structure
  - [ ] Creative name (not generic)
  - [ ] Type appropriate for business model
  - [ ] Addresses main risk objections
  - [ ] Math favors (sales increase > refund increase)
  - [ ] Presentation script ready
```

## Handoff

After completion:
- → `hormozi-copy` for sales page integration
- → `hormozi-audit` for legal/risk review

---
*Task: HZ_OFFER_003 | Agent: hormozi-offers | Version: 2.0*
*Source: $100M Offers - Chapter 15: Guarantees*



<\!-- Criado com Squad Creator do AIOSPRO por @oalanicolas e @pedrovalerio | 2026-02-10 -->
