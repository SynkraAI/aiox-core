# Handle Objection

```yaml
task:
  name: "Handle Specific Objection"
  id: handle-objection
  version: "1.0.0"
  executor: negotiation-chief
  execution_type: Agent
  estimated_time: "5-15min"
  elicit: true

  purpose: |
    Handle a specific objection using the most appropriate framework
    from our expert team. Routes to the right methodology based on
    the type and context of the objection.

  input:
    - "The specific objection (exact words if possible)"
    - "Context (when and where it came up)"
    - "What has been tried already"

  output:
    - "Framework-matched response strategy"
    - "Specific scripts to use"
    - "Root cause analysis (why they really object)"

  veto_conditions:
    - "Trying to bulldoze past a valid objection → STOP, listen first"

  elicitation:
    format: "numbered-questions"
    questions:
      - "What is the exact objection? (Quote them if possible)"
      - "When did it come up? (During prospecting, pitch, negotiation, closing)"
      - "What do you think is the REAL reason behind it?"
      - "What have you already tried?"

  routing:
    price_objection:
      expert: "@chris-voss"
      technique: "Calibrated question: 'How am I supposed to do that?'"
      alternative: "@william-ury: Explore interests behind the price position"

    timing_objection:
      expert: "@neil-rackham"
      technique: "Implication questions: What's the cost of waiting?"
      alternative: "@jim-camp: Budget analysis (their time budget is running out)"

    competitor_objection:
      expert: "@oren-klaff"
      technique: "Reframe: Prize positioning + frame control"
      alternative: "@robert-cialdini: Social proof + authority signals"

    authority_objection:
      expert: "@jim-camp"
      technique: "Find the real decision-maker"
      alternative: "@jeb-blount: New prospecting approach to reach decision-maker"

    trust_objection:
      expert: "@robert-cialdini"
      technique: "Authority + social proof + reciprocity"
      alternative: "@chris-voss: Accusation audit to surface hidden concerns"

    no_need_objection:
      expert: "@neil-rackham"
      technique: "SPIN Problem + Implication questions to reveal hidden pain"

  output_format: |
    ## Objection Response: "{the objection}"

    ### Root Cause Analysis
    **Surface Objection:** {what they said}
    **Likely Real Concern:** {what's actually behind it}
    **Expert Framework:** {which expert and technique}

    ### Response Strategy
    **Step 1:** {first thing to say/do}
    **Step 2:** {follow-up}
    **Step 3:** {close the loop}

    ### Exact Script
    ```
    {word-for-word response to use}
    ```

    ### If It Doesn't Work
    → Escalate to: {alternative expert/technique}
    → Fallback: {what to do if objection persists}

  acceptance_criteria:
    - "Root cause identified (not just surface objection)"
    - "Expert framework matched to objection type"
    - "Specific script provided"
    - "Fallback strategy exists"
```
