# link-strategy

## Metadata
```yaml
task_id: AFF_SEO_004
agent: seo-affiliate + seo-content
type: creation
complexity: high
estimated_time: "2h-4h"
source: "Matt Diggity Link Building Framework — 3-Phase Strategy + Diggity Anchor Ratio"
```

## Purpose
Design a 3-phase link building strategy that builds a natural-looking, high-quality backlink profile conforming to the Diggity Anchor Ratio, mapping which pages receive links in each phase and which acquisition methods are used — so link equity is deliberately built toward money pages.

## Prerequisites
- Site audit (AFF_SEO_001) completed — current link profile baseline available
- Topical map (AFF_SEO_003) completed — pillar and money pages identified
- Competitor intelligence (AFF_STR_003) completed — competitor link profiles as benchmark
- Domain age and current DR known
- Budget or capacity for outreach / link acquisition confirmed by operator

## Steps

1. **Establish link profile baseline** — Pull current state from Ahrefs.
   - Current DR
   - Total referring domains (total and dofollow)
   - Current anchor text distribution (calculate vs Diggity Ratio targets)
   - DR distribution of existing referring domains
   - Identify any over-optimization flags (exact match anchor > 10%)

2. **Set link building targets** — Define 6-month and 12-month goals.
   - Target DR at 6 months (based on current DR, phase velocity)
   - Target referring domains at 6 months
   - Target anchor text distribution at 6 months (shift toward Diggity Ratio)

3. **Classify pages by link priority** — Determine which pages receive links in each phase.
   - Tier 1: Homepage and primary pillar pages (receives links in all phases)
   - Tier 2: Highest-priority commercial pages (top 5 money pages by revenue potential)
   - Tier 3: Supporting cluster articles (linked to indirectly via Tier 1 internal links)

4. **Design Phase 1: Foundation** — Define the baseline link building approach (months 1-3).
   - Focus: Brand mentions, resource page links, niche directories
   - Anchor type emphasis: Brand anchors and naked URLs (low-risk)
   - Minimum links per month: 5-10 referring domains
   - Source types: Unlinked brand mention outreach, HARO, niche directories

5. **Design Phase 2: Authority Scaling** — Define mid-phase strategy (months 3-6).
   - Focus: Guest posts on niche-relevant sites (DR 30+), niche edits
   - Anchor type: Introduce partial match anchors (carefully)
   - Minimum links per month: 10-20 referring domains
   - Source types: Guest posts, niche edits, link insertions, skyscraper outreach

6. **Design Phase 3: Competitive** — Define mature-phase strategy (months 6-12).
   - Focus: High-DR guest posts (DR 50+), link exchanges (carefully), digital PR
   - Anchor type: Strategic partial and exact match (to reach Diggity Ratio targets)
   - Minimum links per month: 15-25 referring domains
   - Source types: Digital PR, data studies, journalist outreach, premium guest posts

7. **Define anchor text budget** — Calculate exact anchor allocation.
   - Based on planned total links over 12 months, calculate how many links of each anchor type to acquire
   - Ensure trajectory hits Diggity Ratio at 12-month mark
   - Build in safety margin (±3% per category) to account for natural variation

8. **Plan velocity and pattern** — Ensure link acquisition looks natural.
   - No link velocity spikes > 3x average monthly rate
   - Mix DR levels naturally (not all DR 70+ links — pattern looks purchased)
   - Mix content page types (blog, resource, news)

9. **Identify link building assets** — Determine what will attract links organically.
   - Original data / research studies
   - Free tools or calculators
   - Visual assets (infographics, comparison charts)
   - Expert roundup content

10. **Document link strategy** — Write complete strategy document with phase plans, anchor budget, target page list, and monthly velocity plan.

## Framework / Inline Structure

### Diggity Anchor Text Ratio (Targets at 12 months)

```
Exact Match:   5-10%   — "best air purifier" (high-risk if over-used)
Partial Match: 15-20%  — "top air purifiers for smoke", "air purifier guide"
Brand:         30-40%  — "AirPureExpert", "via AirPureExpert.com"
Naked URL:     15-20%  — "airpureexpert.com", "https://airpureexpert.com"
Generic:       10-15%  — "click here", "read more", "this article", "source"
```

**WARNING: Anchor Over-Optimization Flags**
- Exact match > 10%: manual review risk
- Partial match > 25%: over-optimization signal
- Brand < 20%: unnatural profile for an actual brand

### 3-Phase Link Building Plan

```
PHASE 1: FOUNDATION (Months 1-3)
Goal: Establish brand presence, build baseline profile
  Methods:
    - Unlinked brand mention outreach (cite tool: Ahrefs Alerts)
    - HARO and journalist queries (free PR mentions)
    - Niche-relevant directory submissions (quality only)
    - Resource page link requests
  Anchor types: 80% brand + naked URL, 20% generic
  Volume target: 5-10 new RDs/month
  Target pages: Homepage (80%), top pillar (20%)

PHASE 2: AUTHORITY SCALING (Months 3-6)
Goal: Build DR and topical relevance signals
  Methods:
    - Guest posts on DR 30-60 niche blogs
    - Niche edit / link insertion outreach
    - Skyscraper outreach (for linkable assets published in Phase 1)
  Anchor types: 50% brand, 25% naked, 15% partial, 10% generic
  Volume target: 10-20 new RDs/month
  Target pages: Pillar pages (50%), top money pages (50%)

PHASE 3: COMPETITIVE (Months 6-12)
Goal: Match competitor DR, establish exact match balance
  Methods:
    - High-DR guest posts (DR 50+)
    - Digital PR (data studies, original research)
    - Strategic link exchanges (one-for-one only, use sparingly)
    - Premium niche edits on aged authority pages
  Anchor types: Target Diggity Ratio at full distribution
  Volume target: 15-25 new RDs/month
  Target pages: Top money pages (60%), homepage (20%), new pillars (20%)
```

### Link Quality Tiers (for prospect evaluation)

```
TIER A (Priority targets):
  DR >= 50, niche-relevant content, real organic traffic, dofollow

TIER B (Strong targets):
  DR 30-49, topically relevant, some organic traffic, dofollow

TIER C (Acceptable):
  DR 20-29, relevant industry, limited traffic, dofollow
  OR DR 30+, semi-relevant, nofollow (brand signal only)

REJECT:
  DR < 20 AND no organic traffic
  Site-wide or footer links
  Links from unrelated niches (zero topical relevance)
  Sites with obvious link farm signals (100+ outbound links per page)
```

### Anchor Budget Calculator Template

```
12-month link target: {total_links}

Budget by anchor type:
  Exact match   ({pct}%): {n} links → "{keyword1}", "{keyword2}"
  Partial match ({pct}%): {n} links → "{phrase1}", "{phrase2}"
  Brand         ({pct}%): {n} links → "{brand_name}"
  Naked URL     ({pct}%): {n} links → "{url}"
  Generic       ({pct}%): {n} links → "here", "source", "this guide"
```

## Veto Conditions

- **HARD VETO:** Current anchor text profile shows exact match > 15% — link building must NOT add more exact match anchors until profile is diluted; Phase 1 must focus exclusively on brand/generic/naked anchors until ratio normalizes
- **HARD VETO:** Site has active Google manual action for unnatural links — do not build any links until manual action is resolved and reconsideration approved
- **SOFT VETO:** Operator budget < $200/month — only white-hat organic methods (HARO, unlinked mentions, resource pages) are viable; set expectation that Phase 2 and 3 timelines extend significantly

## Output

- **File:** `docs/seo/link-strategy-{domain-slug}.md`
- **Format:** Markdown

## Output Example

```yaml
# Link Strategy — Example Output (YAML summary)
domain: "airpureexpert.com"
current_dr: 12
current_referring_domains: 38
strategy_date: "2026-02-18"

targets_6_month:
  dr: 28
  referring_domains: 120

targets_12_month:
  dr: 42
  referring_domains: 280

anchor_text_current:
  exact_match: "3%"
  partial_match: "8%"
  brand: "45%"
  naked_url: "30%"
  generic: "14%"

anchor_text_12mo_target:
  exact_match: "7%"
  partial_match: "17%"
  brand: "35%"
  naked_url: "18%"
  generic: "13%"
  note: "Currently under-weight on partial — Phase 2 adds partial anchors carefully"

phase_plan:
  phase_1_months_1_3:
    methods: ["HARO outreach", "Unlinked mention reclaim", "Niche directories"]
    anchor_focus: "Brand + Naked URL only"
    monthly_velocity: "5-8 new RDs"
    priority_pages: ["homepage", "best air purifiers pillar"]
  phase_2_months_3_6:
    methods: ["Guest posts DR 30-50", "Niche edits", "Skyscraper outreach"]
    anchor_focus: "Brand 50%, Naked 20%, Partial 20%, Generic 10%"
    monthly_velocity: "10-15 new RDs"
    priority_pages: ["top 3 money pages", "pillar pages"]
  phase_3_months_6_12:
    methods: ["DR 50+ guest posts", "Digital PR — original testing data", "Premium niche edits"]
    anchor_focus: "Diggity Ratio — full distribution"
    monthly_velocity: "15-20 new RDs"
    priority_pages: ["all top 5 money pages at scale"]

linkable_assets_planned:
  - "Air Purifier CADR Rating Database (original research)"
  - "HEPA vs MERV Filter Comparison Infographic"
  - "Air Purifier Noise Level Test Results (original testing)"

next_step: "Run link-building-outreach.md (AFF_SEO_009) to execute Phase 1"
```

---
*Squad: affiliates | Version: 1.0.0 | Created: 2026-02-18*
