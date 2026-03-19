# Brand Diagnosis

```yaml
task:
  task_name: "Diagnose Brand Strategy"
  status: pending
  responsible_executor: marty-neumeier
  execution_type: Agent
  estimated_time: "1-2h"
  elicit: true

  input:
    - "Business description (what the company does)"
    - "Target market"
    - "Competitor landscape"
    - "Founder's vision"

  output:
    - "Brand Gap analysis"
    - "Onliness statement"
    - "Brand Ladder"
    - "Charismatic Brand Test results"
    - "Brand archetype selection"

  action_items:
    - step: 1
      name: "Gather Context"
      description: |
        Ask the user:
        1. What does your company/product do?
        2. Who is your ideal customer?
        3. Who are your top 3 competitors?
        4. Why did you start this? What frustrates you about the status quo?
        5. If your brand were a person, how would they act?

    - step: 2
      name: "Brand Gap Analysis"
      description: |
        Assess the 5 Disciplines (Neumeier):
        1. DIFFERENTIATE — How clear is the brand's distinction?
        2. COLLABORATE — Is the brand co-created with customers?
        3. INNOVATE — Is the brand pushing boundaries?
        4. VALIDATE — Is the brand tested with real people?
        5. CULTIVATE — Is the brand being grown systematically?
        Score each 1-10. Identify gaps.

    - step: 3
      name: "Onliness Exercise (Zag)"
      description: |
        Fill in the Zag template:
        "Our brand is the ONLY _________ that _________."

        Requirements:
        - The first blank = your category
        - The second blank = your unique value
        - Must be TRUE and PROVABLE
        - Must NOT use superlatives (best, leading, #1)

    - step: 4
      name: "Brand Ladder"
      description: |
        Build from bottom to top:
        1. FEATURES — What does the product do?
        2. BENEFITS — What does the customer get?
        3. VALUES — What does the brand stand for?
        4. IDENTITY — How does the brand make people feel about THEMSELVES?

    - step: 5
      name: "Charismatic Brand Test"
      description: |
        Score the brand on 5 criteria:
        1. Does it have a clear ENEMY?
        2. Does it inspire CULT-LIKE devotion?
        3. Is there a clear BEFORE/AFTER transformation?
        4. Would customers TATTOO the logo?
        5. Does the brand CREATE CULTURE?
        Score each 1-10. 40+ = charismatic.

    - step: 6
      name: "Archetype Selection"
      description: |
        Using data/brand-archetypes.md:
        1. Map customer desires to archetype desires
        2. Map customer fears to archetype fears
        3. Select primary archetype (1 only)
        4. Optionally select secondary (max 1)
        5. Document rationale

  output_example: |
    ## Brand Diagnosis: Synkra

    **Onliness Statement:**
    "Synkra is the ONLY AI development orchestrator that coordinates specialized agents through story-driven workflows."

    **Brand Gap Scores:**
    | Discipline    | Score | Finding |
    |--------------|-------|---------|
    | Differentiate | 8/10  | Clear "AI orchestration" niche, no direct competitor uses agent-squad model |
    | Collaborate   | 5/10  | Limited community input; roadmap is founder-driven |
    | Innovate      | 9/10  | Novel meta-framework approach, ahead of market |
    | Validate      | 3/10  | No formal brand testing with users yet |
    | Cultivate     | 4/10  | Brand applied inconsistently across docs vs product |

    **Brand Ladder:**
    - IDENTITY: "I'm the developer who doesn't waste time on boilerplate"
    - VALUES: Precision, autonomy, craftsmanship
    - BENEFITS: Ship 3x faster with consistent quality
    - FEATURES: Agent squads, story-driven dev, automated QA gates

    **Charismatic Brand Test:** 32/50
    - Clear enemy (chaotic AI-assisted coding): 8/10
    - Cult devotion: 5/10 — too early
    - Before/After: 9/10 — strong transformation narrative
    - Tattoo test: 4/10 — logo not iconic yet
    - Creates culture: 6/10 — "story-driven" methodology emerging

    **Archetype:** The Magician (primary), The Sage (secondary)
    Rationale: Transforms complexity into simplicity; users feel empowered, not dependent.

  acceptance_criteria:
    - "Onliness statement is specific, true, and provable"
    - "Brand Gap scored on all 5 disciplines"
    - "Brand Ladder complete (all 4 levels)"
    - "Archetype selected with documented rationale"
    - "Charismatic Brand Test scored"

  veto_conditions:
    - "Onliness uses 'best' or 'leading' → VETO"
    - "Brand Ladder skips the Identity level → VETO"
    - "No competitive context provided → VETO"

  handoff:
    on_complete: "Pass to april-dunford for positioning"
    deliverable: "Brand strategy document"
```
