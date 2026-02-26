---
name: tech-search
description: |
  Self-contained deep tech research. WebSearch + WebFetch + Haiku workers.
  Pipeline: Query > Decompose > Parallel Search (Haiku) > Evaluate > Synthesize > Document.
  Zero external dependencies. MCPs optional.
  Salva em docs/research/{YYYY-MM-DD}-{slug}/.
---

# Tech Search

Self-contained deep research pipeline. Zero external dependencies.

## Quick Start

```
/tech-search "React Server Components vs Client Components"
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
  name: Tech Search
  id: tech-search

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

  docs:
    1_preferred: "Context7 MCP (mcp__context7__resolve-library-id + query-docs) - if available"
    2_fallback: "WebSearch with 'site:{library}.dev docs' or 'site:{library}.io docs'"
    detection: "Try Context7 first. If fails, set context7_available=false."

  deep_read:
    only: "WebFetch with prompts/page-extract.md prompt"
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
        Pattern matching + technology detection on the user query.
        Determines if clarification is needed or can be skipped.

      execution: |
        1. Read user query (original text, unmodified)

        2. PATTERN MATCHING (case-insensitive):
           - Technical keywords: "code", "implement", "how to", "api", "bug",
             "error", "debug", "library", "sdk", "tutorial", "example"
             → inferred_context.focus = "technical"
           - Comparison keywords: "compare", "vs", "versus", "difference",
             "better", "alternative", "tradeoff", "pros and cons"
             → inferred_context.focus = "comparison"
           - Recency keywords: "latest", "new", "2024", "2025", "2026",
             "recent", "state of the art", "trending"
             → inferred_context.temporal = "recent"
             → Append current year to search queries

        3. TECHNOLOGY DETECTION (case-insensitive):
           Scan for known technologies:
           - Languages: JavaScript/JS, TypeScript/TS, Python, Java, Go, Rust, C#, Ruby, PHP
           - Frameworks: React, Next.js, Vue, Angular, Svelte, Express, FastAPI, Django, Flask
           - Databases: PostgreSQL, MySQL, MongoDB, Redis, Supabase, Firebase, Elasticsearch
           - AI/ML: LLM, RAG, LangChain, OpenAI, Claude, Anthropic, TensorFlow, PyTorch
           - Infra: Docker, Kubernetes, AWS, Vercel, GraphQL, REST, WebSocket
           → Collect into inferred_context.domain = [list]

        4. DECISION:
           - IF any pattern OR technology detected → skip clarification
           - IF nothing detected → ask ONE question:
             "Your query seems broad. What is the focus and technical context?"

      output: "inferred_context object {focus, temporal, domain, skip_clarification}"

    # ──────────────────────────────────────────────
    # PHASE 2: DECOMPOSE
    # ──────────────────────────────────────────────
    2_decompose:
      name: "Query Decomposition"
      model_tier: "MAIN MODEL"
      description: |
        Decomposes user query into 5-7 atomic, directly searchable sub-queries.
        Uses extended thinking for deeper analysis.

      execution: |
        ultrathink

        1. DEEP ANALYSIS (use extended thinking):
           - What are the REAL questions behind this query?
           - What would a domain expert want to know?
           - What gaps might standard searches miss?
           - What assumptions should be tested?

        2. GENERATE 5-7 sub-queries that:
           - Cover ORTHOGONAL angles (not overlapping)
           - Include at least one "devil's advocate" query
           - Include at least one "expert-level" query
           - Are directly searchable (not abstract)

        3. INCORPORATE inferred_context:
           - If focus=comparison → ensure queries cover both/all sides
           - If temporal=recent → add year constraints
           - If domain detected → scope queries to those technologies

        4. OUTPUT format:
           {
             "main_topic": "string",
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
           - Try Context7: mcp__context7__resolve-library-id for detected library
             → If fails: context7_available = false
           - Try Exa: mcp__exa__web_search_exa("test", 1)
             → If 401/429/503: exa_available = false

        2. DISPATCH WORKERS:
           For EACH sub-query, create a Task call:

           Task(
             subagent_type: "general-purpose",
             model: "haiku",
             prompt: <WORKER_PROMPT>
           )

           Dispatch ALL Task calls in a SINGLE message for parallel execution.
           Max 5 workers.

           WORKER PROMPT TEMPLATE:
           ```
           You are a research worker. Search and extract information for ONE specific query.

           QUERY: {sub_query}
           CONTEXT: {inferred_context_json}
           MCP AVAILABILITY: exa={exa_available}, context7={context7_available}

           INSTRUCTIONS:
           1. Search using the best available tool:
              - If context7 available AND query is about a specific library:
                → Use mcp__context7__resolve-library-id then mcp__context7__query-docs
              - If exa available:
                → Use mcp__exa__web_search_exa(query, numResults=5)
              - Else:
                → Use WebSearch(query)

           2. From search results, select top 2-3 most relevant URLs

           3. Deep-read top 1-3 results using WebFetch:
              - For each URL, use WebFetch with this prompt:
                "Extract technical information relevant to: {sub_query}
                 Focus on: specific facts/numbers/benchmarks, code examples (preserve exactly),
                 best practices and warnings, expert recommendations.
                 Skip: navigation, ads, generic intros.
                 Format as structured markdown with Key Findings, Code/Examples,
                 Expert Quotes, and Actionable Insights sections."

           4. Return results as JSON (no other text):
              {
                "sub_query": "the original sub-query",
                "sources": [
                  {"url": "...", "title": "...", "snippet": "first 200 chars...",
                   "credibility": "HIGH|MEDIUM|LOW", "tool_used": "WebSearch|Exa|Context7"}
                ],
                "key_findings": ["finding1 with specific data", "finding2", ...],
                "code_examples": ["```lang\ncode\n```", ...],
                "expert_quotes": ["quote — author", ...]
              }

           IMPORTANT:
           - Do NOT synthesize or write reports. Just search and return raw findings.
           - Be HONEST about credibility (LOW if source is generic/outdated).
           - Preserve code examples EXACTLY as found.
           - Max 3 deep reads per worker.
           ```

        3. AGGREGATE RESULTS (main model):
           - Collect all worker responses
           - Parse JSON from each Task result
           - Deduplicate by URL (keep highest credibility)
           - Build unified results with tool attribution

        4. HANDLE FAILURES:
           - For failed workers (no response or invalid JSON):
             → Log warning, execute that sub-query directly in main context
           - RULE: at least 1 successful result to proceed

      output: |
        {
          "search_results": [...],
          "tools_used": {"exa": N, "context7": N, "websearch": N, "webfetch": N},
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
        Max 2 waves total (simpler than tech-research's 3 waves).

      execution: |
        Wrap in Task(model: "haiku"):

        1. Calculate metrics:
           - coverage_score (0-100): How well do findings answer the original query?
           - source_quality: Count HIGH/MEDIUM/LOW credibility sources
           - new_info_ratio: Estimate unique facts vs total

        2. STOPPING RULES:
           HARD STOPS (always stop):
           - wave >= 2 → "Max iterations reached"
           - coverage_score >= 80 AND high_credibility >= 3 → "Sufficient coverage"

           SOFT STOP:
           - coverage_score >= 65 AND wave >= 1 → "Acceptable coverage"

           MUST CONTINUE:
           - coverage_score < 50 AND wave == 1 → "Insufficient first wave"

        3. IF CONTINUE:
           - Generate 2-3 targeted gap-filling queries
           - Return to Phase 3 (search again with new queries)

        4. IF STOP:
           - Document final score and remaining gaps

      output: |
        {
          "decision": "CONTINUE|STOP",
          "coverage_score": 0-100,
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
        Produces DOCUMENTATION ONLY, never production code.

      execution: |
        1. Review all aggregated search results and findings
        2. Identify patterns, consensus, and contradictions across sources
        3. Rank techniques/solutions by evidence strength
        4. Generate:
           - Executive summary (TL;DR)
           - Detailed findings organized by theme
           - Code examples for REFERENCE only (not production)
           - Decision matrix: when to use what
           - Practical next steps recommending @pm or @dev
        5. ALWAYS end with "Next Steps" section redirecting to implementation agents

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
        files:
          - name: "README.md"
            content: "Index + TL;DR"
          - name: "00-query-original.md"
            content: "Original question + inferred context"
          - name: "01-deep-research-prompt.md"
            content: "Generated structured prompt with sub-queries"
          - name: "02-research-report.md"
            content: "Complete research findings"
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
Query → Auto-Clarify → Decompose (ultrathink, MAIN MODEL)
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
                          |
                    (coverage OK?) ── NO ──→ [Wave 2, max 2 total]
                          | YES
                          |
                    Synthesize (MAIN MODEL)
                          |
                    Document (MAIN MODEL)
```

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
- No BlogDiscovery or SemanticChunker

## Output Structure

```
docs/research/{YYYY-MM-DD}-{slug}/
├── README.md                    # Index + TL;DR
├── 00-query-original.md         # Original question + context
├── 01-deep-research-prompt.md   # Generated prompt with sub-queries
├── 02-research-report.md        # Complete findings
└── 03-recommendations.md        # Recommendations (NO production code)
```
