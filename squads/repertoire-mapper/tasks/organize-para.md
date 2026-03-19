---
id: TK-RM-008
name: Organize Repertoire with PARA Method
version: 1.0.0
executor: forte
purpose: >
  Organizar repertorio validado usando PARA Method (Projects, Areas,
  Resources, Archives) de Tiago Forte. Transformar itens brutos de
  repertorio em uma estrutura navegavel, hierarquica e orientada a acao
  que respeita o ciclo de vida natural do conhecimento.
squad: repertoire-mapper
phase: PHASE_5_ORGANIZATION
tier: 3

inputs:
  - name: validated_items
    type: list
    description: "Itens de repertorio validados (pos-Argyris gap analysis)"
    required: true
    format: "YAML array com id, content, type, confidence, dreyfus_level, seci_stage"
    location: "outputs/repertoire/{slug}/extracted-items.yaml"

  - name: gap_analysis
    type: document
    description: "Gap analysis gerado por argyris (TK-RM-007)"
    required: true
    format: "YAML com gaps classificados por tipo e severidade"
    location: "outputs/repertoire/{slug}/gap-analysis.yaml"

  - name: expertise_profile
    type: document
    description: "Perfil de expertise gerado por collins (Tier 0)"
    required: true
    format: "Markdown com niveis de expertise por area"
    location: "outputs/repertoire/{slug}/expertise-profile.md"

  - name: knowledge_graph_draft
    type: document
    description: "Draft do knowledge graph gerado por nonaka (Tier 2)"
    required: false
    format: "JSON com nodes e edges"
    location: "outputs/repertoire/{slug}/knowledge-graph-draft.json"

  - name: seci_classification
    type: document
    description: "Classificacao SECI de cada item por nonaka (Tier 2)"
    required: false
    format: "YAML com items e seus seci_stage"
    location: "outputs/repertoire/{slug}/seci-classification.yaml"

  - name: subject_active_projects
    type: list
    description: "Lista de projetos ativos do sujeito (se disponivel)"
    required: false
    format: "YAML array com nome, deadline, status"
    location: "inputs/repertoire/{slug}/active-projects.yaml"

preconditions:
  - "QG-005 passado (Final Validation por argyris)"
  - "Gap analysis completo e disponivel"
  - "Pelo menos 10 itens de repertorio validados"
  - "Expertise profile disponivel"
  - "Agente forte carregado com PARA Method e Progressive Summarization"

outputs:
  - name: repertoire_structure
    path: "outputs/repertoire/{slug}/para/"
    format: directory
    description: >
      Estrutura de diretorios PARA com itens organizados:
      para/projects/, para/areas/, para/resources/, para/archives/

  - name: repertoire_index
    path: "outputs/repertoire/{slug}/repertoire-index.md"
    format: markdown
    description: >
      Indice navegavel de todos os itens de repertorio com links,
      cross-references, e mini-resumos.

  - name: knowledge_graph_updated
    path: "outputs/repertoire/{slug}/knowledge-graph.json"
    format: json
    description: >
      Knowledge graph atualizado com metadata PARA (category, actionability,
      lifecycle_stage) em cada node.

  - name: para_summary
    path: "outputs/repertoire/{slug}/para-summary.yaml"
    format: yaml
    description: >
      Resumo estatistico da organizacao PARA com distribuicao de itens
      por categoria, areas mais densas, projetos ativos.

validation:
  success_criteria:
    - "100% dos itens classificados em P/A/R/A"
    - "Nenhum item orfao (sem categoria)"
    - "Repertoire-index.md gerado com links validos"
    - "Cross-references entre itens relacionados"
    - "Knowledge graph atualizado com metadata PARA"
    - "Progressive Summarization aplicada a itens chave"
    - "Distribuicao PARA plausivel (nao 90% em uma unica categoria)"
  quality_threshold: "8/10 no checklist completo"
---

# Task: Organize Repertoire with PARA Method

## Executive Summary

Esta task transforma itens brutos de repertorio -- extraidos e validados pelos
agentes anteriores -- em uma estrutura organizada pelo PARA Method de Tiago Forte.
PARA classifica todo conhecimento em 4 categorias baseadas em ACTIONABILITY
(capacidade de gerar acao), nao em TIPO de conteudo.

**Posicao no Pipeline:** Task 8 -- Phase 5 (Organization) do Full Mapping Pipeline
**Definicao de Sucesso:** 100% dos itens classificados em PARA, indice navegavel gerado
**Execucao Paralela:** Roda em paralelo com TK-RM-009 (translate-output por chin)

---

## Purpose

Ate este ponto, o pipeline extraiu dezenas (ou centenas) de itens de repertorio:
mental models, decision frameworks, personal constructs, skills, patterns, values,
beliefs, rules of thumb, metaphors, deep smarts. Esses itens estao organizados
por METODO DE EXTRACAO (klein, leonard, kelly) e por TIPO EPISTEMOLOGICO
(tacito/explicito via polanyi, SECI via nonaka).

Mas o sujeito nao pensa assim. Ninguem abre uma pasta chamada
"Conhecimento Tacito Relacional" para resolver um problema. Pessoas pensam em
termos de: "o que preciso fazer agora?", "que areas sao minha responsabilidade?",
"que recursos posso consultar?", "o que nao uso mais?".

O PARA Method de Tiago Forte organiza conhecimento PELO GRAU DE ACTIONABILITY:

1. **Projects** (Projetos) -- Repertorios ligados a resultados especificos com deadline
2. **Areas** (Areas de Responsabilidade) -- Repertorios de manutencao continua sem deadline
3. **Resources** (Recursos) -- Repertorios de interesse ou referencia futura
4. **Archives** (Arquivos) -- Repertorios inativos, historicos, ou superados

Esta organizacao garante que o repertoire-manifest e o operating-manual sejam
instrumentos PRATICOS, nao apenas inventarios academicos.

---

## Executor Type

**Agent: forte (100% automatizado)**

- **Agent Role:** Classificacao PARA, Progressive Summarization, criacao de indice e cross-references
- **Human Role:** Nenhum durante organizacao (humano pode ajustar classificacao depois)
- **Estimated Runtime:** 15-25 minutos dependendo do volume de itens

---

## Steps

### Step 1: Load and Index All Validated Items (2-3 min)

**Agent Activity:**

- Carregar todos os itens de repertorio validados
- Carregar gap analysis (gaps informam classificacao PARA)
- Carregar expertise profile (niveis informam prioridade)
- Se disponivel, carregar knowledge graph draft e SECI classification
- Se disponivel, carregar lista de projetos ativos do sujeito
- Criar um indice mestre de todos os itens com metadata

**Index Master:**

```yaml
master_index:
  total_items: N
  items:
    - id: "RM-ITEM-001"
      title: "Titulo resumido do item"
      type: "mental_model | decision_framework | skill | pattern | value | belief | rule_of_thumb | metaphor | deep_smart | personal_construct"
      domain: "area de expertise"
      dreyfus_level: "novice | advanced_beginner | competent | proficient | expert"
      seci_stage: "socialization | externalization | combination | internalization"
      confidence: 0.0-1.0
      source_agent: "klein | leonard | kelly | polanyi | collins"
      has_gap: true/false
      gap_type: "execution_gap | blind_spot | hidden_expertise | null"
      gap_severity: "critical | significant | minor | null"
      # Fields to be filled by this task:
      para_category: null  # P | A | R | Ar
      actionability_score: null  # 0.0-1.0
      lifecycle_stage: null  # active | maintenance | reference | dormant
```

**Checkpoint:** Indice mestre montado com todos os itens e metadata

---

### Step 2: Classify Each Item as P/A/R/A (5-8 min)

**Agent Activity:**

Aplicar a arvore de decisao PARA a cada item de repertorio.

**PARA Decision Tree:**

```
PARA Classification Algorithm v1.0

FOR each item in master_index:

  Q1: Este item esta ATIVAMENTE sendo usado em um projeto
      com deadline nos proximos 30-90 dias?
    YES → PROJECT (P)
      Enriquecer com: project_name, deadline, deliverable
    NO → Continue

  Q2: Este item e uma RESPONSABILIDADE CONTINUA do sujeito?
      (Algo que ele precisa manter em nivel de competencia permanentemente)
    YES → AREA (A)
      Enriquecer com: area_name, frequency_of_use, importance
    NO → Continue

  Q3: Este item e INTERESSANTE ou UTIL como referencia,
      mas nao tem aplicacao imediata?
    YES → RESOURCE (R)
      Enriquecer com: topic, potential_use, related_areas
    NO → Continue

  Q4: Este item esta INATIVO, SUPERADO, ou e puramente HISTORICO?
    YES → ARCHIVE (Ar)
      Enriquecer com: reason_archived, last_used, historical_value
    NO → Re-evaluate (should not reach here)
```

**Classification Rules:**

```yaml
classification_rules:
  projects:
    criteria:
      - "Ligado a objetivo especifico com deadline"
      - "O sujeito esta ativamente usando este conhecimento"
      - "Resultado mensuravel esperado"
    signals:
      - "Mencionado em contexto de projeto ativo"
      - "CDM incidentes recentes (<6 meses)"
      - "Listado em active-projects.yaml"
    typical_items:
      - "Frameworks de decisao para projeto em andamento"
      - "Skills sendo deliberadamente praticadas"
      - "Mental models aplicados a problema corrente"

  areas:
    criteria:
      - "Responsabilidade permanente sem deadline"
      - "Requer manutencao de competencia continua"
      - "Nao pode ser 'concluido' -- e ongoing"
    signals:
      - "Dreyfus level >= Competent"
      - "Mencionado em multiplas fontes como competencia core"
      - "Expertise profile marca como 'contributory'"
    typical_items:
      - "Habilidades profissionais core"
      - "Valores e principios que guiam decisoes"
      - "Padroes de reconhecimento automaticos (Expert level)"
      - "Deep smarts criticos"

  resources:
    criteria:
      - "Util como referencia mas sem aplicacao imediata"
      - "Pode se tornar Area ou Project no futuro"
      - "Interessante mas nao essencial agora"
    signals:
      - "Dreyfus level <= Advanced Beginner"
      - "Mencionado poucas vezes, sem profundidade"
      - "Conhecimento explicitamente teorico"
    typical_items:
      - "Frameworks aprendidos mas nao praticados"
      - "Conhecimento de dominio adjacente"
      - "Metaforas e analogias de outras areas"
      - "Regras de thumb ouvidas de outros"

  archives:
    criteria:
      - "Nao usado ha mais de 12 meses"
      - "Superado por conhecimento mais recente"
      - "Relevante apenas historicamente"
    signals:
      - "Mencionado no passado mas nao em CDM recentes"
      - "Gap analysis marca como 'aspiration_gap' nao resolvido"
      - "Contradicoes resolvidas: a versao superada vai para Archive"
    typical_items:
      - "Skills de carreira anterior"
      - "Frameworks abandonados"
      - "Crencas revisadas (old version)"
      - "Conhecimento de ferramentas descontinuadas"
```

**Special Rules for Gaps:**

```yaml
gap_classification:
  hidden_expertise:
    para: "A"  # Mover para Areas -- e competencia real, precisa ser articulada
    note: "Hidden expertise e Area porque o sujeito JA USA, so nao articula"

  execution_gap:
    para: "R"  # Mover para Resources -- o sujeito sabe mas nao pratica
    note: "Execution gap e Resource porque o conhecimento existe mas nao ta ativo"

  aspiration_gap:
    para: "R"  # Resource -- aspiracao sem pratica e referencia
    note: "Aspiracao sem pratica e referencia para desenvolvimento futuro"

  contradiction_resolved:
    para_winner: "A ou P"  # A versao validada fica
    para_loser: "Ar"  # A versao refutada vai para Archive
    note: "Manter ambos com nota de resolucao"

  blind_spot_surfaced:
    para: "A"  # Agora que foi surfaceado, e Area
    note: "Blind spot revelado se torna Area de desenvolvimento"
```

**Checkpoint:** Todos os itens classificados como P/A/R/A

---

### Step 3: Build Hierarchical Structure (3-5 min)

**Agent Activity:**

Criar a estrutura hierarquica de diretorios e organizar itens dentro dela.

**Directory Structure:**

```
outputs/repertoire/{slug}/para/
├── projects/
│   ├── {project-name-1}/
│   │   ├── overview.md
│   │   └── items/
│   │       ├── RM-ITEM-003.yaml
│   │       └── RM-ITEM-017.yaml
│   └── {project-name-2}/
│       ├── overview.md
│       └── items/
├── areas/
│   ├── {area-name-1}/
│   │   ├── overview.md
│   │   └── items/
│   ├── {area-name-2}/
│   │   ├── overview.md
│   │   └── items/
│   └── _gaps/
│       ├── hidden-expertise.md
│       └── blind-spots-surfaced.md
├── resources/
│   ├── {topic-1}/
│   │   └── items/
│   └── {topic-2}/
│       └── items/
└── archives/
    ├── {reason-1}/
    │   └── items/
    └── _superseded/
        └── items/
```

**Overview File Template (per Project/Area):**

```markdown
# {Project/Area Name}

**PARA Category:** {P | A}
**Item Count:** N
**Dreyfus Range:** {Competent - Expert}
**Primary Source Agents:** {klein, leonard, kelly}

## Summary
{1-2 paragraphs describing this cluster of repertoire items}

## Key Items
1. **{Item Title}** -- {1-line description} (confidence: 0.X)
2. **{Item Title}** -- {1-line description} (confidence: 0.X)

## Cross-References
- Related to: [{Area/Project Name}](../path)
- Depends on: [{Item ID}](../path)
- Contradicts: [{Item ID}](../path) -- see gap-analysis

## Gaps in This Area
- {Gap description} (severity: {level})

## Notes
{Any additional context}
```

**Checkpoint:** Estrutura hierarquica criada

---

### Step 4: Build Navigation Index (3-5 min)

**Agent Activity:**

Gerar o `repertoire-index.md` -- o ponto de entrada para navegacao de todo o
repertorio organizado.

**Index Structure:**

```markdown
# Repertoire Index: {Nome do Sujeito}

> Organizado pelo PARA Method de Tiago Forte
> Gerado em: {YYYY-MM-DD}
> Total de itens: {N}

## Quick Stats

| Category | Items | % | Top Area |
|----------|-------|---|----------|
| Projects | N | X% | {area} |
| Areas | N | X% | {area} |
| Resources | N | X% | {area} |
| Archives | N | X% | {area} |

## Distribution by Dreyfus Level

| Level | Items | Typical PARA |
|-------|-------|-------------|
| Expert | N | Areas |
| Proficient | N | Areas/Projects |
| Competent | N | Areas/Resources |
| Advanced Beginner | N | Resources |
| Novice | N | Resources/Archives |

---

## Projects (Active Now)

### {Project Name 1}
- **Deadline:** {date}
- **Items:** N
- **Key Repertoire:** {1-2 items most relevant}
- [View all items](./para/projects/{project-name-1}/)

---

## Areas (Ongoing Responsibilities)

### {Area Name 1} -- {Dreyfus Level}
- **Items:** N
- **Expertise Level:** {Collins classification}
- **Key Repertoire:** {1-2 items most relevant}
- **Gaps:** {N gaps, highest severity: X}
- [View all items](./para/areas/{area-name-1}/)

### {Area Name 2} -- {Dreyfus Level}
...

---

## Resources (Reference Material)

### {Topic 1}
- **Items:** N
- **Potential Activation:** {when this could become Area/Project}
- [View all items](./para/resources/{topic-1}/)

---

## Archives (Inactive/Historical)

### {Reason 1}
- **Items:** N
- **Archived Because:** {reason}
- [View all items](./para/archives/{reason-1}/)

---

## Cross-Reference Map

| Item | Related To | Relationship |
|------|-----------|-------------|
| {ID} | {ID} | supports |
| {ID} | {ID} | contradicts |
| {ID} | {ID} | extends |

---

## Gap Summary (from Argyris Validation)

| Gap ID | Type | Severity | Area | Status |
|--------|------|----------|------|--------|
| GAP-001 | blind_spot | significant | {area} | surfaced |
| GAP-002 | contradiction | critical | {area} | resolved |
```

**Checkpoint:** Repertoire index gerado com links e cross-references

---

### Step 5: Create Cross-References (3-5 min)

**Agent Activity:**

Mapear relacionamentos entre itens de repertorio e criar links bidirecionais.

**Cross-Reference Types:**

```yaml
cross_reference_types:
  supports:
    definition: "Item A reforça ou valida Item B"
    example: "Rule of thumb sobre 'retention first' supports mental model de 'leaky bucket'"
    direction: bidirectional

  extends:
    definition: "Item A e uma especializacao ou aprofundamento de Item B"
    example: "Framework de precificacao B2B extends principio geral de value-based pricing"
    direction: directional (A extends B)

  contradicts:
    definition: "Item A conflita com Item B (mesmo apos validacao)"
    example: "Principio de delegacao contradicts padrao de microgerenciamento"
    direction: bidirectional
    note: "Deve ter resolucao documentada no gap-analysis"

  applies_to:
    definition: "Item A e usado no contexto de Item B"
    example: "Heuristica de 'first 90 days' applies_to project de 'onboarding novo membro'"
    direction: directional (A applies_to B)

  derived_from:
    definition: "Item A foi derivado de Item B"
    example: "Regra de thumb sobre pricing derived_from experiencia com 50+ clientes"
    direction: directional (A derived_from B)

  supersedes:
    definition: "Item A substituiu Item B (B vai para Archive)"
    example: "Novo framework de vendas supersedes framework anterior"
    direction: directional (A supersedes B)
```

**Algorithm for Finding Cross-References:**

```yaml
cross_reference_algorithm:
  step_1_same_domain:
    action: "Para cada area, comparar todos os itens entre si"
    check: "Mesmo tema? Mesmos conceitos? Mesma situacao?"

  step_2_cross_domain:
    action: "Comparar itens de areas diferentes"
    check: "Principios transferiveis? Padroes analogos?"

  step_3_gap_relations:
    action: "Conectar gaps com itens que os evidenciam"
    check: "Que itens sao evidencia do gap?"

  step_4_temporal:
    action: "Identificar evolucao temporal de itens"
    check: "Versoes anteriores? Itens que evoluiram?"

  step_5_validate:
    action: "Verificar que nao ha orfaos (itens sem nenhum cross-reference)"
    check: "Todo item tem pelo menos 1 cross-reference"
```

**Checkpoint:** Cross-references mapeadas e validadas

---

### Step 6: Apply Progressive Summarization to Key Items (3-5 min)

**Agent Activity:**

Aplicar as 4 camadas de Progressive Summarization de Tiago Forte aos itens
mais importantes (Projects e Areas com Dreyfus >= Proficient).

**Progressive Summarization Layers:**

```yaml
progressive_summarization:
  layer_1_capture:
    description: "Conteudo completo do item (ja existe)"
    action: "Manter como esta"

  layer_2_bold:
    description: "Partes mais relevantes destacadas"
    action: "Marcar as passagens-chave de cada item"
    criteria: "O que e unico, surpreendente, ou mais acionavel?"

  layer_3_highlight:
    description: "Essencia do item em 2-3 frases"
    action: "Resumir cada item em sua essencia acionavel"
    format: "When [situacao] → [acao] because [razao]"

  layer_4_executive_summary:
    description: "1 frase por item"
    action: "Comprimir cada item em 1 frase memorable"
    format: "[Verbo] [objeto] [contexto]"
```

**Apply to:**
- Todos os itens em Projects
- Todos os itens em Areas com Dreyfus >= Proficient
- Top 5 itens em Resources por confidence score

**Output Format per Item:**

```yaml
progressive_summary:
  item_id: "RM-ITEM-042"
  layer_2_bold: |
    [Texto original com **partes destacadas em bold**]
  layer_3_highlight: |
    When facing declining retention with growing revenue,
    stop acquisition and fix retention first, because
    revenue growth masks the underlying problem.
  layer_4_executive: |
    Retention before acquisition in leaky bucket scenarios.
```

**Checkpoint:** Progressive Summarization aplicada a itens chave

---

### Step 7: Update Knowledge Graph with PARA Metadata (2-3 min)

**Agent Activity:**

Enriquecer cada node do knowledge graph com metadata PARA.

**Metadata Additions:**

```json
{
  "nodes": [
    {
      "id": "RM-ITEM-042",
      "label": "Retention Before Acquisition",
      "type": "rule_of_thumb",
      "para_category": "A",
      "para_area": "growth-strategy",
      "actionability_score": 0.9,
      "lifecycle_stage": "active",
      "progressive_summary": {
        "layer_3": "When retention declines, stop acquisition first.",
        "layer_4": "Retention before acquisition."
      },
      "cross_references": [
        { "target": "RM-ITEM-015", "type": "supports" },
        { "target": "RM-ITEM-067", "type": "contradicts" }
      ]
    }
  ]
}
```

**Checkpoint:** Knowledge graph atualizado

---

### Step 8: Generate PARA Summary Report (2-3 min)

**Agent Activity:**

Compilar estatisticas e insights da organizacao PARA.

**para-summary.yaml:**

```yaml
para_summary:
  metadata:
    subject: "{nome}"
    date: "2026-02-18"
    executor: "forte"
    total_items: N

  distribution:
    projects:
      count: N
      percentage: X%
      active_projects: ["nome1", "nome2"]
      items_per_project:
        - project: "nome"
          items: N
    areas:
      count: N
      percentage: X%
      top_areas:
        - area: "nome"
          items: N
          dreyfus_max: "expert"
    resources:
      count: N
      percentage: X%
    archives:
      count: N
      percentage: X%

  quality_metrics:
    items_with_cross_references: N/N
    items_with_progressive_summary: N
    orphan_items: N
    gaps_integrated: N

  insights:
    most_dense_area: "area com mais itens"
    highest_expertise_area: "area com Dreyfus mais alto"
    most_cross_referenced: "item com mais cross-references"
    largest_gap_cluster: "area com mais gaps"

  recommendations:
    - "Area X tem muitos itens em Resources -- considerar promover para Area"
    - "Project Y nao tem itens de repertorio -- risco de insuficiencia"
    - "Archive Z contem itens que podem ser relevantes para Project W"
```

**Checkpoint:** Relatorio PARA gerado e salvo

---

## Validation

### Checklist

- [ ] 100% dos itens classificados em P/A/R/A
- [ ] Nenhum item orfao (sem categoria)
- [ ] Estrutura de diretorios PARA criada
- [ ] Overview files para cada Project e Area
- [ ] Repertoire-index.md gerado com links validos
- [ ] Cross-references mapeadas (todo item tem >= 1)
- [ ] Progressive Summarization aplicada a itens chave (Projects + Areas Expert)
- [ ] Knowledge graph atualizado com metadata PARA
- [ ] para-summary.yaml gerado
- [ ] Distribuicao PARA plausivel (nenhuma categoria com > 70% dos itens)

### Success Criteria

**Threshold: 8/10 no checklist acima**

| Criteria | Excelente (3) | Aceitavel (2) | Insuficiente (1) |
|----------|--------------|----------------|-------------------|
| **Classification** | 100% itens, nenhum ambiguo | 100% itens, <5% ambiguos | Itens sem classificacao |
| **Structure** | Diretorios + overviews completos | Diretorios criados, overviews parciais | Estrutura incompleta |
| **Index** | Links validos, stats, cross-refs | Links validos, stats basicos | Index incompleto |
| **Cross-refs** | 100% itens com >= 1 ref, bidirecional | 80% itens com refs | < 80% itens referenciados |
| **Prog. Summary** | 4 layers para top items | 3 layers para top items | 2 ou menos layers |
| **Graph Update** | PARA + summary + cross-refs no graph | PARA no graph | Graph nao atualizado |

---

## Estimated Effort

| Component | Effort | Notes |
|-----------|--------|-------|
| **Load & Index** | 2-3 min | Build master index |
| **PARA Classification** | 5-8 min | Core classification, most items |
| **Hierarchical Structure** | 3-5 min | Directory creation |
| **Navigation Index** | 3-5 min | Index generation |
| **Cross-References** | 3-5 min | Relationship mapping |
| **Progressive Summary** | 3-5 min | Top items only |
| **Graph Update** | 2-3 min | Metadata enrichment |
| **PARA Summary** | 2-3 min | Report compilation |
| **Total** | 23-37 min | Scales with item count |

---

## Integration

### Feeds To

- **TK-RM-010 (generate-manifest):** PARA structure e a base do manifest
- **TK-RM-011 (generate-operating-manual):** Items organizados por Area alimentam o manual
- **TK-RM-012 (update-knowledge-graph):** Graph enrichments sao inputs

### Depends On

- **TK-RM-007 (validate-gaps):** Gap analysis informa classificacao PARA
- **TK-RM-006 (convert-seci):** SECI classification por nonaka
- **QG-005:** Final Validation deve ter sido passado

### Agent Routing

**Primary Agent:** forte (Tier 3 -- Organization)
**Quality Review:** repertoire-chief (valida completude da organizacao)
**Parallel Execution:** Roda em paralelo com TK-RM-009 (chin) na Phase 5

---

## Notes for Executor

### PARA e Dinamico, Nao Estatico

A classificacao PARA nao e permanente. Um item em Resources hoje pode virar
Project amanha. O indice deve indicar POTENCIAL DE ATIVACAO para itens em
Resources: "Se o sujeito iniciar projeto X, este item sobe para Projects."

### Cuidado com a Tentacao de Tudo ser Area

A tendencia natural e classificar quase tudo como Area ("responsabilidade
permanente"). Resista. Pergunte: "O sujeito PRECISA manter esta competencia
ativa?" Se a resposta for "talvez" ou "depende", e Resource, nao Area.

### Archives Nao Sao Lixo

Items arquivados nao sao descartados. Sao preservados com contexto de
por que foram arquivados. Um framework superado pode conter wisdom que
o sujeito esqueceu. O Archive e um repositorio de aprendizado, nao uma
lixeira.

### Cross-References Revelam Clusters

Ao mapear cross-references, clusters naturais emergem. Esses clusters
frequentemente alinham com as "Areas" do sujeito mais do que a classificacao
original por dominio. Use os clusters para validar ou ajustar a estrutura PARA.

### Progressive Summarization: Layer 4 e o Teste Final

Se voce nao consegue resumir um item em 1 frase (Layer 4), o item
provavelmente e composto e deveria ser dividido em 2+ itens. Layer 4
e um teste de atomicidade tanto quanto um exercicio de resumo.

---

## Revision History

| Version | Date | Change |
|---------|------|--------|
| 1.0.0 | 2026-02-18 | Initial production release |
