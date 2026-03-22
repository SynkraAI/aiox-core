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

```markdown
# Recomendações

> **Data:** {DATE}

---

## Ranking de Soluções

| # | Solução | Quando Usar | Complexidade |
|---|---------|-------------|--------------|
{RANKED_SOLUTIONS_TABLE}

---

## Framework de Decisão

{DECISION_TREE}

---

## Próximos Passos

> **IMPORTANTE:** Este documento é apenas pesquisa. Para implementação:
> - **@pm** para priorização e criação de stories
> - **@dev** para execução técnica

### Ações Recomendadas

1. {ACTION_1}
2. {ACTION_2}
3. {ACTION_3}

---

## Código de Referência (Documentação)

> Exemplos para ilustração. NÃO é código de produção.

{CODE_EXAMPLES}
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
