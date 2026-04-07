# Output Structure Templates

Templates para os arquivos gerados em cada research.

---

## Estrutura de Pasta

```
docs/research/{YYYY-MM-DD}-{slug}/
├── README.md                    # Índice e TL;DR
├── 00-query-original.md         # Pergunta + contexto
├── 01-deep-research-prompt.md   # Prompt gerado
├── 02-research-report.md        # Findings completos
├── 03-recommendations.md        # Recomendações e próximos passos
└── 04-*.md, 05-*.md, ...        # Follow-up research (numerados)
```

---

## README.md

```markdown
# Research: {TITLE}

> **Data:** {DATE}
> **Tópico:** {TOPIC}
> **Status:** {STATUS}

---

## TL;DR

{SUMMARY_3_SENTENCES}

---

## Research Metadata

```yaml
coverage_score: {TOTAL_0_100}
coverage_breakdown:
  fundamentals: {SCORE_0_100}    # Core concepts, definitions
  implementation: {SCORE_0_100}  # How-to, code examples
  comparison: {SCORE_0_100}      # Alternatives, trade-offs
  best_practices: {SCORE_0_100}  # Patterns, anti-patterns
  real_world: {SCORE_0_100}      # Case studies, production
  current_state: {SCORE_0_100}   # 2025/2026 latest info
integrity_score: {SCORE_0_100}   # Citation verification score
sources:
  total: {COUNT}
  high_credibility: {COUNT}
  medium_credibility: {COUNT}
  with_dates: {COUNT}
  freshness_ratio: {PCT}         # % of sources with pub date
waves: {COUNT}
```

---

## Índice

| # | Arquivo | Descrição |
|---|---------|-----------|
| 00 | [query-original.md](./00-query-original.md) | Pergunta inicial e contexto |
| 01 | [deep-research-prompt.md](./01-deep-research-prompt.md) | Prompt estruturado |
| 02 | [research-report.md](./02-research-report.md) | Relatório completo |
| 03 | [recommendations.md](./03-recommendations.md) | Recomendações finais |

---

## Referências Principais

{TOP_5_REFERENCES}
```

---

## 00-query-original.md

```markdown
# Query Original

> **Data:** {DATE}

## Pergunta Original

> "{ORIGINAL_QUERY}"

## Contexto Inferido

- **Foco:** {FOCUS}
- **Tecnologias:** {TECHNOLOGIES}
- **Temporal:** {TEMPORAL}

## Clarificações (se houver)

{CLARIFICATIONS}
```

---

## 01-deep-research-prompt.md

```markdown
# Deep Research Prompt

> **Gerado em:** {DATE}

## Prompt Utilizado

```
{GENERATED_PROMPT}
```

## Sub-Queries Decompostas

{SUB_QUERIES_LIST}
```

---

## 02-research-report.md

```markdown
# {TITLE}

> **Relatório de Pesquisa** | {DATE}

---

## Executive Summary

{EXECUTIVE_SUMMARY}

---

## 1. Implementações Existentes

{SECTION_1}

---

## 2. Técnicas e Padrões

{SECTION_2}

---

## 3. Comparativos

{SECTION_3}

---

## 4. Riscos e Limitações

{SECTION_4}

---

## 5. Métricas e Benchmarks

{SECTION_5}

---

## Referências

{REFERENCES_WITH_URLS}
```

---

## 03-recommendations.md

**REGRAS:**
- Este arquivo é PRESCRITIVO, não descritivo. Não repetir findings de 02-research-report.md.
- Overlap com 02-research-report.md deve ser <= 20%.
- Toda ação recomendada DEVE incluir effort estimate (S/M/L/XL ou horas).
- Código que já aparece no report NÃO deve ser duplicado aqui.

```markdown
# Recomendações

> **Data:** {DATE}
> **Baseado em:** [02-research-report.md](./02-research-report.md)

---

## Decisão Recomendada

{ONE_PARAGRAPH_CLEAR_RECOMMENDATION_WITH_CONFIDENCE_LEVEL}

---

## Ranking de Alternativas

| # | Solução | Score | Effort | Quando Usar | Justificativa |
|---|---------|-------|--------|-------------|---------------|
{RANKED_SOLUTIONS_TABLE_WITH_EFFORT}

---

## Implementation Roadmap

| Fase | Ação | Effort | Owner | Timeline |
|------|------|--------|-------|----------|
| 1 | {ACTION_1} | {S/M/L/XL ou Xh} | @{owner} | {timeline} |
| 2 | {ACTION_2} | {S/M/L/XL ou Xh} | @{owner} | {timeline} |
| 3 | {ACTION_3} | {S/M/L/XL ou Xh} | @{owner} | {timeline} |

---

## Anti-Patterns

| O que NÃO fazer | Por quê | Consequência |
|------------------|---------|--------------|
{ANTI_PATTERNS_TABLE}

---

## Mapping para o Projeto

> **Seção condicional:** Incluir APENAS quando a query referencia um projeto, squad ou sistema específico.
> Mapeia findings → entidades do domínio do usuário (agentes, componentes, módulos).

| Componente do Projeto | Finding Relevante | Ação Recomendada | Effort |
|----------------------|-------------------|------------------|--------|
| {COMPONENT_1} | {FINDING} | {ACTION} | {S/M/L/XL} |
| {COMPONENT_2} | {FINDING} | {ACTION} | {S/M/L/XL} |

---

## Próximos Passos

> **IMPORTANTE:** Este documento é apenas pesquisa. Para implementação:
> - **@pm** para priorização e criação de stories
> - **@dev** para execução técnica

1. {SPECIFIC_ACTION_WITH_EFFORT} — @{owner}
2. {SPECIFIC_ACTION_WITH_EFFORT} — @{owner}
3. {SPECIFIC_ACTION_WITH_EFFORT} — @{owner}
```

---

## Follow-up Files (04-*.md, 05-*.md, ...)

Para pesquisas de follow-up no mesmo tópico:

```markdown
# Follow-up: {FOLLOWUP_TITLE}

> **Data:** {DATE}
> **Relacionado a:** [02-research-report.md](./02-research-report.md)

## Pergunta de Follow-up

> "{FOLLOWUP_QUERY}"

## Findings Adicionais

{ADDITIONAL_FINDINGS}

## Atualização das Recomendações

{UPDATED_RECOMMENDATIONS}
```

---

## Regras de Follow-up

1. **NUNCA** criar nova pasta para follow-up do mesmo tópico
2. Numerar sequencialmente: 04-*, 05-*, 06-*
3. Atualizar o README.md com novos arquivos
4. Manter referência ao arquivo original relacionado
