# Task: Parse Documents

**Task ID:** knowledge-base-builder/parse-documents
**Version:** 1.0.0
**Status:** Production Ready
**Created:** 2026-02-13
**Category:** Phase 1 - Ingestion

---

## Executive Summary

This task processes all files from the material inventory through format-specific parsers, extracting clean text with preserved metadata (page numbers, timestamps, slide numbers). It produces Normalized Document Objects -- the standardized intermediate representation used by all downstream agents.

**Workflow Position:** Step 1.2 of full pipeline (after inventory)
**Success Definition:** >= 95% files parsed, all with source metadata
**Output Quality Gate:** QG-PARSE (success rate + metadata coverage)

---

## Executor Type

**Agent (100%)**
- Agent selects parser per file, executes extraction, validates output
- Handles errors gracefully (skip and log, never crash)

---

## Inputs

```yaml
material_inventory:
  field: "Material inventory from previous task"
  format: "material-inventory.yaml"
  required: true

output_path:
  field: "Directory for normalized document objects"
  format: "Absolute file path"
  required: true

options:
  ocr_enabled:
    default: false
  max_file_size_mb:
    default: 100
```

---

## Action Items

### Step 1: Parser Selection
For each file in inventory (in priority order: PDF > DOCX > PPTX > Transcripts > TXT):
1. Read file format from inventory classification
2. Select appropriate parser:
   - PDF -> PyMuPDF (fitz), fallback: pdfplumber
   - DOCX -> python-docx, fallback: tools/document-processing/docx/
   - PPTX -> tools/document-processing/pptx/
   - SRT/VTT -> subtitle-parser (Python) or manual regex
   - TXT/MD -> direct file read with encoding detection
   - XLSX -> tools/document-processing/xlsx/ (extract text content)
   - HTML -> BeautifulSoup or markitdown
   - Other -> pandoc conversion attempt

### Step 2: Text Extraction
For each file:
1. Open file with selected parser
2. Extract text preserving structure (headings, paragraphs, lists, tables)
3. Tag each text block with source location:
   - PDFs: page number, approximate paragraph position
   - DOCX: heading level, paragraph index
   - Transcripts: start timestamp, end timestamp, speaker (if present)
   - PPTX: slide number, content type (title/body/notes)
   - TXT: line number range

### Step 3: Block Segmentation
1. Split extracted text into semantic blocks
2. Each block is a coherent unit: one heading, one paragraph, one list, one table
3. Assign block IDs: `blk-{doc_hash}-{sequence_number}`
4. Assign block types: heading, paragraph, list, table, quote, code

### Step 4: Normalization
1. Unicode NFC normalization
2. Collapse excessive whitespace (but preserve paragraph breaks)
3. Fix smart quotes and special characters
4. Remove PDF artifacts (page headers/footers, watermarks if detected)
5. Fix line-break hyphenation in PDFs ("know-\nledge" -> "knowledge")

### Step 5: Quality Validation Per File
1. Check: extracted word count > 0 (non-empty)
2. Check: all blocks have source location metadata
3. Check: no encoding errors (scan for replacement characters)
4. Check: reasonable block sizes (split oversized blocks)
5. Rate confidence: 0-1 based on extraction cleanness

### Step 6: Write Output
1. Write one JSON file per input document: `{doc_hash}.json`
2. Follow Normalized Document Object schema (see doc-parser agent)
3. Append results to processing log

---

## Output

```yaml
output:
  normalized_documents:
    path: "{output_path}/normalized/"
    format: "One JSON per document, following NDO schema"
  processing_log:
    path: "{output_path}/reports/processing-log.yaml"
    format: "Per-file results with status, stats, warnings"
```

---

## Acceptance Criteria

- [ ] All inventory files attempted
- [ ] >= 95% files parsed successfully
- [ ] Every block has source location metadata (page/timestamp/slide/line)
- [ ] Failed files have documented error reason and suggestion
- [ ] Output follows Normalized Document Object schema
- [ ] Processing log is complete and valid YAML
- [ ] No encoding errors in output text (no mojibake)
- [ ] Block IDs are unique across all documents
