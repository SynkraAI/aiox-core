# Write Post

```yaml
id: write-post
execution_type: Agent
purpose: Write a single high-quality social media post using Atomic Essay principles, engineered headline, and controlled Rate of Revelation to maximize engagement and message retention.
executor: @nicolas-cole
inputs:
  - Topic or insight to write about
  - Target platform (Instagram, LinkedIn, Twitter/X)
  - Content category (educational, story, contrarian, tactical, promotional)
  - Hook (from hook-creation task or new)
preconditions:
  - Topic aligns with one of the 3 content pillars
  - Target audience pain point is clear
  - Tone guidelines understood (direto, sem verniz, pratico)
steps:
  1. Select headline template (Headline Engineering):
     - [Number] [Adjective] [Thing] that [Promise] → "3 sinais silenciosos de que voce esta travado"
     - How to [Achieve X] without [Pain Y] → "Como ter clareza sem precisar de mais um curso"
     - The [Adjective] truth about [Topic] → "A verdade incomoda sobre produtividade"
     - Why [Common Belief] is [Wrong/Incomplete] → "Por que 'foco' nao resolve seu problema"
     - I [Did X] and [Unexpected Result] → "Parei de planejar e finalmente sai do lugar"
  2. Write the opening hook (first 1-2 lines):
     - Must work as standalone (people only see this in feed)
     - Create immediate tension or curiosity
     - No filler, no "I've been thinking about..."
  3. Apply Rate of Revelation through the body:
     - Each sentence reveals ONE new piece of information
     - Never give away the punchline early
     - Build tension: problem → deeper problem → insight → shift
     - Use short paragraphs (1-2 sentences max)
     - White space is your friend
  4. Structure the body (Atomic Essay format):
     - Section 1: Establish the problem (resonate)
     - Section 2: Deepen with specifics (prove you understand)
     - Section 3: Reveal the insight or shift (the "aha")
     - Section 4: Practical takeaway (what to do with this)
  5. Close with CTA:
     - Soft CTA: "Salva pra reler quando precisar"
     - Medium CTA: "Se isso faz sentido, me manda um 'sim' no DM"
     - Hard CTA: "Link na bio pro Next Step"
     - Match CTA intensity to content type
  6. Deterministic Pre-Check (textstat + LeIA):
     - textstat.flesch_reading_ease(post) — threshold >= 60 (social = facil de ler)
     - textstat.reading_time(post) — threshold <= 30s (Instagram) / <= 45s (LinkedIn)
     - textstat.avg_sentence_length(post) — threshold <= 12 palavras (social = frases curtas)
     - LeIA no hook (primeiras 2 linhas) — |compound| >= 0.3 (carga emocional forte)
     - LeIA no hook — neu < 0.8 (se neutro demais = invisivel no feed)
     - LeIA no CTA — compound > 0.1 (positivo/acao)
     - Se Flesch < 55 = ALERTA "Post complexo demais pro formato"
     - Se hook neu > 0.8 = ALERTA "Hook neutro = scroll continua"
  7. Polish pass:
     - Remove every unnecessary word
     - Read aloud: does it sound like Tiago talking?
     - Check: would YOU stop scrolling for this?
     - Verify line breaks work on mobile
     - Confirm pre-check alerts resolved
outputs:
  - Complete post with:
    - Headline/hook
    - Body text (formatted for platform)
    - CTA
    - Suggested hashtags (if applicable)
    - Character/word count
    - Platform-specific formatting notes
validation:
  - Hook passes the "3 second test" (would someone stop scrolling?)
  - Rate of Revelation is smooth (no info dumps, no premature reveals)
  - Post sounds like Tiago (direto, sem verniz — not corporate or motivational)
  - CTA matches content intensity (soft for awareness, hard for conversion)
  - Total length appropriate for platform (LinkedIn: 1200-1500 chars, Instagram: 800-1000, Twitter: 280 or thread)
  - No filler sentences — every line earns its place
```
