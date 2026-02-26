# Entity Registry Governance Research

## TL;DR

Pesquisa sobre governanca de entity registry, classificacao de dependencias, lifecycle de entidades e filtragem de grafo para o AIOS framework. Baseada em analise de 5 sistemas maduros: Nx, Backstage, DataHub, Rush e vis-network.

**Conclusao principal:** O problema nao e "filtrar N/A" — e implementar uma arquitetura de registry governance inspirada em Backstage (lifecycle states) + Nx (plugin-based discovery) + DataHub (aspect-based enrichment), com filtragem inteligente no grafo via vis-network DataView.

## Files

| File | Content |
|------|---------|
| [00-query-original.md](00-query-original.md) | Query original + contexto do problema |
| [01-deep-research-prompt.md](01-deep-research-prompt.md) | Sub-queries e estrategia de pesquisa |
| [02-research-report.md](02-research-report.md) | Relatorio completo de pesquisa |
| [03-recommendations.md](03-recommendations.md) | Recomendacoes para NOG-16+ |

## Date

2026-02-21

## Origin

QA Review NOG-15 — Concerns 1 & 2 (N/A pollution + unresolved deps)
