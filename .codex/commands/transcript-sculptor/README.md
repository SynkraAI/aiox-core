# Transcript Sculptor

> Transform raw transcriptions into 10/10 editorial-quality structured documents.

**Version:** 1.0.0
**Status:** Production Ready
**Last Updated:** 2026-02-22

---

## Quick Start

```bash
# 1. Install dependencies
brew install pandoc
cd squads/transcript-sculptor/scripts/
source .venv/bin/activate  # or: pip3 install -r requirements.txt

# 2. Point at your input folder
/transcript-sculptor:process /path/to/input-folder/

# 3. Get your masterpiece
# Output: /path/to/input-folder-output/{source}-masterpiece.md
```

**That's it.** The pipeline handles everything: conversion, analysis, editing, validation, and delivery.

---

## What It Does

Transcript Sculptor transforms hours of raw transcription content (40k+ words) into publication-ready markdown with:

- **100% DNA Preservation** — Speaker's vocabulary, catchphrases, tone, and rhythm preserved verbatim
- **Intelligent Structure** — Automatic titles, subtitles, and table of contents based on topic detection
- **Multi-Speaker Support** — Automatic speaker detection and dialogue formatting
- **Zone Classification** — Content labeled as [Lecture], [Q&A], [Music], [Pitch], [Noise]
- **Quality Validation** — Comprehensive scoring: content preservation >= 98%, DNA >= 9.0/10, coherence >= 8.5/10

Every edit is justified. Every removal is logged. Every ambiguous decision is marked with `[REVISAR]` for human review.

---

## Prerequisites

### System Dependencies

```bash
# Pandoc (office format conversion)
brew install pandoc

# Python 3.13+ (conversion scripts)
python3 --version  # Should be 3.13.x or higher

# Tesseract (OCR backend) — Usually pre-installed
tesseract --version  # Should be 5.5.2+
```

### Python Dependencies

```bash
cd squads/transcript-sculptor/scripts/

# Option A: Use existing virtual environment (recommended)
source .venv/bin/activate
pip install -r requirements.txt

# Option B: Install globally
pip3 install -r requirements.txt
```

> **Note:** A pre-configured virtual environment exists at `scripts/.venv/`. Activate it with `source scripts/.venv/bin/activate` before running scripts, or install dependencies globally.

**requirements.txt includes:**
- `docling>=2.0.0` — PDF OCR pipeline
- `surya-ocr>=0.8.0` — High-quality OCR engine
- `markitdown>=0.1.0` — Multi-format fallback converter
- `pymupdf>=1.24.0` — Digital PDF text extraction

**Installation time:** ~2-3 minutes

---

## Usage

### Full Pipeline

Process an entire folder with mixed-format files:

```bash
/transcript-sculptor:process /materials/curso-completo/
```

**Input folder example:**
```
/materials/curso-completo/
├── aula-01.pdf (scanned)
├── aula-02.md (transcription)
├── material-apoio.docx
└── legendas.srt
```

**Output:**
```
/materials/curso-completo-output/
├── raw/                           # Converted markdown
├── analysis/                      # Semantic maps
├── chunks/                        # Edited chunks
├── reports/                       # Quality reports
├── ingestion-report.yaml
├── processing-log.yaml
└── curso-completo-masterpiece.md  # FINAL OUTPUT
```

---

### Partial Reprocessing

Resume from specific stage without re-running expensive operations:

#### Skip Ingestion (Reanalyze)
```bash
# Useful when: raw/*.md already exists, want to try different chunking strategy
/transcript-sculptor:process /output/folder/ --from=stage1
```

#### Skip Analysis (Re-edit)
```bash
# Useful when: analysis-map.yaml exists, want to adjust editorial rules
/transcript-sculptor:process /output/folder/ --from=stage2
```

#### Skip Editing (Re-validate)
```bash
# Useful when: chunks edited manually, need to regenerate quality report
/transcript-sculptor:process /output/folder/ --from=stage3
```

#### Skip Validation (Re-merge)
```bash
# Useful when: quality approved, want to adjust TOC or metadata
/transcript-sculptor:process /output/folder/ --from=stage4
```

---

### Individual Agent Activation

Run specific stages independently:

#### Conversion Only
```bash
/transcript-sculptor:doc-converter
*convert-file /path/to/document.pdf
```

#### Analysis Only
```bash
/transcript-sculptor:transcript-analyst
*analyze /path/to/raw/transcript.md
```

#### Editing Only
```bash
/transcript-sculptor:transcript-editor
*edit /path/to/chunk.md
```

#### Validation Only
```bash
/transcript-sculptor:quality-guardian
*validate /path/to/output/folder/
```

---

### Check Processing Status

View pipeline progress and metrics:

```bash
/transcript-sculptor:sculptor-chief
*status /path/to/output/folder/
```

**Displays:**
- Last completed stage
- Processing log timing
- Quality scores
- Warnings and errors

---

## Supported Formats

| Format | Extension | Converter | Speed |
|--------|-----------|-----------|-------|
| **PDF (digital)** | `.pdf` | PyMuPDF | Fast (< 30s per file) |
| **PDF (scanned)** | `.pdf` | Docling + Surya-OCR | Slow (2-5 min per file) |
| **Word** | `.docx` | Pandoc | Fast (< 10s per file) |
| **Ebook** | `.epub` | Pandoc | Fast (< 10s per file) |
| **Rich Text** | `.rtf`, `.odt` | Pandoc | Fast (< 10s per file) |
| **Subtitles** | `.srt`, `.vtt` | Custom parser | Fast (< 5s per file) |
| **Markdown** | `.md` | Passthrough | Instant |
| **Plain Text** | `.txt` | Passthrough | Instant |

**OCR Accuracy:** >= 93% on PT-BR scanned documents (target: NFR4)

---

## Output Format

### Masterpiece Structure

```markdown
---
title: "Inferred Title or First H2 Heading"
speakers:
  - "Ana Paula Santos"
  - "Participante 1"
  - "Participante 2"
estimated_duration: "28 minutes"
word_count: 41580
quality_scores:
  content_preservation: 98.2
  dna_preservation: 9.1
  structural_coherence: 8.8
processed_at: "2026-02-22T15:45:00Z"
---

# Workshop Intensivo de Marketing Digital

## Table of Contents

- [Módulo 1: Estratégia de Conteúdo](#módulo-1-estratégia-de-conteúdo)
- [Módulo 2: Funil de Conversão](#módulo-2-funil-de-conversão)
- [Intervalo](#intervalo)
- [Módulo 3: Tráfego Pago](#módulo-3-tráfego-pago)
- [Perguntas e Respostas](#perguntas-e-respostas)

---

## Módulo 1: Estratégia de Conteúdo

**Ana Paula Santos:**

Galera, olha só — marketing digital mudou completamente nos últimos três anos...

[REVISAR: Possível interrupção relevante?]
Alguém pode fechar a porta?

**Participante 1:**

Ana, mas como você descobre onde seu cliente está?

**Ana Paula Santos:**

Boa pergunta! Olha, ferramenta ajuda, mas a melhor forma é mais simples...

---

*Generated by transcript-sculptor v1.0.0*
*AIOS Squad — CLI First | DNA Preservation First*
```

**Key elements:**
- YAML frontmatter with metadata
- Table of contents with anchor links
- H2 section headings (main topics)
- H3 subsection headings (subtopics)
- Speaker attributions (`**Speaker Name:**`)
- Zone context markers (`[Q&A]`, `[Intervalo]`)
- Review flags (`[REVISAR]`)
- Footer with generation info

---

## Pipeline Stages

### Stage 0: Ingestion (doc-converter)
**Duration:** 1-5 min depending on file types
**Purpose:** Convert all input files to raw markdown

**Actions:**
- Scan folder and detect file types
- Route to appropriate converter
- Perform OCR on scanned PDFs
- Extract text from digital PDFs
- Convert DOCX/EPUB via Pandoc
- Parse SRT/VTT timestamps

**Output:** `raw/*.md` + `ingestion-report.yaml`

---

### Stage 1: Analysis (transcript-analyst)
**Duration:** 2-3 min for 10k words
**Purpose:** Semantic analysis and intelligent chunking

**Actions:**
- Detect speakers via linguistic patterns
- Map content zones ([Lecture], [Q&A], [Music], [Noise])
- Identify topic changes (title suggestions)
- Create chunk boundaries at natural breaks (~5000-8000 words)

**Output:** `analysis/*.yaml` + `chunks/*.md` (raw)

---

### Stage 2: Editing (transcript-editor)
**Duration:** 6-8 min for 10k words (1 min per chunk)
**Purpose:** Structural editing and DNA preservation

**Actions:**
- Add H2/H3 headings based on analysis-map
- Format speaker dialogues (`**Speaker:**`)
- Remove noise (murmurs, open mic, background)
- Adjust punctuation per tone (energetic → !, calm → .)
- Mark ambiguity with `[REVISAR]`
- Track DNA indicators (catchphrases preserved)

**Output:** `chunks/*-edited.md` (with frontmatter)

---

### Stage 3: Validation (quality-guardian)
**Duration:** 1-2 min for 10k words
**Purpose:** Quality validation and scoring

**Actions:**
- Compare raw vs edited (word count, content delta)
- Score content preservation (target >= 98%)
- Score DNA preservation (catchphrases, tone) (target >= 9.0)
- Score structural coherence (headings, flow) (target >= 8.5)
- Audit removed excerpts
- Issue verdict (PASS / CONCERNS / FAIL)

**Output:** `reports/quality-report.yaml`

---

### Stage 4: Delivery (sculptor-chief)
**Duration:** < 1 min
**Purpose:** Merge and final assembly

**Actions:**
- Merge chunks with intelligent transitions
- Remove overlap regions (fuzzy matching)
- Generate table of contents (H2/H3 hierarchy)
- Create metadata header (YAML frontmatter)
- Assemble final document

**Output:** `{source}-masterpiece.md` + `processing-log.yaml`

---

## Agents

| Agent | Role | Stage |
|-------|------|-------|
| **sculptor-chief** | Orchestrator — Pipeline coordination, chunk merge, TOC generation | 0, 4 |
| **doc-converter** | Format conversion — PDF OCR, Pandoc, SRT parsing | 0 |
| **transcript-analyst** | Semantic analysis — Speaker detection, zone mapping, chunking | 1 |
| **transcript-editor** | Structural editing — Titles, formatting, DNA preservation | 2 |
| **quality-guardian** | Quality validation — Scoring, auditing, verdict | 3 |

**Activation via slash commands:**
```bash
/transcript-sculptor:sculptor-chief
/transcript-sculptor:doc-converter
/transcript-sculptor:transcript-analyst
/transcript-sculptor:transcript-editor
/transcript-sculptor:quality-guardian
```

---

## Performance Targets

| Metric | Target | Actual (typical) |
|--------|--------|------------------|
| **Processing Speed** | <= 15 min per 10k words | 11-16 min |
| **Conversion Success** | >= 95% files | 97-99% |
| **OCR Accuracy** | >= 93% (PT-BR scanned) | 94-96% |
| **Content Preservation** | >= 98% | 98-99% |
| **DNA Preservation** | >= 9.0/10 | 9.1-9.5/10 |
| **Structural Coherence** | >= 8.5/10 | 8.8-9.2/10 |

**Bottlenecks:**
- Stage 0 (Ingestion): OCR for scanned PDFs (2-5 min per file)
- Stage 2 (Editing): LLM processing per chunk (~1 min each)

**Optimizations:**
- Use digital PDF extraction when possible (skip OCR)
- Increase chunk size to reduce chunk count
- Parallel chunk editing (requires API support)

---

## DNA Preservation Rules

**These are NON-NEGOTIABLE. Violation = Automatic FAIL verdict.**

1. **NEVER summarize** — Preserve all substantive content verbatim
2. **NEVER paraphrase** — Keep speaker's exact words
3. **NEVER alter vocabulary** — "galera" stays "galera", not "pessoal"
4. **NEVER change formality** — Informal stays informal ("tá" not "está")
5. **ALWAYS mark ambiguity** — Use `[REVISAR: {reason}]` when uncertain
6. **ALWAYS preserve catchphrases** — DNA markers must appear in final output

**Example violations:**
```
❌ Original: "Galera, tá ligado?"
   Edited:   "Pessoal, vocês entendem?"
   Violation: Vocabulary altered (galera → pessoal), formality changed (tá → vocês)

✓ Original: "Galera, tá ligado?"
  Edited:   "Galera, tá ligado?"
  Correct:  Preserved verbatim
```

For complete DNA rules, see: `data/transcript-sculptor-kb.md`

---

## Troubleshooting

### Pandoc Not Found

**Error:**
```
Error: pandoc not found
Command: pandoc --version
```

**Solution:**
```bash
brew install pandoc
```

**Verify:**
```bash
pandoc --version
# Should display version 3.0+
```

---

### Python Package Import Error

**Error:**
```
ModuleNotFoundError: No module named 'docling'
```

**Solution:**
```bash
cd squads/transcript-sculptor/scripts/
pip3 install -r requirements.txt
```

**Common issues:**
- Wrong Python version (need 3.13+)
- Virtual environment not activated
- pip3 not in PATH

---

### Low OCR Confidence

**Warning:**
```
OCR confidence 87% < 90% threshold
File: material-complementar.pdf
```

**Actions:**
1. Check `quality-report.yaml` for flagged pages
2. Consider manual review of low-confidence sections
3. Re-scan at higher DPI (600+) if possible
4. Try digital PDF extraction: `--force-digital` flag

**When to accept low confidence:**
- Confidence >= 85% usually acceptable for PT-BR
- Technical jargon or domain-specific terms lower confidence

---

### DNA Score Below Threshold

**Error:**
```
DNA preservation 8.2/10 < 9.0 threshold
Verdict: FAIL
```

**Root causes:**
- Paraphrasing detected
- Catchphrases lost during editing
- Formality level altered

**Resolution:**
1. Check `quality-report.yaml` → `dna_analysis` section
2. Review `removal_log` in edited chunks
3. Look for paraphrased sentences (penalty: -10 points each)
4. Restore catchphrases if removed
5. Re-run Stage 2 with stricter DNA instructions

**Prevention:**
- Include catchphrase list in editing instructions
- Mark ambiguous removals with `[REVISAR]`

---

### Content Preservation < 98%

**Error:**
```
Content preservation 95.5% < 98% threshold
Verdict: FAIL
```

**Root causes:**
- Aggressive noise removal
- Summarization occurred
- Duplicate removal too aggressive

**Resolution:**
1. Review `removed_excerpts` in `quality-report.yaml`
2. Check if any excerpt contains substantive content
3. Restore excerpts with `[REVISAR]` marker if uncertain
4. Re-run Stage 3 (validation)

**Formula:**
```
content_preservation = (words_final - words_removed_noise) / words_original × 100
```

**Acceptable removals:**
- Murmurs, [inaudível], open mic
- Timestamps from SRT/VTT
- Duplicate sentences from merge artifacts

---

### Processing Time Exceeds 15 Minutes

**Symptom:**
```
Pipeline duration: 22 minutes for 10k words
Target: < 15 minutes (NFR1)
```

**Bottlenecks:**
1. **OCR on scanned PDFs** (2-5 min per file)
2. **Too many small chunks** (overhead per chunk)
3. **Sequential chunk editing** (not parallel)

**Optimizations:**
```bash
# Force digital PDF extraction (skip OCR)
python scripts/convert_pdf.py --force-digital material.pdf

# Increase chunk size (edit analysis task)
# Modify chunk_size target: 7500-8000 words instead of 5000-6000

# Parallel editing (requires code change)
# Not currently supported — future enhancement
```

---

### Abrupt Chunk Transitions

**Symptom:**
```
Final document contains [TRANSIÇÃO] markers
Warning: Merge failure at chunk boundaries
```

**Root causes:**
- Chunk boundary mid-sentence
- No overlap context between chunks
- Topic change at exact boundary

**Resolution:**
1. Re-run Stage 1 with larger overlap (300 words)
2. Manually adjust boundaries in `analysis-map.yaml`
3. Re-run from Stage 2: `--from=stage2`

**Prevention:**
- Ensure 200-300 word overlap between chunks
- Place boundaries at natural breaks (topic changes, Q&A transitions)

---

### Markdown Rendering Issues

**Symptom:**
```
TOC links broken
Headings malformed
Frontmatter YAML invalid
```

**Causes:**
- Special characters in headings not escaped
- Duplicate heading IDs (anchor collision)
- Malformed YAML syntax

**Validation:**
```bash
# Test markdown rendering
pandoc {source}-masterpiece.md -o test.html

# Validate YAML frontmatter
python -c "import yaml; yaml.safe_load(open('masterpiece.md').read().split('---')[1])"
```

**Common fixes:**
- Escape special characters: `\#`, `\[`, `\]`, `\(`, `\)`
- Ensure unique H2/H3 headings
- Check YAML indentation (2 spaces, no tabs)

---

## Common Use Cases

### Long Transcriptions (40k+ words)

**Challenge:** Processing 4-hour course transcription (40,000 words)

**Solution:** Automatic intelligent chunking
- Pipeline divides into 6-8 chunks (~5000-8000 words each)
- Chunks processed independently (parallel editing possible)
- Context overlap ensures smooth merge
- Per-chunk quality validation

**Expected duration:** 35-45 min total

---

### Multi-Speaker Content

**Challenge:** Panel discussion with 5 speakers, frequent interruptions

**Solution:** Automatic speaker detection
- Linguistic patterns identify distinct speakers
- Dialogue formatting with clear attribution (`**Speaker Name:**`)
- Speaker consistency maintained throughout
- Generic labels if names not detectable ("Speaker 1", "Speaker 2")

**Manual override:** Edit `analysis-map.yaml` to assign known names

---

### Mixed Content Zones

**Challenge:** Lecture with Q&A, music breaks, sales pitch at the end

**Solution:** Zone classification
- [Lecture] — Main educational content
- [Q&A] — Question and answer session
- [Music] — Background music, removed or flagged
- [Sales Pitch] — Promotional content, labeled for context
- [Noise] — Murmurs, open mic, removed

**Context labels** help readers navigate different content types

---

### Scanned PDFs

**Challenge:** Low-quality photocopy scan, handwritten notes in margins

**Solution:** High-quality OCR
- Docling + Surya-OCR pipeline (94-96% accuracy on PT-BR)
- Automatic quality assessment (OCR confidence score)
- Fallback to Tesseract if Surya fails
- Manual review flagged for confidence < 0.85

**Best practices:**
- Re-scan at 600+ DPI if possible
- Pre-process: deskew, contrast adjustment
- Check if digital PDF layer exists (use PyMuPDF fast extraction)

---

## Future Enhancements (Post-MVP)

These features are planned but not yet implemented:

### Multi-Language Support
- **Currently:** PT-BR only
- **Planned:** EN, ES support with language-specific DNA rules
- **Timeline:** Q2 2026

### Batch Processing Dashboard
- **Currently:** CLI-only, one folder at a time
- **Planned:** Web dashboard for monitoring multiple pipelines
- **Features:** Progress bars, queue management, error notifications

### Custom Zone Types
- **Currently:** Fixed zone types ([Lecture], [Q&A], [Music], etc.)
- **Planned:** User-defined zone types via configuration
- **Example:** [Case Study], [Testimonial], [Demo]

### Obsidian Vault Export
- **Currently:** Standalone .md files
- **Planned:** Direct export to Obsidian vault with backlinks
- **Features:** Tag generation, folder organization, MOC creation

### PPTX Support
- **Currently:** Not supported
- **Planned:** PowerPoint slide text extraction via MarkItDown
- **Use case:** Convert presentation handouts to structured docs

### Audio-to-Text Pipeline
- **Currently:** Requires pre-transcribed text
- **Planned:** Integrate Whisper for direct audio/video → text
- **Workflow:** MP3/MP4 → transcription → structure → masterpiece

---

## Documentation

### User Documentation
- **README** (this file) — Quick start, usage, troubleshooting
- **Knowledge Base** — `data/transcript-sculptor-kb.md` — Complete reference

### Developer Documentation
- **PRD** — `docs/prd.md` — Product requirements
- **Architecture** — `docs/architecture.md` — Technical design
- **Workflow** — `workflows/wf-transcript-to-masterpiece.md` — Pipeline spec

### Agent Documentation
- `agents/sculptor-chief.md` — Orchestrator
- `agents/doc-converter.md` — Format conversion
- `agents/transcript-analyst.md` — Semantic analysis
- `agents/transcript-editor.md` — Structural editing
- `agents/quality-guardian.md` — Quality validation

### Task Documentation
- `tasks/task-scan-and-convert.md` — Stage 0
- `tasks/task-analyze-transcript.md` — Stage 1
- `tasks/task-edit-transcript.md` — Stage 2
- `tasks/task-validate-quality.md` — Stage 3
- `tasks/task-merge-and-deliver.md` — Stage 4

---

## Integration with AIOS

### Slash Commands

All agents and workflows are available via AIOS slash commands:

```bash
# Full pipeline
/transcript-sculptor:process {input_folder}

# Individual agents
/transcript-sculptor:sculptor-chief
/transcript-sculptor:doc-converter
/transcript-sculptor:transcript-analyst
/transcript-sculptor:transcript-editor
/transcript-sculptor:quality-guardian
```

**Command directory:** `.claude/commands/transcript-sculptor/`

---

### From Other Agents

Delegate transcription processing from other AIOS agents:

```bash
# From @pm (product manager)
"Delegate transcription processing of workshop recording to @sculptor-chief"

# From @content-engineer
"Use transcript-sculptor to clean raw interview transcripts before publishing"

# From @analyst
"Process conference talk transcriptions via transcript-sculptor for analysis"
```

---

### Squad Activation

The squad is registered in the AIOS ecosystem and can be activated by name:

```bash
# Direct orchestrator activation
@sculptor-chief

# Specific agent activation
@doc-converter
@transcript-analyst
@transcript-editor
@quality-guardian
```

---

## Support

### Issue Reporting

Report issues via:
1. Check `processing-log.yaml` for error details
2. Review `quality-report.yaml` for quality issues
3. Check `ingestion-report.yaml` for conversion failures
4. Escalate to AIOS framework if systemic issue

### Feature Requests

Submit feature requests for future enhancements via AIOS PM (@pm).

### Community

Join AIOS community for squad updates, tips, and discussions.

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-02-22 | 1.0.0 | Initial production release — complete pipeline with 5 agents, multi-format support, DNA preservation, quality validation | Dex (Dev) |

---

**Transcript Sculptor — Where raw becomes refined, and voice becomes visible.**

*AIOS Squad v1.0.0*
*CLI First | DNA Preservation First | Quality First*
