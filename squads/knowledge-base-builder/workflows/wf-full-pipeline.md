# Workflow: Full Knowledge Base Pipeline

**Workflow ID:** knowledge-base-builder/full-pipeline
**Version:** 1.0.0
**Status:** Production Ready
**Created:** 2026-02-13
**Total Lines:** 600+

---

## Executive Summary

This is the master workflow that orchestrates the complete knowledge base construction from raw materials to deployable interactive applications. It spans two major phases: Phase 1 builds the structured knowledge base with full source traceability, and Phase 2 generates dual-stack interactive applications (Next.js + Obsidian). A mandatory user validation gate separates the two phases.

**Timeline:** 4-8 hours from material ingestion to final delivery
**Complexity:** High (requires full squad coordination, 8 agents)
**Success Rate Target:** >= 95% material coverage, 100% source traceability

---

## Purpose & Value Proposition

### Challenge Being Solved

Course creators, educators, and organizations have massive libraries of content (video transcripts, PDFs, slides, documents) that contain valuable knowledge locked in unstructured formats. This knowledge is:
- Scattered across dozens or hundreds of files
- Not searchable in a unified way
- Missing cross-references between related concepts
- Not navigable by topic, difficulty, or learning path
- Not traceable back to original sources

### What This Workflow Delivers

- Complete, structured knowledge base with every concept extracted and linked
- Full source traceability (every concept points to exact page/timestamp)
- Navigable taxonomy with multiple browsing paths
- Interactive web application (Next.js) with search, graph, progress tracking
- Local knowledge vault (Obsidian) with wikilinks and graph view
- Quality report with objective metrics

---

## Input Specification

```yaml
input:
  materials_path:
    title: "Path to materials directory"
    format: "Absolute file path"
    required: true
    example: "/Users/creator/courses/advanced-ml/"
    validation: "Directory must exist and contain supported file types"

  domain:
    title: "What domain/subject is this knowledge about?"
    format: "text"
    required: true
    example: "Machine Learning Fundamentals"

  target_audience:
    title: "Who will use this knowledge base?"
    format: "text"
    required: true
    example: "Junior ML engineers starting their first ML project"

  output_path:
    title: "Where should the knowledge base be generated?"
    format: "Absolute file path"
    required: true
    example: "/Users/creator/knowledge-base/ml-fundamentals/"

  options:
    phase_2_enabled:
      title: "Generate interactive apps (Phase 2)?"
      default: true
      type: boolean

    nextjs_enabled:
      title: "Generate Next.js web app?"
      default: true
      type: boolean

    obsidian_enabled:
      title: "Generate Obsidian vault?"
      default: true
      type: boolean

    language:
      title: "Primary language of materials"
      default: "auto-detect"
      options: ["en", "pt-br", "es", "auto-detect"]
```

---

## Phase 1: Knowledge Base Construction

### Step 1.1: Material Inventory (KB Chief)

**Agent:** kb-chief
**Duration:** 5-10 minutes
**Task:** task-inventory-materials.md

```
INPUT: materials_path
  |
  v
[Scan Directory] -- Recursively find all supported files
  |
  v
[Classify Files] -- Categorize by format (PDF, DOCX, TXT, SRT, VTT, PPTX)
  |
  v
[Estimate Scope] -- Calculate total files, total size, estimated processing time
  |
  v
[Present Inventory] -- Show user what was found, confirm scope
  |
  v
OUTPUT: Material Inventory (file list with formats, sizes, estimated processing)
```

**Quality Gate: QG-INVENTORY**
- All files classified by format
- Unsupported formats flagged
- User confirms inventory is complete

---

### Step 1.2: Document Parsing (Doc Parser)

**Agent:** doc-parser
**Duration:** 30-60 minutes (depends on volume)
**Task:** task-parse-documents.md

```
INPUT: Material Inventory
  |
  v
[Batch Processing] -- Process files in priority order (PDF > DOCX > PPTX > Transcripts > TXT)
  |
  v
[Per-File Processing]:
  For each file:
    [Format Detection] -> [Parser Selection] -> [Text Extraction]
    -> [Metadata Tagging] -> [Quality Check] -> [Normalization]
  |
  v
[Processing Report] -- Success/failure per file, overall statistics
  |
  v
OUTPUT: Normalized Document Objects + Processing Report
```

**Quality Gate: QG-PARSE**
- >= 95% files parsed successfully
- All parsed files have metadata (page/timestamp/slide)
- Failed files documented with reasons
- BLOCKING: If < 80% success, pipeline halts

---

### Step 1.3: Content Analysis (Content Analyzer)

**Agent:** content-analyzer
**Duration:** 15-30 minutes
**Task:** task-analyze-content.md

```
INPUT: Normalized Document Objects
  |
  v
[Block Classification] -- Classify every block (definition, example, procedure, etc.)
  |
  v
[Structure Detection] -- Identify organizational pattern of materials
  |
  v
[Topic Segmentation] -- Find topic boundaries across all files
  |
  v
[Redundancy Detection] -- Flag duplicate/overlapping content
  |
  v
[Density Analysis] -- Calculate information density per section
  |
  v
OUTPUT: Content Analysis Report (structure map, topic segments, classifications)
```

**Quality Gate: QG-ANALYSIS**
- All blocks classified
- Structure pattern detected
- Topic segments identified
- WARNING: If > 30% blocks unclassifiable, check parser output

---

### Step 1.4: Concept Extraction (Concept Extractor)

**Agent:** concept-extractor
**Duration:** 20-40 minutes
**Task:** task-extract-concepts.md

```
INPUT: Content Analysis Report + Normalized Document Objects
  |
  v
[Term Identification] -- Find candidate concepts using NLP + heuristics
  |
  v
[Definition Extraction] -- Find definitions for each concept
  |
  v
[Relationship Detection] -- Identify connections between concepts
  |
  v
[Framework Identification] -- Detect formal frameworks and models
  |
  v
[Confidence Scoring] -- Rate each extraction
  |
  v
OUTPUT: Concept Registry + Relationship Graph
```

**Quality Gate: QG-EXTRACTION**
- >= 20 concepts extracted (for reasonable corpus)
- >= 90% concepts have definitions
- >= 80% concepts have 2+ relationships
- 100% concepts have source references
- BLOCKING: If 0 concepts, extraction failed completely

---

### Step 1.5: Taxonomy Design (Taxonomy Architect)

**Agent:** taxonomy-architect
**Duration:** 15-25 minutes
**Task:** task-design-taxonomy.md

```
INPUT: Concept Registry + Content Analysis Report
  |
  v
[Topic Clustering] -- Group concepts by semantic similarity
  |
  v
[Hierarchy Construction] -- Build parent-child category tree
  |
  v
[Tag Assignment] -- Assign controlled vocabulary tags
  |
  v
[Navigation Path Design] -- Create browsing paths
  |
  v
[Difficulty Sequencing] -- Order by prerequisite chains
  |
  v
OUTPUT: Complete Taxonomy (hierarchy, tags, paths, difficulty levels)
```

**Quality Gate: QG-TAXONOMY**
- Zero orphan concepts
- Hierarchy depth 2-5 levels
- >= 2 navigation paths
- All concepts have category + tags
- WARNING: Category imbalance > 5:1 ratio

---

### Step 1.6: Source Linking (Knowledge Linker)

**Agent:** knowledge-linker
**Duration:** 15-25 minutes
**Task:** task-link-sources.md

```
INPUT: Concept Registry + Source Metadata + Taxonomy
  |
  v
[Chain Construction] -- Build traceability chain per concept
  |
  v
[Citation Generation] -- Create formatted citations
  |
  v
[Cross-Reference Detection] -- Find inter-concept references
  |
  v
[Bidirectional Indexing] -- Build both-way lookup maps
  |
  v
[Wikilink + Deep Link Generation] -- Create app-ready links
  |
  v
[Integrity Verification] -- Validate all chains
  |
  v
OUTPUT: Link Database (traceability index, cross-refs, citations)
```

**Quality Gate: QG-LINKS**
- 100% concepts have source chains (BLOCKING)
- All links verified (no broken references)
- Bidirectional links complete
- Citations include file + location

---

### Step 1.7: Phase 1 Quality Validation (Quality Validator)

**Agent:** quality-validator
**Duration:** 10-15 minutes
**Task:** task-validate-phase1.md

```
INPUT: All Phase 1 outputs
  |
  v
[Run Check Suites KB-COV, KB-CPT, KB-TAX, KB-TRC]
  |
  v
[Score Aggregation]
  |
  v
[Report Generation]
  |
  v
OUTPUT: Quality Report + Coverage Report + Remediation Plan
```

**Phase 1 Gate: MANDATORY USER VALIDATION**
- Quality score >= 7.0
- Zero blocking check failures
- User reviews quality report
- User explicitly approves: "Phase 1 approved"
- HARD BLOCK: Phase 2 cannot start without this approval

---

## Phase 2: Interactive App Generation

### Step 2.1: App Generation (App Architect)

**Agent:** app-architect
**Duration:** 60-120 minutes
**Task:** task-generate-nextjs-app.md + task-generate-obsidian-vault.md

```
INPUT: Complete Phase 1 Knowledge Base + User preferences
  |
  v
[Generate Shared Data Layer] -- JSON files used by both stacks
  |
  v
[PARALLEL]:
  [Generate Next.js App] -- Full application with all features
  [Generate Obsidian Vault] -- Complete vault with wikilinks + graph
  |
  v
[Build Verification] -- Ensure both stacks compile/open
  |
  v
OUTPUT: Next.js App + Obsidian Vault + Deployment Instructions
```

---

### Step 2.1.5: Design Enhancement (Design Chief)

**Agent:** design-chief
**Duration:** 30-45 minutes
**Task:** Design review and UI/UX enhancement

```
INPUT: Generated Next.js App
  |
  v
[Design Review] -- Analyze current UI/UX, identify improvement areas
  |
  v
[Design System Creation] -- Define tokens (colors, spacing, shadows, transitions)
  |
  v
[Component Architecture] -- Componentize and organize code structure
  |
  v
[Micro-interactions] -- Add hover effects, animations, feedback
  |
  v
[Accessibility Enhancement] -- Add ARIA labels, focus states, keyboard nav
  |
  v
[Build Verification] -- Ensure app still compiles after changes
  |
  v
OUTPUT: Enhanced Next.js App with professional design + Design tokens + Component library
```

**Quality Gate: QG-DESIGN**
- Design tokens defined (colors, spacing, shadows)
- Components organized and modular
- Micro-interactions added (hover, focus, transitions)
- Accessibility improved (ARIA, keyboard nav)
- App builds successfully post-enhancement
- WARNING: If design changes break functionality, rollback and fix

**Design Enhancement Deliverables:**
- Professional design system (globals.css + tailwind.config)
- Componentized architecture (components/ directory)
- Micro-interactions (stagger animations, hover effects)
- Accessibility compliance (ARIA labels, focus states)
- Design documentation (what was changed and why)

---

### Step 2.2: Phase 2 Quality Validation (Quality Validator)

**Agent:** quality-validator
**Duration:** 10-15 minutes
**Task:** task-validate-phase2.md

```
INPUT: Phase 1 Quality Report + App + Vault
  |
  v
[Run Check Suites KB-APP, KB-OBS]
  |
  v
[Combined Score Calculation]
  |
  v
OUTPUT: Final Quality Report
```

**Phase 2 Gate:**
- Both stacks build/open successfully
- Search functional in Next.js
- Wikilinks resolve in Obsidian
- Source links work in both stacks

---

## Step 3: Final Delivery (KB Chief)

**Agent:** kb-chief
**Duration:** 5 minutes

```
[Generate Final Report] -- Summary of everything created
  |
  v
[Package Deliverables] -- Organize output directory
  |
  v
[Present to User]:
  - Knowledge base path
  - Quality score
  - Material coverage
  - Concept count
  - Next.js run instructions
  - Obsidian open instructions
  - Known limitations
  - Improvement suggestions
```

---

## Error Recovery

### Pipeline-Level Recovery

| Failure Point | Recovery Strategy |
|---------------|-------------------|
| Parse failure > 20% | Halt, present failures, ask user for alternative formats |
| Zero concepts | Re-check parser output, lower extraction threshold |
| Taxonomy fails | Fall back to flat listing with tags only |
| Phase 1 score < 7.0 | Run remediation plan, re-validate |
| App build failure | Check dependencies, rebuild, report if persistent |
| Design enhancement breaks app | Rollback changes, apply conservative design updates |
| Obsidian link errors | Re-run Knowledge Linker, regenerate vault |

### Maximum Retry Policy
- Per-agent: 2 retries before escalation
- Per-phase: 1 re-run of entire phase before user notification
- Pipeline-level: Report all issues, let user decide to proceed or abort

---

## Metrics Tracked

| Metric | When Measured | Reported In |
|--------|-------------|-------------|
| Files processed / Total | After Step 1.2 | Processing Report |
| Concepts extracted | After Step 1.4 | Concept Registry |
| Traceability coverage | After Step 1.6 | Link Database |
| Quality score | After Step 1.7 and 2.2 | Quality Report |
| Build success | After Step 2.1 | Build Log |
| Design enhancement | After Step 2.1.5 | Design Report |
| Total processing time | End of pipeline | Final Report |
