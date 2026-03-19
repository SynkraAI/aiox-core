# Task: Design Taxonomy

**Task ID:** knowledge-base-builder/design-taxonomy
**Version:** 1.0.0
**Status:** Production Ready
**Created:** 2026-02-13
**Category:** Phase 1 - Organization

---

## Executive Summary

This task takes the concept registry and organizes it into a navigable hierarchical taxonomy with tags, navigation paths, and difficulty progressions. The taxonomy determines how users will browse and discover knowledge.

**Workflow Position:** Step 1.5 of full pipeline (after extraction)
**Success Definition:** Zero orphan concepts, 3-4 level hierarchy, multiple navigation paths
**Output Quality Gate:** QG-TAXONOMY

---

## Executor Type

**Agent (90%) + Human Validation (10%)**
- Agent builds initial taxonomy from concept clusters and structure map
- Human reviews category names and hierarchy for intuitiveness

---

## Inputs

```yaml
concept_registry:
  field: "Concept registry from extraction task"
  format: "concepts.json"
  required: true

content_analysis_report:
  field: "Structure map from analysis task"
  format: "content-analysis-report.yaml"
  required: true

domain:
  field: "Domain name for context"
  format: "text"
  required: true
```

---

## Action Items

### Step 1: Initial Clustering
1. Use structure map as seed hierarchy (if materials had clear structure)
2. Group concepts by semantic similarity (shared relationships, co-occurrence)
3. Identify natural clusters of 3-15 concepts

### Step 2: Hierarchy Construction
1. Create top-level categories (Areas) -- target 4-8
2. Create second-level categories (Topics) -- target 3-7 per area
3. Create third-level if needed (Subtopics) -- only for large clusters
4. Apply rules:
   - Max 4 levels of depth
   - Min 2 items per level (no single-child nodes)
   - Max 10 items per level (avoid decision paralysis)
   - Every leaf should contain 3-15 concepts

### Step 3: Concept Assignment
1. Assign every concept to exactly one primary category
2. Allow secondary category references (but primary must exist)
3. Verify zero orphans: every concept has a home
4. Balance check: largest category <= 5x smallest category

### Step 4: Tag System Design
1. Define tag categories: topic, difficulty, content_type, source_type, status
2. Build controlled vocabulary from existing terms
3. Assign tags to every concept (minimum 2 tags per concept)
4. Ensure tag granularity is useful (not too broad, not too specific)

### Step 5: Navigation Paths
1. **Browse by Topic**: Use taxonomy hierarchy as sidebar navigation
2. **Browse by Difficulty**: Foundational -> Intermediate -> Advanced -> Expert
3. **Learning Paths**: Follow prerequisite chains for guided learning
4. **Quick Reference**: Alphabetical glossary + search
5. (Optional) **By Use Case**: If materials support practical application grouping

### Step 6: Difficulty Sequencing
1. Use prerequisite relationships to determine learning order
2. Concepts with no prerequisites = foundational
3. Concepts requiring foundational = intermediate
4. Concepts requiring intermediate = advanced
5. Validate: no circular dependencies in sequence

---

## Output

```yaml
output:
  taxonomy:
    path: "{output_path}/data/taxonomy.json"
    format: "Hierarchy tree with categories, concepts, and metadata"

  tags:
    path: "{output_path}/data/tags.json"
    format: "Tag vocabulary with concept assignments"

  navigation_paths:
    path: "{output_path}/data/navigation-paths.json"
    format: "Named paths with ordered concept sequences"
```

---

## Acceptance Criteria

- [ ] Every concept assigned to a category (zero orphans)
- [ ] Hierarchy depth: 2-5 levels
- [ ] Category balance: largest/smallest <= 5:1
- [ ] >= 2 navigation paths defined
- [ ] >= 90% concepts have 2+ tags
- [ ] No single-child categories
- [ ] Category names are user-friendly (not jargon)
- [ ] Difficulty progression is logical (no advanced before foundational)
