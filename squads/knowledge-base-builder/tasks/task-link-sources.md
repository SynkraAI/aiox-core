# Task: Link Sources

**Task ID:** knowledge-base-builder/link-sources
**Version:** 1.0.0
**Status:** Production Ready
**Created:** 2026-02-13
**Category:** Phase 1 - Linking

---

## Executive Summary

This task builds the complete source traceability system: every concept linked to exact source locations, cross-references between concepts, citations in multiple formats, and bidirectional lookup indices. This is the critical differentiator that makes the knowledge base trustworthy.

**Workflow Position:** Step 1.6 of full pipeline (after taxonomy)
**Success Definition:** 100% concepts have source chains, all links verified
**Output Quality Gate:** QG-LINKS

---

## Executor Type

**Agent (100%)**
- Agent builds chains from concept source references and document metadata
- Verifies all references resolve to actual content

---

## Inputs

```yaml
concept_registry:
  field: "Concept registry with source references"
  format: "concepts.json"
  required: true

normalized_documents_path:
  field: "Normalized document objects for reference verification"
  format: "Directory with JSON files"
  required: true

taxonomy:
  field: "Taxonomy for category-based cross-referencing"
  format: "taxonomy.json"
  required: true
```

---

## Action Items

### Step 1: Chain Construction
For each concept in the registry:
1. Read source references (document_id, block_id pairs)
2. Look up block in Normalized Document Object
3. Extract precise location: page, timestamp, slide, line
4. Build complete chain: Concept -> Definition -> Block -> Location -> File
5. Verify chain integrity: every reference resolves to actual content

### Step 2: Citation Generation
For each source reference, generate citations in 4 formats:
1. **Internal:** `textbook-ch3.pdf, p.12, par.3`
2. **Deep Link:** `/source/textbook-ch3/page/12#par-3`
3. **Wikilink:** `[[Sources/textbook-ch3|p.12]]`
4. **Markdown:** `[textbook-ch3.pdf, p.12](../raw/pdf/textbook-ch3.pdf)`

### Step 3: Cross-Reference Detection
For each concept pair:
1. **Co-occurrence:** Both mentioned in same block
2. **Sequential:** Appear in adjacent blocks
3. **Definitional:** One used to define the other
4. **Contrasting:** Explicitly compared ("X vs Y", "unlike X")
5. **Exemplifying:** One used as example of the other
6. Score cross-reference strength (0-1) based on evidence quality

### Step 4: Bidirectional Indexing
1. Build concept-to-sources map: given a concept, find all source locations
2. Build source-to-concepts map: given a page/timestamp, find all extracted concepts
3. Verify bidirectionality: every forward link has a reverse

### Step 5: Wikilink Generation (for Obsidian)
1. Generate `[[Concept Name]]` links for every concept reference
2. Generate `[[Sources/filename|location]]` links for every source reference
3. Handle aliases: if a concept has multiple names, create aliases in frontmatter

### Step 6: Deep Link Construction (for Next.js)
1. Generate URL paths for every concept: `/concepts/supervised-learning`
2. Generate URL paths for every source: `/sources/textbook-ch3?page=12`
3. Generate anchor links for specific locations: `#par-3`, `?t=863`

### Step 7: Integrity Verification
1. Check all block_id references resolve in Normalized Document Objects
2. Check all document_id references exist in inventory
3. Check bidirectional completeness
4. Report any broken chains with specific fix suggestions

---

## Output

```yaml
output:
  link_database:
    path: "{output_path}/data/link-database.json"
    format: "Complete traceability index with chains, citations, indices"

  cross_references:
    path: "{output_path}/data/cross-references.json"
    format: "Inter-concept references with evidence and strength"

  integrity_report:
    path: "{output_path}/reports/integrity-report.yaml"
    format: "Chain verification results with broken chains and fixes"
```

---

## Acceptance Criteria

- [ ] 100% concepts have at least one complete source chain
- [ ] All block_id references verified against Normalized Document Objects
- [ ] Citations generated in all 4 formats (internal, deep link, wikilink, markdown)
- [ ] Cross-references detected and scored
- [ ] Bidirectional index is complete (every forward link has reverse)
- [ ] Integrity report generated (even if no issues found)
- [ ] Broken chains documented with remediation suggestions
