# Design System Squad

**Version:** 4.2.0  
**Command:** `/DS`  
**Type:** Specialist Squad

## Overview

The Design System Squad is focused only on:

- token architecture and governance
- component system design and composition
- accessibility governance (WCAG)
- design system operations and adoption
- registry and AI-readable metadata

Domain work like brand, logo, thumbnails, photo, and editing was moved to dedicated squads:

- `squads/brand`
- `squads/content-visual`

## Agents

| Agent | Command | Specialty |
|---|---|---|
| Design Chief | `@design-chief` | Orchestration and routing |
| Brad Frost | `@brad-frost` | Atomic design, components, tokens |
| Dan Mall | `@dan-mall` | Stakeholder buy-in and DS adoption |
| Dave Malouf | `@dave-malouf` | DesignOps and operating model |
| Nano Banana | `@nano-banana-generator` | Visual utility support |
| Atlas | `@ds-token-architect` | Figma-to-tokens/component specs |
| Foundations Lead | `@ds-foundations-lead` | Orchestrates F1/F2/F3 foundations pipeline |
| Storybook Expert | `@storybook-expert` | Story architecture, interaction tests, visual regression |

## Routing

Use Design Chief as entrypoint:

- `"auditar design system"` -> `@brad-frost`
- `"escalar operacao de design"` -> `@dave-malouf`
- `"preciso vender DS internamente"` -> `@dan-mall`
- `"metadata/registry para AI"` -> `@brad-frost`
- `"preciso de logo/brand"` -> handoff to `/Brand`
- `"thumbnail/foto/video"` -> handoff to `/ContentVisual`

## Core Tasks

- `ds-*`: architecture, audit, tokenization, migration, registry, metadata, MCP
- `agentic-*`: machine-readability audit and AI-ready setup
- `token-*`: W3C DTCG extraction and token modes governance
- `motion-*`: motion quality and visual regression baselines
- `fluent-*`: Fluent 2 audit/build compatibility tracks
- `ds-govern`, `ds-designops`: governance model and DesignOps operating playbook
- `figma-pipeline`: Figma MCP integration and design-to-code mapping
- `f1-*`, `f2-*`, `f3-*`: foundations pipeline with blocking QA gates
- `a11y-*`: accessibility audits and governance
- `atomic-refactor-*`: decomposition and execution
- `designops-*`: maturity, scaling, process and tooling
- `design-triage`, `design-review-orchestration`: orchestration gates

## Workflows

- `workflows/audit-only.yaml`
- `workflows/brownfield-complete.yaml`
- `workflows/greenfield-new.yaml`
- `workflows/self-healing-workflow.yaml`
- `workflows/agentic-readiness.yaml`
- `workflows/dtcg-tokens-governance.yaml`
- `workflows/motion-quality.yaml`
- `workflows/foundations-pipeline.yaml`
- `workflows/critical-eye.yaml`

## Modelo de Governance

### Princípio: Governance cria, Execution usa

O squad segue a regra fundamental de separação entre **governance** e **execution**:

- **Governance** define tokens, regras, templates, checklists e protocolos. Esses artefatos são criados e mantidos pelos agentes do squad dentro de `squads/design/`.
- **Execution** consome esses artefatos sem modificá-los. Agentes de desenvolvimento, CI/CD e IDEs leem as definições e aplicam as regras durante a implementação.

O protocolo completo está documentado em `squads/design/protocols/ai-first-governance.md`.

### Tier System

Definido em `squads/design/config.yaml`:

| Tier | Papel |
|------|-------|
| **tier_0_foundation** | Agentes de entrada para operações e estratégia de adoção |
| **tier_1_masters** | Masters de execução com práticas especialistas |
| **tier_2_specialists** | Especialistas profundos para implementação de DS |
| **orchestrator** | Design Chief — roteia requisições para o agente adequado |

### Hierarquia de Fontes Canônicas

Ordem de precedência para resolução de conflitos:

1. `workspace/` — fonte de verdade global (system, ui, domains)
2. `squads/design/` — governança e conhecimento local do squad
3. `docs/` — evidência de suporte, nunca fonte final de verdade

Quando dois artefatos conflitam, prevalece a fonte de maior precedência. Conflitos devem ser registrados conforme o protocolo de governance.

## Notes

- Source hierarchy: `workspace/` -> `squads/design/` -> `docs/`
- This squad is DS-only by design.
- Cross-domain requests are routed to specialized squads instead of being executed here.
