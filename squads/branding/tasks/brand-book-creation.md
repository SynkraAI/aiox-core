# Brand Book Creation

```yaml
task:
  task_name: "Create Brand Book / Guidelines"
  status: pending
  responsible_executor: michael-johnson
  execution_type: Agent
  estimated_time: "2-3h"
  elicit: true

  input:
    - "Brand strategy document"
    - "Positioning canvas"
    - "Brand name + tagline"
    - "Logo files + usage rules"
    - "Color system"
    - "Typography specifications"
    - "Brand voice definition"

  output:
    - "Complete brand guidelines document"
    - "Do's and Don'ts for each element"

  action_items:
    - step: 1
      name: "Section 1: Brand Story"
      description: |
        - Brand purpose / why we exist
        - Brand values (from strategy)
        - Brand personality
        - Brand archetype

    - step: 2
      name: "Section 2: Logo"
      description: |
        - Primary logo (full lockup)
        - Logo variations (horizontal, stacked, icon)
        - Clear space rules
        - Minimum size specifications
        - Color versions (full, mono, reversed)
        - Logo DON'Ts (stretch, recolor, add effects, etc.)

    - step: 3
      name: "Section 3: Color"
      description: |
        - Primary palette with codes (HEX, RGB, CMYK)
        - Secondary palette
        - Neutral palette
        - Semantic colors
        - Color usage ratios (60-30-10 rule)
        - Color accessibility notes

    - step: 4
      name: "Section 4: Typography"
      description: |
        - Brand typeface (name, weights, usage)
        - UI typeface (name, weights, usage)
        - Type scale / hierarchy
        - Line height and spacing rules
        - Font pairing rationale

    - step: 5
      name: "Section 5: Imagery"
      description: |
        - Photography style (mood, lighting, composition)
        - Illustration style (if applicable)
        - Iconography guidelines
        - Image treatment (filters, overlays)

    - step: 6
      name: "Section 6: Layout"
      description: |
        - Grid system (columns, margins, gutters)
        - Spacing system (base unit)
        - Card/component patterns
        - White space philosophy

    - step: 7
      name: "Section 7: Voice & Tone"
      description: |
        - Voice definition (3 adjectives)
        - Tone modulation per context
        - Words we love / words we avoid
        - Writing style rules

    - step: 8
      name: "Section 8: Digital"
      description: |
        - Responsive behavior
        - Dark mode palette
        - Animation/motion guidelines
        - Social media templates

  output_example: |
    # Brand Book — Synkra (Excerpt)

    ## 1. Brand Story
    **Purpose:** We exist to make AI orchestration intuitive for development teams.
    **Archetype:** The Sage — knowledge through systems, clarity through structure.

    ## 2. Logo Usage
    - Primary lockup: Wordmark + icon, horizontal
    - Clear space: Minimum 1x icon height on all sides
    - Minimum size: 24px height (digital), 10mm (print)
    - **DON'Ts:** Never stretch, never place on busy backgrounds,
      never change color proportions, never add drop shadows

    ## 3. Color (excerpt)
    | Color | HEX | RGB | CMYK | Usage |
    |-------|-----|-----|------|-------|
    | Deep Indigo | #4338CA | 67,56,202 | 85,78,0,0 | Primary brand, CTAs |
    | Electric Teal | #0D9488 | 13,148,136 | 82,0,26,12 | Accents, highlights |
    | Slate 900 | #0F172A | 15,23,42 | 90,72,42,62 | Body text |
    **Ratio:** 60% neutrals, 30% primary, 10% accent

    ## 7. Voice & Tone
    **Voice:** Clear, Confident, Human
    **We say:** "Let's build this together" / **We avoid:** "Leverage synergies"

  acceptance_criteria:
    - "All 8 sections complete"
    - "Logo usage includes DON'Ts"
    - "Colors have all format codes"
    - "Typography hierarchy is specific"
    - "Voice section is actionable"

  veto_conditions:
    - "Missing logo DON'Ts section → VETO"
    - "Colors without accessibility check → VETO"
    - "Typography without hierarchy → VETO"

  handoff:
    on_complete: "Present to brand-chief for final review and coherence check"
    deliverable: "Complete brand guidelines document"
```
