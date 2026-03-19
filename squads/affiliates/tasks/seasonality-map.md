# seasonality-map

## Metadata
```yaml
task_id: AFF_STR_004
agent: affiliate-strategist
type: analysis
complexity: medium
estimated_time: "1h-2h"
source: "Google Trends 5-Year Analysis + Affiliate Content Calendar Methodology"
```

## Purpose
Map the full seasonal demand curve for a niche using 5 years of Google Trends data, identifying revenue peaks, low-traffic valleys, and planning windows — enabling proactive content scheduling and cash flow forecasting rather than reactive publishing.

## Prerequisites
- Niche and primary keyword confirmed
- Niche scorecard (AFF_STR_001) completed (D4 Seasonality score available as baseline)
- Access to Google Trends (trends.google.com) — free tool, no account required
- Access to Ahrefs or Semrush for monthly keyword volume breakdown (optional but recommended)
- 12 months of site traffic data if the site already exists (optional)

## Steps

1. **Pull 5-year Google Trends data** — Go to Google Trends, set range to "Past 5 years", geography to target market.
   - Search primary keyword
   - Export CSV data (Download button, top right)
   - Search 3-5 related keywords and add to comparison view
   - Screenshot the trend graph for visual reference in the report

2. **Identify peak months** — Analyze the CSV export.
   - Find the 3 highest-indexed months across the 5-year window (100 = peak)
   - Determine if peaks are consistent year-over-year or anomalous
   - Note which specific calendar months reliably peak (e.g., "November–January consistently high")

3. **Identify valley months** — Find the 3 lowest-indexed periods.
   - Determine floor level (e.g., "June–August consistently at 40-55 index")
   - Calculate peak-to-valley ratio: peak_index / valley_index
   - Classify seasonality severity (see Framework below)

4. **Cross-reference with keyword tool** — Validate Trends data against Ahrefs/Semrush monthly volume breakdown.
   - Pull month-by-month search volume for primary keyword (12 months)
   - Compare against Trends curve to confirm pattern consistency

5. **Map secondary keyword seasonality** — Check 2-3 major cluster keywords.
   - Some supporting keywords may have inverse or different seasonal patterns
   - Identify any counter-seasonal opportunity keywords

6. **Define planning windows** — Calculate content lead times.
   - Pre-peak window: 90 days before peak starts (content must be indexed by then)
   - Optimization window: 60 days before peak (refresh existing content)
   - Monetization window: 30 days before peak (increase CTAs, test offers)
   - Valley window: low-traffic period ideal for publishing new experimental content

7. **Build seasonal content calendar** — Map content publishing plan to seasonality.
   - Assign high-value commercial content to pre-peak windows
   - Assign informational / experimental content to valley periods
   - Schedule annual content refreshes for top pages before each peak

8. **Assess revenue predictability score** — Summarize cashflow implications.
   - Low severity: revenue fairly consistent year-round
   - Medium severity: revenue drops 40-60% in off-season; plan cash reserves for 3-4 months
   - High severity: revenue drops >60% in off-season; consider niche diversification

9. **Document and save seasonality map** — Write final report with all charts, data tables, and planning calendar.

## Framework / Inline Structure

### Seasonality Severity Classification

| Class | Peak-to-Valley Ratio | Revenue Impact | Recommendation |
|-------|---------------------|----------------|----------------|
| STABLE | < 1.5x | Negligible | No special planning needed |
| MILD | 1.5x – 2.5x | 30-50% drop possible | Build 2-month cash buffer |
| MODERATE | 2.5x – 4x | 50-70% drop possible | Counter-seasonal content + 3-month buffer |
| SEVERE | > 4x | >70% drop possible | Niche diversification strongly recommended |

### Planning Window Calendar Template

```
NICHE: {niche_name}
PEAK SEASON: {month_start} – {month_end}
VALLEY SEASON: {month_start} – {month_end}

CONTENT CALENDAR:
  Q1 ({months}): {publish_type} — {rationale}
  Q2 ({months}): {publish_type} — {rationale}
  Q3 ({months}): {publish_type} — {rationale}
  Q4 ({months}): {publish_type} — {rationale}

CRITICAL DATES:
  Pre-peak content deadline: {date} (90 days before peak)
  Content refresh deadline: {date} (60 days before peak)
  CTA optimization deadline: {date} (30 days before peak)
  Annual content audit: {date} (during valley)
```

### 5-Year Pattern Analysis Table

| Year | Peak Month | Peak Index | Valley Month | Valley Index | Ratio | Notes |
|------|-----------|-----------|--------------|-------------|-------|-------|
| 2021 | {month} | {idx} | {month} | {idx} | {ratio} | {notes} |
| 2022 | {month} | {idx} | {month} | {idx} | {ratio} | {notes} |
| 2023 | {month} | {idx} | {month} | {idx} | {ratio} | {notes} |
| 2024 | {month} | {idx} | {month} | {idx} | {ratio} | {notes} |
| 2025 | {month} | {idx} | {month} | {idx} | {ratio} | {notes} |

### Revenue Forecasting Adjustment Factors

```
monthly_revenue_estimate = baseline_revenue × seasonal_index_factor

seasonal_index_factor by month:
  Jan: {factor}  Feb: {factor}  Mar: {factor}
  Apr: {factor}  May: {factor}  Jun: {factor}
  Jul: {factor}  Aug: {factor}  Sep: {factor}
  Oct: {factor}  Nov: {factor}  Dec: {factor}
```

## Veto Conditions

- **HARD VETO:** Peak-to-valley ratio > 6x AND peak lasts only 4-6 weeks per year — niche is too risky for a single-niche site; return recommendation to diversify or pivot
- **SOFT VETO:** No consistent pattern across 5 years (high year-to-year volatility) — document as UNPREDICTABLE, require operator sign-off before proceeding

## Output

- **File:** `docs/research/{date}-seasonality-map-{niche-slug}.md`
- **Format:** Markdown

## Output Example

```yaml
# Seasonality Map — Example Output (YAML summary)
niche: "best air purifiers"
primary_keyword: "best air purifier"
market: US
analysis_date: "2026-02-18"
data_source: "Google Trends 5-year export + Ahrefs monthly volume"

seasonality_class: MILD
peak_to_valley_ratio: 2.1

peak_months: ["October", "November", "December", "January"]
valley_months: ["June", "July", "August"]

peak_index: 100   # October average across 5 years
valley_index: 48  # July average across 5 years

5_year_consistency: HIGH  # Pattern consistent all 5 years

revenue_cashflow_note: |
  Expect ~52% revenue drop during June-August vs peak season.
  Maintain 3-month operating cash reserve.
  Counter-seasonal content: "air purifier for wildfire smoke" — spikes
  irregularly in summer when wildfires occur (2020, 2021, 2023 anomalies).

planning_calendar:
  pre_peak_content_deadline: "2026-07-01"  # 90 days before Oct peak
  content_refresh_deadline: "2026-08-01"
  cta_optimization_deadline: "2026-09-01"
  annual_content_audit: "2026-07-01"  # During valley

content_schedule:
  Q1_JanMar: "Monetize peak traffic, update reviews for new product launches"
  Q2_AprJun: "Publish informational cluster articles, build internal links"
  Q3_JulSep: "New commercial content must be LIVE by Aug 31 to index in time"
  Q4_OctDec: "Peak season — maximize CTAs, test offers, monitor rankings daily"

next_step: "Integrate seasonality data into content-plan.md (AFF_SEO_002)"
```

---
*Squad: affiliates | Version: 1.0.0 | Created: 2026-02-18*
