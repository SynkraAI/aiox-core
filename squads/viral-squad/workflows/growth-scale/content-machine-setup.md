# 🏭 Content Machine Setup - Sistema de Produção

## Objetivo

Criar sistema para produzir 5-10 vídeos/semana de forma consistente

## Timeline

**Duração:** 2-3 semanas setup

## Agentes Envolvidos

- **@viral-topics** (ideias)
- **@script-architect** (scripts)
- **@remotion-architect** (templates)
- **@render-master** (pipeline)

---

## FASE 1: Template System (Semana 1)

### 1.1 Video Templates

```
@remotion-architect: *create-templates

TEMPLATES (5 formatos):

1. LISTICLE
   - Hook (3s)
   - Item 1-5 (8s each)
   - CTA (5s)
   Total: 48s

2. TRANSFORMATION
   - Before shot (5s)
   - Journey (30s)
   - After reveal (10s)
   - CTA (5s)
   Total: 50s

3. MISTAKE REVEAL
   - Hook "Stop doing X" (3s)
   - Wrong way (15s)
   - Right way (25s)
   - CTA (5s)
   Total: 48s

4. TUTORIAL
   - End result hook (5s)
   - Steps 1-5 (8s each)
   - CTA (5s)
   Total: 50s

5. CONTROVERSY
   - Hot take hook (5s)
   - Evidence (30s)
   - Counter + stance (15s)
   - CTA (5s)
   Total: 55s
```

### 1.2 Component Library

```
REUSABLE COMPONENTS:
- Hook intros (10 variations)
- Transition packs (5 styles)
- CTA outros (10 variations)
- Lower thirds (5 styles)
- Text cards (10 styles)
- Number reveals (5 styles)
```

### 1.3 Design System Integration

```
All templates use:
- Academia Lendária colors
- 8% gold rule
- Inter/Source Serif typography
- Standard animations
```

**DELIVERABLE:** 5 templates + components

---

## FASE 2: Content Pipeline (Semana 2)

### 2.1 Ideation System

```
@viral-topics: *ideation-system

WEEKLY IDEATION:
Monday:
- Review trends (@trend-hunter)
- Generate 20 ideas
- Rank by viral potential
- Select top 10 for week

IDEA BANK:
- Evergreen content (40%)
- Trend-based (40%)
- Experimental (20%)

OUTPUT:
- 3-month content calendar
- Idea bank with 100+ concepts
```

### 2.2 Script Templates

```
@script-architect: *script-templates

TEMPLATES PER FORMAT:

LISTICLE:
"""
[HOOK] "5 things [audience] get wrong about [topic]"
[ITEM 1] "Number 1: [mistake] - Instead do [fix]"
[ITEM 2] "Number 2: [mistake] - Instead do [fix]"
...
[CTA] "Save this for later. Follow for more."
"""

TRANSFORMATION:
"""
[BEFORE] "This was me [timeframe] ago"
[JOURNEY] "Then I discovered [method]"
[AFTER] "[Timeframe] later: [results]"
[CTA] "Want to know how? Comment [word]"
"""
```

### 2.3 Batch Production

```
BATCH WORKFLOW:

DAY 1 (Monday): Ideation
- Review week's concepts
- Finalize scripts
- Prepare assets

DAY 2 (Tuesday): Recording
- Record all 5-10 videos
- Multiple takes each
- B-roll batch

DAY 3 (Wednesday): Editing
- Apply templates
- Edit all videos
- Export for review

DAY 4 (Thursday): Review
- Quality check
- Minor fixes
- Prepare for publishing

DAY 5-7 (Fri-Sun): Publishing
- Schedule posts
- Engage heavily
- Monitor performance
```

---

## FASE 3: Automation (Semana 3)

### 3.1 Render Pipeline

```
@render-master: *batch-render

AUTOMATED PIPELINE:
1. Input: Script + assets folder
2. Process: Apply template
3. Render: 1080x1920, 30fps, h264
4. Output: Video + thumbnail

CONFIG:
- Parallel renders (2-3 videos)
- Auto naming convention
- Quality presets
```

### 3.2 Asset Management

```
FOLDER STRUCTURE:
/content-machine
  /templates
    listicle.tsx
    transformation.tsx
    ...
  /assets
    /week-01
      /video-01
        script.md
        assets/
        output/
    /week-02
      ...
  /library
    /footage
    /music
    /sfx
    /fonts
```

### 3.3 Quality Assurance

```
QA CHECKLIST (per video):
- [ ] Hook @3s retention ready
- [ ] 8% gold rule
- [ ] Audio levels correct
- [ ] Captions readable
- [ ] CTA clear
- [ ] Mobile optimized
```

---

## Weekly Workflow

### Monday: Ideation (2h)

```
9:00 - Trend review
9:30 - Idea generation
10:00 - Script selection
10:30 - Asset gathering
```

### Tuesday: Recording (4h)

```
Morning - Setup
Afternoon - Record all videos
Evening - Review footage
```

### Wednesday: Editing (4h)

```
Morning - Apply templates
Afternoon - Fine-tune edits
Evening - Export & review
```

### Thursday: Polish (2h)

```
Morning - Final fixes
Afternoon - Thumbnails
Evening - Schedule posts
```

### Friday-Sunday: Publish & Engage

```
Daily:
- Post 1-2 videos
- Engage 30 min
- Monitor metrics
```

---

## Scaling Guide

### 5 videos/week

- 1 person
- 4h recording
- 4h editing
- Templates essential

### 10 videos/week

- 2 people (creator + editor)
- Batch recording (1 day)
- Parallel editing
- Heavy template use

### 20+ videos/week

- Team (creator + editor + manager)
- Multiple creators or AI generation
- Full automation
- Strict templates

---

## Quality vs Quantity Balance

### Non-Negotiable Quality

- Hook strength (must stop scroll)
- Audio clarity
- Design system compliance
- CTA presence

### Acceptable Trade-offs

- Simpler animations (still use templates)
- Less B-roll
- Shorter production time
- Template-heavy approach

**DEBATE:** Where to draw the line?

---

## Output Final

### Deliverables

1. ✅ 5 video templates
2. ✅ Script templates per format
3. ✅ 3-month content calendar
4. ✅ Batch workflow documented
5. ✅ Render pipeline automated

### Success Metrics

- 5-10 videos/week consistently
- <10h total weekly production
- Quality maintained
- Engagement stable/growing

### Files Structure

```
/content-machine
  /templates (5 video templates)
  /scripts (script templates)
  /calendar (3-month plan)
  /assets (organized library)
  /pipeline (automation scripts)
  README.md (workflow guide)
```
