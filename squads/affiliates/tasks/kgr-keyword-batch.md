# kgr-keyword-batch

## Metadata
```yaml
task_id: AFF_SEO_011
agent: niche-ops
type: analysis
complexity: low
estimated_time: "1h-2h per 50-keyword batch"
source: "Keyword Golden Ratio (KGR) — Doug Cunnington (NicheSiteProject.com), 2013-2025"
```

## Purpose
Identify a batch of 50+ KGR-compliant keywords (KGR < 0.25, volume < 250/mo) that a new or low-DR affiliate site can rank for quickly, generating early organic traffic and revenue to validate the site while the broader content and link strategy matures.

## Prerequisites
- Niche confirmed and validated (AFF_STR_001)
- Content plan (AFF_SEO_002) completed — KGR targets are supplementary to the main plan, not a replacement
- Access to a keyword volume tool: Ahrefs, Semrush, or KWFinder (for monthly volume data)
- Access to Google search (for allintitle: counts — free, no tool required)
- Note: bulk KGR calculation tools exist (e.g., KGR Calculator spreadsheets) but manual verification recommended for each batch

## Steps

1. **Generate seed keyword list** — Build 100-150 seed candidates before filtering.
   - Combine niche seed keywords with long-tail modifiers
   - Effective modifiers for KGR-range keywords:
     - Product-specific: model numbers, specific variant names, niche specifications
     - Use-case specific: "for {specific use case}", "for {specific problem}"
     - Question-based: "does {product} work", "is {product} worth it"
     - Comparison micro-niche: "{product} vs {very specific alternative}"
     - How-to micro-specific: "how to {very specific task} with {product}"
   - Target: 100-150 candidates (expect ~30-40% to pass KGR filter)

2. **Pull monthly search volume for all candidates** — Get volume data for each keyword.
   - Use Ahrefs Keyword Explorer or Semrush Keyword Magic Tool
   - Filter to keywords with volume 10-250/mo (KGR requires volume < 250/mo to be valid)
   - Discard any keyword with volume 0 (not indexed in tool = unreliable) or > 250 (fails KGR criteria)
   - Keep keywords with volume 10-250 for KGR calculation

3. **Run allintitle: count for each keyword** — Check how many Google-indexed pages use the exact keyword in their title tag.
   - Open Google and search: `allintitle:"{exact keyword phrase}"`
   - Record the number of results shown (use the "About X results" count)
   - Important: Do NOT use quotes around individual words inside allintitle — use the full phrase in quotes
   - Note: For batches of 50+, this step is time-consuming; use batch processing spreadsheet or dedicated tool

4. **Calculate KGR per keyword** — Apply the formula.
   - KGR = allintitle_count / monthly_volume
   - Example: allintitle = 40, volume = 200 → KGR = 40/200 = 0.20 (PASS)
   - Example: allintitle = 80, volume = 150 → KGR = 80/150 = 0.53 (FAIL)

5. **Apply KGR classification** — Sort all keywords by KGR tier.
   - KGR < 0.25 AND volume < 250 → GOLDEN (priority targets)
   - KGR 0.25-0.99 AND volume < 250 → FAIR (rank possible, less predictable)
   - KGR >= 1.0 → NOT KGR (do not classify as KGR target)

6. **Quality filter per GOLDEN keyword** — Before adding to the publication queue, verify each GOLDEN keyword manually.
   - Search the exact keyword in Google and review top 3 results
   - Confirm: top results are not Amazon, Wikipedia, Reddit, or Forbes product pages (these are hard to beat even with low KGR)
   - Confirm: SERP has at least 1-2 results from smaller sites (< DR 40) — indicates the niche is accessible
   - Confirm: search intent is clear and writeable (don't target ambiguous queries)

7. **Map GOLDEN keywords to content types** — Assign each passing keyword to an article type.
   - Ultra-specific product questions → FAQ article or review section
   - "Does X work for Y" → informational review post
   - Specific comparison → focused vs article
   - "How to do X with product Y" → tutorial / how-to

8. **Integrate into content plan** — Add GOLDEN keywords to the overall content plan.
   - These are published in addition to (not instead of) the main content plan
   - Recommended: publish 2-3 KGR articles per week in the first 3 months to build ranking velocity

9. **Document batch results** — Record all keywords evaluated with their KGR scores and classifications.

## Framework / Inline Structure

### KGR Formula and Classification

```
KGR FORMULA:
  KGR = allintitle:"exact keyword" count ÷ monthly search volume

CLASSIFICATION:
  GOLDEN:  KGR < 0.25  AND volume < 250  → Rank possible within 24-72 hours of indexation
  FAIR:    KGR 0.25-0.99 AND volume < 250 → Rank likely but may take days/weeks
  NOT KGR: KGR >= 1.0                    → Too competitive for KGR classification
  INVALID: volume = 0 or volume > 250    → Discard (not a KGR-eligible keyword)
```

### allintitle: Search Process

```
Step 1: Open Google.com
Step 2: Type exactly: allintitle:"your exact keyword phrase"
Step 3: Press Enter
Step 4: Note the number shown as "About X results"
  - If 0 results shown → allintitle = 0 → KGR = 0 (GOLDEN, but verify SERP intent)
  - If "No results" → keyword not in Google's index for any title → very low comp, verify intent
Step 5: Record result and move to next keyword

IMPORTANT NOTES:
  - allintitle counts fluctuate — recheck if KGR is borderline (e.g., 0.22 or 0.28)
  - Some tools (Ahrefs) include an allintitle approximation — verify manually for GOLDEN keywords
  - allintitle counts from 2024+ tend to be higher than historical counts (more indexed content)
```

### KGR Keyword Batch Spreadsheet Fields

```
| # | Keyword | Volume | allintitle | KGR | Class | Intent | SERP Check | Action |
|---|---------|--------|-----------|-----|-------|--------|-----------|--------|
| 1 | levoit core 300s for mold | 110 | 12 | 0.11 | GOLDEN | Review | Small sites rank | PUBLISH |
| 2 | best hepa purifier for 200 sq ft bedroom | 170 | 55 | 0.32 | FAIR | Commercial | Mix of big/small | CONSIDER |
| 3 | winix 5500-2 noise level | 90 | 8 | 0.09 | GOLDEN | Informational | Forum + small sites | PUBLISH |
| 4 | air purifier for kitchen smells | 320 | 95 | 0.30 | INVALID | — | — | DISCARD (vol>250) |
```

### Content Format Guide for KGR Keywords

```
KGR keyword type → Recommended format:

"[product] for [specific use]" → Dedicated mini-review or review section
  Example: "levoit core 300s for mold" → 800-1200 word focused review
  CTA: Link to full product review + affiliate link

"does [product] [action]" → FAQ/informational post
  Example: "does dyson purifier remove pollen" → 600-900 word informational
  CTA: Link to best-of roundup + related product review

"[product A] vs [specific product B]" → Comparison post
  Example: "levoit core 300s vs levoit core 400s" → 800-1500 word comparison
  CTA: Two affiliate links, recommendation table

"how to [very specific task] with [product]" → How-to guide
  Example: "how to clean levoit core 300s filter" → 600-1000 word tutorial
  CTA: Link to product review (not affiliate link in primary — keep informational)
```

### Volume Range Reality Check

```
KGR requires volume < 250/mo — this is genuinely low traffic per article.

REALISTIC EXPECTATIONS:
  Single KGR article at position 1: 30-100 clicks/month
  KGR article cluster (50 articles): 1,500-5,000 clicks/month combined
  Time to rank: 24 hours – 4 weeks after indexation (new sites may take longer)

VALUE OF KGR:
  - Early revenue validation before head terms rank (months 0-4)
  - Long-tail traffic that converts at high rate (specific intent = high purchase intent)
  - Internal link targets that pass authority to main money pages
  - Low-competition ranking → confidence + data for broader strategy

NOT a replacement for: head term strategy, high-volume best-of content, link building
```

## Veto Conditions

- **HARD VETO:** Batch produces fewer than 10 GOLDEN keywords from 100+ seeds — niche has been heavily saturated with long-tail content; KGR strategy is not viable here; skip to standard content strategy for all articles
- **SOFT VETO:** allintitle counts are trending up batch-over-batch (niche is rapidly being content-farmed) — document as WARNING, note KGR window may close within 6-12 months, prioritize batch publishing immediately

## Output

- **File:** `docs/content/{date}-kgr-batch-{niche-slug}-{batch-number}.md`
- **Format:** Markdown (keyword table + summary)

## Output Example

```yaml
# KGR Keyword Batch — Example Output (YAML summary)
niche: "best air purifiers"
batch_number: "001"
batch_date: "2026-02-18"
seeds_evaluated: 112
keywords_volume_eligible: 68  # volume 10-250
keywords_tested_allintitle: 68

results:
  golden: 24   # KGR < 0.25
  fair: 18     # KGR 0.25-0.99
  not_kgr: 26  # KGR >= 1.0

golden_sample:
  - keyword: "levoit core 300s for mold"
    volume: 110
    allintitle: 11
    kgr: 0.10
    intent: "Review — does this product address mold?"
    serp_check: "2 small sites in top 5 — accessible"
    content_type: "focused review post (800 words)"
    action: PUBLISH
  - keyword: "winix 5500-2 noise level db"
    volume: 90
    allintitle: 7
    kgr: 0.08
    intent: "Informational — spec lookup"
    serp_check: "Forum results and spec pages — no dedicated article"
    content_type: "FAQ-style informational (600 words)"
    action: PUBLISH
  - keyword: "coway ap-1512hh vs winix 5500-2"
    volume: 140
    allintitle: 23
    kgr: 0.16
    intent: "Comparison"
    serp_check: "2 small affiliate sites in top 3 — beatable"
    content_type: "comparison article (1000 words)"
    action: PUBLISH

publishing_schedule:
  week_1: 5 GOLDEN articles
  week_2: 5 GOLDEN articles
  week_3: 5 GOLDEN articles
  week_4: 5 GOLDEN articles + start batch 002

expected_traffic_24_keywords:
  min_estimate: "720 sessions/month (at avg position 1, 30 clicks/article)"
  max_estimate: "2,400 sessions/month (at avg position 1, 100 clicks/article)"

next_step: "Run batch 002 with new seed variations; monitor batch 001 rankings after indexation"
```

---
*Squad: affiliates | Version: 1.0.0 | Created: 2026-02-18*
