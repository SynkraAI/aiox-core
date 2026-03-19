# Source Tier Classification

Reference data for classifying sources during the collect-sources phase.

---

## Tier System

| Tier | Type | Confidence | Weight | Examples |
|------|------|-----------|--------|----------|
| **Tier 0** | User materials | MAXIMUM | 5x | PDFs, books, transcriptions provided directly by user |
| **Tier 1** | Primary (by expert) | HIGH | 3x | Own books, direct interviews, courses, keynotes |
| **Tier 2** | Secondary (about expert) | MEDIUM | 1.5x | Biographies, case studies, profiles, analyses |
| **Tier 3** | Tertiary (aggregated) | LOW | 1x | Wikipedia, quote compilations, summaries |

---

## Source Types by Tier

### Tier 0 - User Materials
- PDF documents provided by user
- Books (physical or digital) shared by user
- Personal transcriptions
- Course notes
- Private interviews or recordings
- Personal correspondence or notes about the expert

### Tier 1 - Primary Sources
- **Books written by the expert** (highest Tier 1 value)
- **Long-form interviews** (podcast, video, print)
- **Keynote speeches and talks** (with full transcript)
- **Courses and masterclasses** (structured teaching)
- **Original articles/blog posts** (written by expert)
- **Frameworks/methodologies** (published by expert)
- **Social media** (direct posts, not retweets/shares)

### Tier 2 - Secondary Sources
- **Biographies** (authorized > unauthorized)
- **Case studies** (about the expert or their work)
- **Profiles** (in-depth media profiles)
- **Academic analyses** (of their work/methodology)
- **Interviews about them** (by collaborators, students)

### Tier 3 - Tertiary Sources
- **Wikipedia** (good for facts, bad for voice/thinking)
- **Quote compilations** (decontextualized)
- **Summary articles** ("10 lessons from...")
- **AI-generated content** about the expert
- **Brief mentions** in broader articles

---

## Gold vs Bronze Classification

### Gold Content (Prioritize)
- Direct responses to audience questions (comments, Q&A)
- Long-form interviews (45+ minutes)
- Stories/posts answering specific questions
- Books written by the expert personally
- Real case analysis with reasoning exposed
- Unscripted moments (podcasts, live sessions)

### Bronze Content (Deprioritize)
- Old/outdated content (views may have evolved)
- Generic/surface-level material
- Repetitive talks (same keynote given 20 times)
- Third-party content about the expert
- Short-form/edited content (loses nuance)
- AI-generated summaries

**Rule:** Less gold content > lots of bronze content.

---

## Minimum Criteria (BLOCKING GATE)

All 5 must pass:

1. **10+ total sources** across all tiers
2. **5+ Tier 1 sources** (primary, by the expert)
3. **3+ different source types** (book, interview, article, video, etc.)
4. **5+ hours OR 200+ pages** of total content
5. **Main framework triangulated** (confirmed by 3+ sources)

### Decision Matrix

| Checks Passed | Decision | Action |
|--------------|----------|--------|
| 5/5 | **GO** | Proceed to extraction |
| 4/5 | **CONDITIONAL** | Proceed with flag + acquisition plan |
| 3/5 or less | **NO-GO** | Stop, acquire more sources |
| <5 sources total | **FAIL** | Expert too obscure for cloning |
