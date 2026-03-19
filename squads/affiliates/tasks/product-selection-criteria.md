# product-selection-criteria

## Metadata
```yaml
task_id: AFF_STR_006
agent: marketplace-ops + affiliate-strategist
type: creation
complexity: medium
estimated_time: "1h-3h"
source: "Affiliate Product Selection Weighted Scoring — Amazon/Marketplace Methodology"
```

## Purpose
Define and apply a weighted scoring system to rank individual products within a validated niche for affiliate promotion priority, ensuring content and link equity are concentrated on products most likely to convert and generate sustainable commission revenue.

## Prerequisites
- Niche confirmed and validated (AFF_STR_001 GO or SOFT GO)
- Program stack validated (AFF_STR_002) — programs to source products from
- Access to: Amazon Best Sellers, product reviews, affiliate network product listings
- Access to Ahrefs/Semrush for product-level keyword research
- Minimum 20 candidate products identified in the niche

## Steps

1. **Enumerate candidate products** — Build raw product list from all relevant sources.
   - Amazon Best Sellers and Movers & Shakers in category
   - Affiliate network featured products and high-EPC listings
   - Competitor review roundup inclusions (from AFF_STR_003 data)
   - Reddit and forum recommendations in the niche
   - Target: 20-50 candidate products before scoring

2. **Collect raw data per product** — For each product, gather all scoring inputs.
   - Commission rate (from validated program stack)
   - Customer rating (stars, from marketplace or review site)
   - Sales velocity indicators (BSR on Amazon, bestseller badges, review velocity)
   - Product availability (in-stock rate, shipping reliability)
   - Price point (determines absolute commission dollar amount)

3. **Calculate weighted score per product** — Apply scoring model (see Framework).
   - Score each dimension 1-10
   - Apply dimension weight
   - Sum weighted scores for total

4. **Apply disqualification filters** — Remove ineligible products before ranking.
   - Rating < 3.5 stars AND review count > 100 — quality signal is clear: do not promote
   - Commission rate produces < $1.00 per conversion (low-price + low-commission = not worth content investment)
   - Product discontinued or chronically out-of-stock (>30% out-of-stock rate over 90 days)

5. **Tier remaining products** — Classify by total weighted score.
   - Tier A (Hero Products): Score >= 75 — primary review targets, build dedicated long-form content
   - Tier B (Supporting Products): Score 50-74 — include in roundups and comparison tables
   - Tier C (Mention-only): Score 30-49 — reference briefly in best-of lists, do not dedicate content
   - Discard: Score < 30 or failed disqualification filter

6. **Identify content assignment** — Map each Tier A and B product to a content type.
   - Tier A: Dedicated product review (1,500-3,000 words)
   - Tier A: Inclusion in best-of roundup (hero position or Runner Up)
   - Tier B: Roundup inclusion (secondary positions)
   - Note which products warrant "vs" comparison articles

7. **Flag risk signals** — For each product, note risks.
   - Single-source commission (only one program sells this product)
   - Price instability (frequent Amazon price fluctuations)
   - Brand reputation risk (controversial brand history)
   - Potential for program to drop product or slash commission

8. **Produce product selection report** — Final ranked list with scores, tiers, content assignments, and risk flags.

## Framework / Inline Structure

### Weighted Scoring Model (max 100 pts)

| Dimension | Weight | Max Points | Scoring Guide |
|-----------|--------|-----------|---------------|
| Commission Rate | 30% | 30 | >30%=30, 15-30%=24, 10-15%=18, 5-10%=12, <5%=6 |
| Customer Rating | 25% | 25 | 4.5-5.0=25, 4.0-4.4=20, 3.5-3.9=12, <3.5=0 |
| Sales Velocity | 20% | 20 | BSR<1K=20, 1K-10K=16, 10K-50K=10, 50K-100K=5, >100K=2 |
| Availability | 15% | 15 | Always in stock=15, Rarely OOS=12, Seasonally OOS=8, Frequently OOS=3 |
| Price Point (commission $) | 10% | 10 | >$30/sale=10, $15-30=8, $8-15=6, $3-8=4, <$3=2 |

**Total: 100 pts**

### Tier Thresholds

```
Tier A (Hero):     >= 75 pts  — Dedicated content, priority link building
Tier B (Support):  50-74 pts  — Roundup/comparison inclusion
Tier C (Mention):  30-49 pts  — Brief mention only
Discard:           < 30 pts   — Do not promote
```

### Product Risk Flag Schema

```
RISK_SINGLE_SOURCE    — Only one affiliate program sells this
RISK_PRICE_VOLATILE   — Price swings >20% month-over-month
RISK_LOW_REVIEWS      — <50 reviews, insufficient validation
RISK_BRAND_REPUTATION — Brand has documented controversy
RISK_OOS_CHRONIC      — Out of stock >30% of observed time
RISK_COMMISSION_CUT   — Program has history of commission reductions
```

### Content Assignment Decision Tree

```
Product Score >= 75?
  YES → Assign dedicated review article (2,000+ words)
        Is there a direct competitor product also Tier A?
          YES → Also plan "Product A vs Product B" comparison
          NO  → Single product review sufficient

Product Score 50-74?
  YES → Include in best-of roundup
        Position in roundup determined by score rank
        Do NOT build dedicated single-product article

Product Score < 50?
  → Skip or mention-only in category overview
```

## Veto Conditions

- **HARD VETO:** Fewer than 5 products reach Tier A or B score — niche has insufficient quality product depth; return to AFF_STR_001 with updated D6 (EPC Potential) score
- **HARD VETO:** All Tier A products are from a single brand — brand concentration risk is structural; operator must confirm acceptable risk before proceeding
- **SOFT VETO:** Average commission per sale across Tier A products < $5.00 — revenue per article is too low to justify content investment; present unit economics analysis to operator before proceeding

## Output

- **File:** `docs/strategy/{date}-product-selection-{niche-slug}.md`
- **Format:** Markdown

## Output Example

```yaml
# Product Selection Report — Example Output (YAML summary)
niche: "best air purifiers"
analysis_date: "2026-02-18"
candidates_evaluated: 34
products_tier_a: 6
products_tier_b: 11
products_tier_c: 8
products_discard: 9

tier_a_products:
  - product: "Levoit Core 300S"
    score: 88
    commission: "10% (Levoit Direct, ShareASale)"
    commission_per_sale: "$22 avg"
    rating: 4.6
    bsr: 850
    content_assignment: "Dedicated review + include in top 3 roundups"
    risk_flags: []
  - product: "Winix 5500-2"
    score: 81
    commission: "8% (Winix Direct, Impact)"
    commission_per_sale: "$16 avg"
    rating: 4.4
    bsr: 1200
    content_assignment: "Dedicated review + 'Winix 5500-2 vs Levoit Core 400S' comparison"
    risk_flags: [RISK_PRICE_VOLATILE]

tier_b_products:
  - product: "Coway AP-1512HH Mighty"
    score: 68
    commission: "7% (CJ)"
    commission_per_sale: "$14 avg"
    rating: 4.6
    bsr: 2100
    content_assignment: "Include in all major roundups (budget pick position)"
    risk_flags: []

content_assignments:
  dedicated_reviews: 6
  comparison_articles: 2
  roundup_inclusions: 17

estimated_avg_commission_per_sale: "$18.40"
next_step: "Feed Tier A list into content-plan.md (AFF_SEO_002) for article prioritization"
```

---
*Squad: affiliates | Version: 1.0.0 | Created: 2026-02-18*
