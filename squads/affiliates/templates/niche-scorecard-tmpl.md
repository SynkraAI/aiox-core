# Niche Scorecard — {NICHE_NAME}

> **Template:** niche-scorecard-tmpl.md
> **Version:** 1.0.0
> **Used by:** `tasks/analyze-niche.md`
> **Agent:** affiliate-strategist, seo-affiliate (Matt Diggity framework)

---

## Niche Info

| Field | Value |
|-------|-------|
| Niche | {NICHE_NAME} |
| Primary Keyword | {PRIMARY_KEYWORD} |
| Market | {MARKET} (BR / US / Global) |
| Platform Focus | {PLATFORM} (Amazon / Hotmart / ClickBank / etc.) |
| Analysis Date | {ANALYSIS_DATE} |
| Analyst | {ANALYST_AGENT} |

---

## Scoring Guide

Each dimension is scored **0–3**:

| Score | Meaning |
|-------|---------|
| 3 | Excellent — strong signal, proceed with confidence |
| 2 | Good — acceptable, minor concerns |
| 1 | Weak — proceed with caution, monitor closely |
| 0 | Disqualifying — critical red flag |

---

## Dimension 1: Commission Rate

**Weight:** High (revenue ceiling)

| Criterion | Score (0–3) | Notes |
|-----------|-------------|-------|
| Average commission rate | {D1_COMMISSION_RATE_SCORE} | {D1_COMMISSION_RATE_NOTE} |
| Cookie duration | {D1_COOKIE_SCORE} | {D1_COOKIE_NOTE} |
| Program tier / recurring | {D1_RECURRING_SCORE} | {D1_RECURRING_NOTE} |

**Subtotal D1:** {D1_SUBTOTAL} / 9

**Programs Found:**

| Program | Commission | Cookie | EPC | Notes |
|---------|-----------|--------|-----|-------|
| {PROGRAM_1} | {COMM_1} | {COOKIE_1} | {EPC_1} | {NOTE_1} |
| {PROGRAM_2} | {COMM_2} | {COOKIE_2} | {EPC_2} | {NOTE_2} |
| {PROGRAM_3} | {COMM_3} | {COOKIE_3} | {EPC_3} | {NOTE_3} |

---

## Dimension 2: Search Demand

**Weight:** High (organic traffic potential)

| Criterion | Score (0–3) | Notes |
|-----------|-------------|-------|
| Monthly search volume (primary KW) | {D2_VOLUME_SCORE} | {D2_VOLUME_NOTE} |
| Long-tail keyword availability | {D2_LONGTAIL_SCORE} | {D2_LONGTAIL_NOTE} |
| Search trend (growing/stable/declining) | {D2_TREND_SCORE} | {D2_TREND_NOTE} |

**Subtotal D2:** {D2_SUBTOTAL} / 9

**Key Keywords:**

| Keyword | Volume/mo | Difficulty | Intent | Priority |
|---------|-----------|-----------|--------|---------|
| {KW_1} | {VOL_1} | {KD_1} | {INTENT_1} | {PRIO_1} |
| {KW_2} | {VOL_2} | {KD_2} | {INTENT_2} | {PRIO_2} |
| {KW_3} | {VOL_3} | {KD_3} | {INTENT_3} | {PRIO_3} |

---

## Dimension 3: Competition (DR / Authority)

**Weight:** Medium (ease of entry)

| Criterion | Score (0–3) | Notes |
|-----------|-------------|-------|
| Average DR of top 10 results | {D3_DR_SCORE} | {D3_DR_NOTE} |
| Presence of big brand dominance | {D3_BRANDS_SCORE} | {D3_BRANDS_NOTE} |
| Content quality gap (can we win?) | {D3_QUALITY_SCORE} | {D3_QUALITY_NOTE} |

**Subtotal D3:** {D3_SUBTOTAL} / 9

**SERP Snapshot (top 3):**

| Rank | Domain | DR | Content Type | Affiliate? |
|------|--------|----|-------------|-----------|
| 1 | {DOMAIN_1} | {DR_1} | {TYPE_1} | {AFF_1} |
| 2 | {DOMAIN_2} | {DR_2} | {TYPE_2} | {AFF_2} |
| 3 | {DOMAIN_3} | {DR_3} | {TYPE_3} | {AFF_3} |

---

## Dimension 4: Seasonality

**Weight:** Medium (revenue predictability)

| Criterion | Score (0–3) | Notes |
|-----------|-------------|-------|
| Year-round demand | {D4_YEARROUND_SCORE} | {D4_YEARROUND_NOTE} |
| Peak/off-season ratio | {D4_RATIO_SCORE} | {D4_RATIO_NOTE} |
| Predictability of cycles | {D4_PREDICTABILITY_SCORE} | {D4_PREDICTABILITY_NOTE} |

**Subtotal D4:** {D4_SUBTOTAL} / 9

**Seasonal Pattern:**
- Peak months: {PEAK_MONTHS}
- Low months: {LOW_MONTHS}
- Notes: {SEASONALITY_NOTES}

---

## Dimension 5: Program Diversity

**Weight:** Medium (risk mitigation)

| Criterion | Score (0–3) | Notes |
|-----------|-------------|-------|
| Number of programs available | {D5_PROGRAMS_SCORE} | {D5_PROGRAMS_NOTE} |
| Multiple networks (not single-dep.) | {D5_NETWORKS_SCORE} | {D5_NETWORKS_NOTE} |
| Program stability / age | {D5_STABILITY_SCORE} | {D5_STABILITY_NOTE} |

**Subtotal D5:** {D5_SUBTOTAL} / 9

---

## Dimension 6: EPC Potential

**Weight:** High (actual earnings signal)

| Criterion | Score (0–3) | Notes |
|-----------|-------------|-------|
| Reported EPC by affiliates | {D6_EPC_SCORE} | {D6_EPC_NOTE} |
| Average order value | {D6_AOV_SCORE} | {D6_AOV_NOTE} |
| Conversion rate signals | {D6_CR_SCORE} | {D6_CR_NOTE} |

**Subtotal D6:** {D6_SUBTOTAL} / 9

---

## Total Score

| Dimension | Score | Max |
|-----------|-------|-----|
| D1: Commission Rate | {D1_SUBTOTAL} | 9 |
| D2: Search Demand | {D2_SUBTOTAL} | 9 |
| D3: Competition DR | {D3_SUBTOTAL} | 9 |
| D4: Seasonality | {D4_SUBTOTAL} | 9 |
| D5: Program Diversity | {D5_SUBTOTAL} | 9 |
| D6: EPC Potential | {D6_SUBTOTAL} | 9 |
| **TOTAL** | **{TOTAL_SCORE}** | **54** |
| **Normalized (x15)** | **{NORMALIZED_SCORE}** | **15** |

---

## Decision

```
[ ] GO        — Score 11–15: Proceed. Build site/content now.
[ ] SOFT GO   — Score 7–10:  Proceed with reservations. Address weak dimensions first.
[ ] NO-GO     — Score 0–6:   Do not enter. Revisit with different angle or pivot.
```

**Verdict:** {DECISION}

---

## Justificativa

**Strongest dimensions:** {STRONGEST_DIMENSIONS}

**Weakest dimensions:** {WEAKEST_DIMENSIONS}

**Key risks:**
1. {RISK_1}
2. {RISK_2}
3. {RISK_3}

**Recommended next step:** {NEXT_STEP}

> Example: "D2 (Search Demand) scores 8/9 with 45K monthly searches on primary keyword and strong long-tail availability. D3 (Competition) scores only 4/9 — top 3 results average DR 72, but content quality is thin reviews from 2021. Content gap exists. Recommend proceeding with SOFT GO, targeting long-tails first to build authority before competing for head terms."

---

*Scorecard generated by {ANALYST_AGENT} — Affiliates Squad v1.0*
*Date: {ANALYSIS_DATE} | Framework: Diggity Affiliate Lab (adapted)*
