# Close Deal

```yaml
task:
  name: "Strategic Closing"
  id: close-deal
  version: "1.0.0"
  executor: jim-camp
  execution_type: Agent
  estimated_time: "20-30min"
  elicit: true

  purpose: |
    Design a strategic closing approach using Jim Camp's "Start With No" system.
    Close deals through mission-driven negotiation, budget analysis,
    and the power of giving them the right to say "no".

  input:
    - "Deal context (what was negotiated)"
    - "Current terms / where things stand"
    - "Decision-maker information"
    - "Remaining objections or blockers"

  output:
    - "Closing strategy with mission statement"
    - "4-budget analysis (time, energy, money, emotion)"
    - "Agenda for closing conversation"
    - "Decision-maker engagement plan"
    - "Neediness elimination checklist"

  veto_conditions:
    - "Discovery not complete → STOP, qualify first with *spin-discovery"
    - "Showing neediness → STOP, eliminate neediness before closing"
    - "No decision-maker identified → STOP, find the real decision-maker"

  elicitation:
    format: "numbered-questions"
    questions:
      - "Where does the deal stand right now? What's been agreed?"
      - "What's still unresolved?"
      - "Who is the final decision-maker? Have you spoken to them directly?"
      - "What is THEIR mission? What are they trying to achieve?"
      - "What is the buyer's emotional state? (Excited, cautious, resistant, confused)"
      - "What is your biggest fear about this close?"
      - "On a scale of 1-10, how needy do you feel about this deal?"

  action_items:
    - step: "Define the mission (purpose of the closing conversation)"
    - step: "Analyze 4 budgets (theirs and yours)"
    - step: "Eliminate neediness signals"
    - step: "Create blank slate approach (no assumptions)"
    - step: "Build closing agenda"
    - step: "Prepare no-based closing questions"

  frameworks:
    start_with_no:
      philosophy: |
        "No" is not rejection — it's the beginning of real negotiation.
        Give them the right to say no. It eliminates pressure,
        builds trust, and paradoxically makes them more likely to say yes.
        NEVER be needy. Need kills deals.

      mission_and_purpose:
        what: "Define YOUR mission for the negotiation"
        rule: "Mission is about THEIR world, not yours"
        format: "'My mission is to help {them} achieve {their goal}'"
        anti_pattern: "'My mission is to close this deal' — this is about YOU, not them"

      four_budgets:
        time: "How much time has each side invested? More time = more committed."
        energy: "How much mental/emotional energy is at stake?"
        money: "What's the financial investment/risk on each side?"
        emotion: "What emotions are driving the decision? Fear? Excitement? Relief?"

      blank_slate:
        what: "Enter with ZERO assumptions about what they'll do"
        rule: "Don't assume they'll say yes OR no"
        technique: "Ask questions. Listen. Let THEM reveal their position."

      neediness_elimination:
        signs_of_need:
          - "Talking too much"
          - "Offering concessions they didn't ask for"
          - "Following up too frequently"
          - "Showing excitement about closing"
          - "Dropping price unprompted"
        cure: "You don't NEED this deal. You WANT it. Big difference."

      no_based_questions:
        examples:
          - "'Would it be a terrible idea if we...?'"
          - "'Is it too late to...?'"
          - "'Would you be against...?'"
          - "'Have you given up on...?'"
        why: "People feel safe saying no. When they say no to a negative, they mean yes."

  output_format: |
    ## Closing Strategy: {deal description}

    ### Mission Statement
    "My mission is to help {buyer} achieve {their specific goal}
    by {how your solution helps}."

    ### 4-Budget Analysis
    | Budget | Theirs | Yours | Implication |
    |--------|--------|-------|-------------|
    | Time | {time invested} | {time invested} | {who has more at stake?} |
    | Energy | {energy level} | {energy level} | {who's more exhausted?} |
    | Money | {$ at stake} | {$ at stake} | {who has more financial pressure?} |
    | Emotion | {emotional state} | {emotional state} | {who's more emotional?} |

    ### Neediness Check
    - [ ] I don't NEED this deal — I have alternatives
    - [ ] I won't offer concessions they didn't ask for
    - [ ] I won't talk more than 40% of the conversation
    - [ ] I won't show excitement about closing
    - [ ] I have a clear walk-away point

    ### Closing Agenda
    1. **Open:** {blank slate — ask where they stand}
    2. **Mission:** {reframe around their goals}
    3. **Budget Check:** {verify all 4 budgets align}
    4. **No-Based Close:** {ask permission-to-close question}
    5. **Decision:** {handle their response}
    6. **Next Steps:** {immediate action if yes}

    ### Closing Scripts

    **No-Based Close:**
    "{No-based question that invites commitment}"

    **If They Hesitate:**
    "Is there something I'm missing? Help me understand what's holding things up."

    **If They Say No:**
    "I appreciate that. Can you help me understand what's behind that?"
    (Use blank slate — no assumptions about WHY)

    **If They Need More Time:**
    "That's completely fine. What would be most helpful for you to make a decision?"

    ### Next Steps
    → Deal closed → document terms and celebrate
    → Objection surfaces → *handle-objection
    → Need to renegotiate terms → *negotiate-deal

  acceptance_criteria:
    - "Mission is about THEIR goals, not yours"
    - "4 budgets analyzed for both sides"
    - "Neediness eliminated (checklist passes)"
    - "Closing agenda with blank slate approach"
    - "No-based questions prepared"
    - "Response scripts for yes, no, and maybe"
```
