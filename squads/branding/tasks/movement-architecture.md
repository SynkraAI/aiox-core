# Movement Architecture

```yaml
task:
  task_name: "Design Brand Movement Architecture"
  status: pending
  responsible_executor: emily-heyward
  execution_type: Agent
  estimated_time: "1-2h"
  elicit: true

  input:
    - "Complete brand identity (strategy + positioning + name + visual)"
    - "Business context"

  output:
    - "Brand Soul Canvas"
    - "Movement architecture"
    - "Emotional hook definition"
    - "Touchpoint plan"
    - "Launch narrative"

  action_items:
    - step: 1
      name: "Identify Emotional Hook"
      description: |
        Ask:
        1. What frustration exists in this category that NO ONE talks about?
        2. What aspiration do customers have that current brands ignore?
        3. What would make someone say "FINALLY, someone gets it"?

        The emotional hook = the gap between what exists and what should exist.

    - step: 2
      name: "Build Brand Narrative"
      description: |
        Three-act structure:
        1. TENSION: The world is broken because [shared enemy]
        2. BELIEF: We believe [brand worldview]
        3. RESOLUTION: That's why we built [brand] to [transformation]

        Test: Would someone share this story with a friend?

    - step: 3
      name: "Complete Brand Soul Canvas"
      description: |
        Fill all 7 blocks:
        | Block | Content |
        |-------|---------|
        | Founding Myth | The story of the struggle that birthed the brand |
        | The Why | Why would the world be worse without this brand? |
        | Shared Enemy | The status quo you exist to disrupt |
        | Sacred Values | 3-5 non-negotiables (hiring/firing decisions) |
        | Rituals | Internal + external behaviors reinforcing identity |
        | The Lexicon | Specific language used by the tribe |
        | Brand Tension | Two opposing forces the brand balances |

    - step: 4
      name: "Design Movement Architecture"
      description: |
        1. SHARED ENEMY: What are we fighting against?
        2. RALLYING CRY: What's our battle call? (not a tagline — a belief)
        3. TRIBE RITUALS: What do our believers DO?
           - Onboarding ritual (first experience)
           - Regular ritual (recurring engagement)
           - Initiation ritual (becoming an insider)
        4. TRIBE SIGNALS: How do members recognize each other?
        5. ESCALATION: How do casual users become evangelists?

    - step: 5
      name: "Touchpoint Plan"
      description: |
        For each touchpoint, define how it reinforces the brand belief:
        1. Website above the fold — First impression
        2. Onboarding flow — First experience
        3. Packaging/unboxing — Physical encounter
        4. Email communications — Ongoing relationship
        5. Social media — Public personality
        6. Customer support — Crisis moment
        7. Error states — When things go wrong
        8. Success moments — Celebration

    - step: 6
      name: "Launch Narrative"
      description: |
        Create the story for launch:
        - Who are we?
        - Why now?
        - What do we believe?
        - What are we fighting against?
        - What happens when you join us?

        Format: 500-word brand manifesto.

  output_example: |
    ## Brand Soul Canvas — Synkra

    | Block | Content |
    |-------|---------|
    | Founding Myth | Born from the chaos of managing 12 AI tools that didn't talk to each other |
    | The Why | Without Synkra, dev teams drown in AI tool fragmentation |
    | Shared Enemy | The "AI tool sprawl" — 50 AI products, zero orchestration |
    | Sacred Values | 1. Clarity over complexity 2. Systems over hacks 3. Human judgment first |
    | Rituals | Weekly "orchestration review," onboarding "first flow" moment |
    | The Lexicon | "Orchestrate" not "automate," "squad" not "team," "flow" not "pipeline" |
    | Brand Tension | Powerful capability x Simple interface |

    ## Movement Architecture
    - **Shared Enemy:** The fragmented AI stack that wastes 40% of dev time
    - **Rallying Cry:** "One system to orchestrate them all"
    - **Tribe Rituals:**
      - Onboarding: First successful multi-agent flow (the "aha" moment)
      - Regular: Weekly orchestration review with squad metrics
      - Initiation: Publishing your first custom squad template
    - **Escalation Path:** User → Power user → Squad builder → Community contributor

    ## Emotional Hook
    "You didn't become a developer to babysit 12 disconnected AI tools.
    You became a developer to build things that matter."

  acceptance_criteria:
    - "Brand Soul Canvas all 7 blocks filled"
    - "Emotional hook is specific and resonant"
    - "Movement architecture has shared enemy"
    - "Touchpoint plan covers 8 key moments"
    - "Launch narrative is emotion-first"

  veto_conditions:
    - "No emotional hook → VETO"
    - "Brand narrative leads with features → VETO"
    - "Sacred values are generic → VETO"

  handoff:
    on_complete: "Present to brand-chief for final review"
    deliverable: "Brand Soul Canvas + Movement Architecture + Launch Narrative"
```
