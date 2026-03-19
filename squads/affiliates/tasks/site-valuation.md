# site-valuation

## Metadata
```yaml
task_id: AFF_SEO_006
agent: seo-affiliate
type: analysis
complexity: medium
estimated_time: "1h-2h"
source: "Affiliate Site Valuation Framework — Empire Flippers / Motion Invest Methodology (30-40x Monthly Revenue)"
```

## Purpose
Calculate a defensible valuation range for an affiliate site using revenue multiples, traffic quality metrics, and premium/discount factors — enabling informed buy/sell/hold decisions and accurate representation of asset value to potential buyers or investors.

## Prerequisites
- Minimum 12 months of revenue data (6 months acceptable with disclosures)
- Access to Google Analytics or equivalent (session data, traffic source breakdown)
- Access to affiliate program dashboards (revenue by program)
- Access to Google Search Console (organic traffic, impressions, clicks)
- Access to Ahrefs or Semrush (DR, referring domains, traffic trend)
- Hosting and operational cost data

## Steps

1. **Calculate Net Profit (Monthly)** — Establish the base revenue figure used in valuation.
   - Collect last 12 months of gross revenue (all sources)
   - Subtract operational costs: hosting, tools subscriptions, content production, link building spend
   - Result = Net Monthly Profit
   - Calculate 12-month average and last 3-month average (buyers prefer 3-month average)

2. **Calculate base multiple range** — Apply standard affiliate site multiple.
   - Industry standard: 30-40x monthly net profit for affiliate sites
   - Use 30x as conservative floor, 40x as optimistic ceiling
   - Base valuation range = net_monthly_profit × 30 to net_monthly_profit × 40

3. **Apply premium factors** — Identify characteristics that push multiple above 30x.
   - Traffic trend: growing traffic → +2-5x multiple
   - Revenue diversification: 3+ sources → +2-3x multiple
   - Age: site > 3 years → +1-2x multiple
   - Traffic source diversification: not 100% SEO → +1-3x multiple
   - Email list: substantial list (1K+) → +1-2x multiple
   - Strong E-E-A-T and brand → +1-2x multiple
   - Above-average DR for the niche → +1-2x multiple

4. **Apply discount factors** — Identify characteristics that push multiple below 30x.
   - Traffic trend: declining traffic → -3-8x multiple
   - Revenue concentration: >70% from single program → -2-4x multiple
   - No content updates in past 6 months → -2-3x multiple
   - Recent Google algorithm update impact → -3-6x multiple
   - Site age < 1 year → -3-5x multiple (too young for most buyers)
   - Pending link issues or manual actions → DISQUALIFYING

5. **Determine adjusted multiple** — Calculate final multiple.
   - Start at base (30-40x range midpoint = 35x)
   - Add premium factors (sum of applicable premiums)
   - Subtract discount factors (sum of applicable discounts)
   - Clamp result: minimum 20x (distressed sale floor), maximum 55x (exceptional site ceiling)

6. **Calculate valuation** — Apply adjusted multiple to monthly net profit.
   - Point estimate: net_monthly_profit × adjusted_multiple
   - Range: net_monthly_profit × (adjusted_multiple - 5) to net_monthly_profit × (adjusted_multiple + 5)

7. **Validate against comparable sales** — Cross-reference with known sales data.
   - Check Empire Flippers, Flippa, or Motion Invest for recent comparable sales in the niche
   - Adjust if market comparables suggest significant deviation

8. **Sensitivity analysis** — Calculate valuation at different revenue scenarios.
   - Bear case: -20% revenue → valuation
   - Base case: current revenue → valuation
   - Bull case: +20% revenue (with current growth trend) → valuation

9. **Calculate operational metrics** — Key metrics that buyers evaluate beyond multiple.
   - Revenue per visitor (RPV)
   - Revenue per thousand pageviews (RPM)
   - Content cost per article (if applicable)
   - Payback period at purchase price (months to recoup investment)

10. **Write valuation report** — Document all inputs, assumptions, and resulting range.

## Framework / Inline Structure

### Valuation Formula

```
CORE FORMULA:
  Base Valuation = Avg Monthly Net Profit × Multiple
  Multiple Range = 30x (conservative) – 40x (optimistic) for stable affiliate sites

ADJUSTED MULTIPLE CALCULATION:
  Start: 35x (midpoint)
  + Premium factors (see table)
  - Discount factors (see table)
  = Adjusted multiple

FINAL VALUATION RANGE:
  Low:  Monthly Net Profit × (Adjusted - 5)
  Mid:  Monthly Net Profit × Adjusted
  High: Monthly Net Profit × (Adjusted + 5)
```

### Premium Factor Table

| Factor | Condition | Multiple Add |
|--------|-----------|-------------|
| Traffic trend | MoM growth > 5% for 6+ months | +3 to +5x |
| Revenue diversification | 3+ sources, no source > 50% | +2 to +3x |
| Site age | 3-5 years | +1x; >5 years +2x |
| Email list | 1K+ engaged subscribers | +1 to +2x |
| Traffic source diversification | SEO < 70% of traffic | +1 to +3x |
| Domain authority | DR 50+ (above niche average) | +1 to +2x |
| E-E-A-T signals | Strong author profiles, original research | +1 to +2x |
| Branded content | Recognizable brand in niche | +1x |

### Discount Factor Table

| Factor | Condition | Multiple Subtract |
|--------|-----------|-----------------|
| Traffic decline | MoM decline > 5% for 3+ months | -3 to -8x |
| Revenue concentration | Single program > 70% | -2 to -4x |
| Recent HCU / algo hit | Traffic -30%+ in past 6 months | -4 to -8x |
| Age < 12 months | Site not yet proven | -3 to -5x |
| Content staleness | No updates in 6+ months | -2 to -3x |
| Pending link risk | Known bad link profile not cleaned | -2 to -4x |
| Niche regulatory risk | In legally restricted space | -2 to -5x |

### Operational Metrics Scorecard

```
Revenue Per Visitor (RPV):
  RPV = Monthly Revenue / Monthly Sessions
  Excellent: > $0.10/visitor
  Good:      $0.05-$0.10/visitor
  Acceptable: $0.02-$0.05/visitor
  Weak:      < $0.02/visitor

Payback Period (for buyers):
  Payback = Purchase Price / Monthly Net Profit
  Target: 30-40 months (aligns with multiple)
  Buyer IRR target: 30-50% annually
```

### Market Comparable Benchmarks (2025-2026)

```
Content affiliate sites (US traffic, stable):
  Typical sale: 32-38x monthly net
  Premium sites (growing, diversified): 40-50x
  Distressed (declining, single source): 18-25x

Industry platforms:
  Empire Flippers: vetted listings, higher multiples
  Motion Invest: smaller sites, 20-35x typical
  Flippa: wide range, negotiate more aggressively
```

## Veto Conditions

- **HARD VETO:** Site has active Google Manual Action or is de-indexed — valuation is $0 until resolved; do not present any valuation estimate
- **HARD VETO:** Revenue data is less than 3 months old — insufficient data for reliable valuation; document as ESTIMATE WITH HIGH UNCERTAINTY, require operator acknowledgment before using valuation for any transaction
- **SOFT VETO:** Revenue declined > 20% in past 3 months — apply mandatory distressed multiple (maximum 25x); document decline trajectory prominently in report

## Output

- **File:** `docs/monetization/{date}-site-valuation-{domain-slug}.md`
- **Format:** Markdown

## Output Example

```yaml
# Site Valuation Report — Example Output (YAML summary)
domain: "airpureexpert.com"
valuation_date: "2026-02-18"
data_period: "12 months (Feb 2025 – Jan 2026)"

financials:
  avg_monthly_gross_revenue_12mo: "$1,840"
  avg_monthly_costs_12mo: "$320"
  avg_monthly_net_profit_12mo: "$1,520"
  last_3mo_avg_net_profit: "$1,720"
  revenue_used_in_valuation: "$1,720"  # 3-month average (buyer preference)

multiple_calculation:
  base_multiple: 35
  premiums:
    - factor: "Traffic growing 8% MoM x6 months"
      add: +4
    - factor: "3 revenue sources (affiliate, display, email)"
      add: +2
    - factor: "Email list 1,200 subscribers"
      add: +1
  discounts:
    - factor: "Site age 22 months (< 3 years)"
      subtract: -1
    - factor: "SEO = 88% of traffic (high concentration)"
      subtract: -1
  adjusted_multiple: 40

valuation:
  low_estimate: "$60,200"   # $1,720 × 35x
  mid_estimate: "$68,800"   # $1,720 × 40x
  high_estimate: "$77,400"  # $1,720 × 45x

operational_metrics:
  monthly_sessions: 22400
  revenue_per_visitor: "$0.077"  # GOOD
  payback_period_months: 40      # At mid estimate

sensitivity:
  bear_minus_20pct: "$55,040"
  base: "$68,800"
  bull_plus_20pct: "$82,560"

market_comparables: "Similar 22-month sites on Empire Flippers trading at 36-42x — mid estimate aligned"

recommendation: "HOLD — site in growth phase; valuation likely increases to $90K+ at 12 months if growth continues"
next_step: "Re-run valuation in 6 months; consider listing on Empire Flippers at $80K+ if growth holds"
```

---
*Squad: affiliates | Version: 1.0.0 | Created: 2026-02-18*
