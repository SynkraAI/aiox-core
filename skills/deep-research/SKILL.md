---
name: deep-research
description: |
  Pipeline de pesquisa profunda de propósito geral. WebSearch + WebFetch + Haiku workers.
  Pipeline: Query > Decompose > Parallel Search (Haiku) > Evaluate > Synthesize > Verify Citations > Document.
  Zero dependências externas. MCPs opcionais (Exa boost).
  Salva em docs/research/{YYYY-MM-DD}-{slug}/.
  Tipos: market, people, books, strategy, competitive, industry, cultural, academic, regulatory, general.

version: 1.0.0
category: research
tags: [SKILL]
---

# Deep Research

Pipeline de pesquisa profunda de propósito geral. Transforma qualquer pergunta de pesquisa em achados estruturados, documentados e com citações verificadas.

## Quick Start

```
/deep-research "Impacto da regulação de IA na União Europeia em 2026"
/deep-research "Quem é Yann LeCun e quais suas contribuições para deep learning?"
/deep-research "Mercado de edtechs no Brasil: tamanho, players e tendências"
/deep-research "Comparação entre RAG e fine-tuning para LLMs em produção"
```

## Quando Usar

| Cenário | Exemplo |
|---------|---------|
| Pesquisa de mercado com dados e fontes | "Qual o TAM de SaaS no Brasil?" |
| Perfil profundo de pessoa/empresa | "Quem é Jensen Huang?" |
| Análise comparativa com múltiplas perspectivas | "RAG vs fine-tuning vs prompt engineering" |
| Pesquisa acadêmica/regulatória | "Estado da arte em RLHF para alignment" |
| Investigação de tendências com evidências | "Tendências de IA generativa em 2026" |
| Qualquer tema que precise de síntese profunda | "Como funciona o sistema de créditos de carbono?" |

## NÃO Usar Para

| Cenário | Alternativa |
|---------|-------------|
| Busca rápida de um fato simples | WebSearch direto |
| Pesquisa de produto/viagem/preço | `/deep-search` (domínios cotidianos) |
| Implementação de código | `@dev` ou `@architect` |
| Criação de conteúdo/copy | Squad de copywriting |
| Pesquisa que já tem resposta no codebase | `Grep` / `Read` |

> **Regra de ouro:** deep-search é para perguntas do dia a dia (pessoas, produtos, viagens). deep-research é para investigações que precisam de profundidade, múltiplas ondas e verificação de citações.

## Discovery Questions

Perguntas para fazer antes de executar. Use `AskUserQuestion`. Pule se o usuário já forneceu contexto.

1. **Qual é a pergunta de pesquisa?** — Input principal. Pode ser passada como argumento do comando.
2. **Qual o tipo de pesquisa?** — Mercado, pessoas, estratégia, competitiva, acadêmica, regulatória, etc. Se não informado, é detectado automaticamente. *(opcional)*
3. **Existe algum foco específico?** — Comparação, dados recentes, região geográfica, setor específico. *(opcional)*
4. **Qual o nível de profundidade desejado?** — Visão geral rápida (1 onda) ou investigação exaustiva (até 3 ondas). Default: automático baseado em cobertura. *(opcional)*
5. **Há fontes obrigatórias ou a evitar?** — URLs específicas para incluir, domínios a ignorar, idioma preferido dos resultados. *(opcional)*

## Pré-requisitos

| Requisito | Status | Notas |
|-----------|--------|-------|
| WebSearch | Sempre disponível | Tool nativa do Claude Code |
| WebFetch | Sempre disponível | Tool nativa do Claude Code |
| Task tool (Haiku workers) | Sempre disponível | Para workers paralelos e avaliação |
| Exa MCP | Opcional (boost) | Se disponível, usado como busca preferencial (semântica) |

**Zero dependências externas.** O pipeline funciona 100% com tools nativas.

## Activation

1. Parse query de `$ARGUMENTS` (ou perguntar se não fornecida)
2. Executar pipeline de 6 fases
3. Salvar em `docs/research/{YYYY-MM-DD}-{slug}/`

**CRITICAL:**
- NEVER implementar código. Redirecionar para `@pm` ou `@dev`.
- NEVER escrever arquivos fora de `docs/research/`.

---

## SKILL DEFINITION

```yaml
skill:
  name: Deep Research
  id: deep-research

veto_conditions:
  - id: VETO_NO_RESULTS
    trigger: "ALL search waves return 0 results"
    action: "STOP + Report: 'Nenhum resultado encontrado. Reformule a query ou verifique conectividade.'"

  - id: VETO_IMPLEMENTATION_REQUEST
    trigger: "User asks to implement, code, create agent/skill, or deploy"
    action: "REDIRECT: 'Implementação não é meu escopo. Use @pm para priorização ou @dev para execução.'"
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
    action: "BLOCK + Error: 'Escrita fora de docs/research/ é proibida.'"

  - id: VETO_MEDICAL_DISCLAIMER
    trigger: "Query is about medical diagnosis, treatment, or symptoms"
    action: "CONTINUE + Append disclaimer: 'AVISO: Isto é apenas pesquisa. Não constitui aconselhamento médico. Consulte sempre um profissional de saúde qualificado.'"
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
    action: "CONTINUE + Append disclaimer: 'AVISO: Isto é apenas pesquisa. Não constitui aconselhamento financeiro. Consulte um consultor financeiro qualificado antes de tomar decisões de investimento.'"
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
    1_preferred: "Exa MCP (mcp__exa__web_search_exa) — if available"
    2_fallback: "WebSearch (always available)"
    detection: "Try Exa first. If 401/429/503, set exa_available=false, use WebSearch."
    reference: "prompts/tool-strategy.md"

  deep_read:
    only: "WebFetch with domain-specific extraction prompt"
    reference: "prompts/tool-strategy.md contains full fallback chain"

  workers:
    type: "general-purpose"
    model: "haiku"
    max_parallel: 5
    max_deep_reads_per_worker: 3

workflow:
  phases:

    # ──────────────────────────────────────────────
    # PHASE 0: AUTO-DETECT RESEARCH TYPE
    # ──────────────────────────────────────────────
    0_auto_detect:
      name: "Auto-Detection de Tipo"
      model_tier: "MAIN MODEL (inline)"
      description: |
        Detecta automaticamente o tipo de pesquisa a partir da query.
        Tipos suportados: market, people, books, strategy, competitive,
        industry, cultural, academic, regulatory, general.

      execution: |
        1. Ler query original (texto inalterado)
        2. Classificar tipo por sinais de keywords e contexto
        3. Se ambíguo (confiança < 0.4): perguntar ao usuário
        4. Detectar contexto adicional: temporal, geográfico, foco comparativo

      output: "inferred_context {type, focus, temporal, location}"

    # ──────────────────────────────────────────────
    # PHASE 1: DECOMPOSE
    # ──────────────────────────────────────────────
    1_decompose:
      name: "Decomposição de Query"
      model_tier: "MAIN MODEL (ultrathink)"
      prompt_file: "prompts/decompose.md"
      description: |
        Decompõe a pergunta do usuário em 5-7 sub-queries atômicas e diretamente buscáveis.
        Usa extended thinking para análise profunda.
        Cada sub-query cobre um ângulo ortogonal do tema.

      execution: |
        1. Análise profunda com extended thinking
        2. Decomposição por tipo de pesquisa (market, people, academic, etc.)
        3. Gerar exatamente 5-7 sub-queries ortogonais
        4. Incluir pelo menos 1 query "advogado do diabo"
        5. Incluir pelo menos 1 query de nível especialista

      output: |
        {
          "main_topic": "string",
          "research_type": "market|people|...",
          "sub_queries": ["q1", "q2", ...],
          "search_strategy": "parallel"
        }

    # ──────────────────────────────────────────────
    # PHASE 2: GENERATE RESEARCH PROMPT
    # ──────────────────────────────────────────────
    2_generate_prompt:
      name: "Geração de Prompt de Pesquisa"
      model_tier: "MAIN MODEL"
      template_file: "templates/research-prompt-template.md"
      description: |
        Gera um prompt estruturado de pesquisa usando o template.
        Incorpora tipo detectado, contexto e requisitos específicos.
        Salvo como 01-deep-research-prompt.md no output.

    # ──────────────────────────────────────────────
    # PHASE 3: PARALLEL SEARCH (Haiku Workers)
    # ──────────────────────────────────────────────
    3_parallel_search:
      name: "Busca Paralela via Haiku Workers"
      model_tier: "HAIKU (via Task tool)"
      prompt_file: "prompts/executor-matrix.md"
      description: |
        Despacha sub-queries como workers Haiku em paralelo.
        Cada worker: WebSearch → selecionar top URLs → WebFetch nos melhores → retornar JSON.
        Máximo 5 workers em paralelo. Zero dependências externas.

      execution: |
        1. PRE-CHECK: verificar disponibilidade do Exa MCP
        2. DISPATCH: criar Task calls para cada sub-query
           ⚠️ DISPATCH PARALELO É OBRIGATÓRIO — todos os Tasks em UMA mensagem
        3. AGGREGATE: coletar respostas, extrair JSON, deduplicar por URL
        4. HANDLE FAILURES: workers falhados → executar query no modelo principal

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
      name: "Avaliação de Cobertura"
      model_tier: "HAIKU (via Task tool)"
      prompt_file: "prompts/evaluate.md"
      description: |
        Avalia se a pesquisa está completa. Decide CONTINUE ou STOP.
        Máximo 3 ondas. Usa 6 dimensões de cobertura com pesos ajustáveis por tipo.

      dimensions:
        - Fundamentals (20 pts)
        - Evidence & Data (25 pts)
        - Perspectives (15 pts)
        - Applications (20 pts)
        - Trends (10 pts)
        - Risks & Gaps (10 pts)

      stopping_rules: |
        HARD STOP: wave >= 3 OR (coverage >= 80 AND high_credibility >= 3)
        SOFT STOP: (coverage >= 65 AND wave >= 1) OR (completeness >= 75 AND coverage >= 60)
        CONTINUE: coverage < 50 AND wave == 1

    # ──────────────────────────────────────────────
    # PHASE 5: SYNTHESIZE + VERIFY
    # ──────────────────────────────────────────────
    5_synthesize:
      name: "Síntese e Verificação de Citações"
      model_tier: "MAIN MODEL"
      prompt_file: "prompts/verify-citations.md"
      description: |
        Sintetiza todos os achados em relatório estruturado.
        Verifica integridade das citações: cada claim deve ser rastreável a uma fonte.
        Classifica claims como VERIFIED, PARAPHRASED, MISATTRIBUTED, UNSOURCED ou OUTDATED.

      execution: |
        1. Sintetizar achados por dimensão de cobertura
        2. Extrair claims factuais do relatório
        3. Verificar cada claim contra fontes coletadas
        4. Calcular integrity_score: (verified + paraphrased) / total * 100
        5. Corrigir ou remover claims problemáticos

    # ──────────────────────────────────────────────
    # PHASE 6: DOCUMENT
    # ──────────────────────────────────────────────
    6_document:
      name: "Documentação Final"
      model_tier: "MAIN MODEL"
      template_file: "templates/output-structure.md"
      description: |
        Gera pasta completa em docs/research/{YYYY-MM-DD}-{slug}/ com:
        - README.md (índice + TL;DR)
        - 00-query-original.md (pergunta + contexto)
        - 01-deep-research-prompt.md (prompt gerado)
        - 02-research-report.md (relatório completo)
        - 03-recommendations.md (recomendações e próximos passos)

output_format:
  location: "docs/research/{YYYY-MM-DD}-{slug}/"
  files:
    - README.md
    - 00-query-original.md
    - 01-deep-research-prompt.md
    - 02-research-report.md
    - 03-recommendations.md
```

---

## Referências Internas

| Arquivo | Propósito |
|---------|-----------|
| `prompts/decompose.md` | Prompt de decomposição de query com decision tree e framework por tipo |
| `prompts/evaluate.md` | Framework de avaliação de cobertura com 6 dimensões e stopping rules |
| `prompts/tool-strategy.md` | Hierarquia de tools (Exa > WebSearch) e cadeia de fallback |
| `prompts/executor-matrix.md` | Classificação de operações: WORKER (determinístico) vs AGENT (LLM) |
| `prompts/verify-citations.md` | Processo de verificação de integridade de citações |
| `templates/research-prompt-template.md` | Template do prompt de pesquisa com extensões por tipo |
| `templates/output-structure.md` | Estrutura de pastas e templates dos arquivos de output |

---

## Diferença entre Deep Search e Deep Research

| Aspecto | Deep Search | Deep Research |
|---------|-------------|---------------|
| **Escopo** | Pesquisa geral do dia a dia | Investigação profunda e estruturada |
| **Domínios** | people, travel, market, products, technical | market, people, academic, strategy, regulatory, + 5 outros |
| **Ondas** | Máximo 2 | Máximo 3 |
| **Verificação** | Sem verificação formal | Citações verificadas com integrity_score |
| **Output** | Mesma pasta `docs/research/` | Mesma pasta, mas com prompt e recomendações separados |
| **Quando usar** | "Quanto custa um voo SP-Tokyo?" | "Qual o impacto da IA Act na competitividade europeia?" |
