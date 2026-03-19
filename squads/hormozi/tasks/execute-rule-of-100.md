# execute-rule-of-100

## Metadata
```yaml
task_id: HZ_VALIDATION_001
agent: hormozi-leads
type: execution
complexity: high
estimated_time: 30-90 days
source: "$100M Leads - The Rule of 100"
prerequisite: validate-market-selection.md (market must be validated first)
```

## Purpose

Execute the "Rule of 100" protocol to validate demand and generate initial volume. This is the MANDATORY validation step before declaring "this market doesn't work."

> "Most entrepreneurs fail from inactivity, not from lack of efficiency. In the beginning, volume beats optimization every single time." — Alex Hormozi

---

## The Rule of 100

**Core Principle:** Every day, do ONE of these:

| Option | Daily Target | Purpose |
|--------|--------------|---------|
| **100 Cold Outreach** | 100 DMs, calls, or emails | Validate demand through conversations |
| **$100 in Ads** | Minimum $100/day ad spend | Validate demand through paid traffic |
| **100 Minutes of Content** | 100 min of content creation | Build audience for warm leads |

**Minimum commitment:** 90 days before drawing ANY conclusions.

---

## Why 100?

> "100 is the minimum to generate enough data to make decisions. Below that, you're making decisions based on noise, not signal."

**The Math:**
- 100 outreaches → ~10 conversations → ~1-3 sales
- This generates ENOUGH DATA to identify patterns
- Below 100, variance is too high to learn anything

---

## Pre-Execution Checklist

Before starting the 100 days:

```yaml
pre_flight_check:
  - [ ] Market validated (all 4 indicators >= 7)
  - [ ] Offer defined (at least MVP version)
  - [ ] Tracking system ready (spreadsheet, CRM, etc.)
  - [ ] Scripts prepared (for calls/messages)
  - [ ] Content calendar ready (if content route)
  - [ ] Ad creative ready (if paid route)
  - [ ] 90-day commitment secured (time + resources)
```

---

## Execution Protocol by Channel

### Option A: 100 Cold Outreach/Day

**Daily Execution:**
```yaml
cold_outreach_daily:
  morning_block:
    - Research 50 prospects (30 min)
    - Send 50 personalized messages (60 min)

  afternoon_block:
    - Research 50 more prospects (30 min)
    - Send 50 more personalized messages (60 min)

  follow_up_block:
    - Follow up on previous day's conversations (30 min)
    - Book calls from interested replies
```

**Tracking Required:**
| Metric | Daily | Weekly | 90-Day |
|--------|-------|--------|--------|
| Messages sent | 100 | 700 | 9,000 |
| Replies received | | | |
| Reply rate | | | |
| Conversations started | | | |
| Calls booked | | | |
| Sales closed | | | |
| Revenue generated | | | |

---

### Option B: $100/Day in Ads

**Daily Execution:**
```yaml
paid_ads_daily:
  setup_phase: # Days 1-7
    - Launch 3-5 ad variations
    - Target validated audience
    - Install tracking (pixel, UTMs)

  optimization_phase: # Days 8-90
    - Review metrics daily (10 min)
    - Kill losing ads weekly
    - Scale winners
    - Test new hooks/angles weekly
```

**Tracking Required:**
| Metric | Daily | Weekly | 90-Day |
|--------|-------|--------|--------|
| Ad spend | $100 | $700 | $9,000 |
| Impressions | | | |
| Clicks | | | |
| CTR | | | |
| Leads generated | | | |
| CPL | | | |
| Sales closed | | | |
| ROAS | | | |

---

### Option C: 100 Minutes of Content/Day

**Daily Execution:**
```yaml
content_creation_daily:
  creation_block: # 100 min
    - 1 long-form video (20-40 min) OR
    - 3 short-form videos (15-20 min each) OR
    - 2 podcast episodes (30 min each) OR
    - 5 written posts (20 min each)

  distribution_block: # 30 min
    - Post to primary platform
    - Repurpose to secondary platforms
    - Engage with comments
```

**Tracking Required:**
| Metric | Daily | Weekly | 90-Day |
|--------|-------|--------|--------|
| Content pieces created | | | |
| Total watch time/reads | | | |
| Followers gained | | | |
| Engagement rate | | | |
| Inbound DMs | | | |
| Leads generated | | | |
| Sales from content | | | |

---

## The Dashboard

Track these DAILY. No exceptions.

```yaml
rule_of_100_dashboard:
  day_number: "/90"

  daily_input:
    outreaches_sent: ""
    ad_spend: ""
    content_minutes: ""

  daily_output:
    replies_conversations: ""
    leads_generated: ""
    calls_booked: ""
    sales_closed: ""
    revenue: ""

  cumulative:
    total_inputs: ""
    total_leads: ""
    total_sales: ""
    total_revenue: ""

  conversion_rates:
    input_to_lead: "%"
    lead_to_call: "%"
    call_to_sale: "%"

  unit_economics:
    cost_per_lead: "$"
    cost_per_sale: "$"
    revenue_per_sale: "$"
    profit_per_sale: "$"
```

---

## Decision Points

### Day 30 Check

```yaml
day_30_evaluation:
  questions:
    - Have I ACTUALLY done 100/day for 30 days?
    - Total inputs so far: ___
    - Total conversations: ___
    - Total sales: ___

  if_zero_sales:
    check: "Is the OFFER the problem or the EXECUTION?"
    actions:
      - Review scripts/messaging
      - Get feedback from non-buyers (Golden Question)
      - Adjust offer based on objections
    DO_NOT: "Abandon market yet"

  if_some_sales:
    actions:
      - Document what's working
      - Double down on best channel
      - Continue to day 90
```

### Day 60 Check

```yaml
day_60_evaluation:
  questions:
    - Conversion patterns emerging?
    - What objections keep coming up?
    - Which channel is performing best?

  optimization_actions:
    - Focus on best-performing channel
    - Refine scripts based on objections
    - Improve offer if conversion < 5%
```

### Day 90 Final Evaluation

```yaml
day_90_evaluation:
  total_inputs: ""  # Should be ~9,000 or $9,000
  total_leads: ""
  total_sales: ""
  total_revenue: ""

  calculated_metrics:
    conversion_rate: "%"
    cac: "$"
    revenue_per_customer: "$"

  verdict:
    if:
      sales: "> 10"
      profitable: "true"
    then: "VALIDATED - Scale this channel"

    if:
      sales: "1-10"
      profitable: "marginal"
    then: "ADJUST - Improve offer, then re-run"

    if:
      sales: "0"
      inputs_completed: "true"
    then: "PIVOT - Consider different market or offer"
```

---

## The Golden Question

> "What would need to be true for this to be a no-brainer for you?"

Ask this to EVERY non-buyer. Their answers are your product roadmap.

**Tracking Objections:**
```yaml
objection_tracker:
  objection_1:
    text: ""
    frequency: ""
    potential_solution: ""
  objection_2:
    text: ""
    frequency: ""
    potential_solution: ""
  # ... continue for top 10 objections
```

---

## Output: Rule of 100 Report

```yaml
rule_of_100_report:
  period: "Day 1 to Day 90"

  execution_summary:
    total_days_executed: "/90"
    total_inputs: ""
    compliance_rate: "%"  # (days executed / 90)

  results:
    total_leads: ""
    total_sales: ""
    total_revenue: "$"
    total_cost: "$"
    net_profit_loss: "$"

  unit_economics:
    cpl: "$"
    cac: "$"
    revenue_per_customer: "$"
    ltv_projection: "$"
    ltv_cac_ratio: ":1"

  top_objections:
    1: ""
    2: ""
    3: ""

  what_worked:
    - ""
    - ""

  what_didnt_work:
    - ""
    - ""

  verdict: "VALIDATED | ADJUST | PIVOT"

  next_steps:
    if_validated:
      - "Scale winning channel"
      - "Run golden-ratios-veto.md"
      - "Move to Stage 2"
    if_adjust:
      - "Address top objection in offer"
      - "Re-run Rule of 100 for 30 days"
    if_pivot:
      - "Re-evaluate market with validate-market-selection.md"
      - "Consider different avatar or problem"
```

---

## Anti-Patterns

### What KILLS Rule of 100

- [ ] **Inconsistency** — Doing 300 one day, 0 the next (must be DAILY)
- [ ] **Premature optimization** — Trying to improve conversion before having data
- [ ] **Quitting at Day 30** — Not enough data yet
- [ ] **Not tracking** — Can't improve what you don't measure
- [ ] **Blaming the market** — Before completing 90 days at 100%

### The "Niche Slapper" Warning

> "If you're on your 3rd market pivot this year without completing a full Rule of 100 cycle, you're the problem, not the market."

---

## Quality Gate

```yaml
execution_quality:
  - [ ] 100 inputs executed EVERY day (no exceptions)
  - [ ] Dashboard updated daily
  - [ ] Objections tracked from non-buyers
  - [ ] 30/60/90 day evaluations completed
  - [ ] Verdict based on data, not feelings
```

---

## Handoff

After Rule of 100:

**If VALIDATED:**
- → `golden-ratios-veto.md` (validate unit economics)
- → `diagnose-business-stage.md` (confirm Stage 1 complete)
- → Scale the validated channel

**If ADJUST:**
- → Address top objections in offer
- → Re-run abbreviated 30-day Rule of 100
- → Re-evaluate

**If PIVOT:**
- → `validate-market-selection.md` (new market)
- → Start fresh Rule of 100

---
*Task: HZ_VALIDATION_001 | Agent: hormozi-leads | Version: 1.0*
*Source: $100M Leads - The Rule of 100*



<\!-- Criado com Squad Creator do AIOSPRO por @oalanicolas e @pedrovalerio | 2026-02-10 -->
