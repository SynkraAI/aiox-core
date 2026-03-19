# Coherence Check

## Task Definition

```yaml
task:
  name: "Cross-Phase Brand Coherence Check"
  id: coherence-check
  status: pending
  responsible_executor: brand-chief
  execution_type: Agent
  estimated_time: "15-30 minutes"
  elicit: true

  description: |
    Verifies alignment between all brand phases — strategy, positioning, naming,
    visual identity, and activation. Ensures no phase contradicts another and
    the brand story is coherent end-to-end.

  input:
    - "Brand strategy document (from diagnosis phase)"
    - "Positioning canvas (from positioning phase)"
    - "Selected name + SMILE/SCRATCH scores (from naming phase)"
    - "Visual identity brief or brand guidelines (from identity phase)"
    - "Movement architecture / Brand Soul Canvas (from activation phase, if exists)"

  output:
    - "Coherence scorecard (6 alignment checks)"
    - "Misalignment report (if any)"
    - "Priority fixes with responsible agent"

  action_items:
    - step: 1
      name: "Collect Phase Outputs"
      description: "Gather all completed phase deliverables. Minimum 2 phases must be complete to run coherence check."

    - step: 2
      name: "Strategy-Positioning Alignment"
      description: |
        Check: Does the positioning canvas reflect the brand strategy?
        - Onliness statement → Positioning differentiator alignment
        - Brand values → Value proposition alignment
        - Brand personality → Positioning tone alignment
      score: "1-10"

    - step: 3
      name: "Positioning-Naming Alignment"
      description: |
        Check: Does the name reinforce the positioning?
        - Name SMILE score → Does it suggest the positioning?
        - Name emotional register → Matches brand personality?
        - Name legs → Support brand extension strategy?
      score: "1-10"

    - step: 4
      name: "Naming-Identity Alignment"
      description: |
        Check: Does the visual identity match the name's personality?
        - Typography → Reflects name character?
        - Color system → Supports name emotion?
        - Logo → Works with the name at all sizes?
      score: "1-10"

    - step: 5
      name: "Identity-Strategy Alignment"
      description: |
        Check: Does the visual identity reflect the original brand strategy?
        - Design rationale traces to brand values?
        - Color choices align with archetype?
        - Typography reflects brand personality?
      score: "1-10"

    - step: 6
      name: "Activation-Everything Alignment"
      description: |
        Check: Does the movement architecture align with all previous phases?
        - Brand tension → Traces to positioning gap?
        - Shared enemy → Consistent with brand values?
        - Tribe definition → Matches target from positioning?
        - Touchpoint rituals → Reflect visual identity?
      score: "1-10"

    - step: 7
      name: "Generate Coherence Report"
      description: |
        Compile all scores into coherence scorecard.
        Flag any alignment below 7/10 as misalignment.
        For each misalignment, identify responsible agent and recommended fix.

  output_example: |
    ## Coherence Scorecard — Synkra

    | Alignment Check | Score | Status |
    |-----------------|-------|--------|
    | Strategy ↔ Positioning | 9/10 | PASS |
    | Positioning ↔ Naming | 8/10 | PASS |
    | Naming ↔ Identity | 7/10 | PASS |
    | Identity ↔ Strategy | 9/10 | PASS |
    | Activation ↔ Everything | 6/10 | MISALIGNED |
    | **Overall Coherence** | **7.8/10** | **CONDITIONAL PASS** |

    ### Misalignment Report
    | Check | Score | Issue | Responsible | Fix |
    |-------|-------|-------|-------------|-----|
    | Activation ↔ Everything | 6/10 | Shared enemy ("tool sprawl") not reflected in visual identity — imagery shows harmony, not disruption tension | michael-johnson | Add visual tension element to hero imagery; introduce contrast motif in brand illustrations |

    ### Verdict
    **CONDITIONAL PASS** — 1 misalignment detected (non-critical).
    Proceed to next phase but schedule identity refresh for activation alignment.

  acceptance_criteria:
    - "All available alignments scored 1-10"
    - "Any score below 7 has specific misalignment identified"
    - "Each misalignment has responsible agent and fix recommendation"
    - "Overall coherence score calculated (average of all checks)"

  veto_conditions:
    - condition: "Fewer than 2 phases complete"
      action: "VETO — need minimum 2 phase outputs to check coherence"
    - condition: "Strategy phase not complete"
      action: "VETO — strategy is the baseline. Cannot check coherence without it."
    - condition: "Misalignment score below 5/10 on any check"
      action: "ESCALATE — critical misalignment requires phase rework before proceeding"

  handoff:
    on_pass:
      target: "Next incomplete phase or brand-chief for final review"
      deliverable: "Coherence scorecard confirming alignment"
    on_fail:
      target: "Agent responsible for misaligned phase"
      deliverable: "Misalignment report with specific fixes required"
```
