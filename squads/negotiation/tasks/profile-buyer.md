# Profile Buyer

```yaml
task:
  name: "Profile Buyer Psychology"
  id: profile-buyer
  version: "1.0.0"
  executor: robert-cialdini
  execution_type: Agent
  estimated_time: "20-30min"
  elicit: true

  purpose: |
    Analyze the buyer's psychological profile using Cialdini's 7 Principles of Influence.
    Determine which influence levers are most effective for this specific buyer type.
    Create a "Buyer DNA" profile that informs all subsequent negotiation phases.

  input:
    - "Buyer's name, role, company (if known)"
    - "Industry and company size"
    - "Previous interactions or known preferences"
    - "What they're buying and why"
    - "Any known objections or concerns"

  output:
    - "Buyer DNA Profile with influence lever ranking"
    - "Recommended approach per principle"
    - "Pre-suasion strategy (what to do BEFORE the pitch)"
    - "Red flags and avoid-zones"

  veto_conditions:
    - "No information about the buyer at all → STOP, gather minimum data first"
    - "Attempting to manipulate rather than influence ethically → STOP, reframe approach"

  elicitation:
    format: "numbered-questions"
    questions:
      - "Who is the buyer? (Name, title, company, industry)"
      - "What is their role in the decision? (Decision-maker, influencer, gatekeeper, user)"
      - "What do you know about their personality? (Analytical, expressive, driver, amiable)"
      - "Have you had previous interactions? What were they like?"
      - "What are their known priorities? (Cost, quality, speed, risk, innovation)"
      - "What concerns or objections have they expressed?"
      - "Who else influences their decision? (Boss, team, board, peers)"
      - "What is their likely BATNA? (What do they do if they don't buy from you?)"

  action_items:
    - step: "Collect buyer information via elicitation"
    - step: "Score each of Cialdini's 7 principles for this buyer (1-10)"
    - step: "Identify top 3 influence levers"
    - step: "Design pre-suasion strategy"
    - step: "Map social proof and authority signals to deploy"
    - step: "Identify unity/belonging angles"
    - step: "Generate buyer DNA report"

  frameworks:
    cialdini_7_principles:
      - principle: "Reciprocity"
        question: "What can I give first to create obligation?"
        scoring: "How responsive is this buyer to gifts, favors, information?"
      - principle: "Commitment & Consistency"
        question: "What small 'yes' can I get first?"
        scoring: "Does this buyer value being consistent with past statements?"
      - principle: "Social Proof"
        question: "Who in their peer group already uses my solution?"
        scoring: "How much does this buyer follow what others do?"
      - principle: "Authority"
        question: "What credentials and expertise can I demonstrate?"
        scoring: "Does this buyer defer to experts and credentials?"
      - principle: "Liking"
        question: "What do we have in common? How can I build rapport?"
        scoring: "Is this buyer relationship-driven?"
      - principle: "Scarcity"
        question: "What's the cost of waiting? What do they miss by not acting?"
        scoring: "Is this buyer motivated by fear of missing out?"
      - principle: "Unity"
        question: "What shared identity or group do we belong to?"
        scoring: "Does this buyer value belonging to a group?"

  output_format: |
    ## Buyer DNA Profile: {buyer name}

    ### Buyer Overview
    - **Name:** {name}
    - **Role:** {title} at {company}
    - **Decision Role:** {decision-maker | influencer | gatekeeper}
    - **Personality Type:** {analytical | expressive | driver | amiable}

    ### Influence Lever Ranking
    | Rank | Principle | Score | Recommended Action |
    |------|-----------|-------|--------------------|
    | 1 | {top principle} | {X}/10 | {specific action} |
    | 2 | {2nd principle} | {X}/10 | {specific action} |
    | 3 | {3rd principle} | {X}/10 | {specific action} |
    | 4-7 | {others} | {X}/10 | {notes} |

    ### Pre-Suasion Strategy
    **Before the conversation:**
    - {what to do to prime the buyer before the actual pitch}
    - {environment, timing, and framing recommendations}

    ### Approach Recommendations
    - **Opening:** {how to open based on top influence levers}
    - **Building Trust:** {specific trust signals to deploy}
    - **Creating Urgency:** {scarcity/loss aversion if applicable}
    - **Social Proof to Deploy:** {specific references, case studies, testimonials}

    ### Red Flags / Avoid
    - {what NOT to do with this buyer type}
    - {principles that could backfire}

    ### Next Steps
    → *identify-dream-clients to find more buyers like this
    → *create-pitch with this buyer DNA in mind
    → *negotiate-deal with influence strategy loaded

  acceptance_criteria:
    - "All 7 principles scored for this buyer"
    - "Top 3 influence levers identified with specific actions"
    - "Pre-suasion strategy defined"
    - "At least 2 red flags identified"
    - "Approach is ethical (influence, not manipulation)"
```
