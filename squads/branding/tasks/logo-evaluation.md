# Logo Evaluation

```yaml
task:
  task_name: "Evaluate Logo Design"
  status: pending
  responsible_executor: sagi-haviv
  execution_type: Agent
  estimated_time: "30-60min"
  elicit: true

  input:
    - "Logo file/description"
    - "Brand strategy context"
    - "Competitor logos"

  output:
    - "5-pillar evaluation scorecard"
    - "Simplicity test results"
    - "Recommendations"

  action_items:
    - step: 1
      name: "5-Pillar Evaluation"
      description: |
        Score 1-10 on each:
        1. APPROPRIATENESS — Does it fit the brand personality?
        2. DISTINCTIVENESS — Is it ownable in its category?
        3. SIMPLICITY — Can you describe in 10 words? Sketch from memory?
        4. MEMORABILITY — Does it stick after one viewing?
        5. TIMELESSNESS — Will it look relevant in 10+ years?

    - step: 2
      name: "Simplicity Test"
      description: |
        5 questions (pass/fail):
        1. Describable in 10 words or fewer?
        2. Sketchable from memory?
        3. Recognizable at 16px?
        4. Works in one color?
        5. Could a child approximate it?

    - step: 3
      name: "Application Check"
      description: |
        Does the logo work in:
        - Horizontal lockup
        - Vertical/stacked lockup
        - Icon only
        - Favicon (16x16, 32x32)
        - Social avatar (circular)
        - Monochrome (black, white, reversed)
        - On dark backgrounds
        - On light backgrounds
        - At billboard scale

    - step: 4
      name: "Recommendations"
      description: |
        Based on scores:
        - 40+/50: Strong logo. Minor refinements only.
        - 30-39: Good foundation. Specific improvements needed.
        - 20-29: Significant weaknesses. Major rework recommended.
        - <20: Does not meet minimum standards. Redesign.

  output_example: |
    ## Logo Evaluation: Synkra

    **5-Pillar Scorecard:**
    | Pillar | Score | Finding |
    |--------|-------|---------|
    | Appropriateness | 8/10 | Geometric precision matches tech/orchestration personality |
    | Distinctiveness | 7/10 | Ownable in dev tools; slightly generic in broader tech |
    | Simplicity | 9/10 | Three interlocking arcs — describable, sketchable |
    | Memorability | 7/10 | Clean shape sticks; needs more character to reach 9+ |
    | Timelessness | 8/10 | No gradients or trends; pure geometry ages well |
    | **Total** | **39/50** | **Good foundation. Minor refinements needed.** |

    **Simplicity Test:** 4/5 PASS
    - Describable in 10 words: PASS ("Three arcs forming an S-shape")
    - Sketchable from memory: PASS
    - Recognizable at 16px: PASS
    - Works in one color: PASS
    - Child could approximate: FAIL (arc alignment too precise)

    **Application Check:** All formats work. Favicon strong. Circular crop needs padding adjustment.

    **Recommendation:** Score 39/50 — strong logo. Refine arc weight for better 16px rendering. Consider adding a subtle detail to boost memorability.

  acceptance_criteria:
    - "All 5 pillars scored"
    - "Simplicity test completed"
    - "Application check documented"
    - "Clear recommendations provided"

  veto_conditions:
    - "Logo fails 3+ simplicity test questions → recommend redesign"
    - "Logo scores <5 on appropriateness → misaligned with brand"

  handoff:
    on_complete: "Pass recommendations to michael-johnson for brand guidelines integration"
    deliverable: "Logo evaluation scorecard + recommendations"
```
