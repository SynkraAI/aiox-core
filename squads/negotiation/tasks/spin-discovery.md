# SPIN Discovery

```yaml
task:
  name: "SPIN Selling Discovery Session"
  id: spin-discovery
  version: "1.0.0"
  executor: neil-rackham
  execution_type: Agent
  estimated_time: "30-45min"
  elicit: true

  purpose: |
    Conduct a structured discovery session using Neil Rackham's SPIN Selling
    methodology. Qualify the opportunity by mapping Situation, Problems,
    Implications, and Need-Payoff through strategic questioning.
    Prevent objections rather than handling them.

  input:
    - "Prospect information (company, role, industry)"
    - "Offer definition"
    - "Buyer profile (if available from *profile-buyer)"
    - "Meeting context"

  output:
    - "SPIN question set tailored to this prospect"
    - "Objection prevention strategy"
    - "Qualified opportunity assessment"
    - "Value map (pain → impact → solution)"

  veto_conditions:
    - "No information about the prospect → STOP, minimum research needed"
    - "Trying to close in a discovery call → STOP, discovery first"
    - "Asking too many Situation questions → STOP, max 3-4, move to Problems"

  elicitation:
    format: "numbered-questions"
    questions:
      - "Who is the prospect? (Company, size, industry, your contact's role)"
      - "What do you already know about their situation?"
      - "What problems do you THINK they have that you can solve?"
      - "What is the likely financial impact of these problems?"
      - "What is your offer's average deal size for this type of client?"
      - "Is this a new opportunity or an existing relationship?"

  action_items:
    - step: "Research prospect (minimum context gathering)"
    - step: "Design Situation questions (max 4 — don't bore them)"
    - step: "Design Problem questions (uncover pain)"
    - step: "Design Implication questions (amplify pain — cost of NOT solving)"
    - step: "Design Need-Payoff questions (buyer sells themselves)"
    - step: "Create objection prevention strategy"
    - step: "Generate complete SPIN question flow"

  frameworks:
    spin_selling:
      philosophy: |
        In large sales, the relationship between closing techniques and success
        is INVERSE. The more you push to close, the less likely you close.
        Instead, ask questions that make the buyer realize they NEED your solution.

      S_situation:
        purpose: "Understand current state (facts, context)"
        rule: "MAX 3-4 questions. These are boring for the buyer. Do research first."
        examples:
          - "How are you currently handling {process}?"
          - "What systems do you use for {function}?"
          - "How large is your team for {area}?"
        anti_pattern: "Asking 10+ situation questions = lazy research"

      P_problem:
        purpose: "Uncover dissatisfaction, difficulties, problems"
        rule: "These questions develop the buyer's awareness of pain"
        examples:
          - "What challenges do you face with {current approach}?"
          - "How often does {problem scenario} occur?"
          - "What's the most frustrating part of {process}?"
        anti_pattern: "Moving to solution before problems are clear"

      I_implication:
        purpose: "Amplify the pain — what's the COST of the problem?"
        rule: "MOST IMPORTANT for large sales. Make the buyer feel the weight."
        examples:
          - "What effect does {problem} have on {key metric}?"
          - "How does that impact your team's productivity?"
          - "If this continues for another year, what's the total cost?"
          - "How does this affect your ability to {strategic goal}?"
        anti_pattern: "Skipping implications = buyer doesn't feel urgency"

      N_need_payoff:
        purpose: "Get the buyer to articulate the value of solving the problem"
        rule: "The BUYER sells themselves. They describe the benefits."
        examples:
          - "If you could solve {problem}, what would that mean for {metric}?"
          - "How would {improved state} help your team?"
          - "What would it be worth to eliminate {pain}?"
          - "If we could {solution}, how would that change your {KPI}?"
        anti_pattern: "Telling them the benefits instead of asking"

    objection_prevention:
      principle: |
        In SPIN Selling, objections are a sign of poor questioning.
        If you properly develop Implication and Need-Payoff questions,
        the buyer already understands why they need your solution.
        Objections become unnecessary.

  output_format: |
    ## SPIN Discovery Plan: {prospect name/company}

    ### Pre-Call Research Summary
    - {What you already know}
    - {Research gaps to fill}

    ### SPIN Question Flow

    **SITUATION (max 4 — get facts)**
    1. "{S question 1}"
    2. "{S question 2}"
    3. "{S question 3}"

    **PROBLEM (uncover pain)**
    1. "{P question 1}"
    2. "{P question 2}"
    3. "{P question 3}"
    4. "{P question 4}"

    **IMPLICATION (amplify cost — CRITICAL)**
    1. "{I question 1}"
    2. "{I question 2}"
    3. "{I question 3}"
    4. "{I question 4}"
    5. "{I question 5}"

    **NEED-PAYOFF (buyer sells themselves)**
    1. "{N question 1}"
    2. "{N question 2}"
    3. "{N question 3}"

    ### Objection Prevention Map
    | Likely Objection | Prevention Question | When to Ask |
    |-----------------|-------------------|-------------|
    | "Too expensive" | "{Implication Q about cost of NOT solving}" | After Problem Qs |
    | "We're fine as-is" | "{Problem Q revealing hidden pain}" | Early in Problem phase |

    ### Opportunity Qualification
    - **Pain Level:** {1-10}
    - **Budget Authority:** {yes/no/unclear}
    - **Decision Timeline:** {timeframe}
    - **Competition:** {known alternatives}
    - **Recommendation:** {Pursue aggressively / Nurture / Disqualify}

    ### Next Steps
    → *create-pitch if qualified and needs presentation
    → *negotiate-deal if ready to discuss terms
    → *handle-objection if specific resistance surfaces

  acceptance_criteria:
    - "Max 4 Situation questions"
    - "At least 4 Problem questions targeting real pains"
    - "At least 5 Implication questions that amplify cost"
    - "At least 3 Need-Payoff questions"
    - "Objection prevention strategy included"
    - "Opportunity qualification assessment"
```
