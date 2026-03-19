# Workflow: YouTube to Everything

## Metadata
- id: youtube-to-everything
- version: 1.0.0
- type: multi-agent
- estimated_time: 4-6 hours
- agents_involved: [@george-blackman, @caleb-ralston, @vanessa-lau, @nicolas-cole, @gary-vaynerchuk]

---

## ENFORCEMENT RULES

**REGRA ABSOLUTA: Este workflow tem 5 fases sequenciais. Cada fase tem um GATE de saída. Se o GATE falhar, PARE. NÃO pule fases. NÃO avance sem completar TODOS os items do GATE.**

**Se você está lendo este workflow, siga estas regras:**
1. Execute as fases na ORDEM (1 → 2 → 3 → 4 → 5)
2. Ao final de cada fase, preencha o GATE Block correspondente
3. Se qualquer item do GATE for NÃO, PARE e corrija
4. Escreva "GATE-PASS: youtube-to-everything [fase] [data]" antes de avançar

---

## Purpose
Produce a complete YouTube video script and systematically repurpose it into 54+ content pieces across all platforms — maximizing one recording session into a full week (or more) of content.

## Inputs
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| video_topic | string | yes | Core topic for the YouTube video |
| target_length | string | yes | Short (5-8 min), medium (10-15 min), or long (20-30 min) |
| key_message | string | yes | The one takeaway the viewer must remember |
| audience_stage | string | no | Brand Journey stage: awareness, consideration, or decision |
| proof_points | list | no | Client results, data, stories to include |
| cta_type | string | no | subscribe, next_step, newsletter, community (default: subscribe) |

## Phases

### Phase 1: SCRIPT
- **Agent**: @george-blackman
- **Framework**: YTSP 5-Phase (YouTube Scriptwriting Process)
- **Inputs**: video_topic, target_length, key_message, proof_points
- **Steps**:
  1. **Research phase**: Identify top 10 competing videos on topic; note gaps and opportunities
  2. **Structure phase**: Define the 5-phase arc:
     - HOOK (0:00-0:30): Pattern interrupt + promise. Must answer "Why should I watch this NOW?"
     - SETUP (0:30-2:00): Context and stakes. Why this matters for professionals who feel stuck
     - TENSION (body): The core content. 3-5 key points with escalating insight
     - PAYOFF (climax): The "aha" moment. Where "obesidade mental trava, clareza liberta" lands
     - CTA (final): Clear next step, natural not salesy
  3. **Write phase**: Full script with:
     - Timestamp markers for each section
     - B-roll/visual suggestions in [brackets]
     - Emphasis markers for key phrases (**bold** = slow down, CAPS = punch)
     - Retention hooks every 2-3 minutes ("Mas aqui e onde fica interessante...")
  4. **Trim phase**: Cut filler, tighten transitions, ensure every sentence earns its place
  5. **Polish phase**: Read aloud check — does it sound like a real person talking? (direto, sem verniz)
- **Outputs**: full_script, timestamp_outline, visual_suggestions[], retention_hooks[]
- **Checkpoint**: Script passes the "first 30 seconds" test — would you keep watching?
- **Estimated Time**: 2-3 hours

---
### GATE-1: Script Completo
**OBRIGATÓRIO antes de avançar para Phase 2**

- [ ] Script completo com timestamps para cada seção
- [ ] Passa o teste "primeiros 30 segundos" — manteria assistindo?
- [ ] Retention hooks a cada 2-3 minutos
- [ ] Visual suggestions incluídas em [brackets]
- [ ] Tom direto, sem verniz — soa como pessoa real falando

**Status**: [GATE-PASS | GATE-FAIL]
**Score**: _/5
**Data**: YYYY-MM-DD HH:MM

Se GATE-FAIL: revise o script. NÃO avance para Waterfall Plan.
---

### Phase 2: WATERFALL PLAN
- **Agent**: @caleb-ralston
- **Framework**: Waterfall Method
- **Inputs**: full_script, timestamp_outline, video_topic
- **Steps**:
  1. Identify all repurposable moments in the script:
     - Quotable one-liners (for text posts, story quotes)
     - Key frameworks/lists (for carousels, threads)
     - Story segments (for reels, TikToks)
     - Data points (for stat graphics)
     - Contrarian takes (for engagement posts)
  2. Create waterfall map: one video → N content pieces, organized by platform
  3. Prioritize: which pieces have highest standalone value?
  4. Map each piece to Brand Journey stage (attract, nurture, convert)
  5. Define publishing sequence: what goes out same day, next day, next week?
- **Outputs**: repurposing_map, content_inventory[], publishing_sequence, priority_ranking
- **Checkpoint**: Minimum 20 repurposable moments identified from script
- **Estimated Time**: 30 min

---
### GATE-2: Waterfall Plan Completo
**OBRIGATÓRIO antes de avançar para Phase 3**

- [ ] Mínimo 20 momentos repurposáveis identificados no script
- [ ] Mapa de derivações completo (vídeo → N peças por plataforma)
- [ ] Sequência de publicação definida (prioridade + cronograma)
- [ ] Cada peça mapeada para Brand Journey stage (attract/nurture/convert)

**Status**: [GATE-PASS | GATE-FAIL]
**Score**: _/4
**Data**: YYYY-MM-DD HH:MM

Se GATE-FAIL: identifique mais momentos repurposáveis. NÃO avance.
---

### Phase 3: REPURPOSE
- **Agent**: @vanessa-lau
- **Framework**: 1-to-54 Repurposing System
- **Inputs**: full_script, repurposing_map, content_inventory
- **Steps**:
  1. Extract SHORT-FORM clips (target: 15-20 pieces):
     - 5-8 Reels/TikToks (15-60s each, vertical, subtitled)
     - 3-5 YouTube Shorts (under 60s, hook-first)
     - 3-5 Story clips (15s segments with engagement stickers)
  2. Extract STATIC posts (target: 10-15 pieces):
     - 2-3 Carousels (key frameworks, step-by-step breakdowns)
     - 3-5 Quote graphics (best one-liners on brand template)
     - 2-3 Text posts (LinkedIn-optimized insights)
     - 2-3 Infographics (data/framework visualizations)
  3. Extract INTERACTIVE content (target: 5-10 pieces):
     - 2-3 Polls/Questions (from contrarian takes in the video)
     - 2-3 Story sequences (mini-narrative with quiz/slider)
     - 1-2 Community posts (discussion prompts)
  4. Extract LONG-FORM derivatives (target: 3-5 pieces):
     - 1 Blog post / Substack article
     - 1 Twitter/X thread (10-15 tweets)
     - 1 LinkedIn article (professional angle)
  5. Map all pieces to ANC Funnel: Attract (hooks, clips), Nurture (carousels, articles), Convert (CTAs, DM prompts)
- **Outputs**: short_form_clips[], static_posts[], interactive_content[], long_form_pieces[], total_piece_count
- **Checkpoint**: Total pieces must be 40+ (target 54); each piece must work standalone
- **Estimated Time**: 1.5 hours

---
### GATE-3: Repurposing Completo
**OBRIGATÓRIO antes de avançar para Phase 4**

- [ ] 40+ peças totais produzidas (target 54)
- [ ] Cada peça funciona standalone (sem dependência do vídeo)
- [ ] Todas as peças mapeadas para ANC Funnel
- [ ] Mix de formatos: short-form + static + interactive + long-form

**Status**: [GATE-PASS | GATE-FAIL]
**Score**: _/4
**Data**: YYYY-MM-DD HH:MM

Se GATE-FAIL: produza mais peças ou ajuste as existentes. NÃO avance.
---

### Phase 4: NEWSLETTER
- **Agent**: @nicolas-cole
- **Framework**: Atomic Essays + Rate of Revelation
- **Inputs**: full_script, key_message, proof_points
- **Steps**:
  1. Extract the core insight from the video — distill to one Atomic Essay (250-500 words)
  2. Restructure for reading (not watching): video is conversational, newsletter is structured
  3. Apply Rate of Revelation:
     - Open with a hook that creates curiosity (different from video hook — reader context differs)
     - Reveal insight progressively: context → problem → twist → solution → proof → CTA
  4. Add newsletter-specific elements:
     - Subject line (3 options, A/B testable)
     - Preview text (the line that shows in inbox)
     - Section headers for scannability
     - Inline CTA for Next Step (beta gratuito)
  5. Write companion social post announcing the newsletter
- **Outputs**: newsletter_draft, subject_lines[], preview_text, social_announcement
- **Checkpoint**: Newsletter must deliver value independently — someone who didn't watch the video still gets the insight
- **Estimated Time**: 45 min

---
### GATE-4: Newsletter Independente
**OBRIGATÓRIO antes de avançar para Phase 5**

- [ ] Newsletter funciona independente do vídeo (valor próprio)
- [ ] Subject lines A/B testáveis (3 opções)
- [ ] CTA para Next Step (beta gratuito) incluído
- [ ] Social announcement post escrito

**Status**: [GATE-PASS | GATE-FAIL]
**Score**: _/4
**Data**: YYYY-MM-DD HH:MM

Se GATE-FAIL: revise a newsletter. NÃO avance para Distribution.
---

### Phase 5: DISTRIBUTION
- **Agent**: @gary-vaynerchuk
- **Framework**: Day Trading Attention + Content Model
- **Inputs**: All content pieces from Phases 3-4, publishing_sequence
- **Steps**:
  1. Platform-native adaptation:
     - Instagram: visual-first, carousels for saves, reels for reach
     - TikTok: trend-aware, raw/unpolished aesthetic, duet-friendly
     - LinkedIn: professional framing, insight-led, no hashtag spam
     - YouTube (Shorts + Community): algorithm-friendly titles, timestamps
     - Substack: newsletter + Notes for discussion
  2. Day Trade Attention check: what's trending right now that we can ride?
     - Adapt 2-3 pieces to current trends/sounds/formats
  3. Build 14-day content calendar:
     - Day 1: YouTube video goes live + newsletter + announcement posts
     - Days 2-5: Short-form clips (2-3/day across platforms)
     - Days 5-10: Carousels, quotes, static content
     - Days 10-14: Interactive content, discussion posts, throwback clips
  4. Define engagement strategy: first-hour comment responses, story engagement
  5. Set tracking markers: which pieces to monitor for next sprint insights
- **Outputs**: content_calendar_14d, platform_adaptations[], trend_opportunities[], engagement_playbook
- **Checkpoint**: Every platform has at least 7 days of content; no platform feels like an afterthought
- **Estimated Time**: 45 min

---
### GATE-5: Distribuição Completa
**GATE FINAL — determina se workflow está completo**

- [ ] Calendário de 14 dias completo com horários
- [ ] Todas as plataformas com 7+ dias de conteúdo
- [ ] Engagement strategy definida por plataforma
- [ ] Nenhuma plataforma parece afterthought

**Status**: [GATE-PASS | GATE-FAIL]
**Score**: _/4
**Data**: YYYY-MM-DD HH:MM

Se GATE-FAIL: ajuste a distribuição. NÃO publique.
GATE-PASS: escreva "GATE-PASS: youtube-to-everything distribution [data]"
---

## Outputs
| Deliverable | Format | Description |
|-------------|--------|-------------|
| full_script | markdown | Complete YouTube script with timestamps and visual notes |
| repurposing_map | table | Visual map of video → all derivative content |
| short_form_clips | markdown[] | 15-20 clip scripts (Reels, TikTok, Shorts, Stories) |
| static_posts | markdown[] | 10-15 posts (carousels, quotes, infographics, text) |
| interactive_content | markdown[] | 5-10 engagement pieces (polls, quizzes, discussions) |
| long_form_pieces | markdown[] | 3-5 articles (blog, thread, LinkedIn) |
| newsletter_draft | markdown | Full Substack newsletter with subject lines |
| content_calendar_14d | table | 14-day publishing schedule across all platforms |
| total_piece_count | integer | Total content pieces produced (target: 54+) |

## Quality Gates
- [ ] All 5 phases completed in order
- [ ] Script passes "first 30 seconds" hook test
- [ ] Minimum 40 content pieces produced (target 54+)
- [ ] Newsletter works as standalone (no video dependency)
- [ ] Every piece aligns with "Clareza em meio ao caos" positioning
- [ ] Each platform has 7+ days of content
- [ ] Tone consistent: direto, sem verniz, pratico
- [ ] CTA present in every piece (varies by format and funnel stage)
- [ ] Proofs integrated where available
- [ ] 14-day calendar complete with posting times
