# CLI Graph Dashboard Research

## TL;DR

Para visualizar grafos de dependencia dinamicos no terminal (code-intel epic), a melhor abordagem e combinar **blessed + blessed-contrib** para o dashboard TUI com widgets interativos (tree, line charts, sparklines), usando **d3-dag** para layout de DAGs e os dados do modulo `code-intel` como fonte. Alternativa moderna: **Ink** (React-based TUI) para developers familiarizados com JSX.

Nenhuma ferramenta existente resolve o caso de uso completo out-of-the-box. E necessario construir um CLI dashboard customizado que consuma os dados do `code-intel` module.

## Documents

| File | Content |
|------|---------|
| [00-query-original.md](00-query-original.md) | Query original + contexto |
| [01-deep-research-prompt.md](01-deep-research-prompt.md) | Sub-queries decompostas |
| [02-research-report.md](02-research-report.md) | Relatorio completo de pesquisa |
| [03-recommendations.md](03-recommendations.md) | Recomendacoes e proximos passos |

## Research Date
2026-02-21

## Tools Used
WebSearch: 5 queries | WebFetch: 10+ deep reads | Workers: 5 Haiku parallel
