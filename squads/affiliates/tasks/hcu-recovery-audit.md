# hcu-recovery-audit

## Metadata
```yaml
task_id: AFF_SEO_010
agent: seo-affiliate
type: audit
complexity: high
estimated_time: "4h-8h"
source: "HCU (Helpful Content Update) Recovery Framework — Glenn Gabe, Marie Haynes, Lily Ray research synthesis (2023-2025)"
```

## Purpose
Diagnose the root causes of a Google Helpful Content Update (HCU) penalty on an affiliate site, producing a prioritized recovery plan that addresses thin content, E-E-A-T deficiencies, and site-wide quality signals — the factors most correlated with HCU recovery based on documented case studies.

## Prerequisites
- Site experienced a significant organic traffic drop (>20%) correlating with a confirmed Google HCU or Broad Core Update date
- Access to Google Search Console (full historical data)
- Access to Google Analytics or equivalent (session data, bounce rate, engagement)
- Access to Ahrefs or Semrush (traffic trend, rankings)
- Access to Wayback Machine (for page version comparison)
- Complete list of all indexed pages (Screaming Frog crawl or Ahrefs Site Audit)
- Google Algorithm Update timeline reference (e.g., Semrush Sensor, MozCast)

## Steps

1. **Confirm HCU as the cause** — Verify the traffic drop aligns with a known algorithm event.
   - Cross-reference drop date with Google Update timeline
   - Confirm: did traffic drop begin within 1-2 weeks of a confirmed update?
   - Rule out technical causes: check GSC Coverage for sudden indexation drops, server errors
   - Rule out link profile causes: sudden toxic link spike or lost high-value links
   - Document: exact update name, start date of impact, % traffic lost, pages affected

2. **Segment impacted pages** — Identify which page types were hit hardest.
   - Pull GSC data: compare 90 days before drop vs 90 days after
   - Sort by biggest impression and click loss
   - Categorize impacted pages: affiliate reviews, roundups, informational, how-to, other
   - Identify if HCU hit the entire site or specific content types

3. **Thin content audit** — Identify pages with insufficient informational depth.
   - Flag pages: < 700 words with no images, no original data, no author credentials
   - Flag pages: scraped or templated product descriptions (no original analysis)
   - Flag pages: "filler" content (generic intros, conclusions, padded word count with no substance)
   - Flag pages: duplicate or near-duplicate content (same product reviewed twice with minor variation)
   - Target: every page scoring LOW on original value must be upgraded or deleted

4. **E-E-A-T gap analysis** — Assess Experience, Expertise, Authoritativeness, and Trustworthiness signals.
   - Experience: Does content show first-hand product usage? (photos, test results, "I found that...")
   - Expertise: Are authors identified with relevant credentials?
   - Authoritativeness: Is the site cited externally? Does it have original research?
   - Trustworthiness: Affiliate disclosures present? Privacy policy? Contact information?
   - Score each pillar 1-5 and identify the lowest-scoring pillars as recovery priority

5. **Assess user satisfaction signals** — Review behavioral metrics that Google uses as quality proxies.
   - Bounce rate vs industry average (high bounce = potential satisfaction problem)
   - Time on page for key pages (short for long articles = content not delivering value)
   - Pages per session from organic (low = navigation and relevance issues)
   - GSC CTR: pages with high impressions but very low CTR (title/meta relevance problem)

6. **Review site purpose clarity** — Evaluate whether Google can clearly identify who the site serves.
   - About page: clear mission, named team/authors, explained qualifications
   - Is the site primarily serving users or primarily optimized for affiliate clicks?
   - Does the homepage clearly communicate the site's value proposition?
   - Are product recommendations backed by evidence or just commission potential?

7. **Audit affiliate link density** — Check if affiliate links are excessive vs content value.
   - Pages where affiliate links > 1 per 300 words on average are flagged
   - Check if content exists to serve the user before promoting the product
   - Verify all affiliate links are properly disclosed (FTC compliance AND a quality signal)
   - Check for aggressive interstitial CTAs that interrupt content consumption

8. **Classify every page by action** — For each page on the site, assign one of 4 actions.
   - IMPROVE: High-traffic page with E-E-A-T/thin content issues — rewrite significantly
   - CONSOLIDATE: Low-traffic page that overlaps with another — merge into stronger article
   - DELETE + REDIRECT: Very thin page with no redemption path — remove and 301 to relevant page
   - KEEP: Page is already high-quality — no action required

9. **Build recovery roadmap** — Sequence fixes by impact potential.
   - Priority 1: Improve top 20 traffic pages (highest impact on recovery)
   - Priority 2: Delete or consolidate all THIN pages (site-wide quality signal improvement)
   - Priority 3: E-E-A-T structural improvements (author pages, about page, methodology page)
   - Priority 4: Technical cleanup (if any technical issues identified in parallel)

10. **Set recovery timeline and check-in milestones** — Document realistic expectations.
    - HCU recovery typically occurs at the NEXT broad core or HCU update (can be 3-6 months)
    - Early signal: impressions may recover before clicks (ranking improvement before CTR improvement)
    - Define: what GSC metrics will we track monthly to measure recovery progress?

## Framework / Inline Structure

### HCU Root Cause Taxonomy

```
CATEGORY A: THIN CONTENT (most common cause)
  A1 — Very short pages with no original analysis (< 500 words)
  A2 — Templated product descriptions without hands-on review
  A3 — Padded content (long word count, minimal substance)
  A4 — Content that answers a different question than the keyword implies

CATEGORY B: E-E-A-T DEFICIENCY
  B1 — No named authors with verifiable credentials
  B2 — No evidence of first-hand product experience
  B3 — No methodology or review process disclosed
  B4 — Trust signals missing (disclosure, contact, privacy policy)

CATEGORY C: USER INTENT MISMATCH
  C1 — Commercial content for informational queries
  C2 — Content that doesn't satisfy the searcher's primary question
  C3 — Aggressive monetization before user value is delivered

CATEGORY D: SITE-WIDE SIGNALS
  D1 — Low-quality pages diluting overall site quality
  D2 — Site primarily exists for affiliate revenue, not user help
  D3 — About page vague or absent
```

### Page Action Decision Tree

```
Is the page a top-20 traffic driver?
  YES → IMPROVE (regardless of current quality issues)

Is the page < 500 words with no unique value?
  YES → Can it be merged with another page?
    YES → CONSOLIDATE
    NO  → DELETE + REDIRECT

Does the page have original data, testing, or unique expertise?
  YES → KEEP (may still need minor E-E-A-T improvements)

Is the page similar to another page on the site?
  YES → CONSOLIDATE (redirect weaker to stronger)

Default → IMPROVE (if salvageable) or DELETE + REDIRECT
```

### E-E-A-T Improvement Checklist (per page)

```
EXPERIENCE:
  [ ] Add first-person testing language ("I measured", "In my tests...")
  [ ] Add original photos of product in use (not stock/manufacturer photos)
  [ ] Add date when product was personally tested
  [ ] Add specific test conditions or methodology

EXPERTISE:
  [ ] Name the author (no generic bylines)
  [ ] Link to author bio page with relevant credentials
  [ ] Add expert quote or fact-check attribution
  [ ] Cite primary sources for all claims

AUTHORITATIVENESS:
  [ ] Add "As featured in" section if any press mentions exist
  [ ] Interlink with original research or proprietary data pages
  [ ] Add to author portfolio page

TRUSTWORTHINESS:
  [ ] Affiliate disclosure visible before first affiliate link on page
  [ ] "Last updated" date prominently displayed
  [ ] Products actually tested — state testing date
  [ ] Link to review methodology page
```

### Recovery Milestone Tracking

```
MONTH 1 POST-FIXES:
  Target: GSC impressions stabilize (stop declining)
  Check: No new thin pages published during recovery

MONTH 2-3 POST-FIXES:
  Target: GSC impressions begin recovering (10-20% of lost impressions back)
  Check: Improved pages showing ranking movement in GSC

MONTH 4-6 POST-FIXES (next update window):
  Target: Significant traffic recovery (40-70% of pre-HCU traffic) at next algo update
  Note: Full recovery may require 2+ update cycles

FULL RECOVERY DEFINITION:
  GSC sessions within 10% of pre-HCU 90-day average
  Ranking positions for core keywords within 5 positions of pre-HCU
```

## Veto Conditions

- **HARD VETO:** Site has fewer than 12 months of traffic history — pre-HCU baseline cannot be established reliably; use available data with explicit uncertainty caveats in the report
- **HARD VETO:** >60% of the site's pages are classified as DELETE or CONSOLIDATE — site may be more efficiently rebuilt from scratch than recovered; present this option to operator before executing mass deletion (mass 301 redirects can cause crawl budget issues)
- **SOFT VETO:** No named human authors with verifiable credentials can be identified — E-E-A-T recovery is structurally blocked; operator must commit to author identity solution (pseudonym with documented persona is insufficient for 2025 Google standards) before proceeding

## Output

- **File:** `docs/seo/audits/{date}-hcu-recovery-{domain-slug}.md`
- **Format:** Markdown

## Output Example

```yaml
# HCU Recovery Audit — Example Output (YAML summary)
domain: "airpureexpert.com"
audit_date: "2026-02-18"
update_impacted: "Google HCU — November 2024"
traffic_lost: "-58% organic sessions vs prior 90-day average"
pages_audited: 198

root_causes_identified:
  primary: "CATEGORY A — Thin Content (A2, A3)"
  secondary: "CATEGORY B — E-E-A-T Deficiency (B1, B2)"
  note: |
    67 pages (34%) have < 600 words with no original product testing.
    All 198 pages use generic "Staff" byline with no author credentials.

page_action_breakdown:
  IMPROVE: 42
  CONSOLIDATE: 31  # → 14 merged articles
  DELETE_REDIRECT: 28
  KEEP: 97

eeat_scores:
  experience: 1/5
  expertise: 2/5
  authoritativeness: 3/5
  trustworthiness: 2/5

recovery_roadmap:
  priority_1_immediate:
    - "Create 3 named author profiles with HVAC/home appliance credentials"
    - "Add first-person testing language to top 20 traffic pages"
    - "Delete 28 thin pages (301 redirect to category or pillar)"
  priority_2_month_1:
    - "Merge 31 pages into 14 consolidated articles"
    - "Add original testing photos to all Tier A product reviews"
    - "Add affiliate disclosures above the fold on all pages"
  priority_3_month_2_3:
    - "Publish 'Our Review Methodology' page"
    - "Improve About page with full team bios and editorial process"
    - "Original testing data: conduct CADR tests for top 5 products"

recovery_timeline: "Expect improvement signal at next core update (est. May-June 2026)"

monthly_check_ins:
  march_2026: "Confirm deletions live, impressions stabilize in GSC"
  april_2026: "Review improved pages — ranking movements"
  june_2026: "Evaluate at next update — expect 30-60% traffic recovery"

next_step: "Run site-audit.md (AFF_SEO_001) in parallel to catch technical issues that may compound HCU impact"
```

---
*Squad: affiliates | Version: 1.0.0 | Created: 2026-02-18*
