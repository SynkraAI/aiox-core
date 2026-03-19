---
task: searchEcosystem()
responsavel: "EcosystemScout"
responsavel_type: Agente
atomic_layer: Molecule
Entrada:
  - nome: search_query
    tipo: string
    obrigatorio: true
  - nome: resource_type
    tipo: string
    obrigatorio: true
Saida:
  - nome: ecosystem_report
    tipo: markdown
    obrigatorio: true
Checklist:
  - Min 3 opcoes avaliadas
  - Rubric aplicada (5 dimensoes)
  - Trade-offs documentados
  - Integration steps claros
---

# Task: Search Ecosystem

## Metadata

- **id**: AA-T006
- **name**: search-ecosystem
- **primary_agent**: ecosystem-scout
- **trigger**: `*find-repos`, `*find-libs`, `*find-benchmarks`, `*find-mcp`, `*compare`, `*trending`
- **inputs**: query de pesquisa + tipo (framework, lib, benchmark, MCP server)
- **outputs**: Ecosystem Research Report (top 3 com rubric)

## Description

Pesquisar o ecossistema open-source para encontrar frameworks, bibliotecas, benchmarks e MCP servers que habilitam autonomia de agentes. Usar evaluation rubric de 5 dimensões para recomendar.

## Pre-conditions

- [ ] Query de pesquisa definida
- [ ] Tipo de recurso identificado (framework, lib, benchmark, MCP)

## Steps

### Step 1: Define Search Strategy

Selecionar padrão de pesquisa conforme tipo:

| Tipo | Queries Exemplo |
|------|----------------|
| Framework | `"{domain} agent framework {lang} 2025 2026"` |
| Library | `"python library {capability} for LLM agents"` |
| Benchmark | `"{domain} benchmark AI agents evaluation"` |
| MCP Server | `"MCP server {capability}"`, `"github modelcontextprotocol {capability}"` |

### Step 2: Execute Search

**Ferramentas (em ordem de preferência):**

1. `mcp__exa__web_search_exa` — pesquisa web com filtragem
2. `mcp__exa__get_code_context_exa` — código e docs técnicos
3. `mcp__exa__company_research_exa` — research de empresas/projetos
4. `WebSearch` (nativo) — fallback se Exa não disponível
5. `mcp__context7__query-docs` — docs de libs específicas

Executar min 3 queries, coletar min 5 resultados.

### Step 3: Evaluate with Rubric

Para cada resultado, avaliar nas 5 dimensões:

| Dimensão | Peso | Pergunta |
|----------|------|----------|
| Relevância | 0.30 | Resolve o problema ESPECÍFICO? |
| Saúde | 0.25 | Projeto ativo e saudável? |
| Qualidade | 0.20 | Código e docs de qualidade? |
| Compatibilidade | 0.15 | Integra com o stack do projeto? |
| Segurança | 0.10 | Boa postura de segurança? |

**Score = Σ (score_dimensão × peso)**

### Step 4: Rank and Select Top 3

Ordenar por score ponderado. Selecionar top 3:

1. **Recomendado** — melhor score geral
2. **Alternativa** — segundo melhor ou trade-off diferente
3. **Fallback** — terceira opção ou abordagem diferente

### Step 5: Generate Report

```text
## Ecosystem Research Report

### Necessidade
{query original}

### Recomendações (Top 3)

| # | Repo/Lib | Score | Stars | Lang | Última Release |
|---|----------|-------|-------|------|---------------|
| 1 | {top_1} | {score}/10 | {stars} | {lang} | {date} |
| 2 | {top_2} | {score}/10 | {stars} | {lang} | {date} |
| 3 | {top_3} | {score}/10 | {stars} | {lang} | {date} |

### Análise Detalhada

#### 1. {top_1} (Recomendado)
- **O que faz**: {description}
- **Por que recomendo**: {rationale}
- **Trade-offs**: {tradeoffs}
- **Como integrar**: {integration_steps}
- **Score por dimensão**: [tabela 5 dimensões]

#### 2. {top_2} (Alternativa)
[mesmo formato]

#### 3. {top_3} (Fallback)
[mesmo formato]

### Não Encontrado / Build Recommendation
{se nada adequado}: "Nenhuma lib adequada. Recomendo ao tool-smith construir: {spec}"
```

## Post-conditions

- [ ] Min 3 opções avaliadas
- [ ] Rubric aplicada (5 dimensões)
- [ ] Trade-offs documentados
- [ ] Integration steps claros
- [ ] Se nada encontrado: spec para tool-smith

## Quality Gate

- **QG-SCOUT**: Research Quality (advisory)
