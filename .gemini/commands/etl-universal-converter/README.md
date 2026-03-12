# ETL Universal Converter

**Content ETL pipeline** que converte qualquer formato de arquivo em markdown tratado e normalizado com frontmatter padronizado.

Um comando → arquivo convertido: classificar → extrair → transformar → normalizar → validar → **verificar qualidade** → salvar.

---

## Arquitetura

```
Input: QUALQUER arquivo
         │
    ┌────▼─────┐
    │ CLASSIFY  │  Detectar tipo por extensão + MIME
    └────┬─────┘
         │
    ┌────▼─────────────────────────────────────┐
    │ ROUTE & CONVERT                          │
    │                                          │
    │  Video/Áudio ──→ media-processor (squad) │
    │  PDF/EPUB/MOBI ──→ book-to-markdown      │
    │  CSV/Excel ──→ Polars + openpyxl         │
    │  PowerPoint ──→ python-pptx              │
    │  Imagem ──→ Tesseract OCR                │
    │  JSON/YAML/XML ──→ parsers nativos       │
    │  TXT/MD ──→ normalização                 │
    └────┬─────────────────────────────────────┘
         │
    ┌────▼──────┐
    │ NORMALIZE │  Frontmatter padrão + limpeza
    └────┬──────┘
         │
    ┌────▼──────┐
    │ VALIDATE  │  Quality gate (formato)
    └────┬──────┘
         │
    ┌────▼──────────┐
    │ VERIFY QUALITY │  Source vs Output (score 0-10)
    └────┬──────────┘
         │
    ┌────▼──────┐        ┌──────────────┐
    │   SAVE    │        │ HUMAN REVIEW │
    └───────────┘        │ (se score <7)│
         ✅               └──────────────┘
```

---

## Quick Start

```bash
# Ativar o agente
@etl-chief

# Converter arquivo único
*convert ~/docs/relatorio.xlsx

# Converter diretório inteiro
*batch ~/projeto/materiais/

# Converter com subdiretórios
*batch ~/projeto/ --recursive

# Ver o que seria feito (dry-run)
*preview ~/docs/apresentacao.pptx

# Classificar sem converter
*classify ~/scan/documento.png

# Verificar qualidade de arquivo já convertido
*verify ~/docs/relatorio.md

# Verificar qualidade de todos os .md em um diretório
*qa-batch ~/projeto/materiais/

# Revisão humana de documento flagado
*review ~/scan/documento.md
```

---

## Formatos Suportados

| Formato | Extensões | Processador | Como |
|---------|-----------|-------------|------|
| Vídeo | .mp4 .mkv .webm .avi .mov | media-processor | Delegado |
| Áudio | .mp3 .m4a .wav .flac .ogg | media-processor | Delegado |
| Livros | .pdf .epub .mobi .azw | book-to-markdown | Delegado |
| Documentos | .docx .rtf .odt | book-to-markdown | Delegado |
| Planilhas | .csv .tsv .xlsx .xls .ods | Polars + openpyxl | Interno |
| Apresentações | .pptx .ppt .odp | python-pptx | Interno |
| Imagens | .png .jpg .tiff .bmp .webp | Tesseract OCR | Interno |
| Dados | .json .yaml .xml .toml | Parsers nativos | Interno |
| Texto | .txt .md .rst .log | Normalização | Interno |

---

## Output

Todos os outputs seguem o mesmo schema:

```yaml
---
title: "Nome do Conteúdo"
source_type: spreadsheet
source_format: xlsx
source_path: "/caminho/original/arquivo.xlsx"
date_processed: "2026-03-04"
word_count: 3420
language: "pt-BR"
tags: [financeiro, relatório]
---

# Conteúdo convertido aqui...
```

**Destino:** `.md` salvo no mesmo diretório do arquivo original.

---

## Estrutura

```
squads/etl-universal-converter/
├── config.yaml
├── README.md
├── agents/
│   └── etl-chief.md
├── tasks/
│   ├── classify-file.md
│   ├── convert-spreadsheet.md
│   ├── convert-presentation.md
│   ├── convert-image-ocr.md
│   ├── convert-data-file.md
│   ├── convert-text.md
│   ├── normalize-output.md
│   ├── enrich-metadata.md
│   ├── validate-output.md
│   ├── verify-extraction-quality.md
│   ├── human-review-extraction.md
│   ├── analyze-structure.md
│   ├── curate-by-purpose.md
│   └── delegate-extraction.md
├── workflows/
│   ├── wf-convert-single.yaml
│   ├── wf-convert-batch.yaml
│   ├── wf-quality-review.yaml
│   └── wf-purpose-driven.yaml
├── checklists/
│   ├── output-quality-checklist.md
│   └── extraction-fidelity-checklist.md
├── templates/
│   ├── frontmatter-schema-tmpl.yaml
│   └── extraction-quality-report-tmpl.md
└── data/
    ├── etl-universal-converter-kb.md
    ├── quality-scoring-matrix.yaml
    ├── veto-conditions-registry.yaml
    └── troubleshooting-guide.md
```

---

## Dependências

### Squads (delegação)
- **media-processor** — Vídeo e áudio
- **book-to-markdown** — PDF, EPUB, MOBI, DOCX

### Python
```bash
pip install polars openpyxl python-pptx pytesseract Pillow langdetect pydantic PyYAML tabulate chardet
```

### Sistema
```bash
brew install tesseract tesseract-lang
```

---

## Conceitos-Chave

### Delegate Over Reinvent
Se media-processor ou book-to-markdown já fazem, delega. Nunca recria o que existe.

### Schema Único
Todo output tem o mesmo frontmatter, independente do tipo de arquivo. Isso permite buscar, filtrar e organizar qualquer conteúdo convertido.

### Fail Gracefully
Arquivo com problema? Skip com explicação. Nunca trava o batch.

### Read-Only
NUNCA modifica ou deleta o arquivo original. ETL é leitura-only nos inputs.

### Quality First
Toda extração é verificada contra o source original. Score 0-10 em 5 dimensões (fidelidade, completude, estrutura, metadata, legibilidade). Score < 7.0 → re-extração automática. Score < 5.0 → revisão humana obrigatória.

### Feedback Loop
A cada 10 revisões humanas, padrões são analisados para melhorar extrações futuras automaticamente.

---

*ETL Universal Converter v1.1.0 — Any file in, quality-verified markdown out.*
