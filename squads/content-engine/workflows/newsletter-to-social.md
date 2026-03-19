# Workflow: Newsletter to Social

## Metadata
- id: newsletter-to-social
- version: 1.0.0
- type: multi-agent
- estimated_time: 2-3 hours
- agents_involved: [@nicolas-cole, @justin-welsh, @vanessa-lau, @gary-vaynerchuk]

---

## ENFORCEMENT RULES

**REGRA ABSOLUTA: Este workflow tem 4 fases sequenciais. Cada fase tem um GATE de saída. Se o GATE falhar, PARE. NÃO pule fases. NÃO avance sem completar TODOS os items do GATE.**

**Se você está lendo este workflow, siga estas regras:**
1. Execute as fases na ORDEM (1 → 2 → 3 → 4)
2. Ao final de cada fase, preencha o GATE Block correspondente
3. Se qualquer item do GATE for NÃO, PARE e corrija
4. Escreva "GATE-PASS: newsletter-to-social [fase] [data]" antes de avançar

---

## Purpose
Write a high-value newsletter and systematically repurpose it into 12+ social media pieces — turning one deep-dive into a week of content across Instagram, LinkedIn, TikTok, YouTube, and Substack Notes.

## Inputs
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| newsletter_topic | string | yes | Core topic for the newsletter edition |
| key_insight | string | yes | The single insight that makes this edition worth reading |
| audience_pain | string | yes | Specific pain the audience is feeling right now. Consultar `squads/content-engine/data/icp-research.md` Seções 1.2-1.3 para dores verificadas e desejos profundos do ICP |
| proof | string | no | Client result, personal story, or data point to anchor the insight |
| cta_goal | string | no | Primary CTA: next_step, reply, share, save (default: next_step) |
| word_count_target | integer | no | Newsletter length (default: 800-1200 words) |

## Phases

### Phase 1: WRITE
- **Agent**: @nicolas-cole
- **Framework**: Atomic Essays + Rate of Revelation
- **Inputs**: newsletter_topic, key_insight, audience_pain, proof
- **Steps**:
  0. Load ICP context: consultar `squads/content-engine/data/icp-research.md` para VoC (Seção 2), dados reais (Seção 6.3), e objeções comuns (Seção 2.4) antes de escrever
  1. Define the narrative arc using Rate of Revelation:
     - **Open**: Hook that creates an open loop (question, story, contrarian statement)
     - **Context**: Why this matters now for the reader (connect to audience_pain)
     - **Tension**: The conventional wisdom that's wrong OR the hidden cost of inaction
     - **Revelation**: The key_insight delivered with specificity and proof
     - **Application**: How to apply this insight (2-3 actionable steps)
     - **Close**: CTA that feels like a natural next step, not a sales pitch
  2. Write 3 subject line options:
     - Curiosity-driven: creates an open loop
     - Benefit-driven: promises a clear outcome
     - Contrarian: challenges a common belief
  3. Write preview text (the secondary line in inbox): must complement, not repeat, the subject
  4. Apply Headline Engineering to section headers: each header should make the reader want to continue
  5. Integrate proof naturally — as evidence within the narrative, not as a testimonial block
  6. Final pass: cut every sentence that doesn't earn its place. Target: zero filler
- **Outputs**: newsletter_draft, subject_lines[], preview_text, section_headers[]
- **Checkpoint**: Newsletter must deliver value in under 5 minutes of reading; key_insight must be clear and memorable
- **Estimated Time**: 45 min

---
### GATE-1: Newsletter Draft Completa
**OBRIGATÓRIO antes de avançar para Phase 2**

- [ ] Newsletter draft completa (hook → close)
- [ ] Subject lines escritas (3 opções)
- [ ] Preview text escrito
- [ ] Zero filler — cada frase ganha seu lugar
- [ ] key_insight clara e memorável

**Status**: [GATE-PASS | GATE-FAIL]
**Score**: _/5
**Data**: YYYY-MM-DD HH:MM

Se GATE-FAIL: revise a newsletter. NÃO avance para repurposing.
---

### Phase 2: REPURPOSE
- **Agent**: @justin-welsh
- **Framework**: ContentOS + 1-to-12 Repurposing System
- **Inputs**: newsletter_draft, key_insight, audience_pain, section_headers
- **Steps**:
  1. Apply 1-to-12 System — extract 12 pieces from the newsletter:
     - **Piece 1**: Hook post — the newsletter's opening as a standalone post (LinkedIn/Instagram)
     - **Piece 2**: Contrarian take — the "tension" section as a debate-starter
     - **Piece 3**: Framework carousel — the "application" steps as a visual carousel
     - **Piece 4**: Quote graphic — the single best sentence from the newsletter
     - **Piece 5**: Thread — the full newsletter restructured as a Twitter/X thread (10-12 posts)
     - **Piece 6**: Story sequence — key points as 5-7 Instagram story slides
     - **Piece 7**: Poll — from the contrarian angle ("Agree or disagree: [statement]")
     - **Piece 8**: Personal story post — the proof/story extracted as a standalone narrative
     - **Piece 9**: "One thing" post — "If you take ONE thing from this: [key_insight]"
     - **Piece 10**: List post — "N signs you're dealing with [audience_pain]"
     - **Piece 11**: Short-form video script — 30-60s talking head delivering the key_insight
     - **Piece 12**: Newsletter teaser — "Here's what I wrote about this week..." (drive subscriptions)
  2. Tag each piece by Content Matrix position:
     - Education vs. Entertainment vs. Inspiration vs. Promotion
     - Funnel stage: Attract vs. Nurture vs. Convert
  3. Write each piece as platform-ready copy (not just an outline)
  4. Add CTA to each piece appropriate to its funnel stage
- **Outputs**: social_pieces_12[], content_matrix_tags[], piece_ctas[]
- **Checkpoint**: All 12 pieces must work standalone — no "read the newsletter for context" dependency
- **Estimated Time**: 1 hour

---
### GATE-2: 12 Peças Extraídas
**OBRIGATÓRIO antes de avançar para Phase 3**

- [ ] 12 peças sociais extraídas e escritas
- [ ] Cada peça funciona standalone (sem dependência da newsletter)
- [ ] Todas as peças taggeadas no Content Matrix (tipo + funil)
- [ ] CTA presente em cada peça (apropriado ao estágio do funil)

**Status**: [GATE-PASS | GATE-FAIL]
**Score**: _/4
**Data**: YYYY-MM-DD HH:MM

Se GATE-FAIL: complete as peças faltantes. NÃO avance para Instagram.
---

### Phase 3: INSTAGRAM
- **Agent**: @vanessa-lau
- **Framework**: 9 Content Pillars + ANC Funnel
- **Inputs**: social_pieces_12[], newsletter_draft
- **Steps**:
  1. Select and adapt pieces for Instagram formats:
     - **Feed post** (1-2): Best insight as a single-image or text graphic
     - **Carousel** (1): Framework or list as a swipeable carousel (8-10 slides)
     - **Reel** (1-2): Short-form video script adapted for vertical video with captions
     - **Stories** (5-7): Story sequence with engagement stickers (polls, questions, sliders)
  2. Map each piece to 9 Content Pillars:
     - Educational | Inspirational | Personal Story | Authority | Community
     - Behind-the-Scenes | Promotional | Trending | Controversial
  3. Map to ANC Funnel:
     - Attract: reels and carousels (maximize reach)
     - Nurture: stories and feed posts (build trust)
     - Convert: CTA posts driving to Next Step (beta gratuito) or newsletter signup
  4. Add Instagram-specific formatting:
     - Line breaks for readability
     - Strategic emoji usage (minimal, on-brand)
     - Hashtag strategy: 5-10 relevant hashtags per post (mix of sizes)
     - Alt text for accessibility
  5. Create 7-day Instagram calendar with posting times
- **Outputs**: instagram_feed_posts[], instagram_carousel, instagram_reels[], instagram_stories[], instagram_calendar_7d
- **Checkpoint**: Instagram content covers all 3 ANC stages; calendar has minimum 1 post/day
- **Estimated Time**: 30 min

---
### GATE-3: Conteúdo Instagram Completo
**OBRIGATÓRIO antes de avançar para Phase 4**

- [ ] Conteúdo Instagram cobre os 3 estágios ANC (Attract, Nurture, Convert)
- [ ] Calendário de 7 dias criado
- [ ] Mínimo 1 post/dia no calendário
- [ ] Formatos variados (feed, carousel, reels, stories)

**Status**: [GATE-PASS | GATE-FAIL]
**Score**: _/4
**Data**: YYYY-MM-DD HH:MM

Se GATE-FAIL: complete o conteúdo Instagram. NÃO avance para Distribution.
---

### Phase 4: DISTRIBUTION
- **Agent**: @gary-vaynerchuk
- **Framework**: Day Trading Attention + 64 Content Pieces Model
- **Inputs**: social_pieces_12[], instagram content, newsletter_draft
- **Steps**:
  1. Cross-platform optimization:
     - **LinkedIn**: Professional angle. Longer posts, insight-led, no hashtag spam. Use Piece 1, 2, 5, 8
     - **TikTok**: Raw and direct. Piece 11 (video script) adapted for TikTok native feel. Low production value = high authenticity
     - **YouTube Shorts**: Piece 11 re-cut for YouTube algorithm (different hook than TikTok)
     - **YouTube Community**: Piece 7 (poll) + Piece 12 (teaser) for community engagement
     - **Substack Notes**: Piece 9 ("one thing") + behind-the-scenes of writing process
     - **Twitter/X**: Piece 5 (thread) + Piece 2 (contrarian take) as standalone tweet
  2. Day Trading Attention audit:
     - What formats are trending this week on each platform?
     - Can we adapt any piece to ride a current trend/sound/meme?
     - Which platforms are currently favoring what content type? (algorithm shifts)
  3. Build unified publishing calendar:
     - Day 0 (newsletter day): Newsletter + teaser across platforms
     - Day 1: LinkedIn long post + Instagram carousel + thread
     - Day 2: Reel/TikTok + story sequence
     - Day 3: Quote graphic + contrarian post
     - Day 4: Poll + community engagement
     - Day 5-6: Remaining pieces, engagement responses, story reposts
  4. Engagement plan: first-hour strategy for each platform (comments, shares, community)
  5. Performance markers: what to track and what signals to look for
- **Outputs**: platform_content_map, publishing_calendar_7d, trend_adaptations[], engagement_plan, tracking_markers
- **Checkpoint**: Every platform has minimum 3 days of content; no copy-paste between platforms
- **Estimated Time**: 30 min

---
### GATE-4: Distribuição Completa
**GATE FINAL — determina se workflow está completo**

- [ ] Todas as plataformas com mínimo 3 dias de conteúdo
- [ ] Nenhum copy-paste entre plataformas (cada peça é nativa)
- [ ] Calendário de 7 dias completo com horários
- [ ] Engagement plan definido para primeira hora

**Status**: [GATE-PASS | GATE-FAIL]
**Score**: _/4
**Data**: YYYY-MM-DD HH:MM

Se GATE-FAIL: ajuste a distribuição. NÃO publique.
GATE-PASS: escreva "GATE-PASS: newsletter-to-social distribution [data]"
---

## Outputs
| Deliverable | Format | Description |
|-------------|--------|-------------|
| newsletter_draft | markdown | Complete newsletter with subject lines and preview text |
| social_pieces_12 | markdown[] | 12 standalone social media pieces |
| instagram_carousel | markdown | Full carousel copy (hook + slides + CTA) |
| instagram_calendar_7d | table | 7-day Instagram posting schedule |
| publishing_calendar_7d | table | 7-day cross-platform publishing schedule |
| content_matrix_tags | table | Each piece tagged by type and funnel stage |
| platform_content_map | table | Which pieces go to which platforms |
| trend_adaptations | markdown[] | Pieces adapted to current platform trends |
| engagement_plan | markdown | First-hour engagement strategy per platform |

## Quality Gates
- [ ] All 4 phases completed in order
- [ ] Newsletter delivers value in under 5 minutes of reading
- [ ] All 12 social pieces work standalone (no newsletter dependency)
- [ ] Instagram calendar has minimum 1 post/day for 7 days
- [ ] Every platform has minimum 3 days of content
- [ ] No cross-platform copy-paste — each piece is native to its platform
- [ ] Positioning aligned: "Clareza em meio ao caos" present throughout
- [ ] Tone consistent: direto, sem verniz, pratico
- [ ] CTA present in every piece (appropriate to funnel stage)
- [ ] Content Matrix balanced: not all pieces are the same type
