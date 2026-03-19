# 🖼️ Thumbnail Lab Workflow

## Objetivo

Otimizar thumbnails/first frames para maximizar click-through rate (CTR) e scroll-stop rate através de scientific testing e psychological triggers.

**Tempo:** 3-5 dias
**Output:** Winning thumbnail + testing framework + pattern library

---

## Quando Usar

- CTR baixo (<8% do target)
- Scroll-stop rate baixo (<45%)
- Quer maximizar impressions→views
- Need data-driven thumbnail strategy
- Testing novo hook visual

---

## Thumbnail Psychology

```
Thumbnail = Billboard do vídeo

Objectives:
1. STOP SCROLL (primeiros 0.3s)
2. Trigger curiosity
3. Promise value
4. Match brand

Instagram Feed/Reels:
- First frame = thumbnail
- 0.3s decision window
- Competition = infinite scroll
```

---

## Agentes Envolvidos

**Lead:** @thumbnail-king (Thumbnail Optimization Expert)
**Core Team:**

- @visual-impact (Visual Hook Designer)
- @color-psychologist (Color Psychology Expert)
- @copy-wizard (Viral Copywriter)
- @metrics-guru (Viral Metrics Analyst)

**Supporting:**

- @ab-test-master, @layout-architect, @retention-architect

---

## Fase 1: Thumbnail Audit (1 dia)

### 1.1 Current Performance Analysis

**@metrics-guru analisa:**

```markdown
CURRENT THUMBNAILS:

Performance:

- Avg CTR: 4.2% (Instagram benchmark: 8-12%)
- Scroll-stop: 38% (target: >50%)
- Time to decision: 0.9s (target: <0.5s)

Visual Patterns:

- Center-aligned text (85%)
- Face presence (40%)
- Contrast: Good (black/white/gold)
- Text size: 48-64px
- Clutter level: Low (minimalist)

ISSUES IDENTIFIED:
❌ CTR 50% below benchmark
⚠️ Text hard to read mobile (<5")
⚠️ Low visual surprise
⚠️ Predictable layouts
✅ Brand consistency good
```

### 1.2 Competitor Analysis

**⚡ PONTO DE DEBATE OBRIGATÓRIO**

```
@thumbnail-king analisa top performers:

"Top 10 viral videos (mesmo nicho) usam:
- Bold text 80-120px (100%)
- Faces with emotion (70%)
- High contrast (90%)
- Before/After split (40%)
- Numbers/data viz (60%)"

DEBATE:
@visual-impact: "Need bigger, bolder text"
@color-psychologist: "Emotion > info (faces work)"
@copy-wizard: "Curiosity gap in text (what?, how?, why?)"
@metrics-guru: "Dados: faces + emotion = +38% CTR"
@thumbnail-king: "Test systematically, não guess"

VOTAÇÃO:
Consenso: Test 5 thumbnail patterns cientificamente

TEST PATTERNS:
Pattern A: Big bold claim (text only)
Pattern B: Face + emotion + text
Pattern C: Before/After split
Pattern D: Data visualization (numbers)
Pattern E: Mystery/blurred (curiosity gap)
```

### 1.3 Psychology Frameworks

**@color-psychologist + @viral:**

```markdown
THUMBNAIL PSYCHOLOGY:

5 Psychological Triggers:

1. CURIOSITY GAP
   - "The [X] nobody tells you"
   - Blurred elements
   - Incomplete information

2. EMOTION
   - Faces (surprise, shock, joy)
   - Expressive eyes
   - Relatable reactions

3. CONTRAST
   - High visual contrast
   - Unexpected combinations
   - Color psychology

4. SOCIAL PROOF
   - Numbers (views, followers)
   - Testimonials
   - Success indicators

5. CONTROVERSY
   - Strong opinions
   - Debate-worthy
   - "Hot take" visuals

USE: 2-3 triggers per thumbnail
```

---

## Fase 2: Hypothesis Generation (1 dia)

### 2.1 Thumbnail Hypotheses

**@thumbnail-king + team:**

```markdown
5 THUMBNAIL HYPOTHESES TO TEST:

Hypothesis A: Big Bold Claim
Visual:

- Black background (70%)
- White text 100px (25%)
- Gold accent underline (5%)
- No face, text-only

Trigger: Controversy + Curiosity
Expected CTR: 6-8%

Hypothesis B: Emotion Face
Visual:

- Face with surprise (50%)
- Text overlay 80px (20%)
- Gold frame around face (8%)
- Black background (22%)

Trigger: Emotion + Social Proof
Expected CTR: 9-11%

Hypothesis C: Before/After
Visual:

- Split screen 50/50
- Dramatic difference
- Arrow gold (8%)
- Text minimal 64px

Trigger: Curiosity Gap + Contrast
Expected CTR: 7-9%

Hypothesis D: Data Viz
Visual:

- Large number (gold, 30%)
- Chart/graph visual
- Text context 72px
- Black/white bg

Trigger: Social Proof + Authority
Expected CTR: 6-8%

Hypothesis E: Mystery Blur
Visual:

- Key element blurred (40%)
- "Wait for it..." text
- Gold reveal indicator (8%)
- High curiosity

Trigger: Curiosity Gap (max)
Expected CTR: 5-7% (risky)
```

### 2.2 Mobile Optimization

**@layout-architect:**

```markdown
MOBILE-FIRST RULES:

Screen Sizes:

- iPhone: 2.5" × 5.4" (effective)
- Android: 2.3" × 5.1" (smaller)
- View distance: 12-18"

Readability Requirements:

- Min text size: 80px (mobile)
- Max words: 3-5 words
- Contrast ratio: >7:1 (WCAG AAA)
- Touch target: N/A (not interactive)

Visual Clarity:

- Single focal point
- High contrast elements
- Avoid fine details (lost mobile)
- Test on actual devices
```

---

## Fase 3: Thumbnail Creation (1-2 dias)

### 3.1 Design Execution

**@visual-impact + @thumbnail-king:**

```markdown
PRODUCTION:

For Each Hypothesis (A-E):

1. Create 3 variations
   - Variation 1: Conservative
   - Variation 2: Medium
   - Variation 3: Bold

2. Test on devices
   - iPhone 13
   - Samsung Galaxy S23
   - iPhone X (smaller)

3. Validate readability
   - 0.3s glance test
   - 6ft distance test
   - Elderly parent test (clarity)

Total: 15 thumbnails (5 patterns × 3 variations)
```

**Example Execution (Hypothesis B):**

```typescript
// thumbnail-emotion-face.tsx

import { AbsoluteFill, Img, useVideoConfig } from "remotion";

export const ThumbnailEmotionFace: React.FC<{
  faceImage: string;
  text: string;
}> = ({ faceImage, text }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      {/* Face with emotion (50% screen) */}
      <div
        style={{
          position: "absolute",
          top: "25%",
          left: "25%",
          width: "50%",
          height: "40%",
          border: "8px solid #C9B298", // Gold frame
          borderRadius: "20px",
          overflow: "hidden",
        }}
      >
        <Img src={faceImage} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>

      {/* Text overlay (20% screen) */}
      <div
        style={{
          position: "absolute",
          bottom: "15%",
          left: "10%",
          right: "10%",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontFamily: "Space Grotesk",
            fontSize: 80,
            fontWeight: 700,
            color: "#FFFFFF",
            margin: 0,
            textShadow: "0 4px 12px rgba(0,0,0,0.8)", // Legibility
            lineHeight: 1.1,
          }}
        >
          {text}
        </h1>
      </div>

      {/* Gold accent indicator (8%) */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          right: "10%",
          width: "12%",
          height: "3%",
          backgroundColor: "#C9B298",
          borderRadius: "20px",
        }}
      />
    </AbsoluteFill>
  );
};
```

### 3.2 Text Optimization

**@copy-wizard:**

```markdown
THUMBNAIL TEXT RULES:

Length:

- 1-3 words: Ideal (95% readable mobile)
- 4-5 words: Acceptable (80% readable)
- 6+ words: Too long (60% readable)

Patterns:

Pattern A (Bold Claim):

- "You're Wrong"
- "Stop This"
- "Never Do This"

Pattern B (Curiosity):

- "The Secret..."
- "What If..."
- "Nobody Tells You"

Pattern C (Data):

- "10M Views"
- "97% Fail"
- "5 Minutes"

Pattern D (How):

- "How I..."
- "How To..."
- "The Way"

AVOID:
❌ Full sentences
❌ Small text
❌ Complex words
❌ All caps (shouty)
```

---

## Fase 4: Scientific Testing (5-7 dias)

### 4.1 A/B/C/D/E Test Design

**@ab-test-master + @metrics-guru:**

```markdown
MULTIVARIATE TEST:

Test Matrix:

- 5 patterns (A-E)
- 3 variations each (conservative, medium, bold)
- 15 total thumbnails
- Same video content (isolate thumbnail variable)

Sample Size:

- Min 100K impressions per variant
- Target: 200K impressions (statistical significance)
- Duration: 5-7 days

Metrics Tracked:

- CTR (impressions → clicks)
- Scroll-stop rate (impressions → stops)
- Time to decision
- Retention @3s (quality check)
- Bounce rate

Winning Criteria:

- CTR >8% (benchmark)
- Scroll-stop >50%
- Retention maintained (>75% @3s)
```

### 4.2 Live Testing Execution

**@thumbnail-king:**

```markdown
TEST EXECUTION:

Day 1-2: Pattern Testing

- Test 5 patterns (A-E)
- Best variation of each
- 40K impressions per pattern
- Identify top 2 patterns

Day 3-5: Variation Testing

- Test 3 variations of top 2 patterns
- 60K impressions per variation
- Identify winner

Day 6-7: Validation

- Winner vs current thumbnail
- 100K impressions each
- Confirm improvement
- Statistical significance check

AVOID:
❌ Não change multiple variables
❌ Não stop test early (need data)
❌ Não confuse correlation vs causation
```

### 4.3 Results Analysis

**@metrics-guru + @thumbnail-king:**

```markdown
TEST RESULTS:

Pattern A (Big Bold Claim):

- CTR: 6.2%
- Scroll-stop: 48%
- Result: Below target

Pattern B (Emotion Face):

- CTR: 10.8% ✅ WINNER
- Scroll-stop: 61% ✅
- Result: +157% vs current

Pattern C (Before/After):

- CTR: 8.4% ✅
- Scroll-stop: 52%
- Result: Good, second place

Pattern D (Data Viz):

- CTR: 7.1%
- Scroll-stop: 49%
- Result: OK, not optimal

Pattern E (Mystery Blur):

- CTR: 5.8%
- Scroll-stop: 44%
- Result: Below target (too risky)

WINNER: Pattern B (Emotion Face)

- CTR: 10.8% (+157% vs baseline)
- Scroll-stop: 61% (+61% vs baseline)
- Retention @3s: 81% (maintained ✅)
- Bounce rate: 12% (low ✅)

LEARNING: Emotion + face = highest CTR
```

---

## Fase 5: Optimization & Scale (ongoing)

### 5.1 Winner Optimization

**⚡ PONTO DE DEBATE**

```
@thumbnail-king propõe:
"Pattern B won, mas can we optimize further?"

DEBATE:
@visual-impact: "Test emotion variations (surprise vs joy)"
@copy-wizard: "Test text variations (claim vs question)"
@color-psychologist: "Test frame colors (gold vs white)"
@metrics-guru: "Don't over-optimize, diminishing returns"

VOTAÇÃO:
Consenso: Test 3 micro-variations, then lock

MICRO-OPTIMIZATIONS TO TEST:
1. Emotion type (surprise vs shock vs joy)
2. Frame style (solid vs gradient vs glow)
3. Text position (bottom vs top vs overlay)

Expected lift: +5-10% additional
```

### 5.2 Pattern Library Creation

**@thumbnail-king documenta:**

```markdown
THUMBNAIL PATTERN LIBRARY v1.0:

Primary Pattern (Emotion Face):

- Use case: Default, highest CTR
- CTR: 10.8%
- Components: Face + emotion + text + gold frame
- When: Personal content, relatable topics

Secondary Pattern (Before/After):

- Use case: Transformation, results
- CTR: 8.4%
- Components: Split screen + arrow + minimal text
- When: Tutorial, progress, comparison

Tertiary Pattern (Bold Claim):

- Use case: Controversy, strong opinion
- CTR: 6.2%
- Components: Large text + minimal visual
- When: Hot takes, debates, manifestos

RULES:

- Primary 70% of videos
- Secondary 20% of videos
- Tertiary 10% of videos
- Always A/B test new patterns
```

### 5.3 Continuous Testing

**@ab-test-master:**

```markdown
ONGOING TESTING PROTOCOL:

Monthly:

- Test 1-2 new thumbnail patterns
- Validate existing patterns still work
- Update benchmarks

Quarterly:

- Full thumbnail audit
- Competitor analysis refresh
- Update pattern library

When Metrics Drop:

- CTR drops >15%: Emergency test
- New pattern immediately
- Diagnose root cause

New Content Type:

- Always A/B test thumbnails
- Don't assume pattern transfer
- Validate with data
```

---

## Sistema de Debate

### Pontos de Debate Obrigatórios

1. ✅ **Test patterns selection** (hypotheses)
2. ✅ **Winner optimization** (diminishing returns)
3. **Pattern rotation** (fatigue management)
4. **Risk tolerance** (bold vs safe)

### Regras de Consenso

- **Test design:** @ab-test-master veto power (stats)
- **Visual execution:** @thumbnail-king final say
- **Pattern selection:** Data trumps opinion (always)
- **Rollout:** Gradual (validate before scale)

---

## Checklist Final

### Research Phase

- [ ] Current thumbnail performance analyzed
- [ ] Competitor patterns researched
- [ ] Psychology frameworks applied
- [ ] Mobile optimization rules defined

### Hypothesis Phase

- [ ] 5 thumbnail patterns designed
- [ ] 3 variations per pattern created
- [ ] Mobile testing completed (3+ devices)
- [ ] Readability validated (0.3s test)

### Testing Phase

- [ ] A/B/C/D/E test executed (15 variants)
- [ ] 100K+ impressions per variant
- [ ] Statistical significance achieved
- [ ] Winner identified (CTR + scroll-stop)
- [ ] Quality check passed (retention maintained)

### Optimization Phase

- [ ] Winner micro-optimized
- [ ] Pattern library documented
- [ ] Team trained on patterns
- [ ] Continuous testing protocol established

---

## Benchmarks de Sucesso

### Thumbnail Performance

| Métrica           | Before | After (Winner) | Lift  |
| ----------------- | ------ | -------------- | ----- |
| CTR               | 4.2%   | 10.8%          | +157% |
| Scroll-Stop Rate  | 38%    | 61%            | +61%  |
| Time to Decision  | 0.9s   | 0.4s           | -56%  |
| Impressions→Views | 1:24   | 1:9            | +167% |

### Quality Check

| Métrica         | Target | Result | Status  |
| --------------- | ------ | ------ | ------- |
| Retention @3s   | >75%   | 81%    | ✅ Pass |
| Bounce Rate     | <20%   | 12%    | ✅ Pass |
| Save Rate       | >8%    | 9.8%   | ✅ Pass |
| Completion Rate | >40%   | 44%    | ✅ Pass |

---

## Tempo Total: 3-5 dias

**Breakdown:**

- Audit: 1 dia
- Hypothesis: 1 dia
- Creation: 1-2 dias
- Testing: 5-7 dias (parallel work)
- Optimization: Ongoing

---

## Pro Tips

### Do's ✅

- Always test scientifically (no guessing)
- Test on real devices (not desktop)
- Use 0.3s glance test (real scroll speed)
- Maintain brand consistency (gold rule)
- Document learnings (pattern library)

### Don'ts ❌

- Não copie competitors literalmente (adapt)
- Não test sem statistical significance
- Não sacrifice retention por CTR (quality matters)
- Não over-optimize (diminishing returns)
- Não ignore mobile (70% da audiência)

---

## Thumbnail Design Cheat Sheet

### Quick Rules

```
Text:
- 1-3 words ideal
- 80-120px size
- High contrast (white on black)
- Bold font weight (700+)

Visual:
- Single focal point
- High contrast
- Emotion > information
- Brand consistent

Composition:
- 50% main element
- 20-30% text
- 8% brand accent (gold)
- 20% negative space

Mobile Test:
- 0.3s glance (readable?)
- 6ft distance (visible?)
- Elderly test (clear?)
```

---

**Este workflow transforma thumbnails em scroll-stopping machines através de scientific testing.** 🖼️🚀
