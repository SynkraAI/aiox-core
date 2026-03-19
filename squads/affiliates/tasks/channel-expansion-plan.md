# channel-expansion-plan

## Metadata
```yaml
task_id: AFF_STR_005
agent: growth-optimizer + affiliate-strategist
type: creation
complexity: medium
estimated_time: "2h-3h"
source: "ICE Scoring Framework (Impact × Confidence × Ease) + Sean Ellis Growth Playbook"
```

## Purpose
Identify, evaluate, and prioritize new traffic channels beyond the current primary channel using ICE scoring, producing an ordered expansion roadmap so growth resources are allocated to the highest-leverage opportunities first.

## Prerequisites
- Site exists with at least one active primary traffic channel (typically SEO)
- Niche scorecard (AFF_STR_001) completed — confirms niche viability
- Competitor intelligence (AFF_STR_003) completed — reveals competitor channel mix
- At least 3 months of existing traffic/revenue data (for baseline comparison)
- Operator-defined available capacity for expansion (hours/week or budget/month)

## Steps

1. **Baseline current channel performance** — Document existing channel metrics.
   - Primary channel: monthly sessions, revenue attribution, cost basis
   - Any secondary channels already active: same metrics
   - Calculate current channel dependency ratio (% revenue from primary channel)

2. **Generate channel candidate list** — Enumerate all potential traffic channels relevant to the niche.
   - SEO (current or additional keyword clusters)
   - Organic social (YouTube, TikTok, Instagram, Pinterest, X/Twitter, LinkedIn)
   - Email marketing (newsletter, drip sequences)
   - Paid traffic (Google Ads, Meta Ads, Pinterest Ads)
   - Partnerships and co-marketing
   - Community and forums (Reddit, niche forums, Facebook Groups)
   - Influencer and creator collaborations
   - Podcast appearances or sponsorships
   - Comparison and deal sites (SlickDeals, RetailMeNot, etc.)

3. **Score each channel with ICE** — Apply ICE scoring to every candidate.
   - Impact: Revenue upside potential (1-10)
   - Confidence: Likelihood of success given niche + team (1-10)
   - Ease: Speed and cost to implement (1-10)
   - ICE Score = (Impact + Confidence + Ease) / 3

4. **Apply niche fit filter** — Eliminate channels with structural mismatch.
   - Check if competitor intelligence confirms channel is used in the niche
   - Consider audience demographics and where they consume content
   - Eliminate channels requiring capabilities the squad doesn't have (flag as FUTURE)

5. **Tier surviving channels** — Group by ICE score ranges.
   - Tier 1 (Quick Wins): ICE >= 7.0
   - Tier 2 (Strategic Bets): ICE 5.0-6.9
   - Tier 3 (Long-term Options): ICE < 5.0

6. **Estimate resource requirements per channel** — For each Tier 1 and 2 channel.
   - Time to launch (weeks)
   - Ongoing time commitment (hours/week)
   - Budget required (monthly)
   - Prerequisite skills or tools

7. **Design phased expansion roadmap** — Sequence channel launches over 12 months.
   - Phase 1 (0-3 months): Top 2 Tier 1 channels
   - Phase 2 (3-6 months): Next Tier 1 + top Tier 2
   - Phase 3 (6-12 months): Remaining high-value channels

8. **Define success metrics per channel** — Set measurable 90-day KPIs for each activated channel.

9. **Document expansion plan** — Write final report with ICE scores, roadmap, and resource plan.

## Framework / Inline Structure

### ICE Scoring Guide

#### Impact (1-10): Revenue upside over 12 months if channel succeeds

| Score | Definition |
|-------|-----------|
| 9-10 | Could double total revenue within 12 months |
| 7-8 | Could add 50-100% revenue within 12 months |
| 5-6 | Could add 20-50% revenue within 12 months |
| 3-4 | Likely adds <20% revenue within 12 months |
| 1-2 | Marginal revenue impact expected |

#### Confidence (1-10): Probability of success

| Score | Definition |
|-------|-----------|
| 9-10 | Competitor validated, niche proven, team has prior success |
| 7-8 | Competitor validated, niche appears fit, new to team |
| 5-6 | Some signals, moderate uncertainty |
| 3-4 | Untested in niche, significant unknowns |
| 1-2 | Speculative, few signals |

#### Ease (1-10): Launch speed and cost

| Score | Definition |
|-------|-----------|
| 9-10 | Launch in <1 week, <$100/mo, no new tools needed |
| 7-8 | Launch in 1-2 weeks, <$500/mo |
| 5-6 | Launch in 1-2 months, $500-$2K/mo |
| 3-4 | Launch in 3+ months, $2K-$10K/mo |
| 1-2 | High complexity, >$10K/mo or major team investment |

### Channel Evaluation Table Template

```
| Channel | Impact | Confidence | Ease | ICE | Tier | Notes |
|---------|--------|-----------|------|-----|------|-------|
| SEO — new clusters | 8 | 9 | 7 | 8.0 | 1 | Current channel, expand scope |
| YouTube | 8 | 6 | 4 | 6.0 | 2 | High upside, high effort |
| Pinterest | 6 | 7 | 8 | 7.0 | 1 | Visual niche, low effort |
| Email newsletter | 7 | 8 | 7 | 7.3 | 1 | Compound effect over time |
| TikTok | 7 | 4 | 5 | 5.3 | 2 | Viral potential, unproven in niche |
| Google Ads | 8 | 5 | 4 | 5.7 | 2 | High cost, requires budget |
| Reddit/Community | 5 | 7 | 8 | 6.7 | 2 | Relationship-based, slow burn |
| Influencer Collabs | 6 | 5 | 3 | 4.7 | 3 | Expensive, unknown ROI |
```

### Resource Requirements Matrix

```
Channel: {name}
ICE Tier: {1|2|3}
Launch Time: {X weeks}
Ongoing Effort: {X hours/week}
Monthly Cost: ${amount}
Required Tools: {list}
Required Skills: {list}
90-Day KPI: {measurable target}
```

## Veto Conditions

- **HARD VETO:** No channel scores ICE >= 5.0 beyond current primary — operator must review niche scale assumptions before expansion
- **SOFT VETO:** Resource requirements for Tier 1 channels exceed operator capacity by >2x — flag capacity constraint, require prioritization to single channel before planning full expansion

## Output

- **File:** `docs/strategy/{date}-channel-expansion-{niche-slug}.md`
- **Format:** Markdown

## Output Example

```yaml
# Channel Expansion Plan — Example Output (YAML summary)
niche: "best air purifiers"
current_primary_channel: "SEO"
analysis_date: "2026-02-18"
operator_capacity: "10h/week, $500/mo budget"

ice_ranked_channels:
  - channel: "Email Newsletter"
    ice: 7.3
    tier: 1
    launch_weeks: 1
    hours_per_week: 2
    monthly_cost: "$29 (ConvertKit)"
    kpi_90d: "500 subscribers, 3 campaigns sent"
  - channel: "Pinterest"
    ice: 7.0
    tier: 1
    launch_weeks: 1
    hours_per_week: 3
    monthly_cost: "$0"
    kpi_90d: "200 pins live, 50 referral sessions/mo"
  - channel: "YouTube"
    ice: 6.0
    tier: 2
    launch_weeks: 6
    hours_per_week: 8
    monthly_cost: "$200 (equipment/editing)"
    kpi_90d: "12 videos live, 500 subscribers"

expansion_roadmap:
  phase_1_0_3mo: ["Email Newsletter", "Pinterest"]
  phase_2_3_6mo: ["YouTube — evaluate capacity first"]
  phase_3_6_12mo: ["Google Ads — only if ROI > 2x from organic"]

channel_dependency_current: "97% SEO"
channel_dependency_target_12mo: "70% SEO, 15% Email, 10% Social, 5% Paid"

next_step: "Launch email capture on site immediately (Day 1 of Phase 1)"
```

---
*Squad: affiliates | Version: 1.0.0 | Created: 2026-02-18*
