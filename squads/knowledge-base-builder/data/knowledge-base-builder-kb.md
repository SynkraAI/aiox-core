# Knowledge Base Builder - Domain Knowledge

**Version:** 1.0.0
**Purpose:** Reference knowledge for the knowledge-base-builder squad

---

## Domain Overview

Knowledge base construction from course materials is a multi-disciplinary field combining document processing, natural language processing, information architecture, and user experience design. The goal is to transform unstructured educational content (video transcripts, PDFs, documents) into structured, navigable, and searchable knowledge systems.

---

## Key Concepts

### Document Processing
- **Text extraction** from binary formats (PDF, DOCX, PPTX) into clean, structured text
- **OCR (Optical Character Recognition)** for scanned documents without embedded text
- **Metadata preservation** maintaining source attribution (page numbers, timestamps, slide numbers)
- **Format normalization** converting diverse inputs into a uniform intermediate representation

### Content Analysis
- **Content type classification** distinguishing definitions, examples, procedures, theories
- **Structure detection** identifying organizational patterns (module-lesson-topic, linear narrative)
- **Topic segmentation** finding boundaries between different subjects within materials
- **Redundancy detection** identifying overlapping content across multiple files

### Concept Extraction
- **Named concept identification** using NLP and heuristic patterns
- **Definition extraction** from explicit ("X is defined as...") and implicit patterns
- **Relationship detection** (prerequisite, is-a, part-of, contrasts, applies-to)
- **Knowledge graph construction** using subject-predicate-object triples

### Information Architecture
- **Taxonomy design** organizing concepts into navigable hierarchies
- **Faceted classification** multiple access paths (topic, difficulty, type, use case)
- **Controlled vocabulary** consistent tagging for search and filtering
- **Progressive disclosure** presenting complex information incrementally

### Source Traceability
- **Provenance tracking** linking every knowledge item to its exact source
- **Bidirectional indexing** navigating concept-to-source and source-to-concept
- **Citation generation** in multiple formats for different consumption contexts
- **Link integrity verification** ensuring all references resolve correctly

---

## Best Practices

### Document Processing
1. Process PDFs first (usually richest source), then structured docs, then transcripts
2. Always preserve source metadata -- downstream traceability depends on it
3. Handle failures gracefully -- skip and log, never crash the pipeline
4. Detect duplicates early to avoid redundant processing

### Concept Extraction
1. Start with explicit definitions before inferring from context
2. Multiple definitions for the same concept enrich understanding
3. Confidence scoring prevents low-quality concepts from polluting the base
4. Relationships are more valuable than isolated concepts

### Taxonomy Design
1. Follow the 7 +/- 2 rule for items per hierarchy level
2. Support multiple access paths (browse, search, learning path)
3. Use learner language, not expert jargon, in category names
4. Ensure zero orphan concepts -- every concept has a home

### Source Linking
1. Every claim must be traceable to a specific source location
2. Prefer specific over general references (page+paragraph > just page)
3. Multiple sources for the same concept increase reliability
4. Test links bidirectionally -- forward and reverse must both work

---

## Common Anti-Patterns

| Anti-Pattern | Problem | Solution |
|-------------|---------|----------|
| Summarizing instead of extracting | Loses source connection | Extract discrete concepts with source refs |
| Single-axis taxonomy | Forces one mental model | Multi-axis: topic + difficulty + type |
| Ignoring transcripts | Losing video course value | Parse SRT/VTT with timestamp preservation |
| Phase 2 before Phase 1 validation | Building on bad data | Mandatory user approval between phases |
| Flat concept list | Not navigable at scale | Build hierarchy with 3-4 levels |
| Breaking source chain | Cannot verify claims | Every concept needs complete provenance |

---

## Tool Ecosystem

### PDF Processing
| Tool | Strength | Use When |
|------|----------|----------|
| PyMuPDF (fitz) | Fast, accurate text extraction | Default for all PDFs |
| pdfplumber | Excellent table extraction | PDFs with tabular data |
| PyPDF | Basic extraction, pure Python | Fallback option |
| MarkItDown | Multi-format to Markdown | Quick conversion needs |

### Document Processing
| Tool | Strength | Use When |
|------|----------|----------|
| python-docx | Native DOCX parsing | Word documents |
| mammoth | DOCX to clean HTML/Markdown | Simple text extraction |
| tools/document-processing/ | Full Office suite | PPTX, XLSX, DOCX with complex formatting |

### NLP & Extraction
| Tool | Strength | Use When |
|------|----------|----------|
| spaCy | Entity recognition, dependency parsing | Concept identification |
| LLM (Claude) | Context-aware extraction | Complex relationship detection |
| NetworkX | Graph construction and analysis | Knowledge graph building |

### Application Building
| Tool | Strength | Use When |
|------|----------|----------|
| Next.js | Full-featured web framework | Web app delivery |
| Fuse.js | Client-side fuzzy search | Search implementation |
| D3.js | Data visualization | Knowledge graph UI |
| Obsidian | Local-first knowledge management | Vault delivery |
| Dataview | Dynamic queries in Obsidian | Dashboard and reporting |

---

## Quality Dimensions

| Dimension | Weight | What It Measures |
|-----------|--------|------------------|
| Material Coverage | 0.20 | How much of the input was successfully processed |
| Concept Quality | 0.30 | Accuracy and completeness of extracted concepts |
| Taxonomy Integrity | 0.20 | Navigability and organization quality |
| Source Traceability | 0.30 | Reliability of source attribution chains |
