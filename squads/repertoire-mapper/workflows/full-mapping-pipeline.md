---
id: WF-RM-001
name: Full Repertoire Mapping Pipeline
version: 1.0.0
description: >
  Pipeline completo de mapeamento de repertórios pessoais.
  Processa todas as fontes disponíveis (digitais + Q&A interativo)
  e produz outputs acionáveis: manifest, manual operacional,
  grafo de conhecimento e frameworks de decisão.
trigger: manual
phases:
  - PHASE_1_DIAGNOSIS
  - PHASE_2_EXTRACTION
  - PHASE_3_CONVERSION
  - PHASE_4_VALIDATION
  - PHASE_5_ORGANIZATION
  - PHASE_6_DELIVERY
agents_involved:
  - repertoire-chief
  - polanyi
  - collins
  - klein
  - leonard
  - kelly
  - nonaka
  - argyris
  - chin
  - forte
quality_gates:
  - QG-001: Source Classification
  - QG-002: Diagnosis Complete
  - QG-003: Extraction Quality
  - QG-004: Systematization Review
  - QG-005: Final Validation
estimated_duration: 2-6 hours (depends on source count)
input: >
  Fontes disponíveis (livro, vídeos, transcrições, redes sociais)
  + acesso ao sujeito para Q&A interativo
output: >
  repertoire-manifest.yaml, operating-manual.md, knowledge-graph.json,
  decision-frameworks.yaml, expertise-profile.md, gap-analysis.md
---

# Full Repertoire Mapping Pipeline

## Overview

Pipeline end-to-end para mapear todos os repertórios de uma pessoa.
Combina extração de fontes digitais com sessões de Q&A interativo
para capturar tanto conhecimento explícito quanto tácito.

## Pipeline Flow

```
INPUT: Fontes + Acesso ao Sujeito
    │
    ▼
┌──────────────────────────────┐
│  PHASE 1: DIAGNOSIS          │
│  agents: polanyi + collins    │
│  gate: QG-001, QG-002        │
│  output: expertise-profile    │
└──────────────┬───────────────┘
               │
    ┌──────────┼──────────┐
    ▼          ▼          ▼
┌────────┐ ┌────────┐ ┌────────┐
│ PHASE 2A│ │PHASE 2B│ │PHASE 2C│
│ CDM     │ │Deep    │ │Reperto-│
│ Extract │ │Smarts  │ │ry Grid │
│ klein   │ │leonard │ │ kelly  │
└────┬───┘ └───┬────┘ └───┬────┘
     │         │           │
     └─────────┼───────────┘
               │
               ▼  gate: QG-003
┌──────────────────────────────┐
│  PHASE 3: CONVERSION (SECI)  │
│  agent: nonaka                │
│  gate: QG-004                 │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  PHASE 4: VALIDATION          │
│  agent: argyris               │
│  gate: QG-005                 │
└──────────────┬───────────────┘
               │
        ┌──────┴──────┐
        ▼             ▼
┌────────────┐ ┌────────────┐
│ PHASE 5A   │ │ PHASE 5B   │
│ Organize   │ │ Translate  │
│ forte      │ │ chin       │
└─────┬──────┘ └──────┬─────┘
      │               │
      └───────┬───────┘
              ▼
┌──────────────────────────────┐
│  PHASE 6: DELIVERY            │
│  agent: repertoire-chief      │
│  output: Final artifacts      │
└──────────────────────────────┘
```

---

## PHASE 1: DIAGNOSIS

**Duration:** 15-30 minutes
**Agents:** `polanyi` → `collins`
**Gates:** QG-001 (Source Classification), QG-002 (Diagnosis Complete)

### Step 1.1: Source Inventory

**Agent:** `repertoire-chief`

```yaml
actions:
  - inventory_sources:
      digital:
        - books: "Listar livros publicados, manuscritos"
        - videos: "YouTube, lives gravadas, webinars"
        - social: "Instagram, LinkedIn, Twitter posts"
        - transcriptions: "Mentorias, consultorias, podcasts"
        - documents: "Artigos, apresentações, frameworks escritos"
      interactive:
        - qa_sessions: "Disponibilidade para Q&A com Kelly Repertory Grid"
        - interviews: "Disponibilidade para CDM com Klein"

  - classify_sources:
      explicit_heavy: "Livros, artigos, apresentações"
      tacit_heavy: "Mentorias, consultorias, decisões"
      mixed: "Lives, vídeos, social media"
```

**QG-001 Check:**
- [ ] Pelo menos 3 fontes identificadas
- [ ] Pelo menos 1 fonte de conhecimento tácito
- [ ] Objetivo do mapeamento claro

### Step 1.2: Epistemological Classification

**Agent:** `polanyi`

```yaml
actions:
  - sample_sources:
      take: 2-3 representative sources
      analyze_for:
        - tacit_explicit_ratio: "Proporção estimada tácito/explícito"
        - proximal_distal_patterns: "O que é subsidiário vs focal"
        - personal_knowledge_markers: "Onde o compromisso pessoal é visível"
        - indwelling_evidence: "Ferramentas/conceitos em que a pessoa 'habita'"

  - produce:
      epistemological_map:
        knowledge_types:
          - type: "explicit_articulated"
            estimated_percentage: N%
            sources: ["..."]
          - type: "tacit_relational"
            estimated_percentage: N%
            sources: ["..."]
          - type: "tacit_somatic"
            estimated_percentage: N%
            sources: ["..."]
          - type: "tacit_collective"
            estimated_percentage: N%
            sources: ["..."]
```

### Step 1.3: Expertise Profiling

**Agent:** `collins`

```yaml
actions:
  - apply_periodic_table:
      for_each_domain_area:
        - identify_expertise_level:
            levels:
              - beer_mat: "Knows the basics, cocktail party knowledge"
              - popular: "Read popular books, understands key concepts"
              - primary_source: "Read academic/primary sources"
              - interactional: "Can converse with practitioners"
              - contributory: "Can actually DO the work"

        - classify_tacit_type:
            types:
              - relational: "Could be made explicit but hasn't been"
              - somatic: "Embodied in body/practice"
              - collective: "Embedded in social practice"

  - produce:
      expertise_profile:
        domain_areas:
          - area: "Area Name"
            expertise_level: "contributory"
            tacit_type: "somatic + relational"
            dreyfus_stage: "proficient"
            extraction_priority: "high"
            recommended_method: "klein_cdm"
```

**QG-002 Check:**
- [ ] Epistemological map produced
- [ ] Expertise profile for 5+ domain areas
- [ ] Extraction methods recommended per area
- [ ] Priority ranking established

---

## PHASE 2: EXTRACTION (Parallel)

**Duration:** 1-3 hours
**Agents:** `klein` + `leonard` + `kelly` (in parallel where possible)
**Gate:** QG-003 (Extraction Quality)

### Step 2A: CDM Extraction (Deep Incidents)

**Agent:** `klein`
**Input:** High-priority areas from expertise profile
**Method:** Critical Decision Method

```yaml
per_priority_area:
  - select_critical_incident:
      criteria: "Momento de decisão difícil, virada, insight"
      prompt: "Conte-me sobre uma vez em que você teve que tomar uma decisão
               difícil em [área]. O que aconteceu?"

  - walk_through_timeline:
      probes:
        - "O que você notou primeiro?"
        - "O que te chamou a atenção?"
        - "O que um novato teria perdido?"
        - "Quais alternativas você considerou?"
        - "Como você sabia que era a decisão certa?"

  - extract:
      - cues: "Sinais que o expert reconhece"
      - patterns: "Padrões recorrentes"
      - mental_models: "Modelos mentais implícitos"
      - rules_of_thumb: "Heurísticas de decisão"
      - anomalies: "O que surpreendeu o expert"
```

### Step 2B: Deep Smarts Identification

**Agent:** `leonard`
**Input:** Expertise profile + available sources
**Method:** Deep Smarts Framework

```yaml
per_domain_area:
  - assess_6_characteristics:
      - deep_domain_knowledge: "Extensão e profundidade"
      - pattern_recognition: "Capacidade de ver padrões invisíveis a outros"
      - system_perspective: "Compreensão de interdependências"
      - context_awareness: "Sensibilidade ao contexto"
      - diagnostic_acuity: "Velocidade e precisão de diagnóstico"
      - skilled_networking: "Saber quem sabe o quê"

  - prioritize_by:
      urgency: "Risco de perda se não mapeado"
      uniqueness: "Só esta pessoa tem?"
      impact: "Quanto afeta resultados"

  - produce:
      deep_smarts_inventory:
        critical_items: ["..."]
        important_items: ["..."]
        nice_to_have: ["..."]
```

### Step 2C: Repertory Grid Q&A

**Agent:** `kelly`
**Input:** Domain areas for Q&A exploration
**Method:** Repertory Grid Technique

```yaml
per_domain_area:
  - select_elements:
      count: 8-12
      types: "Projetos, decisões, ferramentas, pessoas, situações"
      prompt: "Liste 10 [projetos/decisões/etc] significativos na sua
               experiência com [área]"

  - elicit_constructs_via_triads:
      iterations: 8-15
      prompt: "Destes 3 elementos, quais 2 são mais parecidos?
               Em que sentido? Como o 3º é diferente?"

  - rate_elements:
      scale: 1-5
      prompt: "Para cada [elemento], avalie de 1 a 5 neste critério:
               [construto emergente] vs [polo oposto]"

  - analyze:
      - cluster_analysis: "Agrupar construtos similares"
      - principal_components: "Identificar dimensões principais"
      - core_constructs: "Construtos mais discriminativos"
```

**QG-003 Check:**
- [ ] Mínimo 10 itens de repertório extraídos
- [ ] Cada item tem evidência/fonte associada
- [ ] Pelo menos 2 métodos de extração usados
- [ ] Core constructs identificados (kelly)
- [ ] Deep smarts priorizados (leonard)

---

## PHASE 3: CONVERSION (SECI)

**Duration:** 30-60 minutes
**Agent:** `nonaka`
**Gate:** QG-004 (Systematization Review)

### Step 3.1: Externalization (Tacit → Explicit)

```yaml
for_each_extracted_item:
  - articulate_through:
      metaphors: "Encontrar metáforas que capturam a essência"
      models: "Criar modelos visuais/conceituais"
      concepts: "Definir termos precisos"
      analogies: "Conectar a domínios familiares"

  - classify_as_knowledge_asset:
      experiential: "Conhecimento tácito compartilhado (habilidades, know-how)"
      conceptual: "Conhecimento explícito articulado (conceitos, designs)"
      systemic: "Conhecimento explícito sistematizado (manuais, DBs)"
      routine: "Conhecimento tácito rotinizado (cultura, práticas)"
```

### Step 3.2: Combination (Explicit → Explicit)

```yaml
actions:
  - cross_reference:
      find_connections: "Entre itens de diferentes fontes/métodos"
      identify_clusters: "Agrupamentos temáticos"
      build_hierarchy: "Do mais abstrato ao mais concreto"

  - systematize:
      create_taxonomy: "Categorias e subcategorias"
      map_relationships: "Dependências, complementaridades, conflitos"
      generate_knowledge_graph_draft: "Nós + arestas"
```

### Step 3.3: Quality Check

```yaml
verify:
  - all_items_classified: true
  - knowledge_asset_types_balanced: true
  - cross_references_established: true
  - no_orphan_nodes: true
```

**QG-004 Check:**
- [ ] Todos os itens classificados por tipo SECI
- [ ] Taxonomia criada
- [ ] Draft do knowledge graph gerado
- [ ] Cross-references entre fontes diferentes

---

## PHASE 4: VALIDATION

**Duration:** 20-40 minutes
**Agent:** `argyris`
**Gate:** QG-005 (Final Validation)

### Step 4.1: Espoused vs Theory-in-Use Check

```yaml
for_each_major_knowledge_area:
  - compare:
      espoused: "O que o sujeito DIZ que sabe/faz (de Q&A e fontes escritas)"
      theory_in_use: "O que as evidências de PRÁTICA mostram (de CDM e análise)"

  - identify_gaps:
      type: "contradiction | blind_spot | aspiration | growth_edge"
      severity: "critical | moderate | minor"
      evidence: "Fontes que evidenciam o gap"
```

### Step 4.2: Ladder of Inference Audit

```yaml
for_critical_decision_frameworks:
  - trace_inference_chain:
      observable_data: "O que realmente aconteceu"
      selected_data: "O que o sujeito escolheu focar"
      meanings: "Significados atribuídos"
      assumptions: "Premissas subjacentes"
      conclusions: "Conclusões tiradas"
      beliefs: "Crenças formadas"
      actions: "Ações resultantes"

  - flag: "Saltos na cadeia, dados ignorados, premissas não testadas"
```

### Step 4.3: Double-Loop Opportunities

```yaml
identify:
  - single_loop_patterns: "Onde o sujeito corrige erros sem questionar premissas"
  - double_loop_opportunities: "Onde questionar premissas abriria novos repertórios"
  - model_I_behaviors: "Raciocínio defensivo, controle unilateral"
  - model_II_opportunities: "Transparência, escolha livre, compromisso interno"
```

**QG-005 Check:**
- [ ] Gap analysis completa para áreas principais
- [ ] Nenhuma contradição crítica não resolvida
- [ ] Ladder of inference auditada para frameworks de decisão
- [ ] Double-loop opportunities documentadas

---

## PHASE 5: ORGANIZATION (Parallel)

**Duration:** 20-30 minutes
**Agents:** `forte` + `chin` (em paralelo)

### Step 5A: Knowledge Organization (forte)

```yaml
actions:
  - apply_para:
      projects: "Repertórios ligados a projetos ativos"
      areas: "Áreas de responsabilidade permanente"
      resources: "Referências e materiais de apoio"
      archives: "Repertórios inativos ou históricos"

  - progressive_summarize:
      pass_1: "Capture — todos os itens extraídos"
      pass_2: "Bold — itens mais relevantes destacados"
      pass_3: "Highlight — essência de cada item"
      pass_4: "Executive Summary — 1 frase por item"

  - build_artifacts:
      - repertoire-manifest.yaml
      - knowledge-graph.json
      - repertoire-index.md
      - decision-frameworks.yaml
```

### Step 5B: Translation (chin)

```yaml
actions:
  - translate_to_practitioner:
      strip_jargon: true
      add_examples: "Do próprio domínio do sujeito"
      create_if_then_rules: "De princípios abstratos"
      build_case_library: "De padrões extraídos"

  - produce:
      - operating-manual.md: "Manual operacional em linguagem acessível"
      - quick-reference.md: "Guia rápido de repertórios principais"
```

---

## PHASE 6: DELIVERY

**Duration:** 5-10 minutes
**Agent:** `repertoire-chief`

### Step 6.1: Assemble Final Package

```yaml
final_artifacts:
  primary:
    - file: repertoire-manifest.yaml
      description: "Mapa completo de repertórios (YAML estruturado)"
    - file: operating-manual.md
      description: "Manual operacional pessoal"
    - file: knowledge-graph.json
      description: "Grafo de conhecimento (nós + conexões)"
    - file: decision-frameworks.yaml
      description: "Heurísticas e frameworks de decisão extraídos"

  secondary:
    - file: expertise-profile.md
      description: "Perfil de expertise (Periodic Table aplicada)"
    - file: gap-analysis.md
      description: "Análise de gaps (espoused vs actual)"
    - file: repertoire-index.md
      description: "Índice navegável de repertórios"
    - file: session-transcripts/
      description: "Transcrições de sessões Q&A"
```

### Step 6.2: Summary Report

```yaml
report:
  total_repertoire_items: N
  knowledge_types:
    explicit: N%
    tacit_relational: N%
    tacit_somatic: N%
    tacit_collective: N%
  expertise_areas_mapped: N
  quality_gates_passed: 5/5
  gaps_identified: N
  double_loop_opportunities: N
  recommended_next_steps:
    - "..."
```

---

## Error Handling

```yaml
error_handling:
  source_unavailable:
    action: "Skip source, note in report, continue with available sources"
    minimum: "At least 2 sources required to proceed"

  extraction_insufficient:
    action: "Run additional Q&A sessions with kelly"
    minimum: "10 items required at QG-003"

  validation_contradictions:
    action: "Present to subject for resolution, document either way"
    critical: "Block until resolved"
    moderate: "Document and proceed"

  subject_unavailable_for_qa:
    action: "Proceed with digital sources only"
    note: "Flag as incomplete — tacit knowledge likely undermapped"
```

---

## Session Management

Este workflow pode ser executado em uma única sessão ou dividido em múltiplas:

| Session | Phases | Duration |
|---------|--------|----------|
| Session 1 | Phase 1 (Diagnosis) | 30 min |
| Session 2 | Phase 2A-2B (Digital Extraction) | 1-2 hours |
| Session 3 | Phase 2C (Q&A Session) | 30-60 min |
| Session 4 | Phases 3-6 (Convert, Validate, Organize, Deliver) | 1-2 hours |

Estado é persistido entre sessões via `repertoire-chief` context tracking.

---

_Workflow Version: 1.0.0_
_Last Updated: 2026-02-18_
