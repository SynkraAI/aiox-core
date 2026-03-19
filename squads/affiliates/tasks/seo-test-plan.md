# seo-test-plan

## Metadata
```yaml
task_id: AFF_SEO_007
agent: seo-affiliate
type: creation
complexity: medium
estimated_time: "1h-2h"
source: "SEO A/B Testing Methodology — Matt Diggity (Diggity Marketing) + Kyle Roof (PageOptimizer Pro)"
```

## Purpose
Design a rigorous SEO A/B test for a specific on-page hypothesis, defining control, variation, measurement period, success criteria, and statistical significance requirements — so ranking changes can be attributed to the tested variable rather than algorithm noise.

## Prerequisites
- Site has minimum 10 pages in similar ranking positions (needed for split-testing validity)
- Hypothesis defined: specific on-page element to test (title tag, H1, internal links, schema, etc.)
- Access to Google Search Console (impression and ranking data)
- Access to SEO testing tool: SEOTesting.com (recommended) or manual tracking
- Baseline ranking data for test pages (minimum 4 weeks of pre-test data)
- Site must be stable (no major algorithm updates in past 2 weeks)

## Steps

1. **Define the hypothesis** — State exactly what you expect and why.
   - Format: "If we change {element} from {current_state} to {new_state}, then {ranking/CTR metric} will improve by {amount} because {reasoning}"
   - Hypothesis must be falsifiable
   - Only one variable per test (never test two changes simultaneously)

2. **Select test and control pages** — Choose pages for the test split.
   - Test pages: pages where the change will be implemented
   - Control pages: similar pages where no change is made (baseline comparison)
   - Match criteria: same content type, similar word count, similar current ranking, similar topic
   - Minimum: 5 test pages + 5 control pages (10 total recommended for statistical power)
   - Exclude: very new pages (<90 days indexed), pages with recent manual changes

3. **Establish baseline metrics** — Record pre-test state for all pages.
   - Average position in GSC (past 28 days)
   - Impressions per page (past 28 days)
   - CTR per page (past 28 days)
   - Click count per page (past 28 days)

4. **Implement the change on test pages only** — Apply the variation to test group.
   - Do NOT change control pages
   - Document exactly what was changed, on which pages, on which date
   - Use identical change across all test pages (consistency is critical)
   - Record the exact timestamp of each change

5. **Run the test period** — Allow sufficient time for Google to re-crawl and re-rank.
   - Minimum test period: 14 days
   - Recommended: 21-28 days (allows for crawl lag and ranking stabilization)
   - Do not make any other changes to test or control pages during the test period
   - Monitor daily for anomalies (algorithm updates, site-wide issues)

6. **Collect results** — Export data at test end.
   - GSC data for test period: position, impressions, CTR, clicks
   - Compare test group vs control group: delta in position and CTR
   - Calculate statistical significance (see Framework)

7. **Evaluate significance** — Determine if results are meaningful.
   - Apply chi-squared test (for CTR) or t-test (for position change)
   - Target significance: p < 0.05 (95% confidence)
   - If significance not reached: extend test period or increase page count

8. **Make deployment decision** — Based on results, determine action.
   - DEPLOY: Positive result with >= 95% significance → apply change to all similar pages
   - EXTEND: Inconclusive result (p 0.05-0.10) → extend test by 14 days
   - REVERT: Negative result with significance → revert test pages to control state
   - NULL: No meaningful change detected → document, move to next hypothesis

9. **Document test and results** — Write full test report for future reference and pattern building.

## Framework / Inline Structure

### Hypothesis Template

```
HYPOTHESIS: AFF-TEST-{NNN}

If we [change element]:
  FROM: "{current_state}"
  TO:   "{new_state}"

On: [test page type]

Then: [metric] will [improve/increase] by [expected amount]

Because: [reasoning based on SEO principle or prior research]

Test type: [Title tag | H1 | Meta description | Schema | Internal links | Content length | CTA placement]
```

### Test Design Template

```
TEST ID: AFF-TEST-{NNN}
Hypothesis: {hypothesis_summary}
Start Date: {date}
End Date:   {date} (minimum +14 days, recommended +28 days)

TEST PAGES ({n}):
  {url_1} — current position {pos}
  {url_2} — current position {pos}
  ...

CONTROL PAGES ({n}):
  {url_1} — current position {pos}
  {url_2} — current position {pos}
  ...

CHANGE APPLIED:
  Element: {element_type}
  Before:  {exact_before_state}
  After:   {exact_after_state}
  Applied: {date_time}

SUCCESS CRITERIA:
  Primary metric: Average position improvement >= {X} positions
  Secondary metric: CTR improvement >= {Y}%
  Significance: p < 0.05

MONITORING PLAN:
  Daily check: GSC position tracker
  Alert triggers: >5 position swing on any test page (possible algo event)
```

### Statistical Significance Guide

```
POSITION CHANGE (use mean comparison):
  Δ Position Test Group:    {avg_position_before} → {avg_position_after}
  Δ Position Control Group: {avg_position_before} → {avg_position_after}
  Net effect:               {test_delta - control_delta} positions

  Interpretation:
    Net improvement > 2 positions AND control stable → promising
    Net improvement > 2 positions AND significance p < 0.05 → DEPLOY
    Net improvement < 1 position → likely noise

CTR CHANGE (use chi-squared):
  Test group clicks/impressions vs Control group clicks/impressions
  Chi-squared result: p = {value}
  p < 0.05 = statistically significant

MINIMUM SAMPLE SIZES:
  For position tests: 10 pages per group preferred (5 minimum)
  For CTR tests: 500+ impressions per page during test period
```

### Matt Diggity Test Priority Queue

```
Priority order for SEO tests (highest ROI first):
  1. Title tag optimization (click-through rate + keyword signal)
  2. H1 tag optimization (keyword prominence)
  3. On-page keyword usage (TF-IDF optimization)
  4. Schema markup addition (rich results → CTR)
  5. Internal linking to page (authority flow)
  6. Content length optimization (match SERP intent)
  7. E-E-A-T signal addition (author bio, credentials)
  8. Image optimization (alt text, file name)
  9. CTA placement (conversion, indirect ranking signal via engagement)
  10. Meta description (CTR — no direct ranking effect)
```

### Test Decision Matrix

```
RESULT → SIGNIFICANCE → DECISION

Positive > 2 pos  + p < 0.05    → DEPLOY to all similar pages immediately
Positive 1-2 pos  + p < 0.05    → DEPLOY cautiously, monitor
Positive any      + p 0.05-0.10 → EXTEND test 14 more days
No change (<1 pos) + any        → NULL result, move to next hypothesis
Negative > 1 pos  + p < 0.05    → REVERT immediately, document failure
```

## Veto Conditions

- **HARD VETO:** Active Google broad core algorithm update in progress (check https://status.search.google.com) — do not start or evaluate any test during a confirmed update; wait 2 weeks post-update for ranking stabilization
- **HARD VETO:** Site experienced a traffic spike or drop of >20% in the 2 weeks before test start — baseline is polluted; delay test start until traffic normalizes
- **SOFT VETO:** Fewer than 10 comparable pages available for split — test will have insufficient statistical power; proceed only with operator acknowledgment that results will be directional, not conclusive

## Output

- **File:** `docs/seo/tests/{date}-seo-test-AFF-TEST-{NNN}.md`
- **Format:** Markdown

## Output Example

```yaml
# SEO Test Plan — Example Output (YAML summary)
test_id: "AFF-TEST-001"
hypothesis: |
  If we add the current year (2026) to title tags FROM
  "Best Air Purifier Reviews" TO "Best Air Purifiers 2026 — Tested & Ranked"
  on best-of roundup pages, then CTR will improve by >= 8% because
  year-qualified titles signal freshness and typically outperform non-dated titles in GSC studies.

test_design:
  start_date: "2026-02-20"
  end_date: "2026-03-20"  # 28 days
  test_pages: 6
  control_pages: 6
  element: "Title tag"
  significance_target: "p < 0.05"

baseline_metrics:
  test_group_avg_position: 8.4
  test_group_avg_ctr: "2.1%"
  control_group_avg_position: 8.6
  control_group_avg_ctr: "2.0%"

success_criteria:
  primary: "Net position improvement >= 1.5 positions (test vs control delta)"
  secondary: "CTR improvement >= 5% in test group"

result_after_28_days:
  test_group_avg_position: 6.2   # -2.2 positions
  control_group_avg_position: 8.5  # -0.1 (baseline stable)
  net_improvement: 2.1  # positions
  ctr_change: "+12% in test group vs +1% control"
  significance: "p = 0.031"  # < 0.05 — statistically significant

decision: DEPLOY
action: "Apply year-qualified title tags to all 34 best-of roundup pages"
next_test: "AFF-TEST-002: H1 tag keyword prominence test"
```

---
*Squad: affiliates | Version: 1.0.0 | Created: 2026-02-18*
