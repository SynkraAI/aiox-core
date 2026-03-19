# Plan Negotiation

```yaml
task:
  name: "Plan Complete Negotiation Strategy"
  id: plan-negotiation
  version: "1.0.0"
  executor: william-ury
  execution_type: Agent
  estimated_time: "30-45min"
  elicit: true

  purpose: |
    Create a comprehensive negotiation strategy using William Ury's principled
    negotiation framework. Define BATNA, interests vs positions, creative options,
    and objective criteria. Available at any pipeline phase as strategic advisor.

  input:
    - "Deal context and background"
    - "What's been tried so far"
    - "Known blockers or impasses"
    - "Relationship dynamics"

  output:
    - "BATNA analysis (yours and theirs)"
    - "Interests vs positions mapping"
    - "Creative options for mutual gain"
    - "Objective criteria for fair resolution"
    - "Go-to-the-Balcony strategy for emotional management"
    - "Breakthrough strategy if at impasse"

  veto_conditions:
    - "Positional bargaining without exploring interests → STOP, reframe"
    - "Win-lose framing → STOP, find the mutual gain first"

  elicitation:
    format: "numbered-questions"
    questions:
      - "What are you negotiating and what phase are you in?"
      - "What do you WANT? (Your stated position)"
      - "WHY do you want it? (Your underlying interests)"
      - "What do THEY want? (Their stated position)"
      - "WHY do they want it? (Your guess at their interests)"
      - "What happens if you DON'T reach agreement? (Your BATNA)"
      - "What happens to THEM if there's no agreement? (Their BATNA)"
      - "Is there an emotional component? Are things heated?"

  frameworks:
    principled_negotiation:
      principle_1: "Separate the PEOPLE from the PROBLEM"
      principle_2: "Focus on INTERESTS, not POSITIONS"
      principle_3: "Generate OPTIONS for mutual gain"
      principle_4: "Insist on OBJECTIVE CRITERIA"

    batna:
      definition: "Best Alternative To a Negotiated Agreement"
      rule: |
        NEVER enter a negotiation without knowing your BATNA.
        The strength of your BATNA determines your power.
        If your BATNA is strong, you can walk away.
        If theirs is strong, you must create more value.

    go_to_the_balcony:
      what: "Mental technique to gain perspective when emotions run high"
      when: "When you feel angry, pressured, or about to react emotionally"
      how: "Pause. Step back mentally. See the situation from above. Then respond."

    breakthrough_strategy:
      step_1: "Go to the Balcony (manage your emotions)"
      step_2: "Step to Their Side (acknowledge their position)"
      step_3: "Reframe (change the game from positions to interests)"
      step_4: "Build a Golden Bridge (make it easy for them to move)"
      step_5: "Use Power to Educate (show consequences without threatening)"

  output_format: |
    ## Negotiation Strategy Plan

    ### BATNA Analysis
    | | Yours | Theirs |
    |---|-------|--------|
    | **BATNA** | {what you do if no deal} | {what they do if no deal} |
    | **Strength** | {strong/moderate/weak} | {strong/moderate/weak} |
    | **Improvement Plan** | {how to strengthen your BATNA} | — |

    ### Interests vs Positions
    | | Position (WHAT they say) | Interest (WHY they want it) |
    |---|---|---|
    | **You** | {your position} | {your real interest} |
    | **Them** | {their position} | {their real interest} |

    ### Creative Options for Mutual Gain
    1. {Option that serves both interests}
    2. {Option that trades what you value less for what they value more}
    3. {Option that expands the pie}

    ### Objective Criteria
    - {Market rate/benchmark}
    - {Industry standard}
    - {Precedent}

    ### Emotional Management Plan
    **Go to the Balcony when:** {specific trigger moments}
    **Reframe when:** {they go positional}

    ### Breakthrough Strategy (if at impasse)
    1. Acknowledge: "{validate their perspective}"
    2. Reframe: "{change from positions to interests}"
    3. Golden Bridge: "{make it easy for them to say yes}"

  acceptance_criteria:
    - "BATNA analyzed for both sides"
    - "Interests clearly separated from positions"
    - "At least 3 creative options generated"
    - "Objective criteria identified"
    - "Emotional management plan exists"
```
