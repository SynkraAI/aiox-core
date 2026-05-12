# Product Module

**Module:** `product/`
**Purpose:** PM/PO assets for document generation and validation
**Dependencies:** None (static assets only)

## Contents

### Templates (`templates/`)

Document templates for generating PRDs, stories, epics, and other project artifacts.

- **52+ templates** including:
  - `story-tmpl.yaml` - Story template v2.0
  - `prd-tmpl.yaml` - Product Requirements Document
  - `architecture-tmpl.yaml` - Architecture document
  - `epic-tmpl.md` - Epic template
  - `ide-rules/` - 9 IDE-specific rule files

### Checklists (`checklists/`)

Validation checklists for quality gates.

- `architect-checklist.md` - Architecture review
- `change-checklist.md` - Change management
- `pm-checklist.md` - PM validation
- `po-master-checklist.md` - PO master validation
- `story-dod-checklist.md` - Story Definition of Done
- `story-draft-checklist.md` - Story draft validation

### Data (`data/`)

PM-specific reference data and knowledge bases.

- `brainstorming-techniques.md` - Brainstorming methods
- `elicitation-methods.md` - Requirements elicitation
- `mode-selection-best-practices.md` - Development mode guidance
- `technical-preferences.md` - Technical stack preferences
- `test-levels-framework.md` - Testing levels
- `test-priorities-matrix.md` - Test prioritization

## Usage

Templates and checklists are loaded as static files by agents:

```javascript
const templatePath = '.aiox-core/product/templates/story-tmpl.yaml';
const checklistPath = '.aiox-core/product/checklists/story-dod-checklist.md';
```

## Migration

Created as part of [Story 2.4](../../../docs/stories/v4.0.4/sprint-2/story-2.4-product-module.md) in Sprint 2.

---
*Synkra AIOX v4 - Product Module*
