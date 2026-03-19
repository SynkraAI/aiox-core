# Task: Run Market Scout

**Task ID:** run-scout
**Version:** 1.0
**Execution Type:** Agent
**Purpose:** Map demand, opportunities, and competitive landscape for a niche in a city
**Executor:** @market-scout
**Orchestrator:** @insight-chief
**Estimated Time:** 15-30 min

---

## Inputs

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `niche` | string | Yes | Business niche | "odontologia" |
| `city` | string | Yes | City/state | "Campinas/SP" |
| `services` | list | No | Specific services offered | ["implante", "clareamento", "ortodontia"] |
| `mode` | enum | No | `"full"` or `"quick"` | `"full"` |

---

## Preconditions

- [ ] Niche and city provided
- [ ] Exa MCP available
- [ ] Brazilian context rules loaded

---

## Steps

### Step 1: Keyword Research (P1: Pesquisa — Adolpho)
```yaml
action: research_keywords
tools: [google_autocomplete, google_ads_api, exa_mcp]
process:
  - "Seed keywords: {niche} + {city}, {services} + {city}"
  - "Expand via Google Autocomplete (10-20 variations)"
  - "Capture People Also Ask questions"
  - "Get volume, CPC, competition from Ads API"
output: "Raw keyword list with metrics"
```

### Step 2: Classify Keywords (Sheridan Big 5 + Soulo BP)
```yaml
action: classify_keywords
frameworks:
  sheridan_big5:
    - prices: "quanto custa, preço, valor"
    - problems: "problema com, dói, demora"
    - comparisons: "vs, ou, diferença entre, melhor"
    - reviews: "avaliação, opinião, vale a pena"
    - best_of: "melhor, top, recomendação"
  soulo_business_potential:
    - 0: "Sem relação com negócio"
    - 1: "Relação indireta (awareness)"
    - 2: "Relação direta (consideration)"
    - 3: "Intenção de compra clara (decision)"
output: "Keywords classified with Big 5 category + BP score"
```

### Step 3: Apply 80/20 (Marshall)
```yaml
action: apply_pareto
method:
  - "Sort keywords by volume × BP score"
  - "Identify top 20% that generate ~80% of qualified volume"
  - "Tag as '20% de ouro'"
output: "Golden 20% keywords highlighted"
```

### Step 4: Seasonality Analysis
```yaml
action: analyze_seasonality
tools: [google_trends, pytrends]
process:
  - "Check 12-month trend for top keywords"
  - "Cross with Brazilian seasonal calendar"
  - "Identify peaks and valleys"
  - "Flag upcoming opportunities"
output: "Seasonality graph + opportunity windows"
```

### Step 5: Competitive Landscape
```yaml
action: analyze_competition
tools: [brave_search, serpapi, exa_mcp]
process:
  - "SERP analysis: who ranks for golden keywords"
  - "Google Maps: top players in niche + city"
  - "Identify gaps (keywords nobody targets)"
  - "Apply 80/20: who are the 20% dominants"
output: "Competitive map with gaps"
```

### Step 6: Awareness Level Classification (Schwartz)
```yaml
action: classify_awareness
framework: "schwartz_5_levels"
method:
  - "Analyze dominant keyword types"
  - "Check People Also Ask patterns"
  - "Classify market in 1 of 5 levels"
levels:
  - unaware: "Doesn't know the problem exists"
  - problem_aware: "Knows problem, not solution"
  - solution_aware: "Knows solutions, comparing"
  - product_aware: "Knows product, undecided"
  - most_aware: "Ready to buy"
output: "Awareness level + strategic implication"
```

### Step 7: Opportunity Mapping (Kiso + Hormozi)
```yaml
action: map_opportunities
frameworks:
  kiso_unbound:
    - "Classify each opportunity: Inbound / Outbound / Referência / Conteúdo"
  hormozi_value_equation:
    - "For top opportunities: (Dream Outcome × Likelihood) / (Time × Effort)"
  hormozi_core_four:
    - "Match budget to channel: Content, Outreach, Ads, Referrals"
output: "Opportunities classified by channel + value"
```

### Step 8: Prioritize by ROI (Ellis ICE + Marshall 80/20)
```yaml
action: prioritize
framework: "ellis_ice"
process:
  - "Score each opportunity: Impact (1-10) × Confidence (1-10) × Ease (1-10)"
  - "ICE = (I + C + E) / 3"
  - "Sort descending"
  - "Cross with 80/20: highlight quick wins"
output: "Prioritized opportunity map"
```

### Step 9: Generate Map
```yaml
action: generate_output
format: "Structured markdown with tables"
sections:
  - demand_overview (keywords, Big 5, BP scores, 80/20)
  - seasonality (graph + windows)
  - competitive_landscape (players, gaps)
  - awareness_level (classification + implication)
  - opportunities_prioritized (ICE scores, channels)
  - quick_wins (top 3 high-impact low-effort)
```

---

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| Opportunity Map | Markdown + tables | Complete market analysis |
| Keywords | Table | Scored and classified keywords |
| ICE scores | Table | Prioritized opportunities |
| Quick wins | List | Top 3 actions |

---

## Veto Conditions

- Keywords without BP score → REJECT
- No Brazilian context applied → REJECT
- Prioritization by volume only (not ROI) → REJECT
- Missing seasonality → REJECT
- Text-only output (no tables) → REJECT

---

## Acceptance Criteria

- [ ] Keywords mapped with Big 5 + Business Potential Score
- [ ] 80/20 applied — golden keywords identified
- [ ] Seasonality crossed with Brazilian calendar
- [ ] Competitive landscape mapped
- [ ] Awareness level classified (Schwartz)
- [ ] Opportunities with ICE score
- [ ] Channels classified by Unbound framework
- [ ] Quick wins identified
- [ ] Output in structured table format

---

## Handoff

→ Return to @insight-chief for QA checkpoint (IN-QA-002)
