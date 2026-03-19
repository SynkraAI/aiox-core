---
id: TK-RM-010
name: Generate Repertoire Manifest
version: 1.0.0
executor: forte
purpose: >
  Gerar repertoire-manifest.yaml -- o mapa completo e estruturado de todos
  os repertorios mapeados do sujeito. O manifest e o artefato central do
  pipeline: consolida itens extraidos, validados, organizados e traduzidos
  em um unico documento YAML estruturado com metadata completa (confidence,
  source, seci_stage, dreyfus_level, para_category).
squad: repertoire-mapper
phase: PHASE_6_DELIVERY
tier: 3

inputs:
  - name: extracted_items
    type: list
    description: "Todos os itens de repertorio extraidos e validados"
    required: true
    format: "YAML array completo"
    location: "outputs/repertoire/{slug}/extracted-items.yaml"

  - name: gap_analysis
    type: document
    description: "Gap analysis por argyris (TK-RM-007)"
    required: true
    format: "YAML estruturado"
    location: "outputs/repertoire/{slug}/gap-analysis.yaml"

  - name: para_summary
    type: document
    description: "Resumo PARA por forte (TK-RM-008)"
    required: true
    format: "YAML"
    location: "outputs/repertoire/{slug}/para-summary.yaml"

  - name: practitioner_items
    type: list
    description: "Itens traduzidos por chin (TK-RM-009)"
    required: true
    format: "YAML com traducoes"
    location: "outputs/repertoire/{slug}/practitioner-items.yaml"

  - name: knowledge_graph
    type: document
    description: "Knowledge graph atualizado (TK-RM-012 ou draft de nonaka)"
    required: true
    format: "JSON com nodes e edges"
    location: "outputs/repertoire/{slug}/knowledge-graph.json"

  - name: expertise_profile
    type: document
    description: "Perfil de expertise por collins (Tier 0)"
    required: true
    format: "Markdown"
    location: "outputs/repertoire/{slug}/expertise-profile.md"

  - name: epistemological_map
    type: document
    description: "Mapa epistemologico por polanyi (Tier 0)"
    required: true
    format: "YAML"
    location: "outputs/repertoire/{slug}/epistemological-map.yaml"

  - name: translation_dictionary
    type: document
    description: "Dicionario de traducoes por chin (TK-RM-009)"
    required: false
    format: "YAML"
    location: "outputs/repertoire/{slug}/translation-log.yaml"

preconditions:
  - "QG-005 passado (Final Validation)"
  - "TK-RM-008 (organize-para) completo"
  - "TK-RM-009 (translate-output) completo"
  - "Todos os itens com metadata completa"
  - "Gap analysis integrado"
  - "Knowledge graph disponivel"
  - "Agente forte carregado"

outputs:
  - name: repertoire_manifest
    path: "outputs/repertoire/{slug}/repertoire-manifest.yaml"
    format: yaml
    description: >
      Manifest completo e estruturado de todos os repertorios.
      Artefato central do pipeline de mapeamento.

  - name: manifest_summary
    path: "outputs/repertoire/{slug}/manifest-summary.md"
    format: markdown
    description: >
      Resumo executivo do manifest em formato legivel.

  - name: manifest_validation
    path: "outputs/repertoire/{slug}/manifest-validation.yaml"
    format: yaml
    description: >
      Resultado da validacao de completude do manifest.

validation:
  success_criteria:
    - "100% dos itens validados incluidos no manifest"
    - "Cada item tem metadata completa (8 campos obrigatorios)"
    - "Domains organizados por PARA category"
    - "Gap analysis integrado como secao do manifest"
    - "Knowledge graph referenciado"
    - "Statisticas de cobertura precisas"
    - "YAML valido e parseavel"
    - "Manifest summary legivel e preciso"
  quality_threshold: "9/10 no checklist completo"
---

# Task: Generate Repertoire Manifest

## Executive Summary

O repertoire-manifest.yaml e o artefato central e definitivo do pipeline de
mapeamento. Ele consolida TODOS os outputs de TODOS os agentes em um unico
documento YAML estruturado, navegavel e programaticamente consumivel. O manifest
e a fonte de verdade sobre o repertorio do sujeito -- outros squads, ferramentas
e processos podem consumir este arquivo para personalizar interacoes, gerar
conteudo, ou construir clones cognitivos.

**Posicao no Pipeline:** Task 10 -- Phase 6 (Delivery) do Full Mapping Pipeline
**Definicao de Sucesso:** Manifest completo, valido, com 100% dos itens e metadata
**Dependencia Critica:** Depende de TK-RM-008 e TK-RM-009 estarem completos

---

## Purpose

Ate este ponto, o pipeline produziu dezenas de arquivos: extracted-items.yaml,
gap-analysis.yaml, para-summary.yaml, practitioner-items.yaml, knowledge-graph.json,
expertise-profile.md, epistemological-map.yaml, cdm-extractions.yaml,
deep-smarts-inventory.yaml, repertory-grid.yaml, seci-classification.yaml.

Esses arquivos sao intermediarios. Nenhum deles e o "produto final" do
mapeamento. O manifest unifica tudo em um unico ponto de acesso.

**Analogia:** Se o pipeline e uma fabrica, os arquivos intermediarios sao
componentes. O manifest e o produto montado e embalado.

**Quem consome o manifest:**

1. **O sujeito** -- Via operating-manual.md e quick-reference.md (gerados a partir do manifest)
2. **Outros squads** -- Content Distillery, Clone Deploy, Copywriter OS (leem o manifest para contexto)
3. **Ferramentas de IA** -- Sistemas que precisam entender as competencias do sujeito
4. **Processos futuros** -- Remapeamentos incrementais partem do manifest anterior

---

## Executor Type

**Agent: forte (100% automatizado)**

- **Agent Role:** Compilacao, estruturacao, validacao de completude, geracao de summary
- **Human Role:** Nenhum durante geracao (humano pode revisar depois)
- **Estimated Runtime:** 10-20 minutos

---

## Steps

### Step 1: Load All Pipeline Outputs (2-3 min)

**Agent Activity:**

- Carregar TODOS os outputs de TODOS os agentes que participaram do pipeline
- Verificar que nenhum output esta faltando
- Criar inventario de fontes para o manifest

**Source Inventory:**

```yaml
manifest_sources:
  tier_0:
    polanyi:
      file: "epistemological-map.yaml"
      status: loaded/missing
      items_contributed: N
    collins:
      file: "expertise-profile.md"
      status: loaded/missing
      domains_profiled: N

  tier_1:
    klein:
      file: "cdm-extractions.yaml"
      status: loaded/missing
      items_contributed: N
    leonard:
      file: "deep-smarts-inventory.yaml"
      status: loaded/missing
      items_contributed: N
    kelly:
      file: "repertory-grid.yaml"
      status: loaded/missing
      constructs_extracted: N

  tier_2:
    nonaka:
      file: "seci-classification.yaml"
      status: loaded/missing
      items_classified: N
    argyris:
      file: "gap-analysis.yaml"
      status: loaded/missing
      gaps_identified: N

  tier_3:
    forte:
      file: "para-summary.yaml"
      status: loaded/missing
      items_organized: N
    chin:
      file: "practitioner-items.yaml"
      status: loaded/missing
      items_translated: N

  graphs:
    knowledge_graph:
      file: "knowledge-graph.json"
      status: loaded/missing
      nodes: N
      edges: N
```

**Completeness Check:**

```yaml
completeness:
  required_sources: 6
  loaded_sources: N
  missing_sources: ["..."]
  can_proceed: true/false  # true se >= 4 required sources loaded
  warnings: ["Missing source X -- manifest will be partial"]
```

**Checkpoint:** Todos os sources carregados, completude verificada

---

### Step 2: Structure Manifest by Domain (3-5 min)

**Agent Activity:**

Organizar itens de repertorio em dominos (areas de expertise), dentro de
cada dominio por PARA category, e enriquecer cada item com metadata completa.

**Manifest Top-Level Structure:**

```yaml
repertoire_manifest:
  version: "1.0.0"
  schema: "repertoire-manifest/v1"
  generated: "2026-02-18T14:30:00Z"
  generator: "repertoire-mapper-squad/forte"

  # ─────────────────────────────────────────
  # SUBJECT IDENTITY
  # ─────────────────────────────────────────
  subject:
    name: "{nome completo}"
    slug: "{slug}"
    primary_domains:
      - "domain_1"
      - "domain_2"
    mapping_date: "2026-02-18"
    pipeline_version: "1.0.0"
    pipeline_phases_completed:
      - PHASE_1_DIAGNOSIS
      - PHASE_2_EXTRACTION
      - PHASE_3_CONVERSION
      - PHASE_4_VALIDATION
      - PHASE_5_ORGANIZATION
      - PHASE_6_DELIVERY

  # ─────────────────────────────────────────
  # SUMMARY STATISTICS
  # ─────────────────────────────────────────
  statistics:
    total_items: N
    by_type:
      mental_model: N
      decision_framework: N
      personal_construct: N
      skill: N
      pattern: N
      value: N
      belief: N
      rule_of_thumb: N
      metaphor: N
      deep_smart: N
    by_dreyfus:
      novice: N
      advanced_beginner: N
      competent: N
      proficient: N
      expert: N
    by_para:
      projects: N
      areas: N
      resources: N
      archives: N
    by_seci:
      socialization: N
      externalization: N
      combination: N
      internalization: N
    by_confidence:
      high: N     # >= 0.8
      medium: N   # 0.6-0.79
      low: N      # < 0.6
    by_source_agent:
      klein: N
      leonard: N
      kelly: N
      polanyi: N
      collins: N
    gaps:
      total: N
      critical: N
      significant: N
      minor: N
    knowledge_graph:
      nodes: N
      edges: N
      clusters: N

  # ─────────────────────────────────────────
  # DOMAINS
  # ─────────────────────────────────────────
  domains:
    - domain: "domain_name_1"
      dreyfus_level: "proficient"
      collins_level: "contributory"
      expertise_type: "somatic + relational"
      para_category: "A"  # Predominant
      item_count: N
      gap_count: N

      items:
        - id: "RM-ITEM-001"
          title: "Titulo original"
          practitioner_title: "Titulo traduzido por chin"
          type: "mental_model"
          description: "Descricao original"
          practitioner_description: "Descricao traduzida por chin"
          confidence: 0.85
          source_agent: "klein"
          source_evidence: "CDM incident #3"
          dreyfus_level: "proficient"
          seci_stage: "externalization"
          para_category: "A"
          para_area: "growth-strategy"

          # Metadata completa
          metadata:
            extraction_method: "cdm"
            extraction_date: "2026-02-18"
            polanyi_classification: "tacit_relational"
            collins_expertise: "contributory"
            actionability_score: 0.9
            lifecycle_stage: "active"
            knowledge_asset_type: "experiential"

          # Heuristica (se aplicavel)
          heuristic:
            situation: "Quando X acontece"
            action: "Faca Y"
            because: "Porque Z"
            practitioner_version:
              situation: "Versao em linguagem pratica"
              action: "Versao em linguagem pratica"
              because: "Versao em linguagem pratica"

          # Progressive Summary
          progressive_summary:
            layer_3: "Resumo em 2-3 frases"
            layer_4: "Resumo em 1 frase"

          # Cross-references
          cross_references:
            - target: "RM-ITEM-015"
              type: "supports"
            - target: "RM-ITEM-067"
              type: "contradicts"

          # Gap (se houver)
          gap:
            type: "hidden_expertise"
            severity: "significant"
            description: "Descricao do gap"
            status: "surfaced"

    - domain: "domain_name_2"
      # ... same structure ...

  # ─────────────────────────────────────────
  # GAP ANALYSIS SUMMARY
  # ─────────────────────────────────────────
  gap_analysis:
    executor: "argyris"
    date: "2026-02-18"
    total_gaps: N
    critical_gaps: N
    all_critical_resolved: true/false
    gaps:
      - id: "GAP-001"
        type: "contradiction"
        severity: "critical"
        domain: "domain_1"
        items_involved: ["RM-ITEM-015", "RM-ITEM-067"]
        description: "Descricao"
        practitioner_description: "Versao traduzida"
        resolution: "Como foi ou sera resolvido"
        status: "resolved | open | documented"

    double_loop_opportunities:
      - id: "DL-001"
        domain: "domain_1"
        current_pattern: "Descricao do single-loop"
        opportunity: "Descricao do double-loop"
        practitioner_version: "Versao traduzida"
        impact: "high"

    model_assessment:
      overall: "Mixed"
      by_domain:
        - domain: "domain_1"
          dominant: "Model I"
          model_I_score: 0.7
          model_II_score: 0.3

  # ─────────────────────────────────────────
  # KNOWLEDGE GRAPH REFERENCE
  # ─────────────────────────────────────────
  knowledge_graph:
    file: "knowledge-graph.json"
    nodes: N
    edges: N
    node_types:
      mental_model: N
      decision_framework: N
      personal_construct: N
      skill: N
      pattern: N
      value: N
      belief: N
      rule_of_thumb: N
      metaphor: N
      deep_smart: N
    edge_types:
      supports: N
      contradicts: N
      depends_on: N
      extends: N
      applies_to: N
      derived_from: N
      correlated_with: N
      ladder_up: N
      ladder_down: N
    clusters:
      - name: "cluster_name"
        nodes: N
        dominant_type: "mental_model"

  # ─────────────────────────────────────────
  # PIPELINE METADATA
  # ─────────────────────────────────────────
  pipeline:
    started: "2026-02-18T09:00:00Z"
    completed: "2026-02-18T14:30:00Z"
    duration_hours: 5.5
    agents_used:
      - agent: "polanyi"
        phase: "PHASE_1_DIAGNOSIS"
        items_produced: N
      - agent: "collins"
        phase: "PHASE_1_DIAGNOSIS"
        items_produced: N
      - agent: "klein"
        phase: "PHASE_2_EXTRACTION"
        items_produced: N
      - agent: "leonard"
        phase: "PHASE_2_EXTRACTION"
        items_produced: N
      - agent: "kelly"
        phase: "PHASE_2_EXTRACTION"
        items_produced: N
      - agent: "nonaka"
        phase: "PHASE_3_CONVERSION"
        items_classified: N
      - agent: "argyris"
        phase: "PHASE_4_VALIDATION"
        gaps_found: N
      - agent: "forte"
        phase: "PHASE_5_ORGANIZATION"
        items_organized: N
      - agent: "chin"
        phase: "PHASE_5_ORGANIZATION"
        items_translated: N
    quality_gates:
      - gate: "QG-001"
        status: "PASSED"
        score: "N/N"
      - gate: "QG-002"
        status: "PASSED"
        score: "N/N"
      - gate: "QG-003"
        status: "PASSED"
        score: "N/N"
      - gate: "QG-004"
        status: "PASSED"
        score: "N/N"
      - gate: "QG-005"
        status: "PASSED"
        score: "N/N"
    sources_used:
      digital: ["lista de fontes digitais"]
      interactive: ["lista de sessoes Q&A"]
    completeness_score: 0.0-1.0
```

**Checkpoint:** Manifest estruturado com todos os domains e itens

---

### Step 3: Validate Manifest Completeness (2-3 min)

**Agent Activity:**

Executar validacao sistematica de que o manifest esta completo e consistente.

**Validation Checks:**

```yaml
manifest_validation:
  structural_checks:
    - check: "YAML valido e parseavel"
      status: PASS/FAIL
    - check: "Schema version presente"
      status: PASS/FAIL
    - check: "Subject identity completa"
      status: PASS/FAIL
    - check: "Statistics section presente"
      status: PASS/FAIL

  completeness_checks:
    - check: "100% dos itens validados incluidos"
      expected: N
      actual: N
      status: PASS/FAIL
    - check: "Cada item tem id unico"
      duplicates: N
      status: PASS/FAIL
    - check: "Cada item tem 8 campos obrigatorios"
      fields: [id, title, type, confidence, source_agent, dreyfus_level, seci_stage, para_category]
      items_complete: N/N
      status: PASS/FAIL

  metadata_checks:
    - check: "Dreyfus level atribuido a todos os itens"
      coverage: N/N
      status: PASS/FAIL
    - check: "SECI stage atribuido a todos os itens"
      coverage: N/N
      status: PASS/FAIL
    - check: "PARA category atribuida a todos os itens"
      coverage: N/N
      status: PASS/FAIL
    - check: "Confidence score presente em todos os itens"
      coverage: N/N
      status: PASS/FAIL
    - check: "Source agent registrado em todos os itens"
      coverage: N/N
      status: PASS/FAIL

  consistency_checks:
    - check: "Statistics batem com contagem real de itens"
      status: PASS/FAIL
    - check: "Gap analysis references existem no manifest"
      status: PASS/FAIL
    - check: "Cross-references apontam para itens existentes"
      broken_refs: N
      status: PASS/FAIL
    - check: "Knowledge graph node count bate com manifest"
      status: PASS/FAIL

  translation_checks:
    - check: "Practitioner title presente nos itens (de chin)"
      coverage: N/N
      status: PASS/FAIL
    - check: "Practitioner description presente nos itens"
      coverage: N/N
      status: PASS/FAIL
    - check: "Progressive summary presente nos itens PARA A e P"
      coverage: N/N
      status: PASS/FAIL

  overall:
    total_checks: N
    passed: N
    failed: N
    warnings: N
    verdict: "VALID | VALID_WITH_WARNINGS | INVALID"
    completeness_score: 0.0-1.0
```

**Checkpoint:** Validacao completa, issues documentados

---

### Step 4: Generate Manifest Summary (2-3 min)

**Agent Activity:**

Criar um resumo executivo do manifest em formato markdown legivel.

**manifest-summary.md:**

```markdown
# Repertoire Manifest Summary

## Subject: {Nome do Sujeito}
**Generated:** {YYYY-MM-DD}
**Pipeline Version:** 1.0.0
**Completeness:** {X}%

---

## At a Glance

| Metric | Value |
|--------|-------|
| Total Repertoire Items | {N} |
| Domains Mapped | {N} |
| Expertise Areas (Proficient+) | {N} |
| Decision Frameworks | {N} |
| Rules of Thumb | {N} |
| Deep Smarts | {N} |
| Gaps Identified | {N} (Critical: {N}) |
| Knowledge Graph Nodes | {N} |
| Knowledge Graph Edges | {N} |

---

## Domain Overview

### {Domain 1}: {Dreyfus Level}
- **Items:** {N}
- **PARA:** Predominantly {P/A/R/Ar}
- **Top 3 Items:**
  1. {Practitioner title} (confidence: {X})
  2. {Practitioner title} (confidence: {X})
  3. {Practitioner title} (confidence: {X})
- **Gaps:** {N} ({highest severity})

### {Domain 2}: {Dreyfus Level}
...

---

## Key Findings

### Strongest Areas
{Areas com Dreyfus Expert/Proficient e alta confidence}

### Hidden Expertise (Revealed by Mapping)
{Itens que o sujeito nao sabia que tinha}

### Growth Opportunities
{Double-loop opportunities e areas com gaps produtivos}

### Risk Areas
{Contradicoes criticas, blind spots significativos}

---

## Pipeline Performance

| Phase | Duration | Quality Gate |
|-------|----------|-------------|
| Diagnosis | {X} min | QG-001: PASS, QG-002: PASS |
| Extraction | {X} min | QG-003: PASS |
| Conversion | {X} min | QG-004: PASS |
| Validation | {X} min | QG-005: PASS |
| Organization | {X} min | -- |
| Delivery | {X} min | -- |

**Total Pipeline Duration:** {X} hours

---

## Files Generated

| File | Format | Size | Description |
|------|--------|------|-------------|
| repertoire-manifest.yaml | YAML | {X} KB | Manifest completo |
| operating-manual.md | Markdown | {X} KB | Manual operacional |
| knowledge-graph.json | JSON | {X} KB | Grafo de conhecimento |
| gap-analysis.md | Markdown | {X} KB | Analise de gaps |
| quick-reference.md | Markdown | {X} KB | Guia rapido |
| repertoire-index.md | Markdown | {X} KB | Indice navegavel |
| expertise-profile.md | Markdown | {X} KB | Perfil de expertise |
```

**Checkpoint:** Summary gerado

---

### Step 5: Final Assembly and Write (2-3 min)

**Agent Activity:**

- Escrever repertoire-manifest.yaml no path final
- Escrever manifest-summary.md
- Escrever manifest-validation.yaml
- Verificar que todos os arquivos foram escritos corretamente
- Validar que YAML e parseavel com parser YAML

**Post-Write Verification:**

```yaml
post_write:
  - file: "repertoire-manifest.yaml"
    written: true/false
    size_kb: N
    yaml_valid: true/false
  - file: "manifest-summary.md"
    written: true/false
    size_kb: N
  - file: "manifest-validation.yaml"
    written: true/false
    yaml_valid: true/false
```

**Checkpoint:** Todos os arquivos escritos e verificados

---

## Validation

### Checklist

- [ ] Manifest YAML valido e parseavel
- [ ] Schema version e subject identity presentes
- [ ] 100% dos itens validados incluidos
- [ ] Cada item tem 8 campos obrigatorios (id, title, type, confidence, source_agent, dreyfus_level, seci_stage, para_category)
- [ ] Practitioner translations integradas (de chin)
- [ ] Progressive summaries integradas (de forte)
- [ ] Gap analysis integrado como secao
- [ ] Knowledge graph referenciado com stats
- [ ] Pipeline metadata completa (agentes, gates, duration)
- [ ] Statistics section bate com contagem real
- [ ] Cross-references apontam para itens existentes
- [ ] Manifest summary gerado e legivel
- [ ] Manifest validation report gerado

### Success Criteria

**Threshold: 9/10 no checklist acima** (manifest precisa ser near-perfect)

| Criteria | Excelente (3) | Aceitavel (2) | Insuficiente (1) |
|----------|--------------|----------------|-------------------|
| **Completeness** | 100% itens, 100% metadata | 95%+ itens, 90%+ metadata | < 95% itens |
| **Structure** | Schema-compliant, parseavel | Parseavel com warnings | Invalid YAML |
| **Integration** | Gaps + PARA + translations | 2 de 3 integrados | < 2 integrados |
| **Statistics** | 100% precisas | < 5% desvio | > 5% desvio |
| **Summary** | Completo e legivel | Completo mas verbose | Incompleto |
| **Validation** | All checks PASS | < 3 warnings | Failures presentes |

---

## Estimated Effort

| Component | Effort | Notes |
|-----------|--------|-------|
| **Load Sources** | 2-3 min | Load and verify all inputs |
| **Structure Manifest** | 3-5 min | Organize by domain, enrich metadata |
| **Validate Completeness** | 2-3 min | Run all checks |
| **Generate Summary** | 2-3 min | Create markdown summary |
| **Final Assembly** | 2-3 min | Write files, verify |
| **Total** | 11-17 min | Relatively fast, mostly compilation |

---

## Integration

### Feeds To

- **TK-RM-011 (generate-operating-manual):** Manifest e a fonte de dados do manual
- **Other squads:** Content Distillery, Clone Deploy, Copywriter OS leem o manifest
- **Future remappings:** Manifest anterior e baseline para delta

### Depends On

- **TK-RM-007 (validate-gaps):** Gap analysis yaml
- **TK-RM-008 (organize-para):** PARA structure and summary
- **TK-RM-009 (translate-output):** Practitioner items and translations
- **TK-RM-012 (update-knowledge-graph):** Updated knowledge graph (or draft)
- **All Tier 0 and Tier 1 tasks:** Raw extractions

### Agent Routing

**Primary Agent:** forte (Tier 3 -- Delivery)
**Quality Review:** repertoire-chief (valida manifest final)

---

## Notes for Executor

### O Manifest E Imutavel Apos Geracao

Uma vez gerado, o manifest nao deve ser editado diretamente. Atualizacoes devem
ser feitas via TK-RM-012 (update-knowledge-graph) e regerar o manifest. Isso
garante rastreabilidade e versionamento.

### Versionamento

Se um remapeamento incremental for feito, o novo manifest deve ter versao
incrementada (1.0.0 -> 1.1.0) e referenciar o manifest anterior como baseline.

### YAML Size Warning

Para repertorios grandes (100+ itens), o manifest pode ficar extenso. Isso e
esperado e desejavel -- o manifest e a fonte de verdade, nao um resumo. O
manifest-summary.md existe para leitura humana rapida.

### Cross-Squad Compatibility

O manifest segue um schema padrao (`repertoire-manifest/v1`) que outros squads
podem parsear. Se o schema mudar, incrementar a versao e documentar breaking
changes.

### Nao Inventar Dados

O manifest APENAS compila dados de outros outputs. Se um campo esta vazio
porque o agente fonte nao produziu aquele dado, deixe o campo com valor
`null` ou `unknown`. NUNCA preencha com dados inventados.

---

## Revision History

| Version | Date | Change |
|---------|------|--------|
| 1.0.0 | 2026-02-18 | Initial production release |
