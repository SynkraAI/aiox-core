# GitHub Copilot Custom Agents Format Research

**Date:** 2026-02-21
**Issue:** #138 — Agent files not compatible with GitHub Copilot
**Status:** Complete

## TL;DR

GitHub Copilot custom agents require `.agent.md` files with YAML frontmatter (`---` delimiters) containing at minimum a `description` property. Our current `.github/agents/*.md` files use the Claude Code format (full activation-instructions + embedded YAML blocks) which Copilot cannot parse. A new transformer is needed in the IDE sync pipeline.

## Files

| File | Content |
|------|---------|
| [00-query-original.md](./00-query-original.md) | Original query + context |
| [01-deep-research-prompt.md](./01-deep-research-prompt.md) | Sub-queries used |
| [02-research-report.md](./02-research-report.md) | Complete findings |
| [03-recommendations.md](./03-recommendations.md) | Implementation plan |

## Key Sources

- [GitHub Docs - Custom Agents Configuration](https://docs.github.com/en/copilot/reference/custom-agents-configuration)
- [GitHub Docs - Creating Custom Agents](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/create-custom-agents)
- [VS Code - Custom Agents](https://code.visualstudio.com/docs/copilot/customization/custom-agents)
- [GitHub awesome-copilot](https://github.com/github/awesome-copilot)
