# Create Pitch

```yaml
task:
  name: "Create STRONG Method Pitch"
  id: create-pitch
  version: "1.0.0"
  executor: oren-klaff
  execution_type: Agent
  estimated_time: "30-45min"
  elicit: true

  purpose: |
    Create a compelling pitch using Oren Klaff's STRONG method and frame control.
    Design a 20-minute pitch that controls the frame, triggers the buyer's
    crocodile brain, and positions you as the prize.

  input:
    - "Offer definition"
    - "Buyer profile (if available)"
    - "Meeting context (who, where, how long)"

  output:
    - "Complete STRONG pitch script"
    - "Frame strategy (which frames to set and break)"
    - "Status alignment plan"
    - "Hook and intrigue elements"
    - "Prize positioning strategy"

  veto_conditions:
    - "No clear offer → STOP, run *define-offer first"
    - "Pitch over 20 minutes → STOP, trim ruthlessly"
    - "Begging or needy tone → STOP, reframe as the prize"

  elicitation:
    format: "numbered-questions"
    questions:
      - "What are you pitching? (Product, service, partnership, investment)"
      - "Who is the audience? (Title, personality, what they care about)"
      - "How long do you have? (Ideal: 20 minutes for pitch, 20 for discussion)"
      - "What is the BIGGEST thing at stake for the buyer if they don't act?"
      - "What makes your offer unique — what can ONLY you deliver?"
      - "What is the most compelling story/case study you have?"
      - "What frame will the buyer try to impose? (Analyst frame, power frame, time frame)"

  action_items:
    - step: "Design frame strategy (which frames to set, which to break)"
    - step: "Create STRONG sequence"
    - step: "Build prize positioning"
    - step: "Design status alignment approach"
    - step: "Create intrigue/tension elements"
    - step: "Write the 20-minute pitch script"

  frameworks:
    strong_method:
      S_set_frame: |
        Set your frame BEFORE the pitch begins.
        Whoever controls the frame controls the conversation.
        Types: Power frame, time frame, analyst frame, prize frame, intrigue frame.
      T_tell_story: |
        Tell a compelling narrative that engages emotion.
        Use the "man in the jungle" structure: relatable hero + challenge + resolution.
        Keep it brief, vivid, emotional.
      R_reveal_intrigue: |
        Create tension and curiosity. Don't reveal everything.
        Use incomplete information to keep attention.
        "There's one more thing that changes everything..."
      O_offer_prize: |
        Position yourself and your offer as the PRIZE.
        The buyer should feel they need to qualify to work with you.
        Scarcity + exclusivity + status.
      N_nail_hookpoint: |
        The hookpoint is the moment the buyer leans in.
        Hit it within the first 5 minutes or you've lost.
        It's the "aha" moment that changes their frame.
      G_get_decision: |
        Push for a decision (not necessarily a close).
        "Where do we go from here?"
        Create time constraint: this opportunity has a window.

    frame_control:
      power_frame: "When the buyer tries to dominate → use defiance + humor to seize control"
      analyst_frame: "When they want endless data → break with intrigue and emotional story"
      time_frame: "When they rush you → set your own time frame first"
      prize_frame: "Position yourself as the prize — they qualify to you"
      intrigue_frame: "When attention wanders → introduce unexpected tension"

  output_format: |
    ## STRONG Pitch: {offer name}

    ### Frame Strategy
    - **Your Frame:** {prize/authority/time}
    - **Expected Counter-Frame:** {power/analyst/time}
    - **Frame Break Technique:** {how to seize control}

    ### The Pitch (20 minutes)

    **Minutes 0-2: SET THE FRAME**
    {Opening statement that establishes your frame}
    {Status alignment move}

    **Minutes 2-7: TELL THE STORY**
    {Compelling narrative — man in the jungle structure}
    {Emotional hook}

    **Minutes 7-10: REVEAL THE INTRIGUE**
    {Tension builder — incomplete information}
    {The "one more thing" moment}

    **Minutes 10-15: OFFER THE PRIZE**
    {Position yourself as the prize}
    {Scarcity/exclusivity signals}
    {Social proof deployment}

    **Minutes 15-18: NAIL THE HOOKPOINT**
    {The "aha" moment — the insight that changes everything}
    {Why this matters NOW}

    **Minutes 18-20: GET THE DECISION**
    {Push for next step}
    {Time constraint}
    {Clean close}

    ### Status Alignment
    - {How to establish equal or higher status}
    - {What to do if they try to beta you}

    ### Prize Positioning
    - {Why they should qualify to work with you}
    - {Scarcity elements}
    - {Exclusivity signals}

    ### Next Steps
    → *spin-discovery if they need more qualification
    → *negotiate-deal when they engage on terms

  acceptance_criteria:
    - "Pitch fits in 20 minutes"
    - "Frame strategy defined with counter-frame plan"
    - "STRONG sequence is complete"
    - "Prize positioning is clear (not needy)"
    - "Hookpoint is identified and sharp"
```
