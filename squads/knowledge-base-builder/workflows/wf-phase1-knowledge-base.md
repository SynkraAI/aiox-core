# Workflow: Phase 1 - Knowledge Base Construction

**Workflow ID:** knowledge-base-builder/phase1-knowledge-base
**Version:** 1.0.0
**Status:** Production Ready
**Created:** 2026-02-13
**Total Lines:** 500+

---

## Executive Summary

Phase 1 is the foundation workflow. It takes raw course materials and produces a structured, source-traceable knowledge base without generating any interactive applications. This is the standalone workflow for users who only need the knowledge base, or as the mandatory first phase before Phase 2 app generation.

**Timeline:** 2-4 hours depending on material volume
**Agents Involved:** 6 (kb-chief, doc-parser, content-analyzer, concept-extractor, taxonomy-architect, knowledge-linker + quality-validator)
**Output:** Structured knowledge base in JSON + Markdown + optional Obsidian vault data

---

## When to Use Phase 1 Only

- You want the structured knowledge base without building apps
- You want to validate extraction quality before committing to app development
- You want to use the knowledge base data in your own application
- You want Obsidian-compatible Markdown files for local note-taking

---

## Input Specification

```yaml
input:
  materials_path:
    title: "Path to materials directory"
    format: "Absolute file path"
    required: true

  domain:
    title: "Subject domain"
    format: "text"
    required: true

  output_path:
    title: "Output directory for knowledge base"
    format: "Absolute file path"
    required: true

  options:
    generate_obsidian_data:
      title: "Generate Obsidian-compatible files?"
      default: true
    language:
      title: "Primary language"
      default: "auto-detect"
```

---

## Pipeline Stages

### Stage 1: Inventory & Parse

**Duration:** 30-60 minutes
**Agents:** kb-chief -> doc-parser

```
[KB Chief: Scan & Inventory]
  Materials path -> File listing -> Format classification -> Size estimation
  Output: material-inventory.yaml

[Doc Parser: Batch Processing]
  For each file in inventory:
    1. Detect format
    2. Select parser (PyMuPDF | python-docx | subtitle-parser | pptx-tools)
    3. Extract text with metadata
    4. Normalize encoding and whitespace
    5. Validate extraction quality
    6. Produce Normalized Document Object
  Output: normalized-documents/ (one JSON per file) + processing-log.yaml
```

**Gate: PARSE-COMPLETE**
```yaml
criteria:
  files_attempted: "== material_inventory.count"
  success_rate: ">= 0.95"
  metadata_coverage: "== 1.0"
  failures_documented: true
action_on_fail:
  if_success_below_80: "HALT - Too many failures"
  if_success_80_to_95: "WARN - Continue with documented gaps"
  if_success_above_95: "PASS"
```

---

### Stage 2: Analyze & Classify

**Duration:** 15-30 minutes
**Agent:** content-analyzer

```
[Content Analyzer: Full Corpus Analysis]
  1. Classify every text block by content type
     (definition | explanation | example | procedure | theory | exercise | etc.)
  2. Detect organizational structure of materials
     (module-lesson-topic | linear-narrative | flat-collection | slide-based)
  3. Segment into topics across documents
  4. Detect redundancy between documents
  5. Calculate information density per section
  Output: content-analysis-report.yaml
```

**Gate: ANALYSIS-COMPLETE**
```yaml
criteria:
  blocks_classified: ">= 0.90"
  structure_detected: true
  topics_segmented: true
action_on_fail:
  if_no_structure: "Fall back to flat-collection mode"
  if_classification_low: "Re-run with relaxed thresholds"
```

---

### Stage 3: Extract & Model

**Duration:** 20-40 minutes
**Agent:** concept-extractor

```
[Concept Extractor: Knowledge Mining]
  1. Identify candidate concepts (NLP + heuristics)
     - Explicit definitions ("X is defined as...")
     - First-use introductions ("The concept of X...")
     - High-frequency technical terms
     - Heading-level terms
  2. Extract definitions (best definition per concept)
  3. Detect relationships between concepts
     - prerequisite, is-a, part-of, related-to, contrasts, etc.
  4. Identify frameworks and models
  5. Score confidence for each extraction
  Output: concept-registry.json + relationship-graph.json + frameworks.json
```

**Gate: EXTRACTION-COMPLETE**
```yaml
criteria:
  concepts_count: ">= 20"
  definitions_coverage: ">= 0.90"
  relationships_coverage: ">= 0.80"
  source_attribution: "== 1.0"
  confidence_above_06: ">= 0.90"
action_on_fail:
  if_zero_concepts: "HALT - Extraction completely failed"
  if_low_definitions: "Re-run with broader definition patterns"
  if_low_relationships: "WARN - Continue, note sparse graph"
```

---

### Stage 4: Organize & Link

**Duration:** 30-50 minutes
**Agents:** taxonomy-architect -> knowledge-linker

```
[Taxonomy Architect: Hierarchy Design]
  1. Cluster concepts by semantic similarity
  2. Build category hierarchy (max 4 levels)
  3. Apply 7+/-2 rule per level
  4. Assign tags from controlled vocabulary
  5. Design navigation paths (browsing, search, difficulty)
  6. Create difficulty progression (foundational -> expert)
  Output: taxonomy.json + tags.json + navigation-paths.json

[Knowledge Linker: Source Traceability]
  1. Build traceability chain for every concept
     Concept -> Block -> Source Location -> File
  2. Generate citations in multiple formats
     (internal reference, deep link, wikilink, markdown)
  3. Detect cross-references between concepts
  4. Build bidirectional index
  5. Verify link integrity
  Output: link-database.json + cross-references.json + integrity-report.yaml
```

**Gate: ORGANIZE-COMPLETE**
```yaml
criteria:
  orphan_concepts: "== 0"
  hierarchy_depth: "2-5"
  traceability_coverage: ">= 0.98"
  link_integrity: "== 1.0"
  navigation_paths: ">= 2"
action_on_fail:
  if_orphans: "Run taxonomy assignment again with broader categories"
  if_broken_links: "Re-run linker for specific broken chains"
```

---

### Stage 5: Validate & Output

**Duration:** 10-15 minutes
**Agents:** quality-validator -> kb-chief

```
[Quality Validator: Phase 1 Validation]
  Run all Phase 1 check suites:
  - KB-COV-001 to KB-COV-004 (Material Coverage)
  - KB-CPT-001 to KB-CPT-006 (Concept Quality)
  - KB-TAX-001 to KB-TAX-006 (Taxonomy Integrity)
  - KB-TRC-001 to KB-TRC-005 (Traceability)
  Calculate weighted score
  Generate quality report + remediation plan
  Output: quality-report.yaml + coverage-report.yaml

[KB Chief: Output Generation]
  1. Organize output directory:
     /knowledge-base/
       data/concepts.json
       data/taxonomy.json
       data/graph.json
       data/sources.json
       data/search-index.json
       markdown/concepts/*.md
       markdown/topics/*.md
       markdown/glossary.md
       markdown/index.md
       raw/ (preserved originals or links)
       reports/quality-report.md
       reports/coverage-report.md
       reports/processing-log.md

  2. If obsidian_data enabled:
     /knowledge-base/
       obsidian-vault/
         Concepts/*.md (with wikilinks + frontmatter)
         Topics/*.md
         Sources/*.md
         Glossary.md
         Index.md
         .obsidian/ (basic config)

  3. Generate summary for user
  Output: Complete knowledge base directory
```

**Gate: PHASE1-COMPLETE (User Validation Required)**
```yaml
criteria:
  quality_score: ">= 7.0"
  blocking_failures: "== 0"
  output_directory_complete: true
user_validation:
  required: true
  present_to_user:
    - quality_score
    - material_coverage_percentage
    - total_concepts_extracted
    - taxonomy_depth
    - traceability_coverage
    - known_issues_from_remediation_plan
  user_must_confirm: "Phase 1 approved"
```

---

## Output Structure

```
{output_path}/
  data/
    concepts.json               # Complete concept registry
    taxonomy.json               # Category hierarchy + tags
    graph.json                  # Relationship graph (nodes + edges)
    sources.json                # Source file inventory + metadata
    search-index.json           # Pre-built search index
    cross-references.json       # Inter-concept references
    link-database.json          # Full traceability data
  markdown/
    concepts/
      supervised-learning.md    # One file per concept
      unsupervised-learning.md
      ...
    topics/
      foundations.md            # Topic overview with concept links
      advanced-techniques.md
      ...
    glossary.md                 # A-Z glossary
    index.md                    # Master index with navigation
  obsidian-vault/               # If enabled
    Concepts/
      Supervised Learning.md    # Wikilinked concept notes
      ...
    Topics/
      Foundations.md
      ...
    Sources/
      textbook-ch3.md           # Source notes with extracted concepts
      ...
    Templates/
      concept-template.md
    Glossary.md
    Index.md
    Dashboard.md                # Dataview dashboard
    .obsidian/
      app.json
      graph.json
  raw/                          # Original files or symlinks
  reports/
    quality-report.md           # Full validation results
    coverage-report.md          # Material processing coverage
    processing-log.md           # Detailed processing log
```

---

## Error Recovery

| Stage | Failure | Recovery |
|-------|---------|----------|
| 1 | > 20% parse failures | Present failures, ask for alternative formats |
| 2 | No structure detected | Use flat-collection mode with tag-based navigation |
| 3 | Zero concepts | Check parser output quality, retry with broader patterns |
| 4 | High orphan count | Create catch-all category, flag for manual review |
| 4 | Broken links | Re-run Knowledge Linker for specific chains |
| 5 | Score < 7.0 | Execute remediation plan, re-validate |
| 5 | User rejects Phase 1 | Iterate on specific user feedback |

---

## Metrics

| Metric | When | Target |
|--------|------|--------|
| Parse success rate | Stage 1 | >= 95% |
| Block classification rate | Stage 2 | >= 90% |
| Concept count | Stage 3 | >= 20 |
| Definition coverage | Stage 3 | >= 90% |
| Orphan concepts | Stage 4 | 0 |
| Traceability coverage | Stage 4 | >= 98% |
| Overall quality score | Stage 5 | >= 7.0 |
