# skyscraper-execution

## Metadata
```yaml
task_id: AFF_SEO_008
agent: seo-content
type: creation
complexity: high
estimated_time: "4h-8h"
source: "Brian Dean Skyscraper Technique (Backlinko) — 2025 adaptation: original data + real testing required"
```

## Purpose
Execute the Skyscraper Technique for a specific target keyword: identify the most-linked content in the niche, create a demonstrably superior version featuring original data or real product testing, then systematically outreach to earn the backlinks the original content attracted.

## Prerequisites
- Target keyword identified (typically from content-plan.md — high-priority head term)
- Competitor intelligence (AFF_STR_003) completed — linkable asset pages identified
- Link strategy (AFF_SEO_004) confirmed — skyscraper is a Phase 2-3 tactic
- Site has minimum DR 15 (enough credibility for outreach to be taken seriously)
- Original data, test results, or unique research angle identified for the "better" angle
- Outreach capability confirmed (email access, outreach tool or manual process)

## Steps

1. **Find the most-linked content** — Identify the best existing content in the niche for your target keyword.
   - Use Ahrefs Content Explorer: search target keyword, sort by "Referring Domains"
   - Use Ahrefs Link Intersect: find pages linking to multiple competitors on this topic
   - Select the single best-performing linkable piece (most referring domains, relevant topic)
   - Pull complete backlink profile of the target content: all referring domains, anchor texts, page types

2. **Analyze why it attracted links** — Understand the value proposition that made it link-worthy.
   - Was it original data? A comprehensive list? A unique methodology? A free tool?
   - Who linked to it and why? (Bloggers citing stats? Journalists referencing a study? Teachers using it as resource?)
   - What specific claim or data point got cited most often?
   - Document the link-earning angle explicitly

3. **Define your "better" angle** — Plan how your version will be objectively superior for 2025/2026.
   - **Option A: Original testing data** — You physically tested the product/service and can provide data no one else has
   - **Option B: More comprehensive** — Your version covers 50% more ground with better organization
   - **Option C: More current** — Existing piece is 2+ years old, your version uses current data
   - **Option D: Better format** — Add interactive elements, video, original charts, comparison tools
   - Note: In 2025, "longer = better" no longer works. Original data or testing is required for a meaningful moat.

4. **Create the superior content** — Produce the article/resource with the planned "better" angle.
   - **Minimum content requirements for Skyscraper 2025:**
     - Original data point: survey result, test result, or proprietary research
     - At least one original visual: chart, infographic, test photo, or comparison table (not stock)
     - Expert quote or contribution (validates E-E-A-T)
     - Published author with domain credentials (not generic byline)
   - **Structure**: match intent of original but outperform on depth, evidence, and UX
   - **Word count**: match competitor + 20% is a minimum; aim for "definitive resource" status
   - **Schema**: use appropriate structured data (HowTo, FAQPage, Review depending on format)

5. **Publish and index** — Publish the content and accelerate indexation.
   - Submit URL to Google Search Console (URL inspection → Request Indexing)
   - Add internal links from 3-5 existing pages to the new resource
   - Share on social channels (minimal signal, but helps crawl)

6. **Build outreach prospect list** — Identify sites to contact for links.
   - Export all referring domains linking to the original content (from step 1)
   - Filter to: real sites with organic traffic, relevant content, dofollow links
   - Prioritize by DR: go after DR 30-70 first (most achievable, meaningful links)
   - Collect contact emails: use Hunter.io, Snov.io, or site contact pages
   - Target: 50-100 qualified prospects per skyscraper campaign

7. **Write outreach emails** — Craft personalized, value-focused outreach.
   - Use the framework in link-building-outreach.md (AFF_SEO_009) for templates
   - Key principle: lead with their benefit ("you linked to {original_content}, we made something better")
   - Never mention "link" in subject line (spam trigger)
   - Include the specific, unique angle of your piece (the original data or test result)

8. **Send outreach in batches** — Execute the email campaign.
   - Batch 1: 20-30 emails (test messaging)
   - Wait 5 days, evaluate open rate and reply rate
   - Adjust messaging if < 20% open rate or < 5% reply rate
   - Batch 2-4: remaining prospects with optimized messaging
   - Follow up once after 7 days if no response (single follow-up only)

9. **Track responses and links** — Log all outreach and resulting links.
   - Track: sent, opened, replied, linked, declined
   - For linked: verify link is live, dofollow, correct anchor
   - Update Ahrefs alert to track when new links appear

10. **Evaluate campaign performance** — Measure results and document learnings.
    - Total links acquired vs prospects contacted (target: 5-10% conversion)
    - DR profile of acquired links
    - Document what messaging worked best

## Framework / Inline Structure

### Skyscraper 2025 "Better" Hierarchy

```
RANK 1 (Most defensible moat):
  Original proprietary data — survey you ran, test you conducted, experiment results
  → Example: "We tested 15 air purifiers in a sealed room and measured CADR with calibrated equipment"

RANK 2 (Strong but replicable):
  Significantly more comprehensive + better organized
  → Example: Competitor has 10 products; you review 25 with consistent test criteria

RANK 3 (Temporary advantage):
  More current than competitors (12+ months newer data)
  → Example: Competitors' studies use 2021 data; yours uses 2024

RANK 4 (Weak by itself):
  Better design / format (must be combined with Rank 1-3 factor)
  → Never use format alone as the "better" justification

WARNING: "Longer content" is NOT a valid Skyscraper angle in 2025.
Google has explicitly devalued length-stuffing. Original data or expertise is required.
```

### Outreach Email Templates

**Initial Email:**
```
Subject: Your post on [topic] (+ something you might want to link to)

Hi [Name],

I noticed you linked to [original content URL] in your article on [their article title].

We just published something on [topic] that's more up-to-date and includes original testing data: [your URL]

Specifically, we [describe unique angle in one sentence — the original test result or data].

Thought it might be a useful addition or replacement for your readers. No pressure either way!

Best,
[Your name]
[Site URL]
```

**Follow-up (7 days later):**
```
Subject: Re: Your post on [topic]

Hi [Name],

Just following up on my previous email — wanted to make sure you had a chance to see this.
If it's not a fit, no worries at all!

[Your name]
```

### Campaign Tracking Spreadsheet Fields

```
| # | Prospect URL | DR | Contact | Email | Sent Date | Opened | Replied | Linked | Notes |
|---|-------------|----|---------|----|----------|--------|---------|--------|-------|
```

### Performance Benchmarks

```
Open rate target:    >= 30% (personalized subject lines)
Reply rate target:   >= 8%
Link conversion:     >= 5% of emails sent (1 link per 20 emails is acceptable)
DR quality target:   >= 60% of acquired links from DR 30+ domains
```

## Veto Conditions

- **HARD VETO:** No original data, testing, or unique research angle can be identified — the "better" content cannot be built without it in 2025; do not proceed with skyscraper until a unique angle is secured
- **HARD VETO:** Target content has fewer than 20 referring domains — insufficient link pool to justify full skyscraper campaign; use as link building inspiration but execute standard guest post outreach instead
- **SOFT VETO:** Site DR < 15 — outreach conversion rate will be very low; build DR via Phase 1 link building (AFF_SEO_004) before running skyscraper

## Output

- **File:** `docs/seo/skyscraper-{keyword-slug}-{date}.md`
- **Format:** Markdown

## Output Example

```yaml
# Skyscraper Execution Report — Example Output (YAML summary)
target_keyword: "best air purifier"
target_content_url: "https://competitor.com/best-air-purifiers/"
target_content_referring_domains: 182
campaign_date: "2026-02-18"

better_angle: |
  Original CADR testing: We tested 18 air purifiers in a sealed 150 sq ft room
  using a calibrated PM2.5 particle counter (IQAir AirVisual Pro) and measured
  actual CADR performance vs manufacturer claims. 7 of 18 units underperformed
  manufacturer specs by more than 20%.

our_content_url: "https://airpureexpert.com/best-air-purifiers/"
our_content_word_count: 5200
our_content_unique_elements:
  - "Original CADR test data for 18 units (with photos and methodology)"
  - "Expert quote from HVAC engineer Dr. J. Rodriguez"
  - "Original comparison chart: rated vs actual CADR performance"

outreach_stats:
  prospects_identified: 78
  prospects_qualified: 61
  emails_sent: 61
  open_rate: "38%"
  reply_rate: "11%"
  links_acquired: 7
  conversion_rate: "11.5%"  # Above 5% target

links_acquired_dr_profile:
  dr_50_plus: 3
  dr_30_49: 3
  dr_under_30: 1

top_link_acquired:
  domain: "cleanairreview.com"
  dr: 58
  anchor: "independent CADR testing data"

next_step: "Monitor ranking trajectory for 30 days; run seo-test-plan.md on title tag optimization"
```

---
*Squad: affiliates | Version: 1.0.0 | Created: 2026-02-18*
