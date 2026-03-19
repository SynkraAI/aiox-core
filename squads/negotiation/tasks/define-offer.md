# Define Offer

```yaml
task:
  name: "Define Offer"
  id: define-offer
  version: "1.0.0"
  executor: negotiation-chief
  execution_type: Agent
  estimated_time: "15-30min"
  elicit: true

  purpose: |
    Clarify exactly what you're selling before any negotiation begins.
    A clear offer definition is the foundation for every subsequent phase.

  input:
    - "Product or service description"
    - "Current pricing (if any)"
    - "Target market / industry"
    - "Competitors (if known)"

  output:
    - "Structured offer definition"
    - "Value proposition statement"
    - "Pricing strategy with anchoring point"
    - "Key differentiators"

  veto_conditions:
    - "User cannot describe what they sell → STOP, help clarify first"
    - "No target market identified → STOP, define ICP before pricing"

  elicitation:
    format: "numbered-questions"
    questions:
      - "What product or service are you selling? Describe it in 2-3 sentences."
      - "What is the current price (or price range) you charge?"
      - "Who is your ideal client? (Industry, company size, role of buyer)"
      - "What problem does your offer solve? What's the cost of NOT solving it?"
      - "Who are your top 3 competitors? How are you different?"
      - "What is the biggest objection you hear from prospects?"
      - "What is the highest price you've ever charged? What happened?"

  frameworks:
    value_proposition:
      formula: "For {target} who {problem}, our {solution} provides {benefit} unlike {alternatives} because {differentiator}"
      rule: "If you can't fill every slot in this formula, the offer isn't clear enough yet."
      source: "Geoffrey Moore — Crossing the Chasm positioning statement"
    pricing_anchor:
      philosophy: |
        Never present a single price. Always anchor high first.
        The first number in the conversation becomes the reference point.
        Present 3 tiers: Aspirational (anchor), Target (what you want), Floor (walk-away).
      rule: "Anchor should be 2-3x your target price. Floor should be your true minimum."
    differentiation:
      test: "If a competitor could say the same thing, it's not a differentiator."
      categories:
        - "Speed: Can you deliver faster?"
        - "Expertise: Do you have unique knowledge/experience?"
        - "Process: Is your method different or proprietary?"
        - "Results: Can you prove specific outcomes?"
        - "Risk: Do you offer guarantees they can't?"

  action_items:
    - step: "Gather offer details via elicitation"
    - step: "Identify the core value proposition (pain → solution → result)"
    - step: "Define pricing strategy with anchor, target, and floor prices"
    - step: "Map key differentiators vs competitors"
    - step: "Create the offer summary document"

  output_format: |
    ## Offer Definition: {product/service name}

    ### Value Proposition
    **For** {target client} **who** {has this problem},
    **our** {product/service} **provides** {key benefit}
    **unlike** {competitors} **because** {key differentiator}.

    ### Pricing Strategy
    | Level | Price | Description |
    |-------|-------|-------------|
    | Anchor (aspirational) | ${X} | Premium package with everything |
    | Target (ideal) | ${Y} | Standard package you want to close |
    | Floor (walk-away) | ${Z} | Minimum acceptable — below this, walk away |

    ### Key Differentiators
    1. {differentiator 1}
    2. {differentiator 2}
    3. {differentiator 3}

    ### Common Objections & Responses
    | Objection | Response Framework |
    |-----------|-------------------|
    | "{objection 1}" | {response approach} |
    | "{objection 2}" | {response approach} |

    ### Next Steps
    → *profile-buyer to understand your buyer's psychology
    → *identify-dream-clients to build your prospect list

  acceptance_criteria:
    - "Value proposition is clear and specific"
    - "3-tier pricing strategy defined"
    - "At least 3 differentiators identified"
    - "Walk-away price established"
    - "Top objections documented"
```
