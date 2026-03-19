# analyze-niche

## Metadata
```yaml
task_id: AFF_STR_001
agent: affiliate-strategist + seo-affiliate
type: analysis
complexity: high
estimated_time: "2h-4h"
source: "Matt Diggity — Affiliate Lab Niche Selection Framework (adapted)"
```

## Purpose
Evaluate a candidate niche using a 15-point scorecard across 6 weighted dimensions to produce a definitive GO / SOFT GO / NO-GO investment decision. Prevents capital and time allocation to unviable niches before any content or infrastructure is built.

## Prerequisites
- Candidate niche or primary keyword defined by operator
- Access to Ahrefs or Semrush (DR, traffic, KD data)
- Access to Google Trends (5-year view)
- Access to affiliate network search (Amazon, ClickBank, ShareASale, Impact, etc.)
- Template loaded: `squads/affiliates/templates/niche-scorecard-tmpl.md`

## Steps

1. **Define scope** — Confirm niche name, primary keyword, target market (BR / US / Global), and platform focus with operator before proceeding.
   - Document in the Niche Info table of the scorecard template

2. **Score D1: Commission Rate** — Research all affiliate programs available in the niche.
   - Find average commission rate across 3+ programs
   - Check cookie duration (30d+ preferred, 24h = weak)
   - Identify recurring / tiered commissions
   - Score 0-3 per sub-dimension (see Framework below)

3. **Score D2: Search Demand** — Pull keyword data for primary KW and top 10 related terms.
   - Monthly search volume for primary keyword
   - Long-tail keyword cluster depth (use Ahrefs KE or Semrush)
   - Trend direction (Google Trends 12-month view)
   - Score 0-3 per sub-dimension

4. **Score D3: Competition (DR)** — Analyze top 10 SERP results for primary keyword.
   - Calculate average DR of top 10
   - Identify big brand dominance (Amazon, Forbes, Wirecutter)
   - Assess content quality gap (can fresh content beat incumbents?)
   - Score 0-3 per sub-dimension

5. **Score D4: Seasonality** — Pull Google Trends 5-year data for primary keyword.
   - Determine if demand is year-round or seasonal
   - Measure peak vs valley ratio
   - Assess predictability of cycles
   - Score 0-3 per sub-dimension

6. **Score D5: Program Diversity** — Audit breadth of affiliate programs.
   - Count distinct programs available (target 5+)
   - Confirm programs span multiple networks (not single-dependency)
   - Check program age and reputation (avoid <1 year old programs)
   - Score 0-3 per sub-dimension

7. **Score D6: EPC Potential** — Research earnings-per-click signals.
   - Find reported EPC in affiliate forums / network dashboards
   - Estimate average order value from product research
   - Cross-reference conversion rate signals (landing page quality, reviews)
   - Score 0-3 per sub-dimension

8. **Calculate total and normalize** — Sum all 6 dimension subtotals, normalize to 15-point scale.
   - Raw max = 54 (6 dimensions × 3 sub-dimensions × 3 max score)
   - Normalized = (raw_total / 54) × 15, rounded to 1 decimal

9. **Render verdict** — Apply decision thresholds and write justification narrative.
   - Document strongest and weakest dimensions
   - List top 3 risks
   - Define recommended next step

10. **Save scorecard** — Write completed scorecard to output file and update squad data registry if applicable.

## Framework / Inline Structure

### Scoring Scale (per sub-dimension, max 3 pts)

| Score | Commission Rate | Search Demand | Competition DR | Seasonality | Program Diversity | EPC Potential |
|-------|----------------|--------------|----------------|-------------|-------------------|---------------|
| 3 | >30% or $50+ flat | >10K/mo primary | Avg DR <40 | Year-round stable | 10+ programs | EPC >$1.50 |
| 2 | 15-30% or $20-50 | 3K-10K/mo | Avg DR 40-60 | Mild seasonal | 5-9 programs | EPC $0.75-$1.50 |
| 1 | 5-15% or $5-20 | 500-3K/mo | Avg DR 60-75 | Strong seasonal | 3-4 programs | EPC $0.25-$0.75 |
| 0 | <5% or <$5 | <500/mo | Avg DR >75 + big brands | Single spike | <3 programs | EPC <$0.25 |

### Decision Thresholds (normalized 0-15 scale)

```
GO       >= 10  — Proceed. Build site and content now.
SOFT GO   7- 9  — Proceed with reservations. Address weak dimensions first.
NO-GO    <  7   — Do not enter. Pivot angle or abandon niche.
```

### Dimension Weights (informational)

| Dimension | Weight Category | Rationale |
|-----------|----------------|-----------|
| D1: Commission Rate | High | Revenue ceiling; low commission = structural cap |
| D2: Search Demand | High | Traffic without demand = no organic growth |
| D3: Competition DR | Medium | Barrier to entry, but not insurmountable |
| D4: Seasonality | Medium | Affects revenue predictability |
| D5: Program Diversity | Medium | Concentration risk |
| D6: EPC Potential | High | Real-world earnings signal |

## Veto Conditions

- **HARD VETO:** Primary keyword has 0 affiliate programs with cookie duration >= 24h — stop, do not score
- **HARD VETO:** Average DR of top 10 results > 80 AND all positions held by mega-brands (Amazon, Wikipedia, government sites) — competition is impenetrable
- **HARD VETO:** Niche is legally restricted in target market (pharmaceuticals without medical license, financial advice without regulatory approval in regulated jurisdictions)
- **SOFT VETO:** Total score < 7 — present NO-GO with specific pivot recommendations before abandoning

## Output

- **File:** `docs/research/{date}-niche-scorecard-{niche-slug}.md`
- **Format:** Markdown (scorecard template filled)

## Output Example

```yaml
# Niche Scorecard Output Example (YAML summary)
niche: "best air purifiers"
market: US
primary_keyword: "best air purifier"
analysis_date: "2026-02-18"

scores:
  d1_commission_rate: 7   # Amazon 3%, but Winix direct 8%, Levoit 10%
  d2_search_demand: 8     # 90K/mo primary, strong long-tail cluster
  d3_competition_dr: 5    # Avg DR 58, NYT Wirecutter holds #1 but content is 2022
  d4_seasonality: 7       # Slight winter peak, broadly year-round
  d5_program_diversity: 6 # 8 programs across Amazon, Impact, ShareASale
  d6_epc_potential: 8     # EPC ~$1.20 reported, AOV ~$180

raw_total: 41
normalized_15: 11.4
verdict: GO

justification: |
  D2 (Search Demand) scores 8/9 with 90K monthly searches on primary keyword.
  D6 (EPC Potential) strong at ~$1.20 EPC and $180 AOV.
  D3 (Competition) moderate — Wirecutter holds #1 but content is stale (2022),
  real testing opportunity exists. D1 slightly weak due to Amazon's 3% cap;
  mitigate by prioritizing direct brand programs at 8-10%.
  Recommend GO with content strategy targeting "best air purifier under $200"
  cluster first to build authority before attacking head term.

risks:
  - Amazon commission rate cuts (historical precedent)
  - Wirecutter / NYT refresh could recapture positions
  - Seasonal spike in wildfire-season states may skew traffic data

next_step: "Run validate-program-stack.md (AFF_STR_002) for this niche"
```

---
*Squad: affiliates | Version: 1.0.0 | Created: 2026-02-18*
