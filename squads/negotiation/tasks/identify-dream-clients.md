# Identify Dream Clients

```yaml
task:
  name: "Identify Dream 100 Clients"
  id: identify-dream-clients
  version: "1.0.0"
  executor: chet-holmes
  execution_type: Agent
  estimated_time: "30-45min"
  elicit: true

  purpose: |
    Build a prioritized list of ideal clients using Chet Holmes' Dream 100 Strategy.
    Focus relentless effort on the highest-value prospects that can transform the business.
    Apply the 80/20 rule: 20% of prospects generate 80% of revenue.

  input:
    - "Offer definition (from *define-offer)"
    - "Industry/market"
    - "Current client base (if any)"
    - "Revenue goals"

  output:
    - "Dream 100 list (prioritized tiers)"
    - "Best Buyer profile"
    - "Approach strategy per tier"
    - "Follow-up cadence (12+ touches)"

  veto_conditions:
    - "No offer defined → STOP, run *define-offer first"
    - "Trying to sell to everyone → STOP, focus on Best Buyers only"

  elicitation:
    format: "numbered-questions"
    questions:
      - "What is your offer? (Brief summary or run *define-offer)"
      - "What industry/vertical are you targeting?"
      - "What is the ideal company size? (Revenue, employees, or other metric)"
      - "Who is the decision-maker role? (CEO, VP Sales, CTO, etc.)"
      - "What is your average deal size?"
      - "Who are your best current clients? Why are they the best?"
      - "What is your annual revenue goal for this effort?"
      - "How many deals do you need to close to hit that goal?"

  action_items:
    - step: "Define Best Buyer Profile from elicitation"
    - step: "Apply 80/20 analysis: which 20% of potential clients represent 80% of revenue?"
    - step: "Create tiered Dream list (Top 25, Next 25, Next 50)"
    - step: "Design approach strategy per tier"
    - step: "Create 12-touch follow-up cadence"
    - step: "Design educational hook (Stadium Pitch concept)"

  frameworks:
    dream_100:
      philosophy: |
        Don't chase 10,000 leads. Identify the 100 companies that would
        transform your business, then pursue them with pigheaded discipline.
      steps:
        - "Define the Best Buyer Profile"
        - "Research and list the top 100 companies matching the profile"
        - "Tier them: A (top 25), B (next 25), C (next 50)"
        - "Create personalized approach for Tier A"
        - "Design educational content (Stadium Pitch) that provides value"
        - "Execute 12+ touch campaign over 6-12 months"
        - "Track every interaction and adjust"

    best_buyer_strategy:
      principle: "Who are the BEST buyers — the ones who buy the most, fastest, and refer others?"
      criteria:
        - "Revenue potential (highest deal size)"
        - "Strategic value (reference client, market leader)"
        - "Speed to close (short decision cycle)"
        - "Expansion potential (upsell, cross-sell)"
        - "Referral potential (connected to other Dream 100)"

  output_format: |
    ## Dream 100: {market/industry}

    ### Best Buyer Profile
    - **Industry:** {vertical}
    - **Company Size:** {revenue/employees}
    - **Decision Maker:** {title/role}
    - **Pain Points:** {top 3 problems they face}
    - **Budget Range:** {typical budget for your solution}

    ### Dream List
    #### Tier A (Top 25 — Highest Value)
    | # | Company | Decision Maker | Revenue Potential | Why Dream? |
    |---|---------|---------------|-------------------|------------|
    | 1 | {company} | {name/role} | ${X} | {reason} |

    #### Tier B (Next 25 — Strong Fit)
    | # | Company | Decision Maker | Revenue Potential |
    |---|---------|---------------|-------------------|

    #### Tier C (Next 50 — Good Fit)
    | # | Company | Segment | Revenue Potential |

    ### 12-Touch Approach Cadence
    | Touch # | Channel | Content | Timing |
    |---------|---------|---------|--------|
    | 1 | Direct mail | Educational report | Week 1 |
    | 2 | Email | Follow-up on report | Week 2 |
    | 3 | Phone | Check if received | Week 3 |
    | ... | ... | ... | ... |
    | 12 | In-person | Lunch/meeting offer | Month 6 |

    ### Stadium Pitch (Educational Hook)
    **Title:** "{compelling educational title}"
    **Core Message:** {valuable insight that positions you as expert}
    **Format:** {presentation/report/webinar}

    ### Next Steps
    → *prospect-outreach to execute the contact plan
    → *profile-buyer for each Tier A prospect

  acceptance_criteria:
    - "Best Buyer Profile is specific and measurable"
    - "At least 25 prospects in Tier A with names"
    - "12-touch cadence defined with specific content"
    - "Stadium Pitch concept created"
    - "Revenue math works (Dream 100 × close rate = goal)"
```
