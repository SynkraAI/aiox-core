# Negotiate Deal

```yaml
task:
  name: "Tactical Empathy Negotiation"
  id: negotiate-deal
  version: "1.0.0"
  executor: chris-voss
  execution_type: Agent
  estimated_time: "30-60min"
  elicit: true

  purpose: |
    Create a tactical negotiation strategy using Chris Voss's Tactical Empathy
    methodology from "Never Split the Difference". Deploy mirroring, labeling,
    calibrated questions, and accusation audits to negotiate the best possible
    terms while preserving the relationship.

  input:
    - "Deal context (what's being negotiated)"
    - "Current terms / proposal"
    - "Buyer profile"
    - "Your BATNA and walk-away point"
    - "Known objections or sticking points"

  output:
    - "Complete negotiation playbook"
    - "Accusation audit for opening"
    - "Calibrated questions library"
    - "Labeling scripts"
    - "Black Swan hunting plan"
    - "Anchoring strategy"

  veto_conditions:
    - "No BATNA defined → STOP, define walk-away first"
    - "Willing to split the difference → STOP, never split the difference"
    - "Aggressive/adversarial posture → STOP, tactical empathy first"

  elicitation:
    format: "numbered-questions"
    questions:
      - "What are you negotiating? (Deal type, value, terms)"
      - "What is the other side asking for?"
      - "What do YOU want ideally? What's your target?"
      - "What is your absolute walk-away point?"
      - "What is your BATNA? (What do you do if this deal fails?)"
      - "What are the known objections or concerns from the other side?"
      - "What do you know about the person you're negotiating with?"
      - "What is the emotional temperature? (Friendly, tense, hostile, neutral)"
      - "Are there any deadlines or time pressures?"
      - "What don't you know that could change everything? (Potential Black Swans)"

  action_items:
    - step: "Map the deal landscape (terms, players, stakes)"
    - step: "Define anchoring strategy"
    - step: "Create Accusation Audit (acknowledge their fears upfront)"
    - step: "Design mirroring and labeling scripts"
    - step: "Build calibrated questions library"
    - step: "Identify potential Black Swans"
    - step: "Create tactical response scripts for key scenarios"
    - step: "Define the Ackerman bargaining plan (if price negotiation)"

  frameworks:
    tactical_empathy:
      philosophy: |
        Tactical empathy is understanding the feelings and mindset of another
        in the moment, and also hearing what is behind those feelings.
        It's not about agreeing — it's about understanding.

      techniques:
        mirroring:
          what: "Repeat the last 1-3 words they said"
          why: "Makes them elaborate and reveals information"
          example: "'You want a 30% discount.' → 'A 30% discount?'"

        labeling:
          what: "Name the emotion you observe"
          format: "'It seems like...', 'It sounds like...', 'It looks like...'"
          why: "Defuses negative emotions, reinforces positive ones"
          example: "'It seems like you're frustrated with the timeline.'"

        accusation_audit:
          what: "List every negative thing they could say about you BEFORE they say it"
          why: "Defuses the negatives and builds trust"
          example: "'You're probably thinking this is too expensive, that we're too small, and that the timeline is aggressive...'"

        calibrated_questions:
          what: "How and What questions that give them the illusion of control"
          examples:
            - "'How am I supposed to do that?'"
            - "'What about this is important to you?'"
            - "'How would you like me to proceed?'"
            - "'What happens if we don't solve this?'"
            - "'How does this fit with your budget process?'"
          rule: "NEVER ask Why (it's accusatory). Always How or What."

        late_night_fm_dj_voice:
          what: "Slow down, lower your voice, sound calm and in control"
          when: "When tension rises or you need to de-escalate"

        no_oriented_questions:
          what: "Ask questions where 'no' is the answer you want"
          examples:
            - "'Would it be ridiculous to...?' (they say no = they agree)"
            - "'Is now a bad time to talk?' (no = it's a good time)"
          why: "People feel safe saying no. It gives them control."

    ackerman_bargaining:
      what: "Systematic approach to price negotiation"
      steps:
        - "Set your target (ideal price)"
        - "First offer: 65% of target"
        - "Second offer: 85% of target"
        - "Third offer: 95% of target"
        - "Final offer: exact target (non-round number for credibility)"
      rule: "Use decreasing increments. Each concession gets smaller."

    black_swan_hunting:
      what: "Unknown unknowns that can change everything"
      how: "Listen for what they DON'T say. Look for leverage you didn't know existed."
      types:
        - "Positive: Something that makes the deal even better"
        - "Negative: A hidden constraint or competitor"
        - "Normative: A principle or belief that drives their decisions"

  output_format: |
    ## Negotiation Playbook: {deal description}

    ### Deal Landscape
    - **Stakes:** {what's on the table}
    - **Your Target:** {ideal outcome}
    - **Your Walk-Away:** {minimum acceptable}
    - **Your BATNA:** {alternative if deal fails}
    - **Their Likely BATNA:** {what they do without you}

    ### Accusation Audit (Open With This)
    "You're probably thinking {negative 1}, and that {negative 2},
    and you might even feel that {negative 3}..."

    ### Tactical Scripts

    **Mirroring Responses:**
    | They Say | You Mirror |
    |----------|-----------|
    | "{their statement}" | "{last 2-3 words}?" |

    **Labeling Scripts:**
    | Situation | Label |
    |-----------|-------|
    | {scenario 1} | "It seems like {emotion}..." |
    | {scenario 2} | "It sounds like {concern}..." |

    **Calibrated Questions (How/What):**
    1. "How am I supposed to {their demand}?"
    2. "What about this is most important to you?"
    3. "How does this work on your end?"
    4. "What happens if we don't reach agreement?"
    5. "How would you like me to proceed?"

    ### Price Negotiation (Ackerman)
    | Round | Offer | % of Target | Rationale |
    |-------|-------|-------------|-----------|
    | 1 | ${X} | 65% | Anchor low |
    | 2 | ${Y} | 85% | Show movement |
    | 3 | ${Z} | 95% | Getting close |
    | Final | ${target} | 100% | Non-round, precise |

    ### Black Swan Hunting
    - **What to listen for:** {signals of hidden information}
    - **Questions to uncover:** {specific probing questions}

    ### Scenario Playbook
    | They Say/Do | Technique | Your Response |
    |------------|-----------|---------------|
    | "Lower your price" | Calibrated Q | "How am I supposed to do that?" |
    | Silence | Comfort | Wait. Let silence work. |
    | Ultimatum | Label + Mirror | "It seems like you're under pressure... under pressure?" |

    ### Next Steps
    → *close-deal when terms are agreed
    → *handle-objection for specific pushback

  acceptance_criteria:
    - "BATNA and walk-away clearly defined"
    - "Accusation Audit written"
    - "At least 5 calibrated questions"
    - "Mirroring and labeling scripts ready"
    - "Ackerman plan if price negotiation"
    - "Black Swan hunting strategy"
    - "Never splits the difference"
```
