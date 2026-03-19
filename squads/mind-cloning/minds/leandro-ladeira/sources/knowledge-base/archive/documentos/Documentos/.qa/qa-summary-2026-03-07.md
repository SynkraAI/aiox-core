---
title: "Quality Review — Leandro Ladeira Documentos"
date: "2026-03-07"
batch_id: "ladeira-docs-2026-03-07"
total_files: 10
pass_rate: "100%"
average_score: 8.71
---

# Quality Review — Final Report
## Leandro Ladeira / Documentos

```
═══════════════════════════════════════════════════
 QUALITY REVIEW — FINAL REPORT
═══════════════════════════════════════════════════

 Total documents: 10
 Average score:   8.71/10
 Pass rate:       100% (10/10)
 Threshold:       7.0 (PDF) | 7.5 (Spreadsheet)

 By status:
   PASS (automated):      10 (100%)
   APPROVED (human):       0
   RE-EXTRACTED:           0
   MANUALLY EDITED:        0
   REJECTED:               0
   PENDING REVIEW:         0
```

---

## Score por Arquivo

| # | Arquivo | Tipo | Words | Fid | Comp | Struct | Meta | Read | **Score** | Status |
|---|---------|------|-------|-----|------|--------|------|------|-----------|--------|
| 1 | Aula 4 - Como vender no inbox | PDF | 303 | 9.5 | 10.0 | 9.0 | 9.0 | 9.5 | **9.5** | PASS |
| 2 | Dispositivos de Engenharia Social | PDF | 2,445 | 9.0 | 10.0 | 8.5 | 8.5 | 8.5 | **9.0** | PASS |
| 3 | Material de Apoio - Stories 10x | PDF | 809 | 7.5 | 8.0 | 6.0 | 7.5 | 7.0 | **7.4** | PASS |
| 4 | Resumo do Módulo 1 [Extra] | PDF | 4,712 | 8.5 | 9.0 | 8.0 | 9.0 | 8.5 | **8.6** | PASS |
| 5 | Resumo do Módulo 2 [Extra] | PDF | 6,589 | 9.0 | 8.5 | 8.5 | 9.5 | 9.0 | **8.8** | PASS |
| 6 | Resumo do Módulo 3 [Extra] | PDF | 2,769 | 8.5 | 9.0 | 7.5 | 9.0 | 8.0 | **8.5** | PASS |
| 7 | Resumo do Módulo 4 [Extra] | PDF | 17,087 | 8.3 | 8.7 | 7.8 | 9.0 | 8.2 | **8.4** | PASS |
| 8 | Resumo do Módulo 6 [Extra] | PDF | 3,639 | 9.2 | 9.8 | 8.5 | 9.0 | 8.8 | **9.2** | PASS |
| 9 | zAula Extra - VME | PDF | 741 | 9.5 | 10.0 | 9.0 | 8.5 | 9.2 | **9.4** | PASS |
| 10 | Stories 10x - Planilha Pragmática | XLSX | 353 | 8.0 | 9.0 | 8.5 | 7.5 | 7.8 | **8.3** | PASS |

**Pesos:** Fidelity 35% | Completeness 30% | Structure 20% | Metadata 10% | Readability 5%

---

## Score Distribution

```
 9-10: 4  ████████████████
 7-8:  6  ████████████████████████
 5-6:  0
 3-4:  0
 0-2:  0
```

---

## Quality by Source Type

| Tipo | Arquivos | Avg Score | Min | Max |
|------|----------|-----------|-----|-----|
| PDF (book/doc) | 9 | 8.76 | 7.4 | 9.5 |
| Spreadsheet (XLSX) | 1 | 8.30 | 8.3 | 8.3 |

---

## Findings Consolidados

### Excelentes (Score >= 9.0)
- **Aula 4** (9.5): Conteúdo 100% preservado, estrutura perfeita
- **VME** (9.4): Completude 100.6%, hierarquia de outline perfeita
- **Módulo 6** (9.2): 97.8% completude, near-perfect
- **Dispositivos** (9.0): 38 dispositivos capturados integralmente

### Bons (Score 8.0-8.9)
- **Módulo 2** (8.8): 78% capture mas conteúdo verificado completo
- **Módulo 1** (8.6): 89% capture, workbook complexo bem convertido
- **Módulo 3** (8.5): TOC com anchors duplicados, conteúdo OK
- **Módulo 4** (8.4): 216 páginas, 87% capture — impressionante para o volume
- **Planilha** (8.3): 6 sheets convertidas, missing conversion_confidence field

### Marginal (Score 7.0-7.9)
- **Material de Apoio** (7.4): Slides convertidos — gráficos visuais perdidos, título automático S10X_SLIDE_SHOW_01. Aprovado como está.

---

## Observações

1. **pymupdf4llm** performou bem em todos os tipos de PDF (outline, workbook, apostila, slides)
2. **Conversão de slides** é naturalmente mais desafiadora — score ajustado para contexto
3. **Nenhum arquivo necessitou re-extração** ou revisão humana obrigatória
4. **Planilha** convertida com openpyxl — todas as 6 sheets capturadas

---

## Pipeline Executado

```
Phase 1: Batch Convert (book-to-markdown --batch)     9/9 PDFs OK
Phase 2: Convert Spreadsheet (openpyxl)                1/1 XLSX OK
Phase 3: Quality Verification (5-dimension scoring)   10/10 scored
Phase 4: Human Review (threshold 7.0)                  0 files required
Phase 5: Final Report                                  This document
```

---

*ETL Universal Converter v1.1.0 — Any file in, quality-verified markdown out.*
*Report generated: 2026-03-07*
