# Epic: Boundary Mapping & Framework-Project Separation

## Overview

Estabelecer separação determinística entre artefatos do **framework AIOS** (imutáveis) e artefatos do **projeto do usuário** (mutáveis), usando um modelo de 4 camadas (L1-L4) validado por pesquisa em 7 paradigmas (Rails, npm, Nx, Next.js, Backstage, Terraform, Claude Code).

**Princípios:**
- `Framework = Read-Only para projetos | Customização via config, não modificação`
- `Enforcement = Determinístico (deny rules) > Comportamental (CLAUDE.md)`
- `Atomic Design = Stories atômicas, incrementais, cada uma entregando valor isolado`

## Arquitetura de 4 Camadas

| Camada | Nome | Mutabilidade | Exemplos |
|--------|------|-------------|----------|
| **L1** | Framework Core | Imutável | `.aios-core/core/`, `bin/`, `constitution.md` |
| **L2** | Framework Templates | Extend-only | `.aios-core/development/tasks/`, templates, checklists |
| **L3** | Project Config | Customizável | `core-config.yaml`, `.claude/CLAUDE.md`, `.claude/settings.json`, agent `MEMORY.md` |
| **L4** | Project Runtime | Dinâmico | `docs/stories/`, `squads/`, `packages/`, `.aios/` (gitignored) |

## Documents

| Document | Purpose |
|----------|---------|
| [Research: Framework-Project Separation](../../../research/2026-02-22-framework-project-separation/) | Composite pattern (Rails + npm + Nx) |
| [Research: Framework Immutability](../../../research/2026-02-22-framework-immutability-patterns/) | 4-layer defense-in-depth |
| [Research: Project Config Evolution](../../../research/2026-02-22-project-config-evolution/) | CLAUDE.md restructuring, AGENTS.md, memory lifecycle |
| [Research: Dynamic Entity Registries](../../../research/2026-02-22-dynamic-entity-registries/) | Backstage-inspired registry evolution |

## Stories

### Wave 1: Quick Wins — Enforcement Imediato (Parallel)

| Story | Title | Agent | Points | Status | Blocked By |
|-------|-------|-------|--------|--------|------------|
| [BM-1](story-BM-1-permission-deny-rules.md) | Permission Deny Rules & Toggleable Config | @dev | 3 | Done | - |
| [BM-2](story-BM-2-claude-md-boundary-section.md) | CLAUDE.md Boundary Section & Progressive Disclosure | @dev | 2 | Done | - |

### Wave 2: Commit-Time Protection (Sequential after Wave 1)

| Story | Title | Agent | Points | Status | Blocked By |
|-------|-------|-------|--------|--------|------------|
| [BM-3](story-BM-3-pre-commit-framework-guard.md) | Pre-Commit Hook Framework Guard | @devops | 3 | Done | BM-1 (Done) |

### Wave 3: Config Surface (Sequential after Wave 2)

| Story | Title | Agent | Points | Status | Blocked By |
|-------|-------|-------|--------|--------|------------|
| [BM-4](story-BM-4-config-override-surface.md) | Boundary Schema Enrichment & Template Customization | @dev | 5 | Done | BM-1 (Done) |

### Wave 4: Entity Registry Evolution (after Wave 3)

| Story | Title | Agent | Points | Status | Blocked By |
|-------|-------|-------|--------|--------|------------|
| [BM-5](story-BM-5-entity-layer-classification.md) | Entity Registry Layer Classification (L1-L4) | @dev | 3 | Done | BM-4 (Done) |

### Wave 5: Memory & Config Evolution (after Wave 4)

| Story | Title | Agent | Points | Status | Blocked By |
|-------|-------|-------|--------|--------|------------|
| [BM-6](story-BM-6-agent-memory-lifecycle.md) | Agent Memory Lifecycle & Config Evolution | @dev | 5 | Done | BM-5 (Done) |

### Backlog (Future — Post-Epic Evaluation)

| Story | Title | Priority | Notes |
|-------|-------|----------|-------|
| BM-7 | PreToolUse Hook Dynamic Validation | P2 | Programmatic enforcement beyond deny rules |
| BM-8 | ESLint Boundary Rules | P3 | Import-level enforcement |
| BM-9 | AGENTS.md Cross-Platform Layer | P3 | Vendor-neutral instruction file |
| BM-10 | Auto-Discovery Engine (Nx-inspired) | P3 | Glob-based entity scanner |
| BM-11 | Event-Sourced Registry Changelog | P3 | JSONL temporal queries |

## Summary

| Metric | Value |
|--------|-------|
| **Total Stories (Active)** | 6 |
| **Total Points (Active)** | 21 |
| **Backlog Stories** | 5 |
| **Waves** | 5 |
| **Quick Wins (Wave 1)** | BM-1, BM-2 (~5 points, imediato) |

## Atomic Design Rationale (Brad Frost)

| Layer | Brad Frost | Stories |
|-------|-----------|---------|
| **Atoms** | Deny rules, file headers, config keys | BM-1 (deny rules), BM-2 (CLAUDE.md section) |
| **Molecules** | Pre-commit hook combining atoms | BM-3 (guard script + config toggle) |
| **Organisms** | Config override surface | BM-4 (schema enrichment + template overrides) |
| **Templates** | Entity classification system | BM-5 (L1-L4 in registry) |
| **Pages** | Full lifecycle integration | BM-6 (memory evolution + config sync) |

Cada story é auto-contida e entrega valor incremental. BM-1 sozinha já protege o framework.

## Definition of Done

- [x] All active stories completed with acceptance criteria met
- [x] `.claude/settings.json` deny rules protecting `.aios-core/core/`
- [x] `core-config.yaml` toggle for contributor mode (enable/disable deny rules)
- [x] Pre-commit hook blocking framework file commits
- [x] Entity registry classifying entities by layer (L1-L4)
- [x] Agent MEMORY.md with structured lifecycle
- [x] Zero regression in existing functionality

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Deny rules block framework development itself | HIGH | Toggleable via `core-config.yaml` `frameworkProtection: enabled/disabled` |
| Pre-commit hook too strict for contributors | MEDIUM | `--no-verify` escape hatch documented; contributor mode in config |
| Config override introduces merge conflicts | MEDIUM | Schema validation prevents invalid overrides |
| Entity classification is subjective | LOW | Clear L1-L4 criteria documented in story BM-5 |

## Handoff to Story Manager

"Please develop detailed user stories for this brownfield epic. Key considerations:

- This is an enhancement to the AIOS framework (Node.js CLI, multi-agent)
- Integration points: `.claude/settings.json`, `core-config.yaml`, `.aios-core/data/entity-registry.yaml`, agent MEMORY.md files
- Existing patterns: agent authority rules, CLAUDE.md rules system, entity registry YAML
- Critical: deny rules must be toggleable for framework contributors vs project users
- Brad Frost atomic design: each story is an atom/molecule that compounds into the full boundary system
- 4 tech-search research docs available as input for each story"
