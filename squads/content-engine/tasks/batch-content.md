# Batch Content

```yaml
id: batch-content
execution_type: Agent
purpose: Batch-create a week's worth of content from a single pillar piece using the 1-to-12 repurposing method, producing ready-to-publish pieces across all platforms.
executor: @justin-welsh
inputs:
  - 1 pillar content piece (long-form post, video, or newsletter)
  - Content Matrix categories for the week
  - Platform distribution plan
  - Content templates from content-system-setup
preconditions:
  - ContentOS system is set up (templates, categories defined)
  - Pillar content piece is finalized
  - Weekly plan exists with assigned slots
steps:
  1. Extract core elements from the pillar piece:
     - Main thesis (1 sentence)
     - 3-5 key insights or takeaways
     - Best quotes or phrases
     - Story elements or examples used
     - Data points or proof elements
  2. Apply 1-to-12 Repurposing framework:
     - Piece 1: Thread/carousel from key insights
     - Piece 2: Single insight as standalone post
     - Piece 3: Contrarian angle on the same topic
     - Piece 4: Story-only version (personal narrative)
     - Piece 5: Tactical/how-to version
     - Piece 6: Quote graphic from best line
     - Piece 7: Question post (flip insight into question)
     - Piece 8: List post (extract as numbered tips)
     - Piece 9: Behind-the-scenes of creating the pillar piece
     - Piece 10: Micro-video/reel (30-60s key moment)
     - Piece 11: Newsletter teaser or extension
     - Piece 12: Community engagement prompt
  3. Adapt each piece for its target platform:
     - Apply platform-native formatting rules
     - Adjust length (LinkedIn longer, Instagram punchy, TikTok raw)
     - Add platform-specific CTAs
  4. Write hooks for each piece using hook-creation principles:
     - First line must stop the scroll
     - Match the tone to the platform
  5. Apply Content Matrix categorization:
     - Tag each piece: pillar + format + platform
     - Ensure variety across the week (not all same format)
  6. Quality pass on all 12 pieces:
     - Voice check: Does this sound like Tiago?
     - Value check: Does this deliver something useful?
     - CTA check: Is there a clear next step?
  7. Queue pieces in publishing schedule
outputs:
  - 12+ content pieces, each with:
    - Final text/script
    - Target platform
    - Content category tag
    - Scheduled publish date
    - CTA included
  - Batch creation summary (what was created from what)
validation:
  - Minimum 12 pieces created from 1 pillar
  - No two pieces are copy-paste (each has unique angle)
  - All pieces match Tiago's voice (direto, sem verniz, pratico)
  - Platform adaptation is visible (not same text everywhere)
  - At least 2 pieces have direct Next Step CTA
  - All pieces have hooks that pass the "scroll stop" test
```
