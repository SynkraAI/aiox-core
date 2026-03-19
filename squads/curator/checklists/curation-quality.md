# Curation Quality Checklist

**Purpose:** Validate data curation output before merging with narrative
**Used by:** data-curator
**Gate:** QG-CUR (between Phase 1.5 and Phase 2 merge)

---

## Mandatory Checks (ALL must pass)

### 1. Source Verification
- [ ] Every item has a named source (publication, report, or institution)
- [ ] Every item has a date (month/year minimum)
- [ ] Every item has a URL or verifiable reference
- [ ] No source is older than 12 months (unless explicitly historical context)
- [ ] No invented or fabricated data points

### 2. Data Accuracy
- [ ] Statistics cite original source (not secondary reporting)
- [ ] Quotes are attributed to named individuals with context
- [ ] Trends are supported by at least 1 data point or report
- [ ] News items are from reputable publications

### 3. Relevance
- [ ] Every item maps to a specific topic from banco_momentos
- [ ] Suggested placement references specific moments or timestamps
- [ ] Items genuinely enrich content (not tangential filler)
- [ ] No duplicate topics covered by multiple items unnecessarily

### 4. Classification
- [ ] Every item has a type (news, statistic, trend, quote, event)
- [ ] Confidence level assigned (high, medium, low)
- [ ] Topic tags present

### 5. Structure
- [ ] `curadoria.yaml` follows template structure
- [ ] Metadata section complete (curated_for, topics, date, total_items)
- [ ] Items array populated with required fields
- [ ] by_topic index generated
- [ ] Integrations section maps items to moments

---

## Quality Checks (Should pass)

### Diversity
- [ ] At least 3 different data types represented (news, stat, trend, quote, event)
- [ ] Multiple sources used (not all from same publication)
- [ ] Mix of quantitative (stats) and qualitative (quotes, trends) data

### Enrichment Value
- [ ] Items add credibility to content claims
- [ ] At least 1 surprising or non-obvious data point (Haystack Method)
- [ ] Items could stand alone as social media content

### Integration
- [ ] Suggested placements are specific (not vague)
- [ ] Integration reasons explain WHY data fits at that point
- [ ] No conflicts between curated data and source content claims

---

## Pass Criteria

**QG-CUR PASS requires:**
- ALL mandatory checks ✓
- At least 80% of quality checks ✓

**If FAIL:**
1. Document which checks failed
2. Fix the specific issues
3. Re-run checklist
4. Only merge with narrative when all mandatory checks pass

---

## Scoring

| Category | Items | Points Each | Max |
|----------|-------|-------------|-----|
| **Mandatory: Source Verification** | 5 items | 2 pts | 10 |
| **Mandatory: Data Accuracy** | 4 items | 2 pts | 8 |
| **Mandatory: Relevance** | 4 items | 2 pts | 8 |
| **Mandatory: Classification** | 3 items | 2 pts | 6 |
| **Mandatory: Structure** | 5 items | 2 pts | 10 |
| **Quality: Diversity** | 3 items | 1 pt | 3 |
| **Quality: Enrichment Value** | 3 items | 1 pt | 3 |
| **Quality: Integration** | 3 items | 1 pt | 3 |
| **Total** | **30 items** | | **51** |

### Thresholds
- **Pass:** >= 42 points (mandatory) + >= 7/9 quality points = **>= 49 total** (mandatory perfect + 80% quality)
- **Excellent:** >= 49 points (96%) — all mandatory + nearly all quality
- **Fail:** < 42 mandatory points → **BLOCK** (any mandatory item failed = automatic block regardless of total)

> **Note:** Mandatory items are non-negotiable. A score of 51/51 with one mandatory miss is still a FAIL. Mandatory section must score 42/42 to pass the gate.

---

## Edge Cases

### Case: No relevant data found for a topic
**Signal:** After searching multiple sources, no real news/statistics/trends found that match the content's topics.
**Action:** Do NOT invent data to fill the gap. Document `no_data_found` for that topic with search terms used. Reduce total_items count accordingly. It is acceptable to return fewer items if no real data exists — quality over quantity.
**Threshold:** Mandatory checks still apply for items that ARE included. Quality Diversity check may fail if too few types — annotate with justification.

### Case: Conflicting data from different sources
**Signal:** Two reputable sources cite contradictory statistics (e.g., one says "AI market $300B" another says "$500B by 2027").
**Action:** Include BOTH with explicit noting of the discrepancy. Add `conflicting_data: true` flag. In the notes field, explain: source A says X, source B says Y, likely reason for difference (methodology, timeframe, scope). Let the content creator decide which to use.
**Threshold:** Data Accuracy mandatory check passes as long as both sources are real and cited. Quality Integration check requires that the conflict is flagged (not hidden).

### Case: Source is paywalled or access-restricted
**Signal:** Found relevant data but the source URL leads to paywalled content (WSJ, FT, Bloomberg, etc.).
**Action:** Still include the item if the data point itself is verifiable (e.g., cited in secondary sources, press releases, or summaries). Mark `source_access: "paywalled"` in the item. Provide the best available URL. If data can ONLY be found behind paywall with no secondary verification, set confidence to "low" and note the limitation.
**Threshold:** Source Verification mandatory check passes with paywalled sources IF the data point is independently verifiable. URL check passes if any URL is provided (even paywall).

### Case: Rapidly changing data (breaking news)
**Signal:** The curated data involves fast-moving topics where facts may change within hours (e.g., stock prices, election results, company announcements).
**Action:** Add `volatile: true` flag to the item. Include `data_captured_at: "{datetime}"` field. In notes, warn: "This data point may change rapidly. Verify before publishing." Confidence is capped at "medium" for volatile data regardless of source reputation.
**Threshold:** All mandatory checks apply. Data Accuracy check is evaluated at time of curation, not time of publication. Volatile flag transfers responsibility to the editor/publisher to re-verify.
