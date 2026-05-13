# Epic 483: Semantic Handshake

## Metadata

| Campo | Valor |
|-------|-------|
| Epic ID | 483 |
| Source Issue | #483 |
| Issue URL | https://github.com/SynkraAI/aiox-core/issues/483 |
| Status | In Progress |
| Priority | P2 |
| Repository | SynkraAI/aiox-core |

## Problem

O issue #483 descreve o gap entre planejamento e execução: decisões de arquitetura e restrições duras podem ser comprimidas, perdidas ou ignoradas quando a story passa de `@architect` para `@dev`.

## Current Reality

- Issue #447 foi resolvido pela Story 447.1 e entrega compactação hierárquica de contexto, mas não valida se o código proposto cumpre restrições de planejamento.
- PRs #564 e #565 citam Decision Memory e Agent Reflection, mas estão fechados sem merge e não existem na `main` atual.
- O runtime atual tem `G4DevContextGate`, mas ele é informativo e não bloqueia violações arquiteturais.

## Goal

Criar um protocolo determinístico de Semantic Handshake que transforme restrições de planejamento em contratos executáveis e permita bloquear a execução quando o código proposto violar `BLOCKER`s.

## Stories

| Story | Title | Status | Priority | Points |
|-------|-------|--------|----------|--------|
| 483.1 | Semantic Handshake Contract and Pre-Execution Gate | Ready for Review | P2 | 8 |

## Non-Goals

- Não importar o protótipo TypeScript do anexo como código de produção.
- Não depender de LLM para extrair restrições no primeiro slice.
- Não reabrir PRs antigos fechados; usar apenas evidência e padrões úteis.

## Completion Criteria

- Pelo menos uma story entrega engine, gate e testes determinísticos.
- A implementação é aditiva e exportada por superfícies existentes.
- Issue #483 pode ser atualizado com evidência objetiva do que foi resolvido e do que fica para slices futuros.
