# Legacy Rule Extractor

**Code Archaeology Squad** que extrai, documenta e cataloga regras de negocio de sistemas legados em documentacao padronizada e consistente.

Codigo legado entra, base de conhecimento sai: escanear, decodificar, catalogar, auditar.

---

## Arquitetura

```
Input: Codebase legado (COBOL, Java, VB, PL/SQL, etc.)
         |
    +----v---------+
    | SCAN         |  Archaeologist mapeia o territorio
    +----+---------+
         |
    +----v---------+
    | DECODE       |  Decoder extrai regras arquivo a arquivo
    +----+---------+
         |
    +----v---------+
    | CLASSIFY     |  Cartographer classifica e cataloga
    +----+---------+
         |
    +----v---------+
    | AUDIT        |  Auditor detecta conflitos e gaps
    +----+---------+
         |
    +----v---------+
    | DOCUMENT     |  Gera catalogo + mapa + brief de migracao
    +----+---------+
         OK
```

---

## Agentes

| Agente | Papel | Foco |
|--------|-------|------|
| **Archaeologist** | Orquestrador | Escaneia codebase, identifica hotspots, coordena equipe |
| **Decoder** | Extrator | Analisa codigo linha a linha, extrai regras com evidencia |
| **Cartographer** | Catalogador | Classifica, organiza, gera mapas e taxonomia |
| **Auditor** | Validador | Detecta conflitos, redundancias, gaps entre sistemas |

---

## Quick Start

```bash
# Ativar o squad
@archaeologist

# Extrair regras de um arquivo
*extract ~/legado/calculo-impostos.cbl

# Escanear sistema inteiro
*scan ~/legado/sistema-financeiro/ --recursive

# Escanear com profundidade maxima
*scan ~/legado/erp/ --depth deep

# Gerar catalogo de regras
*catalog ~/legado/rules-output/

# Detectar conflitos entre dois sistemas
*conflicts ~/legado/sistema-a/rules-output/ ~/legado/sistema-b/rules-output/

# Gerar brief de migracao
*migration-brief ~/legado/rules-output/

# Ver cobertura da extracao
*coverage ~/legado/sistema-financeiro/

# Ajuda
*help
```

---

## Linguagens Suportadas

| Linguagem | Extensoes | Nivel de Suporte |
|-----------|-----------|-----------------|
| COBOL | .cbl .cob .cpy | Completo |
| PL/SQL | .pls .plb .pck .sql | Completo |
| T-SQL | .sql .proc .fn | Completo |
| Java (legado) | .java | Completo |
| Visual Basic 6 | .bas .cls .frm | Completo |
| VB.NET | .vb | Completo |
| RPG (AS/400) | .rpg .rpgle .sqlrpgle | Completo |
| Natural/ADABAS | .nsl .nsn | Basico |
| Clipper/xBase | .prg | Basico |
| Delphi/Pascal | .pas .dpr | Completo |
| C# (legado) | .cs | Completo |
| ABAP | .abap | Basico |
| FoxPro | .prg .scx | Basico |
| Fortran | .f .f90 .for | Basico |
| C/C++ | .c .cpp .h | Basico |
| Python (legado) | .py | Completo |

---

## Output Padronizado

Cada regra extraida segue o schema:

```yaml
---
rule_id: "FIN-CALC-001"
title: "Calculo de ICMS sobre mercadorias importadas"
domain: financeiro
module: calculo-impostos
severity: critica
confidence: alta
source:
  file: "calculo-impostos.cbl"
  lines: "142-178"
  language: cobol
description: >
  Aplica aliquota de ICMS diferenciada para mercadorias importadas,
  com base na UF de destino e na classificacao NCM do produto.
logic: >
  IF TIPO-MERCADORIA = 'IMPORTADA'
    IF UF-DESTINO IN ('SP', 'RJ', 'MG')
      ALIQUOTA = 18%
    ELSE
      ALIQUOTA = 12%
  IF NCM-PRODUTO STARTS WITH '84' OR '85'
    ALIQUOTA = ALIQUOTA - 2%  (reducao para eletronicos)
conditions:
  - "Mercadoria deve ser do tipo IMPORTADA"
  - "UF de destino determina faixa de aliquota"
  - "NCM iniciando com 84 ou 85 recebe reducao de 2%"
exceptions:
  - "Zona Franca de Manaus: isencao total (ver regra FIN-CALC-007)"
dependencies:
  - "FIN-CALC-007"
  - "FIN-TAB-002"
tags: [icms, importacao, ncm, tributario]
extracted_at: "2026-03-09"
---
```

---

## Estrutura

```
squads/legacy-rule-extractor/
  config.yaml
  README.md
  agents/
    archaeologist.md      # Orquestrador
    decoder.md            # Extrator de regras
    cartographer.md       # Catalogador
    auditor.md            # Validador de conflitos
  tasks/
    scan-codebase.md
    identify-rule-hotspots.md
    orchestrate-extraction.md
    extract-rules-from-file.md
    parse-control-flow.md
    extract-calculations.md
    extract-validations.md
    extract-state-transitions.md
    classify-rule.md
    catalog-rules.md
    generate-rule-map.md
    generate-migration-brief.md
    detect-conflicts.md
    detect-redundancies.md
    validate-extraction-quality.md
    generate-coverage-report.md
  workflows/
    wf-extract-single.yaml
    wf-extract-system.yaml
    wf-conflict-analysis.yaml
    wf-catalog-generation.yaml
  checklists/
    extraction-completeness-checklist.md
    rule-quality-checklist.md
    conflict-analysis-checklist.md
  templates/
    rule-schema-tmpl.yaml
    rule-catalog-tmpl.md
    migration-brief-tmpl.md
    conflict-report-tmpl.md
    coverage-report-tmpl.md
  data/
    legacy-patterns-kb.md
    domain-taxonomy.yaml
    language-patterns.yaml
```

---

## Conceitos-Chave

### Code Archaeology
Tratar codigo legado como um sitio arqueologico: cada camada tem historia. Regras
implicitas sao tao importantes quanto as explicitas. Comentarios antigos sao pistas.

### Confidence Levels
Nem toda regra tem a mesma certeza. `alta` = explicita no codigo. `media` = inferida
da logica. `baixa` = implicita, baseada em efeitos colaterais ou convencoes.

### Cross-System Conflict Detection
Quando dois sistemas implementam a mesma regra de formas diferentes, isso precisa
ser flagado. Tipos: contradicao (resultados diferentes), sobreposicao (parcialmente
igual), lacuna (um sistema cobre, outro nao).

### Read-Only
NUNCA modifica o codigo-fonte legado. Extracao e leitura-only nos inputs.

### Evidence-Based
Toda regra extraida deve ter referencia exata ao codigo-fonte: arquivo, linhas,
e trecho relevante. Sem regras "inventadas" ou assumidas.

---

*Legacy Rule Extractor v1.0.0 — Codigo legado entra, conhecimento estruturado sai.*
