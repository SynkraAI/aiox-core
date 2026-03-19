# create-lead-magnet

## Metadata
```yaml
task_id: HZ_LEADS_001
agent: hormozi-leads
type: creation
complexity: high
estimated_time: 45-60min
source_fidelity: 100%
source: $100M Leads - Section II "Engage Your Leads: Offers and Lead Magnets"
```

## Purpose
Create a high-converting lead magnet using Alex Hormozi's 7-step framework that solves a specific problem completely, delivers massive value, and naturally bridges to your core offer.

## Lead Magnet Philosophy

> "A lead magnet is a complete solution to a specific problem. It is typically a lower cost or free offer to see who is interested in your stuff. And, once solved, it reveals another problem solved by your core offer."

> "Think of it like salty pretzels at a bar. If someone eats the pretzels, they will get thirsty and order a drink. The salty pretzels solve the specific problem of hunger. They also reveal a thirst problem solved by a drink."

**The Core Insight:** Your lead magnet should be so valuable you could charge for it. And after they get it, they should want more of what you offer.

## Input Required

```yaml
lead_magnet_context:
  core_offer:
    product_or_service: ""
    price: ""
    main_outcome: ""

  target_avatar:
    who: ""
    main_struggle: ""
    desired_outcome: ""

  current_situation:
    have_existing_leads: true/false
    traffic_source: ""  # Ads, content, outreach, referrals
```

---

## The 7-Step Lead Magnet Framework

### Step 1: Figure Out The Problem To Solve And For Whom

**The Problem-Solution Cycle:**
> "Every problem has a solution. Every solution reveals more problems. This is the endless cycle of business (and life). And smaller problem-solution cycles sit within larger problem-solution cycles."

**Selection Criteria:**
Choose a problem that is:
1. **Narrow** — Specifically defined, not broad
2. **Significant** — Causes real pain
3. **Connected** — Solving it reveals a NEW problem that YOUR CORE OFFER solves

```yaml
step_1_problem_selection:
  # List 5-7 specific problems your avatar faces BEFORE buying your core offer
  problems_before_core_offer:
    - problem: ""
      pain_level: /10
      leads_to_core_offer: true/false
    - problem: ""
      pain_level: /10
      leads_to_core_offer: true/false
    - problem: ""
      pain_level: /10
      leads_to_core_offer: true/false

  selected_problem: ""
  why_this_problem_leads_to_core_offer: ""
```

**Real Estate Example from Source:**
> "Imagine we help property owners sell their homes. That's a broad solution. But what about the steps before selling a home? Homeowners want to know how much their home is worth. They want to know how to increase its value. They need photos. They need it cleaned. They need landscaping. They need minor repairs. They need moving services. They might need staging. Etc. Those are all specific problems — great for lead magnets. We pick one of the specific problems and solve it for free."

---

### Step 2: Figure Out How To Solve It (3 Types)

**Three Types of Lead Magnets:**

| Type | How It Works | Best When |
|------|--------------|-----------|
| **Reveal Their Problem** | Shows them a problem they didn't know they had (diagnosis) | Problem worsens the longer they wait |
| **Samples & Trials** | Full but brief access to your core offer (limited uses or time) | Recurring solution for recurring problem |
| **One Step of Multi-Step** | Give one valuable step free, rest when they buy | Complex problem with multiple steps |

```yaml
step_2_solution_type:
  type: ""  # reveal_problem | sample_trial | one_step_of_multistep

  # If "reveal_problem":
  reveal_problem:
    what_you_diagnose: ""
    how_diagnosis_shows_gap: ""
    cost_of_inaction: ""
    # Ex: "Website speed test shows they load 30% below where they should be.
    #      You draw a clear line between where they should be and how much money
    #      they lose by being below standard."

  # If "sample_trial":
  sample_trial:
    what_they_access: ""
    limitation: ""  # time, uses, features
    why_theyll_want_more: ""
    # Ex: "You give a free adjustment for their bad posture and they experience relief.
    #      To get permanent benefits, they must buy more."

  # If "one_step_of_multistep":
  one_step:
    the_free_step: ""
    what_it_accomplishes: ""
    remaining_steps_in_core_offer: ""
    # Ex: "You hand out a free wood sealant for a garage door. But the sealing process
    #      requires three different coats to protect from all weather conditions.
    #      I do the first for free, explain how it only provides partial coverage,
    #      and offer the other two in a bundle."
```

**Examples from Source:**

**Reveal Problem:**
- Website speed test revealing slow load times → web hosting services
- Posture analysis showing misalignment → chiropractic care
- Termite inspection revealing damage → pest control

**Samples & Trials:**
- Connect to faster server, show lightning fast loads → hosting subscription
- Free adjustment providing relief → ongoing chiropractic care
- Sample-size consumables → full-size purchases (Costco model)

**One Step of Multi-Step:**
- $100M Leads book (free step) → Acquisition.com investment (remaining steps)
- First coat of sealant (free) → complete sealing package (paid)
- Free financial calculators → financial services (done-for-you)

---

### Step 3: Figure Out How To Deliver It

**Four Delivery Methods:**

| Method | Description | Example |
|--------|-------------|---------|
| **Software** | Tool that does work for them | Spreadsheet, calculator, dashboard, small app |
| **Information** | Teaching content | Courses, lessons, interviews, presentations, hacks/tips |
| **Services** | Work done for free | Audit, first session, first treatment, setup |
| **Physical Product** | Something they hold | Chart, sample, book, gear |

```yaml
step_3_delivery_method:
  primary_method: ""  # software | information | services | physical

  # Describe how you'll deliver using this method
  delivery_details:
    what_youll_create: ""
    format: ""
    estimated_production_effort: ""

  # BONUS: Create multiple versions
  additional_versions:
    - method: ""
      version_description: ""
    - method: ""
      version_description: ""
```

> "With three different types of lead magnets and four ways of delivering them, that's up to twelve lead magnets that solve a single specific problem. So many magnets, so little time!"

> "I make as many versions of a lead magnet as I can and rotate them. This keeps advertising fresh and with little effort. Plus, you get to see which ones work best. Like my case study story at the beginning of the chapter, the results are often surprising. And you won't know until you try."

**Gym Owner Example from Source (all 4 methods for ONE problem):**
- **Software:** Spreadsheet/dashboard showing all business stats, comparing to industry averages, giving a rating
- **Information:** Mini course on how to write an ad
- **Services:** Run the gym owner's ads free for thirty days
- **Physical Product:** Book called "Gym Launch Secrets"

---

### Step 4: Test How To Name It

> "David Ogilvy said: 'When you have written your headline, you have spent 80 cents of your (advertising) dollar.' What this means is that five times as many people read your headline than any other part of your promotion."

**What to Test (in order of importance):**
1. **Title/Headline** — Most important, test first
2. **Image(s)** — Visual representation
3. **Subtitle** — Supporting text

```yaml
step_4_naming:
  # Generate 3-5 title options to test
  title_options:
    - ""
    - ""
    - ""

  # Generate 2-3 subtitle options
  subtitle_options:
    - ""
    - ""

  # How to test
  testing_method: ""  # polls, posts, A/B test, ask people

  # If you have existing audience, use polls
  # "You don't need many votes to get a directional idea"
  # "If people respond to the poll AND ask when they can get their hands on it,
  #  you have a mega-winner."
```

**$100M Leads Title Tests from Source:**
- Round I: Advertising ✔ vs. Promotion
- Round II: Advertising vs. Leads ✔
- Round III: Marketing vs. Leads ✔

**Key Insight:**
> "'How to get strangers to want to buy your stuff' crushed 'Get strangers to want to buy your stuff'. The only difference is two small words: 'how to'. Small changes can make big differences."

---

### Step 5: Make It Easy To Consume

> "People prefer doing things that require less effort. So, if we want more people to take us up on our lead magnet and consume it, we need to make it easy."

**By Delivery Method:**

| Method | How to Make Easy |
|--------|-----------------|
| **Software** | Accessible on phones, computer, multiple formats |
| **Information** | Multiple formats: video, text, audio, images. Offer all of them. |
| **Services** | More times available, more days, more ways (video call, phone, in-person) |
| **Physical** | Simple to order, fast shipping, easy to open, simple instructions |

```yaml
step_5_ease_of_consumption:
  formats_offered:
    - format: ""
      platform: ""
    - format: ""
      platform: ""

  # From source: "$100M Offers has almost a perfect ¼, ¼, ¼, ¼ split between
  # ebooks, physical books, audiobooks, and videos (free at Acquisition.com).
  # Making the book available in various formats is the easiest way I know to
  # get 2-3-4x the amount of leads for the same work."

  time_to_consume: ""  # Target: < 15 minutes for initial value
  accessibility_features: []
```

---

### Step 6: Make It Very Good

> "Give Away The Secrets, Sell The Implementation"

> "If you are afraid of giving your secrets away, imagine the alternative: You give away valueless junk. Then, people who could have become customers think 'this person sucks! They only have valueless junk!' Then, they buy from someone else."

**The Philosophy:**
- Market judges everything you offer — free or not
- You can never provide too much value
- But you CAN provide too little
- Goal: Provide more value than the COST of your core offer BEFORE they buy

```yaml
step_6_value_delivery:
  # What secrets/valuable info will you give away?
  valuable_content:
    - ""
    - ""
    - ""

  # Quality check
  quality_validation:
    - "Could I charge for this?" # Must be YES
    - "Will they want more after consuming it?" # Must be YES
    - "Does it showcase my expertise?" # Must be YES

  # Real value test
  value_test: ""
  # "Imagine a company scaled from $1M to $10M just from consuming my free content.
  #  The chance of them partnering with Acquisition.com is huge because I paid
  #  my side before we even started."
```

> "99% of people won't buy, but they will create (or destroy) your reputation based on the value of your free stuff. So, make your lead magnets as good as your paid stuff. Your reputation depends on it."

---

### Step 7: Make It Easy For Them To Say They Want More

**Call To Action (CTA) Components:**
1. **What to do** — Clear, simple, action-oriented instruction
2. **Reasons to do it now** — Scarcity, urgency, any reason

**Three Types of Reasons:**

| Type | Definition | Examples |
|------|------------|----------|
| **Scarcity** | Limited quantity | "I can only handle five new clients a week" / "We only print one batch" |
| **Urgency** | Limited time | "Promotion ends Monday at midnight" / "Bonus disappears in 4 hours" |
| **Fraternity Party Planner** | Any reason (even if silly) | "Because it's my birthday" / "Because moms know best" |

```yaml
step_7_cta:
  # Clear action instruction
  action_instruction: ""  # "Call now" not "Don't delay"

  # Reasons to act
  scarcity:
    real_limitation: ""  # What actually limits you?
    how_to_communicate: ""

  urgency:
    deadline: ""
    what_disappears: ""

  invented_reason: ""  # "Because..." anything

  # Full CTA script
  cta_script: ""
```

**Harvard Research Insight from Source:**
> "Harvard did an experiment showing that people were more likely to let someone cut in line if they just gave a reason. The number of people who let others cut increased if the reason made sense (like scarcity and urgency). But any reason still works better than no reason."

---

## Output Format

```yaml
lead_magnet_spec:
  name: ""
  tagline: ""

  problem_solved:
    specific_problem: ""
    avatar: ""
    pain_level: /10

  solution_type: ""  # reveal_problem | sample_trial | one_step_of_multistep
  solution_mechanism: ""

  delivery:
    primary_method: ""  # software | information | services | physical
    format: ""
    additional_formats: []

  title_test_results:
    winning_title: ""
    winning_subtitle: ""

  consumption_time: ""

  value_proposition:
    what_they_get: ""
    why_its_valuable: ""
    secret_revealed: ""

  bridge_to_core_offer:
    problem_revealed_after_consumption: ""
    how_core_offer_solves_it: ""
    natural_next_step: ""

  cta:
    action: ""
    scarcity_element: ""
    urgency_element: ""
    reason: ""
    full_cta_script: ""

  opt_in_page:
    headline: ""
    subheadline: ""
    bullets:
      - ""
      - ""
      - ""
    cta_button: ""

  success_metrics:
    - "Opt-in rate (target: 20%+ for warm, 5-10% for cold)"
    - "Consumption rate (target: 60%+)"
    - "Core offer conversion rate"
```

---

## Quality Gate

```yaml
lead_magnet_quality:
  # Step 1 Validation
  - [ ] Solves a SPECIFIC, narrowly-defined problem
  - [ ] Problem is SIGNIFICANT (high pain)
  - [ ] Solving it reveals a NEW problem my core offer solves

  # Step 2 Validation
  - [ ] Clear solution type chosen with rationale
  - [ ] Solution mechanism explained

  # Step 3 Validation
  - [ ] Delivery method matches audience preference
  - [ ] At least 2 format options considered

  # Step 4 Validation
  - [ ] Title tested (or will be tested)
  - [ ] Title is clear and specific, not clever

  # Step 5 Validation
  - [ ] Can be consumed in <15 minutes (for initial value)
  - [ ] Available in multiple formats

  # Step 6 Validation
  - [ ] Valuable enough to charge for
  - [ ] Delivers real transformation, not just information
  - [ ] Would stake reputation on quality

  # Step 7 Validation
  - [ ] CTA is clear and action-oriented
  - [ ] Includes at least one "reason to act now"
  - [ ] Bridge to core offer is natural, not forced
```

---

## The Math That Makes It Work

From the source:

> "Let's say you make $10,000 in profit on your core offer. And it costs $1000 in advertising to get someone on a call for it. If you close one in three people, it costs $3000 in advertising to get one customer. Since we have $10,000 in profit to work with, we're fine."

**With Lead Magnet:**
> "Your lead magnet costs $25 to deliver, and because it is free to them, more will engage. The extra engagement means it only costs $75 in advertising to get someone on a call. All in, that's $100 per call."

> "Let's say one in ten people who get the lead magnet buys your core offer. This means your new cost to acquire a customer is $1000 ($100 x 10 people). We just cut our cost to get a customer by 3x."

**Result:** Same budget → 3x the business

---

## Handoff

After completion:
- → `hormozi-hooks` for opt-in page hooks
- → `hormozi-copy` for landing page copy
- → `hormozi-ads` for traffic creative
- → `hormozi-offers` if lead magnet needs Value Equation enhancement

---
*Task: HZ_LEADS_001 | Agent: hormozi-leads | Version: 2.0 | Source: $100M Leads Section II*



<\!-- Criado com Squad Creator do AIOSPRO por @oalanicolas e @pedrovalerio | 2026-02-10 -->
