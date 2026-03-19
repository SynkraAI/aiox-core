# site-audit

## Metadata
```yaml
task_id: AFF_SEO_001
agent: seo-affiliate
type: audit
complexity: high
estimated_time: "3h-6h"
source: "Technical SEO Audit Framework — Diggity/Ahrefs combined methodology + Google E-E-A-T Guidelines 2024"
```

## Purpose
Conduct a comprehensive three-pillar audit (Technical, Content, Link Profile) of an affiliate site to diagnose ranking blockers, E-E-A-T deficiencies, and link equity issues — producing a prioritized remediation list that unlocks organic growth and future-proofs against algorithm updates.

## Prerequisites
- Site URL confirmed and accessible
- Access to Google Search Console (property verified)
- Access to Ahrefs or Semrush (Site Audit + Backlink Audit)
- Access to PageSpeed Insights / GTmetrix (Core Web Vitals)
- Access to Screaming Frog (crawl, desktop or cloud)
- Access to schema.org validator (validator.schema.org)

## Steps

1. **Crawl the site** — Run Screaming Frog full crawl and Ahrefs Site Audit.
   - Record total pages crawled, total indexable pages
   - Export all crawl errors (4xx, 5xx, redirects, broken links)
   - Export meta data (titles, descriptions, H1s) for analysis

2. **Technical SEO audit** — Check all technical factors (see Framework: Technical Checklist).
   - Core Web Vitals (LCP, FID/INP, CLS) via PageSpeed Insights — mobile and desktop
   - Crawlability: robots.txt, XML sitemap, noindex tags, canonical tags
   - HTTPS status and redirect chain audit
   - Internal linking: orphan pages, click depth > 3 levels
   - Mobile usability (Google Mobile-Friendly Test or GSC report)
   - Structured data: schema types present, validation errors

3. **Content audit** — Evaluate content quality and E-E-A-T signals.
   - Flag thin content pages (< 500 words with no clear informational value)
   - Identify content cannibalization (multiple pages targeting same keyword intent)
   - Assess E-E-A-T signals on key pages (see Framework: E-E-A-T Checklist)
   - Audit internal linking structure: pillar pages, hub-spoke gaps
   - Check for outdated content (product reviews with stale pricing/availability)

4. **Link profile audit** — Analyze backlink quality and composition.
   - Total referring domains (vs previous period)
   - Referring domain DR distribution (DR buckets: 0-20, 21-40, 41-60, 61-80, 80+)
   - Anchor text distribution (match against Diggity Ratio targets)
   - Spam score assessment: identify potentially toxic links
   - Lost links: high-DR links lost in past 6 months (reclamation opportunities)
   - Link velocity trend (acquiring links consistently vs spikes)

5. **Schema and rich results audit** — Validate structured data implementation.
   - Check Review, Product, HowTo, FAQ schema on appropriate pages
   - Validate all schema at validator.schema.org
   - Cross-reference with Google Rich Results Test
   - Document which page types are missing schema

6. **GSC data analysis** — Pull insights from Google Search Console.
   - Pages with impressions but CTR < 2% (meta optimization opportunities)
   - Queries where site ranks position 4-15 (quick win optimization targets)
   - Coverage report: index/no-index breakdown and error types
   - Core Web Vitals report from GSC

7. **Prioritize findings** — Classify every finding by severity.
   - CRITICAL: Blocks ranking or indexation (fix within 7 days)
   - HIGH: Significant ranking suppression (fix within 30 days)
   - MEDIUM: Meaningful improvement opportunity (fix within 90 days)
   - LOW: Minor optimization, low-urgency (fix when capacity allows)

8. **Write audit report** — Produce full report with prioritized remediation table.

## Framework / Inline Structure

### Technical SEO Checklist (32 items)

```
CORE WEB VITALS (mobile):
  [ ] LCP <= 2.5s
  [ ] INP <= 200ms
  [ ] CLS <= 0.1
  [ ] TTFB <= 800ms

CRAWLABILITY:
  [ ] robots.txt: no accidental blocks of important directories
  [ ] XML sitemap: exists, submitted to GSC, no 404s in sitemap
  [ ] Canonical tags: self-referencing canonicals on all key pages
  [ ] No accidental noindex on money pages
  [ ] No redirect chains > 2 hops
  [ ] No broken internal links (4xx)
  [ ] No broken external links (crawled pages pointing to 404s)

HTTPS & SECURITY:
  [ ] All pages served over HTTPS
  [ ] No mixed content warnings
  [ ] HTTP → HTTPS redirect in place (301)
  [ ] HSTS header set

ARCHITECTURE:
  [ ] No pages deeper than 3 clicks from homepage
  [ ] No orphan pages (pages with no internal links pointing to them)
  [ ] Pagination properly implemented (rel=next/prev or infinite scroll handled)
  [ ] Breadcrumb navigation present and schema-marked

META / HTML:
  [ ] Unique title tags on all pages (40-60 chars)
  [ ] Unique meta descriptions on all pages (120-160 chars)
  [ ] Single H1 per page
  [ ] Image alt text coverage >= 90% of images
  [ ] No duplicate H1 / title tag content mismatches

STRUCTURED DATA:
  [ ] Review schema on product review pages
  [ ] Product schema on individual product pages
  [ ] FAQ schema on pages with FAQ sections
  [ ] HowTo schema on how-to articles
  [ ] BreadcrumbList schema on all pages
  [ ] No schema validation errors
  [ ] Organization / WebSite schema on homepage
```

### E-E-A-T Checklist (12 signals)

```
EXPERIENCE:
  [ ] Author bios with domain-relevant experience stated
  [ ] First-person testing/usage evidence in content ("I tested...", "After 6 months of use...")
  [ ] Original photos or video of actual product usage

EXPERTISE:
  [ ] Author credentials relevant to niche visible
  [ ] Expert review or quotes cited with attribution
  [ ] Sources and references linked (not just stated)

AUTHORITATIVENESS:
  [ ] About page with clear mission and team information
  [ ] Named human authors (not "Staff" or generic bylines)
  [ ] External media mentions or citations (if any)

TRUSTWORTHINESS:
  [ ] Affiliate disclosure on every page with affiliate links (FTC requirement)
  [ ] Privacy policy and Terms of Service pages present and current
  [ ] Contact page with real contact method
  [ ] Editorial policy or review methodology page
```

### Link Profile Health Targets (Diggity Ratio)

```
Anchor Text Distribution Targets:
  Exact match:   5-10%  (over this = over-optimization risk)
  Partial match: 15-20%
  Brand:         30-40%
  Naked URL:     15-20%
  Generic:       10-15%

Referring Domain Quality Targets:
  DR 60+: >= 20% of RDs
  DR 0-20 (potential spam): < 30% of RDs
```

### Severity Classification

```
CRITICAL — fix within 7 days:
  Noindex on money pages, site blocked in robots.txt,
  massive 4xx errors on key pages, no HTTPS, GSC manual action

HIGH — fix within 30 days:
  LCP > 4s, CLS > 0.25, rampant content cannibalization,
  anchor text over-optimization, 0 schema on review pages

MEDIUM — fix within 90 days:
  Missing meta descriptions, thin content pages, orphan pages,
  image alt text gaps, outdated product information

LOW — fix when capacity allows:
  Minor meta optimization, stylistic schema improvements,
  low-value dead links to external 404s
```

## Veto Conditions

- **HARD VETO:** Site has active Google Manual Action — do not proceed with any optimization until manual action is resolved and reconsideration request submitted
- **HARD VETO:** Site is not indexed (0 pages in GSC coverage) AND robots.txt is blocking all crawlers — critical infrastructure failure; halt all other work until resolved
- **SOFT VETO:** Core Web Vitals fail all 3 metrics on mobile — content and link work will have reduced impact until technical performance is fixed; prioritize technical remediation phase before content

## Output

- **File:** `docs/seo/audits/{date}-site-audit-{domain-slug}.md`
- **Format:** Markdown

## Output Example

```yaml
# Site Audit Summary — Example Output (YAML summary)
domain: "airpurifieradvice.com"
audit_date: "2026-02-18"
pages_crawled: 247
pages_indexable: 198

critical_issues:
  - type: "Core Web Vitals — LCP"
    detail: "Mobile LCP = 5.8s (target <= 2.5s)"
    pages_affected: 198
    severity: CRITICAL
    fix: "Implement image lazy loading, upgrade hosting, enable CDN"

high_issues:
  - type: "Missing Review Schema"
    detail: "0 of 45 review pages have Review schema"
    severity: HIGH
    fix: "Implement Review + Product schema on all review pages"
  - type: "Content Cannibalization"
    detail: "12 page pairs targeting same keyword intent"
    severity: HIGH
    fix: "Consolidate or differentiate intent"

medium_issues:
  - type: "Orphan Pages"
    detail: "31 pages have 0 internal links pointing to them"
    severity: MEDIUM
    fix: "Add contextual internal links from relevant content"

link_profile:
  referring_domains: 284
  dr_distribution:
    dr_60_plus: "18%"
    dr_0_20: "34%"
  anchor_text:
    exact_match: "16%"  # OVER-OPTIMIZED — target 5-10%
    brand: "22%"
    generic: "28%"
  toxic_links_flagged: 8

eeat_score: 4/12  # LOW — critical gaps in Experience and Trust signals
affiliate_disclosure_present: false  # CRITICAL — FTC violation risk

remediation_priority:
  week_1: ["Fix Core Web Vitals", "Add affiliate disclosures", "Resolve manual action check"]
  month_1: ["Implement schema on all review pages", "Fix cannibalization", "Disavow toxic links"]
  month_3: ["Orphan pages", "E-E-A-T content improvements", "Meta optimization"]

next_step: "Run hcu-recovery-audit.md (AFF_SEO_010) if traffic drops detected"
```

---
*Squad: affiliates | Version: 1.0.0 | Created: 2026-02-18*
