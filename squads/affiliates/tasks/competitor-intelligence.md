# competitor-intelligence

## Metadata
```yaml
task_id: AFF_STR_003
agent: seo-affiliate
type: analysis
complexity: high
estimated_time: "3h-6h"
source: "Diggity Competitor Reverse-Engineering Framework + Ahrefs Site Explorer methodology"
```

## Purpose
Reverse-engineer the top 5 competing affiliate sites in a niche to extract monetization strategies, content patterns, link profiles, and traffic sources — turning competitors' existing work into an actionable blueprint for outcompeting them.

## Prerequisites
- Niche and primary keyword confirmed
- Niche scorecard (AFF_STR_001) with GO or SOFT GO verdict
- Access to Ahrefs or Semrush (Site Explorer, Content Gap, Backlink analysis)
- Access to SimilarWeb or Ahrefs Traffic Estimate
- Access to: BuiltWith, Wappalyzer, or manual inspection for tech stack detection

## Steps

1. **Identify top 5 competitors** — Pull top 10 SERP results for primary keyword; select top 5 non-brand, non-aggregator affiliate sites.
   - Exclude: Amazon, Wikipedia, government, news sites, and mega-brand homepages
   - Prefer: sites with clear affiliate monetization signals (review content, comparison tables, affiliate disclosure)
   - If SERP is dominated by non-affiliate sites, expand to related commercial keywords

2. **Pull core metrics for each site** — Use Ahrefs Site Explorer (or Semrush).
   - Domain Rating (DR)
   - Total referring domains
   - Estimated monthly organic traffic
   - Total indexed pages
   - Traffic value (estimated)
   - Date site was first indexed (age)

3. **Identify top pages** — Find their highest-traffic content.
   - Export top 20 pages by estimated organic traffic
   - Categorize by content type: review, best-of, vs, how-to, informational
   - Note which affiliate programs each top page promotes
   - Flag pages with featured snippets or PAA ownership

4. **Map monetization stack** — Determine how each competitor monetizes.
   - Inspect affiliate links (check URL patterns: tag=, hoplink, ref=, etc.)
   - Identify display ad networks (AdSense, Mediavine, AdThrive/Raptive, Ezoic)
   - Look for email capture (newsletter, lead magnets)
   - Check for digital products, courses, or membership content
   - Document estimated revenue split (qualitative)

5. **Analyze link profile** — Run backlink audit for each competitor.
   - Total referring domains
   - Top 10 linking domains by DR
   - Anchor text distribution (note exact match vs brand vs generic)
   - Link velocity (new links per month trend)
   - Identify most-linked pages (linkable assets)

6. **Decode content strategy** — Analyze their editorial approach.
   - Publishing frequency (posts per month via Wayback Machine or blog archive)
   - Average word count of top pages
   - Use of original data (studies, surveys, proprietary testing)
   - E-E-A-T signals: author bios, credentials, about page depth
   - Schema types used (Review, FAQ, HowTo, Product)

7. **Find content gaps** — Identify keywords competitors rank for that you don't yet target.
   - Use Ahrefs Content Gap or Semrush Keyword Gap
   - Filter: KD < 30, volume > 500/mo
   - Flag opportunities where competitors rank 4-15 (beatable with better content)

8. **Synthesize competitor profiles** — Write one-page profile per competitor.

9. **Extract strategic insights** — Derive 3-5 actionable conclusions for the new site's strategy.

## Framework / Inline Structure

### Competitor Profile Schema

```
Competitor: {site_name}
URL: {url}
DR: {dr}
Referring Domains: {rd}
Monthly Traffic (est.): {traffic}
Site Age: {age}

Content Mix:
  - Reviews: {pct}%
  - Best-of Roundups: {pct}%
  - How-to / Informational: {pct}%
  - Comparison (vs): {pct}%

Monetization Stack:
  Primary: {affiliate_program_1}, {affiliate_program_2}
  Display Ads: {network or None}
  Email: {yes/no, estimated list size if known}
  Other: {digital products, memberships, etc.}

Link Profile:
  Top Anchor Types: {brand}%, {partial match}%, {exact match}%
  Top Linking Domains: {domain_1} (DR {dr}), {domain_2} (DR {dr})
  Monthly New RDs: {velocity}

Top 3 Pages:
  1. {title} — {traffic}/mo — {content_type}
  2. {title} — {traffic}/mo — {content_type}
  3. {title} — {content_type}

E-E-A-T Signals:
  Author Bios: {yes/no}
  Credentials Shown: {yes/no}
  Original Data: {yes/no}
  Schema Used: {list}

Weaknesses Identified:
  - {weakness_1}
  - {weakness_2}
```

### Strategic Insight Template

```
INSIGHT #{n}: {Short title}
Observation: {What we found across competitors}
Opportunity: {How we exploit this gap}
Action: {Specific task or decision this triggers}
Priority: HIGH | MEDIUM | LOW
```

### Content Gap Matrix

| Keyword | Volume | KD | Competitor Ranking | Our Priority |
|---------|--------|----|--------------------|-------------|
| {kw} | {vol} | {kd} | #{rank} on {site} | HIGH/MED/LOW |

## Veto Conditions

- **HARD VETO:** All 5 competitors have DR > 70 AND average content age < 18 months AND no detectable content quality gaps — niche is locked; escalate to AFF_STR_001 re-evaluation with updated D3 score of 0
- **SOFT VETO:** Top competitor owns >40% of all niche traffic AND has original proprietary data (surveys, lab tests) as primary differentiator — note as HIGH RISK, require unique data angle before proceeding

## Output

- **File:** `docs/research/{date}-competitor-intel-{niche-slug}.md`
- **Format:** Markdown

## Output Example

```yaml
# Competitor Intelligence Report — Example Summary
niche: "best air purifiers"
analysis_date: "2026-02-18"
competitors_analyzed: 5

competitor_snapshot:
  - site: "thespruce.com"
    dr: 82
    traffic_est: "2.1M/mo"
    weakness: "Generic content, no original testing data, outdated 2021 reviews"
  - site: "air-purifier-power.com"
    dr: 41
    traffic_est: "180K/mo"
    weakness: "Thin link profile, no email capture, weak E-E-A-T"
  - site: "consumerreports.org"
    dr: 91
    traffic_est: "6M/mo"
    note: "SKIP — mega-brand, not beatable at head terms"
  - site: "breathequality.com"
    dr: 38
    traffic_est: "95K/mo"
    weakness: "No schema markup, poor mobile UX, single affiliate program"
  - site: "airpurifieradvice.com"
    dr: 44
    traffic_est: "210K/mo"
    weakness: "No original data, relies on Amazon only, no email list"

content_gaps_found: 47
high_priority_gaps: 12

strategic_insights:
  - insight: "Original testing = moat"
    observation: "No competitor in top 5 uses original lab or home testing data"
    opportunity: "Build testing protocol, own 'tested by us' positioning"
    priority: HIGH
  - insight: "Email is ignored"
    observation: "Only 1 of 5 has visible email capture; none have evident nurture"
    opportunity: "Build email list from day 1 as traffic insurance and revenue channel"
    priority: HIGH

next_steps:
  - "Run content-plan.md (AFF_SEO_002) using gap data"
  - "Run link-strategy.md (AFF_SEO_004) using competitor link profiles"
```

---
*Squad: affiliates | Version: 1.0.0 | Created: 2026-02-18*
