# Task: Analyze Content

**Task ID:** knowledge-base-builder/analyze-content
**Version:** 1.0.0
**Status:** Production Ready
**Created:** 2026-02-13
**Category:** Phase 1 - Analysis

---

## Executive Summary

This task takes all Normalized Document Objects and produces a comprehensive content analysis: block classifications, structural pattern detection, topic segmentation, redundancy mapping, and density scoring. This analysis drives all downstream extraction decisions.

**Workflow Position:** Step 1.3 of full pipeline (after parsing)
**Success Definition:** All blocks classified, structure detected, topics segmented
**Output Quality Gate:** QG-ANALYSIS

---

## Executor Type

**Agent (100%)**
- Agent analyzes entire corpus simultaneously for cross-document patterns

---

## Inputs

```yaml
normalized_documents_path:
  field: "Path to normalized document objects"
  format: "Directory with JSON files"
  required: true
```

---

## Action Items

### Step 1: Load All Documents
1. Read all Normalized Document Objects from directory
2. Build unified block index (all blocks across all documents)
3. Calculate corpus statistics (total blocks, words, documents)

### Step 2: Block Classification
For each block, classify by content type:
1. **definition** -- Contains "is defined as", "refers to", "means", introduces a term
2. **explanation** -- Elaborates on a concept, "how X works", "why X matters"
3. **example** -- Concrete instance, "for example", "such as", case study
4. **procedure** -- Step-by-step instructions, numbered steps, "how to"
5. **theory** -- Abstract framework, model, principle
6. **exercise** -- Practice question, "try this", activity
7. **assessment** -- Quiz, test, evaluation question
8. **summary** -- Recap, "in summary", "key takeaways"
9. **introduction** -- Opening, context setting, "in this module"
10. **transition** -- Segue, "moving on", "next we will"
11. **anecdote** -- Story, personal example, narrative
12. **reference** -- Citation, bibliography, further reading
13. **metadata** -- Table of contents, index, headers

Classification uses: keyword patterns, position in document, heading context, block length.

### Step 3: Structure Detection
1. Examine heading hierarchy across all documents
2. Detect organizational pattern:
   - **module-lesson-topic**: Hierarchical with clear module/lesson labels
   - **linear-narrative**: Sequential chapters/sections (book-like)
   - **flat-collection**: Independent files without unified structure
   - **slide-based**: Presentation-driven content
3. Build structure map showing the hierarchy

### Step 4: Topic Segmentation
1. Identify topic boundaries using multi-signal approach:
   - Structural markers (heading changes, file boundaries) -- weight 0.4
   - Semantic coherence (shared key terms between blocks) -- weight 0.3
   - Temporal continuity (timestamp gaps in transcripts) -- weight 0.2
   - Pedagogical cues ("in this section", "to summarize") -- weight 0.1
2. Group related blocks into topic segments
3. Assign estimated topic labels based on key terms

### Step 5: Redundancy Detection
1. Compare text blocks across documents for similarity
2. Flag blocks with >= 80% text overlap as potential duplicates
3. Flag topic-level overlap (same topic covered in multiple files)
4. Recommend merge strategy: merge | keep_both | keep_richest

### Step 6: Density Analysis
1. For each topic segment, calculate information density:
   - High density: many definitions, theories, procedures (>= 0.7)
   - Medium density: mix of content types (0.3-0.7)
   - Low density: mostly transitions, introductions, anecdotes (< 0.3)
2. Rank segments by density for extraction prioritization

---

## Output

```yaml
output:
  content_analysis_report:
    path: "{output_path}/reports/content-analysis-report.yaml"
    sections:
      - corpus_summary
      - content_type_distribution
      - structure_map
      - topic_segments
      - redundancy_report
      - density_analysis
```

---

## Acceptance Criteria

- [ ] All blocks classified by content type (>= 90% classified)
- [ ] Organizational structure pattern detected
- [ ] Topic segments identified with labels
- [ ] Redundancy report generated (even if no duplicates found)
- [ ] Density scores calculated for all segments
- [ ] Output is valid YAML following Content Analysis Report schema
