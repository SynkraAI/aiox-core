# create-bonus-stack

## Metadata
```yaml
task_id: HZ_OFFER_004
agent: hormozi-offers
type: creation
complexity: medium
estimated_time: 25-35min
source: "$100M Offers - Chapter 14: Bonuses"
```

## Purpose
Design a strategic bonus stack that expands the price-value gap until the prospect's mental "rubber band" snaps and they buy.

## The Fundamental Insight

> "A single offer is LESS VALUABLE than the same offer broken into its component parts and stacked as bonuses."

**Why every infomercial ever uses:** "But wait... there's more!"

> "They would sell a knife for $38.95 and then throw in 37 other knives, sharpeners, pans, and warranties to beat the prospect into submission."

**The mechanism:** We're increasing the price-value discrepancy by increasing the value delivered instead of cutting price.

---

## Golden Rule: Bonuses > Discounts

> "Whenever trying to close a deal, NEVER discount the main offer. It trains your clients that your prices are negotiable (which is terrible). Adding bonuses to increase value is vastly superior to cutting prices."

**Discount =** position of weakness
**Bonus =** position of strength and goodwill

---

## The 11 Bonus Bullets

When creating and presenting bonuses, ALWAYS:

1. **Offer them** (use the bullet package)

2. **Give them a special name** with a benefit in the title
   - ❌ "Onboarding checklist"
   - ✅ "First 7 Days Accelerator Kit"

3. **Tell them:**
   - a) How it relates to their problem
   - b) What it is
   - c) How you discovered/created it
   - d) How specifically it will improve their lives (faster, easier, less effort)

4. **Provide proof** (statistic, past client, personal experience)

5. **Paint a vivid mental picture** of what their life will be like using and experiencing the benefits

6. **Always assign a price** and justify it

7. **Tools and checklists > Training**
   > "Because effort and time are lower, the value is higher. The value equation still reigns supreme."

8. **Each one should crush a specific objection**
   > "The bonus should prove that their belief is incorrect"

9. **Solve the next problem** before they encounter it
   > "What's the natural next thing they will need?"

10. **Value of bonuses should ECLIPSE value of main offer**
    > "Subconsciously communicates that the main offer must be valuable because if these are the bonuses, the main thing has to be more valuable than the bonuses, right?"

11. **Add scarcity/urgency to the bonuses themselves**
    - Scarcity Version: "Only people who sign up for program XYZ will get access to Bonuses #1, 2, 3"
    - Urgency Version: "If you buy today, I'll add in bonus XYZ that normally costs $1,000, for free"

---

## Advanced Technique: Other People's Bonuses

> "You can get other businesses to give you their services and products as part of your bonuses in exchange for exposure to your clients for FREE."

**Pain Clinic Example:**

| Partner | Bonus | Value |
|---------|-------|-------|
| Massage therapist | 1-2 free massages | $200 |
| Chiropractor | 2 free adjustments | $100 |
| Food company | Discounts on products | $50 savings |
| Braces/orthotics | Discounts | $150 savings |
| Health club | 1 PT session + 1 month pool | $100 |
| Pharmacy | Discounts on medications | $100/mo |

**Result:** $400 offer with free bonuses that ALONE are worth more than $400.

**Jedi Level:** Negotiate group discount + commission for yourself:
- Chiro gives you $100 per person who goes to their office
- Orthotics company gives you $100 per referral
- Gym gives you $50 per person who signs up

> "Your $400 offer now has the potential to net you $350 extra... pure profit!"

---

## Input Required

```yaml
bonus_context:
  offer_name: ""
  core_promise: ""
  target_avatar: ""
  main_objections:
    - ""
    - ""
    - ""
  next_problems_after_purchase:
    - ""
    - ""
```

---

## Creation Process

### PHASE 1: Objection Inventory

List ALL objections and concerns:

```yaml
objections:
  - "It won't work for me because..."
  - "I don't have time to..."
  - "It's too expensive..."
  - "What if...?"
```

### PHASE 2: Bonus → Objection Mapping

For each objection, create a bonus that CRUSHES it:

| Objection | Bonus | Type |
|-----------|-------|------|
| | | Tool/Checklist/Template/Access |

### PHASE 3: Valuation

For each bonus, define value with JUSTIFICATION:

```yaml
bonus_valuation:
  name: ""
  type: ""  # Tool, template, training, access, done-for-you
  assigned_value: ""
  justification: ""  # "This template took me 47 hours to create..."
  market_comparison: ""  # "Consultants charge $X per hour for this"
```

### PHASE 4: Potential Partners (Advanced)

```yaml
partner_bonuses:
  - partner: ""
    bonus: ""
    value_to_client: ""
    commission_to_you: ""
```

---

## Output: Complete Bonus Stack

```yaml
bonus_stack:
  offer: ""
  main_offer_value: ""

  bonuses:
    - position: 1
      name: ""  # Name with benefit
      type: ""  # Tool/Checklist > Training
      value: ""
      crushes_objection: ""
      proof: ""
      mental_picture: ""  # "Imagine..."

    - position: 2
      name: ""
      type: ""
      value: ""
      crushes_objection: ""
      proof: ""
      mental_picture: ""

    # etc...

  partner_bonuses:
    - name: ""
      partner: ""
      value: ""

  totals:
    main_offer_value: ""
    total_bonus_value: ""
    total_value: ""
    price: ""
    ratio: ""  # Should be > 10:1

  scarcity_bonus:
    name: ""
    trigger: ""  # "Only for those who sign up today"

  presentation_script: |
    "But wait... there's more!
    You'll also receive [BONUS 1] worth [VALUE]...
    And [BONUS 2] that normally costs [VALUE]..."
```

---

## What Should Be Bonus vs Part of Main Offer?

> "Wow Factor — something you wouldn't want someone to miss out on. Take the most distinct nuggets that can almost stand alone and highlight them."

**Especially good for bonuses:**
- Short in duration but high in quality/value
- Checklists or infographics that condense a lot of information
- Things that don't justify standalone price but are perceived as very valuable as bonuses

---

## Types of Bonuses to Create

1. **Checklists, tools, swipe files, scripts, models, templates**
   > "Anything you can invest in once that clearly cost time or money to create, but can be given away infinitely"

2. **Recordings of workshops, webinars, events, interviews**
   > "Create the habit of recording everything and use as bonuses as needed"

3. **Partner discounts and commissions**
   > "Proactively negotiate with adjacent businesses that solve needs your client will have"

---

## Quality Gate

```yaml
bonus_quality:
  - [ ] Each bonus crushes specific objection
  - [ ] Names have benefit (not generic)
  - [ ] Values justified with comparison
  - [ ] Majority are tools/checklists (not trainings)
  - [ ] Total bonus value > main offer value
  - [ ] Presentation script ready
  - [ ] At least 1 bonus with scarcity/urgency
```

## Handoff

After completion:
- → `hormozi-copy` for sales page integration
- → `hormozi-pricing` for value-price optimization

---
*Task: HZ_OFFER_004 | Agent: hormozi-offers | Version: 2.0*
*Source: $100M Offers - Chapter 14: Bonuses*



<\!-- Criado com Squad Creator do AIOSPRO por @oalanicolas e @pedrovalerio | 2026-02-10 -->
