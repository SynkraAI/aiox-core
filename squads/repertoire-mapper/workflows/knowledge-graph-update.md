---
id: WF-RM-005
name: Knowledge Graph Update
version: 1.0.0
description: >
  Adiciona novos nós e conexões ao grafo de conhecimento pessoal.
  Pode ser executado após qualquer sessão de extração ou Q&A.
trigger: manual | automatic (post-extraction)
phases:
  - LOAD_NEW_ITEMS
  - FIND_CONNECTIONS
  - UPDATE_GRAPH
  - VERIFY
agents_involved:
  - nonaka
  - forte
estimated_duration: 5-15 minutes
input: New repertoire items from extraction/Q&A
output: Updated knowledge-graph.json + repertoire-index.md
---

# Knowledge Graph Update

## Overview

Workflow incremental para manter o grafo de conhecimento pessoal
atualizado após cada sessão de extração ou Q&A. Foca em encontrar
conexões entre novos itens e itens existentes.

## Pipeline

```
NEW ITEMS (from extraction/Q&A)
    │
    ▼
LOAD & CLASSIFY (nonaka)
    │ SECI classification + asset type
    ▼
FIND CONNECTIONS (nonaka)
    │ Cross-reference com itens existentes
    │ Identify clusters, dependencies, contradictions
    ▼
UPDATE GRAPH (forte)
    │ Add nodes + edges
    │ Update index + manifest
    ▼
VERIFY
    │ No orphan nodes, no broken links
    ▼
OUTPUT: Updated graph + index
```

## Node Types

```yaml
node_types:
  mental_model: "Modelo conceitual usado para entender algo"
  decision_framework: "Heurística ou processo de decisão"
  personal_construct: "Construto bipolar (Kelly)"
  skill: "Habilidade praticável"
  pattern: "Padrão recorrente observado"
  value: "Princípio ou prioridade"
  belief: "Crença sobre como o mundo funciona"
  rule_of_thumb: "Regra prática ('quando X, faça Y')"
  metaphor: "Metáfora conceitual que estrutura pensamento"
  deep_smart: "Conhecimento crítico baseado em experiência"
```

## Edge Types

```yaml
edge_types:
  supports: "A sustenta/reforça B"
  contradicts: "A contradiz B"
  depends_on: "A requer B"
  extends: "A é uma extensão/especialização de B"
  applies_to: "A se aplica ao contexto B"
  derived_from: "A foi derivado de B"
  correlated_with: "A e B covariam (Kelly grid correlation)"
  ladder_up: "A é o 'porquê' de B (Kelly laddering)"
  ladder_down: "A é o 'como' de B (Kelly laddering)"
```

## Graph Schema (knowledge-graph.json)

```json
{
  "metadata": {
    "version": "1.0.0",
    "last_updated": "2026-02-18",
    "total_nodes": 0,
    "total_edges": 0
  },
  "nodes": [
    {
      "id": "RM-001",
      "type": "mental_model",
      "label": "Node label",
      "domain": "Domain area",
      "source": "Extraction method + date",
      "confidence": "high|medium|low",
      "dreyfus_stage": "competent",
      "seci_stage": "externalization",
      "content": "Description of the knowledge item",
      "evidence": ["Source references"]
    }
  ],
  "edges": [
    {
      "source": "RM-001",
      "target": "RM-002",
      "type": "supports",
      "weight": 0.8,
      "evidence": "Why this connection exists"
    }
  ]
}
```

---

_Workflow Version: 1.0.0_
_Last Updated: 2026-02-18_
