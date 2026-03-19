# Knowledge Base Quality Validation Checklist

**Version:** 1.0.0
**Purpose:** Comprehensive validation of knowledge base quality across all dimensions
**Total Checks:** 34 (21 Phase 1 + 13 Phase 2)

---

## Phase 1: Knowledge Base Checks

### Material Coverage (KB-COV-*)

- [ ] **KB-COV-001** [BLOCKING] All input files attempted
  - Verify: processing log file count == inventory file count
  - Pass: 100%

- [ ] **KB-COV-002** [BLOCKING] Parse success rate >= 95%
  - Verify: successful parses / total attempted
  - Pass: >= 0.95

- [ ] **KB-COV-003** [WARNING] Text extraction completeness
  - Verify: spot-check 5 random files for extraction quality
  - Pass: >= 98% text captured

- [ ] **KB-COV-004** [BLOCKING] Failed files documented
  - Verify: every failure in processing log has error reason + suggestion
  - Pass: 100% documented

### Concept Quality (KB-CPT-*)

- [ ] **KB-CPT-001** [BLOCKING] Minimum concept count >= 20
  - Verify: count concepts in concepts.json
  - Pass: >= 20

- [ ] **KB-CPT-002** [BLOCKING] Definition coverage >= 90%
  - Verify: concepts with definitions / total concepts
  - Pass: >= 0.90

- [ ] **KB-CPT-003** [BLOCKING] Source attribution 100%
  - Verify: concepts with source references / total concepts
  - Pass: == 1.0

- [ ] **KB-CPT-004** [WARNING] Relationship coverage >= 80%
  - Verify: concepts with 2+ relationships / total concepts
  - Pass: >= 0.80

- [ ] **KB-CPT-005** [WARNING] Confidence distribution healthy
  - Verify: concepts below 0.6 confidence / total concepts
  - Pass: <= 0.10

- [ ] **KB-CPT-006** [BLOCKING] No duplicate concepts
  - Verify: scan for exact name + definition matches
  - Pass: 0 duplicates

### Taxonomy Integrity (KB-TAX-*)

- [ ] **KB-TAX-001** [BLOCKING] Zero orphan concepts
  - Verify: concepts not in any category
  - Pass: 0 orphans

- [ ] **KB-TAX-002** [WARNING] Hierarchy depth 2-5 levels
  - Verify: max depth of category tree
  - Pass: 2 <= depth <= 5

- [ ] **KB-TAX-003** [WARNING] Category balance <= 5:1
  - Verify: largest category / smallest category
  - Pass: ratio <= 5.0

- [ ] **KB-TAX-004** [WARNING] MECE categories
  - Verify: no concept in 2+ overlapping same-level categories
  - Pass: 0 violations

- [ ] **KB-TAX-005** [BLOCKING] Navigation paths >= 2
  - Verify: count distinct navigation paths in navigation-paths.json
  - Pass: >= 2

- [ ] **KB-TAX-006** [WARNING] Tag coverage >= 90%
  - Verify: concepts with 2+ tags / total concepts
  - Pass: >= 0.90

### Traceability (KB-TRC-*)

- [ ] **KB-TRC-001** [BLOCKING] Full chain coverage >= 98%
  - Verify: concepts with complete traceability chain / total
  - Pass: >= 0.98

- [ ] **KB-TRC-002** [BLOCKING] Link integrity 100%
  - Verify: all block_id references resolve to actual blocks
  - Pass: 0 broken links

- [ ] **KB-TRC-003** [BLOCKING] Bidirectional links complete
  - Verify: every forward link has a reverse in bidirectional index
  - Pass: 100%

- [ ] **KB-TRC-004** [WARNING] Citation completeness >= 95%
  - Verify: citations with full details (file + location) / total
  - Pass: >= 0.95

- [ ] **KB-TRC-005** [WARNING] Cross-reference evidence
  - Verify: all cross-references have text block evidence
  - Pass: >= 0.90

---

## Phase 2: Application Checks

### Next.js App (KB-APP-*)

- [ ] **KB-APP-001** [BLOCKING] Build succeeds
  - Verify: `npm run build` exits 0
  - Pass: exit code 0

- [ ] **KB-APP-002** [WARNING] No build warnings
  - Verify: zero TypeScript/ESLint errors in build output
  - Pass: 0 errors

- [ ] **KB-APP-003** [BLOCKING] Search functional
  - Verify: 5 sample queries return relevant results in top 3
  - Pass: 5/5 relevant

- [ ] **KB-APP-004** [BLOCKING] Source links work
  - Verify: 10 random source citations resolve to valid pages
  - Pass: 10/10 resolve

- [ ] **KB-APP-005** [BLOCKING] Graph renders
  - Verify: graph loads with correct node/edge count
  - Pass: counts match data

- [ ] **KB-APP-006** [WARNING] Mobile responsive
  - Verify: core pages at 375px width, no horizontal scroll
  - Pass: no scroll

- [ ] **KB-APP-007** [WARNING] Progress tracking
  - Verify: mark/unmark concept persists in localStorage
  - Pass: persists

### Obsidian Vault (KB-OBS-*)

- [ ] **KB-OBS-001** [BLOCKING] Vault opens
  - Verify: .obsidian/ directory exists, app.json valid
  - Pass: opens clean

- [ ] **KB-OBS-002** [BLOCKING] Wikilinks resolve >= 95%
  - Verify: wikilinks pointing to existing files / total wikilinks
  - Pass: >= 0.95

- [ ] **KB-OBS-003** [BLOCKING] Frontmatter valid
  - Verify: all notes have parseable YAML frontmatter
  - Pass: 100% valid

- [ ] **KB-OBS-004** [BLOCKING] Graph view populated
  - Verify: notes with wikilinks exist, graph would render
  - Pass: nodes + edges > 0

- [ ] **KB-OBS-005** [WARNING] Dataview queries work
  - Verify: Dashboard.md queries reference valid fields/folders
  - Pass: queries syntactically correct

- [ ] **KB-OBS-006** [WARNING] Templates present
  - Verify: Templates/ has >= 2 template files
  - Pass: >= 2 templates

---

## Scoring

### Phase 1 Score
```
Coverage Score (0.20) + Concept Score (0.30) + Taxonomy Score (0.20) + Traceability Score (0.30)
```

### Combined Score (Phase 1 + Phase 2)
```
Phase 1 Score (0.60) + NextJS Score (0.20) + Obsidian Score (0.20)
```

### Status Thresholds
| Score | Blocking Failures | Status |
|-------|-------------------|--------|
| >= 8.0 | 0 | PASS |
| >= 7.0 | 0 | PASS_WITH_WARNINGS |
| < 7.0 | any | FAIL |
| any | > 0 | FAIL |
