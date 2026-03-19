# Workflow: Material Ingestion & Normalization

**Workflow ID:** knowledge-base-builder/ingest-materials
**Version:** 1.0.0
**Status:** Production Ready
**Created:** 2026-02-13
**Total Lines:** 350+

---

## Executive Summary

This is the standalone ingestion workflow for processing raw materials into normalized, metadata-tagged text blocks. It can be used independently (to prepare materials for custom processing) or as the first stage of the full pipeline.

**Timeline:** 1-2 hours depending on volume
**Agents Involved:** 2 (kb-chief, doc-parser)
**Output:** Normalized Document Objects with full metadata

---

## Input Specification

```yaml
input:
  materials_path:
    title: "Path to materials directory"
    required: true
    validation: "Must be accessible directory with supported files"
    supported_formats:
      - ".pdf"
      - ".docx"
      - ".doc"
      - ".txt"
      - ".srt"
      - ".vtt"
      - ".pptx"
      - ".xlsx"
      - ".md"
      - ".pages"    # Will attempt conversion via pandoc
      - ".rtf"      # Will attempt conversion via pandoc
      - ".html"     # Direct parsing
      - ".epub"     # Will attempt conversion via pandoc

  output_path:
    title: "Where to write normalized documents"
    required: true

  options:
    recursive:
      title: "Scan subdirectories?"
      default: true
    skip_duplicates:
      title: "Skip files with same content hash?"
      default: true
    ocr_enabled:
      title: "Use OCR for scanned PDFs?"
      default: false
      note: "Requires Tesseract or similar OCR tool installed"
```

---

## Stage 1: Material Inventory

**Agent:** kb-chief
**Duration:** 2-5 minutes

```
[Directory Scan]
  Recursively scan materials_path
  Collect: file name, extension, size, modification date
  |
  v
[Format Classification]
  Group files by format:
  - PDF: {count, total_size}
  - DOCX: {count, total_size}
  - Transcripts (SRT/VTT): {count, total_size}
  - PPTX: {count, total_size}
  - Text (TXT/MD): {count, total_size}
  - Other: {count, formats, note: "may need conversion"}
  |
  v
[Duplicate Detection]
  Hash files, flag exact duplicates
  |
  v
[Scope Estimation]
  Estimated processing time based on:
  - PDF pages (avg 2s/page)
  - DOCX files (avg 5s/file)
  - Transcripts (avg 1s/file)
  - PPTX (avg 10s/file)
  |
  v
OUTPUT: material-inventory.yaml
```

**Output Schema:**
```yaml
inventory:
  scan_path: "/path/to/materials"
  scan_date: "2026-02-13T10:00:00Z"
  recursive: true

  summary:
    total_files: 47
    total_size_mb: 234.5
    estimated_processing_minutes: 35
    supported_files: 45
    unsupported_files: 2

  by_format:
    pdf:
      count: 12
      total_pages_estimated: 450
      total_size_mb: 180.2
      files:
        - name: "textbook-ch1.pdf"
          path: "/path/to/materials/pdf/textbook-ch1.pdf"
          size_mb: 15.3
          estimated_pages: 45

    docx:
      count: 8
      total_size_mb: 12.4
      files: [...]

    transcripts:
      count: 20
      formats: ["srt", "vtt"]
      total_size_mb: 5.6
      files: [...]

    pptx:
      count: 3
      total_size_mb: 35.0
      files: [...]

    text:
      count: 2
      total_size_mb: 1.3
      files: [...]

  duplicates:
    - file_a: "slides-v1.pdf"
      file_b: "slides-final.pdf"
      similarity: "exact_hash_match"
      recommendation: "Process slides-final.pdf only"

  unsupported:
    - name: "recording.mp4"
      format: "mp4"
      suggestion: "Use aios-transcriber tool first"
    - name: "notes.key"
      format: "key"
      suggestion: "Export as PDF or PPTX from Keynote"
```

---

## Stage 2: Batch Processing

**Agent:** doc-parser
**Duration:** 30-90 minutes

### Processing Order

Files are processed in this priority order for optimal results:

1. **PDFs** -- Usually the richest, most structured source
2. **DOCX/DOC** -- Structured text with heading hierarchy
3. **PPTX** -- Slide content with notes
4. **Transcripts (SRT/VTT)** -- Ordered by filename/number
5. **Text files (TXT/MD)** -- Simplest format
6. **Other formats** -- Attempted via pandoc conversion

### Per-File Processing

```
For each file:
  |
  v
[1. Format Detection]
  Read magic bytes + extension
  Select appropriate parser
  |
  v
[2. Parser Execution]
  PDF: pymupdf.open(file) -> extract text per page
  DOCX: python-docx -> extract paragraphs with styles
  SRT/VTT: subtitle-parser -> extract entries with timestamps
  PPTX: tools/document-processing/pptx -> extract slides + notes
  TXT/MD: direct read with encoding detection
  |
  v
[3. Block Segmentation]
  Split extracted text into semantic blocks:
  - By heading (new heading = new block)
  - By paragraph (for unheaded content)
  - By timestamp (for transcripts)
  - By slide (for presentations)
  |
  v
[4. Metadata Tagging]
  Attach to each block:
  - source_file: original filename
  - source_format: detected format
  - page / timestamp / slide_number / line_number
  - block_type: heading | paragraph | list | table | quote
  - heading_level: 1-6 (if applicable)
  |
  v
[5. Normalization]
  - Unicode NFC normalization
  - Whitespace cleanup (collapse multiple spaces/newlines)
  - Remove control characters
  - Fix common encoding issues (smart quotes, em dashes)
  - Preserve intentional formatting (code blocks, tables)
  |
  v
[6. Quality Check]
  - Non-empty extraction (word count > 0)
  - Metadata completeness
  - No encoding errors (mojibake detection)
  - Reasonable block sizes (flag blocks > 5000 words)
  |
  v
[7. Output]
  Write Normalized Document Object as JSON
  Append to processing log
```

### Processing Log

```yaml
processing_log:
  started_at: "2026-02-13T10:05:00Z"
  completed_at: "2026-02-13T10:42:00Z"
  duration_minutes: 37

  results:
    - file: "textbook-ch1.pdf"
      status: "success"
      parser: "pymupdf"
      blocks_extracted: 145
      words_extracted: 12345
      pages_processed: 45
      confidence: 0.97
      warnings: []

    - file: "scanned-handout.pdf"
      status: "partial"
      parser: "pymupdf"
      blocks_extracted: 5
      words_extracted: 234
      pages_processed: 10
      confidence: 0.15
      warnings: ["Low text extraction - likely scanned PDF. OCR recommended."]

    - file: "corrupt-file.docx"
      status: "failed"
      parser: "python-docx"
      error: "BadZipFile: File is not a zip file"
      suggestion: "File may be corrupted. Try opening in Word and re-saving."

  summary:
    total_attempted: 47
    successful: 44
    partial: 2
    failed: 1
    success_rate: 0.936
    total_blocks: 3456
    total_words: 234567
```

---

## Quality Gate: INGESTION-COMPLETE

```yaml
gate:
  id: "QG-INGEST"
  criteria:
    files_attempted: "== inventory.total_files"
    success_rate: ">= 0.95"
    metadata_coverage: "== 1.0 (all blocks have source metadata)"
    failures_documented: "every failure has error + suggestion"

  action:
    pass: "Continue to Content Analysis"
    warn: "Success rate 80-95%: continue with documented gaps"
    fail: "Success rate < 80%: HALT, present failures to user"

  output:
    normalized_documents_path: "{output_path}/normalized/"
    processing_log_path: "{output_path}/reports/processing-log.yaml"
    material_inventory_path: "{output_path}/reports/material-inventory.yaml"
```

---

## Error Handling

### Common Issues

| Issue | Detection | Resolution |
|-------|-----------|------------|
| Scanned PDF | Text/area ratio < 10% | Flag for OCR, or skip with warning |
| Password-protected PDF | pymupdf raises PasswordError | Ask user for password |
| Corrupt file | Parser raises exception | Skip, log error, continue |
| Unsupported encoding | UnicodeDecodeError | Try Latin-1, CP-1252, then skip |
| Oversized file (>100MB) | File size check | Process in chunks if possible |
| Empty file | Zero bytes or zero words after extraction | Skip, log as empty |
| Duplicate content | Same hash across files | Process highest-quality version |

### Retry Policy
- Each file gets 1 retry with alternative parser if available
- No retries for corrupt/empty files
- User notified of all failures in processing log
