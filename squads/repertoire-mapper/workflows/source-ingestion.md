---
id: WF-RM-003
name: Source Ingestion
version: 1.0.0
description: >
  Processa uma fonte digital (livro, vídeo, transcrição, post)
  e extrai itens de repertório para o manifest.
trigger: manual
phases:
  - SOURCE_ANALYSIS
  - EXTRACTION
  - CLASSIFICATION
  - INTEGRATION
agents_involved:
  - klein
  - nonaka
  - forte
quality_gates:
  - QG-SI-001: Source Processable
  - QG-SI-002: Minimum Items Extracted
estimated_duration: 15-60 minutes (depends on source size)
input: Source file or URL
output: Extracted repertoire items added to manifest
---

# Source Ingestion

## Overview

Workflow para processar uma única fonte e extrair itens de repertório.
Diferente do full pipeline, este workflow é **focado em uma fonte por vez**
e pode ser executado repetidamente conforme novas fontes ficam disponíveis.

## Pipeline

```
SOURCE INPUT (livro, vídeo, transcrição, post)
    │
    ▼
SOURCE ANALYSIS (klein)
    │ Identificar tipo, tamanho, riqueza estimada
    ▼  gate: QG-SI-001
EXTRACTION (klein)
    │ CDM adaptado para fonte passiva
    │ Extrair: cues, patterns, mental models, rules of thumb
    ▼  gate: QG-SI-002
CLASSIFICATION (nonaka)
    │ SECI classification + knowledge asset type
    ▼
INTEGRATION (forte)
    │ Adicionar ao manifest + update graph
    ▼
OUTPUT: N itens extraídos e integrados
```

## Source Types & Extraction Strategies

| Source Type | Strategy | Expected Yield |
|------------|----------|----------------|
| Livro completo | Chapter-by-chapter CDM scan | 30-100 itens |
| Vídeo/Live (1h+) | Segment analysis + key moments | 15-40 itens |
| Transcrição de mentoria | Incident extraction + advice patterns | 10-25 itens |
| Post de rede social | Micro-extraction (beliefs, constructs) | 2-8 itens |
| Apresentação/Slide deck | Framework extraction + key messages | 5-15 itens |
| Podcast episode | Theme extraction + decision patterns | 10-20 itens |

## Extraction Protocol (Passive CDM)

Adaptação do Critical Decision Method de Klein para fontes passivas
(onde não é possível entrevistar — o texto/vídeo é a "entrevista"):

```yaml
per_source_segment:
  scan_for:
    - decisions: "Momentos onde uma escolha é feita ou recomendada"
    - patterns: "Regularidades mencionadas ('sempre que X, eu faço Y')"
    - mental_models: "Modelos conceituais usados para explicar"
    - rules_of_thumb: "Heurísticas explícitas ou implícitas"
    - cues: "Sinais que o autor diz observar"
    - anomalies: "Exceções, surpresas, contra-exemplos"
    - frameworks: "Estruturas nomeadas ou implícitas"
    - values: "Prioridades e hierarquia de valores"
    - metaphors: "Metáforas conceituais usadas"
    - contradictions: "Pontos que contradizem outras fontes"

  extract_as:
    repertoire_item:
      id: "RM-{source_code}-{seq}"
      type: "decision | pattern | mental_model | rule | cue | framework | value"
      content: "Descrição do item"
      evidence: "Citação ou referência direta da fonte"
      source: "Identificação da fonte + localização"
      confidence: "high | medium | low"
      seci_stage: "externalization | combination"
      knowledge_asset: "experiential | conceptual | systemic | routine"
```

## Quality Gates

**QG-SI-001: Source Processable**
- [ ] Fonte é legível/acessível
- [ ] Tipo de fonte identificado
- [ ] Estimativa de yield calculada
- [ ] Não é duplicata de fonte já processada

**QG-SI-002: Minimum Items Extracted**
- [ ] Pelo menos 5 itens extraídos (para fontes curtas)
- [ ] Pelo menos 15 itens extraídos (para fontes longas)
- [ ] Cada item tem evidência/citação
- [ ] Items classificados por tipo

---

_Workflow Version: 1.0.0_
_Last Updated: 2026-02-18_
