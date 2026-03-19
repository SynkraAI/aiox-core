---
id: data-analysis
name: "Data Analysis & Interpretation"
whenToUse: |
  Creating agents that interpret metrics, extract insights, benchmark performance,
  or produce analytical reports.
  NOT for: data collection/research, content creation, strategic planning, quality review.
version: "1.0.0"
---

# Data Analysis & Interpretation — Best Practices

## Core Principles

1. **Insight over raw data.** Never present numbers without interpretation. Every metric, percentage, and data point must be accompanied by a plain-language business implication. Raw data is noise; interpreted data is intelligence. If you cannot explain what a number means for the business, do not include it in the report.

2. **Always contextualize.** No metric exists in a vacuum. Compare every data point against at least one of these baselines: previous period (week-over-week, month-over-month), industry benchmark for the relevant segment and size tier, internal target or OKR, or competitor performance. A number without context has no meaning.

3. **Confidence levels on every finding.** Tag every insight and recommendation with a confidence tier:
   - **High Confidence**: 3+ data sources agree, consistent trend across 3+ consecutive periods, large sample size.
   - **Medium Confidence**: 2 data sources agree, trend holds across 2 periods, or moderate sample size.
   - **Low Confidence**: Single source, single period, small sample size, or conflicting signals across sources.
   Never present a low-confidence finding with the same weight as a high-confidence one.

4. **Structured output format.** Every analysis report must follow the standard structure: Executive Summary, Metrics Table, Insights (with business implications), Recommendations (with priority, confidence, and effort), and Methodology Notes. Deviating from this structure makes reports harder to consume and compare across periods.

5. **Cross-reference data sources.** When multiple data sources report the same metric, compare their values. If they diverge by more than 10%, flag the discrepancy and explain which source you are using as the primary reference and why. Platform-native analytics (e.g., Instagram Insights, Google Analytics, LinkedIn Analytics) are preferred as primary sources; third-party tools serve as validation.

6. **Metric priority weighting.** Not all metrics are equal. Weight actionable metrics (engagement rate, conversion rate, click-through rate, cost per acquisition) above vanity metrics (impressions, follower count, page views). Report all metrics for completeness, but base recommendations primarily on high-weight metrics. When metrics conflict, the higher-weight metric takes precedence.

7. **Escalation for anomalies.** Flag any metric that moves more than 25% period-over-period as a critical anomaly requiring immediate attention. Flag any metric that exceeds its target by more than 50% for investigation — this may indicate a data error, a viral event, or a one-time external factor. Do not wait for the next scheduled report to surface critical anomalies; escalate them immediately.

8. **Methodology transparency.** State the time period, data sources, sample sizes, and any exclusions at the end of every report. The reader must be able to assess the reliability of your analysis without asking follow-up questions.

## Analysis Methodology

### Step 1 — Data Collection from Research Outputs

Receive and organize raw data from upstream research agents, platform exports, or user-provided datasets. Verify that the data covers the expected time period and contains the required metrics. Identify any gaps or missing data points and note them for the methodology section. Retrieve current industry benchmarks if not already provided.

### Step 2 — Pattern Identification

Scan all collected data for trends, anomalies, and correlations. Flag any metric that moved more than 15% from the previous period — positive or negative. Identify the top 3 and bottom 3 performing items (content pieces, channels, products, segments) by the primary KPI. Look for recurring patterns across multiple periods: is this a one-time spike or a sustained trend? Group related metrics to identify underlying drivers (e.g., reach increase + engagement decrease may indicate audience quality dilution).

### Step 3 — Benchmarking Against Baselines

Compare every key metric against three baselines:
- **Historical**: Previous period (7-day, 30-day, or equivalent cycle)
- **Industry**: Median performance for the relevant segment, category, and size tier
- **Internal**: Targets, OKRs, or forecasted values

Calculate the gap between actual performance and each baseline. Rank gaps by severity. Metrics that fall below all three baselines are flagged as critical. Metrics that exceed all three baselines are flagged for positive investigation (replicable pattern or anomaly?).

### Step 4 — Insight Synthesis

Translate identified patterns and benchmark gaps into plain-language insights. Every insight must follow this structure:
- **What happened**: The specific data movement or pattern
- **Why it matters**: The business implication ("This means...")
- **What it suggests**: The directional recommendation or hypothesis

Do not produce insights that merely restate numbers. An insight must add interpretive value beyond what the reader could see by scanning the table alone. Limit insights to 4-6 per report; more than that dilutes focus.

### Step 5 — Recommendation Formation

Generate 3-5 prioritized action items based on the synthesized insights. Each recommendation must include:
- **Action**: The specific thing to do, stated as a clear directive
- **Expected Impact**: What outcome the action should produce, quantified where possible
- **Confidence Level**: High, Medium, or Low, based on the supporting data
- **Implementation Effort**: Low (< 2 hours), Medium (2-8 hours), or High (8+ hours)
- **Priority**: High, Medium, or Low, determined by the intersection of impact and confidence

Recommendations with High impact + High confidence = High priority. Recommendations with High impact + Low confidence = Medium priority (needs more data). Recommendations with Low impact regardless of confidence = Low priority.

### Step 6 — Report Compilation

Assemble the final deliverable in the standard output structure. Verify completeness against the Quality Criteria checklist before submission. Ensure every metric table has consistent column counts, every insight has a business implication, every recommendation has all five required fields, and the executive summary can stand alone. Add the Methodology Notes section at the end with time period, data sources, sample sizes, and exclusions.

## Decision Criteria

| Signal | Classification | Response |
|--------|---------------|----------|
| Metric at or above 30-day average AND at or above industry median | **Good** | Continue current approach; optimize incrementally |
| Metric dropped 10-25% vs previous period OR below industry median | **Concerning** | Recommend strategy adjustment; monitor closely next period |
| Metric dropped more than 25% vs previous period OR below 25th percentile | **Critical** | Recommend immediate action; escalate to stakeholders |
| Metric exceeded target by more than 50% | **Investigate** | Verify data accuracy; if confirmed, analyze for replicable pattern |
| Conflicting signals across sources (>10% divergence) | **Uncertain** | Flag discrepancy; use primary source; assign Low confidence |

## Quality Criteria

Before submitting any analysis report, verify that it meets ALL of the following criteria:

- [ ] Every metric in every table has at least one comparison column (previous period, benchmark, or target)
- [ ] Every insight paragraph includes a business implication statement ("This means...", "The implication is...")
- [ ] Every recommendation includes all five required fields: action, expected impact, confidence level, effort estimate, and priority
- [ ] The executive summary contains exactly 3 bullet points and can be read independently without the full report
- [ ] All markdown tables render correctly with consistent column counts and proper alignment
- [ ] All percentages use consistent decimal precision (one decimal place throughout)
- [ ] Methodology section is present and includes time period, data sources, sample sizes, and exclusions
- [ ] No vague qualifiers appear anywhere in the report ("significant", "performing well", "pretty good", "not great")
- [ ] Confidence levels (High/Medium/Low) are assigned to every insight and every recommendation
- [ ] Anomalies (>25% movement) are explicitly flagged and classified as Critical
- [ ] No metric is presented as a raw number without narrative context
- [ ] Recommendations are ordered by priority (High first, then Medium, then Low)

## Output Examples

### Example 1: Content Performance Analysis

```
# Analysis: Weekly Content Performance — Feb 10-16, 2026

## Executive Summary

- **Engagement rate climbed 18% week-over-week to 4.6%**, surpassing the industry median
  of 3.5% for accounts in the 10K-50K follower tier. This is the highest weekly engagement
  rate recorded in the past 90 days, driven primarily by two educational carousel posts.
- **Website click-through rate declined 11% to 1.7%**, falling below the 30-day average
  of 1.9%. This means fewer audience members are transitioning from social engagement to
  site visits, suggesting a call-to-action effectiveness problem rather than a content
  quality problem.
- **Recommended action**: Increase carousel frequency from 2 to 4 per week (high confidence)
  and A/B test CTA placement in the first versus last slide to address the CTR gap.

## Metrics

| Metric | This Period | Last Period | Change | 30-Day Avg | Industry Median | Status |
|--------|-------------|-------------|--------|------------|-----------------|--------|
| Impressions | 52,400 | 48,100 | **+8.9%** | 49,200 | 42,000 | Good |
| Reach | 33,100 | 30,500 | +8.5% | 31,200 | 27,000 | Good |
| Engagement Rate | **4.6%** | 3.9% | **+17.9%** | 4.1% | 3.5% | Good |
| Click-Through Rate | 1.7% | 1.9% | **-10.5%** | 1.9% | 1.5% | Concerning |
| Saves | 1,240 | 980 | +26.5% | 1,050 | 850 | Good |
| Shares | 410 | 370 | +10.8% | 385 | 310 | Good |
| Follower Growth | +0.6% | +0.9% | -33.3% | +0.8% | +0.5% | Concerning |
| Posts Published | 8 | 7 | +14.3% | 7 | 5 | Good |

### Top Performing Content

| Post | Format | Eng. Rate | Reach | Saves |
|------|--------|-----------|-------|-------|
| "5 Data Myths That Cost You Revenue" | Carousel | 8.2% | 7,800 | 340 |
| "How to Read a Dashboard in 60 Seconds" | Carousel | 6.7% | 6,200 | 285 |
| "Monday Metric: CAC vs LTV Explained" | Static | 4.1% | 4,500 | 120 |

### Lowest Performing Content

| Post | Format | Eng. Rate | Reach | Saves |
|------|--------|-----------|-------|-------|
| "Industry News Weekly Digest" | Reel | 1.6% | 2,300 | 22 |
| "Tool Spotlight: Spreadsheet Add-ons" | Static | 2.0% | 2,900 | 45 |

## Insights

1. **Educational carousels are the dominant content format by a wide margin.** The two
   carousel posts this week averaged a 7.45% engagement rate — 1.8x the account average
   of 4.1% and 2.1x the industry median of 3.5%. This pattern has persisted for 5
   consecutive weeks with no single-week deviation greater than 0.4 percentage points.
   This means carousel content is the most reliable driver of audience interaction for
   this account. The implication is that production resources should be reallocated toward
   carousel creation, even at the expense of other formats. (High confidence — 5 periods,
   consistent pattern, corroborated by save rate data.)

2. **Click-through rate is diverging from engagement rate.** Engagement rose 18% while CTR
   fell 11% — a divergence that has widened over the past 3 weeks. This means the audience
   is consuming and interacting with content on-platform but is not compelled to visit the
   website. The implication is that our call-to-action strategy needs revision: the content
   is strong enough to generate engagement, but the CTA is either poorly placed, poorly
   worded, or absent from high-performing posts. Reviewing the top 3 posts, none included
   a CTA in the first slide — all CTAs appeared in the final slide, which carousel analytics
   show only 38% of viewers reach. (Medium confidence — 3-week pattern, single platform.)

3. **Follower growth is decelerating despite rising engagement.** Growth dropped from +0.9%
   to +0.6% this week — the third consecutive weekly decline. While still above the industry
   median of +0.5%, the trajectory suggests the account is approaching a growth plateau
   within its current audience pool. This means organic discovery alone may not sustain
   growth targets. The implication is that partnership content, collaborations, or paid
   amplification may be needed to reach new audience segments. (Medium confidence — 3-period
   trend, but could also be seasonal.)

4. **Reels continue to underperform for this account.** The single Reel published this week
   had the lowest engagement rate (1.6%) and the lowest save rate of any format. Across the
   past 30 days, Reels have averaged 1.9% engagement versus 6.8% for carousels and 3.4% for
   static posts. This means the current Reel content strategy is not resonating with this
   account's audience. The implication is that Reel production effort should be paused until
   a content audit identifies whether the issue is format, topic, or execution. (High
   confidence — 30-day data, consistent underperformance across 8 Reels.)

## Recommendations

1. **Increase carousel production to 4 per week** — Priority: High | Confidence: High |
   Effort: Medium. Five weeks of consistent data show carousels outperforming every other
   format by at least 1.8x on engagement rate. Reallocate the Reel production slot and one
   static post slot to carousels. Expected impact: engagement rate increase of 10-15% based
   on format mix shift.

2. **A/B test CTA placement: first slide vs. last slide** — Priority: High | Confidence:
   Medium | Effort: Low. The engagement-CTR divergence suggests users are not seeing the CTA.
   Run a 2-week test placing the CTA on the first slide of half the carousels. Expected
   impact: CTR improvement of 15-25% if placement is the primary driver.

3. **Pause Reel production and conduct a content audit** — Priority: Medium | Confidence:
   High | Effort: Low. Thirty days of data confirm Reels consistently underperform. Before
   investing further, audit the 8 Reels from the past month for common failure patterns
   (topic, length, hook quality, posting time). Expected impact: saves wasted production
   hours until the format is validated or abandoned.

4. **Test one collaboration post to address follower growth decline** — Priority: Medium |
   Confidence: Medium | Effort: High. Slowing growth suggests audience saturation within
   current reach. A co-created post with a complementary account could expose the brand to
   a new audience segment. Expected impact: temporary growth spike of 0.3-0.5% in the
   collaboration week, based on historical benchmarks for accounts in this tier.

## Methodology

- **Period**: February 10-16, 2026 (7 days)
- **Data Sources**: Platform-native analytics (primary), third-party social analytics tool (validation)
- **Benchmarks**: Industry medians sourced from 2025 Social Media Benchmark Report for B2B accounts, 10K-50K follower tier
- **Exclusions**: Sponsored/boosted posts excluded from organic performance metrics
```

### Example 2: Competitive Landscape Analysis

```
# Analysis: Competitive Landscape — Email Marketing SaaS — Q4 2025

## Executive Summary

- **Competitor A leads on deliverability rate (98.2%) but trails on automation features**,
  ranking 4th out of 6 competitors on workflow complexity score. This means they win on
  reliability but lose on power-user capability — an exploitable gap for our positioning.
- **The market average price per subscriber increased 12% year-over-year**, with 4 of 6
  competitors raising prices in Q4. This means the market is shifting toward premium
  positioning, creating an opening for a value-tier narrative.
- **Three high-potential content angles identified** for thought leadership positioning,
  each targeting a different segment of the buyer journey.

## Competitive Metrics Comparison

| Metric | Our Product | Comp. A | Comp. B | Comp. C | Comp. D | Market Avg |
|--------|-------------|---------|---------|---------|---------|------------|
| Deliverability Rate | 96.8% | **98.2%** | 95.4% | 97.1% | 94.3% | 96.4% |
| Avg. Open Rate (Users) | 24.1% | 22.8% | 25.3% | 23.5% | 21.7% | 23.5% |
| Automation Workflows | **42** | 18 | 35 | 28 | 22 | 29 |
| Price / 10K Subscribers | $79/mo | $89/mo | $99/mo | $69/mo | $59/mo | $79/mo |
| Free Tier Limit | 1,000 | 500 | 2,000 | 300 | 1,500 | 1,060 |
| G2 Rating (out of 5) | 4.4 | **4.7** | 4.3 | 4.1 | 4.2 | 4.3 |
| Support Response Time | 2.1 hrs | 1.4 hrs | 4.8 hrs | 3.2 hrs | 6.1 hrs | 3.5 hrs |
| YoY Price Change | 0% | +15% | +18% | +8% | +5% | +12% |

## Insights

1. **Our automation capability is the strongest in the competitive set, but we are not
   known for it.** With 42 pre-built automation workflows — 45% above the market average
   of 29 and 2.3x Competitor A's 18 — our product has the most robust automation offering.
   However, brand awareness surveys show only 22% of prospects associate our product with
   "advanced automation." This means we have a perception gap: the product capability exists,
   but the market narrative does not reflect it. The implication is that content strategy
   should aggressively position our automation depth as a primary differentiator over the
   next quarter. (High confidence — verified product data, corroborated by G2 feature
   comparison and brand survey.)

2. **Competitor A is vulnerable on automation despite leading on brand perception.** They
   hold the highest G2 rating (4.7) and the best deliverability (98.2%), but their automation
   offering (18 workflows) is the weakest in the set — 38% below market average. This means
   their users likely hit a ceiling when their email programs mature beyond basic campaigns.
   The implication is that we should target Competitor A's mid-market customers who have
   outgrown basic automation with comparison content and migration incentives. (High
   confidence — product data verified, supported by 12 G2 reviews mentioning automation
   limitations.)

3. **The market is repricing upward, creating a value positioning window.** Four of six
   competitors raised prices in Q4, with an average year-over-year increase of 12%.
   Our price remained flat at $79/month for 10K subscribers — exactly at the market average.
   This means our relative value proposition has improved without any action on our part.
   The implication is that this is the optimal moment to publish price comparison content
   and emphasize feature-per-dollar metrics, especially targeting prospects of Competitor B
   ($99/mo, +18% YoY increase) who may be evaluating alternatives. (High confidence —
   pricing data publicly available and verified.)

4. **Deliverability rate is our one metric trailing the top competitor.** At 96.8%, we are
   above market average (96.4%) but 1.4 percentage points behind Competitor A's 98.2%.
   While the absolute gap is small, deliverability is a high-salience metric for email
   marketers — it is often the first filter in vendor evaluation. This means we should not
   lead positioning on deliverability but should ensure it is addressed proactively in sales
   materials to neutralize it as a disqualifier. (Medium confidence — the gap is narrow and
   could close with infrastructure improvements already in the Q1 roadmap.)

## Content Angles Generated

### Angle 1: "The Automation Gap Nobody Talks About"

- **Angle Type**: Contrarian
- **Primary Emotion**: Surprise, outrage
- **Angle Statement**: The market's highest-rated email tools have the weakest automation — and nobody is calling it out.
- **Recommended Hook Formulas**: Contrarian ("Everyone recommends X for email, but look at the automation numbers"), Secret ("The feature gap your email provider doesn't want you to notice")
- **Suggested Persuasion Framework**: PAS (Problem: your campaigns are limited; Agitation: you are paying premium for basic automation; Solution: there is a tool with 2.3x more workflows at a lower price)
- **Viral Rationale**: Challenges established brand hierarchy with verifiable data; contrarian takes on popular tools generate high engagement from both supporters and detractors
- **Target Platforms**: LinkedIn (thought leadership), X/Twitter (debate potential), Blog (SEO for "[Competitor A] alternatives")

### Angle 2: "The Great Email Repricing of 2025"

- **Angle Type**: Fear/Urgency
- **Primary Emotion**: Fear of loss, FOMO
- **Angle Statement**: Email marketing costs rose 12% in one year — and most teams did not budget for it.
- **Recommended Hook Formulas**: Statistic ("Email tool prices are up 12% YoY — here is what that means for your budget"), Warning ("If your email costs went up this year, you are not alone — and it is going to get worse")
- **Suggested Persuasion Framework**: AIDA (Attention: price increase data; Interest: breakdown by competitor; Desire: show the value alternative; Action: switch before next renewal)
- **Viral Rationale**: Price sensitivity content performs well in economic uncertainty; provides shareable data point that budget holders will forward internally
- **Target Platforms**: LinkedIn (budget decision-makers), Newsletter (existing audience activation), Blog (SEO for "email marketing pricing 2026")

### Angle 3: "What 10,000 Email Campaigns Taught Us About Open Rates"

- **Angle Type**: Educational
- **Primary Emotion**: Curiosity, empowerment
- **Angle Statement**: Our platform data reveals the real drivers of open rate — and it is not subject lines.
- **Recommended Hook Formulas**: Statistic ("We analyzed 10,000 campaigns. Subject line optimization accounts for only 11% of open rate variance"), Question ("What actually drives email open rates? We have the data — and the answer is not what you think")
- **Suggested Persuasion Framework**: Star-Story-Solution (Star: the universal struggle with open rates; Story: our data analysis journey and surprising findings; Solution: the factors that actually move the needle)
- **Viral Rationale**: Challenges widely-held belief (subject lines = open rates) with proprietary data; educational content with a contrarian twist generates high save and share rates
- **Target Platforms**: Blog (SEO authority), LinkedIn (professional insight), Newsletter (value delivery)

## Recommendations

1. **Launch an automation comparison campaign targeting Competitor A users** — Priority: High |
   Confidence: High | Effort: Medium. Produce a detailed feature comparison landing page and
   3-part blog series highlighting the 42 vs 18 workflow gap. Expected impact: capture 2-5%
   of Competitor A's mid-market accounts in evaluation cycles over the next quarter.

2. **Publish a pricing transparency report using Q4 data** — Priority: High | Confidence: High |
   Effort: Low. The 12% market price increase is a verifiable, timely data point that positions
   our flat pricing as a strategic advantage. Expected impact: 3x average blog engagement based
   on historical performance of pricing content.

3. **Develop a deliverability improvement roadmap** — Priority: Medium | Confidence: Medium |
   Effort: High. Closing the 1.4 percentage point gap with Competitor A removes their strongest
   differentiator. Coordinate with engineering on the Q1 infrastructure improvements already
   scoped. Expected impact: neutralize deliverability as a competitive vulnerability within 2
   quarters.

4. **Commission a proprietary open rate study** — Priority: Medium | Confidence: Medium |
   Effort: High. Angle 3 requires aggregated platform data. If the data supports a contrarian
   finding (subject lines are not the primary driver), the resulting content has high viral
   potential. Expected impact: thought leadership positioning and SEO authority for
   "email open rates" keyword cluster.

## Methodology

- **Period**: Q4 2025 (October 1 - December 31, 2025)
- **Data Sources**: Competitor pricing pages (verified December 2025), G2 product profiles and review data, proprietary platform analytics for internal metrics, industry benchmark reports from Litmus and Mailchimp annual surveys
- **Competitors Included**: 4 direct competitors in the SMB/mid-market email marketing segment, selected by market share overlap
- **Exclusions**: Enterprise-tier pricing and features excluded; comparison based on mid-market plans (5K-50K subscriber tier)
- **Limitations**: Competitor deliverability rates sourced from published claims and third-party tests; actual rates may vary by sender reputation and list quality
```

## Anti-Patterns

### Never Do

1. **Never present data without business implication.** Raw numbers without context are noise, not analysis. Every metric must answer "so what does this mean for the business?" A table of numbers without narrative is a spreadsheet, not an analysis.

2. **Never make recommendations without supporting data.** Every recommendation must cite the specific metrics, trends, or benchmarks that justify it. Intuition and gut feelings are not analysis. If you cannot point to the data, you cannot make the recommendation.

3. **Never report a single period in isolation.** Always show comparison — versus previous period, versus benchmark, versus target. A number without a reference point has no meaning. The reader cannot assess "45,000 impressions" without knowing whether that is up, down, or flat.

4. **Never use vague qualifiers.** Replace "significant increase" with "up 23% week-over-week." Replace "performing well" with "above the 75th percentile industry benchmark." Replace "pretty strong results" with "engagement rate of 4.6%, exceeding our 4.0% target by 15%." Precision is the analyst's currency.

5. **Never ignore outliers without investigation.** An anomalous data point may indicate a data error, a viral event, a seasonal effect, or a genuine shift. Document what you found when you investigated, even if the answer is "no identifiable cause." Silently excluding outliers destroys analytical credibility.

6. **Never present correlation as causation.** "Posting time correlates with higher engagement" is acceptable. "Posting at 9 AM causes higher engagement" is not — unless supported by controlled experiment data. Use "correlates with," "coincided with," or "was accompanied by" instead of "caused," "led to," or "resulted in."

7. **Never delay reporting a critical anomaly.** If a metric drops more than 25% period-over-period or breaches a critical threshold, escalate immediately. Do not wait until the next scheduled report. Critical anomalies have a time-sensitive impact that diminishes with delayed response.

### Always Do

1. **Always include a comparison point for every metric.** No exceptions. If the benchmark is unavailable, compare against the previous period. If the previous period is unavailable, state that no comparison is available and assign Low confidence to any insight derived from that metric.

2. **Always end insights with "this means..." or equivalent.** The business implication is the most valuable part of the insight. Without it, you are reporting data, not analyzing it. Train the reader to expect the implication after every finding.

3. **Always tag confidence levels on recommendations.** The decision-maker needs to know whether a recommendation is backed by 6 months of consistent data or a single data point from last Tuesday. Confidence levels enable proportionate action.

4. **Always include methodology transparency.** State the time period, data sources, sample sizes, and any exclusions at the end of every report. This allows the reader to independently assess the reliability of your findings and reproduces the analysis if needed.

5. **Always prioritize recommendations.** Never present a flat list of equal-weight suggestions. Rank them by the intersection of expected impact and confidence level. The decision-maker's time and resources are finite; your prioritization respects that constraint.

## Vocabulary Guidance

### Use

- **Precise metric names**: "engagement rate" not "engagement"; "click-through rate" not "clicks"; "cost per acquisition" not "cost"; "month-over-month growth rate" not "growth"
- **Business implication language**: "This means...", "The implication is...", "This suggests we should...", "The business impact is...", "For the bottom line, this translates to..."
- **Confidence qualifiers**: "With high confidence, we recommend...", "Early signals suggest...", "Insufficient data to confirm, but initial indicators point to...", "This finding is corroborated by three independent data sources..."
- **Directional trend language**: "up 12% week-over-week", "declining for 3 consecutive periods", "flat compared to the 30-day benchmark", "rebounding after a 2-week dip"
- **Comparison framing**: "versus the industry median of...", "compared to the previous period's...", "against our internal target of...", "relative to competitor average of..."
- **Quantified impact language**: "This represents an additional 340 website visits per week", "At the current trajectory, this would result in a 15% shortfall against Q1 targets", "Scaling this pattern across all channels could yield an estimated 22% increase in qualified leads"

### Avoid

- **Vague qualifiers**: "significant", "performing well", "not great", "pretty good", "somewhat", "fairly strong"
- **Raw numbers without context**: never state "We had 45,000 impressions" without adding comparison and implication
- **Correlation as causation**: never state "X caused Y" unless there is controlled evidence; instead use "X correlates with Y" or "X coincided with Y"
- **"Interesting" without specifics**: never say "This is an interesting finding" — instead state what specifically makes it notable and what it implies
- **Hedging without substance**: never use "It seems like" or "It appears that" without following with specific data points that support the observation
- **Superlatives without evidence**: never use "best ever", "worst performance", "unprecedented" without the specific historical data to back the claim
