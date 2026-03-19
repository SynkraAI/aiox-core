# Brand Audit

```yaml
id: brand-audit
execution_type: Agent
purpose: Run a full Brand Journey audit to assess alignment between Tiago's positioning ("Clareza em meio ao caos") and current content output, identifying gaps and opportunities.
executor: @caleb-ralston
inputs:
  - Current content samples (last 30 days across all platforms)
  - Brand positioning statement and thesis
  - Target audience profile
  - Service offering (Next Step — beta gratuito)
preconditions:
  - Access to Tiago's social media accounts or exported content
  - Brand positioning document exists in squad context
steps:
  1. Answer the 4 Brand Journey questions:
     - Q1: What do you want to be known for? → "Clareza em meio ao caos"
     - Q2: Who specifically are you helping? → Professional who had results but is stuck
     - Q3: What transformation do you deliver? → From "obesidade mental" to directional clarity
     - Q4: What is your unique mechanism? → Next Step (sessao de clareza e direcao)
  2. Audit last 30 days of content against Brand Story Architecture:
     - Origin Story presence (vulnerability + credibility)
     - Transformation Story consistency
     - Audience Story resonance
  3. Run Contrast Exercise:
     - List what Tiago IS vs what he IS NOT
     - Identify content that contradicts positioning
     - Flag "noise" content that dilutes the message
  4. Score brand alignment (0-100) across dimensions:
     - Message consistency (same thesis repeated?)
     - Tone alignment (direto, sem verniz, pratico?)
     - Visual identity coherence
     - CTA alignment with Next Step
  5. Compare current state vs ideal Brand Journey arc
  6. Identify top 3 gaps with specific recommendations
  7. Create prioritized action list (quick wins + strategic shifts)
outputs:
  - Brand audit report (markdown) with:
    - Brand Journey answers
    - Alignment score (0-100) per dimension
    - Contrast Exercise results
    - Gap analysis with recommendations
    - Priority action items
validation:
  - All 4 Brand Journey questions answered with specifics (not generic)
  - Alignment score backed by concrete content examples
  - At least 3 actionable recommendations with clear next steps
  - Contrast Exercise has minimum 5 items per column
  - Recommendations directly tie back to identified gaps
```
