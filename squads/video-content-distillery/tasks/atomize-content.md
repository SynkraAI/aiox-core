---
name: atomize-content
description: "Break pillar content into 30-64+ atomic pieces for multi-platform distribution"
task_id: content-distillery/atomize-content
version: "1.0.0"
status: production-ready
created: "2026-02-12"
category: content-derivation-workflow
---

# Task: Atomize Content

---

## Executive Summary

This is an atomic task that breaks pillar content (distilled frameworks, long-form summaries, full articles) into 30-64+ atomic content pieces optimized for multi-platform distribution. Each piece is a standalone unit of value adapted to a specific platform's format, tone, and algorithm requirements. This is the core "1 to many" content multiplication engine.

**Workflow Position:** Post-distillation, pre-production (transforms raw material into distribution-ready atoms)
**Success Definition:** 30+ standalone content pieces from a single pillar, each platform-adapted
**Output Quality Gate:** Every piece passes the Standalone Value Test (makes sense without prior context)

---

## Purpose

Maximize the ROI of every hour of livestream content by extracting every possible derivative piece. A single 2-hour live contains enough material for 4-8 weeks of multi-platform content. Without systematic atomization, creators publish 1-3 pieces from a live that could yield 60+. This task implements Gary Vaynerchuk's Reverse Pyramid model to ensure zero waste from source material.

This task turns 1 hour of content investment into 30-64+ distribution touchpoints, multiplying reach by 30-64x per source.

---

## Executor Type

**Agent (content-atomizer)**

- **Agent Role:** Full content decomposition, platform adaptation, tagging, quality checking
- **Human Role:** Final review of voice/tone accuracy on 10-20% of pieces; approval of controversial takes
- **Autonomy Level:** 85% Agent / 15% Human (human reviews tone, agent handles structure)

---

## Inputs

### Required Inputs

```yaml
distilled_content:
  field: "Layer 4-5 progressive summarization output"
  format: "Markdown files with highlighted key insights"
  required: true
  example: |
    ## Layer 4: Core Content Leverage Principles

    **[HIGHLIGHT]** The single biggest mistake creators make is treating each
    platform as separate. The content is the SAME — only the packaging changes.

    Three frameworks dominate content leverage:
    1. Barbell Strategy: Only ultra-short or ultra-long
    2. Content Flywheel: Each piece feeds the next
    3. Audience Bridge: Use one platform to pull to another

    **[HIGHLIGHT]** "You don't need more ideas. You need more angles on
    the same idea." — Alex Hormozi
  validation: "Must include Layer 4+ with highlighted passages and at least 5 key insights"

framework_catalog:
  field: "Extracted frameworks from identify-frameworks task"
  format: "YAML with framework definitions"
  required: true
  example: |
    frameworks:
      - id: fw_001
        name: "Barbell Content Strategy"
        key_insight: "Only ultra-short or ultra-long"
        quotable: "The middle is where content goes to die"
  validation: "Must include framework names, key insights, and quotable lines"

source_metadata:
  field: "Original source information"
  format: "YAML"
  required: true
  example: |
    source:
      title: "Alex Hormozi on Content Leverage"
      speaker: "Alex Hormozi"
      date: "2024-03-15"
      source_type: "live"           # controlled enum: video | live | podcast | article
      platform: "YouTube Live"      # descriptive label (free text, e.g. "YouTube Live", "Spotify")
      duration: "2h15m"
      url: "https://youtube.com/watch?v=..."
  validation: "Must include speaker, date, source_type (enum), and platform label"
  source_type:
    allowed: ["video", "live", "podcast", "article"]
    note: "Use source_type (not platform) for conditional logic. platform is a free-text label."

target_platforms:
  field: "Which platforms to create content for"
  format: "YAML list"
  required: true
  example: |
    platforms:
      - linkedin
      - twitter_x
      - instagram
      - youtube_shorts
      - newsletter
  validation: "At least 2 platforms specified"
```

### Optional Inputs

```yaml
brand_voice:
  field: "Voice/tone guidelines for adapted content"
  format: "Markdown or YAML"
  example: |
    voice:
      tone: "authoritative but approachable"
      forbidden_words: ["hustle", "grind", "guru"]
      signature_phrases: ["the data shows", "here's the thing"]
  default: "Match source speaker's natural tone"

content_calendar_constraints:
  field: "Existing calendar commitments that affect scheduling"
  format: "YAML"
  example: |
    constraints:
      max_posts_per_day:
        linkedin: 1
        twitter_x: 3
        instagram: 2
      blackout_dates: ["2026-02-14", "2026-02-20"]

previous_atomizations:
  field: "Previous content pieces from same source (avoid repetition)"
  format: "File paths to previous atomization outputs"
  default: null
```

---

## Preconditions

Before starting this task:

- [ ] Progressive summarization complete (Layer 4-5 outputs exist)
- [ ] Framework extraction complete (identify-frameworks output exists)
- [ ] Source metadata available (speaker, date, platform)
- [ ] Target platforms defined (at least 2)
- [ ] Brand voice guidelines available (or default to source speaker)

---

## Steps

### Step 1: Load and Inventory Source Material (5 min)

**Agent Activity:**
- Load all Layer 4-5 distilled content
- Load framework catalog
- Count total atomizable elements: key insights, frameworks, quotable lines, examples, stories, data points, contrarian takes
- Create inventory:
  ```yaml
  inventory:
    key_insights: 12
    frameworks: 5
    quotable_lines: 8
    examples_stories: 6
    data_points: 4
    contrarian_takes: 3
    total_atomizable_elements: 38
  ```
- Estimate yield: "38 elements x 1.7 avg pieces/element = ~64 content pieces"

**Error Handling:**
- If distilled content has < 5 key insights: warn "Low yield expected (<15 pieces)"
- If no quotable lines found: generate from key insights (paraphrase into punchy format)
- If framework catalog is empty: proceed with insights and heuristics only

**Checkpoint:** Inventory complete with element count and yield estimate

---

### Step 2: Apply Reverse Pyramid Decomposition (15 min)

**Agent Activity:**
- Decompose content through 4 levels of the Reverse Pyramid:

  **Level 1 — Pillar (Full-length, 1-2 pieces)**
  - Complete article/newsletter from distilled content
  - 1,500-3,000 words covering all frameworks
  - Serves as "source of truth" for all derivative pieces

  **Level 2 — Mid-Form Sections (3-5 pieces)**
  - Break pillar into major themes or sections
  - Each is 400-800 words, can stand alone
  - Typically maps 1 framework per section
  - Example: "The Barbell Strategy Explained" (standalone deep dive)

  **Level 3 — Short-Form Insights (15-25 pieces)**
  - Individual insights as standalone posts
  - Each is 100-300 words (or 60-second script)
  - One core idea per piece, self-contained
  - Formats: opinion post, lesson learned, story, how-to, myth-bust
  - Example: "Stop making 10-minute videos. Here's why."

  **Level 4 — Micro Content (15-30 pieces)**
  - Quote graphics (1 sentence + attribution)
  - One-liner hooks (curiosity gap openers)
  - Data point callouts (single stat + context)
  - Contrarian statements (provoke engagement)
  - Question prompts (audience engagement drivers)
  - Example: "The middle is where content goes to die." — Alex Hormozi

- Tag each piece with pyramid level and source element ID

**Error Handling:**
- If a section doesn't decompose cleanly into Level 3: keep as mid-form, don't force it
- If Level 4 yield is low: create variations of strongest Level 3 pieces
- If total < 30 pieces: revisit Level 3 to extract more angles per insight

**Checkpoint:** All 4 levels populated; total piece count >= 30

---

### Step 3: Adapt Each Piece for Target Platforms (20 min)

**Agent Activity:**
- For each piece at each pyramid level, create platform-specific versions:

  **LinkedIn Adaptation:**
  - Hook: Strong opening line (pattern interrupt or contrarian take)
  - Body: 3-5 short paragraphs, storytelling or framework-driven
  - CTA: Question or invitation to comment
  - Constraints: 3,000 char max, ideal 1,300 chars, minimal emojis, 3-5 hashtags
  - Tone: Expert sharing insight with peers

  **Twitter/X Adaptation — Thread:**
  - Hook tweet: Curiosity gap or bold claim (< 280 chars)
  - Body: 3-8 tweets, one idea per tweet
  - CTA tweet: Retweet prompt or question
  - Tone: Sharp, opinionated, conversational

  **Twitter/X Adaptation — Standalone:**
  - Single tweet, < 280 chars, punchy with zero filler words
  - Tone: Sharp, memorable

  **Instagram Adaptation — Carousel:**
  - 7-10 slides
  - Slide 1: Hook (bold statement or question)
  - Slides 2-N: One point per slide, < 40 words per slide
  - Last slide: CTA (save, share, follow)
  - Caption: 400-800 words storytelling with line breaks

  **Instagram Adaptation — Story:**
  - 3-5 screens, casual, question-based
  - Low production feel, authentic engagement

  **YouTube Shorts Adaptation:**
  - 30-60 seconds
  - Hook: First 3 seconds (pattern interrupt)
  - Content: One insight clearly explained
  - Payoff: Surprising conclusion or actionable takeaway
  - Script format: `[HOOK - 3s] [CONTENT - 20-40s] [PAYOFF - 5-10s]`

  **Newsletter Snippet Adaptation:**
  - 150-300 words
  - Teaser: Intriguing opening that creates curiosity
  - Insight: Core framework or lesson
  - CTA: Link to full content or reply prompt

- Ensure attribution to original source in every piece
- Apply brand voice guidelines where provided

**Error Handling:**
- If piece doesn't work for a platform: skip that platform version, log reason
- If tone adaptation feels forced: keep closer to original, flag for human review
- If piece exceeds platform constraints: trim from bottom up (weakest sentence first)

**Checkpoint:** Every piece has at least 2 platform versions; all within platform constraints

---

### Step 4: Tag and Categorize All Pieces (5 min)

**Agent Activity:**
- Tag each piece with structured metadata:
  ```yaml
  piece_tags:
    id: "piece_001"
    source_framework: "fw_001"
    source_element: "key_insight_03"
    pyramid_level: 3
    platform: "linkedin"
    format: "opinion_post"
    urgency: "evergreen"
    engagement_type: "thought_leadership"
    estimated_engagement: "high"
    content_pillar: "content_strategy"
    hashtags: ["#ContentStrategy", "#CreatorEconomy"]
  ```

- Create distribution matrix:
  ```
  | Platform      | Level 1 | Level 2 | Level 3 | Level 4 | Total |
  |---------------|---------|---------|---------|---------|-------|
  | LinkedIn      | 1       | 3       | 8       | 5       | 17    |
  | Twitter/X     | 0       | 2       | 10      | 12      | 24    |
  | Instagram     | 0       | 2       | 6       | 8       | 16    |
  | YouTube Shorts| 0       | 0       | 5       | 0       | 5     |
  | Newsletter    | 1       | 3       | 4       | 2       | 10    |
  | **Total**     | **2**   | **10**  | **33**  | **27**  | **72**|
  ```

**Error Handling:**
- If any platform has < 5 pieces: flag as "under-represented" in report
- If any pyramid level has 0 pieces for main platforms: revisit Step 2 for that level

**Checkpoint:** All pieces tagged; distribution matrix complete

---

### Step 5: Quality Check — Standalone Value Test (10 min)

**Agent Activity:**
- For EACH piece, apply the Standalone Value Test (SVT):

  **SVT Criteria (all must pass):**
  1. **Context-free comprehension:** Would someone with zero prior context understand this?
  2. **Single clear takeaway:** Can the reader articulate the ONE thing they learned?
  3. **Platform-native feel:** Does it feel like it was CREATED for this platform, not repurposed?
  4. **Attribution present:** Is the source/speaker credited (where appropriate)?
  5. **CTA exists:** Is there a clear next action for the reader?

  **Scoring:**
  - 5/5: Ready to publish
  - 4/5: Minor edit needed (flag specific fix)
  - 3/5: Rewrite required (send back to Step 3)
  - < 3/5: Discard piece (not worth salvaging)

- Discard any piece scoring < 3/5
- Flag pieces scoring 4/5 with specific edit notes
- Track overall quality distribution

**Error Handling:**
- If > 20% of pieces score < 3/5: re-evaluate source material quality
- If a specific platform consistently scores low: review platform adaptation rules
- If SVT reveals context dependency: add 1-sentence context opener to piece

**Checkpoint:** All pieces scored; low-quality pieces discarded or rewritten; final count confirmed

---

### Step 6: Organize and Save Output (5 min)

**Agent Activity:**
- Create output directory structure:
  ```
  {slug}/content-pieces/
  ├── pillar/
  │   └── full-article.md
  ├── linkedin/
  │   ├── piece-001-opinion-barbell-strategy.md
  │   ├── piece-002-story-content-flywheel.md
  │   └── ...
  ├── twitter-x/
  │   ├── piece-001-thread-leverage-frameworks.md
  │   ├── piece-002-standalone-hook-test.md
  │   └── ...
  ├── instagram/
  │   ├── piece-001-carousel-content-types.md
  │   └── ...
  ├── youtube-shorts/
  │   ├── piece-001-script-barbell-explained.md
  │   └── ...
  ├── newsletter/
  │   ├── piece-001-teaser-leverage-principles.md
  │   └── ...
  ├── video-cut-candidates.yaml   # generated when source is video/live/podcast
  ├── manifest.yaml
  └── quality-report.yaml
  ```

- **When `source_metadata.source_type` is `video`, `live`, or `podcast`:** generate `video-cut-candidates.yaml` as a secondary output alongside the platform content pieces. This file is a **pre-curation candidate map** — see "Video Cut Handoff Boundary" section below for the required downstream flow before it reaches `format-cut` or `ffmpeg-cutter`. Structure:
  ```yaml
  video_cut_candidates:
    source: "{slug}"
    source_url: "https://..."
    generated_at: "YYYY-MM-DD"
    items:
      - candidate_id: "vc_001"
        source_element: "key_insight_03"      # links back to inventory element
        timestamp_inicio: "00:18:42"          # HH:MM:SS
        timestamp_fim: "00:19:17"
        duracao_s: 35
        transcript_excerpt: "..."             # exact transcript excerpt as evidence
        intended_formats: ["youtube_shorts", "reels", "tiktok"]
        rationale: "Hook forte + payoff completo em menos de 60s"
        handoff_target: "squads/curator/tasks/curate-data.md"  # PRE-CURATION — NOT format-cut
  ```
  If source is NOT video/live/podcast (per `source_type`), skip this file and log: "video-cut-candidates.yaml skipped — source_type is not video/live/podcast."

### Video Cut Handoff Boundary

`video-cut-candidates.yaml` is a **pre-curation candidate map**. It MUST NOT be sent directly to `format-cut` or `ffmpeg-cutter`.

Required downstream flow:
1. **Curator ingests** cut candidates (`squads/curator/tasks/curate-data.md`) and selects/normalizes moments.
2. **Curator generates** `narrative_structure.yaml` or the appropriate intermediate artifact.
3. **`format-cut`** (`squads/curator/tasks/format-cut.md`) converts that structured input into QG-004 validated cut YAML.
4. **`ffmpeg-cutter`** (`curator/agents/ffmpeg-cutter`) executes only the validated cut YAML.

> Skipping step 1-2 and routing `video-cut-candidates.yaml` directly to `format-cut` will break the pipeline — `format-cut` expects `narrative_structure.yaml`, not raw candidates.

- Generate manifest:
  ```yaml
  atomization:
    source: "Alex Hormozi - Content Leverage Live"
    date_atomized: "2026-02-12"
    total_pieces: 64
    pieces_by_platform:
      linkedin: 17
      twitter_x: 24
      instagram: 16
      youtube_shorts: 5
      newsletter: 10
    pieces_by_level:
      pillar: 2
      mid_form: 10
      short_form: 33
      micro: 27
    quality_distribution:
      ready_5_of_5: 48
      needs_edit_4_of_5: 12
      rewritten_3_of_5: 4
      discarded: 3
    estimated_content_days: 32
  ```

**Error Handling:**
- If file write fails: retry, then save to alternate location
- If manifest generation fails: save pieces without manifest, log error

**Checkpoint:** All files saved; manifest generated; quality report complete

---

## Outputs

### Primary Output

**Content Pieces Directory**

Format: Markdown files organized by platform
Location: `{slug}/content-pieces/`

### Secondary Outputs

1. **Atomization Manifest**
   - Format: YAML
   - Location: `{slug}/content-pieces/manifest.yaml`
   - Content: Complete inventory of all pieces with metadata and tags

2. **Quality Report**
   - Format: YAML
   - Location: `{slug}/content-pieces/quality-report.yaml`
   - Content: SVT scores, quality distribution, flagged pieces, discard reasons

3. **Distribution Matrix**
   - Format: Markdown table (embedded in manifest)
   - Content: Piece count by platform x pyramid level

4. **Video Cut Candidates** *(conditional — video/live/podcast sources only)*
   - Format: YAML
   - Location: `{slug}/content-pieces/video-cut-candidates.yaml`
   - Content: Timestamped cut candidates with transcript excerpts. Pre-curation input — must pass through curator before reaching format-cut/ffmpeg-cutter. See "Video Cut Handoff Boundary" section.
   - Required fields per item: `candidate_id`, `source_element`, `timestamp_inicio`, `timestamp_fim`, `duracao_s`, `transcript_excerpt`, `intended_formats`, `handoff_target`

---

## Relationship to Other Atomize Specs

This spec is the **publish-ready atomization** variant. It produces platform-adapted content pieces intended for direct distribution — no intermediate approval gate is required.

| Use this spec (`video-content-distillery/atomize-content.md`) when: | Use `squads/conteudo/tasks/atomize-content.md` when: |
|---|---|
| The workflow requires ready-to-publish platform assets | The workflow is approval-driven |
| No intermediate human approval gate is needed | Outputs are briefs, maps, and handoffs |
| Source is distilled Layer 4-5 content from third-party material | Source is owned brand content requiring user sign-off |
| High-volume derivative content production | Owned content pipeline with controlled cadence |

**Anti-duplication rule:** This spec MUST NOT run for the same source/atom when `squads/conteudo/tasks/atomize-content.md` is the active workflow owner. Running both produces duplicate content pieces for the same source. When in doubt, check which spec owns the active workflow before executing.

---

## Validation

### Checklist

- [ ] Total piece count >= 30 (minimum viable atomization)
- [ ] Every piece has platform-specific formatting (not copy-pasted across platforms)
- [ ] Every piece passes Standalone Value Test (score >= 3/5)
- [ ] Every piece has source attribution
- [ ] Every piece has a CTA appropriate to its platform
- [ ] No two pieces are identical (variations are distinct, not duplicates)
- [ ] Manifest YAML is valid and includes all pieces
- [ ] Quality report generated with statistics
- [ ] At least 3 platforms represented with >= 5 pieces each
- [ ] Pyramid levels 2-4 all populated (Level 1 optional)
- [ ] Pieces tagged with framework source and content pillar

### Success Criteria

**Threshold: 9/11 on checklist above**

| Criteria | Excellent (3) | Acceptable (2) | Poor (1) |
|----------|--------------|----------------|---------|
| **Yield quantity** | 60+ pieces from single pillar | 30-59 pieces | < 30 pieces |
| **Platform nativeness** | Each piece feels created FOR that platform | Mostly adapted, some generic | Copy-paste with minor tweaks |
| **Standalone value** | 90%+ pass SVT at 5/5 | 70%+ pass SVT at 4+/5 | < 70% pass SVT |
| **Variation quality** | Same insight feels fresh across platforms | Recognizably related but different | Identical content, different format |
| **Tag completeness** | Every piece has 5+ metadata tags | Every piece has 3+ tags | Tags missing or generic |
| **Organization** | Clean directory structure, valid manifest | Files organized, minor manifest issues | Messy structure, no manifest |

---

## Estimated Effort

| Role | Effort | Notes |
|------|--------|-------|
| **Agent (content-atomizer)** | 45-60 min | Decomposition, adaptation, quality check |
| **Human** | 10-15 min | Review tone/voice accuracy, approve controversial takes |
| **Total Duration** | 55-75 min | Mostly autonomous with tone review checkpoint |

---

## Integration

### Feeds To

**Downstream Tasks:**
- `design-ecosystem` — Uses content pieces to plan distribution sequence
- `produce-batch` — Uses content pieces as production input
- `optimize-youtube` — Uses YouTube-tagged pieces for optimization

### Depends On

- `progressive-summarize` — Provides Layer 4-5 distilled content
- `identify-frameworks` — Provides framework catalog with quotable lines
- Source metadata: Speaker, date, platform information

### Agent Routing

**Primary Agent:** content-atomizer (Gary Vaynerchuk methodology)
**Supporting Agents:** idea-multiplier (generates angle variations for Level 3-4)

**Handoff:** Content pieces ready for ecosystem design and batch production

---

## Quality Threshold

**Pass/Fail Gate:** Total pieces >= 30 AND SVT pass rate >= 70%

If failing:
1. If yield < 30: Re-examine source material; may need richer input from extraction
2. If SVT < 70%: Review platform adaptation rules; pieces may need more context
3. Re-run Steps 2-5 with adjusted parameters
4. If still failing: source material may be too thin; flag for additional extraction

**Common Failure Reasons:**
- Source material too thin (< 5 key insights produces < 20 pieces)
- Platform adaptation is copy-paste (no real format change)
- Missing CTAs on most pieces
- Pieces are context-dependent (fail SVT on comprehension)
- Overproduction of Level 4 micro with no Level 2-3 substance

---

## Error Handling

### Input Errors

| Error | Detection | Recovery |
|-------|-----------|----------|
| No distilled content | Empty input path | HALT, report "progressive-summarize task not completed" |
| No framework catalog | Missing file | Proceed with insights only, warn "reduced yield expected" |
| No quotable lines | Catalog has no `quotable` field | Generate from key insights via paraphrase |
| Missing source metadata | No speaker/date info | Use "Unknown Source" with flag for human to fill |

### Processing Errors

| Error | Detection | Recovery |
|-------|-----------|----------|
| Piece exceeds char limit | Platform validation | Trim weakest sentences, re-validate |
| All hooks same pattern | Pattern detection | Force 3 different hook types across batch |
| SVT mass failure (>30%) | Quality check stats | Review source quality, may need re-extraction |
| Platform has 0 pieces | Distribution matrix gap | Create at least 3 pieces for that platform or exclude |

---

## Notes for Executor

### If Source Has Strong Quotable Lines

- Prioritize Level 4 quote graphics (high engagement, low effort)
- Create "quote + 2-sentence context" format for LinkedIn
- Use quotes as Twitter standalone tweets
- Generate 2-3 variations per quote (same idea, different framing)

### If Source Is Framework-Heavy (5+ frameworks)

- Each framework gets its own Level 2 mid-form piece
- Create "Framework vs Framework" comparison pieces (high engagement)
- Design a "framework collection" carousel for Instagram
- Consider a "framework cheat sheet" as bonus Level 1 pillar

### If Source Is Story-Heavy

- Extract story arcs for LinkedIn storytelling posts
- Create "before/after" micro pieces
- Use story moments as YouTube Shorts hooks
- Thread narrative across multiple Twitter posts

### If Low Yield Warning Triggers

- Go deeper into each insight (more angles, not more insights)
- Create "what if" and "myth vs reality" variations
- Add audience question prompts (engagement pieces count toward yield)
- Combine 2 related insights into comparison pieces

---

## Example: Single Insight Atomized Across Platforms

**Source Insight:** "The middle is where content goes to die" (Barbell Strategy)

**LinkedIn (Level 3):**
```
Stop making 10-minute videos.

I know. You spent hours scripting, filming, editing.
But the data is brutal: medium-length content has the worst
effort-to-reach ratio of any format.

Alex Hormozi calls this the "Barbell Strategy":
- Go ultra-short (< 60 seconds) for reach
- Go ultra-long (> 60 minutes) for depth
- Skip everything in between

The middle is where content goes to die.

What's your experience — shorter or longer pieces perform better?

#ContentStrategy #CreatorEconomy #ContentMarketing
```

**Twitter/X (Level 4):**
```
The Barbell Content Strategy:

Only make content that's < 60 seconds or > 60 minutes.

The middle is where content goes to die.

(h/t @AlexHormozi)
```

**Instagram Carousel (Level 4):**
```
Slide 1: "Stop making 10-minute videos"
Slide 2: "The Barbell Content Strategy"
Slide 3: "Ultra-short (< 60s) = REACH"
Slide 4: "Ultra-long (> 60min) = DEPTH"
Slide 5: "The middle = GRAVEYARD"
Slide 6: "Save this for your next content plan"
```

**YouTube Short Script (Level 3):**
```
[HOOK - 3s] "Stop making 10-minute videos. Seriously."
[CONTENT - 25s] "There's something called the Barbell Strategy.
You only make content in two formats: ultra-short, under 60 seconds,
or ultra-long, over 60 minutes. Everything in between? That's where
content goes to die. Short gets you reach. Long gets you trust.
The middle gets you nothing."
[PAYOFF - 5s] "Pick a side. Your audience will thank you."
```

---

## Revision History

| Version | Date | Change |
|---------|------|--------|
| 1.0.0 | 2026-02-12 | Initial production release |
