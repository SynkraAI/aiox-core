# Prospect Outreach

```yaml
task:
  name: "Multi-Channel Prospecting Outreach"
  id: prospect-outreach
  version: "1.0.0"
  executor: jeb-blount
  execution_type: Agent
  estimated_time: "30-45min"
  elicit: true

  purpose: |
    Create a structured multi-channel prospecting plan using Jeb Blount's
    Fanatical Prospecting methodology. Build pipeline through disciplined,
    daily outreach across phone, email, text, social, and in-person channels.

  input:
    - "Dream 100 list or target prospects"
    - "Offer definition"
    - "Current pipeline status"

  output:
    - "Multi-channel outreach plan"
    - "Phone prospecting script (5-step framework)"
    - "Email prospecting templates"
    - "Text message framework (7-step)"
    - "Social selling approach"
    - "Time-blocking schedule"
    - "Pipeline math (activity → results)"

  veto_conditions:
    - "No prospects identified → STOP, run *identify-dream-clients first"
    - "No offer defined → STOP, run *define-offer first"
    - "Expecting results without daily activity → STOP, commitment required"

  elicitation:
    format: "numbered-questions"
    questions:
      - "Do you have a prospect list ready? (If not, run *identify-dream-clients first)"
      - "What channels do you currently use? (Phone, email, LinkedIn, text, in-person)"
      - "How many hours per day can you dedicate to prospecting?"
      - "What is your current pipeline size? (Number of active opportunities)"
      - "What is your target: How many new conversations per week?"
      - "What is your close rate? (Proposals → Closed deals)"

  action_items:
    - step: "Calculate pipeline math (30-Day Rule)"
    - step: "Create 5-step phone prospecting script"
    - step: "Create email prospecting templates (3 versions)"
    - step: "Create 7-step text message sequence"
    - step: "Design LinkedIn/social outreach approach"
    - step: "Build time-blocking schedule (Golden Hours)"
    - step: "Define follow-up cadence and rules"

  frameworks:
    fanatical_prospecting:
      law_of_replacement: |
        You must replace what you take out of the pipeline.
        Pipeline math: If you need 10 deals/month and close 20%,
        you need 50 proposals, which means 150 conversations,
        which means 500+ touches per month.
      golden_hours: |
        Prospect during peak hours (8-10 AM, 4-6 PM).
        NEVER do admin during Golden Hours.
        Block 2-3 hours of uninterrupted prospecting daily.
      30_day_rule: |
        The prospecting you do in any 30-day period pays off
        for the next 90 days. If you stop prospecting today,
        your pipeline dries up in 90 days.

    phone_5_step:
      - "Get attention (use their name, reference something specific)"
      - "Identify yourself (brief, confident)"
      - "State purpose (why you're calling — value, not pitch)"
      - "Bridge to meeting (connect value to their situation)"
      - "Ask for commitment (specific day/time)"

    text_7_step:
      - "Identify yourself"
      - "Reference connection point"
      - "State brief value"
      - "Ask one simple question"
      - "Follow up if no response (24hr)"
      - "Add value (share resource)"
      - "Final ask (meeting/call)"

  output_format: |
    ## Prospecting Outreach Plan

    ### Pipeline Math
    - **Monthly Goal:** {X} closed deals
    - **Close Rate:** {Y}%
    - **Proposals Needed:** {Z}
    - **Conversations Needed:** {W}
    - **Daily Touch Target:** {V}

    ### Phone Script (5-Step)
    ```
    "Hi {name}, this is {your name} from {company}.
    {Attention hook — reference to their company/industry}.
    The reason I'm calling is {value statement — not a pitch}.
    {Bridge — how this connects to their situation}.
    Would {day} at {time} work for a brief conversation?"
    ```

    ### Email Templates
    **Template 1: Initial Outreach**
    Subject: {subject line}
    Body: {email body with value proposition}

    **Template 2: Follow-up (no response)**
    Subject: Re: {original subject}
    Body: {follow-up with added value}

    **Template 3: Break-up Email**
    Subject: {closing subject}
    Body: {final attempt — permission to close the file}

    ### Text Message Sequence
    {7 messages with timing}

    ### Time-Blocking Schedule
    | Time | Mon | Tue | Wed | Thu | Fri |
    |------|-----|-----|-----|-----|-----|
    | 8-10 AM | Phone Block | Phone Block | Phone Block | Phone Block | Phone Block |
    | 10-12 PM | Email + Social | Meetings | Email + Social | Meetings | Email + Social |
    | 1-3 PM | Follow-ups | Follow-ups | Follow-ups | Follow-ups | Review |
    | 4-6 PM | Phone Block | Phone Block | Phone Block | Phone Block | Pipeline Review |

    ### Next Steps
    → *create-pitch for when prospects agree to meet
    → *handle-objection for common prospecting objections

  acceptance_criteria:
    - "Pipeline math calculated and realistic"
    - "Phone script complete with 5 steps"
    - "3 email templates created"
    - "Text sequence defined"
    - "Time-blocking schedule created"
    - "Daily activity targets set"
```
