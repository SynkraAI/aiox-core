---
paths:
  - "skills/book-to-markdown/"
lazy_load: true
context_budget: 1200
name: book-to-markdown
description: |
  Converte livros (PDF, EPUB, MOBI, DOCX) para Markdown bem formatado.
  Suporta batch processing, limpeza automática e frontmatter YAML.

version: 1.0.0
category: design
tags: [SKILL]
---

# Book to Markdown

Skill reutilizável para converter livros de qualquer formato para Markdown de alta qualidade.

## Quick Start

```
/AIOS:skills:book-to-markdown /path/to/book.pdf
/AIOS:skills:book-to-markdown /path/to/books/ --batch
```

## Discovery Questions

Perguntas para fazer antes de executar. Use AskUserQuestion tool. Pule se o usuário já forneceu esse contexto.

1. **Qual o caminho do(s) arquivo(s) a converter?** — (necessário para executar o comando)
2. **O livro tem layout complexo (tabelas, fórmulas, blocos de código)?** — (define se usa modo `fast` ou `precise`)
3. **Precisa preservar referências a imagens/diagramas?** — (ativa `--keep-images` para livros técnicos)
4. **Onde salvar o output?** — (define `-o`, senão salva ao lado do original) (opcional)

## Supported Formats

| Format | Tool Used | Quality |
|--------|-----------|---------|
| **PDF** (digital) | PyMuPDF4LLM (fast) / Marker (precise) | High |
| **PDF** (scanned) | Marker + Surya OCR | Medium-High |
| **EPUB** | Pandoc | High |
| **MOBI/AZW/AZW3** | Calibre → Pandoc | High |
| **DOCX** | Pandoc | High |
| **RTF/ODT** | Pandoc | High |

## Usage

### Single File

```bash
# Fast mode (default) - PyMuPDF4LLM for PDFs
python3 skills/book-to-markdown/convert.py /path/to/book.pdf

# Precise mode - Marker for complex PDFs (tables, code, formulas)
python3 skills/book-to-markdown/convert.py /path/to/book.pdf -q precise

# Custom output path
python3 skills/book-to-markdown/convert.py /path/to/book.epub -o /path/to/output.md

# Preserve image references (for technical books with diagrams)
python3 skills/book-to-markdown/convert.py /path/to/book.pdf --keep-images

# Skip frontmatter
python3 skills/book-to-markdown/convert.py /path/to/book.pdf --no-frontmatter

# Skip cleanup post-processing
python3 skills/book-to-markdown/convert.py /path/to/book.pdf --no-clean

# Overwrite existing output
python3 skills/book-to-markdown/convert.py /path/to/book.pdf --overwrite

# Custom timeout (default: 300s)
python3 skills/book-to-markdown/convert.py /path/to/book.pdf --timeout 600

# Verbose/debug logging
python3 skills/book-to-markdown/convert.py /path/to/book.pdf -v
```

### Batch Processing

```bash
# Preview what would be converted (no changes)
python3 skills/book-to-markdown/convert.py /path/to/books/ --batch --dry-run

# Convert all books in a directory
python3 skills/book-to-markdown/convert.py /path/to/books/ --batch

# Batch with precise mode
python3 skills/book-to-markdown/convert.py /path/to/books/ --batch -q precise

# Batch with custom output directory
python3 skills/book-to-markdown/convert.py /path/to/books/ --batch -o /path/to/output/

# Batch overwriting existing files
python3 skills/book-to-markdown/convert.py /path/to/books/ --batch --overwrite
```

## Output Format

Each converted book produces a single `.md` file with:

```markdown
---
title: "Book Title"
author: "Author Name"
language: en
source_file: "original-filename.pdf"
source_format: pdf
conversion_tool: pymupdf4llm
conversion_date: 2026-03-04
word_count: 45230
conversion_confidence: high
---

# Book Title

## Table of Contents

- [Chapter 1](#chapter-1)
- [Chapter 2](#chapter-2)
  - [Section 2.1](#section-21)

[Full book content in clean Markdown...]
```

### Frontmatter Fields

| Field | Source | Description |
|-------|--------|-------------|
| `title` | PDF metadata > H1 header > filename | Book title |
| `author` | PDF metadata (when available) | Author name |
| `language` | Auto-detected (en/pt/es/fr/de/it) | Content language |
| `source_file` | Input filename | Original file name |
| `source_format` | File extension | pdf/epub/mobi/docx/rtf/odt |
| `conversion_tool` | Converter used | pymupdf4llm/marker/pandoc/calibre+pandoc |
| `conversion_date` | Current date | ISO 8601 format |
| `word_count` | Content analysis | Total word count |
| `conversion_confidence` | Output validation | high/medium/low |

### Automatic TOC

A Table of Contents is automatically generated from H2-H4 headers when the book has 3+ headers. Use `--no-toc` to disable.

## Quality Validation

The skill automatically validates every conversion:

- **Minimum word count** (100 words) — rejects empty/near-empty output
- **Alphabetic ratio check** — detects garbled/binary output
- **Confidence scoring** — `high` (>5000 words), `medium` (>1000), `low` (<1000)
- Invalid conversions are **skipped with a warning**, not saved silently

## Safety Features

| Feature | Description |
|---------|-------------|
| **Overwrite protection** | Won't replace existing `.md` files unless `--overwrite` is passed |
| **Timeout protection** | 5-minute default per file, configurable with `--timeout` |
| **Dry run** | `--dry-run` previews batch operations without converting |
| **Batch skip** | Already-converted files are skipped in batch mode |
| **Output validation** | Rejects garbage output (low word count, garbled text) |

## Post-Processing (Automatic)

The skill automatically:
- Fixes hyphenated line breaks (`word-\nbreak` → `wordbreak`) — lowercase-to-lowercase, including accented characters
- Removes page number markers and headers/footers
- Normalizes whitespace around headers
- Fixes list formatting
- Removes excessive blank lines
- Trims trailing whitespace
- Removes Pandoc artifacts ({.class}, ::: divs)
- Optionally preserves image references (`--keep-images`)

## Dependencies

### Required

```bash
pip install pymupdf4llm
```

### Optional (for advanced features)

```bash
# For precise PDF mode (complex layouts, formulas, code blocks)
# NOTE: If marker-pdf is not installed, -q precise falls back to fast mode with a warning
pip install marker-pdf

# For MOBI/AZW format support
brew install --cask calibre

# Pandoc (usually pre-installed, required for EPUB/DOCX)
brew install pandoc
```

## CLI Reference

```
usage: convert.py [-h] [-o OUTPUT] [-q {fast,precise}] [--batch] [--dry-run]
                  [--no-frontmatter] [--no-clean] [--no-toc] [--keep-images]
                  [--overwrite] [--timeout TIMEOUT] [-v]
                  input

positional arguments:
  input                 Input file or directory (with --batch)

options:
  -o, --output          Output .md file path (or directory for --batch)
  -q, --quality         PDF quality: fast (default) or precise
  --batch               Process all files in a directory
  --dry-run             Preview batch files without converting
  --no-frontmatter      Skip YAML frontmatter
  --no-clean            Skip post-processing cleanup
  --no-toc              Skip automatic Table of Contents generation
  --keep-images         Preserve image references in output
  --overwrite           Overwrite existing output files
  --timeout TIMEOUT     Timeout in seconds per file (default: 300)
  -v, --verbose         Enable verbose/debug logging
```

## Integration with Other Squads

Any squad can invoke this skill:

```markdown
## Step 1: Convert source material
Execute: `python3 skills/book-to-markdown/convert.py {input_path} -o {output_path}`
```

Or via slash command:
```
/AIOS:skills:book-to-markdown {path}
```

## Decision Matrix

| Scenario | Use `-q fast` | Use `-q precise` | Use `--keep-images` |
|----------|:---:|:---:|:---:|
| Novel / fiction | **X** | | |
| Technical book (code) | | **X** | **X** |
| Academic (formulas) | | **X** | **X** |
| Simple text PDF | **X** | | |
| Complex layout PDF | | **X** | |
| EPUB / MOBI / DOCX | **X** (default) | N/A | |
| Book with diagrams | **X** or precise | | **X** |
