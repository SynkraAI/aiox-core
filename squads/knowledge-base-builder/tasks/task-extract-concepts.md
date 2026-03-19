# Task: Extract Concepts

**Task ID:** knowledge-base-builder/extract-concepts
**Version:** 1.0.0
**Status:** Production Ready
**Created:** 2026-02-13
**Category:** Phase 1 - Extraction

---

## Executive Summary

This task mines the analyzed content for knowledge atoms: concepts, definitions, relationships, frameworks. It is the intellectual core of Phase 1, transforming raw text into structured, interlinked knowledge units with full source attribution.

**Workflow Position:** Step 1.4 of full pipeline (after analysis)
**Success Definition:** >= 20 concepts with definitions, relationships, and source references
**Output Quality Gate:** QG-EXTRACTION

---

## Executor Type

**Agent (100%)**
- Agent uses NLP heuristics and LLM analysis for extraction
- Processes all content types, prioritizing definitions and theories

---

## Inputs

```yaml
content_analysis_report:
  field: "Content analysis from previous task"
  format: "content-analysis-report.yaml"
  required: true

normalized_documents_path:
  field: "Path to normalized document objects"
  format: "Directory with JSON files"
  required: true
```

---

## Action Items

### Step 1: Candidate Term Identification
1. Scan all blocks classified as "definition", "explanation", "theory" first
2. Apply term identification strategies:
   - **Explicit definitions:** "X is defined as...", "X refers to...", "X means..."
   - **First-use introductions:** "X, which is a type of...", "The concept of X..."
   - **Bold/italic terms:** Terms introduced with emphasis formatting
   - **Heading terms:** Terms that appear as headings or subheadings
   - **Frequency analysis:** Terms appearing 3+ times across documents
3. Produce candidate term list with occurrence counts

### Step 2: Definition Extraction
For each candidate term:
1. Find all blocks where the term is defined or explained
2. Extract the definition text with source reference (document_id, block_id)
3. If multiple definitions exist, capture all and synthesize a "best definition"
4. Score each definition by: specificity, completeness, source quality

### Step 3: Concept Qualification
Filter candidates into actual concepts:
1. Has at least one definition or substantial explanation
2. Appears in multiple blocks (not a one-off mention)
3. Is domain-relevant (not a generic word)
4. Classify as: core (critical to domain), supporting (enhances understanding), contextual (background)

### Step 4: Relationship Detection
For each concept pair:
1. Check co-occurrence in same blocks (suggests relationship)
2. Detect explicit relationship patterns:
   - "X is a type of Y" -> is-a
   - "X is part of Y" -> part-of
   - "X requires Y" -> prerequisite
   - "X, unlike Y" -> contrasts
   - "X is used for Y" -> applies-to
   - "For example, X" -> example-of
3. Detect implicit relationships from concept context proximity
4. Score confidence for each relationship

### Step 5: Framework Identification
1. Detect named frameworks, models, processes:
   - "The X framework", "X model", "X methodology"
   - Step-by-step processes with labeled steps
   - Taxonomies or classification systems
2. Map which concepts are part of each framework
3. Document framework structure (steps, components, principles)

### Step 6: Confidence Scoring
For each extraction:
1. 0.95-1.0: Explicit definition, multiple sources confirm
2. 0.80-0.94: Implicit definition, consistent usage
3. 0.60-0.79: Inferred from context, limited sources
4. Below 0.60: Speculative, needs validation

### Step 7: Write Output
1. Generate concept-registry.json following Concept Registry schema
2. Generate relationship-graph.json (nodes + edges)
3. Generate frameworks.json for detected frameworks

---

## Output

```yaml
output:
  concept_registry:
    path: "{output_path}/data/concepts.json"
    format: "Array of concept objects with definitions, relationships, sources"

  relationship_graph:
    path: "{output_path}/data/graph.json"
    format: "Nodes (concepts) and edges (relationships) with types and weights"

  frameworks:
    path: "{output_path}/data/frameworks.json"
    format: "Array of framework objects with steps, components, concepts"
```

---

## Acceptance Criteria

- [ ] >= 20 concepts extracted (for reasonable corpus)
- [ ] >= 90% concepts have at least one definition
- [ ] 100% concepts have source references (document_id + block_id)
- [ ] >= 80% concepts have at least 2 relationships
- [ ] No exact duplicate concepts (same name, same definition)
- [ ] Confidence scores assigned to all extractions
- [ ] Frameworks detected (if present in materials)
- [ ] Output follows Concept Registry schema
