# Naming Exercise

```yaml
task:
  task_name: "Execute Brand Naming"
  status: pending
  responsible_executor: alexandra-watkins
  execution_type: Agent
  estimated_time: "1-2h"
  elicit: true

  input:
    - "Brand strategy document"
    - "Positioning canvas"
    - "Domain/trademark constraints"

  output:
    - "Naming creative brief"
    - "50+ name candidates"
    - "Top 5 finalists with SMILE/SCRATCH scores"
    - "Recommended name with rationale"
    - "Tagline options"

  action_items:
    - step: 1
      name: "Creative Brief"
      description: |
        Document:
        1. What the brand does (one sentence)
        2. Who it's for (target characteristics)
        3. What it should FEEL like (3 adjectives)
        4. What it should NOT feel like (3 adjectives)
        5. Competitor names to AVOID similarity to
        6. Constraints (domain availability, trademark, language)

    - step: 2
      name: "Name Storm"
      description: |
        Generate 50+ candidates using 8 techniques:
        1. Word associations (from brand values)
        2. Metaphors (what is the brand LIKE?)
        3. Compound words (two words merged)
        4. Portmanteaus (blended words)
        5. Foreign words (relevant languages)
        6. Mythology/history references
        7. Evocative imagery (what picture does it paint?)
        8. Sound symbolism (does it SOUND like what it is?)

    - step: 3
      name: "SMILE Test"
      description: |
        Score each candidate 1-5 on:
        S = Suggestive (evokes brand meaning)
        M = Memorable (sticks in memory)
        I = Imagery (triggers visual)
        L = Legs (extension potential)
        E = Emotional (moves people)

        Total possible: 25. Keep candidates scoring 18+.

    - step: 4
      name: "SCRATCH Test"
      description: |
        Eliminate if ANY apply:
        S = Spelling-challenged (hard to spell)
        C = Copycat (too similar to competitor)
        R = Restrictive (limits future growth)
        A = Annoying (forced puns, groan-worthy)
        T = Tame (bland, forgettable)
        C = Curse of Knowledge (insiders only)
        H = Hard to pronounce (fails radio test)

        One fail = elimination.

    - step: 5
      name: "Shortlist & Present"
      description: |
        Top 5-10 candidates:
        - Name
        - SMILE score (/25)
        - SCRATCH result (PASS/FAIL per criterion)
        - Rationale (why this name works)
        - Domain check (available? alternatives?)
        - Tagline pairing possibility

    - step: 6
      name: "Tagline Creation"
      description: |
        For the top 3 names, create 3 tagline options each.

        Rules:
        - 7 words or fewer
        - Works without the brand name
        - Passes the t-shirt test
        - Types: Imperative, Descriptive, Provocative

  output_example: |
    ## Naming Exercise: Top 5 Finalists

    | Rank | Name | SMILE | S | C | R | A | T | C | H | Rationale |
    |------|------|-------|---|---|---|---|---|---|---|-----------|
    | 1 | **Synkra** | 22/25 | P | P | P | P | P | P | P | Evokes "sync" + "craft"; short, ownable, global |
    | 2 | Orkos | 20/25 | P | P | P | P | P | P | P | From "orchestrate"; strong, memorable |
    | 3 | Condukt | 19/25 | P | P | P | P | P | F | P | "Conduct" as in orchestra; spelling may confuse |
    | 4 | Fluxon | 19/25 | P | P | P | P | P | P | P | Flow + motion; modern feel |
    | 5 | Agora | 18/25 | P | F | P | P | P | P | P | Greek marketplace; may conflict with existing brands |

    **Recommendation:** Synkra
    - SMILE breakdown: S=5, M=5, I=4, L=4, E=4
    - Domain: synkra.com available
    - Trademark: No conflicts in software class
    - Why it wins: Instantly suggests synchronization and precision. Two syllables, globally pronounceable, no negative connotations in major languages.

    **Tagline Options:**
    1. "Orchestrate everything." (Imperative)
    2. "Your agents. Your workflow." (Descriptive)
    3. "Stop prompting. Start shipping." (Provocative)

  acceptance_criteria:
    - "50+ candidates generated and documented"
    - "Top 5 all score 18+ on SMILE"
    - "Top 5 all pass SCRATCH"
    - "Recommended name has full rationale"
    - "At least 3 tagline options"

  veto_conditions:
    - "Name fails SCRATCH → cannot be recommended"
    - "Name requires explanation → VETO"
    - "Fewer than 30 candidates generated → insufficient exploration"

  handoff:
    on_complete: "Pass to michael-johnson + sagi-haviv for visual identity"
    deliverable: "Selected name + tagline + naming brief"
```
