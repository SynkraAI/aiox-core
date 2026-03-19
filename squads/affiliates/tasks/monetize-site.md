# monetize-site

## Metadata
```yaml
task_id: AFF_SEO_005
agent: seo-affiliate + authority-builder
type: creation
complexity: medium
estimated_time: "2h-3h"
source: "Affiliate Site Monetization Stack — Diggity + Niche Pursuits Income Diversification Framework"
```

## Purpose
Design and implement a multi-source monetization stack that combines affiliate commissions, display advertising, email monetization, and diversification revenue streams — reducing revenue concentration risk and maximizing revenue-per-visitor across all traffic segments.

## Prerequisites
- Niche scorecard (AFF_STR_001) GO or SOFT GO
- Program stack validated (AFF_STR_002) — affiliate programs confirmed
- Site must be live with at least basic content structure
- Minimum traffic requirement for display ads (Mediavine: 50K sessions/mo; AdThrive/Raptive: 100K pageviews/mo; Ezoic: no minimum)
- Email infrastructure available or planned (ConvertKit, MailerLite, or equivalent)

## Steps

1. **Audit current monetization** — If site exists, document what is already in place.
   - List all active affiliate programs and their tracking status
   - Document current RPM from any display ads
   - Note email list size and monetization methods
   - Calculate revenue concentration: % from top 1 source

2. **Design affiliate layer** — Structured affiliate program deployment.
   - Primary programs (top 2-3 from AFF_STR_002): placed in dedicated review and best-of content
   - Secondary programs: used for roundup variety and alternative recommendations
   - Deep-link strategy: link to specific product pages, not homepages (higher conversion)
   - CTA placement: above-the-fold table for roundups, inline within reviews, comparison table at bottom

3. **Design display ads layer** — Select and implement display advertising.
   - Traffic < 10K sessions: use Ezoic or SHE Media (low threshold, lower RPM)
   - Traffic 10K-50K: upgrade to Ezoic (improved AI optimization) or apply to Mediavine when near threshold
   - Traffic 50K+: Mediavine (premium RPM, affiliate-friendly)
   - Traffic 100K+: Apply to AdThrive/Raptive (highest RPM for US audience)
   - Ad placement rules: avoid in the first 100 words of content, no ads that shift CLS > 0.1

4. **Design email monetization layer** — Email list as owned revenue channel.
   - Capture strategy: lead magnet, content upgrade, or simple newsletter opt-in
   - Monetization methods: affiliate links in newsletters, sponsored issues (once list > 5K), digital product promotions
   - Sequence design: 5-email welcome series with affiliate product recommendations
   - Ongoing: weekly/biweekly newsletter with new content + product recommendations

5. **Identify diversification revenue streams** — Evaluate additional monetization for the niche.
   - Digital products: buyer guides, templates, checklists (low effort, high margin)
   - Sponsored content / brand deals (once DR 30+ and established audience)
   - Courses or consulting (expertise-heavy niches only)
   - Private label or white-label products (advanced, requires supply chain)
   - Comparison / deal aggregation pages (high commercial intent, lower effort)

6. **Set revenue targets and milestones** — Define measurable monetization goals.
   - Month 3: First affiliate commission generated
   - Month 6: Display ads live, email list at 250+ subscribers
   - Month 12: 3+ revenue streams active, no single source > 60% of revenue

7. **Build monetization tracking system** — Ensure all revenue is measured.
   - UTM parameters for all affiliate links
   - Conversion tracking in affiliate dashboards
   - Revenue attribution spreadsheet (source × month)
   - RPM tracking for display ads

8. **Implement affiliate link management** — Use a plugin or system for link management.
   - Recommended: Lasso (affiliate management + display optimization) or ThirstyAffiliates
   - All affiliate links: cloaked (yoursite.com/go/product-name), nofollow, opens new tab
   - Regular link audit: check for broken or changed affiliate links (monthly)

9. **Document monetization stack** — Write complete stack configuration with all programs, placements, and targets.

## Framework / Inline Structure

### Monetization Stack Architecture

```
REVENUE STACK (target: minimum 3 active sources):

LAYER 1: AFFILIATE (primary — target 50-70% of revenue)
  Primary programs:    {program_1}, {program_2}
  Secondary programs:  {program_3}, {program_4}
  CTA placements:      Comparison table (top of page), inline CTAs, sidebar
  Avg commission/sale: ${amount}
  Monthly target:      ${revenue}

LAYER 2: DISPLAY ADS (secondary — target 15-30% of revenue)
  Network:     {Ezoic|Mediavine|AdThrive}
  Current RPM: ${rpm}
  Monthly sessions: {sessions}
  Monthly revenue:  ${revenue}
  Upgrade trigger:  {sessions threshold for next tier network}

LAYER 3: EMAIL (owned channel — target 10-20% of revenue)
  Platform:    {ConvertKit|MailerLite}
  List size:   {subscribers}
  Monetization: Affiliate links in newsletters, digital products
  Monthly revenue: ${revenue}

LAYER 4+: DIVERSIFICATION (target 5-15% of revenue)
  {Stream_1}: {type} — ${monthly_revenue}
  {Stream_2}: {type} — ${monthly_revenue}
```

### Display Ad Network Tier Guide

```
TIER 1 (Early stage, < 10K sessions):
  Ezoic:    No minimum, ~$5-12 RPM, AI-optimized placements
  SHE Media: Focus on female-demographic niches

TIER 2 (Growing, 10K-50K sessions):
  Ezoic Advanced: Better rates as traffic grows
  Monumetric:    25K minimum, $8-15 RPM

TIER 3 (Established, 50K+ sessions):
  Mediavine:  50K sessions/mo minimum, $15-30 RPM, affiliate-friendly
  Newor Media: 30K minimum, premium CPMs

TIER 4 (Authority site, 100K+ pageviews):
  AdThrive/Raptive: 100K PV minimum, $20-45 RPM for US traffic
```

### Affiliate CTA Placement Rules

```
ROUNDUP / BEST-OF articles:
  - Comparison table ABOVE the fold (within 200 words of page start)
  - Individual product blocks with CTA button per product
  - Final recommendation CTA at bottom of article

SINGLE PRODUCT REVIEW:
  - Quick verdict box near top with CTA
  - Inline CTA after each major section (3-4 total)
  - Sticky sidebar CTA (if theme supports)
  - Strong closing CTA with price + availability note

HOW-TO / INFORMATIONAL:
  - Minimal affiliate links — one contextual mention max
  - Focus on email capture for these pages
  - Internal link to relevant review/roundup page
```

### Revenue Concentration Risk Thresholds

```
HEALTHY: No single source > 60% of revenue
WARNING: Single source 60-75% — implement diversification plan
CRITICAL: Single source > 75% — revenue at significant risk if program changes

Amazon Associates specific: Keep at < 30% of total revenue
(Historical precedent: Amazon has cut rates multiple times)
```

## Veto Conditions

- **HARD VETO:** Site has fewer than 5 indexed pages — monetization implementation is premature; build minimum content foundation first (10+ pages), then return
- **SOFT VETO:** Niche has no viable display ad network (very niche B2B topics, very low US traffic %) — display ad layer must be skipped; document in stack and compensate with higher affiliate commission targets
- **SOFT VETO:** Program stack has only 1 viable affiliate program — concentration risk is critical; do not launch until at least 2 programs are active

## Output

- **File:** `docs/monetization/{date}-monetize-stack-{domain-slug}.md`
- **Format:** Markdown

## Output Example

```yaml
# Monetization Stack — Example Output (YAML summary)
domain: "airpureexpert.com"
plan_date: "2026-02-18"
monthly_sessions_current: 8500
monthly_revenue_current: "$420"

stack:
  layer_1_affiliate:
    programs:
      primary:
        - "Levoit Direct (ShareASale) — 10%, 30d cookie, avg $22/sale"
        - "Winix Direct (Impact) — 8%, 45d cookie, avg $16/sale"
      secondary:
        - "Amazon Associates — 3%, 24h cookie, avg $6/sale"
        - "Coway (CJ) — 7%, 30d cookie, avg $14/sale"
    link_manager: "Lasso"
    monthly_revenue_current: "$380"
    monthly_revenue_target_6mo: "$1200"

  layer_2_display:
    network: "Ezoic"
    rpm_current: "$8.40"
    monthly_revenue_current: "$71"
    upgrade_plan: "Apply to Mediavine at 50K sessions (est. month 9)"

  layer_3_email:
    platform: "ConvertKit"
    list_size: 180
    monetization: "Affiliate links in weekly newsletter + seasonal product recommendations"
    monthly_revenue_current: "$0 (building)"
    monthly_revenue_target_6mo: "$150"

  layer_4_diversification:
    - stream: "Air Purifier Buying Guide PDF"
      type: "digital product"
      price: "$9"
      monthly_revenue: "$0 (planned Q3)"

revenue_concentration:
  affiliate_pct: "90%"
  display_pct: "17%"
  status: WARNING
  action: "Accelerate email list building and add second display network"

6_month_targets:
  monthly_revenue: "$1,500"
  revenue_sources_active: 3
  top_source_concentration: "< 65%"

next_step: "Set up email capture immediately; apply to Mediavine at 50K sessions"
```

---
*Squad: affiliates | Version: 1.0.0 | Created: 2026-02-18*
