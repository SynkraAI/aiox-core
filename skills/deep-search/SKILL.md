---
name: deep-search
description: |
  Self-contained deep general research. WebSearch + WebFetch + Haiku workers.
  Pipeline: Query > Decompose > Parallel Search (Haiku) > Evaluate > Synthesize > Document.
  Zero external dependencies. MCPs optional.
  Salva em docs/research/{YYYY-MM-DD}-{slug}/.
  Domains: people, travel, market, products, technical, general.
---

# Deep Search

Self-contained deep research pipeline for ANY domain. Zero external dependencies.

## Quick Start

```
/deep-search "Who is Yann LeCun?"
/deep-search "Best wireless earbuds under $150 in 2026"
/deep-search "Flights from SP to Tokyo in March 2026"
```

## Activation

1. Parse query from `$ARGUMENTS` (or ask if not provided)
2. Execute 6-phase workflow
3. Save to `docs/research/{YYYY-MM-DD}-{slug}/`

**CRITICAL:**
- NEVER implement code. Redirect to @pm or @dev.
- NEVER write files outside `docs/research/`.

---

## SKILL DEFINITION

```yaml
skill:
  name: Deep Search
  id: deep-search

veto_conditions:
  - id: VETO_NO_RESULTS
    trigger: "ALL search waves return 0 results"
    action: "STOP + Report: 'No results found. Reformulate query or check connectivity.'"

  - id: VETO_IMPLEMENTATION_REQUEST
    trigger: "User asks to implement, code, create agent/skill, or deploy"
    action: "REDIRECT: 'Implementation is not my scope. Use @pm for prioritization or @dev for execution.'"
    keywords:
      - "implementa"
      - "cria o agent"
      - "cria a skill"
      - "faz o codigo"
      - "escreve o codigo"
      - "desenvolve"
      - "deploy"
      - "implement"
      - "build this"
      - "code this"

  - id: VETO_FORBIDDEN_PATH
    trigger: "Attempt to write outside docs/research/"
    action: "BLOCK + Error: 'Writing outside docs/research/ is forbidden.'"

  - id: VETO_MEDICAL_DISCLAIMER
    trigger: "Query is about medical diagnosis, treatment, or symptoms"
    action: "CONTINUE + Append disclaimer to report: 'DISCLAIMER: This is research only. Not medical advice. Always consult a qualified healthcare professional.'"
    keywords:
      - "symptoms of"
      - "treatment for"
      - "cure for"
      - "diagnose"
      - "medication"
      - "sintomas de"
      - "tratamento para"
      - "remedio para"

  - id: VETO_FINANCIAL_DISCLAIMER
    trigger: "Query is about investments, stocks, crypto, or financial decisions"
    action: "CONTINUE + Append disclaimer to report: 'DISCLAIMER: This is research only. Not financial advice. Consult a qualified financial advisor before making investment decisions.'"
    keywords:
      - "invest in"
      - "buy stock"
      - "crypto price"
      - "best investment"
      - "investir em"
      - "comprar acoes"
      - "rendimento"
      - "onde aplicar dinheiro"

constraints:
  forbidden_actions:
    - NEVER implement code, agents, skills, or production artifacts
    - NEVER create files outside docs/research/
    - NEVER write to .claude/agents/, .claude/skills/, squads/, app/, lib/

tool_hierarchy:
  search:
    1_preferred: "Exa MCP (mcp__exa__web_search_exa) - if available"
    2_fallback: "WebSearch (always available)"
    detection: "Try Exa first. If 401/429/503, set exa_available=false, use WebSearch."

  deep_read:
    only: "WebFetch with domain-specific extraction prompt (inline in worker template)"
    reference: "prompts/page-extract.md contains full examples and format documentation"
    note: "No ETL, no Bash, no external scripts. Pure WebFetch."

  workers:
    type: "general-purpose"
    model: "haiku"
    max_parallel: 5
    max_deep_reads_per_worker: 3

workflow:
  phases:

    # ──────────────────────────────────────────────
    # PHASE 1: AUTO-CLARIFY
    # ──────────────────────────────────────────────
    1_auto_clarify:
      name: "Auto-Clarification"
      model_tier: "MAIN MODEL (inline)"
      description: |
        Domain detection + pattern matching on the user query.
        Determines the research domain and if clarification is needed.

      execution: |
        1. Read user query (original text, unmodified)

        2. DOMAIN DETECTION (primary classification):
           Scan the query for domain signals:

           - PEOPLE signals: names (capitalized words), "who is", "biography",
             "career", "founder", "CEO", "author", "researcher", "profile",
             "linkedin", "social media", "net worth",
             "quem é", "biografia", "carreira", "fundador", "perfil"
             → inferred_context.domain = "people"

           - TRAVEL signals: "flight", "hotel", "trip", "travel", "visa",
             "airport", "airline", "booking", "itinerary", "route",
             city/country names with transport context, "passagem", "voo",
             "hospedagem", "viagem", "quanto custa ir", "roteiro"
             → inferred_context.domain = "travel"

           - MARKET signals: "market", "trend", "industry", "competitor",
             "market size", "TAM", "growth rate", "forecast", "valuation",
             "investment", "stock", "pricing strategy", "mercado",
             "concorrente", "setor", "quanto vale", "tendência", "previsão"
             → inferred_context.domain = "market"

           - PRODUCTS signals: "review", "best", "top", "recommend",
             "compare", "vs", "alternative", "buy", "price", "specs",
             "features", "warranty", "onde comprar", "qual melhor",
             "avaliação", "comparar", "vale a pena", "custo benefício"
             → inferred_context.domain = "products"

           - TECHNICAL signals: "code", "implement", "how to", "api",
             "bug", "error", "library", "sdk", "framework", "database",
             "deploy", "architecture", "algorithm",
             "como fazer", "como implementar", "como configurar", "erro"
             → inferred_context.domain = "technical"

           - GENERAL: No strong signals from above
             → inferred_context.domain = "general"

        3. CONFLICT RESOLUTION (when multiple domains detected):
           Count signal matches per domain. Calculate:
             domain_confidence = signal_count / total_signals_found

           PRIORITY RULES (when tie or near-tie):
           a. PEOPLE + any other → PEOPLE wins (person is primary subject)
           b. TRAVEL + PRODUCTS → TRAVEL wins (travel context dominates)
           c. MARKET + PRODUCTS → MARKET wins (analysis > specific product)
           d. TECHNICAL + PRODUCTS → ask clarification (code vs product comparison)

           IF max_confidence < 0.4 (too scattered) → ask clarification
           IF max_confidence >= 0.4 → use highest confidence domain

        4. PATTERN MATCHING (secondary enrichment):
           - Comparison keywords: "compare", "vs", "versus", "difference",
             "better", "alternative", "tradeoff", "pros and cons"
             → inferred_context.focus = "comparison"
           - Recency keywords: "latest", "new", "2024", "2025", "2026",
             "recent", "current", "trending", "hoje", "agora"
             → inferred_context.temporal = "recent"
             → Append current year to search queries
           - Location keywords: city names, country names, "near me",
             "in [place]", "local"
             → inferred_context.location = detected location

        5. DECISION:
           - IF domain detected with confidence >= 0.4 → skip clarification
           - IF ambiguous (max_confidence < 0.4) → ask ONE question:
             "Your query could be about [domain1] or [domain2]. Which focus do you prefer?"

      output: "inferred_context object {domain, focus, temporal, location, skip_clarification}"

    # ──────────────────────────────────────────────
    # PHASE 2: DECOMPOSE
    # ──────────────────────────────────────────────
    2_decompose:
      name: "Query Decomposition"
      model_tier: "MAIN MODEL"
      description: |
        Decomposes user query into exactly 5 atomic, directly searchable sub-queries.
        Uses extended thinking for deeper analysis.
        Sub-queries are domain-aware. Hard limit: 5 (one per worker).

      execution: |
        1. DEEP ANALYSIS (use extended thinking for thorough decomposition):
           - What are the REAL questions behind this query?
           - What would a domain expert want to know?
           - What gaps might standard searches miss?
           - What assumptions should be tested?

        2. DOMAIN-SPECIFIC DECOMPOSITION ANGLES:

           IF domain == "people":
             - Professional background / career timeline
             - Key achievements / contributions
             - Current role / affiliations
             - Public statements / interviews / opinions
             - Social media presence / public perception
             - Controversies or criticism (balanced view)

           IF domain == "travel":
             - Routes / connections / transport options
             - Pricing / deals / seasonal variation
             - Accommodation options by budget tier
             - Visa / documentation requirements
             - Local tips / safety / reviews
             - Best time to visit / weather

           IF domain == "market":
             - Market size and growth trajectory
             - Key players / competitive landscape
             - Recent trends / disruptions
             - Pricing dynamics / unit economics
             - Regulatory environment
             - Expert forecasts / analyst opinions

           IF domain == "products":
             - Product specifications / features comparison
             - Expert reviews (specialized sites)
             - User reviews / satisfaction ratings
             - Pricing across retailers / deals
             - Known issues / common complaints
             - Alternatives / substitutes

           IF domain == "technical":
             - Core concept / how it works
             - Implementation approaches / patterns
             - Best practices / performance benchmarks
             - Common pitfalls / gotchas
             - Expert recommendations / community consensus
             - Latest updates / breaking changes

           IF domain == "general":
             - Core facts / definition
             - Historical context / background
             - Current state / recent developments
             - Different perspectives / viewpoints
             - Practical implications
             - Expert opinions / authoritative sources

        3. GENERATE exactly 5 sub-queries that:
           - Cover ORTHOGONAL angles (not overlapping)
           - Include at least one "devil's advocate" query
           - Include at least one "expert-level" query
           - Are directly searchable (not abstract)
           - HARD LIMIT: exactly 5 (matches max_parallel workers — one worker per query)

        4. INCORPORATE inferred_context:
           - If focus=comparison → ensure queries cover both/all sides
           - If temporal=recent → add year constraints
           - If location detected → scope queries geographically

        5. OUTPUT format:
           {
             "main_topic": "string",
             "domain": "people|travel|market|products|technical|general",
             "sub_queries": ["query1", "query2", ...],
             "search_strategy": "parallel"
           }

      output: "decomposition_result JSON"

    # ──────────────────────────────────────────────
    # PHASE 3: PARALLEL SEARCH (Haiku Workers)
    # ──────────────────────────────────────────────
    3_parallel_search:
      name: "Parallel Search via Haiku Workers"
      model_tier: "HAIKU (via Task tool, general-purpose agent)"
      description: |
        Dispatches sub-queries as parallel Haiku workers.
        Each worker: WebSearch → select top URLs → WebFetch on best → return JSON.
        Max 5 workers in parallel. No external dependencies.

      execution: |
        1. PRE-CHECK MCP AVAILABILITY (main model, before dispatch):
           - Use ToolSearch("exa") to check if Exa MCP tools are loaded
             → If not found or returns error: exa_available = false
             → Do NOT burn a real API call just to test availability

        2. DISPATCH WORKERS:
           For EACH sub-query, create a Task call:

           Task(
             subagent_type: "general-purpose",
             model: "haiku",
             max_turns: 10,
             prompt: <WORKER_PROMPT>
           )

           ⚠️ PARALLEL DISPATCH IS MANDATORY:
           You MUST dispatch ALL 5 Task calls in a SINGLE message (one message, multiple tool use blocks).
           This is the #1 performance optimization. Sequential dispatch is 3-5x slower.
           Max 5 workers. One worker per sub-query.

           WORKER PROMPT TEMPLATE:
           ```
           CRITICAL: Your ENTIRE output MUST be ONLY a <research_results>JSON</research_results> block.
           No text before or after the tags. No markdown fences. No explanations. Nothing else.

           You are a research worker. Search and extract information for ONE specific query.

           QUERY: {sub_query}
           CONTEXT: {inferred_context_json}
           DOMAIN: {domain}
           MCP AVAILABILITY: exa={exa_available}

           INSTRUCTIONS:
           1. Search using the best available tool:
              - If exa available:
                → Use mcp__exa__web_search_exa(query, numResults=5)
              - Else:
                → Use WebSearch(query)

           2. From search results, select top 2-3 most relevant URLs

           3. Deep-read top 1-3 results using WebFetch with DOMAIN-SPECIFIC prompt:

              Base: "Extract information relevant to: {sub_query}"

              IF domain == "people":
                Focus: "dates, career milestones, direct quotes, current affiliations,
                        achievements with years, education background"
              IF domain == "travel":
                Focus: "prices with currency, route durations, booking platforms,
                        visa requirements, seasonal tips, accommodation with price ranges"
              IF domain == "market":
                Focus: "TAM/SAM/SOM numbers, CAGR percentages, company names with market share,
                        trend data with dates, analyst quotes with firm name"
              IF domain == "products":
                Focus: "specs with exact numbers, prices with retailer, star ratings,
                        pros/cons lists, comparison data, warranty details"
              IF domain == "technical":
                Focus: "code examples (preserve exactly), version numbers, benchmarks,
                        best practices, breaking changes, configuration details"
              IF domain == "general":
                Focus: "dates, statistics, expert opinions with attribution,
                        historical context, multiple viewpoints"

              Always append:
                "Skip: navigation, ads, generic intros.
                 Format as structured markdown with Key Findings,
                 Data Points, Expert Quotes, and Actionable Insights sections."

           4. Return results in EXACTLY this format (nothing before or after the tags):

              <research_results>
              {
                "sub_query": "the original sub-query",
                "sources": [
                  {"url": "...", "title": "...", "snippet": "first 200 chars...",
                   "credibility": "HIGH|MEDIUM|LOW", "tool_used": "WebSearch|Exa"}
                ],
                "key_findings": ["finding1 with specific data", "finding2", ...],
                "data_points": ["specific number/price/date/fact", ...],
                "expert_quotes": ["quote — author", ...]
              }
              </research_results>

           IMPORTANT:
           - Do NOT synthesize or write reports. Just search and return raw findings.
           - Be HONEST about credibility (LOW if source is generic/outdated).
           - Preserve specific data points (prices, dates, numbers) EXACTLY as found.
           - Max 3 deep reads per worker.
           ```

        3. AGGREGATE RESULTS (main model):
           - Collect all worker responses
           - Extract JSON from <research_results> tags in each Task result:
             → match = result.match(/<research_results>([\s\S]*?)<\/research_results>/)
             → IF no match: treat worker as failed (fallback below)
             → ELSE: parse JSON from match content
           - Deduplicate by URL (keep highest credibility)
           - Textual deduplication on key_findings:
             → IF two findings convey the same information → merge, cite both sources
             → ELSE → keep as separate finding
           - Build unified results with tool attribution

        4. HANDLE FAILURES:
           - For failed workers (no response or invalid JSON):
             → Log warning, execute that sub-query directly in main context
           - RULE: at least 1 successful result to proceed

      output: |
        {
          "search_results": [...],
          "tools_used": {"exa": N, "websearch": N, "webfetch": N},
          "worker_stats": {"dispatched": N, "succeeded": N, "failed": N}
        }

    # ──────────────────────────────────────────────
    # PHASE 4: EVALUATE COVERAGE
    # ──────────────────────────────────────────────
    4_evaluate_coverage:
      name: "Coverage Evaluation"
      model_tier: "HAIKU (via Task tool)"
      description: |
        Evaluates if research is complete. Decides CONTINUE or STOP.
        Max 2 waves total. Includes domain_completeness check.

      execution: |
        ⚠️ MANDATORY: This phase MUST run as Task(model: "haiku", subagent_type: "general-purpose").
        Do NOT evaluate inline in main model — delegate to Haiku to save tokens.

        1. Calculate metrics:
           - coverage_score (0-100): How well do findings answer the original query?
           - source_quality: Count HIGH/MEDIUM/LOW credibility sources
           - new_info_ratio: Estimate unique facts vs total
           - domain_completeness: Domain-specific completeness with OBJECTIVE criteria.
             Scan all key_findings and data_points from workers for evidence keywords.

             IF domain == "people":
               biography: ✓ if (birth_year OR age) AND (birthplace OR nationality) found
               career: ✓ if >= 2 roles/positions with dates or organizations found
               achievements: ✓ if >= 1 notable achievement with specifics found
               current_status: ✓ if current role/activity/location mentioned (post-2024)
               → completeness_score = (checks_passed / 4) * 100

             IF domain == "travel":
               routes: ✓ if >= 2 transport options with duration found
               pricing: ✓ if >= 2 price points with currency found
               accommodation: ✓ if >= 1 lodging option with price range found
               logistics: ✓ if visa OR documents OR health requirement mentioned
               → completeness_score = (checks_passed / 4) * 100

             IF domain == "market":
               size: ✓ if market size number (TAM/revenue/units) found
               players: ✓ if >= 2 company names with context found
               trends: ✓ if >= 1 trend with data point or date found
               forecasts: ✓ if growth rate OR projection OR analyst opinion found
               → completeness_score = (checks_passed / 4) * 100

             IF domain == "products":
               specs: ✓ if >= 2 products with technical specifications found
               reviews: ✓ if >= 1 expert review OR star rating found
               pricing: ✓ if >= 2 prices with retailer/source found
               alternatives: ✓ if >= 1 alternative or competitor mentioned
               → completeness_score = (checks_passed / 4) * 100

             IF domain == "technical":
               concept: ✓ if core explanation or definition found
               implementation: ✓ if code example OR step-by-step approach found
               best_practices: ✓ if >= 1 best practice or recommendation found
               pitfalls: ✓ if >= 1 warning, gotcha, or common mistake found
               → completeness_score = (checks_passed / 4) * 100

             IF domain == "general":
               facts: ✓ if >= 3 concrete facts with specifics found
               context: ✓ if historical or background information found
               perspectives: ✓ if >= 2 different viewpoints or sources found
               implications: ✓ if practical consequence or takeaway found
               → completeness_score = (checks_passed / 4) * 100

        2. STOPPING RULES:
           HARD STOPS (always stop):
           - wave >= 2 → "Max iterations reached"
           - coverage_score >= 80 AND high_credibility >= 3 → "Sufficient coverage"

           SOFT STOP:
           - coverage_score >= 65 AND wave >= 1 → "Acceptable coverage"
           - completeness_score >= 75 AND coverage_score >= 60 → "Domain sufficiently covered"

           MUST CONTINUE:
           - coverage_score < 50 AND wave == 1 → "Insufficient first wave"
           - completeness_score < 50 AND wave == 1 → "Domain gaps detected"

        3. IF CONTINUE:
           - Identify which domain checks FAILED (completeness_score < 100)
           - Generate 2-3 targeted gap-filling queries mapping to missing checks:

             EXAMPLES by domain:
             people, missing=[current_status]:
               → "{person name} 2026 current role news"
             travel, missing=[logistics, accommodation]:
               → "{destination} visa requirements {nationality} 2026"
               → "{destination} hotels budget mid-range luxury prices"
             market, missing=[forecasts]:
               → "{market} growth forecast 2026 2027 analyst report"
             products, missing=[alternatives]:
               → "{product category} alternatives competitors comparison"
             technical, missing=[pitfalls]:
               → "{technology} common mistakes gotchas warnings"
             general, missing=[perspectives]:
               → "{topic} criticism debate controversy different views"

           - Return to Phase 3 (search again with gap-filling queries only)

        4. IF STOP:
           - Document final score and remaining gaps

      output: |
        {
          "decision": "CONTINUE|STOP",
          "coverage_score": 0-100,
          "domain_completeness": {"checked": [...], "missing": [...]},
          "stop_reason": "reason",
          "gaps": [...],
          "next_queries": [...] (if CONTINUE)
        }

    # ──────────────────────────────────────────────
    # PHASE 5: SYNTHESIZE
    # ──────────────────────────────────────────────
    5_synthesize:
      name: "Synthesize"
      model_tier: "MAIN MODEL"
      description: |
        Consolidates all findings into a comprehensive research report.
        Report format varies by detected domain.
        Produces DOCUMENTATION ONLY, never production code.

      execution: |
        1. Review all aggregated search results and findings
        2. Identify patterns, consensus, and contradictions across sources
        3. Rank findings by evidence strength

        4. GENERATE DOMAIN-SPECIFIC REPORT:

           IF domain == "people":
             - Profile summary (who, what, where)
             - Career timeline / key milestones
             - Notable contributions / achievements
             - Public opinions / quotes
             - Online presence / social media
             - Balanced assessment (criticism included)

           IF domain == "travel":
             - Route options table (transport, duration, price range)
             - Accommodation tiers (budget / mid / luxury)
             - Logistics checklist (visa, documents, health)
             - Seasonal considerations / best time
             - Local tips from travelers
             - Budget estimate table

           IF domain == "market":
             - Market overview (size, growth, CAGR)
             - Competitive landscape table
             - Trend analysis with data points
             - SWOT or opportunity matrix
             - Expert forecasts / analyst consensus
             - Actionable opportunities

           IF domain == "products":
             - Comparison table (features, price, rating)
             - Detailed pros/cons per product
             - Best pick by use case (best overall, best budget, etc.)
             - Common complaints / known issues
             - Where to buy / best deals
             - Verdict with confidence level

           IF domain == "technical":
             - Executive summary (TL;DR)
             - Detailed findings organized by theme
             - Code examples for REFERENCE only (not production)
             - Decision matrix: when to use what
             - Practical next steps recommending @pm or @dev

           IF domain == "general":
             - Executive summary (TL;DR)
             - Background / context
             - Key findings organized by theme
             - Different perspectives / viewpoints
             - Practical implications
             - Further reading / resources

        5. ALWAYS end with:
           - "Sources" section with all referenced URLs
           - "Confidence Level" (HIGH/MEDIUM/LOW with justification)
           - "Gaps & Limitations" section
           - "Next Steps" section

      output: "Synthesized report content"

    # ──────────────────────────────────────────────
    # PHASE 6: DOCUMENT
    # ──────────────────────────────────────────────
    6_document:
      name: "Document"
      model_tier: "MAIN MODEL"
      description: "Save complete research to docs/research/"
      structure:
        folder: "docs/research/{YYYY-MM-DD}-{slug}/"
        slug_rules: "lowercase, strip accents (é→e, ã→a, ç→c), replace spaces/punctuation with hyphens, max 50 chars"
        files:
          - name: "README.md"
            content: "Index + TL;DR + domain badge"
          - name: "00-query-original.md"
            content: "Original question + inferred context + detected domain"
          - name: "01-deep-research-prompt.md"
            content: "Generated structured prompt with sub-queries"
          - name: "02-research-report.md"
            content: "Complete research findings (domain-formatted)"
          - name: "03-recommendations.md"
            content: "Recommendations and next steps (NO production code)"

security:
  - Never include API keys or secrets in research docs
  - Sanitize sensitive paths before saving
  - Validate URLs before fetching
  - NEVER write files outside docs/research/
  - NEVER create agents, skills, or production code

scope_boundaries:
  allowed_paths:
    - "docs/research/**"
  forbidden_paths:
    - ".claude/agents/"
    - ".claude/skills/"
    - "squads/"
    - "app/"
    - "lib/"
    - "src/"
    - "*.ts"
    - "*.tsx"
    - "*.js"
    - "*.py"
  exception: "Code examples within docs/research/ markdown are allowed for DOCUMENTATION only"
```

---

## Execution Flow

```
Query → Auto-Clarify (domain detection, MAIN MODEL)
                              |
              [Sub-query 1]  [Sub-query 2]  ... [Sub-query 5]
                   |              |                   |
              [Haiku GP]     [Haiku GP]          [Haiku GP]
              (search+read)  (search+read)       (search+read)
                   |              |                   |
                   +------+-------+-------+-----------+
                          |
                    Aggregate (MAIN MODEL)
                          |
                    Evaluate Coverage (HAIKU)
                      + domain_completeness
                          |
                    (coverage OK?) ── NO ──→ [Wave 2, max 2 total]
                          | YES
                          |
                    Synthesize (MAIN MODEL)
                      domain-specific format
                          |
                    Document (MAIN MODEL)
```

## Domain Detection Examples

| Query | Detected Domain | Report Format |
|-------|----------------|---------------|
| "Who is Yann LeCun?" | people | Profile + career timeline |
| "Best earbuds under $150" | products | Comparison table + verdict |
| "Flights SP to Tokyo March" | travel | Route table + budget estimate |
| "SaaS market size 2026" | market | Market overview + SWOT |
| "React Server Components" | technical | TL;DR + code examples |
| "History of coffee" | general | Background + key findings |

## What This Skill Does NOT Have

- No ETL service dependency
- No infrastructure/ references
- No squads/ references
- No Bash commands
- No custom agents (uses built-in general-purpose)
- No Python/JS scripts
- No npm dependencies
- No wave compression (max 2 waves, context is sufficient)
- No citation verification (simplifies without quality loss)
- No follow-up behavior (run again for more research)
- No Context7 (tech docs only — use tech-search for that)

## Output Structure

```
docs/research/{YYYY-MM-DD}-{slug}/
├── README.md                    # Index + TL;DR + domain badge
├── 00-query-original.md         # Original question + context + domain
├── 01-deep-research-prompt.md   # Generated prompt with sub-queries
├── 02-research-report.md        # Complete findings (domain-formatted)
└── 03-recommendations.md        # Recommendations (NO production code)
```
