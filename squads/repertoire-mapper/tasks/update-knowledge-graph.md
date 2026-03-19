---
id: TK-RM-012
name: Update Knowledge Graph
version: 1.0.0
executor: nonaka + forte
purpose: >
  Atualizar o grafo de conhecimento incrementalmente apos cada sessao de
  mapeamento. Adicionar novos nodes (itens de repertorio), estabelecer
  conexoes (edges) com nodes existentes, verificar integridade do grafo,
  e gerar delta report mostrando o que mudou. O grafo e a representacao
  relacional de todo o repertorio mapeado.
squad: repertoire-mapper
phase: PHASE_3_CONVERSION + incremental
tier: 2 + 3

inputs:
  - name: new_items
    type: list
    description: "Novos itens de repertorio extraidos na sessao atual"
    required: true
    format: "YAML array com id, type, content, confidence, source_agent"
    location: "outputs/repertoire/{slug}/session-{N}/new-items.yaml"

  - name: existing_graph
    type: document
    description: "Knowledge graph atual (pode nao existir na primeira sessao)"
    required: false
    format: "JSON com nodes e edges arrays"
    location: "outputs/repertoire/{slug}/knowledge-graph.json"

  - name: seci_classification
    type: document
    description: "Classificacao SECI dos novos itens por nonaka"
    required: false
    format: "YAML"
    location: "outputs/repertoire/{slug}/seci-classification.yaml"

  - name: gap_analysis
    type: document
    description: "Gap analysis por argyris (se disponivel)"
    required: false
    format: "YAML"
    location: "outputs/repertoire/{slug}/gap-analysis.yaml"

  - name: para_classification
    type: document
    description: "Classificacao PARA por forte (se disponivel)"
    required: false
    format: "YAML"
    location: "outputs/repertoire/{slug}/para-summary.yaml"

  - name: cross_references
    type: document
    description: "Cross-references identificadas por forte (se disponivel)"
    required: false
    format: "YAML"
    location: "outputs/repertoire/{slug}/cross-references.yaml"

preconditions:
  - "Novos itens extraidos e disponíveis"
  - "Agentes nonaka e forte carregados"
  - "Se grafo existente: arquivo JSON valido e parseavel"
  - "Cada novo item tem id, type, e content preenchidos"

outputs:
  - name: knowledge_graph
    path: "outputs/repertoire/{slug}/knowledge-graph.json"
    format: json
    description: >
      Knowledge graph atualizado com novos nodes e edges.
      Formato: { nodes: [...], edges: [...], metadata: {...} }

  - name: delta_report
    path: "outputs/repertoire/{slug}/deltas/delta-{timestamp}.yaml"
    format: yaml
    description: >
      Relatorio de mudancas: nodes adicionados, edges adicionados,
      nodes modificados, edges removidos, estatisticas.

  - name: graph_validation
    path: "outputs/repertoire/{slug}/graph-validation.yaml"
    format: yaml
    description: >
      Resultado da validacao de integridade do grafo:
      orphan nodes, broken edges, inconsistencies.

validation:
  success_criteria:
    - "Todos os novos itens adicionados como nodes"
    - "Cada novo node tem tipo classificado corretamente"
    - "Conexoes com nodes existentes identificadas"
    - "Zero orphan nodes (nodes sem nenhuma edge)"
    - "Zero broken edges (edges apontando para nodes inexistentes)"
    - "Metadata atualizada em todos os nodes"
    - "Delta report gerado com mudancas detalhadas"
    - "Grafo JSON valido e parseavel"
  quality_threshold: "8/10 no checklist completo"
---

# Task: Update Knowledge Graph

## Executive Summary

O knowledge graph e a representacao relacional do repertorio do sujeito. Cada
item de repertorio e um NODE no grafo, e as relacoes entre itens sao EDGES.
O grafo cresce incrementalmente a cada sessao de mapeamento e e a base para
visualizacoes, analises de cluster, e deteccao de lacunas.

Esta task pode ser executada:
1. **Durante o pipeline completo** (Phase 3, apos SECI conversion por nonaka)
2. **Incrementalmente** (apos qualquer sessao de extracao, mesmo parcial)

**Posicao no Pipeline:** Task 12 -- Phase 3 (initial) + incremental updates
**Definicao de Sucesso:** Grafo atualizado, validado, com delta report
**Execucao Dual:** nonaka (classificacao SECI e conexoes conceituais) + forte (metadata PARA e cross-references)

---

## Purpose

Um inventario (lista) de itens de repertorio responde "O QUE a pessoa sabe."
Um grafo de conhecimento responde "COMO as coisas que a pessoa sabe se
RELACIONAM entre si."

Esse "como se relacionam" e crucial porque:

1. **Clusters revelam identidade** -- Um cluster denso de nodes conectados
   revela uma area de expertise profunda
2. **Gaps revelam oportunidades** -- Areas do grafo com poucos nodes ou
   poucos edges indicam conhecimento fragmentado
3. **Contradicoes sao visiveis** -- Edges tipo "contradicts" tornam
   conflitos internos explicitos
4. **Transferencia e possivel** -- O grafo mostra caminhos de transferencia
   de conhecimento (via edges "derived_from" e "extends")
5. **Evolucao e rastreavel** -- Delta reports mostram como o repertorio muda

---

## Executor Type

**Agents: nonaka + forte (dual execution)**

- **nonaka's Role:** Classificacao SECI dos novos itens, identificacao de conexoes conceituais (knowledge creation perspective)
- **forte's Role:** Metadata PARA, cross-references praticas, integridade estrutural
- **Division of Work:** nonaka classifica e conecta, forte valida e organiza
- **Human Role:** Nenhum durante atualizacao
- **Estimated Runtime:** 10-20 minutos por sessao

---

## Graph Schema

### Node Types

O grafo suporta 10 tipos de nodes, cada um representando um tipo diferente
de item de repertorio:

```yaml
node_types:
  mental_model:
    description: "Representacao interna de como algo funciona"
    example: "Modelo de supply-demand aplicado a atencao do cliente"
    icon: "brain"
    typical_dreyfus: "competent-expert"

  decision_framework:
    description: "Processo estruturado para tomar decisoes em contexto especifico"
    example: "Framework de 5 perguntas antes de contratar"
    icon: "scale"
    typical_dreyfus: "proficient-expert"

  personal_construct:
    description: "Dimensao bipolar usada para interpretar experiencias (Kelly)"
    example: "Inovador vs Conservador como lente para avaliar projetos"
    icon: "compass"
    typical_dreyfus: "any"

  skill:
    description: "Capacidade pratica de executar algo"
    example: "Capacidade de ler linguagem corporal em negociacao"
    icon: "tool"
    typical_dreyfus: "advanced_beginner-expert"

  pattern:
    description: "Padrao recorrente que o sujeito reconhece"
    example: "Reconhecer sinais de burnout em membros de equipe antes que declarem"
    icon: "eye"
    typical_dreyfus: "proficient-expert"

  value:
    description: "Principio ou valor que guia comportamento"
    example: "Transparencia radical em comunicacao de equipe"
    icon: "heart"
    typical_dreyfus: "any"

  belief:
    description: "Crenca sobre como o mundo funciona"
    example: "Acredita que 80% do resultado vem de 20% do esforco"
    icon: "lightbulb"
    typical_dreyfus: "any"

  rule_of_thumb:
    description: "Heuristica pratica testada por experiencia"
    example: "Se um cliente reclama de preco 3 vezes, ele nao e meu publico"
    icon: "thumb-up"
    typical_dreyfus: "competent-expert"

  metaphor:
    description: "Analogia usada para pensar sobre problemas"
    example: "Negocio como ecossistema, nao como maquina"
    icon: "palette"
    typical_dreyfus: "any"

  deep_smart:
    description: "Conhecimento profundo, raro, e dificil de transferir (Leonard)"
    example: "Capacidade de ler dinâmicas de poder em sala de reuniao"
    icon: "diamond"
    typical_dreyfus: "expert"
```

### Edge Types

O grafo suporta 9 tipos de edges, cada um representando um tipo diferente
de relacao entre itens:

```yaml
edge_types:
  supports:
    description: "Item A reforca ou valida Item B"
    direction: "bidirectional"
    weight_range: "0.1-1.0"
    example: "Rule 'retention first' supports model 'leaky bucket'"
    color: "green"

  contradicts:
    description: "Item A conflita com Item B"
    direction: "bidirectional"
    weight_range: "0.1-1.0"
    example: "Value 'delegate everything' contradicts pattern 'micromanage under pressure'"
    color: "red"
    note: "Gaps identificados por argyris geram essas edges"

  depends_on:
    description: "Item A requer Item B como prerequisito"
    direction: "directional (A depends_on B)"
    weight_range: "0.5-1.0"
    example: "Skill 'advanced negotiation' depends_on skill 'active listening'"
    color: "blue"

  extends:
    description: "Item A e uma especializacao de Item B"
    direction: "directional (A extends B)"
    weight_range: "0.3-1.0"
    example: "Framework 'B2B pricing' extends model 'value-based pricing'"
    color: "purple"

  applies_to:
    description: "Item A e usado no contexto de Item B"
    direction: "directional (A applies_to B)"
    weight_range: "0.3-1.0"
    example: "Rule 'first 90 days' applies_to skill 'team onboarding'"
    color: "orange"

  derived_from:
    description: "Item A foi aprendido/criado a partir de Item B"
    direction: "directional (A derived_from B)"
    weight_range: "0.3-1.0"
    example: "Rule 'never hire desperation' derived_from experience 'bad hire 2019'"
    color: "teal"

  correlated_with:
    description: "Item A tende a aparecer junto com Item B (sem causalidade)"
    direction: "bidirectional"
    weight_range: "0.1-0.8"
    example: "Pattern 'early morning productivity' correlated_with value 'discipline'"
    color: "gray"

  ladder_up:
    description: "Item A e uma generalizacao de Item B (Kelly laddering up)"
    direction: "directional (A ladder_up from B)"
    weight_range: "0.5-1.0"
    example: "Value 'freedom' ladder_up from construct 'flexibility vs rigidity'"
    color: "gold"
    note: "Usado para conectar personal constructs a valores abstratos"

  ladder_down:
    description: "Item A e uma concretizacao de Item B (Kelly laddering down)"
    direction: "directional (A ladder_down from B)"
    weight_range: "0.5-1.0"
    example: "Rule 'check calendar weekly' ladder_down from value 'intentional time management'"
    color: "bronze"
    note: "Usado para conectar valores abstratos a praticas concretas"
```

### Node Structure (JSON)

```json
{
  "id": "RM-ITEM-042",
  "label": "Retention Before Acquisition",
  "type": "rule_of_thumb",
  "domain": "growth-strategy",
  "description": "Descricao do item",
  "practitioner_description": "Versao traduzida por chin",
  "confidence": 0.85,
  "source_agent": "klein",
  "dreyfus_level": "proficient",
  "seci_stage": "externalization",
  "para_category": "A",
  "knowledge_asset_type": "experiential",
  "polanyi_classification": "tacit_relational",
  "actionability_score": 0.9,
  "lifecycle_stage": "active",
  "created_session": "session-001",
  "last_modified": "2026-02-18T14:30:00Z",
  "progressive_summary": {
    "layer_3": "Resumo em 2-3 frases",
    "layer_4": "Resumo em 1 frase"
  },
  "heuristic": {
    "when": "Situacao",
    "then": "Acao",
    "because": "Razao"
  },
  "gap": {
    "type": "hidden_expertise",
    "severity": "significant"
  }
}
```

### Edge Structure (JSON)

```json
{
  "source": "RM-ITEM-042",
  "target": "RM-ITEM-015",
  "type": "supports",
  "weight": 0.8,
  "evidence": "Ambos derivados do mesmo CDM incident #3",
  "created_session": "session-001",
  "last_modified": "2026-02-18T14:30:00Z"
}
```

---

## Steps

### Step 1: Load Existing Graph and New Items (2-3 min)

**Agent Activity (forte):**

- Se `knowledge-graph.json` existe: carregar e validar
- Se nao existe: inicializar grafo vazio
- Carregar novos itens da sessao atual
- Criar inventario do que sera adicionado

**Graph Initialization (if empty):**

```json
{
  "schema": "knowledge-graph/v1",
  "subject": "{slug}",
  "created": "2026-02-18T14:30:00Z",
  "last_modified": "2026-02-18T14:30:00Z",
  "nodes": [],
  "edges": [],
  "metadata": {
    "total_nodes": 0,
    "total_edges": 0,
    "sessions_processed": 0,
    "node_type_distribution": {},
    "edge_type_distribution": {},
    "clusters": []
  }
}
```

**Pre-Update Snapshot:**

```yaml
pre_update:
  existing_nodes: N
  existing_edges: N
  new_items_to_add: N
  expected_new_nodes: N
  expected_new_edges: "N-N (estimate)"
```

**Checkpoint:** Grafo carregado (ou inicializado), novos itens prontos

---

### Step 2: Classify New Node Types (2-3 min)

**Agent Activity (nonaka):**

Para cada novo item, confirmar ou atribuir o tipo de node correto.

**Classification Algorithm:**

```yaml
node_classification:
  step_1_check_existing:
    action: "Se o item ja tem 'type' definido pelo agente fonte, verificar se esta correto"
    confidence_threshold: "Se confidence >= 0.8 no type original, manter"

  step_2_classify_if_missing:
    action: "Se 'type' esta ausente ou confidence < 0.8, classificar"
    algorithm: |
      IF item contains "quando X, entao Y" structure → rule_of_thumb
      IF item describes how a system works → mental_model
      IF item describes a decision process → decision_framework
      IF item is a bipolar dimension → personal_construct
      IF item describes an ability → skill
      IF item describes a recurring signal → pattern
      IF item states a principle or value → value
      IF item states a belief about the world → belief
      IF item uses analogy or metaphor → metaphor
      IF item is rare, experience-based, hard to transfer → deep_smart

  step_3_seci_stage:
    action: "Classificar o estagio SECI do item (se nonaka nao ja o fez)"
    criteria:
      socialization: "Conhecimento ainda tacito, aprendido por observacao/pratica"
      externalization: "Conhecimento sendo articulado pela primeira vez"
      combination: "Conhecimento explicito sendo combinado com outros"
      internalization: "Conhecimento explicito sendo incorporado em pratica"

  step_4_assign_metadata:
    action: "Atribuir metadata adicional"
    fields:
      - knowledge_asset_type: "experiential | conceptual | systemic | routine"
      - polanyi_classification: "tacit_relational | tacit_somatic | tacit_collective | explicit"
      - lifecycle_stage: "active | maintenance | reference | dormant"
```

**Checkpoint:** Todos os novos itens classificados

---

### Step 3: Find Connections with Existing Nodes (3-5 min)

**Agent Activity (nonaka + forte):**

Identificar conexoes entre novos nodes e nodes existentes no grafo.

**Connection Discovery Algorithm:**

```yaml
connection_discovery:
  phase_1_same_domain:
    description: "Comparar novos nodes com nodes existentes no mesmo dominio"
    checks:
      - "Mesmo tema? → check supports/contradicts/extends"
      - "Mesmo contexto de uso? → check applies_to"
      - "Mesmo nivel de abstracao? → check correlated_with"
      - "Um mais abstrato que outro? → check ladder_up/ladder_down"

  phase_2_cross_domain:
    description: "Comparar novos nodes com nodes de dominios diferentes"
    checks:
      - "Principio transferivel? → check applies_to"
      - "Analogia entre dominios? → check correlated_with"
      - "Premissa comum? → check supports"

  phase_3_gap_connections:
    description: "Se gap analysis disponivel, conectar gaps com nodes"
    checks:
      - "Gap envolve estes nodes? → check contradicts"
      - "Hidden expertise surfaceada? → marcar node e criar edge"

  phase_4_kelly_connections:
    description: "Conectar personal constructs via laddering"
    checks:
      - "Construct -> valor mais abstrato? → check ladder_up"
      - "Valor -> pratica concreta? → check ladder_down"

  phase_5_dependency:
    description: "Identificar dependencias"
    checks:
      - "Skill A requer Skill B? → check depends_on"
      - "Framework A assume Model B? → check depends_on"
```

**Edge Weight Calculation:**

```yaml
edge_weight_factors:
  evidence_strength:
    strong: 0.3  # Multiplas fontes confirmam a relacao
    moderate: 0.2  # Uma fonte confirma
    inferred: 0.1  # Relacao inferida pelo agente

  co_occurrence:
    high: 0.3  # Aparecem juntos em 3+ incidentes
    medium: 0.2  # Aparecem juntos em 2 incidentes
    low: 0.1  # Aparecem juntos em 1 incidente

  semantic_similarity:
    high: 0.3  # Significados muito proximos
    medium: 0.2  # Significados relacionados
    low: 0.1  # Relacao tenue

  confidence_adjustment:
    formula: "weight = (evidence + co_occurrence + similarity) * min(source_confidence, target_confidence)"
    min_weight: 0.1
    max_weight: 1.0
```

**Minimum Edge Threshold:**
- weight >= 0.3 para criar edge
- weight < 0.3: logar como "potential connection" no delta report mas nao criar edge

**Checkpoint:** Todas as conexoes identificadas e edges criadas

---

### Step 4: Add Nodes and Edges to Graph (2-3 min)

**Agent Activity (forte):**

Adicionar novos nodes e edges ao grafo JSON.

**Addition Protocol:**

```yaml
addition_protocol:
  nodes:
    - Verificar que id e unico (nao existe no grafo)
    - Se id duplicado: MERGE (atualizar metadata, nao duplicar)
    - Adicionar todos os campos obrigatorios
    - Adicionar metadata (created_session, last_modified)

  edges:
    - Verificar que source e target existem como nodes
    - Verificar que edge nao e duplicata (source+target+type)
    - Se duplicata com weight diferente: atualizar weight para maior
    - Adicionar evidence e session metadata

  dedup_rules:
    nodes: "ID-based dedup. Se mesmo ID, merge metadata."
    edges: "Source+target+type dedup. Se mesmo, update weight."
```

**Checkpoint:** Nodes e edges adicionados ao grafo

---

### Step 5: Verify No Orphan Nodes (1-2 min)

**Agent Activity (forte):**

Garantir que todo node tem pelo menos uma edge.

**Orphan Detection:**

```yaml
orphan_detection:
  algorithm: |
    FOR each node in graph:
      edges_count = count(edges WHERE source = node.id OR target = node.id)
      IF edges_count == 0:
        mark as orphan

  resolution:
    strategy_1: "Procurar conexoes mais fracas (weight < 0.3 que foram ignoradas)"
    strategy_2: "Conectar a node mais proximo do mesmo dominio via 'correlated_with'"
    strategy_3: "Conectar ao node 'domain root' via 'applies_to'"
    strategy_4: "Se nenhuma conexao possivel, marcar como isolated_node no delta report"

  tolerance: "0 orphans e o objetivo. Maximo aceitavel: 2 (com justificativa)"
```

**Checkpoint:** Zero orphan nodes (ou orphans justificados)

---

### Step 6: Update Graph Metadata (1-2 min)

**Agent Activity (forte):**

Atualizar metadata do grafo com estatisticas atualizadas.

**Metadata Update:**

```json
{
  "metadata": {
    "total_nodes": "N (updated)",
    "total_edges": "N (updated)",
    "sessions_processed": "N+1",
    "last_session": "session-{N}",
    "last_modified": "2026-02-18T14:30:00Z",
    "node_type_distribution": {
      "mental_model": "N",
      "decision_framework": "N",
      "personal_construct": "N",
      "skill": "N",
      "pattern": "N",
      "value": "N",
      "belief": "N",
      "rule_of_thumb": "N",
      "metaphor": "N",
      "deep_smart": "N"
    },
    "edge_type_distribution": {
      "supports": "N",
      "contradicts": "N",
      "depends_on": "N",
      "extends": "N",
      "applies_to": "N",
      "derived_from": "N",
      "correlated_with": "N",
      "ladder_up": "N",
      "ladder_down": "N"
    },
    "domain_distribution": {
      "domain_1": "N nodes",
      "domain_2": "N nodes"
    },
    "graph_density": "edges / (nodes * (nodes-1) / 2)",
    "average_degree": "average edges per node",
    "clusters": [
      {
        "name": "cluster_name",
        "nodes": ["RM-ITEM-001", "RM-ITEM-015", "RM-ITEM-042"],
        "dominant_type": "rule_of_thumb",
        "density": 0.8
      }
    ]
  }
}
```

**Cluster Detection:**

```yaml
cluster_algorithm:
  method: "Connected component analysis + density threshold"
  min_cluster_size: 3  # Minimo 3 nodes para ser cluster
  density_threshold: 0.5  # 50%+ das possiveis edges devem existir
  naming: "Nomear cluster pelo type predominante + dominio"
```

**Checkpoint:** Metadata atualizada

---

### Step 7: Generate Delta Report (2-3 min)

**Agent Activity (forte):**

Gerar relatorio de mudancas detalhado.

**delta-{timestamp}.yaml:**

```yaml
delta_report:
  metadata:
    session: "session-{N}"
    timestamp: "2026-02-18T14:30:00Z"
    executor: "nonaka + forte"
    duration_minutes: N

  summary:
    nodes_before: N
    nodes_after: N
    nodes_added: N
    nodes_modified: N
    edges_before: N
    edges_after: N
    edges_added: N
    edges_modified: N
    edges_removed: N
    orphan_nodes_found: N
    orphan_nodes_resolved: N

  nodes_added:
    - id: "RM-ITEM-NEW-001"
      type: "rule_of_thumb"
      domain: "growth-strategy"
      source_agent: "klein"
      confidence: 0.85
      connections_created: N

    - id: "RM-ITEM-NEW-002"
      type: "pattern"
      domain: "team-leadership"
      source_agent: "leonard"
      confidence: 0.7
      connections_created: N

  nodes_modified:
    - id: "RM-ITEM-042"
      changes:
        - field: "confidence"
          old_value: 0.7
          new_value: 0.85
          reason: "Additional evidence from session"
        - field: "para_category"
          old_value: "R"
          new_value: "A"
          reason: "PARA reclassification based on usage"

  edges_added:
    - source: "RM-ITEM-NEW-001"
      target: "RM-ITEM-042"
      type: "supports"
      weight: 0.8
      evidence: "Both derived from CDM incident on retention"

    - source: "RM-ITEM-NEW-002"
      target: "RM-ITEM-015"
      type: "extends"
      weight: 0.6
      evidence: "New pattern specializes existing model"

  edges_removed:
    - source: "RM-ITEM-067"
      target: "RM-ITEM-015"
      type: "supports"
      reason: "Gap analysis revealed contradiction, not support"

  potential_connections:
    - source: "RM-ITEM-NEW-001"
      target: "RM-ITEM-089"
      type: "correlated_with"
      weight: 0.25
      reason: "Below threshold (0.3) but worth monitoring"

  insights:
    - "Cluster 'growth-strategy' grew by 3 nodes -- becoming dominant area"
    - "New contradiction detected between RM-ITEM-NEW-002 and RM-ITEM-030"
    - "Domain 'team-leadership' has low density (0.2) -- may need more extraction"

  graph_health:
    orphan_nodes: N
    broken_edges: N
    density_change: "+0.05"
    average_degree_change: "+0.3"
    overall: "HEALTHY | GROWING | FRAGMENTED | DECLINING"
```

**Checkpoint:** Delta report gerado e salvo

---

## Validation

### Checklist

- [ ] Todos os novos itens adicionados como nodes ao grafo
- [ ] Cada novo node tem tipo classificado (10 tipos possíveis)
- [ ] Cada novo node tem metadata completa (SECI, Dreyfus, domain)
- [ ] Conexoes com nodes existentes identificadas e criadas
- [ ] Edges tem weight >= 0.3 (threshold minimo)
- [ ] Zero orphan nodes (ou orphans justificados e documentados)
- [ ] Zero broken edges (source e target existem)
- [ ] Grafo JSON valido e parseavel
- [ ] Metadata do grafo atualizada (counts, distribution, clusters)
- [ ] Delta report gerado com todos os detalhes de mudanca
- [ ] Graph validation report gerado

### Success Criteria

**Threshold: 8/10 no checklist acima**

| Criteria | Excelente (3) | Aceitavel (2) | Insuficiente (1) |
|----------|--------------|----------------|-------------------|
| **Node Addition** | 100% novos itens como nodes | 95%+ | < 95% |
| **Edge Discovery** | 3+ edges por novo node | 2+ edges | < 2 edges/node |
| **Orphan Check** | 0 orphans | 1-2 justificados | 3+ orphans |
| **Metadata** | 100% campos preenchidos | 90%+ campos | < 90% |
| **Delta Report** | Completo com insights | Completo sem insights | Incompleto |
| **JSON Validity** | Valido, parseavel, schema-compliant | Valido e parseavel | Invalid |

---

## Estimated Effort

| Component | Effort | Notes |
|-----------|--------|-------|
| **Load Graph + Items** | 2-3 min | Load and validate |
| **Classify Node Types** | 2-3 min | Per-item classification |
| **Find Connections** | 3-5 min | Most intensive step |
| **Add to Graph** | 2-3 min | JSON manipulation |
| **Orphan Check** | 1-2 min | Quick scan |
| **Update Metadata** | 1-2 min | Statistics update |
| **Delta Report** | 2-3 min | Report generation |
| **Total** | 13-21 min | Scales with new item count |

---

## Integration

### Feeds To

- **TK-RM-008 (organize-para):** Graph enrichments sao inputs para PARA
- **TK-RM-010 (generate-manifest):** Graph stats sao secao do manifest
- **TK-RM-011 (generate-operating-manual):** Graph visualization no manual
- **Visualizacao:** Graph JSON pode ser renderizado por ferramentas de visualizacao

### Depends On

- **Tier 1 tasks (TK-RM-003 to TK-RM-005):** Itens extraidos por klein, leonard, kelly
- **TK-RM-006 (convert-seci):** SECI classification por nonaka
- **TK-RM-007 (validate-gaps):** Gap analysis gera edges "contradicts"

### Agent Routing

**Primary Agents:** nonaka (classification, SECI) + forte (structure, validation)
**Quality Review:** repertoire-chief (valida integridade do grafo)

---

## Notes for Executor

### O Grafo E Incremental, Nao Reconstrutivo

Nunca reconstrua o grafo do zero. Sempre adicione incrementalmente. Isso
preserva historico (created_session), evita perda de edges manuais, e
permite delta tracking.

### Edges Sao Mais Valiosos Que Nodes

Um grafo com 50 nodes e 200 edges e MAIS util que um com 200 nodes e 50
edges. Invista tempo em descobrir conexoes, nao apenas em adicionar itens.

### Contradictions Sao Features, Nao Bugs

Edges tipo "contradicts" nao devem ser removidas -- elas sao informacao
valiosa. Se argyris identificou uma contradicao, ela DEVE estar no grafo.
Remover a contradition edge e apagar informacao.

### Cluster Naming Matters

Nomes de clusters devem ser descritivos e usar linguagem do sujeito, nao
jargao academico. "Como eu gerencio equipes" e melhor que
"Team-Leadership Competency Cluster."

### Performance Considerations

Para grafos grandes (500+ nodes), o JSON pode ficar pesado. Considerar:
- Compressao (gzip)
- Particao por dominio
- Indices separados para busca rapida

Na pratica, a maioria dos repertorios tem 50-200 nodes, o que e confortavel
em um unico JSON.

### Delta Reports Sao Audit Trail

Nunca delete delta reports. Eles formam o audit trail do crescimento do
repertorio. Um ano depois, voce pode reconstruir a evolucao do
conhecimento do sujeito cruzando os deltas.

---

## Revision History

| Version | Date | Change |
|---------|------|--------|
| 1.0.0 | 2026-02-18 | Initial production release |
