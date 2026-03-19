# Sync Storybook with Workspace

**Task ID:** `sb-sync-workspace`
**Pattern:** HO-TP-001 (Task Anatomy Standard)
**Version:** 1.0.0
**Last Updated:** 2026-02-25

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_name** | Sync Storybook with Workspace |
| **status** | `pending` |
| **responsible_executor** | @storybook-expert |
| **execution_type** | `Agent` |
| **input** | Story files, workspace metadata, component files |
| **output** | Synchronized inventory, drift report |
| **action_items** | 6 steps |
| **acceptance_criteria** | 5 criteria |

## Overview

Bidirectional sync between Storybook (source of truth for visualization, states, and testing)
and Workspace (source of truth for governance, metadata, and cross-squad integration).

**Hybrid Source-of-Truth Model:**

```
┌─────────────────────────────────────────────────────────────┐
│                    SOURCE OF TRUTH MAP                       │
├──────────────────────┬──────────────────────────────────────┤
│     STORYBOOK        │         WORKSPACE                    │
│   (visualization)    │       (governance)                   │
├──────────────────────┼──────────────────────────────────────┤
│ Component states     │ Component metadata (owner, squad)    │
│ Variant rendering    │ Token definitions (DTCG source)      │
│ Interaction tests    │ Cross-squad contracts                │
│ A11y compliance      │ Deprecation policies                 │
│ Visual regression    │ Versioning & changelog               │
│ Atomic hierarchy     │ Domain assignments                   │
│ (story titles)       │ Design decisions (ADRs)              │
│ Props/API docs       │ Governance rules                     │
│ (autodocs)           │                                      │
└──────────────────────┴──────────────────────────────────────┘

        ↕  sb-sync-workspace  ↕
        (bidirectional sync)
```

**Sync direction:**
- Storybook → Workspace: component inventory, atomic hierarchy, variant list, coverage status
- Workspace → Storybook: metadata enrichment (owner, domain, deprecation status)

## Input

- **stories_dir** (string)
  - Description: Directory containing story files
  - Required: Yes
  - Default: `src/components/ui/`
- **workspace_metadata_path** (string)
  - Description: Path to workspace component metadata
  - Required: Yes
  - Default: `workspace/domains/design-system/metadata/components.json`
- **sync_direction** (enum)
  - Description: Which direction to sync
  - Required: No
  - Default: `bidirectional`
  - Options: `storybook-to-workspace`, `workspace-to-storybook`, `bidirectional`, `drift-report-only`

## Output

- **synced_metadata** (JSON)
  - Description: Updated component metadata reflecting both sources
  - Destination: `workspace/domains/design-system/metadata/components.json`
- **drift_report** (Markdown)
  - Description: Report of discrepancies between Storybook and Workspace
  - Destination: `outputs/design-system/{project}/sync/drift-report.md`

## Action Items

### Step 1: Extract Storybook Inventory

Scan all `.stories.tsx` files and extract:

```json
{
  "storybook_inventory": {
    "Button": {
      "story_file": "src/components/ui/button.stories.tsx",
      "title": "Base Components/Button",
      "atomic_level": "atom",
      "variants": ["Default", "Destructive", "Outline", "Secondary", "Ghost", "Link"],
      "has_gallery": true,
      "has_play_function": true,
      "has_a11y": true,
      "tags": ["autodocs"],
      "story_count": 12
    }
  }
}
```

For each story file:
- [ ] Parse `title` field to determine atomic hierarchy
- [ ] Count named exports (story count)
- [ ] Check for `play` functions (interaction coverage)
- [ ] Check for gallery stories (AllVariants, AllSizes)
- [ ] Extract `tags` from meta

### Step 2: Read Workspace Metadata

Read existing workspace component metadata:
- [ ] `workspace/domains/design-system/metadata/components.json`
- [ ] Any domain-specific component registries
- [ ] Governance rules (deprecation, ownership)

### Step 3: Detect Drift

Compare Storybook inventory against Workspace metadata:

| Drift Type | Meaning | Resolution |
|------------|---------|------------|
| **In Storybook, not in Workspace** | New component not registered | Add to workspace metadata |
| **In Workspace, not in Storybook** | Component exists in metadata but has no story | Flag as undocumented |
| **Hierarchy mismatch** | Story title says "atom" but workspace says "molecule" | Storybook wins (it renders the truth) |
| **Variant mismatch** | Workspace lists 3 variants, Storybook shows 6 | Storybook wins (it renders them) |
| **Missing coverage** | Component has story but no interaction test | Flag for test improvement |

### Step 4: Sync Storybook → Workspace

Update workspace metadata with Storybook-derived data:

- [ ] Add new components discovered in stories
- [ ] Update atomic_level from story title hierarchy
- [ ] Update variant list from story exports
- [ ] Update coverage status (has_story, has_play, has_a11y)
- [ ] Preserve workspace-only fields (owner, domain, deprecation, governance)

### Step 5: Sync Workspace → Storybook (metadata enrichment)

Enrich story files with workspace metadata (where applicable):

- [ ] Add `parameters.docs.description` from workspace component descriptions
- [ ] Add deprecation badges to deprecated components via `tags: ['deprecated']`
- [ ] Update title hierarchy if workspace governance dictates reclassification

**Note:** This direction is lighter — Storybook is the primary source for visual truth,
workspace only contributes governance context.

### Step 6: Generate Drift Report

```markdown
# Storybook ↔ Workspace Drift Report

**Scan Date:** {date}
**Total Components (Storybook):** {N}
**Total Components (Workspace):** {M}
**In Sync:** {sync_count}
**Drifted:** {drift_count}

## New in Storybook (not in Workspace)
| Component | Story Title | Action |
|-----------|-------------|--------|
| InputOTP | Base Components/InputOTP | Added to workspace |

## In Workspace Only (no Story)
| Component | Workspace Status | Action |
|-----------|-----------------|--------|
| LegacyTable | active | NEEDS STORY |

## Hierarchy Mismatches (Storybook wins)
| Component | Storybook | Workspace | Resolved |
|-----------|-----------|-----------|----------|
| SearchBar | molecule | atom | → molecule |

## Coverage Gaps
| Component | Story | Play | A11y | Gallery |
|-----------|-------|------|------|---------|
| Dialog | Yes | No | Yes | No |
| AgentCard | Yes | No | No | No |
```

## Acceptance Criteria

- [ ] **AC-1:** All Storybook components reflected in workspace metadata
- [ ] **AC-2:** All workspace components flagged if missing stories
- [ ] **AC-3:** Hierarchy mismatches resolved (Storybook wins for visual truth)
- [ ] **AC-4:** Drift report generated with actionable items
- [ ] **AC-5:** Workspace-only fields (owner, governance) preserved during sync

## Error Handling

### Workspace Metadata File Missing
- **Trigger:** `components.json` doesnt exist
- **Detection:** File read fails
- **Recovery:** Create initial metadata from Storybook inventory (storybook-to-workspace only)
- **Prevention:** Check file exists in Step 2

### Story Title Doesnt Map to Atomic Level
- **Trigger:** Custom title that doesnt follow Base Components/Components/Features pattern
- **Detection:** Title parsing fails
- **Recovery:** Classify as "unclassified", flag in drift report
- **Prevention:** Document title conventions in storybook-expert

### Circular Ownership Conflict
- **Trigger:** Workspace says component belongs to Squad A, but story is in Squad B directory
- **Detection:** Owner mismatch
- **Recovery:** Flag in drift report, dont auto-resolve (governance decision)
- **Prevention:** Ownership is workspace-only field, never overwritten by sync

## Dependencies

### Depends On (Upstream)
- `sb-generate-all-stories` or `sb-brownfield-migrate` — Stories must exist first

### Required By (Downstream)
- None (utility task, run on-demand or on schedule)

## Related Checklists

- `squads/design/checklists/design-handoff-checklist.md`
- `squads/design/checklists/ds-pattern-audit-checklist.md`

## Handoff

| Attribute | Value |
|-----------|-------|
| **Next Task** | None (utility task) |
| **Trigger** | After story generation or on-demand |
| **Executor** | @storybook-expert |

## Veto Conditions

- Overwriting workspace governance fields (owner, deprecation) with Storybook data
- Deleting workspace entries just because no story exists yet
- Auto-reclassifying atomic level without Storybook rendering evidence
- Running sync before any stories exist (empty Storybook = meaningless sync)

---

_Task Version: 1.0.0_
_Pattern: HO-TP-001 (Task Anatomy Standard)_
_Last Updated: 2026-02-25_
_Compliant: Yes_
