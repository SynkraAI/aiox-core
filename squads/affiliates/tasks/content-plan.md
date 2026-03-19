# content-plan

## Metadata
```yaml
task_id: AFF_SEO_002
agent: seo-affiliate + authority-builder
type: creation
complexity: high
estimated_time: "3h-5h"
source: "Affiliate Content Planning — Keyword Cluster → Article Matrix Methodology (Diggity + Kyle Roof)"
```

## Purpose
Transform keyword research into a prioritized editorial calendar of 30-50 articles organized by content type and business value, ensuring content production targets the highest-converting pages first while building topical authority systematically.

## Prerequisites
- Niche scorecard (AFF_STR_001) GO or SOFT GO
- Program stack validated (AFF_STR_002) — affiliate programs confirmed
- Competitor intelligence (AFF_STR_003) — content gap data available
- Product selection (AFF_STR_006) — Tier A and B products identified
- Access to Ahrefs or Semrush (Keyword Explorer, SERP analysis)
- Topical map (AFF_SEO_003) recommended as companion task (can run in parallel)

## Steps

1. **Seed keyword collection** — Build master keyword list from all research completed.
   - Primary keyword from niche scorecard
   - Competitor gap keywords (from AFF_STR_003)
   - Tier A product names + review modifiers
   - Best-of modifiers: "best {product category}", "best {product} under $X", "best {product} for {use-case}"
   - How-to and informational terms related to the niche
   - Vs/comparison terms: "{product A} vs {product B}"
   - Target: 100-300 seed keywords before clustering

2. **Keyword data enrichment** — Pull metrics for all seeds.
   - Monthly search volume
   - Keyword Difficulty (KD)
   - SERP features (featured snippet, PAA, shopping)
   - Search intent classification (Commercial / Transactional / Informational / Navigational)
   - Estimated traffic potential at position 1

3. **Cluster keywords by topic** — Group semantically related keywords into article clusters.
   - Use Ahrefs Keyword Clustering or manual grouping by parent topic
   - Each cluster = one article (or one content hub + supporting articles)
   - Identify primary keyword per cluster (highest volume + best intent alignment)
   - Flag clusters with >5 related keywords as topical map pillar candidates (feed to AFF_SEO_003)

4. **Classify by content type** — Assign each cluster to a content type.
   - Review: Single product evaluation ("Levoit Core 300S Review")
   - Best-of Roundup: Category comparison ("Best Air Purifiers for Small Rooms")
   - How-To: Process or instructional ("How to Clean an Air Purifier Filter")
   - Vs/Comparison: Head-to-head ("Levoit Core 300S vs Winix 5500-2")
   - Informational: Educational ("HEPA vs MERV Filter: What's the Difference")

5. **Score articles by Priority Index** — Apply scoring formula (see Framework).
   - Revenue Potential × Traffic Potential × Competition Score = Priority Index
   - Produces absolute ranking for production queue

6. **Apply content type distribution targets** — Ensure balanced content mix.
   - Reviews: 30-40% of articles
   - Best-of Roundups: 25-35%
   - How-to / Informational: 20-30%
   - Vs/Comparison: 10-15%
   - Adjust based on niche — heavy research niches lean informational, high-purchase-intent niches lean commercial

7. **Define word count targets** — Set length by content type and competition level.
   - Best-of Roundup (primary head term): 3,000-5,000 words
   - Individual Product Review (Tier A): 1,500-3,000 words
   - How-to / Informational: 800-2,000 words (match SERP length, not max length)
   - Vs/Comparison: 1,200-2,500 words
   - Never write for length — match competitor length + 20% for key commercial pages

8. **Build publishing schedule** — Sequence articles into 6-month calendar.
   - Month 1: Top 3-5 priority commercial articles (core money pages)
   - Months 2-3: Supporting reviews and best-of roundups
   - Months 4-6: Informational cluster and how-to content (builds E-E-A-T and long-tail traffic)

9. **Assign internal linking plan** — For each article, define planned internal link targets.
   - Which pillar page will link to this article
   - Which articles this article should link to (next step, related review, etc.)

10. **Document content plan** — Produce final article matrix with all fields populated.

## Framework / Inline Structure

### Priority Index Formula

```
Priority Index = Revenue Potential × Traffic Potential × Competition Score

Revenue Potential (1-5):
  5 = Directly promotes Tier A product, high commission per sale
  4 = Promotes Tier A/B product, moderate commission
  3 = Supports commercial pages via internal links
  2 = Informational, builds authority
  1 = Peripheral topic, low direct revenue contribution

Traffic Potential (1-5, based on volume):
  5 = >10K/mo at position 1
  4 = 3K-10K/mo
  3 = 1K-3K/mo
  2 = 300-1K/mo
  1 = <300/mo

Competition Score (1-5, inverse of difficulty):
  5 = KD <= 10 (easy)
  4 = KD 11-20
  3 = KD 21-35
  2 = KD 36-50
  1 = KD > 50 (hard)
```

### Content Type Distribution Targets

```
Content Mix (30-50 articles):
  Review articles:        30-40%  (direct commission generators)
  Best-of Roundups:       25-35%  (high-volume commercial targets)
  How-to / Informational: 20-30%  (E-E-A-T + long-tail + email capture)
  Vs / Comparison:        10-15%  (bottom-of-funnel, high intent)
```

### Article Matrix Template Fields

```
| # | Title | Primary KW | Volume | KD | Type | Products | Priority | Word Count | Status |
|---|-------|-----------|--------|----|----|---------|----------|-----------|--------|
| 1 | Best Air Purifiers 2026 | best air purifier | 90K | 38 | Best-of | Levoit, Winix, Coway | 95 | 4000 | TODO |
| 2 | Levoit Core 300S Review | levoit core 300s review | 12K | 22 | Review | Levoit Core 300S | 90 | 2500 | TODO |
```

### Search Intent Classification Guide

```
COMMERCIAL (→ Review, Best-of, Vs):
  Keywords with: "best", "review", "vs", "top", "recommended", "buy"

TRANSACTIONAL (→ Roundup with strong CTAs):
  Keywords with: "buy", "cheap", "discount", "coupon", "deal"

INFORMATIONAL (→ How-to, Explainer):
  Keywords with: "how", "what", "why", "does", "which", "can"

NAVIGATIONAL (→ Avoid unless targeting brand):
  Brand names + "website", "login", "official"
```

## Veto Conditions

- **HARD VETO:** Fewer than 15 viable keyword clusters identified with volume > 300/mo AND KD < 50 — niche has insufficient content opportunity at accessible difficulty; return to AFF_STR_001 for re-evaluation
- **SOFT VETO:** >70% of viable keywords fall in KD > 45 range — niche is defensively held; require operator confirmation of long-term timeline (18+ months to meaningful traffic) before proceeding

## Output

- **File:** `docs/content/{date}-content-plan-{niche-slug}.md`
- **Format:** Markdown (article matrix table + publishing schedule)

## Output Example

```yaml
# Content Plan — Example Output (YAML summary)
niche: "best air purifiers"
plan_date: "2026-02-18"
total_articles_planned: 42
articles_month_1: 4
articles_months_2_3: 16
articles_months_4_6: 22

content_mix:
  reviews: 14          # 33%
  best_of_roundups: 13 # 31%
  how_to: 10           # 24%
  vs_comparison: 5     # 12%

top_5_priority_articles:
  1:
    title: "Best Air Purifiers 2026 — Tested & Ranked"
    keyword: "best air purifier"
    volume: 90500
    kd: 38
    type: best_of
    priority_index: 75
    target_word_count: 4500
  2:
    title: "Levoit Core 300S Review — Is It Worth It?"
    keyword: "levoit core 300s review"
    volume: 12100
    kd: 22
    type: review
    priority_index: 72
    target_word_count: 2800
  3:
    title: "Best Air Purifier for Allergies 2026"
    keyword: "best air purifier for allergies"
    volume: 18100
    kd: 29
    type: best_of
    priority_index: 68
    target_word_count: 3500

publishing_schedule:
  month_1:
    - "Best Air Purifiers 2026"
    - "Levoit Core 300S Review"
    - "Winix 5500-2 Review"
    - "Best Air Purifier for Allergies"

next_steps:
  - "Run topical-map.md (AFF_SEO_003) to architect hub-spoke structure"
  - "Run skyscraper-execution.md (AFF_SEO_008) for article #1 (head term)"
```

---
*Squad: affiliates | Version: 1.0.0 | Created: 2026-02-18*
