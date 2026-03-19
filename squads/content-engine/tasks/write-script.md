# Write Script

```yaml
id: write-script
execution_type: Agent
purpose: Write a YouTube or video script using the YTSP 5-Phase structure with Setup-Tension-Payoff sequences, optimized for retention and audience transformation.
executor: @george-blackman
inputs:
  - Video topic and target transformation
  - Target length (short-form 60s, mid-form 5-10min, long-form 15-30min)
  - Target platform (YouTube, Instagram Reels, TikTok)
  - Key insight or thesis for the video
preconditions:
  - Topic aligns with content pillars
  - Target audience transformation is clear
  - Hook has been tested or selected (from hook-creation task)
steps:
  1. Define TTS (Target-Transformation-Stakes):
     - Target: Who is this video for? (specific person, not "everyone")
     - Transformation: What will they understand/feel/do after watching?
     - Stakes: Why does this matter? What happens if they ignore this?
     - Write TTS statement: "This video helps [target] go from [before] to [after] because [stakes]"
  2. Write the hook (first 30 seconds):
     - Open with the strongest hook (contrarian, question, or bold claim)
     - Establish the promise within 10 seconds
     - Create the curiosity gap (what will they learn?)
     - Anti-pattern: Do NOT start with "Hey guys" or channel intro
  3. Structure STP (Setup-Tension-Payoff) sequences:
     - Each STP is a mini-story within the video
     - Setup: Establish the context or situation
     - Tension: Introduce the problem, conflict, or question
     - Payoff: Deliver the insight, answer, or resolution
     - Short-form: 1 STP sequence
     - Mid-form: 3-4 STP sequences
     - Long-form: 5-7 STP sequences
  4. Apply YTSP 5-Phase structure (for mid/long-form):
     - Phase 1 — Hook (0:00-0:30): Grab attention, state promise
     - Phase 2 — Setup (0:30-2:00): Context, why this matters, preview
     - Phase 3 — Body (2:00-end-2min): Core STP sequences, main content
     - Phase 4 — Climax: The biggest insight or transformation moment
     - Phase 5 — Resolution (last 1-2min): Summary, CTA, next video tease
  5. Write the full script:
     - Conversational tone (write like Tiago talks, not like an essay)
     - Mark retention checkpoints every 2-3 minutes: "[RETENTION CHECK: re-hook here]"
     - Include B-roll/visual suggestions in brackets: "[VISUAL: show example on screen]"
     - Mark emphasis moments: "[EMPHASIS]" for pacing changes
     - Keep sentences short when spoken aloud
  6. Add retention checkpoints:
     - At each checkpoint, re-engage with a micro-hook:
       - "Mas aqui e onde fica interessante..."
       - "E isso que a maioria nao entende..."
       - "Presta atencao nessa parte..."
     - Place before potential drop-off points
  7. Write the CTA:
     - Soft: "Se isso fez sentido, se inscreve"
     - Medium: "Comenta 'clareza' que eu te mando o material"
     - Hard: "Link na descricao pro Next Step"
  8. Write title + thumbnail concept:
     - 3 title options (curiosity-driven, under 60 chars)
     - Thumbnail concept: 1 sentence describing the image + text overlay
outputs:
  - Complete video script with:
    - TTS statement
    - Timestamped structure (Phase 1-5)
    - Full script text with visual/retention markers
    - Estimated duration
    - CTA
    - 3 title options
    - Thumbnail concept
validation:
  - TTS statement is specific (not generic)
  - Hook delivers promise within first 10 seconds
  - At least 1 STP sequence per 3 minutes of content
  - Retention checkpoints placed every 2-3 minutes
  - Script reads naturally when spoken aloud (not essay-like)
  - Voice matches Tiago (direto, sem verniz, pratico)
  - Title options are under 60 characters and create curiosity
  - Clear transformation arc from start to finish
```
