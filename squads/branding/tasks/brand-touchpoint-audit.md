# Brand Touchpoint Audit

```yaml
task:
  task_name: "Audit Brand Touchpoints"
  status: pending
  responsible_executor: emily-heyward
  execution_type: Agent
  estimated_time: "1-2h"
  elicit: true

  input:
    - "Brand strategy"
    - "Website URL"
    - "Marketing materials"
    - "Product screenshots"

  output:
    - "Touchpoint scorecard"
    - "Coherence analysis"
    - "Recommendations per touchpoint"

  action_items:
    - step: 1
      name: "Map Touchpoints"
      description: |
        Identify and list all brand touchpoints:
        1. Website (above the fold, key pages)
        2. Product/app (onboarding, key flows, errors)
        3. Email (welcome, transactional, marketing)
        4. Social media (profiles, content style)
        5. Packaging (physical, unboxing)
        6. Customer support (tone, speed, resolution)
        7. Advertising (paid, organic)
        8. Sales materials (decks, proposals)

    - step: 2
      name: "Score Each Touchpoint"
      description: |
        For each, score 1-10 on:
        - Brand alignment: Does it reflect the brand strategy?
        - Emotional impact: Does it make people feel something?
        - Consistency: Is it consistent with other touchpoints?
        - Quality: Is the execution high quality?

    - step: 3
      name: "Identify Gaps"
      description: |
        - Which touchpoints are OFF-brand?
        - Where is the emotional hook missing?
        - Where is inconsistency breaking trust?
        - Which touchpoint has the most impact if fixed?

    - step: 4
      name: "Prioritize Fixes"
      description: |
        Order by: Impact (high→low) × Effort (low→high)
        Quick wins first, then strategic improvements.

  output_example: |
    ## Touchpoint Scorecard — Synkra

    | Touchpoint | Alignment | Emotion | Consistency | Quality | Avg |
    |------------|-----------|---------|-------------|---------|-----|
    | Website (hero) | 9 | 8 | 9 | 9 | 8.8 |
    | Onboarding flow | 7 | 5 | 8 | 7 | 6.8 |
    | Welcome email | 6 | 4 | 5 | 6 | 5.3 |
    | Social media | 8 | 7 | 6 | 7 | 7.0 |
    | Error states | 4 | 3 | 5 | 4 | 4.0 |
    | Docs site | 8 | 6 | 7 | 8 | 7.3 |

    ### Top 3 Gaps
    1. **Error states (4.0):** Generic browser errors, no brand voice, no emotional recovery
    2. **Welcome email (5.3):** Template-style, no personality, missing brand narrative
    3. **Onboarding flow (6.8):** Functional but emotionally flat, no "aha moment" design

    ### Priority Fixes (Impact x Effort)
    | Priority | Touchpoint | Fix | Impact | Effort | Owner |
    |----------|------------|-----|--------|--------|-------|
    | 1 | Welcome email | Rewrite with brand voice + narrative arc | High | Low | emily-heyward |
    | 2 | Error states | Design branded error pages with helpful tone | High | Medium | michael-johnson |
    | 3 | Onboarding | Add emotional hooks at key moments | High | High | emily-heyward |

  acceptance_criteria:
    - "All touchpoints mapped and scored"
    - "Top 3 gaps identified"
    - "Priority fix list created"

  veto_conditions:
    - condition: "Touchpoint audit conducted without brand strategy as baseline"
      action: "VETO — cannot evaluate coherence without a reference point. Run brand-diagnosis first."
    - condition: "Scoring applied without defining scoring criteria per dimension"
      action: "VETO — subjective scores without criteria are meaningless. Define dimensions first."
    - condition: "Recommendations lack prioritization by impact"
      action: "VETO — an unordered list of fixes is not actionable. Prioritize by brand impact and effort."

  handoff:
    on_complete: "Pass to brand-chief for synthesis with overall brand audit"
    deliverable: "Touchpoint scorecard + priority fixes"
```
