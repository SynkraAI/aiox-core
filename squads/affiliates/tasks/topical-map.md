# topical-map

## Metadata
```yaml
task_id: AFF_SEO_003
agent: authority-builder
type: creation
complexity: high
estimated_time: "3h-5h"
source: "TASS 3.0 — Topical Authority Site Structure (Koray Tugberk Gubur methodology, adapted for affiliate)"
```

## Purpose
Design the complete hub-spoke topical architecture for an affiliate site, mapping every topic cluster to pillar pages and supporting articles — so the site achieves topical authority recognized by Google rather than appearing as a scattered collection of individual reviews.

## Prerequisites
- Niche confirmed and validated (AFF_STR_001)
- Content plan (AFF_SEO_002) completed or in progress — keyword clusters available
- Competitor intelligence (AFF_STR_003) — reveals competitor topical coverage
- Understanding of niche sub-topics and user journey stages

## Steps

1. **Define the topical universe** — Map all subtopics within the niche at three levels.
   - Level 0: The niche itself (site-wide topic)
   - Level 1: Primary subtopic categories (3-7 pillar themes)
   - Level 2: Specific topics within each subtopic (10-30 per pillar)
   - Level 3: Ultra-specific long-tail topics (supporting articles)

2. **Identify pillar page candidates** — Determine which Level 1 topics warrant pillar content.
   - Pillar criteria: broad enough to have 10+ supporting subtopics, clear informational + commercial angle, meaningful search volume (1K+/mo)
   - Target: 3-7 pillar pages for a new site (expand as authority grows)

3. **Map hub-spoke relationships** — Connect each pillar to its spoke articles.
   - Each pillar links to all its supporting articles (hub → spokes)
   - Each supporting article links back to its pillar (spoke → hub)
   - Cross-links between spokes in the same hub are allowed and encouraged

4. **Assign TASS 3.0 content coverage tiers** — Classify articles by topical coverage role.
   - Core Coverage: Must-publish articles without which topical authority is incomplete
   - Supplementary Coverage: Strong signals, high-value but not critical for baseline authority
   - Gap Coverage: Long-tail specific, published to prevent competitor from owning the subtopic

5. **Design internal linking architecture** — Define the complete internal link graph.
   - Homepage → Pillar pages (every pillar)
   - Pillar pages → All spoke articles in that pillar
   - Spoke articles → Pillar page (always)
   - Spoke articles → 2-4 related spokes (contextually relevant)
   - Identify "link funnel" pages: high-authority pages that pass equity to money pages

6. **Define pillar page structure** — For each pillar, specify content architecture.
   - Target word count: 3,000-5,000 words
   - Sections: intro, all major subtopics covered (brief), links to all spokes, FAQ, conclusion
   - Schema: HowTo or FAQ schema on relevant sections, BreadcrumbList

7. **Identify topical gaps vs competitors** — Compare your planned map against competitor coverage (from AFF_STR_003).
   - Topics competitors cover that you do not yet plan to cover → add to gap coverage list
   - Topics you plan to cover that competitors miss → flag as differentiation opportunities

8. **Sequence publication by topical authority building** — Order the publishing plan to build authority progressively.
   - Publish pillar pages before or alongside first wave of spokes (pillar should exist when spokes publish, creating immediate internal link)
   - Never publish a spoke article for a pillar that doesn't exist yet
   - Complete one topical cluster before expanding to new clusters (depth before breadth in early months)

9. **Document topical map** — Produce visual map (text-based hierarchy) and spreadsheet-style table.

## Framework / Inline Structure

### TASS 3.0 Topical Structure

```
LEVEL 0: NICHE (Site Topic)
└── LEVEL 1: PILLAR (Hub Pages, 3,000-5,000 words)
    ├── LEVEL 2: CLUSTER ARTICLE (Spoke, 1,000-3,000 words)
    │   └── LEVEL 3: LONG-TAIL ARTICLE (Deep Spoke, 600-1,500 words)
    └── LEVEL 2: CLUSTER ARTICLE ...
```

### Pillar Page Template Structure

```
PILLAR PAGE: {pillar_title}
Target keyword: {primary_kw} ({volume}/mo, KD {kd})
Word count: 3,500-5,000

Sections:
  1. Intro + core definition (300 words)
  2. {Subtopic_A} overview + link to spoke article
  3. {Subtopic_B} overview + link to spoke article
  4. {Subtopic_C} overview + link to spoke article
  5. [Repeat for each major subtopic — 5-12 sections]
  6. How to choose / buyer guide section (500 words)
  7. FAQ (5-8 questions, FAQ schema)
  8. Conclusion + primary CTA

Schema: FAQPage, BreadcrumbList, Article
```

### Coverage Tier Classification

```
CORE COVERAGE (publish in months 1-3):
  - The topic cannot be claimed topically without this article
  - Direct competitor for head-term or high-volume long-tail
  - Directly promotes Tier A affiliate products

SUPPLEMENTARY COVERAGE (publish in months 3-6):
  - Strong addition to topical map, meaningful traffic potential
  - Promotes Tier B products or supports pillar authority

GAP COVERAGE (publish in months 6+):
  - Fills white space competitors occupy
  - Low-volume, high-specificity — completes the topical universe
  - KGR candidates (volume < 250, KGR < 0.25) — see AFF_SEO_011
```

### Internal Linking Matrix (per pillar)

```
PILLAR: {name}
  ← Receives links from: Homepage, related pillars (contextual)
  → Links out to: All spokes in this cluster

SPOKE: {name}
  ← Receives links from: Pillar page, related spokes (2-4)
  → Links out to: Pillar page (always), related spokes (2-4)

LINK EQUITY FLOW:
  Homepage → Pillar → Cluster article → Long-tail article
  (High PR pages funnel authority down to money pages)
```

### Topical Authority Score Estimation

```
Topical Coverage Score (TCS) per pillar:
  TCS = (articles_published / articles_planned) × 100

Target TCS by phase:
  Month 3:  TCS >= 50% for primary pillar
  Month 6:  TCS >= 70% for primary pillar + 50% for secondary
  Month 12: TCS >= 85% for all pillars
```

## Veto Conditions

- **HARD VETO:** Pillar page structure cannot be defined with at least 8 supporting spoke articles per pillar — topical authority cannot be established for that sub-theme; reduce the number of pillars and go deeper rather than wider
- **SOFT VETO:** Content plan (AFF_SEO_002) has not been completed — topical map requires keyword cluster data; run content-plan.md first

## Output

- **File:** `docs/content/{date}-topical-map-{niche-slug}.md`
- **Format:** Markdown (hierarchy tree + table)

## Output Example

```yaml
# Topical Map — Example Output (YAML summary)
niche: "best air purifiers"
map_date: "2026-02-18"
pillars_planned: 5
total_articles_mapped: 48

pillar_structure:
  - pillar: "Best Air Purifiers (Buyer Guides)"
    keyword: "best air purifier"
    volume: 90500
    kd: 38
    spokes: 12
    tcs_month3_target: 50%
    core_spokes:
      - "Best Air Purifier for Allergies"
      - "Best Air Purifier for Large Rooms"
      - "Best Air Purifier Under $100"
      - "Best Air Purifier for Smoke"
    supplementary_spokes:
      - "Best Air Purifier for Bedroom"
      - "Best Air Purifier for Pets"
    gap_spokes:
      - "Best Air Purifier for Car"
      - "Best Quiet Air Purifier"

  - pillar: "Air Purifier Reviews"
    keyword: "air purifier reviews"
    volume: 22000
    kd: 31
    spokes: 14
    core_spokes:
      - "Levoit Core 300S Review"
      - "Winix 5500-2 Review"
      - "Coway AP-1512HH Review"

  - pillar: "Air Purifier How-To & Maintenance"
    keyword: "how to use air purifier"
    volume: 8100
    kd: 12
    spokes: 11
    tcs_month3_target: 30%
    core_spokes:
      - "How to Clean an Air Purifier"
      - "When to Replace HEPA Filter"
      - "How to Place Air Purifier in Room"

internal_link_equity_flow:
  homepage: ["→ Best Air Purifiers pillar", "→ Air Purifier Reviews pillar"]
  best_air_purifiers_pillar: ["→ all 12 spokes", "↔ Air Purifier Reviews pillar"]
  levoit_core_300s_review: ["→ Best Air Purifiers pillar", "→ Levoit Core 400S Review", "→ Best Air Purifier Under $100"]

publication_sequence:
  month_1: ["Best Air Purifiers 2026 (pillar)", "Levoit Core 300S Review", "Winix 5500-2 Review", "Best Air Purifier for Allergies"]
  month_2: ["Air Purifier Reviews pillar", "Coway Review", "Best Air Purifier for Large Rooms", "How-To pillar"]

next_step: "Feed topical map into link-strategy.md (AFF_SEO_004) for pillar page link prioritization"
```

---
*Squad: affiliates | Version: 1.0.0 | Created: 2026-02-18*
