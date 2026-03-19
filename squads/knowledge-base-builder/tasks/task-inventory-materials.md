# Task: Inventory Materials

**Task ID:** knowledge-base-builder/inventory-materials
**Version:** 1.0.0
**Status:** Production Ready
**Created:** 2026-02-13
**Category:** Phase 1 - Ingestion

---

## Executive Summary

This atomic task scans a materials directory, classifies all files by format, detects duplicates, estimates processing scope, and produces a structured inventory. It is the first task in the pipeline and determines the scope of all downstream processing.

**Workflow Position:** Entry point (Step 1.1 of full pipeline)
**Success Definition:** Complete inventory with all files classified and scope estimated
**Output Quality Gate:** Every file must be classified (supported or unsupported)

---

## Executor Type

**Agent (100%)**
- Agent scans directory, classifies files, produces inventory
- No human input needed (materials path is the only input)

---

## Inputs

```yaml
materials_path:
  field: "Path to materials directory"
  format: "Absolute file path"
  required: true
  validation: "Directory must exist and be readable"

options:
  recursive:
    default: true
  skip_duplicates:
    default: true
```

---

## Action Items

### Step 1: Directory Scan
1. Recursively scan `materials_path` for all files
2. Collect: filename, extension, absolute path, file size, modification date
3. Exclude hidden files (starting with `.`) and system files

### Step 2: Format Classification
1. Classify each file by extension AND magic bytes (for mismatched extensions)
2. Group into categories: pdf, docx, transcripts (srt/vtt), pptx, text (txt/md), xlsx, other
3. Flag unsupported formats with conversion suggestions

### Step 3: Duplicate Detection
1. Compute content hash (SHA-256) for each file
2. Group files with identical hashes
3. For each duplicate group: recommend which to process (newest, largest, or user choice)

### Step 4: Scope Estimation
1. Estimate page count for PDFs (from metadata or file size heuristic)
2. Calculate total word count estimate
3. Estimate processing time: PDFs ~2s/page, DOCX ~5s/file, transcripts ~1s/file
4. Present scope: total files, total estimated pages, estimated processing time

### Step 5: Generate Inventory
1. Produce structured YAML inventory
2. Include per-file details and aggregate statistics
3. Flag any issues (unsupported formats, very large files, potential duplicates)

---

## Output

```yaml
output:
  file: "material-inventory.yaml"
  sections:
    - scan_metadata (path, date, options)
    - summary (counts, sizes, estimates)
    - by_format (detailed per-format breakdown)
    - duplicates (hash-based duplicate groups)
    - unsupported (files needing conversion)
    - issues (warnings about problematic files)
```

---

## Acceptance Criteria

- [ ] All files in directory are classified
- [ ] Unsupported formats have conversion suggestions
- [ ] Duplicates detected and documented
- [ ] Processing time estimate provided
- [ ] Inventory is valid YAML
- [ ] No files silently ignored
