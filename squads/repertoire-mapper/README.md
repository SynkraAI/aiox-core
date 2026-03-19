# Repertoire Mapper

> Squad dedicado ao mapeamento completo de repertórios pessoais.

## Overview

O Repertoire Mapper extrai, classifica e organiza todo o conhecimento,
habilidades, frameworks mentais, padrões de decisão e construtos pessoais
de uma pessoa. Combina extração de fontes digitais com sessões de Q&A
interativo de baixa fricção para capturar tanto conhecimento explícito
quanto tácito.

**Diferencial:** Nenhum outro squad faz auto-mapeamento completo.
O MMOS mapeia OUTROS. Este squad mapeia VOCÊ.

## Quick Start

```bash
# Ativar o squad
@repertoire-mapper

# Sessão Q&A rápida (15-30 min)
@repertoire-mapper:kelly *qa-session

# Pipeline completo de mapeamento
@repertoire-mapper:repertoire-chief *map

# Processar uma fonte
@repertoire-mapper:klein *extract-from-source

# Validar repertório mapeado
@repertoire-mapper:argyris *validate-gaps
```

## Agents

### Orchestrator
| Agent | Role |
|-------|------|
| **repertoire-chief** | Roteia, rastreia progresso, gera reports |

### Tier 0 — Diagnosis
| Agent | Based On | Role |
|-------|----------|------|
| **polanyi** | Michael Polanyi | Classifica TIPOS de conhecimento (tácito/explícito) |
| **collins** | Collins & Evans | Diagnostica NÍVEL de expertise (Periodic Table) |

### Tier 1 — Extraction
| Agent | Based On | Role |
|-------|----------|------|
| **klein** | Gary Klein | Extrai via CDM (entrevistas baseadas em incidentes) |
| **leonard** | Dorothy Leonard | Identifica Deep Smarts (conhecimento crítico) |
| **kelly** | George Kelly | Q&A de baixa fricção via Repertory Grid |

### Tier 2 — Systematization
| Agent | Based On | Role |
|-------|----------|------|
| **nonaka** | Nonaka & Takeuchi | Converte via SECI (tácito↔explícito) |
| **argyris** | Argyris & Schön | Valida gaps (espoused vs actual) |

### Tier 3 — Specialization
| Agent | Based On | Role |
|-------|----------|------|
| **chin** | Cedric Chin | Traduz outputs para linguagem prática |
| **forte** | Tiago Forte | Organiza via PARA, indexa, monta grafo |

## Workflows

| Workflow | Duration | Purpose |
|----------|----------|---------|
| **full-mapping-pipeline** | 2-6h | Pipeline completo end-to-end |
| **quick-qa-session** | 15-30min | Sessão Q&A de baixa fricção (Kelly) |
| **source-ingestion** | 15-60min | Processar uma fonte digital |
| **repertoire-validation** | 20-40min | Validar repertório contra evidências |
| **knowledge-graph-update** | 5-15min | Atualizar grafo incrementalmente |

## Tasks

| Task | Executor | Purpose |
|------|----------|---------|
| diagnose-repertoire | polanyi + collins | Diagnóstico inicial |
| extract-from-source | klein | Extrair de fonte digital |
| run-qa-session | kelly | Executar sessão Repertory Grid |
| build-repertory-grid | kelly | Construir grid completo |
| map-deep-smarts | leonard | Identificar conhecimento crítico |
| convert-seci | nonaka | Converter via SECI model |
| validate-gaps | argyris | Detectar gaps espoused vs actual |
| organize-para | forte | Organizar via PARA method |
| translate-output | chin | Traduzir para linguagem prática |
| generate-manifest | forte | Gerar repertoire-manifest.yaml |
| generate-operating-manual | chin + forte | Gerar manual operacional |
| update-knowledge-graph | nonaka + forte | Atualizar grafo de conhecimento |

## Outputs

### Primary
- **repertoire-manifest.yaml** — Mapa completo de repertórios (YAML estruturado)
- **operating-manual.md** — Manual operacional pessoal
- **knowledge-graph.json** — Grafo de conhecimento (nós + conexões)
- **decision-frameworks.yaml** — Heurísticas e frameworks de decisão

### Secondary
- **expertise-profile.md** — Perfil de expertise (Periodic Table)
- **gap-analysis.md** — Análise de gaps (espoused vs actual)
- **repertoire-index.md** — Índice navegável de repertórios

## Embedded Tools

| Tool | Source | Purpose |
|------|--------|---------|
| Dreyfus Stage Classifier | Dreyfus (1980) | Nível de expertise por área |
| Ericsson Quality Benchmark | Ericsson (2016) | Qualidade de representações mentais |
| Lakoff Metaphor Analyzer | Lakoff (1980) | Metáforas conceituais |
| Codex Vitae Template | Buster Benson (2012) | Documentação de crenças |

## Quality Gates

| Gate | Transition | Type | Criteria |
|------|-----------|------|----------|
| QG-001 | Input → Tier 0 | Routing | Fontes identificadas, objetivo claro |
| QG-002 | Tier 0 → Tier 1 | Blocking | Diagnóstico completo |
| QG-003 | Tier 1 → Tier 2 | Blocking | 10+ itens extraídos com evidência |
| QG-004 | Tier 2 → Validation | Advisory | SECI cycle completo |
| QG-005 | Validation → Output | Blocking | Gap-check passado |

## Dependencies

- **ETL Data Collector** — Coleta de fontes digitais (YouTube, blogs, social)
- **MMOS Mind Mapper** — Patterns de extração cognitiva (adaptados)

## Research Foundation

9 mentes elite pesquisadas e validadas:

1. **Michael Polanyi** — Tacit Knowledge (1966)
2. **Collins & Evans** — Periodic Table of Expertises (2007)
3. **Gary Klein** — Critical Decision Method / RPD (1998)
4. **Dorothy Leonard** — Deep Smarts (2005)
5. **George Kelly** — Repertory Grid Technique (1955)
6. **Nonaka & Takeuchi** — SECI Model (1995)
7. **Argyris & Schön** — Espoused vs Theory-in-Use (1978)
8. **Cedric Chin** — Commoncog Tacit Knowledge Series
9. **Tiago Forte** — Building a Second Brain (2022)

---

_Repertoire Mapper v1.0.0_
_Created: 2026-02-18_
