# Visual Identity Brief

```yaml
task:
  task_name: "Create Visual Identity Brief"
  status: pending
  responsible_executor: michael-johnson
  execution_type: Agent
  estimated_time: "1-2h"
  elicit: true

  input:
    - "Brand strategy document"
    - "Positioning canvas"
    - "Selected brand name"
    - "Brand archetype"

  output:
    - "Visual identity brief"
    - "Typography architecture"
    - "Color system"
    - "Brand guidelines structure"

  action_items:
    - step: 1
      name: "Investigate"
      description: |
        Review all inputs:
        - Brand strategy (values, personality, archetype)
        - Positioning (competitive context, differentiation)
        - Name (what it suggests visually)
        - Competitor visual identities (what to avoid)

    - step: 2
      name: "Define Visual Strategy"
      description: |
        Document:
        - Visual personality (3-5 adjectives)
        - Visual tension (e.g., "Modern but warm")
        - Reference brands (NOT to copy, but for mood)
        - What the identity should FEEL like
        - What to AVOID (competitor patterns)

    - step: 3
      name: "Typography Architecture"
      description: |
        Select and specify:
        1. Brand Typeface (personality, marketing, headlines)
           - Category: Serif, Sans, Slab, Display
           - Weight range needed
           - Rationale (why this type matches the brand)
        2. UI Typeface (legibility, product, long text)
           - Category: usually Sans-serif
           - Weight range
           - Rationale
        3. Hierarchy:
           - H1: [size, weight, typeface]
           - H2-H6: [specifications]
           - Body: [size, line-height, typeface]
           - Caption, Label: [specifications]

    - step: 4
      name: "Color System"
      description: |
        Build using data/color-psychology.md:
        1. Primary (1-2 colors)
           - Map to brand personality
           - Check competitor differentiation
           - Specify: HEX, RGB, HSL
        2. Secondary (2-3 colors)
        3. Neutral (2-3 grays/whites/blacks)
        4. Semantic (success, error, warning, info)
        5. Accessibility: WCAG AA contrast verified

    - step: 5
      name: "Brand Guidelines Structure"
      description: |
        Create the table of contents:
        1. Brand Story & Purpose
        2. Logo Usage Guidelines
        3. Color Specifications
        4. Typography Specifications
        5. Imagery & Photography Style
        6. Iconography
        7. Layout & Grid System
        8. Voice & Tone (reference)
        9. Digital Guidelines (responsive, dark mode)
        10. What NOT to Do

  output_example: |
    ## Visual Identity Brief — Synkra

    **Visual Personality:** Precise, Forward-thinking, Warm, Technical, Human
    **Visual Tension:** "Engineered precision with organic warmth"
    **Avoid:** Cold corporate blue, generic SaaS gradients

    ### Typography Architecture
    | Role | Typeface | Weight | Usage |
    |------|----------|--------|-------|
    | Brand | Space Grotesk | 500-700 | Headlines, marketing, hero sections |
    | UI | Inter | 400-600 | Product UI, body text, documentation |
    | H1 | Space Grotesk 700 | 40px/48px | Page titles |
    | Body | Inter 400 | 16px/24px | Paragraph text |
    | Caption | Inter 400 | 12px/16px | Labels, metadata |

    ### Color System
    | Role | Name | HEX | Rationale |
    |------|------|-----|-----------|
    | Primary | Deep Indigo | #4338CA | Intelligence, depth, trust |
    | Primary | Electric Teal | #0D9488 | Innovation, clarity, energy |
    | Secondary | Warm Amber | #D97706 | Human warmth, approachability |
    | Neutral | Slate 900 | #0F172A | Primary text |
    | Neutral | Slate 100 | #F1F5F9 | Backgrounds |
    | Semantic | Success | #16A34A | Confirmations |
    | Semantic | Error | #DC2626 | Errors, destructive actions |

    **WCAG AA:** All text combinations verified ≥ 4.5:1 contrast ratio.

  acceptance_criteria:
    - "Visual strategy documented with rationale"
    - "Typography hierarchy complete (brand + UI typefaces)"
    - "Color system with psychology mapping"
    - "WCAG AA contrast verified"
    - "Brand guidelines structure defined"

  veto_conditions:
    - "Colors chosen without personality rationale → VETO"
    - "Typography without hierarchy → VETO"
    - "No accessibility check → VETO"

  handoff:
    on_complete: "Coordinate with sagi-haviv for logo, then compile full brand book"
    deliverable: "Visual identity brief + specifications"
```
