# GitHub Issue Management Best Practices — Research

**Date:** 2026-02-20
**Query:** GitHub issue management best practices - automation, triage workflows, labeling strategies, issue templates, GitHub Actions, community handling
**Coverage Score:** 85/100
**Workers:** 5/5 successful

## TL;DR

GitHub issue management moderno combina **issue forms YAML** para coleta estruturada, **GitHub Actions** para automacao de triage/stale/labeling, e **taxonomia de labels com prefixos** para organizacao. Projetos maduros como Kubernetes usam SLAs de 30 dias, bots de triage, e roteamento via labels/CODEOWNERS. Em 2026, GitHub Agentic Workflows permitem AI-driven triage com analise semantica.

## Files

| File | Content |
|------|---------|
| [00-query-original.md](./00-query-original.md) | Query original + contexto inferido |
| [01-deep-research-prompt.md](./01-deep-research-prompt.md) | Sub-queries decompostas |
| [02-research-report.md](./02-research-report.md) | Findings completos |
| [03-recommendations.md](./03-recommendations.md) | Recomendacoes para aios-core |

## Sources (Top)

- GitHub Docs: Issue Forms Syntax
- GitHub Agentic Workflows (2026)
- actions/stale v10, github/issue-labeler v3.4
- Kubernetes Issue Triage Guidelines
- GitHub CODEOWNERS Documentation
