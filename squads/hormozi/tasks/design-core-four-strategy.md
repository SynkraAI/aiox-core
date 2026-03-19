# design-core-four-strategy

## Metadata
```yaml
task_id: HZ_LEADS_002
agent: hormozi-leads
type: strategy
complexity: high
estimated_time: 60-90min
source_fidelity: 100%
source: $100M Leads - Section III "Get Leads" + "Core Four on Steroids: More Better New"
```

## Purpose
Design a complete Core Four lead generation strategy covering all four channels using Alex Hormozi's frameworks: The Rule of 100, More Better New, and channel-specific tactics.

## The Core Four Philosophy

> "There are only four things you can do to let other people know about anything: warm outreach, post content, cold outreach, and run paid ads."

> "So, if you are not getting as many leads as you'd like, you're not doing the core four with enough skill or in enough volume."

```
┌─────────────────────────────────────────────────────────────────┐
│                      THE CORE FOUR                               │
├─────────────────┬─────────────────┬─────────────────┬───────────┤
│   WARM          │    CONTENT      │     COLD        │   PAID    │
│  OUTREACH       │                 │   OUTREACH      │   ADS     │
├─────────────────┼─────────────────┼─────────────────┼───────────┤
│  1-to-1         │   1-to-many     │    1-to-1       │ 1-to-many │
│  WARM audience  │  WARM audience  │  COLD audience  │ COLD aud. │
├─────────────────┼─────────────────┼─────────────────┼───────────┤
│ People who      │ Strangers who   │ Strangers you   │ Pay to be │
│ know you        │ find you        │ find            │ found     │
└─────────────────┴─────────────────┴─────────────────┴───────────┘
```

## Input Required

```yaml
core_four_context:
  business:
    type: ""
    core_offer: ""
    price_point: ""
    target_avatar: ""

  current_state:
    monthly_revenue: ""
    current_lead_sources: []
    best_performing_channel: ""
    team_size: ""
    weekly_hours_available: ""
    monthly_budget: ""

  goals:
    monthly_lead_goal: ""
    monthly_customer_goal: ""
    acceptable_cac: ""

  constraints:
    time_vs_money: ""  # "more time than money" | "more money than time" | "balanced"
```

---

## The Rule of 100

> "The rule of 100 is simple. You advertise your stuff by doing 100 primary actions every day, for one hundred days straight. That's it. I don't make many promises, but this is one. If you do 100 primary actions a day, and do it for 100 days straight, you will get more engaged leads. Commit to the rule of 100 and you will never go hungry again."

**Applied to Each Core Four:**

| Channel | Rule of 100 Action | Examples |
|---------|-------------------|----------|
| **Warm Outreach** | 100 reach outs per day | Email, text, DM, calls |
| **Post Content** | 100 minutes per day making content | Short/long videos, articles, podcasts |
| **Cold Outreach** | 100 reach outs per day | Email, text, DM, cold call, flyers |
| **Paid Ads** | 100 minutes per day on ads | Creating, testing, optimizing |

---

## Phase 1: Channel Assessment

**Rate each channel's viability for YOUR business:**

```yaml
channel_assessment:
  warm_outreach:
    # Do you have contacts to reach out to?
    audience_access: /10
    # Can you or team do it well?
    team_skill: /10
    # Does it fit your time/money constraints?
    resource_fit: /10
    total_score: /30
    notes: ""

  content:
    # Which platforms does your audience use?
    audience_access: /10
    # Can you create quality content?
    team_skill: /10
    # Do you have time for 100 min/day?
    resource_fit: /10
    total_score: /30
    notes: ""

  cold_outreach:
    # Can you build/buy lists?
    audience_access: /10
    # Can you handle rejection and volume?
    team_skill: /10
    # Do you have automation tools?
    resource_fit: /10
    total_score: /30
    notes: ""

  paid_ads:
    # Are your customers on paid platforms?
    audience_access: /10
    # Can you create ads and track ROI?
    team_skill: /10
    # Do you have budget to lose while learning?
    resource_fit: /10
    total_score: /30
    notes: ""
```

**Decision Framework from Source:**
> "If I have more time than money, I move to posting content. If I have more money than time, I go with cold outreach or running ads."

---

## Phase 2: Priority Sequencing

**Based on scores, sequence channel activation:**

```yaml
priority_sequence:
  primary:
    channel: ""
    start: "Now"
    rationale: ""

  secondary:
    channel: ""
    start: "Month 2"
    rationale: ""

  tertiary:
    channel: ""
    start: "Month 3"
    rationale: ""

  quaternary:
    channel: ""
    start: "Month 4+"
    rationale: ""
```

**Hormozi's Recommended Start Order:**
1. **Warm Outreach** — Always start here to get "first five customers"
2. **Content** (if more time than money) OR **Cold Outreach/Paid Ads** (if more money than time)
3. Layer additional channels as capacity allows

> "Remember, you only need to do one to get engaged leads. So, just pick one. Then, maximize it. Do more. Do better. Do new."

---

## Phase 3: Warm Outreach Strategy

> "Warm reach outs are when you make one-on-one contact with your warm audience — aka — the people who know you. It's the cheapest and easiest way to find people interested in the stuff you sell."

```yaml
warm_outreach_strategy:
  enabled: true/false

  # Step 1: Build Your List
  contact_sources:
    - source: "Phone contacts"
      estimated_count: ""
    - source: "Email contacts"
      estimated_count: ""
    - source: "Social media (followers, friends, connections)"
      estimated_count: ""
    - source: "Past clients"
      estimated_count: ""
  total_contacts: ""

  # Step 2: Platform Priority
  platform_priority:
    - platform: ""
      contact_count: ""
    - platform: ""
      contact_count: ""

  # Step 3: Personalization Template
  # Use ACA Framework: Acknowledge, Compliment, Ask
  personalization_template: |
    [Personalized greeting based on something you know about them]

    [ACA Framework]
    Acknowledge: [Restate what they said]
    Compliment: [Tie to positive character trait]
    Ask: [Question that leads toward your offer]

  # Step 4: The Offer Script
  # From source - "Do you know anyone" approach
  offer_script: |
    "...by the way, do you know anyone who is [describe their struggles]
    looking for [dream outcome] in [time delay]?

    I'm taking on five free case studies because that's all I can handle.
    Just want to get some testimonials for my service/product.

    I help them [dream outcome] without [effort and sacrifice].
    It works. I even guarantee people get [dream outcome] or I work
    with them until they do.

    I just had a girl named XXX work with me [dream outcome] even though
    she [describe same struggle your contact has].

    Anyone you like come to mind?"

  # Step 5: Follow-up Sequence
  follow_up:
    day_1: "Initial personalized reach out"
    day_2: "Follow up if no response"
    day_3: "Final attempt"

  # Metrics
  expected_metrics:
    response_rate: "20%"  # 1 in 5 contacts respond
    offer_acceptance: "20%"  # 1 in 5 who respond accept free offer
    paid_conversion: "25%"  # 1 in 4 free clients become paid
    # "100 reach outs → 20 responses → 4 free clients → 1 paid client"

  rule_of_100:
    daily_action: "100 personalized reach outs"
    tracking_method: ""
```

**Benchmarks from Source:**
> "Warm reach outs should get about one in five contacts to engage. So one hundred warm reach outs should get around twenty responses. Of the twenty who respond, another one in five will take you up on your free offer. So, four people. Of the four who take your free offer now, you should be able to convert one to some type of paid offer later."

**The Math:**
> "500 reach outs per week = 5 customers per week. $400 product → 5 customers x $400 = $2000/week. $2000/week x 52 weeks = $104,000... bingo."

---

## Phase 4: Content Strategy

> "Post content to build trust, provide value, and let strangers find you. It's free advertising that compounds over time."

```yaml
content_strategy:
  enabled: true/false

  # Platform Selection
  primary_platform: ""  # YouTube, LinkedIn, Twitter, TikTok, Instagram, etc.
  secondary_platform: ""

  # Content Pillars (3-5 topics you'll cover repeatedly)
  content_pillars:
    - topic: ""
      relates_to_core_offer: ""
    - topic: ""
      relates_to_core_offer: ""
    - topic: ""
      relates_to_core_offer: ""

  # Format Mix
  format_mix:
    - type: "Short form video"
      frequency: ""
      platform: ""
    - type: "Long form video"
      frequency: ""
      platform: ""
    - type: "Written posts"
      frequency: ""
      platform: ""

  # CTA Strategy
  cta_approach: ""  # Lead magnet, DM me, link in bio, etc.

  # The Give-Ask Cycle
  give_ask_ratio: "4:1"  # Give value 4x, ask 1x
  give_examples:
    - ""
    - ""
  ask_examples:
    - ""

  # Rule of 100
  rule_of_100:
    daily_action: "100 minutes creating/posting content"
    minimum_posts_per_day: 1
    tracking_method: ""

  # Keep List Warm
  # From source: Dean Jackson's 9-word email
  reengagement_message: |
    "Are you still looking for [4-word desire]?"

    Examples:
    - "Are you still looking to buy your dream home?"
    - "Are you still looking to get more sales leads?"
    - "Are you still looking to tone your arms?"
```

---

## Phase 5: Cold Outreach Strategy

> "Cold reach outs are when you contact people one-on-one who don't know who you are — strangers. It's a numbers game with lower response rates, but it scales."

```yaml
cold_outreach_strategy:
  enabled: true/false

  # List Building
  list_sources:
    - source: ""
      method: ""  # scrape, buy, manually build
      estimated_size: ""
    - source: ""
      method: ""
      estimated_size: ""

  qualification_criteria:
    - ""
    - ""

  # Channels
  channels:
    - channel: "Email"
      enabled: true/false
    - channel: "LinkedIn"
      enabled: true/false
    - channel: "Cold Call"
      enabled: true/false
    - channel: "DM"
      enabled: true/false

  # Outreach Sequence
  sequence:
    message_1:
      timing: "Day 1"
      content: ""
      purpose: "Initial contact, provide value"

    message_2:
      timing: "Day 3"
      content: ""
      purpose: "Follow up, different angle"

    message_3:
      timing: "Day 7"
      content: ""
      purpose: "Final attempt, direct ask"

  # Personalization Level
  personalization: ""  # low (templated) | medium (some custom) | high (fully custom)

  # Automation
  automation_tools:
    - tool: ""
      purpose: ""

  # Rule of 100
  rule_of_100:
    daily_action: "100 cold reach outs per day"
    # "Since cold audiences have lower response rates, use automation"

  # Expected Metrics
  expected_metrics:
    response_rate: "1-3%"
    meeting_rate: "10-20% of responses"
    close_rate: ""
```

**Key Insight from Source:**
> "The same reach out skills you learned for warm outreach apply to cold outreach. The difference is you personalize differently (since you don't know them) and expect lower response rates."

---

## Phase 6: Paid Ads Strategy

> "Paid ads are the fastest way to scale how many leads you get. It's all about efficiency — not creativity. Any advertising works. The only thing that differs between ads is how well they work."

```yaml
paid_ads_strategy:
  enabled: true/false

  # Platform Selection
  platforms:
    - name: ""
      budget_allocation: ""
      audience_fit: /10

  # The Three Phases of Scaling Ads (from source)
  current_phase: ""  # track_money | lose_money | print_money

  phase_1_track_money:
    # "Before spending a dollar on ads, set everything up so you can
    #  accurately track your returns. If you don't track, you will get cleaned out."
    tracking_setup:
      - "Pixel installed"
      - "Conversion tracking configured"
      - "UTM parameters set"
      - "CRM integrated"

  phase_2_lose_money:
    # "You will lose money. Actually, I lost money more times than I made money
    #  running paid ads. But every time I make money from paid ads, I make back
    #  everything I lost, and then some."
    testing_budget: ""  # 2x what you collect from a client in 30 days
    test_shutoff_rule: |
      "If getting leads: let ad run until 2x 30-day client value spent
       If getting NO leads: shut off before 1x 30-day value"

  phase_3_print_money:
    # "If you're making more money back than you spend — the answer is simple —
    #  spend as much as you can."
    scaling_approach: |
      "Instead of asking 'How much should I spend on an ad?' I ask
       'How many customers do I want?' or 'How many customers can I handle?'"
    budget_calculation:
      target_customers: ""
      cac: ""
      base_budget: ""  # target_customers x CAC
      scale_buffer: "+20%"  # "Ads get less efficient as they scale"
      final_budget: ""

  # LTGP:CAC Ratio
  # "Every business I invest in that struggles to scale has at least one thing
  #  in common — their LTGP to CAC ratio was less than 3 to 1."
  ltgp_cac_target: "3:1 minimum"
  current_ltgp: ""
  current_cac: ""
  current_ratio: ""

  # Customer-Financed Acquisition
  # "If your customer spends more than it costs you to get and serve them —
  #  in the first 30 days — then you have the funds to scale now and forever."
  thirty_day_breakeven:
    day_1_revenue: ""
    day_30_total_collected: ""
    cac: ""
    cogs_30_days: ""
    breakeven: true/false  # 30-day collected ≥ CAC + COGS

  upsell_strategy:
    # "Here's how I fix it — I immediately sell them more stuff."
    upsell_offer: ""
    upsell_price: ""
    upsell_take_rate: ""
    upsell_contribution_to_30_day: ""

  # Rule of 100
  rule_of_100:
    daily_action: "100 minutes per day on paid ads"
    activities:
      - "Creating new ad variations"
      - "Reviewing metrics"
      - "Testing new audiences"
      - "Optimizing winners"

  # Ad vs Sales Problem Diagnosis
  # "If your engaged leads have the problem you solve and the money to spend,
  #  and they're not buying, then your ads work fine — you have a sales problem."
  diagnosis:
    leads_have_problem: true/false
    leads_have_money: true/false
    leads_are_buying: true/false
    problem_type: ""  # advertising | sales | neither
```

**Key Math from Source:**
> "If you made a billion dollars per customer, then you could spend nine hundred ninety nine million dollars to get one customer and still have a million dollars left over. On the other hand, if you made a penny per customer, you'd have to get every customer for less than a penny to make it work."

---

## Phase 7: More Better New (Scaling Framework)

> "But what if you are doing the core four and still not getting as many engaged leads as you want? There are two ways to juice any of the core four to get even more engaged leads on your own. They're easy to remember: More, Better, New."

```yaml
more_better_new:
  # MORE: Do more of what's working
  more:
    current_volume:
      warm_outreach_per_day: ""
      content_minutes_per_day: ""
      cold_outreach_per_day: ""
      ad_spend_per_day: ""

    increased_volume:
      warm_outreach_per_day: ""
      content_minutes_per_day: ""
      cold_outreach_per_day: ""
      ad_spend_per_day: ""

    # "Even without improvements, if you double your inputs, you will get more
    #  engaged leads."

  # BETTER: Improve efficiency through testing
  better:
    # "Getting better gets you more leads for the same effort."
    testing_schedule: "One test per week per platform"

    # Find the constraint (biggest drop-off point)
    current_funnel:
      - step: ""
        conversion: "%"
      - step: ""
        conversion: "%"  # ← Constraint = lowest conversion
      - step: ""
        conversion: "%"

    constraint_identified: ""
    next_test: ""
    test_hypothesis: ""

    # "If we can't beat the version we're currently running in four attempts
    #  (or a month), we move on to the next constraint."

  # NEW: New placements, platforms, or core four activities
  new:
    # "When to do new: When the returns you get from doing more↔better are less
    #  than what you could get from a new placement or new way of advertising."

    order_of_new:
      # 1. New placements on current platform
      new_placements_same_platform:
        - ""
        - ""

      # 2. Same placements on new platform
      same_placements_new_platform:
        - ""
        - ""

      # 3. New core four activity
      new_core_four_activity: ""
```

**The Pie Size Fallacy from Source:**
> "Most business owners only look at the platform and small community they market to. And typically, there are only three or four big businesses marketing in their niche. So, they assume those companies must split the entire market between them. Think for a moment about how ridiculous that is."

> "They wrongly assume the small sliver of the universe they advertise to is the entire available market! This is why most businesses stay small."

---

## Output: Complete Core Four Strategy

```yaml
core_four_strategy:
  business: ""
  monthly_lead_goal: ""
  time_vs_money_situation: ""

  priority_sequence:
    - channel: ""
      start_date: ""
      rule_of_100_action: ""
      expected_leads_per_100_actions: ""

  channel_strategies:
    warm_outreach:
      enabled: true/false
      daily_target: 100
      script_summary: ""
      tracking_method: ""

    content:
      enabled: true/false
      daily_minutes: 100
      primary_platform: ""
      post_frequency: ""

    cold_outreach:
      enabled: true/false
      daily_target: 100
      primary_channel: ""
      automation_tool: ""

    paid_ads:
      enabled: true/false
      daily_budget: ""
      primary_platform: ""
      testing_budget: ""

  rule_of_100_weekly_schedule:
    monday:
      channel: ""
      action: ""
    tuesday:
      channel: ""
      action: ""
    wednesday:
      channel: ""
      action: ""
    thursday:
      channel: ""
      action: ""
    friday:
      channel: ""
      action: ""

  scaling_plan:
    more: "What will you do MORE of?"
    better: "What constraint will you TEST first?"
    new: "What NEW channel/placement is next?"

  kpis:
    - metric: "Total reach outs/posts per week"
      target: ""
      tracking: ""
    - metric: "Response rate"
      target: ""
      tracking: ""
    - metric: "Leads generated per week"
      target: ""
      tracking: ""
    - metric: "Cost per lead (if paid)"
      target: ""
      tracking: ""
    - metric: "Customers per week"
      target: ""
      tracking: ""

  90_day_milestones:
    day_30:
      primary_channel_active: true
      leads_generated: ""
      customers_acquired: ""

    day_60:
      secondary_channel_active: true
      leads_generated: ""
      customers_acquired: ""

    day_90:
      all_channels_humming: true
      leads_generated: ""
      customers_acquired: ""
      ltgp_cac_ratio: ""
```

---

## Quality Gate

```yaml
strategy_quality:
  # Channel Assessment
  - [ ] All 4 channels assessed with scores
  - [ ] Time vs money situation acknowledged

  # Priority & Sequencing
  - [ ] Priority sequence justified based on scores
  - [ ] Start with warm outreach if beginning

  # Rule of 100
  - [ ] Rule of 100 applied to each active channel
  - [ ] Daily actions are specific and measurable

  # Channel Plans
  - [ ] Each active channel has complete tactical plan
  - [ ] Scripts/templates included where applicable
  - [ ] Expected metrics defined

  # Scaling Plan
  - [ ] More Better New framework applied
  - [ ] Constraint identified for "better"
  - [ ] Next "new" channel identified

  # Metrics
  - [ ] KPIs defined and trackable
  - [ ] 90-day milestones set

  # Math Checks (Paid Ads)
  - [ ] LTGP:CAC ratio calculated (target 3:1)
  - [ ] 30-day breakeven assessed
  - [ ] Testing budget = 2x 30-day client value
```

---

## Hormozi's Personal Story (Context)

> "I built my first business with content posts and warm outreach. I built my gyms with free content and paid ads. I built Gym Launch with paid ads and cold outreach. I built Prestige Labs with affiliates. I built ALAN with paid ads and affiliates. I built Acquisition.com with content posts."

> "There are many ways to get engaged leads. If you master one, you will be able to feed yourself for the rest of your life. They all work if you do."

---

## Handoff

After completion:
- → `hormozi-ads` for paid ads creative if enabled
- → `hormozi-hooks` for content hooks if content enabled
- → `hormozi-copy` for outreach sequences if outreach enabled
- → `hormozi-offers` if LTGP needs improvement to hit 3:1

---
*Task: HZ_LEADS_002 | Agent: hormozi-leads | Version: 2.0 | Source: $100M Leads Section III + "More Better New"*



<\!-- Criado com Squad Creator do AIOSPRO por @oalanicolas e @pedrovalerio | 2026-02-10 -->
