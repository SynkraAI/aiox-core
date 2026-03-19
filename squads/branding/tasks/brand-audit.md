# Brand Audit

```yaml
task:
  task_name: "Execute Brand Audit"
  status: pending
  responsible_executor: brand-chief
  execution_type: Agent
  estimated_time: "2-4h"
  elicit: true

  input:
    - "Brand name"
    - "Logo / visual assets"
    - "Website URL"
    - "Brand guidelines (if exist)"
    - "Competitor list"
    - "Marketing materials"

  output:
    - "6-dimension audit scorecard"
    - "Priority action plan"
    - "Detailed findings per dimension"

  action_items:
    - step: 1
      name: "Collect Materials"
      description: |
        Gather from user:
        1. Brand name, tagline
        2. Logo files or screenshots
        3. Website URL
        4. Brand guidelines document (if any)
        5. Top 3-5 competitors
        6. Sample marketing materials
        7. Customer testimonials/reviews (if available)

    - step: 2
      name: "Audit Strategy Dimension"
      description: |
        Route to @marty-neumeier methodology:
        - Test onliness: "Is the brand the only ___ that ___?"
        - Measure brand gap (strategy vs experience)
        - Run charismatic brand test
        - Assess purpose clarity
        - Evaluate values specificity
        Score: 1-10

    - step: 3
      name: "Audit Positioning Dimension"
      description: |
        Route to @april-dunford methodology:
        - Identify competitive alternatives
        - Assess differentiated value clarity
        - Evaluate target customer definition
        - Check market category fit
        - Run one-word test
        Score: 1-10

    - step: 4
      name: "Audit Naming Dimension"
      description: |
        Route to @alexandra-watkins methodology:
        - SMILE test the brand name (5 criteria)
        - SCRATCH test the brand name (7 tests)
        - Evaluate tagline (if exists)
        Score: 1-10

    - step: 5
      name: "Audit Visual Identity Dimension"
      description: |
        Route to @michael-johnson methodology:
        - Check consistency across touchpoints
        - Evaluate color strategy mapping to personality
        - Assess typography hierarchy
        - Review imagery/photography style
        - Check brand guidelines completeness
        - Test scalability (16px to billboard)
        Score: 1-10

    - step: 6
      name: "Audit Logo Dimension"
      description: |
        Route to @sagi-haviv methodology:
        - Simplicity test (describe in 10 words, sketch from memory)
        - Distinctiveness (ownable in category?)
        - Versatility (mono, small, large, dark/light)
        - Timelessness (will it age well?)
        - Appropriateness (matches personality?)
        Score: 1-10

    - step: 7
      name: "Audit Brand Experience Dimension"
      description: |
        Route to @emily-heyward methodology:
        - Emotional hook test
        - Touchpoint coherence check
        - Movement potential assessment
        - Brand tension analysis
        - Shared enemy identification
        Score: 1-10

    - step: 8
      name: "Synthesize Report"
      description: |
        Compile:
        1. Score dashboard (6 dimensions + overall average)
        2. Strengths (scores 7+)
        3. Weaknesses (scores below 6)
        4. Priority actions (fix strategy first, always)
        5. Agent assignments per action

  output_example: |
    ## Brand Audit Report: Acme SaaS

    **Score Dashboard:**
    | Dimension | Score | Auditor | Key Finding |
    |-----------|-------|---------|-------------|
    | Strategy | 6/10 | @marty-neumeier | Onliness statement uses "best" — not provable |
    | Positioning | 5/10 | @april-dunford | Target is "businesses" — too broad |
    | Naming | 8/10 | @alexandra-watkins | Name scores 21/25 SMILE, passes SCRATCH |
    | Visual Identity | 4/10 | @michael-johnson | No typography hierarchy; colors inconsistent across web/print |
    | Logo | 7/10 | @sagi-haviv | Clean mark, works at scale; weak at 16px |
    | Brand Experience | 5/10 | @emily-heyward | No emotional hook; website feels transactional |
    | **Overall** | **5.8/10** | | |

    **Strengths:** Naming (8), Logo (7) — strong foundation to build on.
    **Weaknesses:** Visual Identity (4), Positioning (5), Experience (5).

    **Priority Actions:**
    1. Fix positioning — narrow target customer [@april-dunford]
    2. Rebuild visual identity system — color + type hierarchy [@michael-johnson]
    3. Rewrite onliness statement — remove superlatives [@marty-neumeier]
    4. Add emotional hook to homepage experience [@emily-heyward]

  acceptance_criteria:
    - "All 6 dimensions scored 1-10"
    - "Each dimension has specific findings"
    - "Actions prioritized correctly"
    - "Overall score calculated"

  veto_conditions:
    - "Missing brand materials for 3+ dimensions → partial audit only"
    - "Audit scores lack specific findings → VETO (scores without rationale are useless)"
    - "Recommendations without agent assignments → VETO (every fix must have an owner)"

  handoff:
    on_complete: "Present to user. Recommend workflow based on findings."
    deliverable: "Brand Audit Report"
```
