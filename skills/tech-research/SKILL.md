---
name: tech-research
description: |
  Deep Technical Research Pipeline - Pesquisa técnica profunda com documentação completa.

  Pipeline: Query → Auto-Clarify → Decompose → Search (paralelo) → Evaluate → Synthesize → Document

  Salva em docs/research/{YYYY-MM-DD}-{slug}/ com estrutura padronizada.
  NUNCA implementa código - apenas pesquisa e documenta. Redireciona para @pm ou @dev.
version: "1.0.0"
context: conversation
agent: general-purpose
user-invocable: true
---

# Tech Research

Deep research pipeline que transforma perguntas em conhecimento documentado.

## Quick Start

```
/tech-research "como melhorar performance de queries SQL"
```

## Activation

1. Parse query dos argumentos (ou perguntar se não fornecido)
2. Execute workflow completo
3. Salve em `docs/research/{date}-{slug}/`

**CRITICAL:**
- Follow-up queries → MESMA pasta (não criar nova)
- NUNCA implementar código → Redirecionar para @pm ou @dev

## Artifact Directory

```
docs/research/{YYYY-MM-DD}-{slug}/
├── README.md                    # Índice e TL;DR
├── 00-query-original.md         # Pergunta + contexto
├── 01-deep-research-prompt.md   # Prompt gerado
├── 02-research-report.md        # Findings completos
├── 03-recommendations.md        # Recomendações (SEM código de produção)
└── 04-*.md, 05-*.md, ...        # Follow-up research
```

## Dependencies

| Type | File | Purpose |
|------|------|---------|
| Template | `templates/deep-research-prompt-template.md` | Prompt structure |
| Template | `templates/output-structure.md` | Output file formats |
| Prompt | `prompts/decompose.md` | Query decomposition |
| Prompt | `prompts/evaluate.md` | Coverage evaluation |

---

## SKILL DEFINITION

```yaml
skill:
  name: Tech Research
  id: tech-research
  icon: 🔬

veto_conditions:
  conditions:
    - id: VETO_NO_RESULTS
      trigger: "ALL search waves return 0 results (after sequential fallback)"
      action: "STOP + Report: 'Nenhum resultado encontrado. Reformule a query ou verifique conectividade.'"

    - id: VETO_IMPLEMENTATION_REQUEST
      trigger: "User asks to implement, code, create agent/skill, or deploy"
      action: "REDIRECT: 'Implementação não é meu escopo. Recomendo @pm para priorização ou @dev para execução.'"
      keywords:
        - "implementa"
        - "cria o agent"
        - "cria a skill"
        - "faz o código"
        - "escreve o código"
        - "desenvolve"
        - "deploy"
        - "põe em produção"

    - id: VETO_FORBIDDEN_PATH
      trigger: "Attempt to write outside docs/research/"
      action: "BLOCK + Error: 'Escrita fora de docs/research/ é proibida.'"

    - id: VETO_INCOMPLETE_COVERAGE
      trigger: "coverage_score < 50% after max_iterations AND no new queries available"
      action: "WARN: 'Cobertura insuficiente ({score}%). Resultados podem estar incompletos.' + Proceed with disclaimer"

constraints:
  forbidden_actions:
    - NEVER implement code, agents, skills, or any production artifacts
    - NEVER create files outside docs/research/
    - NEVER write to .claude/agents/, .claude/skills/, squads/, app/, lib/, etc.
    - If user asks to implement, respond: "Implementação não é meu escopo. Recomendo acionar @pm para priorização ou @dev para execução."

  follow_up_behavior:
    description: |
      When the user asks a follow-up question related to an ongoing research topic:
      1. DETECT if this is a follow-up (same topic, continuation, "mais sobre", "detalhe", etc.)
      2. IDENTIFY the existing research folder from the current session
      3. SAVE new findings as additional numbered files (04-*, 05-*, etc.) in the SAME folder
      4. UPDATE the README.md to include the new files
      5. NEVER create a new folder for follow-up research
    detection_keywords:
      - "mais sobre"
      - "detalhe"
      - "continue"
      - "aprofunde"
      - "follow up"
      - "follow-up"
      - "também"
      - "além disso"
      - "e sobre"
      - "agora pesquise"
      - same technology names from previous query

auto_clarification:
  description: |
    Automatic context inference from user query. Runs BEFORE clarification phase.
    Analyzes the query to detect focus, domain, and temporal context.
    If sufficient patterns are matched, skips clarification entirely.
    This section is optional - if missing, the skill falls back to the original
    3-question clarification flow (backward compatible).

  patterns:
    technical:
      description: "Keywords indicating technical/code focus"
      keywords:
        - "codigo"
        - "código"
        - "implementar"
        - "implementação"
        - "how to"
        - "como implementar"
        - "como fazer"
        - "api"
        - "bug"
        - "error"
        - "erro"
        - "debug"
        - "code"
        - "implementation"
        - "library"
        - "biblioteca"
        - "sdk"
        - "tutorial"
        - "exemplo"
        - "example"
      inferred_value:
        focus: "technical"

    comparison:
      description: "Keywords indicating comparison focus"
      keywords:
        - "compare"
        - "comparar"
        - "vs"
        - "versus"
        - "diferenca"
        - "diferença"
        - "melhor"
        - "melhor entre"
        - "qual escolher"
        - "alternativa"
        - "alternative"
        - "tradeoff"
        - "pros and cons"
      inferred_value:
        focus: "comparison"

    recent:
      description: "Keywords indicating temporal/recency focus"
      keywords:
        - "latest"
        - "novo"
        - "nova"
        - "2024"
        - "2025"
        - "2026"
        - "atual"
        - "recente"
        - "recent"
        - "new"
        - "last year"
        - "estado da arte"
        - "state of the art"
        - "trending"
      inferred_value:
        temporal: "recent"
        search_constraint: "Append current year range to search queries for freshness"

  technology_detection:
    description: |
      Common technologies to detect in queries. Case-insensitive matching.
      Handles variations (e.g., "node" matches "Node.js", "nodejs", "node.js").
      Detected technologies are set in inferred_context.domain as a list.
    technologies:
      languages:
        - { name: "JavaScript", aliases: ["javascript", "js", "ecmascript"] }
        - { name: "TypeScript", aliases: ["typescript", "ts"] }
        - { name: "Python", aliases: ["python", "py"] }
        - { name: "Java", aliases: ["java"] }
        - { name: "Go", aliases: ["go", "golang"] }
        - { name: "Rust", aliases: ["rust"] }
        - { name: "C#", aliases: ["c#", "csharp", "dotnet", ".net"] }
        - { name: "Ruby", aliases: ["ruby"] }
        - { name: "PHP", aliases: ["php"] }
        - { name: "Swift", aliases: ["swift"] }
        - { name: "Kotlin", aliases: ["kotlin"] }
      frameworks:
        - { name: "React", aliases: ["react", "reactjs", "react.js"] }
        - { name: "Next.js", aliases: ["next", "nextjs", "next.js"] }
        - { name: "Vue", aliases: ["vue", "vuejs", "vue.js"] }
        - { name: "Angular", aliases: ["angular"] }
        - { name: "Svelte", aliases: ["svelte", "sveltekit"] }
        - { name: "Express", aliases: ["express", "expressjs"] }
        - { name: "FastAPI", aliases: ["fastapi"] }
        - { name: "Django", aliases: ["django"] }
        - { name: "Flask", aliases: ["flask"] }
        - { name: "Spring", aliases: ["spring", "spring boot", "springboot"] }
        - { name: "Rails", aliases: ["rails", "ruby on rails"] }
        - { name: "Laravel", aliases: ["laravel"] }
      databases:
        - { name: "PostgreSQL", aliases: ["postgresql", "postgres", "pg"] }
        - { name: "MySQL", aliases: ["mysql"] }
        - { name: "MongoDB", aliases: ["mongodb", "mongo"] }
        - { name: "Redis", aliases: ["redis"] }
        - { name: "Memcached", aliases: ["memcached"] }
        - { name: "SQLite", aliases: ["sqlite"] }
        - { name: "Supabase", aliases: ["supabase"] }
        - { name: "Firebase", aliases: ["firebase", "firestore"] }
        - { name: "DynamoDB", aliases: ["dynamodb", "dynamo"] }
        - { name: "Elasticsearch", aliases: ["elasticsearch", "elastic"] }
      ai_ml:
        - { name: "LLM", aliases: ["llm", "llms", "large language model"] }
        - { name: "RAG", aliases: ["rag", "retrieval augmented generation"] }
        - { name: "LangChain", aliases: ["langchain"] }
        - { name: "OpenAI", aliases: ["openai", "gpt", "chatgpt"] }
        - { name: "Claude", aliases: ["claude", "anthropic"] }
        - { name: "TensorFlow", aliases: ["tensorflow", "tf"] }
        - { name: "PyTorch", aliases: ["pytorch", "torch"] }
        - { name: "Hugging Face", aliases: ["hugging face", "huggingface", "transformers"] }
      infra:
        - { name: "Docker", aliases: ["docker", "container", "containers"] }
        - { name: "Kubernetes", aliases: ["kubernetes", "k8s"] }
        - { name: "AWS", aliases: ["aws", "amazon web services"] }
        - { name: "Vercel", aliases: ["vercel"] }
        - { name: "Nginx", aliases: ["nginx"] }
        - { name: "GraphQL", aliases: ["graphql", "gql"] }
        - { name: "REST", aliases: ["rest", "restful", "rest api"] }
        - { name: "WebSocket", aliases: ["websocket", "ws", "websockets"] }

  ask_threshold:
    description: |
      Decision logic for whether to ask clarification questions.
      Based on the number of patterns matched from the query analysis.
    min_patterns_matched: 0
    rules:
      - condition: "matched_patterns >= 1 OR detected_technologies >= 1"
        action: "skip_clarification"
        description: "Sufficient context inferred. Proceed directly to prompt generation."
      - condition: "matched_patterns == 0 AND detected_technologies == 0"
        action: "ask_one_question"
        description: "Ambiguous query. Ask a single combined clarification question."
    ambiguous_terms:
      - "pesquise"
      - "sobre"
      - "quero saber"
      - "me fale"
      - "explique"
      - "o que e"
      - "o que é"
    single_question_template: |
      Sua query parece ampla. Para uma pesquisa mais precisa, me diga em uma frase:
      Qual o foco e contexto tecnico desta pesquisa?
      (Ex: "foco tecnico, usando Node.js" ou "comparacao geral entre alternativas")

workflow:
  phases:
    0_auto_clarify:
      name: "Auto-Clarificação"
      description: |
        Automatic context inference from user query. Runs BEFORE manual clarification.
        Analyzes the query against pattern lists and technology detection to build
        an inferred_context object. This phase determines whether to skip or reduce
        the manual clarification step.
      execution: |
        1. Read the user query (original text, unmodified)
        2. PATTERN MATCHING (case-insensitive):
           - Scan query against auto_clarification.patterns.technical.keywords
             → If ANY keyword matches: set inferred_context.focus = "technical"
           - Scan query against auto_clarification.patterns.comparison.keywords
             → If ANY keyword matches: set inferred_context.focus = "comparison"
           - Scan query against auto_clarification.patterns.recent.keywords
             → If ANY keyword matches: set inferred_context.temporal = "recent"
           - Note: if both technical and comparison match, comparison takes precedence
        3. TECHNOLOGY DETECTION (case-insensitive):
           - Scan query against ALL entries in auto_clarification.technology_detection.technologies
           - For each technology, check if ANY of its aliases appear in the query
           - Collect all matched technologies into inferred_context.domain = [list]
        4. COUNT matched patterns:
           - matched_patterns = number of pattern categories matched (0-3: technical, comparison, recent)
           - detected_technologies = length of inferred_context.domain list
        5. DECISION (using ask_threshold.rules):
           - IF matched_patterns >= 1 OR detected_technologies >= 1:
             → Set inferred_context.skip_clarification = true
             → Proceed directly to phase 2_generate_prompt
           - IF matched_patterns == 0 AND detected_technologies == 0:
             → Set inferred_context.skip_clarification = false
             → Proceed to phase 1_clarify (but ask only 1 question)
      output: "inferred_context object passed to subsequent phases"
      backward_compatibility: |
        If this phase fails or auto_clarification config is missing,
        fall back to the original 1_clarify phase with all 3 questions.
        The skill MUST still work without auto_clarification configured.

    1_5_decompose:
      # MODEL TIER: MAIN MODEL (Opus/Sonnet) - requires ultrathink for deep analysis
      name: "Query Decomposition (Deep Planning)"
      description: |
        Decomposes the user's research query into 5-7 atomic, directly searchable sub-queries.
        Uses extended thinking (ultrathink) for deeper analysis of the query's intent.
        Consumes the inferred_context object from Phase 0 (auto-clarification) to tailor
        sub-query generation based on detected focus, temporal context, and technology domain.
        Produces a structured JSON object with main_topic, sub_queries list, and search_strategy.
        This phase enables more targeted research by covering multiple facets of the topic
        (definitions, implementations, examples, comparisons) through parallel sub-queries.
      execution: |
        ultrathink

        1. DEEP ANALYSIS (use extended thinking):
           - What are the REAL questions behind this query?
           - What would a domain expert want to know?
           - What gaps might standard searches miss?
           - What assumptions is the user making that should be tested?
           - What related topics should be included for completeness?

        2. Read the prompt template from prompts/decompose.md

        3. Fill placeholders:
           - Replace {{QUERY}} with the user's original query text (unmodified)
           - Replace {{INFERRED_CONTEXT}} with the JSON-serialized inferred_context object from Phase 0
             Example: {"focus": "technical", "temporal": null, "domain": ["Node.js"], "skip_clarification": true}
             If inferred_context is empty or not available, use: {"focus": null, "temporal": null, "domain": [], "skip_clarification": false}

        4. Generate sub-queries that:
           - Cover ORTHOGONAL angles (not overlapping)
           - Include at least one "devil's advocate" query (challenges common assumptions)
           - Include at least one "expert-level" query (what pros would search for)

        5. Parse the JSON output and validate:
           - main_topic is a non-empty string
           - sub_queries is an array with 5-7 items
           - search_strategy is "parallel" or "sequential"

        6. Store the result as decomposition_result for use in subsequent phases
      input: "User query (original text) + inferred_context object from Phase 0"
      output: "decomposition_result JSON object (main_topic, sub_queries, search_strategy)"
      backward_compatibility: |
        If prompts/decompose.md is missing, skip this phase entirely.
        Use the original query directly in Phase 2 (generate_prompt) as before.
        The skill MUST still work without the decomposition prompt file.

    1_clarify:
      name: "Clarificação Rápida"
      description: |
        Manual clarification step. Behavior depends on auto-clarification results:
        - If inferred_context.skip_clarification == true: SKIP this phase entirely.
          All context was inferred automatically. Proceed to 2_generate_prompt.
        - If inferred_context.skip_clarification == false: Ask ONE combined question
          using the single_question_template from auto_clarification.ask_threshold.
          Do NOT ask the original 3 separate questions.
        - If auto_clarification section is missing (backward compatibility):
          Ask the original 3 questions below as before.
      original_questions:
        - "Foco: técnico (código/docs) ou geral (artigos/news)?"
        - "Requisitos de performance? (latência, recursos)"
        - "Contexto específico? (framework, linguagem, plataforma)"
      reduced_question: |
        When auto-clarification detected 0 patterns, ask ONLY this single question:
        "Sua query parece ampla. Para uma pesquisa mais precisa, me diga em uma frase:
        Qual o foco e contexto tecnico desta pesquisa?"
      output: "Respostas para refinar prompt (or inferred_context if skipped)"

    2_generate_prompt:
      name: "Gerar Prompt de Deep Research"
      description: |
        Transforma query + context em prompt estruturado.
        Uses inferred_context from Phase 0 (auto-clarification) when available:
        - inferred_context.focus → determines research angle (technical, comparison, general)
        - inferred_context.temporal → adds year constraints to searches if "recent"
        - inferred_context.domain → scopes research to specific technologies
        If manual clarification was used (Phase 1), merge those answers with inferred_context.

        When decomposition_result is available (from Phase 1.5):
        - Use decomposition_result.sub_queries to generate more targeted research prompts
        - Each sub-query becomes a focused search vector instead of a single broad query
        - decomposition_result.main_topic provides the central theme for the research prompt
        - decomposition_result.search_strategy ("parallel"|"sequential") informs execution order
        When decomposition_result is NOT available (backward compatibility):
        - Use the original single query as before (no behavior change)
      template: "deep-research-prompt-template.md"
      output: "01-deep-research-prompt.md"

    3_execute_research:
      name: "Executar Pesquisa com Tool Strategy (v3.1 - deep-researcher Workers)"
      # MODEL TIER: Orchestrator = MAIN MODEL, Workers = deep-researcher agent (Haiku)
      description: |
        Executa pesquisa usando Orchestrator-Worker pattern com deep-researcher agent.
        O modelo principal (Opus/Sonnet) orquestra: dispara sub-queries como
        deep-researcher agents paralelos via Task(subagent_type: "deep-researcher").
        Cada deep-researcher carrega seu MEMORY.md (source quality, search patterns),
        executa search + deep read + credibility scoring com conhecimento cross-session.
        Resultados agregados pelo modelo principal para síntese.
        Ver prompts/tool-strategy.md para hierarquia de ferramentas.
        Ver prompts/executor-matrix.md para classificação de operações por modelo.
      sources:
        - Exa MCP (neural search, papers, GitHub - HIGH credibility)
        - Context7 MCP (official library docs - HIGH credibility)
        - ETL Service (YouTube transcripts, blog extraction - FREE)
        - WebSearch native (fallback - always available)
      execution: |
        ## ORCHESTRATOR STEPS (MAIN MODEL - Opus/Sonnet)

        1. PRE-CHECK MCP AVAILABILITY:
           - Test Context7: mcp__context7__resolve-library-id("react", "test")
             → If fails, set context7_available = false
           - Test Exa: mcp__exa__web_search_exa("test query", 1)
             → If 401/429/503, set exa_available = false
           - Log availability for debugging

        2. DETERMINE SEARCH MODE:
           - IF decomposition_result is available AND decomposition_result.sub_queries exists:
             → queries_to_search = decomposition_result.sub_queries
           - IF decomposition_result is NOT available (backward compatibility):
             → queries_to_search = [original_user_query]

        3. DETECT SPECIAL CONTENT TYPES (per sub-query, before dispatch):

           PRE-STEP: Use url_detector Worker for any URLs found in sub-queries:
           ```bash
           echo '["url1","url2"]' | python3 .claude/skills/tech-research/scripts/url_detector.py --stdin
           ```
           This classifies URLs as youtube/github/arxiv/blog/generic BEFORE LLM dispatch.
           Use the classification to route each URL to the correct extraction method below.

           a. YOUTUBE DETECTION (type == "youtube"):
              - VideoId already extracted by url_detector (ids.id_0)
              → Use: ETL extractYouTube (FREE, 100% success)
              → CLI: node infrastructure/services/etl/bin/youtube-transcript.js {videoId}
              → Tag as: source: youtube_transcript, credibility: HIGH (1.2x)

           b. LIBRARY DETECTION (from inferred_context.domain):
              - IF context7_available AND library detected:
                → Use: mcp__context7__resolve-library-id + mcp__context7__query-docs
                → Tag as: source: official_docs, credibility: HIGH (1.3x)
              - FALLBACK: WebSearch with "site:{library}.dev docs"

           c. ACADEMIC/PDF DETECTION:
              - IF query contains: paper, research, study, arxiv, academic
              - IF exa_available:
                → Use: mcp__exa__research_paper_search(query, numResults=5)
                → Tag as: source: academic, credibility: HIGH (1.3x)
              - FALLBACK: WebSearch with "site:arxiv.org OR site:scholar.google.com"
              - FOR PDF URLs in results (*.pdf, arxiv.org/pdf/):
                → Download: curl -sL "{url}" -o /tmp/research_{slug}.pdf
                → Extract: PDFCollector.collect() (pdftotext primary, pdf-parse fallback)
                → If scanned PDF (content < 50 chars): skip, note in gaps
                → Tag as: source: pdf_extraction, credibility: HIGH (1.3x)

           d. GITHUB DETECTION:
              - IF query contains: github, repo, repository, code example
              - IF exa_available:
                → Use: mcp__exa__github_search(query, numResults=5)
                → Tag as: source: github, credibility: HIGH (1.2x)
              - FALLBACK: WebSearch with "site:github.com"

           e. GENERAL TECHNICAL QUERIES:
              - IF exa_available:
                → Use: mcp__exa__web_search_exa(query, numResults=10)
                → Tag as: source: exa_search, credibility: HIGH (1.2x)
              - FALLBACK: WebSearch(query)
                → Tag as: source: web_search, credibility: MEDIUM (1.0x)

        4. LOAD PREVIOUS WAVE CONTEXT (wave 2+ only):
           - IF this is wave 2 or later:
             → Read wave-*-summary.md files from output directory
             → These contain compressed findings from previous waves
             → Use gaps_remaining from last wave summary to focus new queries
             → DO NOT reload raw results from previous waves (they were compressed)
           - IF this is wave 1: skip this step

        5. DISPATCH SUB-QUERIES AS PARALLEL deep-researcher AGENTS:
           - For EACH sub-query in queries_to_search, create a Task call:
             ```
             Task(
               subagent_type: "deep-researcher",
               model: "haiku",
               prompt: <WORKER_PROMPT below>
             )
             ```
           - Dispatch ALL Task calls in a SINGLE message for parallel execution
           - Each deep-researcher instance:
             a. Auto-loads MEMORY.md (source quality cache, search patterns, anti-patterns)
             b. Executes search using learned patterns (WebSearch or Exa)
             c. Skips known-bad sources from Source Quality Cache
             d. Deep-reads top 1-2 results (ETL for blogs/YouTube, WebFetch for others)
             e. Scores credibility using cached domain knowledge
             f. Returns structured results as JSON

           WORKER PROMPT TEMPLATE:
           ```
           WORKER_MODE: true

           Search for this specific sub-query and return structured findings.
           Use your MEMORY.md knowledge to optimize search and skip bad sources.

           QUERY: {sub_query}
           CONTEXT: {inferred_context_json}
           MCP AVAILABILITY: {exa_available: bool, context7_available: bool}

           INSTRUCTIONS:
           1. Consult your Source Quality Cache to know which domains are reliable
           2. Search using the best available tool:
              - If exa_available: use mcp__exa__web_search_exa(query, numResults=5)
              - Else: use WebSearch(query)
           3. From results, select top 2-3 most relevant URLs (skip LOW quality domains from memory)
           4. Deep-read the top 1-2 results using ETL-first approach:
              - YouTube URLs: Bash: node infrastructure/services/etl/bin/youtube-transcript.js {videoId} --format json
              - PDF URLs (arxiv.org/pdf/, *.pdf): download with curl, extract with PDFCollector
              - Blog/Article URLs: Bash: node infrastructure/services/etl/bin/fetch-page.js {url}
                (exit code 1 = blocked domain, skip; exit 2-4 = fallback)
              - Other URLs: Bash: node infrastructure/services/etl/bin/fetch-page.js {url}
                (fallback: WebFetch only if fetch-page fails)
           5. For long content (>5000 chars): use SemanticChunker to extract only relevant sections
           6. Extract key findings from each read page
           7. Score credibility using your cached source quality knowledge

           RETURN FORMAT (JSON only, no other text):
           {
             "sub_query": "the original sub-query",
             "sources": [
               {"url": "...", "title": "...", "snippet": "...",
                "credibility": "HIGH|MEDIUM|LOW", "tool_used": "..."}
             ],
             "key_findings": ["finding1", "finding2", "..."],
             "extraction_stats": {
               "youtube": 0, "blog_etl": 0, "pdf_etl": 0, "webfetch": 0, "exa": 0, "chunked": 0, "failed": 0
             }
           }

           IMPORTANT: Do NOT update your MEMORY.md in worker mode.
           Do NOT run full pipeline (decompose/synthesize/document). Just search and return.
           ```

           BACKWARD COMPATIBILITY:
           If Task(subagent_type: "deep-researcher") fails, fall back to:
           1. Task(model: "haiku") with the same prompt (anonymous worker)
           2. Sequential execution in main context (v2 approach)

        6. AGGREGATE RESULTS (MAIN MODEL):
           - Collect all subagent responses
           - Parse JSON output from each Task result
           - Deduplicate by URL (keep highest credibility version)
           - SCORE CREDIBILITY via Worker (instead of LLM scoring):
             ```bash
             echo '[{"url":"...","title":"...","pub_date":"..."}]' | python3 .claude/skills/tech-research/scripts/credibility_scorer.py --stdin
             ```
             Use the Worker's HIGH/MEDIUM/LOW + multiplier output for source quality.
             This replaces LLM-based credibility assessment with deterministic regex patterns.
           - Build unified search_results with tool attribution
           - Combine extraction_stats across all subagents

        7. HANDLE FAILURES:
           - For each failed subagent (no response or invalid JSON):
             → Log warning: "Subagent for sub-query '{query}' failed"
             → Execute that sub-query sequentially in main context as fallback
           - For each failed MCP call within subagents:
             → Subagent should have already applied fallback chain
           - RULE: At least 1 successful result (from any subagent) to proceed

        8. Pass enriched_results to Phase 3.2 (if deep reads needed) or 3.5 (evaluate)
      output: |
        {
          "search_results": [...],
          "tools_used": {"exa": N, "context7": N, "etl": N, "websearch": N},
          "mcp_availability": {"exa": bool, "context7": bool},
          "credibility_breakdown": {"high": N, "medium": N, "low": N},
          "subagent_stats": {"dispatched": N, "succeeded": N, "failed": N, "fallback_sequential": N}
        }

    3_2_deep_read:
      name: "Deep Page Reading (ETL + WebFetch)"
      # MODEL TIER: HAIKU (via Task tool or within subagent context)
      # In v3, deep reads are typically performed WITHIN each subagent
      # during Phase 3 dispatch. This phase is used as a SUPPLEMENTAL pass
      # for the orchestrator if additional deep reads are needed after
      # subagent results are aggregated, or as FALLBACK if subagent dispatch fails.
      description: |
        For top 3-5 most relevant search results, extract full content.
        Uses ETL service for YouTube and blogs (FREE, PRIMARY), WebFetch for others.
        This provides deeper information than search snippets alone.
        In v3, most deep reads happen within Haiku subagents (Phase 3).
        This phase runs supplementally if the orchestrator needs more depth.

      execution: |
        1. IDENTIFY TOP RESULTS to read deeply:
           - Sort search_results by:
             a. Credibility level (HIGH > MEDIUM > LOW)
             b. Relevance to query (title/snippet match)
             c. Content promise (looks detailed, has code)
           - Select top 5 results (or fewer if <5 HIGH/MEDIUM available)

        2. CATEGORIZE URLS BY EXTRACTION METHOD:

           a. YOUTUBE URLS (use ETL - FREE):
              - Detect: youtube.com/watch, youtu.be/
              - Extract videoId from URL
              - Use CLI: node infrastructure/services/etl/bin/youtube-transcript.js {videoId} --format json
              - OR if Node available: ETL.extractYouTube(videoId)
              - Benefits: Free, 100% success, full transcript with timestamps

           b. PDF URLS (use ETL PDFCollector - FREE):
              - Detect: *.pdf, arxiv.org/pdf/, research papers
              - Download: curl -sL "{url}" -o /tmp/research_{slug}.pdf
              - Extract: node -e "
                const {PDFCollector} = require('./infrastructure/services/etl/collectors/pdf-collector');
                new PDFCollector().collect('/tmp/research_{slug}.pdf', '/tmp').then(r => console.log(JSON.stringify(r)));
                "
              - Benefits: FREE, pdftotext (poppler) primary, pdf-parse fallback
              - If scanned PDF (content < 50 chars): skip, note in gaps

           c. BLOG/ARTICLE URLS (use ETL CLI - FREE, PRIMARY):
              - Detect domains: dev.to, medium.com, marktechpost.com, hashnode.dev,
                hackernoon.com, freecodecamp.org/news, blog.*, *.blog.*, any article URL
              - PRIMARY: ETL fetch-page CLI:
                ```bash
                node infrastructure/services/etl/bin/fetch-page.js {url}
                ```
              - FALLBACK 1: mcp__exa__crawling(url) (if Exa available)
              - FALLBACK 2: WebFetch
              - Benefits: Platform detection (WordPress/Medium/generic), clean markdown,
                blocklist filtering (257 domains), no API costs
              - Exit code 1 = blocked domain → skip (do NOT retry with WebFetch)
              - Exit codes 2-4 → try fallbacks

           d. OTHER URLS (use ETL fetch-page PRIMARY):
              - All remaining URLs
              - PRIMARY: node infrastructure/services/etl/bin/fetch-page.js {url}
              - FALLBACK: WebFetch with prompts/page-extract.md
              - Timeout: 30s per page

        3. EXECUTE EXTRACTIONS:

           FOR YouTube URLs:
           ```bash
           # CLI method (always works)
           node infrastructure/services/etl/bin/youtube-transcript.js {videoId} --format json > /tmp/transcript_{videoId}.json
           ```

           FOR PDF URLs:
           ```bash
           curl -sL "{url}" -o /tmp/research_{slug}.pdf && node -e "
             const {PDFCollector} = require('./infrastructure/services/etl/collectors/pdf-collector');
             new PDFCollector().collect('/tmp/research_{slug}.pdf', '/tmp').then(r => console.log(JSON.stringify(r)));
           "
           ```

           FOR Blog/Article URLs (ETL CLI PRIMARY):
           ```bash
           # PRIMARY: fetch-page CLI (outputs markdown to stdout, status to stderr)
           node infrastructure/services/etl/bin/fetch-page.js {url} > /tmp/article_{slug}.md
           # JSON format with metadata:
           node infrastructure/services/etl/bin/fetch-page.js {url} --format json
           ```
           ```
           # Exit code 1 = blocked domain → skip entirely
           # Exit codes 2-4 → FALLBACK 1: mcp__exa__crawling(url) if Exa available
           #                → FALLBACK 2: WebFetch(url)
           ```

           FOR Other URLs:
           - PRIMARY: node infrastructure/services/etl/bin/fetch-page.js {url}
           - FALLBACK: Load prompts/page-extract.md + WebFetch

        3b. BLOG DISCOVERY (conditional, after initial reads):
           - IF a blog source is HIGH credibility AND covers research topic:
             → Use BlogDiscovery.discoverPosts(blogRootUrl) to find more posts
             → Filter by keyword relevance, take top 5
             → Only trigger if coverage < 70% and blog is authoritative
           - IF coverage already > 85%: skip discovery

        3c. LONG CONTENT CHUNKING (for content > 5000 chars):
           - Use SemanticChunker with strategy: paragraph (default)
           - Keep only chunks relevant to research query
           - Discard boilerplate, ads, unrelated sections

        4. EXTRACT STRUCTURED CONTENT:
           - Key findings with specific data
           - Code examples (preserved exactly, not paraphrased)
           - Expert quotes with attribution
           - For YouTube: speaker identification, timestamps for key points
           - Cross-reference notes (confirms/contradicts/adds vs other sources)

        5. HANDLE FAILURES:
           - YouTube: Should not fail (ETL has 100% success rate)
           - Blogs: Try ETL CLI (fetch-page.js) → WebFetch → skip
           - Exit code 1 = blocked domain (skip, don't retry with WebFetch)
           - Exit code 2-4 = try WebFetch fallback
           - Other: WebFetch → skip
           - Minimum 2 successful reads to proceed

        6. MERGE with search_results:
           - Enrich entries with extracted content
           - Tag extraction_method: "etl_youtube" | "etl_pdf" | "etl_blog_cli" | "webfetch"
           - Update credibility based on actual content quality

        7. Pass enriched_results to Phase 3.5 (evaluate coverage)

      tool_selection:
        youtube: "ETL.extractYouTube (FREE, 100% success)"
        blogs: "ETL fetch-page.js CLI (FREE, platform detection) → WebFetch fallback"
        docs: "WebFetch with page-extract.md prompt"
        other: "WebFetch"

      skip_when:
        - "Quick mode (*quick command)"
        - "All search results are LOW relevance"
        - "Coverage already at 80%+ from Context7/Exa alone"

      max_pages: 5
      timeout_per_page: 30000

      output: |
        {
          "enriched_results": [...],
          "extraction_stats": {
            "youtube_transcripts": N,
            "blog_etl": N,
            "webfetch": N,
            "failed": N
          }
        }

    3_5_evaluate_coverage:
      name: "Coverage Evaluation"
      # MODEL TIER: HAIKU (via Task tool)
      # Use Task(model: "haiku") for coverage evaluation to save costs.
      # Haiku is sufficient for structured scoring against defined criteria.
      # BACKWARD COMPAT: If Task(model: "haiku") fails, execute inline (main model).
      description: |
        Avalia se a pesquisa está completa. Decide: continuar buscando ou parar.
        Loop: Phase 3 (search) → Phase 3.5 (evaluate) → CONTINUE/STOP
        Uses rigorous stopping criteria based on coverage score, source quality, and diminishing returns.
        In v3, wrap evaluation in Task(model: "haiku") for cost optimization.

      execution: |
        1. Load prompts/evaluate.md for scoring framework

        2. Calculate metrics for this wave using Worker scripts:

           a. coverage_score — USE WORKER:
              ```bash
              echo '{"fundamentals":0.9,"implementation":0.7,"comparison":0.8,"best_practices":0.75,"real_world":0.6,"current_state":0.85}' | python3 .claude/skills/tech-research/scripts/coverage_calculator.py coverage
              ```
              Returns coverage_score + coverage_breakdown (6 dimensions, 0-100 each).
              IMPORTANT (Q1): Pass coverage_breakdown to Phase 5 for README metadata.

           b. source_quality — USE WORKER:
              ```bash
              echo '[{"url":"...","title":"...","pub_date":"..."}]' | python3 .claude/skills/tech-research/scripts/credibility_scorer.py --stdin
              ```
              Returns HIGH/MEDIUM/LOW counts + average_multiplier.
              Also count sources WITH pub_date vs WITHOUT (Q2 freshness).

           c. new_info_ratio — USE WORKER:
              ```bash
              python3 .claude/skills/tech-research/scripts/coverage_calculator.py newinfo --new {N} --total {M}
              ```
              - New facts = specific data points, techniques, perspectives NOT seen before
              - NOT new = same fact rephrased, same fact from different source

        3. Apply STOPPING RULES via Worker:
           ```bash
           echo '{"coverage":82,"newinfo":0.45,"wave":1,"high_sources":5}' | python3 .claude/skills/tech-research/scripts/coverage_calculator.py stop
           ```
           Returns {"decision":"CONTINUE|STOP","reason":"...","rule":"HARD_STOP|SOFT_STOP|CONTINUE"}
           Use the Worker's decision. Rules encoded in coverage_calculator.py:

           HARD STOPS (always stop):
           - wave >= 3 → "Max iterations reached"
           - coverage_score >= 85 AND high_credibility_sources >= 3 → "Sufficient quality coverage"
           - new_info_ratio < 0.10 for 2 consecutive waves → "Diminishing returns confirmed"

           SOFT STOPS (stop with caveat):
           - coverage_score >= 70 AND wave >= 2 → "Acceptable coverage achieved"
           - All high_priority gaps have failed searches → "Gaps not addressable via search"

           MUST CONTINUE:
           - coverage_score < 50 AND wave == 1 → "Insufficient first wave"
           - high_priority_gaps > 0 AND wave < 3 AND new_info_ratio > 0.15 → "Critical gaps remain addressable"

        4. IF CONTINUE:
           - Generate 2-4 targeted queries for specific gaps (not generic re-searches)
           - Use alternative phrasings if previous queries for same gap failed
           - Add specificity (versions, years, frameworks)

        5. IF STOP:
           - Document final coverage_score and any remaining gaps
           - Note if SOFT STOP (add caveat to final report)

      output: |
        {
          "decision": "CONTINUE|STOP",
          "coverage_score": 0-100,
          "new_info_ratio": 0.0-1.0,
          "high_credibility_sources": N,
          "stop_reason": "reason if STOP",
          "gaps": [...],
          "next_queries": [...] (if CONTINUE)
        }

    3_6_compress_wave:
      name: "Wave Memory Compression"
      # MODEL TIER: HAIKU (via Task tool) - structured summarization
      # BACKWARD COMPAT: If Task(haiku) fails, keep raw results in context (v2 behavior)
      description: |
        Compresses current wave results into a structured summary file.
        Runs AFTER Phase 3.5 evaluate, BEFORE next wave or synthesis.
        Solves context accumulation: waves 2+ read only summaries, not raw data.

        Pattern: Anthropic "structured note-taking" adapted for file-based persistence.
        - Wave results compressed by Haiku into ~400 token summary
        - Saved to output dir as wave-{N}-summary.md
        - Next wave reads previous summaries instead of carrying raw results
        - Phase 4 (synthesis) reads ALL wave summaries for consolidated input

      execution: |
        TRIGGER: Runs after EVERY Phase 3.5 evaluation (both CONTINUE and STOP decisions).

        1. COLLECT current wave data:
           - search_results from this wave (URLs, titles, credibility tags)
           - key_findings extracted during deep reads
           - coverage_score and gaps from Phase 3.5
           - new_info_ratio for this wave
           - extraction_stats (tools used, success/fail counts)

        2. COMPRESS via Haiku Task:
           ```
           Task(model: "haiku", prompt: <COMPRESSION_PROMPT below>)
           ```

           COMPRESSION PROMPT:
           ```
           Compress these research results into a structured summary.
           Keep ONLY information needed for synthesis. Be ruthless about cutting redundancy.

           WAVE DATA:
           {wave_results_json}

           OUTPUT FORMAT (markdown, max 400 tokens):
           ## Wave {N} Summary
           **Coverage:** {score}/100 | **New Info:** {ratio} | **Sources:** {count} HIGH, {count} MEDIUM
           **Decision:** {CONTINUE|STOP} - {reason}

           ### Key Findings (max 7, one line each)
           1. {finding with specific data point} [source_url]
           2. ...

           ### Sources (URL + credibility only)
           - {url} (HIGH|MEDIUM) - {one-line what it contributed}

           ### Gaps Remaining
           - {gap description} (priority: HIGH|MEDIUM|LOW)

           RULES:
           - Each finding MUST have a specific fact (number, name, technique) - no vague summaries
           - Deduplicate: if 3 sources say the same thing, keep the best source only
           - Preserve exact numbers, tool names, version numbers
           - Do NOT include raw page content or full extractions
           ```

        3. SAVE to output directory:
           - File: {output_dir}/wave-{N}-summary.md
           - This file persists on disk even if session context is lost

        4. CONTEXT MANAGEMENT (the key optimization):
           - After saving, the orchestrator can DISCARD raw wave results from working memory
           - For next wave: read wave-{N}-summary.md instead of carrying raw data
           - For synthesis: read ALL wave-*-summary.md files as consolidated input

        BACKWARD COMPATIBILITY:
        - If Task(haiku) fails: skip compression, keep raw results in context (v2 behavior)
        - If file write fails: keep compressed text in context variable instead
        - Phase 4 MUST work with either compressed summaries OR raw results

      output: |
        wave-{N}-summary.md saved to output directory
        ~400 tokens per wave (vs ~5000 tokens raw data per wave)
        3 waves max = ~1200 tokens total vs ~15000 tokens raw

    3_7_playwright_deep_research:
      name: "Playwright Deep Research (Multi-LLM)"
      # MODEL TIER: MAIN MODEL - requires browser automation orchestration
      # MCP DEPENDENCY: playwright (mcp__playwright__*)
      description: |
        Browser automation phase that queries multiple LLMs (Grok, Claude.ai, Gemini)
        for deep research when traditional search doesn't achieve sufficient coverage.
        Uses Playwright MCP for browser control.

        TRIGGER CONDITIONS:
        - coverage_score < 70% after wave 2 (auto-trigger)
        - User passes --deep flag (manual trigger)
        - Query contains "multiple perspectives", "compare LLMs" (pattern match)

        GRACEFUL DEGRADATION:
        - If one LLM fails, continue with others
        - Partial output is better than no output
        - Minimum 1 successful LLM for valid output

      execution: |
        1. PRE-FLIGHT CHECK:
           - Test Playwright MCP availability:
             mcp__playwright__browser_navigate(url="https://example.com")
           - If fails: log "[PLAYWRIGHT] MCP unavailable", skip this phase

        2. DETERMINE TRIGGER:
           - Check coverage_score from Phase 3.5
           - Check for --deep flag in original query
           - Check for trigger keywords in query

           IF NOT TRIGGERED: skip to Phase 4

        3. FOR EACH LLM (Grok, Claude.ai, Gemini):
           See prompts/playwright-deep-research.md for detailed workflow.

           a. NAVIGATE to LLM URL
              Tool: mcp__playwright__browser_navigate
              Args: { url: "{llm_url}" }

           b. CHECK LOGIN STATE
              Tool: mcp__playwright__browser_snapshot
              Parse: Look for login indicators (user menu, avatar)

              IF NOT LOGGED IN:
                - Screenshot for evidence
                - Record error: "Not logged in to {llm}"
                - Continue to next LLM

           c. LOCATE AND FILL CHAT INPUT
              Try selectors in order (primary, fallback_1, fallback_2)
              Tool: mcp__playwright__browser_type
              Log which selector worked

           d. SUBMIT QUERY
              Tool: mcp__playwright__browser_click
              Wait for response (poll every 2s, max 60s)

           e. EXTRACT RESPONSE
              Tool: mcp__playwright__browser_snapshot
              Parse response container text

           f. CAPTURE SCREENSHOT
              Tool: mcp__playwright__browser_take_screenshot
              Save to: {output_dir}/screenshot-{llm}.png

           g. RECORD RESULT
              {
                llm: "{llm_name}",
                success: true/false,
                response: "{text}",
                error: "{error_if_any}",
                timestamp: "{ISO_timestamp}",
                screenshot: "screenshot-{llm}.png",
                selectors_used: { input: "...", submit: "...", response: "..." }
              }

        4. AGGREGATE RESULTS:
           - Collect all LLM responses
           - Count successful vs failed
           - IF all failed: log warning, skip aggregation

        5. SYNTHESIZE COMPARISON:
           - Identify consensus points (mentioned by 2+ LLMs)
           - Identify divergent views (conflicting recommendations)
           - Generate reliability assessment

        6. GENERATE OUTPUT FILE:
           - File: {output_dir}/XX-llm-deep-research.md
           - Format: See prompts/playwright-deep-research.md for template
           - Include all screenshots as evidence

        7. UPDATE README:
           - Add new file to research folder README.md index

      config_reference: "config.yaml -> playwright_deep_research"
      prompt_reference: "prompts/playwright-deep-research.md"

      trigger_conditions:
        auto:
          - coverage_score < 0.70 after wave 2
          - confidence_score < 0.60 on key topics
        manual:
          - --deep flag in query
          - *deep command
        keywords:
          - "multiple perspectives"
          - "compare LLM views"
          - "cross-reference with LLMs"

      llm_targets:
        - name: grok
          url: https://grok.x.ai
          requires: X/Twitter login
        - name: claude
          url: https://claude.ai
          requires: Anthropic account
        - name: gemini
          url: https://gemini.google.com
          requires: Google account

      error_handling:
        not_logged_in: "Skip LLM, record error, continue with others"
        selector_not_found: "Try fallback selectors, log which worked"
        timeout: "Retry once with extended timeout, then skip"
        all_failed: "Log warning, skip phase, continue to synthesis"

      output: |
        {
          "llm_results": {
            "grok": { success: bool, response: str, ... },
            "claude": { success: bool, response: str, ... },
            "gemini": { success: bool, response: str, ... }
          },
          "consensus_points": [...],
          "divergent_points": [...],
          "screenshots": ["screenshot-grok.png", ...],
          "output_file": "XX-llm-deep-research.md"
        }

    4_synthesize:
      # MODEL TIER: MAIN MODEL (Opus/Sonnet) - requires deep reasoning for synthesis
      name: "Sintetizar"
      description: |
        Consolidar todos os findings em recomendações práticas.
        CRITICAL: Produz DOCUMENTAÇÃO ONLY, nunca código de produção.

        In v3.1+: Reads wave summary files (from Phase 3.6) instead of raw results.
        This keeps synthesis context clean and focused on key findings only.

      execution: |
        1. READ wave summaries:
           - Read ALL wave-*-summary.md files from output directory
           - If no summary files exist (backward compat): use raw results from context
           - Merge findings across waves, noting which wave provided each finding

        2. DEEP DIVE on top players/frameworks (Q8 — Depth):
           When research covers a MARKET or COMPETITIVE LANDSCAPE:
           - Identify the top 3-5 most relevant players, frameworks, or papers
           - For each, provide a dedicated subsection with:
             a. What it does (features, architecture, capabilities)
             b. What it does NOT do (limitations, gaps)
             c. Insight for the user's context (how it relates to their project/squad)
           - This prevents "mention without depth" — every key player gets proper analysis
           - If total players > 10, tier them: Tier 1 (deep analysis) vs Tier 2 (brief mention)

        3. DOMAIN-AWARE synthesis (Q9 — Context Mapping):
           When the user's query references a SPECIFIC PROJECT, SQUAD, or SYSTEM:
           - Identify the user's domain entities (e.g., agents, components, modules)
           - Map findings to those entities explicitly
           - Example: if user has agents RADAR/GATE/THESIS/SCORER/CRITIC,
             map each finding to the agent it informs
           - This bridges "what exists in the market" → "what it means for YOUR system"
           - If no domain context provided, skip this step

        4. Sintetizar em relatório completo
        5. SEMPRE terminar com "Próximos Passos" recomendando @pm ou @dev

      deliverables:
        - Lista de técnicas rankeadas
        - Deep dives nos top 3-5 players/frameworks (com limitações e insights)
        - Código de REFERÊNCIA (apenas para documentação)
        - Domain mapping (quando contexto de projeto/squad fornecido)
        - Próximos passos práticos

      output: "draft_report (internal, passed to verification)"

    4_5_verify_citations:
      # MODEL TIER: MAIN MODEL (Opus/Sonnet) - requires semantic verification
      name: "Citation Verification"
      description: |
        Verify all claims in the synthesized report have traceable sources.
        Based on Anthropic's multi-agent research pattern where a dedicated
        agent processes documents to attribute all claims to sources.

      execution: |
        1. Load prompts/verify-citations.md

        2. Extract factual claims using Worker (deterministic regex extraction):
           ```bash
           python3 .claude/skills/tech-research/scripts/claim_extractor.py extract < {output_dir}/02-research-report.md
           ```
           Returns claims with type (statistic, numeric, comparison, benchmark, ranking, market, count).
           The Worker handles regex extraction. The LLM handles semantic verification below.

        3. Match claims to sources using Worker (string matching):
           ```bash
           echo '{"claims":[...],"sources":[...]}' | python3 .claude/skills/tech-research/scripts/claim_extractor.py match
           ```
           Returns MATCHED/UNSOURCED per claim + match_score.

        4. Cross-reference each claim against search_results (LLM semantic verification):
           - For MATCHED claims: verify source actually says what we claim
           - For UNSOURCED claims: add caveat or remove
           - Check for paraphrasing that changes meaning

        4. Classify each claim:
           - VERIFIED: Source found, claim accurate
           - PARAPHRASED: Meaning slightly altered
           - MISATTRIBUTED: Source says something different
           - UNSOURCED: No source in collection
           - OUTDATED: Source older than 2 years on changing topic

        5. Calculate integrity_score:
           integrity_score = (verified + paraphrased) / total_claims * 100

        6. TAG CLAIMS WITH CONFIDENCE (Q3):
           For each factual claim in the report that includes numbers, comparisons,
           or definitive statements, add an inline confidence tag:
           - [HIGH — N sources]: Claim supported by 2+ HIGH credibility sources
           - [MEDIA — N sources]: Claim supported by 1 HIGH or 2+ MEDIUM sources
           - [LOW — N sources]: Claim supported by 1 MEDIUM or only LOW sources
           - [UNSOURCED]: No supporting source found (add caveat or remove)
           Example: "Custo estimado de $0.06-$0.12 [MEDIA — baseado em token budgets, não medição real]"
           Example: "Playwright é o padrão dominante [HIGH — 3 projetos + npm 3.1M/week]"

        7. Generate fixes:
           - IF integrity_score < 70%: Flag report as "LOW INTEGRITY - Review Required"
           - FOR each MISATTRIBUTED/UNSOURCED: Add caveat or remove
           - FOR each PARAPHRASED: Suggest rewrite

        8. Pass verified_report + integrity_score + claim counts to Phase 5 (Document)

      output: |
        {
          "integrity_score": 0-100,
          "total_claims": N,
          "verified": N,
          "issues": [...],
          "verified_report": "report with fixes applied"
        }

      skip_when:
        - "Quick mode (*quick command)"
        - "Report has fewer than 5 factual claims"

    5_document:
      # MODEL TIER: MAIN MODEL (Opus/Sonnet) - requires structured writing
      name: "Documentar"
      description: "Salvar estrutura completa com research metadata e quality indicators"
      structure:
        folder: "docs/research/{YYYY-MM-DD}-{slug}/"
        files:
          - "README.md (índice + research_metadata)"
          - "00-query-original.md"
          - "01-deep-research-prompt.md"
          - "02-research-report.md"
          - "03-recommendations.md"
      execution: |
        ## PRE-STEP: Scaffold output directory (Worker — deterministic)

        BEFORE writing any content, run the scaffold Worker to create the folder
        and stub files with correct template structure:
        ```bash
        python3 .claude/skills/tech-research/scripts/scaffold.py --slug "{slug}" --title "{title}" --query "{query}" --date {YYYY-MM-DD}
        ```
        This guarantees identical structure every time, regardless of model or session.
        The Worker is idempotent — safe to re-run (never overwrites existing files).
        After scaffolding, OVERWRITE the stub files with actual content using Write/Edit tools.

        ## QUALITY REQUIREMENTS (v4 improvements Q1-Q7)

        ### README.md — MUST include Research Metadata block (Q1+Q7)
        After the TL;DR section, include a ```yaml block with:
        - coverage_score (total 0-100)
        - coverage_breakdown with 6 dimensions from evaluate.md:
          fundamentals, implementation, comparison, best_practices, real_world, current_state
          Each scored 0-100 (convert from dimension_scores in Phase 3.5)
        - integrity_score (from Phase 4.5 citation verification, or "N/A" if skipped)
        - sources.total, sources.high_credibility, sources.medium_credibility
        - sources.with_dates (count of sources where publication date was identified)
        - sources.freshness_ratio (with_dates / total, as percentage)
        - waves (number of search waves executed)
        See templates/output-structure.md for exact format.

        ### 02-research-report.md — Claims with confidence tags + source dates (Q2+Q3)
        Factual claims that include numbers, comparisons, or definitive statements
        MUST include inline confidence tags: [HIGH — N sources], [MEDIA — N sources], [LOW — N sources]
        Example: "Orchestrator-Worker é o padrão dominante [HIGH — 3/3 projetos analisados]"
        Example: "Custo estimado de $0.06-$0.12 por pesquisa [MEDIA — baseado em token budgets, não medição real]"

        SOURCE DATES IN REFERENCES (Q2 enforcement):
        In the References section at the end of the report, EVERY source MUST include
        its publication date (year minimum, month if available) inline next to the URL.
        Format: `[Title](url) — YYYY` or `[Title](url) — YYYY-MM` or `[Title](url) — date_unknown`
        Example: `[Granted AI: 7 Tools Tested](https://grantedai.com/...) — 2026`
        Example: `[DINGO Ontology](https://dcodings.github.io/DINGO/) — 2020`
        Sources older than 24 months on fast-moving topics get an OUTDATED note.

        DEEP DIVES ON TOP PLAYERS (Q8 enforcement):
        When the research covers a MARKET, COMPETITIVE LANDSCAPE, or MULTIPLE FRAMEWORKS:
        The report MUST include dedicated subsections for the top 3-5 most relevant players.
        Each subsection follows this structure:
        ```
        ### N.N {Player/Framework Name}
        **What it does:** {features, architecture, capabilities — 2-3 sentences}
        **What it does NOT:** {limitations, gaps — 2-3 sentences}
        **Insight for this context:** {how it relates to the user's question — 1-2 sentences}
        **Source:** {URL} — {YYYY}
        ```
        If >10 players: Tier 1 (top 5, deep dive) vs Tier 2 (remaining, brief table).
        Do NOT just list players in a comparison table without individual analysis.

        ### 03-recommendations.md — No overlap + effort estimates + domain mapping (Q5+Q6+Q9)
        - DO NOT repeat findings already in 02-research-report.md (max 20% overlap)
        - Sections: Decisão Recomendada, Ranking, Implementation Roadmap, Anti-Patterns, Próximos Passos
        - Every actionable recommendation MUST include effort estimate: S (~2h), M (~4-8h), L (~2-3d), XL (~1w+)
        - Implementation Roadmap table MUST include: Fase, Ação, Effort, Owner (@pm/@dev), Timeline
        - DOMAIN MAPPING (Q9): When the user's query references a specific project/squad/system,
          add a section "Mapping para o Projeto" with this EXACT table format:

          | Componente do Projeto | Finding Relevante | Ação Recomendada | Effort |
          |----------------------|-------------------|------------------|--------|
          | {agent/component 1}  | {specific finding} | {concrete action} | S/M/L/XL |

          Example rows:
          | GATE agent | FRAPO has 16 eligibility properties | Incorporate hasHeadcount, hasCountryCode in gate checks | M (~4h) |
          | CRITIC agent | D3 SAMRE uses iterative 4-round debate | Adapt SAMRE protocol for 4-mode specialized debate | L (~2d) |

          This section bridges "what the market/research says" → "what YOUR system should do".
          If no domain context in the query, skip this section entirely.
        See templates/output-structure.md for exact format.

        ### POST-WRITE: Validate output + save metrics (Workers)

        After writing all files, run these Workers:

        1. VALIDATE OUTPUT (QG-PROD-6):
           ```bash
           python3 .claude/skills/tech-research/scripts/output_validator.py {output_dir}
           ```
           Checks: required files exist, confidence tags present, source dates in refs.
           If valid=false, fix missing files before completing.

        2. SAVE METRICS + STATE:
           ```bash
           echo '{"pipeline_id":"...","coverage_score":85,"coverage_breakdown":{...},"integrity_score":90,"sources":[...],"waves":1}' | python3 .claude/skills/tech-research/scripts/metrics_collector.py save --dir {output_dir}
           ```
           Creates metrics.yaml and pipeline-state.yaml in the output directory.
           These files are optional but recommended for baseline tracking (M6).

commands:
  - '*help' - Show available commands
  - '*research {query}' - Start full research pipeline
  - '*quick {query}' - Fast research (skip clarification)
  - '*status' - Show current research status
  - '*exit' - Exit skill

implementation_redirect:
  description: |
    When user asks to implement findings, ALWAYS redirect:
    "Implementação não é meu escopo. Meu papel é pesquisar e documentar.

    Para implementar, recomendo:
    - @pm para priorização e criação de stories
    - @dev para implementação técnica

    A documentação completa está em docs/research/{folder}/ para referência."
  trigger_phrases:
    - "implementa"
    - "cria o agent"
    - "cria a skill"
    - "faz o código"
    - "escreve o código"
    - "desenvolve"
    - "build"
    - "deploy"
    - "executa"
    - "põe em produção"

meta_prompt_template: |
  TÓPICO: "{refined_topic}"

  CONTEXTO: {context_description}

  ESCOPO:
  1. IMPLEMENTAÇÕES EXISTENTES: {scope_1}
  2. TÉCNICAS E PADRÕES: {scope_2}
  3. MELHORES PRÁTICAS: {scope_3}
  4. RISCOS E MITIGAÇÕES: {scope_4}
  5. BENCHMARKS E MÉTRICAS: {scope_5}

  REQUISITOS:
  - {requirement_1}
  - {requirement_2}
  - {requirement_3}

  FONTES A PESQUISAR:
  - GitHub: issues, repos, gists relacionados
  - Blogs técnicos: dev.to, medium, pessoais
  - Documentação oficial
  - Stack Overflow e fóruns

  RESULTADOS ESPERADOS:
  1. Lista de técnicas/soluções rankeadas
  2. Código de referência (se aplicável)
  3. Mapa de decisão: quando usar o quê
  4. Próximos passos práticos

output_structure:
  folder_pattern: "docs/research/{date}-{slug}"
  follow_up_rule: |
    For follow-up queries on the SAME topic:
    - DO NOT create a new folder
    - Save additional files as 04-*, 05-*, 06-*, etc. in the EXISTING folder
    - UPDATE the README.md to include new files
    - Maintain continuity of the research thread
  files:
    - name: "README.md"
      content: "Índice + TL;DR (updated with each follow-up)"
    - name: "00-query-original.md"
      content: "Pergunta original + clarificações"
    - name: "01-deep-research-prompt.md"
      content: "Prompt estruturado gerado"
    - name: "02-research-report.md"
      content: "Relatório completo da pesquisa"
    - name: "03-recommendations.md"
      content: "Recomendações e próximos passos (SEM código de produção)"
    - name: "04-*.md, 05-*.md, ..."
      content: "Follow-up research files (numbered sequentially)"

dependencies:
  templates:
    - deep-research-prompt-template.md
    - output-structure.md
  prompts:
    - decompose.md
    - evaluate.md
    - page-extract.md
    - tech-discovery.md
    - verify-citations.md
    - tool-strategy.md       # Exa/Context7/ETL/WebSearch hierarchy with fallbacks
    - executor-matrix.md     # Worker vs Agent classification (deterministic vs LLM)
    - playwright-deep-research.md  # NEW: Multi-LLM browser automation workflow
  config:
    - config.yaml            # NEW: Playwright deep research configuration

  infrastructure:
    etl_service: "infrastructure/services/etl/"
    etl_youtube_cli: "node infrastructure/services/etl/bin/youtube-transcript.js {videoId}"
    etl_blog_cli: "node infrastructure/services/etl/bin/fetch-page.js {url}"
    etl_blog_api: "ETLService.collectBlog(url)"

  worker_scripts:
    base_path: ".claude/skills/tech-research/scripts/"
    scripts:
      - id: scaffold
        path: ".claude/skills/tech-research/scripts/scaffold.py"
        atoms: [atm_scaffold_output]
        cli: "python3 .claude/skills/tech-research/scripts/scaffold.py --slug {slug} --title \"{title}\" --query \"{query}\" --date {YYYY-MM-DD}"
        stdin: "echo '{\"slug\":\"...\",\"title\":\"...\",\"query\":\"...\"}' | python3 .claude/skills/tech-research/scripts/scaffold.py --stdin"
        behavior: "Creates folder + 4 stub files (README, 00, 02, 03) with correct templates. Idempotent — never overwrites existing files."
      - id: url_detector
        path: ".claude/skills/tech-research/scripts/url_detector.py"
        atoms: [atm_classify_urls, atm_parse_query]
        cli: "python3 .claude/skills/tech-research/scripts/url_detector.py {url}"
        batch: "echo '[\"url1\",\"url2\"]' | python3 .claude/skills/tech-research/scripts/url_detector.py --stdin"
      - id: credibility_scorer
        path: ".claude/skills/tech-research/scripts/credibility_scorer.py"
        atoms: [atm_pattern_match]
        cli: "python3 .claude/skills/tech-research/scripts/credibility_scorer.py {url}"
        batch: "echo '[{\"url\":\"...\",\"title\":\"...\"}]' | python3 .claude/skills/tech-research/scripts/credibility_scorer.py --stdin"
      - id: coverage_calculator
        path: ".claude/skills/tech-research/scripts/coverage_calculator.py"
        atoms: [atm_calc_coverage, atm_calc_newinfo, atm_stopping_decision]
        cli_coverage: "echo '{dimensions_json}' | python3 .claude/skills/tech-research/scripts/coverage_calculator.py coverage"
        cli_newinfo: "python3 .claude/skills/tech-research/scripts/coverage_calculator.py newinfo --new {N} --total {M}"
        cli_stop: "echo '{state_json}' | python3 .claude/skills/tech-research/scripts/coverage_calculator.py stop"
      - id: metrics_collector
        path: ".claude/skills/tech-research/scripts/metrics_collector.py"
        atoms: [atm_compute_metrics, atm_save_state]
        cli_compute: "echo '{data_json}' | python3 .claude/skills/tech-research/scripts/metrics_collector.py compute"
        cli_save: "echo '{state_json}' | python3 .claude/skills/tech-research/scripts/metrics_collector.py save --dir {output_dir}"
      - id: logger
        path: ".claude/skills/tech-research/scripts/logger.py"
        atoms: [all_worker_atoms]
        cli: "python3 .claude/skills/tech-research/scripts/logger.py {atom_id} {level} {event} '{data_json}'"
        python: "from infrastructure.services.tech_research.logger import ResearchLogger"
      - id: output_validator
        path: ".claude/skills/tech-research/scripts/output_validator.py"
        atoms: [QG-PROD-6]
        cli: "python3 .claude/skills/tech-research/scripts/output_validator.py {output_dir}"
      - id: claim_extractor
        path: ".claude/skills/tech-research/scripts/claim_extractor.py"
        atoms: [atm_extract_claims, atm_match_sources]
        cli_extract: "python3 .claude/skills/tech-research/scripts/claim_extractor.py extract < {report.md}"
        cli_match: "echo '{claims_and_sources_json}' | python3 .claude/skills/tech-research/scripts/claim_extractor.py match"

  mcp_servers:
    context7:
      tools: ["mcp__context7__resolve-library-id", "mcp__context7__query-docs"]
      fallback: "WebSearch with site:{library}.dev"
    exa:
      tools: ["mcp__exa__web_search_exa", "mcp__exa__research_paper_search", "mcp__exa__github_search", "mcp__exa__crawling"]
      fallback: "WebSearch (native)"

security:
  - Never include API keys or secrets in research docs
  - Sanitize any sensitive paths before saving
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
    - "components/"
    - "*.ts"
    - "*.tsx"
    - "*.js"
    - "*.py"
  exception: "Code examples within docs/research/ markdown files are allowed for DOCUMENTATION purposes only"
```

---

## Execution Flow

### Full Flow

1. **Parse Query** → Extrai tópico da pergunta
2. **Auto-Clarify** → Detecta patterns e tecnologias automaticamente
3. **Clarify** → Apenas se necessário: 0 ou 1 pergunta
4. **Decompose** → Decompõe query em 5-7 sub-queries atômicas (com ultrathink)
5. **Generate Prompt** → Cria prompt estruturado
6. **Context7 + Search** → Busca docs oficiais via Context7, depois WebSearch paralelo
7. **Deep Read** → Lê top 5 páginas com WebFetch para extração profunda
8. **Evaluate** → Avalia cobertura com stopping criteria rigorosos (max 3 waves)
9. **Compress Wave** → Haiku comprime resultados em wave-N-summary.md (~400 tokens)
10. **Playwright Deep Research** → Se coverage < 70% OU --deep flag, consulta Grok/Claude/Gemini via browser (NEW)
11. **Synthesize** → Lê wave summaries + LLM responses, consolida em recomendações
12. **Verify Citations** → Verifica integridade de todas as citações
13. **Document** → Salva em docs/research/

### Flow Diagram (v3.1 - Orchestrator-Worker + Playwright Deep Research)

```
Query → Auto-Clarify → Decompose (ultrathink, MAIN MODEL)
                              |
              [Sub-query 1]  [Sub-query 2]  ... [Sub-query 7]
                   |              |                   |
            [deep-researcher] [deep-researcher] [deep-researcher]
            (memory+search)   (memory+search)   (memory+search)
                   |              |                   |
                   +------+-------+-------+-----------+
                          |
                    Aggregate (MAIN MODEL)
                          |
                    Evaluate Coverage (HAIKU)
                          |
                    Compress Wave (HAIKU) ──→ wave-N-summary.md
                          |
                    (coverage OK?) ───── NO ──→ Read summaries ──→ [Wave 2+]
                          | YES (or <70%)        (max 3 waves)
                          |
                    (coverage < 70% OR --deep?)
                          | YES
                          ▼
              ┌──────────────────────────────────────┐
              │   PLAYWRIGHT DEEP RESEARCH (NEW)    │
              │                                      │
              │   ┌─────┐  ┌─────────┐  ┌────────┐  │
              │   │GROK │  │CLAUDE.AI│  │ GEMINI │  │
              │   └──┬──┘  └────┬────┘  └───┬────┘  │
              │      │          │           │       │
              │      └────┬─────┴─────┬─────┘       │
              │           │           │             │
              │     Aggregate + Synthesis           │
              │           │                         │
              │   XX-llm-deep-research.md           │
              └──────────────────────────────────────┘
                          |
                    Synthesize (MAIN MODEL) ← reads wave summaries + LLM responses
                          |
                    Verify Citations (MAIN MODEL)
                          |
                       Document (MAIN MODEL)
```

### Skill File Structure

```
.claude/skills/tech-research/
├── SKILL.md              # Workflow definition (this file)
├── README.md             # Quick reference
├── config.yaml           # Playwright deep research configuration (NEW)
├── prompts/
│   ├── decompose.md      # Query decomposition (5-7 sub-queries)
│   ├── evaluate.md       # Coverage evaluation with credibility scoring
│   ├── page-extract.md   # Deep page content extraction
│   ├── tech-discovery.md # Tool/MCP/API discovery
│   ├── verify-citations.md # Citation integrity verification
│   └── playwright-deep-research.md # Multi-LLM browser automation (NEW)
└── templates/
    ├── deep-research-prompt-template.md
    └── output-structure.md
```

### Output Structure

```
docs/research/2026-02-07-{slug}/
├── README.md                    # Índice e TL;DR
├── 00-query-original.md         # Pergunta + contexto
├── 01-deep-research-prompt.md   # Prompt gerado
├── 02-research-report.md        # Findings completos
├── 03-recommendations.md        # Recomendações (SEM código produção)
└── 04-*.md, 05-*.md, ...        # Follow-up research
```
