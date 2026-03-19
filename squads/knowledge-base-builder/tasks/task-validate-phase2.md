# Task: Validate Phase 2

**Task ID:** knowledge-base-builder/validate-phase2
**Version:** 1.0.0
**Status:** Production Ready
**Created:** 2026-02-13
**Category:** Phase 2 - Validation

---

## Executive Summary

This task runs all Phase 2 quality checks on the generated Next.js application and Obsidian vault, calculates the combined quality score, and produces the final delivery report.

**Workflow Position:** Step 2.2 of Phase 2 (final validation)
**Success Definition:** Both stacks pass quality gates, combined score >= 7.0
**Output Quality Gate:** KB-APP + KB-OBS check suites

---

## Executor Type

**Agent (100%)**
- Agent runs automated build tests, link verification, and functional checks

---

## Inputs

```yaml
app_path:
  field: "Path to Next.js application"
  format: "Absolute file path"
  required: false  # Only if Next.js was generated

vault_path:
  field: "Path to Obsidian vault"
  format: "Absolute file path"
  required: false  # Only if Obsidian was generated

phase1_quality_report:
  field: "Phase 1 quality report"
  format: "quality-report.yaml"
  required: true
```

---

## Action Items

### Next.js Checks (if app generated)

1. **KB-APP-001: Build Succeeds** (BLOCKING)
   - Run `npm run build` in app directory
   - Must exit with code 0
   - Zero TypeScript errors

2. **KB-APP-002: No Build Warnings** (WARNING)
   - Check build output for ESLint warnings
   - Check for deprecated API usage

3. **KB-APP-003: Search Functional** (BLOCKING)
   - Load search index
   - Run 5 sample queries (terms from concept registry)
   - Verify top 3 results contain the queried concept

4. **KB-APP-004: Source Links Work** (BLOCKING)
   - Sample 10 random source citations from concepts
   - Verify each deep link URL resolves to a valid page/component
   - Check that source context is displayed

5. **KB-APP-005: Graph Renders** (BLOCKING)
   - Load graph visualization data
   - Verify node count matches concept count
   - Verify edge count matches relationship count
   - Check graph layout algorithm does not produce overlapping nodes

6. **KB-APP-006: Mobile Responsive** (WARNING)
   - Check that core pages have responsive CSS
   - Verify no horizontal scroll at 375px viewport width

7. **KB-APP-007: Progress Tracking** (WARNING)
   - Mark a concept as completed
   - Verify state persists in localStorage
   - Verify progress count updates

### Obsidian Checks (if vault generated)

1. **KB-OBS-001: Vault Opens** (BLOCKING)
   - Verify vault directory contains .obsidian/
   - Verify app.json is valid JSON
   - Verify no malformed Markdown files

2. **KB-OBS-002: Wikilinks Resolve** (BLOCKING)
   - Parse all Markdown files for `[[wikilinks]]`
   - Check each link target exists as a file in vault
   - Calculate resolution rate (>= 95% required)

3. **KB-OBS-003: Frontmatter Valid** (BLOCKING)
   - Parse YAML frontmatter from every note
   - Verify valid YAML syntax
   - Verify required fields present (id, tags, category)

4. **KB-OBS-004: Graph View Populated** (BLOCKING)
   - Count files with wikilinks
   - Verify graph would show nodes and edges
   - Check color group configuration in graph.json

5. **KB-OBS-005: Dataview Queries Work** (WARNING)
   - Parse Dashboard.md for dataview queries
   - Verify queries reference existing fields and folders
   - Check Dataview plugin is in community-plugins.json

6. **KB-OBS-006: Templates Present** (WARNING)
   - Verify Templates/ directory exists
   - Verify at least 2 template files present
   - Check templates have valid structure

### Score Calculation

```
Phase 2 Score = 0.60 * Phase1_Score + 0.20 * NextJS_Score + 0.20 * Obsidian_Score

NextJS_Score = (blocking_passed / blocking_total) * 8 + (warning_passed / warning_total) * 2
Obsidian_Score = (blocking_passed / blocking_total) * 8 + (warning_passed / warning_total) * 2

Status:
  PASS: combined >= 8.0 AND zero blocking failures
  PASS_WITH_WARNINGS: combined >= 7.0 AND zero blocking failures
  FAIL: combined < 7.0 OR any blocking failure
```

---

## Output

```yaml
output:
  final_quality_report:
    path: "{output_path}/reports/final-quality-report.yaml"
    format: "Combined Phase 1 + Phase 2 results"

  final_quality_report_md:
    path: "{output_path}/reports/final-quality-report.md"
    format: "Human-readable final report"
```

---

## Acceptance Criteria

- [ ] All applicable check suites executed
- [ ] Combined quality score calculated
- [ ] Blocking failures clearly identified
- [ ] Final human-readable report generated
- [ ] Report includes: scores, metrics, known issues, next steps
